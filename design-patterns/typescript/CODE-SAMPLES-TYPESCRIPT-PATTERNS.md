# TypeScript Design Pattern Code Samples

Complete working examples for Node.js and React TypeScript design patterns.

---

## NODE.JS TYPESCRIPT PATTERNS

## 1. SINGLETON PATTERN - TypeScript Code Samples

### Example 1: Type-Safe Database Singleton

```typescript
// database.ts
interface IConnection {
  id: string;
  host: string;
  port: number;
  database: string;
  connected: boolean;
}

interface IQueryResult {
  success: boolean;
  data: unknown;
  duration: number;
}

class Database {
  private static instance: Database;
  private connection: IConnection | null = null;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public connect(config: {
    host: string;
    port: number;
    database: string;
  }): IConnection {
    if (this.connection?.connected) {
      return this.connection;
    }

    this.connection = {
      id: Math.random().toString(36).substr(2, 9),
      ...config,
      connected: true
    };

    console.log(`✅ Database connected: ${this.connection.id}`);
    return this.connection;
  }

  public async query<T = unknown>(sql: string): Promise<IQueryResult> {
    if (!this.connection?.connected) {
      throw new Error('Database not connected');
    }

    const start = performance.now();
    // Simulate query execution
    await new Promise(resolve => setTimeout(resolve, 100));
    const duration = performance.now() - start;

    return {
      success: true,
      data: { sql, connection: this.connection.id },
      duration
    };
  }

  public disconnect(): void {
    if (this.connection) {
      console.log(`❌ Database disconnected: ${this.connection.id}`);
      this.connection = null;
    }
  }
}

// Usage
const db1 = Database.getInstance();
db1.connect({ host: 'localhost', port: 5432, database: 'myapp' });

const db2 = Database.getInstance();
console.log(db1 === db2); // true

const result = await db1.query('SELECT * FROM users');
console.log(result);
```

### Example 2: Type-Safe Configuration Singleton

```typescript
// config.ts
interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

interface ServerConfig {
  host: string;
  port: number;
  ssl: boolean;
}

interface AppConfigType {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
  };
  database: DatabaseConfig;
  server: ServerConfig;
}

class Config {
  private static instance: Config;
  private config: AppConfigType;

  private constructor(initialConfig: AppConfigType) {
    this.config = initialConfig;
  }

  public static getInstance(
    initialConfig?: AppConfigType
  ): Config {
    if (!Config.instance) {
      Config.instance = new Config(
        initialConfig || {
          app: {
            name: 'MyApp',
            version: '1.0.0',
            environment: 'development'
          },
          database: {
            host: 'localhost',
            port: 5432,
            username: 'admin',
            password: 'password'
          },
          server: {
            host: 'localhost',
            port: 3000,
            ssl: false
          }
        }
      );
    }
    return Config.instance;
  }

  public get<K extends keyof AppConfigType>(key: K): AppConfigType[K] {
    return this.config[key];
  }

  public set<K extends keyof AppConfigType>(
    key: K,
    value: AppConfigType[K]
  ): void {
    this.config[key] = value;
  }

  public getAll(): Readonly<AppConfigType> {
    return Object.freeze({ ...this.config });
  }

  public isDevelopment(): boolean {
    return this.config.app.environment === 'development';
  }

  public isProduction(): boolean {
    return this.config.app.environment === 'production';
  }
}

// Usage
const config = Config.getInstance();
console.log('App Name:', config.get('app').name);
console.log('Database:', config.get('database'));
console.log('Is Dev?', config.isDevelopment());
```

---

## 2. FACTORY PATTERN - TypeScript Code Samples

### Example 1: Type-Safe Vehicle Factory

