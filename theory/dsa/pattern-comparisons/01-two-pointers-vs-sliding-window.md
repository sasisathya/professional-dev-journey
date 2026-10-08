# Two Pointers vs Sliding Window

Both use two indices moving through an array. The confusion is real — here's the actual difference.

## Core Difference

| | Two Pointers | Sliding Window |
|---|---|---|
| **Definition** | Two indices move independently (often from opposite ends, or one ahead of the other) to satisfy a condition, without necessarily maintaining a "current range" as the answer. | A **contiguous** window `[left, right]` expands/shrinks; the window itself (its content or size) is the thing you're optimizing. |
| **Typical direction** | Often start-and-end converging inward, or both moving forward at different speeds. | Both pointers generally move forward (`right` expands, `left` shrinks); window never "jumps around." |
| **Requires sorted input?** | Often yes (pair-sum problems rely on sortedness). | No — works on any array/string; the "order" that matters is contiguity, not sortedness. |
| **What you track** | The pair/triplet of elements at the pointers. | Aggregate state of everything currently inside the window (sum, count map, distinct chars). |
| **Complexity** | O(n) single pass | O(n) single pass (amortized — each element enters/leaves the window once) |
| **Classic signal words** | "sorted array", "pair/triplet that sums to X", "reverse in place" | "contiguous subarray/substring", "longest/shortest ... with condition" |

## Decision Checklist

- Is the input sorted (or can be sorted without losing what you need)? → lean **Two Pointers**.
- Does the answer have to be a **contiguous** run of elements, and does "condition satisfied" change as you add/remove one element at a time? → **Sliding Window**.
- If pointers need to jump/skip based on comparison (not just "shrink from left") → **Two Pointers**.

---

## Example 1 — Two Pointers: Two Sum II (sorted array, find pair summing to target)

```java
public class TwoPointersTwoSum {

    // Input is sorted — pointers converge from both ends.
    public static int[] twoSumSorted(int[] numbers, int target) {
        int left = 0, right = numbers.length - 1;
        while (left < right) {
            int sum = numbers[left] + numbers[right];
            if (sum == target) {
                return new int[]{left + 1, right + 1}; // 1-indexed, as LeetCode expects
            } else if (sum < target) {
                left++;   // need a bigger sum -> move left pointer up
            } else {
                right--;  // need a smaller sum -> move right pointer down
            }
        }
        throw new IllegalArgumentException("No solution");
    }

    public static void main(String[] args) {
        int[] numbers = {2, 7, 11, 15};
        int[] result = twoSumSorted(numbers, 9);
        System.out.println("Indices: " + result[0] + ", " + result[1]); // 1, 2
    }
}
```

## Example 2 — Sliding Window: Longest Substring Without Repeating Characters

```java
import java.util.HashMap;
import java.util.Map;

public class SlidingWindowLongestSubstring {

    // Window expands with `right`; shrinks from `left` only when the window becomes invalid.
    public static int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> lastSeenIndex = new HashMap<>();
        int left = 0;
        int maxLength = 0;

        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (lastSeenIndex.containsKey(c) && lastSeenIndex.get(c) >= left) {
                left = lastSeenIndex.get(c) + 1; // shrink window past the duplicate
            }
            lastSeenIndex.put(c, right);
            maxLength = Math.max(maxLength, right - left + 1);
        }
        return maxLength;
    }

    public static void main(String[] args) {
        System.out.println(lengthOfLongestSubstring("abcabcbb")); // 3 ("abc")
        System.out.println(lengthOfLongestSubstring("bbbbb"));    // 1 ("b")
        System.out.println(lengthOfLongestSubstring("pwwkew"));   // 3 ("wke")
    }
}
```

## Why You Can't Swap Them Here

- Two Sum II relies on **sortedness** to decide which pointer to move — there's no "window" being tracked, just a pair.
- Longest Substring has **no sortedness** to exploit, but it does have a contiguous-range requirement and a validity condition that changes incrementally as the window grows/shrinks — that incremental validity tracking is the signature of Sliding Window.

## Pick Two Pointers when:
- Array is sorted (or you sort it first) and you're looking for a pair/triplet with a sum/difference property.
- You're partitioning in-place (e.g., move zeroes, partition around a pivot).

## Pick Sliding Window when:
- You need the longest/shortest/count of **contiguous** subarrays/substrings satisfying a condition.
- The condition can be checked/updated in O(1) as one element enters or leaves the window.
