// Observer Pattern - TypeScript Version with Generics and Type Safety
// Defines a one-to-many dependency where when one object changes state, all dependents are notified

// Generic Observer Interface
interface IObserver<T> {
  update(data: T): void;
}

// Generic Subject Interface
interface ISubject<T> {
  attach(observer: IObserver<T>): void;
  detach(observer: IObserver<T>): void;
  notify(data: T): void;
  getObserverCount(): number;
}

// Event data types
interface UserEventData {
  type: 'added' | 'updated' | 'removed';
  user: User;
  timestamp: string;
}

interface OrderEventData {
  type: 'created' | 'shipped' | 'delivered' | 'cancelled';
  orderId: string;
  userId: string;
  total: number;
  timestamp: string;
}

// Domain models
interface User {
  id: number;
  name: string;
  email: string;
  status?: string;
}

// Generic EventEmitter
class EventEmitter<T> implements ISubject<T> {
  private observers: Set<IObserver<T>> = new Set();
  private eventHistory: T[] = [];

  public attach(observer: IObserver<T>): void {
    this.observers.add(observer);
    console.log(`✅ Observer attached. Total: ${this.observers.size}`);
  }

  public detach(observer: IObserver<T>): void {
    this.observers.delete(observer);
    console.log(`❌ Observer detached. Total: ${this.observers.size}`);
  }

  public notify(data: T): void {
    console.log(`📢 Notifying ${this.observers.size} observers...`);
    this.eventHistory.push(data);
    this.observers.forEach(observer => {
      observer.update(data);
    });
  }

  public getObserverCount(): number {
    return this.observers.size;
  }

  public getHistory(): T[] {
    return [...this.eventHistory];
  }

  public clearHistory(): void {
    this.eventHistory = [];
  }
}

// Concrete Subject - User Service
class UserService extends EventEmitter<UserEventData> {
  private users: Map<number, User> = new Map();
  private nextId: number = 1;

  public addUser(name: string, email: string): void {
    const user: User = {
      id: this.nextId++,
      name,
      email,
      status: 'active'
    };

    this.users.set(user.id, user);

    this.notify({
      type: 'added',
      user,
      timestamp: new Date().toISOString()
    });
  }

  public updateUser(id: number, updates: Partial<User>): void {
    const user = this.users.get(id);
    if (!user) throw new Error(`User ${id} not found`);

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);

    this.notify({
      type: 'updated',
      user: updatedUser,
      timestamp: new Date().toISOString()
    });
  }

  public removeUser(id: number): void {
    const user = this.users.get(id);
    if (!user) throw new Error(`User ${id} not found`);

    this.users.delete(id);

    this.notify({
      type: 'removed',
      user,
      timestamp: new Date().toISOString()
    });
  }

  public getUser(id: number): User | undefined {
    return this.users.get(id);
  }

  public getUsers(): User[] {
    return Array.from(this.users.values());
  }
}

// Concrete Subject - Order Service
class OrderService extends EventEmitter<OrderEventData> {
  public createOrder(orderId: string, userId: string, total: number): void {
    this.notify({
      type: 'created',
      orderId,
      userId,
      total,
      timestamp: new Date().toISOString()
    });
  }

  public shipOrder(orderId: string, userId: string, total: number): void {
    this.notify({
      type: 'shipped',
      orderId,
      userId,
      total,
      timestamp: new Date().toISOString()
    });
  }

  public deliverOrder(orderId: string, userId: string, total: number): void {
    this.notify({
      type: 'delivered',
      orderId,
      userId,
      total,
      timestamp: new Date().toISOString()
    });
  }

  public cancelOrder(orderId: string, userId: string, total: number): void {
    this.notify({
      type: 'cancelled',
      orderId,
      userId,
      total,
      timestamp: new Date().toISOString()
    });
  }
}

// Concrete Observers
class EmailNotifier implements IObserver<UserEventData> {
  update(data: UserEventData): void {
    console.log(`📧 Email sent for user event: ${data.type} - ${data.user.name}`);
  }
}

class LoggerObserver implements IObserver<UserEventData> {
  update(data: UserEventData): void {
    console.log(`📝 Log: User ${data.type} - ID: ${data.user.id}, Time: ${data.timestamp}`);
  }
}

class AnalyticsObserver implements IObserver<UserEventData> {
  private eventCount: number = 0;

  update(data: UserEventData): void {
    this.eventCount++;
    console.log(`📊 Analytics: Event ${this.eventCount} - ${data.type} event recorded`);
  }

  getEventCount(): number {
    return this.eventCount;
  }
}

class DatabaseObserver implements IObserver<UserEventData> {
  private database: Map<string, any> = new Map();

  update(data: UserEventData): void {
    const key = `user:${data.user.id}`;
    this.database.set(key, data);
    console.log(`💾 Database: User event persisted - ${key}`);
  }

  getDatabase(): Map<string, any> {
    return new Map(this.database);
  }
}

// Order Event Observers
class OrderNotificationObserver implements IObserver<OrderEventData> {
  update(data: OrderEventData): void {
    console.log(`🔔 Notification: Order ${data.orderId} - ${data.type}`);
  }
}

