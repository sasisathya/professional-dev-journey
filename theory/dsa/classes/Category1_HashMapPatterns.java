import java.util.*;

/**
 * Category 1.1: HashMap/HashSet Patterns
 * 20+ implementations for hash-based problem solving
 * Time: O(1) avg | Space: O(n)
 */
public class Category1_HashMapPatterns {

    // 1. Two Sum (LeetCode 1)
    static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{-1, -1};
    }

    // 2. Contains Duplicate (LeetCode 217)
    static boolean containsDuplicate(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int num : nums) {
            if (!set.add(num)) return true;
        }
        return false;
    }

    // 3. Valid Anagram (LeetCode 242)
    static boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        Map<Character, Integer> map = new HashMap<>();
        for (char c : s.toCharArray())
            map.put(c, map.getOrDefault(c, 0) + 1);
        for (char c : t.toCharArray()) {
            if (!map.containsKey(c)) return false;
            map.put(c, map.get(c) - 1);
            if (map.get(c) == 0) map.remove(c);
        }
        return map.isEmpty();
    }

    // 4. Happy Number (LeetCode 202)
    static boolean isHappy(int n) {
        Set<Integer> seen = new HashSet<>();
        while (n != 1 && !seen.contains(n)) {
            seen.add(n);
            n = sumOfSquares(n);
        }
        return n == 1;
    }

    static int sumOfSquares(int n) {
        int sum = 0;
        while (n > 0) {
            int digit = n % 10;
            sum += digit * digit;
            n /= 10;
        }
        return sum;
    }

    // 5. Isomorphic Strings (LeetCode 205)
    static boolean isIsomorphic(String s, String t) {
        if (s.length() != t.length()) return false;
        Map<Character, Character> sToT = new HashMap<>();
        Map<Character, Character> tToS = new HashMap<>();
        for (int i = 0; i < s.length(); i++) {
            char sc = s.charAt(i), tc = t.charAt(i);
            if (sToT.containsKey(sc)) {
                if (sToT.get(sc) != tc) return false;
            } else {
                sToT.put(sc, tc);
            }
            if (tToS.containsKey(tc)) {
                if (tToS.get(tc) != sc) return false;
            } else {
                tToS.put(tc, sc);
            }
        }
        return true;
    }

    // 6. Word Pattern (LeetCode 290)
    static boolean wordPattern(String pattern, String s) {
        String[] words = s.split(" ");
        if (pattern.length() != words.length) return false;
        Map<Character, String> charToWord = new HashMap<>();
        Set<String> usedWords = new HashSet<>();
        for (int i = 0; i < pattern.length(); i++) {
            char c = pattern.charAt(i);
            String word = words[i];
            if (charToWord.containsKey(c)) {
                if (!charToWord.get(c).equals(word)) return false;
            } else {
                if (usedWords.contains(word)) return false;
                charToWord.put(c, word);
                usedWords.add(word);
            }
        }
        return true;
    }

    // 7. Group Anagrams (LeetCode 49)
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

    // 8. Majority Element (LeetCode 169)
    static int majorityElement(int[] nums) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int num : nums) {
            map.put(num, map.getOrDefault(num, 0) + 1);
            if (map.get(num) > nums.length / 2) return num;
        }
        return -1;
    }

    // 9. Top K Frequent Elements (LeetCode 347)
    static int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> freq = new HashMap<>();
        for (int num : nums)
            freq.put(num, freq.getOrDefault(num, 0) + 1);

        PriorityQueue<Integer> minHeap = new PriorityQueue<>(
            (a, b) -> freq.get(a) - freq.get(b)
        );

        for (int num : freq.keySet()) {
            minHeap.offer(num);
            if (minHeap.size() > k) minHeap.poll();
        }

        int[] result = new int[k];
        int i = 0;
        while (!minHeap.isEmpty()) {
            result[i++] = minHeap.poll();
        }
        return result;
    }

    // 10. Minimum Index Sum (LeetCode 599)
    static String[] findRestaurant(String[] list1, String[] list2) {
        Map<String, Integer> map = new HashMap<>();
        for (int i = 0; i < list1.length; i++)
            map.put(list1[i], i);

        int minSum = Integer.MAX_VALUE;
        List<String> result = new ArrayList<>();

        for (int i = 0; i < list2.length; i++) {
            if (map.containsKey(list2[i])) {
                int sum = i + map.get(list2[i]);
                if (sum < minSum) {
                    minSum = sum;
                    result.clear();
                    result.add(list2[i]);
                } else if (sum == minSum) {
                    result.add(list2[i]);
                }
            }
        }
        return result.toArray(new String[0]);
    }

    // 11. Degree of Array (LeetCode 697)
    static int findShortestSubArray(int[] nums) {
        Map<Integer, Integer> count = new HashMap<>();
        Map<Integer, Integer> first = new HashMap<>();
        Map<Integer, Integer> last = new HashMap<>();

        for (int i = 0; i < nums.length; i++) {
            count.put(nums[i], count.getOrDefault(nums[i], 0) + 1);
            if (!first.containsKey(nums[i])) first.put(nums[i], i);
            last.put(nums[i], i);
        }

        int degree = Collections.max(count.values());
        int minLen = Integer.MAX_VALUE;

        for (int num : count.keySet()) {
            if (count.get(num) == degree) {
                minLen = Math.min(minLen, last.get(num) - first.get(num) + 1);
            }
        }
        return minLen;
    }

    // 12. LRU Cache (LeetCode 146)
    static class LRUCache {
        class Node {
            int key, val;
            Node prev, next;
            Node(int key, int val) { this.key = key; this.val = val; }
        }

        int capacity;
        Map<Integer, Node> map = new HashMap<>();
        Node head = new Node(0, 0), tail = new Node(0, 0);

        LRUCache(int capacity) {
            this.capacity = capacity;
            head.next = tail;
            tail.prev = head;
        }

        public int get(int key) {
            if (!map.containsKey(key)) return -1;
            Node node = map.get(key);
            remove(node);
            add(node);
            return node.val;
        }

        public void put(int key, int value) {
            if (map.containsKey(key)) remove(map.get(key));
            Node node = new Node(key, value);
            add(node);
            map.put(key, node);
            if (map.size() > capacity) {
                map.remove(head.next.key);
                remove(head.next);
            }
        }

        void remove(Node node) {
            node.prev.next = node.next;
            node.next.prev = node.prev;
        }

        void add(Node node) {
            tail.prev.next = node;
            node.prev = tail.prev;
            node.next = tail;
            tail.prev = node;
        }
    }

    // 13. Ransom Note (LeetCode 383)
    static boolean canConstruct(String ransomNote, String magazine) {
        Map<Character, Integer> map = new HashMap<>();
        for (char c : magazine.toCharArray())
            map.put(c, map.getOrDefault(c, 0) + 1);
        for (char c : ransomNote.toCharArray()) {
            if (!map.containsKey(c) || map.get(c) == 0) return false;
            map.put(c, map.get(c) - 1);
        }
        return true;
    }

    // 14. Intersection of Two Arrays (LeetCode 349)
    static int[] intersection(int[] nums1, int[] nums2) {
        Set<Integer> set1 = new HashSet<>();
        Set<Integer> result = new HashSet<>();
        for (int num : nums1) set1.add(num);
        for (int num : nums2)
            if (set1.contains(num)) result.add(num);
        int[] arr = new int[result.size()];
        int i = 0;
        for (int num : result) arr[i++] = num;
        return arr;
    }

    // 15. Intersection II (LeetCode 350)
    static int[] intersect(int[] nums1, int[] nums2) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int num : nums1)
            map.put(num, map.getOrDefault(num, 0) + 1);
        List<Integer> result = new ArrayList<>();
        for (int num : nums2) {
            if (map.containsKey(num) && map.get(num) > 0) {
                result.add(num);
                map.put(num, map.get(num) - 1);
            }
        }
        int[] arr = new int[result.size()];
        for (int i = 0; i < result.size(); i++) arr[i] = result.get(i);
        return arr;
    }

    // 16. First Unique Character (LeetCode 387)
    static int firstUniqChar(String s) {
        Map<Character, Integer> map = new HashMap<>();
        for (char c : s.toCharArray())
            map.put(c, map.getOrDefault(c, 0) + 1);
        for (int i = 0; i < s.length(); i++)
            if (map.get(s.charAt(i)) == 1) return i;
        return -1;
    }

    // 17. Valid Sudoku (LeetCode 36)
    static boolean isValidSudoku(char[][] board) {
        Set<String> seen = new HashSet<>();
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                char c = board[i][j];
                if (c == '.') continue;
                String row = c + "row" + i;
                String col = c + "col" + j;
                String box = c + "box" + (i/3) + (j/3);
                if (!seen.add(row) || !seen.add(col) || !seen.add(box))
                    return false;
            }
        }
        return true;
    }

    // 18. Palindrome Pairs (LeetCode 336)
    static List<List<Integer>> palindromePairs(String[] words) {
        Map<String, Integer> map = new HashMap<>();
        for (int i = 0; i < words.length; i++)
            map.put(words[i], i);

        List<List<Integer>> result = new ArrayList<>();
        for (int i = 0; i < words.length; i++) {
            String word = words[i];
            for (int j = 0; j <= word.length(); j++) {
                String left = word.substring(0, j);
                String right = word.substring(j);
                if (isPalindrome(left) && map.containsKey(reverseString(right))) {
                    int k = map.get(reverseString(right));
                    if (k != i) result.add(Arrays.asList(i, k));
                }
            }
        }
        return result;
    }

    static boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            if (s.charAt(left++) != s.charAt(right--)) return false;
        }
        return true;
    }

    static String reverseString(String s) {
        return new StringBuilder(s).reverse().toString();
    }

    // 19. Unique Email Addresses (LeetCode 929)
    static int numUniqueEmails(String[] emails) {
        Set<String> uniqueEmails = new HashSet<>();
        for (String email : emails) {
            String[] parts = email.split("@");
            String local = parts[0].split("\\+")[0].replace(".", "");
            uniqueEmails.add(local + "@" + parts[1]);
        }
        return uniqueEmails.size();
    }

    // 20. Design HashMap (LeetCode 706)
    static class MyHashMap {
        int[] data = new int[1000001];
        public MyHashMap() { Arrays.fill(data, -1); }
        public void put(int key, int value) { data[key] = value; }
        public int get(int key) { return data[key]; }
        public void remove(int key) { data[key] = -1; }
    }

    // 21. Two Sum IV (LeetCode 653)
    static boolean findTarget(TreeNode root, int k) {
        Set<Integer> seen = new HashSet<>();
        return dfs(root, k, seen);
    }

    static boolean dfs(TreeNode node, int k, Set<Integer> seen) {
        if (node == null) return false;
        if (seen.contains(k - node.val)) return true;
        seen.add(node.val);
        return dfs(node.left, k, seen) || dfs(node.right, k, seen);
    }

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    // 22. Majority Element II (LeetCode 229)
    static List<Integer> majorityElementII(int[] nums) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int num : nums)
            map.put(num, map.getOrDefault(num, 0) + 1);

        List<Integer> result = new ArrayList<>();
        int threshold = nums.length / 3;
        for (int num : map.keySet())
            if (map.get(num) > threshold) result.add(num);
        return result;
    }

    // 23. Find the Celebrity (LeetCode 277)
    static int findCelebrity(int n, int[][] knows) {
        int candidate = 0;
        for (int i = 1; i < n; i++) {
            if (knows[candidate][i] == 1) candidate = i;
        }
        for (int i = 0; i < n; i++) {
            if (i != candidate && (knows[candidate][i] == 1 || knows[i][candidate] == 0))
                return -1;
        }
        return candidate;
    }

    // 24. Design Twitter (LeetCode 355)
    static class Twitter {
        Map<Integer, Set<Integer>> following = new HashMap<>();
        Map<Integer, List<int[]>> tweets = new HashMap<>();
        int timestamp = 0;

        public void postTweet(int userId, int tweetId) {
            tweets.computeIfAbsent(userId, k -> new ArrayList<>())
                  .add(new int[]{tweetId, timestamp++});
        }

        public List<Integer> getNewsFeed(int userId) {
            Set<Integer> users = following.getOrDefault(userId, new HashSet<>());
            users.add(userId);
            PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> b[1] - a[1]);
            for (int user : users) {
                List<int[]> userTweets = tweets.getOrDefault(user, new ArrayList<>());
                if (!userTweets.isEmpty()) {
                    heap.offer(new int[]{userTweets.get(userTweets.size() - 1)[0],
                                        userTweets.get(userTweets.size() - 1)[1], user, userTweets.size() - 1});
                }
            }
            List<Integer> result = new ArrayList<>();
            while (!heap.isEmpty() && result.size() < 10) {
                int[] curr = heap.poll();
                result.add(curr[0]);
                if (curr[3] > 0) {
                    List<int[]> userTweets = tweets.get(curr[2]);
                    heap.offer(new int[]{userTweets.get(curr[3] - 1)[0],
                                        userTweets.get(curr[3] - 1)[1], curr[2], curr[3] - 1});
                }
            }
            return result;
        }

        public void follow(int followerId, int followeeId) {
            following.computeIfAbsent(followerId, k -> new HashSet<>()).add(followeeId);
        }

        public void unfollow(int followerId, int followeeId) {
            following.getOrDefault(followerId, new HashSet<>()).remove(followeeId);
        }
    }
}
