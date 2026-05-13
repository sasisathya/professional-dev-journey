# Throw and Throws in Java

## throw Keyword

Used to **manually throw an exception**.

### Syntax:
```java
throw new ExceptionType("Error message");
```

### Example:
```java
public class ThrowDemo {
    static void checkAge(int age) {
        if (age < 18) {
            throw new ArithmeticException("Age must be 18 or above!");
        } else {
            System.out.println("Access granted!");
        }
    }

    public static void main(String[] args) {
        checkAge(15);  // Throws exception
    }
}
```

## throws Keyword

Used to **declare** that a method can throw exceptions.

### Syntax:
```java
returnType methodName() throws ExceptionType1, ExceptionType2 {
    // code
}
```

### Example:
```java
import java.io.*;

public class ThrowsDemo {
    static void readFile() throws IOException {
        BufferedReader reader = new BufferedReader(new FileReader("file.txt"));
        String line = reader.readLine();
        System.out.println(line);
    }

    public static void main(String[] args) {
        try {
            readFile();
        } catch (IOException e) {
            System.out.println("File error: " + e.getMessage());
        }
    }
}
```

## throw vs throws

| Feature | throw | throws |
|---------|-------|--------|
| **Purpose** | Throw an exception | Declare exceptions |
| **Location** | Inside method body | Method signature |
| **Usage** | `throw new Exception()` | `void method() throws Exception` |
| **Count** | Single exception | Multiple exceptions |

## Real Example: Custom Validation

```java
class InvalidAgeException extends Exception {
    InvalidAgeException(String message) {
        super(message);
    }
}

public class ValidationDemo {
    static void validateAge(int age) throws InvalidAgeException {
        if (age < 0) {
            throw new InvalidAgeException("Age cannot be negative!");
        } else if (age < 18) {
            throw new InvalidAgeException("Must be 18 or older!");
        } else {
            System.out.println("Age is valid: " + age);
        }
    }

    public static void main(String[] args) {
        try {
            validateAge(15);
        } catch (InvalidAgeException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}
```

## Quick Tips

💡 Use `throw` to raise exceptions manually
💡 Use `throws` to declare exceptions in method signature
💡 Checked exceptions **must be declared** with throws
💡 Unchecked exceptions don't need throws declaration

---

**Previous:** [Try-Catch-Finally](./02-Try-Catch-Finally.md) | **Next:** [Custom Exceptions](./04-Custom-Exceptions.md)
