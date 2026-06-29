# JavaScript - Professional Interview Guide

## Table of Contents
1. [Core Fundamentals](#core-fundamentals)
2. [Data Types & Type Coercion](#data-types--type-coercion)
3. [Functions & Scope](#functions--scope)
4. [Asynchronous JavaScript](#asynchronous-javascript)
5. [Objects & Prototypes](#objects--prototypes)
6. [ES6+ Features](#es6-features)
7. [DOM & Browser APIs](#dom--browser-apis)
8. [Advanced Concepts](#advanced-concepts)

---

## Core Fundamentals

### What is JavaScript?
**JavaScript** is a high-level, interpreted, dynamically-typed programming language. Originally for browsers (client-side), now runs server-side (Node.js). Single-threaded with event-driven, non-blocking I/O model.

**Characteristics:**
- **Interpreted:** Executed line by line (JIT compilation in modern engines)
- **Dynamic typing:** Variables can hold any type
- **First-class functions:** Functions are values (assign, pass, return)
- **Prototype-based:** Inheritance via prototypes, not classes (ES6 classes are syntactic sugar)

**Key takeaway:** Dynamic, interpreted, prototype-based language.

---

### Execution Context
**Definition:** Environment where JavaScript code runs. Contains variable environment, scope chain, and `this` binding.

**Types:**
1. **Global Execution Context:** Created when script loads. One per program.
2. **Function Execution Context:** Created when function is called.
3. **Eval Execution Context:** Code inside `eval()` (avoid).

**Phases:**
1. **Creation Phase:**
   - Creates scope chain
   - Creates variable object (hoisting)
   - Sets `this` value

2. **Execution Phase:**
   - Assigns values to variables
   - Executes code line by line

**Key takeaway:** Execution context = environment + scope + this.

---

### Hoisting
**Definition:** Variables and function declarations are moved to the top of their scope during compilation phase.

**Variable hoisting:**
```javascript
console.log(x); // undefined (not ReferenceError)
var x = 5;

// Interpreted as:
var x;
console.log(x); // undefined
x = 5;
```

**Function hoisting:**
```javascript
greet(); // "Hello" - works!
function greet() { console.log("Hello"); }
```

**let/const:** Hoisted but in "Temporal Dead Zone" until declaration (ReferenceError if accessed before).

**Key takeaway:** var = hoisted with undefined, let/const = TDZ, functions = fully hoisted.

---

### var vs let vs const
**var:**
- Function-scoped (or global)
- Hoisted with `undefined`
- Can redeclare
- No block scope

**let:**
- Block-scoped (`{}`)
- Temporal Dead Zone
- Cannot redeclare in same scope
- Can reassign

**const:**
- Block-scoped
- Temporal Dead Zone
- Cannot redeclare or reassign
- Object/Array contents mutable

```javascript
const obj = { a: 1 };
obj.a = 2; // OK - mutating content
obj = {}; // Error - reassignment
```

**Key takeaway:** Use const by default, let when reassignment needed, avoid var.

---

### Scope and Scope Chain
**Scope:** Where variables are accessible.

**Types:**
1. **Global Scope:** Accessible everywhere
2. **Function Scope:** Inside function only
3. **Block Scope:** Inside `{}` (let/const only)

**Scope Chain:** If variable not found in current scope, JavaScript looks in outer scope, then outer's outer, up to global.

```javascript
let global = "global";
function outer() {
    let outerVar = "outer";
    function inner() {
        let innerVar = "inner";
        console.log(innerVar, outerVar, global); // All accessible
    }
}
```

**Lexical Scoping:** Inner function has access to outer function's variables (determined at write time, not runtime).

**Key takeaway:** Scope chain = nested lookup. Lexical scoping.

---

### Closures
**Definition:** Function that retains access to its outer scope even after outer function has returned.

```javascript
function outer() {
    let count = 0;
    return function inner() {
        count++;
        return count;
    };
}
const counter = outer();
console.log(counter()); // 1
console.log(counter()); // 2
```

**Use cases:**
- Data privacy (private variables)
- Factory functions
- Event handlers maintaining state
- Partial application, currying

**Key takeaway:** Function + its lexical environment. Private data.

---

## Data Types & Type Coercion

### Primitive vs Reference Types
**Primitive (7 types):**
- `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`
- Stored on stack
- Immutable
- Compared by value

**Reference Types:**
- Objects, Arrays, Functions
- Stored on heap (variable holds reference)
- Mutable
- Compared by reference

```javascript
let a = { x: 1 };
let b = a; // Copy reference
b.x = 2;
console.log(a.x); // 2 (same object)
```

**Key takeaway:** Primitives = value, References = pointer.

---

### == vs ===
**== (Loose Equality):**
- Type coercion before comparison
- `"5" == 5` → `true`
- Unpredictable edge cases

**=== (Strict Equality):**
- No type coercion
- Compares type and value
- `"5" === 5` → `false`

**Best practice:** Always use `===` (strict).

**Key takeaway:** === = strict (no coercion), == = loose (avoid).

---

### null vs undefined
**undefined:**
- Default value for uninitialized variables
- Function returns `undefined` if no explicit return
- Missing object properties

**null:**
- Intentional absence of value
- Must be explicitly assigned
- Represents "no value"

```javascript
let x; // undefined
let y = null; // null (intentional)
```

**Gotcha:** `typeof null` → `"object"` (historical bug).

**Key takeaway:** undefined = default/missing, null = intentional absence.

---

### Type Coercion
**Implicit conversion** of one type to another.

**String coercion:**
```javascript
"5" + 2 // "52" (number to string)
```

**Number coercion:**
```javascript
"5" - 2 // 3 (string to number)
"5" * 2 // 10
```

**Boolean coercion:**
- **Falsy:** `false`, `0`, `""`, `null`, `undefined`, `NaN`
- **Truthy:** Everything else

```javascript
if ("") { } // false
if ("hello") { } // true
```

**Key takeaway:** + = string concat, -, *, / = number conversion.

---

### typeof vs instanceof
**typeof:**
- Returns string indicating type
- Works with primitives
- `typeof null` → `"object"` (bug)

```javascript
typeof 42 // "number"
typeof "hi" // "string"
typeof {} // "object"
typeof undefined // "undefined"
```

**instanceof:**
- Checks if object is instance of constructor
- Works with objects
- Checks prototype chain

```javascript
[] instanceof Array // true
[] instanceof Object // true (Array extends Object)
```

**Key takeaway:** typeof = primitives, instanceof = objects/constructors.

---

## Functions & Scope

### Function Declaration vs Expression vs Arrow
**Function Declaration:**
```javascript
function greet() { }
// Hoisted, can call before declaration
```

**Function Expression:**
```javascript
const greet = function() { };
// Not hoisted (variable is), can't call before
```

**Arrow Function:**
```javascript
const greet = () => { };
// Concise, no own 'this', no 'arguments', can't be constructor
```

**Key differences:**
- **this binding:** Arrow inherits from surrounding scope
- **Hoisting:** Declaration = yes, Expression/Arrow = no
- **constructor:** Only declaration/expression can be used with `new`

**Key takeaway:** Arrow = no own this, Declaration = hoisted.

---

### this Keyword
**Definition:** Reference to the object that is executing the function.

**Rules:**
1. **Global context:** `this` = `window` (browser) or `global` (Node)
2. **Object method:** `this` = object
3. **Constructor:** `this` = new instance
4. **Arrow function:** `this` = lexically inherited (from outer scope)
5. **call/apply/bind:** `this` = explicitly set

```javascript
const obj = {
    name: "Alice",
    greet: function() { console.log(this.name); }
};
obj.greet(); // "Alice" - this = obj

const fn = obj.greet;
fn(); // undefined - this = global (lose context)
```

**Key takeaway:** Determined by how function is called. Arrow = lexical.

---

### call, apply, bind
**call:** Invokes function with explicit `this` and individual arguments.
```javascript
func.call(thisArg, arg1, arg2);
```

**apply:** Like `call` but arguments as array.
```javascript
func.apply(thisArg, [arg1, arg2]);
```

**bind:** Returns new function with fixed `this` (doesn't invoke immediately).
```javascript
const boundFunc = func.bind(thisArg);
boundFunc();
```

**Use cases:**
- **call/apply:** Borrow methods, invoke with custom `this`
- **bind:** Event handlers, callbacks maintaining context

**Key takeaway:** call/apply = invoke now, bind = return new function.

---

### IIFE (Immediately Invoked Function Expression)
**Definition:** Function that executes immediately after definition.

```javascript
(function() {
    console.log("IIFE");
})();

(() => console.log("Arrow IIFE"))();
```

**Use cases:**
- Avoid global scope pollution
- Create private scope (before modules)
- Initialization code

**Key takeaway:** Execute immediately. Private scope.

---

### Currying
**Definition:** Transforming function with multiple arguments into sequence of functions each taking single argument.

```javascript
// Normal
function add(a, b, c) { return a + b + c; }

// Curried
function add(a) {
    return function(b) {
        return function(c) {
            return a + b + c;
        };
    };
}
add(1)(2)(3); // 6

// Arrow syntax
const add = a => b => c => a + b + c;
```

**Use cases:**
- Partial application
- Reusable function templates
- Functional composition

**Key takeaway:** Multiple args → sequence of single-arg functions.

---

## Asynchronous JavaScript

### Event Loop
**Definition:** Mechanism that handles asynchronous callbacks. Single-threaded JavaScript uses event loop to manage concurrency.

**Components:**
1. **Call Stack:** Executes synchronous code
2. **Web APIs:** Browser features (setTimeout, fetch, DOM events)
3. **Callback Queue (Task Queue):** Holds callbacks from Web APIs
4. **Microtask Queue:** Holds Promise callbacks (higher priority)
5. **Event Loop:** Moves tasks from queue to call stack when stack is empty

**Execution Order:**
1. Execute synchronous code (call stack)
2. Execute all microtasks (Promises)
3. Execute one macrotask (setTimeout, setInterval)
4. Repeat

```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// Output: 1, 4, 3, 2
```

**Key takeaway:** Microtasks before macrotasks. Promises before setTimeout.

---

### Callbacks
**Definition:** Function passed as argument, executed later.

```javascript
function fetchData(callback) {
    setTimeout(() => {
        callback("data");
    }, 1000);
}
fetchData((data) => console.log(data));
```

**Callback Hell:** Nested callbacks for sequential async operations. Hard to read/maintain.

```javascript
getData(function(a) {
    getMore(a, function(b) {
        getMore(b, function(c) {
            // Pyramid of doom
        });
    });
});
```

**Key takeaway:** Async pattern. Callback hell = nested callbacks.

---

### Promises
**Definition:** Object representing eventual completion or failure of async operation.

**States:**
1. **Pending:** Initial state
2. **Fulfilled:** Operation completed successfully
3. **Rejected:** Operation failed

```javascript
const promise = new Promise((resolve, reject) => {
    if (success) resolve(value);
    else reject(error);
});

promise
    .then(value => { /* handle success */ })
    .catch(error => { /* handle error */ })
    .finally(() => { /* cleanup */ });
```

**Chaining:**
```javascript
fetch('/api')
    .then(response => response.json())
    .then(data => process(data))
    .catch(error => console.error(error));
```

**Key takeaway:** Avoid callback hell. then/catch chaining.

---

### async/await
**Definition:** Syntactic sugar over Promises. Makes async code look synchronous.

```javascript
async function fetchData() {
    try {
        const response = await fetch('/api');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}
```

**Rules:**
- `async` function always returns Promise
- `await` pauses execution until Promise resolves
- `await` only works inside `async` functions
- Use try-catch for error handling

**Key takeaway:** Cleaner than then/catch. Use try-catch for errors.

---

### Promise Methods
**Promise.all(iterable):**
- Waits for all Promises to resolve
- Fails if any Promise rejects
- Returns array of results

**Promise.allSettled(iterable):**
- Waits for all Promises (resolve or reject)
- Never fails
- Returns array of results with status

**Promise.race(iterable):**
- Resolves/rejects with first settled Promise

**Promise.any(iterable):**
- Resolves with first fulfilled Promise
- Rejects if all Promises reject

```javascript
Promise.all([promise1, promise2])
    .then(([result1, result2]) => { });
```

**Key takeaway:** all = all succeed, allSettled = all complete, race = first one.

---

### setTimeout vs setInterval
**setTimeout:** Executes callback once after delay.
```javascript
setTimeout(() => console.log("Hello"), 1000);
```

**setInterval:** Executes callback repeatedly at intervals.
```javascript
const id = setInterval(() => console.log("Tick"), 1000);
clearInterval(id); // Stop
```

**Gotcha:** setInterval doesn't account for callback execution time. Can queue up callbacks if execution time > interval. Use recursive setTimeout for precision.

```javascript
function recursiveTimeout() {
    setTimeout(() => {
        // Do work
        recursiveTimeout(); // Schedule next
    }, 1000);
}
```

**Key takeaway:** setTimeout = once, setInterval = repeating.

---

## Objects & Prototypes

### Object Creation
**1. Object literal:**
```javascript
const obj = { name: "Alice" };
```

**2. Constructor function:**
```javascript
function Person(name) { this.name = name; }
const p = new Person("Alice");
```

**3. Object.create():**
```javascript
const proto = { greet() { } };
const obj = Object.create(proto);
```

**4. Class (ES6):**
```javascript
class Person {
    constructor(name) { this.name = name; }
}
```

**Key takeaway:** Literal = simple, Constructor/Class = multiple instances.

---

### Prototypes and Prototype Chain
**Prototype:** Object from which other objects inherit properties.

**Every object has:**
- `__proto__` property (points to prototype)
- Constructor function has `prototype` property

```javascript
function Person(name) { this.name = name; }
Person.prototype.greet = function() { console.log(this.name); };

const alice = new Person("Alice");
alice.greet(); // Looks in alice → Person.prototype → Object.prototype
```

**Prototype Chain:** JavaScript looks for property in object → prototype → prototype's prototype → ... → Object.prototype → null.

**Key takeaway:** Inheritance via prototypes. Chain of __proto__ links.

---

### Object Methods
**Object.keys(obj):** Array of own enumerable property keys.
**Object.values(obj):** Array of own property values.
**Object.entries(obj):** Array of [key, value] pairs.
**Object.assign(target, ...sources):** Copy properties to target (shallow).
**Object.freeze(obj):** Make immutable (can't add/delete/modify).
**Object.seal(obj):** Prevent add/delete, can modify existing.

```javascript
const obj = { a: 1, b: 2 };
Object.keys(obj); // ["a", "b"]
Object.freeze(obj);
obj.a = 3; // Ignored (strict mode: error)
```

**Key takeaway:** keys/values/entries = iteration, freeze/seal = immutability.

---

### Spread and Rest Operators
**Spread (...):** Expands array/object.
```javascript
const arr = [1, 2, 3];
const newArr = [...arr, 4, 5]; // [1, 2, 3, 4, 5]

const obj = { a: 1, b: 2 };
const newObj = { ...obj, c: 3 }; // { a: 1, b: 2, c: 3 }
```

**Rest (...):** Collects arguments into array.
```javascript
function sum(...numbers) {
    return numbers.reduce((a, b) => a + b);
}
sum(1, 2, 3); // 6

const [first, ...rest] = [1, 2, 3];
// first = 1, rest = [2, 3]
```

**Key takeaway:** Spread = expand, Rest = collect.

---

### Destructuring
**Arrays:**
```javascript
const [a, b, c] = [1, 2, 3];
const [first, , third] = [1, 2, 3]; // Skip elements
```

**Objects:**
```javascript
const { name, age } = { name: "Alice", age: 30 };
const { name: userName } = obj; // Rename
const { name = "Default" } = obj; // Default value
```

**Function parameters:**
```javascript
function greet({ name, age }) {
    console.log(name, age);
}
greet({ name: "Alice", age: 30 });
```

**Key takeaway:** Extract values from arrays/objects concisely.

---

## ES6+ Features

### let and const
See [var vs let vs const](#var-vs-let-vs-const).

---

### Template Literals
**Definition:** String literals with embedded expressions.

```javascript
const name = "Alice";
const greeting = `Hello, ${name}!`; // Hello, Alice!

// Multi-line
const html = `
    <div>
        <h1>${title}</h1>
    </div>
`;

// Tagged templates (advanced)
const result = tag`Hello ${name}`;
```

**Key takeaway:** ${} for interpolation, multi-line support.

---

### Arrow Functions
See [Function Declaration vs Expression vs Arrow](#function-declaration-vs-expression-vs-arrow).

---

### Classes
**Definition:** Syntactic sugar over prototypes.

```javascript
class Person {
    constructor(name) {
        this.name = name;
    }
    greet() {
        console.log(`Hello, ${this.name}`);
    }
    static info() {
        console.log("Static method");
    }
}

class Employee extends Person {
    constructor(name, role) {
        super(name);
        this.role = role;
    }
}
```

**Key points:**
- `constructor` for initialization
- `super()` calls parent constructor
- `static` for class-level methods
- Under the hood: still prototypes

**Key takeaway:** Cleaner syntax for prototypes. Inheritance via extends.

---

### Modules (import/export)
**Named exports:**
```javascript
// math.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

// app.js
import { add, subtract } from './math.js';
```

**Default export:**
```javascript
// person.js
export default class Person { }

// app.js
import Person from './person.js';
```

**Key takeaway:** Named = multiple exports, Default = single main export.

---

### Symbols
**Definition:** Unique, immutable primitive value used as object property keys.

```javascript
const sym1 = Symbol('description');
const sym2 = Symbol('description');
sym1 === sym2; // false (unique)

const obj = {
    [sym1]: "value"
};
```

**Use cases:**
- Unique property keys (avoid collisions)
- Define internal object properties (not enumerable)

**Key takeaway:** Unique identifier. Hidden from iteration.

---

### Iterators and Generators
**Iterator:** Object with `next()` method returning `{ value, done }`.

**Generator:** Function that can pause and resume execution. Defined with `function*` and `yield`.

```javascript
function* generator() {
    yield 1;
    yield 2;
    yield 3;
}

const gen = generator();
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: false }
gen.next(); // { value: undefined, done: true }
```

**Use cases:**
- Lazy evaluation
- Infinite sequences
- Async flow control (before async/await)

**Key takeaway:** Generators = pausable functions. yield = pause.

---

### Map and Set
**Set:** Collection of unique values.
```javascript
const set = new Set([1, 2, 2, 3]);
set.size; // 3
set.has(2); // true
set.add(4);
set.delete(1);
```

**Map:** Key-value pairs with any type as key.
```javascript
const map = new Map();
map.set('key', 'value');
map.set(obj, 'object key');
map.get('key'); // 'value'
map.has('key'); // true
map.size; // 2
```

**vs Objects:**
- Map keys can be any type (objects can only use strings/symbols)
- Map maintains insertion order
- Map has size property

**Key takeaway:** Set = unique values, Map = any-type keys.

---

### WeakMap and WeakSet
**WeakMap:** Like Map but keys must be objects and are weakly held (garbage collected if no other references).

**WeakSet:** Like Set but values must be objects and are weakly held.

**Use cases:**
- Store metadata about objects without preventing garbage collection
- Private data in objects

```javascript
const weakMap = new WeakMap();
let obj = {};
weakMap.set(obj, 'metadata');
obj = null; // obj can be garbage collected
```

**Limitations:** Not iterable, no size property.

**Key takeaway:** Weak references. No memory leaks.

---

## DOM & Browser APIs

### DOM Manipulation
**Selecting elements:**
```javascript
document.getElementById('id');
document.querySelector('.class');
document.querySelectorAll('div');
```

**Modifying:**
```javascript
element.innerHTML = '<span>New</span>';
element.textContent = 'Text';
element.classList.add('active');
element.style.color = 'red';
element.setAttribute('data-id', '123');
```

**Creating/removing:**
```javascript
const div = document.createElement('div');
parent.appendChild(div);
parent.removeChild(div);
element.remove();
```

**Key takeaway:** querySelector = modern, classList/textContent preferred.

---

### Event Handling
**Add listener:**
```javascript
element.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log(event.target);
});
```

**Event phases:**
1. **Capturing:** From window down to target
2. **Target:** Event reached target
3. **Bubbling:** From target up to window

**Event delegation:** Attach listener to parent, handle events from children.
```javascript
parent.addEventListener('click', (e) => {
    if (e.target.matches('.child')) {
        // Handle child click
    }
});
```

**Key takeaway:** Bubbling by default. Delegation = single listener for multiple elements.

---

### Local Storage & Session Storage
**localStorage:** Persists across sessions (no expiration).
**sessionStorage:** Cleared when tab closes.

```javascript
localStorage.setItem('key', 'value');
localStorage.getItem('key'); // 'value'
localStorage.removeItem('key');
localStorage.clear();

// Only stores strings
localStorage.setItem('obj', JSON.stringify(obj));
JSON.parse(localStorage.getItem('obj'));
```

**Limitations:** 5-10MB limit, same-origin only, synchronous (blocking).

**Key takeaway:** localStorage = persistent, sessionStorage = tab session.

---

### Fetch API
**Definition:** Modern way to make HTTP requests (replaces XMLHttpRequest).

```javascript
fetch('/api/data')
    .then(response => {
        if (!response.ok) throw new Error('Network error');
        return response.json();
    })
    .then(data => console.log(data))
    .catch(error => console.error(error));

// With async/await
async function getData() {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
}
```

**Methods:** GET (default), POST, PUT, DELETE, etc.

**Key takeaway:** Promise-based. response.json() also returns Promise.

---

## Advanced Concepts

### Debouncing and Throttling
**Debouncing:** Delays function execution until after a pause in events.
```javascript
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

const search = debounce(() => fetchResults(), 300);
input.addEventListener('input', search);
```

**Throttling:** Limits function execution to once per interval.
```javascript
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

const handleScroll = throttle(() => updateUI(), 100);
window.addEventListener('scroll', handleScroll);
```

**Use cases:**
- Debounce: Search input, window resize
- Throttle: Scroll, mouse move

**Key takeaway:** Debounce = after pause, Throttle = limit rate.

---

### Memoization
**Definition:** Caching function results based on arguments.

```javascript
function memoize(fn) {
    const cache = new Map();
    return function(...args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key);
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

const factorial = memoize(n => {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
});
```

**Use cases:** Expensive computations, recursive functions.

**Key takeaway:** Cache results. Trade memory for speed.

---

### Deep vs Shallow Copy
**Shallow Copy:** Copies top level, nested references shared.
```javascript
const copy = { ...original };
const copy = Object.assign({}, original);
```

**Deep Copy:** Copies all levels (new objects for nested).
```javascript
const copy = JSON.parse(JSON.stringify(original)); // Loses functions, dates, undefined
const copy = structuredClone(original); // Modern, better
```

**Libraries:** lodash `_.cloneDeep()` for complex cases.

**Key takeaway:** Shallow = top level, Deep = all levels.

---

### Strict Mode
**Definition:** Opt-in to stricter parsing and error handling.

```javascript
'use strict';
x = 10; // ReferenceError (no implicit global)
delete Object.prototype; // Error (can't delete)
```

**Benefits:**
- Catches silent errors
- Prevents accidental globals
- Disallows duplicate parameters
- Secures `this` (undefined in functions, not global)

**Key takeaway:** Stricter rules. Catches bugs early.

---

### Regular Expressions (RegEx)
**Definition:** Patterns to match character combinations.

```javascript
const regex = /pattern/flags;
const regex = new RegExp('pattern', 'flags');

// Flags: g = global, i = case-insensitive, m = multiline

'hello'.match(/l+/g); // ["ll"]
'hello'.replace(/l/g, 'L'); // "heLLo"
/\d{3}-\d{4}/.test('123-4567'); // true
```

**Common patterns:**
- `\d` = digit, `\w` = word char, `\s` = whitespace
- `.` = any char, `*` = 0+, `+` = 1+, `?` = 0 or 1
- `^` = start, `$` = end, `[]` = character set

**Key takeaway:** Pattern matching. Flags modify behavior.

---

### Error Handling
**try-catch:**
```javascript
try {
    // Code that may throw
    throw new Error('Something went wrong');
} catch (error) {
    console.error(error.message);
} finally {
    // Always runs
}
```

**Custom errors:**
```javascript
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
```

**Key takeaway:** try-catch for exceptions. finally always runs.

---

## Interview Tips

1. **Explain event loop clearly:** "Call stack → Microtasks (Promises) → Macrotasks (setTimeout)."
2. **Use examples:** "Closure example: counter function maintaining private state."
3. **Discuss modern features:** "Use const/let, arrow functions, async/await in production."
4. **Know gotchas:** "typeof null is 'object', this in arrow functions is lexical."
5. **Real-world scenarios:** "Used debouncing for search autocomplete to reduce API calls."

---

**Updated:** 2026-06-28 | **Level:** Intermediate-Advanced | **Format:** Interview-ready definitions
