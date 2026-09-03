// Adapter Pattern - Converts interface of one class into another interface clients expect
// Use case: Integrating legacy code, third-party libraries, different API standards

// === Legacy Payment System ===
class LegacyPaymentProcessor {
  processPayment(amount, cardData) {
    console.log(`💳 Processing ${amount} with legacy system`);
    console.log(`   Card: ${cardData.number.slice(-4)}`);
    return {
      transactionId: `LEGACY-${Date.now()}`,
      amount,
      status: 'PROCESSED',
      timestamp: new Date().toISOString()
    };
  }

  refundPayment(transactionId, amount) {
    console.log(`↩️  Refunding ${amount} for transaction ${transactionId}`);
    return {
      refundId: `REF-${Date.now()}`,
      originalTransaction: transactionId,
      refundAmount: amount,
      status: 'REFUNDED'
    };
  }
}

// === Modern Payment Interface (Expected by new code) ===
class ModernPaymentInterface {
  pay(amount, paymentMethod) {
    throw new Error('pay() must be implemented');
  }

  refund(paymentId, amount) {
    throw new Error('refund() must be implemented');
  }

  getTransactionStatus(paymentId) {
    throw new Error('getTransactionStatus() must be implemented');
  }
}

// === Adapter to bridge Legacy and Modern Systems ===
class LegacyPaymentAdapter extends ModernPaymentInterface {
  constructor(legacyProcessor) {
    super();
    this.legacyProcessor = legacyProcessor;
    this.transactions = new Map();
  }

  pay(amount, paymentMethod) {
    console.log(`🔄 Adapter: Converting modern request to legacy format`);

    const legacyCardData = {
      number: paymentMethod.cardNumber,
      expiry: paymentMethod.expiryDate,
      cvv: paymentMethod.cvv
    };

    const result = this.legacyProcessor.processPayment(amount, legacyCardData);
    this.transactions.set(result.transactionId, result);

    return {
      paymentId: result.transactionId,
      amount,
      method: paymentMethod.type,
      status: result.status,
      timestamp: result.timestamp
    };
  }

  refund(paymentId, amount) {
    console.log(`🔄 Adapter: Converting modern refund to legacy format`);
    const result = this.legacyProcessor.refundPayment(paymentId, amount);

    return {
      refundId: result.refundId,
      paymentId: result.originalTransaction,
      amount: result.refundAmount,
      status: result.status,
      timestamp: new Date().toISOString()
    };
  }

  getTransactionStatus(paymentId) {
    const transaction = this.transactions.get(paymentId);
    if (!transaction) {
      return { status: 'NOT_FOUND' };
    }

    return {
      paymentId,
      status: transaction.status,
      amount: transaction.amount,
      timestamp: transaction.timestamp
    };
  }
}

// === Different Legacy API (e.g., European Payment Gateway) ===
class EuropeanPaymentGateway {
  enviarPago(cantidad, datosPagador) {
    console.log(`💶 Processing ${cantidad} EUR with European gateway`);
    console.log(`   Payer: ${datosPagador.nombre}`);
    return {
      idTransaccion: `EU-${Date.now()}`,
      cantidad,
      estado: 'COMPLETADO',
      fecha: new Date().toISOString()
    };
  }

  devolverPago(idTransaccion, cantidad) {
    console.log(`↩️  Devolviendo ${cantidad} EUR para transacción ${idTransaccion}`);
    return {
      idDevolucion: `REF-EU-${Date.now()}`,
      idTransaccionOriginal: idTransaccion,
      cantidadDevuelta: cantidad,
      estado: 'DEVUELTO'
    };
  }
}

class EuropeanPaymentAdapter extends ModernPaymentInterface {
  constructor(gateway) {
    super();
    this.gateway = gateway;
    this.transactions = new Map();
  }

  pay(amount, paymentMethod) {
    console.log(`🔄 Adapter: Converting to European gateway format`);

    const datosPagador = {
      nombre: paymentMethod.cardHolder,
      numero: paymentMethod.cardNumber,
      vencimiento: paymentMethod.expiryDate
    };

    const result = this.gateway.enviarPago(amount, datosPagador);
    this.transactions.set(result.idTransaccion, result);

    return {
      paymentId: result.idTransaccion,
      amount,
      method: paymentMethod.type,
      status: result.estado,
      timestamp: result.fecha
    };
  }

  refund(paymentId, amount) {
    console.log(`🔄 Adapter: Converting refund to European format`);
    const result = this.gateway.devolverPago(paymentId, amount);

    return {
      refundId: result.idDevolucion,
      paymentId: result.idTransaccionOriginal,
      amount: result.cantidadDevuelta,
      status: result.estado,
      timestamp: new Date().toISOString()
    };
  }

