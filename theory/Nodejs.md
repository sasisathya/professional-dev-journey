# Node.js - Professional Interview Guide

## Table of Contents
1. [Node.js Fundamentals](#nodejs-fundamentals)
2. [Core Architecture](#core-architecture)
3. [Event Loop Deep Dive](#event-loop-deep-dive)
4. [Modules & NPM](#modules--npm)
5. [Asynchronous Programming](#asynchronous-programming)
6. [Streams & Buffers](#streams--buffers)
7. [Express.js & APIs](#expressjs--apis)
8. [Performance & Best Practices](#performance--best-practices)

---

## Node.js Fundamentals

### What is Node.js?
**Node.js** is an open-source, cross-platform JavaScript runtime environment that executes JavaScript outside a browser. Built on Chrome's V8 engine, uses single-threaded, event-driven, non-blocking I/O architecture.

**Key characteristics:**
- **Runtime environment:** Not a language or framework
- **Single-threaded:** One main thread with event loop
- **Non-blocking I/O:** Asynchronous operations
- **Event-driven:** Callback-based architecture
- **V8 engine:** JIT compilation for performance

**Key takeaway:** JS runtime. Single-threaded, non-blocking, event-driven.

---

### Node.js vs Browser JavaScript
**Similarities:**
- Same language (JavaScript)
- Same V8 engine (in Chrome)
- Async programming (Promises, async/await)

**Differences:**
| Feature | Node.js | Browser |
|---------|---------|---------|
| Global object | `global` | `window` |
| APIs | File system, OS, networking | DOM, Web APIs |
| Modules | CommonJS, ES Modules | ES Modules |
| Use case | Server, CLI tools | Web pages, UI |

**Key takeaway:** Node.js = server-side. No DOM. File system access.

---

### Why Use Node.js?
**Advantages:**
- **JavaScript everywhere:** Same language for frontend/backend
- **Fast:** V8 engine, non-blocking I/O
- **Scalable:** Handle thousands of concurrent connections
- **NPM ecosystem:** 2M+ packages
- **Real-time:** WebSockets, Server-Sent Events
- **Microservices:** Lightweight, fast startup

**Best for:**
- REST APIs, GraphQL servers
- Real-time apps (chat, collaboration)
- Microservices
- Streaming applications
- Server-Side Rendering (Next.js)

**Not ideal for:**
- CPU-intensive tasks (image/video processing)
- Heavy computations (use worker threads or offload)

**Key takeaway:** Fast, scalable for I/O-bound. Not for CPU-intensive.

---

## Core Architecture

### V8 Engine
**Definition:** Google's JavaScript engine. Compiles JS to machine code (JIT compilation).

**Features:**
- **JIT (Just-In-Time) compilation:** JS → bytecode → optimized machine code
- **Garbage collection:** Automatic memory management
- **Inline caching:** Optimize property access
- **Hidden classes:** Optimize object property access

**Key takeaway:** V8 = fast execution. JIT compilation.

---

### Libuv Library
**Definition:** C library providing event loop, asynchronous I/O, thread pool.

**Key features:**
- **Event Loop:** Core of async operations
- **Thread Pool:** Default 4 threads for blocking operations (fs, crypto, DNS)
- **Cross-platform:** Abstracts OS differences
- **Handles:** Network sockets, files, timers

**Configure thread pool:**
```javascript
process.env.UV_THREADPOOL_SIZE = 8; // Increase to 8
```

**Key takeaway:** Libuv = event loop + thread pool. Written in C.

---

### Single-Threaded Architecture
**How it works:**
- **Main thread (Event Loop):** Handles all requests
- **Non-blocking I/O:** Delegates I/O to OS or thread pool
- **Callbacks:** Return results when operations complete

**Flow:**
```
Request → Event Loop → Non-blocking? → Execute → Response
                    → Blocking? → Thread Pool → Callback → Response
```

**Advantage:** No thread overhead, efficient for I/O-bound.
**Limitation:** One CPU-intensive task blocks event loop.

**Key takeaway:** Single main thread. Delegates blocking ops to thread pool.

---

## Event Loop Deep Dive

### Event Loop Phases
**Six phases** executed in order:

**1. Timers:** `setTimeout()`, `setInterval()`
**2. Pending Callbacks:** I/O callbacks deferred from previous cycle
**3. Idle, Prepare:** Internal (Node.js housekeeping)
**4. Poll:** Retrieve new I/O events, execute I/O callbacks
**5. Check:** `setImmediate()` callbacks
**6. Close Callbacks:** `socket.on('close')`, cleanup

**Visual:**
```
   ┌───> Timers ───> Pending ───> Idle ───> Poll ───> Check ───> Close ───┐
   └────────────────────────────────────────────────────────────────────────┘
                              (Repeat)
```

**Key takeaway:** 6 phases. Poll = most callbacks. Check = setImmediate.

---

### Phase 1: Timers
**Purpose:** Execute `setTimeout()` and `setInterval()` callbacks when threshold reached.

```javascript
setTimeout(() => console.log('Timer'), 100);
```

**Note:** Not guaranteed exact timing (depends on system load, other callbacks).

**Key takeaway:** Timers execute when ready, not exact.

---

### Phase 4: Poll (Most Important)
**Purpose:** Retrieve and execute I/O callbacks.

**Handles:**
- File system operations
- Network requests (HTTP, database)
- Almost all callbacks except timers, `setImmediate()`, close

**Behavior:**
- If poll queue not empty → execute callbacks synchronously
- If poll queue empty:
  - If `setImmediate()` scheduled → move to Check phase
  - Else → wait for new callbacks

**Key takeaway:** Most callbacks execute here. Can block if callbacks take long.

---

### Phase 5: Check
**Purpose:** Execute `setImmediate()` callbacks.

```javascript
setImmediate(() => console.log('Immediate'));
```

**setImmediate() vs setTimeout(fn, 0):**
- Inside I/O cycle: `setImmediate()` always executes first
- Outside I/O cycle: order non-deterministic

**Key takeaway:** Execute after I/O. Predictable within I/O cycle.

---

### Microtasks Queue
**Higher priority** than phase callbacks. Execute between phases.

**Types:**
1. **process.nextTick():** Highest priority
2. **Promise callbacks:** `.then()`, `.catch()`, `.finally()`

**Execution order:**
```javascript
setTimeout(() => console.log('setTimeout'), 0);
setImmediate(() => console.log('setImmediate'));
process.nextTick(() => console.log('nextTick'));
Promise.resolve().then(() => console.log('Promise'));

// Output:
// nextTick (highest)
// Promise
// setTimeout or setImmediate (varies)
```

**Warning:** Excessive `process.nextTick()` can starve event loop.

**Key takeaway:** nextTick → Promises → Phase callbacks.

---

## Modules & NPM

### CommonJS vs ES Modules
**CommonJS (default in Node.js):**
```javascript
// Export
module.exports = { func };
exports.func = func;

// Import
const { func } = require('./module');
```

**ES Modules (require `"type": "module"` in package.json):**
```javascript
// Export
export const func = () => {};
export default func;

// Import
import { func } from './module.js';
import func from './module.js';
```

**Key differences:**
- CommonJS: Synchronous, dynamic imports
- ES Modules: Asynchronous, static analysis, tree-shaking

**Key takeaway:** CommonJS = `require()`. ES Modules = `import/export`.

---

### Built-in Modules
**Common modules:**
- **fs (File System):** Read/write files
- **http/https:** Create servers, make requests
- **path:** File path utilities
- **os:** OS information
- **crypto:** Cryptography
- **events:** EventEmitter
- **stream:** Streaming data
- **buffer:** Binary data

```javascript
const fs = require('fs');
const path = require('path');
const http = require('http');
```

**Key takeaway:** Rich standard library. No installation needed.

---

### NPM (Node Package Manager)
**Definition:** Package manager for Node.js. Registry with 2M+ packages.

**Common commands:**
```bash
npm init                  # Initialize project
npm install <package>     # Install package
npm install -g <package>  # Global install
npm install --save-dev    # Dev dependency
npm uninstall <package>   # Remove package
npm update                # Update packages
npm run <script>          # Run script from package.json
```

**package.json:**
```json
{
  "name": "myapp",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0"
  },
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

**Semantic Versioning:** `^4.18.0` = `>=4.18.0 <5.0.0`

**Key takeaway:** NPM = package manager. package.json = project config.

---

## Asynchronous Programming

### Callbacks
**Definition:** Function passed as argument, executed when async operation completes.

```javascript
fs.readFile('file.txt', (err, data) => {
  if (err) console.error(err);
  else console.log(data);
});
```

**Callback Hell (Pyramid of Doom):**
```javascript
getData(function(a) {
  getMore(a, function(b) {
    getMore(b, function(c) {
      // Nested callbacks - hard to read
    });
  });
});
```

**Key takeaway:** Original async pattern. Callback hell = nested callbacks.

---

### Promises
**Definition:** Object representing eventual completion/failure of async operation.

```javascript
const promise = new Promise((resolve, reject) => {
  if (success) resolve(value);
  else reject(error);
});

promise
  .then(value => console.log(value))
  .catch(error => console.error(error))
  .finally(() => console.log('Done'));
```

**Promisify callback-based functions:**
```javascript
const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);

readFile('file.txt').then(data => console.log(data));
```

**Key takeaway:** Avoid callback hell. Chain with then/catch.

---

### async/await
**Definition:** Syntactic sugar over Promises. Makes async code look synchronous.

```javascript
async function readFiles() {
  try {
    const data1 = await readFile('file1.txt');
    const data2 = await readFile('file2.txt');
    return { data1, data2 };
  } catch (error) {
    console.error(error);
  }
}
```

**Rules:**
- `async` function returns Promise
- `await` only inside `async` functions
- Use try-catch for errors

**Parallel execution:**
```javascript
const [data1, data2] = await Promise.all([
  readFile('file1.txt'),
  readFile('file2.txt')
]);
```

**Key takeaway:** Cleaner than Promises. Use Promise.all() for parallel.

---

### Promise Patterns & Advanced Async Methods

**Promise.all():** Executes multiple Promises in parallel. Returns array of results in order. Rejects immediately if any Promise rejects (fail-fast behavior). Best for dependent operations requiring all results.

**Promise.allSettled():** Executes multiple Promises in parallel. Waits for ALL to settle (resolve or reject). Never rejects. Returns array of `{status, value/reason}` objects. Best for independent operations where partial failure is acceptable.

**Promise.race():** Executes multiple Promises in parallel. Returns result/error of first to settle. Useful for implementing timeouts and competing requests. Other Promises continue executing but results ignored.

**Promise.any():** Executes multiple Promises in parallel. Returns first fulfilled Promise. Only rejects if ALL reject with AggregateError. Better than race for retry logic (ignores rejections until all fail).

**Promise.resolve(value):** Returns Promise resolved with value. Useful for wrapping non-Promise values. If passed Promise, returns that Promise as-is.

**Promise.reject(error):** Returns Promise rejected with error. Useful for error handling chains. Immediately enters catch block.

**Key difference:** `all` = fail-fast (one failure stops all), `allSettled` = wait for all regardless, `race` = first to settle, `any` = first success only.

**Interview note:** "Use `Promise.all()` for dependent operations. Use `Promise.allSettled()` for independent operations with partial failure tolerance."

**Key takeaway:** Different combinators for different scenarios. all = parallel fail-fast, allSettled = all results, race = fastest, any = first success.

---

## Streams & Buffers

### Buffers
**Definition:** Fixed-size chunk of memory for binary data. Used when working with raw data (files, network).

```javascript
const buf = Buffer.from('Hello');
console.log(buf); // <Buffer 48 65 6c 6c 6f>
console.log(buf.toString()); // 'Hello'

const buf2 = Buffer.alloc(10); // 10 bytes, filled with 0
```

**Use cases:** File I/O, network protocols, image processing.

**Key takeaway:** Binary data container. Fixed size.

---

### Streams
**Definition:** Handle data piece by piece (chunk by chunk) instead of loading entirely in memory.

**Types:**
1. **Readable:** Read data (fs.createReadStream)
2. **Writable:** Write data (fs.createWriteStream)
3. **Duplex:** Both read/write (TCP socket)
4. **Transform:** Modify data while reading/writing (zlib.createGzip)

**Example (copy file):**
```javascript
const fs = require('fs');
const readStream = fs.createReadStream('input.txt');
const writeStream = fs.createWriteStream('output.txt');

readStream.pipe(writeStream); // Pipe read to write
```

**Benefits:**
- **Memory efficient:** Process large files without loading entirely
- **Time efficient:** Start processing before entire data available

**Key takeaway:** Process data in chunks. Memory efficient. Use pipe().

---

### Stream Events
```javascript
const readStream = fs.createReadStream('file.txt');

readStream.on('data', (chunk) => {
  console.log('Chunk:', chunk);
});

readStream.on('end', () => {
  console.log('No more data');
});

readStream.on('error', (err) => {
  console.error(err);
});
```

**Key takeaway:** Event-driven. data, end, error events.

---

## Express.js & APIs

### Express.js Basics
**Definition:** Minimal web framework for Node.js. Simplifies routing, middleware, HTTP utilities.

**Basic server:**
```javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000, () => {
  console.log('Server on port 3000');
});
```

**Key takeaway:** Express = web framework. Routing + middleware.

---

### Routing
**HTTP methods:**
```javascript
app.get('/users', (req, res) => { /* GET */ });
app.post('/users', (req, res) => { /* POST */ });
app.put('/users/:id', (req, res) => { /* PUT */ });
app.delete('/users/:id', (req, res) => { /* DELETE */ });
```

**Route parameters:**
```javascript
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.send(`User ${userId}`);
});
```

**Query parameters:**
```javascript
// GET /search?name=John&age=30
app.get('/search', (req, res) => {
  const { name, age } = req.query;
  res.send(`Name: ${name}, Age: ${age}`);
});
```

**Key takeaway:** app.METHOD(path, handler). params, query, body.

---

### Middleware
**Definition:** Functions that execute during request-response cycle. Have access to `req`, `res`, `next`.

**Example:**
```javascript
// Logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // Pass to next middleware
});

// JSON body parser
app.use(express.json());

// Route handler
app.post('/users', (req, res) => {
  const user = req.body; // Parsed by express.json()
  res.json(user);
});
```

**Types:**
- **Application-level:** `app.use()`
- **Router-level:** `router.use()`
- **Error-handling:** 4 params `(err, req, res, next)`
- **Built-in:** `express.json()`, `express.static()`
- **Third-party:** `cors`, `helmet`, `morgan`

**Key takeaway:** Middleware = functions in request pipeline. Use next().

---

### Error Handling
```javascript
// Error-handling middleware (4 params)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Async error handling
app.get('/users', async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    next(error); // Pass to error handler
  }
});
```

**Key takeaway:** Error middleware has 4 params. Use next(error).

---

## Performance & Best Practices

### Cluster Module
**Definition:** Spawn multiple Node.js processes (workers) to utilize multiple CPU cores.

```javascript
const cluster = require('cluster');
const os = require('os');
const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Worker process
  require('./app.js'); // Start server
}
```

**Key takeaway:** Scale across CPU cores. Master-worker pattern.

---

### Worker Threads
**Definition:** Execute JavaScript in parallel threads for CPU-intensive tasks. Each worker has own V8 instance and event loop, true parallelism (not event loop scheduling).

**Key characteristics:**
- Independent V8 engines (true parallelism vs event loop delegation)
- Isolated memory space per worker
- Message-passing communication (no shared memory by default)
- Worker data passed at creation time

**When to use:** CPU-intensive operations (calculations, crypto, compression, JSON parsing), image processing, heavy data transformations. Prevents blocking event loop.

**When NOT to use:** I/O-bound operations (use event loop). High overhead for trivial tasks.

**Communication mechanisms:**
1. **Message passing:** Default. `parentPort.postMessage()`, `worker.postMessage()`. Slower but safer.
2. **Transferable objects:** Transfer large buffers without copying (ArrayBuffer ownership transferred). Buffer becomes unusable in sender.
3. **SharedArrayBuffer:** True shared memory between threads. Atomic operations required. High concurrency but complex.

**Worker pool pattern:** Multiple workers queued for tasks. Route tasks to available workers, queue if all busy. Scales CPU-bound workloads across CPU cores efficiently.

**Cluster vs Worker Threads:**

| Aspect | Cluster | Worker Threads |
|--------|---------|----------------|
| Use case | I/O-bound, web servers | CPU-bound tasks |
| Parallelism | Separate processes | Threads in same process |
| Memory | High (separate heap) | Low (shared process) |
| Communication | IPC (slow) | Message passing (fast) |
| Startup | Slower (fork process) | Faster (create thread) |
| Shared state | None (separate processes) | Can use SharedArrayBuffer |

**Key takeaway:** Worker threads = true parallelism for CPU tasks. Thread pool for scaling. Transferable objects for zero-copy. SharedArrayBuffer for high-performance concurrency.

---

### Environment Variables
**Use `.env` file:**
```
PORT=3000
DB_URL=mongodb://localhost/mydb
API_KEY=secret123
```

**Load with `dotenv`:**
```javascript
require('dotenv').config();

