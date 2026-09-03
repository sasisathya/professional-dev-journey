// Observer Pattern - Defines a one-to-many dependency where when one object changes state, all dependents are notified
// Use case: Event systems, pub-sub systems, real-time notifications

class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
    console.log(`Observer registered for event: ${eventName}`);
  }

  off(eventName, callback) {
    if (!this.events[eventName]) return;
    this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
    console.log(`Observer unregistered from event: ${eventName}`);
  }

  emit(eventName, data) {
    if (!this.events[eventName]) return;
    console.log(`\nEmitting event: ${eventName}`);
    this.events[eventName].forEach(callback => {
      callback(data);
    });
  }

  once(eventName, callback) {
    const onceWrapper = (data) => {
      callback(data);
      this.off(eventName, onceWrapper);
    };
    this.on(eventName, onceWrapper);
  }

  getListenerCount(eventName) {
    return this.events[eventName]?.length || 0;
  }
}

class UserService extends EventEmitter {
  constructor() {
    super();
    this.users = [];
  }

  addUser(user) {
    this.users.push(user);
    this.emit('user:added', { user, totalUsers: this.users.length });
  }

  removeUser(userId) {
    const user = this.users.find(u => u.id === userId);
    this.users = this.users.filter(u => u.id !== userId);
    this.emit('user:removed', { user, totalUsers: this.users.length });
  }

  updateUser(userId, updates) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      Object.assign(user, updates);
      this.emit('user:updated', { user, changes: updates });
    }
  }

  getUsers() {
    return this.users;
  }
}

// Usage Example
const userService = new UserService();

// Observer 1: Email notification
const emailNotifier = (data) => {
  console.log(`📧 Email sent to admin: New user registered - ${data.user.name}`);
};

// Observer 2: Log service
const logger = (data) => {
  console.log(`📝 Log: User added event - ID: ${data.user.id}, Total users: ${data.totalUsers}`);
};

// Observer 3: Analytics
const analyticsTracker = (data) => {
  console.log(`📊 Analytics: Tracked user addition - ${data.user.name} at ${new Date().toISOString()}`);
};

// Subscribe to user:added event
userService.on('user:added', emailNotifier);
userService.on('user:added', logger);
userService.on('user:added', analyticsTracker);

// Subscribe to user:updated event
userService.on('user:updated', (data) => {
  console.log(`🔔 Notification: User ${data.user.name} updated with changes:`, data.changes);
});

// Subscribe to user:removed event (one-time only)
userService.once('user:removed', (data) => {
  console.log(`🗑️  One-time notification: User ${data.user.name} removed. Total users: ${data.totalUsers}`);
});

console.log('=== Adding Users ===');
userService.addUser({ id: 1, name: 'Alice Johnson' });
userService.addUser({ id: 2, name: 'Bob Smith' });

console.log('\n=== Updating User ===');
userService.updateUser(1, { email: 'alice@example.com', status: 'active' });

console.log('\n=== Removing User ===');
userService.removeUser(1);

console.log('\n=== Attempting to remove user again ===');
userService.removeUser(2); // One-time listener won't fire this time

console.log('\n=== Current Users ===');
console.log(userService.getUsers());

console.log('\n=== Listener Count ===');
console.log(`Listeners on 'user:added':`, userService.getListenerCount('user:added'));
console.log(`Listeners on 'user:removed':`, userService.getListenerCount('user:removed'));

// Unsubscribe
console.log('\n=== Unsubscribing Email Notifier ===');
userService.off('user:added', emailNotifier);
userService.addUser({ id: 3, name: 'Charlie Brown' }); // Email notifier won't fire
