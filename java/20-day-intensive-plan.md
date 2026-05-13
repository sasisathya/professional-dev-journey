# 20-Day Intensive Learning Plan 🚀

**Duration**: 20 days (3 weeks)
**Daily Time**: 2 hours/day (weekdays)
**Weekend**: 4-6 hours (practice & revision)
**Start Date**: May 13, 2026

---

## Tech Stack Coverage
- **Frontend**: JavaScript, React.js
- **Backend**: Node.js, Java Spring Boot
- **System Design**: Scalability, databases, distributed systems
- **DSA**: Data Structures & Algorithms
- **DevOps**: Docker, CI/CD, Cloud basics

---

## Daily Schedule (2 Hours)

### Weekday Structure:
- **Hour 1 (60 min)**: Primary topic deep dive with me (interactive)
- **Hour 2 (60 min)**: Split into:
  - 30 min: Secondary topic/practice
  - 30 min: DSA problem solving (1-2 problems)

### Weekend Structure:
- **Saturday**: Revision + hands-on implementation (4-6 hours)
- **Sunday**: Build mini-project using week's concepts (4-6 hours)

---

## Week 1 (Days 1-7): Foundations + Backend Focus

### Day 1 (Monday) - System Design Fundamentals
**Hour 1**: Requirements, Capacity Estimation, Load Balancing
- ✅ COMPLETED: Requirements gathering
- ✅ COMPLETED: Capacity estimation (Instagram example)
- 🔄 IN PROGRESS: Load balancing & caching strategies

**Hour 2**:
- 30 min: Java basics revision (OOP principles)
- 30 min: DSA - Arrays & HashMaps (2 easy problems)

---

### Day 2 (Tuesday) - Caching Deep Dive + Java Spring Boot Intro
**Hour 1**: System Design - Caching Strategies
- Cache patterns (Cache-aside, Write-through, Write-behind)
- Redis fundamentals
- When to cache what (practical decisions)

**Hour 2**:
- 30 min: Spring Boot basics - Dependency Injection, Annotations
- 30 min: DSA - Linked Lists (2 problems)

---

### Day 3 (Wednesday) - Database Design + Spring Boot Data
**Hour 1**: System Design - SQL vs NoSQL
- When to use what database
- Indexing strategies
- Sharding and replication

**Hour 2**:
- 30 min: Spring Boot JPA - Entities, Repositories
- 30 min: DSA - Stacks & Queues (2 problems)

---

### Day 4 (Thursday) - Microservices + Spring Boot REST APIs
**Hour 1**: System Design - Microservices Architecture
- Service decomposition
- API Gateway pattern
- Service communication (REST, gRPC, message queues)

**Hour 2**:
- 30 min: Spring Boot REST Controllers - @RestController, @RequestMapping
- 30 min: DSA - Trees (Binary Tree basics, 2 problems)

---

### Day 5 (Friday) - Message Queues + Kafka
**Hour 1**: System Design - Asynchronous Communication
- Message queues vs event streaming
- Kafka architecture
- Use cases and patterns

**Hour 2**:
- 30 min: Spring Boot Kafka integration
- 30 min: DSA - Tree Traversals (2 problems)

---

### Day 6 (Saturday) - PRACTICE DAY 1 🛠️
**Morning (2-3 hours)**:
- Revise all system design concepts from Week 1
- Create summary notes/diagrams
- Quiz yourself on key concepts

**Afternoon (2-3 hours)**:
- Build: Simple Spring Boot REST API with:
  - CRUD operations
  - Redis caching
  - Database (PostgreSQL/MySQL)
  - Basic error handling

---

### Day 7 (Sunday) - PROJECT DAY 1 🏗️
**Goal**: Build "URL Shortener" backend
- Spring Boot REST API
- Redis for caching shortened URLs
- Database for URL mapping
- Basic analytics (click count)
- Deploy locally with Docker

**Deliverable**: Working API with endpoints:
- POST /shorten
- GET /{shortUrl}
- GET /stats/{shortUrl}

---

## Week 2 (Days 8-14): Frontend + Full Stack Integration

