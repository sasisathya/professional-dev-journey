# Cloud Terminology & Acronyms Glossary

**Your quick reference guide for cloud jargon**

---

## 🔤 General Cloud Terms

### Basic Concepts

| Term | Definition | Example |
|------|-----------|---------|
| **Cloud Computing** | Using remote servers (in data centers) instead of local machines | Store files on Google Drive instead of laptop |
| **Service Model** | How cloud is delivered (compute, storage, data) | IaaS, PaaS, SaaS |
| **Region** | Geographic area with multiple data centers | us-east-1, eu-west-1 |
| **Availability Zone (AZ)** | Single data center within a region | us-east-1a |
| **Data Center** | Physical building with servers | Google data center in Oregon |
| **Instance** | A running virtual machine or service | One EC2 instance |
| **Image** | Template for launching instances | Ubuntu 22.04 machine image |
| **Cluster** | Group of computers working together | Kubernetes cluster with 3 nodes |
| **Node** | One computer in a cluster | One Kubernetes pod |
| **Pod** | Smallest deployable Kubernetes unit | Container wrapper |

### Service Models

| Acronym | Full Name | Definition | Control Level |
|---------|-----------|-----------|---|
| **IaaS** | Infrastructure as a Service | Raw computing, storage, network (you manage everything else) | You manage apps, data, OS |
| **PaaS** | Platform as a Service | Pre-configured platform to build on (less control, more convenience) | You manage apps & data |
| **SaaS** | Software as a Service | Ready-to-use application (minimal control) | Provider manages everything |
| **FaaS** | Functions as a Service | Serverless functions (you write code, provider runs it) | You manage code only |

### Network Concepts

| Term | Definition | Example |
|------|-----------|---------|
| **VPC** | Virtual Private Cloud - Your own private network | AWS VPC, Azure VNet, GCP VPC |
| **Subnet** | Division of VPC (smaller network within network) | 10.0.1.0/24 subnet |
| **CIDR** | Classless Inter-Domain Routing - IP address notation | 10.0.0.0/16 (65,536 IPs) |
| **Security Group** | Firewall for instances (inbound/outbound rules) | Allow port 80, 443, deny all else |
| **NACL** | Network Access Control List - Subnet-level firewall | Layer subnet-level rules |
| **Route Table** | Rules for directing network traffic | 0.0.0.0/0 → NAT gateway |
| **NAT Gateway** | Lets private instances talk to internet securely | Private subnet → NAT → Internet |
| **VPN** | Virtual Private Network - Encrypted tunnel | Connect office to cloud VPC |
| **Peering** | Direct connection between VPCs/VNets | Connect two VPCs directly |
| **Load Balancer** | Distributes traffic across instances | 1000 requests → 5 instances |

### Storage Concepts

| Term | Definition | Example |
|------|-----------|---------|
| **Object** | Any file (images, videos, documents, backups) | Photos in S3 bucket |
| **Bucket** | Container for objects | "my-photos-bucket" in S3 |
| **Block** | Disk storage (like a hard drive) | EBS volume attached to EC2 |
| **Blob** | Azure's term for object storage | Files in Azure Blob Storage |
| **Container** | Azure's term for bucket | Container in Blob Storage |
| **Volume** | Block storage device | EBS volume, Persistent Disk |
| **Snapshot** | Point-in-time copy of storage | Backup of database disk |
| **Replication** | Copy data to multiple locations | S3 replicates to 3+ AZs |
| **Durability** | Probability data won't be lost | 99.999999999% (11 nines) |
| **Availability** | Probability service is accessible | 99.9% (3 nines) |

### Database Concepts

| Term | Definition | Example |
|------|-----------|---------|
| **Relational DB** | Structured data in tables with relationships | MySQL, PostgreSQL, SQL Server |
| **SQL** | Structured Query Language - query language | SELECT * FROM users |
| **ACID** | Atomicity, Consistency, Isolation, Durability - transaction properties | All-or-nothing transactions |
| **NoSQL** | Non-relational databases (flexible schema) | MongoDB, DynamoDB, Firestore |
| **Document** | Unstructured data (usually JSON) | {name: "John", age: 30} |
| **Key-Value** | Simple storage (key looks up value) | {"user_123": "John"} |
| **Index** | Fast lookup of data | Index on email column |
| **Query** | Request for specific data | SELECT name FROM users WHERE id=5 |
| **Transaction** | Multiple operations as one unit | Debit account + credit account (both or nothing) |
| **OLTP** | Online Transaction Processing - fast writes | Payment systems |
| **OLAP** | Online Analytical Processing - big data analysis | Data warehouses |
| **Data Warehouse** | Centralized storage for analytics | BigQuery, Redshift |
| **Data Lake** | Raw, unstructured data storage | S3 with all company data |

