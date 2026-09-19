# MongoDB vs MySQL: Comprehensive Comparison

Complete guide comparing MongoDB and MySQL with examples, use cases, and implementation details.

---

## 1. FUNDAMENTAL DIFFERENCES

### Data Model

**MySQL (Relational Database)**
```
Table: users
┌────┬───────────┬──────────────┐
│ id │   name    │    email     │
├────┼───────────┼──────────────┤
│ 1  │ John Doe  │ john@ex.com  │
│ 2  │ Jane Smith│ jane@ex.com  │
└────┴───────────┴──────────────┘

Table: orders
┌────┬────────┬────────────────┐
│ id │ user_id│  total_amount  │
├────┼────────┼────────────────┤
│ 1  │   1    │     $99.99     │
│ 2  │   1    │    $149.99     │
└────┴────────┴────────────────┘
```

**MongoDB (Document Database)**
```javascript
db.users.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "John Doe",
  email: "john@example.com",
  orders: [
    { id: 1, total: 99.99, date: ISODate("2024-01-01") },
    { id: 2, total: 149.99, date: ISODate("2024-01-02") }
  ]
})
```

---

## 2. DETAILED COMPARISON TABLE

| Feature | MySQL | MongoDB |
|---------|-------|---------|
| **Type** | Relational (SQL) | NoSQL (Document) |
| **Data Model** | Tables with rows/columns | JSON-like documents |
| **Schema** | Rigid, predefined | Flexible, dynamic |
| **Scaling** | Vertical primarily | Horizontal (sharding) |
| **Transactions** | ACID compliant | ACID (v4.0+) |
| **Joins** | Yes, multiple | Limited, denormalize instead |
| **Indexing** | Yes | Yes |
| **Query Language** | SQL | MongoDB Query Language |
| **Memory Usage** | Lower | Higher |
| **Best For** | Structured data | Unstructured/semi-structured |
| **Complex Queries** | Excellent | Moderate |
| **Real-time Analytics** | Good | Excellent |

---

## 3. SETUP & CONNECTION

### MySQL Setup

```javascript
// Node.js - MySQL Connection
const mysql = require('mysql2/promise');

// Connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'myapp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
```

### MongoDB Setup

```javascript
// Node.js - MongoDB Connection
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    const db = client.db('myapp');
    return db;
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

module.exports = connectDB;
```

---

## 4. CREATE OPERATIONS

### MySQL - CREATE

```javascript
// CREATE TABLE
const createUserTable = `
  CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    age INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

// INSERT
const insertUser = async (name, email, age) => {
  const connection = await pool.getConnection();
  try {
    const query = 'INSERT INTO users (name, email, age) VALUES (?, ?, ?)';
    const [result] = await connection.execute(query, [name, email, age]);
    console.log('User created:', result.insertId);
    return result.insertId;
  } finally {
    connection.release();
  }
};

// Usage
await insertUser('John Doe', 'john@example.com', 30);
```

### MongoDB - CREATE

```javascript
// CREATE Document (automatic collection creation)
const insertUser = async (db, userData) => {
  const result = await db.collection('users').insertOne({
    name: userData.name,
    email: userData.email,
    age: userData.age,
    created_at: new Date()
  });
  
  console.log('User created:', result.insertedId);
  return result.insertedId;
};

// Usage
const db = await connectDB();
await insertUser(db, {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});

// Bulk insert
const insertMultipleUsers = async (db, users) => {
  const result = await db.collection('users').insertMany(users);
  console.log(`${result.insertedCount} users created`);
  return result.insertedIds;
};
```

---

## 5. READ OPERATIONS

### MySQL - READ

```javascript
// SELECT all
const getAllUsers = async () => {
  const connection = await pool.getConnection();
  try {
    const query = 'SELECT id, name, email, age FROM users';
    const [rows] = await connection.execute(query);
    return rows;
  } finally {
    connection.release();
  }
};

// SELECT with WHERE
const getUserById = async (id) => {
  const connection = await pool.getConnection();
  try {
    const query = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await connection.execute(query, [id]);
    return rows[0];
  } finally {
    connection.release();
  }
};