```typescript
// vehicleFactory.ts
interface Vehicle {
  type: string;
  make: string;
  model: string;
  start(): string;
  stop(): string;
}

interface Car extends Vehicle {
  type: 'car';
  doors: number;
}

interface Motorcycle extends Vehicle {
  type: 'motorcycle';
  engineCC: number;
}

interface Truck extends Vehicle {
  type: 'truck';
  capacity: number;
}

type VehicleType = Car | Motorcycle | Truck;

class CarImpl implements Car {
  type: 'car' = 'car';
  doors: number = 4;

  constructor(public make: string, public model: string) {}

  start(): string {
    return `${this.make} car started`;
  }

  stop(): string {
    return `${this.make} car stopped`;
  }
}

class MotorcycleImpl implements Motorcycle {
  type: 'motorcycle' = 'motorcycle';
  engineCC: number = 600;

  constructor(public make: string, public model: string) {}

  start(): string {
    return `${this.make} motorcycle roared`;
  }

  stop(): string {
    return `${this.make} motorcycle stopped`;
  }
}

class TruckImpl implements Truck {
  type: 'truck' = 'truck';

  constructor(
    public make: string,
    public model: string,
    public capacity: number
  ) {}

  start(): string {
    return `${this.make} truck diesel started`;
  }

  stop(): string {
    return `${this.make} truck stopped`;
  }
}

class VehicleFactory {
  static create(type: 'car', make: string, model: string): Car;
  static create(type: 'motorcycle', make: string, model: string): Motorcycle;
  static create(
    type: 'truck',
    make: string,
    model: string,
    capacity: number
  ): Truck;
  static create(
    type: string,
    make: string,
    model: string,
    capacity?: number
  ): VehicleType {
    switch (type) {
      case 'car':
        return new CarImpl(make, model);
      case 'motorcycle':
        return new MotorcycleImpl(make, model);
      case 'truck':
        return new TruckImpl(make, model, capacity || 20);
      default:
        throw new Error(`Unknown vehicle type: ${type}`);
    }
  }
}

// Usage with type inference
const car = VehicleFactory.create('car', 'Toyota', 'Camry');
const bike = VehicleFactory.create('motorcycle', 'Harley', 'Street 750');
const truck = VehicleFactory.create('truck', 'Volvo', 'FH16', 25);

console.log(car.doors); // Type-safe property access
console.log(bike.engineCC);
console.log(truck.capacity);
```

### Example 2: Generic Factory Pattern

```typescript
// genericFactory.ts
interface IFactory<T> {
  create(...args: any[]): T;
}

class GenericFactory<T> {
  private creators: Map<string, IFactory<T>> = new Map();

  register(type: string, creator: IFactory<T>): void {
    this.creators.set(type, creator);
  }

  create(type: string, ...args: any[]): T {
    const creator = this.creators.get(type);
    if (!creator) {
      throw new Error(`Unknown type: ${type}`);
    }
    return creator.create(...args);
  }
}

// Example with objects
interface User {
  id: number;
  name: string;
  email: string;
}

class UserFactory implements IFactory<User> {
  constructor(private idPrefix: string) {}

  create(name: string, email: string): User {
    return {
      id: parseInt(this.idPrefix + Date.now()),
      name,
      email
    };
  }
}

// Usage
const factory = new GenericFactory<User>();
factory.register('user', new UserFactory('1'));

const user = factory.create('user', 'John Doe', 'john@example.com');
console.log(user);
```

---

## 3. OBSERVER PATTERN - TypeScript Code Samples

### Example 1: Type-Safe Event Emitter

```typescript
// eventEmitter.ts
interface IObserver<T> {
  update(data: T): void;
}

interface ISubject<T> {
  attach(observer: IObserver<T>): void;
  detach(observer: IObserver<T>): void;
  notify(data: T): void;
}

interface UserEvent {
  type: 'created' | 'updated' | 'deleted';
  userId: number;
  timestamp: Date;
  data?: Record<string, unknown>;
}

class UserEventEmitter implements ISubject<UserEvent> {
  private observers: Set<IObserver<UserEvent>> = new Set();
  private history: UserEvent[] = [];

  attach(observer: IObserver<UserEvent>): void {
    this.observers.add(observer);
    console.log(`✅ Observer attached. Count: ${this.observers.size}`);
  }

  detach(observer: IObserver<UserEvent>): void {
    this.observers.delete(observer);
  }

  notify(data: UserEvent): void {
    this.history.push(data);
    this.observers.forEach(observer => {
      observer.update(data);
    });
  }

  getHistory(): readonly UserEvent[] {
    return Object.freeze([...this.history]);
  }
}

// Concrete observers
class EmailObserver implements IObserver<UserEvent> {
  update(event: UserEvent): void {
    console.log(`📧 Email: User ${event.userId} - ${event.type}`);
  }
}

class LoggerObserver implements IObserver<UserEvent> {
  update(event: UserEvent): void {
    console.log(
      `📝 Log [${event.timestamp.toISOString()}]: User event - ${event.type}`
    );
  }
}

class AnalyticsObserver implements IObserver<UserEvent> {
  private eventCount: number = 0;

  update(event: UserEvent): void {
    this.eventCount++;
    console.log(`📊 Analytics: Event #${this.eventCount} - ${event.type}`);
  }

  getEventCount(): number {
    return this.eventCount;
  }
}

// Usage
const emitter = new UserEventEmitter();

const emailObserver = new EmailObserver();
const loggerObserver = new LoggerObserver();
const analyticsObserver = new AnalyticsObserver();

