// Decorator Pattern - Attaches additional responsibilities to an object dynamically
// Use case: Adding features to objects without altering their structure, middleware, logging, caching

class SimpleCoffee {
  cost() {
    return 5.00;
  }

  description() {
    return 'Simple Coffee';
  }

  getDetails() {
    return {
      name: this.description(),
      cost: this.cost(),
      calories: 50,
      caffeine: '95mg'
    };
  }
}

class CoffeeDecorator {
  constructor(coffee) {
    this.coffee = coffee;
  }

  cost() {
    return this.coffee.cost();
  }

  description() {
    return this.coffee.description();
  }

  getDetails() {
    return this.coffee.getDetails();
  }
}

class MilkDecorator extends CoffeeDecorator {
  cost() {
    return this.coffee.cost() + 0.75;
  }

  description() {
    return this.coffee.description() + ', Milk';
  }

  getDetails() {
    const details = this.coffee.getDetails();
    return {
      ...details,
      name: this.description(),
      cost: this.cost(),
      calories: details.calories + 150,
      ingredients: [...(details.ingredients || []), 'Milk']
    };
  }
}

class SugarDecorator extends CoffeeDecorator {
  cost() {
    return this.coffee.cost() + 0.25;
  }

  description() {
    return this.coffee.description() + ', Sugar';
  }

  getDetails() {
    const details = this.coffee.getDetails();
    return {
      ...details,
      name: this.description(),
      cost: this.cost(),
      calories: details.calories + 50,
      ingredients: [...(details.ingredients || []), 'Sugar']
    };
  }
}

class VanillaDecorator extends CoffeeDecorator {
  cost() {
    return this.coffee.cost() + 0.50;
  }

  description() {
    return this.coffee.description() + ', Vanilla';
  }

  getDetails() {
    const details = this.coffee.getDetails();
    return {
      ...details,
      name: this.description(),
      cost: this.cost(),
      calories: details.calories + 30,
      ingredients: [...(details.ingredients || []), 'Vanilla Syrup']
    };
  }
}

class ChocolateDecorator extends CoffeeDecorator {
  cost() {
    return this.coffee.cost() + 0.60;
  }

  description() {
    return this.coffee.description() + ', Chocolate';
  }

  getDetails() {
    const details = this.coffee.getDetails();
    return {
      ...details,
      name: this.description(),
      cost: this.cost(),
      calories: details.calories + 80,
      ingredients: [...(details.ingredients || []), 'Chocolate Syrup']
    };
  }
}

class WhippedCreamDecorator extends CoffeeDecorator {
  cost() {
    return this.coffee.cost() + 0.50;
  }

  description() {
    return this.coffee.description() + ', Whipped Cream';
  }

  getDetails() {
    const details = this.coffee.getDetails();
    return {
      ...details,
      name: this.description(),
      cost: this.cost(),
      calories: details.calories + 100,
      ingredients: [...(details.ingredients || []), 'Whipped Cream']
    };
  }
}

// === Function Decorator Pattern ===
class DataProcessor {
  process(data) {
    return data.toUpperCase();
  }
}

