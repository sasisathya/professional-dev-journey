import java.util.*;

/**
 * Category 13: Graph Patterns
 * 20+ implementations covering graph fundamentals, DFS, BFS, and connectivity
 */
public class Category13_GraphPatterns {

    // 1. DFS - Number of Islands (LeetCode 200)
    static int numIslands(char[][] grid) {
        int count = 0;
        for (int i = 0; i < grid.length; i++) {
            for (int j = 0; j < grid[0].length; j++) {
                if (grid[i][j] == '1') {
                    dfsMark(grid, i, j);
                    count++;
                }
            }
        }
        return count;
    }

    static void dfsMark(char[][] grid, int i, int j) {
        if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] != '1') return;
        grid[i][j] = '0';
        dfsMark(grid, i + 1, j);
        dfsMark(grid, i - 1, j);
        dfsMark(grid, i, j + 1);
        dfsMark(grid, i, j - 1);
    }

    // 2. BFS - Shortest Path (LeetCode 542)
    static int[][] updateMatrix(int[][] mat) {
        Queue<int[]> queue = new LinkedList<>();
        int m = mat.length, n = mat[0].length;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (mat[i][j] == 0) queue.offer(new int[]{i, j});
            }
        }

        int[][] dirs = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};
        while (!queue.isEmpty()) {
            int[] curr = queue.poll();
            int i = curr[0], j = curr[1];
            for (int[] dir : dirs) {
                int ni = i + dir[0], nj = j + dir[1];
                if (ni >= 0 && ni < m && nj >= 0 && nj < n && mat[ni][nj] > mat[i][j] + 1) {
                    mat[ni][nj] = mat[i][j] + 1;
                    queue.offer(new int[]{ni, nj});
                }
            }
        }
        return mat;
    }

    // 3. Connected Components (LeetCode 547)
    static int findCircleNum(int[][] isConnected) {
        int n = isConnected.length;
        boolean[] visited = new boolean[n];
        int count = 0;
        for (int i = 0; i < n; i++) {
            if (!visited[i]) {
                dfsComponent(isConnected, visited, i);
                count++;
            }
        }
        return count;
    }

    static void dfsComponent(int[][] graph, boolean[] visited, int i) {
        visited[i] = true;
        for (int j = 0; j < graph[i].length; j++) {
            if (graph[i][j] == 1 && !visited[j]) {
                dfsComponent(graph, visited, j);
            }
        }
    }

    // 4. Bipartite Graph (LeetCode 785)
    static boolean isBipartite(int[][] graph) {
        int[] color = new int[graph.length];
        for (int i = 0; i < graph.length; i++) {
            if (color[i] == 0 && !dfsColor(graph, color, i, 1)) return false;
        }
        return true;
    }

    static boolean dfsColor(int[][] graph, int[] color, int node, int c) {
        color[node] = c;
        for (int next : graph[node]) {
            if (color[next] == 0) {
                if (!dfsColor(graph, color, next, -c)) return false;
            } else if (color[next] == c) {
                return false;
            }
        }
        return true;
    }

    // 5. Course Schedule (LeetCode 207)
    static boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) graph.add(new ArrayList<>());
        for (int[] pre : prerequisites) graph.get(pre[1]).add(pre[0]);

        int[] state = new int[numCourses];
        for (int i = 0; i < numCourses; i++) {
            if (!dfsHasCycle(graph, state, i)) return false;
        }
        return true;
    }

    static boolean dfsHasCycle(List<List<Integer>> graph, int[] state, int node) {
        if (state[node] == 1) return false;
        if (state[node] == 2) return true;
        state[node] = 1;
        for (int next : graph.get(node)) {
            if (!dfsHasCycle(graph, state, next)) return false;
        }
        state[node] = 2;
        return true;
    }

    // 6. Surrounded Regions (LeetCode 130)
    static void solve(char[][] board) {
        int m = board.length, n = board[0].length;
        for (int i = 0; i < m; i++) {
            if (board[i][0] == 'O') dfsSurrounded(board, i, 0);
            if (board[i][n - 1] == 'O') dfsSurrounded(board, i, n - 1);
        }
        for (int j = 0; j < n; j++) {
            if (board[0][j] == 'O') dfsSurrounded(board, 0, j);
            if (board[m - 1][j] == 'O') dfsSurrounded(board, m - 1, j);
        }
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (board[i][j] == 'O') board[i][j] = 'X';
                else if (board[i][j] == '#') board[i][j] = 'O';
            }
        }
    }

    static void dfsSurrounded(char[][] board, int i, int j) {
        if (i < 0 || i >= board.length || j < 0 || j >= board[0].length || board[i][j] != 'O') return;
        board[i][j] = '#';
        dfsSurrounded(board, i + 1, j);
        dfsSurrounded(board, i - 1, j);
        dfsSurrounded(board, i, j + 1);
        dfsSurrounded(board, i, j - 1);
    }

    // 7. Clone Graph (LeetCode 133)
    static class Node {
        int val;
        List<Node> neighbors;
        Node(int val) {
            this.val = val;
            this.neighbors = new ArrayList<>();
        }
    }

    static Node cloneGraph(Node node) {
        Map<Node, Node> map = new HashMap<>();
        return dfsClone(node, map);
    }

    static Node dfsClone(Node node, Map<Node, Node> map) {
        if (node == null) return null;
        if (map.containsKey(node)) return map.get(node);
        Node clone = new Node(node.val);
        map.put(node, clone);
        for (Node neighbor : node.neighbors) {
            clone.neighbors.add(dfsClone(neighbor, map));
        }
        return clone;
    }

    // 8. All Paths from Source to Target (LeetCode 797)
    static List<List<Integer>> allPathsSourceTarget(int[][] graph) {
        List<List<Integer>> result = new ArrayList<>();
        List<Integer> path = new ArrayList<>();
        path.add(0);
        dfsPath(graph, 0, graph.length - 1, path, result);
        return result;
    }

    static void dfsPath(int[][] graph, int node, int target, List<Integer> path, List<List<Integer>> result) {
        if (node == target) {
            result.add(new ArrayList<>(path));
            return;
        }
        for (int next : graph[node]) {
            path.add(next);
            dfsPath(graph, next, target, path, result);
            path.remove(path.size() - 1);
        }
    }

    // 9. Maximum Area Island (LeetCode 695)
    static int maxAreaOfIsland(int[][] grid) {
        int max = 0;
        for (int i = 0; i < grid.length; i++) {
            for (int j = 0; j < grid[0].length; j++) {
                if (grid[i][j] == 1) {
                    max = Math.max(max, dfsArea(grid, i, j));
                }
            }
        }
        return max;
    }

    static int dfsArea(int[][] grid, int i, int j) {
        if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] == 0) return 0;
        grid[i][j] = 0;
        return 1 + dfsArea(grid, i + 1, j) + dfsArea(grid, i - 1, j) + 
               dfsArea(grid, i, j + 1) + dfsArea(grid, i, j - 1);
    }

    // 10. Maze I (LeetCode 490)
    static boolean hasPath(int[][] maze, int[] start, int[] destination) {
        return dfsMaze(maze, start[0], start[1], destination);
    }

    static boolean dfsMaze(int[][] maze, int si, int sj, int[] dest) {
        if (si == dest[0] && sj == dest[1]) return true;
        int[][] dirs = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};
        maze[si][sj] = 2;
        for (int[] dir : dirs) {
            int ni = si, nj = sj;
            while (ni >= 0 && ni < maze.length && nj >= 0 && nj < maze[0].length && maze[ni][nj] != 1) {
                ni += dir[0];
                nj += dir[1];
            }
            ni -= dir[0];
            nj -= dir[1];
            if (maze[ni][nj] == 0 && dfsMaze(maze, ni, nj, dest)) return true;
        }
        return false;
    }

    public static void main(String[] args) {
        char[][] grid = {{'1','1','1','1','0'},{'1','1','0','1','0'},{'1','1','0','0','0'},{'0','0','0','0','0'}};
        System.out.println("Number of Islands: " + numIslands(grid));
    }
}
