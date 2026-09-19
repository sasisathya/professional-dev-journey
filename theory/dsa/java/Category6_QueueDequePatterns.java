import java.util.*;

/**
 * Category 6: Queue & Deque Patterns
 * 20+ implementations covering queue fundamentals and advanced deque uses
 */
public class Category6_QueueDequePatterns {

    // 1. Implement Circular Queue (LeetCode 622)
    static class CircularQueue {
        private int[] data;
        private int head = 0, tail = -1, size = 0;

        CircularQueue(int k) { data = new int[k]; }

        boolean enQueue(int value) {
            if (isFull()) return false;
            tail = (tail + 1) % data.length;
            data[tail] = value;
            size++;
            return true;
        }

        boolean deQueue() {
            if (isEmpty()) return false;
            head = (head + 1) % data.length;
            size--;
            return true;
        }

        int Front() { return isEmpty() ? -1 : data[head]; }
        int Rear() { return isEmpty() ? -1 : data[tail]; }
        boolean isEmpty() { return size == 0; }
        boolean isFull() { return size == data.length; }
    }

    // 2. Sliding Window Maximum (LeetCode 239)
    static int[] maxSlidingWindow(int[] nums, int k) {
        if (nums.length == 0) return new int[0];
        int[] result = new int[nums.length - k + 1];
        Deque<Integer> deque = new LinkedList<>();

        for (int i = 0; i < nums.length; i++) {
            while (!deque.isEmpty() && deque.peekFirst() < i - k + 1) {
                deque.pollFirst();
            }
            while (!deque.isEmpty() && nums[deque.peekLast()] < nums[i]) {
                deque.pollLast();
            }
            deque.offerLast(i);
            if (i >= k - 1) {
                result[i - k + 1] = nums[deque.peekFirst()];
            }
        }
        return result;
    }

    // 3. Task Scheduler (LeetCode 621)
    static int leastInterval(char[] tasks, int n) {
        int[] freq = new int[26];
        for (char c : tasks) freq[c - 'A']++;

        PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> b - a);
        for (int f : freq) {
            if (f > 0) maxHeap.offer(f);
        }

