# Strings in Java

## What is a String?

A **String** is a sequence of characters (text). In Java, String is a **class**, not a primitive data type.

```java
String message = "Hello, World!";
String name = "Alice";
```

## Creating Strings

### Method 1: String Literal (Most Common)
```java
String str1 = "Hello";
String str2 = "Java";
```

### Method 2: Using new Keyword
```java
String str1 = new String("Hello");
String str2 = new String("Java");
```

## String is Immutable

**Immutable** means Strings **cannot be changed** after creation.

```java
String str = "Hello";
str.concat(" World");  // Creates new string, doesn't modify str
System.out.println(str);  // Still prints "Hello"

// To actually change str, reassign it:
str = str.concat(" World");
System.out.println(str);  // Now prints "Hello World"
```

## String Length

Get number of characters using `.length()`.

```java
String text = "Hello";
System.out.println(text.length());  // 5

String empty = "";
System.out.println(empty.length());  // 0
```

## Accessing Characters

Use `.charAt(index)` to get character at specific position.

```java
String text = "Hello";

System.out.println(text.charAt(0));  // H (first character)
System.out.println(text.charAt(1));  // e
System.out.println(text.charAt(4));  // o (last character)
```

**Index diagram:**
```
String: H  e  l  l  o
Index:  0  1  2  3  4
```

## String Concatenation

### Using + Operator
```java
String first = "Hello";
String second = "World";
String result = first + " " + second;
System.out.println(result);  // Hello World

// With numbers
String message = "I am " + 25 + " years old";
System.out.println(message);  // I am 25 years old
```

### Using concat() Method
```java
String str1 = "Hello";
String str2 = " World";
String result = str1.concat(str2);
System.out.println(result);  // Hello World
```

## Common String Methods

### 1. toLowerCase() and toUpperCase()
```java
String text = "Hello World";

System.out.println(text.toLowerCase());  // hello world
System.out.println(text.toUpperCase());  // HELLO WORLD
System.out.println(text);  // Hello World (original unchanged)
```

### 2. trim() - Remove Extra Spaces
```java
String text = "  Hello World  ";
System.out.println(text.trim());  // "Hello World"
```

### 3. substring() - Extract Part of String
```java
String text = "Hello World";

System.out.println(text.substring(0, 5));  // Hello
System.out.println(text.substring(6));     // World
System.out.println(text.substring(6, 11)); // World
```

### 4. replace() - Replace Characters
```java
String text = "Hello World";

System.out.println(text.replace('l', 'p'));  // Heppo Worpd
System.out.println(text.replace("World", "Java"));  // Hello Java
```

### 5. contains() - Check if Contains Substring
```java
String text = "Hello World";

System.out.println(text.contains("World"));  // true
System.out.println(text.contains("Java"));   // false
```

### 6. startsWith() and endsWith()
```java
String text = "Hello World";

System.out.println(text.startsWith("Hello"));  // true
System.out.println(text.endsWith("World"));    // true
System.out.println(text.startsWith("Hi"));     // false
```

### 7. indexOf() - Find Position
```java
String text = "Hello World";

System.out.println(text.indexOf('o'));      // 4 (first 'o')
System.out.println(text.indexOf("World"));  // 6
System.out.println(text.indexOf('z'));      // -1 (not found)
```

### 8. split() - Split into Array
```java
String text = "Apple,Banana,Orange";
String[] fruits = text.split(",");

for (String fruit : fruits) {
    System.out.println(fruit);
}
// Output:
// Apple
// Banana
// Orange
```

### 9. equals() - Compare Strings
```java
String str1 = "Hello";
String str2 = "Hello";
String str3 = "hello";

System.out.println(str1.equals(str2));  // true
System.out.println(str1.equals(str3));  // false (case-sensitive)
System.out.println(str1.equalsIgnoreCase(str3));  // true
```

⚠️ **Never use == to compare Strings!**
```java
String str1 = "Hello";
String str2 = "Hello";
System.out.println(str1 == str2);  // May not work as expected
System.out.println(str1.equals(str2));  // ✅ Use this
```

### 10. isEmpty() and isBlank()
```java
String empty = "";
String spaces = "   ";

System.out.println(empty.isEmpty());   // true
System.out.println(spaces.isEmpty());  // false (has spaces)
System.out.println(spaces.isBlank());  // true (Java 11+)
```

## String Comparison

### compareTo() - Lexicographic Comparison
```java
String str1 = "Apple";
String str2 = "Banana";

System.out.println(str1.compareTo(str2));  // Negative (Apple < Banana)
System.out.println(str2.compareTo(str1));  // Positive (Banana > Apple)
System.out.println(str1.compareTo("Apple"));  // 0 (equal)
```

## String Formatting

### Using String.format()
```java
String name = "Alice";
int age = 25;
double salary = 50000.50;

String formatted = String.format("Name: %s, Age: %d, Salary: %.2f", name, age, salary);
System.out.println(formatted);
// Output: Name: Alice, Age: 25, Salary: 50000.50
```

### Format Specifiers:
| Specifier | Type |
|-----------|------|
| `%s` | String |
| `%d` | Integer |
| `%f` | Float/Double |
| `%c` | Character |
| `%b` | Boolean |

## StringBuilder and StringBuffer

For **multiple string manipulations**, use StringBuilder (more efficient).

### Why?
```java
// Inefficient - Creates many temporary strings
String str = "Hello";
for (int i = 0; i < 1000; i++) {
    str = str + i;  // Creates new string each time!
}

// Efficient - Single mutable object
StringBuilder sb = new StringBuilder("Hello");
for (int i = 0; i < 1000; i++) {
    sb.append(i);  // Modifies same object
}
String result = sb.toString();
```

