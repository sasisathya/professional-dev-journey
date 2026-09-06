# Cloud (AWS & GCP) - Professional Interview Guide

## Table of Contents
1. [Cloud Fundamentals & Mental Models](#cloud-fundamentals--mental-models)
2. [AWS vs GCP: The Complete Service Map](#aws-vs-gcp-the-complete-service-map)
3. [Account Structure & Landing Zones](#account-structure--landing-zones)
4. [IAM Deep Dive](#iam-deep-dive)
5. [Networking Deep Dive](#networking-deep-dive)
6. [Compute: Choosing the Right Abstraction](#compute-choosing-the-right-abstraction)
7. [Storage & Storage Classes](#storage--storage-classes)
8. [Databases](#databases)
9. [Serverless Deep Dive](#serverless-deep-dive)
10. [Containers & Kubernetes in the Cloud](#containers--kubernetes-in-the-cloud)
11. [Infrastructure as Code](#infrastructure-as-code)
12. [Observability](#observability)
13. [Security](#security)
14. [Reliability & Disaster Recovery](#reliability--disaster-recovery)
15. [Cost Optimization](#cost-optimization)
16. [The Well-Architected Framework](#the-well-architected-framework)
17. [Production War Stories](#production-war-stories)
18. [Common Pitfalls](#common-pitfalls)
19. [Junior vs Senior](#junior-vs-senior)
20. [Interview Questions](#interview-questions)

---

## Cloud Fundamentals & Mental Models

### What Cloud Actually Is

Cloud computing is renting someone else's computers through an API, with the billing meter running per second. Everything else — elasticity, global reach, managed services — falls out of that one property: **the infrastructure is programmable and the unit of purchase is small**.

The interview-relevant framing is not "what is the cloud." It is: *what did the cloud change about how you design systems?*

Three things changed:

1. **Capacity is elastic, so over-provisioning is a choice, not a necessity.** On-prem you bought for peak plus 40% headroom and lived with 15% average utilization. In cloud, if you are running at 15% utilization you are burning money on purpose.
2. **Failure is a first-class design input.** AWS publishes an EC2 SLA of 99.99% for a Region and 99.5% for a single instance. A single instance *will* die. You design around it or you get paged.
3. **The bill is a distributed system.** Costs are emitted by hundreds of independently-metered dimensions (data processed, requests, GB-months, IOPS, cross-AZ bytes). Nobody accidentally spends $40k on-prem. In cloud it takes one bad route table.

### The Shared Responsibility Model

This gets asked in almost every cloud interview and most candidates give a shallow answer.

```
┌──────────────────────────────────────────────────────────────────┐
│                    SHARED RESPONSIBILITY                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  CUSTOMER   │ Data classification & encryption choices            │
│  (security  │ IAM policies, roles, key rotation                   │
│   IN the    │ OS patching (EC2/GCE only)                          │
│   cloud)    │ Network config: SGs, NACLs, firewall rules          │
│             │ Application code, dependencies, secrets handling    │
│─────────────┼─────────────────────────────────────────────────────│
│             │ Managed service patching (RDS engine, Lambda runtime)│
│  PROVIDER   │ Hypervisor, host OS                                 │
│  (security  │ Physical datacenter, power, cooling                 │
│   OF the    │ Network fabric, undersea cables                     │
│   cloud)    │ Hardware decommissioning / disk destruction         │
└──────────────────────────────────────────────────────────────────┘
```

The line **moves left as you go up the abstraction stack**. On EC2 you patch the kernel. On Fargate you don't have a kernel to patch but you still own the container image's CVEs. On Lambda you own only your code and its dependency tree. On S3 you own only the bucket policy — and 100% of every public S3 bucket breach in the last decade was a customer-side failure, not an AWS one.

**The senior framing:** "Moving up the stack doesn't reduce your responsibility, it *concentrates* it. On Lambda my entire attack surface is IAM plus my dependency tree. That's fewer things to get wrong but each one is now higher leverage."

### Regions, AZs, and Zones

| Concept | AWS | GCP | What it actually is |
|---|---|---|---|
| Region | `us-east-1` | `us-central1` | Geographic area, own control plane, ~independent failure domain |
| Availability Zone | `us-east-1a` | `us-central1-a` | 1+ discrete datacenters, own power/cooling/network |
| Inter-AZ latency | < 2ms typical (~0.5ms) | < 2ms typical | Fast enough for synchronous DB replication |
| Inter-region latency | 60-80ms us-east-1↔eu-west-1 | similar | Too slow for synchronous replication |
| Edge locations | 600+ CloudFront PoPs | 180+ Google PoPs | CDN / anycast termination |

Critical detail candidates miss: **AWS AZ names are randomized per account.** `us-east-1a` in your account is a different physical AZ from `us-east-1a` in mine. AWS did this so everyone wouldn't pile into "a". Use **AZ IDs** (`use1-az1`) when you need to correlate across accounts — for example when a partner shares a VPC subnet or when you're debugging a cross-account latency issue.

```bash
# AWS: map your account's AZ names to the real physical AZ IDs
aws ec2 describe-availability-zones \
  --region us-east-1 \
  --query 'AvailabilityZones[].{Name:ZoneName,Id:ZoneId}' \
  --output table
# ┌──────────────┬────────────┐
# │ us-east-1a   │ use1-az4   │  <-- physical AZ differs per account
# │ us-east-1b   │ use1-az6   │
# └──────────────┴────────────┘

# GCP: zones are globally consistent, no remapping
gcloud compute zones list --filter="region:us-central1"
```

GCP does not randomize zones — `us-central1-a` is the same physical zone in every project. That's a real operational simplification.

**GCP has global resources AWS doesn't.** A GCP VPC is a *global* object: one VPC spans every region, with regional subnets inside it. An AWS VPC is regional; to connect regions you need peering or Transit Gateway. This is one of the genuinely significant architectural differences between the two clouds and it comes up constantly in multi-region design questions.

### Service Models — And Why the Taxonomy Barely Matters

| Model | You manage | Provider manages | AWS example | GCP example |
|---|---|---|---|---|
| IaaS | OS, runtime, app, data, scaling | Virtualization, hardware | EC2, EBS | Compute Engine, PD |
| CaaS | Container image, app, scaling policy | Node OS, orchestration plane | ECS/EKS, Fargate | GKE, Cloud Run |
| PaaS | App code, config | Runtime, OS, scaling | Elastic Beanstalk, App Runner | App Engine |
| FaaS | Function code | Everything else | Lambda | Cloud Functions |
| SaaS | Data, config | Everything | WorkMail | Workspace |

Nobody in a real design review says "let's use PaaS." They say "Cloud Run, because we need scale-to-zero, we already have a container, and we don't want to run a control plane." Use the taxonomy to orient, then argue in concrete services.

---

## AWS vs GCP: The Complete Service Map

This is the table interviewers implicitly test when they say "you've worked in AWS, we're on GCP — is that a problem?" The correct answer is no, and this table is why.

### Compute

| Capability | AWS | GCP | Notes that matter |
|---|---|---|---|
| VMs | EC2 | Compute Engine | GCE has **custom machine types** (arbitrary vCPU/RAM); EC2 has fixed families. GCE has **live migration** during host maintenance — EC2 reboots you. |
| Discounted VMs | Reserved Instances, Savings Plans | Committed Use Discounts (CUD) | AWS Savings Plans are $/hr commitments (flexible across families); GCP CUD is resource-based (vCPU/RAM) or spend-based. GCP also gives **automatic sustained-use discounts** with zero commitment — up to 30% for a full month. |
| Interruptible | Spot (up to 90% off, 2-min warning) | Spot VMs / Preemptible (60-91% off, 30-sec warning, preemptible capped at 24h) | Spot price is market-driven; GCP Spot pricing is fixed per machine type. |
| Autoscaling | EC2 Auto Scaling Group | Managed Instance Group (MIG) | MIGs do autohealing + rolling updates natively; ASGs need Instance Refresh. |
| Container orchestration (native) | ECS | (none — Cloud Run is closest) | ECS has no GCP equivalent. GCP bets entirely on K8s + Knative. |
| Managed Kubernetes | EKS | GKE | GKE is materially better: Autopilot, faster upgrades, native workload identity. EKS control plane costs $0.10/hr ($73/mo); GKE Standard charges $0.10/hr per cluster too (one zonal cluster free per billing account historically). |
| Serverless containers | Fargate (on ECS/EKS) | Cloud Run | Cloud Run scales to zero; Fargate does not (min 1 task). Cloud Run is the better product, full stop. |
| FaaS | Lambda | Cloud Functions (gen2 = Cloud Run under the hood) | |
| PaaS | Elastic Beanstalk, App Runner | App Engine (Standard/Flex) | |
| Batch | AWS Batch | Cloud Batch / Dataflow | |

### Storage

| Capability | AWS | GCP |
|---|---|---|
| Object storage | S3 | Cloud Storage (GCS) |
| Block storage | EBS (gp3, io2, st1, sc1) | Persistent Disk (pd-balanced, pd-ssd, pd-extreme), Hyperdisk |
| Managed NFS | EFS | Filestore |
| Managed Lustre/HPC | FSx | Parallelstore |
| Archive | S3 Glacier Deep Archive | GCS Archive |
| Hybrid/on-prem gateway | Storage Gateway | Storage Transfer Service / Transfer Appliance |
| Bulk physical transfer | Snowball / Snowmobile | Transfer Appliance |

The important semantic difference: **GCS is a single product with per-object storage classes and one API.** S3 is a single product too, but S3 Glacier retrieval requires an explicit `RestoreObject` call and a wait (minutes to 12 hours), whereas GCS Archive objects are **immediately readable** — you just pay a retrieval fee. That changes archive architecture. On GCS you can point a read path at Archive-class data and it just works (expensively). On S3 Glacier you must build an async restore workflow.

### Databases

| Capability | AWS | GCP |
|---|---|---|
| Managed relational | RDS (MySQL, Postgres, MariaDB, Oracle, SQL Server) | Cloud SQL (MySQL, Postgres, SQL Server) |
| Cloud-native relational | Aurora (MySQL/Postgres-compatible) | AlloyDB (Postgres-compatible) |
| Globally-distributed SQL | Aurora Global Database (async, ~1s lag) | **Cloud Spanner** (synchronous, external consistency, TrueTime) |
| Key-value NoSQL | DynamoDB | Firestore (document) / Bigtable (wide-column) |
| Wide-column | Keyspaces (Cassandra) | Bigtable |
| Document | DocumentDB (Mongo-compatible) | Firestore |
| In-memory cache | ElastiCache (Redis/Memcached), MemoryDB | Memorystore (Redis/Memcached) |
| Data warehouse | Redshift | BigQuery |
| Graph | Neptune | (none native) |
| Time series | Timestream | Bigtable + patterns |
| Ledger | QLDB (deprecated 2025) | (none) |

**Spanner has no AWS equivalent and it matters.** Spanner gives you horizontally-scalable, strongly-consistent, multi-region SQL with external consistency guaranteed by GPS+atomic-clock-backed TrueTime. Aurora Global Database is async replication with ~1 second lag and a manual/managed failover. If an interviewer asks "how would you build a globally consistent financial ledger," on GCP the answer is Spanner; on AWS you're building it yourself out of DynamoDB global tables (last-writer-wins, eventually consistent) plus application-level conflict resolution, or you're pinning writes to one region.

**BigQuery vs Redshift is the other big asymmetry.** BigQuery is genuinely serverless: no cluster, storage and compute billed separately, $6.25/TiB scanned on-demand (or slot reservations). Redshift Serverless exists now but Redshift's heritage is a provisioned cluster you size and manage. For "we have 500TB of logs and query them twice a day," BigQuery wins on cost and operational burden by a wide margin.

### Networking

| Capability | AWS | GCP |
|---|---|---|
| Virtual network | VPC (**regional**) | VPC (**global**) |
| Subnet | Subnet (**zonal/AZ-scoped**) | Subnet (**regional**, spans all zones) |
| L7 load balancer | ALB (regional) | Global External HTTP(S) LB (**anycast, single global IP**) |
| L4 load balancer | NLB | Network LB / Internal TCP-UDP LB |
| CDN | CloudFront | Cloud CDN / Media CDN |
| DNS | Route 53 | Cloud DNS |
| Private connectivity to services | VPC Endpoints / PrivateLink | Private Service Connect |
| VPC-to-VPC | VPC Peering, Transit Gateway | VPC Peering, Network Connectivity Center, **Shared VPC** |
| Dedicated on-prem link | Direct Connect | Cloud Interconnect (Dedicated/Partner) |
| VPN | Site-to-Site VPN | Cloud VPN (HA VPN) |
| Instance firewall | Security Groups (stateful) | VPC Firewall Rules (stateful, network-scoped w/ target tags) |
| Subnet firewall | Network ACLs (stateless) | Hierarchical Firewall Policies (still stateful) |
| DDoS/WAF | Shield + WAF | Cloud Armor |
| Egress to internet from private | NAT Gateway (per-AZ, per-GB charge) | Cloud NAT (regional, **no per-GB processing charge**) |

Two differences that change designs:

**1. GCP's global HTTP(S) load balancer uses a single anycast IP.** One IP, advertised from every Google PoP, routing to the nearest healthy backend in any region. On AWS the equivalent is CloudFront + Route 53 latency routing + regional ALBs — three services and a DNS-propagation-shaped failover delay. GCP does it in one resource with sub-second failover. This is the single most compelling GCP networking feature.

**2. GCP has no per-GB NAT data-processing charge.** AWS NAT Gateway charges **$0.045/GB processed** on top of $0.045/hr. Cloud NAT charges per-VM-hour plus egress (no separate processing fee). At 100 TB/month of NAT traffic that's a **$4,500/month** difference for the exact same architecture. This is the #1 surprise-bill generator in AWS and I have seen it burn four different organizations.

### Messaging, Streaming, Integration

| Capability | AWS | GCP |
|---|---|---|
| Queue | SQS (Standard + FIFO) | Pub/Sub (+ Cloud Tasks for HTTP fan-out) |
| Pub/sub topic | SNS | Pub/Sub |
| Event bus / router | EventBridge | Eventarc |
| Kafka | MSK | Managed Service for Kafka / Confluent |
| Streaming ingest | Kinesis Data Streams | Pub/Sub (+ Dataflow) |
| Stream processing | Kinesis Data Analytics / Flink | Dataflow (Apache Beam) |
| Workflow orchestration | Step Functions | Workflows / Cloud Composer (Airflow) |
| ETL | Glue | Dataflow / Dataproc / Data Fusion |

**SQS and Pub/Sub are not the same shape and candidates conflate them.** SQS is a *queue*: one consumer group, messages deleted after ack, visibility timeout semantics. SNS is *fan-out*. Pub/Sub is both: a topic can have N subscriptions, each subscription behaves like an independent queue with its own ack state. So the AWS pattern "SNS topic → 3 SQS queues → 3 consumers" collapses into "1 Pub/Sub topic → 3 subscriptions" on GCP.

Ordering: SQS FIFO gives strict ordering within a message group, capped at 300 TPS (3,000 with batching) per FIFO queue by default. Pub/Sub gives ordering **per ordering key** and scales further, but ordering costs you latency. Neither gives you global total ordering — if a candidate claims it does, that's a red flag.

### Security, Identity, Ops

| Capability | AWS | GCP |
|---|---|---|
| Identity | IAM (policy-document based) | Cloud IAM (**role + resource-hierarchy based**) |
| Org management | AWS Organizations, SCPs | Resource Manager, Org Policy Constraints |
| Secrets | Secrets Manager ($0.40/secret/mo), SSM Parameter Store (free tier) | Secret Manager ($0.06/version/mo) |
| KMS | AWS KMS ($1/key/mo, $0.03/10k requests) | Cloud KMS ($0.06/key version/mo) |
| Audit log | CloudTrail | Cloud Audit Logs |
| Config/compliance | AWS Config | Security Command Center, Policy Intelligence |
| Threat detection | GuardDuty | Security Command Center Premium |
| Metrics/logs | CloudWatch | Cloud Monitoring + Cloud Logging |
| Tracing | X-Ray | Cloud Trace |
| Profiling | CodeGuru Profiler | Cloud Profiler |
| Cost management | Cost Explorer, CUR | Cloud Billing export → BigQuery |

**The IAM model difference is the most important thing in this entire document and Section 4 covers it properly.**

---

## Account Structure & Landing Zones

Before any of the service detail matters, you need the container. Every organization above ~20 engineers ends up here, and "how do you structure accounts?" is a standard staff-level interview question.

### The Multi-Account / Multi-Project Model

```
AWS ORGANIZATION                          GCP ORGANIZATION
┌────────────────────────────────┐        ┌────────────────────────────────┐
│  Management (payer) Account    │        │  Organization (from Cloud      │
│  - Billing consolidation       │        │   Identity / Workspace domain) │
│  - Organizations / SCPs        │        │  - Org Policy constraints      │
│  - NO WORKLOADS. EVER.         │        │  - Billing account attached    │
└───────────────┬────────────────┘        └───────────────┬────────────────┘
                │                                          │
    ┌───────────┼───────────┐                 ┌────────────┼────────────┐
    ↓           ↓           ↓                 ↓            ↓            ↓
┌────────┐ ┌────────┐ ┌──────────┐      ┌────────┐  ┌─────────┐  ┌──────────┐
│  OU:   │ │  OU:   │ │   OU:    │      │Folder: │  │ Folder: │  │ Folder:  │
│Security│ │ Infra  │ │Workloads │      │Security│  │  Infra  │  │Workloads │
└───┬────┘ └───┬────┘ └────┬─────┘      └───┬────┘  └────┬────┘  └────┬─────┘
    │          │           │                 │            │            │
    ↓          ↓     ┌─────┴─────┐           ↓            ↓      ┌─────┴─────┐
┌────────┐ ┌──────┐ ↓           ↓      ┌─────────┐ ┌────────┐   ↓           ↓
│log-arch│ │shared│ ┌────┐  ┌────────┐ │audit-prj│ │net-prj │ ┌──────┐ ┌────────┐
│security│ │ net  │ │prod│  │non-prod│ │scc-prj  │ │dns-prj │ │prod- │ │dev-app │
│  tool  │ │  CI  │ │ OU │  │   OU   │ └─────────┘ └────────┘ │ app  │ │stg-app │
└────────┘ └──────┘ └─┬──┘  └───┬────┘                        └──────┘ └────────┘
                      │         │
              ┌───────┴──┐  ┌───┴──────┐
              │payments- │  │payments- │
              │   prod   │  │   dev    │
              │ search-  │  │ search-  │
              │   prod   │  │   dev    │
              └──────────┘  └──────────┘
```

**Why separate accounts/projects instead of one big account with tags?**

1. **Blast radius.** An IAM mistake, a runaway Terraform apply, or a compromised credential is bounded by the account. This is the single strongest isolation boundary either cloud offers.
2. **Quota isolation.** Service quotas are largely per-account/per-project. One team's Lambda concurrency burst can't starve another team's. (War Story 3 is exactly this failure, in a shared account.)
3. **Billing attribution without discipline.** Tags require every engineer to remember. Accounts attribute automatically.
4. **Compliance scoping.** PCI/HIPAA auditors scope to accounts. Keeping cardholder data in its own account cut one audit I ran from 6 weeks to 9 days.

**AWS-specific:** the management account must have zero workloads. SCPs do not apply to the management account — a compromise there is total. Use `AWSControlTower` or `landing-zone-accelerator` rather than hand-rolling.

**GCP-specific:** projects are cheap and disposable (you get 5–10 free by default, quota increases are routine). The idiomatic GCP unit of isolation is one project per app-per-environment. Shared VPC lets a central `net-prj` host the network while service projects attach to it — this has no clean AWS analogue short of RAM-shared Transit Gateway attachments.

### Guardrails: SCPs vs Org Policies

AWS Service Control Policies are **permission boundaries at the org level** — they never grant, they only cap the maximum permissions available in an account.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyRegionsOutsideApproved",
      "Effect": "Deny",
      "NotAction": [
        "iam:*", "organizations:*", "route53:*", "cloudfront:*",
        "support:*", "budgets:*", "sts:*", "waf:*", "s3:GetAccountPublic*"
      ],
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:RequestedRegion": ["us-east-1", "eu-west-1"]
        }
      }
    },
    {
      "Sid": "DenyRootUserActions",
      "Effect": "Deny",
      "Action": "*",
      "Resource": "*",
      "Condition": {
        "StringLike": { "aws:PrincipalArn": "arn:aws:iam::*:root" }
      }
    },
    {
      "Sid": "PreventCloudTrailTampering",
      "Effect": "Deny",
      "Action": [
        "cloudtrail:StopLogging",
        "cloudtrail:DeleteTrail",
        "cloudtrail:UpdateTrail"
      ],
      "Resource": "*"
    },
    {
      "Sid": "DenyDisablingSecurityServices",
      "Effect": "Deny",
      "Action": [
        "guardduty:Delete*", "guardduty:Disassociate*",
        "config:DeleteConfigurationRecorder", "config:StopConfigurationRecorder",
        "securityhub:Disable*"
      ],
      "Resource": "*"
    }
  ]
}
```

The `NotAction` block on the region restriction is the part people get wrong. Global services (IAM, CloudFront, Route 53, STS) have API endpoints that report as `us-east-1`. If you deny everything outside your approved regions without exempting them, you brick IAM in every account. I have watched this happen on a Friday afternoon.

GCP's equivalent is Org Policy constraints, which are declarative rather than policy-document shaped:

```bash
# Block creation of service account keys org-wide (huge security win)
gcloud resource-manager org-policies enable-enforce \
  iam.disableServiceAccountKeyCreation \
  --organization=123456789012

# Restrict which regions resources may be created in
cat > location-policy.yaml <<'EOF'
constraint: constraints/gcp.resourceLocations
listPolicy:
  allowedValues:
    - in:us-central1-locations
    - in:europe-west1-locations
EOF
gcloud resource-manager org-policies set-policy location-policy.yaml \
  --organization=123456789012

# Prevent any resource from getting a public IP
gcloud resource-manager org-policies enable-enforce \
  compute.vmExternalIpAccess --organization=123456789012

# Block allUsers / allAuthenticatedUsers in any IAM binding — kills public buckets
gcloud resource-manager org-policies enable-enforce \
  iam.allowedPolicyMemberDomains --organization=123456789012
```

That last one — `iam.allowedPolicyMemberDomains` — is the constraint that makes GCP's public-bucket story structurally better than AWS's. It denies `allUsers` at the org level, so no engineer can make anything public by accident, ever. AWS's equivalent (S3 Block Public Access at the account level) covers S3 only.

---

## IAM Deep Dive

This is where senior candidates separate from mid-level ones. Everyone can say "least privilege." Very few can walk the evaluation algorithm.

### The Two Models, and Why the Difference Matters

**AWS IAM is policy-document based.** Permissions live in JSON documents attached to principals (identity policies) or to resources (resource policies). The effective permission set is computed at request time by evaluating *every applicable document*.

**GCP IAM is role-binding + resource-hierarchy based.** You bind a *principal* to a *role* (a named bundle of permissions) at a *node in the resource hierarchy*, and the binding **inherits downward**. There is no explicit deny in the basic model (Deny Policies exist now, but they're an add-on, not the foundation).

```
AWS                                    GCP
─────────────────────────────────      ─────────────────────────────────
Principal (user/role)                  Principal (user/group/SA)
     │                                       │
     │ has attached                          │ bound to
     ↓                                       ↓
Policy Document (JSON)                 Role (roles/storage.objectViewer)
  Effect / Action / Resource                 │ contains
  / Condition / Principal                    ↓
     │                                  Permissions (storage.objects.get,
     │ evaluated against                                storage.objects.list)
     ↓                                       │
Every request, combined with:                │ granted AT a hierarchy node
  - Resource-based policies                  ↓
  - Permission boundaries              Organization
  - SCPs                                    └─ Folder      ← inherits down
  - Session policies                            └─ Project
                                                    └─ Resource
```

**Why this matters in practice:**

1. **Debugging.** In AWS, "why can this role read the bucket?" requires you to check the identity policy, the bucket policy, any permission boundary, the SCP chain, and the session policy — five documents in up to three accounts. In GCP you run one command and get the answer:

```bash
# GCP: definitive answer to "what can this principal do here?"
gcloud projects get-iam-policy my-project \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:app@my-project.iam.gserviceaccount.com" \
  --format="table(bindings.role)"

# Even better — the Policy Troubleshooter tells you WHY
gcloud policy-intelligence troubleshoot-policy \
  --principal-email=app@my-project.iam.gserviceaccount.com \
  --resource-name=//storage.googleapis.com/projects/_/buckets/my-bucket \
  --permission=storage.objects.get
```

```bash
# AWS equivalent requires simulation, not inspection
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::111122223333:role/app-role \
  --action-names s3:GetObject \
  --resource-arns arn:aws:s3:::my-bucket/data.csv
# NOTE: this does NOT evaluate SCPs or resource policies in other accounts.
# For that you need IAM Access Analyzer.
```

2. **Inheritance is a footgun in GCP.** Granting `roles/editor` at the *organization* node gives that principal Editor on every project forever, including ones created next year. There is no way to "un-inherit." In AWS, an over-broad policy is at least attached to something you can find and detach.

3. **AWS's explicit deny is genuinely more expressive.** "Everyone can read this bucket except from outside our VPC" is one Deny statement in AWS. In GCP you reach for VPC Service Controls (a separate product) or IAM Deny Policies.

**The interview answer:** "AWS IAM is more expressive and harder to reason about; GCP IAM is easier to reason about and less expressive. AWS gives you explicit deny and resource policies, which lets you write precise cross-account rules but means effective permissions require evaluating five document types. GCP's hierarchy inheritance means one command answers 'what can this identity do,' but a bad grant at the folder level is invisible from the project."

### AWS Policy Evaluation Logic — The Algorithm

Memorize this. It is asked verbatim.

```
                    Request arrives
                          │
                          ↓
              ┌───────────────────────┐
              │ 1. Explicit DENY?     │
              │ (any policy type:     │──── YES ──→ ┌──────────┐
              │  identity, resource,  │             │  DENY    │
              │  SCP, boundary,       │             │ (final,  │
              │  session)             │             │ nothing  │
              └───────────┬───────────┘             │ overrides)│
                          │ NO                      └──────────┘
                          ↓
              ┌───────────────────────┐
              │ 2. SCP allows?        │──── NO ───→ DENY
              │ (Organizations)       │
              └───────────┬───────────┘
                          │ YES
                          ↓
              ┌───────────────────────┐
              │ 3. Resource policy    │──── YES ──→ ALLOW
              │    explicit ALLOW?    │   (same-account: sufficient on its own
              │                       │    for most services)
              └───────────┬───────────┘
                          │ NO / N-A
                          ↓
              ┌───────────────────────┐
              │ 4. Permission         │──── NO ───→ DENY
              │    boundary allows?   │
              └───────────┬───────────┘
                          │ YES
                          ↓
              ┌───────────────────────┐
              │ 5. Session policy     │──── NO ───→ DENY
              │    allows?            │
              └───────────┬───────────┘
                          │ YES
                          ↓
              ┌───────────────────────┐
              │ 6. Identity policy    │──── NO ───→ DENY (implicit)
              │    explicit ALLOW?    │
              └───────────┬───────────┘
                          │ YES
                          ↓
                       ALLOW
```

The four rules that follow from this:

1. **Default is deny.** No matching Allow = denied.
2. **Explicit Deny always wins.** Nothing can override it. Not an admin policy, not a resource policy, not root.
3. **Cross-account requires Allow on BOTH sides.** The identity policy in Account A *and* the resource policy in Account B must both allow. This trips up 80% of candidates. Same-account, a resource policy alone can suffice; cross-account, never.
4. **Permission boundaries and SCPs cap, they never grant.** A boundary that allows `s3:*` gives nobody S3 access — it only means S3 isn't excluded.

### Least Privilege in Practice

❌ **WRONG — the policy I find in every codebase I inherit:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "*",
      "Resource": "*"
    }
  ]
}
```

This is `AdministratorAccess` with extra steps. If this is attached to an EC2 instance profile, anyone with RCE on that box owns the account. And they will not stop at your account: `iam:CreateUser`, `iam:AttachUserPolicy`, `organizations:*` if it's the management account.

❌ **ALSO WRONG — the "I scoped it, sort of" version:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::*"
    }
  ]
}
```

`s3:*` includes `s3:DeleteBucket`, `s3:PutBucketPolicy` (make it public), `s3:PutBucketAcl`, and `s3:DeleteObjectVersion` (destroy your version history / ransomware). `arn:aws:s3:::*` means *every bucket in the account*, including the CloudTrail log bucket and the Terraform state bucket. This is a full-account compromise in two API calls.

✅ **CORRECT — actual least privilege:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadWriteAppDataObjects",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::acme-app-data-prod/tenant/${aws:PrincipalTag/TenantId}/*",
      "Condition": {
        "StringEquals": {
          "s3:x-amz-server-side-encryption": "aws:kms",
          "s3:x-amz-server-side-encryption-aws-kms-key-id":
            "arn:aws:kms:us-east-1:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab"
        }
      }
    },
    {
      "Sid": "ListOnlyOwnPrefix",
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::acme-app-data-prod",
      "Condition": {
        "StringLike": {
          "s3:prefix": "tenant/${aws:PrincipalTag/TenantId}/*"
        }
      }
    },
    {
      "Sid": "DenyUnlessFromOurVPCE",
      "Effect": "Deny",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::acme-app-data-prod",
        "arn:aws:s3:::acme-app-data-prod/*"
      ],
      "Condition": {
        "StringNotEquals": {
          "aws:SourceVpce": "vpce-0abc123def456789a"
        }
      }
    }
  ]
}
```

What makes this senior-grade:

- **Actions enumerated**, not wildcarded. No `DeleteBucket`, no `PutBucketPolicy`.
- **Resource scoped to a specific bucket and a specific prefix**, with `${aws:PrincipalTag/TenantId}` doing per-tenant isolation via ABAC — one policy, N tenants, no policy sprawl.
- **`s3:ListBucket` is separated** because it's a bucket-level action (resource = bucket ARN, no `/*`). Getting this wrong is the #1 reason "my policy looks right but List fails."
- **Encryption is enforced by condition**, not by hope. An unencrypted PutObject is rejected.
- **The explicit Deny pins traffic to the VPC endpoint.** Even if credentials leak, they're useless from the public internet.

**GCP equivalent** — note how much shorter it is, and how much less it can express:

```bash
# Bind a custom role at the bucket level, not the project level
gcloud iam roles create appDataWriter \
  --project=acme-prod \
  --title="App Data Writer" \
  --permissions=storage.objects.get,storage.objects.create,storage.objects.delete,storage.objects.list

gcloud storage buckets add-iam-policy-binding gs://acme-app-data-prod \
  --member="serviceAccount:app@acme-prod.iam.gserviceaccount.com" \
  --role="projects/acme-prod/roles/appDataWriter" \
  --condition='expression=resource.name.startsWith("projects/_/buckets/acme-app-data-prod/objects/tenant/acme/"),title=tenant-acme-only'
```

GCP does have IAM Conditions (CEL expressions) and they cover the prefix case. What GCP cannot express as cleanly is "deny unless from this network path" — that's VPC Service Controls, a separate perimeter product.

### How to Actually Derive a Least-Privilege Policy

Don't hand-write it. Generate it from observed behavior.

```bash
# AWS: IAM Access Analyzer generates a policy from 90 days of CloudTrail
aws accessanalyzer start-policy-generation \
  --policy-generation-details '{"principalArn":"arn:aws:iam::111122223333:role/app-role"}' \
  --cloud-trail-details file://trail-details.json

aws accessanalyzer get-generated-policy --job-id <job-id>

# AWS: find credentials/permissions nobody used
aws iam generate-service-last-accessed-details \
  --arn arn:aws:iam::111122223333:role/app-role
aws iam get-service-last-accessed-details --job-id <job-id>
```

```bash
# GCP: Recommender surfaces over-granted roles automatically
gcloud recommender recommendations list \
  --project=acme-prod \
  --location=global \
  --recommender=google.iam.policy.Recommender \
  --format="table(content.overview.member, content.overview.removedRole)"
```

The workflow I use: ship with a permissive-but-bounded policy in dev, run for two weeks, generate from CloudTrail/Recommender, review the diff, apply the tightened policy in staging, then prod. Trying to write least privilege from first principles produces either a broken app or a policy so broad it's pointless.

### Roles, AssumeRole, and Instance Profiles

**Never use long-lived access keys.** Not for CI, not for local dev, not for "just this one script." Every credential leak I have personally responded to involved an `AKIA...` key in a git repo, a Docker image layer, or a Slack message.

The hierarchy of credential quality, best to worst:

1. Workload Identity Federation / OIDC (no stored secret at all)
2. IAM role on the compute (instance profile, task role, Lambda execution role)
3. Short-lived assumed-role credentials via SSO
4. Long-lived access keys with a strict permission boundary and 90-day rotation
5. Long-lived access keys with `AdministratorAccess` ← this is where breaches come from

**Instance profiles** are how EC2 gets credentials without keys. The instance queries the metadata service (IMDS) and receives short-lived STS credentials that auto-rotate.

```bash
# ❌ IMDSv1 — vulnerable to SSRF. A single request-forgery bug in your app
#    lets an attacker read your role's credentials.
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/app-role

# ✅ IMDSv2 — session-oriented, requires PUT with a token, hop limit blocks
#    containers/proxies from reaching it
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
curl -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/iam/security-credentials/app-role
```

Terraform to enforce IMDSv2 — this should be non-negotiable in every launch template you write:

```hcl
resource "aws_launch_template" "app" {
  name_prefix   = "app-"
  image_id      = data.aws_ami.al2023.id
  instance_type = "m6i.large"

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"  # IMDSv2 ONLY. This is the line.
    http_put_response_hop_limit = 1           # blocks container access to IMDS
    instance_metadata_tags      = "enabled"
  }

  iam_instance_profile {
    arn = aws_iam_instance_profile.app.arn
  }

  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size           = 50
      volume_type           = "gp3"
      encrypted             = true
      kms_key_id            = aws_kms_key.ebs.arn
      delete_on_termination = true
    }
  }
}
```

`http_put_response_hop_limit = 1` matters more than people realize: with the default of 2, a container running on that host can reach IMDS and steal the *node's* role, which is usually far more privileged than the pod's.

**Cross-account AssumeRole** with the confused-deputy protection people skip:

```hcl
# In the TRUSTING account (the one that owns the resource)
resource "aws_iam_role" "cross_account_reader" {
  name = "vendor-analytics-reader"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        AWS = "arn:aws:iam::999988887777:root"   # vendor's account
      }
      Action = "sts:AssumeRole"
      Condition = {
        StringEquals = {
          # ExternalId defeats the confused deputy problem. Without it, the
          # vendor could be tricked by ANOTHER of their customers into
          # assuming YOUR role.
          "sts:ExternalId" = var.vendor_external_id
        }
        # Belt and braces: require MFA for human assumption paths
        Bool = { "aws:MultiFactorAuthPresent" = "true" }
        # Cap session length
        NumericLessThan = { "aws:MultiFactorAuthAge" = "3600" }
      }
    }]
  })

  max_session_duration = 3600
}
```

The ExternalId is the part interviewers probe. If a candidate can explain the confused deputy problem — vendor SaaS has a role that can assume into many customers' accounts; without a per-customer secret, customer A can supply customer B's role ARN and get the vendor to assume it — that's a strong signal.

### GCP Service Accounts and the Key Problem

```bash
# ❌ WRONG: downloading a service account key. This is a permanent,
#    non-expiring credential in a JSON file. It will end up in a git repo.
gcloud iam service-accounts keys create key.json \
  --iam-account=app@my-project.iam.gserviceaccount.com

# ✅ CORRECT on GCE/GKE: attach the SA to the workload, no key exists
gcloud compute instances create app-vm \
  --service-account=app@my-project.iam.gserviceaccount.com \
  --scopes=https://www.googleapis.com/auth/cloud-platform

# ✅ CORRECT for short-lived elevation: impersonation
gcloud storage ls gs://prod-bucket \
  --impersonate-service-account=app@my-project.iam.gserviceaccount.com
# Requires roles/iam.serviceAccountTokenCreator on the target SA.
# Every impersonation is audit-logged with the HUMAN identity. Keys aren't.
```

Impersonation is strictly better than keys for local development. The audit log shows `alice@acme.com impersonating app@...` rather than an anonymous key ID.

### Workload Identity Federation — Zero Stored Credentials

This is the modern answer for CI/CD and cross-cloud, and it is a strong senior signal when a candidate raises it unprompted.

```
┌────────────────────────────────────────────────────────────────────┐
│  GitHub Actions job starts                                          │
│       │                                                             │
│       │ 1. Requests OIDC token from GitHub's token service          │
│       ↓                                                             │
│  JWT signed by token.actions.githubusercontent.com                  │
│  { sub: "repo:acme/api:ref:refs/heads/main",                        │
│    aud: "sts.amazonaws.com", iss: "https://token.actions..." }      │
│       │                                                             │
│       │ 2. sts:AssumeRoleWithWebIdentity                            │
│       ↓                                                             │
│  AWS STS verifies signature against the OIDC provider's JWKS,       │
│  then checks the role's trust policy conditions against JWT claims  │
│       │                                                             │
│       │ 3. Returns temporary credentials (15 min – 12 hr)           │
│       ↓                                                             │
│  Job calls AWS APIs. NO SECRET WAS EVER STORED ANYWHERE.            │
└────────────────────────────────────────────────────────────────────┘
```

```hcl
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

resource "aws_iam_role" "github_deploy" {
  name = "github-actions-deploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = aws_iam_openid_connect_provider.github.arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        # CRITICAL: pin the subject. Using StringLike with "repo:acme/*"
        # lets ANY repo in the org — including a fork with a malicious
        # workflow — assume this role.
        StringEquals = {
          "token.actions.githubusercontent.com:sub" =
            "repo:acme/api:ref:refs/heads/main"
        }
      }
    }]
  })
}
```

```yaml
# .github/workflows/deploy.yml — no AWS_SECRET_ACCESS_KEY anywhere
name: deploy
on:
  push:
    branches: [main]

permissions:
  id-token: write     # REQUIRED to request the OIDC token
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::111122223333:role/github-actions-deploy
          aws-region: us-east-1
          role-session-name: gha-${{ github.run_id }}
      - run: aws sts get-caller-identity
```

**GKE Workload Identity** is the same idea for pods — it maps a Kubernetes ServiceAccount to a Google ServiceAccount so pods get GCP credentials without any key file:

```bash
gcloud container clusters update prod-cluster \
  --workload-pool=my-project.svc.id.goog --region=us-central1

gcloud iam service-accounts add-iam-policy-binding \
  app@my-project.iam.gserviceaccount.com \
  --role roles/iam.workloadIdentityUser \
  --member "serviceAccount:my-project.svc.id.goog[production/app-ksa]"
```

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-ksa
  namespace: production
  annotations:
    iam.gke.io/gcp-service-account: app@my-project.iam.gserviceaccount.com
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
  namespace: production
spec:
  template:
    spec:
      serviceAccountName: app-ksa   # pod now has GCP creds, no key file
      containers:
        - name: app
          image: gcr.io/my-project/app:v1.4.2
```

The AWS equivalent is **IRSA** (IAM Roles for Service Accounts) on EKS, or the newer **EKS Pod Identity** which removes the OIDC-provider-per-cluster setup:

```hcl
resource "aws_iam_role" "pod_role" {
  name = "app-pod-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = module.eks.oidc_provider_arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${module.eks.oidc_provider}:sub" =
            "system:serviceaccount:production:app-ksa"
          "${module.eks.oidc_provider}:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })
}
```

Note the `:aud` condition. Omitting it is a real, exploitable misconfiguration — without it, a token minted for a different audience can be replayed.

---

## Networking Deep Dive

Networking is where cloud bills go to die and where outages come from. It is also the section most candidates are weakest on.

### VPC Topology — The Canonical Three-Tier Layout

```
                            INTERNET
                                │
                    ┌───────────┴───────────┐
                    │  Internet Gateway     │  (IGW — no cost, no bandwidth limit)
                    └───────────┬───────────┘
                                │
┌───────────────────────────────┼────────────────────────────────────────┐
│ VPC  10.0.0.0/16   (65,536 IPs)                                        │
│                               │                                         │
│  ┌────────────────────────────┼───────────────────────────────────┐    │
│  │  AZ us-east-1a             │            AZ us-east-1b          │    │
│  │                            │                                    │    │
│  │  ┌──────────────────────┐  │  ┌──────────────────────────────┐ │    │
│  │  │ PUBLIC 10.0.0.0/20   │←─┴─→│ PUBLIC 10.0.16.0/20          │ │    │
│  │  │  ┌────┐  ┌────────┐  │     │  ┌────┐  ┌────────┐          │ │    │
│  │  │  │ALB │  │NAT GW  │  │     │  │ALB │  │NAT GW  │          │ │    │
│  │  │  │node│  │ +EIP   │  │     │  │node│  │ +EIP   │          │ │    │
│  │  │  └────┘  └───┬────┘  │     │  └────┘  └───┬────┘          │ │    │
│  │  │  rt: 0.0.0.0/0→IGW   │     │  rt: 0.0.0.0/0→IGW           │ │    │
│  │  └──────────────┼───────┘     └──────────────┼───────────────┘ │    │
│  │                 │                            │                  │    │
│  │  ┌──────────────┼───────┐     ┌──────────────┼───────────────┐ │    │
│  │  │ PRIVATE-APP  ↓       │     │ PRIVATE-APP  ↓               │ │    │
│  │  │ 10.0.32.0/20         │     │ 10.0.48.0/20                 │ │    │
│  │  │  ┌──────────────┐    │     │  ┌──────────────┐            │ │    │
│  │  │  │ ECS tasks /  │    │     │  │ ECS tasks /  │            │ │    │
│  │  │  │ EKS nodes    │    │     │  │ EKS nodes    │            │ │    │
│  │  │  └──────┬───────┘    │     │  └──────┬───────┘            │ │    │
│  │  │ rt: 0.0.0.0/0→NATGW-a│     │ rt: 0.0.0.0/0→NATGW-b        │ │    │
│  │  │  ← AZ-LOCAL NAT.     │     │  ← AZ-LOCAL NAT.             │ │    │
│  │  │    Cross-AZ NAT      │     │    See War Story 1.          │ │    │
│  │  │    costs money.      │     │                              │ │    │
│  │  └─────────┼────────────┘     └─────────┼────────────────────┘ │    │
│  │            │                            │                       │    │
│  │  ┌─────────┼────────────┐     ┌─────────┼────────────────────┐ │    │
│  │  │ PRIVATE-DATA         │     │ PRIVATE-DATA                 │ │    │
│  │  │ 10.0.64.0/20         │     │ 10.0.80.0/20                 │ │    │
│  │  │  ┌──────────────┐    │     │  ┌──────────────┐            │ │    │
│  │  │  │ RDS PRIMARY  │◄───┼─sync┼─►│ RDS STANDBY  │            │ │    │
│  │  │  │ ElastiCache  │    │     │  │ ElastiCache  │            │ │    │
│  │  │  └──────────────┘    │     │  └──────────────┘            │ │    │
│  │  │ rt: NO 0.0.0.0/0 route (fully isolated; VPCE only)        │ │    │
│  │  └──────────────────────┘     └──────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ VPC Endpoints:                                                  │    │
│  │  Gateway (FREE): S3, DynamoDB — route table entries             │    │
│  │  Interface ($0.01/hr/AZ + $0.01/GB): ECR, Secrets Manager,      │    │
│  │    KMS, CloudWatch Logs, SSM, STS                               │    │
│  │  ← These BYPASS the NAT Gateway. This is the cost fix.          │    │
│  └────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────┘
```

Key design decisions encoded in that diagram:

- **`/16` VPC, `/20` subnets.** A `/20` gives 4,091 usable IPs (AWS reserves 5 per subnet). EKS with the VPC CNI assigns a VPC IP *per pod* — a `/24` (251 usable) will exhaust at ~250 pods and you will get `failed to assign an IP address to container`. Size for pods, not nodes. You cannot resize a subnet after creation; you can only add secondary CIDRs to the VPC.
- **One NAT Gateway per AZ.** Not one for the whole VPC. If AZ-a's NAT dies and AZ-b's instances route through it, you lose egress in both AZs *and* you pay cross-AZ transfer on every byte. See War Story 1.
- **Data subnets have no default route.** RDS does not need internet. If it needs to reach S3 for backups, that's a gateway endpoint.
- **Gateway endpoints for S3/DynamoDB are free and eliminate NAT charges** for the highest-volume traffic most apps have.

Terraform for the above, with the parts people get wrong:

```hcl
locals {
  azs      = ["us-east-1a", "us-east-1b", "us-east-1c"]
  vpc_cidr = "10.0.0.0/16"
}

resource "aws_vpc" "main" {
  cidr_block           = local.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true   # REQUIRED for interface endpoints + RDS DNS
  tags = { Name = "prod-vpc" }
}

resource "aws_subnet" "public" {
  for_each                = { for i, az in local.azs : az => i }
  vpc_id                  = aws_vpc.main.id
  availability_zone       = each.key
  cidr_block              = cidrsubnet(local.vpc_cidr, 4, each.value)       # /20
  map_public_ip_on_launch = false   # explicit EIPs only; default true is a leak
  tags = {
    Name                     = "public-${each.key}"
    "kubernetes.io/role/elb" = "1"   # tells the AWS LB controller where to put ALBs
  }
}

resource "aws_subnet" "private_app" {
  for_each          = { for i, az in local.azs : az => i }
  vpc_id            = aws_vpc.main.id
  availability_zone = each.key
  cidr_block        = cidrsubnet(local.vpc_cidr, 4, each.value + 4)
  tags = {
    Name                              = "private-app-${each.key}"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

# ONE NAT PER AZ. Do not "optimize" this to a single NAT.
resource "aws_eip" "nat" {
  for_each = toset(local.azs)
  domain   = "vpc"
}

resource "aws_nat_gateway" "this" {
  for_each      = toset(local.azs)
  allocation_id = aws_eip.nat[each.key].id
  subnet_id     = aws_subnet.public[each.key].id
  depends_on    = [aws_internet_gateway.this]
}

# Each private subnet routes to ITS OWN AZ's NAT
resource "aws_route_table" "private_app" {
  for_each = toset(local.azs)
  vpc_id   = aws_vpc.main.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.this[each.key].id
  }
}

# FREE. Saves thousands of dollars a month. Always create these.
resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.us-east-1.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [for rt in aws_route_table.private_app : rt.id]
}

resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.us-east-1.dynamodb"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [for rt in aws_route_table.private_app : rt.id]
}

# Interface endpoints cost $0.01/hr per AZ + $0.01/GB, but ECR image pulls
# through a NAT cost $0.045/GB. Break-even is fast for any real cluster.
resource "aws_vpc_endpoint" "interface" {
  for_each = toset([
    "ecr.api", "ecr.dkr", "secretsmanager", "kms",
    "logs", "ssm", "ssmmessages", "ec2messages", "sts"
  ])
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.us-east-1.${each.key}"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = [for s in aws_subnet.private_app : s.id]
  security_group_ids  = [aws_security_group.vpce.id]
  private_dns_enabled = true   # without this, the SDK still resolves public IPs
}
```

`private_dns_enabled = true` is the line people forget. Without it the endpoint exists, you pay for it, and your SDK still resolves `secretsmanager.us-east-1.amazonaws.com` to a public IP and goes out through the NAT. You get the cost of both and the benefit of neither.

### GCP Networking — The Structural Differences

```bash
# GCP VPC is GLOBAL. Subnets are REGIONAL (span all zones in the region).
gcloud compute networks create prod-vpc --subnet-mode=custom

gcloud compute networks subnets create prod-us-central1 \
  --network=prod-vpc --region=us-central1 --range=10.0.0.0/20 \
  --secondary-range=pods=10.4.0.0/14,services=10.8.0.0/20 \
  --enable-private-ip-google-access \
  --enable-flow-logs --logging-flow-sampling=0.5

gcloud compute networks subnets create prod-europe-west1 \
  --network=prod-vpc --region=europe-west1 --range=10.1.0.0/20
# ^ Same VPC. Instances in both regions talk over 10.x with no peering.
#   On AWS this requires two VPCs plus peering or Transit Gateway.
```

Three GCP features with no clean AWS equivalent:

1. **Alias IP ranges (secondary ranges).** GKE pods get IPs from a secondary range on the subnet, natively routable, without the ENI-per-node limits that constrain EKS pod density.
2. **Private Google Access.** A flag on the subnet that lets instances with no external IP reach Google APIs (`storage.googleapis.com`, etc.) without a NAT. Free. The AWS equivalent is a per-service VPC endpoint you create and pay for.
3. **Shared VPC.** A host project owns the network; service projects attach and place workloads in it. Central network team keeps control, app teams keep their own project boundary. AWS's closest analogue is RAM-shared subnets, which is newer and less mature.

Cloud NAT, and the pricing contrast that matters:

```bash
gcloud compute routers create nat-router \
  --network=prod-vpc --region=us-central1

gcloud compute routers nats create prod-nat \
  --router=nat-router --region=us-central1 \
  --nat-all-subnet-ip-ranges \
  --auto-allocate-nat-external-ips \
  --enable-logging --log-filter=ERRORS_ONLY \
  --min-ports-per-vm=128
# Cloud NAT: ~$0.044/hr per VM using it + standard egress.
# NO per-GB data processing charge. AWS NAT GW: $0.045/GB processed.
```

`--min-ports-per-vm` is worth understanding: Cloud NAT allocates a fixed block of source ports per VM. At the default 64, a VM opening many concurrent outbound connections (a crawler, a proxy, a service mesh sidecar) exhausts its allocation and new connections fail with no obvious error. Symptom: intermittent connection timeouts that correlate with load. Fix: raise `--min-ports-per-vm` or enable dynamic port allocation.

### Security Groups vs NACLs — Stateful vs Stateless

This question is asked in essentially every AWS interview and the stateful/stateless distinction is the whole point.

```
        INBOUND REQUEST                         OUTBOUND RESPONSE
        (client:54321 → server:443)             (server:443 → client:54321)
              │                                            ↑
              ↓                                            │
    ┌─────────────────────┐                    ┌───────────────────────┐
    │  NETWORK ACL        │                    │  NETWORK ACL          │
    │  (subnet boundary)  │                    │  (subnet boundary)    │
    │  STATELESS          │                    │  STATELESS            │
    │                     │                    │                       │
    │  Inbound rules      │                    │  OUTBOUND rules       │
    │  evaluated by       │                    │  evaluated AGAIN,     │
    │  rule number,       │                    │  independently.       │
    │  first match wins   │                    │  Must explicitly      │
    │                     │                    │  allow ephemeral      │
    │  Allow tcp/443 ✓    │                    │  ports 1024-65535 ✓   │
    └──────────┬──────────┘                    └───────────┬───────────┘
               ↓                                            │
    ┌─────────────────────┐                    ┌────────────┴──────────┐
    │  SECURITY GROUP     │                    │  SECURITY GROUP       │
    │  (ENI boundary)     │                    │  STATEFUL             │
    │  STATEFUL           │                    │                       │
    │                     │                    │  Return traffic is    │
    │  ALLOW rules only,  │                    │  AUTOMATICALLY        │
    │  all evaluated,     │                    │  permitted. No        │
    │  any match = allow  │                    │  outbound rule needed.│
    │  Allow tcp/443 ✓    │                    │  Connection tracked.  │
    └──────────┬──────────┘                    └───────────┬───────────┘
               ↓                                            │
         ┌──────────────────────────────────────────────────┴───┐
         │              EC2 INSTANCE / ENI                       │
         └──────────────────────────────────────────────────────┘
```

| | Security Group | Network ACL |
|---|---|---|
| Applies to | ENI (instance, ALB node, RDS, Lambda ENI) | Subnet |
| State | **Stateful** — return traffic auto-allowed | **Stateless** — must allow both directions |
| Rules | Allow only (implicit deny) | Allow **and Deny** |
| Evaluation | All rules evaluated, any match = allow | Numbered, **first match wins**, stops |
| Default | Deny all in, allow all out | Default NACL: allow all both ways |
| Can reference | Other security groups, prefix lists | CIDR blocks only |
| Limits | 60 rules/SG in + 60 out, 5 SGs/ENI (adjustable to 16) | 20 rules per direction (adjustable to 40) |

**The one thing that trips everyone up:** because NACLs are stateless, if you write a NACL that allows inbound 443 and forget to allow **outbound 1024–65535**, the request arrives and the response is dropped. Symptom: connections hang and time out rather than being refused. Refused = SG/firewall said no. Hung = something ate the response, and a NACL is your prime suspect.

❌ **WRONG — the security group I find in every "temporary" environment:**

```hcl
resource "aws_security_group" "app" {
  name   = "app-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]     # every port, entire internet
  }
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]     # SSH open to the world
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]     # unrestricted exfiltration path
  }
}
```

Port 22 open to `0.0.0.0/0` gets credential-stuffed within minutes of the ENI going live — I've measured it at under 4 minutes on a fresh EIP. The unrestricted egress is what lets a compromised host phone home and exfiltrate.

✅ **CORRECT — chained SGs referencing each other:**

```hcl
resource "aws_security_group" "alb" {
  name   = "alb-sg"
  vpc_id = aws_vpc.main.id
}

resource "aws_vpc_security_group_ingress_rule" "alb_https" {
  security_group_id = aws_security_group.alb.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  description       = "Public HTTPS"
}

resource "aws_security_group" "app" {
  name   = "app-sg"
  vpc_id = aws_vpc.main.id
}

# Source is the ALB's SECURITY GROUP, not a CIDR. This is the pattern.
# It keeps working when ALB nodes get new IPs, and it means only the ALB
# can reach the app — not anything else that happens to be in that subnet.
resource "aws_vpc_security_group_ingress_rule" "app_from_alb" {
  security_group_id            = aws_security_group.app.id
  referenced_security_group_id = aws_security_group.alb.id
  from_port                    = 8080
  to_port                      = 8080
  ip_protocol                  = "tcp"
  description                  = "App port from ALB only"
}

resource "aws_security_group" "db" {
  name   = "db-sg"
  vpc_id = aws_vpc.main.id
}

resource "aws_vpc_security_group_ingress_rule" "db_from_app" {
  security_group_id            = aws_security_group.db.id
  referenced_security_group_id = aws_security_group.app.id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  description                  = "Postgres from app tier only"
}

# Egress: explicit, not wide open
resource "aws_vpc_security_group_egress_rule" "app_to_db" {
  security_group_id            = aws_security_group.app.id
  referenced_security_group_id = aws_security_group.db.id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "app_https_out" {
  security_group_id = aws_security_group.app.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  description       = "HTTPS to external APIs and VPC endpoints"
}
```

No SSH rule anywhere. Access is via **SSM Session Manager**, which needs no inbound port, no bastion, no key management, and logs every session:

```bash
aws ssm start-session --target i-0abc123def456789a
# Full audit trail in CloudTrail. No port 22 anywhere in the account.
```

GCP firewall rules are network-scoped with target tags/service accounts, and are always stateful (no NACL equivalent):

```bash
gcloud compute firewall-rules create allow-app-from-lb \
  --network=prod-vpc --direction=INGRESS --action=ALLOW \
  --rules=tcp:8080 \
  --source-ranges=130.211.0.0/22,35.191.0.0/16 \  # Google LB health-check ranges
  --target-tags=app-server --priority=1000

# Targeting by SERVICE ACCOUNT is better than tags — tags can be set by
# anyone who can create an instance; service accounts require IAM permission.
gcloud compute firewall-rules create allow-db-from-app \
  --network=prod-vpc --direction=INGRESS --action=ALLOW --rules=tcp:5432 \
  --source-service-accounts=app@my-project.iam.gserviceaccount.com \
  --target-service-accounts=db@my-project.iam.gserviceaccount.com

# Explicit deny-all at low priority, then allow above it
gcloud compute firewall-rules create deny-all-ingress \
  --network=prod-vpc --direction=INGRESS --action=DENY --rules=all \
  --priority=65534
```

`--source-service-accounts` over `--target-tags` is the senior choice: network tags are a free-text field on the instance and anyone with `compute.instances.create` can set them, so tag-based rules are trivially bypassed by a user who can launch a VM.

### VPC Peering vs Transit Gateway vs PrivateLink

Three ways to connect networks, with genuinely different properties. Getting this comparison right is a strong staff-level signal.

```
VPC PEERING (mesh — N*(N-1)/2 connections)
                                          TRANSIT GATEWAY (hub-and-spoke — N)
    VPC-A ─────── VPC-B
      │  ╲       ╱  │                            VPC-A   VPC-B   VPC-C
      │    ╲   ╱    │                              │       │       │
      │      ╳      │                              └───────┼───────┘
      │    ╱   ╲    │                                      │
    VPC-C ─────── VPC-D                          ┌─────────┴─────────┐
                                                  │  Transit Gateway  │
    4 VPCs  =  6 peerings                         │  (route tables,   │
    10 VPCs =  45 peerings                        │   segmentation)   │
    NO TRANSITIVE ROUTING:                        └─────────┬─────────┘
    A↔B and B↔C does NOT give A↔C                     ┌─────┴─────┐
                                                       │           │
                                                    VPN/DX      VPC-D
                                                  10 VPCs = 10 attachments
                                                  TRANSITIVE by default

PRIVATELINK / PRIVATE SERVICE CONNECT (service exposure, not network merge)
    ┌──────────────────┐                    ┌──────────────────────┐
    │ CONSUMER VPC     │                    │ PROVIDER VPC         │
    │ 10.0.0.0/16      │                    │ 10.0.0.0/16          │
    │                  │                    │  ← SAME CIDR, FINE   │
    │  ┌────────────┐  │   private link     │  ┌────────────────┐  │
    │  │ Interface  │──┼───────────────────►│  │ Network LB     │  │
    │  │ Endpoint   │  │  (unidirectional)  │  │      ↓         │  │
    │  │ ENI w/ IP  │  │                    │  │ Service fleet  │  │
    │  │ in 10.0.x  │  │                    │  └────────────────┘  │
    │  └────────────┘  │                    │                      │
    └──────────────────┘                    └──────────────────────┘
     Consumer sees ONE endpoint IP, not the provider's network.
     No route propagation. No CIDR coordination.
```

| | VPC Peering | Transit Gateway | PrivateLink |
|---|---|---|---|
| Model | Full network merge | Hub-and-spoke router | Single service exposure |
| Transitive | **No** | **Yes** | N/A |
| Overlapping CIDRs | **Not allowed** | Not allowed | **Allowed** |
| Scale | N² connections | N attachments (5,000 per TGW) | Per-service |
| Cross-region | Yes | Yes (TGW peering) | Yes |
| Cost (AWS) | $0.01–0.02/GB cross-AZ/region, **no hourly** | **$0.05/hr per attachment** + $0.02/GB | $0.01/hr/AZ + $0.01/GB |
| Bandwidth | No hard limit | 50 Gbps per attachment | 100 Gbps per endpoint |
| Direction | Bidirectional | Bidirectional | **Unidirectional** (consumer→provider) |
| Blast radius | Both VPCs fully reachable | Controlled by TGW route tables | One service only |

**Decision rule I use:**
- **2–4 VPCs, stable, no on-prem** → peering. It's free hourly and simple.
- **5+ VPCs, or you need on-prem/VPN/Direct Connect integration, or you need network segmentation between environments** → Transit Gateway. At $0.05/hr/attachment, 20 VPCs = $730/month before data — that's cheap versus managing 190 peerings.
- **You're exposing a service to another team/customer/account and do NOT want to merge networks** → PrivateLink. This is also the right answer for SaaS vendors and for the "our customers have overlapping RFC1918 space" problem.

```hcl
# Transit Gateway with environment segmentation via separate route tables
resource "aws_ec2_transit_gateway" "main" {
  description                     = "prod hub"
  default_route_table_association = "disable"  # force explicit association
  default_route_table_propagation = "disable"  # force explicit propagation
  auto_accept_shared_attachments  = "disable"
  dns_support                     = "enable"
}

resource "aws_ec2_transit_gateway_route_table" "prod" {
  transit_gateway_id = aws_ec2_transit_gateway.main.id
}
resource "aws_ec2_transit_gateway_route_table" "nonprod" {
  transit_gateway_id = aws_ec2_transit_gateway.main.id
}
# Prod and non-prod attach to DIFFERENT route tables → they cannot reach
# each other, even though both attach to the same TGW. This is the whole
# reason to disable the default route table.
```

**GCP:** peering exists and is also non-transitive, but because the VPC is global you need it far less. Network Connectivity Center is the TGW analogue. **Private Service Connect** is the PrivateLink analogue and is arguably better — it can expose both Google-managed services and your own, with consumer-side DNS.

### The Request Path: CloudFront → ALB → ECS → RDS

Interviewers love "walk me through what happens when a user hits your site." Here is the answer with the failure modes and timings attached.

```
   USER (Sydney)
        │  1. DNS: app.acme.com → Route 53 (alias) → CloudFront anycast IP
        │     ~20ms, cached per TTL. Route 53 health checks can fail over here.
        ↓
┌───────────────────────────────────────────────────────────────────────┐
│ CLOUDFRONT EDGE (Sydney PoP)                          ~5ms RTT        │
│  • TLS terminated at edge (TLS 1.3, ~1 RTT)                           │
│  • AWS Shield Standard: L3/L4 DDoS absorbed here, free                │
│  • AWS WAF: rate limits, SQLi/XSS rules, geo blocks    +~1ms          │
│  • Cache lookup on cache key (path + selected headers/query/cookies)  │
│      HIT  → return in ~5ms total. 85% of static traffic should hit.   │
│      MISS ↓                                                            │
│  • CloudFront Functions (viewer req, <1ms, JS, header rewrite)        │
│  • Lambda@Edge (origin req, ~30-50ms cold, full Node/Python)          │
└──────────────────────────────┬────────────────────────────────────────┘
                               │  2. Origin fetch over AWS BACKBONE
                               │     (not public internet — lower loss,
                               │      and origin egress is billed at the
                               │      cheaper CloudFront rate, not EC2's)
                               │     Sydney → us-east-1 ≈ 200ms
                               ↓
┌───────────────────────────────────────────────────────────────────────┐
│ APPLICATION LOAD BALANCER (us-east-1, 2+ AZs)         ~1ms            │
│  • SG allows 443 from CloudFront managed prefix list only             │
│  • Listener rules: host/path/header → target group                    │
│  • Target selection: least-outstanding-requests (better than RR)      │
│  • Health checks every 30s; 2 consecutive fails → target drained      │
│  • Adds X-Forwarded-For, X-Amzn-Trace-Id                              │
│  ⚠ ALB idle timeout default 60s. If your app's keepalive is SHORTER,  │
│    you get sporadic 502s — the ALB reuses a connection the app just   │
│    closed. Set app keepalive > ALB idle timeout. Always.              │
└──────────────────────────────┬────────────────────────────────────────┘
                               │  3. To target IP:port (awsvpc mode →
                               │     each task has its own ENI + VPC IP)
                               ↓
┌───────────────────────────────────────────────────────────────────────┐
│ ECS FARGATE TASK (private subnet)                                     │
│  • App processes request                              ~20ms           │
│  • Reads secret from Secrets Manager (CACHE THIS — a per-request      │
│    GetSecretValue is +30ms and $0.05/10k calls)                       │
│  • Connection pool → RDS. Pool exhaustion is the #1 latency cliff.    │
└──────────────────────────────┬────────────────────────────────────────┘
                               │  4. Postgres wire protocol, TLS
                               │     SAME-AZ: ~0.5ms, $0
                               │     CROSS-AZ: ~1.5ms, $0.01/GB EACH WAY
                               ↓
┌───────────────────────────────────────────────────────────────────────┐
│ RDS PRIMARY (us-east-1a)          ──sync replication──►  STANDBY (1b) │
│  • Query executes                                     ~5ms            │
│  • Multi-AZ standby is NOT readable. It serves failover only.         │
│  • Failover = DNS CNAME flip, 60–120s. Your app MUST have a short     │
│    JVM/driver DNS TTL or it will keep hammering the dead IP.          │
└───────────────────────────────────────────────────────────────────────┘

TOTAL (cache miss, Sydney→us-east-1): ~250ms
TOTAL (cache hit at Sydney edge):     ~25ms
```

The two details that separate a senior answer:

1. **ALB idle timeout vs application keepalive.** ALB default idle is 60s. If your Node/Java server closes idle connections at 5s, the ALB will occasionally send a request down a socket the app has already FIN'd, producing intermittent 502s at maybe 0.1% of requests — high enough to page, low enough to be unreproducible. Set the app's keepalive above the ALB's idle timeout. This has caused two multi-day debugging efforts I've been part of.
2. **Lock the ALB to CloudFront.** Otherwise attackers find the ALB's DNS name and bypass WAF/Shield entirely:

```hcl
data "aws_ec2_managed_prefix_list" "cloudfront" {
  name = "com.amazonaws.global.cloudfront.origin-facing"
}

resource "aws_vpc_security_group_ingress_rule" "alb_from_cf_only" {
  security_group_id = aws_security_group.alb.id
  prefix_list_id    = data.aws_ec2_managed_prefix_list.cloudfront.id
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
}
```

Plus a shared-secret header that CloudFront injects and the ALB requires — the prefix list only proves the request came from *some* CloudFront distribution, not *yours*.

---

## Compute: Choosing the Right Abstraction

### The Decision Framework

Stop asking "which is best." Ask these five questions in order:

```
                    ┌──────────────────────────────────┐
                    │ Is execution < 15 min, event-    │
                    │ driven, and spiky/low-volume?    │
                    └────────┬──────────────┬──────────┘
                        YES  │              │ NO
                             ↓              ↓
                     ┌──────────────┐  ┌────────────────────────────┐
                     │ LAMBDA /     │  │ Do you need to run a       │
                     │ CLOUD FUNCS  │  │ container image?           │
                     └──────────────┘  └────┬──────────────┬────────┘
                                        YES │              │ NO
                                            ↓              ↓
                          ┌─────────────────────────┐  ┌──────────────────┐
                          │ Do you need K8s APIs,   │  │ Do you need OS   │
                          │ operators, CRDs, or     │  │ control, GPUs,   │
                          │ multi-cloud portability?│  │ licensed s/w, or │
                          └──┬──────────────┬───────┘  │ >4hr processes?  │
                         YES │              │ NO       └────────┬─────────┘
                             ↓              ↓                   │ YES
                    ┌────────────────┐  ┌──────────────────┐    ↓
                    │ EKS / GKE      │  │ Traffic pattern? │  ┌──────────────┐
                    │  ← only if you │  │  Spiky/zero →    │  │ EC2 / GCE    │
                    │    have a      │  │   CLOUD RUN      │  │ + ASG / MIG  │
                    │    platform    │  │  Steady →        │  └──────────────┘
                    │    team        │  │   ECS+FARGATE    │
                    └────────────────┘  └──────────────────┘
```

**The honest take on EKS/GKE:** Kubernetes has a real operational cost. Control plane ($73/mo), upgrade cadence (EKS supports each version ~14 months, then forced upgrade), CNI/CSI/ingress-controller version matrices, and the fact that you now need someone who understands `kubectl describe pod` at 3am. If you have fewer than ~15 services and no dedicated platform engineer, ECS+Fargate or Cloud Run will ship faster and page less. I have migrated two teams *off* EKS onto ECS and both were happier.

The counterargument, which is legitimate: K8s is the portable substrate, the ecosystem (Argo, Istio, KEDA, Crossplane, cert-manager) is enormous, and hiring for K8s is easier than hiring for ECS. If you're at 50+ services, K8s wins.

### The Comparison Table

| | EC2 / GCE | ECS+Fargate | EKS / GKE | Cloud Run | Lambda / Cloud Functions |
|---|---|---|---|---|---|
| Unit of deploy | AMI / image | Task definition | Pod | Container | Function zip/image |
| Scale to zero | No | No (min 1 task) | No (node floor) | **Yes** | **Yes** |
| Max execution | Unbounded | Unbounded | Unbounded | 60 min | **15 min** (Lambda) |
| Cold start | 30–90s (boot) | 30–60s (task) | 5–30s (pod, if node exists) | 0.5–3s | 100ms–10s |
| Pricing granularity | Per second (60s min) | Per second vCPU+GB | Per node + $73/mo CP | Per 100ms, request-scoped | Per 1ms + requests |
| Ops burden | High (patching, AMIs) | Low | **Highest** | Lowest | Lowest |
| GPU | Yes | Limited | Yes | Yes (recent) | No |
| Persistent local disk | Yes (EBS) | Ephemeral 20–200GB | Yes (PV) | In-memory only | 512MB–10GB `/tmp` |
| Best for | Legacy, licensed, stateful, GPU | Steady containerized services | Platform teams, 50+ services | Spiky HTTP, internal tools | Glue, events, cron |

### EC2 Instance Families — What the Letters Mean

| Family | AWS | GCP | Use for |
|---|---|---|---|
| General | `m7i`, `m7g` (Graviton) | `n2`, `n2d`, `c3` | Balanced; default choice |
| Burstable | `t3`, `t4g` | `e2-micro/small/medium` | Dev, low-traffic. **CPU credits** |
| Compute | `c7i`, `c7g` | `c2`, `c3`, `h3` | Encoding, batch, game servers |
| Memory | `r7i`, `x2idn` | `m1`, `m2`, `m3` | In-memory DBs, caches, JVM heaps |
| Storage | `i4i`, `d3` | `n2` + Local SSD | High local IOPS, NoSQL nodes |
| Accelerated | `p5`, `g6`, `inf2` | `a3`, `g2` + TPU | ML training/inference |

**Two traps:**

**Burstable instance CPU credits.** A `t3.medium` earns 24 credits/hour and baseline is 20% of 2 vCPUs. Sustained load above baseline drains the balance, then either you throttle to 20% (Standard mode) or you get silently billed for surplus credits at $0.05/vCPU-hour (Unlimited mode, which is the **default**). I have seen a fleet of 40 `t3.large` in Unlimited mode running a steady 70% CPU generate $2,100/month in surplus credit charges that nobody could find in Cost Explorer because it's a separate line item (`CPUCredits`). Rule: t-family for dev and genuinely bursty workloads only. Anything with a steady CPU floor goes on `m`-family.

**Graviton is 20–40% cheaper for the same performance.** `m7g.large` is roughly 20% cheaper than `m7i.large` and often faster on ARM-friendly workloads (Go, Java 17+, Node, Python, nginx). If your stack has no x86-native binaries, moving to Graviton is one of the highest-ROI cost actions available — I've done it on three fleets for an average 28% compute reduction with a two-week effort. Check your dependencies for native extensions first (`pip` wheels, `node-gyp` modules, anything shipping a `.so`).

```bash
# Find what you're actually running and where Graviton would apply
aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=running" \
  --query 'Reservations[].Instances[].{Id:InstanceId,Type:InstanceType,Arch:Architecture}' \
  --output table

# Right-sizing recommendations backed by 14 days of CloudWatch data
aws compute-optimizer get-ec2-instance-recommendations \
  --query 'instanceRecommendations[?finding==`OVER_PROVISIONED`].{
     Id:instanceArn, Current:currentInstanceType,
     Rec:recommendationOptions[0].instanceType,
     Savings:recommendationOptions[0].savingsOpportunity.estimatedMonthlySavings.value}' \
  --output table
```

```bash
# GCP equivalent — recommender is enabled by default, free
gcloud recommender recommendations list \
  --project=my-project --location=us-central1-a \
  --recommender=google.compute.instance.MachineTypeRecommender \
  --format="table(description, primaryImpact.costProjection.cost.units)"
```

### Auto Scaling — Do It on the Right Signal

❌ **WRONG — scale on CPU for a web service:**

```hcl
resource "aws_autoscaling_policy" "cpu" {
  name                   = "scale-on-cpu"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "TargetTrackingScaling"
  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 70.0
  }
}
```

CPU is a lagging, indirect proxy. An I/O-bound web service sits at 25% CPU while its request queue backs up and p99 latency goes to 8 seconds. CPU never crosses 70%, so it never scales, and you page.

✅ **CORRECT — scale on the thing your users feel:**

```hcl
resource "aws_autoscaling_policy" "rpt" {
  name                   = "scale-on-requests-per-target"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ALBRequestCountPerTarget"
      resource_label = "${aws_lb.app.arn_suffix}/${aws_lb_target_group.app.arn_suffix}"
    }
    # Load test to find where p99 degrades, then set target at ~70% of that.
    target_value = 1000
  }
}

# For queue workers, scale on BACKLOG PER INSTANCE, not queue depth.
# Queue depth alone can't distinguish "1000 msgs, 1 worker" from
# "1000 msgs, 100 workers".
resource "aws_cloudwatch_metric_alarm" "backlog" {
  alarm_name          = "sqs-backlog-per-worker"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  threshold           = 20
  metric_query {
    id          = "backlog"
    expression  = "visible / IF(workers > 0, workers, 1)"
    label       = "Backlog per worker"
    return_data = true
  }
  metric_query {
    id = "visible"
    metric {
      metric_name = "ApproximateNumberOfMessagesVisible"
      namespace   = "AWS/SQS"
      period      = 60
      stat        = "Average"
      dimensions  = { QueueName = aws_sqs_queue.jobs.name }
    }
  }
  metric_query {
    id = "workers"
    metric {
      metric_name = "GroupInServiceInstances"
      namespace   = "AWS/AutoScaling"
      period      = 60
      stat        = "Average"
      dimensions  = { AutoScalingGroupName = aws_autoscaling_group.workers.name }
    }
  }
}
```

**Scale-out fast, scale-in slow.** Asymmetric cooldowns: 60s to add capacity, 300–600s to remove it. Adding a node you didn't need costs a few cents. Removing one you did need costs an outage. And always set `min_size` to survive one full AZ loss — if you need 6 instances of capacity across 3 AZs, min is 9, not 6.

---

## Storage & Storage Classes

### Object Storage Classes and the Retrieval Math

| AWS class | $/GB/mo | Min duration | Retrieval | GCP class | $/GB/mo |
|---|---|---|---|---|---|
| S3 Standard | $0.023 | none | free | Standard | $0.020 |
| S3 Intelligent-Tiering | $0.023→$0.0125→$0.004 | none | free (auto) | Autoclass | auto |
| S3 Standard-IA | $0.0125 | 30 days | $0.01/GB | Nearline | $0.010 |
| S3 One Zone-IA | $0.010 | 30 days | $0.01/GB | — | — |
| S3 Glacier Instant | $0.004 | 90 days | $0.03/GB | Coldline | $0.004 |
| S3 Glacier Flexible | $0.0036 | 90 days | $0.01/GB + 1–12hr wait | Archive | $0.0012 |
| S3 Glacier Deep Archive | $0.00099 | **180 days** | $0.02/GB + 12–48hr | Archive | $0.0012 |

**The trap is minimum duration billing.** Store 100 TB in Glacier Deep Archive, delete after 30 days: you are billed for **180 days** anyway. That's $99/mo × 6 = $594 for one month of storage. Lifecycle-transitioning short-lived data into deep tiers makes your bill go *up*.

**The second trap is transition request cost.** Lifecycle transitions cost $0.01 per 1,000 objects into IA/Glacier. Transitioning 500 million small log files costs **$5,000 in requests alone**, to save maybe $5,000/month in storage. If your objects average under ~128 KB, S3 charges you as if they were 128 KB in IA classes anyway, so the whole exercise loses money. **Aggregate small objects before archiving them.** This is the single most common S3 lifecycle mistake.

❌ **WRONG lifecycle policy:**

```json
{
  "Rules": [{
    "ID": "archive-everything",
    "Status": "Enabled",
    "Filter": {},
    "Transitions": [
      { "Days": 1, "StorageClass": "GLACIER" }
    ]
  }]
}
```

Transitions every object after 1 day, including 400 million 2 KB event files. Request charges dwarf the savings, minimum-duration charges lock you in for 90 days, and reads now require an async restore your code doesn't implement.

✅ **CORRECT lifecycle policy:**

```hcl
resource "aws_s3_bucket_lifecycle_configuration" "data" {
  bucket = aws_s3_bucket.data.id

  rule {
    id     = "logs-tiering"
    status = "Enabled"
    filter {
      and {
        prefix                   = "logs/"
        object_size_greater_than = 131072   # 128 KB — below this, IA loses money
      }
    }
    transition { days = 30  storage_class = "STANDARD_IA" }
    transition { days = 90  storage_class = "GLACIER_IR" }
    transition { days = 365 storage_class = "DEEP_ARCHIVE" }
    expiration { days = 2555 }   # 7 years, then gone
  }

  rule {
    id     = "small-objects-intelligent-tiering"
    status = "Enabled"
    filter {
      and {
        prefix                = "logs/"
        object_size_less_than = 131072
      }
    }
    # Intelligent-Tiering has no retrieval fee and no min duration;
    # $0.0025/1000 objects/mo monitoring. Right answer for unpredictable
    # access on objects >128KB; for tiny objects, just leave them Standard.
    transition { days = 0 storage_class = "INTELLIGENT_TIERING" }
  }

  # THIS RULE SAVES MORE MONEY THAN ANY OTHER AND EVERYONE FORGETS IT
  rule {
    id     = "abort-incomplete-multipart"
    status = "Enabled"
    filter {}
    abort_incomplete_multipart_upload { days_after_initiation = 7 }
  }

  rule {
    id     = "expire-noncurrent-versions"
    status = "Enabled"
    filter {}
    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "GLACIER_IR"
    }
    noncurrent_version_expiration { noncurrent_days = 90 }
  }
}
```

**Incomplete multipart uploads are invisible storage you pay for forever.** They do not appear in `ListObjects`. They do not appear in the console's object count. They appear only in your bill. I found 47 TB of orphaned multipart parts in one account — $1,081/month for data that had accumulated over three years from a failing nightly upload job. One lifecycle rule, ten minutes of work, $13k/year.

```bash
# Go find yours right now
aws s3api list-multipart-uploads --bucket my-bucket \
  --query 'Uploads[].{Key:Key,Initiated:Initiated}' --output table

# And check the storage-class breakdown you're actually paying for
aws cloudwatch get-metric-statistics \
  --namespace AWS/S3 --metric-name BucketSizeBytes \
  --dimensions Name=BucketName,Value=my-bucket \
               Name=StorageType,Value=StandardStorage \
  --start-time "$(date -u -v-2d '+%Y-%m-%dT%H:%M:%SZ')" \
  --end-time "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" \
  --period 86400 --statistics Average
```

### S3 Request Costs — The Line Item Nobody Models

| Operation | S3 Standard | S3 Glacier Flexible |
|---|---|---|
| PUT/COPY/POST/LIST | $0.005 / 1,000 | $0.03 / 1,000 |
| GET/SELECT | $0.0004 / 1,000 | $0.0004 / 1,000 |
| Lifecycle transition | $0.01 / 1,000 | — |
| Data retrieval | free | $0.01/GB (standard tier) |

A service doing 5,000 GETs/second against S3: 13 billion requests/month × $0.0004/1,000 = **$5,184/month in requests**, independent of how much data that is. If those objects are small and hot, ElastiCache or CloudFront in front of S3 pays for itself immediately. I've cut an $8k/month S3 request bill to $600 by putting CloudFront in front of a thumbnail service — same objects, 94% cache hit rate.

### Securing a Bucket

❌ **WRONG — the configuration behind every S3 breach headline:**

```hcl
resource "aws_s3_bucket" "data" {
  bucket = "acme-customer-data"
}

resource "aws_s3_bucket_acl" "data" {
  bucket = aws_s3_bucket.data.id
  acl    = "public-read"     # the entire internet can list and read
}

resource "aws_s3_bucket_policy" "data" {
  bucket = aws_s3_bucket.data.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = "*"                        # anonymous
      Action    = ["s3:GetObject", "s3:ListBucket"]
      Resource  = ["arn:aws:s3:::acme-customer-data",
                   "arn:aws:s3:::acme-customer-data/*"]
    }]
  })
}
```

`ListBucket` granted to `Principal: "*"` is what turns "you'd have to guess the object key" into "here's a complete index of every file." That is the difference between a theoretical exposure and a data breach with a headline.

✅ **CORRECT:**

```hcl
resource "aws_s3_bucket" "data" {
  bucket = "acme-customer-data-prod"
}

