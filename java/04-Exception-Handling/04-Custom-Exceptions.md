# Custom Exceptions in Java

## What are Custom Exceptions?

**Custom exceptions** are user-defined exception classes for specific error scenarios.

## Creating Custom Exception

Extend `Exception` class (checked) or `RuntimeException` (unchecked).

```java
class MyException extends Exception {
    MyException(String message) {
        super(message);
    }
}
```

## Example: Bank Account

```java
class InsufficientFundsException extends Exception {
    InsufficientFundsException(String message) {
        super(message);
    }
}

class BankAccount {
    private double balance;

    BankAccount(double initialBalance) {
        this.balance = initialBalance;
    }

    void withdraw(double amount) throws InsufficientFundsException {
        if (amount > balance) {
            throw new InsufficientFundsException(
                "Insufficient funds! Balance: $" + balance + ", Requested: $" + amount
            );
        }
        balance -= amount;
        System.out.println("Withdrawn: $" + amount);
        System.out.println("Remaining balance: $" + balance);
    }

    double getBalance() {
        return balance;
    }
}

public class CustomExceptionDemo {
    public static void main(String[] args) {
        BankAccount account = new BankAccount(1000.0);

        try {
            account.withdraw(500);   // OK
            account.withdraw(800);   // Throws exception
        } catch (InsufficientFundsException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}
```

## Example: Age Validation

```java
class InvalidAgeException extends Exception {
    InvalidAgeException(String message) {
        super(message);
    }
}

class Person {
    String name;
    int age;

    void setAge(int age) throws InvalidAgeException {
        if (age < 0) {
            throw new InvalidAgeException("Age cannot be negative!");
        } else if (age > 150) {
            throw new InvalidAgeException("Age seems invalid (>150)!");
        }
        this.age = age;
    }
}

public class AgeValidation {
    public static void main(String[] args) {
        Person person = new Person();
        person.name = "Alice";

        try {
            person.setAge(25);   // OK
            System.out.println("Age set successfully!");

            person.setAge(200);  // Throws exception
        } catch (InvalidAgeException e) {
            System.out.println("Validation error: " + e.getMessage());
        }
    }
}
```

## When to Create Custom Exceptions

✅ Application-specific errors
✅ Better error descriptions
✅ Organized exception handling
✅ Domain-specific validation

## Quick Tips

💡 Extend `Exception` for checked exceptions
💡 Extend `RuntimeException` for unchecked
💡 Provide meaningful error messages
💡 Name exceptions with `Exception` suffix

---

**Previous:** [Throw and Throws](./03-Throw-and-Throws.md) | **Next:** [Multithreading](../05-Multithreading/01-Introduction.md)
