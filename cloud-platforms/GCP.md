# GCP (Google Cloud Platform) — Complete Guide

**Modern & Developer-Friendly** | **11% market share** | **Data/ML Focus** | **Fast Growing**

---

## 📖 What is GCP?

Google Cloud Platform is Google's cloud infrastructure. It has fewer services than AWS (~100) but focuses on **quality over quantity**. Built on the same infrastructure Google uses for Gmail, YouTube, Search, etc.

Think of it as **the data scientist's cloud**:
- **Compute**: Virtual machines (Compute Engine), serverless functions (Cloud Functions)
- **Storage**: Object storage (Cloud Storage), databases (Cloud SQL, Firestore)
- **Data**: BigQuery (data warehouse), Dataflow (data pipelines), BigTable (NoSQL at scale)
- **AI/ML**: Vertex AI (the best ML platform), AutoML, TensorFlow support
- **Kubernetes**: GKE (managed Kubernetes) — Google invented Kubernetes

---

## 🔧 Core Services (What You'll Use Most)

### Compute
| Service | Use Case | Pricing |
|---------|----------|---------|
| **Compute Engine** | Virtual machines (VMs) | Per hour + networking |
| **Cloud Functions** | Serverless functions (event-driven) | Per execution + GB-second |
| **Cloud Run** | Deploy containers (serverless) | Per vCPU-second + GB-second |
| **GKE** | Managed Kubernetes | Per cluster + per node hour |
| **App Engine** | Auto-scaling web apps | Per instance hour |

**Best for**: Modern, containerized, event-driven architectures

### Storage
| Service | Use Case | Pricing |
|---------|----------|---------|
| **Cloud Storage** | Object storage (like S3) | Per GB stored + per request |
| **Persistent Disk** | Block storage (like EBS) | Per GB-month |
| **Filestore** | Managed NFS (shared file storage) | Per GB-month |
| **Archive Storage** | Long-term backups (very cheap) | Per GB-month (cheapest) |

**Best for**: Modern workloads, global distribution, cost-effective scale

### Databases
| Service | Use Case | Pricing |
|---------|----------|---------|
| **Cloud SQL** | Managed MySQL, PostgreSQL | Per instance hour + storage |
| **Firestore** | NoSQL (real-time, documents) | Per document read/write |
| **Datastore** | Older NoSQL (entity storage) | Per operation |
| **Spanner** | Distributed SQL (global transactions) | Per node hour |
| **BigTable** | NoSQL at massive scale (ads, analytics) | Per node hour |

**Best for**: Real-time apps, startups, data-driven products

### Big Data & Analytics
| Service | Use Case | Pricing |
|---------|----------|---------|
| **BigQuery** | SQL queries on massive datasets | Per GB scanned + storage |
| **Dataflow** | Data pipelines (batch & streaming) | Per vCPU-hour |
| **Dataproc** | Managed Hadoop/Spark | Per node hour |
| **Pub/Sub** | Real-time messaging | Per million messages |

**Best for**: Data science, real-time analytics, ML pipelines

### AI/ML
| Service | Use Case |
|---------|----------|
| **Vertex AI** | End-to-end ML platform (training, deployment) |
| **AutoML** | Train models without coding |
| **Cloud Vision** | Image recognition |
| **Cloud Natural Language** | Text analysis |
| **Cloud Translation** | Translate between languages |

**Best for**: Machine learning, AI applications

---

## 💰 GCP Pricing Model

### How You Pay
1. **Compute**: Per vCPU-second, per GB-second (more granular than AWS)
2. **Storage**: Per GB-month + egress (outbound data)
3. **Network**: Inbound free, outbound charged, same globally (no region upcharges)
4. **API Calls**: Some services charge per request (BigQuery per GB scanned)

### Cost Optimization
- **Committed Use Discounts**: 1-3 year commitment = 25-70% discount
- **Sustained Use Discounts**: Automatic discount if you run instances 24/7
- **Preemptible VMs**: Interruptible (can be killed anytime) = 70% cheaper
- **Free Tier**: Always free (not just 12 months) for qualifying services

### Example Monthly Costs
- **Small app** (1 VM, 100GB storage): ~$20/month
- **Medium app** (2 VMs, Cloud SQL, 1TB storage): ~$150/month
- **Large app** (auto-scaling, BigQuery): $5000+/month

