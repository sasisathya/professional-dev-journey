# DSA Patterns - Quick Reference Card

## Pattern Dependency Tree

```
┌──────────────────────────────────────────────────────────────────┐
│                    TIER 0: FOUNDATIONS                           │
│           Arrays • Hash Tables • Sorting • Strings               │
└──────────────┬───────────────────────────────────────────────────┘
               │
       ┌───────┴────────────────────────┬────────────────────┐
       │                                │                    │
       ▼                                ▼                    ▼
┌─────────────────┐        ┌──────────────────┐   ┌──────────────┐
│  TIER 1A        │        │   TIER 1B        │   │   TIER 1C    │
│ Two Pointers ⭐ │        │ Binary Search ⭐ │   │   Sliding    │
│ (convergence)   │        │ (divide spaces)  │   │   Window ⭐   │
└────────┬────────┘        └──────────────────┘   └───────┬──────┘
         │                                                │
         │                                                │
    ┌────┴─────────────────┬──────────────────────┐───────┘
    │                      │                      │
    ▼                      ▼                      ▼
┌─────────┐         ┌───────────────┐    ┌──────────────────┐
│  Stack  │         │ Hash Map +    │    │ Monotonic Stack  │
│ LIFO    │         │ Frequency     │    │ Next Greater Elm │
└────┬────┘         └───────────────┘    └──────────────────┘
     │
     └──────┬─────────────┬────────────┐
            │             │            │
            ▼             ▼            ▼
     ┌──────────┐  ┌──────────┐  ┌──────────┐
     │ Tree DFS │  │ Interval │  │ Bit Manip│
     │ Recursion│  │ Merge    │  │ XOR/Bits │
     └────┬─────┘  └──────────┘  └──────────┘
          │
    ┌─────┴──────────────────┐
    │                        │
    ▼                        ▼
┌─────────────┐        ┌─────────────┐
│ Tree BST    │        │  Backtrack  │
│ O(log n)    │        │  Explore    │
│ Search      │        │  All paths  │
└────┬────────┘        └──────┬──────┘
     │                        │
     │                   ┌────┴────────┐
     │                   │             │
     ▼                   ▼             ▼
┌──────────────┐  ┌────────────┐  ┌──────────┐
│ Graph BST    │  │ N-Queens   │  │ Permute  │
│ / Tree 2Sum  │  │ Sudoku     │  │ Combine  │
└──────────────┘  └────────────┘  └──────────┘
     │
     └──────────┬─────────────┐
                │             │
                ▼             ▼
         ┌──────────────┐  ┌─────────────┐
         │ Graph BFS    │  │ Union-Find  │
         │ Level-order  │  │ Components  │
         │ Shortest     │  │ Cycle       │
         └──────────────┘  └──────┬──────┘
                                  │
                    ┌─────────────┴─────────┐
                    │                       │
                    ▼                       ▼
            ┌──────────────┐         ┌──────────────┐
            │ Topological  │         │ Greedy       │
            │ Sort         │         │ Activity Sel │
            │ Kahn/Tarjan  │         │ Interval     │
            └──────────────┘         └──────────────┘
                    │                       │
                    │                       │
                    └─────────────┬─────────┘
                                  │
                                  ▼
                          ┌──────────────┐
                          │ Dynamic      │
                          │ Programming  │
                          │ Memoization  │
                          └──────────────┘
```

---

## 40-Pattern Summary Grid

### TIER 0: FOUNDATIONS (Must Master)
| Pattern | Time | Space | Use Case | Prerequisites |
|---------|------|-------|----------|---------------|
| **Arrays** | O(1) access | O(n) | Indexed data | None |
| **Hash Maps** | O(1) avg | O(n) | Fast lookup | None |
| **Sorting** | O(n log n) | O(log n-n) | Ordered data | Comparison logic |

### TIER 1: FUNDAMENTAL PATTERNS (Build These)
| Pattern | Time | Space | LeetCode Examples | Key Insight |
|---------|------|-------|-------------------|-------------|
| **Two Pointers** ⭐ | O(n) | O(1) | 15, 167, 125 | Sorted array convergence |
| **Sliding Window** ⭐ | O(n) | O(k) | 3, 76, 209 | Fixed/variable expansion |
| **Binary Search** ⭐ | O(log n) | O(1) | 33, 34, 704 | Search space halving |
| **Hash Frequency** | O(n) | O(n) | 1, 49, 451 | Char/element counting |
| **Stack** | O(1) pop | O(n) | 20, 84, 739 | LIFO, expression eval |
| **Queue/Deque** | O(1) ops | O(n) | 239, 933, 1670 | FIFO, sliding max |
| **Heap** | O(log n) | O(n) | 23, 215, 295 | Top-K, min/max |

