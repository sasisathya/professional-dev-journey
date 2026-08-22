# Node.js - Professional Interview Guide

## Table of Contents
1. [Node.js Fundamentals](#nodejs-fundamentals)
2. [Core Architecture](#core-architecture)
3. [Event Loop Deep Dive](#event-loop-deep-dive)
4. [Modules & NPM](#modules--npm)
5. [Asynchronous Programming](#asynchronous-programming)
6. [Streams & Buffers](#streams--buffers)
7. [Express.js & APIs](#expressjs--apis)
8. [Database Patterns](#database-patterns)
9. [Production Patterns & Architecture](#production-patterns--architecture)
10. [Security Patterns](#security-patterns)
11. [Monitoring, Logging & Debugging](#monitoring-logging--debugging)
12. [Testing Strategies](#testing-strategies)
13. [Performance & Optimization](#performance--optimization)
14. [Production Wisdom (10+ Years)](#production-wisdom-10-years)
15. [Interview Tips (Advanced)](#interview-tips-advanced)

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

### REST API Best Practices

**Status codes (use correctly):**
- 200: OK (GET success, form validation)
- 201: Created (POST creates resource)
- 204: No Content (DELETE success, no body)
- 400: Bad Request (client error, invalid input)
- 401: Unauthorized (authentication missing/invalid)
- 403: Forbidden (authenticated but not authorized)
- 404: Not Found (resource doesn't exist)
- 409: Conflict (constraint violation)
- 429: Too Many Requests (rate limited)
- 500: Server Error (unhandled exception)
- 503: Service Unavailable (maintenance)

**Pagination (prevent N+1 and large payloads):**
```javascript
app.get('/users', async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;
  const offset = (page - 1) * limit;
  
  const [users, total] = await Promise.all([
    User.find().limit(limit).offset(offset),
    User.count()
  ]);
  
  res.json({
    data: users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// Alternative: cursor-based pagination (better for real-time data)
app.get('/users', async (req, res) => {
  const cursor = req.query.cursor; // Last ID from previous request
  const limit = req.query.limit || 20;
  
  let query = User.find();
  if (cursor) query = query.where('id').gt(cursor);
  
  const users = await query.limit(limit + 1);
  const hasMore = users.length > limit;
  
  res.json({
    data: users.slice(0, limit),
    next: hasMore ? users[limit].id : null
  });
});
```

**API Versioning (backwards compatibility):**
```javascript
// URL-based versioning (simplest, explicit)
app.get('/api/v1/users', (req, res) => { /* v1 */ });
app.get('/api/v2/users', (req, res) => { /* v2 */ });

// Header-based versioning (cleaner URLs)
app.get('/users', (req, res) => {
  const version = req.headers['api-version'] || 'v1';
  if (version === 'v2') {
    // v2 response
  } else {
    // v1 response
  }
});

// Best practice: Keep both versions until deprecation date
// Provide migration guide, timeline, support channel
```

**Filtering, Sorting, Searching:**
```javascript
app.get('/products', async (req, res) => {
  const { category, minPrice, maxPrice, sort, search, page = 1, limit = 20 } = req.query;
  
  let query = Product.find();
  
  // Filtering
  if (category) query = query.where('category').equals(category);
  if (minPrice || maxPrice) {
    if (minPrice) query = query.where('price').gte(minPrice);
    if (maxPrice) query = query.where('price').lte(maxPrice);
  }
  
  // Searching
  if (search) {
    query = query.where('$text').equals({ $search: search }); // Full-text search
  }
  
  // Sorting (whitelist to prevent injection)
  const validSortFields = ['price', 'rating', 'createdAt'];
  if (sort && validSortFields.includes(sort)) {
    query = query.sort(sort);
  }
  
  // Pagination
  const offset = (page - 1) * limit;
  const products = await query.limit(limit).skip(offset);
  
  res.json(products);
});
```

**Key takeaway:** 201 for creates, 204 for deletes, cursor pagination for real-time, version APIs.

---

### GraphQL Patterns (Alternative to REST)

**GraphQL advantages over REST:**
- Request exactly what you need (no over/under-fetching)
- Single query instead of multiple REST calls
- Self-documenting schema
- No versioning needed (additive schema)

**Basic GraphQL server (Apollo):**
```javascript
const { ApolloServer, gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
  }
  
  type Post {
    id: ID!
    title: String!
    author: User!
  }
  
  type Query {
    user(id: ID!): User
    users(limit: Int): [User!]!
  }
`;

const resolvers = {
  Query: {
    user: async (_, { id }) => User.findById(id),
    users: async (_, { limit }) => User.find().limit(limit)
  },
  User: {
    posts: async (user) => Post.find({ authorId: user.id })
  }
};

const server = new ApolloServer({ typeDefs, resolvers });
await server.start();
server.applyMiddleware({ app });
```

**N+1 query problem in GraphQL (critical):**
```javascript
// ❌ WRONG: Fetches user posts one-by-one
const resolvers = {
  User: {
    posts: async (user) => {
      // Called once per user
      // If returning 100 users, queries DB 100 times!
      return Post.find({ authorId: user.id });
    }
  }
};

// ✅ CORRECT: Use DataLoader for batching
const DataLoader = require('dataloader');

const userLoader = new DataLoader(async (userIds) => {
  const posts = await Post.find({ authorId: { $in: userIds } });
  return userIds.map(id => posts.filter(p => p.authorId === id));
});

const resolvers = {
  User: {
    posts: async (user) => {
      // Batches all requests, single query
      return userLoader.load(user.id);
    }
  }
};
```

**Key takeaway:** GraphQL eliminates over/under-fetching. Use DataLoader to prevent N+1 queries.

---

## Database Patterns

### Connection Pooling

**Why it matters:** Connections are expensive. Reuse them. Max size = connections available.

```javascript
const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'postgres',
  password: 'password',
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  max: 20, // Max concurrent connections
  idleTimeoutMillis: 30000, // Close idle after 30s
  connectionTimeoutMillis: 2000 // Fail if can't connect in 2s
});

// Query
pool.query('SELECT * FROM users WHERE id = $1', [userId])
  .then(result => console.log(result.rows))
  .catch(err => console.error(err));

// Close on shutdown
pool.end();
```

**Connection pooling with MongoDB:**
```javascript
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/mydb', {
  maxPoolSize: 20,
  minPoolSize: 5,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await mongoose.connection.close();
});
```

**Common mistake:** Creating new connection per request = connection leak.

**Key takeaway:** Pool connections. Set max size. Close on shutdown.

---

### ORM/ODM Patterns

**Choosing ORM:**
- **Sequelize (SQL):** Full-featured, good TypeScript, verbose
- **TypeORM (SQL + MongoDB):** Decorator-based, great TypeScript, complex
- **Prisma (SQL + MongoDB):** Modern, generated types, DevX excellent
- **Mongoose (MongoDB):** Simple, schema-based, good defaults
- **Raw queries (Knex.js):** Maximum control, minimum abstraction

**Prisma pattern (recommended):**
```javascript
// schema.prisma
model User {
  id    Int     @id @default(autoincrement())
  name  String
  email String  @unique
  posts Post[]
}

model Post {
  id      Int     @id @default(autoincrement())
  title   String
  author  User    @relation(fields: [authorId], references: [id])
  authorId Int
}

// Usage
const user = await prisma.user.create({
  data: {
    name: 'Alice',
    email: 'alice@example.com',
    posts: {
      create: [{ title: 'Post 1' }]
    }
  },
  include: { posts: true } // Eager load
});

// Generated types are type-safe
type User = Prisma.UserGetPayload<typeof user>;
```

**TypeORM pattern:**
```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Post, post => post.author)
  posts: Post[];
}

// Repository pattern (type-safe queries)
const userRepo = dataSource.getRepository(User);
const user = await userRepo.findOne({
  where: { id: 1 },
  relations: ['posts']
});
```

**Key takeaway:** Prisma or TypeORM for new projects. Connection pooling built-in.

---

### Transactions & Data Consistency

**ACID properties:**
- Atomicity: All or nothing
- Consistency: Valid state before/after
- Isolation: Concurrent transactions don't interfere
- Durability: Committed data survives failures

**SQL Transaction:**
```javascript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  
  await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, fromId]);
  await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, toId]);
  
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  client.release();
}
```

**Mongoose Transaction:**
```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  await Account.updateOne(
    { _id: fromId },
    { $inc: { balance: -amount } },
    { session }
  );
  await Account.updateOne(
    { _id: toId },
    { $inc: { balance: amount } },
    { session }
  );
  
  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
  throw err;
} finally {
  session.endSession();
}
```

**Key takeaway:** Wrap multi-step operations in transactions. Rollback on error.

---

### N+1 Query Prevention

**The problem:**
```javascript
// ❌ WRONG: N+1 queries
const users = await User.find(); // 1 query
for (const user of users) {
  user.posts = await Post.find({ authorId: user.id }); // N queries
}
// Total: 1 + N queries

// ✅ CORRECT: Single query with join
const users = await User.find().populate('posts'); // 1 query with join

// ✅ CORRECT: Manual join for complex cases
const users = await User.aggregate([
  {
    $lookup: {
      from: 'posts',
      localField: '_id',
      foreignField: 'authorId',
      as: 'posts'
    }
  }
]);
```

**DataLoader for GraphQL (batch loading):**
```javascript
const DataLoader = require('dataloader');

// Batch load posts for multiple users
const postsLoader = new DataLoader(async (userIds) => {
  // Single query for all users
  const postsMap = {};
  const posts = await Post.find({ authorId: { $in: userIds } });
  
  userIds.forEach(id => {
    postsMap[id] = posts.filter(p => p.authorId === id);
  });
  
  return userIds.map(id => postsMap[id]);
});

const resolvers = {
  User: {
    posts: (user) => postsLoader.load(user.id)
  }
};
```

**Key takeaway:** Eager load with `.populate()` or `.include()`. Use DataLoader for batching.

---

### Migration Strategies

**Flyway/Liquibase for SQL (version control for DB):**
```
migrations/
  V1__initial_schema.sql
  V2__add_users_table.sql
  V3__add_posts_table.sql
```

**Prisma Migrate:**
```bash
npx prisma migrate dev --name add_posts_table
```

**Zero-downtime migrations (critical in production):**
```javascript
// Step 1: Add new column (backward compatible, old code still works)
ALTER TABLE users ADD COLUMN new_field VARCHAR(255);

// Step 2: Deploy code that writes to both old and new columns
function saveUser(user) {
  db.users.update({
    old_field: user.old_field,
    new_field: user.new_field // New code writes to both
  });
}

// Step 3: Migrate existing data
UPDATE users SET new_field = old_field WHERE new_field IS NULL;

// Step 4: Deploy code that only reads new column
function getUser(id) {
  return db.users.findOne().select('new_field');
}

// Step 5: Drop old column (optional, if truly unused)
ALTER TABLE users DROP COLUMN old_field;
```

**Key takeaway:** Version control migrations. Deploy in steps for zero-downtime.

---

## Production Patterns & Architecture

### Graceful Shutdown

**Why it matters:** Don't lose in-flight requests. Complete current work, reject new, close resources.

```javascript
const server = app.listen(3000);
let isShuttingDown = false;

async function gracefulShutdown() {
  isShuttingDown = true;
  
  // Stop accepting new requests
  server.close(async () => {
    console.log('Server closed');
    
    // Close database connections
    await pool.end();
    await mongoose.connection.close();
    
    // Flush logs
    await logger.flush();
    
    process.exit(0);
  });
  
  // Force shutdown after timeout (kill -9 fallback)
  setTimeout(() => {
    console.error('Shutdown timeout, force exiting');
    process.exit(1);
  }, 30000);
}

// Handle signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Reject new requests during shutdown
app.use((req, res, next) => {
  if (isShuttingDown) {
    res.status(503).json({ error: 'Server is shutting down' });
  } else {
    next();
  }
});
```

**Key takeaway:** Stop accepting requests. Wait for in-flight. Close connections. Timeout fallback.

---

### Memory Management & Leak Prevention

**Detecting memory leaks (increasing RSS without GC helping):**
```javascript
const v8 = require('v8');
const fs = require('fs');

// Heap snapshot (can analyze with Chrome DevTools)
function takeSnapshot() {
  const fileName = `heap-${Date.now()}.heapsnapshot`;
  const snapshot = v8.writeHeapSnapshot(fileName);
  console.log('Snapshot:', fileName);
}

// Monitor memory
setInterval(() => {
  const mem = process.memoryUsage();
  console.log({
    rss: Math.round(mem.rss / 1024 / 1024) + ' MB',
    heapUsed: Math.round(mem.heapUsed / 1024 / 1024) + ' MB',
    heapTotal: Math.round(mem.heapTotal / 1024 / 1024) + ' MB'
  });
  
  if (mem.heapUsed > 500 * 1024 * 1024) {
    takeSnapshot();
  }
}, 10000);
```

**Common memory leak patterns:**
```javascript
// ❌ LEAK: Global cache without limit
const cache = {}; // grows unbounded
app.get('/user/:id', (req, res) => {
  if (!cache[req.params.id]) {
    cache[req.params.id] = expensiveOperation();
  }
  res.json(cache[req.params.id]);
});

// ✅ FIX: Use LRU cache with size limit
const LRU = require('lru-cache');
const cache = new LRU({ max: 1000, maxAge: 60000 });

// ❌ LEAK: Event listeners not removed
const subscriber = {};
client.on('message', handler);
// Later: forgot to remove listener = leak

// ✅ FIX: Clean up listeners
process.on('SIGTERM', () => {
  client.removeListener('message', handler);
});

// ❌ LEAK: Circular references in error objects
const error = new Error('Something');
error.circular = error; // Keeps reference
// GC can't cleanup

// ✅ FIX: Use Error.captureStackTrace, avoid circular refs
```

**Key takeaway:** Monitor heap. LRU caches. Remove listeners. Avoid circular refs.

---

### Caching Strategies

**Redis for distributed cache:**
```javascript
const redis = require('redis');
const client = redis.createClient();

app.get('/user/:id', async (req, res) => {
  const userId = req.params.id;
  
  // Check cache
  let user = await client.get(`user:${userId}`);
  if (user) {
    return res.json(JSON.parse(user));
  }
  
  // Fetch from DB
  user = await User.findById(userId);
  
  // Store in cache (1 hour TTL)
  await client.setex(`user:${userId}`, 3600, JSON.stringify(user));
  
  res.json(user);
});

// Invalidate on update
app.put('/user/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body);
  await client.del(`user:${req.params.id}`); // Invalidate
  res.json(user);
});
```

**Cache invalidation patterns:**
- **TTL:** Expire after time (simple but stale data)
- **Event-based:** Invalidate on update (immediate but requires coordination)
- **LRU:** Keep most-used (good for bounded memory)
- **Write-through:** Write DB → write cache (consistency)
- **Write-behind:** Write cache → async DB (fast writes, durability risk)

**Key takeaway:** Redis for distributed caching. TTL for simplicity. Event-based for freshness.

---

### Error Recovery & Retry Logic

**Exponential backoff with jitter:**
```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      
      if (attempt < maxRetries - 1) {
        // Exponential backoff: 100ms, 200ms, 400ms
        const delay = Math.pow(2, attempt) * 100;
        // Jitter: avoid thundering herd
        const jitter = Math.random() * delay;
        await new Promise(r => setTimeout(r, delay + jitter));
      }
    }
  }
  
  throw lastError;
}

