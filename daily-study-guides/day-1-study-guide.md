# Day 1 Study Guide - System Design Fundamentals + Java OOP + Arrays/HashMaps

**Date**: May 13, 2026
**Study Time**: 1.5-2 hours
**Test Time**: 30 minutes (questions with me)

---

## Hour 1 (60 min): System Design Fundamentals

### Topics to Study:

#### 1. Requirements Gathering (15 min)

**Two Types of Requirements:**

**Functional Requirements** (What should it do?)
- Core features the system must support
- User actions and workflows
- APIs and endpoints needed
- Business logic requirements

**Examples for Instagram:**
- Users can upload photos/videos
- Users can follow other users
- Users can view a personalized feed
- Users can like and comment
- Users receive notifications

**Non-Functional Requirements** (How well should it perform?)
- **Scalability**: How many users? (e.g., 1B users, 200M daily active)
- **Performance**: Response time? (e.g., feed loads < 500ms)
- **Availability**: Uptime? (e.g., 99.99%)
- **Consistency**: Can we show stale data or must be real-time?
- **Durability**: How long to keep data?

**Key Principle**: Always ask clarifying questions before designing!
- Don't say "many users" → say "1 billion users"
- Don't say "fast" → say "< 200ms response time"
- Get specific numbers!

#### 2. Capacity Estimation (20 min)

**What to Calculate:**

**Traffic Estimation:**
```
Daily Active Users (DAU) × Actions per day = Total requests
Total requests / 86,400 seconds = Average QPS
Average QPS × 3 = Peak QPS (assume 3x spike)
```

**Storage Estimation:**
```
Items per day × Size per item = Daily storage
Daily storage × 30 = Monthly storage
Monthly storage × 12 = Yearly storage
```

**Example: Instagram**
```
Given:
- 1 billion total users
- 200M daily active users
- Each user posts 1 photo per week (avg 2MB)
- Each user views feed 10 times per day

Traffic:
- Photos per day = 1B / 7 = ~143M photos/day
- Feed views = 200M × 10 = 2B requests/day
- QPS = 2B / 86,400 = ~23,000 QPS average
- Peak QPS = 23,000 × 3 = ~70,000 QPS

Storage:
- Daily = 143M × 2MB = 286 TB/day
- Yearly = 286TB × 365 = ~103 PB/year

Servers needed:
- If each server handles 1,000 QPS
- Minimum = 70,000 / 1,000 = 70 servers
- With 3x redundancy = 210 servers
```

**Key Numbers to Remember:**
- 1 day = 86,400 seconds
- 1 million = 10^6
- 1 billion = 10^9
- 1 KB = 1,000 bytes
- 1 MB = 1,000 KB
- 1 GB = 1,000 MB
- 1 TB = 1,000 GB
- 1 PB = 1,000 TB

#### 3. Load Balancing Basics (15 min)

**What is Load Balancing?**
- Distributes requests across multiple servers
- Prevents any single server from being overloaded
- Increases availability and fault tolerance

**Common Algorithms:**

**Round Robin**
- Send requests to servers in rotation (1→2→3→1→2→3)
- Pros: Simple, fair distribution
- Cons: Doesn't consider server load

**Least Connections**
- Send to server with fewest active connections
- Pros: Better for varying request times
- Cons: More overhead

**Least Response Time**
- Send to fastest responding server
- Pros: Best performance
- Cons: Higher overhead to measure

**IP Hash**
- Same client always goes to same server
- Pros: Session affinity (user data cached on server)
- Cons: Uneven distribution if some users very active

**Load Balancer Layers:**
- **Layer 4 (L4)**: Routes based on IP/port (fast, no content inspection)
- **Layer 7 (L7)**: Routes based on HTTP headers, URLs, cookies (slower, more flexible)

#### 4. Caching Decision Framework (10 min)

**What is Caching?**
- Storing frequently accessed data in fast storage (memory)
- Reduces database load
- Improves response time

**When to Cache?**
✅ Cache if:
1. Read frequently
2. Expensive to compute/fetch
3. Doesn't change often (or stale data is acceptable)
4. Consistent access pattern

❌ Don't cache if:
1. Changes very frequently
2. Rarely accessed
3. Must be 100% accurate (banking, payments)
4. Cheap to fetch from database

**What to Cache for Instagram:**
- ✅ User feed/timeline (expensive to compute, read often)
- ✅ User profile info (rarely changes, accessed often)
- ✅ Post metadata (image URL, caption, username)
- ❌ Like counts (changes too frequently)
- ❌ User's own posts (rarely accessed)

