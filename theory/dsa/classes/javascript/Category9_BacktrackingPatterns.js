/**
 * Category 9: Backtracking Patterns
 */

function permute(nums) {
  const result = [];
  function backtrack(current) {
    if (current.length === nums.length) {
      result.push([...current]);
      return;
    }
    for (let num of nums) {
      if (!current.includes(num)) {
        current.push(num);
        backtrack(current);
        current.pop();
      }
    }
  }
  backtrack([]);
  return result;
}

function combine(n, k) {
  const result = [];
  function backtrack(start, current) {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    for (let i = start; i <= n; i++) {
      current.push(i);
      backtrack(i + 1, current);
      current.pop();
    }
  }
  backtrack(1, []);
  return result;
}

function combinationSum(candidates, target) {
  const result = [];
  function backtrack(start, current, remaining) {
    if (remaining === 0) {
      result.push([...current]);
      return;
    }
    if (remaining < 0) return;
    for (let i = start; i < candidates.length; i++) {
      current.push(candidates[i]);
      backtrack(i, current, remaining - candidates[i]);
      current.pop();
    }
  }
  backtrack(0, [], target);
  return result;
}

function solveNQueens(n) {
  const result = [];
  const board = Array(n).fill().map(() => Array(n).fill('.'));
  
  function isValid(row, col) {
    for (let i = 0; i < row; i++) {
      if (board[i][col] === 'Q') return false;
    }
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 'Q') return false;
    }
    for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
      if (board[i][j] === 'Q') return false;
    }
    return true;
  }
  
  function backtrack(row) {
    if (row === n) {
      result.push(board.map(r => r.join('')));
      return;
    }
    for (let col = 0; col < n; col++) {
      if (isValid(row, col)) {
        board[row][col] = 'Q';
        backtrack(row + 1);
        board[row][col] = '.';
      }
    }
  }
  backtrack(0);
  return result;
}

module.exports = { permute, combine, combinationSum, solveNQueens };