// Usage
const data = await retryWithBackoff(() => fetch('/api/data'), 3);
```

**Circuit breaker pattern (prevent cascading failures):**
```javascript
class CircuitBreaker {
  constructor(fn, { threshold = 5, timeout = 60000 } = {}) {
    this.fn = fn;
    this.state = 'closed'; // closed, open, half-open
    this.failures = 0;
    this.threshold = threshold;
    this.timeout = timeout;
  }
  
  async call(...args) {
    if (this.state === 'open') {
      if (Date.now() - this.openedAt > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await this.fn(...args);
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }
  
  onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }
  
  onFailure() {
    this.failures++;
    if (this.failures >= this.threshold) {
      this.state = 'open';
      this.openedAt = Date.now();
    }
  }
}

const breaker = new CircuitBreaker(() => fetch('/api/slow'));
try {
  await breaker.call();
} catch (err) {
  // Fail fast instead of hanging
}
```

**Key takeaway:** Exponential backoff with jitter. Circuit breaker to fail fast.

---

## Security Patterns

### Authentication

**JWT (JSON Web Token) pattern:**
```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Register
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await User.create({ email, password: hashedPassword });
  res.json({ user });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({ token });
});

// Middleware to verify token
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/profile', verifyToken, async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json(user);
});
```

**Session-based authentication (traditional):**
```javascript
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');

