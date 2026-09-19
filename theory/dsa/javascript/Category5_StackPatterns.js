/**
 * Category 5: Stack Patterns
 * JavaScript implementation
 */

function isValid(s) {
  const stack = [];
  const pairs = { ')': '(', '}': '{', ']': '[' };
  for (let char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (!stack.length || stack[stack.length - 1] !== pairs[char]) return false;
      stack.pop();
    }
  }
  return stack.length === 0;
}

function dailyTemperatures(temperatures) {
  const result = new Array(temperatures.length).fill(0);
  const stack = [];

  for (let i = temperatures.length - 1; i >= 0; i--) {
    while (stack.length && temperatures[stack[stack.length - 1]] <= temperatures[i]) {
      stack.pop();
    }
    if (stack.length) result[i] = stack[stack.length - 1] - i;
    stack.push(i);
  }
  return result;
}

function nextGreaterElement(nums1, nums2) {
  const map = {};
  const stack = [];

  for (let num of nums2) {
    while (stack.length && stack[stack.length - 1] < num) {
      map[stack.pop()] = num;
    }
    stack.push(num);
  }

  return nums1.map(num => map[num] ?? -1);
}

function largestRectangle(heights) {
  const stack = [];
  let maxArea = 0;

  for (let i = 0; i < heights.length; i++) {
    while (stack.length && heights[stack[stack.length - 1]] > heights[i]) {
      const h = heights[stack.pop()];
      const w = stack.length ? i - stack[stack.length - 1] - 1 : i;
      maxArea = Math.max(maxArea, h * w);
    }
    stack.push(i);
  }

  while (stack.length) {
    const h = heights[stack.pop()];
    const w = stack.length ? heights.length - stack[stack.length - 1] - 1 : heights.length;
    maxArea = Math.max(maxArea, h * w);
  }
  return maxArea;
}

console.log('Valid Parentheses:', isValid('()[]{}'));
console.log('Daily Temperatures:', dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73]));
console.log('Largest Rectangle:', largestRectangle([2, 1, 5, 6, 2, 3]));

module.exports = { isValid, dailyTemperatures, nextGreaterElement, largestRectangle };
