# Day 1 - Foundations & Core Concepts

**Focus:** Core fundamentals, strengthen base knowledge

---

## 🔗 Quick Links to Concepts
[Node.js](#nodejs-concepts) | [JavaScript](#javascript-concepts) | [React.js](#reactjs-concepts) | [Java](#java-concepts) | [Spring Boot](#spring-boot-concepts) | [DevOps](#devops-concepts) | [Google Cloud](#google-cloud-concepts) | [System Design](#system-design-concepts) | [DSA](#dsa-concepts)

---

## ⏰ 30-Minute Study Blocks

### 1. Node.js (30 min)
**Topic:** Event Loop & Asynchronous Programming
- Event loop phases (timers, I/O callbacks, poll, check, close)
- Call stack, callback queue, microtask queue
- process.nextTick() vs setImmediate()
- How async operations work under the hood

### 2. JavaScript (30 min)
**Topic:** Closures & Scope
- Lexical scoping
- Closure creation and use cases
- Memory implications of closures
- Practical examples (counter, private variables, module pattern)
- Common interview questions

### 3. React.js (30 min)
**Topic:** React Hooks Fundamentals
- useState - state management basics
- useEffect - side effects and cleanup
- Dependency array behavior
- Rules of hooks
- Common mistakes and best practices

### 4. Java (30 min)
**Topic:** OOP Principles
- Encapsulation, Inheritance, Polymorphism, Abstraction
- SOLID principles overview
- Abstract classes vs Interfaces
- Method overriding vs overloading
- Access modifiers

### 5. Spring Boot (30 min)
**Topic:** Dependency Injection & IoC
- Inversion of Control concept
- @Component, @Service, @Repository annotations
- @Autowired and constructor injection
- Bean lifecycle
- ApplicationContext

### 6. DevOps (30 min)
**Topic:** Docker Fundamentals
- Containers vs VMs
- Docker architecture (daemon, client, registry)
- Dockerfile basics (FROM, RUN, COPY, CMD, ENTRYPOINT)
- Images vs containers
- Basic commands (build, run, ps, stop, rm)

### 7. Google Cloud (30 min)
**Topic:** GCP IAM & Security Basics
- IAM roles and permissions
- Service accounts
- Identity types (Google accounts, service accounts, groups)
- Principle of least privilege
- GCP resource hierarchy (Organization, Folder, Project, Resources)

### 8. System Design (30 min)
**Topic:** CAP Theorem & Consistency Models
- CAP theorem explained (Consistency, Availability, Partition Tolerance)
- Trade-offs between CP and AP systems
- Eventual consistency vs strong consistency
- Real-world examples (DynamoDB, Cassandra, PostgreSQL)

### 9. DSA (30 min)
**Topic:** Arrays & Two Pointers
- Array traversal techniques
- Two pointer pattern (same direction, opposite direction)
- Sliding window introduction
- Problems: Two Sum, Container With Most Water, Remove Duplicates

---

## 📖 Concept Definitions (Interview-Ready)

### Node.js Concepts

**Event Loop**
The event loop is Node.js's mechanism to handle asynchronous operations. It continuously checks if there are tasks to execute, processes them in specific phases, and allows JavaScript to be non-blocking despite being single-threaded.

**Event Loop Phases**
Six phases that the event loop cycles through: 1) timers (setTimeout/setInterval), 2) pending callbacks (I/O callbacks), 3) idle/prepare (internal), 4) poll (retrieve new I/O events), 5) check (setImmediate), 6) close callbacks (socket.on('close')).

**Call Stack**
A data structure that tracks function execution. When a function is called, it's pushed onto the stack; when it returns, it's popped off. JavaScript executes code synchronously using this stack.

**Callback Queue**
A queue that holds callbacks from asynchronous operations like setTimeout. When the call stack is empty, the event loop moves callbacks from this queue to the call stack.

**Microtask Queue**
A special queue with higher priority than the callback queue. It holds Promises and process.nextTick() callbacks. All microtasks are executed before the event loop continues to the next phase.

