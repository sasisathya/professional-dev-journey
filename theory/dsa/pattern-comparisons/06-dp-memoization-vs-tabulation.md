# DP: Memoization (Top-Down) vs Tabulation (Bottom-Up)

Not a "different algorithm" — it's the **same** recurrence, implemented in two directions.
Knowing when to prefer each is a real interview signal of DP maturity.

## Core Difference

| | Memoization (Top-Down) | Tabulation (Bottom-Up) |
|---|---|---|
| **Definition** | Write the recursive solution naturally, cache results in a map/array so repeated subproblems return instantly. | Build a table iteratively from the smallest subproblems up to the final answer, no recursion. |
| **Direction** | Starts from the original problem, recurses down to base cases. | Starts from base cases, iterates up to the original problem. |
| **Computes unnecessary subproblems?** | No — only computes subproblems actually reached by recursion. | Sometimes yes — often fills the whole table even if some states are unreachable. |
| **Stack overflow risk?** | Yes, for deep recursion (e.g., n > ~10,000 without tail-call optimization, which Java doesn't have). | No — it's a loop. |
| **Space optimization** | Harder — cache is usually the full map/array. | Easier — often you only need the previous row/few previous states, so you can roll the array down to O(1) or O(k) space. |
| **Code shape** | Closer to the recursive definition — often easier to derive correctly on the first try. | Requires figuring out the right iteration order upfront — a bit more setup thinking. |

## Decision Checklist
1. Struggling to see the DP recurrence at all? Write the **recursive brute force first**, confirm it's correct, then add memoization. This is almost always the fastest path to a correct DP solution under time pressure.
2. Need to **optimize space** afterward (rolling array, O(1) instead of O(n))? Convert to **tabulation** — that transformation is much more natural bottom-up.
3. Is n potentially huge (recursion depth risk)? Prefer **tabulation** to avoid `StackOverflowError`.
4. Are many states in the table actually unreachable/unnecessary? **Memoization** avoids wasting time computing them.

---

## Example: Same Problem (Climbing Stairs — count ways to reach step n using 1 or 2 steps), Two Directions

```java
import java.util.HashMap;
import java.util.Map;

public class MemoizationVsTabulation {

    // ---------- Top-Down: Memoization ----------
    // Shape mirrors the recursive definition directly: f(n) = f(n-1) + f(n-2)
    public static long climbStairsMemo(int n, Map<Integer, Long> cache) {
        if (n <= 1) return 1;
        if (cache.containsKey(n)) return cache.get(n); // hit: skip recomputation entirely

        long ways = climbStairsMemo(n - 1, cache) + climbStairsMemo(n - 2, cache);
        cache.put(n, ways);
        return ways;
    }

    // ---------- Bottom-Up: Tabulation ----------
    // Build the table from step 0 up to n — no recursion, no stack risk.
    public static long climbStairsTabulation(int n) {
        if (n <= 1) return 1;
        long[] dp = new long[n + 1];
        dp[0] = 1;
        dp[1] = 1;
        for (int i = 2; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }
        return dp[n];
    }

    // ---------- Bottom-Up + Space Optimized ----------
    // Tabulation makes this rewrite obvious: we only ever need the last two values.
    public static long climbStairsOptimizedSpace(int n) {
        if (n <= 1) return 1;
        long prev2 = 1, prev1 = 1;
        for (int i = 2; i <= n; i++) {
            long current = prev1 + prev2;
            prev2 = prev1;
            prev1 = current;
        }
        return prev1;
    }

    public static void main(String[] args) {
        int n = 30;

        System.out.println("Memoization result:      " + climbStairsMemo(n, new HashMap<>()));
        System.out.println("Tabulation result:       " + climbStairsTabulation(n));
        System.out.println("Space-optimized result:  " + climbStairsOptimizedSpace(n));
        // All three: 1346269
    }
}
```

## Why This Matters in an Interview

If you're asked to optimize space *after* getting a correct DP solution, and you started with
memoization, converting to O(1) space is awkward — the recursive call stack doesn't map cleanly
to "just keep the last two values." If you'd started with tabulation, the interviewer's natural
follow-up ("can you reduce the space?") becomes a two-line change. Many candidates default to
memoization because it's easier to derive — that's fine as your first pass, just know the
tabulation form is what you convert to when asked to optimize.

## Pick Memoization (Top-Down) when:
- You're deriving the solution for the first time — it's the more natural way to translate a recurrence into code.
- Only a subset of possible states are actually reachable, so a full bottom-up table would waste work.

## Pick Tabulation (Bottom-Up) when:
- n is large and recursion depth is a real risk.
- You anticipate needing to space-optimize (rolling array) — set it up bottom-up from the start.
