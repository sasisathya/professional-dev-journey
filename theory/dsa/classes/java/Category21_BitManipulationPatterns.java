import java.util.*;

/**
 * Category 21: Bit Manipulation Patterns
 */
public class Category21_BitManipulationPatterns {

    // 1. Single Number (LeetCode 136)
    static int singleNumber(int[] nums) {
        int result = 0;
        for (int num : nums) result ^= num;
        return result;
    }

    // 2. Number of 1 Bits (LeetCode 191)
    static int hammingWeight(int n) {
        int count = 0;
        while (n != 0) {
            count += n & 1;
            n >>>= 1;
        }
        return count;
    }

    // 3. Power of Two (LeetCode 231)
    static boolean isPowerOfTwo(int n) {
        return n > 0 && (n & (n - 1)) == 0;
    }

    // 4. Reverse Bits (LeetCode 190)
    static int reverseBits(int n) {
        int result = 0;
        for (int i = 0; i < 32; i++) {
            result = (result << 1) | (n & 1);
            n >>>= 1;
        }
        return result;
    }

    // 5. Missing Number (LeetCode 268)
    static int missingNumber(int[] nums) {
        int n = nums.length;
        int expected = n * (n + 1) / 2;
        int actual = Arrays.stream(nums).sum();
        return expected - actual;
    }

    // 6. Max XOR Pair (LeetCode 421)
    static int findMaximumXOR(int[] nums) {
        int maxXor = 0, mask = 0;
        for (int i = 30; i >= 0; i--) {
            mask |= (1 << i);
            Set<Integer> prefixes = new HashSet<>();
            for (int num : nums) {
                prefixes.add(num & mask);
            }
            int temp = maxXor | (1 << i);
            for (int prefix : prefixes) {
                if (prefixes.contains(temp ^ prefix)) {
                    maxXor = temp;
                    break;
                }
            }
        }
        return maxXor;
    }

    public static void main(String[] args) {
        System.out.println("Single: " + singleNumber(new int[]{1,1,2}));
        System.out.println("Hamming: " + hammingWeight(11));
    }
}
