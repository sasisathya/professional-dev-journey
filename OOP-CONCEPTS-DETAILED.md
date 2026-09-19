# Object-Oriented Programming (OOP) - Comprehensive Deep Dive

> Enterprise-level explanations for 10+ years experience professionals
> Internal mechanisms, pitfalls, and advanced concepts

---

## Table of Contents
1. [Class vs Objects](#class-vs-objects)
2. [Encapsulation](#encapsulation)
3. [Inheritance](#inheritance)
4. [Polymorphism](#polymorphism)
5. [Abstraction](#abstraction)
6. [Method Overloading](#method-overloading)
7. [Method Overriding](#method-overriding)
8. [Interface](#interface)
9. [Abstract Class](#abstract-class)
10. [Interface vs Abstract Class](#interface-vs-abstract-class)
11. [Composition vs Inheritance](#composition-vs-inheritance)
12. [This vs Instance](#this-vs-instance)
13. [Static vs Instance](#static-vs-instance)
14. [Constructor](#constructor)
15. [Object Class](#object-class)
16. [equals() + hashCode()](#equals--hashcode)

---

## Class vs Objects

### Definition

**Class:**
- Blueprint/template for creating objects
- Logical entity (exists in code, not in memory at runtime)
- Defines structure and behavior
- Single definition for multiple instances

**Object:**
- Instance of a class
- Physical entity (exists in memory at runtime)
- Has specific values for attributes defined by class
- Individual entity with its own state

### Internal Mechanism

```
Memory Layout - Class Definition (Compile-time):
┌─────────────────────────────────────┐
│ Class: Person                       │
├─────────────────────────────────────┤
│ Methods (shared across all objects) │
│ ├─ getName() [one copy]            │
│ ├─ setName() [one copy]            │
│ └─ getAge() [one copy]             │
│                                     │
│ Attributes (definition, not values) │
│ ├─ name: String                    │
│ ├─ age: int                        │
│ └─ email: String                   │
└─────────────────────────────────────┘

Memory Layout - Objects (Runtime):
┌──────────────────────────┐  ┌──────────────────────────┐
│ Object 1: Person         │  │ Object 2: Person         │
├──────────────────────────┤  ├──────────────────────────┤
│ name: "John" (0x1000)    │  │ name: "Jane" (0x2000)    │
│ age: 30 (0x1004)         │  │ age: 28 (0x2004)         │
│ email: "john@..." (ref)  │  │ email: "jane@..." (ref)  │
│ [Methods point to shared │  │ [Methods point to shared │
│  code in class]          │  │  code in class]          │
└──────────────────────────┘  └──────────────────────────┘
```

### Key Differences

| Aspect | Class | Object |
|--------|-------|--------|
| **Type** | Logical | Physical |
| **Existence** | At compile-time | At runtime |
| **Memory** | No memory allocation | Memory allocated |
| **Quantity** | One per type | Multiple instances |
| **Mutability** | Fixed after compilation | State can change |
| **Declaration** | `class Person { }` | `Person p = new Person()` |

### Critical Insight: Class Loading vs Object Instantiation

```
Stage 1: Compilation (Java → Bytecode)
  ├─ Class definition analyzed
  ├─ Method signatures verified
  ├─ Type checking done
  └─ .class file created (bytecode)

Stage 2: Class Loading (into JVM)
  ├─ Classloader reads .class file
  ├─ Single copy loaded in Metaspace/PermGen
  ├─ Methods stored in method area
  ├─ Static variables initialized
  └─ Ready for instantiation

Stage 3: Object Instantiation
  ├─ Memory allocated on heap
  ├─ Constructor called
  ├─ Instance variables initialized
  ├─ Object reference created
  └─ Multiple objects can coexist

Key Point:
  One class definition
  ↓
  Loaded once into JVM memory
  ↓
  Can create unlimited objects from it
```

### Advanced Questions

**Q1: Why are methods stored once in class but accessible from all objects?**
A: Methods are shared code (part of class definition). The JVM stores one copy in method area. When you call `person1.getName()` vs `person2.getName()`, both execute the SAME method code with different `this` context.

**Q2: Can you modify a class after object creation?**
A: No. Class definition is immutable after compilation. You can't add methods at runtime (unless using reflection/bytecode manipulation). But object STATE (instance variables) can change.

**Q3: What's the memory overhead of creating 1 million objects?**
A: 
- Class definition: ~50KB (loaded once)
- Each object: Depends on attributes
  - Object header: ~16 bytes (JVM internal)
  - Instance variables: Depends on types
  - Example: Person with 3 references (24 bytes each) + 1 int (4 bytes) = ~88 bytes per object
  - 1 million objects: ~88MB of instance data (plus GC overhead)

**Q4: What happens if you don't define a constructor?**
A: Compiler auto-generates default no-arg constructor. This is empty (does nothing) unless you call `super()` implicitly. If you define any constructor, default is NOT auto-generated.

---

## Encapsulation

### Definition

Bundling data (attributes) and methods that operate on data within a single unit (class), while hiding internal implementation details from the outside world.

### Internal Mechanism

```
Without Encapsulation (Bad):
┌─────────────────────────────┐
│ BankAccount                 │
├─────────────────────────────┤
│ PUBLIC:                     │
│ - balance: double           │ ← Anyone can access directly
│ - accountNumber: String     │ ← Anyone can modify
│ - overdraftLimit: double    │ ← No validation
└─────────────────────────────┘

Code outside class:
  account.balance = -100000  // Valid? Who checks?
  account.balance += 1000000 // No audit trail
  account.accountNumber = "HACKED"


With Encapsulation (Good):
┌──────────────────────────────────────┐
│ BankAccount                          │
├──────────────────────────────────────┤
│ PRIVATE:                             │
│ - balance: double                    │
│ - accountNumber: String              │
│ - overdraftLimit: double             │
│ - transactionHistory: List           │
│                                      │
│ PUBLIC:                              │
│ - withdraw(amount): void             │
│ - deposit(amount): void              │
│ - getBalance(): double               │
│ - getAccountNumber(): String         │
└──────────────────────────────────────┘

Access Control Levels:
┌─────────────────┬──────────┬──────────┬──────────┬──────────┐
│ Modifier        │ Class    │ Package  │ Subclass │ World    │
├─────────────────┼──────────┼──────────┼──────────┼──────────┤
│ public          │    ✓     │    ✓     │    ✓     │    ✓     │
│ protected       │    ✓     │    ✓     │    ✓     │    ✗     │
│ package (none)  │    ✓     │    ✓     │    ✗     │    ✗     │
│ private         │    ✓     │    ✗     │    ✗     │    ✗     │
└─────────────────┴──────────┴──────────┴──────────┴──────────┘
```

### Benefits of Encapsulation

```
1. Data Integrity:
   ├─ Validation on setter
   ├─ Prevent invalid state
   └─ Example: balance can't be negative

2. Flexibility:
   ├─ Change internal implementation
   ├─ Public interface remains same
   └─ Clients don't break

3. Controlled Access:
   ├─ Logging/auditing
   ├─ Permission checking
   └─ Lazy initialization

4. Reduced Coupling:
   ├─ Clients depend on interface, not implementation
   ├─ Easy to refactor internal code
   └─ Better maintainability
```

### Pattern: Getter/Setter with Validation

```
BAD: Direct field exposure
public class Account {
    public double balance; // Dangerous!
}

GOOD: Encapsulated with validation
public class Account {
    private double balance;
    private double overdraftLimit;
    
    public void setBalance(double amount) {
        if (amount < -overdraftLimit) {
            throw new IllegalArgumentException("Overdraft exceeded");
        }
        if (amount == this.balance) {
            return; // No change, no audit log
        }
        
        // Audit trail
        auditLog.record("Balance changed from " + this.balance + " to " + amount);
        this.balance = amount;
    }
    
    public double getBalance() {
        return balance;
    }
}
```

### Advanced Concept: Immutability via Encapsulation

```
Immutable objects are thread-safe and can be cached:

public final class ImmutablePerson {
    private final String name;
    private final int age;
    private final List<String> hobbies;
    
    public ImmutablePerson(String name, int age, List<String> hobbies) {
        this.name = name;
        this.age = age;
        // Defensive copy to prevent external modification
        this.hobbies = new ArrayList<>(hobbies);
    }
    
    public String getName() { return name; }
    public int getAge() { return age; }
    public List<String> getHobbies() {
        // Return unmodifiable copy
        return Collections.unmodifiableList(hobbies);
    }
    
    // No setters!
    // If you need modified object, create new instance
}

Usage:
  List<String> myHobbies = Arrays.asList("reading", "coding");
  ImmutablePerson person = new ImmutablePerson("John", 30, myHobbies);
  
  myHobbies.add("gaming"); // Doesn't affect person's hobbies!
  
  person.getHobbies().add("sleeping"); // Throws UnsupportedOperationException
```

### Advanced Questions

**Q1: Why is `final` class important for encapsulation?**
A: Without `final`, subclass can override methods and bypass encapsulation logic:
```
public class BankAccount {
    private double balance;
    public void withdraw(double amount) {
        if (amount > balance) throw new Exception("Insufficient");
        balance -= amount;
    }
}

public class HackedAccount extends BankAccount {
    @Override
    public void withdraw(double amount) {
        balance = balance - amount; // No validation!
        // Direct field access via reflection or compiler bypass
    }
}
```

**Q2: What's the difference between encapsulation and information hiding?**
A: Often used interchangeably, but technically:
- **Encapsulation**: Bundling data and methods together
- **Information Hiding**: Hiding implementation details from users

Encapsulation enables information hiding, but encapsulation is broader.

**Q3: Is getter/setter always good encapsulation?**
A: No! Consider:
```
// Exposure of internal state
public class Person {
    private List<String> addresses;
    
    public List<String> getAddresses() {
        return addresses; // Caller can modify!
    }
    
    public void setAddresses(List<String> addresses) {
        this.addresses = addresses; // Caller could pass null
    }
}

// Better:
public List<String> getAddresses() {
    return Collections.unmodifiableList(addresses);
}

public void setAddresses(List<String> addresses) {
    if (addresses == null) throw new NullPointerException();
    this.addresses = new ArrayList<>(addresses);
}
```

---

## Inheritance

### Definition

Mechanism by which one class (subclass/child) inherits attributes and methods from another class (superclass/parent).

### Internal Mechanism - Method Resolution Order (MRO)

```
Class Hierarchy:
          Object
            ↑
            │
          Animal
          /    \
         /      \
      Dog      Cat
       ↑
       │
   GoldenRetriever


Method Resolution (Left-to-Right, Depth-First):
When you call: goldenRetriever.getName()

1. Look in GoldenRetriever class
2. Not found? Look in Dog (parent)
3. Not found? Look in Animal (parent)
4. Not found? Look in Object (root)
5. Not found? Compile error

Memory Layout:
┌─────────────────────────────────────────────────────┐
│ GoldenRetriever Object Instance (Heap)             │
├─────────────────────────────────────────────────────┤
│ Object fields (if any)                             │
│ ├─ hashCode (from Object)                          │
│ └─ getClass() method reference                     │
│                                                     │
│ Animal fields:                                      │
│ ├─ name: String (inherited)                        │
│ ├─ age: int (inherited)                            │
│ └─ animalType: String (inherited)                  │
│                                                     │
│ Dog fields:                                         │
│ ├─ breed: String (inherited)                       │
│ ├─ trainedCommands: List (inherited)               │
│ └─ dogSpecificBehavior() [method reference]        │
│                                                     │
│ GoldenRetriever fields:                            │
│ ├─ coatColor: String (own)                         │
│ ├─ swimmingAbility: int (own)                      │
│ └─ retrieveAbility() [method reference]            │
└─────────────────────────────────────────────────────┘
```

### Constructor Chaining (super())

```
When you create: new GoldenRetriever("Buddy", 5, "Golden", "excellent")

Call Stack:
1. GoldenRetriever constructor called
   ├─ super() called implicitly (if not explicit)
   
2. Dog constructor called
   ├─ super() called (if not explicit)
   
3. Animal constructor called
   ├─ super() called (if not explicit)
   
4. Object constructor called
   ├─ Initializes Object-level state
   
5. Returns to Animal constructor
   ├─ Initialize Animal fields
   
6. Returns to Dog constructor
   ├─ Initialize Dog fields
   
7. Returns to GoldenRetriever constructor
   ├─ Initialize GoldenRetriever fields

Why: Instance needs complete initialization from root to leaf
```

### Types of Inheritance

```
1. Single Inheritance (Linear):
   ┌────────┐
   │ Animal │
   └────┬───┘
        │
   ┌────▼───┐
   │  Dog   │
   └────────┘

2. Multi-level Inheritance:
   ┌────────┐
   │ Animal │
   └────┬───┘
        │
   ┌────▼───┐
   │  Dog   │
   └────┬───┘
        │
   ┌────▼─────────────────┐
   │ GoldenRetriever      │
   └──────────────────────┘

3. Hierarchical Inheritance:
      ┌────────┐
      │ Animal │
      └───┬──┬─┘
          │  │
    ┌─────▼┐ ┌─▼────┐
    │ Dog  │ │ Cat  │
    └──────┘ └──────┘

4. Multiple Inheritance (Java): via Interfaces
   ┌───────────┐     ┌────────────┐
   │ Swimmable │     │ Flyable    │
   └─────┬─────┘     └───┬────────┘
         │               │
         └───────┬───────┘
                 │
            ┌────▼─────────┐
            │ Duck         │
            │ (implements  │
            │  both)       │
            └──────────────┘
```

### Method Overriding vs Method Shadowing

```
Method Overriding (Polymorphic):
┌──────────────┐
│ Animal       │
├──────────────┤
│ public void  │
│ makeSound()  │
│ { print(...) │
│ }            │
└──────┬───────┘
       │ (override)
       │
┌──────▼───────┐
│ Dog          │
├──────────────┤
│ @Override    │
│ public void  │
│ makeSound()  │
│ { print(...) │
│ }            │
└──────────────┘

Binding: Dynamic (Runtime)
  Animal animal = new Dog();
  animal.makeSound(); // Calls Dog's makeSound()


Field Shadowing (NOT polymorphic):
┌──────────────┐
│ Animal       │
├──────────────┤
│ public String│
│ name;        │
└──────┬───────┘
       │ (shadow/hide)
       │
┌──────▼───────┐
│ Dog          │
├──────────────┤
│ public String│
│ name; // New │
│          │   │
└──────────────┘

Binding: Static (Compile-time)
  Animal animal = new Dog();
  animal.name; // Uses Animal's name (compile-time decision)
  
  Dog dog = new Dog();
  dog.name; // Uses Dog's name

This is BAD practice! Don't shadow fields.
```

### Advanced Questions

**Q1: Why doesn't Java support multiple inheritance?**
A: Diamond Problem:
```
Interface A {
    void method();
}

Interface B extends A {
    void method(); // Same signature
}

Interface C extends A {
    void method(); // Same signature
}

Class D implements B, C {
    // Which method() to implement? From B or C?
    // Ambiguous!
}

Solution: Java allows multiple interface implementation
(interfaces have default methods to handle this)
```

**Q2: What's the difference between `is-a` and `has-a` relationships?**
A:
- **is-a (Inheritance)**: Dog IS-A Animal (subclass-superclass)
- **has-a (Composition)**: Dog HAS-A Collar (aggregation)

**Q3: Can you inherit a method without inheriting the class?**
A: No direct way in Java. But you can:
- Use composition + delegation
- Use interface + implementation
- Use abstract class

---

## Polymorphism

### Definition

Ability of objects to take multiple forms. In runtime, the actual object type determines which method is called, not the reference type.

### Types of Polymorphism

#### 1. Compile-Time Polymorphism (Method Overloading)
```
Resolved at compile-time by method signature

public class Calculator {
    public int add(int a, int b) { return a + b; }
    public double add(double a, double b) { return a + b; }
    public String add(String a, String b) { return a + b; }
    public int add(int a, int b, int c) { return a + b + c; }
}

Calling:
  calculator.add(5, 10);           // Calls int version
  calculator.add(5.5, 10.5);       // Calls double version
  calculator.add("Hello", "World"); // Calls String version
  calculator.add(1, 2, 3);         // Calls 3-parameter version

Resolution: Determined by argument types and count at COMPILE-TIME
```

#### 2. Runtime Polymorphism (Method Overriding)
```
Resolved at runtime by actual object type

┌──────────────┐
│ Shape        │
├──────────────┤
│ draw()       │
└──────┬───────┘
       │
    ┌──┴──┬──────┐
    │     │      │
┌───▼──┐ ┌▼───┐ ┌▼─────┐
│Circle│ │Rect│ │Triangle│
├──────┤ ├────┤ ├────────┤
│draw()│ │draw()│ │draw()  │
└──────┘ └────┘ └────────┘

Shape shape;  // Reference can hold any Shape subtype

shape = new Circle();
shape.draw(); // Calls Circle.draw() at RUNTIME

shape = new Rectangle();
shape.draw(); // Calls Rectangle.draw() at RUNTIME

shape = new Triangle();
shape.draw(); // Calls Triangle.draw() at RUNTIME

Resolution: Determined by actual object type at RUNTIME
```

### Virtual Method Table (VMT) - Internal Mechanism

```
When JVM loads a class, it creates a Virtual Method Table:

Shape class VMT:
┌──────────────────────────┐
│ Shape Virtual Table      │
├──────────────────────────┤
│ [0] equals() → Object    │
│ [1] hashCode() → Object  │
│ [2] draw() → Shape       │
│ [3] getArea() → Shape    │
└──────────────────────────┘

Circle class VMT (overrides draw()):
┌──────────────────────────┐
│ Circle Virtual Table     │
├──────────────────────────┤
│ [0] equals() → Object    │
│ [1] hashCode() → Object  │
│ [2] draw() → Circle ◄    │ (Overridden)
│ [3] getArea() → Circle ◄ │ (Overridden)
└──────────────────────────┘

At Runtime:
  Shape shape = new Circle();
  shape.draw();
  
  1. Look at shape's actual type: Circle
  2. Find Circle's VMT
  3. Look up "draw" method in VMT
  4. Found: Circle.draw() at index [2]
  5. Call Circle.draw()

This lookup is FAST (just array indexing), not reflection
```

### Dynamic Dispatch Example

```
List<Shape> shapes = new ArrayList<>();
shapes.add(new Circle());
shapes.add(new Rectangle());
shapes.add(new Triangle());

for (Shape shape : shapes) {
    shape.draw(); // Different method called each iteration!
}

Runtime Execution:
Iteration 1:
  ├─ shape reference type: Shape
  ├─ actual object type: Circle
  ├─ VMT lookup: Circle.draw()
  └─ Output: "Drawing circle"

Iteration 2:
  ├─ shape reference type: Shape
  ├─ actual object type: Rectangle
  ├─ VMT lookup: Rectangle.draw()
  └─ Output: "Drawing rectangle"

Iteration 3:
  ├─ shape reference type: Shape
  ├─ actual object type: Triangle
  ├─ VMT lookup: Triangle.draw()
  └─ Output: "Drawing triangle"
```

### Advanced Questions

**Q1: What's the difference between static and dynamic polymorphism?**
A:
- **Static (Compile-time)**: Method overloading. Compiler decides which method to call based on argument types.
- **Dynamic (Runtime)**: Method overriding. JVM decides which method to call based on actual object type.

**Q2: Can you have polymorphism without inheritance?**
A: Not truly. But you can simulate it with interfaces (Java 8+):
```
Interface is a contract. Multiple classes implementing same interface can be polymorphic.

List<Animal> animals = new ArrayList<>();
animals.add(new Dog());
animals.add(new Cat());

for (Animal animal : animals) {
    animal.makeSound(); // Polymorphic call
}
```

**Q3: What happens if you override a private method?**
A: It's NOT truly overriding. It's method hiding (shadowing). Private methods are not part of the interface:
```
class Parent {
    private void secret() { print("Parent's secret"); }
}

class Child extends Parent {
    private void secret() { print("Child's secret"); } // Not override!
}

Usage:
  Parent p = new Child();
  p.secret(); // Compile error: secret() is private
  
  Child c = new Child();
  c.secret(); // Calls Child's secret()
```

---

## Abstraction

### Definition

Process of hiding complex implementation details and showing only necessary features of an object. It's about creating a simplified model of reality.

### Abstract vs Concrete Classes

```
Abstract Class (Cannot instantiate):
┌─────────────────────────────────────┐
│ abstract class Animal               │
├─────────────────────────────────────┤
│ ABSTRACT METHODS (no implementation)│
│ ├─ abstract void makeSound();       │
│ ├─ abstract void move();            │
│                                     │
│ CONCRETE METHODS (with impl)        │
│ ├─ void sleep() { ... }            │
│ ├─ final void breathe() { ... }    │
│                                     │
│ FIELDS (abstract, concrete, final)  │
│ ├─ protected String name;           │
│ ├─ private int age;                │
│ ├─ public static final int LEGS=4;│
└─────────────────────────────────────┘

Instantiation:
  new Animal(); // ❌ COMPILE ERROR: Can't instantiate abstract class

Usage:
  Animal animal = new Dog(); // ✓ OK: Reference can hold subclass
  
  Dog dog = new Dog(); // ✓ OK: Concrete subclass


Concrete Class (Can instantiate):
┌─────────────────────────────────────┐
│ class Dog extends Animal            │
├─────────────────────────────────────┤
│ MUST implement all abstract methods │
│ ├─ @Override                        │
│ ├─ void makeSound() { ... }        │
│ ├─ @Override                        │
│ ├─ void move() { ... }             │
│                                     │
│ INHERITS concrete methods           │
│ ├─ sleep() [from Animal]           │
│ ├─ breathe() [from Animal]         │
│                                     │
│ CAN ADD new methods                 │
│ ├─ void fetch() { ... }            │
└─────────────────────────────────────┘

Instantiation:
  Animal animal = new Dog(); // ✓ OK
  Dog dog = new Dog(); // ✓ OK
```

### Levels of Abstraction

```
Level 1: Most Abstract (Least implementation)
┌─────────────────────────────────────┐
│ abstract class LivingThing          │
├─────────────────────────────────────┤
│ abstract void grow();               │
│ abstract void reproduce();          │
│ abstract void die();                │
└──────────────┬──────────────────────┘
               │
Level 2: More Concrete
┌──────────────▼──────────────────────┐
│ abstract class Animal               │
│ extends LivingThing                 │
├─────────────────────────────────────┤
│ abstract void makeSound();          │
│ abstract void move();               │
│                                     │
│ @Override                           │
│ void grow() { age++; }             │
└──────────────┬──────────────────────┘
               │
Level 3: Concrete
┌──────────────▼──────────────────────┐
│ class Dog extends Animal            │
├─────────────────────────────────────┤
│ @Override                           │
│ void makeSound() { bark(); }       │
│ @Override                           │
│ void move() { run(); }             │
│ @Override                          │
│ void reproduce() { ... }           │
└─────────────────────────────────────┘
```

### When to Use Abstract Classes

```
Use Abstract Class when:
  ✓ You need to define common behavior
  ✓ You want non-public members (protected, private)
  ✓ You want to define instance fields
  ✓ Need constructor logic
  ✓ You have strong IS-A relationship
  
Example:
  abstract class Animal { }
  class Dog extends Animal { } // Strong IS-A

Use Interface when:
  ✓ You want a contract/capability
  ✓ Multiple unrelated classes share behavior
  ✓ You want pure abstraction
  ✓ You have weak/capability relationship
  
Example:
  interface Swimmable { }
  class Dog implements Swimmable { }
  class Duck implements Swimmable { } // Both can swim, not related
```

### Advanced Questions

**Q1: Can abstract class have a main() method?**
A: Yes! You can call it directly via runtime parameter:
```
abstract class Test {
    public static void main(String[] args) {
        System.out.println("Running from abstract class");
    }
}

// Command line: java Test
// Output: Running from abstract class
```

**Q2: Can abstract method have a body?**
A: In Java 8+, NO. But in Java 9+, you can provide default implementation:
```
// Java 8 - Cannot have body
abstract class Animal {
    abstract void makeSound(); // Must be abstract, no body
}

// Java 9+ - Can have default
interface Animal {
    default void sleep() {
        System.out.println("Zzz");
    }
}
```

**Q3: What's the purpose of abstract class if it can't be instantiated?**
A: It's a template for subclasses:
- Define common structure
- Force subclasses to implement certain methods
- Provide shared implementation
- Act as a contract

---

## Method Overloading

### Definition

Creating multiple methods with the SAME NAME but DIFFERENT SIGNATURES in the SAME CLASS.

### How Overloading Works

```
Method Signature = Method Name + Parameter Types (order matters) + Parameter Count

public class Calculator {
    // Signature: add(int, int)
    public int add(int a, int b) {
        return a + b;
    }
    
    // Signature: add(double, double) - Different from above
    public double add(double a, double b) {
        return a + b;
    }
    
    // Signature: add(String, String) - Different
    public String add(String a, String b) {
        return a + " " + b;
    }
    
    // Signature: add(int, int, int) - Different (3 params vs 2)
    public int add(int a, int b, int c) {
        return a + b + c;
    }
    
    // ❌ NOT valid: return type alone doesn't matter
    // public double add(int a, int b) { return a + b; } // COMPILE ERROR
}
```

### Overloading Resolution (Compile-time)

```
When compiler sees: calculator.add(5, 10)

Step 1: List all methods named "add"
  ├─ add(int, int) ← MATCH!
  ├─ add(double, double) ← Could match (int can promote to double)
  ├─ add(String, String) ← No match
  └─ add(int, int, int) ← Wrong param count

Step 2: Find MOST SPECIFIC match
  ├─ add(int, int) ← Most specific (exact match)
  ├─ add(double, double) ← Less specific (requires promotion)
  
Step 3: Use add(int, int)

Type Promotion Order (if no exact match):
  byte → short → int → long → float → double
  char → int → long → float → double
  
Example:
  calculator.add(5.5f, 10.5f); // float
  
  Matches:
    ├─ add(double, double) ← float promotes to double
    └─ No other match
  
  Calls: add(double, double)
```

### Rules for Method Overloading

| Rule | Valid? | Example |
|------|--------|---------|
| Same name, different param types | ✓ | `add(int)`, `add(double)` |
| Same name, different param count | ✓ | `add(int, int)`, `add(int, int, int)` |
| Same name, different param order | ✓ | `add(int, double)`, `add(double, int)` |
| Same name, different return type | ✗ | `int add()`, `double add()` |
| Overload based on var-args | ✓ | `method(int...)`, `method(int, int)` |

### Var-args Overloading Complexity

```
public class VarArgsTest {
    public void method(int... args) { print("var-args"); }
    public void method(int a, int b) { print("2 params"); }
    public void method(int a) { print("1 param"); }
}

Calls:
  method(1); // Calls method(int a) ← MOST SPECIFIC
  method(1, 2); // Calls method(int a, int b) ← MOST SPECIFIC
  method(1, 2, 3); // Calls method(int... args) ← only match
  method(); // Compile error: No matching method
  
WHY: Compiler prefers non-var-args over var-args if match exists
```

### Advanced Questions

**Q1: Can you overload based on parameter order?**
A: Yes, and it's intentional:
```
public class Pair {
    public void setPair(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public void setPair(int age, String name) {
        // Different parameter order = different signature
        // Can distinguish between: setPair("John", 30) vs setPair(30, "John")
        this.name = name;
        this.age = age;
    }
}
```

**Q2: What's the compile-time cost of overloading?**
A: Minimal. Compiler just does name + signature matching. No runtime overhead.

**Q3: Can constructor be overloaded?**
A: Yes! Constructor overloading is common:
```
public class Person {
    private String name;
    private int age;
    
    public Person() { } // No-arg constructor
    public Person(String name) { this.name = name; }
    public Person(String name, int age) { this.name = name; this.age = age; }
}

// Usage:
new Person();
new Person("John");
new Person("John", 30);
```

---

## Method Overriding

### Definition

Providing a new implementation of a method in a SUBCLASS that already exists in the SUPERCLASS.

### Method Overriding Rules

```
┌─────────────────────────────────────────────────────┐
│ Rules for Valid Method Override                    │
├─────────────────────────────────────────────────────┤
│ 1. Method name must be SAME                        │
│ 2. Parameter types & count must be SAME            │
│ 3. Return type must be same OR COVARIANT          │
│ 4. Access modifier must be same or WIDER          │
│ 5. Cannot throw CHECKED exceptions (only unchecked)│
│ 6. Cannot override final/private/static methods   │
│ 7. @Override annotation is recommended            │
└─────────────────────────────────────────────────────┘

Parent class:
public class Animal {
    public void makeSound() {
        System.out.println("Generic animal sound");
    }
}

Child class (Valid Override):
public class Dog extends Animal {
    @Override
    public void makeSound() {
        System.out.println("Woof!");
    }
}

Invalid Overrides:
public class Cat extends Animal {
    // ❌ INVALID: Different return type (not covariant)
    private void makeSound() { } // ❌ INVALID: Narrower access
    
    public String makeSound() { } // ❌ INVALID: String not covariant to void
    
    public void makeSoundThrows() throws IOException { } // ❌ INVALID: Different method name
}
```

### Covariant Return Type

```
Parent class:
public class Animal {
    public Animal reproduce() {
        return new Animal();
    }
}

Child class - Covariant return type allowed:
public class Dog extends Animal {
    @Override
    public Dog reproduce() { // Dog IS-A Animal, so covariant
        return new Dog();
    }
}

Why allowed:
  Animal animal = new Dog();
  Animal offspring = animal.reproduce(); // Safe: Dog is-a Animal
  
  Dog dog = new Dog();
  Dog dogOffspring = dog.reproduce(); // Safe: More specific type


NOT Covariant (Invalid):
public class Cat extends Animal {
    @Override
    public String reproduce() { } // ❌ String is NOT a subtype of Animal
}
```

### Access Modifier Covariance

```
Allowed: Widen access modifier
  Parent: protected void method()
  Child:  public void method() ✓ Wider access
  
  Parent: package void method()
  Child:  protected void method() ✓ Wider access
  
  Parent: public void method()
  Child:  public void method() ✓ Same access (only option)

NOT Allowed: Narrow access modifier
  Parent: public void method()
  Child:  protected void method() ❌ Narrower access (COMPILE ERROR)
  
  Parent: protected void method()
  Child:  private void method() ❌ Narrower access (COMPILE ERROR)
```

### Checked vs Unchecked Exception in Overriding

```
Parent class:
public class Parent {
    public void method() throws IOException {
        // Throws checked exception
    }
}

Child class - Valid Overrides:
public class Child extends Parent {
    @Override
    public void method() throws IOException { } // ✓ Same exception
    
    @Override
    public void method() { } // ✓ No exception (removes it)
    
    @Override
    public void method() throws FileNotFoundException { } // ✓ Sub-exception
    
    @Override
    public void method() throws UncheckedIOException { } // ✓ Unchecked exception
}

Child class - Invalid Overrides:
public class Child extends Parent {
    @Override
    public void method() throws Exception { } // ❌ Super-exception (compile error)
    
    @Override
    public void method() throws SQLException { } // ❌ Unrelated exception (compile error)
}

Why: Polymorphism contract - caller expects to catch IOException, not others
```

### Runtime Binding (Dynamic Dispatch)

```
Compile-time vs Runtime:

Compile-time:
  Animal animal = new Dog();
  animal.makeSound(); // Compiler sees: Animal type, calls Animal.makeSound()

Runtime:
  Animal animal = new Dog();
  animal.makeSound(); // JVM sees: Actual type Dog, calls Dog.makeSound()

This is why it's polymorphic!

Code:
  class Animal {
      public void makeSound() { print("animal sound"); }
  }
  
  class Dog extends Animal {
      @Override
      public void makeSound() { print("woof"); }
  }
  
  Animal animal = new Dog();
  animal.makeSound(); // Output: "woof" (not "animal sound")
```

### Advanced Questions

**Q1: What's the difference between overloading and overriding?**
A:
- **Overloading**: Same method name, different parameters, SAME class, COMPILE-TIME resolution
- **Overriding**: Same method name, same parameters, DIFFERENT class (parent-child), RUNTIME resolution

**Q2: Can you override a static method?**
A: No, it's method hiding:
```
class Parent {
    public static void staticMethod() { print("Parent"); }
}

class Child extends Parent {
    public static void staticMethod() { print("Child"); } // NOT override!
}

Usage:
  Parent p = new Child();
  p.staticMethod(); // Output: "Parent" (compile-time decision)
  
  Child c = new Child();
  c.staticMethod(); // Output: "Child"

Static methods are resolved at COMPILE-TIME based on reference type
```

**Q3: Can constructor be overridden?**
A: No, constructors are NOT inherited. Each class has its own constructors.

---

## Interface

### Definition

Contract that defines methods (behavior) a class MUST implement. Pure abstraction with no implementation (until Java 8).

### Interface Characteristics

```
┌──────────────────────────────────────────┐
│ Interface                                │
├──────────────────────────────────────────┤
│ BEFORE Java 8:                           │
│ ├─ Only abstract methods                │
│ ├─ No method bodies allowed             │
│ ├─ Only public/abstract access          │
│ ├─ Constants only (public static final) │
│ └─ NO state (instance variables)        │
│                                          │
│ JAVA 8+:                                │
│ ├─ default methods (with body)          │
│ ├─ static methods                       │
│ ├─ private methods (Java 9+)            │
│ └─ Still NO state                       │
└──────────────────────────────────────────┘

Syntax:
public interface Animal {
    // Abstract methods (Java 8 and earlier)
    void makeSound();
    void move();
    
    // Default method (Java 8+)
    default void sleep() {
        System.out.println("Zzz");
    }
    
    // Static method (Java 8+)
    static void describe() {
        System.out.println("Animals are living things");
    }
    
    // Constant
    public static final int LEGS = 4; // or just: int LEGS = 4;
    
    // Private method (Java 9+)
    private void log(String msg) {
        System.out.println("[LOG] " + msg);
    }
}

Implementation:
public class Dog implements Animal {
    @Override
    public void makeSound() { print("Woof"); }
    
    @Override
    public void move() { print("Run"); }
    
    // Inherits sleep() from interface, can override if needed
}
```

### Interface Contract

```
Interface is a CONTRACT (promise):
  ├─ If a class implements interface X
  ├─ Then it MUST implement all abstract methods
  └─ Or it will be abstract itself

Violation:
public class Dog implements Animal {
    public void makeSound() { print("Woof"); }
    // ❌ COMPILE ERROR: move() not implemented
    // Unless Dog is also abstract
}

Fix:
public class Dog implements Animal {
    public void makeSound() { print("Woof"); }
    public void move() { print("Run"); } // ✓ Now fulfills contract
}
```

### Multiple Interface Implementation

```
One class can implement multiple interfaces:

public interface Swimmable {
    void swim();
}

public interface Flyable {
    void fly();
}

public class Duck implements Swimmable, Flyable {
    @Override
    public void swim() { print("Swimming"); }
    
    @Override
    public void fly() { print("Flying"); }
}

Usage:
  Duck duck = new Duck();
  duck.swim(); // ✓
  duck.fly(); // ✓
  
  Swimmable s = new Duck();
  s.swim(); // ✓
  
  Flyable f = new Duck();
  f.fly(); // ✓
```

### Default Methods and Diamond Problem (Java 8)

```
Diamond Problem:
┌─────────────────┐
│ Interface A     │
│ default void m()│
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐   ┌──▼───┐
│ Intf │   │ Intf │
│ B    │   │ C    │
└───┬──┘   └──┬───┘
    │         │
    └────┬────┘
         │
    ┌────▼────┐
    │ Class D │
    └─────────┘

Problem: Which method() does D inherit? From B or C?

Solution 1: No conflict if both inherit from A
  D will inherit A's default method()
  
Solution 2: Explicit override
  public class D implements B, C {
      @Override
      public void m() { // Explicitly implement
          print("D's implementation");
      }
  }
  
Solution 3: Call specific interface method
  public class D implements B, C {
      @Override
      public void m() {
          B.super.m(); // Call B's version
          C.super.m(); // Or C's version
      }
  }
```

### Advanced Questions

**Q1: Why Java doesn't allow multiple class inheritance but allows multiple interface?**
A: 
- **Classes** have state (fields) and implementation. Multiple inheritance causes conflicts.
- **Interfaces** (pre-Java 8) were pure contracts, no state/implementation. No conflict possible.
- Java 8+ interfaces have default methods, but still managed well.

**Q2: Can interface extend another interface?**
A: Yes!
```
public interface Animal {
    void makeSound();
}

public interface Mammal extends Animal {
    void breatheAir(); // Has both methods from Animal + this
}

public class Dog implements Mammal {
    @Override
    public void makeSound() { print("Woof"); }
    
    @Override
    public void breatheAir() { print("Breathing"); }
}
```

**Q3: Is interface a type or contract?**
A: Both! It's a type that defines a contract. You can use interface as a type:
```
Animal animal = new Dog(); // Interface as type
Swimmable swimmable = new Duck(); // Interface as type

// Runtime polymorphism
```

---

## Abstract Class

(Covered in detail in Abstraction section, but let me summarize key differences)

### Abstract Class vs Interface

| Aspect | Abstract Class | Interface |
|--------|---|---|
| **State** | Can have state (fields) | No state (pre-Java 8), some default state in Java 8+ |
| **Access Modifiers** | Any (private, protected, public) | Only public |
| **Constructor** | Can have constructors | No constructors |
| **Methods** | Can be abstract or concrete | Abstract methods, default methods (Java 8+) |
| **Variables** | Instance variables allowed | Constants only (public static final) |
| **Inheritance** | Single inheritance | Multiple implementation |
| **IS-A** | Strong IS-A relationship | Weak capability relationship |
| **Use Case** | Shared code + contract | Pure contract + multiple behaviors |

---

## Interface vs Abstract Class

### Decision Tree

```
Question 1: Need to maintain state (instance variables)?
├─ YES → Use Abstract Class
│   ├─ Can have private fields
│   ├─ Can initialize values in constructor
│   └─ Subclass inherits state
│
└─ NO → Continue to Question 2

Question 2: Is it a strong IS-A relationship?
├─ YES → Use Abstract Class
│   ├─ Dog IS-A Animal (strong)
│   └─ Hierarchy makes sense
│
└─ NO → Continue to Question 3

Question 3: Need non-public members?
├─ YES → Use Abstract Class
│   ├─ Can use protected/private
│   └─ Interface only allows public
│
└─ NO → Continue to Question 4

Question 4: Multiple unrelated types sharing behavior?
├─ YES → Use Interface
│   ├─ Swimmable (Dog, Duck, Fish)
│   ├─ Flyable (Duck, Eagle, Airplane)
│   └─ Not IS-A, but capability
│
└─ NO → Default to Interface (Java 8+, flexible enough)
```

### Real-World Example

```
❌ WRONG: Everything in interface

public interface Animal {
    // No state management
    // No constructor
    default void eat() { }
    default void sleep() { }
}

✓ RIGHT: Use abstract class

public abstract class Animal {
    protected String name; // State
    protected int age;
    
    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public void eat() { print(name + " eating"); }
    public void sleep() { print(name + " sleeping"); }
    
    abstract void makeSound();
}

✓ RIGHT: Use interface for capability

public interface Swimmable {
    void swim();
}

public interface Flyable {
    void fly();
}

public class Duck extends Animal implements Swimmable, Flyable {
    public Duck(String name, int age) {
        super(name, age);
    }
    
    @Override
    void makeSound() { print("Quack"); }
    
    @Override
    public void swim() { print("Swimming"); }
    
    @Override
    public void fly() { print("Flying"); }
}
```

---

## Composition vs Inheritance

### Definitions

**Inheritance (IS-A):**
- Subclass IS-A superclass
- "Dog IS-A Animal"
- Hierarchical relationship
- Code reuse through inheritance

**Composition (HAS-A):**
- Class HAS-A component
- "Car HAS-A Engine"
- Aggregation relationship
- Code reuse through delegation

### Comparison

```
Inheritance Approach:
┌──────────────┐
│ Animal       │
├──────────────┤
│ - name       │
│ - age        │
│ + eat()      │
│ + sleep()    │
│ + move()     │
└────────┬─────┘
         │ inherits
┌────────▼─────┐
│ Dog          │
├──────────────┤
│ - breed      │
│ + bark()     │
└──────────────┘

Code:
  class Dog extends Animal {
      @Override
      public void move() {
          print("Run on four legs");
      }
  }


Composition Approach:
┌──────────────┐
│ Dog          │
├──────────────┤
│ - name       │
│ - age        │
│ - movement   │──→ ┌─────────────┐
│ - sound      │──→ │ Behavior    │
│              │    │ objects     │
└──────────────┘    └─────────────┘

Code:
  class Movement {
      public void run() { print("Run"); }
  }
  
  class Dog {
      private Movement movement;
      
      public Dog() {
          this.movement = new Movement();
      }
      
      public void move() {
          movement.run();
      }
  }
```

### When to Use Each

```
Use Inheritance when:
  ✓ IS-A relationship is clear and strong
  ✓ Dog IS-A Animal (biologically true)
  ✓ Circle IS-A Shape (geometrically true)
  ✓ Subclass is a specialized version of superclass
  ✓ Methods in superclass apply to all subclasses

Use Composition when:
  ✓ HAS-A relationship
  ✓ Car HAS-A Engine (engine can be replaced)
  ✓ Person HAS-A Address (can change address)
  ✓ Behavior might change at runtime
  ✓ Need more flexibility
  ✓ Multiple unrelated behaviors
  
Composition Benefits:
  ├─ More flexible (can change at runtime)
  ├─ Better encapsulation
  ├─ Easier to test (mock dependencies)
  ├─ Avoid fragile base class problem
  └─ Composition over inheritance principle
```

### Fragile Base Class Problem

```
Problem with Inheritance:

Base Class:
┌──────────────────────────────────────┐
│ class Stack<E> {                     │
│   List<E> list = new ArrayList<>();  │
│   public void push(E e) {            │
│       list.add(e);                   │
│   }                                  │
│   public E pop() {                   │
│       return list.remove(0);         │
│   }                                  │
└──────────────────────────────────────┘

Subclass:
┌──────────────────────────────────────┐
│ class CountingStack extends Stack {  │
│   int pushCount = 0;                 │
│   @Override                          │
│   public void push(E e) {            │
│       pushCount++;                   │
│       super.push(e);                 │
│   }                                  │
│   int getPushCount() {               │
│       return pushCount;              │
│   }                                  │
└──────────────────────────────────────┘

Problem: If base class implementation changes:
  Base class adds new method:
    void pushAll(Collection<E> c) {
        for (E e : c) push(e); // Calls push!
    }
  
  CountingStack will break:
    cs.pushAll(Arrays.asList(1,2,3));
    // pushCount is now 3 (correct by coincidence)
    
  But if base class author refactors:
    void pushAll(Collection<E> c) {
        for (E e : c) list.add(e); // Directly adds!
    }
    
    cs.pushAll(Arrays.asList(1,2,3));
    // pushCount is still 0! (Bug!)

Solution: Use Composition
public class CountingStack<E> {
    private Stack<E> stack = new Stack<>();
    int pushCount = 0;
    
    public void push(E e) {
        pushCount++;
        stack.push(e);
    }
}

// Now changes in Stack don't affect CountingStack
```

### Composition vs Inheritance: Code Reuse

```
With Inheritance:
public class Dog extends Animal {
    // Automatically get all Animal methods
    // eat(), sleep(), move() inherited
    
    @Override
    public void move() {
        // Override if needed
    }
}

With Composition (Delegation):
public class Dog {
    private Animal animal; // Composition
    
    public Dog() {
        this.animal = new Animal();
    }
    
    public void eat() {
        animal.eat(); // Delegate
    }
    
    public void sleep() {
        animal.sleep(); // Delegate
    }
    
    public void move() {
        // Custom implementation
    }
}

Composition is more verbose but more flexible
```

### Advanced Questions

**Q1: Why is "Composition over Inheritance" recommended?**
A: Multiple reasons:
1. Inheritance creates tight coupling
2. Composition allows changing behavior at runtime
3. Composition is more testable (mock dependencies)
4. Composition avoids fragile base class problem
5. Composition is clearer (explicit delegation)

**Q2: Can you mix inheritance and composition?**
A: Yes, and it's common!
```
public class Vehicle {
    // Base functionality
}

public class Car extends Vehicle { // Inheritance
    private Engine engine; // Composition
    private Transmission transmission; // Composition
    
    public void start() {
        engine.start();
        transmission.engage();
    }
}
```

**Q3: Is inheritance bad?**
A: Not always, but should be used sparingly:
- Good for IS-A relationships
- Bad for code reuse (use composition instead)
- Good for polymorphism (interface contracts)

---

## This vs Instance

### Definitions

**this:**
- Reference to current object (calling object)
- Keyword in Java
- Refers to object on which method was called
- Available only in instance methods, not static

**Instance:**
- Object that is an instance of a class
- "Person p = new Person();" → p is an instance
- Every object is an instance of its class

### This Reference

```
public class Person {
    private String name;
    private int age;
    
    public Person(String name, int age) {
        this.name = name; // this.name refers to instance variable
        this.age = age;   // this.age refers to instance variable
    }
    
    public void setName(String name) {
        this.name = name; // Distinguish parameter 'name' from field 'name'
    }
    
    public void printDetails() {
        System.out.println(this.name + " is " + this.age);
        System.out.println("Object: " + this); // Prints this object
    }
    
    public Person getClone() {
        return this; // Return reference to this object
    }
    
    public boolean compare(Person other) {
        return this.age == other.age; // Compare this with another
    }
}

Memory:
┌─────────────────────────────────────┐
│ Stack                               │
├─────────────────────────────────────┤
│ p1 = 0x1000 ───┐                   │
│ p2 = 0x2000 ───┼─┐                 │
│                │ │                 │
│ Heap:         │ │                 │
│               │ │                 │
│    0x1000 ────→ ┌─────────────────┐│
│               │ │ Person Object 1 ││
│               │ │ name = "John"   ││
│               │ │ age = 30        ││
│               │ │ this = 0x1000   ││ ← When you call p1.method(), 'this' = 0x1000
│               │ └─────────────────┘│
│               │                     │
│    0x2000 ────→ ┌─────────────────┐│
│               │ │ Person Object 2 ││
│               │ │ name = "Jane"   ││
│               │ │ age = 28        ││
│               │ │ this = 0x2000   ││ ← When you call p2.method(), 'this' = 0x2000
│               │ └─────────────────┘│
└───────────────┴─────────────────────┘

Usage:
  p1.setName("Johnny"); // Inside setName, 'this' = p1 (0x1000)
  p2.setName("Janet");  // Inside setName, 'this' = p2 (0x2000)
```

### Uses of This

```
1. Distinguish instance variables from parameters
   public Person(String name) {
       this.name = name; // this.name is field, name is parameter
   }

2. Pass current object as argument
   public void register(Registry registry) {
       registry.add(this); // Pass this object to registry
   }

3. Call another constructor (Constructor chaining)
   public Person(String name) {
       this(name, 0); // Call Person(String, int) constructor
   }
   
   public Person(String name, int age) {
       this.name = name;
       this.age = age;
   }

4. Return current object for method chaining
   public Person setName(String name) {
       this.name = name;
       return this; // Return this object
   }
   
   public Person setAge(int age) {
       this.age = age;
       return this;
   }
   
   // Usage:
   Person p = new Person().setName("John").setAge(30);

5. Explicitly refer to fields/methods in current object
   this.methodName(); // Call method in current class
   this.fieldName;    // Access field in current class
```

### This vs Super

```
┌────────────────────────────┐
│ Parent Class               │
├────────────────────────────┤
│ name = "Parent"            │
│ public void method() { }   │
└────────────────┬───────────┘
                 │
┌────────────────▼───────────┐
│ Child Class                │
├────────────────────────────┤
│ name = "Child" (overrides) │
│ @Override                  │
│ public void method() { }   │
│                            │
│ void test() {              │
│   this.name        // "Child" (current object)
│   super.name       // "Parent" (parent class member)
│   this.method()    // Child's method
│   super.method()   // Parent's method
│ }                          │
└────────────────────────────┘
```

### Advanced Questions

**Q1: Can 'this' be used in static context?**
A: NO! Static methods don't have 'this' because they don't belong to any instance:
```
class Test {
    public static void staticMethod() {
        System.out.println(this); // ❌ COMPILE ERROR
        // 'this' is not available in static context
    }
}
```

**Q2: What does 'System.out.println(this)' print?**
A: It prints the object's string representation:
```
public class Person {
    private String name;
    
    public Person(String name) {
        this.name = name;
    }
    
    // Without overriding toString()
    public static void main(String[] args) {
        Person p = new Person("John");
        System.out.println(p); // Output: Person@7ef20235
        // Format: ClassName@HashCode (hex)
    }
    
    // With overriding toString()
    @Override
    public String toString() {
        return "Person{" + "name='" + name + '}';
    }
    // Output: Person{name='John'}
}
```

**Q3: Is 'this' necessary?**
A: Not always. Only when there's ambiguity:
```
public class Person {
    private String name;
    
    // 'this' is optional here (no ambiguity)
    public void test() {
        System.out.println(name);   // Works
        System.out.println(this.name); // Also works
    }
    
    // 'this' is necessary here (ambiguity)
    public Person(String name) {
        this.name = name; // Must use 'this' to distinguish
    }
}
```

---

## Static vs Instance

### Definitions

**Static Members:**
- Belong to class, not objects
- Shared among all instances
- Exist in memory once (per class)
- Accessed via ClassName.member

**Instance Members:**
- Belong to objects
- Each object has its own copy
- Created when object is instantiated
- Accessed via objectReference.member

### Memory Layout

```
Class Loading (Static):
┌─────────────────────────────────────┐
│ Method Area / Class Area            │
├─────────────────────────────────────┤
│ Class: Person                       │
│ ├─ Static variables:                │
│ │  ├─ nextId = 1 (one copy)        │
│ │  └─ DEFAULT_AGE = 18 (one copy)  │
│ │                                   │
│ │ Static methods: (one copy each)   │
│ │  ├─ getNextId()                  │
│ │  ├─ main()                       │
│ │                                   │
│ │ Instance methods: (one copy, can be called on multiple objects)
│ │  ├─ getName()                    │
│ │  ├─ setName()                    │
│ │  └─ toString()                   │
└─────────────────────────────────────┘

Object Instantiation (Instance):
┌──────────────────────────┐ ┌──────────────────────────┐
│ Object 1 (Heap)          │ │ Object 2 (Heap)          │
├──────────────────────────┤ ├──────────────────────────┤
│ Instance variables:      │ │ Instance variables:      │
│ ├─ id = 1                │ │ ├─ id = 2                │
│ ├─ name = "John"         │ │ ├─ name = "Jane"         │
│ ├─ age = 30              │ │ ├─ age = 25              │
│ └─ (Methods point to     │ │ └─ (Methods point to     │
│    shared code in class) │ │    shared code in class) │
└──────────────────────────┘ └──────────────────────────┘

Static variable (Class memory):
nextId = 2 (shared by both objects)
```

### Static Variables (Class Variables)

```
public class Counter {
    public static int count = 0; // Shared by all instances
    private int id;
    
    public Counter() {
        id = ++count; // Increment shared static variable
    }
}

Usage:
  Counter c1 = new Counter(); // c1.id = 1, Counter.count = 1
  Counter c2 = new Counter(); // c2.id = 2, Counter.count = 2
  Counter c3 = new Counter(); // c3.id = 3, Counter.count = 3
  
  System.out.println(c1.id);     // 1
  System.out.println(c2.id);     // 2
  System.out.println(c3.id);     // 3
  System.out.println(Counter.count); // 3 (same across all)

Memory:
  Static: Counter.count = 3 (one location, shared)
  Instance: c1.id = 1, c2.id = 2, c3.id = 3 (separate locations)
```

### Static Methods

```
public class MathUtils {
    public static int add(int a, int b) {
        return a + b;
    }
    
    public static final PI = 3.14159;
    
    // ❌ CANNOT access instance variables/methods
    // public int instanceVar;
    // public static int compute() {
    //     return this.instanceVar; // COMPILE ERROR: No 'this' in static
    // }
}

Usage:
  int result = MathUtils.add(5, 10); // Call static method via class
  
  MathUtils utils = new MathUtils();
  int result = utils.add(5, 10); // Also works but not recommended
  
  // Direct access to static variable
  System.out.println(MathUtils.PI); // 3.14159
```

### Static Blocks (Initialization)

```
public class Database {
    private static Connection connection;
    
    static { // Static initialization block
        try {
            connection = DriverManager.getConnection("jdbc:...");
            System.out.println("Database initialized");
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
    
    public static Connection getConnection() {
        return connection;
    }
}

Execution:
  ├─ When Database class is loaded
  ├─ Static block executes (once)
  ├─ Connection initialized
  └─ Ready for use

Usage:
  Connection conn = Database.getConnection();
```

### Instance Initialization Block

```
public class Person {
    private String name;
    private List<String> hobbies;
    
    { // Instance initialization block (NOT static)
        // Runs before constructor, for every object
        hobbies = new ArrayList<>();
        System.out.println("Person object being created");
    }
    
    public Person(String name) {
        this.name = name;
    }
}

Execution:
  Person p1 = new Person("John");
  // Output: "Person object being created"
  // Then: Constructor runs
  
  Person p2 = new Person("Jane");
  // Output: "Person object being created"
  // Then: Constructor runs

Execution order:
  1. Instance initialization block { }
  2. Constructor
```

### Comparison Table

| Aspect | Static | Instance |
|--------|--------|----------|
| **Scope** | Class | Object |
| **Memory** | One copy (class memory) | Multiple copies (heap) |
| **Initialization** | When class loaded | When object created |
| **Access** | Via class name | Via object reference |
| **'this'** | Not available | Available |
| **'super'** | Not available | Available |
| **Use Case** | Utilities, constants | Object state, behavior |

### Advanced Questions

**Q1: When is static variable initialized?**
A: When class is loaded (first time accessed):
```
public class Config {
    public static int MAX_USERS = 100;
    
    static {
        System.out.println("Config class loaded");
    }
}

Usage:
  System.out.println("About to access Config");
  int max = Config.MAX_USERS;
  System.out.println("Accessed MAX_USERS");

Output:
  About to access Config
  Config class loaded
  Accessed MAX_USERS
```

**Q2: Can you access instance variables in static method?**
A: NO! Static methods have no 'this':
```
public class Test {
    private int instanceVar = 10;
    
    public static void staticMethod() {
        System.out.println(instanceVar); // ❌ COMPILE ERROR
        
        // But you can access static variables
        System.out.println(staticVar); // ✓ OK
    }
}
```

**Q3: Can you override static method?**
A: NO! It's method hiding (covered earlier).

---

## Constructor

### Definition

Special method that initializes a newly created object. Called when object is instantiated with `new` keyword.

### Constructor Characteristics

```
public class Person {
    private String name;
    private int age;
    
    // Constructor (Note: NO return type, name matches class)
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
        System.out.println("Constructor called");
    }
    
    // ❌ NOT a constructor (has return type)
    public void Person(String name) {
        // This is a regular method, not a constructor
    }
}

Key Points:
  ✓ Name must match class name exactly
  ✓ No return type (not even void)
  ✓ Can have parameters
  ✓ Can be overloaded
  ✓ Can have access modifiers (public, private, protected)
  ✓ Called automatically when object created
  ✗ Cannot be inherited (subclass has different name)
  ✗ Cannot return value explicitly
```

### Constructor Execution Order

```
When you create: new Child("John", 30)

1. Memory allocated for object on heap
2. All instance variables initialized to default values
   ├─ Numeric: 0
   ├─ Boolean: false
   ├─ Object: null
3. Explicit instance initialization block { } runs (if exists)
4. Constructor body executes
   ├─ First line: super() called (implicitly if not explicit)
   ├─ Parent constructors run recursively
   ├─ Back to child constructor
   ├─ Child initialization

Example:
public class Animal {
    protected String name;
    
    public Animal(String name) {
        System.out.println("1. Animal constructor");
        this.name = name;
    }
}

public class Dog extends Animal {
    private int age;
    
    public Dog(String name, int age) {
        super(name); // Call parent constructor first
        System.out.println("2. Dog constructor");
        this.age = age;
    }
}

Usage:
  Dog dog = new Dog("Buddy", 5);

Output:
  1. Animal constructor
  2. Dog constructor
```

### Constructor Overloading

```
public class Person {
    private String name;
    private int age;
    private String email;
    
    // Constructor 1: No arguments
    public Person() {
        this("Unknown", 0, "unknown@example.com");
    }
    
    // Constructor 2: One argument
    public Person(String name) {
        this(name, 0, "unknown@example.com");
    }
    
    // Constructor 3: Two arguments
    public Person(String name, int age) {
        this(name, age, "unknown@example.com");
    }
    
    // Constructor 4: Three arguments (actual initialization)
    public Person(String name, int age, String email) {
        this.name = name;
        this.age = age;
        this.email = email;
    }
}

Usage:
  new Person();
  new Person("John");
  new Person("John", 30);
  new Person("John", 30, "john@example.com");
```

### Constructor Chaining (this())

```
Chaining with this():

public class Account {
    private String accountNumber;
    private double balance;
    private String accountType;
    
    public Account() {
        this("", 0);
    }
    
    public Account(String accountNumber, double balance) {
        this(accountNumber, balance, "Savings");
    }
    
    public Account(String accountNumber, double balance, String accountType) {
        this.accountNumber = accountNumber;
        this.balance = balance;
        this.accountType = accountType;
    }
}

Execution:
  Account a1 = new Account();
  └─ Calls Account()
  └─ Calls this("", 0)
  └─ Calls this("", 0, "Savings")
  └─ Actual initialization happens here
  
Benefits:
  ✓ DRY principle (Don't Repeat Yourself)
  ✓ Common initialization logic in one place
  ✓ Easy to maintain
```

### Private Constructor

```
public class Singleton {
    private static Singleton instance;
    
    // Private constructor prevents instantiation
    private Singleton() {
        System.out.println("Singleton created");
    }
    
    // Only way to get instance
    public static Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
        }
        return instance;
    }
}

Usage:
  new Singleton(); // ❌ COMPILE ERROR: Constructor is private
  
  Singleton s1 = Singleton.getInstance(); // ✓ OK
  Singleton s2 = Singleton.getInstance(); // ✓ Same instance (s1 == s2)

Pattern: Singleton (Design Pattern)
  Ensures only one instance of class exists
  Useful for:
    ├─ Database connections
    ├─ Configuration objects
    ├─ Loggers
    └─ Resource pools
```

### Builder Pattern (Constructor Alternative)

```
Instead of multiple overloaded constructors:

❌ Too many constructors:
Person p = new Person("John", 30, "john@example.com", "USA", "555-1234");
// What does each parameter mean? Hard to read

✓ Better: Builder Pattern

public class Person {
    private String name;
    private int age;
    private String email;
    private String country;
    private String phone;
    
    private Person(Builder builder) {
        this.name = builder.name;
        this.age = builder.age;
        this.email = builder.email;
        this.country = builder.country;
        this.phone = builder.phone;
    }
    
    public static class Builder {
        private String name;
        private int age;
        private String email;
        private String country;
        private String phone;
        
        public Builder name(String name) {
            this.name = name;
            return this;
        }
        
        public Builder age(int age) {
            this.age = age;
            return this;
        }
        
        public Builder email(String email) {
            this.email = email;
            return this;
        }
        
        public Builder country(String country) {
            this.country = country;
            return this;
        }
        
        public Builder phone(String phone) {
            this.phone = phone;
            return this;
        }
        
        public Person build() {
            return new Person(this);
        }
    }
}

Usage:
  Person p = new Person.Builder()
      .name("John")
      .age(30)
      .email("john@example.com")
      .country("USA")
      .phone("555-1234")
      .build();
  
  Benefits:
    ✓ Clear and readable
    ✓ Optional parameters
    ✓ Can add validation before build()
    ✓ Immutable objects
```

### Advanced Questions

**Q1: What's the default constructor?**
A: Compiler-generated constructor if you don't define any:
```
public class Test {
    // No constructor defined
}

// Compiler generates:
public class Test {
    public Test() {
        super(); // Calls Object()
    }
}

Usage:
  new Test(); // Uses default constructor

But if you define ANY constructor, default is NOT generated:
public class Test {
    public Test(String name) { }
}

new Test(); // ❌ COMPILE ERROR: No default constructor
```

**Q2: Can constructor throw checked exception?**
A: Yes!
```
public class FileReader {
    private String filename;
    
    public FileReader(String filename) throws FileNotFoundException {
        this.filename = filename;
        new java.io.FileInputStream(filename); // Throws FileNotFoundException
    }
}

Usage:
  try {
      FileReader reader = new FileReader("file.txt");
  } catch (FileNotFoundException e) {
      e.printStackTrace();
  }
```

**Q3: What if constructor calls another constructor with this() and super()?**
A: Must be first statement:
```
public class Child extends Parent {
    public Child(String name) {
        super(name); // ✓ OK: First statement
    }
    
    public Child(String name, int age) {
        this(name); // ✓ OK: First statement
    }
    
    public Child(String name, int age, String city) {
        // ❌ COMPILE ERROR: Neither super() nor this() as first statement
        System.out.println("Initializing");
        super(name); // Must be first
    }
}
```

---

## Object Class

### Definition

Root superclass of all Java classes. Every class extends Object implicitly (even if not explicit).

### Object Class Hierarchy

```
All classes implicitly extend Object:

┌─────────────┐
│   Object    │ (root of all classes)
└──────┬──────┘
       │
    ┌──┴──────┬──────────┬──────────┐
    │         │          │          │
┌───▼──┐ ┌───▼───┐ ┌───▼───┐ ┌───▼──────┐
│String│ │Integer│ │ Person│ │ MyClass  │
└──────┘ └───────┘ └───────┘ └──────────┘

Explicit:
  public class Person extends Object { }

Implicit (default):
  public class Person { } // Equivalent to above
```

### Methods in Object Class

```
public class Object {
    // 1. toString()
    public String toString()
    
    // 2. equals()
    public boolean equals(Object obj)
    
    // 3. hashCode()
    public int hashCode()
    
    // 4. getClass()
    public Class<?> getClass()
    
    // 5. clone()
    protected Object clone() throws CloneNotSupportedException
    
    // 6. wait() / notify() / notifyAll() - Concurrency
    public final void wait()
    public final void wait(long timeout)
    public final void wait(long timeout, int nanos)
    public final void notify()
    public final void notifyAll()
    
    // 7. finalize() - Deprecated
    protected void finalize() throws Throwable
}
```

### toString()

```
public class Person {
    private String name;
    private int age;
    
    // Default toString() from Object:
    // Output: Person@7ef20235 (ClassName@HashCode)
    
    // Override for better representation:
    @Override
    public String toString() {
        return "Person{" +
                "name='" + name + '\'' +
                ", age=" + age +
                '}';
    }
}

Usage:
  Person p = new Person("John", 30);
  System.out.println(p); // Calls toString() automatically
  // Output: Person{name='John', age=30}
```

### getClass()

```
public class Test {
    public static void main(String[] args) {
        Person p = new Person();
        
        // Get class information
        Class<?> clazz = p.getClass();
        
        System.out.println(clazz.getName()); // "Person"
        System.out.println(clazz.getSimpleName()); // "Person"
        System.out.println(clazz.getPackage()); // "com.example"
        
        // Get methods
        Method[] methods = clazz.getDeclaredMethods();
        for (Method method : methods) {
            System.out.println(method.getName());
        }
    }
}

Use Case:
  ├─ Runtime type checking
  ├─ Reflection
  ├─ Serialization
  └─ Dependency injection
```

### Advanced Questions

**Q1: Do you need to explicitly call super() to Object?**
A: No! It's called implicitly:
```
public class Person {
    public Person(String name) {
        // super(); is implicitly called
        // This is equivalent to:
        // super();
        // this.name = name;
        this.name = name;
    }
}
```

**Q2: What does @Override annotation do?**
A: It's compile-time check for overriding Object methods:
```
@Override
public String toString() { // Compiler checks: Does Object have toString()? Yes!
    return "...";
}

@Override
public void wrongMethod() { // Compiler error: Object doesn't have wrongMethod()
}
```

**Q3: Can you override final methods from Object?**
A: No! Some methods are final:
```
public final void wait() { } // Cannot override
public final void notify() { }
public final void notifyAll() { }
```

---

## equals() + hashCode()

### equals() Method

#### Default Implementation (From Object)

```
public class Object {
    public boolean equals(Object obj) {
        return this == obj; // Reference comparison
    }
}

Problem:
  Person p1 = new Person("John", 30);
  Person p2 = new Person("John", 30);
  
  p1.equals(p2); // false! (Different objects in memory)
  
  But logically they represent the SAME person!
```

#### Overriding equals()

```
public class Person {
    private String name;
    private int age;
    
    @Override
    public boolean equals(Object obj) {
        // Step 1: Check if same reference
        if (this == obj) return true;
        
        // Step 2: Check if null
        if (obj == null) return false;
        
        // Step 3: Check if same class
        if (this.getClass() != obj.getClass()) return false;
        
        // Step 4: Cast and compare fields
        Person other = (Person) obj;
        return this.name.equals(other.name) &&
               this.age == other.age;
    }
}

Usage:
  Person p1 = new Person("John", 30);
  Person p2 = new Person("John", 30);
  Person p3 = new Person("Jane", 25);
  
  p1.equals(p2); // true (same values)
  p1.equals(p3); // false (different values)
```

#### Proper equals() Implementation Template

```
public class Person {
    private String name;
    private int age;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Person)) return false;
        
        Person person = (Person) o;
        
        return age == person.age &&
               Objects.equals(name, person.name);
    }
}

Benefits:
  ✓ Handles null safely
  ✓ Uses instanceof for class check
  ✓ Uses Objects.equals() for null-safe comparison
```

### hashCode() Method

#### Default Implementation

```
public class Object {
    public int hashCode() {
        return // Implementation-dependent
              // Usually memory address converted to int
    }
}

Example:
  Person p1 = new Person("John", 30);
  System.out.println(p1.hashCode()); // 2018699554 (random each run)
```

#### hashCode() and HashMap

```
How HashMap uses hashCode():

HashMap<Person, String> map = new HashMap<>();
Person p1 = new Person("John", 30);
map.put(p1, "Engineer");

Internally:
1. Calls p1.hashCode() → returns, say, 12345
2. Uses hash value to find bucket: buckets[12345 % table.length]
3. In that bucket, searches for object using equals()
4. If found, returns value; otherwise adds new entry

Retrieval:
Person p2 = new Person("John", 30);
String value = map.get(p2);

1. Calls p2.hashCode() → if same as p1, returns 12345
2. Looks in same bucket
3. Uses equals() to find object
4. Returns "Engineer" if p1.equals(p2)
```

#### The hashCode() Contract

```
Critical Rules:

1. If equals() returns true, hashCode() MUST return same value
   ✓ Correct:
     p1.equals(p2) = true
     p1.hashCode() == p2.hashCode() = true
   
   ❌ Wrong:
     p1.equals(p2) = true
     p1.hashCode() = 100
     p2.hashCode() = 200

2. If equals() returns false, hashCode() SHOULD be different
   (But not required by contract, only recommended)
   
3. Calling hashCode() multiple times MUST return same value
   (Within single JVM session, as long as object doesn't change)

4. If object is used in hash-based collections, don't modify it!
```

#### Proper hashCode() Implementation

```
public class Person {
    private String name;
    private int age;
    
    @Override
    public int hashCode() {
        return Objects.hash(name, age);
    }
    
    // Or manual implementation:
    @Override
    public int hashCode() {
        int result = name.hashCode();
        result = 31 * result + age;
        return result;
    }
}

Usage:
  Person p1 = new Person("John", 30);
  Person p2 = new Person("John", 30);
  
  p1.hashCode() == p2.hashCode(); // true (same values)
  
  HashSet<Person> set = new HashSet<>();
  set.add(p1);
  set.add(p2); // Not added again (equals() returns true)
  
  set.size(); // 1 (not 2)
```

### equals() vs hashCode() - Complete Example

```
❌ WRONG: equals() without hashCode()

public class Student {
    private String studentId;
    
    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Student)) return false;
        Student student = (Student) o;
        return this.studentId.equals(student.studentId);
    }
    // Missing: hashCode() override
}

Usage:
  HashSet<Student> set = new HashSet<>();
  Student s1 = new Student("001");
  Student s2 = new Student("001");
  
  s1.equals(s2); // true
  
  set.add(s1);
  set.add(s2); // ❌ Both added! (Different hashCode())
  
  set.size(); // 2 (should be 1!)


✓ CORRECT: equals() AND hashCode()

public class Student {
    private String studentId;
    
    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Student)) return false;
        Student student = (Student) o;
        return this.studentId.equals(student.studentId);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(studentId);
    }
}

Usage:
  HashSet<Student> set = new HashSet<>();
  Student s1 = new Student("001");
  Student s2 = new Student("001");
  
  s1.equals(s2); // true
  s1.hashCode() == s2.hashCode(); // true
  
  set.add(s1);
  set.add(s2); // ✓ s2 not added (both have same hash and equals)
  
  set.size(); // 1 (correct!)
```

### Performance Impact

```
Hash Collision (Bad hashCode):

public class BadStudent {
    private String studentId;
    
    @Override
    public int hashCode() {
        return 1; // ❌ All objects return same hash!
    }
}

HashMap performance:
  add(s1); // Fast: O(1) - goes to bucket 1
  add(s2); // Fast: O(1) - goes to bucket 1
  add(s3); // Fast: O(1) - goes to bucket 1
  ...
  get(s1); // SLOW: O(n) - must search all 1000 objects in bucket 1!

Bucket structure:
  Bucket 1: [s1, s2, s3, s4, ..., s1000]

Good hashCode:

public class GoodStudent {
    private String studentId;
    
    @Override
    public int hashCode() {
        return studentId.hashCode(); // ✓ Good distribution
    }
}

HashMap performance:
  add(s1); // Fast: O(1) - goes to bucket X
  add(s2); // Fast: O(1) - goes to bucket Y
  add(s3); // Fast: O(1) - goes to bucket Z
  ...
  get(s1); // Fast: O(1) - direct access to bucket X
  
Bucket structure:
  Bucket X: [s1]
  Bucket Y: [s2]
  Bucket Z: [s3]
```

### Advanced Questions

**Q1: Why does String override equals() and hashCode() but int doesn't?**
A:
- **String**: Mutable-looking (different String objects with same value)
- **int**: Primitive, not object. Automatically boxed to Integer which overrides both

```
String s1 = new String("Hello");
String s2 = new String("Hello");

s1.equals(s2); // true (values compared)
s1 == s2; // false (different references)

Integer i1 = new Integer(100);
Integer i2 = new Integer(100);

i1.equals(i2); // true
i1 == i2; // false (in most cases)
i1.hashCode() == i2.hashCode(); // true (same value)
```

**Q2: Can you modify an object after adding to HashMap?**
A: NO! If you change object and it changes its hashCode():

```
public class BadExample {
    public static void main(String[] args) {
        HashMap<Person, String> map = new HashMap<>();
        Person p = new Person("John", 30);
        
        map.put(p, "Engineer");
        
        // ❌ DANGER: Don't do this!
        p.setAge(31); // If hashCode() depends on age, hash changes!
        
        // Now object is in wrong bucket, can't find it
        map.get(p); // null (lost!)
        
        // Solution: Use immutable objects or be careful
    }
}

Lesson: Objects used in hash-based collections should be immutable
```

**Q3: What's the difference between == and equals()?**
A:
- **==**: Reference comparison (same object in memory)
- **equals()**: Value comparison (same logical value)

```
String s1 = new String("Hello");
String s2 = new String("Hello");

s1 == s2; // false (different objects)
s1.equals(s2); // true (same value)

Person p1 = new Person("John", 30);
Person p2 = new Person("John", 30);

p1 == p2; // false (unless you use same reference)
p1.equals(p2); // true (if equals() compares values)
```

---

## Practice Questions & Exercises

### Question 1: Class vs Object
```
Q: Create a class that has 5 objects, and explain the memory usage.

Concepts to cover:
  - One class definition
  - Five separate objects with own state
  - Shared method code
  - Heap vs Method Area
```

### Question 2: Encapsulation
```
Q: Design a BankAccount class with encapsulation. What validations would you add?

Concepts to cover:
  - Private fields
  - Public getters/setters
  - Validation logic
  - Immutability considerations
```

### Question 3: Inheritance Chain
```
Q: Design an inheritance hierarchy: Vehicle → Car → SportsCar
   - What methods would you override?
   - What's the constructor chaining?

Concepts to cover:
  - Method overriding
  - Constructor chaining (super())
  - Method resolution order
```

### Question 4: Polymorphism
```
Q: Create Shape, Circle, Rectangle, Triangle.
   - Use polymorphism to calculate total area of mixed shapes.
   
Concepts to cover:
  - Runtime polymorphism
  - Virtual method table
  - Collections with superclass references
```

### Question 5: Composition vs Inheritance
```
Q: Should Dog extend Animal or compose it? Justify.

Concepts to cover:
  - IS-A vs HAS-A
  - Fragile base class problem
  - Code reuse comparison
```

### Question 6: equals() + hashCode()
```
Q: Implement Person class for use in HashMap/HashSet.
   - Write correct equals()
   - Write matching hashCode()
   - Test with equal objects

Concepts to cover:
  - Contract between equals() and hashCode()
  - HashMap bucket logic
  - Performance implications
```

---

## Summary Table

| Concept | Purpose | Key Point |
|---------|---------|-----------|
| Class | Blueprint | One definition for multiple objects |
| Object | Instance | Individual entity with state |
| Encapsulation | Hide details | Access control + validation |
| Inheritance | Code reuse | IS-A relationship, method override |
| Polymorphism | Dynamic behavior | Runtime method dispatch |
| Abstraction | Simplification | Show interface, hide implementation |
| Overloading | Same name | Different signatures, compile-time |
| Overriding | Replace behavior | Same signature, runtime |
| Interface | Contract | Pure abstraction, multiple impl |
| Abstract Class | Partial impl | Shared code + contract |
| Composition | Part-of | HAS-A relationship, flexibility |
| This | Self-reference | Current object context |
| Static | Class-level | Shared across instances |
| Constructor | Initialize | Called on object creation |
| equals() | Comparison | Value-based equality |
| hashCode() | Hash | Distribution for hash collections |

---

## Next Steps

1. **Understand**: Each concept deeply
2. **Practice**: Write code for each concept
3. **Combine**: Use multiple concepts together
4. **Apply**: Use in real-world projects
5. **Optimize**: Performance and maintainability

Focus areas for 10+ years professionals:
- When to use each pattern
- Trade-offs between approaches
- Performance implications
- Testability and maintainability
- Real-world design decisions
