# Design Patterns - All Patterns, All Platforms

Complete implementations of **each design pattern** in **Node.js, React, and TypeScript**.

---

## 1. SINGLETON PATTERN

### Node.js Implementation
```javascript
// Node.js - Database Singleton
class DatabaseConnection {
  static instance = null;

  constructor() {
    if (DatabaseConnection.instance) {
      return DatabaseConnection.instance;
    }
    this.connected = false;
    DatabaseConnection.instance = this;
  }

  connect() {
    this.connected = true;
    console.log('✅ Connected to database');
  }
}

const db1 = new DatabaseConnection();
const db2 = new DatabaseConnection();
console.log(db1 === db2); // true
```

### React Implementation
```jsx
// React - Singleton Store
let analyticsInstance = null;

class AnalyticsService {
  constructor() {
    if (analyticsInstance) return analyticsInstance;
    this.events = [];
    analyticsInstance = this;
  }

  trackEvent(event) {
    this.events.push(event);
    console.log('📊 Event tracked:', event);
  }
}

export const useAnalytics = () => {
  return new AnalyticsService();
};

// Usage in component
export const Dashboard = () => {
  const analytics = useAnalytics();

  return (
    <button onClick={() => analytics.trackEvent('button_click')}>
      Track Event
    </button>
  );
};
```

### TypeScript Implementation
```typescript
// TypeScript - Type-safe Singleton
interface ConfigType {
  apiUrl: string;
  timeout: number;
}

class Config {
  private static instance: Config;
  private config: ConfigType;

  private constructor(config: ConfigType) {
    this.config = config;
  }

  static getInstance(config?: ConfigType): Config {
    if (!Config.instance) {
      Config.instance = new Config(config || {
        apiUrl: 'http://localhost:3000',
        timeout: 5000
      });
    }
    return Config.instance;
  }

  getConfig(): ConfigType {
    return this.config;
  }
}

// Usage
const config1 = Config.getInstance();
const config2 = Config.getInstance();
console.log(config1 === config2); // true
```

---

## 2. FACTORY PATTERN

### Node.js Implementation
```javascript
// Node.js - Database Driver Factory
class PostgresDriver {
  connect() {
    return 'Connected to PostgreSQL';
  }
}

class MongoDriver {
  connect() {
    return 'Connected to MongoDB';
  }
}

class DatabaseFactory {
  static create(type) {
    switch (type) {
      case 'postgres':
        return new PostgresDriver();
      case 'mongo':
        return new MongoDriver();
      default:
        throw new Error(`Unknown database: ${type}`);
    }
  }
}

// Usage
const db = DatabaseFactory.create('postgres');
console.log(db.connect());
```

### React Implementation
```jsx
// React - Component Factory
const createButton = (type, label) => {
  const buttons = {
    primary: () => (
      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        {label}
      </button>
    ),
    danger: () => (
      <button className="bg-red-500 text-white px-4 py-2 rounded">
        {label}
      </button>
    )
  };

  return buttons[type] ? buttons[type]() : null;
};

export const App = () => {
  return (
    <div>
      {createButton('primary', 'Save')}
      {createButton('danger', 'Delete')}
    </div>
  );
};

// More advanced: Component factory
const componentFactory = {
  textInput: (props) => <input type="text" {...props} />,
  emailInput: (props) => <input type="email" {...props} />,
  numberInput: (props) => <input type="number" {...props} />,
  textarea: (props) => <textarea {...props} />,
  select: (props) => <select {...props} />
};

export const DynamicForm = ({ fields }) => {
  return (
    <form>
      {fields.map((field, idx) => {
        const Component = componentFactory[field.type];
        return Component ? (
          <Component key={idx} {...field.props} />
        ) : null;
      })}
    </form>
  );
};
```

