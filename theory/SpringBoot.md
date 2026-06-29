# Spring Boot - Professional Interview Guide

## Table of Contents
1. [Spring Framework Basics](#spring-framework-basics)
2. [Spring Boot Fundamentals](#spring-boot-fundamentals)
3. [Dependency Injection & IoC](#dependency-injection--ioc)
4. [Spring MVC & REST APIs](#spring-mvc--rest-apis)
5. [Data Access (JPA/Hibernate)](#data-access-jpahibernate)
6. [Security](#security)
7. [Microservices with Spring](#microservices-with-spring)
8. [Testing & Best Practices](#testing--best-practices)

---

## Spring Framework Basics

### What is Spring Framework?
**Spring Framework** is a comprehensive Java framework for building enterprise applications. Provides infrastructure support with modules for dependency injection, data access, web, security, testing, and more.

**Core Features:**
- **Dependency Injection (DI):** Loose coupling via IoC container
- **Aspect-Oriented Programming (AOP):** Cross-cutting concerns (logging, security)
- **Transaction Management:** Declarative transactions
- **MVC Framework:** Web applications
- **Data Access:** JDBC, JPA, Hibernate integration

**Key takeaway:** Enterprise framework. DI + AOP + comprehensive modules.

---

### Spring vs Spring Boot
**Spring Framework:**
- Manual configuration (XML or Java config)
- Requires explicit dependency management
- Boilerplate setup for projects
- More control but verbose

**Spring Boot:**
- **Auto-configuration:** Automatically configures based on dependencies
- **Starter dependencies:** Pre-packaged dependency sets
- **Embedded server:** Tomcat/Jetty/Undertow embedded
- **Production-ready features:** Metrics, health checks
- **Opinionated defaults:** Convention over configuration

**Key takeaway:** Spring Boot = Spring + auto-config + embedded server + starters.

---

## Spring Boot Fundamentals

### Spring Boot Auto-Configuration
**Definition:** Automatically configures beans based on classpath dependencies, properties, and other beans.

**How it works:**
1. `@EnableAutoConfiguration` annotation scans classpath
2. Loads configuration classes from `spring.factories`
3. Conditional annotations determine which beans to create

**Example:**
- If `spring-boot-starter-data-jpa` on classpath → auto-configures DataSource, EntityManagerFactory
- If `application.properties` has `spring.datasource.url` → uses those settings

**Exclude auto-config:**
```java
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
```

**Key takeaway:** Classpath + properties → automatic bean creation.

---

### @SpringBootApplication
**Definition:** Meta-annotation combining three annotations:

```java
@SpringBootConfiguration // = @Configuration (Spring config class)
@EnableAutoConfiguration // Enable auto-configuration
@ComponentScan // Scan for components in package and sub-packages
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

**Key takeaway:** Entry point. Combines config + auto-config + component scan.

---

### Spring Boot Starters
**Definition:** Pre-packaged dependency sets for common use cases.

**Common starters:**
- `spring-boot-starter-web`: Web apps (Spring MVC, Tomcat, Jackson)
- `spring-boot-starter-data-jpa`: JPA + Hibernate
- `spring-boot-starter-security`: Spring Security
- `spring-boot-starter-test`: Testing (JUnit, Mockito, AssertJ)
- `spring-boot-starter-actuator`: Production monitoring
- `spring-boot-starter-validation`: Bean validation

**Advantage:** Single dependency brings all required libraries.

**Key takeaway:** Pre-configured dependency bundles. Simplifies pom.xml.

---

### application.properties vs application.yml
**Configuration files** for Spring Boot properties.

**application.properties:**
```properties
server.port=8081
spring.datasource.url=jdbc:mysql://localhost/db
spring.datasource.username=root
```

**application.yml:**
```yaml
server:
  port: 8081
spring:
  datasource:
    url: jdbc:mysql://localhost/db
    username: root
```

**Profiles:**
```properties
# application-dev.properties
spring.profiles.active=dev
```

**@Value injection:**
```java
@Value("${server.port}")
private int port;
```

**Key takeaway:** External configuration. YAML more readable. Profiles for environments.

---

### Profiles
**Definition:** Separate configuration for different environments (dev, test, prod).

**Activate profile:**
```properties
spring.profiles.active=dev
```

**Profile-specific files:**
- `application-dev.properties`
- `application-prod.properties`

**Conditional beans:**
```java
@Configuration
@Profile("dev")
public class DevConfig {
    @Bean
    public DataSource dataSource() { /* dev DB */ }
}
```

**Key takeaway:** Environment-specific configuration. Activate via property.

---

### Spring Boot Actuator
**Definition:** Production-ready features for monitoring and managing applications.

**Endpoints:**
- `/actuator/health`: Application health status
- `/actuator/metrics`: Application metrics (memory, CPU, HTTP requests)
- `/actuator/info`: Custom application info
- `/actuator/env`: Environment properties
- `/actuator/loggers`: View/modify log levels

**Enable:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

**Secure endpoints:**
```properties
management.endpoints.web.exposure.include=health,metrics
```

**Key takeaway:** Production monitoring. Health checks, metrics, management endpoints.

---

## Dependency Injection & IoC

### IoC (Inversion of Control)
**Definition:** Design principle where control of object creation and dependencies is inverted from application code to framework.

**Traditional approach:** Objects create their dependencies.
```java
class Service {
    private Repository repo = new Repository(); // Tight coupling
}
```

**IoC approach:** Framework injects dependencies.
```java
class Service {
    private Repository repo; // Injected by Spring
}
```

**Key takeaway:** Framework controls object creation. Decouples code.

---

### Dependency Injection Types
**1. Constructor Injection (Recommended):**
```java
@Service
public class UserService {
    private final UserRepository repo;

    @Autowired // Optional in Spring 4.3+
    public UserService(UserRepository repo) {
        this.repo = repo;
    }
}
```

**2. Setter Injection:**
```java
@Service
public class UserService {
    private UserRepository repo;

    @Autowired
    public void setRepo(UserRepository repo) {
        this.repo = repo;
    }
}
```

**3. Field Injection (Not recommended):**
```java
@Service
public class UserService {
    @Autowired
    private UserRepository repo;
}
```

**Best practice:** Constructor injection (immutable, testable, clear dependencies).

**Key takeaway:** Constructor > Setter > Field. Constructor for required deps.

---

### @Component, @Service, @Repository, @Controller
**Stereotype annotations** for different layers:

**@Component:** Generic component. Base annotation.

**@Service:** Business logic layer. Semantically indicates service.

**@Repository:** Data access layer. Enables exception translation (JDBC → DataAccessException).

**@Controller:** Web layer (Spring MVC). Handles HTTP requests.

**@RestController:** `@Controller + @ResponseBody`. Returns JSON/XML directly.

```java
@Service
public class UserService { }

@Repository
public interface UserRepository extends JpaRepository<User, Long> { }

@RestController
@RequestMapping("/api/users")
public class UserController { }
```

**Key takeaway:** Semantic layer annotations. All are @Component specializations.

---

### Bean Scopes
**Definition:** Lifecycle of bean instances.

**Scopes:**
1. **singleton (default):** One instance per Spring container
2. **prototype:** New instance every time requested
3. **request:** One instance per HTTP request (web apps)
4. **session:** One instance per HTTP session (web apps)
5. **application:** One instance per ServletContext
6. **websocket:** One instance per WebSocket session

```java
@Bean
@Scope("prototype")
public MyBean myBean() { }
```

**Key takeaway:** Singleton = default. Prototype = new instance each time.

---

### @Autowired, @Qualifier, @Primary
**@Autowired:** Inject dependency by type.

**@Qualifier:** Specify which bean when multiple candidates exist.
```java
@Autowired
@Qualifier("mysqlRepo")
private UserRepository repo;
```

**@Primary:** Mark bean as primary when multiple candidates.
```java
@Bean
@Primary
public UserRepository mysqlRepo() { }
```

**Constructor injection with multiple beans:**
```java
public UserService(@Qualifier("mysqlRepo") UserRepository repo) { }
```

**Key takeaway:** @Autowired by type, @Qualifier by name, @Primary for default.

---

### @Configuration and @Bean
**@Configuration:** Indicates class contains bean definitions.

**@Bean:** Declares method as bean producer.

```java
@Configuration
public class AppConfig {
    @Bean
    public DataSource dataSource() {
        // Create and configure DataSource
        return new HikariDataSource();
    }

    @Bean
    public UserService userService(DataSource dataSource) {
        return new UserService(dataSource); // Method param = DI
    }
}
```

**Key takeaway:** Java-based configuration. @Bean methods produce beans.

---

## Spring MVC & REST APIs

### Spring MVC Architecture
**Flow:**
1. **DispatcherServlet:** Front controller receives request
2. **HandlerMapping:** Maps request to controller method
3. **Controller:** Processes request, returns ModelAndView
4. **ViewResolver:** Resolves view name to actual view (JSP, Thymeleaf)
5. **View:** Renders response

**Key takeaway:** DispatcherServlet = front controller. Delegates to handlers.

---

### @RestController vs @Controller
**@Controller:**
- Returns view name (String)
- Used with view technologies (JSP, Thymeleaf)
- Requires @ResponseBody for JSON/XML

**@RestController:**
- `@Controller + @ResponseBody`
- Returns data (JSON/XML) directly
- RESTful APIs

```java
@RestController
@RequestMapping("/api")
public class ApiController {
    @GetMapping("/users")
    public List<User> getUsers() {
        return userService.getAll(); // Auto-converted to JSON
    }
}
```

**Key takeaway:** @RestController for REST APIs. Auto-converts to JSON.

---

### Request Mapping Annotations
**@RequestMapping:** Generic mapping (any HTTP method).

**Specific methods:**
- **@GetMapping:** GET requests
- **@PostMapping:** POST requests
- **@PutMapping:** PUT requests
- **@DeleteMapping:** DELETE requests
- **@PatchMapping:** PATCH requests

```java
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) { }

@PostMapping("/users")
public User createUser(@RequestBody User user) { }

@GetMapping("/users")
public List<User> searchUsers(@RequestParam String name) { }
```

**Key takeaway:** Specific annotations preferred. Clearer intent.

---

### @PathVariable, @RequestParam, @RequestBody
**@PathVariable:** Extract value from URI path.
```java
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) { }
// GET /users/123 → id = 123
```

**@RequestParam:** Extract query parameter.
```java
@GetMapping("/users")
public List<User> search(@RequestParam String name) { }
// GET /users?name=John → name = "John"
```

**@RequestBody:** Bind request body to object (JSON → Java object).
```java
@PostMapping("/users")
public User create(@RequestBody User user) { }
// POST /users with JSON body → User object
```

**Key takeaway:** PathVariable = URI, RequestParam = query, RequestBody = JSON body.

---

### Exception Handling
**1. @ExceptionHandler (method level):**
```java
@RestController
public class UserController {
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<String> handleNotFound(UserNotFoundException ex) {
        return ResponseEntity.status(404).body(ex.getMessage());
    }
}
```

**2. @ControllerAdvice (global):**
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAll(Exception ex) {
        return ResponseEntity.status(500).body(new ErrorResponse(ex.getMessage()));
    }
}
```

**3. ResponseEntityExceptionHandler (extend for Spring exceptions):**
```java
@ControllerAdvice
public class CustomExceptionHandler extends ResponseEntityExceptionHandler {
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(...) { }
}
```

**Key takeaway:** @ControllerAdvice for global. Centralized error handling.

---

### Content Negotiation
**Definition:** Serve different representations (JSON, XML) based on request.

**Accept header:**
```
GET /users
Accept: application/json → JSON response
Accept: application/xml → XML response
```

**Configuration:**
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer.defaultContentType(MediaType.APPLICATION_JSON);
    }
}
```

**Key takeaway:** Multiple formats. Based on Accept header.

---

### Validation
**Bean Validation (JSR-303):**
```java
public class User {
    @NotNull
    @Size(min = 2, max = 30)
    private String name;

    @Email
    private String email;

    @Min(18)
    private int age;
}

@PostMapping("/users")
public ResponseEntity<User> create(@Valid @RequestBody User user) {
    // @Valid triggers validation
}
```

**Handle validation errors:**
```java
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
    Map<String, String> errors = new HashMap<>();
    ex.getBindingResult().getFieldErrors().forEach(error ->
        errors.put(error.getField(), error.getDefaultMessage())
    );
    return ResponseEntity.badRequest().body(errors);
}
```

**Key takeaway:** @Valid + JSR-303 annotations. Declarative validation.

---

## Data Access (JPA/Hibernate)

### Spring Data JPA
**Definition:** Abstraction over JPA to reduce boilerplate data access code.

**Repository interfaces:**
```java
public interface UserRepository extends JpaRepository<User, Long> {
    // No implementation needed!
    List<User> findByName(String name); // Query derived from method name

    @Query("SELECT u FROM User u WHERE u.email = ?1")
    User findByEmail(String email); // Custom JPQL
}
```

**Key methods:**
- `save(entity)`, `findById(id)`, `findAll()`, `delete(entity)`, `count()`

**Key takeaway:** No boilerplate. Method names → queries. Extends JpaRepository.

---

### Entity Mapping
**@Entity:** Mark class as JPA entity.
**@Table:** Specify table name.
**@Id:** Primary key.
**@GeneratedValue:** Auto-generate ID.

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(unique = true)
    private String email;

    @Temporal(TemporalType.DATE)
    private Date birthDate;
}
```

**Key takeaway:** @Entity + @Id minimum. @Column for customization.

---

### Relationships
**@OneToOne:**
```java
@OneToOne(mappedBy = "user")
private Profile profile;
```

**@OneToMany / @ManyToOne:**
```java
@Entity
public class Department {
    @OneToMany(mappedBy = "department")
    private List<Employee> employees;
}

@Entity
public class Employee {
    @ManyToOne
    @JoinColumn(name = "dept_id")
    private Department department;
}
```

**@ManyToMany:**
```java
@ManyToMany
@JoinTable(name = "student_course",
    joinColumns = @JoinColumn(name = "student_id"),
    inverseJoinColumns = @JoinColumn(name = "course_id"))
private Set<Course> courses;
```

**Key takeaway:** mappedBy = non-owning side. JoinColumn = owning side.

---

### Cascade Types and Fetch Types
**Cascade:** Operations propagate to related entities.
- **PERSIST:** Save related entities
- **MERGE:** Update related entities
- **REMOVE:** Delete related entities
- **ALL:** All cascade operations

```java
@OneToMany(cascade = CascadeType.ALL)
private List<Order> orders;
```

**Fetch Types:**
- **EAGER:** Load immediately (default for @OneToOne, @ManyToOne)
- **LAZY:** Load on demand (default for @OneToMany, @ManyToMany)

```java
@OneToMany(fetch = FetchType.LAZY)
private List<Order> orders;
```

**N+1 problem:** Lazy loading triggers separate query for each entity. Use JOIN FETCH or @EntityGraph.

**Key takeaway:** Cascade = propagate ops. LAZY = on-demand. Avoid N+1 with JOIN FETCH.

---

### @Transactional
**Definition:** Declarative transaction management.

**Method level:**
```java
@Service
public class UserService {
    @Transactional
    public void transferMoney(Long from, Long to, double amount) {
        // Both operations in same transaction
        debit(from, amount);
        credit(to, amount);
        // Commits if successful, rolls back on exception
    }
}
```

**Class level:** Applies to all methods.

**Propagation:**
- **REQUIRED (default):** Use existing transaction or create new
- **REQUIRES_NEW:** Always create new transaction
- **NESTED:** Nested within existing transaction

**Isolation levels:** READ_UNCOMMITTED, READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE

**Key takeaway:** Declarative transactions. Rollback on RuntimeException.

---

### Query Methods
**Derived queries (method name):**
```java
List<User> findByName(String name);
List<User> findByEmailAndStatus(String email, Status status);
List<User> findByAgeBetween(int start, int end);
List<User> findByNameContaining(String keyword);
```

**@Query (JPQL):**
```java
@Query("SELECT u FROM User u WHERE u.age > ?1")
List<User> findUsersOlderThan(int age);

@Query("SELECT u FROM User u WHERE u.name LIKE %:keyword%")
List<User> search(@Param("keyword") String keyword);
```

**Native SQL:**
```java
@Query(value = "SELECT * FROM users WHERE age > ?1", nativeQuery = true)
List<User> findUsersNative(int age);
```

**Key takeaway:** Derived = convention, @Query = custom, native = SQL.

---

## Security

### Spring Security Basics
**Definition:** Comprehensive security framework for authentication and authorization.

**Key concepts:**
- **Authentication:** Who you are (login)
- **Authorization:** What you can do (permissions)
- **Principal:** Currently authenticated user
- **GrantedAuthority:** Permission/role

**Enable:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

**Default behavior:** All endpoints secured, default login page, user "user" with generated password.

**Key takeaway:** Authentication + Authorization. Auto-secures endpoints.

---

### Configuration
**WebSecurityConfigurerAdapter (deprecated in Spring Security 5.7+):**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
                .antMatchers("/public/**").permitAll()
                .antMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            .and()
            .formLogin()
            .and()
            .httpBasic();
    }
}
```

**Modern approach (Spring Security 5.7+):**
```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/public/**").permitAll()
            .requestMatchers("/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated()
        )
        .formLogin(Customizer.withDefaults())
        .httpBasic(Customizer.withDefaults());
    return http.build();
}
```

**Key takeaway:** Configure rules with HttpSecurity. Permit/deny by path/role.

---

### Authentication
**In-memory authentication:**
```java
@Bean
public UserDetailsService users() {
    UserDetails user = User.builder()
        .username("user")
        .password(passwordEncoder().encode("password"))
        .roles("USER")
        .build();
    return new InMemoryUserDetailsManager(user);
}
```

**Database authentication:**
```java
@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired
    private UserRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String username) {
        User user = userRepo.findByUsername(username);
        return new org.springframework.security.core.userdetails.User(
            user.getUsername(),
            user.getPassword(),
            getAuthorities(user.getRoles())
        );
    }
}
```

**Key takeaway:** UserDetailsService loads user. Password must be encoded.

---

### JWT Authentication
**Flow:**
1. User logs in with credentials
2. Server validates and generates JWT token
3. Client sends JWT in `Authorization: Bearer <token>` header
4. Server validates token on each request

**Generate JWT:**
```java
public String generateToken(UserDetails userDetails) {
    return Jwts.builder()
        .setSubject(userDetails.getUsername())
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 24h
        .signWith(SignatureAlgorithm.HS512, SECRET_KEY)
        .compact();
}
```

**Filter to validate JWT:**
```java
public class JwtFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, ...) {
        String token = extractToken(request);
        if (token != null && validateToken(token)) {
            UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(user, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        filterChain.doFilter(request, response);
    }
}
```

**Key takeaway:** Stateless authentication. Token = credentials. Validate on each request.

---

### Method Security
**Enable:**
```java
@EnableGlobalMethodSecurity(prePostEnabled = true)
```

**Annotations:**
```java
@PreAuthorize("hasRole('ADMIN')")
public void deleteUser(Long id) { }

@PostAuthorize("returnObject.username == authentication.name")
public User getUser(Long id) { }

@Secured("ROLE_ADMIN")
public void adminMethod() { }
```

**Key takeaway:** Secure methods with annotations. @PreAuthorize = before execution.

---

## Microservices with Spring

### Spring Cloud
**Definition:** Toolkit for building cloud-native, distributed systems.

**Key modules:**
- **Eureka:** Service discovery
- **Ribbon:** Client-side load balancing
- **Feign:** Declarative REST client
- **Gateway:** API gateway
- **Config:** Centralized configuration
- **Sleuth + Zipkin:** Distributed tracing
- **Hystrix:** Circuit breaker (deprecated, use Resilience4j)

**Key takeaway:** Microservices infrastructure. Service discovery, gateway, config.

---

### Service Discovery (Eureka)
**Eureka Server:**
```java
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApp { }
```

**Eureka Client (microservice):**
```java
@SpringBootApplication
@EnableEurekaClient
public class UserServiceApp { }
```

**application.yml (client):**
```yaml
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

**How it works:**
- Services register with Eureka on startup
- Services fetch registry of other services
- Client-side load balancing using registry

**Key takeaway:** Service registry. Dynamic discovery. No hardcoded IPs.

---

### API Gateway (Spring Cloud Gateway)
**Definition:** Single entry point for all microservices. Routing, filtering, security.

**Configuration:**
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://USER-SERVICE # Load balanced
          predicates:
            - Path=/users/**
          filters:
            - AddRequestHeader=X-Request-Source, Gateway
```

**Custom filter:**
```java
@Component
public class LoggingFilter implements GlobalFilter {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        log.info("Request: {}", exchange.getRequest().getPath());
        return chain.filter(exchange);
    }
}
```

**Key takeaway:** Routing + filtering. Single entry point.

---

### Feign Client (Declarative REST Client)
**Definition:** Declarative HTTP client. Define interface, Feign implements.

```java
@FeignClient(name = "USER-SERVICE")
public interface UserClient {
    @GetMapping("/users/{id}")
    User getUserById(@PathVariable Long id);

    @PostMapping("/users")
    User createUser(@RequestBody User user);
}

@Service
public class OrderService {
    @Autowired
    private UserClient userClient;

    public void processOrder(Long userId) {
        User user = userClient.getUserById(userId); // HTTP call
    }
}
```

**Key takeaway:** Interface-based REST client. Integrates with Eureka.

---

### Circuit Breaker (Resilience4j)
**Definition:** Prevents cascading failures. If service fails repeatedly, circuit "opens" (stops calling, returns fallback).

**States:**
1. **Closed:** Normal operation
2. **Open:** Failing, return fallback
3. **Half-Open:** Test if service recovered

```java
@Service
public class UserService {
    @CircuitBreaker(name = "userService", fallbackMethod = "fallbackGetUser")
    public User getUser(Long id) {
        return restTemplate.getForObject("http://USER-SERVICE/users/" + id, User.class);
    }

    public User fallbackGetUser(Long id, Exception ex) {
        return new User(id, "Default User"); // Fallback
    }
}
```

**Configuration:**
```yaml
resilience4j.circuitbreaker:
  instances:
    userService:
      failure-rate-threshold: 50
      wait-duration-in-open-state: 10000
```

**Key takeaway:** Fail fast. Fallback method. Prevents cascade.

---

### Distributed Tracing (Sleuth + Zipkin)
**Sleuth:** Auto-adds trace ID and span ID to logs.

**Zipkin:** Visualizes distributed traces.

```properties
spring.zipkin.base-url=http://localhost:9411
spring.sleuth.sampler.probability=1.0 # 100% sampling
```

**Logs with Sleuth:**
```
INFO [user-service,a1b2c3,d4e5f6] - Processing request
         ^service    ^trace ^span
```

**Key takeaway:** Trace requests across services. Sleuth = IDs, Zipkin = visualization.

---

### Centralized Configuration (Spring Cloud Config)
**Config Server:**
- Stores configuration in Git repository
- Exposes configs via REST endpoints

**Client:**
- Fetches configuration from Config Server on startup

**Use case:** Change config without redeploying services.

**Key takeaway:** Externalized config. Version-controlled. Dynamic refresh.

---

## Testing & Best Practices

### Unit Testing
**JUnit 5 + Mockito:**
```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock
    private UserRepository repo;

    @InjectMocks
    private UserService service;

    @Test
    void testGetUser() {
        User user = new User(1L, "Alice");
        when(repo.findById(1L)).thenReturn(Optional.of(user));

        User result = service.getUser(1L);

        assertEquals("Alice", result.getName());
        verify(repo).findById(1L);
    }
}
```

**Key takeaway:** Mock dependencies. @InjectMocks injects mocks.

---

### Integration Testing
**@SpringBootTest:** Loads full application context.

```java
@SpringBootTest
@AutoConfigureMockMvc
class UserControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void testGetUser() throws Exception {
        mockMvc.perform(get("/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Alice"));
    }
}
```

**@WebMvcTest:** Tests only web layer (no full context).

```java
@WebMvcTest(UserController.class)
class UserControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService service;

    @Test
    void testGetUser() throws Exception {
        when(service.getUser(1L)).thenReturn(new User(1L, "Alice"));

        mockMvc.perform(get("/users/1"))
            .andExpect(status().isOk());
    }
}
```

**Key takeaway:** @SpringBootTest = full context, @WebMvcTest = web layer only.

---

### Repository Testing
**@DataJpaTest:** Tests JPA repositories with in-memory database.

```java
@DataJpaTest
class UserRepositoryTest {
    @Autowired
    private UserRepository repo;

    @Test
    void testFindByName() {
        User user = new User("Alice");
        repo.save(user);

        User found = repo.findByName("Alice");
        assertEquals("Alice", found.getName());
    }
}
```

**Key takeaway:** @DataJpaTest = JPA slice test. In-memory DB.

---

### Best Practices
**1. Use constructor injection (required deps):**
```java
@Service
public class UserService {
    private final UserRepository repo;
    public UserService(UserRepository repo) { this.repo = repo; }
}
```

**2. Proper layering:**
- Controller → Service → Repository
- Business logic in Service, not Controller

**3. Use DTOs:**
- Don't expose entities directly in APIs
- Map entities to DTOs (ModelMapper, MapStruct)

**4. Exception handling:**
- Global @ControllerAdvice for consistency

**5. Validation:**
- @Valid + JSR-303 annotations

**6. Logging:**
- Use SLF4J with Logback
- Structured logging (JSON) for production

**7. Configuration:**
- Externalize in application.properties
- Use profiles for environments

**8. Security:**
- Never store plaintext passwords
- Use BCryptPasswordEncoder
- Secure endpoints by default

**Key takeaway:** Constructor injection, layering, DTOs, global exception handling.

---

## Interview Tips

1. **Explain auto-configuration clearly:** "Spring Boot scans classpath and creates beans based on dependencies present."
2. **Use real examples:** "Used Spring Data JPA to reduce CRUD boilerplate in user service."
3. **Discuss tradeoffs:** "Field injection is convenient but harder to test than constructor injection."
4. **Know microservices patterns:** "Eureka for discovery, Gateway for routing, Circuit Breaker for resilience."
5. **Security awareness:** "Used JWT for stateless authentication in REST APIs."

---

**Updated:** 2026-06-28 | **Level:** Intermediate-Advanced | **Format:** Interview-ready definitions
