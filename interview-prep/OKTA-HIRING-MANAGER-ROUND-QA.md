# Okta Hiring Manager Round - Node.js & React.js Interview Q&A

> Prepared for: Technical hiring manager discussions
> Focus: Architecture, design patterns, real-world scenarios, and team collaboration

---

## Table of Contents
1. [Node.js Core Concepts](#nodejs-core-concepts)
2. [React.js Core Concepts](#reactjs-core-concepts)
3. [System Design & Architecture](#system-design--architecture)
4. [Real-World Problem Solving](#real-world-problem-solving)
5. [Leadership & Collaboration](#leadership--collaboration)
6. [Behavioral Questions](#behavioral-questions)

---

## Node.js Core Concepts

### Q1: Event Loop in Node.js
**Question:** Explain the Node.js event loop and its phases. How would you optimize performance-heavy operations?

**Answer:**
The event loop is Node.js's core mechanism for handling asynchronous operations:

**Phases (in order):**
1. **Timers** - Execute setTimeout/setInterval callbacks
2. **Pending Callbacks** - Execute deferred I/O callbacks
3. **Idle/Prepare** - Internal use
4. **Poll** - Retrieve new I/O events
5. **Check** - Execute setImmediate callbacks
6. **Close Callbacks** - Close event handlers

**Performance Optimization:**
```javascript
// ❌ Blocks event loop - heavy computation
app.get('/data', (req, res) => {
  const result = heavyComputation();
  res.json(result);
});

// ✅ Offload to worker threads
const { Worker } = require('worker_threads');

app.get('/data', (req, res) => {
  const worker = new Worker('./worker.js');
  worker.on('message', (result) => {
    res.json(result);
  });
  worker.postMessage({ data: 'input' });
});

// ✅ Use process.nextTick for microtasks
process.nextTick(() => {
  // Executed before next phase
});

// ✅ Use setImmediate for I/O bound tasks
setImmediate(() => {
  // Deferred to check phase
});
```

**Key Point:** Heavy CPU operations should be moved to worker threads to prevent blocking the event loop.

---

### Q2: Memory Leaks in Node.js
**Question:** What are common memory leak patterns in Node.js applications? How would you debug them?

**Answer:**
**Common Patterns:**
1. **Unbounded caches**
2. **Event listener accumulation**
3. **Circular references**
4. **Timer/interval not cleared**

**Detection & Debugging:**
```javascript
// ❌ Memory leak - cache grows indefinitely
const cache = {};
function getCachedData(id) {
  if (!cache[id]) {
    cache[id] = expensiveOperation(id);
  }
  return cache[id];
}

// ✅ Fixed - use LRU cache with max size
const LRU = require('lru-cache');
const cache = new LRU({ max: 1000, ttl: 1000 * 60 * 5 });

function getCachedData(id) {
  if (!cache.has(id)) {
    cache.set(id, expensiveOperation(id));
  }
  return cache.get(id);
}

// ❌ Event listener leak
eventEmitter.on('event', handler);
// If not removed, accumulates over time

// ✅ Remove listeners properly
eventEmitter.removeListener('event', handler);
// Or use once() for single-use listeners
eventEmitter.once('event', handler);
```

**Debugging Tools:**
- `node --inspect` for Chrome DevTools profiling
- `clinic.js` for memory profiling
- Heap snapshots to compare before/after

---

### Q3: Clustering & Load Balancing
**Question:** How would you scale a Node.js application for high traffic? Discuss clustering and load balancing strategies.

**Answer:**
```javascript
// Clustering approach
const cluster = require('cluster');
const os = require('os');
const express = require('express');

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  // Master process spawns workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} exited`);
    // Restart failed worker
    cluster.fork();
  });
} else {
  // Worker process
  const app = express();
  
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Hello',
      pid: process.pid 
    });
  });

  app.listen(3000);
}
```

**Load Balancing Strategies:**

| Strategy | Use Case | Pros | Cons |
|----------|----------|------|------|
| **Sticky Sessions** | WebSocket/persistent connections | Session affinity | Uneven distribution |
| **Round Robin** | Stateless APIs | Simple, even load | No affinity |
| **IP Hash** | Distributed caching | Cache locality | Unbalanced if IPs vary |
| **Least Connections** | Long-lived connections | Adaptive balancing | Compute overhead |

**Production Approach:**
- Use **Nginx/HAProxy** for reverse proxy
- Implement **health checks**
- Use **Blue-Green deployments** for zero downtime

---

### Q4: Streaming & Large File Handling
**Question:** How would you efficiently handle file uploads and downloads in a Node.js API?

**Answer:**
```javascript
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// ❌ Loads entire file into memory
app.post('/upload', (req, res) => {
  const data = [];
  req.on('data', chunk => data.push(chunk));
  req.on('end', () => {
    const buffer = Buffer.concat(data);
    fs.writeFileSync('file.bin', buffer);
    res.send('Uploaded');
  });
});

