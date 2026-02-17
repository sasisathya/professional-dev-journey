# Introduction to Java

## What is Java?

Java is a **programming language** that helps us write instructions for computers. Think of it like teaching someone a recipe - you need to use words they understand, and Java is the language computers understand.

## Key Features

### 1. Simple
- Easy to learn and use
- Syntax is similar to English
- Removes complex features like pointers

### 2. Object-Oriented
- Everything in Java revolves around "objects"
- Objects are like real-world things (car, person, book)

### 3. Platform Independent
- **Write Once, Run Anywhere (WORA)**
- Code written on Windows works on Mac, Linux, etc.
- This happens because of JVM (Java Virtual Machine)

### 4. Secure
- No direct access to memory
- Built-in security features

### 5. Robust (Strong)
- Good error handling
- Automatic memory management (Garbage Collection)

## How Java Works

```
Java Code (.java file)
        ↓
Java Compiler (javac)
        ↓
Bytecode (.class file)
        ↓
JVM (Java Virtual Machine)
        ↓
Your Computer Runs It!
```

### The Process:
1. **Write Code**: You write code in a `.java` file
2. **Compile**: The compiler converts it to bytecode (`.class` file)
3. **Run**: JVM reads the bytecode and executes it

## Basic Structure of a Java Program

```java
// This is a simple Java program
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

### Breaking it Down:

- `public class HelloWorld` - Creates a class named HelloWorld
- `public static void main(String[] args)` - The starting point of the program
- `System.out.println()` - Prints text to the screen
- `//` - Used for comments (notes that computer ignores)

## Important Terms

| Term | Meaning |
|------|---------|
| **JDK** | Java Development Kit - Tools to write Java programs |
| **JRE** | Java Runtime Environment - Tools to run Java programs |
| **JVM** | Java Virtual Machine - Executes your program |
| **Bytecode** | Intermediate code that JVM understands |
| **Compiler** | Converts your code to bytecode |

## Your First Program

```java
public class Welcome {
    public static void main(String[] args) {
        System.out.println("Welcome to Java!");
        System.out.println("Let's learn programming!");
    }
}
```

**Output:**
```
Welcome to Java!
Let's learn programming!
```

## Key Points to Remember

✅ Java files must have `.java` extension
✅ Class name must match the file name
✅ Every program needs a `main` method to start
✅ Java is case-sensitive (`Hello` ≠ `hello`)
✅ Every statement ends with semicolon `;`

## Quick Quiz

1. What does WORA stand for?
2. What is the file extension for Java source code?
3. What converts Java code to bytecode?

**Answers:** 1) Write Once, Run Anywhere 2) .java 3) Java Compiler (javac)

---

**Next:** [Data Types](./02-Data-Types.md)
