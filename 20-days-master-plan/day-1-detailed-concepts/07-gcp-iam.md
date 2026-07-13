# GCP IAM & Security - Complete Interview Guide

## Table of Contents
1. [IAM Overview](#iam-overview)
2. [Identity and Access Management](#identity-and-access-management)
3. [GCP Resource Hierarchy](#gcp-resource-hierarchy)
4. [IAM Roles](#iam-roles)
5. [Best Practices](#best-practices)
6. [Interview Questions](#interview-questions)

---

## IAM Overview

**IAM (Identity and Access Management)** is a framework for managing who (identity) can do what (permissions) on which resources in Google Cloud Platform.

### Core Components

```
IAM = Identity + Roles + Resources + Permissions
```

### Who (Identity)
- Google Accounts (employees, partners)
- Service Accounts (applications, VMs)
- Google Groups
- Cloud Identity domains

### What (Permissions)
- Specific actions: compute.instances.create, storage.buckets.delete
- Fine-grained control
- Organized by service

### Where (Resources)
- Compute Engine instances
- Cloud Storage buckets
- BigQuery datasets
- Cloud Databases

---

## Identity and Access Management

### 1. Google Accounts
- Email-based accounts (user@example.com)
- Used by individual people
- External users

```
Example: john.doe@gmail.com
Can have specific roles on resources
```

### 2. Service Accounts
- Special accounts for applications and VMs
- Has email address (app@project.iam.gserviceaccount.com)
- Uses cryptographic keys for authentication
- No password, uses credentials JSON

```json
{
  "type": "service_account",
  "project_id": "my-project",
  "private_key_id": "key123",
  "private_key": "-----BEGIN PRIVATE KEY-----",
  "client_email": "app@my-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

### 3. Google Groups
- Collections of users
- Manage permissions for multiple users at once
- Ideal for teams

```
Group: cloud-engineers@company.com
Members: alice@company.com, bob@company.com
Assign role once, affects all members
```

### 4. Cloud Identity Domains
- Managed Google identity system
- SAML/OIDC integration
- SSO support

---

## GCP Resource Hierarchy

GCP uses a hierarchical structure for resource organization and policy inheritance:

```
Organization
    ↓
Folders (optional)
    ├─ Folder 1
    │   ├─ Project A
    │   ├─ Project B
    └─ Folder 2
        └─ Project C
            ├─ Compute Instances
            ├─ Storage Buckets
            ├─ Databases
            └─ Other Resources
```

### Organization
- Top-level container
- Policies apply to all resources below
- Created automatically when sign up for GCP

```
Organization: company.com
- All projects
- All folders
- All resources
```

### Folders
- Group projects by department/team/environment
- Policies inherited by child projects
- Optional

```
Folder: Production
├─ Project: api-prod
├─ Project: web-prod

Folder: Development
├─ Project: api-dev
├─ Project: web-dev
```

### Projects
- Billing boundary
- Container for resources
- Required for resource creation

```
Project: my-app-prod
- 2 GCE instances
- 3 Cloud Storage buckets
- 1 Cloud SQL database
```

### Resources
- Actual GCP services
- Managed within projects
- Inherit parent policies

```
Resources in Project:
- compute.googleapis.com/instances
- storage.googleapis.com/buckets
- sqladmin.googleapis.com/instances
```

### Policy Inheritance

```
Organization Policy
    ↓ (inherited by all below)
    └─ Folder Policy
        ↓ (inherited by projects)
        └─ Project Policy
            ↓ (inherited by resources)
            └─ Resource Policy
```

---

## IAM Roles

### Three Role Types

#### 1. Primitive Roles (Legacy)
- Broad permissions
- Not recommended for new projects
- Lack granularity

```
Owner
- Full control including billing
- Use: Organization administration

Editor
- Create/modify/delete resources
- Use: Developers on shared projects

Viewer
- Read-only access
- Use: Auditors, monitoring
```

#### 2. Predefined Roles
- Service-specific roles
- Managed by Google
- Recommended approach

```
compute.admin
- Full control of Compute Engine
- Includes: compute.instances.*, compute.disks.*

storage.objectAdmin
- Full control of Cloud Storage objects
- Includes: storage.objects.*, storage.buckets.*

monitoring.viewer
- View monitoring dashboards
- Includes: monitoring.timeSeries.list, monitoring.dashboards.list

cloudsql.admin
- Full control of Cloud SQL
- Includes: cloudsql.instances.*, cloudsql.databases.*
```

#### 3. Custom Roles
- Created by user
- Include specific permissions
- Maximum 50 permissions per role

```
Role: custom-developer
Permissions:
- compute.instances.get
- compute.instances.list
- storage.buckets.get
- monitoring.timeSeries.list
```

### Common Roles by Use Case

```
Web Developer:
- roles/compute.instanceAdmin (manage VMs)
- roles/storage.objectAdmin (manage Cloud Storage)

Data Analyst:
- roles/bigquery.dataViewer (read BigQuery datasets)
- roles/monitoring.viewer (view metrics)

DBA:
- roles/cloudsql.admin (manage Cloud SQL)
- roles/compute.instanceAdmin (manage DB VMs)

DevOps Engineer:
- roles/container.admin (manage GKE)
- roles/compute.admin (manage all compute resources)
- roles/iam.securityAdmin (manage IAM)
```

### Role Binding

```
Binding = (Identity + Role + Resource)
```

```
Example:
alice@company.com + roles/compute.admin + project/my-app-prod
= alice can administer all compute resources in my-app-prod project

bob@company.com + roles/storage.objectViewer + bucket/my-bucket
= bob can view objects in my-bucket
```

---

## Principle of Least Privilege

**Security Best Practice:** Give users/services only the minimum permissions needed to perform their tasks.

### Bad Approach
```
Developer Account:
- Organization Editor
- Can modify any resource in organization
- Can change billing
- Too many permissions!
```

### Good Approach
```
Developer Account:
- Project Editor (only on dev-project)
- Can modify resources in dev-project only
- Cannot access prod-project
- Cannot change billing
- Minimum necessary permissions
```

### Implementation Example

```
Service Account for CI/CD Pipeline:
NOT: roles/editor (too broad)

INSTEAD:
- roles/compute.instanceAdmin (manage instances)
- roles/storage.admin (manage artifacts)
- roles/container.developer (push to Container Registry)

Or Custom Role with only:
- compute.instances.create
- compute.instances.delete
- storage.buckets.get
- storage.objects.get/list/create
- container.images.create
```

---

## Best Practices

### 1. Use Service Accounts for Applications
```
❌ BAD - Application uses user credentials
- Shares user account password
- Can't revoke independently
- Auditing difficult

✓ GOOD - Application uses service account
- Separate identity
- Can revoke anytime
- Better auditing
```

### 2. Use Folders for Organization
```
✓ GOOD Structure:
Organization
├─ Production
│  ├─ api-prod
│  ├─ web-prod
├─ Development
│  ├─ api-dev
│  ├─ web-dev
```

### 3. Use Cloud IAM Conditions
```
Role + Conditions = More granular control
Example:
- Grant Editor role only during business hours
- Grant access only from specific IP ranges
```

### 4. Audit with Cloud Audit Logs
```
Log all IAM changes:
- Who accessed what
- When
- From where
- What they did
```

### 5. Separate Service Accounts by Function
```
✓ GOOD - Different accounts for different purposes
- app-deployment (only push artifacts)
- app-runtime (only read config, databases)
- ci-pipeline (build and test)

NOT:
- one-account-for-everything (violates least privilege)
```

---

## Interview Questions

### Q1: What is IAM in GCP?
**Answer:** IAM (Identity and Access Management) is a framework for managing who (identity) can do what (permissions) on which resources in GCP. It controls access using roles assigned to identities on resources.

### Q2: What are the three types of roles?
**Answer:**
1. **Primitive Roles** - Owner, Editor, Viewer (legacy, not recommended)
2. **Predefined Roles** - Service-specific roles maintained by Google
3. **Custom Roles** - User-created roles with specific permissions

### Q3: Explain GCP Resource Hierarchy
**Answer:** Organization → Folders → Projects → Resources. Policies are inherited down the hierarchy. Organization policies apply to all resources, folder policies apply to child projects, etc.

### Q4: What is a Service Account?
**Answer:** A special account for applications and VMs. It has an email address and uses cryptographic keys for authentication. Unlike user accounts, service accounts don't have passwords and are ideal for app-to-GCP authentication.

### Q5: What is the Principle of Least Privilege?
**Answer:** Give users/services only the minimum permissions needed to perform their tasks. Enhances security by limiting damage if credentials are compromised.

### Q6: What's the difference between a role and permissions?
**Answer:** A permission is a specific action (e.g., compute.instances.create). A role is a collection of permissions. Roles are assigned to identities, not individual permissions.

### Q7: How do you grant a user access to a resource?
**Answer:** Create an IAM binding:
1. Identify the identity (user/service account)
2. Choose the role
3. Select the resource
4. Bind: (Identity, Role, Resource)

### Q8: Why use service accounts instead of user accounts?
**Answer:**
- Can revoke anytime without affecting users
- Better auditing and traceability
- Separate credentials
- No password sharing
- Can be created/deleted easily

---

## Key Takeaways

1. **IAM** = Identity + Role + Resource
2. **Identities** = Users, Service Accounts, Groups
3. **Roles** = Predefined or Custom
4. **Hierarchy** = Organization → Folders → Projects → Resources
5. **Principle of Least Privilege** = Minimum necessary permissions
6. **Service Accounts** = Best for applications
7. **Inheritance** = Child resources inherit parent policies

---

**IAM Security is critical for GCP projects!**
