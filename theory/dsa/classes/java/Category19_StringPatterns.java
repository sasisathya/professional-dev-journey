import java.util.*;

/**
 * Category 19: String Patterns
 */
public class Category19_StringPatterns {

    // 1. Longest Substring Without Repeating (LeetCode 3)
    static int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> map = new HashMap<>();
        int maxLen = 0, left = 0;
        for (int right = 0; right < s.length(); right++) {
            if (map.containsKey(s.charAt(right))) {
                left = Math.max(left, map.get(s.charAt(right)) + 1);
            }
            map.put(s.charAt(right), right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }

    // 2. Minimum Window Substring (LeetCode 76)
    static String minWindow(String s, String t) {
        Map<Character, Integer> need = new HashMap<>();
        for (char c : t.toCharArray()) {
            need.put(c, need.getOrDefault(c, 0) + 1);
        }

        int required = need.size(), formed = 0;
        Map<Character, Integer> window = new HashMap<>();
        int[] result = {Integer.MAX_VALUE, 0, 0};

        int left = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            window.put(c, window.getOrDefault(c, 0) + 1);
            if (need.containsKey(c) && window.get(c).intValue() == need.get(c).intValue()) {
                formed++;
            }

            while (left <= right && formed == required) {
                char lc = s.charAt(left);
                if (right - left + 1 < result[0]) {
                    result[0] = right - left + 1;
                    result[1] = left;
                    result[2] = right;
                }

                window.put(lc, window.get(lc) - 1);
                if (need.containsKey(lc) && window.get(lc) < need.get(lc)) {
                    formed--;
                }
                left++;
            }
        }

        return result[0] == Integer.MAX_VALUE ? "" : s.substring(result[1], result[2] + 1);
    }

    // 3. Valid Palindrome (LeetCode 125)
    static boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            while (left < right && !Character.isAlphanumeric(s.charAt(left))) left++;
            while (left < right && !Character.isAlphanumeric(s.charAt(right))) right--;
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }

    // 4. Palindrome Partitioning (LeetCode 131)
    static List<List<String>> partition(String s) {
        List<List<String>> result = new ArrayList<>();
        backtrack(s, 0, new ArrayList<>(), result);
        return result;
    }

    static void backtrack(String s, int start, List<String> current, List<List<String>> result) {
        if (start == s.length()) {
            result.add(new ArrayList<>(current));
            return;
        }
        for (int i = start; i < s.length(); i++) {
            if (isPalin(s, start, i)) {
                current.add(s.substring(start, i + 1));
                backtrack(s, i + 1, current, result);
                current.remove(current.size() - 1);
            }
        }
    }

    static boolean isPalin(String s, int l, int r) {
        while (l < r) {
            if (s.charAt(l++) != s.charAt(r--)) return false;
        }
        return true;
    }

    // 5. Longest Palindromic Substring (LeetCode 5)
    static String longestPalindrome(String s) {
        String result = "";
        for (int i = 0; i < s.length(); i++) {
            String s1 = expandAroundCenter(s, i, i);
            String s2 = expandAroundCenter(s, i, i + 1);
            String longer = s1.length() > s2.length() ? s1 : s2;
            if (longer.length() > result.length()) result = longer;
        }
        return result;
    }

    static String expandAroundCenter(String s, int left, int right) {
        while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
            left--;
            right++;
        }
        return s.substring(left + 1, right);
    }

    // 6. Group Anagrams (LeetCode 49)
    static List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> map = new HashMap<>();
        for (String str : strs) {
            char[] chars = str.toCharArray();
            Arrays.sort(chars);
            String sorted = new String(chars);
            map.computeIfAbsent(sorted, k -> new ArrayList<>()).add(str);
        }
        return new ArrayList<>(map.values());
    }

    public static void main(String[] args) {
        System.out.println("Longest Substring: " + lengthOfLongestSubstring("abcabcbb"));
        System.out.println("Min Window: " + minWindow("ADOBECODEBANC", "ABC"));
    }
}