### TypeScript Implementation
```typescript
// TypeScript - Type-safe Component Factory
interface InputComponentProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

type ComponentType = 'text' | 'email' | 'password' | 'number';

interface ComponentFactory {
  create(type: ComponentType, props: InputComponentProps): JSX.Element;
}

class ReactComponentFactory implements ComponentFactory {
  create(type: ComponentType, props: InputComponentProps) {
    switch (type) {
      case 'text':
        return <input type="text" {...props} />;
      case 'email':
        return <input type="email" {...props} />;
      case 'password':
        return <input type="password" {...props} />;
      case 'number':
        return <input type="number" {...props} />;
      default:
        const _: never = type;
        throw new Error(`Unknown type: ${_}`);
    }
  }
}

// Usage
const factory = new ReactComponentFactory();
const textInput = factory.create('text', {
  label: 'Name',
  placeholder: 'Enter name',
  value: '',
  onChange: () => {}
});
```

---

## 3. OBSERVER PATTERN

### Node.js Implementation
```javascript
// Node.js - Event Observer
class EventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}

const bus = new EventBus();

bus.on('user:created', (user) => {
  console.log('📧 Send email to:', user.email);
});

bus.on('user:created', (user) => {
  console.log('💾 Save to database:', user.id);
});

bus.emit('user:created', { id: 1, email: 'john@example.com' });
```

### React Implementation
```jsx
// React - Observable State with Observers
import { useState, useEffect } from 'react';

const useObservable = (initialValue) => {
  const [value, setValue] = useState(initialValue);
  const [observers, setObservers] = useState([]);

  const subscribe = (callback) => {
    setObservers(prev => [...prev, callback]);
    return () => {
      setObservers(prev => prev.filter(cb => cb !== callback));
    };
  };

  const notify = (newValue) => {
    setValue(newValue);
    observers.forEach(cb => cb(newValue));
  };

  return { value, notify, subscribe };
};

export const App = () => {
  const userState = useObservable(null);

  useEffect(() => {
    // Email observer
    userState.subscribe((user) => {
      if (user) console.log('📧 Email sent to', user.email);
    });

    // Analytics observer
    userState.subscribe((user) => {
      if (user) console.log('📊 Analytics tracked');
    });
  }, []);

  return (
    <button onClick={() => userState.notify({ id: 1, email: 'john@example.com' })}>
      Create User
    </button>
  );
};

// Better: Custom hook for observer pattern
const useUserEvents = () => {
  const [subscribers, setSubscribers] = useState({
    onUserCreated: [],
    onUserUpdated: [],
    onUserDeleted: []
  });

  const subscribe = (event, callback) => {
    setSubscribers(prev => ({
      ...prev,
      [event]: [...prev[event], callback]
    }));
  };

  const emit = (event, data) => {
    subscribers[event].forEach(cb => cb(data));
  };

  return { subscribe, emit };
};

export const UserDashboard = () => {
  const userEvents = useUserEvents();

  useEffect(() => {
    userEvents.subscribe('onUserCreated', (user) => {
      console.log('User created:', user.name);
    });
  }, []);

  return (
    <button onClick={() => userEvents.emit('onUserCreated', { name: 'John' })}>
      Create User
    </button>
  );
};
```

### TypeScript Implementation
```typescript
// TypeScript - Type-safe Observer
interface Observer<T> {
  update(data: T): void;
}

interface Subject<T> {
  attach(observer: Observer<T>): void;
  detach(observer: Observer<T>): void;
  notify(data: T): void;
}

interface UserEvent {
  type: 'created' | 'updated' | 'deleted';
  userId: number;
}

class UserEventBus implements Subject<UserEvent> {
  private observers: Set<Observer<UserEvent>> = new Set();

  attach(observer: Observer<UserEvent>): void {
    this.observers.add(observer);
  }

  detach(observer: Observer<UserEvent>): void {
    this.observers.delete(observer);
  }

  notify(data: UserEvent): void {
    this.observers.forEach(observer => observer.update(data));
  }
}

class EmailObserver implements Observer<UserEvent> {
  update(event: UserEvent): void {
    console.log(`📧 Email for event: ${event.type}`);
  }
}

// Usage
const bus = new UserEventBus();
const emailObserver = new EmailObserver();
bus.attach(emailObserver);
bus.notify({ type: 'created', userId: 1 });
```

