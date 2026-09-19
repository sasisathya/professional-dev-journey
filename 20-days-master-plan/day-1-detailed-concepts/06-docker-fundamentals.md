# Docker Fundamentals - Complete Interview Guide

## Table of Contents
1. [What is Docker?](#what-is-docker)
2. [Containers vs VMs](#containers-vs-vms)
3. [Docker Architecture](#docker-architecture)
4. [Images and Containers](#images-and-containers)
5. [Dockerfile](#dockerfile)
6. [Docker Commands](#docker-commands)
7. [Docker Compose](#docker-compose)
8. [Interview Questions](#interview-questions)

---

## What is Docker?

**Docker:** A platform for developing, shipping, and running applications in containers. Ensures consistency across development, testing, and production environments.

### Key Benefits
1. **Consistency** - Works same way everywhere
2. **Isolation** - Each container is independent
3. **Lightweight** - Shares host OS kernel
4. **Scalability** - Easy to scale containers
5. **Efficiency** - Less resource usage than VMs

### Docker vs Traditional Approach
```
Traditional:
┌─────────────────────────┐
│  App 1 (Node.js) + NPM  │
├─────────────────────────┤
│       OS & Libraries    │
├─────────────────────────┤
│      Virtual Machine    │
├─────────────────────────┤
│   Host Operating System │
└─────────────────────────┘

Docker:
┌──────────────────────┐
│  App 1 Container     │
│  (Node.js + NPM)     │
├──────────────────────┤
│     Docker Engine    │
├──────────────────────┤
│ Host Operating System│
└──────────────────────┘
```

---

## Containers vs VMs

### Virtual Machine (VM)
- **Complete** hardware & OS virtualization
- **Size:** 1-5+ GB per VM
- **Startup Time:** 1-2+ minutes
- **Performance:** Slower (full OS overhead)
- **Isolation:** Strong (each has own OS)

```
┌─────────────────────────────────┐
│  App 1  │  App 2  │  App 3      │
├─────────────────────────────────┤
│  OS 1   │  OS 2   │  OS 3       │
├─────────────────────────────────┤
│  Hypervisor                     │
├─────────────────────────────────┤
│  Host Operating System          │
└─────────────────────────────────┘
```

### Container
- **Lightweight** application virtualization
- **Size:** 10-500 MB per container
- **Startup Time:** Milliseconds
- **Performance:** Faster (shares OS kernel)
- **Isolation:** Moderate (process-level)

```
┌──────────────┬──────────────┬──────────────┐
│  Container 1 │  Container 2 │  Container 3 │
│   (App 1)    │   (App 2)    │   (App 3)    │
├──────────────┴──────────────┴──────────────┤
│  Docker Engine                             │
├────────────────────────────────────────────┤
│  Host Operating System (Kernel)            │
└────────────────────────────────────────────┘
```

### Comparison Table

| Feature | Container | VM |
|---------|-----------|-----|
| Size | 10-500 MB | 1-5+ GB |
| Startup | Milliseconds | 1-2+ min |
| Performance | Better | Slower |
| OS | Shared | Separate |
| Isolation | Process-level | OS-level |
| Density | 100s per host | 10-20 per host |

---

## Docker Architecture

### Components

```
┌──────────────────────────────────────────┐
│          Docker Client (CLI)              │
│  $ docker build, run, push, pull          │
└─────────────┬──────────────────────────────┘
              │
              │ Docker API
              │
┌─────────────▼──────────────────────────────┐
│        Docker Daemon (Server)              │
│  - Creates images                         │
│  - Runs containers                        │
│  - Manages storage                        │
│  - Manages networks                       │
└─────────────┬──────────────────────────────┘
              │
              │
┌─────────────▼──────────────────────────────┐
│         Container Runtime                  │
│  (containerd, runc)                       │
└──────────────────────────────────────────────┘
```

### Key Components

1. **Docker Client** - CLI tool to interact with Docker
2. **Docker Daemon** - Backend service managing containers
3. **Docker Registry** - Repository for images (Docker Hub)
4. **Images** - Templates for containers
5. **Containers** - Running instances of images

---

## Images and Containers

### Docker Image
- **Read-only** template with instructions
- Contains application code and dependencies
- Built from Dockerfile
- Can be versioned and tagged

```
Image: Node.js App
├── Base OS (Node.js 18)
├── Dependencies (npm packages)
├── Application Code
└── Configuration Files
```

### Docker Container
- **Writable** instance of an image
- Running process
- Can be started, stopped, deleted
- Data persists in volumes

```
Container = Image + Filesystem + Process
```

### Relationship

```
Dockerfile
    ↓
    ├── docker build
    ↓
Docker Image
    ↓
    ├── docker run
    ↓
Docker Container (Running)
```

---

## Dockerfile

### Basic Structure
```dockerfile
FROM node:18                    # Base image
WORKDIR /app                    # Working directory
COPY package*.json ./           # Copy files from host
RUN npm install                 # Run command
COPY . .                        # Copy rest of code
EXPOSE 3000                     # Port to expose
CMD ["node", "server.js"]       # Default command
```

### Common Commands

**FROM** - Base image
```dockerfile
FROM ubuntu:22.04
FROM node:18-alpine
FROM python:3.11
```

**WORKDIR** - Set working directory
```dockerfile
WORKDIR /app
# All subsequent commands run in /app
```

**COPY** - Copy files from host to container
```dockerfile
COPY package.json .
COPY . /app/
```

**ADD** - Like COPY but can extract archives
```dockerfile
ADD . /app/
```

**RUN** - Execute command during build
```dockerfile
RUN npm install
RUN apt-get update && apt-get install -y curl
```

**ENV** - Set environment variables
```dockerfile
ENV NODE_ENV=production
ENV DATABASE_URL=mongodb://db:27017
```

**EXPOSE** - Document which ports are exposed (not actually expose)
```dockerfile
EXPOSE 3000 8080
```

**CMD** - Default command when container starts
```dockerfile
CMD ["npm", "start"]
CMD ["node", "app.js"]
```

**ENTRYPOINT** - Main command (overwrites CMD)
```dockerfile
ENTRYPOINT ["node"]
CMD ["app.js"] # If no command given, runs "node app.js"
```

### Complete Example

```dockerfile
# Dockerfile for Node.js App
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Environment variable
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Run application
CMD ["node", "server.js"]
```

### Multi-Stage Build (Optimization)

```dockerfile
# Stage 1: Build
FROM node:18 as builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app
# Copy only needed files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["node", "server.js"]

# Result: Smaller image (alpine, no build tools)
```

---

## Docker Commands

### Build Image
```bash
docker build -t my-app:1.0 .
docker build -t my-app:latest -f Dockerfile.prod .
```

### Run Container
```bash
docker run -d -p 3000:3000 -e NODE_ENV=production my-app:1.0
# -d: detach (background)
# -p: port mapping (host:container)
# -e: environment variable
# --name: container name
# -v: volume mount
```

### List Containers
```bash
docker ps              # Running containers
docker ps -a           # All containers (including stopped)
docker ps -aq          # Only container IDs
```

### List Images
```bash
docker images
docker images my-app
docker images --no-trunc
```

### Logs
```bash
docker logs container_id
docker logs -f container_id      # Follow logs
docker logs --tail 100 container_id
```

### Container Management
```bash
docker stop container_id         # Graceful shutdown
docker kill container_id         # Force kill
docker restart container_id
docker rm container_id           # Delete container
docker rm $(docker ps -aq)       # Delete all containers
```

### Image Management
```bash
docker tag my-app:1.0 my-app:latest
docker rmi image_id              # Delete image
docker push my-app:1.0           # Push to registry
docker pull ubuntu:22.04         # Pull from registry
```

### Execute in Container
```bash
docker exec -it container_id bash
docker exec -it container_id sh
```

### Copy Files
```bash
docker cp file.txt container_id:/app/
docker cp container_id:/app/file.txt .
```

---

## Docker Compose

### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mongodb://db:27017/myapp
    depends_on:
      - db
    volumes:
      - ./src:/app/src
    networks:
      - app-network

  db:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    networks:
      - app-network

volumes:
  mongo-data:

networks:
  app-network:
```

### Docker Compose Commands
```bash
docker-compose up                    # Start services
docker-compose up -d                 # Start in background
docker-compose down                  # Stop and remove
docker-compose ps                    # List services
docker-compose logs app              # View logs
docker-compose exec app bash         # Execute in service
```

---

## Interview Questions

### Q1: What is Docker?
**Answer:** Docker is a containerization platform that packages applications with their dependencies. It ensures the app runs the same way across different environments (dev, test, prod).

### Q2: What's the difference between Docker images and containers?
**Answer:** A Docker image is a read-only template containing code and dependencies. A container is a running instance of an image. Image is like a class, container is like an object.

### Q3: What are the advantages of containers over VMs?
**Answer:**
- Lightweight (MB vs GB)
- Faster startup (ms vs minutes)
- Better performance (less overhead)
- Higher density (100s vs 10-20 per host)
- Consistent across environments

### Q4: What is a Dockerfile?
**Answer:** A Dockerfile is a text file with instructions to build a Docker image. It contains commands like FROM, RUN, COPY, EXPOSE, CMD to define how to package the application.

### Q5: What's the difference between CMD and ENTRYPOINT?
**Answer:** CMD specifies the default command but can be overridden. ENTRYPOINT specifies the main executable that always runs. Best practice is to use ENTRYPOINT for the main app and CMD for default arguments.

### Q6: How do you pass environment variables to a Docker container?
**Answer:** Use the -e flag or --env flag:
```bash
docker run -e NODE_ENV=production -e PORT=3000 my-app
```
Or in docker-compose.yml using environment key.

### Q7: What is Docker Compose used for?
**Answer:** Docker Compose defines and runs multi-container applications. You specify services (containers), volumes, networks, and environment variables in a YAML file.

### Q8: What is a Docker registry?
**Answer:** A registry is a repository of Docker images. Docker Hub is the public registry. Private registries store images for specific organizations.

---

## Key Takeaways

1. **Docker** - Containerization platform
2. **Image** - Template (read-only)
3. **Container** - Running instance (writable)
4. **Dockerfile** - Build instructions
5. **Volumes** - Persistent storage
6. **Networks** - Container communication
7. **Docker Compose** - Multi-container orchestration

---

**Docker is essential for modern application deployment!**