// SELECT with JOIN
const getUserWithOrders = async (userId) => {
  const connection = await pool.getConnection();
  try {
    const query = `
      SELECT u.id, u.name, u.email, o.id as order_id, o.total_amount
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.id = ?
    `;
    const [rows] = await connection.execute(query, [userId]);
    return rows;
  } finally {
    connection.release();
  }
};

// SELECT with filters
const searchUsers = async (name, email) => {
  const connection = await pool.getConnection();
  try {
    let query = 'SELECT * FROM users WHERE 1=1';
    const params = [];
    
    if (name) {
      query += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }
    if (email) {
      query += ' AND email LIKE ?';
      params.push(`%${email}%`);
    }
    
    const [rows] = await connection.execute(query, params);
    return rows;
  } finally {
    connection.release();
  }
};

// Usage
const users = await getAllUsers();
const user = await getUserById(1);
const userOrders = await getUserWithOrders(1);
const search = await searchUsers('John', null);
```

### MongoDB - READ

```javascript
// Find all
const getAllUsers = async (db) => {
  const users = await db.collection('users').find({}).toArray();
  return users;
};

// Find by ID
const getUserById = async (db, userId) => {
  const { ObjectId } = require('mongodb');
  const user = await db.collection('users').findOne({
    _id: new ObjectId(userId)
  });
  return user;
};

// Find with filters
const findUsers = async (db, filters) => {
  const users = await db.collection('users').find(filters).toArray();
  return users;
};

// Complex query
const searchUsers = async (db, name, email) => {
  const query = {};
  
  if (name) {
    query.name = { $regex: name, $options: 'i' }; // case-insensitive
  }
  if (email) {
    query.email = { $regex: email, $options: 'i' };
  }
  
  const users = await db.collection('users').find(query).toArray();
  return users;
};

// Aggregation (complex queries)
const getAggregatedData = async (db) => {
  const result = await db.collection('users').aggregate([
    { $match: { age: { $gte: 30 } } },
    { $group: { _id: null, avgAge: { $avg: '$age' }, count: { $sum: 1 } } }
  ]).toArray();
  return result;
};

// Usage
const users = await getAllUsers(db);
const user = await getUserById(db, '507f1f77bcf86cd799439011');
const filtered = await findUsers(db, { age: { $gt: 25 } });
const search = await searchUsers(db, 'John', null);
const stats = await getAggregatedData(db);
```

---

## 6. UPDATE OPERATIONS

### MySQL - UPDATE

```javascript
// UPDATE single field
const updateUserEmail = async (userId, newEmail) => {
  const connection = await pool.getConnection();
  try {
    const query = 'UPDATE users SET email = ? WHERE id = ?';
    const [result] = await connection.execute(query, [newEmail, userId]);
    console.log(`Updated ${result.affectedRows} rows`);
    return result.affectedRows;
  } finally {
    connection.release();
  }
};

// UPDATE multiple fields
const updateUser = async (userId, updates) => {
  const connection = await pool.getConnection();
  try {
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), userId];
    const query = `UPDATE users SET ${fields} WHERE id = ?`;
    
    const [result] = await connection.execute(query, values);
    return result.affectedRows;
  } finally {
    connection.release();
  }
};

// UPDATE with condition
const incrementAge = async (userIds) => {
  const connection = await pool.getConnection();
  try {
    const placeholders = userIds.map(() => '?').join(',');
    const query = `UPDATE users SET age = age + 1 WHERE id IN (${placeholders})`;
    const [result] = await connection.execute(query, userIds);
    return result.affectedRows;
  } finally {
    connection.release();
  }
};

// Usage
await updateUserEmail(1, 'newemail@example.com');
await updateUser(1, { name: 'Jane Doe', age: 31 });
await incrementAge([1, 2, 3]);
```

### MongoDB - UPDATE

```javascript
// Update single field
const updateUserEmail = async (db, userId, newEmail) => {
  const { ObjectId } = require('mongodb');
  const result = await db.collection('users').updateOne(
    { _id: new ObjectId(userId) },
    { $set: { email: newEmail } }
  );
  console.log(`Modified ${result.modifiedCount} documents`);
  return result.modifiedCount;
};

// Update multiple fields
const updateUser = async (db, userId, updates) => {
  const { ObjectId } = require('mongodb');
  const result = await db.collection('users').updateOne(
    { _id: new ObjectId(userId) },
    { $set: updates }
  );
  return result.modifiedCount;
};