### Day 8 (Monday) - Distributed Systems + Node.js Basics
**Hour 1**: System Design - CAP Theorem & Consistency
- CAP theorem explained
- Eventual consistency vs strong consistency
- Consensus algorithms (Raft basics)

**Hour 2**:
- 30 min: Node.js fundamentals - Event loop, async/await
- 30 min: DSA - Graphs introduction (2 problems)

---

### Day 9 (Tuesday) - React Fundamentals + System Design (Scalability)
**Hour 1**: System Design - Horizontal Scaling Patterns
- Load balancing deep dive
- Database sharding strategies
- CDN and edge computing

**Hour 2**:
- 30 min: React basics - Components, Props, State, Hooks
- 30 min: DSA - Graph traversal (BFS/DFS, 1-2 problems)

---

### Day 10 (Wednesday) - React Advanced + API Design
**Hour 1**: System Design - API Design Best Practices
- REST API design principles
- GraphQL vs REST
- Versioning and pagination
- Rate limiting

**Hour 2**:
- 30 min: React - useEffect, Context API, custom hooks
- 30 min: DSA - Dynamic Programming intro (Fibonacci, climbing stairs)

---

### Day 11 (Thursday) - DevOps Basics + Docker
**Hour 1**: DevOps - Containerization with Docker
- Docker fundamentals (images, containers, volumes)
- Dockerfile best practices
- Docker Compose for multi-container apps

**Hour 2**:
- 30 min: React - State management (useState, useReducer)
- 30 min: DSA - DP problems (2 easy/medium)

---

### Day 12 (Friday) - CI/CD + GitHub Actions
**Hour 1**: DevOps - CI/CD Pipelines
- GitHub Actions basics
- Automated testing
- Deployment strategies (blue-green, canary)

**Hour 2**:
- 30 min: Node.js + Express - REST API basics
- 30 min: DSA - Sliding window technique (2 problems)

---

### Day 13 (Saturday) - PRACTICE DAY 2 🛠️
**Morning (2-3 hours)**:
- Revise Week 2 concepts
- Create mind maps for distributed systems
- Practice React hooks exercises

**Afternoon (2-3 hours)**:
- Build: React app that connects to your URL Shortener API
- Features:
  - Form to shorten URLs
  - Display shortened URL
  - Show analytics
  - Dockerize both frontend and backend

---

### Day 14 (Sunday) - PROJECT DAY 2 🏗️
**Goal**: Build "Twitter-like Feed" (simplified)
- Backend: Node.js + Express
- Frontend: React
- Features:
  - Post tweets
  - View feed
  - Like tweets
  - Basic user authentication (JWT)
- Docker Compose setup
- Basic CI/CD with GitHub Actions

---

## Week 3 (Days 15-20): Advanced Topics + Interview Prep

### Day 15 (Monday) - System Design Interview Practice
**Hour 1**: Design Instagram Feed System
- Complete end-to-end design
- API design
- Database schema
- Caching strategy
- Scaling approach

**Hour 2**:
- 30 min: Advanced Spring Boot - Security, JWT
- 30 min: DSA - Two pointers technique (2 problems)

---

### Day 16 (Tuesday) - Design Uber/Ride-Sharing
**Hour 1**: System Design - Location-based Services
- Geospatial indexing
- Real-time matching algorithms
- WebSocket for real-time updates

**Hour 2**:
- 30 min: React performance optimization (memo, useMemo, useCallback)
- 30 min: DSA - Binary search variations (2 problems)

---

### Day 17 (Wednesday) - Design Notification System
**Hour 1**: System Design - Push Notifications
- WebSockets vs Server-Sent Events vs Long Polling
- Push notification services (FCM, APNs)
- Rate limiting for notifications

**Hour 2**:
- 30 min: Node.js - WebSockets with Socket.io
- 30 min: DSA - Backtracking basics (2 problems)

---

### Day 18 (Thursday) - Cloud Basics + Kubernetes Intro
**Hour 1**: DevOps - Cloud & Orchestration
- AWS/GCP basics (EC2, S3, RDS)
- Kubernetes fundamentals
- Microservices deployment

