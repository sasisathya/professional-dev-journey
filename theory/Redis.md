# Redis - Professional Interview Guide

> Written for engineers who will be on-call for Redis, not just asked about it in an interview.
> Every section answers: **WHAT** it is, **WHY** it exists, **HOW** it works internally,
> **WHEN** to use it, **WHEN NOT** to, and the **TRADE-OFF** you are accepting.

## Table of Contents
1. [What Redis Actually Is](#what-redis-actually-is)
2. [The Threading Model](#the-threading-model)
3. [O(N) Commands That Will Destroy You](#on-commands-that-will-destroy-you)
4. [Data Structures and Their Internal Encodings](#data-structures-and-their-internal-encodings)
5. [Memory Management, maxmemory and Eviction](#memory-management-maxmemory-and-eviction)
6. [Persistence: RDB, AOF, and the Fork Problem](#persistence-rdb-aof-and-the-fork-problem)
7. [Replication and the Data-Loss Window](#replication-and-the-data-loss-window)
8. [Sentinel vs Cluster](#sentinel-vs-cluster)
9. [Distributed Locking (and Why Redlock Is Contested)](#distributed-locking-and-why-redlock-is-contested)
10. [Caching Patterns and Their Failure Modes](#caching-patterns-and-their-failure-modes)
11. [Pipelining vs Transactions vs Lua](#pipelining-vs-transactions-vs-lua)
12. [Pub/Sub vs Streams](#pubsub-vs-streams)
13. [Rate Limiting in Lua](#rate-limiting-in-lua)
14. [Observability and Capacity Math](#observability-and-capacity-math)
15. [Production War Stories](#production-war-stories)
16. [Common Pitfalls](#common-pitfalls)
17. [Junior vs Senior](#junior-vs-senior)
18. [Interview Questions with Model Answers](#interview-questions-with-model-answers)
19. [Production Checklist](#production-checklist)

---

## What Redis Actually Is

**WHAT:** Redis is a single-threaded, in-memory data structure server. It is *not* a
key-value store in the Memcached sense — the values are typed server-side data structures
(sorted sets, hyperloglogs, streams, bitmaps) with commands that mutate them atomically in
place. That distinction is the entire product.

**WHY it exists:** Before Redis, if you wanted a leaderboard you fetched a list from the
database, sorted it in your application, and wrote it back — with a race between read and
write, and O(N) network transfer for an O(log N) logical operation. Redis moved the data
structure to the server so the operation became one atomic round-trip. `ZINCRBY` is the
whole reason Redis won: it is a compare-and-mutate on a sorted structure that no cache
protocol could express.

**HOW it works at 10,000 feet:**

```
┌───────────────────────────────────────────────────────────────────────┐
│                          redis-server process                         │
│                                                                       │
│  ┌──────────────┐   ┌────────────────────────────────────────────┐    │
│  │  I/O threads │   │        MAIN THREAD (the event loop)        │    │
│  │  (6.0+, opt) │   │                                            │    │
│  │              │   │  aeMain()                                  │    │
│  │  read()  ────┼──▶│    ├─▶ beforeSleep()                       │    │
│  │  parse       │   │    │     ├─ flush AOF buffer               │    │
│  │              │   │    │     ├─ handle expired keys (active)   │    │
│  │  write() ◀───┼───│    │     └─ propagate to replicas          │    │
│  │  encode      │   │    ├─▶ epoll_wait(fds, timeout)            │    │
│  └──────────────┘   │    ├─▶ readQueryFromClient → processCommand│    │
│                     │    │     └─ COMMAND EXECUTION IS SERIAL    │    │
│  ┌──────────────┐   │    └─▶ serverCron() @ 10 Hz (hz config)    │    │
│  │ bio threads  │   │          ├─ expire sampling                │    │
│  │  - lazy free │◀──│          ├─ rehash incremental             │    │
│  │  - fsync     │   │          └─ trigger BGSAVE/BGREWRITEAOF    │    │
│  │  - close fd  │   └────────────────────────────────────────────┘    │
│  └──────────────┘                                                     │
│                                    │ fork() for BGSAVE / AOF rewrite  │
│                                    ▼                                  │
│                          ┌────────────────────┐                       │
│                          │  child process     │                       │
│                          │  (copy-on-write)   │                       │
│                          │  writes dump.rdb   │                       │
│                          └────────────────────┘                       │
└───────────────────────────────────────────────────────────────────────┘
```

**Concrete performance numbers you should be able to quote:**

| Metric | Value on a modern single node |
|---|---|
| GET/SET throughput, pipelined | 500k – 1M ops/sec |
| GET/SET throughput, non-pipelined, single client | ~15k ops/sec (RTT-bound, not Redis-bound) |
| p50 server-side command latency | 50 – 100 µs |
| p99 including network in-DC | 0.3 – 1 ms |
| Latency of `LPUSH` on a 10M-element list | still ~1 µs (O(1)) |
| Latency of `KEYS *` on 10M keys | 1 – 3 **seconds** — everything else blocks |
| Memory overhead per trivial key | ~50–90 bytes before your data |

**WHEN to use Redis:**
- The working set fits in RAM (or you accept eviction of the rest).
- You need sub-millisecond p99 for reads that would otherwise be 5–50 ms DB queries.
- You need a server-side data structure: rate limiter, leaderboard, dedupe set, queue.
- You need cross-process coordination: locks, semaphores, feature-flag fanout.

**WHEN NOT to use Redis:**
- **As your only copy of important data.** Redis's durability story is real but weak
  (see [Persistence](#persistence-rdb-aof-and-the-fork-problem)). `appendfsync everysec`
  means "I accept losing up to 1 second of writes."
- **For large blobs.** A 5 MB value means 5 MB memcpy on the event loop and 5 MB of
  network per read. Put it in S3, cache the URL.
- **For analytical scans.** Redis has no indexes other than the ones you build by hand.
  "Find all users where country=UK" means either a secondary index you maintain manually,
  or a `SCAN` over the keyspace, which is a full table scan.
- **As a durable message queue** when you need replay, consumer lag metrics, and
  multi-day retention. That's Kafka. Redis Streams is genuinely good for hours-scale
  work queues, but it stores in RAM.
- **When the data doesn't fit in RAM.** 1 TB of RAM costs roughly 20–40x what 1 TB of
  NVMe costs. If your dataset is 800 GB and your hot set is 20 GB, you want a disk
  database with a 20 GB cache in front, not an 800 GB Redis.

**TRADE-OFF summary:** You are trading durability and dataset size for latency and
data-structure expressiveness. Anyone who tells you Redis is "a faster database" has not
been paged at 3 a.m. by an OOM-killed instance with `appendonly no`.

---

## The Threading Model

### WHY single-threaded is fast (the counterintuitive part)

The naive assumption is that a single-threaded server must be slower than a
multi-threaded one. For Redis it is not, because **the CPU is not the bottleneck**.
A `GET` is a hash lookup plus a memcpy — tens of nanoseconds. The expensive parts are
the syscalls and the network. So Redis optimizes for:

1. **Zero lock contention.** Every data structure is touched by exactly one thread.
   No mutex, no atomic RMW, no cache-line ping-pong between cores. In a multi-threaded
   store, a hot key's bucket lock becomes the bottleneck at high concurrency; Redis has
   no such lock to contend on.
2. **Zero context switching** in the hot path.
3. **Free atomicity.** Every single command is atomic *by construction*, not by locking.
   `INCR`, `LPOP`, `SETNX`, `ZADD GT` — all atomic for free. This is why Redis is such a
   good coordination primitive.
4. **Predictable, debuggable behavior.** There is one command running at a time, so
   `SLOWLOG` genuinely tells you what stalled the server.

The consequence, which is the whole point: **one slow command stalls every client.**
Redis has no fairness, no preemption, no per-query timeout. If you run a command that
takes 3 seconds, every other client waits 3 seconds. This single fact explains 80% of
Redis production incidents.

### WHAT is actually threaded (Redis 6.0+)

Junior answer: "Redis is single-threaded." Senior answer: "Command execution is
single-threaded; I/O, lazy-free, and fsync are not."

```
Client request lifecycle with io-threads 4:

  socket ──▶ [io-thread-1] read() + protocol parse          ← PARALLEL
                  │
                  ▼
            ┌──────────────────────────────────────┐
            │  MAIN THREAD: execute command        │  ← SERIAL, always
            │  (touches the actual data structures)│
            └──────────────────────────────────────┘
                  │
                  ▼
            [io-thread-2] encode reply + write()             ← PARALLEL
                  │
                  ▼
            [bio-thread] free the 2GB hash you just DEL'd    ← PARALLEL, async
```

**Three separate thread pools, three different purposes:**

| Pool | Config | What it does | When it matters |
|---|---|---|---|
| I/O threads | `io-threads 4`, `io-threads-do-reads yes` | Kernel read/write + RESP parse/encode | > 100k ops/sec, or large values. Below ~50k ops/sec it's pure overhead — leave it at 1. |
| bio (background I/O) | always on | `close()`, `fsync()` on AOF, lazy free | Always. Prevents fsync from blocking the loop. |
| lazy-free | `lazyfree-lazy-*` configs | Reclaims memory of big objects off-thread | Any key with > ~64 elements being deleted or expired |

**Lazy-free is the one most people miss.** `DEL bigkey` on a 5M-element set is O(N)
because Redis must free 5M allocations. That is a **multi-second event-loop stall**.
`UNLINK bigkey` hands the object to a background thread and returns in O(1).

```
❌ WRONG — synchronous free of a huge object blocks everything
  DEL user:sessions:all          # 8M members, ~2.4 s stall, every client times out

✅ CORRECT
  UNLINK user:sessions:all       # returns in ~10 µs, freed on bio thread

✅ BETTER — make it the default so nobody has to remember
  # redis.conf
  lazyfree-lazy-user-del yes     # DEL behaves like UNLINK
  lazyfree-lazy-expire yes       # TTL expiry frees async
  lazyfree-lazy-eviction yes     # maxmemory eviction frees async
  lazyfree-lazy-server-del yes   # implicit deletes (e.g. RENAME over a key) free async
  replica-lazy-flush yes         # full-resync FLUSHALL on replica doesn't stall it
```

**TRADE-OFF:** Lazy-free means memory is not reclaimed the instant `DEL` returns.
Under `maxmemory` pressure with a very high delete rate you can briefly exceed
`maxmemory` while the bio thread catches up. In practice this is a rounding error
compared to a 2-second stall.

**WHEN NOT to enable io-threads:** below ~50k ops/sec. The handoff coordination costs
more than it saves, and you add nondeterminism to latency debugging. Also note
`io-threads` does **not** parallelize command execution — if someone claims "we set
io-threads 8 so our Lua scripts run in parallel," they are wrong.

---

## O(N) Commands That Will Destroy You

**WHY this section exists:** because the event loop is serial, algorithmic complexity is
not an academic concern — it is directly an availability concern. An O(N) command with
N=10,000,000 is an outage.

### The blocklist

| Command | Complexity | The failure |
|---|---|---|
| `KEYS pattern` | O(N) over **entire keyspace** | Scans every key, builds full reply in memory. 40M keys ≈ 5–15 s total freeze. |
| `SMEMBERS bigset` | O(N) | Materializes N members into the output buffer. 5M members ≈ 300 MB reply. |
| `HGETALL bighash` | O(N) | Same. Also blows up client memory. |
| `LRANGE list 0 -1` | O(N) | Same. |
| `ZRANGE z 0 -1` | O(N) | Same. |
| `FLUSHALL` / `FLUSHDB` | O(N) | Frees every object synchronously unless `ASYNC`. |
| `DEL bigkey` | O(N) | Synchronous free. Use `UNLINK`. |
| `SORT` | O(N log N) | On a big list, plus a full copy. |
| `SUNION`/`SINTERSTORE` on huge sets | O(N*M) | Builds the whole result server-side. |
| `SAVE` | O(N), blocking | Blocking snapshot. Never run it. Use `BGSAVE`. |
| `SCRIPT` with a loop over 1M keys | whatever you wrote | Scripts are atomic → uninterruptible. |

### The fix: SCAN and its cursor guarantees

```
❌ WRONG — the classic career-limiting move
  const keys = await redis.keys('session:*');     // 40M keys, 12 second freeze
  for (const k of keys) await redis.del(k);       // and then 40M round trips

✅ CORRECT — bounded work per call, event loop breathes between calls
  let cursor = '0';
  do {
    // COUNT is a *hint* for work per call, not a result-count guarantee
    const [next, keys] = await redis.scan(cursor, 'MATCH', 'session:*', 'COUNT', 500);
    cursor = next;
    if (keys.length) await redis.unlink(...keys);  // UNLINK, batched, not DEL one-by-one
  } while (cursor !== '0');
```

**HOW SCAN works internally (the part interviewers probe):** SCAN uses a reverse-binary
increment cursor over the hash table buckets. This gives it a specific, unusual guarantee:

- **Guaranteed:** every element present for the entire iteration is returned at least once.
- **Guaranteed:** SCAN terminates even if the table is rehashed mid-iteration (this is
  why the cursor is reverse-binary — it makes the bucket order stable across resizes).
- **NOT guaranteed:** no duplicates. You *will* see the same key twice. Your code must be
  idempotent.
- **NOT guaranteed:** elements added or removed during iteration may or may not appear.
- **NOT guaranteed:** `COUNT 500` returns 500 elements. It may return 0 (all scanned
  buckets were empty) and a non-zero cursor. **A returned empty array does not mean you
  are done — only `cursor === '0'` means done.** This is the #1 SCAN bug.

Type-specific variants for large collections: `SSCAN`, `HSCAN`, `ZSCAN`.

```
❌ WRONG — breaks on empty batch, leaves 90% of keys behind
  while (keys.length > 0) { ... }

✅ CORRECT
  do { ... } while (cursor !== '0');
```

**Guardrails you should ship, not just know:**

```conf
# redis.conf — make the footgun unavailable in production
rename-command KEYS     ""
rename-command FLUSHALL ""
rename-command FLUSHDB  ""
rename-command CONFIG   "CONFIG_9f2b1c"   # ops still needs it; humans don't guess it

# Log anything over 10ms — on a server with 100µs p50, 10ms is catastrophic
slowlog-log-slower-than 10000     # microseconds
slowlog-max-len 512

# Kill clients whose output buffer explodes (i.e. someone ran SMEMBERS on a huge set)
client-output-buffer-limit normal 256mb 128mb 60
```

`maxmemory-clients` (Redis 7+) additionally caps total client buffer memory, which is what
saves you when 200 clients each request a 100 MB reply simultaneously.

---

## Data Structures and Their Internal Encodings

**WHY encodings exist:** a generic linked list with pointers costs ~50–80 bytes of
overhead per element. For a hash with 5 fields, that overhead dwarfs the data. So Redis
stores small collections in a **compact, cache-friendly, serialized byte array** and only
"upgrades" to the pointer-based structure when the collection grows. This is one of the
biggest memory levers you have — and it's silent, so people miss it.

```
                     ENCODING TRANSITIONS (one-way — never converts back)

  HASH ──┬── listpack ──────────────┬──▶ hashtable
         │  (contiguous bytes)      │    (dict + robj per field/value)
         │  ~1 pointer of overhead  │    ~90 bytes overhead per field
         └── flips when: fields > hash-max-listpack-entries (128)
                      OR any value length > hash-max-listpack-value (64)

  ZSET ──┬── listpack ──────────────┬──▶ skiplist + dict
         │  O(N) ops but N is tiny  │    O(log N) ops, ~150 B/element
         └── flips when: entries > zset-max-listpack-entries (128)
                      OR value length > zset-max-listpack-value (64)

  SET ───┬── intset (all integers, sorted array, binary search)
         ├── listpack (small, non-integer)      ← Redis 7.2+
         └── hashtable
             flips when: > set-max-intset-entries (512)
                      OR > set-max-listpack-entries (128)
                      OR a non-integer member is added to an intset

  LIST ──┬── listpack (small)
         └── quicklist = linked list OF listpacks
             each node holds list-max-listpack-size (128) entries,
             optionally LZF-compressed via list-compress-depth
```

**The number that makes this concrete.** Storing 1,000,000 user records with 5 small
fields each:

| Layout | Memory | Why |
|---|---|---|
| 5M separate string keys (`user:1:name`, ...) | ~450 MB | ~90 B overhead × 5M |
| 1M hashes, 5 fields, **listpack** encoded | ~110 MB | one allocation per hash |
| 1M hashes, but `hash-max-listpack-entries 0` (forced hashtable) | ~600 MB | dict + robj per field |
| 1M hashes bucketed 100-per-hash (`user:bucket:{id/100}`) | ~55 MB | fewer top-level keys |

**5x memory difference from a config value nobody looked at.** This is the single most
common "our Redis bill tripled" root cause.

```bash
# Always verify — don't assume
127.0.0.1:6379> OBJECT ENCODING user:1000
"listpack"
127.0.0.1:6379> HSET user:1000 bio "<a 200 character bio>"
127.0.0.1:6379> OBJECT ENCODING user:1000
"hashtable"          # ← one long value converted the WHOLE hash, permanently
127.0.0.1:6379> MEMORY USAGE user:1000
(integer) 612        # was 118
```

**TRADE-OFF of raising the thresholds:** listpack operations are O(N) with a
memcpy-on-insert. At 128 entries that's irrelevant (it fits in L1/L2 cache and is faster
than pointer chasing). At 5,000 entries, every `HSET` memmoves kilobytes and every
`HGET` linear-scans. Raising `hash-max-listpack-entries` to 1000 is usually safe and
saves real money; raising it to 10000 turns O(1) operations into measurable CPU.

### The structures, with the decision criteria

**Strings** — binary safe, max 512 MB. The workhorse.
- Use for: serialized objects, counters (`INCR` is atomic and O(1)), distributed locks,
  bitmaps.
- **WHEN NOT:** don't store a 2 MB JSON blob and then `GET` it 10k/sec — that's 20 GB/s
  of memcpy and network. Store fields in a hash and fetch what you need with `HMGET`.
- `APPEND` amortizes but reallocates; a string built by repeated `APPEND` can hold 2x its
  logical size. `MEMORY USAGE` reveals this.

**Hashes** — field-value maps.
- Use for: objects where you read/update individual fields; `HINCRBY` for per-field counters.
- **The bucketing trick:** if you have 50M tiny keys, the *key overhead* dominates. Shard
  them into hashes: `HSET user:bucket:{floor(id/1000)} {id} {value}`. You trade a wider
  read for a 5–10x memory reduction. Twitter and Instagram both published on this.
- **WHEN NOT:** you cannot set a TTL on an individual hash field before Redis 7.4
  (`HEXPIRE`). Pre-7.4, per-field expiry means separate keys.

**Lists** — quicklist of listpacks.
- Use for: capped activity feeds (`LPUSH` + `LTRIM 0 999` — O(1) amortized, bounded memory),
  simple work queues via `BRPOPLPUSH`/`LMOVE`.
- **WHEN NOT:** as a durable queue. `BRPOP` removes the item; if the worker dies, the
  message is gone. Use `LMOVE source processing LEFT RIGHT` (reliable queue pattern) or
  Streams with consumer groups.
- `LINDEX`/`LINSERT` are O(N). A list is not an array.

**Sets** — unordered unique members.
- Use for: tag membership, dedupe, "have I seen this user today", `SINTERCARD` for
  cheap overlap counts.
- **WHEN NOT:** `SMEMBERS` on anything you cannot bound. Use `SSCAN` or `SRANDMEMBER n`.
- `intset` encoding is remarkable: 512 integers in a sorted array is ~4 KB and binary
  searched. Adding one string member converts it and can 10x the memory.

**Sorted sets** — skiplist + hash table (two structures, one logical object).
- The hash gives O(1) `ZSCORE`; the skiplist gives O(log N) rank/range queries.
- Use for: leaderboards, priority queues, sliding-window rate limiters (score = timestamp),
  secondary indexes (score = numeric attribute), delayed jobs (score = run-at epoch,
  `ZRANGEBYSCORE -inf now`).
- **WHEN NOT:** as a general-purpose sorted index over millions of items you range-scan
  constantly — ~150 bytes/element adds up and there's no disk spill.
- `ZADD GT`/`LT`/`NX`/`XX` modifiers let you do conditional updates atomically — most
  people write a Lua script for what a `ZADD GT` already does.

**Bitmaps** — bit operations on strings.
- 1M users' daily-active flags = 125 KB. `BITCOUNT` for DAU, `BITOP AND` across 30 keys
  for 30-day retention cohorts.
- **Sizing trap:** `SETBIT key 4000000000 1` allocates 500 MB instantly. Bitmaps are
  dense; if your IDs are sparse UUIDs, a bitmap is a disaster. Use it only with dense,
  small integer IDs.

**HyperLogLog** — 12 KB fixed, ~0.81% standard error, counts cardinality up to 2^64.
- Use for: unique visitors, unique search terms — anywhere "about 4.2 million" is fine
  and "exactly 4,213,887" is not required.
- **WHEN NOT:** billing, compliance, anything audited. It's an estimate. Also `PFCOUNT`
  on a single key is cheap but `PFCOUNT k1 k2 k3` (union) is meaningfully more expensive.

**Streams** — see [Pub/Sub vs Streams](#pubsub-vs-streams).

**Geospatial** — a sorted set with a 52-bit geohash as the score. Knowing that is the
interview answer: `GEOADD` is `ZADD` with an encoded score, so all `Z*` commands work on
a geo key, and `GEOSEARCH` is a set of range queries over neighboring geohash boxes.

---

## Memory Management, maxmemory and Eviction

### WHY you must set maxmemory

**If `maxmemory` is 0 (the default), Redis will happily allocate until the Linux OOM
killer sends SIGKILL.** Not SIGTERM — SIGKILL. No shutdown hook, no final RDB save, no
graceful failover signal. The process vanishes and, if you were relying on RDB, you lose
everything since the last snapshot.

**The sizing formula that keeps you alive:**

```
  maxmemory = (container/instance RAM) × 0.55  ... if you fork for RDB/AOF rewrite
  maxmemory = (container/instance RAM) × 0.75  ... if persistence is fully disabled

  Why 0.55 and not 0.90:
    ├─ COW during BGSAVE can add up to 100% of dataset size (worst case)
    ├─ replication backlog buffer          (repl-backlog-size, default 1 MB, set 128 MB+)
    ├─ client output buffers               (replicas + slow consumers + pubsub)
    ├─ AOF rewrite buffer                  (writes accumulated during rewrite)
    └─ allocator fragmentation             (jemalloc, typically 1.1–1.5x)
```

Concretely: a 16 GB instance should run `maxmemory 8gb` if it takes RDB snapshots. Setting
`maxmemory 14gb` on a 16 GB box is the most common cause of Redis OOM kills, and it is
always discovered during the incident, never before.

### The eviction decision

```
                    Write command arrives
                             │
                             ▼
              ┌──────────────────────────────┐
              │ used_memory > maxmemory ?    │
              └──────────────┬───────────────┘
                       no ───┴─── yes
                       │           │
                       ▼           ▼
                   execute   ┌───────────────────────────────────┐
                             │ maxmemory-policy                  │
                             └──┬────────────────────────────────┘
                                │
      ┌─────────────────────────┼──────────────────────────┐
      ▼                         ▼                          ▼
 noeviction              volatile-*                    allkeys-*
      │                         │                          │
      ▼                         ▼                          ▼
 return OOM error        sample keys WITH TTL        sample ANY key
 to the client           only; if none have a        (maxmemory-samples,
 (reads still work)      TTL → OOM error!            default 5), evict
                                                     best candidate,
                                                     repeat until under
```

### All 8 policies, and when each is correct

| Policy | Evicts | Use when | Never use when |
|---|---|---|---|
| `noeviction` | nothing; writes fail with OOM | Redis is your **datastore** (queues, locks, sessions you cannot lose). Failing loudly beats silently deleting a lock. | Pure cache — you'll take an outage instead of a cache miss. |
| `allkeys-lru` | approximated LRU over all keys | **Default choice for a pure cache.** Recency is the best generic predictor. | Any key holds data you cannot regenerate. |
| `allkeys-lfu` | approximated LFU (frequency, with decay) | Cache with a **stable hot set** and periodic scans. A nightly analytics job doing a full scan will flush an LRU cache; LFU survives it. | Access patterns shift hourly — LFU is slow to forget. |
| `allkeys-random` | uniformly random key | Genuinely uniform access, or you need eviction to be O(1) with zero sampling cost. Rare. | Almost always — LRU is nearly free and much better. |
| `volatile-lru` | LRU **among keys with a TTL** | Mixed workload: cache entries have TTLs, session/lock keys don't. Protects the untl'd keys. | Most keys lack TTLs → OOM error even with GBs of evictable-looking data. |
| `volatile-lfu` | LFU among TTL'd keys | Same as above with a stable hot set. | Same trap as volatile-lru. |
| `volatile-random` | random among TTL'd keys | Rare. | Same trap. |
| `volatile-ttl` | key with the **shortest remaining TTL** | You've encoded value-as-TTL (short TTL = less important). | You set uniform TTLs — degenerates to random with extra cost. |

**The `volatile-*` trap, spelled out:** you set `volatile-lru`, assume you're safe, and
then 90% of your keys are written without a TTL. Redis hits `maxmemory`, samples for
TTL'd keys, finds almost none, and starts returning
`OOM command not allowed when used memory > 'maxmemory'` on every write — while `INFO`
shows gigabytes of data. Your cache is now a write-outage. If you choose `volatile-*`,
you must have a lint rule or a wrapper that refuses `SET` without `EX`.

**"Approximated" LRU/LFU — the honest detail:** Redis does not maintain a global LRU list
(that would cost 16 bytes/key in pointers and touch memory on every read). It samples
`maxmemory-samples` random keys (default 5) and evicts the best candidate from that
sample. `maxmemory-samples 10` gets you very close to true LRU at ~2x the eviction CPU.
Redis 3.0+ also keeps a small pool of good candidates across samples. Know this; it's a
standard follow-up question.

LFU is not a raw counter — it's a **logarithmic** probabilistic counter (8 bits) with a
decay controlled by `lfu-decay-time` (minutes) and growth by `lfu-log-factor`. Without
decay, a key that was hot last Tuesday would be immortal.

### Fragmentation

```
  mem_fragmentation_ratio = used_memory_rss / used_memory

  < 1.0   → Redis is SWAPPING. Emergency. Latency will be 1000x. Fix or fail over now.
  1.0–1.5 → healthy (jemalloc overhead)
  > 1.5   → real fragmentation: freed memory the allocator can't return to the OS
```

Fragmentation is caused by variable-sized allocations — writing 100 M keys, deleting half,
and writing different-sized values leaves jemalloc holding size-class runs it can't merge.

```conf
# Active defrag — jemalloc-only, moves allocations to compact runs. Costs CPU.
activedefrag yes
active-defrag-ignore-bytes 200mb        # don't bother below this
active-defrag-threshold-lower 10        # start at 10% fragmentation
active-defrag-threshold-upper 100
active-defrag-cycle-min 5               # % CPU floor
active-defrag-cycle-max 25              # % CPU ceiling — this WILL add latency
```

**WHEN NOT to enable activedefrag:** if you're latency-critical at p99 and fragmentation
is 1.4, leave it alone. Defrag work happens on the main thread's cron. The cheapest
"defrag" is a failover to a fresh replica, which starts with a compact heap.

**Also, always:** `vm.overcommit_memory = 1` and disable transparent huge pages
(`never`). THP causes 2 MB copy-on-write faults instead of 4 KB ones during BGSAVE — this
single setting has caused more mysterious Redis latency spikes than any other, and Redis
logs a warning about it at startup that everyone ignores.

---

## Persistence: RDB, AOF, and the Fork Problem

### The fork + copy-on-write mechanism (this is the interview question)

```
   T0: Redis has 12 GB dataset, host has 16 GB RAM
   ┌──────────────────────────────────────────────┐
   │  parent (redis-server)     RSS = 12 GB       │
   │  page table ──▶ [physical pages: 12 GB]      │
   └──────────────────────────────────────────────┘

   T1: BGSAVE → fork()
   ┌───────────────────────┐   ┌───────────────────────┐
   │ parent  RSS = 12 GB   │   │ child   RSS ≈ 0       │
   │ page table ───┐       │   │ page table ───┐       │
   └───────────────┼───────┘   └───────────────┼───────┘
                   ▼                           ▼
              [SHARED physical pages, 12 GB, all marked READ-ONLY]
   fork() itself is fast (~10–100 ms for 12 GB — it copies page tables, not pages).

   T2: parent serves writes. Every write to a shared page triggers a COW page fault:
       kernel copies that 4 KB page so the parent can modify its private copy.

   ┌───────────────────────┐   ┌───────────────────────┐
   │ parent RSS = 12 + X   │   │ child  RSS = 12 (view)│
   └───────────────────────┘   └───────────────────────┘
              ▲
              └── X grows with the WRITE RATE × SNAPSHOT DURATION
                  Worst case (writes touch every page): X = 12 GB → total 24 GB
                  ────────────────────────────────────────────────────────────
                  Host has 16 GB. Linux OOM killer picks the largest RSS process.
                  That's Redis. SIGKILL. Dataset gone.
```

**Key insight most candidates miss:** COW granularity is a **page (4 KB)**, not a key.
Writing one 8-byte counter dirties a whole 4 KB page. If your writes are spread randomly
across the heap — which they are — you dirty far more memory than you write. A workload
writing 50 MB/s during a 90-second snapshot can easily dirty 4–8 GB, not 4.5 GB.

**With transparent huge pages enabled, the granularity is 2 MB.** Writing one counter
copies 2 MB. This is why THP must be `never`.

**Mitigations, in order of effectiveness:**
1. `maxmemory` ≤ 55% of RAM.
2. THP off, `vm.overcommit_memory=1` (without it, `fork()` itself fails with ENOMEM even
   though COW means the memory will never actually be used).
3. **Take snapshots on a replica, not the primary.** The replica has near-zero write
   amplification from clients — it only applies the replication stream. This is the
   standard production answer.
4. Reduce snapshot frequency; `save ""` on the primary entirely.

### RDB

**WHAT:** a compressed point-in-time binary snapshot of the whole dataset.

```conf
save 900 1        # ≥1 key changed in 900 s
save 300 10
save 60 10000
# save ""         # disable entirely (do this on the primary if a replica snapshots)
rdbcompression yes
rdbchecksum yes
stop-writes-on-bgsave-error yes   # LEAVE THIS ON. Otherwise you silently stop persisting.
```

**Durability guarantee:** "everything up to the last successful snapshot." With
`save 900 1`, a crash can lose **15 minutes** of writes. Say that out loud once and most
teams change their configuration.

**Pros:** compact (often 3–10x smaller than AOF); fastest restart (bulk load, no command
replay); trivially copyable for backups; the format used for replica full-sync.
**Cons:** unbounded data loss window; fork spike; on a 50 GB dataset the fork alone can
pause the parent for 1–2 s on some hypervisors (EC2 with older instance types is
notorious — check `latest_fork_usec` in `INFO stats`).

### AOF

**WHAT:** an append-only log of every write command in RESP format, replayed on restart.

```
  Write path with appendfsync everysec:

  client ──▶ command executes ──▶ appended to aof_buf (in-memory)
                                          │
                                          ▼  beforeSleep(), every event loop iteration
                                    write(2) to page cache      ← data leaves Redis
                                          │
                                          ▼  bio thread, ~1 Hz
                                    fsync(2) to disk            ← data survives power loss
                                          │
                     ┌────────────────────┴─────────────────────┐
                     │  Window of loss = up to 1 second         │
                     │  (2 seconds worst case, if a prior fsync │
                     │   is still in flight when the next fires)│
                     └──────────────────────────────────────────┘
```

| `appendfsync` | Guarantee on **power loss** | Guarantee on **redis process crash** | Cost |
|---|---|---|---|
| `always` | 0 writes lost (fsync before replying) | 0 lost | ~1–3k writes/sec ceiling on spinning/EBS; ~20–50k on good NVMe. 10–100x throughput drop. |
| `everysec` | up to 1–2 s lost | **0 lost** — data is already in the OS page cache | ~5% overhead. The default for a reason. |
| `no` | up to 30 s lost (kernel's dirty writeback interval) | 0 lost | free |

**The nuance that separates seniors:** `everysec` loses nothing if only *Redis* crashes,
because `write()` already handed the bytes to the kernel. You only lose the window on
kernel panic / power loss / instance termination. Cloud instance termination counts.

**AOF rewrite (compaction):** the log grows forever — `INCR counter` a million times is a
million commands rebuilding one integer. `BGREWRITEAOF` forks a child that writes a
*minimal* command set representing the current dataset, while the parent buffers new
writes in `aof_rewrite_buf` and appends them at the end.

```conf
auto-aof-rewrite-percentage 100   # rewrite when AOF is 2x its post-rewrite size
auto-aof-rewrite-min-size 64mb
aof-use-rdb-preamble yes          # 4.0+: rewrite emits RDB body + AOF tail. Big win.
```

`aof-use-rdb-preamble yes` gives you RDB's compact format and fast load *plus* AOF's
1-second durability. There is essentially no reason to turn it off. Redis 7 further
splits AOF into a multi-part manifest (base + incr files) so rewrites don't need a
second full copy of the AOF on disk.

**Note the second fork.** AOF rewrite forks too, with the same COW risk as BGSAVE. If
BGSAVE and BGREWRITEAOF overlap you have two children — Redis avoids this itself, but
your monitoring should still alert on `rdb_bgsave_in_progress` + memory.

### The recommendation

**Run both, on a replica, and understand that neither makes Redis a system of record.**

| Workload | Config |
|---|---|
| Pure cache, regenerable | `save ""`, `appendonly no`. Persistence buys nothing but fork risk. A cold cache is a capacity problem, not a data-loss problem — but plan for the thundering herd on restart. |
| Session store | `appendonly yes`, `everysec`. Losing 1 s of sessions logs out a few users; losing 15 min logs out everyone. |
| Queue / locks / rate limits | `appendonly yes`, `everysec`, `noeviction`, replicas + Sentinel. Consider whether the queue should be Kafka/SQS. |
| System of record | Don't. If you must: `appendfsync always`, replicas, `WAIT`, and accept the throughput ceiling. Even then Redis's replication is async — see next section. |

---

## Replication and the Data-Loss Window

### HOW it works

```
  ┌──────────┐                                        ┌──────────┐
  │ PRIMARY  │                                        │ REPLICA  │
  └────┬─────┘                                        └────┬─────┘
       │                                 REPLICAOF host port │
       │  ◀─────────── PSYNC <replid> <offset> ──────────────┤
       │                                                     │
       │  Case A: partial resync possible                    │
       │  (replid matches AND offset still in backlog)       │
       ├──── +CONTINUE, then stream from offset ───────────▶ │
       │                                                     │
       │  Case B: full resync                                │
       ├──── +FULLRESYNC <replid> <offset>                   │
       ├──── fork() → RDB → send file (or diskless) ───────▶ │  FLUSHALL, load RDB
       ├──── buffered writes since fork ────────────────────▶│
       │                                                     │
       │  Steady state:                                      │
       ├──── every write, async, fire-and-forget ───────────▶│  apply
       │     ▲                                               │
       │     └── PRIMARY DOES NOT WAIT. It already replied   │
       │         "+OK" to the client BEFORE this send.       │
       │                                                     │
       │  ◀──── REPLCONF ACK <offset>, every 1 s ────────────┤
```

**The consequence — say this exactly in an interview:**

> Redis replication is asynchronous. The primary acknowledges a write to the client
> before the replica has seen it. If the primary dies in that window and a replica is
> promoted, **acknowledged writes are silently lost**. This is not a bug or a
> misconfiguration; it is the design. Redis chooses AP over CP.

The window is normally sub-millisecond in-DC, but it becomes seconds under load, during
a fork, or across regions. During a full resync it is the entire resync duration.

### `WAIT` — narrowing, not closing, the window

```
SET order:9931 '{"status":"paid"}'
WAIT 1 100      # block until ≥1 replica ACKs, or 100 ms elapses
                # returns the NUMBER of replicas that ACKed
```

```
❌ WRONG — treating WAIT as a guarantee
  await redis.set(key, val);
  await redis.wait(1, 100);       // return value ignored!
  // WAIT returns 0 on timeout. You just did a nothing-burger and felt safe.

✅ CORRECT
  await redis.set(key, val);
  const acked = await redis.wait(1, 100);
  if (acked < 1) {
    // Replication did not confirm. Treat as a durability failure:
    // fail the request, or write to the durable system of record too.
    throw new ReplicationNotConfirmedError();
  }
```

**What `WAIT` is NOT:** it is not a transaction, not two-phase commit, and it does not
roll anything back. If it returns 0, the write is still on the primary — you just don't
know whether it will survive a failover. Redis 7 adds `WAITAOF numlocal numreplicas
timeout`, which additionally waits for local and/or replica **fsync** — that's the one to
reach for when you actually care about power loss.

### Replica read staleness

```conf
replica-read-only yes             # never turn this off; writes to a replica are silently
                                  # discarded on the next resync
replica-serve-stale-data yes      # serve possibly-stale data when the link is down
                                  # set 'no' to return -MASTERDOWN instead
min-replicas-to-write 1           # primary REFUSES writes if fewer than N replicas
min-replicas-max-lag 10           # ...have ACKed within 10 s. Trades availability for
                                  # a smaller loss window. This is your CP-ish dial.
```

**WHEN to read from replicas:** analytics, dashboards, recommendation reads, anything
where 50–500 ms of staleness is fine.
**WHEN NOT:** read-after-write. A user updates their profile, the app reads from a
replica, and shows the old value. Classic bug. Fix by routing reads to the primary for
N seconds after that user's write (a "read-your-writes" token), not by hoping lag is low.

`INFO replication` → `master_repl_offset` on the primary minus `slave_repl_offset` on
the replica gives you lag **in bytes**, which is the metric to alert on. `master_link_status:down`
plus a rising `master_last_io_seconds_ago` is a partial-resync-about-to-become-full-resync.

**Sizing the backlog:** `repl-backlog-size` (default 1 MB) is the circular buffer that
allows partial resync. If a replica disconnects for longer than
`backlog_size / write_bytes_per_sec`, it must do a **full resync** — which means a fork
on the primary, a full RDB transfer, and a memory spike, all triggered by a 3-second
network blip. At 10 MB/s of writes, a 1 MB backlog covers 0.1 seconds. Set it to
128 MB–512 MB. This is the cheapest availability win in Redis, and almost nobody does it.

---

## Sentinel vs Cluster

### The decision

```
  Does your dataset fit comfortably in ONE node's RAM (say < 50 GB),
  and is single-node throughput (500k+ ops/s) enough?
                    │
        ┌───── yes ─┴─ no ─────┐
        ▼                      ▼
   SENTINEL                 CLUSTER
   ────────                 ───────
   • single logical DB      • 16384 hash slots sharded across masters
   • all commands work      • no cross-slot multi-key ops
   • MULTI, Lua across      • MULTI/Lua only within one slot
     any keys               • clients must be cluster-aware
   • simple ops             • resharding is an operation, not a config change
   • HA only, no scale      • HA + horizontal scale
```

Most teams that "need Cluster" actually need a bigger instance and better key design.
Cluster's operational cost is real: cluster-aware clients, hash tags everywhere, no
cross-shard transactions, and resharding under load. Reach for it when you genuinely
exceed one node.

### Sentinel

**WHAT:** a separate set of processes that monitor the primary, agree it's down, elect a
leader among themselves, promote a replica, and reconfigure the others.

```
  ┌───────────┐   ┌───────────┐   ┌───────────┐
  │Sentinel A │   │Sentinel B │   │Sentinel C │   ← must be ODD and ≥ 3, in ≥ 3 failure
  └─────┬─────┘   └─────┬─────┘   └─────┬─────┘     domains (AZs)
        └───────┬───────┴───────┬───────┘
                ▼               ▼
          ┌──────────┐    ┌──────────┐
          │ PRIMARY  │───▶│ REPLICA  │
          └──────────┘    └──────────┘

  Failure detection:
   1. Sentinel A misses PINGs for down-after-milliseconds  → marks SDOWN (subjective)
   2. A asks B and C: "do you also see it down?"
   3. If ≥ quorum agree                                    → ODOWN (objective)
   4. Sentinels elect a leader by RAFT-ish majority
      ── NOTE: election needs majority of ALL sentinels, NOT just the quorum ──
   5. Leader picks best replica: lowest replica-priority, then highest repl offset,
      then lowest runid
   6. REPLICAOF NO ONE on the winner; others REPLICAOF <new primary>
   7. Clients discover via SENTINEL get-master-addr-by-name (+ pubsub notification)
```

**The quorum-vs-majority distinction is the classic follow-up.** `quorum` decides when to
*declare* the master down. Actually *performing* the failover requires a majority of the
full Sentinel set. With 3 Sentinels and `quorum 2`: if 2 Sentinels are in an AZ that goes
dark, the surviving 1 can never reach majority, and no failover happens. That's why you
put Sentinels in three separate AZs — and why 2 Sentinels is worse than useless.

**Split-brain in Sentinel:** the old primary is partitioned but alive and still accepting
writes from clients that haven't re-resolved. A replica is promoted. Now two primaries
accept writes. When the partition heals, the old primary is demoted to replica and
**FLUSHes its data to full-resync from the new primary — those writes are gone.**
Mitigation: `min-replicas-to-write 1` + `min-replicas-max-lag 10` on every node, so the
isolated primary stops accepting writes ~10 s into the partition.

### Cluster

**HOW slot mapping works:**

```
  slot = CRC16(key) mod 16384          ← 16384, because a 16k bitmap fits in 2 KB
                                          in every cluster bus heartbeat message

  ┌──────────────────────────────────────────────────────────────────┐
  │  Node A: slots 0–5460      Node B: 5461–10922   Node C: 10923–16383│
  │     │                          │                     │            │
  │  replica A'                 replica B'            replica C'      │
  └──────────────────────────────────────────────────────────────────┘

  Client sends GET foo to node B:
      slot(foo) = 12182  → owned by C
      B replies:  -MOVED 12182 10.0.0.3:6379
      Smart client updates its slot→node map and retries against C.
      (A dumb client that doesn't follow MOVED will ping-pong forever.)

  During resharding, slot 12182 is migrating C → A:
      key already moved:  C replies -ASK 12182 10.0.0.1:6379
      client sends ASKING then the command to A  (ONE-TIME redirect —
      the client must NOT update its slot map, because the migration
      isn't finished)
```

**MOVED vs ASK — this is the question.** MOVED is permanent ("this slot now lives
there, update your map"). ASK is temporary ("this *specific key* has already migrated;
ask over there just this once, and don't cache it"). Getting this wrong means either a
stale map or a map that thrashes during every reshard.

**Multi-key operations and hash tags:**

```
❌ WRONG — CROSSSLOT error, and it's a runtime error, not a startup one
  MGET user:1:name user:1:email
  (error) CROSSSLOT Keys in request don't hash to the same slot

✅ CORRECT — hash tag: only the substring inside {} is hashed
  MGET {user:1}:name {user:1}:email        # both → slot(CRC16("user:1"))

  MULTI / Lua scripts have the SAME restriction: every key must be in one slot.
```

**TRADE-OFF of hash tags:** they are also how you create a hot shard. If you tag by
`{tenant_id}` and one tenant is 60% of traffic, that entire tenant lands on one node and
you cannot shard your way out. Tag at the smallest granularity that satisfies your
multi-key needs — `{user:1}`, not `{tenant:acme}`.

**Cluster split-brain and `cluster-node-timeout`:** a minority partition's masters stop
serving after `cluster-node-timeout` (they can't reach a majority of masters, so they
enter fail state). The majority side promotes replicas. Writes accepted by the minority
master in the `cluster-node-timeout` window before it noticed are lost.
`cluster-require-full-coverage yes` (default) makes the *whole cluster* refuse writes if
any slot is uncovered — safer, but converts a partial outage into a total one. Most
production caches set it to `no`; most production datastores leave it `yes`. Know that
you're choosing.

**Resharding** is `CLUSTER SETSLOT ... MIGRATING/IMPORTING` plus `MIGRATE` per key.
`MIGRATE` is a **synchronous, blocking** command on both source and destination for the
key being moved — migrating a 500 MB key blocks both nodes for the duration. Big keys
make resharding dangerous, which is another reason to bound your collection sizes.

---

## Distributed Locking (and Why Redlock Is Contested)

### The single-instance lock, done correctly

```javascript
// ❌ WRONG #1 — not atomic. Two clients can both acquire.
if (!(await redis.get(key))) { await redis.set(key, '1'); }

// ❌ WRONG #2 — atomic acquire, but no TTL. Holder crashes → lock held forever.
await redis.set(key, '1', 'NX');

// ❌ WRONG #3 — TTL present, but release is `DEL`. THIS IS THE DOUBLE-CHARGE BUG.
await redis.set(key, '1', 'NX', 'PX', 30000);
try { await chargeCard(); } finally { await redis.del(key); }
//                                            ▲
//   If chargeCard() took 31 s, the lock ALREADY EXPIRED and client B acquired it.
//   Your DEL now deletes B's lock. C acquires. B and C both charge. Two customers,
//   or worse, one customer twice.

// ✅ CORRECT — unique fencing token + compare-and-delete via Lua (atomic)
const token = crypto.randomUUID();
const acquired = await redis.set(key, token, 'NX', 'PX', 30000);
if (acquired !== 'OK') throw new LockNotAcquired();

const RELEASE = `
  if redis.call("GET", KEYS[1]) == ARGV[1] then
    return redis.call("DEL", KEYS[1])
  else
    return 0
  end`;

try {
  await doWork();
} finally {
  const released = await redis.eval(RELEASE, 1, key, token);
  if (released === 0) {
    // We did NOT hold the lock at release time. Our work may have raced.
    // ALERT ON THIS. It is the early-warning signal for the double-charge bug.
    metrics.increment('lock.lost_before_release');
  }
}
```

**WHY `GET` then `DEL` in two round trips is still wrong:** between the GET and the DEL,
the lock can expire and be re-acquired. Only the Lua script — which runs atomically on the
single-threaded server — closes that window.

### Lock extension (the watchdog)

If work can exceed the TTL, either make the TTL generously larger than p99.9 work
duration, or renew it:

```javascript
const EXTEND = `
  if redis.call("GET", KEYS[1]) == ARGV[1] then
    return redis.call("PEXPIRE", KEYS[1], ARGV[2])
  else return 0 end`;

// Renew at TTL/3. If a renewal returns 0, you have LOST the lock — abort the work.
const hb = setInterval(async () => {
  if (await redis.eval(EXTEND, 1, key, token, 30000) === 0) {
    clearInterval(hb);
    abortController.abort();      // stop working IMMEDIATELY. Do not "finish up."
  }
}, 10000);
```

Redisson and node-redlock do this for you. Rolling your own without the abort path is
worse than not renewing at all — you get an infinite lease on a lock you don't hold.

### Redlock and the Kleppmann critique

**WHAT Redlock is:** acquire the same lock on N independent Redis primaries (typically 5);
if you get it on a majority within a small fraction of the TTL, you hold the lock.

**WHY it's contested — you must be able to state both sides:**

Martin Kleppmann's argument (2016), and Salvatore Sanfilippo's response, boil down to:

1. **Redlock's safety depends on bounded clock drift and bounded pauses.** A GC pause, a
   VM live-migration, a page fault storm, or an NTP step can make a client believe it
   holds a lock long after the TTL expired on the servers. No amount of quorum fixes this
   — it's a client-side liveness assumption used to make a safety claim.
2. **Without a fencing token, no lock is safe for correctness.** The right pattern is a
   monotonically increasing token issued with the lock; the *protected resource* rejects
   any write with a token lower than the highest it has seen. If your database can't
   enforce fencing, your lock cannot guarantee mutual exclusion regardless of the
   algorithm.
3. Antirez's counter: Redlock is fine for efficiency (avoiding duplicate work) and its
   assumptions are no stronger than many accepted systems; use a consensus system if you
   need correctness.

**The senior position to state in an interview:**

> "Redis locks are excellent for *efficiency* — preventing two workers from doing the
> same expensive job. They are not sufficient for *correctness* — preventing two workers
> from both charging a card — because a client can be paused past the lease. If the
> consequence of a violation is money or data corruption, I put the guarantee in the
> resource: a unique idempotency key with a unique constraint in Postgres, a conditional
> write in DynamoDB, or a fencing token the resource enforces. I'd use ZooKeeper/etcd if
> I needed a real consensus lock. And in practice I'd rather make the operation idempotent
> than make the lock perfect."

**WHEN Redlock is not worth it:** if you have one Redis with a replica, Redlock across
5 instances adds 5x the network calls and operational surface for a guarantee that still
isn't a correctness guarantee. Single-instance SET NX PX + Lua release + idempotency at
the resource covers the vast majority of real needs.

---

## Caching Patterns and Their Failure Modes

### Cache-aside (lazy loading) — the default

```javascript
async function getUser(id) {
  const key = `user:${id}`;
  const hit = await redis.get(key);
  if (hit !== null) return JSON.parse(hit);

  const user = await db.query('SELECT * FROM users WHERE id=$1', [id]);
  // Jittered TTL — see cache stampede below. NEVER a constant TTL for a bulk-loaded set.
  await redis.set(key, JSON.stringify(user), 'EX', 3600 + Math.floor(Math.random() * 600));
  return user;
}
```

**WHY it dominates:** only cached data is what was actually requested; Redis going down
degrades to slow, not broken.
**TRADE-OFF:** every miss is a full DB round trip, and there's a stale window between a
DB write and cache invalidation.

**Invalidation ordering matters and is asked about:**

```
❌ WRONG — delete-then-write
   1. DEL user:1
   2. reader misses, reads OLD row from DB, sets cache      ← interleaved
   3. UPDATE users SET ... WHERE id=1
   Result: cache holds the OLD value until TTL. Could be an hour.

✅ CORRECT — write-then-delete (and delete, don't update)
   1. UPDATE users SET ... WHERE id=1
   2. DEL user:1
   A tiny race still exists; for the paranoid, "delayed double delete": DEL, write,
   sleep ~500 ms, DEL again. Or drive invalidation from the DB's replication log (CDC /
   Debezium), which is the only genuinely correct approach.
```

**Why DEL and not SET-the-new-value:** two concurrent writers can interleave their cache
SETs in the opposite order from their DB commits, permanently caching the older value.
Deleting is idempotent and order-insensitive.

### Write-through / write-behind

**Write-through:** write cache and DB synchronously in the same request path. Cache is
always warm and consistent. **Cost:** every write pays both latencies, and you cache data
nobody reads. **WHEN:** small, hot, read-dominated datasets like feature flags or config.

**Write-behind (write-back):** write to Redis, return, flush to DB asynchronously in
batches. **Cost:** if Redis dies before the flush, those writes are gone — and this is the
pattern where teams forget Redis's durability story. **WHEN:** high-volume, loss-tolerant
counters — page views, "last seen at". **WHEN NOT:** orders, payments, anything a human
would notice missing. If you do use it, the buffer must be a Redis Stream or List with
explicit acknowledgement, not a plain key, so a crashed flusher doesn't drop the batch.

### Cache stampede / thundering herd

```
  10,000 req/s all reading the same hot key with TTL 3600s

  t=3599.9   ████████████████████  all served from cache, DB idle
  t=3600.0   key EXPIRES
  t=3600.001 ▼
             ┌──────────────────────────────────────────────┐
             │ 10,000 concurrent requests ALL miss          │
             │ 10,000 concurrent identical queries to the DB│
             │ DB connection pool (100) exhausted instantly │
             │ Query time 50 ms → 40 s under the pile-on    │
             │ Requests time out → clients retry → worse    │
             │ ▶ Origin DB down. Cache is empty. It cannot  │
             │   refill because the DB is down. DEADLOCK.   │
             └──────────────────────────────────────────────┘
```

Three defenses; use at least two:

**1. Per-key mutex (single-flight).** Only one caller recomputes; the rest wait briefly
and re-read.

```javascript
async function getWithLock(key, loader, ttl = 3600) {
  const hit = await redis.get(key);
  if (hit !== null) return JSON.parse(hit);

  const token = crypto.randomUUID();
  const got = await redis.set(`lock:${key}`, token, 'NX', 'PX', 5000);
  if (!got) {
    await sleep(50 + Math.random() * 50);
    return getWithLock(key, loader, ttl);      // bounded retries in real code
  }
  try {
    const val = await loader();
    await redis.set(key, JSON.stringify(val), 'EX', ttl + jitter());
    return val;
  } finally {
    await redis.eval(RELEASE, 1, `lock:${key}`, token);
  }
}
```

**2. Probabilistic early expiry (XFetch).** The elegant one — no locks, no coordination.
Store the value with its recompute cost and a logical expiry; each reader independently
rolls the dice on refreshing *early*, with probability rising as expiry approaches. The
key never actually expires under load.

```javascript
// Bilal et al., "Optimal Probabilistic Cache Stampede Prevention" (VLDB 2015)
const BETA = 1.0;   // >1 = refresh earlier/more aggressively
function shouldRecompute(deltaMs, expiryEpochMs) {
  // deltaMs = how long the last recompute took
  return Date.now() - deltaMs * BETA * Math.log(Math.random()) >= expiryEpochMs;
}

async function xfetch(key, loader, ttlMs) {
  const raw = await redis.get(key);
  if (raw) {
    const { value, delta, expiry } = JSON.parse(raw);
    if (!shouldRecompute(delta, expiry)) return value;
  }
  const t0 = Date.now();
  const value = await loader();
  const delta = Date.now() - t0;
  await redis.set(key, JSON.stringify({ value, delta, expiry: Date.now() + ttlMs }),
                  'PX', ttlMs * 2);      // physical TTL > logical, so it never hard-misses
  return value;
}
```

Note the physical TTL is longer than the logical one — that's what removes the hard miss
entirely. An expensive-to-compute key (large `delta`) refreshes earlier, which is exactly
the right behavior.

**3. Jittered TTLs.** If you warm 100k keys in a loop with `EX 3600`, they all expire in
the same second, forever, in lockstep. `EX 3600 + rand(0..600)` spreads the load. This is
one line and prevents a whole class of self-inflicted outage.

### Cache penetration

**WHAT:** requests for keys that **don't exist anywhere**. Cache miss → DB miss → nothing
cached → every single request hits the DB. An attacker enumerating `/api/user/{random}`
turns your cache into a pass-through.

**Fix 1 — cache the negative result** with a short TTL:
```javascript
if (row === null) { await redis.set(key, 'NULL', 'EX', 60); return null; }
```
Short TTL (30–120 s) so a real creation isn't masked for long.

**Fix 2 — Bloom filter** for high-cardinality ID spaces. A Bloom filter answers
"definitely not present" or "maybe present" with no false negatives, in ~1.2 bytes per
element at 1% FPR.

```
BF.RESERVE users:bloom 0.01 100000000     # RedisBloom module; 100M items ≈ 114 MB
BF.ADD     users:bloom 12345
BF.EXISTS  users:bloom 99999              # 0 → definitely absent, skip DB entirely
```
**TRADE-OFF:** a standard Bloom filter cannot delete. Deleted users stay "maybe present"
forever. Use a cuckoo filter (`CF.*`) if you need deletion, or rebuild the filter nightly.

### Hot key

**WHAT:** one key takes a disproportionate share of traffic — a celebrity profile, a
flash-sale product, a global config. In Cluster, that key lives on exactly one node, so
you cannot shard your way out. Symptom: one node at 100% CPU while the rest idle.

```
  ❌  All traffic → slot 8231 → Node B → 100% CPU, p99 → 40 ms, others at 8%

  ✅  Fix 1: local in-process cache (5–30 s TTL) in front of Redis.
      Removes 95%+ of hot-key traffic. Accept the staleness window.

  ✅  Fix 2: key replication / value sharding
      write:  for i in 0..9: SET product:999:copy:{i} <val> EX 60
      read:   GET product:999:copy:{random(0..9)}
      Now 10 keys → up to 10 different slots → up to 10 nodes.
      Cost: 10x memory for that key, and 10 writes to invalidate.

  ✅  Fix 3: read replicas with READONLY routing (Cluster) for that key's shard.
```

Detect with `redis-cli --hotkeys` (requires `maxmemory-policy allkeys-lfu`) or
`redis-cli --bigkeys` for the size dimension. Both do a SCAN and are safe on production;
`MONITOR` is not — it's a firehose that can itself become the bottleneck.

---

## Pipelining vs Transactions vs Lua

These three are constantly confused. They solve **different** problems.

```
┌──────────────┬──────────────────┬────────────────┬─────────────────────────────┐
│              │ Saves round-trips│ Atomic?        │ Can branch on a read?       │
├──────────────┼──────────────────┼────────────────┼─────────────────────────────┤
│ Pipeline     │ YES              │ NO — other     │ NO                          │
│              │                  │ clients        │                             │
│              │                  │ interleave     │                             │
├──────────────┼──────────────────┼────────────────┼─────────────────────────────┤
│ MULTI/EXEC   │ YES              │ YES (isolated) │ NO — you can't read a value │
│              │                  │ but NO ROLLBACK│ mid-transaction and decide  │
├──────────────┼──────────────────┼────────────────┼─────────────────────────────┤
│ Lua (EVAL)   │ YES              │ YES            │ YES — this is the only one  │
│              │                  │                │ that can do read-then-write │
└──────────────┴──────────────────┴────────────────┴─────────────────────────────┘
```

### Pipelining

**WHAT:** send N commands without waiting for each reply. Purely a network optimization.

```
  Without pipeline (1 ms RTT):  1000 commands = 1000 × 1 ms = 1.0 SECOND
  With pipeline:                1000 commands = ~1 ms RTT + ~1 ms exec = ~2 ms
                                                              500x faster
```

**WHEN NOT / the trap:** a 1,000,000-command pipeline builds a 1,000,000-reply buffer on
the server *and* the client. That's a memory spike on both sides and a long serial burst
that stalls other clients. **Batch pipelines at 100–1000 commands.** Also: you cannot
branch — every command is decided before any reply is seen.

### MULTI / EXEC — and why it is NOT a database transaction

```
MULTI
SET a 1
LPUSH a x          ← WRONG TYPE. Queued fine (syntax is valid).
SET b 2
EXEC
1) OK
2) (error) WRONGTYPE Operation against a key holding the wrong kind of value
3) OK              ← executed anyway. `a` is 1, `b` is 2. NOTHING ROLLED BACK.
```

**State this precisely:** MULTI/EXEC gives you **isolation** (no other client's command
interleaves between EXEC's first and last command) and **all-or-nothing queuing** (a
*syntax* error at queue time aborts the whole thing). It does **not** give you atomicity
on runtime errors, and there is no ROLLBACK. Redis's justification: runtime errors are
programming bugs, and rollback support would cost performance for everyone.

**WATCH — optimistic concurrency control:**

```javascript
// Compare-and-swap: only apply if `key` didn't change since we read it.
await redis.watch(key);
const current = parseInt(await redis.get(key));
if (current < amount) { await redis.unwatch(); throw new InsufficientFunds(); }

const res = await redis.multi().set(key, current - amount).exec();
if (res === null) {
  // EXEC returned nil → a watched key changed → the transaction did NOT run.
  // You MUST retry the whole read-modify-write. Most people forget this branch.
  return retry();
}
```

`EXEC` returning `null` is the entire point of WATCH and the most commonly dropped
error path in real code. Note also: **WATCH is per-connection.** If your client library
pools connections and issues WATCH and EXEC on different sockets, it silently does
nothing. Use the library's dedicated transaction API.

### Lua

**WHAT:** a script that runs atomically on the server — no other command interleaves.
This is the only tool that lets you read a value, decide, and write, atomically, without
optimistic retries.

```lua
-- Atomic conditional decrement — the canonical inventory reservation.
-- KEYS[1] = stock key, ARGV[1] = qty
local stock = tonumber(redis.call('GET', KEYS[1]) or '0')
if stock < tonumber(ARGV[1]) then
  return -1
end
return redis.call('DECRBY', KEYS[1], ARGV[1])
```

**Rules that will bite you:**

1. **Always declare keys in `KEYS`, never build key names inside the script.** Cluster
   routes the script by its declared keys; keys computed at runtime break sharding and
   will hit the wrong node.
2. **Scripts must be deterministic.** Pre-Redis-5 this was enforced (no `math.random`
   without seeding, no `TIME` before writes). Modern Redis uses effect replication —
   the script's *resulting commands* are replicated, not the script text — so
   nondeterminism is safer, but it's still a smell. Pass the timestamp in as `ARGV`.
3. **Scripts block the entire server.** A loop over 1M elements is a 1M-element outage.
   `busy-reply-threshold` (formerly `lua-time-limit`, default 5000 ms) only makes Redis
   start replying `-BUSY` to other clients — the script keeps running. `SCRIPT KILL`
   works only if the script hasn't written yet; if it has, your only option is
   `SHUTDOWN NOSAVE`. **Read that again.** A runaway write script means you lose the
   instance.
4. **Use `EVALSHA` with an `EVAL` fallback** on `NOSCRIPT` — sending a 4 KB script body
   on every call wastes bandwidth. Every decent client does this automatically; verify
   yours does.
5. **Redis 7 Functions** (`FUNCTION LOAD`, `FCALL`) are the successor: named, versioned,
   persisted with the dataset, and replicated — rather than a SHA you must re-load after
   every restart. Prefer them for anything permanent.

---

## Pub/Sub vs Streams

### Pub/Sub: fire-and-forget

```
  PUBLISH news "hello"
        │
        ├──▶ subscriber A (connected)   ✓ receives
        ├──▶ subscriber B (connected)   ✓ receives
        └──▶ subscriber C (RECONNECTING) ✗ MESSAGE IS GONE FOREVER
                                            No buffer. No replay. No ACK.
                                            Redis doesn't even know C existed.
```

**WHAT it guarantees:** at-most-once delivery to currently-connected subscribers.
**WHAT it does not:** persistence, acknowledgement, replay, consumer groups, backpressure.

**WHEN to use:** genuinely ephemeral fanout where a miss is harmless and self-correcting —
cache invalidation broadcasts (paired with a TTL as the backstop), live presence,
"reload your config" pokes, WebSocket fanout across app servers.

**WHEN NOT:** anything you'd be paged about if it were lost. If you find yourself writing
retry logic on top of Pub/Sub, you needed Streams.

**The slow-subscriber failure:** a subscriber that doesn't read fast enough accumulates
messages in its server-side output buffer. `client-output-buffer-limit pubsub 32mb 8mb 60`
means Redis will **disconnect** it — silently, from the app's perspective. Your app
reconnects and has a hole in its data with no error anywhere. Monitor
`client_output_buffer_limit_disconnections`.

### Streams: a real log with consumer groups

```
  ┌──────────────────────────── STREAM orders ────────────────────────────┐
  │  1712...-0   1712...-1   1712...-2   1712...-3   1712...-4  ...       │
  │  (ID = millisecondsTime-sequence, monotonically increasing)           │
  └───────────────────────────────────────────────────────────────────────┘
         │                                        │
         │  XREADGROUP GROUP g1 consumerA         │  GROUP g2 (independent cursor)
         ▼                                        ▼
  ┌────────────────────────────────────┐    ┌───────────────────┐
  │ group g1                           │    │ group g2          │
  │  last-delivered-id: 1712...-4      │    │  ...              │
  │  ┌── PEL (Pending Entries List) ──┐│    └───────────────────┘
  │  │ id        consumer  delivered  ││
  │  │ 1712...-2 consumerA  1  45s ago││ ← delivered, NOT XACK'd.
  │  │ 1712...-3 consumerB  3  12s ago││   consumerA may have crashed.
  │  └────────────────────────────────┘│   XAUTOCLAIM moves it to a live consumer.
  └────────────────────────────────────┘   delivery-count 3 → it's a POISON MESSAGE
```

```
XADD orders '*' type created id 9931            # append; '*' = server-assigned ID
XADD orders MAXLEN '~' 1000000 '*' ...          # capped stream. '~' = approximate,
                                                #  trims to segment boundaries — MUCH
                                                #  cheaper. Use it. Exact MAXLEN is O(N).
XGROUP CREATE orders workers 0 MKSTREAM         # 0 = from start, $ = only new
XREADGROUP GROUP workers worker-1 COUNT 10 BLOCK 5000 STREAMS orders '>'
                                                # '>' = never-delivered messages
                                                # '0' = MY pending (for crash recovery)
XACK orders workers 1712...-2                   # remove from PEL — the commit
XAUTOCLAIM orders workers worker-2 60000 0 COUNT 10
                                                # steal entries idle > 60 s
XPENDING orders workers - + 10                  # inspect stuck work
```

**The correct consumer loop, with the parts people omit:**

```javascript
while (running) {
  // 1. FIRST reclaim anything abandoned by dead consumers, and handle poison messages.
  const [, claimed] = await redis.xautoclaim('orders', 'workers', me, 60000, '0', 'COUNT', 10);
  for (const [id, fields] of claimed) {
    const info = await redis.xpending('orders', 'workers', '-', '+', 1, /* consumer */ me);
    if (info[0] && info[0][3] >= 5) {                 // delivery-count >= 5
      await redis.xadd('orders:dlq', '*', ...fields, 'origId', id);
      await redis.xack('orders', 'workers', id);      // ACK to stop the loop
      continue;
    }
    await handle(id, fields);
    await redis.xack('orders', 'workers', id);
  }

  // 2. Then new work.
  const res = await redis.xreadgroup('GROUP','workers',me,'COUNT',10,'BLOCK',5000,
                                     'STREAMS','orders','>');
  if (!res) continue;
  for (const [id, fields] of res[0][1]) {
    await handle(id, fields);              // MUST be idempotent — at-least-once
    await redis.xack('orders', 'workers', id);
  }
}
```

**Without the XAUTOCLAIM step, a crashed consumer's in-flight messages sit in the PEL
forever.** They are not redelivered automatically. This is the #1 Streams production bug:
"we lost messages" — no, they're in the PEL, run `XPENDING`.

**Without the delivery-count / DLQ check, a poison message loops forever**, consuming a
worker permanently.

**Memory:** Streams live in RAM. An uncapped stream grows without bound until Redis OOMs.
`MAXLEN ~` or `MINID ~` is not optional — it is the difference between a working system
and a 3 a.m. page. Note that trimming does **not** remove entries from the PEL; a consumer
group whose pending entries were trimmed away will see them as missing on claim.

### Honest comparison

| | Pub/Sub | Streams | Kafka |
|---|---|---|---|
| Persistence | none | RAM, capped | disk, days–forever |
| Delivery | at-most-once | at-least-once w/ ACK | at-least-once / EOS |
| Replay | no | yes, within retention | yes |
| Consumer groups | no | yes | yes |
| Ordering | per-channel, best-effort | total, per-stream | per-partition |
| Throughput | very high | ~1M msg/s single node | millions, horizontally |
| Retention cost | free | **RAM** | disk |
| Ops complexity | trivial | low | high |

**WHEN Streams beat Kafka:** you already run Redis; throughput is under ~500k msg/s;
retention is hours not weeks; you want one fewer distributed system to operate. A job
queue with 10k jobs/sec and 6-hour retention is a *better* fit for Streams than for Kafka.

**WHEN Kafka beats Streams:** multi-day retention, terabytes of data, replayability as a
product requirement, a stream-processing ecosystem (Flink, ksqlDB, Connect), or
partition-level horizontal scale beyond one machine's RAM.

---

## Rate Limiting in Lua

All correct rate limiters are atomic read-modify-write, so they are Lua scripts. A
GET-then-SET rate limiter is not a rate limiter; it's a suggestion.

### Fixed window — cheapest, has the boundary burst problem

```lua
-- KEYS[1] = "rl:{user}:{window}"   ARGV[1] = limit   ARGV[2] = window seconds
local n = redis.call('INCR', KEYS[1])
if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[2]) end
return n <= tonumber(ARGV[1]) and 1 or 0
```
**Flaw:** limit 100/min allows 100 requests at 11:59:59.9 and 100 more at 12:00:00.1 —
**200 in 200 ms**. Fine for coarse abuse prevention, wrong for protecting a fragile
downstream. Note the `INCR`-then-`EXPIRE` ordering: if `EXPIRE` were skipped due to a
crash between two separate commands, the key would be permanent — inside Lua it's atomic,
which is exactly why this must be a script.

### Sliding window log — exact, more memory

```lua
-- KEYS[1]=key  ARGV[1]=now_ms  ARGV[2]=window_ms  ARGV[3]=limit  ARGV[4]=unique_id
redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, ARGV[1] - ARGV[2])
local count = redis.call('ZCARD', KEYS[1])
if count >= tonumber(ARGV[3]) then
  return {0, count}
end
redis.call('ZADD', KEYS[1], ARGV[1], ARGV[4])
redis.call('PEXPIRE', KEYS[1], ARGV[2])
return {1, count + 1}
```
**Cost:** one sorted-set member per request in the window. 1M users × 100 req/window ×
~70 B ≈ **7 GB**. Exact, but do the arithmetic before you ship it. Pass `now` in as ARGV
from the app so all app servers share a clock source (or use `TIME` — but then be aware
of replication semantics).

### Sliding window counter — the production default

Two fixed-window counters, weighted by how far into the current window you are. ~2 keys
per user, and the boundary burst is gone.

```lua
-- ARGV: now_ms, window_ms, limit
local win     = math.floor(tonumber(ARGV[1]) / tonumber(ARGV[2]))
local cur_key = KEYS[1] .. ':' .. win
local prv_key = KEYS[1] .. ':' .. (win - 1)
local elapsed = (tonumber(ARGV[1]) % tonumber(ARGV[2])) / tonumber(ARGV[2])
local prev    = tonumber(redis.call('GET', prv_key) or '0')
local cur     = tonumber(redis.call('GET', cur_key) or '0')
local est     = prev * (1 - elapsed) + cur
if est >= tonumber(ARGV[3]) then return 0 end
redis.call('INCR', cur_key)
redis.call('PEXPIRE', cur_key, tonumber(ARGV[2]) * 2)
return 1
```
(In Cluster, wrap the base key in a hash tag so both derived keys share a slot.)

### Token bucket — allows controlled bursts

The right model when you want "sustained 10/s but a burst of 50 is fine" — API gateways,
outbound calls to a rate-limited third party.

```lua
-- KEYS[1]=bucket  ARGV: now_ms, rate_per_sec, capacity, requested
local st   = redis.call('HMGET', KEYS[1], 'tokens', 'ts')
local cap  = tonumber(ARGV[3])
local rate = tonumber(ARGV[2])
local now  = tonumber(ARGV[1])
local tokens = tonumber(st[1]) or cap
local ts     = tonumber(st[2]) or now
tokens = math.min(cap, tokens + (now - ts) / 1000 * rate)   -- refill by elapsed time
local want = tonumber(ARGV[4])
local ok = 0
if tokens >= want then tokens = tokens - want; ok = 1 end
redis.call('HSET', KEYS[1], 'tokens', tokens, 'ts', now)
redis.call('PEXPIRE', KEYS[1], math.ceil(cap / rate * 2000))
return {ok, math.floor(tokens)}
```

**Cross-cutting concerns for any Redis rate limiter:**
- **Fail open or fail closed?** If Redis is unreachable, does the request pass? For abuse
  prevention, fail open (don't take an outage to block bots). For a paid-quota or
  downstream-protection limiter, fail closed. **Decide explicitly and write it down** —
  the default in most codebases is "whatever the exception handler happens to do."
- **Return the limit headers** (`X-RateLimit-Remaining`, `Retry-After`) so clients back
  off instead of hammering.
- **Key by the right identity.** Keying by IP breaks behind NAT and CGNAT; keying by user
  ID doesn't stop unauthenticated abuse. Usually you need both, at different limits.

---

## Observability and Capacity Math

### What to alert on

| Metric (`INFO` field) | Alert threshold | What it means |
|---|---|---|
| `used_memory / maxmemory` | > 80% | Eviction imminent; hit rate about to fall off a cliff |
| `mem_fragmentation_ratio` | < 1.0 = **page immediately** | Swapping. Latency will be 1000x. |
| `evicted_keys` rate | any sustained non-zero on a datastore | You're silently losing data |
| `keyspace_hits/(hits+misses)` | < 0.8 and falling | Cache is undersized or TTLs too short |
| `rejected_connections` | > 0 | `maxclients` hit; connection leak or missing pooling |
| `blocked_clients` | rising | BLPOP/BRPOP/XREAD pile-up |
| `latest_fork_usec` | > 500,000 (0.5 s) | Every BGSAVE stalls the server that long |
| `rdb_last_bgsave_status` | != ok | **You have no backups.** Silent until you need them. |
| `master_link_status` | != up | Replica is diverging |
| `master_repl_offset` − replica offset | > 50 MB | Replication lag; failover would lose this much |
| `instantaneous_ops_per_sec` | sudden drop | Usually a blocking command, not a traffic drop |
| SLOWLOG entries > 10 ms | any | Someone ran an O(N) command |
| `connected_clients` | near `maxclients` | See rejected_connections |

`redis-cli --latency` and `--latency-history` measure round-trip; `--intrinsic-latency 100`
measures what the *machine* can do (this separates "Redis is slow" from "this VM is
oversubscribed" — a noisy EC2 neighbor shows up as 5+ ms intrinsic latency and no amount
of Redis tuning helps).

### Sizing math worked end to end

> **Requirement:** cache 20M user profiles, ~800 B JSON each, TTL 24 h, peak 60k req/s,
> 95% read.

```
  1. Raw data:        20,000,000 × 800 B                        = 16.0 GB
  2. Key overhead:    20,000,000 × ~64 B (key string + dictEntry
                      + robj + expire dictEntry)                =  1.3 GB
  3. Subtotal                                                   = 17.3 GB
  4. jemalloc fragmentation ×1.25                               = 21.6 GB
  5. Replication backlog (256 MB) + client buffers (~1 GB)      = 22.9 GB
  6. maxmemory should be ≤ 55% of RAM if forking                → 42 GB RAM
     ...or ≤ 75% if persistence is disabled (pure cache: yes)   → 31 GB RAM

  DECISION: r6g.2xlarge (64 GB) with maxmemory 46gb, persistence off,
            allkeys-lru, one replica for HA.

  Throughput check: 60k req/s on one node is ~12% of a single node's capacity.
            Not the constraint. Memory is. Do NOT reach for Cluster.

  If profiles were 8 KB instead of 800 B → 160 GB raw → 400 GB RAM → NOW
  you shard (Cluster, 4–6 shards) or you cache only the hot 10% and accept misses.
  The second option is almost always cheaper and is the senior answer.
```

**Connection sizing:** each client connection costs ~20 KB of server buffers.
10,000 connections ≈ 200 MB before any data. With 50 app pods × 20 pool connections =
1,000 — fine. With 500 serverless functions each opening its own connection and never
closing it, you hit `maxclients 10000` and start refusing connections. Serverless + Redis
needs a connection proxy (RDS Proxy-style) or a very short idle timeout.

---

## Production War Stories

### Story 1: `KEYS *` on a 40M-key instance

**Symptom.** At 14:02 on a Tuesday, every service in the platform started returning 504.
Not one service — all of them. The API gateway showed p99 going from 40 ms to 30 s across
unrelated endpoints. Redis CPU was pegged at 100% on a single core. `redis-cli PING`
hung.

**Investigation.** Redis was the only shared dependency of every failing service, which
narrowed it fast. `INFO clients` (once it finally responded) showed 4,000 blocked clients
and `instantaneous_ops_per_sec: 0` — not low, *zero*. That's the signature of a blocked
event loop rather than a traffic problem. `SLOWLOG GET 10` after recovery showed a single
entry: `KEYS session:*`, duration **11,400,000 µs** — 11.4 seconds. Repeating. Every
30 seconds.

**Root cause.** A new internal admin dashboard shipped that morning had a "count active
sessions" widget. Implementation: `redis.keys('session:*').length`. It polled every 30
seconds. In staging there were 3,000 keys and it returned in 2 ms. In production there
were 40 million keys. Each call froze the entire event loop for 11 seconds, during which
every other client's commands queued. The 30-second poll meant Redis was unavailable
roughly 38% of the time.

**Fix.** Immediate: `CLIENT KILL` the dashboard's connection, then
`CONFIG SET appendonly no` was *not* needed — just disabling the widget restored service
in 90 seconds. Permanent: (a) `rename-command KEYS ""` in production config; (b) the
widget switched to a maintained counter (`INCR`/`DECR` on session create/destroy) — O(1)
instead of O(N); (c) `slowlog-log-slower-than 10000` with an alert on any entry; (d) a CI
lint rule banning `.keys(`, `KEYS `, `FLUSHALL`, and `SMEMBERS` in application code.

**Lesson.** Staging data volume is not production data volume, and O(N) on a serial
server is an availability bug, not a performance bug. The counter was the real fix: if
you need a count, maintain a count. Also: the *fastest* diagnostic signal was
`instantaneous_ops_per_sec: 0` — zero ops with connected clients means blocked, and that
should be a first-class alert.

### Story 2: BGSAVE fork → OOM kill → 6 hours of data gone

**Symptom.** A Redis instance holding the session store disappeared at 03:14. Not
crashed — *gone*. No error in the Redis log, no shutdown message. It simply stopped, and
systemd restarted it with an empty dataset. Every logged-in user was logged out. Peak
Europe traffic was two hours away.

**Investigation.** The Redis log's last line was
`Background saving started by pid 28471` — and nothing after. `dmesg` told the story:
`Out of memory: Killed process 28402 (redis-server) total-vm:29847232kB`. The host had
16 GB. `INFO` history in the metrics system showed `used_memory` at 11.8 GB with
`maxmemory 14gb`. `latest_fork_usec` had been climbing for weeks: 40,000 → 180,000 →
610,000.

**Root cause.** Three compounding mistakes.
(1) `maxmemory 14gb` on a 16 GB host — 87% — left no headroom for copy-on-write.
(2) `save 60 10000` meant BGSAVE fired constantly under normal write load.
(3) Transparent huge pages were `always` (the default on that AMI), so every 8-byte
session touch during the snapshot copied a **2 MB** page instead of 4 KB. Write
amplification was roughly 250x. During a 40-second snapshot, COW added ~9 GB. 11.8 + 9 =
20.8 GB on a 16 GB box. The kernel OOM killer selects the largest RSS — Redis. SIGKILL
means no graceful shutdown, no final save, and the RDB on disk was the *previous*
successful one from six hours earlier. It didn't even matter, because the sessions had
1-hour TTLs; restoring six-hour-old sessions would have restored nothing useful.

**Fix.**
```
echo never > /sys/kernel/mm/transparent_hugepage/enabled     # in a systemd unit, pre-start
sysctl -w vm.overcommit_memory=1
CONFIG SET maxmemory 8gb                                     # 50% of 16 GB
CONFIG SET save ""                                           # primary stops snapshotting
# a dedicated replica takes the snapshots instead
```
Plus alerts on `latest_fork_usec > 500000` and on `used_memory_rss > 0.75 × total RAM`.

**Lesson.** `maxmemory` is not a memory budget — it is a *data* budget, and Redis needs
roughly as much again for forking. THP is the silent multiplier; Redis warns about it in
the log at startup and everyone scrolls past. And the deepest lesson: nobody had ever
tested restoring from the RDB. The backup was decorative.

### Story 3: Cache stampede took down the origin database

**Symptom.** Every day at exactly 04:00 UTC, the product API's error rate went from 0.01%
to 60% for four to six minutes, then recovered on its own. Redis was healthy the whole
time — CPU 8%, no evictions, no slow commands. Postgres showed 100% CPU and
`FATAL: sorry, too many clients already`.

**Investigation.** The 04:00 precision was the clue — self-inflicted, not organic. Redis
`INFO` showed `expired_keys` spiking to ~180,000 in a single second at 04:00:00, then
zero. Postgres `pg_stat_activity` during the window showed ~2,000 sessions running
*syntactically identical* queries: `SELECT * FROM products WHERE id = $1`, with only a
few hundred distinct ids among them — dozens of concurrent duplicates of the same query.

**Root cause.** A nightly warmer job ran at 03:00 and bulk-loaded ~200k product records
with a constant `EX 3600`. They therefore all expired within the same millisecond at
04:00. At that instant every in-flight request missed. There was no single-flight
protection, so 2,000 concurrent requests for the *same* product each issued their own
identical query. The connection pool (200) exhausted immediately; queries queued; latency
went from 8 ms to 40 s; clients timed out and *retried*, adding load. The cache could not
refill because the database could not answer. The only reason it recovered was that the
retry budget exhausted and traffic dropped enough for the DB to catch up.

**Fix.** Three changes, all necessary:
1. **Jitter:** `EX 3600 + random(0, 900)` in the warmer. This alone reduced the spike
   from 180k simultaneous expirations to ~200/second.
2. **Single-flight:** per-key `SET NX PX 5000` lock around the loader, so exactly one
   request per key recomputes.
3. **Probabilistic early refresh (XFetch)** on the top 1,000 products, so those keys
   effectively never expire under traffic.

Postgres also got `statement_timeout = 5s` so a pile-on sheds load instead of queueing
into oblivion.

**Lesson.** A cache is a load-bearing structural component, and its *failure mode* — mass
simultaneous expiry — must be designed, not discovered. Constant TTLs applied in a bulk
loop synchronize expiry across your entire keyspace forever. Also, "Redis is healthy"
during a cache-caused outage is normal and misleading: the victim is downstream. Alert on
origin QPS, not just cache health.

### Story 4: A lock released by the wrong holder → double charges

**Symptom.** Finance reported 47 customers double-charged over one week — roughly 0.002%
of transactions. Reproducing it was impossible; the code was obviously correct on
inspection. Each duplicate pair was 30–90 seconds apart, and always involved the same
subset of merchant accounts.

**Investigation.** Payment logs showed two `charge()` calls for the same `order_id` from
two different worker pods. The lock code:

```javascript
const locked = await redis.set(`lock:order:${id}`, '1', 'NX', 'PX', 30000);
if (!locked) return;
try { await paymentProvider.charge(order); }
finally { await redis.del(`lock:order:${id}`); }
```

Timing analysis of the affected merchants revealed the cause: those merchants used a
payment provider whose p99.9 latency was **34 seconds** (a legacy 3-D Secure flow),
against a 30-second lock TTL.

```
  t=0    Worker A: SET lock NX PX 30000  → OK. Begins charge.
  t=30   Lock EXPIRES. A is still inside paymentProvider.charge().
  t=31   Retry timer fires. Worker B: SET lock NX PX 30000 → OK (key is gone).
         B begins charge. ─── TWO CHARGES NOW IN FLIGHT ───
  t=34   A's charge returns. A runs DEL lock  ← DELETES B's LOCK. A doesn't own it.
  t=35   Worker C: SET lock NX → OK. C begins a THIRD charge.
```

The value was the constant `'1'`, so there was no way to tell whose lock it was. The
`DEL` in A's `finally` block unconditionally destroyed B's lock, which then let C in. One
slow charge cascaded into three.

**Fix.**
1. Unique token per acquisition + Lua compare-and-delete release (see
   [Distributed Locking](#distributed-locking-and-why-redlock-is-contested)). This stops A
   from deleting B's lock.
2. That alone is insufficient — A and B still overlapped between t=30 and t=34. So:
   **an idempotency key enforced at the payment provider**, plus a `UNIQUE` constraint on
   `(order_id, attempt_key)` in Postgres. The database, not Redis, now guarantees
   at-most-once.
3. A watchdog renewing the lease at TTL/3, with a hard `AbortController` if renewal fails.
4. A metric on the "released a lock we no longer held" branch. It fired 340 times in the
   first day — the bug had been happening constantly and silently; only 47 instances
   happened to land inside the charge window.

**Lesson.** A Redis lock is a lease with a deadline, and any operation that can exceed the
deadline breaks mutual exclusion no matter how the lock is implemented — this is precisely
Kleppmann's critique, encountered in the wild. **Locks give you efficiency; only the
resource can give you correctness.** Every lock release should verify ownership and emit a
metric when it fails, because that metric is the leading indicator of a correctness bug
you cannot otherwise see.

---

## Common Pitfalls

**1. Keys with no TTL, in a cache.**
*Failure mode:* memory grows monotonically. With `noeviction` you hit OOM errors on write
and the application starts failing; with `allkeys-lru` you evict data you needed. Either
way it surfaces weeks later, at peak.
*Fix:* wrap your client so `set()` requires an explicit TTL or an explicit
`{persist: true}`. Audit with `redis-cli --scan | head -10000 | xargs -n1 redis-cli ttl |
grep -c '^-1$'`.

**2. Storing giant objects in one key.**
*Failure mode:* a 200 MB value means every `GET` is a 200 MB memcpy plus 200 MB on the
wire — the event loop is busy for ~100 ms. In Cluster, that key also makes resharding
block, because `MIGRATE` is synchronous. `redis-cli --bigkeys` finds these.
*Fix:* split into a hash and use `HMGET`, or move the blob to object storage.

**3. Using `SCAN` with a `while (keys.length)` loop.**
*Failure mode:* SCAN legitimately returns an empty array with a non-zero cursor. The loop
exits early and you silently process 5% of your keys. Nothing errors.
*Fix:* `do { } while (cursor !== '0')`.

**4. Connecting per request instead of pooling.**
*Failure mode:* TCP handshake + AUTH + SELECT per request adds ~1 ms and burns file
descriptors. Under load you exhaust ephemeral ports on the client and `maxclients` on the
server; `rejected_connections` climbs and errors look like Redis is down.
*Fix:* one long-lived pool per process. In Node, one `ioredis` client is already
multiplexed — do not create one per request.

**5. Assuming `EXPIRE` is precise.**
*Failure mode:* Redis expires keys (a) lazily on access and (b) via a sampling loop 10x/s
that stops when < 25% of a sample is expired. A key can remain in memory long past its
TTL if nothing touches it. Memory accounting and "unique keys today" counts go wrong.
*Fix:* never rely on expiry for *correctness*; check the TTL/timestamp in application
logic too. Watch `expired_keys` vs. expected.

**6. Writing to a replica.**
*Failure mode:* if `replica-read-only no`, writes succeed locally and are silently
destroyed at the next full resync. Data appears, works, and then vanishes.
*Fix:* leave `replica-read-only yes`. Always.

**7. Forgetting that Lua blocks everything.**
*Failure mode:* a script iterating a 2M-member set makes Redis unavailable for the
duration. If it has already written, `SCRIPT KILL` refuses and your only recourse is
`SHUTDOWN NOSAVE` — losing everything since the last save.
*Fix:* scripts touch a bounded number of elements. Pass explicit limits in ARGV. Test
scripts against production-sized data.

**8. `MULTI/EXEC` treated as a transaction with rollback.**
*Failure mode:* a `WRONGTYPE` mid-transaction leaves half the operations applied. Money
moved out of one account and not into the other.
*Fix:* Lua for anything that must be all-or-nothing with logic, and validate types before
queuing.

**9. Ignoring `EXEC` returning `null` after `WATCH`.**
*Failure mode:* the transaction silently didn't execute. Your code proceeds as if it did.
*Fix:* always branch on the null and retry the whole read-modify-write.

**10. Hash tags chosen too coarsely in Cluster.**
*Failure mode:* `{tenant:acme}` puts one large tenant's entire dataset on one shard.
That shard is at 100% CPU and 90% memory while the others idle. You cannot rebalance out
of it without changing the key schema.
*Fix:* tag at the smallest unit that satisfies your multi-key operations.

**11. `maxmemory-policy volatile-lru` with keys that mostly lack TTLs.**
*Failure mode:* Redis finds no evictable keys and returns OOM on every write while `INFO`
shows plenty of "data". Looks like a bug; is a config error.
*Fix:* `allkeys-lru` for caches, or enforce TTLs.

**12. Not setting `repl-backlog-size`.**
*Failure mode:* a 3-second network blip forces a full resync, which forks the primary,
transfers the entire dataset, and spikes memory — turning a blip into an incident.
*Fix:* `repl-backlog-size 256mb`, `repl-backlog-ttl 3600`.

---

## Junior vs Senior

| Dimension | Junior | Senior |
|---|---|---|
| Mental model | "Redis is a fast key-value cache" | "Redis is a single-threaded data structure server; every command's complexity is an availability property" |
| Reads a big set | `SMEMBERS bigset` | `SSCAN` with a cursor, or redesigns so it's never needed |
| Deletes a big key | `DEL` | `UNLINK`, and sets `lazyfree-lazy-*` globally |
| Memory | "Add more RAM" | Checks `OBJECT ENCODING`, tunes listpack thresholds, buckets small keys into hashes, computes 55% headroom for fork |
| maxmemory | leaves it at 0 | sets it to 55% of RAM, picks the policy deliberately, alerts on `evicted_keys` |
| Persistence | "We have AOF, we're safe" | "`everysec` loses 1 s on power loss, 0 on process crash; replication is async so failover loses the un-ACKed tail; Redis is not our system of record" |
| Locking | `SET NX` + `DEL` | Unique token + Lua CAS release + watchdog + idempotency enforced at the resource; can argue both sides of Redlock |
| Caching | "Cache it with a 1-hour TTL" | Jittered TTL, single-flight, negative caching, hot-key strategy, and an explicit answer for "what happens when Redis is down?" |
| Consistency | "Redis and the DB are in sync" | Knows the exact race windows and picks write-then-delete, or CDC-driven invalidation |
| Cluster | "It shards automatically" | Knows CROSSSLOT, MOVED vs ASK, hash-tag granularity, that `MIGRATE` blocks, and that most teams don't need Cluster |
| Transactions | "MULTI is a transaction" | "MULTI gives isolation, not rollback; use Lua when you need read-then-decide" |
| Debugging | Runs `MONITOR` in production | `SLOWLOG`, `INFO commandstats`, `--latency`, `--bigkeys`, `--hotkeys`; knows MONITOR is itself a load source |
| Failure planning | "Redis is up, so it's fine" | Has tested: what happens when Redis is down? evicts? fails over? Is the app's fallback path exercised in CI? |
| Scaling instinct | "Add Redis Cluster" | "Add a local in-process cache first; it removes 90% of Redis traffic for free" |

---

## Interview Questions with Model Answers

**Q1. Redis is single-threaded. How does it handle 500,000 operations per second?**

> Because the bottleneck isn't CPU. A `GET` is a hash lookup and a memcpy — tens of
> nanoseconds. What single-threading buys is the absence of lock contention, context
> switches, and cache-line ping-pong, which is what actually limits multi-threaded stores
> at high concurrency. It also makes every command atomic for free, which is why Redis is
> such a good coordination primitive.
>
> It's also not strictly single-threaded anymore. Since 6.0, `io-threads` parallelize
> socket reads/writes and protocol parsing; `bio` threads handle `fsync` and `close`; and
> lazy-free reclaims large objects off the main thread. Command *execution* is still
> serial, and always will be — that's the design.
>
> The corollary is what actually matters operationally: one slow command stalls every
> client. There's no preemption and no per-query timeout. So `KEYS`, `SMEMBERS` on a big
> set, or a Lua script with a long loop aren't slow queries — they're outages.

*Interviewer follow-up: "So how would you find and delete 10 million keys matching a
pattern without stalling the server?"*
> `SCAN` with `MATCH` and `COUNT 500`, batching `UNLINK` on the results, with a small
> sleep between iterations if I want to bound the impact further. Critically, I loop until
> the cursor returns to `'0'` — not until the batch is empty, because SCAN can return an
> empty batch with a live cursor. And I use `UNLINK` rather than `DEL` so freeing happens
> on a background thread. If this is a recurring need, the real fix is a key naming scheme
> plus TTLs, or a set that tracks the keys, so I never have to scan at all.

---

**Q2. Walk me through what happens in memory when Redis takes a BGSAVE.**

> `fork()` creates a child that shares all the parent's physical pages, marked read-only.
> The fork itself is fast because it copies page tables, not data — on the order of 10–100
> ms for a 10 GB dataset, though it's much worse on some hypervisors, which is why I watch
> `latest_fork_usec`.
>
> The cost comes after. Every write the parent makes to a shared page triggers a
> copy-on-write fault: the kernel duplicates that page so the parent can modify a private
> copy. The critical detail is that the granularity is a 4 KB page, not a key — incrementing
> one 8-byte counter dirties a whole page. So the extra memory is proportional to write
> rate times snapshot duration, and in the worst case it approaches 100% of the dataset
> size.
>
> That's the classic 2x-memory OOM: a 12 GB dataset on a 16 GB host with a write-heavy
> workload can peak near 24 GB. The Linux OOM killer picks the largest RSS process, which
> is Redis, and sends SIGKILL — no graceful shutdown, no final save.

*Interviewer follow-up: "How do you prevent it?"*
> Four things, in order of impact. First, `maxmemory` at 55% of host RAM, not 85%. Second,
> transparent huge pages set to `never` — with THP on, COW granularity is 2 MB instead of
> 4 KB, which is a 500x write amplification and by far the biggest hidden multiplier;
> Redis literally warns about it at startup. Third, `vm.overcommit_memory=1`, or `fork()`
> itself fails with ENOMEM. Fourth, and best: take snapshots on a dedicated replica and
> set `save ""` on the primary. The replica has almost no COW because it isn't serving
> client writes.

---

**Q3. A user updates their profile and immediately sees the old data. Walk me through it.**

> There are three candidate causes and I'd distinguish them before touching anything.
>
> First, **replica read staleness.** Replication is asynchronous — the primary ACKs the
> client before the replica has the write. If the read went to a replica, the write may
> not have arrived. The fix isn't "reduce lag"; it's read-your-writes routing — after a
> user writes, pin that user's reads to the primary for a few seconds using a session
> token or a written-at timestamp.
>
> Second, **cache invalidation ordering.** If the code does `DEL` then `UPDATE`, a
> concurrent reader can miss, read the old row, and repopulate the cache — after which the
> stale value persists until TTL. Correct order is write-then-delete. And *delete*, not
> *set*: two concurrent writers can interleave their cache writes in the opposite order
> from their DB commits and permanently cache the older value.
>
> Third, an **in-process cache** on the app server with its own TTL that nobody remembers
> exists. This is the one that wastes the most debugging time.
>
> The way to tell them apart: check `master_repl_offset` delta for lag, and check whether
> the stale read is sticky (invalidation bug — it stays wrong) or transient (replication
> lag — it self-heals in milliseconds).

*Interviewer follow-up: "How would you make invalidation actually correct?"*
> Drive it from the database's replication log with CDC — Debezium on the Postgres WAL,
> for example — so invalidation happens strictly after commit, in commit order, and can't
> be lost when the app crashes between the DB write and the Redis `DEL`. Short of that,
> write-then-delete plus a short TTL bounds the damage: the TTL is what makes any
> invalidation bug self-healing rather than permanent. I always set a TTL even on
> "actively invalidated" keys for exactly that reason.

---

**Q4. Implement a distributed lock. Then tell me why it's wrong.**

> `SET lock:<resource> <random-token> NX PX 30000`. Release with a Lua script that
> compares the stored value to my token and only then deletes — never a bare `DEL`,
> because if my work outran the TTL, the lock is now someone else's and I'd be deleting
> theirs, which cascades into a third holder.
>
> Why it's still wrong: it's a *lease*, and leases assume bounded pauses. If my process
> stops for a full GC, a VM live-migration, or a page-fault storm, the lock expires on the
> server while I still believe I hold it. A second holder acquires legitimately, and now
> two processes are in the critical section. No quorum algorithm fixes this — Redlock
> across five nodes has the same client-side pause problem, which is Kleppmann's core
> critique.
>
> So the honest framing: Redis locks are excellent for **efficiency** — stopping two
> workers from doing the same expensive job — and insufficient for **correctness**. If a
> violation means double-charging a customer, the guarantee has to live in the resource:
> an idempotency key with a unique constraint, a conditional write, or a fencing token the
> resource itself enforces by rejecting stale tokens.

*Interviewer follow-up: "Would you use Redlock?"*
> Usually no. It multiplies network calls and operational surface by five and still
> doesn't give a correctness guarantee, because the pause problem is client-side. I'd use
> single-instance `SET NX PX` plus a Lua release for efficiency locking, and push
> correctness into the resource. If I genuinely needed a correctness lock — leader
> election, a singleton scheduler — I'd use etcd or ZooKeeper, which give real consensus
> and monotonic fencing tokens. And most often I'd argue the operation should just be made
> idempotent, which removes the need for the lock's correctness guarantee entirely.

---

**Q5. Your cache hit rate dropped from 95% to 60% overnight and the database is struggling. Diagnose it.**

> I'd check five things in this order, because they're ordered by how quickly they
> distinguish themselves.
>
> `INFO stats` → `evicted_keys`. If it's non-zero and climbing, we're at `maxmemory` and
> Redis is throwing away hot data. Something grew: a new key pattern, a missing TTL, or an
> uncapped stream. `redis-cli --bigkeys` and comparing `used_memory` against last week
> tells me what.
>
> `INFO stats` → `expired_keys`. A spike means TTLs shortened or a bulk load created
> synchronized expiry. Deploy diff will show it.
>
> `INFO keyspace` → total key count. A sudden drop means someone ran `FLUSHDB`, or a
> failover happened and we're serving from a cold replica, or the instance restarted
> without persistence. `uptime_in_seconds` settles that immediately.
>
> Application side: did the **key schema** change? Adding a version prefix or a new field
> to a composite key instantly invalidates 100% of the cache, and it looks exactly like an
> eviction problem. This is more common than eviction in my experience.
>
> Traffic shape: a crawler or a new endpoint enumerating IDs causes **cache penetration** —
> every request is a unique key that doesn't exist, so it never hits, and each one goes to
> the DB. `INFO commandstats` and per-key sampling reveal the pattern.
>
> Immediate mitigation while diagnosing: raise `maxmemory` if there's host headroom, and
> add a short-TTL in-process cache in the app to shield the database. Then fix the root
> cause.

*Interviewer follow-up: "It's cache penetration — a crawler hitting random product IDs. Fix it."*
> Two layers. Cache the negative result: `SET product:<id> NULL EX 60`. Short TTL so a
> genuinely new product isn't masked for long, and it collapses the crawler's load to one
> DB query per unique ID rather than one per request. Then, for the volume, a Bloom filter
> of valid product IDs — `BF.EXISTS` returning 0 means definitely-absent, so we skip both
> Redis and the DB. At 1% false-positive rate that's about 1.2 bytes per ID; 100M IDs is
> ~114 MB. The trade-off is that a standard Bloom filter can't delete, so removed products
> stay "maybe present" and I'd rebuild it nightly, or use a cuckoo filter. And
> orthogonally, rate-limit the crawler — the cache fix treats the symptom.

---

**Q6. When would you NOT use Redis?**

> Several cases, and I'd push back on Redis more often than most people expect.
>
> When it would be the only copy of data I can't lose. `appendfsync everysec` means a
> 1-second loss window on power failure, and replication is asynchronous, so a failover
> loses whatever the primary ACKed but hadn't shipped. Redis is a fantastic accelerator
> and a poor system of record.
>
> When the dataset doesn't fit in RAM. RAM is 20–40x the cost of NVMe. If the working set
> is 20 GB out of 800 GB total, I want a disk database with a 20 GB cache in front of it,
> not an 800 GB Redis.
>
> When I need queries rather than lookups. Redis has no query planner and no secondary
> indexes unless I build and maintain them by hand — and hand-maintained indexes drift.
> "Find all orders in the last hour over $500" is a database question.
>
> When I need durable, replayable messaging with multi-day retention. Streams are good for
> hours-scale work queues, but retention costs RAM. That's Kafka's job.
>
> And a case people miss: when a plain in-process cache would do. If the data is small,
> read-only, and tolerates seconds of staleness — feature flags, a currency table — a
> local map with a 30-second refresh beats Redis on latency (nanoseconds vs. a network
> round trip), on cost, and on failure modes. Reaching for Redis by reflex adds a network
> dependency to something that didn't need one.

*Interviewer follow-up: "You said an in-process cache is faster. Why use Redis at all then?"*
> Three reasons. Consistency across instances — 50 pods with independent local caches see
> 50 different versions of the truth, which is fine for a currency table and unacceptable
> for a permissions check. Capacity — 50 pods each holding a 4 GB local cache is 200 GB of
> duplicated RAM; one Redis holds it once. And shared mutable state — rate limiters, locks,
> counters, and queues are inherently cross-process and can't live in a local map at all.
> In practice the best design is usually *both*: a small local cache with a short TTL in
> front of Redis, which removes the majority of network round trips while Redis remains
> the shared source of truth.

---

## Production Checklist

**Configuration**
- [ ] `maxmemory` set to ~55% of RAM (75% if persistence fully disabled). Never 0.
- [ ] `maxmemory-policy` chosen deliberately; `noeviction` if Redis holds non-regenerable data.
- [ ] `lazyfree-lazy-expire/eviction/server-del/user-del` = yes.
- [ ] `repl-backlog-size` ≥ 128 MB (not the 1 MB default).
- [ ] `slowlog-log-slower-than 10000`, alerted on.
- [ ] `client-output-buffer-limit` set for `normal`, `replica`, `pubsub`; `maxmemory-clients` on Redis 7.
- [ ] `rename-command` for `KEYS`, `FLUSHALL`, `FLUSHDB`; `CONFIG` renamed to a secret.
- [ ] `stop-writes-on-bgsave-error yes`.
- [ ] `replica-read-only yes`.
- [ ] `min-replicas-to-write 1` + `min-replicas-max-lag 10` if data loss matters.

**Host**
- [ ] Transparent huge pages = `never` (enforced at boot, not by hand).
- [ ] `vm.overcommit_memory = 1`.
- [ ] `net.core.somaxconn` ≥ 511; `tcp-backlog` matched.
- [ ] Swap disabled or `swappiness=0`; alert if `mem_fragmentation_ratio < 1.0`.
- [ ] `--intrinsic-latency` baselined so you can tell "Redis is slow" from "this VM is slow".

**Application**
- [ ] Every `SET` has a TTL, or an explicit documented reason not to.
- [ ] No `KEYS`, `SMEMBERS`/`HGETALL`/`LRANGE 0 -1` on unbounded collections, enforced by lint.
- [ ] `SCAN` loops terminate on `cursor === '0'`, not on an empty batch.
- [ ] Locks: unique token + Lua compare-and-delete + a metric on the lost-lock branch.
- [ ] Cache TTLs jittered; single-flight on expensive loaders; negative caching for penetration.
- [ ] `WATCH`/`EXEC` null return handled and retried.
- [ ] Connection pooling; no per-request clients.
- [ ] **The Redis-is-down path is implemented, load-tested, and exercised in CI.**

**Operations**
- [ ] Snapshots taken on a replica, not the primary.
- [ ] Restore from backup tested end to end, on a schedule.
- [ ] Failover tested under production-like load, not just in a quiet window.
- [ ] Alerts on: memory %, fragmentation < 1.0, `evicted_keys`, `rejected_connections`,
      `latest_fork_usec`, `rdb_last_bgsave_status`, replication offset lag, slowlog entries.
- [ ] TLS + `requirepass`/ACLs; Redis bound to a private subnet, never 0.0.0.0 on the internet.

---

**Level:** Senior / Principal | **Format:** Production patterns, failure modes, and the reasoning behind them