---

## 🏢 AWS-Specific Terms

| Acronym | Full Name | Definition |
|---------|-----------|-----------|
| **EC2** | Elastic Compute Cloud | Virtual machines |
| **ECS** | Elastic Container Service | Docker container orchestration |
| **EKS** | Elastic Kubernetes Service | Managed Kubernetes |
| **S3** | Simple Storage Service | Object storage (buckets) |
| **EBS** | Elastic Block Store | Block storage (volumes) |
| **EFS** | Elastic File System | Network file storage |
| **RDS** | Relational Database Service | Managed SQL databases |
| **DynamoDB** | (No acronym) | Managed NoSQL database |
| **Lambda** | (No acronym) | Serverless functions |
| **API Gateway** | (No acronym) | Create REST APIs |
| **CloudFront** | (No acronym) | Content Delivery Network (CDN) |
| **Route 53** | (No acronym) | DNS service |
| **VPC** | Virtual Private Cloud | Your private network |
| **IAM** | Identity & Access Management | User permissions |
| **KMS** | Key Management Service | Encryption key management |
| **CloudWatch** | (No acronym) | Monitoring & logging |
| **CloudTrail** | (No acronym) | API audit logging |
| **CloudFormation** | (No acronym) | Infrastructure as Code |
| **SQS** | Simple Queue Service | Message queue |
| **SNS** | Simple Notification Service | Publish/Subscribe messaging |
| **Redshift** | (No acronym) | Data warehouse |
| **Elastic Beanstalk** | (No acronym) | Platform for web apps |
| **AMI** | Amazon Machine Image | VM template |
| **ARN** | Amazon Resource Name | Unique ID for resource |

---

## 🌐 GCP-Specific Terms

| Service | Definition | Acronym |
|---------|-----------|---------|
| **Compute Engine** | Virtual machines | None (CE informally) |
| **App Engine** | Platform for web apps | None (AE informally) |
| **Cloud Functions** | Serverless functions | None |
| **Cloud Run** | Serverless containers | None |
| **GKE** | Google Kubernetes Engine | GKE |
| **Cloud Storage** | Object storage | None |
| **Cloud SQL** | Managed SQL databases | None |
| **Firestore** | NoSQL document database | None |
| **Datastore** | Older NoSQL database | None |
| **BigQuery** | Data warehouse | None |
| **Dataflow** | Data pipeline processing | None |
| **Pub/Sub** | Publish/Subscribe messaging | None |
| **Cloud Build** | CI/CD pipeline | None |
| **Cloud Deploy** | Deployment automation | None |
| **Vertex AI** | Machine learning platform | None |
| **Cloud KMS** | Encryption key management | None |
| **Secret Manager** | Secrets management | None |
| **Cloud Monitoring** | Monitoring service | None |
| **Cloud Logging** | Centralized logging | None |
| **IAM** | Identity & Access Management | IAM |
| **VPC** | Virtual Private Cloud | VPC |
| **Cloud CDN** | Content Delivery Network | None |
| **Cloud DNS** | DNS service | None |
| **Artifact Registry** | Container & artifact registry | None |

---

## ☁️ Azure-Specific Terms

| Service | Definition | Acronym |
|---------|-----------|---------|
| **Virtual Machines** | VMs (Windows or Linux) | VMs |
| **App Service** | Managed web app hosting | None |
| **Azure Functions** | Serverless functions | None |
| **Container Instances** | Run containers without orchestration | ACI |
| **Azure Kubernetes Service** | Managed Kubernetes | AKS |
| **Blob Storage** | Object storage | None |
| **Managed Disks** | Block storage | None |
| **Azure Files** | File shares (SMB) | None |
| **Azure SQL Database** | Managed SQL Server | None |
| **Cosmos DB** | NoSQL multi-model database | None |
| **Azure Synapse Analytics** | Data warehouse | None |
| **Azure Monitor** | Monitoring service | None |
| **Log Analytics** | Centralized logging | None |
| **Azure AD** | Azure Active Directory (identity) | AAD |
| **RBAC** | Role-Based Access Control | RBAC |
| **Key Vault** | Secrets & encryption keys | None |
| **Virtual Network** | Private network | VNet |
| **Network Security Group** | Firewall rules | NSG |
| **Application Gateway** | Load balancer | None |
| **Azure Pipelines** | CI/CD pipeline | None |
| **Container Registry** | Container image registry | ACR (Azure Container Registry) |
| **ARM Templates** | Infrastructure as Code | ARM |
| **API Management** | API gateway & management | APIM |
| **Service Bus** | Enterprise messaging | None |
| **Event Hubs** | Real-time event streaming | None |
| **Logic Apps** | Workflow automation | None |
| **Azure DevOps** | Project management & CI/CD | None |

