# Day 6 - Design Patterns & Microservices Intro

**Date:** May 23, 2026
**Focus:** Design patterns, architecture patterns, microservices foundations

## 🔗 Quick Links to Concepts
[Node.js](#nodejs-concepts) | [JavaScript](#javascript-concepts) | [React.js](#reactjs-concepts) | [Java](#java-concepts) | [Spring Boot](#spring-boot-concepts) | [DevOps](#devops-concepts) | [Google Cloud](#google-cloud-concepts) | [System Design](#system-design-concepts) | [DSA](#dsa-concepts)

---

## ⏰ 30-Minute Study Blocks

### 1. Node.js (30 min)
**Topic:** Design Patterns in Node.js
- Singleton pattern
- Factory pattern
- Observer pattern (EventEmitter)
- Middleware pattern (Express)
- Module pattern
- Dependency injection in Node.js

### 2. JavaScript (30 min)
**Topic:** Advanced Object Patterns
- Factory functions
- Constructor pattern
- Module pattern with IIFE
- Revealing module pattern
- Mixins
- Decorator pattern

### 3. React.js (30 min)
**Topic:** Advanced Component Patterns
- Higher-Order Components (HOC)
- Render props pattern
- Compound components
- Controlled vs uncontrolled components
- Container vs presentational components

### 4. Java (30 min)
**Topic:** Design Patterns - Creational
- Singleton pattern
- Factory pattern
- Abstract Factory
- Builder pattern
- Prototype pattern
- When to use each pattern

### 5. Spring Boot (30 min)
**Topic:** Microservices Basics
- Monolith vs microservices
- Service discovery concepts
- API Gateway pattern
- Spring Cloud introduction
- Inter-service communication (REST, messaging)

### 6. DevOps (30 min)
**Topic:** Infrastructure as Code (IaC)
- Terraform basics
- Configuration management vs IaC
- Infrastructure drift
- State management
- Terraform providers and resources
- terraform init, plan, apply

### 7. Google Cloud (30 min)
**Topic:** Cloud Functions (Serverless)
- Function as a Service (FaaS) concepts
- Cloud Functions triggers (HTTP, Pub/Sub, Storage)
- Cold start vs warm start
- Use cases for serverless
- Pricing model
- Event-driven architecture

### 8. System Design (30 min)
**Topic:** API Design & RESTful Best Practices
- REST principles
- HTTP methods and idempotency
- Versioning strategies
- Pagination, filtering, sorting
- HATEOAS
- API rate limiting
- GraphQL vs REST

### 9. DSA (30 min)
**Topic:** Binary Search & Variations
- Binary search algorithm
- Search in rotated sorted array
- Find peak element
- Square root using binary search
- Time complexity: O(log n)

---

## 📖 Concept Definitions (Interview-Ready)

### Node.js Concepts

**Singleton Pattern**
Ensures a class has only one instance throughout the application and provides a global access point to it. In Node.js, modules are cached after first load, naturally implementing singleton behavior.

**Factory Pattern**
A creational pattern that provides an interface for creating objects without specifying their exact classes. Returns instances based on input parameters or conditions, promoting loose coupling.

**Observer Pattern**
A behavioral pattern where an object (subject) maintains a list of dependents (observers) and notifies them of state changes. EventEmitter in Node.js implements this pattern for event-driven programming.

**Middleware Pattern**
A design pattern where functions are chained together to process requests sequentially. Each middleware can modify request/response objects, end the cycle, or call the next middleware using `next()`.

**Module Pattern**
Encapsulates code within a module scope to create private and public members. Node.js CommonJS and ES6 modules use this pattern to prevent global namespace pollution.

**Dependency Injection**
A technique where dependencies are provided to a module rather than hard-coded within it. Promotes testability, flexibility, and loose coupling by inverting control of dependency creation.

---

### JavaScript Concepts

**Factory Functions**
Functions that return new objects without using the `new` keyword or classes. Provides flexibility in object creation and avoids issues with the `this` keyword.

**Constructor Pattern**
Uses constructor functions with the `new` keyword to create objects. Sets up the prototype chain and binds `this` to the new instance.

**Module Pattern with IIFE**
Uses Immediately Invoked Function Expressions to create private scope and expose only public methods/properties. Returns an object with public interface while keeping internals private.

**Revealing Module Pattern**
A variation of the module pattern where all functions are defined in private scope, and only references to desired public functions are returned. Makes code more readable.

**Mixins**
A pattern to add functionality to objects by copying properties from one object to another. Allows composition of behaviors without inheritance.

**Decorator Pattern**
Adds new functionality to objects dynamically without modifying their structure. Wraps objects to extend behavior while keeping the same interface.

---

### React.js Concepts

**Higher-Order Component (HOC)**
A function that takes a component and returns a new enhanced component. Used for code reuse, logic abstraction, and adding functionality like authentication or data fetching.

**Render Props Pattern**
A technique where a component receives a function as a prop that returns a React element. Allows sharing stateful logic between components by passing render logic as a prop.

**Compound Components**
A pattern where multiple components work together to form a complete UI feature. Components share implicit state, like `<Select>` and `<Option>` working together.

**Controlled vs Uncontrolled Components**
Controlled: Form data is handled by React state (single source of truth). Uncontrolled: Form data is handled by the DOM itself, accessed via refs when needed.

**Container vs Presentational Components**
Container components handle logic, state, and data fetching. Presentational components receive data via props and focus on rendering UI, promoting separation of concerns.

---

### Java Concepts

**Singleton Pattern (Java)**
Restricts class instantiation to a single object. Implemented using private constructor, static instance variable, and public static method to access the instance. Useful for configuration objects or connection pools.

**Factory Pattern (Java)**
Defines an interface for creating objects but lets subclasses decide which class to instantiate. Promotes loose coupling by eliminating the need to bind application-specific classes into code.

**Abstract Factory**
Provides an interface for creating families of related objects without specifying their concrete classes. A factory of factories that groups related product families.

**Builder Pattern**
Separates object construction from representation, allowing step-by-step creation of complex objects. Useful for objects with many optional parameters, avoiding telescoping constructors.

**Prototype Pattern**
Creates new objects by cloning an existing object (prototype) rather than instantiating from a class. Useful when object creation is expensive or complex.

---

### Spring Boot Concepts

**Monolith vs Microservices**
Monolith: Single deployable unit containing all functionality, simpler but less scalable. Microservices: Application split into small independent services, each deployable separately, offering better scalability and technology flexibility.

**Service Discovery**
Mechanism for services to automatically find and communicate with each other in a microservices architecture. Tools like Eureka or Consul maintain a registry of available service instances.

**API Gateway Pattern**
A single entry point for all client requests in microservices. Handles routing, authentication, rate limiting, and request aggregation, simplifying client interaction with multiple services.

**Spring Cloud**
A framework providing tools for building distributed systems and microservices. Includes service discovery, configuration management, circuit breakers, and API gateways.

**Inter-service Communication**
Methods for microservices to communicate: synchronous (REST, gRPC) for immediate responses, or asynchronous (message queues like RabbitMQ, Kafka) for decoupled, event-driven communication.

---

### DevOps Concepts

**Infrastructure as Code (IaC)**
Managing and provisioning infrastructure through machine-readable files rather than manual processes. Enables version control, repeatability, and automation of infrastructure setup.

**Terraform**
An open-source IaC tool that uses declarative configuration files to define infrastructure. Supports multiple cloud providers and manages infrastructure lifecycle through state files.

**Configuration Management vs IaC**
Configuration management (Ansible, Chef) focuses on configuring and maintaining software on existing servers. IaC (Terraform, CloudFormation) focuses on provisioning the infrastructure itself.

**Infrastructure Drift**
When actual infrastructure state differs from the defined configuration due to manual changes. Terraform detects drift by comparing actual state with desired state.

**State Management (Terraform)**
Terraform maintains a state file tracking resource metadata and dependencies. State enables Terraform to know what infrastructure exists and what changes are needed.

**Terraform Workflow**
`init` downloads providers and initializes backend, `plan` shows what changes will be made, `apply` executes changes to reach desired state. Terraform compares current state to desired configuration.

---

### Google Cloud Concepts

**Function as a Service (FaaS)**
A serverless computing model where you write individual functions that execute in response to events. Cloud provider manages all infrastructure, scaling, and execution.

**Cloud Functions**
Google's FaaS offering for running code without managing servers. Functions are event-driven, stateless, and automatically scale based on load.

**Cloud Functions Triggers**
Events that invoke functions: HTTP requests (REST endpoints), Pub/Sub messages, Cloud Storage changes, Firestore events, Firebase events. Enables event-driven architecture.

**Cold Start vs Warm Start**
Cold start: Function instance initialization when invoked for first time or after idle period (slower). Warm start: Reusing existing instance for subsequent requests (faster). Impacts latency.

**Serverless Use Cases**
API backends, webhooks, data processing, scheduled tasks, real-time file processing, IoT data handling. Best for sporadic workloads and event-driven scenarios.

**Serverless Pricing Model**
Pay only for execution time and resources consumed. No charges when functions aren't running. Cost based on number of invocations, compute time, and memory allocated.

---

### System Design Concepts

**REST (Representational State Transfer)**
An architectural style for designing networked applications using HTTP. Resources are identified by URIs, operations use standard HTTP methods, and communication is stateless.

**HTTP Methods and Idempotency**
GET, PUT, DELETE are idempotent (same result regardless of repetition). POST is not idempotent. Understanding idempotency is crucial for reliable API design and error handling.

**API Versioning Strategies**
URI versioning (/v1/users), header versioning (Accept: application/vnd.api.v1+json), query parameter (?version=1). Each has trade-offs for backward compatibility and client migration.

**Pagination**
Breaking large result sets into smaller pages. Offset-based (page=2&limit=20) is simple but slow for large offsets. Cursor-based (cursor=token) is more efficient for large datasets.

**HATEOAS**
Hypermedia As The Engine Of Application State - REST principle where API responses include links to related actions/resources. Enables self-documenting APIs and client flexibility.

**API Rate Limiting**
Restricting the number of API requests a client can make in a time window. Prevents abuse, ensures fair usage, and protects backend systems from overload.

**GraphQL vs REST**
GraphQL: Single endpoint, clients specify exact data needed, reduces over/under-fetching. REST: Multiple endpoints, fixed data structures, simpler caching. Choose based on use case complexity.

---

### DSA Concepts

**Binary Search**
A divide-and-conquer algorithm that finds an element in a sorted array by repeatedly halving the search space. Time complexity O(log n), requires sorted input.

**Binary Search Algorithm**
Compare target with middle element. If equal, found. If target is smaller, search left half. If larger, search right half. Repeat until found or search space is empty.

**Search in Rotated Sorted Array**
A variation where sorted array is rotated at a pivot. Determine which half is sorted, then decide which half to search. Still achieves O(log n) time.

**Find Peak Element**
An element greater than its neighbors. Binary search determines which side has a peak by comparing middle with neighbors and moving toward the higher neighbor.

**Square Root Using Binary Search**
Find largest integer whose square is less than or equal to target. Binary search between 1 and target, comparing mid*mid with target to narrow range.

---

## ✅ Day 6 Completion Checklist
- [ ] Node.js: Implement design patterns
- [ ] JavaScript: Use module pattern
- [ ] React: Create HOC example
- [ ] Java: Implement Singleton and Factory
- [ ] Spring Boot: Understand microservices architecture
- [ ] DevOps: Write basic Terraform config
- [ ] GCP: Deploy a Cloud Function
- [ ] System Design: Design RESTful API
- [ ] DSA: Solve binary search problems

---

**Tomorrow:** Day 7 - Behavioral patterns, State management, Messaging, Service mesh
