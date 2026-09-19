import java.util.*;

/**
 * Category 25: Lazy Propagation Segment Tree
 * O(log n) for range updates and range queries
 * CRITICAL for competitive programming & interviews
 */
public class Category25_LazySegmentTree {

    static class LazySegmentTree {
        int[] tree, lazy;
        int n;

        LazySegmentTree(int[] arr) {
            n = arr.length;
            tree = new int[4 * n];
            lazy = new int[4 * n];
            build(arr, 0, 0, n - 1);
        }

        void build(int[] arr, int node, int start, int end) {
            if (start == end) {
                tree[node] = arr[start];
            } else {
                int mid = (start + end) / 2;
                build(arr, 2 * node + 1, start, mid);
                build(arr, 2 * node + 2, mid + 1, end);
                tree[node] = tree[2 * node + 1] + tree[2 * node + 2];
            }
        }

        void updateRange(int l, int r, int val) {
            updateRangeHelper(0, 0, n - 1, l, r, val);
        }

        void updateRangeHelper(int node, int start, int end, int l, int r, int val) {
            if (lazy[node] != 0) {
                tree[node] += (end - start + 1) * lazy[node];
                if (start != end) {
                    lazy[2 * node + 1] += lazy[node];
                    lazy[2 * node + 2] += lazy[node];
                }
                lazy[node] = 0;
            }

            if (start > end || start > r || end < l) return;

            if (l <= start && end <= r) {
                tree[node] += (end - start + 1) * val;
                if (start != end) {
                    lazy[2 * node + 1] += val;
                    lazy[2 * node + 2] += val;
                }
                return;
            }

            int mid = (start + end) / 2;
            updateRangeHelper(2 * node + 1, start, mid, l, r, val);
            updateRangeHelper(2 * node + 2, mid + 1, end, l, r, val);
            tree[node] = tree[2 * node + 1] + tree[2 * node + 2];
        }

        int queryRange(int l, int r) {
            return queryRangeHelper(0, 0, n - 1, l, r);
        }

        int queryRangeHelper(int node, int start, int end, int l, int r) {
            if (start > end || start > r || end < l) return 0;

            if (lazy[node] != 0) {
                tree[node] += (end - start + 1) * lazy[node];
                if (start != end) {
                    lazy[2 * node + 1] += lazy[node];
                    lazy[2 * node + 2] += lazy[node];
                }
                lazy[node] = 0;
            }

            if (l <= start && end <= r) return tree[node];

            int mid = (start + end) / 2;
            return queryRangeHelper(2 * node + 1, start, mid, l, r) +
                   queryRangeHelper(2 * node + 2, mid + 1, end, l, r);
        }

        void print() {
            System.out.print("Array: ");
            for (int i = 0; i < n; i++) {
                System.out.print(queryRange(i, i) + " ");
            }
            System.out.println();
        }
    }

    // Application: Range Update, Range Query Sum (LeetCode 370 variant)
    static int[] rangeAdditionQueries(int n, int[][] updates, int[] queries) {
        LazySegmentTree lst = new LazySegmentTree(new int[n]);
        for (int[] update : updates) {
            lst.updateRange(update[0], update[1], update[2]);
        }

        int[] result = new int[queries.length];
        for (int i = 0; i < queries.length; i++) {
            result[i] = lst.queryRange(queries[i], queries[i]);
        }
        return result;
    }

    // Application: Rectangle Area Sum Update (2D variant)
    static class LazySegmentTree2D {
        LazySegmentTree[] trees;
        int rows;

        LazySegmentTree2D(int[][] matrix) {
            rows = matrix.length;
            trees = new LazySegmentTree[rows];
            for (int i = 0; i < rows; i++) {
                trees[i] = new LazySegmentTree(matrix[i]);
            }
        }

        void updateRectangle(int r1, int r2, int c1, int c2, int val) {
            for (int i = r1; i <= r2; i++) {
                trees[i].updateRange(c1, c2, val);
            }
        }

        int queryRectangle(int r1, int r2, int c1, int c2) {
            int sum = 0;
            for (int i = r1; i <= r2; i++) {
                sum += trees[i].queryRange(c1, c2);
            }
            return sum;
        }
    }

    // LeetCode 1622: Fancy Sequence
    static class FancySequence {
        LazySegmentTree lst;
        List<Integer> seq;

        FancySequence() {
            seq = new ArrayList<>();
        }

        void append(int val) {
            seq.add(val);
        }

        void addAll(int inc) {
            if (seq.isEmpty()) return;
            if (lst == null) {
                int[] arr = new int[seq.size()];
                for (int i = 0; i < seq.size(); i++) arr[i] = seq.get(i);
                lst = new LazySegmentTree(arr);
            }
            lst.updateRange(0, seq.size() - 1, inc);
        }

        void multAll(int m) {
            // Would need multiplicative lazy propagation
        }

        int getIndex(int idx) {
            if (idx >= seq.size()) return -1;
            if (lst == null) return seq.get(idx);
            return lst.queryRange(idx, idx);
        }
    }

    // Application: Interval Assignment (LeetCode variant)
    static int[] assignValues(int n, int[][] operations) {
        LazySegmentTree lst = new LazySegmentTree(new int[n]);
        for (int[] op : operations) {
            lst.updateRange(op[0], op[1], op[2]);
        }

        int[] result = new int[n];
        for (int i = 0; i < n; i++) {
            result[i] = lst.queryRange(i, i);
        }
        return result;
    }

    // Application: Difference Array Optimization (Range updates)
    static int[] minIncrementForUnique(int[] nums) {
        Arrays.sort(nums);
        LazySegmentTree lst = new LazySegmentTree(new int[nums.length]);
        int[] result = new int[nums.length];

        for (int i = 0; i < nums.length; i++) {
            result[i] = nums[i];
            if (i > 0 && result[i] <= result[i - 1]) {
                result[i] = result[i - 1] + 1;
            }
        }
        return result;
    }

    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4, 5};
        LazySegmentTree lst = new LazySegmentTree(arr);

        System.out.println("Initial query(0-4): " + lst.queryRange(0, 4));
        lst.updateRange(0, 2, 5);
        System.out.println("After update(0-2, +5): " + lst.queryRange(0, 4));
        lst.updateRange(2, 4, -3);
        System.out.println("After update(2-4, -3): " + lst.queryRange(0, 4));
        lst.print();
    }
}
