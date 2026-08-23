# Java - Complete Interview Guide with Real Examples

> Comprehensive Java guide covering fundamentals to advanced concepts with detailed explanations and production-grade code examples.

---

## Table of Contents
1. [JVM Fundamentals](#jvm-fundamentals)
2. [Core Java Concepts](#core-java-concepts)
3. [Object-Oriented Programming](#object-oriented-programming)
4. [Collections Framework](#collections-framework)
5. [Exception Handling](#exception-handling)
6. [Multithreading & Concurrency](#multithreading--concurrency)
7. [Java 8+ Features](#java-8-features)
8. [Memory Management & GC](#memory-management--gc)
9. [Design Patterns](#design-patterns)

---

## JVM Fundamentals

### What is the JVM?

The **Java Virtual Machine (JVM)** is an abstract computing machine that allows a computer to run Java programs and programs written in other languages that are compiled to Java bytecode.

**Key insight:** The JVM acts as an intermediary between your code and the actual computer hardware. This is what gives Java its famous "Write Once, Run Anywhere" (WORA) capability.

#### JDK vs JRE vs JVM - The Complete Picture

```
┌─────────────────────────────────────────────┐
│             JDK (Java Development Kit)      │ ← Use this to DEVELOP
├─────────────────────────────────────────────┤
│ Contains:                                    │
│ ├─ Compiler (javac)                         │
│ ├─ Tools (debugger, profiler, etc.)         │
│ ├─ JRE (below)                              │
│ └─ Documentation                            │
└─────────────────────────────────────────────┘
           ↓ (includes)
┌─────────────────────────────────────────────┐
│      JRE (Java Runtime Environment)         │ ← Use this to RUN
├─────────────────────────────────────────────┤
│ Contains:                                    │
│ ├─ JVM (below)                              │
│ └─ Core libraries (rt.jar, etc.)            │
└─────────────────────────────────────────────┘
           ↓ (includes)
┌─────────────────────────────────────────────┐
│    JVM (Java Virtual Machine)               │ ← Actually EXECUTES code
├─────────────────────────────────────────────┤
│ Does:                                        │
│ ├─ Loads bytecode                           │
│ ├─ Converts to machine code (JIT)           │
│ ├─ Manages memory (Garbage Collection)      │
│ └─ Provides security sandbox                │
└─────────────────────────────────────────────┘
```

**Real analogy:** 
- **JDK** = Kitchen with chef (you develop recipes)
- **JRE** = Delivery service (delivers what you made)
- **JVM** = Oven that actually cooks (executes the recipe)

#### Compilation and Execution Flow

```
Step 1: Write Java Code
┌──────────────────┐
│ HelloWorld.java  │  ← Human-readable source code
└────────┬─────────┘
         │
Step 2: Compile with javac
┌────────────────────────────────────────┐
│ $ javac HelloWorld.java                │
│ (Compiler converts Java → Bytecode)    │
└────────┬───────────────────────────────┘
         │
Step 3: Bytecode Created
┌──────────────────┐
│ HelloWorld.class │  ← Platform-independent bytecode
└────────┬─────────┘
         │
Step 4: Run with java command
┌────────────────────────────────────────┐
│ $ java HelloWorld                      │
│ (Loads bytecode into JVM)              │
└────────┬───────────────────────────────┘
         │
Step 5: JVM Executes
┌────────────────────────────────────────────────┐
│ JVM reads bytecode instructions and:          │
│ ├─ Interprets (slower, line by line)          │
│ └─ JIT compiles hot code (faster, to native)  │
└────────┬───────────────────────────────────────┘
         │
Step 6: Native Machine Code Execution
┌────────────────────────────────────────┐
│ CPU executes actual machine code       │
│ (Windows/Linux/Mac - platform specific)│
└────────────────────────────────────────┘
```

**Example code:**

```java
// HelloWorld.java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

When you compile: `javac HelloWorld.java`
- Creates `HelloWorld.class` (bytecode)
- The bytecode is the SAME regardless of OS

When you run: `java HelloWorld`
- JVM reads the bytecode
- JVM's JIT compiler converts frequently used bytecode to native machine code
- Program runs

**Why this matters:** You can ship the `.class` file to Windows, Linux, or Mac - it will run on all!

---

### Memory Areas in JVM

The JVM allocates memory into different areas for different purposes:

```
┌─────────────────────────────────────────────────────────┐
│                   JVM Memory Layout                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ HEAP (Shared - Garbage Collected)                │  │
│  │ - All objects created here                       │  │
│  │ - Freed automatically by GC                      │  │
│  │ - Can cause OutOfMemoryError                     │  │
│  │ Example: new User(), new ArrayList<>()           │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ STACK (Per Thread - Not Garbage Collected)       │  │
│  │ - Method calls and local variables               │  │
│  │ - Each thread has its own stack                  │  │
│  │ - Automatically freed when method returns        │  │
│  │ - Can cause StackOverflowError                   │  │
│  │ Example: int x = 5; (stored in stack)            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ METHOD AREA (Shared - Class Metadata)            │  │
│  │ - Class structures, method data                  │  │
│  │ - Static variables                              │  │
│  │ - Method code                                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Example demonstrating stack vs heap:**

```java
public class MemoryExample {
    public static void main(String[] args) {
        int age = 25;                    // STACK: primitive value
        String name = "John";            // STACK: reference, HEAP: "John" object
        User user = new User("John", 25); // STACK: reference, HEAP: User object
    }
}

class User {
    String name;
    int age;
    
    User(String name, int age) {
        this.name = name;
        this.age = age;
    }
}

/* Memory visualization:
   
   STACK (main thread)              HEAP
   ───────────────────              ────
   age: 25                          User object
   name: ──────────┐                ├─ name: "John"
   user: ─────┐   │                ├─ age: 25
              │   │
              │   └────────→ "John" (String object)
              │
              └────────────→ User object
*/
```

**Key differences:**

| Aspect | Stack | Heap |
|--------|-------|------|
| **Speed** | Fast (LIFO) | Slower (complex allocation) |
| **Size** | Smaller | Larger |
| **Thread** | Per thread | Shared |
| **Cleanup** | Automatic (when method ends) | GC cleanup |
| **Error** | StackOverflowError (too deep calls) | OutOfMemoryError (too many objects) |

---

## Core Java Concepts

### String, StringBuilder, StringBuffer Explained

Strings in Java are one of the most important concepts. Let me explain why there are 3 different types:

#### 1. String - Immutable

```java
public class StringExample {
    public static void main(String[] args) {
        // Creating strings
        String s1 = "Hello";
        String s2 = "Hello";
        String s3 = new String("Hello");
        
        // String intern: s1 and s2 point to SAME object in memory
        System.out.println(s1 == s2);           // true (same reference)
        System.out.println(s1 == s3);           // false (different objects)
        System.out.println(s1.equals(s3));      // true (same content)
    }
}
```

**Why immutable?** Once created, a String cannot be changed. Every operation creates a NEW string:

```java
String original = "Hello";
String modified = original + " World";  // Creates NEW String object
// original is still "Hello" (unchanged)
// modified is "Hello World" (new object in memory)

// This is INEFFICIENT when done in loops:
String result = "";
for (int i = 0; i < 100000; i++) {
    result = result + i;  // Creates 100,000 new String objects!
}
```

#### 2. StringBuilder - Mutable (Single-threaded)

```java
public class StringBuilderExample {
    public static void main(String[] args) {
        // StringBuilder is mutable and FAST
        StringBuilder sb = new StringBuilder();
        
        for (int i = 0; i < 100000; i++) {
            sb.append(i);  // REUSES same object, just modifies internally
        }
        
        String result = sb.toString();
        System.out.println(result.length()); // 488895
        
        // StringBuilder operations:
        sb.append("Hello");     // Add to end
        sb.insert(0, "Start");  // Insert at position
        sb.delete(0, 5);        // Delete range
        sb.reverse();           // Reverse
    }
}
```

**Performance comparison:**

```java
// SLOW: Using String concatenation
long start = System.nanoTime();
String result = "";
for (int i = 0; i < 100000; i++) {
    result = result + i;  // O(n²) time complexity
}
long stringTime = System.nanoTime() - start;

// FAST: Using StringBuilder
start = System.nanoTime();
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 100000; i++) {
    sb.append(i);  // O(n) time complexity
}
result = sb.toString();
long sbTime = System.nanoTime() - start;

System.out.println("String concat time: " + stringTime);
System.out.println("StringBuilder time: " + sbTime);
// StringBuilder is typically 100-1000x faster!
```

#### 3. StringBuffer - Mutable (Thread-safe)

```java
public class StringBufferExample {
    public static void main(String[] args) {
        // StringBuffer is synchronized (thread-safe)
        StringBuffer buffer = new StringBuffer();
        
        buffer.append("Hello");
        buffer.append(" ");
        buffer.append("World");
        
        System.out.println(buffer.toString()); // "Hello World"
    }
}

// StringBuffer vs StringBuilder in multi-threaded context:
public class ThreadSafeExample {
    public static void main(String[] args) throws InterruptedException {
        StringBuffer buffer = new StringBuffer(); // Thread-safe
        
        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 1000; i++) {
                buffer.append("T1");
            }
        });
        
        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 1000; i++) {
                buffer.append("T2");
            }
        });
        
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        
        System.out.println("Length: " + buffer.length()); // Always 6000 (thread-safe)
    }
}
```

**When to use:**

| Type | When | Example |
|------|------|---------|
| **String** | Immutable, constants | `final String SQL = "SELECT * FROM users"` |
| **StringBuilder** | Building strings in loops (single thread) | `sb.append()` in loop |
| **StringBuffer** | Building strings in multi-threaded code | Rarely used anymore |

---

### equals() vs == Explained

This is one of the most common interview questions. Let me explain thoroughly:

```java
public class EqualsVsEqualsExample {
    public static void main(String[] args) {
        // PRIMITIVES: == compares VALUE
        int a = 5;
        int b = 5;
        System.out.println(a == b);  // true (same value)
        
        // OBJECTS: == compares REFERENCE (memory address)
        String s1 = new String("Hello");
        String s2 = new String("Hello");
        System.out.println(s1 == s2);      // false (different objects)
        System.out.println(s1.equals(s2)); // true (same content)
    }
}
```

**Visual representation:**

```
String s1 = new String("Hello");
String s2 = new String("Hello");

Memory:
┌─────────────────────────────────────┐
│ Stack             │ Heap             │
├─────────────────────────────────────┤
│ s1: ─────────────→│ String object 1  │
│                   │ value: "Hello"   │
│                   │                  │
│ s2: ─────────────→│ String object 2  │
│                   │ value: "Hello"   │
└─────────────────────────────────────┘

s1 == s2       → false (different memory addresses)
s1.equals(s2)  → true (same content)
```

**Common mistake - with strings:**

```java
String s1 = "Hello";     // String pool
String s2 = "Hello";     // Same string from pool
System.out.println(s1 == s2); // true! (same reference in string pool)

String s3 = new String("Hello");
System.out.println(s1 == s3); // false! (different objects)
```

**Why `.equals()` matters:**

```java
public class User {
    String email;
    
    User(String email) {
        this.email = email;
    }
    
    // WRONG: Using == to compare strings
    public boolean emailMatches(String other) {
        return this.email == other;  // May return false even if content is same
    }
    
    // CORRECT: Using .equals()
    public boolean emailMatches(String other) {
        return this.email.equals(other);  // Compares content
    }
}

// Usage
User user = new User("john@example.com");
String emailFromDB = new String("john@example.com"); // Different object

user.emailMatches(emailFromDB);  // WRONG version returns false!
                                 // CORRECT version returns true!
```

---

### hashCode() and equals() Contract

When you override `equals()`, you MUST also override `hashCode()`. Let me show why:

```java
public class User {
    String email;
    String name;
    
    User(String email, String name) {
        this.email = email;
        this.name = name;
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        
        User user = (User) obj;
        return Objects.equals(email, user.email);
    }
    
    // MUST override hashCode() also!
    @Override
    public int hashCode() {
        return Objects.hash(email);
    }
}

// Why this matters:
public class HashCodeExample {
    public static void main(String[] args) {
        Map<User, String> userMap = new HashMap<>();
        
        User user1 = new User("john@example.com", "John");
        userMap.put(user1, "John's data");
        
        User user2 = new User("john@example.com", "John");
        
        // If we only override equals() but NOT hashCode():
        // user1.equals(user2) returns true
        // But user1.hashCode() != user2.hashCode()
        // So HashMap treats them as different keys!
        
        System.out.println(user1.equals(user2));  // true
        System.out.println(userMap.get(user2));   // null (WRONG!)
        
        // With proper hashCode(), it works:
        userMap.put(user2, "John's data");
        System.out.println(userMap.get(user2));   // "John's data" (CORRECT!)
    }
}
```

**Contract rules:**

```
If a.equals(b) is true, then a.hashCode() MUST equal b.hashCode()

Example:
User a = new User("john@example.com");
User b = new User("john@example.com");

a.equals(b)           → true
a.hashCode() == b.hashCode() → true (REQUIRED!)
```

---

## Object-Oriented Programming

### The Four Pillars of OOP - With Real Code

#### 1. Encapsulation - Hide Implementation

**Without encapsulation (BAD):**

```java
public class BankAccount {
    public double balance;  // Anyone can access and modify!
}

// Usage
BankAccount account = new BankAccount();
account.balance = 1000;
account.balance = -5000;  // WRONG! No validation!
account.balance = 999999; // WRONG! Fraud!
```

**With encapsulation (GOOD):**

```java
public class BankAccount {
    private double balance;  // Only accessible through methods
    
    public void deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        this.balance += amount;
    }
    
    public void withdraw(double amount) {
        if (amount > balance) {
            throw new IllegalArgumentException("Insufficient funds");
        }
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        this.balance -= amount;
    }
    
    public double getBalance() {
        return balance;
    }
}

// Usage
BankAccount account = new BankAccount();
account.deposit(1000);    // VALID: balance = 1000
account.withdraw(500);    // VALID: balance = 500
account.withdraw(600);    // INVALID: throws exception
account.balance = -5000;  // COMPILE ERROR! (private, cannot access)
```

#### 2. Inheritance - Code Reuse

**Example: Employee hierarchy**

```java
// Base class
public class Employee {
    protected String name;
    protected double salary;
    
    public Employee(String name, double salary) {
        this.name = name;
        this.salary = salary;
    }
    
    public void work() {
        System.out.println(name + " is working");
    }
    
    public double getSalary() {
        return salary;
    }
}

// Subclass - Manager inherits from Employee
public class Manager extends Employee {
    private int teamSize;
    
    public Manager(String name, double salary, int teamSize) {
        super(name, salary);  // Call parent constructor
        this.teamSize = teamSize;
    }
    
    @Override
    public void work() {
        System.out.println(name + " is managing team of " + teamSize);
    }
    
    public void conductMeeting() {
        System.out.println("Conducting meeting with team");
    }
}

// Subclass - Developer inherits from Employee
public class Developer extends Employee {
    private String programmingLanguage;
    
    public Developer(String name, double salary, String language) {
        super(name, salary);
        this.programmingLanguage = language;
    }
    
    @Override
    public void work() {
        System.out.println(name + " is coding in " + programmingLanguage);
    }
}

// Usage
public class Main {
    public static void main(String[] args) {
        Employee manager = new Manager("Alice", 80000, 5);
        Employee developer = new Developer("Bob", 70000, "Java");
        
        manager.work();      // Alice is managing team of 5
        developer.work();    // Bob is coding in Java
        
        // Both have same interface but different behavior
    }
}
```

#### 3. Polymorphism - Same Interface, Different Behavior

**Runtime Polymorphism (Method Overriding):**

```java
public class PaymentExample {
    // We don't know which payment method will be used at runtime
    public static void processPayment(PaymentMethod payment, double amount) {
        payment.pay(amount);  // Calls appropriate method based on actual type
    }
}

interface PaymentMethod {
    void pay(double amount);
}

class CreditCardPayment implements PaymentMethod {
    @Override
    public void pay(double amount) {
        System.out.println("Processing credit card payment: $" + amount);
        // Add 3% fee
        System.out.println("Fee: $" + (amount * 0.03));
    }
}

class PayPalPayment implements PaymentMethod {
    @Override
    public void pay(double amount) {
        System.out.println("Processing PayPal payment: $" + amount);
        // Add 2% fee
        System.out.println("Fee: $" + (amount * 0.02));
    }
}

class BitcoinPayment implements PaymentMethod {
    @Override
    public void pay(double amount) {
        System.out.println("Processing Bitcoin payment: " + amount + " USD");
        // No fee
    }
}

// Usage
PaymentExample.processPayment(new CreditCardPayment(), 100);
// Output: Processing credit card payment: $100
//         Fee: $3.0

PaymentExample.processPayment(new PayPalPayment(), 100);
// Output: Processing PayPal payment: $100
//         Fee: $2.0

PaymentExample.processPayment(new BitcoinPayment(), 100);
// Output: Processing Bitcoin payment: 100.0 USD
```

**Compile-time Polymorphism (Method Overloading):**

```java
public class Calculator {
    // Same method name, different parameters
    
    public static int add(int a, int b) {
        return a + b;
    }
    
    public static double add(double a, double b) {
        return a + b;
    }
    
    public static String add(String a, String b) {
        return a + b;
    }
    
    public static int add(int a, int b, int c) {
        return a + b + c;
    }
}

// Usage
System.out.println(Calculator.add(5, 10));              // 15 (int method)
System.out.println(Calculator.add(5.5, 10.5));          // 16.0 (double method)
System.out.println(Calculator.add("Hello", "World"));   // "HelloWorld" (String method)
System.out.println(Calculator.add(1, 2, 3));            // 6 (3 params method)
```

#### 4. Abstraction - Hide Complexity

```java
// Abstract class - defines contract for subclasses
public abstract class Animal {
    private String name;
    
    public Animal(String name) {
        this.name = name;
    }
    
    // Abstract method - MUST be implemented by subclasses
    abstract void makeSound();
    
    // Concrete method - can be used by all subclasses
    public void sleep() {
        System.out.println(name + " is sleeping");
    }
}

public class Dog extends Animal {
    public Dog(String name) {
        super(name);
    }
    
    @Override
    void makeSound() {
        System.out.println("Woof! Woof!");
    }
}

public class Cat extends Animal {
    public Cat(String name) {
        super(name);
    }
    
    @Override
    void makeSound() {
        System.out.println("Meow! Meow!");
    }
}

// Real-world example: Abstract shapes
public abstract class Shape {
    abstract double getArea();
    abstract double getPerimeter();
}

public class Circle extends Shape {
    private double radius;
    
    public Circle(double radius) {
        this.radius = radius;
    }
    
    @Override
    double getArea() {
        return Math.PI * radius * radius;
    }
    
    @Override
    double getPerimeter() {
        return 2 * Math.PI * radius;
    }
}

public class Rectangle extends Shape {
    private double width, height;
    
    public Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }
    
    @Override
    double getArea() {
        return width * height;
    }
    
    @Override
    double getPerimeter() {
        return 2 * (width + height);
    }
}
```

---

## Collections Framework

### ArrayList vs LinkedList - When to Use Each

```java
public class ArrayListVsLinkedListExample {
    public static void main(String[] args) {
        // ARRAYLIST: Fast for accessing, slow for inserting/deleting
        List<String> arrayList = new ArrayList<>();
        long start = System.nanoTime();
        for (int i = 0; i < 100000; i++) {
            arrayList.add(i, "Element");  // INSERT at beginning - O(n)
        }
        long arrayListTime = System.nanoTime() - start;
        
        // LINKEDLIST: Slow for accessing, fast for inserting/deleting
        List<String> linkedList = new LinkedList<>();
        start = System.nanoTime();
        for (int i = 0; i < 100000; i++) {
            linkedList.add(0, "Element"); // INSERT at beginning - O(1)
        }
        long linkedListTime = System.nanoTime() - start;
        
        System.out.println("ArrayList insertion time: " + arrayListTime);
        System.out.println("LinkedList insertion time: " + linkedListTime);
        
        // Results show LinkedList is 100x faster for insertions at beginning
    }
}
```

**Visual representation:**

```
ARRAYLIST:
[A][B][C][D][E]  ← Contiguous memory

Inserting X at position 1:
Step 1: Shift D and E: [A][B][C][D][_]
Step 2: Shift C and D: [A][B][_][C][D]
Step 3: Shift B and C: [A][_][B][C][D]
Step 4: Insert X:     [A][X][B][C][D]
Result: O(n) time complexity

LINKEDLIST:
A ↔ B ↔ C ↔ D ↔ E

Inserting X at position 1:
Step 1: Create X node
Step 2: X.next = B; A.prev = X; X.prev = A; B.prev = X
Result: O(1) time complexity
```

### HashMap - Internal Working

```java
public class HashMapInternalExample {
    public static void main(String[] args) {
        Map<String, Integer> map = new HashMap<>();
        
        // When you do: map.put("John", 25)
        // 1. Calculate hashCode("John") = some integer
        // 2. Apply hash function: index = hashCode % capacity
        // 3. Place at that bucket
        
        map.put("John", 25);
        map.put("Alice", 30);
        map.put("Bob", 28);
        
        System.out.println(map.get("John"));   // 25 - retrieves in O(1)
        
        // Hash collision example:
        Map<Integer, String> map2 = new HashMap<>();
        map2.put(1, "One");
        map2.put(2, "Two");
        map2.put(1, "ONE");  // Same key - overwrites value
        
        System.out.println(map2.size()); // 2 (not 3)
    }
}
```

**HashMap visual:**

```
HashMap bucket array (capacity = 16):

Index  Bucket
───────────────────────────────────────
  0  │ null
  1  │ Entry{key="Alice", value=30}
  2  │ null
  3  │ Entry{key="John", value=25} → Entry{key="Bob", value=28}
     │ (collision: both hash to index 3)
 ... │ ...
 15  │ null
```

When you call `map.get("John")`:
1. Calculate hash("John") → index 3
2. Go to bucket 3
3. Linear search: "John" matches, return 25

**Hash collision handling (Java 8+):**

```java
public class HashCollisionExample {
    public static void main(String[] args) {
        Map<String, String> map = new HashMap<>();
        
        // When multiple values hash to same bucket:
        // Java < 8: Uses linked list (O(n) lookup when many collisions)
        // Java 8+:  Converts to balanced tree when bucket size > 8 (O(log n))
        
        // Simulate many collisions
        for (int i = 0; i < 20; i++) {
            map.put("Key" + i, "Value" + i);
        }
        
        // If they all hash to same bucket:
        // Java < 8: O(20) lookup time
        // Java 8+:  O(log 20) ≈ O(5) lookup time
    }
}
```

---

## Exception Handling

### Checked vs Unchecked Exceptions

```java
// UNCHECKED: Programming errors (RuntimeException)
public class UncheckedExceptionExample {
    public static void main(String[] args) {
        String s = null;
        System.out.println(s.length()); // NullPointerException
        // Compiler DOESN'T force you to catch this
        // It's a BUG in your code
    }
}

// CHECKED: External errors (must handle)
public class CheckedExceptionExample {
    public static void main(String[] args) throws IOException {
        // Compiler FORCES you to handle this
        FileReader fr = new FileReader("file.txt");
        // File might not exist (external condition)
        // You MUST catch or declare throws
    }
}
```

**Real-world example:**

```java
public class ExceptionHandlingExample {
    // Method 1: Try-catch
    public static String readFile1(String filename) {
        try {
            BufferedReader reader = new BufferedReader(new FileReader(filename));
            return reader.readLine();
        } catch (FileNotFoundException e) {
            System.out.println("File not found: " + filename);
            return null;
        } catch (IOException e) {
            System.out.println("Error reading file: " + e.getMessage());
            return null;
        }
    }
    
    // Method 2: Try-with-resources (Java 7+) - AUTO CLOSES
    public static String readFile2(String filename) throws IOException {
        try (BufferedReader reader = new BufferedReader(new FileReader(filename))) {
            return reader.readLine();
            // Reader automatically closed here, even if exception occurs
        }
    }
    
    // Method 3: Declare throws
    public static String readFile3(String filename) throws IOException {
        BufferedReader reader = new BufferedReader(new FileReader(filename));
        return reader.readLine();
        // Caller must handle IOException
    }
}
```

---

## Multithreading & Concurrency

### Creating and Running Threads

```java
// Method 1: Extend Thread class
public class MyThread extends Thread {
    private String name;
    
    public MyThread(String name) {
        this.name = name;
    }
    
    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(name + " - iteration " + i);
            try {
                Thread.sleep(1000); // Sleep 1 second
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}

// Method 2: Implement Runnable (PREFERRED)
public class MyTask implements Runnable {
    private String name;
    
    public MyTask(String name) {
        this.name = name;
    }
    
    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(name + " - iteration " + i);
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}

// Usage
public class ThreadExample {
    public static void main(String[] args) {
        // Method 1
        MyThread thread1 = new MyThread("Thread-1");
        thread1.start();  // NOT run() - that runs synchronously
        
        // Method 2
        Thread thread2 = new Thread(new MyTask("Thread-2"));
        thread2.start();
        
        // Both run concurrently
    }
}
```

**Output:**
```
Thread-1 - iteration 0
Thread-2 - iteration 0
Thread-1 - iteration 1
Thread-2 - iteration 1
(interleaved, not in order)
```

### Synchronization - Fixing Race Conditions

```java
// PROBLEM: Race condition
public class BadCounter {
    private int count = 0;
    
    public void increment() {
        count++;  // NOT atomic! 3 steps: read, add, write
    }
    
    public int getCount() {
        return count;
    }
}

public class RaceConditionExample {
    public static void main(String[] args) throws InterruptedException {
        BadCounter counter = new BadCounter();
        
        // Create 2 threads, each increments 10000 times
        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 10000; i++) {
                counter.increment();
            }
        });
        
        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 10000; i++) {
                counter.increment();
            }
        });
        
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        
        System.out.println("Count: " + counter.getCount());
        // Expected: 20000
        // Actual: ~15000-19000 (varies, due to race condition!)
    }
}
```

**Why race condition happens:**

```
Thread 1          Thread 2          Shared Memory
─────────────────────────────────────────────────
              (count = 0)
Read count 0
                  Read count 0
                  Add 1 = 1
Write 1                            count = 1
                  Write 1                (only 1, not 2!)
Add 1 = 1
Write 1                            count = 1
```

**SOLUTION 1: Synchronized Method**

```java
public class GoodCounter1 {
    private int count = 0;
    
    // Only ONE thread can execute this at a time
    public synchronized void increment() {
        count++;
    }
    
    public synchronized int getCount() {
        return count;
    }
}
```

**SOLUTION 2: Synchronized Block (Better granularity)**

```java
public class GoodCounter2 {
    private int count = 0;
    private Object lock = new Object();
    
    public void increment() {
        synchronized(lock) {
            count++;  // Protected section
        }
    }
    
    public int getCount() {
        synchronized(lock) {
            return count;
        }
    }
}
```

**SOLUTION 3: AtomicInteger (Best)**

```java
public class GoodCounter3 {
    private AtomicInteger count = new AtomicInteger(0);
    
    public void increment() {
        count.incrementAndGet();  // Atomic operation
    }
    
    public int getCount() {
        return count.get();
    }
}
```

### Producer-Consumer Pattern

```java
public class ProducerConsumerExample {
    static class Queue {
        private LinkedList<Integer> buffer = new LinkedList<>();
        private static final int CAPACITY = 10;
        
        public synchronized void produce(int value) throws InterruptedException {
            while (buffer.size() == CAPACITY) {
                wait();  // Wait if buffer is full
            }
            buffer.add(value);
            System.out.println("Produced: " + value + ", buffer size: " + buffer.size());
            notifyAll();  // Wake up consumers
        }
        
        public synchronized int consume() throws InterruptedException {
            while (buffer.isEmpty()) {
                wait();  // Wait if buffer is empty
            }
            int value = buffer.removeFirst();
            System.out.println("Consumed: " + value + ", buffer size: " + buffer.size());
            notifyAll();  // Wake up producers
            return value;
        }
    }
    
    public static void main(String[] args) {
        Queue queue = new Queue();
        
        // Producer thread
        new Thread(() -> {
            try {
                for (int i = 1; i <= 20; i++) {
                    queue.produce(i);
                    Thread.sleep(100);
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();
        
        // Consumer thread
        new Thread(() -> {
            try {
                for (int i = 0; i < 20; i++) {
                    queue.consume();
                    Thread.sleep(200);
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();
    }
}
```

---

## Java 8+ Features

### Lambda Expressions - Concise Code

```java
public class LambdaExample {
    public static void main(String[] args) {
        // BEFORE Java 8
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
        Collections.sort(numbers, new Comparator<Integer>() {
            @Override
            public int compare(Integer a, Integer b) {
                return a - b;
            }
        });
        
        // AFTER Java 8 - Lambda expression
        Collections.sort(numbers, (a, b) -> a - b);
        System.out.println(numbers); // [1, 2, 3, 4, 5]
    }
}

// Real example: Filtering with lambdas
public class FilteringExample {
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        
        // Filter even numbers using lambda
        List<Integer> evens = numbers.stream()
            .filter(n -> n % 2 == 0)  // Lambda: n -> n % 2 == 0
            .collect(Collectors.toList());
        
        System.out.println(evens); // [2, 4, 6, 8, 10]
    }
}
```

### Streams API - Functional Processing

```java
public class StreamExample {
    static class Student {
        String name;
        int score;
        
        Student(String name, int score) {
            this.name = name;
            this.score = score;
        }
    }
    
    public static void main(String[] args) {
        List<Student> students = Arrays.asList(
            new Student("Alice", 85),
            new Student("Bob", 92),
            new Student("Charlie", 78),
            new Student("David", 88)
        );
        
        // Filter, Map, Sort, Collect
        List<String> highScorers = students.stream()
            .filter(s -> s.score >= 80)           // Keep scores >= 80
            .sorted((a, b) -> b.score - a.score)  // Sort descending
            .map(s -> s.name)                     // Extract names
            .collect(Collectors.toList());        // Collect to list
        
        System.out.println(highScorers);
        // Output: [Bob, Alice, David]
        
        // More examples
        double averageScore = students.stream()
            .mapToInt(s -> s.score)
            .average()
            .orElse(0);
        System.out.println("Average: " + averageScore); // 85.75
        
        // Count
        long count = students.stream()
            .filter(s -> s.score >= 80)
            .count();
        System.out.println("High scorers: " + count); // 3
    }
}
```

---

## Memory Management & GC

### Understanding Garbage Collection

```java
public class GarbageCollectionExample {
    static class DataObject {
        byte[] data = new byte[10 * 1024]; // 10KB
        
        @Override
        protected void finalize() {
            System.out.println("DataObject garbage collected");
        }
    }
    
    public static void main(String[] args) {
        // Objects created in loop
        for (int i = 0; i < 1000; i++) {
            DataObject obj = new DataObject();
            // obj goes out of scope and becomes eligible for GC
        }
        
        System.out.println("Objects created");
        System.gc();  // Suggest garbage collection (not guaranteed)
        
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}

// Output:
// Objects created
// DataObject garbage collected
// (repeated multiple times)
```

### Memory Leaks - Common Examples

```java
// MEMORY LEAK 1: Not closing resources
public class MemoryLeakExample1 {
    public static void readFile(String filename) throws IOException {
        FileReader fr = new FileReader(filename);
        BufferedReader br = new BufferedReader(fr);
        String line = br.readLine();
        System.out.println(line);
        // LEAK: Never closed! File handle held
    }
    
    // FIXED: Use try-with-resources
    public static void readFileFixed(String filename) throws IOException {
        try (BufferedReader br = new BufferedReader(new FileReader(filename))) {
            String line = br.readLine();
            System.out.println(line);
        } // Auto-closed here
    }
}

// MEMORY LEAK 2: Static collection growing
public class MemoryLeakExample2 {
    static List<Object> cache = new ArrayList<>();  // Static = never GC'd
    
    public void cacheObject(Object obj) {
        cache.add(obj);  // Keeps growing!
        // If called 1000 times, all 1000 objects stay in memory
    }
}

// MEMORY LEAK 3: Not removing listeners
public class MemoryLeakExample3 {
    static List<EventListener> listeners = new ArrayList<>();
    
    public void registerListener(EventListener listener) {
        listeners.add(listener);
    }
    
    // PROBLEM: No unregisterListener method!
    // Listener stays in memory even after GUI component is deleted
}
```

---

## Design Patterns

### Singleton Pattern - Ensuring Single Instance

```java
// WRONG: Not thread-safe
public class SingletonWrong {
    private static SingletonWrong instance;
    
    private SingletonWrong() {}
    
    public static SingletonWrong getInstance() {
        if (instance == null) {  // NOT THREAD-SAFE!
            instance = new SingletonWrong();
        }
        return instance;
    }
}

// Why it's wrong: Two threads can enter if block simultaneously
// Thread 1: if (instance == null) ← true
// Thread 2: if (instance == null) ← true (checked before T1 created)
// Both create instances!

// CORRECT: Thread-safe
public class SingletonCorrect {
    private static volatile SingletonCorrect instance;
    
    private SingletonCorrect() {}
    
    public static SingletonCorrect getInstance() {
        if (instance == null) {
            synchronized(SingletonCorrect.class) {
                if (instance == null) {
                    instance = new SingletonCorrect();
                }
            }
        }
        return instance;
    }
}

// BEST: Using Enum (thread-safe, serialization-safe)
public enum SingletonEnum {
    INSTANCE;
    
    public void doSomething() {
        System.out.println("Doing something");
    }
}

// Usage
SingletonEnum.INSTANCE.doSomething();
```

### Factory Pattern - Flexible Object Creation

```java
public class FactoryPatternExample {
    // Database connection factory
    interface Database {
        void connect();
    }
    
    static class MySQLDatabase implements Database {
        @Override
        public void connect() {
            System.out.println("Connected to MySQL");
        }
    }
    
    static class PostgresDatabase implements Database {
        @Override
        public void connect() {
            System.out.println("Connected to PostgreSQL");
        }
    }
    
    // Factory
    static class DatabaseFactory {
        public static Database getDatabase(String type) {
            switch(type) {
                case "mysql":
                    return new MySQLDatabase();
                case "postgres":
                    return new PostgresDatabase();
                default:
                    throw new IllegalArgumentException("Unknown DB: " + type);
            }
        }
    }
    
    // Usage
    public static void main(String[] args) {
        // No need to know which class to instantiate
        Database db = DatabaseFactory.getDatabase("mysql");
        db.connect();
        
        db = DatabaseFactory.getDatabase("postgres");
        db.connect();
    }
}
```

---

## Interview Tips & Common Mistakes

### 1. String Immutability

```java
// MISTAKE: Thinking string is modified
String s = "Hello";
s = s + " World";  // Creates NEW String, s still refers to "Hello World"
// OLD "Hello" object is garbage collected (unreferenced)
```

### 2. Pass-by-Value Misunderstanding

```java
public class PassByValueExample {
    public static void main(String[] args) {
        int x = 5;
        modify(x);
        System.out.println(x);  // Still 5! (primitives pass value copy)
        
        List<String> list = new ArrayList<>();
        list.add("Hello");
        modify(list);
        System.out.println(list);  // ["Hello", "World"] (references pass reference)
    }
    
    static void modify(int x) {
        x = 10;  // Changes local copy only
    }
    
    static void modify(List<String> list) {
        list.add("World");  // Modifies actual list
    }
}
```

### 3. == vs equals()

```java
String s1 = "Hello";
String s2 = "Hello";
String s3 = new String("Hello");

s1 == s2   // true (same string pool reference)
s1 == s3   // false (different objects)
s1.equals(s3) // true (same content)
```

**Last Updated:** 2026-08-23 | **Level:** Comprehensive for Interviews | **Format:** Detailed with Examples
