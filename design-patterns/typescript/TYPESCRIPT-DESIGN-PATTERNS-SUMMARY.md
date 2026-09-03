# TypeScript Design Patterns - Complete Implementation Guide

This directory contains **production-ready, type-safe TypeScript implementations** of design patterns for both Node.js and React.js with comprehensive examples.

## 📋 Node.js TypeScript Design Patterns

### 1. **Singleton Pattern** (`nodejs-design-patterns-typescript/01-singleton-pattern.ts`)
**File Size**: ~400 lines | **Complexity**: Low

**TypeScript Features Used**:
- Private constructors
- Static instances
- Generic type parameters
- Type-safe singletons
- Singleton container with type safety

**Key Types**:
```typescript
interface IConnection {
  id: string;
  host: string;
  port: number;
  database: string;
  timestamp: string;
}

interface IConnectionStatus {
  isConnected: boolean;
  connectionId: string | null;
}
```

**Implementations**:
- `DatabaseConnection` - Singleton database instance
- `Logger` - Singleton logger with type-safe methods
- `Config` - Type-safe configuration management
- `SingletonFactory<T>` - Generic singleton factory
- `SingletonContainer` - Type-safe container for managing singletons

**When to Use**:
- Database connections
- Logging services
- Configuration management
- Cache managers
- Application services

---

### 2. **Factory Pattern** (`nodejs-design-patterns-typescript/02-factory-pattern.ts`)
**File Size**: ~500 lines | **Complexity**: Medium

**TypeScript Features Used**:
- Discriminated unions
- Generic factories
- Type guards
- Abstract factories
- Factory patterns with type inference

**Key Types**:
```typescript
interface Vehicle {
  type: string;
  make: string;
  model: string;
  getInfo(): string;
  start(): string;
}

type VehicleTypes = Car | Motorcycle | Truck | BicycleVehicle;

interface FactoryConfig<T> {
  create(...args: any[]): T;
}
```

**Implementations**:
- `VehicleFactory` - Type-safe vehicle creation
- `GenericFactory<T>` - Reusable generic factory
- `AbstractFactory` - Abstract factory pattern
- `LuxuryVehicleFactory` - Concrete luxury factory
- `EconomyVehicleFactory` - Concrete economy factory
- `ObjectFactory` - Generic object creation

**When to Use**:
- Creating different types of objects
- Database drivers
- Payment processors
- API clients
- Configuration builders

---

### 3. **Observer Pattern** (`nodejs-design-patterns-typescript/03-observer-pattern.ts`)
**File Size**: ~550 lines | **Complexity**: Medium

**TypeScript Features Used**:
- Generic observers with type parameters
- Discriminated unions for events
- Higher-order types
- Event filtering and history
- Type-safe event emitters

**Key Types**:
```typescript
interface IObserver<T> {
  update(data: T): void;
}

interface ISubject<T> {
  attach(observer: IObserver<T>): void;
  detach(observer: IObserver<T>): void;
  notify(data: T): void;
}

interface UserEventData {
  type: 'added' | 'updated' | 'removed';
  user: User;
  timestamp: string;
}
```

**Implementations**:
- `EventEmitter<T>` - Generic event emitter
- `UserService` - Observable user service
- `OrderService` - Observable order service
- `EmailNotifier` - Email observer
- `AnalyticsObserver` - Analytics tracking
- `TypedObserver<T>` - Observer with filtering

**When to Use**:
- Event-driven architectures
- Pub-Sub systems
- Real-time notifications
- State change propagation
- Event logging and analytics

---

### 4. **Strategy Pattern** (`nodejs-design-patterns-typescript/04-strategy-pattern.ts`)
**File Size**: ~550 lines | **Complexity**: Medium-High

**TypeScript Features Used**:
- Generic strategy interfaces
- Strategy composition
- Type-safe strategy selection
- Discriminated unions for strategies
- Conditional type narrowing

**Key Types**:
```typescript
interface IStrategy<T, R> {
  execute(data: T): R;
}

interface PaymentMethod {
  type: string;
  process(amount: number): PaymentResult;
  getFee(amount: number): number;
}

interface SortStrategy<T> extends IStrategy<T[], T[]> {
  execute(data: T[]): T[];
}
```

**Implementations**:
- `PaymentProcessor` - Multi-strategy payment processing
- `CreditCardStrategy` - Credit card payment
- `PayPalStrategy` - PayPal payment
- `CryptoCurrencyStrategy` - Cryptocurrency payment
- `ApplePayStrategy` - Apple Pay payment
- `SortProcessor<T>` - Generic sorting strategies
- `BubbleSortStrategy`, `QuickSortStrategy`, `MergeSortStrategy`
- `CompressionStrategy` - Data compression strategies
- `AuthenticationStrategy` - Auth method strategies

**When to Use**:
- Payment processing
- Sorting algorithms
- Compression formats
- Authentication methods
- Algorithm selection
- File format handlers

---

## ⚛️ React TypeScript Design Patterns

### 1. **Component Composition** (`reactjs-design-patterns-typescript/01-component-composition.tsx`)
**File Size**: ~450 lines | **Complexity**: Low-Medium

