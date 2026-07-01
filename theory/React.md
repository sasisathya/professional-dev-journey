# React - Professional Interview Guide (2-Minute Explanations)

## Table of Contents
1. [Core Concepts](#core-concepts)
2. [Hooks & State Management](#hooks--state-management)
3. [Component Patterns](#component-patterns)
4. [Performance & Optimization](#performance--optimization)
5. [Advanced Topics](#advanced-topics)
6. [Real-World Patterns](#real-world-patterns)

---

## Core Concepts

### Virtual DOM (VDOM)
**What it is:** In-memory JavaScript copy of the actual DOM. React keeps a lightweight representation of your UI in memory.

**Why it exists:** Manipulating real DOM is slow. React uses VDOM to figure out the minimum changes needed, then updates the real DOM once with all changes together.

**How it works:** React creates new VDOM → compares with old VDOM (diffing) → calculates changes → updates real DOM in one batch. This is faster than updating DOM multiple times.

**Key takeaway:** VDOM is not visible to browser. It's React's optimization trick to make updates fast and batched.

---

### Reconciliation (Diffing Algorithm)
**What it is:** Process of comparing old and new VDOM trees to find what changed.

**How React decides what changed:**
- If element type changes (`<div>` to `<span>`): Throw away old tree, create new one
- If element type stays same: Keep element, only update the properties (props/attributes)
- For lists: Use `key` prop to identify which item is which

**Why keys matter:** Without keys, React uses index. If you filter/reorder list, wrong state gets attached to wrong items. Always use stable IDs (database IDs), never array indices.

**Example issue:** List has 3 items with `key={index}`. You delete first item. Now what was item 2 becomes item 1 (index changes). React thinks it's the same item but it's not—state goes wrong.

**Key takeaway:** Always use stable, unique keys (database IDs). Never use array indices.

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

### React Fiber Architecture
**What it is:** Internal system that controls how React renders components.

**The problem it solves:** Old React would render entire component tree without stopping. If you had a big tree, it would block the browser for too long, making app feel frozen/unresponsive to user input.

**How Fiber fixes it:**
- Breaks rendering work into small chunks (~5ms each)
- After each chunk, yields control to browser
- Browser can handle user input, animations, etc.
- Then React resumes rendering next chunk

**Priority system:** React gives higher priority to important updates (user input, animations) and lower priority to background work (data fetching).

**Key takeaway:** Fiber = splitting work into chunks so browser stays responsive. Users don't see frozen UI even with complex renders.

---

## Hooks & State Management

### useState
**What it does:** Lets a functional component remember a value between renders. When that value changes, component re-renders.

**How it works:**
- `const [count, setCount] = useState(0)` creates state variable `count` with initial value `0`
- `setCount(5)` updates state
- React re-renders component to show new state

**Important behavior - Updates are batched:**
- When you call `setState()`, React doesn't update immediately
- Multiple setState calls in same event handler get batched together (one re-render)
- If you read state right after `setState()`, you still get old value
- State updates are asynchronous

**When to use functional updates `setState(prev => prev + 1)`:**
- When new state depends on old state
- Prevents "stale closure" bugs in async operations
- Example: Don't do `setCount(count + 1)` in a loop, do `setCount(prev => prev + 1)`

**Lazy initialization:** Pass function to useState if initial value is expensive to calculate: `useState(() => expensiveOperation())`

**Key takeaway:** useState updates are async and batched. Use functional form when new state depends on old state.

---

### useEffect
**What it does:** Runs side effects (API calls, timers, subscriptions, DOM changes) after component renders.

**Structure:** `useEffect(() => { /* your code */ }, [dependencies])`

**Dependency array controls when it runs:**
- No dependency array: Runs after every render (usually wrong)
- Empty array `[]`: Runs once after first render (mount)
- `[count, name]`: Runs when count or name changes

**How dependencies work:** React uses `Object.is()` to compare old vs new values. If nothing changed, effect doesn't run.

**Cleanup function:** Return a function to cleanup (unsubscribe, cancel API request, clear timer)
- Example: `useEffect(() => { const timer = setInterval(...); return () => clearInterval(timer); }, [])`
- Missing cleanup = memory leaks

**Common mistake:** Not including dependencies. If you use a variable in effect but don't list it in dependencies, you get stale data.

**Key takeaway:** List all dependencies. Always cleanup. Effect runs after render, not before.

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
**What it does:** Wraps a component to prevent re-rendering if props haven't changed.

**How it works:**
- Normal component: re-renders when parent re-renders (even if props same)
- Memoized component: re-renders only if props change

**Shallow comparison:** React.memo does shallow comparison of props (using `Object.is()`)
- Primitive values (`string`, `number`, `boolean`): compared by value
- Objects/arrays: compared by reference (two objects with same content = different reference = re-render)

**To make it work, pair with:**
- `useCallback` for function props (so function reference stays same)
- `useMemo` for object/array props (so reference stays same)

**When to use:**
- Component is expensive to render
- Component receives function/object props that change every render
- Actually profile first—don't just add React.memo everywhere

**Don't over-use:** React.memo adds comparison overhead. If props always change, memo is waste.

**Key takeaway:** React.memo prevents re-render if props same. Pair with useCallback/useMemo for objects.

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

## Real-World Patterns

### Data Fetching
**Manual useEffect fetching problems:**
- Race conditions (request 1 finishes after request 2, shows wrong data)
- Stale data (effect uses old props)
- Missing cleanup (AbortController needed to cancel old requests)
- Loading/error state management

**Wrong way:**
```javascript
useEffect(() => {
  fetch(url).then(r => setData(r.data));
}, [url]);
// Problems: what if url changes before fetch finishes?
// What if component unmounts? State update on unmounted component warning.
```

**Solution:** Use React Query or SWR
- Handles race conditions automatically
- Deduplicates requests (same URL = one request)
- Caches results
- Background refetching
- Loading/error states built-in
- Pagination, infinite scroll support

**Key takeaway:** Don't fetch manually. Use React Query or SWR for anything non-trivial.

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

### Testing
**What to test:** User-facing behavior, not implementation.

**Wrong way:**
- Test internal component state (`expect(component.state.count).toBe(5)`)
- Test props directly
- Test implementation details

**Right way:**
- Test what user sees and does
- Render component → user clicks button → verify UI changed
- Test that data displays correctly
- Test form submission works

**How to test:**
- Use React Testing Library
- Query by text, label, role (how users think about UI)
- Assert on DOM (what user sees)
- Don't test implementation

**Benefits:** Tests survive refactoring. Can change internal code without breaking tests.

**Key takeaway:** Test user behavior, not implementation. React Testing Library best practice.

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
**Choose based on needs:**

**Simple (useState + Context):**
- Small app, few global values
- Not updated frequently

**Global (Redux, Zustand, Jotai):**
- Medium/large app, lots of global state
- Redux = large teams, lots of boilerplate but predictable
- Zustand = lightweight, minimal boilerplate

**Server state (React Query, SWR):**
- Syncing with server/API
- Caching, background refetching
- Not for client-only state

**Real-time (Firebase, Supabase):**
- Need real-time updates from database
- Built-in sync

**Key takeaway:** Use simplest solution for your needs. useState + Context for most apps. React Query for server state. Redux/Zustand only if really needed.

---

## Common Pitfalls & Debugging

### Missing useEffect Dependencies
**Problem:** You use a variable inside useEffect but don't list it in dependency array. Effect runs with old value of that variable.

**Example:**
```javascript
useEffect(() => {
  fetch(`/api/user/${userId}`) // userId missing from deps
}, []); // wrong!
// If userId changes, effect doesn't run, old userId still fetched
```

**Consequences:**
- Fetch wrong data
- Keep old subscription
- Stale data in component

**Solution:** Include ALL variables from component used in effect.

**Tool:** ESLint exhaustive-deps rule catches this automatically.

**Key takeaway:** Missing dependencies = stale data. Include everything you use.

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

### How to Answer React Questions

**1. Start with the "what":**
- What does this concept do?
- Simple 1-2 sentence explanation

**2. Then explain "why":**
- Why does React do it this way?
- What problem does it solve?
- What happens if you don't use it?

**3. Show you understand tradeoffs:**
- When to use, when not to use
- What could go wrong
- Alternatives and why you'd choose one

**4. Give a real example:**
- Production bug you fixed
- How you solved similar problem
- What you learned

**Example answer structure:**

**Q: What is React.memo and when do you use it?**

**A:** "React.memo prevents a component from re-rendering if its props haven't changed. It does shallow comparison of props.

Why? By default, when parent re-renders, all children re-render even if props didn't change. For expensive components, this is wasteful.

When to use: Component is slow to render AND gets new props frequently. Must pair with useCallback/useMemo for object props, otherwise memo is worthless.

I had a List component with 100 Item children. Without memo, changing one item re-rendered all 100. Added memo + useCallback for handlers. Reduced re-renders by 90%.

Tradeoff: memo adds comparison overhead. Don't use without measuring first."

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

### What NOT to Say in Interviews

- "I always use X" (no mention of tradeoffs)
- "I use Context for state management" (Context isn't a state manager)
- "Just add React.memo everywhere" (premature optimization)
- "I don't need to measure, I know it's slow" (guess work)
- "Virtual DOM is faster than real DOM" (wrong, it's about less actual DOM updates)

### Red Flags to Avoid

- Not including all dependencies in useEffect
- Using array index as key in lists
- Not cleaning up effects (subscriptions, timers)
- Mutating props
- Not separating concerns (mixing UI, data, business logic)

---

**Updated:** 2026-07-02 | **Level:** Intermediate-Advanced (Interview Ready) | **Format:** Simple, clear definitions with examples
