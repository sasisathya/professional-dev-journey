# Spring Boot Dependency Injection & IoC - Complete Interview Guide

## Table of Contents
1. [What is IoC?](#what-is-ioc)
2. [What is Dependency Injection?](#what-is-dependency-injection)
3. [Spring Container & Beans](#spring-container--beans)
4. [Annotations](#annotations)
5. [Bean Lifecycle](#bean-lifecycle)
6. [Types of Injection](#types-of-injection)
7. [Interview Questions](#interview-questions)

---

## What is IoC?

**IoC (Inversion of Control):** A design principle where the framework controls object creation and lifecycle management, rather than the application code.

### Traditional Approach (Tight Coupling)
```java
public class UserService {
  private UserRepository repository;

  public UserService() {
    // Application creates dependency
    this.repository = new UserRepository();
  }

  public User getUser(int id) {
    return repository.findById(id);
  }
}

// Problems:
// - Tight coupling with UserRepository
// - Hard to test (can't mock)
// - Difficult to change implementation
```

### IoC Approach (Loose Coupling)
```java
public class UserService {
  private UserRepository repository;

  public UserService(UserRepository repository) {
    // Framework injects dependency
    this.repository = repository;
  }

  public User getUser(int id) {
    return repository.findById(id);
  }
}

// Benefits:
// - Loose coupling
// - Easy to test (inject mock)
// - Easy to change implementation
```

### IoC Container
The **IoC Container** (Spring Container) is responsible for:
- Creating objects
- Managing object lifecycle
- Injecting dependencies
- Storing beans

```java
// Spring container does this:
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
UserRepository repository = new UserRepository();
UserService service = new UserService(repository);
```

---

## What is Dependency Injection?

**Dependency Injection (DI):** A pattern where objects receive their dependencies from external sources (the framework) rather than creating them.

### Without DI (Tight Coupling)
```java
public class EmailService {
  private MailServer mailServer = new MailServer(); // Creates own dependency

  public void sendEmail(String to, String message) {
    mailServer.send(to, message);
  }
}

// Problems: Hard to test, hard to replace MailServer
```

### With DI (Loose Coupling)
```java
public class EmailService {
  private MailServer mailServer;

  public EmailService(MailServer mailServer) {
    this.mailServer = mailServer; // Receives dependency
  }

  public void sendEmail(String to, String message) {
    mailServer.send(to, message);
  }
}

// Testing:
@Test
public void testEmailService() {
  MailServer mockMailServer = mock(MailServer.class);
  EmailService service = new EmailService(mockMailServer);
  service.sendEmail("test@example.com", "Test");
  verify(mockMailServer).send("test@example.com", "Test");
}
```

---

## Spring Container & Beans

### What is a Bean?

A **Bean** is an object that is instantiated, assembled, and managed by the Spring IoC container.

### Spring Container

```java
// Create Spring Container
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);

// Get bean from container
UserService service = context.getBean(UserService.class);
UserRepository repository = context.getBean(UserRepository.class);

// Beans are managed by Spring
// Same instance returned if singleton scope
UserService service1 = context.getBean(UserService.class);
UserService service2 = context.getBean(UserService.class);
// service1 == service2 (same instance)
```

### Bean Scopes

```java
// Singleton (default) - one instance for entire application
@Component
public class UserService {}

// Prototype - new instance each time
@Component
@Scope("prototype")
public class PrototypeService {}

// Request - new instance per HTTP request
@Component
@Scope("request")
public class RequestService {}

// Session - one instance per HTTP session
@Component
@Scope("session")
public class SessionService {}
```

---

## Annotations

### @Component
```java
@Component
public class UserRepository {
  public User findById(int id) {
    return new User(id, "John");
  }
}

// Spring automatically:
// - Creates instance
// - Stores in container as bean
// - Name: "userRepository" (first letter lowercase)
```

### @Service
```java
@Service
public class UserService {
  // Specialization of @Component for service layer
  // Indicates business logic
}
```

### @Repository
```java
@Repository
public class UserRepository {
  // Specialization of @Component for data access layer
  // Provides exception translation for database operations
}
```

### @Controller & @RestController
```java
@RestController
@RequestMapping("/users")
public class UserController {
  @GetMapping("/{id}")
  public User getUser(@PathVariable int id) {
    return userService.getUser(id);
  }
}
```

### @Autowired
```java
@Service
public class UserService {
  @Autowired
  private UserRepository repository; // Automatic injection

  public User getUser(int id) {
    return repository.findById(id);
  }
}

// Spring finds UserRepository bean and injects it
```

### @Configuration & @Bean
```java
@Configuration
public class AppConfig {
  @Bean
  public UserRepository userRepository() {
    return new UserRepository();
  }

  @Bean
  public UserService userService(UserRepository repository) {
    return new UserService(repository);
  }

  // Spring calls these methods and stores results as beans
}
```

---

## Bean Lifecycle

The Spring Bean goes through several stages:

```
1. Instantiation
   ↓
2. Populate Properties
   ↓
3. BeanNameAware.setBeanName() (if implements interface)
   ↓
4. BeanFactoryAware.setBeanFactory() (if implements interface)
   ↓
5. BeanPostProcessor.postProcessBeforeInitialization()
   ↓
6. @PostConstruct / afterPropertiesSet() / init-method
   ↓
7. BeanPostProcessor.postProcessAfterInitialization()
   ↓
8. Bean Ready to Use
   ↓
9. Application Shutdown
   ↓
10. @PreDestroy / destroy() / destroy-method
```

### Example

```java
@Component
public class MyBean implements InitializingBean, DisposableBean {

  @Autowired
  private UserRepository repository;

  // Called after constructor, before init
  @PostConstruct
  public void init() {
    System.out.println("Initializing bean");
    // Load initial data
  }

  @Override
  public void afterPropertiesSet() {
    System.out.println("Properties set");
  }

  // Called before application shutdown
  @PreDestroy
  public void cleanup() {
    System.out.println("Cleaning up");
    // Close resources
  }

  @Override
  public void destroy() {
    System.out.println("Destroying bean");
  }
}
```

### Lifecycle Callbacks

```java
@Component
public class DataSourceConfig {

  @PostConstruct
  public void init() {
    // Called after bean is constructed and dependencies injected
    System.out.println("Initializing database connection");
  }

  @PreDestroy
  public void cleanup() {
    // Called before bean is destroyed
    System.out.println("Closing database connection");
  }
}
```

---

## Types of Injection

### 1. Constructor Injection (Recommended)
```java
@Service
public class UserService {
  private final UserRepository repository;

  public UserService(UserRepository repository) {
    this.repository = repository;
  }

  public User getUser(int id) {
    return repository.findById(id);
  }
}

// Benefits:
// - Immutability (final)
// - Explicit dependencies
// - Easy to test
// - No setter needed
```

### 2. Setter Injection
```java
@Service
public class UserService {
  private UserRepository repository;

  @Autowired
  public void setRepository(UserRepository repository) {
    this.repository = repository;
  }

  public User getUser(int id) {
    return repository.findById(id);
  }
}

// Drawback: Mutable, optional dependency
```

### 3. Field Injection
```java
@Service
public class UserService {
  @Autowired
  private UserRepository repository; // Direct field injection

  public User getUser(int id) {
    return repository.findById(id);
  }
}

// Drawback: Hard to test, mutable, hidden dependencies
// NOT RECOMMENDED
```

### 4. Interface Injection
```java
public interface RepositoryInjector {
  void setRepository(UserRepository repo);
}

@Service
public class UserService implements RepositoryInjector {
  private UserRepository repository;

  @Override
  public void setRepository(UserRepository repo) {
    this.repository = repo;
  }
}
```

---

## Qualifier & Primary

### @Qualifier
```java
// Multiple implementations
public interface UserRepository {
  User findById(int id);
}

@Component
public class JdbcUserRepository implements UserRepository {
  public User findById(int id) { }
}

@Component
public class MongoUserRepository implements UserRepository {
  public User findById(int id) { }
}

// Which one to inject?
@Service
public class UserService {
  @Autowired
  @Qualifier("mongoUserRepository")
  private UserRepository repository; // Specifies which implementation
}
```

### @Primary
```java
@Component
public class JdbcUserRepository implements UserRepository { }

@Component
@Primary // Use this if @Qualifier not specified
public class MongoUserRepository implements UserRepository { }

// In UserService:
@Autowired
private UserRepository repository; // MongoUserRepository injected
```

---

## Interview Questions

### Q1: What is IoC?
**Answer:** IoC (Inversion of Control) is a design principle where the framework controls object creation and lifecycle management. Instead of the application code creating objects, the Spring container creates and manages them.

### Q2: What is Dependency Injection?
**Answer:** Dependency Injection is a pattern where objects receive their dependencies from external sources (the framework) rather than creating them. This reduces coupling and makes testing easier.

### Q3: What are the types of injection?
**Answer:**
1. Constructor Injection (recommended)
2. Setter Injection
3. Field Injection (not recommended)
4. Interface Injection

### Q4: What is a Spring Bean?
**Answer:** A Bean is an object that is instantiated, assembled, and managed by the Spring IoC container. Beans are created from classes annotated with @Component, @Service, @Repository, etc.

### Q5: What is the Bean lifecycle?
**Answer:** Instantiation → Populate Properties → Aware interfaces → postProcessBeforeInitialization → @PostConstruct → postProcessAfterInitialization → Ready → @PreDestroy → Destroy

### Q6: What is @Autowired?
**Answer:** @Autowired is an annotation that tells Spring to inject a dependency automatically. Spring finds a matching bean and injects it.

### Q7: What is the difference between @Component, @Service, @Repository?
**Answer:** All are stereotypes for bean definition. @Component is generic, @Service is for service layer (business logic), @Repository is for data access layer (with exception translation).

### Q8: Constructor Injection vs Setter Injection?
**Answer:** Constructor injection is recommended because it creates immutable objects, shows explicit dependencies, and is easier to test. Setter injection allows optional dependencies but creates mutable objects.

---

## Key Takeaways

1. **IoC** - Framework controls object creation
2. **DI** - Objects receive dependencies from outside
3. **Spring Container** - Manages bean lifecycle
4. **Beans** - Objects managed by Spring
5. **Annotations** - @Component, @Service, @Repository, @Autowired
6. **Constructor Injection** - Recommended approach
7. **Bean Lifecycle** - Init → Use → Destroy

---

**Spring & Dependency Injection are core to modern Java development!**
