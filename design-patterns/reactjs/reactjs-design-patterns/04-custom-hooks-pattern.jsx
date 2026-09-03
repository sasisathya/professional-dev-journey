// Custom Hooks Pattern - Extracting component logic into reusable functions
// Use case: Sharing stateful logic, side effects, form handling, API calls

import React, { useState, useEffect, useCallback, useRef } from 'react';

// ===== useLocalStorage Hook =====
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

// ===== useFetch Hook =====
const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
};

// ===== useForm Hook =====
const useForm = (initialValues, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFieldValue(name, type === 'checkbox' ? checked : value);
  }, [setFieldValue]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setFieldTouched(name);
  }, [setFieldTouched]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(values);
      setValues(initialValues);
      setTouched({});
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit, initialValues]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset
  };
};

// ===== useDebounce Hook =====
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// ===== usePrevious Hook =====
const usePrevious = (value) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

// ===== useAsync Hook =====
const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
    } catch (error) {
      setError(error);
      setStatus('error');
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, data, error };
};

// ===== useClickOutside Hook =====
const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};

// ===== useTimeout Hook =====
const useTimeout = (callback, delay) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setTimeout(() => savedCallback.current(), delay);

    return () => clearTimeout(id);
  }, [delay]);
};

// ===== useLocalStorage Hook in Action =====
const TodoApp = () => {
  const [todos, setTodos] = useLocalStorage('todos', []);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
      setInput('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Todo App (with useLocalStorage)</h3>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add a new todo..."
        />
        <button
          onClick={addTodo}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {todos.map(todo => (
          <div key={todo.id} className="flex items-center gap-3 p-3 bg-gray-100 rounded">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="w-5 h-5 cursor-pointer"
            />
            <span className={todo.completed ? 'line-through text-gray-500' : ''}>
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="ml-auto px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== useForm Hook in Action =====
const FormComponent = ({ onSuccess }) => {
  const form = useForm(
    { username: '', email: '', message: '' },
    async (values) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form submitted:', values);
      onSuccess(values);
    }
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
      <h3 className="text-xl font-bold mb-4">Contact Form (with useForm)</h3>

      <form onSubmit={form.handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Username</label>
          <input
            type="text"
            name="username"
            value={form.values.username}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={form.values.email}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Message</label>
          <textarea
            name="message"
            value={form.values.message}
            onChange={form.handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={form.isSubmitting}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold disabled:opacity-50"
          >
            {form.isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <button
            type="button"
            onClick={form.reset}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

// ===== useDebounce Hook in Action =====
const SearchComponent = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (debouncedSearch) {
      console.log('Searching for:', debouncedSearch);
      // Simulate API call
      setResults([
        `Result for "${debouncedSearch}" - 1`,
        `Result for "${debouncedSearch}" - 2`,
        `Result for "${debouncedSearch}" - 3`
      ]);
    } else {
      setResults([]);
    }
  }, [debouncedSearch]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Search (with useDebounce)</h3>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        placeholder="Type to search..."
      />

      {results.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-2">Found {results.length} results</p>
          <ul className="space-y-2">
            {results.map((result, index) => (
              <li key={index} className="p-2 bg-blue-100 rounded text-blue-900">
                {result}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Main Demo
export const CustomHooksDemo = () => {
  const [formSubmitted, setFormSubmitted] = React.useState(null);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Custom Hooks Pattern</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TodoApp />
        <SearchComponent />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormComponent onSuccess={setFormSubmitted} />

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4">Custom Hooks Benefits</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>✓ Extract and reuse stateful logic</li>
            <li>✓ Simplify complex components</li>
            <li>✓ Share side effects logic</li>
            <li>✓ Better code organization</li>
            <li>✓ Easier testing</li>
            <li>✓ No wrapper hell (unlike HOCs and render props)</li>
          </ul>
        </div>
      </div>

      {formSubmitted && (
        <div className="mt-6 bg-green-100 p-4 rounded-lg border border-green-500">
          <p className="font-semibold text-green-800">✓ Form submitted successfully!</p>
          <pre className="text-sm text-green-700 mt-2">
            {JSON.stringify(formSubmitted, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CustomHooksDemo;
