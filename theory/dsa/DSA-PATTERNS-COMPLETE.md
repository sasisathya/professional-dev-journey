# DSA Patterns Complete - 24 Categories with 10 Problems Each

> **Comprehensive Learning Guide**  
> 24 DSA categories with detailed sub-patterns and curated problem sets  
> Designed for interview mastery with progression from beginner to advanced

---

## 📋 Quick Navigation

**Learning Path:**
- **Phase 1 (Weeks 1-2):** Categories 1-4 (Arrays, Two Pointers, Sliding Window, Binary Search)
- **Phase 2 (Weeks 3-4):** Categories 5-7 (Stack, Queue/Deque, Linked Lists)  
- **Phase 3 (Weeks 5-6):** Categories 8-12 (Recursion, Backtracking, Trees, BST, Heap)
- **Phase 4 (Weeks 7-8):** Categories 13-16 (Graphs, Shortest Path, Union-Find, Topological Sort)
- **Phase 5 (Weeks 9+):** Categories 17-24 (Greedy, DP, String, Trie, Bit, Interval, Math, Advanced)

---

## PHASE 1: FOUNDATIONAL (Weeks 1-2)

### Category 1: Array and Hashing Patterns

#### 1.1 HashMap / HashSet
**Concept:** O(1) lookup/insert/delete using hash functions; collision handling  
**When to use:** Frequency counting, duplicates, presence checking, caching  
**Time/Space:** O(1) avg lookup | O(n) space  
**Difficulty:** Easy → Beginner

**10 Problems:**
1. **LeetCode 1** - Two Sum (Easy) - Basic frequency check
2. **LeetCode 242** - Valid Anagram (Easy) - Character frequency comparison
3. **LeetCode 49** - Group Anagrams (Medium) - HashMap with list values
4. **LeetCode 202** - Happy Number (Easy) - Cycle detection with set
5. **LeetCode 205** - Isomorphic Strings (Easy) - Two-direction mapping
6. **LeetCode 290** - Word Pattern (Easy) - Pattern matching with maps
7. **LeetCode 347** - Top K Frequent Elements (Medium) - Frequency + heap
8. **LeetCode 599** - Minimum Index Sum of Two Lists (Easy) - HashMap intersection
9. **LeetCode 697** - Degree of Array (Easy) - First/last occurrence with map
10. **LeetCode 1189** - Maximum Number of Balloons (Easy) - Character frequency counting

---

#### 1.2 Frequency Counting
**Concept:** Count occurrences of elements; identify patterns in frequency distribution  
**When to use:** Finding duplicates, majority elements, mode, frequency-based filtering  
**Time/Space:** O(n) time | O(n) space  
**Difficulty:** Easy

**10 Problems:**
1. **LeetCode 169** - Majority Element (Easy) - Element appearing > n/2 times
2. **LeetCode 229** - Majority Element II (Medium) - Elements appearing > n/3 times
3. **LeetCode 451** - Sort Characters by Frequency (Easy) - Sort by frequency count
4. **LeetCode 692** - Top K Frequent Words (Medium) - K most frequent with tie-breaking
5. **LeetCode 1002** - Find Common Characters (Easy) - Common character frequencies
6. **LeetCode 1394** - Find Lucky Integer (Easy) - Digit frequency matching
7. **LeetCode 2423** - Remove Letter to Equalize Frequencies (Medium) - Frequency adjustment
8. **LeetCode 1941** - Check if All Characters Have Equal Count (Easy) - Frequency uniformity
9. **LeetCode 3005** - Count Elements with Maximum Frequency (Easy) - Max frequency counting
10. **LeetCode 2970** - Count the Number of Incremovable Subarrays II (Hard) - Frequency patterns in subarrays

---

#### 1.3 Prefix Sum
**Concept:** Precompute cumulative sums for O(1) range sum queries  
**When to use:** Range sum queries, cumulative calculations, avoiding recalculation  
**Time/Space:** O(n) precompute + O(1) query | O(n) space  
**Difficulty:** Easy → Medium

**10 Problems:**
1. **LeetCode 303** - Range Sum Query - Immutable (Easy) - Basic prefix sum
2. **LeetCode 304** - Range Sum Query 2D - Immutable (Medium) - 2D prefix sum
3. **LeetCode 560** - Subarray Sum Equals K (Medium) - Prefix sum with hashmap
4. **LeetCode 1480** - Running Sum of 1d Array (Easy) - Simple prefix sum calculation
5. **LeetCode 2270** - Number of Ways to Split Array (Medium) - Left/right partition with prefix
6. **LeetCode 1732** - Find the Highest Altitude (Easy) - Maximum prefix sum
7. **LeetCode 2057** - Smallest Index With Equal Value (Easy) - Prefix based indexing
8. **LeetCode 238** - Product of Array Except Self (Medium) - Prefix and suffix products
9. **LeetCode 1371** - Find the Longest Valid Obstacle Course (Hard) - Prefix with dynamic programming
10. **LeetCode 1588** - Sum of All Odd Length Subarrays (Easy) - Prefix sum optimization

---

#### 1.4 Difference Array
**Concept:** Use array differences to efficiently handle range updates in O(1)  
**When to use:** Range update queries, bulk modifications, event-based problems  
**Time/Space:** O(n) updates amortized | O(n) space  
**Difficulty:** Medium

**10 Problems:**
1. **LeetCode 370** - Range Addition (Medium) - Basic difference array
2. **LeetCode 1109** - Corporate Flight Bookings (Medium) - Range updates for bookings
3. **LeetCode 1094** - Car Pooling (Medium) - Capacity checking with difference array
4. **LeetCode 1674** - Minimum Moves to Make Array Complementary (Medium) - Range increment
5. **LeetCode 2772** - Apply Operations to Make All Array Elements Equal to Zero (Medium) - Difference tracking
6. **LeetCode 1589** - Maximum Sum Obtained of Any Permutation (Medium) - Difference + sorting
7. **LeetCode 2381** - Shifting Letters (Medium) - Difference array for character shifts
8. **LeetCode 2528** - Maximize the Minimum Powered City (Hard) - Binary search + difference array
9. **LeetCode 2772** - Apply Operations to Make All Array Elements Equal to Zero (Hard) - Complex difference tracking
10. **LeetCode 3409** - Longest Increasing Subsequence (Very Hard) - Advanced difference concepts

---

#### 1.5 Kadane's Algorithm
**Concept:** Find maximum sum subarray in O(n) time using dynamic tracking  
**When to use:** Maximum subarray, maximum product subarray, best contiguous subsequence  
**Time/Space:** O(n) time | O(1) space  
**Difficulty:** Medium

**10 Problems:**
1. **LeetCode 53** - Maximum Subarray (Easy) - Classic Kadane's algorithm
2. **LeetCode 152** - Maximum Product Subarray (Medium) - Track both max/min
3. **LeetCode 121** - Best Time to Buy and Sell Stock (Easy) - Profit variant
4. **LeetCode 123** - Best Time to Buy and Sell Stock III (Hard) - Multiple transactions
5. **LeetCode 188** - Best Time to Buy and Sell Stock IV (Hard) - K transactions
6. **LeetCode 309** - Best Time to Buy and Sell Stock with Cooldown (Medium) - State machine variant
7. **LeetCode 1191** - K-Concatenation Maximum Sum (Medium) - Array repetition variant
8. **LeetCode 2393** - Count Strictly Increasing Subarrays (Medium) - Kadane's for sequences
9. **LeetCode 1749** - Maximum Absolute Sum of Any Subarray (Medium) - Track both max and min
10. **LeetCode 2272** - Substring with Largest Variance (Hard) - Frequency-based Kadane's

---

#### 1.6 Sorting-Based Problems
**Concept:** Use sorting to transform problem into easier subproblems  
**When to use:** Finding pairs, ordering-dependent solutions, decision problems  
**Time/Space:** O(n log n) sort | O(1-n) space depending on sort  
**Difficulty:** Easy → Medium

**10 Problems:**
1. **LeetCode 15** - 3Sum (Medium) - Sort + two pointers
2. **LeetCode 18** - 4Sum (Medium) - Nested sort + two pointers
3. **LeetCode 179** - Largest Number (Medium) - Custom comparator
4. **LeetCode 435** - Non-overlapping Intervals (Medium) - Sort by end point
5. **LeetCode 252** - Meeting Rooms (Easy) - Sort by start time
6. **LeetCode 253** - Meeting Rooms II (Medium) - Sort + min heap
7. **LeetCode 1833** - Maximum Ice Cream Bars (Medium) - Sort + prefix sum
8. **LeetCode 1851** - Minimum Interval to Include Each Query (Hard) - Sort queries + two pointers
9. **LeetCode 2191** - Sort the Jumbled Numbers (Easy) - Custom sort key
10. **LeetCode 2370** - Longest Ideal Subsequence (Medium) - Sort-aware DP

---

#### 1.7 Cyclic Sort
**Concept:** Arrange elements in their correct positions in O(n) time  
**When to use:** Array contains numbers 1-n, finding missing/duplicate  
**Time/Space:** O(n) time | O(1) space  
**Difficulty:** Medium

