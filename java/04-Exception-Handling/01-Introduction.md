# Introduction to Exception Handling

## What is an Exception?

An **exception** is an unexpected event that disrupts the normal flow of a program.

**Real-world example:** Trying to divide by zero, accessing a file that doesn't exist!

## Why Handle Exceptions?

✅ **Prevent crashes** - Keep program running
✅ **User-friendly** - Show helpful error messages
✅ **Debug easier** - Identify where errors occur
✅ **Clean code** - Separate error handling from main logic

## Types of Exceptions

```
Throwable
    ├── Error (Serious problems - don't catch)
    │   └── OutOfMemoryError, StackOverflowError
    │
    └── Exception
        ├── Checked Exceptions (Must handle)
        │   └── IOException, SQLException
        │
        └── Unchecked Exceptions (Runtime)
            └── NullPointerException, ArithmeticException
```

### 1. Checked Exceptions
Must be handled at **compile time**.
Examples: `IOException`, `SQLException`

### 2. Unchecked Exceptions
Occur at **runtime** (can handle optionally).
Examples: `NullPointerException`, `ArithmeticException`

## Common Exceptions

| Exception | When it Occurs |
|-----------|----------------|
| `ArithmeticException` | Division by zero |
| `NullPointerException` | Using null reference |
| `ArrayIndexOutOfBoundsException` | Invalid array index |
| `NumberFormatException` | Invalid number conversion |
| `FileNotFoundException` | File not found |
| `IOException` | Input/output operation failed |

## Without Exception Handling

```java
public class NoExceptionHandling {
    public static void main(String[] args) {
        int a = 10;
        int b = 0;
        int result = a / b;  // CRASH! ArithmeticException
        System.out.println("Result: " + result);  // Never executes
    }
}
```

**Output:**
```
Exception in thread "main" java.lang.ArithmeticException: / by zero
```

## With Exception Handling

```java
public class WithExceptionHandling {
    public static void main(String[] args) {
        int a = 10;
        int b = 0;

        try {
            int result = a / b;
            System.out.println("Result: " + result);
        } catch (ArithmeticException e) {
            System.out.println("Error: Cannot divide by zero!");
        }

        System.out.println("Program continues...");
    }
}
```

**Output:**
```
Error: Cannot divide by zero!
Program continues...
```

## Exception Handling Keywords

| Keyword | Purpose |
|---------|---------|
| `try` | Contains code that might throw exception |
| `catch` | Handles the exception |
| `finally` | Always executes (cleanup code) |
| `throw` | Manually throw an exception |
| `throws` | Declare that method can throw exception |

## Quick Tips

💡 Always handle exceptions to prevent crashes
💡 Use specific exception types when possible
💡 Provide meaningful error messages
💡 Don't catch exceptions you can't handle

---

**Previous:** [Iterator](../03-Collections-Framework/06-Iterator.md) | **Next:** [Try-Catch-Finally](./02-Try-Catch-Finally.md)
