# React Hooks - Complete Interview Guide

## Table of Contents
1. [What are Hooks?](#what-are-hooks)
2. [useState Hook](#usestate-hook)
3. [useEffect Hook](#useeffect-hook)
4. [Dependency Array](#dependency-array)
5. [Rules of Hooks](#rules-of-hooks)
6. [Common Mistakes](#common-mistakes)
7. [Interview Questions](#interview-questions)
8. [Practice Problems](#practice-problems)

---

## What are Hooks?

**Hooks** are functions that allow you to "hook into" React features in functional components.

### Before Hooks (Class Components)
```javascript
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Increment
        </button>
      </div>
    );
  }
}
```

### With Hooks (Functional Components)
```javascript
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### Why Hooks?
- Simpler syntax
- Easier to share stateful logic
- Smaller component sizes
- No confusing `this` binding

---

## useState Hook

### Syntax
```javascript
const [state, setState] = useState(initialValue);
```

### How It Works

```javascript
function Counter() {
  const [count, setCount] = useState(0);
  // count: current value
  // setCount: function to update it
  // 0: initial value

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### State Updates Trigger Re-Render

```javascript
function Example() {
  const [count, setCount] = useState(0);

  return (
    <>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Click (component re-renders)
      </button>
    </>
  );
}
```

### Multiple State Variables

```javascript
function Form() {
  const [name, setName] = useState('');
  const [age, setAge] = useState(0);
  const [email, setEmail] = useState('');

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={age} onChange={(e) => setAge(e.target.value)} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
    </div>
  );
}
```

### State Update Process (Important)

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1); // Schedule state update
    console.log(count); // Still logs old value (state update is async)
    // Component re-renders after this function completes
  };

  return <button onClick={handleClick}>Count: {count}</button>;
}
```

**Key:** State updates are asynchronous! Component doesn't re-render immediately.

### Functional Update Form

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  const handleMultipleClicks = () => {
    setCount(c => c + 1); // Use previous count
    setCount(c => c + 1); // Guaranteed to use updated count
    // Final result: count + 2
  };

  return (
    <button onClick={handleMultipleClicks}>
      Count: {count}
    </button>
  );
}
```

### Updating Objects in State

```javascript
function UserProfile() {
  const [user, setUser] = useState({ name: 'Alice', age: 25 });

  const updateName = (newName) => {
    // ❌ DON'T mutate directly
    // user.name = newName;

    // ✓ Create new object
    setUser({ ...user, name: newName });
  };

  return (
    <div>
      <p>Name: {user.name}</p>
      <button onClick={() => updateName('Bob')}>Change Name</button>
    </div>
  );
}
```

### Updating Arrays in State

```javascript
function TodoList() {
  const [todos, setTodos] = useState(['Task 1', 'Task 2']);

  const addTodo = (newTodo) => {
    // ✓ Create new array
    setTodos([...todos, newTodo]);
  };

  const removeTodo = (index) => {
    // ✓ Use filter to create new array
    setTodos(todos.filter((_, i) => i !== index));
  };

  return (
    <div>
      {todos.map((todo, i) => (
        <div key={i}>{todo}</div>
      ))}
    </div>
  );
}
```

---

## useEffect Hook

### Syntax
```javascript
useEffect(() => {
  // Side effect code
  return () => {
    // Cleanup code (optional)
  };
}, [dependencies]); // Dependency array (optional)
```

### What is a Side Effect?

A **side effect** is any operation that affects something outside the component:
- Fetching data
- Subscriptions
- DOM manipulation
- Timers
- Logging

### Basic Example

```javascript
function Example() {
  useEffect(() => {
    console.log('Component mounted or dependency changed');

    return () => {
      console.log('Cleanup before re-render or unmount');
    };
  });

  return <div>Example</div>;
}
```

### Runs After Every Render

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Effect ran'); // Logs EVERY TIME count changes
    document.title = `Count: ${count}`;
  }); // No dependency array

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}

// Console output:
// Effect ran (after first render)
// Effect ran (after second render when count changes)
// Effect ran (and so on...)
```

### Data Fetching Example

```javascript
function UserData({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Prevent state update if unmounted

    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();

        if (isMounted) {
          setUser(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchUser();

    // Cleanup function
    return () => {
      isMounted = false; // Prevent state update if unmounted
    };
  }, [userId]); // Re-fetch when userId changes

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>{user?.name}</div>;
}
```

### Cleanup Function

```javascript
function Subscription() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const subscription = subscribe((value) => {
      setData(value);
    });

    // Cleanup function - called before effect runs again or component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <div>{data}</div>;
}
```

### Event Listener Example

```javascript
function WindowResize() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup: remove listener when component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array = run only once on mount

  return <div>Width: {width}px</div>;
}
```

---

## Dependency Array

### No Dependency Array
```javascript
useEffect(() => {
  console.log('Runs after EVERY render');
});
```
- Runs after every render
- Can cause performance issues

### Empty Dependency Array
```javascript
useEffect(() => {
  console.log('Runs only once on mount');
}, []);
```
- Runs once after first render (component mounts)
- Perfect for initialization, fetching initial data

### With Dependencies
```javascript
useEffect(() => {
  console.log('Runs when dependency changes');
}, [dependency1, dependency2]);
```
- Runs after first render
- Then runs whenever any dependency changes

### Detailed Example

```javascript
function Example({ id, keyword }) {
  const [data, setData] = useState(null);

  // Runs only on mount
  useEffect(() => {
    console.log('Component mounted');
  }, []);

  // Runs when id changes
  useEffect(() => {
    console.log('Id changed to:', id);
    // Fetch data for new id
  }, [id]);

  // Runs when id or keyword changes
  useEffect(() => {
    console.log('Search for:', keyword, 'in item:', id);
  }, [id, keyword]);

  // ❌ INCORRECT - infinite loop!
  useEffect(() => {
    setData({ ...data, value: 1 });
  }, [data]); // data changes, effect runs, data changes, effect runs...

  return <div>{data}</div>;
}
```

### Dependency Comparison

React uses **shallow comparison** for dependency array:

```javascript
const obj1 = { name: 'Alice' };
const obj2 = { name: 'Alice' };

useEffect(() => {
  console.log('Effect runs');
}, [obj1]); // ❌ Runs every time because obj1 is new object reference

// Solution:
const user = useMemo(() => ({ name: 'Alice' }), []);
useEffect(() => {
  console.log('Effect runs');
}, [user]); // ✓ Runs only once
```

---

## Rules of Hooks

### Rule 1: Only Call at Top Level

```javascript
// ❌ WRONG - inside condition
function Example({ condition }) {
  if (condition) {
    const [count, setCount] = useState(0); // ❌ Can't do this
  }
}

// ✓ CORRECT
function Example({ condition }) {
  const [count, setCount] = useState(0); // Always called
  // Use condition inside effect
  useEffect(() => {
    if (condition) {
      // Do something
    }
  }, [condition]);
}
```

```javascript
// ❌ WRONG - inside loop
function Example() {
  for (let i = 0; i < 10; i++) {
    useState(0); // ❌ Can't do this
  }
}

// ✓ CORRECT
function Example() {
  const [values, setValues] = useState(Array(10).fill(0)); // Call once
}
```

### Rule 2: Only Call from React Functions

```javascript
// ❌ WRONG - regular function
function regularFunction() {
  const [count, setCount] = useState(0); // ❌ Error
}

// ✓ CORRECT - functional component
function Component() {
  const [count, setCount] = useState(0); // ✓ Works
}

// ✓ CORRECT - custom hook
function useCustom() {
  const [count, setCount] = useState(0); // ✓ Works (custom hooks)
}
```

---

## Common Mistakes

### Mistake 1: Missing Dependencies

```javascript
// ❌ BAD - infinite loop
function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Count:', count);
    setCount(count + 1); // Causes infinite loop
    // count changes → effect runs → count changes → effect runs...
  }); // No dependency array
}