---

## 4. STRATEGY PATTERN

### Node.js Implementation
```javascript
// Node.js - Payment Strategies
class CreditCardStrategy {
  pay(amount) {
    const fee = amount * 0.029;
    return { method: 'Credit Card', total: amount + fee };
  }
}

class PayPalStrategy {
  pay(amount) {
    const fee = amount * 0.034 + 0.30;
    return { method: 'PayPal', total: amount + fee };
  }
}

class PaymentProcessor {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  process(amount) {
    return this.strategy.pay(amount);
  }
}

const processor = new PaymentProcessor(new CreditCardStrategy());
console.log(processor.process(100)); // Credit Card
processor.setStrategy(new PayPalStrategy());
console.log(processor.process(100)); // PayPal
```

### React Implementation
```jsx
// React - Rendering Strategy
const renderStrategies = {
  grid: (items) => (
    <div className="grid grid-cols-3 gap-4">
      {items.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  ),
  list: (items) => (
    <ul>
      {items.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  ),
  table: (items) => (
    <table>
      <tbody>
        {items.map(item => (
          <tr key={item.id}>
            <td>{item.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
};

export const DataDisplay = ({ items, viewType = 'grid' }) => {
  const render = renderStrategies[viewType];
  return render ? render(items) : null;
};

// Usage
export const App = () => {
  const items = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }];

  return (
    <>
      <h2>Grid View</h2>
      <DataDisplay items={items} viewType="grid" />
      
      <h2>List View</h2>
      <DataDisplay items={items} viewType="list" />
      
      <h2>Table View</h2>
      <DataDisplay items={items} viewType="table" />
    </>
  );
};
```

### TypeScript Implementation
```typescript
// TypeScript - Type-safe Strategy
interface SortStrategy<T> {
  sort(items: T[]): T[];
}

class AscendingSort<T> implements SortStrategy<T> {
  sort(items: T[]): T[] {
    return [...items].sort((a: any, b: any) => a - b);
  }
}

class DescendingSort<T> implements SortStrategy<T> {
  sort(items: T[]): T[] {
    return [...items].sort((a: any, b: any) => b - a);
  }
}

class Sorter<T> {
  constructor(private strategy: SortStrategy<T>) {}

  setStrategy(strategy: SortStrategy<T>): void {
    this.strategy = strategy;
  }

  sort(items: T[]): T[] {
    return this.strategy.sort(items);
  }
}

// Usage
const numbers = [5, 2, 8, 1, 9];
const sorter = new Sorter(new AscendingSort<number>());
console.log(sorter.sort(numbers)); // [1, 2, 5, 8, 9]

sorter.setStrategy(new DescendingSort<number>());
console.log(sorter.sort(numbers)); // [9, 8, 5, 2, 1]
```

---

## 5. MIDDLEWARE PATTERN

### Node.js Implementation
```javascript
// Node.js - Classic Middleware
class MiddlewareChain {
  constructor() {
    this.middlewares = [];
  }

  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }

  async execute(request, response) {
    let index = -1;

    const dispatch = async (i) => {
      if (i <= index) return;
      index = i;

      if (i < this.middlewares.length) {
        await this.middlewares[i](request, response, () => dispatch(i + 1));
      }
    };

    await dispatch(0);
  }
}

// Usage
const chain = new MiddlewareChain();

chain
  .use((req, res, next) => {
    console.log('1️⃣ Logging');
    return next();
  })
  .use((req, res, next) => {
    console.log('2️⃣ Authentication');
    return next();
  })
  .use((req, res, next) => {
    console.log('3️⃣ Authorization');
    return next();
  });

chain.execute({}, {});
```

