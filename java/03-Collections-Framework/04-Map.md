# Map Interface in Java

## What is a Map?

A **Map** stores data in **key-value pairs**. Each key is unique and maps to exactly one value.

Think of it like a **dictionary** - word (key) and its definition (value)!

## HashMap

Most commonly used Map implementation.

```java
import java.util.HashMap;

public class HashMapDemo {
    public static void main(String[] args) {
        HashMap<String, Integer> ages = new HashMap<>();

        // Put key-value pairs
        ages.put("Alice", 25);
        ages.put("Bob", 30);
        ages.put("Charlie", 28);

        System.out.println(ages);  // {Alice=25, Bob=30, Charlie=28}

        // Get value by key
        int aliceAge = ages.get("Alice");
        System.out.println("Alice's age: " + aliceAge);  // 25

        // Update value
        ages.put("Alice", 26);  // Updates Alice's age
        System.out.println(ages);  // {Alice=26, Bob=30, Charlie=28}

        // Check if key exists
        boolean hasBob = ages.containsKey("Bob");
        System.out.println("Has Bob: " + hasBob);  // true

        // Check if value exists
        boolean hasAge30 = ages.containsValue(30);
        System.out.println("Has age 30: " + hasAge30);  // true

        // Remove
        ages.remove("Charlie");
        System.out.println(ages);  // {Alice=26, Bob=30}

        // Size
        System.out.println("Size: " + ages.size());  // 2
    }
}
```

## Iterating Over Map

```java
HashMap<String, Integer> scores = new HashMap<>();
scores.put("Math", 90);
scores.put("Science", 85);
scores.put("English", 88);

// Method 1: Iterate over keys
System.out.println("Method 1:");
for (String subject : scores.keySet()) {
    System.out.println(subject + ": " + scores.get(subject));
}

// Method 2: Iterate over entries
System.out.println("\nMethod 2:");
for (Map.Entry<String, Integer> entry : scores.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}

// Method 3: forEach (Java 8+)
System.out.println("\nMethod 3:");
scores.forEach((subject, score) -> System.out.println(subject + ": " + score));
```

## TreeMap

Stores entries in **sorted order** (by keys).

```java
import java.util.TreeMap;

public class TreeMapDemo {
    public static void main(String[] args) {
        TreeMap<String, Integer> map = new TreeMap<>();

        map.put("Zebra", 1);
        map.put("Apple", 2);
        map.put("Mango", 3);

        System.out.println(map);  // {Apple=2, Mango=3, Zebra=1} - Sorted by key!

        // First and last keys
        System.out.println("First key: " + map.firstKey());  // Apple
        System.out.println("Last key: " + map.lastKey());    // Zebra
    }
}
```

## LinkedHashMap

Maintains **insertion order**.

```java
import java.util.LinkedHashMap;

public class LinkedHashMapDemo {
    public static void main(String[] args) {
        LinkedHashMap<String, Integer> map = new LinkedHashMap<>();

        map.put("First", 1);
        map.put("Second", 2);
        map.put("Third", 3);

        System.out.println(map);  // {First=1, Second=2, Third=3} - Insertion order
    }
}
```

## Real Example: Phone Book

```java
import java.util.HashMap;

public class PhoneBook {
    public static void main(String[] args) {
        HashMap<String, String> phoneBook = new HashMap<>();

        // Add contacts
        phoneBook.put("Alice", "123-456-7890");
        phoneBook.put("Bob", "234-567-8901");
        phoneBook.put("Charlie", "345-678-9012");

        // Search for a contact
        String name = "Alice";
        if (phoneBook.containsKey(name)) {
            System.out.println(name + "'s phone: " + phoneBook.get(name));
        } else {
            System.out.println(name + " not found!");
        }

        // Display all contacts
        System.out.println("\nAll Contacts:");
        phoneBook.forEach((n, phone) -> System.out.println(n + ": " + phone));
    }
}
```

## Real Example: Word Counter

```java
import java.util.HashMap;

public class WordCounter {
    public static void main(String[] args) {
        String text = "apple banana apple orange banana apple";
        String[] words = text.split(" ");

        HashMap<String, Integer> wordCount = new HashMap<>();

        for (String word : words) {
            wordCount.put(word, wordCount.getOrDefault(word, 0) + 1);
        }

        System.out.println("Word frequencies:");
        wordCount.forEach((word, count) -> System.out.println(word + ": " + count));
    }
}
```

**Output:**
```
Word frequencies:
apple: 3
banana: 2
orange: 1
```

## Map Comparison

| Feature | HashMap | LinkedHashMap | TreeMap |
|---------|---------|---------------|---------|
| **Order** | No order | Insertion order | Sorted by key |
| **Speed** | Fastest | Medium | Slowest |
| **Null keys** | One null key | One null key | No null keys |
| **Use when** | Don't care about order | Need insertion order | Need sorted keys |

## Common Methods

| Method | Description |
|--------|-------------|
| `put(key, value)` | Add/update entry |
| `get(key)` | Get value by key |
| `remove(key)` | Remove entry |
| `containsKey(key)` | Check if key exists |
| `containsValue(value)` | Check if value exists |
| `size()` | Get number of entries |
| `keySet()` | Get all keys |
| `values()` | Get all values |
| `entrySet()` | Get all entries |

## Quick Tips

💡 Keys must be **unique**, values can duplicate
💡 Use **HashMap** for best performance
💡 Use **TreeMap** for sorted keys
💡 Use **getOrDefault()** to handle missing keys
💡 Cannot have duplicate keys (latest overwrites)

---

**Previous:** [Set Interface](./03-Set.md) | **Next:** [Queue Interface](./05-Queue.md)
