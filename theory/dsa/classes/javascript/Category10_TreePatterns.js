/**
 * Category 10: Tree Patterns
 */

function inorderTraversal(root) {
  const result = [];
  const stack = [];
  let current = root;
  
  while (current || stack.length) {
    while (current) {
      stack.push(current);
      current = current.left;
    }
    current = stack.pop();
    result.push(current.val);
    current = current.right;
  }
  return result;
}

function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  
  while (queue.length) {
    const level = [];
    const size = queue.length;
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}

function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

function isBalanced(root) {
  function getHeight(node) {
    if (!node) return 0;
    const left = getHeight(node.left);
    if (left === -1) return -1;
    const right = getHeight(node.right);
    if (right === -1) return -1;
    if (Math.abs(left - right) > 1) return -1;
    return Math.max(left, right) + 1;
  }
  return getHeight(root) !== -1;
}

function isSymmetric(root) {
  function isMirror(t1, t2) {
    if (!t1 && !t2) return true;
    if (!t1 || !t2) return false;
    return t1.val === t2.val && isMirror(t1.left, t2.right) && isMirror(t1.right, t2.left);
  }
  return isMirror(root, root);
}

module.exports = { inorderTraversal, levelOrder, maxDepth, isBalanced, isSymmetric };
