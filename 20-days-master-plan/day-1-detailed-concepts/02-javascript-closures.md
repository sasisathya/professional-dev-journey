# JavaScript Closures - Complete Interview Guide

## Table of Contents
1. [Definition](#definition)
2. [How Closures Work](#how-closures-work)
3. [Lexical Scope](#lexical-scope)
4. [Closure Creation](#closure-creation)
5. [Use Cases](#use-cases)
6. [Memory & Performance](#memory--performance)
7. [Interview Questions](#interview-questions)
8. [Practice Problems](#practice-problems)

---

## Definition

**Closure:** A function that has access to variables from its outer (enclosing) function's scope, even after the outer function has finished executing. The inner function "closes over" its environment.

### Key Insight
```javascript
function outer() {
  let message = 'Hello'; // Variable in outer scope

  function inner() {
    console.log(message); // inner can access message
  }

  return inner;
}

const closure = outer();
closure(); // Output: 'Hello'
// Even after outer() finished, inner still has access to message
```

---

## How Closures Work

### The Three Scopes

```javascript
// 1. GLOBAL SCOPE
var globalVar = 'I am global';

function outer() {
  // 2. OUTER FUNCTION SCOPE
  var outerVar = 'I am outer';

  function inner() {
    // 3. INNER FUNCTION SCOPE
    var innerVar = 'I am inner';

    // Can access all three scopes
    console.log(globalVar);  // ✓
    console.log(outerVar);   // ✓
    console.log(innerVar);   // ✓
  }

  inner();
}

outer();
```

### Scope Chain

```
inner function {
  scope: [innerVar]
    ↓ (not found, look up)
  outer function {
    scope: [outerVar]
      ↓ (not found, look up)
    global scope {
      scope: [globalVar]
        ↓ (if not found)
      undefined (or error in strict mode)
    }
  }
}
```

### Variable Lookup Process

```javascript
function outer() {
  var x = 10;

  function middle() {
    var y = 20;

    function inner() {
      var z = 30;
      console.log(x + y + z); // 10 + 20 + 30 = 60
      // 1. Check inner scope for x → not found
      // 2. Check middle scope for x → not found
      // 3. Check outer scope for x → FOUND = 10
      // 4. Repeat for y → found in middle
      // 5. Repeat for z → found in inner
    }

    inner();
  }

  middle();
}

outer();
```

---

## Lexical Scope

**Lexical Scope** means that the accessibility of variables is determined by the position of the variables in the source code (static analysis), not by the runtime call stack.

### Inner Functions Can Access Outer Variables

```javascript
function outer() {
  let x = 'outer';

  function inner() {
    console.log(x); // Can access x from outer
  }

  inner();
}
```

### Outer Functions CANNOT Access Inner Variables

```javascript
function outer() {
  function inner() {
    let x = 'inner';
  }

  inner();
  console.log(x); // ❌ ReferenceError: x is not defined
}
```

### Determined at Definition Time, NOT Call Time

```javascript
let x = 'global';

function a() {
  let x = 'in a';

  function b() {
    console.log(x);
  }

  return b;
}

let x = 'outer scope'; // This doesn't matter
let func = a();
func(); // Output: 'in a' (not 'outer scope')
// Because b was defined inside a, so it refers to a's x
```

---

## Closure Creation

### What Creates a Closure?

Whenever a function is created, it automatically has access to the scope in which it was created. That is the essence of a closure.

### Returning a Function

```javascript
function createAdder(x) {
  return function(y) {
    return x + y; // Closure: function remembers x
  };
}

const add5 = createAdder(5);
console.log(add5(3)); // 8
console.log(add5(10)); // 15
// Even after createAdder() finished, the returned function
// still has access to x
```

### Function Inside Loop

```javascript
function createFunctions() {
  const functions = [];

  for (var i = 0; i < 3; i++) {
    functions.push(function() {
      return i;
    });
  }

  return functions;
}

const funcs = createFunctions();
console.log(funcs[0]()); // 3 (not 0!)
console.log(funcs[1]()); // 3 (not 1!)
console.log(funcs[2]()); // 3 (not 2!)

// WHY? All functions created in the loop share the SAME i variable
// By the time any function executes, i has become 3
```

#### Fix 1: Use let (Block Scope)

```javascript
function createFunctions() {
  const functions = [];

  for (let i = 0; i < 3; i++) { // Use let instead of var
    functions.push(function() {
      return i; // Each iteration gets its own i
    });
  }

  return functions;
}

const funcs = createFunctions();
console.log(funcs[0]()); // 0 ✓
console.log(funcs[1]()); // 1 ✓
console.log(funcs[2]()); // 2 ✓
```

#### Fix 2: IIFE (Immediately Invoked Function Expression)

```javascript
function createFunctions() {
  const functions = [];

  for (var i = 0; i < 3; i++) {
    functions.push(
      (function(j) { // IIFE captures current i
        return function() {
          return j;
        };
      })(i)
    );
  }

  return functions;
}

const funcs = createFunctions();
console.log(funcs[0]()); // 0 ✓
console.log(funcs[1]()); // 1 ✓
console.log(funcs[2]()); // 2 ✓
```

---

## Use Cases

### 1. Data Privacy (Private Variables)

```javascript
function createCounter() {
  let count = 0; // Private variable

  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    getCount() {
      return count;
    }
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.decrement()); // 1
console.log(counter.count); // undefined (private!)

// count is not accessible directly, only through methods
```

### 2. Function Factory

```javascript
function createMultiplier(multiplier) {
  return function(x) {
    return x * multiplier;
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15
```

### 3. Function Currying

```javascript
function multiply(a) {
  return function(b) {
    return function(c) {
      return a * b * c;
    };
  };
}

const result = multiply(2)(3)(4); // 24

// Or partially apply
const multiplyBy2 = multiply(2);
const multiplyBy2And3 = multiplyBy2(3);
console.log(multiplyBy2And3(4)); // 24
```

### 4. Module Pattern

```javascript
const calculator = (function() {
  // Private variables
  let result = 0;

  // Private function
  function logOperation(operation, operand) {
    console.log(`${operation}: ${operand}`);
  }

  // Public API
  return {
    add(x) {
      logOperation('Add', x);
      result += x;
      return this;
    },
    subtract(x) {
      logOperation('Subtract', x);
      result -= x;
      return this;
    },
    multiply(x) {
      logOperation('Multiply', x);
      result *= x;
      return this;
    },
    getResult() {
      return result;
    }
  };
})();

calculator.add(5).subtract(2).multiply(3);
console.log(calculator.getResult()); // 9
```

### 5. Event Listeners with Data

```javascript
function setupListeners() {
  const buttons = document.querySelectorAll('button');

  buttons.forEach((button, index) => {
    button.addEventListener('click', function() {
      console.log(`Button ${index + 1} clicked`);
      // Each listener closes over its own index
    });
  });
}

setupListeners();
```

### 6. Callbacks with Context

```javascript
function createUser(name) {
  return {
    getName() {
      return name; // Closure over name
    },
    getGreeting() {
      return `Hello, I am ${name}`; // Closure over name
    }
  };
}

const user1 = createUser('Alice');
const user2 = createUser('Bob');

console.log(user1.getName()); // Alice
console.log(user2.getName()); // Bob
// Each user object closes over its own name
```

---

## Memory & Performance

### Memory Implications

Closures keep references to outer function variables. If the variable is large, it stays in memory.

```javascript
// ❌ MEMORY LEAK POTENTIAL
function createBadClosure() {
  let largeData = new Array(1000000).fill('data'); // 1MB+

  return function() {
    console.log(largeData[0]); // Even if not used, largeData stays in memory
  };
}

// ✓ OPTIMIZED
function createGoodClosure() {
  let largeData = new Array(1000000).fill('data');
  let needed = largeData[0]; // Extract what's needed
  largeData = null; // Clear reference

  return function() {
    console.log(needed); // Only what's needed stays in memory
  };
}
```

### Garbage Collection

```javascript
function example() {
  let closure = (function() {
    let bigData = new Array(1000000);
    return function() {
      // bigData not used here
    };
  })();

  // Possible issue: bigData may not be garbage collected
  // because the function might reference it
}
```

**Best Practice:** Only return functions that actually use the outer variables.

---

## Interview Questions

### Q1: What is a closure?
**Answer:** A closure is a function that has access to variables from its outer scope, even after the outer function has finished executing. This is because functions create closures around their lexical environment.

### Q2: Explain the difference between var, let, and const in the context of closures.
**Answer:**
- **var**: Function-scoped, all iterations of a loop share the same variable
- **let**: Block-scoped, each block gets its own variable (better for closures)
- **const**: Block-scoped like let, but immutable

**Example:**
```javascript
// var - all functions reference the same i
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 3, 3, 3
}

// let - each iteration has its own i
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0); // 0, 1, 2
}
```

### Q3: What will this log?
```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);
  }, 1000);
}
```

**Answer:** Logs 3, 3, 3
- The loop completes before any setTimeout callback executes
- By then, i = 3
- All callbacks reference the same i (var is function-scoped)

### Q4: How would you fix it?
**Answer:**
```javascript
// Option 1: Use let
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);
  }, 1000); // 0, 1, 2
}

// Option 2: Use IIFE
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(function() {
      console.log(j);
    }, 1000); // 0, 1, 2
  })(i);
}
```

### Q5: What are practical uses of closures?
**Answer:**
1. **Data Privacy**: Create private variables
2. **Function Factories**: Create functions with preset values
3. **Currying**: Create functions with partial application
4. **Module Pattern**: Encapsulate code
5. **Event Listeners**: Preserve context
6. **Memoization**: Cache function results

### Q6: Does this create a closure?
```javascript
function outer() {
  var x = 1;

  function inner() {
    return 2;
  }

  return inner;
}
```

**Answer:** Yes, technically a closure is created, but it doesn't use the outer scope variable. The inner function still has access to x, even though it doesn't reference it.

### Q7: What's the difference between closure and scope?
**Answer:**
- **Scope**: Where variables are accessible
- **Closure**: A function that has access to variables from its enclosing scope
- Every function creates a scope; every function creates a closure around its lexical environment

---

## Practice Problems

### Problem 1: Counter
```javascript
// Create a counter function that returns an object with increment and decrement
// Make count private (not accessible directly)

function createCounter() {
  // Your code here
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.decrement()); // 1
// counter.count should be undefined (private)
```

**Solution:**
```javascript
function createCounter() {
  let count = 0;
  return {
    increment() {
      return ++count;
    },
    decrement() {
      return --count;
    }
  };
}
```

### Problem 2: Function Multiplier
```javascript
// Create a function that returns a function
// The returned function multiplies its input by a given factor

function createMultiplier(factor) {
  // Your code here
}

const double = createMultiplier(2);
const triple = createMultiplier(3);
console.log(double(5)); // 10
console.log(triple(5)); // 15
```

**Solution:**
```javascript
function createMultiplier(factor) {
  return function(x) {
    return x * factor;
  };
}
```

### Problem 3: Array of Functions
```javascript
// Fix this to log 0, 1, 2 instead of 2, 2, 2

function createFunctions() {
  const functions = [];
  for (var i = 0; i < 3; i++) {
    functions.push(function() {
      return i;
    });
  }
  return functions;
}

const funcs = createFunctions();
console.log(funcs[0]()); // Should be 0
console.log(funcs[1]()); // Should be 1
console.log(funcs[2]()); // Should be 2
```

**Solution:**
```javascript
function createFunctions() {
  const functions = [];
  for (let i = 0; i < 3; i++) { // Use let instead of var
    functions.push(function() {
      return i;
    });
  }
  return functions;
}
```

### Problem 4: Private Bank Account
```javascript
// Create a bank account with private balance
// Only allow deposit, withdraw, and getBalance

function createBankAccount(initialBalance) {
  // Your code here
}

const account = createBankAccount(1000);
console.log(account.deposit(500)); // 1500
console.log(account.withdraw(200)); // 1300
console.log(account.getBalance()); // 1300
// account.balance should be undefined (private)
```

**Solution:**
```javascript
function createBankAccount(initialBalance) {
  let balance = initialBalance;

  return {
    deposit(amount) {
      balance += amount;
      return balance;
    },
    withdraw(amount) {
      if (amount > balance) {
        throw new Error('Insufficient funds');
      }
      balance -= amount;
      return balance;
    },
    getBalance() {
      return balance;
    }
  };
}
```

---

## Key Takeaways

1. **Closures are created automatically** when you create a function - functions have access to their outer scope
2. **Use let/const in loops** to avoid closure-related bugs
3. **Closures enable data privacy** - create private variables
4. **Be mindful of memory** - closures keep references to outer variables
5. **Scope chain** determines variable lookup - inner → outer → global
6. **Lexical scope** - determined at definition time, not call time

---

**Closures are fundamental to JavaScript. Master them!**