**10 Problems:**
1. **LeetCode 41** - First Missing Positive (Hard) - Core cyclic sort
2. **LeetCode 268** - Missing Number (Easy) - Simplified version
3. **LeetCode 287** - Find the Duplicate Number (Medium) - Detection variant
4. **LeetCode 442** - Find All Duplicates in Array (Medium) - Find all duplicates
5. **LeetCode 448** - Find All Numbers Disappeared in Array (Easy) - Find missing numbers
6. **LeetCode 1539** - Kth Missing Positive (Easy) - Modification with binary search
7. **LeetCode 645** - Set Mismatch (Easy) - Find swapped pair
8. **LeetCode 2126** - Destroying Asteroids (Medium) - Sorting variant
9. **LeetCode 3175** - Minimum Area Rectangle III (Hard) - Advanced positioning
10. **LeetCode 3289** - The Two Sneaky Numbers of Digitville (Easy) - Simple duplicate detection

---

#### 1.8 In-place Array Modification
**Concept:** Modify arrays without using extra space; reuse indices  
**When to use:** Space constraints, removing elements, rearranging in-place  
**Time/Space:** O(n) time | O(1) space  
**Difficulty:** Easy → Medium

**10 Problems:**
1. **LeetCode 26** - Remove Duplicates from Sorted Array (Easy) - Basic in-place
2. **LeetCode 27** - Remove Element (Easy) - Simple removal
3. **LeetCode 283** - Move Zeroes (Easy) - Rearrange elements
4. **LeetCode 80** - Remove Duplicates from Sorted Array II (Medium) - Allow duplicates ≤ 2
5. **LeetCode 189** - Rotate Array (Medium) - Rotation in-place
6. **LeetCode 1299** - Replace Elements with Greatest Element on Right Side (Easy) - Right pass
7. **LeetCode 1684** - Count the Number of Consistent Strings (Easy) - Frequency check
8. **LeetCode 2295** - Replace Elements in an Array (Medium) - Mapping replacement
9. **LeetCode 2089** - Find Target Indices After Sorting Array (Easy) - Sorted target finding
10. **LeetCode 3289** - The Two Sneaky Numbers of Digitville (Easy) - Index-based marking

---

#### 1.9 Matrix Traversal
**Concept:** Navigate 2D arrays in specific patterns (spiral, diagonal, zigzag)  
**When to use:** 2D grid problems, matrix path problems, systematic traversal  
**Time/Space:** O(m×n) time | O(1-m×n) space depending on storage  
**Difficulty:** Medium → Hard

**10 Problems:**
1. **LeetCode 54** - Spiral Matrix (Medium) - Classic spiral traversal
2. **LeetCode 59** - Spiral Matrix II (Medium) - Spiral generation
3. **LeetCode 48** - Rotate Image (Medium) - In-place rotation
4. **LeetCode 1572** - Matrix Diagonal Sum (Easy) - Diagonal traversal
5. **LeetCode 498** - Diagonal Traverse (Medium) - Zigzag diagonal
6. **LeetCode 2950** - Number of Divisible Subsets (Medium) - Modulo-based traversal
7. **LeetCode 1314** - Matrix Block Sum (Medium) - Block matrix calculation
8. **LeetCode 1260** - Shift 2D Grid (Easy) - Circular shift
9. **LeetCode 1329** - Sort the Matrix Diagonally (Medium) - Diagonal sorting
10. **LeetCode 3306** - Count of Submatrices (Hard) - Complex matrix counting

---

### Category 2: Two-Pointer Patterns

#### 2.1 Opposite-Direction Pointers
**Concept:** Start from both ends, move towards center based on condition  
**When to use:** Sorted arrays, palindrome checking, symmetric problems  
**Time/Space:** O(n) time | O(1) space  
**Difficulty:** Easy

**10 Problems:**
1. **LeetCode 125** - Valid Palindrome (Easy) - Check palindrome with pointers
2. **LeetCode 167** - Two Sum II - Input Array is Sorted (Easy) - Basic opposite pointers
3. **LeetCode 344** - Reverse String (Easy) - Simple reversal
4. **LeetCode 345** - Reverse Vowels of String (Easy) - Selective reversal
5. **LeetCode 11** - Container with Most Water (Medium) - Area optimization
6. **LeetCode 1099** - Two Sum Less Than K (Easy) - Bounded sum
7. **LeetCode 1650** - Lowest Common Ancestor of Binary Tree III (Medium) - Graph variant
8. **LeetCode 2734** - Lexicographically Smallest String (Medium) - String rotation variant
9. **LeetCode 925** - Long Pressed Name (Easy) - Matching with duplicates
10. **LeetCode 2824** - Count Pairs Whose Product is Divisible by K (Medium) - Pair counting

---

#### 2.2 Same-Direction Pointers
**Concept:** Both pointers move in same direction; one is "slow", one is "fast"  
**When to use:** Array partitioning, removing elements, in-place modifications  
**Time/Space:** O(n) time | O(1) space  
**Difficulty:** Easy → Medium

**10 Problems:**
1. **LeetCode 26** - Remove Duplicates from Sorted Array (Easy) - Basic same-direction
2. **LeetCode 80** - Remove Duplicates II (Medium) - Allow duplicates ≤ 2
3. **LeetCode 27** - Remove Element (Easy) - Remove target value
4. **LeetCode 283** - Move Zeroes (Easy) - Segregate zeros
5. **LeetCode 905** - Sort Array by Parity (Easy) - Partition odd/even
6. **LeetCode 922** - Sort Array by Parity II (Easy) - Interleave odd/even
7. **LeetCode 2160** - Minimum Sum of Four Digit Number (Easy) - Digit rearrangement
8. **LeetCode 1572** - Matrix Diagonal Sum (Medium) - Diagonal counting
9. **LeetCode 1768** - Merge Strings Alternately (Easy) - Interleave two strings
10. **LeetCode 2540** - Minimum Common Value (Easy) - Find common in sorted arrays

---

#### 2.3 Slow and Fast Pointers
**Concept:** Fast pointer moves k positions ahead; used for cycle detection  
**When to use:** Cycle detection, finding middle, kth last element  
**Time/Space:** O(n) time | O(1) space  
**Difficulty:** Easy → Medium

**10 Problems:**
1. **LeetCode 141** - Linked List Cycle (Easy) - Basic cycle detection
2. **LeetCode 142** - Linked List Cycle II (Medium) - Find cycle start
3. **LeetCode 202** - Happy Number (Easy) - Cycle detection in values
4. **LeetCode 876** - Middle of Linked List (Easy) - Find middle node
5. **LeetCode 1721** - Swapping Nodes in Linked List (Medium) - Distance-based swap
6. **LeetCode 457** - Circular Array Loop (Medium) - Cycle in array
7. **LeetCode 2570** - Merge Two 2D Arrays by Summing Common IDs (Easy) - Array comparison
8. **LeetCode 2816** - Double a Number Represented as a Linked List (Medium) - Linked list math
9. **LeetCode 234** - Palindrome Linked List (Easy) - Middle + reversal
10. **LeetCode 2095** - Delete the Middle Node (Medium) - Remove middle efficiently

---

#### 2.4 Remove Duplicates
**Concept:** Remove/skip duplicate elements while maintaining order  
**When to use:** Cleaning data, deduplication, frequency-based removal  
**Time/Space:** O(n) time | O(1) space  
**Difficulty:** Easy

**10 Problems:**
1. **LeetCode 26** - Remove Duplicates from Sorted Array (Easy) - Keep first occurrence
2. **LeetCode 80** - Remove Duplicates from Sorted Array II (Medium) - Keep up to 2
3. **LeetCode 1836** - Remove Duplicates from an Array (Easy) - Frequency-based
4. **LeetCode 316** - Remove Duplicate Letters (Hard) - Lexicographically smallest
5. **LeetCode 1209** - Remove All Adjacent Duplicates In String II (Medium) - String duplicates
6. **LeetCode 1544** - Make The String Great (Easy) - Adjacent character removal
7. **LeetCode 1348** - Tweet Counts Per Frequency (Medium) - Time-based deduplication
8. **LeetCode 2325** - Decode the Message (Easy) - Unique character mapping
9. **LeetCode 2610** - Convert an Array Into a 2D Array (Easy) - Frequency-based generation
10. **LeetCode 2306** - Naming a Company (Hard) - Deduplication with prefix/suffix

---

#### 2.5 Pair Sum
**Concept:** Find pairs of elements satisfying sum/difference conditions  
**When to use:** Two sum variants, finding pairs with specific properties  
**Time/Space:** O(n) time | O(1-n) space  
**Difficulty:** Easy → Medium