app.use(session({
  store: new RedisStore({ client: redis.createClient() }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    httpOnly: true, // No JavaScript access
    sameSite: 'strict', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.post('/login', (req, res) => {
  req.session.userId = user.id;
  res.json({ message: 'Logged in' });
});

app.get('/profile', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ userId: req.session.userId });
});
```

**Key takeaway:** JWT for APIs (stateless). Sessions for web apps (stateful). Always use HTTPS.

---

### Input Validation & Sanitization

**Prevent SQL injection & XSS:**
```javascript
const { query, body, validationResult } = require('express-validator');

// Validate and sanitize
app.post('/users', [
  body('email').isEmail().normalizeEmail(),
  body('name').trim().isLength({ min: 1, max: 100 }).escape(),
  body('age').isInt({ min: 0, max: 150 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // Safe to use req.body
  const user = await User.create(req.body);
  res.json(user);
});

// Never use template strings with user input
// ❌ WRONG: SQL injection risk
db.query(`SELECT * FROM users WHERE id = ${userId}`);

// ✅ CORRECT: Parameterized queries
db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

**Rate limiting:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit 100 requests per windowMs
  message: 'Too many requests',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false
});

app.post('/login', limiter, (req, res) => {
  // Handle login
});

// Stricter limit for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Max 5 login attempts
  skipSuccessfulRequests: true // Don't count successful logins
});

