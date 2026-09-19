# Today's Study Guide - All 8 Topics Overview

**Date**: May 13, 2026
**Study Time**: 2 hours (120 minutes)
**Format**: 15 minutes per topic
**Goal**: Get foundational understanding of each area

---

## Study Schedule (15 min each × 8 topics)

1. **System Design** (15 min) - 0:00-0:15
2. **DSA** (15 min) - 0:15-0:30
3. **Java Spring Boot** (15 min) - 0:30-0:45
4. **Node.js** (15 min) - 0:45-1:00
5. **React.js** (15 min) - 1:00-1:15
6. **Docker** (15 min) - 1:15-1:30
7. **Kubernetes** (15 min) - 1:30-1:45
8. **Google Cloud (GCP)** (15 min) - 1:45-2:00

---

## Topic 1: System Design (15 min)

### Core Concept: Scalability Patterns

**Study These:**

**1. Vertical vs Horizontal Scaling**
- **Vertical**: Add more power to existing machine (bigger CPU, RAM)
  - Pros: Simple, no code changes
  - Cons: Hardware limits, single point of failure
- **Horizontal**: Add more machines
  - Pros: No limit, fault tolerant
  - Cons: Complex, need load balancing

**2. Load Balancing**
- Distributes requests across servers
- Algorithms: Round Robin, Least Connections, IP Hash
- Layer 4 (IP/port) vs Layer 7 (HTTP/URL)

**3. Caching**
- Store frequently accessed data in memory (Redis)
- When to cache:
  - ✅ Read frequently
  - ✅ Expensive to compute
  - ✅ Doesn't change often
- Cache-Aside pattern: Check cache → if miss → get from DB → update cache

**Quick Example:**
```
User requests Instagram feed:
1. Check Redis cache
2. If found: return (fast - 1ms)
3. If not found: query database (slow - 100ms)
4. Store in Redis for next time
5. Return to user
```

**Key Numbers to Remember:**
- 1 day = 86,400 seconds
- QPS = Total requests per day / 86,400
- 1 PB = 1,000 TB

---

## Topic 2: DSA - Two Pointer Technique (15 min)

### Core Concept: Two Pointer Pattern

**What is it?**
- Use two pointers moving through data structure
- Reduces O(n²) to O(n) in many cases

**Pattern 1: Opposite Direction (Array)**
```
Two pointers start at beginning and end, move towards each other

Example: Two Sum (sorted array)
[1, 2, 3, 4, 6], target = 6

left=0, right=4: 1 + 6 = 7 (too big, move right left)
left=0, right=3: 1 + 4 = 5 (too small, move left right)
left=1, right=3: 2 + 4 = 6 (FOUND!)
```

**Pattern 2: Fast & Slow (Linked List)**
```
Two pointers move at different speeds

Example: Find middle of linked list
Slow moves 1 step, Fast moves 2 steps
When fast reaches end, slow is at middle

[1] → [2] → [3] → [4] → [5]
 S
 F

[1] → [2] → [3] → [4] → [5]
       S
             F

[1] → [2] → [3] → [4] → [5]
             S (middle!)
                         F (end)
```

**Pattern 3: Same Direction (Sliding Window)**
```
Both pointers move forward, maintain a window

Example: Longest substring without repeating chars
"abcabcbb"

Window expands right, shrinks from left when duplicate found
```

**Problems to Know:**
- Two Sum (sorted array)
- Remove duplicates from sorted array
- Container with most water
- Find middle of linked list
- Detect cycle in linked list

---

## Topic 3: Java Spring Boot (15 min)

### Core Concepts

**1. What is Spring Boot?**
- Framework for building Java applications
- Auto-configuration (minimal setup)
- Embedded server (Tomcat)
- Production-ready features

**2. Essential Annotations**

**Application:**
```java
@SpringBootApplication  // Main class
```

**Layers:**
```java
@RestController  // REST API endpoints
@Service         // Business logic
@Repository      // Database access
@Component       // Generic bean
```

**Dependency Injection:**
```java
@Autowired  // Inject dependencies

// BEST PRACTICE: Constructor injection
@RestController
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }
}
```

**REST API:**
```java
@GetMapping("/users")           // HTTP GET
@PostMapping("/users")          // HTTP POST
@PutMapping("/users/{id}")      // HTTP PUT
@DeleteMapping("/users/{id}")   // HTTP DELETE

@PathVariable Long id           // Get from URL
@RequestParam String name       // Get from query string
@RequestBody User user          // Get from request body
```

**3. Simple REST API Example**
```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public List<User> getAllUsers() {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.save(user);
    }
}
```

---

## Topic 4: Node.js (15 min)

### Core Concepts

**1. What is Node.js?**
- JavaScript runtime (runs JS outside browser)
- Built on Chrome V8 engine
- Event-driven, non-blocking I/O
- Single-threaded but highly concurrent

**2. Event Loop (Most Important!)**
```
How Node.js handles async operations:

1. Execute synchronous code
2. Process timers (setTimeout, setInterval)
3. Process I/O callbacks
4. Process setImmediate
5. Close callbacks
6. Repeat!

Example:
console.log('1');                    // Sync - runs first
setTimeout(() => console.log('2'), 0); // Async - queued
console.log('3');                    // Sync - runs second

Output: 1, 3, 2
```