---

## 🔐 Security & Identity Terms

| Term | Definition | Example |
|------|-----------|---------|
| **Authentication** | Proving who you are | Login with username/password |
| **Authorization** | Determining what you can access | User can read but not delete |
| **MFA** | Multi-Factor Authentication | Password + authenticator app |
| **2FA** | Two-Factor Authentication | Password + SMS code |
| **IAM** | Identity & Access Management | User permissions & roles |
| **Role** | Set of permissions | Admin, Editor, Viewer |
| **Policy** | Rules for access | "Allow Lambda to read S3" |
| **Service Account** | Machine identity (for apps) | Not a human user |
| **Key** | Credential for authentication | API key, private key |
| **Secret** | Sensitive credential | Password, API token |
| **Encryption** | Converting data to unreadable format | Plaintext → ciphertext |
| **At-Rest** | Data stored on disk | Data in S3 bucket |
| **In-Transit** | Data moving across network | HTTPS transmission |
| **KMS** | Key Management Service | Encrypt/decrypt operations |
| **PKI** | Public Key Infrastructure | Public/private key system |
| **Certificate** | Proves identity (for HTTPS) | SSL certificate for website |
| **Compliance** | Following regulations | HIPAA, GDPR, SOC 2 |
| **Audit** | Recording all actions | CloudTrail logs |
| **Zero Trust** | Verify every access | Don't trust network perimeter |
| **Least Privilege** | Minimal necessary permissions | Admin only when needed |

---

## 🚀 DevOps & Deployment Terms

| Term | Definition | Example |
|------|-----------|---------|
| **CI/CD** | Continuous Integration/Deployment | Auto-test & deploy on code push |
| **Pipeline** | Automated workflow | Code → Test → Deploy |
| **Build** | Compile code into executable | Create Docker image |
| **Test** | Automated testing | Unit tests, integration tests |
| **Deploy** | Release to production | Update live servers |
| **Container** | Packaged application with dependencies | Docker image |
| **Docker** | Tool for containerizing apps | Package app + OS |
| **Kubernetes** | Container orchestration platform | Auto-scale, update containers |
| **Helm** | Kubernetes package manager | Install apps on Kubernetes |
| **IaC** | Infrastructure as Code | Define infrastructure in code |
| **Terraform** | IaC tool (multi-cloud) | Define cloud resources |
| **Ansible** | Configuration management | Auto-configure servers |
| **Git** | Version control | Track code changes |
| **GitHub/GitLab** | Git hosting platforms | Store code online |
| **Rollback** | Undo a deployment | Go back to previous version |
| **Blue-Green Deploy** | Two identical environments | Switch between A & B |
| **Canary Deploy** | Deploy to small % first | 5% users get new version |
| **Rolling Deploy** | Gradually replace instances | One instance at a time |
| **Webhook** | Trigger action on event | GitHub webhook → CI/CD |
| **GitOps** | Git as source of truth | Kubernetes reads from Git repo |

---

## 📊 Monitoring & Observability Terms

| Term | Definition | Example |
|------|-----------|---------|
| **Monitoring** | Checking system health | CPU usage, disk space |
| **Observability** | Understanding system behavior | Metrics, logs, traces |
| **Metric** | Quantified measurement | 80% CPU, 500 requests/sec |
| **Log** | Record of events | "User logged in at 2pm" |
| **Trace** | Path of request through system | Request → Service A → Service B |
| **Alert** | Notification when metric is bad | "CPU > 90%, notify admin" |
| **Dashboard** | Visual representation of metrics | Charts showing performance |
| **SLA** | Service Level Agreement | 99.9% uptime guarantee |
| **SLO** | Service Level Objective | 99.9% uptime target |
| **SLI** | Service Level Indicator | Measured uptime % |
| **RTO** | Recovery Time Objective | How fast to recover from failure |
| **RPO** | Recovery Point Objective | How much data loss acceptable |
| **Health Check** | Verify service is running | Ping endpoint, check response |
| **Latency** | Time for request to complete | 100ms response time |
| **Throughput** | How much work gets done | 1000 requests per second |
| **Bandwidth** | Data transfer rate | 100 Mbps connection |
| **Autoscaling** | Automatically add/remove resources | +2 instances when CPU > 80% |
| **Load Testing** | Simulate heavy traffic | Test with 10,000 concurrent users |

---

