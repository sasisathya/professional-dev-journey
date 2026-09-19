/**
 * Category 1: Arrays & Hashing Patterns
 * JavaScript implementation - 20+ solutions
 */

// 1. Two Sum (LeetCode 1)
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

// 2. Valid Anagram (LeetCode 242)
function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = {};
  for (let char of s) {
    count[char] = (count[char] || 0) + 1;
  }
  for (let char of t) {
    if (!count[char]) return false;
    count[char]--;
  }
  return true;
}

// 3. Group Anagrams (LeetCode 49)
function groupAnagrams(strs) {
  const map = new Map();
  for (let str of strs) {
    const sorted = [...str].sort().join('');
    if (!map.has(sorted)) {
      map.set(sorted, []);
    }
    map.get(sorted).push(str);
  }
  return Array.from(map.values());
}

// 4. Majority Element (LeetCode 169)
function majorityElement(nums) {
  const count = {};
  const majority = Math.floor(nums.length / 2);
  for (let num of nums) {
    count[num] = (count[num] || 0) + 1;
    if (count[num] > majority) return num;
  }
}

// 5. Frequency Counting
function characterFrequency(str) {
  const freq = {};
  for (let char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }
  return freq;
}

// 6. Prefix Sum (LeetCode 303)
class PrefixSum {
  constructor(nums) {
    this.prefix = [0];
    for (let num of nums) {
      this.prefix.push(this.prefix[this.prefix.length - 1] + num);
    }
  }

  sumRange(left, right) {
    return this.prefix[right + 1] - this.prefix[left];
  }
}

// 7. Contains Duplicate (LeetCode 217)
function containsDuplicate(nums) {
  return new Set(nums).size !== nums.length;
}

// 8. Top K Frequent Elements (LeetCode 347)
function topKFrequent(nums, k) {
  const count = {};
  for (let num of nums) {
    count[num] = (count[num] || 0) + 1;
  }
  return Object.keys(count)
    .sort((a, b) => count[b] - count[a])
    .slice(0, k)
    .map(Number);
}

// 9. Longest Consecutive (LeetCode 128)
function longestConsecutive(nums) {
  if (nums.length === 0) return 0;
  const numSet = new Set(nums);
  let maxLen = 1;

  for (let num of numSet) {
    if (!numSet.has(num - 1)) {
      let currNum = num;
      let currLen = 1;
      while (numSet.has(currNum + 1)) {
        currNum++;
        currLen++;
      }
      maxLen = Math.max(maxLen, currLen);
    }
  }
  return maxLen;
}

// 10. Isomorphic Strings (LeetCode 205)
function isIsomorphic(s, t) {
  if (s.length !== t.length) return false;
  const sMap = {};
  const tMap = {};

  for (let i = 0; i < s.length; i++) {
    if (sMap[s[i]] !== undefined && sMap[s[i]] !== t[i]) return false;
    if (tMap[t[i]] !== undefined && tMap[t[i]] !== s[i]) return false;
    sMap[s[i]] = t[i];
    tMap[t[i]] = s[i];
  }
  return true;
}

// 11. Difference Array
function rangeAddition(n, operations) {
  const diff = new Array(n + 1).fill(0);
  for (let [start, end, inc] of operations) {
    diff[start] += inc;
    diff[end + 1] -= inc;
  }

  const result = [];
  let current = 0;
  for (let i = 0; i < n; i++) {
    current += diff[i];
    result.push(current);
  }
  return result;
}

// 12. Maximum Subarray - Kadane's Algorithm (LeetCode 53)
function maxSubArray(nums) {
  let maxCurrent = nums[0];
  let maxGlobal = nums[0];

  for (let i = 1; i < nums.length; i++) {
    maxCurrent = Math.max(nums[i], maxCurrent + nums[i]);
    maxGlobal = Math.max(maxGlobal, maxCurrent);
  }
  return maxGlobal;
}

// 13. Product of Array Except Self (LeetCode 238)
function productExceptSelf(nums) {
  const result = new Array(nums.length).fill(1);
  let prefix = 1;

  for (let i = 0; i < nums.length; i++) {
    result[i] *= prefix;
    prefix *= nums[i];
  }

  let suffix = 1;
  for (let i = nums.length - 1; i >= 0; i--) {
    result[i] *= suffix;
    suffix *= nums[i];
  }
  return result;
}

// 14. Find All Duplicates (LeetCode 442)
function findDuplicates(nums) {
  const result = [];
  const seen = new Set();

  for (let num of nums) {
    if (seen.has(num)) {
      if (!result.includes(num)) result.push(num);
    }
    seen.add(num);
  }
  return result;
}

// 15. First Missing Positive (LeetCode 41)
function firstMissingPositive(nums) {
  const n = nums.length;
  const numSet = new Set(nums);

  for (let i = 1; i <= n; i++) {
    if (!numSet.has(i)) return i;
  }
  return n + 1;
}

// Test cases
console.log('Two Sum:', twoSum([2, 7, 11, 15], 9));
console.log('Valid Anagram:', isAnagram('anagram', 'nagaram'));
console.log('Group Anagrams:', groupAnagrams(['eat', 'tea', 'ate', 'bat']));
console.log('Majority Element:', majorityElement([3, 2, 3]));
console.log('Max Subarray:', maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]));

module.exports = {
  twoSum,
  isAnagram,
  groupAnagrams,
  majorityElement,
  PrefixSum,
  topKFrequent,
  longestConsecutive,
  isIsomorphic,
  maxSubArray,
  productExceptSelf,
};
