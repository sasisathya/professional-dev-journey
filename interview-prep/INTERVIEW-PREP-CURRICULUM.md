# 🎯 Interview Preparation Curriculum (3-4 Weeks)
**Target: Senior/Lead roles | Priority: System Design**
**Last Updated: 2026-09-02**

---

## 📋 Overview
- **Total Duration:** 21 days (intensive)
- **Daily Time Commitment:** 4-5 hours
- **Focus Areas:** System Design (60%), Node.js (20%), React (10%), DSA/Coding (10%)
- **Goal:** Clear system design interviews + solid backend/frontend understanding

---

## 🎓 PHASE 1: System Design Fundamentals (Days 1-7)

### Week 1 Focus: Core Concepts & Patterns

#### Day 1-2: Fundamentals
- [ ] **Scalability Basics**
  - Vertical vs Horizontal scaling
  - Load balancing strategies (Round Robin, Least Connections, IP Hash)
  - Caching patterns (Cache-aside, Write-through, Write-back)
  
- [ ] **Latency & Throughput**
  - Understanding network latency
  - Database query optimization
  - Connection pooling
  
- [ ] **Consistency Models**
  - Strong consistency vs Eventual consistency
  - CAP theorem (understand tradeoffs, not just definitions)
  - ACID vs BASE

**Exercise:** Draw a simple web app with 1M users — identify bottlenecks

---

#### Day 3-4: Databases Deep Dive
- [ ] **Relational (MySQL) vs Document (MongoDB)**
  - When to use each
  - Indexing strategies
  - Query optimization
  - Replication and failover
  
- [ ] **Database Scaling**
  - Sharding strategies (Range, Hash, Directory-based)
  - Read replicas
  - Write-ahead logs (WAL)
  
- [ ] **Transactions in Distributed Systems**
  - ACID guarantees at scale
  - 2-Phase Commit (2PC)
  - Saga pattern (long-running transactions)

**Exercise:** Design MongoDB sharding for 500K users. What's your shard key?

---

#### Day 5-6: Message Queues & Async Processing
- [ ] **Kafka Deep Dive** (You started here, now go deeper)
  - Producer/Consumer model
  - Partitions and replication
  - Consumer groups and offset management
  - At-least-once vs Exactly-once semantics
  
- [ ] **Idempotency & Deduplication**
  - Idempotency keys
  - Deduplication cache patterns
  - Redis as cache vs message queue
  
- [ ] **Message Queue Alternatives**
  - RabbitMQ vs Kafka vs AWS SQS
  - Use case selection

**Exercise:** Real-time notification system (the one we did earlier) — write the full flow

---

#### Day 7: Caching & In-Memory Stores
- [ ] **Redis Patterns**
  - Caching strategies
  - Distributed locks (Redlock algorithm)
  - Session management
  - Rate limiting with Redis
  - Deduplication cache (your homework!)
  
- [ ] **Cache Invalidation**
  - TTL-based
  - Event-based
  - LRU eviction

**Exercise:** Build a rate limiter using Redis (sliding window)

---

### ✅ Checkpoint 1 (End of Day 7)
**Validate Your Understanding:**
- [ ] Can you explain CAP theorem with a real example?
- [ ] What's the difference between at-least-once and exactly-once?
- [ ] Design a basic system: "Scale Twitter feed to 100M users"

---

## 🏗️ PHASE 2: Real System Design Patterns (Days 8-14)

### Week 2 Focus: End-to-End Architectures

#### Day 8-9: Notification Systems (Start with what you know)
- [ ] **Real-time Notification Architecture**
  - WebSocket server architecture
  - Kafka for event streaming
  - Redis for deduplication
  - Database for persistence
  
- [ ] **Failure Scenarios**
  - Server crash with in-flight messages
  - Kafka consumer lag
  - Redis key expiry edge cases
  - Database connection failures
  
- [ ] **Monitoring & Observability**
  - Metrics (latency, throughput, error rate)
  - Alerting strategies
  - Distributed tracing

**Build:** Full Node.js + Kafka + Redis notification system

---

#### Day 10-11: Feed/Timeline Systems (Instagram, Twitter)
- [ ] **Feed Generation**
  - Fanout-on-write vs Fanout-on-read
  - Materialized views
  - Caching strategies
  
- [ ] **Ranking & Personalization**
  - Relevance algorithms
  - A/B testing architecture
  
- [ ] **Real-time Updates**
  - WebSocket connections at scale
  - Batch vs real-time consistency

**Design:** Twitter feed for 100M users with 100K QPS

---

#### Day 12-13: Search & Analytics Systems
- [ ] **Search at Scale**
  - Elasticsearch/Solr basics
  - Inverted indexes
  - Full-text search
  
- [ ] **Analytics & Logging**
  - Log aggregation (ELK stack concept)
  - Time-series data
  - Analytics pipeline

**Design:** Log aggregation system for 10K servers

---

#### Day 14: Payment/Financial Systems (High reliability)
- [ ] **Transactions & Consistency**
  - Acid guarantees
  - Idempotency (critical for payments!)
  - Reconciliation
  
- [ ] **Failure Handling**
  - Partial failures
  - Retry strategies
  - Dead letter queues

**Design:** Payment processing system with 10K TPS

---

### ✅ Checkpoint 2 (End of Day 14)
**Do a mock interview:** Pick any of these systems and design it end-to-end in 45 minutes

---

## 💻 PHASE 3: Implementation Deep Dives (Days 15-18)

