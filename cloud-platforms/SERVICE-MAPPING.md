# Service Mapping: AWS ↔ GCP ↔ Azure

**Find equivalent services across all three cloud providers**

---

## 🗺️ Quick Reference Map

| **Category** | **AWS** | **GCP** | **Azure** |
|-----------|---------|---------|-----------|
| **Virtual Machines** | EC2 | Compute Engine | Virtual Machines |
| **Containers (managed)** | ECS | Cloud Run | Container Instances |
| **Kubernetes** | EKS | GKE | AKS |
| **Serverless Functions** | Lambda | Cloud Functions | Azure Functions |
| **Object Storage** | S3 | Cloud Storage | Blob Storage |
| **Block Storage** | EBS | Persistent Disk | Managed Disks |
| **File Storage** | EFS | Filestore | Azure Files |
| **SQL Database** | RDS | Cloud SQL | Azure SQL Database |
| **NoSQL Key-Value** | DynamoDB | Datastore | Table Storage |
| **NoSQL Documents** | DynamoDB | Firestore | Cosmos DB |
| **Data Warehouse** | Redshift | BigQuery | Synapse Analytics |
| **Caching** | ElastiCache | Cloud Memorystore | Azure Cache for Redis |
| **Load Balancer** | ALB/NLB | Cloud Load Balancing | Application Gateway |
| **API Management** | API Gateway | Apigee | API Management |
| **DNS** | Route 53 | Cloud DNS | Azure DNS |
| **CDN** | CloudFront | Cloud CDN | Azure CDN |
| **Private Network** | VPC | VPC | Virtual Network |
| **Firewall** | Security Groups, NACL | Firewall Rules, VPC SC | Network Security Groups |
| **Identity & Access** | IAM | IAM | Azure AD / RBAC |
| **Secrets Management** | Secrets Manager | Secret Manager | Key Vault |
| **Encryption Keys** | KMS | Cloud KMS | Key Vault |
| **Monitoring** | CloudWatch | Cloud Monitoring | Azure Monitor |
| **Logging** | CloudWatch Logs | Cloud Logging | Log Analytics |
| **Auditing** | CloudTrail | Cloud Audit Logs | Activity Log |
| **CI/CD Pipelines** | CodePipeline | Cloud Build | Azure Pipelines |
| **Container Registry** | ECR | Artifact Registry | Azure Container Registry |
| **Infrastructure as Code** | CloudFormation | Deployment Manager | ARM Templates |
| **Message Queue** | SQS | Pub/Sub | Service Bus |
| **Pub/Sub** | SNS | Pub/Sub | Event Hubs / Service Bus |
| **Workflow Automation** | Step Functions | Cloud Workflows | Logic Apps |
| **Time-based Tasks** | EventBridge | Cloud Scheduler | Function Timer Trigger |
| **Search & Analytics** | OpenSearch | BigQuery | Azure Search |
| **Machine Learning** | SageMaker | Vertex AI | Azure ML |
| **Vision API** | Rekognition | Cloud Vision | Computer Vision |
| **Language Processing** | Comprehend | Natural Language API | Text Analytics |
| **Speech-to-Text** | Transcribe | Speech-to-Text | Speech Services |
| **Translation** | Translate | Translation API | Translator |

---

## 📊 Detailed Service Comparison

### Compute Services

#### Virtual Machines
```
AWS EC2 → GCP Compute Engine → Azure Virtual Machines
├─ OS: Windows, Linux           ├─ Linux (mostly)    ├─ Windows, Linux
├─ Instance types: t, m, c, r   ├─ Machine types: e2, n1, n2  ├─ A, B, D, E, F, etc.
├─ Storage: EBS                 ├─ Persistent Disk   ├─ Managed Disk
└─ Pricing: On-demand, reserved, spot  └─ Auto discounts, preemptible  └─ Reserved, spot
```

#### Serverless Containers
```
AWS Fargate → GCP Cloud Run → Azure Container Instances
├─ Works with: ECS             ├─ Standalone        ├─ Standalone
├─ Auto-scaling: Yes           ├─ Full auto-scaling ├─ Manual scaling
├─ Cold start: 30-60s          ├─ Cold start: 1-2s  ├─ Cold start: 20-30s
└─ Pricing: Per vCPU-hour      └─ Per vCPU-second   └─ Per container-hour
```

#### Managed Kubernetes
```
AWS EKS → GCP GKE → Azure AKS
├─ Cluster cost: $0.10/hour   ├─ Free                ├─ Free
├─ Node cost: Separate         ├─ Included            ├─ Separate
├─ Managed: Control plane only ├─ Fully managed      ├─ Fully managed
└─ Scaling: Auto Scaling Group └─ Node pools          └─ Node pools
```

