# 30-Day Interview Prep Plan
## DSA + System Design Intensive

**Timeline:** 30 days (intensive)  
**Daily commitment:** 5 hours (morning DSA 7-9, evening system design 8-10, + 1 hour flex)  
**Language:** Java (primary), JavaScript (fallback)

---

## Phase 1: DSA Foundation (Days 1-10)

### Day 1: HashMap/HashTable Patterns
- **Pattern:** Hash-based lookups
- **Concept:** Hashing, collisions, time complexity O(1) average
- **Code (5 problems):**
  1. Two Sum
  2. Valid Anagram
  3. Group Anagrams
  4. Contains Duplicate
  5. Majority Element
- **System Design:** Why hash tables power databases (intro)

### Day 2: Two Pointers
- **Pattern:** Opposite end approach
- **Concept:** Convergent pointers, avoiding nested loops
- **Code (5 problems):**
  1. Valid Palindrome
  2. Two Sum II (sorted array)
  3. 3Sum
  4. Container With Most Water
  5. Trapping Rain Water
- **System Design:** Pointer patterns in memory management

### Day 3: Sliding Window
- **Pattern:** Dynamic window size
- **Concept:** Expanding/contracting window, two-pointer variant
- **Code (5 problems):**
  1. Maximum Subarray of Size K
  2. Longest Substring Without Repeating
  3. Minimum Window Substring
  4. Permutation in String
  5. Sliding Window Maximum
- **System Design:** Buffering and windowing in streaming systems

### Day 4: Binary Search
- **Pattern:** Divide and conquer on sorted data
- **Concept:** O(log n) complexity, search space reduction
- **Code (5 problems):**
  1. Binary Search
  2. Search in Rotated Array
  3. First Bad Version
  4. Find Peak Element
  5. Median of Two Sorted Arrays
- **System Design:** Binary search in distributed systems (partitioning)

### Day 5: Stack Patterns
- **Pattern:** LIFO, backtracking
- **Concept:** Call stack, DFS, monotonic stack
- **Code (5 problems):**
  1. Valid Parentheses
  2. Daily Temperatures
  3. Next Greater Element
  4. Largest Rectangle in Histogram
  5. Trapping Rain Water (stack approach)
- **System Design:** Call stack in recursion, browser back button

### Day 6: Queue & Deque
- **Pattern:** FIFO, breadth-first
- **Concept:** BFS, level-order traversal
- **Code (5 problems):**
  1. Reverse a Queue
  2. Number of Islands (BFS)
  3. Binary Tree Level Order Traversal
  4. Sliding Window Maximum (deque)
  5. Task Scheduler
- **System Design:** Message queues, job processing systems

### Day 7: Linked Lists
- **Pattern:** Node traversal, pointer manipulation
- **Concept:** Memory efficiency, insertion/deletion
- **Code (5 problems):**
  1. Reverse Linked List
  2. Merge Sorted Lists
  3. Detect Cycle
  4. Remove Nth Node
  5. LRU Cache (intro)
- **System Design:** Linked lists in OS (free list), LRU eviction

### Day 8: Recursion & Backtracking
- **Pattern:** Tree exploration, exhaustive search
- **Concept:** Base cases, call stack, pruning
- **Code (5 problems):**
  1. Permutations
  2. Combinations
  3. N-Queens
  4. Word Search
  5. Generate Parentheses
- **System Design:** Backtracking in game AI, constraint solving

### Day 9: Trees - Traversal & Search
- **Pattern:** DFS (preorder, inorder, postorder), BFS
- **Concept:** Binary tree, subtree problems
- **Code (5 problems):**
  1. Inorder Traversal
  2. Lowest Common Ancestor
  3. Serialize & Deserialize Tree
  4. Path Sum II
  5. Binary Tree Maximum Path Sum
- **System Design:** Tree structures in file systems, DOM

### Day 10: Binary Search Trees
- **Pattern:** Ordered tree, range queries
- **Concept:** BST property, insertion, deletion
- **Code (5 problems):**
  1. Validate BST
  2. Kth Smallest in BST
  3. Closest BST Value
  4. Range Sum of BST
  5. Recover BST
