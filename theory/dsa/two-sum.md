# Two Sum - Complete Guide (All Variations)

## Table of Contents
1. [Two Sum (Classic)](#two-sum-classic)
2. [Two Sum II (Sorted Array)](#two-sum-ii-sorted-array)
3. [Two Sum III (Data Structure)](#two-sum-iii-data-structure)
4. [Two Sum IV (BST)](#two-sum-iv-bst)
5. [Two Sum Closest](#two-sum-closest)
6. [Two Sum Less Than K](#two-sum-less-than-k)
7. [Two Sum Unique Pairs](#two-sum-unique-pairs)
8. [Interview Tips](#interview-tips)

---

## Two Sum (Classic)

**Problem:** Given an array of integers `nums` and an integer `target`, return indices of the two numbers that add up to the target. You may assume each input has exactly one solution, and you cannot use the same element twice.

**Example:**
```
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
Explanation: nums[0] + nums[1] == 9, so we return [0, 1]
```

### Approach 1: Brute Force (❌ Bad for interviews)
```javascript
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}
```

**Time Complexity:** O(n²)  
**Space Complexity:** O(1)  
**Verdict:** Too slow. Never use in interview unless it's your first attempt.

---

### Approach 2: Hash Map (✅ Optimal)
```javascript
function twoSum(nums, target) {
  const map = new Map(); // value -> index
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}
```

**Time Complexity:** O(n)  
**Space Complexity:** O(n)  
**Why it works:** One pass. For each number, check if complement exists in map.

**Key insights:**
- Store value → index mapping
- Check map BEFORE adding current element (avoids using same element twice)
- Works with duplicates, negative numbers, any order

---

### Approach 3: Hash Set (Slightly Different)
```javascript
function twoSum(nums, target) {
  const seen = new Set();
  
  for (const num of nums) {
    const complement = target - num;
    
    if (seen.has(complement)) {
      return [nums.indexOf(complement), nums.indexOf(num)];
    }
    
    seen.add(num);
  }
  
  return [];
}
```

**Note:** This loses index information early. Not ideal if you need original indices.

---

### Approach 4: TypeScript Version (Production)
```typescript
function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>(); // value -> index
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement)!, i]; // ! asserts value exists
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}
```

---

### Interview Answer Template
"I'll use a hash map. Single pass through the array. For each number, calculate the complement (target - current), check if it's in the map. If yes, return indices. If no, add current number to map. Time O(n), space O(n). This handles duplicates, negatives, any order."

---

## Two Sum II (Sorted Array)

**Problem:** Given a sorted array and target, return indices of two numbers. Array is 1-indexed. You cannot use the same element twice.

**Example:**
```
Input: numbers = [2, 7, 11, 15], target = 9
Output: [1, 2]
Explanation: numbers[1] + numbers[2] == 9
```

### Approach 1: Two Pointers (✅ Optimal for Sorted)
```javascript
function twoSum(numbers, target) {
  let left = 0, right = numbers.length - 1;
  
  while (left < right) {
    const sum = numbers[left] + numbers[right];
    
    if (sum === target) {
      return [left + 1, right + 1]; // 1-indexed
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }
  
  return [];
}
```

**Time Complexity:** O(n)  
**Space Complexity:** O(1)  
**Why it's optimal:** 
- No extra space (vs hash map)
- Still O(n) time
- Leverages sorted property
- Two pointers converge guaranteed

**Key insight:** Start from opposite ends. If sum too small, move left pointer right (increase sum). If sum too large, move right pointer left (decrease sum).

---

### Approach 2: Binary Search (Slower but Valid)
```javascript
function twoSum(numbers, target) {
  for (let i = 0; i < numbers.length; i++) {
    const complement = target - numbers[i];
    
    // Binary search in rest of array
    let left = i + 1, right = numbers.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (numbers[mid] === complement) {
        return [i + 1, mid + 1];
      } else if (numbers[mid] < complement) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }
  return [];
}
```

**Time Complexity:** O(n log n)  
**Space Complexity:** O(1)  
**Not better than two pointers.** Mention it if interviewer specifically asks about binary search approach.

---

### Approach 3: Hash Map (Works but Wastes Sorted Property)
```javascript
function twoSum(numbers, target) {
  const map = new Map();
  
  for (let i = 0; i < numbers.length; i++) {
    const complement = target - numbers[i];
    if (map.has(complement)) {
      return [map.get(complement) + 1, i + 1];
    }
    map.set(numbers[i], i);
  }
  
  return [];
}
```

**Time Complexity:** O(n)  
**Space Complexity:** O(n)  
**Problem:** We have sorted array but use O(n) space. Two pointers better here.

---

### Interview Answer Template
"Since array is sorted, I'll use two pointers. Start left at beginning, right at end. Calculate sum. If matches target, return. If sum too small, move left right (increase sum). If sum too large, move right left (decrease sum). Time O(n), space O(1). Better than hash map because we leverage the sorted property and use no extra space."

---

## Two Sum III (Data Structure)

**Problem:** Design a data structure that supports add/find operations. `add(number)` adds number to data structure. `find(value)` returns true if two numbers in structure sum to value.

**Example:**
```javascript
const twoSum = new TwoSum();
twoSum.add(1);
twoSum.add(3);
twoSum.add(5);
console.log(twoSum.find(4)); // true (1 + 3 = 4)
console.log(twoSum.find(7)); // true (2 + 5 = 7)
console.log(twoSum.find(10)); // false
```

### Approach 1: Hash Set (✅ Best for Frequent Finds)
```javascript
class TwoSum {
  constructor() {
    this.nums = new Set();
  }
  
  add(number) {
    this.nums.add(number);
  }
  
  find(value) {
    for (const num of this.nums) {
      const complement = value - num;
      if (complement !== num && this.nums.has(complement)) {
        return true;
      }
      if (complement === num && this.nums.size > 1) {
        // Need at least 2 instances if complement equals num
        // But Set only stores one, so this case is hard
        return false;
      }
    }
    return false;
  }
}
```

**Issue:** Set only stores unique values. Can't tell if duplicate exists.

### Approach 2: Hash Map (✅ Better - Tracks Frequency)
```javascript
class TwoSum {
  constructor() {
    this.map = new Map(); // number -> count
  }
  
  add(number) {
    this.map.set(number, (this.map.get(number) || 0) + 1);
  }
  
  find(value) {
    for (const [num, count] of this.map) {
      const complement = value - num;
      
      if (complement === num) {
        // Need at least 2 of same number
        return count > 1;
      }
      
      if (this.map.has(complement)) {
        return true;
      }
    }
    return false;
  }
}
```

**Time Complexity:**
- add: O(1)
- find: O(n)

**Space Complexity:** O(n)

**Key insight:** Track frequency of each number. When checking complement equals num, ensure count > 1.

---

### Approach 3: Sorted Array (✅ Best for Frequent Adds, Occasional Finds)
```javascript
class TwoSum {
  constructor() {
    this.nums = [];
  }
  
  add(number) {
    // Insert sorted (binary search + insert)
    // Or just push and sort occasionally
    this.nums.push(number);
    this.nums.sort((a, b) => a - b);
  }
  
  find(value) {
    let left = 0, right = this.nums.length - 1;
    
    while (left < right) {
      const sum = this.nums[left] + this.nums[right];
      
      if (sum === value) {
        return true;
      } else if (sum < value) {
        left++;
      } else {
        right--;
      }
    }
    
    return false;
  }
}
```

**Time Complexity:**
- add: O(n) if keeping sorted, O(1) if lazy sort
- find: O(n)

**Trade-off:** Slower adds, but similar finds to hash map approach.

---

### Approach 4: TypeScript Production Version
```typescript
class TwoSum {
  private map: Map<number, number>;
  
  constructor() {
    this.map = new Map();
  }
  
  add(number: number): void {
    this.map.set(number, (this.map.get(number) ?? 0) + 1);
  }
  
  find(value: number): boolean {
    for (const [num, count] of this.map) {
      const complement = value - num;
      
      if (complement === num && count > 1) {
        return true;
      }
      
      if (complement !== num && this.map.has(complement)) {
        return true;
      }
    }
    
    return false;
  }
}
```

---

### Interview Answer Template
"I'll use a hash map to track frequency of numbers. On add, increment count. On find, iterate through map, check if complement exists. If complement equals current number, ensure count > 1 (need two copies). Time: add O(1), find O(n). Space O(n). Alternative: if adds are rare and finds frequent, use sorted array with two pointers—O(1) adds, O(n) finds."

---

## Two Sum IV (BST)

**Problem:** Given root of a BST and a target value, return true if two elements in BST sum to target.

**Example:**
```
    5
   / \
  3   6
 / \
2   4

Target = 9, Output: true (5 + 4 = 9)
```

### Approach 1: Hash Set + Inorder Traversal (✅ Best)
```javascript
function findTarget(root, k) {
  const seen = new Set();
  
  function inorder(node) {
    if (!node) return false;
    
    const complement = k - node.val;
    
    if (seen.has(complement)) {
      return true;
    }
    
    seen.add(node.val);
    
    return inorder(node.left) || inorder(node.right);
  }
  
  return inorder(root);
}
```

**Time Complexity:** O(n)  
**Space Complexity:** O(n) for set + O(h) for recursion stack

**Why it works:** DFS with set. Single pass. BST property not strictly needed (works on any tree).

---

### Approach 2: Two Pointers with Iterators (✅ Clever, No Extra Space for Set)
```javascript
function findTarget(root, k) {
  // Get sorted iterators: one ascending, one descending
  const left = getMin(root);  // leftmost (smallest)
  const right = getMax(root); // rightmost (largest)
  
  while (left.val < right.val) {
    const sum = left.val + right.val;
    
    if (sum === k) {
      return true;
    } else if (sum < k) {
      left.val = getNext(left, true); // move to next larger
    } else {
      right.val = getNext(right, false); // move to next smaller
    }
  }
  
  return false;
}

function getMin(node) {
  while (node.left) node = node.left;
  return node;
}

function getMax(node) {
  while (node.right) node = node.right;
  return node;
}

function getNext(node, isAsc) {
  // Get next node in order...complex implementation
}
```

**Note:** Complex to implement. Not recommended for interviews unless specifically asked.

---

### Approach 3: Hash Set + Level Order (BFS)
```javascript
function findTarget(root, k) {
  const seen = new Set();
  const queue = [root];
  
  while (queue.length) {
    const node = queue.shift();
    const complement = k - node.val;
    
    if (seen.has(complement)) {
      return true;
    }
    
    seen.add(node.val);
    
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  
  return false;
}
```

**Same as inorder but BFS instead of DFS.** Similar complexity.

---

### Approach 4: TypeScript Production Version
```typescript
class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val: number = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function findTarget(root: TreeNode | null, k: number): boolean {
  const seen = new Set<number>();
  
  function inorder(node: TreeNode | null): boolean {
    if (!node) return false;
    
    const complement = k - node.val;
    
    if (seen.has(complement)) {
      return true;
    }
    
    seen.add(node.val);
    
    return inorder(node.left) || inorder(node.right);
  }
  
  return inorder(root);
}
```

---

### Interview Answer Template
"I'll use DFS (inorder traversal) with a hash set. As I traverse, for each node, check if complement exists in set. If yes, return true. If no, add to set. Single pass O(n), space O(n) for set. BST property not needed—works on any tree. Alternative: two pointers with iterators but complex to implement and not worth interview time."

---

## Two Sum Closest

**Problem:** Given array and target, find two numbers whose sum is closest to target. Return the difference.

**Example:**
```
Input: nums = [1, 6, 1, 19], target = 25
Output: 3 (1 + 19 = 20, difference = 5 from target... wait)
Explanation: Closest sum is 20 (difference of 5) or 7 (difference of 18)
```

### Approach 1: Sorted + Two Pointers (✅ Optimal)
```javascript
function threeSumClosest(nums, target) {
  nums.sort((a, b) => a - b);
  let closestSum = Infinity;
  
  for (let i = 0; i < nums.length - 1; i++) {
    let left = i + 1, right = nums.length - 1;
    
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      
      if (Math.abs(sum - target) < Math.abs(closestSum - target)) {
        closestSum = sum;
      }
      
      if (sum === target) {
        return sum; // Can't get closer
      } else if (sum < target) {
        left++;
      } else {
        right--;
      }
    }
  }
  
  return closestSum;
}
```

**Time Complexity:** O(n²) due to nested loop  
**Space Complexity:** O(1) if not counting sort

**Key insight:** Sort first. For each element, use two pointers. Track minimum difference.

---

### Approach 2: Hash Map (Alternative, Not Optimal)
```javascript
function twSumClosest(nums, target) {
  const map = new Map();
  let minDiff = Infinity;
  let closestSum = 0;
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    // Check nearby values in map
    for (const [num, index] of map) {
      const sum = nums[i] + num;
      const diff = Math.abs(sum - target);
      
      if (diff < minDiff) {
        minDiff = diff;
        closestSum = sum;
      }
    }
    
    map.set(nums[i], i);
  }
  
  return closestSum;
}
```

**Not better than sorted approach.** Mention only if asked.

---

### Interview Answer Template
"Sort array first. For each pair, use two pointers starting from opposite ends. Calculate sum. If closest to target so far, update result. If sum equals target, return immediately. If sum less than target, move left pointer right. Otherwise move right pointer left. O(n²) time, O(1) space (ignoring sort)."

---

## Two Sum Less Than K

**Problem:** Given array and value K, return count of pairs where sum < K.

**Example:**
```
Input: nums = [34, 23, 1, 24, 75, 33, 54, 8], k = 60
Output: 5 (pairs: 34+23, 23+1, 34+8, 1+24, 33+8)
```

### Approach 1: Sorted + Two Pointers (✅ Optimal)
```javascript
function twoSumLessThanK(nums, k) {
  nums.sort((a, b) => a - b);
  let left = 0, right = nums.length - 1;
  let count = 0;
  
  while (left < right) {
    const sum = nums[left] + nums[right];
    
    if (sum < k) {
      // All pairs (left, right), (left+1, right), ..., (right-1, right) are valid
      count += right - left;
      left++;
    } else {
      right--;
    }
  }
  
  return count;
}
```

**Time Complexity:** O(n log n) for sort + O(n) for two pointers = O(n log n)  
**Space Complexity:** O(1)

**Key insight:** When sum < k with left < right, ALL elements between left and right-1 also sum < k with right (because sorted). So count += (right - left).

---

### Approach 2: Brute Force (Bad)
```javascript
function twoSumLessThanK(nums, k) {
  let count = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] < k) {
        count++;
      }
    }
  }
  return count;
}
```

**Time Complexity:** O(n²)  
**Don't use unless you have no time.** Mention sorted two pointers approach first.

---

### Interview Answer Template
"Sort array. Use two pointers at ends. Calculate sum. If less than K, all elements between left and right-1 also pair with right to form valid sum (because sorted). So count += (right - left), move left forward. Otherwise move right backward. O(n log n) time, O(1) space."

---

## Two Sum Unique Pairs

**Problem:** Given array, find all unique pairs that sum to target. Return all unique pairs (not indices).

**Example:**
```
Input: nums = [1, 1, 2, 45, 46, 46], target = 47
Output: [[1, 46], [2, 45]]
Explanation: Unique pairs only, no duplicates
```

### Approach 1: Sorted + Two Pointers with Deduplication (✅ Optimal)
```javascript
function twoSumUniquePairs(nums, target) {
  nums.sort((a, b) => a - b);
  const pairs = [];
  let left = 0, right = nums.length - 1;
  
  while (left < right) {
    const sum = nums[left] + nums[right];
    
    if (sum === target) {
      // Add pair if not already added
      if (pairs.length === 0 || pairs[pairs.length - 1][0] !== nums[left]) {
        pairs.push([nums[left], nums[right]]);
      }
      
      // Skip duplicates on left
      while (left < right && nums[left] === nums[left + 1]) left++;
      // Skip duplicates on right
      while (left < right && nums[right] === nums[right - 1]) right--;
      
      left++;
      right--;
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }
  
  return pairs;
}
```

**Time Complexity:** O(n log n) for sort + O(n) for two pointers  
**Space Complexity:** O(1) excluding output

**Key insight:** After finding pair, skip all duplicates. Check if pair already added (not needed if we use Set).

---

### Approach 2: Hash Set (Cleaner Deduplication)
```javascript
function twoSumUniquePairs(nums, target) {
  nums.sort((a, b) => a - b);
  const pairs = new Set();
  let left = 0, right = nums.length - 1;
  
  while (left < right) {
    const sum = nums[left] + nums[right];
    
    if (sum === target) {
      pairs.add(JSON.stringify([nums[left], nums[right]]));
      left++;
      right--;
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }
  
  return Array.from(pairs).map(p => JSON.parse(p));
}
```

**Note:** JSON.stringify is not ideal for large numbers (precision loss). Better to use Map or custom object.

---

### Approach 3: Hash Set Better Version
```javascript
function twoSumUniquePairs(nums, target) {
  const seen = new Set();
  const pairs = new Set();
  
  for (const num of nums) {
    const complement = target - num;
    
    if (seen.has(complement)) {
      // Use smaller first to avoid duplicates
      const pair = Math.min(num, complement) + ',' + Math.max(num, complement);
      pairs.add(pair);
    }
    
    seen.add(num);
  }
  
  return Array.from(pairs).map(p => p.split(',').map(Number));
}
```

**Time Complexity:** O(n)  
**Space Complexity:** O(n)

**Better than sorted approach** if no need to modify original array.

---

### Interview Answer Template
"Two approaches: (1) Sort + two pointers: O(n log n) time, skip duplicates after finding pairs. (2) Hash set: O(n) time, track seen numbers, add pairs to set using 'min,max' format to avoid duplicates. Second approach faster but first is more intuitive. I'd go with hash set for interviews—simpler logic and better time complexity."

---

## Interview Tips

### What Interviewers Look For

**Good answers include:**
- ✅ "I'd use hash map for flexibility, O(n) time"
- ✅ "For sorted array, two pointers exploit that property"
- ✅ "I need to handle duplicates/negative numbers"
- ✅ "Time O(n), space O(n) tradeoff"
- ✅ "I'd verify with examples first"

**Red flags (avoid):**
- ❌ "Just use nested loops" (if you have time)
- ❌ "I forgot about duplicates" (test your solution!)
- ❌ "Hash map is always better" (depends on input)
- ❌ "No need to handle negatives" (they could appear)
- ❌ "I'll code then think about complexity"

---

### Interview Flow

1. **Clarify requirements** (5 min)
   - Can array have duplicates?
   - Negative numbers?
   - Return indices or values?
   - Exactly one solution guaranteed?

2. **State approach** (1 min)
   - "I'll use hash map: O(n) time, O(n) space"
   - OR "Sorted + two pointers: O(n log n) time, O(1) space"

3. **Code with explanation** (5 min)
   - Write clean code
   - Explain each step
   - Use meaningful variable names

4. **Test with examples** (3 min)
   - Given example
   - Edge cases: duplicates, negative, single element
   - Empty array (if applicable)

5. **Discuss tradeoffs** (2 min)
   - "If array is already sorted, skip sort step"
   - "For multiple queries, preprocessing worth it"
   - "Space vs time: hash map better, pointers cleaner"

---

### Code Review Checklist
Before submitting:
- [ ] Off-by-one errors in indices?
- [ ] Handle duplicates correctly?
- [ ] What if no solution exists? (return [] or -1?)
- [ ] Test with negatives, zeros, large numbers?
- [ ] Clean variable names?
- [ ] Comments for non-obvious logic?

---

### Complexity Comparison Table

| Variation | Approach | Time | Space | Notes |
|-----------|----------|------|-------|-------|
| Classic Two Sum | Hash Map | O(n) | O(n) | Optimal |
| Two Sum II | Two Pointers | O(n) | O(1) | Leverages sorted |
| Two Sum III | Hash Map | add O(1), find O(n) | O(n) | Data structure |
| Two Sum IV | Hash Set + DFS | O(n) | O(n) | Works on trees |
| Two Sum Closest | Sorted + 2-Ptr | O(n²) | O(1) | (With nested loop) |
| Two Sum < K | Sorted + 2-Ptr | O(n log n) | O(1) | Counting logic |
| Unique Pairs | Hash Set | O(n) | O(n) | Deduplication |

---

### Production Wisdom

**When solving two sum variants:**
1. Always clarify the exact problem statement
2. Consider if array is sorted (huge hint for optimization)
3. Handle edge cases: duplicates, negatives, empty array
4. Time vs space tradeoff matters (sometimes O(n) space not acceptable)
5. For interviews, solution clarity > aggressive optimization
6. Test your solution mentally before coding

**Common mistakes:**
- Using same element twice (check in loop order)
- Not handling duplicates in unique pairs version
- Forgetting O(n) space for hash map complexity
- Over-complicating when simple solution exists

---

**Level:** Interview-Ready | **Updated:** 2026-08-16 | **Difficulty:** Medium | **Frequency:** Very High (appears in most tech interviews)
