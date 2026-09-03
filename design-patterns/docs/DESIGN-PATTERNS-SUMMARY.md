# Design Patterns - Complete Implementation Guide

This directory contains comprehensive, production-ready design pattern implementations for Node.js and React.js with complete code examples.

## 📋 Node.js Design Patterns

### 1. **Singleton Pattern** (`nodejs-design-patterns/01-singleton-pattern.js`)
- **Purpose**: Ensures only one instance of a class exists
- **Use Cases**: Database connections, configuration managers, logging services
- **Key Features**:
  - Single instance management
  - Global access point
  - Lazy initialization
- **Real-world Example**: Database connection pooling, Logger instances

### 2. **Factory Pattern** (`nodejs-design-patterns/02-factory-pattern.js`)
- **Purpose**: Creates objects without specifying exact classes
- **Use Cases**: Creating different types of vehicles, database drivers, API clients
- **Key Features**:
  - Flexible object creation
  - Decouples creation from usage
  - Easy to add new types
- **Real-world Example**: Database driver factory, Payment processor factory

### 3. **Observer Pattern** (`nodejs-design-patterns/03-observer-pattern.js`)
- **Purpose**: Defines one-to-many dependency where all dependents are notified of state changes
- **Use Cases**: Event systems, pub-sub systems, real-time notifications
- **Key Features**:
  - Event emitter/listener pattern
  - Multiple subscribers
  - Loose coupling
- **Real-world Example**: WebSocket notifications, Event-driven architectures

### 4. **Strategy Pattern** (`nodejs-design-patterns/04-strategy-pattern.js`)
- **Purpose**: Defines family of algorithms and makes them interchangeable
- **Use Cases**: Payment methods, sorting algorithms, compression formats
- **Key Features**:
  - Algorithm encapsulation
  - Runtime algorithm selection
  - Easy to add new strategies
- **Real-world Example**: Payment processors (Credit Card, PayPal, Bitcoin), File compression

### 5. **Middleware Pattern** (`nodejs-design-patterns/05-middleware-pattern.js`)
- **Purpose**: Chains processing functions for request/response handling
- **Use Cases**: Express.js middleware, logging, authentication, validation
- **Key Features**:
  - Request pipeline
  - Composable middleware
  - Cross-cutting concerns
- **Real-world Example**: Express.js middleware stack, Authentication chain

### 6. **Builder Pattern** (`nodejs-design-patterns/06-builder-pattern.js`)
- **Purpose**: Separates construction of complex objects from representation
- **Use Cases**: Creating complex objects, configuration builders, query builders
- **Key Features**:
  - Step-by-step construction
  - Fluent interface
  - Immutable final object
- **Real-world Example**: SQL Query Builder, HTTP Request Builder, Document Builder

### 7. **Dependency Injection Pattern** (`nodejs-design-patterns/07-dependency-injection-pattern.js`)
- **Purpose**: Provides objects with their dependencies rather than constructing them
- **Use Cases**: Testable code, loose coupling, configurable applications
- **Key Features**:
  - IoC Container
  - Singleton management
  - Mock service support for testing
- **Real-world Example**: Service container, Dependency injection frameworks

### 8. **Adapter Pattern** (`nodejs-design-patterns/08-adapter-pattern.js`)
- **Purpose**: Converts interface of one class into another interface
- **Use Cases**: Integrating legacy code, third-party libraries, different API standards
- **Key Features**:
  - Interface translation
  - Legacy system integration
  - Multi-adapter support
- **Real-world Example**: Payment gateway adapters, Data format converters

### 9. **Decorator Pattern** (`nodejs-design-patterns/09-decorator-pattern.js`)
- **Purpose**: Attaches additional responsibilities to objects dynamically
- **Use Cases**: Adding features without altering structure, middleware, logging, caching
- **Key Features**:
  - Dynamic feature addition
  - Composable decorators
  - Transparent enhancement
- **Real-world Example**: Coffee shop ordering system, Caching layer, Logging decorator

---