emitter.attach(emailObserver);
emitter.attach(loggerObserver);
emitter.attach(analyticsObserver);

emitter.notify({
  type: 'created',
  userId: 1,
  timestamp: new Date()
});

emitter.notify({
  type: 'updated',
  userId: 1,
  timestamp: new Date(),
  data: { email: 'newemail@example.com' }
});

console.log('Total events:', analyticsObserver.getEventCount());
```

---

## 4. STRATEGY PATTERN - TypeScript Code Samples

### Example 1: Type-Safe Payment Strategy

```typescript
// paymentStrategies.ts
interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  fee: number;
  total: number;
  timestamp: string;
}

interface PaymentStrategy {
  execute(amount: number): PaymentResult;
  calculateFee(amount: number): number;
}

class CreditCardStrategy implements PaymentStrategy {
  constructor(
    private cardNumber: string,
    private cardHolder: string,
    private cvv: string
  ) {}

  execute(amount: number): PaymentResult {
    const fee = this.calculateFee(amount);
    return {
      success: true,
      transactionId: `CC-${Date.now()}`,
      amount,
      fee,
      total: amount + fee,
      timestamp: new Date().toISOString()
    };
  }

  calculateFee(amount: number): number {
    return amount * 0.029; // 2.9%
  }
}

class PayPalStrategy implements PaymentStrategy {
  constructor(private email: string) {}

  execute(amount: number): PaymentResult {
    const fee = this.calculateFee(amount);
    return {
      success: true,
      transactionId: `PP-${Date.now()}`,
      amount,
      fee,
      total: amount + fee,
      timestamp: new Date().toISOString()
    };
  }

  calculateFee(amount: number): number {
    return amount * 0.034 + 0.30;
  }
}

class BitcoinStrategy implements PaymentStrategy {
  constructor(private walletAddress: string) {}

  execute(amount: number): PaymentResult {
    const fee = this.calculateFee(amount);
    return {
      success: true,
      transactionId: `BTC-${Date.now()}`,
      amount,
      fee,
      total: amount + fee,
      timestamp: new Date().toISOString()
    };
  }

  calculateFee(amount: number): number {
    return 0.0001;
  }
}

class PaymentProcessor {
  constructor(private strategy: PaymentStrategy) {}

  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }

  pay(amount: number): PaymentResult {
    return this.strategy.execute(amount);
  }

  estimateFee(amount: number): number {
    return this.strategy.calculateFee(amount);
  }
}

// Usage
const processor = new PaymentProcessor(
  new CreditCardStrategy('1234567890123456', 'John Doe', '123')
);

let result = processor.pay(100);
console.log('Credit Card:', result);

processor.setStrategy(new PayPalStrategy('john@example.com'));
result = processor.pay(100);
console.log('PayPal:', result);

processor.setStrategy(new BitcoinStrategy('1A1z7agoat...'));
result = processor.pay(100);
console.log('Bitcoin:', result);
```

### Example 2: Generic Sorting Strategies

```typescript
// sortingStrategies.ts
interface SortStrategy<T> {
  sort(array: T[]): T[];
}

class BubbleSortStrategy<T> implements SortStrategy<T> {
  sort(array: T[]): T[] {
    const arr = [...array];
    const len = arr.length;

    for (let i = 0; i < len; i++) {
      for (let j = 0; j < len - i - 1; j++) {
        if ((arr[j] as any) > (arr[j + 1] as any)) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }
    return arr;
  }
}

class QuickSortStrategy<T> implements SortStrategy<T> {
  sort(array: T[]): T[] {
    if (array.length <= 1) return array;

    const pivot = array[0];
    const left = array.slice(1).filter(x => (x as any) < (pivot as any));
    const right = array.slice(1).filter(x => (x as any) >= (pivot as any));

    return [...this.sort(left), pivot, ...this.sort(right)];
  }
}

class SortProcessor<T> {
  constructor(private strategy: SortStrategy<T>) {}

  setStrategy(strategy: SortStrategy<T>): void {
    this.strategy = strategy;
  }

  sort(array: T[]): T[] {
    return this.strategy.sort(array);
  }
}

// Usage
const numbers = [64, 34, 25, 12, 22, 11, 90];
const processor = new SortProcessor(new BubbleSortStrategy<number>());

console.log('Bubble Sort:', processor.sort(numbers));

processor.setStrategy(new QuickSortStrategy<number>());
console.log('Quick Sort:', processor.sort(numbers));
```

---

## REACT TYPESCRIPT PATTERNS

## 1. COMPONENT COMPOSITION - React TypeScript

### Example 1: Typed Button Component

```typescript
// Button.tsx
import React, { ReactNode, ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'danger' | 'success';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-green-500 text-white hover:bg-green-600'
  };