### StringBuilder Methods
```java
StringBuilder sb = new StringBuilder("Hello");

sb.append(" World");        // Hello World
sb.insert(5, " Java");      // Hello Java World
sb.delete(5, 10);           // Hello World
sb.reverse();               // dlroW olleH
sb.replace(0, 5, "Hi");     // Hi olleH

String result = sb.toString();  // Convert to String
```

### StringBuffer vs StringBuilder
| Feature | StringBuilder | StringBuffer |
|---------|---------------|--------------|
| **Thread-Safe** | No | Yes |
| **Speed** | Faster | Slower |
| **Use When** | Single thread | Multiple threads |

## Real-World Examples

### Example 1: Email Validation
```java
public class EmailValidator {
    public static void main(String[] args) {
        String email = "user@example.com";

        if (email.contains("@") && email.contains(".")) {
            System.out.println("Valid email format");
        } else {
            System.out.println("Invalid email format");
        }
    }
}
```

### Example 2: Name Formatter
```java
public class NameFormatter {
    public static void main(String[] args) {
        String fullName = "  john   doe  ";

        // Clean and format
        String cleaned = fullName.trim();
        String[] parts = cleaned.split("\\s+");

        for (int i = 0; i < parts.length; i++) {
            parts[i] = parts[i].substring(0, 1).toUpperCase() +
                       parts[i].substring(1).toLowerCase();
        }

        String formatted = String.join(" ", parts);
        System.out.println(formatted);  // John Doe
    }
}
```

### Example 3: Word Counter
```java
public class WordCounter {
    public static void main(String[] args) {
        String text = "Java is fun. Java is powerful. Learn Java!";

        String[] words = text.split("\\s+");
        System.out.println("Total words: " + words.length);

        // Count specific word
        int javaCount = 0;
        for (String word : words) {
            if (word.toLowerCase().contains("java")) {
                javaCount++;
            }
        }
        System.out.println("'Java' appears: " + javaCount + " times");
    }
}
```

### Example 4: Password Strength Checker
```java
public class PasswordChecker {
    public static void main(String[] args) {
        String password = "MyP@ss123";

        boolean hasLength = password.length() >= 8;
        boolean hasDigit = password.matches(".*\\d.*");
        boolean hasSpecial = password.matches(".*[@#$%^&+=].*");
        boolean hasUpper = password.matches(".*[A-Z].*");
        boolean hasLower = password.matches(".*[a-z].*");

        if (hasLength && hasDigit && hasSpecial && hasUpper && hasLower) {
            System.out.println("Strong password!");
        } else {
            System.out.println("Weak password. Requirements:");
            if (!hasLength) System.out.println("- At least 8 characters");
            if (!hasDigit) System.out.println("- At least one digit");
            if (!hasSpecial) System.out.println("- At least one special character");
            if (!hasUpper) System.out.println("- At least one uppercase letter");
            if (!hasLower) System.out.println("- At least one lowercase letter");
        }
    }
}
```

## Escape Sequences

Special characters in strings.

| Escape | Meaning | Example |
|--------|---------|---------|
| `\n` | New line | `"Hello\nWorld"` |
| `\t` | Tab | `"Hello\tWorld"` |
| `\"` | Double quote | `"He said \"Hi\""` |
| `\'` | Single quote | `'It\'s'` |
| `\\` | Backslash | `"C:\\folder"` |

```java
System.out.println("Line 1\nLine 2");
// Output:
// Line 1
// Line 2

System.out.println("Name\tAge\nAlice\t25");
// Output:
// Name    Age
// Alice   25
```

## Common Mistakes

❌ **Using == for comparison:**
```java
String s1 = "Hello";
String s2 = "Hello";
if (s1 == s2) { }  // May not work correctly
```

✅ **Use equals():**
```java
if (s1.equals(s2)) { }  // Correct way
```

❌ **Modifying string in loop:**
```java
String result = "";
for (int i = 0; i < 1000; i++) {
    result += i;  // Inefficient!
}
```

✅ **Use StringBuilder:**
```java
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
    sb.append(i);
}
String result = sb.toString();
```

❌ **Index out of bounds:**
```java
String text = "Hello";
char ch = text.charAt(10);  // ERROR! Only indices 0-4 exist
```

## Quick Reference Table

| Method | Purpose | Example |
|--------|---------|---------|
| `length()` | Get string length | `str.length()` |
| `charAt(i)` | Get character at index | `str.charAt(0)` |
| `substring(start, end)` | Extract part | `str.substring(0, 5)` |
| `toLowerCase()` | Convert to lowercase | `str.toLowerCase()` |
| `toUpperCase()` | Convert to uppercase | `str.toUpperCase()` |
| `trim()` | Remove spaces | `str.trim()` |
| `replace(old, new)` | Replace text | `str.replace("a", "b")` |
| `split(delimiter)` | Split into array | `str.split(",")` |
| `equals(other)` | Compare strings | `str.equals("test")` |
| `contains(text)` | Check if contains | `str.contains("test")` |

## Quick Tips

💡 Use `.equals()` to compare strings, not `==`
💡 Strings are immutable - can't be modified
💡 Use StringBuilder for multiple concatenations
💡 String index starts at 0
💡 Use `.length()` for strings, `.length` for arrays
💡 Remember to handle null strings

## Practice Exercises

1. Reverse a string
2. Check if a string is palindrome
3. Count vowels in a string
4. Remove all spaces from a string
5. Find the first non-repeated character
6. Convert "hello world" to "Hello World" (title case)

---

**Previous:** [Arrays](./07-Arrays.md) | **Next:** [Classes and Objects](../02-OOP-Concepts/01-Classes-and-Objects.md)