### React Implementation
```jsx
// React - Component Middleware Pipeline
const applyMiddleware = (Component, middlewares = []) => {
  return (props) => {
    let enhancedProps = props;

    middlewares.forEach(middleware => {
      enhancedProps = middleware(enhancedProps);
    });

    return <Component {...enhancedProps} />;
  };
};

// Middleware functions
const withLogging = (props) => {
  console.log('Rendering with props:', props);
  return props;
};

const withAuth = (props) => {
  if (!props.user) {
    throw new Error('User not authenticated');
  }
  return props;
};

const withTheme = (props) => {
  return { ...props, theme: 'dark' };
};

// Component
const Dashboard = ({ user, theme }) => (
  <div style={{ background: theme === 'dark' ? '#000' : '#fff' }}>
    Welcome, {user.name}!
  </div>
);

// Apply middleware
const ProtectedDashboard = applyMiddleware(Dashboard, [
  withLogging,
  withAuth,
  withTheme
]);

export const App = () => (
  <ProtectedDashboard user={{ name: 'John' }} />
);
```

### TypeScript Implementation
```typescript
// TypeScript - Type-safe Middleware
interface Request {
  method: string;
  path: string;
  headers: Record<string, string>;
}

interface Response {
  statusCode: number;
  body: any;
}

type Middleware = (
  req: Request,
  res: Response,
  next: () => Promise<void>
) => Promise<void>;

class MiddlewarePipeline {
  private middlewares: Middleware[] = [];

  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  async execute(req: Request, res: Response): Promise<void> {
    let index = -1;

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) return;
      index = i;

      if (i < this.middlewares.length) {
        await this.middlewares[i](req, res, () => dispatch(i + 1));
      }
    };

    await dispatch(0);
  }
}

// Usage
const pipeline = new MiddlewarePipeline();

pipeline
  .use(async (req, res, next) => {
    console.log(`📝 Logging ${req.method} ${req.path}`);
    await next();
  })
  .use(async (req, res, next) => {
    console.log('🔐 Checking auth');
    await next();
  });

const req: Request = { method: 'GET', path: '/api/users', headers: {} };
const res: Response = { statusCode: 200, body: null };
await pipeline.execute(req, res);
```

---

## 6. BUILDER PATTERN

### Node.js Implementation
```javascript
// Node.js - Query Builder
class QueryBuilder {
  constructor() {
    this.query = {
      select: [],
      from: '',
      where: [],
      orderBy: [],
      limit: null
    };
  }

  select(...columns) {
    this.query.select = columns;
    return this;
  }

  from(table) {
    this.query.from = table;
    return this;
  }

  where(condition) {
    this.query.where.push(condition);
    return this;
  }

  orderBy(column, direction = 'ASC') {
    this.query.orderBy.push(`${column} ${direction}`);
    return this;
  }

  limit(count) {
    this.query.limit = count;
    return this;
  }

  build() {
    let sql = `SELECT ${this.query.select.join(', ')} FROM ${this.query.from}`;
    if (this.query.where.length) sql += ' WHERE ' + this.query.where.join(' AND ');
    if (this.query.orderBy.length) sql += ' ORDER BY ' + this.query.orderBy.join(', ');
    if (this.query.limit) sql += ` LIMIT ${this.query.limit}`;
    return sql;
  }
}

// Usage
const query = new QueryBuilder()
  .select('id', 'name', 'email')
  .from('users')
  .where('status = "active"')
  .orderBy('name', 'ASC')
  .limit(10)
  .build();

console.log(query);
```

### React Implementation
```jsx
// React - Component Tree Builder
class FormBuilder {
  constructor() {
    this.fields = [];
  }

  addTextField(name, label) {
    this.fields.push({ type: 'text', name, label });
    return this;
  }

  addEmailField(name, label) {
    this.fields.push({ type: 'email', name, label });
    return this;
  }

  addNumberField(name, label) {
    this.fields.push({ type: 'number', name, label });
    return this;
  }

  addSelectField(name, label, options) {
    this.fields.push({ type: 'select', name, label, options });
    return this;
  }

  build() {
    return this.fields;
  }
}

// Custom hook for builder
export const useFormBuilder = () => {
  return new FormBuilder();
};

export const DynamicForm = () => {
  const builder = useFormBuilder();

  const formConfig = builder
    .addTextField('name', 'Full Name')
    .addEmailField('email', 'Email Address')
    .addNumberField('age', 'Age')
    .addSelectField('country', 'Country', ['USA', 'UK', 'Canada'])
    .build();

  return (
    <form>
      {formConfig.map((field, idx) => (
        <div key={idx} className="mb-4">
          <label>{field.label}</label>
          {field.type === 'select' ? (
            <select name={field.name}>
              {field.options.map(opt => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input type={field.type} name={field.name} />
          )}
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
};
```

