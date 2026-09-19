/**
 * Category 3: Sliding Window Patterns
 * JavaScript implementation
 */

function longestSubstring(s) {
  const charMap = {};
  let maxLen = 0, left = 0;
  for (let right = 0; right < s.length; right++) {
    if (charMap[s[right]] !== undefined) {
      left = Math.max(left, charMap[s[right]] + 1);
    }
    charMap[s[right]] = right;
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}

function minWindow(s, t) {
  const need = {};
  const window = {};
  for (let char of t) need[char] = (need[char] || 0) + 1;

  let required = Object.keys(need).length;
  let formed = 0;
  let result = [Infinity, 0, 0];
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    window[char] = (window[char] || 0) + 1;
    if (need[char] && window[char] === need[char]) formed++;

    while (left <= right && formed === required) {
      if (right - left + 1 < result[0]) {
        result = [right - left + 1, left, right];
      }
      const leftChar = s[left];
      window[leftChar]--;
      if (need[leftChar] && window[leftChar] < need[leftChar]) formed--;
      left++;
    }
  }
  return result[0] === Infinity ? '' : s.substring(result[1], result[2] + 1);
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

console.log('Longest Substring:', longestSubstring('abcabcbb'));
console.log('Min Window:', minWindow('ADOBECODEBANC', 'ABC'));
console.log('Max Sliding Window:', maxSlidingWindow([1, 3, 1, 2, 0, 5], 3));

module.exports = { longestSubstring, minWindow, maxSlidingWindow };