### Week 3 Focus: Node.js + React + MongoDB

#### Day 15: Node.js for System Design
- [ ] **Async/Await & Event Loop**
  - How Node handles concurrency
  - Promise chains vs async/await
  - Event emitters for pub/sub
  
- [ ] **Production Node.js Patterns**
  - Clustering
  - Worker threads
  - Connection pooling
  - Graceful shutdown
  
- [ ] **Real-time Communication**
  - Socket.io architecture
  - Redis adapter for multiple Node instances
  - Load balancing WebSockets

**Build:** Multi-instance WebSocket server with Redis pub/sub

---

#### Day 16: MongoDB for System Design
- [ ] **Data Modeling at Scale**
  - Document design
  - Embedding vs References
  - Index strategies
  
- [ ] **Replication & Sharding**
  - Replica sets
  - Shard key selection (critical!)
  - Hotspot prevention
  
- [ ] **Transactions in MongoDB**
  - Multi-document ACID transactions
  - When to use

**Design:** MongoDB schema for notification system (100M users)

---

#### Day 17: React for System Design Context
- [ ] **Real-time Features in Frontend**
  - WebSocket integration
  - Optimistic updates
  - Conflict resolution
  
- [ ] **State Management at Scale**
  - Redux/Context for real-time data
  - Caching patterns
  - Offline support

**Note:** React is 10% of prep — focus on architectural thinking, not implementation details

---

#### Day 18: Coding/DSA Integration
- [ ] **LeetCode Medium Problems** (1-2 per day)
  - Focus: Trees, Graphs, DP, Strings
  - Practice explaining your solution (important!)
  
- [ ] **System Design in Code**
  - Implement a simple rate limiter
  - Build a cache with LRU eviction
  - Design a task scheduler

---

### ✅ Checkpoint 3 (End of Day 18)
- [ ] Can you code a rate limiter from scratch?
- [ ] Can you explain MongoDB sharding strategy?
- [ ] Have you done 5 LeetCode problems this week?

---

## 🔥 PHASE 4: Interview Sprint (Days 19-21)

### Week 4 Focus: Mock Interviews & Final Prep

#### Day 19: Mock Interview 1
- **Topic:** Design Netflix (Video streaming at scale)
- **Duration:** 60 minutes
- **Evaluate:** Can you handle follow-up questions?

#### Day 20: Mock Interview 2
- **Topic:** Design Uber (Geo-spatial + Real-time)
- **Duration:** 60 minutes

#### Day 21: Mock Interview 3 + Final Review
- **Topic:** Design a system you choose
- **Final Review:** Weak areas, final questions

---

## 📚 Key Resources by Topic

### System Design
- **Books:** Designing Data-Intensive Applications (Kleppmann)
- **Videos:** ByteByteGo on YouTube
- **Blogs:** Martin Fowler, High Scalability

### Node.js
- **Docs:** Node.js official docs
- **Patterns:** Async patterns, clustering
- **Testing:** Jest, Mocha

### MongoDB
- **Docs:** MongoDB official university
- **Focus:** Sharding, indexing, replication

### Coding
- **LeetCode:** Medium difficulty, 1-2 per day
- **Focus Areas:** Trees, Graphs, DP, Strings

---

## 🎯 Daily Schedule Template

```
Morning (1.5 hours):
  - New concept learning (watch video + read article)
  - Take notes

Afternoon (2 hours):
  - Design 1 system (45 min thinking, 1h 15 min drawing/discussing)

Evening (1.5 hours):
  - Implement small code exercise OR
  - Review weak areas OR
  - LeetCode problem (1-2)

Night:
  - Review what you learned
  - Update progress below
```

---

## 📊 Progress Tracking

| Phase | Topic | Status | Notes |
|-------|-------|--------|-------|
| 1 | Fundamentals | ⬜ Not Started | |
| 1 | Databases | ⬜ Not Started | |
| 1 | Message Queues | ⬜ Not Started | |
| 1 | Caching | ⬜ Not Started | |
| 2 | Notifications | ⬜ Not Started | |
| 2 | Feed Systems | ⬜ Not Started | |
| 2 | Search/Analytics | ⬜ Not Started | |
| 2 | Payments | ⬜ Not Started | |
| 3 | Node.js | ⬜ Not Started | |
| 3 | MongoDB | ⬜ Not Started | |
| 3 | React | ⬜ Not Started | |
| 3 | Coding | ⬜ Not Started | |
| 4 | Mock Interviews | ⬜ Not Started | |

---

## 💡 Key Principles to Remember

1. **Understand the WHY** — not just tools
2. **Start simple, then scale** — design for 1 user, then 1M
3. **Tradeoffs matter** — consistency vs availability, cost vs performance
4. **Failure scenarios** — assume things will break
5. **Communication** — interviewers want to hear your thinking
6. **Ask clarifying questions** — don't assume requirements
7. **Draw diagrams** — system design is visual

---

## 🚀 Success Metrics

By Day 21, you should be able to:
- [ ] Design a system from scratch in 45 minutes
- [ ] Explain tradeoffs clearly (CAP, consistency, latency)
- [ ] Handle follow-up questions confidently
- [ ] Identify bottlenecks and propose solutions
- [ ] Implement code for key concepts
- [ ] Solve LeetCode medium problems
- [ ] Explain Node.js + MongoDB patterns

---

**Next Step:** Start Day 1 tomorrow. Let's update this document as you progress!
