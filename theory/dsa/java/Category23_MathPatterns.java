import java.util.*;

/**
 * Category 23: Mathematical Patterns
 */
public class Category23_MathPatterns {

    // 1. GCD (LeetCode 1071)
    static int gcd(int a, int b) {
        return b == 0 ? a : gcd(b, a % b);
    }

    // 2. Prime Number Check (LeetCode 1175)
    static boolean isPrime(int n) {
        if (n < 2) return false;
        if (n == 2) return true;
        if (n % 2 == 0) return false;
        for (int i = 3; i * i <= n; i += 2) {
            if (n % i == 0) return false;
        }
        return true;
    }

    // 3. Sieve of Eratosthenes (LeetCode 204)
    static int countPrimes(int n) {
        boolean[] isPrime = new boolean[n];
        Arrays.fill(isPrime, true);
        for (int i = 2; i * i < n; i++) {
            if (isPrime[i]) {
                for (int j = i * i; j < n; j += i) {
                    isPrime[j] = false;
                }
            }
        }
        int count = 0;
        for (int i = 2; i < n; i++) {
            if (isPrime[i]) count++;
        }
        return count;
    }

    // 4. Fast Power (LeetCode 50)
    static double myPow(double x, int n) {
        if (n == 0) return 1;
        long N = n;
        if (N < 0) {
            x = 1 / x;
            N = -N;
        }
        return fastPow(x, N);
    }

    static double fastPow(double x, long n) {
        if (n == 0) return 1;
        double half = fastPow(x, n / 2);
        if (n % 2 == 0) return half * half;
        return half * half * x;
    }

    public static void main(String[] args) {
        System.out.println("GCD: " + gcd(12, 8));
        System.out.println("Prime Count (10): " + countPrimes(10));
    }
}
