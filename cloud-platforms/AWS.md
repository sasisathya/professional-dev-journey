# AWS (Amazon Web Services) — Complete Guide

**Market Leader** | **31% market share** | **Most services** | **Enterprise favorite**

---

## 📖 What is AWS?

Amazon Web Services is the world's largest cloud platform. It provides **200+ services** across computing, storage, databases, networking, analytics, machine learning, security, and more.

Think of it as **renting infrastructure** instead of buying servers:
- **Compute**: Virtual machines (EC2), serverless functions (Lambda)
- **Storage**: Object storage (S3), file storage (EFS), block storage (EBS)
- **Databases**: SQL (RDS), NoSQL (DynamoDB), data warehouses (Redshift)
- **Networking**: Load balancers, VPCs, CDNs, firewalls
- **AI/ML**: SageMaker, Rekognition, Comprehend
- **Analytics**: Kinesis, Athena, QuickSight

---

## 🔧 Core Services (What You'll Use Most)

### Compute
| Service | Use Case | Pricing |
|---------|----------|---------|
| **EC2** | Virtual machines (VMs) | Per hour (on-demand, reserved, spot) |
| **Lambda** | Serverless functions (run code without servers) | Per execution + memory |
| **ECS** | Run Docker containers | Per container hour |
| **EKS** | Managed Kubernetes | Per cluster hour + node cost |
| **Elastic Beanstalk** | Auto-scaling web apps | Per instance hour |
| **AppRunner** | Deploy containerized apps quickly | Per vCPU-hour + GB-hour |

**Best for**: Massive scale, complex architectures, legacy support

### Storage
| Service | Use Case | Pricing |
|---------|----------|---------|
| **S3** | Object storage (files, images, backups) | Per GB stored + per request |
| **EBS** | Block storage (like a hard drive for EC2) | Per GB-month |
| **EFS** | Shared file storage (like NAS) | Per GB stored |
| **Glacier** | Long-term archive (cheap, slow) | Per GB-month (very cheap) |

**Best for**: Any scale, any data type, highly durable (99.999999999%)

### Databases
| Service | Use Case | Pricing |
|---------|----------|---------|
| **RDS** | Managed SQL (MySQL, PostgreSQL, Oracle, SQL Server) | Per instance hour |
| **DynamoDB** | NoSQL (key-value, documents) | Per request or capacity |
| **Aurora** | AWS's fast MySQL/PostgreSQL | Per instance hour + storage |
| **Redshift** | Data warehouse (big analytics) | Per node hour |
| **ElastiCache** | In-memory caching (Redis, Memcached) | Per node hour |

**Best for**: Structured data, complex queries, transactions

### Networking
| Service | Use Case |
|---------|----------|
| **VPC** | Virtual private cloud (your own network) |
| **ALB/NLB** | Load balancers (distribute traffic) |
| **Route 53** | DNS (domain name system) |
| **CloudFront** | CDN (content delivery, edge caching) |
| **API Gateway** | Manage APIs (HTTPS endpoints, rate limiting) |

**Best for**: Complex network architectures, global distribution

### Additional Services
- **CloudWatch**: Monitoring & logging
- **CloudFormation**: Infrastructure as Code (IaC)
- **IAM**: Identity & access control
- **KMS**: Encryption key management
- **Secrets Manager**: Store passwords, API keys

---

## 💰 AWS Pricing Model

### How You Pay
1. **Compute**: Per hour, per GB, per million requests (varies by service)
2. **Storage**: Per GB per month + data transfer out
3. **Data Transfer**: Inbound free, outbound charged (vary by region)
4. **Requests**: Some services charge per API call

### Cost Optimization
- **Reserved Instances**: 1-3 year commitment = 30-70% discount
- **Spot Instances**: Bid for unused capacity = 70-90% cheaper
- **Savings Plans**: Flexible commitments for compute
- **Free Tier**: 12 months free for new accounts (limited services)

### Example Monthly Costs
- **Small app** (1 EC2, 100GB S3): ~$30/month
- **Medium app** (2 EC2, RDS, 1TB S3): ~$300/month
- **Large app** (auto-scaling, multi-region): $5000+/month

