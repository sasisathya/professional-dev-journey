# Creating Threads in Java

## Method 1: Extending Thread Class

```java
class MyThread extends Thread {
    @Override
    public void run() {
        for (int i = 1; i <= 5; i++) {
            System.out.println(Thread.currentThread().getName() + ": " + i);
            try {
                Thread.sleep(500);  // Sleep for 500ms
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}

public class ThreadDemo1 {
    public static void main(String[] args) {
        MyThread t1 = new MyThread();
        MyThread t2 = new MyThread();

        t1.start();  // Start thread 1
        t2.start();  // Start thread 2
    }
}
```

## Method 2: Implementing Runnable Interface

```java
class MyRunnable implements Runnable {
    @Override
    public void run() {
        for (int i = 1; i <= 5; i++) {
            System.out.println(Thread.currentThread().getName() + ": " + i);
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}

public class ThreadDemo2 {
    public static void main(String[] args) {
        MyRunnable runnable = new MyRunnable();

        Thread t1 = new Thread(runnable);
        Thread t2 = new Thread(runnable);

        t1.start();
        t2.start();
    }
}
```

## Using Lambda (Java 8+)

```java
public class LambdaThread {
    public static void main(String[] args) {
        Thread t1 = new Thread(() -> {
            for (int i = 1; i <= 5; i++) {
                System.out.println("Thread 1: " + i);
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });

        t1.start();
    }
}
```

## Real Example: Download Simulation

```java
class FileDownloader implements Runnable {
    String fileName;

    FileDownloader(String fileName) {
        this.fileName = fileName;
    }

    @Override
    public void run() {
        System.out.println("Downloading " + fileName + "...");
        for (int i = 10; i <= 100; i += 10) {
            System.out.println(fileName + ": " + i + "% complete");
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        System.out.println(fileName + " download completed!");
    }
}

public class DownloadDemo {
    public static void main(String[] args) {
        Thread t1 = new Thread(new FileDownloader("File1.pdf"));
        Thread t2 = new Thread(new FileDownloader("File2.jpg"));

        t1.start();
        t2.start();
    }
}
```

## Common Thread Methods

| Method | Description |
|--------|-------------|
| `start()` | Start the thread |
| `run()` | Contains thread code |
| `sleep(ms)` | Pause thread |
| `join()` | Wait for thread to complete |
| `getName()` | Get thread name |
| `setName(name)` | Set thread name |
| `getPriority()` | Get priority |
| `setPriority(n)` | Set priority (1-10) |

## Quick Tips

💡 Always use `start()`, not `run()` directly
💡 Implement `Runnable` for better design (composition over inheritance)
💡 Use `Thread.sleep()` to pause execution
💡 Handle `InterruptedException` in sleep

---

**Previous:** [Introduction](./01-Introduction.md) | **Next:** [Thread Life Cycle](./03-Thread-Life-Cycle.md)
