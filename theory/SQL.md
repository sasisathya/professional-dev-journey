# SQL / Relational Databases — Professional Interview Guide

> Written for engineers who have to defend an index choice or an isolation level in a room
> full of people who have debugged a deadlock at 3am. This document assumes you can already
> write a `JOIN`. It does not re-derive NoSQL trade-offs — see
> [`MongoDB.md`](./MongoDB.md)'s framing of the document model, and
> [`SystemDesign.md`](./SystemDesign.md) for sharding/replication at the architecture level.
> This document's job is what happens **inside** the relational engine.

## Table of Contents

1. [The Relational Model, and When It Actually Wins](#the-relational-model-and-when-it-actually-wins)
2. [Indexes: B-Trees and Why Lookups Are O(log n)](#indexes-b-trees-and-why-lookups-are-olog-n)
3. [Clustered vs Non-Clustered Indexes](#clustered-vs-non-clustered-indexes)
4. [Composite Index Column Order](#composite-index-column-order)
5. [Covering Indexes](#covering-indexes)
6. [When the Planner Skips Your Index](#when-the-planner-skips-your-index)
7. [Reading EXPLAIN Like a Senior](#reading-explain-like-a-senior)
8. [The N+1 Problem](#the-n1-problem)
9. [Join Algorithms: Nested Loop, Hash Join, Merge Join](#join-algorithms-nested-loop-hash-join-merge-join)
10. [Transactions and ACID](#transactions-and-acid)
11. [Isolation Levels and the Three Anomalies](#isolation-levels-and-the-three-anomalies)
12. [Locking: Row vs Table, Optimistic vs Pessimistic, Deadlocks](#locking-row-vs-table-optimistic-vs-pessimistic-deadlocks)
13. [Normalization vs Denormalization](#normalization-vs-denormalization)
14. [Window Functions](#window-functions)
15. [Connection Pooling](#connection-pooling)
16. [Sharding and Replication for SQL](#sharding-and-replication-for-sql)
17. [Production War Stories](#production-war-stories)
18. [Common Pitfalls](#common-pitfalls)
19. [Junior vs Senior](#junior-vs-senior)
20. [Interview Questions with Model Answers](#interview-questions-with-model-answers)

---

## The Relational Model, and When It Actually Wins

`MongoDB.md` already makes the honest case for the document model (schema lives in code,
adding a field is free, the cost is knowing which of eleven shapes a document is in). The
relational model makes the opposite trade deliberately:

```
Relational                                   Document
────────────                                 ────────────
Schema enforced by the DATABASE,             Schema enforced by application code,
at write time, for EVERY row, always.        an ODM, or an opt-in validator.

Cost of adding a column:                     Cost of adding a field:
ALTER TABLE — metadata-only on most          Zero. Old documents simply lack it.
modern engines for a nullable column         Your code must handle both shapes,
with no default; a full rewrite for a        forever, or you run a migration.
NOT NULL column with a default (engine-
and version-dependent — see War Story 1).

Multi-row transactions:                      Multi-document transactions:
The default. Every statement is              Bolted on (4.0+). Real, but a
transactional; multi-statement                deliberately more expensive path
transactions are first-class.                 than the single-document guarantee.

Joins:                                       Joins:
A first-class, cost-optimized                $lookup is a correlated subquery,
operation with three execution               not a real join — no hash join,
strategies the optimizer picks between.       no join reordering (pre-5.1).
```

**Pick relational when:** your data has genuine many-to-many relationships you need to
query from multiple directions, you need multi-row ACID transactions as the default (not
the exception), your schema is stable and well-understood up front, or your business logic
is fundamentally reporting/analytics over structured relationships (joins, aggregations,
window functions — this is the SQL engine's home turf).

**Pick document when:** your access pattern is "fetch one aggregate and everything it
needs" (a user profile, an order with its line items), your schema genuinely varies across
records, or write throughput on largely independent records matters more than cross-record
consistency.

**The trap in both directions:** modeling relational data as a giant embedded document
because "joins are slow" (they are not, if indexed — see below), and modeling document data
as a rigid star schema because "that's how you do databases" (you are throwing away the
actual benefit of the document model). The honest senior answer to "SQL or NoSQL" starts
with the access pattern, never with a general preference.

---

## Indexes: B-Trees and Why Lookups Are O(log n)

Every general-purpose relational index (barring an explicit hash index) is a **B+ tree** —
mechanically the same structure `MongoDB.md` describes for Mongo's indexes, because it is the
same underlying data structure everywhere: high fanout, sorted leaves, logarithmic height.

```
                         Index on orders(customer_id)

                    ┌───────────────────────────────┐
        ROOT        │   [ 4000 | 9000 | ... ]        │      internal page (in
        (in cache)  └────┬────────┬─────────┬────────┘      buffer pool, ~8-16KB)
                         │        │         │
              ┌──────────┘        │         └───────────────┐
              ▼                   ▼                          ▼
     ┌─────────────────┐ ┌─────────────────┐        ┌─────────────────┐
     │ customer_id      │ │ customer_id     │        │ customer_id     │
     │ 1..3999          │ │ 4000..8999      │  ...   │ 9000..∞         │
     └────────┬─────────┘ └────────┬────────┘        └────────┬────────┘
              ▼                    ▼                          ▼
     ┌──────────────────────────────────────────────────────────────┐
     │ LEAF PAGES (linked list — range scans walk leaves in order)   │
     │ key: customer_id → row pointer (RowID / clustered-key value)  │
     └──────────────────────────────────────────────────────────────┘

Height with realistic fanout (~500-1000 keys/internal page on an 8-16KB page):
  1,000 rows        → 1 level  (fits in one leaf)
  1,000,000 rows     → ~2-3 levels
  1,000,000,000 rows → ~3-4 levels

A "1 billion row lookup" costs 3-4 page reads, not 1 billion comparisons. That is the
entire value proposition of an index, and it is why an unindexed WHERE clause on a large
table is not "a bit slower" — it is a different complexity class (O(n) sequential scan vs
O(log n) B-tree descent).
```

Every read/write pays a cost proportional to tree height, not row count — this is the
mechanical reason "just add an index" so reliably fixes slow queries, and also why an index
is not free: every write to an indexed column means a B-tree insert/rebalance on **every**
index touching that column, in addition to the table write itself. A table with 8 indexes on
frequently-updated columns pays 8 extra B-tree maintenance operations per write — identical
trade-off to the one `MongoDB.md` quantifies for Mongo's write amplification, same root cause.

---

## Clustered vs Non-Clustered Indexes

This is the distinction most engineers can define but cannot use to predict query cost, and
it is genuinely engine-specific.

```
CLUSTERED INDEX                              NON-CLUSTERED (SECONDARY) INDEX
────────────────                              ────────────────────────────────
The table's actual row data is physically     A SEPARATE structure. Its leaves store
stored in the leaf pages of this index,       the indexed column(s) + a POINTER back
in index-key order.                           to the actual row.

┌───────────────────────────┐                 ┌───────────────────────────┐
│ LEAF = the real row        │                 │ LEAF = key + pointer       │
│ id=1 | alice | ...         │                 │ email=alice@x | → id=1     │
│ id=2 | bob   | ...         │                 │ email=bob@x   | → id=2     │
└───────────────────────────┘                 └─────────────┬─────────────┘
                                                             │ second B-tree
Exactly ONE per table                                       ▼ traversal (a FETCH,
(the data can only be sorted                    ┌───────────────────────────┐
one way physically).                            │ CLUSTERED index, by id     │
                                                 │ id=1 | alice | full row    │
                                                 └───────────────────────────┘
```

- **PostgreSQL:** every index is non-clustered by default. There is no automatically
  maintained clustered order — `CLUSTER` exists but is a one-time physical reorder, not an
  ongoing guarantee, so a subsequent `UPDATE` can move a row anywhere. Table storage is a
  "heap" addressed by an internal `ctid`, and every index (including the primary key's) is a
  secondary structure pointing at that heap.
- **MySQL/InnoDB:** the primary key **is** the clustered index — there is no choice about it.
  If you don't define one, InnoDB manufactures a hidden 6-byte row ID and clusters on that
  instead, which is strictly worse because you cannot query by it. Every secondary index's
  leaf stores the **primary key value** (not a physical address) as its pointer, so a
  secondary-index lookup is: walk the secondary index → get the PK value → walk the
  clustered index by that PK to fetch the row. That second hop is mechanically identical to
  the `FETCH` stage `MongoDB.md`'s `explain()` section describes — same cost, same fix
  (a covering index, below).
- **SQL Server:** you choose — a table has at most one clustered index (any column set, not
  necessarily the PK) and any number of non-clustered ones.

**The concrete consequence:** on InnoDB, primary key choice is a physical data layout
decision, not just an identity decision.

```sql
-- ❌ WRONG: random primary key on a high-write InnoDB table
CREATE TABLE events (id CHAR(36) PRIMARY KEY, ...);  -- UUID v4, random
-- Every insert lands at a random point in the clustered B-tree. Pages that were
-- full get split constantly ("page split thrashing"). The working set of "hot"
-- pages for inserts is the ENTIRE index, not the tail — terrible buffer pool
-- hit rate on a large table, and heavy fragmentation.

-- ✅ CORRECT: monotonic primary key (or UUID v7 / ULID — time-sortable)
CREATE TABLE events (id BIGINT AUTO_INCREMENT PRIMARY KEY, ...);
-- Every insert appends to the rightmost page. Only the tail is ever "hot".
-- If you need a non-sequential public ID, keep it as a UNIQUE secondary column
-- and let the clustered PK stay monotonic.
```

This is the SQL-world mirror of `MongoDB.md`'s "`_id` is the worst possible shard key because
`ObjectId` is roughly time-ordered" — same physics, opposite conclusion, because clustering
order is exactly what you want monotonic for insert-heavy write locality, and exactly what
you don't want monotonic for shard-key write distribution.

---

## Composite Index Column Order

The exact same problem `MongoDB.md` solves with the **ESR rule** (Equality, Sort, Range)
exists in SQL, under the name **leftmost-prefix rule**, and the reasoning is identical because
it is the identical data structure.

> A composite B-tree index gives you one contiguous, ordered range per **equality** column
> matched from the left. The first column tested with a range (not equality) ends the
> useful ordering — every column after it is unsorted noise as far as this index is
> concerned.

```sql
CREATE INDEX idx_orders ON orders (customer_id, status, created_at);

-- Uses the index fully (equality, equality, then ordered range on created_at):
SELECT * FROM orders WHERE customer_id = 7 AND status = 'shipped'
  ORDER BY created_at DESC;

-- Uses only the customer_id prefix (status is skipped — there's a gap):
SELECT * FROM orders WHERE customer_id = 7 AND created_at > '2026-01-01';
-- created_at can still use the index (it's the last column and customer_id
-- pinned the prefix), but if there were a column AFTER created_at in the
-- index, it would be unusable here — same "equality before range" logic as ESR.

-- Cannot use this index AT ALL for the leading column:
SELECT * FROM orders WHERE status = 'shipped';
-- status is not the leftmost column. Full scan (or use of a DIFFERENT index
-- on status alone, if one exists).
```

**The same wrong instinct MongoDB.md calls out — "most selective column first" — is wrong
here for the same reason.** For pure equality predicates, both orderings resolve to a single
point lookup; the real tiebreaker is which single-column prefix queries you also need to
serve, and how well the leading column compresses (low-cardinality leading columns compress
better in engines with prefix/page compression, e.g. compressed InnoDB pages or columnstore
indexes).

---

## Covering Indexes

A **covering index** answers the query entirely from the index leaf — no trip to the
clustered index / heap. This is the SQL-world name for exactly the concept `MongoDB.md`
calls a covered query, and the payoff is the same order of magnitude: skipping one random
read per row is often a 5-10× win.

```sql
-- Query: get email and plan for a user, by id
SELECT email, plan FROM users WHERE id = 42;

-- ❌ Index on id alone (the PK, always present) still requires visiting the
-- row to get email/plan — on InnoDB this is free since PK lookup IS the row.
-- But on a SECONDARY-index-driven query it matters:
SELECT email FROM users WHERE plan = 'enterprise';
CREATE INDEX idx_plan ON users (plan);
-- idx_plan finds matching rows, then FETCHES each one from the clustered
-- index to read `email`. Two B-tree traversals per row.

-- ✅ CORRECT: include email in the index itself
CREATE INDEX idx_plan_covering ON users (plan, email);
-- Now `email` is sitting right there in the secondary index's leaf.
-- Postgres calls this INDEX ONLY SCAN in the plan; MySQL calls it
-- "Using index" in the Extra column. Zero trips to the heap/clustered index.
```

Postgres has one extra wrinkle worth knowing: an index-only scan still needs the
**visibility map** to confirm a row isn't a dead/uncommitted version (MVCC), so a table with
heavy churn and infrequent `VACUUM` can silently fall back to a regular index scan even when
the query looks coverable. `EXPLAIN (ANALYZE, BUFFERS)` will show `Heap Fetches: N` — if `N`
is not near zero on what should be an index-only scan, that's your `VACUUM` problem, not your
index problem.

---

## When the Planner Skips Your Index

An index existing is not the same as the planner using it. The four cases worth having ready:

1. **Leading wildcard `LIKE`.** `WHERE name LIKE '%smith'` cannot use a B-tree — there is no
   sorted prefix to seek to. `WHERE name LIKE 'smith%'` **can**, because that's a bounded
   range scan (`>= 'smith' AND < 'smitl'` under the hood). Full-text search or a trigram
   index (`pg_trgm` in Postgres) is the real fix for arbitrary substring search.
2. **A function wrapping the indexed column.** `WHERE UPPER(email) = 'A@B.COM'` cannot use a
   plain index on `email` — the index stores raw values, not `UPPER(email)` values. Fix:
   a **functional/expression index** (`CREATE INDEX ON users (UPPER(email))` in Postgres;
   a generated column + index on MySQL), or normalize the data on write instead of the
   query on read.
3. **Implicit type coercion.** Comparing an indexed `VARCHAR` column against a numeric
   literal, or an indexed `INT` against a string, can force the engine to cast every row
   before comparing — turning a seek into a scan. This is a common silent regression after
   an ORM change quietly alters a parameter's bound type.
4. **The cost-based optimizer decides a scan is cheaper anyway.** This is the one juniors
   never believe: on a low-cardinality column (say, a boolean `is_active` that's 95% `true`),
   or on a genuinely small table, the planner's cost model correctly concludes that a full
   scan (sequential I/O) beats thousands of scattered index-then-heap-fetch lookups
   (random I/O). **This is not a bug.** Forcing the index with a hint often makes it slower.
   The real fix, if the skewed 5% is what you query, is a **partial index**
   (`CREATE INDEX ON orders (id) WHERE status = 'pending'` in Postgres — mechanically the
   same partial-index concept `MongoDB.md` covers, same win: an index over 2% of rows is
   ~50× smaller and stays in the buffer pool).

---

## Reading EXPLAIN Like a Senior

```sql
EXPLAIN ANALYZE
SELECT o.id, o.total FROM orders o
WHERE o.customer_id = 84213 AND o.status = 'pending'
ORDER BY o.created_at DESC LIMIT 20;
```

The stage vocabulary to recognize instantly (Postgres names on the left, MySQL/`EXPLAIN
FORMAT=JSON` equivalents on the right):

```
STAGE                          What it means                        Verdict
────────────────────────────────────────────────────────────────────────────────
Seq Scan / ALL                 Full table scan                      Red flag on a
                                                                     large table
Index Scan / range / ref       B-tree descent + per-row heap fetch  Good
Index Only Scan / "Using       Answered from the index alone         Best case
index"
Bitmap Heap Scan / index_merge Combine several index scans via a    Fine, but often
                                bitmap, then fetch once per page     a sign a compound
                                (Postgres has no true index          index is missing
                                intersection for a single lookup)
Sort (external, disk)          Spilled to disk — you'll see "Sort   Red flag: means
                                Method: external merge Disk:        work_mem too small
                                XXXX kB" in ANALYZE output           OR nothing bounded
                                                                     the input first
Nested Loop                    See join section below               Fine for small
                                                                     outer input
Hash Join / Hash Match          See join section below               Fine for large,
                                                                     unindexed joins
```

**The ratio that matters, same idea as `totalDocsExamined/nReturned` in `MongoDB.md`:**
`rows removed by filter` (Postgres) or the gap between `rows examined` and `rows sent` in
MySQL's slow query log. A `Seq Scan` that examines 5,000,000 rows and returns 20 is the exact
same disease as a Mongo `COLLSCAN` wearing an `IXSCAN` costume, just spelled differently.

```
-- BEFORE (no index): Seq Scan on orders (cost=0.00..185000.00 rows=20)
--   Filter: (customer_id = 84213 AND status = 'pending')
--   Rows Removed by Filter: 4,999,980
--   Planning Time: 0.4 ms   Execution Time: 1,840.2 ms

-- AFTER: CREATE INDEX idx ON orders (customer_id, status, created_at DESC);
-- Index Scan using idx on orders (cost=0.42..8.44 rows=20)
--   Index Cond: (customer_id = 84213 AND status = 'pending')
--   Execution Time: 0.6 ms
```
Same story `MongoDB.md` tells with its 41,208ms → 2ms example — different engine, identical
underlying fix (an equality-then-range-ordered compound index), because it's the identical
data structure underneath.

`EXPLAIN` alone (no `ANALYZE`) shows the **planned** cost and does not run the query — safe on
production for a write query. `EXPLAIN ANALYZE` **actually executes it**, including any
`INSERT`/`UPDATE`/`DELETE` side effects — always wrap a destructive statement's plan check in
a transaction you roll back: `BEGIN; EXPLAIN ANALYZE DELETE ...; ROLLBACK;`.

---

## The N+1 Problem

The N+1 problem is an application-layer failure to batch, not a database-layer one — the
database is correctly answering N+1 separate, individually-fast queries. See
[`SpringBoot.md` § The N+1 select problem](./SpringBoot.md#the-n1-select-problem) for the
full JPA/Hibernate mechanics (lazy loading, `@OneToMany`, `JOIN FETCH`, batch fetching). The
SQL-side summary: one query to fetch N parent rows, then N additional queries (one per row)
to fetch each row's related data, instead of one query with a `JOIN` or one `WHERE id IN
(...)` batch fetch. It shows up in `EXPLAIN` as N cheap, fast, individually-blameless index
lookups — the bug is invisible to any single query's plan, and only visible in aggregate
(request-scoped query count, or an APM trace showing 200 near-identical queries per HTTP
request).

---

## Join Algorithms: Nested Loop, Hash Join, Merge Join

The optimizer picks one of exactly three physical strategies for a logical `JOIN`. Knowing
which one fires, and why, is a direct proxy for understanding query cost.

```
NESTED LOOP JOIN
────────────────
for each row in OUTER table:
    for each MATCHING row in INNER table (via an index seek, ideally):
        emit combined row

Cost: O(N × cost-of-inner-lookup). With an index on the inner join key,
inner lookup is O(log M), so total ≈ O(N log M) — cheap when N (outer) is small.
Without an index on the inner side: O(N × M) — catastrophic on large tables.
This is exactly the cost profile `MongoDB.md` describes for $lookup, because
$lookup literally IS a nested loop join with no other strategy available pre-5.1.

HASH JOIN
─────────
1. Build phase: hash the SMALLER input on the join key → in-memory hash table
2. Probe phase: stream the LARGER input, hash each row's join key, look up
Cost: O(N + M) — no index needed on either side. The default choice for large,
unindexed equi-joins. Needs the smaller side's hash table to fit in memory
(work_mem in Postgres) or it spills to disk and gets much slower.

MERGE JOIN
──────────
Requires BOTH inputs sorted by the join key (either they were already sorted —
e.g. by an index — or the optimizer sorts them first).
Walk both sorted streams together, like merging two sorted lists.
Cost: O(N + M) if pre-sorted (e.g., both via an index), O(N log N + M log M)
if the optimizer must sort first. Wins when both inputs are large AND already
ordered — otherwise a hash join usually wins.
```

The planner chooses based on table/index statistics (row count estimates, whether an index
exists on the join key, available memory) — not on the query's syntax. This is why adding an
index can silently change a query from a hash join to a nested loop join, and why "the same
query got slower after a schema change" is almost always a plan change, visible immediately
in `EXPLAIN`.

---

## Transactions and ACID

| Guarantee | What it actually means | Failure mode when violated |
|---|---|---|
| **Atomicity** | A transaction's writes all happen or none do — no partial application, even across a crash mid-transaction | Money leaves account A in one statement, a crash occurs before account B is credited, and without atomicity the debit survives, the credit doesn't. The engine's WAL/undo log exists specifically to make this impossible |
| **Consistency** | Every transaction leaves the database satisfying its declared constraints (FKs, `CHECK`, `UNIQUE`) | A transaction that would violate a foreign key or unique constraint is rejected outright, not partially applied — this is enforcement, not a promise about your business logic being correct |
| **Isolation** | Concurrent transactions behave, from each one's perspective, close to as if run one after another (exact degree is what isolation LEVELS tune — see next section) | Without isolation, transaction A can observe transaction B's in-flight, not-yet-committed writes (a dirty read), leading to decisions made on data that never actually existed |
| **Durability** | Once a transaction is acknowledged as committed, it survives a crash immediately after | A commit that returns success, then a power loss, then the write is gone — durability is what `fsync`ing the WAL before returning "committed" buys you, at a real latency cost you are explicitly trading for the guarantee |

The trade-off to say out loud, unprompted: **stronger durability costs latency, and
relaxing it is a real, sometimes correct, engineering choice** — e.g., Postgres's
`synchronous_commit = off` (or MySQL's `innodb_flush_log_at_trx_commit = 2`) trades "commit
survives a crash in the last ~1s" for a meaningful write-latency win, and is a defensible
choice for data you can afford to lose a second of (analytics event ingestion), never for a
financial ledger.

---

## Isolation Levels and the Three Anomalies

Three anomalies, four ANSI SQL levels, and the matrix every senior candidate is expected to
reproduce from memory:

| Isolation Level | Dirty Read | Non-Repeatable Read | Phantom Read |
|---|---|---|---|
| Read Uncommitted | Possible | Possible | Possible |
| Read Committed | Prevented | Possible | Possible |
| Repeatable Read | Prevented | Prevented | *Possible (ANSI) — see note* |
| Serializable | Prevented | Prevented | Prevented |

- **Dirty read:** you read a value another transaction wrote but hasn't committed yet, and
  that transaction then rolls back — you acted on data that never existed.
- **Non-repeatable read:** you read the same row twice in one transaction and get two
  different values, because another transaction committed an update in between.
- **Phantom read:** you run the same range query twice in one transaction and get a
  **different set of rows** the second time, because another transaction inserted/deleted a
  row matching your predicate in between.

**Concrete non-repeatable read, under Read Committed:**

```
Transaction A (a report)                    Transaction B (a transfer)
─────────────────────────                    ──────────────────────────
BEGIN;
SELECT balance FROM accounts
  WHERE id = 1;          → 1,000
                                             BEGIN;
                                             UPDATE accounts SET balance = 1,500
                                               WHERE id = 1;
                                             COMMIT;
SELECT balance FROM accounts
  WHERE id = 1;          → 1,500    ← same transaction, same row, different value.
COMMIT;                              A's report is now internally inconsistent if it
                                      used the first read to compute anything it
                                      cross-checks against the second.
```

Under **Repeatable Read**, A's second `SELECT` would still return `1,000` — the transaction
sees a consistent snapshot taken at its start (or first read, depending on engine).

**The interview trap worth knowing precisely:** the ANSI standard says Repeatable Read still
permits phantom reads. **MySQL/InnoDB's Repeatable Read is stricter than the standard
requires** — via MVCC snapshots plus **gap locking** (locking the *space between* index
entries, not just the entries themselves) on locking reads, InnoDB's RR prevents most
phantom reads in practice, which is a genuinely different guarantee from Postgres's RR (pure
MVCC snapshot, ANSI-faithful, phantoms possible under some conditions) or from Oracle (which
doesn't even offer a literal Repeatable Read level — its "Serializable" is closer to
Postgres's RR). **"Repeatable Read" is not one guarantee — always ask which engine.**

**Postgres's actual escalation** is a fourth mechanism worth naming: **Serializable
Snapshot Isolation (SSI)**. Rather than locking, it lets transactions run under snapshot
isolation and then detects, after the fact, whether the set of concurrent transactions could
only have produced a result inconsistent with *some* serial order — if so, it aborts one with
a serialization failure that the application must retry. This is why Postgres's Serializable
mode can throw `40001` errors under load that would not occur under plain Repeatable Read —
that is the mechanism working, not a bug.

**The default nobody should assume:** MySQL/InnoDB defaults to **Repeatable Read**.
PostgreSQL, Oracle, and SQL Server default to **Read Committed**. Stating your target
database's actual default, unprompted, is a strong interview signal.

---

## Locking: Row vs Table, Optimistic vs Pessimistic, Deadlocks

```
ROW-LEVEL LOCKING                              TABLE-LEVEL LOCKING
──────────────────                              ───────────────────
Only the specific row(s) touched are           The entire table is locked for the
locked. Two transactions updating              duration. Any other transaction
DIFFERENT rows never block each other.         touching the table blocks, even on
InnoDB, Postgres: row-level by default.        an unrelated row.
                                                MyISAM (legacy MySQL): table-level,
                                                always. Explicit LOCK TABLES in any
                                                engine forces it deliberately.
```

**Optimistic vs pessimistic**, the choice that actually shows up in code:

```sql
-- PESSIMISTIC: acquire the lock before you decide anything
BEGIN;
SELECT * FROM inventory WHERE sku = 'X1' FOR UPDATE;  -- blocks other writers NOW
-- ... application logic, decrement quantity ...
UPDATE inventory SET quantity = quantity - 1 WHERE sku = 'X1';
COMMIT;
-- Correct under high contention on the SAME row (a hot-selling item at launch).
-- Cost: every reader is now a writer as far as locking goes, and lock hold
-- time = however long your application logic takes, not just the UPDATE.

-- OPTIMISTIC: assume no conflict, verify at write time, retry on failure
UPDATE inventory SET quantity = quantity - 1, version = version + 1
  WHERE sku = 'X1' AND version = 7;   -- the version you read earlier
-- If another transaction updated it first, version no longer matches,
-- 0 rows affected, and YOUR code must detect that and retry.
-- Correct under LOW contention: no lock held during application logic at all,
-- so throughput is much higher when collisions are rare. Degrades badly
-- (wasted retries) as contention rises — the opposite failure mode of
-- pessimistic locking.
```

**Deadlock, concretely — two transactions locking the same two rows in opposite order:**

```
Transaction A                                Transaction B
──────────────                                ──────────────
BEGIN;
UPDATE accounts SET balance = balance - 50
  WHERE id = 1;        -- A holds lock on row 1
                                              BEGIN;
                                              UPDATE accounts SET balance = balance - 30
                                                WHERE id = 2;   -- B holds lock on row 2
UPDATE accounts SET balance = balance + 50
  WHERE id = 2;        -- A now WAITS for B's lock on row 2
                                              UPDATE accounts SET balance = balance + 30
                                                WHERE id = 1;   -- B now WAITS for A's lock on row 1
                    ═══════ DEADLOCK: A waits for B, B waits for A ═══════
```

The engine maintains a **wait-for graph** and periodically (InnoDB: immediately, via cycle
detection on every lock wait; Postgres: every `deadlock_timeout`, default 1s) checks for a
cycle. On finding one, it picks a **victim** (InnoDB: the transaction with the smaller
estimated rollback cost — usually the one that's done less work) and kills it with a
deadlock error; the other transaction proceeds. **This is not a database bug** — it is the
correct, designed resolution to an unresolvable wait cycle. The fix is always application-side:
**always acquire locks on multiple rows in a consistent, global order** (e.g., always lock
the lower `id` first), and treat a deadlock error as a expected, retryable condition — never
as an exception you let bubble up as a 500.

---

## Normalization vs Denormalization

**1NF, 2NF, 3NF**, stated the way you'd actually say them in an interview, not the textbook
definitions:

- **1NF — atomic values.** No comma-separated lists in a column, no repeating groups. If
  you find yourself parsing a column's string value to get "the second phone number," the
  table isn't in 1NF.
- **2NF — no partial dependency on part of a composite key.** If `(order_id, product_id)` is
  your composite key and `product_name` depends only on `product_id` (not on the
  combination), storing `product_name` in the order-line table is a 2NF violation — it
  belongs in a `products` table.
- **3NF — no transitive dependency.** If `zip_code` determines `city`, and `city` is stored
  redundantly next to `zip_code` in every row, that's a transitive dependency — `city`
  depends on `zip_code`, not on the table's key directly.

**Why normalize at all:** a normalized schema has each fact stored in exactly one place, so
an update is one write and can never produce an internal contradiction (two rows disagreeing
about the same fact). This is the relational model's actual selling point, and it is not
free.

**Why (and when) to deliberately denormalize:**

```sql
-- Normalized: orders → order_lines → products. Correct, no duplication.
-- Rendering an order list page needs a JOIN across three tables, every time,
-- for every order, on every page view.

-- Denormalized: snapshot the fields the read path needs, on write
ALTER TABLE order_lines ADD COLUMN product_name_snapshot VARCHAR(255);
-- Written once, at order time, from the current product_name.
-- The orders-list page is now a single-table query. Zero joins.
```

This is the identical trade `MongoDB.md`'s Extended Reference pattern makes, for the
identical reason: **a snapshot of a price/name at order time is not staleness, it is
point-in-time correctness** — the alternative (joining to the live `products` row) would
silently rewrite financial history if the product's price ever changes. State the trade-off
out loud: denormalization buys read performance and removes join cost, at the cost of the
database no longer being able to guarantee the duplicated fact stays in sync — that
responsibility moves to your application (or is accepted as intentional, as with historical
order snapshots).

Read-heavy analytical workloads take this further with **materialized views**
(`CREATE MATERIALIZED VIEW ... ; REFRESH MATERIALIZED VIEW ...` in Postgres) — a
denormalized, precomputed result set stored like a table, refreshed on a schedule or
trigger, trading staleness for query speed on expensive aggregations.

---

## Window Functions

A window function computes a value **across a set of related rows** without collapsing them
into one row the way `GROUP BY` does — each input row keeps its identity and gains an
additional computed column.

```sql
-- ❌ BEFORE: running total via a correlated subquery — O(n²)
SELECT
  o.id, o.created_at, o.amount,
  (SELECT SUM(o2.amount) FROM orders o2
   WHERE o2.customer_id = o.customer_id AND o2.created_at <= o.created_at) AS running_total
FROM orders o
WHERE o.customer_id = 42;
-- For row N, the subquery rescans up to N prior rows. Total work is
-- 1 + 2 + 3 + ... + n ≈ O(n²). On 10,000 orders for one customer, that's
-- ~50 million row comparisons for what should be a single pass.

-- ✅ AFTER: window function — one sorted pass, O(n log n)
SELECT
  id, created_at, amount,
  SUM(amount) OVER (
    PARTITION BY customer_id
    ORDER BY created_at
    ROWS UNBOUNDED PRECEDING
  ) AS running_total
FROM orders
WHERE customer_id = 42;
-- The engine sorts once (or uses an existing index on (customer_id, created_at)
-- to avoid even that), then computes every row's running total in a single
-- streaming pass over the sorted partition.
```

`PARTITION BY` resets the window per group (like `GROUP BY`, but without collapsing rows).
`ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, and `LAG()`/`LEAD()` (previous/next row's value
without a self-join) round out the set you're expected to recognize on sight — they're the
direct SQL-engine equivalent of MongoDB's `$setWindowFields` (5.0+), same purpose, same
performance shape.

---

## Connection Pooling

Every connection is a TCP handshake plus (usually) a TLS handshake plus authentication —
low-single-digit milliseconds each, but paid on **every request** if you connect-per-request,
and it also means the database is holding one backend process/thread per connection whether
or not it's doing anything (Postgres in particular: one OS process per connection, so an
unpooled high-concurrency app can exhaust `max_connections` from idle connections alone).
This is exactly the failure mode `Nodejs.md`'s
[Connection Pooling](./Nodejs.md#connection-pooling) section and `SpringBoot.md`'s
[Connection Pooling with HikariCP](./SpringBoot.md#connection-pooling-with-hikaricp) section
cover in full — pool sizing formulas, exhaustion symptoms, and framework-specific
configuration live there rather than being duplicated here. The one SQL-specific number
worth having: HikariCP's own guidance and most production experience converge on **pool size
≈ `((core_count × 2) + effective_spindle_count)`**, not "as high as possible" — an
oversized pool causes more context-switching and lock contention on the database than it
solves, a genuinely counterintuitive result most engineers get wrong on the first guess.

---

## Sharding and Replication for SQL

The distributed-systems mechanics (CAP trade-offs, leader/follower replication, hash vs
range sharding, cross-shard query fan-out) are covered once, properly, in
[`SystemDesign.md` § Database Replication](./SystemDesign.md#database-replication) and
[§ Database Sharding](./SystemDesign.md#database-sharding) — this section only calls out
what's specifically different for a relational engine rather than re-deriving the general
theory:

- **Foreign keys don't span shards.** A `FOREIGN KEY` constraint is enforced by the engine
  checking the referenced table locally — it cannot check a row that lives on a different
  shard. Sharding a relational schema means either giving up FK enforcement for cross-shard
  relationships (enforce it in application code instead) or ensuring related rows are always
  co-located on the same shard by shard key (the usual real answer: shard by `tenant_id` or
  `customer_id`, and make sure every table that logically belongs to that tenant carries the
  same shard key).
- **`AUTO_INCREMENT`/`SERIAL` collides across shards.** Two shards each generating their own
  sequential IDs from 1 will mint duplicate IDs. Standard fixes: a UUID/ULID primary key
  (accepting the clustered-index insert-locality cost from the section above), an
  ID-generation service (Twitter Snowflake-style — timestamp + shard ID + sequence bits
  packed into one integer), or per-shard ID ranges/offsets allocated up front.
- **Cross-shard joins don't exist.** A join across two tables that live on different shards
  must be done in the application (fetch from shard A, fetch from shard B, join in memory) or
  avoided entirely by co-locating related data — there is no relational engine that
  transparently joins across independently sharded instances the way a single instance joins
  across tables.
- **Read replica lag is the same replication-lag problem as any system**, but relational
  engines give you a very direct tool for the "read your own write" fix: run the read-after-
  write on the **primary** explicitly (or, in Postgres, check `pg_last_wal_replay_lsn()` on
  the replica against the LSN your write returned, and wait for it to catch up before
  reading there) — mechanically the same fix as the "pin reads to primary after a write" fix
  described for Redis/Mongo elsewhere in this library, same root cause every time.

---

## Production War Stories

### Story 1: A "quick" `ALTER TABLE` took the checkout service down for 40 minutes

**Symptom.** A routine deploy added one nullable column to a `orders` table with 220 million
rows: `ALTER TABLE orders ADD COLUMN gift_note VARCHAR(500);`. Within seconds, every write to
`orders` — and therefore every checkout — started timing out. The deploy pipeline had no
special step for this migration; it ran the same as any other.

**Investigation.** `SHOW PROCESSLIST` (MySQL) showed dozens of connections in
`Waiting for table metadata lock`, all blocked behind the single `ALTER TABLE` connection,
which itself showed `State: copy to tmp table`. The migration was rewriting the entire table.

**Root cause.** The team was running MySQL 5.6. Pre-5.6/5.7 (and even on 5.7+ for some column
types/positions), adding a column is **not** metadata-only — the engine builds an entirely
new table with the new schema, copies every row into it, then swaps it in, holding a
significant lock for the duration. On a 220-million-row table on spinning-disk-backed
storage, that copy took over 35 minutes, during which the table was effectively unavailable
for writes. This is the exact same class of cost `MongoDB.md` contrasts against "adding a
field is free" — the relational model's "add a column" can be genuinely expensive, and the
cost is engine- and version-specific, which is precisely why an assumption like "ALTER TABLE
is always fast" is dangerous.

**Fix.** Immediate: nothing to do but wait it out; killing the `ALTER` mid-copy would have
rolled back 35 minutes of work. Permanent: (1) migrated to `pt-online-schema-change`
(Percona) for large-table DDL, which creates a shadow table, uses triggers to keep it in
sync with live writes, and does an atomic rename at the end — writes are never blocked for
more than the final rename (milliseconds); (2) upgraded to MySQL 8.0, where `ADD COLUMN`
with no default (or `NULL` default) on most storage-engine configurations is genuinely
instant (metadata-only, `ALGORITHM=INSTANT`); (3) added a migration-review step in CI that
flags any DDL on a table above a row-count threshold for manual online-migration review
instead of auto-running in the standard deploy.

**Lesson.** "ALTER TABLE" is not one operation — it's a spectrum from instant metadata change
to full table rewrite, and which one you get depends on the engine, the version, and the
exact column change. Never assume; check your specific engine's documented behavior for the
exact DDL you're about to run against a large table, every time.

### Story 2: A nightly batch job deadlocked with live traffic, every night, for months

**Symptom.** A nightly reconciliation job that updated ~50,000 account rows started throwing
intermittent deadlock errors roughly a year after launch, at a rate that grew steadily —
first a few per run, eventually enough that the job routinely failed to complete and had to
be manually rerun.

**Investigation.** The deadlock error log (`SHOW ENGINE INNODB STATUS` → `LATEST DETECTED
DEADLOCK`) showed the batch job's transaction and an ordinary user-facing "transfer funds"
transaction each waiting on a row the other held — always the same two-transaction shape, but
different specific accounts each time.

**Root cause.** The batch job processed accounts **in ascending `id` order within a single
large transaction**, `UPDATE`ing each row it touched. The live transfer endpoint updated the
source account, then the destination account — in whatever order the user's transfer
happened to specify, which was effectively random relative to `id`. When the batch job's
sweep and a live transfer happened to touch the same two accounts concurrently, roughly half
the time the live transaction had locked them in the opposite order from the batch job,
producing exactly the deadlock timeline shown in the Locking section above. Growth over the
year tracked user-base growth: more concurrent transfers meant more chances of an overlap
per batch run.

**Fix.** (1) The batch job was rewritten to process accounts in small, independently
committed batches (500 rows per transaction) rather than one giant transaction — this alone
shrank the lock-hold window from minutes to milliseconds per account, cutting collision
probability by roughly the same factor. (2) The transfer endpoint was changed to **always
lock the lower account ID first**, regardless of transfer direction — enforcing a single
global lock order eliminates the possibility of this specific deadlock shape entirely,
not just reduces its odds. (3) The batch job's retry logic was fixed to actually retry on a
deadlock error instead of aborting the whole run (it had been silently swallowing and
continuing, which is how failures went unnoticed for months).

**Lesson.** Deadlocks are not random bad luck — they are the predictable consequence of two
code paths that can lock the same resources in different orders, and the fix is always
"pick one global order and enforce it everywhere," never "retry harder." A batch job holding
one enormous transaction is also a availability smell independent of deadlocks: it holds
every lock it's touched for the full duration and makes the eventual rollback cost, on any
failure, proportional to the entire batch.

### Story 3: A phantom read let an inventory system oversell a flash-sale item by 3×

**Symptom.** A limited flash-sale SKU with 100 units in stock sold 312 units before the
bug was caught and sales were manually halted.

**Investigation.** Application logs showed the reservation logic correctly checking
`SELECT COUNT(*) FROM reservations WHERE sku = 'X1'` against the 100-unit cap before
inserting a new reservation row, in every single request — the check-then-insert logic was
correct in isolation. The database was running under **Read Committed**.

**Root cause.** Under Read Committed, each statement within a transaction sees a fresh
snapshot — the `COUNT(*)` check and the subsequent `INSERT` are two separate reads of the
world, and nothing prevents another transaction from inserting its own reservation row
**between** this transaction's count-check and its insert. Under concurrent load (the flash
sale drove thousands of simultaneous requests), dozens of transactions could each see a
count comfortably under 100, and each proceed to insert — a textbook phantom read, at the
scale of hundreds of overlapping requests rather than the textbook's two.

**Fix.** The correct fix was not a stronger isolation level in isolation — Serializable
would have caused massive serialization-failure retry storms under this concurrency, an
availability trade nobody wanted. Instead: `SELECT COUNT(*) ... FOR UPDATE` on the relevant
rows (pessimistic locking, forcing requests to serialize on the actual contended resource),
combined with a `CHECK` constraint enforced by a dedicated `inventory` counter row
decremented atomically (`UPDATE inventory SET remaining = remaining - 1 WHERE sku = 'X1' AND
remaining > 0`, checking the affected-row count is 1) rather than a `COUNT()` over a
reservations table at all — a single atomically-checked decrement has no window for a
phantom to appear in, because there's no separate read-then-decide step at all.

**Lesson.** "Check then insert" is a race condition shape, not a business-logic bug, whenever
more than one transaction can run the check concurrently — and Read Committed (the default in
most engines outside MySQL) explicitly does not protect you from it. The fix that actually
holds up under real concurrency is almost always to make the check and the write **one
atomic statement** against a maintained counter, not to reach for a stronger isolation level
and pay its concurrency cost everywhere.

---

## Common Pitfalls

**1. Assuming `ALTER TABLE` is always fast.**
*Failure mode:* a table rewrite on a large table blocks writes for the duration — minutes to
hours. See War Story 1.
*Fix:* check your specific engine/version's documented behavior for the exact DDL, use an
online-schema-change tool for large tables, never assume.

**2. `SELECT *` in application code.**
*Failure mode:* pulls columns you don't need over the wire, defeats covering indexes (the
index can't cover a column set it doesn't include), and silently breaks when someone adds a
column your code wasn't expecting.
*Fix:* name the columns you actually use.

**3. N+1 queries from ORM lazy-loading.**
*Failure mode:* a page that should be one query becomes 1 + N, invisible in any single
query's `EXPLAIN`. See [`SpringBoot.md`](./SpringBoot.md#the-n1-select-problem).
*Fix:* eager-fetch/batch-fetch, or a single `JOIN`/`WHERE id IN (...)`.

**4. Indexing every column "just in case."**
*Failure mode:* every write pays a B-tree maintenance cost per index, and the planner has
more (often worse) options to choose between. Unused indexes are pure cost.
*Fix:* index for actual query patterns; check `pg_stat_user_indexes.idx_scan` (Postgres) or
`sys.schema_unused_indexes` (MySQL 8+) periodically and drop what's genuinely unused.

**5. Offset-based pagination on a large, growing table.**
*Failure mode:* `LIMIT 20 OFFSET 100000` still scans and discards the first 100,000 matching
rows — cost grows with page depth, and results can shift under concurrent inserts, causing
duplicates/skips.
*Fix:* keyset/cursor pagination (`WHERE created_at < :last_seen ORDER BY created_at DESC
LIMIT 20`) — the same fix `MongoDB.md` documents, same underlying reason.

**6. Treating a deadlock error as a fatal exception.**
*Failure mode:* a transaction that could have succeeded on retry instead surfaces as a user-
facing 500.
*Fix:* catch the specific deadlock/serialization-failure error code and retry the whole
transaction a bounded number of times.

**7. Storing money as `FLOAT`/`DOUBLE`.**
*Failure mode:* `0.1 + 0.2 != 0.3` in IEEE 754 binary floating point — the exact
`MongoDB.md` warning about `Double` for money, equally true here.
*Fix:* `DECIMAL`/`NUMERIC` with explicit precision and scale.

**8. Long-running transactions holding locks (or, on Postgres, blocking `VACUUM`).**
*Failure mode:* an open transaction — even an idle one sitting in application code between
statements — holds its locks and, on Postgres, prevents the autovacuum process from
reclaiming dead row versions, causing table/index bloat that degrades every other query.
*Fix:* keep transactions as short as possible; never hold one open across a network call to
another service; alert on `idle in transaction` duration.

**9. Assuming a `UNIQUE` constraint means "checked before insert."**
*Failure mode:* a race between the application's "check if exists" query and its subsequent
`INSERT` — two concurrent requests can both pass the check and both attempt the insert.
*Fix:* let the database enforce it — attempt the `INSERT` and catch the unique-violation
error (or use `INSERT ... ON CONFLICT DO NOTHING` / `INSERT IGNORE`), rather than
check-then-insert in application code.

**10. Ignoring `EXPLAIN`'s estimated-vs-actual row-count gap.**
*Failure mode:* the optimizer's statistics are stale (common right after a large bulk load),
so its cost estimates — and therefore its plan choice — are wrong, even though the query is
"correct."
*Fix:* `ANALYZE` (Postgres) / `ANALYZE TABLE` (MySQL) after large data changes; `EXPLAIN
ANALYZE`'s actual-vs-estimated row counts are the first thing to check when a plan looks
wrong.

---

## Junior vs Senior

| Dimension | Junior | Senior |
|---|---|---|
| Mental model | "SQL is tables and joins" | "Every index is a B-tree with a physical cost per write; every join is one of three algorithms the optimizer chose based on statistics" |
| Adding an index | "Index everything that's in a WHERE clause" | Designs composite indexes around actual query shapes (leftmost-prefix), checks write-cost trade-off, audits for unused indexes |
| Slow query | "Let me add an index" | Runs `EXPLAIN ANALYZE` first, reads the actual bottleneck (scan type, row estimate gap, sort spill), then decides whether an index even helps |
| Isolation levels | "We use the default, whatever that is" | Knows the engine's actual default, knows MySQL's RR ≠ Postgres's RR in practice, picks the level deliberately per transaction when it matters |
| Deadlocks | Retries randomly or lets it 500 | Enforces a global lock order, treats the error code as an expected, retryable condition |
| Denormalization | "Normalization is always correct" or "always denormalize for speed" | States the specific read/write ratio and consistency requirement that justifies each choice, per table |
| Schema migration | Runs the same `ALTER TABLE` in prod as in dev | Checks the engine/version's actual DDL cost for a large table, uses an online-schema-change tool when needed |
| Pagination | `OFFSET`/`LIMIT` everywhere | Keyset pagination for anything beyond a small, bounded result set |
| Money | `FLOAT` | `DECIMAL`, and can explain why in one sentence |
| Connection handling | Opens a connection per request | Uses a properly-sized pool, can state the sizing formula and why bigger isn't better |
| Debugging | "The database is slow" | `EXPLAIN ANALYZE`, checks statistics freshness, checks lock waits, checks buffer/cache hit ratio — in that order |

---

## Interview Questions with Model Answers

**Q1. Why is a B-tree used for database indexes instead of a hash table, given hash lookups
are O(1)?**

> Because a hash table only answers "does this exact key exist" — it destroys ordering. A
> B-tree preserves sort order in its leaves, which means it can serve range queries
> (`WHERE created_at > X`), ordered scans (`ORDER BY`, satisfied for free if it matches index
> order), and prefix matching, none of which a hash index can do at all. Hash indexes exist
> in most engines (Postgres has them explicitly) and are genuinely faster for pure equality
> lookups with no range/order requirement, but the moment you need `>`, `<`, `BETWEEN`, or an
> `ORDER BY`, only the B-tree can do it. Given most real query workloads mix equality and
> range predicates, B-tree is the sane general-purpose default, and hash is the special case.

*Interviewer follow-up: "When would you actually reach for a hash index over a B-tree?"*
> When the column is only ever queried with exact equality, never a range or a sort, and the
> table is large enough that the (smaller) hash index's lower per-lookup constant matters. In
> practice this is rare enough that I'd only reach for it after profiling showed the B-tree's
> lookup cost specifically, not by default — the downside risk (someone later adds a range
> query and it silently can't use the index) usually isn't worth the marginal gain.

**Q2. Walk me through exactly what happens when you run `ALTER TABLE orders ADD COLUMN
gift_note VARCHAR(500)` on a 200-million-row table.**

> It depends entirely on the engine and version, and saying so upfront is the actual answer
> an interviewer wants. On MySQL 8.0 with InnoDB, adding a nullable column with no default
> is `ALGORITHM=INSTANT` — metadata-only, sub-second, regardless of table size. On older
> MySQL, or a column with certain characteristics that don't qualify for instant DDL, the
> engine builds a shadow copy of the entire table, copies every row across, and swaps it in
> atomically at the end — holding a metadata lock that blocks writes for the duration, which
> on 200 million rows can be tens of minutes. Postgres's behavior is similar in spirit: adding
> a nullable column with no default is metadata-only and instant; adding a `NOT NULL` column
> with a non-null default used to force a full rewrite prior to Postgres 11, and is now also
> metadata-only in most cases because the engine can store the default separately and apply
> it lazily on read.

*Interviewer follow-up: "The migration doesn't qualify for the fast path and you can't take
downtime. What do you actually do?"*
> An online schema-change tool — `pt-online-schema-change` or `gh-ost` for MySQL, or the
> equivalent create-shadow-table-plus-trigger-plus-atomic-rename approach by hand for
> Postgres. The mechanism: create a new table with the target schema, install triggers (or a
> logical-replication-based CDC stream, which `gh-ost` uses instead of triggers to avoid their
> overhead) to mirror every write from the old table to the new one, backfill existing rows in
> small batches to avoid long locks, then do an atomic rename once the new table is fully
> caught up. Writes are never blocked for more than the final rename, which is milliseconds.

**Q3. A report and a live transaction are running concurrently. Under Read Committed, the
report reads the same row twice and gets two different values. Is that a bug?**

> No — that's Read Committed doing exactly what it promises, and it's the textbook
> non-repeatable read anomaly. Read Committed only guarantees each individual statement sees
> data committed as of that statement's start; it makes no promise across multiple statements
> in the same transaction. If the report needs a consistent view across its whole execution —
> which most reports genuinely do, since summing values that shifted mid-calculation produces
> a number that never actually existed at any point in time — the fix is to run the report
> under Repeatable Read (a consistent snapshot taken once, at the transaction's start) rather
> than treating it as a bug in Read Committed.

*Interviewer follow-up: "Does Repeatable Read fully solve it, or is there still a gap?"*
> It solves non-repeatable reads completely — same snapshot, same values, every time, within
> that transaction. Whether it also closes phantom reads depends on the engine: MySQL's
> InnoDB RR uses gap locking on locking reads and prevents most phantoms in practice; plain
> MVCC-based RR, like Postgres's, is snapshot-only and the ANSI standard explicitly still
> permits a phantom under RR. If the report also needs to be immune to phantoms — e.g., a
> range aggregate where a concurrently inserted row would change the count — I'd either use
> Serializable and handle retries, or make the report's queries explicit `FOR UPDATE`/`FOR
> SHARE` range locks if the engine and query shape support it.

**Q4. Two of your transactions just deadlocked in production. Walk me through what the
database actually did, and what you'd do about it.**

> The engine maintains a wait-for graph of which transaction is blocked waiting on a lock held
> by which other transaction. When it detects a cycle — A waiting on a lock B holds, while B
> waits on a lock A holds — it has proof neither can ever proceed, so it picks a victim
> (InnoDB picks the transaction that's done less work, to minimize rollback cost) and aborts
> it with a deadlock error, letting the other proceed. This is correct, designed behavior, not
> a failure of the database.
>
> The application-side fix is to look at both transactions' lock-acquisition order and make it
> consistent — if transaction A always locks accounts in ascending ID order and transaction B
> sometimes locks them in descending order (say, because it processes a user-specified
> transfer direction), that inconsistency is the actual root cause, and enforcing "always lock
> the lower ID first" everywhere eliminates the specific deadlock shape entirely. Separately,
> the application needs to treat a deadlock error code as an expected, retryable condition —
> catch it specifically and retry the whole transaction, don't let it surface as an
> unhandled exception.

*Interviewer follow-up: "Your fix requires touching a lot of call sites to enforce a
consistent lock order. What's a way to reduce the risk of someone getting it wrong again
later?"*
> Push the ordering into a single shared helper that all multi-row-update code paths are
> required to go through — e.g., a function that takes a set of account IDs and returns them
> sorted, and code review/lint rules that flag any multi-row `UPDATE` on this table that
> doesn't go through it. The goal is making the correct behavior the path of least resistance,
> not relying on every future engineer remembering a rule from a postmortem.

**Q5. When would you deliberately denormalize a schema, and what are you actually giving up?**

> When the read path is dominant enough that the join cost of staying normalized is a real,
> measured problem — not preemptively. The concrete signal: a page or query that needs data
> from 3+ tables, on every request, where the joined data changes rarely relative to how often
> it's read. What I'm giving up is the database's automatic guarantee that the duplicated fact
> stays in sync everywhere it's stored — that responsibility moves to my application, or I
> accept the duplication is intentionally a point-in-time snapshot (an order line item storing
> the product's price *at the time of the order*, which should never update even when the
> live product price changes — that's not staleness, that's correctness for a financial
> record).

*Interviewer follow-up: "How do you keep the duplicated data in sync when it does need to
stay current — say, a user's display name shown on every comment they've made?"*
> In increasing order of complexity: accept eventual consistency via a background job for
> anything display-only and non-critical; use change-data-capture (a logical replication
> stream, or triggers) to propagate the update to every denormalized copy as the source
> changes; or, if it must be transactionally consistent, wrap the update to the source and
> every denormalized copy in a single transaction — at the cost of that transaction now
> touching every table with a copy, which is exactly the coupling denormalization was
> supposed to avoid, so I'd only accept that cost if true transactional consistency were a
> hard requirement.

**Q6. How does a covering index let a query skip visiting the table entirely, and what's the
actual trade-off of adding one?**

> A covering index includes every column the query needs — both the filter columns and the
> columns being selected — as part of the index itself, not just the columns being filtered
> on. So the engine finds the matching entries by walking the index B-tree as normal, and
> since the index leaf already contains everything the query asked for, it never needs the
> second hop to the clustered index or heap to fetch the rest of the row. Postgres surfaces
> this as "Index Only Scan" in `EXPLAIN`, MySQL as "Using index" in the Extra column.
>
> The trade-off is that the index is now wider — it duplicates every included column's data
> inside the index structure, so it takes more disk space and, more importantly, more work on
> every write to that row, since the index has to be updated with the current value of every
> column it covers, not just the ones it's keyed on. It's a good trade for a hot, frequently-
> run query on a table where writes are much less frequent than reads; it's a bad trade to
> apply reflexively to every index on a write-heavy table.

---

## Related Reading

- [`MongoDB.md`](./MongoDB.md) — the document-model side of the comparisons above (BSON,
  WiredTiger, the ESR rule, schema design patterns).
- [`SpringBoot.md`](./SpringBoot.md#the-n1-select-problem) — JPA/Hibernate's specific N+1
  and connection-pool mechanics.
- [`Nodejs.md`](./Nodejs.md#connection-pooling) — connection pooling from the driver/runtime
  side.
- [`SystemDesign.md`](./SystemDesign.md#database-sharding) — sharding and replication as
  architecture-level decisions, independent of any one engine.
