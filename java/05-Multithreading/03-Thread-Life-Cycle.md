# Thread Life Cycle in Java

## Thread States

```
New → Runnable → Running → Blocked/Waiting → Terminated
```

### 1. New
Thread is created but not started yet.
```java
Thread t = new Thread();  // New state
```

### 2. Runnable
Thread is ready to run, waiting for CPU.
```java
t.start();  // Moves to Runnable
```

### 3. Running
Thread is currently executing.

### 4. Blocked/Waiting
Thread is waiting for resource or another thread.
```java
Thread.sleep(1000);  // Waiting
```

### 5. Terminated (Dead)
Thread has finished execution.

## State Diagram

```
    New
     ↓ start()
  Runnable ←──────┐
     ↓            │
  Running         │
     ↓            │
  Blocked/Waiting─┘
     ↓
  Terminated
```

---

**Previous:** [Creating Threads](./02-Creating-Threads.md) | **Next:** [Synchronization](./04-Synchronization.md)
