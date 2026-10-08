# Low-Level Design (Machine Coding) — Interview Solutions

Machine-coding rounds test whether you can turn a vague prompt ("design a parking lot") into
working, extensible object-oriented code in ~45 minutes. This folder has full solutions, not
checklists — each file is a complete class design plus compilable Java.

## How to Approach Any LLD Interview

1. **Clarify requirements** — ask 3-5 questions before writing a line of code. What scale? What operations must be supported? What's explicitly out of scope? (Interviewers are grading whether you ask, not just whether you code.)
2. **Identify entities and relationships** — nouns become classes, verbs become methods. Draw the "has-a" / "is-a" relationships before touching a keyboard.
3. **Design classes/interfaces** — favor composition over inheritance, and reach for a GoF pattern only when it earns its complexity (see [`theory/design-patterns/java/design-patterns-java.md`](../design-patterns/java/design-patterns-java.md) for the catalog).
4. **Handle edge cases** — empty state, capacity exhausted, concurrent access, invalid input. Say them out loud before coding, then code them.
5. **Discuss extensibility** — the interviewer's last 5 minutes are almost always "now add feature X" — design so that's a small diff, not a rewrite.

## Problems

| # | Problem | OOD Skill It Teaches | File |
|---|---------|----------------------|------|
| 1 | Parking Lot | Multi-level composition, strategy-based spot allocation across heterogeneous types | [01-parking-lot.md](01-parking-lot.md) |
| 2 | Elevator System | Stateful scheduling, request dispatch under competing directions | [02-elevator-system.md](02-elevator-system.md) |
| 3 | LRU Cache (from scratch) | Building O(1) structures by hand — doubly linked list + hash map, no library shortcuts | [03-lru-cache.md](03-lru-cache.md) |
| 4 | Rate Limiter | Comparing three concrete algorithms (Token Bucket, Leaky Bucket, Sliding Window) for the same interface | [04-rate-limiter.md](04-rate-limiter.md) |
| 5 | Tic-Tac-Toe (NxN) | Incremental state tracking to avoid O(n²) rescans | [05-tic-tac-toe.md](05-tic-tac-toe.md) |
| 6 | Vending Machine | Explicit State pattern — modeling a workflow as first-class state objects | [06-vending-machine.md](06-vending-machine.md) |
| 7 | Splitwise (Expense Splitting) | Graph-of-balances modeling + greedy settlement minimization | [07-splitwise.md](07-splitwise.md) |
| 8 | Movie Ticket Booking | Concurrency correctness — preventing double-booking under real thread contention | [08-movie-ticket-booking.md](08-movie-ticket-booking.md) |

Each file follows the same structure: **Requirements → Class Design Rationale → Full Runnable Java → What Interviewers Probe Next.**
