# Day 3 - Streams, Advanced Features & Storage

**Date:** May 20, 2026
**Focus:** Streams, modern features, persistence, storage solutions

## 🔗 Quick Links to Concepts
[Node.js](#nodejs-concepts) | [JavaScript](#javascript-concepts) | [React.js](#reactjs-concepts) | [Java](#java-concepts) | [Spring Boot](#spring-boot-concepts) | [DevOps](#devops-concepts) | [Google Cloud](#google-cloud-concepts) | [System Design](#system-design-concepts) | [DSA](#dsa-concepts)

---

## ⏰ 30-Minute Study Blocks

### 1. Node.js (30 min)
**Topic:** Streams & Buffers
- Readable, Writable, Duplex, Transform streams
- Pipe and pipeline
- Backpressure handling
- Buffer vs Stream for large files
- Stream events (data, end, error)

### 2. JavaScript (30 min)
**Topic:** ES6+ Modern Features
- Destructuring (arrays, objects)
- Spread and rest operators
- Template literals
- Arrow functions and this binding
- Default parameters
- Optional chaining and nullish coalescing

### 3. React.js (30 min)
**Topic:** Context API & useContext
- When to use Context vs props
- Creating and providing context
- useContext hook
- Context performance considerations
- Combining multiple contexts

### 4. Java (30 min)
**Topic:** Generics & Type Safety
- Generic classes and methods
- Bounded type parameters
- Wildcards (?, extends, super)
- Type erasure
- Generic collections
- PECS principle (Producer Extends Consumer Super)

### 5. Spring Boot (30 min)
**Topic:** Spring Data JPA
- @Entity, @Table, @Id, @GeneratedValue
- @OneToMany, @ManyToOne, @ManyToMany relationships
- JpaRepository methods
- Custom queries with @Query
- save(), findById(), findAll(), deleteById()

### 6. DevOps (30 min)
**Topic:** Kubernetes Fundamentals
- Pods, Deployments, Services
- ReplicaSets
- ConfigMaps and Secrets
- kubectl basic commands
- Kubernetes architecture (master, nodes)

### 7. Google Cloud (30 min)
**Topic:** Cloud Storage
- Storage classes (Standard, Nearline, Coldline, Archive)
- Buckets and objects
- gsutil commands
- Access control (IAM vs ACLs)
- Signed URLs
- Versioning and lifecycle management

### 8. System Design (30 min)
**Topic:** Caching Strategies
- Cache levels (browser, CDN, application, database)
- Cache eviction policies (LRU, LFU, FIFO)
- Cache-aside vs write-through vs write-back
- Redis basics
- Cache invalidation strategies
- Cache stampede problem

### 9. DSA (30 min)
**Topic:** Stacks & Queues
- Stack operations (push, pop, peek)
- Queue operations (enqueue, dequeue)
- Implementation using arrays/linked lists
- Problems: Valid Parentheses, Min Stack, Implement Queue using Stacks

---

## 📖 Concept Definitions (Interview-Ready)

### Node.js Concepts

**Streams**
Objects that let you read or write data piece by piece (chunks) rather than all at once. Efficient for handling large amounts of data because they don't require loading everything into memory.

**Readable Stream**
A stream you can read data from (like reading a file or HTTP request body). Emits 'data' events with chunks, and an 'end' event when done.

**Writable Stream**
A stream you can write data to (like writing to a file or HTTP response). Use write() to send chunks and end() to finish.

**Duplex Stream**
A stream that is both readable and writable, like a TCP socket. Data can flow in both directions independently.

**Transform Stream**
A special duplex stream that modifies data as it passes through. Input is transformed and then output. Example: compression, encryption.

**Pipe**
Connects a readable stream to a writable stream automatically. Handles backpressure and errors. Simpler than manually handling events.

**Backpressure**
When a writable stream can't process data as fast as it's being received. Streams handle this by pausing the readable stream until the writable stream is ready.

**Buffer**
A temporary storage area for binary data in memory. Used when streams need to hold data before processing. Fixed size, unlike arrays.

**Buffer vs Stream**
Buffers load entire data into memory at once (good for small data). Streams process data in chunks (essential for large files or continuous data).

---

### JavaScript Concepts

**Destructuring**
Syntax for unpacking values from arrays or properties from objects into distinct variables. Example: `const {name, age} = person` or `const [first, second] = array`.

**Spread Operator (...)**
Expands iterables (arrays, objects) into individual elements. Used for copying, merging, or passing array elements as function arguments. Example: `[...array1, ...array2]`.

**Rest Operator (...)**
Collects multiple elements into an array. Used in function parameters to gather remaining arguments. Example: `function sum(...numbers)`.

**Template Literals**
String literals using backticks that allow embedded expressions and multi-line strings. Use ${expression} for interpolation. Example: `Hello ${name}`.

**Arrow Functions**
Shorter function syntax using =>. Don't have their own 'this', 'arguments', or 'super'. Inherit 'this' from the enclosing scope (lexical binding).

**Default Parameters**
Allow function parameters to have default values if no argument is passed or undefined is passed. Example: `function greet(name = 'Guest')`.

**Optional Chaining (?.)**
Safely access nested object properties without checking each level. Returns undefined if any part is null/undefined. Example: `user?.address?.city`.

**Nullish Coalescing (??)**
Returns the right operand when left is null or undefined (but not for other falsy values like 0 or ''). Example: `value ?? 'default'`.

---

### React.js Concepts

**Context API**
A way to pass data through the component tree without passing props at every level. Solves prop drilling by providing global-like state.

**When to Use Context**
Use for truly global data (theme, user, language) that many components need. For complex state management or frequent updates, consider Redux instead.

**createContext**
Creates a Context object that components can subscribe to. Returns Provider and Consumer components.

**Context Provider**
Component that wraps the tree and supplies the context value. All descendants can access this value. Example: `<ThemeContext.Provider value={theme}>`.

**useContext**
Hook that subscribes a component to a Context. Returns the current context value from the nearest Provider. Simpler than Context.Consumer.

**Context Performance**
Every component using useContext re-renders when context value changes. Optimize by splitting contexts, memoizing values, or using composition.

---

### Java Concepts

**Generics**
A feature that allows classes, interfaces, and methods to operate on types specified by the client. Provides compile-time type safety and eliminates casting.

**Generic Class**
A class with type parameters in angle brackets. Example: `class Box<T>`. The type T is specified when creating instances: `Box<String> box`.

**Generic Method**
A method with its own type parameters. Can be in generic or non-generic classes. Example: `public <T> void print(T item)`.

**Bounded Type Parameters**
Restricts the types that can be used as type arguments. Use extends for upper bounds. Example: `<T extends Number>` accepts only Number and its subclasses.

**Wildcards (?, extends, super)**
Represents an unknown type in generics. `<?>` accepts any type, `<? extends T>` accepts T and subtypes, `<? super T>` accepts T and supertypes.

**Type Erasure**
Generics exist only at compile time. At runtime, type information is erased and replaced with Object or upper bound. Prevents creation of generic arrays.

**PECS Principle**
"Producer Extends, Consumer Super" - use `<? extends T>` when you only read from a structure (producer), `<? super T>` when you only write to it (consumer).

---

### Spring Boot Concepts

**@Entity**
Marks a class as a JPA entity that maps to a database table. Each instance represents a row in the table.

**@Table**
Specifies the table name in the database. If not provided, defaults to the class name. Example: `@Table(name = "users")`.

**@Id**
Marks a field as the primary key of the entity. Every entity must have an @Id field.

**@GeneratedValue**
Specifies how the primary key should be generated. Strategies: AUTO (default), IDENTITY (auto-increment), SEQUENCE, TABLE.

**@OneToMany**
Defines a one-to-many relationship. One entity is associated with multiple instances of another. Example: One Department has many Employees.

**@ManyToOne**
Defines a many-to-one relationship. Multiple instances relate to one instance. Example: Many Employees belong to one Department.

**@ManyToMany**
Defines a many-to-many relationship using a join table. Example: Students and Courses (one student has many courses, one course has many students).

**JpaRepository**
Spring Data interface that provides CRUD methods automatically. Extends PagingAndSortingRepository. No implementation needed, Spring generates it.

**@Query**
Defines custom JPQL or native SQL queries on repository methods. Use when built-in methods don't suffice. Example: `@Query("SELECT u FROM User u WHERE u.email = ?1")`.

**Repository Methods**
save() - create/update, findById() - retrieve by ID, findAll() - get all records, deleteById() - delete by ID, existsById() - check existence.

---

### DevOps Concepts

**Kubernetes (K8s)**
An open-source container orchestration platform that automates deployment, scaling, and management of containerized applications across clusters.

**Pod**
The smallest deployable unit in Kubernetes. Contains one or more containers that share network and storage. Containers in a pod run on the same node.

**Deployment**
A declarative way to manage pods and ReplicaSets. Handles rolling updates, rollbacks, and scaling. Ensures desired number of pod replicas are running.

**ReplicaSet**
Ensures a specified number of identical pod replicas are running at all times. Usually managed by Deployments, not created directly.

**Service**
An abstraction that defines a logical set of pods and how to access them. Provides stable IP/DNS and load balancing. Types: ClusterIP, NodePort, LoadBalancer.

**ConfigMap**
Stores non-confidential configuration data as key-value pairs. Used to separate configuration from container images. Injected as environment variables or files.

**Secret**
Stores sensitive data (passwords, tokens, keys) in base64-encoded format. Similar to ConfigMaps but designed for confidential information.

**kubectl**
Command-line tool for interacting with Kubernetes clusters. Used to deploy apps, inspect resources, view logs, and manage cluster. Example: `kubectl get pods`.

**Kubernetes Architecture**
Master nodes (control plane) manage the cluster: API server, scheduler, controller manager, etcd. Worker nodes run applications: kubelet, kube-proxy, container runtime.

---

### Google Cloud Concepts

**Cloud Storage**
GCP's object storage service for storing and accessing unstructured data like images, videos, backups. Highly durable (99.999999999%) and scalable.

**Storage Classes**
Standard (frequent access, hot data), Nearline (once per month, backups), Coldline (once per quarter, disaster recovery), Archive (once per year, long-term storage). Different pricing and access costs.

**Bucket**
A container for storing objects in Cloud Storage. Has a globally unique name, location, and storage class. Objects are stored within buckets.

**Object**
Individual pieces of data stored in Cloud Storage. Each has a unique key (name) within a bucket. Immutable - updates create new versions.

**gsutil**
Command-line tool for interacting with Cloud Storage. Common commands: gsutil cp (copy), gsutil ls (list), gsutil mb (make bucket), gsutil rm (remove).

**IAM vs ACLs**
IAM (Identity and Access Management) provides bucket/project level permissions and is recommended. ACLs (Access Control Lists) provide object-level permissions and are legacy.

**Signed URLs**
Time-limited URLs that grant temporary access to specific Cloud Storage objects without requiring authentication. Useful for sharing private files.

**Object Versioning**
Keeps a history of modifications by preserving old versions when objects are overwritten or deleted. Protects against accidental deletion and allows rollback.

**Lifecycle Management**
Automatically transitions objects to cheaper storage classes or deletes them based on age or other conditions. Reduces storage costs for aging data.

---

### System Design Concepts

**Caching**
Storing frequently accessed data in a fast-access layer to reduce database load and improve response times. Trades memory for speed.

**Cache Levels**
Browser cache (client-side), CDN cache (edge locations), Application cache (in-memory like Redis), Database cache (query results). Each level serves different purposes.

**LRU (Least Recently Used)**
Cache eviction policy that removes the least recently accessed items first. Good balance between performance and complexity.

**LFU (Least Frequently Used)**
Evicts items accessed least often. Tracks access frequency. Better for items with varying access patterns but more complex.

**FIFO (First In First Out)**
Evicts oldest items first regardless of access patterns. Simple but not optimal for most use cases.

**Cache-Aside (Lazy Loading)**
Application checks cache first. On miss, loads from database and updates cache. Application controls cache logic. Most common pattern.

**Write-Through Cache**
Data is written to cache and database simultaneously. Ensures cache is always consistent but slower writes.

**Write-Back (Write-Behind) Cache**
Data is written to cache first, then asynchronously to database. Fast writes but risk of data loss if cache fails.

**Redis**
An in-memory data store used as a cache, message broker, or database. Supports various data structures (strings, hashes, lists, sets). Extremely fast with persistence options.

**Cache Invalidation**
Strategy for keeping cache data fresh. Methods: TTL (time to live), explicit invalidation on updates, write-through, or event-based invalidation.

**Cache Stampede**
Problem when many requests simultaneously try to regenerate the same expired cache entry, overwhelming the database. Solutions: locking, probabilistic early expiration.

---

### DSA Concepts

**Stack**
A Last-In-First-Out (LIFO) data structure. Elements are added and removed from the same end (top). Operations: push (add), pop (remove), peek (view top).

**Queue**
A First-In-First-Out (FIFO) data structure. Elements are added at the rear and removed from the front. Operations: enqueue (add), dequeue (remove), peek (view front).

**Stack Implementation**
Can use arrays (fixed size, fast) or linked lists (dynamic size, flexible). Arrays are simpler; linked lists avoid size limitations.

**Queue Implementation**
Can use arrays (with circular buffer to avoid shifting) or linked lists (simple enqueue/dequeue). Linked lists are often preferred for flexibility.

**Stack Use Cases**
Function call stack, undo mechanisms, expression evaluation, backtracking algorithms, balanced parentheses checking, browser history.

**Queue Use Cases**
Task scheduling, breadth-first search, print spooling, message queuing, handling requests in servers, buffering.

**Stack Time Complexity**
Push, pop, and peek are all O(1) operations when implemented correctly.

**Queue Time Complexity**
Enqueue and dequeue are O(1) with proper implementation (linked list or circular array). Linear arrays require O(n) for dequeue due to shifting.

---

## ✅ Day 3 Completion Checklist
- [ ] Node.js: Create readable/writable streams
- [ ] JavaScript: Use ES6+ features effectively
- [ ] React: Implement Context API
- [ ] Java: Write generic classes
- [ ] Spring Boot: Define JPA entities and relationships
- [ ] DevOps: Understand Kubernetes components
- [ ] GCP: Work with Cloud Storage buckets
- [ ] System Design: Explain caching strategies
- [ ] DSA: Solve stack/queue problems

---

**Tomorrow:** Day 4 - Modules, Async Patterns, Performance, Streams API, Transactions, Monitoring, Networking
