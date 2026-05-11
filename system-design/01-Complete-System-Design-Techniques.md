# Complete System Design Techniques Guide

> **Purpose**: Comprehensive reference for system design concepts, patterns, and techniques for technical interviews and real-world architecture decisions.

## Table of Contents

1. [Core System Design Fundamentals](#1-core-system-design-fundamentals)
2. [Scalability Patterns and Techniques](#2-scalability-patterns-and-techniques)
3. [Database Design Strategies](#3-database-design-strategies)
4. [Caching Strategies](#4-caching-strategies)
5. [Distributed Systems Concepts](#5-distributed-systems-concepts)
6. [Communication Patterns and Protocols](#6-communication-patterns-and-protocols)
7. [Reliability and Fault Tolerance](#7-reliability-and-fault-tolerance)
8. [Security Best Practices](#8-security-best-practices)
9. [Additional System Design Techniques](#9-additional-system-design-techniques)
10. [Approaching System Design Interviews](#10-approaching-system-design-interviews)

---

## 1. Core System Design Fundamentals

### Requirements Gathering

#### Functional Requirements
What the system should do:
- User actions and features
- APIs and endpoints
- Input/output expectations
- Business logic requirements

#### Non-Functional Requirements
How the system should perform:
- **Scalability**: Handle growth (users, data, traffic)
- **Availability**: Uptime requirements (99.9%, 99.99%, 99.999%)
- **Latency**: Response time expectations (p50, p95, p99)
- **Consistency**: Data accuracy requirements
- **Durability**: Data persistence guarantees
- **Security**: Authentication, authorization, encryption

### Capacity Estimation

Key metrics to calculate:
- **Traffic estimates**: QPS (queries per second), daily active users
- **Storage estimates**: Data size per record × total records
- **Bandwidth estimates**: Request size × QPS
- **Memory estimates**: Cache requirements, in-memory data structures

#### Example Calculation

```
100M daily active users
Each user makes 10 requests/day = 1B requests/day
1B / 86,400 seconds ≈ 11,600 QPS average
Peak traffic (3x average) = ~35,000 QPS

Storage per user: 1KB metadata
100M users × 1KB = 100GB for user data
```

---

## 2. Scalability Patterns and Techniques

### Horizontal vs Vertical Scaling

#### Vertical Scaling (Scale Up)
Add more resources to existing machines
- **Pros**: Simple, no code changes
- **Cons**: Hardware limits, single point of failure

#### Horizontal Scaling (Scale Out)
Add more machines
- **Pros**: No upper limit, fault tolerance
- **Cons**: Complexity, data consistency challenges

### Load Balancing

#### Load Balancing Algorithms
- **Round Robin**: Distribute requests equally
- **Least Connections**: Send to server with fewest active connections
- **Least Response Time**: Send to fastest responding server
- **IP Hash**: Route same client to same server (session affinity)
- **Weighted Round Robin**: Distribute based on server capacity

#### Load Balancer Types
- **L4 (Transport Layer)**: Route based on IP/port (fast, no content inspection)
- **L7 (Application Layer)**: Route based on HTTP headers, cookies, URL paths

#### Popular Tools
- Nginx
- HAProxy
- AWS ELB/ALB
- Google Cloud Load Balancer

### Partitioning/Sharding

Split data across multiple databases:

#### Horizontal Partitioning (Sharding)
- **Hash-based**: `shard = hash(user_id) % num_shards`
- **Range-based**: Users A-M → Shard 1, N-Z → Shard 2
- **Geography-based**: US users → US shard, EU users → EU shard
- **Consistent Hashing**: Minimize data movement when adding/removing shards

#### Vertical Partitioning
Split tables by columns (normalize schema)

#### Challenges
- Joins across shards are expensive
- Transactions across shards are complex
- Rebalancing when adding shards

### Replication

#### Master-Slave (Primary-Replica)
- Writes go to master, reads from replicas
- Asynchronous replication (eventual consistency)
- **Use cases**: Read-heavy workloads

#### Master-Master (Multi-Master)
- Writes to any master
- Conflict resolution needed
- **Use cases**: Multi-region writes, high availability

#### Quorum-based
- N replicas, W write confirmations, R read confirmations
- Strong consistency if W + R > N

---

## 3. Database Design Strategies

### SQL vs NoSQL Decision Matrix

#### Use SQL (Relational) when:
- ACID transactions required
- Complex queries and joins needed
- Structured, well-defined schema
- **Examples**: PostgreSQL, MySQL, Oracle

#### Use NoSQL when:
- Massive scale (billions of records)
- Flexible schema needed
- High write throughput
- Specific data models:
  - **Key-Value**: Redis, DynamoDB (caching, sessions)
  - **Document**: MongoDB, CouchDB (JSON-like data)
  - **Column-Family**: Cassandra, HBase (time-series, analytics)
  - **Graph**: Neo4j, Amazon Neptune (relationships, social networks)

### Database Optimization Techniques

#### Indexing

**Index Types**:
- **B-Tree**: Default for most databases (range queries)
- **Hash Index**: Equality lookups only (very fast)
- **Bitmap Index**: Low cardinality columns (gender, status)
- **Full-Text Index**: Search text content
- **Composite Index**: Multiple columns together

**Trade-offs**:
- Faster reads, slower writes
- Storage overhead
- Index maintenance cost

#### Denormalization
- Store redundant data to avoid joins
- Trade-off: Storage and consistency for read performance
- **Example**: Store user name with each post instead of joining users table

#### Connection Pooling
- Reuse database connections
- Reduce connection overhead
- **Tools**: HikariCP, PgBouncer

#### Query Optimization
- Use EXPLAIN to analyze query plans
- Avoid SELECT *, fetch only needed columns
- Use prepared statements
- Batch operations when possible

### Data Modeling Patterns

#### Time-Series Data
- Partition by time (daily, monthly tables)
- Use column-family stores (Cassandra) or time-series DBs (InfluxDB, TimescaleDB)
- Downsample old data (1-min → 1-hour → 1-day granularity)

#### Event Sourcing
- Store all state changes as events
- Rebuild current state by replaying events
- Enables audit trails, temporal queries

#### CQRS (Command Query Responsibility Segregation)
- Separate write model from read model
- Optimize each independently
- Sync via events or materialized views

---

## 4. Caching Strategies

### Cache Levels

1. **Client-side**: Browser cache, mobile app cache
2. **CDN**: Static content (images, CSS, JS)
3. **Application-level**: In-memory cache (Redis, Memcached)
4. **Database-level**: Query cache, result cache

### Caching Patterns

#### Cache-Aside (Lazy Loading)

```
1. Check cache
2. If miss, fetch from DB
3. Write to cache
4. Return data
```

- **Pros**: Only cache requested data
- **Cons**: Cache miss penalty, stale data possible

#### Write-Through

```
1. Write to cache
2. Write to database synchronously
3. Return success
```

- **Pros**: Cache always fresh
- **Cons**: Write latency, unused data cached

#### Write-Behind (Write-Back)

```
1. Write to cache
2. Return success immediately
3. Async write to database later
```

- **Pros**: Low write latency
- **Cons**: Data loss risk if cache fails

#### Read-Through

```
Cache automatically loads from DB on miss
```

- **Pros**: Transparent to application
- **Cons**: Cache miss penalty

#### Refresh-Ahead

```
Proactively refresh cache before expiration
```

- **Pros**: No cache miss penalty
- **Cons**: Wasted resources if data not accessed

### Cache Eviction Policies

- **LRU (Least Recently Used)**: Evict oldest accessed item
- **LFU (Least Frequently Used)**: Evict least accessed item
- **FIFO**: Evict oldest inserted item
- **TTL (Time To Live)**: Expire after time period
- **Random**: Evict random item (simple, works well sometimes)

### Cache Invalidation Strategies

- **TTL-based**: Auto-expire after time
- **Event-based**: Invalidate on data updates
- **Version-based**: Add version to cache keys
- **Tag-based**: Group related cache entries, invalidate by tag

### Distributed Caching Considerations

- **Consistent Hashing**: Minimize cache misses when nodes added/removed
- **Replication**: Multiple copies for availability
- **Hot Key Problem**: Popular keys overload single cache node
  - **Solution**: Replicate hot keys, use local cache

---

## 5. Distributed Systems Concepts

### CAP Theorem

**You can only guarantee 2 of 3**:
- **Consistency**: All nodes see same data at same time
- **Availability**: Every request receives a response
- **Partition Tolerance**: System continues despite network partitions

#### Real-world choices
- **CP**: MongoDB, HBase, Redis (sacrifice availability during partitions)
- **AP**: Cassandra, DynamoDB, CouchDB (sacrifice consistency for availability)
- **CA**: Traditional RDBMS (not truly distributed)

### PACELC Theorem

Extension of CAP:
- **If Partition (P)**: Choose Availability (A) or Consistency (C)
- **Else (E)**: Choose Latency (L) or Consistency (C)

#### Examples
- DynamoDB: PA/EL (available during partition, low latency normally)
- MongoDB: PC/EC (consistent during partition, consistent normally)

### Consistency Models

#### Strong Consistency
- All reads return most recent write
- **Examples**: Relational databases, Zookeeper
- **Techniques**: Two-phase commit, Paxos, Raft

#### Eventual Consistency
- Eventually all replicas converge
- **Examples**: DNS, Cassandra (tunable)
- Faster but may serve stale data

#### Causal Consistency
- Related operations seen in order
- Unrelated operations can be out of order

#### Read-your-writes Consistency
- User always sees their own writes
- **Implementation**: Route user to same replica

### Distributed Transactions

#### Two-Phase Commit (2PC)

```
Phase 1: Coordinator asks all nodes "can you commit?"
Phase 2: If all yes, coordinator sends "commit", else "abort"
```

- **Pros**: Strong consistency
- **Cons**: Blocking, coordinator is single point of failure

#### Saga Pattern

```
Chain of local transactions
If one fails, execute compensating transactions
```

- **Pros**: No locking, higher availability
- **Cons**: Eventual consistency, complex rollback logic

#### Three-Phase Commit (3PC)
- Non-blocking version of 2PC
- Adds "prepare to commit" phase

### Consensus Algorithms

#### Paxos
- Achieves consensus among distributed nodes
- Complex but proven correct
- **Used in**: Google Chubby

#### Raft
- Easier to understand alternative to Paxos
- Leader election + log replication
- **Used in**: etcd, Consul, CockroachDB

**Key concepts**:
- Leader election
- Log replication
- Quorum-based decisions
- Term numbers to detect stale leaders

### Clock Synchronization

#### Challenges
- Distributed systems lack global clock
- Network delays are unpredictable

#### Solutions
- **NTP (Network Time Protocol)**: Sync with time servers (millisecond accuracy)
- **Logical Clocks (Lamport)**: Track event ordering, not actual time
- **Vector Clocks**: Detect concurrent events
- **TrueTime (Google Spanner)**: GPS + atomic clocks (microsecond accuracy)

---

## 6. Communication Patterns and Protocols

### Synchronous Communication

#### REST (RESTful APIs)
- Uses HTTP methods (GET, POST, PUT, DELETE)
- Stateless, resource-based URLs
- JSON/XML payloads
- **Pros**: Simple, widely supported, cacheable
- **Cons**: Over-fetching/under-fetching, multiple round trips

#### GraphQL
- Query language for APIs
- Client specifies exact data needed
- Single endpoint
- **Pros**: No over-fetching, fewer requests, strongly typed
- **Cons**: Complex caching, query complexity attacks

#### gRPC
- HTTP/2 + Protocol Buffers
- Binary protocol, streaming support
- Auto-generated client libraries
- **Pros**: Fast, efficient, bi-directional streaming
- **Cons**: Not browser-friendly, requires schema

### Asynchronous Communication

#### Message Queues
- **Point-to-Point**: One producer, one consumer
- **Publish-Subscribe**: One producer, multiple consumers
- **Tools**: RabbitMQ, AWS SQS, Azure Service Bus

**Benefits**:
- Decoupling: Services don't need to know about each other
- Load leveling: Smooth traffic spikes
- Reliability: Retry failed messages
- Asynchronous processing

#### Event Streaming
- **Apache Kafka**: Distributed log, high throughput, persistent
- **AWS Kinesis**: Managed streaming
- **Use cases**: Real-time analytics, event sourcing, CDC

#### Message Patterns
- **Fire and Forget**: Send message, don't wait for response
- **Request-Reply**: Async RPC via message queue
- **Competing Consumers**: Multiple workers process queue
- **Dead Letter Queue**: Store failed messages for analysis

### WebSockets
- Full-duplex communication over TCP
- Persistent connection
- **Use cases**: Real-time chat, live updates, gaming
- **Alternative**: Server-Sent Events (SSE) for one-way server push

### API Gateway Pattern
Single entry point for all clients

**Handles**:
- Routing
- Authentication/authorization
- Rate limiting
- Request/response transformation
- Caching
- Load balancing

**Tools**: Kong, AWS API Gateway, Azure API Management

### Service Mesh
Infrastructure layer for service-to-service communication

**Features**:
- Traffic management (load balancing, retries)
- Security (mTLS, authorization)
- Observability (metrics, tracing)

**Tools**: Istio, Linkerd, Consul Connect

---

## 7. Reliability and Fault Tolerance

### High Availability Patterns

#### Redundancy
- **Active-Active**: All nodes handle traffic
- **Active-Passive**: Standby nodes take over on failure
- **N+1**: N needed, +1 for redundancy
- **N+2**: More resilient, handles multiple failures

#### Health Checks
- **Liveness**: Is service running?
- **Readiness**: Can service handle traffic?
- Regular probes from load balancer
- Remove unhealthy instances from rotation

#### Failover Strategies
- **DNS Failover**: Switch DNS to backup (slow, TTL delays)
- **Load Balancer Failover**: Instant, automatic
- **Database Failover**: Promote replica to primary
- **Multi-region Failover**: Switch entire region

### Resilience Patterns

#### Circuit Breaker

```
States: Closed → Open → Half-Open
- Closed: Normal operation
- Open: Fast fail without calling service (after threshold failures)
- Half-Open: Test if service recovered
```

- Prevents cascading failures
- Gives failing service time to recover
- **Libraries**: Hystrix, Resilience4j, Polly

#### Retry Logic
- **Simple Retry**: Retry N times with delay
- **Exponential Backoff**: Increase delay exponentially (1s, 2s, 4s, 8s...)
- **Jitter**: Add randomness to prevent thundering herd
- **Idempotency**: Ensure retries don't cause duplicate operations

#### Bulkhead Pattern
- Isolate resources (threads, connections) per service
- Failure in one service doesn't consume all resources
- Like watertight compartments in a ship

#### Timeout Settings
- Set appropriate timeouts for all external calls
- Prevent hanging indefinitely
- Cascade timeouts through call chain

#### Rate Limiting
- **Token Bucket**: Refill tokens at rate, consume per request
- **Leaky Bucket**: Smooth out bursts
- **Fixed Window**: N requests per time window
- **Sliding Window**: More accurate than fixed window
- Protect from overload, DoS attacks

#### Throttling
- Slow down requests rather than reject
- Queue excess requests
- Prioritize important requests

### Disaster Recovery

#### Backup Strategies
- **Full Backup**: Complete copy (slow, large)
- **Incremental**: Only changes since last backup (fast, complex restore)
- **Differential**: Changes since last full backup (middle ground)

#### Recovery Metrics
- **RTO (Recovery Time Objective)**: How long can you be down?
- **RPO (Recovery Point Objective)**: How much data can you lose?

**Example**:
- RTO = 1 hour: Must restore within 1 hour
- RPO = 15 minutes: Can lose max 15 min of data
- Solution: 15-min backups + 1-hour restore process

#### Disaster Recovery Strategies
- **Backup and Restore**: Cheapest, slowest (RTO: hours/days)
- **Pilot Light**: Minimal always-on infrastructure (RTO: minutes/hours)
- **Warm Standby**: Scaled-down replica running (RTO: minutes)
- **Hot Standby/Multi-Site**: Full capacity active (RTO: seconds, most expensive)

### Chaos Engineering
- Intentionally inject failures to test resilience
- Netflix Simian Army: Chaos Monkey (kill instances), Chaos Gorilla (kill zones)
- Test in production with monitoring
- Validate assumptions about system behavior

---

## 8. Security Best Practices

### Authentication & Authorization

#### Authentication (Who are you?)

**Session-based**:
- Server stores session, cookie with session ID
- **Pros**: Server control, revocable
- **Cons**: Server memory, sticky sessions in distributed systems

**Token-based (JWT)**:
- Stateless tokens
- **Pros**: Scalable, works across domains
- **Cons**: Can't revoke easily, token size

**OAuth 2.0**:
- Delegated authorization
- **Flows**: Authorization Code, Client Credentials, Implicit, PKCE

**SSO (Single Sign-On)**:
- Login once, access multiple systems
- **Protocols**: SAML, OpenID Connect

**MFA (Multi-Factor Authentication)**:
- Something you know + have + are

#### Authorization (What can you do?)

- **RBAC (Role-Based)**: Users → Roles → Permissions
- **ABAC (Attribute-Based)**: Rules based on attributes (user, resource, environment)
- **ACL (Access Control Lists)**: Per-resource permissions

### Data Security

#### Encryption

**At Rest**: Encrypt stored data (databases, files)
- AES-256, Transparent Data Encryption (TDE)

**In Transit**: Encrypt network communication
- TLS 1.3, HTTPS

**End-to-End**: Only sender/receiver can decrypt
- Signal protocol, PGP

#### Key Management
- Use dedicated key management services (AWS KMS, Azure Key Vault)
- Rotate keys regularly
- Never hardcode keys in code
- Use HSM (Hardware Security Module) for sensitive keys

#### Data Masking
- Hide sensitive data in logs/displays
- PII (Personally Identifiable Information) protection
- Tokenization for credit cards

### API Security

- **Rate Limiting**: Prevent abuse, DoS
- **Input Validation**: Sanitize all inputs
- **Output Encoding**: Prevent XSS
- **CORS**: Control cross-origin requests
- **API Keys**: Identify and authenticate clients
- **Webhook Signature Verification**: Verify webhook authenticity

### Common Vulnerabilities (OWASP Top 10)

1. **Broken Access Control**: Enforce authorization checks
2. **Cryptographic Failures**: Use strong encryption
3. **Injection** (SQL, NoSQL, Command): Use parameterized queries, ORM
4. **Insecure Design**: Security by design, threat modeling
5. **Security Misconfiguration**: Harden defaults, remove unnecessary features
6. **Vulnerable Components**: Keep dependencies updated
7. **Authentication Failures**: Strong passwords, MFA, session management
8. **Data Integrity Failures**: Verify software updates, serialize safely
9. **Logging Failures**: Log security events, monitor
10. **SSRF**: Validate and sanitize URLs

### Network Security

- **Firewalls**: Control traffic between networks
- **WAF (Web Application Firewall)**: Protect against web attacks
- **VPC (Virtual Private Cloud)**: Isolated network
- **Security Groups**: Instance-level firewall rules
- **Network Segmentation**: Separate networks by security level
- **Zero Trust**: Verify every request, never trust implicitly

### Monitoring & Incident Response

#### Security Monitoring
- SIEM (Security Information and Event Management)
- Intrusion Detection Systems (IDS)
- Anomaly detection

#### Logging
- Log all security events
- Centralized logging
- Log retention policies
- Don't log sensitive data (passwords, credit cards)

#### Incident Response Plan
1. Preparation
2. Detection & Analysis
3. Containment, Eradication, Recovery
4. Post-Incident Review

---

## 9. Additional System Design Techniques

### Microservices Architecture

#### Principles
- Single responsibility per service
- Independently deployable
- Decentralized data management
- Technology diversity allowed

#### Challenges
- Distributed system complexity
- Data consistency across services
- Service discovery
- Network latency
- Debugging and monitoring

#### Patterns
- **API Gateway**: Single entry point
- **Service Discovery**: Eureka, Consul, etcd
- **Configuration Management**: Centralized config (Spring Cloud Config)
- **Distributed Tracing**: Trace requests across services (Jaeger, Zipkin)

### Observability

#### Three Pillars

**1. Metrics** (What's happening?)
- System metrics: CPU, memory, disk, network
- Application metrics: Request rate, error rate, latency
- Business metrics: Orders/sec, revenue
- **Tools**: Prometheus, Grafana, CloudWatch

**2. Logs** (What happened?)
- Structured logging (JSON)
- Correlation IDs to trace requests
- Centralized logging (ELK stack, Splunk)
- Log levels: DEBUG, INFO, WARN, ERROR

**3. Traces** (Where's the bottleneck?)
- Distributed tracing
- Visualize request flow
- Identify slow services
- **Tools**: Jaeger, Zipkin, AWS X-Ray

#### SLIs, SLOs, SLAs
- **SLI (Service Level Indicator)**: Metric (e.g., 99.9% requests < 200ms)
- **SLO (Service Level Objective)**: Target (e.g., 99.95% uptime)
- **SLA (Service Level Agreement)**: Contract with penalty (e.g., 99.9% uptime or refund)

### Content Delivery

#### CDN (Content Delivery Network)
- Distribute static content globally
- Edge locations close to users
- Reduce latency and origin load
- **Providers**: CloudFront, Cloudflare, Akamai

#### Strategies
- **Push CDN**: Upload content to CDN manually
- **Pull CDN**: CDN fetches from origin on first request
- Cache static assets (images, CSS, JS, videos)
- Use cache headers (Cache-Control, ETag)

### Data Storage Patterns

#### Object Storage
- Store unstructured data (images, videos, backups)
- **Examples**: S3, Google Cloud Storage, Azure Blob
- Highly durable (99.999999999% - 11 nines)

#### Blob Storage vs Block Storage
- **Blob**: Large files, accessed as whole
- **Block**: Virtual disks, random access

#### Data Lakes
- Store raw data in native format
- Schema on read
- **Use cases**: Big data analytics, ML training

#### Data Warehouses
- Structured, optimized for analytics
- Schema on write
- **Examples**: Snowflake, Redshift, BigQuery

### Search and Indexing

#### Full-Text Search
- **Elasticsearch**: Distributed search engine
- **Solr**: Apache Lucene-based
- **Algolia**: Managed, fast

#### Techniques
- **Inverted index**: Word → documents containing it
- **Tokenization**: Break text into words
- **Stemming**: "running" → "run"
- **TF-IDF**: Rank document relevance
- **Fuzzy matching**: Handle typos

### Queuing and Background Jobs

#### Use Cases
- Email sending
- Image processing
- Report generation
- Data ETL

#### Patterns
- **Job Queue**: Redis Queue, Celery, Sidekiq
- **Scheduled Jobs**: Cron, Quartz
- **Workflow Orchestration**: Airflow, Temporal, Cadence

#### Considerations
- Idempotency: Safe to retry
- Dead letter queues: Handle failures
- Priority queues: Critical jobs first
- Job monitoring: Track progress and failures

### Design Patterns Summary

#### Scalability
- Load balancing
- Horizontal scaling
- Caching
- Database sharding/replication
- CDN

#### Reliability
- Redundancy
- Health checks
- Circuit breakers
- Retries with exponential backoff
- Bulkhead isolation
- Rate limiting

#### Performance
- Caching at multiple levels
- Database indexing
- Asynchronous processing
- Connection pooling
- Compression

#### Security
- Authentication & authorization
- Encryption (at rest, in transit)
- Input validation
- Rate limiting
- Security monitoring

---

## 10. Approaching System Design Interviews

### Framework for Design Questions

#### 1. Clarify Requirements (5-10 min)
- **Functional**: What features are needed?
- **Non-functional**: Scale, latency, consistency requirements
- **Users**: How many? Geographic distribution?
- **Traffic**: Read/write ratio? Peak vs average?

#### 2. Capacity Estimation (5 min)
- QPS, storage, bandwidth calculations
- Identify bottlenecks

#### 3. High-Level Design (10-15 min)
- Draw architecture diagram
- Major components (clients, load balancers, app servers, databases, caches)
- Data flow

#### 4. Deep Dive (15-20 min)
- API design
- Database schema
- Scaling strategy
- Handle edge cases
- Discuss trade-offs

#### 5. Wrap-Up (5 min)
- Identify bottlenecks
- Monitoring and alerting
- Future improvements

### Common Design Questions

- URL shortener
- Twitter/social media feed
- Rate limiter
- Web crawler
- Video streaming (YouTube)
- Messenger/chat system
- File storage (Dropbox)
- Notification system
- E-commerce platform
- Ride-sharing (Uber)
- Search autocomplete
- News feed ranking

---

## Learning Path

To master system design concepts:

1. **Practice**: Design real systems (Twitter, Netflix, Uber)
2. **Read**: Study real-world architectures (engineering blogs)
3. **Build**: Implement systems hands-on
4. **Iterate**: Learn from failures, optimize continuously

## Additional Resources

- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [Designing Data-Intensive Applications](https://dataintensive.net/) by Martin Kleppmann
- Engineering blogs: Netflix, Uber, LinkedIn, Airbnb
- [High Scalability](http://highscalability.com/)

---

**Last Updated**: May 2026
**Status**: Living document - will be updated with new patterns and examples