### TIER 2: DATA STRUCTURE PATTERNS
| Pattern | Time | Space | Use When | Real-world |
|---------|------|-------|----------|-----------|
| **Tree Traversal (DFS)** | O(n) | O(h) | Tree exploration | File systems |
| **Tree (BFS/Level-order)** | O(n) | O(w) | Width analysis | Social graphs |
| **BST Operations** | O(log n) avg | O(h) | Ordered search | Database indexes |
| **Graph DFS/BFS** | O(V+E) | O(V) | Connected components | Social networks |
| **Union-Find** | O(α(n)) | O(n) | Components/cycles | Percolation |
| **Trie** | O(m) | O(n*m) | Autocomplete | Search engines |

### TIER 3: ALGORITHM PATTERNS
| Pattern | Time | Space | LeetCode | When to Use |
|---------|------|-------|----------|-----------|
| **Dynamic Programming** ⭐ | Varies | Varies | 70, 91, 300 | Overlapping subproblems |
| **Backtracking** | O(k^n) | O(n) | 46, 51, 77 | Permutations/combinations |
| **Topological Sort** | O(V+E) | O(V) | 207, 210, 444 | Dependency graphs |
| **Greedy** | Varies | Varies | 45, 55, 122 | Optimal local choices |
| **Divide & Conquer** | Varies | O(h) | 23, 169, 395 | Merge problems |
| **Binary Search on Answer** | O(n log m) | O(1) | 1011, 1482, 1891 | Answer is binary |
| **Monotonic Stack** | O(n) | O(n) | 84, 85, 739 | Next greater/smaller |

### TIER 4: ADVANCED PATTERNS
| Pattern | Time | Space | Key Use | Real-world Application |
|---------|------|-------|---------|----------------------|
| **Segment Tree** | O(log n) | O(n) | Range queries | Time-series data |
| **Fenwick Tree** | O(log n) | O(n) | Cumulative sums | Database analytics |
| **Suffix Array/Tree** | O(n log n) | O(n) | Pattern matching | DNA sequences |
| **MST (Kruskal/Prim)** | O(E log E) | O(V) | Min cost connect | Network design |
| **Shortest Path** | O(V log V) | O(V) | Dijkstra, BFS | GPS navigation |
| **Interval Scheduling** | O(n log n) | O(n) | Meeting rooms | Calendar apps |
| **Bit Manipulation** | O(n) | O(1) | Flags, XOR | Cryptography |
| **Prefix Sum** | O(n) → O(1) | O(n) | Range sums | Analytics |
| **SCC (Tarjan)** | O(V+E) | O(V) | Cycles | Recommendation graphs |
| **Critical Path** | O(V+E) | O(V) | Longest path DAG | Project scheduling |

---

## Interview Frequency Matrix

```
PROBABILITY OF APPEARING IN INTERVIEW:

Two Pointers              ██████████ 95%
Hash Map/Table           ██████████ 95%
Binary Search            █████████░ 90%
Sorting                  █████████░ 90%
Sliding Window           █████████░ 85%
Trees (DFS/BFS)          █████████░ 85%
Dynamic Programming      ████████░░ 80%
Stack/Queue              ████████░░ 80%
Backtracking             ███████░░░ 75%
Strings                  ███████░░░ 75%
Graphs                   ██████░░░░ 70%
Heap/Priority Queue      ██████░░░░ 70%
Greedy                   █████░░░░░ 60%
Bit Manipulation         █████░░░░░ 55%
Union-Find               ████░░░░░░ 50%
Matrix/2D Array          ████░░░░░░ 50%
Intervals                ███░░░░░░░ 40%
Trie                     ███░░░░░░░ 35%
Monotonic Stack          ██░░░░░░░░ 30%
Advanced (Segment Tree)  ░░░░░░░░░░ 5-10%
```

---

## Complexity Cheat Sheet

### Time Complexity - Big O Hierarchy
```
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ) < O(n!)

Fast        ←────────────────────────────────────────→        Slow

1 ≈ 1       log n ≈ 10     n ≈ 1M      n² ≈ 1T      2ⁿ ≈ instant timeout
            (for n=1M)              (for n=1K)    (for n=20)
```

### Pattern Time Complexities
```
O(1):          Hash table lookup, Array access, Stack push/pop
O(log n):      Binary search, Balanced tree operations
O(n):          Single scan, Two pointers, Sliding window
O(n log n):    Sorting, Merge operations, Tree traversal
O(n²):         Nested loops, Bubble sort, DP on matrix
O(n³):         Triple nested loops, Floyd-Warshall
O(2ⁿ):         Backtracking all subsets, Fibonacci recursive
O(n!):         Permutations brute force
```

---

## Decision Tree: When to Use What Pattern

```
                     START: Problem Received
                             │
                ┌────────────┴────────────┐
                │                         │
            Can sort?                  Need pairs/triplets?
            /         \                /              \
         YES          NO             YES               NO
         │            │              │                │
      Sort it    Use Hash Map   → Two Pointers    → Check type
         │                          (if sorted)
         │                              │
         └──────────┬────────────┬─────┘
                    │            │
                    ▼            ▼
            Substring/subarray?  Need exploration?
            /            \       /           \
          YES            NO    YES           NO
           │              │     │             │
    Sliding Window   Binary     │         Path finding?
                      Search    │         /          \
                                │       YES          NO
                          DP + Hash   DFS/BFS      Hash Map
                          Two Sum     Topological
```

