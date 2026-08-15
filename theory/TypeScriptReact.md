# TypeScript + React - Production Patterns

## Table of Contents
1. [Component Type Definitions](#component-type-definitions)
2. [Props & Events](#props--events)
3. [Hooks Typing](#hooks-typing)
4. [State Management](#state-management)
5. [Advanced Patterns](#advanced-patterns)
6. [Common Pitfalls](#common-pitfalls)

---

## Component Type Definitions

### Functional Component (Modern Approach)
**Best practice (2026):** Don't use `React.FC<Props>` anymore. Just use function + explicit return type.

**Why:**
- `React.FC` implicitly adds `children?: ReactNode` (you might not want children)
- `React.FC` doesn't infer return type correctly in some cases
- Plain function is clearer

**Modern way:**
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps): JSX.Element {
  return (
    <button disabled={disabled} onClick={onClick}>
      {label}
    </button>
  );
}
```

**Old way (avoid):**
```typescript
export const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false }) => {
  return <button disabled={disabled} onClick={onClick}>{label}</button>;
};
```

**Key takeaway:** Use function + return type annotation. Skip `React.FC`.

---

### Generic Components
**Problem:** Component that works with any data type.

**Solution:**
```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
}

export function List<T>({
  items,
  renderItem,
  keyExtractor,
}: ListProps<T>): JSX.Element {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// Usage
<List
  items={users}
  renderItem={(user) => <span>{user.name}</span>}
  keyExtractor={(user) => user.id}
/>
```

**With constraints:**
```typescript
interface HasId {
  id: string | number;
}

export function UniqueList<T extends HasId>({
  items,
  renderItem,
}: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}): JSX.Element {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
```

**Key takeaway:** Use generic `<T>` for type-safe reusable components.

---

### Children Props
**Correct typing:**
```typescript
interface ContainerProps {
  children: React.ReactNode; // Most flexible
  title: string;
}

export function Container({ children, title }: ContainerProps): JSX.Element {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
```

**For specific children types:**
```typescript
// Only accept Button components
interface ButtonGroupProps {
  children: React.ReactElement<ButtonProps> | React.ReactElement<ButtonProps>[];
}

// Only accept one specific component
interface ProviderProps {
  children: React.ReactElement<ChildProps>;
}
```

**Why `React.ReactNode` is better:**
- `string | number | boolean | ReactElement | ReactFragment | ReactPortal`
- Covers all possible valid React children
- Don't overthink it

**Key takeaway:** Use `React.ReactNode` for children. Only constrain if you have specific requirements.

---

## Props & Events

### HTML Attributes
**Problem:** Typing props for HTML elements is verbose.

**Solution 1: Extend HTML element props**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function Button({ variant = 'primary', ...rest }: ButtonProps): JSX.Element {
  return <button className={`btn-${variant}`} {...rest} />;
}

// Usage allows all native button props
<Button onClick={() => {}} disabled className="custom" />
```

**Solution 2: For custom props + HTML props**
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, ...inputProps }: InputProps): JSX.Element {
  return (
    <label>
      {label}
      <input {...inputProps} />
      {error && <span className="error">{error}</span>}
    </label>
  );
}
```

**Key takeaway:** Extend `HTMLAttributes` to get type-safe HTML props.

---

### Event Handlers
**Typing change events:**
```typescript
function MyInput(): JSX.Element {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    console.log(e.currentTarget.value);
  };
  return <input onChange={handleChange} />;
}
```

**Common event types:**
```typescript
// Input/textarea
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {};
const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {};

// Click
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {};

// Focus
const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {};

// Form submit
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
};

