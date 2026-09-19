import java.util.*;

/**
 * Category 24: Advanced Patterns
 * Segment Tree, Fenwick Tree, and other advanced techniques
 */
public class Category24_AdvancedPatterns {

    // 1. Segment Tree
    static class SegmentTree {
        int[] tree;
        int n;

        SegmentTree(int[] arr) {
            n = arr.length;
            tree = new int[4 * n];
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

        int query(int node, int start, int end, int l, int r) {
            if (r < start || end < l) return 0;
            if (l <= start && end <= r) return tree[node];
            int mid = (start + end) / 2;
            return query(2 * node + 1, start, mid, l, r) + 
                   query(2 * node + 2, mid + 1, end, l, r);
        }

        void update(int node, int start, int end, int idx, int val) {
            if (start == end) {
                tree[node] = val;
            } else {
                int mid = (start + end) / 2;
                if (idx <= mid) {
                    update(2 * node + 1, start, mid, idx, val);
                } else {
                    update(2 * node + 2, mid + 1, end, idx, val);
                }
                tree[node] = tree[2 * node + 1] + tree[2 * node + 2];
            }
        }
    }

    // 2. Fenwick Tree (Binary Indexed Tree)
    static class FenwickTree {
        int[] tree;
        int n;

        FenwickTree(int n) {
            this.n = n;
            tree = new int[n + 1];
        }

        void update(int i, int delta) {
            while (i <= n) {
                tree[i] += delta;
                i += i & (-i);
            }
        }

        int query(int i) {
            int sum = 0;
            while (i > 0) {
                sum += tree[i];
                i -= i & (-i);
            }
            return sum;
        }

        int rangeQuery(int l, int r) {
            return query(r) - query(l - 1);
        }
    }

    // 3. LRU Cache Implementation
    static class LRUCache {
        Map<Integer, Integer> map;
        Deque<Integer> deque;
        int capacity;

        LRUCache(int capacity) {
            this.capacity = capacity;
            map = new HashMap<>();
            deque = new LinkedList<>();
        }

        int get(int key) {
            if (!map.containsKey(key)) return -1;
            deque.remove(Integer.valueOf(key));
            deque.offerLast(key);
            return map.get(key);
        }

        void put(int key, int value) {
            if (map.containsKey(key)) {
                deque.remove(Integer.valueOf(key));
            } else if (map.size() == capacity) {
                int removed = deque.pollFirst();
                map.remove(removed);
            }
            map.put(key, value);
            deque.offerLast(key);
        }
    }

    public static void main(String[] args) {
        int[] arr = {1, 3, 5, 7, 9};
        SegmentTree st = new SegmentTree(arr);
        System.out.println("Segment Tree initialized");
        
        FenwickTree ft = new FenwickTree(5);
        ft.update(1, 1);
        System.out.println("Fenwick Query: " + ft.query(1));
    }
}