### Storage Services

#### Object Storage
```
AWS S3 → GCP Cloud Storage → Azure Blob Storage
├─ Buckets (global namespace)  ├─ Buckets (global)  ├─ Containers (per account)
├─ Tiers: Standard, IA, Glacier ├─ Standard, Nearline, Coldline, Archive  ├─ Hot, Cool, Archive
├─ Pricing: Per GB + requests   ├─ Per GB (cheaper)   ├─ Per GB (cheapest)
└─ Durability: 99.999999999%   └─ 99.999999999%      └─ 99.999999999%
```

#### Block Storage
```
AWS EBS → GCP Persistent Disk → Azure Managed Disk
├─ Type: gp2, gp3, io1, io2    ├─ Standard, SSD      ├─ Standard SSD, Premium SSD
├─ Attached to: EC2 instances   ├─ Attached to: VMs   ├─ Attached to: VMs
├─ Snapshots: Extra cost        ├─ Snapshots: Extra   ├─ Snapshots: Included
└─ Max size: 16 TB              └─ Max size: 64 TB    └─ Max size: 32 TB
```

#### File Storage
```
AWS EFS → GCP Filestore → Azure Files / Azure NetApp Files
├─ Protocol: NFS v4.0/4.1      ├─ Protocol: NFS v3  ├─ Protocol: SMB 3.0/3.1.1
├─ Access: Linux/Unix only      ├─ Access: Linux     ├─ Access: Windows/Linux
├─ Pricing: Per GB-month        ├─ Per GB-month      ├─ Per GB-month
└─ Use case: App data sharing   └─ App data sharing  └─ Windows file sharing
```

### Database Services

#### Managed SQL
```
AWS RDS → GCP Cloud SQL → Azure SQL Database / Database for PostgreSQL
├─ Engines: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server
├─ High Availability: Multi-AZ (extra)
├─ Backups: Automatic, point-in-time recovery
└─ Pricing: Per instance hour + storage

GCP Cloud SQL:
├─ Open source preferred (MySQL, PostgreSQL)
├─ Always highly available within region
└─ Usually 20-30% cheaper than RDS

Azure SQL Database:
├─ SQL Server primary focus
├─ Built-in geo-replication
└─ Can be cheaper with Hybrid Benefit
```

#### NoSQL: Key-Value
```
AWS DynamoDB → GCP Datastore → Azure Table Storage / Cosmos DB
├─ Consistency: Eventually consistent (can request strong)
├─ Throughput: Auto-scaling or provisioned
├─ Pricing: Per request or per provisioned capacity
└─ Use: Session data, user profiles, simple lookups
```

#### NoSQL: Documents
```
AWS DynamoDB → GCP Firestore → Azure Cosmos DB
├─ Schema: Flexible (documents)
├─ Real-time sync: DynamoDB (limited) vs Firestore (native) vs Cosmos DB (native)
├─ Multi-region: DynamoDB (extra setup) vs Firestore (automatic) vs Cosmos DB (automatic)
└─ Transactions: Limited / Yes / Yes
```

#### Data Warehousing
```
AWS Redshift → GCP BigQuery → Azure Synapse Analytics
├─ Model: Node-based / Serverless / Hybrid
├─ Pricing: Per node hour / Per GB scanned / Per DWU
├─ Setup: 30+ min / Instant / 10-20 min
└─ Best for: Enterprise BI / Data science / Analytics
```

#### Caching
```
AWS ElastiCache → GCP Cloud Memorystore → Azure Cache for Redis
├─ Engines: Redis, Memcached / Redis only / Redis only
├─ Node types: cache.t3, cache.m5, cache.r5 / Basic, Standard / Basic, Standard, Premium
└─ Use: Session cache, real-time leaderboards, recommendations
```

### Networking Services

#### Load Balancers
```
AWS ALB/NLB → GCP Cloud Load Balancing → Azure Application Gateway/Load Balancer
├─ ALB: Layer 7 (HTTP/HTTPS)    ├─ Layer 7 load balancing by default
├─ NLB: Layer 4 (TCP/UDP)        ├─ Layer 4 available
├─ Multi-region: Manual          ├─ Automatic multi-region routing
└─ Pricing: Per LB + per GB       └─ Per rule, cheaper overall
```

#### API Gateway
```
AWS API Gateway → GCP Apigee / Cloud Endpoints → Azure API Management
├─ REST & WebSocket APIs         ├─ Full API management (Apigee)
├─ Request/response transformation
├─ Rate limiting, authentication
└─ Pricing: Per API call + data
```

