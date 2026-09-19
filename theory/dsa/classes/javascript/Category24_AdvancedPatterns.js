/**
 * Category 24: Advanced Patterns (Segment Tree, Fenwick Tree, etc.)
 */
class SegmentTree {
  constructor(arr) {
    this.n = arr.length;
    this.tree = Array(4 * this.n).fill(0);
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
  
  query(node, start, end, l, r) {
    if (r < start || end < l) return 0;
    if (l <= start && end <= r) return this.tree[node];
    const mid = Math.floor((start + end) / 2);
    return this.query(2 * node + 1, start, mid, l, r) +
           this.query(2 * node + 2, mid + 1, end, l, r);
  }
}

class FenwickTree {
  constructor(n) {
    this.n = n;
    this.tree = Array(n + 1).fill(0);
  }
  
  update(i, delta) {
    while (i <= this.n) {
      this.tree[i] += delta;
      i += i & (-i);
    }
  }
  
  query(i) {
    let sum = 0;
    while (i > 0) {
      sum += this.tree[i];
      i -= i & (-i);
    }
    return sum;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = { val: 0, key: 0, prev: null, next: null };
    this.tail = { val: 0, key: 0, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  
  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    this._remove(node);
    this._addToHead(node);
    return node.val;
  }
  
  put(key, value) {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      node.val = value;
      this._remove(node);
      this._addToHead(node);
    } else {
      const node = { key, val: value, prev: null, next: null };
      this.map.set(key, node);
      this._addToHead(node);
      if (this.map.size > this.capacity) {
        const removed = this.tail.prev;
        this._remove(removed);
        this.map.delete(removed.key);
      }
    }
  }
  
  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
  
  _addToHead(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }
}

module.exports = { SegmentTree, FenwickTree, LRUCache };
