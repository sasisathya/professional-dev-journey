# Day 10 - Performance & Optimization

**Focus:** Performance optimization, caching strategies, CDN, profiling

## 🔗 Quick Links to Concepts
[Node.js](#nodejs-concepts) | [JavaScript](#javascript-concepts) | [React.js](#reactjs-concepts) | [Java](#java-concepts) | [Spring Boot](#spring-boot-concepts) | [DevOps](#devops-concepts) | [Google Cloud](#google-cloud-concepts) | [System Design](#system-design-concepts) | [DSA](#dsa-concepts)

---

## ⏰ 30-Minute Study Blocks

### 1. Node.js (30 min)
**Topic:** Performance Optimization
- Profiling with clinic.js and 0x
- Memory leak detection
- Event loop lag monitoring
- Connection pooling
- Caching strategies (in-memory, Redis)
- PM2 for process management

### 2. JavaScript (30 min)
**Topic:** Browser Performance
- Critical rendering path
- Lazy loading and code splitting
- Tree shaking
- Minification and bundling (Webpack, Vite)
- Web Vitals (LCP, FID, CLS)
- Performance profiling in DevTools

### 3. React.js (30 min)
**Topic:** React Performance Deep Dive
- Profiler API
- React DevTools Profiler
- Virtualization (react-window, react-virtualized)
- Avoiding reconciliation
- Key prop optimization
- Production build optimization

### 4. Java (30 min)
**Topic:** JVM Tuning & Optimization
- Heap memory (Young Gen, Old Gen)
- Garbage collection algorithms (G1GC, ZGC)
- JVM flags and tuning
- Memory profiling with VisualVM
- JIT compilation
- String pool and intern()

### 5. Spring Boot (30 min)
**Topic:** Caching in Spring
- @Cacheable, @CacheEvict, @CachePut
- Cache providers (Caffeine, Redis, Hazelcast)
- Cache configuration
- Cache-aside pattern
- Distributed caching
- Time-to-live (TTL) strategies

### 6. DevOps (30 min)
**Topic:** Performance Testing & Load Testing
- JMeter basics
- k6 for load testing
- Load testing strategies
- Performance metrics (throughput, latency, error rate)
- Stress testing vs load testing
- Baseline establishment

### 7. Google Cloud (30 min)
**Topic:** Cloud CDN & Content Delivery
- Cloud CDN configuration
- Cache modes (USE_ORIGIN_HEADERS, CACHE_ALL_STATIC, FORCE_CACHE_ALL)
- Cache invalidation
- Signed URLs for CDN
- Cloud Load Balancing with CDN
- Edge caching

### 8. System Design (30 min)
**Topic:** Content Delivery Networks
- CDN architecture
- Edge servers and PoPs (Points of Presence)
- Cache headers (Cache-Control, ETag)
- Push vs pull CDN
- Multi-CDN strategies
- Real-world CDN examples (CloudFlare, Akamai)

### 9. DSA (30 min)
**Topic:** Heaps & Priority Queues
- Min heap and max heap
- Heap operations (insert, extract-min, heapify)
- Priority queue implementation
- Problems: Kth Largest Element, Merge K Sorted Lists, Top K Frequent Elements

---

## 📖 Concept Definitions (Interview-Ready)

### Node.js Concepts

**clinic.js**
Performance profiling suite for Node.js with tools for detecting bottlenecks: Clinic Doctor (overview), Clinic Flame (CPU profiling), Clinic Bubbleprof (async operations). Generates visual reports.

**0x (Zero-X)**
Flamegraph profiling tool for Node.js that visualizes CPU usage. Shows function call hierarchy and time spent, helping identify hot paths and optimization opportunities.

**Memory Leak Detection**
Identifying objects not properly garbage collected. Use heap snapshots, compare memory over time, track object retention. Tools: Chrome DevTools, heapdump, memwatch-next.

**Event Loop Lag**
Delay in processing pending callbacks due to blocking operations. Monitor using libraries like event-loop-lag. High lag indicates synchronous operations blocking the event loop.

**Connection Pooling**
Reusing database/HTTP connections instead of creating new ones per request. Improves performance by avoiding connection overhead. Configure pool size based on load and resources.

**Caching Strategies (Node.js)**
In-memory caching (LRU-cache, node-cache) for fast access, Redis for distributed caching. Choose TTL based on data freshness needs. Implement cache invalidation strategies.

**PM2**
Production process manager for Node.js. Handles clustering, auto-restart, load balancing, monitoring, and zero-downtime deployment. Essential for running Node.js in production.

---

### JavaScript Concepts

**Critical Rendering Path**
Sequence of steps browser takes to render page: DOM construction, CSSOM construction, render tree, layout, paint. Optimizing this path improves perceived performance.

**Lazy Loading**
Deferring loading of non-critical resources until needed. Load images when scrolling into view, code split routes. Reduces initial bundle size and improves load time.

**Code Splitting**
Breaking application into smaller chunks loaded on demand. Dynamic imports enable loading code only when needed, reducing initial bundle size significantly.

**Tree Shaking**
Removing unused code during bundling. ES6 modules enable static analysis to eliminate dead code. Webpack and Rollup perform tree shaking in production builds.

**Minification and Bundling**
Minification removes whitespace, comments, shortens variable names. Bundling combines files to reduce HTTP requests. Tools: Webpack, Vite, esbuild optimize for production.

**Web Vitals**
Core metrics for user experience: LCP (Largest Contentful Paint <2.5s), FID (First Input Delay <100ms), CLS (Cumulative Layout Shift <0.1). Google's performance standards.

**Performance Profiling in DevTools**
Chrome DevTools Performance panel records runtime performance, shows frame rates, identifies long tasks, analyzes memory usage. Essential for identifying and fixing bottlenecks.

---

### React.js Concepts

**Profiler API**
React component measuring render performance. Wraps components to track render times and causes. Helps identify expensive renders and optimization opportunities.

**React DevTools Profiler**
Browser extension for profiling React applications. Records render sessions, shows component render times, highlights why components rendered, enables performance analysis.

**Virtualization**
Rendering only visible items in long lists. react-window and react-virtualized render subset of data, dramatically improving performance for large datasets by reducing DOM nodes.

**Avoiding Reconciliation**
Preventing unnecessary re-renders using React.memo, useMemo, useCallback. Skip rendering when props/state unchanged, reducing reconciliation work and improving performance.

**Key Prop Optimization**
Using stable, unique keys for list items. Helps React identify changed/added/removed items efficiently. Avoid using index as key when list order changes.

**Production Build Optimization**
React production build enables optimizations: minification, dead code elimination, PropTypes removal. Significantly smaller bundle size and better performance than development build.

---

### Java Concepts

**Heap Memory**
Divided into Young Generation (Eden, Survivor spaces for new objects) and Old Generation (long-lived objects). Objects promoted from Young to Old based on survival.

**Garbage Collection Algorithms**
G1GC: Low-latency, region-based, balances throughput and pause times (default Java 9+). ZGC: Ultra-low pause times (<10ms), for large heaps. Each suits different use cases.

**JVM Flags and Tuning**
Configure heap size (-Xms, -Xmx), GC algorithm (-XX:+UseG1GC), enable GC logging. Tune based on application characteristics and monitoring data.

**VisualVM**
Profiling tool for monitoring JVM applications. Shows CPU usage, memory consumption, thread activity, performs heap dumps. Helps identify performance issues and memory leaks.

**JIT Compilation**
Just-In-Time compiler optimizes bytecode to native code at runtime. HotSpot identifies frequently executed code ("hot spots") and optimizes them, improving performance over time.

**String Pool and intern()**
String pool stores unique String literals. intern() adds String to pool, returns reference to pooled String. Saves memory but use carefully as pool is in heap/metaspace.

---

### Spring Boot Concepts

**@Cacheable**
Marks methods whose results should be cached. Subsequent calls with same arguments return cached value instead of executing method. Specify cache name and key.

**@CacheEvict**
Removes entries from cache. Use when data becomes stale or needs invalidation. Can clear entire cache or specific entries based on key.

**@CachePut**
Updates cache without interfering with method execution. Always executes method and updates cached value. Useful for update operations where cache must stay current.

**Cache Providers**
Caffeine: High-performance in-memory cache. Redis: Distributed caching for multiple instances. Hazelcast: In-memory data grid with clustering. Choose based on scalability needs.

**Cache-aside Pattern**
Application checks cache before database. Cache miss loads from DB and populates cache. Simple but requires manual cache management and invalidation logic.

**Distributed Caching**
Caching across multiple application instances using shared cache server (Redis, Hazelcast). Ensures consistency and shares cached data, essential for horizontally scaled applications.

**TTL (Time-to-Live) Strategies**
Expiration time for cached entries. Short TTL for frequently changing data, long TTL for static data. Balance between freshness and cache hit ratio.

---

### DevOps Concepts

**JMeter**
Open-source load testing tool for measuring application performance. Simulates multiple users, measures response times, throughput, error rates. Supports HTTP, databases, message queues.

**k6**
Modern load testing tool using JavaScript. Cloud-native, supports scripting complex scenarios, provides clear metrics, integrates with CI/CD. Better developer experience than JMeter.

**Load Testing Strategies**
Gradually increase load to find capacity limits. Test normal load, peak load, stress (beyond capacity), soak (sustained load). Identifies performance degradation points.

**Performance Metrics**
Throughput: Requests per second. Latency: Response time (p50, p95, p99 percentiles). Error rate: Failed requests percentage. Resource utilization: CPU, memory, network.

**Stress Testing vs Load Testing**
Load testing validates performance under expected load. Stress testing pushes system beyond limits to find breaking point. Both identify different failure modes.

**Baseline Establishment**
Initial performance measurements under known conditions. Provides reference for detecting regressions. Rerun after changes to compare and identify performance impact.

---

### Google Cloud Concepts

**Cloud CDN**
Content Delivery Network caching content at Google edge locations worldwide. Reduces latency by serving content from location nearest to users. Integrates with Cloud Load Balancing.

**Cache Modes**
USE_ORIGIN_HEADERS: Respect origin cache headers. CACHE_ALL_STATIC: Cache static content regardless of headers. FORCE_CACHE_ALL: Cache everything including dynamic content (use carefully).

**Cache Invalidation**
Removing stale content from CDN. Methods: URL invalidation (specific paths), cache keys, versioned URLs. Balance between freshness and cache hit ratio.

**Signed URLs for CDN**
Time-limited URLs with cryptographic signature for accessing CDN content. Provides temporary access to private content without making it publicly accessible.

**Cloud Load Balancing with CDN**
Global load balancer distributes traffic and integrates with Cloud CDN. Single anycast IP, automatic failover, SSL termination. Combines routing and caching.

**Edge Caching**
Caching content at network edge (PoPs) close to users. Reduces origin server load, decreases latency. Cloud CDN automatically caches at 100+ edge locations.

---

### System Design Concepts

**CDN Architecture**
Origin server generates content, edge servers cache and serve to users. DNS routes users to nearest edge location. Cache misses fetch from origin and cache for future requests.

**Points of Presence (PoPs)**
Geographically distributed data centers hosting edge servers. More PoPs means lower latency for more users. Major CDNs have hundreds of PoPs worldwide.

**Cache Headers**
Cache-Control: max-age, no-cache, public/private. ETag: Resource version identifier for validation. Expires: Legacy header for expiration. Headers control caching behavior.

**Push vs Pull CDN**
Push: Origin pushes content to CDN proactively (good for infrequently changing content). Pull: CDN fetches on first request (good for frequently changing or large volumes).

**Multi-CDN Strategies**
Using multiple CDN providers for redundancy, performance optimization, cost reduction. DNS-based routing selects optimal CDN. Adds complexity but improves reliability.

**Real-world CDN Examples**
CloudFlare: Security focus, DDoS protection, edge computing. Akamai: Largest network, enterprise focus. Fastly: Real-time purging, developer-friendly. Cloud CDN: GCP integration, global edge network.

---

### DSA Concepts

**Min Heap and Max Heap**
Binary trees where parent is smaller (min heap) or larger (max heap) than children. Root is minimum or maximum. Enables O(1) access to min/max element.

**Heap Operations**
Insert: Add to end, bubble up to maintain property. Extract-min/max: Remove root, move last to root, bubble down. Heapify: Convert array to heap. All O(log n).

**Priority Queue**
Abstract data type where elements have priorities. Implemented using heaps. Supports insert and extract-min/max efficiently. Used in scheduling, graph algorithms.

**Kth Largest Element**
Find kth largest in unsorted array. Use min heap of size k, maintaining k largest elements. Top of heap is kth largest. O(n log k) time.

**Merge K Sorted Lists**
Combine k sorted linked lists into one sorted list. Use min heap with k elements (one from each list). Extract min, add next from same list. O(N log k) time.

**Top K Frequent Elements**
Find k most frequent elements in array. Count frequencies with hashmap, use min heap or bucket sort to find top k. O(n + k log n) time with heap.

---

## ✅ Day 10 Completion Checklist
- [ ] Node.js: Profile application performance
- [ ] JavaScript: Optimize bundle size
- [ ] React: Use Profiler and virtualization
- [ ] Java: Tune JVM parameters
- [ ] Spring Boot: Implement caching
- [ ] DevOps: Run load tests with k6
- [ ] GCP: Configure Cloud CDN
- [ ] System Design: Design CDN strategy
- [ ] DSA: Solve heap problems

---

## 🎉 Week 2 Complete!

You've covered intermediate patterns, microservices, security, and performance optimization.

**Next Week:** Advanced architectures, distributed systems, complex DSA
