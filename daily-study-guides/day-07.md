# Day 7 - Behavioral Patterns & Service Communication

**Date:** May 24, 2026
**Focus:** Behavioral patterns, messaging systems, service mesh

## 🔗 Quick Links to Concepts
[Node.js](#nodejs-concepts) | [JavaScript](#javascript-concepts) | [React.js](#reactjs-concepts) | [Java](#java-concepts) | [Spring Boot](#spring-boot-concepts) | [DevOps](#devops-concepts) | [Google Cloud](#google-cloud-concepts) | [System Design](#system-design-concepts) | [DSA](#dsa-concepts)

---

## ⏰ 30-Minute Study Blocks

### 1. Node.js (30 min)
**Topic:** Worker Threads & Child Processes
- Worker threads for CPU-intensive tasks
- Child processes (fork, exec, spawn)
- Cluster module for multi-core
- When to use workers vs processes
- Communication between threads

### 2. JavaScript (30 min)
**Topic:** Memory Management & Performance
- Garbage collection
- Memory leaks identification
- WeakMap and WeakSet
- Performance API
- Profiling and optimization
- Event loop monitoring

### 3. React.js (30 min)
**Topic:** Advanced State Management
- Zustand library
- Recoil basics
- State machines with XState
- When to use different state solutions
- Global vs local state decisions

### 4. Java (30 min)
**Topic:** Design Patterns - Behavioral
- Strategy pattern
- Observer pattern
- Command pattern
- Template method
- Chain of responsibility
- Iterator pattern

### 5. Spring Boot (30 min)
**Topic:** Messaging with Kafka/RabbitMQ
- Message brokers overview
- Spring Kafka configuration
- Producer and consumer
- @KafkaListener
- Topics and partitions
- Message serialization

### 6. DevOps (30 min)
**Topic:** Service Mesh (Istio)
- Service mesh concepts
- Sidecar proxy pattern
- Traffic management
- Security (mTLS)
- Observability
- Istio architecture

### 7. Google Cloud (30 min)
**Topic:** Pub/Sub Messaging
- Pub/Sub architecture
- Topics and subscriptions
- Push vs pull delivery
- Message ordering
- Dead letter topics
- At-least-once delivery guarantee

### 8. System Design (30 min)
**Topic:** Distributed Transactions
- Two-phase commit (2PC)
- Saga pattern
- Compensating transactions
- Event sourcing for transactions
- Distributed consensus (Paxos, Raft basics)

### 9. DSA (30 min)
**Topic:** Backtracking Basics
- Backtracking template
- Generate parentheses
- Subsets
- Permutations
- Combination sum
- Decision tree concept

---

## 📖 Concept Definitions (Interview-Ready)

### Node.js Concepts

**Worker Threads**
A Node.js module for running JavaScript operations in parallel using threads. Ideal for CPU-intensive tasks like image processing or complex calculations without blocking the main event loop.

**Child Processes**
Separate Node.js processes spawned from the parent process. Methods include `fork` (spawns new Node process), `exec` (executes shell commands), and `spawn` (streams data for long-running processes).

**Cluster Module**
Allows creating child processes that share the same server port, distributing workload across CPU cores. Enables horizontal scaling within a single machine for better CPU utilization.

**Workers vs Processes**
Worker threads share memory and are lighter (better for CPU tasks). Child processes are isolated with separate memory (better for running different programs or when isolation is needed).

**Thread Communication**
Worker threads communicate via message passing using `postMessage()` and `on('message')`. Supports transferring data including shared memory through `SharedArrayBuffer` for high-performance scenarios.

---

### JavaScript Concepts

**Garbage Collection**
Automatic memory management that reclaims memory occupied by objects no longer in use. JavaScript uses mark-and-sweep algorithm to identify and remove unreachable objects.

**Memory Leaks**
Occur when memory is allocated but never freed, typically from forgotten timers, closures retaining references, or detached DOM nodes. Leads to increasing memory usage and performance degradation.

**WeakMap and WeakSet**
Collections that hold weak references to objects, allowing garbage collection if no other references exist. Keys in WeakMap must be objects. Useful for private data and preventing memory leaks.

**Performance API**
Browser API for measuring performance metrics like navigation timing, resource timing, and custom marks/measures. `performance.now()` provides high-resolution timestamps for accurate timing.

**Profiling and Optimization**
Process of measuring code execution time and identifying bottlenecks. Use browser DevTools profiler or Node.js profilers to analyze CPU usage, memory allocation, and function call times.

**Event Loop Monitoring**
Tracking event loop lag to detect blocking operations. Tools like `perf_hooks` in Node.js or libraries measure delay between expected and actual callback execution time.

---

### React.js Concepts

**Zustand**
A lightweight state management library using hooks. Creates stores with simple API, no providers needed, and minimal boilerplate. Good alternative to Redux for smaller applications.

**Recoil**
Facebook's state management library using atoms (shared state) and selectors (derived state). Provides granular subscriptions and better performance for complex state dependencies.

**State Machines (XState)**
A library implementing finite state machines for managing component states and transitions. Makes complex state logic predictable by explicitly defining all possible states and transitions.

**State Management Tradeoffs**
Local state (useState) for component-specific data, Context for shared data across subtrees, libraries (Redux/Zustand) for global app state. Choose based on complexity and performance needs.

**Global vs Local State**
Global state is accessible throughout the app (user auth, theme). Local state is component-specific (form inputs, toggles). Over-using global state causes unnecessary re-renders and complexity.

---

### Java Concepts

**Strategy Pattern**
Defines a family of algorithms, encapsulates each one, and makes them interchangeable. Allows algorithm selection at runtime without modifying client code, promoting Open/Closed principle.

**Observer Pattern (Java)**
Defines one-to-many dependency where when one object changes state, all dependents are notified. Commonly used in event handling systems and MVC architectures.

**Command Pattern**
Encapsulates a request as an object, allowing parameterization of clients with different requests, queuing, and logging. Enables undo/redo functionality and transaction management.

**Template Method**
Defines algorithm skeleton in a base class, letting subclasses override specific steps without changing structure. Promotes code reuse and enforces consistent algorithm flow.

**Chain of Responsibility**
Passes requests along a chain of handlers where each handler decides to process or pass to the next. Decouples sender from receiver and allows multiple handlers.

**Iterator Pattern**
Provides a way to access elements of a collection sequentially without exposing underlying representation. Java's Iterator interface implements this pattern for collections.

---

### Spring Boot Concepts

**Message Brokers**
Middleware that translates messages between sender and receiver systems. Enables asynchronous communication, decoupling services, and reliable message delivery through queuing.

**Spring Kafka**
Spring's integration with Apache Kafka for building event-driven applications. Provides templates for producing messages and listener containers for consuming from Kafka topics.

**Kafka Producer and Consumer**
Producer sends messages to Kafka topics. Consumer reads messages from topics by subscribing. Kafka maintains message order within partitions and allows multiple consumers via consumer groups.

**@KafkaListener**
Spring annotation for creating message listeners. Marks a method to receive messages from specified Kafka topics, handling deserialization and acknowledgment automatically.

**Topics and Partitions**
Topic is a category for messages. Partitions are ordered, immutable sequences of messages within a topic. Partitioning enables parallelism and scalability across multiple consumers.

**Message Serialization**
Converting objects to byte format for transmission (serialization) and back (deserialization). Kafka supports JSON, Avro, Protobuf. Choice affects performance and schema evolution.

---

### DevOps Concepts

**Service Mesh**
An infrastructure layer managing service-to-service communication in microservices. Handles load balancing, encryption, authentication, monitoring, and traffic control without changing application code.

**Sidecar Proxy Pattern**
Deploys a proxy container alongside each service instance. The proxy handles networking concerns (traffic routing, security, observability) while the service focuses on business logic.

**Traffic Management**
Controlling how requests flow between services. Includes routing rules, load balancing strategies, A/B testing, canary deployments, and circuit breaking for resilient communication.

**mTLS (Mutual TLS)**
Both client and server authenticate each other using certificates. Service mesh automatically handles certificate rotation and enforces encrypted communication between all services.

**Observability in Service Mesh**
Automatic collection of metrics, logs, and traces from service interactions. Provides visibility into request flow, latency, error rates, and dependencies without instrumenting code.

**Istio Architecture**
Control plane (Istiod) manages configuration and certificate distribution. Data plane (Envoy proxies) handles actual traffic. Pilot configures proxies, Citadel manages certificates, Galley validates configuration.

---

### Google Cloud Concepts

**Pub/Sub Architecture**
A messaging service implementing publish-subscribe pattern. Publishers send messages to topics, subscribers receive messages from subscriptions. Fully managed, scalable, and asynchronous.

**Topics and Subscriptions**
Topic is a named resource for message publication. Subscription represents message stream from a topic to subscribers. One topic can have multiple subscriptions.

**Push vs Pull Delivery**
Push: Pub/Sub delivers messages to HTTPS endpoint automatically. Pull: Subscribers request messages when ready. Push is simpler; pull offers more control and batch processing.

**Message Ordering**
Pub/Sub can preserve message order within a single publisher using ordering keys. Messages with same key are delivered in publish order to a single subscriber.

**Dead Letter Topics**
Topics that receive messages that couldn't be processed after maximum delivery attempts. Enables debugging of problematic messages and prevents infinite retry loops.

**At-Least-Once Delivery**
Pub/Sub guarantees message delivery at least once. Messages may be delivered multiple times, so subscribers should implement idempotent processing to handle duplicates safely.

---

### System Design Concepts

**Two-Phase Commit (2PC)**
A distributed algorithm ensuring all nodes in a transaction either commit or abort. Coordinator asks all participants to prepare (phase 1), then commits if all agree (phase 2). Blocks on failures.

**Saga Pattern**
Manages distributed transactions as a sequence of local transactions. If one fails, compensating transactions undo previous steps. Eventual consistency instead of immediate consistency.

**Compensating Transactions**
Operations that undo effects of previously completed transactions in a saga. Each step has a corresponding compensation action to maintain system consistency after failures.

**Event Sourcing**
Storing state changes as a sequence of events rather than current state. Enables event replay, audit trails, and temporal queries. Can reconstruct any past state.

**Distributed Consensus**
Agreement among distributed nodes on a single data value despite failures. Paxos and Raft are algorithms ensuring consistency in distributed systems like databases and configuration stores.

---

### DSA Concepts

**Backtracking**
An algorithmic technique that builds solutions incrementally and abandons candidates ("backtracks") when they cannot lead to valid solutions. Explores solution space systematically using recursion.

**Backtracking Template**
General pattern: make choice, explore with recursion, undo choice (backtrack). Base case checks if solution is complete. Typically uses recursion with state modification and restoration.

**Generate Parentheses**
Problem of generating all valid combinations of balanced parentheses. Backtracking tracks open and close counts, adding '(' when under limit and ')' when it wouldn't break balance.

**Subsets**
Finding all possible subsets of a set. Backtracking explores two choices for each element: include or exclude. Results in 2^n total subsets.

**Permutations**
Generating all possible orderings of elements. Backtracking swaps elements and recursively generates permutations, undoing swaps when backtracking. Results in n! permutations.

**Decision Tree Concept**
Visual representation of backtracking where each node represents a choice and branches represent possible decisions. Helps understand recursive exploration and pruning of invalid paths.

---

## ✅ Day 7 Completion Checklist
- [ ] Node.js: Use worker threads
- [ ] JavaScript: Identify memory leaks
- [ ] React: Implement Zustand store
- [ ] Java: Apply behavioral patterns
- [ ] Spring Boot: Set up Kafka producer/consumer
- [ ] DevOps: Understand service mesh
- [ ] GCP: Create Pub/Sub topic and subscription
- [ ] System Design: Understand Saga pattern
- [ ] DSA: Solve backtracking problems

---

**Tomorrow:** Day 8 - Observability, Advanced React, Concurrency, Circuit breakers