**10 Problems:**
1. **LeetCode 1** - Two Sum (Easy) - Find pair with target sum
2. **LeetCode 167** - Two Sum II (Easy) - Sorted array variant
3. **LeetCode 170** - Two Sum III (Easy) - Dynamic add and find
4. **LeetCode 633** - Sum of Square Numbers (Medium) - Sum of squares
5. **LeetCode 1099** - Two Sum Less Than K (Easy) - Bounded sum
6. **LeetCode 1711** - Count Good Meals (Medium) - Power of 2 sum
7. **LeetCode 2540** - Minimum Common Value (Easy) - Common in sorted arrays
8. **LeetCode 1781** - Sum of Beauty of All Substrings (Hard) - Substring pair properties
9. **LeetCode 2570** - Merge Two 2D Arrays (Easy) - Array pair merging
10. **LeetCode 2824** - Count Pairs Whose Product is Divisible by K (Medium) - Divisibility pairs

---

#### 2.6 Three Sum / Four Sum
**Concept:** Find n-tuples summing to target; avoid duplicates  
**When to use:** Multi-element sum, generalized pair finding  
**Time/Space:** O(n²) time | O(1-n) space  
**Difficulty:** Medium → Hard

**10 Problems:**
1. **LeetCode 15** - 3Sum (Medium) - Find unique triplets
2. **LeetCode 16** - 3Sum Closest (Medium) - Find closest to target
3. **LeetCode 18** - 4Sum (Medium) - Find unique quadruplets
4. **LeetCode 259** - 3Sum Smaller (Medium) - Count triplets < target
5. **LeetCode 923** - 3Sum With Multiplicity (Medium) - Count with multiplicity
6. **LeetCode 1099** - Two Sum Less Than K (Easy) - 2Sum variant
7. **LeetCode 1537** - Get the Maximum Score (Medium) - Constrained sum
8. **LeetCode 2824** - Count Pairs Whose Product is Divisible by K (Medium) - Divisibility variant
9. **LeetCode 1713** - Find K Closest Elements (Medium) - Multi-element distance
10. **LeetCode 2570** - Merge Two 2D Arrays by Summing Common IDs (Easy) - Sum mapping

---

#### 2.7 Palindrome Problems
**Concept:** Check/build palindromes using character symmetry  
**When to use:** String/array symmetry, validation, reconstruction  
**Time/Space:** O(n) time | O(1-n) space  
**Difficulty:** Easy → Medium

**10 Problems:**
1. **LeetCode 125** - Valid Palindrome (Easy) - Check with cleanup
2. **LeetCode 680** - Valid Palindrome II (Easy) - Allow one deletion
3. **LeetCode 1216** - Valid Palindrome III (Hard) - K deletions allowed
4. **LeetCode 234** - Palindrome Linked List (Medium) - List palindrome check
5. **LeetCode 2108** - Find First Palindromic String in Array (Easy) - Array search
6. **LeetCode 1332** - Remove Palindromic Subsequences (Medium) - Palindrome removal
7. **LeetCode 1278** - Palindrome Partitioning III (Hard) - DP + palindrome
8. **LeetCode 2109** - Adding Spaces to a String (Medium) - String reconstruction
9. **LeetCode 2697** - Lexicographically Smallest Palindrome (Easy) - Build palindrome
10. **LeetCode 3162** - Find the Number of Good Pairs I (Medium) - Pair validation

---

#### 2.8 Partitioning
**Concept:** Rearrange array into partitions satisfying conditions  
**When to use:** Array partitioning, sorting variants, segregation  
**Time/Space:** O(n) time | O(1) space  
**Difficulty:** Easy → Medium

**10 Problems:**
1. **LeetCode 75** - Sort Colors (Medium) - Three-way partition
2. **LeetCode 905** - Sort Array by Parity (Easy) - Even/odd partition
3. **LeetCode 922** - Sort Array by Parity II (Easy) - Interleaved partition
4. **LeetCode 2161** - Partition Array According to Given Pivot (Easy) - Pivot partition
5. **LeetCode 2966** - Divide Array Into Arrays With Max Difference (Medium) - Partition into triplets
6. **LeetCode 1275** - Find Winner on Tic Tac Toe Game (Easy) - Game state partition
7. **LeetCode 1413** - Minimum Value to Get Positive Step by Step Sum (Easy) - Prefix partition
8. **LeetCode 2609** - Find the Longest Balanced Substring of a Binary String (Medium) - Balanced partition
9. **LeetCode 3289** - The Two Sneaky Numbers of Digitville (Easy) - Partition detection
10. **LeetCode 2540** - Minimum Common Value (Easy) - Sorted partition intersection

---

### Category 3: Sliding Window Patterns

#### 3.1 Fixed-Size Window
**Concept:** Maintain window of constant size; slide across array  
**When to use:** Moving average, consecutive k elements, rolling computations  
**Time/Space:** O(n) time | O(k) space  
**Difficulty:** Easy

**10 Problems:**
1. **LeetCode 643** - Maximum Average Subarray I (Easy) - Basic window average
2. **LeetCode 1343** - Number of Sub-arrays of Size K (Easy) - Count with threshold
3. **LeetCode 1456** - Maximum Number of Vowels in a Substring (Easy) - Frequency in window
4. **LeetCode 2090** - K Radius Subarray Averages (Easy) - Centered window
5. **LeetCode 3000** - Maximum Area of Ish Rectangle (Easy) - Area calculation
6. **LeetCode 219** - Contains Duplicate II (Easy) - Window distance check
7. **LeetCode 220** - Contains Duplicate III (Hard) - Window with value range
8. **LeetCode 2379** - Minimum Recolors to Get K Consecutive (Easy) - Window threshold
9. **LeetCode 2379** - Minimum Recolors to Get K Consecutive Black Blocks (Easy) - Binary window
10. **LeetCode 1695** - Maximum Erasure Value (Medium) - Maximum sum distinct window

---

#### 3.2 Variable-Size Window
**Concept:** Expand/contract window based on condition  
**When to use:** Finding longest/shortest subarray/substring matching condition  
**Time/Space:** O(n) time | O(k) space  
**Difficulty:** Medium

**10 Problems:**
1. **LeetCode 3** - Longest Substring Without Repeating (Medium) - Core variable window
2. **LeetCode 209** - Minimum Size Subarray Sum (Medium) - Shortest with sum
3. **LeetCode 76** - Minimum Window Substring (Hard) - Minimum with all chars
4. **LeetCode 1004** - Max Consecutive Ones III (Medium) - Flip k zeros
5. **LeetCode 424** - Longest Repeating Character Replacement (Medium) - Replace k chars
6. **LeetCode 1438** - Longest Continuous Subarray With Absolute Diff (Medium) - Range constraint
7. **LeetCode 2106** - Maximum Fruits Harvested (Hard) - Two-direction variable window
8. **LeetCode 2958** - Maximum Length of Subarray With Positive (Medium) - Product sign window
9. **LeetCode 2799** - Count Complete Subarrays (Medium) - Distinct element window
10. **LeetCode 2763** - Sum of Imbalance Numbers (Hard) - Advanced window counting

---

#### 3.3 Longest Valid Window
**Concept:** Find longest subarray/substring satisfying all constraints  
**When to use:** Validity checking, balance finding, correctness maximization  
**Time/Space:** O(n) time | O(k) space  
**Difficulty:** Medium → Hard

**10 Problems:**
1. **LeetCode 1695** - Maximum Erasure Value (Medium) - Longest distinct sum
2. **LeetCode 2024** - Maximize the Confusion of an Exam (Medium) - Longest after flips
3. **LeetCode 1926** - Nearest Exit in Maze (Medium) - Path length variant
4. **LeetCode 2501** - Longest Square Streak (Medium) - Transformation validity
5. **LeetCode 2461** - Maximum Sum of Distinct Subarrays (Medium) - Longest distinct with max
6. **LeetCode 2962** - Count Subarrays Where Max Element ≥ K (Easy) - Window validity
7. **LeetCode 2799** - Count Complete Subarrays (Medium) - Complete window finding
8. **LeetCode 2109** - Adding Spaces to a String (Medium) - String modification window
9. **LeetCode 2831** - Find the Longest Equal Subarray (Medium) - Value equality window
10. **LeetCode 3289** - The Two Sneaky Numbers of Digitville (Easy) - Simple window detection

---

#### 3.4 Smallest Valid Window
**Concept:** Find shortest subarray/substring satisfying all constraints  
**When to use:** Minimum length finding, efficiency optimization  
**Time/Space:** O(n) time | O(k) space  
**Difficulty:** Medium → Hard

**10 Problems:**
1. **LeetCode 76** - Minimum Window Substring (Hard) - Core smallest valid
2. **LeetCode 209** - Minimum Size Subarray Sum (Medium) - Shortest with sum
3. **LeetCode 30** - Substring with Concatenation (Hard) - Word concatenation window
4. **LeetCode 2661** - First Completely Painted Row or Column (Medium) - Grid window completion
5. **LeetCode 3260** - Find the Geomatric Progression Ratio (Hard) - Ratio validation
6. **LeetCode 2763** - Sum of Imbalance Numbers (Hard) - Imbalance measurement
7. **LeetCode 1839** - Longest Substring Of All Vowels (Hard) - Vowel completeness
8. **LeetCode 2711** - Difference of Sum of Elements in Two Arrays (Easy) - Difference minimization
9. **LeetCode 2875** - Minimum Length After Removing Subsequences (Medium) - Subsequence removal
10. **LeetCode 2824** - Count Pairs Whose Product is Divisible by K (Medium) - Pair window optimization

