# Node.js Event Loop - Complete Interview Guide

## Table of Contents
1. [Overview](#overview)
2. [Event Loop Phases](#event-loop-phases)
3. [Call Stack vs Callback Queue](#call-stack-vs-callback-queue)
4. [Microtask Queue vs Callback Queue](#microtask-queue-vs-callback-queue)
5. [process.nextTick() vs setImmediate()](#processnexttick-vs-setimmediate)
6. [Visual Diagrams](#visual-diagrams)
7. [Code Examples](#code-examples)
8. [Interview Questions](#interview-questions)

---

## Overview

Node.js is **single-threaded** but **non-blocking**. The **Event Loop** is the heart of Node.js that allows it to handle multiple operations asynchronously despite running on a single thread.

**Key Concept:** The Event Loop continuously checks if there are tasks to execute, processes them in phases, and keeps JavaScript non-blocking.

### Why Event Loop Matters
- Enables async/await, Promises, callbacks to work
- Prevents blocking operations from freezing the app
- Manages I/O operations (file reads, network requests, timers)
- Critical for understanding performance bottlenecks

---

## Event Loop Phases

The Event Loop cycles through **6 main phases** in order:

### Phase 1: **Timers Phase**
- Executes callbacks scheduled by `setTimeout()` and `setInterval()`
- The event loop checks if any timers have completed
- Callbacks are moved to the call stack and executed

```
┌───────────────────────────┐
│  1. TIMERS                │
│  - setTimeout callbacks   │
│  - setInterval callbacks  │
└───────────────────────────┘
```

**Example:**
```javascript
setTimeout(() => console.log('Timer'), 100);
// Waits in timers phase until 100ms passes
```

---

### Phase 2: **Pending Callbacks (I/O Callbacks)**
- Executes deferred I/O callbacks from the previous cycle
- Not all I/O callbacks happen in poll phase - some are deferred to next cycle

```
┌───────────────────────────┐
│  2. PENDING CALLBACKS     │
│  - I/O operation results  │
│  - System errors          │
└───────────────────────────┘
```

**Example:**
```javascript
fs.readFile('file.txt', (err, data) => {
  // Callback executed in pending callbacks phase
});
```

---

### Phase 3: **Idle/Prepare**
- Internal Node.js use only
- Prepares for next phase (poll)

```
┌───────────────────────────┐
│  3. IDLE/PREPARE          │
│  - Internal use           │
│  - Preparation            │
└───────────────────────────┘
```

---

### Phase 4: **Poll Phase (Most Important)**
- Retrieves new I/O events
- Executes I/O-related callbacks (except close callbacks)
- This is where most of the time is spent
- **If poll queue is empty:** waits for new I/O events

```
┌───────────────────────────┐
│  4. POLL                  │
│  - Retrieve I/O events    │
│  - Execute I/O callbacks  │
│  - May wait here          │
└───────────────────────────┘
```

**Behavior:**
- If there are timers or setImmediate callbacks waiting, immediately move to check phase
- Otherwise, wait for new I/O events

**Example:**
```javascript
const server = http.createServer((req, res) => {
  // Callback executed in poll phase
  res.end('Hello');
});
```

---

### Phase 5: **Check Phase**
- Executes callbacks scheduled by `setImmediate()`
- Always runs after poll phase

```
┌───────────────────────────┐
│  5. CHECK                 │
│  - setImmediate callbacks │
└───────────────────────────┘
```

**Example:**
```javascript
setImmediate(() => console.log('Check phase'));
```

---

### Phase 6: **Close Phase**
- Executes close callbacks
- Socket close events, stream.on('close')

```
┌───────────────────────────┐
│  6. CLOSE                 │
│  - socket.on('close')     │
│  - stream close callbacks │
└───────────────────────────┘
```

**Example:**
```javascript
socket.on('close', () => {
  // Executed in close phase
});
```

---

## Call Stack vs Callback Queue

### Call Stack
- **Data Structure:** LIFO (Last In, First Out)
- **Purpose:** Tracks function execution
- **Size:** Limited
- **When Full:** Stack overflow error
- **Speed:** Immediate execution (synchronous)

```javascript
function a() {
  console.log('Start a');
  b();
  console.log('End a');
}

function b() {
  console.log('In b');
}

a();

// Stack Execution Order:
// 1. a() pushed → console.log 'Start a' → b() pushed
// 2. b() pushed → console.log 'In b' → b() popped
// 3. console.log 'End a' → a() popped
```

### Callback Queue
- **Data Structure:** FIFO (First In, First Out)
- **Purpose:** Holds async callbacks
- **When Used:** After async operations complete (setTimeout, I/O)
- **Speed:** Executed after call stack is empty

```javascript
console.log('Start');

setTimeout(() => {
  console.log('Async callback');
}, 0);

console.log('End');

// Execution Order:
// Call Stack: 'Start' → 'End' (both sync)
// Callback Queue: 'Async callback' (after stack empty)
// Output:
// Start
// End
// Async callback
```

**Key Rule:** Callbacks in queue only execute when **call stack is completely empty**.

---

## Microtask Queue vs Callback Queue

### Microtask Queue
- **Higher Priority** than callback queue
- **What Goes Here:** Promises, `process.nextTick()`
- **When Executed:** After current operation, before next phase
- **Important:** ALL microtasks executed before moving to next event loop phase

### Callback Queue (Macrotask Queue)
- **Lower Priority** than microtask queue
- **What Goes Here:** setTimeout, setInterval, I/O callbacks
- **When Executed:** After microtasks cleared, during event loop phases

### Execution Order (CRITICAL)
```
1. Call Stack (execute all sync code)
2. Microtask Queue (process.nextTick, Promises)
3. Render (if needed)
4. Callback Queue (setTimeout, I/O callbacks)
5. Repeat
```

### Visual Representation
```
┌─────────────────────────────────────┐
│  Call Stack (Synchronous)           │
│  ↓ (when empty)                     │
│  Microtask Queue (Promises, nextTick)│
│  ↓ (when empty)                     │
│  Callback Queue (Timers, I/O)       │
└─────────────────────────────────────┘
```

---

## process.nextTick() vs setImmediate()

### process.nextTick()
- **Queue:** Microtask Queue
- **When Runs:** Immediately after current operation
- **Priority:** Highest
- **Phase:** Runs between phases, not during a specific phase

```javascript
process.nextTick(() => {
  console.log('nextTick');
});

console.log('Start');
// Output: Start, nextTick
```

### setImmediate()
- **Queue:** Callback Queue (Check Phase)
- **When Runs:** During check phase of next event loop iteration
- **Priority:** Lower than process.nextTick()
- **Phase:** Check phase

```javascript
setImmediate(() => {
  console.log('setImmediate');
});

console.log('Start');
// Output: Start, setImmediate
```

### Comparison Table

| Feature | process.nextTick() | setImmediate() |
|---------|-------------------|-----------------|
| Queue | Microtask | Callback |
| Priority | Highest | Lower |
| Phase | Between phases | Check |
| When | After current code | Next iteration |
| Use Case | Cleanup, deferred tasks | Less critical tasks |

### Critical Example

```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

process.nextTick(() => {
  console.log('3');
});

Promise.resolve().then(() => {
  console.log('4');
});

console.log('5');

// OUTPUT:
// 1 (sync)
// 5 (sync)
// 3 (process.nextTick - microtask)
// 4 (Promise - microtask)
// 2 (setTimeout - callback queue)
```

---

## Visual Diagrams

### Complete Event Loop Flow

```
┌─────────────────────────────────────────────────┐
│             EVENT LOOP CYCLE                     │
└─────────────────────────────────────────────────┘

START
  ↓
┌─────────────────────────────────────┐
│  1. TIMERS PHASE                    │
│  Execute setTimeout/setInterval     │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│  Check Microtask Queue              │
│  (process.nextTick, Promises)       │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│  2. PENDING CALLBACKS PHASE         │
│  Execute I/O callbacks              │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│  Check Microtask Queue              │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│  3. IDLE/PREPARE (Internal)         │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│  4. POLL PHASE                      │
│  Retrieve I/O events, wait if empty │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│  Check Microtask Queue              │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│  5. CHECK PHASE                     │
│  Execute setImmediate callbacks     │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│  Check Microtask Queue              │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│  6. CLOSE PHASE                     │
│  Execute close callbacks            │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│  Check Microtask Queue              │
└─────────────────────────────────────┘
  ↓
REPEAT (if there are more tasks)
```

---

## Code Examples

### Example 1: Complete Order Demonstration

```javascript
console.log('Script Start');

setTimeout(() => {
  console.log('setTimeout 1');
  Promise.resolve().then(() => console.log('Promise in setTimeout'));
}, 0);

Promise.resolve()
  .then(() => {
    console.log('Promise 1');
    setTimeout(() => console.log('setTimeout in Promise'), 0);
  })
  .then(() => {
    console.log('Promise 2');
  });

process.nextTick(() => {
  console.log('nextTick');
});

setImmediate(() => {
  console.log('setImmediate');
});

console.log('Script End');

/*
OUTPUT:
Script Start
Script End
nextTick (microtask - process.nextTick)
Promise 1 (microtask - Promise.then)
Promise 2 (microtask - Promise.then continuation)
setTimeout 1 (callback - timers phase)
Promise in setTimeout (microtask after setTimeout)
setImmediate (callback - check phase)
setTimeout in Promise (callback - timers phase next iteration)
*/
```

### Example 2: I/O Operations

```javascript
const fs = require('fs');

console.log('Start');

fs.readFile('file.txt', () => {
  console.log('File read');
});

setImmediate(() => {
  console.log('setImmediate');
});

process.nextTick(() => {
  console.log('nextTick');
});

console.log('End');

/*
OUTPUT:
Start
End
nextTick (microtask)
setImmediate (check phase)
File read (poll phase - after check)
*/
```

### Example 3: Blocking Operations

```javascript
// BLOCKING (DON'T DO THIS IN PRODUCTION)
function blockingOperation() {
  const start = Date.now();
  while (Date.now() - start < 5000) {
    // Blocks event loop for 5 seconds
  }
}

console.log('Start');

setTimeout(() => {
  console.log('Timeout - will wait 5+ seconds');
}, 100);

blockingOperation(); // Blocks event loop

console.log('End');

// The timeout will only execute after blockingOperation completes
// This shows how the event loop is blocked by sync code
```

---

## Interview Questions

### Q1: What is the Event Loop?
**Answer:** The Event Loop is Node.js's mechanism for handling asynchronous operations. It continuously checks if there are tasks to execute, processes them in phases (Timers, Pending Callbacks, Poll, Check, Close), and allows JavaScript to be non-blocking despite being single-threaded.

### Q2: How many phases does the Event Loop have?
**Answer:** 6 main phases:
1. Timers (setTimeout/setInterval)
2. Pending Callbacks (deferred I/O)
3. Idle/Prepare (internal)
4. Poll (retrieve I/O events)
5. Check (setImmediate)
6. Close (close callbacks)

### Q3: What's the difference between process.nextTick() and setImmediate()?
**Answer:**
- **process.nextTick()**: Executes in microtask queue, runs immediately after current operation, highest priority
- **setImmediate()**: Executes in check phase of next event loop iteration, lower priority

### Q4: What is the order of execution for Promises, setTimeout, and process.nextTick()?
**Answer:**
1. Synchronous code (call stack)
2. process.nextTick() (microtask)
3. Promises (microtask)
4. setTimeout (callback queue - timers phase)
5. setImmediate (callback queue - check phase)

### Q5: Can you explain the Call Stack and Callback Queue?
**Answer:**
- **Call Stack**: LIFO data structure tracking function execution. Synchronous code executes here.
- **Callback Queue**: FIFO queue holding async callbacks. Executes only when call stack is empty.

### Q6: What is the Microtask Queue and when is it processed?
**Answer:** The Microtask Queue holds high-priority async tasks (Promises, process.nextTick()). It's processed after the call stack is empty but before the event loop moves to the next phase. All microtasks are executed before any callback queue tasks.

### Q7: Explain what happens in the Poll Phase
**Answer:** The Poll Phase retrieves new I/O events and executes their callbacks. If there are no new I/O events and no timers/setImmediate callbacks, the event loop waits here. Once timers or setImmediate callbacks arrive, it moves to the Check phase.

### Q8: Why is the Event Loop important in Node.js?
**Answer:**
- Enables non-blocking I/O operations
- Allows handling multiple connections with single thread
- Makes async/await and Promises possible
- Critical for building scalable server applications
- Understanding it helps identify performance bottlenecks

---

## Key Takeaways

1. **Event Loop makes Node.js non-blocking** - Single thread, multiple operations
2. **Phases matter** - Execution order depends on which phase schedules the callback
3. **Microtasks have priority** - process.nextTick() and Promises run before setTimeout
4. **Don't block the event loop** - Heavy computation blocks everything
5. **Order is: Timers → Pending → Poll → Check → Close** (with microtask checks between)

---

## Practice Problem

```javascript
// What will be the output?
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => {
  console.log('3');
  process.nextTick(() => console.log('4'));
});

setImmediate(() => console.log('5'));

process.nextTick(() => console.log('6'));

console.log('7');

// Answer: 1, 7, 6, 3, 4, 2, 5
```

---

**Master the Event Loop = Master Node.js Performance**