  getTransactionStatus(paymentId) {
    const transaction = this.transactions.get(paymentId);
    if (!transaction) {
      return { status: 'NOT_FOUND' };
    }

    return {
      paymentId,
      status: transaction.estado,
      amount: transaction.cantidad,
      timestamp: transaction.fecha
    };
  }
}

// === Modern implementation that works with adapters ===
class PaymentProcessor {
  constructor(paymentGateway) {
    this.gateway = paymentGateway;
  }

  processPayment(amount, method) {
    console.log(`\n--- Processing Payment ---`);
    const result = this.gateway.pay(amount, method);
    console.log(`✅ Payment processed successfully`);
    return result;
  }

  refundPayment(paymentId, amount) {
    console.log(`\n--- Processing Refund ---`);
    const result = this.gateway.refund(paymentId, amount);
    console.log(`✅ Refund processed successfully`);
    return result;
  }

  checkStatus(paymentId) {
    const status = this.gateway.getTransactionStatus(paymentId);
    console.log(`Status: ${JSON.stringify(status)}`);
    return status;
  }
}

// === Data Format Adapter ===
class XMLToJSONAdapter {
  constructor(xmlParser) {
    this.xmlParser = xmlParser;
  }

  parse(xmlString) {
    return this.xmlParser.parseXML(xmlString);
  }

  stringify(jsonObject) {
    return this.xmlParser.stringifyToXML(jsonObject);
  }
}

class LegacyXMLParser {
  parseXML(xmlString) {
    console.log(`📄 Parsing XML: ${xmlString.substring(0, 30)}...`);
    return {
      root: {
        data: 'parsed from XML'
      }
    };
  }

  stringifyToXML(object) {
    console.log(`📄 Converting to XML:`, object);
    return '<root><data>converted to XML</data></root>';
  }
}

// Usage Example
console.log('========== ADAPTER PATTERN - PAYMENT SYSTEMS ==========\n');

// Test Case 1: Legacy Payment System with Adapter
console.log('=== Using Legacy Payment System via Adapter ===');
const legacyProcessor = new LegacyPaymentProcessor();
const legacyAdapter = new LegacyPaymentAdapter(legacyProcessor);
const processor1 = new PaymentProcessor(legacyAdapter);

const paymentMethod1 = {
  type: 'credit_card',
  cardNumber: '1234567890123456',
  cardHolder: 'John Doe',
  expiryDate: '12/25',
  cvv: '123'
};

const payment1 = processor1.processPayment(1000, paymentMethod1);
console.log(`\n📋 Result:`, JSON.stringify(payment1, null, 2));

processor1.checkStatus(payment1.paymentId);

console.log('\n--- Refunding Payment ---');
const refund1 = processor1.refundPayment(payment1.paymentId, 500);
console.log(`\n📋 Result:`, JSON.stringify(refund1, null, 2));

// Test Case 2: European Payment Gateway with Adapter
console.log('\n\n=== Using European Gateway via Adapter ===');
const europeanGateway = new EuropeanPaymentGateway();
const europeanAdapter = new EuropeanPaymentAdapter(europeanGateway);
const processor2 = new PaymentProcessor(europeanAdapter);

const paymentMethod2 = {
  type: 'debit_card',
  cardNumber: '9876543210987654',
  cardHolder: 'Marie Dubois',
  expiryDate: '08/26'
};

const payment2 = processor2.processPayment(500, paymentMethod2);
console.log(`\n📋 Result:`, JSON.stringify(payment2, null, 2));

processor2.checkStatus(payment2.paymentId);

// Test Case 3: Data Format Adapter
console.log('\n\n========== ADAPTER PATTERN - DATA FORMATS ==========\n');

const xmlParser = new LegacyXMLParser();
const xmlAdapter = new XMLToJSONAdapter(xmlParser);

const sampleData = {
  user: {
    id: 123,
    name: 'Alice',
    email: 'alice@example.com'
  }
};

console.log('Converting JSON to XML:');
const xmlOutput = xmlAdapter.stringify(sampleData);
console.log(`Output: ${xmlOutput}\n`);

console.log('Parsing XML to JSON:');
const jsonOutput = xmlAdapter.parse('<root><name>Bob</name></root>');
console.log(`Output:`, JSON.stringify(jsonOutput, null, 2));

// Demonstrate seamless integration
console.log('\n\n========== SEAMLESS INTEGRATION ==========\n');

console.log('Modern code doesn\'t know which legacy system is being used:');

const gateways = [
  { name: 'Legacy System', gateway: legacyAdapter },
  { name: 'European Gateway', gateway: europeanAdapter }
];

gateways.forEach(({ name, gateway }) => {
  console.log(`\n--- Testing with ${name} ---`);
  const processor = new PaymentProcessor(gateway);

  const result = processor.processPayment(250, {
    type: 'credit_card',
    cardNumber: '1111111111111111',
    cardHolder: 'Test User',
    expiryDate: '06/27'
  });

  console.log(`Returned payment ID: ${result.paymentId}`);
});
