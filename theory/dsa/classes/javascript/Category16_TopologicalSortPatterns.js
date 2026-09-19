/**
 * Category 16: Topological Sort Patterns
 * JavaScript implementation - DFS, Kahn's algorithm, course scheduling
 */

// 1. Course Schedule (LeetCode 207)
function canFinish(numCourses, prerequisites) {
  const graph = Array(numCourses).fill().map(() => []);
  const inDegree = Array(numCourses).fill(0);

  for (let [course, prereq] of prerequisites) {
    graph[prereq].push(course);
    inDegree[course]++;
  }

  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  let count = 0;
  while (queue.length) {
    const course = queue.shift();
    count++;

    for (let next of graph[course]) {
      inDegree[next]--;
      if (inDegree[next] === 0) queue.push(next);
    }
  }

  return count === numCourses;
}

// 2. Course Schedule II (LeetCode 210)
function findOrder(numCourses, prerequisites) {
  const graph = Array(numCourses).fill().map(() => []);
  const inDegree = Array(numCourses).fill(0);

  for (let [course, prereq] of prerequisites) {
    graph[prereq].push(course);
    inDegree[course]++;
  }

  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  const result = [];
  while (queue.length) {
    const course = queue.shift();
    result.push(course);

    for (let next of graph[course]) {
      inDegree[next]--;
      if (inDegree[next] === 0) queue.push(next);
    }
  }

  return result.length === numCourses ? result : [];
}

// 3. Alien Dictionary (LeetCode 269)
function alienOrder(words) {
  const graph = new Map();
  const inDegree = new Map();

  for (let word of words) {
    for (let char of word) {
      if (!graph.has(char)) {
        graph.set(char, []);
        inDegree.set(char, 0);
      }
    }
  }

  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i], w2 = words[i + 1];
    const minLen = Math.min(w1.length, w2.length);

    if (w1.length > w2.length && w1.substring(0, minLen) === w2.substring(0, minLen)) {
      return "";
    }

    for (let j = 0; j < minLen; j++) {
      if (w1[j] !== w2[j]) {
        if (!graph.get(w1[j]).includes(w2[j])) {
          graph.get(w1[j]).push(w2[j]);
          inDegree.set(w2[j], inDegree.get(w2[j]) + 1);
        }
        break;
      }
    }
  }

  const queue = [];
  for (let [char, degree] of inDegree) {
    if (degree === 0) queue.push(char);
  }

  const result = [];
  while (queue.length) {
    const char = queue.shift();
    result.push(char);

    for (let neighbor of graph.get(char)) {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  return result.length === inDegree.size ? result.join('') : "";
}

// 4. Topological Sort (DFS approach)
function topologicalSortDFS(n, edges) {
  const graph = Array(n).fill().map(() => []);
  const visited = Array(n).fill(0);
  const stack = [];

  for (let [u, v] of edges) {
    graph[u].push(v);
  }

  const dfs = (node) => {
    visited[node] = 1;
    for (let neighbor of graph[node]) {
      if (visited[neighbor] === 0) {
        dfs(neighbor);
      }
    }
    stack.push(node);
  };

  for (let i = 0; i < n; i++) {
    if (visited[i] === 0) {
      dfs(i);
    }
  }

  return stack.reverse();
}

// 5. Sequence Reconstruction (LeetCode 444)
function sequenceReconstruction(org, seqs) {
  const n = org.length;
  const graph = Array(n).fill().map(() => []);
  const inDegree = Array(n).fill(0);
  const position = new Map();

  org.forEach((num, i) => {
    position.set(num, i);
  });

  for (let seq of seqs) {
    for (let i = 0; i < seq.length; i++) {
      if (!position.has(seq[i])) return false;

      if (i > 0) {
        const u = position.get(seq[i - 1]);
        const v = position.get(seq[i]);
        if (u > v) return false;
      }
    }
  }

  for (let seq of seqs) {
    for (let i = 1; i < seq.length; i++) {
      const u = position.get(seq[i - 1]);
      const v = position.get(seq[i]);
      if (!graph[u].includes(v)) {
        graph[u].push(v);
        inDegree[v]++;
      }
    }
  }

  const queue = [];
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  const result = [];
  while (queue.length) {
    if (queue.length > 1) return false;
    const node = queue.shift();
    result.push(org[node]);

    for (let neighbor of graph[node]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  return result.length === n;
}

// 6. Build a Matrix With Conditions (LeetCode 2392)
function buildMatrix(k, rowConditions, colConditions) {
  const topoSort = (conditions) => {
    const graph = Array(k + 1).fill().map(() => []);
    const inDegree = Array(k + 1).fill(0);

    for (let [u, v] of conditions) {
      graph[u].push(v);
      inDegree[v]++;
    }

    const queue = [];
    for (let i = 1; i <= k; i++) {
      if (inDegree[i] === 0) queue.push(i);
    }

    const order = [];
    while (queue.length) {
      const node = queue.shift();
      order.push(node);

      for (let neighbor of graph[node]) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) queue.push(neighbor);
      }
    }

    return order.length === k ? order : null;
  };

  const rowOrder = topoSort(rowConditions);
  const colOrder = topoSort(colConditions);

  if (!rowOrder || !colOrder) return [];

  const matrix = Array(k).fill().map(() => Array(k).fill(0));
  const rowPos = new Map();
  const colPos = new Map();

  rowOrder.forEach((num, i) => rowPos.set(num, i));
  colOrder.forEach((num, i) => colPos.set(num, i));

  for (let i = 1; i <= k; i++) {
    matrix[rowPos.get(i)][colPos.get(i)] = i;
  }

  return matrix;
}

// 7. Minimum Height Trees (LeetCode 310)
function findMinHeightTrees(n, edges) {
  if (n === 1) return [0];
  const graph = Array(n).fill().map(() => []);
  const degree = Array(n).fill(0);

  for (let [u, v] of edges) {
    graph[u].push(v);
    graph[v].push(u);
    degree[u]++;
    degree[v]++;
  }

  const leaves = [];
  for (let i = 0; i < n; i++) {
    if (degree[i] === 1) leaves.push(i);
  }

  let remaining = n;
  while (remaining > 2) {
    const leafCount = leaves.length;
    remaining -= leafCount;

    const newLeaves = [];
    for (let leaf of leaves) {
      for (let neighbor of graph[leaf]) {
        degree[neighbor]--;
        if (degree[neighbor] === 1) {
          newLeaves.push(neighbor);
        }
      }
    }
    leaves.length = 0;
    leaves.push(...newLeaves);
  }

  return leaves;
}

// 8. Cycle Detection (DFS with coloring)
function hasCycleDFS(n, edges) {
  const graph = Array(n).fill().map(() => []);
  const visited = Array(n).fill(0);

  for (let [u, v] of edges) {
    graph[u].push(v);
  }

  const dfs = (node) => {
    visited[node] = 1;
    for (let neighbor of graph[node]) {
      if (visited[neighbor] === 1) return true;
      if (visited[neighbor] === 0 && dfs(neighbor)) return true;
    }
    visited[node] = 2;
    return false;
  };

  for (let i = 0; i < n; i++) {
    if (visited[i] === 0) {
      if (dfs(i)) return true;
    }
  }
  return false;
}

module.exports = {
  canFinish,
  findOrder,
  alienOrder,
  topologicalSortDFS,
  sequenceReconstruction,
  buildMatrix,
  findMinHeightTrees,
  hasCycleDFS,
};
