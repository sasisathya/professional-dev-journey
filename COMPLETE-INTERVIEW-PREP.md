# Complete Google/Uber Interview Prep (Sept 4 - Nov 4, 2026)

## 🎯 What They Test (3 Rounds)

| Round | Focus | Duration | Your Challenge |
|-------|-------|----------|-----------------|
| **DSA/Coding** | Medium-hard LeetCode: trees, graphs, DP, arrays, strings | 45 min | Code fast + no syntax pauses |
| **System Design** | Design large system + code critical parts + tradeoffs | 45 min | You know theory, need to code under pressure |
| **Behavioral** | Leadership, mentorship, conflict resolution, learned lessons | 30 min | 10 years = good stories, need structure |

---

## ⏱️ Time Budget (5-7 hours/day)

```
Daily:
  1.5-2 hrs → DSA (LeetCode medium/hard)
  1.5-2 hrs → System Design  
  1-2 hrs → Full-stack coding (Node/React)
  0.5-1 hr → Behavioral prep + writing

6 days/week (1 rest day)
```

**This is intense.** But you have 2 months. It's doable.

---

## WEEK 1-2: DSA Foundation + Muscle Memory

### DSA Component (1.5-2 hrs/day)
Follow the pattern in your `/theory/DSA.md`:

**Day 1-3: Understand the machinery**
- Read: Complexity Analysis section
- Read: Pattern Recognition Cheatsheet
- Understand: Why O(n) sometimes beats O(1), cache hits matter, constants matter
- Task: Implement from scratch (no copy-paste):
  - Dynamic array (understand resizing, O(1) amortized)
  - Hash map (collision handling, load factor)
  - Binary heap (heapify operation, O(n) vs O(n log n))
  - LRU cache (O(1) get/put with eviction)

**Day 4-7: Start Tier 0 + Tier 1 patterns**
- LeetCode Easy (understanding not speed)
- Go slow. Explain complexity BEFORE coding.
- Do 4-6 problems per pattern:
  - Two Sum variants
  - Array/String manipulation
  - Sliding window
  - Basic trees (traversals, height)

### Node.js Refresh (1-1.5 hrs/day)
**Pick 2 quick projects:**

1. **Async/Await Retry Pattern**
   ```javascript
   // Write without looking it up:
   async function withRetry(fn, maxRetries, delay) {
     // exponential backoff, timeout handling
   }
   ```

2. **Simple Rate Limiter (Redis)**
   ```javascript
   // Sliding window token bucket
   // Handle Redis failure gracefully
   ```

### System Design Warmup (30 min/day)
- Read: one distributed systems concept from your notes
- Example: "At-least-once vs Exactly-once semantics"
- Write: one paragraph explaining *why* it matters

---

## WEEK 3-4: DSA Patterns + System Design Fundamentals

### DSA Component (2 hrs/day)
**Continue pattern drilling. Focus:** Tier 1 + early Tier 2
- Trees (BST, balanced trees, traversals) - **Tier 1**
- Graphs (BFS, DFS, connected components) - **Tier 1**
- Arrays/Strings (binary search, prefix sum) - **Tier 1**
- Start: Dynamic Programming basics - **Tier 2**

**Daily structure:**
- 30 min: Solve 1-2 problems
- 15 min: Explain complexity out loud (practice talking)
- 15 min: Variations - "What if the constraint changed?"

### System Design + Full-Stack (2.5 hrs/day)

**Mon/Wed/Fri: System Design lectures**
- Your repo has distributed patterns guide
- Pick one: Cache-aside, Circuit breaker, Exactly-once, etc.
- Deep dive: implementation details, failure modes

**Tue/Thu/Sat: Build projects**

