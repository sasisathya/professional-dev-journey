# Binary Search vs Two Pointers vs Linear Scan

All three "search" an array. The question is: **how much structure can you exploit to skip work?**

## Core Difference

| | Linear Scan | Two Pointers | Binary Search |
|---|---|---|---|
| **Definition** | Check every element once. | Two indices converge based on a comparison. | Repeatedly halve the search space using a monotonic condition. |
| **Requires** | Nothing. | Usually sortedness or a pairing structure. | A **monotonic** condition — "yes" answers and "no" answers each form one contiguous block. |
| **Complexity** | O(n) | O(n) | O(log n) |
| **Signal words** | No exploitable structure, must inspect every element. | "sorted array", "pair summing to X", "container with most water" | "sorted", "find first/last position", "minimum X such that condition holds" (binary search *on the answer*, not just the array) |

The subtlety interviewers probe: **binary search doesn't require a literally sorted array** — it requires that if you tested a value and got "yes", every "more extreme" value also gives "yes" (monotonicity). That's why "minimum capacity to ship packages in D days" is binary search even though there's no array to sort — you're binary searching over the *answer space*.

## Decision Checklist
1. Can I eliminate half the remaining search space with one check? → **Binary Search**, O(log n).
2. Is the array sorted and am I looking for a pair/triplet? → **Two Pointers**, O(n).
3. No structure to exploit at all? → **Linear Scan**, O(n) — and that's fine, don't force a fancier pattern.

---

## Example: Find the Peak Index in a Mountain Array

A mountain array increases then decreases. Find the peak. All three approaches shown so you can see the complexity gap directly.

```java
public class SearchApproachesComparison {

    // --- Linear Scan: O(n) --- check every element until it starts decreasing
    public static int peakLinear(int[] arr) {
        for (int i = 0; i < arr.length - 1; i++) {
            if (arr[i] > arr[i + 1]) {
                return i;
            }
        }
        return arr.length - 1;
    }

    // --- Two Pointers: still O(n) here — no monotonic halving available with this shape of scan ---
    public static int peakTwoPointers(int[] arr) {
        int left = 0, right = arr.length - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] < arr[mid + 1]) {
                left = mid + 1; // ascending -> peak is to the right
            } else {
                right = mid;    // descending -> peak is at or to the left
            }
        }
        return left;
    }

    // --- Binary Search: O(log n) --- same idea as above, framed explicitly as binary search
    // (this IS the correct pattern for this problem: the "is arr[mid] < arr[mid+1]" test is monotonic)
    public static int peakBinarySearch(int[] arr) {
        int low = 0, high = arr.length - 1;
        while (low < high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] < arr[mid + 1]) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }
        return low;
    }

    public static void main(String[] args) {
        int[] mountain = {1, 3, 5, 8, 12, 9, 6, 2};

        System.out.println("Linear scan found peak at index: " + peakLinear(mountain));         // O(n)
        System.out.println("Two-pointer/binary-search found peak at index: " + peakTwoPointers(mountain)); // O(log n)
        System.out.println("Binary search found peak at index: " + peakBinarySearch(mountain)); // O(log n)
    }
}
```

Notice `peakTwoPointers` and `peakBinarySearch` are the *same algorithm* — this problem is really a binary-search problem; "two pointers" converging via halving **is** binary search here, not the classic opposite-ends two-pointer walk from the previous file. That overlap is exactly why people mislabel patterns — the giveaway is **how much the search space shrinks per step**: by one element (linear/two-pointer sum-style) vs by half (binary search).

## Bonus: Binary Search on the Answer (no array at all)

```java
public class BinarySearchOnAnswer {

    // "Minimum days to eat all bananas at some speed k" style problem:
    // condition(speed) is monotonic: if speed k works, every speed > k also works.
    public static int minSpeedToFinish(int[] piles, int maxHours) {
        int low = 1, high = max(piles);
        while (low < high) {
            int mid = low + (high - low) / 2;
            if (canFinish(piles, mid, maxHours)) {
                high = mid;      // mid works -> try smaller speed
            } else {
                low = mid + 1;   // mid too slow -> need bigger speed
            }
        }
        return low;
    }

    private static boolean canFinish(int[] piles, int speed, int maxHours) {
        int hours = 0;
        for (int pile : piles) {
            hours += (pile + speed - 1) / speed; // ceil division
        }
        return hours <= maxHours;
    }

    private static int max(int[] arr) {
        int m = arr[0];
        for (int v : arr) m = Math.max(m, v);
        return m;
    }

    public static void main(String[] args) {
        int[] piles = {3, 6, 7, 11};
        System.out.println("Minimum eating speed: " + minSpeedToFinish(piles, 8)); // 4
    }
}
```

## Pick Linear Scan when:
- There's genuinely no structure to exploit, or n is small enough it doesn't matter.

## Pick Two Pointers when:
- Array is sorted and you're checking pairs/triplets against a target.

## Pick Binary Search when:
- You can phrase a **monotonic yes/no test**, either over array indices or over an abstract "answer" range.
