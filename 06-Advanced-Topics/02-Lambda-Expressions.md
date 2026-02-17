# Lambda Expressions in Java

## What are Lambda Expressions?

**Lambda expressions** are a short way to write **anonymous functions** (functions without a name).

Introduced in **Java 8**.

## Syntax

```java
(parameters) -> expression
// or
(parameters) -> { statements; }
```

## Without Lambda

```java
// Old way - Anonymous class
Runnable r = new Runnable() {
    @Override
    public void run() {
        System.out.println("Hello World!");
    }
};

new Thread(r).start();
```

## With Lambda

```java
// New way - Lambda
Runnable r = () -> System.out.println("Hello World!");

new Thread(r).start();

// Or inline
new Thread(() -> System.out.println("Hello World!")).start();
```

## Examples

### Example 1: No Parameters
```java
() -> System.out.println("Hello!")
```

### Example 2: One Parameter
```java
(x) -> x * x
// or
x -> x * x  // Parentheses optional for single parameter
```

### Example 3: Multiple Parameters
```java
(a, b) -> a + b
```

### Example 4: Multiple Statements
```java
(a, b) -> {
    int sum = a + b;
    return sum * 2;
}
```

## Real Example: List Operations

```java
import java.util.*;

public class LambdaDemo {
    public static void main(String[] args) {
        List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David");

        // Print all names - Old way
        for (String name : names) {
            System.out.println(name);
        }

        // Print all names - Lambda way
        names.forEach(name -> System.out.println(name));

        // Or even shorter
        names.forEach(System.out::println);
    }
}
```

## Real Example: Filtering

```java
import java.util.*;
import java.util.stream.*;

public class FilterDemo {
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

        // Filter even numbers
        List<Integer> evenNumbers = numbers.stream()
            .filter(n -> n % 2 == 0)
            .collect(Collectors.toList());

        System.out.println(evenNumbers);  // [2, 4, 6, 8, 10]
    }
}
```

## Real Example: Comparator

```java
import java.util.*;

public class SortDemo {
    public static void main(String[] args) {
        List<String> names = Arrays.asList("Charlie", "Alice", "David", "Bob");

        // Old way
        Collections.sort(names, new Comparator<String>() {
            public int compare(String a, String b) {
                return a.compareTo(b);
            }
        });

        // Lambda way
        Collections.sort(names, (a, b) -> a.compareTo(b));

        // Or even shorter (method reference)
        Collections.sort(names, String::compareTo);

        System.out.println(names);  // [Alice, Bob, Charlie, David]
    }
}
```

## Benefits

✅ **Less code** - More concise
✅ **Readable** - Easier to understand
✅ **Functional programming** - Treat functions as values
✅ **Better with streams** - Works great with Stream API

## Quick Tips

💡 Lambda can only be used with **functional interfaces** (interfaces with single abstract method)
💡 Use `->` (arrow operator)
💡 Parentheses optional for single parameter
💡 Curly braces optional for single expression
💡 Use method references (`::`for even shorter syntax

---

**Previous:** [Generics](./01-Generics.md) | **Next:** [Streams API](./03-Streams-API.md)
