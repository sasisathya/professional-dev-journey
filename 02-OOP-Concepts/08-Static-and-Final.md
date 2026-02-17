# Static and Final Keywords in Java

## The static Keyword

`static` means the member belongs to the **class itself**, not to any specific object.

### Static Variables

**Shared** by all objects of the class.

```java
class Student {
    String name;              // Instance variable (each object has its own)
    static String school = "ABC School";  // Static variable (shared by all)

    Student(String name) {
        this.name = name;
    }

    void display() {
        System.out.println("Name: " + name + ", School: " + school);
    }
}

public class Main {
    public static void main(String[] args) {
        Student s1 = new Student("Alice");
        Student s2 = new Student("Bob");

        s1.display();  // Name: Alice, School: ABC School
        s2.display();  // Name: Bob, School: ABC School

        // Change school (affects all students)
        Student.school = "XYZ School";

        s1.display();  // Name: Alice, School: XYZ School
        s2.display();  // Name: Bob, School: XYZ School
    }
}
```

### Static Methods

Can be called **without creating an object**.

```java
class Calculator {
    // Static method
    static int add(int a, int b) {
        return a + b;
    }

    static int multiply(int a, int b) {
        return a * b;
    }
}

public class Main {
    public static void main(String[] args) {
        // Call without creating object
        int sum = Calculator.add(10, 20);
        int product = Calculator.multiply(5, 4);

        System.out.println("Sum: " + sum);           // 30
        System.out.println("Product: " + product);   // 20
    }
}
```

### Static Block

Executes **once** when class is loaded.

```java
class Demo {
    static int count;

    // Static block
    static {
        count = 100;
        System.out.println("Static block executed");
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println(Demo.count);  // Static block executed, then 100
    }
}
```

### Real Example: Counter

```java
class Counter {
    static int count = 0;  // Shared counter

    Counter() {
        count++;
        System.out.println("Object " + count + " created");
    }

    static void showCount() {
        System.out.println("Total objects: " + count);
    }
}

public class Main {
    public static void main(String[] args) {
        new Counter();  // Object 1 created
        new Counter();  // Object 2 created
        new Counter();  // Object 3 created

        Counter.showCount();  // Total objects: 3
    }
}
```

## The final Keyword

`final` makes something **constant** (cannot be changed).

### Final Variables

```java
class Circle {
    final double PI = 3.14159;  // Constant

    double calculateArea(double radius) {
        // PI = 3.14;  // ERROR! Cannot change final variable
        return PI * radius * radius;
    }
}
```

### Final Methods

Cannot be **overridden** by child classes.

```java
class Parent {
    final void show() {
        System.out.println("This is final method");
    }
}

class Child extends Parent {
    // void show() { }  // ERROR! Cannot override final method
}
```

### Final Classes

Cannot be **extended** (no child classes).

```java
final class MathUtils {
    static int add(int a, int b) {
        return a + b;
    }
}

// class MyMath extends MathUtils { }  // ERROR! Cannot extend final class
```

### Final Parameters

```java
void display(final int num) {
    // num = 20;  // ERROR! Cannot modify final parameter
    System.out.println(num);
}
```

## static final - Constants

Combine for **class-level constants**.

```java
class MathConstants {
    static final double PI = 3.14159;
    static final double E = 2.71828;
    static final int MAX_VALUE = 100;
}

public class Main {
    public static void main(String[] args) {
        System.out.println("PI: " + MathConstants.PI);
        System.out.println("E: " + MathConstants.E);
        // MathConstants.PI = 3.14;  // ERROR! Cannot change
    }
}
```

## Quick Comparison

| Keyword | Purpose | Example |
|---------|---------|---------|
| **static variable** | Shared by all objects | `static int count;` |
| **static method** | Called without object | `static void show()` |
| **final variable** | Constant value | `final double PI = 3.14;` |
| **final method** | Cannot be overridden | `final void display()` |
| **final class** | Cannot be extended | `final class Utils` |

## Quick Tips

💡 Use `static` for class-level members
💡 Use `final` for constants
💡 Static methods can't access instance variables
💡 Final variables must be initialized
💡 Use UPPERCASE for `static final` constants

---

**Previous:** [Interfaces](./07-Interfaces.md) | **Next:** [Collections Framework](../03-Collections-Framework/01-Introduction.md)
