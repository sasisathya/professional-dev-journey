# Encapsulation in Java

## What is Encapsulation?

**Encapsulation** means **wrapping data** (variables) and **code** (methods) together, and controlling access to them.

Think of it like a **capsule** - the medicine is protected inside!

## Why Encapsulation?

✅ **Data Hiding** - Protect sensitive data
✅ **Control** - Control how data is accessed/modified
✅ **Flexibility** - Can change implementation without affecting other code
✅ **Security** - Prevent unauthorized access

## How to Achieve Encapsulation?

1. Make variables **private**
2. Provide **public getter and setter** methods

## Basic Example

```java
class BankAccount {
    // Private variables (hidden from outside)
    private String accountNumber;
    private double balance;

    // Constructor
    public BankAccount(String accNum, double initialBalance) {
        this.accountNumber = accNum;
        this.balance = initialBalance;
    }

    // Getter for balance (read-only access)
    public double getBalance() {
        return balance;
    }

    // Setter for deposit (controlled access)
    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            System.out.println("Deposited: $" + amount);
        } else {
            System.out.println("Invalid amount!");
        }
    }

    // Setter for withdrawal (controlled access)
    public void withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            System.out.println("Withdrawn: $" + amount);
        } else {
            System.out.println("Insufficient funds or invalid amount!");
        }
    }
}

public class Main {
    public static void main(String[] args) {
        BankAccount account = new BankAccount("12345", 1000.0);

        // Can't access directly: account.balance = 50000; // ERROR!

        // Use methods instead
        System.out.println("Balance: $" + account.getBalance());
        account.deposit(500);
        account.withdraw(200);
        System.out.println("Final Balance: $" + account.getBalance());
    }
}
```

## Access Modifiers

| Modifier | Class | Package | Subclass | World |
|----------|-------|---------|----------|-------|
| **public** | ✅ | ✅ | ✅ | ✅ |
| **protected** | ✅ | ✅ | ✅ | ❌ |
| **default** | ✅ | ✅ | ❌ | ❌ |
| **private** | ✅ | ❌ | ❌ | ❌ |

## Getter and Setter Methods

### Naming Convention:
- **Getter**: `get` + VariableName
- **Setter**: `set` + VariableName

```java
class Student {
    private String name;
    private int age;

    // Getter for name
    public String getName() {
        return name;
    }

    // Setter for name
    public void setName(String name) {
        this.name = name;
    }

    // Getter for age
    public int getAge() {
        return age;
    }

    // Setter for age (with validation)
    public void setAge(int age) {
        if (age > 0 && age < 150) {
            this.age = age;
        } else {
            System.out.println("Invalid age!");
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Student student = new Student();

        student.setName("Alice");
        student.setAge(20);

        System.out.println("Name: " + student.getName());
        System.out.println("Age: " + student.getAge());

        student.setAge(200);  // Invalid age!
    }
}
```

## Real-World Example: Employee Class

```java
class Employee {
    private int id;
    private String name;
    private double salary;
    private String department;

    // Constructor
    public Employee(int id, String name, double salary, String department) {
        this.id = id;
        this.name = name;
        this.salary = salary;
        this.department = department;
    }

    // Getters
    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public double getSalary() {
        return salary;
    }

    public String getDepartment() {
        return department;
    }

    // Setters with validation
    public void setName(String name) {
        if (name != null && !name.trim().isEmpty()) {
            this.name = name;
        }
    }

    public void setSalary(double salary) {
        if (salary > 0) {
            this.salary = salary;
        } else {
            System.out.println("Salary must be positive!");
        }
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    // Give raise
    public void giveRaise(double percentage) {
        if (percentage > 0 && percentage <= 100) {
            salary += salary * (percentage / 100);
            System.out.println("Raise given: " + percentage + "%");
        }
    }

    public void displayInfo() {
        System.out.println("ID: " + id);
        System.out.println("Name: " + name);
        System.out.println("Salary: $" + salary);
        System.out.println("Department: " + department);
    }
}

public class Main {
    public static void main(String[] args) {
        Employee emp = new Employee(101, "Alice", 50000, "IT");

        emp.displayInfo();
        System.out.println();

        emp.giveRaise(10);
        emp.displayInfo();
    }
}
```

## Benefits of Encapsulation

✅ **Data Protection**: Can't directly modify sensitive data
✅ **Validation**: Control what values are set
✅ **Flexibility**: Can change internal implementation
✅ **Read-Only/Write-Only**: Can make fields read-only by only providing getter
✅ **Debugging**: Easier to track where data is modified

## Quick Tips

💡 Make variables **private**
💡 Provide **public getters/setters**
💡 Add **validation** in setters
💡 Use meaningful method names
💡 Don't expose internal implementation details

---

**Previous:** [Polymorphism](./04-Polymorphism.md) | **Next:** [Abstraction](./06-Abstraction.md)