**process.nextTick()**
Executes a callback immediately after the current operation, before the event loop continues. It has the highest priority, even higher than Promises.

**setImmediate()**
Executes a callback in the next iteration of the event loop, specifically in the "check" phase. It runs after I/O operations.

---

### JavaScript Concepts

**Lexical Scoping**
Variables are accessible based on where they are defined in the code (their physical location). Inner functions can access variables from outer functions, but not vice versa.

**Closure**
A function that remembers and can access variables from its outer (enclosing) function's scope, even after the outer function has finished executing. Closures "close over" their environment.

**Closure Use Cases**
Data privacy (private variables), factory functions, function currying, callbacks with preserved state, module pattern for encapsulation.

---

### React.js Concepts

**useState**
is a Hook that allows functional components to maintain local state. React stores state internally in Fiber Hook objects and updates it through an update queue, triggering efficient re-renders when state changes. Example: `const [count, setCount] = useState(0)`.

**useEffect**
A Hook for side effects (data fetching, subscriptions, DOM manipulation). Runs after render. Can return a cleanup function and accepts a dependency array to control when it runs.

**Dependency Array**
The second argument to useEffect that determines when the effect runs: empty array [] = once on mount, no array = every render, [dep1, dep2] = when dependencies change.

**Rules of Hooks**
1) Only call Hooks at the top level (not inside loops/conditions/nested functions). 2) Only call Hooks from React functions (components or custom hooks).

---

### Java Concepts

**Encapsulation**
Bundling data (variables) and methods that operate on that data within a single unit (class), and restricting direct access to some components. Use private fields with public getter/setter methods.

**Inheritance**
A mechanism where a new class (child/subclass) derives properties and behaviors from an existing class (parent/superclass) using the `extends` keyword. Promotes code reuse.

**Polymorphism**
"Many forms" - the ability of objects to take multiple forms. Method overriding (runtime polymorphism) allows subclasses to provide specific implementation. Method overloading (compile-time polymorphism) uses same method name with different parameters.

**Abstraction**
Hiding complex implementation details and showing only essential features. Achieved through abstract classes and interfaces. Focuses on "what" an object does, not "how".

**SOLID Principles**
S - Single Responsibility (one class = one purpose), O - Open/Closed (open for extension, closed for modification), L - Liskov Substitution (subclasses should be substitutable for parent), I - Interface Segregation (many specific interfaces > one general), D - Dependency Inversion (depend on abstractions, not concrete classes).

**Abstract Class vs Interface**
Abstract class: Can have both abstract and concrete methods, can have state (variables), single inheritance. Interface: Only abstract methods (Java 8+ allows default), no state, multiple inheritance.

**Method Overriding vs Overloading**
Overriding: Same method signature in child class as parent (runtime polymorphism). Overloading: Same method name but different parameters in same class (compile-time polymorphism).

---

### Spring Boot Concepts

**Inversion of Control (IoC)**
A design principle where the framework controls object creation and dependency management, rather than the application code creating objects. Spring container manages object lifecycle.

**Dependency Injection (DI)**
A pattern where objects receive their dependencies from external sources rather than creating them. Spring injects dependencies automatically using @Autowired or constructor injection.

**@Component**
Marks a class as a Spring-managed bean. Spring auto-detects and registers it in the application context. Generic stereotype annotation.

**@Service**
Specialization of @Component for service layer classes that contain business logic. Semantically indicates the role of the class.

**@Repository**
Specialization of @Component for data access layer classes. Provides additional exception translation for database operations.

**@Autowired**
Tells Spring to inject a dependency automatically. Can be used on constructors, setters, or fields. Constructor injection is recommended for mandatory dependencies.

**Bean Lifecycle**
Instantiation → Populate Properties → setBeanName() → setBeanFactory() → postProcessBeforeInitialization() → afterPropertiesSet() / custom init → postProcessAfterInitialization() → Bean Ready → destroy() on shutdown.

**ApplicationContext**
The central interface for Spring IoC container. It manages beans, handles dependency injection, provides configuration, and offers enterprise services like event propagation and internationalization.

