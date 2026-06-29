# Data Structures & Algorithms - Professional Interview Guide

## Table of Contents
1. [Complexity Analysis](#complexity-analysis)
2. [Arrays & Strings](#arrays--strings)
3. [Linked Lists](#linked-lists)
4. [Stacks & Queues](#stacks--queues)
5. [Trees & Graphs](#trees--graphs)
6. [Sorting & Searching](#sorting--searching)
7. [Dynamic Programming](#dynamic-programming)
8. [Common Patterns](#common-patterns)

---

## Complexity Analysis

### Time Complexity (Big O)
**Definition:** How runtime grows with input size (n).

**Common complexities:**
- **O(1):** Constant - Array access, hash map lookup
- **O(log n):** Logarithmic - Binary search, balanced BST
- **O(n):** Linear - Iterate array once
- **O(n log n):** Linearithmic - Merge sort, quicksort
- **O(n²):** Quadratic - Nested loops, bubble sort
- **O(2ⁿ):** Exponential - Recursive fibonacci
- **O(n!):** Factorial - Permutations

**Key takeaway:** O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)

---

### Space Complexity
**Definition:** Extra memory used relative to input size.

**Examples:**
- **O(1):** Few variables
- **O(n):** Array/list size n
- **O(n²):** 2D matrix

**Trade-offs:** Often trade space for time (memoization, hash maps).

**Key takeaway:** Analyze both time and space. Trade-offs exist.

---

## Arrays & Strings

### Arrays
**Definition:** Contiguous memory, fixed size (in most languages), O(1) random access.

**Operations:**
- **Access:** O(1)
- **Search:** O(n) unsorted, O(log n) sorted (binary search)
- **Insert/Delete:** O(n) (shifting required)

**Common problems:**
- Two pointers (sorted arrays)
- Sliding window (subarray problems)
- Kadane's algorithm (max subarray sum)

**Key takeaway:** O(1) access. O(n) insert/delete. Use two pointers, sliding window.

---

### Strings
**Immutable in many languages (Java, Python).** Concatenation creates new string (O(n)).

**Common operations:**
- **Length:** O(1)
- **Concatenation:** O(n) per concat, use StringBuilder for multiple
- **Substring:** O(n)
- **Compare:** O(n)

**Common problems:**
- Palindrome check (two pointers)
- Anagram detection (hash map or sort)
- Pattern matching (KMP algorithm)

**Key takeaway:** Immutable. Use StringBuilder for multiple concatenations.

---

### Hash Maps/Sets
**Hash Map:** Key-value pairs, O(1) average insert/lookup/delete.

**Hash Set:** Unique values, O(1) operations.

**Use cases:**
- Count frequency
- Find duplicates
- Two sum problem
- Substring problems

**Collision handling:** Chaining (linked lists) or open addressing.

**Key takeaway:** O(1) operations. Frequency counting, duplicates.

---

## Linked Lists

### Singly Linked List
**Structure:** Node with value + next pointer.

```java
class Node {
    int val;
    Node next;
}
```

**Operations:**
- **Access:** O(n) (must traverse)
- **Insert at head:** O(1)
- **Insert at tail:** O(n) without tail pointer, O(1) with tail
- **Delete:** O(n) (must find node)

**Common problems:**
- Reverse linked list
- Detect cycle (Floyd's algorithm)
- Merge two sorted lists
- Find middle (fast/slow pointers)

**Key takeaway:** O(n) access. O(1) insert at head. Use two pointers.

---

### Doubly Linked List
**Structure:** Node with value + next + prev pointers.

**Advantage:** Traverse backwards, O(1) delete with node reference.

**Disadvantage:** Extra memory for prev pointer.

**Key takeaway:** Two-way traversal. O(1) delete with reference.

---

### Common Techniques
**1. Two Pointers (Fast/Slow):**
- Find middle: slow moves 1, fast moves 2
- Detect cycle: fast catches slow if cycle exists

**2. Dummy Node:**
- Simplifies edge cases (empty list, delete head)

**3. Reverse:**
```java
prev = null
while (curr != null) {
    next = curr.next
    curr.next = prev
    prev = curr
    curr = next
}
```

**Key takeaway:** Two pointers, dummy node, reverse pattern.

---

## Stacks & Queues

### Stack (LIFO - Last In First Out)
**Operations:** push(), pop(), peek() - all O(1)

**Implementation:** Array or linked list.

**Use cases:**
- Function call stack
- Undo mechanism
- Balanced parentheses
- Depth-First Search (DFS)

**Common problems:**
- Valid parentheses
- Evaluate expression (postfix)
- Next greater element

**Key takeaway:** LIFO. O(1) operations. DFS, parentheses, expression eval.

---

### Queue (FIFO - First In First Out)
**Operations:** enqueue(), dequeue(), peek() - all O(1)

**Implementation:** Linked list or circular array.

**Use cases:**
- Breadth-First Search (BFS)
- Task scheduling
- Buffering

**Common problems:**
- BFS traversal
- Sliding window maximum (monotonic deque)
- LRU Cache (queue + hash map)

**Key takeaway:** FIFO. O(1) operations. BFS, scheduling.

---

### Monotonic Stack/Queue
**Monotonic Stack:** Elements in increasing or decreasing order.

**Use case:** Next greater/smaller element.

**Key takeaway:** Maintain order. Next greater/smaller problems.

---

## Trees & Graphs

### Binary Trees
**Structure:** Node with left and right children.

```java
class TreeNode {
    int val;
    TreeNode left, right;
}
```

**Traversals:**
- **Inorder (Left-Root-Right):** Sorted for BST
- **Preorder (Root-Left-Right):** Copy tree
- **Postorder (Left-Right-Root):** Delete tree
- **Level-order (BFS):** Queue-based

**Common problems:**
- Max depth (recursion)
- Lowest Common Ancestor (LCA)
- Validate BST
- Serialize/deserialize

**Key takeaway:** Inorder = sorted BST. Level-order = BFS. Recursion common.

---

### Binary Search Tree (BST)
**Property:** Left < Root < Right (all descendants)

**Operations:**
- **Search:** O(log n) balanced, O(n) skewed
- **Insert:** O(log n) balanced
- **Delete:** O(log n) balanced

**Balancing:** AVL tree, Red-Black tree maintain O(log n).

**Key takeaway:** Inorder = sorted. O(log n) operations if balanced.

---

### Graphs
**Representation:**
1. **Adjacency Matrix:** 2D array, O(V²) space, O(1) edge check
2. **Adjacency List:** Array of lists, O(V+E) space, O(degree) edge check

**Traversals:**
- **DFS (Depth-First Search):** Stack or recursion
- **BFS (Breadth-First Search):** Queue

**Common problems:**
- Shortest path (BFS for unweighted, Dijkstra for weighted)
- Cycle detection (DFS with visited set)
- Connected components (DFS/BFS)
- Topological sort (DFS or Kahn's algorithm)

**Key takeaway:** Adjacency list common. DFS = stack/recursion, BFS = queue.

---

### Graph Algorithms
**Dijkstra's Algorithm (Shortest Path):**
- Weighted graph, non-negative weights
- Priority queue (min-heap)
- O((V+E) log V)

**Bellman-Ford (Shortest Path):**
- Handles negative weights
- O(V*E)

**Kruskal's/Prim's (Minimum Spanning Tree):**
- Connect all nodes with minimum edge weight
- O(E log V)

**Key takeaway:** Dijkstra = non-negative, BFS = unweighted, Bellman-Ford = negative.

---

## Sorting & Searching

### Sorting Algorithms
**Bubble Sort:** O(n²), O(1) space, stable
**Selection Sort:** O(n²), O(1) space, unstable
**Insertion Sort:** O(n²), O(1) space, stable, good for small/nearly sorted

**Merge Sort:** O(n log n), O(n) space, stable
**Quick Sort:** O(n log n) average, O(n²) worst, O(log n) space, unstable
**Heap Sort:** O(n log n), O(1) space, unstable

**Comparison:**
- **Stable:** Merge sort, insertion sort (preserves equal element order)
- **In-place:** Quick sort, heap sort (O(1) space)
- **Best average:** Quick sort (cache-friendly)

**Key takeaway:** Merge = stable, Quick = fast average, Heap = guaranteed O(n log n).

---

### Binary Search
**Requirement:** Sorted array

**Template:**
```java
int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
```

**Complexity:** O(log n)

**Variants:**
- First/last occurrence
- Search in rotated sorted array
- Find peak element

**Key takeaway:** O(log n). Requires sorted input. mid = left + (right-left)/2.

---

## Dynamic Programming

### What is DP?
**Definition:** Break problem into overlapping subproblems, store results (memoization or tabulation).

**When to use:**
- **Overlapping subproblems:** Same subproblem computed multiple times
- **Optimal substructure:** Optimal solution contains optimal solutions to subproblems

**Key takeaway:** Avoid recomputation. Memoization (top-down) or tabulation (bottom-up).

---

### DP Approaches
**1. Memoization (Top-Down):**
- Recursion + cache (hash map, array)
```java
int fib(int n, int[] memo) {
    if (n <= 1) return n;
    if (memo[n] != 0) return memo[n];
    memo[n] = fib(n-1, memo) + fib(n-2, memo);
    return memo[n];
}
```

**2. Tabulation (Bottom-Up):**
- Iterative, fill DP table
```java
int fib(int n) {
    if (n <= 1) return n;
    int[] dp = new int[n+1];
    dp[0] = 0; dp[1] = 1;
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    return dp[n];
}
```

**Key takeaway:** Memoization = recursion + cache, Tabulation = iterative.

---

### Common DP Problems
**1D DP:**
- Fibonacci
- Climbing stairs
- House robber
- Longest Increasing Subsequence (LIS)

**2D DP:**
- Longest Common Subsequence (LCS)
- Edit distance
- 0/1 Knapsack
- Coin change

**Key takeaway:** Identify subproblem, define recurrence, build solution.

---

## Common Patterns

### Two Pointers
**Use case:** Sorted arrays, linked lists.

**Examples:**
- Two sum (sorted array)
- Remove duplicates
- Container with most water

**Template:**
```java
int left = 0, right = arr.length - 1;
while (left < right) {
    if (condition) left++;
    else right--;
}
```

**Key takeaway:** O(n) time, O(1) space. Sorted inputs.

---

### Sliding Window
**Use case:** Subarray/substring problems.

**Examples:**
- Maximum sum subarray of size k
- Longest substring without repeating characters
- Minimum window substring

**Template:**
```java
int left = 0;
for (int right = 0; right < arr.length; right++) {
    // Expand window
    while (condition) {
        // Shrink window
        left++;
    }
}
```

**Key takeaway:** O(n) time. Expand right, shrink left.

---

### Fast & Slow Pointers
**Use case:** Cycle detection, find middle.

**Examples:**
- Linked list cycle
- Find middle of linked list
- Happy number

**Key takeaway:** Fast moves 2x, slow moves 1x. Meet if cycle.

---

### BFS (Breadth-First Search)
**Use case:** Shortest path (unweighted), level-order traversal.

**Template:**
```java
Queue<Node> queue = new LinkedList<>();
queue.offer(start);
Set<Node> visited = new HashSet<>();
visited.add(start);

while (!queue.isEmpty()) {
    Node curr = queue.poll();
    for (Node neighbor : curr.neighbors) {
        if (!visited.contains(neighbor)) {
            visited.add(neighbor);
            queue.offer(neighbor);
        }
    }
}
```

**Key takeaway:** Queue. Level-by-level. Shortest path unweighted.

---

### DFS (Depth-First Search)
**Use case:** Explore all paths, backtracking.

**Template (Recursion):**
```java
void dfs(Node node, Set<Node> visited) {
    if (node == null || visited.contains(node)) return;
    visited.add(node);
    for (Node neighbor : node.neighbors) {
        dfs(neighbor, visited);
    }
}
```

**Key takeaway:** Recursion or stack. Explore deep.

---

### Backtracking
**Use case:** Generate all combinations/permutations.

**Examples:**
- Generate parentheses
- Subsets
- Permutations
- N-Queens

**Template:**
```java
void backtrack(List<Integer> current, ...) {
    if (base_case) {
        result.add(new ArrayList<>(current));
        return;
    }
    for (choice in choices) {
        current.add(choice);
        backtrack(current, ...);
        current.remove(current.size() - 1); // Undo choice
    }
}
```

**Key takeaway:** Try choice, recurse, undo. Generate all solutions.

---

### Greedy Algorithms
**Definition:** Make locally optimal choice at each step.

**Examples:**
- Activity selection (max non-overlapping intervals)
- Huffman coding
- Dijkstra's algorithm

**Not always optimal:** Sometimes DP required (0/1 knapsack).

**Key takeaway:** Locally optimal → globally optimal. Not always works.

---

## Interview Tips

1. **Clarify problem:** "Can array have negatives? Duplicates? Is it sorted?"
2. **Think aloud:** "I'll use two pointers since array is sorted."
3. **Start with brute force:** "Naive O(n²) solution is nested loops."
4. **Optimize:** "Hash map reduces to O(n)."
5. **Test edge cases:** "Empty array, single element, all duplicates."
6. **Analyze complexity:** "Time: O(n log n) for sorting. Space: O(n) for hash map."

**Practice platforms:** LeetCode, HackerRank, CodeSignal

**Key patterns:** Two pointers, sliding window, BFS/DFS, DP, backtracking

---

**Updated:** 2026-06-28 | **Level:** Intermediate-Advanced | **Format:** Interview-ready definitions
