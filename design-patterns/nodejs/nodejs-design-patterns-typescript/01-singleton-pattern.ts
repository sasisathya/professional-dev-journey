// Singleton Pattern - TypeScript Version with Type Safety
// Ensures a class has only one instance and provides a global point of access

interface IConnection {
  id: string;
  host: string;
  port: number;
  database: string;
  timestamp: string;
}

interface IConnectionStatus {
  isConnected: boolean;
  connectionId: string | null;
}

interface IQueryResult {
  connectionId: string;
  query: string;
  result: string;
}

class DatabaseConnection {
  private static instance: DatabaseConnection | null = null;
  private connection: IConnection | null = null;
  private isConnected: boolean = false;

  private constructor() {
    // Private constructor prevents instantiation
  }

  public static getInstance(): DatabaseConnection {
    if (DatabaseConnection.instance === null) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public connect(): IConnection {
    if (this.isConnected) {
      console.log('Already connected to database');
      return this.connection!;
    }

    this.connection = {
      id: Math.random().toString(36).substr(2, 9),
      host: 'localhost',
      port: 5432,
      database: 'myapp',
      timestamp: new Date().toISOString()
    };

    this.isConnected = true;
    console.log('✅ Database connected:', this.connection.id);
    return this.connection;
  }

  public disconnect(): void {
    if (!this.isConnected) {
      console.log('Not connected to database');
      return;
    }

    console.log('❌ Database disconnected:', this.connection?.id);
    this.connection = null;
    this.isConnected = false;
  }

  public query(sql: string): IQueryResult {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    return {
      connectionId: this.connection!.id,
      query: sql,
      result: 'Query executed successfully'
    };
  }

  public getStatus(): IConnectionStatus {
    return {
      isConnected: this.isConnected,
      connectionId: this.connection?.id || null
    };
  }
}

// Generic Singleton Factory
class SingletonFactory<T> {
  private static instances: Map<string, any> = new Map();

  public static getInstance<T>(
    key: string,
    constructor: new () => T
  ): T {
    if (!this.instances.has(key)) {
      this.instances.set(key, new constructor());
    }
    return this.instances.get(key);
  }

  public static clear(): void {
    this.instances.clear();
  }
}

// Logger Singleton
class Logger {
  private static instance: Logger | null = null;
  private logs: string[] = [];

  private constructor() {}

  public static getInstance(): Logger {
    if (Logger.instance === null) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    this.logs.push(logEntry);
    console.log(logEntry);
  }

  public info(message: string): void {
    this.log(message, 'info');
  }

  public warn(message: string): void {
    this.log(message, 'warn');
  }

  public error(message: string): void {
    this.log(message, 'error');
  }

  public getLogs(): string[] {
    return this.logs;
  }
}

// Configuration Singleton
interface IConfig {
  appName: string;
  version: string;
  apiUrl: string;
  debug: boolean;
  database: {
    host: string;
    port: number;
    name: string;
  };
}

class Config {
  private static instance: Config | null = null;
  private config: IConfig;

  private constructor(initialConfig: IConfig) {
    this.config = initialConfig;
  }

  public static getInstance(initialConfig?: IConfig): Config {
    if (Config.instance === null) {
      Config.instance = new Config(
        initialConfig || {
          appName: 'MyApp',
          version: '1.0.0',
          apiUrl: 'https://api.example.com',
          debug: false,
          database: {
            host: 'localhost',
            port: 5432,
            name: 'myapp_db'
          }
        }
      );
    }
    return Config.instance;
  }

  public get<K extends keyof IConfig>(key: K): IConfig[K] {
    return this.config[key];
  }

  public set<K extends keyof IConfig>(key: K, value: IConfig[K]): void {
    this.config[key] = value;
  }

