// Dependency Injection Pattern - Provides objects with their dependencies rather than constructing them internally
// Use case: Making code testable, loosely coupling components, configurable applications

class EmailService {
  send(to, subject, body) {
    console.log(`📧 Email sent to ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body: ${body}`);
    return { success: true, messageId: `email-${Date.now()}` };
  }
}

class SMSService {
  send(phoneNumber, message) {
    console.log(`📱 SMS sent to ${phoneNumber}`);
    console.log(`   Message: ${message}`);
    return { success: true, messageId: `sms-${Date.now()}` };
  }
}

class SlackService {
  send(channel, message) {
    console.log(`💬 Slack message sent to ${channel}`);
    console.log(`   Message: ${message}`);
    return { success: true, messageId: `slack-${Date.now()}` };
  }
}

class DatabaseService {
  save(collection, data) {
    console.log(`💾 Saved to ${collection}:`, JSON.stringify(data));
    return { id: Math.random().toString(36).substr(2, 9), ...data };
  }

  findById(collection, id) {
    console.log(`🔍 Found in ${collection} with id: ${id}`);
    return { id, data: 'sample data' };
  }
}

class LoggerService {
  info(message) {
    console.log(`ℹ️  [INFO] ${message}`);
  }

  error(message, error) {
    console.log(`❌ [ERROR] ${message}`, error);
  }

  warn(message) {
    console.log(`⚠️  [WARN] ${message}`);
  }

  debug(message) {
    console.log(`🐛 [DEBUG] ${message}`);
  }
}

class UserService {
  constructor(database, email, sms, logger) {
    this.database = database;
    this.email = email;
    this.sms = sms;
    this.logger = logger;
  }

  createUser(userData) {
    try {
      this.logger.info(`Creating user: ${userData.name}`);

      const savedUser = this.database.save('users', {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        createdAt: new Date().toISOString()
      });

      this.logger.info(`User created successfully with ID: ${savedUser.id}`);

      this.email.send(userData.email, 'Welcome!', `Welcome ${userData.name}!`);
      this.sms.send(userData.phone, `Hi ${userData.name}, welcome to our service!`);

      return savedUser;
    } catch (error) {
      this.logger.error('Failed to create user', error);
      throw error;
    }
  }

  getUserNotifications(userId) {
    this.logger.info(`Fetching notifications for user ${userId}`);
    const user = this.database.findById('users', userId);
    return user;
  }
}

class OrderService {
  constructor(database, email, logger) {
    this.database = database;
    this.email = email;
    this.logger = logger;
  }

  createOrder(userId, items, totalPrice) {
    try {
      this.logger.info(`Creating order for user ${userId}`);

      const order = this.database.save('orders', {
        userId,
        items,
        totalPrice,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      this.logger.info(`Order created: ${order.id}`);

      const user = this.database.findById('users', userId);
      this.email.send(user.email, 'Order Confirmation', `Your order ${order.id} has been received.`);

      return order;
    } catch (error) {
      this.logger.error('Failed to create order', error);
      throw error;
    }
  }

  updateOrderStatus(orderId, status) {
    this.logger.info(`Updating order ${orderId} status to ${status}`);
    return { orderId, status, updated: true };
  }
}

class NotificationService {
  constructor(email, sms, slack, logger) {
    this.email = email;
    this.sms = sms;
    this.slack = slack;
    this.logger = logger;
  }

  notifyUser(userId, message, channels = ['email']) {
    this.logger.info(`Sending notification to user ${userId}`);

    channels.forEach(channel => {
      switch (channel) {
        case 'email':
          this.email.send('user@example.com', 'Notification', message);
          break;
        case 'sms':
          this.sms.send('+1234567890', message);
          break;
        case 'slack':
          this.slack.send('#notifications', message);
          break;
        default:
          this.logger.warn(`Unknown notification channel: ${channel}`);
      }
    });
  }
}

// Dependency Container / IoC Container
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
    console.log(`✅ Service registered: ${name} (Singleton: ${isSingleton})`);
  }

