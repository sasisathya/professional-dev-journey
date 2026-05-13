# Day 1: Java OOP Revision - Corrections & Clarifications

**Date**: May 13, 2026

---

## 4 Pillars of OOP - Your Understanding

### Your Answers:
1. ✅ **Abstraction**: Hiding unwanted data
2. ✅ **Encapsulation**: Combining data and methods in single object
3. ✅ **Inheritance**: Using parent methods in child
4. ⚠️ **Polymorphism**: Call by value/reference, overloading/overriding

### Correction for Polymorphism:
**Polymorphism** = "Many forms" - Same interface, different behavior

**Two Types:**
1. **Compile-time Polymorphism (Method Overloading)**
   - Same method name, different parameters
   - Decided at compile time
   ```java
   void print(int a) { }
   void print(String a) { }
   void print(int a, int b) { }
   ```

2. **Run-time Polymorphism (Method Overriding)**
   - Child class redefines parent method
   - Decided at runtime based on actual object
   ```java
   Animal animal = new Dog();
   animal.sound();  // Calls Dog's sound() method
   ```

**Note**: "Call by value/reference" is about parameter passing, NOT polymorphism!

---

## Abstract Class vs Interface - IMPORTANT CORRECTIONS ⚠️

### Your Answer (with issues):
- "abstract class is super class defines structure" ✅ Partially correct
- "interface defines how class looks like" ✅ Correct
- "if I want to use defined structure not existing methods, use abstract" ⚠️ Unclear
- "can interface be multiple? No" ❌ **WRONG!**
- "cannot extend multiple abstract classes" ✅ Correct

---

## The Truth About Interfaces vs Abstract Classes

### Key Differences:

| Feature | Abstract Class | Interface |
|---------|---------------|-----------|
| **Multiple inheritance** | ❌ NO (can extend only 1) | ✅ YES (can implement many) |
| **Fields/State** | ✅ Can have instance variables | ❌ Only constants (public static final) |
| **Constructors** | ✅ Can have constructors | ❌ No constructors |
| **Method implementation** | ✅ Can have concrete methods | ✅ Can have default methods (Java 8+) |
| **Access modifiers** | ✅ public, private, protected | ❌ All methods public by default |
| **When to use** | IS-A relationship (inheritance) | CAN-DO relationship (capability) |

---

## CRITICAL POINT: Multiple Interfaces ✅

**YOU CAN implement multiple interfaces!** This is one of the BIGGEST reasons to use interfaces!

```java
// ✅ ALLOWED - Multiple interfaces
class Bird implements Flyable, Swimmable, Eatable {
    public void fly() { }
    public void swim() { }
    public void eat() { }
}

// ❌ NOT ALLOWED - Multiple abstract classes
class Bird extends Animal, Vehicle {  // COMPILE ERROR!
}

// ✅ ALLOWED - 1 abstract class + multiple interfaces
class Bird extends Animal implements Flyable, Swimmable {
}
```

---

## When to Use What? 🎯

### Use **Abstract Class** when:
1. You have **common code** to share among related classes
2. Classes are closely related (IS-A relationship)
3. Need **instance variables** or **constructors**
4. Want **protected/private** members

**Example:**
```java
abstract class Vehicle {
    protected String brand;  // Instance variable

    public Vehicle(String brand) {  // Constructor
        this.brand = brand;
    }

    abstract void start();  // Must implement

    void stop() {  // Shared implementation
        System.out.println("Vehicle stopped");
    }
}

class Car extends Vehicle {
    public Car(String brand) {
        super(brand);
    }

    void start() {
        System.out.println(brand + " car started");
    }
}
```

### Use **Interface** when:
1. Defining a **contract** or **capability** (CAN-DO relationship)
2. Need **multiple inheritance**
3. Unrelated classes should implement same behavior
4. Want **loose coupling**

**Example:**
```java
interface Flyable {
    void fly();
}

interface Swimmable {
    void swim();
}

// Bird can fly and swim
class Duck implements Flyable, Swimmable {
    public void fly() { System.out.println("Duck flying"); }
    public void swim() { System.out.println("Duck swimming"); }
}

// Airplane can fly but NOT swim
class Airplane implements Flyable {
    public void fly() { System.out.println("Airplane flying"); }
}

// Fish can swim but NOT fly
class Fish implements Swimmable {
    public void swim() { System.out.println("Fish swimming"); }
}
```

---

## Real-World Spring Boot Example

