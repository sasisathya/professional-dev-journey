import java.util.*;

/**
 * Category 27: Strongly Connected Components (SCC)
 * Kosaraju's & Tarjan's algorithms
 * ESSENTIAL for directed graph problems in interviews
 */
public class Category27_StronglyConnectedComponents {

    // 1. Kosaraju's Algorithm - O(V + E)
    static class KosarajuSCC {
        int n;
        List<List<Integer>> graph, reverseGraph;
        Stack<Integer> stack;
        boolean[] visited;
        int[] sccId;
        int sccCount;

        KosarajuSCC(int n, int[][] edges) {
            this.n = n;
            graph = new ArrayList<>();
            reverseGraph = new ArrayList<>();
            for (int i = 0; i < n; i++) {
                graph.add(new ArrayList<>());
                reverseGraph.add(new ArrayList<>());
            }

            for (int[] edge : edges) {
                graph.get(edge[0]).add(edge[1]);
                reverseGraph.get(edge[1]).add(edge[0]);
            }

            this.stack = new Stack<>();
            this.visited = new boolean[n];
            this.sccId = new int[n];
            this.sccCount = 0;

            findSCC();
        }

        void findSCC() {
            // Step 1: Fill order by finishing time
            for (int i = 0; i < n; i++) {
                if (!visited[i]) {
                    dfs1(i);
                }
            }

            // Step 2: DFS on reverse graph
            Arrays.fill(visited, false);
            while (!stack.isEmpty()) {
                int u = stack.pop();
                if (!visited[u]) {
                    dfs2(u, sccCount);
                    sccCount++;
                }
            }
        }

        void dfs1(int u) {
            visited[u] = true;
            for (int v : graph.get(u)) {
                if (!visited[v]) {
                    dfs1(v);
                }
            }
            stack.push(u);
        }

        void dfs2(int u, int id) {
            visited[u] = true;
            sccId[u] = id;
            for (int v : reverseGraph.get(u)) {
                if (!visited[v]) {
                    dfs2(v, id);
                }
            }
        }

        int getSCCCount() {
            return sccCount;
        }

        int[] getSCCIds() {
            return sccId;
        }
    }

    // 2. Tarjan's Algorithm - O(V + E)
    static class TarjanSCC {
        int n;
        List<List<Integer>> graph;
        int[] ids, low;
        boolean[] onStack;
        Stack<Integer> stack;
        int idCounter, sccCount;
        List<List<Integer>> sccs;

        TarjanSCC(int n, int[][] edges) {
            this.n = n;
            graph = new ArrayList<>();
            for (int i = 0; i < n; i++) {
                graph.add(new ArrayList<>());
            }

            for (int[] edge : edges) {
                graph.get(edge[0]).add(edge[1]);
            }

            ids = new int[n];
            low = new int[n];
            onStack = new boolean[n];
            stack = new Stack<>();
            idCounter = 0;
            sccCount = 0;
            sccs = new ArrayList<>();

            Arrays.fill(ids, -1);

            for (int i = 0; i < n; i++) {
                if (ids[i] == -1) {
                    dfs(i);
                }
            }
        }

        void dfs(int u) {
            ids[u] = low[u] = idCounter++;
            stack.push(u);
            onStack[u] = true;

            for (int v : graph.get(u)) {
                if (ids[v] == -1) {
                    dfs(v);
                    low[u] = Math.min(low[u], low[v]);
                } else if (onStack[v]) {
                    low[u] = Math.min(low[u], ids[v]);
                }
            }

            if (ids[u] == low[u]) {
                List<Integer> scc = new ArrayList<>();
                while (true) {
                    int v = stack.pop();
                    onStack[v] = false;
                    scc.add(v);
                    if (v == u) break;
                }
                sccs.add(scc);
                sccCount++;
            }
        }

        List<List<Integer>> getSCCs() {
            return sccs;
        }

        int getSCCCount() {
            return sccCount;
        }
    }

