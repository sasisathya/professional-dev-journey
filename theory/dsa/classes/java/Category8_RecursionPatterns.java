import java.util.*;

/**
 * Category 8: Recursion Patterns
 * 20+ implementations covering basic recursion, divide & conquer, and memoization
 */
public class Category8_RecursionPatterns {

    // 1. Fibonacci (LeetCode 509)
    static int fib(int n) {
        if (n <= 1) return n;
        return fib(n - 1) + fib(n - 2);
    }

    // 2. Fibonacci with Memoization
    static int fibMemo(int n, Map<Integer, Integer> memo) {
        if (n <= 1) return n;
        if (memo.containsKey(n)) return memo.get(n);
        memo.put(n, fibMemo(n - 1, memo) + fibMemo(n - 2, memo));
        return memo.get(n);
    }

    // 3. Power of Number (LeetCode 50)
    static double myPow(double x, int n) {
        if (n == 0) return 1.0;
        long N = n;
        if (N < 0) {
            x = 1 / x;
            N = -N;
        }
        return fastPow(x, N);
    }

    static double fastPow(double x, long n) {
        if (n == 0) return 1.0;
        double half = fastPow(x, n / 2);
        if (n % 2 == 0) return half * half;
        return half * half * x;
    }

    // 4. Search Rotated Array (LeetCode 33)
    static int search(int[] nums, int target) {
        return binarySearch(nums, 0, nums.length - 1, target);
    }

    static int binarySearch(int[] nums, int left, int right, int target) {
        if (left > right) return -1;
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;

        if (nums[left] <= nums[mid]) {
            if (target >= nums[left] && target < nums[mid]) {
                return binarySearch(nums, left, mid - 1, target);
            }
            return binarySearch(nums, mid + 1, right, target);
        }

        if (target > nums[mid] && target <= nums[right]) {
            return binarySearch(nums, mid + 1, right, target);
        }
        return binarySearch(nums, left, mid - 1, target);
    }

    // 5. Merge Sort (Divide & Conquer)
    static void mergeSort(int[] arr, int left, int right) {
        if (left >= right) return;
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }

    static void merge(int[] arr, int left, int mid, int right) {
        int[] temp = new int[right - left + 1];
        int i = left, j = mid + 1, k = 0;
        while (i <= mid && j <= right) {
            if (arr[i] <= arr[j]) temp[k++] = arr[i++];
            else temp[k++] = arr[j++];
        }
        while (i <= mid) temp[k++] = arr[i++];
        while (j <= right) temp[k++] = arr[j++];
        System.arraycopy(temp, 0, arr, left, temp.length);
    }

    // 6. Maximum Subarray (Divide & Conquer)
    static int maxSubArray(int[] nums) {
        return maxSubArrayHelper(nums, 0, nums.length - 1);
    }

    static int maxSubArrayHelper(int[] nums, int left, int right) {
        if (left == right) return nums[left];
        int mid = left + (right - left) / 2;
        int leftMax = maxSubArrayHelper(nums, left, mid);
        int rightMax = maxSubArrayHelper(nums, mid + 1, right);
        int crossMax = maxCrossingSum(nums, left, mid, right);
        return Math.max(leftMax, Math.max(rightMax, crossMax));
    }

    static int maxCrossingSum(int[] nums, int left, int mid, int right) {
        int leftSum = Integer.MIN_VALUE, sum = 0;
        for (int i = mid; i >= left; i--) {
            sum += nums[i];
            leftSum = Math.max(leftSum, sum);
        }
        int rightSum = Integer.MIN_VALUE;
        sum = 0;
        for (int i = mid + 1; i <= right; i++) {
            sum += nums[i];
            rightSum = Math.max(rightSum, sum);
        }
        return leftSum + rightSum;
    }

    // 7. Majority Element (Divide & Conquer)
    static int findMajority(int[] nums) {
        return findMajorityHelper(nums, 0, nums.length - 1);
    }

    static int findMajorityHelper(int[] nums, int left, int right) {
        if (left == right) return nums[left];
        int mid = left + (right - left) / 2;
        int leftMaj = findMajorityHelper(nums, left, mid);
        int rightMaj = findMajorityHelper(nums, mid + 1, right);
        return countInRange(nums, left, right, leftMaj) > (right - left + 1) / 2 ? leftMaj : rightMaj;
    }

