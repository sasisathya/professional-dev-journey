/**
 * Category 20: Trie (Prefix Tree) Patterns
 * JavaScript implementation - Dictionary, Auto-complete, IP validation
 */

class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (let char of word) {
      if (!(char in node.children)) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
  }

  search(word) {
    let node = this.root;
    for (let char of word) {
      if (!(char in node.children)) return false;
      node = node.children[char];
    }
    return node.isEndOfWord;
  }

  startsWith(prefix) {
    let node = this.root;
    for (let char of prefix) {
      if (!(char in node.children)) return false;
      node = node.children[char];
    }
    return true;
  }

  getAllWordsStartingWith(prefix) {
    const words = [];
    let node = this.root;

    for (let char of prefix) {
      if (!(char in node.children)) return words;
      node = node.children[char];
    }

    const dfs = (node, currentWord) => {
      if (node.isEndOfWord) words.push(currentWord);
      for (let char in node.children) {
        dfs(node.children[char], currentWord + char);
      }
    };

    dfs(node, prefix);
    return words;
  }
}

// 1. Implement Trie (LeetCode 208)
function implementTrie() {
  return new Trie();
}

// 2. Add and Search Word (LeetCode 211)
class WordDictionary {
  constructor() {
    this.root = new TrieNode();
  }

  addWord(word) {
    let node = this.root;
    for (let char of word) {
      if (!(char in node.children)) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
  }

  search(word) {
    const dfs = (node, index) => {
      if (index === word.length) return node.isEndOfWord;

      const char = word[index];
      if (char === '.') {
        for (let key in node.children) {
          if (dfs(node.children[key], index + 1)) return true;
        }
        return false;
      } else {
        if (!(char in node.children)) return false;
        return dfs(node.children[char], index + 1);
      }
    };

    return dfs(this.root, 0);
  }
}

// 3. Longest Word in Dictionary (LeetCode 720)
function longestWord(words) {
  const trie = new Trie();
  words.forEach(w => trie.insert(w));

  let result = '';
  for (let word of words) {
    let node = trie.root;
    let valid = true;

    for (let char of word) {
      if (!(char in node.children) || !node.children[char].isEndOfWord) {
        valid = false;
        break;
      }
      node = node.children[char];
    }

    if (valid && word.length > result.length) {
      result = word;
    }
  }

  return result;
}

// 4. Word Search II (LeetCode 212)
function findWords(board, words) {
  const trie = new Trie();
  words.forEach(w => trie.insert(w));

  const result = [];
  const m = board.length, n = board[0].length;

  const dfs = (i, j, node, word) => {
    if (!node || !(board[i][j] in node.children)) return;

    const char = board[i][j];
    const nextNode = node.children[char];
    const newWord = word + char;

    if (nextNode.isEndOfWord) {
      result.push(newWord);
      nextNode.isEndOfWord = false;
    }

    const original = board[i][j];
    board[i][j] = '#';

    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (let [di, dj] of dirs) {
      const ni = i + di, nj = j + dj;
      if (ni >= 0 && ni < m && nj >= 0 && nj < n && board[ni][nj] !== '#') {
        dfs(ni, nj, nextNode, newWord);
      }
    }

    board[i][j] = original;
  };

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      dfs(i, j, trie.root, '');
    }
  }

  return result;
}

// 5. Valid IP Addresses (LeetCode 468)
function validIPAddress(IP) {
  if (!IP) return "Neither";

  if (IP.includes('.')) {
    const parts = IP.split('.');
    if (parts.length !== 4) return "Neither";

    for (let part of parts) {
      if (part === '' || part.length > 3) return "Neither";
      if (part[0] === '0' && part.length > 1) return "Neither";
      const num = parseInt(part);
      if (isNaN(num) || num < 0 || num > 255) return "Neither";
    }
    return "IPv4";
  }

  if (IP.includes(':')) {
    const parts = IP.split(':');
    if (parts.length !== 8) return "Neither";

    for (let part of parts) {
      if (part === '' || part.length > 4) return "Neither";
      if (!/^[0-9a-fA-F]+$/.test(part)) return "Neither";
    }
    return "IPv6";
  }

  return "Neither";
}

// 6. Autocomplete System (LeetCode 642)
class AutocompleteSystem {
  constructor(sentences, times) {
    this.trie = new Trie();
    this.freqMap = new Map();
    this.currentPrefix = '';

    for (let i = 0; i < sentences.length; i++) {
      this.trie.insert(sentences[i]);
      this.freqMap.set(sentences[i], times[i]);
    }
  }

  input(c) {
    if (c === '#') {
      this.trie.insert(this.currentPrefix);
      this.freqMap.set(this.currentPrefix, (this.freqMap.get(this.currentPrefix) || 0) + 1);
      this.currentPrefix = '';
      return [];
    }

    this.currentPrefix += c;
    const candidates = this.trie.getAllWordsStartingWith(this.currentPrefix);
    candidates.sort((a, b) => {
      const freqDiff = (this.freqMap.get(b) || 0) - (this.freqMap.get(a) || 0);
      return freqDiff !== 0 ? freqDiff : a.localeCompare(b);
    });

    return candidates.slice(0, 3);
  }
}

// 7. Alien Dictionary (LeetCode 269) - Trie variant
function alienOrderTrie(words) {
  const trie = new Trie();
  const graph = new Map();
  const inDegree = new Map();

  for (let word of words) {
    for (let char of word) {
      if (!graph.has(char)) graph.set(char, []);
      if (!inDegree.has(char)) inDegree.set(char, 0);
    }
  }

  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i], w2 = words[i + 1];
    const minLen = Math.min(w1.length, w2.length);

    for (let j = 0; j < minLen; j++) {
      if (w1[j] !== w2[j]) {
        if (!graph.get(w1[j]).includes(w2[j])) {
          graph.get(w1[j]).push(w2[j]);
          inDegree.set(w2[j], inDegree.get(w2[j]) + 1);
        }
        break;
      }
    }
  }

  return '';
}

module.exports = {
  TrieNode,
  Trie,
  implementTrie,
  WordDictionary,
  longestWord,
  findWords,
  validIPAddress,
  AutocompleteSystem,
  alienOrderTrie,
};
