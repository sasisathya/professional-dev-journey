# Loops in Java

## What are Loops?

**Loops** repeat a block of code multiple times. Instead of writing the same code again and again, use loops!

Think of it like: "Do this task 10 times" or "Keep doing this until I say stop"

## Types of Loops

```
Loops
    ├── for loop
    ├── while loop
    ├── do-while loop
    └── for-each loop (enhanced for loop)
```

## 1. for Loop

Use when you know **exactly how many times** to repeat.

### Syntax:
```java
for (initialization; condition; update) {
    // code to repeat
}
```

### Example:
```java
for (int i = 1; i <= 5; i++) {
    System.out.println("Count: " + i);
}
```

**Output:**
```
Count: 1
Count: 2
Count: 3
Count: 4
Count: 5
```

### How it works:
1. **Initialization**: `int i = 1` (runs once)
2. **Condition**: `i <= 5` (checked before each iteration)
3. **Code Block**: Execute the code
4. **Update**: `i++` (runs after each iteration)
5. **Repeat** from step 2

### More Examples:
```java
// Print numbers 1 to 10
for (int i = 1; i <= 10; i++) {
    System.out.println(i);
}

// Print even numbers from 0 to 20
for (int i = 0; i <= 20; i += 2) {
    System.out.println(i);
}

// Countdown from 10 to 1
for (int i = 10; i >= 1; i--) {
    System.out.println(i);
}
```

## 2. while Loop

Use when you **don't know** how many times to repeat. Continues while condition is true.

### Syntax:
```java
while (condition) {
    // code to repeat
}
```

### Example:
```java
int count = 1;

while (count <= 5) {
    System.out.println("Count: " + count);
    count++;
}
```

**Output:**
```
Count: 1
Count: 2
Count: 3
Count: 4
Count: 5
```

### More Examples:
```java
// Keep asking until user enters correct password
String password = "";
Scanner scanner = new Scanner(System.in);

while (!password.equals("java123")) {
    System.out.print("Enter password: ");
    password = scanner.nextLine();
}
System.out.println("Access granted!");

// Sum numbers until total reaches 100
int sum = 0;
int num = 1;

while (sum < 100) {
    sum += num;
    num++;
}
System.out.println("Sum: " + sum);
```

## 3. do-while Loop

Similar to while, but executes **at least once** (checks condition at the end).

### Syntax:
```java
do {
    // code to repeat
} while (condition);
```

### Example:
```java
int count = 1;

do {
    System.out.println("Count: " + count);
    count++;
} while (count <= 5);
```

### Difference from while:
```java
// This while loop doesn't run (condition is false from start)
int i = 10;
while (i < 5) {
    System.out.println(i);  // Never prints
}

// This do-while runs once (checks condition after)
int j = 10;
do {
    System.out.println(j);  // Prints 10 once
} while (j < 5);
```

### Real Example - Menu:
```java
int choice;
Scanner scanner = new Scanner(System.in);

do {
    System.out.println("1. Add");
    System.out.println("2. Subtract");
    System.out.println("3. Exit");
    System.out.print("Enter choice: ");
    choice = scanner.nextInt();
} while (choice != 3);
```

## 4. for-each Loop (Enhanced for Loop)

Used to iterate through **arrays** and **collections**. Simpler syntax!

### Syntax:
```java
for (dataType variable : array) {
    // code
}
```

### Example:
```java
int[] numbers = {1, 2, 3, 4, 5};

for (int num : numbers) {
    System.out.println(num);
}
```

**Output:**
```
1
2
3
4
5
```

### More Examples:
```java
// Array of strings
String[] fruits = {"Apple", "Banana", "Orange"};

for (String fruit : fruits) {
    System.out.println(fruit);
}

// Calculate sum
int[] numbers = {10, 20, 30, 40, 50};
int sum = 0;

for (int num : numbers) {
    sum += num;
}
System.out.println("Sum: " + sum);  // Output: 150
```

## Loop Control Statements

### break Statement
**Exits** the loop immediately.

```java
for (int i = 1; i <= 10; i++) {
    if (i == 5) {
        break;  // Stop when i is 5
    }
    System.out.println(i);
}
// Output: 1 2 3 4
```

### continue Statement
**Skips** current iteration and continues with next.

```java
for (int i = 1; i <= 5; i++) {
    if (i == 3) {
        continue;  // Skip 3
    }
    System.out.println(i);
}
// Output: 1 2 4 5
```

