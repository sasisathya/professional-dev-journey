# Azure (Microsoft Azure) — Complete Guide

**Enterprise Standard** | **23% market share** | **Microsoft Stack** | **Hybrid Cloud**

---

## 📖 What is Azure?

Microsoft Azure is Microsoft's cloud platform. It's the go-to choice for **enterprises using Microsoft products** (Office 365, SQL Server, SharePoint, .NET, Active Directory).

Think of it as **the enterprise cloud**:
- **Compute**: Virtual machines (VMs), serverless functions (Azure Functions)
- **Databases**: SQL Server, PostgreSQL, MySQL, Cosmos DB (NoSQL)
- **App Services**: Auto-scaling web apps, containers, Kubernetes
- **Microsoft Integration**: Works seamlessly with Office 365, Teams, Active Directory
- **Hybrid**: Unique ability to run on-premises & in cloud
- **Enterprise Features**: Compliance certifications, Advanced security

---

## 🔧 Core Services (What You'll Use Most)

### Compute
| Service | Use Case | Pricing |
|---------|----------|---------|
| **Virtual Machines** | VMs (Windows, Linux) | Per hour + storage |
| **App Service** | Auto-scaling web apps, APIs | Per instance hour |
| **Azure Functions** | Serverless functions (event-driven) | Per execution + GB-second |
| **Container Instances** | Run containers (no orchestration) | Per container hour |
| **Azure Kubernetes Service (AKS)** | Managed Kubernetes | Per cluster + per node hour |

**Best for**: Enterprise workloads, Windows servers, .NET applications

### Storage
| Service | Use Case | Pricing |
|---------|----------|---------|
| **Blob Storage** | Object storage (like S3) | Per GB stored + per request |
| **Managed Disks** | Block storage (like EBS) | Per GB-month |
| **File Shares** | Shared SMB file storage (for Windows) | Per GB-month |
| **Archive Storage** | Long-term backups (very cheap) | Per GB-month |

**Best for**: Windows-centric workloads, legacy apps, enterprise data

### Databases
| Service | Use Case | Pricing |
|---------|----------|---------|
| **Azure SQL Database** | SQL Server (hosted) | Per DTU or vCore |
| **SQL Server on VMs** | Full SQL Server control | Per VM + licensing |
| **Cosmos DB** | NoSQL (documents, key-value, graphs) | Per request or provisioned |
| **Database for PostgreSQL** | Managed PostgreSQL | Per instance hour + storage |
| **Database for MySQL** | Managed MySQL | Per instance hour + storage |

**Best for**: SQL Server workloads, enterprise data, complex queries

### App Services
| Service | Use Case |
|---------|----------|
| **App Service** | Host web apps, APIs (auto-scaling) |
| **Logic Apps** | Workflow automation (no-code) |
| **API Management** | Manage APIs, rate limiting, versioning |
| **Service Bus** | Enterprise messaging |

**Best for**: Enterprise workflows, Microsoft stack, complex integrations

### Additional Services
- **Azure DevOps**: CI/CD, project management
- **Azure Monitor**: Monitoring & logging
- **Azure Security Center**: Security & compliance
- **Azure Backup**: Automated backups
- **Azure Site Recovery**: Disaster recovery

---

## 💰 Azure Pricing Model

### How You Pay
1. **Compute**: Per hour (VMs), per unit of work (Functions)
2. **Storage**: Per GB-month
3. **Data Transfer**: Inbound free, outbound charged
4. **Database**: Per DTU (Database Transaction Unit) or vCore

### Cost Optimization
- **Reserved Instances**: 1-3 year commitment = 30-70% discount
- **Spot VMs**: Bid for unused capacity = 70-90% cheaper
- **Hybrid Benefit**: Bring your own Windows/SQL Server licenses
- **Free Tier**: 12 months free + always-free services

### Example Monthly Costs
- **Small app** (1 VM, 100GB storage): ~$25/month
- **Medium app** (App Service, SQL Database, 1TB): ~$200/month
- **Large app** (multi-region, Cosmos DB): $5000+/month

---

## ✅ Strengths