**Project 1: Notification Service (Week 3)**
```
Backend (Node):
  POST /notify - create notification (idempotent)
  GET /notifications - list user notifications
  WebSocket /updates - real-time updates
  
Needs:
  - Retry logic (exponential backoff)
  - Idempotency key handling
  - Error recovery (DB down, Redis down, network flaky)
  - Rate limiting (per user, per IP)

Frontend (React):
  Form to send notification
  List to display notifications
  Real-time updates via WebSocket
  Error states + retry logic

Requirements:
  - At-least-once delivery (no data loss)
  - No duplicate notifications
  - Handles network disconnects
  - Production code (not playground)
```

**Project 2: Rate Limiter (Week 4)**
```
Backend:
  POST /api/* protected by rate limiting
  Token bucket: Redis-based
  Graceful degradation when Redis down
  
Distributed:
  Multiple Node servers
  Shared Redis across all
  Handle clock skew, network delays
  
Code: the actual rate limiter logic
```

---

## WEEK 5-6: System Design Deep-Dives + Mock Interviews

### DSA Component (1.5 hrs/day)
**Target: Tier 2 patterns** (where seniors get filtered)
- Dynamic Programming (climb stairs → coin change → knapsack)
- Graphs (DFS/BFS variants, topological sort, shortest path)
- Advanced: Backtracking, Union-Find

**Do 3-4 problems per pattern.**

### System Design (2 hrs/day)

**Daily: Pick one problem, design + code**

1. **Notification System at Scale**
   - 1M users, 100 notifs/sec
   - Design: end-to-end architecture
   - Code: idempotency layer, retry handler, dedup logic

2. **Real-time Feed (like Twitter/Instagram)**
   - 10K posts/sec, 1B followers
   - Design: fanout strategy, caching
   - Code: cache-aside pattern, handling failures

3. **Distributed Cache (Redis at scale)**
   - Design: cache invalidation, consistency
   - Code: cache-aside, write-through variants

4. **Payment Processing**
   - Design: idempotent payment handler
   - Code: webhook receiver, retry logic, dead letter queue

5. **Database Connection Pooling**
   - Design: avoid exhaustion
   - Code: circuit breaker, graceful degradation

6. **Search/Autocomplete**
   - Design: billions of queries
   - Code: prefix tree + caching

7. **Rate Limiting (distributed)**
   - Design: token bucket across multiple nodes
   - Code: Redis implementation + fallback

8. **Message Queue (Kafka-style)**
   - Design: exactly-once delivery
   - Code: idempotent consumer, offset mgmt

### Mock Interviews (Starting Week 5, 3x/week)

**Structure:**
- 45 min live (I ask, you answer, no prep)
- You code/whiteboard the solution
- I interrupt with follow-ups: "What if Redis fails?" "Estimate latency." "Why that choice?"
- I'm harsh. I ask clarifying questions.

**Week 5:** 2 system designs, 1 DSA
**Week 6:** 2 system designs, 2 DSA problems

---

## WEEK 7-8: Final Polish + Mock Interviews

### DSA (1 hr/day)
- Weak areas only (identify from week 5-6)
- Practice talking + coding simultaneously
- 1 mock DSA interview every 2 days

### System Design (1 hr/day)
- 1 full mock interview every 2 days (45 min design + code)
- Record yourself, watch back (painful but effective)
- Fix presentation, not just correctness

### Behavioral (1 hr/day)
- Write down: 3-4 leadership stories
  - Time you led a technical decision
  - Time you mentored someone
  - Time you handled conflict
  - Time you learned from failure
- Practice telling them (2 min each, tight)
- Practice answering: "Why Google?" "Why Uber?" "What interests you?"

---

## Daily Progress Tracking

Create `DAILY-PROGRESS.md` and update each night:

```markdown
# Daily Progress

## Week 1, Day 1 (Sept 5, 2026)

### DSA
- [ ] Studied: Complexity Analysis
- [ ] Built: Dynamic array from scratch
- [ ] LeetCode: Two Sum (Easy) — 5 min, O(n) hash map
- [ ] Complexity stated out loud: ✓

### System Design
- [ ] Read: "At-least-once vs Exactly-once"
- [ ] Wrote: 1 paragraph explanation
- [ ] Understood: Why it matters for notifications

### Node.js Refresh
- [ ] Built: Retry function with exponential backoff
- [ ] Tested: With mock failures
- [ ] Timing: 45 min (slow but learning)

### Blockers
- Struggled with: Why heapify is O(n), not O(n log n)
- Need: Deep dive on this tomorrow

### Time Spent
- DSA: 1 hr 30 min
- System Design: 30 min
- Node.js: 45 min
- Total: 2 hrs 45 min (on pace)
```

