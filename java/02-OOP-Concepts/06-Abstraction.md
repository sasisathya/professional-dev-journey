# Abstraction in Java

## What is Abstraction?

**Abstraction** means hiding **complex implementation details** and showing only essential features.

**Real-world example:** You drive a car without knowing how the engine works internally!

## Abstract Classes

A class that **cannot be instantiated** (can't create objects directly). Used as a **base class**.

### Syntax:
```java
abstract class ClassName {
    // abstract method (no body)
    abstract void methodName();

    // concrete method (with body)
    void regularMethod() {
        // implementation
    }
}
```

### Example:
```java
abstract class Animal {
    // Abstract method (no implementation)
    abstract void makeSound();

    // Concrete method
    void sleep() {
        System.out.println("Animal is sleeping");
    }
}

class Dog extends Animal {
    // Must implement abstract method
    @Override
    void makeSound() {
        System.out.println("Dog barks");
    }
}

class Cat extends Animal {
    @Override
    void makeSound() {
        System.out.println("Cat meows");
    }
}

public class Main {
    public static void main(String[] args) {
        // Animal a = new Animal(); // ERROR! Can't instantiate abstract class

        Animal dog = new Dog();
        Animal cat = new Cat();

        dog.makeSound();  // Dog barks
        dog.sleep();      // Animal is sleeping

        cat.makeSound();  // Cat meows
        cat.sleep();      // Animal is sleeping
    }
}
```

## Real-World Example: Shape System

```java
abstract class Shape {
    String color;

    // Constructor
    Shape(String color) {
        this.color = color;
    }

    // Abstract methods
    abstract double calculateArea();
    abstract double calculatePerimeter();

    // Concrete method
    void displayColor() {
        System.out.println("Color: " + color);
    }
}

class Circle extends Shape {
    double radius;

    Circle(String color, double radius) {
        super(color);
        this.radius = radius;
    }

    @Override
    double calculateArea() {
        return Math.PI * radius * radius;
    }

    @Override
    double calculatePerimeter() {
        return 2 * Math.PI * radius;
    }
}

class Rectangle extends Shape {
    double length, width;

    Rectangle(String color, double length, double width) {
        super(color);
        this.length = length;
        this.width = width;
    }

    @Override
    double calculateArea() {
        return length * width;
    }

    @Override
    double calculatePerimeter() {
        return 2 * (length + width);
    }
}

public class Main {
    public static void main(String[] args) {
        Shape circle = new Circle("Red", 5.0);
        Shape rectangle = new Rectangle("Blue", 10.0, 5.0);

        System.out.println("Circle:");
        circle.displayColor();
        System.out.println("Area: " + circle.calculateArea());
        System.out.println("Perimeter: " + circle.calculatePerimeter());

        System.out.println("\nRectangle:");
        rectangle.displayColor();
        System.out.println("Area: " + rectangle.calculateArea());
        System.out.println("Perimeter: " + rectangle.calculatePerimeter());
    }
}
```

## Key Points

✅ Abstract class can have both **abstract** and **concrete** methods
✅ Can't create objects of abstract class
✅ Child class **must implement** all abstract methods
✅ Can have **constructors** and **variables**
✅ Use when classes share common behavior but differ in implementation

## Quick Tips

💡 Use `abstract` keyword for abstract classes
💡 Abstract methods have **no body**
💡 Child class must implement **all** abstract methods
💡 Provides a **template** for child classes

---

**Previous:** [Encapsulation](./05-Encapsulation.md) | **Next:** [Interfaces](./07-Interfaces.md)
