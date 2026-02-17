# Inheritance in Java

## What is Inheritance?

**Inheritance** allows a class to **inherit** properties and methods from another class. It's like a child inheriting features from parents!

**Real-world example:** A Dog inherits features from Animal (both eat, sleep, breathe).

## Why Use Inheritance?

✅ **Code Reusability** - Write once, use in multiple classes
✅ **Organized Code** - Create hierarchies
✅ **Easy Maintenance** - Update in one place

## Basic Syntax

```java
class ParentClass {
    // properties and methods
}

class ChildClass extends ParentClass {
    // inherits from ParentClass
    // can add own properties and methods
}
```

## Simple Example

```java
// Parent class (Superclass)
class Animal {
    void eat() {
        System.out.println("This animal eats food");
    }

    void sleep() {
        System.out.println("This animal sleeps");
    }
}

// Child class (Subclass)
class Dog extends Animal {
    void bark() {
        System.out.println("Dog barks");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog dog = new Dog();
        dog.eat();    // Inherited from Animal
        dog.sleep();  // Inherited from Animal
        dog.bark();   // Own method
    }
}
```

**Output:**
```
This animal eats food
This animal sleeps
Dog barks
```

## Types of Inheritance

### 1. Single Inheritance
One child, one parent.

```java
class Vehicle {
    void move() {
        System.out.println("Vehicle is moving");
    }
}

class Car extends Vehicle {
    void honk() {
        System.out.println("Car is honking");
    }
}
```

### 2. Multilevel Inheritance
Chain of inheritance (grandparent → parent → child).

```java
class Animal {
    void breathe() {
        System.out.println("Breathing...");
    }
}

class Mammal extends Animal {
    void walk() {
        System.out.println("Walking...");
    }
}

class Dog extends Mammal {
    void bark() {
        System.out.println("Barking...");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog dog = new Dog();
        dog.breathe();  // From Animal
        dog.walk();     // From Mammal
        dog.bark();     // Own method
    }
}
```

### 3. Hierarchical Inheritance
Multiple children from one parent.

```java
class Animal {
    void eat() {
        System.out.println("Eating...");
    }
}

class Dog extends Animal {
    void bark() {
        System.out.println("Barking...");
    }
}

class Cat extends Animal {
    void meow() {
        System.out.println("Meowing...");
    }
}
```

**Note:** Java doesn't support **multiple inheritance** (one child from multiple parents directly) to avoid complexity.

## The super Keyword

`super` refers to the **parent class**.

### 1. Access Parent Methods
```java
class Animal {
    void display() {
        System.out.println("I am an animal");
    }
}

class Dog extends Animal {
    void display() {
        super.display();  // Call parent method
        System.out.println("I am a dog");
    }
}
```

### 2. Access Parent Variables
```java
class Parent {
    int value = 100;
}

class Child extends Parent {
    int value = 200;

    void show() {
        System.out.println("Child value: " + value);        // 200
        System.out.println("Parent value: " + super.value); // 100
    }
}
```

### 3. Call Parent Constructor
```java
class Animal {
    Animal() {
        System.out.println("Animal created");
    }
}

class Dog extends Animal {
    Dog() {
        super();  // Call parent constructor
        System.out.println("Dog created");
    }
}
```

## Method Overriding

Child class **redefines** a parent method with same signature.

```java
class Animal {
    void makeSound() {
        System.out.println("Animal makes a sound");
    }
}

class Dog extends Animal {
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
        Animal a1 = new Dog();
        Animal a2 = new Cat();

        a1.makeSound();  // Dog barks
        a2.makeSound();  // Cat meows
    }
}
```

## Real-World Example: Employee Management

```java
class Employee {
    String name;
    int id;
    double baseSalary;

    Employee(String name, int id, double baseSalary) {
        this.name = name;
        this.id = id;
        this.baseSalary = baseSalary;
    }

    void displayInfo() {
        System.out.println("ID: " + id);
        System.out.println("Name: " + name);
        System.out.println("Base Salary: $" + baseSalary);
    }

    double calculateSalary() {
        return baseSalary;
    }
}

class Manager extends Employee {
    double bonus;

    Manager(String name, int id, double baseSalary, double bonus) {
        super(name, id, baseSalary);
        this.bonus = bonus;
    }

    @Override
    double calculateSalary() {
        return baseSalary + bonus;
    }

    @Override
    void displayInfo() {
        super.displayInfo();
        System.out.println("Bonus: $" + bonus);
        System.out.println("Total Salary: $" + calculateSalary());
    }
}

class Developer extends Employee {
    String programmingLanguage;

    Developer(String name, int id, double baseSalary, String language) {
        super(name, id, baseSalary);
        this.programmingLanguage = language;
    }

    @Override
    void displayInfo() {
        super.displayInfo();
        System.out.println("Language: " + programmingLanguage);
    }
}

public class Main {
    public static void main(String[] args) {
        Manager m = new Manager("Alice", 101, 5000, 2000);
        Developer d = new Developer("Bob", 102, 4000, "Java");

        m.displayInfo();
        System.out.println();
        d.displayInfo();
    }
}
```

## Quick Tips

💡 Use `extends` keyword for inheritance
💡 Child inherits all **public** and **protected** members
💡 Child does NOT inherit **private** members
💡 Use `super` to access parent class
💡 Use `@Override` annotation for clarity
💡 Constructors are NOT inherited

---

**Previous:** [Constructors](./02-Constructors.md) | **Next:** [Polymorphism](./04-Polymorphism.md)