// ✅ Use pipe for streaming
app.post('/upload', (req, res) => {
  const file = fs.createWriteStream('file.bin');
  req.pipe(file);
  
  file.on('finish', () => res.send('Uploaded'));
  file.on('error', (err) => {
    fs.unlink('file.bin', () => res.status(500).send('Error'));
  });
});

// ✅ Download with streaming
app.get('/download/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'files', req.params.filename);
  
  // Set headers for download
  res.setHeader('Content-Disposition', 
    `attachment; filename="${path.basename(filePath)}"`);
  
  // Use pipe for efficient streaming
  fs.createReadStream(filePath).pipe(res);
});

// ✅ Handle large file uploads with progress
const busboy = require('busboy');

app.post('/upload-progress', (req, res) => {
  const bb = busboy({ headers: req.headers });
  
  bb.on('file', (fieldname, file, info) => {
    const savePath = path.join(__dirname, 'uploads', info.filename);
    const writeStream = fs.createWriteStream(savePath);
    
    let uploadedBytes = 0;
    
    file.on('data', (data) => {
      uploadedBytes += data.length;
      console.log(`Uploaded: ${uploadedBytes} bytes`);
    });
    
    file.pipe(writeStream);
    writeStream.on('finish', () => res.send('Done'));
  });
  
  req.pipe(bb);
});
```

**Key Point:** Always use streams for large files to minimize memory usage.

---

### Q5: Error Handling & Resilience
**Question:** How do you handle errors in async/await code? Discuss resilience patterns.

**Answer:**
```javascript
// ❌ Poor error handling
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  return data;
}

// ✅ Proper error handling
async function fetchUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error; // Re-throw or handle appropriately
  }
}

// ✅ Retry logic (Exponential Backoff)
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// ✅ Circuit Breaker Pattern
class CircuitBreaker {
  constructor(fn, options = {}) {
    this.fn = fn;
    this.failureThreshold = options.failureThreshold || 5;
    this.timeout = options.timeout || 60000;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.nextAttempt = Date.now();
  }

  async call(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await this.fn(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}

// Usage
const breaker = new CircuitBreaker(fetchUser);
try {
  const user = await breaker.call(123);
} catch (error) {
  console.error('Service unavailable:', error);
}

// ✅ Global error handler middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});
```

---

## React.js Core Concepts

### Q6: React Rendering & Performance Optimization
**Question:** How do you identify and fix performance issues in a React application?

**Answer:**
```javascript
// ❌ Performance issue - unnecessary re-renders
function ParentComponent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <ChildComponent data={{ userId: 1 }} />
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
}

// Child re-renders even though props.data hasn't changed
// (new object reference each render)
function ChildComponent({ data }) {
  return <div>{data.userId}</div>;
}

// ✅ Solution 1: useMemo for object stability
function ParentComponent() {
  const [count, setCount] = useState(0);
  const data = useMemo(() => ({ userId: 1 }), []);

  return (
    <div>
      <ChildComponent data={data} />
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
}

// ✅ Solution 2: React.memo to prevent re-renders
const ChildComponent = React.memo(({ data }) => {
  return <div>{data.userId}</div>;
});

// ✅ Solution 3: Code splitting with lazy loading
const HeavyComponent = React.lazy(() => 
  import('./HeavyComponent')
);

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}

// ✅ Performance monitoring
function PerformanceMonitor() {
  useEffect(() => {
    if (window.PerformanceObserver) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(`${entry.name}: ${entry.duration}ms`);
        }
      });

