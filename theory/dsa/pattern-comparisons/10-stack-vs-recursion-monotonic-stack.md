# Monotonic Stack vs Recursion

Recursion is the natural way to express "explore this, then explore what's left." A monotonic
stack is a specialized O(n) trick for a narrower class of problems — knowing which one applies
saves you from overcomplicating a simple problem, or oversimplifying a hard one.

## Core Difference

| | Monotonic Stack | Recursion (incl. converting to explicit stack) |
|---|---|---|
| **Definition** | A stack kept sorted (increasing or decreasing) by popping elements that violate the order before pushing the new one. | Function calls itself on a smaller subproblem; the call stack implicitly tracks "what to do next." |
| **Best for** | "Next greater/smaller element", histogram/skyline problems, span problems — anywhere the answer for element `i` depends on the nearest previous/next element satisfying an order condition. | Tree/graph traversal, divide-and-conquer, backtracking — anywhere the problem has a natural self-similar substructure. |
| **Complexity** | O(n) — each element is pushed and popped at most once. | Depends on the problem; recursion itself just adds O(depth) stack space. |
| **Stack overflow risk** | No — it's an explicit `Deque`/array, not the call stack. | Yes, for deep recursion (Java has no tail-call optimization) — convert to an **explicit stack + loop** if depth could exceed ~10,000. |
| **Signal words** | "next greater element", "daily temperatures", "largest rectangle in histogram", "trapping rain water" | "traverse the tree", "explore all paths", any problem you'd naturally describe as "for this node, first handle X, then Y" |

## Decision Checklist
1. Does the problem ask "for each element, what's the nearest element to the left/right that's bigger/smaller"? → **Monotonic Stack**, O(n), don't reach for anything fancier.
2. Is the structure naturally recursive (trees, nested expressions, backtracking)? → **Recursion** — it's the clearest code.
3. Worried about stack depth on a recursive solution (e.g., a heavily skewed tree, or n up to 10⁵)? → Convert the recursion to an **explicit stack + while loop**, same logic, no call-stack risk.

---

## Example 1 — Monotonic Stack: Daily Temperatures (next warmer day)

```java
import java.util.Deque;
import java.util.ArrayDeque;

public class MonotonicStackDemo {

    // For each day, how many days until a warmer temperature? 0 if none.
    // A naive approach checks every future day for every day: O(n^2).
    // Monotonic stack does it in O(n): keep a decreasing stack of "days still waiting for a warmer day."
    public static int[] dailyTemperatures(int[] temps) {
        int[] result = new int[temps.length];
        Deque<Integer> stack = new ArrayDeque<>(); // stores indices, temps are decreasing bottom to top

        for (int i = 0; i < temps.length; i++) {
            while (!stack.isEmpty() && temps[stack.peek()] < temps[i]) {
                int prevIndex = stack.pop();
                result[prevIndex] = i - prevIndex; // found the next warmer day for prevIndex
            }
            stack.push(i);
        }
        return result;
    }

    public static void main(String[] args) {
        int[] temps = {73, 74, 75, 71, 69, 72, 76, 73};
        System.out.println(java.util.Arrays.toString(dailyTemperatures(temps)));
        // [1, 1, 4, 2, 1, 1, 0, 0]
    }
}
```

## Example 2 — Recursion vs Explicit Stack: Same Tree Traversal, Two Ways

```java
import java.util.*;

public class RecursionVsExplicitStack {

    public static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    // ---------- Natural recursion ----------
    // Clean, but on a heavily skewed tree with ~50,000+ nodes this can StackOverflowError in Java.
    public static void inorderRecursive(TreeNode node, List<Integer> result) {
        if (node == null) return;
        inorderRecursive(node.left, result);
        result.add(node.val);
        inorderRecursive(node.right, result);
    }

    // ---------- Same traversal, explicit stack — no call-stack depth risk ----------
    public static List<Integer> inorderIterative(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        Deque<TreeNode> stack = new ArrayDeque<>();
        TreeNode current = root;

        while (current != null || !stack.isEmpty()) {
            while (current != null) {      // push left spine
                stack.push(current);
                current = current.left;
            }
            current = stack.pop();
            result.add(current.val);
            current = current.right;
        }
        return result;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(2);
        root.left = new TreeNode(1);
        root.right = new TreeNode(3);

        List<Integer> recursiveResult = new ArrayList<>();
        inorderRecursive(root, recursiveResult);

        System.out.println("Recursive: " + recursiveResult);       // [1, 2, 3]
        System.out.println("Iterative: " + inorderIterative(root)); // [1, 2, 3] — identical output
    }
}
```

## Pick Monotonic Stack when:
- The problem is about "nearest element satisfying an order relation" — next greater/smaller, spans, histogram-style area problems.

## Pick Recursion when:
- The problem has a natural recursive/self-similar structure and depth isn't a practical concern.

## Convert recursion to an explicit stack when:
- Depth could realistically exceed Java's default call stack (tens of thousands of frames), or you're asked to make an inherently recursive algorithm iterative.
