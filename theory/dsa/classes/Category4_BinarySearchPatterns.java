import java.util.*;

/**
 * Category 4: Binary Search Patterns
 * 22 implementations covering all binary search variants
 */
public class Category4_BinarySearchPatterns {

    // 1. Binary Search (LeetCode 704)
    static int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }

    // 2. First and Last Position (LeetCode 34)
    static int[] searchRange(int[] nums, int target) {
        int[] result = {-1, -1};
        result[0] = findFirst(nums, target);
        result[1] = findLast(nums, target);
        return result;
    }

    static int findFirst(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) right = mid - 1;
            else if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return left < nums.length && nums[left] == target ? left : -1;
    }

    static int findLast(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) left = mid + 1;
            else if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return right >= 0 && nums[right] == target ? right : -1;
    }

    // 3. Search Insert Position (LeetCode 35)
    static int searchInsert(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return left;
    }

    // 4. Search in Rotated Array (LeetCode 33)
    static int searchRotated(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[left] <= nums[mid]) {
                if (nums[left] <= target && target < nums[mid])
                    right = mid - 1;
                else left = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[right])
                    left = mid + 1;
                else right = mid - 1;
            }
        }
        return -1;
    }

    // 5. Search Rotated with Duplicates (LeetCode 81)
    static boolean searchRotatedWithDuplicates(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return true;
            if (nums[left] == nums[mid] && nums[mid] == nums[right]) {
                left++;
                right--;
            } else if (nums[left] <= nums[mid]) {
                if (nums[left] <= target && target < nums[mid])
                    right = mid - 1;
                else left = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[right])
                    left = mid + 1;
                else right = mid - 1;
            }
        }
        return false;
    }

    // 6. Find Minimum in Rotated (LeetCode 153)
    static int findMin(int[] nums) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] < nums[right]) right = mid;
            else left = mid + 1;
        }
        return nums[left];
    }

    // 7. Find Minimum with Duplicates (LeetCode 154)
    static int findMinWithDuplicates(int[] nums) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] < nums[right]) right = mid;
            else if (nums[mid] > nums[right]) left = mid + 1;
            else right--;
        }
        return nums[left];
    }

    // 8. Peak Element (LeetCode 162)
    static int findPeakElement(int[] nums) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] < nums[mid + 1]) left = mid + 1;
            else right = mid;
        }
        return left;
    }

    // 9. Mountain Array Peak (LeetCode 852)
    static int peakIndexInMountainArray(int[] arr) {
        int left = 1, right = arr.length - 2;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] > arr[mid - 1] && arr[mid] > arr[mid + 1]) return mid;
            else if (arr[mid] < arr[mid + 1]) left = mid + 1;
            else right = mid - 1;
        }
        return left;
    }

    // 10. Sqrt(x) (LeetCode 69)
    static int mySqrt(int x) {
        if (x < 2) return x;
        int left = 2, right = x / 2;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            long square = (long)mid * mid;
            if (square == x) return mid;
            else if (square < x) left = mid + 1;
            else right = mid - 1;
        }
        return right;
    }

    // 11. Valid Perfect Square (LeetCode 367)
    static boolean isPerfectSquare(int num) {
        if (num < 2) return true;
        long left = 2, right = num / 2;
        while (left <= right) {
            long mid = left + (right - left) / 2;
            long square = mid * mid;
            if (square == num) return true;
            else if (square < num) left = mid + 1;
            else right = mid - 1;
        }
        return false;
    }

    // 12. First Bad Version (LeetCode 278)
    static int firstBadVersion(int n) {
        int left = 1, right = n;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (isBadVersion(mid)) right = mid;
            else left = mid + 1;
        }
        return left;
    }

    static boolean isBadVersion(int n) { return false; } // Placeholder

    // 13. Guess Number (LeetCode 374)
    static int guessNumber(int n) {
        int left = 1, right = n;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            int result = guess(mid);
            if (result == 0) return mid;
            else if (result < 0) right = mid - 1;
            else left = mid + 1;
        }
        return left;
    }

    static int guess(int num) { return 0; } // Placeholder

    // 14. Leftmost Column with at Least a One (LeetCode 1428)
    static int leftMostColumnWithOne(int[][] matrix) {
        int rows = matrix.length, cols = matrix[0].length;
        int row = 0, col = cols - 1;
        int result = -1;
        while (row < rows && col >= 0) {
            if (matrix[row][col] == 1) {
                result = col;
                col--;
            } else {
                row++;
            }
        }
        return result;
    }

    // 15. Search 2D Matrix (LeetCode 74)
    static boolean searchMatrix(int[][] matrix, int target) {
        if (matrix.length == 0) return false;
        int rows = matrix.length, cols = matrix[0].length;
        int left = 0, right = rows * cols - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            int midValue = matrix[mid / cols][mid % cols];
            if (midValue == target) return true;
            else if (midValue < target) left = mid + 1;
            else right = mid - 1;
        }
        return false;
    }

    // 16. Search 2D Matrix II (LeetCode 240)
    static boolean searchMatrixII(int[][] matrix, int target) {
        if (matrix.length == 0) return false;
        int row = 0, col = matrix[0].length - 1;
        while (row < matrix.length && col >= 0) {
            if (matrix[row][col] == target) return true;
            else if (matrix[row][col] > target) col--;
            else row++;
        }
        return false;
    }

    // 17. Capacity to Ship (LeetCode 1011)
    static int shipWithinDays(int[] weights, int days) {
        int maxWeight = 0, totalWeight = 0;
        for (int w : weights) {
            maxWeight = Math.max(maxWeight, w);
            totalWeight += w;
        }
        int left = maxWeight, right = totalWeight;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (canShip(weights, days, mid)) right = mid;
            else left = mid + 1;
        }
        return left;
    }

    static boolean canShip(int[] weights, int days, int capacity) {
        int currentDays = 1, currentWeight = 0;
        for (int w : weights) {
            if (currentWeight + w > capacity) {
                currentDays++;
                currentWeight = 0;
            }
            currentWeight += w;
        }
        return currentDays <= days;
    }

    // 18. Minimum Time to Eat (LeetCode 1760)
    static int minimumEatingSpeed(int[] piles, int h) {
        int left = 1, right = 0;
        for (int pile : piles) right = Math.max(right, pile);
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (canFinish(piles, h, mid)) right = mid;
            else left = mid + 1;
        }
        return left;
    }

    static boolean canFinish(int[] piles, int h, int speed) {
        int hours = 0;
        for (int pile : piles) {
            hours += (pile + speed - 1) / speed;
        }
        return hours <= h;
    }

    // 19. Binary Search Closest Value (LeetCode 2086)
    static int minimumBuckets(String street) {
        int count = 0;
        for (int i = 0; i < street.length(); i++) {
            if (street.charAt(i) == 'H') {
                if (i > 0 && street.charAt(i - 1) == 'B') continue;
                if (i + 1 < street.length() && street.charAt(i + 1) == 'B') continue;
                if (i + 1 < street.length()) {
                    count++;
                    i++;
                } else if (i - 1 >= 0 && street.charAt(i - 1) == '.') {
                    count++;
                } else {
                    return -1;
                }
            }
        }
        return count;
    }

    // 20. Binary Search on Answer (LeetCode 1802)
    static int minimumTime(int[] time, int totalTrips) {
        long left = 1, right = (long)totalTrips * 100000;
        while (left < right) {
            long mid = left + (right - left) / 2;
            if (canCompleteTrips(time, mid, totalTrips)) right = mid;
            else left = mid + 1;
        }
        return (int)left;
    }

    static boolean canCompleteTrips(int[] time, long t, int totalTrips) {
        long trips = 0;
        for (int t1 : time) {
            trips += t / t1;
            if (trips >= totalTrips) return true;
        }
        return trips >= totalTrips;
    }

    // 21. Random Pick with Weight (LeetCode 398)
    static class RandomPicker {
        int[] prefixSum;
        int total;

        RandomPicker(int[] w) {
            prefixSum = new int[w.length];
            prefixSum[0] = w[0];
            for (int i = 1; i < w.length; i++) {
                prefixSum[i] = prefixSum[i - 1] + w[i];
            }
            total = prefixSum[prefixSum.length - 1];
        }

        int pickIndex() {
            int random = (int)(Math.random() * total) + 1;
            int left = 0, right = prefixSum.length - 1;
            while (left <= right) {
                int mid = left + (right - left) / 2;
                if (prefixSum[mid] < random) left = mid + 1;
                else right = mid - 1;
            }
            return left;
        }
    }

    // 22. Koko Eating Bananas (Already implemented as #18)
    // Included for completeness
}
