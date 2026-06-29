# AWS & GCP - Professional Interview Guide

## Table of Contents
1. [Cloud Computing Basics](#cloud-computing-basics)
2. [AWS Core Services](#aws-core-services)
3. [GCP Core Services](#gcp-core-services)
4. [Compute Services](#compute-services)
5. [Storage & Databases](#storage--databases)
6. [Networking & Security](#networking--security)
7. [Serverless & Containers](#serverless--containers)
8. [Best Practices](#best-practices)

---

## Cloud Computing Basics

### What is Cloud Computing?
**Cloud Computing** is on-demand delivery of IT resources (compute, storage, databases, networking) over the internet with pay-as-you-go pricing.

**Benefits:**
- **Cost:** Pay only for what you use (no upfront investment)
- **Scale:** Scale up/down based on demand
- **Speed:** Deploy resources in minutes
- **Global:** Deploy worldwide instantly
- **Reliability:** Built-in redundancy

**Key takeaway:** On-demand resources. Pay-as-you-go. Global scale.

---

### Service Models
**IaaS (Infrastructure as a Service):**
- Raw infrastructure: VMs, storage, networks
- You manage: OS, middleware, runtime, apps
- Examples: EC2, Google Compute Engine

**PaaS (Platform as a Service):**
- Platform for apps: runtime, middleware
- You manage: apps, data
- Examples: AWS Elastic Beanstalk, Google App Engine

**SaaS (Software as a Service):**
- Complete applications
- You manage: configuration, data
- Examples: Gmail, Office 365

**Key takeaway:** IaaS = infra, PaaS = platform, SaaS = software.

---

### Deployment Models
**Public Cloud:** Resources owned by cloud provider (AWS, GCP, Azure)
**Private Cloud:** Dedicated to single organization (on-premises or hosted)
**Hybrid Cloud:** Combination of public and private

**Key takeaway:** Public = shared, Private = dedicated, Hybrid = both.

---

## AWS Core Services

### EC2 (Elastic Compute Cloud)
**Definition:** Virtual servers in the cloud.

**Instance Types:**
- **General Purpose (t3, m5):** Balanced compute, memory, networking
- **Compute Optimized (c5):** High-performance processors
- **Memory Optimized (r5):** Large memory workloads
- **Storage Optimized (i3):** High IOPS

**Pricing:**
- **On-Demand:** Pay per hour/second
- **Reserved:** 1-3 year commitment (up to 75% discount)
- **Spot:** Bid for unused capacity (up to 90% discount, can be interrupted)

**Key features:**
- Auto Scaling: Scale based on demand
- Elastic Load Balancing: Distribute traffic
- AMI (Amazon Machine Image): Pre-configured templates

**Key takeaway:** Virtual machines. Multiple instance types. Auto-scaling.

---

### S3 (Simple Storage Service)
**Definition:** Object storage service. Unlimited storage.

**Features:**
- **Durability:** 99.999999999% (11 nines)
- **Availability:** 99.99%
- **Storage Classes:**
  - S3 Standard: Frequent access
  - S3 Infrequent Access (IA): Less frequent, cheaper
  - S3 Glacier: Archival, very cheap (minutes to hours retrieval)
  - S3 Intelligent-Tiering: Auto-moves between tiers

**Use cases:**
- Static website hosting
- Backups
- Data lakes
- Content distribution (with CloudFront CDN)

**Security:**
- Bucket policies, IAM
- Encryption at rest and in transit
- Versioning

**Key takeaway:** Object storage. Multiple storage classes. Highly durable.

---

### Lambda
**Definition:** Serverless compute. Run code without managing servers.

**How it works:**
- Upload code
- Trigger: API Gateway, S3 event, schedule, etc.
- Lambda executes function
- Pay per invocation and duration

**Pricing:** $0.20 per 1M requests + compute time

**Use cases:**
- API backends
- Data processing (image resize, log analysis)
- Scheduled tasks
- Event-driven workflows

**Limitations:**
- 15 minute max execution
- Limited CPU/memory

**Key takeaway:** Serverless functions. Event-driven. Pay per execution.

---

### RDS (Relational Database Service)
**Definition:** Managed relational databases.

**Supported engines:**
- MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, Aurora (AWS proprietary)

**Features:**
- **Automated backups:** Point-in-time recovery
- **Multi-AZ:** High availability (sync replication)
- **Read Replicas:** Scale read traffic (async replication)
- **Automatic patching**

**vs EC2 database:** RDS = managed (backups, patches), EC2 = full control

**Key takeaway:** Managed SQL databases. Multi-AZ, backups, read replicas.

---

### VPC (Virtual Private Cloud)
**Definition:** Isolated network in AWS.

**Components:**
- **Subnets:** Public (internet access) and private (no internet)
- **Internet Gateway:** Connect VPC to internet
- **NAT Gateway:** Allow private subnet to access internet
- **Route Tables:** Define traffic routing
- **Security Groups:** Instance-level firewall (stateful)
- **Network ACLs:** Subnet-level firewall (stateless)

**Key takeaway:** Isolated network. Public/private subnets. Security groups.

---

### IAM (Identity and Access Management)
**Definition:** Manage access to AWS resources.

**Concepts:**
- **Users:** Individual accounts
- **Groups:** Collection of users
- **Roles:** Temporary credentials (for services, cross-account)
- **Policies:** JSON documents defining permissions

**Best practices:**
- Least privilege principle
- Use roles for services (not API keys)
- Enable MFA
- Rotate credentials

**Key takeaway:** Access control. Users, groups, roles, policies.

---

## GCP Core Services

### Compute Engine
**Definition:** Virtual machines (like EC2).

**Features:**
- **Preemptible VMs:** 80% cheaper, can be terminated (like Spot)
- **Custom machine types:** Specify exact CPU/memory
- **Sustained use discounts:** Automatic discounts for long-running VMs

**Key takeaway:** GCP's VMs. Preemptible = cheap, interruptible.

---

### Cloud Storage
**Definition:** Object storage (like S3).

**Storage classes:**
- **Standard:** Frequent access
- **Nearline:** < once per month
- **Coldline:** < once per quarter
- **Archive:** < once per year

**Features:**
- 99.999999999% durability
- Global availability
- Lifecycle policies

**Key takeaway:** Object storage. Multiple storage classes.

---

### Cloud Functions
**Definition:** Serverless functions (like Lambda).

**Triggers:**
- HTTP requests
- Cloud Storage events
- Pub/Sub messages
- Firestore events

**Pricing:** Per invocation + compute time

**Key takeaway:** Serverless. Event-driven.

---

### Cloud SQL
**Definition:** Managed databases (like RDS).

**Supported:** MySQL, PostgreSQL, SQL Server

**Features:**
- Automated backups
- High availability (failover)
- Read replicas

**Key takeaway:** Managed SQL. Backups, HA.

---

### Cloud Run
**Definition:** Fully managed serverless for containers.

**How it works:**
- Package app in container
- Deploy to Cloud Run
- Auto-scales to zero (no traffic = no cost)

**vs Cloud Functions:** Containers (any language/runtime) vs Functions (specific runtimes)

**Key takeaway:** Serverless containers. Scale to zero.

---

## Compute Services

### AWS Compute Comparison
**EC2:** Full control, VMs
**Lambda:** Serverless functions, event-driven
**ECS/EKS:** Containers (ECS = AWS, EKS = Kubernetes)
**Elastic Beanstalk:** PaaS, auto-deploys apps

**Key takeaway:** EC2 = VMs, Lambda = functions, ECS/EKS = containers.

---

### GCP Compute Comparison
**Compute Engine:** VMs
**Cloud Functions:** Serverless functions
**Cloud Run:** Serverless containers
**GKE (Google Kubernetes Engine):** Managed Kubernetes
**App Engine:** PaaS

**Key takeaway:** Similar to AWS. Cloud Run unique = serverless containers.

---

### Auto Scaling
**AWS Auto Scaling:**
- Define launch template (AMI, instance type)
- Set min/max instances
- Scaling policies: CPU, custom metrics

**GCP Instance Groups:**
- Managed instance groups
- Autoscaler based on CPU, load balancing

**Key takeaway:** Scale based on metrics. Min/max instances.

---

## Storage & Databases

### Block Storage
**AWS EBS (Elastic Block Store):**
- Persistent block storage for EC2
- Types: SSD (gp3, io2), HDD (st1, sc1)
- Snapshots for backups

**GCP Persistent Disks:**
- Block storage for Compute Engine
- Standard (HDD), SSD, Balanced

**Key takeaway:** Block storage for VMs. Persistent.

---

### NoSQL Databases
**AWS DynamoDB:**
- Fully managed NoSQL
- Key-value, document store
- Auto-scaling
- Single-digit millisecond latency

**GCP Firestore (Datastore):**
- NoSQL document database
- Real-time sync
- Mobile/web SDKs

**Key takeaway:** DynamoDB = AWS NoSQL, Firestore = GCP NoSQL.

---

### Data Warehouses
**AWS Redshift:**
- Petabyte-scale data warehouse
- Columnar storage
- SQL queries

**GCP BigQuery:**
- Serverless data warehouse
- SQL queries on massive datasets
- Pay per query

**Key takeaway:** Redshift = managed cluster, BigQuery = serverless.

---

## Networking & Security

### Load Balancing
**AWS:**
- **ALB (Application Load Balancer):** HTTP/HTTPS, Layer 7
- **NLB (Network Load Balancer):** TCP/UDP, Layer 4, ultra-low latency
- **CLB (Classic Load Balancer):** Legacy

**GCP:**
- **HTTP(S) Load Balancer:** Global, Layer 7
- **Network Load Balancer:** Regional, Layer 4

**Key takeaway:** ALB/HTTP = Layer 7, NLB/Network = Layer 4.

---

### CDN (Content Delivery Network)
**AWS CloudFront:**
- Global edge locations
- Caches content closer to users
- Integrates with S3, EC2

**GCP Cloud CDN:**
- Global edge network
- Caches at Google edge locations

**Key takeaway:** Cache content globally. Low latency.

---

### Security Services
**AWS:**
- **WAF (Web Application Firewall):** Protect against web attacks
- **Shield:** DDoS protection
- **KMS (Key Management Service):** Encryption keys
- **Secrets Manager:** Rotate secrets

**GCP:**
- **Cloud Armor:** DDoS protection, WAF
- **Cloud KMS:** Encryption keys
- **Secret Manager:** Manage secrets

**Key takeaway:** WAF, DDoS protection, encryption keys, secrets management.

---

### Identity & Access
**AWS IAM:** Users, groups, roles, policies

**GCP IAM:**
- Similar to AWS
- **Service Accounts:** For applications (like AWS roles)
- **Primitive Roles:** Owner, Editor, Viewer
- **Predefined Roles:** Fine-grained

**Key takeaway:** IAM = access control. Least privilege.

---

## Serverless & Containers

### Serverless Comparison
**AWS:**
- Lambda: Functions
- API Gateway: REST APIs
- Step Functions: Workflow orchestration
- EventBridge: Event bus

**GCP:**
- Cloud Functions: Functions
- API Gateway: REST APIs
- Workflows: Orchestration
- Eventarc: Event delivery

**Key takeaway:** Similar serverless offerings. Event-driven architecture.

---

### Container Services
**AWS:**
- **ECS (Elastic Container Service):** AWS-native orchestration
- **EKS (Elastic Kubernetes Service):** Managed Kubernetes
- **Fargate:** Serverless containers (no EC2 management)

**GCP:**
- **GKE (Google Kubernetes Engine):** Managed Kubernetes
- **Cloud Run:** Serverless containers (Knative-based)

**Key takeaway:** ECS = AWS, GKE/Cloud Run = GCP. Fargate/Cloud Run = serverless.

---

### Kubernetes
**EKS:**
- Managed Kubernetes control plane
- Integrates with AWS services (IAM, VPC)

**GKE:**
- Managed Kubernetes
- Auto-upgrade, auto-repair
- GKE Autopilot: Fully managed (Google manages nodes)

**Key takeaway:** Managed K8s. GKE Autopilot = fully managed.

---

## Best Practices

### Cost Optimization
1. **Right-sizing:** Match instance size to workload
2. **Reserved/Committed Use:** Discounts for long-term
3. **Spot/Preemptible:** For fault-tolerant workloads
4. **Auto-scaling:** Scale down during low traffic
5. **Storage lifecycle:** Move infrequent data to cheaper tiers
6. **Delete unused resources:** EBS volumes, snapshots, load balancers
7. **Use serverless:** Pay only for execution (Lambda, Cloud Run)

**Key takeaway:** Right-size, use discounts, auto-scale, lifecycle policies.

---

### Security Best Practices
1. **Least privilege:** Minimal permissions
2. **MFA:** Multi-factor authentication
3. **Encryption:** At rest and in transit
4. **Network isolation:** VPC, private subnets
5. **Logging & monitoring:** CloudTrail (AWS), Cloud Audit Logs (GCP)
6. **Security groups/firewalls:** Restrict traffic
7. **Secrets management:** Don't hardcode credentials
8. **Regular audits:** Review permissions, access logs

**Key takeaway:** Least privilege, encryption, monitoring, secrets management.

---

### High Availability
1. **Multi-AZ/Region:** Deploy across multiple zones/regions
2. **Load balancing:** Distribute traffic
3. **Auto Scaling:** Replace unhealthy instances
4. **Database replication:** Multi-AZ, read replicas
5. **Backups:** Automated, tested
6. **Health checks:** Monitor application health

**Key takeaway:** Multi-AZ, load balancing, auto-scaling, backups.

---

### Well-Architected Framework (AWS)
**Five Pillars:**
1. **Operational Excellence:** Automate, monitor, improve
2. **Security:** Protect data, systems, assets
3. **Reliability:** Recover from failures, scale
4. **Performance Efficiency:** Right resources, evolve
5. **Cost Optimization:** Avoid waste, measure

**GCP Best Practices:** Similar principles (security, reliability, performance, cost)

**Key takeaway:** Operational excellence, security, reliability, performance, cost.

---

## Interview Tips

1. **Know service equivalents:** "S3 is like Cloud Storage, EC2 is like Compute Engine."
2. **Discuss trade-offs:** "Lambda for event-driven, EC2 for long-running processes."
3. **Real examples:** "Used S3 + CloudFront for static website hosting with global low latency."
4. **Security focus:** "Enabled encryption, used IAM roles, not access keys."
5. **Cost awareness:** "Used Spot instances for batch processing, saved 70%."

---

**Updated:** 2026-06-28 | **Level:** Intermediate-Advanced | **Format:** Interview-ready definitions