      observer.observe({ 
        entryTypes: ['measure', 'navigation', 'resource'] 
      });
    }
  }, []);

  return null;
}
```

**Key Optimization Techniques:**
- Memoization (useMemo, useCallback, React.memo)
- Code splitting and lazy loading
- Virtual scrolling for large lists
- Pagination instead of loading all data
- Debouncing/throttling event handlers
- Tree shaking unused code
- Image optimization and lazy loading

---

### Q7: State Management Strategies
**Question:** When would you use Redux vs. Context API? Discuss trade-offs.

**Answer:**

| Feature | Context API | Redux |
|---------|-------------|-------|
| **Bundle Size** | Smaller (~8KB) | Larger (~20KB) |
| **Learning Curve** | Easier | Steeper |
| **DevTools** | Limited | Excellent |
| **Performance** | Can cause re-renders | Optimized selectors |
| **Middleware** | Not built-in | Built-in |
| **Scalability** | Good for small apps | Best for large apps |

**Context API - Best for:**
```javascript
// Simple state sharing without much logic
const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  const value = useMemo(() => ({
    user,
    setUser
  }), [user]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Use with useReducer for complex state
function useUserReducer() {
  const [state, dispatch] = useReducer(userReducer, initialState);
  
  return {
    user: state.user,
    login: (credentials) => dispatch({ type: 'LOGIN', credentials }),
    logout: () => dispatch({ type: 'LOGOUT' })
  };
}
```

**Redux - Best for:**
```javascript
// Complex state with many interactions, time-travel debugging
import { createSlice, configureStore } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: { user: null },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    }
  }
});

const store = configureStore({
  reducer: {
    user: userSlice.reducer
  }
});

// Components with selectors
function UserProfile() {
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();

  return <div>{user?.name}</div>;
}
```

**Decision Matrix:**
- Simple app, few components sharing state → **Context API**
- Complex app, multiple state slices, time-travel debugging needed → **Redux**
- Alternative: Zustand or Jotai for middle ground

---

### Q8: React Hooks Deep Dive
**Question:** Explain custom hooks. Provide an example of a complex custom hook.

**Answer:**
```javascript
// ✅ Custom hook for data fetching with caching
function useFetch(url, options = {}) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null
  });

  const cacheRef = useRef(new Map());

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Check cache first
        if (cacheRef.current.has(url)) {
          setState(prev => ({
            ...prev,
            data: cacheRef.current.get(url),
            loading: false
          }));
          return;
        }

        setState(prev => ({ ...prev, loading: true }));
        
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        if (isMounted) {
          cacheRef.current.set(url, data);
          setState({
            data,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error: error.message
          });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url, options]);

  return state;
}

// ✅ Custom hook for form state management
function useForm(initialValues, onSubmit) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit
  };
}

// Usage
function LoginForm() {
  const form = useForm(
    { email: '', password: '' },
    async (values) => {
      await loginAPI(values);
    }
  );

  return (
    <form onSubmit={form.handleSubmit}>
      <input
        name="email"
        value={form.values.email}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
      />
      <button type="submit" disabled={form.isSubmitting}>
        Login
      </button>
    </form>
  );
}
```

**Hook Rules:**
1. Only call hooks at top level (not in loops/conditions)
2. Only call hooks from React components or custom hooks
3. Use ESLint plugin to enforce rules

---

### Q9: React Patterns & Anti-patterns
**Question:** Discuss common React anti-patterns and how to avoid them.

**Answer:**
```javascript
// ❌ Anti-pattern 1: Using array index as key
function List({ items }) {
  return items.map((item, index) => (
    <div key={index}>{item.name}</div>
  ));
}

// ✅ Use unique, stable identifier
function List({ items }) {
  return items.map((item) => (
    <div key={item.id}>{item.name}</div>
  ));
}

// ❌ Anti-pattern 2: Conditional rendering with &&
function Component({ hasAccess }) {
  return hasAccess && <Dashboard />; // Can render 'false'
}

// ✅ Use ternary or if-statement
function Component({ hasAccess }) {
  return hasAccess ? <Dashboard /> : null;
}

// ❌ Anti-pattern 3: Over-nesting (callback hell)
function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(id).then(u => {
      fetchPosts(u.id).then(posts => {
        fetchComments(posts[0].id).then(comments => {
          // Deeply nested
        });
      });
    });
  }, []);
}

// ✅ Flatten with async/await or compose
function UserProfile() {
  useEffect(async () => {
    try {
      const user = await fetchUser(id);
      const posts = await fetchPosts(user.id);
      const comments = await fetchComments(posts[0].id);
      // Flat structure
    } catch (error) {
      console.error(error);
    }
  }, []);
}