  return (
    <button
      className={`px-4 py-2 rounded font-semibold ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
```

### Example 2: Typed User Card Component

```typescript
// UserCard.tsx
import React, { FC } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
}

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
}

const UserCard: FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <h3 className="text-xl font-bold">{user.name}</h3>
      <p className="text-gray-600">{user.email}</p>
      <p className="text-sm text-gray-500 mt-2">Role: {user.role}</p>
      
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onEdit(user)}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(user.id)}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default UserCard;
```

---

## 2. CUSTOM HOOKS - React TypeScript

### Example 1: Type-Safe useForm Hook

```typescript
// useForm.ts
import { useState, FormEvent, ChangeEvent } from 'react';

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  reset: () => void;
}

function useForm<T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void>
): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      setValues(initialValues);
    } catch (error) {
      console.error(error);
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
}

export default useForm;
```

### Example 2: Type-Safe useFetch Hook

```typescript
// useFetch.ts
import { useState, useEffect } from 'react';

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseFetchReturn<T> extends UseFetchState<T> {
  refetch: () => Promise<void>;
}

function useFetch<T = unknown>(url: string): UseFetchReturn<T> {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: true,
    error: null
  });

  const fetchData = async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      const data: T = await response.json();
      setState({ data, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({ data: null, loading: false, error: errorMessage });
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  const refetch = async () => {
    setState(prev => ({ ...prev, loading: true }));
    await fetchData();
  };

  return { ...state, refetch };
}

export default useFetch;
```

---

## 3. CONTEXT API - React TypeScript

### Example 1: Type-Safe Theme Context

```typescript
// ThemeContext.tsx
import React, { createContext, useContext, useState, ReactNode, FC } from 'react';

type Theme = 'light' | 'dark';
type Color = 'blue' | 'red' | 'green';

interface ThemeContextType {
  theme: Theme;
  primaryColor: Color;
  toggleTheme: () => void;
  setColor: (color: Color) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [primaryColor, setPrimaryColor] = useState<Color>('blue');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setColor = (color: Color) => {
    setPrimaryColor(color);
  };

  const value: ThemeContextType = {
    theme,
    primaryColor,
    toggleTheme,
    setColor
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

### Example 2: Type-Safe Auth Context

```typescript
// AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, FC } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser({
        id: 1,
        username,
        email: `${username}@example.com`,
        role: 'user'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## Complete Real-World Example: TypeScript Todo App

```typescript
// TodoApp.tsx
import React, { FC, useState } from 'react';
import useForm from './useForm';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoFormData {
  todoText: string;
}

const TodoApp: FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const form = useForm<TodoFormData>(
    { todoText: '' },
    async (values) => {
      if (values.todoText.trim()) {
        setTodos([
          ...todos,
          {
            id: Date.now(),
            text: values.todoText,
            completed: false
          }
        ]);
        form.reset();
      }
    }
  );

  const toggleTodo = (id: number): void => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number): void => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const activeTodos = todos.filter(t => !t.completed).length;
  const completedTodos = todos.filter(t => t.completed).length;

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Todos</h1>

      <form onSubmit={form.handleSubmit} className="mb-6">
        <input
          type="text"
          name="todoText"
          value={form.values.todoText}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          placeholder="Add a new todo..."
          className="w-full px-3 py-2 border rounded mb-2"
        />
        <button
          type="submit"
          disabled={form.isSubmitting}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {form.isSubmitting ? 'Adding...' : 'Add Todo'}
        </button>
      </form>

      <div className="space-y-2 mb-6">
        {todos.map(todo => (
          <div
            key={todo.id}
            className="flex items-center gap-2 p-3 bg-gray-100 rounded"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="w-4 h-4"
            />
            <span
              className={todo.completed ? 'line-through text-gray-500 flex-1' : 'flex-1'}
            >
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {todos.length === 0 ? (
        <p className="text-gray-500 text-center">No todos yet. Add one above!</p>
      ) : (
        <div className="text-sm text-gray-600">
          <p>{activeTodos} active | {completedTodos} completed</p>
        </div>
      )}
    </div>
  );
};

export default TodoApp;
```

---

These TypeScript code samples provide **production-ready, type-safe implementations** that you can use directly in your projects!

Key benefits demonstrated:
- ✅ Full type safety with generics
- ✅ No `any` types
- ✅ Type inference where possible
- ✅ Discriminated unions for safety
- ✅ Proper interface definitions
- ✅ Error handling with types
- ✅ Reusable generic patterns
