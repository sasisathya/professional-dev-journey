# React - Professional Interview Guide (2-Minute Explanations)

## Table of Contents
1. [React's Core Architecture](#reacts-core-architecture)
2. [Core Concepts](#core-concepts)
3. [Hooks & State Management](#hooks--state-management)
4. [Component Patterns](#component-patterns)
5. [Performance & Optimization](#performance--optimization)
6. [Advanced Topics](#advanced-topics)
7. [Real-World Patterns](#real-world-patterns)

---

## React's Core Architecture

### The One-Sentence Definition (Understand This First)

**React is a scheduler + renderer + tree-diffing system that repeatedly calculates the next UI tree from props/state/context, compares it with the previous tree, and commits only the required host-environment changes.**

For React DOM, the host environment is the browser DOM. For React Native, it's native views. For other renderers, it's whatever target they're optimized for.

---

### The Complete React Lifecycle

This is THE most important mental model. Everything in React flows through this pipeline:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          REACT LIFECYCLE PHASES                              │
└─────────────────────────────────────────────────────────────────────────────┘

                              SOMETHING TRIGGERS
                                    ↓
                        (User input, setState, Props change,
                         External API call, Timer, etc.)
                                    ↓
                   ┌─────────────────────────────────────┐
                   │   SCHEDULER (Priority System)        │
                   ├─────────────────────────────────────┤
                   │ - Urgent: User input, animations     │
                   │ - Normal: Regular updates            │
                   │ - Low: Background work               │
                   └─────────────────────────────────────┘
                                    ↓
                   ┌─────────────────────────────────────┐
                   │    RENDER PHASE (Interruptible)     │
                   ├─────────────────────────────────────┤
                   │ - Call function components          │
                   │ - Process hooks (useState, etc)      │
                   │ - Generate new Fiber tree           │
                   │ - Build/compare Fiber nodes         │
                   └─────────────────────────────────────┘
                                    ↓
                   ┌─────────────────────────────────────┐
                   │  RECONCILIATION (Diffing Algorithm) │
                   ├─────────────────────────────────────┤
                   │ - Compare old Fiber with new Fiber  │
                   │ - Mark which nodes changed          │
                   │ - Determine required mutations      │
                   │ - Build effects queue               │
                   └─────────────────────────────────────┘
                                    ↓
          ┌─────────────────────────────────────────────────┐
          │     CAN INTERRUPT HERE (High Priority Work)     │
          │  ← React yields to browser for user input →     │
          │     Then resumes rendering remaining work       │
          └─────────────────────────────────────────────────┘
                                    ↓
                   ┌─────────────────────────────────────┐
                   │    COMMIT PHASE (Synchronous)       │
                   ├─────────────────────────────────────┤
                   │ - Apply all DOM mutations          │
                   │ - Update refs (.current)            │
                   │ - NOT interruptible                 │
                   │ - Atomic: All or nothing            │
                   └─────────────────────────────────────┘
                                    ↓
                            DOM UPDATED
                                    ↓
                   ┌─────────────────────────────────────┐
                   │     LAYOUT EFFECTS (useLayoutEffect)│
                   ├─────────────────────────────────────┤
                   │ - Synchronous after DOM update      │
                   │ - Before browser paint              │
                   │ - For DOM measurements, adjustments │
                   └─────────────────────────────────────┘
                                    ↓
                        BROWSER PAINTS PIXELS
                        (Visual frame rendered)
                                    ↓
                   ┌─────────────────────────────────────┐
                   │  PASSIVE EFFECTS (useEffect)        │
                   ├─────────────────────────────────────┤
                   │ - Asynchronous after paint          │
                   │ - Doesn't block interaction         │
                   │ - For subscriptions, API calls      │
                   └─────────────────────────────────────┘
                                    ↓
                      APP FULLY INTERACTIVE
                            (User can act again)
```

---

### Key Architectural Concepts

#### 1. **Fiber Architecture (The Scheduling Magic)**

React 16+ uses Fibers instead of a call stack. Here's why it matters:

**Before Fiber (React 15 and earlier):**
```
Render entire component tree recursively
  → Synchronous (can't stop)
  → If tree is large, blocks main thread
  → Browser can't handle user input
  → UI feels frozen
```

**With Fiber (React 16+):**
```
Break rendering work into small units (~5ms each)
  → After each unit, yield to browser
  → Browser handles user input, animations
  → Then React resumes next unit
  → User sees responsive UI even during large renders
```

**The Fiber data structure:**
- Each component instance → 1 Fiber node
- Fiber tree is linked list (parent, child, sibling pointers)
- Can traverse it incrementally (unlike call stack)
- Stores: component state, hooks, props, effects queue

**Why this matters:** Concurrent React (React 18+) is built on Fibers. Without Fibers, prioritization and interruption would be impossible.

---

#### 2. **The Render Phase: Calculating the Next UI**

When something triggers an update, React enters the Render phase:

```
Current State + Props
        ↓
   Execute Component Function
        ↓
   Call Hooks (useState returns current state)
   (useEffect queues side effects, not runs them)
        ↓
   Return JSX → Convert to Fiber tree
        ↓
   Compare with Previous Fiber Tree
        ↓
   Mark Changed Nodes (using "workInProgress" fibers)
        ↓
   Generate Effects Queue
        ↓
   ✓ Render Phase Complete (can be interrupted)
```

**Critical insight:** During render phase, effects don't run yet. setState callbacks don't fire. It's pure computation.

---

#### 3. **The Commit Phase: Actually Mutating the DOM**

Once render phase completes, commit phase begins:

```
Traverse Marked Fibers
        ↓
For each marked node:
  - Create/update/delete DOM element
  - Update refs
  - Execute class lifecycle methods
        ↓
All DOM mutations committed atomically
(Can't interrupt mid-commit)
        ↓
Browser DOM now reflects new state
        ↓
useLayoutEffect hooks run (synchronously)
        ↓
Browser paints
        ↓
useEffect hooks run (asynchronously)
```

**Why atomic:** If commit is interrupted mid-way, DOM would be in inconsistent state. So commit phase is never interrupted.

---

#### 4. **Reconciliation: How React Decides What Changed**

The diffing algorithm is simpler than you think:

```
Comparing Old Fiber vs New Fiber

IF element type changed (div → span)
  → Throw away old tree
  → Create completely new one
  
IF element type same (div → div)
  → Keep DOM element
  → Only update properties
  
FOR LISTS:
  → Use 'key' prop to match items
  → If no key: use array index (fragile)
  → If key present: match by key (stable)
  
RESULT: Minimal DOM mutations needed
```

**Why this matters for lists:**

```javascript
// BAD: Using index as key
items.map((item, index) => <div key={index}>{item}</div>)
// If you reorder: indices stay 0,1,2 but items change
// React thinks same items, wrong state attached

// GOOD: Using stable ID
items.map(item => <div key={item.id}>{item}</div>)
// If you reorder: keys stay with their items
// React correctly preserves state
```

---

#### 5. **The Update Queue: Batching and Priority**

When you call `setState`, it doesn't happen immediately:

```
setState called
        ↓
Update enqueued (added to Fiber's update queue)
        ↓
React checks if update is urgent
  → High: User input, animations (interrupt-able)
  → Normal: Regular updates
  → Low: Background work
        ↓
IF NOT in batching context:
  Schedule render immediately
ELSE:
  Batch with other updates
  Render once for all updates
        ↓
Scheduler decides when to start render phase
  (ASAP for urgent, deferred for low priority)
```

**In React 18+:** Batching is automatic in more contexts (promises, async functions, not just event handlers).

---

#### 6. **Hooks System: How State Survives Rerenders**

Hooks are functions that use closure + fiber state storage:

```
First render:
  const [count, setCount] = useState(0)
  → Creates hook state in Fiber
  → Initializes to 0
  → Returns [0, setterFunction]

Second render:
  const [count, setCount] = useState(0)
  → React ignores the "0" argument
  → Returns stored value from Fiber [1, setterFunction]

Why? React matches hooks by CALL ORDER, not by variable name:
  First useState call → Hook #0 in Fiber
  Second useState call → Hook #1 in Fiber
  Third useEffect call → Hook #2 in Fiber

This is why:
  ✓ Call hooks at top level (same order every render)
  ✗ Call hooks conditionally (breaks order)
  ✗ Call hooks in loops (order changes per loop iteration)
```

---

#### 7. **Why React Re-renders (The One Thing People Misunderstand)**

A component re-renders when:

```
1. STATE changes (setState called)
   → Component function called again with new state
   
2. PROPS change (parent passed different value)
   → Component function called again with new props
   
3. PARENT re-renders
   → ALL children re-render by default
   → Even if their props didn't change
   (Solution: React.memo to opt-out)
   
4. CONTEXT value changes
   → All consumers re-render
   (Solution: Split into multiple contexts)
   
5. forceUpdate() (class components only, rare)
   → Forces re-render regardless
```

**The misconception:** "Re-render is expensive." Wrong. Re-render (calling component function) is cheap. DOM updates are expensive. React minimizes DOM updates, not re-renders.

---

#### 8. **The Memory Model: Why Closure Matters**

Every render creates a new scope:

```
Render #1:
  count = 0
  props = { name: 'Alice' }
  callbacks close over count=0, props='Alice'
  
User updates state → Re-render
  
Render #2:
  count = 1 (new variable, new closure)
  props = { name: 'Alice' }
  Old callbacks still close over count=0
  New callbacks close over count=1
  
If callback scheduled for later (useEffect, setTimeout):
  It captures the value from its render
  Later execution sees stale value
  
Solution: Dependencies array tells React when to recreate callback
```

This is why missing useEffect dependencies cause stale closures.

---

#### 9. **Concurrent Features: useTransition and useDeferredValue**

Built on top of Fiber priority system:

```
Normal React (before Concurrent):
  setState → Render everything → Commit → Done
  User input blocked during render

With useTransition:
  startTransition(() => setState(largeUpdate))
  → Mark this update as low-priority
  
  IF high-priority work arrives (user types):
    → Pause low-priority render
    → Handle user input immediately
    → Resume low-priority render later
  → User always feels responsive

With useDeferredValue:
  deferredValue = useDeferredValue(expensiveValue)
  → If value changes
  → Start rendering with old value (to show something)
  → Render new value separately, low-priority
  → Show new value when ready (or keep old if new arrives)
  → User sees graceful degradation
```

---

### Mental Models for Deep Understanding

#### **React = Function of State**

```
UI = f(state)

This is ALL React is. Everything else is optimization.

Previously: App state → Update DOM imperatively
React way:   App state → Recalculate UI function → React updates DOM

Implication: Same state → Same UI (deterministic, testable, predictable)
```

---

#### **Render and Commit are Separate**

```
Render phase = pure, repeatable, interruptible
  → Calculate new UI (no side effects)
  → Can run multiple times (same result)
  → Can be paused/resumed
  → Can be abandoned if higher-priority work arrives

Commit phase = actual mutation, synchronous
  → Apply DOM changes (effects now run)
  → Update refs
  → Side effects execute
  → User sees result
```

---

#### **Keys are Stability Points**

```
Without keys:
  <div key={0}> Item 1 </div>
  <div key={1}> Item 2 </div>
  
  Reorder items → keys change → React says "different items"
  → Throws away state, creates new instances
  
With keys:
  <div key="item-123"> Item </div>
  
  Move item around → key stays with item
  → React says "same item, different position"
  → State preserved, DOM element reused/moved
```

This is why keys must be stable IDs, never indices or random values.

---

### The State Pyramid

```
         Server Database
                 ↑
                 │
         Server-Side Cache
           (normalization,
           deduplication)
                 ↑
                 │
      API Response → Browser
                 ↓
                 │
     Client-Side State Manager
      (Zustand, Redux, Context)
                 ↓
                 │
      Component Local State
           (useState)
                 ↓
                 │
            Derived Values
      (computed, useMemo)
                 ↓
                 │
           Rendered Output

Best practice: Keep state as high in pyramid as it needs to be.
Not: Always make everything in server or always in client.
But: Put it where it logically belongs.
```

---

### Common Architecture Mistakes

1. **Putting server state in client state**
   - Problem: Cache invalidation nightmare
   - Solution: Use TanStack Query (or Remix/Next.js server data)

2. **Making state too global**
   - Problem: Every change re-renders whole app
   - Solution: Split into multiple contexts or use Zustand

3. **Not understanding render vs commit**
   - Problem: Try to mutate DOM in render phase (breaks things)
   - Solution: Mutations go in effects or commit phase

4. **Confusing component re-render with DOM re-render**
   - Problem: Think re-rendering function is expensive
   - Solution: Understand: function call is cheap, DOM updates are expensive

5. **Thinking VDOM comparison is "fast"**
   - Problem: Expect VDOM to be faster than targeted DOM updates
   - Solution: VDOM wins by reducing # of DOM changes, not by being fast

---

## Core Concepts

### Virtual DOM (VDOM) and Fiber Trees

**What it actually is:** React doesn't have a "Virtual DOM object" per se. It has **Fiber trees** (data structure representation of your component tree). The term "VDOM" is legacy—it's just React's internal representation.

**The data flow:**

```
Component State/Props
         ↓
  Render Phase:
  Call component function → Generate JSX
         ↓
  Convert JSX to Fiber Tree
  (Tree of nodes: component type, props, hooks state, etc.)
         ↓
  Compare with Previous Fiber Tree (Reconciliation)
         ↓
  Mark which fibers changed → Effects queue
         ↓
  Commit Phase:
  Traverse marked fibers → Apply DOM mutations
         ↓
  Browser DOM Updated
```

**Why Fiber (not VDOM):**
- Old React: Call stack-based rendering (can't pause)
- Modern React: Fiber trees are traversable, pausable structures
- Enables: Concurrent rendering, priority-based scheduling, error boundaries

**Why the middle layer exists:**
```
Direct DOM manipulation is expensive:
  - Accessing DOM triggers reflow/repaint
  - CSS recalculation
  - Layout recalculation
  - Browser synchronously blocks JS

React's approach:
  1. Calculate next UI in JavaScript (cheap)
  2. Batch all DOM changes together (one reflow/repaint)
  3. Apply once (one paint)
  
Benefit: If you have 100 state changes, old approach:
  setState → reflow → setState → reflow → ... (100 reflows)
React: All updates batch → one reflow → one paint
```

**Common misconception:** "VDOM is faster than direct DOM." **Wrong.** 
- Advantage: Reduces # of DOM operations (batching, minimal changes)
- Disadvantage: Computing Fiber tree has overhead
- Net result: Only faster if you have *many* updates per frame
- If you carefully update exact DOM nodes, that could be faster
- But then you lose: consistency, testability, predictability

**The real win:** Not speed, but **consistency and predictability**.
```
State A → UI A (always)
State B → UI B (always)

This deterministic guarantee enables:
  - Replayability (given same state, same UI)
  - Testing (compare states, not DOM mutations)
  - Time travel debugging
  - Server-side rendering
  - Concurrent rendering
```

**Modern reality (React 18+):**
- Fiber trees support *interruptible rendering*
- High-priority updates (user input) can pause low-priority renders
- Same state + same props = same render result
- But when you commit that result depends on priority
- This is why useTransition/useDeferredValue work

**Production insight:** The VDOM/Fiber overhead is negligible for most apps. Real bottleneck is usually:
  1. Expensive components rendering too often (wrong dependency)
  2. Large API response creating large trees
  3. Unoptimized backend (slow API = slow page, not slow React)
  4. Large JavaScript bundle size

**Key takeaway:** VDOM (actually Fiber trees) is React's abstraction enabling consistent, batchable, interruptible rendering. The benefit is consistency and correctness, not raw speed.

---

### Reconciliation (Diffing Algorithm)

**What it is:** The algorithm that compares old and new Fiber trees to determine which DOM nodes need to change.

**The reconciliation process:**

```
OLD FIBER TREE          NEW FIBER TREE
    <App/>                  <App/>
      |                       |
   <Page>    vs            <Page>
   /    \                  /    \
<List> <Footer>         <List> <Footer>


React walks both trees simultaneously:

For each node:
  1. Same element type?
     YES → Update props, keep DOM element
     NO  → Delete old, create new
     
  2. Element still exists?
     YES → Recursively check children
     NO  → Mark for deletion
     
  3. New element?
     YES → Mark for insertion
     
RESULT: List of "effect" operations
  - [UPDATE_PROPS, nodeA, { className: 'active' }]
  - [DELETE_NODE, nodeB]
  - [INSERT_NODE, nodeC]
```

**How React decides what changed:**

```
Heuristic-based approach (NOT comparing all permutations):

Rule 1: Different element types = different trees
  <div>       vs    <span>
  ↓                  ↓
  Delete old         Create new
  completely        completely
  All children gone  Old children unmounted
  
Rule 2: Same element type = same tree, update props
  <div class="a">    vs    <div class="active">
  ↓
  Keep same DOM element
  Update props: { className: 'active' }
  Keys are stable within same element type
  
Rule 3: Lists need keys to match items
  <li key="user-1"> Alice </li>   vs   <li key="user-2"> Bob </li>
  ↓
  Different keys = different items
  Delete Alice node
  Create Bob node
  
  <li key="user-1"> Alice </li>   vs   <li key="user-1"> Alice Smith </li>
  ↓
  Same key = same item
  Keep DOM element
  Update content
```

**The key matching algorithm (critical for lists):**

```
SCENARIO: Reorder a list

OLD:
  <li key="1"> Alice </li>
  <li key="2"> Bob </li>
  <li key="3"> Carol </li>

NEW (reordered):
  <li key="2"> Bob </li>
  <li key="1"> Alice </li>
  <li key="3"> Carol </li>

React's matching:
  
  Position 0:
    OLD: key="1"
    NEW: key="2"
    Different keys → not same item
    
  Position 1:
    OLD: key="2"
    NEW: key="1"
    Different keys → not same item
    
  Position 2:
    OLD: key="3"
    NEW: key="3"
    Same key → same item, just moved
    
  Result: Move Alice and Bob nodes in DOM
          (reuse Carol node)
```

**What goes wrong WITHOUT keys (using index):**

```
SCENARIO: Delete first item from list

WITH KEYS:
  OLD: <li key="user-1">Alice</li>, <li key="user-2">Bob</li>
  NEW: <li key="user-2">Bob</li>
  
  React: key="user-2" matches Bob item
         Delete Alice node
         Keep Bob node (same item, state preserved)
         ✓ Correct

WITHOUT KEYS (key={index}):
  OLD: <li key="0">Alice</li>, <li key="1">Bob</li>
  NEW: <li key="0">Bob</li>
  
  React: Both have key="0"
         React thinks: "same item, just content changed"
         Keeps first node
         Updates content to "Bob"
         BUT Bob's state (checked checkbox, focus, etc.) is still Alice's
         ✗ Wrong state attached to wrong item
```

**Why this matters for component state:**

```
List of checkboxes:
  <CheckBox key={i} /> ← Checked state lives in <CheckBox> component
  
If you reorder without stable keys:
  Position 0 was alice=checked ✓
  Reorder: alice moves to position 2
  But key=0 still points to first item
  React: "key=0 still exists, update props"
  Render CheckBox at position 0 with alice's props
  BUT CheckBox still has its old internal state (checked ✓)
  Result: Wrong checkbox appears checked
```

**Performance impact:**

```
WITH keys:
  Reorder 100 items
  React reuses 100 DOM elements
  Moves them in DOM (fast)
  State preserved
  
WITHOUT keys:
  Reorder 100 items
  React thinks all are different
  Destroys 100 DOM elements
  Creates 100 new ones (slow)
  State lost (reset to initial)
  Inputs lose focus
```

**Key takeaway:** Use stable, unique IDs (database IDs). Never use array indices. Keys are how React matches "is this the same item or a different one?"

---

### JSX (JavaScript XML)
**What it is:** HTML-like syntax that looks like XML/HTML but is actually JavaScript.

**How it works:**
- You write: `<button>Click me</button>`
- Babel converts it to: `React.createElement('button', null, 'Click me')`
- Then runs as normal JavaScript

**Limitations:** JSX only supports expressions, not statements
- ✅ Use ternary: `condition ? <A /> : <B />`
- ✅ Use `.map()` for loops: `items.map(item => <div>{item}</div>)`
- ❌ Can't use if/else statements inside JSX
- ❌ Can't use for loops inside JSX

**Fragments:** `<>` and `</>` wrap multiple elements without adding extra DOM node. Same as `<React.Fragment>`.

**Key takeaway:** JSX is syntactic sugar for function calls. Understand it converts to `React.createElement()`.

---

### React Fiber Architecture (The Scheduler)

**What it is:** The scheduling system that controls HOW and WHEN React renders components. It's not about WHAT to render, but about controlling the execution flow.

**The problem it solves:**

```
Old React (synchronous rendering):
  setState → Render entire tree recursively → DOM update
             ↑                                      ↑
          Takes time                    Everything frozen while rendering

Scenario: Large list (1000 items)
  setState → Start rendering → Takes 50ms
  User types during render → Input handler queued
  Render finishes → Input handler fires (50ms delay)
  User sees lag, janky experience

Modern React (Fiber scheduling):
  setState → Schedule work → Chunk rendering into 5ms pieces
             ↑
             Check every 5ms if user input arrived
  If input: Pause rendering, handle input, resume rendering
  User always responsive
```

**How Fiber breaks work into chunks:**

```
Work to do: Render large component tree
  ├─ Render App component (1ms)
  ├─ Render Page component (1ms)
  ├─ Render List component (1ms)
  ├─ Render Item 1 (0.5ms)
  ├─ Render Item 2 (0.5ms)
  ├─ Render Item 3 (0.5ms)
  ├─ Render Item 4 (0.5ms)
  ├─ ... 996 more items ...
  └─ Reconciliation (2ms)

React's scheduler:
  Work time: 5ms (adjust based on device)
  
Slice 1: [App, Page, List, Item1, Item2, Item3, Item4, Item5, Item6, Item7]
          ↓ Takes ~3.5ms
          Check: User input? NO
          Continue
          
Slice 2: [Item8-Item15]
          ↓ Takes ~4ms
          Check: User input? YES! (User typed)
          PAUSE rendering
          
Handle input: Process keystroke (1ms)
          
Resume:
Slice 3: [Item16-Item23]
          ↓ Takes ~4ms
          Check: User input? NO
          Continue
          
... and so on
```

**Priority system (Concurrency):**

```
React assigns priorities based on source:

1. Immediate (Sync)
   - Synchronous setState (rare)
   - Event handler completion

2. User Input (High)
   - onClick, onChange, onKeyDown, etc.
   - useTransition(startTransition)
   - Should complete ASAP (< 100ms)

3. Normal (Medium)
   - Regular setState
   - API responses
   - Timer callbacks

4. Background (Low)
   - useDeferredValue
   - Suspense loading
   - Can be deferred indefinitely

Scheduler logic:
  
  If high-priority work arrives:
    Pause low-priority render
    Process high-priority
    Resume low-priority
    
  If same priority arrives:
    Batch together
    Render once
```

**The Fiber data structure:**

```javascript
// Simplified Fiber node
{
  type: ComponentFunction,      // The component
  key: "item-123",             // For lists
  props: { name: 'Alice' },    // Props passed in
  state: { count: 5 },         // Component's useState values
  hooks: [                     // Hook state
    { type: 'state', state: [count, setCount] },
    { type: 'effect', deps: [count] }
  ],
  effectTag: 'UPDATE',         // What to do: INSERT, DELETE, UPDATE
  nextEffect: null,            // Linked list of effects
  
  // Tree structure
  parent: parentFiber,         // Parent node
  child: childFiber,           // First child
  sibling: siblingFiber,       // Next sibling
  
  // Work in progress
  workInProgress: fiberCopy,   // Double-buffering
}
```

**Why Fiber, not call stack:**

```
Call stack approach (old React):
  renderComponent(App)
    renderComponent(Page)
      renderComponent(List)
        renderComponent(Item) ← Can't pause here
                               ← Can't priority-flip
                               ← Linear, recursive

Fiber approach (modern React):
  Fiber tree traversal:
  App → Page → List → Item1 → Item2 → Item3
  ↓
  Can pause at any point
  ↓
  Can resume later
  ↓
  Can jump to different priority work
  ↓
  Can re-render parts without full tree
```

**The double-buffering trick:**

```
At any moment, React maintains two Fiber trees:

Current Fiber Tree (committed, in DOM)
  └─ Reflects current UI

Work-in-Progress Fiber Tree
  └─ Being built during render phase
  └─ Completely separate from Current
  
During render phase:
  Build Work-in-Progress tree
  
During commit phase:
  If no errors:
    Flip pointers: WorkInProgress becomes Current
    Old Current discarded
  If errors:
    Discard WorkInProgress
    Keep Current (revert to last good state)

Benefit:
  Can build new tree without affecting current
  If render is interrupted: Current unchanged
  If error: Current unchanged
  Users always see stable UI
```

**When React pauses vs commits:**

```
Render phase: CAN pause
  ├─ Computing Fiber tree
  ├─ Running component functions
  ├─ No side effects yet
  ├─ No DOM mutations
  ├─ Can be restarted/abandoned
  └─ Perfect place to pause for high-priority work

Commit phase: CANNOT pause
  ├─ Applying DOM mutations
  ├─ Running lifecycle methods
  ├─ Running useLayoutEffect
  ├─ Updating refs
  └─ Must be atomic (all or nothing)
```

**Production implications:**

```
Why useEffect doesn't run during render:
  Because render phase is pauseable
  If effects ran during render:
    Pause render for high-priority work
    Effect half-executed
    Inconsistent state
  
Solution: Effects only run in commit phase
          (guaranteed to complete atomically)
          
Why setState is batched in event handlers:
  onClick → Queue setState → Render → Commit
  Not: onClick → setState → Render → setState → Render
  
Why concurrent features work:
  High-priority setState → Pause low-priority render
  Low-priority renders complete when idle
```

**Key takeaway:** Fiber is React's scheduler enabling interruptible rendering. It splits work into chunks, respects priorities, and keeps browser responsive. This is foundation of Concurrent React (useTransition, useDeferredValue).

---

## Hooks & State Management

### useState
**What it does:** Functional component's way to own local state. When state changes, component re-renders with new value.

**How it works:**
- `const [count, setCount] = useState(0)` - initial value is `0`
- `setCount(5)` - queues state update
- React re-renders to show new state

**Batching (React 18+):**
- Multiple `setState()` calls in event handlers batch to ONE re-render ✓
- Multiple `setState()` calls in async callbacks (promises, timers) also batch ✓
- Reading state right after `setState()` still gives old value (always)

**Important: State updates are NOT truly async in React 18+.** They're synchronous in most cases, but you shouldn't rely on timing. Think of them as "queued" not "asynchronous."

**Functional updates (`prev =>`) vs direct updates:**
- Use `setCount(prev => prev + 1)` when new state depends on previous state
- Use `setCount(5)` for independent updates
- Functional form is safer in closures and concurrent scenarios
- Real gotcha: If you reference `count` in handler and it captures old value, functional form won't help. You need proper dependency management.

**Lazy initialization:** `useState(() => expensiveOperation())` - function runs once on mount only. Don't pass result directly.

**Production insight:** Most useState bugs come from not understanding that state updates don't happen immediately. Use useCallback/useReducer for complex state flows.

**Key takeaway:** State updates batch in React 18+. Use functional form for dependent updates. State changes don't reflect immediately in same function—that's by design.

---

### useEffect
**What it does:** Synchronizes component with external systems (APIs, browser APIs, subscriptions). Runs *after* component renders and commits to DOM.

**Structure:** `useEffect(() => { /* side effect */ }, [dependencies])`

**Timing (crucial for production):**
- Runs AFTER paint (not blocking)
- Runs AFTER layout (in useLayoutEffect if needed)
- In Concurrent React, effect may run, component suspended, then effect runs again (use cleanup!)

**Dependency array:**
- `undefined` (no array): Runs after EVERY render → usually wrong
- `[]` (empty): Runs once after mount, cleanup on unmount
- `[a, b]`: Runs when a or b reference changes (using Object.is())

**Dependency gotchas:**
- Objects/arrays always "change" (new reference every render). Memoize them.
- Forgetting a dependency = stale closure bugs. Use ESLint `exhaustive-deps`.
- Including unnecessary deps = unnecessary effect runs. Be precise.

**Cleanup function:**
- Return function to cleanup: unsubscribe, cancel request, clear timers
- Cleanup runs before next effect OR before unmount
- In Concurrent React with Suspense, cleanup can run multiple times (unmount → remount during retry)
- Always assume cleanup might run without matching effect in some scenarios

**Real production issue:** With Suspense + error boundaries, effect cleanup isn't guaranteed to match effect runs. Use ref to track actual subscription state.

**Modern best practice:** Avoid manual useEffect for data fetching. Use React Query, SWR, or framework (Next.js, Remix) that handles this.

**Key takeaway:** Effects run after render. Dependencies must be exhaustive. Always cleanup. For data fetching, use specialized libraries.

---

### useContext
**What it does:** Lets you access values from a parent Context without passing through every level (no prop drilling).

**How to use:**
1. Create context: `const ThemeContext = createContext()`
2. Wrap components: `<ThemeContext.Provider value={theme}>`
3. Access in child: `const theme = useContext(ThemeContext)`

**Good for:** Theme, language/locale, user authentication, global settings that rarely change.

**NOT good for:** State management. Context is not a state manager.

**Why?** All components that read from context re-render when value changes. If you change context frequently, everything re-renders (performance problem).

**How to optimize:**
- Split into multiple contexts (one for theme, one for auth)
- Memoize the context value so it doesn't change on every render

**Key takeaway:** useContext = global values. Not for frequent updates. Split into multiple contexts.

---

### useReducer
**What it does:** Lets you manage complex state using actions instead of individual setState calls.

**How it works:**
- Reducer is pure function: `(previousState, action) => newState`
- You dispatch actions: `dispatch({ type: 'INCREMENT', payload: 5 })`
- Reducer returns new state based on action type

**When to use:**
- Multiple related state values (user form with name, email, password)
- Complex state logic (form with validation, multiple steps)
- Want testable, predictable state transitions

**Compare to useState:**
- useState: Simple state, each setter is independent
- useReducer: Complex state, related values change together

**Key takeaway:** useReducer for complex, related state. useState for simple state.

---

### useRef
**What it does:** Creates a box that holds a value. Can change value without re-rendering component.

**Key difference from state:** Changing ref does NOT trigger re-render. State change DOES trigger re-render.

**When to use:**
- Access DOM directly (focus input, play video): `inputRef.current.focus()`
- Store timer IDs for cleanup: `const timerRef = useRef(null)`
- Integrate with non-React libraries
- Hold a mutable value that doesn't affect UI

**NOT for:** Avoiding re-renders. Not a state replacement. Don't use ref for display values.

**Important:** Ref persists across renders. Same ref object every time component renders.

**Key takeaway:** useRef for imperative operations only (DOM access, timers). Not for state.

---

### useCallback
**What it does:** Memoizes a function. Returns same function reference across renders (unless dependencies change).

**Why?** To pass stable function to memoized child components. If function changes every render, child re-renders even if props didn't change.

**When to use:**
- Passing function to `React.memo` child component
- Function is used in useEffect dependency

**Don't over-use:** Creating function is cheap. If not passing to memoized child, skip useCallback.

**Always include dependencies:** Include all variables used inside function in dependency array.

**Key takeaway:** useCallback for passing stable functions to memoized children. Don't use without measurement.

---

### useMemo
**What it does:** Memoizes a computed value. Recalculates only when dependencies change.

**When to use:**
- Expensive operations (sorting/filtering 10,000 items, complex calculations)
- Passing objects/arrays to memoized children
- Creating derived data from props

**Don't over-use:** Memoization overhead costs time/memory. Simple operations are faster without memoization.

**Example:** `const sorted = useMemo(() => items.sort(...), [items])` only resorts when items changes.

**Key takeaway:** useMemo for expensive operations only. Don't use for simple logic. Measure before using.

---

### useLayoutEffect
**What it does:** Like useEffect, but runs synchronously after DOM changes, before browser paints.

**When to use:** DOM measurements, adjusting styles before paint (avoid visual flashes).

**Why it's different:**
- useEffect: Runs after paint (doesn't block UI)
- useLayoutEffect: Runs before paint (can block UI if slow)

**Usually use useEffect.** useLayoutEffect is rare. Only when you need to measure DOM before paint.

**Key takeaway:** useLayoutEffect runs before paint. Usually useEffect is fine.

---

### useTransition
**What it does:** Marks state update as non-urgent. React can interrupt it to handle urgent updates (user input, animations).

**How it works:**
```javascript
const [isPending, startTransition] = useTransition();

const handleFilter = (newFilter) => {
  startTransition(() => {
    setFilter(newFilter); // non-urgent state update
  });
};
// If user types while filtering, React pauses filter, handles keystroke, then resumes filter
```

**Why it matters:** Without it, updating a large list causes janky UI. Browser can't respond to input until list finishes rendering.

**With useTransition:** User's keystroke is marked urgent. React pauses the list update, handles input, then resumes. Feels responsive.

**When to use:**
- Filtering/searching large lists
- Sorting/re-rendering expensive operations
- Any state update that might block user interaction

**Difference from debounce:** useTransition doesn't delay the update, it interrupts and resumes. User sees feedback immediately (loading state), not stalling.

**Key takeaway:** useTransition makes expensive updates non-blocking. User input always feels responsive.

---

### useDeferredValue
**What it does:** Defers updating a value until more urgent work finishes.

**How it works:**
```javascript
const [searchText, setSearchText] = useState('');
const deferredText = useDeferredValue(searchText);

// searchText updates immediately (input feels responsive)
// deferredText updates lazily (expensive search runs later)
// Can show stale results while new results calculate
```

**Difference from useTransition:**
- **useTransition:** You control which state updates are non-urgent
- **useDeferredValue:** You defer a VALUE, not state updates. More passive.

**When to use:**
- Passing prop that's expensive to render to child component
- Search input → expensive results list
- You can't wrap the state setter in startTransition (value comes from parent)

**Real example:**
```javascript
// Parent controls input
<input value={search} onChange={e => setSearch(e.target.value)} />
// Pass deferred value to expensive list
<SearchResults query={useDeferredValue(search)} />
// Results component can check if value is stale
const SearchResults = ({ query }) => {
  const [isPending, startTransition] = useTransition();
  // Re-render with stale value until new results ready
};
```

**When NOT to use:**
- Simple/fast updates (overhead > benefit)
- Real-time multiplayer (lag is bad UX)
- Critical data (don't show stale to user)

**Production insight:** Most apps don't need these. useTransition/useDeferredValue are for genuinely expensive renders that block interaction. If your filter/search is fast, skip it. Measure first.

**Key takeaway:** useTransition for non-urgent state updates. useDeferredValue for deferred props. Both prevent janky UI during expensive renders.

---

### Custom Hooks
**What it is:** A JavaScript function that uses React Hooks. Reuses stateful logic without duplicating code.

**Rules:**
- Must start with "use" prefix: `useFetch`, `useLocalStorage`, `useWindowSize`
- Can only call React Hooks inside
- Can only call in components or other Hooks

**Example patterns:**
- `useFetch(url)` - fetch data, return data/loading/error
- `useLocalStorage(key)` - sync state with localStorage
- `useWindowSize()` - track window dimensions

**Why useful:** Avoids code duplication. Multiple components can use same hook logic.

**Key takeaway:** Custom Hooks = reuse stateful logic. Modern, composable way to share code.

---

## Component Patterns

### Functional vs Class Components
**Functional Components:**
- Plain JavaScript functions
- Receive props as argument
- Return JSX
- Simple, less boilerplate
- Hooks add state and side effects

**Class Components:**
- Extend `React.Component`
- Have `this.state`, `this.props`
- Have lifecycle methods (`componentDidMount`, `componentWillUnmount`)
- More boilerplate
- Older approach

**Why Hooks replaced Class Components:**
- Hooks give functional components state and lifecycle features
- `useState` = state in functional components
- `useEffect` = lifecycle in functional components
- Less code, easier to understand
- Easy to reuse logic between components

**Modern React = Functional + Hooks.** Almost no new class components written.

**Key takeaway:** Use functional components. Hooks provide everything classes have without boilerplate.

---

### Controlled vs Uncontrolled Components
**Controlled Component:**
- Component's value comes from React state
- You control the value: `<input value={state} onChange={handleChange} />`
- React is the single source of truth
- Good for validation, complex forms, real-time updates
- More predictable

**Uncontrolled Component:**
- Value lives in DOM, not React state
- You read value on demand with `useRef`: `inputRef.current.value`
- DOM is the source of truth
- Less overhead
- Good for simple forms, file inputs, integrating with non-React code

**When to use:**
- Controlled: Default, almost always use this
- Uncontrolled: Rare, only when you need to access raw DOM value

**Key takeaway:** Use controlled components. Uncontrolled is rare escape hatch.

---

### Props Drilling
**What it is:** Passing props through multiple levels of components that don't use them.

**Example:**
```
App
  → Page (receives theme, doesn't use it)
    → Card (receives theme, doesn't use it)
      → Button (finally uses theme)
```

**Why it's bad:**
- Hard to refactor (have to change every intermediate component)
- Creates coupling between unrelated components
- Hard to track where prop actually goes

**Solutions:**
- Use Context for global values (theme, auth, language)
- Use state management (Redux, Zustand)
- Restructure component tree

**Key takeaway:** Don't pass through 5+ levels. Use Context for global values, state manager for complex state.

---

### Re-rendering Triggers
**What causes a component to re-render:**
1. State changes (`setState`, `useState`)
2. Props change
3. Parent component re-renders (child re-renders too by default)
4. Context value changes (if using `useContext`)
5. `forceUpdate()` in class components (rare)

**Understanding parent re-render:**
- When parent re-renders, all children re-render by default
- This can cause performance issues if children are expensive
- Solution: `React.memo` to prevent re-render if props didn't change

**Key takeaway:** State, props, parent, or context change = re-render.

---

### Batching
**What it is:** React groups multiple state updates into one re-render instead of re-rendering after each update.

**How it works:**
```javascript
// Without batching: 3 re-renders
setState(1);
setState(2);
setState(3);

// With batching: 1 re-render
// React batches these together automatically in event handlers
```

**In React 18:** Batching works in more places (async functions, promises, not just event handlers).

**Why?** Multiple re-renders = slower. One re-render with all changes = faster.

**Key takeaway:** Multiple state updates in one event handler = one re-render (automatic).

---

### Key Prop in Lists
**Why keys matter:** React uses keys to identify which list item is which between renders.

**Without keys (using index):**
- Item 1 has `key={0}`, Item 2 has `key={1}`
- Delete Item 1
- Now new Item 1 has `key={0}` (same key, different item)
- React thinks it's the same item → wrong state attached

**With stable keys (database IDs):**
- Item 1 has `key="user-123"`, Item 2 has `key="user-456"`
- Delete Item 1
- Item 2 still has `key="user-456"` (same item, correct state attached)

**What goes wrong without good keys:**
- Form inputs keep old value when list reorders
- Checkboxes stay checked on wrong items
- Component state gets mixed up

**Best practice:** Always use stable, unique ID (database ID). Never use array index.

**Key takeaway:** Good keys = correct state after filtering/reordering. Bad keys = broken forms and state.

---

## Performance & Optimization

### React.memo
**What it does:** Shallow compares props; if they're the same, skips re-render.

**How it works:**
- Checks if any prop changed using `Object.is()`
- Primitives: by value. Objects/arrays: by reference
- If nothing changed, reuses previous render output

**The hard truth:** Most React performance problems aren't solved by React.memo.
- Memoization adds overhead (comparison + caching)
- Only worth it if: (1) render is genuinely expensive, (2) props often don't change
- In practice? Benchmark first.

**Common waste patterns:**
- Wrapping cheap components with memo (overhead > benefit)
- Using memo without memoizing props (every parent render creates new objects → memo useless)
- Memoizing everything "just in case" (premature optimization)

**When it actually helps:**
- List with 100+ items, memoized with stable keys and callbacks
- Complex form with controlled inputs + expensive validation
- Expensive computations (large tree renders, filters, animations)

**Pairing with useCallback/useMemo:**
- If you're memoizing a component that receives function/object props, those props MUST be memoized too
- Otherwise memo is pointless (props always "change")
- This creates a performance pyramid: memoize leaf → memoize parent to stabilize props → memoize grandparent...
- Leads to "memoization tax"—your whole tree becomes memoized

**Production insight:** After 10 years, I've seen premature memo optimization cause more bugs than it solved. Enable React DevTools Profiler, find the actual bottleneck, then fix it precisely. Don't memo everything.

**Key takeaway:** React.memo skips re-render if props identical. Only use if component is expensive AND props are often stable. Profile before optimizing.

---

### Code Splitting and Suspense
**What it is:** Load JavaScript code only when needed, not all at start.

**How it works:**
- Normal: User downloads entire app (1MB) → app loads
- With code splitting: User downloads core (300KB) → app loads → loads more code as needed (other routes, features)

**How to use:**
```javascript
const Dashboard = React.lazy(() => import('./Dashboard'));
// Wrap with Suspense
<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

**When to use:**
- Split by routes (different pages load their own code)
- Split by features (heavy features load on demand)
- Large apps with multiple routes

**Benefits:**
- Smaller initial bundle
- Faster app startup
- User only downloads code they use

**Key takeaway:** Code splitting = load code on demand. Suspense = show fallback while loading.

---

### Profiling and DevTools
**What to measure:**
- Which components render and why
- How long rendering takes
- How many times components re-render
- Identify bottlenecks

**How to use React DevTools Profiler:**
1. Open DevTools → Profiler tab
2. Click record button
3. Interact with app
4. Stop recording
5. See which components rendered, how long it took

**Common performance issues to look for:**
- Component re-rendering too often (wrong dependency in useEffect)
- Unnecessary re-renders (missing React.memo)
- Expensive renders (expensive computation in component body)
- Stale dependencies (missing values in dependency array)

**How to optimize:**
1. Profile to identify real bottleneck
2. Check if component needs to re-render
3. Add React.memo if props don't change
4. Use useMemo for expensive operations
5. Profile again to confirm improvement

**Key takeaway:** Measure first, optimize second. Don't guess what's slow.

---

## Advanced Topics

### Error Boundaries
**What it is:** Component that catches errors in child components and shows a fallback UI instead of crashing entire app.

**How it works:**
- Has `componentDidCatch(error, errorInfo)` lifecycle method
- When child component renders error, Error Boundary catches it
- Shows fallback UI instead of broken component

**What it catches:**
- Render errors (component code throws)
- Lifecycle method errors
- Constructor errors

**What it does NOT catch:**
- Event handler errors (use try-catch)
- Async errors (use try-catch)
- Server-side rendering errors

**Why use it:**
- Prevents entire app from crashing
- Shows user-friendly error message
- Logs error for debugging

**Where to place:**
- Top of app (catch all errors)
- Around specific risky components
- Multiple boundaries at different levels

**Note:** Must be class component. No Hook version yet.

**Key takeaway:** Error Boundaries catch render errors and prevent crash. Wrap app root or risky components.

---

### Render Props (Legacy)
**What it is:** Old pattern where component accepts function as prop.

**Example:**
```javascript
<DataFetcher
  render={data => <div>{data}</div>}
/>
```

**Why it existed:** Pre-Hooks way to share stateful logic between components.

**Why it's outdated:** Custom Hooks do the same thing, cleaner.

**In modern code:** Don't use. Use custom Hooks instead.

**Key takeaway:** Legacy pattern. Use custom Hooks for logic sharing.

---

### Higher-Order Components (HOC) (Legacy)
**What it is:** Function that takes a component and returns an enhanced component.

**Example:**
```javascript
const Enhanced = withTheme(Button);
```

**Why it existed:** Pre-Hooks way to reuse logic (wrap component with behavior).

**Why it's outdated:** Custom Hooks do the same thing, cleaner and simpler.

**In modern code:** Don't create new ones. Use custom Hooks instead.

**Key takeaway:** Legacy pattern. Use custom Hooks.

---

### Portals
**What it is:** Way to render component outside its parent in the DOM tree.

**When to use:**
- Modals (render outside parent, prevents overflow/z-index issues)
- Dropdowns
- Tooltips
- Any component that needs to visually appear outside its parent

**How to use:**
```javascript
import { createPortal } from 'react-dom';
createPortal(<Modal />, document.getElementById('modal-root'));
```

**Key takeaway:** Portals render into different DOM node. Good for modals and overlays.

---

### forwardRef
**What it is:** Way to forward `ref` prop from parent to child DOM element.

**Why needed:** By default, components can't receive `ref` prop. forwardRef allows it.

**When to use:**
- Parent needs to access child DOM element directly
- Example: Parent wants to focus child input
- Example: Parent wants to trigger child animation

**How to use:**
```javascript
const Input = forwardRef((props, ref) => (
  <input ref={ref} {...props} />
));
```

**Key takeaway:** forwardRef allows passing ref to child component.

---

### Compound Components
**What it is:** Pattern where components work together, sharing state implicitly through Context.

**Example:**
```javascript
<Form>
  <Form.Input name="email" />
  <Form.Button>Submit</Form.Button>
</Form>
```

**Why use it:**
- Flexible component composition
- Less prop drilling
- Clear intent (related components)

**How it works:** Parent passes state down through Context. Children consume it.

**Key takeaway:** Compound components = flexible, related component groups.

---

## React 19 Features (2024-2025)

### The Shift: Client-Server Boundary

React 19 fundamentally changes how you think about React. It's not just "add more hooks"—it's about collapsing the client-server boundary.

**Pre-React 19:** You fetch on client, manage state on client, send actions to server
**React 19:** You write server code that looks like client code using Server Actions and `use()`

This is as big as Hooks were.

---

### use() Hook

**What it does:** Read promises and context directly in components. No wrapper needed.

**Why it matters:** Simplifies async rendering and context consumption.

**Before React 19:**
```javascript
// Option 1: Use useEffect (old pattern)
const [data, setData] = useState(null);
useEffect(() => {
  fetchData().then(setData);
}, []);

// Option 2: Suspense (new pattern, but clunky)
const data = fetchDataSuspense(); // Must throw promise
```

**With React 19:**
```javascript
// Directly read promise in component
function MyComponent({ dataPromise }) {
  const data = use(dataPromise);
  return <div>{data}</div>;
}

// Parent passes promise (doesn't need to await)
<MyComponent dataPromise={fetchData()} />
// React waits for promise, renders when ready
```

**With context:**
```javascript
// Can call useContext conditionally now (only in React 19)
function Component({ optionalContext }) {
  // Works! Context can be optional
  const value = optionalContext ? use(optionalContext) : null;
  return <div>{value}</div>;
}
```

**Key insight:** `use()` enables conditional async/context reading. Before you had to move context/async outside conditional logic.

**When to use:**
- Reading promise from props (Server Component passed you promise)
- Conditional context reading
- Simplifying Suspense patterns

**Production gotcha:** `use()` must be in try-catch or Suspense boundary. Promise rejection isn't caught automatically.

**Key takeaway:** `use()` simplifies promise and context reading. Enables conditional async.

---

### Server Actions

**What it is:** Functions that run on server. You call them from client. React handles the connection.

**Why it matters:** Eliminates API route boilerplate. Type-safe server calls. Automatic form revalidation.

**How it works:**
```javascript
// server.js (Server Component or separate server file)
'use server'

export async function updateUser(formData) {
  const name = formData.get('name');
  // Run on server (database access, secrets safe)
  const user = await db.users.update({ name });
  revalidatePath('/users'); // Revalidate cache automatically
  return user;
}

// client.js (Client Component)
import { updateUser } from './server';

export function UserForm() {
  return (
    <form action={updateUser}>
      <input name="name" />
      <button type="submit">Update</button>
    </form>
  );
}
```

**Key points:**
- `'use server'` directive marks function as server-only
- Can be called from Client Components (React handles RPC)
- Automatic serialization (no JSON.stringify needed)
- Type-safe (TypeScript infers types across client-server)
- Automatically revalidates related data after mutation

**Compare to old way:**
```javascript
// Old: Manual API route + fetch
// Step 1: Create API route
export async function PUT(req) {
  const data = await req.json();
  await db.update(data);
  return Response.json({ success: true });
}

// Step 2: Fetch from client
const handleSubmit = async (e) => {
  const data = new FormData(e.target);
  const response = await fetch('/api/update', {
    method: 'PUT',
    body: JSON.stringify(Object.fromEntries(data))
  });
  // Step 3: Manually revalidate
  revalidate();
};

// Server Actions: All automatic
```

**When to use:**
- Form submissions (mutations)
- Any client → server communication
- Replacing API routes in Next.js

**When NOT to use:**
- Read-only queries from client (use `use()` + Server Components instead)
- Streaming large responses (server actions assume small responses)
- Real-time subscriptions (different pattern)

**Production reality:** This is the big change. Most data fetching should move to Server Components + Server Actions. Client-side fetch becomes the exception, not the rule.

**Key takeaway:** Server Actions eliminate API boilerplate. Client code calls server functions directly. Automatic revalidation.

---

### useActionState

**What it does:** Manages form submission state with Server Actions.

**Why it matters:** Replaces manual `isPending` + `isError` + error state management.

**Before React 19:**
```javascript
function Form() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    try {
      await updateUser(formData);
    } catch (err) {
      setError(err);
    } finally {
      setIsPending(false);
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

**With React 19:**
```javascript
import { useActionState } from 'react';
import { updateUser } from './server';

function Form() {
  const [state, formAction, isPending] = useActionState(updateUser, null);
  
  return (
    <form action={formAction}>
      <input name="name" />
      <button disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}
```

**How it works:**
- First arg: Server Action to call
- Second arg: Initial state
- Returns: [state, formAction, isPending]
- `formAction` → pass to `<form action={formAction}>`
- `state` → server action return value
- `isPending` → true while action running

**Key difference from useTransition:**
- `useTransition`: You control setState inside startTransition
- `useActionState`: Form submission controls action automatically

**Real example:**
```javascript
'use server'
export async function createPost(prevState, formData) {
  const title = formData.get('title');
  
  // Validation
  if (!title) {
    return { error: 'Title required' };
  }
  
  try {
    const post = await db.posts.create({ title });
    // Success response
    return { success: true, post };
  } catch (err) {
    return { error: err.message };
  }
}

// Client
function NewPost() {
  const [state, formAction, isPending] = useActionState(createPost, null);
  
  return (
    <form action={formAction}>
      <input name="title" required />
      <button disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Post'}
      </button>
      {state?.error && <p style={{ color: 'red' }}>{state.error}</p>}
      {state?.success && <p>Post created!</p>}
    </form>
  );
}
```

**When to use:**
- Form submissions with Server Actions
- Any mutation where you need pending/error state
- Alternative to useTransition for form-specific logic

**Key takeaway:** useActionState handles form submission state automatically. Pass Server Action to `action` prop.

---

### useOptimistic

**What it does:** Show optimistic UI update while server action runs.

**Why it matters:** User sees instant feedback. Server catch-up happens in background.

**The pattern:**
```javascript
// Server Action
'use server'
export async function addTodo(prevState, formData) {
  const todo = { id: Date.now(), text: formData.get('text') };
  await db.todos.insert(todo);
  // Return updated list
  return { todos: [...prevState.todos, todo] };
}

// Client
function TodoList({ initialTodos }) {
  const [state, formAction] = useActionState(addTodo, { todos: initialTodos });
  
  // Optimistic update: show new todo immediately
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    state.todos,
    (todos, newTodo) => [...todos, newTodo]
  );
  
  const handleSubmit = (e) => {
    const formData = new FormData(e.currentTarget);
    const newTodo = { 
      id: Math.random(), 
      text: formData.get('text'),
      pending: true // Mark as optimistic
    };
    
    addOptimisticTodo(newTodo); // Show immediately
    formAction(formData); // Send to server
  };
  
  return (
    <>
      <form onSubmit={handleSubmit}>
        <input name="text" />
        <button>Add</button>
      </form>
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>
            {todo.text}
          </li>
        ))}
      </ul>
    </>
  );
}
```

**How it works:**
1. User submits form
2. `addOptimisticTodo()` updates state immediately
3. UI shows new todo (optimistic)
4. Server action runs in background
5. When server responds, real state updates
6. Optimistic state replaced with server response

**Why this matters:**
- User sees instant feedback (feels fast)
- Network latency invisible to user
- If server fails, can rollback to previous state
- No janky "loading" states

**Real-world example:**
```javascript
// Adding reaction to post (like/favorite)
'use server'
export async function addReaction(postId, emoji) {
  await db.reactions.insert({ postId, emoji });
  revalidatePath(`/posts/${postId}`);
}

// Client
function Post({ post, reactions }) {
  const [optimisticReactions, addOptimistic] = useOptimistic(reactions);
  
  const handleReaction = (emoji) => {
    addOptimistic([...optimisticReactions, emoji]); // Show immediately
    addReaction(post.id, emoji); // Send to server
  };
  
  return (
    <div>
      <p>{post.text}</p>
      <div>
        {optimisticReactions.map(emoji => <span key={emoji}>{emoji}</span>)}
      </div>
      <button onClick={() => handleReaction('❤️')}>Like</button>
    </div>
  );
}
```

**Key insight:** Optimistic updates make apps feel responsive even with network latency.

**When to use:**
- Like/favorite buttons
- Adding items to list
- Any mutation where user can see result immediately
- Comments, reactions, small state changes

**When NOT to use:**
- Large data transformations (too complex to predict)
- Operations that might fail (show optimistic, then handle error)
- Complex business logic (server action response is source of truth)

**Key takeaway:** useOptimistic shows instant UI feedback. Server updates in background. Makes apps feel fast.

---

### useFormStatus

**What it does:** Access form submission status in child components (pending, data, method, action).

**Why it matters:** Share form state without lifting it up.

**How it works:**
```javascript
'use server'
export async function submitForm(formData) {
  await new Promise(r => setTimeout(r, 1000)); // Simulate delay
  return { success: true };
}

// SubmitButton is inside <form>, gets status automatically
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button disabled={pending}>
      {pending ? 'Saving...' : 'Submit'}
    </button>
  );
}

function MyForm() {
  const [state, formAction] = useActionState(submitForm, null);
  
  return (
    <form action={formAction}>
      <input name="text" />
      <SubmitButton /> {/* Gets status automatically */}
    </form>
  );
}
```

**What you get from useFormStatus:**
```javascript
const {
  pending,        // true while action running
  data,          // FormData object (for preview)
  method,        // 'POST' or 'GET' (rarely needed)
  action         // The action function
} = useFormStatus();
```

**Real example (showing optimistic input):**
```javascript
function SearchInput() {
  const { pending, data } = useFormStatus();
  
  // Show pending value while searching
  const searchValue = data?.get('q') ?? '';
  
  return (
    <input
      name="q"
      placeholder="Search..."
      defaultValue={searchValue}
      disabled={pending}
    />
  );
}

function SearchForm({ results }) {
  return (
    <form action={search}>
      <SearchInput />
      <button type="submit" disabled={pending}>Search</button>
      {results.length > 0 && <Results items={results} />}
    </form>
  );
}
```

**When to use:**
- Disable submit button during submission
- Show loading state in child components
- Display pending form data for preview
- Any child component that needs form status

**Key difference from useActionState:**
- `useActionState` → for parent managing action
- `useFormStatus` → for children reading status

**Key takeaway:** useFormStatus shares form submission state with child components automatically.

---

### Directives: 'use client' and 'use server'

**What they are:** Markers that tell React where code should run (client or server).

**'use server' directive:**
```javascript
// myserver.js
'use server'

// Everything in this file runs on server
export async function fetchSecrets() {
  // Safe: Database password never sent to client
  const password = process.env.DB_PASSWORD;
  const data = await db.query(password);
  return data;
}

// Can be imported by Client Components
// When called: Client makes request to server
```

**'use client' directive:**
```javascript
// In Next.js App Router, Server Components are default
// Mark specific components as Client Components (need hooks, events, browser APIs)

'use client'

import { useState } from 'react'; // Now available

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
```

**The boundary:**
```
Server Component (default in Next.js App Router)
  ├─ Can access database, secrets
  ├─ Passes data to Client Component
  └─ Client Component
      ├─ Receives data as props
      ├─ Uses hooks (useState, useEffect)
      ├─ Has event handlers
      └─ Cannot access secrets
```

**Key rules:**
- Server Components can import Server Actions
- Client Components can call Server Actions
- Cannot pass non-serializable objects (functions, classes) from Server → Client
- Can pass data (strings, numbers, arrays, objects)

**Real example:**
```javascript
// app/posts/page.js (Server Component by default)
import { PostList } from './post-list';
import { deletePost } from './actions';

export default async function PostsPage() {
  const posts = await db.posts.findAll(); // Server code
  
  return (
    <>
      <h1>Posts</h1>
      <PostList posts={posts} onDelete={deletePost} />
      {/* deletePost is Server Action, safe to pass */}
    </>
  );
}

// app/posts/post-list.js
'use client' // Needs event handlers

import { useTransition } from 'react';

export function PostList({ posts, onDelete }) {
  const [pending, startTransition] = useTransition();
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          {post.title}
          <button
            onClick={() => startTransition(() => onDelete(post.id))}
            disabled={pending}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
```

**When to use 'use server':**
- Any function that needs database/secret access
- Mutations (create, update, delete)
- Anything calling external APIs with credentials

**When to use 'use client':**
- Components with hooks (useState, useEffect)
- Components with event handlers (onClick, onChange)
- Components using browser APIs (localStorage, window)
- Components that need interactivity

**Common mistake:** Marking everything 'use client'. Default to Server Components. Only mark Client Components where needed.

**Key takeaway:** 'use server' marks server functions. 'use client' marks client components. Default is server in Next.js App Router.

---

### Improved Form Handling

**What's new:**
1. Forms can have `action` prop (Server Action)
2. `<input>` auto-clears after submission
3. Form elements accessible via FormData API
4. Progressive enhancement (works without JS)

**How it works:**
```javascript
'use server'
export async function addItem(formData) {
  const name = formData.get('name');
  const item = await db.items.create({ name });
  revalidatePath('/items');
  return item;
}

// Client
export function AddItemForm() {
  const [state, formAction, isPending] = useActionState(addItem, null);
  
  return (
    <form action={formAction}>
      <input
        name="name"
        type="text"
        placeholder="Item name"
        required
      />
      {/* Auto-clears after submission */}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Adding...' : 'Add Item'}
      </button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}
```

**Key improvements:**
- No need for `onSubmit` handler (action handles it)
- No need to `e.preventDefault()` (automatic)
- Form data passed to Server Action as FormData
- Automatic CSRF protection (built-in)
- Works without JavaScript (progressive enhancement)

**Progressive enhancement:**
```html
<!-- Without JavaScript, form still works -->
<form action="/api/add" method="POST">
  <input name="item" required />
  <button type="submit">Add</button>
</form>

<!-- With React 19, same form gets JS enhancement (instant feedback, optimistic updates) -->
```

**Key takeaway:** Forms can now target Server Actions directly. Automatic data handling, CSRF protection, progressive enhancement.

---

### React 19 Mental Model Shift

**Old React model:**
```
Client State → Component Re-render → DOM Update
     ↓
  fetch(API) → Update State → Re-render

Problems:
- Manage loading/error/success states manually
- Race conditions (old request returns after new)
- Cache invalidation manual
- API routes boilerplate
```

**React 19 model:**
```
Server Component renders data
     ↓
Server Action mutates data + revalidates
     ↓
Client Components call Server Actions
     ↓
useOptimistic shows instant feedback
     ↓
Server updates received, UI syncs

Benefits:
- Automatic revalidation
- Type-safe client-server boundary
- Zero API boilerplate
- Optimistic updates built-in
```

---

### Production Patterns with React 19

**Pattern 1: Form with validation**
```javascript
'use server'
export async function updateProfile(prevState, formData) {
  const email = formData.get('email');
  
  // Validation on server
  if (!email.includes('@')) {
    return { error: 'Invalid email' };
  }
  
  try {
    await db.users.update({ email });
    revalidatePath('/profile');
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
}

// Client
'use client'
export function ProfileForm({ currentEmail }) {
  const [state, formAction, isPending] = useActionState(updateProfile, null);
  
  return (
    <form action={formAction}>
      <input name="email" defaultValue={currentEmail} required />
      <button disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
      {state?.error && <p style={{ color: 'red' }}>{state.error}</p>}
      {state?.success && <p style={{ color: 'green' }}>Saved!</p>}
    </form>
  );
}
```

**Pattern 2: Optimistic list updates**
```javascript
'use server'
export async function addTodo(prevState, formData) {
  const text = formData.get('text');
  const todo = await db.todos.create({ text });
  revalidatePath('/todos');
  return { todos: [...prevState.todos, todo] };
}

'use client'
export function TodoApp({ initialTodos }) {
  const [state, formAction] = useActionState(addTodo, { todos: initialTodos });
  const [optimisticTodos, addOptimistic] = useOptimistic(state.todos, 
    (todos, newTodo) => [...todos, newTodo]
  );
  
  return (
    <form action={(formData) => {
      addOptimistic({ id: Date.now(), text: formData.get('text') });
      formAction(formData);
    }}>
      <input name="text" />
      <button>Add</button>
      <ul>
        {optimisticTodos.map(todo => <li key={todo.id}>{todo.text}</li>)}
      </ul>
    </form>
  );
}
```

---

### When to Use React 19 Features

| Feature | Use When | Don't Use When |
|---------|----------|----------------|
| `use()` | Reading promises/context in components | Simple sync values |
| `Server Actions` | Mutations, form submissions | Read-only queries |
| `useActionState` | Form submissions with Server Actions | useTransition-style scenarios |
| `useOptimistic` | Show instant feedback while server updates | Complex predictions |
| `useFormStatus` | Child component needs form status | Parent component (use useActionState) |
| `'use server'` | Database access, secrets, mutations | Client-side logic |
| `'use client'` | Hooks, events, browser APIs | Pure display components |

---

### React 19 Gotchas

1. **FormData serialization:** Objects/nested structures not serialized. Flatten or use JSON endpoint.

2. **Optimistic updates must be reversible:** If server fails, optimistic update reverts. Plan for this.

3. **Server Actions aren't RPC:** They're designed for forms/mutations. Large data payloads problematic.

4. **Type safety not automatic:** TypeScript doesn't magically know server action return type. Be explicit.

5. **Directives are file-level:** `'use client'` at top of file affects whole module (and imports).

---

### Production Reality with React 19

**This is the biggest React shift since Hooks.**

Before: "How do I fetch data?" → useEffect + fetch + state management nightmare

Now: Server Components + Server Actions → data flows naturally, mutations automatic

**Adoption timeline:**
- Next.js 13+ (App Router): Full support
- Remix: Full support
- Plain React: Server Actions coming, not fully here yet (needs framework)

**Truth:** If you're not using Next.js/Remix, React 19 features are incomplete. Most of value comes from framework integration.

**Key takeaway:** React 19 collapses client-server boundary. Server Actions eliminate API boilerplate. This is the future of React development.

---

## Real-World Patterns

### Data Fetching
**Why manual useEffect fetching is dangerous:**
- Race conditions: request 1 slower than request 2, stale data wins
- Stale closures: effect captures old URL, fetches wrong data
- Missing AbortController: old requests continue after unmount
- Loading/error states: state updates on unmounted component warnings
- Pagination/infinite scroll: manual implementation is complex
- Cache management: no deduplication, every dependency change = new request

**The "correct" manual way is still problematic:**
```javascript
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal })
    .then(r => r.json())
    .then(setData)
    .catch(e => !e.name === 'AbortError' && setError(e));
  return () => controller.abort();
}, [url]);
// Still fragile: what about POST requests? Optimistic updates? Refetching? Caching?
```

**Real solution:** Use server framework or data library
- **Next.js/Remix:** Built-in loaders, actions, revalidation. Avoid client-side fetch entirely.
- **TanStack Query (React Query v5+):** Cache, background sync, dedup, retry, pagination. Mature library.
- **SWR:** Lightweight, good for simple cases. Less powerful than Query.

**Server vs Client fetching:**
- Modern take: Fetch on server when possible (Next.js loaders, Remix actions, Suspense boundaries)
- Client fetching: Only for real-time data or user-triggered actions
- Mixing both requires careful cache coordination (Query + RSC is tricky)

**Critical production issues you'll hit:**
1. Race conditions (use timestamp or request ID to discard stale responses)
2. Infinite refetch loops (wrong dependency array + background refetch)
3. Cache invalidation (hardest problem in CS; libraries help)
4. Concurrent requests (browser limits parallel requests per domain; library handles queuing)

**Key takeaway:** Don't build data fetching. Use Next.js/Remix/framework loaders when possible. Use TanStack Query for client fetching. Never use raw useEffect for this.

---

### Form Handling
**Simple forms (2-3 fields):**
- Use `useState` for each field
- Manual onChange handlers
- Manual validation

**Complex forms (20+ fields, validation):**
- Use React Hook Form or Formik
- Handles state, validation, submission
- Error messages, touched fields
- Form reset, dynamic fields
- Way less boilerplate

**Key takeaway:** useState for simple. React Hook Form for complex. Don't build your own form logic.

---

### Large Lists (Virtualization)
**Problem:** Rendering 1000+ items in DOM = slow, memory hog.

**Solution:** Only render visible items in viewport.
- User scrolls list of 10,000 items
- Only 20 visible in viewport
- Virtualization renders only those 20 items
- As user scrolls, different 20 items render
- Result: smooth, instant scrolling

**Tools:**
- `react-window` (lightweight)
- `react-virtualized` (powerful)

**When to use:** 100+ items in list. 1000+ items = definitely.

**Key takeaway:** Virtualize large lists. Makes them instant even with thousands of items.

---

### Testing (Production Reality)
**The testing pyramid (actually works):**
```
        Manual testing / E2E (few tests)
      Integration tests (some tests)
    Unit tests (many tests, but selective)
```

**What to test (in priority order):**
1. **Critical user paths:** User registers, logs in, makes purchase. Use E2E (Cypress, Playwright).
2. **API contracts:** Your API returns what frontend expects. Integration tests or API mocks.
3. **Complex logic:** Selectors, reducers, utilities. Unit tests.
4. **Component rendering:** Only if complex (many branches, many states).

**What NOT to test:**
- Implementation details (internal state, props, function calls)
- "Simple" components that just render props
- Every possible permutation of props
- Testing for 100% coverage (chasing number, not value)

**React Testing Library truths:**
- **Do:** Query by role, label, text (user-perspective)
- **Don't:** Query by test-id everywhere (couples test to implementation)
- **Do:** Test behavior (click button → see result)
- **Don't:** Test that onClick handler was called (test the outcome instead)
- **Gotcha:** Testing Library encourages testing implementation less. Good philosophy, but async queries can be fragile if not careful.

**The painful lesson:** High test coverage ≠ good tests.
- I've seen 95% coverage with zero real bugs caught
- I've seen 20% coverage with engineers sleeping soundly
- Coverage tells you what you tested, not that it works
- Test the workflows that matter. Let implementation change.

**Real workflow testing:**
- Open form → fill fields → validation shows → submit → success toast → data appears in list
- Not: "Component renders" + "onChange fires" + "Button has right className"

**Performance testing:**
- Don't mock with Testing Library for perf tests (mocks hide real performance issues)
- Use Lighthouse, real device benchmarks, e2e performance tests
- Browser DevTools Profiler > unit test timings

**E2E testing (more important now):**
- Integration tests have value. Unit tests have value. But E2E catches real bugs.
- With Playwright/Cypress in CI: catch race conditions, browser bugs, real user scenarios
- Modern approach: Few good E2E tests > Many mediocre unit tests

**Key takeaway:** Test critical workflows, not implementations. E2E tests catch bugs unit tests miss. Coverage % is meaningless.

---

### Server-Side Rendering (SSR) and Next.js
**What SSR does:**
1. Server runs React component code
2. Generates HTML string
3. Sends HTML to browser
4. Browser renders HTML immediately (fast load time)
5. Browser downloads JavaScript
6. React "hydrates" (attaches event listeners to HTML)
7. App becomes interactive

**Benefits:**
- Faster initial page load (user sees HTML immediately)
- Better SEO (server sends fully rendered HTML to search engines)
- Can render on server based on URL

**Hydration mismatch:** Server renders one thing, browser renders another
- Example: Server uses different locale, generates different text
- Browser downloads JS, renders different text
- Causes console error, visual flicker

**Use Next.js:** Handles SSR, routing, optimization automatically.

**Key takeaway:** SSR = faster load + better SEO. Use Next.js for SSR.

---

### State Management Solutions
**Real hierarchy (based on 10+ years of production):**

**Level 1 - Do nothing, use server/framework:**
- Next.js Server Components: Move state to server (use layout/page loaders)
- Remix loaders/actions: Server handles data + mutations
- This eliminates 80% of client state problems
- Benefit: No client state bugs, faster initial load, simpler code

**Level 2 - Component state (useState):**
- UI state (form inputs, collapsed/expanded, tab selection)
- Single component concern (don't lift up unless necessary)
- Keep as local as possible
- If you find yourself lifting state up 3+ levels → use Context or go to Level 1

**Level 3 - Global but rarely changes (Context):**
- Theme, language, user identity
- Set at app boot, rarely changes
- Don't use for frequently updating data (causes re-render cascade)
- Split into multiple contexts by concern (theme context separate from user context)

**Level 4 - Global client state (Zustand > Redux):**
- Cart, filters, UI preferences that persist across pages
- Only use if Context doesn't work (too many re-renders)
- Zustand: 90% of teams should start here. Minimal boilerplate, DevTools, TypeScript great.
- Redux: For teams with 5+ engineers working on same state. Enforces structure. DevTools excellent but verbose.
- Jotai/Recoil: Atomic state. Good for complex UIs with many independent atoms. Overkill for most apps.

**Level 5 - Server state (TanStack Query):**
- API data, server cache, background sync
- Not "global state" — it's cache
- Use TanStack Query, not useState for server data
- Will save you from race conditions, stale data, cache management hell

**The truth:** Most apps only need Level 1 + Level 2 + tiny bit of Level 3. Complex apps add Level 4. Don't skip Level 1 (server/framework) and jump to fancy state management.

**Common mistake:** Using Context for frequently-changing data. Every change re-renders all consumers. Creates performance problems. If you find yourself memoizing context consumers, you chose wrong abstraction.

**Key takeaway:** Server first (Next.js/Remix). Then component state. Then Context for rarely-changing globals. Zustand only if Context becomes bottleneck. Never invent custom state management.

---

## Production Patterns (10+ Years Wisdom)

### Server Components and Modern Architecture
**The shift (React 19+):** Stop thinking "client-side React app" and start thinking "server-first, client-enhanced."

**Server Components (RSC):**
- Render on server, send HTML + minimal JS to client
- Access database directly, secrets safe
- Large dependencies don't ship to browser
- Zero JavaScript overhead for pure display components
- Can't use hooks, events, browser APIs (obviously)

**When to use:**
- Product lists, blog posts, any mostly-static content
- APIs that need database access
- Layouts and shared UI that wraps interactive parts

**When to use Client Components:**
- Forms, dropdowns, real-time updates
- Anything that needs user interaction or browser APIs
- Leaf components that are truly interactive

**Common mistake:** Making entire page a Server Component. Server Components are for the layout/wrapper level. Client Components inside them for interactivity.

**Real issue:** Mixing Server and Client Components requires understanding boundaries. Data flows from Server → Client fine. Client trying to pass data back to Server requires actions (framework-specific).

**Key takeaway:** With Next.js/Remix, default to Server Components. Use Client Components minimally for actual interactivity.

---

### Suspense and Error Boundaries (Not Just for Code Splitting)
**What actually works now:**
- Server-side rendering with streaming (HTML arrives in chunks)
- Progressive enhancement (HTML renders before JS loads)
- Nested suspense boundaries (different parts load at different times)

**What's still experimental:**
- Suspense with useEffect (not recommended yet)
- Use with router (Remix/Next.js App Router handles this)

**Error Boundaries + Suspense:**
- Error Boundary catches render errors
- Suspense boundary shows fallback during data loading
- Combine them: Error Boundary wraps Suspense (errors → show error UI, loading → show loading UI)

**Production pattern:**
```
<ErrorBoundary fallback={<ErrorPage />}>
  <Suspense fallback={<Loading />}>
    <DataComponent />
  </Suspense>
</ErrorBoundary>
```

**Key takeaway:** Suspense is for async operations in Server Components. In Client Components, still use loading states (Suspense with useEffect is not stable).

---

### Handling Errors Properly in Production
**Client vs Server errors:**
- Client: TypeError, network issues, user input mistakes
- Server: Database down, rate limited, business logic failures

**Pattern that works:**
- Catch errors at component boundary (Error Boundary for render errors)
- Catch in async operations (try-catch around fetch/queries)
- Show user-friendly messages (don't expose stack traces)
- Log errors for debugging (send to error tracking: Sentry, DataDog, etc.)

**Data fetching errors (with TanStack Query):**
- Query automatically retries (smart backoff)
- Fallback to stale data if available
- Show error UI only if retries exhausted
- Don't re-throw and break UI

**Validation errors (forms):**
- Client-side validation (quick feedback)
- Server-side validation (security, always)
- Show field-level errors (not generic "error occurred")
- Preserve form state on error (don't clear fields)

**Key takeaway:** Don't let errors crash UI. Handle gracefully. Log properly for debugging.

---

### Performance Optimization (Real Metrics)
**Stop optimizing for the wrong things:**
- Don't optimize component render time (usually not the bottleneck)
- Don't optimize JavaScript size if main issue is backend latency
- Don't memo everything (adds overhead)
- Don't create unnecessary state (keeps renders low naturally)

**Actually measure (use Lighthouse, WebPageTest, real devices):**
- Core Web Vitals: LCP (load), INP (interaction), CLS (layout shift)
- User-centric: Does page feel fast? Is it responsive?
- Business metrics: Do users convert, or bounce?

**Real optimization strategies:**
1. **Server rendering:** Fastest way to improve LCP (render HTML on server)
2. **Code splitting:** Load only code needed per page
3. **Image optimization:** 80% of slowness is images
4. **Database queries:** Slow API = slow page (optimize backend first)
5. **Caching:** Browser cache, HTTP cache, database cache (in that order)

**React-specific optimizations (in priority):**
1. Avoid making state global unnecessarily (limits re-render scope)
2. Keep effects dependencies tight (don't re-run unnecessarily)
3. Use server rendering (eliminates client render time)
4. Code split by route (load less JavaScript)
5. Memoization (only if profiler shows actual bottleneck)

**The 80/20:** Most performance gains come from server rendering + image optimization. Stop optimizing React code and start optimizing infrastructure.

**Key takeaway:** Measure real metrics. Optimize infrastructure first. React optimization is last 20% effort for 5% gain usually.

---

### Debugging Production Issues
**Best tools:**
- Browser DevTools (your primary tool)
- React DevTools Profiler (find component render bottlenecks)
- Network tab (inspect API calls, timing)
- Error tracking (Sentry, DataDog - see real errors users hit)
- Session replay (LogRocket - watch user's screen during error)

**Common production bugs and how to find them:**
1. **"This works in dev but not in production"**
   - Check: NODE_ENV=production build process, different API URLs, error logging showing real errors
   
2. **"Stale data showing after update"**
   - Check: Cache invalidation in React Query/data layer, race conditions with timing
   - Solution: Set staleTime properly, revalidate after mutations
   
3. **"Form keeps losing state"**
   - Check: Uncontrolled vs controlled mismatch, form reset happening unexpectedly
   - Use React DevTools to see what state is at each render
   
4. **"It's slow for this one user"**
   - Could be: Low device specs, network latency, large dataset, browser extension interference
   - Solution: Test on real devices, check user's network speed with DevTools throttling

**Key takeaway:** Measure in production with real data and real users. Bugs in dev environment are not bugs.

---

## Common Pitfalls & Debugging

### Missing useEffect Dependencies
**The mistake:** Use variable in effect but omit from dependency array. Effect runs with stale value forever.

**Example:**
```javascript
useEffect(() => {
  fetch(`/api/user/${userId}`);
}, []); // userId missing!
// userId is always the INITIAL value, never updates
// If userId changes from 1 → 2, still fetches user 1
```

**Why it happens:**
- Developer thinks "I only want this to run once" (wrong reasoning)
- Ignores ESLint warning (risky)
- Works during initial render, breaks when dependency changes
- Debugging nightmare: "why is it showing old data?"

**Consequences:**
- Wrong API calls with outdated values
- Stale subscriptions that never update
- Data never refreshes when props change
- Hours of "but it works in dev!" debugging

**Proper solution:** Include all dependencies AND design effect correctly
```javascript
// Right: dependency ensures effect re-runs when userId changes
useEffect(() => {
  fetch(`/api/user/${userId}`);
}, [userId]); // included!
```

**Better solution:** Don't use useEffect for data fetching at all
- Move to server (Next.js loader, Remix action)
- Use TanStack Query (handles dependencies automatically)

**Tool:** ESLint `react-hooks/exhaustive-deps` catches this. Don't ignore warnings.

**Production reality:** This is THE most common useEffect bug. Every team has shipped this. It's why raw useEffect data fetching is now considered an anti-pattern.

**Key takeaway:** Include all dependencies. Better: use server framework or React Query instead of raw useEffect.

---

### Infinite useEffect Loops
**Problem:** Dependency in useEffect changes every render, so effect runs every render, which changes dependency, which runs effect again...

**Example:**
```javascript
const obj = { count: 5 }; // new object every render
useEffect(() => {
  setData(obj);
}, [obj]); // runs every render because obj is new every render
// setData triggers re-render
// new obj created
// effect runs again (infinite loop!)
```

**Solution:** Memoize the dependency with `useMemo`

**Key takeaway:** Object/array dependencies change every render = infinite loop.

---

### Memory Leaks
**Problem:** Component sets up subscription/listener but never cleans up. Even after component unmounts, subscription still runs.

**Example:**
```javascript
useEffect(() => {
  const timer = setInterval(() => setData(newData), 1000);
  // forgot to cleanup!
}, []);
// Component unmounts
// Timer still running, still calling setData
// Warning: memory leak!
```

**Solution:** Return cleanup function from useEffect

**Key takeaway:** Always cleanup (unsubscribe, cancel timers, remove listeners).

---

### Stale Closures
**Problem:** Async code (setTimeout, Promise) captures variable value from time it was created, not time it runs.

**Example:**
```javascript
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setTimeout(() => {
      console.log(count); // always logs 0!
    }, 1000);
  };

  // Click button when count=0
  // Quickly change count to 5
  // Wait 1 second
  // Logs 0 (stale value!)
}
```

**Solution:**
- Use functional updates: `setCount(prev => prev + 1)`
- Or add dependency to useEffect: `useEffect(() => {...}, [count])`

**Key takeaway:** Async code captures old state value. Use functional updates.

---

### Props Mutation
**Problem:** Trying to change props directly. Props are read-only.

**Wrong:**
```javascript
function User({ user }) {
  user.name = 'John'; // DON'T DO THIS
  return <div>{user.name}</div>;
}
```

**Why it's wrong:**
- Props are passed from parent
- Mutating them breaks parent component
- React won't see change, won't re-render
- Unpredictable behavior

**Right:**
```javascript
function User({ user }) {
  const [name, setName] = useState(user.name);
  // Now you own the state
}
```

**Key takeaway:** Props are read-only. Copy to state if you need to modify.

---

### Key Changing During Render
**Problem:** Generating key dynamically in render function.

**Wrong:**
```javascript
{items.map((item, i) => (
  <div key={Math.random()}> // new key every render!
    {item}
  </div>
))}
```

**Consequences:** Every render thinks items are new, loses state/focus.

**Right:** Use stable, unique ID

**Key takeaway:** Keys must be stable. Never generate in render.

---

### Comparing Objects/Arrays with Shallow Comparison
**Problem:** React.memo uses shallow comparison. Two objects with same content = different reference = re-render.

**Example:**
```javascript
const Button = React.memo(({ style }) => <button style={style}>Click</button>);

function App() {
  return <Button style={{ color: 'red' }} />; // new object every render!
}
// Every render: new style object
// React.memo sees different object
// Button re-renders even though style is same
```

**Solution:** Memoize object with `useMemo`

**Key takeaway:** Object/array props need useMemo to be stable for React.memo.

---

### Forgetting to Return Cleanup Function
**Problem:** Subscribe but forget to unsubscribe in cleanup.

**Example:**
```javascript
useEffect(() => {
  const subscription = firebase.subscribe(() => setData(data));
  // forgot return cleanup!
}, []);
// User leaves page
// Subscription still active
// Firebase still sending data
// Memory leak
```

**Solution:**
```javascript
useEffect(() => {
  const subscription = firebase.subscribe(() => setData(data));
  return () => subscription.unsubscribe(); // cleanup!
}, []);
```

**Key takeaway:** Subscriptions need cleanup function to unsubscribe.

---

## Interview Tips

### How to Answer React Questions (10+ Years Perspective)

**The formula that works:**
1. **Answer directly** (1 sentence)
2. **Explain why it matters** (not why React does it, why YOU should care)
3. **When/when-not to use** (tradeoffs, not just benefits)
4. **Real example** (not hypothetical)
5. **Show wisdom** (what you learned from experience)

**Example (bad vs good):**

**Bad:** "React.memo prevents re-renders. You use it when component is expensive and props don't change often."
- Missing: Why it matters, when it's not useful, real example

**Good:** "React.memo skips re-render if props are identical. Uses shallow comparison.

Why it matters? Most React performance problems aren't memo-related, so don't use it first. But when your List has 100 items and parent re-renders, memo prevents useless renders of stable items.

When to use: Only if (1) component render is genuinely expensive, (2) props often don't change. Must pair with useCallback/useMemo—otherwise memo is pointless overhead.

When NOT to use: Cheap components (memo overhead > benefit), components where props always change (memo wasted).

I optimized a dashboard with 100 metric cards. Initial approach: memo everything. Didn't help. Actual problem: metrics updating every second, causing parent re-render, causing all 100 cards to re-render. Solution: Separate state for metrics (updates in isolation) + memo. Reduced from 100 re-renders per update to 5.

The wisdom: Always measure. 90% of React performance problems aren't React—they're server latency, N+1 queries, or bad state architecture."

**Why this answer wins:**
- Direct, not verbose
- Shows understanding of why, not just what
- Admits when it's NOT useful (confidence)
- Real production example (not hypothetical)
- Shows learning mindset (measured, found root cause)

---

### Interview Questions You WILL Get

**"Explain useEffect dependencies"**
- Don't: "Include all variables used in effect"
- Do: Explain that missing deps = stale closures + wrong data. Show why it matters with example. Mention ESLint exhaustive-deps.

**"How do you fetch data in React?"**
- Don't: "useEffect with fetch"
- Do: "Use server framework (Next.js, Remix) or TanStack Query. If forced to use useEffect: need AbortController, cleanup, retry logic. Too complex—that's why Query exists."

**"What's the difference between useCallback and useMemo?"**
- Explain: useCallback memoizes function, useMemo memoizes value. Both add overhead. Both need correct dependency array.
- The wisdom: Neither are needed for most code. Only use if you've actually measured a performance problem.

**"How do you structure a large React application?"**
- Don't: List folder structure
- Do: "Server components for layout, client components for interactivity. Server state in database. Client state in Zustand or Context (rarely needed). Use code splitting by route. File organization follows feature boundaries, not file types."

**"How do you handle errors in React?"**
- Error Boundaries for render errors
- Try-catch in async operations
- Log to error tracking (Sentry)
- Show user-friendly messages
- Don't expose stack traces

---

### Red Flags Interviewers Look For

**What NOT to say:**
1. "I always use [tool]" → Shows no judgment, no tradeoffs
2. "I use Context for state management" → Signals you don't understand Context limitations
3. "Just add React.memo everywhere" → Premature optimization mindset
4. "I don't need to measure, I know it's slow" → Guessing instead of data
5. "Virtual DOM is faster than real DOM" → Misunderstanding VDOM purpose
6. "useEffect runs before render" → Wrong (it runs after)
7. "Props are mutable, just change them" → Fundamental misunderstanding
8. "Use array index as key in lists, it's fine" → Knows it's wrong, doesn't care
9. "Testing is optional" → Shows poor engineering standards
10. "I don't use TypeScript" → In 2026, this raises questions

**What shows expertise:**
- "I measured first, found the real bottleneck"
- "That works but here's why it's a problem at scale"
- "I didn't know that, how would you approach it?"
- "There's a tradeoff here: X vs Y, I'd choose X because..."
- "We learned the hard way that..."
- "In production, we hit this issue: [example]"

### Common Interview Topics to Prepare

**Core questions:**
- Virtual DOM and reconciliation (why it's fast)
- Component lifecycle (hooks vs class)
- State vs Props (immutability)
- Hooks rules (top level only)

**Real-world questions:**
- How to handle data fetching (React Query)
- Form handling (controlled components)
- Performance optimization (what to measure)
- State management (when to use Context vs Redux)

**Problem-solving:**
- Fix memory leak
- Fix infinite loop
- Fix stale data
- Optimize slow component

**Architecture questions:**
- How to structure large app
- Component composition patterns
- File organization
- Scaling problems

---

## What's Actually Worth Learning in 2026

**Essential (foundation):**
- Functional components + hooks (useState, useEffect)
- Component composition and props
- State management basics (server vs client state)
- Simple data fetching patterns

**Important (production):**
- Server Components and SSR (Next.js, Remix)
- Error boundaries and error handling
- TanStack Query for async state
- TypeScript (required by most teams)
- Testing critical user paths (E2E > unit tests)

**Nice to have (context-dependent):**
- Advanced hook patterns (useReducer, useContext, custom hooks)
- Performance optimization (only after measuring)
- Advanced TypeScript
- Zustand/Redux (only if your app needs it)
- Suspense (still evolving, not critical yet)

**You can skip (outdated or rare):**
- Class components (functional + hooks replaced them)
- Redux (Zustand better for most cases)
- HOCs (custom hooks better)
- Render props (custom hooks better)
- Manual data fetching with useEffect (use TanStack Query)
- Memorization mania (profile first)

---

## The 10+ Years Wisdom

**What I wish I knew starting out:**

1. **React is not magic:** It's just JavaScript calling functions. The "magic" (diffing, batching) matters less than you think. Understand principles, not details.

2. **Premature optimization is the root of all evil:** I spent years optimizing things that didn't matter. Measure first. Always. Profile shows the truth; gut feeling is wrong.

3. **State is the hardest part:** Not React, not JavaScript. WHERE state lives and HOW it changes determines everything. A well-structured state makes React invisible. Bad state makes it hell.

4. **Server rendering is underrated:** Moved most problems to server. Rendered HTML on server = faster load, simpler code, fewer bugs. This shift (Next.js, Remix) is bigger than hooks were.

5. **Testing is not about coverage:** I've seen 95% coverage with zero bugs caught. I've seen 20% coverage with engineers sleeping well. Test workflows, not implementations. E2E > unit.

6. **React is shrinking:** Modern React (Server Components) means less JavaScript, less client-side state, smaller bundles. Framework (Next.js/Remix) is more important than React library itself.

7. **TypeScript saves hours:** Every team I've worked with that adopted TypeScript earlier shipped faster and with fewer bugs. The upfront cost pays back immediately.

8. **Errors in production are real:** Local dev environment != production. Real data, real network conditions, real users reveal bugs that tests miss. Error tracking (Sentry) is mandatory.

9. **Micro-optimizations are a trap:** Stop optimizing component render time. Start optimizing backend queries, image size, server latency. That's where 95% of slowness lives.

10. **Simplicity scales better than cleverness:** Most "clever" React code I've seen becomes technical debt. Simple components, clear data flow, boring code ships faster and breaks less.

**If starting a new project today (2026):**
- Use Next.js or Remix (not bare React)
- Default to Server Components
- Use TanStack Query for APIs
- TypeScript from day one
- Test with Playwright (E2E)
- Don't memo anything until profiler screams
- Keep client code minimal
- Put complexity on server

**Interview position:** Experienced candidate can explain not just WHAT works, but WHY it works and WHEN to use it. Can cite real production issues. Understands tradeoffs. This is what separates seniors from juniors—wisdom, not syntax.

---

**Level:** Intermediate-Advanced + 10+ Years Production Wisdom | **Updated:** 2026-08-16
