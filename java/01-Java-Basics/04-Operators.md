# Operators in Java

## What are Operators?

**Operators** are special symbols that perform operations on variables and values.

Think of them as **action words**: add (+), subtract (-), compare (==), etc.

## Types of Operators

```
Operators
    ├── Arithmetic Operators
    ├── Assignment Operators
    ├── Comparison Operators
    ├── Logical Operators
    ├── Unary Operators
    └── Bitwise Operators
```

## 1. Arithmetic Operators

Used for **mathematical calculations**.

| Operator | Name | Example | Result |
|----------|------|---------|--------|
| `+` | Addition | `5 + 3` | `8` |
| `-` | Subtraction | `5 - 3` | `2` |
| `*` | Multiplication | `5 * 3` | `15` |
| `/` | Division | `10 / 2` | `5` |
| `%` | Modulus (Remainder) | `10 % 3` | `1` |

### Examples:
```java
int a = 10, b = 3;

System.out.println(a + b);  // 13 (Addition)
System.out.println(a - b);  // 7  (Subtraction)
System.out.println(a * b);  // 30 (Multiplication)
System.out.println(a / b);  // 3  (Division - integer division)
System.out.println(a % b);  // 1  (Remainder when 10 ÷ 3)
```

### Division Note:
```java
int result1 = 10 / 3;        // 3 (integer division)
double result2 = 10.0 / 3;   // 3.333... (decimal division)
```

## 2. Assignment Operators

Used to **assign values** to variables.

| Operator | Example | Same As | Result |
|----------|---------|---------|--------|
| `=` | `x = 5` | `x = 5` | `x = 5` |
| `+=` | `x += 3` | `x = x + 3` | `x = 8` |
| `-=` | `x -= 3` | `x = x - 3` | `x = 2` |
| `*=` | `x *= 3` | `x = x * 3` | `x = 15` |
| `/=` | `x /= 3` | `x = x / 3` | `x = 1` |
| `%=` | `x %= 3` | `x = x % 3` | `x = 2` |

### Examples:
```java
int x = 10;

x += 5;   // x = x + 5  → x = 15
x -= 3;   // x = x - 3  → x = 12
x *= 2;   // x = x * 2  → x = 24
x /= 4;   // x = x / 4  → x = 6
x %= 4;   // x = x % 4  → x = 2
```

## 3. Comparison (Relational) Operators

Used to **compare two values**. Returns `true` or `false`.

| Operator | Name | Example | Result |
|----------|------|---------|--------|
| `==` | Equal to | `5 == 3` | `false` |
| `!=` | Not equal to | `5 != 3` | `true` |
| `>` | Greater than | `5 > 3` | `true` |
| `<` | Less than | `5 < 3` | `false` |
| `>=` | Greater than or equal | `5 >= 5` | `true` |
| `<=` | Less than or equal | `5 <= 3` | `false` |

### Examples:
```java
int age = 18;

System.out.println(age == 18);  // true
System.out.println(age != 18);  // false
System.out.println(age > 20);   // false
System.out.println(age < 20);   // true
System.out.println(age >= 18);  // true
System.out.println(age <= 17);  // false
```

## 4. Logical Operators

Used to combine **multiple conditions**.

| Operator | Name | Description | Example |
|----------|------|-------------|---------|
| `&&` | AND | True if **both** are true | `(5 > 3) && (8 > 5)` → `true` |
| `\|\|` | OR | True if **at least one** is true | `(5 > 3) \|\| (8 < 5)` → `true` |
| `!` | NOT | Reverses the result | `!(5 > 3)` → `false` |

### Examples:
```java
int age = 25;
boolean hasLicense = true;

// AND (&&) - Both must be true
boolean canDrive = (age >= 18) && hasLicense;  // true

// OR (||) - At least one must be true
boolean canVote = (age >= 18) || (age >= 21);  // true

// NOT (!) - Reverses the result
boolean isMinor = !(age >= 18);  // false
```

### Truth Table:

#### AND (&&)
| A | B | A && B |
|---|---|--------|
| true | true | true |
| true | false | false |
| false | true | false |
| false | false | false |

#### OR (||)
| A | B | A \|\| B |
|---|---|----------|
| true | true | true |
| true | false | true |
| false | true | true |
| false | false | false |

## 5. Unary Operators

Work with **only one operand**.

| Operator | Name | Description | Example |
|----------|------|-------------|---------|
| `+` | Unary plus | Indicates positive | `+5` |
| `-` | Unary minus | Negates value | `-5` |
| `++` | Increment | Increases by 1 | `x++` or `++x` |
| `--` | Decrement | Decreases by 1 | `x--` or `--x` |
| `!` | Logical NOT | Reverses boolean | `!true` → `false` |

