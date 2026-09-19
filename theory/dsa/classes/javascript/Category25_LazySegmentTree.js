/**
 * Category 25: Lazy Segment Tree
 */
class LazySegmentTree {
  constructor(arr) {
    this.n = arr.length;
    this.tree = Array(4 * this.n).fill(0);
    this.lazy = Array(4 * this.n).fill(0);
    this.build(arr, 0, 0, this.n - 1);
  }
  
  build(arr, node, start, end) {
    if (start === end) {
      this.tree[node] = arr[start];
    } else {
      const mid = Math.floor((start + end) / 2);
      this.build(arr, 2 * node + 1, start, mid);
      this.build(arr, 2 * node + 2, mid + 1, end);
      this.tree[node] = this.tree[2 * node + 1] + this.tree[2 * node + 2];
    }
  }
  
  updateRange(l, r, val) {
    this._updateHelper(0, 0, this.n - 1, l, r, val);
  }
  
  _updateHelper(node, start, end, l, r, val) {
    if (this.lazy[node] !== 0) {
      this.tree[node] += (end - start + 1) * this.lazy[node];
      if (start !== end) {
        this.lazy[2 * node + 1] += this.lazy[node];
        this.lazy[2 * node + 2] += this.lazy[node];
      }
      this.lazy[node] = 0;
    }
    if (start > end || start > r || end < l) return;
    if (l <= start && end <= r) {
      this.tree[node] += (end - start + 1) * val;
      if (start !== end) {
        this.lazy[2 * node + 1] += val;
        this.lazy[2 * node + 2] += val;
      }
      return;
    }
    const mid = Math.floor((start + end) / 2);
    this._updateHelper(2 * node + 1, start, mid, l, r, val);
    this._updateHelper(2 * node + 2, mid + 1, end, l, r, val);
    this.tree[node] = this.tree[2 * node + 1] + this.tree[2 * node + 2];
  }
  
  queryRange(l, r) {
    return this._queryHelper(0, 0, this.n - 1, l, r);
  }
  
  _queryHelper(node, start, end, l, r) {
    if (start > end || start > r || end < l) return 0;
    if (this.lazy[node] !== 0) {
      this.tree[node] += (end - start + 1) * this.lazy[node];
      if (start !== end) {
        this.lazy[2 * node + 1] += this.lazy[node];
        this.lazy[2 * node + 2] += this.lazy[node];
      }
      this.lazy[node] = 0;
    }
    if (l <= start && end <= r) return this.tree[node];
    const mid = Math.floor((start + end) / 2);
    return this._queryHelper(2 * node + 1, start, mid, l, r) +
           this._queryHelper(2 * node + 2, mid + 1, end, l, r);
  }
}

module.exports = { LazySegmentTree };
