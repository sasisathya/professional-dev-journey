import java.util.*;

/**
 * Category 11: Binary Search Tree Patterns
 * 20+ implementations covering BST operations and properties
 */
public class Category11_BSTPatterns {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    // 1. Validate BST (LeetCode 98)
    static boolean isValidBST(TreeNode root) {
        return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    static boolean validate(TreeNode node, long min, long max) {
        if (node == null) return true;
        if (node.val <= min || node.val >= max) return false;
        return validate(node.left, min, node.val) && validate(node.right, node.val, max);
    }

    // 2. Search in BST (LeetCode 700)
    static TreeNode searchBST(TreeNode root, int val) {
        if (root == null) return null;
        if (root.val == val) return root;
        if (val < root.val) return searchBST(root.left, val);
        return searchBST(root.right, val);
    }

    // 3. Insert into BST (LeetCode 701)
    static TreeNode insertIntoBST(TreeNode root, int val) {
        if (root == null) return new TreeNode(val);
        if (val < root.val) root.left = insertIntoBST(root.left, val);
        else root.right = insertIntoBST(root.right, val);
        return root;
    }

    // 4. Delete from BST (LeetCode 450)
    static TreeNode deleteNode(TreeNode root, int key) {
        if (root == null) return null;
        if (key < root.val) root.left = deleteNode(root.left, key);
        else if (key > root.val) root.right = deleteNode(root.right, key);
        else {
            if (root.left == null) return root.right;
            if (root.right == null) return root.left;
            TreeNode minRight = findMin(root.right);
            root.val = minRight.val;
            root.right = deleteNode(root.right, minRight.val);
        }
        return root;
    }

    static TreeNode findMin(TreeNode node) {
        while (node.left != null) node = node.left;
        return node;
    }

    // 5. Kth Smallest in BST (LeetCode 230)
    static int kthSmallest(TreeNode root, int k) {
        List<Integer> result = new ArrayList<>();
        inorder(root, result);
        return result.get(k - 1);
    }

    static void inorder(TreeNode node, List<Integer> list) {
        if (node == null) return;
        inorder(node.left, list);
        list.add(node.val);
        inorder(node.right, list);
    }

    // 6. Lowest Common Ancestor in BST (LeetCode 235)
    static TreeNode lowestCommonAncestorBST(TreeNode root, TreeNode p, TreeNode q) {
        if (p.val < root.val && q.val < root.val) return lowestCommonAncestorBST(root.left, p, q);
        if (p.val > root.val && q.val > root.val) return lowestCommonAncestorBST(root.right, p, q);
        return root;
    }

    // 7. Convert Sorted Array to BST (LeetCode 108)
    static TreeNode sortedArrayToBST(int[] nums) {
        return buildBST(nums, 0, nums.length - 1);
    }

    static TreeNode buildBST(int[] nums, int left, int right) {
        if (left > right) return null;
        int mid = left + (right - left) / 2;
        TreeNode node = new TreeNode(nums[mid]);
        node.left = buildBST(nums, left, mid - 1);
        node.right = buildBST(nums, mid + 1, right);
        return node;
    }

    // 8. Inorder Successor (LeetCode 270)
    static TreeNode inorderSuccessor(TreeNode root, TreeNode p) {
        if (p.right != null) {
            TreeNode node = p.right;
            while (node.left != null) node = node.left;
            return node;
        }
        TreeNode successor = null;
        TreeNode curr = root;
        while (curr != null) {
            if (curr.val > p.val) {
                successor = curr;
                curr = curr.left;
            } else {
                curr = curr.right;
            }
        }
        return successor;
    }

    // 9. Inorder Predecessor (LeetCode 510)
    static TreeNode inorderPredecessor(TreeNode root, TreeNode p) {
        if (p.left != null) {
            TreeNode node = p.left;
            while (node.right != null) node = node.right;
            return node;
        }
        TreeNode predecessor = null;
        TreeNode curr = root;
        while (curr != null) {
            if (curr.val < p.val) {
                predecessor = curr;
                curr = curr.right;
            } else {
                curr = curr.left;
            }
        }
        return predecessor;
    }

    // 10. Trim a Binary Search Tree (LeetCode 669)
    static TreeNode trimBST(TreeNode root, int low, int high) {
        if (root == null) return null;
        if (root.val < low) return trimBST(root.right, low, high);
        if (root.val > high) return trimBST(root.left, low, high);
        root.left = trimBST(root.left, low, high);
        root.right = trimBST(root.right, low, high);
        return root;
    }

    // 11. Range Sum BST (LeetCode 938)
    static int rangeSumBST(TreeNode root, int low, int high) {
        if (root == null) return 0;
        if (root.val < low) return rangeSumBST(root.right, low, high);
        if (root.val > high) return rangeSumBST(root.left, low, high);
        return root.val + rangeSumBST(root.left, low, high) + rangeSumBST(root.right, low, high);
    }

    // 12. Min Absolute Difference BST (LeetCode 530)
    static int getMinimumDifference(TreeNode root) {
        int[] result = {Integer.MAX_VALUE};
        int[] prev = {-1};
        inorderTraverse(root, result, prev);
        return result[0];
    }

    static void inorderTraverse(TreeNode node, int[] result, int[] prev) {
        if (node == null) return;
        inorderTraverse(node.left, result, prev);
        if (prev[0] != -1) {
            result[0] = Math.min(result[0], node.val - prev[0]);
        }
        prev[0] = node.val;
        inorderTraverse(node.right, result, prev);
    }

    // 13. Recover BST (LeetCode 99)
    static void recoverTree(TreeNode root) {
        TreeNode[] first = {null};
        TreeNode[] second = {null};
        TreeNode[] prev = {null};
        inorderFindMisplaced(root, first, second, prev);
        if (first[0] != null && second[0] != null) {
            int temp = first[0].val;
            first[0].val = second[0].val;
            second[0].val = temp;
        }
    }

    static void inorderFindMisplaced(TreeNode node, TreeNode[] first, TreeNode[] second, TreeNode[] prev) {
        if (node == null) return;
        inorderFindMisplaced(node.left, first, second, prev);
        if (prev[0] != null && prev[0].val > node.val) {
            if (first[0] == null) first[0] = prev[0];
            second[0] = node;
        }
        prev[0] = node;
        inorderFindMisplaced(node.right, first, second, prev);
    }

    // 14. Closest BST Value (LeetCode 270)
    static int closestValue(TreeNode root, double target) {
        int res = root.val;
        while (root != null) {
            res = Math.abs(root.val - target) < Math.abs(res - target) ? root.val : res;
            root = target < root.val ? root.left : root.right;
        }
        return res;
    }

    // 15. Closest BST Value II (LeetCode 272)
    static List<Integer> closestKValues(TreeNode root, double target, int k) {
        List<Integer> result = new ArrayList<>();
        Stack<Integer> inorder = new Stack<>();
        Stack<Integer> reverseInorder = new Stack<>();
        inorderHelper(root, target, false, inorder);
        inorderHelper(root, target, true, reverseInorder);
        while (k > 0) {
            if (inorder.isEmpty()) {
                result.add(reverseInorder.pop());
            } else if (reverseInorder.isEmpty()) {
                result.add(inorder.pop());
            } else if (Math.abs(inorder.peek() - target) < Math.abs(reverseInorder.peek() - target)) {
                result.add(inorder.pop());
            } else {
                result.add(reverseInorder.pop());
            }
            k--;
        }
        return result;
    }

    static void inorderHelper(TreeNode root, double target, boolean reverse, Stack<Integer> stack) {
        if (root == null) return;
        inorderHelper(reverse ? root.right : root.left, target, reverse, stack);
        if ((reverse && root.val > target) || (!reverse && root.val < target)) {
            stack.push(root.val);
        }
        inorderHelper(reverse ? root.left : root.right, target, reverse, stack);
    }

    // 16. Count Complete Tree Nodes (LeetCode 222)
    static int countNodes(TreeNode root) {
        if (root == null) return 0;
        int leftDepth = 0, rightDepth = 0;
        TreeNode left = root, right = root;
        while (left != null) {
            leftDepth++;
            left = left.left;
        }
        while (right != null) {
            rightDepth++;
            right = right.right;
        }
        if (leftDepth == rightDepth) return (1 << leftDepth) - 1;
        return 1 + countNodes(root.left) + countNodes(root.right);
    }

    // 17. All Elements in Two BSTs (LeetCode 1305)
    static List<Integer> getAllElements(TreeNode root1, TreeNode root2) {
        List<Integer> result = new ArrayList<>();
        inorderBST(root1, result);
        inorderBST(root2, result);
        Collections.sort(result);
        return result;
    }

    static void inorderBST(TreeNode root, List<Integer> list) {
        if (root == null) return;
        inorderBST(root.left, list);
        list.add(root.val);
        inorderBST(root.right, list);
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(4);
        root.left = new TreeNode(2);
        root.right = new TreeNode(6);
        root.left.left = new TreeNode(1);
        root.left.right = new TreeNode(3);
        System.out.println("Valid BST: " + isValidBST(root));
        System.out.println("Range Sum (1-5): " + rangeSumBST(root, 1, 5));
    }
}