// ❌ Anti-pattern 4: Inline function definitions
function Component() {
  const handleClick = () => console.log('clicked');
  return <Child onClick={handleClick} />;
}

// ✅ Use useCallback
function Component() {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  return <Child onClick={handleClick} />;
}

// ❌ Anti-pattern 5: Missing dependency arrays
function Component() {
  const fetchData = () => { /* ... */ };
  
  useEffect(() => {
    fetchData();
  }); // Runs every render!
}

// ✅ Include all dependencies
function Component() {
  const fetchData = useCallback(() => { /* ... */ }, []);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Explicit dependencies
}
```

---

## System Design & Architecture

### Q10: Full-Stack Architecture for Okta Integration
**Question:** How would you design a system that integrates Okta SSO for authentication and user management?

**Answer:**
```
┌─────────────────────────────────────────────────────┐
│            Client Application (React)                │
│  - Login button → Redirects to Okta AuthZ endpoint  │
│  - Stores tokens (access + ID) in memory/secure    │
│  - Handles protected routes                          │
└────────────────┬────────────────────────────────────┘
                 │
                 ├─────────────────────────────────────────┐
                 │                                         │
        ┌────────▼──────────┐               ┌────────────▼─────┐
        │  Okta Auth Server │               │  API Backend      │
        │                   │               │  (Node.js/Express)│
        │ - Authorization   │               │                   │
        │ - Token Exchange  │               │ - Verify JWT      │
        │ - User Info       │               │ - Route handlers  │
        └────────┬──────────┘               │ - DB queries      │
                 │                          │ - Business logic  │
                 └──────────────┬───────────┴──────────┬────────┘
                                │                      │
                                │        ┌─────────────▼─────┐
                                │        │   Database        │
                                │        │ - User profiles   │
                                │        │ - Permissions     │
                                │        │ - Audit logs      │
                                │        └───────────────────┘
                                │
                 ┌──────────────────────────────────────────┐
                 │     Okta API (Management & OIDC)         │
                 │ - User provisioning                       │
                 │ - Group management                        │
                 │ - OIDC discovery                          │
                 └──────────────────────────────────────────┘
```

**Implementation:**

```javascript
// Backend: JWT verification middleware
const jwt = require('jsonwebtoken');
const axios = require('axios');

const OKTA_ISSUER = process.env.OKTA_ISSUER;
const OKTA_CLIENT_ID = process.env.OKTA_CLIENT_ID;

let cachedKeys = null;

async function getPublicKeys() {
  if (cachedKeys) return cachedKeys;
  
  const response = await axios.get(`${OKTA_ISSUER}/.well-known/oauth2/default/v1/keys`);
  cachedKeys = response.data.keys;
  return cachedKeys;
}

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getPublicKey, {
      algorithms: ['RS256'],
      issuer: OKTA_ISSUER,
      audience: OKTA_CLIENT_ID
    }, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
}

// Middleware
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing token' });

  const [, token] = authHeader.split(' ');
  
  try {
    const claims = await verifyToken(token);
    req.user = claims;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
}

app.use('/api', authMiddleware);
```

```javascript
// Frontend: React with Okta SDK
import OktaAuth from '@okta/okta-auth-js';
import { useOktaAuth } from '@okta/okta-react';

const oktaAuth = new OktaAuth({
  issuer: process.env.REACT_APP_OKTA_ISSUER,
  clientId: process.env.REACT_APP_OKTA_CLIENT_ID,
  redirectUri: window.location.origin + '/login/callback'
});

function RequiredAuth({ children }) {
  const { authState } = useOktaAuth();
  
  if (!authState) return <div>Loading...</div>;
  
  if (!authState.isAuthenticated) {
    return <Login />;
  }

  return children;
}

