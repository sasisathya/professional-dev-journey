# Day 12 - Real-Time Systems & Data Streaming

**Focus:** WebSockets, streaming, real-time data processing

---

## 🔗 Quick Links to Concepts
[Node.js](#nodejs-concepts) | [JavaScript](#javascript-concepts) | [React.js](#reactjs-concepts) | [Java](#java-concepts) | [Spring Boot](#spring-boot-concepts) | [DevOps](#devops-concepts) | [Google Cloud](#google-cloud-concepts) | [System Design](#system-design-concepts) | [DSA](#dsa-concepts)

---

## ⏰ 30-Minute Study Blocks

### 1. Node.js (30 min)
**Topic:** WebSockets & Real-Time Communication
- WebSocket protocol
- Socket.io implementation
- Server-Sent Events (SSE)
- Long polling vs WebSockets
- Scaling WebSocket servers
- Redis adapter for multi-instance

### 2. JavaScript (30 min)
**Topic:** Advanced Async Patterns
- Async generators and iterators
- Reactive programming with RxJS
- Observables and operators
- Hot vs cold observables
- Backpressure handling
- Stream processing in browser

### 3. React.js (30 min)
**Topic:** Real-Time React Applications
- WebSocket integration in React
- Real-time data synchronization
- Optimistic updates
- Conflict resolution
- Socket.io with React hooks
- Real-time collaboration features

### 4. Java (30 min)
**Topic:** Reactive Programming
- Reactive Streams specification
- Project Reactor (Mono, Flux)
- Backpressure strategies
- Operators (map, flatMap, filter)
- Error handling in reactive streams
- Hot vs cold publishers

### 5. Spring Boot (30 min)
**Topic:** Spring WebFlux
- Reactive web applications
- WebFlux vs Spring MVC
- Annotated controllers vs functional endpoints
- WebClient for reactive HTTP calls
- Server-Sent Events
- Backpressure in WebFlux

### 6. DevOps (30 min)
**Topic:** Observability Deep Dive
- Distributed tracing (Jaeger, Zipkin)
- Metrics collection (Prometheus)
- Log aggregation (Loki)
- OpenTelemetry
- Correlation IDs across services
- SLIs, SLOs, SLAs

### 7. Google Cloud (30 min)
**Topic:** Cloud Dataflow & Data Processing
- Apache Beam programming model
- Streaming vs batch processing
- Windowing strategies
- Triggers and watermarks
- Side inputs and outputs
- Dataflow templates

### 8. System Design (30 min)
**Topic:** Real-Time Data Processing Systems
- Stream processing architecture
- Kafka Streams
- Apache Flink basics
- Lambda vs Kappa architecture
- Exactly-once semantics
- Windowing and aggregation

### 9. DSA (30 min)
**Topic:** Trie & String Algorithms
- Trie data structure
- Insert, search, prefix search
- Applications of Trie
- Problems: Implement Trie, Word Search II, Autocomplete System

---

## 📖 Concept Definitions (Interview-Ready)

### Node.js Concepts

**WebSocket Protocol**
A full-duplex communication protocol that provides persistent, bidirectional connections between client and server over a single TCP connection. Unlike HTTP request-response, WebSockets allow real-time data exchange with low latency.

**Socket.io**
A JavaScript library for real-time web applications that abstracts WebSockets with fallbacks to long polling. Provides automatic reconnection, room/namespace support, event-based communication, and works across browsers and environments.

**Server-Sent Events (SSE)**
A server push technology where the server sends automatic updates to the client over a single HTTP connection. Unidirectional (server to client only), simpler than WebSockets, and ideal for read-only real-time feeds like notifications or stock prices.

**Long Polling vs WebSockets**
Long polling: Client makes HTTP request, server holds it open until data available, client immediately makes new request. WebSockets: Persistent connection with bidirectional communication. WebSockets have lower latency and overhead for real-time apps.

**Scaling WebSocket Servers**
Challenges include sticky sessions (same client to same server), connection state, and broadcasting. Solutions include Redis Pub/Sub for cross-server messaging, load balancer session affinity, and stateless design where possible.

**Redis Adapter for Multi-Instance**
In Socket.io, enables message broadcasting across multiple server instances. Uses Redis Pub/Sub to synchronize events between servers, allowing horizontal scaling while maintaining real-time functionality across all connected clients.

---

### JavaScript Concepts

**Async Generators**
Functions that combine async/await with generators using `async function*`. They yield promises and can be iterated with `for await...of`. Useful for streaming data or paginated API results asynchronously.

**Async Iterators**
Objects implementing the async iteration protocol with `Symbol.asyncIterator`. Used with `for await...of` to process asynchronous sequences. Example: reading files line-by-line or streaming API data.

**Reactive Programming**
A programming paradigm focused on data streams and propagation of change. Treats events as streams that can be observed, transformed, combined, and filtered. Handles asynchronous data flow declaratively.

**RxJS (Reactive Extensions)**
A library for reactive programming using Observables. Provides operators to compose and transform asynchronous streams. Handles events, async requests, and animations with a unified API.

**Observables**
Lazy collections of multiple values over time. Unlike Promises (single value), Observables can emit multiple values. Support cancellation, operators for transformation, and can be hot (active) or cold (lazy).

**Hot vs Cold Observables**
Cold: Starts producing data when subscribed (each subscriber gets independent data stream). Hot: Produces data regardless of subscribers (shared data stream). Example: HTTP request (cold) vs mouse moves (hot).

**Backpressure Handling**
Managing situations where data producer is faster than consumer. Strategies include buffering, dropping old/new data, or throttling. RxJS provides operators like buffer, throttle, debounce, and sample.

---

### React.js Concepts

**WebSocket Integration in React**
Using useEffect to establish WebSocket connection on mount and cleanup on unmount. Store connection in useRef, handle messages with state updates, and implement reconnection logic for reliability.

**Real-Time Data Synchronization**
Keeping client state in sync with server in real-time. Challenges include conflict resolution, offline support, and handling concurrent updates. Solutions include operational transformation, CRDTs, or last-write-wins.

**Optimistic Updates**
Immediately updating UI before server confirms the operation. Improves perceived performance. If server rejects, rollback changes. Common pattern with real-time apps and React Query/Apollo Client.

**Conflict Resolution**
Handling simultaneous updates from multiple clients. Strategies include last-write-wins (timestamp-based), vector clocks, operational transformation (Google Docs), or CRDTs (Conflict-free Replicated Data Types).

**Socket.io with React Hooks**
Creating custom hooks (useSocket) to manage Socket.io connections. Encapsulates connection logic, event listeners, and cleanup. Returns methods to emit events and state from received messages.

---

### Java Concepts

**Reactive Streams Specification**
A standard for asynchronous stream processing with non-blocking backpressure. Defines four interfaces: Publisher (produces data), Subscriber (consumes data), Subscription (links them), and Processor (transforms data).

**Project Reactor**
A reactive programming library for JVM implementing Reactive Streams. Core types: Mono (0-1 element), Flux (0-N elements). Provides operators for transformation, composition, and error handling in reactive pipelines.

**Mono**
A reactive type representing 0 or 1 asynchronous value. Used for operations returning single result (HTTP request, database query). Lazy - only executes when subscribed to.

**Flux**
A reactive type representing 0 to N asynchronous values. Used for streaming data (file reading, event streams). Supports backpressure and various operators for stream manipulation.

**Backpressure Strategies**
Mechanisms to handle slow consumers: BUFFER (accumulate all), DROP (discard when full), LATEST (keep only latest), ERROR (fail if overwhelmed). Project Reactor provides onBackpressureBuffer/Drop/Latest/Error operators.

**Reactive Operators**
Functions to transform reactive streams. map (transform each element), flatMap (async transformation returning Publisher), filter (conditional inclusion), zip (combine multiple streams), merge (interleave streams).

**Hot vs Cold Publishers**
Cold: Starts emitting when subscribed; each subscriber gets full sequence. Hot: Emits regardless of subscribers; subscribers get values from subscription time onward. Controlled by using share() or publish() operators.

---

### Spring Boot Concepts

**Spring WebFlux**
A reactive web framework built on Project Reactor. Non-blocking, supports asynchronous request handling, and can handle more concurrent connections with fewer threads than traditional Spring MVC.

**WebFlux vs Spring MVC**
WebFlux: Non-blocking, reactive, event loop model, ideal for I/O intensive apps with many connections. Spring MVC: Blocking, thread-per-request, better for CPU-intensive apps or when blocking APIs are used.

**Annotated Controllers vs Functional Endpoints**
Annotated: Traditional @Controller/@RequestMapping style, familiar to Spring MVC developers. Functional: Router functions and handler functions, more lightweight, lambda-friendly, better for simple APIs.

**WebClient**
A non-blocking, reactive HTTP client in Spring WebFlux. Replaces RestTemplate for reactive applications. Supports streaming, retry, timeout, and integrates seamlessly with reactive types.

**Server-Sent Events (SSE) in WebFlux**
WebFlux natively supports SSE for streaming data from server to client. Return Flux<ServerSentEvent> or Flux<T> with MediaType.TEXT_EVENT_STREAM. Clients receive events as they're produced.

**Backpressure in WebFlux**
WebFlux handles backpressure through Reactive Streams. Subscribers request N items (request(n)), and publishers respect these requests. Prevents overwhelming slow consumers and provides flow control.

---

### DevOps Concepts

**Distributed Tracing**
Following a request's journey across multiple microservices. Each service adds trace context (trace ID, span ID) to requests. Visualizes call chains, identifies bottlenecks, and troubleshoots latency issues.

**Jaeger**
An open-source distributed tracing system. Collects, stores, and visualizes traces. Shows service dependencies, request flow, and performance metrics. Compatible with OpenTracing API.

**Zipkin**
A distributed tracing system for troubleshooting latency in microservices. Similar to Jaeger, collects timing data and visualizes service dependencies. Integrates with Spring Cloud Sleuth.

**Prometheus**
An open-source monitoring and alerting system. Scrapes metrics from instrumented applications via HTTP, stores time-series data, and provides PromQL query language. Commonly used with Grafana for visualization.

**Loki**
A log aggregation system inspired by Prometheus. Indexes only metadata (labels), not full log content, making it cost-effective. Designed to work with Prometheus and Grafana for unified observability.

**OpenTelemetry**
A vendor-neutral observability framework merging OpenTracing and OpenCensus. Provides unified APIs/SDKs for traces, metrics, and logs. Supports multiple backends (Jaeger, Prometheus, Datadog).

**Correlation IDs**
Unique identifiers propagated across service calls to trace a single request through distributed systems. Enables log aggregation, debugging, and tracking user journeys across microservices.

**SLIs, SLOs, SLAs**
SLI (Service Level Indicator): Metric measuring service performance (latency, error rate, availability). SLO (Service Level Objective): Target value for SLI (99.9% uptime). SLA (Service Level Agreement): Contract with consequences if SLO not met.

---

### Google Cloud Concepts

**Cloud Dataflow**
A fully managed service for stream and batch data processing based on Apache Beam. Handles autoscaling, resource provisioning, and pipeline optimization. Supports both real-time and batch workloads.

**Apache Beam Programming Model**
A unified model for batch and streaming data processing. Defines pipelines with transformations (ParDo, GroupByKey, Combine). Runs on multiple backends (Dataflow, Flink, Spark).

**Streaming vs Batch Processing**
Streaming: Processes data in real-time as it arrives; low latency, unbounded data. Batch: Processes accumulated data in chunks; higher latency, bounded data. Beam unifies both with windowing.

**Windowing Strategies**
Dividing unbounded streams into finite chunks (windows) for processing. Types: Fixed (tumbling), Sliding (overlapping), Session (activity-based), Global (single window for all data).

**Triggers and Watermarks**
Watermark: Estimate of event time progress, indicates when all data before a time has arrived. Trigger: Determines when to emit results for a window (at watermark, early/late, periodically).

**Side Inputs and Outputs**
Side inputs: Additional data sources for enrichment (slowly changing data, lookup tables). Side outputs: Multiple output streams from single transform, useful for filtering and routing different data types.

**Dataflow Templates**
Pre-built Dataflow pipelines for common use cases (BigQuery to Cloud Storage, Pub/Sub to BigQuery). Available as Classic (staged) or Flex (containerized). Simplifies deployment and reuse.

---

### System Design Concepts

**Stream Processing Architecture**
Processing data in motion (real-time streams) rather than at rest. Components include source (Kafka, Kinesis), processing (Flink, Spark Streaming), and sink (database, data lake). Focuses on low latency.

**Kafka Streams**
A client library for building stream processing applications on Apache Kafka. Processes data stored in Kafka topics with high-level DSL or low-level Processor API. Stateful operations and exactly-once semantics.

**Apache Flink**
A distributed stream processing framework. True streaming (not micro-batching), low latency, exactly-once guarantees, stateful computations, and complex event processing. Supports batch as special case of streaming.

**Lambda Architecture**
Combines batch and real-time processing. Batch layer (historical data, accurate), speed layer (real-time, approximate), serving layer (query both). Provides both accuracy and low latency but complex to maintain.

**Kappa Architecture**
Simplified alternative to Lambda using only stream processing. All data flows through streaming pipeline; historical data reprocessed by replaying stream. Eliminates duplicate logic but requires replayable stream.

**Exactly-Once Semantics**
Guarantee that each message is processed exactly once, even with failures. Requires idempotent operations, transactions, or deduplication. Kafka Streams and Flink support this through checkpointing and two-phase commit.

**Windowing and Aggregation**
Grouping stream data into time windows for aggregation. Fixed windows (5-minute intervals), sliding windows (overlapping), session windows (activity gaps). Aggregations compute sum, count, avg per window.

---

### DSA Concepts

**Trie (Prefix Tree)**
A tree data structure for storing strings where each node represents a character. Shares common prefixes, making it efficient for prefix-based operations. Each path from root to leaf represents a word.

**Trie Operations**
Insert: Add word character by character. Search: Traverse character by character, check end-of-word flag. Prefix search: Traverse prefix, return all words below. All operations O(L) where L is word length.

**Trie Applications**
Autocomplete/typeahead systems, spell checkers, IP routing (longest prefix match), dictionary implementations, word games, and counting unique prefixes in a dataset.

**Space Complexity of Trie**
Can be space-intensive: O(ALPHABET_SIZE * N * M) where N is number of words, M is average length. Optimizations include compressed tries (radix trees) or ternary search tries.

---

## ✅ Day 12 Completion Checklist
- [ ] Node.js: Build WebSocket server
- [ ] JavaScript: Use RxJS observables
- [ ] React: Implement real-time features
- [ ] Java: Work with Project Reactor
- [ ] Spring Boot: Create WebFlux application
- [ ] DevOps: Set up distributed tracing
- [ ] GCP: Use Cloud Dataflow
- [ ] System Design: Design streaming system
- [ ] DSA: Implement Trie

---

**Tomorrow:** Day 13 - Database optimization, Indexes, Query tuning