---

## ✅ Strengths

1. **Biggest market share**: 31% globally
2. **Most services**: 200+ services (compute, AI, blockchain, quantum)
3. **Best for scale**: Can handle millions of users
4. **Enterprise support**: Great for large organizations
5. **Most mature**: Been around since 2006
6. **Best documentation**: Extensive docs & community
7. **Largest ecosystem**: Most third-party integrations
8. **Regional options**: Available in most countries
9. **Performance**: Fastest compute in many benchmarks
10. **Certifications**: AWS certifications valued in industry

---

## ❌ Weaknesses

1. **Complexity**: 200+ services = overwhelming, steep learning curve
2. **Pricing is complex**: Hard to predict costs (use AWS Calculator)
3. **Least user-friendly console**: UI is powerful but confusing
4. **No free tier forever**: 12 months only
5. **Lock-in**: Proprietary services (Lambda, DynamoDB) are hard to migrate
6. **Regional latency**: Not as globally distributed as some competitors
7. **Cold starts**: Lambda functions have startup delays
8. **Expensive by default**: Can be pricey if you don't optimize

---

## 🚀 Getting Started with AWS

### Step 1: Create Account
1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Click "Create AWS Account"
3. Provide email, password, billing info
4. Verify phone number
5. Choose support plan (free = Basic Support)

### Step 2: Set Up IAM (Important!)
```
AWS Console → IAM → Users
├─ Create IAM user for yourself (NOT root)
├─ Attach policies (e.g., AdministratorAccess for learning)
├─ Create access keys (for CLI/SDK)
└─ Log in with IAM user (never use root)
```

### Step 3: Install AWS CLI
```bash
# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure credentials
aws configure
# Enter: Access Key ID, Secret Access Key, default region (us-east-1)

# Test it works
aws s3 ls
```

### Step 4: Choose a Region
- **us-east-1** (N. Virginia): Default, most services
- **us-west-2** (Oregon): Good for US West Coast
- **eu-west-1** (Ireland): Good for Europe
- **ap-southeast-1** (Singapore): Good for Asia

*Different regions = different costs, latency, service availability*

### Step 5: Deploy Your First App
See [DEPLOYMENT-AWS.md](./DEPLOYMENT-AWS.md)

---

## 🎓 Learning Path

### Week 1: Basics
- [ ] Understand VPC, subnets, security groups
- [ ] Launch an EC2 instance
- [ ] Store a file in S3
- [ ] Use AWS CLI for basic operations

### Week 2: Databases & APIs
- [ ] Create an RDS database (MySQL/PostgreSQL)
- [ ] Use API Gateway to create REST API
- [ ] Store data in DynamoDB
- [ ] Query data with Lambda

### Week 3: Advanced
- [ ] Set up auto-scaling
- [ ] Create CloudFormation templates (IaC)
- [ ] Monitor with CloudWatch
- [ ] Set up CI/CD with CodePipeline

### Week 4: Optimization
- [ ] Estimate costs, optimize spending
- [ ] Set up alarms & monitoring
- [ ] Plan for disaster recovery
- [ ] Review AWS Well-Architected Framework

---

## 📚 Key Concepts

### Region & Availability Zones (AZ)
- **Region**: Geographic area (us-east-1, eu-west-1, etc.)
- **AZ**: Data center within region (us-east-1a, us-east-1b, etc.)
- **Why?** Lower latency, compliance, disaster recovery

### VPC (Virtual Private Cloud)
- Your own private network in AWS
- Contains subnets (subdivisions)
- Controls traffic with security groups & NACLs
- Isolates your resources

### Security Groups
- Firewalls for EC2 instances
- Control inbound/outbound traffic
- Rules: protocol, port, source/destination

### IAM (Identity & Access Management)
- Control who can access what
- Users, groups, roles, policies
- Principle: **Least privilege** (give minimum permissions needed)

### S3 Bucket
- Container for objects (files)
- Globally unique name
- Versioning, encryption, lifecycle policies
- Used for: websites, backups, logs, ML data

