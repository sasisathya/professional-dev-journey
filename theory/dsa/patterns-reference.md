# DSA Patterns Reference - 40+ Interview Essential Patterns

## Quick Pattern Index by Category

```json
{
  "PATTERN_DEPENDENCY_PYRAMID": {
    "TIER_0_FOUNDATIONS": [
      "Arrays & Lists", "Hash Tables", "Sorting"
    ],
    "TIER_1_FUNDAMENTAL_PATTERNS": [
      "Two Pointers", "Sliding Window", "Binary Search"
    ],
    "TIER_2_DATA_STRUCTURE_PATTERNS": [
      "Hash Map/Set", "Stack", "Queue", "Heap"
    ],
    "TIER_3_COMPLEX_PATTERNS": [
      "Trees", "Graphs", "DP", "Backtracking"
    ],
    "TIER_4_ADVANCED_PATTERNS": [
      "Bit Manipulation", "Greedy", "Divide & Conquer"
    ]
  }
}
```

---

## TIER 0: FOUNDATIONAL (Must Master First)

### 1. ARRAYS & LISTS
- **Category:** Data Structure
- **Key Problems:** LeetCode 1, 26, 27, 189, 283
- **Time/Space:** O(1) access, O(n) insert/delete | O(n) space
- **When to Use:** Need indexed random access, sequential processing
- **Real-world:** Database rows, fixed-size buffers, cache arrays
- **Prerequisites:** None

### 2. HASH TABLES (Maps/Dicts)
- **Category:** Data Structure
- **Key Problems:** LeetCode 1, 242, 290, 205
- **Time/Space:** O(1) avg lookup, O(n) worst | O(n) space
- **When to Use:** Need O(1) lookup, frequency counting, mapping
- **Real-world:** Cache systems, database indexes, DNS lookup
- **Prerequisites:** None

### 3. SORTING FUNDAMENTALS
- **Category:** Algorithmic
- **Key Problems:** LeetCode 3, 179, 948, 1356
- **Time/Space:** O(n log n) time, O(log n) to O(n) space
- **When to Use:** Need ordered data, decision-based comparisons
- **Real-world:** Database queries, priority systems, payment processing
- **Prerequisites:** None
- **Classic Algorithms:** Merge Sort, Quick Sort, Heap Sort

---

## TIER 1: FUNDAMENTAL PATTERNS (Build Next)

### 4. TWO POINTERS ⭐
- **Category:** Technique
- **Key Problems:** LeetCode 15, 16, 18, 125, 167, 344
- **Time/Space:** O(n) time, O(1) space (often)
- **When to Use:** Sorted array, find pairs/triplets, palindrome
- **Real-world:** Buffer validation, pair matching algorithms
- **Prerequisites:** Arrays, Sorting
- **Variants:** 
  - Convergence (left++, right--)
  - Same-direction (slow, fast)
  - Mirror (start, end)

### 5. SLIDING WINDOW ⭐
- **Category:** Technique
- **Key Problems:** LeetCode 3, 76, 209, 438, 567, 1004
- **Time/Space:** O(n) time, O(k) space (k = window/charset)
- **When to Use:** Contiguous subarray, substring, fixed/variable size
- **Real-world:** Network packet processing, video streaming buffers
- **Prerequisites:** Two Pointers, Hash Tables
- **Variants:**
  - Fixed window size
  - Variable window (expand/contract)
  - Multiple pointers

### 6. BINARY SEARCH ⭐
- **Category:** Algorithm
- **Key Problems:** LeetCode 33, 34, 35, 162, 704, 878
- **Time/Space:** O(log n) time, O(1) space (iterative)
- **When to Use:** Sorted array, find target/boundary, answer is binary
- **Real-world:** Database queries, API pagination, load balancing
- **Prerequisites:** Arrays, Sorting
- **Variants:**
  - Classic search
  - Find first/last occurrence
  - Binary search on answer
  - Rotated array search

---

## TIER 2: DATA STRUCTURE PATTERNS

