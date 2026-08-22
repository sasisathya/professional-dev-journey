# DSA Learning Roadmap - Pattern Flow & Sequence

## Learning Path Overview

```
┌─────────────────────────────────────────────────────────────┐
│              DSA MASTERY PROGRESSION                        │
│         (Foundation → Intermediate → Advanced)              │
└─────────────────────────────────────────────────────────────┘

PHASE 1: TWO POINTER TECHNIQUES
├── two-sum.md
│   ├─ Type 1: Unsorted Array (Hash Map)
│   ├─ Type 2: Sorted Array (Two Pointers)
│   └─ Type 5: Variants
│       ├─ 5a: All Pairs
│       ├─ 5b: Less Than K
│       └─ 5c: Closest Sum
└─ Complexity: O(n) to O(n log n)
   Space: O(1) to O(n)

PHASE 2: SLIDING WINDOW
├─ [To be created]
│   ├─ Fixed Window Size
│   ├─ Variable Window Size
│   └─ Variants
└─ Related to: Two Pointers
   Build on: Two Sum (window contracts/expands like pointers)

PHASE 3: HASH MAP & DATA STRUCTURES
├─ [To be created]
│   ├─ Frequency Maps
│   ├─ Counter Patterns
│   └─ Custom Data Structure Design
└─ Related to: Two Sum III, Dynamic Operations
   Build on: Two Pointer fundamentals

PHASE 4: TREE & BST
├─ [To be created]
│   ├─ Tree Traversal (DFS/BFS)
│   ├─ BST Operations
│   ├─ Tree Height/Balance
│   └─ Tree-based Two Sum (BST variant)
└─ Related to: Two Sum IV, Hash Sets
   Build on: Graph patterns, recursion

PHASE 5: ADVANCED PATTERNS
├─ [To be created]
│   ├─ Binary Search on Answer
│   ├─ Greedy with Sorting
│   └─ Dynamic Programming
└─ Build on: All previous phases
```

---

## Pattern Dependency Graph

```
┌─────────────────────────┐
│  SORTING FUNDAMENTALS   │
│   (Foundation)          │
│  - Time O(n log n)      │
│  - Quick/Merge/Heap     │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  TWO POINTERS / SLIDING │
│  (Phase 1 → Phase 2)    │
│  - Sorted properties    │
│  - O(n) linear scan     │
└────────────┬────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌──────────┐    ┌─────────────┐
│ HASH MAP │    │ TREE/BST    │
│(Phase 3) │    │ (Phase 4)   │
│ O(n) ADD │    │ O(log n)    │
│ O(1) GET │    │ balance     │
└──────────┘    └─────────────┘
    │                 │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ BINARY SEARCH   │
    │ (Phase 5)       │
    │ O(log n)        │
    └─────────────────┘
```

---

## Current Progress Status

| Phase | Topic | File | Status | Notes |
|-------|-------|------|--------|-------|
| 1 | Two Sum | `two-sum.md` | ✅ Complete | Types 1, 2, Variants 5a/5b/5c |
| 2 | Sliding Window | - | ⏳ Pending | Will create after Two Sum complete |
| 3 | Data Structures | - | ⏳ Pending | Hash Map, Frequency, Custom DS |
| 4 | Tree & BST | - | ⏳ Pending | Traversal, BST operations |
| 5 | Advanced | - | ⏳ Pending | Binary Search, DP, Greedy |

---

## Why This Sequence?

### Two Pointers First (Phase 1)
```
WHY:
- Simplest mental model (pointer movement)
- O(n) time optimal (can't do better than read all)
- Foundation for Sliding Window
- Sorted arrays teach you to LEVERAGE input properties

LEARNING OUTCOME:
- Understand constraint-based thinking
- Know when to sort vs hash
- Master the "two pointer convergence" pattern
```

### Sliding Window Next (Phase 2)
```
WHY:
- Extension of two pointers
- Both pointers move in SAME direction (unlike convergence)
- Introduces "window contract/expand" thinking
- Same O(n) complexity, more complex logic

PREREQUISITE: Solid two-pointer intuition from Phase 1
```

### Hash Maps Later (Phase 3)
```
WHY:
- Different space tradeoff (O(n) space for O(1) lookup)
- Dynamic operations (add/remove)
- Frequency counting patterns
- Data structure design (multiple operations)

NOTE: Two Sum I uses hash maps (Phase 1)
      Two Sum III uses frequency maps (Phase 3)
      This is intentional - learn basics first
```

### Trees Last (Phase 4)
```
WHY:
- Requires understanding recursion first
- Combines DFS + hash sets
- BST properties add another layer
- Tree problems often combine earlier patterns

EXAMPLE: Two Sum IV combines DFS + Hash Set
         But you understand both separately first
```

---

## How to Use This Roadmap

### For Self-Study
1. **Complete Phase 1 fully** - Master all Two Sum variations
2. **Review the pattern**: Sorted → Two Pointers, Unsorted → Hash Map
3. **Move to Phase 2**: Sliding Window uses same two-pointer thinking
4. **Deepen understanding**: Each phase builds on previous

### For Interview Prep
- Two Sum is **THE classic interview pattern**
- Can appear in 3 forms:
  - Unsorted array (Phase 1) - Hash Map
  - Sorted array (Phase 1) - Two Pointers  
  - Tree variant (Phase 4) - DFS + Hash Set
- Master Phase 1 completely before interviewing

### For Production
- Know when to sort (one-time O(n log n)) vs hash (O(n) + O(n) space)
- Understand dynamic operations (Phase 3)
- Recognize tree variants (Phase 4)

---

## Pattern Reference Sheet

### Two Pointers (Phase 1)
```
When: Array sorted OR need to find pairs/triplets
Template:
  left = 0, right = n-1
  while left < right:
    if condition: process, move one/both pointers
    else: move appropriate pointer

Complexity: O(n) time, O(1) space
```

### Sliding Window (Phase 2 - Coming)
```
When: Contiguous subarray, fixed/variable size
Template:
  left = 0
  for right in range(n):
    add nums[right]
    while condition: remove nums[left], left++
    process window

Complexity: O(n) time, O(k) space where k = window size
```

### Hash Map (Phase 3 - Coming)
```
When: Need O(1) lookup, dynamic adds, frequency
Template:
  map = {}
  for num in nums:
    complement = target - num
    if complement in map: process
    map[num] = ...

Complexity: O(n) time, O(n) space
```

### Tree/BST (Phase 4 - Coming)
```
When: Tree structure, need O(log n) search
Template:
  def dfs(node):
    if not node: return
    process(node)
    dfs(node.left)
    dfs(node.right)

Complexity: O(n) time, O(h) space for recursion
```

---

## Next Steps

1. ✅ **Two-sum.md** - Complete with Types 1, 2, and Variants 5
2. ⏳ **Create sliding-window.md** - Fixed & variable window patterns
3. ⏳ **Create hash-map-patterns.md** - Frequency maps, custom DS
4. ⏳ **Create tree-bst.md** - Traversal, operations, two-sum variant
5. ⏳ **Create advanced-patterns.md** - Binary search, DP combinations

---

**Created:** 2026-08-23 | **Purpose:** DSA Learning Path | **Level:** Interview Ready
