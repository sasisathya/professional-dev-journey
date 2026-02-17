# Set Interface in Java

## What is a Set?

A **Set** is a collection that contains **no duplicate elements**.

Think of it like a **bag of unique items** - you can't have two identical items!

## HashSet

Most commonly used Set. **No order guaranteed**.

```java
import java.util.HashSet;

public class HashSetDemo {
    public static void main(String[] args) {
        HashSet<String> fruits = new HashSet<>();

        // Add elements
        fruits.add("Apple");
        fruits.add("Banana");
        fruits.add("Orange");
        fruits.add("Apple");  // Duplicate - won't be added

        System.out.println(fruits);  // [Apple, Banana, Orange] - only 3 items

        // Check if contains
        System.out.println(fruits.contains("Apple"));  // true

        // Remove
        fruits.remove("Banana");
        System.out.println(fruits);  // [Apple, Orange]

        // Size
        System.out.println("Size: " + fruits.size());  // 2
    }
}
```

## TreeSet

Stores elements in **sorted order**.

```java
import java.util.TreeSet;

public class TreeSetDemo {
    public static void main(String[] args) {
        TreeSet<Integer> numbers = new TreeSet<>();

        numbers.add(50);
        numbers.add(20);
        numbers.add(80);
        numbers.add(10);

        System.out.println(numbers);  // [10, 20, 50, 80] - Automatically sorted!

        // First and last
        System.out.println("First: " + numbers.first());  // 10
        System.out.println("Last: " + numbers.last());    // 80

        // Elements less than 50
        System.out.println("Less than 50: " + numbers.headSet(50));  // [10, 20]
    }
}
```

## LinkedHashSet

Maintains **insertion order**.

```java
import java.util.LinkedHashSet;

public class LinkedHashSetDemo {
    public static void main(String[] args) {
        LinkedHashSet<String> colors = new LinkedHashSet<>();

        colors.add("Red");
        colors.add("Green");
        colors.add("Blue");

        System.out.println(colors);  // [Red, Green, Blue] - Insertion order maintained
    }
}
```

## Comparison

| Feature | HashSet | LinkedHashSet | TreeSet |
|---------|---------|---------------|---------|
| **Order** | No order | Insertion order | Sorted order |
| **Speed** | Fastest | Medium | Slowest |
| **Null** | One null allowed | One null allowed | No null |
| **Use when** | Don't care about order | Need insertion order | Need sorted data |

## Real Example: Remove Duplicates

```java
import java.util.*;

public class RemoveDuplicates {
    public static void main(String[] args) {
        // Array with duplicates
        Integer[] numbers = {5, 2, 8, 2, 5, 9, 1, 8};

        // Convert to Set (automatically removes duplicates)
        HashSet<Integer> uniqueNumbers = new HashSet<>(Arrays.asList(numbers));

        System.out.println("Original: " + Arrays.toString(numbers));
        System.out.println("Unique: " + uniqueNumbers);
    }
}
```

**Output:**
```
Original: [5, 2, 8, 2, 5, 9, 1, 8]
Unique: [1, 2, 5, 8, 9]
```

## Quick Tips

💡 Sets **don't allow duplicates**
💡 Use **HashSet** for best performance
💡 Use **TreeSet** when you need sorted data
💡 Use **LinkedHashSet** to maintain insertion order

---

**Previous:** [List Interface](./02-List.md) | **Next:** [Map Interface](./04-Map.md)
