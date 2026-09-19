/**
 * Category 23: Math Patterns
 * JavaScript implementation - Number theory, GCD, Primes, Combinatorics
 */

// 1. Greatest Common Divisor (GCD)
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

// 2. Least Common Multiple (LCM)
function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

// 3. Prime Number Check
function isPrime(n) {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;

  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

// 4. Sieve of Eratosthenes (LeetCode 204)
function countPrimes(n) {
  if (n <= 2) return 0;

  const isPrimeArr = Array(n).fill(true);
  isPrimeArr[0] = isPrimeArr[1] = false;

  for (let i = 2; i * i < n; i++) {
    if (isPrimeArr[i]) {
      for (let j = i * i; j < n; j += i) {
        isPrimeArr[j] = false;
      }
    }
  }

  return isPrimeArr.filter(Boolean).length;
}

// 5. Factorial
function factorial(n) {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// 6. Combination (nCr)
function combination(n, r) {
  if (r > n) return 0;
  if (r === 0 || r === n) return 1;
  return factorial(n) / (factorial(r) * factorial(n - r));
}

// 7. Permutation (nPr)
function permutation(n, r) {
  if (r > n) return 0;
  return factorial(n) / factorial(n - r);
}

// 8. Power (LeetCode 50 - Pow(x, n))
function pow(x, n) {
  if (n < 0) {
    x = 1 / x;
    n = -n;
  }

  let result = 1;
  while (n > 0) {
    if (n % 2 === 1) {
      result *= x;
    }
    x *= x;
    n = Math.floor(n / 2);
  }

  return result;
}

// 9. Palindrome Number (LeetCode 9)
function isPalindromeNumber(x) {
  if (x < 0) return false;
  let original = x, reversed = 0;

  while (x > 0) {
    reversed = reversed * 10 + (x % 10);
    x = Math.floor(x / 10);
  }

  return original === reversed;
}

// 10. Happy Number (LeetCode 202)
function isHappyNumber(n) {
  const seen = new Set();

  while (n !== 1 && !seen.has(n)) {
    seen.add(n);
    let sum = 0;
    while (n > 0) {
      const digit = n % 10;
      sum += digit * digit;
      n = Math.floor(n / 10);
    }
    n = sum;
  }

  return n === 1;
}

// 11. Perfect Square (LeetCode 367)
function isPerfectSquare(num) {
  if (num < 1) return false;
  let left = 1, right = num;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const square = mid * mid;

    if (square === num) return true;
    else if (square < num) left = mid + 1;
    else right = mid - 1;
  }

  return false;
}

// 12. Ugly Number (LeetCode 263)
function isUglyNumber(n) {
  if (n <= 0) return false;

  const factors = [2, 3, 5];
  for (let factor of factors) {
    while (n % factor === 0) {
      n /= factor;
    }
  }

  return n === 1;
}

// 13. nth Ugly Number (LeetCode 264)
function nthUglyNumber(n) {
  const dp = [1];
  let i2 = 0, i3 = 0, i5 = 0;

  for (let i = 1; i < n; i++) {
    const next2 = dp[i2] * 2;
    const next3 = dp[i3] * 3;
    const next5 = dp[i5] * 5;

    const nextUgly = Math.min(next2, next3, next5);
    dp.push(nextUgly);

    if (nextUgly === next2) i2++;
    if (nextUgly === next3) i3++;
    if (nextUgly === next5) i5++;
  }

  return dp[n - 1];
}

// 14. Plus One (LeetCode 66)
function plusOne(digits) {
  for (let i = digits.length - 1; i >= 0; i--) {
    if (digits[i] < 9) {
      digits[i]++;
      return digits;
    }
    digits[i] = 0;
  }

  digits.unshift(1);
  return digits;
}

// 15. Minimum Unique Array Sum (LeetCode 1593)
function minIncrementForUnique(nums) {
  nums.sort((a, b) => a - b);
  let moves = 0;

  for (let i = 1; i < nums.length; i++) {
    if (nums[i] <= nums[i - 1]) {
      const target = nums[i - 1] + 1;
      moves += target - nums[i];
      nums[i] = target;
    }
  }

  return moves;
}

module.exports = {
  gcd,
  lcm,
  isPrime,
  countPrimes,
  factorial,
  combination,
  permutation,
  pow,
  isPalindromeNumber,
  isHappyNumber,
  isPerfectSquare,
  isUglyNumber,
  nthUglyNumber,
  plusOne,
  minIncrementForUnique,
};