**Advantage**: GCP is usually 10-30% cheaper than AWS for equivalent workloads

---

## ✅ Strengths

1. **Most developer-friendly**: Cleanest UI, best documentation
2. **Best for data & ML**: BigQuery, Vertex AI, TensorFlow support
3. **Cheapest pricing**: Usually 10-30% cheaper than AWS
4. **Automatic discounts**: Sustained use discounts automatic
5. **Better Kubernetes**: Google invented Kubernetes (GKE is best)
6. **Real-time databases**: Firestore, Pub/Sub for modern apps
7. **Excellent for startups**: Free tier is generous & always-on
8. **Global CDN included**: CloudCDN is free with load balancer
9. **Shorter learning curve**: Fewer services, cleaner design
10. **Enterprise support**: Growing enterprise adoption

---

## ❌ Weaknesses

1. **Smaller ecosystem**: 100 services vs AWS's 200+
2. **Fewer certifications**: Less industry recognition than AWS
3. **Smaller market**: 11% vs AWS's 31% (less mature)
4. **Less enterprise tooling**: Fewer third-party integrations
5. **Region availability**: Not in all countries (Russia, China limited)
6. **Less documentation**: Official docs good, but fewer tutorials online
7. **Smaller community**: Fewer Stack Overflow answers, blog posts
8. **Shorter history**: Founded 2008 vs AWS 2006
9. **No standard payment**: No reserved instances like AWS (uses commitments)
10. **Team size concerns**: Smaller team than AWS (acquisitions matter)

---

## 🚀 Getting Started with GCP

