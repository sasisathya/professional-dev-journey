# TypeScript - Professional Interview Guide

## Table of Contents
1. [TypeScript Fundamentals](#typescript-fundamentals)
2. [Type System](#type-system)
3. [Interfaces & Types](#interfaces--types)
4. [Advanced Types](#advanced-types)
5. [Generics](#generics)
6. [Classes & OOP](#classes--oop)
7. [Modules & Namespaces](#modules--namespaces)
8. [Best Practices & Configuration](#best-practices--configuration)

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
**Functional component:**
```typescript
import React, { FC } from 'react';

interface Props {
  name: string;
  age: number;
}

const Greeting: FC<Props> = ({ name, age }) => {
  return <div>Hello {name}, age {age}</div>;
};
```

**Hooks:**
```typescript
const [count, setCount] = useState<number>(0);

useEffect(() => {
  // ...
}, [count]);
```

**Event handlers:**
```typescript
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e.currentTarget);
};
```

**Key takeaway:** Props interface. Typed hooks. Event types.

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

## Interview Tips

1. **Explain benefits:** "TypeScript catches errors at compile time, improving code quality and reducing runtime bugs."
2. **Discuss strictness:** "Enable strict mode for maximum type safety. Avoid `any`."
3. **Real examples:** "Used generics to create reusable data fetching hooks in React."
4. **Know when to use:** "Generics for reusable code, interfaces for object shapes, type aliases for unions."
5. **Tooling:** "TypeScript provides excellent IDE support with autocomplete and refactoring."

**Key concepts:** Static typing, interfaces, generics, utility types, strict mode

---

**Updated:** 2026-06-28 | **Level:** Intermediate-Advanced | **Format:** Interview-ready definitions
