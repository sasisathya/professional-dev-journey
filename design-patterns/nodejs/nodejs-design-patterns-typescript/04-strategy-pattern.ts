// Strategy Pattern - TypeScript Version with Type-Safe Implementation
// Defines a family of algorithms, encapsulates each one, and makes them interchangeable

// Generic Strategy Interface
interface IStrategy<T, R> {
  execute(data: T): R;
}

// Payment-related types
interface PaymentMethod {
  type: string;
  process(amount: number): PaymentResult;
  getFee(amount: number): number;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  fee: number;
  total: number;
  timestamp: string;
  status: string;
}

// Concrete Strategies for Payment
class CreditCardStrategy implements PaymentMethod {
  type: string = 'credit_card';

  constructor(
    private cardNumber: string,
    private cardHolder: string,
    private cvv: string
  ) {}

  process(amount: number): PaymentResult {
    const fee = this.getFee(amount);
    return {
      success: true,
      transactionId: `CC-${Date.now()}`,
      amount,
      fee,
      total: amount + fee,
      timestamp: new Date().toISOString(),
      status: 'Success'
    };
  }

  getFee(amount: number): number {
    return amount * 0.029; // 2.9%
  }
}

class PayPalStrategy implements PaymentMethod {
  type: string = 'paypal';

  constructor(private email: string) {}

  process(amount: number): PaymentResult {
    const fee = this.getFee(amount);
    return {
      success: true,
      transactionId: `PP-${Date.now()}`,
      amount,
      fee,
      total: amount + fee,
      timestamp: new Date().toISOString(),
      status: 'Success'
    };
  }

  getFee(amount: number): number {
    return amount * 0.034 + 0.3; // 3.4% + $0.30
  }
}

class CryptoCurrencyStrategy implements PaymentMethod {
  type: string = 'crypto';

  constructor(
    private walletAddress: string,
    private cryptoType: 'bitcoin' | 'ethereum'
  ) {}

  process(amount: number): PaymentResult {
    const fee = this.getFee(amount);
    return {
      success: true,
      transactionId: `${this.cryptoType.toUpperCase()}-${Date.now()}`,
      amount,
      fee,
      total: amount + fee,
      timestamp: new Date().toISOString(),
      status: 'Pending'
    };
  }

  getFee(amount: number): number {
    return 0.001; // Fixed fee
  }
}

class ApplePayStrategy implements PaymentMethod {
  type: string = 'apple_pay';

  constructor(
    private deviceId: string,
    private token: string
  ) {}

  process(amount: number): PaymentResult {
    const fee = this.getFee(amount);
    return {
      success: true,
      transactionId: `AP-${Date.now()}`,
      amount,
      fee,
      total: amount + fee,
      timestamp: new Date().toISOString(),
      status: 'Success'
    };
  }

  getFee(amount: number): number {
    return amount * 0.015; // 1.5%
  }
}

// Generic Sorting Strategy
interface SortStrategy<T> extends IStrategy<T[], T[]> {
  execute(data: T[]): T[];
}

class BubbleSortStrategy<T> implements SortStrategy<T> {
  execute(data: T[]): T[] {
    const arr = [...data];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if ((arr[j] as any) > (arr[j + 1] as any)) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }
    return arr;
  }
}

class QuickSortStrategy<T> implements SortStrategy<T> {
  execute(data: T[]): T[] {
    if (data.length <= 1) return data;

    const pivot = data[0];
    const left = data.slice(1).filter(x => (x as any) < (pivot as any));
    const right = data.slice(1).filter(x => (x as any) >= (pivot as any));

    return [...this.execute(left), pivot, ...this.execute(right)];
  }
}

class MergeSortStrategy<T> implements SortStrategy<T> {
  execute(data: T[]): T[] {
    if (data.length <= 1) return data;

    const mid = Math.floor(data.length / 2);
    const left = this.execute(data.slice(0, mid));
    const right = this.execute(data.slice(mid));

    return this.merge(left, right);
  }

