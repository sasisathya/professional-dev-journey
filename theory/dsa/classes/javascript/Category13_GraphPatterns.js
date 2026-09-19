/**
 * Category 13: Graph Patterns
 */
function numIslands(grid) {
  if (!grid.length) return 0;
  let count = 0;
  function dfs(i, j) {
    if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] !== '1') return;
    grid[i][j] = '0';
    dfs(i+1, j); dfs(i-1, j); dfs(i, j+1); dfs(i, j-1);
  }
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j] === '1') { dfs(i, j); count++; }
    }
  }
  return count;
}

function canFinish(numCourses, prerequisites) {
  const graph = Array(numCourses).fill().map(() => []);
  const state = Array(numCourses).fill(0);
  for (let [u, v] of prerequisites) graph[v].push(u);
  
  function hasCycle(node) {
    if (state[node] === 1) return false;
    if (state[node] === 2) return true;
    state[node] = 1;
    for (let next of graph[node]) {
      if (!hasCycle(next)) return false;
    }
    state[node] = 2;
    return true;
  }
  for (let i = 0; i < numCourses; i++) {
    if (!hasCycle(i)) return false;
  }
  return true;
}

function maxAreaOfIsland(grid) {
  let max = 0;
  function dfs(i, j) {
    if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] === 0) return 0;
    grid[i][j] = 0;
    return 1 + dfs(i+1, j) + dfs(i-1, j) + dfs(i, j+1) + dfs(i, j-1);
  }
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j] === 1) max = Math.max(max, dfs(i, j));
    }
  }
  return max;
}

module.exports = { numIslands, canFinish, maxAreaOfIsland };