---

### DevOps Concepts

**Container**
A lightweight, standalone package that includes application code, runtime, libraries, and dependencies. Containers share the host OS kernel, making them faster and smaller than VMs.

**Virtual Machine (VM)**
A complete virtualization of hardware and OS. Each VM runs its own OS, making it heavier but providing stronger isolation than containers.

**Docker**
A platform for developing, shipping, and running applications in containers. Ensures consistency across development, testing, and production environments.

**Docker Daemon**
A background service that manages Docker containers, images, networks, and volumes. It listens for Docker API requests.

**Docker Image**
A read-only template with instructions for creating a container. Built from a Dockerfile. Contains the application code and all dependencies.

**Docker Container**
A runnable instance of a Docker image. Containers are isolated from each other and the host but share the OS kernel.

**Dockerfile**
A text file containing instructions to build a Docker image. Commands include FROM (base image), RUN (execute commands), COPY (copy files), CMD (default command), ENTRYPOINT (main command).

---

### Google Cloud Concepts

**IAM (Identity and Access Management)**
A framework for managing who (identity) can do what (permissions) on which resources. Controls access to GCP services.

**IAM Roles**
Collections of permissions. Three types: Primitive (Owner, Editor, Viewer), Predefined (service-specific), Custom (user-defined granular permissions).

**Service Account**
A special type of account used by applications and VMs to make API calls, not by end users. Has an email address and uses cryptographic keys for authentication.

**Principle of Least Privilege**
Security best practice of giving users/services only the minimum permissions needed to perform their tasks, nothing more.

**GCP Resource Hierarchy**
Organization (root) → Folders (group projects) → Projects (billing/resources boundary) → Resources (VMs, buckets, etc). IAM policies are inherited down the hierarchy.

---

### System Design Concepts

**CAP Theorem**
In a distributed system, you can only guarantee 2 out of 3: Consistency (all nodes see same data), Availability (system always responds), Partition Tolerance (system works despite network failures). Must choose between CP or AP.

**Consistency**
All nodes in a distributed system see the same data at the same time. Every read receives the most recent write.

**Availability**
Every request receives a response (success or failure), even if some nodes are down. The system remains operational.

**Partition Tolerance**
The system continues to function even if network communication between nodes fails (network partition occurs).

**Eventual Consistency**
A consistency model where all replicas will eventually have the same data, but not immediately. Temporary inconsistencies are acceptable. Used by AP systems.

**Strong Consistency**
After a write, all subsequent reads will see that write. Immediate consistency across all nodes. Used by CP systems.

---

### DSA Concepts

**Array**
A data structure that stores elements of the same type in contiguous memory locations. Allows O(1) random access by index but O(n) insertion/deletion in middle.

**Two Pointers Pattern**
An algorithm technique using two pointers to traverse an array/list. Types: 1) Opposite direction (start and end moving towards each other), 2) Same direction (slow and fast pointers).

**Sliding Window**
A technique to track a subset of data in an array/string using two pointers that create a "window". The window slides through the data to solve problems efficiently (often reducing O(n²) to O(n)).

**Time Complexity - Two Pointers**
Usually O(n) because each pointer traverses the array at most once, making it more efficient than nested loops O(n²).

---

## ✅ Day 1 Completion Checklist
- [ ] Node.js: Understand event loop phases
- [ ] JavaScript: Master closures concept
- [ ] React: Implement basic hooks
- [ ] Java: Explain SOLID principles
- [ ] Spring Boot: Understand DI container
- [ ] DevOps: Create a Dockerfile
- [ ] GCP: Understand IAM roles
- [ ] System Design: Explain CAP theorem
- [ ] DSA: Solve 2-3 two-pointer problems

---

## 📝 Notes Section
(Add your learnings, insights, and questions here)

---

**Tomorrow:** Day 2 - Async patterns, Prototypes, Custom Hooks, Collections, REST APIs, CI/CD, Compute Engine, Load Balancing, Linked Lists
