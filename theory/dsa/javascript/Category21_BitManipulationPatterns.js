/**
 * Category 21: Bit Manipulation Patterns
 * JavaScript implementation - XOR, Masks, Bit tricks
 */

// 1. Single Number (LeetCode 136)
function singleNumber(nums) {
  let result = 0;
  for (let num of nums) {
    result ^= num;
  }
  return result;
}

// 2. Single Number II (LeetCode 137)
function singleNumberII(nums) {
  const ones = new Map();
  for (let num of nums) {
    ones.set(num, (ones.get(num) || 0) + 1);
  }

  for (let [num, count] of ones) {
    if (count === 1) return num;
  }
}

// 3. Single Number III (LeetCode 260)
function singleNumberIII(nums) {
  let xor = 0;
  for (let num of nums) {
    xor ^= num;
  }

  let diff = xor & -xor;
  let num1 = 0, num2 = 0;

  for (let num of nums) {
    if ((num & diff) === 0) {
      num1 ^= num;
    } else {
      num2 ^= num;
    }
  }

  return [num1, num2];
}

// 4. Number of 1 Bits (LeetCode 191)
function hammingWeight(n) {
  let count = 0;
  while (n) {
    n &= n - 1;
    count++;
  }
  return count;
}

// 5. Reverse Bits (LeetCode 190)
function reverseBits(n) {
  let result = 0;
  for (let i = 0; i < 32; i++) {
    result = (result << 1) | (n & 1);
    n >>>= 1;
  }
  return result >>> 0;
}

// 6. Missing Number (LeetCode 268)
function missingNumber(nums) {
  let xor = 0;
  for (let i = 0; i <= nums.length; i++) {
    xor ^= i;
  }

  for (let num of nums) {
    xor ^= num;
  }

  return xor;
}

// 7. Power of Two (LeetCode 231)
function isPowerOfTwo(n) {
  if (n <= 0) return false;
  return (n & (n - 1)) === 0;
}

// 8. Maximum Product of Word Lengths (LeetCode 318)
function maxProduct(words) {
  const masks = words.map(word => {
    let mask = 0;
    for (let char of word) {
      mask |= 1 << (char.charCodeAt(0) - 97);
    }
    return mask;
  });

  let maxProd = 0;
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      if ((masks[i] & masks[j]) === 0) {
        maxProd = Math.max(maxProd, words[i].length * words[j].length);
      }
    }
  }

  return maxProd;
}

// 9. Majority Element (LeetCode 169 - Bit variant)
function majorityElementBit(nums) {
  const n = nums.length;
  let result = 0;

  for (let i = 0; i < 32; i++) {
    let count = 0;
    for (let num of nums) {
      if ((num & (1 << i)) !== 0) count++;
    }

    if (count > n / 2) {
      result |= (1 << i);
    }
  }

  return result;
}

// 10. Convert Number to Hexadecimal (LeetCode 405)
function toHex(num) {
  if (num === 0) return '0';
  const hex = '0123456789abcdef';
  let result = '';
  let n = num >>> 0;

  while (n > 0) {
    result = hex[n & 15] + result;
    n >>>= 4;
  }

  return result;
}

// 11. Binary Number in Linked List (LeetCode 1290)
function getDecimalValue(head) {
  let result = 0;
  while (head) {
    result = (result << 1) | head.val;
    head = head.next;
  }
  return result;
}

// 12. Count Number of Maximum Bitwise OR Subsets (LeetCode 2044)
function countMaxOrSubsets(nums) {
  let maxOr = 0;
  for (let num of nums) {
    maxOr |= num;
  }

  let count = 0;
  const dfs = (index, current) => {
    if (index === nums.length) {
      if (current === maxOr) count++;
      return;
    }

    dfs(index + 1, current | nums[index]);
    dfs(index + 1, current);
  };

  dfs(0, 0);
  return count;
}

module.exports = {
  singleNumber,
  singleNumberII,
  singleNumberIII,
  hammingWeight,
  reverseBits,
  missingNumber,
  isPowerOfTwo,
  maxProduct,
  majorityElementBit,
  toHex,
  getDecimalValue,
  countMaxOrSubsets,
};
