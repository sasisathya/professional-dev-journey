# Constructors in Java

## What is a Constructor?

A **constructor** is a special method that **initializes objects** when they are created. It runs automatically when you use `new` keyword.

Think of it like **setting up** a new phone when you first buy it - the constructor does the initial setup!

## Why Use Constructors?

Instead of:
```java
Person person = new Person();
person.name = "Alice";  // Manual assignment
person.age = 25;
person.city = "New York";
```

Use constructor:
```java
Person person = new Person("Alice", 25, "New York");  // All at once!
```

## Constructor Syntax

```java
class ClassName {
    // Constructor
    ClassName() {
        // initialization code
    }
}
```

### Key Features:
- **Same name** as class
- **No return type** (not even void)
- Called **automatically** when object is created
- Used to **initialize** object

## Types of Constructors

```
Constructors
    ├── Default Constructor
    ├── No-Argument Constructor
    └── Parameterized Constructor
```

## 1. Default Constructor

If you don't create **any** constructor, Java provides a **default** constructor automatically.

```java
class Student {
    String name;
    int age;
}

public class Main {
    public static void main(String[] args) {
        Student s = new Student();  // Default constructor called
        System.out.println(s.name);  // null
        System.out.println(s.age);   // 0
    }
}
```

## 2. No-Argument Constructor

A constructor you create **without parameters**.

```java
class Student {
    String name;
    int age;

    // No-argument constructor
    Student() {
        name = "Unknown";
        age = 0;
        System.out.println("Student object created!");
    }
}

public class Main {
    public static void main(String[] args) {
        Student s = new Student();
        // Output: Student object created!
        System.out.println(s.name);  // Unknown
        System.out.println(s.age);   // 0
    }
}
```

## 3. Parameterized Constructor

A constructor **with parameters** to set initial values.

```java
class Student {
    String name;
    int age;

    // Parameterized constructor
    Student(String n, int a) {
        name = n;
        age = a;
    }

    void display() {
        System.out.println("Name: " + name + ", Age: " + age);
    }
}

public class Main {
    public static void main(String[] args) {
        Student s1 = new Student("Alice", 20);
        Student s2 = new Student("Bob", 22);

        s1.display();  // Name: Alice, Age: 20
        s2.display();  // Name: Bob, Age: 22
    }
}
```

## Constructor Overloading

Having **multiple constructors** with different parameters.

```java
class Book {
    String title;
    String author;
    int pages;

    // Constructor 1: No arguments
    Book() {
        title = "Unknown";
        author = "Unknown";
        pages = 0;
    }

    // Constructor 2: Title only
    Book(String t) {
        title = t;
        author = "Unknown";
        pages = 0;
    }

    // Constructor 3: All parameters
    Book(String t, String a, int p) {
        title = t;
        author = a;
        pages = p;
    }

    void display() {
        System.out.println("Title: " + title);
        System.out.println("Author: " + author);
        System.out.println("Pages: " + pages);
        System.out.println();
    }
}

public class Main {
    public static void main(String[] args) {
        Book book1 = new Book();
        Book book2 = new Book("Java Programming");
        Book book3 = new Book("Python Basics", "John Doe", 350);

        book1.display();
        book2.display();
        book3.display();
    }
}
```

**Output:**
```
Title: Unknown
Author: Unknown
Pages: 0

Title: Java Programming
Author: Unknown
Pages: 0

Title: Python Basics
Author: John Doe
Pages: 350
```

## Using 'this' in Constructors

Use `this` to **differentiate** between parameters and class variables.

```java
class Person {
    String name;
    int age;

    Person(String name, int age) {
        this.name = name;  // this.name = class variable
        this.age = age;    // name = parameter
    }

    void display() {
        System.out.println("Name: " + this.name);
        System.out.println("Age: " + this.age);
    }
}

public class Main {
    public static void main(String[] args) {
        Person p = new Person("Alice", 25);
        p.display();
    }
}
```

## Constructor Chaining

Calling **one constructor from another** using `this()`.

```java
class Rectangle {
    int length;
    int width;

    // Constructor 1: No parameters (default to square)
    Rectangle() {
        this(10, 10);  // Calls Constructor 3
    }

    // Constructor 2: One parameter (square)
    Rectangle(int side) {
        this(side, side);  // Calls Constructor 3
    }

    // Constructor 3: Two parameters
    Rectangle(int l, int w) {
        length = l;
        width = w;
    }

    void display() {
        System.out.println("Length: " + length + ", Width: " + width);
    }
}

public class Main {
    public static void main(String[] args) {
        Rectangle r1 = new Rectangle();
        Rectangle r2 = new Rectangle(15);
        Rectangle r3 = new Rectangle(20, 10);

        r1.display();  // Length: 10, Width: 10
        r2.display();  // Length: 15, Width: 15
        r3.display();  // Length: 20, Width: 10
    }
}
```

