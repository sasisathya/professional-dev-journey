# Day 2 Study Guide - Caching Strategies + Spring Boot Basics + Linked Lists

**Date**: May 14, 2026
**Study Time**: 1.5 hours (90 minutes)
**Test Time**: 30 minutes (questions with me)

---

## Hour 1 (60 min): System Design - Caching Strategies Deep Dive

### Topics to Study:

#### 1. Cache Patterns (20 min)

**Cache-Aside (Lazy Loading)**
- How it works: Check cache → if miss → fetch from DB → write to cache → return
- When to use: Most common pattern
- Pros: Only cache what's needed
- Cons: Cache miss penalty, stale data possible

**Write-Through**
- How it works: Write to cache AND database at same time
- When to use: Need cache always fresh
- Pros: Cache never stale
- Cons: Write latency, might cache unused data

**Write-Behind (Write-Back)**
- How it works: Write to cache → return immediately → async write to DB
- When to use: High write throughput needed
- Pros: Very fast writes
- Cons: Data loss risk if cache crashes

**Read-Through**
- How it works: Cache automatically loads from DB on miss
- When to use: Cache library handles everything
- Pros: Transparent to application
- Cons: Still have cache miss penalty

**Refresh-Ahead**
- How it works: Proactively refresh cache before expiration
- When to use: Predictable access patterns
- Pros: No cache miss penalty
- Cons: Wasted CPU if data not accessed

#### 2. Cache Eviction Policies (15 min)

Study these algorithms:

**LRU (Least Recently Used)**
- Evict items not accessed recently
- Most common in practice
- How: Track access time, remove oldest

**LFU (Least Frequently Used)**
- Evict items accessed least often
- How: Track access count, remove lowest

**FIFO (First In First Out)**
- Evict oldest inserted item
- Simplest approach

**TTL (Time To Live)**
- Items expire after fixed time
- Common in web caching

**Random Replacement**
- Evict random item
- Simple, works surprisingly well sometimes

#### 3. Redis Fundamentals (15 min)

**What is Redis?**
- In-memory data store
- Key-value store (but supports complex data types)
- Very fast (microsecond latency)
- Used for caching, sessions, real-time analytics

**Redis Data Types:**
- Strings: Simple key-value
- Lists: Linked lists
- Sets: Unique values
- Sorted Sets: Ordered unique values
- Hashes: Field-value pairs (like mini objects)

**Common Redis Commands:**
```
SET key value
GET key
EXPIRE key seconds
DEL key
HSET hash field value
LPUSH list value
SADD set value
```

**When to use Redis vs Memcached:**
- Redis: Complex data types, persistence, pub/sub
- Memcached: Simple strings, pure cache, slightly faster

#### 4. Cache Invalidation Strategies (10 min)

**The Hard Problem**: Keeping cache and database in sync

**Strategies:**

**TTL-Based**
- Auto-expire after time period
- Simple but may serve stale data

**Event-Based**
- Invalidate when data updates
- Accurate but complex

**Version-Based**
- Include version in cache key: `user:123:v5`
- Change version when data updates

**Tag-Based**
- Group related cache entries
- Invalidate entire group at once

---

## Hour 2 Part 1 (30 min): Spring Boot Basics

### Topics to Study:

#### 1. What is Spring Boot? (5 min)

- Framework for building Java applications
- Built on top of Spring Framework
- Convention over configuration (minimal setup)
- Embedded server (Tomcat) included
- Auto-configuration magic

#### 2. Core Annotations (15 min)

**Application Level:**
```java
@SpringBootApplication  // Marks main application class
```

**Component Scanning:**
```java
@Component      // Generic Spring-managed bean
@Service        // Business logic layer
@Repository     // Data access layer (DAO)
@Controller     // Web MVC controller
@RestController // REST API controller (@Controller + @ResponseBody)
```

**Dependency Injection:**
```java
@Autowired           // Inject dependency
@Qualifier("name")   // Choose specific bean when multiple exist
@Primary             // Default bean when multiple exist
```

**REST API:**
```java
@GetMapping("/path")     // HTTP GET
@PostMapping("/path")    // HTTP POST
@PutMapping("/path")     // HTTP PUT
@DeleteMapping("/path")  // HTTP DELETE
@PathVariable            // Extract from URL: /users/{id}
@RequestParam            // Extract from query: /users?id=5
@RequestBody             // Parse JSON request body
@ResponseBody            // Return JSON response
```

#### 3. Dependency Injection (DI) Recap (10 min)

**Three Types:**

**Field Injection** (not recommended):
```java
@Autowired
private UserService userService;
```

