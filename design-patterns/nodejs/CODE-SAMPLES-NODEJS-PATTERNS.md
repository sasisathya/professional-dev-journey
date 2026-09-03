# Node.js Design Pattern Code Samples

Complete working examples for all Node.js design patterns.

---

## 1. SINGLETON PATTERN - Code Samples

### Example 1: Database Connection Singleton

```javascript
// database.js - Singleton Database Connection
class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    
    this.connection = null;
    this.isConnected = false;
    Database.instance = this;
  }

  static getInstance() {
    return new Database();
  }

  connect(config) {
    if (this.isConnected) {
      console.log('Already connected');
      return this.connection;
    }

    this.connection = {
      host: config.host,
      port: config.port,
      database: config.database,
      pool: 10,
      connectedAt: new Date()
    };

    this.isConnected = true;
    console.log('✅ Database connected');
    return this.connection;
  }

  query(sql, params) {
    if (!this.isConnected) throw new Error('Not connected');
    return { sql, params, result: 'data' };
  }

  disconnect() {
    this.isConnected = false;
    this.connection = null;
    console.log('❌ Database disconnected');
  }
}

// Usage
const db1 = Database.getInstance();
db1.connect({ host: 'localhost', port: 5432, database: 'myapp' });

const db2 = Database.getInstance();
console.log(db1 === db2); // true - same instance

db1.query('SELECT * FROM users', []);
```

### Example 2: Logger Singleton

```javascript
// logger.js
class Logger {
  constructor() {
    if (Logger.instance) {
      return Logger.instance;
    }
    
    this.logs = [];
    Logger.instance = this;
  }

  static getInstance() {
    return new Logger();
  }

  info(message) {
    const log = `[INFO] ${new Date().toISOString()}: ${message}`;
    this.logs.push(log);
    console.log(log);
  }

  error(message, error) {
    const log = `[ERROR] ${new Date().toISOString()}: ${message}`;
    if (error) console.error(error);
    this.logs.push(log);
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

// Usage
const logger = Logger.getInstance();
logger.info('Application started');
logger.error('Something went wrong', new Error('Test error'));
logger.info('Processing data');

console.log(`Total logs: ${logger.getLogs().length}`);
```

### Example 3: Configuration Singleton

```javascript
// config.js
class AppConfig {
  constructor(initialConfig) {
    if (AppConfig.instance) {
      return AppConfig.instance;
    }

    this.config = initialConfig || {
      appName: 'MyApp',
      version: '1.0.0',
      environment: 'development',
      database: {
        host: 'localhost',
        port: 5432
      },
      apiServer: {
        host: 'localhost',
        port: 3000
      }
    };

    AppConfig.instance = this;
  }

  static getInstance(initialConfig) {
    return new AppConfig(initialConfig);
  }

  get(key) {
    return this.config[key];
  }

  set(key, value) {
    this.config[key] = value;
  }

  getAll() {
    return { ...this.config };
  }

  isDevelopment() {
    return this.config.environment === 'development';
  }

  isProduction() {
    return this.config.environment === 'production';
  }
}

// Usage
const config = AppConfig.getInstance();
console.log('App Name:', config.get('appName'));
console.log('Database:', config.get('database'));
console.log('Is Dev?', config.isDevelopment());

config.set('environment', 'production');
console.log('Is Production?', config.isProduction());
```

---

## 2. FACTORY PATTERN - Code Samples

### Example 1: Vehicle Factory

```javascript
// vehicleFactory.js
class Car {
  constructor(make, model) {
    this.type = 'car';
    this.make = make;
    this.model = model;
  }

  start() {
    return `${this.make} car engine started`;
  }

  drive() {
    return `Driving ${this.make} ${this.model}`;
  }
}

class Motorcycle {
  constructor(make, model) {
    this.type = 'motorcycle';
    this.make = make;
    this.model = model;
  }

  start() {
    return `${this.make} motorcycle engine roared`;
  }

  drive() {
    return `Riding ${this.make} ${this.model}`;
  }
}

class Truck {
  constructor(make, model, capacity) {
    this.type = 'truck';
    this.make = make;
    this.model = model;
    this.capacity = capacity;
  }

  start() {
    return `${this.make} truck diesel started`;
  }

  drive() {
    return `Hauling with ${this.make} ${this.model}`;
  }
}

class VehicleFactory {
  static create(type, make, model, capacity) {
    switch (type) {
      case 'car':
        return new Car(make, model);
      case 'motorcycle':
        return new Motorcycle(make, model);
      case 'truck':
        return new Truck(make, model, capacity);
      default:
        throw new Error(`Unknown vehicle type: ${type}`);
    }
  }
}

// Usage
const car = VehicleFactory.create('car', 'Toyota', 'Camry');
const bike = VehicleFactory.create('motorcycle', 'Harley', 'Street 750');
const truck = VehicleFactory.create('truck', 'Volvo', 'FH16', 25);

console.log(car.start());      // Toyota car engine started
console.log(bike.drive());     // Riding Harley Street 750
console.log(truck.drive());    // Hauling with Volvo FH16
```