---

## Common Problem Patterns → Solutions

```
"Find two numbers that sum to X"           → Hash Map or Two Pointers
"Find subarray/substring with property"     → Sliding Window
"Search in sorted array"                    → Binary Search
"Find minimum/maximum in dataset"           → Heap or DP
"Count occurrences/frequency"               → Hash Map
"All permutations/combinations"             → Backtracking
"Connected components/groups"               → Union-Find or DFS
"Longest increasing subsequence"            → DP (O(n log n) optimal)
"Matrix path/grid traversal"                → DFS/BFS or DP
"Merge k sorted lists"                      → Heap (min-heap)
"Next greater/smaller element"              → Monotonic Stack
"Topological order"                         → Kahn's algorithm
"Shortest path in unweighted graph"         → BFS
"Shortest path in weighted graph"           → Dijkstra or Bellman-Ford
"Word ladder/transformation"                → BFS level-by-level
"Palindrome check"                          → Two Pointers or Expand
"Buy/sell stock optimal"                    → Greedy or DP
"Maximum subarray sum"                      → Kadane's algorithm (DP)
"Partition array into K groups"             → Greedy or DP
```

---

## Learning Week-by-Week Plan

```
WEEK 1-2: Absolute Fundamentals
├─ Arrays & Strings manipulation
├─ Hash Maps for fast lookup
├─ Sorting (understand the algorithms)
└─ Basic complexity analysis

WEEK 3: Core Techniques
├─ Two Pointers (convergence pattern)
├─ Binary Search (divide & conquer)
└─ Apply to: Two Sum II, Merge intervals

WEEK 4: Sliding Window Mastery
├─ Fixed window (consecutive K elements)
├─ Variable window (expand/contract logic)
└─ Apply to: Substring problems, Frequency

WEEK 5: Data Structure Basics
├─ Stack (LIFO, expression eval)
├─ Queue (FIFO, BFS foundation)
├─ Heap (Top-K, merging)
└─ Custom data structures

WEEK 6-7: Tree & Recursion
├─ Tree DFS (pre/in/post-order)
├─ Tree BFS (level-order)
├─ BST properties & operations
└─ Understand recursion stack

WEEK 8-9: Graphs & Connectivity
├─ Graph DFS/BFS (same as trees)
├─ Connected components (Union-Find)
├─ Topological sort
└─ Shortest path basics

WEEK 10-12: Dynamic Programming
├─ 1D DP (Fibonacci variants)
├─ 2D DP (Matrix paths, knapsack)
├─ Memoization vs tabulation
└─ DP optimization techniques

WEEK 13: Backtracking & Combinations
├─ Permutations (n!)
├─ Combinations (n choose k)
├─ Pruning strategy
└─ N-Queens, Sudoku

WEEK 14+: Refinement & Specialization
├─ Bit manipulation for optimizations
├─ Greedy algorithms & proofs
├─ Advanced data structures (Trie, Segment Tree)
├─ Problem-specific optimizations
└─ Mock interviews & weak spots
```

---

## Pro Debugging Guide

**TLE (Time Limit Exceeded)?**
- Nested loops O(n²) → Try two pointers, sliding window, or sorting
- Repeated calculations → Add memoization (DP)
- Graph search naive → Use BFS/DFS properly or Union-Find

**MLE (Memory Limit Exceeded)?**
- Storing all intermediate results → Use space optimization
- Recursion stack too deep → Iterative approach
- Large data structures → Think about what's actually needed

**Wrong Answer?**
- Edge cases: empty array, single element, duplicates, negatives
- Off-by-one errors in loops and boundaries
- Incorrect pointer/index movement
- Not handling base cases in recursion

**Not finishing in time?**
- Spend more time understanding the problem
- Identify the pattern (is this two sum variant? sliding window?)
- Code template from memory (faster than thinking from scratch)
- Test with examples before submitting

---

## Quick Template Library

### Two Pointers (Sorted Array)
```python
left, right = 0, len(arr) - 1
while left < right:
    if arr[left] + arr[right] == target:
        return [left, right]
    elif arr[left] + arr[right] < target:
        left += 1
    else:
        right -= 1
```

### Sliding Window (Variable)
```python
left = 0
for right in range(len(s)):
    # Add s[right] to window
    while condition_violated:
        # Remove s[left] from window
        left += 1
    # Process current window
```

### Binary Search
```python
left, right = 0, len(arr) - 1
while left <= right:
    mid = (left + right) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        left = mid + 1
    else:
        right = mid - 1
return -1
```

### Tree DFS
```python
def dfs(node):
    if not node:
        return
    # Pre-order: process before children
    dfs(node.left)
    dfs(node.right)
    # Post-order: process after children
```

### Backtracking
```python
def backtrack(path, choices):
    if is_solution(path):
        result.append(path[:])
        return
    for choice in choices:
        path.append(choice)
        backtrack(path, remaining_choices)
        path.pop()
```

---

**Reference Card Version:** 2.0 | **Last Updated:** 2026-08-23 | **Status:** Interview Ready