### 7. HASH MAP FREQUENCY COUNTING
- **Category:** Pattern
- **Key Problems:** LeetCode 1, 149, 242, 49, 394, 451
- **Time/Space:** O(n) time, O(n) space
- **When to Use:** Frequency, anagrams, character counting
- **Real-world:** Sentiment analysis, spam detection, duplicate detection
- **Prerequisites:** Hash Tables

### 8. STACK
- **Category:** Data Structure
- **Key Problems:** LeetCode 20, 71, 150, 224, 1249, 735
- **Time/Space:** O(1) push/pop, O(n) space
- **When to Use:** LIFO pattern, expression evaluation, undo/redo
- **Real-world:** Browser back button, function call stack, DFS
- **Prerequisites:** None
- **Patterns:** Monotonic stack, balanced parentheses

### 9. QUEUE & DEQUE
- **Category:** Data Structure
- **Key Problems:** LeetCode 933, 1670, 346, 239, 1438
- **Time/Space:** O(1) enqueue/dequeue, O(n) space
- **When to Use:** FIFO pattern, BFS, sliding window maximum
- **Real-world:** Message queues, printer jobs, rate limiting
- **Prerequisites:** None

### 10. HEAP / PRIORITY QUEUE
- **Category:** Data Structure
- **Key Problems:** LeetCode 23, 215, 295, 347, 692, 1046
- **Time/Space:** O(log n) insert/remove, O(n) space
- **When to Use:** Top-k, merge k lists, median, frequency
- **Real-world:** Task scheduling, load balancing, network routers
- **Prerequisites:** None (but Trees help conceptually)
- **Variants:** Min-heap, Max-heap, custom comparator

---

## TIER 3: COMPLEX PATTERNS

### 11. TREE TRAVERSAL (DFS)
- **Category:** Algorithm
- **Key Problems:** LeetCode 94, 98, 144, 145, 236, 235
- **Time/Space:** O(n) time, O(h) space (h = height)
- **When to Use:** Tree processing, depth-first exploration
- **Real-world:** File system traversal, AST parsing, game trees
- **Prerequisites:** Recursion, Trees
- **Variants:** Pre-order, In-order, Post-order

### 12. TREE BREADTH SEARCH (BFS)
- **Category:** Algorithm
- **Key Problems:** LeetCode 102, 103, 107, 637, 515, 1609
- **Time/Space:** O(n) time, O(w) space (w = max width)
- **When to Use:** Level-order, shortest path, width analysis
- **Real-world:** Social network graph layers, image processing
- **Prerequisites:** Trees, Queue
- **Connection:** Two Pointers + Queue = Level-order traversal

### 13. BINARY SEARCH TREE OPERATIONS
- **Category:** Data Structure Pattern
- **Key Problems:** LeetCode 98, 230, 333, 1008, 1305
- **Time/Space:** O(log n) avg, O(n) worst | O(h) space
- **When to Use:** Ordered data, range queries, sorted stream
- **Real-world:** Database B-trees, file system indexes
- **Prerequisites:** Tree Traversal, Binary Search
- **Operations:** Insert, Delete, Search, In-order traversal

### 14. GRAPH TRAVERSAL (DFS/BFS)
- **Category:** Algorithm
- **Key Problems:** LeetCode 200, 133, 399, 207, 210, 332
- **Time/Space:** O(V + E) time, O(V) space
- **When to Use:** Connected components, cycles, paths
- **Real-world:** Social networks, recommendation engines, GPS
- **Prerequisites:** Tree Traversal, Queue/Stack
- **Variants:** DFS, BFS, Topological sort

### 15. TOPOLOGICAL SORT
- **Category:** Algorithm
- **Key Problems:** LeetCode 207, 210, 310, 444, 269
- **Time/Space:** O(V + E) time, O(V) space
- **When to Use:** Dependency resolution, task scheduling
- **Real-world:** Build systems, course prerequisites, Makefile
- **Prerequisites:** Graph, DFS/BFS
- **Methods:** DFS-based, Kahn's algorithm

