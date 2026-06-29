# Redis - Professional Interview Guide

## Table of Contents
1. [Redis Fundamentals](#redis-fundamentals)
2. [Data Structures](#data-structures)
3. [Caching Strategies](#caching-strategies)
4. [Persistence](#persistence)
5. [Replication & High Availability](#replication--high-availability)
6. [Performance & Optimization](#performance--optimization)
7. [Advanced Features](#advanced-features)
8. [Best Practices](#best-practices)

---

## Redis Fundamentals

### What is Redis?
**Redis (Remote Dictionary Server)** is an open-source, in-memory data structure store. Used as database, cache, message broker, and streaming engine. Supports various data structures with sub-millisecond latency.

**Key characteristics:**
- **In-memory:** Stores data in RAM (fast access)
- **Key-value store:** Maps keys to values
- **Data structures:** Strings, lists, sets, hashes, sorted sets, bitmaps, streams
- **Single-threaded:** Event loop model (no race conditions)
- **Persistence:** Optional disk persistence
- **Atomic operations:** All operations are atomic

**Key takeaway:** In-memory, key-value, single-threaded, sub-millisecond latency.

---

### Redis vs Memcached
**Redis:**
- Rich data structures (lists, sets, hashes)
- Persistence (RDB, AOF)
- Replication, clustering
- Pub/Sub messaging
- Transactions
- Lua scripting

**Memcached:**
- Simple key-value (strings only)
- No persistence (pure cache)
- No replication
- Simpler, slightly faster for basic operations
- Multi-threaded

**When to use Redis:**
- Need data structures beyond strings
- Require persistence
- Need replication/HA
- Complex caching patterns
- Pub/Sub messaging

**Key takeaway:** Redis = feature-rich. Memcached = simple, fast strings.

---

### Use Cases
**1. Caching:**
- Database query results
- API responses
- Session data
- Page fragments

**2. Session Store:**
- User sessions
- Shopping carts
- Temporary user data

**3. Real-time Analytics:**
- Leaderboards (sorted sets)
- Counters (increment/decrement)
- Rate limiting

**4. Message Broker:**
- Pub/Sub messaging
- Task queues (with lists)
- Stream processing

**5. Geospatial:**
- Location-based services
- Distance calculations

**Key takeaway:** Cache, sessions, real-time analytics, messaging, geospatial.

---

## Data Structures

### Strings
**Definition:** Binary-safe strings (up to 512MB).

**Commands:**
```redis
SET key value         # Set key
GET key               # Get value
MSET k1 v1 k2 v2     # Multiple set
MGET k1 k2           # Multiple get
INCR counter         # Increment by 1
INCRBY counter 5     # Increment by 5
DECR counter         # Decrement by 1
APPEND key " more"   # Append to string
STRLEN key           # String length
SETEX key 60 value   # Set with expiration (60 seconds)
```

**Use cases:**
- Cache HTML pages, JSON responses
- Counters (views, likes)
- Feature flags

**Key takeaway:** Basic type. Good for caching, counters.

---

### Lists
**Definition:** Ordered collection of strings. Implemented as linked list.

**Commands:**
```redis
LPUSH mylist "a"       # Push to left (head)
RPUSH mylist "b"       # Push to right (tail)
LPOP mylist            # Pop from left
RPOP mylist            # Pop from right
LRANGE mylist 0 -1     # Get all elements (0 to end)
LLEN mylist            # Length
LINDEX mylist 0        # Get element at index
LTRIM mylist 0 99      # Keep only first 100 elements
```

**Blocking operations (for queues):**
```redis
BLPOP mylist 0         # Block until element available
BRPOP mylist 0         # Block pop from right
```

**Use cases:**
- Task queues (producer-consumer)
- Activity feeds (recent items)
- Undo/redo operations

**Key takeaway:** Linked list. Good for queues, recent items.

---

### Sets
**Definition:** Unordered collection of unique strings.

**Commands:**
```redis
SADD myset "a" "b"     # Add members
SMEMBERS myset         # Get all members
SISMEMBER myset "a"    # Check membership
SREM myset "a"         # Remove member
SCARD myset            # Count members
SINTER set1 set2       # Intersection
SUNION set1 set2       # Union
SDIFF set1 set2        # Difference
SPOP myset             # Remove random member
SRANDMEMBER myset 2    # Get 2 random members
```

**Use cases:**
- Unique visitors (user IDs)
- Tags for posts
- Friend connections (who follows whom)
- Inventory tracking

**Key takeaway:** Unique values. Good for membership, tags, relationships.

---

### Hashes
**Definition:** Map of field-value pairs (like objects/dictionaries).

**Commands:**
```redis
HSET user:1 name "Alice"       # Set field
HGET user:1 name               # Get field
HMSET user:1 name "Alice" age 30  # Multiple fields
HMGET user:1 name age          # Multiple get
HGETALL user:1                 # Get all fields
HDEL user:1 age                # Delete field
HEXISTS user:1 name            # Check field exists
HINCRBY user:1 views 1         # Increment field
HKEYS user:1                   # Get all field names
HVALS user:1                   # Get all values
```

**Use cases:**
- User profiles
- Product details
- Session data
- Configuration

**Key takeaway:** Object-like. Good for structured data.

---

### Sorted Sets (ZSets)
**Definition:** Set where each member has a score (used for ordering).

**Commands:**
```redis
ZADD leaderboard 100 "Alice"   # Add with score
ZADD leaderboard 90 "Bob"
ZRANGE leaderboard 0 -1        # Get all (ascending)
ZREVRANGE leaderboard 0 -1     # Get all (descending)
ZRANK leaderboard "Alice"      # Get rank (0-based)
ZSCORE leaderboard "Alice"     # Get score
ZINCRBY leaderboard 10 "Alice" # Increment score
ZREM leaderboard "Alice"       # Remove member
ZCOUNT leaderboard 80 100      # Count in score range
```

**Use cases:**
- Leaderboards (gaming scores)
- Priority queues
- Time-series data (timestamp as score)
- Rate limiting (sliding window)

**Key takeaway:** Ordered by score. Leaderboards, priority queues.

---

### Bitmaps
**Definition:** Bit array operations on strings.

**Commands:**
```redis
SETBIT key 10 1         # Set bit at offset 10
GETBIT key 10           # Get bit at offset
BITCOUNT key            # Count set bits (1s)
BITOP AND dest k1 k2    # Bitwise AND
```

**Use cases:**
- User activity tracking (daily logins)
- Feature flags (enabled/disabled)
- Bloom filters

**Key takeaway:** Efficient for binary flags. Space-efficient.

---

### HyperLogLog
**Definition:** Probabilistic data structure for counting unique items (with small error).

**Commands:**
```redis
PFADD hll "user1" "user2"  # Add items
PFCOUNT hll                # Count unique items
PFMERGE dest hll1 hll2     # Merge HLLs
```

**Accuracy:** ~0.81% error, uses only 12KB per key.

**Use cases:**
- Unique visitors count
- Unique search queries

**Key takeaway:** Count unique items efficiently. Small memory footprint.

---

### Streams
**Definition:** Append-only log data structure (like Kafka topics).

**Commands:**
```redis
XADD mystream * field1 value1  # Add entry (auto ID)
XREAD STREAMS mystream 0       # Read from beginning
XLEN mystream                  # Length
XRANGE mystream - +            # Get all entries
XGROUP CREATE mystream mygroup 0  # Create consumer group
```

**Use cases:**
- Event sourcing
- Activity logs
- Message queuing with consumer groups

**Key takeaway:** Append-only log. Event streaming, consumer groups.

---

## Caching Strategies

### Cache-Aside (Lazy Loading)
**Pattern:**
1. Application checks cache
2. If hit → return from cache
3. If miss → fetch from DB → store in cache → return

```javascript
async function getUser(userId) {
  // Check cache
  let user = await redis.get(`user:${userId}`);
  if (user) return JSON.parse(user);

  // Cache miss - fetch from DB
  user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

  // Store in cache (1 hour TTL)
  await redis.setex(`user:${userId}`, 3600, JSON.stringify(user));

  return user;
}
```

**Pros:**
- Only cache what's needed
- Resilient to cache failures

**Cons:**
- Initial request slow (cache miss)
- Stale data possible

**Key takeaway:** Most common pattern. Read-heavy workloads.

---

### Write-Through
**Pattern:**
1. Write to cache and DB simultaneously
2. Read always from cache (guaranteed fresh)

**Pros:**
- Cache always consistent with DB
- No stale reads

**Cons:**
- Write latency (two writes)
- Unused data cached

**Key takeaway:** Consistency over speed. Write and cache together.

---

### Write-Behind (Write-Back)
**Pattern:**
1. Write to cache immediately
2. Asynchronously write to DB (batched)

**Pros:**
- Fast writes
- Reduced DB load (batching)

**Cons:**
- Data loss risk (if cache crashes before DB write)
- Complex implementation

**Key takeaway:** Fast writes. Risk of data loss.

---

### Cache Invalidation
**Strategies:**

**1. TTL (Time-To-Live):**
```redis
SET key value EX 3600  # Expire in 1 hour
EXPIRE key 3600        # Set expiration on existing key
```

**2. Manual Invalidation:**
```redis
DEL user:123  # Delete on update
```

**3. Event-based Invalidation:**
- Listen to DB changes (CDC, triggers)
- Invalidate related cache keys

**Two hardest problems in CS:**
1. Cache invalidation
2. Naming things
3. Off-by-one errors

**Key takeaway:** TTL, manual delete, event-based. Choose based on consistency needs.

---

### Cache Eviction Policies
**When cache is full, which keys to remove?**

**LRU (Least Recently Used) - Default:**
- Evict least recently accessed keys
- Good for general use

**LFU (Least Frequently Used):**
- Evict least frequently accessed keys
- Good for uneven access patterns

**Volatile-LRU:**
- LRU only among keys with TTL

**AllKeys-Random:**
- Random eviction (any key)

**No-Eviction:**
- Return errors when full

**Configuration:**
```
maxmemory 2gb
maxmemory-policy allkeys-lru
```

**Key takeaway:** LRU = default. Configure maxmemory-policy.

---

## Persistence

### RDB (Redis Database Backup)
**Definition:** Point-in-time snapshots at intervals.

**How it works:**
- Fork child process
- Child writes dataset to disk (dump.rdb)
- Parent continues serving requests

**Configuration:**
```
save 900 1      # Save if 1 key changed in 900 seconds
save 300 10     # Save if 10 keys changed in 300 seconds
save 60 10000   # Save if 10000 keys changed in 60 seconds
```

**Pros:**
- Compact single file
- Fast restarts
- Good for backups

**Cons:**
- Data loss (up to last snapshot)
- Fork can be expensive (large datasets)

**Key takeaway:** Snapshots. Fast, compact. Potential data loss.

---

### AOF (Append-Only File)
**Definition:** Log of every write operation.

**How it works:**
- Every write appended to file
- On restart, replay log to rebuild dataset

**Fsync policies:**
```
appendfsync always      # Fsync every write (slow, safe)
appendfsync everysec    # Fsync every second (default, good balance)
appendfsync no          # Let OS decide (fast, risky)
```

**Rewrite (compaction):**
- Periodically rewrite AOF to reduce size
- `auto-aof-rewrite-percentage 100`

**Pros:**
- Minimal data loss (1 second max with everysec)
- Append-only (safer)

**Cons:**
- Larger files than RDB
- Slower restarts

**Key takeaway:** Log every write. Better durability. Larger files.

---

### RDB vs AOF
| Feature | RDB | AOF |
|---------|-----|-----|
| Data loss | Minutes | 1 second |
| File size | Small | Large |
| Recovery speed | Fast | Slow |
| Performance impact | Periodic (fork) | Continuous (append) |

**Recommendation:** Use both (Redis 4.0+ hybrid: RDB for snapshots, AOF for safety).

**Key takeaway:** RDB + AOF = best of both worlds.

---

## Replication & High Availability

### Master-Replica Replication
**Definition:** Asynchronous replication. Master handles writes, replicas handle reads.

**Setup:**
```
# On replica
replicaof 192.168.1.100 6379
```

**How it works:**
1. Replica connects to master
2. Master sends RDB snapshot
3. Master sends stream of write commands
4. Replica applies commands

**Pros:**
- Scale reads (multiple replicas)
- Data redundancy

**Cons:**
- Asynchronous (replica lag)
- No automatic failover (without Sentinel)

**Key takeaway:** Master = writes, Replicas = reads. Asynchronous.

---

### Redis Sentinel (High Availability)
**Definition:** Monitors masters and replicas, performs automatic failover.

**Features:**
- **Monitoring:** Check if master/replica alive
- **Notification:** Alert on failures
- **Automatic Failover:** Promote replica to master if master fails
- **Configuration Provider:** Clients ask Sentinel for master address

**Quorum:** Number of Sentinels agreeing master is down (e.g., 2 of 3).

**Setup:**
```
sentinel monitor mymaster 192.168.1.100 6379 2  # Quorum = 2
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 60000
```

**Key takeaway:** Auto-failover. Monitoring. Minimum 3 Sentinel nodes.

---

### Redis Cluster (Sharding)
**Definition:** Distribute data across multiple nodes (horizontal scaling).

**How it works:**
- 16384 hash slots
- Keys hashed to slots: `CRC16(key) % 16384`
- Each master owns subset of slots
- Each master has replicas

**Example (3 masters):**
- Master 1: Slots 0-5460
- Master 2: Slots 5461-10922
- Master 3: Slots 10923-16383

**Pros:**
- Horizontal scaling
- Automatic sharding
- High availability (with replicas)

**Cons:**
- No multi-key operations (unless same slot)
- Complex setup

**Hash tags (force same slot):**
```redis
SET {user:123}:profile "data"
SET {user:123}:settings "data"
# Both keys share slot (user:123)
```

**Key takeaway:** Sharding for scale. 16384 slots. Use hash tags for multi-key ops.

---

## Performance & Optimization

### Single-Threaded Model
**Definition:** One main thread handles all commands (no race conditions).

**Why single-threaded?**
- CPU not bottleneck (memory-bound)
- No locking overhead
- Simple, predictable

**Multi-threading (Redis 6+):**
- I/O threads for network (read/write)
- Command execution still single-threaded

**Key takeaway:** Single-threaded = simple, fast. I/O threads for network.

---

### Pipeline
**Definition:** Send multiple commands without waiting for responses (reduce round trips).

**Without pipelining:**
```javascript
await redis.set('key1', 'val1');  // RTT 1
await redis.set('key2', 'val2');  // RTT 2
await redis.set('key3', 'val3');  // RTT 3
// Total: 3 RTT
```

**With pipelining:**
```javascript
const pipeline = redis.pipeline();
pipeline.set('key1', 'val1');
pipeline.set('key2', 'val2');
pipeline.set('key3', 'val3');
await pipeline.exec();  // 1 RTT
```

**Speedup:** 3x-5x for multiple commands.

**Key takeaway:** Batch commands. Reduce network round trips.

---

### Transactions
**Definition:** Execute multiple commands atomically (all or nothing).

**Commands:**
```redis
MULTI              # Start transaction
SET key1 value1
SET key2 value2
EXEC               # Execute all (atomic)
```

**DISCARD:** Abort transaction.

**WATCH (Optimistic Locking):**
```redis
WATCH key1         # Watch for changes
MULTI
SET key1 newvalue
EXEC               # Fails if key1 changed since WATCH
```

**Limitations:**
- No rollback (if command fails mid-transaction)
- All-or-nothing execution

**Key takeaway:** MULTI/EXEC for atomic operations. WATCH for optimistic locking.

---

### Lua Scripting
**Definition:** Execute Lua scripts atomically on Redis server.

**Example:**
```lua
-- Atomic increment with max limit
local current = redis.call('GET', KEYS[1])
if current == false then current = 0 end
current = tonumber(current)
if current < tonumber(ARGV[1]) then
  return redis.call('INCR', KEYS[1])
else
  return 0
end
```

**Execute:**
```redis
EVAL script 1 counter 100  # KEYS[1]=counter, ARGV[1]=100
```

**EVALSHA:** Execute cached script (by SHA hash).

**Pros:**
- Atomic complex operations
- Reduce round trips
- Server-side logic

**Cons:**
- Blocks server (keep scripts fast)

**Key takeaway:** Atomic complex logic. Keep scripts fast.

---

### Memory Optimization
**1. Use appropriate data structures:**
- Hash for objects (more efficient than multiple keys)
- Sorted sets for ranges

**2. Compress values:**
- JSON compression
- MessagePack, Protobuf

**3. Set expiration:**
```redis
EXPIRE key 3600
```

**4. Use Redis memory analyzer:**
```redis
MEMORY USAGE key
```

**5. Enable maxmemory and eviction:**
```
maxmemory 2gb
maxmemory-policy allkeys-lru
```

**Key takeaway:** Hashes for objects, compression, TTL, memory limits.

---

## Advanced Features

### Pub/Sub (Publish/Subscribe)
**Definition:** Message broadcasting pattern.

**Publish:**
```redis
PUBLISH channel "message"
```

**Subscribe:**
```redis
SUBSCRIBE channel
PSUBSCRIBE news.*  # Pattern subscribe
```

**Use cases:**
- Real-time notifications
- Chat applications
- Live feeds

**Limitations:**
- No message persistence (subscribers must be online)
- No acknowledgment

**Key takeaway:** Real-time messaging. No persistence. Fire-and-forget.

---

### Geospatial
**Definition:** Store and query geographic coordinates.

**Commands:**
```redis
GEOADD locations 13.361389 38.115556 "Palermo"
GEOADD locations 15.087269 37.502669 "Catania"
GEODIST locations "Palermo" "Catania" km  # Distance
GEORADIUS locations 15 37 200 km          # Within 200km
```

**Use cases:**
- Find nearby locations (restaurants, users)
- Distance calculations
- Geofencing

**Key takeaway:** Location-based queries. Radius search.

---

### Rate Limiting
**Sliding Window with Sorted Sets:**
```javascript
async function isAllowed(userId, limit, window) {
  const key = `rate:${userId}`;
  const now = Date.now();
  const windowStart = now - window;

  // Remove old entries
  await redis.zremrangebyscore(key, 0, windowStart);

  // Count requests in window
  const count = await redis.zcard(key);

  if (count < limit) {
    // Add current request
    await redis.zadd(key, now, now);
    await redis.expire(key, Math.ceil(window / 1000));
    return true;
  }

  return false;
}

// Allow 10 requests per 60 seconds
await isAllowed('user:123', 10, 60000);
```

**Key takeaway:** Sorted sets for sliding window rate limiting.

---

## Best Practices

### 1. Use Connection Pooling
**Node.js example:**
```javascript
const redis = require('redis');
const client = redis.createClient({
  socket: {
    host: 'localhost',
    port: 6379
  },
  // Connection pool settings
  maxRetriesPerRequest: 3,
  enableReadyCheck: true
});
```

**Key takeaway:** Reuse connections. Don't create per request.

---

### 2. Key Naming Conventions
**Use consistent patterns:**
```
user:1000:profile
user:1000:sessions
product:5000:details
cache:api:users:list
```

**Namespace with colons:** `object:id:field`

**Key takeaway:** Consistent naming. Use colons for hierarchy.

---

### 3. Avoid Large Keys
**Problems:**
- Slow operations (blocking)
- Memory fragmentation

**Solutions:**
- Limit list/set size
- Split large hashes into smaller ones
- Use streams for logs

**Key takeaway:** Keep keys small. Split large collections.

---

### 4. Monitor Performance
**Commands:**
```redis
INFO                    # Server stats
SLOWLOG GET 10          # Slow queries
MONITOR                 # Watch all commands (debug only)
CLIENT LIST             # Connected clients
MEMORY STATS            # Memory usage
```

**Metrics to track:**
- Hit rate (`keyspace_hits / (keyspace_hits + keyspace_misses)`)
- Memory usage
- Connected clients
- Commands per second

**Key takeaway:** Monitor hit rate, memory, latency.

---

### 5. Security
**1. Disable dangerous commands:**
```
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG "CONFIG_abc123"
```

**2. Use password:**
```
requirepass yourpassword
```

**3. Bind to localhost (if possible):**
```
bind 127.0.0.1
```

**4. Use TLS (Redis 6+):**
```
tls-port 6380
tls-cert-file /path/to/cert.crt
```

**5. Network isolation:**
- VPC/private network
- Firewall rules

**Key takeaway:** Password, disable dangerous commands, network isolation, TLS.

---

## Interview Tips

1. **Explain single-threaded:** "Redis uses single thread for command execution—no race conditions, simple model. I/O threads for network in Redis 6+."
2. **Discuss use cases:** "Used Redis for session store with 1-hour TTL, reducing DB load by 80%."
3. **Caching strategies:** "Cache-aside for read-heavy workloads. Set expiration to prevent stale data."
4. **Know data structures:** "Sorted sets for leaderboards—O(log N) insertion, range queries."
5. **High availability:** "Redis Sentinel for auto-failover. Redis Cluster for horizontal scaling."

**Key concepts:** In-memory, data structures, caching strategies, persistence, replication, performance

---

**Updated:** 2026-06-28 | **Level:** Intermediate-Advanced | **Format:** Interview-ready definitions
