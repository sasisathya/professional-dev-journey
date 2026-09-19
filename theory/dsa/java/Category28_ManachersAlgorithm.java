import java.util.*;

/**
 * Category 28: Manacher's Algorithm
 * O(n) longest palindrome substring (vs O(n^2) brute force)
 * CRITICAL for string interview questions
 */
public class Category28_ManachersAlgorithm {

    // 1. Manacher's Algorithm - Find all palindromes in O(n)
    static class ManachersAlgorithm {
        String s;
        String processed;
        int[] p; // p[i] = length of palindrome centered at i

        ManachersAlgorithm(String s) {
            this.s = s;
            preprocess();
            findPalindromes();
        }

        void preprocess() {
            // Add # between characters to handle even-length palindromes
            StringBuilder sb = new StringBuilder("^#");
            for (char c : s.toCharArray()) {
                sb.append(c).append("#");
            }
            sb.append("$");
            processed = sb.toString();
            p = new int[processed.length()];
        }

        void findPalindromes() {
            int center = 0, right = 0;

            for (int i = 1; i < processed.length() - 1; i++) {
                int mirror = 2 * center - i;

                if (i < right) {
                    p[i] = Math.min(right - i, p[mirror]);
                }

                // Try to expand
                while (processed.charAt(i + p[i] + 1) == processed.charAt(i - p[i] - 1)) {
                    p[i]++;
                }

                // Update center and right
                if (i + p[i] > right) {
                    center = i;
                    right = i + p[i];
                }
            }
        }

        String longestPalindrome() {
            int maxLen = 0, centerIndex = 0;
            for (int i = 1; i < p.length - 1; i++) {
                if (p[i] > maxLen) {
                    maxLen = p[i];
                    centerIndex = i;
                }
            }

            // Extract from original string
            int start = (centerIndex - maxLen) / 2;
            return s.substring(start, start + maxLen);
        }

        int countAllPalindromes() {
            int count = 0;
            for (int i = 1; i < p.length - 1; i++) {
                count += (p[i] + 1) / 2;
            }
            return count;
        }

        int[] getAllPalindromePositions() {
            List<Integer> positions = new ArrayList<>();
            for (int i = 1; i < p.length - 1; i++) {
                if (p[i] > 0) {
                    positions.add((i - p[i]) / 2);
                }
            }
            int[] result = new int[positions.size()];
            for (int i = 0; i < positions.size(); i++) {
                result[i] = positions.get(i);
            }
            return result;
        }
    }

    // LeetCode 5: Longest Palindromic Substring - Optimized O(n)
    static String longestPalindrome(String s) {
        if (s == null || s.length() < 1) return "";
        ManachersAlgorithm ma = new ManachersAlgorithm(s);
        return ma.longestPalindrome();
    }

    // LeetCode 647: Palindromic Substrings
    static int countSubstrings(String s) {
        ManachersAlgorithm ma = new ManachersAlgorithm(s);
        return ma.countAllPalindromes();
    }

    // Application: Longest Palindromic Prefix
    static String longestPalindromicPrefix(String s) {
        String combined = s + "#" + new StringBuilder(s).reverse();
        ManachersAlgorithm ma = new ManachersAlgorithm(combined);
        return s.substring(0, (combined.length() - s.length() - 1) / 2);
    }

    // Application: Palindrome Decomposition
    static int minCutsForPalindromes(String s) {
        int n = s.length();
        int[] cuts = new int[n];
        ManachersAlgorithm ma = new ManachersAlgorithm(s);

        for (int i = 0; i < n; i++) {
            cuts[i] = i; // worst case: cut at each position
            for (int j = 0; j <= i; j++) {
                // Check if s[j..i] is palindrome
                // Can use ma.p array for fast lookup
                if (isPalindrome(s, j, i)) {
                    cuts[i] = (j == 0) ? 0 : Math.min(cuts[i], cuts[j - 1] + 1);
                }
            }
        }
        return cuts[n - 1];
    }

    static boolean isPalindrome(String s, int l, int r) {
        while (l < r) {
            if (s.charAt(l++) != s.charAt(r--)) return false;
        }
        return true;
    }

    // Application: Even/Odd Palindrome Separate Check
    static class EvenOddPalindromeCheck {
        String s;
        int[] oddP, evenP; // separate arrays for odd and even length

        EvenOddPalindromeCheck(String s) {
            this.s = s;
            findOddPalindromes();
            findEvenPalindromes();
        }

        void findOddPalindromes() {
            // Palindromes with single character center
            oddP = new int[s.length()];
            int center = 0, right = -1;

            for (int i = 0; i < s.length(); i++) {
                int mirror = 2 * center - i;
                if (i <= right) {
                    oddP[i] = Math.min(right - i + 1, oddP[mirror]);
                }

                while (i + oddP[i] < s.length() && i - oddP[i] >= 0 &&
                       s.charAt(i + oddP[i]) == s.charAt(i - oddP[i])) {
                    oddP[i]++;
                }

                if (i + oddP[i] - 1 > right) {
                    center = i;
                    right = i + oddP[i] - 1;
                }
            }
        }

        void findEvenPalindromes() {
            // Palindromes with two character center
            evenP = new int[s.length()];
            int center = 0, right = -1;

            for (int i = 0; i < s.length() - 1; i++) {
                int mirror = 2 * center - i;
                if (i <= right) {
                    evenP[i] = Math.min(right - i, evenP[mirror]);
                }

                while (i + evenP[i] + 1 < s.length() && i - evenP[i] >= 0 &&
                       s.charAt(i + evenP[i] + 1) == s.charAt(i - evenP[i])) {
                    evenP[i]++;
                }

                if (i + evenP[i] > right) {
                    center = i;
                    right = i + evenP[i];
                }
            }
        }

        int getOddPalindromeLength(int center) {
            return oddP[center];
        }

        int getEvenPalindromeLength(int center) {
            return evenP[center];
        }
    }

    // Application: Maximum Length Palindrome for Each Position
    static int[] maxPalindromeLengthFromEachPos(String s) {
        int[] result = new int[s.length()];
        ManachersAlgorithm ma = new ManachersAlgorithm(s);

        for (int i = 0; i < s.length(); i++) {
            // Check palindromes starting at i
            int maxLen = 1;
            for (int j = i; j < s.length(); j++) {
                if (isPalindrome(s, i, j)) {
                    maxLen = j - i + 1;
                }
            }
            result[i] = maxLen;
        }
        return result;
    }

    public static void main(String[] args) {
        String test = "babad";
        ManachersAlgorithm ma = new ManachersAlgorithm(test);

        System.out.println("String: " + test);
        System.out.println("Longest palindrome: " + ma.longestPalindrome());
        System.out.println("Count of palindromes: " + ma.countAllPalindromes());

        test = "abacabad";
        System.out.println("\nString: " + test);
        System.out.println("Longest palindromic substring: " + longestPalindrome(test));
        System.out.println("Total palindromic substrings: " + countSubstrings(test));
    }
}
