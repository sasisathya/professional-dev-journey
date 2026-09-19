/**
 * Category 26: Binary Lifting for LCA
 */
class BinaryLiftingLCA {
  constructor(root, n) {
    this.maxLog = 20;
    this.parent = Array(n).fill().map(() => Array(this.maxLog).fill(-1));
    this.depth = Array(n).fill(0);
    this.dfs(root, -1, 0);
  }
  
  dfs(node, p, d) {
    if (!node) return;
    this.parent[node.val][0] = p;
    this.depth[node.val] = d;
    
    for (let i = 1; i < this.maxLog; i++) {
      if (this.parent[node.val][i - 1] !== -1) {
        this.parent[node.val][i] = this.parent[this.parent[node.val][i - 1]][i - 1];
      }
    }
    
    if (node.left) this.dfs(node.left, node.val, d + 1);
    if (node.right) this.dfs(node.right, node.val, d + 1);
  }
  
  lca(u, v) {
    if (this.depth[u] < this.depth[v]) [u, v] = [v, u];
    
    const diff = this.depth[u] - this.depth[v];
    for (let i = 0; i < this.maxLog; i++) {
      if ((diff & (1 << i)) !== 0) u = this.parent[u][i];
    }
    
    if (u === v) return u;
    
    for (let i = this.maxLog - 1; i >= 0; i--) {
      if (this.parent[u][i] !== this.parent[v][i]) {
        u = this.parent[u][i];
        v = this.parent[v][i];
      }
    }
    return this.parent[u][0];
  }
}

module.exports = { BinaryLiftingLCA };
