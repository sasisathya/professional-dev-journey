# System Design - Professional Interview Guide

## Table of Contents
1. [System Design Fundamentals](#system-design-fundamentals)
2. [Scalability](#scalability)
3. [Database Design](#database-design)
4. [Caching](#caching)
5. [Load Balancing & CDN](#load-balancing--cdn)
6. [Microservices Architecture](#microservices-architecture)
7. [Common System Designs](#common-system-designs)
8. [Design Approach](#design-approach)

---

## System Design Fundamentals

### What is System Design?
**Definition:** Designing large-scale distributed systems that are scalable, reliable, and maintainable.

**Key aspects:**
- **Scalability:** Handle growing load
- **Reliability:** Function correctly under failures
- **Availability:** Uptime percentage
- **Performance:** Low latency, high throughput
- **Maintainability:** Easy to modify/extend

**Key takeaway:** Design for scale, reliability, performance, maintainability.

---

### CAP Theorem
**Definition:** In distributed systems, you can only guarantee 2 of 3:

**C - Consistency:** All nodes see same data at same time
**A - Availability:** Every request gets response (success/failure)
**P - Partition Tolerance:** System works despite network partitions

**Trade-offs:**
- **CP:** Consistent but may not respond (MongoDB, HBase)
- **AP:** Always respond but may serve stale data (Cassandra, DynamoDB)
- **CA:** Not partition tolerant (not realistic for distributed systems)

**Real-world:** Usually AP or CP. Partition tolerance required in distributed systems.

**Key takeaway:** Can't have all three. Choose consistency or availability during partitions.

---

### Consistency Models
**Strong Consistency:** Read always returns latest write (slower)
**Eventual Consistency:** Reads may return stale data temporarily (faster)
**Read-after-write Consistency:** User sees their own writes immediately

**Key takeaway:** Strong = always latest, Eventual = eventually latest.

---

## Scalability

### Vertical vs Horizontal Scaling
**Vertical (Scale Up):**
- Add more CPU/RAM to single machine
- Pros: Simple, no code changes
- Cons: Limited by hardware, single point of failure

**Horizontal (Scale Out):**
- Add more machines
- Pros: Unlimited scaling, fault tolerance
- Cons: Complex (data distribution, coordination)

**Key takeaway:** Vertical = bigger machine, Horizontal = more machines.

---

### Load Balancing
**Definition:** Distribute traffic across multiple servers.

**Algorithms:**
- **Round Robin:** Rotate servers
- **Least Connections:** Send to server with fewest connections
- **IP Hash:** Same client → same server (sticky sessions)
- **Weighted:** Distribute based on server capacity

**Layers:**
- **Layer 4 (Transport):** TCP/UDP load balancing
- **Layer 7 (Application):** HTTP-based routing (URL, headers)

**Health Checks:** Ping servers, remove unhealthy ones.

**Key takeaway:** Distribute load. Round robin, least connections. Layer 4/7.

---

### Stateless vs Stateful Services
**Stateless:**
- No session data stored on server
- Any server can handle any request
- Horizontal scaling easy
- Session data in cache/database

**Stateful:**
- Session data on server
- Client tied to specific server (sticky sessions)
- Harder to scale

**Best practice:** Design stateless services. Store session in Redis/database.

**Key takeaway:** Stateless = easy scaling. Use external session storage.

---

## Database Design

### SQL vs NoSQL
**SQL (Relational):**
- Fixed schema (tables, rows, columns)
- ACID transactions
- JOINs
- Vertical scaling primarily
- Examples: MySQL, PostgreSQL

**NoSQL:**
- Flexible schema (documents, key-value, columnar, graph)
- BASE (Eventually consistent)
- No JOINs (denormalize)
- Horizontal scaling
- Examples: MongoDB, Cassandra, DynamoDB, Redis

**When to use SQL:**
- Complex queries with JOINs
- ACID transactions required
- Structured data

**When to use NoSQL:**
- Massive scale
- Unstructured/semi-structured data
- High write throughput
- Flexible schema

**Key takeaway:** SQL = ACID + JOINs, NoSQL = scale + flexible schema.

---

### Database Replication
**Definition:** Copy data across multiple databases.

**Master-Slave (Primary-Replica):**
- Master: Writes
- Slaves: Reads (replicate from master)
- Pros: Scale reads
- Cons: Single master bottleneck, replication lag

**Master-Master (Multi-Master):**
- Multiple masters accept writes
- Pros: High availability, load distribution
- Cons: Conflict resolution complex

**Key takeaway:** Replication = scale reads. Master-slave common.

---

### Database Sharding
**Definition:** Partition data across multiple databases (horizontal partitioning).

**Sharding strategies:**
1. **Range-based:** User IDs 1-1M → Shard 1, 1M-2M → Shard 2
   - Pros: Simple
   - Cons: Uneven distribution (hotspots)

2. **Hash-based:** hash(user_id) % num_shards
   - Pros: Even distribution
   - Cons: Hard to add shards (rehashing)

3. **Geo-based:** US users → US shard, EU users → EU shard
   - Pros: Low latency
   - Cons: Uneven if users concentrated

**Challenges:**
- Joins across shards expensive
- Resharding complex

**Key takeaway:** Partition data. Hash = even distribution.

---

### Database Indexing
**Definition:** Data structure to speed up queries.

**Types:**
- **Primary Index:** On primary key
- **Secondary Index:** On non-key column
- **Composite Index:** Multiple columns

**Trade-off:** Faster reads, slower writes (index must update).

**Best practice:** Index frequently queried columns. Don't over-index.

**Key takeaway:** Index = fast reads. Trade-off: write performance.

---

## Caching

### What is Caching?
**Definition:** Store frequently accessed data in fast storage (memory).

**Benefits:**
- Reduce database load
- Lower latency
- Handle traffic spikes

**Layers:**
- **Browser cache:** Static assets (images, CSS, JS)
- **CDN cache:** Edge locations
- **Application cache:** Redis, Memcached
- **Database cache:** Query results

**Key takeaway:** Cache = fast access. Reduces database load.

---

### Cache Strategies
**1. Cache-Aside (Lazy Loading):**
- Read: Check cache → if miss, read DB → populate cache
- Write: Update DB, invalidate cache
- Pros: Only cache what's needed
- Cons: Cache miss penalty

**2. Write-Through:**
- Write: Update cache + DB synchronously
- Pros: Cache always fresh
- Cons: Slower writes

**3. Write-Behind (Write-Back):**
- Write: Update cache immediately, update DB asynchronously
- Pros: Fast writes
- Cons: Data loss risk

**4. Read-Through:**
- Cache automatically loads from DB on miss
- Pros: Transparent to application
- Cons: Initial miss penalty

**Key takeaway:** Cache-aside = lazy. Write-through = sync. Write-behind = async.

---

### Cache Eviction Policies
**LRU (Least Recently Used):** Evict least recently accessed
**LFU (Least Frequently Used):** Evict least frequently accessed
**FIFO (First In First Out):** Evict oldest
**TTL (Time To Live):** Expire after time

**Most common:** LRU (Redis default)

**Key takeaway:** LRU = least recently used. Most common.

---

### Cache Consistency
**Problem:** Cache and database out of sync.

**Solutions:**
1. **TTL:** Expire cache after time
2. **Cache invalidation:** Delete/update cache on DB write
3. **Event-driven:** Publish events on DB changes, listeners update cache

**Two hard problems in CS:** Naming things, cache invalidation, off-by-one errors.

**Key takeaway:** Invalidate on writes. Use TTL as safety net.

---

## Load Balancing & CDN

### Load Balancer Types
**Hardware Load Balancers:** F5, Citrix (expensive, high performance)
**Software Load Balancers:** HAProxy, Nginx (flexible, cost-effective)
**Cloud Load Balancers:** AWS ELB, GCP Load Balancer (managed)

**Key takeaway:** Software = flexible, Cloud = managed.

---

### CDN (Content Delivery Network)
**Definition:** Geographically distributed servers caching content.

**How it works:**
1. User requests static asset (image, video)
2. CDN edge location serves cached content (low latency)
3. If cache miss, fetch from origin server, cache, serve

**Benefits:**
- Low latency (serve from nearest edge)
- Reduce origin server load
- Handle DDoS (distribute traffic)

**Use cases:** Static assets, streaming video, API responses

**Popular:** CloudFront (AWS), Cloud CDN (GCP), Cloudflare, Akamai

**Key takeaway:** CDN = cache at edge. Low latency, reduce origin load.

---

## Microservices Architecture

### Monolith vs Microservices
**Monolith:**
- Single codebase, all features in one app
- Pros: Simple deployment, easy debugging
- Cons: Hard to scale specific features, long deployments

**Microservices:**
- Multiple small services, each with specific business capability
- Pros: Independent scaling/deployment, team autonomy
- Cons: Complexity (networking, monitoring), distributed debugging

**Key takeaway:** Monolith = simple. Microservices = scalable, complex.

---

### Service Communication
**Synchronous (RESTful APIs, gRPC):**
- Direct request-response
- Pros: Simple, immediate response
- Cons: Service dependency, cascading failures

**Asynchronous (Message Queues):**
- Publish messages to queue (RabbitMQ, Kafka)
- Pros: Loose coupling, resilient to failures
- Cons: Eventual consistency, complex debugging

**Key takeaway:** Sync = simple, tight coupling. Async = resilient, complex.

---

### API Gateway
**Definition:** Single entry point for all microservices.

**Responsibilities:**
- Routing requests to services
- Authentication/authorization
- Rate limiting
- Load balancing
- Request/response transformation
- Caching

**Examples:** AWS API Gateway, Kong, Apigee

**Key takeaway:** Single entry point. Routing, auth, rate limiting.

---

### Service Discovery
**Definition:** Dynamically locate services in network.

**Approaches:**
1. **Client-side discovery:** Client queries service registry (Eureka, Consul)
2. **Server-side discovery:** Load balancer queries registry

**Key takeaway:** Dynamic service location. Eureka, Consul.

---

### Circuit Breaker
**Definition:** Prevent cascading failures. Stop calling failing service.

**States:**
- **Closed:** Normal, allow requests
- **Open:** Service failing, reject requests immediately (return fallback)
- **Half-Open:** Test if service recovered

**Libraries:** Netflix Hystrix (deprecated), Resilience4j

**Key takeaway:** Fail fast. Prevent cascade. States: Closed → Open → Half-Open.

---

## Common System Designs

### URL Shortener (bit.ly)
**Requirements:**
- Shorten URL
- Redirect to original URL
- Custom aliases (optional)
- Analytics (click count)

**Design:**
1. **Generate short code:** Base62 encoding of auto-increment ID or hash
2. **Store mapping:** Database (shortCode → originalURL)
3. **Redirect:** Lookup shortCode, return 301/302 redirect

**Scale:**
- Cache: Redis for hot URLs
- Database: Sharded by shortCode hash
- Read-heavy: Replicas for reads

**Key takeaway:** Base62 encoding. Redis cache. Read-heavy.

---

### Design Twitter
**Requirements:**
- Post tweets (140 chars)
- Follow users
- Timeline (tweets from followed users)
- Trending topics

**Design:**
1. **Post tweet:** Write to database (user_id, tweet_text, timestamp)
2. **Timeline:**
   - **Pull model (read-time):** Query tweets from followed users (slow for celebrities)
   - **Push model (write-time):** Pre-compute timelines on tweet post (fast reads, slow writes)
   - **Hybrid:** Push for normal users, pull for celebrities

3. **Trending:** Count hashtags in time window (stream processing, Kafka)

**Scale:**
- Cache: Redis for timelines
- Database: Sharded by user_id
- Search: Elasticsearch

**Key takeaway:** Fan-out (push model). Redis cache. Sharding.

---

### Design Uber
**Requirements:**
- Drivers update location
- Riders request ride
- Match rider with nearby driver
- Real-time tracking

**Design:**
1. **Location updates:** Drivers send GPS every few seconds → WebSocket or long polling
2. **Store locations:** In-memory (Redis) + database
3. **Geo-indexing:** Quadtree or geohash for nearby drivers
4. **Matching:** Find drivers within radius, assign closest
5. **Tracking:** WebSocket for real-time updates

**Scale:**
- **Location service:** Sharded by geo-region
- **Matching service:** Use geohash for efficient spatial queries

**Key takeaway:** Geo-indexing (quadtree/geohash). WebSocket. Real-time.

---

### Design Netflix
**Requirements:**
- Upload videos
- Stream videos
- Recommendations

**Design:**
1. **Upload:** Transcode to multiple formats/qualities
2. **Storage:** S3 for videos, metadata in database
3. **Streaming:** CDN (CloudFront) for low latency
4. **Recommendations:** Machine learning (collaborative filtering)

**Scale:**
- CDN for global distribution
- Adaptive bitrate streaming (quality based on bandwidth)

**Key takeaway:** CDN. Transcode. Adaptive streaming.

---

## Design Approach

### Step-by-Step Approach
**1. Clarify requirements (5 min):**
- Functional: What features?
- Non-functional: Scale? Latency? Consistency?
- Users? Read/write ratio?

**2. Estimate scale (5 min):**
- Traffic: QPS (queries per second)
- Storage: GB/TB per day
- Bandwidth: MB/s

**3. High-level design (10 min):**
- Draw boxes: Client → Load Balancer → Servers → Database
- Identify components (cache, queue, CDN)

**4. Deep dive (15 min):**
- Database schema
- API design
- Scale bottlenecks (sharding, replication)

**5. Identify bottlenecks (5 min):**
- Single points of failure
- How to handle failures

**Key takeaway:** Clarify → Estimate → High-level → Deep dive → Bottlenecks.

---

### Back-of-Envelope Calculations
**Powers of 2:**
- 1 KB = 1,000 bytes
- 1 MB = 1,000 KB = 1M bytes
- 1 GB = 1,000 MB = 1B bytes
- 1 TB = 1,000 GB = 1T bytes

**Latency:**
- Memory: 100 ns
- SSD: 100 μs
- Network (same datacenter): 500 μs
- Disk: 10 ms
- Network (cross-continent): 150 ms

**Example:** 1 billion users, 10% daily active, 5 posts/day
- Daily posts: 100M * 5 = 500M
- QPS: 500M / 86400 = ~6K
- Peak QPS: 6K * 3 = 18K (assume 3x peak)

**Key takeaway:** Estimate users, QPS, storage. Use powers of 10.

---

### Common Trade-offs
**Consistency vs Availability:** CAP theorem
**Latency vs Throughput:** Batch processing (high throughput, high latency) vs real-time
**SQL vs NoSQL:** ACID vs scale
**Normalization vs Denormalization:** Reduce redundancy vs fast reads
**Vertical vs Horizontal Scaling:** Simple vs unlimited scale
**Caching:** Speed vs stale data
**Synchronous vs Asynchronous:** Simple vs resilient

**Key takeaway:** No perfect solution. Trade-offs based on requirements.

---

## Interview Tips

1. **Ask questions:** "What's the expected traffic? Read/write ratio? Latency requirements?"
2. **Think aloud:** "I'll use cache here to reduce database load."
3. **Start simple:** "Let's start with monolith, then discuss scaling."
4. **Draw diagrams:** Visual representation of architecture.
5. **Discuss trade-offs:** "SQL for consistency, NoSQL for scale."
6. **Real-world examples:** "Similar to Twitter's fan-out architecture."

**Key concepts:** Scalability, caching, load balancing, sharding, replication, CAP theorem

---

**Updated:** 2026-06-28 | **Level:** Intermediate-Advanced | **Format:** Interview-ready definitions
