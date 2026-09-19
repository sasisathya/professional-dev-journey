/**
 * Category 6: Queue & Deque Patterns
 */

class CircularQueue {
  constructor(k) {
    this.data = new Array(k);
    this.head = 0;
    this.tail = -1;
    this.size = 0;
    this.k = k;
  }
  
  enQueue(value) {
    if (this.isFull()) return false;
    this.tail = (this.tail + 1) % this.k;
    this.data[this.tail] = value;
    this.size++;
    return true;
  }
  
  deQueue() {
    if (this.isEmpty()) return false;
    this.head = (this.head + 1) % this.k;
    this.size--;
    return true;
  }
  
  Front() { return this.isEmpty() ? -1 : this.data[this.head]; }
  Rear() { return this.isEmpty() ? -1 : this.data[this.tail]; }
  isEmpty() { return this.size === 0; }
  isFull() { return this.size === this.k; }
}

function maxSlidingWindow(nums, k) {
  const result = [];
  const deque = [];
  
  for (let i = 0; i < nums.length; i++) {
    if (deque.length && deque[0] < i - k + 1) deque.shift();
    while (deque.length && nums[deque[deque.length - 1]] < nums[i]) deque.pop();
    deque.push(i);
    if (i >= k - 1) result.push(nums[deque[0]]);
  }
  return result;
}

class MedianFinder {
  constructor() {
    this.small = [];
    this.large = [];
  }
  
  addNum(num) {
    if (!this.small.length || num <= this.small[0]) {
      this.small.push(num);
      this.small.sort((a, b) => b - a);
    } else {
      this.large.push(num);
      this.large.sort((a, b) => a - b);
    }
    this._balance();
  }
  
  _balance() {
    if (this.small.length > this.large.length + 1) {
      this.large.push(this.small.shift());
    } else if (this.large.length > this.small.length) {
      this.small.push(this.large.shift());
    }
  }
  
  findMedian() {
    if (this.small.length > this.large.length) return this.small[0];
    return (this.small[0] + this.large[0]) / 2;
  }
}

module.exports = { CircularQueue, maxSlidingWindow, MedianFinder };