**Centralized vs Local Cache:**
- **Local cache**: Each server has its own cache
  - Problem: Data duplicated, lost if server crashes
- **Centralized cache** (Redis): Shared cache cluster
  - ✅ Better: Any server can access, survives crashes, scales independently

---

## Hour 2 Part 1 (30 min): Java OOP Fundamentals

### Topics to Study:

#### 1. Four Pillars of OOP (10 min)

**1. Abstraction**
- Hiding complex implementation details
- Show only essential features
- Example: You drive a car without knowing engine internals

**2. Encapsulation**
- Bundling data and methods together in a class
- Using private fields with public getters/setters
- Protects data from outside interference
```java
class User {
    private String name;  // Encapsulated

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
```

**3. Inheritance**
- Child class inherits properties/methods from parent
- IS-A relationship
```java
class Animal {
    void eat() { }
}

class Dog extends Animal {
    void bark() { }  // Dog has eat() + bark()
}
```

**4. Polymorphism**
- "Many forms" - same interface, different behavior
- Two types:
  - **Compile-time (Overloading)**: Same method name, different parameters
  - **Run-time (Overriding)**: Child redefines parent method
```java
Animal animal = new Dog();  // Dog IS-A Animal
animal.sound();  // Calls Dog's sound(), not Animal's
```

#### 2. Abstract Class vs Interface (15 min)

**Key Differences:**

| Feature | Abstract Class | Interface |
|---------|---------------|-----------|
| **Multiple inheritance** | ❌ Extend only 1 | ✅ Implement MULTIPLE |
| **Instance variables** | ✅ Yes | ❌ Only constants |
| **Constructors** | ✅ Yes | ❌ No |
| **Method implementation** | ✅ Can have concrete methods | ✅ Default methods (Java 8+) |
| **Access modifiers** | ✅ public/private/protected | ❌ All public |
| **When to use** | IS-A (inheritance) | CAN-DO (capability) |

**CRITICAL: You CAN implement MULTIPLE interfaces!**
```java
// ✅ ALLOWED - Multiple interfaces
class Bird implements Flyable, Swimmable, Eatable {
    public void fly() { }
    public void swim() { }
    public void eat() { }
}

// ❌ NOT ALLOWED - Multiple classes
class Bird extends Animal, Vehicle {  // COMPILE ERROR!
}

// ✅ ALLOWED - 1 class + multiple interfaces
class Bird extends Animal implements Flyable, Swimmable {
}
```

**When to Use:**

**Abstract Class:**
- Common code to share among related classes
- Need instance variables or constructors
- Want protected/private members
```java
abstract class Vehicle {
    protected String brand;

    public Vehicle(String brand) {
        this.brand = brand;
    }

    abstract void start();

    void stop() {  // Shared implementation
        System.out.println("Vehicle stopped");
    }
}
```

**Interface:**
- Define capability/contract
- Need multiple inheritance
- Unrelated classes need same behavior
```java
interface Flyable {
    void fly();
}

class Duck implements Flyable, Swimmable { }  // Multiple!
class Airplane implements Flyable { }
```

#### 3. @Autowired and Dependency Injection (5 min)

**What is @Autowired?**
- Tells Spring: "Inject a bean of this type automatically"
- You don't create objects with `new`
- Spring manages object lifecycle

**How it Works:**
```java
// Step 1: Register with Spring
@Service
public class UserService {
    public List<User> getAllUsers() { }
}

// Step 2: Spring injects it
@RestController
public class UserController {
    @Autowired
    private UserService userService;  // Spring creates & injects

    // You DON'T write: new UserService()
}
```

**Three Types of Injection:**

**Field Injection** (simple but not ideal):
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
@Autowired
public void setUserService(UserService userService) {
    this.userService = userService;
}
```

**Why Constructor Injection is Best:**
- Immutable (final fields)
- Easy to test (pass mock in constructor)
- Required dependencies obvious
- No null pointer exceptions

**Key Annotations:**
- `@Component` - Generic bean
- `@Service` - Business logic
- `@Repository` - Data access
- `@Controller/@RestController` - Web layer

---

## Hour 2 Part 2 (30 min): DSA - Arrays & HashMaps Patterns

### Topics to Study:

#### 1. HashMap Basics (10 min)

**What is a HashMap?**
- Key-value pairs
- O(1) average lookup time
- Uses hashing internally

**When to Use HashMap:**
1. Need fast lookup by key
2. Finding pairs/complements
3. Counting frequency
4. Grouping items
5. Checking for duplicates

**HashMap vs Array:**
| Feature | Array | HashMap |
|---------|-------|---------|
| Lookup by index | O(1) | N/A |
| Lookup by value | O(n) | O(1) |
| Insertion | O(1) at end | O(1) |
| Order preserved | Yes | No |
| Space | Fixed | Dynamic |

#### 2. Pattern 1: Complement Pattern (10 min)

**Used for:** Finding pairs that satisfy a condition

**Template:**
```
For each element:
    complement = target - current
    if complement exists in HashMap:
        return result
    add current to HashMap
