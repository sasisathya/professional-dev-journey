import java.util.*;

/**
 * Category 2: Two Pointer Patterns
 * 24 implementations covering all two-pointer approaches
 */
public class Category2_TwoPointerPatterns {

    // 1. Valid Palindrome (LeetCode 125)
    static boolean validPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            char l = s.charAt(left), r = s.charAt(right);
            if (!Character.isAlphanumeric(l)) { left++; continue; }
            if (!Character.isAlphanumeric(r)) { right--; continue; }
            if (Character.toLowerCase(l) != Character.toLowerCase(r)) return false;
            left++; right--;
        }
        return true;
    }

    // 2. Two Sum II (LeetCode 167)
    static int[] twoSumII(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int sum = nums[left] + nums[right];
            if (sum == target) return new int[]{left + 1, right + 1};
            if (sum < target) left++;
            else right--;
        }
        return new int[]{-1, -1};
    }

    // 3. Reverse String (LeetCode 344)
    static void reverseString(char[] s) {
        int left = 0, right = s.length - 1;
        while (left < right) {
            char temp = s[left];
            s[left] = s[right];
            s[right] = temp;
            left++;
            right--;
        }
    }

    // 4. Reverse Vowels (LeetCode 345)
    static String reverseVowels(String s) {
        char[] chars = s.toCharArray();
        int left = 0, right = chars.length - 1;
        String vowels = "aeiouAEIOU";
        while (left < right) {
            while (left < right && vowels.indexOf(chars[left]) == -1) left++;
            while (left < right && vowels.indexOf(chars[right]) == -1) right--;
            char temp = chars[left];
            chars[left] = chars[right];
            chars[right] = temp;
            left++;
            right--;
        }
        return new String(chars);
    }

    // 5. Container with Most Water (LeetCode 11)
    static int maxArea(int[] height) {
        int left = 0, right = height.length - 1, maxArea = 0;
        while (left < right) {
            maxArea = Math.max(maxArea, Math.min(height[left], height[right]) * (right - left));
            if (height[left] < height[right]) left++;
            else right--;
        }
        return maxArea;
    }

    // 6. 3Sum (LeetCode 15)
    static List<List<Integer>> threeSum(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        Arrays.sort(nums);
        for (int i = 0; i < nums.length - 2; i++) {
            if (nums[i] > 0) break;
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int left = i + 1, right = nums.length - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == 0) {
                    result.add(Arrays.asList(nums[i], nums[left], nums[right]));
                    while (left < right && nums[left] == nums[left + 1]) left++;
                    while (left < right && nums[right] == nums[right - 1]) right--;
                    left++;
                    right--;
                } else if (sum < 0) left++;
                else right--;
            }
        }
        return result;
    }

    // 7. 3Sum Closest (LeetCode 16)
    static int threeSumClosest(int[] nums, int target) {
        Arrays.sort(nums);
        int closest = nums[0] + nums[1] + nums[2];
        for (int i = 0; i < nums.length - 2; i++) {
            int left = i + 1, right = nums.length - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum == target) return sum;
                if (Math.abs(sum - target) < Math.abs(closest - target))
                    closest = sum;
                if (sum < target) left++;
                else right--;
            }
        }
        return closest;
    }

    // 8. 4Sum (LeetCode 18)
    static List<List<Integer>> fourSum(int[] nums, int target) {
        List<List<Integer>> result = new ArrayList<>();
        Arrays.sort(nums);
        for (int i = 0; i < nums.length - 3; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            for (int j = i + 1; j < nums.length - 2; j++) {
                if (j > i + 1 && nums[j] == nums[j - 1]) continue;
                int left = j + 1, right = nums.length - 1;
                while (left < right) {
                    long sum = (long)nums[i] + nums[j] + nums[left] + nums[right];
                    if (sum == target) {
                        result.add(Arrays.asList(nums[i], nums[j], nums[left], nums[right]));
                        while (left < right && nums[left] == nums[left + 1]) left++;
                        while (left < right && nums[right] == nums[right - 1]) right--;
                        left++;
                        right--;
                    } else if (sum < target) left++;
                    else right--;
                }
            }
        }
        return result;
    }

    // 9. Remove Duplicates (LeetCode 26)
    static int removeDuplicates(int[] nums) {
        int j = 1;
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] != nums[i - 1])
                nums[j++] = nums[i];
        }
        return j;
    }

    // 10. Move Zeros (LeetCode 283)
    static void moveZeroes(int[] nums) {
        int j = 0;
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] != 0) {
                int temp = nums[j];
                nums[j] = nums[i];
                nums[i] = temp;
                j++;
            }
        }
    }

    // 11. Sort Array by Parity (LeetCode 905)
    static int[] sortArrayByParity(int[] nums) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            if (nums[left] % 2 != 0 && nums[right] % 2 == 0) {
                int temp = nums[left];
                nums[left] = nums[right];
                nums[right] = temp;
            }
            if (nums[left] % 2 == 0) left++;
            if (nums[right] % 2 != 0) right--;
        }
        return nums;
    }

    // 12. Sort Array by Parity II (LeetCode 922)
    static int[] sortArrayByParityII(int[] nums) {
        int even = 0, odd = 1;
        while (even < nums.length) {
            if (nums[even] % 2 != 0) {
                while (nums[odd] % 2 != 0) odd += 2;
                int temp = nums[even];
                nums[even] = nums[odd];
                nums[odd] = temp;
            }
            even += 2;
        }
        return nums;
    }

    // 13. Partition Array (LeetCode 2161)
    static int[] partitionArray(int[] nums, int pivot) {
        List<Integer> less = new ArrayList<>();
        List<Integer> equal = new ArrayList<>();
        List<Integer> greater = new ArrayList<>();

        for (int num : nums) {
            if (num < pivot) less.add(num);
            else if (num == pivot) equal.add(num);
            else greater.add(num);
        }

        int idx = 0;
        for (int num : less) nums[idx++] = num;
        for (int num : equal) nums[idx++] = num;
        for (int num : greater) nums[idx++] = num;
        return nums;
    }

    // 14. Shortest Distance Between Characters (LeetCode 1400)
    static int closestToZero(int[] nums) {
        Arrays.sort(nums);
        int closest = nums[0];
        for (int i = 1; i < nums.length; i++) {
            if (Math.abs(nums[i]) < Math.abs(closest)) closest = nums[i];
            else if (Math.abs(nums[i]) == Math.abs(closest) && nums[i] > closest)
                closest = nums[i];
        }
        return closest;
    }

    // 15. Merge Sorted Array (LeetCode 88)
    static void merge(int[] nums1, int m, int[] nums2, int n) {
        int p1 = m - 1, p2 = n - 1, p = m + n - 1;
        while (p1 >= 0 && p2 >= 0) {
            if (nums1[p1] > nums2[p2])
                nums1[p--] = nums1[p1--];
            else
                nums1[p--] = nums2[p2--];
        }
        while (p2 >= 0)
            nums1[p--] = nums2[p2--];
    }

    // 16. Trapping Rain Water (LeetCode 42)
    static int trap(int[] height) {
        int left = 0, right = height.length - 1, leftMax = 0, rightMax = 0, water = 0;
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

    // 17. Is Subsequence (LeetCode 392)
    static boolean isSubsequence(String s, String t) {
        int j = 0;
        for (int i = 0; i < t.length() && j < s.length(); i++) {
            if (s.charAt(j) == t.charAt(i)) j++;
        }
        return j == s.length();
    }

    // 18. Sum of Squares (LeetCode 633)
    static boolean judgeSquareSum(int c) {
        long left = 0, right = (long)Math.sqrt(c);
        while (left <= right) {
            long sum = left * left + right * right;
            if (sum == c) return true;
            else if (sum < c) left++;
            else right--;
        }
        return false;
    }

    // 19. Valid Triangle Number (LeetCode 611)
    static int triangleNumber(int[] nums) {
        Arrays.sort(nums);
        int count = 0;
        for (int i = nums.length - 1; i >= 2; i--) {
            int left = 0, right = i - 1;
            while (left < right) {
                if (nums[left] + nums[right] > nums[i]) {
                    count += right - left;
                    right--;
                } else {
                    left++;
                }
            }
        }
        return count;
    }

    // 20. Most Water Container (Variant)
    static int maxAreaVariant(int[] height) {
        int left = 0, right = height.length - 1, area = 0;
        while (left < right) {
            area = Math.max(area, (right - left) * Math.min(height[left], height[right]));
            if (height[left] < height[right]) left++;
            else right--;
        }
        return area;
    }

    // 21. Remove Duplicates II (LeetCode 80)
    static int removeDuplicatesII(int[] nums) {
        int count = 1, j = 1;
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] == nums[i - 1]) {
                count++;
                if (count <= 2) nums[j++] = nums[i];
            } else {
                nums[j++] = nums[i];
                count = 1;
            }
        }
        return j;
    }

    // 22. Reverse Only Letters (LeetCode 917)
    static String reverseOnlyLetters(String s) {
        char[] chars = s.toCharArray();
        int left = 0, right = chars.length - 1;
        while (left < right) {
            while (left < right && !Character.isLetter(chars[left])) left++;
            while (left < right && !Character.isLetter(chars[right])) right--;
            char temp = chars[left];
            chars[left] = chars[right];
            chars[right] = temp;
            left++;
            right--;
        }
        return new String(chars);
    }

    // 23. Next Permutation (LeetCode 31)
    static void nextPermutation(int[] nums) {
        int i = nums.length - 2;
        while (i >= 0 && nums[i] >= nums[i + 1]) i--;
        if (i >= 0) {
            int j = nums.length - 1;
            while (j > i && nums[j] <= nums[i]) j--;
            int temp = nums[i];
            nums[i] = nums[j];
            nums[j] = temp;
        }
        reverse(nums, i + 1, nums.length - 1);
    }

    static void reverse(int[] nums, int start, int end) {
        while (start < end) {
            int temp = nums[start];
            nums[start] = nums[end];
            nums[end] = temp;
            start++;
            end--;
        }
    }

    // 24. Rotate Array (LeetCode 189)
    static void rotate(int[] nums, int k) {
        k = k % nums.length;
        reverse(nums, 0, nums.length - 1);
        reverse(nums, 0, k - 1);
        reverse(nums, k, nums.length - 1);
    }
}
