# DSA: Arrays & Two Pointers - Complete Interview Guide

## Table of Contents
1. [Arrays Basics](#arrays-basics)
2. [Two Pointers Pattern](#two-pointers-pattern)
3. [Classic Problems](#classic-problems)
4. [Implementation](#implementation)
5. [Interview Questions](#interview-questions)
6. [Practice Problems](#practice-problems)

---

## Arrays Basics

### What is an Array?
**Definition:** A data structure that stores elements of the same type in contiguous memory locations, allowing O(1) random access by index.

### Array Properties
```
Array: [10, 20, 30, 40, 50]
Index:   0   1   2   3   4

Memory Layout:
┌────┬────┬────┬────┬────┐
│ 10 │ 20 │ 30 │ 40 │ 50 │
└────┴────┴────┴────┴────┘
  ↑
  Memory address (contiguous)
```

### Time Complexity
```
Access:     O(1) - Direct index access
Search:     O(n) - Linear search (unless sorted)
Insertion:  O(n) - May require shifting
Deletion:   O(n) - May require shifting
Sorting:    O(n log n) - Quicksort, Mergesort
```

### Space Complexity
```
O(n) - where n is number of elements
```

### Example
```javascript
const arr = [10, 20, 30, 40, 50];

// Access: O(1)
console.log(arr[2]); // 30 (direct access, no loop)

// Insert at end: O(1)
arr.push(60); // [10, 20, 30, 40, 50, 60]

// Insert at beginning: O(n)
arr.unshift(0); // [0, 10, 20, 30, 40, 50, 60] (all elements shift)

// Delete from middle: O(n)
arr.splice(2, 1); // [0, 10, 30, 40, 50, 60] (elements shift)

// Search: O(n)
arr.indexOf(40); // 3
```

---

## Two Pointers Pattern

### What is Two Pointers?
**Pattern:** Use two pointers to traverse an array/list to solve problems efficiently. Converts O(n²) nested loop solutions to O(n) linear solutions.

### Two Types

#### Type 1: Opposite Direction Pointers
- **Start:** One pointer at beginning, one at end
- **Movement:** Move towards each other
- **Use:** Finding pairs, validating palindromes

```
Array: [1, 2, 3, 4, 5]
       ↑           ↑
      left        right

Move: left++, right--
Until: left >= right
```

#### Type 2: Same Direction Pointers (Slow & Fast)
- **Start:** Both pointers at beginning
- **Movement:** Fast moves faster, slow moves slower
- **Use:** Finding duplicates, removing elements

```
Array: [1, 1, 2, 3, 3, 4]
       ↑  ↑
      slow fast

Move: slow++, fast++
      fast += 2 (or more)
```

---

## Classic Problems

### Problem 1: Two Sum

**Find two numbers that add up to target**

#### Brute Force (O(n²))
```javascript
function twoSum(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] + arr[j] === target) {
        return [i, j];
      }
    }
  }
  return null;
}

// Time: O(n²) - nested loops
// Space: O(1) - no extra space
```

#### Two Pointers (O(n)) - Requires Sorted Array
```javascript
function twoSumSorted(arr, target) {
  let left = 0, right = arr.length - 1;

  while (left < right) {
    const sum = arr[left] + arr[right];

    if (sum === target) {
      return [left, right];
    } else if (sum < target) {
      left++; // Need larger sum
    } else {
      right--; // Need smaller sum
    }
  }

  return null;
}

// Time: O(n) - single pass with two pointers
// Space: O(1) - no extra space
```

#### Hash Map (O(n)) - Unsorted
```javascript
function twoSumHashMap(arr, target) {
  const seen = new Map();

  for (let i = 0; i < arr.length; i++) {
    const complement = target - arr[i];

    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }

    seen.set(arr[i], i);
  }

  return null;
}

// Time: O(n) - single pass
// Space: O(n) - hash map storage
```

### Problem 2: Container With Most Water

**Find two lines that form maximum area**

```javascript
// Array represents heights of lines
// Area = min(height[i], height[j]) * (j - i)

function maxArea(heights) {
  let left = 0, right = heights.length - 1;
  let maxArea = 0;

  while (left < right) {
    const height = Math.min(heights[left], heights[right]);
    const width = right - left;
    const area = height * width;

    maxArea = Math.max(maxArea, area);

    // Move pointer pointing to smaller height
    if (heights[left] < heights[right]) {
      left++;
    } else {
      right--;
    }
  }

  return maxArea;
}

// Example:
// heights = [1, 8, 6, 2, 5, 4, 8, 3, 7]
// maxArea(heights) = 49 (between height 8 and 7)
```

### Problem 3: Remove Duplicates From Sorted Array

**In-place removal (don't create new array)**

```javascript
function removeDuplicates(arr) {
  if (arr.length === 0) return 0;

  let slow = 0; // Position to insert unique element

  for (let fast = 1; fast < arr.length; fast++) {
    if (arr[fast] !== arr[slow]) {
      slow++;
      arr[slow] = arr[fast];
    }
  }

  return slow + 1; // Number of unique elements
}

// Example:
// arr = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]
// Result: [0, 1, 2, 3, 4, ...]
// Returns: 5 (number of unique elements)

// Time: O(n)
// Space: O(1) - in-place modification
```

### Problem 4: Valid Palindrome

**Check if string is palindrome (ignore spaces/punctuation)**

```javascript
function isPalindrome(s) {
  // Convert to lowercase and filter alphanumeric
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');

  let left = 0, right = cleaned.length - 1;

  while (left < right) {
    if (cleaned[left] !== cleaned[right]) {
      return false;
    }
    left++;
    right--;
  }

  return true;
}

// Example:
// isPalindrome("A man, a plan, a canal: Panama") = true
// isPalindrome("race a car") = false

// Time: O(n)
// Space: O(n) for cleaned string
```

### Problem 5: Reverse Array

**Reverse array in-place**

```javascript
function reverse(arr) {
  let left = 0, right = arr.length - 1;

  while (left < right) {
    // Swap
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }

  return arr;
}

// Example:
// reverse([1, 2, 3, 4, 5]) = [5, 4, 3, 2, 1]

// Time: O(n)
// Space: O(1) - in-place, no extra space
```

---

## Sliding Window

**Variation of Two Pointers for contiguous subarrays**

### What is Sliding Window?
Move a window of fixed or variable size across array to solve problems efficiently.

### Problem: Maximum Sum of Subarray (Fixed Window Size)

```javascript
function maxSumSubarray(arr, k) {
  if (arr.length < k) return null;

  // Calculate sum of first window
  let maxSum = 0;
  for (let i = 0; i < k; i++) {
    maxSum += arr[i];
  }

  let currentSum = maxSum;
  let left = 0;

  // Slide the window
  for (let right = k; right < arr.length; right++) {
    currentSum = currentSum - arr[left] + arr[right];
    maxSum = Math.max(maxSum, currentSum);
    left++;
  }

  return maxSum;
}

// Example:
// maxSumSubarray([1, 3, 2, 6, -1, 4, 1, 8], 3)
// Windows: [1,3,2]=6, [3,2,6]=11, [2,6,-1]=7, [6,-1,4]=9, [-1,4,1]=4, [4,1,8]=13
// Result: 13

// Time: O(n)
// Space: O(1)
```

### Problem: Longest Substring Without Repeating Characters

```javascript
function lengthOfLongestSubstring(s) {
  const charIndex = new Map();
  let maxLength = 0;
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];

    if (charIndex.has(char) && charIndex.get(char) >= left) {
      // Character already in window, move left pointer
      left = charIndex.get(char) + 1;
    }

    charIndex.set(char, right);
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}

// Example:
// lengthOfLongestSubstring("abcabcbb") = 3 ("abc")
// lengthOfLongestSubstring("bbbbb") = 1 ("b")
// lengthOfLongestSubstring("pwwkew") = 3 ("wke")

// Time: O(n)
// Space: O(min(m, n)) - size of charset
```

---

## Implementation Techniques

### Swapping Elements
```javascript
// Method 1: Destructuring (ES6)
[arr[i], arr[j]] = [arr[j], arr[i]];

// Method 2: Temp variable
const temp = arr[i];
arr[i] = arr[j];
arr[j] = temp;

// Method 3: XOR (bit manipulation - only numbers)
arr[i] = arr[i] ^ arr[j];
arr[j] = arr[i] ^ arr[j];
arr[i] = arr[i] ^ arr[j];
```

### Common Patterns

**Moving pointer based on condition:**
```javascript
while (left < right) {
  if (condition) {
    left++;  // or right--
  } else {
    right--;  // or left++
  }
}
```

**Collecting results:**
```javascript
const result = [];

while (left < right) {
  // Process
  result.push(something);
  left++;
  right--;
}

return result;
```

---

## Interview Questions

### Q1: What is the two pointers technique?
**Answer:** A pattern where two pointers traverse an array to solve problems efficiently. Commonly used to convert O(n²) solutions to O(n). Two types: opposite direction (meeting) and same direction (slow/fast).

### Q2: When is two pointers useful?
**Answer:**
- Finding pairs in sorted array
- Removing elements in-place
- Palindrome validation
- Two sum problems
- Partitioning arrays

### Q3: Why is two pointers faster than nested loops?
**Answer:** Two pointers make a single pass through the array in opposite directions, giving O(n) time complexity. Nested loops check all pairs, giving O(n²). No duplicate work.

### Q4: What's the difference between two pointers and sliding window?
**Answer:**
- **Two Pointers**: Usually move towards each other or at different speeds
- **Sliding Window**: Move a window of fixed/variable size across array, both pointers move in same direction

### Q5: Can two pointers work on unsorted arrays?
**Answer:** Some problems yes, some no. For Two Sum, you need to either sort first or use a hash map. For array reversal, order doesn't matter. For finding pairs in unsorted arrays, use hash map instead.

### Q6: How do you optimize array problems?
**Answer:**
1. **Identify the problem type** (pairs, duplicates, palindrome, etc.)
2. **Consider sorting** (enables two pointers)
3. **Use two pointers** if applicable
4. **Use hash map** for complement/matching
5. **Use sliding window** for subarrays

---

## Practice Problems

### Problem 1: Three Sum
```javascript
// Find all triplets that sum to 0

function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue; // Skip duplicates

    let left = i + 1, right = nums.length - 1;
    const target = -nums[i];

    while (left < right) {
      const sum = nums[left] + nums[right];

      if (sum === target) {
        result.push([nums[i], nums[left], nums[right]]);

        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;

        left++;
        right--;
      } else if (sum < target) {
        left++;
      } else {
        right--;
      }
    }
  }

  return result;
}

// Example:
// threeSum([-1, 0, 1, 2, -1, -4])
// Result: [[-1, -1, 2], [-1, 0, 1]]
```

### Problem 2: Move Zeros to End
```javascript
// Move all zeros to end without changing order of non-zeros

function moveZeroes(arr) {
  let slow = 0;

  // Move all non-zero elements to front
  for (let fast = 0; fast < arr.length; fast++) {
    if (arr[fast] !== 0) {
      arr[slow] = arr[fast];
      slow++;
    }
  }

  // Fill remaining with zeros
  while (slow < arr.length) {
    arr[slow] = 0;
    slow++;
  }

  return arr;
}

// Example:
// moveZeroes([0, 1, 0, 3, 12])
// Result: [1, 3, 12, 0, 0]
```

### Problem 3: Sort Array by Parity
```javascript
// Put all even numbers before odd numbers

function sortArrayByParity(arr) {
  let left = 0, right = arr.length - 1;

  while (left < right) {
    // left should have even number
    if (arr[left] % 2 === 1) {
      // Find even number from right
      while (right > left && arr[right] % 2 === 1) {
        right--;
      }
      [arr[left], arr[right]] = [arr[right], arr[left]];
    }
    left++;
  }

  return arr;
}

// Example:
// sortArrayByParity([3, 1, 2, 4])
// Result: [2, 4, 3, 1] or [4, 2, 3, 1]
```

---

## Key Takeaways

1. **Arrays** - O(1) access, O(n) insertion/deletion
2. **Two Pointers** - O(n) for pair problems, reduces from O(n²)
3. **Opposite Direction** - For finding pairs, matching elements
4. **Same Direction** - For removing duplicates, fast/slow
5. **Sliding Window** - For subarray problems
6. **In-place** - Modify array without extra space
7. **Sorted Array** - Often required for two pointers

---

**Arrays and two pointers are fundamental to coding interviews!**
