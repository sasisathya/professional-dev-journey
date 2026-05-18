# Day 18 - Serverless & Edge Computing

**Focus:** Serverless architectures, edge computing, modern deployment

---

## 🔗 Quick Links to Concepts
[Node.js](#nodejs-concepts) | [JavaScript](#javascript-concepts) | [React.js](#reactjs-concepts) | [Java](#java-concepts) | [Spring Boot](#spring-boot-concepts) | [DevOps](#devops-concepts) | [Google Cloud](#google-cloud-concepts) | [System Design](#system-design-concepts) | [DSA](#dsa-concepts)

---

## ⏰ 30-Minute Study Blocks

### 1. Node.js (30 min)
**Topic:** Serverless Node.js
- AWS Lambda with Node.js
- Cold starts optimization
- Lambda layers
- Event-driven serverless architecture
- Step Functions for orchestration
- Serverless Framework

### 2. JavaScript (30 min)
**Topic:** Edge Computing & Edge Functions
- Cloudflare Workers
- Edge computing concepts
- Deno for edge runtime
- Edge vs serverless vs traditional
- Global distribution
- Use cases for edge computing

### 3. React.js (30 min)
**Topic:** Edge Rendering & Modern Deployment
- Vercel Edge Functions
- Edge rendering with Next.js
- Incremental Static Regeneration (ISR)
- On-demand ISR
- Edge middleware
- Distributed rendering

### 4. Java (30 min)
**Topic:** Serverless Java
- AWS Lambda with Java
- Cold start optimization (GraalVM native image)
- Micronaut and Quarkus for serverless
- Azure Functions with Java
- Event-driven architecture
- Serverless databases

### 5. Spring Boot (30 min)
**Topic:** Spring Cloud Function
- Function as a Service with Spring
- Cloud-agnostic functions
- AWS Lambda with Spring Cloud Function
- Azure Functions integration
- Function composition
- Reactive functions

### 6. DevOps (30 min)
**Topic:** GitOps Advanced
- ArgoCD deep dive
- Declarative deployments
- Application sets
- Multi-cluster management
- Rollback strategies
- Progressive delivery with Argo Rollouts

### 7. Google Cloud (30 min)
**Topic:** Cloud Run Advanced
- Cloud Run Jobs
- WebSockets on Cloud Run
- gRPC on Cloud Run
- Cloud Run for Anthos
- Min/max instances tuning
- Execution environments (gen1 vs gen2)

### 8. System Design (30 min)
**Topic:** Serverless Architecture Patterns
- Lambda architecture
- Kappa architecture
- Fan-out/fan-in pattern
- Choreography vs orchestration
- Serverless data processing
- Event-driven microservices

### 9. DSA (30 min)
**Topic:** Greedy Algorithms
- Greedy algorithm strategy
- Activity selection problem
- Huffman coding
- Minimum spanning tree (Kruskal's, Prim's)
- Problems: Jump Game, Gas Station, Partition Labels

---

## 📖 Concept Definitions (Interview-Ready)

### Node.js Concepts

**AWS Lambda**
Serverless compute service that runs code in response to events without managing servers. Automatically scales, charges only for compute time used, and supports Node.js natively.

**Cold Starts**
The initialization delay when a Lambda function is invoked after being idle. Includes loading runtime, code, and dependencies. Optimization techniques: smaller packages, provisioned concurrency, or keep-warm strategies.

**Lambda Layers**
Reusable packages of libraries, custom runtimes, or dependencies that can be shared across multiple Lambda functions. Reduces deployment package size and enables code sharing.

**Event-Driven Serverless Architecture**
Design pattern where Lambda functions are triggered by events (S3 uploads, API calls, DynamoDB changes, SNS messages) rather than running continuously.

**AWS Step Functions**
Serverless orchestration service that coordinates multiple Lambda functions and other AWS services into workflows. Provides visual workflows, error handling, and retry logic.

**Serverless Framework**
An open-source tool for building and deploying serverless applications. Provides abstractions over cloud providers (AWS, Azure, GCP), simplifying Lambda deployment and configuration.

---

### JavaScript Concepts

**Cloudflare Workers**
Serverless JavaScript execution environment running on Cloudflare's edge network. Executes close to users worldwide with extremely low latency and uses V8 isolates for security.

**Edge Computing**
Running code at network edge locations (CDN nodes) close to end users rather than centralized data centers. Reduces latency, improves performance, and enables geographic content customization.

**Deno**
A modern JavaScript/TypeScript runtime built on V8, created by Node.js's original author. Features secure-by-default execution, native TypeScript support, and is used for edge runtimes.

**Edge vs Serverless vs Traditional**
Edge: Code runs at CDN nodes worldwide (lowest latency). Serverless: Code runs in regional data centers on-demand. Traditional: Code runs on persistent servers you manage.

**Global Distribution**
Deploying code to multiple geographic locations simultaneously. Edge computing automatically distributes code globally, reducing latency for users regardless of location.

---

### React.js Concepts

**Vercel Edge Functions**
Serverless functions that run on Vercel's edge network globally. Built on V8 isolates, provide fast response times, and integrate seamlessly with Next.js.

**Edge Rendering**
Executing server-side rendering at edge locations rather than origin servers. Next.js supports edge runtime for dynamic pages, reducing time-to-first-byte globally.

**Incremental Static Regeneration (ISR)**
Next.js feature that allows updating static pages after build without rebuilding the entire site. Pages regenerate in background while serving stale content to users.

**On-Demand ISR**
Manually triggering regeneration of specific pages via API instead of time-based revalidation. Useful for content management systems to update pages when content changes.

**Edge Middleware**
Code that runs on edge before requests reach your application. Used for authentication, redirects, header modification, or A/B testing at the edge.

**Distributed Rendering**
Rendering different parts of an application in different locations or environments. Next.js can use edge for some routes, serverless for others, and static for the rest.

---

### Java Concepts

**AWS Lambda with Java**
Running Java applications on Lambda. Requires packaging dependencies as JAR/ZIP, has higher cold start times than Node.js due to JVM initialization.

**GraalVM Native Image**
Compiling Java applications to native binaries that start instantly without JVM. Dramatically reduces Lambda cold starts from seconds to milliseconds for Java.

**Micronaut and Quarkus**
Modern Java frameworks optimized for serverless and microservices. Provide compile-time dependency injection, minimal reflection, and GraalVM native image support for fast startup.

**Azure Functions with Java**
Microsoft's serverless platform supporting Java. Similar to AWS Lambda but integrated with Azure ecosystem, supporting triggers from Azure services.

**Serverless Databases**
Databases that scale automatically and charge per-use, ideal for serverless apps. Examples: DynamoDB, Aurora Serverless, Cosmos DB, Firestore.

---

### Spring Boot Concepts

**Spring Cloud Function**
Abstraction for writing serverless functions with Spring Boot that can deploy to AWS Lambda, Azure Functions, or Google Cloud Functions using the same code.

**Cloud-Agnostic Functions**
Writing function code once and deploying to multiple cloud providers without modification. Spring Cloud Function achieves this through adapters for different platforms.

**Function Composition**
Combining multiple functions into workflows. Spring Cloud Function supports chaining functions together, where output of one becomes input of another.

**Reactive Functions**
Functions using reactive programming (Project Reactor) for non-blocking, asynchronous processing. Improves resource utilization in serverless environments with concurrent requests.

---

### DevOps Concepts

**ArgoCD**
A declarative GitOps continuous delivery tool for Kubernetes. Automatically syncs desired application state from Git repositories to Kubernetes clusters.

**Declarative Deployments**
Defining desired infrastructure/application state in version-controlled files (YAML). System automatically reconciles actual state to match desired state.

**Application Sets**
ArgoCD feature for managing multiple applications using templates. Enables deploying same app to multiple clusters or environments with different configurations.

**Multi-Cluster Management**
Managing deployments across multiple Kubernetes clusters from a single control plane. ArgoCD can sync applications to different clusters based on targeting rules.

**Argo Rollouts**
Progressive delivery controller for Kubernetes providing advanced deployment strategies like canary, blue-green, and analysis-driven rollbacks integrated with service meshes.

---

### Google Cloud Concepts

**Cloud Run Jobs**
Container-based jobs that run to completion on Cloud Run. Unlike services (always-on HTTP endpoints), jobs execute tasks once or on schedule and then terminate.

**WebSockets on Cloud Run**
Cloud Run services can handle WebSocket connections for real-time bidirectional communication. Connections can stay open for hours, with automatic scaling.

**gRPC on Cloud Run**
Cloud Run natively supports gRPC services using HTTP/2. Provides automatic TLS, load balancing, and scaling for high-performance RPC services.

**Cloud Run for Anthos**
Running Cloud Run services on-premises or in other clouds using Anthos (Google's hybrid platform). Provides same developer experience across environments.

**Min/Max Instances**
Configuration to set minimum (prevents cold starts, maintains baseline) and maximum (controls costs, prevents runaway scaling) number of Cloud Run container instances.

**Execution Environments (gen1 vs gen2)**
Gen1: Original Cloud Run runtime. Gen2: Improved runtime with more CPU for startup, faster container startup, support for all VPC features, and better sidecar support.

---

### System Design Concepts

**Lambda Architecture**
Data processing architecture with batch layer (precomputed views), speed layer (real-time processing), and serving layer (queries merged results). Balances latency and throughput.

**Kappa Architecture**
Simplified alternative to Lambda architecture using only a stream processing layer. All data (historical and real-time) flows through same processing pipeline, reducing complexity.

**Fan-Out/Fan-In Pattern**
Fan-out: One event triggers multiple parallel function invocations. Fan-in: Multiple function results are aggregated back into single result. Common in serverless workflows.

**Choreography vs Orchestration**
Choreography: Services react to events independently without central control (event-driven). Orchestration: Central coordinator (like Step Functions) directs service interactions.

**Serverless Data Processing**
Processing data using serverless functions triggered by events (file uploads, database changes). Scales automatically, ideal for ETL, image processing, or log analysis.

**Event-Driven Microservices**
Microservices that communicate primarily through asynchronous events rather than synchronous API calls. Improves decoupling, scalability, and resilience.

---

### DSA Concepts

**Greedy Algorithm**
An approach that makes locally optimal choices at each step hoping to find global optimum. Doesn't always work but efficient when it does. Examples: activity selection, Huffman coding.

**Activity Selection Problem**
Classic greedy problem: select maximum number of non-overlapping activities. Sort by end time, greedily pick activities that don't conflict.

**Huffman Coding**
Greedy algorithm for lossless data compression. Builds optimal prefix-free binary tree based on character frequencies, assigning shorter codes to frequent characters.

**Minimum Spanning Tree**
A tree connecting all vertices in a weighted graph with minimum total edge weight. Kruskal's (sort edges, add if no cycle) and Prim's (grow tree from vertex) are greedy algorithms.

**Kruskal's Algorithm**
MST algorithm that sorts edges by weight and adds them if they don't create cycles. Uses union-find data structure for cycle detection. Time: O(E log E).

**Prim's Algorithm**
MST algorithm that grows tree from starting vertex, always adding minimum-weight edge connecting tree to non-tree vertex. Uses priority queue. Time: O(E log V).

---

## ✅ Day 18 Completion Checklist
- [ ] Node.js: Deploy Lambda function
- [ ] JavaScript: Create Cloudflare Worker
- [ ] React: Use Edge Functions in Next.js
- [ ] Java: Optimize Lambda cold starts
- [ ] Spring Boot: Create Spring Cloud Function
- [ ] DevOps: Set up ArgoCD
- [ ] GCP: Deploy Cloud Run Jobs
- [ ] System Design: Design serverless pipeline
- [ ] DSA: Solve greedy problems

---

**Tomorrow:** Day 19 - Production hardening, Scalability, Interview prep