  private merge(left: T[], right: T[]): T[] {
    const result: T[] = [];
    let i = 0, j = 0;

    while (i < left.length && j < right.length) {
      if ((left[i] as any) <= (right[j] as any)) {
        result.push(left[i++]);
      } else {
        result.push(right[j++]);
      }
    }

    return [...result, ...left.slice(i), ...right.slice(j)];
  }
}

// Compression Strategy
interface CompressionStrategy extends IStrategy<string, string> {
  compress(data: string): string;
  decompress(data: string): string;
}

class GZipCompressionStrategy implements CompressionStrategy {
  execute(data: string): string {
    return this.compress(data);
  }

  compress(data: string): string {
    console.log(`🗜️ Compressing with GZIP...`);
    return Buffer.from(data).toString('base64');
  }

  decompress(data: string): string {
    console.log(`📂 Decompressing GZIP...`);
    return Buffer.from(data, 'base64').toString();
  }
}

class BrotliCompressionStrategy implements CompressionStrategy {
  execute(data: string): string {
    return this.compress(data);
  }

  compress(data: string): string {
    console.log(`🗜️ Compressing with Brotli...`);
    return Buffer.from(data).toString('base64');
  }

  decompress(data: string): string {
    console.log(`📂 Decompressing Brotli...`);
    return Buffer.from(data, 'base64').toString();
  }
}

// Context that uses strategies
class PaymentProcessor {
  constructor(private strategy: PaymentMethod) {}

  setStrategy(strategy: PaymentMethod): void {
    this.strategy = strategy;
  }

  pay(amount: number): PaymentResult {
    console.log(`\n💳 Processing payment of $${amount} with ${this.strategy.type}...`);
    const result = this.strategy.process(amount);
    console.log(`✅ Payment ${result.status}. Transaction ID: ${result.transactionId}`);
    return result;
  }

  getFeeEstimate(amount: number): number {
    return this.strategy.getFee(amount);
  }
}

class SortProcessor<T> {
  constructor(private strategy: SortStrategy<T>) {}

  setStrategy(strategy: SortStrategy<T>): void {
    this.strategy = strategy;
  }

  sort(data: T[]): T[] {
    console.log(`Sorting with ${this.strategy.constructor.name}...`);
    return this.strategy.execute(data);
  }
}

class DataCompressor {
  constructor(private strategy: CompressionStrategy) {}

  setStrategy(strategy: CompressionStrategy): void {
    this.strategy = strategy;
  }

  compress(data: string): string {
    return this.strategy.compress(data);
  }

  decompress(data: string): string {
    return this.strategy.decompress(data);
  }
}

// Authentication Strategy
interface AuthenticationStrategy extends IStrategy<Credentials, AuthResult> {
  authenticate(credentials: Credentials): AuthResult;
}

interface Credentials {
  username: string;
  password: string;
}

interface AuthResult {
  success: boolean;
  token?: string;
  message: string;
}

class BasicAuthStrategy implements AuthenticationStrategy {
  execute(credentials: Credentials): AuthResult {
    return this.authenticate(credentials);
  }

  authenticate(credentials: Credentials): AuthResult {
    if (credentials.username && credentials.password.length >= 8) {
      return {
        success: true,
        token: Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64'),
        message: 'Basic auth successful'
      };
    }
    return { success: false, message: 'Invalid credentials' };
  }
}

class OAuth2Strategy implements AuthenticationStrategy {
  execute(credentials: Credentials): AuthResult {
    return this.authenticate(credentials);
  }

  authenticate(credentials: Credentials): AuthResult {
    if (credentials.username) {
      return {
        success: true,
        token: `oauth2_${Buffer.from(credentials.username).toString('base64')}`,
        message: 'OAuth2 auth successful'
      };
    }
    return { success: false, message: 'OAuth2 auth failed' };
  }
}

// ===== Usage Examples =====

console.log('========== STRATEGY PATTERN - TYPESCRIPT ==========\n');