**3. Async Programming**

**Callbacks (old way):**
```javascript
fs.readFile('file.txt', (err, data) => {
    if (err) throw err;
    console.log(data);
});
```

**Promises (better):**
```javascript
fetch('https://api.com/data')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(err => console.error(err));
```

**Async/Await (best):**
```javascript
async function getData() {
    try {
        const response = await fetch('https://api.com/data');
        const data = await response.json();
        console.log(data);
    } catch (err) {
        console.error(err);
    }
}
```

**4. Simple Express Server**
```javascript
const express = require('express');
const app = express();

app.use(express.json()); // Parse JSON body

// Routes
app.get('/users', (req, res) => {
    res.json([{ id: 1, name: 'John' }]);
});

app.post('/users', (req, res) => {
    const user = req.body;
    res.status(201).json(user);
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

---

## Topic 5: React.js (15 min)

### Core Concepts

**1. What is React?**
- JavaScript library for building UIs
- Component-based architecture
- Virtual DOM for performance
- Declarative (describe what UI should look like)

**2. Components**

**Functional Component (modern way):**
```javascript
function Welcome(props) {
    return <h1>Hello, {props.name}</h1>;
}

// Usage
<Welcome name="Sasi" />
```

**3. Essential Hooks**

**useState - Manage state:**
```javascript
import { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                Increment
            </button>
        </div>
    );
}
```

**useEffect - Side effects (API calls, subscriptions):**
```javascript
import { useEffect, useState } from 'react';

function UserList() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // Runs after component mounts
        fetch('/api/users')
            .then(res => res.json())
            .then(data => setUsers(data));
    }, []); // Empty array = run once on mount

    return (
        <ul>
            {users.map(user => (
                <li key={user.id}>{user.name}</li>
            ))}
        </ul>
    );
}
```

**4. Props vs State**
- **Props**: Data passed from parent (read-only)
- **State**: Data managed within component (mutable)

**5. Complete Example**
```javascript
function TodoApp() {
    const [todos, setTodos] = useState([]);
    const [input, setInput] = useState('');

    const addTodo = () => {
        setTodos([...todos, { id: Date.now(), text: input }]);
        setInput('');
    };

    return (
        <div>
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={addTodo}>Add</button>
            <ul>
                {todos.map(todo => (
                    <li key={todo.id}>{todo.text}</li>
                ))}
            </ul>
        </div>
    );
}
```

---

## Topic 6: Docker (15 min)

### Core Concepts

**1. What is Docker?**
- Containerization platform
- Package app + dependencies together
- Run anywhere consistently
- Lightweight (vs VMs)

**2. Key Components**

**Image**
- Template/blueprint for container
- Read-only
- Built from Dockerfile

**Container**
- Running instance of image
- Isolated environment
- Like a lightweight VM

**Dockerfile**
- Instructions to build image

**3. Basic Dockerfile Example**
```dockerfile
# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Run command
CMD ["npm", "start"]
```

**4. Essential Commands**
```bash
# Build image
docker build -t my-app .

# Run container
docker run -p 3000:3000 my-app

# List running containers
docker ps

# Stop container
docker stop <container-id>

# Remove container
docker rm <container-id>

# List images
docker images

# Remove image
docker rmi <image-id>

# View logs
docker logs <container-id>

# Execute command in container
docker exec -it <container-id> bash
```

**5. Docker Compose (multi-container)**
```yaml
version: '3'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
  db:
    image: postgres:14
    environment:
      - POSTGRES_PASSWORD=secret
```

**Run with:**
```bash
docker-compose up
```

---

## Topic 7: Kubernetes (15 min)

### Core Concepts

**1. What is Kubernetes (K8s)?**
- Container orchestration platform
- Manages Docker containers at scale
- Auto-scaling, self-healing, load balancing
- Developed by Google

**2. Key Components**

**Pod**
- Smallest deployable unit
- One or more containers
- Share network and storage

**Deployment**
- Manages replica pods
- Declares desired state
- K8s maintains that state

**Service**
- Stable endpoint for pods
- Load balances traffic
- Types: ClusterIP, NodePort, LoadBalancer

**Node**
- Worker machine (VM or physical)
- Runs pods

**Cluster**
- Set of nodes
- Master node(s) + Worker nodes

**3. Architecture**
```
┌─────────────────────────────────┐
│      Master Node                │
│  - API Server                   │
│  - Scheduler                    │
│  - Controller Manager           │
│  - etcd (cluster data)          │
└─────────────────────────────────┘
         │
    ┌────┴────┬────────────┐
    │         │            │
┌───▼───┐ ┌──▼────┐ ┌─────▼──┐
│Worker │ │Worker │ │Worker  │
│Node 1 │ │Node 2 │ │Node 3  │
│       │ │       │ │        │
│[Pod]  │ │[Pod]  │ │[Pod]   │
│[Pod]  │ │[Pod]  │ │[Pod]   │
└───────┘ └───────┘ └────────┘
```

**4. Simple Deployment YAML**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3  # Run 3 copies
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: my-app:latest
        ports:
        - containerPort: 3000
```