#### DNS
```
AWS Route 53 → GCP Cloud DNS → Azure DNS
├─ Full DNS service + domain registration
├─ Health checks
├─ Routing policies (latency, geolocation, etc.)
└─ Pricing: Hosted zones + queries
```

#### CDN
```
AWS CloudFront → GCP Cloud CDN → Azure CDN
├─ Edge locations: 500+ / 40+ / 200+
├─ Cache control: Fine-grained / Good / Good
├─ Pricing: Per GB delivered (CloudFront most expensive)
└─ Include with: Nothing / Cloud Load Balancer / App Service
```

#### Private Networks
```
AWS VPC → GCP VPC → Azure VNet
├─ Subnets: Multiple per region    ├─ Single VPC spans all regions (subnets per region)
├─ Security Groups: Instance-level  ├─ Firewall Rules: VPC-level
├─ NACLs: Subnet-level             ├─ Firewalls: Fine-grained rules
└─ Peering: Between VPCs           └─ Peering: VNet-to-VNet peering
```

### Security & Identity

#### Identity & Access Control
```
AWS IAM → GCP IAM → Azure AD / RBAC
├─ Users, Groups, Roles           ├─ Service Accounts, Custom Roles
├─ Policies: JSON-based           ├─ Policies: Bindings (member + role)
├─ Principle: Least privilege     ├─ Principle: Least privilege
└─ MFA: Optional                  └─ 2FA: Recommended for admins
```

#### Secrets Management
```
AWS Secrets Manager → GCP Secret Manager → Azure Key Vault
├─ Stores: Passwords, API keys    ├─ Simple secret storage
├─ Rotation: Supported            ├─ No built-in rotation
├─ Pricing: Per secret + rotation └─ Pricing: Per secret + operations
```

#### Encryption Keys
```
AWS KMS → GCP Cloud KMS → Azure Key Vault
├─ Customer managed keys          ├─ Customer managed keys
├─ Integration: Wide (100+ services)
├─ Pricing: Per key + per request
└─ Use: Encrypt data at rest
```

### Monitoring & Logging

#### Monitoring
```
AWS CloudWatch → GCP Cloud Monitoring → Azure Monitor
├─ Metrics: Native agent or custom metrics
├─ Dashboards: Yes
├─ Alerts: Yes
└─ Pricing: Per metric + log storage
```

#### Logging
```
AWS CloudWatch Logs → GCP Cloud Logging → Azure Log Analytics
├─ Log groups: Organization       ├─ Log buckets
├─ Retention: Configurable        ├─ Retention: Default 30 days
├─ Analysis: CloudWatch Insights  ├─ Analysis: Log Analytics queries
└─ Pricing: Per GB ingested       └─ Per GB ingested
```

#### Auditing
```
AWS CloudTrail → GCP Cloud Audit Logs → Azure Activity Log
├─ Records: All API calls         ├─ Records: Admin, data, system events
├─ Storage: S3                    ├─ Storage: Cloud Logging
├─ Retention: Configurable (90 default)
└─ Use: Compliance, debugging
```

### DevOps & Infrastructure

#### CI/CD Pipelines
```
AWS CodePipeline → GCP Cloud Build → Azure Pipelines
├─ Build: CodeBuild             ├─ Container-native            ├─ Agent-based
├─ Deploy: CodeDeploy, CloudFormation ├─ Deploy: Cloud Deploy, Terraform
├─ Trigger: Code push, manual   ├─ Trigger: Code push, schedule
└─ Pricing: Per pipeline + resources
```

#### Container Registry
```
AWS ECR → GCP Artifact Registry → Azure Container Registry
├─ Hosts: Docker images          ├─ Multi-artifact (Docker, Maven, npm)
├─ Pricing: Per GB stored + transfer
├─ Integration: Tight with deploy services
└─ Use: Store, version, deploy containers
```

#### Infrastructure as Code
```
AWS CloudFormation → GCP Deployment Manager → Azure ARM Templates
├─ Language: JSON / YAML         ├─ YAML                    ├─ JSON / Bicep
├─ Change sets: Dry run          ├─ Rollback: Manual        ├─ What-if: Preview
├─ Modularity: Nested stacks     ├─ Modularity: Templates   ├─ Modularity: Modules
└─ Pricing: Free (resources cost)
```

### Messaging & Events

#### Message Queues
```
AWS SQS → GCP Pub/Sub → Azure Service Bus
├─ Queue-based messages          ├─ Publish/Subscribe model
├─ FIFO queues: Optional         ├─ Topics with subscriptions
├─ Visibility timeout: 30s default
└─ Pricing: Per million requests
```