### 16. UNION-FIND (DISJOINT SET)
- **Category:** Data Structure
- **Key Problems:** LeetCode 200, 721, 765, 1319, 1697
- **Time/Space:** O(α(n)) amortized, O(n) space
- **When to Use:** Connected components, cycle detection, grouping
- **Real-world:** Percolation, image processing, friendship networks
- **Prerequisites:** None
- **Variants:** With path compression, Union by rank

### 17. DYNAMIC PROGRAMMING ⭐
- **Category:** Problem-solving technique
- **Key Problems:** LeetCode 70, 91, 121, 139, 300, 1143
- **Time/Space:** Problem-dependent (often O(n^2) or O(nm))
- **When to Use:** Overlapping subproblems, optimal substructure
- **Real-world:** Resource allocation, sequence alignment, RNA folding
- **Prerequisites:** Recursion, Hash Tables
- **Patterns:**
  - 1D DP (Fibonacci-like)
  - 2D DP (Matrix paths)
  - Tree DP (House Robber III)
  - Digit DP (Count numbers)

### 18. BACKTRACKING
- **Category:** Problem-solving technique
- **Key Problems:** LeetCode 17, 39, 46, 51, 77, 79, 212
- **Time/Space:** Exponential O(k^n), O(n) recursion stack
- **When to Use:** Permutations, combinations, puzzle solving
- **Real-world:** Sudoku solver, N-Queens, spell checker
- **Prerequisites:** Recursion, Trees
- **Pruning:** Early termination for efficiency

---

## TIER 4: ADVANCED PATTERNS

### 19. SLIDING WINDOW + HASH MAP
- **Category:** Combined Pattern
- **Key Problems:** LeetCode 3, 30, 76, 438, 567, 1456
- **Time/Space:** O(n) time, O(k) space
- **When to Use:** Character frequency in window, anagrams
- **Real-world:** Plagiarism detection, biometric matching
- **Prerequisites:** Sliding Window, Hash Map
- **Complexity:** Single pass, O(1) per operation

### 20. BINARY SEARCH + SORTING
- **Category:** Combined Pattern
- **Key Problems:** LeetCode 34, 35, 33, 153, 154, 378
- **Time/Space:** O(n log n + log n) time, O(1) space
- **When to Use:** Range search, rotated sorted array, kth element
- **Real-world:** Database indexing, log analysis
- **Prerequisites:** Binary Search, Sorting

### 21. MONOTONIC STACK
- **Category:** Advanced Technique
- **Key Problems:** LeetCode 84, 85, 156, 739, 901, 907
- **Time/Space:** O(n) time, O(n) space
- **When to Use:** Next greater element, largest rectangle
- **Real-world:** Stock trading, inventory management
- **Prerequisites:** Stack
- **Insight:** Each element visited once, efficient O(n) solution

### 22. SEGMENT TREE / FENWICK TREE
- **Category:** Data Structure
- **Key Problems:** LeetCode 307, 308, 327, 493, 1649
- **Time/Space:** O(log n) query/update, O(n) space
- **When to Use:** Range sum, range max/min, point updates
- **Real-world:** Time-series data, database range queries
- **Prerequisites:** Binary Trees, Recursion
- **Trade-off:** O(n) preprocessing, O(log n) per operation

### 23. GREEDY ALGORITHM
- **Category:** Problem-solving technique
- **Key Problems:** LeetCode 45, 55, 122, 135, 455, 1217
- **Time/Space:** Varies, often O(n) or O(n log n)
- **When to Use:** Optimization with local best choices
- **Real-world:** Huffman coding, activity selection, job scheduling
- **Prerequisites:** None specific, but problem understanding critical
- **Key insight:** Prove that greedy choice is globally optimal

### 24. DIVIDE AND CONQUER
- **Category:** Problem-solving technique
- **Key Problems:** LeetCode 23, 169, 215, 241, 395, 1610
- **Time/Space:** Often O(n log n), varies by recurrence
- **When to Use:** Merge k-sorted lists, majority element, closest pair
- **Real-world:** Merge sort, parallel processing, distributed computing
- **Prerequisites:** Recursion
- **Master Theorem:** Analyze time complexity via recurrence

