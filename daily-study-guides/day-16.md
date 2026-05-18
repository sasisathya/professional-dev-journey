# Day 16 - Distributed Systems & Consensus

**Date:** June 2, 2026
**Focus:** Distributed consensus, coordination, expert-level patterns

---

## 🔗 Quick Links to Concepts
[Node.js](#nodejs-concepts) | [JavaScript](#javascript-concepts) | [React.js](#reactjs-concepts) | [Java](#java-concepts) | [Spring Boot](#spring-boot-concepts) | [DevOps](#devops-concepts) | [Google Cloud](#google-cloud-concepts) | [System Design](#system-design-concepts) | [DSA](#dsa-concepts)

---

## ⏰ 30-Minute Study Blocks

### 1. Node.js (30 min)
**Topic:** Distributed Systems in Node.js
- Distributed locks (Redis-based)
- Leader election
- Distributed caching
- Session management in distributed systems
- Sticky sessions vs session replication
- Node.js clustering best practices

### 2. JavaScript (30 min)
**Topic:** WebAssembly (WASM)
- WebAssembly basics
- Use cases for WASM
- Compiling C/C++/Rust to WASM
- WASM modules in JavaScript
- Performance comparisons
- AssemblyScript

### 3. React.js (30 min)
**Topic:** Advanced State Machines
- Finite state machines in React
- XState deep dive
- Modeling complex UI flows
- Actor model
- Visualizing state machines
- Testing state machines

### 4. Java (30 min)
**Topic:** Advanced JVM Internals
- Class loading mechanism
- Bytecode and JVM instructions
- Method area, stack, heap
- JIT compilation and optimization
- Garbage collection tuning
- JVM flags for production

### 5. Spring Boot (30 min)
**Topic:** Distributed Tracing Deep Dive
- Spring Cloud Sleuth configuration
- Zipkin integration
- Baggage propagation
- Custom spans and tags
- Sampling strategies
- Distributed context propagation

### 6. DevOps (30 min)
**Topic:** Advanced CI/CD Patterns
- Pipeline optimization
- Matrix builds and parallel execution
- Artifact management
- Deployment gates and approvals
- Progressive delivery
- Feature flag integration in pipelines

### 7. Google Cloud (30 min)
**Topic:** Advanced GKE & Service Mesh
- Istio on GKE
- Traffic management (A/B testing, canary)
- mTLS between services
- Observability with Istio
- Policy enforcement
- Multi-cluster service mesh

### 8. System Design (30 min)
**Topic:** Distributed Consensus Algorithms
- Paxos algorithm
- Raft consensus
- Zookeeper and coordination services
- Distributed locks
- Split-brain problem
- Quorum-based systems

### 9. DSA (30 min)
**Topic:** Advanced Tree Algorithms
- Segment trees
- Binary Indexed Tree (Fenwick Tree)
- Range queries
- Problems: Range Sum Query, Count of Smaller Numbers

---

## 📖 Concept Definitions (Interview-Ready)

### Node.js Concepts

**Distributed Locks**
A synchronization mechanism that prevents multiple processes or nodes from accessing a shared resource simultaneously. In Node.js, typically implemented using Redis with operations like SETNX and expiration to ensure atomic lock acquisition and automatic release.

**Leader Election**
The process of selecting one node from a group to coordinate activities or make decisions for the cluster. Used in distributed systems to avoid split-brain scenarios and ensure consistent decision-making.

**Distributed Caching**
Storing frequently accessed data across multiple cache servers to reduce database load and improve response times. Redis or Memcached clusters are commonly used, with strategies like consistent hashing for key distribution.

**Session Management in Distributed Systems**
Managing user sessions across multiple server instances. Options include centralized session storage (Redis/database), sticky sessions (routing user to same server), or stateless tokens (JWT).

**Sticky Sessions**
Load balancer configuration that routes all requests from a user to the same server instance. Simpler but can cause uneven load distribution and session loss if server fails.

**Session Replication**
Copying session data across all server instances so any server can handle any request. Increases reliability but adds network overhead and latency.

**Node.js Clustering**
Running multiple Node.js processes (workers) to utilize all CPU cores. The cluster module creates child processes that share the same server port, with the master process distributing connections.

---

### JavaScript Concepts

**WebAssembly (WASM)**
A binary instruction format that runs at near-native speed in web browsers. Allows languages like C, C++, and Rust to be compiled to run on the web, complementing JavaScript for performance-critical tasks.

**WASM Use Cases**
Computationally intensive tasks like image/video processing, gaming engines, cryptography, scientific simulations, and porting existing native applications to the web.

**WASM Modules**
Compiled WASM code that can be loaded and executed in JavaScript. Modules expose functions that JavaScript can call, and can import JavaScript functions for browser API access.

**AssemblyScript**
A TypeScript-like language that compiles to WebAssembly. Provides a familiar syntax for JavaScript developers to write WASM without learning C++ or Rust.

---

### React.js Concepts

**Finite State Machines (FSM)**
A computational model with a fixed set of states, transitions between states triggered by events, and only one active state at a time. Makes complex UI logic predictable and testable.

**XState**
A JavaScript library for creating, interpreting, and executing state machines and statecharts. Provides visualization tools and makes component state management declarative and type-safe.

**Actor Model**
A concurrent computation model where "actors" are independent entities that communicate via messages. XState implements this pattern, allowing hierarchical state machines to communicate.

**State Machine Visualization**
Graphical representation of states, transitions, and events in a state machine. XState provides tools to visualize and debug complex state flows, improving development and documentation.

---

### Java Concepts

**Class Loading Mechanism**
The process by which JVM loads classes into memory on demand. Three phases: loading (reads .class file), linking (verification, preparation, resolution), and initialization (executes static initializers).

**Bytecode**
Platform-independent intermediate code (.class files) that Java source code compiles to. JVM interprets or JIT-compiles bytecode to native machine code for execution.

**JVM Memory Structure**
Method Area (class metadata, static variables), Heap (objects and arrays), Stack (method frames, local variables), PC Register (current instruction), Native Method Stack (native code).

**JIT Compilation**
Just-In-Time compilation converts frequently executed bytecode ("hot spots") into native machine code during runtime. Optimizes performance by avoiding repeated interpretation while maintaining portability.

**Garbage Collection Tuning**
Adjusting GC parameters to optimize application performance. Involves selecting appropriate GC algorithm (Serial, Parallel, G1, ZGC), heap sizing, and generation ratios based on application characteristics.

**JVM Production Flags**
Key flags for production: -Xms/-Xmx (heap size), -XX:+UseG1GC (GC algorithm), -XX:MaxGCPauseMillis (pause goal), -XX:+HeapDumpOnOutOfMemoryError (debugging), -XX:+PrintGCDetails (monitoring).

---

### Spring Boot Concepts

**Spring Cloud Sleuth**
Distributed tracing solution that adds trace and span IDs to logs and propagates them across service boundaries. Integrates with Zipkin and other tracing systems for request flow visualization.

**Zipkin Integration**
Zipkin is a distributed tracing system that visualizes request flows across microservices. Spring Cloud Sleuth can send trace data to Zipkin for analysis and troubleshooting.

**Baggage Propagation**
Mechanism to carry custom key-value pairs (baggage) across service boundaries with trace context. Used for passing business identifiers or metadata throughout distributed operations.

**Custom Spans**
User-defined trace segments that represent specific operations or code blocks. Created to add granularity to traces beyond automatic HTTP/messaging instrumentation for better observability.

**Sampling Strategies**
Techniques to control which requests get traced to reduce overhead and storage. Strategies include probability-based (trace X% of requests), rate-limiting, or custom business-logic-based sampling.

**Distributed Context Propagation**
Passing trace context (trace ID, span ID, baggage) across process and network boundaries. Typically uses HTTP headers or message properties to maintain request correlation in distributed systems.

---

### DevOps Concepts

**Pipeline Optimization**
Improving CI/CD pipeline speed and efficiency through parallelization, caching dependencies, optimizing build steps, using smaller Docker images, and eliminating unnecessary stages.

**Matrix Builds**
Running the same job with different parameters/configurations in parallel. Examples: testing across multiple OS versions, language versions, or browser types simultaneously.

**Artifact Management**
Storing and versioning build outputs (JARs, Docker images, binaries) in repositories like Artifactory, Nexus, or cloud storage. Ensures reproducible deployments and dependency management.

**Deployment Gates**
Manual or automated approvals required before proceeding to next pipeline stage. Used for production deployments to ensure quality checks, security scans, or stakeholder approval.

**Progressive Delivery**
Gradually rolling out changes to reduce risk: canary deployments (small percentage first), blue-green (parallel environments), feature flags (toggle features on/off).

**Feature Flag Integration**
Using feature toggles in CI/CD to deploy code with features disabled, then enable them selectively. Decouples deployment from release, enabling testing in production and quick rollback.

---

### Google Cloud Concepts

**Istio**
An open-source service mesh that provides traffic management, security, and observability for microservices. Runs on Kubernetes/GKE and uses sidecar proxies (Envoy) injected into each pod.

**Service Mesh**
Infrastructure layer that handles service-to-service communication with features like load balancing, service discovery, encryption, authentication, and monitoring without changing application code.

**Istio Traffic Management**
Controlling traffic flow between services using virtual services and destination rules. Enables A/B testing (route % to different versions), canary releases, and fault injection for resilience testing.

**mTLS (Mutual TLS)**
Both client and server authenticate each other using certificates. Istio automates mTLS between services, encrypting all inter-service communication and verifying service identities.

**Istio Observability**
Built-in metrics, logs, and traces for service mesh traffic. Integrates with Prometheus (metrics), Grafana (dashboards), Jaeger/Zipkin (tracing), and Kiali (visualization).

**Multi-Cluster Service Mesh**
Extending Istio across multiple Kubernetes clusters for cross-cluster service discovery, traffic management, and security. Enables multi-region deployments and disaster recovery.

---

### System Design Concepts

**Paxos Algorithm**
A consensus algorithm that ensures multiple nodes agree on a single value even with failures. Uses proposers, acceptors, and learners with a two-phase protocol (prepare and accept).

**Raft Consensus**
A more understandable alternative to Paxos with leader election, log replication, and safety guarantees. Nodes can be leader, follower, or candidate, with all writes going through the leader.

**Zookeeper**
A centralized coordination service for distributed systems providing configuration management, synchronization, naming registry, and group services. Implements Zab (Zookeeper Atomic Broadcast) consensus protocol.

**Distributed Locks**
Coordination mechanism to ensure only one process can access a resource at a time across multiple nodes. Implementations use consensus algorithms or services like Zookeeper, Redis, or etcd.

**Split-Brain Problem**
Network partition causing two or more nodes to independently act as primary/leader, potentially causing data inconsistency. Prevented using quorum-based decisions or fencing mechanisms.

**Quorum-Based Systems**
Systems requiring majority agreement (N/2 + 1) for operations to ensure consistency despite failures. Used in Paxos, Raft, and distributed databases to maintain data integrity.

---

### DSA Concepts

**Segment Tree**
A binary tree structure for storing intervals or segments. Allows efficient range queries (sum, min, max) and updates in O(log n) time. Each node stores aggregate information about an array segment.

**Binary Indexed Tree (Fenwick Tree)**
A data structure providing efficient prefix sum queries and updates in O(log n). More space-efficient than segment trees but limited to operations where inverse exists (addition, multiplication).

**Range Queries**
Operations on a range of array elements, like finding sum, minimum, maximum, or GCD of elements from index i to j. Segment trees and BITs optimize these from O(n) to O(log n).

**Range Sum Query**
Finding the sum of elements in an array range [i, j]. Can be solved with prefix sums O(1) query/O(n) update, or segment tree/BIT O(log n) query and update.

---

## ✅ Day 16 Completion Checklist
- [ ] Node.js: Implement distributed locks
- [ ] JavaScript: Create WASM module
- [ ] React: Model complex flows with XState
- [ ] Java: Understand JVM internals
- [ ] Spring Boot: Configure distributed tracing
- [ ] DevOps: Optimize CI/CD pipeline
- [ ] GCP: Deploy Istio on GKE
- [ ] System Design: Understand Raft algorithm
- [ ] DSA: Implement segment tree

---

**Tomorrow:** Day 17 - GraphQL, gRPC, Advanced protocols