- **System Design:** Database indexing with B-trees, range scans

---

## Phase 2: Advanced DSA (Days 11-20)

### Day 11: Heaps & Priority Queues
- **Pattern:** Optimal selection (min/max)
- **Concept:** Heap property, heapify, use cases
- **Code (5 problems):**
  1. Kth Largest Element
  2. Top K Frequent Elements
  3. Merge K Sorted Lists
  4. Find Median from Data Stream
  5. Reorganize String
- **System Design:** Heaps in load balancing, scheduling

### Day 12: Graphs - Basic (BFS/DFS)
- **Pattern:** Graph traversal
- **Concept:** Adjacency list, visited tracking
- **Code (5 problems):**
  1. Clone Graph
  2. Course Schedule (cycle detection)
  3. Number of Connected Components
  4. Word Ladder
  5. Alien Dictionary (topological sort intro)
- **System Design:** Graph traversal in social networks, recommendations

### Day 13: Graphs - Shortest Path
- **Pattern:** Dijkstra, BFS
- **Concept:** Weighted graphs, relaxation
- **Code (5 problems):**
  1. Dijkstra's Algorithm
  2. Network Delay Time
  3. Cheapest Flights Within K Stops
  4. Path with Maximum Probability
  5. Swim in Rising Water
- **System Design:** Routing algorithms, GPS navigation

### Day 14: Union-Find (Disjoint Set Union)
- **Pattern:** Grouping, connectivity
- **Concept:** Union by rank, path compression
- **Code (5 problems):**
  1. Union-Find Implementation
  2. Redundant Connection
  3. Number of Connected Components in Undirected Graph
  4. Earliest Ancestors (Facebook-style)
  5. Accounts Merge
- **System Design:** DSU in social networks, image processing

### Day 15: Dynamic Programming - 1D
- **Pattern:** State: f[i]
- **Concept:** Overlapping subproblems, memoization
- **Code (5 problems):**
  1. Climbing Stairs
  2. House Robber
  3. Coin Change
  4. Longest Increasing Subsequence
  5. Jump Game II
- **System Design:** DP in resource allocation, planning

### Day 16: Dynamic Programming - 2D
- **Pattern:** State: f[i][j]
- **Concept:** Path counting, optimization
- **Code (5 problems):**
  1. Unique Paths
  2. Edit Distance
  3. Maximal Square
  4. Interleaving String
  5. Regular Expression Matching
- **System Design:** DP in sequence alignment, spell checking

### Day 17: String Patterns
- **Pattern:** Substring, pattern matching
- **Concept:** KMP, rolling hash
- **Code (5 problems):**
  1. Longest Palindromic Substring
  2. Longest Common Subsequence
  3. Wildcard Matching
  4. Implement strStr()
  5. Shortest Palindrome
- **System Design:** Pattern matching in text search, compression

### Day 18: Tries & Prefix Trees
- **Pattern:** Prefix-based lookup
- **Concept:** Tree of characters, autocomplete
- **Code (5 problems):**
  1. Implement Trie
  2. Word Search II
  3. Autocomplete System
  4. Replace Words
  5. Design Add and Search Words Data Structure
- **System Design:** Tries in autocomplete, IP routing

### Day 19: Bit Manipulation
- **Pattern:** Binary operations
- **Concept:** XOR, bit masking, Gray code
- **Code (5 problems):**
  1. Single Number
  2. Number of 1 Bits
  3. Power of Two
  4. Missing Number
  5. Reverse Bits
- **System Design:** Bit manipulation in flags, permissions

### Day 20: Intervals & Greedy
- **Pattern:** Interval merging, greedy choice
- **Concept:** Activity selection, non-overlapping
- **Code (5 problems):**
  1. Merge Intervals
  2. Insert Interval
  3. Video Stitching
  4. Meeting Rooms II
  5. Task Scheduler (greedy approach)
- **System Design:** Scheduling, resource allocation

---

## Phase 3: System Design Deep Dive (Days 21-30)