## ⚛️ React.js Design Patterns

### 1. **Component Composition** (`reactjs-design-patterns/01-component-composition.jsx`)
- **Purpose**: Building complex UIs by composing simple components
- **Use Cases**: Flexible, reusable component architecture
- **Key Features**:
  - Atomic components
  - Composite components
  - Props-based composition
  - Separation of concerns
- **Best For**: Building scalable UI systems

### 2. **Render Props Pattern** (`reactjs-design-patterns/02-render-props-pattern.jsx`)
- **Purpose**: Shares code using a prop that is a function
- **Use Cases**: Code reuse, sharing state logic, cross-cutting concerns
- **Key Features**:
  - Function as props
  - State encapsulation
  - Mouse tracking, Data fetching
  - Toggle/Accordion patterns
- **Components Included**: MouseTracker, Toggle, FormProvider, DataFetcher

### 3. **Higher-Order Component (HOC)** (`reactjs-design-patterns/03-higher-order-component.jsx`)
- **Purpose**: Enhances component with additional functionality
- **Use Cases**: Code reuse, prop manipulation, authentication, theming
- **Key Features**:
  - Component wrapping
  - Props manipulation
  - State abstraction
  - Error boundaries
- **Decorators Included**: withData, withTheme, withAuth, withLogger, withErrorBoundary

### 4. **Custom Hooks Pattern** (`reactjs-design-patterns/04-custom-hooks-pattern.jsx`)
- **Purpose**: Extracts component logic into reusable functions
- **Use Cases**: Sharing stateful logic, side effects, form handling
- **Key Features**:
  - Stateful logic reuse
  - Clean separation of concerns
  - No wrapper hell
- **Hooks Included**:
  - `useLocalStorage` - Persist state to localStorage
  - `useFetch` - Data fetching with loading/error states
  - `useForm` - Form state management
  - `useDebounce` - Debounced values
  - `usePrevious` - Access previous value
  - `useAsync` - Async function handling
  - `useClickOutside` - Detect outside clicks
  - `useTimeout` - Timeout management

### 5. **Context API Pattern** (`reactjs-design-patterns/05-context-api-pattern.jsx`)
- **Purpose**: Shares data across components without prop drilling
- **Use Cases**: Theme management, authentication, global app state
- **Key Features**:
  - Global state management
  - Theme switching
  - Authentication context
  - Notification system
- **Contexts Included**:
  - `ThemeContext` - Theme and color management
  - `AuthContext` - User authentication state
  - `NotificationContext` - Toast notifications

### 6. **Compound Components Pattern** (`reactjs-design-patterns/06-compound-components-pattern.jsx`)
- **Purpose**: Components that work together to form a complete UI
- **Use Cases**: Flexible component APIs, consistent behavior
- **Key Features**:
  - Implicit state sharing
  - Flexible composition
  - Context-based communication
- **Components Included**:
  - `Accordion` - Expandable sections
  - `Tabs` - Tab navigation
  - `Modal` - Modal dialogs
  - `Card` - Card container with header/body/footer

---

## 🚀 Quick Start Guide

### Running Node.js Examples
```bash
# Navigate to the pattern file
cd nodejs-design-patterns

# Run any pattern
node 01-singleton-pattern.js
node 02-factory-pattern.js
# ... and so on
```

### Using React Examples
```bash
# Copy pattern into your React project
cp reactjs-design-patterns/01-component-composition.jsx ./src/

# Import and use in your component
import ComponentCompositionDemo from './01-component-composition';

export default function App() {
  return <ComponentCompositionDemo />;
}
```

---

## 📚 Pattern Comparison

### When to Use Each Pattern

