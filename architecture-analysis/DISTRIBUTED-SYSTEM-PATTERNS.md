# Distributed System Architectural Patterns - Complete Guide

> Comprehensive explanations of distributed system design patterns for building scalable, resilient systems

---

## Table of Contents
1. [Saga Pattern](#saga-pattern)
2. [Quorum Read/Write Pattern](#quorum-readwrite-pattern)
3. [Leader Election Pattern](#leader-election-pattern)
4. [Retry with Backoff Pattern](#retry-with-backoff-pattern)
5. [Circuit Breaker Pattern](#circuit-breaker-pattern)
6. [PubSub Pattern](#pubsub-pattern)
7. [Consistent Hashing](#consistent-hashing)
8. [Sharding](#sharding)
9. [Replication Pattern](#replication-pattern)

---

## Saga Pattern

### Definition
A saga is a distributed transaction pattern that maintains data consistency across multiple services without using traditional ACID transactions. It coordinates a series of local transactions across different services, with each service publishing an event that triggers the next service's local transaction.

### Problem It Solves

**Monolithic Database Issues:**
```
Traditional ACID Transaction (One Database):
  BEGIN TRANSACTION
    ├─ Debit Account A: -$100
    ├─ Credit Account B: +$100
  COMMIT
  
If any step fails → ROLLBACK everything (All or Nothing)
```

**Microservices Challenge:**
```
Multiple Databases (No distributed transactions):
  Service 1: Debit Account A: -$100 ✓
  Service 2: Credit Account B: +$100 ✗ (fails)
  
Problem: Account A is debited but Account B never receives credit!
```

### Two Approaches to Saga

#### 1. Choreography-Based Saga

```
Flow:
  1. Order Service: Create order
     └─ Event: "OrderCreated"
  
  2. Payment Service: Receives "OrderCreated"
     ├─ Process payment
     └─ Event: "PaymentProcessed" OR "PaymentFailed"
  
  3. Inventory Service: Receives "PaymentProcessed"
     ├─ Reserve items
     └─ Event: "InventoryReserved" OR "ReservationFailed"
  
  4. Shipping Service: Receives "InventoryReserved"
     ├─ Create shipment
     └─ Event: "ShipmentCreated" OR "ShipmentFailed"

If any step fails:
  5. Compensation Saga starts (reverse order):
     ├─ Shipping Service: Cancel shipment
     ├─ Inventory Service: Release reservation
     ├─ Payment Service: Refund payment
     └─ Order Service: Cancel order
```

**Choreography Characteristics:**
```
Communication: Event-driven (Pub/Sub)
Decoupling: Services don't know about each other
Complexity: Hard to track flow (distributed logic)
Failure Handling: Implicit (through events)
Testing: Difficult (many paths)
```

#### 2. Orchestration-Based Saga

```
Flow:
  Saga Orchestrator Service (Coordinator):
    ├─ Step 1: Call Order Service → "CreateOrder"
    │   ├─ Response: Order created ✓
    │   └─ State: OrderCreated
    │
    ├─ Step 2: Call Payment Service → "ProcessPayment"
    │   ├─ Response: Payment processed ✓
    │   └─ State: PaymentProcessed
    │
    ├─ Step 3: Call Inventory Service → "ReserveItems"
    │   ├─ Response: Failed (out of stock)
    │   └─ State: ReservationFailed
    │
    └─ Compensation Phase (in reverse):
         ├─ Call Payment Service → "RefundPayment"
         ├─ Call Order Service → "CancelOrder"
         └─ State: TransactionRolledBack
```

**Orchestration Characteristics:**
```
Communication: Direct RPC/HTTP
Decoupling: Orchestrator is tightly coupled
Complexity: Easier to track (centralized)
Failure Handling: Explicit (orchestrator handles it)
Testing: Easier (single coordinator)
Latency: Higher (orchestrator is bottleneck)
```

### State Machine for Saga

```
┌─────────────┐
│   Start     │
└──────┬──────┘
       │
       ↓
┌──────────────────────┐
│ Step 1: Create Order │
└──────┬───────────────┘
       │
       ├─ Success ─→ ┌──────────────┐
       │             │ OrderCreated │
       │             └──────┬───────┘
       │                    ↓
       │            ┌──────────────────────┐
       │            │ Step 2: Charge Card  │
       │            └──────┬───────────────┘
       │                   │
       │                   ├─ Success ─→ ┌─────────────┐
       │                   │             │ PaymentDone │
       │                   │             └──────┬──────┘
       │                   │                    ↓
       │                   │         ┌─────────────────────┐
       │                   │         │ Step 3: Update Stock│
       │                   │         └──────┬──────────────┘
       │                   │                │
       │                   │ Fail ←──────────┴──→ Compensation
       │                   │                     (Refund)
       │                   │                        ↓
       │                   └──→ ┌──────────────────────┐
       │                        │ Compensation Phase  │
       │                        │ - Refund payment    │
       │                        │ - Cancel order      │
       │                        └─────────┬───────────┘
       │                                  ↓
       │                          ┌─────────────────┐
       │                          │   Compensation  │
       │                          │   Complete      │
       └──→ Fail ──────────────→  └─────────────────┘
```

### Key Considerations

**Idempotency (Critical for Saga):**
```
Each saga step must be idempotent:
  - Calling it twice = same result as calling once
  - Prevents duplicate charges if retry happens

Example:
  ❌ Bad: UPDATE account SET balance = balance - 100
         (Calling twice: -$200!)
  
  ✅ Good: UPDATE account SET balance = 1000 - 100
           WHERE balance = 1000
           (Calling twice: same result if already updated)
```

**Compensating Transactions:**
```
Each step must have a compensation step:
  Step: Charge Card $100
  Compensation: Refund Card $100

  Step: Reserve 5 items
  Compensation: Release 5 items reservation

  Note: Some operations can't be compensated
  (e.g., sending email - can only log and alert human)
```

### When to Use Saga

✅ **Good Fit:**
- Microservices transactions
- Operations can be compensated
- Eventual consistency acceptable
- Long-running processes
- Need high availability (no distributed lock)

❌ **Not Suitable:**
- Need strong consistency
- Can't compensate operations
- Few services involved (use database transactions)
- Real-time financial transactions

---

## Quorum Read/Write Pattern

### Definition
A quorum is a minimum number of replicas that must acknowledge a read or write operation for it to be considered successful. It balances consistency and availability in distributed systems.

### The Problem: Consistency vs. Availability

```
Three replicas (Nodes A, B, C):

Scenario 1: Write to All, Read from One
  Write "Value=10":
    ├─ A: ✓ stored
    ├─ B: ✓ stored
    ├─ C: ✗ failed
  
  Read from Node C:
    └─ Returns "Value=?" (outdated or missing)
  
  Problem: Stale read!

Scenario 2: Write to One, Read from All
  Write "Value=10":
    └─ A: ✓ stored
  
  Read from All:
    ├─ A: "Value=10" ✓
    ├─ B: "Value=?" (hasn't received update yet)
    └─ C: "Value=?" (hasn't received update yet)
  
  Problem: Inconsistent reads!
```

### Quorum Solution

**Quorum Calculation:**
```
Total Replicas: N
Write Quorum: Qw (minimum nodes that must ACK a write)
Read Quorum: Qr (minimum nodes that must ACK a read)

Rule: Qw + Qr > N

With N=3:
  Option 1: Qw=2, Qr=2 (2+2=4 > 3) ✓
  Option 2: Qw=3, Qr=1 (3+1=4 > 3) ✓
  Option 3: Qw=1, Qr=3 (1+3=4 > 3) ✓
  Option 4: Qw=2, Qr=1 (2+1=3 ≤ 3) ✗
```

### Architecture with Quorum

```
Write Operation (Qw=2, N=3):
  
  Client writes "Value=10"
    ├─ Node A: Store & return ACK ✓
    ├─ Node B: Store & return ACK ✓
    ├─ Node C: Store (may or may not succeed)
    └─ Success once 2 nodes ACK (Quorum met)

Read Operation (Qr=2, N=3):
  
  Client reads value
    ├─ Node A: Return "Value=10"
    ├─ Node B: Return "Value=10"
    ├─ Node C: Return "Value=?" (outdated)
    └─ Client takes majority (2 nodes = "Value=10")
```

### Quorum Trade-offs

```
Qw=N (Write all), Qr=1 (Read one):
  ├─ Write availability: ❌ Low (all must succeed)
  ├─ Read latency: ⚡ Very Fast
  ├─ Consistency: ✅ Strong
  └─ Use case: Read-heavy workloads
  
Qw=1, Qr=N (Write one):
  ├─ Write availability: ✅ High
  ├─ Read latency: 🐢 Slow (must contact all)
  ├─ Consistency: ✅ Strong
  └─ Use case: Write-heavy workloads

Qw=(N+1)/2, Qr=(N+1)/2 (Balanced):
  ├─ Write availability: ⚖️ Medium
  ├─ Read latency: ⚖️ Medium
  ├─ Consistency: ✅ Strong
  └─ Use case: General purpose
```

### Version Vectors for Consistency

```
Problem: How to know which replica has newest data?

Solution: Version Vector
  {Node_A: 5, Node_B: 3, Node_C: 2}
     ↑         ↑        ↑
  A has seen 5  B has  C has
  updates from  seen 3 seen 2

Comparison:
  Data_1: {A:5, B:3, C:2}
  Data_2: {A:5, B:4, C:2}
  
  Data_2 > Data_1 (B's clock advanced)
  → Data_2 is newer
  
  Data_1: {A:5, B:3, C:2}
  Data_3: {A:4, B:5, C:3}
  
  Neither is clearly newer (concurrent updates)
  → Conflict! Need application-level resolution
```

### Real-World Implementation

```
Quorum in Practice (Cassandra/DynamoDB):

DynamoDB Example (N=3):
  Qw = 2 (Write to 2 replicas)
  Qr = 1 (Read from 1 replica)
  
  Write: CreateOrder
    ├─ Write to Region A ✓
    ├─ Write to Region B ✓
    ├─ Write to Region C (eventually)
    └─ Return success after 2 ACKs
  
  Read: GetOrder
    └─ Read from any region
    └─ Return immediately
  
  Tradeoff: Possible stale reads, but fast and available
```

---

## Leader Election Pattern

### Definition
Leader election is the process by which a group of distributed processes chooses one process to coordinate or make decisions for the entire group. If the leader fails, a new leader is automatically elected.

### Problem It Solves

```
Distributed Services Without Leader:
  
  Service A, B, C (all equal)
    ├─ No single point of authority
    ├─ All want to handle: Database cleanup, Batch processing, Scheduled jobs
    └─ Result: Duplicate work, race conditions
    
  Service A: Starts cleanup at 1:00 AM
  Service B: Also starts cleanup at 1:00 AM
  Service C: Also starts cleanup at 1:00 AM
  
  Problem: Database locked, jobs run 3x, conflicts!

With Leader:
  
  One Leader (Service A) is chosen
    ├─ Only Service A does: Cleanup, Batch processing
    └─ Services B, C watch and standby
    
  If Service A dies:
    ├─ B and C detect failure
    ├─ New election happens
    ├─ Service B becomes leader
    └─ Cleanup continues
```

### Election Algorithms

#### 1. Consensus-Based (Raft, Paxos)

```
Raft Algorithm (Simplified):

Initial State: All nodes are FOLLOWERS
                         ↓
1. Election Timeout:
   Random timeout (150-300ms) expires
   Follower → CANDIDATE
   
2. Request Votes:
   Candidate requests votes from all peers
   ├─ "Vote for me, term=5"
   └─ I have the latest log entries
   
3. Voting Decision:
   Peers vote if:
   ├─ Haven't voted in this term yet
   ├─ Candidate's log is up-to-date
   └─ Responder's term ≤ candidate's term
   
4. Majority Wins:
   If candidate gets > N/2 votes
   ├─ Becomes LEADER
   ├─ Starts heartbeat to all followers
   └─ All followers know leader is in charge
   
5. Heartbeat:
   Leader sends heartbeat every 50ms
   ├─ Followers reset timeout
   ├─ No new election while leader alive
   └─ If leader dies: timeout expires, new election starts

State Transitions:
  FOLLOWER ─(timeout)─→ CANDIDATE ─(win votes)─→ LEADER
    ↑                                              │
    └──────────────────(heartbeat)─────────────────┘
```

**Why Raft is Popular:**
- Easy to understand
- Safety guaranteed (doesn't produce two leaders)
- Performance comparable to Paxos
- Used in etcd, Consul, RocksDB

#### 2. Quorum-Based Election

```
Configuration: N nodes need to elect leader

Voting Process:
  1. Node proposes itself: "I'm candidate for term T"
  
  2. All nodes record their vote
  
  3. Result:
     ├─ One node gets > N/2 votes → LEADER
     ├─ No clear winner → No leader, retry
     └─ Split brain risk if network partitioned

Safety Property: At most one leader per term
  (Because > N/2 votes means majority agreement)
```

#### 3. Zookeeper-Based Election

```
Central Coordinator Approach:

Nodes don't directly communicate
├─ All connect to Zookeeper (consensus service)
├─ Create ephemeral sequential nodes
└─ Node with lowest sequence = Leader

Election Process:
  1. Node A creates: /leader/node-0000001 (ephemeral)
  2. Node B creates: /leader/node-0000002 (ephemeral)
  3. Node C creates: /leader/node-0000003 (ephemeral)
  
  4. Read all nodes
     ├─ Lowest = node-0000001 (Node A)
     └─ Node A is LEADER
  
  5. If Node A crashes:
     ├─ Zookeeper deletes: /leader/node-0000001
     ├─ Node B detects deletion
     ├─ Node B sees itself as lowest
     └─ Node B becomes LEADER

Advantages:
  ├─ Centralized coordination (simpler)
  ├─ Zookeeper handles consensus internally
  └─ Automatic failure detection
```

### Leader Election Timeline

```
Time: 0:00    All nodes start (no leader)
      │
      ├─ Node A: Timer = 200ms
      ├─ Node B: Timer = 250ms (random)
      ├─ Node C: Timer = 300ms
      
Time: 0:200   Node A timeout expires
      │       ├─ Becomes CANDIDATE
      │       ├─ Votes for itself
      │       ├─ Requests votes from B, C
      │       
Time: 0:210   B receives vote request
      │       ├─ Grants vote to A
      │       
Time: 0:215   C receives vote request
      │       ├─ Grants vote to A
      │       
Time: 0:220   A gets majority (2 out of 3)
      │       ├─ Becomes LEADER
      │       ├─ Sends heartbeat to B, C
      │       
Time: 0:225   B receives heartbeat
      │       ├─ Resets timer
      │       ├─ Becomes FOLLOWER
      │       
Time: 0:226   C receives heartbeat
      │       ├─ Resets timer
      │       ├─ Becomes FOLLOWER
      │       
Time: 0:270   A sends next heartbeat
      │       └─ B, C reset timers
      │
Time: 2:000   A crashes!
      │       ├─ B's timer expires (no heartbeat)
      │       └─ C's timer expires
      │
Time: 2:150   B timeout expires
      │       ├─ Becomes CANDIDATE
      │       ├─ Requests votes
      │
Time: 2:160   C grants vote to B
      │
Time: 2:170   B becomes LEADER
      │       └─ Sends heartbeat
```

### Failure Scenarios

```
Scenario 1: Leader Failure
  ├─ Followers detect: No heartbeat for 300ms
  ├─ Election triggered
  ├─ New leader chosen
  └─ Recovery time: 300ms - 1000ms

Scenario 2: Network Partition
  
  Before partition: A is leader, B and C are followers
  
  Network splits:
    Partition 1: [A] (1 node)
    Partition 2: [B, C] (2 nodes)
  
  Results:
    ├─ Partition 1: A loses leadership (< N/2)
    ├─ Partition 2: B wins election (> N/2)
    └─ Problem: Two "leaders"!
  
  Solution: A becomes FOLLOWER when isolated
    ├─ Stops accepting writes
    ├─ When partition heals, A syncs from B
    └─ No conflicting writes

Scenario 3: Failed Leader Recovery
  
  A was leader, crashed, comes back online
  ├─ A rejoins, sees higher term from B
  ├─ A downgrades to FOLLOWER
  ├─ A catches up from B
  └─ Consistency maintained
```

---

## Retry with Backoff Pattern

### Definition
Retry with backoff is a resilience pattern where a failed operation is automatically retried with increasing delays between attempts. This prevents overwhelming a struggling service and increases eventual success chances.

### The Problem

```
Simple Retry (No backoff):
  
  Request fails
    ├─ Retry immediately
    ├─ Retry immediately
    ├─ Retry immediately (thundering herd!)
    └─ Results: Overwhelms service, increases failures

Scenario: Service handles 100 req/s
  1 request fails, triggers 10 retries
    ├─ Total: 11 requests hit service
    ├─ Service already struggling
    └─ Retry makes it worse (cascading failure)
```

### Backoff Strategies

#### 1. Exponential Backoff

```
Delay increases exponentially:
  Attempt 1: Fail immediately, retry at T=1s
  Attempt 2: Fail, retry at T=2s
  Attempt 3: Fail, retry at T=4s
  Attempt 4: Fail, retry at T=8s
  Attempt 5: Fail, retry at T=16s
  Attempt 6: Fail, retry at T=32s
  
  Formula: delay = base * (multiplier ^ attempt)
           delay = 1 * (2 ^ attempt)

Timeline:
  T=0:00     Request 1 sent ─────────────┐
  T=0:01     Fail, retry                 ├─ Request 2 sent
  T=0:03     Fail, retry                 ├─ Request 3 sent
  T=0:07     Fail, retry                 ├─ Request 4 sent
  T=0:15     Fail, retry                 ├─ Request 5 sent
  T=0:31     Fail, retry                 ├─ Request 6 sent
  T=1:03     Service recovered ✓
```

**Advantage:** Gives service time to recover
**Disadvantage:** Later retries very slow

#### 2. Linear Backoff

```
Delay increases linearly:
  Attempt 1: Retry at T=1s
  Attempt 2: Retry at T=2s
  Attempt 3: Retry at T=3s
  Attempt 4: Retry at T=4s
  
  Formula: delay = base * attempt
           delay = 1s * attempt

Timeline:
  T=0:00     Request 1 sent
  T=0:01     Fail, retry (delay=1s)
  T=0:02     Fail, retry (delay=2s)
  T=0:04     Fail, retry (delay=3s)
  T=0:07     Fail, retry (delay=4s)
  T=0:11     Service recovered ✓
  
Advantage: Predictable, smoother ramp
Disadvantage: Doesn't handle congestion as well
```

#### 3. Exponential + Jitter

```
Problem: Thundering Herd
  
  If 1000 clients fail at same time (T=0:10)
  And all retry with exponential backoff
  All 1000 retry at T=0:11 (same second!)
    └─ Causes spike: 1000 requests hit service
  
Solution: Add random jitter
  
  Attempt 1: delay = 1s + random(0, 100ms)
             = 1.05s (for some clients)
             = 1.02s (for others)
             = 1.08s (for others)
  
  Result:
    ├─ Client 1 retries at 1.05s
    ├─ Client 2 retries at 1.02s
    ├─ Client 3 retries at 1.08s
    └─ Requests spread out (no spike!)
  
  Formula: delay = (base * 2^attempt) + random(0, min(cap, base*2^attempt))
           Example: delay = 1000ms * 2^attempt + random(0, min(32000ms, 1000ms*2^attempt))
```

### When to Retry vs. Not

```
✅ RETRY (Transient Errors):
  - Connection timeout
  - Service temporarily unavailable (500)
  - Request timeout
  - Throttling (429)
  
  Why: Likely to succeed on retry
  
❌ DON'T RETRY (Permanent Errors):
  - Bad request (400)
  - Unauthorized (401)
  - Not found (404)
  - Unprocessable entity (422)
  
  Why: Retrying won't fix the error
```

### Max Retry Strategies

```
Strategy 1: Max Attempts
  ├─ Max retries: 5
  ├─ Give up after 5 failed attempts
  ├─ Risk: Give up too early
  └─ Good for: Time-sensitive operations

Strategy 2: Max Duration
  ├─ Max time: 60 seconds
  ├─ Keep retrying for up to 60s
  ├─ Risk: Resource exhaustion
  └─ Good for: Non-time-sensitive operations

Strategy 3: Adaptive Retry
  ├─ Analyze error type
  ├─ Transient (timeout): Retry
  ├─ Permanent (404): Don't retry
  ├─ Throttled (429): Retry with longer backoff
  └─ Good for: Production systems
```

### Implementation Pattern

```
Pseudocode:
  
  function retryWithBackoff(operation, maxAttempts=5):
    attempt = 0
    while attempt < maxAttempts:
      try:
        return operation()  // Success!
      catch error:
        if not isRetryable(error):
          throw error  // Don't retry permanent errors
        
        attempt += 1
        if attempt >= maxAttempts:
          throw error  // Give up after max attempts
        
        delay = calculateBackoff(attempt)
        jitter = random(0, delay * 0.1)
        sleep(delay + jitter)
        
        log("Retry attempt {attempt} after {delay}ms")
  
  function calculateBackoff(attempt):
    baseDelay = 100  // ms
    maxDelay = 32000  // 32 seconds
    
    exponentialDelay = baseDelay * (2 ^ attempt)
    return min(exponentialDelay, maxDelay)
  
  function isRetryable(error):
    nonRetryableStatuses = [400, 401, 403, 404, 422]
    return error.statusCode not in nonRetryableStatuses
```

---

## Circuit Breaker Pattern

### Definition
Circuit breaker prevents an application from making requests to a failing service. It monitors requests and "opens the circuit" (stops sending requests) when failure rate exceeds a threshold, similar to an electrical circuit breaker.

### Problem It Solves

```
Cascading Failure Without Circuit Breaker:

Timeline:
  T=0:00  ServiceB crashes
  T=0:01  ServiceA makes request → ServiceB (fails)
  T=0:02  ServiceA retries → ServiceB (fails)
  T=0:03  ServiceA retries → ServiceB (fails)
  ...
  T=1:00  ServiceA still making requests to dead ServiceB
  
  Result:
    ├─ ServiceA: Thread pool exhausted (waiting for responses)
    ├─ ServiceA: Can't handle new requests (all threads blocked)
    ├─ Requests queue up
    └─ Cascading: Clients upstream now slow/fail
    
  Domino Effect:
    ClientA → ServiceA → ServiceB (dead)
    ClientB → ServiceA (slow/unresponsive)
    ClientC → ServiceA (slow/unresponsive)
    
    All downstream services affected!
```

### Circuit Breaker States

```
┌──────────────────────────────────────────────────────┐
│                                                       │
│  CLOSED (Normal Operation)                          │
│  ├─ All requests pass through                       │
│ ├─ Failures counted                                 │
│  └─ If failure_rate > threshold → Open              │
│         ↓ (trigger opens)                            │
│  OPEN (Stop Requests)                               │
│  ├─ Requests rejected immediately                   │
│  ├─ No calls to failing service                     │
│  ├─ Fail fast (don't waste resources)               │
│  └─ After timeout → Half-Open                       │
│         ↑ (time to test)                             │
│  HALF-OPEN (Testing Recovery)                       │
│  ├─ Limited requests allowed                        │
│  ├─ Testing if service recovered                    │
│  ├─ If success → Close                              │
│  ├─ If failure → Open                               │
│  └─ Timeout → Open                                  │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### Detailed State Transitions

```
CLOSED State:
  Entry: Service is healthy
  
  Monitoring:
    ├─ Request count: [0, 100]
    ├─ Error count: [0, 50]
    ├─ Error rate: 50 / 100 = 50%
    
  Decision:
    if error_rate >= threshold (e.g., 50%):
      → Transition to OPEN
    else:
      → Stay CLOSED

OPEN State:
  Entry: Service is struggling
  
  Behavior:
    ├─ New requests immediately rejected
    ├─ Exception thrown: "CircuitBreakerOpenException"
    ├─ No actual calls to service
    └─ Metrics reset for next attempt
  
  Duration:
    ├─ After timeout (e.g., 30 seconds)
    ├─ Try recovery (test if service is back)
    └─ → Transition to HALF-OPEN

HALF-OPEN State:
  Entry: Probing if service recovered
  
  Behavior:
    ├─ Allow limited requests through (e.g., 3 requests)
    ├─ Monitor these test requests closely
    
  Results:
    ├─ All succeed → Service recovered!
    │  └─ → Transition to CLOSED (resume normal)
    │
    ├─ Any failure → Service still broken
    │  └─ → Transition back to OPEN
    │
    └─ Timeout → Taking too long
       └─ → Transition back to OPEN (still not ready)
```

### Example Timeline

```
Time: 0:00
  Circuit: CLOSED
  ServiceB is healthy ✓
  
Time: 0:10
  Request 1 to ServiceB → ✓ Success
  Request 2 to ServiceB → ✓ Success
  Error rate: 0/2 = 0%
  
Time: 0:20
  ServiceB starts degrading
  Request 3 → ✗ Timeout
  Request 4 → ✗ Error
  Request 5 → ✗ Error
  Error rate: 3/5 = 60% > threshold(50%)
  
Time: 0:21
  Circuit: OPEN
  Request 6 → Rejected immediately (no call made)
  Request 7 → Rejected immediately
  Request 8 → Rejected immediately
  
Time: 0:30
  30 seconds passed
  Circuit: HALF-OPEN
  Allowing test requests...
  
Time: 0:31
  Request 9 (test) → ✗ Still failing
  ServiceB not recovered yet
  Circuit: OPEN again
  
Time: 1:00
  Another 30 seconds passed
  Circuit: HALF-OPEN (retry)
  Allowing test requests...
  
Time: 1:01
  Request 10 (test) → ✓ Success!
  Request 11 (test) → ✓ Success!
  Request 12 (test) → ✓ Success!
  
  ServiceB recovered!
  Circuit: CLOSED
  Resume normal operation
```

### Metrics Tracked

```
Closed State Metrics:
  ├─ Request count (window): last 100 requests
  ├─ Failure count: 50 failures
  ├─ Error rate: 50%
  ├─ Response time: 150ms avg
  └─ Threshold check: 50% > 50%? → Open

Half-Open State Metrics:
  ├─ Test request count: 3 requests
  ├─ Test success count: 3 successes
  ├─ Success rate: 100%
  └─ Recovery decision: 100% > threshold(90%)? → Close

Open State Metrics:
  ├─ Rejection count: 100 rejected
  ├─ Time in open: 15 seconds (out of 30s timeout)
  └─ Next attempt: 15 seconds remaining
```

### Bulkhead Pattern (Related)

```
Circuit Breaker focuses on: Stopping cascading failures
Bulkhead focuses on: Isolating resource exhaustion

Bulkhead Concept:
  ├─ Divide thread pools by purpose
  ├─ ServiceA calls ServiceB with Thread Pool A
  ├─ ServiceA calls ServiceC with Thread Pool B
  ├─ If ServiceB slow: Only Pool A threads exhausted
  ├─ ServiceC still responsive (Pool B unaffected)
  └─ Failure isolated to one dependency

Comparison:
  
  Without Bulkhead:
    ServiceA [Thread 1] ──→ ServiceB (hangs)
             [Thread 2] ──→ ServiceB (hangs)
             [Thread 3] ──→ ServiceC ✓
             ...all threads hung on B!
    
  With Bulkhead:
    ServiceA [Pool A] ──→ ServiceB (Pool A exhausted)
             [Pool C] ──→ ServiceC ✓ (still responsive)
```

---

## PubSub Pattern

### Definition
Publish-Subscribe is a messaging pattern where publishers send messages to topics without knowing about subscribers. Subscribers listen to topics they're interested in and receive messages asynchronously.

### Problem It Solves

```
Tightly Coupled System (Request-Response):
  
  Order Service directly calls:
    ├─ Payment Service
    ├─ Inventory Service
    ├─ Shipping Service
    ├─ Email Service
    ├─ Analytics Service
    └─ Notification Service
  
  Problems:
    ├─ If any service fails: Order fails
    ├─ Order Service knows about all dependencies
    ├─ Hard to add new services (modify Order Service)
    ├─ Network calls increase latency
    └─ Synchronous: Must wait for all responses

Loose Coupling with PubSub:
  
  Order Service publishes:
    └─ Event: "OrderCreated"
  
  Subscribers listen:
    ├─ Payment Service: Listens to "OrderCreated"
    ├─ Inventory Service: Listens to "OrderCreated"
    ├─ Shipping Service: Listens to "OrderCreated"
    ├─ Email Service: Listens to "OrderCreated"
    ├─ Analytics Service: Listens to "OrderCreated"
    └─ Notification Service: Listens to "OrderCreated"
  
  Benefits:
    ├─ Order Service doesn't know about subscribers
    ├─ Services can be added/removed independently
    ├─ Asynchronous: Doesn't wait for responses
    └─ Can scale each subscriber independently
```

### Architecture Patterns

#### 1. Topic-Based PubSub

```
Multiple subscribers to same topic:

Topic: "OrderCreated"
  ├─ Publisher: Order Service
  ├─ Subscribers:
  │  ├─ Queue 1 → Payment Service (processes payment)
  │  ├─ Queue 2 → Inventory Service (reserves stock)
  │  ├─ Queue 3 → Shipping Service (creates shipment)
  │  ├─ Queue 4 → Email Service (sends confirmation)
  │  └─ Queue 5 → Analytics Service (logs event)
  
Message Flow:
  Order Service publishes:
    └─ Event: {orderId: 123, amount: $100, items: [...]}
  
  Message Broker receives:
    ├─ Routes to Queue 1: Payment Service
    ├─ Routes to Queue 2: Inventory Service
    ├─ Routes to Queue 3: Shipping Service
    ├─ Routes to Queue 4: Email Service
    └─ Routes to Queue 5: Analytics Service
  
  All subscribers receive independently:
    ├─ Payment processes: Update ledger
    ├─ Inventory reserves: Update stock
    ├─ Shipping schedules: Plan pickup
    ├─ Email sends: Confirmation to customer
    └─ Analytics records: Event in warehouse

Each subscriber processes at own pace:
  ├─ Payment: Takes 2 seconds
  ├─ Inventory: Takes 1 second
  ├─ Shipping: Takes 5 seconds
  ├─ Email: Takes 10 seconds (external service)
  └─ Analytics: Takes 3 seconds
  
  All happen in parallel (not sequential)!
```

#### 2. Queue-Based PubSub (Fan-out)

```
One topic routed to multiple queues:

Topic                 Queues              Consumers
│                      │
├─ Order Created ────→ Queue-Payment ──→ Payment Service
├─ Order Created ────→ Queue-Inventory ─→ Inventory Service
├─ Order Created ────→ Queue-Shipping ──→ Shipping Service
├─ Order Created ────→ Queue-Email ────→ Email Service
└─ Order Created ────→ Queue-Analytics ─→ Analytics Service

Example (AWS SNS + SQS):
  SNS Topic: order-events
    ├─ Subscription: Queue-Payment (SQS)
    ├─ Subscription: Queue-Inventory (SQS)
    └─ Subscription: Queue-Shipping (SQS)
  
  Order Service publishes to: order-events (SNS)
  → SNS fan-outs to all subscribed queues
  → Each queue has independent consumers
```

#### 3. Event Sourcing + PubSub

```
Store all events, rebuild state from events:

Event Stream:
  T=0:00  Event: OrderCreated {orderId: 123}
  T=0:01  Event: PaymentProcessed {orderId: 123, status: approved}
  T=0:02  Event: StockReserved {orderId: 123, items: 5}
  T=0:03  Event: ShipmentCreated {orderId: 123, trackingId: xyz}

Subscribers receive events:
  ├─ Payment Service: Processes "PaymentProcessed"
  ├─ Inventory Service: Processes "StockReserved"
  ├─ Shipping Service: Processes "ShipmentCreated"
  └─ Query Service: Maintains read model

Read Model (for fast queries):
  Order 123:
    ├─ Status: Shipped
    ├─ Payment: Approved
    ├─ Stock: Reserved (5 units)
    ├─ Shipment: Created (trackingId: xyz)
    └─ Timeline: [OrderCreated → PaymentProcessed → StockReserved → ShipmentCreated]

Benefits:
  ├─ Complete audit trail
  ├─ Can replay events to rebuild state
  ├─ Easy to debug (see exact sequence)
  └─ Multiple read models (different subscribers optimize differently)
```

### Delivery Guarantees

```
At-Most-Once:
  ├─ Message sent once, may not be delivered
  ├─ Fast (no retries)
  ├─ Risk: Message loss
  └─ Example: User analytics, notifications

At-Least-Once:
  ├─ Message definitely delivered, may be duplicated
  ├─ Slower (retries until delivered)
  ├─ Risk: Duplicate processing
  ├─ Mitigation: Idempotent consumer
  └─ Example: Orders, payments

Exactly-Once:
  ├─ Message delivered exactly once, no loss/duplicates
  ├─ Slowest (uses distributed transactions)
  ├─ Most consistent
  └─ Example: Financial transactions, critical operations
```

### Ordering Guarantees

```
Total Order (All consumers see same order):
  Event 1: OrderCreated
  Event 2: PaymentProcessed
  Event 3: ShipmentCreated
  
  All subscribers see: 1 → 2 → 3
  
  Implementation: Single topic, single broker

Partial Order (Per-partition ordering):
  Partition 0: Order 1, 3, 5, 7
  Partition 1: Order 2, 4, 6, 8
  
  Within partition: Ordered
  Across partitions: No guarantee
  
  Implementation: Kafka (partition key = orderId)

No Order:
  Subscribers receive in any order
  
  Risk: Payment processed before order created!
  
  Implementation: Multiple independent topics
```

---

## Consistent Hashing

### Definition
Consistent hashing is a distributed hashing technique that minimizes rehashing when the number of nodes changes. It maps both data and nodes to a ring/circle, allowing data to remain in the same location even when nodes are added or removed.

### Problem It Solves

```
Traditional Hash Approach (Modulo):
  
  If we have 3 cache servers (A, B, C):
  hash(key) % 3 = server
  
  Examples:
    hash("user:123") % 3 = 0 → Server A
    hash("user:456") % 3 = 1 → Server B
    hash("user:789") % 3 = 2 → Server C
  
  Problem: If we add Server D:
    Now: 4 servers
    hash("user:123") % 4 = ? (different!)
    hash("user:456") % 4 = ? (different!)
    hash("user:789") % 4 = ? (different!)
    
    Result: ENTIRE CACHE INVALIDATED!
    └─ All keys need to be rehashed and moved
    └─ Cache thrashing, performance collapse
```

### Consistent Hashing Solution

```
Hash Ring Concept:

                     ┌─────────────┐
                  /                 \
                /    hash ring       \
               │                       │
               │     Nodes:           │
               │   A: hash=10        │
               │   B: hash=25        │
               │   C: hash=40        │
               │                       │
                \    Keys:           /
                 \   k1: hash=15    /
                  \   k2: hash=35  /
                   \               /
                     └─────────────┘
                
                     0          50

Placement Rule:
  Key walks clockwise on ring
  Until it finds a node
  That node stores the key

Example:
  Key k1 (hash=15):
    ├─ Walk clockwise from 15
    ├─ Find node A (hash=10)? No, before 15
    ├─ Find node B (hash=25)? Yes!
    └─ k1 stored on Server B
  
  Key k2 (hash=35):
    ├─ Walk clockwise from 35
    ├─ Find node C (hash=40)? Yes!
    └─ k2 stored on Server C
```

### Adding a Node

```
Original Ring:
  
  Nodes: A (hash=10), B (hash=25), C (hash=40)
  Keys: k1 (hash=15→B), k2 (hash=35→C), k3 (hash=5→A)

Add Node D (hash=30):

  Ring becomes:
    0          10     15  20  25  30  35  40  45  50
    ├───A───┤      ├─k1─B───┤    D   └─k2─C──┤
    
New placement:
  k1 (hash=15): 15 → B (no change) ✓
  k2 (hash=35): 35 → C (no change) ✓
  k3 (hash=5): 5 → A (no change) ✓
  
  New keys added after D:
  k4 (hash=27): 27 → D (moved from B!)
  k5 (hash=32): 32 → D (moved from C!)
  
Result:
  ├─ Only keys between C and D rehashed
  ├─ A and B unchanged (most keys unaffected)
  ├─ Cache hit rate remains high
  └─ Instead of 100% miss, only ~25% miss

Rehashing Rate:
  Keys rehashed = (1 / number_of_nodes)
  
  3 → 4 nodes: 1/4 = 25% keys rehashed
  10 → 11 nodes: 1/11 = 9% keys rehashed
  100 → 101 nodes: 1/101 = 1% keys rehashed
```

### Virtual Nodes (Replication)

```
Problem: Uneven Distribution

Physical Ring with 3 nodes:
  
  Node A at position 10
  Node B at position 25
  Node C at position 40
  
  Range responsibilities:
    40 ← A ← 10 (range of 30)
    10 ← B ← 25 (range of 15)
    25 ← C ← 40 (range of 15)
  
  Issue: A has twice as much data!
  
Solution: Virtual Nodes

  Node A creates 3 virtual replicas:
    A₁ at position 5
    A₂ at position 12
    A₃ at position 18
  
  Node B creates 3 virtual replicas:
    B₁ at position 28
    B₂ at position 32
    B₃ at position 35
  
  Node C creates 3 virtual replicas:
    C₁ at position 42
    C₂ at position 45
    C₃ at position 48
  
  Result: Even distribution!
  ├─ 9 virtual nodes spread around ring
  ├─ Each physical node responsible for ~33%
  └─ Adding nodes easier (spread more virtual nodes)
```

### Replication with Consistent Hashing

```
Key k with hash=20 on ring [0, 100]:

Finding replica nodes:
  ├─ Walk clockwise from k (20)
  ├─ Find node 1: Node B at 25 (first replica)
  ├─ Continue clockwise
  ├─ Find node 2: Node C at 40 (second replica)
  ├─ Continue clockwise
  └─ Find node 3: Node A at 10 (third replica, wrapped around)

Replication factor (N=3):
  k stored on: B, C, A
  
Read:
  ├─ Quorum read: Ask B and C
  ├─ Return data from majority
  └─ If B or C fails, read still works
  
Write:
  ├─ Quorum write: Write to B and C
  ├─ After 2 ACKs, consider success
  └─ A gets eventual consistency update
```

### Real-World Usage

```
Memcached/Redis Cluster:
  ├─ Consistent hashing determines which node stores key
  ├─ Add node: Only ~1/n keys rehashed
  └─ Client library uses consistent hashing

Cassandra/DynamoDB:
  ├─ Partition key hashed to ring position
  ├─ Replicated to N nodes clockwise
  └─ Consistent hashing ensures even distribution

Load Balancing:
  ├─ Request URL hashed
  ├─ Maps to backend server
  ├─ Same URL always goes to same server (session affinity)
  └─ Adding servers doesn't break all sessions
```

---

## Sharding

### Definition
Sharding is a horizontal partitioning technique that divides data across multiple independent databases or servers. Each shard holds a subset of data, allowing the system to scale beyond single-machine limits.

### Problem It Solves

```
Single Database Limitations:

Scenario: Social media with 1 billion users

Single Database:
  ├─ 1 billion user profiles
  ├─ Each profile: ~10KB
  ├─ Total storage: 10 trillion bytes = 10TB
  ├─ Read load: 1 million reads/second
  ├─ Write load: 100,000 writes/second
  
Database limits:
  ├─ Storage: Disk size (cannot scale infinitely)
  ├─ I/O: Read/write throughput limit
  ├─ CPU: Query processing limit
  ├─ RAM: Cache size limit
  
Result: Database becomes bottleneck!

With Sharding:

Shard 1 (Users A-E): 200 million users
  ├─ Storage: 2TB
  ├─ Read: 200k reads/sec
  └─ Write: 20k writes/sec

Shard 2 (Users F-K): 200 million users
  ├─ Storage: 2TB
  ├─ Read: 200k reads/sec
  └─ Write: 20k writes/sec

Shard 3 (Users L-Q): 200 million users
Shard 4 (Users R-Z): 200 million users
Shard 5 (Users AA-ZZ): 200 million users

Total:
  ├─ Storage: 2TB × 5 = 10TB (same!)
  ├─ But distributed
  ├─ Each shard: 200k read/sec (manageable)
  ├─ Each shard: 20k write/sec (manageable)
  └─ System scalable!
```

### Sharding Key Strategies

#### 1. Range-Based Sharding

```
Shard Key: User ID

Shard 1: User IDs 1-200 million
Shard 2: User IDs 200-400 million
Shard 3: User IDs 400-600 million
Shard 4: User IDs 600-800 million
Shard 5: User IDs 800-1000 million

Lookup:
  User ID 250 million
    ├─ Falls in range 200-400 million
    └─ Query Shard 2

Advantages:
  ├─ Easy to understand
  ├─ Range queries efficient
  ├─ No hash computation

Disadvantages:
  ├─ Uneven distribution (some ranges grow more)
  ├─ Hotspots (popular users cluster)
  └─ Hard to rebalance (moving ranges complex)
```

#### 2. Hash-Based Sharding

```
Shard Key: User ID

Shard assignment: hash(user_id) % num_shards

Example with 5 shards:
  hash(user_1) % 5 = 0 → Shard 1
  hash(user_2) % 5 = 3 → Shard 4
  hash(user_3) % 5 = 1 → Shard 2
  hash(user_4) % 5 = 2 → Shard 3
  hash(user_5) % 5 = 4 → Shard 5

Advantages:
  ├─ Even distribution (hash spreads uniformly)
  ├─ No hotspots
  ├─ Deterministic (same user always same shard)

Disadvantages:
  ├─ Adding shards: Requires rehashing all data!
  │  (number_of_shards changes, hash(x) % 5 ≠ hash(x) % 6)
  └─ Range queries inefficient (users scattered)

Solution: Use Consistent Hashing (covered above)
```

#### 3. Directory-Based Sharding

```
Shard Key: User ID

Lookup Table:
  user_id → shard_id
  
  1-1000: Shard 1
  1001-2000: Shard 2
  2001-3000: Shard 1 (rebalanced)
  3001-4000: Shard 3
  ...

Lookup:
  User 2500
    ├─ Check directory: 2001-3000 → Shard 1
    └─ Query Shard 1

Advantages:
  ├─ Flexible (can rebalance anytime)
  ├─ No hotspots (can move ranges around)
  ├─ Range queries possible

Disadvantages:
  ├─ Extra lookup (directory query)
  ├─ Directory is single point of failure
  ├─ Directory must be fast (frequent lookups)
```

### Multi-Level Sharding

```
Scenario: 1 trillion records, too many for single-level sharding

Level 1 Sharding (by region):
  ├─ Shard US: 400 billion records
  ├─ Shard EU: 300 billion records
  ├─ Shard APAC: 200 billion records
  └─ Shard LATAM: 100 billion records

Level 2 Sharding (within each region, by hash):
  
  Shard US:
    ├─ Shard US-0: hash(id) % 10 = 0
    ├─ Shard US-1: hash(id) % 10 = 1
    ├─ Shard US-2: hash(id) % 10 = 2
    └─ ...
    └─ Shard US-9: hash(id) % 10 = 9

  Each Shard US-X: ~40 billion records

Result:
  ├─ Geographic distribution (regional isolation)
  ├─ Each region can scale independently
  ├─ Each sub-shard manageable size
  └─ Look up path: Region → Sub-shard
```

### Shard Migration/Rebalancing

```
Scenario: Shard 1 is full, need to split

Before:
  Shard 1 (Users 1-500K): 500K users
  Shard 2 (Users 500K-1M): 500K users

Problem: Shard 1 full, Shard 2 has space

Rebalancing Process:
  
  1. Create Shard 3 (empty)
  
  2. Copy data:
     ├─ Identify users 250K-500K in Shard 1
     └─ Copy to Shard 3
  
  3. Update directory:
     ├─ Users 1-250K → Shard 1
     ├─ Users 250K-500K → Shard 3 (moved)
     └─ Users 500K-1M → Shard 2
  
  4. Dual-write phase:
     ├─ New writes to both Shard 1 and Shard 3
     ├─ Ensure consistency
     └─ Verify all data copied
  
  5. Cutover:
     ├─ Reads from Shard 3
     ├─ Verify correctness
     └─ Cleanup Shard 1
  
  6. Decommission:
     └─ Remove old data from Shard 1

Challenges:
  ├─ Data consistency during migration
  ├─ Downtime risk if not carefully managed
  ├─ Verification overhead
  └─ Rollback complexity
```

### Shard Strategies for Common Data

```
User Data:
  Shard Key: user_id (clear ownership)
  Strategy: Hash-based
  
Orders:
  Shard Key: user_id (orders belong to user)
  Strategy: Hash-based (consistent with users)
  ├─ Benefit: User's data in same shard
  ├─ Query: "User 123's orders" → One shard
  
Posts/Comments:
  Shard Key: user_id (creator's ID)
  Strategy: Hash-based
  
Payments:
  Shard Key: user_id (who paid)
  Strategy: Hash-based
  
Timeline/Feed:
  Shard Key: user_id (whose timeline)
  Strategy: Hash-based
  └─ Challenge: Feed aggregation (need data from multiple user shards)

Geospatial Data:
  Shard Key: geographic region
  Strategy: Range-based (latitude/longitude buckets)
  ├─ Geographic queries efficient
  └─ Geohash + hash-based
```

### Challenges & Tradeoffs

```
Cross-Shard Queries:
  
  Question: "Top 10 posts this hour?"
  
  Problem:
    ├─ Posts spread across all shards
    ├─ Can't query one shard
    └─ Must query all shards (expensive)
  
  Solution Options:
    ├─ Fanout: Query all shards, merge results
    │  (Slow, but correct)
    ├─ Denormalization: Maintain "Top Posts" separately
    │  (Fast, but eventual consistency)
    └─ Scatter-gather: Async parallel queries
       (Balance speed and correctness)

Transactions:
  
  Multi-shard transaction:
    ├─ User 1 on Shard A
    ├─ User 2 on Shard B
    ├─ Transfer money between them
    └─ Requires distributed transaction
  
  Problem:
    ├─ Two-phase commit expensive
    ├─ Coordination overhead
    └─ Failure modes complex
  
  Solution:
    └─ Use Saga pattern for consistency

Resharding:
  
  Problem:
    ├─ Initial shard count doesn't match long-term needs
    ├─ Uneven growth
    └─ Need to add/remove shards
  
  Cost:
    ├─ Expensive operation
    ├─ High coordination overhead
    └─ Risk of data loss if not careful
  
  Mitigation:
    └─ Design for flexibility from start
       (Use consistent hashing or directory-based)
```

---

## Replication Pattern

### Definition
Replication is the process of copying data across multiple nodes to ensure availability, durability, and fault tolerance. When one node fails, the data remains accessible on replica nodes, preventing data loss and service interruption.

### Problem It Solves

```
Single Node Database (No Replication):

┌──────────────┐
│  Database    │
│  All data    │
└──────────────┘
       ↓
   Hardware fails
       ↓
   Data LOST!
   Service DOWN!

Problems:
  ├─ Data loss (crash → no backup)
  ├─ Service downtime (can't serve requests)
  ├─ No redundancy (single point of failure)
  ├─ No load distribution (all queries to one node)
  └─ Recovery time long
```

### Replication Strategies

#### 1. Master-Slave (Primary-Replica) Replication

```
Architecture:

  ┌──────────────────┐
  │     MASTER       │
  │   (Primary)      │
  │                  │
  │  Accepts ALL     │
  │  reads & writes  │
  └────────┬─────────┘
           │
      ┌────┴────┬──────────┐
      │          │          │
      ↓          ↓          ↓
   SLAVE 1    SLAVE 2    SLAVE 3
  (Replica)  (Replica)  (Replica)
   
   Read-only   Read-only   Read-only
   
   ├─ Replicate from Master
   └─ Eventually consistent
```

**Write Flow:**
```
Client writes data
       ↓
   MASTER
   ├─ Accepts write
   ├─ Applies locally
   ├─ Returns ACK to client
   └─ Sends replication log to slaves
       ↓
   SLAVE 1, SLAVE 2, SLAVE 3
   ├─ Receive changes
   ├─ Apply locally
   ├─ Send ACK (may or may not)
   └─ Eventually consistent
```

**Read Flow:**
```
Client reads data
       ↓
   Option 1: Read from MASTER
   ├─ Always consistent
   ├─ Single node bottleneck
   └─ Higher latency (network to primary)
   
   Option 2: Read from SLAVE
   ├─ Potentially stale (lag in replication)
   ├─ Distributed load
   └─ Lower latency
   
   Option 3: Read from ANY
   ├─ Load balanced
   ├─ Risk of inconsistent reads
   └─ Best performance
```

**Advantages:**
```
✓ Simple to understand
✓ Easy to implement
✓ Backup created automatically
✓ Read scaling (slaves handle reads)
✓ No distributed writes
```

**Disadvantages:**
```
✗ Replication lag (slaves lag behind master)
✗ Stale reads possible (read from slave)
✗ Master failure: Manual failover (slave promotion)
✗ Single point of write (master only)
✗ Slaves can't handle writes during failover
```

#### 2. Multi-Master (Peer-to-Peer) Replication

```
Architecture:

   ┌────────────┐    ┌────────────┐    ┌────────────┐
   │  SERVER A  │    │  SERVER B  │    │  SERVER C  │
   │  (Master)  │◄──→│  (Master)  │◄──→│  (Master)  │
   │            │    │            │    │            │
   │ Can write  │    │ Can write  │    │ Can write  │
   └────────────┘    └────────────┘    └────────────┘
        ↓                  ↓                 ↓
    Replicates         Replicates       Replicates
    to B & C           to A & C         to A & B
```

**Write Flow:**
```
Client writes to SERVER A
       ↓
SERVER A
├─ Accepts write
├─ Applies locally
├─ Returns ACK
└─ Sends to B and C
       ↓
SERVER B & C
├─ Receive changes
├─ Apply locally
└─ Send to others (if not already seen)

Problem: Concurrent Writes!
  
  Client 1: Write "Value=10" to A
  Client 2: Write "Value=20" to B
  
  Both submitted at same time
    ↓
  A has: Value=10
  B has: Value=20
    ↓
  Conflict! Which is correct?
```

**Conflict Resolution:**
```
Strategy 1: Last-Write-Wins
  ├─ Timestamp on each write
  ├─ Later write wins
  ├─ Simple but data loss possible
  └─ Example: Value=20 wins (written at 10:00:01 vs 10:00:00)

Strategy 2: Version Vectors
  ├─ Track causality
  ├─ Detect concurrent writes
  ├─ Mark as conflict
  └─ Application decides merge

Strategy 3: Custom Application Logic
  ├─ Database stores both versions
  ├─ Application merges
  ├─ Example: Shopping cart, merge items
  └─ Maximum flexibility

Strategy 4: Voting/Quorum
  ├─ Majority decides correct value
  ├─ Requires consensus
  └─ Handles network partitions
```

**Advantages:**
```
✓ No single point of failure (all are masters)
✓ Write availability (write to any node)
✓ Better read/write distribution
✓ Automatic failover (any node can take over)
```

**Disadvantages:**
```
✗ Complex (conflict resolution needed)
✗ Network partition issues (split-brain)
✗ Consistency harder to guarantee
✗ Operational complexity
```

#### 3. Leaderless Replication

```
Architecture:

   ┌────────┐    ┌────────┐    ┌────────┐
   │ Node 1 │    │ Node 2 │    │ Node 3 │
   │        │◄──→│        │◄──→│        │
   │ Peer   │    │ Peer   │    │ Peer   │
   └────────┘    └────────┘    └────────┘
   
All nodes equal
No master/slaves
Everyone replicates to everyone
```

**Write Flow (Quorum Write):**
```
Client writes to any node
       ↓
Write to Node 1, Node 2, Node 3
  ├─ Node 1: ACK (written)
  ├─ Node 2: ACK (written)
  ├─ Node 3: ? (timeout/offline)
       ↓
Quorum met (2 out of 3)
Return success to client
       ↓
Node 3 eventually catches up
(eventual consistency)
```

**Read Flow (Quorum Read):**
```
Client reads from any node
       ↓
Read from Node 1, Node 2, Node 3
  ├─ Node 1: "Value=10" (version=5)
  ├─ Node 2: "Value=10" (version=5)
  ├─ Node 3: "Value=15" (version=3, stale)
       ↓
Majority voted (2 votes for Value=10)
Return Value=10
       ↓
Repair Node 3:
  └─ Write correct value (version=5)
  └─ "Read repair" process
```

**Advantages:**
```
✓ No single point of failure
✓ High availability
✓ Write to any node
✓ Read from any node
✓ Automatic peer repair
```

**Disadvantages:**
```
✗ Quorum overhead (contact multiple nodes)
✗ Complexity (version vectors, conflict resolution)
✗ Network partition issues
✗ Slower writes (wait for quorum)
```

### Replication Modes

#### Synchronous Replication

```
Master writes
  ├─ Apply locally
  ├─ Send to ALL slaves
  ├─ Wait for ACK from ALL slaves
  ├─ Return success to client
  │
  └─ Slave fails?
     └─ ENTIRE WRITE BLOCKED!

Timeline:
  T=0:00   Write request received
  T=0:01   Applied locally (master)
  T=0:02   Sent to Slave 1, 2, 3
  T=0:03   ACK from Slave 1 ✓
  T=0:04   ACK from Slave 2 ✓
  T=0:50   Slave 3 timeout ✗
  T=1:00   WRITE FAILS
  
  Impact: Slave 3 down → entire system unavailable!

Pros:
  ✓ Strong consistency
  ✓ All data replicated before returning

Cons:
  ✗ Availability suffers (slave failure blocks)
  ✗ Latency high (wait for all)
  ✗ Not practical for many replicas
```

#### Asynchronous Replication

```
Master writes
  ├─ Apply locally
  ├─ Return success to client (immediately!)
  │
  └─ Send to slaves in background
     ├─ Slave 1: Eventually receives ✓
     ├─ Slave 2: Eventually receives ✓
     └─ Slave 3: May or may not receive

Timeline:
  T=0:00   Write request received
  T=0:01   Applied locally (master)
  T=0:02   Return success to client ✓
  T=0:03   Background replication sent
  T=0:10   Slave 1 receives & applies
  T=0:15   Slave 2 receives & applies
  T=0:20   Slave 3 receives & applies

Pros:
  ✓ High availability
  ✓ Low latency (don't wait for replicas)
  ✓ Tolerates slave failures

Cons:
  ✗ Eventual consistency (lag between master/slaves)
  ✗ Stale reads possible (slave lag)
  ✗ Data loss risk (master crashes before replication)
```

#### Semi-Synchronous Replication

```
Master writes
  ├─ Apply locally
  ├─ Send to slaves
  ├─ Wait for ACK from SOME slaves (not all)
  ├─ Return success to client
  │
  └─ Continue replicating to others in background

Example: Wait for 1 out of 3 slaves

Timeline:
  T=0:00   Write request received
  T=0:01   Applied locally (master)
  T=0:02   Sent to Slave 1, 2, 3
  T=0:03   ACK from Slave 1 ✓
  T=0:04   Return success (don't wait for 2, 3)
           Background replication continues
  T=0:10   Slave 2 receives ✓
  T=0:20   Slave 3 receives ✓

Pros:
  ✓ Balanced consistency/availability
  ✓ Fast writes (don't wait for all)
  ✓ Some redundancy (multiple replicas ACK)

Cons:
  ✗ Some slaves may lag
  ✗ Stale reads from lagged slaves
  ✗ Complexity in configuration
```

### Replica Lag Issues

```
Problem: Master writes faster than slaves replicate

Timeline of Issues:

T=0:00   Client writes to Master: "Count = 0 → 1"
T=0:01   Master applies change ✓
T=0:02   Slave 1 receives ✓ (Count=1)
T=0:03   Client reads from Slave 1: Count=1 ✓ (consistent)

But with lag:

T=0:00   Client 1 writes to Master: "Count = 0 → 1"
T=0:01   Master applies change (Count=1) ✓
T=0:02   Client 2 reads from Slave 1: Count=0 ✗ (STALE!)
T=0:10   Slave 1 receives update (Count=1)
T=0:11   Client 2 reads again from Slave 1: Count=1 ✓

Problem: Read-after-write inconsistency!
```

**Solutions for Replica Lag:**

```
Solution 1: Read-After-Write Consistency
  ├─ Client read-after-write: Use MASTER
  ├─ Previous reads: Use slave (OK to be stale)
  └─ Example: Write profile → Read from master; View feed → Read from slave

Solution 2: Monotonic Reads
  ├─ Client always reads from same replica
  ├─ Prevents: Value going 1 → 0 → 1 (backward moves)
  └─ Example: Read from "Slave 1" only

Solution 3: Consistent Prefix Reads
  ├─ Reads respect causality
  ├─ Don't see effect before cause
  └─ Example: See reply before question

Solution 4: Wait for Synchronous Write
  ├─ Write to master: Wait for N replicas to ACK
  ├─ Reduces lag chance
  ├─ Trade-off: Higher write latency
  └─ Example: Semi-synchronous replication
```

### Replication Topologies

#### Linear Topology (Chain Replication)

```
Master → Slave1 → Slave2 → Slave3

Write Path:
  Client writes to Master
       ↓
  Master writes to Slave1
       ↓
  Slave1 writes to Slave2
       ↓
  Slave2 writes to Slave3

Read Path:
  Option 1: Read from Master (most consistent)
  Option 2: Read from Slave3 (latest replica, slight lag)

Advantages:
  ✓ Simple topology
  ✓ Clear replication path
  ✓ Easy to understand

Disadvantages:
  ✗ Replication lag increases (serial replication)
  ✗ Chain breaks at any point
  └─ If Slave1 fails → Slave2, 3 don't get updates
```

#### Star Topology (Hub-and-Spoke)

```
          Master
         /  |  \
        /   |   \
    Slave1 Slave2 Slave3

Write Path:
  Client writes to Master
       ↓
  Master writes to ALL slaves in parallel

Read Path:
  Read from any slave (load balanced)

Advantages:
  ✓ Parallel replication (faster lag reduction)
  ✓ Any slave failure doesn't block others
  ✓ Scalable (add slaves without affecting chain)

Disadvantages:
  ✗ Master is bottleneck (must replicate to all)
  ✗ Master failure: Manual intervention needed
```

#### Mesh Topology (Multi-Master)

```
  Master1 ←→ Master2
    ↓ ↘  ↙ ↓
  Slave  Slave

All masters replicate to all others (peer-to-peer)

Advantages:
  ✓ Highly available (no single point of failure)
  ✓ Write anywhere
  ✓ Automatic failover

Disadvantages:
  ✗ Complex conflict resolution
  ✗ Replication cycles possible
  ✗ Consistency harder to maintain
```

### Failure Scenarios

```
Scenario 1: Slave Failure (Star Topology)

Before:
  Master replicated to: Slave1, Slave2, Slave3

Slave2 crashes
  ├─ Master continues working
  ├─ Slave1 still getting updates
  ├─ Slave3 still getting updates
  ├─ Slave2 re-joins later
  └─ Catches up from Master (replay replication log)
  
  Impact: Minimal (no downtime)

Scenario 2: Master Failure (Star Topology)

Before:
  Master (has latest data)
  Replicated to: Slave1, Slave2, Slave3

Master crashes
  ├─ All slaves stop receiving updates
  ├─ Determine which slave is most up-to-date
  ├─ Promote one slave to Master
  ├─ Other slaves replicate from new Master
  └─ Recovery time: Minutes (manual decision + promotion)
  
  Challenges:
    ├─ How to decide which slave to promote?
    ├─ Unreplicated data on old master lost
    ├─ Clients need to know new master address
    └─ Inconsistency if old master comes back

Scenario 3: Network Partition

Before:
  Master ← Network → Slave1, Slave2, Slave3

Network splits:
  Side A: Master (isolated)
  Side B: Slave1, Slave2, Slave3 (grouped)

Action A (Master side):
  ├─ Can't reach any slave
  ├─ Stop accepting writes (prevent data loss)
  └─ Risk data loss if crashes

Action B (Slave side):
  ├─ Can't reach master
  ├─ Promote new leader from slaves
  ├─ Accept writes to new leader
  └─ Reconcile when partition heals

Problem: Split-brain!
  ├─ Both sides might accept writes
  └─ Conflict when they rejoin
  
Solution:
  ├─ Quorum approach (need majority)
  ├─ Master needs > N/2 slaves to see
  └─ Prevents both sides from becoming master
```

### Replication for Disaster Recovery

```
Local Replication (same datacenter):
  ├─ Fast replication (low latency)
  ├─ Protects from hardware failure
  ├─ Doesn't protect from datacenter failure
  └─ Example: 3 replicas same datacenter

Geographic Replication (multiple datacenters):
  ├─ Replicate to different regions
  ├─ Protects from datacenter destruction
  ├─ Higher latency (cross-region)
  ├─ Eventual consistency (lag high)
  └─ Example: Master in US, Replica in EU, Replica in APAC

Replication Strategy:
  T=0:00   Write to Primary (US)
  T=0:01   Write applied ✓
  T=0:02   Return ACK to client
  T=0:50   Replication to EU (50ms latency)
  T=1:00   Replication to APAC (100ms latency)
  
  If US datacenter destroyed:
    ├─ EU or APAC becomes primary
    ├─ Some very recent writes lost (last 1-50ms)
    └─ But system continues (disaster recovery success)
```

### When to Use Each Replication Type

```
Master-Slave:
  ✓ Simple architecture needed
  ✓ Read-heavy workloads
  ✓ Acceptable stale reads
  ✗ Manual failover acceptable
  └─ Example: Blog with many readers, few writers

Multi-Master:
  ✓ Write availability critical
  ✓ Geographic distribution needed
  ✓ Can handle conflict resolution complexity
  ✗ Eventual consistency acceptable
  └─ Example: Mobile apps (offline sync)

Leaderless:
  ✓ High availability critical
  ✓ Automated recovery needed
  ✓ No single point of failure acceptable complexity
  └─ Example: Cassandra, DynamoDB (large scale)
```

---

## Pattern Comparison Matrix

| Pattern | Problem | Scale | Consistency | Latency | Complexity |
|---------|---------|-------|-------------|---------|------------|
| **Saga** | Distributed transactions | ✅ High | Eventual | ⚠️ Medium | 🔴 High |
| **Quorum** | Consistency with replication | ✅ High | Tunable | ⚠️ Medium | 🟡 Medium |
| **Leader Election** | Single point of coordination | ✅ High | Strong | 🟡 Low-Medium | 🟡 Medium |
| **Retry + Backoff** | Transient failures | ✅ High | N/A | ⚠️ Medium | 🟢 Low |
| **Circuit Breaker** | Cascading failures | ✅ High | N/A | 🟢 Fast | 🟡 Medium |
| **PubSub** | Loose coupling | ✅ High | Eventual | 🟢 Fast | 🟡 Medium |
| **Consistent Hash** | Distribution scalability | ✅ Very High | N/A | 🟢 Fast | 🟡 Medium |
| **Sharding** | Data volume/throughput | ✅ Very High | Eventual | ⚠️ Medium | 🔴 Very High |

---

## Pattern Combinations

### Real-World Architecture Example: E-Commerce Platform

```
Order Processing System:

1. User Places Order
   └─ REST API → Order Service

2. Order Service
   └─ Publishes: "OrderCreated" (PubSub)

3. Event Subscribers:
   
   Payment Service:
   ├─ Subscribes to "OrderCreated"
   ├─ Calls Payment Gateway
   ├─ Uses Retry + Backoff for failures
   ├─ Uses Circuit Breaker for gateway failures
   └─ Publishes: "PaymentProcessed"
   
   Inventory Service:
   ├─ Subscribes to "PaymentProcessed"
   ├─ Queries inventory (Consistent Hashing for scalability)
   ├─ Reserves items
   └─ Publishes: "InventoryReserved"
   
   Shipping Service:
   ├─ Subscribes to "InventoryReserved"
   ├─ Creates shipping label
   └─ Publishes: "ShippingCreated"

4. If Failure (Saga Pattern):
   
   Payment Gateway fails after 3 retries
   ├─ Circuit breaker opens
   ├─ Compensation saga triggered
   ├─ Inventory reservation reversed
   ├─ Publishes: "OrderCancelled"
   └─ User notified

5. Data Storage:
   
   Orders Sharded by user_id
   ├─ Shard 1: Users A-E
   ├─ Shard 2: Users F-J
   ├─ Each shard replicated 3x
   └─ Quorum writes (2 out of 3)
   
   Read Model (separate database):
   ├─ Receives all events
   ├─ Maintains "Order Status" view
   ├─ Leader election for consistency
   └─ Used for customer queries

6. High Availability:

   Order Service instances:
   ├─ Instance A (Leader - elected via Raft)
   ├─ Instance B (Follower)
   └─ Instance C (Follower)
   
   If A fails:
   ├─ B and C detect failure
   ├─ New election (Raft)
   ├─ B becomes new leader
   └─ Orders continue processing
```

---

## Implementation Checklist

When implementing distributed patterns:

### Before Coding
- [ ] Understand business requirements (CAP trade-offs)
- [ ] Identify failure modes you can tolerate
- [ ] Define consistency requirements (strong vs eventual)
- [ ] Plan monitoring and observability
- [ ] Design for testing (chaos engineering)

### Architecture Design
- [ ] Choose appropriate patterns for each component
- [ ] Plan data partitioning (sharding strategy)
- [ ] Design replication factor
- [ ] Plan for failure scenarios
- [ ] Define SLAs and error budgets

### Implementation
- [ ] Implement idempotency everywhere
- [ ] Add comprehensive logging
- [ ] Implement monitoring for pattern health
- [ ] Test failure scenarios (kill services, partition network)
- [ ] Document assumptions and trade-offs

### Operations
- [ ] Plan for resharding/rebalancing
- [ ] Monitor pattern metrics (circuit breaker state, saga failures)
- [ ] Plan runbooks for common failures
- [ ] Train team on failure modes
- [ ] Regular chaos engineering exercises
