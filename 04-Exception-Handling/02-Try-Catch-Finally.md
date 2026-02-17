# Try-Catch-Finally in Java

## try-catch Block

```java
try {
    // Code that might throw exception
} catch (ExceptionType e) {
    // Handle exception
}
```

## Simple Example

```java
public class TryCatchDemo {
    public static void main(String[] args) {
        try {
            int result = 10 / 0;  // Will throw ArithmeticException
            System.out.println(result);
        } catch (ArithmeticException e) {
            System.out.println("Cannot divide by zero!");
        }

        System.out.println("Program continues...");
    }
}
```

## Multiple catch Blocks

```java
public class MultipleCatch {
    public static void main(String[] args) {
        try {
            int[] numbers = {1, 2, 3};
            System.out.println(numbers[5]);  // ArrayIndexOutOfBoundsException
        } catch (ArithmeticException e) {
            System.out.println("Arithmetic error!");
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Array index error!");
        } catch (Exception e) {
            System.out.println("Some error occurred!");
        }
    }
}
```

## finally Block

**Always executes**, whether exception occurs or not. Used for cleanup.

```java
public class FinallyDemo {
    public static void main(String[] args) {
        try {
            int result = 10 / 0;
        } catch (ArithmeticException e) {
            System.out.println("Exception caught!");
        } finally {
            System.out.println("Finally block always executes!");
        }
    }
}
```

**Output:**
```
Exception caught!
Finally block always executes!
```

## Real Example: File Handling

```java
import java.io.*;

public class FileExample {
    public static void main(String[] args) {
        BufferedReader reader = null;

        try {
            reader = new BufferedReader(new FileReader("file.txt"));
            String line = reader.readLine();
            System.out.println(line);
        } catch (FileNotFoundException e) {
            System.out.println("File not found!");
        } catch (IOException e) {
            System.out.println("Error reading file!");
        } finally {
            try {
                if (reader != null) {
                    reader.close();  // Cleanup
                }
            } catch (IOException e) {
                System.out.println("Error closing file!");
            }
            System.out.println("Resource cleanup done");
        }
    }
}
```

## try-with-resources (Java 7+)

Automatically closes resources.

```java
public class TryWithResources {
    public static void main(String[] args) {
        try (BufferedReader reader = new BufferedReader(new FileReader("file.txt"))) {
            String line = reader.readLine();
            System.out.println(line);
        } catch (IOException e) {
            System.out.println("Error: " + e.getMessage());
        }
        // reader automatically closed!
    }
}
```

## Getting Exception Information

```java
try {
    int result = 10 / 0;
} catch (ArithmeticException e) {
    System.out.println("Message: " + e.getMessage());
    System.out.println("String: " + e.toString());
    e.printStackTrace();  // Print full stack trace
}
```

## Quick Tips

💡 Use `finally` for cleanup code
💡 Catch **specific exceptions** before general ones
💡 Use **try-with-resources** for auto-cleanup
💡 `finally` runs even if `return` in try/catch

---

**Previous:** [Introduction](./01-Introduction.md) | **Next:** [Throw and Throws](./03-Throw-and-Throws.md)