// Update multiple documents
const incrementAge = async (db, userIds) => {
  const { ObjectId } = require('mongodb');
  const result = await db.collection('users').updateMany(
    { _id: { $in: userIds.map(id => new ObjectId(id)) } },
    { $inc: { age: 1 } }
  );
  return result.modifiedCount;
};

// Upsert (update or insert)
const upsertUser = async (db, email, userData) => {
  const result = await db.collection('users').updateOne(
    { email: email },
    { $set: userData },
    { upsert: true }
  );
  return result;
};

// Usage
await updateUserEmail(db, '507f1f77bcf86cd799439011', 'new@example.com');
await updateUser(db, '507f1f77bcf86cd799439011', { name: 'Jane', age: 31 });
await incrementAge(db, ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']);
await upsertUser(db, 'john@example.com', { name: 'John', age: 30 });
```

---

## 7. DELETE OPERATIONS

### MySQL - DELETE

```javascript
// DELETE single record
const deleteUser = async (userId) => {
  const connection = await pool.getConnection();
  try {
    const query = 'DELETE FROM users WHERE id = ?';
    const [result] = await connection.execute(query, [userId]);
    console.log(`Deleted ${result.affectedRows} rows`);
    return result.affectedRows;
  } finally {
    connection.release();
  }
};

// DELETE multiple records
const deleteUsers = async (userIds) => {
  const connection = await pool.getConnection();
  try {
    const placeholders = userIds.map(() => '?').join(',');
    const query = `DELETE FROM users WHERE id IN (${placeholders})`;
    const [result] = await connection.execute(query, userIds);
    return result.affectedRows;
  } finally {
    connection.release();
  }
};

// DELETE with condition
const deleteInactiveUsers = async (daysInactive) => {
  const connection = await pool.getConnection();
  try {
    const query = `
      DELETE FROM users 
      WHERE last_login < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
    const [result] = await connection.execute(query, [daysInactive]);
    return result.affectedRows;
  } finally {
    connection.release();
  }
};

// Usage
await deleteUser(1);
await deleteUsers([1, 2, 3]);
await deleteInactiveUsers(30); // Delete users inactive for 30 days
```

### MongoDB - DELETE

```javascript
// Delete single document
const deleteUser = async (db, userId) => {
  const { ObjectId } = require('mongodb');
  const result = await db.collection('users').deleteOne({
    _id: new ObjectId(userId)
  });
  console.log(`Deleted ${result.deletedCount} documents`);
  return result.deletedCount;
};

// Delete multiple documents
const deleteUsers = async (db, userIds) => {
  const { ObjectId } = require('mongodb');
  const result = await db.collection('users').deleteMany({
    _id: { $in: userIds.map(id => new ObjectId(id)) }
  });
  return result.deletedCount;
};

// Delete with condition
const deleteInactiveUsers = async (db, daysInactive) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysInactive);
  
  const result = await db.collection('users').deleteMany({
    last_login: { $lt: cutoffDate }
  });
  return result.deletedCount;
};

// Usage
await deleteUser(db, '507f1f77bcf86cd799439011');
await deleteUsers(db, ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']);
await deleteInactiveUsers(db, 30);
```

---

## 8. SCHEMA DESIGN

### MySQL Schema Design

```sql
-- Users Table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile_picture_url VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'delivered') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order Items Table
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Products Table
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

### MongoDB Schema Design

```javascript
// Users Collection
db.users.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439011"),
  username: "johndoe",
  email: "john@example.com",
  password_hash: "hashed_password",
  profile: {
    picture_url: "https://...",
    bio: "Software developer"
  },
  created_at: ISODate("2024-01-01"),
  updated_at: ISODate("2024-01-15"),
  
  // Embedded orders (denormalization)
  orders: [
    {
      order_id: ObjectId("507f1f77bcf86cd799439012"),
      order_number: "ORD-2024-001",
      total_amount: 299.99,
      status: "delivered",
      items: [
        {
          product_id: ObjectId("507f1f77bcf86cd799439013"),
          product_name: "Laptop",
          quantity: 1,
          unit_price: 999.99
        },
        {
          product_id: ObjectId("507f1f77bcf86cd799439014"),
          product_name: "Mouse",
          quantity: 2,
          unit_price: 29.99
        }
      ],
      created_at: ISODate("2024-01-10")
    }
  ]
});

// Products Collection
db.products.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439013"),
  name: "Laptop",
  description: "High-performance laptop",
  price: 999.99,
  stock_quantity: 50,
  created_at: ISODate("2024-01-01")
});

