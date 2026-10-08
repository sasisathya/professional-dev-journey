# DSA Pattern Comparisons — "Which Pattern Do I Use?"

This folder exists for one problem: you know several patterns individually, but in an
interview you freeze for a second deciding **which one actually fits this problem**.
Each file below picks two (or more) commonly-confused patterns, solves the **same
problem with both**, and gives you a decision checklist.

## How to use this folder
1. Read a problem statement.
2. Scan the **Master Decision Cheat Sheet** below for a keyword/signal match.
3. Open the matching comparison file — read the "when to use which" table first, code second.
4. If still unsure, the comparison file solves one problem two ways so you can see the difference directly.

---

## Master Decision Cheat Sheet

| Signal in the problem | Likely pattern | Comparison file |
|---|---|---|
| "sorted array", find pair/triplet summing to X | Two Pointers | [01](01-two-pointers-vs-sliding-window.md) |
| "contiguous subarray/substring", longest/shortest/max/min | Sliding Window | [01](01-two-pointers-vs-sliding-window.md) |
| "sorted" + "find target/boundary/first-last position" | Binary Search | [02](02-binary-search-vs-two-pointers-vs-linear-scan.md) |
| Search space is monotonic (can be halved) even if array isn't literally sorted | Binary Search on Answer | [02](02-binary-search-vs-two-pointers-vs-linear-scan.md) |
| "shortest path", unweighted graph/grid | BFS | [03](03-dfs-vs-bfs-vs-backtracking.md), [04](04-shortest-path-family.md) |
| "does a path exist", connectivity, "count islands/components" | DFS or BFS (either works) | [03](03-dfs-vs-bfs-vs-backtracking.md) |
| "all combinations/permutations/subsets", "generate all valid..." | Backtracking | [03](03-dfs-vs-bfs-vs-backtracking.md) |
| "shortest path" + weighted, non-negative edges | Dijkstra | [04](04-shortest-path-family.md) |
| "shortest path" + negative edges / "detect negative cycle" | Bellman-Ford | [04](04-shortest-path-family.md) |
| "shortest path between **all** pairs" | Floyd-Warshall | [04](04-shortest-path-family.md) |
| "minimum number of coins/jumps/steps" — check if greedy breaks on an example first | Greedy vs DP | [05](05-greedy-vs-dynamic-programming.md) |
| "maximum/minimum ... choices affect future choices", overlapping subproblems | Dynamic Programming | [05](05-greedy-vs-dynamic-programming.md) |
| DP problem, but recursion tree is small / you want early-exit for unreachable states | Memoization (top-down) | [06](06-dp-memoization-vs-tabulation.md) |
| DP problem, need full table for space optimization or to avoid stack overflow | Tabulation (bottom-up) | [06](06-dp-memoization-vs-tabulation.md) |
| "connected components", "redundant connection", "union of sets", dynamic edge additions | Union-Find | [07](07-union-find-vs-dfs-bfs.md) |
| Static graph explored once, need actual path / full traversal order | DFS/BFS | [07](07-union-find-vs-dfs-bfs.md) |
| "kth largest/smallest", "top K frequent", streaming data | Heap | [08](08-heap-vs-sorting-for-top-k.md) |
| One-off computation, k is close to n, simplicity matters | Sorting | [08](08-heap-vs-sorting-for-top-k.md) |
| "prefix", "autocomplete", "starts with", many strings sharing prefixes | Trie | [09](09-trie-vs-hashmap-for-strings.md) |
| Exact match lookup only, no prefix requirement | HashMap | [09](09-trie-vs-hashmap-for-strings.md) |
| "next greater/smaller element", histogram, span problems | Monotonic Stack | [10](10-stack-vs-recursion-monotonic-stack.md) |
| Natural tree/graph recursive structure, risk of deep recursion | Recursion → convert to iterative stack if needed | [10](10-stack-vs-recursion-monotonic-stack.md) |

---

## Files in This Folder

1. **[Two Pointers vs Sliding Window](01-two-pointers-vs-sliding-window.md)**
2. **[Binary Search vs Two Pointers vs Linear Scan](02-binary-search-vs-two-pointers-vs-linear-scan.md)**
3. **[DFS vs BFS vs Backtracking](03-dfs-vs-bfs-vs-backtracking.md)**
4. **[Shortest Path Family: BFS vs Dijkstra vs Bellman-Ford vs Floyd-Warshall](04-shortest-path-family.md)**
5. **[Greedy vs Dynamic Programming](05-greedy-vs-dynamic-programming.md)**
6. **[DP: Memoization (Top-Down) vs Tabulation (Bottom-Up)](06-dp-memoization-vs-tabulation.md)**
7. **[Union-Find vs DFS/BFS for Connectivity](07-union-find-vs-dfs-bfs.md)**
8. **[Heap vs Sorting for Top-K Problems](08-heap-vs-sorting-for-top-k.md)**
9. **[Trie vs HashMap for String Problems](09-trie-vs-hashmap-for-strings.md)**
10. **[Monotonic Stack vs Recursion](10-stack-vs-recursion-monotonic-stack.md)**

Each file follows the same structure: **Side-by-side definitions → Decision table →
Same problem solved both ways (full runnable Java) → "Pick X when / Pick Y when" checklist.**