---

## What Success Looks Like

### End of Week 2
- [ ] Can write dynamic array, hash map, LRU cache from memory
- [ ] Solve easy LeetCode problems without looking up syntax
- [ ] Explain why O(n) heap construction beats O(n log n)
- [ ] Built 2 Node.js production patterns

### End of Week 4
- [ ] Solve medium LeetCode problems in 20-30 min
- [ ] Full-stack notification system end-to-end
- [ ] Understand Redis failure modes, circuit breakers
- [ ] React components with error/loading/success states

### End of Week 6
- [ ] Solve hard LeetCode problems in 35-45 min
- [ ] 6+ mock system design interviews (scores improving)
- [ ] Can talk + code simultaneously (no pauses)
- [ ] Know when to ask clarifying vs. just assume

### End of Week 8
- [ ] 0 "I don't remember syntax" moments in mocks
- [ ] 10+ full mock interviews done
- [ ] Behavioral stories tight + compelling
- [ ] Ready to walk in Nov 4 and solve it

---

## Files to Create

```
interview-prep/
  DAILY-PROGRESS.md (update daily)
  dsa-practice/
    day1-dynamic-array.js
    day2-hash-map.js
    day3-lru-cache.js
    leetcode/
      two-sum.js
      contains-duplicate.js
      best-time-to-buy-sell.js
      ...
  system-design/
    week1-notes.md (readings + explanations)
    week3-notification-service/
      backend/
      frontend/
    week4-rate-limiter/
    ...
  behavioral/
    stories.md (3-4 leadership stories)
    company-research.md (Why Google/Uber?)
```

---

## The Hard Rules

1. **Daily DSA practice.** Non-negotiable. 1.5 hrs minimum.
2. **No syntax lookups during timed challenges.** Learn to remember.
3. **Mock interviews are TIMED.** 45 min for system design, 45 min for DSA.
4. **Behavioral stories must be 2 min max.** Practice being concise.
5. **Every design must answer:** What fails? Why that choice? What's the tradeoff?
6. **Talk while you code.** Silence = red flag to interviewer.

---

## If You Get Stuck

Tell me:
- Which DSA pattern is hard?
- Which system design concept doesn't make sense?
- What Node.js syntax do you keep forgetting?

Then we deep-dive that one thing until it clicks.

---

## Your First Assignment (Due Tomorrow)

Pick ONE of these and finish by Friday:

### Option A: DSA Foundation
```javascript
// Implement from scratch, no reference:
class DynamicArray {
  constructor() { }
  push(value) { }
  pop() { }
  get(index) { }
  size() { }
}
```

### Option B: Node.js Retry Function
```javascript
async function withRetry(asyncFn, maxRetries, delayMs) {
  // Exponential backoff
  // Timeout handling
  // Permanent failure handling
}
```

### Option C: LeetCode Medium Problem
- Pick: Two Sum II, 3Sum, Merge Intervals, or Longest Substring Without Repeating
- Solve it
- Explain: Time complexity, space complexity, why this approach

---

## When You're Done (Nov 4)

You walk in with:
- ✅ DSA muscle memory (10+ problems weekly, no syntax pauses)
- ✅ System design thinking + ability to code critical parts
- ✅ Full-stack implementation experience
- ✅ Behavioral stories + why this company
- ✅ 15+ mock interviews, know the pattern

**Not "I hope I pass."**  
**But "I've done this 15 times, I know how this goes."**

---

## Start Tomorrow

This is the full plan. Pick your first challenge above.

Show me the code or your solution. We iterate.

**You've got this.** But only if you commit to the grind.