### TypeScript Implementation
```typescript
// TypeScript - Type-safe Builder
interface FormField {
  name: string;
  type: 'text' | 'email' | 'number' | 'select';
  label: string;
  required?: boolean;
  options?: string[];
}

class TypeSafeFormBuilder {
  private fields: FormField[] = [];

  addTextField(name: string, label: string, required = false): this {
    this.fields.push({ name, type: 'text', label, required });
    return this;
  }

  addEmailField(name: string, label: string, required = false): this {
    this.fields.push({ name, type: 'email', label, required });
    return this;
  }

  addSelectField(
    name: string,
    label: string,
    options: string[]
  ): this {
    this.fields.push({ name, type: 'select', label, options });
    return this;
  }

  build(): FormField[] {
    return this.fields;
  }

  reset(): this {
    this.fields = [];
    return this;
  }
}

// Usage
const formConfig = new TypeSafeFormBuilder()
  .addTextField('username', 'Username', true)
  .addEmailField('email', 'Email', true)
  .addSelectField('role', 'Role', ['Admin', 'User', 'Guest'])
  .build();

console.log(formConfig);
```

---

## 7. ADAPTER PATTERN

### Node.js Implementation
```javascript
// Node.js - API Response Adapter
class OldAPI {
  fetchData() {
    return {
      userData: {
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john@example.com'
      }
    };
  }
}

class NewAPIAdapter {
  constructor(oldAPI) {
    this.oldAPI = oldAPI;
  }

  getData() {
    const oldData = this.oldAPI.fetchData();
    return {
      user: {
        firstName: oldData.userData.firstName,
        lastName: oldData.userData.lastName,
        email: oldData.userData.emailAddress
      }
    };
  }
}

// Usage
const oldAPI = new OldAPI();
const adapter = new NewAPIAdapter(oldAPI);
console.log(adapter.getData()); // New format
```

### React Implementation
```jsx
// React - Component Adapter
// Old third-party component
const OldDatePicker = ({ onDateSelect }) => (
  <input
    type="date"
    onChange={(e) => onDateSelect(new Date(e.target.value))}
  />
);

// New component interface
const NewDatePickerAdapter = ({ value, onChange }) => (
  <OldDatePicker
    onDateSelect={(date) => onChange(date.toISOString())}
  />
);

// Using in modern app
export const App = () => {
  const [date, setDate] = useState('');

  return (
    <div>
      <h1>Select Date</h1>
      <NewDatePickerAdapter value={date} onChange={setDate} />
      <p>Selected: {date}</p>
    </div>
  );
};
```

### TypeScript Implementation
```typescript
// TypeScript - Type-safe Adapter
interface OldUserFormat {
  first_name: string;
  last_name: string;
  email_address: string;
}

interface NewUserFormat {
  firstName: string;
  lastName: string;
  email: string;
}

class UserFormatAdapter {
  adapt(oldUser: OldUserFormat): NewUserFormat {
    return {
      firstName: oldUser.first_name,
      lastName: oldUser.last_name,
      email: oldUser.email_address
    };
  }
}

// Usage
const adapter = new UserFormatAdapter();
const oldUser: OldUserFormat = {
  first_name: 'John',
  last_name: 'Doe',
  email_address: 'john@example.com'
};
const newUser = adapter.adapt(oldUser);
console.log(newUser);
```

---

## 8. DECORATOR PATTERN

