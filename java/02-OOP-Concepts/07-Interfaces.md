# Interfaces in Java

## What is an Interface?

An **interface** is a **contract** that defines what a class must do, but not how to do it. It's like a blueprint with only method signatures.

**Real-world example:** A remote control interface - all remotes must have power, volume, channel buttons, but each brand implements them differently!

## Syntax

```java
interface InterfaceName {
    // Abstract methods (by default public abstract)
    void method1();
    void method2();

    // Constants (by default public static final)
    int CONSTANT = 100;
}
```

## Implementing an Interface

```java
class ClassName implements InterfaceName {
    // Must implement all methods
    @Override
    public void method1() {
        // implementation
    }

    @Override
    public void method2() {
        // implementation
    }
}
```

## Simple Example

```java
interface Animal {
    void makeSound();  // public abstract by default
    void eat();
}

class Dog implements Animal {
    @Override
    public void makeSound() {
        System.out.println("Dog barks");
    }

    @Override
    public void eat() {
        System.out.println("Dog eats bones");
    }
}

class Cat implements Animal {
    @Override
    public void makeSound() {
        System.out.println("Cat meows");
    }

    @Override
    public void eat() {
        System.out.println("Cat eats fish");
    }
}

public class Main {
    public static void main(String[] args) {
        Animal dog = new Dog();
        Animal cat = new Cat();

        dog.makeSound();
        dog.eat();

        cat.makeSound();
        cat.eat();
    }
}
```

## Multiple Interfaces

A class can implement **multiple interfaces** (unlike inheritance where you can extend only one class).

```java
interface Flyable {
    void fly();
}

interface Swimmable {
    void swim();
}

class Duck implements Flyable, Swimmable {
    @Override
    public void fly() {
        System.out.println("Duck is flying");
    }

    @Override
    public void swim() {
        System.out.println("Duck is swimming");
    }
}

public class Main {
    public static void main(String[] args) {
        Duck duck = new Duck();
        duck.fly();
        duck.swim();
    }
}
```

## Real-World Example: Payment System

```java
interface Payment {
    void processPayment(double amount);
    void refund(double amount);
}

class CreditCardPayment implements Payment {
    @Override
    public void processPayment(double amount) {
        System.out.println("Processing credit card payment: $" + amount);
    }

    @Override
    public void refund(double amount) {
        System.out.println("Refunding to credit card: $" + amount);
    }
}

class PayPalPayment implements Payment {
    @Override
    public void processPayment(double amount) {
        System.out.println("Processing PayPal payment: $" + amount);
    }

    @Override
    public void refund(double amount) {
        System.out.println("Refunding to PayPal account: $" + amount);
    }
}

public class Main {
    public static void main(String[] args) {
        Payment payment1 = new CreditCardPayment();
        Payment payment2 = new PayPalPayment();

        payment1.processPayment(100.0);
        payment2.processPayment(200.0);

        payment1.refund(50.0);
    }
}
```

## Interface vs Abstract Class

| Feature | Interface | Abstract Class |
|---------|-----------|----------------|
| **Methods** | All methods abstract (Java 7) | Can have both abstract and concrete |
| **Variables** | Only constants (public static final) | Can have any type |
| **Multiple** | Can implement multiple | Can extend only one |
| **Constructor** | Cannot have | Can have |
| **When to use** | Define contract/capability | Share common code |

## Default Methods (Java 8+)

Interfaces can have **default methods** with implementation.

```java
interface Vehicle {
    void start();

    // Default method
    default void honk() {
        System.out.println("Vehicle is honking!");
    }
}

class Car implements Vehicle {
    @Override
    public void start() {
        System.out.println("Car is starting");
    }
    // Can use default honk() or override it
}
```

## Quick Tips

💡 Use `interface` keyword to define
💡 Use `implements` keyword to implement
💡 Class must implement **all methods**
💡 Methods are **public abstract** by default
💡 Can implement **multiple interfaces**
💡 Cannot instantiate an interface

---

**Previous:** [Abstraction](./06-Abstraction.md) | **Next:** [Static and Final](./08-Static-and-Final.md)