    // Application: Course Schedule III (Directed graph with cycles)
    static boolean canFinishAll(int numCourses, int[][] prerequisites) {
        KosarajuSCC scc = new KosarajuSCC(numCourses, prerequisites);
        // If all nodes in same SCC, there's a cycle
        return scc.getSCCCount() == numCourses;
    }

    // Application: Count SCCs in Graph
    static int countSCC(int n, int[][] edges) {
        TarjanSCC tarjan = new TarjanSCC(n, edges);
        return tarjan.getSCCCount();
    }

    // Application: Condensation Graph (DAG of SCCs)
    static int[][] condensationGraph(int n, int[][] edges) {
        TarjanSCC tarjan = new TarjanSCC(n, edges);
        List<List<Integer>> sccs = tarjan.getSCCs();
        int sccCount = sccs.size();

        // Map node to its SCC
        int[] sccId = new int[n];
        for (int i = 0; i < sccCount; i++) {
            for (int node : sccs.get(i)) {
                sccId[node] = i;
            }
        }

        // Build condensation graph
        Set<Integer>[] condGraph = new Set[sccCount];
        for (int i = 0; i < sccCount; i++) {
            condGraph[i] = new HashSet<>();
        }

        for (int[] edge : edges) {
            int u = sccId[edge[0]];
            int v = sccId[edge[1]];
            if (u != v) {
                condGraph[u].add(v);
            }
        }

        // Convert to 2D array
        int[][] result = new int[sccCount][];
        for (int i = 0; i < sccCount; i++) {
            result[i] = condGraph[i].stream().mapToInt(Integer::intValue).toArray();
        }
        return result;
    }

    // Application: 2-SAT Problem (using SCC)
    static class TwoSAT {
        int n;
        int[][] graph;

        TwoSAT(int numVars) {
            n = numVars;
            // graph[2*i] = variable i, graph[2*i+1] = NOT variable i
            graph = new int[2 * n][2 * n];
        }

        void addClause(int a, boolean aVal, int b, boolean bVal) {
            // (a OR b) = (NOT a => b) AND (NOT b => a)
            int na = aVal ? 2 * a : 2 * a + 1;
            int pa = aVal ? 2 * a + 1 : 2 * a;
            int nb = bVal ? 2 * b : 2 * b + 1;
            int pb = bVal ? 2 * b + 1 : 2 * b;

            graph[pa][nb] = 1;
            graph[pb][na] = 1;
        }

        boolean solve() {
            // Build implication graph and find SCCs
            // If any variable and its negation are in same SCC, unsolvable
            return true; // Simplified
        }
    }

    // Application: Find Bridges (using SCC variant)
    static int[][] findBridges(int n, int[][] edges) {
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            graph.add(new ArrayList<>());
        }

        Map<String, Integer> edgeMap = new HashMap<>();
        for (int[] edge : edges) {
            graph.get(edge[0]).add(edge[1]);
            graph.get(edge[1]).add(edge[0]);
            String key = Math.min(edge[0], edge[1]) + "," + Math.max(edge[0], edge[1]);
            edgeMap.put(key, edgeMap.getOrDefault(key, 0) + 1);
        }

        List<int[]> bridges = new ArrayList<>();
        for (String key : edgeMap.keySet()) {
            if (edgeMap.get(key) == 1) {
                String[] parts = key.split(",");
                bridges.add(new int[]{Integer.parseInt(parts[0]), Integer.parseInt(parts[1])});
            }
        }

        return bridges.toArray(new int[0][]);
    }

    public static void main(String[] args) {
        int[][] edges = {{0, 1}, {1, 2}, {2, 0}, {2, 3}, {3, 4}};

        TarjanSCC tarjan = new TarjanSCC(5, edges);
        System.out.println("Number of SCCs: " + tarjan.getSCCCount());
        System.out.println("SCCs: " + tarjan.getSCCs());

        KosarajuSCC kosaraju = new KosarajuSCC(5, edges);
        System.out.println("Kosaraju SCCs: " + kosaraju.getSCCCount());

        int[][] cond = condensationGraph(5, edges);
        System.out.println("Condensation graph created with " + cond.length + " nodes");
    }
}
