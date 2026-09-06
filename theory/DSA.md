# Data Structures & Algorithms - Professional Interview Guide

> **This document is the core DSA guide**: the data structures themselves, how they behave on real
> hardware, the algorithms that operate on them, and how to actually run an algorithm interview.
>
> **For the 40-pattern encyclopedia — pattern taxonomy, dependency tree, LeetCode mapping, and
> per-pattern drill lists — see the [`dsa/` subfolder](./dsa/):**
> - [`dsa/INDEX.md`](./dsa/INDEX.md) — start here, the learning roadmap
> - [`dsa/patterns-reference.md`](./dsa/patterns-reference.md) — all 40 patterns, tiered by prerequisite
> - [`dsa/patterns-quick-ref.md`](./dsa/patterns-quick-ref.md) — one-page cheat card, frequency matrix
> - [`dsa/two-sum.md`](./dsa/two-sum.md) — one problem worked to death, as a model of how to study
>
> This file does **not** repeat the pattern catalogue. It explains the *machinery underneath* the
> patterns: why a hash map is O(1) until it isn't, why heapify is O(n), why quicksort wins despite
> O(n²), and why the fastest correct answer is sometimes the "worse" complexity.

---

## Table of Contents

1. [How to Use This Guide](#how-to-use-this-guide)
2. [Complexity Analysis](#complexity-analysis)
3. [Memory, Cache, and Why Constants Matter](#memory-cache-and-why-constants-matter)
4. [Arrays & Strings](#arrays--strings)
5. [Hashing](#hashing)
6. [Linked Lists](#linked-lists)
7. [Stacks & Queues](#stacks--queues)
8. [Trees](#trees)
9. [Heaps & Priority Queues](#heaps--priority-queues)
10. [Graphs](#graphs)
11. [Sorting](#sorting)
12. [Binary Search](#binary-search)
13. [Recursion & Backtracking](#recursion--backtracking)
14. [Dynamic Programming](#dynamic-programming)
15. [Greedy Algorithms](#greedy-algorithms)
16. [Bit Manipulation](#bit-manipulation)
17. [Pattern Recognition Cheatsheet](#pattern-recognition-cheatsheet)
18. [The Interview Playbook](#the-interview-playbook)
19. [Common Pitfalls](#common-pitfalls)
20. [Interview Questions](#interview-questions)
21. [Junior vs Senior](#junior-vs-senior)
22. [When This Actually Mattered in Production](#when-this-actually-mattered-in-production)

---

## How to Use This Guide

There are two failure modes when preparing for algorithm rounds.

**Failure mode 1: memorize solutions.** You grind 400 LeetCode problems, you can regurgitate the
"correct" code for each, and then the interviewer perturbs the problem by 5% and you have nothing.
Interviewers do this deliberately. The follow-up question exists specifically to find out whether you
understood or memorized.

**Failure mode 2: study theory without writing code.** You can explain why a red-black tree
rebalances, but you cannot write a correct binary search in 4 minutes under observation. Interviews
are timed motor-skill tests as much as they are reasoning tests.

The way through is: **understand the machine underneath, then drill the patterns until the code is
muscle memory, then practise talking while you code.** This document handles the first part and the
last part. The [`dsa/`](./dsa/) folder handles the middle.

A working order for a senior engineer with ~6 weeks:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  WEEK 1   Read this file end to end. Do not skip complexity or memory.   │
│           Implement from scratch, no reference: dynamic array, hash map, │
│           binary heap, union-find, trie, LRU cache.                      │
├──────────────────────────────────────────────────────────────────────────┤
│  WEEK 2-4 Drill dsa/patterns-reference.md tier by tier. 4-6 problems per │
│           pattern. Always: state complexity out loud BEFORE coding.      │
├──────────────────────────────────────────────────────────────────────────┤
│  WEEK 5   DP + graphs only. These are where seniors get filtered.        │
├──────────────────────────────────────────────────────────────────────────┤
│  WEEK 6   Mock interviews with a human. Re-read The Interview Playbook   │
│           below every single day. Process is scored, not just answers.   │
└──────────────────────────────────────────────────────────────────────────┘
```

If you have one week, read [Complexity Analysis](#complexity-analysis),
[The Interview Playbook](#the-interview-playbook), and
[Pattern Recognition Cheatsheet](#pattern-recognition-cheatsheet), then drill Tier 0 and Tier 1
patterns. That is roughly 80% of the expected value.

---

## Complexity Analysis

### The formal definitions (you should be able to state these)

Most candidates say "Big-O means worst case." That is wrong, and a good interviewer will notice.
Big-O is an *upper bound on a function*, and which function you apply it to (best case, average case,
worst case) is a separate axis.

**O (big-oh) — asymptotic upper bound.**
`f(n) = O(g(n))` if there exist constants `c > 0` and `n₀` such that `0 ≤ f(n) ≤ c·g(n)` for all
`n ≥ n₀`. It says "grows no faster than". Note `n = O(n²)` is technically true and technically
useless — a tight bound is what people actually want.

**Ω (big-omega) — asymptotic lower bound.**
`f(n) = Ω(g(n))` if `0 ≤ c·g(n) ≤ f(n)` for `n ≥ n₀`. "Grows at least as fast as." Used for
proving problems are hard: comparison sorting is `Ω(n log n)` because the decision tree has `n!`
leaves and a binary tree with `n!` leaves has depth `≥ log₂(n!) = Θ(n log n)`.

**Θ (theta) — tight bound.**
`f(n) = Θ(g(n))` iff `f(n) = O(g(n))` and `f(n) = Ω(g(n))`. Merge sort is `Θ(n log n)` — same
best, average, and worst. Quicksort is `O(n²)` worst, `Θ(n log n)` average, and it is **wrong** to
call quicksort `Θ(n log n)` without qualification.

**How to say this in an interview:** "Quicksort is Θ(n log n) on average and O(n²) in the worst
case; with a randomized pivot the worst case has probability that decays exponentially, so in
practice we treat it as n log n." That sentence alone signals seniority.

### Growth rates, visually

```
 time
   ▲
   │ O(2ⁿ) O(n²)
   │   │     │
   │   │     │              ┌──────── O(n log n)
   │   │     │         ┌────┘
   │   │    ┌┘    ┌────┘             ┌────────────── O(n)
   │   │  ┌─┘  ┌──┘         ┌────────┘
   │  ┌┘ ┌┘ ┌──┘     ┌──────┘
   │ ┌┘┌─┘┌─┘   ┌────┘        ┌───────────────────── O(log n)
   │┌┘┌┘┌─┘ ┌───┘     ┌───────┘
   ├┴─┴─┴───┴─────────┴──────────────────────────────  O(1)
   └───────────────────────────────────────────────────────▶  n
```

Concrete numbers matter more than the shape. Assume ~10⁸ simple operations per second as a rough
budget for one second of CPU:

```
┌───────────┬─────────┬────────────┬─────────────┬──────────────┬───────────────────┐
│     n     │  log₂n  │     n      │  n · log₂n  │      n²      │        2ⁿ         │
├───────────┼─────────┼────────────┼─────────────┼──────────────┼───────────────────┤
│        10 │       3 │         10 │          33 │          100 │             1,024 │
│       100 │       7 │        100 │         664 │       10,000 │          1.3×10³⁰ │
│     1,000 │      10 │      1,000 │       9,966 │    1,000,000 │         1.1×10³⁰¹ │
│    10,000 │      13 │     10,000 │     132,877 │  100,000,000 │      not a number │
│ 1,000,000 │      20 │  1,000,000 │  19,931,569 │        10¹²  │      heat death   │
│      10⁹  │      30 │       10⁹  │  2.99×10¹⁰  │        10¹⁸  │      heat death   │
└───────────┴─────────┴────────────┴─────────────┴──────────────┴───────────────────┘
```

**Reading the constraints backwards is a senior move.** The interviewer tells you `n ≤ 10⁵`. That
rules out O(n²) (10¹⁰ ops). It permits O(n log n) and O(n √n). Say this out loud:

> "n is up to 10⁵, so an O(n²) solution is about 10¹⁰ operations — too slow. I need at least
> O(n log n). That immediately makes me think sorting, a heap, or binary search on the answer."

Constraint-driven complexity targeting:

```
n ≤ 10          → O(n!) or O(2ⁿ) is fine — brute force permutations, bitmask DP
n ≤ 20-25       → O(2ⁿ) subsets, O(2ⁿ · n) bitmask DP
n ≤ 100         → O(n³) fine — Floyd-Warshall, matrix chain DP
n ≤ 1,000-5,000 → O(n²) fine — 2D DP, all-pairs on small graphs
n ≤ 10⁵ - 10⁶   → O(n log n) — sorting, heaps, binary search, segment tree
n ≤ 10⁷ - 10⁸   → O(n) only — single pass, hashing, two pointers
n > 10⁹         → O(log n) or O(1) — math, binary search on the answer, closed form
```

### Amortized analysis: why dynamic-array push is O(1)

This is the single most common "explain it properly" complexity question. A `Vec`/`ArrayList`/JS
array has a fixed-capacity backing buffer. When it fills, you allocate a bigger one and copy.

Most pushes are O(1) (write to a slot, bump the length). Occasionally a push is O(n) (allocate,
copy everything). The question is what the *average over a sequence* is.

**The doubling math.** Start with capacity 1, double on overflow. Insert n elements. Resizes happen
when the size hits 1, 2, 4, 8, …, up to n. Total elements copied:

```
1 + 2 + 4 + 8 + ... + n/2  =  Σ(k=0 to log₂n - 1) 2ᵏ  =  2^(log₂n) − 1  =  n − 1
```

So across n pushes you do at most `n` cheap writes plus `n − 1` copies = `2n − 1` operations.
Divide by n: **≤ 2 operations per push amortized = O(1) amortized.**

The geometric series is doing all the work. It converges because each resize is twice as expensive
as the last but happens half as often — the costs telescope.

```
       push #:  1  2  3  4  5  6  7  8  9 ...  16
   real cost:   1  2  3  1  5  1  1  1  9 ...  17     ← spikes at powers of 2
                │  │  │     │           │        │
                └──┴──┴─────┴───────────┴────────┘
   amortized:   ~2 per push, forever
```

**Now the trap question: "what if we grow by a constant +1 instead of doubling?"**
Then resize k copies k elements, and total work is `1 + 2 + ... + n = n(n+1)/2 = Θ(n²)`, so each
push is Θ(n) amortized. Growth must be *geometric* for the amortization to work. The growth factor
is a tuning knob, not a law: Java's `ArrayList` uses 1.5×, Python's list uses ~1.125× for large
lists, C++ `std::vector` typically 1.5× or 2×. Smaller factors waste less memory but copy more
often; 1.5× also allows reusing previously freed blocks, which 2× never can.

**Three ways to prove amortized bounds** (know the names, the aggregate method is enough for
interviews):
- **Aggregate method** — total cost of n operations / n. What we just did.
- **Accounting method** — charge each push 3 "credits": 1 to write, 2 saved to pay for the future
  copy of itself and one older element. Credits never go negative → O(1) amortized.
- **Potential method** — define Φ = 2·size − capacity. Amortized cost = actual cost + ΔΦ. Resizes
  drain the potential you built up.

**Amortized is not average-case.** Amortized is a worst-case guarantee over a *sequence*; it makes
no probabilistic assumption. That distinction matters in latency-sensitive systems: an amortized
O(1) push still has an individual O(n) push, and if that push happens inside a p99 request you will
see it in your latency histogram. Real-time systems use incremental/chunked growth precisely to
avoid the spike.

### Space complexity, including the recursion stack

Space complexity is **auxiliary space** — extra memory beyond the input — unless stated otherwise.
The most-missed component is the call stack.

```java
// Time O(n), Space O(n)?  No — Space O(h) where h is tree height.
int depth(TreeNode root) {
    if (root == null) return 0;
    return 1 + Math.max(depth(root.left), depth(root.right));
}
```

Each frame holds the parameter, return address, and saved registers. The maximum number of
simultaneously live frames is the tree height `h`. For a balanced tree `h = O(log n)`; for a
degenerate (linked-list-shaped) tree `h = O(n)` and you can blow the stack.

```
Balanced tree, n = 10⁶       Degenerate tree, n = 10⁶
      h ≈ 20 frames                h = 1,000,000 frames
      ~2 KB of stack               ~100 MB of stack → StackOverflowError
```

Practical stack limits to know:
- **JVM**: default thread stack ~512 KB–1 MB → roughly 10k–20k frames. Tunable with `-Xss`.
- **Node.js / V8**: ~11k–15k frames by default. Tunable with `--stack-size`.
- **Python**: `sys.setrecursionlimit` defaults to 1000 (a guard, not the real C-stack limit).

So "recursion on a linked list of length n" is a genuine production bug, not a theoretical one. See
[production story 4](#story-4-the-recursive-parser-that-died-on-a-large-payload).

**Quicksort's space** is a good test question. In-place partitioning uses O(1) extra data, but the
recursion is O(log n) *if you recurse on the smaller side and loop on the larger* (tail-call
elimination by hand), and O(n) if you naively recurse on both and get unlucky pivots.

```java
void quicksort(int[] a, int lo, int hi) {
    while (lo < hi) {
        int p = partition(a, lo, hi);
        if (p - lo < hi - p) {        // recurse into the SMALLER half
            quicksort(a, lo, p - 1);
            lo = p + 1;               // iterate on the larger half
        } else {
            quicksort(a, p + 1, hi);
            hi = p - 1;
        }
    }
}
```

That guarantees O(log n) stack depth in the worst case. Library implementations do exactly this.

### The complexity nobody asks about but everybody feels

Big-O drops constants. Constants are frequently the entire story at the sizes real systems see. The
next section is the one that separates people who have profiled code from people who have not.

---

## Memory, Cache, and Why Constants Matter

### The memory hierarchy is not flat

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Registers            <1 ns          ~1 KB                              │
│  L1 cache             ~1 ns          32-64 KB    (~4 cycles)            │
│  L2 cache             ~4 ns          256 KB-1 MB (~14 cycles)           │
│  L3 cache             ~15 ns         8-64 MB     (~50 cycles)           │
│  Main memory (DRAM)   ~80-100 ns     GBs         (~200-300 cycles)      │
│  NVMe SSD             ~50-100 µs     TBs                                │
│  Network (same DC)    ~500 µs                                           │
└─────────────────────────────────────────────────────────────────────────┘

A single L1 hit vs a single DRAM miss is a ~100× difference.
Big-O treats them as the same "1 operation".
```

Memory is fetched in **cache lines**, typically 64 bytes. Reading one `int` pulls in the 16 ints
around it for free. Hardware prefetchers detect sequential access and pull the *next* lines in
before you ask. Both effects make contiguous, forward, predictable access dramatically faster than
pointer chasing.

### Array vs linked list: the layout that explains everything

```
ARRAY  int[8] — one contiguous block, 32 bytes, fits in ONE 64-byte cache line
┌────┬────┬────┬────┬────┬────┬────┬────┐
│ 11 │ 42 │  7 │ 19 │ 88 │  3 │ 55 │ 64 │      base + i*4  →  O(1) address math
└────┴────┴────┴────┴────┴────┴────┴────┘      ONE cache miss loads all 8
 0x1000                            0x101C      prefetcher already fetching next line


LINKED LIST — 8 heap nodes, allocated over time, scattered across the heap
 0x7f2a10          0x7f0c88          0x7f31d0          0x7ea044
┌──────┬──────┐   ┌──────┬──────┐   ┌──────┬──────┐   ┌──────┬──────┐
│  11  │  ●───┼──▶│  42  │  ●───┼──▶│   7  │  ●───┼──▶│  19  │ null │  ...
└──────┴──────┘   └──────┴──────┘   └──────┴──────┘   └──────┴──────┘
  ↑ 8 bytes data + 8 bytes pointer + ~16 bytes object header (JVM)
  = 32 bytes of RAM to store 4 bytes of payload

 Each ──▶ is a POTENTIAL CACHE MISS. You cannot prefetch the next address
 because you do not know it until the current load completes. This is a
 serialized dependency chain: ~100 ns × n, and the CPU stalls the whole time.
```

**Consequence: an "O(n) array scan" routinely beats an "O(1) linked-list insert" workflow.**

Concrete, measurable example. Maintain a sorted collection of 10,000 32-bit integers, inserting
random values one at a time.

- **Sorted array**: each insert is a binary search (O(log n)) plus a `memmove` of on average n/2
  elements — nominally O(n). But `memmove` on contiguous memory runs at multiple GB/s using SIMD;
  moving 20 KB takes single-digit microseconds and the prefetcher makes it nearly free per element.
- **Sorted linked list**: the insert itself is O(1) *once you have the node*, but finding the
  position is an O(n) traversal in which every step is an unpredictable dependent load. There is no
  binary search on a linked list — you cannot jump to the middle.

In practice the array version wins by roughly an order of magnitude at n = 10⁴, and the gap widens
with n until the array copy cost finally dominates (typically well past 10⁵ for small elements).
This is why `std::list` is nearly always the wrong answer in C++, why Java's `LinkedList` is
essentially deprecated in practice, and why Bjarne Stroustrup's famous benchmark shows vectors
beating lists even for insert-heavy workloads.

**When the linked list actually wins:**
- You already hold a reference to the node and need O(1) splice/remove — this is exactly the LRU
  cache case (see [LRU](#lru-cache-the-most-asked-design-a-data-structure-question)).
- Elements are large/expensive to move.
- You need stable references: pointers into a linked list stay valid across inserts; pointers into a
  vector are invalidated by a resize.
- Lock-free / intrusive data structures in kernels and allocators.

**How to say this in an interview:** "Asymptotically the linked list insert is O(1) and the array
insert is O(n), but the array is contiguous so the copy is a `memmove` at memory bandwidth, while
the list traversal is a serialized chain of cache misses. Below ~10⁵ elements the array usually
wins. I'd only reach for a linked list if I already had a handle to the node."

### The concrete "cache beats complexity" example

```java
// A: O(n log n) — sort a contiguous int[] of 1,000,000 elements
int[] a = randomInts(1_000_000);
Arrays.sort(a);                     // ~60-80 ms, dual-pivot quicksort, cache-friendly

// B: O(n) — walk a 1,000,000-node LinkedList<Integer> and sum it
long sum = 0;
for (Integer x : linkedList) sum += x;   // ~40-120 ms depending on heap layout,
                                         // and much worse after GC fragmentation
```

An O(n log n) sort on an `int[]` is regularly comparable to or faster than a single O(n) traversal
of a `LinkedList<Integer>` of the same size. Two reasons compound: pointer chasing (no prefetch) and
boxing (`Integer` is a heap object, so each element is an extra indirection plus header overhead).

**The senior framing:** Big-O tells you how the cost *scales*. It does not tell you what the cost
*is*. For fixed, known, moderate n — which describes most production code — the constant factor and
the memory access pattern decide the winner. Measure.

### Practical rules that follow

1. **Prefer contiguous.** `int[]` over `Integer[]` over `List<Integer>` over `LinkedList<Integer>`.
2. **Prefer structs-of-arrays over arrays-of-structs** in hot loops — you only pull in the fields
   you read.
3. **Row-major matters.** In Java/C/JS, `matrix[i][j]` iterated with `j` innermost is sequential;
   swapping the loops can be 5-10× slower on a large matrix due to a cache miss per element.
4. **Small n: just use an array.** A linear scan of a 16-element array beats a `HashMap` lookup —
   fewer instructions, no hashing, one cache line. Many JDK/V8 internals special-case small
   collections for exactly this reason.
5. **Don't hand-optimize before measuring.** But do *choose the right shape of data structure*
   before writing the code, because that is the change you cannot make cheaply later.

---

## Arrays & Strings

### The dynamic array

The array is the default. It is contiguous, has O(1) indexed access via `base + i·stride`, and every
CPU optimization in the last 30 years was designed with it in mind.

```
┌──────────────────────┬─────────────┬──────────────────────────────────────┐
│ Operation            │ Complexity  │ Note                                 │
├──────────────────────┼─────────────┼──────────────────────────────────────┤
│ access by index      │ O(1)        │ pure address arithmetic              │
│ search (unsorted)    │ O(n)        │ linear scan, very cache friendly     │
│ search (sorted)      │ O(log n)    │ binary search                        │
│ push / append        │ O(1) amort. │ geometric growth (see above)         │
│ pop from end         │ O(1)        │                                      │
│ insert / delete mid  │ O(n)        │ shift the tail; memmove is fast      │
│ insert / delete head │ O(n)        │ shifts everything — use a deque      │
└──────────────────────┴─────────────┴──────────────────────────────────────┘
```

A minimal dynamic array so you can talk about the internals confidently:

```java
class DynamicArray {
    private int[] data = new int[1];
    private int size = 0;

    void push(int v) {
        if (size == data.length) grow();
        data[size++] = v;
    }

    private void grow() {
        int newCap = data.length + (data.length >> 1); // 1.5x, like ArrayList
        if (newCap <= data.length) newCap = data.length + 1;
        data = Arrays.copyOf(data, newCap);            // System.arraycopy under the hood
    }

    int get(int i) {
        if (i < 0 || i >= size) throw new IndexOutOfBoundsException();
        return data[i];
    }

    void insert(int i, int v) {                        // O(n)
        if (size == data.length) grow();
        System.arraycopy(data, i, data, i + 1, size - i);
        data[i] = v;
        size++;
    }
}
```

```javascript
class DynamicArray {
  #data = new Int32Array(1);
  #size = 0;

  push(v) {
    if (this.#size === this.#data.length) this.#grow();
    this.#data[this.#size++] = v;
  }

  #grow() {
    const next = new Int32Array(Math.max(1, (this.#data.length * 3) >> 1));
    next.set(this.#data);          // memcpy
    this.#data = next;
  }

  get(i) {
    if (i < 0 || i >= this.#size) throw new RangeError('index out of bounds');
    return this.#data[i];
  }
}
```

**JS array trivia worth knowing:** a JS `Array` is not necessarily contiguous. V8 keeps arrays in
one of several *element kinds* — `PACKED_SMI_ELEMENTS` (contiguous small ints, fastest),
`PACKED_DOUBLE_ELEMENTS`, `PACKED_ELEMENTS` (boxed), and their `HOLEY_` variants. Assigning
`a[1000] = 1` to a 3-element array transitions it to *dictionary mode* — a hash map keyed by index,
with all the pointer chasing that implies. Element-kind transitions are one-way. If you need
guaranteed contiguous numeric storage, use a `TypedArray` (`Int32Array`, `Float64Array`).

### Two pointers

Two indices moving through the array under a rule. Converts many O(n²) scans into O(n).

**Variant A — converging (requires sorted input).**

```javascript
// Two Sum II: sorted array, find indices summing to target. O(n) time, O(1) space.
function twoSumSorted(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const sum = nums[lo] + nums[hi];
    if (sum === target) return [lo, hi];
    if (sum < target) lo++;      // only way to increase the sum
    else hi--;                   // only way to decrease it
  }
  return [-1, -1];
}
```

*Why it's correct:* at any point, `nums[lo] + nums[hi]` is the largest sum available using `lo`, and
the smallest available using `hi`. If the sum is too small, no partner for `lo` exists to its right,
so `lo` can be discarded. Each step eliminates one index → O(n). Being able to state this
elimination argument is the difference between "I remember this trick" and "I understand it".

**Variant B — fast/slow, same direction (in-place filtering).**

```java
// Remove all instances of val in-place, return new length. O(n) time, O(1) space.
int removeElement(int[] nums, int val) {
    int write = 0;
    for (int read = 0; read < nums.length; read++) {
        if (nums[read] != val) nums[write++] = nums[read];
    }
    return write;
}
```

**Variant C — 3Sum, the canonical composed use.**

```java
List<List<Integer>> threeSum(int[] nums) {
    Arrays.sort(nums);                              // O(n log n)
    List<List<Integer>> res = new ArrayList<>();
    for (int i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;      // skip duplicate anchors
        if (nums[i] > 0) break;                             // prune: rest are positive
        int lo = i + 1, hi = nums.length - 1;
        while (lo < hi) {
            int sum = nums[i] + nums[lo] + nums[hi];
            if (sum == 0) {
                res.add(Arrays.asList(nums[i], nums[lo], nums[hi]));
                while (lo < hi && nums[lo] == nums[lo + 1]) lo++;   // skip dup lo
                while (lo < hi && nums[hi] == nums[hi - 1]) hi--;   // skip dup hi
                lo++; hi--;
            } else if (sum < 0) lo++;
            else hi--;
        }
    }
    return res;                                     // O(n²) total, O(1) extra (excl. output)
}
```

The duplicate handling is where 80% of candidates lose points. Call it out before you write it:
"I'll sort first, which also lets me skip duplicates cheaply by comparing to the previous element."

### Sliding window

A contiguous window `[left, right]` that expands on the right and contracts on the left. Each index
enters and leaves the window at most once → O(n) despite the nested `while`.

```
 Variable-size window on "abcabcbb", longest substring without repeats
 ──────────────────────────────────────────────────────────────────────
   a  b  c  a  b  c  b  b
  [a]                          window={a}       len 1
  [a  b]                       window={a,b}     len 2
  [a  b  c]                    window={a,b,c}   len 3  ← best
   a [b  c  a]                 'a' dup → shrink left past old 'a'
   a  b [c  a  b]              'b' dup → shrink
   a  b  c [a  b  c]           'c' dup → shrink
   a  b  c  a  b [c  b]        'b' dup → shrink
   a  b  c  a  b  c  b [b]     'b' dup → shrink
                                answer 3
  right moves n times, left moves ≤ n times total → O(n), not O(n²)
```

**The variable-window template.** Memorize the shape, not the problem.

```javascript
function variableWindow(s) {
  const count = new Map();
  let left = 0, best = 0;

  for (let right = 0; right < s.length; right++) {
    // 1. EXPAND: include s[right]
    count.set(s[right], (count.get(s[right]) ?? 0) + 1);

    // 2. SHRINK while the window is invalid
    while (count.get(s[right]) > 1) {
      const out = s[left++];
      count.set(out, count.get(out) - 1);
      if (count.get(out) === 0) count.delete(out);
    }

    // 3. RECORD: window [left, right] is now valid
    best = Math.max(best, right - left + 1);
  }
  return best;
}
```

```java
int lengthOfLongestSubstring(String s) {
    int[] last = new int[128];          // last seen index + 1, ASCII fast path
    int left = 0, best = 0;
    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        left = Math.max(left, last[c]); // jump left directly past the duplicate
        best = Math.max(best, right - left + 1);
        last[c] = right + 1;
    }
    return best;
}
```

The Java version shows the optimization interviewers like: instead of shrinking one step at a time,
jump `left` straight past the previous occurrence. Same O(n), fewer operations, and it demonstrates
you understand *why* the shrink loop exists.

**Fixed-size window** is simpler — add the incoming element, remove the outgoing one:

```java
// Max sum of any subarray of size k. O(n) time, O(1) space.
int maxSumWindow(int[] a, int k) {
    int sum = 0;
    for (int i = 0; i < k; i++) sum += a[i];
    int best = sum;
    for (int i = k; i < a.length; i++) {
        sum += a[i] - a[i - k];         // slide: add new, drop old
        best = Math.max(best, sum);
    }
    return best;
}
```

**When sliding window does NOT apply:** if the array can contain negative numbers and the condition
is "sum ≥ target", the window is not monotonic — shrinking might *increase* the sum. Sliding window
requires that expanding monotonically pushes you one way and shrinking pushes you back. With
negatives, use prefix sums + a hash map or a monotonic deque instead. Interviewers love this
follow-up. Say it before they ask.

### Prefix sums

Precompute `P[i] = a[0] + ... + a[i-1]`. Then `sum(i..j) = P[j+1] − P[i]` in O(1).

```
 a  =  [ 3,  1, -2,  5,  4 ]
 P  =  [ 0,  3,  4,  2,  7, 11 ]        P[0] = 0 is the sentinel that kills off-by-ones
          ↑                    ↑
        P[i]                 P[j+1]
 sum(1..3) = P[4] − P[1] = 7 − 3 = 4   ✓  (1 + (−2) + 5)
```

```javascript
// Subarray Sum Equals K — O(n), works with negatives (sliding window does NOT).
function subarraySum(nums, k) {
  const seen = new Map([[0, 1]]);   // prefix 0 has occurred once (empty prefix)
  let sum = 0, count = 0;
  for (const x of nums) {
    sum += x;
    count += seen.get(sum - k) ?? 0;   // #prefixes P such that sum - P = k
    seen.set(sum, (seen.get(sum) ?? 0) + 1);
  }
  return count;
}
```

```java
int subarraySum(int[] nums, int k) {
    Map<Integer, Integer> seen = new HashMap<>();
    seen.put(0, 1);
    int sum = 0, count = 0;
    for (int x : nums) {
        sum += x;
        count += seen.getOrDefault(sum - k, 0);
        seen.merge(sum, 1, Integer::sum);
    }
    return count;
}
```

Extensions worth mentioning: **2D prefix sums** (inclusion-exclusion, O(1) rectangle sums),
**difference arrays** (range update in O(1), reconstruct in O(n) — the dual of prefix sums, perfect
for "add v to every element in [l, r]" repeated q times), and **prefix XOR** for XOR-subarray
problems.

### Kadane's algorithm

Maximum sum of a contiguous subarray. This is DP disguised as a one-liner, and saying so scores
points.

**The state:** `best_ending_here[i]` = max sum of a subarray that *ends exactly at i*.
**The recurrence:** `best_ending_here[i] = max(a[i], best_ending_here[i-1] + a[i])`.
The choice is binary: either extend the previous subarray, or start fresh at `i`. You start fresh
precisely when the running sum has gone negative — a negative prefix can only hurt you.
**The answer:** `max over all i of best_ending_here[i]`.
**Space:** you only need `i−1`, so O(1).

```javascript
function maxSubArray(nums) {
  let cur = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
}
```

```java
int maxSubArray(int[] nums) {
    int cur = nums[0], best = nums[0];
    for (int i = 1; i < nums.length; i++) {
        cur  = Math.max(nums[i], cur + nums[i]);
        best = Math.max(best, cur);
    }
    return best;                      // O(n) time, O(1) space
}
```

**The edge case that catches people:** all-negative arrays. Initializing `best = 0` returns 0 for
`[-3, -1, -2]` instead of `-1`. Initialize from `nums[0]`, not from zero. Mention this unprompted.

**The follow-up you will get:** "return the indices too." Track a `start` that resets whenever you
choose `nums[i]` over `cur + nums[i]`, and record `(start, i)` whenever `best` improves.

```java
int[] maxSubArrayIndices(int[] nums) {
    int cur = nums[0], best = nums[0], start = 0, bs = 0, be = 0;
    for (int i = 1; i < nums.length; i++) {
        if (cur + nums[i] < nums[i]) { cur = nums[i]; start = i; }
        else cur += nums[i];
        if (cur > best) { best = cur; bs = start; be = i; }
    }
    return new int[]{bs, be, best};
}
```

### In-place partitioning: Dutch national flag

Sort an array of 0s, 1s, and 2s in one pass, O(1) space. Dijkstra's problem. It generalizes to
three-way quicksort partitioning, which is how you make quicksort handle duplicate-heavy input
without degrading to O(n²).

**Invariant** — three pointers carve the array into four regions:

```
┌─────────────┬─────────────┬───────────────────┬─────────────┐
│  all  0s    │   all 1s    │    UNKNOWN        │   all 2s    │
└─────────────┴─────────────┴───────────────────┴─────────────┘
 0          low-1  low     mid-1  mid         high  high+1  n-1
              ↑             ↑                   ↑
            "low" is the boundary of the 0 region
            "mid" is the cursor scanning unknowns
            "high" is the boundary of the 2 region
```

```java
void sortColors(int[] a) {
    int low = 0, mid = 0, high = a.length - 1;
    while (mid <= high) {
        if (a[mid] == 0)      { swap(a, low++, mid++); }   // 0 → send left, advance both
        else if (a[mid] == 1) { mid++; }                   // 1 → already in place
        else                  { swap(a, mid, high--); }    // 2 → send right, do NOT advance mid
    }
}
```

```javascript
function sortColors(a) {
  let low = 0, mid = 0, high = a.length - 1;
  while (mid <= high) {
    if (a[mid] === 0)      { [a[low], a[mid]] = [a[mid], a[low]]; low++; mid++; }
    else if (a[mid] === 1) { mid++; }
    else                   { [a[mid], a[high]] = [a[high], a[mid]]; high--; }
  }
  return a;
}
```

**The subtlety:** when you swap with `high`, you do *not* increment `mid`, because the value you
just pulled in from the right is unexamined. When you swap with `low`, you *do* increment, because
everything below `low` is already classified as a 0 or a 1. Explain this. It is the entire question.

### Strings: immutability is a complexity trap

In Java, JavaScript, Python, and C#, strings are immutable. Every "modification" allocates a new
string and copies. That turns an innocuous loop into O(n²).

```java
// O(n²) — allocates and copies a growing string n times.
String s = "";
for (int i = 0; i < n; i++) s += "x";       // total copies: 1+2+3+...+n = n(n+1)/2

// O(n) amortized — mutable char buffer with geometric growth.
StringBuilder sb = new StringBuilder();
for (int i = 0; i < n; i++) sb.append('x');
String s = sb.toString();
```

At n = 100,000 this is the difference between ~5 seconds and ~2 milliseconds. It is one of the most
common real production performance bugs in Java code, usually hiding inside a log-message builder or
a CSV serializer.

```javascript
// JS engines optimize s += x with "rope"/cons-string representations, so the naive
// loop is often fine — but it is not guaranteed, and flattening the rope on first
// read is O(n). The predictable version:
const parts = [];
for (let i = 0; i < n; i++) parts.push('x');
const s = parts.join('');
```

Other string facts that come up:

- **`substring` cost.** Java 7u6+ copies the char array → O(k). Before that it shared the backing
  array → O(1) but leaked memory (a 3-char substring pinned a 10 MB string alive). That change is a
  great "trade-off" anecdote.
- **Comparison** is O(min(m, n)), and `==` on Java `String` compares references. `equals` compares
  content. Interned literals make `==` *appear* to work, which is exactly why the bug survives to
  production.
- **Char vs code point.** Java `char` is UTF-16; emoji and many CJK characters are surrogate pairs,
  so `s.length()` is not the number of user-visible characters. JS has the same problem;
  `[...str]` iterates code points, `str.length` counts UTF-16 units. Say "assuming ASCII / lowercase
  English letters, I'll use a 26-length int array — otherwise I'd use a hash map" and you've handled
  it.
- **Anagram check**: sort both (O(n log n)) or count frequencies (O(n) with a 26-slot array). Always
  offer both and pick the counting one.
- **Pattern matching**: naive is O(n·m). KMP is O(n + m) using a failure/LPS array that encodes the
  longest proper prefix which is also a suffix, letting you avoid re-comparing. Rabin-Karp uses a
  rolling hash — O(n + m) expected, and it's the right answer when you're searching for *many*
  patterns at once. Know that these exist and what they buy; you will rarely be asked to write KMP.

---

## Hashing

Hash tables are the most-used data structure in interviews and in production. "Just use a hash map"
is correct maybe 60% of the time, which is exactly why you need to know the 40%.

### What a hash table actually is

```
  key ──▶ hash(key) ──▶ h ──▶ index = h mod capacity ──▶ bucket
                       (32/64-bit)   (or h & (cap-1) when cap is a power of 2)
```

Three separate concerns, and mixing them up is a common interview stumble:
1. **The hash function** — maps a key to an integer. Should be fast and well-distributed.
2. **The compression** — maps that integer into `[0, capacity)`. Usually `& (capacity − 1)`.
3. **Collision resolution** — what to do when two keys land in the same bucket.

### Collision resolution: chaining

```
capacity = 8, load factor = 5/8 = 0.625

  bucket
  ┌───┐
0 │ ● ├──▶ ["cat", 1] ──▶ null
  ├───┤
1 │ / │  (empty)
  ├───┤
2 │ ● ├──▶ ["dog", 7] ──▶ ["god", 3] ──▶ ["odg", 9]   ← 3-way collision
  ├───┤                                                  lookup here is O(3)
3 │ / │
  ├───┤
4 │ ● ├──▶ ["fish", 2] ──▶ null
  ├───┤
5 │ / │
  ├───┤
6 │ ● ├──▶ ["bird", 5] ──▶ null
  ├───┤
7 │ / │
  └───┘

AFTER RESIZE to capacity 16 (triggered when load factor > 0.75):
every key is rehashed; the chain at bucket 2 splits because bit 3 of the hash
now participates in the index.

  ┌────┐
 2│ ●  ├──▶ ["dog", 7] ──▶ null
  ├────┤
10│ ●  ├──▶ ["god", 3] ──▶ ["odg", 9]
  └────┘
Cost: O(n) for the rehash, amortized O(1) per insert — same doubling argument as
the dynamic array.
```

**Java's `HashMap` specifically:** chaining with a twist. Since Java 8, a bucket whose chain exceeds
`TREEIFY_THRESHOLD = 8` entries (and whose table is ≥ 64 buckets) converts that chain into a
red-black tree, making worst-case lookup O(log n) instead of O(n). It also applies a "spread"
function `h ^ (h >>> 16)` to mix high bits into low bits, because `& (n−1)` only looks at low bits
and many `hashCode()` implementations have poor low-bit entropy. Default load factor 0.75, default
capacity 16, resize doubles.

### Collision resolution: open addressing

No chains. On collision, probe for another slot in the same array.

```
Linear probing, capacity 8:  index, index+1, index+2, ...

  ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐
  │      │ "a"  │ "b"  │ "c"  │      │ "d"  │      │      │
  └──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘
     0      1      2      3      4      5      6      7
              ↑______↑______↑
           "b" and "c" both hashed to 1; they formed a PRIMARY CLUSTER.
           Inserting anything that hashes to 1, 2, or 3 extends the cluster,
           and clusters grow superlinearly as load factor rises.
```

Probing schemes:
- **Linear** `(h + i) mod cap` — best cache behaviour (you probe adjacent slots, same cache line),
  worst clustering.
- **Quadratic** `(h + i²) mod cap` — breaks primary clusters, still has secondary clustering, and
  may fail to find an empty slot unless the capacity is chosen carefully.
- **Double hashing** `(h₁ + i·h₂) mod cap` — best distribution, worst cache behaviour.
- **Robin Hood hashing** — on insert, if the existing entry is "richer" (closer to its home slot)
  than the one you're inserting, swap them. Equalizes probe lengths dramatically. Used by Rust's
  older `HashMap` and many modern implementations.

**Chaining vs open addressing:**

```
┌──────────────────┬──────────────────────────┬──────────────────────────────┐
│                  │ Chaining                 │ Open addressing              │
├──────────────────┼──────────────────────────┼──────────────────────────────┤
│ Load factor      │ can exceed 1.0           │ must stay < 1.0 (~0.7 max)   │
│ Cache behaviour  │ poor (pointer chasing)   │ excellent (contiguous)       │
│ Deletion         │ trivial (unlink)         │ needs tombstones or backshift│
│ Memory           │ per-entry node overhead  │ compact, but sizeable slack  │
│ Degradation      │ graceful                 │ cliff-edge near full         │
│ Used by          │ Java HashMap, Python < 3.6│ Python dict (open, compact),│
│                  │ (conceptually)           │ Go map, Rust hashbrown, V8   │
└──────────────────┴──────────────────────────┴──────────────────────────────┘
```

Modern implementations lean open-addressed because cache locality dominates at real sizes. Rust's
`hashbrown` (a port of Google's SwissTable) stores 1-byte hash fragments in a separate control array
and scans 16 of them at a time with SIMD, so a lookup usually touches two cache lines total.

### Load factor and resizing

`load factor α = entries / buckets`. Expected probe length under chaining is `1 + α/2`; under linear
probing it is roughly `(1 + 1/(1−α)²)/2`, which *explodes* as α → 1.

```
 Linear probing, average probes for an unsuccessful lookup:
   α = 0.50  →   2.5
   α = 0.75  →   8.5
   α = 0.90  →  50.5
   α = 0.95  → 200.5      ← this is your latency cliff
```

That is why open-addressed tables resize at ~0.7-0.9 and never approach 1.0. Resizing is O(n) but
amortizes to O(1) per insert by the same geometric argument as the dynamic array.

**The practical tip:** if you know the size, presize. `new HashMap<>(expected / 0.75f + 1)` avoids
several full rehashes. On a hot path building a 1M-entry map this is a measurable win, and it is a
nice thing to mention when an interviewer asks about optimizing.

### Why worst case is O(n)

If every key hashes to the same bucket, a chained table degenerates to a linked list and lookup is
O(n). This is not hypothetical.

```java
// A pathological key type — legal Java, catastrophic performance.
class BadKey {
    final int id;
    BadKey(int id) { this.id = id; }
    @Override public int hashCode() { return 42; }        // "valid" but constant
    @Override public boolean equals(Object o) {
        return o instanceof BadKey && ((BadKey) o).id == id;
    }
}
// A HashMap<BadKey, V> with 100k entries: every get() is a 100k-element scan.
// (Java 8+ treeifies, so it's O(log n) — but the constant is still awful.)
```

The `hashCode`/`equals` contract: equal objects **must** have equal hash codes. The converse is not
required. Violating the contract makes entries irretrievable — you `put` an object, mutate a field
used in `hashCode`, and can never `get` it again, but it still holds memory. That is a classic
production leak.

### Hash flooding: a real DoS attack

If an attacker can (a) choose your keys and (b) predict your hash function, they can craft thousands
of keys that all collide, converting your O(1) lookups into O(n) and your O(n) request handler into
O(n²).

```
Normal:   1,000 form fields → 1,000 hash inserts → ~1,000 operations → 1 ms
Attack:   1,000 colliding keys → 1 + 2 + ... + 1000 = 500,500 comparisons → seconds
Scale it: 100,000 keys in a JSON body → 5×10⁹ comparisons → the process is gone
```

This was disclosed publicly at 28C3 in 2011 (Klink & Wälde) and hit essentially every web platform
at once — PHP, Java (Tomcat/Jetty), Python, Ruby, ASP.NET, Node.js. A single HTTP POST of a few
hundred KB could pin a CPU core for minutes. CVE-2011-4815 (Ruby), CVE-2011-4885 (PHP),
CVE-2012-0880 (Xerces), and friends.

**The mitigations, in order of quality:**
1. **Randomized/keyed hashing.** Seed the hash function with a per-process random value so the
   attacker cannot precompute collisions. **SipHash** is the standard choice — a keyed PRF that is
   fast on short inputs and cryptographically resistant to collision-finding. Python (3.3+, via
   `PYTHONHASHSEED`), Rust (default hasher), and Ruby all use SipHash for string keys.
2. **Cap the input.** Limit the number of parameters per request (`max_input_vars` in PHP,
   `maxParameterCount` in Tomcat, body-size limits in Express). This was the emergency patch in 2011.
3. **Degrade gracefully.** Java 8's treeification is exactly this: worst case becomes O(log n)
   rather than O(n). It converts a catastrophic failure into a slow one.
4. **Don't put untrusted keys in a hash map at all** when you can use a fixed schema instead.

**The interview version of this answer:** "Hash maps are O(1) *expected*, under the assumption that
the hash function distributes keys uniformly and independently of the input. If an adversary
controls the keys, that assumption is void — that's the hash-flooding attack. Production systems fix
it with randomly-seeded hashing like SipHash, plus input caps."

### When NOT to use a hash map

- **You need ordering.** Hash maps have none. Use a balanced BST (`TreeMap`, `std::map`) for sorted
  iteration and range queries, or a skip list.
- **You need range queries** — "all keys between 100 and 200". O(n) in a hash map, O(log n + k) in a
  tree.
- **Predictable latency matters.** A resize is an O(n) pause. Real-time systems avoid it or pre-size.
- **n is small.** A 16-element linear scan of an array beats hashing on both time and memory.
- **Keys are dense small integers.** Just use an array. `int[26]` for lowercase letters beats
  `HashMap<Character, Integer>` by roughly 10× and interviewers notice when you reach for it.
- **Memory is tight and false positives are acceptable.** A Bloom filter answers "definitely not
  present / probably present" in a few bits per element. Great for "have I seen this URL" at scale.

---

## Linked Lists

Linked lists are rare in production and common in interviews, because they test pointer discipline
and off-by-one reasoning with no library to hide behind.

```java
class ListNode { int val; ListNode next; ListNode(int v) { val = v; } }
```

```javascript
class ListNode { constructor(val, next = null) { this.val = val; this.next = next; } }
```

### The three techniques that solve almost every linked-list problem

**1. Dummy head.** Allocate a fake node before the real head. Every "what if we delete the head"
edge case disappears, because now the head has a predecessor like everything else.

```java
ListNode removeElements(ListNode head, int val) {
    ListNode dummy = new ListNode(0);
    dummy.next = head;
    ListNode prev = dummy;
    while (prev.next != null) {
        if (prev.next.val == val) prev.next = prev.next.next;
        else prev = prev.next;
    }
    return dummy.next;
}
```

**2. Two pointers with an offset.** "Find the nth-from-end" in one pass: advance `fast` by n, then
move both until `fast` hits the end.

**3. Fast/slow (tortoise and hare).** Cycle detection, midpoint, and cycle-start location.

### Reversal — the one you must be able to write cold

```java
// Iterative: O(n) time, O(1) space. This is the expected answer.
ListNode reverse(ListNode head) {
    ListNode prev = null, curr = head;
    while (curr != null) {
        ListNode next = curr.next;   // 1. save the rest of the list
        curr.next = prev;            // 2. flip the pointer backwards
        prev = curr;                 // 3. advance prev
        curr = next;                 // 4. advance curr
    }
    return prev;                     // prev is the new head
}

// Recursive: O(n) time, O(n) stack. Elegant, but say the space cost out loud.
ListNode reverseRec(ListNode head) {
    if (head == null || head.next == null) return head;
    ListNode newHead = reverseRec(head.next);   // reverse everything after head
    head.next.next = head;                      // make the next node point back to head
    head.next = null;                           // head becomes the new tail
    return newHead;
}
```

```javascript
function reverse(head) {
  let prev = null, curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}
```

Trace it on a 3-node list on the whiteboard before you claim it works. Interviewers watch for
whether you dry-run or just assert.

### Floyd's cycle detection — and why the math works

Most candidates can write it. Very few can explain why the second phase finds the cycle entrance.
That explanation is the whole point of asking the question.

```
  Non-cyclic prefix of length μ        Cycle of length λ
 ┌───┬───┬───┬───┐              ┌───┬───┬───┐
 │ 1 │ 2 │ 3 │ 4 ├─────────────▶│ 5 │ 6 │ 7 │
 └───┴───┴───┴───┘              └───┴───┴─┬─┘
   head        entrance ↑                 │
                        └─────────────────┘
       μ = distance from head to entrance
       λ = length of the cycle
```

**Phase 1 — do they meet?**
`slow` moves 1 step per tick, `fast` moves 2. Once both are inside the cycle, consider the gap
between them measured *along the cycle*. Each tick `fast` gains exactly 1 on `slow`, so the gap
shrinks by exactly 1 per tick modulo λ. A quantity that decreases by exactly 1 each step must hit 0.
They cannot "jump past" each other — that is the crux, and it's why the speeds must differ by
exactly 1. (Speeds 1 and 3 differ by 2 and *can* skip past each other in an even-length cycle.)

**Phase 2 — why does restarting at the head find the entrance?**
Let them meet after `slow` has taken `t` steps. Then:
- `slow` travelled `t`, `fast` travelled `2t`.
- `fast` travelled exactly `k` extra full loops: `2t − t = k·λ`, so **`t = k·λ`**.
- `slow` is at position `t` from the head, i.e. `t − μ` steps into the cycle.

Now put a new pointer `p` at the head and advance both `p` and `slow` one step at a time. After `μ`
steps, `p` is at the entrance. And `slow` is at `(t − μ) + μ = t = k·λ` steps into the cycle — which,
mod λ, is 0, i.e. also the entrance. **They meet at the entrance.**

```java
ListNode detectCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) {                 // phase 1: cycle exists
            ListNode p = head;
            while (p != slow) {             // phase 2: find the entrance
                p = p.next;
                slow = slow.next;
            }
            return p;
        }
    }
    return null;                            // O(n) time, O(1) space
}
```

```javascript
function detectCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      let p = head;
      while (p !== slow) { p = p.next; slow = slow.next; }
      return p;
    }
  }
  return null;
}
```

**The follow-up:** "Could you use a hash set instead?" Yes — store visited nodes, O(n) time and
O(n) space, and it's arguably more readable. Floyd's buys you O(1) space. Name the trade-off; don't
pretend Floyd's is strictly better. In real code, the hash-set version is often the one you'd ship.

**Where this actually matters:** cycle detection in object graphs during serialization, detecting
loops in symlink resolution, cycle detection in a `Map<K,V>` chain, and Brent's variant is used for
cycle-finding in pseudo-random sequences (Pollard's rho factorization).

### Merging two sorted lists

```java
ListNode merge(ListNode a, ListNode b) {
    ListNode dummy = new ListNode(0), tail = dummy;
    while (a != null && b != null) {
        if (a.val <= b.val) { tail.next = a; a = a.next; }   // <= keeps it STABLE
        else                { tail.next = b; b = b.next; }
        tail = tail.next;
    }
    tail.next = (a != null) ? a : b;    // attach whichever remains
    return dummy.next;                  // O(m+n) time, O(1) space
}
```

The `<=` rather than `<` is what makes the merge stable. Stability is the reason merge sort is the
default for object sorting in Java. Point it out.

### LRU Cache: the most-asked "design a data structure" question

Requirements: `get(key)` and `put(key, value)` both in **O(1)**, evicting the least recently used
entry when capacity is exceeded.

**Why two data structures.** A hash map gives O(1) lookup but no ordering. A doubly linked list
gives O(1) insert/remove *given a node reference* but O(n) lookup. Combine them: the hash map stores
`key → node`, and the list maintains recency order. This is the canonical example of the linked
list actually being the right choice, precisely because you never traverse it — you always arrive
via the map holding a direct node reference.

```
      HashMap<K, Node>                      Doubly Linked List (recency order)
   ┌────────┬─────────┐
   │   "a"  │  ●──────┼────┐     head                                    tail
   ├────────┼─────────┤    │   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐
   │   "b"  │  ●──────┼──┐ └──▶│ MRU  │◀─▶│  b   │◀─▶│  a   │◀─▶│ LRU  │
   ├────────┼─────────┤  │     │      │   │      │   │      │   │      │
   │   "c"  │  ●──────┼┐ └────▶└──────┘   └──────┘   └──────┘   └──────┘
   └────────┴─────────┘│                       ▲                    │
                       └───────────────────────┘                    ▼
                                                              EVICT FROM HERE

   get(k):  map lookup → node → unlink node → insert at head        O(1)
   put(k,v): if present, update + move to head                      O(1)
             else insert at head; if over capacity, remove tail     O(1)

   Sentinel head/tail nodes remove EVERY null check from unlink/insert.
```

**Full Java implementation:**

```java
class LRUCache {
    private static class Node {
        int key, value;
        Node prev, next;
        Node(int k, int v) { key = k; value = v; }
    }

    private final int capacity;
    private final Map<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0);   // sentinel: most-recently-used side
    private final Node tail = new Node(0, 0);   // sentinel: least-recently-used side

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    public int get(int key) {
        Node node = map.get(key);
        if (node == null) return -1;
        moveToHead(node);
        return node.value;
    }

    public void put(int key, int value) {
        Node node = map.get(key);
        if (node != null) {
            node.value = value;
            moveToHead(node);
            return;
        }
        if (map.size() == capacity) {
            Node lru = tail.prev;      // sentinel guarantees this is a real node
            unlink(lru);
            map.remove(lru.key);       // THIS is why the node stores its own key
        }
        Node fresh = new Node(key, value);
        map.put(key, fresh);
        insertAfterHead(fresh);
    }

    private void unlink(Node n) {
        n.prev.next = n.next;
        n.next.prev = n.prev;
    }

    private void insertAfterHead(Node n) {
        n.next = head.next;
        n.prev = head;
        head.next.prev = n;
        head.next = n;
    }

    private void moveToHead(Node n) { unlink(n); insertAfterHead(n); }
}
```

**Full JavaScript implementation:**

```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = { key: null, value: null };   // sentinels
    this.tail = { key: null, value: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key) {
    const node = this.map.get(key);
    if (!node) return -1;
    this.#moveToHead(node);
    return node.value;
  }

  put(key, value) {
    let node = this.map.get(key);
    if (node) { node.value = value; this.#moveToHead(node); return; }

    if (this.map.size === this.capacity) {
      const lru = this.tail.prev;
      this.#unlink(lru);
      this.map.delete(lru.key);
    }
    node = { key, value };
    this.map.set(key, node);
    this.#insertAfterHead(node);
  }

  #unlink(n) { n.prev.next = n.next; n.next.prev = n.prev; }
  #insertAfterHead(n) {
    n.next = this.head.next; n.prev = this.head;
    this.head.next.prev = n; this.head.next = n;
  }
  #moveToHead(n) { this.#unlink(n); this.#insertAfterHead(n); }
}
```

**Three details that separate a good answer from a great one:**

1. **Sentinel nodes.** Without them, `unlink` needs `if (n.prev == null)` and `if (n.next == null)`
   branches, and the eviction path needs an "is the list empty" check. Sentinels delete all of it.
   State this as a deliberate choice.
2. **The node stores its own key.** On eviction you have the *node* and need to remove the *map
   entry*. Without the back-reference you would have to scan the map — O(n), and the whole design
   collapses. This is the single most common bug in LRU implementations.
3. **In JavaScript, `Map` preserves insertion order**, so you can implement LRU with just a `Map`:
   `delete` then `set` on access moves the key to the end, and `map.keys().next().value` is the LRU.
   Mention it, then say you'll write the explicit list because that's what the question is testing.
   Java has the same shortcut: `LinkedHashMap` with `accessOrder = true` and an overridden
   `removeEldestEntry`.

**The follow-ups you will get:**
- *"Make it thread-safe."* A single lock around get/put kills concurrency because even `get` mutates
  the list. Real caches (Caffeine, Guava) solve this by *buffering* access records in a lock-free
  ring buffer and replaying them onto the eviction policy asynchronously, so reads stay uncontended.
- *"Now implement LFU."* Least-frequently-used, O(1). You need a map of frequency → doubly linked
  list of nodes at that frequency, plus a `minFreq` counter. Harder; the trick is that on access,
  frequency increases by exactly 1, so you only ever move a node to the adjacent frequency bucket.
- *"What eviction policy would you actually use?"* LRU is scan-vulnerable: one large sequential scan
  evicts your entire working set. Production caches use **W-TinyLFU** (Caffeine), **ARC**, or
  **segmented LRU (2Q)** to resist this. Knowing the name W-TinyLFU is a strong senior signal.

---

## Stacks & Queues

### Stack

LIFO. Push, pop, peek — all O(1). Backed by an array (fast, contiguous) or a linked list (no resize
pause). Use `ArrayDeque` in Java, not `Stack` — `java.util.Stack` extends `Vector`, is synchronized
on every operation, and iterates in the wrong order.

Canonical uses: the call stack itself, expression evaluation, undo, matched-delimiter checking,
iterative DFS, and backtracking state.

```java
boolean isValid(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    Map<Character, Character> pairs = Map.of(')', '(', ']', '[', '}', '{');
    for (char c : s.toCharArray()) {
        if (pairs.containsValue(c)) stack.push(c);
        else if (pairs.containsKey(c)) {
            if (stack.isEmpty() || stack.pop() != pairs.get(c)) return false;
        }
    }
    return stack.isEmpty();      // don't forget: leftover openers = invalid
}
```

### Min stack — O(1) push, pop, top, AND getMin

```java
class MinStack {
    private final Deque<int[]> stack = new ArrayDeque<>();   // [value, minSoFar]

    public void push(int val) {
        int min = stack.isEmpty() ? val : Math.min(val, stack.peek()[1]);
        stack.push(new int[]{val, min});
    }
    public void pop()      { stack.pop(); }
    public int top()       { return stack.peek()[0]; }
    public int getMin()    { return stack.peek()[1]; }
}
```

The insight: the minimum of the stack at any moment is determined by the *prefix* of pushes, so it
can be stored alongside each element. O(n) extra space.

**The optimization follow-up:** store the min only when it changes (a second stack of minima, push
only when `val <= currentMin`). Or store `2*val - min` deltas for O(1) extra space — clever but
overflow-prone; mention it, then say you'd ship the readable version.

### Queue and deque

FIFO. Naive array-backed queues are O(n) to dequeue (shift everything). Use a **circular buffer**:

```
capacity 8, head=5, tail=2, size=5
┌────┬────┬────┬────┬────┬────┬────┬────┐
│ 44 │ 55 │    │    │    │ 11 │ 22 │ 33 │
└────┴────┴────┴────┴────┴────┴────┴────┘
   0    1    2    3    4    5    6    7
   ↑         ↑              ↑
 wraps     tail           head

 enqueue: data[tail] = v;  tail = (tail + 1) & (cap - 1);
 dequeue: v = data[head];  head = (head + 1) & (cap - 1);
 Both O(1). The & works because capacity is a power of two.
```

A **deque** (double-ended queue) supports O(1) push/pop at both ends. Java's `ArrayDeque` is a
circular buffer and is the right implementation for both a stack and a queue. JavaScript has no
built-in deque; `Array.shift()` is O(n) in the general case (V8 optimizes small arrays, but do not
rely on it) — implement a circular buffer or use head/tail indices with periodic compaction.

### Queue via two stacks

A classic because the amortized analysis is the point.

```java
class MyQueue {
    private final Deque<Integer> in  = new ArrayDeque<>();
    private final Deque<Integer> out = new ArrayDeque<>();

    public void push(int x) { in.push(x); }

    public int pop() { shift(); return out.pop(); }
    public int peek() { shift(); return out.peek(); }
    public boolean empty() { return in.isEmpty() && out.isEmpty(); }

    private void shift() {                 // only transfer when `out` runs dry
        if (out.isEmpty()) while (!in.isEmpty()) out.push(in.pop());
    }
}
```

**The analysis:** a single `pop` can be O(n) (when it triggers a full transfer). But every element
is pushed to `in` once, popped from `in` once, pushed to `out` once, and popped from `out` once —
4 operations total, ever. Over n operations the total work is O(n), so each operation is **O(1)
amortized**. The bug people write is transferring on *every* pop, which is O(n) per operation.

**The follow-up:** "stack via two queues." Doable, but one of push/pop must be O(n) — there is no
amortization trick that saves you, because a queue gives you no way to hold elements back.

### Monotonic stack

A stack whose contents are kept sorted (increasing or decreasing). It answers "for each element,
what is the nearest element to the left/right that is greater/smaller?" in O(n) total, replacing the
obvious O(n²) double loop. If you see the words *next greater*, *previous smaller*, *span*, or
*largest rectangle*, this is the pattern.

**Next greater element:**

```
 nums = [2, 1, 2, 4, 3]

 i=0  val=2   stack []            push 0            stack(idx)=[0]      vals(2)
 i=1  val=1   1 < 2, push 1       stack=[0,1]                           vals(2,1)
 i=2  val=2   2 > nums[1]=1 → pop 1, ans[1]=2
              2 > nums[0]=2? no (not strictly) → push 2  stack=[0,2]    vals(2,2)
 i=3  val=4   4 > nums[2]=2 → pop 2, ans[2]=4
              4 > nums[0]=2 → pop 0, ans[0]=4
              push 3                                stack=[3]           vals(4)
 i=4  val=3   3 < 4, push 4                         stack=[3,4]         vals(4,3)
 leftovers 3,4 have no next greater → -1

 result = [4, 2, 4, -1, -1]

 The stack always holds indices whose answers are still UNKNOWN, in
 decreasing value order. Each index is pushed once and popped once → O(n).
```

```java
int[] nextGreaterElements(int[] nums) {
    int n = nums.length;
    int[] res = new int[n];
    Arrays.fill(res, -1);
    Deque<Integer> stack = new ArrayDeque<>();       // indices, decreasing values
    for (int i = 0; i < n; i++) {
        while (!stack.isEmpty() && nums[stack.peek()] < nums[i]) {
            res[stack.pop()] = nums[i];              // nums[i] resolves that index
        }
        stack.push(i);
    }
    return res;                                       // O(n) time, O(n) space
}
```

```javascript
function dailyTemperatures(temps) {
  const res = new Array(temps.length).fill(0);
  const stack = [];                       // indices, decreasing temperature
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[stack[stack.length - 1]] < temps[i]) {
      const j = stack.pop();
      res[j] = i - j;                     // days until a warmer temperature
    }
    stack.push(i);
  }
  return res;
}
```

**Largest rectangle in a histogram** — the hardest common monotonic-stack problem, and a genuine
"can you reason under pressure" filter.

The insight: for each bar, the largest rectangle *with that bar as its shortest bar* extends left
until a strictly shorter bar and right until a strictly shorter bar. A monotonic increasing stack
gives you both boundaries in one pass: when you pop bar `j` because `heights[i] < heights[j]`, `i`
is its right boundary and the new stack top is its left boundary.

```
 heights = [2, 1, 5, 6, 2, 3]

       6         ┌─┐
       5      ┌──┤ │
       4      │  │ │
       3      │  │ │      ┌─┐
       2  ┌─┐ │  │ │  ┌───┤ │
       1  │ ├─┤  │ │  │   │ │
          └─┴─┴──┴─┴──┴───┴─┘
           2  1  5  6  2  3

 popping 6 at i=4:  width = 4 - 2 - 1 = 1, area = 6
 popping 5 at i=4:  width = 4 - 1 - 1 = 2, area = 10  ← maximum
 popping 3 at end:  width = 6 - 4 - 1 = 1, area = 3
 popping 2 at end:  width = 6 - 1 - 1 = 4, area = 8
 popping 1 at end:  width = 6 - (-1) - 1 = 6, area = 6
 answer 10
```

```java
int largestRectangleArea(int[] heights) {
    Deque<Integer> stack = new ArrayDeque<>();   // indices, increasing heights
    int best = 0, n = heights.length;
    for (int i = 0; i <= n; i++) {
        int h = (i == n) ? 0 : heights[i];       // sentinel 0 flushes the stack
        while (!stack.isEmpty() && heights[stack.peek()] > h) {
            int height = heights[stack.pop()];
            int left = stack.isEmpty() ? -1 : stack.peek();
            int width = i - left - 1;            // exclusive on both sides
            best = Math.max(best, height * width);
        }
        stack.push(i);
    }
    return best;                                  // O(n) time, O(n) space
}
```

```javascript
function largestRectangleArea(heights) {
  const stack = [];
  let best = 0;
  for (let i = 0; i <= heights.length; i++) {
    const h = i === heights.length ? 0 : heights[i];
    while (stack.length && heights[stack[stack.length - 1]] > h) {
      const height = heights[stack.pop()];
      const left = stack.length ? stack[stack.length - 1] : -1;
      best = Math.max(best, height * (i - left - 1));
    }
    stack.push(i);
  }
  return best;
}
```

The `i <= n` with a virtual zero-height bar is the trick that avoids a duplicated flush loop after
the main loop. Say "I'll append a sentinel bar of height 0 so the stack drains naturally" — it reads
as experience.

**Related:** "Maximal Rectangle" in a binary matrix is this exact function applied row by row to a
running histogram of consecutive 1s. That composition is a favourite follow-up.

### Monotonic deque: sliding window maximum

```java
int[] maxSlidingWindow(int[] nums, int k) {
    Deque<Integer> dq = new ArrayDeque<>();   // indices, DECREASING values
    int[] res = new int[nums.length - k + 1];
    for (int i = 0; i < nums.length; i++) {
        while (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();  // expire
        while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i]) dq.pollLast();
        dq.offerLast(i);                       // ^ anyone smaller can never be the max
        if (i >= k - 1) res[i - k + 1] = nums[dq.peekFirst()];
    }
    return res;                                // O(n) time, O(k) space
}
```

Why it's O(n) and not O(nk): each index is added once and removed once. Why a heap is worse: a heap
gives O(n log k) and needs lazy deletion for expired elements. Offer the heap solution first, then
improve to the deque — that progression is exactly what interviewers want to see.

---

## Trees

### Binary tree basics

```java
class TreeNode { int val; TreeNode left, right; TreeNode(int v) { val = v; } }
```

Terminology you should use precisely: **height** of a node is edges to the deepest leaf; **depth**
is edges from the root. A tree with n nodes has n−1 edges. A *perfect* binary tree of height h has
`2^(h+1) − 1` nodes; a *complete* tree fills every level except possibly the last, which fills
left to right (this is what makes array-backed heaps work); a *balanced* tree has height O(log n).

### Traversals

```
                ┌───┐
                │ 1 │
                └─┬─┘
          ┌───────┴───────┐
        ┌─┴─┐           ┌─┴─┐
        │ 2 │           │ 3 │
        └─┬─┘           └─┬─┘
      ┌───┴───┐           └───┐
    ┌─┴─┐   ┌─┴─┐           ┌─┴─┐
    │ 4 │   │ 5 │           │ 6 │
    └───┘   └───┘           └───┘

  PREORDER   (Root, Left, Right)   1 → 2 → 4 → 5 → 3 → 6
             use: serialize/clone a tree, prefix expressions, top-down state

  INORDER    (Left, Root, Right)   4 → 2 → 5 → 1 → 3 → 6
             use: SORTED order for a BST — this is THE property to remember

  POSTORDER  (Left, Right, Root)   4 → 5 → 2 → 6 → 3 → 1
             use: free/delete a tree, compute a value FROM children upward
                  (height, subtree sums, "is this subtree balanced")

  LEVEL      (BFS, by depth)       1 → 2 → 3 → 4 → 5 → 6
             use: shortest path in an unweighted tree, "by level" outputs,
                  right-side view, minimum depth
```

**Recursive (write these in your sleep):**

```java
void inorder(TreeNode n, List<Integer> out) {
    if (n == null) return;
    inorder(n.left, out);
    out.add(n.val);
    inorder(n.right, out);
}                                        // O(n) time, O(h) stack
```

**Iterative inorder** — the version that shows you actually understand the recursion:

```java
List<Integer> inorderIterative(TreeNode root) {
    List<Integer> out = new ArrayList<>();
    Deque<TreeNode> stack = new ArrayDeque<>();
    TreeNode curr = root;
    while (curr != null || !stack.isEmpty()) {
        while (curr != null) { stack.push(curr); curr = curr.left; }  // dive left
        curr = stack.pop();
        out.add(curr.val);                                            // visit
        curr = curr.right;                                            // then go right
    }
    return out;
}
```

**Iterative preorder** — easiest, because you can push right-then-left:

```javascript
function preorderIterative(root) {
  if (!root) return [];
  const out = [], stack = [root];
  while (stack.length) {
    const n = stack.pop();
    out.push(n.val);
    if (n.right) stack.push(n.right);   // push right FIRST so left pops first
    if (n.left)  stack.push(n.left);
  }
  return out;
}
```

**Iterative postorder** — the trick is to do a modified preorder (Root, Right, Left) and reverse it:

```javascript
function postorderIterative(root) {
  if (!root) return [];
  const out = [], stack = [root];
  while (stack.length) {
    const n = stack.pop();
    out.push(n.val);
    if (n.left)  stack.push(n.left);
    if (n.right) stack.push(n.right);
  }
  return out.reverse();                 // Root,Right,Left reversed = Left,Right,Root
}
```

**Level order (BFS)** — the size-snapshot is what lets you know where levels break:

```java
List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> res = new ArrayList<>();
    if (root == null) return res;
    Queue<TreeNode> q = new ArrayDeque<>();
    q.offer(root);
    while (!q.isEmpty()) {
        int size = q.size();                    // snapshot: exactly this level
        List<Integer> level = new ArrayList<>(size);
        for (int i = 0; i < size; i++) {
            TreeNode n = q.poll();
            level.add(n.val);
            if (n.left  != null) q.offer(n.left);
            if (n.right != null) q.offer(n.right);
        }
        res.add(level);
    }
    return res;                                  // O(n) time, O(w) space, w = max width
}
```

**Morris traversal** exists for O(1) space inorder — it temporarily rewires right pointers of
predecessors to create threads back to the successor, then undoes them. Worth naming ("if you need
O(1) space I'd use Morris traversal") without writing it, unless asked.

### Binary Search Tree

Invariant: for every node, *all* keys in the left subtree are less, *all* keys in the right subtree
are greater. "All", not just the immediate children — that is the bug in the naive `isValidBST`.

```java
// WRONG — only checks parent/child, misses violations deeper down
boolean isValidBSTWrong(TreeNode n) {
    if (n == null) return true;
    if (n.left != null && n.left.val >= n.val) return false;
    if (n.right != null && n.right.val <= n.val) return false;
    return isValidBSTWrong(n.left) && isValidBSTWrong(n.right);
}
// Fails on:      5
//               / \
//              1   6        4 < 5 but sits in the RIGHT subtree of 5
//                 / \
//                4   7

// RIGHT — carry down the permitted open interval
boolean isValidBST(TreeNode n, Long min, Long max) {
    if (n == null) return true;
    if (n.val <= min || n.val >= max) return false;
    return isValidBST(n.left, min, (long) n.val)
        && isValidBST(n.right, (long) n.val, max);
}
// call: isValidBST(root, Long.MIN_VALUE, Long.MAX_VALUE)
// Long bounds matter: a node holding Integer.MIN_VALUE breaks int sentinels.
```

**Insert and search:**

```java
TreeNode insert(TreeNode root, int val) {
    if (root == null) return new TreeNode(val);
    if (val < root.val) root.left  = insert(root.left, val);
    else if (val > root.val) root.right = insert(root.right, val);
    return root;                       // O(h): O(log n) balanced, O(n) degenerate
}
```

**Delete** — three cases, and the third is the one people fumble:

```java
TreeNode delete(TreeNode root, int key) {
    if (root == null) return null;
    if (key < root.val)      root.left  = delete(root.left, key);
    else if (key > root.val) root.right = delete(root.right, key);
    else {
        if (root.left == null)  return root.right;   // case 1&2: 0 or 1 child
        if (root.right == null) return root.left;
        TreeNode succ = root.right;                  // case 3: 2 children
        while (succ.left != null) succ = succ.left;  // inorder successor = min of right
        root.val = succ.val;                         // copy value up
        root.right = delete(root.right, succ.val);   // delete the successor (has ≤1 child)
    }
    return root;
}
```

### The degenerate-to-O(n) failure

```
Insert 1,2,3,4,5 into an unbalanced BST in sorted order:

  1                          A balanced BST with the same keys:
   \
    2                                  3
     \                                / \
      3                              2   4
       \                            /     \
        4                          1       5
         \
          5                    height 2, search = 3 comparisons

  height 4 — this is a LINKED LIST
  search = 5 comparisons, and it gets worse linearly
```

**This is not an edge case; it is the common case.** Data arrives sorted far more often than you
expect: auto-increment IDs, timestamps, alphabetized names, imported CSVs. An unbalanced BST fed
sorted input is a linked list with extra memory overhead. That is why nobody ships a plain BST.

### Balancing: AVL vs Red-Black

Both are self-balancing BSTs that guarantee O(log n) via rotations. The difference is *how strictly*
they balance, which trades read speed against write speed.

```
┌───────────────────┬──────────────────────────┬─────────────────────────────┐
│                   │ AVL                      │ Red-Black                   │
├───────────────────┼──────────────────────────┼─────────────────────────────┤
│ Balance invariant │ |height(L) − height(R)|  │ no path is more than 2× the │
│                   │ ≤ 1 for every node       │ length of any other path    │
│ Max height        │ ~1.44 · log₂ n           │ ~2 · log₂ n                 │
│ Lookup            │ faster (shorter tree)    │ slightly slower             │
│ Insert rotations  │ ≤ 2                      │ ≤ 2                         │
│ Delete rotations  │ O(log n) — can cascade   │ ≤ 3, amortized O(1)         │
│ Per-node overhead │ height/balance int       │ 1 colour bit                │
│ Best for          │ read-heavy workloads     │ write-heavy / mixed         │
└───────────────────┴──────────────────────────┴─────────────────────────────┘
```

**Who uses what, in real libraries:**
- **Red-black**: Java `TreeMap`/`TreeSet`; C++ `std::map`/`std::set` (in every mainstream STL);
  the Linux kernel's CFS scheduler, `epoll` interval tracking, and virtual memory area tree;
  Java 8+ `HashMap` bucket treeification.
- **AVL**: read-heavy in-memory indexes; some database index implementations; Windows NT's virtual
  address descriptor tree historically.
- **B-trees / B+ trees**: every disk-based database index (PostgreSQL, MySQL InnoDB, SQLite) and
  every filesystem (ext4, NTFS, APFS). The reason is not asymptotic — it is that a node is sized to
  a disk page (4-16 KB), so one I/O fetches hundreds of keys. A B-tree of order 500 holding 10⁹ keys
  has height 4. That is 4 disk reads instead of 30. **This is the memory-hierarchy argument from
  earlier, applied at the storage layer.** If an interviewer asks "why don't databases use
  red-black trees", that is the answer.
- **Skip lists**: Redis sorted sets, LevelDB/RocksDB memtables. Probabilistic O(log n), far simpler
  to make lock-free than a balanced tree.

**In an interview, you will almost never implement AVL rotations.** What you need is: (a) know a
plain BST degenerates, (b) know self-balancing trees fix it via rotations, (c) know the AVL/RB
trade-off in one sentence, (d) know what real libraries use. That is a complete senior answer.

### Lowest Common Ancestor

**In a BST** — use the ordering, O(h), no extra space:

```java
TreeNode lcaBST(TreeNode root, TreeNode p, TreeNode q) {
    while (root != null) {
        if (p.val < root.val && q.val < root.val)      root = root.left;
        else if (p.val > root.val && q.val > root.val) root = root.right;
        else return root;   // the split point IS the LCA
    }
    return null;
}
```

**In a general binary tree** — the elegant postorder solution:

```java
TreeNode lca(TreeNode root, TreeNode p, TreeNode q) {
    if (root == null || root == p || root == q) return root;
    TreeNode left  = lca(root.left,  p, q);
    TreeNode right = lca(root.right, p, q);
    if (left != null && right != null) return root;   // p and q split here → LCA
    return left != null ? left : right;               // both on one side, bubble up
}
```

```javascript
function lca(root, p, q) {
  if (!root || root === p || root === q) return root;
  const left = lca(root.left, p, q);
  const right = lca(root.right, p, q);
  if (left && right) return root;
  return left || right;
}
```

**Why it works:** the function returns "the LCA if found in this subtree, otherwise whichever of
p/q was found, otherwise null". If both sides return non-null, this node is the meeting point. If
only one side does, the answer (or the single found node) is on that side. O(n) time, O(h) space.

**The follow-up:** "what if you have to answer many LCA queries?" Preprocess with **binary lifting**
(`up[k][v]` = the 2ᵏ-th ancestor of v): O(n log n) build, O(log n) per query. Or Euler tour + sparse
table for O(n log n) build and O(1) query. Or, if nodes have parent pointers, walk both to the same
depth and ascend in lockstep — O(h) with O(1) space.

### Serialize and deserialize

```java
// Preorder with explicit null markers. The nulls are what make it unambiguous.
public String serialize(TreeNode root) {
    StringBuilder sb = new StringBuilder();
    ser(root, sb);
    return sb.toString();
}
private void ser(TreeNode n, StringBuilder sb) {
    if (n == null) { sb.append("#,"); return; }
    sb.append(n.val).append(',');
    ser(n.left, sb);
    ser(n.right, sb);
}

public TreeNode deserialize(String data) {
    Deque<String> tokens = new ArrayDeque<>(Arrays.asList(data.split(",")));
    return des(tokens);
}
private TreeNode des(Deque<String> t) {
    String s = t.poll();
    if (s.equals("#")) return null;
    TreeNode n = new TreeNode(Integer.parseInt(s));
    n.left  = des(t);        // preorder consumption order MUST match production order
    n.right = des(t);
    return n;
}
```

**The point to make:** preorder or postorder alone is enough *if you emit null markers*. Without
markers you need two traversals (preorder + inorder), and even that fails when values repeat.
Interviewers ask "could you do it with inorder alone?" — the answer is no, because inorder of a
tree and inorder of its mirror can be identical, so the structure is not recoverable.

### Trie (prefix tree)

Stores strings by shared prefix. Lookup is O(m) in the key length, *independent of how many keys are
stored* — that is the property that makes it beat a hash map for prefix queries.

```
Insert: "cat", "car", "card", "dog"

                (root)
                /     \
              c         d
              │         │
              a         o
             / \        │
            t   r       g*
            *   │\
                * d
                  │
                  *          * = end-of-word flag

 startsWith("ca") → walk c→a → node exists → true       O(2)
 search("car")    → walk c→a→r → isEnd == true → true   O(3)
 search("ca")     → node exists but isEnd == false → false
```

```java
class Trie {
    private static class Node {
        Node[] children = new Node[26];    // dense array: fast, 26 refs per node
        boolean isEnd;
    }
    private final Node root = new Node();

    public void insert(String word) {
        Node cur = root;
        for (char c : word.toCharArray()) {
            int i = c - 'a';
            if (cur.children[i] == null) cur.children[i] = new Node();
            cur = cur.children[i];
        }
        cur.isEnd = true;                                    // O(m)
    }

    public boolean search(String word) {
        Node n = find(word);
        return n != null && n.isEnd;                         // O(m)
    }

    public boolean startsWith(String prefix) {
        return find(prefix) != null;                         // O(m)
    }

    private Node find(String s) {
        Node cur = root;
        for (char c : s.toCharArray()) {
            cur = cur.children[c - 'a'];
            if (cur == null) return null;
        }
        return cur;
    }
}
```

```javascript
class Trie {
  constructor() { this.root = { children: new Map(), isEnd: false }; }

  insert(word) {
    let cur = this.root;
    for (const c of word) {
      if (!cur.children.has(c)) cur.children.set(c, { children: new Map(), isEnd: false });
      cur = cur.children.get(c);
    }
    cur.isEnd = true;
  }

  #find(s) {
    let cur = this.root;
    for (const c of s) {
      cur = cur.children.get(c);
      if (!cur) return null;
    }
    return cur;
  }

  search(word)      { const n = this.#find(word); return !!n && n.isEnd; }
  startsWith(pfx)   { return this.#find(pfx) !== null; }
}
```

**The trade-off to state:** an array-of-26 per node is fast but wastes memory on sparse tries
(26 references × 8 bytes = 208 bytes per node even for a single-child chain). A `HashMap` per node
is compact but slower and has per-entry overhead. For large dictionaries you'd use a **compressed
trie (radix tree / PATRICIA trie)**, which collapses single-child chains into one edge holding a
whole substring. That is what IP routing tables and `etcd`'s key store use.

**Real uses:** autocomplete, spell check, IP longest-prefix-match routing, T9 predictive text,
Aho-Corasick multi-pattern matching (a trie plus failure links — the algorithm behind `grep -F` with
many patterns and most intrusion-detection engines).

**The follow-up:** "Word Search II" — find all dictionary words in a 2D board. Backtracking over the
board *guided by the trie* prunes enormously: the moment the current path isn't a prefix of any
word, you stop. Doing DFS per word instead is orders of magnitude slower. This composition is a
favourite hard question.

### Segment tree and Fenwick tree (conceptually)

Both answer **range queries with point updates** in O(log n). Prefix sums give O(1) queries but O(n)
updates; these give O(log n) for both, which wins when updates and queries are interleaved.

**Segment tree** — a binary tree where each node stores an aggregate over a range.

```
 array = [1, 3, 5, 7, 9, 11], aggregate = sum

                    [0..5] = 36
                   /            \
           [0..2] = 9        [3..5] = 27
           /      \           /       \
     [0..1]=4   [2..2]=5  [3..4]=16  [5..5]=11
      /    \                 /   \
  [0]=1  [1]=3           [3]=7  [4]=9

 query(1..4): decompose into [1..1] + [2..2] + [3..4] = 3 + 5 + 16 = 24
              at most 2 nodes per level → O(log n)
 update(2, x): fix [2..2], then [0..2], then [0..5] → O(log n) along one path
```

Stored as an array of size 4n (or 2n for the iterative bottom-up version). The killer feature is
generality: it works for **any associative operation** — sum, min, max, gcd, "number of distinct
values", matrix product. With **lazy propagation** it also supports range *updates* in O(log n).

**Fenwick tree (Binary Indexed Tree)** — same O(log n) prefix sums, but ~4× less memory, a much
shorter implementation, and a better constant factor. The limitation: it only handles *invertible*
operations (sum, xor — but not min/max, because you can't subtract a min).

```java
class Fenwick {
    private final long[] tree;                  // 1-indexed
    Fenwick(int n) { tree = new long[n + 1]; }

    void update(int i, long delta) {            // i is 0-based externally
        for (i++; i < tree.length; i += i & (-i)) tree[i] += delta;
    }
    long prefixSum(int i) {                     // sum of [0..i]
        long s = 0;
        for (i++; i > 0; i -= i & (-i)) s += tree[i];
        return s;
    }
    long rangeSum(int l, int r) { return prefixSum(r) - prefixSum(l - 1); }
}
```

`i & (-i)` isolates the lowest set bit — that's the "how many elements does this node cover" trick,
and it's why the tree is *binary indexed*.

**When each is the right call:**
- Static array, many range queries, no updates → **prefix sums**, O(1) query.
- Point updates + prefix sums → **Fenwick**, simplest and fastest.
- Range min/max/gcd, or range updates → **segment tree** (+ lazy propagation).
- Static array, range min/max only, no updates → **sparse table**, O(n log n) build, O(1) query.
- **Real-world:** time-series aggregation, leaderboard rank queries ("how many players scored above
  X"), inversion counting, and computational geometry sweeps.

These show up in maybe 5% of interviews. Know what they do and when; don't burn prep time
implementing lazy propagation unless you're targeting a competitive-programming-heavy company.

---

## Heaps & Priority Queues

### The array representation

A binary heap is a **complete binary tree** stored in a flat array. Because the tree is complete,
you never need pointers — the structure is implied by the indices. That is the whole trick, and it's
why heaps are so cache-friendly compared to pointer-based trees.

```
 MIN-HEAP (parent ≤ both children)

                  ┌───┐
                  │ 1 │  idx 0
                  └─┬─┘
            ┌───────┴───────┐
          ┌─┴─┐           ┌─┴─┐
          │ 3 │ idx 1     │ 2 │ idx 2
          └─┬─┘           └─┬─┘
       ┌────┴────┐       ┌──┴───┐
     ┌─┴─┐     ┌─┴─┐   ┌─┴─┐  ┌─┴─┐
     │ 7 │     │ 5 │   │ 4 │  │ 6 │
     └───┘     └───┘   └───┘  └───┘
      idx 3     idx 4   idx 5  idx 6

 STORED AS:
 ┌───┬───┬───┬───┬───┬───┬───┐
 │ 1 │ 3 │ 2 │ 7 │ 5 │ 4 │ 6 │
 └───┴───┴───┴───┴───┴───┴───┘
   0   1   2   3   4   5   6

 parent(i)     = (i - 1) / 2
 leftChild(i)  = 2i + 1
 rightChild(i) = 2i + 2

 Contiguous memory. No pointers, no allocation per node, prefetcher-friendly.
 NOTE: the array is NOT sorted. Level order ≠ sorted order. Only the
 parent-child relation is guaranteed. This trips people up constantly.
```

### Sift-up and sift-down

```java
class MinHeap {
    private int[] a;
    private int size;

    MinHeap(int cap) { a = new int[cap]; }

    void push(int v) {
        if (size == a.length) a = Arrays.copyOf(a, size * 2);
        a[size] = v;
        siftUp(size++);                              // O(log n)
    }

    int pop() {
        int min = a[0];
        a[0] = a[--size];                            // move last element to root
        siftDown(0);                                 // restore the heap property
        return min;                                  // O(log n)
    }

    private void siftUp(int i) {
        while (i > 0) {
            int p = (i - 1) / 2;
            if (a[p] <= a[i]) break;                 // parent is smaller → done
            swap(i, p);
            i = p;
        }
    }

    private void siftDown(int i) {
        while (true) {
            int l = 2 * i + 1, r = 2 * i + 2, smallest = i;
            if (l < size && a[l] < a[smallest]) smallest = l;
            if (r < size && a[r] < a[smallest]) smallest = r;
            if (smallest == i) break;
            swap(i, smallest);
            i = smallest;
        }
    }
    private void swap(int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }
}
```

```javascript
class MinHeap {
  constructor(cmp = (x, y) => x - y) { this.a = []; this.cmp = cmp; }
  get size() { return this.a.length; }
  peek() { return this.a[0]; }

  push(v) {
    this.a.push(v);
    let i = this.a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.cmp(this.a[p], this.a[i]) <= 0) break;
      [this.a[p], this.a[i]] = [this.a[i], this.a[p]];
      i = p;
    }
  }

  pop() {
    const top = this.a[0], last = this.a.pop();
    if (this.a.length) {
      this.a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = 2 * i + 2;
        let best = i;
        if (l < this.a.length && this.cmp(this.a[l], this.a[best]) < 0) best = l;
        if (r < this.a.length && this.cmp(this.a[r], this.a[best]) < 0) best = r;
        if (best === i) break;
        [this.a[best], this.a[i]] = [this.a[i], this.a[best]];
        i = best;
      }
    }
    return top;
  }
}
```

JavaScript has **no built-in priority queue**. If you're interviewing in JS, be ready to write the
20 lines above from memory, or negotiate: "I'll assume a `MinHeap` with push/pop; I can implement it
if you'd like." Most interviewers accept the assumption; some want to see it. Java has
`PriorityQueue` (a binary min-heap; pass a `Comparator` for max-heap or custom ordering).

### Why heapify is O(n), not O(n log n)

Building a heap from an unordered array by calling `push` n times is O(n log n). But **Floyd's
build-heap** — sift-down every node from the last internal node backwards — is O(n). Being able to
prove this is a strong signal.

```java
void buildHeap(int[] a) {
    for (int i = a.length / 2 - 1; i >= 0; i--) siftDown(a, i, a.length);
}
```

**The proof.** In a heap of n nodes, the number of nodes at height h is at most `⌈n / 2^(h+1)⌉`.
Sifting down a node of height h costs O(h). Total:

```
T(n)  =  Σ (h = 0 to log n)  ⌈n / 2^(h+1)⌉ · O(h)
      ≤  n · Σ (h = 0 to ∞)  h / 2^(h+1)
      =  (n/2) · Σ (h = 0 to ∞)  h / 2^h

Using  Σ (h=0 to ∞) h·xʰ = x / (1−x)²  at  x = 1/2:
       Σ h / 2^h  =  (1/2) / (1/4)  =  2

T(n)  ≤  (n/2) · 2  =  n     →   T(n) = O(n)
```

**The intuition, which is what you should actually say out loud:**

```
                        node count    max sift distance    work
  level 0 (root)              1              log n         log n
  level 1                     2              log n − 1     2(log n − 1)
  ...
  second-to-last level      n/4                  2           n/2
  LAST LEVEL (leaves)       n/2                  0           0     ← half the nodes
                                                                     cost NOTHING

 Half the nodes are leaves and do zero work. A quarter sift at most 1 level.
 The expensive nodes are the rare ones near the root. The series converges.
```

Contrast with heap*sort*, which is O(n log n): building the heap is O(n), but then you extract n
elements and each extraction sifts down from the root — a full O(log n) every time. There's no
convergent series to save you there.

### The top-K pattern

"Find the K largest/smallest/most-frequent." The naive approach sorts everything: O(n log n). A heap
of size K gives **O(n log k)**, which is a large win when k ≪ n, and — crucially — it needs only
O(k) memory, so it works on a **stream** where n doesn't fit in RAM.

**The counter-intuitive part that interviewers probe:** to find the K *largest*, you use a **MIN**
heap of size K. The heap's root is the smallest of your current top-K, which is exactly the element
to evict when something bigger arrives.

```java
int[] topK(int[] nums, int k) {
    PriorityQueue<Integer> minHeap = new PriorityQueue<>();   // MIN heap for K LARGEST
    for (int x : nums) {
        minHeap.offer(x);
        if (minHeap.size() > k) minHeap.poll();               // evict the smallest
    }
    int[] res = new int[k];
    for (int i = k - 1; i >= 0; i--) res[i] = minHeap.poll();
    return res;                          // O(n log k) time, O(k) space
}
```

```javascript
function topKFrequent(nums, k) {
  const freq = new Map();
  for (const x of nums) freq.set(x, (freq.get(x) ?? 0) + 1);

  const heap = new MinHeap((a, b) => a[1] - b[1]);   // compare by frequency
  for (const entry of freq) {
    heap.push(entry);
    if (heap.size > k) heap.pop();
  }
  return heap.a.map(e => e[0]);          // O(n log k) time, O(n) space for the map
}
```

**The follow-ups, in the order they come:**
1. *"Can you do better than O(n log k)?"* Yes — **Quickselect** gives O(n) expected, O(n²) worst.
   Partition around a random pivot; recurse into only the side containing index k. But it mutates
   the array, doesn't work on streams, and has a bad worst case. State the trade-off.
2. *"What if the values are bounded integers?"* **Bucket sort by frequency** — O(n) guaranteed. For
   `topKFrequent`, frequencies are in [1, n], so bucket by frequency and read from the top.
3. *"What if n doesn't fit on one machine?"* Each shard computes its local top-K, then merge the
   shards' heaps. Top-K is decomposable, which is why it maps cleanly onto MapReduce.

### Two heaps: the running median

Maintain a **max-heap of the smaller half** and a **min-heap of the larger half**, kept balanced in
size. The median is either the max-heap root (odd count) or the average of the two roots (even).

```
 stream so far: 5, 15, 1, 3

   MAX-HEAP (lower half)        MIN-HEAP (upper half)
        ┌───┐                        ┌────┐
        │ 3 │  ← root = 3            │  5 │  ← root = 5
        └─┬─┘                        └─┬──┘
          │                            │
        ┌─┴─┐                        ┌─┴──┐
        │ 1 │                        │ 15 │
        └───┘                        └────┘

   sizes 2 and 2 → median = (3 + 5) / 2 = 4

   INVARIANTS:
     every element in lower ≤ every element in upper
     |size(lower) − size(upper)| ≤ 1
```

```java
class MedianFinder {
    private final PriorityQueue<Integer> lower =                 // max-heap
        new PriorityQueue<>(Collections.reverseOrder());
    private final PriorityQueue<Integer> upper = new PriorityQueue<>();  // min-heap

    public void addNum(int num) {
        lower.offer(num);                    // always push to lower first
        upper.offer(lower.poll());           // move its max to upper (keeps ordering)
        if (upper.size() > lower.size())     // rebalance
            lower.offer(upper.poll());
    }

    public double findMedian() {
        return lower.size() > upper.size()
             ? lower.peek()
             : (lower.peek() + upper.peek()) / 2.0;
    }
}                                            // add: O(log n), find: O(1)
```

The push-then-transfer-then-rebalance dance guarantees the ordering invariant without any explicit
comparison. Explain that: "I push into `lower`, immediately move `lower`'s max into `upper`, which
guarantees every element in `lower` is ≤ every element in `upper`. Then I rebalance sizes."

**The follow-up:** "what if you need the 90th percentile instead of the median?" Same two-heap
structure with a 9:1 size ratio instead of 1:1. And "what if there are billions of values?" — you
switch to an approximate sketch (t-digest, HdrHistogram) because exact quantiles need O(n) memory.
That is the actual production answer for latency percentiles.

### K-way merge

Merge k sorted lists into one. A min-heap holding one element from each list gives O(N log k), where
N is the total element count.

```java
ListNode mergeKLists(ListNode[] lists) {
    PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);
    for (ListNode l : lists) if (l != null) pq.offer(l);

    ListNode dummy = new ListNode(0), tail = dummy;
    while (!pq.isEmpty()) {
        ListNode n = pq.poll();
        tail.next = n;
        tail = n;
        if (n.next != null) pq.offer(n.next);   // pull the next from that same list
    }
    return dummy.next;                           // O(N log k) time, O(k) space
}
```

**The alternative worth naming:** divide and conquer — merge lists pairwise, log k rounds, each
round touching all N elements → also O(N log k), but with O(1) extra space and a better constant
because there's no heap. Both are correct; mentioning both and comparing the space is the senior
answer.

**Where this is real:** external sorting (sort 1 TB with 8 GB of RAM — sort chunks, write runs,
k-way merge them back), LSM-tree compaction in RocksDB/Cassandra, and merging sorted shard results
in a distributed query engine.

---

## Graphs

### Representations, with real memory numbers

```
 GRAPH:   1 ──── 2
          │      │
          │      │
          3 ──── 4 ──── 5

 ADJACENCY MATRIX                    ADJACENCY LIST
    1  2  3  4  5                    1 → [2, 3]
 1 [0][1][1][0][0]                   2 → [1, 4]
 2 [1][0][0][1][0]                   3 → [1, 4]
 3 [1][0][0][1][0]                   4 → [2, 3, 5]
 4 [0][1][1][0][1]                   5 → [4]
 5 [0][0][0][1][0]

 Space  O(V²)                        Space  O(V + E)
 Edge?  O(1)                         Edge?  O(degree(v))
 Neighbours of v: O(V)               Neighbours of v: O(degree(v))
 Add edge: O(1)                      Add edge: O(1)
```

**The memory trade-off with real numbers.** Consider a social graph: V = 1,000,000 users, average
150 friends each, so E ≈ 75,000,000 undirected edges.

```
 ADJACENCY MATRIX
   1,000,000 × 1,000,000 bits (bitset, the most compact possible)
   = 10¹² bits = 125 GB          → does not fit anywhere, and 99.99985% zeros
   With byte cells: 1 TB. With int cells: 4 TB.

 ADJACENCY LIST
   150,000,000 directed entries × 4 bytes (int ids)  = 600 MB
   + 1,000,000 list headers × ~16 bytes              =  16 MB
   ≈ 620 MB                       → fits in RAM on a laptop

 Ratio: ~200×.
```

**The crossover.** A matrix is competitive only when the graph is *dense*: E ≈ V². Rule of thumb —
use a matrix when V ≤ ~1000 and the graph is dense (or when you need O(1) edge existence checks, as
in Floyd-Warshall). Use a list otherwise. Real-world graphs — social networks, road networks, web
link graphs, dependency graphs — are overwhelmingly sparse, so the adjacency list is the default and
should be your first suggestion.

```java
// Adjacency list, the shape you'll write in an interview
List<List<Integer>> graph = new ArrayList<>();
for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
for (int[] e : edges) {
    graph.get(e[0]).add(e[1]);
    graph.get(e[1]).add(e[0]);      // omit this line for a DIRECTED graph
}
```

```javascript
const graph = Array.from({ length: n }, () => []);
for (const [u, v] of edges) { graph[u].push(v); graph[v].push(u); }
```

Also worth naming: **edge list** (just an array of `(u, v, w)`) — the right representation for
Kruskal's MST and Bellman-Ford, because both iterate over edges rather than neighbours. And **CSR
(compressed sparse row)** — two flat arrays, offsets and targets — which is what high-performance
graph libraries actually use, because it is contiguous and prefetch-friendly.

### BFS vs DFS: how the frontier expands

```
 GRAPH (grid-ish), start at S:

     S ── A ── D
     │    │    │
     B ── C ── E
     │         │
     F ─────── G

 BFS — expands in RINGS by distance. Uses a QUEUE.
 ┌─────────────────────────────────────────────────────┐
 │ depth 0:  {S}                                       │
 │ depth 1:  {A, B}          ← all neighbours of S     │
 │ depth 2:  {D, C, F}       ← all neighbours of ring1 │
 │ depth 3:  {E, G}                                    │
 └─────────────────────────────────────────────────────┘
   Frontier width can reach O(V). Memory = widest level.
   FIRST time you reach a node = SHORTEST path (unweighted). This is the
   whole reason BFS exists.

 DFS — plunges down ONE path to exhaustion, then backtracks. Uses a STACK.
 ┌─────────────────────────────────────────────────────┐
 │  S → A → D → E → C → B → F → G                      │
 │                                                     │
 │  S                                                  │
 │  └─ A                                               │
 │     └─ D                                            │
 │        └─ E                                         │
 │           └─ C                                      │
 │              └─ B                                   │
 │                 └─ F                                │
 │                    └─ G      ← depth 7              │
 └─────────────────────────────────────────────────────┘
   Frontier is a single PATH. Memory = O(depth), can reach O(V).
   The first path found is NOT necessarily shortest.

 Both are O(V + E) time and O(V) space in the worst case.
 Choose BFS for: shortest path (unweighted), level structure, minimum steps.
 Choose DFS for: connectivity, cycle detection, topological order, all paths,
                 backtracking, and anything defined recursively on subtrees.
```

```java
// BFS with distance tracking
int[] bfs(List<List<Integer>> g, int start) {
    int[] dist = new int[g.size()];
    Arrays.fill(dist, -1);
    Queue<Integer> q = new ArrayDeque<>();
    q.offer(start);
    dist[start] = 0;
    while (!q.isEmpty()) {
        int u = q.poll();
        for (int v : g.get(u)) {
            if (dist[v] == -1) {           // mark on ENQUEUE, not on dequeue
                dist[v] = dist[u] + 1;
                q.offer(v);
            }
        }
    }
    return dist;
}
```

**Mark visited when you enqueue, not when you dequeue.** If you mark on dequeue, a node can be
enqueued many times before it's processed, and on a dense graph the queue blows up to O(E). This is
a real bug, not a style preference.

```java
// DFS, recursive and iterative
void dfs(List<List<Integer>> g, int u, boolean[] seen) {
    seen[u] = true;
    for (int v : g.get(u)) if (!seen[v]) dfs(g, v, seen);
}

void dfsIterative(List<List<Integer>> g, int start, boolean[] seen) {
    Deque<Integer> stack = new ArrayDeque<>();
    stack.push(start);
    while (!stack.isEmpty()) {
        int u = stack.pop();
        if (seen[u]) continue;             // may be pushed multiple times
        seen[u] = true;
        for (int v : g.get(u)) if (!seen[v]) stack.push(v);
    }
}
```

Note the iterative version needs the `if (seen[u]) continue` guard because a node can sit on the
stack more than once. The recursive version doesn't, because it marks before descending. Pointing
this out shows you actually understand the conversion rather than having memorized two snippets.

**Multi-source BFS** is a pattern worth having ready: seed the queue with *all* sources at distance
0 and run one BFS. That solves "rotting oranges", "walls and gates", "shortest distance to any
0 in a matrix" in O(V + E) rather than running |sources| separate BFS runs.

### Topological sort

A linear ordering of a DAG's vertices such that every edge `u → v` puts `u` before `v`. Exists
**if and only if** the graph is acyclic — which is why topological sort doubles as a cycle detector
for directed graphs.

**Kahn's algorithm (BFS-based).** Repeatedly remove a node with in-degree 0.

```java
int[] topoSortKahn(int n, int[][] edges) {
    List<List<Integer>> g = new ArrayList<>();
    for (int i = 0; i < n; i++) g.add(new ArrayList<>());
    int[] indegree = new int[n];
    for (int[] e : edges) { g.get(e[0]).add(e[1]); indegree[e[1]]++; }

    Queue<Integer> q = new ArrayDeque<>();
    for (int i = 0; i < n; i++) if (indegree[i] == 0) q.offer(i);

    int[] order = new int[n];
    int idx = 0;
    while (!q.isEmpty()) {
        int u = q.poll();
        order[idx++] = u;
        for (int v : g.get(u)) {
            if (--indegree[v] == 0) q.offer(v);   // v is now unblocked
        }
    }
    if (idx != n) return new int[0];   // CYCLE: some nodes never reached in-degree 0
    return order;                       // O(V + E) time, O(V) space
}
```

```javascript
function canFinish(numCourses, prerequisites) {
  const g = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [course, prereq] of prerequisites) { g[prereq].push(course); indeg[course]++; }

  const q = [];
  for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) q.push(i);

  let done = 0;
  for (let head = 0; head < q.length; head++) {   // array-as-queue, no shift()
    done++;
    for (const v of g[q[head]]) if (--indeg[v] === 0) q.push(v);
  }
  return done === numCourses;
}
```

**DFS-based topological sort.** Push each node onto a list *after* all its descendants are
processed; reverse at the end.

```java
boolean dfsTopo(int u, List<List<Integer>> g, int[] state, Deque<Integer> out) {
    state[u] = 1;                                 // 1 = in the current recursion stack
    for (int v : g.get(u)) {
        if (state[v] == 1) return false;          // BACK EDGE → cycle
        if (state[v] == 0 && !dfsTopo(v, g, state, out)) return false;
    }
    state[u] = 2;                                 // 2 = fully processed
    out.push(u);                                  // prepend → reverse postorder
    return true;
}
```

**Kahn's vs DFS:** Kahn's is iterative (no stack-overflow risk), naturally detects cycles by
counting, and can produce a *lexicographically smallest* order if you use a priority queue instead
of a plain queue. DFS is shorter but recursive. In production build systems (Make, Bazel, npm
dependency resolution, Spring bean initialization, database migration ordering), Kahn's is the usual
choice because you also want to report *which* nodes are in the cycle.

### Cycle detection: directed vs undirected is not the same problem

This distinction is a favourite trap.

**Directed graph — you need three colours.** A node you've already finished is not a cycle; only a
node *currently on the recursion stack* is.

```java
// state: 0 = unvisited (WHITE), 1 = in progress (GRAY), 2 = done (BLACK)
boolean hasCycleDirected(int u, List<List<Integer>> g, int[] state) {
    state[u] = 1;
    for (int v : g.get(u)) {
        if (state[v] == 1) return true;                       // back edge to GRAY = cycle
        if (state[v] == 0 && hasCycleDirected(v, g, state)) return true;
    }
    state[u] = 2;
    return false;
}
```

If you use a simple `visited` boolean, you'd falsely report a cycle in the diamond `A→B, A→C, B→D,
C→D`: D is visited twice but there is no cycle. The two-colour version is wrong. Say this.

**Undirected graph — track the parent instead.** Every edge is bidirectional, so you'd immediately
"find a cycle" by walking back along the edge you came in on.

```java
boolean hasCycleUndirected(int u, int parent, List<List<Integer>> g, boolean[] seen) {
    seen[u] = true;
    for (int v : g.get(u)) {
        if (!seen[v]) {
            if (hasCycleUndirected(v, u, g, seen)) return true;
        } else if (v != parent) {
            return true;                        // visited and not our parent → cycle
        }
    }
    return false;
}
```

The `v != parent` check has its own trap: with **parallel edges** (u–v twice), it wrongly reports no
cycle. If parallel edges are possible, track the edge id rather than the parent node. Mention it if
the interviewer says "multigraph".

**Or just use union-find** for undirected cycle detection: process edges; if both endpoints are
already in the same set, you've found a cycle. Simpler and it composes with Kruskal's.

### Union-Find (Disjoint Set Union)

Maintains a partition of elements into disjoint sets, supporting `find(x)` (which set?) and
`union(x, y)` (merge two sets) in **near-constant amortized time**.

```
 Naive union-find degenerates into a chain:
     union(1,2), union(2,3), union(3,4), union(4,5)
     1 ← 2 ← 3 ← 4 ← 5     find(5) walks 4 hops → O(n)

 UNION BY RANK: always attach the shorter tree under the taller one.
 Guarantees height O(log n), because a tree of rank r has ≥ 2^r nodes.

 PATH COMPRESSION: on find(x), re-point every node on the path directly at the root.

   before find(5)            after find(5)
        1                          1
        │                       ╱ ╱│╲
        2                      2  3 4 5     ← all now point straight at the root
        │
        3                    Future finds on any of these: O(1)
        │
        4
        │
        5

 Both together → O(α(n)) amortized, where α is the inverse Ackermann function.
 α(n) ≤ 4 for any n that fits in the observable universe. Effectively O(1).
 (Tarjan proved this bound is tight — it is genuinely not O(1), just
  indistinguishable from it. Saying that gets you credit.)
```

```java
class UnionFind {
    private final int[] parent, rank;
    private int components;

    UnionFind(int n) {
        parent = new int[n];
        rank = new int[n];
        components = n;
        for (int i = 0; i < n; i++) parent[i] = i;   // each element is its own set
    }

    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);   // PATH COMPRESSION
        return parent[x];
    }

    boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;                        // already connected
        if (rank[ra] < rank[rb]) { int t = ra; ra = rb; rb = t; }
        parent[rb] = ra;                                   // UNION BY RANK
        if (rank[ra] == rank[rb]) rank[ra]++;
        components--;
        return true;
    }

    boolean connected(int a, int b) { return find(a) == find(b); }
    int componentCount() { return components; }
}
```

```javascript
class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this.components = n;
  }

  find(x) {                                   // iterative, avoids stack depth issues
    let root = x;
    while (this.parent[root] !== root) root = this.parent[root];
    while (this.parent[x] !== root) {         // second pass compresses the path
      const next = this.parent[x];
      this.parent[x] = root;
      x = next;
    }
    return root;
  }

  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;
    if (this.rank[ra] < this.rank[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    if (this.rank[ra] === this.rank[rb]) this.rank[ra]++;
    this.components--;
    return true;
  }
}
```

**Note:** the JS `find` is iterative on purpose. Recursive path compression on a 10⁶-element
structure can exceed V8's stack before compression has had a chance to flatten it.

**Union by rank vs union by size.** Both give O(log n) height; size is sometimes more useful because
you get component sizes for free ("largest connected component" problems). Either is acceptable;
say which you chose and why.

**What union-find is for:** connected components, cycle detection in undirected graphs, Kruskal's
MST, "number of islands" (as an alternative to DFS), account merging, percolation, dynamic
connectivity, and equation-consistency problems. **What it is not for:** it cannot *un*-merge sets.
If you need deletions, you need a link-cut tree or an offline approach.

### Dijkstra's algorithm

Single-source shortest paths with **non-negative** edge weights.

```java
int[] dijkstra(List<int[]>[] g, int src, int n) {   // g[u] holds {v, weight}
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[src] = 0;

    // {distance, node}, ordered by distance
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    pq.offer(new int[]{0, src});

    while (!pq.isEmpty()) {
        int[] top = pq.poll();
        int d = top[0], u = top[1];
        if (d > dist[u]) continue;                  // LAZY DELETION: stale entry, skip
        for (int[] e : g[u]) {
            int v = e[0], w = e[1];
            if (dist[u] + w < dist[v]) {            // relax the edge
                dist[v] = dist[u] + w;
                pq.offer(new int[]{dist[v], v});
            }
        }
    }
    return dist;                                    // O((V + E) log V)
}
```

```javascript
function dijkstra(graph, src, n) {
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  const pq = new MinHeap((a, b) => a[0] - b[0]);
  pq.push([0, src]);

  while (pq.size) {
    const [d, u] = pq.pop();
    if (d > dist[u]) continue;
    for (const [v, w] of graph[u]) {
      if (d + w < dist[v]) { dist[v] = d + w; pq.push([dist[v], v]); }
    }
  }
  return dist;
}
```

**The `if (d > dist[u]) continue` line is not optional.** Binary heaps do not support
decrease-key efficiently, so the standard approach is to push duplicate entries and discard stale
ones on pop. Without that check you re-expand nodes and the complexity degrades. Interviewers
specifically watch for it.

**Why Dijkstra fails with negative weights.** Dijkstra's correctness rests on a greedy invariant:
*once a node is popped with the minimum tentative distance, that distance is final.* The proof
requires that extending any path can only *increase* its cost. A negative edge breaks that.

```
       ┌───┐   5    ┌───┐
       │ A ├───────▶│ B │
       └─┬─┘        └─┬─┘
         │ 2          │ -10
         ▼            ▼
       ┌───┐   1    ┌───┐
       │ C ├───────▶│ D │
       └───┘        └───┘

 Dijkstra from A:
   pops A (0). Relaxes: dist[B]=5, dist[C]=2.
   pops C (2). Relaxes: dist[D]=3.
   pops D (3) and FINALIZES it.
   pops B (5). Relaxes B→D: 5 + (−10) = −5 < 3.
   But D was already finalized and popped. Depending on the implementation you
   either return the wrong answer (3) or never propagate the correction.

 TRUE shortest A→D = A→B→D = 5 − 10 = −5.
```

The greedy choice was wrong because a cheaper path existed *through a more expensive prefix*. There
is no way to know that without exploring further, which is precisely what Dijkstra refuses to do.

**A negative *cycle* makes "shortest path" undefined** — you can loop forever and drive the cost to
−∞. Any correct algorithm must detect and report this rather than return a number.

**The trap answer:** "just add a big constant to every weight to make them positive." This is
**wrong**, and interviewers ask it to see if you'll take the bait. Adding `k` to every edge adds
`k × (number of edges in the path)` to the total, which penalizes paths with more hops. It changes
which path is shortest. Explain it with a two-path example.

### Bellman-Ford

Handles negative weights, detects negative cycles. O(V · E).

```java
int[] bellmanFord(int n, int[][] edges, int src) {
    long[] dist = new long[n];
    Arrays.fill(dist, Long.MAX_VALUE / 4);
    dist[src] = 0;

    for (int i = 0; i < n - 1; i++) {          // V−1 rounds
        boolean changed = false;
        for (int[] e : edges) {                 // relax EVERY edge
            if (dist[e[0]] + e[2] < dist[e[1]]) {
                dist[e[1]] = dist[e[0]] + e[2];
                changed = true;
            }
        }
        if (!changed) break;                    // early exit: converged
    }

    for (int[] e : edges) {                     // Vth round: still improving?
        if (dist[e[0]] + e[2] < dist[e[1]]) {
            throw new IllegalStateException("negative cycle reachable from source");
        }
    }
    return Arrays.stream(dist).mapToInt(x -> (int) x).toArray();
}
```

**Why exactly V−1 rounds?** Any shortest path in a graph with no negative cycles has at most V−1
edges (more would repeat a vertex, i.e. contain a cycle, which can only be removed or is negative).
After round `k`, all shortest paths using ≤ k edges are correct. After V−1 rounds, all are. If a
Vth round still improves something, a path with ≥ V edges is getting shorter — that requires a
negative cycle. That is the entire proof, and it's a clean thing to state.

**Where Bellman-Ford is real:** currency arbitrage detection (take `−log(rate)` as the weight; a
negative cycle is a risk-free profit loop), and the **distance-vector routing protocols** RIP and
older BGP variants, where each router only knows its neighbours' vectors — Bellman-Ford is inherently
distributed, Dijkstra is not.

**The shortest-path decision table:**

```
┌───────────────────────────────┬──────────────────────┬──────────────────┐
│ Situation                     │ Algorithm            │ Complexity       │
├───────────────────────────────┼──────────────────────┼──────────────────┤
│ Unweighted                    │ BFS                  │ O(V + E)         │
│ All weights 0 or 1            │ 0-1 BFS (deque)      │ O(V + E)         │
│ Non-negative weights          │ Dijkstra + binary hp │ O((V+E) log V)   │
│ Non-negative, dense           │ Dijkstra + Fib heap  │ O(E + V log V)   │
│ Negative weights, no neg cycle│ Bellman-Ford         │ O(V·E)           │
│ Negative weights, need detect │ Bellman-Ford / SPFA  │ O(V·E)           │
│ All-pairs, dense, small V     │ Floyd-Warshall       │ O(V³)            │
│ Weights + good heuristic      │ A*                   │ ≤ Dijkstra       │
│ DAG (any weights)             │ topo order + relax   │ O(V + E)         │
└───────────────────────────────┴──────────────────────┴──────────────────┘
```

The DAG row is underused and impressive to mention: on a DAG you can relax edges in topological
order and get shortest *or longest* paths in linear time, negative weights included. That is how
critical-path scheduling works.

### Minimum Spanning Tree

A subset of edges connecting all vertices with minimum total weight. V−1 edges, no cycles.

**Kruskal's** — sort edges, greedily add any edge that doesn't create a cycle (union-find tells you).

```java
int kruskal(int n, int[][] edges) {          // edges: {u, v, weight}
    Arrays.sort(edges, (a, b) -> a[2] - b[2]);      // O(E log E)
    UnionFind uf = new UnionFind(n);
    int total = 0, used = 0;
    for (int[] e : edges) {
        if (uf.union(e[0], e[1])) {                 // union returns false if same set
            total += e[2];
            if (++used == n - 1) break;             // spanning tree complete
        }
    }
    return used == n - 1 ? total : -1;               // -1 = graph is disconnected
}
```

**Prim's** — grow one tree from a seed, repeatedly taking the cheapest edge crossing the frontier.

```java
int prim(List<int[]>[] g, int n) {
    boolean[] inTree = new boolean[n];
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);  // {node, cost}
    pq.offer(new int[]{0, 0});
    int total = 0, count = 0;
    while (!pq.isEmpty() && count < n) {
        int[] top = pq.poll();
        if (inTree[top[0]]) continue;
        inTree[top[0]] = true;
        total += top[1];
        count++;
        for (int[] e : g[top[0]]) if (!inTree[e[0]]) pq.offer(new int[]{e[0], e[1]});
    }
    return count == n ? total : -1;                   // O(E log V)
}
```

**Which to use:** Kruskal for sparse graphs (it's edge-driven, and you're sorting E edges); Prim for
dense graphs (with an adjacency matrix and no heap, Prim is O(V²), which beats `E log E ≈ V² log V`
when E ≈ V²). Both are greedy and both are provably correct via the **cut property**: for any
partition of the vertices, the minimum-weight edge crossing the cut is in *some* MST. That is the
exchange argument, and being able to name it is exactly the greedy-correctness reasoning the
[Greedy](#greedy-algorithms) section is about.

**Real uses:** network/cable layout, clustering (single-linkage hierarchical clustering *is*
Kruskal's, stopped early), image segmentation, and approximation algorithms for TSP.

---

## Sorting

### The full comparison table

```
┌────────────────┬──────────┬────────────┬──────────┬──────────┬────────┬──────────┐
│ Algorithm      │ Best     │ Average    │ Worst    │ Space    │ Stable │ In-place │
├────────────────┼──────────┼────────────┼──────────┼──────────┼────────┼──────────┤
│ Bubble sort    │ O(n)*    │ O(n²)      │ O(n²)    │ O(1)     │ yes    │ yes      │
│ Selection sort │ O(n²)    │ O(n²)      │ O(n²)    │ O(1)     │ no**   │ yes      │
│ Insertion sort │ O(n)     │ O(n²)      │ O(n²)    │ O(1)     │ yes    │ yes      │
│ Shell sort     │ O(n log n)│ ~O(n^1.3) │ O(n^1.5) │ O(1)     │ no     │ yes      │
│ Merge sort     │ O(n logn)│ O(n log n) │ O(n logn)│ O(n)     │ yes    │ no       │
│ Quicksort      │ O(n logn)│ O(n log n) │ O(n²)    │ O(log n)†│ no     │ yes      │
│ Heapsort       │ O(n logn)│ O(n log n) │ O(n logn)│ O(1)     │ no     │ yes      │
│ Timsort        │ O(n)     │ O(n log n) │ O(n logn)│ O(n)     │ yes    │ no       │
│ Introsort      │ O(n logn)│ O(n log n) │ O(n logn)│ O(log n) │ no     │ yes      │
├────────────────┼──────────┼────────────┼──────────┼──────────┼────────┼──────────┤
│ Counting sort  │ O(n + k) │ O(n + k)   │ O(n + k) │ O(k)     │ yes    │ no       │
│ Radix sort     │ O(d(n+k))│ O(d(n+k))  │ O(d(n+k))│ O(n + k) │ yes    │ no       │
│ Bucket sort    │ O(n + k) │ O(n + k)   │ O(n²)    │ O(n)     │ yes‡   │ no       │
└────────────────┴──────────┴────────────┴──────────┴──────────┴────────┴──────────┘
  *  with an early-exit swapped flag
  ** the standard array-swap implementation is unstable; a list version can be stable
  †  recursion stack, when recursing on the smaller partition
  ‡  if the per-bucket sort is stable
  k = value range,  d = number of digits/passes
```

**Stability** means equal elements keep their relative input order. It matters more than candidates
think: it's what lets you sort by secondary key then primary key and get a correct multi-key sort.
That is why Java uses a stable sort (Timsort) for `Object[]` — a library that silently reordered
equal elements would break composition — but an unstable one (dual-pivot quicksort) for primitives,
where "equal" ints are indistinguishable so stability is unobservable and speed wins. That single
fact, stated in an interview, does a lot of work.

### Merge sort

```java
void mergeSort(int[] a, int[] buf, int lo, int hi) {
    if (hi - lo < 2) return;
    int mid = lo + (hi - lo) / 2;
    mergeSort(a, buf, lo, mid);
    mergeSort(a, buf, mid, hi);
    if (a[mid - 1] <= a[mid]) return;      // already ordered: skip the merge entirely
    merge(a, buf, lo, mid, hi);
}

private void merge(int[] a, int[] buf, int lo, int mid, int hi) {
    System.arraycopy(a, lo, buf, lo, hi - lo);
    int i = lo, j = mid, k = lo;
    while (i < mid && j < hi) a[k++] = (buf[i] <= buf[j]) ? buf[i++] : buf[j++];
    while (i < mid) a[k++] = buf[i++];
    while (j < hi)  a[k++] = buf[j++];
}
```

```javascript
function mergeSort(a) {
  if (a.length < 2) return a;
  const mid = a.length >> 1;
  const left = mergeSort(a.slice(0, mid));
  const right = mergeSort(a.slice(mid));
  const out = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    out.push(left[i] <= right[j] ? left[i++] : right[j++]);   // <= keeps it STABLE
  }
  while (i < left.length) out.push(left[i++]);
  while (j < right.length) out.push(right[j++]);
  return out;
}
```

The `if (a[mid-1] <= a[mid]) return;` line is a real optimization from the JDK: on already-sorted or
nearly-sorted data it turns merge sort into O(n). Small touches like this signal that you've read
library source.

**Why merge sort matters despite the O(n) space:** it's the only O(n log n) sort that works well on
**linked lists** (merge needs only sequential access, and on a list it's O(1) extra space), and it's
the basis of **external sorting** for data bigger than RAM. Also it parallelizes trivially — the two
halves are independent.

### Quicksort

```java
void quickSort(int[] a, int lo, int hi) {
    while (lo < hi) {
        if (hi - lo < 16) { insertionSort(a, lo, hi); return; }   // small-array cutoff
        int p = partition(a, lo, hi);
        if (p - lo < hi - p) { quickSort(a, lo, p - 1); lo = p + 1; }  // smaller side first
        else                 { quickSort(a, p + 1, hi); hi = p - 1; }
    }
}

int partition(int[] a, int lo, int hi) {
    int mid = lo + (hi - lo) / 2;
    medianOfThree(a, lo, mid, hi);          // pivot selection: kills the sorted-input case
    swap(a, mid, hi);
    int pivot = a[hi], i = lo;
    for (int j = lo; j < hi; j++) {
        if (a[j] < pivot) swap(a, i++, j);  // Lomuto scheme
    }
    swap(a, i, hi);
    return i;
}
```

```javascript
function quickSort(a, lo = 0, hi = a.length - 1) {
  while (lo < hi) {
    const p = partition(a, lo, hi);
    if (p - lo < hi - p) { quickSort(a, lo, p - 1); lo = p + 1; }
    else                 { quickSort(a, p + 1, hi); hi = p - 1; }
  }
  return a;
}

function partition(a, lo, hi) {
  const r = lo + Math.floor(Math.random() * (hi - lo + 1));   // RANDOMIZED pivot
  [a[r], a[hi]] = [a[hi], a[r]];
  const pivot = a[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (a[j] < pivot) { [a[i], a[j]] = [a[j], a[i]]; i++; }
  }
  [a[i], a[hi]] = [a[hi], a[i]];
  return i;
}
```

### Why quicksort is the practical default despite O(n²)

This question comes up constantly. The complete answer has five parts:

1. **Cache locality.** Partitioning is two sequential scans over a contiguous array. The prefetcher
   loves it. Merge sort writes to a separate buffer and reads back, roughly doubling memory traffic.
   Heapsort jumps between index `i` and `2i+1` — those are far apart, so almost every sift-down step
   is a cache miss. On modern hardware quicksort typically runs 2-3× faster than heapsort at the
   same asymptotic complexity.
2. **Tiny constant factor.** The inner loop is a compare, a conditional swap, and an increment. It
   vectorizes and branch-predicts well.
3. **In-place.** O(log n) stack, no O(n) auxiliary buffer. For large arrays that allocation is a real
   cost (and a GC pressure source on the JVM).
4. **The worst case is avoidable.** With a randomized or median-of-three pivot, the probability of
   O(n²) becomes negligible — for adversary-free input, vanishingly so. Adversarial input is
   handled by randomization (the attacker cannot predict the pivot).
5. **It degrades to something safe.** Introsort (below) caps the damage.

**But quicksort is the wrong default when:** you need stability, you need a guaranteed worst case
(hard-real-time, or an adversary controls the input and you can't randomize), or you're sorting a
linked list.

### Why real library sorts are hybrids

No production sort is a textbook algorithm. Every one of them is a hybrid tuned for real data.

**Timsort** (Python `sorted`/`list.sort`, Java `Arrays.sort` for objects, Android, Rust's stable
`sort`, V8's `Array.prototype.sort` since 2018). Designed by Tim Peters in 2002 on the observation
that **real data is usually partially sorted**.
- Scans for "runs" — maximal already-ascending or strictly-descending subsequences (descending runs
  get reversed in place, which is why it must be *strictly* descending: reversing a run with equal
  elements would destroy stability).
- Runs shorter than `minrun` (32-64) are extended with binary insertion sort.
- Runs are merged with a stack-based policy that maintains size invariants so merges stay balanced.
- **Galloping mode**: when one run consistently wins the merge comparison, it switches to
  exponential search to skip ahead in chunks instead of comparing one at a time.
- **O(n) on already-sorted input**, O(n log n) worst case, stable.
- Fun fact worth mentioning: the merge-stack invariant had a proven bug found in 2015 by formal
  verification (de Gouw et al.) that could overflow the run stack; it was patched in both Java and
  Python. Great anecdote for "why formal methods".

**Introsort** (C++ `std::sort` in libstdc++/libc++). Quicksort, but:
- Track recursion depth; if it exceeds `2·log₂ n`, **switch to heapsort** for that subrange. This
  caps the worst case at O(n log n) while keeping quicksort's speed in the common case.
- Switch to insertion sort below ~16 elements.

**pdqsort** (pattern-defeating quicksort; Rust's unstable `sort_unstable`, and now libstdc++'s
`std::sort` in some versions). Introsort plus:
- Detects already-sorted and reverse-sorted patterns in O(n).
- Uses **branchless partitioning** (compute the swap decision arithmetically instead of branching)
  to eliminate branch mispredictions, which are the dominant cost in a modern partition loop.
- Falls back to a heapsort-guaranteed path when it detects adversarial patterns.

**Java's `Arrays.sort` split** is a great thing to know cold:
```
 Arrays.sort(int[] / primitives)  → dual-pivot quicksort (Vladimir Yaroslavskiy)
                                    unstable, in-place, faster; stability unobservable
 Arrays.sort(Object[])            → Timsort
                                    stable, O(n) auxiliary; stability is a documented
                                    guarantee people rely on for multi-key sorts
```

**The senior takeaway:** "the fastest sort" is not a property of an algorithm, it's a property of an
algorithm *plus the data distribution plus the hardware*. Libraries hybridize because real inputs
have structure — partially sorted, many duplicates, small — and a pure algorithm exploits none of it.

### Non-comparison sorts

Comparison sorting has a proven `Ω(n log n)` lower bound (decision-tree argument: `n!` possible
orderings, a binary decision tree distinguishing them needs depth `≥ log₂(n!) = Θ(n log n)`). You
can beat it only by *not comparing* — by using the values as indices.

**Counting sort** — O(n + k) where k is the value range.

```java
int[] countingSort(int[] a, int maxVal) {
    int[] count = new int[maxVal + 1];
    for (int x : a) count[x]++;
    for (int i = 1; i <= maxVal; i++) count[i] += count[i - 1];   // prefix sums
    int[] out = new int[a.length];
    for (int i = a.length - 1; i >= 0; i--) {   // BACKWARDS to preserve stability
        out[--count[a[i]]] = a[i];
    }
    return out;
}
```

**Radix sort** — LSD radix sort applies a stable counting sort per digit, d passes → O(d(n + k)).
This is how you sort 10⁸ 32-bit integers faster than any comparison sort: 4 passes of 8-bit counting
sort, all linear scans.

**When a non-comparison sort applies:**
- Keys are integers (or fixed-length strings, or anything mappable to integers) **and**
- The range k is not much larger than n. Sorting 1,000 values in [0, 10⁹] with counting sort needs a
  10⁹-element array — absurd. Sorting 10⁶ values in [0, 255] is perfect.
- Classic real uses: sorting ages, exam scores, IP addresses, timestamps within a bounded window,
  fixed-length product SKUs, and the counting-sort step inside suffix-array construction.

**The interview move:** when the problem says "array of integers where 0 ≤ nums[i] ≤ 100" or
"sort characters", say: "the value range is bounded and small, so I can beat the n log n bound with
counting sort — O(n) time, O(k) space." That is a genuinely senior observation and most candidates
miss it entirely.

### Sorting: what to actually say in an interview

> "I'd call the library sort — it's a tuned hybrid and I won't beat it. If you want me to implement
> one: merge sort if stability or a worst-case guarantee matters, quicksort if I want in-place and
> speed on average, heapsort if I need O(1) space with a hard guarantee. If the keys are bounded
> small integers I'd use counting sort and get O(n)."

Then, if they push: "and if I only need the k smallest rather than the full order, I'd use
quickselect for O(n) expected or a size-k heap for O(n log k) — full sorting is doing more work than
the problem needs."

---

## Binary Search

### The template that avoids off-by-one and overflow

```java
int binarySearch(int[] a, int target) {
    int lo = 0, hi = a.length - 1;          // INCLUSIVE bounds
    while (lo <= hi) {                       // <= because lo == hi is a valid 1-elem range
        int mid = lo + (hi - lo) / 2;        // NOT (lo + hi) / 2 — that overflows
        if (a[mid] == target) return mid;
        if (a[mid] < target) lo = mid + 1;   // mid is excluded — this is what terminates
        else                 hi = mid - 1;
    }
    return -1;
}
```

**The overflow bug.** `(lo + hi) / 2` overflows when `lo + hi > Integer.MAX_VALUE`. This bug existed
in the JDK's `Arrays.binarySearch` and in the canonical binary search in *Programming Pearls* for
**nine years** before Joshua Bloch documented it in 2006. It only triggers on arrays larger than
2³⁰ elements, which is why it survived so long — and why "it passed the tests" is not the same as
"it's correct". `lo + (hi - lo) / 2` is algebraically identical and cannot overflow, because
`hi - lo` is bounded by the array length. In Java you can also write
`(lo + hi) >>> 1` — unsigned shift treats the overflowed bit correctly.

In JavaScript, numbers are doubles, so integer overflow isn't a concern until 2⁵³ — but write
`lo + ((hi - lo) >> 1)` anyway, both for the habit and because it's faster than division.

**The three loop invariants, and picking the right one.** This is the actual source of off-by-one
bugs. Choose one shape and be consistent:

```
┌───────────────────────────────────────────────────────────────────────────┐
│ SHAPE A: inclusive [lo, hi]                                               │
│   while (lo <= hi)   mid=lo+(hi-lo)/2   lo = mid+1  /  hi = mid-1         │
│   Terminates because the range shrinks by at least 1 each iteration.      │
│   Use for: exact-match search.                                            │
├───────────────────────────────────────────────────────────────────────────┤
│ SHAPE B: half-open [lo, hi)                                               │
│   while (lo < hi)    mid=lo+(hi-lo)/2   lo = mid+1  /  hi = mid           │
│   On exit lo == hi == the answer position (lower_bound).                  │
│   Use for: "first index satisfying P" — the workhorse shape.              │
├───────────────────────────────────────────────────────────────────────────┤
│ SHAPE C: two-pointer converge (lo, hi) exclusive                          │
│   while (lo + 1 < hi)  ...  then check lo and hi individually             │
│   Never has an off-by-one, at the cost of a post-loop check.              │
│   Use for: when you keep getting the boundaries wrong. It always works.   │
└───────────────────────────────────────────────────────────────────────────┘
```

**Boundary search (`lower_bound` / first-true) — memorize this one:**

```java
// Smallest index i such that a[i] >= target. Returns a.length if none.
int lowerBound(int[] a, int target) {
    int lo = 0, hi = a.length;               // note: hi = length, not length-1
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < target) lo = mid + 1;   // mid can't be the answer
        else                 hi = mid;       // mid MIGHT be the answer — keep it
    }
    return lo;
}
// upperBound: change `a[mid] < target` to `a[mid] <= target`.
// count of target = upperBound(a, t) - lowerBound(a, t)
```

The asymmetry (`mid + 1` vs `mid`) is the whole thing. When the predicate fails at `mid`, `mid` is
excluded, so `lo = mid + 1`. When it holds, `mid` is a candidate, so `hi = mid` keeps it in range.

### Binary search on the answer — the insight most candidates miss

**This is the highest-leverage binary search idea, and it is the one that separates people who
"know binary search" from people who can use it.**

Binary search does not require a sorted array. It requires a **monotonic predicate over a search
space**. If you can define a boolean function `P(x)` that is false, false, false, …, then true,
true, true (or vice versa) as `x` increases, you can binary search for the boundary — even if `x`
is not an index into anything.

```
 The predicate landscape:

   x:        1     2     3     4     5     6     7     8     9    10
   P(x):     F     F     F     F     T     T     T     T     T     T
                                     ↑
                          the ANSWER: smallest x with P(x) true

   Binary search finds this boundary in O(log(range)) evaluations of P.
   Each evaluation of P costs whatever it costs — often O(n).
   Total: O(n log(range)).
```

**The recipe:**
1. **Guess the answer.** What is the quantity being minimized/maximized? That is your search space.
2. **Bound it.** What is the smallest conceivable answer? The largest?
3. **Write `feasible(x)`.** "If the answer were `x`, could I satisfy the constraints?" This is
   usually a simple greedy O(n) check.
4. **Verify monotonicity.** If `x` works, does `x + 1` necessarily work? If not, you cannot binary
   search. Say this out loud — it's the correctness argument.
5. Binary search on `x`.

**Worked example: Capacity To Ship Packages Within D Days (LeetCode 1011).**

> Given package weights `w[0..n-1]` that must be shipped **in order**, and `D` days, find the
> minimum ship capacity such that all packages ship within D days.

**Step 1 — what's the answer?** A capacity. That's the search space, not an index.

**Step 2 — bounds.**
- Lower bound: `max(w)`. Any capacity below that can never carry the heaviest package.
- Upper bound: `sum(w)`. That ships everything in one day; no larger capacity helps.

**Step 3 — feasible(cap): "can we ship in ≤ D days with this capacity?"** Greedy: keep loading the
current day's ship until the next package doesn't fit, then start a new day. This greedy is optimal
because packages must ship in order — there is never a reason to start a new day early.

**Step 4 — monotonicity.** If capacity `c` works, then `c + 1` works (a bigger ship can carry any
schedule the smaller one could). So `feasible` is false…false…true…true. ✓

```
 w = [1,2,3,4,5,6,7,8,9,10],  D = 5
 lo = max(w) = 10,  hi = sum(w) = 55

 ┌──────┬──────┬──────────────────────────────────────┬──────────┬──────────┐
 │  lo  │  hi  │ mid = lo + (hi-lo)/2                 │ days     │ action   │
 ├──────┼──────┼──────────────────────────────────────┼──────────┼──────────┤
 │  10  │  55  │ 32  → [1..9]|[10] ...                │  2 ≤ 5 ✓ │ hi = 32  │
 │  10  │  32  │ 21  → [1..6]|[7,8]|[9,10]            │  3 ≤ 5 ✓ │ hi = 21  │
 │  10  │  21  │ 15  → [1..5]|[6,7]|[8]|[9]|[10]      │  5 ≤ 5 ✓ │ hi = 15  │
 │  10  │  15  │ 12  → [1,2,3]|[4,5]|[6]|[7]|[8]|[9]  │  7 > 5 ✗ │ lo = 13  │
 │  13  │  15  │ 14  → [1..4]|[5,6]|[7]|[8]|[9]|[10]  │  6 > 5 ✗ │ lo = 15  │
 │  15  │  15  │ loop exits                           │          │          │
 └──────┴──────┴──────────────────────────────────────┴──────────┴──────────┘
 answer = 15
 Evaluations of feasible(): 5 ≈ log₂(45). Each is O(n). Total O(n log(sum)).
```

```java
int shipWithinDays(int[] weights, int days) {
    int lo = 0, hi = 0;
    for (int w : weights) { lo = Math.max(lo, w); hi += w; }

    while (lo < hi) {                          // half-open: find FIRST feasible
        int mid = lo + (hi - lo) / 2;
        if (feasible(weights, days, mid)) hi = mid;   // mid works — maybe smaller does too
        else                              lo = mid + 1;
    }
    return lo;
}

private boolean feasible(int[] w, int days, int cap) {
    int used = 1, load = 0;
    for (int x : w) {
        if (load + x > cap) { used++; load = 0; }     // start a new day
        load += x;
        if (used > days) return false;                // early exit
    }
    return true;                                       // O(n)
}
```

```javascript
function shipWithinDays(weights, days) {
  let lo = Math.max(...weights);
  let hi = weights.reduce((a, b) => a + b, 0);

  const feasible = (cap) => {
    let used = 1, load = 0;
    for (const w of weights) {
      if (load + w > cap) { used++; load = 0; }
      load += w;
      if (used > days) return false;
    }
    return true;
  };

  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (feasible(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
```

**The same shape solves a whole family of problems**, and recognizing the family is the skill:

```
┌─────────────────────────────────────────┬───────────────────┬─────────────────────┐
│ Problem                                 │ Search space      │ feasible(x)         │
├─────────────────────────────────────────┼───────────────────┼─────────────────────┤
│ Koko Eating Bananas (875)               │ eating speed      │ hours ≤ H?          │
│ Split Array Largest Sum (410)           │ max subarray sum  │ splits ≤ k?         │
│ Ship Packages in D Days (1011)          │ ship capacity     │ days ≤ D?           │
│ Minimize Max Distance to Gas Station    │ max gap (real!)   │ stations ≤ k?       │
│ Magnetic Force Between Balls (1552)     │ min distance      │ can place m balls?  │
│ Kth Smallest in Sorted Matrix (378)     │ the value itself  │ count(≤x) ≥ k?      │
│ Median of Two Sorted Arrays (4)         │ partition point   │ partition valid?    │
│ Minimum Days to Make Bouquets (1482)    │ number of days    │ enough bouquets?    │
│ "Minimum time to complete all tasks"    │ time budget       │ all tasks fit?      │
└─────────────────────────────────────────┴───────────────────┴─────────────────────┘
```

**The tell:** the problem says *"minimize the maximum"*, *"maximize the minimum"*, or *"find the
smallest X such that..."*, and a direct greedy or DP doesn't obviously work. That phrasing is almost
a guarantee that binary search on the answer is intended.

**On real-valued answers**, binary search on doubles with a fixed iteration count rather than an
epsilon comparison — 100 iterations halves the range by 2¹⁰⁰, which is far below any precision you
care about, and it can't loop forever due to floating-point rounding:

```java
double lo = 0, hi = 1e9;
for (int i = 0; i < 100; i++) {          // NOT while (hi - lo > 1e-9) — can hang
    double mid = (lo + hi) / 2;
    if (feasible(mid)) hi = mid; else lo = mid;
}
return lo;
```

### Other binary search variants worth having ready

**Rotated sorted array.** One half is always sorted; determine which, then decide whether the target
lies in it.

```java
int searchRotated(int[] a, int target) {
    int lo = 0, hi = a.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) return mid;
        if (a[lo] <= a[mid]) {                        // LEFT half is sorted
            if (a[lo] <= target && target < a[mid]) hi = mid - 1;
            else lo = mid + 1;
        } else {                                       // RIGHT half is sorted
            if (a[mid] < target && target <= a[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return -1;
}
```

The follow-up is "what if there are duplicates?" — then `a[lo] == a[mid]` tells you nothing, you
must do `lo++` and the worst case degrades to O(n). That degradation is unavoidable; say so.

**Find peak element** (LeetCode 162) — binary search with *no sorted array at all*. If
`a[mid] < a[mid+1]`, a peak exists to the right (you're on an ascending slope, and the array is
bounded by −∞ sentinels). This is a nice example that binary search only needs a monotonic *decision
rule*, not sorted data.

**Search in an infinite/unbounded array** — exponential search first (double `hi` until
`a[hi] > target`, O(log n)), then binary search the found range. This is how you binary search a
paginated API with unknown length.

---
