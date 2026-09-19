/**
 * Category 19: String Patterns
 * JavaScript implementation - Matching, Searching, Manipulation
 */

// 1. Valid Palindrome (LeetCode 125)
function isPalindrome(s) {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}

// 2. Longest Palindromic Substring (LeetCode 5)
function longestPalindrome(s) {
  if (s.length < 2) return s;
  let start = 0, maxLen = 1;

  const expandAroundCenter = (left, right) => {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      left--;
      right++;
    }
    return right - left - 1;
  };

  for (let i = 0; i < s.length; i++) {
    const len1 = expandAroundCenter(i, i);
    const len2 = expandAroundCenter(i, i + 1);
    const len = Math.max(len1, len2);

    if (len > maxLen) {
      maxLen = len;
      start = i - Math.floor((len - 1) / 2);
    }
  }

  return s.substring(start, start + maxLen);
}

// 3. Longest Substring Without Repeating Characters (LeetCode 3)
function lengthOfLongestSubstring(s) {
  const charMap = {};
  let left = 0, maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    if (charMap[s[right]] !== undefined) {
      left = Math.max(left, charMap[s[right]] + 1);
    }
    charMap[s[right]] = right;
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}

// 4. KMP Algorithm (LeetCode 28 - Find Pattern)
function strStr(haystack, needle) {
  if (needle.length === 0) return 0;

  const buildKMP = (pattern) => {
    const lps = Array(pattern.length).fill(0);
    let len = 0, i = 1;

    while (i < pattern.length) {
      if (pattern[i] === pattern[len]) {
        lps[i] = ++len;
        i++;
      } else if (len > 0) {
        len = lps[len - 1];
      } else {
        lps[i] = 0;
        i++;
      }
    }
    return lps;
  };

  const lps = buildKMP(needle);
  let i = 0, j = 0;

  while (i < haystack.length) {
    if (haystack[i] === needle[j]) {
      i++;
      j++;
    } else {
      if (j > 0) {
        j = lps[j - 1];
      } else {
        i++;
      }
    }
    if (j === needle.length) return i - j;
  }

  return -1;
}

// 5. Regular Expression Matching (LeetCode 10)
function isMatch(s, p) {
  const dp = Array(s.length + 1).fill().map(() => Array(p.length + 1).fill(false));
  dp[0][0] = true;

  for (let j = 2; j <= p.length; j++) {
    if (p[j - 1] === '*') dp[0][j] = dp[0][j - 2];
  }

  for (let i = 1; i <= s.length; i++) {
    for (let j = 1; j <= p.length; j++) {
      if (p[j - 1] === '*') {
        dp[i][j] = dp[i][j - 2] || (p[j - 2] === '.' || p[j - 2] === s[i - 1]) && dp[i - 1][j];
      } else {
        dp[i][j] = (p[j - 1] === '.' || p[j - 1] === s[i - 1]) && dp[i - 1][j - 1];
      }
    }
  }

  return dp[s.length][p.length];
}

// 6. Wildcard Matching (LeetCode 44)
function isMatchWildcard(s, p) {
  const dp = Array(s.length + 1).fill().map(() => Array(p.length + 1).fill(false));
  dp[0][0] = true;

  for (let j = 1; j <= p.length; j++) {
    if (p[j - 1] === '*') dp[0][j] = dp[0][j - 1];
  }

  for (let i = 1; i <= s.length; i++) {
    for (let j = 1; j <= p.length; j++) {
      if (p[j - 1] === '*') {
        dp[i][j] = dp[i - 1][j] || dp[i][j - 1];
      } else {
        dp[i][j] = (p[j - 1] === '?' || p[j - 1] === s[i - 1]) && dp[i - 1][j - 1];
      }
    }
  }

  return dp[s.length][p.length];
}

// 7. String Encoding (LeetCode 271)
const encode = (strs) => {
  return strs.map(s => `${s.length}#${s}`).join('');
};

const decode = (s) => {
  const strs = [];
  let i = 0;
  while (i < s.length) {
    const j = s.indexOf('#', i);
    const len = parseInt(s.substring(i, j));
    strs.push(s.substring(j + 1, j + 1 + len));
    i = j + 1 + len;
  }
  return strs;
};

// 8. Unique Email Addresses (LeetCode 929)
function numUniqueEmails(emails) {
  const uniqueEmails = new Set();
  for (let email of emails) {
    const [local, domain] = email.split('@');
    const processed = local.split('+')[0].replace(/\./g, '') + '@' + domain;
    uniqueEmails.add(processed);
  }
  return uniqueEmails.size;
}

// 9. Valid Parentheses (LeetCode 20)
function isValidParentheses(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };

  for (let char of s) {
    if (map[char]) {
      if (stack.pop() !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }

  return stack.length === 0;
}

// 10. Reverse String (LeetCode 344)
function reverseString(s) {
  let left = 0, right = s.length - 1;
  while (left < right) {
    [s[left], s[right]] = [s[right], s[left]];
    left++;
    right--;
  }
  return s;
}

// 11. Word Pattern (LeetCode 290)
function wordPattern(pattern, s) {
  const words = s.split(' ');
  if (pattern.length !== words.length) return false;

  const charMap = {}, wordMap = {};
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    const word = words[i];

    if (charMap[char] && charMap[char] !== word) return false;
    if (wordMap[word] && wordMap[word] !== char) return false;

    charMap[char] = word;
    wordMap[word] = char;
  }
  return true;
}

// 12. Zigzag Conversion (LeetCode 6)
function convert(s, numRows) {
  if (numRows === 1 || s.length < numRows) return s;
  const rows = Array(numRows).fill().map(() => []);
  let row = 0, direction = 1;

  for (let char of s) {
    rows[row].push(char);
    if (row === 0) direction = 1;
    else if (row === numRows - 1) direction = -1;
    row += direction;
  }

  return rows.map(r => r.join('')).join('');
}

module.exports = {
  isPalindrome,
  longestPalindrome,
  lengthOfLongestSubstring,
  strStr,
  isMatch,
  isMatchWildcard,
  encode,
  decode,
  numUniqueEmails,
  isValidParentheses,
  reverseString,
  wordPattern,
  convert,
};