# Belt: account-level and bucket-level public access blocks
resource "aws_s3_bucket_public_access_block" "data" {
  bucket                  = aws_s3_bucket.data.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_account_public_access_block" "account" {
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "data" {
  bucket = aws_s3_bucket.data.id
  rule { object_ownership = "BucketOwnerEnforced" }  # disables ACLs entirely
}

resource "aws_s3_bucket_server_side_encryption_configuration" "data" {
  bucket = aws_s3_bucket.data.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.s3.arn
    }
    bucket_key_enabled = true   # cuts KMS request costs by up to 99%
  }
}

resource "aws_s3_bucket_versioning" "data" {
  bucket = aws_s3_bucket.data.id
  versioning_configuration { status = "Enabled" }
}

# Ransomware protection: even root cannot delete these for 30 days
resource "aws_s3_bucket_object_lock_configuration" "data" {
  bucket = aws_s3_bucket.data.id
  rule {
    default_retention {
      mode = "COMPLIANCE"
      days = 30
    }
  }
}

resource "aws_s3_bucket_policy" "data" {
  bucket = aws_s3_bucket.data.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "DenyInsecureTransport"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:*"
        Resource  = [aws_s3_bucket.data.arn, "${aws_s3_bucket.data.arn}/*"]
        Condition = { Bool = { "aws:SecureTransport" = "false" } }
      },
      {
        Sid       = "DenyUnencryptedUploads"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:PutObject"
        Resource  = "${aws_s3_bucket.data.arn}/*"
        Condition = {
          StringNotEquals = { "s3:x-amz-server-side-encryption" = "aws:kms" }
        }
      },
      {
        Sid       = "DenyOutsideOrganization"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:*"
        Resource  = [aws_s3_bucket.data.arn, "${aws_s3_bucket.data.arn}/*"]
        Condition = {
          StringNotEquals = { "aws:PrincipalOrgID" = "o-abc123xyz" }
        }
      }
    ]
  })
}
```

`aws:PrincipalOrgID` is the highest-leverage single condition key in AWS. It denies every principal outside your AWS Organization regardless of any other policy. Apply it to every sensitive bucket and you have structurally eliminated cross-account data exfiltration.

For public content, use **CloudFront + Origin Access Control**, never a public bucket:

```hcl
resource "aws_cloudfront_origin_access_control" "s3" {
  name                              = "s3-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Bucket policy grants ONLY this distribution, via a source-ARN condition
resource "aws_s3_bucket_policy" "assets" {
  bucket = aws_s3_bucket.assets.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.assets.arn}/*"
      Condition = {
        StringEquals = {
          "AWS:SourceArn" = aws_cloudfront_distribution.assets.arn
        }
      }
    }]
  })
}
```

```bash
# GCP equivalent hardening
gcloud storage buckets update gs://acme-data \
  --uniform-bucket-level-access \     # kills per-object ACLs
  --public-access-prevention \        # blocks allUsers even if IAM tries
  --versioning \
  --default-encryption-key=projects/p/locations/us/keyRings/r/cryptoKeys/k

gcloud storage buckets update gs://acme-data \
  --retention-period=30d --lock-retention-period   # WORM, irreversible
```

### Block Storage: EBS Sizing

| Type | Baseline | Max IOPS | Max throughput | $/GB/mo | Use for |
|---|---|---|---|---|---|
| gp3 | 3,000 IOPS, 125 MB/s **included** | 16,000 | 1,000 MB/s | $0.08 | Default for everything |
| gp2 | 3 IOPS/GB (min 100) | 16,000 | 250 MB/s | $0.10 | **Legacy — migrate off** |
| io2 Block Express | provisioned | 256,000 | 4,000 MB/s | $0.125 + $0.065/IOPS | Tier-1 DBs |
| st1 | 40 MB/s/TB | 500 | 500 MB/s | $0.045 | Big sequential (logs, Kafka) |

**Migrate every gp2 volume to gp3 today.** gp3 is 20% cheaper *and* includes 3,000 baseline IOPS regardless of size. Under gp2, getting 3,000 IOPS required a 1,000 GB volume ($100/mo); under gp3 a 100 GB volume gets it for $8/mo. This is a live migration with no downtime:

```bash
aws ec2 modify-volume --volume-id vol-0abc123 --volume-type gp3
# No detach, no reboot. Takes minutes. Runs while the instance serves traffic.

# Find every gp2 volume in the account
aws ec2 describe-volumes --filters "Name=volume-type,Values=gp2" \
  --query 'Volumes[].{Id:VolumeId,Size:Size,AZ:AvailabilityZone}' --output table

# And find the volumes nobody is using at all
aws ec2 describe-volumes --filters "Name=status,Values=available" \
  --query 'Volumes[].{Id:VolumeId,Size:Size,Created:CreateTime}' --output table
```

Unattached EBS volumes are pure waste — you pay full price for a disk attached to nothing. Every account I audit has them. One had 340 orphaned volumes totalling 18 TB: $1,440/month for storage nobody had touched in two years.

---

## Databases

### Multi-AZ vs Read Replicas — These Are Different Things

Candidates confuse these constantly. It is the fastest way to fail an RDS question.

```
   ┌───────────────── MULTI-AZ (availability) ──────────────────┐
   │                                                             │
   │   AZ-a                              AZ-b                    │
   │  ┌──────────────┐   SYNCHRONOUS   ┌──────────────┐         │
   │  │   PRIMARY    │═════════════════►│   STANDBY    │         │
   │  │  read+write  │  (2-phase, every │  ┌────────┐  │         │
   │  │              │   commit waits)  │  │ CANNOT │  │         │
   │  │              │                  │  │  BE    │  │         │
   │  │              │                  │  │ READ   │  │         │
   │  └──────┬───────┘                  │  └────────┘  │         │
   │         │                          └──────────────┘         │
   │    ┌────┴──────────────────┐                                │
   │    │ db.abc.rds.amazonaws  │  ← ONE endpoint. On failover,  │
   │    │        (CNAME)        │    the CNAME flips. 60–120s.   │
   │    └───────────────────────┘                                │
   │                                                              │
   │  PURPOSE: availability + durability. NOT performance.        │
   │  COST: exactly 2x. RPO: 0. RTO: 60–120s.                    │
   │  SIDE EFFECT: writes are SLOWER (sync replication adds       │
   │               ~1-2ms of cross-AZ latency per commit).        │
   └──────────────────────────────────────────────────────────────┘

   ┌───────────────── READ REPLICAS (performance) ───────────────┐
   │                                                              │
   │  ┌──────────────┐   ASYNCHRONOUS                            │
   │  │   PRIMARY    │──────┬────────────┬────────────┐          │
   │  │  read+write  │      ↓            ↓            ↓          │
   │  └──────────────┘  ┌────────┐  ┌────────┐  ┌────────┐      │
   │       ↑            │REPLICA1│  │REPLICA2│  │REPLICA3│      │
   │       │            │READ-ONLY│ │READ-ONLY│ │READ-ONLY│     │
   │  writes go here    │ AZ-b   │  │ AZ-c   │  │us-west-2│     │
   │                    └────────┘  └────────┘  └────────┘      │
   │                    each has its OWN endpoint                │
   │                                                              │
   │  PURPOSE: read scaling + cross-region DR. NOT availability.  │
   │  LAG: milliseconds to MINUTES under write load.              │
   │  ⚠ NO AUTOMATIC FAILOVER. Promotion is manual/scripted       │
   │    and you LOSE whatever hadn't replicated. RPO > 0.         │
   │  ⚠ Read-after-write breaks. User posts a comment, reads      │
   │    from a replica, comment isn't there. Classic bug.         │
   └──────────────────────────────────────────────────────────────┘
```

| | Multi-AZ | Read Replica |
|---|---|---|
| Replication | Synchronous | Asynchronous |
| Readable | **No** (RDS; Multi-AZ *Cluster* has 2 readable standbys) | Yes |
| Automatic failover | **Yes**, 60–120s | **No**, manual promotion |
| Data loss on failure | **Zero (RPO=0)** | Whatever hadn't replicated |
| Cross-region | No | **Yes** |
| Solves | Availability, durability | Read throughput, DR, analytics isolation |
| Cost | 2× | 1× per replica |

**The correct answer to "how do you make RDS highly available and scale reads?"** is: Multi-AZ for availability, read replicas for read scaling, and they're orthogonal — you use both. Then immediately raise replica lag: "I'd route reads to replicas only for queries that tolerate staleness, monitor `ReplicaLag`, and keep read-after-write on the primary via a session-sticky routing rule or a short read-your-writes window."

```hcl
resource "aws_db_instance" "primary" {
  identifier     = "acme-prod"
  engine         = "postgres"
  engine_version = "16.3"
  instance_class = "db.r7g.2xlarge"   # Graviton: ~20% cheaper

  allocated_storage     = 500
  max_allocated_storage = 2000        # storage autoscaling — prevents 3am full-disk
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id            = aws_kms_key.rds.arn

  multi_az = true    # AVAILABILITY

  backup_retention_period = 30
  backup_window           = "07:00-08:00"
  maintenance_window      = "sun:08:30-sun:09:30"
  copy_tags_to_snapshot   = true

  performance_insights_enabled          = true
  performance_insights_retention_period = 731  # 2 years
  monitoring_interval                   = 30   # enhanced monitoring
  monitoring_role_arn                   = aws_iam_role.rds_monitoring.arn
  enabled_cloudwatch_logs_exports       = ["postgresql", "upgrade"]

  deletion_protection      = true
  skip_final_snapshot      = false
  final_snapshot_identifier = "acme-prod-final-${formatdate("YYYYMMDDhhmm", timestamp())}"

  auto_minor_version_upgrade = false  # control your own upgrade timing
  apply_immediately          = false  # changes go in the maintenance window

  iam_database_authentication_enabled = true  # short-lived tokens, no passwords
}

resource "aws_db_instance" "replica" {
  count               = 2
  identifier          = "acme-prod-replica-${count.index}"
  replicate_source_db = aws_db_instance.primary.identifier   # READ SCALING
  instance_class      = "db.r7g.xlarge"                      # can be smaller
  multi_az            = false
  skip_final_snapshot = true
  performance_insights_enabled = true
}
```

`max_allocated_storage` is the line that prevents the most common RDS outage: disk full at 3am with no autoscaling configured. `deletion_protection = true` prevents the second most common: someone runs `terraform destroy` in the wrong workspace.

### Aurora — What It Actually Changes

Aurora decouples compute from storage. The storage layer is a distributed, log-structured service replicating **6 copies across 3 AZs**, with quorum writes (4/6) and quorum reads (3/6).

```
        ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
        │  WRITER  │  │ READER 1 │  │ READER 2 │  │ READER 3 │
        │ instance │  │ instance │  │ instance │  │ instance │
        └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
             │             │             │             │
             │  redo log   │             │             │  (readers attach to
             │  records    │  reads      │             │   the SAME storage;
             ↓  only       ↓             ↓             ↓   no replication lag
   ┌────────────────────────────────────────────────────┐   from copying data)
   │       AURORA DISTRIBUTED STORAGE (up to 128 TiB)   │
   │  ┌────AZ-a────┐  ┌────AZ-b────┐  ┌────AZ-c────┐   │
   │  │ copy  copy │  │ copy  copy │  │ copy  copy │   │
   │  └────────────┘  └────────────┘  └────────────┘   │
   │  Quorum: write 4/6, read 3/6. Self-healing.        │
   │  Auto-grows in 10 GB increments. No provisioning.  │
   └────────────────────────────────────────────────────┘
```

Consequences:
- **Replica lag is ~20ms, not seconds** — readers share storage rather than replaying a binlog.
- **Failover is 15–30s**, versus 60–120s for RDS Multi-AZ, because there's no data to promote.
- **Up to 15 readers** vs 5 for RDS.
- **Backtrack** (MySQL) rewinds the cluster to a point in time in seconds without a restore. Genuinely saves you after a bad migration.
- Cost is higher: Aurora I/O is metered ($0.20 per million requests) unless you use **Aurora I/O-Optimized**, which is ~30% more on compute but zero I/O charges. Crossover is around 25% of your bill being I/O — above that, I/O-Optimized wins.

**Aurora Serverless v2** scales in 0.5 ACU increments (1 ACU ≈ 2 GiB RAM). It does **not** scale to zero in v2 (v1 did, v2 gained scale-to-zero only recently and with caveats). Minimum 0.5 ACU ≈ $43/month. Good for spiky/dev workloads, wasteful for steady load where a reserved instance is far cheaper.

### DynamoDB — Partition Key Design and Hot Partitions

This is the highest-signal DynamoDB question and most candidates fail it.

```
   DynamoDB distributes by hash(partition key) → partition.
   Each partition caps at 3,000 RCU / 1,000 WCU / 10 GB.

   ❌ BAD KEY: partition_key = "status"  (values: ACTIVE, PENDING, DONE)
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │ P1: "ACTIVE" │ │ P2:"PENDING" │ │  P3: "DONE"  │
   │ ████████████ │ │ ██           │ │ █            │
   │ 98% of reads │ │              │ │              │
   │ THROTTLED    │ │  idle        │ │  idle        │
   │ at 3000 RCU  │ │              │ │              │
   └──────────────┘ └──────────────┘ └──────────────┘
   Table provisioned at 30,000 RCU. You get 3,000 usable.
   Symptom: ProvisionedThroughputExceededException while
            ConsumedReadCapacity shows 10% utilization.

   ✅ GOOD KEY: partition_key = "USER#<user_id>"
   ┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐
   │ ███    ││ ██     ││ ███    ││ ██     ││ ███    ││ ██     │
   └────────┘└────────┘└────────┘└────────┘└────────┘└────────┘
   Millions of distinct values → even distribution → full throughput.
```

**Rules for partition key design:**

1. **High cardinality.** Number of distinct values should vastly exceed your partition count. User IDs, order IDs, tenant+entity composites. Never status flags, never booleans, never dates alone.
2. **Uniform access.** High cardinality isn't enough if 90% of traffic hits one key. A celebrity user in a social app is a hot partition even with `USER#id` as the key.
3. **Write sharding for unavoidable hot keys.** Append a suffix: `EVENT#2026-08-30#<0-19>`, then scatter-gather across the 20 shards on read. Trades read complexity for write throughput.
4. **Design for your access patterns, not your entities.** DynamoDB single-table design means you enumerate every query the app will make, *then* design keys. If you find yourself needing a `Scan`, the key design is wrong.

```hcl
resource "aws_dynamodb_table" "orders" {
  name         = "orders"
  billing_mode = "PAY_PER_REQUEST"   # on-demand: no capacity planning
  hash_key     = "PK"
  range_key    = "SK"

  attribute { name = "PK"     type = "S" }
  attribute { name = "SK"     type = "S" }
  attribute { name = "GSI1PK" type = "S" }
  attribute { name = "GSI1SK" type = "S" }

  # Single-table design:
  #   PK="CUSTOMER#123" SK="ORDER#2026-08-30#987"  → orders by customer, time-sorted
  #   PK="ORDER#987"    SK="ITEM#1"                → items in an order
  # GSI1 inverts for the "orders by status, newest first" access pattern
  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"   # "STATUS#PENDING#<shard 0-9>" — sharded!
    range_key       = "GSI1SK"   # ISO timestamp
    projection_type = "INCLUDE"
    non_key_attributes = ["customerId", "total"]  # keep the index small
  }

  point_in_time_recovery { enabled = true }   # 35-day PITR, ~20% storage cost
  server_side_encryption { enabled = true  kms_key_arn = aws_kms_key.ddb.arn }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  ttl { attribute_name = "expiresAt"  enabled = true }  # free deletes
  deletion_protection_enabled = true
}
```

**On-demand vs provisioned:** on-demand is $1.25 per million writes / $0.25 per million reads. Provisioned is roughly **6–7× cheaper** at steady, predictable load. Rule of thumb: if utilization is consistently above ~18%, provisioned + autoscaling wins. Start on-demand, measure for a month, switch if the pattern is stable. Switching is allowed once every 24 hours.

**DynamoDB item size limit is 400 KB.** Blobs go to S3 with a pointer in the item. Also: a `Query` returns max 1 MB per call and you must paginate — code that ignores `LastEvaluatedKey` silently returns partial results, which is a bug class I've seen ship to production three separate times.

### GCP Database Equivalents

| Need | GCP choice | Why |
|---|---|---|
| Managed Postgres/MySQL | Cloud SQL | HA = regional (sync to another zone), like RDS Multi-AZ |
| High-perf Postgres | AlloyDB | 4× faster analytical queries, columnar engine |
| Global strong consistency | **Spanner** | No AWS equivalent. TrueTime, external consistency |
| Document, mobile sync | Firestore | Real-time listeners, offline SDK |
| Wide-column, huge scale | Bigtable | HBase API, single-digit ms at petabyte scale |
| Analytics | BigQuery | Serverless, $6.25/TiB scanned |

**Bigtable's row key is even more critical than a DynamoDB partition key** because Bigtable stores rows in lexicographic order — sequential keys (timestamps, auto-increment IDs) create a hot *tablet* where every write lands on one node. The fix is field promotion or salting: `<reversed-timestamp>#<device-id>` or `<hash-prefix>#<timestamp>`.

---

## Serverless Deep Dive

### Cold Starts — Real Numbers

"Cold starts are a problem" is a junior answer. Here are the actual numbers, which is a senior answer.

```
┌────────────────────────────────────────────────────────────────────┐
│ LAMBDA COLD START ANATOMY                                          │
│                                                                     │
│  ┌──────────────┐  ┌───────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ 1. Download  │→ │ 2. Start  │→ │ 3. Init  │→ │ 4. Handler   │  │
│  │    code      │  │  runtime  │  │   code   │  │   invoke     │  │
│  │  ~50-200ms   │  │ ~50-400ms │  │ 10ms-10s │  │  your logic  │  │
│  └──────────────┘  └───────────┘  └──────────┘  └──────────────┘  │
│  └──────────── AWS bills you for 3 and 4, not 1 and 2 ─────────┘   │
│                        (with Provisioned Concurrency, 1-3 are      │
│                         pre-done and you pay hourly instead)       │
└────────────────────────────────────────────────────────────────────┘
```

| Runtime | Typical cold start | Notes |
|---|---|---|
| Node.js 20 (small bundle) | 150–250 ms | Bundle with esbuild; a 50 MB `node_modules` adds ~400ms |
| Python 3.12 | 150–300 ms | `boto3` import alone is ~120ms |
| Go (provided.al2023) | 100–200 ms | Fastest interpreted-free option |
| Rust | 60–120 ms | Fastest |
| Java 21 (JVM) | **800–3,000 ms** | Class loading dominates |
| Java + SnapStart | 200–400 ms | CRaC snapshot restore. Huge win. Free. |
| .NET 8 | 600–1,500 ms | ReadyToRun helps |
| **Any runtime + VPC** | **+ ~100–200 ms** | Was 8–10 seconds pre-2019 |
| Container image (10 GB) | 500–1,500 ms | Lambda caches layers; first pull is slow |

**The VPC penalty history matters in interviews.** Before September 2019, a VPC-attached Lambda created an ENI *per concurrent execution* on cold start, costing 8–10 seconds and exhausting subnet IPs at scale. AWS re-architected to Hyperplane ENIs, shared across executions. Today the penalty is ~100–200ms on cold start only. A candidate who says "never put Lambda in a VPC, cold starts are 10 seconds" is quoting 2018.

**But there is still a real reason to avoid VPC-attaching Lambda:** a VPC-attached Lambda has no internet access unless you route it through a NAT Gateway, which costs $0.045/hr + $0.045/GB. Two thousand Lambdas hitting a third-party API through a NAT is a five-figure line item. Only VPC-attach when you must reach a private resource (RDS, ElastiCache, internal service).

**Mitigations, in order of preference:**

1. **Shrink the deployment package.** Bundle and tree-shake. 3 MB beats 50 MB by ~300ms consistently.
2. **Move initialization outside the handler.** Connections, SDK clients, config parsing — done once per container, reused across invocations.
3. **SnapStart for Java** (free, and cuts 800ms→300ms).
4. **Provisioned Concurrency** for latency-critical paths. $0.0000041667/GB-second — 10 provisioned instances at 1 GB is about **$108/month** whether you invoke them or not.
5. **Accept it.** At 100 req/s steady, cold starts are well under 1% of invocations. Optimizing them is often the wrong priority.

```javascript
// ❌ WRONG — new client and new DB connection on EVERY invocation.
//    Adds 100-300ms per request and exhausts the RDS connection limit.
exports.handler = async (event) => {
  const { SecretsManagerClient, GetSecretValueCommand } =
    require("@aws-sdk/client-secrets-manager");
  const sm = new SecretsManagerClient({});
  const secret = await sm.send(new GetSecretValueCommand({ SecretId: "db" }));
  const pg = new Client({ connectionString: JSON.parse(secret.SecretString).url });
  await pg.connect();
  const res = await pg.query("SELECT 1");
  await pg.end();
  return { statusCode: 200, body: JSON.stringify(res.rows) };
};

// ✅ CORRECT — module scope runs once per container (the "INIT" phase),
//    then is reused for the container's whole ~15-45 min lifetime.
const { SecretsManagerClient, GetSecretValueCommand } =
  require("@aws-sdk/client-secrets-manager");
const { Pool } = require("pg");

const sm = new SecretsManagerClient({});
let pool;                                  // survives across invocations

async function getPool() {
  if (pool) return pool;
  const secret = await sm.send(new GetSecretValueCommand({ SecretId: "db" }));
  pool = new Pool({
    connectionString: JSON.parse(secret.SecretString).url,
    max: 1,                    // ONE connection per container. See below.
    idleTimeoutMillis: 120000,
    connectionTimeoutMillis: 3000,
  });
  return pool;
}

exports.handler = async (event) => {
  const p = await getPool();
  const res = await p.query("SELECT 1");
  return { statusCode: 200, body: JSON.stringify(res.rows) };
};
```

`max: 1` looks wrong until you think about it: each Lambda container handles exactly one request at a time, so a pool larger than 1 is pure waste — and at 1,000 concurrent executions a `max: 10` pool would try to open 10,000 connections against an RDS instance whose limit is ~5,000. **Use RDS Proxy** for anything beyond low concurrency; it multiplexes thousands of Lambda connections onto a small pool. ~$0.015/vCPU-hour of the DB instance.

### Concurrency — The Model That Causes Outages

```
   ACCOUNT-LEVEL CONCURRENT EXECUTION LIMIT: 1,000 (default, per region)
   ┌───────────────────────────────────────────────────────────────┐
   │                                                                │
   │  ┌────────────────────┐  ┌─────────────────┐  ┌────────────┐  │
   │  │ fn-A               │  │ fn-B            │  │ UNRESERVED │  │
   │  │ RESERVED = 200     │  │ RESERVED = 100  │  │  POOL      │  │
   │  │ • guaranteed 200   │  │                 │  │  = 700     │  │
   │  │ • CAPPED at 200    │  │                 │  │            │  │
   │  │ • carved OUT of    │  │                 │  │ fn-C,D,E…  │  │
   │  │   the 1000         │  │                 │  │ COMPETE    │  │
   │  └────────────────────┘  └─────────────────┘  └────────────┘  │
   │                                                                │
   │  Concurrency = arrival_rate (req/s) × avg_duration (s)         │
   │    100 req/s × 0.2s =    20 concurrent                         │
   │    100 req/s × 5.0s =   500 concurrent  ← same traffic!        │
   │  A slow dependency multiplies your concurrency footprint.      │
   └───────────────────────────────────────────────────────────────┘
```

**Reserved concurrency does two things at once**, and both matter:
- **Guarantee**: this function always has N slots available.
- **Cap**: this function can never exceed N, protecting downstream (your RDS, a third-party API with a rate limit) and protecting other functions from starvation.

Setting reserved concurrency to 0 is the emergency kill switch for a runaway function — it stops invocations instantly without deleting anything.

```hcl
resource "aws_lambda_function" "api" {
  function_name = "api-handler"
  role          = aws_iam_role.lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  architectures = ["arm64"]     # Graviton: 20% cheaper, often faster

  memory_size = 1024   # CPU scales WITH memory. 1769 MB = 1 full vCPU.
  timeout     = 29     # match API Gateway's hard 29s limit

  reserved_concurrent_executions = 200   # guarantee AND cap

  environment {
    variables = {
      NODE_OPTIONS = "--enable-source-maps"
      POWERTOOLS_SERVICE_NAME = "api"
    }
  }

  tracing_config { mode = "Active" }   # X-Ray

  dead_letter_config { target_arn = aws_sqs_queue.dlq.arn }
}

# Provisioned concurrency, only on the latency-critical alias
resource "aws_lambda_provisioned_concurrency_config" "api" {
  function_name                     = aws_lambda_function.api.function_name
  qualifier                         = aws_lambda_alias.live.name
  provisioned_concurrent_executions = 10
}

# Async invocations: bound the retries, then DLQ
resource "aws_lambda_function_event_invoke_config" "api" {
  function_name                = aws_lambda_function.api.function_name
  maximum_retry_attempts       = 2       # default is 2; async retries are FREE
  maximum_event_age_in_seconds = 3600    # default 6 hours is usually too long
  destination_config {
    on_failure { destination = aws_sqs_queue.dlq.arn }
  }
}
```

**Memory is the CPU dial.** Lambda allocates CPU proportionally to memory: 1,769 MB = 1 full vCPU, 3,008 MB ≈ 1.7 vCPU, 10,240 MB ≈ 6 vCPU. A CPU-bound function at 512 MB taking 4 seconds may take 1 second at 2,048 MB. Same cost (4× memory, ¼ duration) but 4× lower latency. **Always tune memory empirically** — use `aws-lambda-power-tuning` (a Step Functions state machine) rather than guessing. I have never once found 128 MB to be the cost-optimal setting despite it being the cheapest per-ms.

**Burst concurrency limits** matter for spiky traffic. Lambda scales at 1,000 concurrent executions per 10 seconds per function (raised from the old 500/min region-wide burst). A traffic spike from 0 to 5,000 concurrent takes ~50 seconds to fully absorb; in the meantime you get `TooManyRequestsException` (429) throttles. For synchronous invokers that's user-visible errors. Provisioned concurrency or an SQS buffer in front is the fix.

### Lambda Pricing, Concretely

- Requests: **$0.20 per 1M**
- Duration: **$0.0000166667 per GB-second** (x86); ARM is ~20% less
- Free tier: 1M requests + 400,000 GB-seconds/month

Worked example — 50M invocations/month, 200ms average, 512 MB:
- Requests: 50 × $0.20 = **$10.00**
- GB-s: 50,000,000 × 0.2s × 0.5 GB = 5,000,000 GB-s × $0.0000166667 = **$83.33**
- **Total ≈ $93/month.**

The same workload on Fargate: 50M × 0.2s = 10M vCPU-seconds ≈ 2,778 vCPU-hours. At $0.04048/vCPU-hr that's ~$112 for CPU plus memory, *and* Fargate can't scale to zero, so you're paying for idle overnight. Lambda genuinely wins at this shape. It stops winning around 100M+ invocations with long durations, where reserved Fargate or EC2 becomes cheaper — the crossover is roughly when your Lambda bill exceeds the cost of running the equivalent capacity 24/7.

### Cloud Run — The Structural Advantage

Cloud Run's key differentiator is **concurrency per instance**. Lambda handles exactly 1 request per execution environment. Cloud Run handles up to 1,000 concurrent requests per container instance.

```
   LAMBDA: 1 request : 1 environment          CLOUD RUN: N requests : 1 instance
   ┌────┐┌────┐┌────┐┌────┐┌────┐            ┌──────────────────────────┐
   │ r1 ││ r2 ││ r3 ││ r4 ││ r5 │            │      instance #1         │
   └────┘└────┘└────┘└────┘└────┘            │  r1 r2 r3 ... r80        │
   5 concurrent = 5 environments               │  (concurrency = 80)      │
   5 cold starts possible                      └──────────────────────────┘
   Cost: 5 × duration × memory                 1 instance, 1 cold start
                                                Cost: 1 × duration × (cpu+mem)
```

For an I/O-bound API this is a 10–50× cost difference in Cloud Run's favor, because a single container waiting on 80 concurrent database calls uses barely any CPU.

```bash
gcloud run deploy api \
  --image=us-docker.pkg.dev/my-project/repo/api:v1.4.2 \
  --region=us-central1 \
  --concurrency=80 \              # requests per instance — the key dial
  --cpu=1 --memory=512Mi \
  --min-instances=1 \             # 1 warm instance kills cold starts (~$13/mo)
  --max-instances=100 \           # bound the blast radius AND the bill
  --cpu-throttling \              # CPU only during request (cheaper)
  --timeout=300 \
  --service-account=api@my-project.iam.gserviceaccount.com \
  --no-allow-unauthenticated \    # IAM-gated, not public
  --vpc-connector=prod-connector \
  --vpc-egress=private-ranges-only \
  --set-secrets=DB_PASSWORD=db-password:latest
```

`--max-instances` is a cost circuit breaker. Without it, a traffic spike or a retry storm scales you to the project limit and generates a bill you will be explaining in a meeting. Set it on every service.

`--no-allow-unauthenticated` plus IAM is how you get an internal service with zero network configuration. Callers need `roles/run.invoker`. That's it — no VPC, no security groups, no load balancer.

### Event-Driven Patterns

```
   FAN-OUT

   AWS:                                  GCP:
   ┌─────────┐                           ┌──────────────┐
   │  SNS    │                           │   Pub/Sub    │
   │ topic   │                           │    topic     │
   └────┬────┘                           └──────┬───────┘
    ┌───┼───┬────┐                        ┌─────┼─────┬─────┐
    ↓   ↓   ↓    ↓                        ↓     ↓     ↓     ↓
  ┌───┐┌───┐┌──┐┌────┐                  ┌────┐┌────┐┌────┐┌────┐
  │SQS││SQS││λ ││HTTP│                  │sub1││sub2││sub3││sub4│
  └─┬─┘└─┬─┘└──┘└────┘                  └─┬──┘└─┬──┘└─┬──┘└─┬──┘
    ↓    ↓                                 ↓     ↓     ↓     ↓
  worker worker                          push  pull  push  pull

   AWS needs SNS + SQS (two services) because SQS alone has one consumer group.
   GCP needs Pub/Sub only — each subscription IS an independent queue.
```

Always put an SQS queue between SNS and a Lambda, not Lambda directly on SNS. SNS→Lambda gives you 3 retries then the message is gone. SNS→SQS→Lambda gives you a visibility timeout, configurable retries, a DLQ, and batching. The extra $0.40/million is worth it.

```hcl
resource "aws_sqs_queue" "jobs" {
  name                       = "jobs"
  visibility_timeout_seconds = 180   # MUST be >= 6x the Lambda timeout
  message_retention_seconds  = 1209600  # 14 days, the max
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.jobs_dlq.arn
    maxReceiveCount     = 5
  })
}

resource "aws_lambda_event_source_mapping" "jobs" {
  event_source_arn = aws_sqs_queue.jobs.arn
  function_name    = aws_lambda_function.worker.arn
  batch_size       = 10
  maximum_batching_window_in_seconds = 5

  # Without this, ONE poison message fails the whole batch of 10 and all 10
  # are redelivered. This reports per-message failures instead.
  function_response_types = ["ReportBatchItemFailures"]

  scaling_config { maximum_concurrency = 50 }  # protects downstream
}
```

**The visibility timeout rule is a real production trap.** If your Lambda times out at 30s but the queue's visibility timeout is 30s too, the message becomes visible again at exactly the moment the retry might still be running — you get duplicate processing. AWS's guidance is visibility timeout ≥ 6× function timeout. And **always alarm on DLQ depth > 0**. A silent DLQ is data loss you'll discover during a customer escalation.

---

## Containers & Kubernetes in the Cloud

### ECS vs EKS vs Cloud Run vs GKE

| | ECS + Fargate | EKS | GKE Standard | GKE Autopilot | Cloud Run |
|---|---|---|---|---|---|
| Control plane cost | $0 | $73/mo | $73/mo | $73/mo | $0 |
| You manage nodes | No | Yes (or Fargate) | Yes | **No** | No |
| Scale to zero | No | No | No | No | **Yes** |
| K8s API | No | Yes | Yes | Yes (restricted) | No |
| Learning curve | Low | High | High | Medium | Lowest |
| Billing unit | vCPU+GB/sec | node-hours | node-hours | **pod resource requests** | request-time CPU+mem |
| Best for | AWS-only, <20 svcs | Platform teams | Full K8s control | K8s without node ops | Spiky HTTP |

**GKE Autopilot bills you for pod resource requests, not node capacity.** That eliminates the bin-packing waste that makes Standard clusters run at 40% utilization. It also means sloppy resource requests are directly, visibly expensive — which is a good forcing function. Autopilot is my default recommendation for teams that want K8s but not node lifecycle management.

### Production EKS Configuration

```hcl
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "prod"
  cluster_version = "1.31"

  # NEVER expose the API server publicly without CIDR restrictions
  cluster_endpoint_public_access       = true
  cluster_endpoint_public_access_cidrs = ["203.0.113.0/24"]  # office + VPN only
  cluster_endpoint_private_access      = true

  cluster_enabled_log_types = [
    "api", "audit", "authenticator", "controllerManager", "scheduler"
  ]

  cluster_encryption_config = {
    provider_key_arn = aws_kms_key.eks.arn
    resources        = ["secrets"]   # envelope-encrypt etcd secrets
  }

  vpc_id     = aws_vpc.main.id
  subnet_ids = [for s in aws_subnet.private_app : s.id]

  eks_managed_node_groups = {
    system = {
      instance_types = ["m7g.large"]
      capacity_type  = "ON_DEMAND"
      min_size = 3, max_size = 6, desired_size = 3
      labels = { workload = "system" }
      taints = [{ key = "system", value = "true", effect = "NO_SCHEDULE" }]
    }
    apps = {
      instance_types = ["m7g.xlarge", "m7g.2xlarge", "m6g.xlarge"]  # diversify
      capacity_type  = "SPOT"          # 70% cheaper for stateless
      min_size = 3, max_size = 40, desired_size = 6
      labels = { workload = "apps", lifecycle = "spot" }
    }
  }

  enable_irsa = true
}
```

**Spot instance type diversification is what makes Spot survivable.** With one instance type, a capacity reclaim event takes out your whole node group at once. With 3–5 types across 3 AZs, reclaims are staggered and the cluster autoscaler backfills. Never run Spot without diversification, and never run stateful workloads or the system node group on Spot.

Pod-level hardening — the manifest fields that actually get exploited when missing:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: production
spec:
  replicas: 6
  strategy:
    type: RollingUpdate
    rollingUpdate: { maxSurge: 2, maxUnavailable: 0 }  # zero-downtime
  template:
    spec:
      serviceAccountName: api-sa
      automountServiceAccountToken: false   # unless the pod calls the K8s API
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        fsGroup: 10001
        seccompProfile: { type: RuntimeDefault }
      # Spread across AZs so one AZ loss doesn't take the service down
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: DoNotSchedule
          labelSelector: { matchLabels: { app: api } }
      containers:
        - name: api
          image: 111122223333.dkr.ecr.us-east-1.amazonaws.com/api@sha256:abc123...
          # ^ DIGEST, not a tag. Tags are mutable; digests are not.
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities: { drop: ["ALL"] }
          resources:
            requests: { cpu: "250m", memory: "512Mi" }
            limits:   { memory: "512Mi" }
            # NOTE: memory limit == request (guaranteed QoS).
            # NO CPU LIMIT — see below.
          livenessProbe:
            httpGet: { path: /healthz, port: 8080 }
            initialDelaySeconds: 30
            periodSeconds: 10
            failureThreshold: 3
          readinessProbe:
            httpGet: { path: /readyz, port: 8080 }
            periodSeconds: 5
            failureThreshold: 2
          lifecycle:
            preStop:
              exec: { command: ["sleep", "15"] }  # let endpoints propagate
      terminationGracePeriodSeconds: 60
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata: { name: api-pdb, namespace: production }
spec:
  minAvailable: 4        # node drains can't take us below this
  selector: { matchLabels: { app: api } }
```

Four things in there that are opinionated and correct:

1. **No CPU limit.** CPU limits cause CFS throttling: a container that briefly needs more CPU than its limit gets hard-stalled for the rest of the 100ms quota period, producing p99 latency spikes that look like network problems. Set CPU *requests* (for scheduling) and omit limits. Memory is different — set limit = request, because memory is incompressible and you want the OOM to be predictable and local.
2. **Image by digest, not tag.** `:latest` or even `:v1.4.2` can be overwritten in the registry. A digest is content-addressed and immutable. This closes a real supply-chain hole.
3. **`preStop: sleep 15`.** When a pod terminates, kubelet sends SIGTERM and the endpoints controller removes it from Service endpoints *concurrently*. Without the sleep, traffic keeps arriving at a shutting-down pod for a few seconds → 502s during every deploy. This is the single most common cause of "we get errors during rollouts."
4. **PDB.** Without one, a node drain (cluster autoscaler scale-down, node upgrade) can evict every replica at once.

---

## Infrastructure as Code

### Terraform State — What It Is and How It Breaks

State is Terraform's map from configuration to real-world resource IDs. It is also a **plaintext file containing every attribute of every resource, including RDS passwords and generated secrets.**

```
┌────────────────────────────────────────────────────────────────┐
│ terraform plan/apply                                            │
│                                                                 │
│  ┌───────────┐   ┌───────────┐   ┌──────────────┐              │
│  │ .tf files │   │  STATE    │   │ REAL CLOUD   │              │
│  │ (desired) │   │ (last     │   │ (actual)     │              │
│  └─────┬─────┘   │  known)   │   └──────┬───────┘              │
│        │         └─────┬─────┘          │                       │
│        │               │  ← REFRESH ────┘                       │
│        └───────► DIFF ◄┘                                        │
│                   │                                             │
│                   ↓                                             │
│         plan = desired − actual                                 │
│                                                                 │
│  DRIFT = someone changed the cloud without Terraform.           │
│          Refresh catches it; plan proposes reverting it.        │
└────────────────────────────────────────────────────────────────┘
```

❌ **WRONG — local state:**

```hcl
terraform {
  required_version = ">= 1.9"
  # No backend block = state in terraform.tfstate on someone's laptop.
}
```

Failure modes: laptop dies, state gone, every resource orphaned. Two engineers apply simultaneously, one overwrites the other's state, resources become invisible to Terraform. Secrets committed to git. All four of these have happened to teams I've worked with.

✅ **CORRECT — remote state with locking, encryption, and versioning:**

```hcl
terraform {
  required_version = ">= 1.9.0"

  backend "s3" {
    bucket = "acme-tfstate-us-east-1"
    key    = "prod/networking/terraform.tfstate"
    region = "us-east-1"

    encrypt        = true
    kms_key_id     = "arn:aws:kms:us-east-1:111122223333:key/abc-123"
    use_lockfile   = true      # native S3 locking (TF >= 1.10), no DynamoDB
    # dynamodb_table = "terraform-locks"   # pre-1.10 approach
  }

  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.70" }
  }
}
```

The state bucket itself must be created out-of-band (chicken-and-egg) and configured with:

```hcl
resource "aws_s3_bucket_versioning" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id
  versioning_configuration { status = "Enabled" }
  # Versioning IS your state recovery mechanism. See War Story 4.
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.tfstate.arn
    }
  }
}
```

```hcl
# GCS backend — GCS has built-in object locking, no extra table needed
terraform {
  backend "gcs" {
    bucket = "acme-tfstate"
    prefix = "prod/networking"
  }
}
```

**State splitting is a scaling requirement, not a nicety.** A monolithic state with 2,000 resources takes 10+ minutes to refresh, and every change requires locking the entire infrastructure. Split by blast radius and change frequency:

```
terraform/
├── 000-bootstrap/      # state bucket, KMS key, OIDC providers (rarely changes)
├── 100-org/            # Organizations, SCPs, accounts
├── 200-network/        # VPC, subnets, TGW      ← changes monthly
├── 300-data/           # RDS, S3, ElastiCache   ← changes monthly
├── 400-platform/       # EKS, shared services
└── 500-apps/
    ├── api/            # ← changes daily
    └── worker/
```

Cross-state references via **data sources**, not `terraform_remote_state`:

```hcl
# ❌ WRONG — couples app state to network state's internal structure and
#    requires read access to the whole network state file (which has secrets)
data "terraform_remote_state" "network" {
  backend = "s3"
  config  = { bucket = "acme-tfstate", key = "prod/networking/terraform.tfstate" }
}
subnet_ids = data.terraform_remote_state.network.outputs.private_subnet_ids

# ✅ CORRECT — query the cloud API by tag. Decoupled, no state access needed.
data "aws_vpc" "main" {
  filter { name = "tag:Name"  values = ["prod-vpc"] }
}
data "aws_subnets" "private" {
  filter { name = "vpc-id"  values = [data.aws_vpc.main.id] }
  filter { name = "tag:Tier"  values = ["private-app"] }
}
subnet_ids = data.aws_subnets.private.ids
```

### Modules

```hcl
# modules/service/variables.tf — validated inputs catch errors at plan time
variable "environment" {
  type = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be dev, staging, or prod."
  }
}

variable "min_capacity" {
  type    = number
  default = 2
  validation {
    condition     = var.min_capacity >= 2
    error_message = "min_capacity must be >= 2 for AZ redundancy."
  }
}

# Usage — always pin the version
module "api" {
  source  = "git::https://github.com/acme/tf-modules.git//service?ref=v2.4.1"
  # ❌ never: source = "git::https://github.com/acme/tf-modules.git//service"
  #    (unpinned = your infra changes when someone else merges to main)

  environment  = "prod"
  min_capacity = 6
}
```

**Module design rules from experience:**
- A module should own one logical unit with a clear boundary (a service, a VPC), not "all our AWS resources."
- Do not build a module until you have three real callers. Premature abstraction produces modules with 40 boolean flags that nobody can reason about.
- Never use `count` on resources whose identity matters — `count` indexes by position, so removing element 1 of 3 destroys and recreates elements 2 and 3. Use `for_each` with a stable key map. This has caused production database deletions.

```hcl
# ❌ WRONG — removing "b" from the list destroys/recreates "c"
resource "aws_instance" "app" {
  count = length(var.names)   # aws_instance.app[0], [1], [2]
  tags  = { Name = var.names[count.index] }
}

# ✅ CORRECT — keys are stable; removing "b" only touches "b"
resource "aws_instance" "app" {
  for_each = toset(var.names)  # aws_instance.app["a"], ["b"], ["c"]
  tags     = { Name = each.key }
}
```

### Drift Detection and Prevention

```bash
# Detect drift without changing anything (exit 2 = drift present)
terraform plan -refresh-only -detailed-exitcode

# Run this on a schedule and alert. Drift that sits for weeks becomes
# "we can't apply Terraform anymore because it wants to delete prod."
```

```yaml
# .github/workflows/drift.yml
name: terraform-drift
on:
  schedule: [{ cron: "0 7 * * 1-5" }]
jobs:
  drift:
    runs-on: ubuntu-latest
    permissions: { id-token: write, contents: read }
    strategy:
      matrix: { stack: [200-network, 300-data, 400-platform] }
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::111122223333:role/terraform-readonly
          aws-region: us-east-1
      - run: terraform init -input=false
        working-directory: terraform/${{ matrix.stack }}
      - id: plan
        run: terraform plan -refresh-only -detailed-exitcode -no-color
        continue-on-error: true
        working-directory: terraform/${{ matrix.stack }}
      - if: steps.plan.outcome == 'failure'
        run: gh issue create --title "Drift in ${{ matrix.stack }}" --body "..."
```

**Structural drift prevention** is better than detection: nobody should have write access to production via the console. Humans get `ReadOnlyAccess` plus a break-glass role that requires MFA and fires an alert. All writes go through the CI role. This is unpopular for about three weeks and then everyone prefers it.

Policy-as-code in the pipeline catches the rest:

```hcl
# Checkov / tfsec / OPA in CI
# checkov -d terraform/ --framework terraform \
#   --skip-check CKV_AWS_18 --hard-fail-on HIGH
```

---

## Observability

### Metrics, Logs, Traces — And Cardinality

| | AWS | GCP | Watch out for |
|---|---|---|---|
| Metrics | CloudWatch Metrics | Cloud Monitoring | **Custom metric dimensions cost $0.30/metric/month each** |
| Logs | CloudWatch Logs | Cloud Logging | **$0.50/GB ingest** (AWS), $0.50/GiB (GCP) |
| Traces | X-Ray | Cloud Trace | $5 per 1M traces recorded |
| Dashboards | CloudWatch Dashboards | Cloud Monitoring | 3 free, then $3/dashboard/mo |
| Log query | Logs Insights ($0.005/GB scanned) | Log Analytics (BigQuery-backed) | |

**Cardinality is the cost bomb.** A CloudWatch custom metric with dimensions `[service, endpoint, status_code, customer_id]` where `customer_id` has 10,000 values creates 10,000+ distinct metrics at $0.30 each = **$3,000/month for one metric**. I watched a team add `user_id` as a dimension for "better debugging" and generate an $18,000 monthly observability bill in three weeks.

**Rule: never put unbounded identifiers in metric dimensions.** They go in log fields or trace attributes, which are cheap to store and queryable, not in metric dimensions, which are multiplicative.

Use **Embedded Metric Format** to get metrics out of logs at log prices:

```javascript
// EMF: CloudWatch extracts metrics from structured logs automatically.
// One log line → metrics + high-cardinality searchable fields.
console.log(JSON.stringify({
  _aws: {
    Timestamp: Date.now(),
    CloudWatchMetrics: [{
      Namespace: "Acme/API",
      Dimensions: [["Service", "Endpoint"]],   // LOW cardinality only
      Metrics: [
        { Name: "Latency", Unit: "Milliseconds" },
        { Name: "DBQueryTime", Unit: "Milliseconds" }
      ]
    }]
  },
  Service: "checkout",
  Endpoint: "/api/v1/orders",
  Latency: 142,
  DBQueryTime: 38,
  // High-cardinality fields: searchable in Logs Insights, NOT metric dims
  requestId: "7f3a9c2e-...",
  userId: "usr_8823",
  traceId: "1-5e1b4151-5ac6c58f5b0d3e7b9a2c1d4e",
}));
```

### Log Retention — The Default That Costs You

```hcl
# ❌ WRONG: no log group defined, so Lambda/ECS auto-creates it with
#    retention = NEVER EXPIRE. You will pay $0.03/GB/month forever.

# ✅ CORRECT: define it explicitly, always set retention
resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/lambda/api-handler"
  retention_in_days = 30
  kms_key_id        = aws_kms_key.logs.arn
}
```

```bash
# Find every log group with infinite retention (there will be many)
aws logs describe-log-groups \
  --query 'logGroups[?!retentionInDays].{Name:logGroupName,Bytes:storedBytes}' \
  --output table

# Fix them in bulk
aws logs describe-log-groups --query 'logGroups[?!retentionInDays].logGroupName' \
  --output text | tr '\t' '\n' | while read lg; do
    aws logs put-retention-policy --log-group-name "$lg" --retention-in-days 30
  done
```

Standard retention tiers I use: **30 days** for application logs (hot debugging), **90 days** for access logs, **1 year in S3** for anything with a compliance requirement (via a subscription filter to Firehose → S3, which is far cheaper than CloudWatch storage), **7 years** for audit logs in Glacier.

### SLOs, Not Uptime Checks

```yaml
# GCP SLO — explicit error budget
displayName: "API availability 99.9%"
serviceLevelIndicator:
  requestBased:
    goodTotalRatio:
      goodServiceFilter: >
        metric.type="loadbalancing.googleapis.com/https/request_count"
        resource.type="https_lb_rule"
        metric.label.response_code_class!="500"
      totalServiceFilter: >
        metric.type="loadbalancing.googleapis.com/https/request_count"
        resource.type="https_lb_rule"
goal: 0.999
rollingPeriod: 2592000s   # 30 days
# 99.9% over 30 days = 43m 12s of error budget.
# Burn-rate alerting: page at 14.4x burn over 1h (2% of budget in 1 hour),
# ticket at 6x over 6h. Do NOT page on raw error count.
```

**Multi-window multi-burn-rate alerting** is the thing that distinguishes an experienced operator. Alerting on "error rate > 1%" pages you for a 30-second blip. Alerting on error *budget burn rate* pages you only when the current rate would exhaust the month's budget — that is, when it actually matters.

```hcl
# AWS composite alarm — alert on symptoms, and suppress when a known
# dependency is already alarming (reduces alert fatigue)
resource "aws_cloudwatch_composite_alarm" "api_degraded" {
  alarm_name = "api-degraded"
  alarm_rule = join(" OR ", [
    "ALARM(${aws_cloudwatch_metric_alarm.p99_latency.alarm_name})",
    "ALARM(${aws_cloudwatch_metric_alarm.error_rate.alarm_name})",
  ])
  actions_suppressor                        = aws_cloudwatch_metric_alarm.rds_down.alarm_name
  actions_suppressor_wait_period            = 60
  actions_suppressor_extension_period       = 120
  alarm_actions = [aws_sns_topic.pager.arn]
}
```

**Alert on symptoms (latency, error rate, saturation), not causes (CPU, memory).** High CPU is only a problem if users notice. Paging on CPU trains your team to ignore pages.

---

## Security

### Encryption: At Rest and In Transit

| | AWS | GCP |
|---|---|---|
| Default at-rest encryption | Opt-in for EBS/S3 historically; now default for new S3, EBS via account setting | **Always on, everywhere, by default** |
| Key management | KMS ($1/key/mo, $0.03/10k reqs) | Cloud KMS ($0.06/key version/mo) |
| Customer-managed keys | CMK | CMEK |
| Bring your own key | Import key material | CMEK with external key manager |
| HSM | CloudHSM ($1.45/hr ≈ $1,058/mo) | Cloud HSM |
| Envelope encryption | Yes (data key + CMK) | Yes |

**GCP encrypts everything at rest by default with Google-managed keys.** AWS historically did not — which is why "is your EBS encrypted?" is a real audit finding on AWS and a non-question on GCP. Turn on the account-level default:

```bash
aws ec2 enable-ebs-encryption-by-default --region us-east-1
aws ec2 modify-ebs-default-kms-key-id --kms-key-id alias/ebs-default
# Do this in EVERY region, including ones you don't use — an attacker
# spinning up unencrypted resources in ap-south-1 is a real pattern.
```

**Envelope encryption** is worth being able to explain:

```
   Plaintext data
        │
        │ encrypted with →  DATA KEY (256-bit AES, generated per object)
        ↓
   Ciphertext ──────────────────────────────┐
                                             │  stored together
   DATA KEY                                  │
        │ encrypted with → CMK (never leaves KMS/HSM)
        ↓                                    │
   Encrypted data key ───────────────────────┘

   Why: the CMK never touches your data plane. To decrypt, you call
   KMS:Decrypt with the ~200-byte encrypted data key, get the plaintext
   data key back, and decrypt locally. KMS never sees your data, and
   rotating the CMK doesn't require re-encrypting petabytes.
```

`bucket_key_enabled = true` on S3 is the practical application: it generates one bucket-level key that covers many objects, cutting KMS API calls by up to 99%. On a bucket with 500M objects, that is the difference between $1,500/month in KMS requests and $15.

```hcl
resource "aws_kms_key" "app" {
  description             = "App data encryption key"
  enable_key_rotation     = true          # annual automatic rotation
  deletion_window_in_days = 30            # 7-30; never use 7 in prod
  multi_region            = false

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "EnableRootAccountAdmin"
        Effect    = "Allow"
        Principal = { AWS = "arn:aws:iam::111122223333:root" }
        Action    = "kms:*"
        Resource  = "*"
        # WITHOUT this statement the key becomes UNMANAGEABLE and
        # AWS Support cannot recover it. This is a permanent mistake.
      },
      {
        Sid       = "AllowAppUse"
        Effect    = "Allow"
        Principal = { AWS = aws_iam_role.app.arn }
        Action    = ["kms:Decrypt", "kms:GenerateDataKey", "kms:DescribeKey"]
        Resource  = "*"
        Condition = {
          StringEquals = { "kms:ViaService" = "s3.us-east-1.amazonaws.com" }
        }
      }
    ]
  })
}
```

The `EnableRootAccountAdmin` statement is not optional. A KMS key policy that doesn't grant the account root full access is orphaned — no IAM policy can override a key policy, and AWS Support explicitly cannot help. I have seen a team lock themselves out of a key encrypting 40 TB of production backups this way.

### Secrets Management

❌ **WRONG — every variation of this is a breach waiting to happen:**

```hcl
resource "aws_ecs_task_definition" "app" {
  container_definitions = jsonencode([{
    environment = [
      { name = "DB_PASSWORD", value = "SuperSecret123!" },  # in the task def,
      { name = "API_KEY",     value = "sk_live_abc123" }    # in git, in the
    ]                                                        # console, in
  }])                                                        # CloudTrail
}
```

Environment variables in a task definition are visible to anyone with `ecs:DescribeTaskDefinition`, appear in the console, get committed to git, and end up in Terraform state.

✅ **CORRECT — reference, don't embed:**

```hcl
resource "aws_secretsmanager_secret" "db" {
  name                    = "prod/api/db"
  kms_key_id              = aws_kms_key.secrets.arn
  recovery_window_in_days = 30
}

resource "aws_secretsmanager_secret_rotation" "db" {
  secret_id           = aws_secretsmanager_secret.db.id
  rotation_lambda_arn = aws_lambda_function.rotator.arn
  rotation_rules { automatically_after_days = 30 }
}

resource "aws_ecs_task_definition" "app" {
  container_definitions = jsonencode([{
    name = "app"
    # `secrets`, not `environment`. ECS injects at runtime from the
    # execution role; the value never appears in the task definition.
    secrets = [
      { name = "DB_PASSWORD", valueFrom = "${aws_secretsmanager_secret.db.arn}:password::" },
      { name = "API_KEY",     valueFrom = aws_ssm_parameter.api_key.arn }
    ]
  }])
  execution_role_arn = aws_iam_role.ecs_execution.arn
}
```

**Cost note:** Secrets Manager is $0.40/secret/month + $0.05 per 10,000 API calls. SSM Parameter Store Standard is **free** (10,000 params, 4 KB each) and supports KMS encryption via `SecureString`. Use Parameter Store for config and non-rotating secrets; use Secrets Manager only where you need automatic rotation or cross-account resource policies. A team with 400 microservices × 5 secrets each on Secrets Manager is paying $800/month for something Parameter Store does free.

```bash
# GCP Secret Manager: $0.06/version/month + $0.03/10k access ops
gcloud secrets create db-password --replication-policy=automatic
echo -n "$PASSWORD" | gcloud secrets versions add db-password --data-file=-

gcloud secrets add-iam-policy-binding db-password \
  --member="serviceAccount:api@my-project.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Mounted into Cloud Run with zero application code
gcloud run deploy api --set-secrets=DB_PASSWORD=db-password:latest
```

**Cache secret lookups.** A Lambda calling `GetSecretValue` on every invocation adds ~30ms and, at 50M invocations, $250/month in API calls. Fetch once at init, cache in module scope, refresh on a TTL or on auth failure.

### The Security Checklist I Actually Run

```bash
# 1. Public S3 buckets
aws s3api list-buckets --query 'Buckets[].Name' --output text | tr '\t' '\n' | \
  while read b; do
    pab=$(aws s3api get-public-access-block --bucket "$b" 2>/dev/null || echo "NONE")
    [[ "$pab" == "NONE" ]] && echo "NO PUBLIC ACCESS BLOCK: $b"
  done

# 2. IAM users with access keys older than 90 days
aws iam generate-credential-report >/dev/null 2>&1; sleep 5
aws iam get-credential-report --query Content --output text | base64 -d | \
  awk -F, 'NR>1 && $9=="true" {print $1, $10}'

# 3. Security groups open to the world on sensitive ports
aws ec2 describe-security-groups --query \
 'SecurityGroups[?IpPermissions[?IpRanges[?CidrIp==`0.0.0.0/0`] &&
   (FromPort==`22` || FromPort==`3389` || FromPort==`5432` || FromPort==`3306`)]].
   {Id:GroupId,Name:GroupName}' --output table

# 4. Unencrypted EBS volumes
aws ec2 describe-volumes --query 'Volumes[?!Encrypted].VolumeId' --output text

# 5. Root account usage in the last 30 days (should be ZERO)
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=Username,AttributeValue=root \
  --start-time "$(date -u -v-30d '+%Y-%m-%dT%H:%M:%SZ')" \
  --query 'Events[].{Time:EventTime,Event:EventName}' --output table

# 6. Roles that can escalate privileges (Access Analyzer)
aws accessanalyzer list-findings --analyzer-arn "$ANALYZER" \
  --filter '{"status":{"eq":["ACTIVE"]}}' \
  --query 'findings[?isPublic==`true`]' --output table
```

```bash
# GCP: Security Command Center findings, sorted by severity
gcloud scc findings list "organizations/123456789012" \
  --filter="state=\"ACTIVE\" AND severity=\"HIGH\"" \
  --format="table(category, resourceName, eventTime)"

# Who has org-level Owner? (should be nobody, or a break-glass group)
gcloud organizations get-iam-policy 123456789012 \
  --flatten="bindings[].members" \
  --filter="bindings.role:roles/owner" \
  --format="value(bindings.members)"

# Service account keys that exist at all (they shouldn't)
for p in $(gcloud projects list --format="value(projectId)"); do
  for sa in $(gcloud iam service-accounts list --project="$p" --format="value(email)"); do
    gcloud iam service-accounts keys list --iam-account="$sa" --project="$p" \
      --managed-by=user --format="value(name,validAfterTime)" 2>/dev/null
  done
done
```

<!--SECTION-RELIABILITY-->