```java
// Interface for CAN-DO capability
public interface PaymentProcessor {
    void processPayment(double amount);
}

// Multiple implementations
@Service
public class StripePaymentProcessor implements PaymentProcessor {
    public void processPayment(double amount) {
        // Stripe-specific logic
    }
}

@Service
public class PayPalPaymentProcessor implements PaymentProcessor {
    public void processPayment(double amount) {
        // PayPal-specific logic
    }
}

// Controller uses interface, not concrete class
@RestController
public class OrderController {
    @Autowired
    private PaymentProcessor paymentProcessor;  // Can be any implementation!

    @PostMapping("/order")
    public void createOrder() {
        paymentProcessor.processPayment(100.0);
    }
}
```

**This is polymorphism + interface in action!** Spring decides which implementation to inject at runtime.

---

## Quick Quiz - Test Your Understanding

**Question:** Which one should you use?

1. You're building a payment system. Different payment gateways (Stripe, PayPal, Razorpay) all need a `processPayment()` method.
   - **Answer**: Interface (different unrelated implementations)

2. You have Animal class. Dog, Cat, Bird all share common properties (age, name) and some common methods (eat, sleep).
   - **Answer**: Abstract class (common state and behavior)

3. A Robot class needs to implement Movable, Rechargeable, Controllable behaviors.
   - **Answer**: Interfaces (multiple capabilities)

---

## Key Takeaway 🎯

**Interface = Multiple inheritance, contracts, capabilities (CAN-DO)**
**Abstract Class = Single inheritance, shared code, family relationship (IS-A)**

**You CAN implement MULTIPLE interfaces - this is Java's way around multiple inheritance problem!**

---

## Status
- ✅ Polymorphism concept clarified
- ✅ Abstract class vs Interface corrected
- ✅ @Autowired explained

---

## Question 3: @Autowired in Spring Boot

### What is @Autowired?

**@Autowired = Dependency Injection (DI)**

It tells Spring: *"Find a bean of this type and inject it automatically"*

### How It Works:

```java
// Step 1: Register the service with Spring
@Service  // Makes this a Spring-managed bean
public class UserService {
    public List<User> getAllUsers() {
        return Arrays.asList(new User("John"), new User("Jane"));
    }
}

// Step 2: Inject it automatically
@RestController
public class UserController {

    @Autowired  // Spring automatically creates and injects UserService
    private UserService userService;

    // You DON'T write: userService = new UserService();
    // Spring does it for you!

    @GetMapping("/users")
    public List<User> getUsers() {
        return userService.getAllUsers();  // Just use it!
    }
}
```

### Without Spring (Manual Way):
```java
public class UserController {
    private UserService userService = new UserService();  // You create it
    private EmailService emailService = new EmailService();  // You create it
    private LogService logService = new LogService();  // You create it
    // Lots of manual object creation!
}
```

### With Spring (@Autowired):
```java
@RestController
public class UserController {
    @Autowired private UserService userService;    // Spring injects
    @Autowired private EmailService emailService;  // Spring injects
    @Autowired private LogService logService;      // Spring injects
    // Spring manages everything!
}
```

### Three Ways to Use @Autowired:

```java
// 1. Field Injection (simple but not recommended for testing)
@Autowired
private UserService userService;

// 2. Constructor Injection (BEST PRACTICE - recommended!)
private final UserService userService;

@Autowired  // Optional in Spring 4.3+
public UserController(UserService userService) {
    this.userService = userService;
}

// 3. Setter Injection (rare use case)
private UserService userService;

@Autowired
public void setUserService(UserService userService) {
    this.userService = userService;
}
```

### Key Annotations for Spring Beans:

- **@Component** - Generic Spring bean
- **@Service** - Business logic layer
- **@Repository** - Data access layer
- **@Controller/@RestController** - Web layer

All of these register classes with Spring so they can be @Autowired!

### Common Interview Question:

**Q: What if there are multiple implementations?**

```java
interface PaymentService { }

@Service
class StripePaymentService implements PaymentService { }

@Service
class PayPalPaymentService implements PaymentService { }

// Spring doesn't know which to inject!
@Autowired
private PaymentService paymentService;  // ERROR: Multiple beans found!

// Solution 1: Use @Qualifier
@Autowired
@Qualifier("stripePaymentService")
private PaymentService paymentService;

// Solution 2: Use @Primary on one implementation
@Service
@Primary  // This one gets injected by default
class StripePaymentService implements PaymentService { }
```

---

## Day 1 Java OOP Summary

### Concepts Covered:
1. ✅ 4 Pillars of OOP (with polymorphism clarification)
2. ✅ Abstract Class vs Interface (CRITICAL: multiple interfaces allowed!)
3. ✅ @Autowired and Dependency Injection in Spring Boot

### Key Corrections Made:
- **Polymorphism**: Not about parameter passing, about different behavior
- **Multiple Interfaces**: YOU CAN implement multiple interfaces (not abstract classes)
- **@Autowired**: Injects objects, not methods. Spring manages object creation.

**Time spent**: ~30 minutes
**Next**: DSA - Arrays & HashMaps (2 problems)