// ✓ GOOD
function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Count:', count);
    // Don't update state based on itself
  }, [count]); // Dependency array prevents infinite loop
}
```

### Mistake 2: Forgetting Cleanup

```javascript
// ❌ BAD - memory leak
function Timer() {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Tick');
    }, 1000);
    // Never cleared! Memory leak if component unmounts
  }, []);
}

// ✓ GOOD
function Timer() {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Tick');
    }, 1000);

    return () => {
      clearInterval(interval); // Clean up
    };
  }, []);
}
```

### Mistake 3: Mutable Objects in Dependencies

```javascript
// ❌ BAD - recreate object every render
function Example({ user }) {
  useEffect(() => {
    console.log('User changed');
  }, [user]); // If user object is recreated, effect runs every time
}

// ✓ GOOD - use useMemo
function Example({ user }) {
  const memoizedUser = useMemo(() => user, [user.id]);
  useEffect(() => {
    console.log('User changed');
  }, [memoizedUser]);
}
```

### Mistake 4: Stale Closures

```javascript
// ❌ BAD - stale closure
function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const handleClick = () => {
      console.log(count); // Always logs 0
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []); // count is stale
}

// ✓ GOOD - include in dependencies
function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const handleClick = () => {
      console.log(count); // Logs current count
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [count]); // count in dependencies
}
```

---

## Interview Questions

### Q1: What is useState?
**Answer:** useState is a Hook that allows functional components to have local state. It returns an array with two elements: the current state value and a function to update it. Example: `const [count, setCount] = useState(0)`.

### Q2: How does useState work internally?
**Answer:** React maintains a Fiber object for each component instance. It stores state in a Hook object, linked to the Fiber. When setState is called, React schedules a re-render, and the component function is called again with the updated state.

### Q3: Why is the Dependency Array important in useEffect?
**Answer:** The dependency array tells React when to run the effect. No array = every render, empty array = once on mount, with dependencies = when dependencies change. Without it properly specified, you can get infinite loops or memory leaks.

### Q4: What's the difference between useEffect and componentDidMount?
**Answer:**
- useEffect can run after every render (if no dependencies) or on mount/dependency change
- componentDidMount only runs once after mount
- useEffect is more flexible but requires careful dependency management

### Q5: How do you prevent infinite loops in useEffect?
**Answer:**
1. Use proper dependency array
2. Don't call setState without dependencies
3. Use functional update form: `setState(prev => prev + 1)`
4. Remember cleanup functions

### Q6: What happens if you forget the dependency array?
**Answer:** The effect runs after every render, which can cause:
- Performance issues
- Infinite loops if updating state
- Memory leaks if not cleaning up
- Multiple API calls

---

## Practice Problems

### Problem 1: Counter Component
```javascript
function Counter() {
  // Implement counter with increment, decrement, reset
  // Display current count
  // All buttons should work correctly
}
```

**Solution:**
```javascript
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

### Problem 2: User Form
```javascript
function UserForm() {
  // Create form with name, email, age
  // Display current form values
  // Reset button to clear all
}
```

**Solution:**
```javascript
function UserForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    age: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleReset = () => {
    setForm({ name: '', email: '', age: '' });
  };

  return (
    <div>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
      <input name="age" value={form.age} onChange={handleChange} placeholder="Age" />
      <button onClick={handleReset}>Reset</button>
      <pre>{JSON.stringify(form, null, 2)}</pre>
    </div>
  );
}
```

### Problem 3: Fetch Data
```javascript
function UserProfile({ userId }) {
  // Fetch user data when userId changes
  // Show loading, error, and data states
  // Prevent memory leaks
}
```

**Solution:**
```javascript
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        const data = await res.json();
        if (isMounted) {
          setUser(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    setLoading(true);
    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>{user?.name}</div>;
}
```

---

## Key Takeaways

1. **useState** - manage component state
2. **useEffect** - handle side effects
3. **Dependency array** - controls when effects run
4. **Cleanup** - prevent memory leaks
5. **Rules of Hooks** - call at top level, only in React functions
6. **Common mistakes** - missing dependencies, forgetting cleanup

---

**Hooks are essential for modern React development!**
