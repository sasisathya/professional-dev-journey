import java.util.*;

/**
 * Category 10: Tree Patterns
 * 20+ implementations covering traversals, searching, and tree properties
 */
public class Category10_TreePatterns {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    // 1. Inorder Traversal (LeetCode 94)
    static List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        Stack<TreeNode> stack = new Stack<>();
        TreeNode curr = root;
        while (curr != null || !stack.isEmpty()) {
            while (curr != null) {
                stack.push(curr);
                curr = curr.left;
            }
            curr = stack.pop();
            result.add(curr.val);
            curr = curr.right;
        }
        return result;
    }

    // 2. Preorder Traversal (LeetCode 144)
    static List<Integer> preorderTraversal(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        if (root == null) return result;
        Stack<TreeNode> stack = new Stack<>();
        stack.push(root);
        while (!stack.isEmpty()) {
            TreeNode node = stack.pop();
            result.add(node.val);
            if (node.right != null) stack.push(node.right);
            if (node.left != null) stack.push(node.left);
        }
        return result;
    }

    // 3. Postorder Traversal (LeetCode 145)
    static List<Integer> postorderTraversal(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        if (root == null) return result;
        Stack<TreeNode> s1 = new Stack<>();
        Stack<TreeNode> s2 = new Stack<>();
        s1.push(root);
        while (!s1.isEmpty()) {
            TreeNode node = s1.pop();
            s2.push(node);
            if (node.left != null) s1.push(node.left);
            if (node.right != null) s1.push(node.right);
        }
        while (!s2.isEmpty()) result.add(s2.pop().val);
        return result;
    }

    // 4. Level Order Traversal (LeetCode 102)
    static List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int size = queue.size();
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                level.add(node.val);
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
            result.add(level);
        }
        return result;
    }

    // 5. Maximum Depth (LeetCode 104)
    static int maxDepth(TreeNode root) {
        if (root == null) return 0;
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
    }

    // 6. Minimum Depth (LeetCode 111)
    static int minDepth(TreeNode root) {
        if (root == null) return 0;
        if (root.left == null) return 1 + minDepth(root.right);
        if (root.right == null) return 1 + minDepth(root.left);
        return 1 + Math.min(minDepth(root.left), minDepth(root.right));
    }

    // 7. Diameter of Tree (LeetCode 543)
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

    // 8. Path Sum (LeetCode 112)
    static boolean hasPathSum(TreeNode root, int targetSum) {
        if (root == null) return false;
        if (root.left == null && root.right == null) return targetSum == root.val;
        return hasPathSum(root.left, targetSum - root.val) || hasPathSum(root.right, targetSum - root.val);
    }

    // 9. Sum Root to Leaf (LeetCode 129)
    static int sumNumbers(TreeNode root) {
        return dfsSum(root, 0);
    }

    static int dfsSum(TreeNode node, int current) {
        if (node == null) return 0;
        current = current * 10 + node.val;
        if (node.left == null && node.right == null) return current;
        return dfsSum(node.left, current) + dfsSum(node.right, current);
    }

    // 10. Lowest Common Ancestor (LeetCode 236)
    static TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) return root;
        TreeNode left = lowestCommonAncestor(root.left, p, q);
        TreeNode right = lowestCommonAncestor(root.right, p, q);
        return left == null ? right : right == null ? left : root;
    }

    // 11. Symmetric Tree (LeetCode 101)
    static boolean isSymmetric(TreeNode root) {
        return isMirror(root, root);
    }

    static boolean isMirror(TreeNode t1, TreeNode t2) {
        if (t1 == null && t2 == null) return true;
        if (t1 == null || t2 == null) return false;
        return t1.val == t2.val && isMirror(t1.left, t2.right) && isMirror(t1.right, t2.left);
    }

    // 12. Invert Binary Tree (LeetCode 226)
    static TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode temp = root.left;
        root.left = invertTree(root.right);
        root.right = invertTree(temp);
        return root;
    }

    // 13. Flatten Binary Tree (LeetCode 114)
    static void flatten(TreeNode root) {
        while (root != null) {
            if (root.left != null) {
                TreeNode leftRight = root.left;
                while (leftRight.right != null) leftRight = leftRight.right;
                leftRight.right = root.right;
                root.right = root.left;
                root.left = null;
            }
            root = root.right;
        }
    }

    // 14. Right View of Tree (LeetCode 199)
    static List<Integer> rightSideView(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        if (root == null) return result;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                if (i == size - 1) result.add(node.val);
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
        }
        return result;
    }

    // 15. Vertical Order Traversal (LeetCode 314)
    static List<List<Integer>> verticalOrder(TreeNode root) {
        List<List<Integer>> result = new ArrayList<>();
        if (root == null) return result;
        Map<Integer, List<Integer>> map = new TreeMap<>();
        Queue<int[]> queue = new LinkedList<>();
        queue.offer(new int[]{root.val, 0});
        while (!queue.isEmpty()) {
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                int[] curr = queue.poll();
                map.computeIfAbsent(curr[1], k -> new ArrayList<>()).add(curr[0]);
            }
        }
        result.addAll(map.values());
        return result;
    }

    // 16. Serialize and Deserialize (LeetCode 297)
    static class Codec {
        String serialize(TreeNode root) {
            StringBuilder sb = new StringBuilder();
            serializeHelper(root, sb);
            return sb.toString();
        }

        void serializeHelper(TreeNode node, StringBuilder sb) {
            if (node == null) {
                sb.append("null,");
                return;
            }
            sb.append(node.val).append(",");
            serializeHelper(node.left, sb);
            serializeHelper(node.right, sb);
        }

        TreeNode deserialize(String data) {
            List<String> vals = new ArrayList<>(Arrays.asList(data.split(",")));
            return deserializeHelper(vals);
        }

        TreeNode deserializeHelper(List<String> vals) {
            String val = vals.remove(0);
            if (val.equals("null")) return null;
            TreeNode node = new TreeNode(Integer.parseInt(val));
            node.left = deserializeHelper(vals);
            node.right = deserializeHelper(vals);
            return node;
        }
    }

    // 17. Sum of Left Leaves (LeetCode 404)
    static int sumOfLeftLeaves(TreeNode root) {
        if (root == null) return 0;
        int sum = 0;
        if (root.left != null && root.left.left == null && root.left.right == null) {
            sum += root.left.val;
        }
        sum += sumOfLeftLeaves(root.left) + sumOfLeftLeaves(root.right);
        return sum;
    }

    // 18. Check if Complete Binary Tree (Iterative)
    static boolean isCompleteBinaryTree(TreeNode root) {
        if (root == null) return true;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        boolean flag = false;
        while (!queue.isEmpty()) {
            TreeNode node = queue.poll();
            if (node == null) {
                flag = true;
            } else {
                if (flag) return false;
                queue.offer(node.left);
                queue.offer(node.right);
            }
        }
        return true;
    }

    // 19. Balance Binary Tree Check (LeetCode 110)
    static boolean isBalanced(TreeNode root) {
        return getHeight(root) != -1;
    }

    static int getHeight(TreeNode node) {
        if (node == null) return 0;
        int left = getHeight(node.left);
        if (left == -1) return -1;
        int right = getHeight(node.right);
        if (right == -1) return -1;
        if (Math.abs(left - right) > 1) return -1;
        return Math.max(left, right) + 1;
    }

    // 20. Binary Tree Longest Consecutive Sequence (LeetCode 298)
    static int longestConsecutive(TreeNode root) {
        return dfsLongestConsec(root, null, 0);
    }

    static int dfsLongestConsec(TreeNode node, TreeNode parent, int length) {
        if (node == null) return length;
        length = (parent != null && node.val == parent.val + 1) ? length + 1 : 1;
        return Math.max(length, Math.max(dfsLongestConsec(node.left, node, length),
                                         dfsLongestConsec(node.right, node, length)));
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        System.out.println("Level Order: " + levelOrder(root));
        System.out.println("Max Depth: " + maxDepth(root));
    }
}
