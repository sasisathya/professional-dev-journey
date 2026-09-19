/**
 * Category 14: Shortest Path Patterns
 * JavaScript implementation - Dijkstra, Bellman-Ford, Floyd-Warshall, BFS variants
 */

// 1. Dijkstra's Algorithm (LeetCode 743 - Network Delay Time)
function networkDelayTime(times, n, k) {
  const graph = Array(n + 1).fill().map(() => []);
  for (let [u, v, w] of times) graph[u].push([v, w]);

  const dist = Array(n + 1).fill(Infinity);
  dist[k] = 0;
  const pq = [[0, k]];

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (d > dist[u]) continue;

    for (let [v, w] of graph[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        pq.push([dist[v], v]);
      }
    }
  }

  let maxDist = 0;
  for (let i = 1; i <= n; i++) {
    maxDist = Math.max(maxDist, dist[i]);
  }
  return maxDist === Infinity ? -1 : maxDist;
}

// 2. Bellman-Ford Algorithm
function bellmanFord(n, edges, src) {
  const dist = Array(n).fill(Infinity);
  dist[src] = 0;

  for (let i = 0; i < n - 1; i++) {
    for (let [u, v, w] of edges) {
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
      }
    }
  }
  return dist;
}

// 3. Floyd-Warshall Algorithm
function floydWarshall(dist) {
  const n = dist.length;
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);
      }
    }
  }
}

// 4. 0-1 BFS (LeetCode 1091)
function shortestPathBinaryMatrix(grid) {
  if (grid[0][0] === 1) return -1;
  const deque = [[0, 0, 1]];
  const dirs = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];

  while (deque.length) {
    const [i, j, d] = deque.shift();
    if (i === grid.length - 1 && j === grid[0].length - 1) return d;

    for (let [di, dj] of dirs) {
      const ni = i + di, nj = j + dj;
      if (ni >= 0 && ni < grid.length && nj >= 0 && nj < grid[0].length && grid[ni][nj] === 0) {
        grid[ni][nj] = 1;
        deque.push([ni, nj, d + 1]);
      }
    }
  }
  return -1;
}

// 5. Multi-source BFS
function minDistBetweenGrids(grid1, grid2) {
  const m = grid1.length, n = grid1[0].length;
  const dist = Array(m).fill().map(() => Array(n).fill(Infinity));
  const queue = [];

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid1[i][j] === 1) {
        queue.push([i, j, 0]);
        dist[i][j] = 0;
      }
    }
  }

  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
  let minDist = Infinity;

  while (queue.length) {
    const [i, j, d] = queue.shift();
    if (grid2[i][j] === 1) minDist = Math.min(minDist, d);

    for (let [di, dj] of dirs) {
      const ni = i + di, nj = j + dj;
      if (ni >= 0 && ni < m && nj >= 0 && nj < n && dist[ni][nj] > d + 1) {
        dist[ni][nj] = d + 1;
        queue.push([ni, nj, d + 1]);
      }
    }
  }
  return minDist === Infinity ? -1 : minDist;
}

// 6. Minimum Effort Path (LeetCode 1631)
function minimumEffortPath(heights) {
  const m = heights.length, n = heights[0].length;
  const effort = Array(m).fill().map(() => Array(n).fill(Infinity));
  effort[0][0] = 0;

  const pq = [[0, 0, 0]];
  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [e, i, j] = pq.shift();
    if (e > effort[i][j]) continue;
    if (i === m - 1 && j === n - 1) return e;

    for (let [di, dj] of dirs) {
      const ni = i + di, nj = j + dj;
      if (ni >= 0 && ni < m && nj >= 0 && nj < n) {
        const newEffort = Math.max(e, Math.abs(heights[i][j] - heights[ni][nj]));
        if (newEffort < effort[ni][nj]) {
          effort[ni][nj] = newEffort;
          pq.push([newEffort, ni, nj]);
        }
      }
    }
  }
  return effort[m-1][n-1];
}

