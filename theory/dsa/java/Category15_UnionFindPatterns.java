import java.util.*;

/**
 * Category 15: Union-Find (Disjoint Set Union) Patterns
 */
public class Category15_UnionFindPatterns {

    static class DSU {
        int[] parent, rank;
        DSU(int n) {
            parent = new int[n];
            rank = new int[n];
            for (int i = 0; i < n; i++) parent[i] = i;
        }

        int find(int x) {
            if (parent[x] != x) parent[x] = find(parent[x]);
            return parent[x];
        }

        boolean union(int x, int y) {
            int px = find(x), py = find(y);
            if (px == py) return false;
            if (rank[px] < rank[py]) {
                parent[px] = py;
            } else if (rank[px] > rank[py]) {
                parent[py] = px;
            } else {
                parent[py] = px;
                rank[px]++;
            }
            return true;
        }
    }

    // 1. Number of Provinces (LeetCode 547)
    static int findCircleNum(int[][] isConnected) {
        DSU dsu = new DSU(isConnected.length);
        for (int i = 0; i < isConnected.length; i++) {
            for (int j = i + 1; j < isConnected[0].length; j++) {
                if (isConnected[i][j] == 1) dsu.union(i, j);
            }
        }
        Set<Integer> parents = new HashSet<>();
        for (int i = 0; i < isConnected.length; i++) {
            parents.add(dsu.find(i));
        }
        return parents.size();
    }

    // 2. Redundant Connection (LeetCode 684)
    static int[] findRedundantConnection(int[][] edges) {
        DSU dsu = new DSU(edges.length + 1);
        for (int[] edge : edges) {
            if (!dsu.union(edge[0], edge[1])) return edge;
        }
        return new int[]{};
    }

    // 3. Accounts Merge (LeetCode 721)
    static List<List<String>> accountsMerge(List<List<String>> accounts) {
        DSU dsu = new DSU(accounts.size());
        Map<String, Integer> emailToAcct = new HashMap<>();

        for (int i = 0; i < accounts.size(); i++) {
            for (int j = 1; j < accounts.get(i).size(); j++) {
                String email = accounts.get(i).get(j);
                if (!emailToAcct.containsKey(email)) {
                    emailToAcct.put(email, i);
                } else {
                    dsu.union(i, emailToAcct.get(email));
                }
            }
        }

        Map<Integer, List<String>> acctToEmails = new HashMap<>();
        for (String email : emailToAcct.keySet()) {
            int root = dsu.find(emailToAcct.get(email));
            acctToEmails.computeIfAbsent(root, k -> new ArrayList<>()).add(email);
        }

        List<List<String>> result = new ArrayList<>();
        for (int acct : acctToEmails.keySet()) {
            List<String> emails = new ArrayList<>(acctToEmails.get(acct));
            Collections.sort(emails);
            emails.add(0, accounts.get(acct).get(0));
            result.add(emails);
        }
        return result;
    }

    // 4. Friend Circles (LeetCode 1202)
    static int findNumberOfGoodComponents(int n, int[][] edges) {
        DSU dsu = new DSU(n + 1);
        for (int[] edge : edges) dsu.union(edge[0], edge[1]);
        Set<Integer> parents = new HashSet<>();
        for (int i = 1; i <= n; i++) parents.add(dsu.find(i));
        return parents.size();
    }

    // 5. Minimum Spanning Tree (Kruskal's)
    static int mst(int n, int[][] edges) {
        Arrays.sort(edges, (a, b) -> a[2] - b[2]);
        DSU dsu = new DSU(n);
        int cost = 0;
        for (int[] edge : edges) {
            if (dsu.union(edge[0], edge[1])) {
                cost += edge[2];
            }
        }
        return cost;
    }

    // 6. Detect Cycle in Undirected Graph
    static boolean hasCycle(int n, int[][] edges) {
        DSU dsu = new DSU(n);
        for (int[] edge : edges) {
            if (!dsu.union(edge[0], edge[1])) return true;
        }
        return false;
    }

    // 7. Number of Components
    static int countComponents(int n, int[][] edges) {
        DSU dsu = new DSU(n);
        for (int[] edge : edges) dsu.union(edge[0], edge[1]);
        Set<Integer> parents = new HashSet<>();
        for (int i = 0; i < n; i++) parents.add(dsu.find(i));
        return parents.size();
    }

    public static void main(String[] args) {
        int[][] edges = {{1,2},{1,3},{2,3}};
        System.out.println("Has Cycle: " + hasCycle(3, edges));
    }
}
