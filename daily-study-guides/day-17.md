# Day 17 - Modern API Protocols & Communication

**Focus:** GraphQL, gRPC, advanced communication protocols

---

## 🔗 Quick Links to Concepts
[Node.js](#nodejs-concepts) | [JavaScript](#javascript-concepts) | [React.js](#reactjs-concepts) | [Java](#java-concepts) | [Spring Boot](#spring-boot-concepts) | [DevOps](#devops-concepts) | [Google Cloud](#google-cloud-concepts) | [System Design](#system-design-concepts) | [DSA](#dsa-concepts)

---

## ⏰ 30-Minute Study Blocks

### 1. Node.js (30 min)
**Topic:** GraphQL Server Implementation
- Apollo Server
- Schema definition language (SDL)
- Resolvers and data sources
- DataLoader for batching
- GraphQL subscriptions
- Error handling in GraphQL

### 2. JavaScript (30 min)
**Topic:** Advanced Network Programming
- HTTP/2 and HTTP/3
- Server Push
- Multiplexing
- QUIC protocol basics
- Network security (TLS 1.3)
- Protocol buffers in JavaScript

### 3. React.js (30 min)
**Topic:** GraphQL Client
- Apollo Client
- GraphQL queries and mutations
- Cache management
- Optimistic UI
- Local state management with Apollo
- GraphQL fragments

### 4. Java (30 min)
**Topic:** gRPC in Java
- Protocol Buffers (protobuf)
- gRPC service definition
- Unary, server streaming, client streaming, bidirectional streaming
- gRPC vs REST
- Error handling in gRPC
- Interceptors

### 5. Spring Boot (30 min)
**Topic:** GraphQL with Spring Boot
- Spring for GraphQL
- Schema-first vs code-first
- DataFetchers
- GraphQL subscriptions with WebSockets
- Error handling
- N+1 query prevention

### 6. DevOps (30 min)
**Topic:** Multi-Cloud & Hybrid Cloud
- Multi-cloud strategies
- Cloud abstraction layers
- Terraform for multi-cloud
- Service mesh across clouds
- Data residency and compliance
- Cost optimization across clouds

### 7. Google Cloud (30 min)
**Topic:** Cloud Endpoints & API Management
- Cloud Endpoints for API management
- OpenAPI specification
- API versioning
- Rate limiting and quotas
- API analytics
- Authentication with API keys and OAuth

### 8. System Design (30 min)
**Topic:** API Gateway Design
- API Gateway responsibilities
- Request routing
- Protocol translation
- Aggregation pattern
- Backend for Frontend (BFF)
- Rate limiting and throttling at gateway

### 9. DSA (30 min)
**Topic:** String Matching Algorithms
- KMP algorithm
- Rabin-Karp algorithm
- Boyer-Moore algorithm
- Trie for pattern matching
- Problems: Implement strStr(), Repeated DNA Sequences

---

## 📖 Concept Definitions (Interview-Ready)

### Node.js Concepts

**Apollo Server**
A GraphQL server implementation for Node.js that works with any GraphQL schema. Provides built-in features like error handling, data source integration, and GraphQL Playground for testing.

**Schema Definition Language (SDL)**
A human-readable syntax for defining GraphQL schemas. Specifies types, queries, mutations, and relationships using a declarative format separate from implementation code.

**Resolvers**
Functions that resolve GraphQL queries to actual data. Each field in a GraphQL schema can have a resolver that fetches data from databases, APIs, or other sources.

**DataLoader**
A utility for batching and caching data requests to prevent N+1 query problems. Collects multiple requests made during a single tick and batches them into one query.

**GraphQL Subscriptions**
Real-time GraphQL operations that push data to clients when events occur. Typically implemented over WebSockets, allowing servers to send updates to subscribed clients.

---

### JavaScript Concepts

**HTTP/2**
A major revision of HTTP that improves performance through multiplexing (multiple requests over one connection), header compression, and server push. Backward compatible with HTTP/1.1.

**HTTP/3**
The latest HTTP version using QUIC protocol over UDP instead of TCP. Reduces latency by eliminating head-of-line blocking and improving connection establishment with 0-RTT handshakes.

**Server Push**
HTTP/2 feature where servers can send resources to clients before they're requested. Reduces round trips by pushing CSS/JS files when HTML is requested.

**Multiplexing**
Sending multiple requests and responses simultaneously over a single connection. Eliminates head-of-line blocking present in HTTP/1.1 pipelining.

**QUIC Protocol**
Quick UDP Internet Connections - a transport protocol developed by Google that runs over UDP. Provides reliability, congestion control, and built-in encryption, used by HTTP/3.

**Protocol Buffers**
Google's language-neutral data serialization format. Smaller, faster, and more structured than JSON/XML, commonly used with gRPC for efficient service communication.

---

### React.js Concepts

**Apollo Client**
A comprehensive GraphQL client for React that manages data fetching, caching, and state. Integrates seamlessly with React through hooks and provides normalized caching out of the box.

**GraphQL Queries**
Operations to read data from a GraphQL API. Define exactly what fields to retrieve, supporting nested data fetching, aliases, and variables for dynamic requests.

**GraphQL Mutations**
Operations to modify server-side data (create, update, delete). Return the updated data, allowing optimistic UI updates and automatic cache updates.

**Cache Management (Apollo)**
Apollo Client automatically normalizes and caches query results. Provides cache-first, network-only, and cache-and-network policies for flexible data fetching strategies.

**Optimistic UI**
Updating the UI immediately based on expected mutation results before server confirmation. If the mutation fails, changes are rolled back, providing instant user feedback.

**GraphQL Fragments**
Reusable units of GraphQL queries that define a set of fields on a type. Promote code reuse, type safety, and consistency across queries requesting similar data.

---

### Java Concepts

**Protocol Buffers (Protobuf)**
A language-neutral, platform-neutral mechanism for serializing structured data. More efficient than JSON, with strongly typed schemas defined in .proto files.

**gRPC**
A high-performance RPC framework using Protocol Buffers and HTTP/2. Supports multiple languages, streaming, and efficient binary serialization for microservices communication.

**Unary RPC**
The simplest gRPC call where client sends one request and receives one response. Similar to a traditional REST API call but with protobuf serialization.

**Server Streaming RPC**
Client sends one request and server responds with a stream of messages. Useful for returning large datasets or real-time updates.

**Client Streaming RPC**
Client sends a stream of messages and server responds with one message. Useful for uploading files or sending batch data.

**Bidirectional Streaming RPC**
Both client and server send streams of messages independently. Enables real-time chat, collaborative editing, or continuous data exchange.

**gRPC Interceptors**
Middleware-like components that intercept gRPC calls for cross-cutting concerns like authentication, logging, monitoring, or request modification before reaching the service handler.

---

### Spring Boot Concepts

**Spring for GraphQL**
Official Spring integration for GraphQL providing annotation-based programming model, integration with Spring MVC/WebFlux, and Spring Security support for GraphQL APIs.

**Schema-First vs Code-First**
Schema-first: Write GraphQL schema (.graphqls) first, then implement resolvers. Code-first: Define schema using code annotations, schema is generated automatically.

**DataFetchers**
Spring GraphQL components that fetch data for GraphQL fields. Mapped to schema fields and can inject Spring beans, use Spring Security, and handle async operations.

**N+1 Query Prevention**
The problem where fetching a list triggers one query for the list plus N queries for each item's relations. Solved using DataLoader batching or optimized database queries with joins.

---

### DevOps Concepts

**Multi-Cloud Strategy**
Using services from multiple cloud providers (AWS, GCP, Azure) to avoid vendor lock-in, increase redundancy, or leverage best-of-breed services from each platform.

**Cloud Abstraction Layers**
Tools and frameworks that provide a unified interface across different cloud providers. Examples include Terraform for IaC, Kubernetes for container orchestration.

**Terraform Multi-Cloud**
Terraform's ability to manage infrastructure across multiple cloud providers using a single configuration language (HCL). Providers exist for AWS, GCP, Azure, and others.

**Service Mesh Across Clouds**
Extending service mesh capabilities across multiple cloud providers or on-premises. Enables consistent security, observability, and traffic management for distributed services.

**Data Residency**
Legal requirement to store and process data within specific geographic boundaries. Multi-cloud strategies must account for compliance regulations like GDPR, HIPAA.

---

### Google Cloud Concepts

**Cloud Endpoints**
API management system for GCP that provides API gateway functionality. Supports OpenAPI, gRPC, and App Engine, offering authentication, monitoring, and rate limiting.

**OpenAPI Specification**
A standard format (formerly Swagger) for describing REST APIs. Cloud Endpoints uses OpenAPI to configure API behavior, validation, and documentation.

**API Versioning**
Managing multiple versions of an API simultaneously. Strategies include URL versioning (/v1/, /v2/), header-based, or query parameter versioning.

**Rate Limiting**
Controlling the number of API requests a client can make in a time period. Prevents abuse, ensures fair usage, and protects backend services from overload.

**API Analytics**
Monitoring and analyzing API usage patterns, performance metrics, error rates, and user behavior. Cloud Endpoints provides built-in analytics dashboards.

---

### System Design Concepts

**API Gateway**
Entry point for all client requests in a microservices architecture. Handles routing, authentication, rate limiting, request aggregation, and protocol translation.

**Request Routing**
Directing incoming requests to appropriate backend services based on URL paths, headers, or request content. Can include load balancing and versioning logic.

**Protocol Translation**
Converting between different communication protocols at the gateway. Examples: REST to gRPC, WebSocket to HTTP, or GraphQL to REST.

**Aggregation Pattern**
API Gateway pattern that combines multiple backend service calls into a single response. Reduces client-side complexity and network round trips.

**Backend for Frontend (BFF)**
Creating separate API gateway instances tailored for different client types (web, mobile, IoT). Each BFF optimizes data shape and aggregation for its specific frontend.

**Gateway Rate Limiting**
Implementing rate limits at the API gateway level to protect all backend services. Provides centralized throttling policy enforcement and quota management.

---

### DSA Concepts

**KMP Algorithm**
Knuth-Morris-Pratt string matching algorithm that avoids re-examining characters by using a failure function. Achieves O(n+m) time complexity by preprocessing the pattern.

**Rabin-Karp Algorithm**
String matching using hashing. Computes hash values for pattern and text windows, comparing hashes first. Useful for multiple pattern matching with average O(n+m) complexity.

**Boyer-Moore Algorithm**
Efficient string matching that scans pattern from right to left and uses bad character and good suffix rules. Can skip sections of text, achieving sublinear average case performance.

**Trie for Pattern Matching**
Tree structure where each node represents a character, used for efficient prefix matching and autocomplete. Enables O(m) search time where m is pattern length.

---

## ✅ Day 17 Completion Checklist
- [ ] Node.js: Build GraphQL server
- [ ] JavaScript: Understand HTTP/2 features
- [ ] React: Integrate Apollo Client
- [ ] Java: Implement gRPC service
- [ ] Spring Boot: Add GraphQL endpoint
- [ ] DevOps: Plan multi-cloud strategy
- [ ] GCP: Configure Cloud Endpoints
- [ ] System Design: Design API Gateway
- [ ] DSA: Implement KMP algorithm

---

**Tomorrow:** Day 18 - Serverless architectures, Edge computing
