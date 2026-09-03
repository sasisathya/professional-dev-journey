// Custom Hooks Pattern - TypeScript Version with Full Type Safety
// Extracting component logic into reusable, type-safe hooks

import { useState, useEffect, useCallback, useRef, Dispatch, SetStateAction } from 'react';

// ===== Type Definitions =====

interface StorageError {
  message: string;
  code: string;
}

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isDirty: boolean;
  isSubmitting: boolean;
}

interface FormHelpers<T> {
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched?: boolean) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  reset: () => void;
}

interface UseFormReturn<T> extends FormState<T>, FormHelpers<T> {}

interface AsyncFunction<T> {
  (): Promise<T>;
}

interface UseAsyncState<T> {
  status: 'idle' | 'pending' | 'success' | 'error';
  data: T | null;
  error: Error | null;
}

// ===== useLocalStorage Hook =====

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return initialValue;
    }
  });

  const setValue: Dispatch<SetStateAction<T>> = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// ===== useFetch Hook =====

async function useFetchData<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

function useFetch<T>(url: string, options?: RequestInit): FetchState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null
  });

  const refetch = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await useFetchData<T>(url, options);
      setState({ data, loading: false, error: null });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      setState({ data: null, loading: false, error });
    }
  }, [url, options]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}

// ===== useForm Hook =====

function useForm<T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void>
): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    const fieldName = name as keyof T;

    if (type === 'checkbox') {
      setFieldValue(fieldName, (e.target as any).checked);
    } else {
      setFieldValue(fieldName, value);
    }
  }, [setFieldValue]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setFieldTouched(name as keyof T);
  }, [setFieldTouched]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(values);
      setValues(initialValues);
      setTouched({});
      setIsDirty(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Submit failed';
      setErrors(prev => ({ ...prev, submit: message } as any));
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit, initialValues]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsDirty(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isDirty,
    isSubmitting,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset
  };
}

// ===== useDebounce Hook =====

function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// ===== usePrevious Hook =====

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// ===== useAsync Hook =====

function useAsync<T>(
  asyncFunction: AsyncFunction<T>,
  immediate: boolean = true
): UseAsyncState<T> & { execute: () => Promise<void> } {
  const [state, setState] = useState<UseAsyncState<T>>({
    status: 'idle',
    data: null,
    error: null
  });

  const execute = useCallback(async () => {
    setState({ status: 'pending', data: null, error: null });

    try {
      const response = await asyncFunction();
      setState({ status: 'success', data: response, error: null });
    } catch (error) {
      setState({
        status: 'error',
        data: null,
        error: error instanceof Error ? error : new Error(String(error))
      });
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
}

// ===== useClickOutside Hook =====

function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  callback: () => void
): void {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
}

// ===== useTimeout Hook =====

function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setTimeout(() => savedCallback.current?.(), delay);

    return () => clearTimeout(id);
  }, [delay]);
}

// ===== useToggle Hook =====

function useToggle(initialValue: boolean = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);

  const set = useCallback((v: boolean) => {
    setValue(v);
  }, []);

  return [value, toggle, set];
}

// ===== useMeasure Hook =====

interface Measurements {
  width: number;
  height: number;
  top: number;
  left: number;
}

function useMeasure<T extends HTMLElement>(): [React.RefObject<T>, Measurements] {
  const ref = useRef<T>(null);
  const [measurements, setMeasurements] = useState<Measurements>({
    width: 0,
    height: 0,
    top: 0,
    left: 0
  });

  useEffect(() => {
    const updateMeasurements = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setMeasurements({
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left
        });
      }
    };

    updateMeasurements();
    window.addEventListener('resize', updateMeasurements);
    return () => window.removeEventListener('resize', updateMeasurements);
  }, []);

  return [ref, measurements];
}

// ===== useLocalStorage Hook for Arrays =====

function useLocalStorageArray<T>(key: string, initialValue: T[] = []): [T[], (items: T[]) => void, (item: T) => void, (index: number) => void] {
  const [items, setItems] = useLocalStorage<T[]>(key, initialValue);

  const setArrayItems = useCallback((newItems: T[]) => {
    setItems(newItems);
  }, [setItems]);

  const addItem = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, [setItems]);

  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, [setItems]);

  return [items, setArrayItems, addItem, removeItem];
}

// ===== useCounter Hook =====

interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  set: (value: number) => void;
}

function useCounter(initialValue: number = 0): UseCounterReturn {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  const set = useCallback((value: number) => setCount(value), []);

  return { count, increment, decrement, reset, set };
}

// ===== useWindowSize Hook =====

interface WindowSize {
  width: number | undefined;
  height: number | undefined;
}

function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// Export all hooks
export {
  useLocalStorage,
  useFetch,
  useForm,
  useDebounce,
  usePrevious,
  useAsync,
  useClickOutside,
  useTimeout,
  useToggle,
  useMeasure,
  useLocalStorageArray,
  useCounter,
  useWindowSize
};

export type {
  StorageError,
  FetchState,
  FormState,
  FormHelpers,
  UseFormReturn,
  AsyncFunction,
  UseAsyncState,
  Measurements,
  WindowSize,
  UseCounterReturn
};