### 25. BIT MANIPULATION
- **Category:** Technique
- **Key Problems:** LeetCode 136, 137, 260, 191, 1342, 1680
- **Time/Space:** O(n) or O(1) time, O(1) space (usually)
- **When to Use:** Flags, single number problems, power of 2
- **Real-world:** Network masks, cryptography, compression
- **Prerequisites:** None
- **Operations:** AND, OR, XOR, shifts, bit testing

### 26. TWO POINTERS ON LINKED LIST
- **Category:** Technique
- **Key Problems:** LeetCode 141, 142, 160, 203, 206
- **Time/Space:** O(n) time, O(1) space (usually)
- **When to Use:** Cycle detection, middle element, intersection
- **Real-world:** Memory cycle detection, duplicate removal
- **Prerequisites:** Linked Lists, Two Pointers
- **Patterns:** Floyd's cycle detection, slow-fast pointer

### 27. STRING MATCHING
- **Category:** Algorithm
- **Key Problems:** LeetCode 28, 214, 459, 686, 1268
- **Time/Space:** O(n+m) time (with KMP), O(m) space
- **When to Use:** Substring search, pattern matching
- **Real-world:** Text editors, regex engines, DNA sequence matching
- **Prerequisites:** Strings, Pattern thinking
- **Algorithms:** Brute force, KMP, Boyer-Moore, Rabin-Karp

### 28. MATRIX TRAVERSAL
- **Category:** Technique
- **Key Problems:** LeetCode 48, 54, 59, 73, 289, 1905
- **Time/Space:** O(mn) time, O(1) space (sometimes)
- **When to Use:** 2D grid processing, spiral, snake traversal
- **Real-world:** Image processing, game boards, spreadsheets
- **Prerequisites:** Nested loops, 2D indexing
- **Patterns:** Spiral, snake, diagonal, layer-by-layer

---

## TIER 5: SPECIALIZED PATTERNS

### 29. PREFIX SUM / CUMULATIVE SUM
- **Category:** Technique
- **Key Problems:** LeetCode 238, 303, 304, 560, 930
- **Time/Space:** O(n) preprocessing, O(1) query | O(n) space
- **When to Use:** Range sum query, subarray sum equals k
- **Real-world:** Sales analytics, financial calculations
- **Prerequisites:** Arrays
- **Extension:** 2D prefix sum for matrix queries

### 30. TRIE (PREFIX TREE)
- **Category:** Data Structure
- **Key Problems:** LeetCode 208, 211, 212, 677, 1268
- **Time/Space:** O(m) search (m = word length), O(ALPHABET * N)
- **When to Use:** Autocomplete, spell checker, word search
- **Real-world:** Search engines, phone autocomplete, IP routing
- **Prerequisites:** Trees, Hash Maps
- **Optimization:** Suffix tree for advanced string problems

### 31. GRAPH - MINIMUM SPANNING TREE
- **Category:** Algorithm
- **Key Problems:** LeetCode 1135, 1584, 1168, 1202, 1489
- **Time/Space:** O(E log E) Kruskal, O(E log V) Prim | O(V)
- **When to Use:** Minimum cost connectivity, network design
- **Real-world:** Network infrastructure, power grid, clustering
- **Prerequisites:** Graph, Sorting, Union-Find
- **Algorithms:** Kruskal, Prim, Borůvka

### 32. GRAPH - SHORTEST PATH
- **Category:** Algorithm
- **Key Problems:** LeetCode 743, 787, 882, 1631, 1786
- **Time/Space:** O(V^2) Dijkstra, O(VE) Bellman-Ford
- **When to Use:** Single source, all pairs shortest path
- **Real-world:** GPS navigation, network routing, game AI
- **Prerequisites:** Graph, Heap, Priority Queue
- **Algorithms:** Dijkstra, Bellman-Ford, Floyd-Warshall, A*

