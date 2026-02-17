# Queue Interface in Java

## What is a Queue?

A **Queue** follows **FIFO** (First In, First Out) principle - like a line at a store!

First person who joins the line is the first to be served.

## PriorityQueue

Elements are ordered by **priority** (natural ordering or custom comparator).

```java
import java.util.PriorityQueue;

public class PriorityQueueDemo {
    public static void main(String[] args) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();

        // Add elements
        pq.add(30);
        pq.add(10);
        pq.add(50);
        pq.add(20);

        System.out.println("Queue: " + pq);  // [10, 20, 50, 30]

        // Remove elements (in priority order)
        System.out.println(pq.poll());  // 10 (smallest)
        System.out.println(pq.poll());  // 20
        System.out.println(pq.poll());  // 30
        System.out.println(pq.poll());  // 50
    }
}
```

## Common Methods

| Method | Description |
|--------|-------------|
| `add(element)` | Add element |
| `offer(element)` | Add element (safer) |
| `poll()` | Remove and return head |
| `peek()` | View head without removing |
| `remove()` | Remove head |
| `size()` | Get size |
| `isEmpty()` | Check if empty |

---

**Previous:** [Map Interface](./04-Map.md) | **Next:** [Iterator](./06-Iterator.md)
