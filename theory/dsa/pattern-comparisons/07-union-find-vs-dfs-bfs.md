# Union-Find vs DFS/BFS for Connectivity

Both answer "are these two nodes connected?" — but they're built for different access patterns.

## Core Difference

| | Union-Find (Disjoint Set Union) | DFS/BFS |
|---|---|---|
| **Definition** | Maintains disjoint sets; `union(a, b)` merges sets, `find(a)` returns a representative — near O(1) amortized with path compression + union by rank. | Explores the graph from a node outward, visiting everything reachable. |
| **Best for** | **Incremental/dynamic** connectivity — edges added over time, repeated "are these connected?" queries. | **Static** graph explored once — you already have the full graph and want to process it in one pass. |
| **Gives you a path?** | No — only "connected or not", not the actual route. | Yes — DFS/BFS naturally can reconstruct the path taken. |
| **Complexity** | O(1) amortized per operation (with both optimizations) | O(V + E) per full traversal |
| **Signal words** | "redundant connection", "number of provinces/circles of friends" with edges given as a list processed one at a time, Kruskal's MST, "will adding this edge create a cycle" | "count connected components" from a fixed adjacency list/grid, "find the path", grid/island problems |

## Decision Checklist
1. Are edges arriving **one at a time**, and do you need an efficient "are A and B connected *right now*" check after each? → **Union-Find**.
2. Do you need to detect a cycle while **building** a graph incrementally (e.g., "Redundant Connection")? → **Union-Find** — it's built for exactly this.
3. Do you have the **whole graph already** and just need one full pass (count components, flood-fill, actual path)? → **DFS/BFS** — simpler code, no extra data structure needed.

---

## Example: Count Connected Components — Both Approaches on the Same Graph

```java
import java.util.*;

public class ConnectivityComparison {

    // ---------- DFS approach: full graph given upfront, one pass ----------
    public static int countComponentsDFS(int n, int[][] edges) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] edge : edges) {
            adj.get(edge[0]).add(edge[1]);
            adj.get(edge[1]).add(edge[0]);
        }

        boolean[] visited = new boolean[n];
        int components = 0;
        for (int i = 0; i < n; i++) {
            if (!visited[i]) {
                components++;
                dfs(adj, i, visited);
            }
        }
        return components;
    }

    private static void dfs(List<List<Integer>> adj, int node, boolean[] visited) {
        visited[node] = true;
        for (int neighbor : adj.get(node)) {
            if (!visited[neighbor]) {
                dfs(adj, neighbor, visited);
            }
        }
    }

    // ---------- Union-Find approach: same problem, but shines when edges arrive incrementally ----------
    public static class UnionFind {
        private final int[] parent;
        private final int[] rank;
        private int componentCount;

        public UnionFind(int n) {
            parent = new int[n];
            rank = new int[n];
            componentCount = n;
            for (int i = 0; i < n; i++) parent[i] = i;
        }

        public int find(int x) {
            if (parent[x] != x) {
                parent[x] = find(parent[x]); // path compression
            }
            return parent[x];
        }

        public void union(int a, int b) {
            int rootA = find(a), rootB = find(b);
            if (rootA == rootB) return; // already connected — this check is how you detect a "redundant" edge

            if (rank[rootA] < rank[rootB]) {
                parent[rootA] = rootB;
            } else if (rank[rootA] > rank[rootB]) {
                parent[rootB] = rootA;
            } else {
                parent[rootB] = rootA;
                rank[rootA]++;
            }
            componentCount--;
        }

        public int getComponentCount() { return componentCount; }
    }

    public static int countComponentsUnionFind(int n, int[][] edges) {
        UnionFind uf = new UnionFind(n);
        for (int[] edge : edges) {
            uf.union(edge[0], edge[1]);
        }
        return uf.getComponentCount();
    }

    public static void main(String[] args) {
        int n = 5;
        int[][] edges = {{0, 1}, {1, 2}, {3, 4}};

        System.out.println("DFS component count:        " + countComponentsDFS(n, edges));        // 2
        System.out.println("Union-Find component count: " + countComponentsUnionFind(n, edges));   // 2
    }
}
```

## Where Union-Find Clearly Wins: Detecting a Redundant Edge As It's Added

```java
public class RedundantConnectionUnionFind {

    // Given edges added one at a time, find the one that creates a cycle.
    // DFS would need to re-run reachability from scratch after every edge — O(E * (V+E)).
    // Union-Find does it incrementally in near O(E) total.
    public static int[] findRedundantConnection(int[][] edges, int n) {
        ConnectivityComparison.UnionFind uf = new ConnectivityComparison.UnionFind(n + 1);

        for (int[] edge : edges) {
            if (uf.find(edge[0]) == uf.find(edge[1])) {
                return edge; // this edge connects two nodes already in the same set -> creates a cycle
            }
            uf.union(edge[0], edge[1]);
        }
        return new int[0];
    }

    public static void main(String[] args) {
        int[][] edges = {{1, 2}, {1, 3}, {2, 3}};
        int[] redundant = findRedundantConnection(edges, 3);
        System.out.println("Redundant edge: [" + redundant[0] + ", " + redundant[1] + "]"); // [2, 3]
    }
}
```

## Pick DFS/BFS when:
- The graph is fully known upfront and you're doing one traversal pass.
- You need the actual path, not just connectivity.

## Pick Union-Find when:
- Edges are added incrementally and you need fast repeated connectivity queries.
- You're detecting cycles while building a graph, or implementing Kruskal's MST.