// Generic event (avoid)
const handleEvent = (e: React.SyntheticEvent) => {};
```

**In callbacks:**
```typescript
interface ButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onChange?: (value: string) => void; // custom callback, not React event
}
```

**Key takeaway:** Use `React.ChangeEvent<HTMLElement>`, `React.MouseEvent`, etc. for type safety.

---

## Hooks Typing

### useState
**Explicit type:**
```typescript
const [count, setCount] = useState<number>(0);
const [name, setName] = useState<string>('');
const [data, setData] = useState<User | null>(null);
```

**Inferred type (usually fine):**
```typescript
const [count, setCount] = useState(0); // TypeScript infers number
const [name, setName] = useState(''); // TypeScript infers string
```

**Complex state:**
```typescript
interface FormState {
  email: string;
  password: string;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

const [form, setForm] = useState<FormState>({
  email: '',
  password: '',
  errors: {},
  isSubmitting: false,
});
```

**Key takeaway:** Explicit type only for complex/union types. Let TypeScript infer primitives.

---

### useEffect
**Proper cleanup typing:**
```typescript
// Cleanup returns void, not a function type
useEffect((): void | (() => void) => {
  const timer = setTimeout(() => {}, 1000);
  return () => clearTimeout(timer);
}, []);

// Or simpler
useEffect(() => {
  const handler = () => {};
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);
```

**Dependency array - let TypeScript infer:**
```typescript
const userId = 123;
useEffect(() => {
  fetch(`/api/user/${userId}`);
}, [userId]); // TypeScript checks dependencies
```

**Key takeaway:** Dependencies are checked by ESLint + TypeScript. Return cleanup function.

---

### useCallback
**Type the callback:**
```typescript
const handleClick = useCallback(
  (e: React.MouseEvent<HTMLButtonElement>): void => {
    console.log(e.currentTarget);
  },
  [/* deps */]
);

// Or let TypeScript infer from handler assignment
const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
  // TypeScript knows return type is void
}, []);
```

**With dependencies:**
```typescript
interface User {
  id: number;
  name: string;
}

const handleUserClick = useCallback(
  (user: User): void => {
    console.log(user.name);
  },
  [/* deps */]
);
```

**Key takeaway:** Annotate parameter types. Return type often inferred.

---

### useMemo
**Type the memoized value:**
```typescript
const sortedItems = useMemo<Item[]>(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// Or let TypeScript infer
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]); // TypeScript infers Item[]
```

**Complex derived state:**
```typescript
interface FilteredResult {
  items: User[];
  total: number;
  hasMore: boolean;
}

const result = useMemo<FilteredResult>(() => {
  const filtered = users.filter(u => u.active);
  return {
    items: filtered.slice(0, 10),
    total: filtered.length,
    hasMore: filtered.length > 10,
  };
}, [users]);
```

**Key takeaway:** Explicit type only for complex objects. Let TypeScript infer arrays/primitives.

---

### useRef
**DOM ref:**
```typescript
const inputRef = useRef<HTMLInputElement>(null);

return (
  <>
    <input ref={inputRef} />
    <button onClick={() => inputRef.current?.focus()}>Focus</button>
  </>
);
```

**Mutable ref (not DOM):**
```typescript
const timerRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  timerRef.current = setInterval(() => {}, 1000);
  return () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };
}, []);
```

**Generic ref:**
```typescript
const valueRef = useRef<string>('initial');
valueRef.current = 'updated';
```

**Key takeaway:** `useRef<T>(null)` for refs. Always check `.current` before using.

---

### Custom Hooks
**Typed custom hook:**
```typescript
interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(r => r.json() as Promise<T>)
      .then(data => setData(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}

// Usage
const { data: user, loading, error } = useFetch<User>('/api/user/1');
```

**With options:**
```typescript
interface UseFetchOptions {
  skip?: boolean;
  headers?: Record<string, string>;
}

function useFetch<T>(url: string, options?: UseFetchOptions): UseFetchResult<T> {
  // implementation
}
```

**Key takeaway:** Generic hook result type. Explicit type params at call site.

---

## State Management

### Context + TypeScript
**Typed context:**
```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as User;
      setUser(data);
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Usage:**
```typescript
function Dashboard(): JSX.Element {
  const { user, logout } = useAuth();
  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**Key takeaway:** Define context type explicitly. Custom hook ensures type safety + error checking.

---

### Zustand + TypeScript
```typescript
import { create } from 'zustand';

interface CartItem {
  id: number;
  name: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  clear: () => void;
  total: () => number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
  clear: () => set({ items: [] }),
  total: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));