```

**Classic Problem: Two Sum**
```
Given: nums = [2, 7, 11, 15], target = 9
Find: indices of two numbers that add to target

Approach:
i=0, num=2: complement = 9-2 = 7
           check map for 7? No
           add {2: 0}

i=1, num=7: complement = 9-7 = 2
           check map for 2? Yes! (index 0)
           return [0, 1]

Time: O(n) - single pass
Space: O(n) - HashMap
```

**Why HashMap?**
- Brute force: O(n²) with nested loops
- HashMap: O(n) with single pass + O(1) lookup

#### 3. Pattern 2: Grouping by Key (10 min)

**Used for:** Grouping items with common property

**Template:**
```
For each item:
    key = transform(item)
    add item to map[key]
```

**Classic Problem: Group Anagrams**
```
Given: ["eat", "tea", "tan", "ate", "nat", "bat"]
Group: anagrams together

Key insight: Anagrams have same letters when sorted!
- "eat" → sorted = "aet"
- "tea" → sorted = "aet"
- Same sorted string = anagrams!

Approach:
"eat": sorted = "aet", map = {"aet": ["eat"]}
"tea": sorted = "aet", map = {"aet": ["eat", "tea"]}
"tan": sorted = "ant", map = {"aet": ["eat", "tea"], "ant": ["tan"]}
"ate": sorted = "aet", map = {"aet": ["eat", "tea", "ate"], "ant": ["tan"]}

Return all values: [["eat", "tea", "ate"], ["tan"], ...]

Time: O(n * k log k) where n=strings, k=avg length
Space: O(n * k)
```

---

## Study Checklist

### System Design:
- [ ] Understand functional vs non-functional requirements
- [ ] Can calculate QPS and storage estimates
- [ ] Know capacity estimation formulas
- [ ] Understand load balancing algorithms
- [ ] Know when to cache and what to cache
- [ ] Understand centralized vs local cache

### Java OOP:
- [ ] Know 4 pillars of OOP with examples
- [ ] Understand polymorphism (overloading vs overriding)
- [ ] Know difference between abstract class and interface
- [ ] **CRITICAL**: Can implement MULTIPLE interfaces
- [ ] Know when to use abstract class vs interface
- [ ] Understand @Autowired and dependency injection
- [ ] Know 3 types of injection and which is best

### DSA Patterns:
- [ ] Know when to use HashMap
- [ ] Understand Complement Pattern (Two Sum)
- [ ] Understand Grouping by Key Pattern (Group Anagrams)
- [ ] Can explain time/space complexity

---

## Expected Test Questions

After studying, I will ask:

**System Design:**
1. What are functional vs non-functional requirements? Give examples.
2. Calculate: 100M DAU, 5 requests/day each. What's the QPS?
3. You need to handle 50,000 QPS and each server does 1,000 QPS. How many servers minimum?
4. What load balancing algorithm for session-based apps?
5. Should you cache like counts on Instagram? Why or why not?

**Java OOP:**
1. Explain the 4 pillars of OOP
2. What's the difference between abstract class and interface?
3. Can you implement multiple interfaces? Multiple abstract classes?
4. When would you use interface vs abstract class?
5. What does @Autowired do?
6. Why is constructor injection better than field injection?

**DSA:**
1. Explain the Complement Pattern approach for Two Sum
2. What's the time complexity? Why is HashMap better than nested loops?
3. How do you group anagrams using HashMap?
4. What's the key/transform for grouping anagrams?

---

## Study Tips

1. **Don't memorize** - understand WHY
2. **Draw diagrams** for system design
3. **Write out examples** for DSA patterns
4. **Think of real-world uses** (Instagram, Twitter)
5. **Take breaks** every 25-30 minutes

---

## After Studying

**Say:** "ready for Day 1 test"

I'll ask you questions from the list above to verify understanding.

---

**Good luck! 🚀📚**
