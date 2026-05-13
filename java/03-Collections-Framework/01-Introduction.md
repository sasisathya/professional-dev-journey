# Introduction to Collections Framework

## What is Collections Framework?

A **Collections Framework** is a set of classes and interfaces for storing and manipulating groups of data as a single unit.

Think of it as **specialized containers** for different storage needs!

## Why Use Collections?

Instead of arrays (fixed size), use collections for:
✅ **Dynamic size** - Grow and shrink automatically
✅ **Ready-to-use** data structures
✅ **Powerful methods** - Search, sort, manipulate easily
✅ **Type-safe** - With generics

## Collection Hierarchy

```
Collection (Interface)
    ├── List (Interface)
    │   ├── ArrayList
    │   ├── LinkedList
    │   └── Vector
    │
    ├── Set (Interface)
    │   ├── HashSet
    │   ├── LinkedHashSet
    │   └── TreeSet
    │
    └── Queue (Interface)
        ├── PriorityQueue
        └── LinkedList

Map (Interface) - Separate hierarchy
    ├── HashMap
    ├── LinkedHashMap
    └── TreeMap
```

## Main Interfaces

### 1. List
- Ordered collection
- **Allows duplicates**
- Access by **index**

### 2. Set
- **No duplicates**
- No guaranteed order (except LinkedHashSet, TreeSet)

### 3. Queue
- FIFO (First In First Out)
- Process elements in order

### 4. Map
- Key-Value pairs
- No duplicate keys

## Common Methods

All collections share these methods:

| Method | Description |
|--------|-------------|
| `add(element)` | Add element |
| `remove(element)` | Remove element |
| `size()` | Get size |
| `isEmpty()` | Check if empty |
| `contains(element)` | Check if contains |
| `clear()` | Remove all |

## Quick Example

```java
import java.util.*;

public class CollectionsDemo {
    public static void main(String[] args) {
        // ArrayList - Dynamic array
        List<String> fruits = new ArrayList<>();
        fruits.add("Apple");
        fruits.add("Banana");
        fruits.add("Orange");
        System.out.println("List: " + fruits);

        // HashSet - No duplicates
        Set<Integer> numbers = new HashSet<>();
        numbers.add(1);
        numbers.add(2);
        numbers.add(1);  // Duplicate, won't be added
        System.out.println("Set: " + numbers);

        // HashMap - Key-Value pairs
        Map<String, Integer> ages = new HashMap<>();
        ages.put("Alice", 25);
        ages.put("Bob", 30);
        System.out.println("Map: " + ages);
    }
}
```

## When to Use What?

| Need | Use |
|------|-----|
| Ordered list with duplicates | **ArrayList** |
| Frequent insertion/deletion | **LinkedList** |
| No duplicates | **HashSet** |
| Sorted unique elements | **TreeSet** |
| Key-value pairs | **HashMap** |
| Sorted key-value pairs | **TreeMap** |

---

**Previous:** [Static and Final](../02-OOP-Concepts/08-Static-and-Final.md) | **Next:** [List Interface](./02-List.md)