### Node.js Implementation
```javascript
// Node.js - Function Decorator
const logDecorator = (fn) => {
  return function(...args) {
    console.log(`Calling ${fn.name} with args:`, args);
    const result = fn.apply(this, args);
    console.log(`Result:`, result);
    return result;
  };
};

const add = (a, b) => a + b;
const decoratedAdd = logDecorator(add);

decoratedAdd(2, 3); // Logs everything
```

### React Implementation
```jsx
// React - Component Decorator (using HOC)
const withLogging = (Component) => {
  return (props) => {
    useEffect(() => {
      console.log(`${Component.name} mounted`);
      return () => console.log(`${Component.name} unmounted`);
    }, []);

    return <Component {...props} />;
  };
};

const withAuth = (Component) => {
  return (props) => {
    const isAuth = !!localStorage.getItem('token');
    return isAuth ? <Component {...props} /> : <div>Please login</div>;
  };
};

const Dashboard = () => <h1>Dashboard</h1>;

// Apply decorators
export const ProtectedDashboard = withAuth(withLogging(Dashboard));
```

### TypeScript Implementation
```typescript
// TypeScript - Method Decorator (TS specific feature)
function LogDecorator(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args: any[]) {
    console.log(`Calling ${propertyKey} with args:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`Result:`, result);
    return result;
  };

  return descriptor;
}

class Calculator {
  @LogDecorator
  add(a: number, b: number): number {
    return a + b;
  }
}

// Usage
const calc = new Calculator();
calc.add(5, 3); // Logs everything
```

---

## 9. DEPENDENCY INJECTION PATTERN

### Node.js Implementation
```javascript
// Node.js - Service Container
class ServiceContainer {
  constructor() {
    this.services = {};
  }

  register(name, definition) {
    this.services[name] = definition;
  }

  resolve(name) {
    const service = this.services[name];
    if (!service) throw new Error(`Service ${name} not found`);
    return service(this);
  }
}

// Services
const container = new ServiceContainer();

container.register('database', () => ({
  query: (sql) => console.log('Query:', sql)
}));

container.register('userService', (c) => ({
  getUser: (id) => {
    c.resolve('database').query(`SELECT * FROM users WHERE id = ${id}`);
  }
}));

// Usage
const userService = container.resolve('userService');
userService.getUser(1);
```

### React Implementation
```jsx
// React - Dependency Injection with Context
import { createContext, useContext } from 'react';

const ServiceContext = createContext();

const ServiceProvider = ({ children, services }) => (
  <ServiceContext.Provider value={services}>
    {children}
  </ServiceContext.Provider>
);

const useService = (serviceName) => {
  const services = useContext(ServiceContext);
  return services[serviceName];
};

// Services
const services = {
  api: {
    fetchUsers: () => fetch('/api/users').then(r => r.json()),
    fetchUser: (id) => fetch(`/api/users/${id}`).then(r => r.json())
  },
  storage: {
    get: (key) => localStorage.getItem(key),
    set: (key, value) => localStorage.setItem(key, value)
  }
};

// Usage
const UserList = () => {
  const api = useService('api');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.fetchUsers().then(setUsers);
  }, [api]);

  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
};

export const App = () => (
  <ServiceProvider services={services}>
    <UserList />
  </ServiceProvider>
);
```

### TypeScript Implementation
```typescript
// TypeScript - Type-safe DI Container
interface Service {
  [key: string]: any;
}

class DIContainer {
  private services: Map<string, () => any> = new Map();

  register<T>(name: string, factory: (container: this) => T): void {
    this.services.set(name, factory);
  }

  resolve<T>(name: string): T {
    const factory = this.services.get(name);
    if (!factory) throw new Error(`Service ${name} not found`);
    return factory(this);
  }
}

// Usage
class UserService {
  constructor(private db: any) {}