**Hour 2**:
- 30 min: Spring Boot + Kubernetes deployment basics
- 30 min: DSA - String manipulation (2 problems)

---

### Day 19 (Friday) - Security Best Practices
**Hour 1**: Security in System Design
- Authentication vs Authorization
- OAuth 2.0, JWT
- API security (rate limiting, input validation)
- Common vulnerabilities (OWASP Top 10)

**Hour 2**:
- 30 min: Implement JWT auth in Spring Boot
- 30 min: DSA - Matrix problems (2 problems)

---

### Day 20 (Saturday) - FINAL ASSESSMENT DAY 📊
**Morning (2-3 hours)**:
- Complete system design mock interview
  - Design "WhatsApp" or "Netflix"
  - Time yourself (45 minutes)
  - Record your approach

**Afternoon (2-3 hours)**:
- Review all notes
- Create final summary document
- Identify weak areas
- Plan next steps

---

## Progress Tracking 📈

### Week 1 Progress: █████░░ 85% (Day 1 complete, Day 2 in progress!)
- ✅ Day 1: System Design Fundamentals (COMPLETE)
  - ✅ Requirements & Capacity Estimation
  - ✅ Load Balancing & Caching basics
  - ✅ Java OOP Revision (4 pillars, abstract vs interface, @Autowired)
  - ✅ DSA Patterns: Complement Pattern, Grouping by Key
- 🔄 Day 2: Caching + Spring Boot (Student studying - 1.5 hours)
  - 📚 Cache patterns (5 types)
  - 📚 Cache eviction policies
  - 📚 Redis fundamentals
  - 📚 Spring Boot annotations & DI
  - 📚 Linked Lists two-pointer technique
- ⬜ Day 3: Databases + JPA
- ⬜ Day 4: Microservices + REST
- ⬜ Day 5: Kafka + Messaging
- ⬜ Day 6: Practice
- ⬜ Day 7: Project 1

### Week 2 Progress: ░░░░░░░ 0%
(To be updated)

### Week 3 Progress: ░░░░░░ 0%
(To be updated)

---

## Daily Checklist Template

### Today's Goals:
- [ ] Hour 1: Primary topic completed
- [ ] Hour 2: Secondary topic completed
- [ ] 2 DSA problems solved
- [ ] Notes documented
- [ ] Concepts reviewed

### Today's Learning (add notes):
```
What I learned:

What I struggled with:

Questions I have:

Tomorrow's prep:
```

---

## Resource Links

### System Design:
- Your guide: `system-design/README.md`
- Practice problems: Will be added as we progress

### Spring Boot:
- Official docs: https://spring.io/guides
- Baeldung tutorials

### React:
- Official docs: https://react.dev
- React hooks guide

### DSA:
- LeetCode: Focus on patterns (two pointers, sliding window, DFS/BFS, DP)
- NeetCode roadmap

### DevOps:
- Docker docs: https://docs.docker.com
- GitHub Actions: https://docs.github.com/actions

---

## Success Metrics

### By End of Week 1:
- ✅ Understand 5 core system design patterns
- ✅ Build working Spring Boot CRUD API
- ✅ Solve 20+ DSA problems
- ✅ Deploy URL Shortener with Docker

### By End of Week 2:
- ✅ Build full-stack app (React + Node.js/Spring Boot)
- ✅ Understand distributed systems basics
- ✅ Set up CI/CD pipeline
- ✅ Solve 40+ DSA problems total

### By End of Week 3:
- ✅ Design 5+ major systems confidently
- ✅ Deploy microservices with Kubernetes basics
- ✅ Solve 60+ DSA problems total
- ✅ Ready for technical interviews

---

## Current Status: Day 1 - 28% Complete 🎯

**What we've covered today:**
- ✅ Requirements gathering (functional vs non-functional)
- ✅ Capacity estimation (Instagram example)
- ✅ Basic load balancing concepts
- 🔄 Caching strategies (in progress)

**Next up:**
- Finish caching deep dive
- Then move to Day 1 Hour 2 tasks

**Time spent today**: ~45 minutes
**Remaining for Day 1**: ~1 hour 15 minutes

---

**Ready to continue learning? Let's finish Day 1! 🚀**
