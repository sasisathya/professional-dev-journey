/**
 * Category 11: Binary Search Tree Patterns
 * JavaScript implementation
 */

class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function isValidBST(root) {
  function validate(node, min = -Infinity, max = Infinity) {
    if (!node) return true;
    if (node.val <= min || node.val >= max) return false;
    return validate(node.left, min, node.val) && validate(node.right, node.val, max);
  }
  return validate(root);
}

function searchBST(root, val) {
  if (!root) return null;
  if (root.val === val) return root;
  if (val < root.val) return searchBST(root.left, val);
  return searchBST(root.right, val);
}

function insertIntoBST(root, val) {
  if (!root) return new TreeNode(val);
  if (val < root.val) root.left = insertIntoBST(root.left, val);
  else root.right = insertIntoBST(root.right, val);
  return root;
}

function deleteNode(root, key) {
  if (!root) return null;
  if (key < root.val) root.left = deleteNode(root.left, key);
  else if (key > root.val) root.right = deleteNode(root.right, key);
  else {
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    let minRight = root.right;
    while (minRight.left) minRight = minRight.left;
    root.val = minRight.val;
    root.right = deleteNode(root.right, minRight.val);
  }
  return root;
}

function kthSmallest(root, k) {
  const result = [];
  function inorder(node) {
    if (!node) return;
    inorder(node.left);
    result.push(node.val);
    inorder(node.right);
  }
  inorder(root);
  return result[k - 1];
}

function lowestCommonAncestorBST(root, p, q) {
  if (!root) return null;
  if (p.val < root.val && q.val < root.val) return lowestCommonAncestorBST(root.left, p, q);
  if (p.val > root.val && q.val > root.val) return lowestCommonAncestorBST(root.right, p, q);
  return root;
}

function sortedArrayToBST(nums) {
  function buildBST(left, right) {
    if (left > right) return null;
    const mid = Math.floor((left + right) / 2);
    const node = new TreeNode(nums[mid]);
    node.left = buildBST(left, mid - 1);
    node.right = buildBST(mid + 1, right);
    return node;
  }
  return buildBST(0, nums.length - 1);
}

function rangeSumBST(root, low, high) {
  if (!root) return 0;
  if (root.val < low) return rangeSumBST(root.right, low, high);
  if (root.val > high) return rangeSumBST(root.left, low, high);
  return root.val + rangeSumBST(root.left, low, high) + rangeSumBST(root.right, low, high);
}

module.exports = {
  TreeNode,
  isValidBST,
  searchBST,
  insertIntoBST,
  deleteNode,
  kthSmallest,
  lowestCommonAncestorBST,
  sortedArrayToBST,
  rangeSumBST,
};