---

#### 3.5 At Most K Elements
**Concept:** Maintain window with at most k distinct/particular elements  
**When to use:** Constraint-based windows, frequency capping  
**Time/Space:** O(n) time | O(k) space  
**Difficulty:** Medium

**10 Problems:**
1. **LeetCode 340** - Longest Substring with At Most K Distinct (Medium) - Core at-most-k
2. **LeetCode 1004** - Max Consecutive Ones III (Medium) - At most k zeros flipped
3. **LeetCode 2958** - Maximum Length of Subarray With Positive (Medium) - At most k negatives
4. **LeetCode 2024** - Maximize the Confusion of an Exam (Medium) - At most k flips
5. **LeetCode 424** - Longest Repeating Character Replacement (Medium) - At most k replacements
6. **LeetCode 1456** - Maximum Number of Vowels in a Substring (Easy) - K size window
7. **LeetCode 2799** - Count Complete Subarrays (Medium) - All k distinct elements
8. **LeetCode 1695** - Maximum Erasure Value (Medium) - At most n distinct
9. **LeetCode 2831** - Find the Longest Equal Subarray (Medium) - At most k deletions
10. **LeetCode 3289** - The Two Sneaky Numbers of Digitville (Easy) - Constraint detection

---

#### 3.6 Exactly K Elements
**Concept:** Count/find windows with exactly k distinct/special elements  
**When to use:** Exact frequency requirements, precise constraint matching  
**Time/Space:** O(n) time | O(k) space  
**Difficulty:** Medium → Hard

**10 Problems:**
1. **LeetCode 992** - Subarrays with K Different Integers (Hard) - Core exactly-k
2. **LeetCode 1248** - Count Number of Nice Subarrays (Medium) - Exactly k odd numbers
3. **LeetCode 2763** - Sum of Imbalance Numbers (Hard) - Exactly k distinct
4. **LeetCode 2798** - Number of Employees Who Met Target (Easy) - Simple counting variant
5. **LeetCode 2958** - Maximum Length of Subarray With Positive (Medium) - Exactly k transitions
6. **LeetCode 2799** - Count Complete Subarrays (Medium) - Exactly n distinct elements
7. **LeetCode 2461** - Maximum Sum of Distinct Subarrays (Medium) - Sum with k distinct
8. **LeetCode 2831** - Find the Longest Equal Subarray (Medium) - Exactly k frequency
9. **LeetCode 1655** - Distribute Repeating Elements (Easy) - Exact distribution
10. **LeetCode 3289** - The Two Sneaky Numbers of Digitville (Easy) - Exact detection pattern

---

#### 3.7 Character-Frequency Window
**Concept:** Track character frequencies in sliding window  
**When to use:** Anagram finding, character requirement matching  
**Time/Space:** O(n) time | O(26) space for lowercase  
**Difficulty:** Medium

**10 Problems:**
1. **LeetCode 438** - Find All Anagrams in String (Medium) - Anagram pattern finding
2. **LeetCode 567** - Permutation in String (Medium) - Substring anagram
3. **LeetCode 1456** - Maximum Number of Vowels in a Substring (Easy) - Vowel frequency
4. **LeetCode 2299** - Strong Password Checker II (Easy) - Character requirement check
5. **LeetCode 1839** - Longest Substring Of All Vowels (Hard) - All vowel requirement
6. **LeetCode 1868** - Product of Two Run-Length Encoded Arrays (Medium) - Encoding variant
7. **LeetCode 2609** - Find the Longest Balanced Substring (Medium) - Balanced frequency
8. **LeetCode 2763** - Sum of Imbalance Numbers (Hard) - Frequency imbalance
9. **LeetCode 2824** - Count Pairs Whose Product is Divisible by K (Medium) - Frequency-based pairing
10. **LeetCode 2831** - Find the Longest Equal Subarray (Medium) - Frequency equalization

---

#### 3.8 Maximum/Minimum Window
**Concept:** Find window optimizing sum, product, or other aggregate  
**When to use:** Optimization problems within window constraints  
**Time/Space:** O(n) time | O(k) space  
**Difficulty:** Medium → Hard

**10 Problems:**
1. **LeetCode 1695** - Maximum Erasure Value (Medium) - Maximum distinct sum
2. **LeetCode 2461** - Maximum Sum of Distinct Subarrays (Medium) - Max sum of k distinct
3. **LeetCode 1343** - Number of Sub-arrays of Size K (Medium) - Aggregation threshold
4. **LeetCode 2090** - K Radius Subarray Averages (Easy) - Average optimization
5. **LeetCode 2024** - Maximize the Confusion of an Exam (Medium) - Flip optimization
6. **LeetCode 2958** - Maximum Length of Subarray With Positive (Medium) - Product optimization
7. **LeetCode 2831** - Find the Longest Equal Subarray (Medium) - Length optimization
8. **LeetCode 2106** - Maximum Fruits Harvested (Hard) - Bidirectional optimization
9. **LeetCode 2799** - Count Complete Subarrays (Medium) - Completion optimization
10. **LeetCode 3289** - The Two Sneaky Numbers of Digitville (Easy) - Property optimization

---

### Category 4: Binary Search Patterns

#### 4.1 Standard Binary Search
**Concept:** Search for exact target in sorted array  
**When to use:** Sorted arrays, O(log n) requirement, target finding  
**Time/Space:** O(log n) time | O(1) space  
**Difficulty:** Easy

**10 Problems:**
1. **LeetCode 704** - Binary Search (Easy) - Basic exact search
2. **LeetCode 278** - First Bad Version (Easy) - Version boundary
3. **LeetCode 374** - Guess Number Higher or Lower (Easy) - Game variant
4. **LeetCode 69** - Sqrt(x) (Easy) - Integer square root
5. **LeetCode 367** - Valid Perfect Square (Easy) - Perfect square check
6. **LeetCode 1237** - Find in N-ary Tree (Easy) - Tree variant
7. **LeetCode 2080** - Range Frequency Queries (Medium) - Range search with queries
8. **LeetCode 2594** - Minimum Time to Repair Cars (Medium) - Time optimization search
9. **LeetCode 2389** - Longest Subsequence With Limited Sum (Easy) - Prefix sum search
10. **LeetCode 2516** - Take K of Each Character From Left and Right (Medium) - Index search

---

#### 4.2 First and Last Occurrence
**Concept:** Find first and last position of target in sorted array  
**When to use:** Range finding, boundary detection  
**Time/Space:** O(log n) time | O(1) space  
**Difficulty:** Medium

**10 Problems:**
1. **LeetCode 34** - Find First and Last Position (Medium) - Core pattern
2. **LeetCode 278** - First Bad Version (Easy) - First occurrence variant
3. **LeetCode 1539** - Kth Missing Positive (Easy) - Kth position variant
4. **LeetCode 2080** - Range Frequency Queries (Medium) - Count in range
5. **LeetCode 2531** - Make Number of Distinct Characters Equal (Hard) - Character range
6. **LeetCode 2594** - Minimum Time to Repair Cars (Medium) - Optimization boundary
7. **LeetCode 2557** - Maximum Count of Positive/Negative (Easy) - Boundary counting
8. **LeetCode 2389** - Longest Subsequence With Limited Sum (Easy) - Cumulative boundary
9. **LeetCode 1902** - Depth of BST Given Insertion Order (Medium) - BST variant
10. **LeetCode 2516** - Take K of Each Character From Left and Right (Medium) - Index boundaries

---

#### 4.3 Lower Bound / Upper Bound
**Concept:** Find first element >= target (lower bound) or > target (upper bound)  
**When to use:** Range queries, insertion points, closest element finding  
**Time/Space:** O(log n) time | O(1) space  
**Difficulty:** Medium

**10 Problems:**
1. **LeetCode 35** - Search Insert Position (Easy) - Lower bound
2. **LeetCode 34** - Find First and Last Position (Medium) - Both bounds
3. **LeetCode 1157** - Online Majority Vote Query (Hard) - Vote counting with binary search
4. **LeetCode 436** - Find Right Interval (Medium) - Interval boundary
5. **LeetCode 2080** - Range Frequency Queries (Medium) - Range queries
6. **LeetCode 1792** - Maximum Average Pass Ratio (Hard) - Optimization with bounds
7. **LeetCode 2594** - Minimum Time to Repair Cars (Medium) - Time bounds
8. **LeetCode 2389** - Longest Subsequence With Limited Sum (Easy) - Sum bounds
9. **LeetCode 2516** - Take K of Each Character From Left and Right (Medium) - Character bounds
10. **LeetCode 704** - Binary Search (Easy) - Simple exact vs bounds concept

---

#### 4.4 Search in Rotated Array
**Concept:** Search in rotated sorted array; find rotation point  
**When to use:** Rotated arrays, modified sorted structure  
**Time/Space:** O(log n) time | O(1) space  
**Difficulty:** Medium

