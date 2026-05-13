# Arrays in Java

## What is an Array?

An **array** is a container that holds **multiple values** of the same type.

Think of it like a **row of boxes**, each holding one item.

```
Array: [10] [20] [30] [40] [50]
Index:  0    1    2    3    4
```

## Why Use Arrays?

Instead of:
```java
int student1 = 85;
int student2 = 90;
int student3 = 78;
int student4 = 92;
int student5 = 88;
```

Use array:
```java
int[] marks = {85, 90, 78, 92, 88};
```

## Declaring Arrays

### Method 1: Declare and Initialize
```java
int[] numbers = {1, 2, 3, 4, 5};
String[] names = {"Alice", "Bob", "Charlie"};
double[] prices = {19.99, 29.99, 39.99};
```

### Method 2: Declare, Create, then Assign
```java
int[] numbers;           // Declare
numbers = new int[5];    // Create with size 5
numbers[0] = 10;         // Assign values
numbers[1] = 20;
```

### Method 3: Declare and Create Together
```java
int[] numbers = new int[5];  // Creates array of size 5 with default values (0)
```

## Accessing Array Elements

Use **index** (position) to access elements. **Index starts at 0!**

```java
int[] numbers = {10, 20, 30, 40, 50};

System.out.println(numbers[0]);  // 10 (first element)
System.out.println(numbers[1]);  // 20 (second element)
System.out.println(numbers[4]);  // 50 (fifth element)
```

### Index Diagram:
```
Array:  [10] [20] [30] [40] [50]
Index:   0    1    2    3    4
```

## Modifying Array Elements

```java
int[] numbers = {10, 20, 30, 40, 50};

numbers[0] = 15;  // Change first element
numbers[2] = 35;  // Change third element

System.out.println(numbers[0]);  // 15
System.out.println(numbers[2]);  // 35
```

## Array Length

Use `.length` to get the size of array.

```java
int[] numbers = {10, 20, 30, 40, 50};
System.out.println(numbers.length);  // 5

String[] names = {"Alice", "Bob"};
System.out.println(names.length);  // 2
```

## Looping Through Arrays

### Method 1: for Loop
```java
int[] numbers = {10, 20, 30, 40, 50};

for (int i = 0; i < numbers.length; i++) {
    System.out.println(numbers[i]);
}
```

### Method 2: for-each Loop (Easier!)
```java
int[] numbers = {10, 20, 30, 40, 50};

for (int num : numbers) {
    System.out.println(num);
}
```

## Common Array Operations

### 1. Find Sum
```java
int[] numbers = {10, 20, 30, 40, 50};
int sum = 0;

for (int num : numbers) {
    sum += num;
}
System.out.println("Sum: " + sum);  // 150
```

### 2. Find Average
```java
int[] numbers = {10, 20, 30, 40, 50};
int sum = 0;

for (int num : numbers) {
    sum += num;
}
double average = (double) sum / numbers.length;
System.out.println("Average: " + average);  // 30.0
```

### 3. Find Maximum
```java
int[] numbers = {45, 23, 67, 12, 89};
int max = numbers[0];

for (int num : numbers) {
    if (num > max) {
        max = num;
    }
}
System.out.println("Maximum: " + max);  // 89
```

### 4. Find Minimum
```java
int[] numbers = {45, 23, 67, 12, 89};
int min = numbers[0];

for (int num : numbers) {
    if (num < min) {
        min = num;
    }
}
System.out.println("Minimum: " + min);  // 12
```

### 5. Search for Element
```java
int[] numbers = {10, 20, 30, 40, 50};
int searchFor = 30;
boolean found = false;

for (int num : numbers) {
    if (num == searchFor) {
        found = true;
        break;
    }
}

if (found) {
    System.out.println(searchFor + " found!");
} else {
    System.out.println(searchFor + " not found!");
}
```

## Multidimensional Arrays

### 2D Arrays (Array of Arrays)

Think of it like a **table** with rows and columns.

```java
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};
```

**Visual representation:**
```
[1] [2] [3]
[4] [5] [6]
[7] [8] [9]
```

### Accessing 2D Array:
```java
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6}
};

System.out.println(matrix[0][0]);  // 1 (row 0, col 0)
System.out.println(matrix[0][2]);  // 3 (row 0, col 2)
System.out.println(matrix[1][1]);  // 5 (row 1, col 1)
```

### Looping Through 2D Array:
```java
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        System.out.print(matrix[i][j] + " ");
    }
    System.out.println();
}
```

**Output:**
```
1 2 3
4 5 6
7 8 9
```

## Array Utilities (Arrays Class)

Java provides `Arrays` class with helpful methods.

```java
import java.util.Arrays;
```

### 1. Print Array
```java
int[] numbers = {5, 2, 8, 1, 9};
System.out.println(Arrays.toString(numbers));
// Output: [5, 2, 8, 1, 9]
```

