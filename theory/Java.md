# Java - Professional Interview Guide

## Table of Contents
1. [Core Java Fundamentals](#core-java-fundamentals)
2. [Object-Oriented Programming](#object-oriented-programming)
3. [Collections Framework](#collections-framework)
4. [Multithreading & Concurrency](#multithreading--concurrency)
5. [Exception Handling](#exception-handling)
6. [Java 8+ Features](#java-8-features)
7. [Memory Management & JVM](#memory-management--jvm)
8. [Design Patterns](#design-patterns)

---

## Core Java Fundamentals

### JDK vs JRE vs JVM
**JDK (Java Development Kit)**: Complete development environment containing JRE + development tools (compiler, debugger, javadoc). Used for developing Java applications.

**JRE (Java Runtime Environment)**: Runtime environment containing JVM + core libraries. Used for running Java applications only.

**JVM (Java Virtual Machine)**: Abstract machine that executes bytecode. Provides platform independence. Handles memory management, garbage collection, and security.

**Key takeaway:** JDK = develop, JRE = run, JVM = executes bytecode.

---

### Compile and Execution Process
Java source code (`.java`) → Compiled by `javac` → Bytecode (`.class`) → JVM loads and executes bytecode → Platform-specific machine code via JIT compiler.

**Platform Independence:** Write Once, Run Anywhere (WORA). Bytecode runs on any platform with JVM.

**Key takeaway:** Source → Bytecode → JVM → Machine code.

---

### Data Types
**Primitive (8 types):** byte (1 byte), short (2), int (4), long (8), float (4), double (8), char (2), boolean (1 bit).

**Reference Types:** Objects, arrays, interfaces. Store memory addresses, not actual values. Default value is `null`.

**Autoboxing/Unboxing:** Automatic conversion between primitives and wrapper classes (Integer, Double, etc.).

**Key takeaway:** Primitives = value, References = address.

---

### String, StringBuilder, StringBuffer
**String:** Immutable. Every modification creates new object. Thread-safe by immutability. Use for constant strings.

**StringBuilder:** Mutable. Not synchronized. Faster for single-threaded string manipulation.

**StringBuffer:** Mutable. Synchronized (thread-safe). Slower than StringBuilder due to synchronization overhead.

**Key takeaway:** Immutable String, StringBuilder (fast), StringBuffer (thread-safe).

---

### == vs equals()
**==:** Compares references (memory addresses) for objects. Compares values for primitives.

**equals():** Compares object content. Overrideable for custom comparison. Default implementation in `Object` class uses `==`.

```java
String a = new String("hello");
String b = new String("hello");
a == b;        // false (different objects)
a.equals(b);   // true (same content)
```

**Key takeaway:** == = reference, equals() = content.

---

### hashCode() and equals() Contract
If two objects are equal (`equals()` returns true), they MUST have the same `hashCode()`.

If `hashCode()` is same, objects may or may not be equal.

**Why it matters:** HashMap, HashSet rely on this contract. Broken contract = wrong behavior in hash-based collections.

**Best practice:** Always override both together. Use all fields used in `equals()` for `hashCode()`.

**Key takeaway:** Equal objects = same hashCode. Override both together.

---

### final, finally, finalize
**final:** Keyword. Variable = constant, method = cannot override, class = cannot extend.

**finally:** Block in try-catch. Always executes (except System.exit()). Used for cleanup (close resources).

**finalize():** Deprecated method called by GC before object destruction. Unreliable timing. Use try-with-resources instead.

**Key takeaway:** final = immutability/restriction, finally = cleanup block, finalize = deprecated.

---

### static Keyword
**Static variable:** Shared across all instances. One copy per class. Loaded at class loading time.

**Static method:** Belongs to class, not instance. Cannot access instance variables/methods directly. Called via class name.

**Static block:** Executes once when class is loaded. Used for static initialization.

**Key takeaway:** static = class-level, not instance-level.

---

## Object-Oriented Programming

### Four Pillars of OOP

#### 1. Encapsulation
Bundling data (fields) and methods operating on data within a class. Hide internal state using `private` fields. Provide public getters/setters for controlled access.

**Benefits:** Data hiding, flexibility (change implementation without affecting clients), validation in setters.

**Key takeaway:** Hide data, expose through methods.

---

#### 2. Inheritance
Class acquires properties and behaviors of parent class using `extends`. Promotes code reuse. Java supports single inheritance (one parent class).

**Types:** Single, multilevel, hierarchical. Multiple inheritance via interfaces only.

**Key takeaway:** IS-A relationship. Code reuse.

---

#### 3. Polymorphism
**Compile-time (Method Overloading):** Same method name, different parameters (number, type, order). Resolved at compile time.

**Runtime (Method Overriding):** Subclass provides specific implementation of parent method. Resolved at runtime via dynamic method dispatch.

```java
Parent p = new Child(); // Upcasting
p.display(); // Calls Child's display() - Runtime polymorphism
```

**Key takeaway:** Overloading = compile-time, Overriding = runtime.

---

#### 4. Abstraction
Hiding implementation details, showing only functionality. Achieved via abstract classes and interfaces.

**Abstract class:** Cannot instantiate. Can have abstract (no body) and concrete methods. Use when sharing code among related classes.

**Interface:** 100% abstraction (until Java 8). Can have default/static methods (Java 8+). Multiple inheritance via interfaces.

**Key takeaway:** Hide complexity, show essential features.

---

### Abstract Class vs Interface
**Abstract Class:**
- Can have state (instance variables)
- Can have constructors
- Can have concrete methods
- Single inheritance only
- Use when: Classes share common code

**Interface:**
- No state (only constants: `public static final`)
- No constructors
- All methods abstract (before Java 8)
- Multiple inheritance supported
- Use when: Defining contract/behavior

**Java 8+:** Interfaces can have default and static methods.

**Key takeaway:** Abstract class = partial abstraction + state, Interface = contract.

---

### Method Overloading vs Overriding
**Overloading (Compile-time polymorphism):**
- Same class
- Same method name, different parameters
- Return type can differ
- Resolved at compile time

**Overriding (Runtime polymorphism):**
- Parent-child relationship
- Exact same method signature
- Return type must be same or covariant
- @Override annotation recommended
- Cannot reduce visibility

**Key takeaway:** Overloading = different params, Overriding = same signature.

---

### Constructor
Special method to initialize objects. Same name as class. No return type.

**Default Constructor:** Provided by compiler if no constructor defined. No parameters.

**Parameterized Constructor:** Takes arguments for custom initialization.

**Constructor Chaining:** Calling one constructor from another using `this()` (same class) or `super()` (parent class).

**Key takeaway:** Initialization method. No return type. this() or super() must be first line.

---

### this vs super
**this:** Reference to current object. Access instance variables, call other constructors (`this()`), pass current object.

**super:** Reference to parent class object. Access parent fields/methods, call parent constructor (`super()`).

**Key takeaway:** this = current object, super = parent class.

---

### Access Modifiers
**private:** Same class only.
**default (no modifier):** Same package.
**protected:** Same package + subclasses (even different package).
**public:** Everywhere.

**Key takeaway:** Increasing visibility: private → default → protected → public.

---

## Collections Framework

### Collection Hierarchy
```
Collection (interface)
├── List (ordered, duplicates allowed)
│   ├── ArrayList
│   ├── LinkedList
│   └── Vector (legacy, synchronized)
├── Set (no duplicates)
│   ├── HashSet (no order)
│   ├── LinkedHashSet (insertion order)
│   └── TreeSet (sorted)
└── Queue
    ├── PriorityQueue
    └── Deque (ArrayDeque, LinkedList)

Map (separate hierarchy)
├── HashMap (no order)
├── LinkedHashMap (insertion order)
├── TreeMap (sorted by keys)
└── Hashtable (legacy, synchronized)
```

**Key takeaway:** List = ordered + duplicates, Set = no duplicates, Map = key-value.

---

### ArrayList vs LinkedList
**ArrayList:**
- Dynamic array
- Fast random access: O(1)
- Slow insertion/deletion (middle): O(n) - shifting required
- Better for read-heavy operations
- Less memory overhead

**LinkedList:**
- Doubly linked list
- Slow random access: O(n)
- Fast insertion/deletion: O(1) at known position
- Better for frequent insertions/deletions
- More memory (stores node references)

**Key takeaway:** ArrayList = random access, LinkedList = insertions/deletions.

---

### HashMap Internal Working
**Structure:** Array of buckets (Node<K,V>[]). Each bucket is a linked list (before Java 8) or balanced tree (Java 8+, when bucket size > 8).

**put() operation:**
1. Calculate `hashCode()` of key
2. Apply hash function to get bucket index
3. If bucket empty, insert new node
4. If collision, check `equals()` - update if same key, else add to list/tree

**get() operation:**
1. Calculate hash, find bucket
2. Traverse list/tree using `equals()` to find key

**Load Factor:** Default 0.75. When size exceeds capacity × load factor, rehashing occurs (capacity doubles).

**Java 8 optimization:** Buckets convert to balanced trees when size > 8 (O(log n) instead of O(n)).

**Key takeaway:** Array + linked list/tree. hashCode() for bucket, equals() for key match.

---

### HashMap vs Hashtable vs ConcurrentHashMap
**HashMap:**
- Not synchronized (not thread-safe)
- Allows one null key, multiple null values
- Fast (no synchronization overhead)
- Use in single-threaded environments

**Hashtable:**
- Synchronized (thread-safe)
- No null keys/values
- Slow (method-level synchronization)
- Legacy class (avoid in new code)

**ConcurrentHashMap:**
- Thread-safe via segment locking (Java 7) / CAS operations (Java 8+)
- No null keys/values
- Better performance than Hashtable (finer-grained locking)
- Use in multi-threaded environments

**Key takeaway:** HashMap = fast, ConcurrentHashMap = thread-safe + fast, Hashtable = legacy.

---

### HashSet vs TreeSet vs LinkedHashSet
**HashSet:**
- Backed by HashMap
- No order
- O(1) add/remove/contains
- Allows one null

**TreeSet:**
- Backed by TreeMap (Red-Black tree)
- Sorted order (natural or custom Comparator)
- O(log n) operations
- No null (throws NPE)

**LinkedHashSet:**
- Maintains insertion order
- Slightly slower than HashSet
- O(1) operations
- Allows one null

**Key takeaway:** HashSet = fast, TreeSet = sorted, LinkedHashSet = insertion order.

---

### Comparable vs Comparator
**Comparable:**
- Interface with `compareTo()` method
- Natural ordering (one way to compare)
- Modify the class itself
- Example: String, Integer implement Comparable

```java
class Employee implements Comparable<Employee> {
    public int compareTo(Employee e) {
        return this.id - e.id; // Sort by ID
    }
}
```

**Comparator:**
- Separate interface with `compare()` method
- Multiple sorting sequences
- Don't modify original class
- Pass to sort methods

```java
Comparator<Employee> byName = (e1, e2) -> e1.name.compareTo(e2.name);
Collections.sort(employees, byName);
```

**Key takeaway:** Comparable = natural order in class, Comparator = custom external sorting.

---

### Iterator vs ListIterator
**Iterator:**
- Traverse forward only
- Works on all Collections
- Methods: `hasNext()`, `next()`, `remove()`

**ListIterator:**
- Traverse both directions
- Only for List implementations
- Additional methods: `hasPrevious()`, `previous()`, `add()`, `set()`

**Key takeaway:** Iterator = forward, ListIterator = bidirectional + modification.

---

### fail-fast vs fail-safe
**fail-fast:**
- Throws `ConcurrentModificationException` if collection modified during iteration
- Uses `modCount` to detect structural changes
- Examples: ArrayList, HashMap iterators
- Performance: Better (no copying)

**fail-safe:**
- Works on clone/snapshot of collection
- No exception on concurrent modification
- May not reflect latest changes
- Examples: ConcurrentHashMap, CopyOnWriteArrayList
- Performance: Slower (copying overhead)

**Key takeaway:** fail-fast = exception on modification, fail-safe = works on copy.

---

## Multithreading & Concurrency

### Thread Lifecycle
**States:**
1. **New:** Thread created but not started
2. **Runnable:** Ready to run, waiting for CPU
3. **Running:** Executing
4. **Blocked/Waiting:** Waiting for resource/notification
5. **Terminated:** Execution completed

**Key takeaway:** New → Runnable → Running → Terminated (with Blocked/Waiting in between).

---

### Creating Threads
**1. Extend Thread class:**
```java
class MyThread extends Thread {
    public void run() { /* task */ }
}
new MyThread().start();
```

**2. Implement Runnable interface (preferred):**
```java
class MyTask implements Runnable {
    public void run() { /* task */ }
}
new Thread(new MyTask()).start();
```

**3. Callable & Future (returns result):**
```java
Callable<Integer> task = () -> 42;
Future<Integer> result = executor.submit(task);
```

**Key takeaway:** Runnable = preferred (composition), Callable = returns result.

---

### synchronized Keyword
Ensures only one thread executes a block/method at a time. Acquires intrinsic lock (monitor) on object.

**Method level:**
```java
synchronized void method() { /* critical section */ }
// Locks on 'this' object
```

**Block level (better granularity):**
```java
synchronized(lockObject) { /* critical section */ }
```

**Static method:** Locks on Class object.

**Key takeaway:** Mutual exclusion. Prevents race conditions.

---

### wait(), notify(), notifyAll()
**wait():** Releases lock and waits until another thread calls `notify()` or `notifyAll()` on same object. Must be called within synchronized block.

**notify():** Wakes up one waiting thread (random).

**notifyAll():** Wakes up all waiting threads.

**Producer-Consumer pattern:** Producer calls `notifyAll()` after producing. Consumer calls `wait()` when queue empty.

**Key takeaway:** Inter-thread communication. Must synchronize on same object.

---

### volatile Keyword
Ensures variable changes are visible to all threads immediately. Prevents caching in thread-local memory. Every read/write goes to main memory.

**Use case:** Flags (boolean status variables) shared across threads.

**Limitations:** Not atomic for compound operations (i++). Use `AtomicInteger` for atomicity.

**Key takeaway:** Visibility guarantee. Not for complex operations.

---

### Thread Pool & Executors
**ExecutorService:** Manages thread pool. Reuses threads instead of creating new ones.

**Types:**
- **FixedThreadPool:** Fixed number of threads
- **CachedThreadPool:** Creates threads as needed, reuses idle threads
- **SingleThreadExecutor:** Single worker thread
- **ScheduledThreadPool:** Scheduled/periodic tasks

```java
ExecutorService executor = Executors.newFixedThreadPool(10);
executor.submit(() -> { /* task */ });
executor.shutdown();
```

**Key takeaway:** Thread reuse. Better resource management than manual threads.

---

### Deadlock
Two or more threads waiting for each other indefinitely. Each holds a resource and waits for another.

**Conditions for deadlock:**
1. Mutual exclusion
2. Hold and wait
3. No preemption
4. Circular wait

**Prevention:**
- Acquire locks in same order
- Use timeout (tryLock with timeout)
- Avoid nested locks

**Key takeaway:** Circular dependency. Acquire locks in consistent order.

---

### CountDownLatch vs CyclicBarrier vs Semaphore
**CountDownLatch:**
- One-time use
- Main thread waits for N threads to complete
- `countDown()` decrements, `await()` waits

**CyclicBarrier:**
- Reusable
- Threads wait for each other at a barrier point
- All proceed together after N threads reach barrier

**Semaphore:**
- Controls access to resource pool
- `acquire()` gets permit, `release()` returns it
- Example: Limit concurrent database connections

**Key takeaway:** Latch = wait for completion, Barrier = sync point, Semaphore = resource pool.

---

### Atomic Classes
`AtomicInteger`, `AtomicLong`, `AtomicBoolean`, etc. Provide lock-free thread-safe operations using CAS (Compare-And-Swap).

**Operations:** `get()`, `set()`, `incrementAndGet()`, `compareAndSet()`, etc.

**Advantage:** Better performance than synchronized for simple operations. No blocking.

**Key takeaway:** Lock-free atomicity. Use for counters, flags.

---

## Exception Handling

### Exception Hierarchy
```
Throwable
├── Error (unchecked, serious, don't catch)
│   └── OutOfMemoryError, StackOverflowError
└── Exception
    ├── RuntimeException (unchecked)
    │   └── NullPointerException, ArrayIndexOutOfBoundsException
    └── Checked Exceptions (must handle)
        └── IOException, SQLException
```

**Key takeaway:** Checked = must handle, Unchecked (RuntimeException + Error) = optional.

---

### Checked vs Unchecked Exceptions
**Checked Exceptions:**
- Compile-time check
- Must handle (try-catch or throws)
- Examples: IOException, SQLException
- Recoverable conditions

**Unchecked Exceptions (RuntimeException):**
- No compile-time check
- Programming errors (bugs)
- Examples: NullPointerException, ArithmeticException
- Should fix code, not catch

**Key takeaway:** Checked = recoverable, Unchecked = programming errors.

---

### try-catch-finally
```java
try {
    // Code that may throw exception
} catch (SpecificException e) {
    // Handle specific exception
} catch (Exception e) {
    // Handle general exception
} finally {
    // Always executes (cleanup)
}
```

**Multiple catch blocks:** Specific exceptions before general ones.

**finally:** Executes even if return in try/catch (except System.exit()).

**Key takeaway:** Specific exceptions first. finally for cleanup.

---

### try-with-resources (Java 7+)
Auto-closes resources implementing `AutoCloseable` or `Closeable`.

```java
try (FileReader fr = new FileReader("file.txt");
     BufferedReader br = new BufferedReader(fr)) {
    // Use resources
} // Automatically closed, even if exception
```

**Advantage:** No explicit finally block. Prevents resource leaks.

**Key takeaway:** Auto-close resources. Cleaner than finally.

---

### throw vs throws
**throw:** Keyword to explicitly throw an exception (in method body).
```java
throw new IllegalArgumentException("Invalid input");
```

**throws:** Declares exceptions a method might throw (in method signature).
```java
void readFile() throws IOException { /* ... */ }
```

**Key takeaway:** throw = throw exception, throws = declare in signature.

---

### Custom Exceptions
Extend `Exception` (checked) or `RuntimeException` (unchecked).

```java
class InsufficientFundsException extends Exception {
    public InsufficientFundsException(String message) {
        super(message);
    }
}
```

**Use case:** Business logic exceptions (insufficient balance, duplicate user, etc.).

**Key takeaway:** Meaningful exception names. Extend appropriate class.

---

## Java 8+ Features

### Lambda Expressions
Anonymous function for functional interfaces (interface with one abstract method).

**Syntax:** `(parameters) -> expression` or `(parameters) -> { statements }`

```java
// Before Java 8
Comparator<String> comp = new Comparator<String>() {
    public int compare(String s1, String s2) {
        return s1.length() - s2.length();
    }
};

// Java 8
Comparator<String> comp = (s1, s2) -> s1.length() - s2.length();
```

**Key takeaway:** Concise syntax for functional interfaces.

---

### Functional Interfaces
Interface with exactly one abstract method. Can have default/static methods.

**@FunctionalInterface:** Annotation ensures single abstract method (compile-time check).

**Common functional interfaces:**
- **Predicate<T>:** `boolean test(T t)` - filtering
- **Consumer<T>:** `void accept(T t)` - forEach
- **Supplier<T>:** `T get()` - factory
- **Function<T, R>:** `R apply(T t)` - transformation

**Key takeaway:** Single abstract method. Enables lambdas.

---

### Stream API
Process collections in declarative way. Supports functional-style operations.

**Operations:**
- **Intermediate (lazy):** filter, map, sorted, distinct (return Stream)
- **Terminal (eager):** forEach, collect, reduce, count (return result)

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
List<Integer> evenSquares = numbers.stream()
    .filter(n -> n % 2 == 0)
    .map(n -> n * n)
    .collect(Collectors.toList());
```

**Parallel streams:** `parallelStream()` for concurrent processing.

**Key takeaway:** Declarative. Intermediate ops lazy. Terminal ops trigger execution.

---

### Optional
Container object to avoid null checks. Prevents `NullPointerException`.

```java
Optional<String> opt = Optional.ofNullable(value);
String result = opt.orElse("default");
opt.ifPresent(v -> System.out.println(v));
```

**Methods:** `isPresent()`, `ifPresent()`, `orElse()`, `orElseGet()`, `orElseThrow()`, `map()`, `filter()`

**Key takeaway:** Explicit absence of value. Avoid null checks.

---

### Default and Static Methods in Interfaces
**Default methods (Java 8):**
- Provide implementation in interface
- Subclasses can override
- Backward compatibility (add methods without breaking implementations)

```java
interface Vehicle {
    default void start() {
        System.out.println("Starting...");
    }
}
```

**Static methods:**
- Utility methods in interface
- Called via interface name

**Key takeaway:** Default = instance method with body, Static = utility.

---

### Method References
Shorthand for lambdas calling a single method. `ClassName::methodName`

**Types:**
1. **Static method:** `Math::max` → `(a, b) -> Math.max(a, b)`
2. **Instance method (object):** `obj::toString` → `() -> obj.toString()`
3. **Instance method (class):** `String::toUpperCase` → `s -> s.toUpperCase()`
4. **Constructor:** `ArrayList::new` → `() -> new ArrayList()`

**Key takeaway:** Cleaner than lambdas for single method calls.

---

### Date & Time API (java.time)
Replaces old `Date`, `Calendar` (mutable, not thread-safe).

**Key classes:**
- **LocalDate:** Date without time (2025-01-15)
- **LocalTime:** Time without date (14:30:00)
- **LocalDateTime:** Date + time
- **ZonedDateTime:** Date + time + timezone
- **Instant:** Timestamp (machine-readable)
- **Duration:** Time difference
- **Period:** Date difference

**Immutable and thread-safe.**

**Key takeaway:** Immutable, thread-safe. Use LocalDate/LocalDateTime for most cases.

---

## Memory Management & JVM

### JVM Architecture
**Components:**
1. **Class Loader:** Loads .class files into memory
2. **Runtime Data Areas:**
   - **Heap:** Objects, instance variables (shared)
   - **Stack:** Method calls, local variables (per thread)
   - **Method Area:** Class metadata, static variables (shared)
   - **PC Register:** Current instruction (per thread)
   - **Native Method Stack:** Native method calls
3. **Execution Engine:**
   - **Interpreter:** Executes bytecode line by line
   - **JIT Compiler:** Compiles frequently used bytecode to native code
   - **Garbage Collector:** Reclaims unused memory

**Key takeaway:** Class Loader → Memory → Execution Engine.

---

### Heap vs Stack Memory
**Stack:**
- Stores method calls, local variables, references
- LIFO (Last In First Out)
- Thread-specific (each thread has own stack)
- Fast access
- Limited size (StackOverflowError if exceeded)
- Automatically cleared when method returns

**Heap:**
- Stores objects, instance variables
- Shared across threads
- Slower access (complex management)
- Larger size
- Garbage collected

**Key takeaway:** Stack = method calls/local vars, Heap = objects.

---

### Garbage Collection
Automatic memory management. Reclaims memory from unreachable objects.

**How it works:**
1. **Mark:** Identify reachable objects (starting from GC roots)
2. **Sweep:** Remove unreachable objects
3. **Compact:** Reduce fragmentation (optional)

**GC Roots:** Local variables, static variables, active threads, JNI references.

**Generations:**
- **Young Generation:** New objects. Frequent minor GCs (fast).
- **Old Generation:** Long-lived objects. Infrequent major GCs (slow).
- **Permanent/Metaspace:** Class metadata.

**GC Types:** Serial, Parallel, CMS, G1 (default in Java 9+), ZGC, Shenandoah.

**Key takeaway:** Automatic. Generational. Mark-Sweep-Compact.

---

### OutOfMemoryError
**Causes:**
1. **Heap space:** Too many objects, memory leak
2. **Metaspace:** Too many classes loaded
3. **Unable to create native thread:** Too many threads
4. **Direct buffer memory:** NIO buffers exhausted

**Solutions:**
- Increase heap size: `-Xmx4g`
- Fix memory leaks (analyze heap dumps)
- Tune GC settings
- Reduce object creation

**Key takeaway:** Insufficient memory. Analyze heap dumps. Tune or fix leaks.

---

### Memory Leaks in Java
Objects no longer needed but still referenced (not garbage collected).

**Common causes:**
1. Unclosed resources (files, connections)
2. Static collections growing indefinitely
3. Event listeners not deregistered
4. ThreadLocal not cleared
5. Inner class references (holding outer class reference)

**Detection:** Heap dump analysis (VisualVM, Eclipse MAT).

**Key takeaway:** Unreachable but referenced. Use try-with-resources, clear references.

---

### Strong, Soft, Weak, Phantom References
**Strong Reference (default):**
```java
Object obj = new Object(); // Not GC'd while reachable
```

**Soft Reference:** GC'd when memory is low. Use for caches.

**Weak Reference:** GC'd in next collection cycle. Use for WeakHashMap.

**Phantom Reference:** Object already finalized but not yet reclaimed. Use for cleanup tracking.

**Key takeaway:** Strong = normal, Soft = cache, Weak = WeakHashMap, Phantom = cleanup.

---

## Design Patterns

### Singleton Pattern
Ensures only one instance of a class exists.

**Eager initialization:**
```java
class Singleton {
    private static final Singleton INSTANCE = new Singleton();
    private Singleton() {}
    public static Singleton getInstance() { return INSTANCE; }
}
```

**Lazy initialization (thread-safe):**
```java
class Singleton {
    private static volatile Singleton instance;
    private Singleton() {}
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

**Best:** Use enum (thread-safe, serialization-safe).

**Key takeaway:** Single instance. Double-checked locking or enum.

---

### Factory Pattern
Creates objects without specifying exact class. Defines interface for creation, subclasses decide which class to instantiate.

```java
interface Shape { void draw(); }
class Circle implements Shape { public void draw() { } }
class Square implements Shape { public void draw() { } }

class ShapeFactory {
    public Shape getShape(String type) {
        if (type.equals("CIRCLE")) return new Circle();
        if (type.equals("SQUARE")) return new Square();
        return null;
    }
}
```

**Use case:** Object creation logic complex or varies by condition.

**Key takeaway:** Encapsulates object creation. Decouples client from concrete classes.

---

### Builder Pattern
Constructs complex objects step by step. Separates construction from representation.

```java
class User {
    private String name;
    private int age;

    private User(Builder builder) {
        this.name = builder.name;
        this.age = builder.age;
    }

    static class Builder {
        private String name;
        private int age;

        Builder setName(String name) { this.name = name; return this; }
        Builder setAge(int age) { this.age = age; return this; }
        User build() { return new User(this); }
    }
}

User user = new User.Builder().setName("John").setAge(30).build();
```

**Use case:** Many optional parameters, immutable objects.

**Key takeaway:** Step-by-step construction. Fluent API.

---

### Observer Pattern
One-to-many dependency. When one object changes state, all dependents notified.

**Example:** Event listeners, MVC (Model notifies View).

**Java support:** `Observable` class (deprecated), use custom implementation or libraries.

**Key takeaway:** Subject notifies observers. Loose coupling.

---

### Strategy Pattern
Defines family of algorithms, encapsulates each, makes them interchangeable.

```java
interface PaymentStrategy {
    void pay(int amount);
}
class CreditCard implements PaymentStrategy { /* ... */ }
class PayPal implements PaymentStrategy { /* ... */ }

class ShoppingCart {
    private PaymentStrategy paymentStrategy;
    void setPaymentStrategy(PaymentStrategy strategy) {
        this.paymentStrategy = strategy;
    }
    void checkout(int amount) {
        paymentStrategy.pay(amount);
    }
}
```

**Use case:** Multiple algorithms/behaviors, selected at runtime.

**Key takeaway:** Encapsulate algorithms. Select at runtime.

---

## Interview Tips

1. **Explain internals:** "HashMap uses array + linked list. hashCode() determines bucket, equals() for key match."
2. **Discuss tradeoffs:** "ArrayList fast for access, LinkedList for insertions."
3. **Real-world examples:** "Used ConcurrentHashMap for thread-safe cache in production."
4. **Know when to use:** "TreeSet for sorted unique elements, HashSet for fast lookups."
5. **Version awareness:** "Java 8 introduced Streams and Lambdas. Java 11 is LTS."

---

**Updated:** 2026-06-28 | **Level:** Intermediate-Advanced | **Format:** Interview-ready definitions