1. **Best for Microsoft stack**: Seamless integration with Office 365, Active Directory, SQL Server
2. **Hybrid capabilities**: Can run on-premises & in cloud (unique feature)
3. **Enterprise security**: Advanced compliance, data residency, privacy
4. **Strong SQL Server support**: If you use SQL Server, Azure is natural choice
5. **Developer tools**: Excellent .NET support, Visual Studio integration
6. **Enterprise adoption**: Large enterprises prefer Azure
7. **Compliance**: Many compliance certifications (HIPAA, SOC 2, PCI-DSS)
8. **Cost with licenses**: If you have Windows/SQL licenses, Azure is cheaper
9. **Support**: Excellent enterprise support
10. **Disaster recovery**: Built-in geographic redundancy

---

## ❌ Weaknesses

1. **Overwhelming naming**: "Azure App Service", "Azure Virtual Machines" (confusing UI)
2. **Complex pricing**: DTU vs vCore, different pricing models per service
3. **Learning curve**: Steeper than GCP, similar to AWS
4. **Smaller data/ML ecosystem**: Not as strong as GCP for data science
5. **Less containerization focus**: Kubernetes support good, but not best-in-class
6. **Vendor lock-in**: Cosmos DB, Azure SQL proprietary features
7. **Console UI**: Harder to navigate than GCP
8. **Smaller startup community**: Less popular in startup world
9. **Documentation**: Good but less comprehensive than AWS
10. **Cold starts**: Azure Functions have startup delays

---

## 🚀 Getting Started with Azure

