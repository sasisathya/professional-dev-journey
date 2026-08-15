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
**What it is:** In-memory JavaScript representation of your UI tree. Not actual DOM—just React's internal data structure.

**Why it exists:** Direct DOM manipulation is expensive. React uses VDOM as a middle layer to calculate minimal DOM changes before committing them.

**How it works:** React renders → creates new VDOM tree → diffs against old VDOM → generates minimal DOM updates → commits in batch. This reduces expensive DOM operations.

**Modern reality (React 18+):** With Concurrent Rendering, work can be interrupted and resumed. Updates aren't always atomic. VDOM is still abstraction, but the commit phase is what matters most.

**Common misconception:** "VDOM is faster than direct DOM changes." Wrong. VDOM is about *reducing* DOM changes, not speed. In some cases, targeted DOM updates are faster. VDOM wins when you have many changes—it batches them efficiently.

**Production insight:** The benefit isn't the VDOM comparison—it's that React forces you to think in terms of state → UI. This consistency prevents bugs. The performance benefit is secondary.

**Key takeaway:** VDOM is React's abstraction that enables batching, diffing, and state-driven rendering. The real win is consistency and the ability to interrupt/resume work.

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