// Example 1: Payment Processing
console.log('--- Payment Processing Strategy ---');

const processor = new PaymentProcessor(
  new CreditCardStrategy('1234567890123456', 'John Doe', '123')
);

processor.pay(100);

processor.setStrategy(new PayPalStrategy('john@example.com'));
processor.pay(100);

processor.setStrategy(new CryptoCurrencyStrategy('1A1z7agoat...', 'bitcoin'));
processor.pay(100);

processor.setStrategy(new ApplePayStrategy('device-123', 'token-xyz'));
processor.pay(100);

// Fee Comparison
console.log('\n--- Fee Comparison for $1000 ---');
const amount = 1000;
const strategies: PaymentMethod[] = [
  new CreditCardStrategy('1234', 'User', '123'),
  new PayPalStrategy('user@example.com'),
  new CryptoCurrencyStrategy('addr', 'bitcoin'),
  new ApplePayStrategy('device', 'token')
];

strategies.forEach(strategy => {
  const fee = strategy.getFee(amount);
  console.log(`${strategy.type}: $${fee.toFixed(2)} fee (Total: $${(amount + fee).toFixed(2)})`);
});

// Example 2: Sorting Strategy
console.log('\n\n--- Sorting Strategy ---');

const numbers = [5, 2, 8, 1, 9, 3, 7, 4, 6];

const sortProcessor = new SortProcessor(new BubbleSortStrategy());
console.log('Original:', numbers);
console.log('Bubble Sort:', sortProcessor.sort([...numbers]));

sortProcessor.setStrategy(new QuickSortStrategy());
console.log('Quick Sort:', sortProcessor.sort([...numbers]));

sortProcessor.setStrategy(new MergeSortStrategy());
console.log('Merge Sort:', sortProcessor.sort([...numbers]));

// Example 3: Compression Strategy
console.log('\n\n--- Compression Strategy ---');

const data = 'This is a sample text that will be compressed';
const compressor = new DataCompressor(new GZipCompressionStrategy());

const compressed = compressor.compress(data);
console.log(`Original size: ${data.length} chars`);
console.log(`Compressed size: ${compressed.length} chars`);
console.log(`Compression ratio: ${((1 - compressed.length / data.length) * 100).toFixed(2)}%`);

compressor.setStrategy(new BrotliCompressionStrategy());
const compressedBrotli = compressor.compress(data);
console.log(`\nBrotli size: ${compressedBrotli.length} chars`);

// Example 4: Authentication Strategy
console.log('\n\n--- Authentication Strategy ---');

type AuthenticatorContext = {
  strategy: AuthenticationStrategy;
  authenticate: (credentials: Credentials) => AuthResult;
  setStrategy: (strategy: AuthenticationStrategy) => void;
};

const authenticator: AuthenticatorContext = {
  strategy: new BasicAuthStrategy(),
  authenticate(creds: Credentials) {
    return this.strategy.authenticate(creds);
  },
  setStrategy(strategy: AuthenticationStrategy) {
    this.strategy = strategy;
  }
};

console.log('Basic Auth:', authenticator.authenticate({ username: 'john', password: 'password123' }));

authenticator.setStrategy(new OAuth2Strategy());
console.log('OAuth2:', authenticator.authenticate({ username: 'john', password: 'ignored' }));

export {
  PaymentProcessor,
  SortProcessor,
  DataCompressor,
  CreditCardStrategy,
  PayPalStrategy,
  CryptoCurrencyStrategy,
  ApplePayStrategy,
  BubbleSortStrategy,
  QuickSortStrategy,
  MergeSortStrategy,
  GZipCompressionStrategy,
  BrotliCompressionStrategy,
  BasicAuthStrategy,
  OAuth2Strategy
};

export type {
  IStrategy,
  PaymentMethod,
  PaymentResult,
  SortStrategy,
  CompressionStrategy,
  AuthenticationStrategy,
  Credentials,
  AuthResult
};