app.post('/login', loginLimiter, (req, res) => { });
```

**CORS (Cross-Origin Resource Sharing):**
```javascript
const cors = require('cors');

// Allow specific origins
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Key takeaway:** Parameterized queries. Validate/sanitize input. Rate limit. CORS whitelist.

---

## Monitoring, Logging & Debugging

### Structured Logging

**Why structured logging matters:**
- Machine parseable (JSON)
- Aggregatable (search by field)
- Contextual (request ID, user ID)
- Debuggable (trace entire request)

```javascript
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

app.use((req, res, next) => {
  req.id = crypto.randomUUID(); // Unique request ID
  
  logger.info({
    event: 'request_start',
    method: req.method,
    path: req.path,
    requestId: req.id
  });
  
  res.on('finish', () => {
    logger.info({
      event: 'request_end',
      statusCode: res.statusCode,
      duration: Date.now() - startTime,
      requestId: req.id
    });
  });
  
  next();
});

// Use throughout app
logger.error({
  event: 'database_error',
  error: err.message,
  stack: err.stack,
  requestId: req.id
});
```

**Log levels (use appropriately):**
- **ERROR:** Unrecoverable, needs attention (database down, payment failed)
- **WARN:** Might indicate problem (slow query, deprecated API usage)
- **INFO:** Important events (user login, deployment, job completion)
- **DEBUG:** Detailed debugging (function entry/exit, variable values)
- **TRACE:** Most verbose (every variable assignment)