const port = process.env.PORT || 3000;
const dbUrl = process.env.DB_URL;
```

**Key takeaway:** Never commit secrets. Use .env + dotenv.

---

### Best Practices
**1. Error handling:**
- Use try-catch with async/await
- Centralized error handler
- Graceful shutdown

**2. Security:**
- Use `helmet` middleware (security headers)
- Validate input
- Rate limiting
- Use HTTPS

**3. Performance:**
- Use compression middleware
- Cache (Redis)
- Database indexing
- Use streams for large files
- Connection pooling

**4. Code quality:**
- Use ESLint
- Async/await over callbacks
- Modularize code
- Use environment variables

**5. Logging:**
- Use `winston` or `pino`
- Different log levels (info, warn, error)
- Structured logging

**6. Process management:**
- Use PM2 for production
- Auto-restart on crash
- Load balancing

**Key takeaway:** Error handling, security, caching, logging, PM2.

---

## Interview Tips

1. **Explain event loop clearly:** "6 phases. Poll handles most I/O callbacks. Microtasks execute between phases."
2. **Discuss non-blocking I/O:** "Event loop delegates blocking ops to thread pool, continues handling requests."
3. **Real examples:** "Used streams to process 1GB CSV file with low memory usage."
4. **Know when NOT to use:** "CPU-intensive tasks block event loop. Use worker threads or offload."
5. **Express expertise:** "Middleware = request pipeline. Error handlers have 4 params."

**Key concepts:** Event loop, non-blocking I/O, streams, async/await, Express, clustering

---

**Updated:** 2026-06-28 | **Level:** Intermediate-Advanced | **Format:** Interview-ready definitions