**10 Problems:**
1. **LeetCode 33** - Search in Rotated Sorted Array (Medium) - Core pattern
2. **LeetCode 81** - Search in Rotated Sorted Array II (Medium) - With duplicates
3. **LeetCode 153** - Find Minimum in Rotated Sorted Array (Medium) - Find pivot
4. **LeetCode 154** - Find Minimum in Rotated Array II (Hard) - With duplicates
5. **LeetCode 2818** - Maximum XOR of Two Elements (Easy) - Modified search variant
6. **LeetCode 2540** - Minimum Common Value (Easy) - Simple sorted search
7. **LeetCode 2540** - Minimum Common Value (Easy) - Array comparison
8. **LeetCode 2515** - Shortest Distance to Target String (Medium) - Rotated distance
9. **LeetCode 1351** - Count Negative Numbers in Matrix (Easy) - 2D rotation variant
10. **LeetCode 704** - Binary Search (Easy) - Baseline for rotation concept

---

#### 4.5 Peak Element
**Concept:** Find local maximum; elements increase to peak then decrease  
**When to use:** Bitonic arrays, local optima finding  
**Time/Space:** O(log n) time | O(1) space  
**Difficulty:** Medium

**10 Problems:**
1. **LeetCode 162** - Find Peak Element (Medium) - Core pattern
2. **LeetCode 852** - Peak Index in Mountain Array (Easy) - Simple mountain
3. **LeetCode 1884** - Egg Drop With 2 Eggs and N Floors (Medium) - Drop problem variant
4. **LeetCode 1231** - Divide Chocolate (Hard) - Fairness optimization with peak
5. **LeetCode 1891** - Cutting Ribbons (Hard) - Cutting with peak optimization
6. **LeetCode 2594** - Minimum Time to Repair Cars (Medium) - Monotonic variant
7. **LeetCode 2389** - Longest Subsequence With Limited Sum (Easy) - Sum monotonicity
8. **LeetCode 278** - First Bad Version (Easy) - Monotonic transition point
9. **LeetCode 2540** - Minimum Common Value (Easy) - Sorted transition point
10. **LeetCode 704** - Binary Search (Easy) - Foundation for peak concept

---

#### 4.6 Binary Search on Answer
**Concept:** Use binary search to find optimal value; check feasibility with function  
**When to use:** Optimization problems, finding minimum/maximum feasible value  
**Time/Space:** O(log n × f(n)) where f is feasibility check  
**Difficulty:** Hard

**10 Problems:**
1. **LeetCode 1060** - Missing Element in Sorted Array (Medium) - Missing count
2. **LeetCode 1891** - Cutting Ribbons (Hard) - Length optimization
3. **LeetCode 1231** - Divide Chocolate (Hard) - Minimum piece optimization
4. **LeetCode 1793** - Maximum Score of Good Subarray (Hard) - Score maximization
5. **LeetCode 2064** - Minimized Maximum of Products (Hard) - Distribution optimization
6. **LeetCode 2594** - Minimum Time to Repair Cars (Medium) - Time minimization
7. **LeetCode 2783** - Flight Connections (Hard) - Path optimization
8. **LeetCode 1842** - Next Permutation (Medium) - Lexicographic optimization
9. **LeetCode 2389** - Longest Subsequence With Limited Sum (Easy) - Budget constraint
10. **LeetCode 2516** - Take K of Each Character From Left and Right (Medium) - Character count optimization

---

#### 4.7 Minimum/Maximum Feasible Value
**Concept:** Find minimum or maximum value satisfying constraint  
**When to use:** Feasibility-based optimization, threshold finding  
**Time/Space:** O(log n × f(n)) time | O(1) space  
**Difficulty:** Hard

**10 Problems:**
1. **LeetCode 1891** - Cutting Ribbons (Hard) - Maximum length feasible
2. **LeetCode 1231** - Divide Chocolate (Hard) - Minimum piece feasible
3. **LeetCode 2594** - Minimum Time to Repair Cars (Medium) - Minimum time feasible
4. **LeetCode 1060** - Missing Element in Sorted Array (Medium) - Missing element count
5. **LeetCode 2064** - Minimized Maximum of Products (Hard) - Balance optimization
6. **LeetCode 1793** - Maximum Score of Good Subarray (Hard) - Score maximization
7. **LeetCode 2389** - Longest Subsequence With Limited Sum (Easy) - Maximum sum feasible
8. **LeetCode 2516** - Take K of Each Character From Left and Right (Medium) - Character extraction
9. **LeetCode 1842** - Next Permutation (Medium) - Next feasible permutation
10. **LeetCode 2783** - Flight Connections (Hard) - Route feasibility

---

#### 4.8 Search in 2D Matrix
**Concept:** Search in sorted 2D matrix; treat as sorted 1D array  
**When to use:** 2D sorted arrays, matrix queries  
**Time/Space:** O(log(m×n)) time | O(1) space  
**Difficulty:** Medium

**10 Problems:**
1. **LeetCode 74** - Search a 2D Matrix (Medium) - Row-column binary search
2. **LeetCode 240** - Search a 2D Matrix II (Medium) - Staircase search
3. **LeetCode 1351** - Count Negative Numbers in Matrix (Easy) - Negative count in sorted
4. **LeetCode 1337** - The K Weakest Rows (Easy) - Row strength comparison
5. **LeetCode 1572** - Matrix Diagonal Sum (Easy) - Diagonal element access
6. **LeetCode 1260** - Shift 2D Grid (Easy) - Circular shift with indexing
7. **LeetCode 1314** - Matrix Block Sum (Medium) - Block aggregation
8. **LeetCode 2661** - First Completely Painted Row or Column (Medium) - Painting sequence
9. **LeetCode 2850** - Minimum Moves to Spread Stones (Hard) - Movement optimization
10. **LeetCode 2610** - Convert an Array Into a 2D Array (Easy) - Matrix generation

---

---

## PHASE 2: DATA STRUCTURES (Weeks 3-4)

### Category 5: Stack Patterns

#### 5.1 Basic Stack
**Concept:** LIFO (Last In First Out) data structure  
**When to use:** Function calls, undo/redo, expression evaluation  
**Time/Space:** O(1) push/pop | O(n) space  
**Difficulty:** Easy

**10 Problems:**
1. **LeetCode 20** - Valid Parentheses (Easy)
2. **LeetCode 71** - Simplify Path (Medium)
3. **LeetCode 1249** - Minimum Remove to Make Valid Parentheses (Medium)
4. **LeetCode 2390** - Removing Stars From a String (Medium)
5. **LeetCode 1544** - Make The String Great (Easy)
6. **LeetCode 2696** - Minimum String Length (Easy)
7. **LeetCode 1541** - Minimum Insertions to Balance Parentheses (Medium)
8. **LeetCode 1963** - Minimum Number of Swaps to Make String Balanced (Medium)
9. **LeetCode 921** - Minimum Add to Make Parentheses Valid (Medium)
10. **LeetCode 1106** - Parsing A Boolean Expression (Hard)

#### 5.2 Parentheses Matching
**Concept:** Validate, match, and manipulate balanced parentheses  
**When to use:** Expression validation, bracket pairing, nested structures  
**Time/Space:** O(n) time | O(n) space  
**Difficulty:** Easy → Medium

**10 Problems:**
1. **LeetCode 20** - Valid Parentheses (Easy) - Core matching
2. **LeetCode 921** - Minimum Add to Make Parentheses Valid (Medium) - Count additions needed
3. **LeetCode 1249** - Minimum Remove to Make Valid Parentheses (Medium) - Character removal
4. **LeetCode 1541** - Minimum Insertions to Balance Parentheses (Medium) - Special format
5. **LeetCode 1963** - Minimum Number of Swaps to Make String Balanced (Medium) - Swap minimization
6. **LeetCode 2116** - Check if String is Valid Sequence (Medium) - Subsequence validation
7. **LeetCode 3174** - Clear Digits (Easy) - Digit removal with stack
8. **LeetCode 1190** - Reverse Substrings Between Each Pair (Hard) - Between pairs reversal
9. **LeetCode 1614** - Maximum Nesting Depth of Parentheses (Easy) - Depth tracking
10. **LeetCode 2864** - Maximum Odd Binary Number (Easy) - Bit manipulation variant

---

#### 5.3 Expression Evaluation
**Concept:** Parse and evaluate infix, postfix, or prefix expressions  
**When to use:** Calculator implementation, expression parsing, operator precedence  
**Time/Space:** O(n) time | O(n) space  
**Difficulty:** Medium → Hard

**10 Problems:**
1. **LeetCode 224** - Basic Calculator (Hard) - Infix with +/- and ()
2. **LeetCode 227** - Basic Calculator II (Medium) - With */÷ operators
3. **LeetCode 282** - Expression Add Operators (Hard) - Generate expressions with target
4. **LeetCode 772** - Basic Calculator III (Hard) - Full expression evaluation
5. **LeetCode 1897** - Redistribute Characters to Make All Strings Equal (Easy) - Frequency validation
6. **LeetCode 1844** - Replace All Digits with Characters (Easy) - Character replacement
7. **LeetCode 2000** - Reverse Prefix of Word (Easy) - Prefix reversal
8. **LeetCode 2390** - Removing Stars From a String (Easy) - Star removal pattern
9. **LeetCode 2696** - Minimum String Length After Removing Substrings (Medium) - Substring elimination
10. **LeetCode 2301** - Match Substring After Replacement (Medium) - Pattern matching

