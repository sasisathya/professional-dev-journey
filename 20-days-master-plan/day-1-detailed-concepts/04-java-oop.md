# Java OOP Principles - Complete Interview Guide

## Table of Contents
1. [Four Pillars of OOP](#four-pillars-of-oop)
2. [Encapsulation](#encapsulation)
3. [Inheritance](#inheritance)
4. [Polymorphism](#polymorphism)
5. [Abstraction](#abstraction)
6. [SOLID Principles](#solid-principles)
7. [Abstract Classes vs Interfaces](#abstract-classes-vs-interfaces)
8. [Interview Questions](#interview-questions)

---

## Four Pillars of OOP

### 1. Encapsulation
### 2. Inheritance
### 3. Polymorphism
### 4. Abstraction

---

## Encapsulation

**Definition:** Bundling data (variables) and methods that operate on that data within a single unit (class), and restricting direct access to some components using access modifiers.

### Key Concept
```java
public class Student {
  // Private variables (encapsulated)
  private String name;
  private int age;
  private double gpa;

  // Public methods to access/modify
  public String getName() {
    return name;
  }

  public void setName(String name) {
    if (name != null && !name.isEmpty()) {
      this.name = name; // Validation
    }
  }

  public int getAge() {
    return age;
  }

  public void setAge(int age) {
    if (age > 0 && age < 100) {
      this.age = age; // Validation
    }
  }
}
```

### Benefits of Encapsulation
1. **Control:** Can add validation in setters
2. **Flexibility:** Can change internal implementation without affecting external code
3. **Security:** Hide sensitive data
4. **Maintainability:** Easy to modify without breaking client code

### Access Modifiers
```java
public class Example {
  public int publicVar;           // Accessible from anywhere
  protected int protectedVar;     // Accessible from subclasses and same package
  int packagePrivateVar;          // Accessible from same package only
  private int privateVar;         // Accessible only from this class
}
```

---

## Inheritance

**Definition:** A mechanism where a new class (subclass/child) derives properties and behaviors from an existing class (superclass/parent) using the `extends` keyword.

### Basic Example
```java
// Parent class
public class Animal {
  public void eat() {
    System.out.println("Eating...");
  }

  public void sleep() {
    System.out.println("Sleeping...");
  }
}

// Child class inherits from Animal
public class Dog extends Animal {
  public void bark() {
    System.out.println("Woof!");
  }
}

// Usage
Dog dog = new Dog();
dog.eat();    // Inherited from Animal
dog.sleep();  // Inherited from Animal
dog.bark();   // Dog's own method
```

### Method Overriding (Runtime Polymorphism)
```java
public class Animal {
  public void sound() {
    System.out.println("Animal sound");
  }
}

public class Dog extends Animal {
  @Override
  public void sound() {
    System.out.println("Woof!"); // Overrides parent method
  }
}

public class Cat extends Animal {
  @Override
  public void sound() {
    System.out.println("Meow!"); // Overrides parent method
  }
}

// Usage
Animal dog = new Dog();
Animal cat = new Cat();
dog.sound(); // Output: Woof!
cat.sound(); // Output: Meow!
```

### Types of Inheritance
```
1. Single Inheritance
   Animal
    ↑
    Dog

2. Multi-level Inheritance
   Animal
    ↑
    Dog
    ↑
    PetDog

3. Hierarchical Inheritance
       Animal
       ↑  ↑
      Dog Cat Bird

4. Multiple Inheritance (NOT supported in Java)
   (Use interfaces instead)
```

---

## Polymorphism

**Definition:** "Many forms" - the ability of objects to take multiple forms. One interface, multiple implementations.

### Method Overloading (Compile-time Polymorphism)
```java
public class Calculator {
  // Same method name, different parameters
  public int add(int a, int b) {
    return a + b;
  }

  public double add(double a, double b) {
    return a + b;
  }

  public int add(int a, int b, int c) {
    return a + b + c;
  }
}

// Usage
Calculator calc = new Calculator();
System.out.println(calc.add(5, 10));        // Calls int version → 15
System.out.println(calc.add(5.5, 10.5));    // Calls double version → 16.0
System.out.println(calc.add(5, 10, 15));    // Calls three int version → 30
```

**Overloading Rules:**
- Same method name
- Different number of parameters
- Different parameter types
- Different parameter order

### Method Overriding (Runtime Polymorphism)
```java
public class Shape {
  public void draw() {
    System.out.println("Drawing shape");
  }
}

public class Circle extends Shape {
  @Override
  public void draw() {
    System.out.println("Drawing circle");
  }
}

public class Square extends Shape {
  @Override
  public void draw() {
    System.out.println("Drawing square");
  }
}

// Usage - Polymorphism in action
Shape[] shapes = new Shape[3];
shapes[0] = new Shape();
shapes[1] = new Circle();
shapes[2] = new Square();

for (Shape shape : shapes) {
  shape.draw(); // Correct method called based on actual object type
}

// Output:
// Drawing shape
// Drawing circle
// Drawing square
```

---

## Abstraction

**Definition:** Hiding complex implementation details and showing only essential features. Achieved through abstract classes and interfaces.

### Abstract Class Example
```java
public abstract class Vehicle {
  // Abstract method (no implementation)
  abstract void start();
  abstract void stop();

  // Concrete method (with implementation)
  public void refuel() {
    System.out.println("Refueling...");
  }
}

public class Car extends Vehicle {
  @Override
  void start() {
    System.out.println("Car starting with engine");
  }

  @Override
  void stop() {
    System.out.println("Car stopping");
  }
}

// Usage
Vehicle car = new Car();
car.start();    // Car starting with engine
car.refuel();   // Refueling...
car.stop();     // Car stopping
```

### Interface Example
```java
public interface Drawable {
  void draw(); // Abstract method
  void erase(); // Abstract method
}

public class Circle implements Drawable {
  @Override
  public void draw() {
    System.out.println("Drawing circle");
  }

  @Override
  public void erase() {
    System.out.println("Erasing circle");
  }
}

// Usage
Drawable circle = new Circle();
circle.draw();   // Drawing circle
circle.erase();  // Erasing circle
```

### Benefits of Abstraction
1. Hide complexity from users
2. Enhance readability
3. Easier to maintain
4. Can change implementation without affecting client code

---

## SOLID Principles

### S - Single Responsibility Principle
**Each class should have only one reason to change (one responsibility)**

```java
// ❌ BAD - Class has multiple responsibilities
public class Employee {
  public void calculateSalary() {}
  public void saveToDatabase() {}
  public void sendEmail() {}
}

// ✓ GOOD - Each class has one responsibility
public class Employee {
  public void calculateSalary() {}
}

public class EmployeeRepository {
  public void save(Employee e) {}
}

public class EmailService {
  public void sendEmail(String to, String subject) {}
}
```

### O - Open/Closed Principle
**Classes should be open for extension, closed for modification**

```java
// ❌ BAD - Need to modify PaymentProcessor to add new payment type
public class PaymentProcessor {
  public void processPayment(String type) {
    if (type.equals("CREDIT_CARD")) {
      // Credit card logic
    } else if (type.equals("PAYPAL")) {
      // PayPal logic
    }
    // Every new payment type requires modification
  }
}

// ✓ GOOD - Use abstraction for extension
public interface PaymentMethod {
  void pay(double amount);
}

public class CreditCardPayment implements PaymentMethod {
  @Override
  public void pay(double amount) {
    // Credit card logic
  }
}

public class PayPalPayment implements PaymentMethod {
  @Override
  public void pay(double amount) {
    // PayPal logic
  }
}

public class PaymentProcessor {
  public void processPayment(PaymentMethod method, double amount) {
    method.pay(amount);
  }
  // New payment types can be added without modification
}
```

### L - Liskov Substitution Principle
**Subclasses should be substitutable for their base class without breaking the application**

```java
// ❌ BAD - Violates LSP
public class Bird {
  public void fly() {
    System.out.println("Flying");
  }
}

public class Penguin extends Bird {
  @Override
  public void fly() {
    throw new UnsupportedOperationException("Penguins can't fly");
  }
}

// ✓ GOOD - Proper hierarchy
public abstract class Bird {
  abstract void move();
}

public class Sparrow extends Bird {
  @Override
  void move() {
    fly();
  }

  void fly() {}
}

public class Penguin extends Bird {
  @Override
  void move() {
    swim();
  }

  void swim() {}
}
```

### I - Interface Segregation Principle
**Many specific interfaces are better than one general interface**

```java
// ❌ BAD - One large interface
public interface Worker {
  void work();
  void eat();
  void manage();
}

public class Manager implements Worker {
  public void work() {}
  public void eat() {}
  public void manage() {} // Manager can do this
}

public class Robot implements Worker {
  public void work() {}
  public void eat() {} // ❌ Robot can't eat!
  public void manage() {}
}

// ✓ GOOD - Segregated interfaces
public interface Workable {
  void work();
}

public interface Eatable {
  void eat();
}

public interface Manageable {
  void manage();
}

public class Manager implements Workable, Eatable, Manageable {
  public void work() {}
  public void eat() {}
  public void manage() {}
}

public class Robot implements Workable {
  public void work() {}
  // No unnecessary methods
}
```

### D - Dependency Inversion Principle
**Depend on abstractions, not concretions**

```java
// ❌ BAD - Depends on concrete classes
public class UserService {
  private MySQLDatabase database = new MySQLDatabase(); // Dependency

  public void saveUser(User user) {
    database.save(user);
  }
}

// ✓ GOOD - Depends on abstraction
public interface Database {
  void save(User user);
}

public class UserService {
  private Database database; // Depends on interface

  public UserService(Database database) {
    this.database = database;
  }

  public void saveUser(User user) {
    database.save(user);
  }
}

// Can inject any implementation
UserService service = new UserService(new MySQLDatabase());
UserService service = new UserService(new MongoDBDatabase());
```

---

## Abstract Classes vs Interfaces

| Feature | Abstract Class | Interface |
|---------|---|---|
| Variables | Can have state | Only constants (static final) |
| Methods | Abstract and concrete | Abstract (Java 8+ allows default/static) |
| Inheritance | Single inheritance | Multiple inheritance |
| Access Modifiers | Can be private, protected, public | Only public |
| Constructor | Can have constructors | Cannot have constructors |
| When to Use | General parent class | Contract/behavior |

### Example
```java
// Abstract Class - General parent with shared state
public abstract class Vehicle {
  protected String color;
  protected int speed;

  abstract void start();

  public void showColor() {
    System.out.println("Color: " + color);
  }
}

// Interface - Contract to implement
public interface Drivable {
  void drive();
  void stop();
}

// Concrete Class
public class Car extends Vehicle implements Drivable {
  @Override
  void start() {
    System.out.println("Car starting");
  }

  @Override
  public void drive() {
    System.out.println("Car driving");
  }

  @Override
  public void stop() {
    System.out.println("Car stopping");
  }
}
```

---

## Interview Questions

### Q1: Explain the four pillars of OOP
**Answer:**
1. **Encapsulation** - Bundle data and methods, restrict access
2. **Inheritance** - Derive properties from parent classes
3. **Polymorphism** - Objects take multiple forms (overloading/overriding)
4. **Abstraction** - Hide complex details, show essentials

### Q2: What's the difference between abstract classes and interfaces?
**Answer:** Abstract classes can have state and implementation, support single inheritance, and can have constructors. Interfaces are contracts with abstract methods, support multiple inheritance, and only have constants.

### Q3: What is method overloading?
**Answer:** Method overloading is compile-time polymorphism where multiple methods have the same name but different parameters (number, type, or order).

### Q4: What is method overriding?
**Answer:** Method overriding is runtime polymorphism where a child class provides a specific implementation of a parent class method.

### Q5: Explain SOLID principles
**Answer:** Design principles for writing maintainable code:
- **S**: Single Responsibility
- **O**: Open/Closed
- **L**: Liskov Substitution
- **I**: Interface Segregation
- **D**: Dependency Inversion

### Q6: Why is inheritance useful?
**Answer:** Inheritance promotes code reuse, establishes relationships between classes, supports polymorphism, and makes code more organized and maintainable.

---

## Key Takeaways

1. **Encapsulation** - Protect data with getters/setters
2. **Inheritance** - Reuse code through parent classes
3. **Polymorphism** - Same interface, different implementations
4. **Abstraction** - Hide complexity
5. **SOLID** - Write maintainable, scalable code
6. **Abstract Classes vs Interfaces** - Choose based on design needs

---

**OOP is the foundation of Java programming!**