  getUser(id: number) {
    return this.db.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

const container = new DIContainer();

container.register('database', () => ({
  query: (sql: string) => console.log(sql)
}));

container.register('userService', (c) =>
  new UserService(c.resolve('database'))
);

const userService = container.resolve<UserService>('userService');
userService.getUser(1);
```

---

## 10. RENDER PROPS PATTERN

### Node.js Implementation
```javascript
// Node.js - Data provider with callback
class DataProvider {
  async fetchData(render) {
    try {
      const data = await this.getData();
      render(null, data);
    } catch (error) {
      render(error, null);
    }
  }

  async getData() {
    return new Promise(resolve =>
      setTimeout(() => resolve({ id: 1, name: 'John' }), 1000)
    );
  }
}

// Usage
const provider = new DataProvider();
provider.fetchData((error, data) => {
  if (error) console.error('Error:', error);
  else console.log('Data:', data);
});
```

### React Implementation
```jsx
// React - Render Props (Native)
const DataFetcher = ({ url, render }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then(r => r.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, [url]);

  return render({ data, loading });
};

// Usage
export const App = () => (
  <DataFetcher
    url="/api/users"
    render={({ data, loading }) => (
      loading ? <p>Loading...</p> : <pre>{JSON.stringify(data)}</pre>
    )}
  />
);
```

### TypeScript Implementation
```typescript
// TypeScript - Type-safe Render Props
interface DataFetcherProps<T> {
  url: string;
  render: (state: {
    data: T | null;
    loading: boolean;
    error: Error | null;
  }) => JSX.Element;
}

function DataFetcher<T>({ url, render }: DataFetcherProps<T>) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    fetch(url)
      .then(r => r.json())
      .then(data => setState({ data, loading: false, error: null }))
      .catch(error => setState({ data: null, loading: false, error }));
  }, [url]);

  return render(state);
}

// Usage
interface User {
  id: number;
  name: string;
}

export const App = () => (
  <DataFetcher<User>
    url="/api/users"
    render={({ data, loading, error }) =>
      loading ? <p>Loading...</p> : <pre>{JSON.stringify(data)}</pre>
    }
  />
);
```

---

## 11. HIGHER-ORDER COMPONENT PATTERN

### Node.js Implementation
```javascript
// Node.js - Function HOC
const withRetry = (fn, maxRetries = 3) => {
  return async function(...args) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn.apply(this, args);
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        console.log(`Retry ${i + 1}/${maxRetries}`);
      }
    }
  };
};

const fetchData = async () => {
  const random = Math.random();
  if (random < 0.7) throw new Error('Network error');
  return 'Success!';
};

const reliableFetch = withRetry(fetchData);
reliableFetch(); // Retries on failure
```

### React Implementation
```jsx
// React - Component HOC
const withTheme = (Component) => {
  return ({ ...props }) => {
    const [theme, setTheme] = useState('light');

    return (
      <div>
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          Toggle Theme
        </button>
        <Component {...props} theme={theme} />
      </div>
    );
  };
};

const Dashboard = ({ theme }) => (
  <div style={{ background: theme === 'dark' ? '#000' : '#fff' }}>
    Dashboard
  </div>
);

export const ThemedDashboard = withTheme(Dashboard);
```

### TypeScript Implementation
```typescript
// TypeScript - Type-safe HOC
interface WithThemeProps {
  theme: 'light' | 'dark';
}

function withTheme<P extends WithThemeProps>(
  Component: React.ComponentType<P>
): React.ComponentType<Omit<P, 'theme'>> {
  return (props) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    return (
      <Component {...(props as P)} theme={theme} />
    );
  };
}

interface DashboardProps extends WithThemeProps {
  title: string;
}

const Dashboard: React.FC<DashboardProps> = ({ theme, title }) => (
  <div style={{ background: theme === 'dark' ? '#000' : '#fff' }}>
    {title}
  </div>
);

export const ThemedDashboard = withTheme(Dashboard);
```

---

## 12. COMPOUND COMPONENTS PATTERN

### Node.js Implementation
```javascript
// Node.js - Compound object pattern
class Form {
  constructor() {
    this.fields = [];
  }

  addField(field) {
    this.fields.push(field);
    return this;
  }