---

#### 5.4 Monotonic Increasing Stack
**Concept:** Maintain increasing order; use to find patterns efficiently  
**When to use:** Largest rectangle, next greater element, stock span  
**Time/Space:** O(n) time | O(n) space  
**Difficulty:** Medium

**10 Problems:**
1. **LeetCode 84** - Largest Rectangle in Histogram (Hard) - Core pattern
2. **LeetCode 739** - Daily Temperatures (Medium) - Find next greater
3. **LeetCode 496** - Next Greater Element I (Easy) - Basic next greater
4. **LeetCode 456** - 132 Pattern (Medium) - Find specific pattern
5. **LeetCode 901** - Online Stock Span (Medium) - Stock span calculation
6. **LeetCode 907** - Sum of Subarray Minimums (Medium) - Subarray contribution
7. **LeetCode 1019** - Next Greater Node In Linked List (Medium) - Linked list variant
8. **LeetCode 2104** - Sum of Subarray Ranges (Medium) - Range calculation
9. **LeetCode 1475** - Final Prices With a Special Discount (Easy) - Discount application
10. **LeetCode 2281** - Sum of Total Strength of Wizards (Hard) - Complex contribution

---

#### 5.5 Monotonic Decreasing Stack
**Concept:** Maintain decreasing order; apply to water trapping, removal  
**When to use:** Trapping rain water, lexicographic ordering, building heights  
**Time/Space:** O(n) time | O(n) space  
**Difficulty:** Medium → Hard

**10 Problems:**
1. **LeetCode 42** - Trapping Rain Water (Hard) - Core pattern
2. **LeetCode 316** - Remove Duplicate Letters (Hard) - Lexicographically smallest
3. **LeetCode 402** - Remove K Digits (Medium) - K removals for smallest number
4. **LeetCode 440** - K-th Smallest in Lexicographical Order (Hard) - Lexicographic ordering
5. **LeetCode 1475** - Final Prices With Special Discount (Easy) - Discount stack
6. **LeetCode 154** - Find Minimum in Rotated Sorted Array II (Hard) - Rotation variant
7. **LeetCode 1673** - Find the Most Competitive Subsequence (Medium) - Subsequence selection
8. **LeetCode 2332** - The Latest Time to Catch a Bus (Medium) - Time optimization
9. **LeetCode 11** - Container With Most Water (Medium) - Two pointer overlap
10. **LeetCode 2030** - Small Est Range Including Elements from K Lists (Hard) - Range minimization

---

#### 5.6 Next Greater Element
**Concept:** For each element, find next element > it  
**When to use:** Stock span, next greater problems, pattern finding  
**Time/Space:** O(n) time | O(n) space  
**Difficulty:** Easy → Medium

**10 Problems:**
1. **LeetCode 496** - Next Greater Element I (Easy) - Basic pattern
2. **LeetCode 503** - Next Greater Element II (Medium) - Circular array
3. **LeetCode 556** - Next Greater Element III (Medium) - Integer permutation
4. **LeetCode 739** - Daily Temperatures (Medium) - Temperature lookback
5. **LeetCode 901** - Online Stock Span (Medium) - Stock span
6. **LeetCode 1019** - Next Greater Node In Linked List (Medium) - Linked list variant
7. **LeetCode 2104** - Sum of Subarray Ranges (Medium) - Ranges with next greater
8. **LeetCode 1475** - Final Prices With Special Discount (Easy) - Discount finding
9. **LeetCode 2281** - Sum of Total Strength (Hard) - Complex next greater
10. **LeetCode 907** - Sum of Subarray Minimums (Medium) - With monotonic stack

---

#### 5.7 Next Smaller Element
**Concept:** For each element, find next element < it  
**When to use:** Building heights, constraints, pattern matching  
**Time/Space:** O(n) time | O(n) space  
**Difficulty:** Medium

**10 Problems:**
1. **LeetCode 1762** - Buildings With an Ocean View (Medium) - View conditions
2. **LeetCode 2281** - Sum of Total Strength of Wizards (Hard) - Complex smaller element
3. **LeetCode 42** - Trapping Rain Water (Hard) - Water height constraints
4. **LeetCode 84** - Largest Rectangle in Histogram (Hard) - Rectangle bounds
5. **LeetCode 907** - Sum of Subarray Minimums (Medium) - Minimum contribution
6. **LeetCode 456** - 132 Pattern (Medium) - Pattern with constraints
7. **LeetCode 2816** - Double a Number Represented as Linked List (Medium) - Doubling process
8. **LeetCode 739** - Daily Temperatures (Medium) - Temperature patterns
9. **LeetCode 2104** - Sum of Subarray Ranges (Medium) - Range minimums
10. **LeetCode 1019** - Next Greater Node In Linked List (Medium) - Linked list pattern

---

#### 5.8 Largest Rectangle in Histogram
**Concept:** Find largest rectangular area in histogram  
**When to use:** Rectangle optimization, building heights, maximal patterns  
**Time/Space:** O(n) time | O(n) space  
**Difficulty:** Hard

**10 Problems:**
1. **LeetCode 84** - Largest Rectangle in Histogram (Hard) - Core pattern
2. **LeetCode 85** - Maximal Rectangle (Hard) - 2D extension with DP
3. **LeetCode 42** - Trapping Rain Water (Hard) - Water volume variant
4. **LeetCode 456** - 132 Pattern (Medium) - Pattern recognition
5. **LeetCode 2281** - Sum of Total Strength (Hard) - Contribution calculation
6. **LeetCode 1762** - Buildings With an Ocean View (Medium) - View optimization
7. **LeetCode 907** - Sum of Subarray Minimums (Medium) - Minimum contribution
8. **LeetCode 2104** - Sum of Subarray Ranges (Medium) - Range optimization
9. **LeetCode 1019** - Next Greater Node (Medium) - Stack application
10. **LeetCode 739** - Daily Temperatures (Medium) - Temperature patterns

---

#### 5.9 Stock Span
**Concept:** For each day, find span (consecutive days with price ≤ current)  
**When to use:** Stock span problem, consecutive element counting  
**Time/Space:** O(n) time | O(n) space  
**Difficulty:** Medium

**10 Problems:**
1. **LeetCode 901** - Online Stock Span (Medium) - Core stock span
2. **LeetCode 1944** - Number of Visible People in a Queue (Hard) - Visibility pattern
3. **LeetCode 496** - Next Greater Element I (Easy) - Pattern foundation
4. **LeetCode 739** - Daily Temperatures (Medium) - Temperature span variant
5. **LeetCode 907** - Sum of Subarray Minimums (Medium) - Minimum span
6. **LeetCode 2104** - Sum of Subarray Ranges (Medium) - Range span
7. **LeetCode 2281** - Sum of Total Strength (Hard) - Complex span calculation
8. **LeetCode 456** - 132 Pattern (Medium) - Span with constraints
9. **LeetCode 1019** - Next Greater Node In Linked List (Medium) - Linked list span
10. **LeetCode 84** - Largest Rectangle in Histogram (Hard) - Rectangle span

---

#### 5.10 Remove/Replace Elements
**Concept:** Use stack to remove or replace elements based on patterns  
**When to use:** Duplicate removal, character replacement, pattern elimination  
**Time/Space:** O(n) time | O(n) space  
**Difficulty:** Easy → Medium

**10 Problems:**
1. **LeetCode 316** - Remove Duplicate Letters (Hard) - Lexicographically smallest
2. **LeetCode 402** - Remove K Digits (Medium) - Remove for smallest number
3. **LeetCode 1249** - Minimum Remove to Make Valid Parentheses (Medium) - Parentheses removal
4. **LeetCode 1544** - Make The String Great (Easy) - Adjacent duplicate removal
5. **LeetCode 2390** - Removing Stars From a String (Medium) - Star removal with backtrack
6. **LeetCode 1209** - Remove All Adjacent Duplicates In String II (Medium) - K duplicate removal
7. **LeetCode 2696** - Minimum String Length After Removing Substrings (Medium) - Substring elimination
8. **LeetCode 1673** - Find the Most Competitive Subsequence (Medium) - Subsequence optimization
9. **LeetCode 2332** - The Latest Time to Catch a Bus (Medium) - Time optimization
10. **LeetCode 440** - K-th Smallest in Lexicographical Order (Hard) - Lexicographic ordering

---

### Category 6: Queue and Deque Patterns

#### 6.1-6.7 Queue/Deque Patterns
**6.1 Basic Queue** → O(1) operations, FIFO principle
**6.2 Circular Queue** → LeetCode 622, 641
**6.3 BFS Queue** → LeetCode 102, 297, 542, 863, 1091
**6.4 Monotonic Deque** → LeetCode 239, 1438, 2121, 2289
**6.5 Sliding Window Maximum** → LeetCode 239, 2281, 2516, 2846
**6.6 Task Scheduling** → LeetCode 621, 1834, 2353
**6.7 Producer-Consumer** → LeetCode 1117, 1188, 2279

