# Streams API in Java

## What is Stream API?

**Streams** provide a way to process collections in a **functional style**.

Introduced in **Java 8**.

Think of it like a **pipeline** for data processing!

## Creating Streams

```java
import java.util.*;
import java.util.stream.*;

List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

// Create stream
Stream<Integer> stream = numbers.stream();
```

## Common Operations

### 1. filter() - Select Elements

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

List<Integer> evenNumbers = numbers.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());

System.out.println(evenNumbers);  // [2, 4, 6, 8, 10]
```

### 2. map() - Transform Elements

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

List<Integer> squared = numbers.stream()
    .map(n -> n * n)
    .collect(Collectors.toList());

System.out.println(squared);  // [1, 4, 9, 16, 25]
```

### 3. sorted() - Sort Elements

```java
List<Integer> numbers = Arrays.asList(5, 2, 8, 1, 9);

List<Integer> sorted = numbers.stream()
    .sorted()
    .collect(Collectors.toList());

System.out.println(sorted);  // [1, 2, 5, 8, 9]
```

### 4. forEach() - Iterate

```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");

names.stream()
    .forEach(name -> System.out.println(name));
```

### 5. reduce() - Combine Elements

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

int sum = numbers.stream()
    .reduce(0, (a, b) -> a + b);

System.out.println("Sum: " + sum);  // 15
```

### 6. count() - Count Elements

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

long count = numbers.stream()
    .filter(n -> n > 5)
    .count();

System.out.println("Count: " + count);  // 5
```

## Chaining Operations

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

List<Integer> result = numbers.stream()
    .filter(n -> n % 2 == 0)      // Get even numbers
    .map(n -> n * n)               // Square them
    .sorted()                      // Sort
    .collect(Collectors.toList()); // Collect to list

System.out.println(result);  // [4, 16, 36, 64, 100]
```

## Real Example: Student Processing

```java
import java.util.*;
import java.util.stream.*;

class Student {
    String name;
    int marks;

    Student(String name, int marks) {
        this.name = name;
        this.marks = marks;
    }

    public String toString() {
        return name + ": " + marks;
    }
}

public class StudentStream {
    public static void main(String[] args) {
        List<Student> students = Arrays.asList(
            new Student("Alice", 85),
            new Student("Bob", 72),
            new Student("Charlie", 90),
            new Student("David", 65),
            new Student("Eve", 78)
        );

        // Students with marks > 75
        System.out.println("Students with marks > 75:");
        students.stream()
            .filter(s -> s.marks > 75)
            .forEach(System.out::println);

        // Average marks
        double average = students.stream()
            .mapToInt(s -> s.marks)
            .average()
            .orElse(0.0);
        System.out.println("\nAverage marks: " + average);

        // Top scorer
        Optional<Student> topScorer = students.stream()
            .max((s1, s2) -> Integer.compare(s1.marks, s2.marks));
        System.out.println("\nTop scorer: " + topScorer.get());
    }
}
```

## Terminal vs Intermediate Operations

### Intermediate (Return Stream)
- `filter()`
- `map()`
- `sorted()`
- `distinct()`
- `limit()`

### Terminal (Return Result)
- `collect()`
- `forEach()`
- `count()`
- `reduce()`
- `min()`, `max()`
- `findFirst()`, `findAny()`

## Benefits

✅ **Concise code** - Less boilerplate
✅ **Readable** - Clear intent
✅ **Functional style** - Declarative programming
✅ **Lazy evaluation** - Efficient processing
✅ **Parallel processing** - Easy parallelization

## Quick Tips

💡 Streams are **not data structures**, they process data
💡 Streams are **lazy** - operations only execute when needed
💡 Use **collect()** to convert stream back to collection
💡 Streams can be used **only once**
💡 Use **parallelStream()** for parallel processing

---

**Previous:** [Lambda Expressions](./02-Lambda-Expressions.md) | **Next:** [File I/O](./04-File-IO.md)
