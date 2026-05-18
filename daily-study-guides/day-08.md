# Day 8 - Observability & Advanced Patterns

**Date:** May 25, 2026
**Focus:** Observability, concurrency, resilience patterns

## 🔗 Quick Links to Concepts
[Node.js](#nodejs-concepts) | [JavaScript](#javascript-concepts) | [React.js](#reactjs-concepts) | [Java](#java-concepts) | [Spring Boot](#spring-boot-concepts) | [DevOps](#devops-concepts) | [Google Cloud](#google-cloud-concepts) | [System Design](#system-design-concepts) | [DSA](#dsa-concepts)

---

## ⏰ 30-Minute Study Blocks

### 1. Node.js (30 min)
**Topic:** Observability & APM
- Winston and Pino for logging
- Morgan for HTTP logging
- New Relic, DataDog integration
- Structured logging
- Correlation IDs for distributed tracing
- Health check endpoints

### 2. JavaScript (30 min)
**Topic:** Web APIs & Browser Features
- Fetch API and AbortController
- Web Workers
- Service Workers and PWA
- LocalStorage vs SessionStorage vs IndexedDB
- Intersection Observer
- Mutation Observer

### 3. React.js (30 min)
**Topic:** Server-Side Rendering (SSR)
- Next.js fundamentals
- getServerSideProps vs getStaticProps
- Static Site Generation (SSG)
- Incremental Static Regeneration (ISR)
- Client-side vs server-side rendering trade-offs

### 4. Java (30 min)
**Topic:** Concurrency & Multithreading
- Thread lifecycle
- Runnable vs Callable
- ExecutorService and thread pools
- synchronized keyword
- volatile, atomic variables
- Deadlocks and race conditions

### 5. Spring Boot (30 min)
**Topic:** Resilience Patterns
- Circuit breaker pattern (Resilience4j)
- Retry mechanisms
- Rate limiting
- Bulkhead pattern
- Timeout handling
- Fallback strategies

### 6. DevOps (30 min)
**Topic:** GitOps & Deployment Strategies
- GitOps principles (ArgoCD, Flux)
- Blue-green deployment
- Canary deployment
- Rolling updates
- Feature flags
- Rollback strategies

### 7. Google Cloud (30 min)
**Topic:** Cloud Run (Containers as a Service)
- Cloud Run vs Cloud Functions vs GKE
- Container deployment to Cloud Run
- Auto-scaling
- Request-based pricing
- Traffic splitting
- Service-to-service authentication

### 8. System Design (30 min)
**Topic:** Rate Limiting & Throttling
- Token bucket algorithm
- Leaky bucket algorithm
- Fixed window vs sliding window
- Distributed rate limiting
- API gateway rate limiting
- Per-user vs global limits

### 9. DSA (30 min)
**Topic:** Dynamic Programming Introduction
- Overlapping subproblems
- Optimal substructure
- Memoization vs tabulation
- 1D DP: Fibonacci, climbing stairs
- Problems: House Robber, Coin Change

---

## 📖 Concept Definitions (Interview-Ready)

### Node.js Concepts

**Winston**
A popular logging library for Node.js offering multiple transports (console, file, HTTP), log levels, and formatting options. Supports structured logging with metadata for better debugging and monitoring.

**Pino**
A fast, low-overhead logging library optimized for performance. Uses JSON logging by default and minimizes synchronous operations, making it ideal for high-throughput production applications.

**Morgan**
HTTP request logger middleware for Node.js/Express. Logs request method, URL, status code, response time, and more. Configurable formats from minimal to detailed for request tracking.

**APM (Application Performance Monitoring)**
Tools that monitor application health, performance metrics, and errors in production. New Relic and DataDog track response times, throughput, errors, and resource usage.

**Structured Logging**
Logging in a consistent, machine-readable format (typically JSON) with key-value pairs. Enables efficient searching, filtering, and analysis in log aggregation systems.

**Correlation IDs**
Unique identifiers passed through all services in a request flow. Enables tracing a single user request across multiple services and logs in distributed systems.

**Health Check Endpoints**
API endpoints (e.g., /health, /ready) that report application status. Used by load balancers and orchestrators to determine if a service instance is functioning properly.

---

### JavaScript Concepts

**Fetch API**
Modern browser API for making HTTP requests, replacing XMLHttpRequest. Returns Promises, supports streaming responses, and provides cleaner syntax than older methods.

**AbortController**
API for canceling fetch requests and other asynchronous operations. Creates a signal that can abort operations when needed, preventing unnecessary work and memory leaks.

**Web Workers**
JavaScript running in background threads, separate from main thread. Enables parallel processing for CPU-intensive tasks without blocking UI, communicating via message passing.

**Service Workers**
Scripts that run in background, intercepting network requests. Enable offline functionality, push notifications, and background sync. Foundation for Progressive Web Apps (PWA).

**LocalStorage vs SessionStorage vs IndexedDB**
LocalStorage: persists data permanently, 5-10MB limit. SessionStorage: cleared on tab close, same size. IndexedDB: large object database with transactions, supports complex queries and larger storage.

**Intersection Observer**
API that asynchronously observes changes in element visibility within viewport or ancestor. Efficient for lazy loading images, infinite scroll, and tracking element visibility without scroll listeners.

**Mutation Observer**
Watches for DOM changes (additions, removals, attribute changes) and executes callbacks. More efficient than deprecated mutation events for detecting and reacting to DOM modifications.

---

### React.js Concepts

**Next.js**
A React framework for production featuring server-side rendering, static site generation, API routes, and automatic code splitting. Simplifies building performant, SEO-friendly React applications.

**getServerSideProps**
Next.js function that runs on server for every request. Fetches data at request time and passes as props to page component. Best for dynamic data that changes frequently.

**getStaticProps**
Runs at build time to fetch data and generate static HTML. Pages are pre-rendered and served as static files. Ideal for content that doesn't change often, maximizing performance.

**Static Site Generation (SSG)**
Pre-rendering pages at build time into static HTML. Results in fastest possible page loads since HTML is ready to serve. Best for content that rarely changes.

**Incremental Static Regeneration (ISR)**
Next.js feature allowing static pages to be updated after build without full rebuild. Regenerates pages in background based on revalidation period, balancing static performance with fresh content.

**SSR vs CSR Trade-offs**
SSR: Better SEO, faster initial load, but slower navigation and higher server load. CSR: Richer interactivity, faster subsequent navigation, but slower initial load and SEO challenges.

---

### Java Concepts

**Thread Lifecycle**
States: New (created but not started), Runnable (eligible to run), Running (executing), Blocked (waiting for lock), Waiting (waiting indefinitely), Timed Waiting (waiting with timeout), Terminated (completed).

**Runnable vs Callable**
Runnable: Functional interface with `run()` method, returns void, cannot throw checked exceptions. Callable: Returns a result via `call()` method and can throw exceptions. Used with ExecutorService.

**ExecutorService**
Framework for managing thread pools and executing asynchronous tasks. Provides methods like `submit()`, `invokeAll()`, handles thread lifecycle, and enables thread reuse for better performance.

**synchronized Keyword**
Ensures only one thread can execute a synchronized method/block at a time. Acquires intrinsic lock on object/class, preventing race conditions but can cause contention.

**volatile and Atomic Variables**
volatile: Ensures variable reads/writes go to main memory, guarantees visibility but not atomicity. Atomic classes (AtomicInteger): Provide lock-free thread-safe operations using CAS (Compare-And-Swap).

**Deadlocks and Race Conditions**
Deadlock: Two+ threads waiting for each other's locks forever. Race condition: Multiple threads accessing shared data, outcome depends on execution order. Both require careful synchronization design.

---

### Spring Boot Concepts

**Circuit Breaker Pattern**
Prevents cascading failures by stopping requests to failing services. States: Closed (normal), Open (failing, reject requests), Half-Open (testing recovery). Resilience4j implements this pattern.

**Retry Mechanisms**
Automatically retry failed operations with configurable attempts, delays, and backoff strategies. Helps handle transient failures but requires careful configuration to avoid overwhelming failing services.

**Rate Limiting (Resilience)**
Controls request rate to prevent overloading services. Protects resources from traffic spikes and ensures fair usage. Configurable per user/service with different algorithms.

**Bulkhead Pattern**
Isolates resources (thread pools, connections) for different operations. Prevents one failing component from exhausting all resources, limiting failure blast radius.

**Timeout Handling**
Setting maximum time to wait for operation completion. Prevents indefinite waiting, releases resources quickly, and enables faster failure detection and recovery.

**Fallback Strategies**
Alternative actions when primary operation fails: return cached data, default value, or degraded functionality. Maintains partial service availability during failures.

---

### DevOps Concepts

**GitOps**
Using Git as single source of truth for declarative infrastructure and applications. Changes are made via pull requests, and systems automatically sync to match Git state.

**ArgoCD and Flux**
GitOps tools for Kubernetes. Monitor Git repos and automatically apply changes to clusters. ArgoCD offers UI and CLI; Flux is more lightweight and CLI-focused.

**Blue-Green Deployment**
Two identical environments (blue=current, green=new). Deploy to green, test, then switch traffic. Enables instant rollback by switching back to blue.

**Canary Deployment**
Gradually rolling out changes to small percentage of users before full deployment. Monitor metrics, increase traffic if healthy, rollback if issues detected.

**Rolling Updates**
Incrementally replacing old instances with new ones. Maintains availability during deployment by ensuring some instances are always running. Kubernetes default strategy.

**Feature Flags**
Code switches that enable/disable features without deploying. Allows testing in production, gradual rollouts, and instant feature disable if issues arise.

**Rollback Strategies**
Methods to revert to previous version: redeploy old version, blue-green switch, database migration reversals. Critical safety mechanism for failed deployments.

---

### Google Cloud Concepts

**Cloud Run**
Fully managed container platform that automatically scales containers from zero. Serverless, pay-per-request pricing. Built on Knative, supporting any language or library.

**Cloud Run vs Cloud Functions vs GKE**
Functions: Event-driven, single-purpose functions. Cloud Run: Containerized apps, more flexibility. GKE: Full Kubernetes control, complex workloads. Choose based on complexity and control needs.

**Container Deployment to Cloud Run**
Build container image, push to Container Registry/Artifact Registry, deploy using gcloud or console. Cloud Run handles HTTPS, certificates, scaling, and load balancing automatically.

**Auto-scaling (Cloud Run)**
Automatically adjusts instances based on incoming requests. Scales to zero when idle, scales up under load. Configurable min/max instances and concurrency per instance.

**Request-based Pricing**
Pay only for actual request processing time (CPU, memory, requests). No charges when idle. Cost calculated by request count and resources consumed during processing.

**Traffic Splitting (Cloud Run)**
Route percentage of traffic to different revisions. Enables canary deployments, A/B testing, and gradual rollouts. Tag-based routing for testing specific versions.

**Service-to-Service Authentication**
Cloud Run services authenticate using service accounts and Google-managed tokens. Verifies caller identity before processing requests, securing internal communication.

---

### System Design Concepts

**Token Bucket Algorithm**
Rate limiting algorithm with bucket holding tokens. Each request consumes a token; tokens refill at fixed rate. Allows bursts up to bucket capacity while controlling average rate.

**Leaky Bucket Algorithm**
Requests enter bucket and leak out at constant rate. If bucket overflows, requests are rejected. Smooths traffic spikes and enforces strict rate limits.

**Fixed Window vs Sliding Window**
Fixed window: Counts requests per fixed time period, can allow burst at window edges. Sliding window: Continuously tracks requests in rolling time period, more accurate but complex.

**Distributed Rate Limiting**
Rate limiting across multiple servers requires shared state (Redis, database). Challenges include consistency, latency, and synchronization across distributed systems.

**API Gateway Rate Limiting**
Centralized rate limiting at API gateway before requests reach backend services. Simplifies implementation, provides consistent enforcement, and protects multiple services.

**Per-user vs Global Limits**
Per-user: Limits per individual user/API key, ensures fairness. Global: Total system capacity limit. Often use both: global for overall protection, per-user for fairness.

---

### DSA Concepts

**Overlapping Subproblems**
A problem can be broken into subproblems that are reused multiple times. Key characteristic enabling dynamic programming by caching solutions to avoid redundant computation.

**Optimal Substructure**
Optimal solution contains optimal solutions to subproblems. Enables building solution bottom-up from subproblem solutions. Required property for dynamic programming and greedy algorithms.

**Memoization vs Tabulation**
Memoization: Top-down approach, caches recursion results in hash map. Tabulation: Bottom-up approach, fills table iteratively. Memoization is recursive; tabulation is iterative.

**1D Dynamic Programming**
DP problems with single-dimension state (usually index or amount). Examples: Fibonacci (index), coin change (amount). Table is 1D array storing subproblem solutions.

**Fibonacci with DP**
Classic DP example: fib(n) = fib(n-1) + fib(n-2). Without DP: O(2^n). With memoization/tabulation: O(n) time, O(n) space. Can optimize to O(1) space.

**House Robber Problem**
Cannot rob adjacent houses. DP tracks max money at each house: either rob current + dp[i-2] or skip and take dp[i-1]. O(n) time, O(1) space possible.

**Coin Change Problem**
Minimum coins to make amount. DP builds solution for each amount from 1 to target. For each amount, try all coins and take minimum. O(amount * coins) time.

---

## ✅ Day 8 Completion Checklist
- [ ] Node.js: Add structured logging
- [ ] JavaScript: Implement Web Workers
- [ ] React: Create Next.js app
- [ ] Java: Work with ExecutorService
- [ ] Spring Boot: Implement circuit breaker
- [ ] DevOps: Understand GitOps workflow
- [ ] GCP: Deploy to Cloud Run
- [ ] System Design: Implement rate limiting
- [ ] DSA: Solve basic DP problems

---

**Tomorrow:** Day 9 - Security hardening, Testing strategies, Authentication
