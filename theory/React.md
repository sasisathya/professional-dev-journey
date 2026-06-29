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
In-memory JavaScript representation of the UI. React creates new VDOM, diffs with previous version (reconciliation), and updates only changed DOM parts. Much faster than direct DOM manipulation since DOM operations are expensive. Batches changes for one reflow/repaint cycle instead of multiple. Internal to React—browser never sees it.

**Key takeaway:** VDOM + diffing = batched, efficient DOM updates.

---

### Reconciliation (Diffing)
Algorithm comparing old/new VDOM trees. Uses heuristics (O(n) complexity) not perfect diff. If element type changes (`<div>` → `<span>`), discard and recreate tree. If type stays same, update props. Lists: use `key` prop to identify items. `key={index}` breaks with filtering/reordering since indices change. Always use stable IDs (database IDs), never array indices.

**Key takeaway:** Correct keys = stable list item tracking. Wrong keys = state attached to wrong elements.

---

### JSX (JavaScript XML)
Syntactic sugar for `React.createElement()`. `<Component prop="value" />` → `React.createElement(Component, { prop: 'value' })`. Compiled by Babel before execution. Limited to expressions (not statements): ternary for conditionals, `.map()` for loops, no if/else. `<>` = `React.Fragment` for multiple elements.

**Key takeaway:** JSX = expressions only. Understand transpilation to debug errors.

---

### React Fiber Architecture
Work loop that breaks rendering into chunks. Yields to browser every ~5ms for user input instead of blocking. Time-slicing: render chunk → browser handles events → resume render. Prioritizes updates: user input > background fetches. Foundation for Suspense and concurrent rendering.

**Key takeaway:** Fiber = non-blocking render. Apps stay responsive at any scale.

---

## Hooks & State Management

### useState
`const [state, setState] = useState(initialValue)`. Updates are async and batched in event handlers (React 18: also in async). State updates are queued, not immediate—reading state right after setState returns old value. Use functional updates `setState(prev => ...)` for state depending on previous state (prevents stale closures). Lazy init: pass function to useState.

**Key takeaway:** Async updates. Use functional form when relying on previous state.

---

### useEffect
Runs side effects (API calls, timers, subscriptions) after render. Signature: `useEffect(callback, dependencies)`. Dependency array controls timing: `[]` = once at mount, missing = every render, `[deps]` = when deps change. Compared with `Object.is()` (reference equality matters). Include all used values in dependencies (eslint-plugin-react-hooks). Return cleanup function for unsubscribe/cancel/removeListener. Missing cleanup = memory leaks.

**Key takeaway:** Dependencies control runs. Include all values. Always cleanup.

---

### useContext
Access values from `Context.Provider` without prop drilling. Create: `const Ctx = createContext()`, wrap tree: `<Ctx.Provider value={x}>`, consume: `useContext(Ctx)`. Good for: theme, auth, locale. NOT a state manager—all consumers re-render when value changes. Memoize value (reference equality) or split context by concern (theme context, auth context separately).

**Key takeaway:** Global values only. Not state management. Split by concern.

---

### useReducer
`const [state, dispatch] = useReducer(reducerFn, initialState)`. Reducer: pure function `(state, action) => newState`. Explicit, testable state transitions. Useful: related state values or complex logic as actions. Dispatch: `dispatch({ type: 'ACTION', payload: data })`. More verbose than useState but better for complex state.

**Key takeaway:** Complex state with related values. Action-based transitions.

---

### useRef
`const ref = useRef(initialValue)`. Mutable value persisting across renders without re-renders. `ref.current` mutation doesn't trigger re-render. Ref object is stable (same every render). Uses: DOM access (focus, play video), timer IDs, non-React lib integration. NOT for avoiding re-renders. Pass refs through: `forwardRef`.

**Key takeaway:** Imperative operations only. Escape hatch, not state.

---

### useCallback
Memoizes function, returns same reference across renders (unless deps change). `const fn = useCallback(() => {...}, [deps])`. Use: passing to memoized children (`React.memo`). Don't over-use—function creation is cheap. useCallback overhead > benefit for most cases. Measure first. Include all used values in deps.

**Key takeaway:** Memoized children only. Measure performance before using.

---

### useMemo
Memoizes computed value. `const memo = useMemo(() => expensiveOp(), [deps])`. Use: expensive operations (sort/filter large lists), passing objects/arrays to memoized children. Overhead: memory + comparison. Don't over-use—simple ops are faster raw. Measure first. Dependencies matter: if deps change every render, defeats purpose.

**Key takeaway:** Expensive operations only. Measure before using.

---

### useLayoutEffect
Like `useEffect` but runs synchronously after DOM mutations, before paint. Use: DOM measurements, style adjustments to avoid flashes. Blocks paint (slower). Dependency array same as useEffect. Usually `useEffect` sufficient—use sparingly.

**Key takeaway:** Before paint. DOM measurements only.

---

### Custom Hooks
Functions using React Hooks, returning state/functions for reuse. Extract repeated logic. Must start with "use" (e.g., `useLocalStorage`, `useFetch`). Follow Hook rules: call at top level only, in components or Hooks only. Simpler than render props/HOCs.

**Key takeaway:** Reuse stateful logic. Modern, composable pattern.

---

## Component Patterns

### Functional vs Class Components
Functional: pure functions, receive props, return JSX. Class: extend `React.Component`, `this.state`, `this.props`, lifecycle methods. Hooks replaced class features: useState = state, useEffect = lifecycle. Modern React = functional + Hooks. Simpler, less boilerplate, more testable.

**Key takeaway:** Functional components. Modern standard.

---

### Controlled vs Uncontrolled Components
**Controlled:** Value from React state. `<input value={state} onChange={...} />`. React = single source of truth. Good for validation, complex forms.

