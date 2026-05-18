# Day 2 - Async Patterns & Collections

**Focus:** Asynchronous patterns, data structures, HTTP basics

## 🔗 Quick Links to Concepts
[Node.js](#nodejs-concepts) | [JavaScript](#javascript-concepts) | [React.js](#reactjs-concepts) | [Java](#java-concepts) | [Spring Boot](#spring-boot-concepts) | [DevOps](#devops-concepts) | [Google Cloud](#google-cloud-concepts) | [System Design](#system-design-concepts) | [DSA](#dsa-concepts)

---

## ⏰ 30-Minute Study Blocks

### 1. Node.js (30 min)
**Topic:** Promises, Async/Await & Error Handling
- Promise states (pending, fulfilled, rejected)
- Promise chaining and Promise.all, Promise.race
- async/await syntax and benefits
- Error handling with try/catch
- Callback hell vs modern async patterns

### 2. JavaScript (30 min)
**Topic:** Prototypes & Inheritance
- Prototype chain
- `__proto__` vs `prototype`
- Constructor functions
- Object.create()
- ES6 classes vs prototypal inheritance
- `this` binding in different contexts

### 3. React.js (30 min)
**Topic:** Custom Hooks & useRef
- Creating custom hooks
- useRef for DOM manipulation
- useRef vs useState
- Ref forwarding
- When to create custom hooks

### 4. Java (30 min)
**Topic:** Collections Framework
- List (ArrayList, LinkedList)
- Set (HashSet, TreeSet)
- Map (HashMap, TreeMap, LinkedHashMap)
- Queue, Deque
- When to use which collection
- Time complexities

### 5. Spring Boot (30 min)
**Topic:** REST API Basics
- @RestController vs @Controller
- @GetMapping, @PostMapping, @PutMapping, @DeleteMapping
- @PathVariable, @RequestParam, @RequestBody
- ResponseEntity
- HTTP status codes

### 6. DevOps (30 min)
**Topic:** CI/CD Fundamentals
- Continuous Integration vs Continuous Deployment
- CI/CD pipeline stages (build, test, deploy)
- GitHub Actions basics
- Jenkins overview
- Pipeline as code

### 7. Google Cloud (30 min)
**Topic:** Compute Engine & VM Instances
- VM instance types and machine families
- Preemptible VMs
- Instance groups (managed, unmanaged)
- Startup scripts
- SSH access and metadata

### 8. System Design (30 min)
**Topic:** Load Balancing & Reverse Proxy
- Load balancer types (L4 vs L7)
- Load balancing algorithms (round-robin, least connections, IP hash)
- Reverse proxy vs forward proxy
- Nginx basics
- Health checks

### 9. DSA (30 min)
**Topic:** Linked Lists
- Singly vs doubly linked lists
- Common operations (insert, delete, reverse)
- Fast & slow pointer technique
- Problems: Reverse Linked List, Detect Cycle, Middle of List

---

## 📖 Concept Definitions (Interview-Ready)

### Node.js Concepts

**Promise**
An object representing the eventual completion or failure of an asynchronous operation. It has three states: pending (initial), fulfilled (successful), or rejected (failed), and allows you to chain operations with .then() and handle errors with .catch().

**Promise States**
Pending (operation in progress), Fulfilled (operation completed successfully with a value), Rejected (operation failed with a reason/error). Once settled (fulfilled or rejected), a promise cannot change states.

**Promise.all()**
Takes an array of promises and returns a single promise that resolves when all input promises resolve, or rejects immediately if any promise rejects. Useful for parallel operations where you need all results.

**Promise.race()**
Returns a promise that settles as soon as the first promise in the array settles (either resolves or rejects). Useful for timeout scenarios or getting the fastest response.

**async/await**
Syntactic sugar for working with promises. The async keyword makes a function return a promise, while await pauses execution until a promise resolves, making asynchronous code look synchronous and easier to read.

**try/catch with async/await**
Error handling mechanism for async functions. Wrap await statements in try blocks to catch rejected promises, making error handling cleaner than .catch() chains.

**Callback Hell**
Nested callbacks that make code hard to read and maintain (pyramid of doom). Modern solutions include promises and async/await for better code structure and error handling.

---

### JavaScript Concepts

**Prototype Chain**
A mechanism where JavaScript objects inherit properties and methods from other objects. When accessing a property, JavaScript looks up the chain from the object to its prototype until it finds it or reaches null.

**__proto__ vs prototype**
__proto__ is the actual object used in the lookup chain, while prototype is a property on constructor functions that becomes __proto__ of instances created with new. prototype is what you set on constructors; __proto__ is what objects use for inheritance.

**Constructor Function**
A regular function used with the new keyword to create objects. It initializes new instances and sets up the prototype chain. Convention is to capitalize the first letter.

**Object.create()**
Creates a new object with a specified prototype. Unlike constructors, it gives you direct control over the prototype without calling a function with new.

**ES6 Classes**
Syntactic sugar over JavaScript's prototypal inheritance. Classes provide a cleaner syntax for creating objects and implementing inheritance but still use prototypes under the hood.

**this Binding**
The value of this depends on how a function is called: method call (object), regular function (global/undefined), constructor (new instance), arrow function (lexical/inherits from parent). Use bind(), call(), or apply() to set explicitly.

---

### React.js Concepts

**Custom Hooks**
Functions that start with "use" and can call other hooks. They extract and reuse stateful logic between components without changing component hierarchy. Used for sharing logic like data fetching or form handling.

**useRef**
A hook that returns a mutable ref object that persists across renders. Used for accessing DOM elements directly, storing mutable values that don't trigger re-renders, and keeping track of previous values.

**useRef vs useState**
useState triggers re-renders when updated and holds state; useRef doesn't trigger re-renders when its .current property changes and is used for values that don't affect rendering. Use useState for data that affects UI, useRef for everything else.

**Ref Forwarding**
A technique using React.forwardRef() to pass refs through a component to one of its children. Allows parent components to get a reference to a DOM element inside a child component.

---

### Java Concepts

**ArrayList**
A resizable array implementation of the List interface. Provides fast random access O(1) but slower insertion/deletion in the middle O(n) because elements must shift. Uses dynamic array internally.

**LinkedList**
A doubly-linked list implementation of List and Deque interfaces. Slower random access O(n) but faster insertion/deletion at beginning/end O(1). Each element (node) has references to next and previous elements.

**HashSet**
An implementation of Set backed by a HashMap. Stores unique elements with no guaranteed order. Provides O(1) time for add, remove, and contains operations using hash codes.

**TreeSet**
A Set implementation that maintains elements in sorted order using a Red-Black tree. Operations are O(log n). Elements must be comparable or a comparator must be provided.

**HashMap**
A hash table implementation of the Map interface that stores key-value pairs. Provides O(1) average time for get and put operations. Doesn't maintain order and allows one null key.

**TreeMap**
A Map implementation that maintains keys in sorted order using a Red-Black tree. Operations are O(log n). Keys must be comparable or a comparator must be provided.

**LinkedHashMap**
A HashMap that maintains insertion order or access order. Slightly slower than HashMap but preserves the order in which entries were added.

**Queue and Deque**
Queue is FIFO (First-In-First-Out) with operations offer/poll/peek. Deque (Double-Ended Queue) allows insertion and removal at both ends, supporting both FIFO and LIFO operations.

---

### Spring Boot Concepts

**@RestController**
A specialized version of @Controller that combines @Controller and @ResponseBody. Every method automatically serializes return objects into JSON/XML and writes them to the HTTP response body.

**@Controller vs @RestController**
@Controller returns views (HTML templates) while @RestController returns data (JSON/XML). Use @Controller for traditional MVC web apps and @RestController for REST APIs.

**@GetMapping**
Maps HTTP GET requests to handler methods. Used for retrieving/reading data. Idempotent and safe operation that doesn't modify server state.

**@PostMapping**
Maps HTTP POST requests to handler methods. Used for creating new resources. Non-idempotent operation that modifies server state.

**@PutMapping**
Maps HTTP PUT requests to handler methods. Used for updating/replacing entire resources. Idempotent operation (calling multiple times has the same effect as calling once).

**@DeleteMapping**
Maps HTTP DELETE requests to handler methods. Used for deleting resources. Idempotent operation.

**@PathVariable**
Extracts values from the URI path. Example: `/users/{id}` where id is a path variable. Used for identifying specific resources.

**@RequestParam**
Extracts query parameters from the URL. Example: `/users?page=1&size=10`. Used for filtering, pagination, or optional parameters.

**@RequestBody**
Binds the HTTP request body to a Java object. Automatically deserializes JSON/XML into the specified type. Used in POST/PUT requests to receive data.

**ResponseEntity**
Represents the entire HTTP response including status code, headers, and body. Provides fine-grained control over the HTTP response compared to just returning objects.

**HTTP Status Codes**
Standard response codes: 2xx (success) - 200 OK, 201 Created; 4xx (client errors) - 400 Bad Request, 401 Unauthorized, 404 Not Found; 5xx (server errors) - 500 Internal Server Error.

---

### DevOps Concepts

**Continuous Integration (CI)**
Practice of automatically building and testing code every time changes are committed. Catches integration issues early by merging code frequently into a shared repository.

**Continuous Deployment (CD)**
Automatic deployment of code changes to production after passing all tests. Every change that passes the pipeline goes live automatically without manual intervention.

**CI/CD Pipeline**
Automated workflow with stages: Source → Build → Test → Deploy. Each stage must pass before proceeding. Provides fast feedback and reduces manual errors.

**GitHub Actions**
CI/CD platform built into GitHub. Uses workflow files (.yml) to define automated tasks triggered by events like push, pull request, or schedule.

**Jenkins**
Open-source automation server for building CI/CD pipelines. Uses Jenkinsfile (pipeline as code) to define build, test, and deployment steps. Highly customizable with plugins.

**Pipeline as Code**
Defining build/deploy pipelines in code (version-controlled files) rather than UI configuration. Makes pipelines reproducible, reviewable, and portable across environments.

---

### Google Cloud Concepts

**Compute Engine**
GCP's Infrastructure as a Service (IaaS) offering. Provides virtual machines running on Google's infrastructure with customizable configurations, persistent storage, and networking.

**VM Instance Types**
Machine families optimized for different workloads: General-purpose (E2, N1, N2), Compute-optimized (C2), Memory-optimized (M1, M2), Accelerator-optimized (A2 for GPUs).

**Preemptible VMs**
Short-lived, low-cost VM instances that can be terminated by Google at any time (up to 24 hours runtime). Cost up to 80% less than regular instances. Good for batch jobs and fault-tolerant workloads.

**Instance Groups**
Collections of VM instances managed as a single entity. Managed instance groups support autoscaling and auto-healing; unmanaged groups are just collections without automation.

**Startup Scripts**
Scripts that run automatically when a VM instance boots. Used to install software, configure settings, or fetch configuration data. Can be specified in metadata.

**VM Metadata**
Key-value pairs attached to instances that provide configuration information. Accessible from within the instance and used for startup scripts, service discovery, and configuration management.

---

### System Design Concepts

**Load Balancer**
A system that distributes incoming network traffic across multiple servers to ensure no single server is overwhelmed. Improves availability, reliability, and scalability.

**Layer 4 (L4) Load Balancer**
Operates at the transport layer (TCP/UDP). Makes routing decisions based on IP address and port numbers. Fast but limited visibility into application data.

**Layer 7 (L7) Load Balancer**
Operates at the application layer (HTTP/HTTPS). Can route based on content like URLs, headers, or cookies. Provides more intelligent routing but slightly slower than L4.

**Round-Robin Load Balancing**
Distributes requests equally and sequentially to each server in the pool. Simple but doesn't account for server load or capacity.

**Least Connections**
Routes requests to the server with the fewest active connections. Better for long-lived connections and varying request durations.

**IP Hash**
Routes requests from the same client IP to the same server consistently. Useful for session persistence but can lead to uneven distribution.

**Reverse Proxy**
A server that sits between clients and backend servers, forwarding client requests to appropriate servers. Provides load balancing, caching, SSL termination, and security. Example: Nginx.

**Forward Proxy**
A server that sits between clients and the internet, forwarding client requests to external servers. Used for privacy, caching, and access control. Example: corporate proxy servers.

**Health Checks**
Automated tests that verify server availability and responsiveness. Load balancers use health checks to avoid routing traffic to failed servers and ensure high availability.

---

### DSA Concepts

**Linked List**
A linear data structure where elements (nodes) are not stored in contiguous memory. Each node contains data and a reference to the next node. Allows dynamic size and efficient insertion/deletion.

**Singly Linked List**
Each node has data and a reference to the next node. Can only traverse forward. Memory efficient but can't go backwards.

**Doubly Linked List**
Each node has data, a reference to the next node, and a reference to the previous node. Can traverse both directions but uses more memory.

**Fast and Slow Pointer (Floyd's Algorithm)**
Uses two pointers moving at different speeds (slow moves 1 step, fast moves 2 steps). Used to detect cycles, find middle element, or find nth node from end in linked lists.

**Linked List vs Array**
Arrays: O(1) random access, O(n) insertion/deletion in middle, fixed/resizable size. Linked Lists: O(n) access by index, O(1) insertion/deletion at known position, dynamic size, extra memory for pointers.

---

## ✅ Day 2 Completion Checklist
- [ ] Node.js: Write async/await examples
- [ ] JavaScript: Understand prototype chain
- [ ] React: Create a custom hook
- [ ] Java: Compare ArrayList vs LinkedList
- [ ] Spring Boot: Build a simple REST endpoint
- [ ] DevOps: Understand CI/CD pipeline
- [ ] GCP: Know VM instance types
- [ ] System Design: Explain load balancing
- [ ] DSA: Solve 2-3 linked list problems

---

**Tomorrow:** Day 3 - Streams, ES6+ Features, Context API, Generics, JPA, Kubernetes, Cloud Storage
