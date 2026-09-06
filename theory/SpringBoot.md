# Spring Boot - Professional Interview Guide

> Written for senior/staff backend interviews. Assumes you already know what `@Autowired` does.
> Everything here is oriented around one question: *what actually happens at runtime, and how
> does it fail in production at 3am?*
>
> Version baseline: **Spring Boot 3.2+ / Spring Framework 6.1 / Java 17-21**. Boot 2.x behavior is
> called out explicitly wherever it differs, because most real codebases are mid-migration.

---

## Table of Contents

1. [How Spring Boot Actually Works](#how-spring-boot-actually-works)
2. [The IoC Container and Bean Lifecycle](#the-ioc-container-and-bean-lifecycle)
3. [Dependency Injection Done Right](#dependency-injection-done-right)
4. [Application Context Startup Sequence](#application-context-startup-sequence)
5. [Auto-Configuration Internals](#auto-configuration-internals)
6. [Writing Your Own Starter](#writing-your-own-starter)
7. [Configuration and Property Resolution](#configuration-and-property-resolution)
8. [Spring MVC: The Request Path](#spring-mvc-the-request-path)
9. [Filters vs Interceptors vs AOP](#filters-vs-interceptors-vs-aop)
10. [AOP and the Self-Invocation Trap](#aop-and-the-self-invocation-trap)
11. [Data Access: JPA and Hibernate](#data-access-jpa-and-hibernate)
12. [Transactions](#transactions)
13. [Connection Pooling with HikariCP](#connection-pooling-with-hikaricp)
14. [Spring Security](#spring-security)
15. [Testing Strategy](#testing-strategy)
16. [Production Operations](#production-operations)
17. [Spring Boot 3.x](#spring-boot-3x)
18. [Reactive: WebFlux vs MVC](#reactive-webflux-vs-mvc)
19. [Microservices and Resilience](#microservices-and-resilience)
20. [Production War Stories](#production-war-stories)
21. [Common Pitfalls](#common-pitfalls)
22. [Junior vs Senior](#junior-vs-senior)
23. [Interview Questions](#interview-questions)

---

## How Spring Boot Actually Works

### The one-sentence version that survives follow-up questions

Spring Boot is **not a framework**. It is an opinionated bootstrapping layer on top of the Spring
Framework that does three things:

1. **Dependency curation** — starter POMs plus a `dependencyManagement` BOM that pins ~1,400
   transitive library versions that are known to work together.
2. **Conditional auto-configuration** — a large set of `@Configuration` classes that are evaluated
   at startup and only apply when their conditions hold (a class is on the classpath, a bean is
   *not* already defined, a property is set).
3. **Runtime packaging** — an embedded servlet container and an executable fat jar with a nested
   jar classloader, so `java -jar app.jar` is the whole deployment story.

Everything else — DI, AOP, transactions, MVC, the `@Transactional` proxy, the persistence context —
is **Spring Framework**, not Spring Boot. Candidates who blur this line get exposed the moment an
interviewer asks "so what does Boot actually add to `@Transactional`?" (Answer: a `DataSource`, a
`PlatformTransactionManager` bean, and `@EnableTransactionManagement`. Nothing else.)

### The layer diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│  YOUR APPLICATION                                                       │
│  @RestController  @Service  @Repository  @Entity  @Configuration        │
└───────────────────────────────┬────────────────────────────────────────┘
                                │ uses
┌───────────────────────────────┴────────────────────────────────────────┐
│  SPRING BOOT                                                            │
│  ┌──────────────────┬──────────────────┬────────────────────────────┐  │
│  │ Starters (POMs)  │ Auto-config      │ Actuator / Embedded server │  │
│  │ + version BOM    │ 160+ @Config     │ + fat-jar launcher         │  │
│  │                  │ classes, all     │ + externalized config      │  │
│  │                  │ @Conditional     │ + graceful shutdown        │  │
│  └──────────────────┴──────────────────┴────────────────────────────┘  │
└───────────────────────────────┬────────────────────────────────────────┘
                                │ configures
┌───────────────────────────────┴────────────────────────────────────────┐
│  SPRING FRAMEWORK (the actual engine)                                   │
│  ┌───────────┬───────────┬───────────┬─────────┬──────────┬─────────┐  │
│  │ Core/Beans│  Context  │    AOP    │   TX    │ Web MVC  │ WebFlux │  │
│  │ (IoC)     │ (events,  │ (proxies) │ (PTM)   │ (Servlet)│(Reactor)│  │
│  │           │  SpEL,    │           │         │          │         │  │
│  │           │  i18n)    │           │         │          │         │  │
│  └───────────┴───────────┴───────────┴─────────┴──────────┴─────────┘  │
└───────────────────────────────┬────────────────────────────────────────┘
                                │ runs on
┌───────────────────────────────┴────────────────────────────────────────┐
│  JVM  +  Servlet API (jakarta.servlet.*)  +  JDBC  +  JPA/Hibernate     │
└────────────────────────────────────────────────────────────────────────┘
```

### `@SpringBootApplication` decomposed

```java
@SpringBootApplication
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}
```

That single annotation is exactly three annotations:

```java
@SpringBootConfiguration   // = @Configuration(proxyBeanMethods = true) + marks THE primary config
@EnableAutoConfiguration   // = @AutoConfigurationPackage + @Import(AutoConfigurationImportSelector)
@ComponentScan(            // scans the package of THIS class and everything below it
    excludeFilters = { TypeExcludeFilter.class, AutoConfigurationExcludeFilter.class })
public @interface SpringBootApplication { }
```

Three consequences that come up constantly in real work:

- **`@SpringBootConfiguration` must appear exactly once.** Tests locate the context via
  `SpringBootTestContextBootstrapper`, which walks *up* the package tree from the test class looking
  for `@SpringBootConfiguration`. Two of them and you get
  `Found multiple @SpringBootConfiguration annotated classes`.
- **Component scanning is anchored to the main class's package.** Put `Application.java` in
  `com.acme.orders` and a `@Service` in `com.acme.shared` and it will not be found. The fix is *not*
  `@ComponentScan("com.acme")` sprayed everywhere — it is putting the main class at the root package.
- **`@AutoConfigurationPackage`** registers that same package for JPA entity scanning and Spring
  Data repository scanning. This is why `@Entity` classes outside the main package silently vanish
  and you get `Not a managed type`.

### Startup cost, with real numbers

| App shape | Boot 2.7 / JDK 11 | Boot 3.2 / JDK 21 | Boot 3.2 native |
|---|---|---|---|
| `web` only, 20 beans | ~1.1 s | ~0.9 s | ~45 ms |
| `web + data-jpa`, 250 beans, 12 entities | ~3.4 s | ~2.6 s | ~90 ms |
| `web + jpa + security + kafka`, 900 beans | ~8.5 s | ~6.2 s | ~140 ms |
| Same, with `spring.main.lazy-initialization=true` | ~2.9 s | ~2.2 s | n/a |

Memory: a typical JPA+web service idles at **380-550 MB RSS** on the JVM (heap 256 MB + metaspace
~110 MB + code cache + thread stacks + Hikari + direct buffers), versus **110-160 MB** as a GraalVM
native image. Metaspace is the number people forget: 900 beans with CGLIB proxies routinely pushes
metaspace past 120 MB, and a container with `-XX:MaxMetaspaceSize` unset plus a 512 MB memory limit
gets OOM-killed by the kernel, not by the JVM — so you get no heap dump and no `OutOfMemoryError`
in the logs. Just exit code 137.

---

## The IoC Container and Bean Lifecycle

### BeanFactory vs ApplicationContext

This is the classic warm-up question. The senior answer is not "ApplicationContext is a superset."

```
┌───────────────────────────────────────────────────────────────────┐
│ BeanFactory  (org.springframework.beans.factory)                  │
│  The actual IoC container contract:                               │
│   • getBean(name/type)   • containsBean()   • isSingleton()        │
│  Canonical impl: DefaultListableBeanFactory                       │
│   • beanDefinitionMap:  Map<String, BeanDefinition>   (metadata)   │
│   • singletonObjects:   Map<String, Object>           (L1 cache)   │
│   • earlySingletonObjects: Map<String, Object>        (L2 cache)   │
│   • singletonFactories: Map<String, ObjectFactory>    (L3 cache)   │
│  Lazy by default. Knows nothing about events/AOP/i18n/resources.   │
└──────────────────────────┬────────────────────────────────────────┘
                           │ extends
┌──────────────────────────┴────────────────────────────────────────┐
│ ApplicationContext                                                 │
│  = BeanFactory                                                     │
│  + ListableBeanFactory   (enumerate beans by type)                 │
│  + MessageSource         (i18n)                                    │
│  + ApplicationEventPublisher (events)                              │
│  + ResourceLoader        (classpath:/file:/http: resources)        │
│  + Environment           (profiles + PropertySources)              │
│  + automatic registration of BeanPostProcessors and                │
│    BeanFactoryPostProcessors  ← THE practical difference           │
│  + EAGER singleton instantiation at refresh()                      │
│                                                                    │
│  It DELEGATES to an internal DefaultListableBeanFactory.           │
│  It is not a subclass — it is a facade + composition.              │
└───────────────────────────────────────────────────────────────────┘
```

The practical difference that matters: with a raw `BeanFactory`, `BeanPostProcessor`s are **not**
auto-registered, which means `@Autowired`, `@PostConstruct`, `@Transactional` proxying, and
`@Async` all silently do nothing. You would have to call `addBeanPostProcessor()` by hand. This is
why nobody uses a bare `BeanFactory` in application code, and why "ApplicationContext eagerly
instantiates singletons so you find wiring errors at startup instead of at 2pm on Black Friday" is
the answer interviewers actually want.

### The full bean lifecycle

Memorize this diagram. It explains `@PostConstruct` ordering, why AOP proxies see a
fully-initialized target, why `BeanPostProcessor`s themselves can't be proxied, and why
`@Value` is null inside a constructor.

```
                        ┌────────────────────────────────────┐
   PHASE 0: METADATA    │ BeanDefinition registered          │
   (no objects yet)     │  from @ComponentScan, @Bean method,│
                        │  XML, or programmatic registration │
                        └────────────────┬───────────────────┘
                                         ↓
                        ┌────────────────────────────────────┐
                        │ BeanFactoryPostProcessor.          │
                        │   postProcessBeanFactory()         │
                        │  ← can MUTATE BeanDefinitions      │
                        │  e.g. PropertySourcesPlaceholder-  │
                        │       Configurer resolves ${...}   │
                        │  e.g. ConfigurationClassPostProc.  │
                        └────────────────┬───────────────────┘
                                         ↓
   ═══════════════ per-bean, during preInstantiateSingletons() ═══════════════
                                         ↓
   PHASE 1              ┌────────────────────────────────────┐
   INSTANTIATE          │ Constructor invoked                │
                        │  (constructor injection happens    │
                        │   HERE — deps must exist already)  │
                        │  Fields are still null.            │
                        └────────────────┬───────────────────┘
                                         ↓
   PHASE 2              ┌────────────────────────────────────┐
   POPULATE             │ populateBean():                    │
                        │  field injection (@Autowired,      │
                        │   @Value, @Inject) + setters       │
                        │  via AutowiredAnnotationBPP        │
                        └────────────────┬───────────────────┘
                                         ↓
   PHASE 3              ┌────────────────────────────────────┐
   AWARE CALLBACKS      │ BeanNameAware.setBeanName()        │
                        │ BeanClassLoaderAware               │
                        │ BeanFactoryAware.setBeanFactory()  │
                        │  ...then, via ApplicationContext-  │
                        │  AwareProcessor (a BPP):           │
                        │   EnvironmentAware, ResourceLoader-│
                        │   Aware, ApplicationEventPublisher-│
                        │   Aware, ApplicationContextAware   │
                        └────────────────┬───────────────────┘
                                         ↓
   PHASE 4              ┌────────────────────────────────────┐
   BPP — BEFORE INIT    │ BeanPostProcessor                  │
                        │   .postProcessBeforeInitialization │
                        │  ← @PostConstruct RUNS HERE        │
                        │    (CommonAnnotationBeanPostProc.) │
                        │  ← @ConfigurationProperties binding│
                        └────────────────┬───────────────────┘
                                         ↓
   PHASE 5              ┌────────────────────────────────────┐
   INITIALIZE           │ InitializingBean.afterPropertiesSet│
                        │ then custom init-method            │
                        │      (@Bean(initMethod="..."))     │
                        └────────────────┬───────────────────┘
                                         ↓
   PHASE 6              ┌────────────────────────────────────┐
   BPP — AFTER INIT     │ BeanPostProcessor                  │
                        │   .postProcessAfterInitialization  │
                        │  ← AOP PROXY IS CREATED HERE       │
                        │    (AbstractAutoProxyCreator wraps │
                        │     the target and RETURNS THE     │
                        │     PROXY instead of the bean)     │
                        │  ← @Async, @Transactional,         │
                        │    @Cacheable, @Retryable, @Valid  │
                        └────────────────┬───────────────────┘
                                         ↓
                        ┌────────────────────────────────────┐
                        │ Bean stored in singletonObjects    │
                        │ READY FOR USE (what you inject     │
                        │ is the PROXY, not the target)      │
                        └────────────────┬───────────────────┘
                                         ↓
                              ... application runs ...
                                         ↓
   PHASE 7              ┌────────────────────────────────────┐
   SHUTDOWN             │ ctx.close() / SIGTERM              │
   (singletons only)    │  → @PreDestroy                     │
                        │  → DisposableBean.destroy()        │
                        │  → custom destroyMethod            │
                        │  PROTOTYPES GET NONE OF THIS.      │
                        └────────────────────────────────────┘
```

Five things this diagram explains that people get wrong in interviews:

1. **`@Value` and `@Autowired` fields are null inside the constructor.** Phase 1 runs before
   phase 2. If you need injected state during construction, use constructor injection.
2. **`@PostConstruct` runs *before* the proxy exists.** So calling a `@Transactional` method of
   `this` from `@PostConstruct` runs with **no transaction**, always. This bites people who do
   cache-warming in `@PostConstruct`.
3. **AOP proxies are created in phase 6.** The target object inside the proxy is fully initialized,
   which is why `@Transactional` never sees a half-built bean.
4. **`BeanPostProcessor`s are instantiated very early**, before regular beans. If a BPP depends on a
   regular bean, that bean gets created before all BPPs are registered, so it is not eligible for
   auto-proxying. Symptom: `@Transactional` on your `DataSourceHealthIndicator` silently does
   nothing and you get the log line
   `Bean 'xxx' is not eligible for getting processed by all BeanPostProcessors`.
   Fix: wrap the dependency in `ObjectProvider<T>` and resolve it lazily.
5. **Prototype beans never get destruction callbacks.** Spring hands you the instance and forgets
   it. If your prototype holds a socket or a file handle, you leak it. Use a `DisposableBean`
   wrapper or an explicit `destroy()` you call yourself.

### Where each hook lives, as code

```java
@Component
public class LifecycleDemo implements BeanNameAware, InitializingBean, DisposableBean {

    private final PricingClient client;   // 1. constructor injection

    @Value("${pricing.timeout-ms}")
    private int timeoutMs;                // 2. field injection (null/0 in constructor!)

    public LifecycleDemo(PricingClient client) {
        this.client = client;
        // timeoutMs == 0 here. Guaranteed.
    }

    @Override public void setBeanName(String name) { /* 3. Aware */ }

    @PostConstruct
    void warmUp() {
        // 4. before-init BPP. timeoutMs is now bound.
        // WARNING: 'this' is the raw target, NOT the proxy. No @Transactional here.
    }

    @Override public void afterPropertiesSet() { /* 5. */ }

    @PreDestroy
    void flush() { /* 7. only for singletons */ }

    @Override public void destroy() { /* 7. */ }
}
```

**Opinion:** prefer `@PostConstruct` over `InitializingBean`. Implementing `InitializingBean` couples
your domain class to a Spring interface for zero benefit. And prefer
`ApplicationRunner`/`@EventListener(ApplicationReadyEvent.class)` over both when the work needs the
*whole* context to be up — `@PostConstruct` runs while the context is still being built, so half
your beans may not exist yet and the web server is definitely not listening.

### Bean scopes

| Scope | Instances | Destroyed by Spring? | Real use |
|---|---|---|---|
| `singleton` (default) | 1 per container | Yes | 99% of beans. Must be stateless/thread-safe. |
| `prototype` | New on every `getBean()`/injection point | **No** | Stateful builders, per-use objects |
| `request` | 1 per HTTP request | Yes (request end) | Request-scoped context/correlation data |
| `session` | 1 per HTTP session | Yes (session end) | Shopping cart in a server-rendered app |
| `application` | 1 per `ServletContext` | Yes | Rare; wider than singleton in multi-context apps |
| `websocket` | 1 per WS session | Yes | WS session state |

Two hard rules from production:

- **Singletons must be stateless.** One instance is shared across all 200 Tomcat worker threads.
  A mutable `private List<String> currentBatch` field on a `@Service` is a data race that shows up
  as "user A saw user B's data" — the single scariest bug class in a web app.
- **Request/session scoped beans injected into singletons require a proxy.** Spring injects a
  CGLIB scoped proxy that resolves the real instance from the current thread's
  `RequestContextHolder` on every method call.

```java
@Component
@Scope(value = WebApplicationContext.SCOPE_REQUEST,
       proxyMode = ScopedProxyMode.TARGET_CLASS)   // ← without this: BeanCreationException
public class RequestContext {
    private String correlationId;
    // getters/setters
}
```

Without `proxyMode`, Spring tries to resolve the request-scoped bean at singleton creation time —
when there is no HTTP request — and throws
`No thread-bound request found: Are you referring to request attributes outside of an actual web request?`

### The singleton-injecting-prototype bug

This is the single most-asked scope question, and most candidates get the *diagnosis* right and the
*fix* wrong.

```java
@Component
@Scope("prototype")
public class ReportBuilder {
    private final List<Row> rows = new ArrayList<>();   // per-report state
    public void add(Row r) { rows.add(r); }
    public Report build() { return new Report(rows); }
}

// ❌ WRONG — the prototype is created ONCE, at singleton construction time
@Service
public class ReportService {
    private final ReportBuilder builder;               // injected once, ever

    public ReportService(ReportBuilder builder) { this.builder = builder; }

    public Report generate(List<Row> rows) {
        rows.forEach(builder::add);   // rows accumulate across ALL calls, from ALL threads
        return builder.build();
    }
}
```

**Actual failure mode:** the first report has 40 rows, the second has 80, the third has 130. Under
concurrency you also get `ArrayIndexOutOfBoundsException` from inside `ArrayList.add` because two
Tomcat threads mutate the same non-synchronized list. The `@Scope("prototype")` annotation is not
"ignored" — Spring honors it exactly once, at the moment it wires `ReportService`, because the
injection point is resolved a single time.

Four correct fixes, in order of preference:

```java
// ✅ FIX 1 (best): ObjectProvider — explicit, testable, no Spring interfaces leaked into signatures
@Service
public class ReportService {
    private final ObjectProvider<ReportBuilder> builders;

    public ReportService(ObjectProvider<ReportBuilder> builders) { this.builders = builders; }

    public Report generate(List<Row> rows) {
        ReportBuilder builder = builders.getObject();  // fresh instance per call
        rows.forEach(builder::add);
        return builder.build();
    }
}

// ✅ FIX 2: @Lookup — Spring subclasses your bean with CGLIB and overrides the method
@Service
public abstract class ReportService {
    @Lookup
    protected abstract ReportBuilder newBuilder();     // returns a NEW prototype each call
}

// ✅ FIX 3: scoped proxy on the prototype itself
@Component
@Scope(value = "prototype", proxyMode = ScopedProxyMode.TARGET_CLASS)
public class ReportBuilder { }
// Caveat: each METHOD CALL through the proxy hits a new instance, so state never accumulates
// anywhere. Almost never what you want for a builder. Know it exists; rarely use it.

// ✅ FIX 4 (honestly the best of all): don't make it a bean
public Report generate(List<Row> rows) {
    ReportBuilder builder = new ReportBuilder();   // it has no dependencies. `new` is fine.
    ...
}
```

**Senior take:** if a "bean" is really just a stateful value object, the presence of
`@Scope("prototype")` is usually a design smell. Spring is a *dependency* container, not an object
factory. Reserve prototype scope for stateful objects that genuinely need injected collaborators.

---

## Dependency Injection Done Right

### The three injection styles and why only one is acceptable

```java
// ✅ CONSTRUCTOR — the only style that should pass code review
@Service
public class OrderService {
    private final OrderRepository orders;
    private final PaymentClient payments;
    private final ApplicationEventPublisher events;

    // @Autowired is optional and should be omitted since Spring 4.3
    // (single constructor => implicit autowiring)
    public OrderService(OrderRepository orders, PaymentClient payments,
                        ApplicationEventPublisher events) {
        this.orders = orders;
        this.payments = payments;
        this.events = events;
    }
}

// ⚠️ SETTER — legitimate only for genuinely optional dependencies
@Service
public class MetricsAwareService {
    private MeterRegistry meters = new SimpleMeterRegistry();  // sane default

    @Autowired(required = false)
    public void setMeters(MeterRegistry meters) { this.meters = meters; }
}

// ❌ FIELD — convenient, and wrong
@Service
public class OrderService {
    @Autowired private OrderRepository orders;
    @Autowired private PaymentClient payments;
    @Autowired private InventoryClient inventory;
    @Autowired private FraudClient fraud;
    @Autowired private NotificationClient notifications;
    // ... and 9 more. Nobody notices, because there is no constructor to look at.
}
```

Field injection is an anti-pattern for five concrete, defensible reasons:

1. **Untestable without a container.** `new OrderService()` compiles and gives you an object with
   five null fields. Your only options are `@SpringBootTest` (slow) or `ReflectionTestUtils`
   (fragile). With constructor injection, `new OrderService(mockRepo, mockClient, publisher)` is a
   plain Java object and your unit test runs in 3 ms instead of 3 seconds.
2. **Cannot be `final`.** No immutability, no compile-time guarantee the dependency is set, and a
   thread-safety hole: a non-final field written after construction has no happens-before guarantee
   for other threads without the container's synchronization.
3. **Hides the dependency count.** A constructor with 11 parameters is *ugly*, and that ugliness is
   the feature — it screams "this class violates SRP, split it." Field injection lets a god-service
   grow to 15 dependencies without a single line of visual pressure.
4. **Permits circular dependencies.** With field injection, `A → B → A` resolves silently via the
   early-reference cache. With constructor injection it's an immediate startup failure. You *want*
   the failure.
5. **Breaks outside Spring.** Reuse the class in a CLI tool, a Lambda, or a test fixture and it
   silently NPEs.

The one honest counterargument — "constructors get long with many dependencies" — is answered by:
Lombok's `@RequiredArgsConstructor` (used judiciously) or, better, by splitting the class.

```java
@Service
@RequiredArgsConstructor   // generates a constructor for all final fields
public class OrderService {
    private final OrderRepository orders;
    private final PaymentClient payments;
}
```

### Circular dependencies: why they resolve, and when they don't

Spring resolves *setter/field* circular references using a **three-level cache** in
`DefaultSingletonBeanRegistry`:

```
Creating bean A, which needs B, which needs A:

  1. Start creating A → add ObjectFactory<A> to singletonFactories (L3)
                        A exists but is NOT populated and NOT proxied
  2. Populate A → needs B → start creating B
  3. Populate B → needs A → A not in L1 (singletonObjects) …
                          → not in L2 (earlySingletonObjects) …
                          → FOUND in L3 → call the factory
                          → factory returns the EARLY reference
                            (proxy if needed, via SmartInstantiationAwareBPP)
                          → promote to L2, remove from L3
  4. B gets the early A reference, B finishes → B goes into L1
  5. A finishes populating, initializes, goes into L1

  Works because step 1 could publish a half-built A. Field/setter injection
  tolerates a half-built object; it just needs the reference.
```

Constructor injection **cannot** work this way, because there is no reference to publish until the
constructor returns — and the constructor cannot return until its arguments exist. You get:

```
***************************
APPLICATION FAILED TO START
***************************

Description:

The dependencies of some of the beans in the application context form a cycle:

┌─────┐
|  orderService defined in file [.../OrderService.class]
↑     ↓
|  inventoryService defined in file [.../InventoryService.class]
└─────┘
```

**Boot 2.6 changed the default**: `spring.main.allow-circular-references` is now `false`, so even
field-injected cycles fail at startup. Do not flip it back to `true` — that flag is a migration
escape hatch, not a solution.

The four real fixes, best first:

```java
// ✅ 1. Extract the shared logic into a third bean. A→C, B→C. Cycle gone.
//       This is nearly always the right answer and the one interviewers want.

// ✅ 2. Invert with events — the dependency becomes one-directional
@Service
public class OrderService {
    private final ApplicationEventPublisher events;
    public void place(Order o) {
        orders.save(o);
        events.publishEvent(new OrderPlacedEvent(o.getId()));   // no compile-time dep
    }
}
@Component
public class InventoryListener {
    @TransactionalEventListener(phase = AFTER_COMMIT)   // note: after COMMIT, not after return
    public void on(OrderPlacedEvent e) { inventory.reserve(e.orderId()); }
}

// ⚠️ 3. @Lazy on one side — injects a proxy, defers real resolution to first call
@Service
public class OrderService {
    public OrderService(@Lazy InventoryService inventory) { ... }
}
// Works, but it hides a design problem behind a proxy. Use only under deadline pressure,
// and leave a TODO with a ticket number.

// ⚠️ 4. ObjectProvider — same idea, more explicit, no proxy magic
public OrderService(ObjectProvider<InventoryService> inventory) { ... }
```

**Interview trap:** "Does `@Lazy` fix a *constructor* circular dependency?" Yes — because Spring
injects a lazy proxy that doesn't touch the real bean until the first method call, by which time
both beans are fully built. Most candidates say no.

### Resolving ambiguity: `@Primary`, `@Qualifier`, `@Conditional`

Spring's resolution algorithm when injecting by type:

```
1. Collect all beans assignable to the required type.
2. If exactly 1 → inject it.
3. If 0 → is the injection point Optional<T>/@Autowired(required=false)/ObjectProvider?
            yes → inject empty;  no → NoSuchBeanDefinitionException
4. If >1:
     a. Filter to beans marked @Primary → if exactly 1, inject it
     b. Filter by @Qualifier value (or @Qualifier-meta-annotated custom annotation)
     c. Filter by @Priority (javax/jakarta) → lowest value wins
     d. Match the FIELD/PARAMETER NAME against bean names  ← the fallback everyone forgets
     e. Still >1 → NoUniqueBeanDefinitionException
```

Step (d) is why this works and why it is fragile:

```java
@Bean PaymentGateway stripeGateway() { ... }
@Bean PaymentGateway adyenGateway() { ... }

// Resolves — parameter name matches bean name. Until someone renames the parameter,
// or you compile without -parameters and names become arg0, arg1...
public CheckoutService(PaymentGateway stripeGateway) { ... }
```

Never rely on step (d). Be explicit:

```java
// ✅ Custom qualifier annotations — type-safe, refactor-safe, self-documenting
@Qualifier
@Retention(RUNTIME)
@Target({FIELD, METHOD, PARAMETER, TYPE})
public @interface Stripe { }

@Bean @Stripe PaymentGateway stripeGateway() { ... }
@Bean @Adyen  PaymentGateway adyenGateway()  { ... }

public CheckoutService(@Stripe PaymentGateway gateway) { ... }
```

`@Primary` vs `@Qualifier`: `@Primary` is a **default for everyone**, declared at the bean; a
misplaced `@Primary` silently changes behavior for injection points you have never looked at.
`@Qualifier` is a **choice at the injection point**. Use `@Primary` only for genuinely canonical
beans (the main `DataSource` when a secondary read-replica one also exists). Note that `@Qualifier`
at the injection point always beats `@Primary`.

`@Conditional` and its Boot-provided specializations decide whether a bean definition is even
*registered*:

```java
@Configuration
public class CacheConfig {

    @Bean
    @ConditionalOnProperty(name = "cache.provider", havingValue = "redis")
    CacheManager redisCacheManager(RedisConnectionFactory f) { ... }

    @Bean
    @ConditionalOnMissingBean(CacheManager.class)   // fallback when nothing else provided one
    CacheManager caffeineCacheManager() { ... }
}
```

Custom condition:

```java
public class OnKubernetesCondition implements Condition {
    @Override
    public boolean matches(ConditionContext ctx, AnnotatedTypeMetadata md) {
        return ctx.getEnvironment().containsProperty("KUBERNETES_SERVICE_HOST");
    }
}

@Bean
@Conditional(OnKubernetesCondition.class)
ProbeRegistrar k8sProbes() { ... }
```

**Ordering gotcha:** `@ConditionalOnMissingBean` in *your own* `@Configuration` is evaluated in
registration order, which is not deterministic across classes. It is designed for auto-configuration
(which runs strictly *after* user config). Inside user configuration, `@ConditionalOnMissingBean`
against another user bean is a coin flip. Interviewers who have been burned by this will ask.

---

## Application Context Startup Sequence

`SpringApplication.run()` is a well-defined pipeline. Knowing it is the difference between guessing
at a startup failure and reading the stack trace like a map.

```
SpringApplication.run(App.class, args)
   │
   ├─ 1. Create SpringApplication
   │     • deduceApplicationType(): SERVLET / REACTIVE / NONE
   │       (checks for DispatcherServlet vs DispatcherHandler on classpath)
   │     • load ApplicationContextInitializers + ApplicationListeners
   │       from META-INF/spring.factories
   │     • deduce the main class from the stack trace
   │
   ├─ 2. SpringApplicationRunListeners.starting()      → ApplicationStartingEvent
   │
   ├─ 3. prepareEnvironment()
   │     • build ConfigurableEnvironment (StandardServletEnvironment)
   │     • attach PropertySources in precedence order
   │     • ConfigDataEnvironmentPostProcessor loads application.yml,
   │       application-{profile}.yml, config server, Vault, etc.
   │     • activate profiles                            → ApplicationEnvironmentPreparedEvent
   │     ⚠ Anything that reads properties BEFORE this point sees nothing.
   │
   ├─ 4. printBanner()
   │
   ├─ 5. createApplicationContext()
   │     SERVLET  → AnnotationConfigServletWebServerApplicationContext
   │     REACTIVE → AnnotationConfigReactiveWebServerApplicationContext
   │     NONE     → AnnotationConfigApplicationContext
   │
   ├─ 6. prepareContext()
   │     • apply ApplicationContextInitializers
   │     • register the primary source (your @SpringBootApplication class)
   │                                                    → ApplicationContextInitializedEvent
   │                                                    → ApplicationPreparedEvent
   │
   ├─ 7. refreshContext()  ←──── THE BIG ONE (AbstractApplicationContext.refresh())
   │     │
   │     ├─ prepareRefresh()               timestamps, validate required properties
   │     ├─ obtainFreshBeanFactory()       new DefaultListableBeanFactory
   │     ├─ prepareBeanFactory()           register ApplicationContextAwareProcessor,
   │     │                                 ignore Aware ifaces for autowiring,
   │     │                                 register environment/systemProperties beans
   │     ├─ postProcessBeanFactory()       web contexts add ServletWebRequest scopes
   │     │
   │     ├─ invokeBeanFactoryPostProcessors()   ◄── ALL BeanDefinitions get registered here
   │     │    • ConfigurationClassPostProcessor
   │     │        - parses @Configuration classes
   │     │        - runs @ComponentScan
   │     │        - processes @Import / @ImportSelector
   │     │        - >>> AutoConfigurationImportSelector runs LAST (DeferredImportSelector)
   │     │    • PropertySourcesPlaceholderConfigurer resolves ${...} in definitions
   │     │
   │     ├─ registerBeanPostProcessors()   instantiate ALL BPPs first, in
   │     │                                 PriorityOrdered → Ordered → rest order
   │     │                                 (AutowiredAnnotationBPP, CommonAnnotationBPP,
   │     │                                  AnnotationAwareAspectJAutoProxyCreator, ...)
   │     ├─ initMessageSource() / initApplicationEventMulticaster()
   │     │
   │     ├─ onRefresh()                    ◄── EMBEDDED TOMCAT IS CREATED HERE
   │     │                                     (createWebServer(), but NOT started
   │     │                                      serving — connector start is deferred)
   │     │
   │     ├─ registerListeners()
   │     │
   │     ├─ finishBeanFactoryInitialization()  ◄── preInstantiateSingletons():
   │     │                                        every non-lazy singleton is built
   │     │                                        (the full lifecycle diagram above)
   │     │                                        ~70-85% of startup time lives here
   │     │
   │     └─ finishRefresh()                • LifecycleProcessor.onRefresh()
   │                                       • WebServerStartStopLifecycle STARTS the
   │                                         Tomcat connector → port opens NOW
   │                                                    → ContextRefreshedEvent
   │                                                    → ServletWebServerInitializedEvent
   │
   ├─ 8. afterRefresh() + callRunners()
   │       ApplicationRunner and CommandLineRunner, sorted by @Order
   │       ⚠ These run AFTER the port is open. A slow runner means the pod
   │         accepts traffic while still warming up. Use a readiness probe.
   │
   └─ 9. running()                                      → ApplicationReadyEvent
                                                        (or ApplicationFailedEvent)
```

### Things this sequence explains

- **Why `@Value` in a `BeanFactoryPostProcessor` is unreliable.** BFPPs are instantiated before
  `PropertySourcesPlaceholderConfigurer` has necessarily run. Read from `Environment` directly.
- **Why the port opens before `CommandLineRunner` finishes.** If your runner takes 20 s to prime a
  cache, Kubernetes will route traffic to a pod that returns 500s. Fix: do the warmup in a listener
  for `ApplicationReadyEvent` *and* keep the readiness probe red until it completes via
  `AvailabilityChangeEvent.publish(ctx, ReadinessState.ACCEPTING_TRAFFIC)`.
- **Why auto-configuration can't override your beans by accident.** `AutoConfigurationImportSelector`
  is a `DeferredImportSelector`, processed after all regular `@Configuration` classes, so
  `@ConditionalOnMissingBean` always sees your definitions.

### Startup profiling — how to actually find the slow bean

```java
// Boot 2.4+: structured startup tracking
public static void main(String[] args) {
    SpringApplication app = new SpringApplication(App.class);
    app.setApplicationStartup(new BufferingApplicationStartup(4096));
    app.run(args);
}
```

Then `GET /actuator/startup` returns every step with wall-clock duration. Real example from an
audit I ran: a `@Bean` that did a synchronous `RestTemplate` call to a config service during
construction added **4.1 s** to every pod start, and during an incident when that service was down,
`connectTimeout` was unset so pods hung for 130 s and the deployment rolled back.

Cheaper alternatives:
- `-Ddebug` prints the condition evaluation report.
- `logging.level.org.springframework.context.support=DEBUG`.
- `spring.main.lazy-initialization=true` cuts startup 30-60%, but moves failures to first request
  and hides wiring errors. **Use it in dev only.** Never in prod.

---

## Auto-Configuration Internals

### The mechanism, end to end

```
@SpringBootApplication
      │ includes
      ↓
@EnableAutoConfiguration
      │ = @AutoConfigurationPackage + @Import(AutoConfigurationImportSelector.class)
      ↓
AutoConfigurationImportSelector  (a DeferredImportSelector — runs LAST)
      │
      ├─ 1. LOAD CANDIDATES
      │      Boot 3.x: META-INF/spring/
      │                org.springframework.boot.autoconfigure.AutoConfiguration.imports
      │                (plain text, one FQCN per line)
      │      Boot 2.x: META-INF/spring.factories, key
      │                org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
      │      → ~160 candidates from spring-boot-autoconfigure alone
      │
      ├─ 2. REMOVE DUPLICATES
      │
      ├─ 3. APPLY EXCLUSIONS
      │      @SpringBootApplication(exclude=...), spring.autoconfigure.exclude=...
      │
      ├─ 4. FILTER  ◄── the fast path, this is why startup isn't 30 s
      │      AutoConfigurationImportFilter implementations read
      │      META-INF/spring-autoconfigure-metadata.properties
      │      (generated at build time) and drop candidates by
      │      OnClassCondition / OnBeanCondition / OnWebApplicationCondition
      │      WITHOUT loading the class. ~160 → ~25 survive typically.
      │
      ├─ 5. SORT
      │      @AutoConfigureOrder → @AutoConfigureBefore/@AutoConfigureAfter
      │      → alphabetical as the tiebreaker
      │
      └─ 6. IMPORT the survivors as @Configuration classes
             │
             ↓
      Per-class and per-@Bean CONDITION EVALUATION (the slow, precise path)
             │
      ┌──────┴───────────────────────────────────────────────────────┐
      │ @ConditionalOnClass(DataSource.class)        classpath check  │
      │ @ConditionalOnMissingClass                                    │
      │ @ConditionalOnBean(DataSource.class)         registry check   │
      │ @ConditionalOnMissingBean                    ◄── YOUR BEAN WINS│
      │ @ConditionalOnSingleCandidate                                 │
      │ @ConditionalOnProperty(prefix, name, havingValue,             │
      │                        matchIfMissing)                        │
      │ @ConditionalOnResource(resources = "classpath:schema.sql")    │
      │ @ConditionalOnWebApplication(type = SERVLET)                  │
      │ @ConditionalOnExpression("#{...SpEL...}")                     │
      │ @ConditionalOnJava(JavaVersion.SEVENTEEN)                     │
      │ @ConditionalOnCloudPlatform(CloudPlatform.KUBERNETES)         │
      └───────────────────────────────────────────────────────────────┘
             │
             ↓
      Matching @Bean methods registered → ordinary bean lifecycle
```

### A real auto-configuration, annotated

```java
@AutoConfiguration(before = { SqlInitializationAutoConfiguration.class })
@ConditionalOnClass({ DataSource.class, EmbeddedDatabaseType.class })
@ConditionalOnMissingBean(type = "io.r2dbc.spi.ConnectionFactory")
@EnableConfigurationProperties(DataSourceProperties.class)
@Import({ DataSourcePoolMetadataProvidersConfiguration.class })
public class DataSourceAutoConfiguration {

    @Configuration(proxyBeanMethods = false)
    @Conditional(PooledDataSourceCondition.class)
    @ConditionalOnMissingBean({ DataSource.class, XADataSource.class })   // ← the important line
    @Import({ Hikari.class, Tomcat.class, Dbcp2.class, OracleUcp.class, Generic.class })
    protected static class PooledDataSourceConfiguration { }

    static class Hikari {
        @Bean
        @ConfigurationProperties(prefix = "spring.datasource.hikari")
        HikariDataSource dataSource(DataSourceProperties properties) { ... }
    }
}
```

Read that as: *"If JDBC classes are present, and the user has not already defined a `DataSource`,
and a pooling implementation is on the classpath, create a `HikariDataSource` bound to
`spring.datasource.hikari.*`."* The `@ConditionalOnMissingBean({DataSource.class})` is the entire
override story — define your own `@Bean DataSource` and Boot steps aside completely. No
`exclude` needed.

Note `@AutoConfiguration` (Boot 3.0+) is a meta-annotation for
`@Configuration(proxyBeanMethods = false)` plus `@AutoConfigureBefore/After`. `proxyBeanMethods =
false` is deliberate: it skips CGLIB subclassing of the config class, which saves class generation
and metaspace across ~25 config classes. The cost is that inter-`@Bean` method calls no longer
return the singleton, which is why auto-config classes always pass dependencies as method
parameters instead of calling sibling `@Bean` methods.

```java
// @Configuration(proxyBeanMethods = true)  — DEFAULT
@Configuration
public class Cfg {
    @Bean A a() { return new A(); }
    @Bean B b() { return new B(a()); }   // a() intercepted by CGLIB → returns the SINGLETON
}

// @Configuration(proxyBeanMethods = false)  — "lite" mode
@Configuration(proxyBeanMethods = false)
public class Cfg {
    @Bean A a() { return new A(); }
    @Bean B b() { return new B(a()); }   // ❌ plain Java call → a SECOND, unmanaged A instance
    @Bean B b(A a) { return new B(a); }  // ✅ inject it instead
}
```

That second-instance bug is genuinely nasty: you get two `DataSource`s, two connection pools, and
a metrics dashboard showing half the connections you expect.

### Debugging auto-configuration: the conditions report

```bash
java -jar app.jar --debug
# or
logging.level.org.springframework.boot.autoconfigure=DEBUG
# or, at runtime:
curl localhost:8080/actuator/conditions | jq
```

Output shape:

```
============================
CONDITIONS EVALUATION REPORT
============================

Positive matches:
-----------------
   DataSourceAutoConfiguration matched:
      - @ConditionalOnClass found required classes 'javax.sql.DataSource',
        'org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType' (OnClassCondition)

   DataSourceAutoConfiguration#dataSource matched:
      - @ConditionalOnMissingBean (types: javax.sql.DataSource,javax.sql.XADataSource;
        SearchStrategy: all) did not find any beans (OnBeanCondition)

Negative matches:
-----------------
   RedisAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class
           'org.springframework.data.redis.core.RedisOperations' (OnClassCondition)

   HibernateJpaAutoConfiguration:
      Did not match:
         - @ConditionalOnBean (types: javax.sql.DataSource) did not find any beans
           (OnBeanCondition)

Exclusions:
-----------
    org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration

Unconditional classes:
----------------------
    org.springframework.boot.autoconfigure.context.ConfigurationPropertiesAutoConfiguration
```

**How to use it in an interview answer:** "When a bean I expected isn't there, I run with `--debug`
and search the Negative matches section for the auto-configuration class name. Nine times out of ten
it's a missing classpath dependency or a `@ConditionalOnBean` that fires before its dependency
exists because of `@AutoConfigureAfter` ordering." That sentence alone signals you have debugged
this for real.

### Disabling auto-configuration correctly

```java
// Compile-time exclusion — preferred, refactor-safe
@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class,
                                   SecurityAutoConfiguration.class })

// Property-based — needed when the class isn't on the compile classpath
spring.autoconfigure.exclude=\
  org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration
```

Common real cause: a service pulls in `spring-boot-starter-data-jpa` transitively (via a shared
library) but has no database. Startup fails with
`Failed to configure a DataSource: 'url' attribute is not specified and no embedded datasource
could be configured.` Excluding `DataSourceAutoConfiguration` is the band-aid; removing the
transitive dependency is the fix.

---

## Writing Your Own Starter

Every platform team eventually writes one. The interview question is "how would you distribute a
shared HTTP client / audit logger / tenancy resolver across 40 services?"

### The two-module convention

```
acme-audit-spring-boot-autoconfigure/     ← the code + @AutoConfiguration + conditions
acme-audit-spring-boot-starter/           ← an empty POM that depends on the above + deps
```

Naming rule: **never** prefix with `spring-boot-` (that namespace is reserved by the Spring team).
`acme-audit-spring-boot-starter` is correct; `spring-boot-starter-acme-audit` is not.

### 1. Properties class

```java
@ConfigurationProperties(prefix = "acme.audit")
@Validated
public record AuditProperties(
        @DefaultValue("true") boolean enabled,
        @NotBlank String topic,
        @DefaultValue("5s") Duration flushInterval,
        @Min(1) @Max(10_000) @DefaultValue("500") int batchSize) { }
```

Records work as `@ConfigurationProperties` from Boot 3.0 via constructor binding — no `@Setter`,
genuinely immutable. In Boot 2.x you needed `@ConstructorBinding`.

### 2. The auto-configuration

```java
@AutoConfiguration(after = KafkaAutoConfiguration.class)
@ConditionalOnClass(KafkaTemplate.class)
@ConditionalOnProperty(prefix = "acme.audit", name = "enabled",
                       havingValue = "true", matchIfMissing = true)
@EnableConfigurationProperties(AuditProperties.class)
public class AuditAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean            // ALWAYS. Let consumers override.
    AuditPublisher auditPublisher(KafkaTemplate<String, byte[]> template,
                                  AuditProperties props) {
        return new KafkaAuditPublisher(template, props);
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnWebApplication(type = Type.SERVLET)
    FilterRegistrationBean<AuditFilter> auditFilter(AuditPublisher publisher) {
        var reg = new FilterRegistrationBean<>(new AuditFilter(publisher));
        reg.setOrder(Ordered.HIGHEST_PRECEDENCE + 20);
        return reg;
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnAvailableEndpoint(endpoint = AuditEndpoint.class)
    AuditEndpoint auditEndpoint(AuditPublisher publisher) {
        return new AuditEndpoint(publisher);
    }
}
```

### 3. Registration file

```
src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
```
```
com.acme.audit.autoconfigure.AuditAutoConfiguration
```

Boot 2.7 supports both this file and `spring.factories`; Boot 3.0 **removed** `spring.factories`
support for auto-configuration entirely. If you upgrade a starter to Boot 3 and forget to add this
file, the starter silently does nothing — no error, no warning. This is one of the top three
migration bugs.

### 4. Metadata for IDE autocomplete

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-configuration-processor</artifactId>
  <optional>true</optional>
</dependency>
```

Generates `META-INF/spring-configuration-metadata.json` so `acme.audit.` autocompletes in IntelliJ.
Also add `spring-boot-autoconfigure-processor` to generate the
`spring-autoconfigure-metadata.properties` used by the fast filter in step 4 of the resolution
sequence — without it, your auto-config class is loaded and reflected on at every startup.

### Design rules for starters, learned the hard way

1. **Every `@Bean` gets `@ConditionalOnMissingBean`.** A starter that cannot be overridden becomes
   a fork.
2. **Provide a kill switch** (`acme.audit.enabled=false`). During an incident, a platform team must
   be able to disable your library via a config map without redeploying.
3. **Make dependencies `optional` or `provided`** in the autoconfigure module so consumers control
   versions; the starter module declares the real ones.
4. **Never `@ComponentScan` from a starter.** It scans the *consumer's* packages and picks up beans
   you don't own. Declare beans explicitly.
5. **Test with `ApplicationContextRunner`** — 5 ms per scenario, no context loaded:

```java
class AuditAutoConfigurationTest {

    private final ApplicationContextRunner runner = new ApplicationContextRunner()
            .withConfiguration(AutoConfigurations.of(AuditAutoConfiguration.class));

    @Test
    void backsOffWhenUserDefinesOwnPublisher() {
        runner.withUserConfiguration(CustomPublisherConfig.class)
              .run(ctx -> assertThat(ctx).hasSingleBean(AuditPublisher.class)
                                         .getBean(AuditPublisher.class)
                                         .isInstanceOf(NoopAuditPublisher.class));
    }

    @Test
    void disabledByProperty() {
        runner.withPropertyValues("acme.audit.enabled=false")
              .run(ctx -> assertThat(ctx).doesNotHaveBean(AuditPublisher.class));
    }

    @Test
    void backsOffWithoutKafkaOnClasspath() {
        runner.withClassLoader(new FilteredClassLoader(KafkaTemplate.class))
              .run(ctx -> assertThat(ctx).doesNotHaveBean(AuditPublisher.class));
    }
}
```

`ApplicationContextRunner` is the most underused class in Spring Boot. It is how the Spring team
tests all 160 auto-configurations, and it turns "does my starter back off correctly?" from a
30-second `@SpringBootTest` into a millisecond unit test.

---

## Configuration and Property Resolution

### The `Environment` abstraction

`Environment` = **profiles** + an ordered `MutablePropertySources` list. Resolution walks the list
front to back and returns the **first** hit. That's the entire model, and it explains every
"why is my property not taking effect" question.

```
Environment.getProperty("spring.datasource.url")
        │
        ↓  iterate MutablePropertySources IN ORDER, first match wins
┌──────────────────────────────────────────────────────────────┐
│ [0] configurationProperties (a wrapper for relaxed binding)  │
│ [1] commandLineArgs         --spring.datasource.url=...      │
│ [2] servletConfigInitParams                                  │
│ [3] servletContextInitParams                                 │
│ [4] systemProperties        -Dspring.datasource.url=...      │
│ [5] systemEnvironment       SPRING_DATASOURCE_URL=...        │
│ [6] random                  ${random.uuid}                   │
│ [7] applicationConfig: [classpath:/application-prod.yml]     │
│ [8] applicationConfig: [classpath:/application.yml]          │
│ [9] defaultProperties                                        │
└──────────────────────────────────────────────────────────────┘
```

### Full precedence order (highest wins)

Boot documents this as an ordered list where later entries override earlier ones. Inverted here so
**#1 is strongest**, which is how you actually reason about it during an incident:

```
 1. Devtools global settings   ~/.config/spring-boot/spring-boot-devtools.properties  (dev only)
 2. @TestPropertySource                                                    (tests only)
 3. properties attribute on @SpringBootTest                                (tests only)
 4. Command line arguments                     --server.port=9000
 5. SPRING_APPLICATION_JSON                    env var or system property holding inline JSON
 6. ServletConfig init parameters
 7. ServletContext init parameters
 8. JNDI attributes from java:comp/env
 9. Java System properties                     -Dserver.port=9000
10. OS environment variables                   SERVER_PORT=9000
11. RandomValuePropertySource                  ${random.int(1024,65535)}
12. Profile-specific application properties OUTSIDE the jar   ./config/application-prod.yml
13. Profile-specific application properties INSIDE  the jar   application-prod.yml
14. Application properties OUTSIDE the jar                    ./config/application.yml
15. Application properties INSIDE  the jar                    application.yml
16. @PropertySource on an @Configuration class
17. SpringApplication.setDefaultProperties(...)
```

Two consequences that end arguments in code review:

- **System properties (#9) beat OS environment variables (#10).** Most people assume the reverse.
  So `-Dspring.profiles.active=dev` in `JAVA_TOOL_OPTIONS` silently overrides
  `SPRING_PROFILES_ACTIVE=prod` from your Kubernetes deployment. I have seen a prod pod boot with
  the dev profile for exactly this reason.
- **Profile-specific always beats non-profile-specific**, regardless of file location. A value in
  `application-prod.yml` inside the jar beats `application.yml` mounted from a ConfigMap. If your
  ConfigMap override "isn't working," this is why.

Check what actually won:

```bash
curl localhost:8080/actuator/env/server.port | jq
# → shows EVERY property source containing that key, and which one is active
```

### Relaxed binding

Spring Boot canonicalizes property names to lowercase kebab-case before matching. These are all the
same property:

```
acme.audit.flush-interval    ← canonical form; always write this
acme.audit.flushInterval     ← camelCase
acme.audit.flush_interval    ← underscore
ACME_AUDIT_FLUSHINTERVAL     ← env var (uppercase, dots/dashes → underscore)
ACME_AUDIT_FLUSH_INTERVAL    ← env var
```

**Relaxed binding only applies to `@ConfigurationProperties`, never to `@Value`.**
`@Value("${acme.audit.flushInterval}")` does an exact lookup and fails against a YAML file that
spells it `flush-interval`. This is a genuinely common production bug.

Env-var rules for nested/indexed properties:
- `spring.datasource.url` → `SPRING_DATASOURCE_URL`
- `acme.hosts[0]` → `ACME_HOSTS_0_`
- A property with a hyphen inside a *map key* cannot be expressed as an env var; use
  `SPRING_APPLICATION_JSON` instead.

### `@Value` vs `@ConfigurationProperties`

```java
// ❌ @Value scattered across a class — this is how config rots
@Service
public class PricingService {
    @Value("${pricing.base-url}")            private String baseUrl;
    @Value("${pricing.timeout-ms:5000}")     private int timeoutMs;
    @Value("${pricing.retries:3}")           private int retries;
    @Value("${pricing.api-key}")             private String apiKey;
    // - No validation. A typo in the property name = null field, discovered at runtime.
    // - Non-final fields. Not testable without reflection.
    // - No IDE autocomplete, no metadata, no grouping.
    // - Injected AFTER the constructor, so unusable during construction.
}

// ✅ @ConfigurationProperties — typed, validated, immutable, documented
@ConfigurationProperties(prefix = "pricing")
@Validated
public record PricingProperties(
        @NotNull URI baseUrl,
        @DefaultValue("5s")  Duration timeout,      // "5s", "500ms", "PT1M" all parse
        @DefaultValue("3") @Min(0) @Max(10) int retries,
        @NotBlank String apiKey,
        @DefaultValue("10MB") DataSize maxPayload,  // "10MB", "1GB"
        Map<String, String> headers,
        List<String> fallbackHosts) { }

@EnableConfigurationProperties(PricingProperties.class)   // or @ConfigurationPropertiesScan
@Configuration
class PricingConfig { }

@Service
public class PricingService {
    private final PricingProperties props;
    PricingService(PricingProperties props) { this.props = props; }   // available in constructor
}
```

`@Validated` on the properties class turns a config typo into a **startup failure** with a precise
message, instead of a `NullPointerException` at 2am on the first request that touches that code
path. That single behavioral difference is the whole argument.

Use `@Value` only for one-off values with no natural grouping, and prefer SpEL-free forms.

Refreshing config at runtime (Spring Cloud Config):

```java
@ConfigurationProperties("feature")
@RefreshScope                   // beans are re-created on POST /actuator/refresh
public class FeatureFlags { ... }
```

`@RefreshScope` proxies the bean and destroys/recreates the target on refresh. Caveat: anything
that captured a *value* from it (a `DataSource` built from the properties) does not update. For
dynamic feature flags, prefer a dedicated flag system (Unleash, LaunchDarkly) over abusing config
refresh.

### Profiles

```yaml
# application.yml — multi-document YAML, Boot 2.4+ syntax
spring:
  application:
    name: order-service
  jpa:
    open-in-view: false

---
spring:
  config:
    activate:
      on-profile: local          # Boot 2.4+. (Boot 2.3 used `spring.profiles: local`)
  datasource:
    url: jdbc:h2:mem:orders
logging:
  level:
    org.hibernate.SQL: DEBUG

---
spring:
  config:
    activate:
      on-profile: prod
  datasource:
    url: ${DB_URL}
    hikari:
      maximum-pool-size: 20
```

Rules that matter:

- `spring.profiles.active` **replaces** the active set; `spring.profiles.include` **adds** to it.
  You cannot set `spring.profiles.active` in a profile-specific document (Boot will refuse).
- **Profile groups** (Boot 2.4+) beat a soup of includes:
  ```yaml
  spring.profiles.group.prod: prod-db,prod-cache,observability
  ```
- `@Profile("!test")` for negation; `@Profile({"prod","staging"})` for OR.
- **Anti-pattern:** `@Profile` on `@Service` beans to switch business behavior. You end up with code
  paths that only ever execute in one environment and are therefore never tested. Use it for
  *infrastructure* wiring (a fake SMS gateway in `local`), not for domain logic.
- The default profile is literally named `default` and applies when nothing else is active. Beans
  annotated `@Profile("default")` disappear the moment anyone sets any profile — a classic surprise.

### Secrets

Never in `application.yml`, never in git. In order of preference:

1. **Kubernetes Secret → env var**, plus `spring.config.import: optional:configtree:/etc/secrets/`
   to read a mounted secret directory where each file is a property.
2. **Vault / AWS Secrets Manager / GCP Secret Manager** via
   `spring.config.import: vault://secret/order-service` (Spring Cloud Vault) — supports rotation.
3. **Jasypt encrypted properties** — better than plaintext, worse than a real secret store, because
   the decryption key still has to live somewhere.

Also: `management.endpoint.env.show-values=WHEN_AUTHORIZED` (Boot 3.0+) — otherwise
`/actuator/env` happily prints your database password to anyone who can reach the port. Boot 3
sanitizes by default now, but the sanitizer works on key-name heuristics (`password`, `secret`,
`key`, `token`), so a property named `dbCredential` leaks.

---

## Spring MVC: The Request Path

### The complete flow

Every senior interview eventually asks "walk me through what happens when a request hits your
service." This is the answer.

```
   HTTP request:  POST /api/orders   Content-Type: application/json
        │
        ↓
┌───────────────────────────────────────────────────────────────────────────┐
│ EMBEDDED TOMCAT                                                            │
│   Acceptor thread → NIO poller → hands off to a worker from the            │
│   thread pool (server.tomcat.threads.max, DEFAULT 200)                     │
│   Backlog: server.tomcat.accept-count (100), max-connections (8192)        │
│   ⚠ From here on, ONE THREAD is bound to this request until the response   │
│     is written. Blocking anywhere blocks that thread.                      │
└──────────────────────────────┬────────────────────────────────────────────┘
                               ↓
┌───────────────────────────────────────────────────────────────────────────┐
│ SERVLET FILTER CHAIN  (jakarta.servlet.Filter — knows nothing about Spring)│
│   OrderedCharacterEncodingFilter          (-2147483648 + ...)              │
│   WebMvcMetricsFilter / ServerHttpObservationFilter   ← timing starts here │
│   OrderedFormContentFilter                                                 │
│   OrderedRequestContextFilter                                             │
│   ─── springSecurityFilterChain (a DelegatingFilterProxy → FilterChainProxy)│
│         └─ 15-25 security filters run as a NESTED chain (see Security)     │
│   your custom filters (FilterRegistrationBean.setOrder)                    │
│                                                                            │
│   Filters wrap the whole request. They can short-circuit (never call        │
│   chain.doFilter) and can swap the request/response objects.               │
└──────────────────────────────┬────────────────────────────────────────────┘
                               ↓
┌───────────────────────────────────────────────────────────────────────────┐
│ DispatcherServlet.doDispatch()                                             │
│                                                                            │
│  1. checkMultipart()  → wraps as MultipartHttpServletRequest if needed     │
│                                                                            │
│  2. getHandler(request)  → iterate HandlerMappings by order:               │
│       RequestMappingHandlerMapping   (@RequestMapping — the usual one)     │
│       RouterFunctionMapping          (functional endpoints)                │
│       BeanNameUrlHandlerMapping                                            │
│       SimpleUrlHandlerMapping        (static resources)                    │
│     Returns a HandlerExecutionChain = handler + matched interceptors       │
│     No match → NoHandlerFoundException → 404                               │
│                                                                            │
│  3. getHandlerAdapter(handler) → RequestMappingHandlerAdapter              │
│                                                                            │
│  4. ─── interceptor.preHandle()  in registration order ────────────┐       │
│         return false ⇒ short-circuit, response must be written here │       │
│                                                                    │       │
│  5. HandlerMethodArgumentResolver chain populates method params:    │       │
│       PathVariableMethodArgumentResolver     @PathVariable          │       │
│       RequestParamMethodArgumentResolver     @RequestParam          │       │
│       RequestResponseBodyMethodProcessor     @RequestBody           │       │
│         └─ HttpMessageConverter: MappingJackson2HttpMessageConverter│       │
│            reads JSON → POJO                                        │       │
│       ModelAttributeMethodProcessor, ServletRequestMethodArgResolver│       │
│       AuthenticationPrincipalArgumentResolver (@AuthenticationPrincipal)   │
│       + your custom ones (WebMvcConfigurer#addArgumentResolvers)    │       │
│                                                                    │       │
│     @Valid triggers here → MethodArgumentNotValidException on failure      │
│                                                                    │       │
│  6. CONTROLLER METHOD INVOKED (reflectively)                        │       │
│       └→ @Service     (possibly wrapped in a @Transactional proxy)  │       │
│            └→ @Repository / EntityManager                           │       │
│                 └→ Hikari connection borrowed  ←── held until commit│       │
│                      └→ JDBC → database                             │       │
│            ←─ transaction COMMIT, connection returned to pool       │       │
│                                                                    │       │
│  7. HandlerMethodReturnValueHandler                                 │       │
│       RequestResponseBodyMethodProcessor (@ResponseBody):           │       │
│         content negotiation → pick HttpMessageConverter →           │       │
│         Jackson serializes POJO → JSON → response body              │       │
│       ⚠ If a LAZY association is touched HERE and the session is    │       │
│         closed → LazyInitializationException mid-serialization,     │       │
│         producing a half-written 200 response with broken JSON.     │       │
│                                                                    │       │
│  8. ─── interceptor.postHandle()  in REVERSE order ─────────────────┘       │
│         (skipped if the handler threw)                                     │
│                                                                            │
│  9. processDispatchResult()                                                │
│       exception? → HandlerExceptionResolver chain:                         │
│           ExceptionHandlerExceptionResolver  (@ExceptionHandler /          │
│                                               @ControllerAdvice)           │
│           ResponseStatusExceptionResolver    (@ResponseStatus)             │
│           DefaultHandlerExceptionResolver    (Spring's own → 400/405/415)  │
│       else → render view (or nothing, for @ResponseBody)                   │
│                                                                            │
│ 10. ─── interceptor.afterCompletion()  REVERSE order ── ALWAYS runs,       │
│         even on exception. This is where you clean up MDC/ThreadLocals.    │
└──────────────────────────────┬────────────────────────────────────────────┘
                               ↓
              filters unwind (finally blocks run in reverse)
                               ↓
                        HTTP response → client
```

### `@RestController` and the annotations that matter

```java
@RestController                       // = @Controller + @ResponseBody on every method
@RequestMapping("/api/orders")
@Validated                            // enables validation on @RequestParam/@PathVariable too
public class OrderController {

    private final OrderService service;
    OrderController(OrderService service) { this.service = service; }

    @GetMapping("/{id}")
    ResponseEntity<OrderResponse> get(@PathVariable UUID id) {
        return service.find(id)
                      .map(ResponseEntity::ok)
                      .orElseThrow(() -> new OrderNotFoundException(id));
    }

    @GetMapping
    Page<OrderSummary> search(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam @Min(0) int minAmount,               // needs @Validated on the class
            @PageableDefault(size = 50, sort = "createdAt", direction = DESC) Pageable pageable) {
        return service.search(status, minAmount, pageable);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    OrderResponse create(@Valid @RequestBody CreateOrderRequest request,
                         @RequestHeader("Idempotency-Key") String idempotencyKey) {
        return service.create(request, idempotencyKey);
    }

    @PatchMapping("/{id}")
    OrderResponse patch(@PathVariable UUID id,
                        @RequestBody JsonNode patch) { ... }
}
```

Details that separate levels:

- **Return `Page<T>` / DTOs, never entities.** Serializing a JPA entity leaks your schema, triggers
  lazy loads during serialization, and creates infinite recursion on bidirectional relationships
  (`@JsonIgnore` / `@JsonManagedReference` are band-aids for a design mistake).
- **`ResponseEntity<T>` vs plain `T` vs `@ResponseStatus`.** Use plain `T` + `@ResponseStatus` when
  the status is fixed; `ResponseEntity` only when the status or headers vary at runtime.
- **`@Validated` on the class is required** for constraint annotations on `@RequestParam`,
  `@PathVariable`, and method-level constraints. `@Valid` on a `@RequestBody` works without it.
  Two different mechanisms: `@Valid` → argument resolver; `@Validated` → an AOP proxy
  (`MethodValidationPostProcessor`), which throws `ConstraintViolationException` (500 by default —
  you must handle it) rather than `MethodArgumentNotValidException` (400).
- `consumes`/`produces` narrow the mapping and produce `415`/`406` instead of `404` when they don't
  match, which is a much better client experience.

### Global exception handling that is actually production grade

Use RFC 7807 `ProblemDetail` (built into Spring 6 / Boot 3).

```java
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(OrderNotFoundException.class)
    ProblemDetail handleNotFound(OrderNotFoundException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(NOT_FOUND, ex.getMessage());
        pd.setType(URI.create("https://api.acme.com/problems/order-not-found"));
        pd.setTitle("Order not found");
        pd.setProperty("orderId", ex.getOrderId());
        return pd;                       // 404, Content-Type: application/problem+json
    }

    // Override the parent's hook so ALL @Valid failures share one shape
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers,
            HttpStatusCode status, WebRequest request) {

        ProblemDetail pd = ProblemDetail.forStatus(BAD_REQUEST);
        pd.setTitle("Validation failed");
        pd.setProperty("errors", ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> Map.of("field", fe.getField(),
                                  "rejected", String.valueOf(fe.getRejectedValue()),
                                  "message", Objects.toString(fe.getDefaultMessage())))
                .toList());
        return ResponseEntity.badRequest().body(pd);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ProblemDetail handleConflict(DataIntegrityViolationException ex) {
        log.warn("Constraint violation", ex);
        // NEVER echo ex.getMessage() — it contains table/column/constraint names
        return ProblemDetail.forStatusAndDetail(CONFLICT, "Resource already exists");
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail handleAll(Exception ex) {
        String traceId = MDC.get("traceId");
        log.error("Unhandled exception traceId={}", traceId, ex);   // full stack in logs only
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
                INTERNAL_SERVER_ERROR, "An unexpected error occurred");
        pd.setProperty("traceId", traceId);      // support can correlate without leaking internals
        return pd;
    }
}
```

Rules learned from real incidents:

1. **Never return `ex.getMessage()` for 500s.** SQL errors expose schema; deserialization errors
   expose class names. Both are reconnaissance for an attacker.
2. **Always attach the trace ID to the response.** A support ticket that includes a trace ID takes
   90 seconds to diagnose; one that says "it broke" takes an hour.
3. **Order matters.** `@RestControllerAdvice` beans are sorted by `@Order`; within one advice, Spring
   picks the *most specific* exception handler. A catch-all `Exception` handler in an unordered
   advice can swallow a more specific handler in another advice.
4. **Scope your advice** in a modular monolith: `@RestControllerAdvice(basePackages = "com.acme.orders")`.
5. `ErrorResponseException` / `ResponseStatusException` are fine for simple cases and avoid a custom
   exception class per error.

### Content negotiation

```
Order of strategies (ContentNegotiationManager):
  1. Path extension        — DISABLED by default since Spring 5.3 (security: /file.json tricks)
  2. Query parameter       — spring.mvc.contentnegotiation.favor-parameter=true  (?format=xml)
  3. Accept header         — the default and the correct one
  4. defaultContentType    — fallback when Accept is */* or absent
```

```java
@Configuration
class WebConfig implements WebMvcConfigurer {
    @Override public void configureContentNegotiation(ContentNegotiationConfigurer c) {
        c.defaultContentType(MediaType.APPLICATION_JSON)
         .favorParameter(false)
         .ignoreAcceptHeader(false);
    }
}
```

Practical use: API versioning via media type —
`produces = "application/vnd.acme.order.v2+json"` lets two controller methods share a path and
route by `Accept`. Cleaner than `/v2/` in the URL when you version resources independently, uglier
for clients. Pick one and be consistent.

---

## Filters vs Interceptors vs AOP

Candidates confuse these constantly. The distinction is about **what layer you have access to**.

```
      ┌──────────────────────────────────────────────────────────────────┐
      │ SERVLET FILTER                                                   │
      │  Sees: raw HttpServletRequest/Response, the InputStream          │
      │  Cannot see: which controller will handle it, method args        │
      │  Registered with: Tomcat, before Spring MVC exists               │
      │  ┌────────────────────────────────────────────────────────────┐  │
      │  │ HANDLERINTERCEPTOR                                         │  │
      │  │  Sees: the resolved handler (HandlerMethod), ModelAndView  │  │
      │  │  Cannot see: resolved method arguments, return value       │  │
      │  │  Registered with: Spring MVC (WebMvcConfigurer)            │  │
      │  │  ┌──────────────────────────────────────────────────────┐  │  │
      │  │  │ @Aspect / AOP ADVICE                                 │  │  │
      │  │  │  Sees: typed method args, return value, exceptions   │  │  │
      │  │  │  Cannot see: HTTP at all (unless it digs into        │  │  │
      │  │  │              RequestContextHolder)                   │  │  │
      │  │  │  Applies to ANY bean, not just controllers           │  │  │
      │  │  │  ┌────────────────────────────────────────────────┐  │  │  │
      │  │  │  │           YOUR CONTROLLER METHOD               │  │  │  │
      │  │  │  └────────────────────────────────────────────────┘  │  │  │
      │  │  └──────────────────────────────────────────────────────┘  │  │
      │  └────────────────────────────────────────────────────────────┘  │
      └──────────────────────────────────────────────────────────────────┘
```

| | Filter | HandlerInterceptor | AOP Advice |
|---|---|---|---|
| **Layer** | Servlet (Tomcat) | Spring MVC | Spring bean/proxy |
| **Runs when no handler matches (404)** | Yes | No | No |
| **Can modify the request body stream** | Yes | No | No |
| **Knows the target controller method** | No | Yes (`HandlerMethod`) | Yes |
| **Sees typed method arguments** | No | No | Yes |
| **Sees the return value before serialization** | No | Via `ModelAndView` only | Yes |
| **Works on non-web beans** | No | No | Yes |
| **Wraps response writing** | Yes | No (`postHandle` runs before writing for `@ResponseBody`) | No |

**Decision rule:**

- **Filter** → anything that must apply to *every* byte of *every* request, including ones that 404
  or are rejected by security: request/response logging, correlation-ID (MDC) setup, GZIP,
  rate limiting, CORS, request body caching, tenant resolution from a subdomain.
- **Interceptor** → cross-cutting logic that needs to know *which endpoint* was matched:
  per-endpoint auth annotations, feature-flag gating by handler, adding a handler-specific header,
  starting/stopping a timer keyed on the handler name.
- **AOP** → business-layer concerns with typed access: `@Transactional`, `@Cacheable`, `@Retryable`,
  audit logging that needs the domain object, method-level metrics on services.

```java
// FILTER — correlation ID. Must be a filter: it has to cover 404s and security rejections.
@Component
public class CorrelationIdFilter extends OncePerRequestFilter {
    static final String HEADER = "X-Correlation-Id";

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {
        String id = Optional.ofNullable(req.getHeader(HEADER))
                            .filter(StringUtils::hasText)
                            .orElseGet(() -> UUID.randomUUID().toString());
        MDC.put("correlationId", id);
        res.setHeader(HEADER, id);
        try {
            chain.doFilter(req, res);
        } finally {
            MDC.clear();      // ← MANDATORY. Tomcat reuses threads; without this the next
        }                     //   request on this thread inherits the previous request's ID.
    }
}
```

`OncePerRequestFilter` rather than raw `Filter`: it guards against re-execution on
`RequestDispatcher.forward()`/`include()` and async dispatches. A plain `Filter` that increments a
counter will double-count every request that gets forwarded to `/error`.

Registration and ordering:

```java
@Bean
FilterRegistrationBean<CorrelationIdFilter> correlationIdFilter() {
    var reg = new FilterRegistrationBean<>(new CorrelationIdFilter());
    reg.setOrder(Ordered.HIGHEST_PRECEDENCE);       // before Spring Security
    reg.addUrlPatterns("/api/*");
    return reg;
}
```

Note: a `@Component` filter is auto-registered for `/*` by
`ServletContextInitializerBeans`. If you *also* declare a `FilterRegistrationBean`, it registers
**twice**. Fix: keep the class out of component scanning, or call
`registration.setEnabled(false)` on the auto-registered one.

```java
// INTERCEPTOR — needs the HandlerMethod
public class RateLimitInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
        if (!(handler instanceof HandlerMethod hm)) return true;   // static resources
        RateLimited limit = hm.getMethodAnnotation(RateLimited.class);
        if (limit != null && !limiter.tryAcquire(key(req), limit.permitsPerSecond())) {
            res.setStatus(429);
            res.setHeader("Retry-After", "1");
            return false;                                          // short-circuit
        }
        return true;
    }
}

@Configuration
class WebConfig implements WebMvcConfigurer {
    @Override public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new RateLimitInterceptor())
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/health");
    }
}
```

---

## AOP and the Self-Invocation Trap

### Spring AOP is proxy-based, and that is the whole story

Spring AOP does **not** do bytecode weaving (that's AspectJ). It creates a wrapper object at bean
initialization time (phase 6 of the lifecycle) and puts the wrapper in the container. Everything
that follows — every gotcha, every "why isn't my `@Transactional` working" — falls out of that.

```
        WITHOUT AOP                          WITH AOP (what actually gets injected)

  ┌──────────────┐                     ┌──────────────┐
  │  Controller  │                     │  Controller  │
  └──────┬───────┘                     └──────┬───────┘
         │ orderService.place()               │ orderService.place()
         ↓                                    ↓
  ┌──────────────┐                     ┌───────────────────────────────┐
  │ OrderService │                     │  OrderService$$SpringCGLIB$$0 │  ← THE PROXY
  │  place()  ───┼──┐                  │   (or a JDK Proxy)            │
  │  audit()  ←──┘  │ internal call    │  ┌─────────────────────────┐  │
  └──────────────┘  (no proxy in path) │  │ TransactionInterceptor  │  │
                                       │  │  begin tx               │  │
                                       │  └───────────┬─────────────┘  │
                                       │              ↓                │
                                       │  ┌─────────────────────────┐  │
                                       │  │ target: OrderService    │  │
                                       │  │   place() ──┐           │  │
                                       │  │   audit() ←─┘ THIS CALL │  │
                                       │  │     NEVER LEAVES THE    │  │
                                       │  │     TARGET OBJECT       │  │
                                       │  └───────────┬─────────────┘  │
                                       │              ↓                │
                                       │      commit / rollback        │
                                       └───────────────────────────────┘
```

### JDK dynamic proxy vs CGLIB

```
┌─────────────────────────────────────────────────────────────────────────┐
│ JDK DYNAMIC PROXY                    │ CGLIB (repackaged into spring-core)│
├──────────────────────────────────────┼────────────────────────────────────┤
│ Requires the bean to implement an    │ Works on concrete classes          │
│ interface                            │                                     │
│                                      │                                     │
│ Proxy IMPLEMENTS the interface       │ Proxy is a SUBCLASS of the target  │
│                                      │                                     │
│   interface OrderService             │   class OrderServiceImpl            │
│         ↑ implements                 │         ↑ extends                   │
│   ┌─────┴──────┐  ┌──────────────┐   │   ┌─────┴──────────────────────┐   │
│   │ $Proxy42   │  │OrderServiceImpl│  │   │OrderServiceImpl$$SpringCGLIB│  │
│   │ (delegates)├─→│  (target)     │  │   │   super.method() → target   │  │
│   └────────────┘  └──────────────┘   │   └────────────────────────────┘   │
│                                      │                                     │
│ CANNOT be cast to the impl class     │ CANNOT proxy final classes         │
│ (ClassCastException on               │ CANNOT advise final/private/static │
│  (OrderServiceImpl) proxy)           │   methods (silently NOT advised)   │
│                                      │                                     │
│ Only interface methods are advised   │ Calls the constructor of the target│
│                                      │  class a second time (Spring 4.0+  │
│                                      │  uses Objenesis to avoid this)     │
│                                      │                                     │
│ ~2x slower per invocation than CGLIB │ Faster dispatch, more metaspace     │
│ (reflective InvocationHandler)       │  (~1 generated class per bean)      │
└──────────────────────────────────────┴────────────────────────────────────┘
```

**Spring Boot forces CGLIB for everything** since 2.0 (`spring.aop.proxy-target-class=true` is the
default), because interface-only proxying causes more confusion than it prevents. Spring
Framework's own default is "JDK proxy if the class implements at least one interface, else CGLIB."

Consequences to state in an interview:

- `final` classes cannot be proxied → `@Transactional` on a Kotlin class (final by default!) does
  nothing unless you use the `kotlin-spring` compiler plugin. This burns every Kotlin team once.
- `private` and `final` methods are never advised. No error, no warning.
- Fields on the proxy are **null** — the proxy subclass has all the same fields, but they're never
  populated; state lives in the target. So `((OrderService) proxy).someField` is null. Never access
  fields across a proxy boundary.
- Because Boot uses CGLIB, injecting by concrete class works, but `@Autowired OrderServiceImpl` is
  still bad practice.

### The self-invocation bug

This is the highest-value gotcha in the entire Spring ecosystem. Interviewers use it as a filter.

```java
// ❌ THE BUG
@Service
public class OrderService {

    private final OrderRepository orders;
    private final AuditRepository audits;

    public void processBatch(List<OrderRequest> requests) {
        for (OrderRequest r : requests) {
            processOne(r);          // ← plain `this.processOne(r)`. The proxy is bypassed.
        }
    }

    @Transactional                  // ← DOES ABSOLUTELY NOTHING when called from processBatch
    public void processOne(OrderRequest r) {
        Order o = orders.save(new Order(r));
        audits.save(new Audit(o.getId()));      // if THIS throws...
    }
}
```

**Actual failure mode**, which is much worse than "the annotation is ignored":

Spring Data JPA repositories are *themselves* `@Transactional` (`SimpleJpaRepository` is annotated
at class level). So with no surrounding transaction, `orders.save()` opens transaction #1, commits,
and closes it. Then `audits.save()` opens transaction #2 and throws. Result: **the order row is
committed and the audit row is not.** You now have orphaned orders with no audit trail, and no
exception anywhere that says "transaction was skipped." The system looks healthy. You find out
during a compliance audit six weeks later.

The tell in the logs — enable `logging.level.org.springframework.transaction.interceptor=TRACE`:

```
# EXPECTED (proxy applied):
TRACE o.s.t.i.TransactionInterceptor : Getting transaction for [com.acme.OrderService.processOne]
TRACE o.s.t.i.TransactionInterceptor : Completing transaction for [com.acme.OrderService.processOne]

# ACTUAL (self-invocation): nothing. Not a single line for processOne.
# Instead you see one transaction per repository call:
TRACE o.s.t.i.TransactionInterceptor : Getting transaction for [...SimpleJpaRepository.save]
TRACE o.s.t.i.TransactionInterceptor : Completing transaction for [...SimpleJpaRepository.save]
```

### Three fixes

```java
// ✅ FIX 1 — Move the annotated method to a different bean. BEST: it makes the
//            transaction boundary an explicit architectural decision.
@Service
public class OrderBatchService {
    private final OrderProcessor processor;    // separate bean → calls go through ITS proxy
    public void processBatch(List<OrderRequest> rs) { rs.forEach(processor::processOne); }
}

@Service
public class OrderProcessor {
    @Transactional
    public void processOne(OrderRequest r) { ... }     // proxy applies
}
```

```java
// ✅ FIX 2 — Self-injection. Ugly but local; fine for a targeted fix.
@Service
public class OrderService {
    @Lazy private final OrderService self;      // @Lazy avoids the circular-dependency failure

    public OrderService(@Lazy OrderService self) { this.self = self; }

    public void processBatch(List<OrderRequest> rs) {
        rs.forEach(self::processOne);           // goes through the proxy
    }

    @Transactional
    public void processOne(OrderRequest r) { ... }
}
```

```java
// ✅ FIX 3 — AopContext.currentProxy(). Requires exposeProxy=true.
@EnableAspectJAutoProxy(exposeProxy = true)     // stores the proxy in a ThreadLocal
@Configuration
class AopConfig { }

public void processBatch(List<OrderRequest> rs) {
    OrderService self = (OrderService) AopContext.currentProxy();
    rs.forEach(self::processOne);
}
// Works, but it is the most obscure of the three and couples code to Spring internals.
// Also has a real ThreadLocal cost on every advised call in the app.
```

```java
// ✅ FIX 4 (the one I actually reach for in batch code) — TransactionTemplate.
//    Programmatic transactions are explicit, testable, and immune to proxy semantics.
@Service
public class OrderService {
    private final TransactionTemplate tx;

    public OrderService(PlatformTransactionManager ptm) {
        this.tx = new TransactionTemplate(ptm);
        this.tx.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    public void processBatch(List<OrderRequest> rs) {
        for (OrderRequest r : rs) {
            tx.executeWithoutResult(status -> processOne(r));   // real boundary, per item
        }
    }
}
```

**The same bug applies to every proxy-based annotation:** `@Cacheable`, `@Async`, `@Retryable`,
`@PreAuthorize`, `@Validated`, `@RateLimiter`. `@Async` self-invocation is the second most common
version: the method runs synchronously on the caller's thread and nobody notices until an endpoint
that "fires and forgets" starts timing out.

### Writing an aspect properly

```java
@Aspect
@Component
@Order(50)                      // lower runs first / outermost
public class MetricsAspect {

    private final MeterRegistry meters;
    MetricsAspect(MeterRegistry meters) { this.meters = meters; }

    // Pointcut: any method annotated @Timed in any bean under com.acme
    @Pointcut("@annotation(com.acme.Timed) && within(com.acme..*)")
    void timedMethods() { }

    @Around("timedMethods()")
    public Object measure(ProceedingJoinPoint pjp) throws Throwable {
        Timer.Sample sample = Timer.start(meters);
        String outcome = "success";
        try {
            return pjp.proceed();            // ← forgetting this silently returns null
        } catch (Throwable t) {
            outcome = t.getClass().getSimpleName();
            throw t;                          // ← ALWAYS rethrow; swallowing here breaks tx rollback
        } finally {
            sample.stop(meters.timer("method.duration",
                    "method", pjp.getSignature().toShortString(),
                    "outcome", outcome));
        }
    }
}
```

Advice types and their exact ordering around a call:

```
   @Around  (before proceed)
      └─ @Before
           └─ ***** target method *****
      ┌─ @AfterReturning   (normal return)   ─┐
      ├─ @AfterThrowing    (exception)       ─┤ mutually exclusive
      └─ @After            (finally, always) ─┘
   @Around  (after proceed)
```

Aspect ordering pitfalls that cause real bugs:
- A custom aspect with a *higher* precedence than `TransactionInterceptor`
  (`Ordered.LOWEST_PRECEDENCE` by default) runs **outside** the transaction. If your audit aspect
  writes to the DB there, it commits separately from the business transaction.
- `@Transactional` and `@Cacheable` on the same method: cache lookup happens *outside* the
  transaction by default (`CacheInterceptor` order is `Ordered.LOWEST_PRECEDENCE - 1`, so it wraps
  the transaction). A cache hit means no transaction is opened at all — usually what you want, but
  surprising if you assumed the method always runs in a transaction.
- Set `@EnableTransactionManagement(order = ...)` if you need to interleave deliberately.

**When to use AspectJ instead of Spring AOP:** you need to advise private methods, constructors,
field access, or `final` classes, or you cannot tolerate proxy overhead. Load-time weaving
(`@EnableLoadTimeWeaving` + `-javaagent:aspectjweaver.jar`) or compile-time weaving. In 10 years I
have needed this twice. It is almost always a sign that the design should change instead.

---

## Data Access: JPA and Hibernate

### The persistence context is the thing you must understand

`EntityManager` = a **first-level cache** + a **unit of work** + a **change tracker**. It is
`@Transactional`-scoped by default in Spring. Everything JPA does that surprises you is explained by
these four entity states:

```
        ┌───────────────┐
        │  TRANSIENT    │  new Order()  — no id, unknown to any EntityManager,
        │  (new)        │  not in the DB
        └───────┬───────┘
                │ persist()  /  save()
                ↓
        ┌───────────────────────────────────────────────────────────────────┐
        │  MANAGED (persistent)                                             │
        │   • lives in the persistence context (1st-level cache)            │
        │   • Hibernate keeps a SNAPSHOT of the loaded state                │
        │   • DIRTY CHECKING: at flush, current state is compared field by  │
        │     field against the snapshot → UPDATE is generated automatically│
        │   • setName("x") is enough. You do NOT need to call save().       │
        │   • repeated find(id) returns the SAME object identity           │
        └───┬──────────────────────────┬────────────────────────────────────┘
            │ tx commit /              │ remove()
            │ em.detach() / em.clear() │
            │ tx close                 ↓
            ↓                  ┌───────────────┐
    ┌───────────────┐          │   REMOVED     │  scheduled for DELETE at flush;
    │   DETACHED    │          │               │  still in the context until then
    │   has an id,  │          └───────────────┘
    │   exists in   │
    │   the DB, but │  merge() → returns a NEW managed instance;
    │   no longer   │           the argument you passed in stays detached
    │   tracked     │           (⚠ `merge(x); x.setName(...)` changes nothing)
    │   • lazy      │
    │     fields    │
    │     THROW     │
    └───────────────┘
```

Two consequences worth stating out loud in an interview:

```java
@Transactional
public void raisePrice(Long id) {
    Product p = repo.findById(id).orElseThrow();
    p.setPrice(p.getPrice().multiply(new BigDecimal("1.1")));
    // NO repo.save(p) — dirty checking issues the UPDATE at commit.
    // Calling save() here is harmless but signals you don't know how JPA works.
}

@Transactional
public void wrong(Product detached) {
    repo.save(detached);          // save() on a detached entity → merge() → returns a COPY
    detached.setName("new");      // ❌ mutates the DETACHED copy. Never persisted.
}
@Transactional
public void right(Product detached) {
    Product managed = repo.save(detached);
    managed.setName("new");       // ✅ mutates the MANAGED instance
}
```

Flush modes:
- `AUTO` (default): flush before commit, and before any query whose result could be affected by
  pending changes. This is why a `findAll()` in the middle of a method can trigger an unexpected
  `INSERT`.
- `COMMIT`: only at commit. Faster, but a query can return stale data relative to your own pending
  writes. Use deliberately, rarely.
- Explicit `em.flush()` — needed when you must have a generated ID or you want a constraint
  violation to surface at a specific point.

### The N+1 select problem

This is the most common performance bug in every Spring application on earth. You must be able to
show it, show the SQL, and give four fixes.

```java
@Entity
public class Order {
    @Id @GeneratedValue Long id;
    String reference;

    @ManyToOne(fetch = FetchType.LAZY)
    Customer customer;

    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY)
    List<OrderLine> lines = new ArrayList<>();
}
```

```java
// ❌ THE BUG — looks completely innocent
@Transactional(readOnly = true)
public List<OrderDto> recentOrders() {
    return orderRepository.findTop500ByOrderByCreatedAtDesc().stream()
            .map(o -> new OrderDto(o.getReference(),
                                   o.getCustomer().getName(),   // ← lazy proxy initialized
                                   o.getLines().size()))        // ← lazy collection initialized
            .toList();
}
```

Turn on SQL logging (`spring.jpa.show-sql=true` plus
`logging.level.org.hibernate.SQL=DEBUG`) and this is what you see:

```sql
-- 1 query for the roots
select o.id, o.reference, o.created_at, o.customer_id from orders o
  order by o.created_at desc limit 500;

-- then, per row, a proxy initialization for the customer:
select c.id, c.name, c.email from customers c where c.id=?;   -- ×500
-- and, per row, a collection initialization:
select l.id, l.order_id, l.sku, l.qty from order_lines l where l.order_id=?;  -- ×500

-- TOTAL: 1 + 500 + 500 = 1001 queries
```

**The numbers.** Each round trip inside the same AZ is ~0.4 ms of network plus ~0.1 ms of server
time. 1001 × 0.5 ms ≈ **500 ms** for what should be a 12 ms query. Cross-AZ at 1.2 ms RTT it's
**1.2 s**. And it degrades non-linearly: each request holds its Hikari connection for the whole
500 ms instead of 12 ms, so a pool of 10 saturates at ~20 rps instead of ~800 rps. That is how an
endpoint goes from 80 ms to 12 s when traffic triples.

Detect it before production with a query counter in tests:

```java
// datasource-proxy or hibernate statistics
@Test
void recentOrdersIsNotNPlusOne() {
    Statistics stats = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();
    stats.clear();
    service.recentOrders();
    assertThat(stats.getPrepareStatementCount()).isLessThanOrEqualTo(3);
}
```

Make this a CI gate. It is the single highest-ROI test in a JPA codebase.

#### Fix 1 — `JOIN FETCH`

```java
@Query("""
       select distinct o from Order o
       join fetch o.customer
       left join fetch o.lines
       where o.createdAt > :since
       order by o.createdAt desc
       """)
List<Order> findRecentWithDetails(@Param("since") Instant since);
```
```sql
-- ONE query
select distinct o.*, c.*, l.*
from orders o
join customers c on c.id = o.customer_id
left join order_lines l on l.order_id = o.id
where o.created_at > ? order by o.created_at desc;
-- 1001 queries → 1 query
```

Caveats that get asked as follow-ups:
- **You cannot `join fetch` two collections** (`MultipleBagFetchException: cannot simultaneously
  fetch multiple bags`). Change `List` to `Set`, or fetch one collection and use `@BatchSize` for
  the other, or run two queries against the same persistence context.
- **`distinct`** was needed pre-Hibernate 6 to de-duplicate the cartesian product in memory
  (`hibernate.query.passDistinctThrough=false` avoided sending it to the DB). Hibernate 6
  de-duplicates entity results automatically; `distinct` is no longer required and adds a real
  `DISTINCT` to the SQL. Remove it when you migrate.
- **Cartesian explosion:** 500 orders × 20 lines × 3 shipments = 30,000 result rows to build 500
  objects. Fetching two collections in one query is a bandwidth disaster even when it works.

#### Fix 2 — `@EntityGraph` (declarative, reusable, works with derived queries and `Pageable`)

```java
public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = { "customer", "lines" })
    List<Order> findTop500ByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = { "customer" })      // named graphs also supported
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
}
```

`@EntityGraph` produces a `LEFT OUTER JOIN` (type `FETCH` by default) without you writing JPQL. It
is my default choice because it composes with Spring Data's derived queries and keeps the
fetch strategy at the query, where it belongs — not on the entity.

#### Fix 3 — `@BatchSize` / `default_batch_fetch_size`

```java
@OneToMany(mappedBy = "order", fetch = FetchType.LAZY)
@BatchSize(size = 100)
List<OrderLine> lines;
```
or globally, which is what I actually do:
```yaml
spring.jpa.properties.hibernate.default_batch_fetch_size: 100
```
```sql
select o.* from orders o order by o.created_at desc limit 500;
select l.* from order_lines l where l.order_id in (?,?,?, ... 100 params);  -- ×5
-- 501 queries → 6 queries
```

Turn this on in **every** project. It is a one-line change that converts every accidental N+1 into
an N/100+1, and it costs nothing. It doesn't fix the design, but it turns an outage into a
slow-ish endpoint.

#### Fix 4 — Projections (the fastest, and usually the right answer for read endpoints)

```java
public interface OrderSummary {          // interface projection — Spring Data builds the SELECT
    String getReference();
    String getCustomerName();
    int getLineCount();
}

@Query("""
       select o.reference as reference,
              c.name       as customerName,
              size(o.lines) as lineCount
       from Order o join o.customer c
       where o.createdAt > :since
       """)
List<OrderSummary> findSummaries(@Param("since") Instant since);
```

Or a DTO constructor expression / record:

```java
public record OrderSummary(String reference, String customerName, long lineCount) { }

@Query("""
       select new com.acme.OrderSummary(o.reference, c.name, count(l))
       from Order o join o.customer c left join o.lines l
       where o.createdAt > :since group by o.id, o.reference, c.name
       """)
List<OrderSummary> findSummaries(@Param("since") Instant since);
```

Why this wins: **one query, only the columns you need, no persistence context, no dirty-check
snapshots, no lazy proxies.** Loading 500 full entities to render 3 fields allocates ~500 × 2
objects (entity + snapshot) and costs real GC pressure. In a benchmark on a 500-row endpoint I
measured 41 ms with entities and 9 ms with a DTO projection, with heap allocation dropping from
14 MB to 1.2 MB per request.

**Senior rule of thumb:** entities are for *writes*. Read endpoints should use projections, or
plain `JdbcTemplate`/jOOQ. Fighting Hibernate to make a read-only report fast is a losing game.

### `FetchType.EAGER` is an anti-pattern

```java
// ❌ NEVER
@ManyToOne(fetch = FetchType.EAGER)     // this is also the DEFAULT for @ManyToOne/@OneToOne
Customer customer;
```

Four reasons:

1. **It is global and unconditional.** Every query that loads an `Order` now also loads the
   `Customer`, even the count query, even the one that only needs the reference number. You cannot
   opt out — `@EntityGraph` can add fetches, not remove them.
2. **It defeats JPQL.** `select o from Order o where ...` with an EAGER `@ManyToOne` runs the JPQL,
   then issues a *separate* select per distinct customer, because JPQL doesn't automatically join
   eager associations. You get an N+1 *caused by* EAGER.
3. **Transitive explosion.** `Order` eagerly loads `Customer`, which eagerly loads `Address`, which
   eagerly loads `Country`. Loading one order pulls a subgraph of 40 rows.
4. **It hides the problem instead of fixing it.** People set EAGER to make a
   `LazyInitializationException` go away, and trade a loud exception for a silent performance bug.

**Correct posture:** everything `LAZY` (including `@ManyToOne(fetch = LAZY)` and
`@OneToOne(fetch = LAZY, optional = false)`), and decide per query what to fetch.

Note that lazy `@OneToOne` on the *non-owning* side cannot be proxied (Hibernate must query to know
whether the row exists), so it is fetched eagerly regardless. The fix is `@MapsId` / shared primary
key, or modeling it as `@ManyToOne`.

### `LazyInitializationException` and `open-in-view`

```java
// ❌
@Transactional(readOnly = true)
public Order load(Long id) { return repo.findById(id).orElseThrow(); }

// caller, OUTSIDE the transaction:
Order o = service.load(1L);
o.getLines().size();
// org.hibernate.LazyInitializationException:
//   failed to lazily initialize a collection of role: com.acme.Order.lines:
//   could not initialize proxy - no Session
```

The session closed when the transaction ended. The lazy proxy has no way to load anything.

**`spring.jpa.open-in-view` defaults to `true` in Spring Boot.** The `OpenEntityManagerInViewInterceptor`
keeps the `EntityManager` (and, critically, its JDBC connection) open for the entire HTTP request,
including view rendering and JSON serialization. Boot even logs a warning at startup:

```
spring.jpa.open-in-view is enabled by default. Therefore, database queries may be
performed during view rendering. Explicitly configure spring.jpa.open-in-view to disable
this warning
```

Why it's harmful:

```
open-in-view = true
┌────────────────────────────────────────────────────────────────────────────┐
│ HTTP request                                                                │
│ ├─ OpenEntityManagerInViewInterceptor: OPEN EntityManager ────────────────┐ │
│ │  ├─ controller                                                          │ │
│ │  ├─ service @Transactional  [tx begin ─ JDBC connection borrowed ─ commit]│
│ │  ├─ ... call an external payment API: 800 ms ...  ← connection STILL HELD│ │
│ │  ├─ Jackson serialization → touches a lazy field → N+1 fires HERE,      │ │
│ │  │   outside any transaction, one autocommit query per access           │ │
│ │  └─ response written                                                    │ │
│ └─ CLOSE EntityManager, release connection ──────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘
   Connection held for the FULL request duration, not the transaction duration.

open-in-view = false
┌────────────────────────────────────────────────────────────────────────────┐
│ HTTP request                                                                │
│ ├─ controller                                                               │
│ ├─ service @Transactional  [open ── connection ── commit ── close] 12 ms    │
│ ├─ ... external API 800 ms ... (no DB connection held)                      │
│ ├─ serialization: lazy access now throws LazyInitializationException ←      │
│ │     GOOD. It fails loudly, in dev, at the exact line that is wrong.       │
│ └─ response                                                                 │
└────────────────────────────────────────────────────────────────────────────┘
```

Set `spring.jpa.open-in-view: false` on day one of every project. Yes, it will surface
`LazyInitializationException`s. Each one is a real bug you were previously shipping as a hidden
N+1. Fix them by fetching what you need in the query and mapping to DTOs *inside* the transactional
boundary.

### First- and second-level cache

```
┌──────────────────────────────────────────────────────────────────────┐
│ L1 — PERSISTENCE CONTEXT CACHE                                        │
│  Scope: one EntityManager = one transaction                          │
│  Always on. Cannot be disabled.                                      │
│  Guarantees: repeated find(Order, 1L) in one tx returns the SAME     │
│  object (==). This is JPA's identity guarantee.                      │
│  ⚠ Batch danger: 100k entities in one tx = 100k entities + 100k      │
│    snapshots in the context → OutOfMemoryError.                      │
│    Mitigation: em.flush(); em.clear(); every 500 rows.               │
│  ⚠ Only find()/getReference() hit it. A JPQL query ALWAYS goes to the│
│    DB (but the returned rows are then reconciled against L1).        │
└──────────────────────────┬───────────────────────────────────────────┘
                           ↓ miss
┌──────────────────────────────────────────────────────────────────────┐
│ L2 — SESSION FACTORY CACHE (optional: Ehcache, Hazelcast, Infinispan)│
│  Scope: the whole application, shared across transactions/threads    │
│  @Cacheable + @Cache(usage = READ_WRITE|NONSTRICT_READ_WRITE|READ_ONLY)│
│  ⚠ Invalidation only happens for writes THROUGH Hibernate. A batch   │
│    UPDATE, a native query, a DBA fixing data, or a second instance of│
│    your own app → stale reads forever.                               │
│  ⚠ In a multi-node deployment you need a distributed cache or you    │
│    get node-local staleness. This is where most L2 projects die.     │
└──────────────────────────┬───────────────────────────────────────────┘
                           ↓ miss
                        DATABASE
```

**Opinion:** in 10 years I have deployed Hibernate L2 cache in production twice and regretted it
once. For read-heavy reference data, an explicit Spring `@Cacheable` on a service method backed by
Caffeine or Redis is easier to reason about, easier to invalidate, and easier to observe. L2 is a
cache you cannot see. Use the query cache even more sparingly — it caches *identifiers*, so a hit
still fires N entity loads unless those are in L2 as well.

### Pagination with joins — the pitfall

```java
@Query("select o from Order o left join fetch o.lines")
Page<Order> findAllWithLines(Pageable pageable);      // looks fine. It is not.
```
```
WARN o.h.h.internal.ast.QueryTranslatorImpl :
  HHH000104: firstResult/maxResults specified with collection fetch; applying in memory!
  (Hibernate 6 code: HHH90003004)
```

Hibernate cannot apply `LIMIT`/`OFFSET` to a join-fetched collection, because one root entity spans
multiple SQL rows and `LIMIT 20` would truncate mid-collection. So it **fetches the entire table**
and paginates the list in Java. On a 2M-row table this is an instant `OutOfMemoryError`, or a
90-second query that takes down the pod. In Hibernate 6 it is still a warning, not an error.

The correct pattern is the **two-query approach**:

```java
// Query 1: page the IDs only — LIMIT/OFFSET work correctly, no joins
@Query("select o.id from Order o where o.status = :status order by o.createdAt desc")
Page<Long> findIdPage(@Param("status") OrderStatus status, Pageable pageable);

// Query 2: fetch the full graph for exactly those IDs — no LIMIT needed
@Query("select distinct o from Order o left join fetch o.lines where o.id in :ids")
List<Order> findWithLines(@Param("ids") List<Long> ids);
```

Or just use `@EntityGraph` on a `Page` method — Spring Data + Hibernate 6 handle `@ManyToOne`
fetches with pagination fine (single-valued associations don't multiply rows); it is only
*collection* fetches that break.

Also: `Page<T>` issues a second `count(*)` query. On a large table with a complex `where`, that
count can be slower than the page itself. Use `Slice<T>` (fetches `size + 1` to know if there's a
next page, no count) or keyset/cursor pagination for infinite scroll:

```java
@Query("select o from Order o where o.createdAt < :cursor order by o.createdAt desc limit 50")
List<Order> pageAfter(@Param("cursor") Instant cursor);
// OFFSET 100000 makes the DB scan and discard 100k rows. Keyset pagination is O(log n)
// with the right index, at any depth.
```

---