---

## 🔐 Security Best Practices

1. **Never use root account** — Always use IAM users
2. **Use MFA** — Multi-factor authentication on all accounts
3. **Principle of least privilege** — Users only get permissions they need
4. **Encrypt sensitive data** — Use KMS for encryption keys
5. **Enable CloudTrail** — Log all API calls for audit
6. **Use VPC** — Don't expose resources to internet
7. **Enable VPC Flow Logs** — Track network traffic
8. **Rotate access keys** — Change keys regularly
9. **Use Secrets Manager** — Store passwords, API keys securely
10. **Enable S3 versioning** — Protect against accidental deletion

---

## 📊 AWS Terminology Cheat Sheet

| Term | Means |
|------|-------|
| **Instance** | A running virtual machine |
| **AMI** | Machine image (template for launching instances) |
| **EIP** | Elastic IP (static public IP) |
| **SG** | Security group (firewall) |
| **ARN** | Amazon Resource Name (unique identifier) |
| **API Key** | Secret credential for programmatic access |
| **Bucket** | Container in S3 for storing objects |
| **VPC** | Virtual private cloud (your private network) |
| **Subnet** | Subdivision of VPC |
| **NACL** | Network access control list (subnet-level firewall) |
| **Auto Scaling** | Automatically add/remove instances based on demand |
| **Load Balancer** | Distribute traffic across instances |
| **RTO** | Recovery Time Objective (how fast to recover) |
| **RPO** | Recovery Point Objective (how much data you can lose) |

---

## 🎯 Real-World Example: Deploy a Web App

### Architecture
```
Internet → CloudFront (CDN)
         → Route 53 (DNS)
         → ALB (Load Balancer)
         → EC2 instances (3 zones)
         → RDS (Database)
         → S3 (Static files)
```

### Services Used
- **Route 53**: Domain name management
- **CloudFront**: Cache static content globally
- **ALB**: Distribute traffic to 3 EC2 instances
- **EC2**: Run your app (auto-scaling group)
- **RDS**: PostgreSQL database
- **S3**: Store images, backups
- **CloudWatch**: Monitor performance
- **IAM**: Control access

### Estimated Cost (per month)
- 3 EC2 instances (t3.medium): $60
- RDS (db.t3.small): $30
- S3 storage (100GB): $2.30
- Data transfer: ~$10
- **Total**: ~$100/month

---

## 🔗 Resources

### Official
- [AWS Documentation](https://docs.aws.amazon.com)
- [AWS Free Tier](https://aws.amazon.com/free)
- [AWS Pricing Calculator](https://calculator.aws)

### Learning
- [AWS Skill Builder](https://skillbuilder.aws) — Official courses
- [A Cloud Guru](https://acloud.guru) — Third-party courses
- [Linux Academy](https://linuxacademy.com)
- [YouTube: AWS in Plain English](https://www.youtube.com/@awsplainsenglish)

### Certifications
- **AWS Certified Cloud Practitioner** — Beginner (50 hrs)
- **AWS Certified Solutions Architect - Associate** — Intermediate (100 hrs)
- **AWS Certified DevOps Engineer - Professional** — Advanced

---

## 📝 Summary

| Aspect | Rating |
|--------|--------|
| **Ease of Use** | ⭐⭐⭐ (Medium) |
| **Learning Curve** | ⭐⭐ (Steep) |
| **Scalability** | ⭐⭐⭐⭐⭐ |
| **Pricing** | ⭐⭐⭐ (Good for scale) |
| **Support** | ⭐⭐⭐⭐ |
| **Market Share** | ⭐⭐⭐⭐⭐ |
| **Documentation** | ⭐⭐⭐⭐⭐ |

**Best For**: Enterprise, startups at scale, complex architectures, machine learning

**Not Best For**: Beginners (too complex), simple projects (overkill), Microsoft-only stack

**Next**: Read [GCP.md](./GCP.md) for comparison, or go to [DEPLOYMENT-AWS.md](./DEPLOYMENT-AWS.md) to start hands-on.
