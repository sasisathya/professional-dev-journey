# Polymorphism in Java

## What is Polymorphism?

**Polymorphism** means "many forms". One thing can take different forms.

**Real-world example:** A person can be a student, employee, customer - same person, different roles!

## Types of Polymorphism

```
Polymorphism
    ├── Compile-Time (Static) - Method Overloading
    └── Runtime (Dynamic) - Method Overriding
```

## 1. Method Overloading (Compile-Time)

**Same method name**, different parameters.

```java
class Calculator {
    // Method 1: Two integers
    int add(int a, int b) {
        return a + b;
    }

    // Method 2: Three integers
    int add(int a, int b, int c) {
        return a + b + c;
    }

    // Method 3: Two doubles
    double add(double a, double b) {
        return a + b;
    }
}

public class Main {
    public static void main(String[] args) {
        Calculator calc = new Calculator();

        System.out.println(calc.add(5, 10));         // 15
        System.out.println(calc.add(5, 10, 15));     // 30
        System.out.println(calc.add(5.5, 10.5));     // 16.0
    }
}
```

### Ways to Overload:
1. **Different number of parameters**
2. **Different types of parameters**
3. **Different order of parameters**

## 2. Method Overriding (Runtime)

Child class provides **specific implementation** of parent's method.

```java
class Animal {
    void makeSound() {
        System.out.println("Animal makes a sound");
    }
}

class Dog extends Animal {
    @Override
    void makeSound() {
        System.out.println("Dog barks: Woof!");
    }
}

class Cat extends Animal {
    @Override
    void makeSound() {
        System.out.println("Cat meows: Meow!");
    }
}

public class Main {
    public static void main(String[] args) {
        Animal myAnimal = new Animal();
        Animal myDog = new Dog();
        Animal myCat = new Cat();

        myAnimal.makeSound();  // Animal makes a sound
        myDog.makeSound();     // Dog barks: Woof!
        myCat.makeSound();     // Cat meows: Meow!
    }
}
```

## Real-World Example: Payment System

```java
class PaymentProcessor {
    void processPayment(double amount) {
        System.out.println("Processing payment: $" + amount);
    }
}

class CreditCardPayment extends PaymentProcessor {
    @Override
    void processPayment(double amount) {
        System.out.println("Processing Credit Card payment: $" + amount);
        System.out.println("Adding 2% processing fee");
    }
}

class PayPalPayment extends PaymentProcessor {
    @Override
    void processPayment(double amount) {
        System.out.println("Processing PayPal payment: $" + amount);
        System.out.println("Sending to PayPal gateway");
    }
}

class CashPayment extends PaymentProcessor {
    @Override
    void processPayment(double amount) {
        System.out.println("Processing Cash payment: $" + amount);
        System.out.println("No processing fee");
    }
}

public class Main {
    public static void main(String[] args) {
        PaymentProcessor payment1 = new CreditCardPayment();
        PaymentProcessor payment2 = new PayPalPayment();
        PaymentProcessor payment3 = new CashPayment();

        payment1.processPayment(100.0);
        System.out.println();
        payment2.processPayment(200.0);
        System.out.println();
        payment3.processPayment(50.0);
    }
}
```

## Quick Tips

💡 Overloading = Same name, different parameters
💡 Overriding = Same signature, different implementation
💡 Use `@Override` annotation for overriding
💡 Polymorphism enables flexible and maintainable code

---

**Previous:** [Inheritance](./03-Inheritance.md) | **Next:** [Encapsulation](./05-Encapsulation.md)