### Step 1: Create Account
1. Go to [cloud.google.com](https://cloud.google.com)
2. Click "Get started free"
3. Sign in with Google account
4. Provide billing info (free tier, no charge)
5. Create first project

### Step 2: Create a Project
```
GCP Console → Select a project (top-left)
├─ Create new project
├─ Name it (e.g., "my-first-app")
├─ Click Create
└─ Wait for activation
```

### Step 3: Enable APIs
```
GCP Console → APIs & Services → Library
├─ Search for API you need (Compute, Cloud SQL, BigQuery)
├─ Click on it
└─ Click "Enable"
```

### Step 4: Set Up IAM (Important!)
```
GCP Console → IAM & Admin → Service Accounts
├─ Create service account
├─ Assign roles (Compute Admin, Editor for learning)
├─ Create key (JSON)
└─ Download & save securely
```

### Step 5: Install Google Cloud CLI
```bash
# Install Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# Authenticate
gcloud auth login
# Follow browser prompts

# Set default project
gcloud config set project YOUR_PROJECT_ID

# Test it works
gcloud compute instances list
```

### Step 6: Deploy Your First App
See [DEPLOYMENT-GCP.md](./DEPLOYMENT-GCP.md)

---

## 🎓 Learning Path

### Week 1: Basics
- [ ] Create Compute Engine instance
- [ ] Upload file to Cloud Storage
- [ ] Create Cloud SQL database
- [ ] Use gcloud CLI for basic operations

### Week 2: Applications
- [ ] Deploy app to Cloud Run (containers)
- [ ] Use Firestore for real-time data
- [ ] Create Cloud Function (serverless)
- [ ] Query data with BigQuery

### Week 3: Advanced
- [ ] Set up load balancing
- [ ] Create Kubernetes cluster (GKE)
- [ ] Set up Cloud Build (CI/CD)
- [ ] Train ML model with Vertex AI

### Week 4: Optimization
- [ ] Monitor with Cloud Monitoring
- [ ] Estimate costs, set budgets
- [ ] Set up alerts
- [ ] Plan for disaster recovery

---

## 📚 Key Concepts

### Projects
- Container for all resources
- Resources = VMs, databases, storage, services
- Billing is per project
- Start with 1-2 projects, grow as needed

### Zones & Regions
- **Zone**: Specific data center (us-central1-a, europe-west1-b)
- **Region**: Group of zones in one area (us-central1, europe-west1)
- **Why?** Lower latency, compliance, fault tolerance
- Tip: Pick closest region to your users

### VPC (Virtual Private Cloud)
- Your own network
- Subnets for subdivisions
- Firewall rules control traffic
- Cloud Nat for secure outbound

### IAM Roles
- **Viewer**: Read-only access
- **Editor**: Create/modify/delete
- **Admin**: Full control + permissions
- **Custom**: Create your own roles

### Service Accounts
- Machine users (for apps, not humans)
- Used for: CI/CD, server-to-server auth
- Has keys (JSON file) for authentication
- More secure than storing passwords

---

## 🔐 Security Best Practices

1. **Enable 2-Step Verification** — Protect your Google account
2. **Use Service Accounts** — Never embed credentials in code
3. **Principle of least privilege** — Minimal permissions per user/service
4. **Enable VPC Service Controls** — Create security perimeter
5. **Use Cloud KMS** — Encrypt sensitive data
6. **Enable Cloud Audit Logs** — Track all API calls
7. **Use Cloud Armor** — DDoS protection & WAF
8. **Enable VPC Flow Logs** — Monitor network traffic
9. **Rotate keys regularly** — Change service account keys
10. **Use Secret Manager** — Store passwords, API keys

---

## 📊 GCP Terminology Cheat Sheet

| Term | Means |
|------|-------|
| **Instance** | A running virtual machine |
| **Image** | Template for launching instances (like AMI) |
| **Zone** | Specific data center (us-central1-a) |
| **Region** | Group of zones (us-central1) |
| **VPC** | Virtual private cloud (your network) |
| **Subnet** | Network subdivision |
| **IAM** | Identity & access management |
| **Service Account** | Machine user for apps |
| **Key** | Credential file for service account (JSON) |
| **Bucket** | Container for objects in Cloud Storage |
| **Dataset** | Collection of tables in BigQuery |
| **Table** | Data in BigQuery (similar to database table) |
| **GKE** | Google Kubernetes Engine |
| **Cloud Run** | Serverless container platform |

---

## 🎯 Real-World Example: Deploy a Web App

### Architecture
```
Users → Cloud CDN (Global CDN)
     → Cloud Load Balancing
     → Cloud Run (Containerized app)
     → Cloud SQL (PostgreSQL)
     → Cloud Storage (Static files)
```

### Services Used
- **Cloud Load Balancing**: Distribute traffic
- **Cloud Run**: Deploy container (auto-scaling)
- **Cloud SQL**: PostgreSQL database
- **Cloud Storage**: Store images, backups
- **Cloud Monitoring**: Monitor performance
- **Cloud Build**: CI/CD pipeline

### Estimated Cost (per month)
- Cloud Run (1 vCPU, 256MB, 1M requests): $0
- Cloud SQL (db-f1-micro): $10
- Cloud Storage (100GB): $2
- Data transfer: ~$5
- **Total**: ~$17/month (startup-friendly!)

---

## 🔗 Resources

### Official
- [Google Cloud Documentation](https://cloud.google.com/docs)
- [Google Cloud Free Tier](https://cloud.google.com/free)
- [Google Cloud Pricing Calculator](https://cloud.google.com/products/calculator)

### Learning
- [Google Cloud Skills Boost](https://www.cloudskillsboost.google) — Official courses
- [Cloud Bytes YouTube](https://www.youtube.com/c/GoogleCloudTech) — Official videos
- [Linux Academy](https://linuxacademy.com) — Third-party courses
- [YouTube: GCP in 100 Seconds](https://www.youtube.com/@fireship_dev)

### Certifications
- **Associate Cloud Engineer** — Intermediate (100 hrs)
- **Professional Cloud Architect** — Advanced (150 hrs)
- **Cloud Engineer Certification** — Beginner

---

## 📝 Summary

| Aspect | Rating |
|--------|--------|
| **Ease of Use** | ⭐⭐⭐⭐⭐ (Best UI) |
| **Learning Curve** | ⭐⭐⭐⭐ (Gentle) |
| **Scalability** | ⭐⭐⭐⭐⭐ |
| **Pricing** | ⭐⭐⭐⭐⭐ (Cheapest) |
| **Support** | ⭐⭐⭐⭐ |
| **Market Share** | ⭐⭐⭐ |
| **Documentation** | ⭐⭐⭐⭐ |

**Best For**: Data scientists, startups, modern web apps, ML/AI projects, budget-conscious teams

**Not Best For**: Enterprise lock-in (less mature), Windows-only workloads, extremely large scale (AWS usually cheaper at massive scale)

**Next**: Read [AZURE.md](./AZURE.md) for comparison, or go to [DEPLOYMENT-GCP.md](./DEPLOYMENT-GCP.md) to start hands-on.