### Example: Print only even numbers
```java
for (int i = 1; i <= 10; i++) {
    if (i % 2 != 0) {
        continue;  // Skip odd numbers
    }
    System.out.println(i);
}
// Output: 2 4 6 8 10
```

## Nested Loops

A **loop inside another loop**.

### Example - Multiplication Table:
```java
for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= 3; j++) {
        System.out.print(i * j + " ");
    }
    System.out.println();
}
```

**Output:**
```
1 2 3
2 4 6
3 6 9
```

### Example - Pattern:
```java
for (int i = 1; i <= 5; i++) {
    for (int j = 1; j <= i; j++) {
        System.out.print("* ");
    }
    System.out.println();
}
```

**Output:**
```
*
* *
* * *
* * * *
* * * * *
```

## Which Loop to Use?

| Loop | When to Use | Example |
|------|-------------|---------|
| **for** | Know exact number of iterations | Print 1 to 100 |
| **while** | Don't know number of iterations | Keep asking until correct input |
| **do-while** | Must execute at least once | Menu that shows at least once |
| **for-each** | Iterate through array/collection | Process all elements in array |

## Real-World Examples

### Example 1: Sum of Numbers
```java
public class SumCalculator {
    public static void main(String[] args) {
        int sum = 0;

        for (int i = 1; i <= 100; i++) {
            sum += i;
        }

        System.out.println("Sum of 1 to 100: " + sum);
    }
}
```

### Example 2: Factorial
```java
public class Factorial {
    public static void main(String[] args) {
        int num = 5;
        int factorial = 1;

        for (int i = 1; i <= num; i++) {
            factorial *= i;
        }

        System.out.println("Factorial of " + num + ": " + factorial);
        // Output: 120 (5 * 4 * 3 * 2 * 1)
    }
}
```

### Example 3: Reverse a Number
```java
public class ReverseNumber {
    public static void main(String[] args) {
        int num = 12345;
        int reversed = 0;

        while (num != 0) {
            int digit = num % 10;
            reversed = reversed * 10 + digit;
            num /= 10;
        }

        System.out.println("Reversed: " + reversed);
        // Output: 54321
    }
}
```

### Example 4: Prime Number Check
```java
public class PrimeCheck {
    public static void main(String[] args) {
        int num = 29;
        boolean isPrime = true;

        for (int i = 2; i < num; i++) {
            if (num % i == 0) {
                isPrime = false;
                break;
            }
        }

        if (isPrime) {
            System.out.println(num + " is prime");
        } else {
            System.out.println(num + " is not prime");
        }
    }
}
```

## Infinite Loops

Loops that **never stop** (usually a mistake!).

### Examples:
```java
// Infinite for loop
for (;;) {
    System.out.println("This runs forever!");
}

// Infinite while loop
while (true) {
    System.out.println("This runs forever!");
}

// Common mistake
int i = 1;
while (i <= 5) {
    System.out.println(i);
    // Forgot i++; - infinite loop!
}
```

### Intentional Infinite Loop:
```java
// Server that runs continuously
while (true) {
    // Accept client connections
    // Use break to exit when needed
    if (shutdownRequested) {
        break;
    }
}
```

## Common Mistakes

❌ **Off-by-one error:**
```java
for (int i = 1; i < 5; i++) {  // Only 1 to 4
    System.out.println(i);
}
```

✅ **Correct:**
```java
for (int i = 1; i <= 5; i++) {  // 1 to 5
    System.out.println(i);
}
```

❌ **Modifying for-each variable:**
```java
int[] arr = {1, 2, 3};
for (int num : arr) {
    num = num * 2;  // Doesn't modify array!
}
```

❌ **Forgetting to update:**
```java
int i = 0;
while (i < 5) {
    System.out.println(i);
    // Forgot i++; - Infinite loop!
}
```

## Quick Tips

💡 Use **for** when you know iteration count
💡 Use **while** when you don't know iteration count
💡 Use **for-each** for arrays and collections (cleaner code)
💡 Always update loop variable in while loops
💡 Use **break** to exit loop early
💡 Use **continue** to skip current iteration

## Practice Exercises

1. Print all odd numbers from 1 to 50
2. Calculate sum of all even numbers from 1 to 100
3. Print multiplication table of 7
4. Create a pattern of stars (pyramid)
5. Find the largest element in an array
6. Check if a number is palindrome (reads same forwards and backwards)

---

**Previous:** [Control Statements](./05-Control-Statements.md) | **Next:** [Arrays](./07-Arrays.md)
