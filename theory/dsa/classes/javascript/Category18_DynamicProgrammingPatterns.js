/**
 * Category 18: Dynamic Programming Patterns
 * JavaScript implementation - Memoization, Tabulation, State Transitions
 */

// 1. Fibonacci (LeetCode 509)
function fib(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  return memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
}

// 2. Climbing Stairs (LeetCode 70)
function climbStairs(n) {
  if (n <= 2) return n;
  const dp = [0, 1, 2];
  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}

// 3. House Robber (LeetCode 198)
function rob(nums) {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];
  const dp = [nums[0]];
  dp[1] = Math.max(nums[0], nums[1]);

  for (let i = 2; i < nums.length; i++) {
    dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);
  }
  return dp[nums.length - 1];
}

// 4. House Robber II (LeetCode 213)
function robCircular(nums) {
  const robLinear = (houses) => {
    if (houses.length === 0) return 0;
    if (houses.length === 1) return houses[0];
    const dp = [houses[0], Math.max(houses[0], houses[1])];
    for (let i = 2; i < houses.length; i++) {
      dp[i] = Math.max(dp[i - 1], dp[i - 2] + houses[i]);
    }
    return dp[houses.length - 1];
  };

  if (nums.length === 1) return nums[0];
  return Math.max(robLinear(nums.slice(0, -1)), robLinear(nums.slice(1)));
}

// 5. Coin Change (LeetCode 322)
function coinChange(coins, amount) {
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    for (let coin of coins) {
      if (coin <= i) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}

// 6. Coin Change II (LeetCode 518)
function changeWays(amount, coins) {
  const dp = Array(amount + 1).fill(0);
  dp[0] = 1;

  for (let coin of coins) {
    for (let i = coin; i <= amount; i++) {
      dp[i] += dp[i - coin];
    }
  }

  return dp[amount];
}

// 7. Longest Increasing Subsequence (LeetCode 300)
function lengthOfLIS(nums) {
  if (nums.length === 0) return 0;
  const dp = Array(nums.length).fill(1);

  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }

  return Math.max(...dp);
}

// 8. Edit Distance (LeetCode 72)
function minDistance(word1, word2) {
  const m = word1.length, n = word2.length;
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

// 9. Maximum Subarray (LeetCode 53)
function maxSubArray(nums) {
  let maxCurrent = nums[0];
  let maxGlobal = nums[0];

  for (let i = 1; i < nums.length; i++) {
    maxCurrent = Math.max(nums[i], maxCurrent + nums[i]);
    maxGlobal = Math.max(maxGlobal, maxCurrent);
  }

  return maxGlobal;
}

// 10. Unique Paths (LeetCode 62)
function uniquePaths(m, n) {
  const dp = Array(m).fill().map(() => Array(n).fill(1));

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
    }
  }

  return dp[m - 1][n - 1];
}

// 11. Word Break (LeetCode 139)
function wordBreak(s, wordDict) {
  const dp = Array(s.length + 1).fill(false);
  dp[0] = true;

  for (let i = 1; i <= s.length; i++) {
    for (let word of wordDict) {
      if (i >= word.length && dp[i - word.length] && s.substring(i - word.length, i) === word) {
        dp[i] = true;
        break;
      }
    }
  }

  return dp[s.length];
}

// 12. Burst Balloons (LeetCode 312)
function maxCoins(nums) {
  const n = nums.length;
  const balloons = [1, ...nums, 1];
  const dp = Array(n + 2).fill().map(() => Array(n + 2).fill(0));

  for (let len = 1; len <= n; len++) {
    for (let left = 1; left <= n - len + 1; left++) {
      const right = left + len - 1;
      for (let k = left; k <= right; k++) {
        const coins = balloons[left - 1] * balloons[k] * balloons[right + 1];
        dp[left][right] = Math.max(dp[left][right], coins + dp[left][k - 1] + dp[k + 1][right]);
      }
    }
  }

  return dp[1][n];
}

module.exports = {
  fib,
  climbStairs,
  rob,
  robCircular,
  coinChange,
  changeWays,
  lengthOfLIS,
  minDistance,
  maxSubArray,
  uniquePaths,
  wordBreak,
  maxCoins,
};