### 33. INTERVAL SCHEDULING / MERGING
- **Category:** Technique
- **Key Problems:** LeetCode 56, 57, 435, 452, 1288, 1851
- **Time/Space:** O(n log n) time (sorting), O(n) space
- **When to Use:** Meeting room, calendar events, interval overlap
- **Real-world:** Calendar apps, task scheduling, resource booking
- **Prerequisites:** Sorting, Two Pointers
- **Insight:** Sort by start/end strategically

### 34. SUFFIX ARRAY / SUFFIX TREE
- **Category:** Advanced Data Structure
- **Key Problems:** LeetCode 1044 (hard), competitive programming
- **Time/Space:** O(n log n) construction, O(n) space
- **When to Use:** Multiple pattern matching, longest common substring
- **Real-world:** DNA matching, text compression, data deduplication
- **Prerequisites:** Sorting, Pattern Matching
- **Note:** Less common in interviews, but powerful

### 35. MATH PATTERNS - NUMBER THEORY
- **Category:** Algorithm
- **Key Problems:** LeetCode 168, 172, 365, 1041, 1808
- **Time/Space:** Varies, often O(log n) for GCD
- **When to Use:** GCD/LCM, prime factorization, modular arithmetic
- **Real-world:** Cryptography, error correction, resource allocation
- **Prerequisites:** Recursion, Modular arithmetic understanding
- **Key concepts:** GCD (Euclidean), Fermat's little theorem

### 36. RESERVOIR SAMPLING
- **Category:** Technique
- **Key Problems:** LeetCode 382, 398, 1030 (variants)
- **Time/Space:** O(n) time, O(k) space (k = sample size)
- **When to Use:** Random sampling from stream, unknown size
- **Real-world:** Analytics, large dataset sampling, load balancing
- **Prerequisites:** Probability understanding
- **Insight:** Uniform probability for each element

### 37. SLIDING WINDOW + DEQUE
- **Category:** Combined Pattern
- **Key Problems:** LeetCode 239, 1438, 862, 1696, 1762
- **Time/Space:** O(n) time, O(k) space (k = window size)
- **When to Use:** Sliding window max/min, constrained elements
- **Real-world:** Monitoring systems, video frame processing
- **Prerequisites:** Sliding Window, Deque, Monotonic thinking
- **Efficiency:** O(n) vs naive O(nk)

### 38. DIVIDE & CONQUER + DP (MATRIX CHAIN)
- **Category:** Combined Pattern
- **Key Problems:** LeetCode 312, 1039, 1547, 664, 546
- **Time/Space:** O(n^3) DP, O(n^2) space
- **When to Use:** Optimal partition, matrix multiplication chain
- **Real-world:** Compiler optimization, circuit layout
- **Prerequisites:** Divide & Conquer, Dynamic Programming
- **Insight:** All partition points tried, memoization used

### 39. GRAPH - STRONGLY CONNECTED COMPONENTS
- **Category:** Algorithm
- **Key Problems:** LeetCode 1192, 1568, 1443, 1391, 1340
- **Time/Space:** O(V + E) time, O(V) space
- **When to Use:** Condensation graph, circular dependencies
- **Real-world:** Recommendation systems, task dependency graphs
- **Prerequisites:** Graph DFS
- **Algorithms:** Tarjan's, Kosaraju's

### 40. CRITICAL PATH / LONGEST PATH IN DAG
- **Category:** Algorithm
- **Key Problems:** LeetCode 1857, 1203, 308, 1463
- **Time/Space:** O(V + E) time, O(V) space
- **When to Use:** Project scheduling, longest path in DAG
- **Real-world:** Project management, build systems
- **Prerequisites:** Topological Sort, Graph
- **Note:** NP-hard in general graphs, polynomial in DAGs

---

## REFERENCE QUICK LOOKUP

### By Interview Frequency (Most to Least Common)

```
TIER S (Every interview): 
  Two Pointers, Hash Map, Binary Search, Sorting

TIER A (90% of interviews):
  Sliding Window, Trees, Stack, DP, Backtracking

TIER B (60% of interviews):
  Graphs, Heap, Strings, BFS, Greedy

TIER C (40% of interviews):
  Bit Manipulation, Matrices, Union-Find, Intervals

TIER D (20% of interviews):
  Trie, Segment Tree, Math, Greedy (advanced)
```

