# React Design Pattern Code Samples

Complete working examples for all React design patterns.

---

## 1. COMPONENT COMPOSITION - Code Samples

### Example 1: Simple Button Component

```jsx
// Button.jsx
const Button = ({ children, onClick, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-green-500 text-white hover:bg-green-600'
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
```

### Example 2: Card Component

```jsx
// Card.jsx
const Card = ({ children, title, subtitle }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {title && (
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
```

### Example 3: User Card - Composite Component

```jsx
// UserCard.jsx
import Card from './Card';
import Button from './Button';

const UserCard = ({ user, onEdit, onDelete }) => {
  return (
    <Card title={user.name} subtitle={user.email}>
      <div className="mb-4">
        <p className="text-gray-700"><strong>Role:</strong> {user.role}</p>
        <p className="text-gray-700"><strong>Status:</strong> {user.status}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="primary" onClick={() => onEdit(user)}>
          Edit
        </Button>
        <Button variant="danger" onClick={() => onDelete(user.id)}>
          Delete
        </Button>
      </div>
    </Card>
  );
};

export default UserCard;
```

### Example 4: Form Input Component

```jsx
// FormInput.jsx
const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false
}) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-semibold mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder={label}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;
```

### Example 5: Complete Form Component

```jsx
// UserForm.jsx
import { useState } from 'react';
import Card from './Card';
import FormInput from './FormInput';
import Button from './Button';

const UserForm = ({ initialUser, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState(
    initialUser || { name: '', email: '', phone: '' }
  );
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length === 0) {
      await onSubmit(formData);
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <Card title="User Form">
      <form onSubmit={handleSubmit}>
        <FormInput
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
        <FormInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
        <FormInput
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
        <div className="flex gap-2">
          <Button type="submit" variant="success" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
          <Button type="reset" variant="primary">
            Reset
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default UserForm;
```

---

## 2. RENDER PROPS - Code Samples

### Example 1: Mouse Position Tracker

```jsx
// MouseTracker.jsx
import { useState, useEffect } from 'react';

const MouseTracker = ({ render }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return render(position);
};

// Usage
export const MouseTrackerDemo = () => {
  return (
    <MouseTracker
      render={({ x, y }) => (
        <div className="p-8 bg-gray-100 min-h-screen">
          <h1>Mouse Position</h1>
          <p>X: {x}, Y: {y}</p>
          <div
            className="w-4 h-4 bg-red-500 absolute rounded-full"
            style={{ left: `${x}px`, top: `${y}px` }}
          />
        </div>
      )}
    />
  );
};

export default MouseTracker;
```

### Example 2: Toggle Component

```jsx
// Toggle.jsx
import { useState } from 'react';

const Toggle = ({ initialState = false, render }) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const toggle = () => setIsOpen(!isOpen);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return render({
    isOpen,
    toggle,
    open,
    close
  });
};

// Usage
export const ToggleDemo = () => {
  return (
    <Toggle
      initialState={false}
      render={({ isOpen, toggle }) => (
        <div>
          <button onClick={toggle}>
            {isOpen ? 'Hide' : 'Show'} Content
          </button>
          {isOpen && (
            <div className="p-4 mt-4 bg-blue-100 rounded">
              This content is toggled!
            </div>
          )}
        </div>
      )}
    />
  );
};

export default Toggle;
```

### Example 3: Form Provider with Render Props

```jsx
// FormProvider.jsx
import { useState } from 'react';

const FormProvider = ({ initialValues, onSubmit, render }) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setFieldValue = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFieldValue(name, value);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      setValues(initialValues);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return render({
    values,
    errors,
    touched,
    isSubmitting,
    setFieldValue,
    handleChange,
    handleBlur,
    handleSubmit,
    reset
  });
};

// Usage
export const FormProviderDemo = () => {
  return (
    <FormProvider
      initialValues={{ email: '', password: '' }}
      onSubmit={async (values) => {
        console.log('Form submitted:', values);
        await new Promise(r => setTimeout(r, 1000));
      }}
      render={(form) => (
        <form onSubmit={form.handleSubmit}>
          <input
            type="email"
            name="email"
            value={form.values.email}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            placeholder="Email"
          />
          <input
            type="password"
            name="password"
            value={form.values.password}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            placeholder="Password"
          />
          <button
            type="submit"
            disabled={form.isSubmitting}
          >
            {form.isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      )}
    />
  );
};

export default FormProvider;
```

### Example 4: Data Fetcher Render Props

```jsx
// DataFetcher.jsx
import { useState, useEffect } from 'react';

const DataFetcher = ({ url, render }) => {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setState({ data, loading: false, error: null });
      } catch (error) {
        setState({ data: null, loading: false, error: error.message });
      }
    };

    fetchData();
  }, [url]);

  const refetch = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetch(url);
      const data = await response.json();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error.message });
    }
  };

  return render({ ...state, refetch });
};

// Usage
export const DataFetcherDemo = () => {
  return (
    <DataFetcher
      url="https://api.github.com/users/github"
      render={({ data, loading, error, refetch }) => (
        <div>
          {loading && <p>Loading...</p>}
          {error && <p>Error: {error}</p>}
          {data && (
            <div>
              <h2>{data.name}</h2>
              <p>{data.bio}</p>
              <button onClick={refetch}>Refetch</button>
            </div>
          )}
        </div>
      )}
    />
  );
};

export default DataFetcher;
```