class OrderAnalyticsObserver implements IObserver<OrderEventData> {
  private sales: number = 0;

  update(data: OrderEventData): void {
    if (data.type === 'delivered') {
      this.sales += data.total;
    }
    console.log(`💹 Analytics: Total sales: $${this.sales}`);
  }

  getTotalSales(): number {
    return this.sales;
  }
}

// Typed Observer Hook for more control
interface ObserverOptions<T> {
  name: string;
  onUpdate: (data: T) => void;
  filter?: (data: T) => boolean;
}

class TypedObserver<T> implements IObserver<T> {
  constructor(private options: ObserverOptions<T>) {}

  update(data: T): void {
    if (this.options.filter && !this.options.filter(data)) {
      return;
    }
    console.log(`[${this.options.name}]`);
    this.options.onUpdate(data);
  }
}

// ===== Usage Examples =====

console.log('========== OBSERVER PATTERN - TYPESCRIPT ==========\n');

// Example 1: User Service with Multiple Observers
console.log('--- User Service Observable ---');
const userService = new UserService();

const emailNotifier = new EmailNotifier();
const loggerObserver = new LoggerObserver();
const analyticsObserver = new AnalyticsObserver();
const dbObserver = new DatabaseObserver();

userService.attach(emailNotifier);
userService.attach(loggerObserver);
userService.attach(analyticsObserver);
userService.attach(dbObserver);

console.log('\n📌 Adding users...');
userService.addUser('Alice Johnson', 'alice@example.com');
userService.addUser('Bob Smith', 'bob@example.com');

console.log('\n📌 Updating user...');
userService.updateUser(1, { status: 'premium' });

console.log('\n📌 Removing user...');
userService.removeUser(1);

console.log(`\nTotal observers: ${userService.getObserverCount()}`);
console.log(`Analytics event count: ${analyticsObserver.getEventCount()}`);

// Example 2: Order Service Observable
console.log('\n\n--- Order Service Observable ---');
const orderService = new OrderService();

const orderNotifier = new OrderNotificationObserver();
const orderAnalytics = new OrderAnalyticsObserver();

orderService.attach(orderNotifier);
orderService.attach(orderAnalytics);

console.log('\n📦 Creating order...');
orderService.createOrder('ORD-001', '1', 99.99);

console.log('\n📦 Shipping order...');
orderService.shipOrder('ORD-001', '1', 99.99);

console.log('\n📦 Delivering order...');
orderService.deliverOrder('ORD-001', '1', 99.99);

console.log(`\nTotal sales: $${orderAnalytics.getTotalSales()}`);

// Example 3: Typed Observer with Filter
console.log('\n\n--- Typed Observer with Filter ---');

interface NotificationEvent {
  type: 'info' | 'warning' | 'error';
  message: string;
}

const notificationEmitter = new EventEmitter<NotificationEvent>();

const errorObserver = new TypedObserver<NotificationEvent>({
  name: '❌ Error Handler',
  onUpdate: (data) => {
    console.log(`  Error: ${data.message}`);
  },
  filter: (data) => data.type === 'error'
});

const warningObserver = new TypedObserver<NotificationEvent>({
  name: '⚠️ Warning Handler',
  onUpdate: (data) => {
    console.log(`  Warning: ${data.message}`);
  },
  filter: (data) => data.type === 'warning'
});

notificationEmitter.attach(errorObserver);
notificationEmitter.attach(warningObserver);

console.log('\n📢 Emitting notifications...');
notificationEmitter.notify({ type: 'info', message: 'This is info' });
notificationEmitter.notify({ type: 'warning', message: 'This is a warning' });
notificationEmitter.notify({ type: 'error', message: 'This is an error' });

// Example 4: Event History
console.log('\n\n--- Event History ---');

const userServiceWithHistory = new UserService();
const historyLogger = new LoggerObserver();
userServiceWithHistory.attach(historyLogger);

userServiceWithHistory.addUser('Charlie Brown', 'charlie@example.com');
userServiceWithHistory.addUser('Diana Prince', 'diana@example.com');

const history = userServiceWithHistory.getHistory();
console.log(`\nTotal events in history: ${history.length}`);
console.log('Event types:', history.map(e => e.type).join(', '));

// Example 5: Detaching Observers
console.log('\n\n--- Detaching Observers ---');

const testService = new UserService();
const observer1 = new EmailNotifier();
const observer2 = new LoggerObserver();

testService.attach(observer1);
testService.attach(observer2);
console.log(`Observers before detach: ${testService.getObserverCount()}`);

console.log('\n📌 Adding user (2 observers)...');
testService.addUser('Test User', 'test@example.com');

testService.detach(observer1);
console.log(`Observers after detach: ${testService.getObserverCount()}`);

console.log('\n📌 Adding another user (1 observer)...');
testService.addUser('Another User', 'another@example.com');

export {
  EventEmitter,
  UserService,
  OrderService,
  EmailNotifier,
  LoggerObserver,
  AnalyticsObserver,
  DatabaseObserver,
  OrderNotificationObserver,
  OrderAnalyticsObserver,
  TypedObserver
};

export type { IObserver, ISubject, UserEventData, OrderEventData, User, ObserverOptions };
