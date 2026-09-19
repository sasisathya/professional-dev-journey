/**
 * Category 12: Heap/Priority Queue Patterns
 */

function findKthLargest(nums, k) {
  const minHeap = [];
  for (let num of nums) {
    minHeap.push(num);
    minHeap.sort((a, b) => a - b);
    if (minHeap.length > k) minHeap.shift();
  }
  return minHeap[0];
}

function topKFrequent(nums, k) {
  const count = {};
  for (let num of nums) count[num] = (count[num] || 0) + 1;
  return Object.keys(count)
    .sort((a, b) => count[b] - count[a])
    .slice(0, k)
    .map(Number);
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

function lastStoneWeight(stones) {
  const heap = [...stones].sort((a, b) => b - a);
  while (heap.length > 1) {
    const first = heap.shift();
    const second = heap.shift();
    if (first > second) {
      heap.push(first - second);
      heap.sort((a, b) => b - a);
    }
  }
  return heap.length ? heap[0] : 0;
}

module.exports = { findKthLargest, topKFrequent, MedianFinder, lastStoneWeight };
