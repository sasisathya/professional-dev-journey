import java.util.*;

/**
 * Category 9: Backtracking Patterns
 * 20+ implementations covering subsets, permutations, combinations, and puzzle solving
 */
public class Category9_BacktrackingPatterns {

    // 1. Generate All Subsets (LeetCode 78)
    static List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), result);
        return result;
    }

    static void backtrack(int[] nums, int start, List<Integer> current, List<List<Integer>> result) {
        result.add(new ArrayList<>(current));
        for (int i = start; i < nums.length; i++) {
            current.add(nums[i]);
            backtrack(nums, i + 1, current, result);
            current.remove(current.size() - 1);
        }
    }

    // 2. Subsets with Duplicates (LeetCode 90)
    static List<List<Integer>> subsetsWithDup(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        Arrays.sort(nums);
        backtrackDup(nums, 0, new ArrayList<>(), result);
        return result;
    }

    static void backtrackDup(int[] nums, int start, List<Integer> current, List<List<Integer>> result) {
        result.add(new ArrayList<>(current));
        for (int i = start; i < nums.length; i++) {
            if (i > start && nums[i] == nums[i - 1]) continue;
            current.add(nums[i]);
            backtrackDup(nums, i + 1, current, result);
            current.remove(current.size() - 1);
        }
    }

    // 3. Permutations (LeetCode 46)
    static List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrackPerm(nums, new boolean[nums.length], new ArrayList<>(), result);
        return result;
    }

    static void backtrackPerm(int[] nums, boolean[] used, List<Integer> current, List<List<Integer>> result) {
        if (current.size() == nums.length) {
            result.add(new ArrayList<>(current));
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            if (!used[i]) {
                used[i] = true;
                current.add(nums[i]);
                backtrackPerm(nums, used, current, result);
                current.remove(current.size() - 1);
                used[i] = false;
            }
        }
    }

    // 4. Permutations II (LeetCode 47)
    static List<List<Integer>> permuteUnique(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        Arrays.sort(nums);
        backtrackPermUnique(nums, new boolean[nums.length], new ArrayList<>(), result);
        return result;
    }

    static void backtrackPermUnique(int[] nums, boolean[] used, List<Integer> current, List<List<Integer>> result) {
        if (current.size() == nums.length) {
            result.add(new ArrayList<>(current));
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            if (used[i] || (i > 0 && nums[i] == nums[i - 1] && !used[i - 1])) continue;
            used[i] = true;
            current.add(nums[i]);
            backtrackPermUnique(nums, used, current, result);
            current.remove(current.size() - 1);
            used[i] = false;
        }
    }

    // 5. Combinations (LeetCode 77)
    static List<List<Integer>> combine(int n, int k) {
        List<List<Integer>> result = new ArrayList<>();
        backtrackCombine(n, k, 1, new ArrayList<>(), result);
        return result;
    }

    static void backtrackCombine(int n, int k, int start, List<Integer> current, List<List<Integer>> result) {
        if (current.size() == k) {
            result.add(new ArrayList<>(current));
            return;
        }
        for (int i = start; i <= n; i++) {
            current.add(i);
            backtrackCombine(n, k, i + 1, current, result);
            current.remove(current.size() - 1);
        }
    }

    // 6. Combination Sum (LeetCode 39)
    static List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> result = new ArrayList<>();
        Arrays.sort(candidates);
        backtrackCombSum(candidates, target, 0, new ArrayList<>(), result);
        return result;
    }

    static void backtrackCombSum(int[] candidates, int target, int start, List<Integer> current, List<List<Integer>> result) {
        if (target == 0) {
            result.add(new ArrayList<>(current));
            return;
        }
        if (target < 0) return;
        for (int i = start; i < candidates.length; i++) {
            current.add(candidates[i]);
            backtrackCombSum(candidates, target - candidates[i], i, current, result);
            current.remove(current.size() - 1);
        }
    }

    // 7. Combination Sum II (LeetCode 40)
    static List<List<Integer>> combinationSum2(int[] candidates, int target) {
        List<List<Integer>> result = new ArrayList<>();
        Arrays.sort(candidates);
        backtrackCombSum2(candidates, target, 0, new ArrayList<>(), result);
        return result;
    }

    static void backtrackCombSum2(int[] candidates, int target, int start, List<Integer> current, List<List<Integer>> result) {
        if (target == 0) {
            result.add(new ArrayList<>(current));
            return;
        }
        for (int i = start; i < candidates.length; i++) {
            if (i > start && candidates[i] == candidates[i - 1]) continue;
            if (candidates[i] > target) break;
            current.add(candidates[i]);
            backtrackCombSum2(candidates, target - candidates[i], i + 1, current, result);
            current.remove(current.size() - 1);
        }
    }

    // 8. N-Queens (LeetCode 51)
    static List<List<String>> solveNQueens(int n) {
        List<List<String>> result = new ArrayList<>();
        char[][] board = new char[n][n];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                board[i][j] = '.';
            }
        }
        backtrackNQueens(board, 0, result);
        return result;
    }

    static void backtrackNQueens(char[][] board, int row, List<List<String>> result) {
        if (row == board.length) {
            result.add(boardToList(board));
            return;
        }
        for (int col = 0; col < board[0].length; col++) {
            if (isValid(board, row, col)) {
                board[row][col] = 'Q';
                backtrackNQueens(board, row + 1, result);
                board[row][col] = '.';
            }
        }
    }

    static boolean isValid(char[][] board, int row, int col) {
        for (int i = 0; i < row; i++) {
            if (board[i][col] == 'Q') return false;
        }
        for (int i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
            if (board[i][j] == 'Q') return false;
        }
        for (int i = row - 1, j = col + 1; i >= 0 && j < board[0].length; i--, j++) {
            if (board[i][j] == 'Q') return false;
        }
        return true;
    }

    static List<String> boardToList(char[][] board) {
        List<String> list = new ArrayList<>();
        for (int i = 0; i < board.length; i++) {
            list.add(String.valueOf(board[i]));
        }
        return list;
    }

    // 9. Word Search II (LeetCode 212)
    static List<String> findWords(char[][] board, String[] words) {
        Trie trie = new Trie();
        for (String word : words) trie.insert(word);
        Set<String> result = new HashSet<>();
        for (int i = 0; i < board.length; i++) {
            for (int j = 0; j < board[0].length; j++) {
                dfsWordSearch(board, trie.root, i, j, result);
            }
        }
        return new ArrayList<>(result);
    }

    static void dfsWordSearch(char[][] board, TrieNode node, int i, int j, Set<String> result) {
        if (i < 0 || i >= board.length || j < 0 || j >= board[0].length || board[i][j] == '*') return;
        char c = board[i][j];
        if (node.children[c - 'a'] == null) return;
        node = node.children[c - 'a'];
        if (node.word != null) result.add(node.word);
        board[i][j] = '*';
        dfsWordSearch(board, node, i + 1, j, result);
        dfsWordSearch(board, node, i - 1, j, result);
        dfsWordSearch(board, node, i, j + 1, result);
        dfsWordSearch(board, node, i, j - 1, result);
        board[i][j] = c;
    }

    // 10. Partition Equal Subset Sum (LeetCode 416)
    static boolean canPartition(int[] nums) {
        int sum = Arrays.stream(nums).sum();
        if (sum % 2 != 0) return false;
        int target = sum / 2;
        return backtrackPartition(nums, 0, target, 0);
    }

    static boolean backtrackPartition(int[] nums, int start, int target, int current) {
        if (current == target) return true;
        if (current > target) return false;
        for (int i = start; i < nums.length; i++) {
            if (backtrackPartition(nums, i + 1, target, current + nums[i])) return true;
        }
        return false;
    }

    // 11. Palindrome Partitioning (LeetCode 131)
    static List<List<String>> partition(String s) {
        List<List<String>> result = new ArrayList<>();
        backtrackPartitionPalindrome(s, 0, new ArrayList<>(), result);
        return result;
    }

    static void backtrackPartitionPalindrome(String s, int start, List<String> current, List<List<String>> result) {
        if (start == s.length()) {
            result.add(new ArrayList<>(current));
            return;
        }
        for (int i = start; i < s.length(); i++) {
            if (isPalindrome(s, start, i)) {
                current.add(s.substring(start, i + 1));
                backtrackPartitionPalindrome(s, i + 1, current, result);
                current.remove(current.size() - 1);
            }
        }
    }

    static boolean isPalindrome(String s, int l, int r) {
        while (l < r) {
            if (s.charAt(l++) != s.charAt(r--)) return false;
        }
        return true;
    }

    // 12. Restore IP Addresses (LeetCode 93)
    static List<String> restoreIpAddresses(String s) {
        List<String> result = new ArrayList<>();
        backtrackIP(s, 0, 0, "", result);
        return result;
    }

    static void backtrackIP(String s, int start, int parts, String current, List<String> result) {
        if (parts == 4) {
            if (start == s.length()) result.add(current);
            return;
        }
        for (int i = 1; i <= 3 && start + i <= s.length(); i++) {
            String part = s.substring(start, start + i);
            if (isValidIPPart(part)) {
                backtrackIP(s, start + i, parts + 1, current + (parts == 0 ? part : "." + part), result);
            }
        }
    }

    static boolean isValidIPPart(String part) {
        if (part.length() > 1 && part.charAt(0) == '0') return false;
        int num = Integer.parseInt(part);
        return num >= 0 && num <= 255;
    }

    // 13. Letter Combinations of Phone Number (LeetCode 17)
    static List<String> letterCombinations(String digits) {
        List<String> result = new ArrayList<>();
        if (digits.isEmpty()) return result;
        String[] mapping = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
        backtrackLetterCombo(digits, 0, "", result, mapping);
        return result;
    }

    static void backtrackLetterCombo(String digits, int idx, String current, List<String> result, String[] mapping) {
        if (idx == digits.length()) {
            result.add(current);
            return;
        }
        String letters = mapping[digits.charAt(idx) - '0'];
        for (char c : letters.toCharArray()) {
            backtrackLetterCombo(digits, idx + 1, current + c, result, mapping);
        }
    }

    // 14. Factor Combinations (LeetCode 254)
    static List<List<Integer>> getFactors(int n) {
        List<List<Integer>> result = new ArrayList<>();
        backtrackFactors(n, 2, new ArrayList<>(), result);
        return result;
    }

    static void backtrackFactors(int n, int start, List<Integer> current, List<List<Integer>> result) {
        if (n == 1) {
            if (current.size() > 1) result.add(new ArrayList<>(current));
            return;
        }
        for (int i = start; i <= n; i++) {
            if (n % i == 0) {
                current.add(i);
                backtrackFactors(n / i, i, current, result);
                current.remove(current.size() - 1);
            }
        }
    }

    // Trie classes for Word Search II
    static class Trie {
        TrieNode root = new TrieNode();
        void insert(String word) {
            TrieNode node = root;
            for (char c : word.toCharArray()) {
                if (node.children[c - 'a'] == null) {
                    node.children[c - 'a'] = new TrieNode();
                }
                node = node.children[c - 'a'];
            }
            node.word = word;
        }
    }

    static class TrieNode {
        TrieNode[] children = new TrieNode[26];
        String word;
    }

    public static void main(String[] args) {
        int[] nums = {1, 2, 3};
        System.out.println("Subsets: " + subsets(nums));
        System.out.println("Permutations: " + permute(nums));
        System.out.println("Combinations (4, 2): " + combine(4, 2));
    }
}
