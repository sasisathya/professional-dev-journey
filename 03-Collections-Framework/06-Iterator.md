# Iterator in Java

## What is an Iterator?

An **Iterator** is used to traverse (loop through) collections.

## Basic Usage

```java
import java.util.*;

public class IteratorDemo {
    public static void main(String[] args) {
        ArrayList<String> names = new ArrayList<>();
        names.add("Alice");
        names.add("Bob");
        names.add("Charlie");

        // Get iterator
        Iterator<String> iterator = names.iterator();

        // Traverse using iterator
        while (iterator.hasNext()) {
            String name = iterator.next();
            System.out.println(name);
        }
    }
}
```

## Remove While Iterating

```java
ArrayList<Integer> numbers = new ArrayList<>();
numbers.add(10);
numbers.add(20);
numbers.add(30);
numbers.add(40);

Iterator<Integer> it = numbers.iterator();
while (it.hasNext()) {
    int num = it.next();
    if (num == 20) {
        it.remove();  // Safe removal
    }
}

System.out.println(numbers);  // [10, 30, 40]
```

## Common Methods

| Method | Description |
|--------|-------------|
| `hasNext()` | Returns true if more elements |
| `next()` | Returns next element |
| `remove()` | Removes current element |

---

**Previous:** [Queue Interface](./05-Queue.md) | **Next:** [Exception Handling](../04-Exception-Handling/01-Introduction.md)
