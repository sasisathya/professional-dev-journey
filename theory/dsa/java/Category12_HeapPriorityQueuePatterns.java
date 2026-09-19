import java.util.*;

/**
 * Category 12: Heap and Priority Queue Patterns
 * 20+ implementations covering heap operations and priority queue applications
 */
public class Category12_HeapPriorityQueuePatterns {

    // 1. Kth Largest Element (LeetCode 215)
    static int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();
        for (int num : nums) {
            minHeap.offer(num);
            if (minHeap.size() > k) minHeap.poll();
        }
        return minHeap.peek();
    }

    // 2. Top K Frequent Elements (LeetCode 347)
    static int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>();
        for (int num : nums) count.put(num, count.getOrDefault(num, 0) + 1);

        PriorityQueue<Integer> minHeap = new PriorityQueue<>((a, b) -> count.get(a) - count.get(b));
        for (int num : count.keySet()) {
            minHeap.offer(num);
            if (minHeap.size() > k) minHeap.poll();
        }

        int[] result = new int[k];
        int i = k - 1;
        while (!minHeap.isEmpty()) result[i--] = minHeap.poll();
        return result;
    }

    // 3. Median of Two Sorted Arrays (LeetCode 295)
    static class MedianFinder {
        PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> b - a);
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();

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

    // 4. Sliding Window Maximum (LeetCode 239)
    static int[] maxSlidingWindow(int[] nums, int k) {
        Deque<Integer> deque = new LinkedList<>();
        int[] result = new int[nums.length - k + 1];

        for (int i = 0; i < nums.length; i++) {
            if (!deque.isEmpty() && deque.peekFirst() < i - k + 1) {
                deque.pollFirst();
            }
            while (!deque.isEmpty() && nums[deque.peekLast()] < nums[i]) {
                deque.pollLast();
            }
            deque.offerLast(i);
            if (i >= k - 1) result[i - k + 1] = nums[deque.peekFirst()];
        }
        return result;
    }

    // 5. Merge K Sorted Lists (LeetCode 23)
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int val) { this.val = val; }
    }

    static ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);
        for (ListNode list : lists) {
            if (list != null) pq.offer(list);
        }

        ListNode dummy = new ListNode(0), curr = dummy;
        while (!pq.isEmpty()) {
            ListNode node = pq.poll();
            curr.next = node;
            curr = curr.next;
            if (node.next != null) pq.offer(node.next);
        }
        return dummy.next;
    }

    // 6. Connect Ropes to Minimize Cost
    static int minimumCost(int[] ropes) {
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

    // 7. Task Scheduler (LeetCode 621)
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

    // 8. IPO (LeetCode 502)
    static int findMaximizedCapital(int k, int w, int[] profits, int[] capital) {
        int n = profits.length;
        int[][] projects = new int[n][2];
        for (int i = 0; i < n; i++) {
            projects[i][0] = capital[i];
            projects[i][1] = profits[i];
        }
        Arrays.sort(projects, (a, b) -> a[0] - b[0]);

        PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> b - a);
        int i = 0;
        for (int j = 0; j < k; j++) {
            while (i < n && projects[i][0] <= w) {
                maxHeap.offer(projects[i++][1]);
            }
            if (maxHeap.isEmpty()) break;
            w += maxHeap.poll();
        }
        return w;
    }

    // 9. Reorder Data (LeetCode 1337)
    static int[] getOrder(int[][] tasks) {
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] == b[1] ? a[0] - b[0] : a[1] - b[1]);
        for (int i = 0; i < tasks.length; i++) {
            pq.offer(new int[]{i, tasks[i][0], tasks[i][1]});
        }

        Arrays.sort(tasks, (a, b) -> a[0] - b[0]);

        int[] result = new int[tasks.length];
        long currTime = 0;
        PriorityQueue<int[]> available = new PriorityQueue<>((a, b) -> a[2] == b[2] ? a[0] - b[0] : a[2] - b[2]);

        int taskIdx = 0;
        for (int i = 0; i < tasks.length; i++) {
            if (currTime < tasks[i][0]) {
                currTime = tasks[i][0];
            }
            available.offer(tasks[i]);
            int[] task = available.poll();
            result[i] = task[0];
            currTime += task[2];
        }
        return result;
    }

    // 10. Distant Barcodes (LeetCode 1054)
    static int[] rearrangeBarcodes(int[] barcodes) {
        Map<Integer, Integer> count = new HashMap<>();
        for (int code : barcodes) {
            count.put(code, count.getOrDefault(code, 0) + 1);
        }

        PriorityQueue<int[]> maxHeap = new PriorityQueue<>((a, b) -> b[1] - a[1]);
        for (int code : count.keySet()) {
            maxHeap.offer(new int[]{code, count.get(code)});
        }

        int[] result = new int[barcodes.length];
        int idx = 0;
        while (!maxHeap.isEmpty()) {
            int[] first = maxHeap.poll();
            if (maxHeap.isEmpty()) {
                result[idx++] = first[0];
                break;
            }
            int[] second = maxHeap.poll();
            result[idx++] = first[0];
            result[idx++] = second[0];
            if (first[1] > 1) maxHeap.offer(new int[]{first[0], first[1] - 1});
            if (second[1] > 1) maxHeap.offer(new int[]{second[0], second[1] - 1});
        }
        return result;
    }

    // 11. Reorganize String (LeetCode 767)
    static String reorganizeString(String s) {
        Map<Character, Integer> count = new HashMap<>();
        for (char c : s.toCharArray()) {
            count.put(c, count.getOrDefault(c, 0) + 1);
        }

        PriorityQueue<Character> maxHeap = new PriorityQueue<>((a, b) -> count.get(b) - count.get(a));
        for (char c : count.keySet()) maxHeap.offer(c);

        StringBuilder result = new StringBuilder();
        while (maxHeap.size() > 1) {
            char first = maxHeap.poll();
            char second = maxHeap.poll();
            result.append(first).append(second);
            if (count.get(first) > 1) {
                count.put(first, count.get(first) - 1);
                maxHeap.offer(first);
            }
            if (count.get(second) > 1) {
                count.put(second, count.get(second) - 1);
                maxHeap.offer(second);
            }
        }
        if (!maxHeap.isEmpty()) {
            char last = maxHeap.poll();
            if (count.get(last) > 1) return "";
            result.append(last);
        }
        return result.toString();
    }

    // 12. Ugly Number II (LeetCode 264)
    static int nthUglyNumber(int n) {
        int[] dp = new int[n];
        dp[0] = 1;
        int i2 = 0, i3 = 0, i5 = 0;
        for (int i = 1; i < n; i++) {
            int next2 = dp[i2] * 2;
            int next3 = dp[i3] * 3;
            int next5 = dp[i5] * 5;
            int nextUgly = Math.min(next2, Math.min(next3, next5));
            dp[i] = nextUgly;
            if (nextUgly == next2) i2++;
            if (nextUgly == next3) i3++;
            if (nextUgly == next5) i5++;
        }
        return dp[n - 1];
    }

    // 13. Smallest Range Covering Elements (LeetCode 632)
    static int[] smallestRange(int[][] nums) {
        PriorityQueue<int[]> minHeap = new PriorityQueue<>((a, b) -> a[0] - b[0]);
        int maxVal = Integer.MIN_VALUE;
        for (int i = 0; i < nums.length; i++) {
            minHeap.offer(new int[]{nums[i][0], i, 0});
            maxVal = Math.max(maxVal, nums[i][0]);
        }

        int[] result = {0, Integer.MAX_VALUE};
        while (minHeap.size() == nums.length) {
            int[] curr = minHeap.poll();
            int minVal = curr[0];
            if (maxVal - minVal < result[1] - result[0]) {
                result[0] = minVal;
                result[1] = maxVal;
            }
            int listIdx = curr[1];
            int elemIdx = curr[2];
            if (elemIdx + 1 < nums[listIdx].length) {
                int newVal = nums[listIdx][elemIdx + 1];
                minHeap.offer(new int[]{newVal, listIdx, elemIdx + 1});
                maxVal = Math.max(maxVal, newVal);
            }
        }
        return result;
    }

    // 14. Super Ugly Number (LeetCode 313)
    static int nthSuperUglyNumber(int n, int[] primes) {
        int[] dp = new int[n];
        int[] pointers = new int[primes.length];
        dp[0] = 1;

        for (int i = 1; i < n; i++) {
            int[] nextVals = new int[primes.length];
            int minVal = Integer.MAX_VALUE;
            for (int j = 0; j < primes.length; j++) {
                nextVals[j] = dp[pointers[j]] * primes[j];
                minVal = Math.min(minVal, nextVals[j]);
            }
            dp[i] = minVal;
            for (int j = 0; j < primes.length; j++) {
                if (nextVals[j] == minVal) pointers[j]++;
            }
        }
        return dp[n - 1];
    }

    // 15. Last Stone Weight (LeetCode 1046)
    static int lastStoneWeight(int[] stones) {
        PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> b - a);
        for (int stone : stones) maxHeap.offer(stone);

        while (maxHeap.size() > 1) {
            int first = maxHeap.poll();
            int second = maxHeap.poll();
            if (first > second) maxHeap.offer(first - second);
        }
        return maxHeap.isEmpty() ? 0 : maxHeap.peek();
    }

    public static void main(String[] args) {
        int[] nums = {3, 2, 1, 5, 6, 4};
        System.out.println("3rd Largest: " + findKthLargest(nums, 3));
        System.out.println("Top 2 Frequent: " + Arrays.toString(topKFrequent(new int[]{1, 1, 1, 2, 2, 3}, 2)));
    }
}