### Example 2: Database Driver Factory

```javascript
// dbFactory.js
class PostgresDriver {
  connect(config) {
    return `Connected to PostgreSQL at ${config.host}:${config.port}`;
  }

  query(sql) {
    return `Executing on PostgreSQL: ${sql}`;
  }
}

class MongoDriver {
  connect(config) {
    return `Connected to MongoDB at ${config.host}:${config.port}`;
  }

  query(query) {
    return `Executing MongoDB query: ${JSON.stringify(query)}`;
  }
}

class MySQLDriver {
  connect(config) {
    return `Connected to MySQL at ${config.host}:${config.port}`;
  }

  query(sql) {
    return `Executing on MySQL: ${sql}`;
  }
}

class DatabaseFactory {
  static create(type, config) {
    switch (type) {
      case 'postgres':
        return new PostgresDriver();
      case 'mongo':
        return new MongoDriver();
      case 'mysql':
        return new MySQLDriver();
      default:
        throw new Error(`Unknown database type: ${type}`);
    }
  }
}

// Usage
const pgDriver = DatabaseFactory.create('postgres', {
  host: 'localhost',
  port: 5432
});

const mongoDriver = DatabaseFactory.create('mongo', {
  host: 'localhost',
  port: 27017
});

console.log(pgDriver.connect({ host: 'localhost', port: 5432 }));
console.log(mongoDriver.connect({ host: 'localhost', port: 27017 }));
console.log(pgDriver.query('SELECT * FROM users'));
console.log(mongoDriver.query({ collection: 'users', find: {} }));
```

---

## 3. OBSERVER PATTERN - Code Samples

### Example 1: Event System

```javascript
// eventSystem.js
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    console.log(`✅ Observer added for: ${event}`);
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.events[event]) {
      console.log(`📢 Emitting event: ${event}`);
      this.events[event].forEach(callback => callback(data));
    }
  }

  once(event, callback) {
    const onceWrapper = (data) => {
      callback(data);
      this.off(event, onceWrapper);
    };
    this.on(event, onceWrapper);
  }
}

// Usage
const userEvents = new EventEmitter();

// Observer 1: Email notification
userEvents.on('user:created', (user) => {
  console.log(`📧 Sending welcome email to ${user.email}`);
});

// Observer 2: Log to database
userEvents.on('user:created', (user) => {
  console.log(`💾 Logging user creation: ${user.id}`);
});

// Observer 3: Analytics
userEvents.on('user:created', (user) => {
  console.log(`📊 Tracking new user signup`);
});

// Emit event
userEvents.emit('user:created', {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com'
});

// One-time listener
userEvents.once('user:deleted', (userId) => {
  console.log(`🗑️  Cleanup performed for user: ${userId}`);
});

userEvents.emit('user:deleted', 1); // Fires
userEvents.emit('user:deleted', 2); // Doesn't fire
```

### Example 2: Real-time Notification System

```javascript
// notificationSystem.js
class NotificationSystem extends EventEmitter {
  notifyUserCreated(user) {
    this.emit('user.created', {
      type: 'user.created',
      user,
      timestamp: new Date()
    });
  }

  notifyOrderPlaced(order) {
    this.emit('order.placed', {
      type: 'order.placed',
      order,
      timestamp: new Date()
    });
  }

  notifyPaymentProcessed(payment) {
    this.emit('payment.processed', {
      type: 'payment.processed',
      payment,
      timestamp: new Date()
    });
  }
}

// Usage
const notifications = new NotificationSystem();

// Email service observer
notifications.on('user.created', (data) => {
  console.log(`📧 Email: Welcome ${data.user.name}!`);
});

// SMS service observer
notifications.on('user.created', (data) => {
  console.log(`📱 SMS: Verification sent to ${data.user.phone}`);
});

// Payment observer
notifications.on('payment.processed', (data) => {
  console.log(`💳 Payment of $${data.payment.amount} confirmed`);
});

// Order observer
notifications.on('order.placed', (data) => {
  console.log(`📦 Order #${data.order.id} placed by ${data.order.userId}`);
});

