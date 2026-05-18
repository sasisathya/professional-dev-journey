# Day 5 - Security, Testing & Validation

**Focus:** Security practices, testing, validation, error handling

## 🔗 Quick Links to Concepts
[Node.js](#nodejs-concepts) | [JavaScript](#javascript-concepts) | [React.js](#reactjs-concepts) | [Java](#java-concepts) | [Spring Boot](#spring-boot-concepts) | [DevOps](#devops-concepts) | [Google Cloud](#google-cloud-concepts) | [System Design](#system-design-concepts) | [DSA](#dsa-concepts)

---

## ⏰ 30-Minute Study Blocks

### 1. Node.js (30 min)
**Topic:** Security Best Practices
- Input validation and sanitization
- SQL injection prevention
- XSS and CSRF protection
- Authentication vs authorization
- JWT tokens
- Helmet.js for security headers
- Environment variables and secrets management

### 2. JavaScript (30 min)
**Topic:** Testing Fundamentals
- Unit testing concepts
- Jest basics
- Writing test cases
- Mocking and stubbing
- Test coverage
- TDD principles

### 3. React.js (30 min)
**Topic:** State Management with Redux
- Redux core concepts (store, actions, reducers)
- Redux Toolkit
- useSelector and useDispatch
- Middleware (redux-thunk)
- When to use Redux vs Context

### 4. Java (30 min)
**Topic:** Exception Handling
- Checked vs unchecked exceptions
- try-catch-finally blocks
- throw vs throws
- Custom exceptions
- Best practices for exception handling
- try-with-resources

### 5. Spring Boot (30 min)
**Topic:** Validation & Error Handling
- @Valid and validation annotations (@NotNull, @Size, @Email)
- BindingResult
- @ControllerAdvice and @ExceptionHandler
- Custom validators
- Global error handling
- ResponseEntity for error responses

### 6. DevOps (30 min)
**Topic:** Docker Compose & Multi-Container Apps
- docker-compose.yml structure
- Services, networks, volumes
- Environment variables in compose
- depends_on and service dependencies
- docker-compose commands (up, down, logs)
- Orchestrating multi-tier applications

### 7. Google Cloud (30 min)
**Topic:** Cloud SQL & Managed Databases
- Cloud SQL instances (MySQL, PostgreSQL)
- High availability and backups
- Connecting from applications
- Private IP vs public IP
- Cloud SQL Proxy
- Database flags and configuration

### 8. System Design (30 min)
**Topic:** Message Queues & Event-Driven Architecture
- Message queue benefits
- RabbitMQ, Kafka basics
- Pub-Sub pattern
- Event sourcing
- CQRS (Command Query Responsibility Segregation)
- When to use message queues

### 9. DSA (30 min)
**Topic:** Trees & Binary Trees
- Tree terminology (root, leaf, height, depth)
- Binary tree traversals (inorder, preorder, postorder, level-order)
- Binary Search Tree properties
- Problems: Max Depth, Invert Binary Tree, Validate BST

---

## 📖 Concept Definitions (Interview-Ready)

### Node.js Concepts

**Input Validation**
Checking and verifying user input before processing to ensure it meets expected format, type, and constraints. First line of defense against malicious data.

**Input Sanitization**
Cleaning user input by removing or encoding potentially dangerous characters. Prevents code injection attacks by making input safe for processing.

**SQL Injection**
Attack where malicious SQL code is inserted into input fields to manipulate database queries. Prevented by using parameterized queries/prepared statements, never concatenating user input into SQL.

**XSS (Cross-Site Scripting)**
Attack that injects malicious scripts into web pages viewed by other users. Prevented by sanitizing output, escaping HTML, using Content Security Policy, and validating input.

**CSRF (Cross-Site Request Forgery)**
Attack that tricks users into executing unwanted actions on authenticated sites. Prevented by using CSRF tokens, SameSite cookies, and verifying origin headers.

**Authentication vs Authorization**
Authentication verifies who you are (login, credentials). Authorization determines what you can access (permissions, roles). Both are essential for security.

**JWT (JSON Web Token)**
Self-contained token for securely transmitting information between parties as JSON. Contains header, payload, and signature. Commonly used for authentication in stateless APIs.

**Helmet.js**
Node.js middleware that sets various HTTP headers to protect against common web vulnerabilities. Includes security headers like Content-Security-Policy, X-Frame-Options, and HSTS.

**Environment Variables**
Configuration values stored outside the code, typically in .env files. Used for sensitive data like API keys, database credentials. Never commit secrets to version control.

**Secrets Management**
Secure storage and handling of sensitive information. Use environment variables, secret managers (AWS Secrets Manager, Azure Key Vault), encrypted storage, and rotation policies.

---

### JavaScript Concepts

**Unit Testing**
Testing individual functions or components in isolation. Verifies that each unit works correctly independently. Fast, easy to write, foundation of test pyramid.

**Jest**
Popular JavaScript testing framework. Provides test runner, assertions, mocking, coverage reports. Zero-config for most projects. Syntax: describe, test/it, expect.

**Test Cases**
Specific scenarios to verify code behavior. Include: setup (arrange), execution (act), assertion (assert). Should cover normal cases, edge cases, and error conditions.

**Mocking**
Creating fake versions of functions, modules, or objects for testing. Isolates code being tested from dependencies. Jest provides jest.mock(), jest.fn(), jest.spyOn().

**Stubbing**
Providing predetermined responses from functions during tests. Replaces real implementations with test-controlled behavior. Similar to mocking but focuses on return values.

**Test Coverage**
Metric showing percentage of code executed during tests. Measures lines, branches, functions, statements covered. High coverage doesn't guarantee quality but low coverage indicates gaps.

**TDD (Test-Driven Development)**
Development approach: write failing test first, write minimal code to pass, refactor. Red-Green-Refactor cycle. Ensures testable code and good coverage.

---

### React.js Concepts

**Redux**
Predictable state management library for JavaScript apps. Centralizes application state in a single store. Follows unidirectional data flow with actions, reducers, and store.

**Store**
Single source of truth holding the entire application state tree. Created with createStore() or configureStore(). Components subscribe to store for updates.

**Actions**
Plain JavaScript objects describing what happened. Must have a type property. Dispatched to trigger state changes. Example: { type: 'ADD_TODO', payload: 'Learn Redux' }.

**Reducers**
Pure functions that take current state and action, return new state. Never mutate state directly. Example: (state, action) => newState. Combined with combineReducers().

**Redux Toolkit**
Official recommended way to write Redux logic. Includes configureStore, createSlice, createAsyncThunk. Reduces boilerplate, provides good defaults, prevents common mistakes.

**useSelector**
React-Redux hook to extract data from Redux store state. Subscribes component to store. Re-renders when selected state changes. Example: const todos = useSelector(state => state.todos).

**useDispatch**
React-Redux hook that returns reference to dispatch function. Used to dispatch actions to store. Example: const dispatch = useDispatch(); dispatch(addTodo()).

**Redux Middleware**
Extension point between dispatching an action and reaching the reducer. Used for async logic, logging, crash reporting. Examples: redux-thunk, redux-saga.

**redux-thunk**
Middleware that allows action creators to return functions instead of actions. Enables async operations like API calls before dispatching actions.

**Redux vs Context**
Redux: Better for complex state, frequent updates, middleware needs, time-travel debugging. Context: Simpler, built-in, good for infrequent updates, theme/locale. Redux has more boilerplate but better DevTools.

---

### Java Concepts

**Checked Exceptions**
Exceptions that must be caught or declared in method signature with throws. Checked at compile time. Examples: IOException, SQLException. Used for recoverable conditions.

**Unchecked Exceptions**
Exceptions that don't need to be declared or caught. Extend RuntimeException. Examples: NullPointerException, IllegalArgumentException. Used for programming errors.

**try-catch-finally**
Exception handling structure. try block contains code that might throw. catch handles specific exceptions. finally always executes (cleanup), whether exception occurs or not.

**throw vs throws**
throw is used to explicitly throw an exception in code. throws declares that a method might throw exceptions, added to method signature. throw is execution, throws is declaration.

**Custom Exceptions**
User-defined exception classes extending Exception (checked) or RuntimeException (unchecked). Provide specific error information. Include constructors and meaningful messages.

**Exception Handling Best Practices**
Catch specific exceptions, not Exception. Don't swallow exceptions (empty catch). Log properly. Use custom exceptions for business logic. Clean up resources. Don't use exceptions for flow control.

**try-with-resources**
Automatically closes resources that implement AutoCloseable. Syntax: try (Resource r = new Resource()). Ensures proper cleanup even if exceptions occur. Introduced in Java 7.

---

### Spring Boot Concepts

**@Valid**
Triggers validation on method parameters or return values. Used with @RequestBody to validate incoming request data. Works with JSR-303/JSR-380 validation annotations.

**Validation Annotations**
@NotNull (not null), @NotEmpty (not null and not empty), @NotBlank (not null and contains non-whitespace), @Size (min/max length), @Email (valid email), @Min/@Max (numeric bounds), @Pattern (regex).

**BindingResult**
Holds validation errors and binding results. Placed immediately after @Valid parameter. Use hasErrors() to check for validation failures and getFieldErrors() to get error details.

**@ControllerAdvice**
Global exception handler for all controllers. Centralized error handling across the application. Can apply to specific packages or annotations.

**@ExceptionHandler**
Method annotation to handle specific exceptions. Used within @ControllerAdvice or controller. Returns error response, can customize status codes and messages.

**Custom Validators**
Implement ConstraintValidator for custom validation logic. Create custom annotation and validator class. Useful for complex business rules not covered by standard annotations.

**Global Error Handling**
Centralized approach using @ControllerAdvice with @ExceptionHandler methods. Provides consistent error responses, cleaner controllers, separation of concerns.

**Error Response Pattern**
Standardized error response structure: timestamp, status code, error message, path, validation errors. Helps API consumers understand and handle errors consistently.

---

### DevOps Concepts

**docker-compose.yml**
Configuration file defining multi-container Docker applications. YAML format specifying services, networks, volumes. Makes complex setups reproducible with single command.

**Services (Docker Compose)**
Individual containers defined in compose file. Each service specifies image, build context, ports, environment, volumes, dependencies. Example: web, database, redis.

**Networks (Docker Compose)**
Connect services together. Default network created automatically. Custom networks for isolation. Services on same network can communicate using service names as hostnames.

**Volumes (Docker Compose)**
Persist data outside container lifecycle. Named volumes for shared data. Bind mounts for development. Volume definitions separate from service usage.

**Environment Variables (Docker Compose)**
Configuration passed to containers. Defined inline, in environment section, or .env file. Used for secrets, configuration, feature flags. Example: DATABASE_URL.

**depends_on**
Specifies service dependencies and startup order. Example: web depends_on database. Note: only controls startup order, not readiness. Use health checks for true dependency management.

**docker-compose Commands**
up (create and start), down (stop and remove), logs (view output), ps (list containers), exec (run command in container), build (rebuild images).

---

### Google Cloud Concepts

**Cloud SQL**
Fully managed relational database service. Supports MySQL, PostgreSQL, SQL Server. Handles replication, patching, backups automatically. Easy scaling and high availability.

**Cloud SQL Instances**
Database server instances. Choose database engine, region, machine type, storage size. Can configure high availability, read replicas, automated backups.

**High Availability (Cloud SQL)**
Multi-zone deployment with automatic failover. Primary and standby instances. Protects against zone failures. Higher cost but better reliability.

**Cloud SQL Backups**
Automated daily backups with point-in-time recovery. On-demand backups available. Stored separately from instance. Retention period configurable up to 365 days.

**Cloud SQL Connections**
Public IP (accessible from internet with whitelisted IPs), Private IP (VPC-only, more secure), Cloud SQL Proxy (encrypted connection without whitelisting). Private IP recommended for production.

**Cloud SQL Proxy**
Secure connector to Cloud SQL without firewall rules. Provides encryption and IAM-based authentication. Runs locally or in containers alongside applications.

**Database Flags**
Configuration parameters for database behavior. Examples: max_connections, character_set_server, slow_query_log. Set at instance level, some require restart.

---

### System Design Concepts

**Message Queue**
System for asynchronous communication between services. Producers send messages, consumers process them. Decouples services, handles load spikes, enables retry logic.

**Message Queue Benefits**
Decoupling (services independent), scalability (buffer between systems), reliability (persist messages), async processing (don't block), load leveling (smooth traffic spikes).

**RabbitMQ**
Message broker implementing AMQP protocol. Supports routing, queues, exchanges. Reliable delivery, clustering, management UI. Good for complex routing patterns.

**Apache Kafka**
Distributed streaming platform. High throughput, durability, horizontal scaling. Stores messages as log. Better for event streaming, analytics, high-volume scenarios.

**Pub-Sub Pattern**
Publishers send messages to topics, subscribers receive copies. One-to-many relationship. Decouples producers and consumers. Examples: Google Pub/Sub, AWS SNS.

**Event Sourcing**
Storing state changes as sequence of events rather than current state. Events are immutable and append-only. Enables audit trails, temporal queries, and state reconstruction.

**CQRS (Command Query Responsibility Segregation)**
Separates read and write operations into different models. Commands modify state, queries read state. Optimizes each independently. Often paired with event sourcing.

**When to Use Message Queues**
Async processing, task distribution, workload buffering, service decoupling, reliable delivery, handling traffic spikes, background jobs, microservices communication.

---

### DSA Concepts

**Binary Tree**
Tree structure where each node has at most two children (left and right). Root at top, leaves at bottom. Used in hierarchical data representation.

**Tree Terminology**
Root (top node), Leaf (no children), Height (longest path to leaf), Depth (distance from root), Parent/Child (direct connection), Sibling (same parent).

**Binary Tree Traversals**
Systematic ways to visit all nodes. Inorder (left-root-right), Preorder (root-left-right), Postorder (left-right-root), Level-order (breadth-first, level by level).

**Inorder Traversal**
Visit left subtree, then root, then right subtree. For BST, gives nodes in sorted order. Implementation: recursion or stack-based.

**Preorder Traversal**
Visit root, then left subtree, then right subtree. Used for creating tree copy, prefix expression. Root processed before children.

**Postorder Traversal**
Visit left subtree, then right subtree, then root. Used for deleting tree, postfix expression. Root processed after children.

**Level-Order Traversal (BFS)**
Visit nodes level by level, left to right. Uses queue data structure. Good for finding shortest path, level-based operations.

**Binary Search Tree (BST)**
Binary tree where left subtree has smaller values, right subtree has larger values. Enables efficient search, insert, delete (O(log n) average). Degrades to O(n) if unbalanced.

**BST Properties**
Left descendants < Node < Right descendants. Inorder traversal gives sorted sequence. No duplicate values (in standard BST). Search, insert, delete operations follow tree structure.

---

## ✅ Day 5 Completion Checklist
- [ ] Node.js: Implement JWT authentication
- [ ] JavaScript: Write unit tests with Jest
- [ ] React: Set up Redux in a project
- [ ] Java: Handle exceptions properly
- [ ] Spring Boot: Add validation to REST endpoints
- [ ] DevOps: Create docker-compose.yml
- [ ] GCP: Set up Cloud SQL instance
- [ ] System Design: Understand message queues
- [ ] DSA: Solve tree traversal problems

---

## 🎉 Week 1 Complete!

You've covered foundational concepts across all 9 topics. Take time to review and practice.

**Next Week:** Design patterns, advanced architectures, microservices basics
