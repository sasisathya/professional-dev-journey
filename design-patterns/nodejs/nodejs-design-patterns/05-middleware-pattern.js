// Middleware Pattern - Allows chaining of processing functions that can inspect, transform, or halt requests
// Use case: Express.js middleware, logging, authentication, request validation, compression

class Request {
  constructor(method, path, body = {}, headers = {}) {
    this.method = method;
    this.path = path;
    this.body = body;
    this.headers = headers;
    this.startTime = Date.now();
    this.metadata = {};
  }
}

class Response {
  constructor() {
    this.statusCode = 200;
    this.body = null;
    this.headers = {};
  }

  setStatus(code) {
    this.statusCode = code;
    return this;
  }

  setBody(body) {
    this.body = body;
    return this;
  }

  setHeader(key, value) {
    this.headers[key] = value;
    return this;
  }
}

class Application {
  constructor() {
    this.middlewares = [];
  }

  use(middleware) {
    this.middlewares.push(middleware);
    console.log(`✅ Middleware registered: ${middleware.name || 'anonymous'}`);
    return this;
  }

  async execute(request) {
    const response = new Response();
    let index = -1;

    const dispatch = async (i) => {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'));
      index = i;

      if (i < this.middlewares.length) {
        const middleware = this.middlewares[i];
        try {
          await middleware(request, response, () => dispatch(i + 1));
        } catch (error) {
          console.error(`❌ Middleware error: ${error.message}`);
          response.setStatus(500).setBody({ error: error.message });
        }
      }
    };

    await dispatch(0);
    return response;
  }
}

// Middleware Functions
const loggingMiddleware = (request, response, next) => {
  console.log(`\n📝 [Logging] ${request.method} ${request.path}`);
  console.log(`   Headers: ${JSON.stringify(request.headers)}`);
  return next();
};

const authenticationMiddleware = (request, response, next) => {
  console.log(`🔐 [Auth] Checking authentication...`);
  const token = request.headers['authorization'];

  if (!token) {
    console.log(`❌ [Auth] No authorization token provided`);
    return response.setStatus(401).setBody({ error: 'Unauthorized' });
  }

  if (token !== 'Bearer valid-token-123') {
    console.log(`❌ [Auth] Invalid token`);
    return response.setStatus(403).setBody({ error: 'Forbidden' });
  }

  request.metadata.user = { id: 1, name: 'John Doe' };
  console.log(`✅ [Auth] User authenticated: ${request.metadata.user.name}`);
  return next();
};

const validationMiddleware = (request, response, next) => {
  console.log(`✔️  [Validation] Validating request body...`);

  if (request.method === 'POST' || request.method === 'PUT') {
    if (!request.body || Object.keys(request.body).length === 0) {
      console.log(`❌ [Validation] Empty body not allowed`);
      return response.setStatus(400).setBody({ error: 'Request body cannot be empty' });
    }
  }

  console.log(`✅ [Validation] Request body is valid`);
  return next();
};

const corsMiddleware = (request, response, next) => {
  console.log(`🌐 [CORS] Setting CORS headers...`);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  console.log(`✅ [CORS] CORS headers added`);
  return next();
};

const requestTimingMiddleware = (request, response, next) => {
  console.log(`⏱️  [Timing] Request started`);
  return next().then(() => {
    const duration = Date.now() - request.startTime;
    response.setHeader('X-Response-Time', `${duration}ms`);
    console.log(`⏱️  [Timing] Request completed in ${duration}ms`);
  });
};

const dataTransformMiddleware = (request, response, next) => {
  console.log(`🔄 [Transform] Processing data...`);
  if (request.body && typeof request.body === 'object') {
    request.body = {
      ...request.body,
      processedAt: new Date().toISOString(),
      userId: request.metadata.user?.id
    };
  }
  console.log(`✅ [Transform] Data transformed`);
  return next();
};

const responseMiddleware = (request, response, next) => {
  console.log(`📤 [Response] Preparing response...`);
  if (!response.body) {
    response.setBody({
      success: true,
      message: 'Request processed successfully',
      path: request.path,
      method: request.method,
      user: request.metadata.user
    });
  }
  console.log(`✅ [Response] Response prepared`);
  return next();
};

// Usage Example
console.log('=== Setting up Application ===\n');
const app = new Application();

app
  .use(loggingMiddleware)
  .use(corsMiddleware)
  .use(authenticationMiddleware)
  .use(validationMiddleware)
  .use(dataTransformMiddleware)
  .use(requestTimingMiddleware)
  .use(responseMiddleware);

// Test Case 1: Valid POST request
(async () => {
  console.log('\n\n========== TEST 1: Valid POST Request ==========');
  const request1 = new Request('POST', '/api/users', { name: 'Alice', email: 'alice@example.com' }, {
    'authorization': 'Bearer valid-token-123',
    'content-type': 'application/json'
  });
  const response1 = await app.execute(request1);
  console.log(`\n📥 Response Status: ${response1.statusCode}`);
  console.log(`📥 Response Body:`, JSON.stringify(response1.body, null, 2));
  console.log(`📥 Response Headers:`, response1.headers);
})();

// Test Case 2: Missing authorization
(async () => {
  console.log('\n\n========== TEST 2: Missing Authorization ==========');
  const request2 = new Request('GET', '/api/users', {}, {
    'content-type': 'application/json'
  });
  const response2 = await app.execute(request2);
  console.log(`\n📥 Response Status: ${response2.statusCode}`);
  console.log(`📥 Response Body:`, JSON.stringify(response2.body, null, 2));
})();

// Test Case 3: Invalid token
(async () => {
  console.log('\n\n========== TEST 3: Invalid Token ==========');
  const request3 = new Request('POST', '/api/products', { name: 'Laptop', price: 999 }, {
    'authorization': 'Bearer invalid-token',
    'content-type': 'application/json'
  });
  const response3 = await app.execute(request3);
  console.log(`\n📥 Response Status: ${response3.statusCode}`);
  console.log(`📥 Response Body:`, JSON.stringify(response3.body, null, 2));
})();

// Test Case 4: Empty body
(async () => {
  console.log('\n\n========== TEST 4: Empty Request Body ==========');
  const request4 = new Request('POST', '/api/users', {}, {
    'authorization': 'Bearer valid-token-123',
    'content-type': 'application/json'
  });
  const response4 = await app.execute(request4);
  console.log(`\n📥 Response Status: ${response4.statusCode}`);
  console.log(`📥 Response Body:`, JSON.stringify(response4.body, null, 2));
})();