**Key takeaway:** Structured logging with request ID. Aggregatable JSON. Right log level.

---

### Error Tracking

**Sentry for error monitoring:**
```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1 // 10% of transactions for performance monitoring
});

app.use(Sentry.Handlers.requestHandler());

app.get('/error', (req, res) => {
  throw new Error('Test error');
});

app.use(Sentry.Handlers.errorHandler());

// Manual capture
try {
  riskyOperation();
} catch (err) {
  Sentry.captureException(err, {
    tags: { section: 'checkout' },
    level: 'warning'
  });
}
```

**Key takeaway:** Auto-capture unhandled errors. Manual context for important events.

---

### Performance Monitoring (APM)

**Node.js with New Relic/DataDog:**
```javascript
// new-relic.js (require this first!)
require('newrelic');

// Automatic instrumentation includes:
// - HTTP transactions
// - Database queries
// - External services
// - Memory usage
```

**Custom metrics:**
```javascript
const StatsD = require('node-statsd').StatsD;
const dogstatsd = new StatsD();

app.get('/api/data', async (req, res) => {
  const start = Date.now();
  const data = await fetchData();
  const duration = Date.now() - start;
  
  dogstatsd.gauge('api.response_time', duration);
  dogstatsd.increment('api.calls', 1);
  
  res.json(data);
});
```