### Day 21: Caching Strategies
- **Concept:** LRU, LFU, cache invalidation
- **Pattern:** Implement LRU Cache from scratch
- **System Design:** Cache layers (L1/L2/L3, Redis, CDN)
- **Implementation:** Java/JavaScript LRU with HashMap + Deque

### Day 22: Database Design
- **Concept:** Indexing, normalization, query optimization
- **Pattern:** Design a key-value store
- **System Design:** SQL vs NoSQL trade-offs
- **Implementation:** Simple hash-based KV store with persistence

### Day 23: Rate Limiting & Load Balancing
- **Concept:** Token bucket, sliding window, round-robin
- **Pattern:** Implement rate limiter
- **System Design:** Load balancing strategies
- **Implementation:** Token bucket algorithm

### Day 24: Message Queues & Async Processing
- **Concept:** Producer-consumer, event-driven
- **Pattern:** Design a task queue
- **System Design:** Message brokers (Kafka, RabbitMQ)
- **Implementation:** Simple queue with worker threads

### Day 25: Distributed Consensus & Replication
- **Concept:** CAP theorem, eventual consistency
- **Pattern:** Understand replica synchronization
- **System Design:** Master-slave, multi-master replication
- **Implementation:** Read-write with consistency models

### Day 26: Search & Sorting at Scale
- **Concept:** Inverted index, sharding
- **Pattern:** Design a search engine
- **System Design:** Elasticsearch architecture
- **Implementation:** Simple inverted index

### Day 27: Real-Time Features
- **Concept:** WebSockets, polling, server-sent events
- **Pattern:** Design notification system
- **System Design:** Pub-sub patterns
- **Implementation:** Notification delivery with guarantees

### Day 28: Scalability & Partitioning
- **Concept:** Consistent hashing, sharding strategies
- **Pattern:** Design database sharding
- **System Design:** Vertical vs horizontal scaling
- **Implementation:** Consistent hash ring

### Day 29: Monitoring & Observability
- **Concept:** Logging, metrics, tracing
- **Pattern:** Design monitoring system
- **System Design:** Prometheus, ELK stack
- **Implementation:** Simple metrics collector

### Day 30: Mock Interview Practice
- **Full Mock #1:** DSA problem (45 min) + System Design (45 min)
- **Full Mock #2:** Different problem set
- **Behavioral:** Practice storytelling about your projects
- **Review:** Identify weak areas

---

## How to Use This Plan

### Daily Routine (5 hours)
```
7:00-9:00 AM (2 hours): DSA Pattern
  - 10 min: Read pattern explanation
  - 20 min: Understand 1 example problem
  - 90 min: Code 5 problems (30 min each, roughly)
  
9:00-10:00 AM (1 hour): Flex time
  - Refactor code from previous days
  - Review edge cases
  - Optimize solutions
  
8:00-10:00 PM (2 hours): System Design
  - 30 min: Understand concept
  - 30 min: High-level design on whiteboard
  - 60 min: Implementation in code
```

### Success Criteria for Each Day
- [ ] Can explain the pattern in your own words
- [ ] Solved all 5 problems without looking at solutions
- [ ] Understand time/space complexity
- [ ] Can implement the system design concept
- [ ] No copy-paste; typed all code from memory

### Troubleshooting
- **Stuck on a problem?** Skip it, come back after 2 days
- **Pattern feels too easy?** Do harder variant (LeetCode hard)
- **Pattern feels too hard?** Do easier variant first, then advance
- **Not finishing 5 problems?** Quality over quantity — 2 perfect solutions > 5 rushed

---

## Resources (Already in Your Repo)

- **DSA Code:** `theory/dsa/classes/java/` (29 category implementations)
- **Patterns:** `theory/dsa/DSA-PATTERNS-COMPLETE.md`
- **System Design:** `theory/system-design/` folder
- **Design Patterns:** `design-patterns/` folder

---

## By Day 30
You'll have:
- ✅ Deep DSA mastery (200+ problems coded)
- ✅ 10 system design implementations
- ✅ Ready for 2-3 coding interviews
- ✅ Strong foundation for system design round

**No shortcuts. This is the path.**
