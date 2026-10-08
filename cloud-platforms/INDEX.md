# Cloud Platforms Learning Guide
**AWS vs GCP vs Azure** — Comprehensive comparison & deployment guide

---

## 📚 What This Guide Covers

This is your complete reference for understanding and deploying projects on **AWS**, **GCP**, and **Azure**.

- **Fundamentals**: Core concepts, services, terminology
- **Feature Comparison**: Side-by-side matrix of capabilities
- **Use Cases**: When to use each platform
- **Deployment**: How to set up accounts and deploy projects
- **Quick Reference**: Keywords, acronyms, common tasks

---

## 🗂️ Structure

### 1. **Platform Fundamentals**
- [AWS Fundamentals](./AWS.md)
- [GCP Fundamentals](./GCP.md)
- [Azure Fundamentals](./AZURE.md)

### 2. **Comparison Guides**
- [Feature Comparison Matrix](./COMPARISON.md)
- [Pricing Comparison](./PRICING.md)
- [Use Cases & Recommendations](./USE-CASES.md)

### 3. **Deployment & Setup**
- [AWS Deployment Guide](./DEPLOYMENT-AWS.md)
- [GCP Deployment Guide](./DEPLOYMENT-GCP.md)
- [Azure Deployment Guide](./DEPLOYMENT-AZURE.md)

### 4. **Common Project Types**
- [Web Applications](./WEB-APPS.md) — Frontend/Backend deployment
- [APIs & Microservices](./APIS.md) — REST, gRPC, serverless
- [Databases & Storage](./DATABASES.md) — SQL, NoSQL, object storage
- [DevOps & Infrastructure](./DEVOPS.md) — Containers, K8s, CI/CD

### 5. **Quick Reference**
- [Terminology & Acronyms](./TERMINOLOGY.md)
- [Service Mapping](./SERVICE-MAPPING.md) — AWS → GCP → Azure equivalents
- [Common Commands](./COMMANDS.md)

---

## 🚀 Quick Start