#### Pub/Sub Messaging
```
AWS SNS → GCP Pub/Sub → Azure Event Hubs / Service Bus
├─ Fan-out notifications         ├─ Real-time streaming
├─ Topics + subscriptions        ├─ Push-based delivery
├─ HTTP, email, SMS targets
└─ Pricing: Per million messages
```

#### Scheduled Tasks
```
AWS EventBridge / Lambda Schedule → GCP Cloud Scheduler → Azure Function Timer
├─ Cron expressions              ├─ App Engine cron, Cloud Scheduler
├─ Event rules: Complex filters  ├─ Pub/Sub delivery
└─ Targets: 100+ services
```

---

## 🔄 Migration Path Examples

### Example 1: Move from AWS to GCP
```
AWS Service          → GCP Equivalent    Notes
EC2                  → Compute Engine    1:1 migration, similar concepts
RDS PostgreSQL       → Cloud SQL         Drop-in replacement
S3                   → Cloud Storage     Slight syntax changes
DynamoDB             → Firestore         Need to redesign (different model)
Lambda               → Cloud Functions   Rewrite functions
CloudFront           → Cloud CDN         Different caching rules
```

### Example 2: Move from GCP to Azure
```
GCP Service          → Azure Equivalent  Notes
Compute Engine       → Virtual Machines  Similar concepts
Cloud SQL            → Azure SQL DB      MySQL/PostgreSQL requires Azure for those
Firestore            → Cosmos DB         Different consistency model
BigQuery             → Synapse Analytics Requires rewriting queries
Cloud Functions      → Azure Functions   Some language support changes
Cloud Run            → Container Inst    Container format compatible
```

### Example 3: Move from Azure to AWS
```
Azure Service        → AWS Equivalent    Notes
Virtual Machines     → EC2               Similar concepts
Azure SQL            → RDS MySQL/SQL Srv Good 1:1 mapping
Cosmos DB            → DynamoDB          Different pricing model
Synapse              → Redshift          Need query rewrite
Azure Functions      → Lambda            Minor code changes
App Service          → Elastic Beanstalk Auto-scaling required
```

---

## 💡 Key Differences Summary

### Naming Conventions
- **AWS**: Acronym-heavy (EC2, RDS, S3, VPC, ALB)
- **GCP**: Descriptive names (Cloud Storage, Cloud SQL, Cloud Functions)
- **Azure**: "Azure [Service Name]" (Azure VM, Azure SQL, Azure Functions)

### Pricing Models
- **AWS**: Per-hour billing (rounded up)
- **GCP**: Per-second billing with sustained discounts
- **Azure**: Per-hour or per DTU, Hybrid Benefit if applicable

### Interface Design
- **AWS**: More powerful, steeper curve
- **GCP**: Cleaner, more intuitive
- **Azure**: Windows-centric, PowerShell-friendly

### Integration Philosophy
- **AWS**: Independent services (you wire together)
- **GCP**: Integrated services (work better together)
- **Azure**: Microsoft ecosystem integration

---

## 📋 Quick Decision Flowchart

```
Need Virtual Machines?
├─ AWS → EC2
├─ GCP → Compute Engine
└─ Azure → Virtual Machines

Need SQL Database?
├─ AWS → RDS
├─ GCP → Cloud SQL
└─ Azure → Azure SQL Database

Need NoSQL?
├─ Key-Value?
│  ├─ AWS → DynamoDB
│  ├─ GCP → Datastore
│  └─ Azure → Table Storage
└─ Documents?
   ├─ AWS → DynamoDB
   ├─ GCP → Firestore
   └─ Azure → Cosmos DB

Need to Process Big Data?
├─ AWS → Redshift
├─ GCP → BigQuery
└─ Azure → Synapse Analytics

Need Serverless Functions?
├─ AWS → Lambda
├─ GCP → Cloud Functions
└─ Azure → Azure Functions

Need Containers?
├─ AWS → ECS / EKS
├─ GCP → Cloud Run / GKE
└─ Azure → Container Instances / AKS
```

---

**Next Steps**:
- For detailed guides: [AWS.md](./AWS.md), [GCP.md](./GCP.md), [AZURE.md](./AZURE.md)
- For deployment help: [DEPLOYMENT-AWS.md](./DEPLOYMENT-AWS.md), [DEPLOYMENT-GCP.md](./DEPLOYMENT-GCP.md), [DEPLOYMENT-AZURE.md](./DEPLOYMENT-AZURE.md)
- For use cases: [USE-CASES.md](./USE-CASES.md)
