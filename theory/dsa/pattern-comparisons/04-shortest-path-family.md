# Shortest Path Family: BFS vs Dijkstra vs Bellman-Ford vs Floyd-Warshall

Four algorithms, one question each answers differently: **what kind of edges/graph do I have, and do I need one shortest path or all of them?**

## Core Difference

| | BFS | Dijkstra | Bellman-Ford | Floyd-Warshall |
|---|---|---|---|---|
| **Edge weights** | Unweighted (or all equal) | Non-negative weights | Any weights, including negative | Any weights, including negative |
| **Scope** | Single source | Single source | Single source | **All pairs** |
| **Handles negative cycles?** | N/A | No (breaks) | Yes — **detects** them | Yes — detects them |
| **Complexity** | O(V + E) | O((V + E) log V) with a heap | O(V · E) | O(V³) |
| **Data structure** | Queue | Min-heap (priority queue) | Simple edge relaxation, repeated V-1 times | Dynamic programming over triples (i, j, k) |
| **Signal words** | "unweighted", "minimum number of edges/moves" | "shortest path", weights given, all non-negative | "shortest path", weights can be negative, "detect if... arbitrage/negative cycle" | "shortest path between **every pair**", V is small (≤ ~400-500) |

## Decision Checklist
1. All edges weight 1 (or unweighted)? → **BFS**. Don't reach for Dijkstra — it's overkill and slower.
2. Weighted, non-negative, single source? → **Dijkstra**.
3. Weighted, might have negative edges, single source, or need to detect a negative cycle? → **Bellman-Ford**.
4. Need shortest paths between **every** pair of nodes and the graph is small? → **Floyd-Warshall**.

---

## Example: Same Weighted Graph, Three Algorithms

```java
import java.util.*;

public class ShortestPathFamilyDemo {

    public static class Edge {
        int to, weight;
        Edge(int to, int weight) { this.to = to; this.weight = weight; }
    }

    // ---------- Dijkstra: non-negative weights, single source ----------
    public static int[] dijkstra(List<List<Edge>> graph, int source) {
        int n = graph.size();
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[source] = 0;

        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]); // [node, distance]
        pq.add(new int[]{source, 0});

        while (!pq.isEmpty()) {
            int[] current = pq.poll();
            int node = current[0], d = current[1];
            if (d > dist[node]) continue; // stale entry, already found a better path

            for (Edge edge : graph.get(node)) {
                int newDist = d + edge.weight;
                if (newDist < dist[edge.to]) {
                    dist[edge.to] = newDist;
                    pq.add(new int[]{edge.to, newDist});
                }
            }
        }
        return dist;
    }

    // ---------- Bellman-Ford: handles negative weights, detects negative cycles ----------
    public static int[] bellmanFord(int n, int[][] edges, int source) {
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[source] = 0;

        // Relax all edges V-1 times — guarantees shortest paths if no negative cycle
        for (int i = 0; i < n - 1; i++) {
            for (int[] edge : edges) {
                int u = edge[0], v = edge[1], w = edge[2];
                if (dist[u] != Integer.MAX_VALUE && dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                }
            }
        }

        // One more pass: if anything still improves, there's a negative cycle
        for (int[] edge : edges) {
            int u = edge[0], v = edge[1], w = edge[2];
            if (dist[u] != Integer.MAX_VALUE && dist[u] + w < dist[v]) {
                throw new IllegalStateException("Graph contains a negative-weight cycle");
            }
        }
        return dist;
    }

    // ---------- Floyd-Warshall: all-pairs shortest paths ----------
    public static int[][] floydWarshall(int n, int[][] edges) {
        int[][] dist = new int[n][n];
        for (int[] row : dist) Arrays.fill(row, Integer.MAX_VALUE / 2); // avoid overflow when adding
        for (int i = 0; i < n; i++) dist[i][i] = 0;
        for (int[] edge : edges) {
            dist[edge[0]][edge[1]] = Math.min(dist[edge[0]][edge[1]], edge[2]);
        }

        for (int k = 0; k < n; k++) {           // intermediate node
            for (int i = 0; i < n; i++) {        // source
                for (int j = 0; j < n; j++) {    // destination
                    if (dist[i][k] + dist[k][j] < dist[i][j]) {
                        dist[i][j] = dist[i][k] + dist[k][j];
                    }
                }
            }
        }
        return dist;
    }

    public static void main(String[] args) {
        // Graph: 0 -> 1 (4), 0 -> 2 (1), 2 -> 1 (2), 1 -> 3 (1), 2 -> 3 (5)
        int n = 4;

        List<List<Edge>> adjList = new ArrayList<>();
        for (int i = 0; i < n; i++) adjList.add(new ArrayList<>());
        adjList.get(0).add(new Edge(1, 4));
        adjList.get(0).add(new Edge(2, 1));
        adjList.get(2).add(new Edge(1, 2));
        adjList.get(1).add(new Edge(3, 1));
        adjList.get(2).add(new Edge(3, 5));

        int[][] edgeList = {{0, 1, 4}, {0, 2, 1}, {2, 1, 2}, {1, 3, 1}, {2, 3, 5}};

        System.out.println("Dijkstra from 0:      " + Arrays.toString(dijkstra(adjList, 0)));
        System.out.println("Bellman-Ford from 0:  " + Arrays.toString(bellmanFord(n, edgeList, 0)));
        System.out.println("Floyd-Warshall row 0: " + Arrays.toString(floydWarshall(n, edgeList)[0]));
        // All three agree: dist to node 3 is 4 (0 -> 2 -> 1 -> 3 = 1+2+1)
    }
}
```

## Why Not Just Always Use Bellman-Ford (it handles everything)?

Because it's O(V·E) vs Dijkstra's O((V+E) log V) — on a graph with 10,000 nodes and 50,000 edges,
that difference is the gap between passing and timing out. **Use the weakest algorithm that's still
correct for your constraints** — that's true throughout DSA, not just here.

## Pick BFS when:
- Unweighted graph, need shortest path / minimum steps.

## Pick Dijkstra when:
- Weighted, all non-negative, single source — this is the default "shortest path" answer in most interviews.

## Pick Bellman-Ford when:
- Negative edge weights are possible, or you must detect a negative cycle (e.g., currency arbitrage detection).

## Pick Floyd-Warshall when:
- You need shortest paths between **every** pair of nodes, and V is small enough that O(V³) is acceptable.