**TypeScript Features Used**:
- React FC type
- Props interfaces
- Discriminated unions for variants
- Type-safe callbacks
- Component composition patterns

**Key Types**:
```typescript
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';
type BadgeColor = 'blue' | 'red' | 'green' | 'yellow';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
}
```

**Components**:
- `Button` - Flexible button component
- `Card` - Card container
- `Badge` - Status badge
- `UserCard` - Composite user card
- `UserList` - User list container
- `FormField` - Form input field
- `UserForm` - Complete user form

**When to Use**:
- Building UI systems
- Scalable component architecture
- Reusable component libraries
- Complex forms
- Data display tables

---

### 2. **Custom Hooks** (`reactjs-design-patterns-typescript/02-custom-hooks.ts`)
**File Size**: ~650 lines | **Complexity**: Medium-High

**TypeScript Features Used**:
- Generic hook types
- Generic type parameters `<T>`
- Type-safe callbacks
- Discriminated unions
- Advanced type inference

**Key Types**:
```typescript
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

interface UseFormReturn<T> extends FormState<T>, FormHelpers<T> {}
```

**Custom Hooks**:
- `useLocalStorage<T>` - Type-safe localStorage
- `useFetch<T>` - Generic data fetching
- `useForm<T>` - Type-safe form management
- `useDebounce<T>` - Generic debounce
- `usePrevious<T>` - Track previous value
- `useAsync<T>` - Generic async operations
- `useClickOutside<T>` - Click outside detection
- `useTimeout` - Timeout management
- `useToggle` - Boolean state toggle
- `useMeasure<T>` - Element measurements
- `useLocalStorageArray<T>` - Array state in localStorage
- `useCounter` - Counter state
- `useWindowSize` - Window dimensions

**When to Use**:
- Extracting component logic
- State management
- Form handling
- Data fetching
- Side effects
- Local storage persistence

---

### 3. **Context API** (`reactjs-design-patterns-typescript/03-context-api.tsx`)
**File Size**: ~550 lines | **Complexity**: Medium

**TypeScript Features Used**:
- Generic context types
- Type-safe context providers
- Custom hooks for context
- Discriminated unions for notifications
- Provider component patterns

**Key Types**:
```typescript
type Theme = 'light' | 'dark';
type PrimaryColor = 'blue' | 'red' | 'green' | 'purple';

interface ThemeContextValue {
  theme: Theme;
  primaryColor: PrimaryColor;
  toggleTheme: () => void;
  changePrimaryColor: (color: PrimaryColor) => void;
  isDark: boolean;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

type NotificationType = 'success' | 'error' | 'warning' | 'info';
```

**Contexts**:
- `ThemeContext` - Theme management
- `AuthContext` - Authentication state
- `NotificationContext` - Toast notifications

**Providers**:
- `ThemeProvider` - Theme provider
- `AuthProvider` - Auth provider
- `NotificationProvider` - Notification provider

**Hooks**:
- `useTheme()` - Theme context hook
- `useAuth()` - Auth context hook
- `useNotification()` - Notification hook

**Components**:
- `ThemeToggleButton` - Theme switcher
- `LoginForm` - Type-safe login form
- `UserProfile` - User profile display
- `NotificationContainer` - Notification display
- `TestButtons` - Demo buttons

**When to Use**:
- Global state management
- Theme switching
- Authentication
- Notifications
- User preferences
- Avoiding prop drilling

---

## 🎯 TypeScript Features Demonstrated

### Advanced TypeScript Concepts

1. **Generics**
   - Generic interfaces and classes
   - Generic type parameters
   - Generic constraints
   - Generic factories

2. **Discriminated Unions**
   - Type-safe union types
   - Pattern matching
   - Exhaustive type checking

3. **Type Safety**
   - Strict null checking
   - Type guards
   - Conditional types
   - Readonly properties

4. **Higher-Order Types**
   - Generic callbacks
   - Type inference
   - Partial types
   - Record types

5. **Utility Types**
   - `Partial<T>` - Optional properties
   - `Record<K, V>` - Key-value mappings
   - `Pick<T, K>` - Select subset of properties
   - `Omit<T, K>` - Exclude properties

6. **Advanced Patterns**
   - Singleton pattern with generics
   - Factory pattern with type inference
   - Observer pattern with typed events
   - Strategy pattern with type-safe selection

---

## 📊 Comparison: JavaScript vs TypeScript

| Aspect | JavaScript | TypeScript |
|--------|-----------|-----------|
| **Type Safety** | Runtime errors | Compile-time detection |
| **IDE Support** | Basic autocomplete | Full IntelliSense |
| **Refactoring** | Risky | Safe with type checking |
| **Documentation** | Comments needed | Types as documentation |
| **Performance** | Native | Compiled overhead |
| **Learning Curve** | Easier | Steeper |
| **Scalability** | Medium | High |
| **Debugging** | Runtime debugging | Compile-time errors |

---

## 🚀 Setup Instructions

### Node.js TypeScript