### 2. Sort Array
```java
int[] numbers = {5, 2, 8, 1, 9};
Arrays.sort(numbers);
System.out.println(Arrays.toString(numbers));
// Output: [1, 2, 5, 8, 9]
```

### 3. Fill Array
```java
int[] numbers = new int[5];
Arrays.fill(numbers, 10);
System.out.println(Arrays.toString(numbers));
// Output: [10, 10, 10, 10, 10]
```

### 4. Copy Array
```java
int[] original = {1, 2, 3, 4, 5};
int[] copy = Arrays.copyOf(original, original.length);
System.out.println(Arrays.toString(copy));
// Output: [1, 2, 3, 4, 5]
```

### 5. Compare Arrays
```java
int[] arr1 = {1, 2, 3};
int[] arr2 = {1, 2, 3};
boolean isEqual = Arrays.equals(arr1, arr2);
System.out.println(isEqual);  // true
```

### 6. Search in Sorted Array
```java
int[] numbers = {1, 3, 5, 7, 9};
int index = Arrays.binarySearch(numbers, 5);
System.out.println("Found at index: " + index);  // 2
```

## Real-World Examples

### Example 1: Student Marks System
```java
public class StudentMarks {
    public static void main(String[] args) {
        String[] students = {"Alice", "Bob", "Charlie", "David"};
        int[] marks = {85, 92, 78, 88};

        System.out.println("Student Report:");
        for (int i = 0; i < students.length; i++) {
            System.out.println(students[i] + ": " + marks[i]);
        }

        // Calculate average
        int sum = 0;
        for (int mark : marks) {
            sum += mark;
        }
        double average = (double) sum / marks.length;
        System.out.println("\nClass Average: " + average);
    }
}
```

### Example 2: Temperature Tracker
```java
public class WeeklyTemperature {
    public static void main(String[] args) {
        String[] days = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        double[] temps = {22.5, 23.0, 24.5, 21.0, 20.5, 25.0, 26.5};

        // Print temperatures
        System.out.println("Weekly Temperature:");
        for (int i = 0; i < days.length; i++) {
            System.out.println(days[i] + ": " + temps[i] + "°C");
        }

        // Find hottest day
        double maxTemp = temps[0];
        int maxIndex = 0;
        for (int i = 1; i < temps.length; i++) {
            if (temps[i] > maxTemp) {
                maxTemp = temps[i];
                maxIndex = i;
            }
        }
        System.out.println("\nHottest day: " + days[maxIndex] + " (" + maxTemp + "°C)");
    }
}
```

### Example 3: Shopping Cart
```java
public class ShoppingCart {
    public static void main(String[] args) {
        String[] items = {"Laptop", "Mouse", "Keyboard", "Monitor"};
        double[] prices = {799.99, 25.99, 49.99, 299.99};

        System.out.println("Shopping Cart:");
        double total = 0;

        for (int i = 0; i < items.length; i++) {
            System.out.println(items[i] + " - $" + prices[i]);
            total += prices[i];
        }

        System.out.println("\nTotal: $" + total);
    }
}
```

## Common Mistakes

❌ **Index Out of Bounds:**
```java
int[] numbers = {10, 20, 30};
System.out.println(numbers[3]);  // ERROR! Index 3 doesn't exist
```

✅ **Correct:**
```java
int[] numbers = {10, 20, 30};
System.out.println(numbers[2]);  // OK! Last index is 2
```

❌ **Comparing arrays with ==:**
```java
int[] arr1 = {1, 2, 3};
int[] arr2 = {1, 2, 3};
System.out.println(arr1 == arr2);  // false (compares references, not values)
```

✅ **Use Arrays.equals():**
```java
System.out.println(Arrays.equals(arr1, arr2));  // true
```

❌ **Forgetting array size is fixed:**
```java
int[] arr = new int[3];
arr[5] = 10;  // ERROR! Can't expand array
```

## Default Values

When you create an array without assigning values:

| Type | Default Value |
|------|---------------|
| `int`, `byte`, `short`, `long` | `0` |
| `float`, `double` | `0.0` |
| `boolean` | `false` |
| `char` | `'\u0000'` |
| Objects (String, etc.) | `null` |

```java
int[] numbers = new int[3];
// numbers = [0, 0, 0]

boolean[] flags = new boolean[2];
// flags = [false, false]

String[] names = new String[2];
// names = [null, null]
```

## Quick Tips

💡 Array index starts at **0**, not 1
💡 Use `.length` to get array size
💡 Use for-each loop when you don't need index
💡 Arrays have fixed size (can't grow or shrink)
💡 Use `Arrays.toString()` to print array easily
💡 Remember to import `java.util.Arrays` for utility methods

## Practice Exercises

1. Create an array of 5 numbers and print the sum
2. Find the second largest number in an array
3. Reverse an array
4. Count how many even and odd numbers in an array
5. Create a 3x3 matrix and print it
6. Merge two arrays into one

---

**Previous:** [Loops](./06-Loops.md) | **Next:** [Strings](./08-Strings.md)
