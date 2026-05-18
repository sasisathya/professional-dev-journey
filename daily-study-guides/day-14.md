# Day 14 - System Reliability & Advanced Algorithms

**Date:** May 31, 2026
**Focus:** Chaos engineering, reliability, advanced algorithms

---

## 🔗 Quick Links to Concepts
[Node.js](#nodejs-concepts) | [JavaScript](#javascript-concepts) | [React.js](#reactjs-concepts) | [Java](#java-concepts) | [Spring Boot](#spring-boot-concepts) | [DevOps](#devops-concepts) | [Google Cloud](#google-cloud-concepts) | [System Design](#system-design-concepts) | [DSA](#dsa-concepts)

---

## ⏰ 30-Minute Study Blocks

### 1. Node.js (30 min)
**Topic:** Reliability & Error Handling
- Graceful shutdown
- Health checks (liveness, readiness probes)
- Circuit breaker implementation
- Retry with exponential backoff
- Dead letter queues
- Bulkhead pattern

### 2. JavaScript (30 min)
**Topic:** Advanced Functional Programming
- Pure functions and immutability
- Function composition and piping
- Currying and partial application
- Functors and monads (Maybe, Either)
- Ramda.js or Lodash/fp
- Point-free style

### 3. React.js (30 min)
**Topic:** Advanced Rendering Techniques
- Concurrent React features
- useTransition and useDeferredValue
- Streaming SSR
- Selective Hydration
- React Server Components basics
- Islands architecture

### 4. Java (30 min)
**Topic:** Advanced Design Patterns
- Proxy pattern
- Decorator pattern
- Adapter pattern
- Facade pattern
- Flyweight pattern
- Composite pattern

### 5. Spring Boot (30 min)
**Topic:** Advanced Configuration & Profiles
- @ConfigurationProperties
- Spring Profiles
- Externalized configuration
- Property sources hierarchy
- @Conditional annotations
- Feature flags with Spring

### 6. DevOps (30 min)
**Topic:** Chaos Engineering
- Chaos engineering principles
- Chaos Monkey and Simian Army
- Failure injection testing
- Game days and fire drills
- Resilience testing
- Fault tolerance validation

### 7. Google Cloud (30 min)
**Topic:** Cloud Monitoring & Logging
- Cloud Monitoring (formerly Stackdriver)
- Custom metrics and dashboards
- Uptime checks
- Alerting policies
- Cloud Logging
- Log-based metrics

### 8. System Design (30 min)
**Topic:** High Availability & Disaster Recovery
- Redundancy and failover
- Active-active vs active-passive
- RPO (Recovery Point Objective) and RTO (Recovery Time Objective)
- Multi-region architecture
- Data replication strategies
- Disaster recovery planning

### 9. DSA (30 min)
**Topic:** Advanced Dynamic Programming
- 2D DP problems
- Problems: Longest Common Subsequence, Edit Distance, Unique Paths, Minimum Path Sum
- State compression techniques
- DP optimization tricks

---

## 📖 Concept Definitions (Interview-Ready)

### Node.js Concepts

**Graceful Shutdown**
Properly closing connections and completing in-flight requests before terminating a process. Listen for SIGTERM/SIGINT signals, stop accepting new requests, finish pending work, close database connections, then exit. Prevents data loss and connection errors.

**Health Checks**
Endpoints that report service status for orchestrators like Kubernetes. Liveness probe: is the app running? (restart if fails). Readiness probe: can the app handle traffic? (remove from load balancer if fails). Include dependency checks (database, external APIs).

**Circuit Breaker Pattern**
Prevents cascading failures by stopping requests to failing services. States: Closed (normal), Open (failing, reject requests immediately), Half-Open (test recovery). Libraries: opossum, cockatiel. Improves resilience and prevents resource exhaustion.

**Retry with Exponential Backoff**
Automatically retrying failed operations with increasing delays between attempts. Example: 1s, 2s, 4s, 8s. Includes jitter (randomization) to prevent thundering herd. Libraries like retry or p-retry implement this pattern.

**Dead Letter Queue (DLQ)**
A queue for messages that can't be processed after multiple retry attempts. Prevents poison messages from blocking queue, enables debugging failed messages, and maintains system throughput. Supported by RabbitMQ, AWS SQS, Azure Service Bus.

**Bulkhead Pattern**
Isolating resources to prevent failures from spreading. Example: separate thread pools for different operations, connection pools per service, or rate limiters per API. Named after ship compartments that prevent total flooding.

---

### JavaScript Concepts

**Pure Functions**
Functions with no side effects that return the same output for the same input. Don't modify external state, don't mutate arguments, don't perform I/O. Easier to test, reason about, and parallelize.

**Immutability**
Data that cannot be changed after creation. Create new objects instead of modifying existing ones. Benefits: predictable state, easier debugging, enables time-travel debugging. Use Object.freeze(), spread operators, or libraries like Immer.

**Function Composition**
Combining simple functions to build complex operations. `compose(f, g, h)(x)` executes `f(g(h(x)))`. Creates reusable, declarative pipelines. Libraries like Ramda and Lodash/fp provide compose and pipe utilities.

**Currying**
Transforming a function with multiple arguments into a sequence of functions each taking a single argument. `f(a, b, c)` becomes `f(a)(b)(c)`. Enables partial application and more flexible function reuse.

**Partial Application**
Creating a new function by fixing some arguments of an existing function. Example: `const add5 = add(5)` creates a function that adds 5 to its argument. Enables code reuse and function specialization.

**Functors and Monads**
Functors: Objects that can be mapped over (arrays, Maybe, Either). Monads: Functors with flatMap (chain) to avoid nested structures. Maybe monad handles null/undefined; Either monad handles errors functionally.

**Point-Free Style**
Writing functions without explicitly mentioning arguments. Focus on composition rather than data. Example: `const sum = reduce(add, 0)` instead of `const sum = arr => reduce(add, 0, arr)`. Requires good function naming.

---

### React.js Concepts

**Concurrent React**
A set of features that allow React to work on multiple state updates simultaneously and interrupt lower-priority work. Improves responsiveness by prioritizing urgent updates (user input) over less urgent ones (data fetching).

**useTransition**
A hook that marks state updates as non-urgent (transitions). React can interrupt transition updates for more urgent work. Returns `[isPending, startTransition]`. Use for navigation, filtering, or heavy computations.

**useDeferredValue**
A hook that defers updating a value to prioritize more urgent updates. Similar to debouncing but integrated with React's rendering. Useful for expensive rendering (large lists, complex charts) that shouldn't block user input.

**Streaming SSR (Server-Side Rendering)**
Sending HTML to the client in chunks as components render, rather than waiting for complete page. Uses React 18's renderToPipeableStream. Improves Time To First Byte (TTFB) and perceived performance.

**Selective Hydration**
React 18 feature allowing parts of the page to become interactive before full JavaScript loads. Prioritizes user interactions, hydrating the clicked component first. Improves Time To Interactive (TTI).

**React Server Components**
Components that run only on the server, reducing client bundle size. Can directly access databases, file system, or APIs without exposing credentials. Send data (not code) to client. Still experimental but powerful for performance.

**Islands Architecture**
Rendering static content with interactive "islands" of JavaScript. Server-renders most of the page, hydrates only interactive components. Reduces JavaScript bundle size and improves performance. Implemented by frameworks like Astro.

---

### Java Concepts

**Proxy Pattern**
Provides a surrogate or placeholder to control access to another object. Types: Virtual proxy (lazy loading), Protection proxy (access control), Remote proxy (represents remote object). Used in JPA lazy loading and RMI.

**Decorator Pattern**
Dynamically adds responsibilities to objects without modifying their structure. Wraps an object with additional functionality. Example: Java I/O streams (BufferedReader wraps FileReader). Favors composition over inheritance.

**Adapter Pattern**
Converts an interface into another interface clients expect. Allows incompatible interfaces to work together. Example: adapting legacy code to new API, or wrapping third-party libraries with your interface.

**Facade Pattern**
Provides a simplified interface to a complex subsystem. Hides complexity and dependencies from clients. Example: a single method that coordinates multiple services, or a high-level API for a library.

**Flyweight Pattern**
Shares common state among multiple objects to reduce memory usage. Separates intrinsic state (shared) from extrinsic state (unique). Example: String interning, cached Integer objects (-128 to 127).

**Composite Pattern**
Composes objects into tree structures to represent part-whole hierarchies. Treats individual objects and compositions uniformly. Example: file system (files and folders), UI components (containers and controls).

---

### Spring Boot Concepts

**@ConfigurationProperties**
Type-safe configuration binding. Maps properties from application.yml/properties to a POJO. Supports validation, nested properties, and collections. Better than @Value for structured configuration.

**Spring Profiles**
Environment-specific configurations (dev, test, prod). Activate with spring.profiles.active. Conditional bean registration with @Profile. Load profile-specific properties files (application-dev.yml).

**Externalized Configuration**
Loading configuration from external sources (environment variables, config files, command-line arguments, config server). Spring Boot loads from multiple sources with defined precedence. Enables environment-specific settings without code changes.

**Property Sources Hierarchy**
Spring Boot loads properties in order: command-line args > SPRING_APPLICATION_JSON > environment variables > application.properties > @PropertySource > defaults. Higher priority sources override lower ones.

**@Conditional Annotations**
Control bean registration based on conditions. @ConditionalOnProperty (property exists), @ConditionalOnClass (class in classpath), @ConditionalOnMissingBean (bean not defined). Enables dynamic configuration.

**Feature Flags**
Toggles that enable/disable features without deployment. Implement with Spring profiles, @ConditionalOnProperty, or libraries like Togglz/Unleash. Enables A/B testing, gradual rollouts, and kill switches.

---

### DevOps Concepts

**Chaos Engineering**
Discipline of experimenting on systems to build confidence in their ability to withstand turbulent conditions. Intentionally inject failures to discover weaknesses before they cause outages.

**Chaos Monkey**
Netflix's tool that randomly terminates production instances to ensure services can tolerate instance failures. Part of the Simian Army suite. Forces engineers to build resilient systems.

**Simian Army**
Netflix's suite of chaos tools: Chaos Monkey (instances), Chaos Gorilla (availability zones), Latency Monkey (network delays), Conformity Monkey (best practices), Security Monkey (security violations).

**Failure Injection Testing**
Deliberately introducing faults (network partitions, latency, resource exhaustion) to test system resilience. Tools: Chaos Monkey, Gremlin, LitmusChaos. Validates failure recovery mechanisms.

**Game Days**
Scheduled chaos engineering exercises where teams simulate failures in production-like environments. Practice incident response, validate runbooks, and identify gaps in monitoring/alerting.

**Resilience Testing**
Verifying system behavior under adverse conditions: high load, network failures, dependency outages, resource constraints. Ensures graceful degradation, not catastrophic failure.

**Fault Tolerance Validation**
Testing that redundancy, retries, circuit breakers, and fallbacks work as designed. Simulates component failures to ensure system continues functioning with degraded performance.

---

### Google Cloud Concepts

**Cloud Monitoring (formerly Stackdriver)**
Google Cloud's monitoring service for collecting metrics, logs, and traces. Provides dashboards, alerting, and uptime checks. Integrates with GCP services and third-party tools.

**Custom Metrics**
User-defined metrics sent to Cloud Monitoring via API. Track business metrics (orders/sec), application metrics (cache hit rate), or custom SLIs. Use client libraries or OpenTelemetry.

**Dashboards**
Visual representations of metrics and logs. Cloud Monitoring provides pre-built dashboards for GCP services and custom dashboard builder. Display charts, gauges, and tables.

**Uptime Checks**
Synthetic monitoring that periodically tests service availability from multiple locations. HTTP(S), TCP, and custom checks. Alerts when service is unreachable or responds incorrectly.

**Alerting Policies**
Conditions that trigger notifications when metrics violate thresholds. Define conditions, notification channels (email, PagerDuty, Slack), and documentation. Essential for proactive incident response.

**Cloud Logging**
Centralized log management service. Collects logs from GCP services, applications, and VMs. Supports structured logging, log-based metrics, log sinks (export to BigQuery, Cloud Storage), and retention policies.

**Log-Based Metrics**
Metrics extracted from log entries. Count log messages matching criteria or extract numeric values. Use for monitoring application-specific events not available as standard metrics.

---

### System Design Concepts

**Redundancy**
Having backup components (servers, databases, networks) to prevent single points of failure. Types: active-active (all handle traffic), active-passive (standby takes over on failure). Critical for high availability.

**Failover**
Automatic switching to redundant system when primary fails. Requires health monitoring, automated decision-making, and state synchronization. Minimize failover time (RTO) and data loss (RPO).

**Active-Active Architecture**
All instances actively handle traffic simultaneously. Load balanced across instances. Provides better resource utilization and no failover delay. Requires data synchronization and conflict resolution.

**Active-Passive Architecture**
Primary handles traffic; passive standby remains idle. On failure, traffic switches to passive. Simpler than active-active but wastes resources. Common for databases with replication.

**RPO (Recovery Point Objective)**
Maximum acceptable data loss measured in time. How much data can you afford to lose? Determines backup frequency. Example: RPO of 1 hour requires backups at least every hour.

**RTO (Recovery Time Objective)**
Maximum acceptable downtime. How quickly must you recover? Influences architecture decisions (hot standby vs cold backup). Lower RTO requires more investment in redundancy and automation.

**Multi-Region Architecture**
Deploying systems across multiple geographic regions. Improves disaster recovery (region failure), reduces latency (users connect to nearest region), and handles compliance (data residency). Challenges: data consistency, increased cost.

**Data Replication Strategies**
Synchronous: Wait for all replicas to confirm (consistent, slower writes). Asynchronous: Don't wait for replicas (faster, risk of data loss). Semi-synchronous: Wait for subset of replicas (balanced approach).

**Disaster Recovery Planning**
Documented procedures for recovering from catastrophic failures. Includes backup strategies, failover procedures, communication plans, and regular testing. Categories: backup/restore, pilot light, warm standby, hot standby.

---

### DSA Concepts

**2D Dynamic Programming**
DP problems with two-dimensional state space. State often represented as dp[i][j] where i and j are problem-specific dimensions. Common in grid problems, string matching, and game theory.

**Longest Common Subsequence (LCS)**
Finding the longest subsequence common to two sequences. Not necessarily contiguous. dp[i][j] = LCS of first i characters of X and first j characters of Y. O(m*n) time and space.

**Edit Distance (Levenshtein Distance)**
Minimum operations (insert, delete, replace) to transform one string to another. dp[i][j] represents edit distance between first i chars of s1 and first j chars of s2. Used in spell checkers and diff tools.

**Unique Paths**
Count paths in a grid from top-left to bottom-right moving only right or down. dp[i][j] = number of paths to reach cell (i,j). dp[i][j] = dp[i-1][j] + dp[i][j-1]. O(m*n) solution.

**Minimum Path Sum**
Find path from top-left to bottom-right in grid with minimum sum. dp[i][j] = minimum sum to reach (i,j). dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1]).

**State Compression**
Optimizing DP space complexity by observing that current state depends only on recent states. Reduce 2D DP to 1D by keeping only current and previous row. Or use rolling array technique.

**DP Optimization Tricks**
Memoization vs tabulation, state compression, space optimization (only store needed states), precomputation, and recognizing patterns (Fibonacci, knapsack, LIS). Understanding state transitions is key.

---

## ✅ Day 14 Completion Checklist
- [ ] Node.js: Implement graceful shutdown
- [ ] JavaScript: Apply functional programming
- [ ] React: Understand concurrent features
- [ ] Java: Implement structural patterns
- [ ] Spring Boot: Use profiles effectively
- [ ] DevOps: Understand chaos engineering
- [ ] GCP: Set up monitoring and alerts
- [ ] System Design: Design HA system
- [ ] DSA: Solve 2D DP problems

---

**Tomorrow:** Day 15 - Search algorithms, ML basics, Cloud AI, Week 3 Review
