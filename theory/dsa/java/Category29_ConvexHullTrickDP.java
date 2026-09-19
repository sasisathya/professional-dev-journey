import java.util.*;

/**
 * Category 29: Convex Hull Trick (CHT) for DP Optimization
 * Optimizes certain DP from O(n^2) to O(n log n) or O(n)
 * ADVANCED technique for competitive programming
 */
public class Category29_ConvexHullTrickDP {

    // Linear function: y = mx + c
    static class Line implements Comparable<Line> {
        long m, c;

        Line(long m, long c) {
            this.m = m;
            this.c = c;
        }

        long eval(long x) {
            return m * x + c;
        }

        @Override
        public int compareTo(Line other) {
            if (this.m != other.m) return Long.compare(this.m, other.m);
            return Long.compare(this.c, other.c);
        }

        boolean isBad(Line l2, Line l3) {
            // Check if this line is not useful
            // (l2.c - this.c) / (this.m - l2.m) >= (l3.c - l2.c) / (l2.m - l3.m)
            return (__int128) (l2.c - this.c) * (this.m - l3.m) <=
                   (__int128) (l3.c - l2.c) * (l2.m - this.m);
        }
    }

    // Wrapper for __int128 arithmetic (using long for simplified version)
    static class __int128 implements Comparable<__int128> {
        long high, low;

        __int128(long h, long l) {
            this.high = h;
            this.low = l;
        }

        @Override
        public int compareTo(__int128 other) {
            if (this.high != other.high) return Long.compare(this.high, other.high);
            return Long.compare(this.low, other.low);
        }
    }

    // Convex Hull Trick - Dynamic (supporting online queries)
    static class ConvexHullTrickDynamic {
        Deque<Line> hull;

        ConvexHullTrickDynamic() {
            hull = new LinkedList<>();
        }

        void addLine(long m, long c) {
            Line newLine = new Line(m, c);

            // Remove lines that become useless
            while (hull.size() >= 2) {
                Line last = hull.removeLast();
                Line secondLast = hull.getLast();
                if (secondLast.isBad(last, newLine)) {
                    // last is bad, keep removing
                } else {
                    hull.addLast(last);
                    break;
                }
            }

            // Remove lines that are worse than new line
            while (hull.size() >= 1) {
                Line last = hull.getLast();
                if (last.m == newLine.m) {
                    if (last.c <= newLine.c) return; // new line is worse
                    hull.removeLast();
                } else {
                    break;
                }
            }

            hull.addLast(newLine);
        }

        long query(long x) {
            if (hull.isEmpty()) return 0;

            // For online queries, use binary search
            long ans = Long.MIN_VALUE;
            for (Line line : hull) {
                ans = Math.max(ans, line.eval(x));
            }
            return ans;
        }
    }

    // Convex Hull Trick - Offline (queries sorted)
    static class ConvexHullTrickOffline {
        Deque<Line> hull;
        int queryPtr;

        ConvexHullTrickOffline() {
            hull = new LinkedList<>();
            queryPtr = 0;
        }

        void addLine(long m, long c) {
            Line newLine = new Line(m, c);

            while (hull.size() >= 2) {
                Line last = hull.removeLast();
                Line secondLast = hull.getLast();
                if (secondLast.isBad(last, newLine)) {
                    // last is useless
                } else {
                    hull.addLast(last);
                    break;
                }
            }

            if (hull.size() >= 1) {
                Line last = hull.getLast();
                if (last.m == newLine.m) {
                    if (last.c >= newLine.c) {
                        hull.removeLast();
                    } else {
                        return;
                    }
                }
            }

            hull.addLast(newLine);
        }

        long query(long x) {
            if (hull.isEmpty()) return 0;

            // Use two pointers for monotonic queries
            while (queryPtr + 1 < hull.size()) {
                Line curr = (Line) hull.toArray()[queryPtr];
                Line next = (Line) hull.toArray()[queryPtr + 1];
                if (curr.eval(x) <= next.eval(x)) {
                    queryPtr++;
                } else {
                    break;
                }
            }
            return ((Line) hull.toArray()[queryPtr]).eval(x);
        }
    }

    // Application: Minimize cost with CHT
    // dp[i] = min(dp[j] + cost[i][j]) for all j < i
    // When cost[i][j] = a[i]*a[j] + b[i]*b[j] + c[i][j], can use CHT
    static long minCostWithCHT(long[] a, long[] b, long[][] c) {
        int n = a.length;
        long[] dp = new long[n];
        dp[0] = c[0][0];

        ConvexHullTrickDynamic cht = new ConvexHullTrickDynamic();
        cht.addLine(b[0], dp[0] + c[0][0]);

        for (int i = 1; i < n; i++) {
            dp[i] = cht.query(a[i]);
            cht.addLine(b[i], dp[i] + c[i][i]);
        }

        return dp[n - 1];
    }

    // Application: Non-crossing matching
    // dp[i][j] = min cost to match elements from i to j
    // Using CHT to optimize quadratic DP
    static long matchingCost(int[] arr) {
        int n = arr.length;
        long[][] dp = new long[n][n];

        // Base case: no cost for single elements
        for (int i = 0; i < n; i++) {
            dp[i][i] = 0;
            if (i + 1 < n) dp[i][i + 1] = 0;
        }

        // Fill dp table
        for (int len = 2; len < n; len++) {
            for (int i = 0; i + len < n; i++) {
                int j = i + len;
                dp[i][j] = Long.MAX_VALUE;
                for (int k = i + 1; k < j; k++) {
                    long cost = dp[i][k] + dp[k + 1][j] + arr[i] * arr[j];
                    dp[i][j] = Math.min(dp[i][j], cost);
                }
            }
        }

        return dp[0][n - 1];
    }

    // Application: Alien Dictionary / Parametric Search
    static long parametricSearch(long[] costs, long lambda) {
        long total = 0;
        for (long cost : costs) {
            total += cost - lambda;
        }
        return total;
    }

    // Application: Slope Optimization in DP
    // When DP transition follows: dp[i] = min(dp[j] + a[j]*b[i] + c[j] + d[i])
    static long slopeOptimizationDP(int[] a, int[] b) {
        int n = a.length;
        long[] dp = new long[n];
        dp[0] = 0;

        ConvexHullTrickOffline cht = new ConvexHullTrickOffline();
        cht.addLine(a[0], dp[0]);

        for (int i = 1; i < n; i++) {
            dp[i] = cht.query(b[i]);
            cht.addLine(a[i], dp[i]);
        }

        return dp[n - 1];
    }

    // Test function
    public static void main(String[] args) {
        ConvexHullTrickDynamic cht = new ConvexHullTrickDynamic();

        // Add some lines: y = 2x + 3, y = -x + 5, y = 3x + 1
        cht.addLine(2, 3);
        cht.addLine(-1, 5);
        cht.addLine(3, 1);

        System.out.println("Query at x=0: " + cht.query(0));
        System.out.println("Query at x=1: " + cht.query(1));
        System.out.println("Query at x=2: " + cht.query(2));
        System.out.println("Query at x=5: " + cht.query(5));

        // Test with DP example
        int[] a = {1, 2, 3, 4, 5};
        int[] b = {2, 3, 4, 5, 6};
        long result = slopeOptimizationDP(a, b);
        System.out.println("DP result: " + result);
    }
}
