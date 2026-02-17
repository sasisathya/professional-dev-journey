# List Interface in Java

## What is a List?

A **List** is an ordered collection that allows duplicates. Elements are accessed by **index** (position).

## ArrayList

Most commonly used List implementation. Like a **dynamic array**.

### Creating ArrayList

```java
import java.util.ArrayList;

ArrayList<String> fruits = new ArrayList<>();
ArrayList<Integer> numbers = new ArrayList<>();
```

### Common Operations

```java
import java.util.ArrayList;

public class ArrayListDemo {
    public static void main(String[] args) {
        ArrayList<String> fruits = new ArrayList<>();

        // Add elements
        fruits.add("Apple");
        fruits.add("Banana");
        fruits.add("Orange");
        System.out.println(fruits);  // [Apple, Banana, Orange]

        // Add at specific index
        fruits.add(1, "Mango");
        System.out.println(fruits);  // [Apple, Mango, Banana, Orange]

        // Get element
        String first = fruits.get(0);
        System.out.println("First: " + first);  // Apple

        // Update element
        fruits.set(0, "Grapes");
        System.out.println(fruits);  // [Grapes, Mango, Banana, Orange]

        // Remove element
        fruits.remove("Banana");
        fruits.remove(0);  // Remove by index
        System.out.println(fruits);  // [Mango, Orange]

        // Size
        System.out.println("Size: " + fruits.size());  // 2

        // Check if contains
        boolean hasMango = fruits.contains("Mango");
        System.out.println("Has Mango: " + hasMango);  // true

        // Clear all
        fruits.clear();
        System.out.println("After clear: " + fruits);  // []
    }
}
```

### Iterating ArrayList

```java
ArrayList<String> names = new ArrayList<>();
names.add("Alice");
names.add("Bob");
names.add("Charlie");

// Method 1: for loop
for (int i = 0; i < names.size(); i++) {
    System.out.println(names.get(i));
}

// Method 2: for-each loop
for (String name : names) {
    System.out.println(name);
}

// Method 3: forEach with lambda (Java 8+)
names.forEach(name -> System.out.println(name));
```

### Real Example: Student Management

```java
import java.util.ArrayList;

class Student {
    String name;
    int rollNumber;
    double marks;

    Student(String name, int rollNumber, double marks) {
        this.name = name;
        this.rollNumber = rollNumber;
        this.marks = marks;
    }

    @Override
    public String toString() {
        return "Student{name='" + name + "', roll=" + rollNumber + ", marks=" + marks + "}";
    }
}

public class StudentManagement {
    public static void main(String[] args) {
        ArrayList<Student> students = new ArrayList<>();

        // Add students
        students.add(new Student("Alice", 101, 85.5));
        students.add(new Student("Bob", 102, 90.0));
        students.add(new Student("Charlie", 103, 78.5));

        // Display all students
        System.out.println("All Students:");
        for (Student s : students) {
            System.out.println(s);
        }

        // Find student with highest marks
        Student topper = students.get(0);
        for (Student s : students) {
            if (s.marks > topper.marks) {
                topper = s;
            }
        }
        System.out.println("\nTopper: " + topper);
    }
}
```

## LinkedList

Better for **frequent insertions/deletions** in the middle.

```java
import java.util.LinkedList;

public class LinkedListDemo {
    public static void main(String[] args) {
        LinkedList<String> cities = new LinkedList<>();

        cities.add("New York");
        cities.add("London");
        cities.add("Tokyo");

        // Add at beginning
        cities.addFirst("Paris");

        // Add at end
        cities.addLast("Sydney");

        System.out.println(cities);  // [Paris, New York, London, Tokyo, Sydney]

        // Remove first and last
        cities.removeFirst();
        cities.removeLast();

        System.out.println(cities);  // [New York, London, Tokyo]
    }
}
```

## ArrayList vs LinkedList

| Feature | ArrayList | LinkedList |
|---------|-----------|------------|
| **Storage** | Dynamic array | Doubly linked nodes |
| **Access** | Fast (O(1)) | Slow (O(n)) |
| **Insert/Delete** | Slow (O(n)) | Fast (O(1)) |
| **Memory** | Less | More (stores references) |
| **Best for** | Access by index | Frequent modifications |

## Common Methods

| Method | Description |
|--------|-------------|
| `add(element)` | Add to end |
| `add(index, element)` | Add at position |
| `get(index)` | Get element |
| `set(index, element)` | Update element |
| `remove(index)` | Remove by index |
| `remove(object)` | Remove by value |
| `size()` | Get size |
| `contains(element)` | Check if exists |
| `indexOf(element)` | Find index |
| `clear()` | Remove all |

## Quick Tips

💡 Use **ArrayList** for most cases
💡 Use **LinkedList** for frequent insertions/deletions
💡 Lists maintain **insertion order**
💡 Lists allow **duplicates**
💡 Index starts at **0**

---

**Previous:** [Introduction](./01-Introduction.md) | **Next:** [Set Interface](./03-Set.md)