### Increment and Decrement:

#### Post-increment (x++)
Use the value **first**, then increase

```java
int x = 5;
int y = x++;  // y = 5, then x becomes 6
// y = 5, x = 6
```

#### Pre-increment (++x)
Increase **first**, then use the value

```java
int x = 5;
int y = ++x;  // x becomes 6, then y = 6
// y = 6, x = 6
```

### Examples:
```java
int a = 10;
int b = ++a;  // a = 11, b = 11 (pre-increment)

int c = 10;
int d = c++;  // d = 10, c = 11 (post-increment)

int e = 10;
int f = --e;  // e = 9, f = 9 (pre-decrement)

int g = 10;
int h = g--;  // h = 10, g = 9 (post-decrement)
```

## 6. Ternary Operator

A **shortcut for if-else** statement.

### Syntax:
```java
variable = (condition) ? valueIfTrue : valueIfFalse;
```

### Examples:
```java
int age = 20;
String result = (age >= 18) ? "Adult" : "Minor";
System.out.println(result);  // Output: Adult

int a = 10, b = 20;
int max = (a > b) ? a : b;
System.out.println(max);  // Output: 20
```

## 7. Bitwise Operators (Advanced)

Work with **binary bits** of numbers.

| Operator | Name | Example |
|----------|------|---------|
| `&` | AND | `5 & 3` → `1` |
| `\|` | OR | `5 \| 3` → `7` |
| `^` | XOR | `5 ^ 3` → `6` |
| `~` | NOT | `~5` → `-6` |
| `<<` | Left shift | `5 << 1` → `10` |
| `>>` | Right shift | `5 >> 1` → `2` |

## Operator Precedence

**Order** in which operators are evaluated (like PEMDAS in math).

| Priority | Operators | Example |
|----------|-----------|---------|
| 1 (Highest) | `()` | Parentheses |
| 2 | `++`, `--`, `!` | Unary |
| 3 | `*`, `/`, `%` | Multiplication, Division |
| 4 | `+`, `-` | Addition, Subtraction |
| 5 | `<`, `>`, `<=`, `>=` | Comparison |
| 6 | `==`, `!=` | Equality |
| 7 | `&&` | Logical AND |
| 8 | `\|\|` | Logical OR |
| 9 (Lowest) | `=`, `+=`, `-=`, etc. | Assignment |

### Example:
```java
int result = 10 + 5 * 2;  // 20 (not 30)
// Because * has higher precedence than +

int result2 = (10 + 5) * 2;  // 30
// Parentheses have highest precedence
```

## Complete Example

```java
public class OperatorsDemo {
    public static void main(String[] args) {
        // Arithmetic
        int a = 10, b = 3;
        System.out.println("a + b = " + (a + b));
        System.out.println("a % b = " + (a % b));

        // Assignment
        int x = 5;
        x += 3;
        System.out.println("x after += 3: " + x);

        // Comparison
        System.out.println("10 > 5: " + (10 > 5));
        System.out.println("10 == 5: " + (10 == 5));

        // Logical
        boolean result = (5 > 3) && (8 > 5);
        System.out.println("Logical AND: " + result);

        // Unary
        int count = 10;
        System.out.println("count++: " + count++);  // 10
        System.out.println("count: " + count);      // 11

        // Ternary
        int age = 20;
        String status = (age >= 18) ? "Adult" : "Minor";
        System.out.println("Status: " + status);
    }
}
```

## Common Mistakes

❌ **Using = instead of ==:**
```java
if (x = 5) { }  // ERROR! Assignment, not comparison
```

✅ **Correct:**
```java
if (x == 5) { }  // Comparison
```

❌ **Confusion with ++ operator:**
```java
int x = 5;
int y = x++ + ++x;  // Confusing!
```

✅ **Better:**
```java
int x = 5;
x = x + 1;
int y = x + 1;
```

## Quick Tips

💡 `==` compares values, `=` assigns values
💡 Use parentheses `()` to make expressions clear
💡 `&&` requires both conditions to be true
💡 `||` requires at least one condition to be true
💡 `%` gives remainder (useful for even/odd checks)

## Practice Exercise

1. Calculate the area of a rectangle (length × width)
2. Check if a number is even using `%` operator
3. Find the maximum of two numbers using ternary operator
4. Use `&&` to check if age is between 18 and 65

---

**Previous:** [Variables](./03-Variables.md) | **Next:** [Control Statements](./05-Control-Statements.md)