// Create Indexes
db.users.createIndex({ email: 1 });
db.users.createIndex({ username: 1 });
db.products.createIndex({ name: 1 });
```

---

## 9. TRANSACTIONS

### MySQL Transactions

```javascript
// ACID Transactions
const transferFunds = async (fromUserId, toUserId, amount) => {
  const connection = await pool.getConnection();
  
  try {
    // Start transaction
    await connection.execute('START TRANSACTION');
    
    // Deduct from first user
    await connection.execute(
      'UPDATE accounts SET balance = balance - ? WHERE user_id = ?',
      [amount, fromUserId]
    );
    
    // Add to second user
    await connection.execute(
      'UPDATE accounts SET balance = balance + ? WHERE user_id = ?',
      [amount, toUserId]
    );
    
    // Commit transaction
    await connection.execute('COMMIT');
    console.log('Transaction committed');
    
  } catch (error) {
    // Rollback on error
    await connection.execute('ROLLBACK');
    console.error('Transaction rolled back:', error);
    throw error;
  } finally {
    connection.release();
  }
};
```

### MongoDB Transactions

```javascript
// Multi-document ACID Transactions (MongoDB 4.0+)
const transferFunds = async (db, fromUserId, toUserId, amount) => {
  const session = db.getMongo().startSession();
  
  try {
    await session.withTransaction(async () => {
      // Deduct from first user
      await db.collection('accounts').updateOne(
        { user_id: fromUserId },
        { $inc: { balance: -amount } },
        { session }
      );
      
      // Add to second user
      await db.collection('accounts').updateOne(
        { user_id: toUserId },
        { $inc: { balance: amount } },
        { session }
      );
      
      console.log('Transaction completed');
    });
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  } finally {
    await session.endSession();
  }
};
```

---

## 10. REAL-WORLD EXAMPLES

### Example 1: E-commerce Product Catalog

**MySQL Approach (Normalized)**
```javascript
// Get product with reviews
const getProductWithReviews = async (productId) => {
  const connection = await pool.getConnection();
  try {
    const query = `
      SELECT 
        p.id, p.name, p.description, p.price,
        r.id as review_id, r.rating, r.comment, r.user_name
      FROM products p
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.id = ?
      ORDER BY r.created_at DESC
    `;
    const [rows] = await connection.execute(query, [productId]);
    
    // Restructure rows into product with reviews
    const product = {
      id: rows[0].id,
      name: rows[0].name,
      description: rows[0].description,
      price: rows[0].price,
      reviews: rows.filter(r => r.review_id).map(r => ({
        id: r.review_id,
        rating: r.rating,
        comment: r.comment,
        userName: r.user_name
      }))
    };
    
    return product;
  } finally {
    connection.release();
  }
};
```

**MongoDB Approach (Denormalized)**
```javascript
// Get product with reviews
const getProductWithReviews = async (db, productId) => {
  const { ObjectId } = require('mongodb');
  
  const product = await db.collection('products').findOne({
    _id: new ObjectId(productId)
  });
  
  // Reviews already embedded
  return product;
  
  // Single query, no restructuring needed!
};

// Add review to product
const addProductReview = async (db, productId, review) => {
  const { ObjectId } = require('mongodb');
  
  const result = await db.collection('products').updateOne(
    { _id: new ObjectId(productId) },
    {
      $push: {
        reviews: {
          id: new ObjectId(),
          rating: review.rating,
          comment: review.comment,
          userName: review.userName,
          created_at: new Date()
        }
      }
    }
  );
  
  return result.modifiedCount;
};
```

### Example 2: User Profiles with Settings

**MySQL Approach**
```javascript
// Requires multiple tables and joins
const getUserProfile = async (userId) => {
  const connection = await pool.getConnection();
  try {
    // Query users table
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    // Query user_settings table
    const [settings] = await connection.execute(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [userId]
    );
    
    // Query user_preferences table
    const [preferences] = await connection.execute(
      'SELECT * FROM user_preferences WHERE user_id = ?',
      [userId]
    );
    
    return {
      ...users[0],
      settings: settings[0],
      preferences: preferences[0]
    };
  } finally {
    connection.release();
  }
};
```

**MongoDB Approach**
```javascript
// Single document with all data
const getUserProfile = async (db, userId) => {
  const { ObjectId } = require('mongodb');
  
  const user = await db.collection('users').findOne({
    _id: new ObjectId(userId)
  });
  
  // All data in one document
  return user;
};

