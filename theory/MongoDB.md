# MongoDB - Professional Interview Guide

> Written for engineers who have to defend their schema and scaling decisions in a room
> full of people who have been paged at 3am by a MongoDB cluster. Every section assumes
> you already know what `insertOne` does. Version-specific behaviour is called out because
> "MongoDB does X" is almost always wrong without a version attached.

## Table of Contents

1. [The Document Model, BSON, and the 16MB Wall](#the-document-model-bson-and-the-16mb-wall)
2. [WiredTiger: The Storage Engine You Are Actually Running](#wiredtiger-the-storage-engine-you-are-actually-running)
3. [Indexes: How They Actually Work](#indexes-how-they-actually-work)
4. [The ESR Rule and Compound Index Order](#the-esr-rule-and-compound-index-order)
5. [Reading explain("executionStats") Like a Senior](#reading-explainexecutionstats-like-a-senior)
6. [Data Modeling: The Decision Framework](#data-modeling-the-decision-framework)
7. [Schema Design Patterns That Earn Their Keep](#schema-design-patterns-that-earn-their-keep)
8. [Aggregation Framework Deep Dive](#aggregation-framework-deep-dive)
9. [Replication: Replica Sets, Elections, and the Oplog](#replication-replica-sets-elections-and-the-oplog)
10. [Write Concern and Read Concern: The Durability Ladder](#write-concern-and-read-concern-the-durability-ladder)
11. [Sharding: The Decision You Cannot Take Back](#sharding-the-decision-you-cannot-take-back)
12. [Transactions: The Real Cost](#transactions-the-real-cost)
13. [Performance Engineering](#performance-engineering)
14. [Security](#security)
15. [MongoDB vs PostgreSQL: The Honest Comparison](#mongodb-vs-postgresql-the-honest-comparison)
16. [Production War Stories](#production-war-stories)
17. [Common Pitfalls](#common-pitfalls)
18. [Junior vs Senior](#junior-vs-senior)
19. [Interview Questions with Model Answers](#interview-questions-with-model-answers)
20. [Production Wisdom (10+ Years)](#production-wisdom-10-years)

---

## The Document Model, BSON, and the 16MB Wall

### What MongoDB actually is

MongoDB is a distributed document database. Data lives in **BSON** documents inside
**collections** inside **databases**. The unit of atomicity is the **single document** —
everything else (multi-document transactions, causal consistency) is machinery built on top
of that one guarantee.

The thing people get wrong: "schema-less" is a lie you tell in a demo. MongoDB has no
*enforced* schema by default, but your application has a schema. It lives in your code,
your validators, and your indexes. The real difference from PostgreSQL is not the absence
of schema, it is **where the schema is enforced and how cheaply it changes**.

```
Relational                          Document
────────────                        ────────────
Database                            Database
  └── Table                           └── Collection
        └── Row                             └── Document (BSON, ≤16MB)
              └── Column                          └── Field (typed, can nest)

Schema enforced by:                 Schema enforced by:
  DDL, at write time,                 $jsonSchema validator (opt-in),
  for every row, always               application code, ODM (Mongoose)

Cost of adding a column:            Cost of adding a field:
  ALTER TABLE — table rewrite or      Zero. Write the new field.
  metadata-only depending on          Old documents simply lack it.
  version and column type             Your code must handle both shapes.
```

That last row is the entire value proposition and the entire trap. Adding a field is free.
*Knowing which of the eleven shapes a document might be in* is not free, and that cost
compounds for years. The senior move is the schema versioning pattern (covered later) —
you pay a small explicit cost so you never pay the large implicit one.

### BSON

BSON is a binary serialization format. It is not "JSON but faster" — it is a different
thing that happens to map onto JSON.

What BSON adds over JSON:

| BSON type | Why it exists | Gotcha |
|---|---|---|
| `ObjectId` (12 bytes) | Compact, roughly sortable, generated client-side | Sorts by creation time — this is why `_id` makes a *terrible* shard key |
| `Date` (int64 ms since epoch) | Real temporal type, UTC | No timezone stored. Ever. Store the tz separately if you need it |
| `Decimal128` (16 bytes, IEEE 754) | Exact decimal arithmetic | Use for money. `Double` for money is how you get $0.30000000000000004 |
| `Int32` / `Int64` | Space and correctness | JS drivers coerce to `Double` unless you are explicit — `NumberLong()` |
| `Binary` (with subtype) | Blobs, UUIDs, encrypted fields | UUID subtype 3 vs 4 mismatch is a classic cross-driver bug |
| `Timestamp` (internal) | Oplog ordering | **Not** for application data. Different from `Date` |
| `MinKey` / `MaxKey` | Chunk range boundaries | You will see these in `sh.status()` output |

BSON is **length-prefixed**, which is the design decision that matters most. Every document
and every subdocument stores its byte length up front. That is what makes it possible to
skip over a 4KB embedded array without parsing it, and it is why field *order* is preserved
and significant — `{a:1, b:2}` and `{b:2, a:1}` are different BSON byte strings, and
`db.c.find({doc: {a:1, b:2}})` (whole-subdocument equality match) will not match the second.

```javascript
// ❌ WRONG: exact subdocument match is order-sensitive and brittle
db.users.find({ address: { city: "NYC", zip: "10001" } })
// Misses any document written as { zip: "10001", city: "NYC" }
// Misses any document that also has address.country

// ✅ CORRECT: dot-notation field matching
db.users.find({ "address.city": "NYC", "address.zip": "10001" })
```

BSON is also *larger* than the equivalent JSON in most cases (type bytes, field names
repeated in every document). Field names are stored verbatim in every single document.
On a 500M-document collection, renaming `transactionTimestamp` (22 bytes) to `ts` (2 bytes)
saves 20 bytes × 500M = **10GB on disk before compression**. This is a real optimization at
scale and a premature one below ~50M documents.

### ObjectId: the 12 bytes

```
ObjectId("507f1f77bcf86cd799439011")
         └──────┘└────────┘└────┘
          4 bytes  5 bytes  3 bytes
          Unix ts  random   counter
          (secs)   per-     (incrementing,
                   process  random seed)

Pre-3.4 layout was: 4 ts | 3 machine | 2 pid | 3 counter
Changed in 3.4 to 4 ts | 5 random | 3 counter — do not rely on
extracting machine ID from an ObjectId. That code exists. It is wrong.
```

Consequences you should be able to state in an interview:

1. **Generated client-side by the driver.** Inserts do not need a round trip to get an ID.
   This is genuinely nice — you can build an object graph with valid IDs before writing.
2. **Monotonically increasing at second granularity.** `sort({_id: -1})` is a cheap
   "newest first". `ObjectId().getTimestamp()` gives you a creation time for free, so you
   often do not need a separate `createdAt` (you do need one if you care about sub-second
   ordering or if IDs might be back-filled).
3. **It is the worst possible shard key.** All new writes have adjacent `_id` values, so
   they all land in the highest chunk, so they all hit one shard. See the sharding section.
4. Only 3 bytes of counter — 16.7M documents per second per process before collision risk.
   Not your problem.

### The 16MB document limit

The hard limit on a single BSON document is 16,777,216 bytes. It has been 16MB since 2009
and MongoDB Inc. has been extremely clear it is not moving.

**Why the limit exists** (the answer interviewers want):
- It bounds memory per operation. The server must materialize the whole document to
  return, update, or replicate it. Without a cap, one document could exhaust the WiredTiger
  cache or a driver's heap.
- It bounds network transfer per document — the wire protocol allocates a buffer.
- It is a **design forcing function**. If your document is approaching 16MB, your data model
  is wrong. The limit surfaces the problem in staging instead of letting you build a system
  whose per-document cost silently grows for three years.

**What the limit actually forces you to do:**

```
Design pressure created by 16MB
───────────────────────────────────────────────────────────
Unbounded array          →  must bucket, or move to its own collection
Blob storage             →  GridFS, or (better) S3 + a URL in the document
Full audit log per user  →  separate collection, indexed by userId
Nested comment threads   →  separate collection with a parent reference
"One giant config doc"   →  split by domain, version it
```

The failure mode is not "we hit 16MB on day one". It is: the array grows 3 entries a day
for two years, then one document crosses the line and **every single write to that document
starts failing** while reads keep working, so your monitoring does not fire and your users
see silently dropped data.

```javascript
// ❌ WRONG: unbounded array. This is the single most common MongoDB modeling failure.
// events array grows forever. At ~200 bytes/event, this document dies at ~80,000 events.
db.users.updateOne(
  { _id: userId },
  { $push: { events: { type: "page_view", url, ts: new Date() } } }
);
// Failure at scale, in order of appearance:
//   1. Document grows past the WiredTiger page size → every update rewrites the whole doc
//   2. Any find({_id}) pulls 12MB over the wire even if you only wanted the email
//   3. Updates hold the document-level write lock longer, contention climbs
//   4. Replication lag grows (each oplog entry carries the delta, but doc moves are heavy)
//   5. At 16,777,217 bytes: "BSONObjectTooLarge" — writes fail, reads succeed. Silent.

// ✅ CORRECT (option A): separate collection, the boring right answer
db.user_events.insertOne({ userId, type: "page_view", url, ts: new Date() });
db.user_events.createIndex({ userId: 1, ts: -1 });
// Unbounded growth is now unbounded *document count*, which MongoDB handles fine.

// ✅ CORRECT (option B): capped array — keep only the last N, for a "recent activity" UI
db.users.updateOne(
  { _id: userId },
  { $push: { recentEvents: { $each: [event], $slice: -50, $sort: { ts: -1 } } } }
);
// Document size is now bounded by construction: 50 × ~200B = 10KB. Provably safe.

// ✅ CORRECT (option C): bucket pattern — amortize document overhead for time series
db.event_buckets.updateOne(
  { userId, bucketDate: startOfHour, count: { $lt: 500 } },   // the $lt is the bound
  { $push: { events: event }, $inc: { count: 1 }, $setOnInsert: { userId, bucketDate } },
  { upsert: true }
);
// Each bucket holds ≤500 events. New bucket auto-created when full.
// 500× fewer documents than option A, 500× fewer index entries, still bounded.
```

**Numbers to have in your head:** a "reasonable" document is 1–16KB. Above ~100KB you should
have a specific reason. Above 1MB you are almost certainly doing something wrong. The
practical read latency cliff arrives long before 16MB, because WiredTiger's default leaf
page is 32KB — a document larger than that spans multiple pages and gets rewritten
wholesale on every update.

### Checking for the problem before it pages you

```javascript
// Find your largest documents (run on a secondary — it's a COLLSCAN)
db.users.aggregate([
  { $project: { size: { $bsonSize: "$$ROOT" }, arrayLen: { $size: { $ifNull: ["$events", []] } } } },
  { $sort: { size: -1 } },
  { $limit: 20 }
], { allowDiskUse: true });
// $bsonSize requires 4.4+. Before that: Object.bsonsize() in a shell loop.

// Collection-level shape
db.users.stats();
//   count, size (uncompressed BSON), storageSize (compressed on disk),
//   avgObjSize  ← watch this metric over time, alert if it trends up
//   totalIndexSize, indexSizes { name: bytes }  ← the number people forget

// Enforce the bound in the database, not just in code (3.6+)
db.runCommand({
  collMod: "users",
  validator: { $jsonSchema: {
    bsonType: "object",
    properties: { recentEvents: { bsonType: "array", maxItems: 50 } }
  }},
  validationLevel: "moderate",  // "strict" also validates updates to pre-existing bad docs
  validationAction: "error"     // "warn" logs and allows — use this first to find offenders
});
```

---

## WiredTiger: The Storage Engine You Are Actually Running

WiredTiger has been the default since MongoDB 3.2 and the *only* supported engine since 4.2
(MMAPv1 and the in-memory engine for community builds are gone). If you cannot explain
WiredTiger, you cannot explain MongoDB performance.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            mongod process                                    │
│                                                                              │
│   Client ops ──> Query Layer ──> WiredTiger API                              │
│                                       │                                      │
│   ┌───────────────────────────────────▼──────────────────────────────────┐   │
│   │                     WiredTiger Cache (in RAM)                        │   │
│   │           default: max( 50% × (RAM − 1GB), 256MB )                   │   │
│   │                                                                      │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌──────────────────────────┐     │   │
│   │   │ Collection  │  │   Index     │  │  Dirty pages (modified,  │     │   │
│   │   │ B-tree pages│  │ B-tree pages│  │  not yet checkpointed)   │     │   │
│   │   │ UNCOMPRESSED│  │ prefix-comp │  │  eviction target: 5%     │     │   │
│   │   └─────────────┘  └─────────────┘  └──────────────────────────┘     │   │
│   │                                                                      │   │
│   │   MVCC: each txn gets a point-in-time snapshot. Readers never        │   │
│   │   block writers, writers never block readers. Write-write conflict   │   │
│   │   on the same document → WT_ROLLBACK → server retries transparently  │   │
│   │   for single-doc ops, surfaces as TransientTransactionError for txns │   │
│   └───────┬──────────────────────────────────────────────┬───────────────┘   │
│           │ eviction (clean: drop, dirty: write)         │ every 60s          │
│           │ triggers at 80% used / 5% dirty              │ (checkpoint)       │
│           ▼                                              ▼                    │
│   ┌───────────────────────┐                    ┌──────────────────────┐      │
│   │  Journal (WAL)        │                    │  Checkpoint          │      │
│   │  compressed: snappy   │                    │  consistent snapshot │      │
│   │  fsync every 100ms,   │                    │  of ALL data files   │      │
│   │  or immediately on    │                    │  written to disk     │      │
│   │  j:true               │                    │                      │      │
│   └───────────┬───────────┘                    └──────────┬───────────┘      │
└───────────────┼───────────────────────────────────────────┼──────────────────┘
                ▼                                           ▼
      ┌──────────────────────────────────────────────────────────────┐
      │              OS Filesystem Cache (the other ~50% of RAM)     │
      │              holds COMPRESSED blocks — snappy by default     │
      └──────────────────────────────────────────────────────────────┘
                                    ▼
      ┌──────────────────────────────────────────────────────────────┐
      │   Disk: collection-*.wt, index-*.wt, _mdb_catalog.wt,        │
      │         journal/WiredTigerLog.*                              │
      └──────────────────────────────────────────────────────────────┘
```

### Document-level concurrency

Pre-3.0 (MMAPv1) MongoDB had a **collection-level** write lock, and before 2.2 a
**database-level** one. That is where MongoDB's bad performance reputation comes from, and
it has been false for a decade. WiredTiger gives you **document-level** concurrency via
optimistic MVCC:

- Every operation runs inside a WiredTiger transaction with a consistent snapshot.
- Two writers touching *different* documents never conflict.
- Two writers touching the *same* document: one wins, the other gets `WT_ROLLBACK`. For a
  normal single-document update, mongod retries internally and you never see it. Inside a
  multi-document transaction, you get a `TransientTransactionError` and **you** must retry.

There is still a global concurrency limit, and it is the thing that actually bites:

```javascript
db.serverStatus().wiredTiger.concurrentTransactions
// {
//   write: { out: 128, available: 0,  totalTickets: 128 },   ← SATURATED
//   read:  { out: 47,  available: 81, totalTickets: 128 }
// }
```

**Read/write tickets.** MongoDB admits at most 128 concurrent read and 128 concurrent write
storage-engine operations by default. When `available: 0`, every additional operation
**queues**, and your p99 latency goes vertical while CPU sits at 40%. This is the single
most misread MongoDB symptom: "the server isn't busy but everything is slow".

- Pre-7.0: fixed at 128/128, tunable via `wiredTigerConcurrentReadTransactions` /
  `...WriteTransactions`. **Raising it is almost always wrong** — tickets exist to prevent
  cache thrash. If you are ticket-starved, your queries are too slow (missing index) or your
  disk is too slow, and adding tickets makes both worse.
- 7.0+: dynamic concurrency control (execution control) tunes the ticket pool automatically
  based on observed throughput. It can go above 128. You still monitor the same counter.

The correct response to ticket exhaustion is, in order: (1) find the slow query with the
profiler, (2) index it, (3) check disk IOPS/latency, (4) add RAM, (5) shard. Never start
at (5), and only touch the ticket count if MongoDB support tells you to.

### The cache: the number that matters most

```
Default WiredTiger cache = max( 0.5 × (RAM_total − 1GB), 256MB )

  64GB machine  →  0.5 × 63GB   = 31.5GB cache
  16GB machine  →  0.5 × 15GB   =  7.5GB cache
   4GB machine  →  0.5 × 3GB    =  1.5GB cache
   1GB machine  →  max(0, 256MB) = 256MB   (the floor kicks in)

Explicitly: storage.wiredTiger.engineConfig.cacheSizeGB
```

Why only 50%? Because the *other* half is deliberately left to the OS filesystem cache. Data
sits **uncompressed** in the WT cache and **compressed** in the filesystem cache. That means
your effective cached working set is larger than your WT cache alone — with typical 3–4×
snappy compression on JSON-ish data, 31.5GB of WT cache plus 31.5GB of FS cache holding
compressed blocks can cover well over 100GB of logical data.

**Running MongoDB in a container?** This is where people get burned. Older MongoDB versions
read the *host's* RAM, not the cgroup limit, and size the cache accordingly. A 4GB container
on a 256GB host would compute a 127GB cache, balloon, and get OOM-killed by the kernel.
Modern versions (4.0.9+/3.6.13+) are cgroup-aware, but **always set `cacheSizeGB` explicitly
in a container** and set the container memory limit to roughly `cacheSizeGB × 2 + 1GB`.

Cache metrics you actually watch:

```javascript
const c = db.serverStatus().wiredTiger.cache;
c["bytes currently in the cache"] / c["maximum bytes configured"]     // want < 0.80
c["tracked dirty bytes in the cache"] / c["maximum bytes configured"] // want < 0.05
c["pages read into cache"]      // rising fast = working set exceeds cache = disk-bound
c["pages requested from the cache"]
// cache hit ratio ≈ 1 − (pages read into cache / pages requested from the cache)
// Healthy OLTP: > 0.99. Below 0.95 you are I/O bound and it will show in p99.
c["pages evicted by application threads"]  // ← MUST be ~0
```

That last one is the alarm bell. Normally a background eviction thread frees pages. When the
cache blows past its eviction targets, **application threads are conscripted into doing
eviction work themselves** — your query now pauses to evict pages before it can proceed.
Latency doubles or worse, and it looks like a mystery. Non-zero
`pages evicted by application threads` means: your working set does not fit, or you have a
long-running transaction/snapshot pinning old versions in cache.

### Checkpoints and the journal

Two independent durability mechanisms; people constantly conflate them.

**Checkpoint** — every **60 seconds** (or every 2GB of journal, whichever first), WiredTiger
writes a consistent snapshot of all data files. A checkpoint is atomic: it either fully
lands or the previous one remains valid. If mongod is `kill -9`'d, the data files on disk
are always at some valid checkpoint. Checkpoints cause a periodic I/O spike; on
under-provisioned disks you can literally see a 60-second sawtooth in write latency.

**Journal (write-ahead log)** — covers the gap between checkpoints. Every write is appended
to the journal (snappy-compressed) before it is acknowledged as durable.

- Journal is fsynced **every 100ms** by default (`storage.journal.commitIntervalMs`), or
- **immediately** when a write uses `{ j: true }`, or
- when the in-memory journal buffer fills.

So: `{w: 1}` with default journaling means a crash within the last 100ms can lose your write
**on that node**. `{w: 1, j: true}` means it is on that node's disk. `{w: "majority"}` means
it survives that node dying entirely. These are three different guarantees and interviewers
will make you distinguish them. (Since 5.0, `w: "majority"` implies `j: true` on the majority
of nodes by default via `writeConcernMajorityJournalDefault`.)

Since 4.0, WiredTiger keeps a "stable timestamp" and can **roll back to a checkpoint without
a full resync** — this is what makes replica-set rollback cheap and bounded now. Pre-4.0
rollbacks wrote `.bson` files into a rollback directory and were genuinely painful.

### Compression

| What | Default | Alternatives | Notes |
|---|---|---|---|
| Collection data | `snappy` (block) | `zlib`, `zstd` (4.2+), `none` | zstd: ~15–25% better ratio than snappy at similar CPU. Best default in 2020s |
| Indexes | prefix compression | `none` | Prefix compression is why compound indexes with a low-cardinality leading field are cheap on disk |
| Journal | `snappy` | `zlib`, `zstd`, `none` | |

```javascript
// Set at creation — cannot be changed later without a rewrite
db.createCollection("events", {
  storageEngine: { wiredTiger: { configString: "block_compressor=zstd" } }
});
```

Real numbers on typical JSON-shaped data: snappy gives ~3× (500GB logical → ~165GB on disk),
zstd ~4–5×. Compression is CPU for disk, and on modern NVMe the CPU is usually the scarcer
resource — but zstd's ratio also means **more of your data fits in the filesystem cache**,
which frequently makes it a net win on latency, not just on disk cost.

Everything in the WT cache is **uncompressed**. So compression does not increase your
in-cache working set; it increases the OS-page-cache-backed second tier and cuts your disk
bill and your I/O bandwidth.

---

## Indexes: How They Actually Work

Every MongoDB index is a **B+ tree** (WiredTiger's row-store B-tree) mapping index keys to
`RecordId`s. There is one index every collection always has: `{_id: 1}`, unique, and it
cannot be dropped. (Exception: clustered collections, 5.3+, where documents are physically
stored in `_id` order and the `_id` index *is* the collection.)

```
                        Index: { status: 1, createdAt: -1 }

                          ┌─────────────────────────────┐
              ROOT        │  ["active",…] │ ["shipped",…] │      (internal page,
              (in cache)  └───────┬───────┴───────┬───────┘       32KB default)
                                  │               │
             ┌────────────────────┘               └────────────────┐
             ▼                                                     ▼
   ┌──────────────────────┐                            ┌──────────────────────┐
   │ INTERNAL             │                            │ INTERNAL             │
   │ active|2026-08-30    │                            │ shipped|2026-08-30   │
   │ active|2026-08-15    │                            │ shipped|2026-07-01   │
   └────┬──────────┬──────┘                            └──────────┬───────────┘
        ▼          ▼                                              ▼
 ┌────────────┐ ┌────────────┐                          ┌────────────────┐
 │ LEAF       │ │ LEAF       │  ──────sibling ptr────▶   │ LEAF           │
 │ key → RID  │ │ key → RID  │                          │ key → RID      │
 │ a|08-30→17 │ │ a|08-15→02 │                          │ s|08-30→91     │
 │ a|08-29→44 │ │ a|08-14→88 │                          │ s|08-29→12     │
 └─────┬──────┘ └────────────┘                          └────────────────┘
       │ RecordId
       ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │  Collection B-tree (data files): RecordId → full BSON document         │
 │  ← this hop is the FETCH stage in explain(). It is a separate random   │
 │    read. Avoiding it is what "covered query" means.                    │
 └────────────────────────────────────────────────────────────────────────┘

Key facts:
  • Leaves are linked → range scans and sorted output are sequential walks
  • Depth is ~3–4 levels even for 100M+ keys (high fanout, ~hundreds of keys/page)
  • Internal pages are small and stay hot in cache; leaves are the I/O cost
  • Prefix compression: "active|2026-08-30" and "active|2026-08-15" share
    the "active|2026-08-" prefix on disk. Low-cardinality leading fields are cheap.
  • Keys sort by BSON type first, then value. This is why {x: 1} and {x: "1"}
    are different index entries and why $type matters.
```

### Index types, and when each is the right answer

**1. Single field** — `db.users.createIndex({ email: 1 })`

Direction is irrelevant for a single-field index: MongoDB can walk a B-tree backwards, so
`{email: 1}` serves `sort({email: -1})` perfectly. Direction only matters in compound
indexes, and only relative to the other fields.

**2. Compound** — `db.orders.createIndex({ customerId: 1, status: 1, createdAt: -1 })`

Max 32 fields. Obeys the **prefix rule**: this index serves queries on
`{customerId}`, `{customerId, status}`, `{customerId, status, createdAt}` — and *not*
`{status}` or `{createdAt}` alone. Field order is the entire game; see the ESR section.

**3. Multikey** (automatic on any array field) — `db.posts.createIndex({ tags: 1 })`

MongoDB creates **one index entry per array element**. A document with 50 tags produces 50
index entries. Consequences seniors are expected to know:

- Index size scales with total array elements, not document count. 10M posts × 20 tags =
  200M index entries, not 10M.
- **You cannot create a compound index on two array fields.** `{tags: 1, comments: 1}` where
  both are arrays fails at creation (or at insert of the first doc that makes both multikey)
  — the cartesian product would explode. This constraint bites at insert time, not create
  time, which makes it a surprise.
- Multikey indexes **cannot cover a query** (the index entry does not tell you the whole
  array), and they cannot be used to sort on the array field in the way you expect.
- `$elemMatch` is required when you want *a single element* to satisfy multiple conditions:

```javascript
// Documents: { _id: 1, scores: [ {subj: "math", v: 90}, {subj: "art", v: 40} ] }

// ❌ WRONG: matches the doc above! "some element has subj:math" AND
//    "some element has v:{$gt:80}" — satisfied by two DIFFERENT elements.
db.students.find({ "scores.subj": "math", "scores.v": { $gt: 80 } })

// ✅ CORRECT: one element must satisfy both
db.students.find({ scores: { $elemMatch: { subj: "math", v: { $gt: 80 } } } })
db.students.createIndex({ "scores.subj": 1, "scores.v": 1 })   // supports it
```

**4. Text** — `db.articles.createIndex({ title: "text", body: "text" }, { weights: {title: 10} })`

One text index per collection, maximum. Stemming and stop-words are language-specific. It is
adequate for "search this small corpus" and inadequate for anything a user would call
"search" — no relevance tuning worth the name, no fuzzy matching, no faceting, no
highlighting, no synonyms. If search is a product feature, use Atlas Search (Lucene, and
genuinely good) or Elasticsearch. Saying this in an interview is a strong signal.

**5. Geospatial** — `2dsphere` (GeoJSON, earth-like sphere) or `2d` (legacy flat plane)

```javascript
db.places.createIndex({ location: "2dsphere" });
db.places.find({ location: { $near: {
  $geometry: { type: "Point", coordinates: [-73.97, 40.77] },  // [lng, lat] — ALWAYS this order
  $maxDistance: 5000, $minDistance: 0 }}});
```
`[longitude, latitude]`. Every engineer gets this backwards once, ships it, and discovers
their New York stores are in the Indian Ocean. `$near` returns results **sorted by distance**
and cannot be combined with a different `$sort`; use `$geoNear` (must be the first
aggregation stage) when you need to do more.

**6. Partial** (3.2+) — index only the documents you query

```javascript
db.orders.createIndex(
  { createdAt: -1 },
  { partialFilterExpression: { status: { $in: ["pending", "processing"] } } }
);
```
If 2% of your 500M orders are open, this index has 10M entries instead of 500M — roughly
**300MB instead of 15GB**, so it stays resident in cache while the full index would not.
Catch: the planner only uses a partial index if it can *prove* the query is a subset of the
filter expression. `find({status: "pending"}).sort({createdAt: -1})` uses it;
`find({}).sort({createdAt: -1})` does not, silently. Always `explain()` after adding one.

**7. Sparse** — skips documents missing the field. Largely superseded by partial indexes,
which are strictly more expressive. Still relevant for one classic combination:

```javascript
// Unique BUT allow many documents with no ssn at all
db.users.createIndex({ ssn: 1 }, { unique: true, sparse: true });
// Without sparse, the second document lacking ssn collides on the null key.
// Modern equivalent, and clearer about intent:
db.users.createIndex({ ssn: 1 }, { unique: true,
  partialFilterExpression: { ssn: { $exists: true, $type: "string" } } });
```
Warning: a sparse index cannot be used to satisfy a sort that needs every document, because
the index does not contain every document. The planner knows this; you should too.

**8. TTL** — background deletion

```javascript
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// expireAfterSeconds: 0 + a per-document absolute date = precise per-document expiry.
// This is the pattern you want; the "createdAt + 3600" form gives every doc the same TTL.
```
Reality of TTL indexes:
- A background thread (`TTLMonitor`) wakes **every 60 seconds**. Deletion is not prompt —
  a document can live up to 60s past expiry, longer under load. Never rely on TTL for
  security or correctness ("the token is deleted so it can't be used" — no, check it).
- Deletes are **real deletes**: oplog entries, index maintenance, replication traffic. A TTL
  index removing 5M docs/day is 5M oplog entries/day competing with your real writes.
- The field must be a `Date` or an array of Dates. A string timestamp is silently ignored
  and nothing ever expires. This bug ships to production constantly.
- Only runs on the **primary**; secondaries expire via the oplog.
- For very high volume expiry, **time-series collections** (5.0+) or dropping whole
  daily/monthly collections beats TTL by a wide margin — `drop()` is O(1), TTL is O(n).

**9. Hashed** — `db.users.createIndex({ userId: "hashed" })`

Indexes `md5(BSON(value))` truncated to 64 bits. Its only real purpose is as a shard key
for even distribution. It supports **equality only** — no ranges, no sorts. Since 4.4 you
can build a *compound* hashed index (exactly one hashed field), which enables shard keys
like `{userId: "hashed", createdAt: 1}`.

**10. Wildcard** (4.2+) — `db.c.createIndex({ "attributes.$**": 1 })`

Indexes every field under a subtree. Genuinely useful for user-defined-attribute documents
where you cannot enumerate keys in advance. It is a **last resort**, not a shortcut: it
cannot support a compound query on two arbitrary fields, cannot cover queries, and the index
is large. If you find yourself reaching for a wildcard index on your main collection, your
schema is telling you something. Prefer the Attribute Pattern.

**11. Unique** — enforced per shard-key-range on sharded collections, which is a trap:
a unique index on a sharded collection is only globally unique if the unique index's key is
a prefix of the shard key. Otherwise MongoDB cannot enforce it and will refuse to create it.
Enforcing global uniqueness on a non-shard-key field in a sharded cluster requires an
external mechanism (a separate unsharded "reservation" collection).

### The cost of indexes on writes

This is the number nobody measures and everybody should.

```
Every insert  = 1 collection write + N index writes  (N = number of indexes)
Every update  = 1 collection write + K index writes  (K = indexes on CHANGED fields)
Every delete  = 1 collection write + N index writes  (all of them, always)

Concretely, on a collection with 12 indexes:
  An insert does 13 B-tree modifications, each potentially a page split,
  each generating journal + oplog + cache-dirty pages.

Measured shape (NVMe, single replica set, ~1KB docs):
  1 index   →  ~45,000 inserts/sec
  5 indexes →  ~22,000 inserts/sec
  12 indexes → ~9,000 inserts/sec
  20 indexes → ~5,000 inserts/sec   (also: 64 is the hard cap per collection)
```

The pathology is *unused* indexes: full write cost, zero read benefit, and they consume the
cache that your real indexes need. Find them:

```javascript
db.orders.aggregate([{ $indexStats: {} }]).forEach(i =>
  print(i.name, i.accesses.ops, i.accesses.since));
// ops === 0 since a date well before your last deploy → candidate for removal.
// CAVEATS before you drop:
//   1. $indexStats resets on mongod restart — check uptime first
//   2. It is per-node. Check EVERY member; secondaries serve different queries
//   3. Quarterly/annual reports may be the only user of an index. Ask.
//   4. Unique indexes may exist for CONSTRAINTS, not queries. ops:0 is expected.
// Safe removal: db.orders.hideIndex("name") (4.4+) makes it invisible to the planner
// but keeps it maintained. Watch for a week. If nothing breaks, drop it. Unhide is instant.
```

### Index size math you should be able to do on a whiteboard

```
Rough per-entry cost ≈ key bytes + ~12–16 bytes (RecordId + B-tree overhead),
then multiply by ~0.5–0.8 for prefix compression on low-cardinality prefixes.

Example: 50M orders
  { _id: 1 }                     12B key + 14B  ≈  26B × 50M ≈ 1.3 GB
  { customerId: 1 }              12B + 14B      ≈  26B × 50M ≈ 1.3 GB
  { email: 1 }                   ~30B + 14B     ≈  44B × 50M ≈ 2.2 GB
  { status: 1, createdAt: -1 }   ~10B + 8B + 14B ≈ 32B × 50M ≈ 1.6 GB
                                     (prefix compression on `status` → ~1.0 GB actual)
  { tags: 1 } multikey, 8 tags/doc                26B × 400M ≈ 10.4 GB  ← the surprise

  Total index footprint ≈ 16–17 GB

Now: does that fit in your WiredTiger cache alongside the hot documents?
On a 32GB machine (15.5GB cache) — no. You are already disk-bound on index lookups
before a single document is fetched. THIS is the calculation that should drive your
instance sizing, and almost nobody does it.
```

### Building indexes without taking an outage

```javascript
// MongoDB 4.2+ : one build type, "simultaneous index build".
db.orders.createIndex({ customerId: 1, createdAt: -1 });
// Holds an exclusive lock only at the START and END of the build (seconds).
// The bulk of the build is concurrent with reads and writes.
// { background: true } is accepted and IGNORED — it is a no-op since 4.2, removed in 5.0.

// Pre-4.2 (if you are still there — and people are):
//   { background: false } (default) → EXCLUSIVE DATABASE LOCK for the whole build.
//                                     On 50M docs this is 20–40 minutes of total outage.
//   { background: true }            → yields, does not block, but is 2–5× slower and
//                                     still murders performance via cache pressure.
```

**Even on 4.2+, do rolling index builds on large production collections.** The build reads
every document — that alone evicts your entire working set from the WT cache, and your
p99 latency triples for the duration even though nothing is "locked".

```
Rolling index build (the operationally correct procedure)
──────────────────────────────────────────────────────────
 for each SECONDARY, one at a time:
   1. rs.stepDown() if it is somehow primary
   2. Stop mongod; restart it as a standalone on a different port,
      with replication disabled (no --replSet)
   3. createIndex() — full speed, zero production impact, no oplog
   4. Stop; restart with --replSet; let it catch up from the oplog
   5. Verify rs.status() shows SECONDARY and lag ≈ 0 before moving on
 finally:
   6. rs.stepDown() the primary, let a fully-indexed secondary take over
   7. Repeat 1–5 on the old primary

 Critical precondition: the oplog window must exceed the build time on one node,
 or step 4 turns into a full initial sync. Check first:
   rs.printReplicationInfo()   // "oplog first event time" → "last event time"
```

Also: `createIndexes` on 4.4+ uses a **majority commit quorum** — the index is not ready
until a majority of voting members have finished building it. A single stuck secondary can
therefore stall an index build cluster-wide. `commitQuorum: "votingMembers"` is the default;
you can lower it (`commitQuorum: 1`) if you know what you are doing.

---

## The ESR Rule and Compound Index Order

If you learn one thing from this document, learn this. Compound index field order is the
highest-leverage, most-frequently-botched decision in MongoDB, and "put the most selective
field first" — which is what most people say — **is wrong**.

### The rule

> **E**quality first, then **S**ort, then **R**ange.

For a given query, order the compound index fields as:
1. Fields tested with **exact equality** (`$eq`, `$in` with few values)
2. Fields used in the **`$sort`**
3. Fields tested with a **range** (`$gt`, `$gte`, `$lt`, `$lte`, `$ne`, `$in` over a range)

### Why — the mechanical explanation

A B-tree gives you **one contiguous scan range**. Everything before the first non-equality
predicate narrows that range to a single point; everything after it is a walk.

```
Query:  find({ status: "active", age: { $gt: 25 } }).sort({ createdAt: 1 })

── Index A: { status: 1, createdAt: 1, age: 1 }  ← ESR: Equality, Sort, Range ✅

   status="active" pins the leading value. Within that pinned prefix, index
   entries are ALREADY IN createdAt ORDER. Walk them in order, discard those
   failing age>25 as you go, stop as soon as you have your limit.

   ┌─ status="active" ───────────────────────────────────────────────┐
   │ createdAt=Jan|age=22 → skip                                     │
   │ createdAt=Feb|age=31 → EMIT (already in sort order)             │
   │ createdAt=Mar|age=19 → skip                                     │
   │ createdAt=Apr|age=44 → EMIT                    ...stop at limit │
   └─────────────────────────────────────────────────────────────────┘
   Result: IXSCAN → FETCH → LIMIT.  NO SORT stage. Bounded work.

── Index B: { status: 1, age: 1, createdAt: 1 }  ← Range before Sort ❌

   status="active" pins the prefix. age>25 opens a RANGE. Inside that range,
   createdAt restarts from scratch for every distinct age value:

   ┌─ status="active" ───────────────────────────────────────────────┐
   │ age=26 | createdAt: Jan, Mar, Nov  ┐                            │
   │ age=27 | createdAt: Feb, Jun       │ createdAt is interleaved   │
   │ age=28 | createdAt: Jan, Dec       │ across ages — NOT globally │
   │ ...                                ┘ sorted                     │
   └─────────────────────────────────────────────────────────────────┘
   Result: IXSCAN → FETCH → SORT (blocking, in-memory, 32MB cap for find()).
   The server must materialize EVERY matching document before returning ONE.
   With 2M matches: "Sort exceeded memory limit of 33554432 bytes" or a
   multi-second stall. Your .limit(20) saved you nothing.
```

That is the whole insight: **a blocking `SORT` stage destroys the benefit of `limit()`**,
because the server cannot know which 20 documents are first until it has seen all of them.
ESR exists to eliminate the SORT stage.

### Why "most selective first" is wrong

Selectivity is the relational instinct and it misleads here. Consider
`find({ status: "shipped", userId: 12345 })` where `status` has 5 values (terrible
selectivity) and `userId` has 10M values (superb selectivity).

Both `{status: 1, userId: 1}` and `{userId: 1, status: 1}` are **equality-only** and both
resolve to a single point lookup in the B-tree. Selectivity order changes essentially
nothing for the query. What it *does* change:

- `{status: 1, userId: 1}` compresses better (prefix compression on the repeated
  low-cardinality `status` value) — a smaller index, more of it resident in cache.
- `{userId: 1, status: 1}` also serves `find({userId})` alone via the prefix rule.
  `{status: 1, userId: 1}` serves `find({status})` alone, which you probably never run.

So the tiebreaker among equality fields is **index reuse via the prefix rule**, not
selectivity. Selectivity only becomes the deciding factor once you are choosing between two
indexes that are otherwise ESR-equivalent.

### Worked example: designing the index for a real query set

```javascript
// The endpoint: "user's orders, filterable by status, newest first, paginated"
db.orders.find({ userId: 7, status: "shipped", total: { $gte: 100 } })
         .sort({ createdAt: -1 }).limit(20);

// ❌ WRONG #1: the "index every field individually" approach
db.orders.createIndex({ userId: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });
db.orders.createIndex({ total: 1 });
// The planner picks ONE (index intersection is rare, see below). Best case it uses
// {userId:1}, fetches all 4,000 of that user's orders, filters in memory, then SORTs.
//   totalDocsExamined 4000 / nReturned 20 = 200:1.  ~180ms. Four indexes' write cost.

// ❌ WRONG #2: ordered by "selectivity" (the relational instinct)
db.orders.createIndex({ userId: 1, total: 1, status: 1, createdAt: -1 });
// total is a RANGE and it sits before the sort field → blocking SORT stage.
//   IXSCAN → FETCH → SORT.  ~90ms and it gets worse as the user's history grows.

// ✅ CORRECT: ESR
db.orders.createIndex({ userId: 1, status: 1, createdAt: -1, total: 1 });
//   E: userId (eq), status (eq)
//   S: createdAt (-1 matches the sort direction)
//   R: total (range) — last, evaluated as a filter during the ordered walk
//   IXSCAN → FETCH → LIMIT. No SORT.  ~2ms, and flat as the user's history grows.

// Sort direction subtlety: an index serves a sort if the sort is the index order
// OR its exact inverse. {userId:1, createdAt:-1} serves sort({userId:1, createdAt:-1})
// and sort({userId:-1, createdAt:1}). It does NOT serve sort({userId:1, createdAt:1}).
// For single-key sorts direction never matters (B-trees walk both ways).
```

### Covered queries

A **covered query** is answered entirely from the index — no `FETCH`, no touching the
collection. It is the fastest thing MongoDB does, often 5–10× faster than the same query
with a fetch, because it skips a random read per result.

Requirements, all of them:
1. Every field in the **filter** is in the index.
2. Every field in the **projection** is in the index.
3. `_id` is **explicitly excluded** unless `_id` is in the index.
4. No indexed field is an **array** (multikey indexes cannot cover).
5. Not on a `mongos` against a sharded collection *unless* the shard key is in the index
   (mongos needs the shard key to filter orphaned documents).

```javascript
db.users.createIndex({ email: 1, name: 1, plan: 1 });

// ✅ COVERED — explain shows IXSCAN → PROJECTION_COVERED, totalDocsExamined: 0
db.users.find({ email: "a@b.com" }, { name: 1, plan: 1, _id: 0 });

// ❌ NOT covered — _id not excluded, and _id is not in the index → FETCH
db.users.find({ email: "a@b.com" }, { name: 1, plan: 1 });

// ❌ NOT covered — createdAt is not in the index → FETCH
db.users.find({ email: "a@b.com" }, { name: 1, createdAt: 1, _id: 0 });
```

The killer application of covered queries is **counting and existence checks**:
`db.orders.countDocuments({userId: 7, status: "shipped"})` against
`{userId: 1, status: 1}` reads only index pages. Add a rarely-needed field to that index and
you have converted a pure index scan into N random document fetches.

### Index intersection: why you should not plan around it

MongoDB *can* combine two indexes with an `AND_SORTED`/`AND_HASH` stage. In practice the
planner almost never chooses it, because intersecting two index scans and deduplicating
RecordIds is usually more expensive than one well-chosen compound index plus a filter.

**Do not design for index intersection.** If you see it in an explain plan, treat it as a
signal that the right compound index is missing. This is a good interview answer because
juniors often believe "I have indexes on `a` and `b`, so `find({a, b})` is fast."

### The plan cache, and why your query got slow overnight

MongoDB does not cost-model like PostgreSQL. It **races** candidate plans:

```
1. Query arrives. Planner enumerates candidate plans from eligible indexes.
2. If >1 candidate: run all of them in an interleaved TRIAL, until one either
   returns 101 results or performs `internalQueryPlanEvaluationWorks` (default 10,000)
   units of work.
3. Winner is chosen by a productivity score (results returned per unit of work,
   with bonuses for no-blocking-sort and no-fetch).
4. Winner is CACHED, keyed by "query shape" (predicate fields + sort + projection
   structure, NOT the literal values).
5. Cached plan is reused. It is re-evaluated if:
   • the collection's index set changes  • ~1,000× more work than the trial
   • an index build/drop happens         • mongod restarts (cache is in memory, not persisted
                                            pre-4.4; 4.4+ persists across restarts partially)
```

**The consequence that bites in production:** the plan is cached per *shape*, not per
*value*. `find({country: "LI"})` (12 documents) and `find({country: "US"})` (40M documents)
are the same shape. Whichever one warmed the cache picks the plan for both. This is how a
query that has been fast for six months suddenly becomes a COLLSCAN after a restart.

```javascript
db.orders.getPlanCache().list();                 // 4.4+; .listQueryShapes() before
db.orders.getPlanCache().clear();                // nuke it (safe, it rebuilds)

// The escape hatch: pin the plan
db.orders.find({ userId: 7, status: "shipped" }).hint({ userId: 1, status: 1, createdAt: -1 });
// hint() bypasses the planner entirely. Use it when you KNOW the right index and the
// planner is being flaky. Use it sparingly — a hint referencing a dropped index throws.
// The heavier hammer: index filters (planCacheSetFilter), which constrain the planner
// server-side for a shape. They do not survive restart. Document them or lose them.
```

---

## Reading explain("executionStats") Like a Senior

`explain()` is the tool. Most engineers run it, see "IXSCAN", declare victory, and miss the
actual problem. Here is how to read one properly.

### The three verbosity modes

```javascript
db.orders.find({...}).explain("queryPlanner");     // plan only, does NOT run the query
db.orders.find({...}).explain("executionStats");   // RUNS it, gives real counters  ← use this
db.orders.find({...}).explain("allPlansExecution");// + stats for every REJECTED plan
```

Use `executionStats` by default. Use `allPlansExecution` when you want to know *why* the
planner rejected the index you thought it should use — the rejected plans' stats tell you.

For aggregations: `db.orders.explain("executionStats").aggregate([...])`.

### The stage vocabulary

```
STAGE                What it means                          Verdict
─────────────────────────────────────────────────────────────────────────────────────
COLLSCAN             Full collection scan                   Red flag unless the
                                                            collection is tiny or you
                                                            genuinely want everything
IXSCAN               B-tree index scan                      Good
FETCH                Load the full document by RecordId     Necessary evil. One random
                                                            read per document.
PROJECTION_COVERED   Answered from index alone              Best case
SORT                 BLOCKING in-memory sort                Red flag. 32MB cap for find(),
                                                            100MB per stage in aggregate.
                                                            Kills the benefit of limit().
SORT_MERGE           Merge pre-sorted index scans           Fine — index provided the order
LIMIT / SKIP         Bounded output / discard N             SKIP is O(n) — see pagination
COUNT_SCAN           Count from index without fetching      Best case for counts
IDHACK               Fast path for _id equality             Optimal
SHARDING_FILTER      mongos filtering orphaned docs         Normal on sharded clusters
SHARD_MERGE          Merging results from multiple shards   Scatter-gather — see sharding
EOF                  Planner proved zero results possible   Usually a type mismatch bug
SUBPLAN / OR         $or handled as separate plans          Each branch needs its own index
```

### The three numbers

```javascript
{
  executionStats: {
    nReturned: 20,               // documents the client gets
    executionTimeMillis: 3,      // wall clock, INCLUDING planner trial time
    totalKeysExamined: 22,       // index entries walked
    totalDocsExamined: 20,       // documents pulled from the collection (FETCH cost)
    executionStages: { ... }     // the tree, read it bottom-up
  }
}
```

**The ratios are the whole diagnosis:**

```
totalKeysExamined / nReturned   → index precision
totalDocsExamined / nReturned   → fetch waste

  1:1        Perfect. The index answered exactly what was asked.
  ≤ 3:1      Healthy. Some filtering after the scan. Ship it.
  10:1       Suspicious. Index is too coarse — usually a missing trailing field.
  100:1      Broken. You are scanning to filter. Fix the index.
  ≥ 1000:1   You have a COLLSCAN wearing an IXSCAN costume.

totalDocsExamined == 0 && nReturned > 0  →  COVERED QUERY. Celebrate.
totalKeysExamined == 0 && totalDocsExamined == collection count  →  COLLSCAN.
```

### Worked diagnosis

```javascript
// ── BEFORE: 50M order collection, no useful index ──────────────────────────
db.orders.find({ customerId: 84213, status: "pending" })
         .sort({ createdAt: -1 }).limit(20).explain("executionStats");

// executionStats: {
//   nReturned: 20,
//   executionTimeMillis: 41208,          ← 41 SECONDS
//   totalKeysExamined: 0,                ← no index used at all
//   totalDocsExamined: 50000000,         ← every document, read from disk
//   executionStages: {
//     stage: "SORT",                     ← blocking sort on top of everything
//     sortPattern: { createdAt: -1 },
//     memLimit: 33554432,
//     usedDisk: true,                    ← it SPILLED. 4.4+ allows this; older versions
//                                          would have thrown "Sort exceeded memory limit"
//     inputStage: { stage: "COLLSCAN", filter: {...}, docsExamined: 50000000 }
//   }
// }
// Diagnosis: 2,500,000:1 docs-to-returned. Every one of those 50M documents was
// read into the WiredTiger cache, evicting the real working set. This one query
// degrades every OTHER query on the box for minutes afterward.

// ── Intermediate attempt: single-field index ───────────────────────────────
db.orders.createIndex({ customerId: 1 });
//   nReturned: 20, executionTimeMillis: 187,
//   totalKeysExamined: 3400, totalDocsExamined: 3400   ← 170:1. Better, still bad.
//   Stages: IXSCAN → FETCH → SORT.  The SORT is still there. limit(20) buys nothing.

// ── AFTER: ESR-ordered compound index ──────────────────────────────────────
db.orders.createIndex({ customerId: 1, status: 1, createdAt: -1 });
//   nReturned: 20, executionTimeMillis: 2,
//   totalKeysExamined: 20, totalDocsExamined: 20       ← 1:1
//   Stages: IXSCAN → FETCH → LIMIT.  No SORT.
//
// 41,208ms → 2ms. That is 20,000×, and more importantly it is now O(limit)
// instead of O(collection size) — it will still be 2ms at 500M documents.
```

### Things in explain output people misread

- **`executionTimeMillis` includes the planner's trial period.** The first execution of a
  new shape can be 10× the steady-state time. Run it twice; read the second.
- **`explain()` on `find()` does not include network time or BSON deserialization.** A query
  that is 2ms server-side can be 200ms client-side if it returns 50MB.
- **`nReturned` at the top stage vs at each inner stage.** Read the tree bottom-up:
  `IXSCAN nReturned: 40000 → FETCH nReturned: 40000 → SORT nReturned: 40000 → LIMIT
  nReturned: 20` tells you exactly where the waste is (all of it, before the LIMIT).
- **`indexBounds`.** This is the underrated field. It shows the actual scan range:
  `{ customerId: ["[84213, 84213]"], status: ["[\"pending\", \"pending\"]"],
  createdAt: ["[MaxKey, MinKey]"] }` — bounds of `[MinKey, MaxKey]` on a field means that
  field contributed **nothing** to narrowing the scan, it is only being used for ordering or
  filtering. Two adjacent unbounded fields = your index order is wrong.
- **`$or` produces a `SUBPLAN`/`OR` stage with one child per branch.** Every branch needs its
  own index or the whole query degrades to a COLLSCAN. `$in` is different and better — it
  becomes multiple point lookups on one index.
- **`isMultiKey: true`** on a stage you did not expect explains a lost covered query.
- **`rejectedPlans`** in `allPlansExecution` — if the plan you wanted is in there with worse
  trial stats, the planner is not broken, your index is.

---

## Data Modeling: The Decision Framework

The single most important sentence in MongoDB data modeling:

> **Model your data around how you query it, not around what it is.**

In a relational database you normalize first and let the query planner sort it out. In
MongoDB the schema *is* the query plan. If you design a schema before you know your access
patterns, you have guessed, and you will be rewriting it.

### The embed-vs-reference decision tree

```
                    ┌────────────────────────────────────┐
                    │  Is the child data ALWAYS fetched  │
                    │  together with the parent?         │
                    └────────────┬───────────────────────┘
                          no │        │ yes
             ┌───────────────┘        └──────────────┐
             ▼                                       ▼
     ┌───────────────┐                ┌──────────────────────────────┐
     │  REFERENCE    │                │  Is the child set BOUNDED    │
     │               │                │  and provably small?         │
     └───────────────┘                └──────┬───────────────────────┘
                                    no │            │ yes
                       ┌───────────────┘            └────────────┐
                       ▼                                          ▼
             ┌──────────────────┐                  ┌───────────────────────────┐
             │  REFERENCE       │                  │ Is the child written far   │
             │  (or BUCKET if   │                  │ more often than the parent │
             │   time-ordered)  │                  │ is read?                   │
             └──────────────────┘                  └──────┬────────────────────┘
                                                 yes │          │ no
                                    ┌────────────────┘          └──────────┐
                                    ▼                                       ▼
                          ┌───────────────────┐              ┌──────────────────────┐
                          │ REFERENCE         │              │ Does the child need  │
                          │ (write contention │              │ to be queried on its │
                          │  on the parent)   │              │ own, independently?  │
                          └───────────────────┘              └────┬─────────────────┘
                                                          yes │        │ no
                                              ┌───────────────┘        └───────┐
                                              ▼                                ▼
                                  ┌────────────────────────┐        ┌──────────────────┐
                                  │ REFERENCE, or EMBED    │        │      EMBED       │
                                  │ + EXTENDED REFERENCE   │        │  (the default    │
                                  │ (duplicate hot fields) │        │   when in doubt) │
                                  └────────────────────────┘        └──────────────────┘
```

### The 1-few / 1-many / 1-squillions rule

This is the framing MongoDB's own field engineers use and it is the crispest way to answer
the question in an interview.

| Cardinality | Example | Model | Why |
|---|---|---|---|
| **One-to-few** (≤ ~100, bounded) | user → addresses, product → images | **Embed the array** | One read, atomic updates, no join. The array is provably bounded by the domain |
| **One-to-many** (~100s–10,000s, bounded-ish) | post → comments, order → line items | **Reference from the child**: child holds `parentId`, indexed | Parent document stays small; children are queried and paginated on their own |
| **One-to-squillions** (unbounded) | server → log lines, user → events, sensor → readings | **Reference from the child, plus bucketing** | The array approach hits 16MB. Even the parent holding an array of IDs hits 16MB (16MB / 12 bytes ≈ 1.4M ObjectIds) |

The critical follow-up an interviewer will ask: *"where do you put the reference?"*

```javascript
// One-to-many: the reference goes on the MANY side. Always.
// ✅ CORRECT
{ _id: postId, title: "...", body: "...", commentCount: 342 }        // posts
{ _id: c1, postId: postId, author: "...", text: "..." }              // comments
db.comments.createIndex({ postId: 1, createdAt: -1 });
// Paginate comments independently. Post document never grows. commentCount is
// the computed pattern so the UI does not need a count query.

// ❌ WRONG: array of child IDs on the parent
{ _id: postId, title: "...", commentIds: [c1, c2, ... c50000] }
// Unbounded array (16MB wall), AND you still need a second query to get the
// comments, AND every new comment writes to the hot parent document.
// This is the worst of both models. It is also extremely common.
```

### Many-to-many

```javascript
// Small and read-heavy → embed IDs on ONE side (usually the smaller/less-hot side)
{ _id: userId, name: "Alice", roleIds: [r1, r2, r3] }   // users typically have <10 roles
{ _id: r1, name: "admin", permissions: [...] }
// Query "users with role X": db.users.find({ roleIds: r1 })  (multikey index)
// Query "roles of user U": one find on users, one $in on roles. Two round trips, fine.

// Large / needs metadata on the relationship → junction collection, like SQL
{ _id: ..., studentId: s1, courseId: c1, enrolledAt: ..., grade: "A" }
db.enrollments.createIndex({ studentId: 1, courseId: 1 }, { unique: true });
db.enrollments.createIndex({ courseId: 1 });   // the reverse lookup
// You need this the moment the RELATIONSHIP has attributes. There is no way to put
// "grade" on an embedded ID array without duplicating it.
```

### Duplication is a design tool, not a bug

Relational instinct says duplication is bad. In MongoDB, controlled duplication is how you
buy read performance, and the discipline is:

> Duplicate fields that are **read often** and **change rarely**. Never duplicate a field
> that changes frequently unless you have a real invalidation mechanism.

```javascript
// ✅ Extended Reference pattern: embed the fields you need, reference the rest
{
  _id: orderId,
  customer: {                       // duplicated snapshot — enough for the orders list UI
    _id: customerId,
    name: "Alice Chen",
    email: "alice@example.com"
  },
  items: [ { sku: "X1", name: "Widget", price: NumberDecimal("29.99"), qty: 2 } ],
  total: NumberDecimal("59.98")
}
// The orders list page needs zero joins. When the customer renames themselves,
// old orders keep the old name — WHICH IS CORRECT for an order. A historical
// record should reflect the state at the time. This is not staleness, it is
// point-in-time accuracy, and it is a genuinely strong interview answer.

// Same for item name and price: you MUST snapshot price on the order. Referencing
// the live product price means a price change silently rewrites financial history.
// This is the case where "denormalization" is not an optimization — it is correctness.
```

When duplicated data genuinely must stay in sync (a customer's *current* shipping address
shown on open orders, say), your options are, in increasing order of complexity:

1. **Accept eventual consistency** with a background job. Fine for display-only fields.
2. **Change streams** (3.6+): watch the source collection, propagate updates. Resumable via
   resume tokens, at-least-once, so make the propagation idempotent.
3. **Multi-document transaction** on the write path. Correct, and the most expensive.
4. **Don't duplicate it** — reference and `$lookup`. Sometimes the right answer.

### Schema validation: put the schema back in the database

"Flexible schema" does not mean "no schema". Since 3.6 you can enforce `$jsonSchema`:

```javascript
db.createCollection("orders", {
  validator: { $jsonSchema: {
    bsonType: "object",
    required: ["customerId", "status", "total", "createdAt", "schemaVersion"],
    properties: {
      schemaVersion: { bsonType: "int", minimum: 3 },
      customerId:    { bsonType: "objectId" },
      status:        { enum: ["pending", "paid", "shipped", "cancelled"] },
      total:         { bsonType: "decimal", minimum: 0 },
      createdAt:     { bsonType: "date" },
      items: {
        bsonType: "array", minItems: 1, maxItems: 500,      // ← bound the array. In the DB.
        items: { bsonType: "object", required: ["sku", "price", "qty"] }
      }
    },
    additionalProperties: true   // false is stricter but breaks rolling deploys
  }},
  validationLevel: "moderate",   // strict | moderate (only validates docs already valid) | off
  validationAction: "error"      // error | warn
});
```

Rollout discipline: start `validationAction: "warn"`, grep the logs for a week to find every
document your code actually writes, fix the offenders, *then* switch to `error`. Turning on
strict validation without this step is how you take a production outage on a Tuesday.

---

## Schema Design Patterns That Earn Their Keep

### 1. Bucket pattern — time series and high-volume append

The problem: one document per event means N documents, N index entries, and ~30–100 bytes of
per-document overhead each. At 1B events that overhead alone is tens of gigabytes.

```javascript
// ❌ WRONG: one doc per reading. 1 sensor × 1 reading/sec = 86,400 docs/day/sensor.
{ _id: ObjectId(), sensorId: "s-42", ts: ISODate("2026-08-30T10:00:01Z"), temp: 21.4 }

// ✅ CORRECT: bucket by hour, bounded by count
{
  _id: ObjectId(),
  sensorId: "s-42",
  bucketStart: ISODate("2026-08-30T10:00:00Z"),
  bucketEnd:   ISODate("2026-08-30T11:00:00Z"),
  count: 3600,
  // Computed pattern folded in — the dashboard never scans the array:
  min: 19.8, max: 23.1, sum: 76140.0, avg: 21.15,
  readings: [ { t: 1, v: 21.4 }, { t: 2, v: 21.5 }, ... ]   // 3600 entries, ~14KB
}
db.readings.createIndex({ sensorId: 1, bucketStart: -1 });

// The write, with the bound enforced in the FILTER (this is the key trick):
db.readings.updateOne(
  { sensorId, bucketStart: hourStart, count: { $lt: 3600 } },
  { $push:  { readings: { t: secOffset, v: temp } },
    $inc:   { count: 1, sum: temp },
    $min:   { min: temp },
    $max:   { max: temp },
    $setOnInsert: { sensorId, bucketStart: hourStart, bucketEnd: hourEnd } },
  { upsert: true }
);
// When count hits 3600 the filter no longer matches → upsert creates the NEXT bucket.
// The array can never exceed 3600 entries. 16MB is unreachable by construction.

// Gains: 3,600× fewer documents, 3,600× fewer index entries, and the dashboard
// query for "hourly average" reads 24 documents/day instead of 86,400.
```

**MongoDB 5.0+ has native time-series collections** which implement bucketing for you,
with columnar-ish storage and 3–10× better compression:

```javascript
db.createCollection("readings", {
  timeseries: { timeField: "ts", metaField: "sensorId", granularity: "seconds" },
  expireAfterSeconds: 7776000   // 90-day retention, handled natively
});
```
Use these for genuine time series. Restrictions to know: no updates or deletes of individual
measurements (until 5.1/7.0 relaxed some of this), `metaField` should be the thing you
always filter on, and choosing the wrong `granularity` (or `bucketMaxSpanSeconds` in 6.3+)
produces terrible buckets. Native beats hand-rolled unless you need arbitrary updates.

### 2. Subset pattern — keep the hot 10% in the document

```javascript
// Product with 10,000 reviews. The page shows 10. Embedding all 10,000 = 8MB read
// for a page that displays 10.
{
  _id: productId, name: "Widget", price: NumberDecimal("29.99"),
  reviewCount: 10234,
  ratingAvg: 4.3,
  topReviews: [ /* 10 most helpful, denormalized */ ]    // ~4KB
}
// Full set lives in db.reviews, indexed { productId: 1, helpfulVotes: -1 }.
// Product page: ONE document read. "See all reviews": paginated query on reviews.
// Maintain topReviews on a schedule or via change stream — it does not need to be
// transactionally consistent, it is a cache with a home.
```
The subset pattern is the answer to "the document is too big but I still want one read". It
is the single most reusable pattern on this list.

### 3. Computed pattern — pay at write time, not read time

```javascript
// ❌ WRONG: recompute on every page view
db.orders.aggregate([
  { $match: { customerId } },
  { $group: { _id: null, lifetimeValue: { $sum: "$total" }, orderCount: { $sum: 1 } } }
]);
// 4,000 documents scanned per profile view. At 500 views/sec that is 2M doc reads/sec.

// ✅ CORRECT: maintain it on write
db.customers.updateOne(
  { _id: customerId },
  { $inc: { lifetimeValue: order.total, orderCount: 1 },
    $max: { lastOrderAt: order.createdAt } }
);
// Profile view = 1 document read, 0 aggregation.
// Read:write ratio decides this. At 1000:1 reads, computing on write is free.
// At 1:1000 it is the wrong trade and you should aggregate on read.
```
Trade-off to state out loud: computed values **drift**. Ship a reconciliation job that
recomputes from source nightly and alerts on divergence. If you cannot tolerate drift at
all, you need a transaction, and you should ask whether the value belongs in Mongo.

### 4. Attribute pattern — heterogeneous, sparse, queryable fields

```javascript
// ❌ WRONG: one field per attribute → an index per attribute, and 64 is the cap
{ sku: "X1", color: "red", size: "L", voltage: "220V", pageCount: 320, isbn: "..." }
// Needs indexes on color, size, voltage, pageCount, isbn, ... one per product category.

// ✅ CORRECT: key/value array + ONE compound multikey index
{ sku: "X1", specs: [ { k: "color", v: "red" }, { k: "voltage", v: 220 } ] }
db.products.createIndex({ "specs.k": 1, "specs.v": 1 });
db.products.find({ specs: { $elemMatch: { k: "voltage", v: 220 } } });   // uses the index
// One index serves EVERY attribute. This is the pattern wildcard indexes are
// usually a lazy substitute for.
```

### 5. Extended reference — covered above; the rule is "duplicate the read-hot, change-cold fields"

### 6. Outlier pattern — do not let the 0.001% dictate the schema for the 99.999%

```javascript
// Most users have <100 followers. Kim Kardashian has 300 million.
{ _id: u1, name: "...", followerIds: [ ... ≤1000 ... ] }              // normal
{ _id: u2, name: "...", followerIds: [ ...1000... ], hasOverflow: true }  // celebrity
// Application checks hasOverflow; if set, additionally queries db.followers.
// Beats forcing every one of your 50M normal users into a join.
```

### 7. Schema versioning — the pattern that makes flexible schema survivable

```javascript
{ _id: ..., schemaVersion: 3, email: "a@b.com", name: { first: "A", last: "B" } }

// Application:
function normalize(doc) {
  switch (doc.schemaVersion) {
    case 1: doc = v1_to_v2(doc);   // fallthrough
    case 2: doc = v2_to_v3(doc);
    case 3: return doc;
    default: throw new Error(`unknown schemaVersion ${doc.schemaVersion}`);
  }
}
```
Why this is the senior answer: MongoDB has no `ALTER TABLE`, so migrating 500M documents
means a background job that runs for days while both shapes exist. Without an explicit
version field you cannot tell which shape a document is in, you cannot tell whether the
migration is finished, and your `if (doc.name && typeof doc.name === 'object')` checks
metastasize across the codebase forever. With it: lazy migration on read, a background
backfill, a query (`find({schemaVersion: {$lt: 3}}).count()`) that tells you exactly how far
along you are, and a date on which you can delete the old code path.

### Anti-patterns, named

| Anti-pattern | Failure mode |
|---|---|
| **Unbounded array** | Hits 16MB. Writes fail while reads succeed → silent data loss |
| **Massive number of collections** | Each collection + index is a WiredTiger file with its own cache handle. 10,000s of collections → slow startup, huge memory overhead for file handles. Symptom: "one collection per customer" |
| **Bloated documents** | Whole doc read into cache to access one field. Working set explodes |
| **Unnecessary indexes** | Write amplification + cache pressure. Check `$indexStats` |
| **Case-insensitive queries without collation** | `find({name: /^alice$/i})` cannot use a normal index efficiently. Use a collation-aware index (`{locale: "en", strength: 2}`) or store a normalized lowercase field |
| **Separate collection per tenant/day/user** | See "massive number of collections". Use a field + index instead |
| **Using `$where` or `$function`** | Executes JavaScript per document, cannot use indexes, ~100× slower, and it is an injection vector |
| **Storing files in documents** | 16MB cap, kills cache. Use S3 and store the URL. GridFS only if you truly cannot |

---

## Aggregation Framework Deep Dive

The aggregation pipeline is MongoDB's real query language. `find()` is a convenience wrapper
over a subset of it. If you are doing anything analytical, you are writing pipelines.

```
Documents ──▶ [$match] ──▶ [$lookup] ──▶ [$unwind] ──▶ [$group] ──▶ [$sort] ──▶ [$limit] ──▶ Results
              ↑ uses         ↑ NOT a      ↑ document    ↑ blocking   ↑ blocking
              indexes if     real join,   multiplier    100MB cap    100MB cap
              FIRST          N+1 lookups                             (32MB in find)

Two classes of stage, and the distinction governs everything:

  STREAMING (constant memory, documents flow through one at a time):
    $match  $project  $addFields/$set  $unset  $limit  $skip  $unwind  $redact
    $replaceRoot  $sample (when it can use the random cursor)

  BLOCKING (must consume the ENTIRE input before emitting anything):
    $group  $sort  $bucket  $bucketAuto  $facet  $count  $setWindowFields
    $sortByCount  $lookup (when it materializes)
    → these are where memory limits, allowDiskUse, and latency cliffs live
```

### Stage reference, with the things that matter

| Stage | Notes that separate seniors from juniors |
|---|---|
| `$match` | **Must be first** to use an index. The optimizer will move it earlier when provably safe, but not through `$project` that renames fields, not through `$unwind` on the matched field, not past a `$group` on a computed field |
| `$project` / `$addFields` / `$set` | `$project` is exclusive-or-inclusive (cannot mix, except excluding `_id`). `$set`/`$addFields` (4.2+) are additive and usually what you meant |
| `$group` | Blocking. `_id: null` groups everything. Accumulators: `$sum $avg $min $max $push $addToSet $first $last $stdDevPop $mergeObjects $top/$bottom (5.2+)`. `$push` on a large group is an unbounded-array-in-memory bug waiting to happen |
| `$sort` | Uses an index **only if it is at the front of the pipeline** (before any stage that transforms documents). Otherwise blocking, 100MB |
| `$limit` / `$skip` | The optimizer pushes `$limit` into a preceding `$sort` (top-K sort, bounded memory) — this is a big win, and it is why `$sort` + `$limit` is much cheaper than `$sort` alone |
| `$unwind` | One output document per array element. A 1,000-element array turns 1M documents into 1B. Use `preserveNullAndEmptyArrays: true` or you silently drop documents with empty arrays — a classic data-loss bug |
| `$lookup` | See below. Not a real join |
| `$graphLookup` | Recursive lookup for hierarchies (org charts, category trees). `maxDepth`, and it is memory-bound (100MB, ignores `allowDiskUse`) |
| `$facet` | Run multiple sub-pipelines over the same input. **Each sub-pipeline gets its own 100MB** and cannot use an index (input is already materialized). Great for search facets, terrible for large inputs |
| `$unionWith` (4.4+) | The closest thing to `UNION ALL` |
| `$merge` (4.2+) / `$out` | Write results to a collection. `$out` **replaces** the target atomically; `$merge` can insert/update/fail per document and **can write to a sharded collection**. `$merge` is how you build materialized views / rollup tables |
| `$setWindowFields` (5.0+) | Real window functions — running totals, moving averages, `$rank`, `$denseRank`, `$shift`. Removed the last big reason to export to SQL for analytics |
| `$sample` | If `N < 5%` of documents **and** the collection has >100 documents **and** it is the first stage, uses a fast pseudo-random storage cursor. Otherwise it degrades to a full scan plus sort — a nasty performance cliff |
| `$search` / `$vectorSearch` | Atlas only. Lucene-backed. Must be the first stage |

### `$lookup` is not a join, and you must be able to say why

```javascript
{ $lookup: { from: "orders", localField: "_id", foreignField: "customerId", as: "orders" } }
```

What actually happens: **for each input document, MongoDB runs a separate query against the
foreign collection.** It is a correlated subquery — a nested loop join — executed one input
document at a time. There is no hash join, no merge join, and no cost-based join reordering
in the classic (pre-5.1) execution engine.

The consequences:

```javascript
// ❌ WRONG: $lookup on an unindexed foreign field
db.customers.aggregate([
  { $lookup: { from: "orders", localField: "_id", foreignField: "customerId", as: "orders" } }
]);
// If db.orders has NO index on customerId:
//   50,000 customers × COLLSCAN of 50,000,000 orders = 2.5 × 10^12 document reads.
//   This does not "run slowly". It runs for days, saturates the cache, and takes
//   the cluster down with it. There is no warning. explain() shows the inner
//   COLLSCAN but people do not look.

// ✅ CORRECT: index the foreign field. Non-negotiable.
db.orders.createIndex({ customerId: 1 });
// Now: 50,000 customers × index lookup ≈ 50,000 × ~4 page reads. Seconds.

// ✅ MORE CORRECT: reduce the input set BEFORE the lookup
db.customers.aggregate([
  { $match: { plan: "enterprise", active: true } },   // ← 800 docs, uses an index
  { $lookup: {
      from: "orders",
      let: { cid: "$_id" },
      pipeline: [                                      // ← correlated sub-pipeline form (3.6+)
        { $match: { $expr: { $eq: ["$customerId", "$$cid"] },
                    status: "shipped",
                    createdAt: { $gte: cutoff } } },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },                                // ← bound the joined array!
        { $project: { total: 1, createdAt: 1 } }
      ],
      as: "recentOrders" }}
]);
// The pipeline form lets you filter, sort, limit and project INSIDE the lookup.
// Without $limit, a customer with 200,000 orders produces a 200,000-element array
// inside a single aggregation document — which must fit in 16MB. It will not.
// "BSONObjectTooLarge" from an aggregation is almost always an unbounded $lookup.
```

**Version note that matters:** MongoDB 5.1+ can execute `$lookup` in the slot-based engine
using a **hash join** (when the foreign collection fits in memory) or an **index nested-loop
join**, and 6.0 extended this. This closes some of the gap but does not change the advice:
index the foreign field, filter first, bound the result.

**Sharded-collection restriction:** before 5.1, the `from` collection in `$lookup` could not
be sharded. From 5.1 it can. If you are on 4.x and someone asks "how do you join across
shards?", the answer is "you do not — you denormalize, or you do it in the application."

### Memory limits — the exact numbers

```
$sort / $group in aggregation:  100 MB per stage (internalQueryMaxBlockingSortMemoryUsageBytes
                                                  / ...MaxAddToSetBytes etc.)
sort in find():                  32 MB   (33,554,432 bytes — you will see this exact
                                          number in the error message)
$graphLookup:                   100 MB, and allowDiskUse does NOT help it
$facet sub-pipeline:            100 MB each
Single output document:          16 MB (the BSON limit applies to aggregation output too)
Aggregate result as a single doc (no cursor):  16 MB
```

```javascript
db.orders.aggregate(pipeline, { allowDiskUse: true });
// Lets $sort and $group spill to _tmp/ on disk instead of erroring.
// It is NOT free: disk-based sort is 10–100× slower than in-memory.
// Treat "we had to add allowDiskUse" as a signal that the pipeline is under-filtered,
// not as a fix. In 6.0+ allowDiskUseByDefault is a server parameter, default true —
// which means your pipelines now silently get slow instead of loudly failing.
// Know which behaviour your version has.
```

### Pipeline optimization: what the optimizer actually does

You can see the rewritten pipeline with `db.c.explain().aggregate([...])` — look at
`stages`, not the pipeline you wrote.

```
Optimizations the aggregation framework performs automatically:

1. $match coalescing and PUSHDOWN
   [$sort, $match]  →  [$match, $sort]        (when the match doesn't depend on the sort)
   Moves $match as early as legally possible, ideally into the initial IXSCAN.

2. $sort + $limit coalescing  ← the most valuable one
   [$sort, $limit: 10]  →  top-K sort, memory bounded to 10 documents
   Without the $limit, the $sort must materialize everything.

3. $limit coalescing:  [$limit: 100, $limit: 10] → [$limit: 10]
   $skip + $limit:     [$skip: 5, $limit: 10]   → [$limit: 15, $skip: 5]

4. $project/$addFields pushdown — a projection that only removes fields can be
   pushed into the scan so unused fields are never materialized.

5. $unwind + $match coalescing
   [$unwind: "$items", $match: {"items.sku": "X"}]
   → adds a pre-filter so documents with no matching item are dropped before unwinding

6. $lookup + $unwind coalescing — avoids materializing the full joined array
   when it is immediately unwound.

7. $group + $match on the _id → the $match can sometimes be pushed BEFORE the $group.
   Only when it references the grouping key, never a computed accumulator.

What it does NOT do:
  • Reorder stages across a $group on a computed field
  • Push a $match through a $project that RENAMES the matched field
  • Choose join order (there is no join order — $lookup is always nested-loop from the
    outer pipeline)
  • Use an index for a $sort that appears after any document-transforming stage
```

### Writing a pipeline that will not embarrass you

```javascript
// ✅ Production-shaped pipeline: monthly revenue by category, top 10
db.orders.aggregate([
  // 1. FILTER FIRST, on indexed fields, as narrow as possible.
  //    This is 90% of aggregation performance.
  { $match: {
      status: "completed",
      createdAt: { $gte: ISODate("2026-01-01"), $lt: ISODate("2026-09-01") }
  }},                              // index: { status: 1, createdAt: 1 }

  // 2. PROJECT AWAY what you do not need, before anything expensive.
  //    Every downstream stage carries less data.
  { $project: { items: 1, createdAt: 1, _id: 0 } },

  // 3. Only now expand. $unwind multiplies document count — do it as late as possible.
  { $unwind: { path: "$items", preserveNullAndEmptyArrays: false } },

  // 4. Group.
  { $group: {
      _id: { category: "$items.category",
             month: { $dateTrunc: { date: "$createdAt", unit: "month" } } },  // 5.0+
      revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
      units:   { $sum: "$items.qty" }
  }},

  // 5. Sort + limit together so the optimizer uses a bounded top-K sort.
  { $sort: { revenue: -1 } },
  { $limit: 10 },

  // 6. Shape the output last, when there are 10 documents left.
  { $project: { _id: 0, category: "$_id.category", month: "$_id.month",
                revenue: { $round: ["$revenue", 2] }, units: 1 } }
], { allowDiskUse: true, maxTimeMS: 30000, comment: "monthly-revenue-report" });
// maxTimeMS: ALWAYS set it on analytical pipelines. Without it, one bad query runs
// until the cluster dies. comment: shows up in currentOp and the slow query log so
// you can identify it at 3am.
```

**Run analytics on a secondary or an analytics node.** Tag a hidden, zero-priority,
zero-vote member `{ nodeType: "analytics" }`, point the BI tooling at it with
`readPreference: { mode: "secondary", tags: [{ nodeType: "analytics" }] }`. Heavy pipelines
evict the operational working set from the cache; keeping them off the primary is the single
cheapest operational improvement most teams can make.

### The pagination trap

```javascript
// ❌ WRONG: skip-based pagination. O(n) — the server walks and DISCARDS n documents.
db.orders.find({ userId }).sort({ createdAt: -1 }).skip(100000).limit(20);
// Page 1:    ~2ms
// Page 100:  ~40ms
// Page 5000: ~2000ms   ← same query, 1000× slower, and it gets worse every day
// Also: results shift if documents are inserted between page requests. Users see
// duplicates and miss items. This is a correctness bug, not just a performance one.

// ✅ CORRECT: cursor / keyset pagination. O(log n), constant regardless of depth.
db.orders.find({ userId, createdAt: { $lt: lastSeenCreatedAt } })
         .sort({ createdAt: -1 }).limit(20);
// Page 1: 2ms. Page 5000: 2ms. Stable under concurrent inserts.
// If createdAt is not unique, use a compound cursor to break ties deterministically:
db.orders.find({ userId, $or: [
    { createdAt: { $lt: lastTs } },
    { createdAt: lastTs, _id: { $lt: lastId } }
]}).sort({ createdAt: -1, _id: -1 }).limit(20);
// Index: { userId: 1, createdAt: -1, _id: -1 }

// The trade-off you must state: keyset pagination gives you next/prev, NOT
// "jump to page 500". If the product requires numbered pages over millions of rows,
// push back on the product requirement — nobody clicks page 500. If you truly must,
// pre-compute page boundaries into a separate collection.
```

### Counting is more expensive than you think

```javascript
db.orders.countDocuments({ status: "pending" });
// Runs a real aggregation with $match + $group. ACCURATE. Costs a full index scan
// of the matching range — with 40M pending orders this is seconds, not milliseconds.

db.orders.estimatedDocumentCount();
// Reads collection metadata. O(1), microseconds. INACCURATE after an unclean shutdown,
// and it ignores any filter. Perfect for "About 12M results". Useless for correctness.
// Note: it uses count(), which is NOT usable inside a transaction.

db.orders.count();  // deprecated — behaves differently on sharded clusters (counts orphans)

// ✅ Production pattern for a UI badge:
//   1. Maintain a counter with the computed pattern ($inc on write), OR
//   2. countDocuments with a hard cap:
db.orders.countDocuments({ status: "pending" }, { limit: 1000 });   // "999+"
//   3. Cache the count in Redis with a 60s TTL. Nobody needs a real-time exact count.
```