  public getAll(): IConfig {
    return { ...this.config };
  }
}

// ===== Usage Examples =====

console.log('========== SINGLETON PATTERN - TYPESCRIPT ==========\n');

// Example 1: Database Connection Singleton
console.log('--- Database Connection Singleton ---');
const db1 = DatabaseConnection.getInstance();
const db2 = DatabaseConnection.getInstance();

console.log('db1 and db2 are same instance:', db1 === db2); // true

db1.connect();
console.log('db1 status:', db1.getStatus());
console.log('db2 status:', db2.getStatus()); // Same connection

const result = db1.query('SELECT * FROM users');
console.log('Query result:', result);

db1.disconnect();
console.log('After disconnect - status:', db1.getStatus());

// Example 2: Logger Singleton
console.log('\n--- Logger Singleton ---');
const logger1 = Logger.getInstance();
const logger2 = Logger.getInstance();

console.log('logger1 and logger2 are same instance:', logger1 === logger2); // true

logger1.info('Application started');
logger1.warn('This is a warning');
logger1.error('An error occurred');

console.log('Total logs:', logger1.getLogs().length);

// Example 3: Config Singleton
console.log('\n--- Config Singleton ---');
const config = Config.getInstance({
  appName: 'TypeScript App',
  version: '2.0.0',
  apiUrl: 'https://api.example.com/v2',
  debug: true,
  database: {
    host: 'db.example.com',
    port: 5432,
    name: 'ts_app_db'
  }
});

console.log('App Name:', config.get('appName'));
console.log('API URL:', config.get('apiUrl'));
console.log('Debug Mode:', config.get('debug'));
console.log('Full Config:', config.getAll());

config.set('debug', false);
console.log('Debug Mode (updated):', config.get('debug'));

// Example 4: Generic Singleton Factory
console.log('\n--- Generic Singleton Factory ---');

class DatabaseService {
  public name: string = 'DatabaseService';
  public query(): string {
    return 'Query executed';
  }
}

class CacheService {
  public name: string = 'CacheService';
  public get(key: string): string {
    return `Value for ${key}`;
  }
}

const dbService = SingletonFactory.getInstance('db', DatabaseService);
const cacheService = SingletonFactory.getInstance('cache', CacheService);

const dbService2 = SingletonFactory.getInstance('db', DatabaseService);
const cacheService2 = SingletonFactory.getInstance('cache', CacheService);

console.log('Database services are same:', dbService === dbService2); // true
console.log('Cache services are same:', cacheService === cacheService2); // true
console.log('Database query:', dbService.query());
console.log('Cache get:', cacheService.get('user:123'));

// Example 5: Thread-Safe Singleton Pattern
console.log('\n--- Thread-Safe Singleton with Lazy Loading ---');

class ThreadSafeSingleton {
  private static instance: ThreadSafeSingleton | null = null;
  private static readonly lock = { value: false };
  private data: string = 'Initialized at ' + new Date().toISOString();

  private constructor() {
    // Expensive initialization
    console.log('  Expensive initialization...');
  }

  public static getInstance(): ThreadSafeSingleton {
    if (ThreadSafeSingleton.instance === null) {
      ThreadSafeSingleton.instance = new ThreadSafeSingleton();
    }
    return ThreadSafeSingleton.instance;
  }

  public getData(): string {
    return this.data;
  }
}

const singleton1 = ThreadSafeSingleton.getInstance();
console.log('Singleton 1 data:', singleton1.getData());

const singleton2 = ThreadSafeSingleton.getInstance();
console.log('Singleton 2 data:', singleton2.getData());

console.log('Creation count: 1 (lazy loaded only once)');

// Type-safe Singleton with different types
type SingletonStore = {
  database?: DatabaseConnection;
  logger?: Logger;
  config?: Config;
};

class SingletonContainer {
  private static store: SingletonStore = {};

  public static register<T extends keyof SingletonStore>(
    key: T,
    value: SingletonStore[T]
  ): void {
    this.store[key] = value;
  }

  public static get<T extends keyof SingletonStore>(key: T): SingletonStore[T] | undefined {
    return this.store[key];
  }

  public static getAll(): SingletonStore {
    return { ...this.store };
  }
}

console.log('\n--- Type-Safe Singleton Container ---');
SingletonContainer.register('database', DatabaseConnection.getInstance());
SingletonContainer.register('logger', Logger.getInstance());

console.log('Registered singletons:', Object.keys(SingletonContainer.getAll()));

export { DatabaseConnection, Logger, Config, SingletonFactory, ThreadSafeSingleton, SingletonContainer };
export type { IConnection, IConnectionStatus, IQueryResult, IConfig };
