# Apache Kafka - Professional Interview Guide

> Written for engineers who will operate Kafka in production, not just describe it.
> Every section answers: **WHAT** it is, **WHY** it exists, **HOW** it works internally,
> **WHEN** to use it, **WHEN NOT** to, and the **TRADE-OFF** you are accepting.
>
> A recurring theme: **Kafka is the wrong choice more often than teams admit.** A section
> is devoted to saying so honestly.

## Table of Contents
1. [What Kafka Actually Is](#what-kafka-actually-is)
2. [The Log Abstraction](#the-log-abstraction)
3. [Why Kafka Is Fast](#why-kafka-is-fast)
4. [Producer Internals](#producer-internals)
5. [Durability: acks, ISR and min.insync.replicas](#durability-acks-isr-and-mininsyncreplicas)
6. [Partitioning and the Ordering Guarantee](#partitioning-and-the-ordering-guarantee)
7. [Consumer Groups and Rebalancing](#consumer-groups-and-rebalancing)
8. [Offset Management and Delivery Semantics](#offset-management-and-delivery-semantics)
9. [Replication Internals: High Watermark, Leader Epoch, Unclean Election](#replication-internals-high-watermark-leader-epoch-unclean-election)
10. [Idempotence, Transactions and Exactly-Once](#idempotence-transactions-and-exactly-once)
11. [Retention and Log Compaction](#retention-and-log-compaction)
12. [Consumer Lag: Measuring, Diagnosing, Fixing](#consumer-lag-measuring-diagnosing-fixing)
13. [Schema Registry and Evolution](#schema-registry-and-evolution)
14. [KRaft: Life After ZooKeeper](#kraft-life-after-zookeeper)
15. [Kafka vs RabbitMQ vs SQS vs Pulsar](#kafka-vs-rabbitmq-vs-sqs-vs-pulsar)
16. [Sizing and Observability](#sizing-and-observability)
17. [Production War Stories](#production-war-stories)
18. [Common Pitfalls](#common-pitfalls)
19. [Junior vs Senior](#junior-vs-senior)
20. [Interview Questions with Model Answers](#interview-questions-with-model-answers)
21. [Production Checklist](#production-checklist)

---

## What Kafka Actually Is

**WHAT:** Kafka is a distributed, replicated, **append-only commit log**. It is not a
message queue that happens to be fast — it is a different abstraction. In a queue, reading
a message removes it. In Kafka, reading is a pure read; the broker stores an integer
offset per consumer group and the data stays on disk for the retention period regardless
of who read it.

**WHY that difference matters:** it decouples consumers completely.
- Multiple independent consumers read the same data at their own pace without the producer
  knowing they exist. Adding a new fraud-detection service to an existing order stream is
  a config change, not a producer change.
- **Replay is free.** Deploy a bug, fix it, reset the offset, reprocess three days of
  data. In a queue, that data is gone.
- The broker is nearly stateless per consumer — one long integer — so it can handle
  thousands of consumers cheaply. A queue broker tracking per-message ack state for
  millions of in-flight messages cannot.

**HOW the pieces fit:**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            KAFKA CLUSTER                                     │
│                                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                  │
│  │   BROKER 1     │  │   BROKER 2     │  │   BROKER 3     │                  │
│  │                │  │                │  │                │                  │
│  │ orders-P0 (L)  │  │ orders-P0 (F)  │  │ orders-P0 (F)  │  L = leader      │
│  │ orders-P1 (F)  │  │ orders-P1 (L)  │  │ orders-P1 (F)  │  F = follower    │
│  │ orders-P2 (F)  │  │ orders-P2 (F)  │  │ orders-P2 (L)  │                  │
│  │                │  │                │  │                │                  │
│  │ [CONTROLLER]   │  │                │  │                │  ← KRaft quorum  │
│  └───────▲────────┘  └───────▲────────┘  └───────▲────────┘                  │
└──────────┼───────────────────┼───────────────────┼───────────────────────────┘
           │ produce           │                   │ fetch
           │ (to the LEADER    │                   │ (from the leader, or a
           │  of the target    │                   │  follower if rack-aware
           │  partition only)  │                   │  fetching is enabled)
   ┌───────┴──────┐                        ┌───────┴────────────────────────┐
   │  PRODUCERS   │                        │ CONSUMER GROUP "billing"       │
   │              │                        │  c1 → P0     c2 → P1,P2        │
   └──────────────┘                        └────────────────────────────────┘
                                           ┌────────────────────────────────┐
                                           │ CONSUMER GROUP "analytics"     │
                                           │  (independent offsets — reads  │
                                           │   the SAME data separately)    │
                                           └────────────────────────────────┘
```

**Numbers to anchor on:**

| Metric | Typical value |
|---|---|
| Throughput per broker | 100–500 MB/s write, higher read (page cache) |
| Records/sec, 1 KB, 3-broker cluster | 500k – 2M with batching |
| Producer p99 latency, `acks=all`, `linger.ms=5` | 5–20 ms in-DC |
| Producer p99, `acks=1`, `linger.ms=0` | 1–3 ms |
| End-to-end p99 (produce → consume) | 10–50 ms typical, 5 ms tuned |
| Partitions per broker (practical ceiling) | 2,000–4,000 (KRaft raises cluster totals to ~1M) |
| Rebalance duration, eager, 50 consumers | 5–60 s of **total group downtime** |
| Retention default | 7 days |

**WHEN Kafka is right:**
- High-volume event streams (> ~10k msg/s sustained) where multiple independent consumers
  need the same data.
- Replay is a requirement, not a nice-to-have — reprocessing after a bug, backfilling a
  new service, rebuilding a materialized view.
- Event sourcing / CDC / stream processing with Flink, Kafka Streams, or ksqlDB.
- You need ordered, partitioned, durable history rather than transient delivery.

**WHEN Kafka is wrong — and this list is longer than most people expect:**
- **Low volume.** 100 messages/second does not justify a 3-broker cluster, a schema
  registry, a Connect cluster, and the on-call rotation that comes with them. SQS or
  Postgres `SELECT ... FOR UPDATE SKIP LOCKED` will serve you for years.
- **Per-message TTL, priority, or delay.** Kafka has none of these. Retention is
  per-topic; there is no priority queue; delayed delivery requires an external scheduler
  or a chain of delay topics. RabbitMQ and SQS do these natively.
- **Complex routing.** Topic exchanges, header-based routing, fanout with per-consumer
  filtering — that's RabbitMQ. In Kafka, every consumer reads everything and filters
  client-side, which wastes bandwidth.
- **Request/reply RPC.** People build it with a reply topic and a correlation ID. It
  works and it's miserable. Use gRPC or HTTP.
- **Very large messages.** Kafka is tuned for records under ~1 MB. A 100 MB payload
  breaks batching, blows up replication, and stalls consumers. Put the blob in S3 and
  publish the pointer (the "claim check" pattern).
- **You need a per-message dead-letter with automatic retry/backoff.** Kafka gives you
  nothing here; you build retry topics and a DLQ yourself. SQS gives you
  `maxReceiveCount` and a DLQ in a checkbox.
- **Fewer than ~3 engineers who understand it.** Kafka's failure modes (rebalance storms,
  ISR shrink, under-replicated partitions, disk fill) require someone who has seen them.
  A managed service (MSK, Confluent Cloud, Redpanda Cloud) is usually cheaper than the
  engineer-hours, even when the invoice looks worse.

**TRADE-OFF summary:** you get enormous throughput, durability, replay, and multi-consumer
decoupling. You pay with operational complexity, no per-message primitives, ordering only
within a partition, and a parallelism ceiling fixed by partition count at topic-creation
time.

---

## The Log Abstraction

### Partitions, offsets, segments

A topic is a logical name. A **partition** is the physical unit: an ordered, immutable,
append-only sequence of records, stored as a directory of **segment** files on one
broker's disk (and replicated to others).

```
  /var/lib/kafka/data/orders-0/
  ├── 00000000000000000000.log        ← segment: records 0 .. 1,048,575
  ├── 00000000000000000000.index      ← offset → byte position (sparse, every 4 KB)
  ├── 00000000000000000000.timeindex  ← timestamp → offset (powers offsetsForTimes)
  ├── 00000000000001048576.log        ← next segment; filename = its BASE OFFSET
  ├── 00000000000001048576.index
  ├── 00000000000001048576.timeindex
  ├── 00000000000002097152.log        ← ACTIVE segment (the only one being written)
  └── leader-epoch-checkpoint         ← epoch → start offset, for truncation correctness

  Logical view of one partition:

   offset:  0    1    2    3    4    5    6    7    8    9   10   11
          ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
          │ r0 │ r1 │ r2 │ r3 │ r4 │ r5 │ r6 │ r7 │ r8 │ r9 │r10 │r11 │──▶ append
          └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
                          ▲                   ▲              ▲    ▲
                          │                   │              │    │
                 consumer-group-B     consumer-group-A     HW   LEO
                 committed offset=3   committed offset=7    │    │
                                                            │    └ Log End Offset:
                                                            │      last record the
                                                            │      leader has written
                                                            └ High Watermark: last
                                                              offset replicated to ALL
                                                              in-sync replicas.
                                                              CONSUMERS CANNOT READ
                                                              PAST THE HIGH WATERMARK.
```

**Why the High Watermark exists:** if consumers could read a record that only the leader
has, and the leader then died, that record could vanish on failover — a consumer would
have processed data that the cluster later says never existed. By withholding records
until they're replicated to all ISR members, Kafka guarantees that anything a consumer
sees is durable. The cost is latency: `acks=all` end-to-end latency includes a full
replication round trip.

**Segment mechanics you should know:**
- `log.segment.bytes` (default 1 GB) and `log.roll.ms` (default 7 days) control rolling.
- **Retention deletes whole segments, never individual records.** A topic with a 1-hour
  retention and a 1 GB segment size will hold data far longer than an hour if it takes a
  day to fill a segment. The active segment is *never* deleted. This surprises people who
  set a short retention for GDPR reasons and find the data still there.
- The `.index` is **sparse** (an entry every `log.index.interval.bytes`, default 4 KB), so
  a lookup is a binary search in the index to get close, then a short linear scan of the
  log. This keeps indexes tiny enough to stay in page cache.
- Segment count drives file-handle usage. Thousands of partitions × several segments each
  × 3 files each will exhaust `ulimit -n` — set it to 100,000+.

### Immutability

Records are never modified in place. There is no `UPDATE`. This buys:
- **Sequential writes only** — the performance story below.
- **A correct replication story** — followers just copy bytes from an offset; there is no
  conflict resolution, because history never changes.
- **Replay** — offsets are stable forever, so "reprocess from offset 4,000,000" is
  meaningful.

The cost: deletion requires either retention expiry or compaction with tombstones, and
"delete this one record" is not an operation Kafka supports. For GDPR erasure, the standard
patterns are crypto-shredding (encrypt per-subject, delete the key) or compacted topics
with tombstones.

---

## Why Kafka Is Fast

Three mechanisms. Interviewers ask for all three, and most candidates name one.

### 1. Sequential disk I/O

```
  Random 4 KB writes, NVMe SSD        ~   50–200 MB/s effective
  Sequential writes,   NVMe SSD       ~ 2,000–7,000 MB/s
  Random writes,       spinning disk  ~    0.5–2  MB/s   (seek-bound)
  Sequential writes,   spinning disk  ~   100–200 MB/s   ← 100x faster than random

  Kafka ONLY appends. There is no seek. There is no in-place update.
  This is why Kafka on cheap spinning disks outperformed message brokers on SSDs.
```

A traditional broker maintains per-message state (delivered? acked? in-flight?), which
means random reads and writes into an index. Kafka's "state" is one integer per consumer
group, stored in another append-only log. The entire design falls out of that choice.

### 2. Page cache instead of an application heap cache

Kafka does not cache records in the JVM heap. It writes to the OS page cache and lets the
kernel flush. Consumers reading recent data — which is nearly all consumers — are served
entirely from RAM without Kafka touching the disk or the heap.

```
  ┌─────────────────────────────────────────────────────────────┐
  │ Broker with 64 GB RAM:                                      │
  │   JVM heap:      6 GB   ← deliberately SMALL                │
  │   Page cache:   ~56 GB  ← the actual cache, managed by Linux│
  └─────────────────────────────────────────────────────────────┘

  Why a small heap:
    • No GC pressure from message data → no multi-second GC pauses
    • The page cache survives a broker process restart (warm immediately)
    • No double-caching (heap copy + page cache copy of the same bytes)
    • The kernel's LRU is well-tuned and free
```

**This is why `-Xmx32g` on a Kafka broker is a mistake** — you starve the page cache and
create GC pauses that cause ISR shrink and spurious rebalances. 6 GB heap is standard even
on very large brokers.

### 3. Zero-copy (`sendfile`)

```
  TRADITIONAL read + write path (4 copies, 4 context switches):

    disk ──▶ [kernel page cache] ──▶ [app buffer] ──▶ [socket buffer] ──▶ NIC
              copy 1: DMA           copy 2: CPU      copy 3: CPU       copy 4: DMA
                             ▲ user/kernel switch  ▲ user/kernel switch

  KAFKA with sendfile(2) / FileChannel.transferTo (2 copies, 2 switches):

    disk ──▶ [kernel page cache] ─────────────────────▶ [NIC]
              copy 1: DMA          copy 2: DMA (scatter-gather; the CPU never
                                   touches the message bytes at all)
```

Roughly a 2–4x throughput improvement on the consumer path, and it removes the CPU as a
bottleneck for fanout — one broker can serve the same bytes to 20 consumer groups without
20x the CPU.

**The critical caveat, and the follow-up question:** zero-copy requires the bytes on disk
to be *exactly* the bytes on the wire. Anything that forces the broker to decompress,
inspect, or re-encode a batch **disables zero-copy**:
- A producer and consumer with **mismatched message format versions** → broker
  down-converts → zero-copy off, CPU spikes, throughput collapses. This is the classic
  "we upgraded the brokers and throughput halved" incident; watch the
  `MessageConversionsPerSec` metric.
- SSL/TLS: encryption must happen in userspace, so `sendfile` cannot be used. **Expect a
  20–35% throughput reduction when you enable TLS.** Budget for it; do not discover it in
  production.
- Broker-side recompression when `compression.type` on the topic differs from the
  producer's.

### 4. Batching everywhere (the fourth one nobody mentions)

The producer batches; the broker writes batches; the consumer fetches batches; compression
is applied *per batch*, not per record. A batch of 1,000 similar JSON records compresses
5–10x, because the shared field names appear a thousand times. Compressing each record
individually might achieve 1.2x. **Compression ratio is a function of batch size** — this
is why `linger.ms=0` can *increase* your network bill.

---

## Producer Internals

```
  producer.send(record)  ← RETURNS IMMEDIATELY (a Future). It does not send anything.
        │
        ▼
  ┌───────────────┐
  │  Serializer   │ key → bytes, value → bytes (Avro/Protobuf/JSON)
  └───────┬───────┘
          ▼
  ┌───────────────┐
  │  Partitioner  │ key != null → murmur2(key) % numPartitions
  └───────┬───────┘ key == null → sticky partitioner (2.4+): fill one batch, then switch
          ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │  RECORD ACCUMULATOR  (bounded by buffer.memory, default 32 MB)   │
  │                                                                  │
  │   topic-P0: [ batch(16 KB) ][ batch ][ batch ← filling ]         │
  │   topic-P1: [ batch ← filling ]                                  │
  │   topic-P2: [ batch ][ batch ← filling ]                         │
  │                                                                  │
  │   A batch is sent when:  size >= batch.size                      │
  │                      OR  age  >= linger.ms                       │
  └──────────────────────────────┬───────────────────────────────────┘
                                 ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │  SENDER THREAD (single background thread, "kafka-producer-network")│
  │   • groups ready batches BY BROKER → one request per broker      │
  │   • max.in.flight.requests.per.connection (default 5) in flight   │
  │   • on retriable error, retries per retry.backoff.ms until        │
  │     delivery.timeout.ms is exhausted                              │
  └──────────────────────────────┬───────────────────────────────────┘
                                 ▼
                        broker (partition leader)

  ── IF THE ACCUMULATOR IS FULL, send() BLOCKS for up to max.block.ms (60 s default) ──
     Then throws TimeoutException. This is how a slow broker becomes an
     application-thread outage. See War Story 3.
```

### The configs that matter, and what each actually costs

| Config | Default | What it does | The trade-off |
|---|---|---|---|
| `linger.ms` | 0 | How long to wait for a batch to fill | 0 = lowest latency, worst throughput and compression. **5–20 ms is almost always the right answer** — it costs 5 ms of p50 and can triple throughput. |
| `batch.size` | 16384 | Max bytes per batch per partition | Larger = better compression and fewer requests, more memory (`batch.size × partitions`). 64–256 KB for high throughput. |
| `compression.type` | none | `gzip`/`snappy`/`lz4`/`zstd` | **`lz4`** for CPU-sensitive, **`zstd`** for the best ratio (often 4–6x on JSON) at moderate CPU. `gzip` is slow — avoid. Compression happens on the producer, so it's your app's CPU, not the broker's. |
| `buffer.memory` | 33554432 | Total accumulator size | Too small + slow broker = `send()` blocks. |
| `max.block.ms` | 60000 | How long `send()` blocks when the buffer is full | 60 s is far too long for a request path. Set 1000–5000 and handle the exception. |
| `acks` | all (3.0+) | Durability level | See next section. |
| `enable.idempotence` | true (3.0+) | PID + sequence number dedup | Requires `acks=all`, `retries>0`, `max.in.flight<=5`. Nearly free — never disable it. |
| `max.in.flight.requests.per.connection` | 5 | Unacked requests per connection | **Without idempotence, >1 can reorder on retry.** With idempotence, ≤5 is safe and ordered. |
| `retries` | MAX_INT | Retry count | Bounded in practice by `delivery.timeout.ms`. |
| `delivery.timeout.ms` | 120000 | Total time budget from `send()` to success/failure | This is the config to tune, not `retries`. It must be ≥ `linger.ms + request.timeout.ms`. |

### Sync vs async vs fire-and-forget

```java
// ❌ WRONG #1 — fire and forget. Exceptions are swallowed. You lose data silently.
producer.send(record);

// ❌ WRONG #2 — .get() on every send. Correct, but ~1000x slower: it makes
//    batching impossible, because each send waits for a full round trip.
producer.send(record).get();          // ~2 ms each → 500 msg/s ceiling per thread

// ✅ CORRECT — async with a callback. Full batching, and failures are handled.
producer.send(record, (metadata, ex) -> {
    if (ex != null) {
        if (ex instanceof RetriableException) {
            // The producer ALREADY retried until delivery.timeout.ms. Getting here
            // means it gave up. Do not retry in the callback — you'd reorder.
            log.error("delivery failed after retries, p={} k={}", record.partition(), record.key(), ex);
            deadLetter.write(record);
        } else {
            // RecordTooLargeException, SerializationException, AuthorizationException:
            // permanent. Retrying is pointless.
            log.error("permanent produce failure", ex);
            deadLetter.write(record);
        }
        errorCounter.increment();
    }
});

// And on shutdown — this is the line everyone forgets:
producer.flush();   // block until the accumulator drains
producer.close(Duration.ofSeconds(30));
// Without flush(), a SIGTERM discards everything still in the accumulator.
// At linger.ms=20 and 50k msg/s, that is ~1,000 records lost per pod, per deploy.
```

**The callback runs on the sender thread.** Doing anything slow in it — a database write,
a synchronous HTTP call — stalls *all* production for that producer. Enqueue and return.

---

## Durability: acks, ISR and min.insync.replicas

### The three acks settings

```
  acks=0  ── producer writes to the socket and considers it done ─────────────▶
            Broker not consulted. A dead broker, a full disk, a serialization
            problem on the broker — all invisible. Data loss is silent and
            unbounded.
            WHEN: metrics, click tracking where 0.1% loss is genuinely fine.
            NEVER: anything a human would notice missing.

  acks=1  ── leader writes to ITS page cache, replies OK ─────────────────────▶
            Followers may not have it. If the leader's host dies before
            replication (milliseconds), the record is gone AFTER being ACKed.
            WHEN: logs, high-volume telemetry.
            NOTE: even the leader hasn't fsync'd — it's in page cache. A power
            loss on that one host loses it too.

  acks=all ── leader waits for ALL IN-SYNC REPLICAS to acknowledge ───────────▶
            Combined with min.insync.replicas, this is the real durability
            contract. Costs one replication round trip: p99 ~5–20 ms in-DC.
```

### The contract: `acks=all` + `replication.factor=3` + `min.insync.replicas=2`

**This combination, and only this combination, gives you "no data loss with one broker
failure." Be able to explain why all three are needed.**

```
  replication.factor = 3      → three copies exist
  min.insync.replicas = 2     → the leader REFUSES a write unless ≥2 replicas are in sync
  acks = all                  → the producer WAITS for all current ISR members

  ┌──── Normal: ISR = {L, F1, F2}, size 3 ≥ 2 ──────────────────────────────┐
  │  produce → leader writes → F1, F2 fetch and ack → leader acks producer  │
  │  Survives losing any ONE broker with zero loss.                         │
  └────────────────────────────────────────────────────────────────────────-┘

  ┌──── One follower dies: ISR = {L, F1}, size 2 ≥ 2 ───────────────────────┐
  │  Still accepting writes. Now running with NO redundancy margin.         │
  └────────────────────────────────────────────────────────────────────────-┘

  ┌──── Two followers die: ISR = {L}, size 1 < 2 ───────────────────────────┐
  │  Leader REJECTS the write:                                              │
  │      NotEnoughReplicasException                                         │
  │  ← THIS IS THE SYSTEM WORKING. It chose consistency over availability.  │
  │    The producer retries; if the ISR doesn't recover within               │
  │    delivery.timeout.ms, the send fails and YOUR APP must decide.        │
  └────────────────────────────────────────────────────────────────────────-┘
```

**The classic misconfiguration:** `replication.factor=3` with `min.insync.replicas=3`.
This looks *safer* and is strictly worse — losing any single broker halts all writes to
every partition it hosted. You've built a system with 3x the hardware and *lower*
availability than a single node. `min.insync.replicas` must be `replication.factor - 1`.

**The other classic:** `acks=all` with `min.insync.replicas=1`. `acks=all` means "all
*in-sync* replicas," and if the ISR has shrunk to just the leader, "all" means one. You
believe you have a durability guarantee and you have `acks=1` with extra latency. **The
guarantee comes from `min.insync.replicas`, not from `acks=all`** — `acks=all` only makes
the producer wait for whatever the ISR currently is.

### How ISR membership works

A follower is in the ISR if it has fetched from the leader within
`replica.lag.time.max.ms` (default 30 s, historically 10 s). Note this is **time-based,
not message-count-based** — the old `replica.lag.max.messages` was removed precisely
because a legitimate traffic burst would eject every follower at once.

A follower leaves the ISR when it's slow (GC pause, disk saturation, network) or dead.
`UnderReplicatedPartitions > 0` on any broker is a **page-worthy alert**: you are one
failure away from either data loss or a write outage, depending on your config.

---

## Partitioning and the Ordering Guarantee

### The guarantee, stated precisely

> **Kafka guarantees total ordering within a partition. It guarantees nothing across
> partitions.**

That's it. Everything about Kafka data modeling follows from this sentence.

```
  Topic "orders", 3 partitions. Producer sends with key = order_id.

  P0: [ord-A created ][ ord-A paid ][ ord-A shipped ]   ← A's events, in order. Always.
  P1: [ord-B created ][ ord-B cancelled ]
  P2: [ord-C created ][ ord-C paid ]

  A consumer reading all three partitions may observe:
     A-created, C-created, A-paid, B-created, C-paid, B-cancelled, A-shipped
     ↑ Interleaved across keys. There is NO global order and never will be.
     ↑ But A's three events are ALWAYS in relative order. That is the contract.

  ❌ THE BUG: producing order events with key = null (round-robin)

  P0: [ ord-A paid    ]
  P1: [ ord-A created ]
  P2: [ ord-A shipped ]
       Three consumers process these in parallel. "paid" may be handled before
       "created" exists. Your state machine throws, or worse, silently creates
       a phantom order. This is the #1 Kafka data-modeling bug.
```

**Choosing the key is a design decision, not a detail.** The key answers: "what is the
unit that must be processed in order?" Usually an entity id (`order_id`, `user_id`,
`account_id`), not a type or a timestamp.

### Partitioner internals

```java
// Key present (all clients, all versions):
partition = Utils.toPositive(Utils.murmur2(keyBytes)) % numPartitions;

// Key null:
//   < 2.4: round-robin per record → tiny batches, poor compression
//  >= 2.4: STICKY partitioner — fill one partition's batch, then pick a new
//          partition. Same overall balance, far better batching.
//  >= 3.3: uniform sticky, also adapts to slow brokers.
```

**The consequence nobody plans for:** `murmur2(key) % numPartitions` means **increasing
the partition count remaps every key.** After a resize, `order-123` may hash to a
different partition than before — so its old events are in P2 and new ones in P5, and
ordering across the change is broken permanently.

```
  ❌ WRONG: "we have consumer lag, let's bump partitions from 12 to 24"
     Result: every key's partition changes. In-flight state machines break.
     Compacted topics get two live versions of the same key in two partitions.
     There is NO fix after the fact.

  ✅ CORRECT options:
     1. Over-provision partitions AT CREATION. Partitions are cheap-ish;
        remapping is not. Size for 2–3 years of growth.
     2. If you must resize: create a NEW topic with the new count, dual-write
        or replay into it, cut consumers over, retire the old topic.
     3. Use a custom partitioner with consistent hashing if you know you'll
        resize (rare, and it has its own complexity).
```

### Choosing a partition count

```
  target_throughput = 60,000 msg/s
  per-partition consumer throughput (measured!) = 3,000 msg/s
  ──────────────────────────────────────────────────────────
  minimum partitions = 60,000 / 3,000 = 20
  headroom ×2 for growth and consumer slowdowns → 40 partitions

  Constraints pulling the other way:
   • Partitions = the parallelism CEILING. 40 partitions → at most 40 useful
     consumers in a group. The 41st sits idle. Forever.
   • Each partition = open file handles + memory on every broker
   • More partitions → longer leader election on broker failure
   • More partitions → producer memory = batch.size × partitions × brokers
   • Practical: ≤ 4,000 partitions per broker; ≤ 200k per ZK cluster
     (KRaft removes this ceiling — millions are feasible)
   • End-to-end latency degrades above ~1,000 partitions per topic
```

### Hot partitions

If one key is 40% of traffic — a large tenant, a bot, a default value like `"unknown"` —
that partition's consumer is saturated while the rest idle. Adding consumers does nothing;
a partition is consumed by exactly one member of the group.

```
  Detection: per-partition lag is wildly skewed.
    P0: lag 12       P1: lag 8        P2: lag 4,200,000  ← there it is

  Fixes, in order of preference:
   1. Composite key: `${tenant_id}:${entity_id}` — preserves per-entity ordering,
      spreads the tenant across partitions. Correct if your ordering requirement
      is per-entity, which it usually is.
   2. Salted key for the hot key only: `${key}:${n % 8}`, and make the consumer
      tolerate interleaving for that key.
   3. Separate topic for the whale tenant with its own partition count and
      consumer group.
   4. If ordering doesn't actually matter for this stream: key = null.

  Always check for the null/default key first. "unknown" as a tenant id sending
  everything to one partition is the single most common cause.
```

---

## Consumer Groups and Rebalancing

### The model

```
  Topic: orders (4 partitions)              Group: "billing"

  3 consumers:                              4 consumers:
   c1 → P0, P1                               c1 → P0
   c2 → P2                                   c2 → P1
   c3 → P3                                   c3 → P2
                                             c4 → P3

  5 consumers:
   c1 → P0   c2 → P1   c3 → P2   c4 → P3   c5 → ␀  ← IDLE. Costs money, does nothing.

  ── A partition is assigned to EXACTLY ONE consumer in a group. ──
  ── Partition count is therefore a hard parallelism ceiling.    ──
```

### The rebalance protocol

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │ Every group has a GROUP COORDINATOR: the broker leading the            │
  │ __consumer_offsets partition for hash(group.id) % 50                   │
  └───────────────────────────┬────────────────────────────────────────────┘
                              │
  Trigger: member joins, leaves, times out, or partition count changes
                              │
                              ▼
  1. Coordinator increments the GENERATION ID and marks the group rebalancing
  2. Each member sends JoinGroup and BLOCKS
     ── EAGER protocol: every member has ALREADY REVOKED ALL its partitions ──
     ── THE ENTIRE GROUP IS NOW CONSUMING NOTHING. This is "stop the world." ──
  3. Coordinator picks one member as GROUP LEADER, sends it the member list
  4. The leader computes the assignment (client-side!) via partition.assignment.strategy
  5. Members send SyncGroup, receive their assignment
  6. Members fetch committed offsets and resume

  Duration: 100 ms (small, fast group) to 60+ SECONDS (large group, slow
  member, or a member that must wait out max.poll.interval.ms)
```

### Eager vs cooperative-sticky — the most important consumer config

```
  EAGER (RangeAssignor / RoundRobinAssignor) — the pre-2.4 default:

    t0  Group of 10 consumers, 100 partitions, all consuming happily
    t1  ONE consumer is added
    t2  ALL 10 revoke ALL 100 partitions      ← 100% throughput loss
    t3  ────────── GROUP CONSUMES NOTHING ──────────  (seconds)
    t4  New assignment distributed; 11 consumers × ~9 partitions
        Note: ~90 of the 100 assignments are IDENTICAL to before.
        The stop-the-world was almost entirely wasted work.

  COOPERATIVE-STICKY (CooperativeStickyAssignor) — 2.4+:

    t0  Same state
    t1  One consumer added
    t2  Round 1: leader computes the new assignment; members revoke ONLY the
        partitions that must move (~9 of 100). The other ~91 KEEP CONSUMING.
    t3  Round 2: the freed 9 are assigned to the new member.
        Throughput dip: ~9%, for ~200 ms. Not 100% for 30 seconds.
```

```java
// ✅ Set this on every consumer. There is essentially no reason not to.
props.put(ConsumerConfig.PARTITION_ASSIGNMENT_STRATEGY_CONFIG,
          "org.apache.kafka.clients.consumer.CooperativeStickyAssignor");
```

**Migration caveat (the follow-up question):** you cannot flip this in one deploy. You
must first deploy with **both** strategies listed
(`[CooperativeStickyAssignor, RangeAssignor]`), let every member roll, then deploy again
with only the cooperative one. Skipping the two-step causes a group that cannot form.

Kafka 3.7+/4.0 introduces **KIP-848**, a next-generation protocol that moves assignment
computation to the broker and makes rebalances fully incremental — eventually removing
the client-side leader entirely. Worth naming; it's the direction of travel.

### The two timeouts everyone confuses

**This is the single most commonly failed Kafka interview question.**

```
  ┌──────────────────────────────────────────────────────────────────────────┐
  │ session.timeout.ms  (default 45 s)                                       │
  │   Measured by: the HEARTBEAT THREAD, a separate background thread        │
  │   Fires when:  no heartbeat received for this long                       │
  │   Means:       "this consumer's PROCESS is dead / partitioned"           │
  │   Caused by:   crash, kill -9, network partition, long JVM GC pause      │
  │   Tuning:      heartbeat.interval.ms should be ≈ session.timeout.ms / 3  │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────────┐
  │ max.poll.interval.ms  (default 300 s / 5 min)                            │
  │   Measured by: the MAIN thread — time between consecutive poll() calls   │
  │   Fires when:  your processing loop takes too long between polls         │
  │   Means:       "this consumer is ALIVE but STUCK / too slow"             │
  │   Caused by:   slow per-record processing, a blocking downstream call,   │
  │                a retry loop with sleeps, an unbounded batch              │
  │   Effect:      the consumer proactively LEAVES the group, triggering     │
  │                a rebalance — while still processing records it no        │
  │                longer owns.                                              │
  └──────────────────────────────────────────────────────────────────────────┘

  The lethal detail: the heartbeat thread keeps heartbeating happily while your
  main thread is stuck. So the group thinks the member is healthy right up until
  max.poll.interval.ms fires. THEN it rebalances — and the stuck consumer's
  offsets can't be committed because it no longer owns the partitions
  (CommitFailedException). Everything it processed gets reprocessed by someone else.
```

```java
// ❌ WRONG — the rebalance storm generator
props.put("max.poll.records", 500);            // default
props.put("max.poll.interval.ms", 300000);     // default 5 min
// Processing = 2 s/record (an external HTTP call).
// 500 records × 2 s = 1,000 s > 300 s → EVERY POLL CYCLE times out.
// Rebalance → reassign → new consumer takes 500 records → times out → rebalance...
// The group NEVER makes progress. Lag grows forever. See War Story 1.

// ✅ CORRECT — bound the work per poll to fit the budget
props.put("max.poll.records", 50);             // 50 × 2 s = 100 s
props.put("max.poll.interval.ms", 180000);     // 3 min, comfortably > 100 s
props.put("session.timeout.ms", 45000);
props.put("heartbeat.interval.ms", 15000);     // ~1/3 of session timeout

// ✅ BETTER for genuinely slow work — decouple polling from processing
//    Poll fast, hand off to a bounded worker pool, and use pause/resume so the
//    consumer keeps polling (satisfying the timeout) without fetching more.
consumer.pause(consumer.assignment());
CompletableFuture.allOf(futures).join();
consumer.pause(Collections.emptySet());        // i.e. resume
consumer.commitSync(offsets);
// This is what Spring Kafka's async ack and Confluent's parallel-consumer do.
```

**Sizing rule:** `max.poll.interval.ms > max.poll.records × p99.9_processing_time_per_record`,
with at least 2x margin. Measure p99.9, not the average — a single 30-second outlier
against a 300-second budget with 500 records is enough to trip it.

### Static membership

```java
props.put("group.instance.id", "billing-consumer-" + podOrdinal);   // stable per pod
props.put("session.timeout.ms", 120000);                            // > restart time
```

**WHAT it does:** a member with a `group.instance.id` keeps its partition assignment
across a restart, as long as it comes back within `session.timeout.ms`. No rebalance at
all.

**WHY it matters:** a rolling deploy of a 30-consumer group without static membership
triggers up to 60 rebalances (one on each leave, one on each join). With static membership
and a session timeout longer than pod restart time: **zero**. For Kubernetes
StatefulSets, this is close to mandatory.

**TRADE-OFF:** genuine failures now take up to `session.timeout.ms` to detect, so those
partitions stall for up to two minutes. You are trading failure-detection latency for
deploy stability. For most services that's the right trade — deploys happen daily,
crashes don't.

---

## Offset Management and Delivery Semantics

### Where offsets live

Committed offsets go to the internal compacted topic `__consumer_offsets` (50 partitions
by default), keyed by `(group, topic, partition)`. Compaction means only the latest offset
per key is retained. `offsets.retention.minutes` (default 7 days) deletes the offsets of
a group that has been inactive that long — after which a restarted consumer falls back to
`auto.offset.reset`, which is how a weekend-idle group comes back on Monday and
reprocesses everything (`earliest`) or skips a weekend (`latest`).

### Why auto-commit loses AND duplicates messages

`enable.auto.commit=true` with `auto.commit.interval.ms=5000` does not commit on a timer
in the background. It commits **inside `poll()`**, if enough time has elapsed, for the
offsets returned by the *previous* poll — regardless of whether you processed them.

```
  ── DUPLICATES ────────────────────────────────────────────────────────────
  t=0.0  poll() → records 100..199
  t=0.1  processed 100..149  (150 records to go)
  t=2.0  ✗ CRASH
  Last commit was offset 100. Restart → reprocess 100..199.
  Records 100..149 processed TWICE. → at-least-once. Usually acceptable.

  ── LOST MESSAGES (the one that surprises people) ─────────────────────────
  t=0.0  poll() → records 100..199
  t=0.1  hand records to a thread pool / async pipeline, loop continues
  t=5.1  poll() → AUTO-COMMITS offset 200 (the previous poll's end)
                  ...but records 150..199 are STILL IN THE QUEUE, unprocessed
  t=5.2  ✗ CRASH
  Restart from 200. Records 150..199 are NEVER processed and never will be.
  → at-most-once, silently, with no error anywhere.

  ── LOST ON REBALANCE ─────────────────────────────────────────────────────
  Same shape: auto-commit fires at the start of a poll, a rebalance takes the
  partition away mid-batch, and the new owner starts from the committed offset —
  past records the old owner never finished.
```

**The rule: auto-commit is safe only if processing is fully synchronous inside the poll
loop and you accept at-least-once.** The moment there's a queue, a thread pool, or a
`CompletableFuture`, auto-commit becomes a silent data-loss bug.

### Manual commit, done correctly

```java
// ❌ WRONG — commits after every record. Correct but ~200x slower;
//    commitSync is a full broker round trip (~2–5 ms).
for (var r : records) { process(r); consumer.commitSync(); }

// ❌ WRONG — commits record.offset() instead of offset()+1.
//    You reprocess the last record of every batch, forever.
offsets.put(tp, new OffsetAndMetadata(record.offset()));

// ✅ CORRECT — commit per batch, offset+1, sync on close, async in the loop
props.put("enable.auto.commit", "false");

try {
  while (running) {
    var records = consumer.poll(Duration.ofMillis(1000));
    if (records.isEmpty()) continue;

    var offsets = new HashMap<TopicPartition, OffsetAndMetadata>();
    for (var r : records) {
      process(r);                                   // MUST be idempotent
      offsets.put(new TopicPartition(r.topic(), r.partition()),
                  new OffsetAndMetadata(r.offset() + 1));   // ← +1. Always.
    }
    // Async in the hot path: no round-trip stall. A failed async commit is fine
    // because the NEXT successful commit supersedes it.
    consumer.commitAsync(offsets, (o, e) -> {
      if (e != null) log.warn("async commit failed (will be superseded)", e);
    });
  }
} catch (WakeupException e) {
  // expected on shutdown
} finally {
  try {
    consumer.commitSync();      // ← SYNC on the way out. The async commit may
                                //   not have landed. This is what makes a clean
                                //   shutdown actually clean.
  } finally {
    consumer.close();           // sends LeaveGroup → fast rebalance instead of
                                //   waiting out session.timeout.ms
  }
}
```

**Also implement `ConsumerRebalanceListener.onPartitionsRevoked` to commit before losing
a partition** — otherwise every rebalance reprocesses whatever wasn't committed. With
cooperative rebalancing, use `onPartitionsLost` for the not-cleanly-revoked case.

### The delivery semantics table

| Semantic | How you get it | You will see | Cost | Use when |
|---|---|---|---|---|
| **At-most-once** | Commit offset *before* processing | Gaps on crash | Cheapest | High-volume metrics where a gap is invisible |
| **At-least-once** | Commit *after* processing (manual) | Duplicates on crash/rebalance | Standard | **~95% of real systems.** Pair with idempotent processing. |
| **Exactly-once (EOS)** | Transactions: `read → process → write + offset commit` in one atomic unit | Neither, *within Kafka* | 3–20% throughput; higher latency; more failure modes | Kafka→Kafka pipelines, financial aggregation |
| **Effectively-once** | At-least-once + idempotent sink (unique key, upsert, dedupe table) | Duplicates delivered, absorbed by the sink | Near zero | **The pragmatic answer.** Works across system boundaries where EOS does not. |

**The senior framing:** exactly-once "delivery" over a network is impossible (two
generals). What Kafka's EOS provides is exactly-once *processing* for the specific case of
consuming from Kafka and producing to Kafka, atomically with the offset commit. The moment
you write to Postgres, S3, or a third-party API, Kafka's transaction does not extend
there, and you need idempotency at the sink anyway. So most of the time the right answer is
**at-least-once plus an idempotent sink**, and the mature move is to make your consumer
idempotent rather than to enable EOS.

---

## Replication Internals: High Watermark, Leader Epoch, Unclean Election

### High watermark and log end offset

```
  LEADER (broker 1)                LEO=110    HW=107
  ┌──────────────────────────────────────────────┬───┬───┬───┐
  │ 0 ..................................... 106  │107│108│109│
  └──────────────────────────────────────────────┴───┴───┴───┘
                                                  ▲ not visible to consumers

  FOLLOWER F1                      LEO=108
  ┌──────────────────────────────────────────────┬───┐
  │ 0 ..................................... 106  │107│
  └──────────────────────────────────────────────┴───┘

  FOLLOWER F2                      LEO=110
  ┌──────────────────────────────────────────────┬───┬───┬───┐
  │ 0 ..................................... 106  │107│108│109│
  └──────────────────────────────────────────────┴───┴───┴───┘

  HW = min(LEO across all ISR members) = min(110, 108, 110) = 108
       (records 0..107 are readable; 108 and 109 are not yet)

  Followers learn the HW from the leader's fetch RESPONSE, so a follower's HW
  always lags the leader's by one fetch round trip. That lag is exactly why the
  leader epoch mechanism (below) is necessary.
```

### Leader epoch — why it exists

Before KIP-101 (Kafka 0.11), a follower recovering from a crash truncated its log to its
own (possibly stale) high watermark and then refetched. Under specific interleavings this
caused **log divergence**: two replicas with different records at the same offset. Silent
corruption.

The fix: every leadership change increments a monotonic **leader epoch**, and each replica
persists an `epoch → start offset` map in `leader-epoch-checkpoint`. On recovery, the
follower asks the leader "what's the end offset of my last known epoch?" and truncates to
exactly that point. It's a version vector for leadership, and it makes truncation provably
correct.

Interview value: naming leader epoch shows you've read past the marketing docs. The
one-line summary — *"it replaces high-watermark-based truncation, which could diverge, with
epoch-based truncation, which cannot"* — is enough.

### Unclean leader election — the silent data-loss switch

```
  unclean.leader.election.enable = false   ← DEFAULT since 0.11, and correct

  ┌──── Setup: partition P0, RF=3, ISR = {B1(leader), B2, B3} ─────────────┐
  │ B1 has offsets 0..1000 (all replicated). All healthy.                  │
  └────────────────────────────────────────────────────────────────────────┘

  1. B2 and B3 go down (rack power event). ISR shrinks to {B1}.
  2. With min.insync.replicas=2, B1 now REJECTS acks=all writes. Good.
     (If min.insync.replicas were 1, B1 keeps accepting: offsets 1001..2000
      exist ONLY on B1. Remember this.)
  3. B1 dies too. No ISR members are alive. The partition is OFFLINE.

  ── unclean.leader.election.enable = false ──────────────────────────────
     Partition stays offline. Producers get errors. Consumers stall.
     You have an OUTAGE, and you have LOST NOTHING.
     Recovery: bring back any former ISR member.

  ── unclean.leader.election.enable = true ───────────────────────────────
     B2 comes back with only offsets 0..800 (it was behind when it died).
     Kafka elects B2 leader ANYWAY, because it prefers availability.
     ┌──────────────────────────────────────────────────────────────────┐
     │ Offsets 801..2000 — WHICH WERE ACKNOWLEDGED TO PRODUCERS —       │
     │ ARE PERMANENTLY GONE.                                            │
     │ Worse: B2's new writes reuse offsets 801+. When B1 returns it    │
     │ truncates to match. Two different records once held offset 900.  │
     │ A consumer that already read the old 801..2000 has processed     │
     │ records the cluster now says never existed.                      │
     │ NO ERROR IS RAISED. NOTHING IN ANY LOG SAYS "DATA LOST."         │
     └──────────────────────────────────────────────────────────────────┘
     Your only signal: the JMX metric UncleanLeaderElectionsPerSec.
     ALERT ON IT.
```

**WHEN `true` is defensible:** genuinely loss-tolerant, high-volume telemetry where an
offline partition is worse than a gap. Even then, be deliberate and document it. It is
never defensible for orders, payments, or anything that feeds a ledger.

**Related setting:** `min.insync.replicas` is what stops step 2 from creating the
under-replicated tail in the first place. Unclean election is the second line of defense
failing; `min.insync.replicas` is the first.

### Rack awareness

`broker.rack` + `replica.selector.class=RackAwareReplicaSelector` places the three replicas
in three availability zones, so an AZ loss costs you one replica, not all three. It also
enables **follower fetching** (KIP-392), letting consumers read from a same-AZ replica —
which on AWS eliminates a large cross-AZ data-transfer bill. For a cluster moving 200 MB/s,
that's a five-figure annual line item.

---

## Idempotence, Transactions and Exactly-Once

### Idempotent producer

```java
props.put("enable.idempotence", true);   // default since Kafka 3.0
```

**The problem it solves:** the producer sends a batch, the broker writes it, the ACK is
lost to a network blip, the producer retries, and the broker writes it **again**. A
duplicate created by a *successful* write. Retries alone always create this.

**HOW:** on init the producer gets a **Producer ID (PID)**. Every batch carries
`(PID, partition, sequence number)`. The broker tracks the last sequence per
`(PID, partition)` and:
- `seq == last + 1` → accept
- `seq <= last` → **duplicate**, silently discard, return success
- `seq > last + 1` → **gap** → `OutOfOrderSequenceException` (something was lost; the
  producer's state is unrecoverable for that partition)

This also **preserves ordering under retry** with up to 5 in-flight requests, because the
broker rejects out-of-sequence batches rather than writing them out of order. Without
idempotence, `max.in.flight.requests.per.connection > 1` plus a retry silently reorders
your records.

**Scope and limits — the follow-up:** idempotence is per producer *session*, per
partition. If the producer process restarts, it gets a new PID and the dedup state is
gone. It does not deduplicate at the application level: if your code calls `send()` twice
for the same business event, you get two records. It is a transport-level guarantee only.
Cost: essentially zero. Never disable it.

### Transactions and EOS

```
  ┌───────── consume-transform-produce, atomically ──────────────────┐
  │                                                                  │
  │  producer.initTransactions()          // once, at startup        │
  │  ─────────────────────────────────────────────────────────────   │
  │  loop:                                                           │
  │    records = consumer.poll()                                     │
  │    producer.beginTransaction()                                   │
  │    for r in records:                                             │
  │        producer.send(transform(r))          → output topic       │
  │    producer.sendOffsetsToTransaction(offsets, consumerGroupMeta) │
  │                       ▲ the offset commit is INSIDE the txn      │
  │    producer.commitTransaction()                                  │
  │                                                                  │
  │  Either BOTH the outputs and the offset commit land, or NEITHER. │
  └──────────────────────────────────────────────────────────────────┘

  Under the hood:
    • A TRANSACTION COORDINATOR per transactional.id, backed by the internal
      topic __transaction_state
    • Records are written to partitions IMMEDIATELY, marked uncommitted
    • On commit, the coordinator writes a COMMIT MARKER to every touched partition
    • Consumers with isolation.level=read_committed skip records whose transaction
      hasn't committed, by tracking the Last Stable Offset (LSO)
    • Zombie fencing: a producer with the same transactional.id but an older epoch
      is rejected — this is what makes a restarted/duplicated instance safe
```

```java
// Producer
props.put("transactional.id", "payment-processor-" + instanceId);  // STABLE per instance
props.put("enable.idempotence", true);
props.put("acks", "all");

// Consumer — WITHOUT THIS LINE, EOS DOES NOTHING FOR YOU
props.put("isolation.level", "read_committed");
props.put("enable.auto.commit", false);      // offsets are committed by the producer
```

**The real cost — be specific in an interview:**

| Cost | Detail |
|---|---|
| Throughput | 3–20% lower. Commit markers are extra writes; small transactions amortize badly. |
| Latency | `read_committed` consumers cannot read past the LSO, so a **long-running transaction blocks all downstream consumers of that partition** — even for records from other producers. One stuck producer stalls a whole pipeline. |
| Timeouts | `transaction.timeout.ms` must be ≤ broker `transaction.max.timeout.ms` (15 min). A transaction that exceeds it is aborted, and the producer is fenced. |
| Operational | An extra internal topic, an extra coordinator, an extra failure mode. Debugging a hung transaction at 3 a.m. is genuinely unpleasant. |
| Scope | **Kafka-to-Kafka only.** It does not span your database or an external API. |

**WHEN to use transactions:** Kafka→Kafka stream processing where duplicate output is
expensive and the sink can't dedupe — Kafka Streams with `processing.guarantee=exactly_once_v2`
does all of this for you and is the sane way to consume it.

**WHEN NOT:** if your sink is a database, use at-least-once + an upsert on a natural key or
a `processed_events(event_id)` table with a unique constraint. It's simpler, faster, and
it actually covers the boundary EOS doesn't reach.

```sql
-- The "effectively-once" pattern that beats EOS at a DB sink.
-- One transaction; a replayed message is a no-op.
BEGIN;
  INSERT INTO processed_events(event_id) VALUES ($1) ON CONFLICT DO NOTHING;
  -- if 0 rows inserted, this is a duplicate → skip the side effect
  UPDATE balances SET amount = amount + $2 WHERE id = $3;
COMMIT;
```

---

## Retention and Log Compaction

### Delete retention

```properties
cleanup.policy=delete
retention.ms=604800000          # 7 days
retention.bytes=-1              # per PARTITION, not per topic. -1 = unlimited.
segment.bytes=1073741824        # 1 GB
segment.ms=604800000            # force a roll after 7 days even if not full
```

**The mechanics that trip people up:** deletion happens at **segment granularity**, and the
**active segment is never deleted**. A low-volume topic with `retention.ms=3600000`
(1 hour) and `segment.bytes=1GB` will keep data for days, because the segment never fills
and never rolls. If you need retention to actually bite, set `segment.ms` too.

`retention.bytes` is **per partition**. `retention.bytes=10GB` on a 50-partition topic
means up to 500 GB per replica, and 1.5 TB across an RF=3 cluster. Disk-full incidents
almost always trace back to this misreading.

### Log compaction

```properties
cleanup.policy=compact
min.cleanable.dirty.ratio=0.5      # start compacting at 50% duplicate
delete.retention.ms=86400000       # how long tombstones survive — 24 h
min.compaction.lag.ms=0
max.compaction.lag.ms=...          # forces compaction even below the dirty ratio
                                   # (needed for GDPR-style guaranteed erasure)
```

```
  BEFORE compaction (offsets are preserved — note the gaps after):
  ┌────┬────┬────┬────┬────┬────┬────┬────┐
  │ 0  │ 1  │ 2  │ 3  │ 4  │ 5  │ 6  │ 7  │
  │ A=1│ B=1│ A=2│ C=1│ B=2│ A=3│ C=∅│ D=1│    ∅ = tombstone (null value)
  └────┴────┴────┴────┴────┴────┴────┴────┘
   ◀── "cleaned" ──▶◀────── "dirty" (head) ──────▶
   The ACTIVE segment is never compacted, so the head always has duplicates.

  AFTER compaction:
  ┌────┬────┬────┬────┐
  │ 4  │ 5  │ 6  │ 7  │
  │ B=2│ A=3│ C=∅│ D=1│
  └────┴────┴────┴────┘
   • Only the LATEST value per key survives.
   • Original offsets are kept — offsets 0–3 simply no longer exist. A consumer
     seeking to offset 2 gets offset 4. Offsets remain monotonic, not contiguous.
   • The tombstone C=∅ is retained for delete.retention.ms so that consumers
     which are behind still SEE the delete. Then it is removed too.
```

**WHEN compaction is the right call:**
- A **changelog / snapshot** topic where you only care about current state per key: user
  profiles, product catalogs, feature flags, CDC of a database table.
- A topic that must be **replayable into a cache or state store** from the beginning — a
  new service bootstraps by reading from offset 0 and gets exactly one record per key.
  This is how Kafka Streams restores state stores, and how `__consumer_offsets` works.
- Infinite retention of *state* without infinite storage of *history*.

**WHEN NOT:**
- You need the event history. Compaction destroys it by design. "Every balance change"
  and "current balance" are different topics with different cleanup policies. Teams that
  compact their event-sourcing topic discover this after the history is gone.
- **Records with a null key.** Compaction cannot process them — the cleaner logs an error
  and stalls. A single null-keyed record can wedge the log cleaner for the whole broker,
  which then silently stops compacting *every* compacted topic including
  `__consumer_offsets`, which then grows until the disk fills. Monitor
  `LogCleanerManager` / `max-dirty-percent` and alert if the cleaner thread dies.

`cleanup.policy=compact,delete` combines both: compact to the latest value per key, *and*
drop anything older than `retention.ms`. Useful for a changelog where keys go permanently
cold.

---

## Consumer Lag: Measuring, Diagnosing, Fixing

### Measuring

```bash
kafka-consumer-groups.sh --bootstrap-server broker:9092 \
  --describe --group billing

# TOPIC   PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG    CONSUMER-ID
# orders  0          1048200         1048250         50
# orders  1          1048100         1048300         200
# orders  2           410000         2100000     1690000    ← THE PROBLEM IS HERE
# orders  3          1048180         1048240         60
```

**Always look at per-partition lag, never the sum.** Total lag of 1.69M looks like "the
group is slow"; the breakdown says "P2 is broken" — a hot key, a poison message, or a dead
consumer — and those have completely different fixes.

**Lag in records is a poor SLO.** 1M records of 100-byte clicks is seconds of work; 1M
records requiring a 200 ms API call each is 55 hours. **Alert on time-lag**
(`records_lag / consumption_rate`, or Burrow's evaluation), because that's what the
business cares about. Prometheus + `kafka_exporter` or Burrow both expose this.

### Diagnosing

```
   Lag is rising. Is it EVERY partition or SOME?
                 │
      ┌──────────┴──────────┐
      ▼                     ▼
   SOME partitions      ALL partitions
      │                     │
      ├─ Hot key? Check     ├─ Producer rate spiked? Compare bytes-in to baseline.
      │  key distribution.  │  → autoscale consumers (up to the partition count)
      │  Fix: composite key ├─ Consumer got slower? Check the deploy timeline.
      │                     │  → a new synchronous call in the loop is the usual cause
      ├─ Consumer dead/     ├─ Downstream slow? DB/API p99 up?
      │  stuck? Check       │  → the real fix is downstream, not in Kafka
      │  CONSUMER-ID empty  ├─ Rebalance loop? Check rebalance-rate-per-hour.
      │  → the partition    │  → if > ~1/hour, the group is thrashing (War Story 1)
      │    has no owner     ├─ At the partition ceiling? consumers == partitions?
      │                     │  → adding consumers does NOTHING. See below.
      └─ Poison message?    └─ GC pauses? Long JVM pauses look exactly like slow
         Same offset            processing and also break heartbeats.
         retried forever
```

### Fixing — in the order you should try them

1. **Add consumers, up to the partition count.** Instant, no downside. Then you hit the
   ceiling and it stops helping — the 41st consumer on a 40-partition topic is idle.
2. **Make processing faster.** Batch the downstream writes (100 individual `INSERT`s → one
   `COPY`), remove a synchronous call, cache a lookup. Usually 10–100x and it's free.
   This is where the real wins are and it's the step people skip.
3. **Increase `max.poll.records` and `fetch.min.bytes`** if you're throughput-bound rather
   than processing-bound — more work per round trip.
4. **Parallelize within a partition** — only if strict ordering isn't required, or is
   required only per key. Hash by key onto an internal worker pool, and commit only the
   contiguous prefix of completed offsets. Confluent's parallel-consumer does exactly
   this. Getting the commit logic right by hand is harder than it looks.
5. **Add partitions.** Last resort — it remaps keys and breaks ordering across the change.
   See [Partitioning](#partitioning-and-the-ordering-guarantee).
6. **Shed load.** If lag is unrecoverable and the data is time-sensitive (live
   recommendations, real-time dashboards), `seekToEnd()` and abandon the backlog
   deliberately. Better to be current and honest than 6 hours behind and pretending.

---

## Schema Registry and Evolution

**WHY it exists:** the broker stores opaque bytes. Without a contract, a producer team
renames a field on Tuesday and every consumer breaks on Tuesday — at *runtime*, in
production, on data already committed to a durable log that you cannot un-publish.

**HOW it works:**

```
  Producer                    Schema Registry               Consumer
     │  register schema  ───────▶  returns schema ID 42        │
     │                             (checks compatibility        │
     │                              against the subject's       │
     │                              existing versions —         │
     │                              REJECTS an incompatible     │
     │                              schema AT DEPLOY TIME)      │
     │                                                          │
     │  produce:  [magic 0x00][4-byte schema id][avro payload]  │
     ├─────────────────── Kafka ───────────────────────────────▶│
     │                                                          │
     │                             ◀── GET /schemas/ids/42 ─────┤ (cached forever)
     │                                                          │  deserialize
```

The record carries a 5-byte header, not the schema — so schema overhead is 5 bytes per
record rather than several hundred. That's a large part of why Avro beats JSON on the wire
for high-volume topics.

### Compatibility modes

| Mode | Allows | Upgrade order | Use when |
|---|---|---|---|
| `BACKWARD` (default) | Delete a field; add an **optional** field (with a default) | **Consumers first** | Most common. New consumer can read old data. |
| `FORWARD` | Add a field; delete an **optional** field | **Producers first** | You control producers but consumers are external/slow to update. |
| `FULL` | Both — only add/remove optional fields with defaults | Either | Strict contracts, external consumers. |
| `*_TRANSITIVE` | Same, checked against **all** past versions, not just the latest | Either | Compacted topics and long-retention topics, where a consumer reading from offset 0 encounters *every* historical version. **This is the correct choice more often than the default.** |
| `NONE` | Anything | — | Never in production. |

**The trap in the default:** plain `BACKWARD` only checks against the *immediately
previous* version. Over ten releases you can drift into a schema that can't read version 1
— which is fine for a 7-day topic and fatal for a compacted topic that a new consumer
bootstraps from offset 0. **Use `BACKWARD_TRANSITIVE` on compacted and long-retention
topics.**

### Rules that survive contact with production

```
✅ SAFE (backward compatible):
   • Add a field WITH a default          → old data deserializes, default fills in
   • Remove a field that HAD a default
   • Add a value to the end of an enum   (Avro: only if a default is declared)
   • Widen a type: int → long, float → double

❌ BREAKING:
   • Add a REQUIRED field (no default)   → old records have no value for it
   • Rename a field                      → this is delete + add, i.e. two breaks
   • Change a type incompatibly: string → int
   • Narrow a type: long → int
   • Change a field's default and expect old readers to see it
     (readers use THEIR OWN schema's default — this catches people out)
```

**Avro vs Protobuf:** Avro's resolution rules are more expressive (aliases let you rename
a field), the ecosystem integration is deeper, and it's the Kafka default. Protobuf has
better cross-language codegen, is faster to serialize, and field-number-based evolution is
easier to reason about. Both are correct choices; JSON Schema is supported but you lose the
compact binary encoding, which matters at volume.

**The deploy discipline that actually prevents outages:** wire the compatibility check into
CI. A `mvn schema-registry:test-compatibility` step (or the equivalent) that fails the
build turns a production incident into a red pipeline. That's the entire value proposition
of a schema registry, and it's routinely installed and then not enforced.

---

## KRaft: Life After ZooKeeper

**WHY ZooKeeper had to go:**

| Problem | Detail |
|---|---|
| Two distributed systems | Two things to deploy, monitor, secure, upgrade, and be paged for. ZK failure modes are different from Kafka's and the on-call needs both skill sets. |
| Metadata scaling wall | ~200,000 partitions per cluster. Beyond that, ZK watches and the controller's in-memory model become the bottleneck. |
| Slow controller failover | The new controller read the **full** partition state from ZK — **tens of seconds to minutes** on a large cluster, during which no leader elections happen anywhere. |
| Propagation is O(partitions) | Every metadata change fanned out individually. |

**HOW KRaft works:**

```
  ┌──────────── ZooKeeper mode (legacy) ─────────────────────────────────┐
  │  ZK ensemble (3–5 nodes)                                             │
  │      ▲ watches                                                       │
  │  one broker is elected CONTROLLER; on failover the new controller    │
  │  reads ALL metadata from ZK (O(partitions), slow) and rebuilds state │
  └──────────────────────────────────────────────────────────────────────┘

  ┌──────────── KRaft mode (3.3+ production-ready, 4.0 only mode) ────────┐
  │  CONTROLLER QUORUM (3 or 5 nodes running a Raft log)                  │
  │  ┌──────────┐   ┌──────────┐   ┌──────────┐                           │
  │  │ ctrl-1   │◀─▶│ ctrl-2   │◀─▶│ ctrl-3   │   __cluster_metadata      │
  │  │ (leader) │   │(follower)│   │(follower)│   is a Kafka topic         │
  │  └────┬─────┘   └──────────┘   └──────────┘   replicated by Raft       │
  │       │ metadata records                                              │
  │       ▼                                                               │
  │  brokers TAIL the metadata log and cache it locally                   │
  │                                                                       │
  │  Controller failover: a follower ALREADY HAS the full log in memory.  │
  │  Promotion is milliseconds, not minutes.                              │
  │  Metadata propagation is INCREMENTAL — brokers fetch a delta.         │
  └──────────────────────────────────────────────────────────────────────┘
```

**What you get:** controller failover in ~1 s instead of ~30–60 s; support for millions of
partitions; a single system to operate and secure; faster broker startup (a broker replays
a metadata log rather than pulling full state).

**Migration reality:** 3.5+ supports a ZK→KRaft migration with a dual-write bridge, but it
is a genuine project, not a config flag — it is one-way, and rollback after the point of
no return is not supported. Kafka **4.0 removed ZooKeeper entirely**, so this is not
optional in the long run. In an interview: know that ZK is gone, know *why* (scaling and
failover latency), and know that combined broker+controller mode is fine for development
but that production wants dedicated controller nodes.

---

## Kafka vs RabbitMQ vs SQS vs Pulsar

| | **Kafka** | **RabbitMQ** | **AWS SQS** | **Pulsar** |
|---|---|---|---|---|
| Model | Distributed log | Queue + exchange routing | Managed queue | Log + tiered storage |
| Retention after read | Yes (time/size/compaction) | No — deleted on ack | Up to 14 days | Yes, incl. offload to S3 |
| Replay | Native, trivial | No | No | Native |
| Ordering | Per partition | Per queue (single consumer) | FIFO queues only (300 msg/s per group, 3000 batched) | Per partition/key |
| Throughput | Millions/s | ~50k/s per queue | Effectively unlimited (standard) | Millions/s |
| Latency p99 | 5–50 ms | **< 1–5 ms** | 10–100 ms | 5–20 ms |
| Per-message TTL | ❌ | ✅ | ✅ | ✅ |
| Priority queues | ❌ | ✅ | ❌ | ❌ |
| Delayed delivery | ❌ (needs a scheduler) | ✅ (plugin) | ✅ (15 min max) | ✅ |
| DLQ | Build it yourself | ✅ | ✅ (`maxReceiveCount`) | ✅ |
| Complex routing | ❌ (consumer filters) | ✅ (topic/header/fanout) | ❌ (SNS in front) | ✅ |
| Consumer scaling ceiling | Partition count | Unlimited per queue | Unlimited | Partition count, or **shared** subscriptions with no ceiling |
| Ops burden | **High** | Medium | **Zero** | High (BookKeeper + ZK/Raft) |
| Multi-tenancy | Weak (ACLs only) | Vhosts | Accounts | **Strong** (tenants/namespaces, native geo-replication) |
| Cost shape | Fixed infra | Fixed infra | Per-request (~$0.40/M) | Fixed infra |

### The honest guidance

**Choose SQS when:** you're on AWS, under ~50k msg/s, don't need replay, and want to spend
zero engineer-hours on messaging. This covers a genuinely large fraction of systems that
end up running Kafka. At 10M messages/month SQS costs about $4 — versus a 3-broker MSK
cluster at roughly $500/month plus on-call.

**Choose RabbitMQ when:** you need work-queue semantics with per-message ack, retry with
backoff, priority, TTL, and complex routing; when latency must be sub-millisecond; when
consumer count must exceed any partition ceiling. Task queues (Celery-style) are RabbitMQ's
home turf and Kafka is an awkward fit for them — the partition ceiling means you cannot
scale workers past your partition count, which is exactly wrong for bursty background jobs.

**Choose Pulsar when:** you need strong multi-tenancy, native geo-replication, tiered
storage to S3 for cheap infinite retention, or both queue *and* stream semantics in one
system (shared subscriptions give you queue-style fanout without a partition ceiling).
The cost is a more complex architecture — brokers plus BookKeeper — and a smaller
ecosystem and hiring pool.

**Choose Kafka when:** high volume, multiple independent consumers of the same stream,
replay as a first-class requirement, and a stream-processing ecosystem (Flink, Kafka
Streams, Connect, ksqlDB). And when you have people who can operate it.

**The senior answer to "should we use Kafka?"** is usually a question: *"What breaks if a
message is delivered twice? What breaks if it's delivered a minute late? Do multiple
teams need this same data? Will you ever need to replay it?"* If replay and fanout aren't
requirements, Kafka is a large bill for a queue. The most common architecture mistake here
isn't picking the wrong broker — it's picking Kafka for a 200-message-per-second workload
because it's what the last company used.

---

## Sizing and Observability

### Storage math, worked end to end

```
  Given: 50,000 msg/s, 1.2 KB average, RF=3, retention 7 days,
         compression ratio 4x (zstd on JSON)

  1. Raw ingest:      50,000 × 1.2 KB              =  60 MB/s
  2. After zstd 4x:                                =  15 MB/s on disk and wire
  3. Per day:         15 MB/s × 86,400             = 1.30 TB/day
  4. × 7 days retention                            = 9.07 TB
  5. × RF 3                                        = 27.2 TB across the cluster
  6. Headroom: never exceed ~70% disk              = 38.9 TB provisioned
  7. Across 6 brokers                              = 6.5 TB per broker

  Network, per broker (6 brokers, replicas spread evenly):
    ingress from producers   15 MB/s / 6            = 2.5 MB/s
    ingress from replication 15 MB/s × 2 / 6        = 5.0 MB/s
    egress to replication    15 MB/s × 2 / 6        = 5.0 MB/s
    egress to consumers      15 MB/s × N_groups / 6 = 2.5 MB/s × N
    ── With 4 consumer groups: ~22 MB/s per broker. A 10 Gbit NIC is 1250 MB/s.
       Network is NOT the constraint here. Disk capacity is. Right-size accordingly.

  Partition count:
    measured consumer throughput = 2,500 msg/s per partition
    50,000 / 2,500 = 20 → ×2 headroom → 40 partitions
    40 partitions × RF 3 = 120 replicas / 6 brokers = 20 per broker. Trivial.
```

### Metrics that matter

**Broker (page these):**

| Metric | Threshold | Meaning |
|---|---|---|
| `UnderReplicatedPartitions` | **> 0 for > 1 min** | A replica is behind or down. You are one failure from loss or a write outage. |
| `OfflinePartitionsCount` | **> 0** | Partitions with no leader. Producers and consumers are failing right now. |
| `ActiveControllerCount` (cluster sum) | **must equal 1** | 0 = no controller, nothing can elect. 2 = split brain. |
| `UncleanLeaderElectionsPerSec` | **> 0** | Data was just silently lost. |
| `RequestHandlerAvgIdlePercent` | < 30% | Request threads saturated; increase `num.io.threads`. |
| `NetworkProcessorAvgIdlePercent` | < 30% | Network threads saturated. |
| `IsrShrinksPerSec` | any sustained rate | Replicas flapping — GC, disk, or network. |
| `LogFlushLatencyMs` p99 | > 100 ms | Disk is the bottleneck. |
| `MessageConversionsPerSec` | **> 0** | Format down-conversion → **zero-copy is off** → throughput cliff. |
| Disk usage | > 70% | Kafka does not degrade gracefully at 100%; brokers crash. |

**Producer:** `record-error-rate` (should be 0), `record-retry-rate` (a rising rate
precedes an outage), `request-latency-avg`, `buffer-available-bytes` (approaching 0 means
`send()` is about to block), `batch-size-avg` (much smaller than `batch.size` means
`linger.ms` is too low and you're leaving throughput on the table),
`compression-rate-avg`.

**Consumer:** `records-lag-max` **per partition**, `commit-latency-avg`,
`rebalance-rate-per-hour` (> 1 is a smell, > 5 is a storm),
`fetch-latency-avg`, `time-between-poll-avg` versus `max.poll.interval.ms` — that ratio is
your early warning for War Story 1 and almost nobody graphs it.

---

## Production War Stories

### Story 1: The consumer group that rebalanced forever

**Symptom.** A newly launched enrichment service showed lag climbing steadily on all 24
partitions, at exactly the rate messages were produced — as if nothing were being consumed
at all. But the pods were healthy, CPU was at 40%, logs showed records being processed
successfully, and no exceptions. Restarting the pods helped for about 90 seconds.

**Investigation.** `kafka-consumer-groups --describe` showed the `CONSUMER-ID` column
changing on every invocation — different member IDs each time, and sometimes empty. That's
the signature of continuous rebalancing, not slow consumption. The broker's group
coordinator log confirmed it: `Preparing to rebalance group enrichment in state
PreparingRebalance` roughly every 40 seconds, forever. Consumer logs, once we looked past
the successful-processing lines, had:
`CommitFailedException: Offset commit cannot be completed since the consumer is not part
of an active group... You can address this by increasing max.poll.interval.ms or by
reducing the maximum size of batches returned in poll() with max.poll.records.` The
exception message literally names the fix, and it had been in the logs from day one.

**Root cause.** The service enriched each record with a call to an internal API. In load
testing that API responded in 40 ms. In production, under real traffic, its p99 was
**900 ms**. With `max.poll.records=500` (default) that's 500 × 0.9 s = **450 seconds**
per poll cycle, against a `max.poll.interval.ms` of 300 seconds.

Every consumer processed for 300 seconds, got kicked out for exceeding the poll interval,
triggered a rebalance, and — because the group used the default **eager** assignor — the
entire group stopped consuming for the duration. The rebalance reassigned partitions, each
consumer got another 500 records, and the cycle repeated. Worse: the offsets from that
300 seconds of work could not be committed (the member no longer owned the partitions), so
every cycle reprocessed the same records. The group did ~5 minutes of work per cycle and
committed **zero** offsets. Net progress: none, indefinitely.

**Fix.**
```java
props.put("max.poll.records", 50);                  // 50 × 0.9 s = 45 s, well under budget
props.put("max.poll.interval.ms", 300000);
props.put("partition.assignment.strategy",
          "org.apache.kafka.clients.consumer.CooperativeStickyAssignor");
```
Lag drained in 20 minutes. Then the real fix: batch the enrichment API into 50-record
calls (the API supported it and nobody had checked), taking per-record cost from 900 ms to
18 ms, after which `max.poll.records` went back to 500.

**Lesson.** `max.poll.interval.ms` is a **processing budget**, and
`max.poll.records × p99_per_record` must fit inside it with margin. Load-test with
production-like downstream latency, not a mocked one — the entire failure came from a
downstream p99 that was 22x the tested value. And graph `time-between-poll-avg` against
`max.poll.interval.ms`; that single ratio would have caught this before launch. Finally:
cooperative-sticky should be the default on every consumer you write. With eager
rebalancing, a single slow consumer takes the whole group down.

### Story 2: Unclean leader election silently deleted committed orders

**Symptom.** Three days after a datacenter power event, reconciliation flagged 12,000
orders present in the order service's database but absent from the analytics warehouse.
The gap was a contiguous 40-minute window. Kafka reported no errors during or after the
event. Producers had received successful ACKs for every one of those orders — we had the
producer logs with partition and offset for each.

**Investigation.** Consuming the `orders` topic around the affected offsets returned
*different records* than the producer logs said were written there. Offset 4,182,331 was
logged by the producer as order `ORD-88213`; reading it back returned `ORD-91055`,
produced 40 minutes later. Offsets had been **reused**. The broker logs from the incident
window contained the answer:
`[Partition orders-7] Unclean leader election: broker 4 elected as leader for partition
orders-7 despite not being in the ISR`. The JMX metric `UncleanLeaderElectionsPerSec` had
spiked — but nothing was alerting on it, and no one had ever looked at it.

**Root cause.** A rack lost power, taking brokers 5 and 6 (two of the three replicas for
several partitions) offline. `min.insync.replicas` was **1**, not 2, so broker 4 — now the
only ISR member — happily kept accepting `acks=all` writes. (`acks=all` means "all
*in-sync* replicas," and the ISR was one.) Forty minutes later, broker 4's rack lost power
too. All replicas were offline.

`unclean.leader.election.enable` had been set to `true` cluster-wide, eighteen months
earlier, by an engineer who had since left. The commit message said "prevent partition
unavailability during maintenance." When broker 5 came back — stale, missing the last 40
minutes — Kafka elected it leader anyway. Broker 5's log ended at offset 4,180,000. New
writes began at 4,180,001, **overwriting** the offset range that had held the 12,000
orders. When brokers 4 and 6 returned, they truncated their logs to match the new leader.
The records were gone from all three replicas. No error, no log line saying "data lost,"
nothing.

**Fix.**
```properties
unclean.leader.election.enable=false          # cluster-wide, and per-topic for safety
min.insync.replicas=2                         # with replication.factor=3
```
Plus rack awareness (`broker.rack`) so a single rack can never hold two of three replicas,
and a page on `UncleanLeaderElectionsPerSec > 0` and on `UnderReplicatedPartitions > 0`
sustained for more than a minute. The 12,000 orders were recovered by replaying from the
order service's database, which took two days of engineering time.

**Lesson.** `unclean.leader.election.enable=true` trades **silent, unrecoverable,
unalerted data loss** for availability. That trade is defensible for click telemetry and
indefensible for orders. Equally important: `acks=all` provides no guarantee on its own —
the guarantee comes from `min.insync.replicas ≥ 2`. Setting `acks=all` with
`min.insync.replicas=1` gives you `acks=1` semantics plus the latency of `acks=all`: the
worst of both. And this configuration had been wrong for eighteen months without a single
symptom, because it only manifests during a correlated multi-broker failure. Audit
durability configuration on a schedule; don't wait for it to be tested by an incident.

### Story 3: A hot partition from a bad partition key

**Symptom.** During a Black Friday campaign, the payments consumer group's lag hit 4.2
million records and kept climbing. The team scaled from 12 to 24 consumer pods. Lag
continued to climb at exactly the same rate. They scaled to 48. Nothing changed at all.
Meanwhile CPU across the consumer fleet averaged 6%.

**Investigation.** Aggregate lag was hiding the shape of the problem. Per-partition:

```
  P0: 12      P1: 8       P2: 3       P3: 4,199,000     ← 99.98% of the lag
  P4: 15      P5: 6       ... (all near zero)
```

One partition. One consumer. Adding pods beyond the partition count did precisely nothing
— a partition is consumed by exactly one group member, so 36 of the 48 pods were idle by
definition. Dumping keys from P3 with `kafka-console-consumer --property print.key=true`
showed that ~92% of records in that partition had the key `merchant-unknown`.

**Root cause.** The producer keyed payment events by `merchant_id` — correct, because
per-merchant ordering was a genuine requirement. But a code path added six weeks earlier
for a new guest-checkout flow didn't populate `merchant_id`, and rather than leaving the
key null, a defensive helper substituted the string `"unknown"`. Every guest-checkout
payment therefore hashed to the same partition. Guest checkout was ~4% of normal traffic,
which was invisible. The Black Friday campaign was promoted to non-logged-in users and
guest checkout jumped to **60%** of volume — all of it, by construction, on one partition.

The `"unknown"` default was intended as a null-safety measure. It converted a
"round-robin across all partitions" behavior into a "pin everything to one partition"
behavior, and nothing in the type system or the tests could see the difference.

**Fix.** Immediately: a hotfix producer change so guest checkouts key on
`"guest:" + session_id`, spreading them across all 24 partitions while still preserving
per-session ordering. Lag drained in 35 minutes. Permanently:
1. A producer-side assertion that rejects sentinel keys (`unknown`, `null`, `default`,
   empty string) at build time via a shared serializer wrapper.
2. A dashboard panel of per-partition lag *and* per-partition byte rate, with an alert on
   the ratio of max-to-median exceeding 5x.
3. A design review note: the partition key must be the **entity whose ordering matters**,
   and it must have the cardinality to spread across partitions. If it doesn't, use a
   composite key.

**Lesson.** Partition count is the hard ceiling on consumer parallelism — scaling past it
is not slow, it is a **no-op**, and it costs money while looking like action. Always
diagnose lag per partition; the aggregate hides exactly the failure mode you most need to
see. And a "safe" default value for a partition key is the most dangerous thing you can
put in a producer: null keys round-robin harmlessly, but a constant sentinel key is a
guaranteed hot partition waiting for a traffic shift.

### Story 4: Auto-commit lost an entire batch during a routine deploy

**Symptom.** After every deploy of the notification service, a handful of users reported
missing emails. Roughly 200–600 per deploy, from a stream of several million per day —
0.01%, entirely invisible in error rates. It went unnoticed for four months, until a
customer complained about a missing password-reset email during a deploy window and
someone plotted "missing notification" reports against the deploy timeline. Perfect
correlation.

**Investigation.** The consumer looked normal:

```java
props.put("enable.auto.commit", "true");            // default
props.put("auto.commit.interval.ms", "5000");       // default

while (running) {
    var records = consumer.poll(Duration.ofMillis(500));
    for (var r : records) {
        executor.submit(() -> sendEmail(r));        // ← the bug
    }
}
```

Records were handed to a 32-thread executor and the loop moved on immediately. Auto-commit
fires *inside* `poll()`, committing the offsets of the **previous** poll's records — with
no knowledge of whether the executor had finished them, or even started them.

```
  t=0.00  poll() → offsets 1000..1499, submitted to the executor, loop continues
  t=0.01  poll() → offsets 1500..1999, submitted
  t=5.00  poll() → AUTO-COMMIT offset 2000. Executor queue depth: ~700 pending.
  t=5.20  SIGTERM (deploy). Executor is shut down; the queue is discarded.
  Restart → consumer resumes from 2000.
  ~700 notifications between 1300 and 2000 were never sent, and never will be.
  No error. No exception. No log line. Metrics show a clean shutdown.
```

The `executor.shutdown()` in the shutdown hook was `shutdownNow()`, which drops queued
tasks — so the queue was silently dropped on every single deploy. Two deploys a day for
four months is roughly 240 deploys × ~400 notifications ≈ **96,000 lost notifications.**

**Fix.**
```java
props.put("enable.auto.commit", "false");

while (running) {
    var records = consumer.poll(Duration.ofMillis(500));
    if (records.isEmpty()) continue;

    // Submit, then WAIT for the whole batch before committing.
    var futures = StreamSupport.stream(records.spliterator(), false)
        .map(r -> CompletableFuture.runAsync(() -> sendEmail(r), executor))
        .toList();
    CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                     .get(60, TimeUnit.SECONDS);     // bounded, or we trip max.poll.interval

    consumer.commitSync(endOffsets(records));        // offset + 1
}
// shutdown hook:
//   running = false; consumer.wakeup();
//   executor.shutdown(); executor.awaitTermination(30, SECONDS);   // NOT shutdownNow()
//   consumer.commitSync(); consumer.close();
```
Plus a `terminationGracePeriodSeconds: 60` on the Kubernetes deployment (it was 30, and
the shutdown hook was being SIGKILLed halfway through), and idempotency on the email send
keyed by notification id — so at-least-once redelivery became harmless.

**Lesson.** **Auto-commit is only safe when processing is fully synchronous inside the
poll loop.** The instant a queue, thread pool, or future appears between `poll()` and the
work being done, auto-commit becomes a silent at-most-once data-loss bug — and it's
silent because the offset advancing past unprocessed records is, from Kafka's perspective,
completely normal behavior. There is no metric for "we skipped these." Also: graceful
shutdown is part of correctness, not politeness. A consumer that doesn't drain in-flight
work and commit synchronously before exiting loses data on every deploy, and deploys are
the most frequent "failure" a service experiences.

---

## Common Pitfalls

**1. Assuming global ordering across a topic.**
*Failure mode:* a state machine receives `paid` before `created` and either throws or
silently creates corrupt state. Only reproduces under load, when partitions are actually
processed concurrently.
*Fix:* key by the entity whose ordering matters. Accept that cross-entity order does not
exist and design consumers to tolerate it.

**2. Increasing partition count on a keyed topic.**
*Failure mode:* `murmur2(key) % N` changes for most keys. Existing entities' history is
split across two partitions and ordering is broken across the boundary — permanently and
irreversibly.
*Fix:* over-provision at creation; if you must resize, create a new topic and migrate.

**3. `min.insync.replicas = replication.factor`.**
*Failure mode:* losing any single broker halts writes to every partition it led. You built
a cluster that's less available than one machine.
*Fix:* `min.insync.replicas = replication.factor - 1`.

**4. `acks=all` with `min.insync.replicas=1`.**
*Failure mode:* "all in-sync replicas" is one replica when the ISR has shrunk. You pay the
latency of `acks=all` and get the durability of `acks=1`, and you don't find out until a
correlated failure.
*Fix:* set both, and alert on `UnderReplicatedPartitions`.

**5. Auto-commit with asynchronous processing.**
*Failure mode:* offsets advance past records still sitting in a queue. Silent at-most-once.
*Fix:* manual commit after the batch genuinely completes.

**6. Committing `record.offset()` instead of `record.offset() + 1`.**
*Failure mode:* the last record of every batch is reprocessed forever. Looks like a
mysterious low-rate duplicate.
*Fix:* `new OffsetAndMetadata(record.offset() + 1)`.

**7. Not calling `producer.flush()` / `close()` on shutdown.**
*Failure mode:* everything in the accumulator is discarded on SIGTERM. At `linger.ms=20`
and moderate volume that's hundreds to thousands of records per pod, per deploy.
*Fix:* a shutdown hook that flushes and closes with a timeout, plus a Kubernetes grace
period long enough for it to finish.

**8. Doing slow work in the producer callback.**
*Failure mode:* the callback runs on the single sender thread. A database write in it
stalls production for every partition on that producer.
*Fix:* enqueue and return.

**9. Consumers whose processing isn't idempotent.**
*Failure mode:* every rebalance, every restart, every retry produces duplicates — because
at-least-once is the *normal* case, not the exception. Duplicate emails, duplicate charges,
double-counted metrics.
*Fix:* dedupe on a business key at the sink. Assume redelivery will happen daily.

**10. Log compaction on a topic with null keys.**
*Failure mode:* the log cleaner throws, the cleaner thread dies, and compaction silently
stops for **every** compacted topic on that broker — including `__consumer_offsets` — which
then grows until the disk fills.
*Fix:* enforce non-null keys on compacted topics; alert on log-cleaner thread health and
`max-dirty-percent`.

**11. `retention.bytes` read as a topic-level limit.**
*Failure mode:* it's per partition. `retention.bytes=10GB` × 50 partitions × RF 3 = 1.5 TB.
Disk fills; brokers crash; a full-disk Kafka broker does not fail gracefully.
*Fix:* do the multiplication. Alert at 70% disk.

**12. A large JVM heap on brokers.**
*Failure mode:* `-Xmx32g` starves the page cache and creates multi-second GC pauses. Those
pauses cause ISR shrink and consumer session timeouts, which look like network problems.
*Fix:* 6 GB heap, G1GC, and let the OS have the rest for page cache.

**13. Leaving `linger.ms=0` on a high-volume producer.**
*Failure mode:* tiny batches, poor compression (compression is per batch), and many small
requests. Throughput is a fraction of what the cluster can do, and the network bill is
several times higher than necessary.
*Fix:* `linger.ms=5–20`. It costs 5 ms of p50 and can triple throughput.

**14. Deploying `CooperativeStickyAssignor` in one step.**
*Failure mode:* mixed eager and cooperative members cannot agree on a protocol; the group
fails to stabilize.
*Fix:* two-phase rollout — deploy with both strategies listed, then with only the
cooperative one.

---

## Junior vs Senior

| Dimension | Junior | Senior |
|---|---|---|
| Mental model | "Kafka is a fast message queue" | "Kafka is a replicated append-only log; consumers are cursors over immutable history" |
| Ordering | "Kafka keeps messages in order" | "Total order within a partition only. The key choice *is* the ordering design, and it's irreversible in practice." |
| Durability | "We set `acks=all`, we're safe" | "`acks=all` + RF 3 + `min.insync.replicas=2` + `unclean.leader.election=false`. Any one missing and the guarantee is void." |
| Lag response | "Add more consumers" | Checks lag *per partition* first; knows the partition count is a hard ceiling and that scaling past it is a no-op |
| Partition count | "Add partitions when we're slow" | Knows resizing remaps keys and breaks ordering; over-provisions at creation |
| Rebalancing | "It redistributes partitions" | Explains eager vs cooperative-sticky, `session.timeout.ms` vs `max.poll.interval.ms`, static membership, and which failure each one produces |
| Offsets | Leaves auto-commit on | Manual commit after processing, `offset+1`, sync on shutdown, `onPartitionsRevoked` handler |
| Exactly-once | "We'll turn on EOS" | "EOS is Kafka-to-Kafka only and costs 3–20%. At a DB sink, at-least-once plus an idempotent upsert is simpler and actually covers the boundary." |
| Consumer design | Processes and hopes | Assumes redelivery daily; every handler is idempotent by construction |
| Producer | `send()` and move on | Callback with error handling, bounded `max.block.ms`, `flush()` on shutdown, alerts on `record-error-rate` |
| Schema | "We send JSON" | Schema Registry with `BACKWARD_TRANSITIVE` on compacted topics, compatibility checked in CI |
| Tool choice | "Kafka handles messaging" | "What's the volume? Do you need replay? Multiple consumers? If not, SQS costs $4/month and zero on-call." |
| Debugging | Reads application logs | `kafka-consumer-groups --describe`, per-partition lag, `UnderReplicatedPartitions`, `time-between-poll-avg`, broker coordinator logs |
| Failure planning | "Kafka is up, so it's fine" | Has tested: broker loss, AZ loss, unclean election, disk full, rebalance storm, and a poison message |

---

## Interview Questions with Model Answers

**Q1. Why is Kafka fast?**

> Four things, and they compound.
>
> **Sequential I/O.** Kafka only appends. On spinning disks sequential writes are ~100x
> faster than random; even on NVMe it's roughly 10–30x. Traditional brokers maintain
> per-message delivery state, which means random reads and writes into an index. Kafka's
> per-consumer state is a single integer, stored in another append-only log.
>
> **Page cache, not a heap cache.** Kafka writes to the OS page cache and lets the kernel
> flush. Consumers reading recent data — which is most consumers — are served from RAM
> with no disk access and no JVM heap involvement. That's why brokers run a small 6 GB
> heap on a 64 GB machine: a large heap starves the page cache and introduces GC pauses.
>
> **Zero-copy.** `sendfile` moves bytes from the page cache to the NIC via DMA without the
> data ever entering userspace. Two copies and two context switches instead of four each.
> Roughly 2–4x on the consumer path, and it means fanout to twenty consumer groups doesn't
> cost twenty times the CPU.
>
> **Batching, everywhere.** The producer batches, the broker writes batches, the consumer
> fetches batches, and compression is per batch — a thousand similar JSON records share
> their field names and compress 5–10x, where per-record compression would get 1.2x.

*Interviewer follow-up: "What would break zero-copy?"*
> Anything that forces the broker to touch the bytes. TLS, because encryption happens in
> userspace — expect 20–35% lower throughput when you enable it, and budget for that
> rather than discovering it. Message-format down-conversion, when an old client forces
> the broker to rewrite batches — the `MessageConversionsPerSec` metric catches that, and
> it's the usual explanation for "throughput halved after the broker upgrade." And
> broker-side recompression if the topic's `compression.type` differs from the producer's.

---

**Q2. What exactly does `acks=all` guarantee?**

> On its own, less than people think. `acks=all` means the leader waits for every replica
> **currently in the ISR** to acknowledge. If the ISR has shrunk to just the leader — say
> two of three brokers are down — then "all" means one, and you have `acks=1` semantics
> with `acks=all` latency.
>
> The real durability contract is three settings together: `replication.factor=3`,
> `min.insync.replicas=2`, and `acks=all`. `min.insync.replicas` is what makes the leader
> *reject* a write when the ISR is too small, throwing `NotEnoughReplicasException`. That
> rejection is the system working correctly — it chose consistency over availability.
> Together, those three survive the loss of any one broker with zero data loss.
>
> There's a fourth: `unclean.leader.election.enable=false`. Without it, when all ISR
> members are down Kafka will elect a stale out-of-sync replica as leader, and every
> acknowledged record the stale replica is missing is permanently gone — with no error and
> no log line saying data was lost.

*Interviewer follow-up: "Why not set `min.insync.replicas=3` with RF 3? Isn't that safer?"*
> It's strictly worse. With `min.insync.replicas` equal to the replication factor, losing
> any single broker — a routine restart, a rolling upgrade — drops the ISR to 2 and halts
> all writes to every partition that broker led. You've spent 3x the hardware to build
> something less available than a single node, and you get zero additional durability,
> because two replicas already survive one failure. The rule is
> `min.insync.replicas = replication.factor - 1`.

---

**Q3. Your consumer group is stuck in a rebalance loop. Debug it.**

> First I'd confirm it *is* a rebalance loop rather than slow consumption:
> `kafka-consumer-groups --describe` repeatedly, and watch whether `CONSUMER-ID` changes
> between invocations. If member IDs churn, it's rebalancing. The broker's group
> coordinator log confirms it with repeated `Preparing to rebalance group X` entries, and
> I'd note the interval between them — it usually matches one of the timeouts exactly,
> which tells me which one.
>
> Then I'd look for `CommitFailedException` in the consumer logs. Its message names the
> cause directly: the consumer was removed from the group because the interval between
> `poll()` calls exceeded `max.poll.interval.ms`.
>
> The distinction that matters is which timeout fired. `session.timeout.ms` is measured by
> the background heartbeat thread and means the process is dead or partitioned.
> `max.poll.interval.ms` is measured on the main thread and means the process is alive but
> stuck — processing is taking too long between polls. In a rebalance loop it's almost
> always the second, and it's insidious because the heartbeat thread keeps heartbeating
> happily while the main thread is stuck, so everything looks healthy until the poll
> interval fires.
>
> The arithmetic: `max.poll.records × p99 processing time per record` must be comfortably
> under `max.poll.interval.ms`. With the defaults — 500 records and 5 minutes — anything
> slower than 600 ms per record trips it.

*Interviewer follow-up: "You've confirmed it's max.poll.interval.ms. What do you change?"*
> Immediately, drop `max.poll.records` so the batch fits in the budget with 2–3x margin —
> if processing is 900 ms per record and the budget is 300 s, 50 records gives me 45 s.
> That's a config change, no code, and it stops the bleeding.
>
> I would *not* just raise `max.poll.interval.ms`. That makes genuine consumer failures
> take longer to detect and papers over a throughput problem that will come back.
>
> Then two structural fixes. Switch to `CooperativeStickyAssignor`, because with the
> default eager assignor one slow consumer takes the entire group to zero throughput during
> every rebalance — that's what turns a slow consumer into a total outage. And attack the
> per-record cost: batch the downstream call, or decouple polling from processing with a
> bounded worker pool plus `pause()`/`resume()` so the consumer keeps polling to satisfy
> the timeout without fetching more work. The last one is what Confluent's parallel
> consumer does, and it's the right shape when work is genuinely slow.

---

**Q4. Explain unclean leader election and when you'd enable it.**

> When all in-sync replicas for a partition are unavailable, Kafka has two options:
> keep the partition offline until an ISR member returns, or promote an out-of-sync
> replica and resume serving. `unclean.leader.election.enable` picks which.
>
> With it `false` — the default since 0.11 — the partition goes offline. Producers get
> errors, consumers stall, you have an outage, and you've lost nothing.
>
> With it `true`, Kafka promotes a stale replica. Everything that replica is missing —
> including records that were **acknowledged to producers** — is permanently gone. Worse,
> the new leader starts writing at its own log end offset, so offsets get **reused**: two
> different records occupy the same offset at different times. A consumer that already
> read the original records has processed data the cluster now says never existed. And
> when the former leader returns, it truncates to match. No error is raised anywhere. The
> only signal is the `UncleanLeaderElectionsPerSec` JMX metric, which nobody alerts on
> until after it's bitten them.
>
> I'd enable it only for genuinely loss-tolerant, high-volume telemetry where an offline
> partition is worse than a gap — clickstream, metrics. Never for orders, payments, or
> anything feeding a ledger. And I'd set it per topic rather than cluster-wide, because a
> cluster-wide setting made once for a maintenance window outlives the person who set it.

*Interviewer follow-up: "How would you make it unnecessary?"*
> Prevent all replicas from being lost simultaneously. Rack awareness via `broker.rack`
> spreads the three replicas across three availability zones, so a rack or AZ failure
> costs one replica, not all three. `min.insync.replicas=2` stops the leader from
> accumulating a tail of records only it has, which is what creates the loss window in the
> first place — in the incident I've seen, the leader accepted writes alone for 40 minutes
> because `min.insync.replicas` was 1, and those 40 minutes were exactly what was lost.
> And an alert on `UnderReplicatedPartitions > 0` sustained for a minute gives you the
> chance to intervene while there's still a healthy replica to intervene with.

---

**Q5. Design a payment event pipeline. Walk me through the decisions.**

> **Topic and key.** One topic, `payments.events`, keyed by `payment_id`, because the
> ordering requirement is per payment — `authorized` must precede `captured` must precede
> `refunded`. Not keyed by `merchant_id`, because a large merchant would create a hot
> partition, and merchant-level ordering isn't a requirement.
>
> **Partitions.** Measure per-partition consumer throughput first, then divide target
> throughput by it and double for headroom. If that's 20, I provision 40 — because
> increasing later remaps every key and breaks ordering irreversibly. I'd rather pay for
> unused partitions than run a topic migration.
>
> **Durability.** `replication.factor=3` across three AZs with `broker.rack`,
> `min.insync.replicas=2`, `acks=all`, `enable.idempotence=true`,
> `unclean.leader.election.enable=false`. For payments, an offline partition is
> unambiguously better than silent loss.
>
> **Producer.** `linger.ms=10` and `zstd` — 10 ms of latency is irrelevant for a payment
> event and it triples effective throughput. Async `send()` with a callback that writes
> failures to a local durable buffer, because a failed produce after
> `delivery.timeout.ms` must not be dropped. `flush()` in the shutdown hook. And critically,
> **the produce must be transactionally tied to the database write** — I'd use the
> transactional outbox pattern: write the payment row and an outbox row in one Postgres
> transaction, and have Debezium CDC publish the outbox to Kafka. Otherwise you get the
> dual-write problem where the DB commits and the produce fails, or vice versa.
>
> **Consumer.** Manual commit after processing, `offset+1`, cooperative-sticky assignor,
> static membership so rolling deploys don't rebalance. Processing is idempotent — a
> `processed_events(event_id)` table with a unique constraint, in the same transaction as
> the side effect — so at-least-once redelivery is harmless.
>
> **Not exactly-once.** The sink is a database, and Kafka transactions don't span it. EOS
> would cost 3–20% throughput and add a coordinator failure mode while still requiring the
> idempotency table for the DB boundary. At-least-once plus an idempotent sink is simpler
> and covers more.
>
> **Retention** 30 days rather than the 7-day default, because payment disputes arrive
> weeks later and replay is the recovery mechanism. Schema Registry with
> `BACKWARD_TRANSITIVE` and compatibility enforced in CI.
>
> **Monitoring:** per-partition lag with a max-to-median ratio alert to catch hot
> partitions, `UnderReplicatedPartitions`, `UncleanLeaderElectionsPerSec`, producer
> `record-error-rate`, and consumer `time-between-poll-avg` against
> `max.poll.interval.ms`.

*Interviewer follow-up: "You mentioned the outbox pattern. Why not just produce to Kafka and write to the DB?"*
> Because there's no transaction spanning both, so you get a dual write with two failure
> orderings and both are bad. Write to Kafka first and the DB write fails: downstream
> systems believe a payment was captured that your ledger has no record of. Write to the
> DB first and the produce fails: the ledger is right but nothing downstream ever hears
> about it — no receipt, no fraud check, no analytics. Retrying doesn't fix it, because
> the process can die between the two operations.
>
> The outbox makes it a single local transaction: the payment row and the outbox row
> commit atomically. A separate process — Debezium reading the WAL, or a simple poller —
> publishes the outbox to Kafka with at-least-once delivery. If it crashes mid-publish it
> republishes, which is fine because consumers are idempotent. The database's transaction
> log becomes the source of truth for what must be published, and there's no window where
> the two can disagree.

---

**Q6. When is Kafka the wrong choice?**

> More often than teams admit, and I'd push back before adopting it.
>
> **Low volume.** At a few hundred messages a second, a 3-broker cluster, a schema
> registry, a Connect cluster, and an on-call rotation is an enormous fixed cost. SQS at
> that volume is single-digit dollars a month with zero operational burden, and Postgres
> with `SELECT ... FOR UPDATE SKIP LOCKED` will carry a team for years.
>
> **Task queues.** If you need per-message retry with backoff, priority, per-message TTL,
> or delayed delivery, Kafka has none of those and you'll rebuild them badly with retry
> topics and an external scheduler. Worse, the partition count caps your worker
> parallelism — which is exactly backwards for bursty background jobs where you want to
> scale to 500 workers for an hour. RabbitMQ or SQS.
>
> **Complex routing.** Header-based routing, per-consumer filtering, topic exchanges —
> that's RabbitMQ. In Kafka every consumer reads everything and filters client-side,
> wasting bandwidth proportional to selectivity.
>
> **Request/reply.** People build it with a reply topic and a correlation ID. It works and
> it's painful. Use gRPC.
>
> **Large payloads.** Kafka is tuned for records under a megabyte. Put the blob in S3 and
> publish the pointer.
>
> **Team size.** Kafka's failure modes — rebalance storms, ISR shrink, log cleaner death,
> disk fill — need someone who has seen them before. If you don't have that person,
> managed Kafka or a managed queue is cheaper than the incidents, even when the invoice
> looks worse.
>
> Kafka earns its complexity when you have high volume, multiple independent consumers of
> the same stream, replay as a real requirement, and a stream-processing ecosystem. If
> replay and fanout aren't requirements, you're paying a lot for a queue.

*Interviewer follow-up: "We're at 200 messages/second today but expect 50x growth in two years. Kafka now, or migrate later?"*
> I'd start with SQS and design so the migration is cheap, rather than pay Kafka's
> operational cost for two years against a growth projection that's probably wrong.
>
> Making it cheap means: publish through a thin internal abstraction so the transport is
> swappable; use an explicit event schema with a registry from day one, since schema
> discipline is the genuinely hard part to retrofit and it's transport-independent; and
> give every event a business key and an id so consumers are idempotent and
> partition-ready regardless of broker.
>
> The trigger to migrate isn't a message rate — it's a requirement. The day a second team
> wants the same stream, or someone asks to replay last month, or you need Flink, that's
> when Kafka pays for itself. If 50x growth arrives and it's still one producer and one
> consumer with no replay need, 10,000 messages a second on SQS is still fine and still
> costs almost nothing to operate.

---

## Production Checklist

**Topic configuration**
- [ ] `replication.factor=3` (never 1 in production; 2 gives you no quorum margin).
- [ ] `min.insync.replicas=2` — explicitly set per topic, not left to the broker default.
- [ ] `unclean.leader.election.enable=false`.
- [ ] Partition count sized from **measured** per-partition consumer throughput, ×2 headroom.
- [ ] Retention set deliberately, with `segment.ms` if short retention must actually bite.
- [ ] `retention.bytes` multiplied out: × partitions × RF, checked against disk.
- [ ] Compacted topics: non-null keys enforced; `delete.retention.ms` ≥ max consumer downtime.

**Producer**
- [ ] `enable.idempotence=true` (default in 3.0+, verify it isn't overridden).
- [ ] `acks=all` for anything that matters.
- [ ] `linger.ms` 5–20 and `compression.type=zstd` or `lz4` unless latency-critical.
- [ ] `max.block.ms` reduced from 60 s; the resulting exception handled.
- [ ] Every `send()` has a callback that handles and counts failures.
- [ ] `flush()` + `close(timeout)` in the shutdown hook; K8s grace period long enough.
- [ ] Partition key = the entity whose ordering matters; no sentinel/default keys.
- [ ] Dual writes replaced with the transactional outbox pattern where a DB is involved.

**Consumer**
- [ ] `enable.auto.commit=false` unless processing is strictly synchronous in the poll loop.
- [ ] Commit `offset + 1`, async in the loop, **sync on shutdown**.
- [ ] `ConsumerRebalanceListener.onPartitionsRevoked` commits before losing partitions.
- [ ] `CooperativeStickyAssignor` (rolled out in two phases).
- [ ] `group.instance.id` for static membership on stable deployments.
- [ ] `max.poll.records × p99_processing_time` ≪ `max.poll.interval.ms`, with margin.
- [ ] Processing is idempotent — assume redelivery daily, not rarely.
- [ ] `isolation.level=read_committed` if any producer to that topic is transactional.

**Broker / cluster**
- [ ] JVM heap ~6 GB, G1GC; the rest of RAM left to the page cache.
- [ ] `broker.rack` set; replicas spread across AZs.
- [ ] `ulimit -n` ≥ 100,000.
- [ ] Disk alerted at 70%; Kafka does not degrade gracefully when full.
- [ ] KRaft with dedicated controller nodes (ZooKeeper is removed as of 4.0).
- [ ] TLS + SASL + ACLs; the throughput cost of TLS budgeted, not discovered.

**Observability**
- [ ] Page on: `UnderReplicatedPartitions > 0` (1 min), `OfflinePartitionsCount > 0`,
      `ActiveControllerCount != 1`, `UncleanLeaderElectionsPerSec > 0`.
- [ ] Alert on: **per-partition** consumer lag (and max-to-median ratio for hot partitions),
      lag expressed in **time**, `rebalance-rate-per-hour`, producer `record-error-rate`,
      `MessageConversionsPerSec > 0`, disk %, `RequestHandlerAvgIdlePercent < 30%`.
- [ ] Graph `time-between-poll-avg` against `max.poll.interval.ms`.
- [ ] Schema compatibility enforced in CI, not just configured in the registry.

**Tested, not assumed**
- [ ] Broker loss and AZ loss under production-like load.
- [ ] Rolling deploy of every consumer group — zero rebalances expected with static membership.
- [ ] A poison message: does it DLQ, or does it block the partition forever?
- [ ] Offset reset / replay from a timestamp — the procedure is written down and rehearsed.
- [ ] Consumer restart with a full backlog: does it recover, or trip `max.poll.interval.ms`?

---

**Level:** Senior / Principal | **Format:** Production patterns, failure modes, and the reasoning behind them
