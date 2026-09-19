/**
 * Category 15: Union-Find (Disjoint Set Union) Patterns
 * JavaScript implementation - Union-Find data structure and applications
 */

class UnionFind {
  constructor(n) {
    this.parent = Array(n).fill(0).map((_, i) => i);
    this.rank = Array(n).fill(0);
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(x, y) {
    const px = this.find(x);
    const py = this.find(y);
    if (px === py) return false;

    if (this.rank[px] < this.rank[py]) {
      this.parent[px] = py;
    } else if (this.rank[px] > this.rank[py]) {
      this.parent[py] = px;
    } else {
      this.parent[py] = px;
      this.rank[px]++;
    }
    return true;
  }

  isConnected(x, y) {
    return this.find(x) === this.find(y);
  }
}

// 1. Number of Islands (LeetCode 200)
function numIslands(grid) {
  if (!grid || grid.length === 0) return 0;
  const m = grid.length, n = grid[0].length;
  const uf = new UnionFind(m * n);
  let count = 0;

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === '1') {
        count++;
        const idx = i * n + j;

        if (i + 1 < m && grid[i + 1][j] === '1') {
          uf.union(idx, (i + 1) * n + j);
          count--;
        }
        if (j + 1 < n && grid[i][j + 1] === '1') {
          uf.union(idx, i * n + (j + 1));
          count--;
        }
      }
    }
  }
  return count;
}

// 2. Redundant Connection (LeetCode 684)
function findRedundantConnection(edges) {
  const uf = new UnionFind(edges.length + 1);
  for (let [u, v] of edges) {
    if (!uf.union(u, v)) {
      return [u, v];
    }
  }
  return [];
}

// 3. Accounts Merge (LeetCode 721)
function accountsMerge(accounts) {
  const uf = new UnionFind(accounts.length);
  const emailToAccount = new Map();

  for (let i = 0; i < accounts.length; i++) {
    for (let j = 1; j < accounts[i].length; j++) {
      const email = accounts[i][j];
      if (emailToAccount.has(email)) {
        uf.union(i, emailToAccount.get(email));
      } else {
        emailToAccount.set(email, i);
      }
    }
  }

  const accountsById = new Map();
  for (let i = 0; i < accounts.length; i++) {
    const root = uf.find(i);
    if (!accountsById.has(root)) {
      accountsById.set(root, []);
    }
    accountsById.get(root).push(i);
  }

  const result = [];
  const emailAccountMap = new Map();

  for (const accountIds of accountsById.values()) {
    const emails = new Set();
    for (const id of accountIds) {
      for (let j = 1; j < accounts[id].length; j++) {
        emails.add(accounts[id][j]);
      }
    }
    const sortedEmails = Array.from(emails).sort();
    result.push([accounts[accountIds[0]][0], ...sortedEmails]);
  }
  return result;
}

// 4. Graph Valid Tree (LeetCode 261)
function validTree(n, edges) {
  if (edges.length !== n - 1) return false;
  const uf = new UnionFind(n);

  for (let [u, v] of edges) {
    if (!uf.union(u, v)) {
      return false;
    }
  }
  return true;
}

// 5. Number of Connected Components in Undirected Graph (LeetCode 323)
function countComponents(n, edges) {
  const uf = new UnionFind(n);
  for (let [u, v] of edges) {
    uf.union(u, v);
  }

  const roots = new Set();
  for (let i = 0; i < n; i++) {
    roots.add(uf.find(i));
  }
  return roots.size;
}

// 6. Smallest String With Swaps (LeetCode 1202)
function smallestStringWithSwaps(s, pairs) {
  const uf = new UnionFind(s.length);
  for (let [a, b] of pairs) {
    uf.union(a, b);
  }

  const groupedByRoot = new Map();
  for (let i = 0; i < s.length; i++) {
    const root = uf.find(i);
    if (!groupedByRoot.has(root)) {
      groupedByRoot.set(root, []);
    }
    groupedByRoot.get(root).push(i);
  }

  const result = new Array(s.length);
  for (const indices of groupedByRoot.values()) {
    const chars = indices.map(i => s[i]).sort();
    indices.sort((a, b) => a - b);
    for (let i = 0; i < chars.length; i++) {
      result[indices[i]] = chars[i];
    }
  }
  return result.join('');
}

// 7. Similar String Groups (LeetCode 839)
function numSimilarGroups(strs) {
  const uf = new UnionFind(strs.length);

  const areSimilar = (s1, s2) => {
    let diff = 0;
    for (let i = 0; i < s1.length; i++) {
      if (s1[i] !== s2[i]) diff++;
      if (diff > 2) return false;
    }
    return diff === 0 || diff === 2;
  };

  for (let i = 0; i < strs.length; i++) {
    for (let j = i + 1; j < strs.length; j++) {
      if (areSimilar(strs[i], strs[j])) {
        uf.union(i, j);
      }
    }
  }

  const roots = new Set();
  for (let i = 0; i < strs.length; i++) {
    roots.add(uf.find(i));
  }
  return roots.size;
}

// 8. Most Stones Removed with Same Row or Column (LeetCode 947)
function removeStones(stones) {
  const uf = new UnionFind(stones.length);

  for (let i = 0; i < stones.length; i++) {
    for (let j = i + 1; j < stones.length; j++) {
      if (stones[i][0] === stones[j][0] || stones[i][1] === stones[j][1]) {
        uf.union(i, j);
      }
    }
  }

  const roots = new Set();
  for (let i = 0; i < stones.length; i++) {
    roots.add(uf.find(i));
  }
  return stones.length - roots.size;
}

// 9. Longest Consecutive Sequence (LeetCode 128 - Alternative approach)
function longestConsecutiveUF(nums) {
  if (nums.length === 0) return 0;
  const numSet = new Set(nums);
  const uf = new UnionFind(nums.length);
  const numToIdx = new Map();

  nums.forEach((num, idx) => {
    numToIdx.set(num, idx);
  });

  for (let num of numSet) {
    if (numSet.has(num + 1)) {
      uf.union(numToIdx.get(num), numToIdx.get(num + 1));
    }
  }

  const lengthMap = new Map();
  for (let i = 0; i < nums.length; i++) {
    const root = uf.find(i);
    lengthMap.set(root, (lengthMap.get(root) || 0) + 1);
  }
  return Math.max(...lengthMap.values());
}

// 10. Friend Circles (LeetCode 547)
function findCircleNum(M) {
  const n = M.length;
  const uf = new UnionFind(n);

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (M[i][j] === 1) {
        uf.union(i, j);
      }
    }
  }

  const roots = new Set();
  for (let i = 0; i < n; i++) {
    roots.add(uf.find(i));
  }
  return roots.size;
}

module.exports = {
  UnionFind,
  numIslands,
  findRedundantConnection,
  accountsMerge,
  validTree,
  countComponents,
  smallestStringWithSwaps,
  numSimilarGroups,
  removeStones,
  longestConsecutiveUF,
  findCircleNum,
};