// 7. Path with Maximum Probability
function maxProbabilityPath(n, edges, succProb, start, end) {
  const graph = Array(n).fill().map(() => []);
  for (let i = 0; i < edges.length; i++) {
    const [u, v] = edges[i];
    graph[u].push([v, succProb[i]]);
    graph[v].push([u, succProb[i]]);
  }

  const prob = Array(n).fill(0);
  prob[start] = 1;
  const pq = [[-1, start]];

  while (pq.length) {
    pq.sort((a, b) => b[0] - a[0]);
    const [p, u] = pq.shift();

    if (-p < prob[u]) continue;

    for (let [v, edgeProb] of graph[u]) {
      const newProb = prob[u] * edgeProb;
      if (newProb > prob[v]) {
        prob[v] = newProb;
        pq.push([-newProb, v]);
      }
    }
  }
  return prob[end];
}

// 8. Cheapest Flights Within K Stops
function findCheapestPrice(n, flights, src, dst, k) {
  const graph = Array(n).fill().map(() => []);
  for (let [u, v, cost] of flights) graph[u].push([v, cost]);

  const dist = Array(n).fill(Infinity);
  dist[src] = 0;

  for (let i = 0; i < k + 1; i++) {
    const newDist = [...dist];
    for (let [u, v, cost] of flights) {
      if (dist[u] !== Infinity) {
        newDist[v] = Math.min(newDist[v], dist[u] + cost);
      }
    }
    dist = newDist;
  }
  return dist[dst] === Infinity ? -1 : dist[dst];
}

// 9. Word Ladder II
function findLadders(beginWord, endWord, wordList) {
  const wordSet = new Set(wordList);
  if (!wordSet.has(endWord)) return [];

  const neighbors = new Map();
  for (let word of [...wordSet, beginWord]) {
    neighbors.set(word, []);
  }

  const distance = new Map();
  for (let word of [...wordSet, beginWord]) {
    distance.set(word, Infinity);
  }

  bfsWordLadder(beginWord, endWord, wordSet, neighbors, distance);

  const result = [];
  dfsWordLadder(beginWord, endWord, neighbors, distance, [beginWord], result);
  return result;
}

function bfsWordLadder(begin, end, wordSet, neighbors, distance) {
  distance.set(begin, 0);
  const queue = [begin];

  while (queue.length) {
    const word = queue.shift();
    const currDist = distance.get(word);

    for (let neighbor of getNextWords(word, wordSet)) {
      neighbors.get(word).push(neighbor);
      if (distance.get(neighbor) === Infinity) {
        distance.set(neighbor, currDist + 1);
        queue.push(neighbor);
      }
    }
  }
}

function dfsWordLadder(word, end, neighbors, distance, path, result) {
  if (word === end) {
    result.push([...path]);
    return;
  }

  for (let neighbor of neighbors.get(word)) {
    if (distance.get(neighbor) === distance.get(word) + 1) {
      path.push(neighbor);
      dfsWordLadder(neighbor, end, neighbors, distance, path, result);
      path.pop();
    }
  }
}

function getNextWords(word, wordSet) {
  const nextWords = [];
  const chars = [...word];

  for (let i = 0; i < chars.length; i++) {
    const oldChar = chars[i];
    for (let c = 97; c <= 122; c++) {
      chars[i] = String.fromCharCode(c);
      const newWord = chars.join('');
      if (newWord !== word && wordSet.has(newWord)) {
        nextWords.push(newWord);
      }
    }
    chars[i] = oldChar;
  }
  return nextWords;
}

// 10. Swim in Rising Water
function swimInWater(grid) {
  const n = grid.length;
  const visited = Array(n).fill().map(() => Array(n).fill(false));
  const pq = [[grid[0][0], 0, 0]];
  const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
  let maxHeight = grid[0][0];

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [height, i, j] = pq.shift();
    maxHeight = Math.max(maxHeight, height);

    if (i === n - 1 && j === n - 1) return maxHeight;

    if (visited[i][j]) continue;
    visited[i][j] = true;

    for (let [di, dj] of dirs) {
      const ni = i + di, nj = j + dj;
      if (ni >= 0 && ni < n && nj >= 0 && nj < n && !visited[ni][nj]) {
        pq.push([grid[ni][nj], ni, nj]);
      }
    }
  }
}

module.exports = {
  networkDelayTime,
  bellmanFord,
  floydWarshall,
  shortestPathBinaryMatrix,
  minDistBetweenGrids,
  minimumEffortPath,
  maxProbabilityPath,
  findCheapestPrice,
  findLadders,
  swimInWater,
};