// Usage
function Cart(): JSX.Element {
  const { items, removeItem, total } = useCart();
  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>
          {item.name} x{item.quantity}
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
      <p>Total: {total()}</p>
    </div>
  );
}
```

**Key takeaway:** Full type safety for store. Zustand infers getter types.

---

## Advanced Patterns

### Discriminated Unions (For Complex Props)
**Problem:** Component that behaves differently based on type.

**Solution:**
```typescript
type ButtonProps =
  | {
      variant: 'primary' | 'secondary';
      onClick: () => void;
      children: React.ReactNode;
    }
  | {
      variant: 'link';
      href: string;
      children: React.ReactNode;
    };

export function Button(props: ButtonProps): JSX.Element {
  if (props.variant === 'link') {
    // TypeScript knows href exists here
    return <a href={props.href}>{props.children}</a>;
  }
  // TypeScript knows onClick exists here
  return <button onClick={props.onClick}>{props.children}</button>;
}

// Correct usage enforced by TypeScript
<Button variant="primary" onClick={() => {}} />
<Button variant="link" href="/about" />

// Error: TypeScript catches this
<Button variant="link" onClick={() => {}} /> // error: onClick not allowed
```

**Key takeaway:** Discriminated unions enforce correct prop combinations.

---

### as const Pattern
**For literal types:**
```typescript
const ROLES = ['admin', 'user', 'guest'] as const;
type Role = (typeof ROLES)[number]; // 'admin' | 'user' | 'guest'

interface User {
  name: string;
  role: Role;
}

const user: User = { name: 'John', role: 'admin' }; // ✓
const user2: User = { name: 'Jane', role: 'superuser' }; // ✗ error
```

**For component variants:**
```typescript
const BUTTON_VARIANTS = ['primary', 'secondary', 'danger'] as const;
type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

interface ButtonProps {
  variant?: ButtonVariant;
}
```

**Key takeaway:** `as const` creates strict literal types. Better than strings.

---

### forwardRef + TypeScript
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, ...rest }, ref) => (
    <label>
      {label}
      <input ref={ref} {...rest} />
    </label>
  )
);

Input.displayName = 'Input';

// Usage
const inputRef = useRef<HTMLInputElement>(null);
<Input ref={inputRef} label="Name" placeholder="Enter name" />
```

**Key takeaway:** Explicit type params for forwardRef: `<ElementType, PropsType>`.

---

## Common Pitfalls

### Don't Use `any`
```typescript
// ❌ BAD
function handleClick(e: any) {}

// ✓ GOOD
function handleClick(e: React.MouseEvent<HTMLButtonElement>) {}
```

**Why:** `any` defeats TypeScript's purpose. Errors pass silently.

---

### Event Handler Typing
```typescript
// ❌ WRONG
const handleChange = (e: any) => setName(e.target.value);

// ✓ RIGHT
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setName(e.currentTarget.value);
};
```

**Key takeaway:** Use `currentTarget` (type-safe) instead of `target`.

---

### Generic Constraints
```typescript
// Too loose
function renderList<T>(items: T[]): JSX.Element {}

// Better with constraint
function renderList<T extends { id: string }>(items: T[]): JSX.Element {}

// Usage enforces that items must have id
renderList([{ id: '1', name: 'John' }]); // ✓
renderList([{ name: 'John' }]); // ✗ error
```

**Key takeaway:** Constrain generics for type safety.

---

### Context Validation
```typescript
// ❌ BAD: No validation
export function useAuth() {
  return useContext(AuthContext);
}

// ✓ GOOD: Validates provider exists
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Key takeaway:** Always validate context exists.

---

### Type Inference vs Explicit Types
```typescript
// Let TypeScript infer (preferred for simple cases)
const [count, setCount] = useState(0);
const items = useMemo(() => [...array], [array]);

// Explicit type (required for complex cases)
const [data, setData] = useState<User | null>(null);
const result = useMemo<FilterResult>(() => ({ items: [], total: 0 }), []);
```

**Key takeaway:** Infer when clear. Explicit when ambiguous.

---

## Interview Tips for TypeScript + React

**Strong answers:**
- "I extend HTMLAttributes for HTML components to get type-safe native props"
- "I use discriminated unions for complex prop combinations"
- "I avoid `any` and use specific event types"
- "I validate context in custom hooks to catch provider errors early"

**Red flags:**
- "I just use `any` to avoid type errors"
- "TypeScript is too verbose"
- "I don't type my props"
- "I use `React.FC` everywhere"

---

**Level:** Production-Ready | **Updated:** 2026-08-16
