# Variables in Java

## What is a Variable?

A **variable** is like a **container** that holds data. Think of it as a labeled box where you store information.

```
┌─────────────┐
│   age = 25  │  ← Variable named "age" holding value 25
└─────────────┘
```

## Declaring Variables

### Syntax:
```java
dataType variableName = value;
```

### Examples:
```java
int age = 25;              // Integer variable
double price = 99.99;      // Decimal variable
char grade = 'A';          // Character variable
boolean isActive = true;   // Boolean variable
String name = "John";      // String variable
```

## Variable Naming Rules

### ✅ Rules (Must Follow)

1. Must start with a **letter**, `$`, or `_`
2. Cannot start with a **number**
3. Cannot use **Java keywords** (like `int`, `class`, `public`)
4. **Case-sensitive** (`age` ≠ `Age`)
5. No **spaces** allowed

### ✅ Good Examples:
```java
int studentAge;
double _price;
String firstName;
int $salary;
boolean isValid2;
```

### ❌ Bad Examples:
```java
int 2students;    // Starts with number
double my-price;  // Contains hyphen
String class;     // Java keyword
boolean is valid; // Contains space
```

## Naming Conventions (Best Practices)

### 1. camelCase for Variables
First word lowercase, capitalize first letter of other words.

```java
int studentAge;           // ✅ Good
int studentage;           // ❌ Not recommended
int StudentAge;           // ❌ Wrong (should start lowercase)
```

### 2. Descriptive Names
Use meaningful names that describe what the variable holds.

```java
int age;                  // ✅ Clear
int a;                    // ❌ Not clear

double productPrice;      // ✅ Descriptive
double p;                 // ❌ Not descriptive
```

### 3. Constants (Final Variables)
Use UPPERCASE with underscores.

```java
final double PI = 3.14159;
final int MAX_STUDENTS = 100;
```

## Types of Variables

### 1. Local Variables
Declared **inside a method**. Only exists in that method.

```java
public class Example {
    public void myMethod() {
        int localVar = 10;  // Local variable
        System.out.println(localVar);
    }
    // localVar cannot be used here
}
```

### 2. Instance Variables
Declared **inside a class** but outside methods. Each object has its own copy.

```java
public class Student {
    String name;      // Instance variable
    int age;          // Instance variable

    public void display() {
        System.out.println(name + " is " + age + " years old");
    }
}
```

### 3. Static Variables
Declared with `static` keyword. **Shared by all objects** of the class.

```java
public class Counter {
    static int count = 0;  // Static variable (shared)

    public Counter() {
        count++;
    }
}
```

## Initializing Variables

### Option 1: Declare and Initialize Together
```java
int age = 25;
String name = "Alice";
```

### Option 2: Declare First, Initialize Later
```java
int age;           // Declaration
age = 25;          // Initialization

String name;
name = "Alice";
```

### Option 3: Declare Multiple Variables
```java
int x = 5, y = 10, z = 15;
String firstName = "John", lastName = "Doe";
```

## Variable Scope

**Scope** = Where a variable can be used

```java
public class ScopeExample {
    int instanceVar = 10;  // Scope: Entire class

    public void method1() {
        int localVar = 20;  // Scope: Only in method1
        System.out.println(instanceVar);  // ✅ Can access
        System.out.println(localVar);     // ✅ Can access
    }

    public void method2() {
        System.out.println(instanceVar);  // ✅ Can access
        System.out.println(localVar);     // ❌ ERROR! Cannot access
    }
}
```

## Final Variables (Constants)

Variables that **cannot be changed** after initialization.

```java
final int MAX_AGE = 100;
MAX_AGE = 150;  // ❌ ERROR! Cannot change final variable
```

### When to Use Final:
- Mathematical constants: `final double PI = 3.14159;`
- Configuration values: `final int MAX_USERS = 1000;`
- Values that should never change

## Variable Examples

```java
public class VariableDemo {
    // Instance variable
    String schoolName = "Java School";

    // Static variable
    static int totalStudents = 0;

    public static void main(String[] args) {
        // Local variables
        int studentAge = 20;
        String studentName = "Alice";
        double gpa = 3.8;
        boolean isPassed = true;

        // Using variables
        System.out.println("Name: " + studentName);
        System.out.println("Age: " + studentAge);
        System.out.println("GPA: " + gpa);
        System.out.println("Passed: " + isPassed);

        // Changing variable values
        studentAge = 21;  // Age increased
        gpa = 3.9;        // GPA improved

        System.out.println("\nAfter update:");
        System.out.println("Age: " + studentAge);
        System.out.println("GPA: " + gpa);

        // Final variable
        final double PI = 3.14159;
        System.out.println("PI: " + PI);
        // PI = 3.14;  // This would cause error
    }
}
```

**Output:**
```
Name: Alice
Age: 20
GPA: 3.8
Passed: true

After update:
Age: 21
GPA: 3.9
PI: 3.14159
```

## Variable Assignment

### Simple Assignment
```java
int x = 10;
int y = x;  // y now has value 10
```

### Chain Assignment
```java
int a, b, c;
a = b = c = 50;  // All three get value 50
```

### Swap Variables
```java
int a = 5, b = 10, temp;
temp = a;  // temp = 5
a = b;     // a = 10
b = temp;  // b = 5
// Now a = 10, b = 5
```

## Common Mistakes

❌ **Using before declaring:**
```java
System.out.println(age);  // ERROR!
int age = 25;
```

❌ **Using without initializing:**
```java
int age;
System.out.println(age);  // ERROR! Not initialized
```

❌ **Changing final variables:**
```java
final int MAX = 100;
MAX = 200;  // ERROR! Cannot change
```

✅ **Correct approach:**
```java
int age = 25;
System.out.println(age);  // Works!

final int MAX = 100;
System.out.println(MAX);  // Works! Not changing it
```

## Quick Tips

💡 Always initialize variables before using them
💡 Use meaningful variable names
💡 Follow camelCase naming convention
💡 Use `final` for values that shouldn't change
💡 Keep variable scope as small as possible

## Practice Exercise

Create a program with:
1. A variable for your name
2. A variable for your age
3. A variable for your height
4. A constant for your birth year
5. Print all values

```java
public class MyInfo {
    public static void main(String[] args) {
        // Your code here
    }
}
```

---

**Previous:** [Data Types](./02-Data-Types.md) | **Next:** [Operators](./04-Operators.md)
