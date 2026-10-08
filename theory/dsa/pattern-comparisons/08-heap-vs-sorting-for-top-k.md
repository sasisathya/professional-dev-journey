# Heap vs Sorting for Top-K Problems

Both find "the K largest/smallest" — the choice comes down to **how much of the data you actually need to fully order**.

## Core Difference

| | Heap (Priority Queue) | Sorting |
|---|---|---|
| **Definition** | Maintain a heap of size K; for each new element, compare against the heap's worst element and swap if better. | Sort the entire array, then take the first/last K elements. |
| **Complexity** | O(n log k) | O(n log n) |
| **When k << n** | Wins clearly — you never pay for ordering the elements you'll discard. | Wastes time fully ordering elements you don't need. |
| **When k ≈ n** | No real advantage — you're basically sorting anyway with extra heap overhead. | Simpler code, same or better performance. |
| **Streaming / online data** | Works naturally — maintain a running heap as data arrives, no need to have it all upfront. | Requires re-sorting (or a more complex incremental structure) every time new data arrives. |
| **Signal words** | "kth largest **in a stream**", "top K frequent", k is small relative to n | "kth largest" as a one-off, k is close to n, or you need a full sorted order anyway for other reasons |

## Decision Checklist
1. Is k much smaller than n, and this is the only thing you need from the data? → **Heap**, O(n log k).
2. Is the data streaming/continuously arriving and you need "current top K" at any time? → **Heap** — sorting doesn't fit this access pattern at all.
3. Do you need a fully sorted result anyway, or is k close to n? → **Sorting** — simpler, and the heap's advantage disappears.

---

## Example: Kth Largest Element in an Array — Both Approaches

```java
import java.util.Arrays;
import java.util.PriorityQueue;

public class TopKComparison {

    // ---------- Sorting approach: O(n log n) ----------
    public static int kthLargestSorting(int[] nums, int k) {
        int[] copy = nums.clone();
        Arrays.sort(copy);
        return copy[copy.length - k];
    }

    // ---------- Heap approach: O(n log k) — maintain a MIN-heap of size k ----------
    // Why a min-heap for "Kth LARGEST"? The heap holds the k largest-seen-so-far elements;
    // the smallest of those k (the heap's root) is exactly the answer once we've seen everything.
    public static int kthLargestHeap(int[] nums, int k) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();

        for (int num : nums) {
            minHeap.offer(num);
            if (minHeap.size() > k) {
                minHeap.poll(); // discard the smallest — it can't be among the top k
            }
        }
        return minHeap.peek();
    }

    public static void main(String[] args) {
        int[] nums = {3, 2, 1, 5, 6, 4};
        int k = 2;

        System.out.println("Sorting approach: " + kthLargestSorting(nums, k)); // 5
        System.out.println("Heap approach:    " + kthLargestHeap(nums, k));    // 5
    }
}
```

## Where Heap's Advantage Is Obvious: Streaming Top-K

```java
import java.util.PriorityQueue;

public class StreamingTopK {

    // Maintains "current k largest values seen so far" as data streams in one at a time.
    // There is no equivalent "just sort it" option here — you don't have the full array to sort.
    public static class KthLargestStream {
        private final int k;
        private final PriorityQueue<Integer> minHeap = new PriorityQueue<>();

        public KthLargestStream(int k) { this.k = k; }

        public int add(int value) {
            minHeap.offer(value);
            if (minHeap.size() > k) {
                minHeap.poll();
            }
            return minHeap.peek();
        }
    }

    public static void main(String[] args) {
        KthLargestStream stream = new KthLargestStream(3);
        int[] incoming = {4, 5, 8, 2};
        for (int value : incoming) {
            System.out.println("After adding " + value + ", 3rd largest so far: " + stream.add(value));
        }
    }
}
```

## Pick Heap when:
- k is small relative to n.
- Data arrives as a stream and you need an up-to-date "top K" at any point.

## Pick Sorting when:
- You need a fully sorted result for other reasons anyway.
- k is close to n, or n is small enough that the complexity difference doesn't matter — favor the simpler code.
