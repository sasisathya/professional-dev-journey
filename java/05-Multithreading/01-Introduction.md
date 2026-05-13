# Introduction to Multithreading

## What is Multithreading?

**Multithreading** allows multiple tasks to run **simultaneously** within a single program.

**Real-world example:** Listening to music while browsing the web!

## Thread vs Process

| Process | Thread |
|---------|--------|
| Heavy weight | Light weight |
| Separate memory | Shared memory |
| Independent | Part of process |

## Why Use Multithreading?

✅ **Better performance** - Utilize CPU efficiently
✅ **Responsiveness** - UI remains responsive
✅ **Resource sharing** - Threads share memory
✅ **Parallel execution** - Multiple tasks at once

## Thread States

```
New → Runnable → Running → Blocked/Waiting → Terminated
```

## Creating Threads

Two ways to create threads:
1. Extending `Thread` class
2. Implementing `Runnable` interface

---

**Previous:** [Custom Exceptions](../04-Exception-Handling/04-Custom-Exceptions.md) | **Next:** [Creating Threads](./02-Creating-Threads.md)
