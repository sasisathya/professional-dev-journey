# Tic-Tac-Toe (Extensible to N×N)

## Requirements

- Support an `n × n` board (not hardcoded to 3×3) — this is the twist interviewers add specifically to catch a naive implementation.
- `move(row, col, player)` returns the winner (or "no winner yet").
- **The naive approach rescans the whole board for a win after every move — O(n²) per move.** The expected solution tracks win-condition progress incrementally, making each move O(1).

## Class Design Rationale

- Instead of a 2D board of marks, track **four running counters per player**: count of marks in each row, each column, the main diagonal, and the anti-diagonal. A move only ever affects *one* row, *one* column, and *at most* one of the two diagonals — so updating those counters is O(1), and a player wins the instant one counter hits `n`.
- This is the same idea as maintaining a **running sum instead of resumming a window** (see [`theory/dsa/pattern-comparisons/01-two-pointers-vs-sliding-window.md`](../dsa/pattern-comparisons/01-two-pointers-vs-sliding-window.md)) — incremental state update beats full recomputation whenever the update is local and cheap to isolate.
- Rows/columns are indexed `[player][index]` with players `1` and `2` — the array is sized `3` and index `0` is simply unused, trading a few wasted ints for code that reads directly as "player 1's row count" instead of an off-by-one remap.

```java
public class TicTacToeDemo {

    public static class TicTacToe {
        private final int n;
        private final int[][] rows; // rows[player][row]
        private final int[][] cols; // cols[player][col]
        private final int[] diagonal;
        private final int[] antiDiagonal;
        private int winner = 0; // 0 = no winner yet

        public TicTacToe(int n) {
            this.n = n;
            this.rows = new int[3][n];
            this.cols = new int[3][n];
            this.diagonal = new int[3];
            this.antiDiagonal = new int[3];
        }

        public int move(int row, int col, int player) {
            if (winner != 0) throw new IllegalStateException("Game already won by player " + winner);

            rows[player][row]++;
            cols[player][col]++;
            if (row == col) diagonal[player]++;
            if (row + col == n - 1) antiDiagonal[player]++;

            if (rows[player][row] == n || cols[player][col] == n ||
                diagonal[player] == n || antiDiagonal[player] == n) {
                winner = player;
            }
            return winner;
        }
    }

    public static void main(String[] args) {
        TicTacToe game = new TicTacToe(3);

        game.move(0, 0, 1); // player 1
        game.move(0, 1, 2); // player 2
        game.move(1, 1, 1); // player 1
        game.move(0, 2, 2); // player 2
        int result = game.move(2, 2, 1); // player 1 completes the main diagonal (0,0)-(1,1)-(2,2)

        System.out.println("Winner: " + result); // 1
    }
}
```

## What Interviewers Probe Next

- "Detect a draw." → Track a move counter; if it reaches `n*n` with no winner, it's a draw — O(1), no extra scan needed.
- "Support an `n × n` board where you only need `k` in a row to win (not the full `n`), like Gomoku." → The counters no longer work as-is; you'd need to track the longest *contiguous* run through the last-played cell in each of the 4 directions, which changes this from a counting problem to a local-scan problem (still much cheaper than a full-board scan, but no longer strictly O(1)).
- "What if two players could occupy overlapping win conditions simultaneously?" → Forces you to defend the O(1) approach's assumption that only one player's counters can reach `n` in a single valid game — worth stating that assumption explicitly.
- "Make this playable over a network with two remote clients." → Turns the state machine (whose turn, is the game over) into something a `Game` service enforces server-side rather than trusting the client — connects directly to the State pattern discussion in [06-vending-machine.md](06-vending-machine.md).
