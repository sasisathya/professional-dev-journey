import java.util.*;

/**
 * Category 26: Binary Lifting for LCA (Lowest Common Ancestor)
 * O(n log n) preprocessing, O(log n) per query
 * ESSENTIAL for tree algorithms in competitive programming
 */
public class Category26_BinaryLiftingLCA {

    static class TreeNode {
        int val;
        List<TreeNode> children;
        TreeNode(int val) {
            this.val = val;
            children = new ArrayList<>();
        }
    }

    static class BinaryLiftingLCA {
        int maxLog = 20;
        int[][] parent;
        int[] depth;
        TreeNode root;

        BinaryLiftingLCA(TreeNode root) {
            this.root = root;
            int n = countNodes(root);
            parent = new int[n][maxLog];
            depth = new int[n];
            dfs(root, -1, 0);
        }

        int countNodes(TreeNode node) {
            if (node == null) return 0;
            int count = 1;
            for (TreeNode child : node.children) {
                count += countNodes(child);
            }
            return count;
        }

        void dfs(TreeNode node, int p, int d) {
            if (node == null) return;
            parent[node.val][0] = p;
            depth[node.val] = d;

            for (int i = 1; i < maxLog; i++) {
                if (parent[node.val][i - 1] != -1) {
                    parent[node.val][i] = parent[parent[node.val][i - 1]][i - 1];
                } else {
                    parent[node.val][i] = -1;
                }
            }

            for (TreeNode child : node.children) {
                dfs(child, node.val, d + 1);
            }
        }

        int lca(int u, int v) {
            if (depth[u] < depth[v]) {
                int temp = u;
                u = v;
                v = temp;
            }

            // Bring u to same level as v
            int diff = depth[u] - depth[v];
            for (int i = 0; i < maxLog; i++) {
                if ((diff & (1 << i)) != 0) {
                    u = parent[u][i];
                }
            }

            if (u == v) return u;

            // Binary search for LCA
            for (int i = maxLog - 1; i >= 0; i--) {
                if (parent[u][i] != parent[v][i]) {
                    u = parent[u][i];
                    v = parent[v][i];
                }
            }
            return parent[u][0];
        }

        int kthAncestor(int node, int k) {
            for (int i = 0; i < maxLog; i++) {
                if ((k & (1 << i)) != 0) {
                    node = parent[node][i];
                    if (node == -1) return -1;
                }
            }
            return node;
        }

        int distance(int u, int v) {
            int l = lca(u, v);
            return depth[u] + depth[v] - 2 * depth[l];
        }
    }

    // LeetCode 1626: Best Team With No Conflicts
    static int bestTeamScore(int[] scores, int[] ages) {
        int n = scores.length;
        Integer[] indices = new Integer[n];
        for (int i = 0; i < n; i++) indices[i] = i;

        Arrays.sort(indices, (i, j) -> {
            if (ages[i] != ages[j]) return ages[i] - ages[j];
            return scores[i] - scores[j];
        });

        int[] dp = new int[n];
        int maxScore = 0;
        for (int i = 0; i < n; i++) {
            dp[i] = scores[indices[i]];
            for (int j = 0; j < i; j++) {
                if (scores[indices[j]] <= scores[indices[i]]) {
                    dp[i] = Math.max(dp[i], dp[j] + scores[indices[i]]);
                }
            }
            maxScore = Math.max(maxScore, dp[i]);
        }
        return maxScore;
    }

    // LeetCode 1483: Kth Ancestor of a Tree Node
    static class TreeAncestor {
        BinaryLiftingLCA blt;

        TreeAncestor(int n, int[] parent) {
            // Build tree from parent array
            TreeNode root = buildTree(parent);
            blt = new BinaryLiftingLCA(root);
        }

        TreeNode buildTree(int[] parent) {
            TreeNode root = new TreeNode(0);
            List<TreeNode> nodes = new ArrayList<>();
            nodes.add(root);
            for (int i = 1; i < parent.length; i++) {
                nodes.add(new TreeNode(i));
            }
            for (int i = 1; i < parent.length; i++) {
                nodes.get(parent[i]).children.add(nodes.get(i));
            }
            return root;
        }

        int getKthAncestor(int node, int k) {
            return blt.kthAncestor(node, k);
        }
    }

    // Application: Distance Between Nodes in Tree
    static int distanceQuery(TreeNode root, int u, int v) {
        BinaryLiftingLCA blt = new BinaryLiftingLCA(root);
        return blt.distance(u, v);
    }

    // Application: Path Maximum/Minimum Query
    static class PathQueryWithBinaryLifting {
        int[][] parent, maxVal;
        int[] depth;
        int maxLog = 20;

        PathQueryWithBinaryLifting(TreeNode root) {
            int n = countNodes(root);
            parent = new int[n][maxLog];
            maxVal = new int[n][maxLog];
            depth = new int[n];
            dfs(root, -1, 0);
        }

        int countNodes(TreeNode node) {
            if (node == null) return 0;
            int count = 1;
            for (TreeNode child : node.children) {
                count += countNodes(child);
            }
            return count;
        }

        void dfs(TreeNode node, int p, int d) {
            if (node == null) return;
            parent[node.val][0] = p;
            maxVal[node.val][0] = node.val;
            depth[node.val] = d;

            for (int i = 1; i < maxLog; i++) {
                if (parent[node.val][i - 1] != -1) {
                    parent[node.val][i] = parent[parent[node.val][i - 1]][i - 1];
                    maxVal[node.val][i] = Math.max(maxVal[node.val][i - 1],
                                                    maxVal[parent[node.val][i - 1]][i - 1]);
                } else {
                    parent[node.val][i] = -1;
                }
            }

            for (TreeNode child : node.children) {
                dfs(child, node.val, d + 1);
            }
        }

        int pathMax(int u, int v) {
            if (depth[u] < depth[v]) {
                int temp = u;
                u = v;
                v = temp;
            }

            int max = 0;
            int diff = depth[u] - depth[v];
            for (int i = 0; i < maxLog; i++) {
                if ((diff & (1 << i)) != 0) {
                    max = Math.max(max, maxVal[u][i]);
                    u = parent[u][i];
                }
            }

            if (u == v) {
                max = Math.max(max, u);
                return max;
            }

            for (int i = maxLog - 1; i >= 0; i--) {
                if (parent[u][i] != parent[v][i]) {
                    max = Math.max(max, Math.max(maxVal[u][i], maxVal[v][i]));
                    u = parent[u][i];
                    v = parent[v][i];
                }
            }
            max = Math.max(max, Math.max(u, v));
            max = Math.max(max, Math.max(parent[u][0], parent[v][0]));
            return max;
        }
    }

    public static void main(String[] args) {
        // Build sample tree
        TreeNode root = new TreeNode(1);
        TreeNode n2 = new TreeNode(2);
        TreeNode n3 = new TreeNode(3);
        TreeNode n4 = new TreeNode(4);
        TreeNode n5 = new TreeNode(5);

        root.children.add(n2);
        root.children.add(n3);
        n2.children.add(n4);
        n2.children.add(n5);

        BinaryLiftingLCA blt = new BinaryLiftingLCA(root);

        System.out.println("LCA(4, 5): " + blt.lca(4, 5));
        System.out.println("LCA(4, 3): " + blt.lca(4, 3));
        System.out.println("Distance(4, 5): " + blt.distance(4, 5));
        System.out.println("2nd ancestor of node 4: " + blt.kthAncestor(4, 2));
    }
}