// Update multiple settings in one operation
const updateUserProfile = async (db, userId, updates) => {
  const { ObjectId } = require('mongodb');
  
  const result = await db.collection('users').updateOne(
    { _id: new ObjectId(userId) },
    { $set: updates } // Can update settings, preferences, etc.
  );
  
  return result.modifiedCount;
};
```

---

## 11. PERFORMANCE COMPARISON

### MySQL Performance Characteristics

```javascript
// Fast for:
// - Complex queries with multiple JOINs
// - Structured, normalized data
// - ACID transactions
// - Data consistency

// Slow for:
// - Aggregations on large datasets
// - Unstructured data
// - Horizontal scaling
// - Real-time analytics on millions of records

// Example: Analytics query
const getMonthlyRevenue = async () => {
  const connection = await pool.getConnection();
  try {
    const query = `
      SELECT 
        DATE_TRUNC('month', o.created_at) as month,
        SUM(o.total_amount) as revenue,
        COUNT(DISTINCT o.user_id) as unique_customers
      FROM orders o
      WHERE o.status = 'delivered'
      GROUP BY DATE_TRUNC('month', o.created_at)
      ORDER BY month DESC
      LIMIT 12
    `;
    const [rows] = await connection.execute(query);
    return rows;
  } finally {
    connection.release();
  }
};
```

### MongoDB Performance Characteristics

```javascript
// Fast for:
// - Unstructured/semi-structured data
// - Large-scale horizontal scaling
// - Real-time analytics and aggregations
// - Rapid development with flexible schema

// Slower for:
// - Multi-document transactions
// - Highly normalized data relationships
// - Some complex query patterns

// Example: Aggregation pipeline (fast)
const getMonthlyRevenue = async (db) => {
  const result = await db.collection('orders').aggregate([
    {
      $match: { status: 'delivered' }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$created_at' } },
        revenue: { $sum: '$total_amount' },
        uniqueCustomers: { $addToSet: '$user_id' }
      }
    },
    {
      $project: {
        month: '$_id',
        revenue: 1,
        uniqueCustomers: { $size: '$uniqueCustomers' }
      }
    },
    {
      $sort: { month: -1 }
    },
    {
      $limit: 12
    }
  ]).toArray();
  
  return result;
};
```

---

## 12. WHEN TO USE EACH

### Use MySQL When:

✅ **Data Structure is Well-Defined**
```
- User management systems
- E-commerce with structured products
- Financial transactions
- Inventory management
```

✅ **Complex Relationships**
```
- Multiple foreign keys
- Heavy JOINs needed
- Normalized data critical
```

✅ **ACID Transactions Required**
```
- Banking systems
- Payment processing
- Critical business operations
```

✅ **Complex Queries**
```
- Advanced analytics
- Reports with multiple joins
- Complex filtering and grouping
```

### Use MongoDB When:

✅ **Data is Unstructured/Flexible**
```
- Content management systems
- Social media platforms
- Logging and event tracking
- User-generated content
```

✅ **Rapid Development**
```
- Startups with changing requirements
- Prototyping and MVPs
- Agile development cycles
```

✅ **Horizontal Scaling Needed**
```
- High-traffic applications
- Distributed systems
- Real-time data processing
```

✅ **Real-time Analytics**
```
- Dashboard data
- Real-time monitoring
- Time-series data
- Event streams
```

---

## 13. HYBRID APPROACH

```javascript
// Use BOTH databases together!
class DataService {
  constructor(mysqlPool, mongoDb) {
    this.mysql = mysqlPool;
    this.mongo = mongoDb;
  }

