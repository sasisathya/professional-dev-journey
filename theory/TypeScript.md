# TypeScript - Professional Interview Guide

## Table of Contents
1. [TypeScript Fundamentals](#typescript-fundamentals)
2. [Type System](#type-system)
3. [Interfaces & Types](#interfaces--types)
4. [Advanced Types](#advanced-types)
5. [TypeScript 5.x Features](#typescript-5x-features)
6. [Generics](#generics)
7. [Classes & OOP](#classes--oop)
8. [Modules & Namespaces](#modules--namespaces)
9. [Best Practices & Configuration](#best-practices--configuration)
10. [React & TypeScript](#react--typescript)
11. [Production Patterns & Pitfalls](#production-patterns--pitfalls)
12. [Interview Tips](#interview-tips-expanded)

---

## TypeScript Fundamentals

### What is TypeScript?
**TypeScript** is a strongly-typed superset of JavaScript developed by Microsoft. Adds static typing, interfaces, and advanced features. Compiles to plain JavaScript.

**Key features:**
- **Static typing:** Catch errors at compile time
- **Type inference:** Automatic type detection
- **OOP features:** Interfaces, abstract classes, access modifiers
- **Modern JS features:** ES6+ syntax, transpiles to older versions
- **Tooling:** Better IDE support (autocomplete, refactoring)

**Compilation:**
```
TypeScript (.ts) → Compiler (tsc) → JavaScript (.js)
```

**Key takeaway:** Superset of JS. Static typing. Compiles to JS.

---

### TypeScript vs JavaScript
**JavaScript:**
- Dynamic typing
- Runtime errors
- No compile step
- Works everywhere (browsers, Node.js)

**TypeScript:**
- Static typing
- Compile-time errors
- Requires compilation (tsc)
- Compiles to JavaScript

**Relationship:** All valid JavaScript is valid TypeScript (can gradually adopt).

**Key takeaway:** TypeScript = JavaScript + static types. Gradual adoption.

---

### Why Use TypeScript?
**Benefits:**
- **Catch errors early:** Before running code
- **Better refactoring:** Type-safe renames, moves
- **IDE support:** Autocomplete, IntelliSense
- **Self-documenting:** Types serve as documentation
- **Scalability:** Easier to maintain large codebases
- **Team productivity:** Fewer bugs, better collaboration

**Trade-offs:**
- Learning curve
- Build step required
- More verbose (type annotations)

**Key takeaway:** Early error detection. Better tooling. Scales well.

---

## Type System

### Basic Types
**Primitive types:**
```typescript
let isDone: boolean = false;
let age: number = 30;
let name: string = "Alice";
let u: undefined = undefined;
let n: null = null;
```

**Arrays:**
```typescript
let numbers: number[] = [1, 2, 3];
let strings: Array<string> = ["a", "b"];
```

**Tuples (fixed-length, mixed types):**
```typescript
let tuple: [string, number] = ["Alice", 30];
```

**Any (avoid when possible):**
```typescript
let anything: any = 42;
anything = "now a string"; // No error
```

**Unknown (safer than any):**
```typescript
let value: unknown = 42;
// value.toFixed(); // Error: must check type first
if (typeof value === "number") {
  value.toFixed(); // OK
}
```

**Void (no return value):**
```typescript
function log(message: string): void {
  console.log(message);
}
```

**Never (never returns):**
```typescript
function error(message: string): never {
  throw new Error(message);
}
```

**Key takeaway:** any = no checking, unknown = safer, never = never returns.

---

### Type Inference
**Definition:** TypeScript automatically infers types when not explicitly declared.

```typescript
let x = 10; // Inferred as number
let name = "Alice"; // Inferred as string

function add(a: number, b: number) {
  return a + b; // Return type inferred as number
}
```

**Best practice:** Use inference when type is obvious. Explicit for function signatures.

**Key takeaway:** Automatic type detection. Reduces verbosity.

---

### Type Assertions
**Definition:** Tell TypeScript "trust me, I know the type."

**Syntax 1 (as):**
```typescript
let value: unknown = "hello";
let length: number = (value as string).length;
```

**Syntax 2 (angle brackets - not in JSX):**
```typescript
let length: number = (<string>value).length;
```

**Use case:** When you know more than TypeScript (e.g., DOM elements).

```typescript
const input = document.getElementById("myInput") as HTMLInputElement;
input.value = "text"; // OK, knows it's input element
```

**Key takeaway:** Override type checking. Use sparingly.

---

### Union Types
**Definition:** Value can be one of several types.

```typescript
let id: number | string;
id = 123;      // OK
id = "ABC123"; // OK
// id = true;  // Error

function print(value: number | string) {
  if (typeof value === "number") {
    console.log(value.toFixed(2)); // number methods
  } else {
    console.log(value.toUpperCase()); // string methods
  }
}
```

**Key takeaway:** Pipe `|` for "or". Type narrowing with guards.

---

### Literal Types
**Definition:** Exact value as type.

```typescript
let direction: "left" | "right" | "up" | "down";
direction = "left"; // OK
// direction = "forward"; // Error

type Status = "pending" | "success" | "error";
let status: Status = "pending";
```

**Key takeaway:** Specific values as types. Great for constants.

---

### Type Guards
**Definition:** Narrow union types to specific type.

**typeof (primitives):**
```typescript
function print(value: number | string) {
  if (typeof value === "number") {
    // value is number here
  }
}
```

**instanceof (classes):**
```typescript
if (obj instanceof Date) {
  // obj is Date here
}
```

**Custom type guard:**
```typescript
function isString(value: unknown): value is string {
  return typeof value === "string";
}

if (isString(value)) {
  // value is string here
}
```

**Key takeaway:** Narrow types. typeof, instanceof, custom predicates.

---

## Interfaces & Types

### Interfaces
**Definition:** Define structure of objects.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number; // Optional property
  readonly createdAt: Date; // Read-only
}

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  createdAt: new Date()
};

// user.createdAt = new Date(); // Error: readonly
```

**Function signatures in interfaces:**
```typescript
interface MathFunc {
  (a: number, b: number): number;
}

const add: MathFunc = (a, b) => a + b;
```

**Index signatures (dynamic properties):**
```typescript
interface StringMap {
  [key: string]: string;
}

const map: StringMap = {
  name: "Alice",
  city: "NY"
};
```

**Key takeaway:** Object structure. Optional ?, readonly.

---

### Type Aliases
**Definition:** Create custom type names.

```typescript
type ID = number | string;
type Point = { x: number; y: number };
type Callback = (data: string) => void;

let userId: ID = 123;
let point: Point = { x: 10, y: 20 };
```

**Key takeaway:** Alias for any type. Union, primitives, objects.

---

### Interface vs Type
**Similarities:** Both define structure.

**Differences:**
| Feature | Interface | Type |
|---------|-----------|------|
| Extend | `extends` | Intersection `&` |
| Declaration merging | Yes | No |
| Primitives, unions | No | Yes |
| Computed properties | No | Yes |

**Interface extending:**
```typescript
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}
```

**Type intersection:**
```typescript
type Animal = { name: string };
type Dog = Animal & { breed: string };
```

**Declaration merging (interface only):**
```typescript
interface User {
  name: string;
}

interface User {
  age: number;
}

// Merged: User has name and age
```

**Best practice:** Interface for objects (can extend), Type for unions/primitives.

**Key takeaway:** Interface = objects, extendable. Type = flexible, unions.

---

### Extending Interfaces
```typescript
interface Person {
  name: string;
  age: number;
}

interface Employee extends Person {
  employeeId: number;
  department: string;
}

const emp: Employee = {
  name: "Alice",
  age: 30,
  employeeId: 123,
  department: "Engineering"
};
```

**Multiple inheritance:**
```typescript
interface A { a: number; }
interface B { b: number; }
interface C extends A, B { c: number; }
```

**Key takeaway:** Extend to add properties. Multiple inheritance supported.

---

## Advanced Types

### Intersection Types
**Definition:** Combine multiple types into one.

```typescript
type Person = { name: string };
type Employee = { employeeId: number };

type EmployeePerson = Person & Employee;

const emp: EmployeePerson = {
  name: "Alice",
  employeeId: 123
};
```

**Key takeaway:** `&` combines types. Must have all properties.

---

### Mapped Types
**Definition:** Transform properties of existing type.

**Readonly:**
```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type User = { name: string; age: number };
type ReadonlyUser = Readonly<User>;
// { readonly name: string; readonly age: number }
```

**Partial (all properties optional):**
```typescript
type Partial<T> = {
  [P in keyof T]?: T[P];
};

type User = { name: string; age: number };
type PartialUser = Partial<User>;
// { name?: string; age?: number }
```

**Pick (select properties):**
```typescript
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type User = { name: string; age: number; email: string };
type UserPreview = Pick<User, "name" | "email">;
// { name: string; email: string }
```

**Omit (exclude properties):**
```typescript
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type User = { name: string; age: number; email: string };
type UserWithoutEmail = Omit<User, "email">;
// { name: string; age: number }
```

**Key takeaway:** Transform types. Readonly, Partial, Pick, Omit.

---

### Utility Types
**Built-in utility types:**

**Required (opposite of Partial):**
```typescript
type User = { name?: string; age?: number };
type RequiredUser = Required<User>;
// { name: string; age: number }
```

**Record (key-value pairs):**
```typescript
type Record<K extends string | number | symbol, T> = {
  [P in K]: T;
};

type UserRoles = Record<string, string>;
const roles: UserRoles = {
  admin: "Administrator",
  user: "Regular User"
};
```

**Exclude (from union):**
```typescript
type T = Exclude<"a" | "b" | "c", "a">;
// "b" | "c"
```

**Extract (from union):**
```typescript
type T = Extract<"a" | "b" | "c", "a" | "f">;
// "a"
```

**NonNullable:**
```typescript
type T = NonNullable<string | number | null | undefined>;
// string | number
```

**ReturnType (function return type):**
```typescript
function getUser() {
  return { name: "Alice", age: 30 };
}

type User = ReturnType<typeof getUser>;
// { name: string; age: number }
```

**Key takeaway:** Built-in transformations. Readonly, Partial, Pick, Omit, Record.

---

### Conditional Types
**Definition:** Types that depend on conditions.

```typescript
type IsString<T> = T extends string ? "yes" : "no";

type A = IsString<string>; // "yes"
type B = IsString<number>; // "no"
```

**Real-world example:**
```typescript
type NonNullable<T> = T extends null | undefined ? never : T;

type A = NonNullable<string | null>; // string
```

**Key takeaway:** T extends U ? X : Y. Powerful for type transformations.

---

### Template Literal Types
**Definition:** Create types from string literals.

```typescript
type Color = "red" | "green" | "blue";
type Quantity = "one" | "two";

type ColorQuantity = `${Quantity}-${Color}`;
// "one-red" | "one-green" | "one-blue" | "two-red" | ...
```

**Use case (event names):**
```typescript
type EventName = "click" | "scroll";
type EventHandler = `on${Capitalize<EventName>}`;
// "onClick" | "onScroll"
```

**Key takeaway:** String interpolation in types. Combine literals.

---

### Discriminated Unions
**Definition:** Union types where each variant has a common literal property to distinguish them.

**Pattern (very common in React):**
```typescript
type LoadingState = {
  status: 'loading';
  progress: number;
};

type SuccessState = {
  status: 'success';
  data: string[];
};

type ErrorState = {
  status: 'error';
  error: Error;
};

type AsyncState = LoadingState | SuccessState | ErrorState;

// Type narrowing via discriminator
function handleState(state: AsyncState) {
  if (state.status === 'loading') {
    console.log(state.progress); // OK, progress is number
  } else if (state.status === 'success') {
    console.log(state.data); // OK, data is string[]
  } else {
    console.log(state.error); // OK, error is Error
  }
}
```

**Real React example (form submission):**
```typescript
type FormState = 
  | { type: 'idle' }
  | { type: 'submitting' }
  | { type: 'success'; data: User }
  | { type: 'error'; message: string };

function FormStatus({ state }: { state: FormState }) {
  switch (state.type) {
    case 'idle':
      return <form>...</form>;
    case 'submitting':
      return <p>Saving...</p>;
    case 'success':
      return <p>Saved! User: {state.data.name}</p>;
    case 'error':
      return <p>Error: {state.message}</p>;
  }
}
```

**Why it's powerful:** TypeScript ensures you handle all cases. Change discriminator value = compile error everywhere.

**Key takeaway:** Discriminated unions = exhaustive type checking. Perfect for state machines.

---

### Type Predicates (Type Guards)
**Definition:** Functions that return `value is Type` to narrow union types.

```typescript
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

// Usage
const value: unknown = "hello";
if (isString(value)) {
  value.toUpperCase(); // OK, value is string
}
```

**Real example (API response):**
```typescript
interface SuccessResponse {
  type: 'success';
  data: { name: string };
}

interface ErrorResponse {
  type: 'error';
  error: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;

// Type predicate
function isSuccess(response: ApiResponse): response is SuccessResponse {
  return response.type === 'success';
}

// Usage
function handleResponse(response: ApiResponse) {
  if (isSuccess(response)) {
    console.log(response.data.name); // OK, data is available
  } else {
    console.log(response.error); // OK, error is available
  }
}
```

**React example (React.Children):**
```typescript
function isValidElement(element: unknown): element is React.ReactElement {
  return React.isValidElement(element);
}

function renderChildren(children: unknown) {
  if (isValidElement(children)) {
    return children;
  }
  return null;
}
```

**Key takeaway:** Type predicates narrow unions reliably. Better than typeof checks scattered everywhere.

---

### Assertion Signatures
**Definition:** Functions that assert a type and throw if false.

```typescript
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error(`Expected string, got ${typeof value}`);
  }
}

// Usage
function process(value: unknown) {
  assertIsString(value);
  // value is now string
  console.log(value.toUpperCase());
}
```

**Real example (environment variables):**
```typescript
function assertEnv(key: string): asserts process.env[key] is string {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} is required`);
  }
}

// Usage
assertEnv('API_KEY');
const apiKey = process.env.API_KEY; // TypeScript knows it's string
```

**Key takeaway:** Assertion signatures for validation. Throw if assertion fails.

---

### const Type Parameters
**Definition:** (TypeScript 5.0+) Preserve literal types through generics.

```typescript
// Before TS 5.0
function createSet<T>(value: T): Set<T> {
  return new Set([value]);
}

const numSet = createSet(42);
// numSet: Set<42> ← loses literal type

// After TS 5.0
function createSet<const T>(value: T): Set<T> {
  return new Set([value]);
}

const numSet = createSet(42);
// numSet: Set<42> ← preserves literal type!
```

**Real example (type-safe config):**
```typescript
function createConfig<const T extends Record<string, any>>(config: T): T {
  return config;
}

const config = createConfig({
  mode: 'production', // Literal type preserved
  timeout: 5000        // Literal type preserved
} as const);

// Accessing properties is type-safe
config.mode; // type: 'production' (not string)
```

**Why it matters:** Preserves literal types without `as const`. Cleaner APIs.

**Key takeaway:** `const` type parameters preserve literal types. (TS 5.0+)

---

### satisfies Operator
**Definition:** (TypeScript 4.9+) Validate type without changing inferred type.

```typescript
// Without satisfies
const config1: AppConfig = {
  debug: true,
  port: 3000
};
// config1: AppConfig

// With satisfies
const config2 = {
  debug: true,
  port: 3000
} satisfies AppConfig;
// config2: { debug: boolean; port: number } (more specific)
```

**Real example (color literals):**
```typescript
type Color = 'red' | 'green' | 'blue';

// Without satisfies - type is Record<string, string>
const colors = {
  primary: 'red',
  secondary: 'blue'
};
// colors.primary: string (not 'red')

// With satisfies - type preserves literals
const colors2 = {
  primary: 'red',
  secondary: 'blue'
} satisfies Record<string, Color>;
// colors2.primary: 'red' (literal type!)
```

**React props example:**
```typescript
type ButtonProps = {
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
};

const buttonDefaults = {
  variant: 'primary',
  size: 'md'
} satisfies ButtonProps;
// buttonDefaults.variant: 'primary' (not string)
```

**Key takeaway:** `satisfies` validates without widening types. Perfect for defaults.

---

### as const Assertions
**Definition:** Assert value as readonly literal type.

```typescript
// Without as const
const colors = ['red', 'green', 'blue'];
// type: string[]

// With as const
const colors2 = ['red', 'green', 'blue'] as const;
// type: readonly ['red', 'green', 'blue']
```

**When to use:**
```typescript
// API routes
const ROUTES = ['/api/users', '/api/posts', '/api/comments'] as const;
type Route = typeof ROUTES[number]; // '/api/users' | '/api/posts' | '/api/comments'

// Form fields
const FORM_FIELDS = {
  email: 'email',
  password: 'password',
  username: 'username'
} as const;

type FieldName = keyof typeof FORM_FIELDS; // 'email' | 'password' | 'username'

// Component variants
const Button = ({ variant }: { variant: 'primary' | 'secondary' }) => {};

// Instead of hardcoding union, use object keys
const VARIANTS = {
  primary: { bg: 'blue' },
  secondary: { bg: 'gray' }
} as const;

type Variant = keyof typeof VARIANTS;
const Button2 = ({ variant }: { variant: Variant }) => {};
```

**Key takeaway:** `as const` for literal types. Extract types from values.

---

## Generics

### Generic Functions
**Definition:** Write reusable code that works with multiple types.

```typescript
function identity<T>(arg: T): T {
  return arg;
}

let output1 = identity<string>("hello"); // string
let output2 = identity<number>(42); // number
let output3 = identity("hello"); // Type inferred
```

**Generic with constraints:**
```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

let obj = { a: 1, b: 2, c: 3 };
let value = getProperty(obj, "a"); // OK
// getProperty(obj, "d"); // Error: "d" not in obj
```

**Key takeaway:** `<T>` for type parameters. Reusable, type-safe.

---

### Generic Interfaces
```typescript
interface Box<T> {
  value: T;
}

let stringBox: Box<string> = { value: "hello" };
let numberBox: Box<number> = { value: 42 };
```

**Generic constraints:**
```typescript
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): void {
  console.log(arg.length);
}

logLength("hello"); // OK, string has length
logLength([1, 2, 3]); // OK, array has length
// logLength(42); // Error, number doesn't have length
```

**Key takeaway:** Interfaces with type parameters. Constraints with extends.

---

### Generic Classes
```typescript
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}

let myNumber = new GenericNumber<number>();
myNumber.zeroValue = 0;
myNumber.add = (x, y) => x + y;

let myString = new GenericNumber<string>();
myString.zeroValue = "";
myString.add = (x, y) => x + y;
```

**Key takeaway:** Classes with type parameters. Multiple instances with different types.

---

### Generic Constraints
**Extend to constrain types:**
```typescript
function merge<T extends object, U extends object>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

let result = merge({ name: "Alice" }, { age: 30 });
// result: { name: string; age: number }

// merge({ name: "Alice" }, 42); // Error: 42 not object
```

**keyof constraint:**
```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

**Key takeaway:** `extends` for constraints. keyof for object keys.

---

## Classes & OOP

### Classes
**Basic class:**
```typescript
class Person {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  greet(): string {
    return `Hello, I'm ${this.name}`;
  }
}

const person = new Person("Alice", 30);
```

**Key takeaway:** Class = blueprint. Constructor, methods, properties.

---

### Access Modifiers
**public (default):** Accessible everywhere.
**private:** Only within class.
**protected:** Within class and subclasses.

```typescript
class Person {
  public name: string;
  private ssn: string;
  protected age: number;

  constructor(name: string, ssn: string, age: number) {
    this.name = name;
    this.ssn = ssn;
    this.age = age;
  }

  getSSN(): string {
    return this.ssn; // OK, inside class
  }
}

const person = new Person("Alice", "123-45-6789", 30);
console.log(person.name); // OK, public
// console.log(person.ssn); // Error, private
```

**Shorthand (parameter properties):**
```typescript
class Person {
  constructor(
    public name: string,
    private ssn: string,
    protected age: number
  ) {}
}
```

**Key takeaway:** public/private/protected. Shorthand in constructor.

---

### Inheritance
```typescript
class Animal {
  constructor(public name: string) {}

  move(distance: number): void {
    console.log(`${this.name} moved ${distance}m`);
  }
}

class Dog extends Animal {
  constructor(name: string, public breed: string) {
    super(name); // Call parent constructor
  }

  bark(): void {
    console.log("Woof!");
  }
}

const dog = new Dog("Buddy", "Golden Retriever");
dog.move(10);
dog.bark();
```

**Key takeaway:** `extends` for inheritance. `super()` calls parent.

---

### Abstract Classes
**Definition:** Cannot instantiate. Must be extended.

```typescript
abstract class Shape {
  abstract getArea(): number; // Must implement in subclass

  display(): void {
    console.log(`Area: ${this.getArea()}`);
  }
}

class Circle extends Shape {
  constructor(public radius: number) {
    super();
  }

  getArea(): number {
    return Math.PI * this.radius ** 2;
  }
}

// const shape = new Shape(); // Error, abstract
const circle = new Circle(5);
circle.display();
```

**Key takeaway:** `abstract` = base class. Must implement abstract methods.

---

### Static Members
**Definition:** Belong to class, not instances.

```typescript
class MathUtil {
  static PI: number = 3.14159;

  static circleArea(radius: number): number {
    return this.PI * radius ** 2;
  }
}

console.log(MathUtil.PI); // Access via class
console.log(MathUtil.circleArea(5));
```

**Key takeaway:** `static` = class-level. Access via class name.

---

### Getters and Setters
```typescript
class Person {
  private _age: number = 0;

  get age(): number {
    return this._age;
  }

  set age(value: number) {
    if (value < 0) throw new Error("Age cannot be negative");
    this._age = value;
  }
}

const person = new Person();
person.age = 30; // Calls setter
console.log(person.age); // Calls getter
```

**Key takeaway:** Getters/setters for controlled access. Validation.

---

## Modules & Namespaces

### ES6 Modules
**Export:**
```typescript
// math.ts
export function add(a: number, b: number): number {
  return a + b;
}

export const PI = 3.14159;

export default class Calculator {
  // ...
}
```

**Import:**
```typescript
// app.ts
import { add, PI } from './math';
import Calculator from './math';

console.log(add(2, 3));
console.log(PI);
const calc = new Calculator();
```

**Key takeaway:** `export`/`import` for modules. Named and default exports.

---

### Namespaces (older approach)
**Definition:** Organize code under namespace. Avoid global scope pollution.

```typescript
namespace Validation {
  export interface StringValidator {
    isValid(s: string): boolean;
  }

  export class EmailValidator implements StringValidator {
    isValid(s: string): boolean {
      return s.includes("@");
    }
  }
}

const validator = new Validation.EmailValidator();
```

**Note:** Modules preferred over namespaces in modern TypeScript.

**Key takeaway:** Namespaces = old approach. Use ES6 modules.

---

## Best Practices & Configuration

### tsconfig.json
**Definition:** TypeScript compiler configuration.

**Common options:**
```json
{
  "compilerOptions": {
    "target": "ES6", // JS version to compile to
    "module": "commonjs", // Module system
    "lib": ["ES6", "DOM"], // Type definitions to include
    "outDir": "./dist", // Output directory
    "rootDir": "./src", // Input directory
    "strict": true, // Enable all strict checks
    "esModuleInterop": true, // CommonJS/ES6 interop
    "skipLibCheck": true, // Skip .d.ts file checks
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true, // Import JSON files
    "declaration": true, // Generate .d.ts files
    "sourceMap": true // Generate source maps
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}
```

**Strict mode options:**
- `noImplicitAny`: No implicit `any` types
- `strictNullChecks`: `null`/`undefined` not assignable to other types
- `strictFunctionTypes`: Strict function type checking
- `strictPropertyInitialization`: Class properties must be initialized

**Key takeaway:** tsconfig.json = compiler config. Enable strict mode.

---

### Type Declaration Files (.d.ts)
**Definition:** Type definitions for JavaScript libraries.

**Install types:**
```bash
npm install --save-dev @types/node
npm install --save-dev @types/express
npm install --save-dev @types/react
```

**Custom type declaration:**
```typescript
// global.d.ts
declare module "my-library" {
  export function doSomething(value: string): number;
}

// Now can import
import { doSomething } from "my-library";
```

**Key takeaway:** .d.ts = type definitions. @types for JS libraries.

---

### Best Practices
**1. Enable strict mode:**
```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

**2. Avoid `any`:**
```typescript
// Bad
function process(data: any) { }

// Good
function process(data: unknown) {
  if (typeof data === "string") { /* ... */ }
}
```

**3. Use interfaces for objects:**
```typescript
interface User {
  id: number;
  name: string;
}
```

**4. Prefer `const` over `let`:**
```typescript
const name = "Alice"; // Inferred as literal type "Alice"
let name2 = "Alice"; // Inferred as string
```

**5. Use enums for constants:**
```typescript
enum Status {
  Pending,
  Approved,
  Rejected
}
```

**6. Avoid non-null assertion (!):**
```typescript
// Avoid
const value = obj.value!;

// Better
if (obj.value !== undefined) {
  const value = obj.value;
}
```

**7. Use readonly for immutability:**
```typescript
interface Config {
  readonly apiUrl: string;
}
```

**8. Type function parameters and return:**
```typescript
function add(a: number, b: number): number {
  return a + b;
}
```

**Key takeaway:** Strict mode, avoid any, type everything, use readonly.

---

### Common Pitfalls
**1. Implicit any:**
```typescript
// tsconfig: "noImplicitAny": true
function process(data) { } // Error: implicit any
```

**2. Null/undefined errors:**
```typescript
// tsconfig: "strictNullChecks": true
let name: string = null; // Error
let name2: string | null = null; // OK
```

**3. Type assertions abuse:**
```typescript
const input = document.getElementById("input") as HTMLInputElement;
// Use only when you're certain
```

**4. Forgetting readonly:**
```typescript
interface User {
  readonly id: number; // Prevent reassignment
  name: string;
}
```

**Key takeaway:** Enable strict checks. Avoid any. Handle null/undefined.

---

### TypeScript with React

#### Functional Components

**Basic component (prefer over FC):**
```typescript
interface GreetingProps {
  name: string;
  age: number;
  onGreet?: (name: string) => void; // Optional callback
}

export function Greeting({ name, age, onGreet }: GreetingProps) {
  return (
    <div onClick={() => onGreet?.(name)}>
      Hello {name}, age {age}
    </div>
  );
}
```

**Why not FC:**
- `FC` (FunctionComponent) is outdated
- Doesn't support generics well
- Implicit children typing
- Modern: Just use function with Props interface

**Extending HTML attributes (button that extends native button):**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className,
  ...rest 
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      {...rest}
    />
  );
}

// Usage: supports all native button props + custom props
<Button variant="primary" onClick={() => {}} disabled />
```

**Generic components:**
```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
}

export function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// Usage - type inferred from items
<List
  items={[{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]}
  renderItem={user => user.name}
  keyExtractor={user => user.id}
/>
```

---

#### Hooks with TypeScript

**useState with type inference:**
```typescript
// Inferred from initial value
const [count, setCount] = useState(0); // count: number

// Explicit type (useful for complex state)
const [user, setUser] = useState<User | null>(null);

// Union state (discriminated union pattern)
type State = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: string }
  | { status: 'error'; error: string };

const [state, setState] = useState<State>({ status: 'idle' });
```

**useCallback with proper typing:**
```typescript
interface User {
  id: number;
  name: string;
}

interface ListProps {
  users: User[];
  onSelect: (user: User) => void; // Callback type
}

export function UserList({ users, onSelect }: ListProps) {
  // Callback is properly typed
  const handleClick = useCallback((user: User) => {
    onSelect(user);
  }, [onSelect]);

  return (
    <ul>
      {users.map(user => (
        <li key={user.id} onClick={() => handleClick(user)}>
          {user.name}
        </li>
      ))}
    </ul>
  );
}
```

**useEffect with proper dependencies:**
```typescript
// Good: Dependencies include all used values
useEffect(() => {
  fetch(`/api/user/${userId}`)
    .then(r => r.json())
    .then(setUser);
}, [userId]); // userId is included!

// Better: Use useFetch or React Query instead
const { data: user } = useQuery(['user', userId], () =>
  fetch(`/api/user/${userId}`).then(r => r.json())
);
```

**useRef with proper typing:**
```typescript
// Ref to DOM element
const inputRef = useRef<HTMLInputElement>(null);

const focus = () => {
  inputRef.current?.focus(); // Optional chaining, safe
};

return <input ref={inputRef} />;

// Ref to mutable value (not DOM)
const timerRef = useRef<NodeJS.Timeout | null>(null);

const startTimer = () => {
  timerRef.current = setTimeout(() => {
    // ...
  }, 1000);
};

const clearTimer = () => {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
  }
};
```

**useReducer with discriminated unions:**
```typescript
type Action =
  | { type: 'INCREMENT'; payload: number }
  | { type: 'DECREMENT'; payload: number }
  | { type: 'RESET' };

interface State {
  count: number;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + action.payload };
    case 'DECREMENT':
      return { count: state.count - action.payload };
    case 'RESET':
      return { count: 0 };
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0 });

// Type-safe dispatch
dispatch({ type: 'INCREMENT', payload: 5 }); // OK
// dispatch({ type: 'INCREMENT', payload: 'five' }); // Error!
```

**Custom hooks with TypeScript:**
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
      .then(r => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}

// Usage - type inferred
const { data: user } = useFetch<User>('/api/user');
```

---

#### Event Handlers

**Common event types:**
```typescript
// Click event
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  console.log(e.currentTarget);
};

// Change event
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.currentTarget.value;
};

// Form event
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
};

// Generic event handler type
type EventHandler<T extends HTMLElement> = React.MouseEventHandler<T>;
const buttonHandler: EventHandler<HTMLButtonElement> = (e) => {};
```

---

#### Context with TypeScript

**Type-safe context:**
```typescript
interface Theme {
  color: string;
  fontSize: number;
}

// Create context with default undefined
const ThemeContext = React.createContext<Theme | undefined>(undefined);

// Provider component
interface ThemeProviderProps {
  children: React.ReactNode;
  theme: Theme;
}

export function ThemeProvider({ children, theme }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use context safely
export function useTheme(): Theme {
  const theme = React.useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return theme;
}

// Usage
function MyComponent() {
  const theme = useTheme(); // Guaranteed to be Theme, never undefined
}
```

---

#### Server Components with TypeScript (React 19)

```typescript
// Server Component (default in Next.js 13+)
interface PostProps {
  id: string;
}

export default async function Post({ id }: PostProps) {
  const post = await db.posts.findById(id); // Database access safe here
  return <article>{post.content}</article>;
}

// Client Component with Server Action
'use client'

interface DeleteButtonProps {
  postId: string;
  onDelete: (id: string) => Promise<void>;
}

export function DeleteButton({ postId, onDelete }: DeleteButtonProps) {
  const handleDelete = async () => {
    await onDelete(postId);
  };
  return <button onClick={handleDelete}>Delete</button>;
}

// Server Action
'use server'

export async function deletePost(id: string): Promise<void> {
  await db.posts.delete(id);
  revalidatePath('/posts');
}
```

---

#### Component Prop Patterns

**Discriminated component variant:**
```typescript
type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

type ButtonProps = BaseButtonProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ variant = 'primary', size = 'md', ...props }: ButtonProps) {
  return (
    <button className={`btn btn-${variant} btn-${size}`} {...props} />
  );
}
```

**Polymorphic component (render as different element):**
```typescript
type PolymorphicProps<T extends React.ElementType> = {
  as?: T;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

export function Box<T extends React.ElementType = 'div'>({
  as: Component = 'div',
  ...props
}: PolymorphicProps<T>) {
  return <Component {...props} />;
}

// Usage
<Box as="section" className="container">Content</Box>
<Box as="article">Article content</Box>
```

**Children prop typing:**
```typescript
// Accept any children
interface WrapperProps {
  children: React.ReactNode;
}

// Only accept specific components
interface TabsProps {
  children: React.ReactElement<TabProps>[];
}

// Accept render function
interface RenderProps<T> {
  children: (value: T) => React.ReactNode;
}

export function DataRenderer<T>({ children }: RenderProps<T>) {
  const data = fetchData<T>();
  return <>{children(data)}</>;
}
```

**Key takeaway:** Props interface. Proper hook typing. Context with custom hooks. Discriminated unions for variants.

---

### TypeScript with Node.js
**Setup:**
```bash
npm install --save-dev typescript @types/node
npx tsc --init
```

**Express example:**
```typescript
import express, { Request, Response } from 'express';

const app = express();

app.get('/users/:id', (req: Request, res: Response) => {
  const userId = req.params.id;
  res.json({ id: userId });
});

app.listen(3000);
```

**Key takeaway:** Install @types/node. Type req/res.

---

## Production Patterns & Pitfalls

### Type-Safe API Calls

**Type-safe fetch wrapper:**
```typescript
interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
}

async function api<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(endpoint, options);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  const json: ApiResponse<T> = await response.json();
  if (json.status === 'error') {
    throw new Error(json.error);
  }
  return json.data!; // Guaranteed due to discriminated union
}

// Usage
const user = await api<User>('/api/user');
```

**Type-safe form handling:**
```typescript
interface LoginForm {
  email: string;
  password: string;
}

export function LoginForm() {
  const [errors, setErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    // Field-level validation
    const newErrors: typeof errors = {};
    if (!email.includes('@')) newErrors.email = 'Invalid email';
    if (password.length < 8) newErrors.password = 'Too short';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit
    const result = await api<{ token: string }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" />
      {errors.email && <p>{errors.email}</p>}
      
      <input name="password" type="password" />
      {errors.password && <p>{errors.password}</p>}
      
      <button type="submit">Login</button>
    </form>
  );
}
```

---

### Common TypeScript + React Pitfalls

**1. Incorrect useState typing:**
```typescript
// ❌ Wrong: Initial value is undefined, type is number | undefined
const [count, setCount] = useState(0 || undefined);

// ✅ Correct: Type is number
const [count, setCount] = useState<number>(0);

// ❌ Wrong: Union without discriminator
const [data, setData] = useState<string | null>(null);
// Later: if (data) { /* is it string or null? */ }

// ✅ Correct: Discriminated state
type DataState = 
  | { status: 'idle'; data: null }
  | { status: 'loading'; data: null }
  | { status: 'success'; data: string }
  | { status: 'error'; error: string };
```

**2. Missing dependency types in useEffect:**
```typescript
// ❌ Wrong: userId might be undefined
const [userId, setUserId] = useState<number>();
useEffect(() => {
  if (!userId) return;
  fetch(`/api/user/${userId}`); // userId might still be undefined to TypeScript
}, [userId]);

// ✅ Correct: Type guard in effect
const [userId, setUserId] = useState<number | null>(null);
useEffect(() => {
  if (userId === null) return; // Now TypeScript knows userId is number
  fetch(`/api/user/${userId}`);
}, [userId]);
```

**3. Event handler typing errors:**
```typescript
// ❌ Wrong: Any type, loses type safety
const handleChange = (e: any) => {
  const value = e.target.value;
};

// ✓ Correct: Specific event type
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.currentTarget.value; // Type is string
};

// ❌ Wrong: e.target might be any element
const handleChange = (e: React.ChangeEvent<HTMLElement>) => {
  // e.currentTarget.value // Error: HTMLElement doesn't have value
};
```

**4. Context consumption without provider check:**
```typescript
// ❌ Wrong: Context could be undefined
const ThemeContext = React.createContext<Theme | undefined>(undefined);

function useTheme() {
  const theme = useContext(ThemeContext); // theme: Theme | undefined
  return theme; // Caller must check for undefined
}

// ✅ Correct: Guarantee non-null
function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be inside ThemeProvider');
  }
  return theme;
}
```

**5. Generic component type inference failure:**
```typescript
// ❌ Wrong: Type not inferred from initial data
function Table<T>({ data }: { data: T[] }) {
  // T is unknown, can't access properties
}

const table = <Table data={[{ name: 'Alice' }]} />;
// Type parameter not inferred

// ✅ Correct: Help type inference
function Table<T extends Record<string, any>>({ data }: { data: T[] }) {
  // T extends Record ensures properties exist
}

// Or explicit:
<Table<User> data={users} />
```

**6. Assertion abuse instead of type narrowing:**
```typescript
// ❌ Wrong: Using ! everywhere
const value = (response.data as SomeType)!.property!.field!;

// ✓ Better: Type guards
function isSomeType(value: unknown): value is SomeType {
  return value !== null && typeof value === 'object' && 'property' in value;
}

if (isSomeType(response.data)) {
  const value = response.data.property.field; // No ! needed
}
```

**7. Over-typing simple values:**
```typescript
// ❌ Wrong: Unnecessary explicit type
const user: User = { name: 'Alice', age: 30 };

// ✓ Better: Let inference work
const user = { name: 'Alice', age: 30 } as const; // If you need literal types

// ✓ Or explicit only when needed
const users: User[] = []; // Array needs type, elements inferred from additions
```

---

### Type-Safe Patterns

**Exhaustive switch statements:**
```typescript
type Status = 'pending' | 'success' | 'error';

function handleStatus(status: Status): string {
  switch (status) {
    case 'pending':
      return 'Loading...';
    case 'success':
      return 'Done!';
    case 'error':
      return 'Failed!';
    // If you add new Status value but forget case here: TypeScript error!
  }
}

// Add a case for impossible to reach to catch errors
function handleStatus2(status: Status): string {
  switch (status) {
    case 'pending':
      return 'Loading...';
    case 'success':
      return 'Done!';
    // Missing case 'error'
    default:
      const _exhaustive: never = status; // Type error: 'error' not handled!
      return _exhaustive;
  }
}
```

**Object key iteration without errors:**
```typescript
// ❌ Wrong: Key might not exist
const user = { name: 'Alice', age: 30 };
const key = 'unknownKey';
console.log(user[key]); // Type error (good!)

// ✓ Correct: Use keyof
function getProperty<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  key: K
): T[K] {
  return obj[key];
}

getProperty(user, 'name'); // OK
// getProperty(user, 'unknownKey'); // Type error!
```

**Array.map type preservation:**
```typescript
const users = [{ id: 1, name: 'Alice' }];

// ❌ Wrong: Type lost
const ids = users.map(u => u.id); // Type: any[]

// ✓ Correct: Return type explicit
const ids = users.map<number>(u => u.id); // Type: number[]

// Or type the array
const ids: number[] = users.map(u => u.id);
```

---

### Best Practices Summary

**1. Enable strict mode (always):**
```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

**2. Avoid `any` - use `unknown` instead:**
```typescript
// ❌ Bad
function process(data: any) { }

// ✓ Good
function process(data: unknown) {
  if (typeof data === 'string') {
    // use data as string
  }
}
```

**3. Use discriminated unions for complex state:**
```typescript
// ❌ Confusing
type State = { data?: T; loading?: boolean; error?: string };

// ✓ Clear
type State = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };
```

**4. Type your imports:**
```typescript
// ❌ Ambiguous
const User = require('./user');

// ✓ Clear
import type { User } from './user'; // Type-only import
import { getUser } from './user'; // Runtime import
```

**5. Use `satisfies` for validation without widening:**
```typescript
// ✅ Validates AND preserves literal types
const config = {
  mode: 'production',
  timeout: 5000
} satisfies AppConfig;
// config.mode: 'production' (not string)
```

**Key takeaway:** Strict mode, discriminated unions, type guards, avoid assertions.

---

## Interview Tips (Expanded)

### How to Answer TypeScript Questions

**The formula:**
1. **Direct answer** (1 sentence)
2. **Why it matters** (production benefit)
3. **When to use** (tradeoffs)
4. **Example** (code)
5. **Production wisdom** (10+ years insight)

**Example (bad vs good):**

**Bad:** "Generics let you write reusable code. You use `<T>` for type parameters."
- No depth, no context

**Good:** "Generics are functions that work with multiple types. In React, I use them for custom hooks that fetch different data types.

Why it matters? Type safety across reuse. A single `useFetch<T>` hook handles `User`, `Post`, `Comment` without duplicating code.

Real pattern: I use generics with constraints (`extends keyof T`) to ensure type safety when accessing object properties. Prevents 'undefined property' errors at compile time.

Common gotcha: Type inference fails with complex scenarios. Solution: explicitly pass type parameter `useFetch<User>()` when inference doesn't work.

Production lesson: Over-generalizing with generics creates complex types that hurt readability. Balance reuse vs clarity."

---

### Interview Questions You'll Get

**"What's the difference between `type` and `interface`?"**
- Interface: objects, extendable, declaration merging
- Type: unions, primitives, computed properties, literals
- Use interface for object shapes, type for unions

**"What's a discriminated union? Why is it useful?"**
- Union where each variant has literal property to distinguish
- Instead of optional fields (partial State), force complete variant
- TypeScript forces exhaustive handling → fewer bugs
- Show React form state example

**"How do you type a React component prop that extends HTML button?"**
- Use `React.ButtonHTMLAttributes<HTMLButtonElement>`
- Spread `...rest` for native props
- Combine with custom props using intersection

**"What's `satisfies` operator and why would you use it?"**
- Validates type without widening
- Preserves literal types vs losing to string
- Example: config defaults without losing specificity

**"How do you handle unknown API response types?"**
- Use type guards / type predicates
- Discriminated unions for success/error
- Never cast with `as` without narrowing
- Custom type predicate better than `as`

**"What's a discriminated union? Show a React example."**
- Show form submission state (idle | loading | success | error)
- Explain exhaustive type checking in switch
- Explain TypeScript forces handling all cases

---

### Red Flags Interviewers Watch For

**What NOT to say:**
1. "I just use `any` when stuck" → No type safety
2. "Generics are too complicated" → Avoidance mindset
3. "I never use type guards" → Missing type safety opportunities
4. "Strict mode breaks my code" → Avoiding problems, not solving
5. "I don't worry about TypeScript" → In 2026, expected
6. "Interfaces and types are the same" → Misunderstanding
7. "Type assertions are fine everywhere" → Defeating purpose of TypeScript
8. "React.FC is the standard" → Outdated practice

**What shows expertise:**
- "TypeScript caught a bug before it reached production"
- "I used discriminated unions to model state machine"
- "Strict mode initially broke things, but revealed real bugs"
- "I created a type-safe API wrapper"
- "Type inference failed, so I explicitly passed generic type"
- "I use type predicates instead of assertions"

---

### TypeScript in Production

**Common production issues:**
1. **Over-typing:** Every variable has explicit type = verbose, unreadable
2. **Under-typing:** Avoid `any` like plague. Use `unknown` + type guard
3. **Generic abuse:** Simple code doesn't need generics
4. **Assertion overuse:** Sign of bad type design
5. **Strict mode avoidance:** Lazy, leads to bugs

**Real wisdom:**
- TypeScript is best when it feels invisible (inference does heavy lifting)
- If you're fighting the type system constantly, design is wrong
- Discriminated unions > optional fields (force completeness)
- Type guards > assertions (safer, intentional)
- Custom hooks > utility types (reusable, clear)

---

**Updated:** 2026-08-22 | **Level:** Intermediate-Advanced | **Format:** Production-ready, Interview-ready