// Trigger events
notifications.notifyUserCreated({
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  phone: '+1-555-0123'
});

notifications.notifyOrderPlaced({
  id: 'ORD-001',
  userId: 1,
  items: ['Laptop', 'Mouse'],
  total: 1299
});

notifications.notifyPaymentProcessed({
  id: 'PAY-001',
  orderId: 'ORD-001',
  amount: 1299,
  method: 'credit_card'
});
```

---

## 4. STRATEGY PATTERN - Code Samples

### Example 1: Payment Processing

```javascript
// paymentStrategies.js
class CreditCardPayment {
  constructor(cardNumber, cardHolder, cvv) {
    this.cardNumber = cardNumber;
    this.cardHolder = cardHolder;
    this.cvv = cvv;
  }

  pay(amount) {
    const fee = amount * 0.029; // 2.9%
    return {
      method: 'Credit Card',
      amount,
      fee,
      total: amount + fee,
      status: 'Success',
      transactionId: `CC-${Date.now()}`
    };
  }
}

class PayPalPayment {
  constructor(email) {
    this.email = email;
  }

  pay(amount) {
    const fee = amount * 0.034 + 0.30; // 3.4% + $0.30
    return {
      method: 'PayPal',
      amount,
      fee,
      total: amount + fee,
      status: 'Success',
      transactionId: `PP-${Date.now()}`
    };
  }
}

class BitcoinPayment {
  constructor(walletAddress) {
    this.walletAddress = walletAddress;
  }

  pay(amount) {
    const fee = 0.0001;
    return {
      method: 'Bitcoin',
      amount,
      fee,
      total: amount + fee,
      status: 'Pending',
      transactionId: `BTC-${Date.now()}`
    };
  }
}

class PaymentProcessor {
  constructor(paymentMethod) {
    this.paymentMethod = paymentMethod;
  }

  setPaymentMethod(method) {
    this.paymentMethod = method;
  }

  processPayment(amount) {
    console.log(`Processing payment of $${amount}...`);
    const result = this.paymentMethod.pay(amount);
    console.log(`✅ Payment ${result.status}: ${result.transactionId}`);
    return result;
  }
}

// Usage
const processor = new PaymentProcessor(
  new CreditCardPayment('1234567890123456', 'John Doe', '123')
);

console.log('=== Credit Card ===');
console.log(processor.processPayment(100));

console.log('\n=== PayPal ===');
processor.setPaymentMethod(new PayPalPayment('john@example.com'));
console.log(processor.processPayment(100));

console.log('\n=== Bitcoin ===');
processor.setPaymentMethod(new BitcoinPayment('1A1z7agoat2ABJF3F...'));
console.log(processor.processPayment(100));
```

### Example 2: Sorting Algorithms

```javascript
// sortingStrategies.js
class BubbleSort {
  sort(array) {
    const arr = [...array];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }
    return arr;
  }
}

class QuickSort {
  sort(array) {
    if (array.length <= 1) return array;
    const pivot = array[0];
    const left = array.slice(1).filter(x => x < pivot);
    const right = array.slice(1).filter(x => x >= pivot);
    return [...this.sort(left), pivot, ...this.sort(right)];
  }
}

class MergeSort {
  sort(array) {
    if (array.length <= 1) return array;
    const mid = Math.floor(array.length / 2);
    const left = this.sort(array.slice(0, mid));
    const right = this.sort(array.slice(mid));
    return this.merge(left, right);
  }

  merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        result.push(left[i++]);
      } else {
        result.push(right[j++]);
      }
    }
    return [...result, ...left.slice(i), ...right.slice(j)];
  }
}

class SortProcessor {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  sort(array) {
    console.log(`Sorting with ${this.strategy.constructor.name}...`);
    return this.strategy.sort(array);
  }
}

// Usage
const numbers = [64, 34, 25, 12, 22, 11, 90];
const processor = new SortProcessor(new BubbleSort());

console.log('Original:', numbers);
console.log('Bubble Sort:', processor.sort(numbers));

