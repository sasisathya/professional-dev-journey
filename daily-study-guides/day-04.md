# Day 4 - Modules, Performance & Transactions

**Focus:** Module systems, optimization, transactions, monitoring

## 🔗 Quick Links to Concepts
[Node.js](#nodejs-concepts) | [JavaScript](#javascript-concepts) | [React.js](#reactjs-concepts) | [Java](#java-concepts) | [Spring Boot](#spring-boot-concepts) | [DevOps](#devops-concepts) | [Google Cloud](#google-cloud-concepts) | [System Design](#system-design-concepts) | [DSA](#dsa-concepts)

---

## ⏰ 30-Minute Study Blocks

### 1. Node.js (30 min)
**Topic:** Module System & NPM
- CommonJS vs ES modules
- require() vs import/export
- module.exports vs exports
- Circular dependencies
- NPM package.json scripts
- Semantic versioning

### 2. JavaScript (30 min)
**Topic:** Advanced Async Patterns
- Promise.allSettled, Promise.any
- Async iterators and generators
- for await...of
- AbortController for cancellation
- Debouncing and throttling

### 3. React.js (30 min)
**Topic:** Performance Optimization
- useMemo and useCallback
- React.memo for component memoization
- Code splitting with React.lazy and Suspense
- Avoiding unnecessary re-renders
- Virtual DOM and reconciliation

### 4. Java (30 min)
**Topic:** Streams API & Functional Programming
- Stream creation and intermediate operations
- map, filter, reduce, flatMap
- Collectors (toList, groupingBy, partitioningBy)
- Parallel streams
- Optional class

### 5. Spring Boot (30 min)
**Topic:** Transaction Management
- @Transactional annotation
- ACID properties
- Transaction propagation levels
- Isolation levels
- Rollback rules
- Declarative vs programmatic transactions

### 6. DevOps (30 min)
**Topic:** Monitoring & Logging
- Prometheus basics
- Grafana dashboards
- ELK stack (Elasticsearch, Logstash, Kibana)
- Application metrics (CPU, memory, response time)
- Log aggregation
- Alerting strategies

### 7. Google Cloud (30 min)
**Topic:** VPC & Networking
- Virtual Private Cloud concepts
- Subnets and IP ranges
- Firewall rules
- Cloud NAT
- VPC peering
- Load balancer types in GCP

### 8. System Design (30 min)
**Topic:** Database Design & Sharding
- SQL vs NoSQL when to use what
- Database normalization
- Indexes and query optimization
- Horizontal vs vertical scaling
- Database sharding strategies
- Replication (master-slave, multi-master)

### 9. DSA (30 min)
**Topic:** Hash Maps & Hash Sets
- Hash function concepts
- Collision resolution (chaining, open addressing)
- HashMap implementation details
- Time complexity analysis
- Problems: Two Sum, Group Anagrams, Longest Consecutive Sequence

---

## 📖 Concept Definitions (Interview-Ready)

### Node.js Concepts

**CommonJS**
The original Node.js module system using require() and module.exports. Synchronous loading, runs at runtime. Default in Node.js for .js files.

**ES Modules (ESM)**
Modern JavaScript module system using import/export syntax. Asynchronous loading, statically analyzed at compile time. Use .mjs extension or "type": "module" in package.json.

**require() vs import**
require() loads modules synchronously at runtime (CommonJS). import is asynchronous, evaluated before code runs, and supports tree-shaking (ESM). Cannot use import conditionally.

**module.exports vs exports**
module.exports is what's actually returned from a module. exports is a reference to module.exports. Reassigning exports breaks the reference, so use module.exports for full replacements.

**Circular Dependencies**
When two or more modules depend on each other, creating a cycle. Node.js handles this by returning partial exports. Best avoided through better architecture.

**package.json**
Configuration file for Node.js projects containing metadata, dependencies, scripts, and project settings. Required for npm packages.

**NPM Scripts**
Custom commands defined in package.json under "scripts". Run with npm run <script-name>. Common scripts: start, test, build, dev.

**Semantic Versioning (SemVer)**
Version format: MAJOR.MINOR.PATCH (e.g., 1.4.2). MAJOR for breaking changes, MINOR for new features (backward-compatible), PATCH for bug fixes. Use ^ for minor updates, ~ for patches.

---

### JavaScript Concepts

**Promise.allSettled()**
Takes an array of promises and waits for all to settle (resolve or reject). Returns an array of objects with status and value/reason. Unlike Promise.all, doesn't fail fast.

**Promise.any()**
Returns the first promise that fulfills. Rejects only if all promises reject (AggregateError). Opposite of Promise.all in behavior.

**Async Iterators**
Objects with a Symbol.asyncIterator method that returns an object with async next() method. Used with for await...of to iterate over asynchronous data sources.

**Generators**
Functions that can pause execution and resume later, yielding multiple values. Defined with function* and use yield keyword. Useful for lazy evaluation and custom iterators.

**for await...of**
Loops over async iterables (like streams or promises). Waits for each promise to resolve before continuing to next iteration.

**AbortController**
Provides a way to cancel ongoing asynchronous operations like fetch requests. Create controller, pass signal to operation, call abort() to cancel.

**Debouncing**
Delays function execution until after a specified time has passed since the last call. Useful for search inputs or resize events. Limits rapid fire executions.

**Throttling**
Ensures a function is called at most once in a specified time period. Unlike debounce, executes periodically during continuous events. Good for scroll or mousemove handlers.

---

### React.js Concepts

**useMemo**
Hook that memoizes (caches) the result of an expensive calculation. Only recalculates when dependencies change. Returns the computed value.

**useCallback**
Hook that memoizes a function reference. Returns the same function instance unless dependencies change. Prevents child component re-renders when passing callbacks.

**React.memo**
Higher-order component that memoizes a component. Only re-renders if props change (shallow comparison). Performance optimization for expensive components.

**Code Splitting**
Technique to split application into smaller chunks loaded on demand. Reduces initial bundle size and improves load time. Implemented with dynamic import().

**React.lazy**
Enables lazy loading of components using dynamic imports. Component is loaded only when needed. Must be used with Suspense for loading states.

**Suspense**
Component that shows fallback UI while lazy components load. Wraps lazy-loaded components and displays loading state. Example: `<Suspense fallback={<Loading />}>`.

**Unnecessary Re-renders**
When components re-render without prop/state changes. Causes: parent re-render, inline objects/functions, context changes. Fix with memo, useMemo, useCallback, or composition.

**Virtual DOM**
In-memory representation of real DOM. React compares new virtual DOM with previous version (diffing) to determine minimal changes needed.

**Reconciliation**
Process of comparing new virtual DOM with previous one and updating only changed elements in real DOM. Makes React fast by avoiding unnecessary DOM manipulations.

---

### Java Concepts

**Stream (Java)**
A sequence of elements supporting sequential and parallel operations. Doesn't store data, transforms source data. Lazy evaluation for efficiency.

**Intermediate Operations**
Stream operations that return a stream (map, filter, flatMap, distinct, sorted). Lazy - don't execute until terminal operation. Can be chained.

**Terminal Operations**
Operations that produce a result or side-effect (collect, forEach, reduce, count). Trigger execution of stream pipeline. Stream cannot be reused after.

**map()**
Transforms each element using a function. Returns stream of results. Example: stream.map(String::toUpperCase).

**filter()**
Selects elements matching a predicate. Returns stream of matching elements. Example: stream.filter(x -> x > 10).

**reduce()**
Combines stream elements into a single result using an accumulator function. Example: sum = stream.reduce(0, (a, b) -> a + b).

**flatMap()**
Maps each element to a stream, then flattens all streams into one. Useful for nested collections. Example: list.stream().flatMap(List::stream).

**Collectors**
Utility class with methods to accumulate stream elements into collections. Examples: toList(), toSet(), toMap(), groupingBy(), joining().

**Parallel Streams**
Processes elements in parallel using multiple threads. Created with .parallel() or .parallelStream(). Faster for large datasets but has overhead.

**Optional**
Container object that may or may not contain a non-null value. Prevents NullPointerException. Use orElse(), orElseThrow(), ifPresent(), map().

---

### Spring Boot Concepts

**@Transactional**
Declares that a method should run within a database transaction. Transaction commits on success, rolls back on exception. Can be applied to class or method level.

**ACID Properties**
Atomicity (all or nothing), Consistency (valid state to valid state), Isolation (concurrent transactions don't interfere), Durability (committed changes persist).

**Transaction Propagation**
Defines how transactions relate to each other. REQUIRED (join existing or create new), REQUIRES_NEW (always new), NESTED (savepoint), SUPPORTS, MANDATORY, NOT_SUPPORTED, NEVER.

**Isolation Levels**
Controls what data is visible to concurrent transactions. READ_UNCOMMITTED, READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE. Higher isolation = more consistency but less concurrency.

**Rollback Rules**
Determines which exceptions trigger rollback. By default, runtime exceptions rollback, checked exceptions don't. Customize with rollbackFor and noRollbackFor.

**Declarative vs Programmatic Transactions**
Declarative uses @Transactional annotations (preferred, cleaner). Programmatic uses TransactionTemplate or TransactionManager directly (more control, verbose).

---

### DevOps Concepts

**Prometheus**
Open-source monitoring and alerting system. Collects metrics from targets via HTTP pulls. Stores time-series data and provides query language (PromQL).

**Grafana**
Visualization and analytics platform. Creates dashboards from multiple data sources like Prometheus. Provides graphs, charts, and alerts.

**ELK Stack**
Elasticsearch (search/storage), Logstash (collection/processing), Kibana (visualization). Used for centralized logging and log analysis.

**Application Metrics**
Key performance indicators: CPU usage, memory consumption, response time, throughput, error rate, request count. Essential for monitoring application health.

**Log Aggregation**
Collecting logs from multiple sources into a central location. Enables searching, analyzing, and correlating logs across services. Examples: ELK, Splunk, CloudWatch.

**Alerting Strategies**
Define thresholds for metrics that trigger notifications. Use severity levels (critical, warning, info). Avoid alert fatigue by setting meaningful thresholds.

---

### Google Cloud Concepts

**Virtual Private Cloud (VPC)**
A virtualized network within GCP. Provides networking for cloud resources with isolation, security, and control. Global resource spanning multiple regions.

**Subnet**
A regional subdivision of a VPC with a specific IP address range (CIDR block). Resources are deployed to subnets. Can span zones within a region.

**IP Ranges (CIDR)**
Classless Inter-Domain Routing notation for IP ranges. Example: 10.0.0.0/24 gives 256 addresses. Defines subnet size and available IPs.

**Firewall Rules**
Control incoming and outgoing traffic to/from VM instances. Based on IP ranges, protocols, ports, and tags. Stateful - return traffic automatically allowed.

**Cloud NAT**
Managed Network Address Translation service. Allows private instances without external IPs to access internet. Provides outbound connectivity without inbound exposure.

**VPC Peering**
Connects two VPC networks enabling private communication across projects or organizations. Traffic stays on Google's network, doesn't traverse internet.

**GCP Load Balancers**
Global HTTP(S) (L7, content-based routing), Global SSL/TCP Proxy (L4, SSL offloading), Regional Network (L4, regional), Internal (private, within VPC).

---

### System Design Concepts

**SQL vs NoSQL**
SQL: Structured data, ACID transactions, complex queries, vertical scaling. NoSQL: Flexible schema, horizontal scaling, high performance, eventual consistency. Use SQL for structured data with relationships, NoSQL for scalability and flexibility.

**Database Normalization**
Organizing data to reduce redundancy. Forms: 1NF (atomic values), 2NF (no partial dependencies), 3NF (no transitive dependencies). Benefits: data integrity, reduced redundancy. Tradeoff: more joins.

**Database Indexes**
Data structures that improve query speed by creating pointers to data. Trade disk space and write performance for faster reads. Types: B-tree, hash, full-text.

**Query Optimization**
Improving query performance: use indexes, avoid SELECT *, limit results, optimize joins, analyze execution plans, denormalize when needed.

**Horizontal Scaling (Scale Out)**
Adding more servers/nodes to handle increased load. Better for NoSQL. Distributes data across machines. More complex but theoretically unlimited scaling.

**Vertical Scaling (Scale Up)**
Adding more resources (CPU, RAM) to existing server. Simpler but has limits. Common for SQL databases. Eventually hits hardware constraints.

**Database Sharding**
Partitioning data across multiple databases/servers. Each shard holds subset of data. Improves performance and scalability. Challenges: cross-shard queries, rebalancing.

**Database Replication**
Copying data across multiple databases for redundancy and performance. Master-slave: one writes, many read. Multi-master: multiple nodes can write. Improves availability and read performance.

---

### DSA Concepts

**Hash Function**
Takes an input and produces a fixed-size output (hash code). Good hash functions distribute values uniformly and minimize collisions. Used in hash tables.

**Hash Collision**
When two different keys produce the same hash code. Inevitable due to pigeonhole principle (infinite inputs, finite outputs).

**Collision Resolution - Chaining**
Each bucket holds a linked list of all elements with same hash. Simple, handles clustering well. Worst case O(n) if all elements hash to same bucket.

**Collision Resolution - Open Addressing**
Finds next open slot when collision occurs. Methods: linear probing (next slot), quadratic probing (i² slots away), double hashing. Better cache performance than chaining.

**HashMap (Java)**
Hash table implementation. O(1) average for get/put. Uses array of buckets with chaining (linked list, tree for large buckets). Load factor triggers resize.

**HashSet (Java)**
Internally uses HashMap with dummy values. Only keys matter. O(1) for add/remove/contains. Stores unique elements.

**Hash Map Time Complexity**
Average: O(1) for get, put, remove. Worst case: O(n) if all keys collide. With good hash function and proper load factor, typically O(1).

**Load Factor**
Ratio of elements to buckets (size/capacity). Java HashMap defaults to 0.75. Higher = more space efficient but more collisions. Lower = faster but wastes space.

---

## ✅ Day 4 Completion Checklist
- [ ] Node.js: Understand CommonJS vs ES modules
- [ ] JavaScript: Implement debounce/throttle
- [ ] React: Optimize component performance
- [ ] Java: Use Streams API effectively
- [ ] Spring Boot: Manage transactions properly
- [ ] DevOps: Set up basic monitoring
- [ ] GCP: Configure VPC and firewall rules
- [ ] System Design: Design database schema
- [ ] DSA: Solve hashmap problems

---

**Tomorrow:** Day 5 - Security, Testing, State Management, Exception Handling, Validation, Docker Compose, Cloud SQL