---

### Category 7: Linked List Patterns

#### 7.1-7.12 Linked List Patterns
**7.1 Linked List Traversal** → LeetCode 206, 237, 1669
**7.2 Reverse Linked List** → LeetCode 206, 92, 1290, 2074, 2807
**7.3 Reverse in Groups** → LeetCode 25, 1721, 2807
**7.4 Fast and Slow Pointers** → LeetCode 876, 1721, 2095
**7.5 Cycle Detection** → LeetCode 141, 457, 2116
**7.6 Find Cycle Start** → LeetCode 142, 2116
**7.7 Find Middle Node** → LeetCode 876, 2095
**7.8 Merge Linked Lists** → LeetCode 21, 23, 148, 1305
**7.9 Linked List Intersection** → LeetCode 160, 1836
**7.10 Palindrome Linked List** → LeetCode 234
**7.11 Reorder Linked List** → LeetCode 143, 1609
**7.12 Clone Linked List** → LeetCode 138, 1490

---

## PHASE 3: RECURSION & COMPLEX STRUCTURES (Weeks 5-6)

### Category 8: Recursion Patterns

#### 8.1-8.7 Recursion Patterns
**8.1 Basic Recursion** → Simple base/recursive cases
**8.2 Divide and Conquer** → LeetCode 169, 215, 973
**8.3 Tree Recursion** → LeetCode 104, 226, 235, 257
**8.4 Recursion with Memoization** → LeetCode 70, 509, 1137
**8.5 Recursive Backtracking** → LeetCode 17, 46, 77, 78
**8.6 Tail Recursion** → Optimization technique
**8.7 Recursion Stack Analysis** → Space complexity, call depth

---

### Category 9: Backtracking Patterns

#### 9.1-9.11 Backtracking Patterns
**9.1 Subsets** → LeetCode 78, 90, 1863, 3194
**9.2 Subsets with Duplicates** → LeetCode 90
**9.3 Permutations** → LeetCode 46, 47, 1593, 2850
**9.4 Combinations** → LeetCode 77, 39, 40, 216, 1239
**9.5 Combination Sum** → LeetCode 39, 40, 216, 377, 1239
**9.6 N-Queens** → LeetCode 51, 52
**9.7 Sudoku Solver** → LeetCode 37
**9.8 Word Search** → LeetCode 79, 212, 425, 1268
**9.9 Maze Problems** → LeetCode 37, 490, 505, 1102
**9.10 Letter Combinations** → LeetCode 17, 1863
**9.11 Partitioning Problems** → LeetCode 131, 140, 1745

---

### Category 10: Tree Patterns

#### 10.1-10.13 Tree Patterns
**10.1 Binary Tree Traversal** → DFS fundamentals
**10.2 Preorder Traversal** → LeetCode 144, 1028
**10.3 Inorder Traversal** → LeetCode 94, 538, 1038, 2536
**10.4 Postorder Traversal** → LeetCode 145, 1028
**10.5 Level-Order Traversal** → LeetCode 102, 103, 199, 314, 515
**10.6 Tree Height and Depth** → LeetCode 104, 111, 1522
**10.7 Tree Diameter** → LeetCode 543, 2538
**10.8 Path Sum** → LeetCode 112, 113, 129, 437, 666, 1022, 2363
**10.9 Lowest Common Ancestor** → LeetCode 236, 1257, 1650, 2096
**10.10 Serialize and Deserialize** → LeetCode 297, 428, 449, 606
**10.11 Boundary Traversal** → LeetCode 545, 987
**10.12 Symmetric Tree** → LeetCode 101, 1028
**10.13 Views of Binary Tree** → LeetCode 199, 314, 2197, 2407

---

### Category 11: Binary Search Tree Patterns

#### 11.1-11.8 BST Patterns
**11.1 Search in BST** → LeetCode 700
**11.2 Insert into BST** → LeetCode 701
**11.3 Delete from BST** → LeetCode 450
**11.4 Validate BST** → LeetCode 98, 1305
**11.5 Kth Smallest Element** → LeetCode 230, 1305
**11.6 LCA in BST** → LeetCode 235
**11.7 Convert Sorted Array to BST** → LeetCode 108, 1382
**11.8 Inorder Successor/Predecessor** → LeetCode 270, 510

---

### Category 12: Heap / Priority Queue Patterns

#### 12.1-12.10 Heap Patterns
**12.1 Min Heap** → Basic operations, heapify
**12.2 Max Heap** → Basic operations, heapify
**12.3 Top K Elements** → LeetCode 215, 347, 692, 973, 1985
**12.4 Kth Largest/Smallest** → LeetCode 215, 230, 1030
**12.5 K-Way Merge** → LeetCode 23, 632, 1272
**12.6 Merge K Sorted Lists** → LeetCode 23
**12.7 Two-Heap Pattern** → LeetCode 295, 480, 2554
**12.8 Median from Data Stream** → LeetCode 295
**12.9 Scheduling with Heap** → LeetCode 621, 1834, 1882
**12.10 Heap in Graphs** → LeetCode 1631, 1928, 2050

---

## PHASE 4: GRAPHS & ALGORITHMS (Weeks 7-8)

### Category 13: Graph Patterns

#### 13.1-13.12 Graph Patterns
**13.1 Graph Representation** → Adjacency list, matrix
**13.2 Adjacency List** → Implementation, iteration
**13.3 Adjacency Matrix** → Dense graphs
**13.4 DFS** → LeetCode 133, 200, 261, 323, 444, 547, 721
**13.5 BFS** → LeetCode 102, 130, 200, 542, 752, 909
**13.6 Connected Components** → LeetCode 200, 261, 323, 547, 1202
**13.7 Cycle Detection** → LeetCode 207, 444, 1202
**13.8 Shortest Path** → LeetCode 542, 752, 909, 1091
**13.9 Grid Graph Problems** → LeetCode 200, 542, 733, 827
**13.10 Bipartite Graph** → LeetCode 785, 886, 1042
**13.11 Topological Sort** → LeetCode 207, 210, 269, 444
**13.12 Strongly Connected** → LeetCode 1192, 2685

---

### Category 14: Shortest Path Patterns

#### 14.1-14.7 Shortest Path Patterns
**14.1 BFS Shortest Path** → Unweighted graphs
**14.2 Dijkstra's Algorithm** → LeetCode 743, 882, 1631, 2050
**14.3 Bellman-Ford** → Negative weights
**14.4 Floyd-Warshall** → All-pairs shortest path
**14.5 0-1 BFS** → Two-weight graphs
**14.6 Multi-Source BFS** → LeetCode 542, 1926, 1972
**14.7 Shortest Path in DAG** → Topological variant

---

### Category 15: Union-Find Patterns

#### 15.1-15.9 Union-Find Patterns
**15.1 Find and Union** → LeetCode 547, 684, 721, 1202
**15.2 Path Compression** → Optimization technique
**15.3 Union by Rank** → Optimization technique
**15.4 Union by Size** → Alternative optimization
**15.5 Connected Components** → LeetCode 1202, 2316
**15.6 Cycle Detection** → LeetCode 684, 1584
**15.7 Kruskal's Algorithm** → Minimum spanning tree
**15.8 Accounts Merge** → LeetCode 721
**15.9 Dynamic Islands** → Advanced problem type

---

### Category 16: Topological Sort Patterns

#### 16.1-16.7 Topological Sort Patterns
**16.1 Kahn's BFS Algorithm** → LeetCode 207, 210
**16.2 DFS-Based Topological** → Alternative approach
**16.3 Course Schedule** → LeetCode 207, 210
**16.4 Dependency Resolution** → General applications
**16.5 Build Order** → LeetCode 269
**16.6 Detect Cycle** → In directed graphs
**16.7 Alien Dictionary** → LeetCode 269

---

## PHASE 5: ADVANCED PATTERNS (Weeks 9+)

### Category 17: Greedy Patterns

#### 17.1-17.10 Greedy Patterns
**17.1 Activity Selection** → Non-overlapping intervals
**17.2 Interval Scheduling** → LeetCode 435, 452
**17.3 Fractional Knapsack** → Continuous greedy choice
**17.4 Jump Game** → LeetCode 45, 55, 1306, 1871
**17.5 Gas Station** → LeetCode 134
**17.6 Meeting Rooms** → LeetCode 252, 253, 1465
**17.7 Job Sequencing** → Profit maximization
**17.8 Minimum Arrows** → LeetCode 452
**17.9 Merge/Choose Intervals** → LeetCode 56, 57, 435, 968
**17.10 Huffman Coding** → Optimal compression

---

### Category 18: Dynamic Programming Patterns