**5. Basic Commands**
```bash
# Get cluster info
kubectl cluster-info

# Get pods
kubectl get pods

# Get deployments
kubectl get deployments

# Get services
kubectl get services

# Apply configuration
kubectl apply -f deployment.yaml

# Scale deployment
kubectl scale deployment my-app --replicas=5

# Delete pod
kubectl delete pod <pod-name>

# View logs
kubectl logs <pod-name>

# Execute command in pod
kubectl exec -it <pod-name> -- bash
```

**6. Why Kubernetes?**
- Auto-scaling (handle traffic spikes)
- Self-healing (restart failed containers)
- Load balancing
- Rolling updates (zero downtime)
- Service discovery

---

## Topic 8: Google Cloud Platform (GCP) (15 min)

### Core Services

**1. Compute Services**

**Compute Engine**
- Virtual machines (like EC2)
- Full control over VM
- Choose CPU, RAM, disk

**App Engine**
- Platform-as-a-Service (PaaS)
- Deploy code, Google manages infrastructure
- Auto-scaling

**Cloud Run**
- Serverless containers
- Deploy Docker containers
- Pay per request

**Google Kubernetes Engine (GKE)**
- Managed Kubernetes
- Auto-upgrades, auto-repair

**2. Storage Services**

**Cloud Storage**
- Object storage (like S3)
- Store files, images, videos
- Buckets with objects

**Cloud SQL**
- Managed relational databases
- MySQL, PostgreSQL, SQL Server

**Cloud Firestore**
- NoSQL document database
- Real-time sync

**Cloud Spanner**
- Globally distributed SQL database
- Strong consistency

**3. Networking**

**Cloud Load Balancing**
- Global load balancer
- HTTP(S), TCP, UDP

**Cloud CDN**
- Content delivery network
- Cache static content globally

**VPC (Virtual Private Cloud)**
- Isolated network
- Control IP ranges, subnets

**4. Common Services Comparison**

| Service | AWS Equivalent | Use Case |
|---------|---------------|----------|
| Compute Engine | EC2 | VMs |
| Cloud Storage | S3 | Object storage |
| Cloud SQL | RDS | Managed DB |
| GKE | EKS | Kubernetes |
| Cloud Run | Fargate | Serverless containers |
| BigQuery | Athena | Data warehouse |
| Pub/Sub | SNS/SQS | Messaging |

**5. Basic GCP Commands (gcloud CLI)**
```bash
# Authenticate
gcloud auth login

# Set project
gcloud config set project my-project

# Create VM
gcloud compute instances create my-vm \
  --machine-type=e2-medium \
  --zone=us-central1-a

# List VMs
gcloud compute instances list

# Create storage bucket
gsutil mb gs://my-bucket

# Upload file
gsutil cp file.txt gs://my-bucket/

# Deploy to App Engine
gcloud app deploy

# View logs
gcloud logging read
```

**6. When to Use What?**
- **Compute Engine**: Need full control, specific OS
- **App Engine**: Simple web apps, don't want to manage servers
- **Cloud Run**: Have Docker container, want serverless
- **GKE**: Need Kubernetes, microservices

---

## Study Checklist

### System Design:
- [ ] Understand horizontal vs vertical scaling
- [ ] Know load balancing basics
- [ ] Understand when to cache

### DSA:
- [ ] Understand two pointer technique
- [ ] Know 3 patterns: opposite, fast/slow, sliding window

### Java Spring Boot:
- [ ] Know key annotations (@RestController, @Service, @Autowired)
- [ ] Understand dependency injection
- [ ] Can write simple REST API

### Node.js:
- [ ] Understand event loop
- [ ] Know async/await
- [ ] Can write Express server

### React:
- [ ] Understand components
- [ ] Know useState and useEffect
- [ ] Understand props vs state

### Docker:
- [ ] Know image vs container
- [ ] Can write basic Dockerfile
- [ ] Know essential commands

### Kubernetes:
- [ ] Know pod, deployment, service
- [ ] Understand K8s architecture
- [ ] Know why use Kubernetes

### GCP:
- [ ] Know main compute services
- [ ] Know main storage services
- [ ] Can compare to AWS

---

## After Studying (2 hours)

Come back and say: **"ready for all topics test"**

I'll ask 1-2 quick questions per topic to verify understanding.

---

## Quick Reference Card (Print/Save This!)

```
System Design: Scale → Load Balance → Cache
DSA: Two pointers = O(n) instead of O(n²)
Spring Boot: @RestController + @Autowired + @GetMapping
Node.js: Event loop + async/await
React: Components + useState + useEffect
Docker: Dockerfile → Image → Container
Kubernetes: Pod < Deployment < Service
GCP: Compute Engine (VM) | Cloud Run (Container) | GKE (K8s)
```

---

**Good luck! Study hard! 🚀📚**

**Total Time: 2 hours (15 min × 8 topics)**
