# MongoDB - Professional Interview Guide

## Table of Contents
1. [NoSQL & MongoDB Basics](#nosql--mongodb-basics)
2. [CRUD Operations](#crud-operations)
3. [Data Modeling](#data-modeling)
4. [Indexing](#indexing)
5. [Aggregation Framework](#aggregation-framework)
6. [Replication & Sharding](#replication--sharding)
7. [Performance & Optimization](#performance--optimization)
8. [Security & Best Practices](#security--best-practices)

---

## NoSQL & MongoDB Basics

### What is MongoDB?
**MongoDB** is a NoSQL, document-oriented database. Stores data in flexible, JSON-like documents (BSON - Binary JSON). Schema-less, horizontally scalable, high performance for read/write operations.

**Key features:**
- **Document-oriented:** Data stored as documents (JSON-like)
- **Schema-less:** No fixed schema, flexible structure
- **Horizontal scaling:** Sharding for distributed data
- **Rich query language:** Ad-hoc queries, indexing, aggregation
- **High availability:** Replication with automatic failover

**Key takeaway:** NoSQL document database. Flexible schema, horizontal scaling.

---

### SQL vs NoSQL (MongoDB)
**SQL (Relational):**
- Fixed schema (tables, rows, columns)
- ACID transactions
- Vertical scaling
- Joins for related data
- Examples: MySQL, PostgreSQL

**NoSQL (MongoDB):**
- Flexible schema (collections, documents)
- BASE (Basically Available, Soft state, Eventually consistent)
- Horizontal scaling (sharding)
- Embedded documents/arrays (less joins)
- Examples: MongoDB, Cassandra, DynamoDB

**When to use MongoDB:**
- Rapid development (changing requirements)
- Unstructured/semi-structured data
- Horizontal scaling needed
- High write throughput
- Real-time analytics

**Key takeaway:** MongoDB = flexible schema, horizontal scaling. SQL = fixed schema, ACID.

---

### Document Structure (BSON)
**BSON (Binary JSON):** MongoDB's internal format. Extends JSON with additional types (Date, ObjectId, Binary).

**Document example:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "Alice",
  "age": 30,
  "email": "alice@example.com",
  "address": {
    "city": "New York",
    "zip": "10001"
  },
  "hobbies": ["reading", "coding"],
  "created_at": ISODate("2025-01-15T10:30:00Z")
}
```

**Key points:**
- `_id`: Unique identifier (auto-generated ObjectId if not provided)
- Nested documents (embedded)
- Arrays
- Rich data types (Date, ObjectId, etc.)

**Key takeaway:** BSON = JSON + additional types. Flexible structure.

---

### Collections and Databases
**Database:** Container for collections (like database in SQL).

**Collection:** Group of documents (like table in SQL). No fixed schema - documents in same collection can have different fields.

**Namespace:** `database.collection` (e.g., `myapp.users`)

```javascript
use myapp // Switch to database (creates if doesn't exist)
db.users.insertOne({name: "Alice"}) // Creates 'users' collection
```

**Key takeaway:** Database → Collections → Documents. Schema-less collections.

---

### _id and ObjectId
**_id:** Primary key. Unique within collection. Auto-generated if not provided.

**ObjectId:** 12-byte identifier:
- 4-byte timestamp (creation time)
- 5-byte random value
- 3-byte incrementing counter

```javascript
ObjectId("507f1f77bcf86cd799439011")
         \___/\___________/\_____/
        timestamp  random  counter
```

**Custom _id:**
```javascript
db.users.insertOne({_id: "user123", name: "Alice"})
```

**Extract timestamp:**
```javascript
ObjectId("...").getTimestamp() // Returns creation date
```

**Key takeaway:** _id = primary key. ObjectId = auto-generated 12-byte ID.

---

## CRUD Operations

### Create (Insert)
**insertOne:**
```javascript
db.users.insertOne({
  name: "Alice",
  age: 30,
  email: "alice@example.com"
})
// Returns: {acknowledged: true, insertedId: ObjectId("...")}
```

**insertMany:**
```javascript
db.users.insertMany([
  {name: "Bob", age: 25},
  {name: "Charlie", age: 35}
])
// Returns: {acknowledged: true, insertedIds: [...]}
```

**Key takeaway:** insertOne = single doc, insertMany = array of docs.

---

### Read (Find)
**find:** Returns all matching documents (cursor).
```javascript
db.users.find({age: {$gte: 30}}) // age >= 30

// Projection (select specific fields)
db.users.find({}, {name: 1, email: 1, _id: 0}) // Only name, email

// Limit, skip, sort
db.users.find().limit(10).skip(20).sort({age: -1}) // Page 3, sorted by age desc
```

**findOne:** Returns first matching document.
```javascript
db.users.findOne({email: "alice@example.com"})
```

**Query operators:**
- **Comparison:** `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`
- **Logical:** `$and`, `$or`, `$not`, `$nor`
- **Element:** `$exists`, `$type`
- **Array:** `$all`, `$elemMatch`, `$size`
- **Regex:** `{name: /^A/}` (starts with A)

**Key takeaway:** find = query + projection + cursor methods. Operators for complex queries.

---

### Update
**updateOne:** Updates first matching document.
```javascript
db.users.updateOne(
  {name: "Alice"}, // Filter
  {$set: {age: 31}} // Update
)
```

**updateMany:** Updates all matching documents.
```javascript
db.users.updateMany(
  {age: {$lt: 25}},
  {$set: {status: "young"}}
)
```

**replaceOne:** Replaces entire document (except _id).
```javascript
db.users.replaceOne(
  {name: "Alice"},
  {name: "Alice", age: 31, email: "alice@new.com"}
)
```

**Update operators:**
- **$set:** Set field value
- **$unset:** Remove field
- **$inc:** Increment number
- **$push:** Add to array
- **$pull:** Remove from array
- **$addToSet:** Add to array if not exists (unique)

```javascript
db.users.updateOne(
  {name: "Alice"},
  {
    $set: {age: 31},
    $push: {hobbies: "gaming"},
    $inc: {loginCount: 1}
  }
)
```

**Key takeaway:** updateOne/Many = partial update. replaceOne = full replacement.

---

### Delete
**deleteOne:** Deletes first matching document.
```javascript
db.users.deleteOne({name: "Alice"})
```

**deleteMany:** Deletes all matching documents.
```javascript
db.users.deleteMany({age: {$lt: 18}})
```

**Drop collection:**
```javascript
db.users.drop()
```

**Key takeaway:** deleteOne = first match, deleteMany = all matches.

---

## Data Modeling

### Embedded vs Referenced Documents
**Embedded (Denormalized):**
```javascript
{
  _id: 1,
  name: "Alice",
  address: {
    city: "New York",
    zip: "10001"
  }
}
```
**Pros:** Single query, better read performance, atomic updates.
**Cons:** Data duplication, document size limit (16MB), harder updates.

**Referenced (Normalized):**
```javascript
// User
{_id: 1, name: "Alice", address_id: 100}

// Address
{_id: 100, city: "New York", zip: "10001"}
```
**Pros:** No duplication, smaller documents, flexible.
**Cons:** Multiple queries (or $lookup for join), slower reads.

**When to embed:**
- One-to-one relationships
- One-to-few relationships
- Data accessed together
- Data doesn't change often

**When to reference:**
- Many-to-many relationships
- Large subdocuments
- Data changes frequently
- Data accessed separately

**Key takeaway:** Embed = read performance, Reference = flexibility. Design for query patterns.

---

### Schema Design Patterns
**1. Attribute Pattern:** Store varying attributes in array.
```javascript
{
  name: "Product",
  attributes: [
    {key: "color", value: "red"},
    {key: "size", value: "L"}
  ]
}
```

**2. Bucket Pattern:** Group time-series data.
```javascript
{
  sensor_id: "A",
  date: "2025-01-15",
  readings: [
    {time: "10:00", temp: 20},
    {time: "11:00", temp: 22}
  ]
}
```

**3. Outlier Pattern:** Separate frequent vs rare data.

**4. Computed Pattern:** Pre-calculate aggregations.

**Key takeaway:** Design patterns for specific use cases. Optimize for access patterns.

---

## Indexing

### What are Indexes?
**Definition:** Data structures that improve query performance. MongoDB scans index instead of entire collection.

**Without index (Collection Scan):** O(n) - scans every document.
**With index:** O(log n) - binary search on index.

**Trade-off:** Faster reads, slower writes (index must be updated).

**Key takeaway:** Indexes = faster queries. Trade-off: write performance.

---

### Index Types
**1. Single Field Index:**
```javascript
db.users.createIndex({email: 1}) // 1 = ascending, -1 = descending
```

**2. Compound Index (multiple fields):**
```javascript
db.users.createIndex({age: 1, name: 1})
// Efficient for: {age: 30}, {age: 30, name: "Alice"}
// NOT efficient for: {name: "Alice"} only (must use leftmost prefix)
```

**3. Multikey Index (arrays):**
```javascript
db.users.createIndex({hobbies: 1}) // Indexes each array element
```

**4. Text Index (full-text search):**
```javascript
db.articles.createIndex({content: "text"})
db.articles.find({$text: {$search: "mongodb"}})
```

**5. Geospatial Index:**
```javascript
db.places.createIndex({location: "2dsphere"})
db.places.find({
  location: {
    $near: {
      $geometry: {type: "Point", coordinates: [40.7, -73.9]},
      $maxDistance: 5000
    }
  }
})
```

**6. Unique Index:**
```javascript
db.users.createIndex({email: 1}, {unique: true})
```

**7. TTL Index (auto-delete after time):**
```javascript
db.sessions.createIndex({createdAt: 1}, {expireAfterSeconds: 3600}) // 1 hour
```

**Key takeaway:** Different indexes for different queries. Compound = leftmost prefix rule.

---

### Index Management
**Create index:**
```javascript
db.users.createIndex({email: 1}, {background: true}) // background = don't block writes
```

**List indexes:**
```javascript
db.users.getIndexes()
```

**Drop index:**
```javascript
db.users.dropIndex("email_1")
```

**Explain query (analyze performance):**
```javascript
db.users.find({email: "alice@example.com"}).explain("executionStats")
// Check: executionStages.stage = "IXSCAN" (index) vs "COLLSCAN" (full scan)
```

**Key takeaway:** explain() to verify index usage. Drop unused indexes.

---

## Aggregation Framework

### What is Aggregation?
**Definition:** Pipeline-based data processing. Transform, filter, group, sort documents in stages.

**Syntax:**
```javascript
db.collection.aggregate([
  {stage1},
  {stage2},
  {stage3}
])
```

**Key takeaway:** Pipeline of stages. Each stage transforms data for next stage.

---

### Common Aggregation Stages
**$match:** Filter documents (like find).
```javascript
{$match: {age: {$gte: 30}}}
```

**$project:** Select/transform fields.
```javascript
{$project: {name: 1, age: 1, _id: 0}}
```

**$group:** Group and aggregate.
```javascript
{$group: {
  _id: "$city",
  avgAge: {$avg: "$age"},
  count: {$sum: 1}
}}
```

**$sort:**
```javascript
{$sort: {age: -1}} // -1 = descending
```

**$limit / $skip:**
```javascript
{$limit: 10}
{$skip: 20}
```

**$lookup:** Left outer join (like SQL JOIN).
```javascript
{$lookup: {
  from: "orders",
  localField: "_id",
  foreignField: "user_id",
  as: "user_orders"
}}
```

**$unwind:** Deconstruct array field into separate documents.
```javascript
{$unwind: "$hobbies"} // One doc per hobby
```

**$addFields / $set:** Add new fields.
```javascript
{$addFields: {fullName: {$concat: ["$firstName", " ", "$lastName"]}}}
```

**Key takeaway:** Pipeline stages: match → group → project → sort. $lookup for joins.

---

### Example: Sales Report
```javascript
db.orders.aggregate([
  // 1. Filter: Orders from 2025
  {$match: {date: {$gte: ISODate("2025-01-01")}}},

  // 2. Group by product, sum revenue
  {$group: {
    _id: "$product",
    totalRevenue: {$sum: "$amount"},
    totalOrders: {$sum: 1}
  }},

  // 3. Sort by revenue descending
  {$sort: {totalRevenue: -1}},

  // 4. Top 10
  {$limit: 10}
])
```

**Key takeaway:** Real-world example: filter → group → sort → limit.

---

## Replication & Sharding

### Replication (High Availability)
**Definition:** Maintain multiple copies of data across servers (replica set). Automatic failover if primary fails.

**Replica Set:**
- **Primary:** Receives all writes
- **Secondary (replicas):** Replicate data from primary, can serve reads
- **Arbiter:** Voting member (no data), breaks ties in elections

**Automatic Failover:** If primary fails, secondaries elect new primary.

**Configuration:**
```javascript
rs.initiate()
rs.add("server2:27017")
rs.add("server3:27017")
rs.status()
```

**Read from secondary (eventual consistency):**
```javascript
db.users.find().readPref("secondary")
```

**Key takeaway:** Replica set = high availability. Primary writes, secondaries replicate.

---

### Sharding (Horizontal Scaling)
**Definition:** Distribute data across multiple servers (shards). Each shard holds subset of data.

**Components:**
- **Shard:** MongoDB instance holding subset of data
- **Config Server:** Metadata about cluster (which data on which shard)
- **Mongos (Router):** Routes queries to appropriate shard(s)

**Shard Key:** Field(s) used to distribute data. Crucial for performance.

**Example:**
```javascript
sh.enableSharding("mydb")
sh.shardCollection("mydb.users", {country: 1}) // Shard by country
```

**Shard key considerations:**
- **High cardinality:** Many distinct values
- **Even distribution:** Avoid hotspots
- **Query isolation:** Queries target single shard when possible

**Key takeaway:** Sharding = horizontal scaling. Shard key critical for performance.

---

## Performance & Optimization

### Query Performance
**1. Use indexes:**
```javascript
db.users.createIndex({email: 1})
```

**2. Use explain():**
```javascript
db.users.find({email: "alice@example.com"}).explain("executionStats")
// Check: executionTimeMillis, totalDocsExamined
```

**3. Use projection (limit fields):**
```javascript
db.users.find({}, {name: 1, email: 1, _id: 0})
```

**4. Use $match early in aggregation:**
```javascript
db.users.aggregate([
  {$match: {age: {$gte: 30}}}, // Filter first
  {$group: {_id: "$city", count: {$sum: 1}}}
])
```

**5. Avoid $where (executes JavaScript, slow):**
```javascript
// Avoid:
db.users.find({$where: "this.age > 30"})

// Use:
db.users.find({age: {$gt: 30}})
```

**Key takeaway:** Index, explain, project, early filter, avoid $where.

---

### Write Performance
**1. Bulk operations:**
```javascript
db.users.bulkWrite([
  {insertOne: {document: {name: "Alice"}}},
  {updateOne: {filter: {name: "Bob"}, update: {$set: {age: 30}}}},
  {deleteOne: {filter: {name: "Charlie"}}}
])
```

**2. Write Concern (trade-off: speed vs durability):**
```javascript
db.users.insertOne({name: "Alice"}, {writeConcern: {w: 1}})
// w: 1 (default) = acknowledged by primary
// w: "majority" = majority of replicas (safer, slower)
```

**3. Limit index count (each index slows writes).**

**Key takeaway:** Bulk ops, tune write concern, minimize indexes.

---

### Connection Pooling
**Definition:** Reuse database connections instead of creating new ones.

**Node.js example:**
```javascript
const client = new MongoClient(uri, {
  maxPoolSize: 50,
  minPoolSize: 10
});
```

**Key takeaway:** Connection pooling = reuse connections. Faster.

---

## Security & Best Practices

### Authentication & Authorization
**Enable authentication:**
```javascript
// Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "password",
  roles: [{role: "userAdminAnyDatabase", db: "admin"}]
})
```

**Start mongod with auth:**
```bash
mongod --auth
```

**Roles:**
- **read:** Read data
- **readWrite:** Read/write data
- **dbAdmin:** Manage database
- **userAdmin:** Manage users
- **clusterAdmin:** Manage cluster

**Key takeaway:** Enable auth in production. Principle of least privilege.

---

### Encryption
**Encryption at rest:** Encrypt data files on disk.
```bash
mongod --enableEncryption --encryptionKeyFile /path/to/key
```

**Encryption in transit:** TLS/SSL for network traffic.
```bash
mongod --tlsMode requireTLS --tlsCertificateKeyFile /path/to/cert.pem
```

**Key takeaway:** Encrypt at rest + in transit. Required for sensitive data.

---

### Best Practices
**1. Schema Design:**
- Design for query patterns (read/write ratio)
- Embed for read performance, reference for flexibility
- Avoid unbounded arrays

**2. Indexing:**
- Index frequently queried fields
- Use compound indexes for multiple fields
- Drop unused indexes
- Use explain() to verify

**3. Performance:**
- Use projection to limit returned fields
- Use aggregation pipeline for complex queries
- Batch writes with bulkWrite()
- Monitor with profiler: `db.setProfilingLevel(1, {slowms: 100})`

**4. Security:**
- Enable authentication
- Use roles (least privilege)
- Encrypt data (at rest + in transit)
- Network isolation (bind to private IP)

**5. Operations:**
- Monitor replica set health
- Regular backups (mongodump, snapshots)
- Keep MongoDB version updated
- Use connection pooling

**6. Data Modeling:**
- Denormalize for read-heavy workloads
- Normalize for write-heavy workloads
- Use schema validation (optional schemas)

**Key takeaway:** Design for queries, index wisely, secure properly, monitor actively.

---

## Interview Tips

1. **Explain trade-offs:** "Embedded documents for read performance, referenced for data integrity."
2. **Use real examples:** "Used compound index on {userId, timestamp} for user activity queries."
3. **Discuss sharding:** "Chose user_id as shard key for even distribution across shards."
4. **Know when NOT to use MongoDB:** "For complex transactions spanning multiple documents, SQL might be better."
5. **Security awareness:** "Enabled authentication and TLS in production, used role-based access control."

---

**Updated:** 2026-06-28 | **Level:** Intermediate-Advanced | **Format:** Interview-ready definitions
