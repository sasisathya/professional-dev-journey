// Singleton Pattern - Ensures a class has only one instance and provides a global point of access to it
// Use case: Database connections, configuration managers, logging services

class DatabaseConnection {
  constructor() {
    if (DatabaseConnection.instance) {
      return DatabaseConnection.instance;
    }
    this.connection = null;
    this.isConnected = false;
    DatabaseConnection.instance = this;
  }

  connect() {
    if (this.isConnected) {
      console.log('Already connected to database');
      return this.connection;
    }
    this.connection = {
      id: Math.random().toString(36).substr(2, 9),
      host: 'localhost',
      port: 5432,
      database: 'myapp',
      timestamp: new Date().toISOString()
    };
    this.isConnected = true;
    console.log('Database connected:', this.connection.id);
    return this.connection;
  }

  disconnect() {
    if (!this.isConnected) {
      console.log('Not connected to database');
      return;
    }
    console.log('Database disconnected:', this.connection.id);
    this.connection = null;
    this.isConnected = false;
  }

  query(sql) {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }
    return {
      connectionId: this.connection.id,
      query: sql,
      result: 'Query executed successfully'
    };
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      connectionId: this.connection?.id || null
    };
  }
}

// Usage Example
const db1 = new DatabaseConnection();
const db2 = new DatabaseConnection();

console.log('db1 and db2 are same instance:', db1 === db2); // true

db1.connect();
console.log('db1 status:', db1.getStatus());
console.log('db2 status:', db2.getStatus()); // Same connection

console.log('Query result:', db1.query('SELECT * FROM users'));
console.log('Query from db2:', db2.query('SELECT * FROM products'));

db2.disconnect();
console.log('After disconnect - db1 status:', db1.getStatus());
