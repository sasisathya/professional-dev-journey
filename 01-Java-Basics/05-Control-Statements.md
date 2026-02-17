# Control Statements in Java

## What are Control Statements?

**Control statements** decide the **flow** of your program - which code runs and when.

Think of them as **traffic signals** that direct the program's path.

## Types of Control Statements

```
Control Statements
    ├── Decision Making (if, if-else, switch)
    ├── Looping (for, while, do-while)
    └── Branching (break, continue, return)
```

## 1. if Statement

Executes code **only if** condition is true.

### Syntax:
```java
if (condition) {
    // code to execute if condition is true
}
```

### Example:
```java
int age = 20;

if (age >= 18) {
    System.out.println("You can vote!");
}
```

## 2. if-else Statement

Choose between **two options**.

### Syntax:
```java
if (condition) {
    // code if condition is true
} else {
    // code if condition is false
}
```

### Example:
```java
int marks = 55;

if (marks >= 60) {
    System.out.println("Pass");
} else {
    System.out.println("Fail");
}
```

## 3. if-else-if Ladder

Choose between **multiple options**.

### Syntax:
```java
if (condition1) {
    // code
} else if (condition2) {
    // code
} else if (condition3) {
    // code
} else {
    // code if none of the above
}
```

### Example:
```java
int marks = 85;

if (marks >= 90) {
    System.out.println("Grade: A+");
} else if (marks >= 80) {
    System.out.println("Grade: A");
} else if (marks >= 70) {
    System.out.println("Grade: B");
} else if (marks >= 60) {
    System.out.println("Grade: C");
} else {
    System.out.println("Grade: F");
}
```

## 4. Nested if

An **if inside another if**.

### Example:
```java
int age = 25;
boolean hasLicense = true;

if (age >= 18) {
    if (hasLicense) {
        System.out.println("You can drive!");
    } else {
        System.out.println("Get a license first!");
    }
} else {
    System.out.println("You're too young to drive!");
}
```

## 5. switch Statement

Choose one option from **many choices** based on a value.

### Syntax:
```java
switch (variable) {
    case value1:
        // code
        break;
    case value2:
        // code
        break;
    default:
        // code if no case matches
}
```

### Example:
```java
int day = 3;

switch (day) {
    case 1:
        System.out.println("Monday");
        break;
    case 2:
        System.out.println("Tuesday");
        break;
    case 3:
        System.out.println("Wednesday");
        break;
    case 4:
        System.out.println("Thursday");
        break;
    case 5:
        System.out.println("Friday");
        break;
    case 6:
        System.out.println("Saturday");
        break;
    case 7:
        System.out.println("Sunday");
        break;
    default:
        System.out.println("Invalid day");
}
```

### Switch with String:
```java
String fruit = "Apple";

switch (fruit) {
    case "Apple":
        System.out.println("Red fruit");
        break;
    case "Banana":
        System.out.println("Yellow fruit");
        break;
    case "Grapes":
        System.out.println("Green/Purple fruit");
        break;
    default:
        System.out.println("Unknown fruit");
}
```

## break Statement

**Exits** the loop or switch immediately.

### In switch:
```java
switch (day) {
    case 1:
        System.out.println("Monday");
        break;  // Exit switch after this
    case 2:
        System.out.println("Tuesday");
        break;
}
```

### Without break (Fall-through):
```java
int month = 2;

switch (month) {
    case 12:
    case 1:
    case 2:
        System.out.println("Winter");  // All 3 cases execute this
        break;
    case 3:
    case 4:
    case 5:
        System.out.println("Spring");
        break;
}
```

## Real-World Examples

### Example 1: Age Verification
```java
public class AgeCheck {
    public static void main(String[] args) {
        int age = 16;

        if (age >= 18) {
            System.out.println("You can:");
            System.out.println("- Vote");
            System.out.println("- Get a driver's license");
            System.out.println("- Open a bank account alone");
        } else {
            int yearsLeft = 18 - age;
            System.out.println("Wait " + yearsLeft + " more years");
        }
    }
}
```

### Example 2: Grade Calculator
```java
public class GradeCalculator {
    public static void main(String[] args) {
        int marks = 75;
        String grade;

        if (marks >= 90) {
            grade = "A+";
        } else if (marks >= 80) {
            grade = "A";
        } else if (marks >= 70) {
            grade = "B";
        } else if (marks >= 60) {
            grade = "C";
        } else if (marks >= 50) {
            grade = "D";
        } else {
            grade = "F";
        }

        System.out.println("Your grade: " + grade);

        if (marks >= 60) {
            System.out.println("Status: PASS");
        } else {
            System.out.println("Status: FAIL");
        }
    }
}
```

### Example 3: Calculator using Switch
```java
public class SimpleCalculator {
    public static void main(String[] args) {
        int num1 = 10, num2 = 5;
        char operator = '+';
        int result;

        switch (operator) {
            case '+':
                result = num1 + num2;
                System.out.println("Result: " + result);
                break;
            case '-':
                result = num1 - num2;
                System.out.println("Result: " + result);
                break;
            case '*':
                result = num1 * num2;
                System.out.println("Result: " + result);
                break;
            case '/':
                if (num2 != 0) {
                    result = num1 / num2;
                    System.out.println("Result: " + result);
                } else {
                    System.out.println("Cannot divide by zero!");
                }
                break;
            default:
                System.out.println("Invalid operator");
        }
    }
}
```

## if vs switch

| Feature | if-else | switch |
|---------|---------|--------|
| **Best for** | Ranges and complex conditions | Exact value matching |
| **Condition types** | Any boolean expression | Equality checks only |
| **Readability** | Can become messy with many conditions | Cleaner for many options |
| **Performance** | Slower with many conditions | Faster for many cases |

### When to use if:
```java
if (age >= 18 && age <= 65) {  // Range check
    System.out.println("Working age");
}
```

### When to use switch:
```java
switch (dayNumber) {  // Exact value matching
    case 1: System.out.println("Monday"); break;
    case 2: System.out.println("Tuesday"); break;
}
```

## Common Mistakes

❌ **Missing braces:**
```java
if (age >= 18)
    System.out.println("Adult");
    System.out.println("Can vote");  // Always executes!
```

✅ **Use braces:**
```java
if (age >= 18) {
    System.out.println("Adult");
    System.out.println("Can vote");
}
```

❌ **Assignment instead of comparison:**
```java
if (age = 18) { }  // ERROR! Should be ==
```

✅ **Correct:**
```java
if (age == 18) { }
```

❌ **Forgetting break in switch:**
```java
switch (day) {
    case 1:
        System.out.println("Monday");
        // Falls through to case 2!
    case 2:
        System.out.println("Tuesday");
}
```

✅ **Use break:**
```java
switch (day) {
    case 1:
        System.out.println("Monday");
        break;
    case 2:
        System.out.println("Tuesday");
        break;
}
```

## Quick Tips

💡 Always use `{}` braces, even for single statements
💡 Use `==` for comparison, not `=`
💡 Add `break` in switch cases (unless fall-through is intended)
💡 Use switch for exact value matching, if for ranges
💡 Add a `default` case in switch statements

## Practice Exercises

1. **Even or Odd**: Write a program to check if a number is even or odd
2. **Largest of Three**: Find the largest among three numbers
3. **Day Type**: Use switch to print "Weekday" or "Weekend" based on day number
4. **BMI Calculator**: Calculate and categorize BMI (underweight, normal, overweight)

---

**Previous:** [Operators](./04-Operators.md) | **Next:** [Loops](./06-Loops.md)