processor.setStrategy(new QuickSort());
console.log('Quick Sort:', processor.sort([...numbers]));

processor.setStrategy(new MergeSort());
console.log('Merge Sort:', processor.sort([...numbers]));
```

---

## 5. MIDDLEWARE PATTERN - Code Samples

### Example 1: Express-like Middleware

```javascript
// middleware.js
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
        const middleware = this.middlewares[i];
        await middleware(request, response, () => dispatch(i + 1));
      }
    };

    await dispatch(0);
    return response;
  }
}

// Middleware functions
const loggingMiddleware = (req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  return next();
};

const authMiddleware = (req, res, next) => {
  console.log('🔐 Checking authentication...');
  if (!req.headers.authorization) {
    res.statusCode = 401;
    res.body = { error: 'Unauthorized' };
    return;
  }
  console.log('✅ User authenticated');
  return next();
};

const validationMiddleware = (req, res, next) => {
  console.log('✔️ Validating request...');
  if (req.method === 'POST' && !req.body) {
    res.statusCode = 400;
    res.body = { error: 'Bad request' };
    return;
  }
  console.log('✅ Request valid');
  return next();
};

const responseMiddleware = (req, res, next) => {
  if (!res.body) {
    res.body = { success: true };
  }
  console.log('📤 Sending response...');
  return next();
};

// Usage
const chain = new MiddlewareChain();
chain
  .use(loggingMiddleware)
  .use(authMiddleware)
  .use(validationMiddleware)
  .use(responseMiddleware);

// Simulate request/response
const request = {
  method: 'POST',
  url: '/api/users',
  headers: { authorization: 'Bearer token123' },
  body: { name: 'John' }
};

const response = {
  statusCode: 200,
  body: null
};

chain.execute(request, response).then(() => {
  console.log('\n📥 Response:', response);
});
```

### Example 2: Authentication Middleware Chain

```javascript
// authMiddleware.js
const createAuthChain = () => {
  const chain = new MiddlewareChain();

  // Middleware 1: Check token presence
  chain.use((req, res, next) => {
    console.log('1️⃣ Checking token presence...');
    if (!req.headers.authorization) {
      res.statusCode = 401;
      return res.body = { error: 'No token provided' };
    }
    return next();
  });

  // Middleware 2: Validate token format
  chain.use((req, res, next) => {
    console.log('2️⃣ Validating token format...');
    if (!req.headers.authorization.startsWith('Bearer ')) {
      res.statusCode = 401;
      return res.body = { error: 'Invalid token format' };
    }
    return next();
  });

  // Middleware 3: Verify token
  chain.use((req, res, next) => {
    console.log('3️⃣ Verifying token...');
    req.user = { id: 1, username: 'john', role: 'admin' };
    console.log('✅ User verified:', req.user);
    return next();
  });

  // Middleware 4: Check permissions
  chain.use((req, res, next) => {
    console.log('4️⃣ Checking permissions...');
    if (req.user.role !== 'admin') {
      res.statusCode = 403;
      return res.body = { error: 'Forbidden' };
    }
    console.log('✅ User has permission');
    return next();
  });

  return chain;
};

// Usage
const request = {
  method: 'DELETE',
  url: '/api/users/1',
  headers: { authorization: 'Bearer eyJhbGc...' }
};

const response = { statusCode: 200, body: null };
const authChain = createAuthChain();

authChain.execute(request, response).then(() => {
  console.log('\n✅ Final Response:', response);
});
```

---

## 6. BUILDER PATTERN - Code Samples

### Example 1: Query Builder

```javascript
// queryBuilder.js
class QueryBuilder {
  constructor() {
    this.query = {
      select: [],
      from: '',
      where: [],
      joins: [],
      orderBy: [],
      limit: null,
      offset: null
    };
  }

