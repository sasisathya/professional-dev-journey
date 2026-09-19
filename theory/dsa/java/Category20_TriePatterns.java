import java.util.*;

/**
 * Category 20: Trie Patterns
 */
public class Category20_TriePatterns {

    static class TrieNode {
        Map<Character, TrieNode> children = new HashMap<>();
        boolean isWord = false;
    }

    static class Trie {
        TrieNode root = new TrieNode();

        void insert(String word) {
            TrieNode node = root;
            for (char c : word.toCharArray()) {
                node = node.children.computeIfAbsent(c, k -> new TrieNode());
            }
            node.isWord = true;
        }

        boolean search(String word) {
            TrieNode node = searchNode(word);
            return node != null && node.isWord;
        }

        boolean startsWith(String prefix) {
            return searchNode(prefix) != null;
        }

        TrieNode searchNode(String word) {
            TrieNode node = root;
            for (char c : word.toCharArray()) {
                if (!node.children.containsKey(c)) return null;
                node = node.children.get(c);
            }
            return node;
        }
    }

    // Word Search II (LeetCode 212)
    static List<String> findWords(char[][] board, String[] words) {
        Trie trie = new Trie();
        for (String word : words) trie.insert(word);

        Set<String> result = new HashSet<>();
        for (int i = 0; i < board.length; i++) {
            for (int j = 0; j < board[0].length; j++) {
                dfs(board, trie.root, i, j, result, "");
            }
        }
        return new ArrayList<>(result);
    }

    static void dfs(char[][] board, TrieNode node, int i, int j, Set<String> result, String current) {
        if (i < 0 || i >= board.length || j < 0 || j >= board[0].length) return;
        char c = board[i][j];
        if (c == '*' || !node.children.containsKey(c)) return;

        node = node.children.get(c);
        current += c;
        if (node.isWord) result.add(current);

        board[i][j] = '*';
        dfs(board, node, i + 1, j, result, current);
        dfs(board, node, i - 1, j, result, current);
        dfs(board, node, i, j + 1, result, current);
        dfs(board, node, i, j - 1, result, current);
        board[i][j] = c;
    }

    public static void main(String[] args) {
        Trie trie = new Trie();
        trie.insert("hello");
        System.out.println("Search hello: " + trie.search("hello"));
    }
}