    static int countInRange(int[] nums, int left, int right, int num) {
        int count = 0;
        for (int i = left; i <= right; i++) {
            if (nums[i] == num) count++;
        }
        return count;
    }

    // 8. Generate Permutations (LeetCode 46)
    static List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, new ArrayList<>(), result);
        return result;
    }

    static void backtrack(int[] nums, List<Integer> current, List<List<Integer>> result) {
        if (current.size() == nums.length) {
            result.add(new ArrayList<>(current));
            return;
        }
        for (int num : nums) {
            if (!current.contains(num)) {
                current.add(num);
                backtrack(nums, current, result);
                current.remove(current.size() - 1);
            }
        }
    }

    // 9. Generate Subsets (LeetCode 78)
    static List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrackSubsets(nums, 0, new ArrayList<>(), result);
        return result;
    }

    static void backtrackSubsets(int[] nums, int start, List<Integer> current, List<List<Integer>> result) {
        result.add(new ArrayList<>(current));
        for (int i = start; i < nums.length; i++) {
            current.add(nums[i]);
            backtrackSubsets(nums, i + 1, current, result);
            current.remove(current.size() - 1);
        }
    }

    // 10. Tree Maximum Path Sum (LeetCode 124)
    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static int maxPathSum(TreeNode root) {
        int[] result = {Integer.MIN_VALUE};
        maxPathHelper(root, result);
        return result[0];
    }

    static int maxPathHelper(TreeNode node, int[] result) {
        if (node == null) return 0;
        int left = Math.max(0, maxPathHelper(node.left, result));
        int right = Math.max(0, maxPathHelper(node.right, result));
        result[0] = Math.max(result[0], left + right + node.val);
        return Math.max(left, right) + node.val;
    }

    // 11. Lowest Common Ancestor (LeetCode 236)
    static TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) return root;
        TreeNode left = lowestCommonAncestor(root.left, p, q);
        TreeNode right = lowestCommonAncestor(root.right, p, q);
        return left == null ? right : right == null ? left : root;
    }

    // 12. Invert Binary Tree (LeetCode 226)
    static TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode temp = root.left;
        root.left = invertTree(root.right);
        root.right = invertTree(temp);
        return root;
    }

    // 13. Tree Diameter (LeetCode 543)
    static int diameterOfBinaryTree(TreeNode root) {
        int[] diameter = {0};
        height(root, diameter);
        return diameter[0];
    }

    static int height(TreeNode node, int[] diameter) {
        if (node == null) return 0;
        int left = height(node.left, diameter);
        int right = height(node.right, diameter);
        diameter[0] = Math.max(diameter[0], left + right);
        return Math.max(left, right) + 1;
    }

    // 14. House Robber III (LeetCode 337)
    static int rob(TreeNode root) {
        int[] result = robHelper(root);
        return Math.max(result[0], result[1]);
    }

    static int[] robHelper(TreeNode node) {
        if (node == null) return new int[]{0, 0};
        int[] left = robHelper(node.left);
        int[] right = robHelper(node.right);
        int robCur = node.val + left[1] + right[1];
        int notRobCur = Math.max(left[0], left[1]) + Math.max(right[0], right[1]);
        return new int[]{robCur, notRobCur};
    }

    // 15. Nested List Weight Sum (LeetCode 364)
    static int depthSum(List<NestedInteger> nestedList) {
        return depthSumHelper(nestedList, 1);
    }

    static int depthSumHelper(List<NestedInteger> nestedList, int depth) {
        int sum = 0;
        for (NestedInteger num : nestedList) {
            if (num.isInteger()) sum += num.getInteger() * depth;
            else sum += depthSumHelper(num.getList(), depth + 1);
        }
        return sum;
    }

    interface NestedInteger {
        boolean isInteger();
        Integer getInteger();
        List<NestedInteger> getList();
    }

    // 16. Number of Matching Subsequences (Recursive)
    static int numMatchingSubseq(String s, String[] words) {
        int count = 0;
        for (String word : words) {
            if (isSubsequence(word, s)) count++;
        }
        return count;
    }

    static boolean isSubsequence(String s, String t) {
        return isSubsequenceHelper(s, t, 0, 0);
    }

    static boolean isSubsequenceHelper(String s, String t, int i, int j) {
        if (i == s.length()) return true;
        if (j == t.length()) return false;
        if (s.charAt(i) == t.charAt(j)) return isSubsequenceHelper(s, t, i + 1, j + 1);
        return isSubsequenceHelper(s, t, i, j + 1);
    }

    // 17. Unique Binary Search Trees (LeetCode 96)
    static int numTrees(int n) {
        return numTreesHelper(n, new HashMap<>());
    }

    static int numTreesHelper(int n, Map<Integer, Integer> memo) {
        if (n <= 1) return 1;
        if (memo.containsKey(n)) return memo.get(n);
        int result = 0;
        for (int i = 1; i <= n; i++) {
            result += numTreesHelper(i - 1, memo) * numTreesHelper(n - i, memo);
        }
        memo.put(n, result);
        return result;
    }

    // 18. Interleaving Strings (LeetCode 97)
    static boolean isInterleave(String s1, String s2, String s3) {
        if (s1.length() + s2.length() != s3.length()) return false;
        return isInterleaveHelper(s1, s2, s3, 0, 0, 0, new HashMap<>());
    }

    static boolean isInterleaveHelper(String s1, String s2, String s3, int i, int j, int k, Map<String, Boolean> memo) {
        if (i == s1.length() && j == s2.length() && k == s3.length()) return true;
        String key = i + "," + j + "," + k;
        if (memo.containsKey(key)) return memo.get(key);

        boolean result = false;
        if (i < s1.length() && s1.charAt(i) == s3.charAt(k)) {
            result = isInterleaveHelper(s1, s2, s3, i + 1, j, k + 1, memo);
        }
        if (!result && j < s2.length() && s2.charAt(j) == s3.charAt(k)) {
            result = isInterleaveHelper(s1, s2, s3, i, j + 1, k + 1, memo);
        }
        memo.put(key, result);
        return result;
    }

    // 19. Word Search (LeetCode 79)
    static boolean exist(char[][] board, String word) {
        for (int i = 0; i < board.length; i++) {
            for (int j = 0; j < board[0].length; j++) {
                if (dfsWordSearch(board, word, 0, i, j)) return true;
            }
        }
        return false;
    }

    static boolean dfsWordSearch(char[][] board, String word, int idx, int i, int j) {
        if (idx == word.length()) return true;
        if (i < 0 || i >= board.length || j < 0 || j >= board[0].length || board[i][j] != word.charAt(idx)) {
            return false;
        }
        char temp = board[i][j];
        board[i][j] = '*';
        boolean found = dfsWordSearch(board, word, idx + 1, i + 1, j) ||
                       dfsWordSearch(board, word, idx + 1, i - 1, j) ||
                       dfsWordSearch(board, word, idx + 1, i, j + 1) ||
                       dfsWordSearch(board, word, idx + 1, i, j - 1);
        board[i][j] = temp;
        return found;
    }

    // 20. Number of Islands (LeetCode 200)
    static int numIslands(char[][] grid) {
        int count = 0;
        for (int i = 0; i < grid.length; i++) {
            for (int j = 0; j < grid[0].length; j++) {
                if (grid[i][j] == '1') {
                    dfsIsland(grid, i, j);
                    count++;
                }
            }
        }
        return count;
    }

    static void dfsIsland(char[][] grid, int i, int j) {
        if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] != '1') return;
        grid[i][j] = '0';
        dfsIsland(grid, i + 1, j);
        dfsIsland(grid, i - 1, j);
        dfsIsland(grid, i, j + 1);
        dfsIsland(grid, i, j - 1);
    }

    public static void main(String[] args) {
        System.out.println("Fib(10): " + fib(10));
        System.out.println("Fib Memo(10): " + fibMemo(10, new HashMap<>()));
        System.out.println("Power(2, 10): " + myPow(2, 10));
    }
}
