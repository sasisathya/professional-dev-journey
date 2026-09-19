# Day 11 - Advanced Architectures & Distributed Systems

**Focus:** Microservices patterns, event-driven architecture, distributed systems

---

## 🔗 Quick Links to Concepts
[Node.js](#nodejs-concepts) | [JavaScript](#javascript-concepts) | [React.js](#reactjs-concepts) | [Java](#java-concepts) | [Spring Boot](#spring-boot-concepts) | [DevOps](#devops-concepts) | [Google Cloud](#google-cloud-concepts) | [System Design](#system-design-concepts) | [DSA](#dsa-concepts)

---

## ⏰ 30-Minute Study Blocks

### 1. Node.js (30 min)
**Topic:** Microservices in Node.js
- Service decomposition strategies
- Inter-service communication (gRPC, REST, messaging)
- Service discovery (Consul, Eureka)
- API Gateway pattern (Express Gateway, Kong)
- Microservices chassis pattern

### 2. JavaScript (30 min)
**Topic:** Advanced TypeScript
- Type system deep dive
- Generics and constraints
- Utility types (Partial, Pick, Omit, Record)
- Type guards and type predicates
- Mapped types
- Conditional types

### 3. React.js (30 min)
**Topic:** Micro Frontends
- Micro frontend architecture
- Module Federation (Webpack 5)
- Single-SPA framework
- Independent deployment
- Shared dependencies
- Communication between micro frontends

### 4. Java (30 min)
**Topic:** Advanced Concurrency
- java.util.concurrent package
- CountDownLatch, CyclicBarrier, Semaphore
- CompletableFuture
- Fork/Join framework
- Concurrent collections
- Lock interfaces (ReentrantLock, ReadWriteLock)

### 5. Spring Boot (30 min)
**Topic:** Spring Cloud & Microservices
- Spring Cloud Config
- Eureka Service Discovery
- Ribbon load balancing
- Feign declarative HTTP client
- Spring Cloud Gateway
- Distributed tracing with Sleuth

### 6. DevOps (30 min)
**Topic:** Advanced Kubernetes
- StatefulSets vs Deployments
- DaemonSets and Jobs
- Horizontal Pod Autoscaler (HPA)
- Persistent Volumes (PV) and Persistent Volume Claims (PVC)
- Namespaces and resource quotas
- Network policies

### 7. Google Cloud (30 min)
**Topic:** Google Kubernetes Engine (GKE)
- GKE cluster types (Standard, Autopilot)
- Node pools
- Workload Identity
- GKE networking
- Ingress and load balancing
- Cluster autoscaling

### 8. System Design (30 min)
**Topic:** Event-Driven Architecture
- Event sourcing pattern
- CQRS (Command Query Responsibility Segregation)
- Event store design
- Event versioning
- Eventual consistency
- Saga orchestration vs choreography

### 9. DSA (30 min)
**Topic:** Advanced Graph Algorithms
- Dijkstra's algorithm (shortest path)
- Topological sort
- Union-Find (Disjoint Set)
- Problems: Network Delay Time, Minimum Spanning Tree, Critical Connections

---

## 📖 Concept Definitions (Interview-Ready)

### Node.js Concepts

**Microservices**
An architectural style where an application is composed of small, independent services that communicate over well-defined APIs. Each service is focused on a specific business capability and can be developed, deployed, and scaled independently.

**Service Decomposition**
The process of breaking down a monolithic application into smaller microservices based on business capabilities, bounded contexts, or technical boundaries. Key strategies include decomposition by subdomain, by business capability, or by transaction boundaries.

**Inter-Service Communication**
Methods for microservices to communicate with each other: synchronous (REST, gRPC) or asynchronous (message queues, event streams). Each has tradeoffs in latency, coupling, and reliability.

**gRPC**
A high-performance RPC framework that uses HTTP/2 and Protocol Buffers. Provides features like bidirectional streaming, flow control, and efficient binary serialization, making it faster than REST for service-to-service communication.

**Service Discovery**
A mechanism that allows services to find and communicate with each other without hardcoded addresses. Tools like Consul and Eureka maintain a registry of available services and their locations.

**API Gateway**
A server that acts as an entry point for clients, routing requests to appropriate microservices. Handles cross-cutting concerns like authentication, rate limiting, load balancing, and request aggregation.

**Microservices Chassis Pattern**
A framework or template that handles common cross-cutting concerns (logging, health checks, metrics, configuration) so developers can focus on business logic. Provides a consistent foundation for all microservices.

---

### JavaScript Concepts

**TypeScript Type System**
A static type system built on JavaScript that catches errors at compile time. Includes primitive types, object types, union types, intersection types, and structural typing (duck typing).

**Generics**
A way to create reusable components that work with multiple types while maintaining type safety. Example: `function identity<T>(arg: T): T { return arg; }` works with any type but preserves the specific type used.

**Type Constraints**
Restrictions on generic types using the `extends` keyword. Example: `function getLength<T extends { length: number }>(arg: T)` ensures T has a length property.

**Utility Types**
Built-in TypeScript types for common type transformations. Partial<T> makes all properties optional, Pick<T, K> selects specific properties, Omit<T, K> excludes properties, Record<K, T> creates object type with specific keys.

**Type Guards**
Runtime checks that narrow down types in conditional blocks. Examples: typeof, instanceof, or custom type predicates like `function isString(x: any): x is string { return typeof x === 'string'; }`.

**Mapped Types**
Types that transform properties of an existing type. Example: `type Readonly<T> = { readonly [P in keyof T]: T[P] }` makes all properties read-only.

**Conditional Types**
Types that depend on a condition. Syntax: `T extends U ? X : Y`. Used for type inference and creating flexible type utilities.

---

### React.js Concepts

**Micro Frontends**
An architectural pattern that extends microservices to frontend development. Each team builds an independent, deployable frontend application that combines to form a complete user interface.

**Module Federation**
A Webpack 5 feature that allows multiple separate builds to share code at runtime. Enables micro frontends by loading modules dynamically from different applications without bundling them together.

**Single-SPA**
A JavaScript framework for combining multiple frontend applications (React, Vue, Angular) into one. Acts as a router that mounts/unmounts applications based on URL changes.

**Independent Deployment**
The ability to deploy each micro frontend separately without coordinating with other teams. Requires careful contract management and versioning to avoid breaking changes.

**Shared Dependencies**
Common libraries (React, shared UI components) used across micro frontends. Module Federation can share these at runtime to avoid duplication and reduce bundle size.

---

### Java Concepts

**java.util.concurrent Package**
A comprehensive library for concurrent programming in Java. Provides high-level concurrency utilities like thread pools, concurrent collections, synchronizers, and atomic variables.

**CountDownLatch**
A synchronization aid that allows one or more threads to wait until a set of operations in other threads completes. Initialized with a count that decrements on each countDown() call; threads await() until count reaches zero.

**CyclicBarrier**
A synchronization point where threads wait for each other. When all threads reach the barrier, they're released simultaneously. Unlike CountDownLatch, it can be reused multiple times.

**Semaphore**
Controls access to a shared resource through permits. Threads acquire() permits before accessing the resource and release() them when done. Useful for limiting concurrent access to resources.

**CompletableFuture**
A powerful class for asynchronous programming that represents a future result of an async computation. Supports chaining operations, combining multiple futures, and exception handling with methods like thenApply(), thenCompose(), and exceptionally().

**Fork/Join Framework**
A framework for parallel execution of recursive tasks. ForkJoinPool divides tasks into subtasks (fork), processes them in parallel, and combines results (join). Ideal for divide-and-conquer algorithms.

**Concurrent Collections**
Thread-safe collections optimized for concurrent access: ConcurrentHashMap (lock striping), CopyOnWriteArrayList (copy-on-write), BlockingQueue (producer-consumer). Better performance than synchronized collections.

**ReentrantLock**
An explicit lock that provides more flexibility than synchronized blocks. Supports tryLock(), lock interruptibility, fairness policies, and multiple condition variables.

**ReadWriteLock**
A lock that allows multiple concurrent readers but exclusive access for writers. Improves performance when reads are frequent and writes are rare. ReentrantReadWriteLock is the common implementation.

---

### Spring Boot Concepts

**Spring Cloud Config**
A centralized configuration management service that provides server and client-side support for externalized configuration. Config Server stores configuration in Git, and services fetch their config at startup or dynamically refresh.

**Eureka Service Discovery**
A REST-based service registry where microservices register themselves and discover other services. Eureka Server maintains the registry; Eureka Clients register and query for service locations.

**Ribbon Load Balancing**
A client-side load balancer that distributes requests across multiple service instances. Integrates with Eureka for service discovery and supports various load balancing algorithms (round-robin, random, weighted).

**Feign Declarative HTTP Client**
A declarative REST client that makes writing HTTP clients easier. Define an interface with annotations, and Feign generates the implementation. Integrates with Ribbon for load balancing and Eureka for service discovery.

**Spring Cloud Gateway**
A modern API gateway built on Spring WebFlux. Provides routing, filtering, rate limiting, circuit breaking, and security for microservices. Non-blocking and more performant than Zuul.

**Distributed Tracing with Sleuth**
Spring Cloud Sleuth adds trace and span IDs to logs, enabling request tracking across microservices. Integrates with Zipkin or Jaeger to visualize request flows and identify performance bottlenecks.

---

### DevOps Concepts

**StatefulSets**
Kubernetes workload for managing stateful applications. Provides stable network identities, persistent storage, and ordered deployment/scaling. Used for databases, message queues, and clustered applications.

**Deployments vs StatefulSets**
Deployments manage stateless applications with interchangeable pods. StatefulSets manage stateful apps requiring stable identities, ordered operations, and persistent storage. Deployments use ReplicaSets; StatefulSets use ordered pod naming (pod-0, pod-1).

**DaemonSets**
Ensures a copy of a pod runs on all (or selected) nodes. Used for node-level services like log collectors, monitoring agents, or network plugins. Pods are automatically added/removed as nodes join/leave the cluster.

**Jobs and CronJobs**
Jobs create pods to run tasks to completion (batch processing). CronJobs schedule Jobs on a time-based schedule. Jobs ensure specified number of successful completions; failed pods are recreated.

**Horizontal Pod Autoscaler (HPA)**
Automatically scales pod replicas based on CPU utilization, memory, or custom metrics. Periodically checks metrics and adjusts replicas to maintain target utilization. Works with Deployments, StatefulSets, and ReplicaSets.

**Persistent Volumes (PV) and Claims (PVC)**
PV is a piece of storage provisioned by admin or dynamically. PVC is a request for storage by a user. PVCs bind to PVs, and pods mount PVCs. Provides abstraction between storage consumption and provisioning.

**Namespaces**
Virtual clusters within a Kubernetes cluster. Provide scope for names, resource isolation, and multi-tenancy. Resources in one namespace are isolated from others, with separate RBAC and resource quotas.

**Resource Quotas**
Limits on resource consumption (CPU, memory, pod count) per namespace. Prevents resource exhaustion and ensures fair resource distribution across teams/applications.

**Network Policies**
Firewall rules that control pod-to-pod and pod-to-external communication. Define ingress and egress rules based on pod selectors, namespaces, and IP blocks. Require a network plugin that supports policies (Calico, Cilium).

---

### Google Cloud Concepts

**GKE (Google Kubernetes Engine)**
A managed Kubernetes service that simplifies cluster creation, management, and operations. Google handles control plane, auto-upgrades, auto-repair, and security patching.

**GKE Cluster Types**
Standard: Full control over node configuration, networking, and cluster settings. Autopilot: Google manages nodes, scaling, and security with hands-off operations; pay per pod.

**Node Pools**
Groups of nodes within a cluster with the same configuration (machine type, disk size, labels). Enable running different workload types on different hardware or isolating workloads.

**Workload Identity**
Allows pods to authenticate as Google Cloud service accounts without managing keys. Pods automatically get credentials to access GCP services securely using Kubernetes service accounts mapped to GCP service accounts.

**GKE Networking**
Options include VPC-native clusters (use alias IP ranges), routes-based clusters, and private clusters (nodes without public IPs). Supports network policies, load balancing, and integration with Cloud DNS.

**Ingress and Load Balancing**
Ingress manages external HTTP(S) access to services. GKE supports GCP HTTP(S) Load Balancer for Ingress, Network Load Balancer for LoadBalancer services, and Internal Load Balancer for internal services.

**Cluster Autoscaling**
Automatically adjusts the number of nodes based on pod resource requests and limits. Scales up when pods can't be scheduled due to insufficient resources; scales down when nodes are underutilized.

---

### System Design Concepts

**Event Sourcing**
A pattern where state changes are stored as a sequence of events rather than storing current state. All changes are append-only events; current state is reconstructed by replaying events. Provides complete audit trail and time-travel debugging.

**CQRS (Command Query Responsibility Segregation)**
Separates read and write operations into different models. Commands modify state; queries read state. Often paired with event sourcing. Allows independent scaling and optimization of reads vs writes.

**Event Store**
A database optimized for storing events in event sourcing. Supports append-only writes, event replay, snapshots for performance, and subscribing to event streams. Examples: EventStoreDB, Apache Kafka.

**Event Versioning**
Managing changes to event schemas over time. Strategies include upcasting (convert old events to new schema), versioned event types, or schema registry. Critical for evolving systems without breaking event replay.

**Eventual Consistency**
In distributed systems with event-driven architecture, different services may have temporarily inconsistent views of data. Updates propagate asynchronously, and all replicas converge to the same state eventually.

**Saga Pattern**
A way to manage distributed transactions across microservices using a sequence of local transactions. Orchestration: central coordinator controls saga flow. Choreography: services communicate via events without central control.

---

### DSA Concepts

**Dijkstra's Algorithm**
Finds shortest paths from a source vertex to all other vertices in a weighted graph with non-negative weights. Uses a min-heap priority queue to greedily select the closest unvisited vertex. Time complexity: O((V+E) log V) with binary heap.

**Topological Sort**
Linear ordering of vertices in a directed acyclic graph (DAG) such that for every edge u→v, u comes before v. Used for dependency resolution, task scheduling, and build systems. Implemented using DFS or Kahn's algorithm (BFS).

**Union-Find (Disjoint Set)**
A data structure that tracks elements partitioned into disjoint sets. Supports two operations: find (which set contains element) and union (merge two sets). Used for detecting cycles, connected components, and minimum spanning trees.

**Path Compression**
An optimization in Union-Find where find() makes nodes point directly to the root. Flattens the tree structure, making subsequent operations nearly O(1).

**Union by Rank**
An optimization in Union-Find where the smaller tree is attached under the root of the larger tree during union(). Keeps trees balanced and improves time complexity.

**Minimum Spanning Tree (MST)**
A subset of edges that connects all vertices with minimum total edge weight, without cycles. Algorithms: Kruskal's (sort edges, use Union-Find) or Prim's (greedy, similar to Dijkstra's).

---

## ✅ Day 11 Completion Checklist
- [ ] Node.js: Design microservices architecture
- [ ] JavaScript: Use advanced TypeScript features
- [ ] React: Understand micro frontends
- [ ] Java: Work with CompletableFuture
- [ ] Spring Boot: Configure Spring Cloud components
- [ ] DevOps: Deploy StatefulSets in K8s
- [ ] GCP: Create GKE cluster
- [ ] System Design: Design event-driven system
- [ ] DSA: Implement Dijkstra's algorithm

---

**Tomorrow:** Day 12 - Data streaming, Real-time systems, WebSockets