const processorDecorator = (processor) => {
  const originalProcess = processor.process.bind(processor);

  processor.process = function(data) {
    console.log(`🔄 Processing started at ${new Date().toISOString()}`);
    const startTime = performance.now();

    const result = originalProcess(data);

    const endTime = performance.now();
    console.log(`⏱️  Execution time: ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`📊 Data length: Input ${data.length}, Output ${result.length}`);

    return result;
  };

  return processor;
};

// === Caching Decorator ===
class DatabaseQuery {
  constructor(database) {
    this.database = database;
    this.queryCount = 0;
  }

  query(sql) {
    this.queryCount++;
    console.log(`🔍 Executing query: ${sql}`);
    return this.database.find(sql);
  }

  getStats() {
    return {
      queriesExecuted: this.queryCount
    };
  }
}

class CachingDecorator {
  constructor(database) {
    this.database = database;
    this.cache = new Map();
    this.queryCount = 0;
  }

  query(sql) {
    if (this.cache.has(sql)) {
      console.log(`✅ Cache hit for: ${sql}`);
      return this.cache.get(sql);
    }

    console.log(`⚠️  Cache miss for: ${sql}`);
    const result = this.database.query(sql);
    this.cache.set(sql, result);

    return result;
  }

  clearCache() {
    console.log(`🗑️  Cache cleared`);
    this.cache.clear();
  }

  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      cachedQueries: Array.from(this.cache.keys())
    };
  }

  getStats() {
    return this.database.getStats();
  }
}

// === Logging Decorator ===
class LoggingDecorator {
  constructor(service, serviceName) {
    this.service = service;
    this.serviceName = serviceName;
    this.callCount = 0;
  }

  process(data) {
    this.callCount++;
    console.log(`📝 [${this.serviceName}] Call #${this.callCount}: Processing data of length ${data.length}`);

    try {
      const result = this.service.process(data);
      console.log(`✅ [${this.serviceName}] Successfully processed`);
      return result;
    } catch (error) {
      console.log(`❌ [${this.serviceName}] Error: ${error.message}`);
      throw error;
    }
  }

  getCallCount() {
    return this.callCount;
  }
}

// === Validation Decorator ===
class ValidationDecorator {
  constructor(service) {
    this.service = service;
  }

  process(data) {
    console.log(`🔐 [Validation] Checking data...`);

    if (!data) {
      throw new Error('Data is required');
    }

    if (typeof data !== 'string') {
      throw new Error('Data must be a string');
    }

    if (data.length === 0) {
      throw new Error('Data cannot be empty');
    }

    if (data.length > 1000) {
      throw new Error('Data exceeds maximum length of 1000 characters');
    }

    console.log(`✅ [Validation] Data is valid`);
    return this.service.process(data);
  }
}

// Usage Examples
console.log('========== COFFEE DECORATOR PATTERN ==========\n');

let coffee = new SimpleCoffee();
console.log(`${coffee.description()}: $${coffee.cost().toFixed(2)}`);
console.log(JSON.stringify(coffee.getDetails(), null, 2));

console.log('\n--- Adding Milk ---');
coffee = new MilkDecorator(coffee);
console.log(`${coffee.description()}: $${coffee.cost().toFixed(2)}`);
console.log(JSON.stringify(coffee.getDetails(), null, 2));

console.log('\n--- Adding Sugar ---');
coffee = new SugarDecorator(coffee);
console.log(`${coffee.description()}: $${coffee.cost().toFixed(2)}`);
console.log(JSON.stringify(coffee.getDetails(), null, 2));

console.log('\n--- Adding Vanilla ---');
coffee = new VanillaDecorator(coffee);
console.log(`${coffee.description()}: $${coffee.cost().toFixed(2)}`);
console.log(JSON.stringify(coffee.getDetails(), null, 2));

console.log('\n--- Adding Chocolate & Whipped Cream ---');
coffee = new ChocolateDecorator(coffee);
coffee = new WhippedCreamDecorator(coffee);
console.log(`${coffee.description()}: $${coffee.cost().toFixed(2)}`);
console.log(JSON.stringify(coffee.getDetails(), null, 2));

// Different combinations
console.log('\n\n--- Creating Different Coffee Types ---');
const coffees = [
  { name: 'Vanilla Milk', decorators: (c) => new MilkDecorator(new VanillaDecorator(c)) },
  { name: 'Mocha', decorators: (c) => new MilkDecorator(new ChocolateDecorator(c)) },
  { name: 'Sweet & Simple', decorators: (c) => new SugarDecorator(c) },
];

coffees.forEach(({ name, decorators }) => {
  const c = decorators(new SimpleCoffee());
  console.log(`${name}: ${c.description()} - $${c.cost().toFixed(2)}`);
});

// === Function Decorator Example ===
console.log('\n\n========== FUNCTION DECORATOR PATTERN ==========\n');

const processor = new DataProcessor();

console.log('--- Before Decoration ---');
const result1 = processor.process('hello world');
console.log(`Result: ${result1}\n`);

console.log('--- After Decoration (with timing & stats) ---');
processorDecorator(processor);
const result2 = processor.process('hello world');
console.log(`Result: ${result2}`);

// === Caching Decorator Example ===
console.log('\n\n========== CACHING DECORATOR PATTERN ==========\n');

class SimpleDatabaseQuery {
  query(sql) {
    console.log(`   Executing: ${sql}`);
    return { rows: 100, data: 'sample data' };
  }

  getStats() {
    return { queriesExecuted: 1 };
  }
}

const db = new DatabaseQuery(new SimpleDatabaseQuery());
const cachedDb = new CachingDecorator(db);

console.log('--- Query 1 ---');
cachedDb.query('SELECT * FROM users');

console.log('\n--- Query 1 Again (should be cached) ---');
cachedDb.query('SELECT * FROM users');

console.log('\n--- Query 2 ---');
cachedDb.query('SELECT * FROM products');

console.log('\n--- Query 2 Again (should be cached) ---');
cachedDb.query('SELECT * FROM products');

console.log('\n--- Cache Statistics ---');
console.log(JSON.stringify(cachedDb.getCacheStats(), null, 2));

// === Logging & Validation Decorators ===
console.log('\n\n========== LOGGING & VALIDATION DECORATORS ==========\n');

let service = new DataProcessor();
service = new LoggingDecorator(service, 'DataProcessor');
service = new ValidationDecorator(service);

console.log('--- Valid Input ---');
service.process('test data');

console.log('\n--- Call Count ---');
console.log(`Calls made: ${service.getCallCount() || 'N/A'}`);

console.log('\n--- Invalid Input (empty) ---');
try {
  service.process('');
} catch (error) {
  console.log(`Error caught: ${error.message}`);
}

console.log('\n--- Invalid Input (too long) ---');
try {
  service.process('x'.repeat(1001));
} catch (error) {
  console.log(`Error caught: ${error.message}`);
}
