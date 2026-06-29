# Apache Kafka - Professional Interview Guide

## Table of Contents
1. [Kafka Fundamentals](#kafka-fundamentals)
2. [Core Concepts](#core-concepts)
3. [Producers](#producers)
4. [Consumers](#consumers)
5. [Topics & Partitions](#topics--partitions)
6. [High Availability & Replication](#high-availability--replication)
7. [Performance & Optimization](#performance--optimization)
8. [Best Practices](#best-practices)

---

## Kafka Fundamentals

### What is Apache Kafka?
**Apache Kafka** is a distributed streaming platform and message broker. Designed for high-throughput, fault-tolerant, publish-subscribe messaging at scale.

**Key characteristics:**
- **Distributed:** Runs as cluster of servers
- **Persistent:** Messages stored on disk (configurable retention)
- **Scalable:** Horizontal scaling (add brokers)
- **High-throughput:** Millions of messages per second
- **Fault-tolerant:** Replication for reliability
- **Real-time:** Low-latency message delivery

**Key takeaway:** Distributed streaming platform. High-throughput, fault-tolerant, persistent.

---

### Kafka vs Traditional Message Queues
**Traditional MQ (RabbitMQ, ActiveMQ):**
- Message deleted after consumption
- Lower throughput
- Push-based (broker pushes to consumer)
- Complex routing (exchanges, bindings)

**Kafka:**
- Messages persist (configurable retention)
- Very high throughput (designed for logs)
- Pull-based (consumer pulls from broker)
- Simple pub-sub model
- Order guaranteed within partition

**Key takeaway:** Kafka = persistent log, high-throughput. Traditional MQ = ephemeral, complex routing.

---

### Use Cases
**1. Messaging:**
- Decouple microservices
- Event-driven architecture
- Async communication

**2. Activity Tracking:**
- User actions (clicks, views)
- Website activity streams

**3. Log Aggregation:**
- Centralize logs from multiple services
- Ship to Elasticsearch, Splunk

**4. Stream Processing:**
- Real-time analytics
- Kafka Streams, Apache Flink

**5. Event Sourcing:**
- Store state changes as events
- Rebuild state from event log

**6. Data Integration (CDC):**
- Change Data Capture from databases
- Kafka Connect for data pipelines

**Key takeaway:** Messaging, logs, streaming, event sourcing, data pipelines.

---

## Core Concepts

### Architecture Overview
**Components:**

**1. Broker:**
- Kafka server (one per machine)
- Stores messages
- Serves producers/consumers
- Cluster = multiple brokers

**2. ZooKeeper (legacy, removing in Kafka 4.0):**
- Cluster coordination
- Leader election
- Metadata storage

**3. Topic:**
- Category/feed name
- Logical channel for messages

**4. Partition:**
- Topic split into partitions
- Unit of parallelism
- Ordered, immutable sequence

**5. Producer:**
- Publishes messages to topics

**6. Consumer:**
- Subscribes to topics, reads messages

**7. Consumer Group:**
- Group of consumers sharing workload

**Key takeaway:** Brokers store data, Producers write, Consumers read, Topics are categories.

---

### Message Structure
**Definition:** Record with key, value, timestamp, headers.

```
Message {
  key: byte[]          // Optional, for partitioning
  value: byte[]        // Actual data
  timestamp: long      // Message timestamp
  headers: Map         // Metadata (key-value pairs)
  partition: int       // Assigned partition
  offset: long         // Position in partition
}
```

**Key:** Determines partition (if specified). Null key = round-robin.

**Offset:** Unique ID within partition. Monotonically increasing.

**Key takeaway:** Key determines partition. Offset = unique position.

---

### Log-Based Storage
**Definition:** Each partition is an append-only log.

**How it works:**
1. Producer appends message to end of log
2. Message gets sequential offset (0, 1, 2, ...)
3. Messages immutable (cannot modify)
4. Consumers track their offset

**Retention:**
- **Time-based:** Delete after X days (default 7)
- **Size-based:** Delete when log exceeds size
- **Compaction:** Keep only latest value per key

**Key takeaway:** Append-only log. Immutable. Offset-based reading.

---

## Producers

### Producer API
**Send message:**
```java
Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");

KafkaProducer<String, String> producer = new KafkaProducer<>(props);

ProducerRecord<String, String> record =
    new ProducerRecord<>("my-topic", "key", "value");

// Async send (fire and forget)
producer.send(record);

// Async with callback
producer.send(record, (metadata, exception) -> {
    if (exception == null) {
        System.out.println("Sent to partition " + metadata.partition()
                          + " offset " + metadata.offset());
    } else {
        exception.printStackTrace();
    }
});

// Sync send (wait for acknowledgment)
RecordMetadata metadata = producer.send(record).get();
```

**Key takeaway:** Fire-and-forget, callback, or synchronous send.

---

### Partitioning Strategy
**How Kafka decides which partition to send message?**

**1. Key specified:**
- Hash key: `hash(key) % num_partitions`
- Same key → always same partition (ordering guaranteed)

**2. No key (null):**
- Round-robin across partitions
- No ordering guarantee

**3. Custom partitioner:**
```java
public class CustomPartitioner implements Partitioner {
    public int partition(String topic, Object key, byte[] keyBytes,
                        Object value, byte[] valueBytes, Cluster cluster) {
        // Custom logic
        return partition_number;
    }
}
```

**Key takeaway:** Key → hashed partition. Null key → round-robin.

---

### Producer Acknowledgments (acks)
**Configuration:** Controls durability vs latency trade-off.

**acks=0 (Fire and forget):**
- Producer doesn't wait for acknowledgment
- Fastest (lowest latency)
- Risk: Message loss if broker fails

**acks=1 (Leader acknowledgment):**
- Wait for leader replica to write
- Balanced (default)
- Risk: Data loss if leader fails before replication

**acks=all / -1 (All replicas):**
- Wait for all in-sync replicas (ISR) to write
- Slowest (highest latency)
- Most durable (no data loss)

**Configuration:**
```java
props.put("acks", "all");
```

**Key takeaway:** acks=0 (fast, risky), acks=1 (balanced), acks=all (safe, slow).

---

### Idempotence
**Problem:** Network failures can cause duplicates (producer retries).

**Solution:** Enable idempotent producer (Kafka 3.0+ default).

```java
props.put("enable.idempotence", "true");
```

**How it works:**
- Producer sends unique sequence number per message
- Broker detects duplicates, writes only once

**Guarantees:** Exactly-once delivery to single partition.

**Key takeaway:** Idempotence prevents duplicates. Enabled by default.

---

### Batching and Compression
**Batching:**
- Group multiple messages before sending
- Higher throughput, lower latency

**Configuration:**
```java
props.put("batch.size", 16384);       // Batch size in bytes
props.put("linger.ms", 10);           // Wait up to 10ms for batch
```

**Compression:**
- Compress batches before sending
- Algorithms: gzip, snappy, lz4, zstd

```java
props.put("compression.type", "snappy");
```

**Trade-offs:**
- Batching: Higher throughput, slight latency increase
- Compression: Smaller network transfer, CPU cost

**Key takeaway:** Batching + compression = higher throughput.

---

## Consumers

### Consumer API
**Subscribe to topics:**
```java
Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("group.id", "my-consumer-group");
props.put("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");
props.put("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer");

KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
consumer.subscribe(Arrays.asList("my-topic"));

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    for (ConsumerRecord<String, String> record : records) {
        System.out.printf("offset=%d, key=%s, value=%s%n",
                         record.offset(), record.key(), record.value());
    }
}
```

**Key takeaway:** Subscribe to topics, poll for records, process messages.

---

### Consumer Groups
**Definition:** Group of consumers sharing workload of topic.

**How it works:**
- Each partition assigned to exactly one consumer in group
- Different consumer groups read independently (each gets all messages)

**Example:**
```
Topic: orders (3 partitions)
Consumer Group A: 3 consumers
  Consumer 1 → Partition 0
  Consumer 2 → Partition 1
  Consumer 3 → Partition 2

Consumer Group B: 2 consumers
  Consumer 1 → Partitions 0, 1
  Consumer 2 → Partition 2
```

**Scaling:**
- More consumers than partitions → some consumers idle
- Fewer consumers than partitions → some consumers handle multiple partitions

**Key takeaway:** Partition per consumer in group. Scale by adding consumers.

---

### Offset Management
**Definition:** Consumer's position in partition. Tracks which messages read.

**Auto-commit (default):**
```java
props.put("enable.auto.commit", "true");
props.put("auto.commit.interval.ms", "5000");  // Every 5 seconds
```

**Manual commit:**
```java
props.put("enable.auto.commit", "false");

// Process records
consumer.poll(Duration.ofMillis(100));

// Commit after processing
consumer.commitSync();   // Blocking
consumer.commitAsync();  // Non-blocking
```

**Storing offsets:**
- Kafka 0.9+: Stored in internal topic `__consumer_offsets`
- Earlier: ZooKeeper

**Key takeaway:** Offset = read position. Auto or manual commit.

---

### Rebalancing
**Definition:** Reassign partitions when consumers join/leave group.

**Triggers:**
- Consumer joins group
- Consumer crashes/leaves
- New partitions added

**Process:**
1. Stop consuming
2. Reassign partitions
3. Resume consuming (from last committed offset)

**Problems:**
- Temporary unavailability during rebalance
- Duplicate processing if offsets not committed

**Strategies:**
- **Eager rebalancing:** Stop all, reassign all (default, slow)
- **Cooperative rebalancing:** Incremental reassignment (Kafka 2.4+, faster)

**Key takeaway:** Rebalancing redistributes partitions. Causes brief downtime.

---

### Delivery Semantics
**At-most-once (may lose messages):**
- Commit offset before processing
- If crash → message lost

**At-least-once (may duplicate):**
- Process message, then commit offset
- If crash before commit → message reprocessed

**Exactly-once (EOS):**
- Use transactions (Kafka Streams)
- Idempotent producers + transactional consumers
- Complex, performance cost

**Recommendation:** At-least-once + idempotent processing (most common).

**Key takeaway:** At-least-once = default. Idempotent processing handles duplicates.

---

## Topics & Partitions

### Topics
**Definition:** Logical category for messages. Like database table.

**Create topic:**
```bash
kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic my-topic \
  --partitions 3 \
  --replication-factor 2
```

**List topics:**
```bash
kafka-topics --list --bootstrap-server localhost:9092
```

**Describe topic:**
```bash
kafka-topics --describe --topic my-topic --bootstrap-server localhost:9092
```

**Key takeaway:** Topic = category. Multiple partitions, configurable replication.

---

### Partitions
**Definition:** Ordered, immutable sequence of messages within topic.

**Why partition?**
- **Parallelism:** Multiple consumers process simultaneously
- **Scalability:** Distribute across brokers
- **Ordering:** Guaranteed within partition (not across partitions)

**Partition assignment:**
- Producer: Based on key hash or custom partitioner
- Consumer: Assigned by group coordinator

**Key points:**
- Partition count determines max parallelism
- Cannot reduce partition count (only increase)
- Choose wisely upfront

**Key takeaway:** Partition = parallelism unit. Ordering within partition only.

---

### Partition Replication
**Definition:** Copies of partition across multiple brokers for fault tolerance.

**Leader-Follower model:**
- **Leader:** Handles all reads and writes for partition
- **Followers (replicas):** Replicate data from leader
- If leader fails, follower promoted to leader

**In-Sync Replicas (ISR):**
- Replicas caught up with leader
- `acks=all` waits for all ISR to acknowledge

**Example:**
```
Topic: orders, Partition 0, Replication Factor: 3
  Leader: Broker 1
  ISR: Broker 1, Broker 2, Broker 3 (all in sync)
```

**Key takeaway:** Leader handles I/O. Followers replicate. ISR = caught-up replicas.

---

### Retention Policies
**Time-based:**
```
retention.ms=604800000  # 7 days (default)
```

**Size-based:**
```
retention.bytes=1073741824  # 1GB per partition
```

**Log Compaction:**
- Keep only latest value for each key
- Used for change data capture (CDC)

```
cleanup.policy=compact
```

**Key takeaway:** Time or size retention. Compaction for latest values.

---

## High Availability & Replication

### Broker Failure Handling
**Scenario:** Broker hosting partition leader fails.

**Process:**
1. ZooKeeper detects broker failure
2. Controller elects new leader from ISR
3. Clients redirect to new leader
4. Failed broker rejoins as follower (when back)

**Min In-Sync Replicas:**
```
min.insync.replicas=2  # Minimum ISR for acks=all
```

**If ISR < min.insync.replicas:**
- Producer with `acks=all` gets error
- Trade-off: Availability vs durability

**Key takeaway:** Auto-failover. New leader from ISR. Configure min.insync.replicas.

---

### ZooKeeper Role
**Functions (legacy, removing in Kafka 4.0):**
- Cluster membership (broker list)
- Leader election for partitions
- Topic configuration
- Consumer group coordination (old API)

**KRaft (Kafka Raft - ZooKeeper replacement):**
- Kafka 3.3+: Production-ready
- Self-managed metadata (no external dependency)
- Faster leader elections
- Simpler deployment

**Key takeaway:** ZooKeeper for coordination (legacy). KRaft = future (no ZooKeeper).

---

### Kafka Controller
**Definition:** One broker elected as controller. Manages partition leaders.

**Responsibilities:**
- Elect partition leaders
- Monitor broker failures
- Propagate metadata changes

**Election:**
- First broker to register in ZooKeeper becomes controller
- If controller fails, new one elected

**Key takeaway:** Controller manages cluster state. One per cluster.

---

## Performance & Optimization

### Throughput Optimization
**Producer:**
```java
props.put("batch.size", 32768);           // Larger batches
props.put("linger.ms", 20);               // Wait for batch
props.put("compression.type", "snappy");  // Compress
props.put("buffer.memory", 67108864);     // 64MB buffer
```

**Consumer:**
```java
props.put("fetch.min.bytes", 1024);       // Min data per fetch
props.put("fetch.max.wait.ms", 500);      // Max wait for min data
props.put("max.partition.fetch.bytes", 1048576); // 1MB per partition
```

**Key takeaway:** Batching, compression, buffer tuning.

---

### Latency Optimization
**Producer:**
```java
props.put("linger.ms", 0);           // Send immediately
props.put("batch.size", 1);          // Small batches
props.put("compression.type", "none"); // No compression
```

**Consumer:**
```java
props.put("fetch.min.bytes", 1);     // Don't wait for data
```

**Trade-off:** Lower latency, lower throughput.

**Key takeaway:** Reduce batching/compression for low latency.

---

### Monitoring
**Key metrics:**

**Broker:**
- Under-replicated partitions (unhealthy)
- Active controller count (should be 1)
- Request rate, byte rate
- Log flush latency

**Producer:**
- Record send rate
- Record error rate
- Batch size average
- Compression ratio

**Consumer:**
- Lag (difference between latest offset and consumer offset)
- Fetch rate
- Rebalance rate

**Tools:**
- JMX metrics
- Kafka Manager / AKHQ
- Prometheus + Grafana
- Confluent Control Center

**Key takeaway:** Monitor lag, under-replicated partitions, error rates.

---

### Consumer Lag
**Definition:** How far behind consumer is from latest message.

**Formula:**
```
Lag = Latest Offset - Consumer Offset
```

**Causes:**
- Slow processing
- Insufficient consumers
- Consumer downtime

**Solutions:**
- Scale consumers (add more to group)
- Optimize processing logic
- Increase fetch size

**Key takeaway:** Lag = behind latest. Scale consumers to reduce.

---

## Best Practices

### 1. Topic Design
**Partition count:**
- Start with `max(producers, consumers)` for parallelism
- Can increase later (but not decrease)
- Too many partitions → overhead (leader election, files)

**Naming convention:**
```
<team>.<product>.<event-type>
analytics.ecommerce.order-created
analytics.ecommerce.order-cancelled
```

**Key takeaway:** Plan partitions upfront. Consistent naming.

---

### 2. Message Design
**Use Schema Registry (Avro, Protobuf):**
- Schema evolution (add fields without breaking)
- Type safety
- Documentation

**Include metadata in headers:**
```java
record.headers().add("trace-id", traceId.getBytes());
```

**Keep messages small:**
- Kafka optimized for many small messages
- Large messages (>1MB) → performance issues

**Key takeaway:** Schema registry, small messages, metadata in headers.

---

### 3. Error Handling
**Producer:**
- Retry with exponential backoff
- Dead Letter Queue (DLQ) for failures

**Consumer:**
- Try-catch around processing
- DLQ for poison pills (messages causing errors)
- Commit offset only after successful processing

```java
while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    for (ConsumerRecord<String, String> record : records) {
        try {
            process(record);
            consumer.commitSync();  // Commit after success
        } catch (Exception e) {
            sendToDLQ(record);      // Send to DLQ
        }
    }
}
```

**Key takeaway:** DLQ for failures. Commit after processing.

---

### 4. Security
**1. Encryption (TLS):**
```properties
security.protocol=SSL
ssl.truststore.location=/var/private/ssl/kafka.client.truststore.jks
```

**2. Authentication (SASL):**
```properties
security.protocol=SASL_SSL
sasl.mechanism=PLAIN
```

**3. Authorization (ACLs):**
```bash
kafka-acls --add \
  --allow-principal User:alice \
  --operation Read \
  --topic my-topic
```

**Key takeaway:** TLS encryption, SASL authentication, ACLs.

---

### 5. Capacity Planning
**Calculate throughput:**
```
Messages/sec × Message size × Replication factor × Retention days
```

**Example:**
- 10,000 msg/sec
- 1KB per message
- Replication factor: 3
- Retention: 7 days

```
10,000 × 1KB × 3 × 7 days × 86400 sec/day = ~18 TB
```

**Recommendation:** Plan for 2-3x growth.

**Key takeaway:** Calculate storage needs. Plan for growth.

---

### 6. Testing
**Unit tests:**
- Mock producers/consumers
- Test serialization/deserialization

**Integration tests:**
- Embedded Kafka (Testcontainers)
- Verify end-to-end flow

**Load testing:**
- kafka-producer-perf-test
- kafka-consumer-perf-test

```bash
kafka-producer-perf-test \
  --topic test \
  --num-records 1000000 \
  --record-size 1024 \
  --throughput -1 \
  --producer-props bootstrap.servers=localhost:9092
```

**Key takeaway:** Unit, integration, load tests. Use embedded Kafka.

---

## Interview Tips

1. **Explain architecture:** "Kafka uses partitioned log. Producers append, consumers read by offset. Replication for fault tolerance."
2. **Discuss ordering:** "Kafka guarantees order within partition only. Use message key to route to same partition."
3. **Real examples:** "Used Kafka for event-driven microservices. Order service publishes events, inventory service consumes."
4. **Know trade-offs:** "acks=all for durability, acks=1 for balance, acks=0 for speed."
5. **Consumer groups:** "Scale by adding consumers to group. Each partition assigned to one consumer."

**Key concepts:** Partitions, consumer groups, offset management, replication, ordering, durability

---

**Updated:** 2026-06-28 | **Level:** Intermediate-Advanced | **Format:** Interview-ready definitions