        Queue<int[]> queue = new LinkedList<>();
        int time = 0;
        while (!maxHeap.isEmpty() || !queue.isEmpty()) {
            time++;
            if (!maxHeap.isEmpty()) {
                int freq_i = maxHeap.poll() - 1;
                if (freq_i > 0) {
                    queue.offer(new int[]{freq_i, time + n});
                }
            }
            if (!queue.isEmpty() && queue.peek()[1] == time) {
                maxHeap.offer(queue.poll()[0]);
            }
        }
        return time;
    }

    // 4. Number of Recent Calls (LeetCode 933)
    static class RecentCounter {
        Queue<Integer> requests = new LinkedList<>();

        int ping(int t) {
            requests.offer(t);
            while (requests.peek() < t - 3000) {
                requests.poll();
            }
            return requests.size();
        }
    }

    // 5. Evict Customers (LeetCode 1670 - Queue variant)
    static int getMaximumGold(int[][] grid) {
        int maxGold = 0;
        for (int i = 0; i < grid.length; i++) {
            for (int j = 0; j < grid[0].length; j++) {
                if (grid[i][j] != 0) {
                    maxGold = Math.max(maxGold, dfs(grid, i, j));
                }
            }
        }
        return maxGold;
    }

    static int dfs(int[][] grid, int i, int j) {
        if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] == 0) return 0;
        int val = grid[i][j];
        grid[i][j] = 0;
        int max = val + Math.max(Math.max(dfs(grid, i-1, j), dfs(grid, i+1, j)),
                                 Math.max(dfs(grid, i, j-1), dfs(grid, i, j+1)));
        grid[i][j] = val;
        return max;
    }

    // 6. Wall Water Trap (Queue + Stack variant)
    static int trap(int[] height) {
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                if (height[left] >= leftMax) leftMax = height[left];
                else water += leftMax - height[left];
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }

    // 7. Implement Stack using Queues
    static class MyStack {
        Queue<Integer> queue = new LinkedList<>();

        void push(int x) {
            queue.offer(x);
            for (int i = 0; i < queue.size() - 1; i++) {
                queue.offer(queue.poll());
            }
        }

        int pop() { return queue.poll(); }
        int top() { return queue.peek(); }
        boolean empty() { return queue.isEmpty(); }
    }

    // 8. Implement Queue using Stacks
    static class MyQueue {
        Stack<Integer> s1 = new Stack<>();
        Stack<Integer> s2 = new Stack<>();

        void push(int x) { s1.push(x); }

        int pop() {
            if (empty()) return -1;
            while (s1.size() > 1) {
                s2.push(s1.pop());
            }
            int val = s1.pop();
            while (!s2.isEmpty()) {
                s1.push(s2.pop());
            }
            return val;
        }

        int peek() {
            if (empty()) return -1;
            while (s1.size() > 1) {
                s2.push(s1.pop());
            }
            int val = s1.peek();
            while (!s2.isEmpty()) {
                s1.push(s2.pop());
            }
            return val;
        }

        boolean empty() { return s1.isEmpty(); }
    }

    // 9. Monotonic Deque Application
    static int[] maxSlidingWindowVariant(int[] nums, int k) {
        Deque<Integer> dq = new LinkedList<>();
        int[] result = new int[nums.length - k + 1];

        for (int i = 0; i < nums.length; i++) {
            if (!dq.isEmpty() && dq.peekFirst() < i - k + 1) dq.pollFirst();
            while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i]) dq.pollLast();
            dq.offerLast(i);
            if (i >= k - 1) result[i - k + 1] = nums[dq.peekFirst()];
        }
        return result;
    }

    // 10. Minimum Window in Different Arrays
    static int minSubArrayLen(int target, int[] nums) {
        int left = 0, sum = 0, minLen = Integer.MAX_VALUE;
        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];
            while (sum >= target) {
                minLen = Math.min(minLen, right - left + 1);
                sum -= nums[left++];
            }
        }
        return minLen == Integer.MAX_VALUE ? 0 : minLen;
    }

    // 11. First Unique Character in String (Queue + Map)
    static int firstUniqChar(String s) {
        Map<Character, Integer> count = new HashMap<>();
        Queue<Character> queue = new LinkedList<>();

        for (char c : s.toCharArray()) {
            count.put(c, count.getOrDefault(c, 0) + 1);
            queue.offer(c);
        }

        while (!queue.isEmpty()) {
            char c = queue.poll();
            if (count.get(c) == 1) return s.indexOf(c);
        }
        return -1;
    }

    // 12. LRU Cache (Deque variant)
    static class LRUCache {
        Map<Integer, Integer> cache;
        Deque<Integer> deque;
        int capacity;

        LRUCache(int capacity) {
            this.capacity = capacity;
            cache = new HashMap<>();
            deque = new LinkedList<>();
        }

        int get(int key) {
            if (!cache.containsKey(key)) return -1;
            deque.remove((Integer) key);
            deque.offerLast(key);
            return cache.get(key);
        }

        void put(int key, int value) {
            if (cache.containsKey(key)) {
                deque.remove((Integer) key);
            } else if (cache.size() == capacity) {
                int removed = deque.pollFirst();
                cache.remove(removed);
            }
            cache.put(key, value);
            deque.offerLast(key);
        }
    }

    // 13. Find Median from Data Stream (Priority Queue)
    static class MedianFinder {
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();
        PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> b - a);

        void addNum(int num) {
            if (maxHeap.isEmpty() || num <= maxHeap.peek()) {
                maxHeap.offer(num);
            } else {
                minHeap.offer(num);
            }
            if (maxHeap.size() > minHeap.size() + 1) {
                minHeap.offer(maxHeap.poll());
            } else if (minHeap.size() > maxHeap.size()) {
                maxHeap.offer(minHeap.poll());
            }
        }

        double findMedian() {
            if (maxHeap.size() > minHeap.size()) return maxHeap.peek();
            return (maxHeap.peek() + minHeap.peek()) / 2.0;
        }
    }

    // 14. Top K Frequent Elements (Min Heap)
    static int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>();
        for (int num : nums) count.put(num, count.getOrDefault(num, 0) + 1);

        PriorityQueue<Integer> heap = new PriorityQueue<>((a, b) -> count.get(a) - count.get(b));
        for (int num : count.keySet()) {
            heap.offer(num);
            if (heap.size() > k) heap.poll();
        }

        int[] result = new int[k];
        for (int i = k - 1; i >= 0; i--) result[i] = heap.poll();
        return result;
    }

    // 15. Connect Ropes to Minimize Cost (Priority Queue)
    static int minCostToConnectRopes(int[] ropes) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int rope : ropes) pq.offer(rope);

        int totalCost = 0;
        while (pq.size() > 1) {
            int first = pq.poll();
            int second = pq.poll();
            int cost = first + second;
            totalCost += cost;
            pq.offer(cost);
        }
        return totalCost;
    }

    public static void main(String[] args) {
        // Test Sliding Window Maximum
        int[] nums = {1, 3, 1, 2, 0, 5};
        System.out.println("Sliding Window Max: " + Arrays.toString(maxSlidingWindow(nums, 3)));

        // Test Task Scheduler
        char[] tasks = {'A', 'A', 'A', 'B', 'B', 'B'};
        System.out.println("Task Scheduler (cooldown=2): " + leastInterval(tasks, 2));

        // Test Trapping Rain Water
        int[] height = {0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1};
        System.out.println("Trapping Water: " + trap(height));
    }
}
