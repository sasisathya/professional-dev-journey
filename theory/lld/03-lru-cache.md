# LRU Cache — Built From Scratch

## Requirements

- `get(key)` returns the value in O(1) and marks the key as most-recently-used.
- `put(key, value)` inserts/updates in O(1); if the cache is at capacity, evict the **least recently used** entry first.
- **The point of this exercise is that you build it yourself** — `LinkedHashMap`'s `removeEldestEntry` gives you this for free in three lines, and interviewers ask this specifically to see whether you understand *why* it's O(1), not whether you know a JDK class exists. Reach for the from-scratch version whenever you're asked to explain the internals.

## Class Design Rationale

- **Doubly linked list + hash map** is the only combination that gives O(1) for *all three* operations a real LRU needs: lookup by key (hash map), move-to-front on access, and evict-from-tail on overflow (both O(1) on a doubly linked list because you have direct pointers, unlike a singly linked list where removing a node requires knowing its predecessor).
- **Sentinel `head`/`tail` nodes** (dummy nodes that never hold real data) eliminate every null-check that would otherwise clutter `addToFront`/`removeNode` — there's always a real node on both sides of any node in the list, including the first and last real entries.
- The map stores `key -> Node`, not `key -> value` — you need the node reference to splice it in the linked list in O(1) without a list traversal.

```java
import java.util.HashMap;
import java.util.Map;

public class LRUCacheDemo {

    public static class LRUCache<K, V> {
        private final int capacity;
        private final Map<K, Node> cache = new HashMap<>();
        private final Node head = new Node(null, null); // most-recently-used side
        private final Node tail = new Node(null, null); // least-recently-used side

        private class Node {
            K key;
            V value;
            Node prev, next;
            Node(K key, V value) { this.key = key; this.value = value; }
        }

        public LRUCache(int capacity) {
            this.capacity = capacity;
            head.next = tail;
            tail.prev = head;
        }

        public V get(K key) {
            Node node = cache.get(key);
            if (node == null) return null;
            moveToFront(node);
            return node.value;
        }

        public void put(K key, V value) {
            Node existing = cache.get(key);
            if (existing != null) {
                existing.value = value;
                moveToFront(existing);
                return;
            }

            if (cache.size() == capacity) {
                Node lru = tail.prev;
                removeNode(lru);
                cache.remove(lru.key);
            }

            Node node = new Node(key, value);
            cache.put(key, node);
            addToFront(node);
        }

        private void addToFront(Node node) {
            node.prev = head;
            node.next = head.next;
            head.next.prev = node;
            head.next = node;
        }

        private void removeNode(Node node) {
            node.prev.next = node.next;
            node.next.prev = node.prev;
        }

        private void moveToFront(Node node) {
            removeNode(node);
            addToFront(node);
        }
    }

    public static void main(String[] args) {
        LRUCache<Integer, Integer> cache = new LRUCache<>(2);

        cache.put(1, 1);
        cache.put(2, 2);
        System.out.println(cache.get(1)); // 1 -> now key 2 is the least recently used

        cache.put(3, 3); // evicts key 2
        System.out.println(cache.get(2)); // null

        cache.put(4, 4); // evicts key 1
        System.out.println(cache.get(1)); // null
        System.out.println(cache.get(3)); // 3
        System.out.println(cache.get(4)); // 4
    }
}
```

## What Interviewers Probe Next

- "Make it thread-safe." → Either wrap every public method in a single `synchronized`/`ReentrantLock`, or note the trade-off: a global lock serializes all access (simple, correct, but no concurrency); a real high-throughput cache (like Caffeine) uses lock striping or a concurrent-friendly approximation of LRU instead.
- "Implement LFU instead." → You need a frequency count per key *and* a way to find the least-frequent-then-least-recent in O(1) — that requires a doubly linked list *of frequency buckets*, each bucket holding its own doubly linked list of keys. Significantly harder; know the shape of the answer even if you don't fully code it under time pressure.
- "What if values are expensive to compute and multiple threads might miss the cache simultaneously?" → Cache stampede — mention locking per-key during the fill, or a "compute once, others wait" pattern.
- "Why not just use `LinkedHashMap`?" → You should be able to say: `LinkedHashMap` with `accessOrder=true` maintains the same doubly-linked-list-plus-hash-map structure internally and overriding `removeEldestEntry` gives eviction for free — it's the right *production* choice, this from-scratch version is for demonstrating you understand what's happening underneath it.