**Key takeaway:** APM auto-instruments. Custom metrics for domain logic.

---

## Testing Strategies

### Unit Testing

```javascript
const assert = require('assert');
const { sum, multiply } = require('./math');

describe('Math functions', () => {
  it('should add numbers correctly', () => {
    assert.strictEqual(sum(2, 3), 5);
  });
  
  it('should multiply numbers correctly', () => {
    assert.strictEqual(multiply(2, 3), 6);
  });
});
```

### Integration Testing

```javascript
const request = require('supertest');
const app = require('./app');
const User = require('./models/User');

describe('User API', () => {
  beforeEach(async () => {
    await User.deleteMany({}); // Clean DB
  });
  
  it('should create a user', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Alice', email: 'alice@example.com' });
    
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.name, 'Alice');
    
    const user = await User.findOne({ email: 'alice@example.com' });
    assert(user);
  });
});
```

### E2E Testing

```javascript
const { chromium } = require('playwright');

describe('User signup flow', () => {
  let browser;
  
  before(async () => {
    browser = await chromium.launch();
  });
  
  after(async () => {
    await browser.close();
  });
  
  it('should complete signup', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/signup');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation();
    assert.strictEqual(page.url(), 'http://localhost:3000/dashboard');
  });
});
```

**Testing pyramid (what to focus on):**
```
        E2E (few, slow, real browser)
      Integration (some, moderate speed)
    Unit tests (many, fast, isolated)
```

**Key takeaway:** Many fast unit tests. Some integration tests. Few slow E2E tests.

---

## Performance & Optimization

### Event Loop Blocking

**Detecting blocked event loop:**
```javascript
// Simple: Check if setImmediate delay increases
const delays = [];
setImmediate(() => {
  const delay = Date.now() - start;
  delays.push(delay);
  
  if (delay > 100) {
    logger.warn({ event: 'event_loop_blocked', delay });
  }
});

// Better: Use clinicjs (production profiling)
// npx clinic doctor -- node app.js
```

**Common blocking operations:**
```javascript
// ❌ BLOCKING: Synchronous file read
const data = fs.readFileSync('large-file.txt');

// ✅ CORRECT: Async
const data = await fs.promises.readFile('large-file.txt');

// ❌ BLOCKING: CPU-intensive loop
for (let i = 0; i < 1e8; i++) {
  // Heavy computation
}

// ✅ CORRECT: Use worker thread
const worker = new Worker('./worker.js');
worker.postMessage(data);

// ❌ BLOCKING: Regex on large string
const regex = /(.+)+$/; // Catastrophic backtracking
text.match(regex);

// ✅ CORRECT: Optimize regex
const regex = /^[a-z]+$/; // Specific pattern
```