### For Someone New to Cloud
1. Start with [Fundamentals](#1-platform-fundamentals) for each platform
2. Read [Feature Comparison](./COMPARISON.md) to understand what each does
3. Pick a platform based on your project type in [Use Cases](./USE-CASES.md)
4. Follow the [Deployment Guide](#3-deployment--setup) for that platform

### For Someone Choosing a Platform
1. Read [Use Cases & Recommendations](./USE-CASES.md)
2. Check [Pricing Comparison](./PRICING.md)
3. Review [Service Mapping](./SERVICE-MAPPING.md) for your tech stack
4. Start with their deployment guide

### For Someone with a Specific Project Type
1. Go to [Common Project Types](#4-common-project-types)
2. Follow the deployment patterns for each platform
3. Reference [Service Mapping](./SERVICE-MAPPING.md) for tool equivalents

---

## 📊 Platform at a Glance

| **Aspect** | **AWS** | **GCP** | **Azure** |
|-----------|--------|--------|----------|
| **Market Share** | ~32% | ~11% | ~23% |
| **Ease of Use** | Moderate | High | Moderate |
| **Best For** | Enterprise, scale | Data/ML, startups | Microsoft stack |
| **Compute** | EC2 | Compute Engine | Virtual Machines |
| **Databases** | RDS, DynamoDB | Cloud SQL, Datastore | SQL Database, Cosmos |
| **Storage** | S3 | Cloud Storage | Blob Storage |
| **Serverless** | Lambda | Cloud Functions | Azure Functions |

*Full comparison: See [Feature Comparison Matrix](./COMPARISON.md)*

---

## 🎯 Learning Path

```
Week 1: Fundamentals
├─ AWS 101 (core services)
├─ GCP 101 (core services)
└─ Azure 101 (core services)

Week 2: Comparison & Use Cases
├─ Feature matrices
├─ Pricing models
└─ When to use what

Week 3: Hands-on Deployment
├─ Deploy a web app on each
├─ Deploy a database
└─ Set up CI/CD pipeline

Week 4: Advanced Topics
├─ Multi-cloud strategies
├─ Cost optimization
└─ Security & compliance
```

---

## 💡 Key Concepts (Preview)

### Compute
- **AWS**: EC2 (VMs), Lambda (serverless), ECS (containers)
- **GCP**: Compute Engine (VMs), Cloud Functions (serverless), Cloud Run (containers)
- **Azure**: Virtual Machines (VMs), Azure Functions (serverless), Container Instances

### Storage
- **AWS**: S3 (object), EBS (block), EFS (file)
- **GCP**: Cloud Storage (object), Persistent Disks (block), Filestore (file)
- **Azure**: Blob Storage (object), Managed Disks (block), Files (file)

### Databases
- **AWS**: RDS (SQL), DynamoDB (NoSQL), Aurora (managed SQL)
- **GCP**: Cloud SQL (SQL), Firestore (NoSQL), Spanner (distributed SQL)
- **Azure**: SQL Database (SQL), Cosmos DB (NoSQL), Database for MySQL/PostgreSQL

### Serverless
- **AWS**: Lambda (compute) + API Gateway (API) + DynamoDB (data)
- **GCP**: Cloud Functions (compute) + Cloud Endpoints (API) + Firestore (data)
- **Azure**: Azure Functions (compute) + API Management (API) + Cosmos DB (data)

---

## 🔍 How to Use This Guide

1. **Read sequentially** for comprehensive understanding
2. **Jump to sections** for quick answers
3. **Use comparisons** to make platform decisions
4. **Follow deployment guides** for hands-on practice
5. **Reference the quick guide** while working

---

## 📝 Topics Covered in Each Platform Guide

### AWS.md / GCP.md / AZURE.md
- **What is it?** — High-level overview
- **Core Services** — Compute, storage, databases, networking
- **Pricing Model** — How costs are calculated
- **Strengths** — When to choose this platform
- **Weaknesses** — Limitations & challenges
- **Getting Started** — First steps & account setup
- **Learning Resources** — Docs, courses, certifications

### COMPARISON.md
- Feature-by-feature comparison
- Pricing tiers & calculator
- Performance benchmarks
- Market position & trends

### DEPLOYMENT-AWS.md / DEPLOYMENT-GCP.md / DEPLOYMENT-AZURE.md
- Account setup & configuration
- Setting up IAM & security
- Deploying your first app
- Managing costs
- Troubleshooting common issues

### COMMON PROJECT TYPES (WEB-APPS.md, APIS.md, etc.)
- Architecture diagrams
- Step-by-step setup
- Code examples
- Cost estimates
- Performance tuning

---

## ❓ FAQ

**Q: Which platform should I learn first?**  
A: Start with AWS (market leader), then learn GCP or Azure based on your goals.

**Q: Do I need to learn all three?**  
A: For most projects, one is enough. Learn all three if you want flexibility or multi-cloud strategy.

**Q: What's the cost difference?**  
A: See [Pricing Comparison](./PRICING.md) — they're surprisingly similar for common workloads.

**Q: Can I migrate between platforms?**  
A: Yes, but it takes planning. See [Service Mapping](./SERVICE-MAPPING.md) for equivalent services.

---

## 🎓 By the End of This Guide

You'll know:
- ✅ Core services & terminology for all 3 platforms
- ✅ Strengths/weaknesses of each platform
- ✅ Which platform to choose for your project
- ✅ How to set up accounts & deploy projects
- ✅ Cost estimation & optimization
- ✅ How to migrate between platforms
- ✅ Industry best practices

---

## 📌 Notes & Updates

- **Last updated**: October 8, 2026
- **Scope**: AWS, GCP, Azure (current/legacy services)
- **Audience**: Developers new to cloud & those choosing platforms
- **Format**: Learning guide (not official docs)

*For the latest official information, check AWS, GCP, and Azure documentation.*

---

**Ready to dive in?** Start with [AWS Fundamentals](./AWS.md) or jump to [Feature Comparison](./COMPARISON.md).
