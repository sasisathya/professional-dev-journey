# Classes and Objects in Java

## What is Object-Oriented Programming (OOP)?

**OOP** is a programming style that uses **objects** to organize code. Think of real-world objects like cars, phones, or people - they have properties and can do things.

## What is a Class?

A **class** is a **blueprint** or template for creating objects.

Think of it like:
- 🏗️ **Class = Blueprint** of a house
- 🏠 **Object = Actual house** built from that blueprint

```java
// Class - Blueprint
class Car {
    // Properties
    String color;
    String model;
    int year;

    // Behaviors
    void start() {
        System.out.println("Car is starting...");
    }

    void stop() {
        System.out.println("Car is stopping...");
    }
}
```

## What is an Object?

An **object** is an **instance** of a class. You can create many objects from one class.

```java
Car car1 = new Car();  // First car object
Car car2 = new Car();  // Second car object
```

## Creating a Class

### Syntax:
```java
class ClassName {
    // Variables (Fields/Properties)
    dataType variableName;

    // Methods (Functions/Behaviors)
    returnType methodName() {
        // code
    }
}
```

### Example:
```java
class Student {
    // Variables (Properties)
    String name;
    int age;
    String grade;

    // Method (Behavior)
    void study() {
        System.out.println(name + " is studying");
    }

    void displayInfo() {
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("Grade: " + grade);
    }
}
```

## Creating an Object

### Syntax:
```java
ClassName objectName = new ClassName();
```

### Example:
```java
Student student1 = new Student();
Student student2 = new Student();
```

### What happens:
1. `Student student1` - Declares a variable of type Student
2. `new Student()` - Creates a new Student object in memory
3. `=` - Assigns the object to the variable

## Accessing Class Members

Use **dot (.)** operator to access properties and methods.

```java
class Dog {
    String name;
    int age;

    void bark() {
        System.out.println(name + " is barking!");
    }
}

public class Main {
    public static void main(String[] args) {
        // Create object
        Dog dog1 = new Dog();

        // Set properties
        dog1.name = "Buddy";
        dog1.age = 3;

        // Access properties
        System.out.println("Dog's name: " + dog1.name);
        System.out.println("Dog's age: " + dog1.age);

        // Call method
        dog1.bark();  // Output: Buddy is barking!
    }
}
```

## Complete Example

```java
class Person {
    // Properties (Instance Variables)
    String name;
    int age;
    String city;

    // Method to display information
    void displayInfo() {
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("City: " + city);
    }

    // Method to greet
    void greet() {
        System.out.println("Hello! My name is " + name);
    }

    // Method with parameter
    void haveBirthday() {
        age++;
        System.out.println("Happy Birthday! Now " + age + " years old");
    }
}

public class Main {
    public static void main(String[] args) {
        // Create first person
        Person person1 = new Person();
        person1.name = "Alice";
        person1.age = 25;
        person1.city = "New York";

        // Create second person
        Person person2 = new Person();
        person2.name = "Bob";
        person2.age = 30;
        person2.city = "London";

        // Use person1
        person1.displayInfo();
        person1.greet();
        person1.haveBirthday();

        System.out.println();

        // Use person2
        person2.displayInfo();
        person2.greet();
    }
}
```

**Output:**
```
Name: Alice
Age: 25
City: New York
Hello! My name is Alice
Happy Birthday! Now 26 years old

Name: Bob
Age: 30
City: London
Hello! My name is Bob
```

## Methods with Parameters

Methods can accept **input values** (parameters).

```java
class Calculator {
    // Method with parameters
    void add(int a, int b) {
        int sum = a + b;
        System.out.println("Sum: " + sum);
    }

    void multiply(int a, int b) {
        int product = a * b;
        System.out.println("Product: " + product);
    }
}

public class Main {
    public static void main(String[] args) {
        Calculator calc = new Calculator();

        calc.add(10, 20);        // Sum: 30
        calc.multiply(5, 4);     // Product: 20
    }
}
```

## Methods with Return Values

Methods can **return** values.

```java
class Rectangle {
    int length;
    int width;

    // Method that returns a value
    int calculateArea() {
        return length * width;
    }

    int calculatePerimeter() {
        return 2 * (length + width);
    }
}

public class Main {
    public static void main(String[] args) {
        Rectangle rect = new Rectangle();
        rect.length = 10;
        rect.width = 5;

        int area = rect.calculateArea();
        int perimeter = rect.calculatePerimeter();

        System.out.println("Area: " + area);           // Area: 50
        System.out.println("Perimeter: " + perimeter); // Perimeter: 30
    }
}
```

## Multiple Objects

You can create **many objects** from one class, each with different values.

