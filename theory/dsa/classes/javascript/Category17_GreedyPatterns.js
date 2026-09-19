/**
 * Category 17: Greedy Patterns
 * JavaScript implementation - Activity selection, interval scheduling, optimal substructure
 */

// 1. Activity Selection Problem
function activitySelection(activities) {
  activities.sort((a, b) => a[1] - b[1]);
  const selected = [activities[0]];

  for (let i = 1; i < activities.length; i++) {
    if (activities[i][0] >= selected[selected.length - 1][1]) {
      selected.push(activities[i]);
    }
  }
  return selected;
}

// 2. Minimum Number of Arrows to Burst Balloons (LeetCode 452)
function findMinArrowShots(points) {
  if (points.length === 0) return 0;

  points.sort((a, b) => {
    if (a[0] === b[0]) return a[1] - b[1];
    return a[0] < b[0] ? -1 : 1;
  });

  let arrows = 1;
  let lastEnd = points[0][1];

  for (let i = 1; i < points.length; i++) {
    if (points[i][0] > lastEnd) {
      arrows++;
      lastEnd = points[i][1];
    } else {
      lastEnd = Math.min(lastEnd, points[i][1]);
    }
  }
  return arrows;
}

// 3. Jump Game (LeetCode 55)
function canJump(nums) {
  let maxReach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false;
    maxReach = Math.max(maxReach, i + nums[i]);
  }
  return true;
}

// 4. Jump Game II (LeetCode 45)
function jump(nums) {
  if (nums.length <= 1) return 0;
  let jumps = 0;
  let currentEnd = 0;
  let farthest = 0;

  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === currentEnd) {
      jumps++;
      currentEnd = farthest;
    }
  }
  return jumps;
}

// 5. Gas Station (LeetCode 134)
function canCompleteCircuit(gas, cost) {
  let totalGas = 0, totalCost = 0, currentGas = 0, start = 0;

  for (let i = 0; i < gas.length; i++) {
    totalGas += gas[i];
    totalCost += cost[i];
    currentGas += gas[i] - cost[i];

    if (currentGas < 0) {
      start = i + 1;
      currentGas = 0;
    }
  }

  return totalGas >= totalCost ? start : -1;
}

// 6. Largest Number (LeetCode 179)
function largestNumber(nums) {
  const strs = nums.map(String);
  strs.sort((a, b) => (b + a).localeCompare(a + b));

  if (strs[0] === '0') return '0';
  return strs.join('');
}

// 7. Merge Intervals (LeetCode 56)
function merge(intervals) {
  if (intervals.length === 0) return [];

  intervals.sort((a, b) => a[0] - b[0]);
  const result = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const last = result[result.length - 1];
    if (intervals[i][0] <= last[1]) {
      last[1] = Math.max(last[1], intervals[i][1]);
    } else {
      result.push(intervals[i]);
    }
  }
  return result;
}

// 8. Candy (LeetCode 135)
function candy(ratings) {
  const n = ratings.length;
  const candies = Array(n).fill(1);

  for (let i = 1; i < n; i++) {
    if (ratings[i] > ratings[i - 1]) {
      candies[i] = candies[i - 1] + 1;
    }
  }

  for (let i = n - 2; i >= 0; i--) {
    if (ratings[i] > ratings[i + 1]) {
      candies[i] = Math.max(candies[i], candies[i + 1] + 1);
    }
  }

  return candies.reduce((a, b) => a + b);
}

// 9. Lemonade Change (LeetCode 860)
function lemonadeChange(bills) {
  let fives = 0, tens = 0;

  for (let bill of bills) {
    if (bill === 5) {
      fives++;
    } else if (bill === 10) {
      if (fives === 0) return false;
      fives--;
      tens++;
    } else {
      if (tens > 0 && fives > 0) {
        tens--;
        fives--;
      } else if (fives >= 3) {
        fives -= 3;
      } else {
        return false;
      }
    }
  }
  return true;
}

// 10. Task Scheduler (LeetCode 621)
function leastInterval(tasks, n) {
  const count = Array(26).fill(0);
  for (let task of tasks) {
    count[task.charCodeAt(0) - 65]++;
  }

  const maxFreq = Math.max(...count);
  const maxCount = count.filter(c => c === maxFreq).length;

  return Math.max(tasks.length, (maxFreq - 1) * (n + 1) + maxCount);
}

// 11. Assign Cookies (LeetCode 455)
function findContentChildren(g, s) {
  g.sort((a, b) => a - b);
  s.sort((a, b) => a - b);

  let j = 0;
  for (let i = 0; i < g.length && j < s.length; i++) {
    while (j < s.length && s[j] < g[i]) {
      j++;
    }
    if (j < s.length) {
      j++;
    } else {
      return i;
    }
  }
  return g.length;
}

// 12. Reconstructing Sequence (Longest Increasing Subsequence based)
function isSequence(org, seqs) {
  const pos = new Map();
  org.forEach((num, i) => pos.set(num, i));

  for (let seq of seqs) {
    for (let i = 1; i < seq.length; i++) {
      if (pos.get(seq[i]) <= pos.get(seq[i - 1])) {
        return false;
      }
    }
  }
  return true;
}

module.exports = {
  activitySelection,
  findMinArrowShots,
  canJump,
  jump,
  canCompleteCircuit,
  largestNumber,
  merge,
  candy,
  lemonadeChange,
  leastInterval,
  findContentChildren,
  isSequence,
};