**Uncontrolled:** Value in DOM. Use `useRef` to read on demand. Less overhead. Simple forms or non-React integration.

Use controlled. Predictable, easy to validate.

**Key takeaway:** Controlled by default. Uncontrolled = escape hatch.

---

### Props Drilling
Passing props through multiple levels when intermediate components don't use them. Hard to refactor, increases coupling. Solution: Context for global values, state management for complex state.

**Key takeaway:** Context or state manager. Not through 6 levels.

---

## Performance & Optimization

### React.memo
Wraps component, re-renders only if props change (shallow comparison). Prevents re-renders of expensive components. Requires stable props—pair with `useCallback`/`useMemo`. Don't over-use. Measure first.

**Key takeaway:** Memoize slow components. Stable props required.

---

### Code Splitting and Suspense
Load code on demand. `const C = React.lazy(() => import('./C'))`. Wrap with `<Suspense fallback={...}>`. Crucial for large apps—reduces initial bundle. Suspense also for data loading (experimental).

**Key takeaway:** Split by routes/features. Significant load time reduction.

---

### Profiling and DevTools
React DevTools Profiler: record profiles, see which components render + why. Identify real bottlenecks. Common issues: wrong deps (infinite effects), missing React.memo, no useMemo. Don't guess—measure.

**Key takeaway:** Profile first. Data-driven optimization.

---

## Advanced Topics

### Error Boundaries
Class components with `componentDidCatch()`. Catch child component render errors, show fallback. Prevent app crash from one broken component. Wrap app root. Note: render-time errors only—not event handlers/async. Use try-catch for those. No Hook version (must be class).

**Key takeaway:** Wrap app root. Render errors only.

---

### Render Props
Legacy pattern: component accepts function prop returning JSX. For stateful logic sharing (pre-Hooks). Custom Hooks cleaner. Don't use in new code.

**Key takeaway:** Legacy. Use Hooks instead.

---

### Higher-Order Components (HOC)
Functions: component → enhanced component. Legacy (pre-Hooks) pattern for cross-cutting concerns. Custom Hooks preferred. Don't write new ones.

**Key takeaway:** Legacy. Use Hooks.

---

### Suspense (Experimental)
Pause rendering while data loads, show fallback. Stable for code splitting, experimental for data loading. Simplifies async patterns. React Query + Suspense support coming.

**Key takeaway:** Code splitting = ready. Data loading = coming soon.

---

## Real-World Patterns

### Data Fetching
Manual useEffect fetching is error-prone: race conditions, stale data. Use `AbortController` or `isMounted` pattern. Better: React Query/SWR (caching, deduplication, race conditions). Don't fetch manually unless trivial.

**Key takeaway:** React Query or SWR. Handles complexity.

---

### Form Handling
Simple forms: useState. Complex (20+ fields, validation): React Hook Form or Formik. Handle state, validation, submission, errors. Don't build own.

**Key takeaway:** React Hook Form for complex. Saves time.

---

### List Keys
Stable, unique IDs only. Never array indices. Filtering/reordering with indices = wrong state attachments, stale form data, wrong checkbox checks.

**Key takeaway:** Database IDs. Never indices.

---

### Large Lists (Virtualization)
1000+ items = performance killer. Use `react-window`/`react-virtualized` to render visible items only. 10,000 items = instant.

**Key takeaway:** Virtualize large lists.

---

### Testing
Test behavior, not implementation. React Testing Library: render and query/assert like user. Avoid state/props testing. Good tests = confidence in refactoring.

**Key takeaway:** User-facing behavior. React Testing Library.

---

### Server-Side Rendering (SSR) and Next.js
Server renders component tree to HTML → browser hydrates (attaches listeners). Improves load time + SEO. Next.js abstracts complexity. Watch hydration mismatch: server/browser render different = console errors.

**Key takeaway:** Better load time & SEO. Use Next.js.

---

### State Management Solutions
- **Simple:** useState + Context
- **Global:** Redux, Zustand, MobX
- **Server:** React Query, SWR
- **Real-time:** Firebase, Supabase
- **Complex derived:** Recoil, Jotai

Choose by complexity/team size. Redux = large teams, structure. Zustand = lightweight. React Query = server sync. Don't over-engineer.

**Key takeaway:** Right tool for complexity.

---

## Common Pitfalls & Debugging

### Missing useEffect Dependencies
Use value in effect but don't include in deps = stale value. Old IDs in fetches, stale data in subscriptions. Use ESLint exhaustive-deps.

**Solution:** Include all used values in deps.

---

### Infinite useEffect Loops
Dependency changes every render = effect reruns every render. Cause: new objects/arrays as deps.

**Solution:** Memoize with useMemo.

---

### Memory Leaks
No cleanup for subscriptions/listeners/timers = memory leaks. Runs after unmount.

**Solution:** Cleanup function in useEffect.

---

### Stale Closures
Effect captures old state value = stale data. Happens with async (setTimeout, Promises).

**Solution:** Functional updates `setState(prev => ...)` or add deps to useEffect.

---

### Props Mutation
Props are read-only. Direct mutation = breaks assumptions, subtle bugs.

**Solution:** Pass as state or callback to parent.

---

## Interview Tips

1. **Explain why:** Context = global values, not state mgmt. Frequent changes = all consumers re-render.
2. **Show production bugs:** "List items stale after filtering—missing keys."
3. **Discuss tradeoffs:** useState = simple. useReducer = clearer for complex. React.memo = overhead.
4. **Ecosystem:** React Query (fetch), Zustand (state), Next.js (SSR).
5. **Unknowns:** "Haven't used Concurrent Rendering, but understand priority updates."

---

**Updated:** 2026-06-24 | **Level:** Intermediate-Advanced (8-10+ YOE) | **Format:** Direct definitions