## 💰 Pricing Terms

| Term | Definition | Example |
|------|-----------|---------|
| **On-Demand** | Pay as you go (most expensive) | $0.10 per hour |
| **Reserved** | Commit 1-3 years, get discount | $0.06 per hour (40% off) |
| **Spot/Preemptible** | Cheap but can be interrupted | $0.02 per hour (80% off) |
| **Free Tier** | Complimentary services | 12 months AWS free |
| **Pay-Per-Use** | Billed for actual consumption | $0.01 per million requests |
| **Committed Use** | Like reserved but different terms | 1-3 year commitment |
| **Discount** | Percentage off list price | 30% discount with commitment |
| **Burst** | Temporary high usage allowed | Cheap baseline + burst pricing |
| **Rate Limit** | Max usage allowed | 1000 API calls per hour |
| **Egress** | Outbound data transfer (charged) | $0.12 per GB out |
| **Ingress** | Inbound data transfer (free) | Free incoming data |
| **Sustained Discount** | Auto discount for long-running | 25% off if running 24/7 |

---

## 🔄 Architecture Terms

| Term | Definition | Example |
|------|-----------|---------|
| **Scalability** | Ability to handle more load | Add more servers |
| **Horizontal Scale** | Add more instances (scale out) | 1 server → 10 servers |
| **Vertical Scale** | Make instance bigger (scale up) | t2.small → t2.xlarge |
| **Redundancy** | Multiple copies for backup | 3 replicas of data |
| **Failover** | Switch to backup on failure | Server1 down → use Server2 |
| **High Availability** | System is rarely down | 99.99% uptime |
| **Disaster Recovery** | Plan for major failures | Backup in different region |
| **Geo-Redundancy** | Backup in different geographic area | Data in US + Europe |
| **Latency** | Delay in response | 100ms = slow, 10ms = fast |
| **Throughput** | How much per second | 10,000 requests/sec |
| **Cache** | Store frequently accessed data | Redis cache layer |
| **Queue** | Buffer for asynchronous tasks | SQS queue for background jobs |
| **Microservices** | Small independent services | User service, Order service |
| **Monolith** | One large application | All code in one app |
| **Serverless** | Code runs without managing servers | Lambda, Cloud Functions |
| **Edge** | Data centers near users | CloudFront edge location |
| **CDN** | Deliver content from nearest server | Netflix cached at ISP |

---

## 🌐 Common Abbreviations Quick List

| Abbreviation | Meaning |
|-------------|---------|
| **API** | Application Programming Interface |
| **HTTP/HTTPS** | HyperText Transfer Protocol (Secure) |
| **DNS** | Domain Name System |
| **SSL/TLS** | Secure Sockets Layer / Transport Layer Security |
| **TCP/UDP** | Transmission Control Protocol / User Datagram Protocol |
| **IP** | Internet Protocol |
| **CORS** | Cross-Origin Resource Sharing |
| **REST** | Representational State Transfer |
| **JSON** | JavaScript Object Notation |
| **XML** | Extensible Markup Language |
| **YAML** | YAML Ain't Markup Language |
| **CLI** | Command Line Interface |
| **GUI** | Graphical User Interface |
| **SSH** | Secure Shell |
| **VPN** | Virtual Private Network |
| **VPC** | Virtual Private Cloud |
| **NAT** | Network Address Translation |
| **CDN** | Content Delivery Network |
| **SQL** | Structured Query Language |
| **NoSQL** | Non-Relational SQL |
| **JSON** | JavaScript Object Notation |
| **YAML** | YAML Ain't Markup Language |
| **TOML** | Tom's Obvious, Minimal Language |

---

## 🎓 Learning Tips

### Understanding New Terms
1. **Read the definition** in plain English
2. **See an example** to understand context
3. **Use it in a sentence** to reinforce
4. **Research the tool** that implements it

### Common Confusion
- **Instance ≠ Image**: Image is the template, instance is running
- **Bucket ≠ Container**: Bucket (AWS), Container (Azure)
- **CIDR ≠ IP**: CIDR is notation (10.0.0.0/16), IP is one address (10.0.0.1)
- **Snapshot ≠ Backup**: Snapshot is point-in-time copy, backup is restore point
- **Scalability ≠ Availability**: Scalability is handling load, availability is uptime

---

**Next Steps**:
- Go back to [INDEX.md](./INDEX.md) for organized learning
- Read platform-specific guides: [AWS.md](./AWS.md), [GCP.md](./GCP.md), [AZURE.md](./AZURE.md)
- Reference [SERVICE-MAPPING.md](./SERVICE-MAPPING.md) for service equivalents
