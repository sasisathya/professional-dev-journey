# Data Types in Java

## What are Data Types?

Data types tell the computer **what kind of data** you're storing. Like containers of different sizes for different things!

## Types of Data Types

```
Data Types
    ├── Primitive (Basic Types)
    └── Non-Primitive (Reference Types)
```

## 1. Primitive Data Types

These are the **building blocks** - basic data types built into Java.

### Numeric Types

#### Integer Types (Whole Numbers)

| Type | Size | Range | Example |
|------|------|-------|---------|
| `byte` | 1 byte | -128 to 127 | `byte age = 25;` |
| `short` | 2 bytes | -32,768 to 32,767 | `short year = 2024;` |
| `int` | 4 bytes | -2 billion to 2 billion | `int population = 1000000;` |
| `long` | 8 bytes | Very large numbers | `long distance = 9876543210L;` |

```java
byte temperature = 30;
short studentsCount = 500;
int salary = 50000;
long worldPopulation = 8000000000L;  // Note the 'L' at end
```

#### Floating-Point Types (Decimal Numbers)

| Type | Size | Precision | Example |
|------|------|-----------|---------|
| `float` | 4 bytes | 6-7 decimal digits | `float price = 19.99f;` |
| `double` | 8 bytes | 15 decimal digits | `double pi = 3.14159265359;` |

```java
float height = 5.8f;           // Note the 'f' at end
double piValue = 3.14159265359;
```

### Character Type

| Type | Size | Description | Example |
|------|------|-------------|---------|
| `char` | 2 bytes | Single character | `char grade = 'A';` |

```java
char letter = 'J';
char symbol = '@';
char digit = '5';  // This is a character, not number
```

### Boolean Type

| Type | Size | Values | Example |
|------|------|--------|---------|
| `boolean` | 1 bit | `true` or `false` | `boolean isJavaFun = true;` |

```java
boolean isRaining = false;
boolean hasPassed = true;
boolean isAdult = age >= 18;
```

## 2. Non-Primitive Data Types

These are **created by programmers** and can hold multiple values or complex data.

### Common Examples:

- **String** - Stores text
- **Arrays** - Stores multiple values
- **Classes** - Custom types you create
- **Interfaces** - Special types for behavior

```java
String name = "John";           // Text
int[] numbers = {1, 2, 3, 4};   // Array of integers
```

## Difference Between Primitive and Non-Primitive

| Primitive | Non-Primitive |
|-----------|---------------|
| Store simple values | Store complex data |
| Fixed size | Size can vary |
| Start with lowercase | Start with uppercase |
| Cannot be `null` | Can be `null` |
| Example: `int`, `char` | Example: `String`, `Array` |

## Default Values

When you don't assign a value, Java uses defaults:

| Data Type | Default Value |
|-----------|---------------|
| `byte`, `short`, `int`, `long` | `0` |
| `float`, `double` | `0.0` |
| `char` | `'\u0000'` (null character) |
| `boolean` | `false` |
| Non-Primitive (Objects) | `null` |

## Examples with All Types

```java
public class DataTypesDemo {
    public static void main(String[] args) {
        // Integer types
        byte myByte = 100;
        short myShort = 5000;
        int myInt = 100000;
        long myLong = 15000000000L;

        // Floating-point types
        float myFloat = 5.75f;
        double myDouble = 19.99;

        // Character type
        char myChar = 'A';

        // Boolean type
        boolean myBoolean = true;

        // String (non-primitive)
        String myString = "Hello Java";

        // Printing all values
        System.out.println("Byte: " + myByte);
        System.out.println("Short: " + myShort);
        System.out.println("Int: " + myInt);
        System.out.println("Long: " + myLong);
        System.out.println("Float: " + myFloat);
        System.out.println("Double: " + myDouble);
        System.out.println("Char: " + myChar);
        System.out.println("Boolean: " + myBoolean);
        System.out.println("String: " + myString);
    }
}
```

## Type Casting

Converting one data type to another.

### Automatic (Implicit) Casting
**Smaller to Larger** - Happens automatically

```java
int myInt = 9;
double myDouble = myInt;  // int to double (automatic)
System.out.println(myDouble);  // Output: 9.0
```

### Manual (Explicit) Casting
**Larger to Smaller** - Must be done manually

```java
double myDouble = 9.78;
int myInt = (int) myDouble;  // double to int (manual)
System.out.println(myInt);   // Output: 9 (decimal part lost)
```

## Common Mistakes

❌ **Wrong:**
```java
int number = 10.5;  // Error: can't store decimal in int
long bigNumber = 9999999999;  // Error: need 'L' at end
float price = 19.99;  // Error: need 'f' at end
```

✅ **Correct:**
```java
double number = 10.5;
long bigNumber = 9999999999L;
float price = 19.99f;
```

## Quick Tips

💡 Use `int` for whole numbers (most common)
💡 Use `double` for decimal numbers (most common)
💡 Use `boolean` for yes/no decisions
💡 Use `char` for single characters
💡 Use `String` for text

## Practice Exercise

Try creating variables for:
1. Your age (use appropriate type)
2. Your height in meters (use appropriate type)
3. Your first name initial (use appropriate type)
4. Whether you like Java (use appropriate type)

---

**Previous:** [Introduction](./01-Introduction.md) | **Next:** [Variables](./03-Variables.md)
