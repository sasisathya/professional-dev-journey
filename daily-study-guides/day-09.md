# Day 9 - Security & Authentication Deep Dive

**Date:** May 26, 2026
**Focus:** Security hardening, authentication, authorization, testing

## 🔗 Quick Links to Concepts
[Node.js](#nodejs-concepts) | [JavaScript](#javascript-concepts) | [React.js](#reactjs-concepts) | [Java](#java-concepts) | [Spring Boot](#spring-boot-concepts) | [DevOps](#devops-concepts) | [Google Cloud](#google-cloud-concepts) | [System Design](#system-design-concepts) | [DSA](#dsa-concepts)

---

## ⏰ 30-Minute Study Blocks

### 1. Node.js (30 min)
**Topic:** Advanced Security
- OAuth 2.0 implementation
- Passport.js strategies
- Rate limiting with express-rate-limit
- CORS configuration
- Security headers (CSP, HSTS)
- Input sanitization libraries

### 2. JavaScript (30 min)
**Topic:** Testing Advanced Concepts
- Integration testing
- E2E testing with Playwright/Cypress
- Test doubles (mocks, stubs, spies)
- Code coverage analysis
- Snapshot testing
- Testing async code

### 3. React.js (30 min)
**Topic:** Testing React Applications
- React Testing Library
- Testing hooks
- Testing user interactions
- Mocking API calls
- Testing context and state
- Visual regression testing

### 4. Java (30 min)
**Topic:** JUnit & Testing
- JUnit 5 annotations (@Test, @BeforeEach, @AfterEach)
- Assertions and matchers
- Mockito for mocking
- @Mock, @InjectMocks
- Test-driven development (TDD)
- Integration testing with @SpringBootTest

### 5. Spring Boot (30 min)
**Topic:** Spring Security
- Authentication vs Authorization
- SecurityFilterChain
- UserDetailsService
- JWT with Spring Security
- Method-level security (@PreAuthorize, @PostAuthorize)
- OAuth2 Resource Server

### 6. DevOps (30 min)
**Topic:** Security in DevOps (DevSecOps)
- Container security scanning
- Secrets management (Vault, AWS Secrets Manager)
- Static Application Security Testing (SAST)
- Dynamic Application Security Testing (DAST)
- Dependency vulnerability scanning
- Security in CI/CD pipeline

### 7. Google Cloud (30 min)
**Topic:** Security Best Practices in GCP
- Cloud KMS (Key Management Service)
- Secret Manager
- VPC Service Controls
- Binary Authorization
- Cloud Armor (DDoS protection)
- Security Command Center

### 8. System Design (30 min)
**Topic:** Authentication & Authorization Systems
- Session-based vs token-based auth
- JWT structure and validation
- OAuth 2.0 flows (authorization code, client credentials)
- Single Sign-On (SSO)
- SAML vs OAuth vs OpenID Connect
- Multi-factor authentication (MFA)

### 9. DSA (30 min)
**Topic:** Graphs Basics
- Graph representations (adjacency matrix, adjacency list)
- BFS (Breadth-First Search)
- DFS (Depth-First Search)
- Problems: Number of Islands, Clone Graph, Course Schedule

---

## 📖 Concept Definitions (Interview-Ready)

### Node.js Concepts

**OAuth 2.0**
Industry-standard authorization framework allowing third-party applications to access user data without exposing credentials. Uses access tokens with defined scopes, supporting multiple grant types for different scenarios.

**Passport.js**
Authentication middleware for Node.js supporting 500+ strategies (local, OAuth, JWT, etc.). Simplifies authentication implementation with consistent API across different authentication methods.

**express-rate-limit**
Middleware for rate limiting requests in Express applications. Configurable window duration, max requests, and custom handlers. Protects against brute-force attacks and DoS attempts.

**CORS Configuration**
Cross-Origin Resource Sharing controls which domains can access your API. Configure allowed origins, methods, headers, and credentials. Essential for securing browser-based API access.

**Security Headers**
HTTP headers that enhance security: CSP (Content Security Policy) prevents XSS, HSTS (HTTP Strict Transport Security) enforces HTTPS, X-Frame-Options prevents clickjacking.

**Input Sanitization**
Cleaning and validating user input to prevent injection attacks. Libraries like validator.js and express-validator check format, length, and content before processing.

---

### JavaScript Concepts

**Integration Testing**
Testing how multiple units work together. Verifies interactions between modules, APIs, and databases. More comprehensive than unit tests but slower to execute.

**E2E Testing**
End-to-end testing simulates real user scenarios from start to finish. Playwright and Cypress automate browser interactions, testing complete workflows including UI and backend.

**Test Doubles**
Objects that replace real dependencies in tests. Mocks (verify behavior/calls), stubs (return predefined responses), spies (record calls while maintaining real behavior).

**Code Coverage**
Metric showing percentage of code executed during tests. Measures statement, branch, function, and line coverage. Tools like Istanbul/nyc generate coverage reports.

**Snapshot Testing**
Captures component output and compares against stored snapshots. Detects unintended UI changes. Common in React testing; requires updating snapshots when intentional changes occur.

**Testing Async Code**
Handling promises, async/await, callbacks in tests. Use done callbacks, return promises, or async test functions. Ensure assertions run after asynchronous operations complete.

---

### React.js Concepts

**React Testing Library**
Testing library focusing on user behavior rather than implementation. Query by text, role, label (how users interact) instead of component internals. Encourages accessible components.

**Testing Hooks**
Testing custom hooks using `renderHook` from React Testing Library. Provides result object with current hook value and utilities to trigger re-renders and test state changes.

**Testing User Interactions**
Simulating user events like clicks, typing, form submissions using `userEvent` or `fireEvent`. Tests how components respond to real user actions.

**Mocking API Calls**
Replacing real API calls with mock responses in tests. Use libraries like MSW (Mock Service Worker) or jest.mock(). Ensures predictable, fast tests without external dependencies.

**Testing Context and State**
Wrapping components in providers when testing context consumers. Setting up initial state and verifying state changes after interactions or prop updates.

**Visual Regression Testing**
Comparing screenshots of UI components against baselines. Detects visual changes caused by CSS or layout modifications. Tools like Percy or Chromatic automate visual testing.

---

### Java Concepts

**JUnit 5**
Modern testing framework for Java with improved annotations and architecture. Supports parameterized tests, dynamic tests, and extension model for custom behavior.

**JUnit Annotations**
@Test marks test methods, @BeforeEach/@AfterEach run before/after each test, @BeforeAll/@AfterAll run once per class. @DisplayName provides readable test names.

**Assertions**
Methods verifying expected outcomes: assertEquals, assertTrue, assertThrows, assertAll. JUnit 5 assertions provide better error messages and support lambda expressions.

**Mockito**
Java mocking framework for creating test doubles. Mock dependencies, stub method returns, and verify interactions. Reduces need for complex test setup and improves isolation.

**@Mock and @InjectMocks**
@Mock creates mock objects. @InjectMocks creates instance and injects mocks into it. Simplifies dependency injection in tests without manual instantiation.

**Test-Driven Development (TDD)**
Development approach: write failing test first, write minimal code to pass, then refactor. Red-Green-Refactor cycle ensures comprehensive test coverage and better design.

**@SpringBootTest**
Annotation loading full Spring application context for integration tests. Tests beans, dependencies, and configurations together. Slower than unit tests but validates real application behavior.

---

### Spring Boot Concepts

**Authentication vs Authorization**
Authentication verifies who you are (login, credentials). Authorization determines what you can do (permissions, roles). Both are crucial for securing applications.

**SecurityFilterChain**
Spring Security's filter chain processing requests through security filters. Handles authentication, authorization, CSRF protection, headers. Configured using HttpSecurity builder.

**UserDetailsService**
Interface for loading user-specific data during authentication. Implement loadUserByUsername to fetch user from database and return UserDetails with credentials and authorities.

**JWT with Spring Security**
Integrating JSON Web Tokens for stateless authentication. Configure filter to validate JWT, extract claims, and set authentication. Tokens contain user info and are self-contained.

**Method-level Security**
Securing individual methods with annotations. @PreAuthorize checks before execution, @PostAuthorize after. Uses SpEL expressions to enforce role-based or custom security rules.

**OAuth2 Resource Server**
Spring Security configuration for validating OAuth2 access tokens. Verifies JWT signatures, validates claims, and extracts authorities. Secures APIs called by OAuth2 clients.

---

### DevOps Concepts

**DevSecOps**
Integrating security practices into DevOps pipeline from the start. Security testing, scanning, and compliance become part of automated CI/CD process rather than afterthought.

**Container Security Scanning**
Scanning container images for vulnerabilities in base images, dependencies, and configurations. Tools like Trivy, Clair, or Snyk identify security issues before deployment.

**Secrets Management**
Securely storing and accessing sensitive data like API keys, passwords, certificates. HashiCorp Vault and AWS Secrets Manager provide encryption, access control, and audit logging.

**SAST (Static Application Security Testing)**
Analyzing source code for security vulnerabilities without executing it. Detects issues like SQL injection, XSS, insecure configurations early in development.

**DAST (Dynamic Application Security Testing)**
Testing running applications by simulating attacks. Identifies runtime vulnerabilities, configuration issues, and security flaws that only appear during execution.

**Dependency Vulnerability Scanning**
Checking third-party libraries for known vulnerabilities. Tools like Dependabot, Snyk, or OWASP Dependency-Check alert on outdated or vulnerable dependencies.

**Security in CI/CD**
Automated security checks in pipeline: code scanning, secret detection, license compliance, container scanning. Fails build if critical vulnerabilities found, preventing insecure deployments.

---

### Google Cloud Concepts

**Cloud KMS**
Key Management Service for creating and managing cryptographic keys. Handles encryption/decryption of data, supports automatic key rotation, and integrates with GCP services.

**Secret Manager**
Secure storage for API keys, passwords, certificates, and other sensitive data. Provides versioning, access control, and audit logging. Integrates with Cloud Functions, Cloud Run, GKE.

**VPC Service Controls**
Creates security perimeters around GCP resources to prevent data exfiltration. Restricts which services can be accessed from specific networks, adding defense-in-depth.

**Binary Authorization**
Policy-based deployment validation for container images. Ensures only trusted, signed images run in GKE. Verifies attestations proving images passed security checks.

**Cloud Armor**
DDoS protection and WAF (Web Application Firewall) for GCP. Protects applications from layer 3-7 attacks, provides IP allowlisting/denylisting, and custom security rules.

**Security Command Center**
Centralized security and risk management platform for GCP. Provides asset inventory, vulnerability scanning, threat detection, and compliance monitoring across projects.

---

### System Design Concepts

**Session-based Authentication**
Server stores session data, client receives session ID in cookie. Stateful approach requiring server-side storage and session management. Simple but less scalable.

**Token-based Authentication**
Server issues signed tokens (like JWT) to clients. Client includes token in requests. Stateless, scalable, but tokens cannot be revoked easily without additional infrastructure.

**JWT Structure**
Three parts: Header (algorithm, type), Payload (claims/data), Signature (verification). Base64url encoded, dot-separated. Self-contained and verifiable without database lookup.

**OAuth 2.0 Flows**
Authorization Code: For web apps with backend. Client Credentials: Service-to-service. Implicit (deprecated): For SPAs. PKCE: Secure version for mobile/SPAs.

**Single Sign-On (SSO)**
Authentication scheme allowing users to log in once and access multiple applications. Uses protocols like SAML or OAuth/OIDC. Improves UX and centralizes user management.

**SAML vs OAuth vs OpenID Connect**
SAML: XML-based, enterprise SSO, complex. OAuth 2.0: Authorization framework, token-based, simpler. OIDC: Authentication layer on OAuth 2.0, adds identity, modern standard.

**Multi-factor Authentication (MFA)**
Requires multiple verification methods: something you know (password), have (phone/token), or are (biometric). Significantly improves security against credential theft.

---

### DSA Concepts

**Graph Representations**
Adjacency Matrix: 2D array, O(V²) space, O(1) edge lookup. Adjacency List: Array of lists, O(V+E) space, efficient for sparse graphs. Choice depends on density.

**BFS (Breadth-First Search)**
Graph traversal using queue, exploring neighbors level by level. Finds shortest path in unweighted graphs. O(V+E) time, useful for level-order problems.

**DFS (Depth-First Search)**
Graph traversal using stack (or recursion), exploring as deep as possible before backtracking. O(V+E) time, useful for path finding, cycle detection, topological sort.

**Number of Islands**
Count connected components of 1s in 2D grid. Use DFS or BFS to mark visited cells. Each traversal from unvisited 1 indicates a new island.

**Clone Graph**
Deep copy of graph nodes and edges. Use hashmap to track original→clone mapping. DFS or BFS to traverse, creating clones and connecting them.

**Course Schedule**
Detect cycles in directed graph (courses as nodes, prerequisites as edges). Use DFS with states (unvisited, visiting, visited) or topological sort to determine if valid ordering exists.

---

## ✅ Day 9 Completion Checklist
- [ ] Node.js: Implement OAuth 2.0
- [ ] JavaScript: Write E2E tests
- [ ] React: Test components with RTL
- [ ] Java: Write unit tests with JUnit and Mockito
- [ ] Spring Boot: Configure Spring Security
- [ ] DevOps: Scan containers for vulnerabilities
- [ ] GCP: Use Secret Manager
- [ ] System Design: Design auth system
- [ ] DSA: Solve graph traversal problems

---

**Tomorrow:** Day 10 - Performance optimization, Caching, CDN, Week 2 Review