  // Store structured user data in MySQL
  async createUser(userData) {
    const connection = await this.mysql.getConnection();
    try {
      const query = 'INSERT INTO users (name, email) VALUES (?, ?)';
      const [result] = await connection.execute(query, [
        userData.name,
        userData.email
      ]);
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  // Store activity logs in MongoDB
  async logUserActivity(userId, activity) {
    const result = await this.mongo.collection('activity_logs').insertOne({
      user_id: userId,
      action: activity.action,
      timestamp: new Date(),
      metadata: activity.metadata,
      ip_address: activity.ip
    });
    return result.insertedId;
  }

  // Get user with recent activity
  async getUserWithActivity(userId) {
    // Fetch from MySQL
    const connection = await this.mysql.getConnection();
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    connection.release();

    // Fetch from MongoDB
    const activities = await this.mongo.collection('activity_logs')
      .find({ user_id: userId })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    return {
      user: users[0],
      recentActivity: activities
    };
  }
}

// Usage
const service = new DataService(mysqlPool, mongoDb);

// Create user (MySQL)
const userId = await service.createUser({ 
  name: 'John', 
  email: 'john@example.com' 
});

// Log activities (MongoDB)
await service.logUserActivity(userId, {
  action: 'login',
  metadata: { browser: 'Chrome' },
  ip: '192.168.1.1'
});

// Get complete user data
const userProfile = await service.getUserWithActivity(userId);
```

---

## 14. MIGRATION BETWEEN THEM

### MySQL to MongoDB

```javascript
const migrateMySQLtoMongo = async (mysqlPool, mongoDb) => {
  const connection = await mysqlPool.getConnection();
  
  try {
    // Read from MySQL
    const [users] = await connection.execute('SELECT * FROM users');
    const [orders] = await connection.execute('SELECT * FROM orders');
    
    // Restructure data
    const mongoUsers = users.map(user => {
      const userOrders = orders.filter(o => o.user_id === user.id);
      return {
        _id: user.id,
        name: user.name,
        email: user.email,
        orders: userOrders.map(o => ({
          id: o.id,
          total_amount: o.total_amount,
          created_at: o.created_at
        }))
      };
    });
    
    // Write to MongoDB
    const result = await mongoDb.collection('users').insertMany(mongoUsers);
    console.log(`Migrated ${result.insertedCount} users`);
    
  } finally {
    connection.release();
  }
};
```

### MongoDB to MySQL

```javascript
const migrateMongoToMySQL = async (mongoDb, mysqlPool) => {
  const users = await mongoDb.collection('users').find({}).toArray();
  const connection = await mysqlPool.getConnection();
  
  try {
    for (const user of users) {
      // Insert user
      const [userResult] = await connection.execute(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        [user.name, user.email]
      );
      
      const userId = userResult.insertId;
      
      // Insert orders
      if (user.orders && user.orders.length > 0) {
        for (const order of user.orders) {
          await connection.execute(
            'INSERT INTO orders (user_id, total_amount, created_at) VALUES (?, ?, ?)',
            [userId, order.total_amount, order.created_at]
          );
        }
      }
    }
    
    console.log(`Migrated ${users.length} users`);
  } finally {
    connection.release();
  }
};
```

---

## 15. DECISION MATRIX

```
CHOOSE MYSQL IF:
├─ Data relationships are important
├─ You need ACID transactions
├─ Query patterns are complex
├─ Data consistency is critical
├─ Team is experienced with SQL
└─ Data volumes are moderate

CHOOSE MONGODB IF:
├─ Data structure is flexible
├─ You need to scale horizontally
├─ Development speed is priority
├─ Data is hierarchical/nested
├─ Real-time analytics needed
└─ Data volumes are very large
```

---

## Summary Comparison

| Scenario | MySQL | MongoDB |
|----------|-------|---------|
| Banking App | ✅ | ❌ |
| CMS | ✅ | ✅ |
| Social Media | ❌ | ✅ |
| Analytics | ✅ | ✅ |
| Microservices | ✅ | ✅ |
| IoT Sensor Data | ❌ | ✅ |
| E-commerce (Transactional) | ✅ | ❌ |
| Content Platform | ✅ | ✅ |
| Real-time Dashboard | ❌ | ✅ |
| Legacy System | ✅ | ❌ |

Both databases are excellent. **Choose based on your specific requirements**, not hype!