| Pattern | Best For | Complexity | Learning Curve |
|---------|----------|-----------|-----------------|
| Singleton | Single instances | Low | Easy |
| Factory | Object creation | Medium | Easy |
| Observer | Event handling | Medium | Easy |
| Strategy | Algorithm selection | Medium | Medium |
| Middleware | Request processing | Medium | Easy |
| Builder | Complex objects | Medium | Medium |
| Dependency Injection | Loose coupling | High | Hard |
| Adapter | Legacy integration | Medium | Medium |
| Decorator | Feature addition | Medium | Medium |
| Component Composition | UI building | Medium | Easy |
| Render Props | Logic reuse | Medium | Hard |
| HOC | Component enhancement | Medium | Medium |
| Custom Hooks | Logic reuse | Medium | Easy |
| Context API | Global state | Medium | Easy |
| Compound Components | Component API | High | Hard |

---

## 💡 Design Pattern Principles

### SOLID Principles
- **S**ingle Responsibility: Each class/component has one reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Subtypes must be substitutable
- **I**nterface Segregation: Many client-specific interfaces
- **D**ependency Inversion: Depend on abstractions, not concretions

### Key Patterns Benefits
1. **Code Reusability** - Write once, use everywhere
2. **Maintainability** - Easy to understand and modify
3. **Scalability** - Handle growth gracefully
4. **Testability** - Easier to test in isolation
5. **Flexibility** - Easy to swap implementations

---

## 🔗 Pattern Relationships

### Node.js Pattern Dependencies
```
Singleton → Dependency Injection
↓
Factory → Strategy
↓
Observer → Middleware
↓
Builder → Adapter → Decorator
```

### React Pattern Dependencies
```
Component Composition → Render Props
↓
HOC → Custom Hooks
↓
Context API → Compound Components
```

---

## 📖 Study Guide

### Beginner Level
1. Start with **Component Composition** (React) or **Singleton** (Node.js)
2. Learn **Factory Pattern** (Node.js) or **Custom Hooks** (React)
3. Understand **Observer Pattern** (Node.js) or **Context API** (React)

### Intermediate Level
4. Master **Strategy Pattern** (Node.js) or **Render Props** (React)
5. Learn **Middleware Pattern** (Node.js) or **HOC** (React)
6. Study **Builder Pattern** (Node.js)

### Advanced Level
7. Deep dive into **Dependency Injection** (Node.js) or **Compound Components** (React)
8. Understand **Adapter Pattern** (Node.js)
9. Master **Decorator Pattern** (Node.js)

---

## 🎯 Real-World Applications

### E-commerce Platform
- **Patterns Used**: Factory (products), Strategy (payment), Observer (orders), Builder (cart)
- **Location**: `nodejs-design-patterns/02-factory-pattern.js`, `04-strategy-pattern.js`

### User Management System
- **Patterns Used**: Singleton (DB), Dependency Injection (services), Observer (events)
- **Location**: `nodejs-design-patterns/01-singleton-pattern.js`, `07-dependency-injection-pattern.js`

### Dashboard Application
- **Patterns Used**: Context API (theme), Custom Hooks (data), Compound Components (layout)
- **Location**: `reactjs-design-patterns/05-context-api-pattern.jsx`, `06-compound-components-pattern.jsx`

---

## ✅ Checklist for Using Patterns

- [ ] Understand the problem the pattern solves
- [ ] Review the complete implementation
- [ ] Test the example code locally
- [ ] Identify where to apply in your project
- [ ] Adapt the pattern to your specific needs
- [ ] Write tests for your implementation
- [ ] Document your usage
- [ ] Review for performance implications
- [ ] Consider edge cases
- [ ] Refactor if needed

---

## 📝 Notes

- All patterns include complete, production-ready implementations
- Each file is self-contained and can be run independently
- Code includes detailed comments explaining each part
- Real-world examples demonstrate practical usage
- No external dependencies required (except React for React patterns)

---

## 🤝 Contributing

To add new patterns:
1. Create a new file following the naming convention
2. Include complete implementation with examples
3. Add detailed comments
4. Update this summary file
5. Test the code thoroughly

---

## 📞 Questions?

Refer to the specific pattern file for:
- Detailed implementation
- Multiple usage examples
- Edge cases and best practices
- Performance considerations

**Last Updated**: 2026-08-28
**Version**: 1.0