### By Time Complexity

```
O(1):        Direct lookup, math operations
O(log n):    Binary search, Heap operations, balanced trees
O(n):        Single pass, Two Pointers, Sliding Window
O(n log n):  Sorting, Merge operations, Binary search tree operations
O(n^2):      Nested loops, DP on 2D, Bubble Sort
O(n^3):      3D DP, Matrix chain multiplication
O(2^n):      Backtracking, Subset generation
O(n!):       Permutations, TSP brute force
```

---

## LEARNING PROGRESSION CHECKLIST

```
WEEK 1-2: FUNDAMENTALS
[ ] Arrays & Hash Tables
[ ] Two Pointers
[ ] Binary Search

WEEK 3: SLIDING WINDOW & STRINGS
[ ] Sliding Window (fixed & variable)
[ ] String patterns
[ ] Substring/subsequence problems

WEEK 4: DATA STRUCTURES
[ ] Stack & Queue
[ ] Heap/Priority Queue
[ ] Linked Lists

WEEK 5-6: TREES & GRAPHS
[ ] Tree Traversal (DFS/BFS)
[ ] Binary Search Trees
[ ] Graph basics (DFS/BFS)

WEEK 7-8: ADVANCED PATTERNS
[ ] Dynamic Programming
[ ] Backtracking
[ ] Greedy algorithms

WEEK 9+: REFINEMENT
[ ] Bit Manipulation
[ ] Advanced Graph (MST, Shortest Path)
[ ] Union-Find
[ ] Trie
[ ] Problem-specific optimizations
```

---

## COMPLEXITY REFERENCE TABLE

| Pattern | Best | Average | Worst | Space | Notes |
|---------|------|---------|-------|-------|-------|
| Two Pointers | O(n) | O(n) | O(n) | O(1) | Requires sorted input |
| Sliding Window | O(n) | O(n) | O(n) | O(k) | k = alphabet/window size |
| Binary Search | O(1) | O(log n) | O(log n) | O(1) | Requires sorted input |
| Hash Map | O(1) | O(1) | O(n) | O(n) | Collision dependent |
| Heap Insert/Delete | - | O(log n) | O(log n) | O(n) | N insertions = O(n log n) |
| BST Insert/Search | O(log n) | O(log n) | O(n) | O(h) | h = height, can degrade |
| BFS/DFS Graph | O(V+E) | O(V+E) | O(V+E) | O(V) | V vertices, E edges |
| DP 1D | O(n) | O(n) | O(n) | O(n) | Space can be O(1) sometimes |
| Backtracking | O(k^n) | O(k^n) | O(k^n) | O(n) | k = choices per step |
| Sorting | O(n log n) | O(n log n) | O(n^2)* | O(log n-n) | *QuickSort worst case |

---

## Pro Tips

1. **Two Pointers > Brute Force:** When you see two numbers summing/comparing, think two pointers on sorted array first.

2. **Sliding Window > Nested Loop:** Any substring/subarray with condition? Try sliding window for O(n) solution.

3. **Hash Map for Lookups:** Need O(1) lookup? Don't do nested loop - use hash map.

4. **Sorting Often Worth It:** One-time O(n log n) sort can unlock O(n) solution for whole problem.

5. **DP Memoization:** If you're recalculating same values, use memoization (top-down DP).

6. **Greedy Requires Proof:** Greedy looks simple but requires mathematical proof it's optimal.

7. **Precompute vs Query:** Decide wisely: O(n) preprocessing for O(1) queries vs O(n) per query.

8. **Monotonic Stack >> Nested Loop:** "Next greater element" type problems? Use monotonic stack for O(n).

9. **Union-Find for Components:** Connected components, cycles in undirected graphs? Use Union-Find.

10. **Topological Sort for Dependencies:** Task scheduling, prerequisites? Must use topological sort.

---

**Last Updated:** 2026-08-23 | **Coverage:** 40 Core Patterns | **Level:** Interview Ready
