// Strategy Pattern - Defines a family of algorithms, encapsulates each one, and makes them interchangeable
// Use case: Payment methods, sorting algorithms, compression formats, authentication strategies

class PaymentStrategy {
  pay(amount) {
    throw new Error('pay() method must be implemented');
  }

  getTransactionFee(amount) {
    throw new Error('getTransactionFee() method must be implemented');
  }
}

class CreditCardPayment extends PaymentStrategy {
  constructor(cardNumber, cardHolder, cvv) {
    super();
    this.cardNumber = cardNumber;
    this.cardHolder = cardHolder;
    this.cvv = cvv;
  }

  pay(amount) {
    const fee = this.getTransactionFee(amount);
    return {
      method: 'Credit Card',
      cardNumber: `****-****-****-${this.cardNumber.slice(-4)}`,
      cardHolder: this.cardHolder,
      amount: amount,
      fee: fee,
      total: amount + fee,
      status: 'Success',
      transactionId: `CC-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }

  getTransactionFee(amount) {
    return amount * 0.029; // 2.9% fee
  }
}

class PayPalPayment extends PaymentStrategy {
  constructor(email) {
    super();
    this.email = email;
  }

  pay(amount) {
    const fee = this.getTransactionFee(amount);
    return {
      method: 'PayPal',
      email: this.email,
      amount: amount,
      fee: fee,
      total: amount + fee,
      status: 'Success',
      transactionId: `PP-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }

  getTransactionFee(amount) {
    return amount * 0.034 + 0.30; // 3.4% + $0.30
  }
}

class BitcoinPayment extends PaymentStrategy {
  constructor(walletAddress) {
    super();
    this.walletAddress = walletAddress;
  }

  pay(amount) {
    const fee = this.getTransactionFee(amount);
    return {
      method: 'Bitcoin',
      walletAddress: this.walletAddress,
      amount: amount,
      fee: fee,
      total: amount + fee,
      status: 'Pending Confirmation',
      transactionId: `BTC-${Date.now()}`,
      confirmations: 0,
      timestamp: new Date().toISOString()
    };
  }

  getTransactionFee(amount) {
    return 0.0001; // Fixed fee in BTC
  }
}

class ApplePayPayment extends PaymentStrategy {
  constructor(deviceId, token) {
    super();
    this.deviceId = deviceId;
    this.token = token;
  }

  pay(amount) {
    const fee = this.getTransactionFee(amount);
    return {
      method: 'Apple Pay',
      deviceId: this.deviceId,
      amount: amount,
      fee: fee,
      total: amount + fee,
      status: 'Success',
      transactionId: `AP-${Date.now()}`,
      biometricVerified: true,
      timestamp: new Date().toISOString()
    };
  }

  getTransactionFee(amount) {
    return amount * 0.015; // 1.5% fee
  }
}

class ShoppingCart {
  constructor() {
    this.items = [];
    this.paymentStrategy = null;
  }

  addItem(item, price, quantity = 1) {
    this.items.push({ item, price, quantity });
    console.log(`✅ Added ${quantity} x ${item} ($${price}) to cart`);
  }

  getTotalAmount() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  setPaymentStrategy(strategy) {
    this.paymentStrategy = strategy;
    console.log(`💳 Payment strategy set to: ${strategy.constructor.name}`);
  }

  checkout() {
    if (!this.paymentStrategy) {
      throw new Error('Payment strategy not set');
    }

    const amount = this.getTotalAmount();
    const paymentResult = this.paymentStrategy.pay(amount);

    return {
      cart: {
        items: this.items,
        subtotal: amount
      },
      payment: paymentResult
    };
  }

  displayCart() {
    console.log('\n📦 Shopping Cart:');
    this.items.forEach(item => {
      console.log(`  - ${item.item}: $${item.price} x ${item.quantity} = $${item.price * item.quantity}`);
    });
    console.log(`  Total: $${this.getTotalAmount()}`);
  }
}

// Usage Example
const cart = new ShoppingCart();

cart.addItem('Laptop', 999.99, 1);
cart.addItem('Mouse', 29.99, 2);
cart.addItem('Keyboard', 79.99, 1);

cart.displayCart();

console.log('\n=== Payment Option 1: Credit Card ===');
cart.setPaymentStrategy(new CreditCardPayment('1234567890123456', 'John Doe', '123'));
let result = cart.checkout();
console.log(JSON.stringify(result.payment, null, 2));

console.log('\n=== Payment Option 2: PayPal ===');
cart.setPaymentStrategy(new PayPalPayment('john@example.com'));
result = cart.checkout();
console.log(JSON.stringify(result.payment, null, 2));

console.log('\n=== Payment Option 3: Bitcoin ===');
cart.setPaymentStrategy(new BitcoinPayment('1A1z7agoat2ABJF3F...'));
result = cart.checkout();
console.log(JSON.stringify(result.payment, null, 2));

console.log('\n=== Payment Option 4: Apple Pay ===');
cart.setPaymentStrategy(new ApplePayPayment('device-123', 'token-xyz'));
result = cart.checkout();
console.log(JSON.stringify(result.payment, null, 2));

// Fee Comparison
console.log('\n=== Fee Comparison for $1200 ===');
const testAmount = 1200;
const strategies = [
  { name: 'Credit Card', strategy: new CreditCardPayment('1234', 'Test', '123') },
  { name: 'PayPal', strategy: new PayPalPayment('test@example.com') },
  { name: 'Bitcoin', strategy: new BitcoinPayment('address') },
  { name: 'Apple Pay', strategy: new ApplePayPayment('device', 'token') }
];

strategies.forEach(({ name, strategy }) => {
  const fee = strategy.getTransactionFee(testAmount);
  console.log(`${name}: $${fee.toFixed(2)} (Total: $${(testAmount + fee).toFixed(2)})`);
});
