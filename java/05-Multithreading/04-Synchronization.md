# Synchronization in Java

## What is Synchronization?

**Synchronization** controls access to shared resources by multiple threads to prevent **data inconsistency**.

**Problem:** Multiple threads accessing same data can cause conflicts!

## Without Synchronization (Problem)

```java
class Counter {
    int count = 0;

    void increment() {
        count++;  // Not thread-safe!
    }
}

public class UnsafeDemo {
    public static void main(String[] args) throws InterruptedException {
        Counter counter = new Counter();

        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 1000; i++) {
                counter.increment();
            }
        });

        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 1000; i++) {
                counter.increment();
            }
        });

        t1.start();
        t2.start();

        t1.join();
        t2.join();

        System.out.println("Count: " + counter.count);  // May not be 2000!
    }
}
```

## With Synchronization (Solution)

```java
class Counter {
    int count = 0;

    synchronized void increment() {
        count++;  // Thread-safe now!
    }
}

public class SafeDemo {
    public static void main(String[] args) throws InterruptedException {
        Counter counter = new Counter();

        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 1000; i++) {
                counter.increment();
            }
        });

        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 1000; i++) {
                counter.increment();
            }
        });

        t1.start();
        t2.start();

        t1.join();
        t2.join();

        System.out.println("Count: " + counter.count);  // Always 2000
    }
}
```

## Synchronized Block

```java
class Counter {
    int count = 0;

    void increment() {
        synchronized(this) {
            count++;
        }
    }
}
```

## Real Example: Bank Account

```java
class BankAccount {
    private double balance = 1000;

    synchronized void withdraw(double amount) {
        if (balance >= amount) {
            System.out.println(Thread.currentThread().getName() + " withdrawing: $" + amount);
            balance -= amount;
            System.out.println("Remaining balance: $" + balance);
        } else {
            System.out.println(Thread.currentThread().getName() + ": Insufficient funds!");
        }
    }
}

public class BankDemo {
    public static void main(String[] args) {
        BankAccount account = new BankAccount();

        Thread t1 = new Thread(() -> account.withdraw(600), "Person1");
        Thread t2 = new Thread(() -> account.withdraw(600), "Person2");

        t1.start();
        t2.start();
    }
}
```

## Quick Tips

💡 Use `synchronized` to prevent race conditions
💡 Synchronization can reduce performance
💡 Only synchronize critical sections
💡 Avoid deadlocks

---

**Previous:** [Thread Life Cycle](./03-Thread-Life-Cycle.md) | **Next:** [Advanced Topics](../06-Advanced-Topics/01-Generics.md)
