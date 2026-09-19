/**
 * Category 2: Two Pointer Patterns
 * JavaScript implementation - 20+ solutions
 */

// 1. Valid Palindrome (LeetCode 125)
function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0, right = clean.length - 1;
  while (left < right) {
    if (clean[left] !== clean[right]) return false;
    left++;
    right--;
  }
  return true;
}

// 2. Two Sum II (LeetCode 167)
function twoSum(numbers, target) {
  let left = 0, right = numbers.length - 1;
  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) return [left + 1, right + 1];
    if (sum < target) left++;
    else right--;
  }
  return [];
}

// 3. Reverse String (LeetCode 344)
function reverseString(s) {
  let left = 0, right = s.length - 1;
  while (left < right) {
    [s[left], s[right]] = [s[right], s[left]];
    left++;
    right--;
  }
  return s;
}

// 4. Container With Most Water (LeetCode 11)
function maxArea(height) {
  let left = 0, right = height.length - 1;
  let maxArea = 0;
  while (left < right) {
    const area = (right - left) * Math.min(height[left], height[right]);
    maxArea = Math.max(maxArea, area);
    if (height[left] < height[right]) left++;
    else right--;
  }
  return maxArea;
}

// 5. Remove Duplicates (LeetCode 26)
function removeDuplicates(nums) {
  let i = 0;
  for (let j = 1; j < nums.length; j++) {
    if (nums[j] !== nums[i]) {
      nums[++i] = nums[j];
    }
  }
  return i + 1;
}

// 6. Move Zeroes (LeetCode 283)
function moveZeroes(nums) {
  let pos = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      [nums[pos], nums[i]] = [nums[i], nums[pos]];
      pos++;
    }
  }
}

// 7. 3Sum (LeetCode 15)
function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < nums.length - 2; i++) {
    if (nums[i] > 0) break;
    if (i > 0 && nums[i] === nums[i - 1]) continue;

    let left = i + 1, right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  return result;
}

// 8. Sort Colors (LeetCode 75)
function sortColors(nums) {
  let p0 = 0, p2 = nums.length - 1;
  for (let i = 0; i <= p2; i++) {
    if (nums[i] === 0) {
      [nums[i], nums[p0]] = [nums[p0], nums[i]];
      p0++;
    } else if (nums[i] === 2) {
      [nums[i], nums[p2]] = [nums[p2], nums[i]];
      p2--;
      i--;
    }
  }
}

// 9. Palindrome Linked List (LeetCode 234) - uses slow/fast pointers
function isPalindromeList(head) {
  if (!head || !head.next) return true;

  // Find middle
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }

  // Reverse second half
  let prev = null;
  while (slow) {
    const next = slow.next;
    slow.next = prev;
    prev = slow;
    slow = next;
  }

  // Compare
  let first = head, second = prev;
  while (second) {
    if (first.val !== second.val) return false;
    first = first.next;
    second = second.next;
  }
  return true;
}

// 10. Merge Sorted Array (LeetCode 88)
function merge(nums1, m, nums2, n) {
  let p1 = m - 1, p2 = n - 1, p = m + n - 1;
  while (p1 >= 0 && p2 >= 0) {
    if (nums1[p1] > nums2[p2]) {
      nums1[p--] = nums1[p1--];
    } else {
      nums1[p--] = nums2[p2--];
    }
  }
  while (p2 >= 0) {
    nums1[p--] = nums2[p2--];
  }
}

console.log('Is Palindrome:', isPalindrome('A man, a plan, a canal: Panama'));
console.log('Two Sum:', twoSum([2, 7, 11, 15], 9));
console.log('Max Area:', maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]));
console.log('3Sum:', threeSum([-1, 0, 1, 2, -1, -4]));

module.exports = {
  isPalindrome,
  twoSum,
  reverseString,
  maxArea,
  removeDuplicates,
  moveZeroes,
  threeSum,
  sortColors,
  merge,
};
