# Trie vs HashMap for String Problems

Both let you look up strings fast. The difference is **whether you need to reason about prefixes**.

## Core Difference

| | Trie (Prefix Tree) | HashMap |
|---|---|---|
| **Definition** | A tree where each path from the root spells out a prefix; nodes are shared between words with common prefixes. | Hash-based key-value lookup; each string is one opaque key, hashed as a whole. |
| **Exact-match lookup** | O(length of word) | O(length of word) to hash — about the same |
| **Prefix queries** ("all words starting with...") | O(length of prefix) to find the node, then traverse the subtree — natural fit. | Not supported directly — would need to scan every key checking `startsWith()`, O(n · length). |
| **Memory** | Shares memory across common prefixes — efficient for large dictionaries with overlapping words. | Each string stored independently — no sharing. |
| **Signal words** | "autocomplete", "starts with", "longest common prefix", "word search on a board with a dictionary" | "exact word lookup", "is this word in the dictionary", frequency counting, anagram grouping |

## Decision Checklist
1. Does the problem ever ask "give me all words with prefix X" or "does any word start with X"? → **Trie**.
2. Is it purely "is this exact string present / what's its count / group by exact match"? → **HashMap** — simpler, no need to build a tree.
3. Are you doing a **board search** (like Boggle/Word Search II) against a whole dictionary, where you want to prune a DFS early if no word starts with the path so far? → **Trie** — this is its killer use case, because it lets you abandon a search branch the instant no dictionary word matches the prefix explored so far.

---

## Example: Autocomplete-Style Prefix Search — Trie vs HashMap

```java
import java.util.*;

public class TrieVsHashMapPrefix {

    // ---------- Trie approach: natural fit for prefix queries ----------
    public static class Trie {
        static class Node {
            Map<Character, Node> children = new HashMap<>();
            boolean isWord = false;
        }

        private final Node root = new Node();

        public void insert(String word) {
            Node current = root;
            for (char c : word.toCharArray()) {
                current = current.children.computeIfAbsent(c, k -> new Node());
            }
            current.isWord = true;
        }

        // O(prefix length) to reach the node, then collect the subtree — never scans unrelated words
        public List<String> wordsWithPrefix(String prefix) {
            Node current = root;
            for (char c : prefix.toCharArray()) {
                current = current.children.get(c);
                if (current == null) return List.of(); // no word has this prefix at all
            }
            List<String> results = new ArrayList<>();
            collect(current, new StringBuilder(prefix), results);
            return results;
        }

        private void collect(Node node, StringBuilder path, List<String> results) {
            if (node.isWord) results.add(path.toString());
            for (Map.Entry<Character, Node> entry : node.children.entrySet()) {
                path.append(entry.getKey());
                collect(entry.getValue(), path, results);
                path.deleteCharAt(path.length() - 1);
            }
        }
    }

    // ---------- HashMap approach: works, but must scan every key for prefix queries ----------
    public static List<String> wordsWithPrefixHashMap(Set<String> dictionary, String prefix) {
        List<String> results = new ArrayList<>();
        for (String word : dictionary) {
            if (word.startsWith(prefix)) { // O(length) per word, but you check EVERY word — no pruning
                results.add(word);
            }
        }
        return results;
    }

    public static void main(String[] args) {
        String[] words = {"cat", "car", "card", "care", "dog", "do"};

        Trie trie = new Trie();
        Set<String> dictionary = new HashSet<>();
        for (String w : words) {
            trie.insert(w);
            dictionary.add(w);
        }

        System.out.println("Trie prefix 'car':    " + trie.wordsWithPrefix("car"));
        System.out.println("HashMap prefix 'car': " + wordsWithPrefixHashMap(dictionary, "car"));
        // Same result, but the Trie found it by walking 3 characters;
        // the HashMap approach checked EVERY word in the dictionary.
    }
}
```

## Where HashMap Is Simply the Right Tool: Exact-Match Problems

```java
import java.util.HashMap;
import java.util.Map;

public class HashMapExactMatch {

    // "Valid Anagram" — pure exact-character-frequency comparison, no prefix logic at all.
    // Building a Trie here would add complexity with zero benefit.
    public static boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;

        Map<Character, Integer> counts = new HashMap<>();
        for (char c : s.toCharArray()) counts.merge(c, 1, Integer::sum);
        for (char c : t.toCharArray()) {
            counts.merge(c, -1, Integer::sum);
        }
        for (int count : counts.values()) {
            if (count != 0) return false;
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println(isAnagram("anagram", "nagaram")); // true
        System.out.println(isAnagram("rat", "car"));          // false
    }
}
```

## Pick Trie when:
- The problem is fundamentally about prefixes (autocomplete, prefix search, board word search against a dictionary).

## Pick HashMap when:
- You only need exact-match lookups, frequency counts, or grouping — no prefix reasoning required.
