# Greedy vs Dynamic Programming

This is the comparison that catches the most experienced engineers off guard, because greedy
*looks* like it should work — right up until it silently gives the wrong answer.

## Core Difference

| | Greedy | Dynamic Programming |
|---|---|---|
| **Definition** | At each step, make the choice that looks best **right now**, never reconsider it. | Explore/remember the results of subproblems; the final answer is built from optimal answers to smaller overlapping subproblems. |
| **Requires** | The **greedy-choice property**: a locally optimal choice is provably part of *some* globally optimal solution. | Optimal substructure + overlapping subproblems — no requirement that the locally-best choice is globally safe. |
| **Complexity** | Usually O(n) or O(n log n) | Usually O(n²), O(n·k), etc. — more expensive because it explores more of the state space |
| **Signal words** | "interval scheduling", "minimum number of platforms", problems where sorting + one pass provably works | "minimum/maximum number of ways", "coin change", "longest ...", any problem where you're tempted by greedy but a counter-example breaks it |
| **How to tell which one** | Try greedy. Then **actively try to break it** with a small counter-example. If you can't break it in 2 minutes and can articulate *why* (an exchange argument), it's greedy. If you find a counter-example, it's DP. | |

## The Classic Trap: Coin Change

Greedy "always pick the largest coin that fits" works for US coins (1, 5, 10, 25) but **fails**
for coins `{1, 3, 4}` targeting `6`:
- Greedy: pick 4, then 1, then 1 → `4+1+1` = **3 coins**.
- Optimal: `3+3` = **2 coins**.

Greedy fails here because taking the biggest coin first isn't provably part of the optimal
solution — there's no exchange argument that rescues it. This is *the* example to have ready
in an interview when asked "why not just use greedy?"

```java
import java.util.Arrays;

public class GreedyVsDpCoinChange {

    // Greedy: fast, but WRONG for arbitrary coin denominations
    public static int greedyCoinChange(int[] coins, int amount) {
        Integer[] sorted = new Integer[coins.length];
        for (int i = 0; i < coins.length; i++) sorted[i] = coins[i];
        Arrays.sort(sorted, (a, b) -> b - a); // largest first

        int count = 0;
        for (int coin : sorted) {
            while (amount >= coin) {
                amount -= coin;
                count++;
            }
        }
        return amount == 0 ? count : -1; // -1 if greedy couldn't exactly reach amount
    }

    // Dynamic Programming: always correct — explores every combination via subproblems
    public static int dpCoinChange(int[] coins, int amount) {
        int[] minCoins = new int[amount + 1];
        Arrays.fill(minCoins, Integer.MAX_VALUE);
        minCoins[0] = 0;

        for (int subAmount = 1; subAmount <= amount; subAmount++) {
            for (int coin : coins) {
                if (coin <= subAmount && minCoins[subAmount - coin] != Integer.MAX_VALUE) {
                    minCoins[subAmount] = Math.min(minCoins[subAmount], minCoins[subAmount - coin] + 1);
                }
            }
        }
        return minCoins[amount] == Integer.MAX_VALUE ? -1 : minCoins[amount];
    }

    public static void main(String[] args) {
        int[] coins = {1, 3, 4};
        int amount = 6;

        System.out.println("Greedy result: " + greedyCoinChange(coins, amount) + " coins (WRONG — not optimal)");
        System.out.println("DP result:     " + dpCoinChange(coins, amount) + " coins (correct)");
    }
}
```

## Where Greedy Genuinely Wins: Interval Scheduling (Maximum Non-Overlapping Intervals)

This is a case where greedy **is** provably correct (exchange argument: always keep the interval
that frees up time soonest), and it's O(n log n) vs a DP solution that would be needlessly O(n²).

```java
import java.util.Arrays;
import java.util.Comparator;

public class GreedyIntervalScheduling {

    // Greedy: sort by END time, always keep the interval that finishes soonest.
    // Provably optimal — no DP needed, and DP here would be strictly worse (O(n^2) vs O(n log n)).
    public static int maxNonOverlappingIntervals(int[][] intervals) {
        Arrays.sort(intervals, Comparator.comparingInt(interval -> interval[1]));

        int count = 0;
        int lastEnd = Integer.MIN_VALUE;
        for (int[] interval : intervals) {
            if (interval[0] >= lastEnd) {
                count++;
                lastEnd = interval[1];
            }
        }
        return count;
    }

    public static void main(String[] args) {
        int[][] intervals = {{1, 3}, {2, 4}, {3, 5}, {6, 8}};
        System.out.println("Max non-overlapping intervals: " + maxNonOverlappingIntervals(intervals)); // 3
    }
}
```

## Decision Checklist
1. Write down the greedy rule. Ask: "if I take the locally best choice, could that ever box me into a worse global outcome?"
2. Try to construct a small counter-example by hand (3-5 elements). If you find one → **DP**.
3. If you can articulate an **exchange argument** (swapping any other choice for the greedy one never makes things worse) → **Greedy**, and prefer it — it's faster and simpler.
4. When genuinely unsure under interview time pressure, DP is the safer default — it's slower to write but it's never wrong for these problem types.

## Pick Greedy when:
- You can prove the greedy-choice property (interval scheduling, MST via Kruskal/Prim, Huffman coding).

## Pick DP when:
- Greedy has a counter-example, or the problem explicitly asks for a count of ways / optimal value over choices that interact with each other (knapsack, coin change, edit distance).