```java
class Book {
    String title;
    String author;
    int pages;

    void displayInfo() {
        System.out.println("Title: " + title);
        System.out.println("Author: " + author);
        System.out.println("Pages: " + pages);
        System.out.println();
    }
}

public class Main {
    public static void main(String[] args) {
        Book book1 = new Book();
        book1.title = "Java Programming";
        book1.author = "John Doe";
        book1.pages = 500;

        Book book2 = new Book();
        book2.title = "Python Basics";
        book2.author = "Jane Smith";
        book2.pages = 350;

        Book book3 = new Book();
        book3.title = "Web Development";
        book3.author = "Bob Johnson";
        book3.pages = 420;

        book1.displayInfo();
        book2.displayInfo();
        book3.displayInfo();
    }
}
```

## Real-World Examples

### Example 1: Bank Account
```java
class BankAccount {
    String accountNumber;
    String ownerName;
    double balance;

    void deposit(double amount) {
        balance += amount;
        System.out.println("Deposited: $" + amount);
        System.out.println("New balance: $" + balance);
    }

    void withdraw(double amount) {
        if (amount <= balance) {
            balance -= amount;
            System.out.println("Withdrawn: $" + amount);
            System.out.println("Remaining balance: $" + balance);
        } else {
            System.out.println("Insufficient balance!");
        }
    }

    void checkBalance() {
        System.out.println("Current balance: $" + balance);
    }
}

public class Main {
    public static void main(String[] args) {
        BankAccount account = new BankAccount();
        account.accountNumber = "123456";
        account.ownerName = "Alice";
        account.balance = 1000.0;

        account.checkBalance();
        account.deposit(500);
        account.withdraw(200);
        account.withdraw(2000);  // Insufficient balance!
    }
}
```

### Example 2: Student Grade System
```java
class Student {
    String name;
    int rollNumber;
    double[] marks = new double[5];

    void setMarks(double m1, double m2, double m3, double m4, double m5) {
        marks[0] = m1;
        marks[1] = m2;
        marks[2] = m3;
        marks[3] = m4;
        marks[4] = m5;
    }

    double calculateAverage() {
        double sum = 0;
        for (double mark : marks) {
            sum += mark;
        }
        return sum / marks.length;
    }

    char getGrade() {
        double avg = calculateAverage();
        if (avg >= 90) return 'A';
        else if (avg >= 80) return 'B';
        else if (avg >= 70) return 'C';
        else if (avg >= 60) return 'D';
        else return 'F';
    }

    void displayReport() {
        System.out.println("Student Name: " + name);
        System.out.println("Roll Number: " + rollNumber);
        System.out.println("Average Marks: " + calculateAverage());
        System.out.println("Grade: " + getGrade());
    }
}

public class Main {
    public static void main(String[] args) {
        Student student = new Student();
        student.name = "Alice";
        student.rollNumber = 101;
        student.setMarks(85, 90, 78, 92, 88);

        student.displayReport();
    }
}
```

## this Keyword

`this` refers to the **current object**.

```java
class Person {
    String name;
    int age;

    void setData(String name, int age) {
        this.name = name;  // this.name = class variable
        this.age = age;    // name = parameter
    }

    void display() {
        System.out.println("Name: " + this.name);
        System.out.println("Age: " + this.age);
    }
}
```

## Class vs Object

| Class | Object |
|-------|--------|
| Blueprint/Template | Instance of class |
| Defined once | Can create many |
| No memory allocated | Memory allocated |
| Example: `class Car { }` | Example: `Car car1 = new Car();` |

## Key Points

✅ **Class** = Blueprint (design)
✅ **Object** = Instance (actual thing)
✅ Objects have **properties** (variables) and **behaviors** (methods)
✅ Use **dot operator** to access members
✅ Can create **multiple objects** from one class
✅ Each object has its **own copy** of variables

## Common Mistakes

❌ **Accessing without creating object:**
```java
class Dog {
    void bark() {
        System.out.println("Woof!");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog.bark();  // ERROR! Need to create object first
    }
}
```

✅ **Create object first:**
```java
Dog dog = new Dog();
dog.bark();  // Correct!
```

❌ **Forgetting to initialize:**
```java
Dog dog;
dog.bark();  // ERROR! dog is null
```

✅ **Initialize with new:**
```java
Dog dog = new Dog();
dog.bark();  // Works!
```

## Quick Tips

💡 Class name should start with **uppercase** letter
💡 One class per file (usually)
💡 File name should match class name
💡 Use meaningful class names (noun)
💡 Use meaningful method names (verb)
💡 Initialize objects before using them

## Practice Exercises

1. Create a `Car` class with properties (brand, model, year) and methods (start, stop, displayInfo)
2. Create a `Circle` class with radius and methods to calculate area and circumference
3. Create an `Employee` class with salary calculation methods
4. Create a `Product` class for an online shopping system

---

**Previous:** [Strings](../01-Java-Basics/08-Strings.md) | **Next:** [Constructors](./02-Constructors.md)