**Constructor Injection** (BEST PRACTICE):
```java
private final UserService userService;

public UserController(UserService userService) {
    this.userService = userService;
}
```

**Setter Injection** (rare):
```java
private UserService userService;

@Autowired
public void setUserService(UserService userService) {
    this.userService = userService;
}
```

**Why Constructor Injection is best:**
- Immutable (final fields)
- Easy to test (can pass mock in constructor)
- Required dependencies are obvious
- No null pointer exceptions

---

## Hour 2 Part 2 (30 min): DSA - Linked Lists Pattern

### Topics to Study:

#### 1. Linked List Basics (10 min)

**Structure:**
```
Node:
  - data (value)
  - next (pointer to next node)

[1] → [2] → [3] → [4] → null
```

**vs Array:**
| Feature | Array | Linked List |
|---------|-------|-------------|
| Access by index | O(1) | O(n) |
| Insert at beginning | O(n) | O(1) |
| Insert at end | O(1) | O(1) with tail pointer |
| Delete | O(n) | O(1) if have pointer |
| Memory | Contiguous | Scattered |
| Cache friendly | Yes | No |

**When to use Linked List:**
- Frequent insertions/deletions at beginning
- Unknown size in advance
- Don't need random access

#### 2. Two Pointer Technique (20 min)

**Pattern: Fast & Slow Pointers**

Used for:
- Finding middle of list
- Detecting cycles
- Finding nth node from end

**Example: Find Middle**
```
slow moves 1 step, fast moves 2 steps
When fast reaches end, slow is at middle

[1] → [2] → [3] → [4] → [5]
 s
 f

[1] → [2] → [3] → [4] → [5]
       s
             f

[1] → [2] → [3] → [4] → [5]
             s
                         f (end)

Middle = 3
```

**Example: Detect Cycle**
```
If there's a cycle, fast and slow will eventually meet
If no cycle, fast will reach null
```

**Example: Find nth from end**
```
Move fast pointer n steps ahead
Then move both together
When fast reaches end, slow is at nth from end
```

**Problems using Two Pointers:**
- Middle of Linked List
- Linked List Cycle
- Remove Nth Node From End
- Palindrome Linked List

---

## Study Checklist (Use this while studying)

### System Design - Caching:
- [ ] Understand all 5 cache patterns
- [ ] Know when to use each pattern
- [ ] Understand cache eviction policies (LRU, LFU, FIFO)
- [ ] Know what Redis is and basic data types
- [ ] Understand cache invalidation strategies

### Spring Boot:
- [ ] Understand what Spring Boot is
- [ ] Know all core annotations (@Service, @RestController, etc.)
- [ ] Understand 3 types of dependency injection
- [ ] Know why constructor injection is best
- [ ] Understand REST API annotations (@GetMapping, @PathVariable, etc.)

### DSA - Linked Lists:
- [ ] Understand linked list structure
- [ ] Know difference between array and linked list
- [ ] Understand fast & slow pointer technique
- [ ] Know how to find middle of list
- [ ] Know how to detect cycle
- [ ] Know how to find nth from end

---

## Study Tips:

1. **Don't memorize code** - understand concepts
2. **Draw diagrams** for cache patterns and pointer movement
3. **Ask yourself "why"** for each concept
4. **Think of real-world examples** (Instagram feed = cache-aside, etc.)
5. **Take short breaks** every 25 minutes

---

## After 1.5 Hours: Come Back for Q&A Test

I will ask you questions to test your understanding:

**Expected Questions:**
1. System Design: Explain cache-aside pattern and when to use it
2. System Design: What's the difference between LRU and LFU?
3. Spring Boot: What annotations would you use for a REST API service?
4. Spring Boot: Why is constructor injection better than field injection?
5. DSA: How do you find the middle of a linked list using two pointers?
6. DSA: How does cycle detection work with fast/slow pointers?

---

## Resources (Optional - if you want to go deeper):

**Caching:**
- Your system design guide: `/system-design/README.md` (Section 4)
- Search: "Redis data types tutorial"
- Search: "Cache eviction algorithms explained"

**Spring Boot:**
- Search: "Spring Boot annotations cheat sheet"
- Search: "Dependency injection in Spring Boot"

**Linked Lists:**
- Search: "Two pointer technique linked list"
- Search: "Fast and slow pointer algorithm"
- Visualize: draw the pointer movements on paper

---

## Ready?

**Study for 1.5 hours, then come back and say "ready for Day 2 test"**

I'll ask you questions to verify understanding, then we mark Day 2 complete! 🚀

**Good luck!** 📚