  select(...columns) {
    if (columns.length === 0) {
      this.query.select = ['*'];
    } else {
      this.query.select = columns;
    }
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

  and(condition) {
    this.query.where.push(`AND ${condition}`);
    return this;
  }

  join(table, condition) {
    this.query.joins.push({ table, condition });
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

  offset(count) {
    this.query.offset = count;
    return this;
  }

  build() {
    let sql = `SELECT ${this.query.select.join(', ')} FROM ${this.query.from}`;

    if (this.query.joins.length > 0) {
      sql += ' ' + this.query.joins
        .map(j => `JOIN ${j.table} ON ${j.condition}`)
        .join(' ');
    }

    if (this.query.where.length > 0) {
      sql += ' WHERE ' + this.query.where.join(' ');
    }

    if (this.query.orderBy.length > 0) {
      sql += ' ORDER BY ' + this.query.orderBy.join(', ');
    }

    if (this.query.limit) {
      sql += ` LIMIT ${this.query.limit}`;
    }

    if (this.query.offset) {
      sql += ` OFFSET ${this.query.offset}`;
    }

    return sql;
  }
}

// Usage
const query = new QueryBuilder()
  .select('users.id', 'users.name', 'users.email', 'COUNT(orders.id) as order_count')
  .from('users')
  .join('orders', 'users.id = orders.user_id')
  .where('users.status = "active"')
  .and('users.created_at > "2024-01-01"')
  .orderBy('order_count', 'DESC')
  .limit(10);

console.log('Generated SQL:');
console.log(query.build());
// Output: SELECT users.id, users.name, users.email, COUNT(orders.id) as order_count FROM users JOIN orders ON users.id = orders.user_id WHERE users.status = "active" AND users.created_at > "2024-01-01" ORDER BY order_count DESC LIMIT 10
```

### Example 2: HTTP Request Builder

```javascript
// httpRequestBuilder.js
class HttpRequestBuilder {
  constructor() {
    this.config = {
      method: 'GET',
      url: '',
      headers: {},
      body: null,
      timeout: 5000,
      retries: 0
    };
  }

  method(method) {
    this.config.method = method.toUpperCase();
    return this;
  }

  url(url) {
    this.config.url = url;
    return this;
  }

  header(key, value) {
    this.config.headers[key] = value;
    return this;
  }

  json(data) {
    this.config.body = JSON.stringify(data);
    this.config.headers['Content-Type'] = 'application/json';
    return this;
  }

  auth(username, password) {
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    this.config.headers['Authorization'] = `Basic ${credentials}`;
    return this;
  }

  bearerToken(token) {
    this.config.headers['Authorization'] = `Bearer ${token}`;
    return this;
  }

  timeout(ms) {
    this.config.timeout = ms;
    return this;
  }

  retries(count) {
    this.config.retries = count;
    return this;
  }

  build() {
    if (!this.config.url) throw new Error('URL is required');
    return { ...this.config };
  }
}

// Usage
const getRequest = new HttpRequestBuilder()
  .method('GET')
  .url('https://api.example.com/users/123')
  .header('Accept', 'application/json')
  .bearerToken('eyJhbGc...')
  .timeout(10000)
  .retries(3)
  .build();

console.log('GET Request:', getRequest);

const postRequest = new HttpRequestBuilder()
  .method('POST')
  .url('https://api.example.com/users')
  .json({ name: 'John Doe', email: 'john@example.com' })
  .auth('admin', 'password123')
  .retries(5)
  .build();

console.log('\nPOST Request:', postRequest);
```

---

## 7. DEPENDENCY INJECTION - Code Samples

### Example 1: Simple DI Container

```javascript
// container.js
class Container {
  constructor() {
    this.services = {};
  }

  register(name, definition, isSingleton = true) {
    this.services[name] = {
      definition,
      isSingleton,
      instance: null
    };
  }

  resolve(name) {
    const service = this.services[name];
    if (!service) throw new Error(`Service not found: ${name}`);

    if (service.isSingleton && service.instance) {
      return service.instance;
    }

    const instance = service.definition(this);
    if (service.isSingleton) {
      service.instance = instance;
    }
    return instance;
  }
}

// Services
class Database {
  connect() {
    console.log('📊 Database connected');
    return { host: 'localhost', port: 5432 };
  }

  query(sql) {
    return { sql, result: 'data' };
  }
}

class UserRepository {
  constructor(database) {
    this.database = database;
  }

  findAll() {
    return this.database.query('SELECT * FROM users');
  }

  findById(id) {
    return this.database.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

class UserService {
  constructor(repository) {
    this.repository = repository;
  }

  getAllUsers() {
    return this.repository.findAll();
  }

  getUser(id) {
    return this.repository.findById(id);
  }
}

// Usage
const container = new Container();

container.register('database', () => new Database());
container.register('userRepository', (c) => 
  new UserRepository(c.resolve('database'))
);
container.register('userService', (c) => 
  new UserService(c.resolve('userRepository'))
);

const userService = container.resolve('userService');
console.log('All users:', userService.getAllUsers());
console.log('User by ID:', userService.getUser(1));
```

### Example 2: Email Service DI

```javascript
// emailDI.js
class EmailService {
  send(to, subject, body) {
    console.log(`📧 Email to ${to}: ${subject}`);
    return { success: true, messageId: `MSG-${Date.now()}` };
  }
}

class SMSService {
  send(phone, message) {
    console.log(`📱 SMS to ${phone}: ${message}`);
    return { success: true, messageId: `SMS-${Date.now()}` };
  }
}

class NotificationService {
  constructor(emailService, smsService) {
    this.emailService = emailService;
    this.smsService = smsService;
  }

  notifyUser(user, message) {
    const emailResult = this.emailService.send(
      user.email,
      'Notification',
      message
    );
    const smsResult = this.smsService.send(user.phone, message);
    return { email: emailResult, sms: smsResult };
  }
}

// Usage
const emailService = new EmailService();
const smsService = new SMSService();
const notificationService = new NotificationService(emailService, smsService);

notificationService.notifyUser(
  { email: 'john@example.com', phone: '+1-555-0123' },
  'Your account has been verified'
);
```

---

## 8. ADAPTER PATTERN - Code Samples

### Example 1: Payment Gateway Adapter

```javascript
// paymentAdapters.js
// Old Payment System
class LegacyPaymentProcessor {
  processPayment(amount, cardData) {
    console.log(`💳 Processing ${amount} with legacy system`);
    return {
      transactionId: `LEGACY-${Date.now()}`,
      amount,
      status: 'PROCESSED'
    };
  }
}

// Modern Payment Interface
class PaymentAdapter {
  constructor(legacyProcessor) {
    this.processor = legacyProcessor;
  }

  pay(amount, paymentMethod) {
    const cardData = {
      number: paymentMethod.cardNumber,
      expiry: paymentMethod.expiryDate,
      cvv: paymentMethod.cvv
    };

    return this.processor.processPayment(amount, cardData);
  }
}

// Usage
const legacyProcessor = new LegacyPaymentProcessor();
const adapter = new PaymentAdapter(legacyProcessor);

const result = adapter.pay(100, {
  cardNumber: '1234567890123456',
  expiryDate: '12/25',
  cvv: '123'
});

console.log('Payment Result:', result);
```

### Example 2: API Format Adapter

```javascript
// formatAdapter.js
// Old XML API
class XMLAPI {
  sendRequest(xmlData) {
    console.log('📨 Sending XML:', xmlData);
    return '<response><status>success</status></response>';
  }
}

// Modern JSON Adapter
class JSONAdapter {
  constructor(xmlAPI) {
    this.xmlAPI = xmlAPI;
  }

  send(jsonData) {
    // Convert JSON to XML
    const xml = this.jsonToXml(jsonData);
    const xmlResponse = this.xmlAPI.sendRequest(xml);
    // Convert XML response back to JSON
    return this.xmlToJson(xmlResponse);
  }

  jsonToXml(json) {
    return `<request>${JSON.stringify(json)}</request>`;
  }

  xmlToJson(xml) {
    return { status: 'success', data: 'response' };
  }
}

// Usage
const xmlAPI = new XMLAPI();
const jsonAdapter = new JSONAdapter(xmlAPI);

const response = jsonAdapter.send({
  method: 'GET',
  endpoint: '/users',
  id: 123
});

console.log('JSON Response:', response);
```

---

## 9. DECORATOR PATTERN - Code Samples

### Example 1: Feature Decorators

```javascript
// decorators.js
class SimpleCoffee {
  cost() {
    return 5.00;
  }

  description() {
    return 'Simple Coffee';
  }
}

class MilkDecorator {
  constructor(coffee) {
    this.coffee = coffee;
  }

  cost() {
    return this.coffee.cost() + 0.75;
  }

  description() {
    return this.coffee.description() + ', Milk';
  }
}

class SugarDecorator {
  constructor(coffee) {
    this.coffee = coffee;
  }

  cost() {
    return this.coffee.cost() + 0.25;
  }

  description() {
    return this.coffee.description() + ', Sugar';
  }
}

class VanillaDecorator {
  constructor(coffee) {
    this.coffee = coffee;
  }

  cost() {
    return this.coffee.cost() + 0.50;
  }

  description() {
    return this.coffee.description() + ', Vanilla';
  }
}

// Usage
let coffee = new SimpleCoffee();
console.log(`${coffee.description()}: $${coffee.cost()}`);

coffee = new MilkDecorator(coffee);
console.log(`${coffee.description()}: $${coffee.cost()}`);

coffee = new SugarDecorator(coffee);
console.log(`${coffee.description()}: $${coffee.cost()}`);

coffee = new VanillaDecorator(coffee);
console.log(`${coffee.description()}: $${coffee.cost()}`);
// Output: Simple Coffee, Milk, Sugar, Vanilla: $6.50
```

### Example 2: Logging Decorator

```javascript
// loggingDecorator.js
class DataProcessor {
  process(data) {
    return data.toUpperCase();
  }
}

function withLogging(processor, name) {
  return {
    process(data) {
      console.log(`[${name}] Processing started at ${new Date().toISOString()}`);
      const startTime = performance.now();

      const result = processor.process(data);

      const endTime = performance.now();
      console.log(`[${name}] Completed in ${(endTime - startTime).toFixed(2)}ms`);
      console.log(`[${name}] Input: ${data.length} chars, Output: ${result.length} chars`);

      return result;
    }
  };
}

// Usage
const processor = new DataProcessor();
const decoratedProcessor = withLogging(processor, 'DataProcessor');

decoratedProcessor.process('hello world');
decoratedProcessor.process('this is a longer string to process');
```

---

## Complete Real-World Example

### E-Commerce Order System

```javascript
// ecommerce.js
// Combines multiple patterns

// 1. Singleton - Database
const db = {
  instance: null,
  getInstance() {
    if (!this.instance) {
      this.instance = { connected: true };
    }
    return this.instance;
  }
};

// 2. Factory - Product types
class Product {
  constructor(id, name, price, category) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.category = category;
  }
}

const ProductFactory = {
  create(data) {
    return new Product(data.id, data.name, data.price, data.category);
  }
};

// 3. Strategy - Payment methods
const paymentStrategies = {
  creditCard: {
    pay(amount) {
      console.log(`💳 Processing credit card: $${amount}`);
      return { success: true, method: 'credit_card' };
    }
  },
  paypal: {
    pay(amount) {
      console.log(`🅿️ Processing PayPal: $${amount}`);
      return { success: true, method: 'paypal' };
    }
  }
};

// 4. Observer - Order events
class OrderEventBus {
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

// 5. Builder - Order building
class OrderBuilder {
  constructor() {
    this.items = [];
    this.customer = null;
    this.paymentMethod = null;
  }

  addItem(product, quantity) {
    this.items.push({ product, quantity });
    return this;
  }

  setCustomer(customer) {
    this.customer = customer;
    return this;
  }

  setPaymentMethod(method) {
    this.paymentMethod = method;
    return this;
  }

  build() {
    return {
      orderId: `ORD-${Date.now()}`,
      customer: this.customer,
      items: this.items,
      paymentMethod: this.paymentMethod,
      total: this.calculateTotal(),
      createdAt: new Date()
    };
  }

  calculateTotal() {
    return this.items.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );
  }
}

// Usage
const eventBus = new OrderEventBus();

// Setup observers
eventBus.on('order:created', (order) => {
  console.log(`📧 Email sent for order ${order.orderId}`);
});

eventBus.on('order:created', (order) => {
  console.log(`💾 Order saved to database`);
});

eventBus.on('order:paid', (data) => {
  console.log(`✅ Order ${data.orderId} payment confirmed`);
});

// Create order using builder
const order = new OrderBuilder()
  .addItem(ProductFactory.create({
    id: 1,
    name: 'Laptop',
    price: 999,
    category: 'Electronics'
  }), 1)
  .addItem(ProductFactory.create({
    id: 2,
    name: 'Mouse',
    price: 29,
    category: 'Accessories'
  }), 2)
  .setCustomer({ id: 1, name: 'John Doe', email: 'john@example.com' })
  .setPaymentMethod('creditCard')
  .build();

console.log('Created Order:', order);
eventBus.emit('order:created', order);

// Process payment
const paymentResult = paymentStrategies[order.paymentMethod].pay(order.total);
eventBus.emit('order:paid', { orderId: order.orderId, paymentResult });
```

---

This document covers all **9 JavaScript design patterns** with practical, working code samples that you can copy and use immediately!