```bash
# Install TypeScript
npm install --save-dev typescript

# Create tsconfig.json
npx tsc --init

# Compile TypeScript
tsc nodejs-design-patterns-typescript/*.ts

# Run compiled JavaScript
node nodejs-design-patterns-typescript/01-singleton-pattern.js
```

**tsconfig.json Recommended Settings**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true
  }
}
```

### React TypeScript

```bash
# Create React app with TypeScript
npx create-react-app my-app --template typescript

# Copy pattern files
cp reactjs-design-patterns-typescript/*.tsx src/patterns/

# Use in components
import { ComponentCompositionDemo } from './patterns/01-component-composition';
```

---

## 📈 Type Safety Benefits

### Example: Before and After

**Before (JavaScript)**:
```javascript
function pay(amount, strategy) {
  const fee = strategy.getFee(amount); // ❌ Runtime error if getFee doesn't exist
  return strategy.process(amount);
}
```

**After (TypeScript)**:
```typescript
interface PaymentStrategy {
  getFee(amount: number): number;
  process(amount: number): PaymentResult;
}

function pay(amount: number, strategy: PaymentStrategy): PaymentResult {
  const fee = strategy.getFee(amount); // ✅ Compile-time error if method missing
  return strategy.process(amount);
}
```

---

## 🎓 Learning Path

### Beginner
1. Start with `01-singleton-pattern.ts` (Node.js)
2. Learn `02-factory-pattern.ts` (Node.js)
3. Study `01-component-composition.tsx` (React)

### Intermediate
4. Master `03-observer-pattern.ts` (Node.js)
5. Understand `02-custom-hooks.ts` (React)
6. Deep dive `04-strategy-pattern.ts` (Node.js)

### Advanced
7. Combine patterns in real applications
8. Implement advanced TypeScript features
9. Build scalable applications

---

## ✅ Type Safety Checklist

- [ ] Enable `"strict": true` in tsconfig.json
- [ ] Use `interface` for public APIs
- [ ] Use `type` for type aliases and unions
- [ ] Export types alongside implementations
- [ ] Use generics for reusable components
- [ ] Implement discriminated unions for type safety
- [ ] Use utility types for DRY code
- [ ] Document types with JSDoc comments
- [ ] Write type tests for complex types
- [ ] Use `readonly` for immutable data

---

## 🔍 Common TypeScript Pitfalls

### 1. **Any Type Abuse**
```typescript
// ❌ Bad
const data: any = fetchData();

// ✅ Good
const data: UserData = fetchData();
```

### 2. **Not Using Strict Mode**
```typescript
// ❌ Bad tsconfig.json
{ "strict": false }

// ✅ Good
{ "strict": true }
```

### 3. **Over-Generalization**
```typescript
// ❌ Bad - Too generic
function process<T, U, V, W>(a: T, b: U, c: V): W {}

// ✅ Good - Clear purpose
function processUserData(user: User, options: ProcessOptions): ProcessResult {}
```

### 4. **Type Assertion Instead of Narrowing**
```typescript
// ❌ Bad - Unsafe assertion
const value = data as string;

// ✅ Good - Type guard
if (typeof data === 'string') {
  const value: string = data;
}
```

---

## 📚 Additional Resources

### Official Documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Design Patterns in TypeScript](https://refactoring.guru/design-patterns/typescript)

### Key Concepts
1. **Interfaces vs Types** - When to use each
2. **Generics** - Writing reusable code
3. **Discriminated Unions** - Type safety
4. **Utility Types** - DRY type code
5. **Advanced Types** - Conditional types, mapped types

---

## 🤝 Best Practices

1. **Type Everything** - Avoid `any` type
2. **Use Strict Mode** - Enable all type checking
3. **Export Types** - Share type definitions
4. **Document Types** - Use JSDoc comments
5. **Test Types** - Write type-level tests
6. **Keep Types Simple** - Avoid over-complexity
7. **Use Unions** - Instead of enums
8. **Leverage Inference** - Let TypeScript infer types
9. **Generic Constraints** - Restrict generic types
10. **Compose Types** - Build complex types from simple ones

---

## 📞 File Organization

```
project/
├── nodejs-design-patterns-typescript/
│   ├── 01-singleton-pattern.ts
│   ├── 02-factory-pattern.ts
│   ├── 03-observer-pattern.ts
│   └── 04-strategy-pattern.ts
├── reactjs-design-patterns-typescript/
│   ├── 01-component-composition.tsx
│   ├── 02-custom-hooks.ts
│   └── 03-context-api.tsx
├── tsconfig.json
└── TYPESCRIPT-DESIGN-PATTERNS-SUMMARY.md
```

---

## ✨ Highlights

- ✅ **Type-Safe** - Full TypeScript type checking
- ✅ **Production-Ready** - Can be used in real projects
- ✅ **Well-Documented** - Comments and examples
- ✅ **Best Practices** - Following TypeScript standards
- ✅ **Comprehensive** - Multiple patterns with examples
- ✅ **Modern** - ES2020+ features
- ✅ **Reusable** - Copy and adapt to your needs

---

**Last Updated**: 2026-08-28  
**Version**: 1.0  
**TypeScript Version**: 5.0+