---

## 3. HIGHER-ORDER COMPONENT - Code Samples

### Example 1: withTheme HOC

```jsx
// withTheme.jsx
import { useState } from 'react';

const withTheme = (WrappedComponent) => {
  return (props) => {
    const [theme, setTheme] = useState('light');

    const toggleTheme = () => {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
      <WrappedComponent
        {...props}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  };
};

// Component using HOC
const ThemedComponent = ({ theme, toggleTheme }) => {
  return (
    <div className={theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}>
      <h1>Current Theme: {theme}</h1>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};

export default withTheme(ThemedComponent);
```

### Example 2: withAuth HOC

```jsx
// withAuth.jsx
import { useState, useEffect } from 'react';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Simulate auth check
      setTimeout(() => {
        setUser({ id: 1, username: 'john', email: 'john@example.com' });
        setLoading(false);
      }, 1000);
    }, []);

    if (loading) return <p>Loading...</p>;
    
    if (!user) {
      return <p>Please login first</p>;
    }

    return <WrappedComponent {...props} user={user} />;
  };
};

// Component using HOC
const Dashboard = ({ user }) => {
  return (
    <div>
      <h1>Welcome, {user.username}!</h1>
      <p>Email: {user.email}</p>
    </div>
  );
};

export default withAuth(Dashboard);
```

### Example 3: withDataFetching HOC

```jsx
// withDataFetching.jsx
import { useState, useEffect } from 'react';

const withDataFetching = (url) => (WrappedComponent) => {
  return (props) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(url);
          const json = await response.json();
          setData(json);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, []);

    return (
      <WrappedComponent
        {...props}
        data={data}
        loading={loading}
        error={error}
      />
    );
  };
};

// Usage
const UserList = ({ data, loading, error }) => {
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return (
    <ul>
      {data.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};

export default withDataFetching('https://api.example.com/users')(UserList);
```

---

## 4. CUSTOM HOOKS - Code Samples

### Example 1: useForm Hook

```jsx
// useForm.js
import { useState } from 'react';

const useForm = (initialValues, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset
  };
};

// Usage
export const LoginForm = () => {
  const form = useForm(
    { email: '', password: '' },
    async (values) => {
      console.log('Login:', values);
      await new Promise(r => setTimeout(r, 1000));
    }
  );

  return (
    <form onSubmit={form.handleSubmit}>
      <input
        type="email"
        name="email"
        value={form.values.email}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        placeholder="Email"
      />
      <input
        type="password"
        name="password"
        value={form.values.password}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        placeholder="Password"
      />
      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default useForm;
```

### Example 2: useLocalStorage Hook

```jsx
// useLocalStorage.js
import { useState, useEffect } from 'react';

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

// Usage
export const TodoApp = () => {
  const [todos, setTodos] = useLocalStorage('todos', []);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input }]);
      setInput('');
    }
  };

  return (
    <div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={addTodo}>Add Todo</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default useLocalStorage;
```

### Example 3: useFetch Hook

```jsx
// useFetch.js
import { useState, useEffect } from 'react';

const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch');
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};

// Usage
export const GitHubUserProfile = ({ username }) => {
  const { data: user, loading, error } = useFetch(
    `https://api.github.com/users/${username}`
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>{user.name}</h2>
      <img src={user.avatar_url} alt={user.name} width={100} />
      <p>{user.bio}</p>
      <p>Followers: {user.followers}</p>
    </div>
  );
};

