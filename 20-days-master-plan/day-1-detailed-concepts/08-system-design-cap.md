# System Design: CAP Theorem & Consistency Models - Complete Interview Guide

## Table of Contents
1. [CAP Theorem](#cap-theorem)
2. [Consistency Models](#consistency-models)
3. [Real-World Examples](#real-world-examples)
4. [Trade-offs](#trade-offs)
5. [Interview Questions](#interview-questions)

---

## CAP Theorem

**CAP Theorem:** In a distributed system, you can guarantee only 2 out of 3 properties:

```
┌──────────────────────────────────────────┐
│                CAP THEOREM               │
├──────────────────────────────────────────┤
│                                          │
│  C - Consistency                         │
│  A - Availability                        │
│  P - Partition Tolerance                 │
│                                          │
│  Choose 2 out of 3                       │
└──────────────────────────────────────────┘
```

### Consistency (C)
**Definition:** All nodes in a distributed system see the same data at the same time.

```
Write Operation:
┌─────┬─────┬─────┐
│ v:1 │ v:1 │ v:1 │ Node 1, 2, 3 all have same value
└─────┴─────┴─────┘

Any read immediately gets the latest write

Example: Banking system
- Withdraw $100 from account
- All nodes immediately show updated balance
- Consistency: Every node has same account balance
```

### Availability (A)
**Definition:** Every request gets a response (success or failure), even if some nodes are down.

```
System remains operational:
┌─────┐  ✓ Responds
│Node1│
└─────┘

┌─────┐
│Node2│ ✗ Down
└─────┘

┌─────┐  ✓ Responds
│Node3│
└─────┘

System still responds to requests
```

### Partition Tolerance (P)
**Definition:** System continues to function even if network communication between nodes fails.

```
Network Partition (split):

Partition 1:        Partition 2:
┌─────┐             ┌─────┐
│Node1│             │Node2│
│Node2│             │Node3│
└─────┘             └─────┘
  │                   │
  └─────── X ────────┘
        (No communication)

System must handle this situation
```

---

## CAP Trade-offs

### CP System (Consistency + Partition Tolerance)
- When network partition occurs, **sacrifice availability**
- System becomes unavailable until partition heals
- All nodes have same data (consistent)
- Works despite network failures (partition tolerant)

```
User Request
    ↓
Check: Can I guarantee consistency?
    ├─ YES → Respond
    └─ NO → Wait/Reject (unavailable)

Data stays consistent but some requests fail
```

**Best for:** Banking, financial transactions, critical data
**Examples:** PostgreSQL, Traditional SQL databases, Google Spanner

### AP System (Availability + Partition Tolerance)
- When network partition occurs, **sacrifice consistency**
- System always responds (available)
- Different nodes may have different data (eventual consistency)
- Works despite network failures (partition tolerant)

```
User Request
    ↓
Respond immediately with local data
    ↓
Sync data when partition heals
(Data may be inconsistent temporarily)
```

**Best for:** Social media, caching, real-time data
**Examples:** DynamoDB, Cassandra, MongoDB, Elasticsearch

---

## Consistency Models

### Strong Consistency
**Definition:** After a write, all subsequent reads will see that write.

```
Timeline:
T1: Write X = 5
T2: Read X → 5 ✓
T3: Read X → 5 ✓

Guarantee: Every read gets latest write
```

**Pros:**
- Data always correct
- No confusion about state
- Good for critical operations

**Cons:**
- Slower (must coordinate all nodes)
- Higher latency
- Lower throughput

**Example:**
```
Database Transaction:
1. Write Customer Balance = $1000
2. All subsequent reads see $1000 immediately

User cannot see old balance after write
```

### Eventual Consistency
**Definition:** All replicas will eventually have the same data, but not immediately.

```
Timeline:
T1: Write X = 5 (to Node 1)
T2: Read X from Node 2 → might be old value (temporary inconsistency)
T3: Read X from Node 2 → 5 (eventually consistent)

Guarantee: Eventually all nodes converge to same value
```

**Pros:**
- Fast reads/writes
- High availability
- Better performance

**Cons:**
- Temporary inconsistency
- Complicated to reason about
- Not for critical operations

**Example:**
```
Social Media:
1. Post "Hello" to Twitter
2. Post might not appear on all followers' feeds immediately
3. Eventually appears everywhere (within seconds/minutes)

Acceptable because eventual consistency is fine for social posts
```

### Weak Consistency
**Definition:** After a write, reads may or may not see the write.

```
Write X = 5
Immediate Read X → might see old value
Later Read X → might eventually see 5

No guarantee when/if read sees write
```

**Used in:** DNS systems, caching

### Read-After-Write Consistency (Session Consistency)
**Definition:** User sees their own writes immediately, but other users might not.

```
User A: Write X = 5
User A: Read X → 5 ✓ (sees own write)
User B: Read X → might be old value (doesn't see A's write immediately)

Good for: Web applications, user sessions
```

---

## Real-World Examples

### PostgreSQL (CP System)
```
- ACID transactions
- Strong Consistency
- Single primary + replicas
- Partition: replicas lag or become unavailable
- Guarantees: Consistency > Availability

Use Case: Banking, financial systems
```

### DynamoDB (AP System)
```
- Multi-region, distributed
- Eventual Consistency
- Always available
- Partition: returns stale data from available region
- Guarantees: Availability > Consistency

Use Case: Session data, user preferences, real-time analytics
```

### Cassandra (AP System)
```
- Multi-node cluster
- Tunable consistency
- Always available
- Partition: uses quorum writes/reads for better consistency
- Guarantees: High availability

Use Case: Time-series data, analytics, logging
```

### Google Spanner (CP System)
```
- Global distributed database
- Strong Consistency (ACID)
- Uses TrueTime for synchronization
- Sacrifices some availability for consistency
- Guarantees: Consistency + availability across regions

Use Case: Global financial systems, critical applications
```

### MongoDB (AP System)
```
- Multi-node replica sets
- Eventual Consistency (by default)
- Can configure read/write concern for stronger consistency
- Tunable consistency
- Guarantees: Availability

Use Case: Web applications, content management
```

---

## CAP Theorem Applications

### Distributed Cache
```
Cache Consistency vs Availability?

AP System Approach:
- Return cached value immediately (available)
- Sync with source when possible (eventual consistency)
- Some users see stale data temporarily

CP System Approach:
- Wait to ensure latest data (consistent)
- Slower, might timeout (less available)

Usually choose AP for caching
```

### Session Storage
```
Session Consistency needed:
- User sees their own data immediately
- Other sessions don't need immediate consistency
- AP systems with read-after-write

Example: Amazon session store
```

### Analytics Database
```
Eventually Consistent is fine:
- Reports don't need real-time accuracy
- Last hour's data accurate enough
- AP systems suitable

Example: Big Query, Redshift
```

---

## Trade-offs & Design Decisions

### Choosing CP (Sacrifice Availability)
```
When:
- Accuracy more important than response
- Financial/critical data
- Users can wait for consistency

Cost:
- System unavailable during network partition
- Lower throughput
- Complex failure handling
```

### Choosing AP (Sacrifice Consistency)
```
When:
- Availability more important than immediate consistency
- Can tolerate stale data
- User-facing applications

Cost:
- Must handle conflicts
- More complex reconciliation logic
- Monitoring complexity
```

### Stronger Consistency Without Full CP
```
Techniques:
1. Quorum reads/writes
   - Read/write from majority of nodes
   - Higher consistency probability than AP
   - But still available (not full CP)

2. Read repair
   - Detect inconsistencies during reads
   - Fix them automatically

3. Conflict-free replicated data types (CRDTs)
   - Automatically resolve conflicts
   - Used in collaborative systems

4. Vector clocks
   - Track causality
   - Detect concurrent writes
```

---

## Interview Questions

### Q1: What is CAP Theorem?
**Answer:** CAP Theorem states that in a distributed system, you can guarantee only 2 out of 3 properties: Consistency (all nodes see same data), Availability (system always responds), Partition Tolerance (system works despite network failures).

### Q2: Can you have all three (C, A, P)?
**Answer:** No. In a distributed system, network partitions will eventually occur (P is unavoidable). You must choose between:
- CP: Sacrifice availability (wait for consistency)
- AP: Sacrifice consistency (return stale data)

### Q3: What's the difference between strong and eventual consistency?
**Answer:**
- **Strong Consistency**: After write, all reads see latest data immediately
- **Eventual Consistency**: After write, reads might see old data but eventually converge to latest

### Q4: Give examples of CP and AP systems
**Answer:**
- **CP**: PostgreSQL, Oracle, Google Spanner (sacrifice availability for consistency)
- **AP**: Cassandra, DynamoDB, MongoDB (sacrifice consistency for availability)

### Q5: When would you choose CP over AP?
**Answer:** When consistency is more critical than availability:
- Banking systems (money transfers)
- Financial transactions
- Critical data where accuracy is essential
- Users can tolerate temporary unavailability

### Q6: When would you choose AP over CP?
**Answer:** When availability is more critical than immediate consistency:
- Social media (eventual consistency acceptable)
- E-commerce product catalogs (old data acceptable temporarily)
- User session storage
- Real-time dashboards (approximate data fine)

### Q7: What is eventual consistency?
**Answer:** A consistency model where all replicas of data will eventually become consistent after writes, but may show different values temporarily. Used in AP systems for better availability.

### Q8: How do AP systems handle consistency?
**Answer:** Through techniques like:
- Quorum-based reads/writes
- Read repair (fix inconsistencies)
- Conflict resolution strategies
- Vector clocks for causality
- CRDTs for automatic conflict resolution

---

## Key Takeaways

1. **CAP Theorem** = Choose 2 of 3: Consistency, Availability, Partition Tolerance
2. **CP Systems** = Sacrifice availability for consistency (databases)
3. **AP Systems** = Sacrifice consistency for availability (distributed systems)
4. **Strong Consistency** = Latest write always visible
5. **Eventual Consistency** = Consistency after some time
6. **Partition Tolerance** = Unavoidable in distributed systems
7. **Trade-offs** = No perfect solution, choose based on requirements

---

**Understanding CAP Theorem is essential for distributed system design!**
