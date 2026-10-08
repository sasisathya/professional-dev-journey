# DFS vs BFS vs Backtracking

All three "explore" a graph/tree/grid. The differences are about **order of exploration** and **whether you undo choices**.

## Core Difference

| | DFS | BFS | Backtracking |
|---|---|---|---|
| **Definition** | Go as deep as possible before backing up. Uses a stack (explicit or via recursion). | Explore level-by-level, nearest nodes first. Uses a queue. | DFS + explicitly **undo** a choice after exploring it, to try the next option — used to enumerate all valid configurations. |
| **Data structure** | Stack / recursion call stack | Queue | Stack / recursion, with an "undo" step |
| **Best for** | Connectivity, path existence, topological order, tree traversal, cycle detection | **Shortest path in unweighted graphs**, level-order processing | Generating all combinations/permutations/subsets, constraint satisfaction (N-Queens, Sudoku) |
| **Complexity** | O(V + E) | O(V + E) | Often exponential (it's enumerating a search tree) — pruning is what makes it tractable |
| **Signal words** | "is there a path", "count islands/components", "traverse the tree" | "shortest path", "minimum number of steps", "level order" | "all possible ...", "generate every valid ...", "count the number of ways to arrange" |

**The trap:** DFS and BFS both correctly solve "does a path exist" or "count connected components" — pick either. But **only BFS guarantees the shortest path** in an unweighted graph, because it explores in increasing distance order. DFS might find *a* path first that isn't the shortest one.

## Decision Checklist
1. Need the shortest path / minimum steps in an unweighted graph? → **BFS**, no exceptions.
2. Just need to know connectivity or explore everything reachable? → **DFS or BFS**, pick whichever is more convenient to code (DFS is usually less code via recursion).
3. Need to enumerate **all** valid configurations, trying and un-trying choices? → **Backtracking**.

---

## Example 1 — DFS vs BFS: Number of Islands (both correctly solve it)

```java
import java.util.LinkedList;
import java.util.Queue;

public class IslandsDfsVsBfs {

    public static int numIslandsDFS(char[][] grid) {
        int count = 0;
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[0].length; c++) {
                if (grid[r][c] == '1') {
                    count++;
                    sinkDFS(grid, r, c);
                }
            }
        }
        return count;
    }

    private static void sinkDFS(char[][] grid, int r, int c) {
        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] != '1') return;
        grid[r][c] = '0'; // mark visited
        sinkDFS(grid, r + 1, c);
        sinkDFS(grid, r - 1, c);
        sinkDFS(grid, r, c + 1);
        sinkDFS(grid, r, c - 1);
    }

    public static int numIslandsBFS(char[][] grid) {
        int count = 0;
        for (int r = 0; r < grid.length; r++) {
            for (int c = 0; c < grid[0].length; c++) {
                if (grid[r][c] == '1') {
                    count++;
                    sinkBFS(grid, r, c);
                }
            }
        }
        return count;
    }

    private static void sinkBFS(char[][] grid, int startR, int startC) {
        Queue<int[]> queue = new LinkedList<>();
        queue.add(new int[]{startR, startC});
        grid[startR][startC] = '0';

        int[][] directions = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        while (!queue.isEmpty()) {
            int[] cell = queue.poll();
            for (int[] d : directions) {
                int nr = cell[0] + d[0], nc = cell[1] + d[1];
                if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length && grid[nr][nc] == '1') {
                    grid[nr][nc] = '0';
                    queue.add(new int[]{nr, nc});
                }
            }
        }
    }

    public static void main(String[] args) {
        char[][] gridForDfs = {
            {'1','1','0','0'},
            {'1','1','0','0'},
            {'0','0','1','0'},
            {'0','0','0','1'}
        };
        char[][] gridForBfs = {
            {'1','1','0','0'},
            {'1','1','0','0'},
            {'0','0','1','0'},
            {'0','0','0','1'}
        };

        System.out.println("DFS island count: " + numIslandsDFS(gridForDfs)); // 3
        System.out.println("BFS island count: " + numIslandsBFS(gridForBfs)); // 3 — same answer, different traversal order
    }
}
```

## Example 2 — Why BFS (not DFS) for Shortest Path

```java
import java.util.*;

public class ShortestPathNeedsBfs {

    // Unweighted graph as adjacency list
    public static int shortestPathBFS(Map<Integer, List<Integer>> graph, int start, int target) {
        Queue<Integer> queue = new LinkedList<>();
        Map<Integer, Integer> distance = new HashMap<>();
        queue.add(start);
        distance.put(start, 0);

        while (!queue.isEmpty()) {
            int node = queue.poll();
            if (node == target) return distance.get(node);
            for (int neighbor : graph.getOrDefault(node, List.of())) {
                if (!distance.containsKey(neighbor)) {
                    distance.put(neighbor, distance.get(node) + 1);
                    queue.add(neighbor);
                }
            }
        }
        return -1; // unreachable
    }

    public static void main(String[] args) {
        // 0 - 1 - 3
        //  \     /
        //   2 --/
        Map<Integer, List<Integer>> graph = new HashMap<>();
        graph.put(0, List.of(1, 2));
        graph.put(1, List.of(0, 3));
        graph.put(2, List.of(0, 3));
        graph.put(3, List.of(1, 2));

        // BFS correctly returns 2 (0 -> 2 -> 3), the shortest path.
        // A DFS that happened to visit 1 before 2 could report a path of length 2 too by luck here,
        // but on denser graphs DFS has no guarantee — it just returns whichever path it stumbles on first.
        System.out.println("Shortest distance 0 -> 3: " + shortestPathBFS(graph, 0, 3));
    }
}
```

## Example 3 — Backtracking: Generate All Subsets (DFS + explicit undo)

```java
import java.util.ArrayList;
import java.util.List;

public class BacktrackingSubsets {

    public static List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), result);
        return result;
    }

    private static void backtrack(int[] nums, int start, List<Integer> current, List<List<Integer>> result) {
        result.add(new ArrayList<>(current)); // every partial state is itself a valid subset

        for (int i = start; i < nums.length; i++) {
            current.add(nums[i]);                       // choose
            backtrack(nums, i + 1, current, result);     // explore (this is the DFS part)
            current.remove(current.size() - 1);          // UN-choose — this is what makes it backtracking, not plain DFS
        }
    }

    public static void main(String[] args) {
        System.out.println(subsets(new int[]{1, 2, 3}));
        // [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]
    }
}
```

## Pick DFS when:
- You need to check connectivity/reachability and don't care about path length.
- The natural recursive structure of the problem (trees) makes DFS the simplest code.

## Pick BFS when:
- You need the shortest path or minimum number of steps in an **unweighted** graph.
- You need level-by-level processing.

## Pick Backtracking when:
- You must enumerate **all** valid configurations (subsets, permutations, N-Queens) and can prune invalid branches early.