export default useFetch;
```

### Example 4: useDebounce Hook

```jsx
// useDebounce.js
import { useState, useEffect } from 'react';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Usage
export const SearchUsers = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (debouncedSearch) {
      // Simulate API call
      console.log('Searching for:', debouncedSearch);
      setResults([
        { id: 1, name: `Result for ${debouncedSearch}` }
      ]);
    }
  }, [debouncedSearch]);

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search users..."
      />
      <ul>
        {results.map(result => (
          <li key={result.id}>{result.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default useDebounce;
```

---

## 5. CONTEXT API - Code Samples

### Example 1: Theme Context

```jsx
// ThemeContext.jsx
import { createContext, useState } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

### Example 2: Auth Context

```jsx
// AuthContext.jsx
import { createContext, useState, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1000));
      setUser({ id: 1, email, name: 'John Doe' });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value = { user, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Example 3: Using Multiple Contexts

```jsx
// App.jsx
import { AuthProvider, useAuth } from './AuthContext';
import { ThemeProvider, useTheme } from './ThemeContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

const LoginPage = () => {
  const { login, loading } = useAuth();

  return (
    <div>
      <button onClick={() => login('john@example.com', 'password')} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

const MainApp = () => {
  const { user } = useAuth();

  return user ? <Dashboard /> : <LoginPage />;
};

export default App;
```

---

## 6. COMPOUND COMPONENTS - Code Samples

### Example 1: Accordion Component

```jsx
// Accordion.jsx
import { createContext, useContext, useState } from 'react';

const AccordionContext = createContext();

const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Must be used within Accordion');
  }
  return context;
};

export const Accordion = ({ children, allowMultiple = false }) => {
  const [expandedIds, setExpandedIds] = useState([]);

  const toggleItem = (id) => {
    setExpandedIds(prev => {
      if (allowMultiple) {
        return prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      } else {
        return prev.includes(id) ? [] : [id];
      }
    });
  };

  return (
    <AccordionContext.Provider value={{ expandedIds, toggleItem }}>
      <div className="border rounded-lg">{children}</div>
    </AccordionContext.Provider>
  );
};

export const AccordionItem = ({ id, header, children }) => {
  const { expandedIds, toggleItem } = useAccordionContext();
  const isExpanded = expandedIds.includes(id);

  return (
    <div className="border-b">
      <button
        onClick={() => toggleItem(id)}
        className="w-full px-4 py-3 text-left font-semibold bg-gray-100 hover:bg-gray-200"
      >
        {header}
        <span>{isExpanded ? '▼' : '▶'}</span>
      </button>
      {isExpanded && <div className="px-4 py-3 bg-white">{children}</div>}
    </div>
  );
};

// Usage
export const AccordionDemo = () => {
  return (
    <Accordion allowMultiple>
      <AccordionItem id="item1" header="Section 1">
        Content 1
      </AccordionItem>
      <AccordionItem id="item2" header="Section 2">
        Content 2
      </AccordionItem>
      <AccordionItem id="item3" header="Section 3">
        Content 3
      </AccordionItem>
    </Accordion>
  );
};
```

### Example 2: Tabs Component

```jsx
// Tabs.jsx
import { createContext, useContext, useState, Children, cloneElement } from 'react';

const TabsContext = createContext();

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Must be used within Tabs');
  return context;
};

export const Tabs = ({ children, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
};

export const TabList = ({ children }) => {
  const { activeTab, setActiveTab } = useTabs();

  return (
    <div className="flex border-b">
      {Children.map(children, (child, index) =>
        cloneElement(child, {
          isActive: activeTab === index,
          onClick: () => setActiveTab(index)
        })
      )}
    </div>
  );
};

export const Tab = ({ children, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-semibold border-b-2 ${
        isActive ? 'border-blue-500 text-blue-600' : 'border-transparent'
      }`}
    >
      {children}
    </button>
  );
};

export const TabContent = ({ children }) => {
  const { activeTab } = useTabs();

  return (
    <div>
      {Children.map(children, (child, index) =>
        cloneElement(child, { isActive: activeTab === index })
      )}
    </div>
  );
};

export const TabPane = ({ children, isActive }) => {
  return isActive ? <div className="p-4">{children}</div> : null;
};

// Usage
export const TabsDemo = () => {
  return (
    <Tabs defaultTab={0}>
      <TabList>
        <Tab>Home</Tab>
        <Tab>About</Tab>
        <Tab>Contact</Tab>
      </TabList>
      <TabContent>
        <TabPane>Home content</TabPane>
        <TabPane>About content</TabPane>
        <TabPane>Contact content</TabPane>
      </TabContent>
    </Tabs>
  );
};
```

---

## Complete Real-World Example: Todo App

```jsx
// TodoApp.jsx
import { useState } from 'react';

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  const setValue = (value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue];
};

const Button = ({ children, onClick, variant = 'primary' }) => {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white'
  };
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded ${variants[variant]}`}
    >
      {children}
    </button>
  );
};

const TodoItem = ({ todo, onComplete, onDelete }) => {
  return (
    <div className="flex items-center gap-2 p-3 bg-gray-100 rounded mb-2">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onComplete(todo.id)}
        className="w-4 h-4"
      />
      <span className={todo.completed ? 'line-through text-gray-500' : ''}>
        {todo.text}
      </span>
      <Button variant="danger" onClick={() => onDelete(todo.id)}>
        Delete
      </Button>
    </div>
  );
};

export const TodoApp = () => {
  const [todos, setTodos] = useLocalStorage('todos', []);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: input,
        completed: false
      }]);
      setInput('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">My Todos</h1>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new todo..."
          className="flex-1 px-3 py-2 border rounded"
        />
        <Button onClick={addTodo}>Add</Button>
      </div>

      <div>
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onComplete={toggleTodo}
            onDelete={deleteTodo}
          />
        ))}
      </div>

      <p className="mt-4 text-gray-600">
        {todos.filter(t => !t.completed).length} active, {todos.filter(t => t.completed).length} completed
      </p>
    </div>
  );
};

export default TodoApp;
```

---

This document covers all **6 React design patterns** with practical, working code samples that you can copy and use immediately!