  render() {
    return this.fields.map(f => f.render()).join('\n');
  }
}

class TextField {
  constructor(name) {
    this.name = name;
  }

  render() {
    return `<input type="text" name="${this.name}" />`;
  }
}

// Usage
const form = new Form()
  .addField(new TextField('username'))
  .addField(new TextField('email'));

console.log(form.render());
```

### React Implementation
```jsx
// React - Compound Components
const Tabs = ({ children }) => {
  const [active, setActive] = useState(0);

  return (
    <div>
      {children.map((child, idx) =>
        child.type === TabList
          ? React.cloneElement(child, { active, setActive })
          : React.cloneElement(child, { active })
      )}
    </div>
  );
};

const TabList = ({ children, active, setActive }) => (
  <div className="flex border-b">
    {children.map((child, idx) =>
      React.cloneElement(child, {
        isActive: active === idx,
        onClick: () => setActive(idx)
      })
    )}
  </div>
);

const Tab = ({ children, isActive, onClick }) => (
  <button
    onClick={onClick}
    style={{
      borderBottom: isActive ? '2px solid blue' : 'none'
    }}
  >
    {children}
  </button>
);

const TabContent = ({ children, active }) => (
  <div>
    {children.map((child, idx) =>
      active === idx ? <div key={idx}>{child}</div> : null
    )}
  </div>
);

export const App = () => (
  <Tabs>
    <TabList>
      <Tab>Home</Tab>
      <Tab>About</Tab>
    </TabList>
    <TabContent>
      <div>Home content</div>
      <div>About content</div>
    </TabContent>
  </Tabs>
);
```

### TypeScript Implementation
```typescript
// TypeScript - Type-safe Compound Components
interface TabsContextType {
  activeTab: number;
  setActiveTab: (idx: number) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabs = (): TabsContextType => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Must be used within Tabs');
  return context;
};

interface TabsProps {
  children: React.ReactNode;
  defaultTab?: number;
}

const Tabs: React.FC<TabsProps> = ({ children, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
};

interface TabListProps {
  children: React.ReactNode;
}

const TabList: React.FC<TabListProps> = ({ children }) => {
  const { activeTab, setActiveTab } = useTabs();

  return (
    <div className="flex border-b">
      {React.Children.map(children, (child, idx) =>
        React.cloneElement(child as React.ReactElement, {
          isActive: activeTab === idx,
          onClick: () => setActiveTab(idx)
        })
      )}
    </div>
  );
};

interface TabProps {
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

const Tab: React.FC<TabProps> = ({ children, isActive, onClick }) => (
  <button
    onClick={onClick}
    style={{ borderBottom: isActive ? '2px solid blue' : 'none' }}
  >
    {children}
  </button>
);

export const TabsComponent = {
  Tabs,
  TabList,
  Tab
};
```

---

## Summary: Pattern Availability Matrix

| Pattern | Node.js | React | TypeScript |
|---------|---------|-------|-----------|
| Singleton | ✅ | ✅ | ✅ |
| Factory | ✅ | ✅ | ✅ |
| Observer | ✅ | ✅ | ✅ |
| Strategy | ✅ | ✅ | ✅ |
| Middleware | ✅ | ✅ | ✅ |
| Builder | ✅ | ✅ | ✅ |
| Adapter | ✅ | ✅ | ✅ |
| Decorator | ✅ | ✅ | ✅ |
| Dependency Injection | ✅ | ✅ | ✅ |
| Render Props | ✅ | ✅ | ✅ |
| Higher-Order Components | ✅ | ✅ | ✅ |
| Compound Components | ✅ | ✅ | ✅ |

**ALL patterns can be implemented in ALL platforms!** Each has valid use cases in different contexts:
- **Patterns for Node.js** are useful for backend logic and server operations
- **Patterns for React** are optimized for frontend component architecture
- **TypeScript versions** provide type safety across all platforms

The key is understanding the pattern's core principles and adapting them to your platform's idioms and conventions.