**Important:** `this()` must be the **first statement** in constructor!

## Real-World Examples

### Example 1: Bank Account
```java
class BankAccount {
    String accountNumber;
    String ownerName;
    double balance;

    // Constructor
    BankAccount(String accNum, String owner, double initialBalance) {
        accountNumber = accNum;
        ownerName = owner;
        balance = initialBalance;
        System.out.println("Account created for " + owner);
    }

    void displayInfo() {
        System.out.println("Account: " + accountNumber);
        System.out.println("Owner: " + ownerName);
        System.out.println("Balance: $" + balance);
    }
}

public class Main {
    public static void main(String[] args) {
        BankAccount acc1 = new BankAccount("12345", "Alice", 1000.0);
        BankAccount acc2 = new BankAccount("67890", "Bob", 5000.0);

        acc1.displayInfo();
        System.out.println();
        acc2.displayInfo();
    }
}
```

### Example 2: Student Registration
```java
class Student {
    String name;
    int rollNumber;
    String course;
    double fees;

    // Constructor for regular students
    Student(String name, int rollNumber, String course) {
        this.name = name;
        this.rollNumber = rollNumber;
        this.course = course;
        this.fees = 10000.0;  // Default fees
    }

    // Constructor for scholarship students
    Student(String name, int rollNumber, String course, double discount) {
        this.name = name;
        this.rollNumber = rollNumber;
        this.course = course;
        this.fees = 10000.0 - discount;
    }

    void displayInfo() {
        System.out.println("Name: " + name);
        System.out.println("Roll: " + rollNumber);
        System.out.println("Course: " + course);
        System.out.println("Fees: $" + fees);
        System.out.println();
    }
}

public class Main {
    public static void main(String[] args) {
        Student s1 = new Student("Alice", 101, "Java Programming");
        Student s2 = new Student("Bob", 102, "Python Basics", 3000.0);

        s1.displayInfo();
        s2.displayInfo();
    }
}
```

## Copy Constructor

Creates a **new object** as a copy of an existing object.

```java
class Point {
    int x, y;

    // Regular constructor
    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    // Copy constructor
    Point(Point p) {
        this.x = p.x;
        this.y = p.y;
    }

    void display() {
        System.out.println("Point(" + x + ", " + y + ")");
    }
}

public class Main {
    public static void main(String[] args) {
        Point p1 = new Point(10, 20);
        Point p2 = new Point(p1);  // Copy of p1

        p1.display();  // Point(10, 20)
        p2.display();  // Point(10, 20)

        p2.x = 30;
        p1.display();  // Point(10, 20) - unchanged
        p2.display();  // Point(30, 20) - changed
    }
}
```

## Default Values

If constructor doesn't initialize variables, Java uses default values:

| Type | Default Value |
|------|---------------|
| `int`, `byte`, `short`, `long` | `0` |
| `float`, `double` | `0.0` |
| `boolean` | `false` |
| `char` | `'\u0000'` |
| Objects (String, etc.) | `null` |

## Constructor vs Method

| Constructor | Method |
|-------------|--------|
| Same name as class | Any name |
| No return type | Has return type |
| Called automatically | Called manually |
| Used for initialization | Used for any operation |
| Can't be static | Can be static |

## Common Mistakes

❌ **Adding return type:**
```java
class Student {
    void Student() {  // ERROR! This is a method, not constructor
        // ...
    }
}
```

✅ **No return type:**
```java
class Student {
    Student() {  // Correct constructor
        // ...
    }
}
```

❌ **Wrong name:**
```java
class Student {
    student() {  // ERROR! Wrong name (lowercase)
        // ...
    }
}
```

✅ **Same as class name:**
```java
class Student {
    Student() {  // Correct!
        // ...
    }
}
```

❌ **this() not first statement:**
```java
Rectangle(int side) {
    System.out.println("Creating...");
    this(side, side);  // ERROR! Must be first
}
```

✅ **this() first:**
```java
Rectangle(int side) {
    this(side, side);  // Correct!
    System.out.println("Creating...");
}
```

## Quick Tips

💡 Constructor name **must match** class name exactly
💡 Constructor has **no return type** (not even void)
💡 Use `this` to avoid confusion with parameters
💡 Constructor overloading allows **flexibility**
💡 `this()` must be **first statement** in constructor
💡 Java provides default constructor only if you don't create any

## Practice Exercises

1. Create a `Car` class with constructors for different initialization scenarios
2. Create a `Circle` class with constructor chaining
3. Create an `Employee` class with multiple constructors
4. Create a copy constructor for a `Book` class

---

**Previous:** [Classes and Objects](./01-Classes-and-Objects.md) | **Next:** [Inheritance](./03-Inheritance.md)