### Step 1: Create Account
1. Go to [azure.microsoft.com](https://azure.microsoft.com)
2. Click "Start free"
3. Sign in with Microsoft account (Outlook, Hotmail, Office 365)
4. Provide credit card (won't charge unless you exceed free tier)
5. Verify phone number

### Step 2: Create Resource Group
```
Azure Portal → Resource groups
├─ Create new resource group
├─ Name it (e.g., "my-first-app")
├─ Choose region (East US, West Europe, etc.)
└─ Click Create
```

### Step 3: Assign Permissions (IAM)
```
Azure Portal → Resource groups → [Your RG]
├─ Access control (IAM)
├─ Add role assignment
├─ Assign "Contributor" role to yourself
└─ Save
```

### Step 4: Install Azure CLI
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login
# Follow browser prompts

# Set default subscription
az account set --subscription YOUR_SUBSCRIPTION_ID

# List subscriptions
az account list

# Test it works
az vm list
```

### Step 5: Deploy Your First App
See [DEPLOYMENT-AZURE.md](./DEPLOYMENT-AZURE.md)

---

## 🎓 Learning Path

### Week 1: Basics
- [ ] Create a virtual machine
- [ ] Upload file to Blob Storage
- [ ] Create Azure SQL database
- [ ] Use Azure CLI for basic operations

### Week 2: App Services
- [ ] Deploy web app to App Service (auto-scaling)
- [ ] Create REST API
- [ ] Store data in Cosmos DB
- [ ] Use Azure Functions (serverless)

### Week 3: Advanced
- [ ] Set up Load Balancer
- [ ] Create Kubernetes cluster (AKS)
- [ ] Set up CI/CD with Azure DevOps
- [ ] Enable monitoring with Azure Monitor

### Week 4: Optimization
- [ ] Estimate costs, optimize spending
- [ ] Set up alerts & monitoring
- [ ] Plan disaster recovery
- [ ] Review Well-Architected Framework

---

## 📚 Key Concepts

### Resource Groups
- Container for related resources
- All resources must be in a resource group
- Used for organization, permissions, billing
- Cannot be nested

### Regions & Availability Zones
- **Region**: Geographic area (East US, West Europe, Southeast Asia)
- **Availability Zone**: Data center within region (1, 2, 3)
- **Why?** Lower latency, compliance, disaster recovery

### Virtual Networks (VNets)
- Your own private network
- Contains subnets
- Controls traffic with Network Security Groups (NSGs)
- Similar to AWS VPC

### Network Security Groups (NSGs)
- Firewalls (inbound/outbound rules)
- Attached to subnets or individual resources
- Controls protocols, ports, sources

### Service Principal
- Machine identity for apps
- Used for: CI/CD, server-to-server auth
- Like AWS IAM roles or GCP service accounts

### App Service Plan
- Defines compute resources for App Service
- F1 (free), B (basic), S (standard), P (premium)
- Shared, isolated, or dedicated

---

## 🔐 Security Best Practices

1. **Enable Multi-Factor Authentication**: For all accounts
2. **Use Service Principals**: Never embed credentials in code
3. **Principle of least privilege**: Minimal permissions per role
4. **Enable Network Security Groups**: Control inbound/outbound traffic
5. **Use Azure Key Vault**: Store secrets, certificates, keys
6. **Enable Activity Log**: Audit all API calls
7. **Use Managed Identities**: For service-to-service authentication
8. **Enable Azure Defender**: Advanced threat detection
9. **Encrypt data at rest**: Use Transparent Data Encryption (TDE)
10. **Encrypt data in transit**: Use HTTPS, TLS

---

## 📊 Azure Terminology Cheat Sheet

| Term | Means |
|------|-------|
| **VM** | Virtual machine |
| **VNet** | Virtual network (like VPC) |
| **NSG** | Network security group (firewall) |
| **RG** | Resource group (container) |
| **App Service** | Managed web app/API hosting |
| **Cosmos DB** | NoSQL database |
| **Key Vault** | Secrets management |
| **AKS** | Azure Kubernetes Service |
| **DTU** | Database Transaction Unit |
| **vCore** | Virtual CPU |
| **SKU** | Stock Keeping Unit (pricing tier) |
| **RBAC** | Role-Based Access Control |
| **AAD** | Azure Active Directory |
| **Subscription** | Billing container |

---

## 🎯 Real-World Example: Deploy a Web App

### Architecture
```
Users → Application Gateway (Load Balancer)
     → App Service (Auto-scaling web apps)
     → Azure SQL Database
     → Blob Storage (Static files)
```

### Services Used
- **Application Gateway**: Load balance & WAF
- **App Service**: Deploy web app (auto-scaling)
- **Azure SQL Database**: SQL Server database
- **Blob Storage**: Store images, backups
- **Azure Monitor**: Monitor performance
- **Azure DevOps**: CI/CD pipeline

### Estimated Cost (per month)
- App Service (B1 Standard): $15
- Azure SQL Database (Basic): $5
- Blob Storage (100GB): $1.15
- Data transfer: ~$5
- **Total**: ~$26/month

---

## 🔗 Resources

### Official
- [Azure Documentation](https://docs.microsoft.com/azure)
- [Azure Free Account](https://azure.microsoft.com/free)
- [Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator)

### Learning
- [Microsoft Learn](https://learn.microsoft.com) — Official courses (free)
- [Azure Developer Associate Course](https://learn.microsoft.com/certifications/azure-developer-associate)
- [Pluralsight Azure Courses](https://www.pluralsight.com)
- [YouTube: Azure Tuesday](https://www.youtube.com/c/AzureTuesday)

### Certifications
- **Azure Fundamentals (AZ-900)** — Beginner
- **Azure Developer Associate (AZ-204)** — Intermediate
- **Azure Solutions Architect Expert (AZ-305)** — Advanced

---

## 📝 Summary

| Aspect | Rating |
|--------|--------|
| **Ease of Use** | ⭐⭐⭐ (Medium) |
| **Learning Curve** | ⭐⭐⭐ (Medium) |
| **Scalability** | ⭐⭐⭐⭐⭐ |
| **Pricing** | ⭐⭐⭐⭐ (Good with licenses) |
| **Support** | ⭐⭐⭐⭐⭐ (Best enterprise) |
| **Market Share** | ⭐⭐⭐⭐ |
| **Documentation** | ⭐⭐⭐⭐ |

**Best For**: Enterprises, Microsoft stack (.NET, SQL Server, Office 365), hybrid cloud, compliance-heavy workloads

**Not Best For**: Startups (less popular), data science (weak ML), minimal infrastructure (overkill)

**Next**: Read [COMPARISON.md](./COMPARISON.md) to compare all three, or go to [DEPLOYMENT-AZURE.md](./DEPLOYMENT-AZURE.md) to start hands-on.