#### 18.1-18.17 DP Patterns
**18.1 1D DP** → LeetCode 70, 91, 139, 198, 213, 338, 377
**18.2 2D DP** → LeetCode 64, 62, 97, 115, 174, 931
**18.3 Fibonacci-Style DP** → LeetCode 70, 509, 1137
**18.4 Climbing Stairs** → LeetCode 70, 1137, 2631
**18.5 House Robber** → LeetCode 198, 213, 337, 956, 2560
**18.6 Knapsack DP** → LeetCode 416, 1049, 1105, 1155, 1751
**18.7 Coin Change** → LeetCode 322, 518
**18.8 Subset Sum** → LeetCode 416, 1049
**18.9 Longest Common Subsequence** → LeetCode 583, 712, 1035, 1092
**18.10 Longest Increasing Subsequence** → LeetCode 300, 673, 1157
**18.11 Edit Distance** → LeetCode 72, 97
**18.12 Grid DP** → LeetCode 62, 63, 64, 174, 931, 980
**18.13 Interval DP** → LeetCode 312, 664, 1691
**18.14 Partition DP** → LeetCode 132, 1278
**18.15 Tree DP** → LeetCode 124, 337, 968
**18.16 Bitmask DP** → LeetCode 464, 691, 473, 526
**18.17 State-Machine DP** → LeetCode 123, 309, 714

---

### Category 19: String Patterns

#### 19.1-19.11 String Patterns
**19.1 Character Frequency** → LeetCode 387, 451, 1189
**19.2 Anagram Pattern** → LeetCode 49, 242, 438, 567
**19.3 Palindrome Pattern** → LeetCode 131, 405, 647, 1278
**19.4 String Sliding Window** → LeetCode 3, 76, 567, 1868, 2962
**19.5 String Two Pointers** → LeetCode 125, 344, 680
**19.6 String Compression** → LeetCode 443, 1544, 2390
**19.7 Longest Substring** → LeetCode 3, 340, 395, 1031, 1695
**19.8 Pattern Matching** → LeetCode 28, 44, 10, 2942
**19.9 KMP Algorithm** → LeetCode 28, 2942
**19.10 Rabin-Karp Algorithm** → Rolling hash technique
**19.11 Z Algorithm** → LeetCode 28 optimization

---

### Category 20: Trie Patterns

#### 20.1-20.7 Trie Patterns
**20.1 Trie Construction** → LeetCode 208, 1804
**20.2 Insert and Search** → LeetCode 208, 1268
**20.3 Prefix Search** → LeetCode 208, 211, 1268
**20.4 Autocomplete** → LeetCode 642, 938
**20.5 Word Dictionary** → LeetCode 208, 211
**20.6 Word Search with Trie** → LeetCode 212, 425
**20.7 Maximum XOR Trie** → LeetCode 421, 1707

---

### Category 21: Bit Manipulation Patterns

#### 21.1-21.10 Bit Manipulation
**21.1 AND, OR, XOR** → Logical operations
**21.2 Check Odd/Even** → n & 1
**21.3 Power of Two** → LeetCode 231, 342, 1260, 2342
**21.4 Count Set Bits** → LeetCode 191, 338, 2815
**21.5 Find Missing Number** → LeetCode 268, 1938
**21.6 Find Single Number** → LeetCode 136, 137, 260
**21.7 Bitmask Subsets** → LeetCode 78, 89, 784
**21.8 XOR-Based Problems** → LeetCode 1486, 2401, 2425
**21.9 Left and Right Shift** → Bit movement operations
**21.10 Brian Kernighan's Algorithm** → Efficient bit counting

---

### Category 22: Interval Patterns

#### 22.1-22.8 Interval Patterns
**22.1 Merge Intervals** → LeetCode 56, 986, 2406
**22.2 Insert Interval** → LeetCode 57
**22.3 Interval Intersection** → LeetCode 986
**22.4 Meeting Rooms** → LeetCode 252, 253
**22.5 Minimum Meeting Rooms** → LeetCode 253, 1094
**22.6 Non-Overlapping Intervals** → LeetCode 435, 452
**22.7 Sweep Line Algorithm** → LeetCode 253, 1109, 1893
**22.8 Calendar Booking** → LeetCode 729, 731, 850

---

### Category 23: Mathematical Patterns

#### 23.1-23.9 Mathematical Patterns
**23.1 GCD and LCM** → Euclidean algorithm
**23.2 Prime Numbers** → LeetCode 204, 263, 1175
**23.3 Sieve of Eratosthenes** → Prime generation
**23.4 Modular Arithmetic** → LeetCode 2079, 2937
**23.5 Fast Power** → LeetCode 50, 1957
**23.6 Factorial and Combinations** → Combinatorial problems
**23.7 Matrix Exponentiation** → Advanced computation
**23.8 Probability Problems** → Expected value calculations
**23.9 Geometry Basics** → Coordinate geometry

---

### Category 24: Advanced Patterns

#### 24.1-24.10 Advanced Patterns
**24.1 Segment Tree** → LeetCode 307, 308, 699, 1628
**24.2 Fenwick Tree** → Binary indexed tree, LeetCode 307, 1649
**24.3 Sparse Table** → Range minimum query
**24.4 Range Minimum Query** → LeetCode 307, 699, 2736
**24.5 Line Sweep** → LeetCode 253, 1109, 1272, 1893
**24.6 Meet in the Middle** → Optimization technique
**24.7 Reservoir Sampling** → LeetCode 382, 497
**24.8 Randomized Algorithms** → Probabilistic approaches
**24.9 Advanced Graph Algorithms** → SCC, Bridge, Cut vertices
**24.10 Advanced DP Optimization** → Convex hull, Divide and Conquer optimization

---

## [Complete guide continues...]

> **Note:** Full implementation with comprehensive examples, code templates, and complexity analysis in expanded versions

---

## 🎯 How to Use This Guide

### Daily Study Routine
1. Pick one sub-pattern per day
2. Read the concept and when to use
3. Solve all 10 problems in order
4. Code all solutions from scratch (no copy-paste)
5. Analyze time/space complexity after solving
6. Try to optimize further

### Weekly Plan
**Week 1-2:** Categories 1-4 (Foundations)
**Week 3-4:** Categories 5-7 (Data Structures)
**Week 5-6:** Categories 8-12 (Advanced Structures)
**Week 7-8:** Categories 13-16 (Graphs & Algorithms)
**Week 9-12:** Categories 17-24 (Advanced Patterns)
**Week 13-16:** Mock interviews + weak pattern review

### Interview Preparation
1. Time each problem: Target 25-30 min per medium
2. Write clean code first, optimize later
3. Explain your approach before coding
4. Handle edge cases systematically
5. Practice with timer

---

## 📊 Pattern Dependency Graph

```
PHASE 1: Fundamentals
  ├─ Category 1 (Arrays/Hashing) → Prerequisite for everything
  ├─ Category 2 (Two Pointers) → Builds on Arrays
  ├─ Category 3 (Sliding Window) → Builds on Two Pointers + Hashing
  └─ Category 4 (Binary Search) → Independent, Builds on Sorting

PHASE 2: Data Structures
  ├─ Category 5 (Stack) → Builds on Basic DS understanding
  ├─ Category 6 (Queue/Deque) → Same level as Stack
  └─ Category 7 (Linked Lists) → Prerequisite for graph/tree work

PHASE 3: Complex Structures
  ├─ Category 8-9 (Recursion/Backtracking) → Mental model preparation
  ├─ Category 10-12 (Trees/BST/Heap) → Build on Recursion
  └─ Builds on Category 7 (Linked Lists)

PHASE 4: Graph & Advanced
  ├─ Category 13 (Graphs) → Builds on Trees + Recursion
  ├─ Category 14 (Shortest Path) → Builds on Graphs
  ├─ Category 15 (Union-Find) → Independent, Builds on Hashing
  └─ Category 16 (Topological) → Builds on Graphs

PHASE 5: Expert Patterns
  ├─ Category 17 (Greedy) → Independent reasoning pattern
  ├─ Category 18 (Dynamic Programming) → Builds on Recursion + Array thinking
  ├─ Category 19 (Strings) → Builds on Arrays + Hashing + Trees
  ├─ Category 20 (Trie) → Builds on Trees
  ├─ Category 21 (Bit Manipulation) → Independent
  ├─ Category 22 (Intervals) → Builds on Sorting + Two Pointers
  ├─ Category 23 (Math) → Independent
  └─ Category 24 (Advanced) → Combines multiple patterns
```

---

## 🏆 Success Criteria

After completing each category:
- [ ] Understand concept deeply (can explain in 2 minutes)
- [ ] Solve baseline problem from scratch (no help)
- [ ] Solve similar variants confidently
- [ ] Identify pattern in new problems
- [ ] Optimize time/space complexity
- [ ] Code clean, readable solutions
- [ ] Handle all edge cases

---

## 📈 Expected Progress

- **Week 1-2:** 90% accuracy on Category 1-2 problems
- **Week 3-4:** 80% accuracy on Category 3-4 problems
- **Week 5-6:** 70% accuracy on Category 5-7 problems
- **Week 7-8:** 60% accuracy on Category 8-12 problems
- **Week 9-10:** 50% accuracy on Category 13-16 problems
- **Week 11-12:** 40% accuracy on Category 17-24 problems (hardest)
- **Week 13-16:** 70%+ on mixed problems from all categories

---

**Created:** 2026-09-12  
**Purpose:** Comprehensive DSA mastery guide with progression  
**Status:** Foundation complete (Phase 1); Phases 2-5 expanding

