import java.util.*;

/**
 * Category 14: Shortest Path Patterns
 * Implementation of Dijkstra, Bellman-Ford, and variants
 */
public class Category14_ShortestPathPatterns {

    // 1. Dijkstra's Algorithm (LeetCode 743)
    static int networkDelayTime(int[][] times, int n, int k) {
        List<List<int[]>> graph = new ArrayList<>();
        for (int i = 0; i <= n; i++) graph.add(new ArrayList<>());
        for (int[] time : times) graph.get(time[0]).add(new int[]{time[1], time[2]});

        int[] dist = new int[n + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[k] = 0;
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
        pq.offer(new int[]{0, k});

        while (!pq.isEmpty()) {
            int[] curr = pq.poll();
            int d = curr[0], u = curr[1];
            if (d > dist[u]) continue;
            for (int[] edge : graph.get(u)) {
                int v = edge[0], w = edge[1];
                if (dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    pq.offer(new int[]{dist[v], v});
                }
            }
        }

        int maxDist = 0;
        for (int i = 1; i <= n; i++) {
            maxDist = Math.max(maxDist, dist[i]);
        }
        return maxDist == Integer.MAX_VALUE ? -1 : maxDist;
    }

    // 2. Bellman-Ford Algorithm
    static int[] bellmanFord(int n, int[][] edges, int src) {
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[src] = 0;

        for (int i = 0; i < n - 1; i++) {
            for (int[] edge : edges) {
                if (dist[edge[0]] != Integer.MAX_VALUE && dist[edge[0]] + edge[2] < dist[edge[1]]) {
                    dist[edge[1]] = dist[edge[0]] + edge[2];
                }
            }
        }
        return dist;
    }

    // 3. Floyd-Warshall Algorithm
    static void floydWarshall(int[][] dist) {
        int n = dist.length;
        for (int k = 0; k < n; k++) {
            for (int i = 0; i < n; i++) {
                for (int j = 0; j < n; j++) {
                    dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);
                }
            }
        }
    }

    // 4. 0-1 BFS (LeetCode 1091)
    static int shortestPathBinaryMatrix(int[][] grid) {
        if (grid[0][0] == 1) return -1;
        Deque<int[]> queue = new LinkedList<>();
        queue.offer(new int[]{0, 0, 1});
        int[][] dirs = {{0,1},{1,0},{0,-1},{-1,0},{1,1},{1,-1},{-1,1},{-1,-1}};
        
        while (!queue.isEmpty()) {
            int[] curr = queue.poll();
            int i = curr[0], j = curr[1], d = curr[2];
            if (i == grid.length - 1 && j == grid[0].length - 1) return d;
            for (int[] dir : dirs) {
                int ni = i + dir[0], nj = j + dir[1];
                if (ni >= 0 && ni < grid.length && nj >= 0 && nj < grid[0].length && grid[ni][nj] == 0) {
                    grid[ni][nj] = 1;
                    queue.offer(new int[]{ni, nj, d + 1});
                }
            }
        }
        return -1;
    }

    // 5. Multi-source BFS (LeetCode 1926)
    static int closestMeetingPoint(int[][] grid1, int[][] grid2) {
        Queue<int[]> queue = new LinkedList<>();
        int[][] dist = new int[grid1.length][grid1[0].length];
        for (int i = 0; i < grid1.length; i++) {
            for (int j = 0; j < grid1[0].length; j++) {
                if (grid1[i][j] == 1) {
                    queue.offer(new int[]{i, j, 0});
                    dist[i][j] = 0;
                }
            }
        }
        
        int minDist = Integer.MAX_VALUE;
        int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};
        while (!queue.isEmpty()) {
            int[] curr = queue.poll();
            int i = curr[0], j = curr[1], d = curr[2];
            if (grid2[i][j] == 1) {
                minDist = Math.min(minDist, d);
            }
            for (int[] dir : dirs) {
                int ni = i + dir[0], nj = j + dir[1];
                if (ni >= 0 && ni < grid1.length && nj >= 0 && nj < grid1[0].length && dist[ni][nj] == 0) {
                    dist[ni][nj] = d + 1;
                    queue.offer(new int[]{ni, nj, d + 1});
                }
            }
        }
        return minDist == Integer.MAX_VALUE ? -1 : minDist;
    }

    // 6. Minimum Effort Path (LeetCode 1631)
    static int minimumEffortPath(int[][] heights) {
        int m = heights.length, n = heights[0].length;
        int[][] effort = new int[m][n];
        for (int i = 0; i < m; i++) Arrays.fill(effort[i], Integer.MAX_VALUE);
        effort[0][0] = 0;
        
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
        pq.offer(new int[]{0, 0, 0});
        int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};
        
        while (!pq.isEmpty()) {
            int[] curr = pq.poll();
            int e = curr[0], i = curr[1], j = curr[2];
            if (e > effort[i][j]) continue;
            if (i == m - 1 && j == n - 1) return e;
            for (int[] dir : dirs) {
                int ni = i + dir[0], nj = j + dir[1];
                if (ni >= 0 && ni < m && nj >= 0 && nj < n) {
                    int newEffort = Math.max(e, Math.abs(heights[i][j] - heights[ni][nj]));
                    if (newEffort < effort[ni][nj]) {
                        effort[ni][nj] = newEffort;
                        pq.offer(new int[]{newEffort, ni, nj});
                    }
                }
            }
        }
        return effort[m-1][n-1];
    }

    public static void main(String[] args) {
        int[][] times = {{1,2,1},{2,3,2},{1,3,4}};
        System.out.println("Network Delay: " + networkDelayTime(times, 3, 1));
    }
}
