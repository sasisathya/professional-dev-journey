import java.util.*;

/**
 * Category 17: Greedy Patterns
 */
public class Category17_GreedyPatterns {

    // 1. Jump Game I (LeetCode 55)
    static boolean canJump(int[] nums) {
        int maxReach = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > maxReach) return false;
            maxReach = Math.max(maxReach, i + nums[i]);
        }
        return true;
    }

    // 2. Jump Game II (LeetCode 45)
    static int jump(int[] nums) {
        int jumps = 0, currentEnd = 0, farthest = 0;
        for (int i = 0; i < nums.length - 1; i++) {
            farthest = Math.max(farthest, i + nums[i]);
            if (i == currentEnd) {
                jumps++;
                currentEnd = farthest;
            }
        }
        return jumps;
    }

    // 3. Gas Station (LeetCode 134)
    static int canCompleteCircuit(int[] gas, int[] cost) {
        int total = 0, current = 0, start = 0;
        for (int i = 0; i < gas.length; i++) {
            current += gas[i] - cost[i];
            if (current < 0) {
                start = i + 1;
                current = 0;
            }
            total += gas[i] - cost[i];
        }
        return total < 0 ? -1 : start;
    }

    // 4. Non-overlapping Intervals (LeetCode 435)
    static int eraseOverlapIntervals(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> a[1] - b[1]);
        int count = 0, lastEnd = Integer.MIN_VALUE;
        for (int[] interval : intervals) {
            if (interval[0] >= lastEnd) {
                lastEnd = interval[1];
            } else {
                count++;
            }
        }
        return count;
    }

    // 5. Merge Intervals (LeetCode 56)
    static int[][] merge(int[][] intervals) {
        if (intervals.length == 0) return new int[0][0];
        Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
        List<int[]> merged = new ArrayList<>();
        int[] current = intervals[0];
        for (int i = 1; i < intervals.length; i++) {
            if (intervals[i][0] <= current[1]) {
                current[1] = Math.max(current[1], intervals[i][1]);
            } else {
                merged.add(current);
                current = intervals[i];
            }
        }
        merged.add(current);
        return merged.toArray(new int[0][0]);
    }

    // 6. Meeting Rooms II (LeetCode 253)
    static int minMeetingRooms(int[][] intervals) {
        int[] starts = new int[intervals.length];
        int[] ends = new int[intervals.length];
        for (int i = 0; i < intervals.length; i++) {
            starts[i] = intervals[i][0];
            ends[i] = intervals[i][1];
        }
        Arrays.sort(starts);
        Arrays.sort(ends);

        int rooms = 0, endPtr = 0;
        for (int i = 0; i < starts.length; i++) {
            if (starts[i] < ends[endPtr]) {
                rooms++;
            } else {
                endPtr++;
            }
        }
        return rooms;
    }

    // 7. Minimum Arrows to Burst Balloons (LeetCode 452)
    static int findMinArrowShots(int[][] points) {
        Arrays.sort(points, (a, b) -> {
            if (a[1] < b[1]) return -1;
            if (a[1] > b[1]) return 1;
            return 0;
        });

        int arrows = 1;
        long lastPos = (long)points[0][1];
        for (int i = 1; i < points.length; i++) {
            if (points[i][0] > lastPos) {
                arrows++;
                lastPos = (long)points[i][1];
            }
        }
        return arrows;
    }

    // 8. Best Time to Buy and Sell Stock (LeetCode 121)
    static int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE, maxProfit = 0;
        for (int price : prices) {
            minPrice = Math.min(minPrice, price);
            maxProfit = Math.max(maxProfit, price - minPrice);
        }
        return maxProfit;
    }

    // 9. Hand of Straights (LeetCode 1296)
    static boolean isNStraightHand(int[] hand, int groupSize) {
        if (hand.length % groupSize != 0) return false;
        Map<Integer, Integer> count = new HashMap<>();
        for (int h : hand) count.put(h, count.getOrDefault(h, 0) + 1);

        Arrays.sort(hand);
        for (int h : hand) {
            if (count.get(h) == 0) continue;
            for (int i = 0; i < groupSize; i++) {
                if (count.getOrDefault(h + i, 0) == 0) return false;
                count.put(h + i, count.get(h + i) - 1);
            }
        }
        return true;
    }

    // 10. Largest Palindrome Product (Greedy variant)
    static int largestPalindrome(int n) {
        int maxLimit = (int) Math.pow(10, n) - 1;
        int minLimit = (int) Math.pow(10, n - 1);
        for (int i = maxLimit; i >= minLimit; i--) {
            if (isPalindrome(i * maxLimit)) return i * maxLimit;
        }
        return 0;
    }

    static boolean isPalindrome(int x) {
        String s = String.valueOf(x);
        return s.equals(new StringBuilder(s).reverse().toString());
    }

    public static void main(String[] args) {
        System.out.println("Jump: " + jump(new int[]{2,3,1,1,4}));
        System.out.println("Gas Station: " + canCompleteCircuit(new int[]{1,2,3,4,5}, new int[]{3,4,5,1,2}));
    }
}