function useApiCall() {
  const { authState } = useOktaAuth();

  return async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${authState.accessToken.accessToken}`
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  };
}
```

---

## Real-World Problem Solving

### Q11: Handling Large-Scale Data in React
**Question:** How would you display a list of 100,000 items efficiently in React?

**Answer:**
```javascript
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

// ✅ Virtual scrolling - renders only visible items
function LargeDataList({ items }) {
  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          itemCount={items.length}
          itemSize={35}
          width={width}
        >
          {({ index, style }) => (
            <div style={style}>
              {items[index].name}
            </div>
          )}
        </List>
      )}
    </AutoSizer>
  );
}

// ✅ Pagination approach
function PaginatedList({ initialPage = 1 }) {
  const [page, setPage] = useState(initialPage);
  const itemsPerPage = 50;
  const { data, loading } = useFetch(
    `/api/items?page=${page}&limit=${itemsPerPage}`
  );

  return (
    <div>
      {data?.items?.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
      <button 
        onClick={() => setPage(p => p + 1)}
        disabled={loading}
      >
        Load More
      </button>
    </div>
  );
}

// ✅ Infinite scroll with Intersection Observer
function InfiniteScrollList() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setPage(p => p + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchItems(page).then(newItems => {
      setItems(prev => [...prev, ...newItems]);
    });
  }, [page]);

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
      <div ref={observerTarget} />
    </div>
  );
}
```

**Comparison:**
| Approach | Use Case | Pros | Cons |
|----------|----------|------|------|
| **Virtual Scrolling** | Tables, feeds | Best performance | Libraries needed |
| **Pagination** | Search results | Predictable, SEO friendly | Extra clicks |
| **Infinite Scroll** | Social feeds | Seamless UX | Can be overwhelming |

---

### Q12: Error Handling in Complex Node.js Services
**Question:** Design a robust error handling strategy for a microservices architecture.

**Answer:**
```javascript
// Standardized error class
class APIError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

// Error types
class ValidationError extends APIError {
  constructor(message, details = {}) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class NotFoundError extends APIError {
  constructor(message) {
    super(message, 404, 'NOT_FOUND');
  }
}

class UnauthorizedError extends APIError {
  constructor(message) {
    super(message, 401, 'UNAUTHORIZED');
  }
}

// Logger
const logger = {
  error: (message, error, context = {}) => {
    console.error({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      code: error?.code,
      stack: error?.stack,
      ...context
    });
  },
  warn: (message, context = {}) => {
    console.warn({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      ...context
    });
  }
};

// Async error wrapper
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Routes
app.get('/users/:id', asyncHandler(async (req, res) => {
  if (!req.params.id.match(/^\d+$/)) {
    throw new ValidationError('Invalid user ID', { id: req.params.id });
  }

  const user = await db.findUser(req.params.id);
  if (!user) {
    throw new NotFoundError(`User ${req.params.id} not found`);
  }

  res.json(user);
}));

// Global error handler
app.use((err, req, res, next) => {
  // Log error
  logger.error('Unhandled error', err, {
    method: req.method,
    path: req.path,
    userId: req.user?.id
  });

  // Handle known errors
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details })
      }
    });
  }

  // Handle unknown errors
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error'
        : err.message
    }
  });
});

// Unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', reason);
  process.exit(1);
});
```

---

## Leadership & Collaboration

### Q13: Code Review & Mentoring
**Question:** How do you approach code reviews? What's your mentoring style?

**Answer:**
**Code Review Philosophy:**
- Review for correctness, security, and maintainability
- Be respectful and constructive
- Ask questions instead of making demands
- Acknowledge good solutions

```javascript
// ❌ Poor review comment:
"This is wrong, fix it."

// ✅ Constructive review comment:
"I noticed we're not handling the error case here. 
Could we add a try-catch or check the response status? 
This would prevent silent failures if the API goes down."
```

**Mentoring Approach:**
1. **Guide, don't dictate** - Ask guiding questions
2. **Learn from them** - Be open to feedback
3. **Document patterns** - Create examples and guides
4. **Gradual autonomy** - Increase responsibility over time
5. **Regular feedback** - Weekly 1-on-1s and pairing sessions

---

### Q14: Technical Decision-Making
**Question:** Walk me through how you decide between building vs. buying (SaaS). Example: authentication.

**Answer:**
**Decision Matrix:**
```
                    Low Complexity     High Complexity
Build in-house      ✅ Good option     ⚠️ High cost/risk
Use established SaaS ⚠️ Overkill      ✅ Best option
```

**For Authentication:**
- **Build:** Simple blog with basic login
- **Use Okta:** Enterprise app needing SSO, MFA, compliance

**Evaluation Criteria:**
1. **Core competency?** - Is authentication your competitive advantage?
2. **Maintenance burden?** - Can you maintain security updates?
3. **Time to market?** - How quickly do you need it?
4. **Cost?** - Build cost vs. SaaS cost at scale
5. **Security?** - Can you meet compliance requirements?
6. **Feature parity?** - Does the solution cover all needs?

---

## Behavioral Questions

### Q15: Handling Disagreement with a Colleague
**Question:** Tell me about a time you disagreed with a team member's approach. How did you handle it?

**Answer Template:**
1. **Situation:** "In my previous role, we were debating between monolith and microservices..."
2. **Challenge:** "My colleague preferred microservices immediately, I was concerned about operational complexity..."
3. **Action:** 
   - I suggested we prototype both approaches
   - We created a proposal document with pros/cons
   - Presented to the team
4. **Result:** "We went with a modular monolith first, with a plan to transition to microservices later. This was a good middle ground."
5. **Learning:** "I learned to focus on shared goals rather than being 'right'"

---

### Q16: Technical Debt & Refactoring
**Question:** How do you prioritize technical debt?

**Answer:**
**Prioritization Framework:**
```
High Impact,  | Medium Impact,  | Low Impact,
High Urgency  | High Urgency    | High Urgency
   ↓          |      ↓          |      ↓
DO FIRST      |   DO NEXT       |   BACKLOG
              |                 |
- Security    | - Performance   | - Code style
  issues      |   issues        | - Minor cleanup
- Data loss   | - Developer     | - Comments
  risks       |   experience    |   updates
```

**Approach:**
1. Allocate 10-20% of sprint for technical debt
2. Document the debt
3. Track impact metrics
4. Balance with feature work

---

### Q17: Handling Production Outage
**Question:** Describe your approach to resolving a production outage.

**Answer:**
1. **Immediate Response (0-5 min):**
   - Page on-call engineer
   - Declare incident, start war room
   - Establish communication channel

2. **Diagnosis (5-15 min):**
   - Check monitoring/logs (Datadog, New Relic, etc.)
   - Review recent deployments
   - Check external service status

3. **Remediation (15-30 min):**
   - Rollback if needed
   - Scale up instances
   - Apply hotfix
   - Communicate to stakeholders

4. **Post-Incident (next day):**
   - RCA (Root Cause Analysis)
   - Implement preventive measures
   - Update runbooks
   - Share learnings with team

**Example:** "Previous outage - API timeout during peak load. We immediately scaled horizontally, then added circuit breakers and improved DB indexing to prevent recurrence."

---

### Q18: Remote Work & Collaboration
**Question:** How do you maintain team cohesion and knowledge sharing in a remote environment?

**Answer:**
**Best Practices:**
1. **Documentation First** - Keep docs up-to-date
2. **Async Communication** - Record decisions in Confluence/Notion
3. **Pair Programming** - Regular screen shares for complex tasks
4. **Show & Tell** - Weekly tech talks
5. **Clear PRs** - Detailed descriptions and context
6. **Scheduled Syncs** - Time zone-friendly meetings
7. **Onboarding Guide** - Smooth ramp for new team members

---

## Interview Preparation Tips

### Before the Interview:
- [ ] Review your past projects and impact metrics
- [ ] Prepare 2-3 examples of complex problems you solved
- [ ] Know the trade-offs of your technology choices
- [ ] Research Okta's tech stack and challenges
- [ ] Practice explaining technical concepts simply
- [ ] Prepare questions about the role and team

### During the Interview:
- Think out loud (show your thought process)
- Ask clarifying questions
- Discuss trade-offs and why you chose an approach
- Mention testing, security, and performance
- Be honest about what you don't know
- Share your experience with Okta (if any)

### Questions to Ask:
1. "What's the biggest technical challenge the team is facing?"
2. "How do you approach technical debt and refactoring?"
3. "What does the deployment and monitoring setup look like?"
4. "How are decisions made about architecture changes?"
5. "What's the team structure and how do you collaborate?"

---

## Key Takeaways for Okta Hiring Manager Round

✅ **Focus Areas:**
- Authentication & SSO architecture
- Scalability patterns (clustering, load balancing)
- Security best practices
- Team leadership & mentoring
- Real-world problem solving
- Production incident response

✅ **Demonstrate:**
- Systems thinking
- Communication skills
- Willingness to learn
- Pragmatic decision-making
- Team collaboration
- Attention to security and reliability

---

*Good luck with your interview! Remember: the hiring manager is looking for someone who can lead technically and work well with their team.*