**Key takeaway:** Async/await over sync. Worker threads for CPU. Optimize regex.

---

## Production Wisdom (10+ Years)

### What Separates Juniors from Seniors

**Junior focus:**
- "Does it work?"
- Implements features
- Writes code

**Senior focus:**
- "Will it scale? Can we maintain it? What can go wrong?"
- Designs systems
- Prevents problems

**Real examples:**

**Example 1: Database query**
- Junior: `User.find({})` returns 1M users, crashes memory
- Senior: Pagination, streaming, indices checked before writing

**Example 2: Error handling**
- Junior: `try-catch` around everything (false security)
- Senior: Knows which errors are recoverable (network timeout = retry, invalid input = 400)

**Example 3: Cache invalidation**
- Junior: "Let's cache everything!"
- Senior: Knows it's "one of two hard things in CS". Only caches what matters, has expiry + invalidation plan

**Example 4: Production debugging**
- Junior: "Add console.log"
- Senior: Structured logging + request ID + error tracking + APM

### Common Pitfalls

**1. Not handling backpressure (stream pipes):**
```javascript
// ❌ WRONG: Can buffer entire file in memory
fs.createReadStream('large-file.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('file.gz'));

// ✅ CORRECT: Automatically handles backpressure
fs.createReadStream('large-file.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('file.gz'));

// If pipe doesn't handle backpressure (custom transform):
readStream.on('data', (chunk) => {
  const transformed = heavyTransform(chunk);
  if (!writeStream.write(transformed)) {
    readStream.pause(); // Backpressure
  }
});

writeStream.on('drain', () => {
  readStream.resume(); // Continue
});
```

**2. Infinite redirects in HTTP**
```javascript
// ❌ WRONG: 301 to same URL = infinite loop
app.get('/user', (req, res) => {
  res.redirect('/user'); // INFINITE!
});

// ✅ CORRECT: Think redirect destination through
app.get('/user/:id', (req, res) => {
  res.redirect(`/users/${req.params.id}`); // Different path
});
```

**3. Missing error handling in async code:**
```javascript
// ❌ WRONG: Error silently dropped
setTimeout(() => {
  throw new Error('Timeout error');
}, 1000);

// ✅ CORRECT: Handle error
setTimeout(() => {
  try {
    riskyOperation();
  } catch (err) {
    logger.error(err);
  }
}, 1000);

// ❌ WRONG: Promise without catch
promise.then(doSomething);

// ✅ CORRECT: Handle rejection
promise.then(doSomething).catch(logger.error);
```

**4. Connection pooling set too low:**
```javascript
// ❌ WRONG: max: 5, but receiving 100 requests
const pool = new Pool({ max: 5 }); // Only 95 queue, some timeout

// ✅ CORRECT: Monitor queue length, set appropriately
const pool = new Pool({ max: 20, idleTimeoutMillis: 30000 });
```

**5. Not implementing graceful shutdown:**
```javascript
// ❌ WRONG: Immediate exit kills in-flight requests
process.on('SIGTERM', () => process.exit(0));

// ✅ CORRECT: Wait for in-flight, close resources
process.on('SIGTERM', async () => {
  server.close();
  await pool.end();
  process.exit(0);
});
```

### Production War Stories

**Story 1: The Memory Leak That Took Down Production**
- Cached user data without size limit
- 50M users, each 1KB = 50GB memory
- Server crashed daily at 3AM (more requests = more cache)
- Fix: LRU cache with maxSize

**Story 2: The Cascading Failure**
- Slow database query (100ms)
- 1000 requests/sec = 100 requests queued
- Each queued request waiting for connection = more waiting
- New requests timeout, crash app
- Fix: Circuit breaker + bulkheads (limit queue size per operation)

