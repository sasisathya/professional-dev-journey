# Docker & Kubernetes - Professional Interview Guide

## Table of Contents
1. [Docker Fundamentals](#docker-fundamentals)
2. [Docker Images & Containers](#docker-images--containers)
3. [Docker Networking & Volumes](#docker-networking--volumes)
4. [Docker Compose](#docker-compose)
5. [Kubernetes Fundamentals](#kubernetes-fundamentals)
6. [Kubernetes Objects](#kubernetes-objects)
7. [Kubernetes Advanced](#kubernetes-advanced)
8. [Best Practices](#best-practices)

---

## Docker Fundamentals

### What is Docker?
**Docker** is a platform for developing, shipping, and running applications in **containers**. Containers package application with all dependencies, ensuring consistency across environments (dev, test, prod).

**Key benefits:**
- **Portability:** Run anywhere (laptop, server, cloud)
- **Isolation:** Each container isolated from others
- **Lightweight:** Share OS kernel, faster than VMs
- **Consistency:** "Works on my machine" → "Works everywhere"
- **Scalability:** Easy to scale up/down

**Key takeaway:** Containerization platform. Portable, isolated, lightweight.

---

### Containers vs Virtual Machines
**Virtual Machines:**
- Full OS per VM
- Hypervisor (VMware, VirtualBox)
- Heavy (GBs), slow boot (minutes)
- Complete isolation (separate kernel)

**Containers:**
- Share host OS kernel
- Container runtime (Docker, containerd)
- Lightweight (MBs), fast boot (seconds)
- Process-level isolation

```
VM: App → Guest OS → Hypervisor → Host OS → Hardware
Container: App → Container Runtime → Host OS → Hardware
```

**Key takeaway:** Containers = lightweight, fast. VMs = complete isolation, heavy.

---

### Docker Architecture
**Components:**
1. **Docker Daemon (dockerd):** Background service managing containers
2. **Docker Client (docker CLI):** User interface
3. **Docker Registry (Docker Hub):** Store and distribute images
4. **Images:** Read-only templates (blueprints)
5. **Containers:** Running instances of images

**Workflow:**
```
Dockerfile → Build → Image → Run → Container
```

**Key takeaway:** Client-server architecture. Client → Daemon → Containers.

---

## Docker Images & Containers

### Dockerfile
**Definition:** Text file with instructions to build Docker image.

**Example:**
```dockerfile
# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "server.js"]
```

**Common instructions:**
- **FROM:** Base image
- **WORKDIR:** Set working directory
- **COPY / ADD:** Copy files from host to image
- **RUN:** Execute command during build (install packages)
- **CMD:** Default command when container starts
- **ENTRYPOINT:** Configure container as executable
- **EXPOSE:** Document port (doesn't publish)
- **ENV:** Set environment variables
- **ARG:** Build-time variables

**Key takeaway:** Dockerfile = recipe for image. FROM → RUN → CMD.

---

### Image Layers
**How it works:**
- Each instruction creates a new layer
- Layers are cached and reusable
- Only changed layers are rebuilt

**Example:**
```dockerfile
FROM node:18        # Layer 1
COPY package.json   # Layer 2 (cached if package.json unchanged)
RUN npm install     # Layer 3 (cached if Layer 2 unchanged)
COPY . .            # Layer 4 (rebuilt on code changes)
```

**Best practice:** Order Dockerfile from least to most frequently changing.

**Key takeaway:** Layered file system. Cache for faster builds.

---

### Docker Commands
**Build image:**
```bash
docker build -t myapp:v1 .
```

**Run container:**
```bash
docker run -d -p 8080:3000 --name myapp-container myapp:v1
# -d = detached, -p = port mapping (host:container), --name = container name
```

**List containers:**
```bash
docker ps          # Running containers
docker ps -a       # All containers (including stopped)
```

**List images:**
```bash
docker images
```

**Stop/start/restart:**
```bash
docker stop myapp-container
docker start myapp-container
docker restart myapp-container
```

**Remove:**
```bash
docker rm myapp-container     # Remove container
docker rmi myapp:v1           # Remove image
```

**Logs:**
```bash
docker logs myapp-container
docker logs -f myapp-container  # Follow
```

**Execute command in container:**
```bash
docker exec -it myapp-container bash  # Interactive shell
docker exec myapp-container ls /app   # Run command
```

**Key takeaway:** build → run → logs → exec. -it for interactive.

---

### Multi-stage Builds
**Definition:** Use multiple FROM statements to reduce final image size.

**Example (Node.js app):**
```dockerfile
# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install --production
CMD ["node", "dist/server.js"]
```

**Benefits:**
- Smaller final image (no build tools)
- Faster deployment
- More secure (fewer dependencies)

**Key takeaway:** Build → Copy artifacts → Small production image.

---

## Docker Networking & Volumes

### Docker Networking
**Network types:**
1. **bridge (default):** Isolated network for containers on same host
2. **host:** Container uses host network (no isolation)
3. **none:** No networking
4. **overlay:** Multi-host networking (Swarm, Kubernetes)

**Create network:**
```bash
docker network create mynetwork
```

**Run container on network:**
```bash
docker run -d --network mynetwork --name app myapp
docker run -d --network mynetwork --name db postgres
# Containers communicate via container names: app can connect to 'db'
```

**Inspect:**
```bash
docker network inspect mynetwork
```

**Key takeaway:** Bridge = default. Containers communicate via names on same network.

---

### Docker Volumes
**Definition:** Persist data outside container lifecycle. Survive container deletion.

**Types:**
1. **Named volumes (managed by Docker):**
```bash
docker volume create mydata
docker run -v mydata:/app/data myapp
```

2. **Bind mounts (host directory):**
```bash
docker run -v /host/path:/container/path myapp
```

3. **tmpfs (in-memory, non-persistent):**
```bash
docker run --tmpfs /app/temp myapp
```

**Use cases:**
- Database data (persistent)
- Configuration files (bind mount)
- Logs (named volume)

**Commands:**
```bash
docker volume ls
docker volume inspect mydata
docker volume rm mydata
```

**Key takeaway:** Volumes = persist data. Named volumes preferred.

---

## Docker Compose

### What is Docker Compose?
**Definition:** Tool for defining and running multi-container Docker applications using YAML file.

**Use case:** Define entire stack (app, database, cache) in single file.

**Key takeaway:** Multi-container orchestration. YAML configuration.

---

### docker-compose.yml
**Example (Node.js + MongoDB + Redis):**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGO_URL=mongodb://db:27017/mydb
      - REDIS_URL=redis://cache:6379
    depends_on:
      - db
      - cache
    networks:
      - mynetwork

  db:
    image: mongo:6
    volumes:
      - mongo-data:/data/db
    networks:
      - mynetwork

  cache:
    image: redis:7-alpine
    networks:
      - mynetwork

volumes:
  mongo-data:

networks:
  mynetwork:
```

**Key sections:**
- **services:** Containers to run
- **build / image:** Build from Dockerfile or pull image
- **ports:** Host:container port mapping
- **environment:** Environment variables
- **depends_on:** Start order (db before app)
- **volumes:** Persistent storage
- **networks:** Container networking

**Key takeaway:** Define multi-container app in YAML. Services, volumes, networks.

---

### Docker Compose Commands
```bash
docker-compose up -d          # Start all services (detached)
docker-compose down           # Stop and remove containers
docker-compose ps             # List services
docker-compose logs app       # View logs for service
docker-compose exec app bash  # Execute command in service
docker-compose build          # Rebuild images
docker-compose restart app    # Restart service
```

**Key takeaway:** up/down = start/stop. Manages entire stack.

---

## Kubernetes Fundamentals

### What is Kubernetes?
**Kubernetes (K8s)** is a container orchestration platform. Automates deployment, scaling, and management of containerized applications.

**Key features:**
- **Auto-scaling:** Scale based on load
- **Self-healing:** Restart failed containers
- **Load balancing:** Distribute traffic
- **Rolling updates:** Zero-downtime deployments
- **Service discovery:** Auto DNS for services
- **Storage orchestration:** Manage persistent volumes

**Key takeaway:** Container orchestration. Auto-scaling, self-healing, load balancing.

---

### Kubernetes Architecture
**Master Node (Control Plane):**
1. **API Server:** Frontend to K8s (kubectl communicates with this)
2. **etcd:** Key-value store (cluster state)
3. **Scheduler:** Assigns pods to nodes
4. **Controller Manager:** Maintains desired state (replication, endpoints)

**Worker Nodes:**
1. **kubelet:** Agent running on each node, manages pods
2. **kube-proxy:** Network proxy, load balancing
3. **Container Runtime:** Docker, containerd, CRI-O

**Workflow:**
```
kubectl → API Server → Scheduler → kubelet → Container Runtime
```

**Key takeaway:** Master = control plane, Worker = runs containers.

---

### kubectl Basics
**kubectl:** Command-line tool to interact with Kubernetes.

```bash
kubectl get pods                    # List pods
kubectl get nodes                   # List nodes
kubectl get services                # List services
kubectl describe pod mypod          # Detailed info
kubectl logs mypod                  # Pod logs
kubectl exec -it mypod -- bash      # Shell into pod
kubectl apply -f deployment.yaml    # Create resources from file
kubectl delete pod mypod            # Delete pod
kubectl scale deployment myapp --replicas=5  # Scale
```

**Key takeaway:** kubectl = K8s CLI. get, describe, logs, apply.

---

## Kubernetes Objects

### Pods
**Definition:** Smallest deployable unit. One or more containers sharing network and storage.

**YAML:**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mypod
spec:
  containers:
  - name: app
    image: myapp:v1
    ports:
    - containerPort: 3000
```

**Key points:**
- Usually managed by Deployments, not created directly
- Share localhost (containers in same pod communicate via localhost)
- Share volumes

**Key takeaway:** Smallest unit. 1+ containers. Managed by Deployments.

---

### Deployments
**Definition:** Manages ReplicaSets, which manage Pods. Declarative updates, rolling deployments.

**YAML:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: myapp:v1
        ports:
        - containerPort: 3000
```

**Key features:**
- **replicas:** Number of pods
- **selector:** Match labels to manage pods
- **template:** Pod specification

**Rolling update:**
```bash
kubectl set image deployment/myapp app=myapp:v2
```

**Key takeaway:** Manages pods. Replication, rolling updates.

---

### Services
**Definition:** Stable network endpoint to access pods. Load balancing across pods.

**Types:**
1. **ClusterIP (default):** Internal IP, accessible within cluster
2. **NodePort:** Exposes on each node's IP at static port
3. **LoadBalancer:** Cloud load balancer (AWS ELB, GCP LB)
4. **ExternalName:** DNS CNAME record

**YAML (ClusterIP):**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  type: ClusterIP
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 3000
```

**How it works:** Service selects pods by label, load balances traffic.

**Key takeaway:** Stable endpoint. Load balancing. Types: ClusterIP, NodePort, LoadBalancer.

---

### ConfigMaps and Secrets
**ConfigMap:** Store non-sensitive configuration.
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DATABASE_URL: "mongodb://db:27017"
  LOG_LEVEL: "info"
```

**Secret:** Store sensitive data (base64 encoded).
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  password: cGFzc3dvcmQxMjM=  # base64 encoded
```

**Use in Pod:**
```yaml
containers:
- name: app
  image: myapp
  env:
  - name: DATABASE_URL
    valueFrom:
      configMapKeyRef:
        name: app-config
        key: DATABASE_URL
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: app-secret
        key: password
```

**Key takeaway:** ConfigMap = config, Secret = sensitive data.

---

### Volumes and PersistentVolumes
**Volume:** Storage in pod (ephemeral or persistent).

**PersistentVolume (PV):** Cluster-level storage resource.
**PersistentVolumeClaim (PVC):** Request for storage by pod.

**PVC example:**
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-pvc
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

**Use in Pod:**
```yaml
volumes:
- name: app-storage
  persistentVolumeClaim:
    claimName: app-pvc
containers:
- name: app
  volumeMounts:
  - name: app-storage
    mountPath: /data
```

**Key takeaway:** PV = storage, PVC = request, Volume = mount in pod.

---

### Namespaces
**Definition:** Virtual clusters within physical cluster. Isolate resources.

**Default namespaces:**
- `default`: Default for objects without namespace
- `kube-system`: Kubernetes system components
- `kube-public`: Public resources

**Create namespace:**
```bash
kubectl create namespace dev
```

**Use namespace:**
```bash
kubectl get pods -n dev
kubectl apply -f deployment.yaml -n dev
```

**Key takeaway:** Resource isolation. Multi-tenancy.

---

## Kubernetes Advanced

### Ingress
**Definition:** Manages external access to services (HTTP/HTTPS routing).

**Example:**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp-service
            port:
              number: 80
```

**Use case:** Route `myapp.example.com` → `myapp-service`

**Requires:** Ingress Controller (Nginx, Traefik, AWS ALB)

**Key takeaway:** HTTP/HTTPS routing. Single entry point.

---

### StatefulSets
**Definition:** For stateful applications (databases). Guarantees pod identity and ordering.

**Features:**
- Stable network identity (predictable pod names)
- Persistent storage (PVCs)
- Ordered deployment/scaling

**Use case:** Databases (MongoDB, MySQL), message queues (Kafka)

**Key takeaway:** Stateful apps. Stable identity, persistent storage.

---

### DaemonSets
**Definition:** Ensures pod runs on all (or selected) nodes.

**Use cases:**
- Log collectors (Fluentd)
- Monitoring agents (Prometheus Node Exporter)
- Network plugins

**Key takeaway:** One pod per node. Monitoring, logging.

---

### Jobs and CronJobs
**Job:** Run task to completion (batch processing).
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: backup-job
spec:
  template:
    spec:
      containers:
      - name: backup
        image: backup-tool
      restartPolicy: Never
```

**CronJob:** Scheduled jobs (like cron).
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: daily-backup
spec:
  schedule: "0 2 * * *"  # 2 AM daily
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: backup-tool
          restartPolicy: Never
```

**Key takeaway:** Job = one-time, CronJob = scheduled.

---

### Auto-scaling
**Horizontal Pod Autoscaler (HPA):** Scale pods based on CPU/memory.
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

**Vertical Pod Autoscaler (VPA):** Adjust CPU/memory requests.

**Cluster Autoscaler:** Add/remove nodes based on pending pods.

**Key takeaway:** HPA = scale pods, VPA = adjust resources, Cluster = scale nodes.

---

### Health Checks
**Liveness Probe:** Is container alive? Restart if fails.
**Readiness Probe:** Is container ready to serve traffic? Remove from service if fails.

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

**Key takeaway:** Liveness = restart, Readiness = traffic routing.

---

## Best Practices

### Docker Best Practices
1. **Small images:** Use alpine base, multi-stage builds
2. **Layer caching:** Order Dockerfile least to most changing
3. **.dockerignore:** Exclude unnecessary files
4. **Non-root user:** Run as non-root for security
5. **Single process per container:** One concern per container
6. **Health checks:** Use HEALTHCHECK instruction
7. **Version tags:** Never use `latest` in production
8. **Scan images:** Security vulnerabilities (Trivy, Snyk)

**Key takeaway:** Small, secure, cacheable images.

---

### Kubernetes Best Practices
1. **Resource limits:** Set CPU/memory requests and limits
```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 200m
    memory: 256Mi
```

2. **Health checks:** Liveness and readiness probes
3. **Security:**
   - Non-root containers
   - RBAC (Role-Based Access Control)
   - Network policies
   - Pod Security Policies

4. **Configuration:** Use ConfigMaps and Secrets, not hardcoded values
5. **Namespaces:** Isolate environments (dev, staging, prod)
6. **Labels:** Organize resources
7. **Rolling updates:** Zero-downtime deployments
8. **Logging:** Centralized logging (ELK, Fluentd)
9. **Monitoring:** Prometheus + Grafana
10. **Backups:** Regular etcd backups

**Key takeaway:** Resources, health checks, security, configuration externalization.

---

## Interview Tips

1. **Explain benefits:** "Docker ensures consistency: same environment dev to prod."
2. **Use real examples:** "Used multi-stage builds to reduce image size from 1GB to 200MB."
3. **Discuss orchestration:** "Kubernetes handles auto-scaling, self-healing better than manual Docker."
4. **Know trade-offs:** "StatefulSets for databases (ordered, persistent), Deployments for stateless apps."
5. **Security:** "Run containers as non-root, use secrets for credentials, scan images for vulnerabilities."

---

**Updated:** 2026-06-28 | **Level:** Intermediate-Advanced | **Format:** Interview-ready definitions
