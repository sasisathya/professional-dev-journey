/**
 * Category 27: Strongly Connected Components (SCC)
 */
function kosaraju(n, edges) {
  const graph = Array(n).fill().map(() => []);
  const revGraph = Array(n).fill().map(() => []);
  
  for (let [u, v] of edges) {
    graph[u].push(v);
    revGraph[v].push(u);
  }
  
  const visited = Array(n).fill(false);
  const stack = [];
  
  function dfs1(u) {
    visited[u] = true;
    for (let v of graph[u]) {
      if (!visited[v]) dfs1(v);
    }
    stack.push(u);
  }
  
  for (let i = 0; i < n; i++) {
    if (!visited[i]) dfs1(i);
  }
  
  visited.fill(false);
  const sccId = Array(n).fill(-1);
  let sccCount = 0;
  
  function dfs2(u, id) {
    visited[u] = true;
    sccId[u] = id;
    for (let v of revGraph[u]) {
      if (!visited[v]) dfs2(v, id);
    }
  }
  
  while (stack.length) {
    const u = stack.pop();
    if (!visited[u]) {
      dfs2(u, sccCount++);
    }
  }
  
  return sccCount;
}

module.exports = { kosaraju };