  resolve(name) {
    const service = this.services[name];
    if (!service) {
      throw new Error(`Service not found: ${name}`);
    }

    if (service.isSingleton && service.instance) {
      return service.instance;
    }

    const instance = service.definition(this);

    if (service.isSingleton) {
      service.instance = instance;
    }

    return instance;
  }

  get(name) {
    return this.resolve(name);
  }
}

// Usage Example
console.log('========== SETTING UP DEPENDENCY INJECTION CONTAINER ==========\n');

const container = new Container();

// Register all services
container.register('logger', () => new LoggerService());
container.register('database', () => new DatabaseService());
container.register('email', () => new EmailService());
container.register('sms', () => new SMSService());
container.register('slack', () => new SlackService());

container.register('userService', (c) =>
  new UserService(
    c.get('database'),
    c.get('email'),
    c.get('sms'),
    c.get('logger')
  )
);

container.register('orderService', (c) =>
  new OrderService(
    c.get('database'),
    c.get('email'),
    c.get('logger')
  )
);

container.register('notificationService', (c) =>
  new NotificationService(
    c.get('email'),
    c.get('sms'),
    c.get('slack'),
    c.get('logger')
  )
);

console.log('\n========== USING DEPENDENCY INJECTION ==========\n');

// Resolve services from container
const userService = container.get('userService');
const orderService = container.get('orderService');
const notificationService = container.get('notificationService');

console.log('\n--- Creating a New User ---');
const newUser = userService.createUser({
  name: 'Alice Johnson',
  email: 'alice@example.com',
  phone: '+1-555-0123'
});

console.log('\n--- Creating an Order ---');
const order = orderService.createOrder(newUser.id,
  [
    { id: 1, name: 'Laptop', price: 999 },
    { id: 2, name: 'Mouse', price: 29 }
  ],
  1028
);

console.log('\n--- Sending Multi-Channel Notification ---');
notificationService.notifyUser(newUser.id, 'Your order has been shipped!', ['email', 'sms', 'slack']);

console.log('\n--- Updating Order Status ---');
orderService.updateOrderStatus(order.id, 'shipped');

console.log('\n--- Getting User Notifications ---');
userService.getUserNotifications(newUser.id);

// Testing with mock services
console.log('\n\n========== TESTING WITH MOCK SERVICES ==========\n');

class MockEmailService {
  send(to, subject, body) {
    console.log(`📧 [MOCK] Email would be sent to ${to}`);
    return { success: true, messageId: `mock-${Date.now()}` };
  }
}

class MockDatabaseService {
  save(collection, data) {
    console.log(`💾 [MOCK] Would save to ${collection}:`, JSON.stringify(data));
    return { id: 'mock-id-123', ...data };
  }

  findById(collection, id) {
    console.log(`🔍 [MOCK] Would find in ${collection} with id: ${id}`);
    return { id, email: 'mock@example.com' };
  }
}

console.log('--- Registering Mock Services ---');
const testContainer = new Container();
testContainer.register('logger', () => new LoggerService());
testContainer.register('database', () => new MockDatabaseService());
testContainer.register('email', () => new MockEmailService());
testContainer.register('sms', () => new SMSService());
testContainer.register('slack', () => new SlackService());

testContainer.register('userService', (c) =>
  new UserService(
    c.get('database'),
    c.get('email'),
    c.get('sms'),
    c.get('logger')
  )
);

const testUserService = testContainer.get('userService');

console.log('\n--- Creating User with Mock Services ---');
testUserService.createUser({
  name: 'Bob Smith',
  email: 'bob@example.com',
  phone: '+1-555-0456'
});

// Verify singleton behavior
console.log('\n\n========== VERIFYING SINGLETON BEHAVIOR ==========\n');

const logger1 = container.get('logger');
const logger2 = container.get('logger');
const database1 = container.get('database');
const database2 = container.get('database');

console.log('Logger instances are same:', logger1 === logger2);
console.log('Database instances are same:', database1 === database2);
