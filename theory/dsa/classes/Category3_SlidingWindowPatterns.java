import java.util.*;

/**
 * Category 3: Sliding Window Patterns
 * 22 implementations covering fixed, variable, and specialized windows
 */
public class Category3_SlidingWindowPatterns {

    // 1. Longest Substring Without Repeating (LeetCode 3)
    static int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> map = new HashMap<>();
        int maxLen = 0, left = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c)) left = Math.max(left, map.get(c) + 1);
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }

    // 2. Minimum Window Substring (LeetCode 76)
    static String minWindow(String s, String t) {
        if (s.length() < t.length()) return "";
        Map<Character, Integer> tFreq = new HashMap<>();
        for (char c : t.toCharArray())
            tFreq.put(c, tFreq.getOrDefault(c, 0) + 1);

        int required = tFreq.size(), formed = 0;
        Map<Character, Integer> windowFreq = new HashMap<>();
        int left = 0, minLen = Integer.MAX_VALUE, minLeft = 0;

        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            windowFreq.put(c, windowFreq.getOrDefault(c, 0) + 1);
            if (tFreq.containsKey(c) && windowFreq.get(c).equals(tFreq.get(c)))
                formed++;

            while (left <= right && formed == required) {
                if (right - left + 1 < minLen) {
                    minLen = right - left + 1;
                    minLeft = left;
                }
                c = s.charAt(left);
                windowFreq.put(c, windowFreq.get(c) - 1);
                if (tFreq.containsKey(c) && windowFreq.get(c) < tFreq.get(c))
                    formed--;
                left++;
            }
        }
        return minLen == Integer.MAX_VALUE ? "" : s.substring(minLeft, minLeft + minLen);
    }

    // 3. Maximum Average Subarray (LeetCode 643)
    static double findMaxAverage(int[] nums, int k) {
        double sum = 0;
        for (int i = 0; i < k; i++) sum += nums[i];
        double maxAvg = sum / k;
        for (int i = k; i < nums.length; i++) {
            sum = sum - nums[i - k] + nums[i];
            maxAvg = Math.max(maxAvg, sum / k);
        }
        return maxAvg;
    }

    // 4. Permutation in String (LeetCode 567)
    static boolean checkInclusion(String s1, String s2) {
        if (s1.length() > s2.length()) return false;
        int[] s1Count = new int[26];
        for (char c : s1.toCharArray()) s1Count[c - 'a']++;

        int[] window = new int[26];
        for (int i = 0; i < s2.length(); i++) {
            window[s2.charAt(i) - 'a']++;
            if (i >= s1.length())
                window[s2.charAt(i - s1.length()) - 'a']--;
            if (Arrays.equals(s1Count, window)) return true;
        }
        return false;
    }

    // 5. Find All Anagrams (LeetCode 438)
    static List<Integer> findAnagrams(String s, String p) {
        List<Integer> result = new ArrayList<>();
        if (s.length() < p.length()) return result;
        int[] pCount = new int[26];
        for (char c : p.toCharArray()) pCount[c - 'a']++;

        int[] window = new int[26];
        for (int i = 0; i < s.length(); i++) {
            window[s.charAt(i) - 'a']++;
            if (i >= p.length())
                window[s.charAt(i - p.length()) - 'a']--;
            if (Arrays.equals(pCount, window)) result.add(i - p.length() + 1);
        }
        return result;
    }

    // 6. Minimum Size Subarray Sum (LeetCode 209)
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

    // 7. Sliding Window Maximum (LeetCode 239)
    static int[] maxSlidingWindow(int[] nums, int k) {
        int[] result = new int[nums.length - k + 1];
        Deque<Integer> deque = new LinkedList<>();
        for (int i = 0; i < nums.length; i++) {
            if (!deque.isEmpty() && deque.peekFirst() < i - k + 1)
                deque.pollFirst();
            while (!deque.isEmpty() && nums[deque.peekLast()] < nums[i])
                deque.pollLast();
            deque.offerLast(i);
            if (i >= k - 1) result[i - k + 1] = nums[deque.peekFirst()];
        }
        return result;
    }

    // 8. Contains Duplicate II (LeetCode 219)
    static boolean containsNearbyDuplicate(int[] nums, int k) {
        Set<Integer> window = new HashSet<>();
        for (int i = 0; i < nums.length; i++) {
            if (window.contains(nums[i])) return true;
            window.add(nums[i]);
            if (window.size() > k) window.remove(nums[i - k]);
        }
        return false;
    }

    // 9. Contains Duplicate III (LeetCode 220)
    static boolean containsNearbyAlmostDuplicate(int[] nums, int indexDiff, int valueDiff) {
        if (indexDiff <= 0 || valueDiff < 0) return false;
        Map<Long, Long> buckets = new HashMap<>();
        long bucketSize = (long)valueDiff + 1;
        for (int i = 0; i < nums.length; i++) {
            long remappedNum = (long)nums[i] - Integer.MIN_VALUE;
            long bucketId = remappedNum / bucketSize;
            if (buckets.containsKey(bucketId)) return true;
            if (buckets.containsKey(bucketId - 1) &&
                Math.abs((long)nums[i] - buckets.get(bucketId - 1)) <= valueDiff)
                return true;
            if (buckets.containsKey(bucketId + 1) &&
                Math.abs((long)nums[i] - buckets.get(bucketId + 1)) <= valueDiff)
                return true;
            buckets.put(bucketId, remappedNum);
            if (i >= indexDiff) {
                long remapped = (long)nums[i - indexDiff] - Integer.MIN_VALUE;
                buckets.remove(remapped / bucketSize);
            }
        }
        return false;
    }

    // 10. Max Consecutive Ones III (LeetCode 1004)
    static int longestOnes(int[] nums, int k) {
        int left = 0, maxLen = 0, zeros = 0;
        for (int right = 0; right < nums.length; right++) {
            if (nums[right] == 0) zeros++;
            while (zeros > k) {
                if (nums[left] == 0) zeros--;
                left++;
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }

    // 11. Longest Character Replacement (LeetCode 424)
    static int characterReplacement(String s, int k) {
        int[] count = new int[26];
        int left = 0, maxLen = 0, maxCount = 0;
        for (int right = 0; right < s.length(); right++) {
            maxCount = Math.max(maxCount, ++count[s.charAt(right) - 'A']);
            while (right - left + 1 - maxCount > k) {
                count[s.charAt(left) - 'A']--;
                left++;
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }

    // 12. Minimum Operations to Reduce X (LeetCode 1658)
    static int minOperations(int[] nums, int x) {
        int total = 0, target = 0;
        for (int num : nums) total += num;
        target = total - x;
        if (target < 0) return -1;
        if (target == 0) return nums.length;

        int maxLen = -1, left = 0, sum = 0;
        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];
            while (sum > target) sum -= nums[left++];
            if (sum == target) maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen == -1 ? -1 : nums.length - maxLen;
    }

    // 13. Subarrays with K Different Integers (LeetCode 992)
    static int subarraysWithKDistinct(int[] nums, int k) {
        return atMostKDistinct(nums, k) - atMostKDistinct(nums, k - 1);
    }

    static int atMostKDistinct(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>();
        int left = 0, result = 0;
        for (int right = 0; right < nums.length; right++) {
            count.put(nums[right], count.getOrDefault(nums[right], 0) + 1);
            while (count.size() > k) {
                count.put(nums[left], count.get(nums[left]) - 1);
                if (count.get(nums[left]) == 0) count.remove(nums[left]);
                left++;
            }
            result += right - left + 1;
        }
        return result;
    }

    // 14. Number of Substrings Containing All Three (LeetCode 1358)
    static int numberOfSubstrings(String s) {
        int[] count = new int[3];
        int left = 0, result = 0;
        for (int right = 0; right < s.length(); right++) {
            count[s.charAt(right) - 'a']++;
            while (count[0] > 0 && count[1] > 0 && count[2] > 0) {
                result += s.length() - right;
                count[s.charAt(left) - 'a']--;
                left++;
            }
        }
        return result;
    }

    // 15. Grumpy Bookstore Owner (LeetCode 1052)
    static int maxSatisfied(int[] customers, int[] grumpy, int minutes) {
        int base = 0;
        for (int i = 0; i < customers.length; i++) {
            if (grumpy[i] == 0) base += customers[i];
        }

        int maxGain = 0, currentGain = 0;
        for (int i = 0; i < minutes; i++) {
            if (grumpy[i] == 1) currentGain += customers[i];
        }
        maxGain = currentGain;

        for (int i = minutes; i < customers.length; i++) {
            if (grumpy[i] == 1) currentGain += customers[i];
            if (grumpy[i - minutes] == 1) currentGain -= customers[i - minutes];
            maxGain = Math.max(maxGain, currentGain);
        }
        return base + maxGain;
    }

    // 16. Frequency of Most Frequent Element (LeetCode 1838)
    static int maxFrequency(int[] nums, int k) {
        Arrays.sort(nums);
        int left = 0, maxFreq = 0;
        long sum = 0;
        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];
            while ((long)nums[right] * (right - left + 1) - sum > k) {
                sum -= nums[left++];
            }
            maxFreq = Math.max(maxFreq, right - left + 1);
        }
        return maxFreq;
    }

    // 17. Maximum Points You Can Obtain (LeetCode 1423)
    static int maxScore(int[] cardPoints, int k) {
        int totalSum = 0;
        for (int card : cardPoints) totalSum += card;
        int windowSize = cardPoints.length - k;
        int minWindowSum = 0, windowSum = 0;
        for (int i = 0; i < windowSize; i++) {
            windowSum += cardPoints[i];
        }
        minWindowSum = windowSum;
        for (int i = windowSize; i < cardPoints.length; i++) {
            windowSum = windowSum - cardPoints[i - windowSize] + cardPoints[i];
            minWindowSum = Math.min(minWindowSum, windowSum);
        }
        return totalSum - minWindowSum;
    }

    // 18. Minimum Recolors to Get K Consecutive (LeetCode 2379)
    static int minimumRecolors(String blocks, int k) {
        int left = 0, whiteCount = 0, minRecolors = Integer.MAX_VALUE;
        for (int right = 0; right < blocks.length(); right++) {
            if (blocks.charAt(right) == 'W') whiteCount++;
            if (right - left + 1 == k) {
                minRecolors = Math.min(minRecolors, whiteCount);
                if (blocks.charAt(left) == 'W') whiteCount--;
                left++;
            }
        }
        return minRecolors;
    }

    // 19. Continuous Subarray Sum (LeetCode 523)
    static boolean checkSubarraySum(int[] nums, int k) {
        Map<Integer, Integer> map = new HashMap<>();
        map.put(0, -1);
        int sum = 0;
        for (int i = 0; i < nums.length; i++) {
            sum += nums[i];
            sum %= k;
            if (map.containsKey(sum)) {
                if (i - map.get(sum) >= 2) return true;
            } else {
                map.put(sum, i);
            }
        }
        return false;
    }

    // 20. Equal Sum Windows (Variant)
    static int findMaxEqualWindows(int[] nums1, int[] nums2, int k) {
        int sum1 = 0, sum2 = 0;
        for (int i = 0; i < k; i++) {
            sum1 += nums1[i];
            sum2 += nums2[i];
        }
        int maxEqual = sum1 == sum2 ? 1 : 0;
        for (int i = k; i < nums1.length; i++) {
            sum1 = sum1 - nums1[i - k] + nums1[i];
            sum2 = sum2 - nums2[i - k] + nums2[i];
            if (sum1 == sum2) maxEqual++;
        }
        return maxEqual;
    }

    // 21. Longest Substring with At Most K Distinct (LeetCode 340)
    static int lengthOfLongestSubstringKDistinct(String s, int k) {
        Map<Character, Integer> map = new HashMap<>();
        int left = 0, maxLen = 0;
        for (int right = 0; right < s.length(); right++) {
            map.put(s.charAt(right), map.getOrDefault(s.charAt(right), 0) + 1);
            while (map.size() > k) {
                map.put(s.charAt(left), map.get(s.charAt(left)) - 1);
                if (map.get(s.charAt(left)) == 0) map.remove(s.charAt(left));
                left++;
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }

    // 22. Count Nice Subarrays (LeetCode 1248)
    static int countNiceSubarrays(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>();
        count.put(0, 1);
        int oddCount = 0, result = 0;
        for (int num : nums) {
            if (num % 2 == 1) oddCount++;
            result += count.getOrDefault(oddCount - k, 0);
            count.put(oddCount, count.getOrDefault(oddCount, 0) + 1);
        }
        return result;
    }
}