**Story 3: The Silent Error**
- API endpoint not returning errors
- `promise.then(save).then(respond);` without catch
- Errors silently dropped
- Users thought saves succeeded, data lost
- Fix: Centralized error handling, APM, structured logging

**Story 4: The Timezone Bug**
- JavaScript Date uses local timezone
- Developer tested in UTC, deployed to EST
- All timestamps were 5 hours off
- Fix: Always use ISO strings or Unix timestamps

---

## Interview Tips (Advanced)

### How Seniors Answer Questions

**Question: "How would you design an API that handles millions of requests?"**

*Junior answer:* "Use Node.js because it's fast and asynchronous."
- Missing: Scale, caching, database, monitoring, failure modes

*Senior answer:* "Millions of requests requires thinking about the entire stack:

1. **Load balancing:** Multiple Node.js instances behind nginx/HAProxy. Each instance stateless so any can handle any request.

2. **Database:** Single instance becomes bottleneck. Read replicas for queries. Write-only to primary. Connection pooling essential.

3. **Caching:** Redis in front of database. Cache invalidation strategy (TTL for reads, event-based for writes). Circuit breaker if Redis down.

4. **API Design:** Pagination to prevent large responses. Cursor-based for real-time data. Rate limiting per IP/user to prevent abuse. Proper HTTP status codes.

5. **Monitoring:** APM to identify slow queries. Structured logging with request IDs. Error tracking. Alerts on response time degradation.

6. **Failure modes:** What if database is slow? (queue, timeout, degrade service) What if Redis fails? (fall through to DB) What if one instance crashes? (auto-restart, load balancer routes away)

7. **Graceful degradation:** Can serve cached data if database is down? Can fall back to a smaller dataset? Can queue writes and process later?

In production, I'd start with a single instance, add load balancing when CPU saturates, add caching when database queries increase, add monitoring from day 1."

---

### Red Flags Interviewers Watch For

**What NOT to say:**
1. "I don't worry about error handling" → No production experience
2. "Cache everything, it's fast" → Doesn't understand cache invalidation
3. "Node.js blocks on I/O operations" → Fundamental misunderstanding
4. "I always use callbacks" → Stuck in old patterns
5. "No need to log, testing covers everything" → Doesn't debug in production
6. "I've never had to deal with race conditions" → Too much greenfield work
7. "Passwords in config files are fine during development" → Security liability
8. "I don't use types, it's overkill for Node.js" → 2026 standard is TypeScript

**What shows expertise:**
- "I've debugged a production memory leak"
- "Here's how I prevent N+1 queries"
- "I always use transactions for multi-step operations"
- "I implemented graceful shutdown to prevent data loss"
- "I've seen cascading failures and use circuit breakers"
- "I structure logs with request IDs for tracing"
- "Monitoring comes first, then optimization"

---

### Interview Questions You'll Get

**"Explain the Node.js event loop"**
- Don't just list phases. Explain why it matters (async, non-blocking)
- Explain microtasks queue (nextTick, Promises)
- Show you understand blocking (event loop can block, how to prevent)

**"How do you prevent N+1 queries?"**
- Eager loading (populate, include)
- DataLoader for GraphQL
- Manual join for complex cases
- Example from production

**"Design a caching strategy"**
- What to cache (expensive queries)
- When to invalidate (TTL vs event-based)
- What if cache fails (circuit breaker)
- How to monitor (hit rate metrics)

**"How do you handle database connection pooling?"**
- Max size = concurrent connections needed
- Idle timeout = release unused connections
- Connection timeout = fail fast if pool exhausted
- Monitoring = queue depth, wait time

**"Tell me about a production incident you debugged"**
- This is your chance to show wisdom
- Start with symptom (slow requests, memory growth)
- Walk through investigation (logs, profiling)
- Show root cause (cache without limit, query not indexed)
- Explain fix and prevention

---

**Updated:** 2026-08-22 | **Level:** Advanced (10+ Years Production Experience) | **Format:** Production-grade patterns and wisdom

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
