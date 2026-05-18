# Day 13 - Database Optimization & Advanced Queries

**Date:** May 30, 2026
**Focus:** Database performance, indexing, query optimization, NoSQL

---

## 🔗 Quick Links to Concepts
[Node.js](#nodejs-concepts) | [JavaScript](#javascript-concepts) | [React.js](#reactjs-concepts) | [Java](#java-concepts) | [Spring Boot](#spring-boot-concepts) | [DevOps](#devops-concepts) | [Google Cloud](#google-cloud-concepts) | [System Design](#system-design-concepts) | [DSA](#dsa-concepts)

---

## ⏰ 30-Minute Study Blocks

### 1. Node.js (30 min)
**Topic:** Database Optimization in Node.js
- Connection pooling best practices
- Query optimization with ORMs (Sequelize, Prisma)
- N+1 query problem
- Eager vs lazy loading
- Database transactions in Node.js
- Read replicas and write-master pattern

### 2. JavaScript (30 min)
**Topic:** IndexedDB & Client-Side Storage
- IndexedDB API
- Object stores and indexes
- Transactions in IndexedDB
- Versioning and migrations
- Performance considerations
- Use cases for client-side databases

### 3. React.js (30 min)
**Topic:** Data Fetching Strategies
- React Query (TanStack Query)
- SWR (stale-while-revalidate)
- Caching strategies
- Optimistic updates
- Infinite scrolling and pagination
- Prefetching and background refetching

### 4. Java (30 min)
**Topic:** JDBC & Database Access
- JDBC architecture
- PreparedStatement vs Statement
- Connection pooling (HikariCP)
- Batch processing
- Transaction management
- Handling large result sets

### 5. Spring Boot (30 min)
**Topic:** Advanced JPA & Hibernate
- Entity relationships optimization
- N+1 query problem and solutions (@EntityGraph, JOIN FETCH)
- Second-level cache
- Query hints
- Lazy loading strategies
- Batch fetching

### 6. DevOps (30 min)
**Topic:** Database DevOps
- Database versioning (Flyway, Liquibase)
- Zero-downtime migrations
- Blue-green database deployments
- Database backup strategies
- Point-in-time recovery
- Database monitoring

### 7. Google Cloud (30 min)
**Topic:** Cloud Spanner & Bigtable
- Cloud Spanner (globally distributed SQL)
- Bigtable (NoSQL, wide-column)
- When to use Spanner vs Bigtable
- Schema design for Bigtable
- Hotspotting avoidance
- Read/write performance tuning

### 8. System Design (30 min)
**Topic:** Database Scaling Patterns
- Read replicas and replication lag
- Database sharding strategies (hash-based, range-based, geo-based)
- Consistent hashing
- Partitioning vs sharding
- CQRS with separate read/write databases
- Multi-region database strategies

### 9. DSA (30 min)
**Topic:** Binary Search Trees Advanced
- Balanced BST (AVL trees, Red-Black trees)
- BST operations optimization
- Lowest Common Ancestor
- Problems: Kth Smallest in BST, Serialize and Deserialize BST, Range Sum of BST

---

## 📖 Concept Definitions (Interview-Ready)

### Node.js Concepts

**Connection Pooling**
Maintaining a pool of reusable database connections instead of creating/closing connections for each query. Reduces connection overhead, improves performance, and limits concurrent connections. Libraries like pg-pool or mysql2 pool handle this.

**Query Optimization with ORMs**
Techniques to improve database performance when using Sequelize or Prisma: use select to limit fields, include for eager loading, add database indexes, avoid N+1 queries, and use raw queries for complex operations.

**N+1 Query Problem**
A performance anti-pattern where fetching N records triggers N+1 database queries (1 for main records, N for related data). Example: fetching users then querying posts for each user separately. Solution: eager loading with JOIN or IN queries.

**Eager vs Lazy Loading**
Eager: Load related data in single query using JOINs (prevents N+1, but may fetch unnecessary data). Lazy: Load related data only when accessed (saves bandwidth, but risks N+1 queries). Choose based on access patterns.

**Database Transactions**
A unit of work that either completes fully or rolls back entirely (ACID properties). In Node.js, use transaction APIs from libraries like Sequelize or Prisma to ensure data consistency across multiple operations.

**Read Replicas and Write-Master Pattern**
Architecture where writes go to master database, reads distributed across replicas. Improves read performance and availability. Handle replication lag, and route queries appropriately (master for writes/fresh reads, replicas for stale-tolerant reads).

---

### JavaScript Concepts

**IndexedDB**
A low-level browser API for storing large amounts of structured data, including files and blobs. NoSQL database with indexes, transactions, and persistence. Supports offline-first applications.

**Object Stores**
Similar to tables in relational databases but schema-less. Each object store holds records with a key. Can have in-line keys (from object property) or out-of-line keys (separate key path).

**Indexes in IndexedDB**
Secondary access paths for querying data by properties other than primary key. Support unique and multi-entry indexes. Enable efficient lookups and range queries on indexed fields.

**Transactions in IndexedDB**
All database operations must occur within transactions. Types: readonly (default for reads), readwrite (for modifications), versionchange (for schema changes). Ensures atomicity and consistency.

**Versioning and Migrations**
IndexedDB uses version numbers for schema management. When opening database with higher version, onupgradeneeded event fires, allowing creation/modification of object stores and indexes. Handles schema evolution.

**Client-Side Database Use Cases**
Offline-first apps, caching API responses, storing user-generated content before sync, progressive web apps (PWAs), reducing server load, and providing instant user experience.

---

### React.js Concepts

**React Query (TanStack Query)**
A powerful data fetching library for React. Handles caching, background refetching, stale data management, request deduplication, and optimistic updates. Reduces boilerplate and improves UX with automatic background updates.

**SWR (stale-while-revalidate)**
A React Hooks library for data fetching by Vercel. Strategy: return cached (stale) data immediately, then fetch fresh data and update. Provides real-time experience with automatic revalidation.

**Caching Strategies**
Approaches to store and reuse fetched data: cache-first (use cache if available), network-first (fetch, fallback to cache), stale-while-revalidate (show cache, update in background), cache-only, network-only.

**Optimistic Updates**
Immediately update UI with expected result before server confirms. If request fails, rollback to previous state. Provides instant feedback. React Query and Apollo Client provide built-in support.

**Infinite Scrolling and Pagination**
Loading data in chunks as user scrolls. React Query's useInfiniteQuery manages page parameters, merges results, and handles "load more" logic. Improves performance by not loading all data at once.

**Prefetching and Background Refetching**
Prefetching: Load data before user needs it (on hover, route change). Background refetching: Silently update stale data while showing cached version. Both improve perceived performance.

---

### Java Concepts

**JDBC (Java Database Connectivity)**
A Java API for connecting to and executing queries on databases. Provides database-agnostic interface through drivers. Key components: DriverManager, Connection, Statement, ResultSet.

**PreparedStatement vs Statement**
Statement: Executes static SQL, vulnerable to SQL injection. PreparedStatement: Pre-compiled SQL with parameterized queries, prevents SQL injection, better performance for repeated queries, supports batching.

**Connection Pooling (HikariCP)**
HikariCP is a high-performance JDBC connection pool. Reuses connections, minimizes connection overhead, provides leak detection, and offers extensive configuration. Default pool in Spring Boot.

**Batch Processing**
Executing multiple SQL statements in a single database round trip. Use addBatch() and executeBatch() to group operations. Significantly improves performance for bulk inserts/updates by reducing network overhead.

**Transaction Management in JDBC**
Controlling commit/rollback of database operations. Disable auto-commit, execute multiple statements, commit on success or rollback on failure. Ensures data consistency across related operations.

**Handling Large Result Sets**
Techniques for memory-efficient processing: use fetchSize to limit rows loaded into memory, stream results with ResultSet cursors, process row-by-row instead of loading all data, or use pagination.

---

### Spring Boot Concepts

**Entity Relationships Optimization**
Design efficient JPA relationships: use lazy loading by default, avoid bidirectional mappings when unnecessary, use @ManyToOne over @OneToMany where possible, and consider denormalization for read-heavy scenarios.

**N+1 Query Problem in JPA**
Occurs with lazy loading when accessing collections triggers separate queries per entity. Solutions: use @EntityGraph, JOIN FETCH in JPQL, batch fetching, or configure FetchType.EAGER selectively.

**@EntityGraph**
Annotation to define fetch plan for entity loading. Specifies which associations to eagerly load in a single query. Avoids N+1 problem without changing default FetchType. Applied at repository method level.

**JOIN FETCH**
JPQL/HQL syntax to eagerly load associations in a single query. Example: `SELECT u FROM User u JOIN FETCH u.posts`. Prevents N+1 queries and reduces database round trips.

**Second-Level Cache**
A shared cache across sessions (beyond first-level cache per session). Caches entities, queries, and collections. Improves read performance by reducing database hits. Providers: EhCache, Redis. Requires careful invalidation strategy.

**Query Hints**
JPA annotations to pass database-specific optimization instructions. Example: @QueryHint for timeout, fetch size, or caching. Helps fine-tune query execution at runtime.

**Lazy Loading Strategies**
FetchType.LAZY defers loading until accessed. Challenges: LazyInitializationException outside session, N+1 queries. Solutions: Open Session in View (not recommended), fetch joins, DTOs, or @EntityGraph.

**Batch Fetching**
Loading multiple lazy associations in batches instead of one-by-one. Configured with @BatchSize annotation. Reduces N+1 problem by fetching in groups (e.g., load 10 posts at a time instead of one per user).

---

### DevOps Concepts

**Database Versioning**
Managing database schema changes with version control. Tools like Flyway and Liquibase track migrations as code, apply changes incrementally, and maintain schema history. Enables repeatable deployments and rollbacks.

**Flyway**
A database migration tool that uses SQL or Java for migrations. Applies changes sequentially based on version numbers. Tracks applied migrations in schema_version table. Simple, SQL-based approach.

**Liquibase**
An advanced database migration tool using XML, YAML, JSON, or SQL. Database-agnostic with rollback support, preconditions, and contexts. More features but steeper learning curve than Flyway.

**Zero-Downtime Migrations**
Database changes without service interruption. Strategies: backward-compatible changes, expand-contract pattern (add new column, dual writes, migrate data, remove old column), feature flags, and blue-green deployments.

**Blue-Green Database Deployments**
Running two production databases (blue and green). Deploy changes to inactive database, test, then switch traffic. Allows instant rollback but requires data synchronization and double infrastructure.

**Database Backup Strategies**
Full backups (complete copy), incremental backups (changes since last), differential backups (changes since last full). Consider RPO/RTO requirements, storage costs, and restoration time. Automate and test restores regularly.

**Point-in-Time Recovery (PITR)**
Ability to restore database to specific timestamp. Combines full backups with transaction logs. Critical for recovering from data corruption or accidental deletions. Supported by PostgreSQL, MySQL, and most cloud databases.

**Database Monitoring**
Tracking metrics like query performance, slow queries, connection pool usage, replication lag, disk I/O, and cache hit ratios. Tools: Prometheus, Datadog, CloudWatch. Enables proactive optimization and incident response.

---

### Google Cloud Concepts

**Cloud Spanner**
A fully managed, globally distributed, horizontally scalable relational database. Combines benefits of relational (ACID, SQL) and NoSQL (scalability, availability). Used when global consistency and scale are needed.

**Bigtable**
A fully managed, wide-column NoSQL database for massive-scale analytical and operational workloads. Handles petabytes of data, low latency, high throughput. Ideal for time-series, IoT, and analytics.

**Spanner vs Bigtable**
Spanner: Relational, ACID transactions, SQL, global consistency, slower writes. Bigtable: NoSQL, eventual consistency, key-value access, ultra-high throughput, no transactions. Choose based on consistency needs and data model.

**Schema Design for Bigtable**
Design row keys to avoid hotspots (avoid sequential keys, use reverse timestamps, hash prefixes). Use column families for related data. Denormalize data. Optimize for read patterns as Bigtable doesn't support secondary indexes.

**Hotspotting in Bigtable**
Performance problem when requests concentrate on a single node due to poorly designed row keys. Avoid sequential keys (timestamps, auto-increment IDs). Solutions: field promotion, salting (add random prefix), or reversed timestamps.

**Read/Write Performance Tuning**
Optimize Bigtable performance: design row keys for distribution, use batch operations, adjust node count for throughput, configure replication for read-heavy workloads, monitor latency metrics, and use appropriate column families.

---

### System Design Concepts

**Read Replicas**
Copies of primary database that handle read traffic. Asynchronously replicated from master. Improve read scalability and availability. Trade-off: replication lag means stale reads. Use for read-heavy workloads.

**Replication Lag**
Delay between write on master and availability on replica. Caused by network latency, replica load, or large transactions. Can cause inconsistent reads. Monitor lag and consider eventual consistency implications.

**Database Sharding**
Horizontally partitioning data across multiple databases. Each shard holds subset of data. Improves write scalability and reduces database size. Challenges: complex queries across shards, rebalancing, and maintaining consistency.

**Sharding Strategies**
Hash-based: shard_id = hash(key) % num_shards (even distribution, hard to add shards). Range-based: partition by value ranges (easy range queries, risk of hotspots). Geo-based: shard by geography (reduces latency, data locality).

**Consistent Hashing**
A sharding technique that minimizes data movement when adding/removing nodes. Each node assigned position on hash ring; keys mapped to next node clockwise. Only K/n keys need rebalancing when nodes change.

**Partitioning vs Sharding**
Partitioning: Splitting data within a single database (vertical: by columns, horizontal: by rows). Sharding: Horizontal partitioning across multiple databases/servers. Sharding is partitioning + distribution.

**CQRS with Separate Databases**
Using different databases for reads and writes. Write DB optimized for transactional consistency; read DB optimized for queries (denormalized, indexed). Synced via events. Enables independent scaling.

**Multi-Region Database Strategies**
Approaches: active-passive (one region serves all, others standby), active-active (all regions serve traffic), read replicas in each region, or global databases like Spanner. Balance latency, consistency, and cost.

---

### DSA Concepts

**Balanced Binary Search Tree**
A BST that maintains logarithmic height through rotations during insertions/deletions. Guarantees O(log n) operations. Examples: AVL trees (strict balancing), Red-Black trees (relaxed balancing, faster insertions).

**AVL Trees**
A self-balancing BST where heights of left and right subtrees differ by at most 1. Uses rotations (single, double) to maintain balance after insert/delete. Guarantees O(log n) but more rotations than Red-Black trees.

**Red-Black Trees**
A self-balancing BST with color property (red/black nodes) and rules ensuring height is at most 2*log(n+1). Less strictly balanced than AVL, faster insertions/deletions. Used in Java TreeMap and C++ STL map.

**BST Operations Optimization**
Techniques: balancing (AVL, Red-Black), caching frequently accessed nodes, path compression (for search), lazy deletion (mark instead of remove), or using augmented trees to track additional info.

**Lowest Common Ancestor (LCA)**
The deepest node that is an ancestor of both given nodes. In BST, can find in O(h) by comparing values. In general tree, use parent pointers, LCA preprocessing, or binary lifting for O(log n) queries.

**Serialization and Deserialization of BST**
Converting tree to string/array (serialize) and reconstructing from it (deserialize). Approaches: level-order with null markers, preorder (for BST, no need for inorder), or using custom encoding. Useful for storage and transmission.

**Range Sum of BST**
Computing sum of all node values within a given range. Use BST property to prune search: if node < low, go right; if node > high, go left; if in range, include node and recurse both sides. O(h + k) where k is nodes in range.

---

## ✅ Day 13 Completion Checklist
- [ ] Node.js: Optimize database queries
- [ ] JavaScript: Use IndexedDB
- [ ] React: Implement React Query
- [ ] Java: Work with JDBC and connection pooling
- [ ] Spring Boot: Solve N+1 query problem
- [ ] DevOps: Set up Flyway migrations
- [ ] GCP: Understand Spanner vs Bigtable
- [ ] System Design: Design sharding strategy
- [ ] DSA: Solve BST problems

---

**Tomorrow:** Day 14 - Advanced algorithms, System reliability, Chaos engineering
