# Docker & Kubernetes - Professional Interview Guide

> Written for engineers who have to keep containers alive at 3 AM, not for people who
> want to memorize `docker run` flags. Every section answers "what actually happens in
> the kernel / control plane" before it answers "what do I type".

## Table of Contents
1. [What a Container Actually Is](#what-a-container-actually-is)
2. [Images, Layers & the Union Filesystem](#images-layers--the-union-filesystem)
3. [Dockerfile Engineering & Build Cache](#dockerfile-engineering--build-cache)
4. [Base Image Selection: Alpine, Distroless, Debian](#base-image-selection-alpine-distroless-debian)
5. [PID 1, Signals & Graceful Shutdown](#pid-1-signals--graceful-shutdown)
6. [Container Security](#container-security)
7. [Docker Networking](#docker-networking)
8. [Storage: Volumes vs Bind Mounts](#storage-volumes-vs-bind-mounts)
9. [Docker Compose](#docker-compose)
10. [Kubernetes Architecture & the Reconciliation Loop](#kubernetes-architecture--the-reconciliation-loop)
11. [Scheduling: How a Pod Actually Lands on a Node](#scheduling-how-a-pod-actually-lands-on-a-node)
12. [Workloads](#workloads)
13. [Kubernetes Networking](#kubernetes-networking)
14. [DNS and the ndots:5 Trap](#dns-and-the-ndots5-trap)
15. [Kubernetes Storage](#kubernetes-storage)
16. [Configuration & Secrets](#configuration--secrets)
17. [Resources, QoS, Throttling & OOMKill](#resources-qos-throttling--oomkill)
18. [Probes & the Pod Lifecycle](#probes--the-pod-lifecycle)
19. [Autoscaling](#autoscaling)
20. [Zero-Downtime Deployments](#zero-downtime-deployments)
21. [Cluster Security: RBAC, Admission, Pod Security](#cluster-security-rbac-admission-pod-security)
22. [Packaging & GitOps: Helm, Kustomize, Argo](#packaging--gitops-helm-kustomize-argo)
23. [Debugging Playbook](#debugging-playbook)
24. [Production War Stories](#production-war-stories)
25. [Common Pitfalls](#common-pitfalls)
26. [Junior vs Senior](#junior-vs-senior)
27. [Interview Questions](#interview-questions)
28. [Production Wisdom (10+ Years)](#production-wisdom-10-years)

---

## What a Container Actually Is

A container is **a normal Linux process** that the kernel has been told to lie to.

There is no "container" object in the Linux kernel. There is no container driver, no
container syscall, no container ID. What exists is three independent kernel features
that Docker/containerd compose together:

1. **Namespaces** — control what a process can *see*.
2. **cgroups** — control what a process can *use*.
3. **Union filesystem (overlayfs)** — control what a process's *root directory* looks like.

Add `capabilities`, `seccomp`, `AppArmor`/`SELinux` on top and you have the whole
security model. That's it. If you can explain those five things you understand
containers better than most people who have shipped them for years.

### The isolation model

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SINGLE HOST KERNEL                              │
│                (one kernel, one scheduler, one page cache)              │
└─────────────────────────────────────────────────────────────────────────┘
        ▲                          ▲                          ▲
        │  syscalls                │  syscalls                │  syscalls
        │                          │                          │
┌───────┴────────────┐   ┌─────────┴──────────┐   ┌───────────┴──────────┐
│  Container A       │   │  Container B       │   │  Host process        │
│  PID 1: node       │   │  PID 1: postgres   │   │  PID 4231: sshd      │
├────────────────────┤   ├────────────────────┤   ├──────────────────────┤
│ NAMESPACES (see)   │   │ NAMESPACES (see)   │   │ root namespaces      │
│  pid    → own tree │   │  pid    → own tree │   │                      │
│  net    → own eth0 │   │  net    → own eth0 │   │  real eth0           │
│  mnt    → own /    │   │  mnt    → own /    │   │  real /              │
│  uts    → own host │   │  uts    → own host │   │  real hostname       │
│  ipc    → own shm  │   │  ipc    → own shm  │   │                      │
│  user   → uid map  │   │  user   → uid map  │   │                      │
│  cgroup → own view │   │  cgroup → own view │   │                      │
├────────────────────┤   ├────────────────────┤   ├──────────────────────┤
│ CGROUPS (use)      │   │ CGROUPS (use)      │   │ unlimited            │
│  cpu.max 50000/... │   │  cpu.max max       │   │                      │
│  memory.max 512M   │   │  memory.max 4G     │   │                      │
│  pids.max 1024     │   │  pids.max 1024     │   │                      │
│  io.max 200 iops   │   │  io.max max        │   │                      │
├────────────────────┤   ├────────────────────┤   └──────────────────────┘
│ ROOTFS (overlayfs) │   │ ROOTFS (overlayfs) │
│  lower: image layers│  │  lower: image layers│
│  upper: container rw│  │  upper: container rw│
└────────────────────┘   └────────────────────┘

NOT isolated (shared by everyone):
  • the kernel itself and all its bugs
  • the CPU scheduler (CFS/EEVDF) — noisy neighbours are real
  • page cache, dentry cache, slab
  • /proc/sys tunables that are NOT namespaced (e.g. vm.max_map_count,
    kernel.pid_max, most of vm.*)
  • the system clock (there IS a time namespace since 5.6 but runtimes rarely use it)
  • kernel modules, /dev (unless masked), firmware
```

### The seven namespaces, precisely

| Namespace | Syscall flag | What it virtualizes | Concrete effect |
|-----------|-------------|---------------------|-----------------|
| **pid** | `CLONE_NEWPID` | Process ID tree | Your app is PID 1. `ps aux` shows only your processes. Killing PID 1 kills the container. |
| **net** | `CLONE_NEWNET` | Interfaces, routes, iptables, sockets, ports | Container has its own `eth0`, own `127.0.0.1`, own port space. Two containers can both bind :8080. |
| **mnt** | `CLONE_NEWNS` | Mount table | Container sees its own `/`. Host mounts invisible unless bind-mounted in. |
| **uts** | `CLONE_NEWUTS` | hostname, domainname | `hostname` returns the container ID / pod name, not the node. |
| **ipc** | `CLONE_NEWIPC` | SysV IPC, POSIX message queues, shared memory | `/dev/shm` is per-container. Default 64MB — this bites Chrome/Postgres/PyTorch. |
| **user** | `CLONE_NEWUSER` | uid/gid mapping | Container root (uid 0) maps to unprivileged host uid (e.g. 100000). The only namespace that meaningfully raises the security bar. |
| **cgroup** | `CLONE_NEWCGROUP` | cgroup root view | `/proc/self/cgroup` shows `/` instead of the full host path. Cosmetic + information hiding. |

**Prove it to yourself:**

```bash
# Namespaces are just files in /proc/<pid>/ns
docker run -d --name demo nginx
PID=$(docker inspect -f '{{.State.Pid}}' demo)
sudo ls -l /proc/$PID/ns
# lrwxrwxrwx 1 root root 0 ... net -> 'net:[4026532567]'
# lrwxrwxrwx 1 root root 0 ... pid -> 'pid:[4026532569]'
# The number is the inode. Same inode = same namespace.

sudo ls -l /proc/1/ns/net    # host: net:[4026531840]  -> different inode

# Enter the container's namespaces from the host, without docker exec
sudo nsenter -t $PID -n ip addr        # its network
sudo nsenter -t $PID -p -m ps aux      # its process tree

# The container process is fully visible from the host — it is just a process
ps -ef | grep nginx        # you will see it, with a HOST pid
```

That last line is the whole security story: **on the host, a container is not hidden.**
The host can see, signal, and inspect every container process. The reverse is what
namespaces prevent — and only imperfectly.

### cgroups v1 vs v2 — and why it matters to you

cgroups enforce *resource limits*. The v1 → v2 transition changed the interface files,
which is why old tooling reports wrong numbers on modern hosts.

```
cgroup v1 (legacy, one hierarchy PER controller)
  /sys/fs/cgroup/memory/docker/<id>/memory.limit_in_bytes
  /sys/fs/cgroup/cpu/docker/<id>/cpu.cfs_quota_us
  /sys/fs/cgroup/cpu/docker/<id>/cpu.cfs_period_us
  /sys/fs/cgroup/cpuset/docker/<id>/cpuset.cpus
  → a process can be in DIFFERENT cgroups per controller. Chaos.
  → no proper way to attribute page-cache writeback to a cgroup.
  → memory limit = RSS + page cache; kernel memory accounting was optional.

cgroup v2 (unified single hierarchy — default on RHEL 9, Ubuntu 22.04+, Fedora 31+)
  /sys/fs/cgroup/kubepods.slice/.../memory.max        e.g. "536870912"
  /sys/fs/cgroup/kubepods.slice/.../memory.high       soft throttle before OOM
  /sys/fs/cgroup/kubepods.slice/.../cpu.max           e.g. "50000 100000" (quota period)
  /sys/fs/cgroup/kubepods.slice/.../cpu.stat          nr_throttled, throttled_usec
  /sys/fs/cgroup/kubepods.slice/.../memory.pressure   PSI: real stall time
  → one tree, all controllers. Pressure Stall Information (PSI) is the killer feature.
```

Why a senior cares:

- **`memory.high` (v2 only)** lets the kernel throttle allocation and reclaim *before*
  hard-killing. Kubernetes exposes this via the `MemoryQoS` feature gate. On v1 you get
  a cliff: fine, fine, fine, **OOMKilled**.
- **PSI (`memory.pressure`, `cpu.pressure`, `io.pressure`)** gives you "the container
  stalled for 4.2s of the last 10s waiting on memory". This is far more actionable than
  a utilization percentage. Node problem detectors and the newer eviction logic use it.
- **Swap accounting** is sane in v2; Kubernetes swap support (beta, 1.30+) requires v2.
- Any tool reading `memory.limit_in_bytes` on a v2 host reads **nothing** and falls back
  to host RAM. That is exactly how a JVM ends up thinking it has 256GB inside a 2GB pod.

```bash
# Which are you on?
stat -fc %T /sys/fs/cgroup/
# cgroup2fs  → v2
# tmpfs      → v1

# Read the real limit from INSIDE a container (v2)
cat /sys/fs/cgroup/memory.max        # 536870912  or "max"
cat /sys/fs/cgroup/cpu.max           # "50000 100000" = 0.5 CPU
cat /sys/fs/cgroup/cpu.stat          # nr_throttled / throttled_usec  ← gold
```

### A container is not a VM

This is the single most important sentence in container security.

```
        VIRTUAL MACHINE                        CONTAINER
┌──────────────────────────────┐      ┌──────────────────────────────┐
│  App                         │      │  App                         │
├──────────────────────────────┤      ├──────────────────────────────┤
│  Guest kernel  (own)         │      │        (none)                │
├──────────────────────────────┤      ├──────────────────────────────┤
│  Virtual hardware            │      │  namespaces + cgroups        │
├──────────────────────────────┤      ├──────────────────────────────┤
│  Hypervisor (KVM/Xen)        │      │  container runtime (runc)    │
├──────────────────────────────┤      ├──────────────────────────────┤
│  Host kernel                 │      │  HOST KERNEL  ◄── SHARED     │
├──────────────────────────────┤      ├──────────────────────────────┤
│  Hardware                    │      │  Hardware                    │
└──────────────────────────────┘      └──────────────────────────────┘

Attack surface to escape:   Attack surface to escape:
  hypervisor (small, ~KLOC    the ENTIRE Linux syscall ABI
  of hardened code) +         (~350 syscalls, millions of LOC),
  virtual device emulation    plus runc, plus the CRI socket
Boot time: 30s – 2 min        Boot time: 50 – 500 ms
Memory floor: 512MB – 1GB     Memory floor: a few MB
Density per host: 10s         Density per host: 100s – 1000s
```

**The implication, stated plainly:** a kernel privilege-escalation bug is a container
escape. `Dirty COW` (CVE-2016-5195), `Dirty Pipe` (CVE-2022-0847), `nf_tables`
UAF chains, and the runc `/proc/self/exe` escape (CVE-2019-5736) all crossed the
container boundary. Multi-tenant workloads running untrusted code do **not** belong in
plain containers. Use gVisor (userspace syscall interception), Kata Containers
(microVM per pod), or Firecracker if the tenant is hostile.

For the 99% case — your own code, your own cluster — containers are fine, *provided*
you drop capabilities, run non-root, apply seccomp, and patch nodes. See
[Container Security](#container-security).

### Interview framing

> **"What is a container?"**
>
> "A process the kernel isolates with namespaces and constrains with cgroups, whose
> root filesystem is an overlay of read-only image layers plus a writable layer. There's
> no container primitive in the kernel — Docker is orchestration around `clone(2)`,
> `unshare(2)`, `setns(2)`, cgroupfs writes, and `pivot_root`. Because the kernel is
> shared, a kernel exploit is an escape, which is why untrusted multi-tenant workloads
> need gVisor or Kata rather than runc."

That answer takes 25 seconds and immediately separates you from "it's a lightweight VM".

---

## Images, Layers & the Union Filesystem

### What an image really is

An OCI image is **not** a filesystem. It is:

- a **manifest** (JSON) listing layers by digest,
- a **config blob** (JSON) with env, entrypoint, user, and the `rootfs.diff_ids`,
- N **layer blobs**, each a gzipped tar of *filesystem changes* (not full filesystems).

```bash
docker pull nginx:1.27-alpine
docker manifest inspect nginx:1.27-alpine | head -40
docker inspect nginx:1.27-alpine --format '{{json .RootFS.Layers}}' | jq
docker save nginx:1.27-alpine | tar -tv | head    # it's just tarballs + JSON
```

Layers are **content-addressed by SHA256**. Two images that both use
`node:22-alpine` share the exact same layer blobs on disk and in the registry. That is
why 20 microservices on one base image cost you the base once, not twenty times.

### Union filesystem / copy-on-write

```
                        CONTAINER'S VIEW OF /
                   ┌────────────────────────────┐
                   │  /app/server.js            │
                   │  /app/node_modules/...     │
                   │  /usr/lib/...              │
                   │  /tmp/session-42.log       │  ← created at runtime
                   └────────────────────────────┘
                                ▲
                   overlayfs merges top-down
                                │
   ┌────────────────────────────┴──────────────────────────────┐
   │ UPPER DIR (writable, per-container, EPHEMERAL)            │
   │   /tmp/session-42.log        (new file)                   │
   │   /etc/nginx/nginx.conf      (copy-up of modified file)   │
   │   /usr/bin/curl              (whiteout: .wh.curl = deleted)│
   └───────────────────────────────────────────────────────────┘
   ┌───────────────────────────────────────────────────────────┐
   │ LOWER DIRS (read-only image layers, SHARED between all    │
   │             containers from this image)                   │
   │  L4  sha256:9f2b…  COPY . .              12 MB            │
   │  L3  sha256:41ac…  RUN npm ci           180 MB            │
   │  L2  sha256:7d13…  COPY package*.json      4 KB           │
   │  L1  sha256:c0d5…  FROM node:22-alpine   142 MB           │
   └───────────────────────────────────────────────────────────┘

Rules:
  • read  → search UPPER, then L4 → L3 → L2 → L1; first hit wins
  • write to an existing file → COPY-UP the whole file to UPPER first, then write
  • delete → write a "whiteout" entry in UPPER; the lower file still occupies disk
  • container removed → UPPER discarded. Everything you wrote is gone.
```

**Three production consequences most people learn the hard way:**

1. **Copy-up cost is per-file and proportional to file size.** A container that opens a
   2GB SQLite file read-write pays a 2GB copy the first time it writes one byte. Put
   mutable data on a volume, always.
2. **Deleting a file in a later layer does not shrink the image.** `RUN apt-get install
   -y build-essential && ...` followed by `RUN rm -rf /var/lib/apt/lists/*` in a
   *separate* RUN leaves the data in the earlier layer. It must be the same `RUN`.
3. **The writable layer is not durable and not backed up.** Container storage is
   ephemeral. Kubernetes will happily reschedule your pod to another node and your
   `/app/uploads` will be empty.

```dockerfile
# ❌ WRONG — 340MB of apt cache is permanently baked into layer N-1
RUN apt-get update && apt-get install -y build-essential
RUN rm -rf /var/lib/apt/lists/*

# ✅ CORRECT — one layer, cache never committed
RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential \
 && rm -rf /var/lib/apt/lists/*
```

### Storage drivers

| Driver | Status | Notes |
|--------|--------|-------|
| **overlay2** | Default everywhere since Docker 18.06 | Fast, ext4/xfs(ftype=1). Max ~128 lower dirs. Use this. |
| `fuse-overlayfs` | Rootless Docker/Podman | Slower, needed when kernel overlay is unavailable to unprivileged users |
| `devicemapper` | **Removed** | Block-level COW; loopback mode was a disaster in prod |
| `btrfs` / `zfs` | Niche | Snapshot-native, good if you already run the FS |
| `vfs` | Testing only | No COW at all — full copy per layer. Enormous. |

```bash
docker info | grep -i "storage driver"
# Where the layers actually live:
sudo ls /var/lib/docker/overlay2/            # docker
sudo ls /var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/  # containerd
```

### Layer count and pull behavior

Pulls are **parallel per layer** (3 concurrent by default) but extraction is serial per
layer chain. A 40-layer image is slower to start than an 8-layer image of the same size.
Conversely, squashing to one layer destroys sharing — a 1-byte code change re-pushes and
re-pulls the whole thing.

**The sweet spot: 6–12 layers, ordered by change frequency.**

```bash
docker history myapp:v1 --no-trunc --format \
  "table {{.Size}}\t{{.CreatedBy}}" | head -20
```

---

## Dockerfile Engineering & Build Cache

### The cache invalidation model

BuildKit caches a step if **(a)** the parent step's cache key matches **and** **(b)** the
step's own key matches. For `RUN`, the key is the literal command string. For
`COPY`/`ADD`, the key is a **checksum of the copied file contents and metadata**.

Once a step misses, **every subsequent step misses.** Cache invalidation is a cliff,
not a slope.

```
                THE #1 DOCKERFILE MISTAKE

❌ WRONG                                  ✅ CORRECT
──────────────────────────────────       ──────────────────────────────────
FROM node:22-alpine                      FROM node:22-alpine
WORKDIR /app                             WORKDIR /app
COPY . .            ← EVERYTHING         COPY package.json package-lock.json ./
RUN npm ci          ← 90s, always        RUN npm ci        ← 90s, cached
CMD ["node","src/server.js"]             COPY . .          ← 0.3s
                                         CMD ["node","src/server.js"]

You change ONE character in src/server.js:

┌──────────────────────┐                 ┌──────────────────────┐
│ FROM node:22-alpine  │ CACHED  0.0s    │ FROM node:22-alpine  │ CACHED  0.0s
├──────────────────────┤                 ├──────────────────────┤
│ WORKDIR /app         │ CACHED  0.0s    │ WORKDIR /app         │ CACHED  0.0s
├──────────────────────┤                 ├──────────────────────┤
│ COPY . .             │ MISS ✗          │ COPY package*.json   │ CACHED  0.0s
│  (checksum changed)  │                 │  (checksum same)     │
├──────────────────────┤                 ├──────────────────────┤
│ RUN npm ci           │ MISS ✗  92.4s   │ RUN npm ci           │ CACHED  0.0s
│  ↑ parent missed, so │                 │                      │
│    this MUST re-run  │                 ├──────────────────────┤
├──────────────────────┤                 │ COPY . .             │ MISS ✗  0.3s
│ CMD                  │ MISS ✗          ├──────────────────────┤
└──────────────────────┘                 │ CMD                  │ MISS ✗  0.0s
                                         └──────────────────────┘
   Build time: 94s                          Build time: 1.1s
   × 40 CI builds/day = 63 min/day          × 40 builds/day = 44 sec/day
   wasted, every day, forever
```

I have walked into teams burning **90+ minutes of CI compute per day** on exactly this.
It is a two-line fix. Always ask to see the Dockerfile in an interview scenario.

### BuildKit cache mounts — the next level

Reordering fixes "unchanged dependencies". `--mount=type=cache` fixes "one dependency
changed, redownload all 900".

```dockerfile
# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# npm's global cache survives ACROSS builds and across cache misses
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
```

Equivalents worth memorizing:

```dockerfile
RUN --mount=type=cache,target=/root/.cache/pip        pip install -r requirements.txt
RUN --mount=type=cache,target=/root/.m2               mvn -q -B package -DskipTests
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build   go build -o /out/app ./cmd/api
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends ca-certificates
```

Adding a single npm dependency: **92s → 11s**. Adding a single Go module: **140s → 8s**.

### Build context — the silent tax

`docker build .` tars the **entire directory** and ships it to the daemon *before the
first instruction runs*.

```bash
# How big is your context, really?
du -sh .            # 1.4G   ← .git, node_modules, dist, *.mp4 fixtures
docker build -t app . 
# => [internal] load build context
# => => transferring context: 1.42GB   38.7s      ← before ANY layer builds
```

```
# .dockerignore — write this before you write the Dockerfile
.git
.gitignore
node_modules
npm-debug.log
dist
build
coverage
.env
.env.*
*.md
!README.md
.github
.vscode
.idea
Dockerfile*
docker-compose*.yml
**/__pycache__
**/*.pyc
.pytest_cache
.venv
terraform/
*.tfstate*
test/fixtures/**/*.mp4
```

Real numbers from a Node monorepo I fixed: **1.42GB context / 38.7s transfer → 4.1MB /
0.4s.** And `node_modules` in the context is worse than slow — if it gets `COPY . .`-ed
in, you ship your host's platform-specific native modules (`bcrypt`, `sharp`,
`node-sass`) into a different libc and get a runtime crash that reproduces on nobody's
laptop.

```bash
# Verify what the daemon actually received
docker build --no-cache --progress=plain -t app . 2>&1 | grep "transferring context"
```

### Multi-stage builds: 1.2GB → 90MB

The naive Node image:

```dockerfile
# ❌ WRONG — 1.24 GB
FROM node:22                       # 1.09 GB base: gcc, python3, git, make, perl…
WORKDIR /app
COPY . .                           # includes .git, tests, tsconfig, source maps
RUN npm install                    # devDependencies: typescript, jest, eslint, webpack
RUN npm run build
EXPOSE 3000
CMD npm start                      # shell form — see the PID 1 section
```

```
$ docker images
myapp   naive   1.24GB
```

The production version:

```dockerfile
# syntax=docker/dockerfile:1.7
# ✅ CORRECT — 92 MB

######################## Stage 1: dependencies ########################
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
# a second, throwaway tree WITH dev deps for the build
RUN --mount=type=cache,target=/root/.npm \
    cp -R node_modules /tmp/prod_modules && npm ci

######################## Stage 2: build ###############################
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.json ./
COPY src ./src
RUN npm run build          # -> /app/dist

######################## Stage 3: runtime #############################
FROM node:22-alpine AS runtime
ENV NODE_ENV=production \
    NPM_CONFIG_UPDATE_NOTIFIER=false

# tini reaps zombies and forwards signals; see the PID 1 section
RUN apk add --no-cache tini=~0.19 \
 && addgroup -g 10001 -S app \
 && adduser  -u 10001 -S app -G app

WORKDIR /app
COPY --from=deps  --chown=10001:10001 /tmp/prod_modules ./node_modules
COPY --from=build --chown=10001:10001 /app/dist         ./dist
COPY --chown=10001:10001 package.json ./

USER 10001:10001
EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]
```

```
$ docker images
myapp   naive        1.24GB
myapp   multistage     92MB      -92.6%
```

**Why 1.15GB matters — the part juniors skip:**

| Dimension | 1.24 GB | 92 MB | Impact |
|-----------|---------|-------|--------|
| Cold pull on a new node (500 Mbit) | ~20 s | ~1.5 s | Scale-out latency during an incident |
| 200-node cluster, full rollout | 248 GB egress | 18 GB | ~$22 vs ~$1.60 per rollout on cross-AZ/NAT egress |
| Registry storage × 300 tags | 372 GB | 27 GB | Real money at ECR/GCR prices |
| Trivy HIGH+CRITICAL CVEs | 187 | 6 | 181 CVEs you no longer explain to your auditor |
| Binaries available to an attacker | `curl wget git gcc python3 perl apt dpkg ssh` | `node` + busybox | Post-exploitation becomes hard |
| Node disk pressure (imagefs) | evictions at 50 images | no pressure | Fewer 2 AM `Evicted` pages |

That last row is the one people forget: kubelet garbage-collects images at 85%
`imagefs` usage and evicts pods at 15% free. Fat images cause node-level instability
that looks nothing like an image-size problem.

### Multi-stage for compiled languages — the extreme case

```dockerfile
# Go: 900MB build image → 11MB final (or 6MB with a scratch base)
FROM golang:1.23-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod go mod download
COPY . .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux go build \
      -trimpath -ldflags="-s -w -X main.version=${VERSION}" \
      -o /out/api ./cmd/api

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/api /api
USER 65532:65532
ENTRYPOINT ["/api"]
# final image: 11.4 MB, zero shell, zero package manager, zero CVEs in the base
```

### Other build instructions people get wrong

```dockerfile
# ADD vs COPY
ADD  https://example.com/x.tar.gz /opt/   # downloads AND does not auto-extract remote
ADD  local.tar.gz /opt/                   # auto-EXTRACTS local tarballs (surprise!)
COPY local.tar.gz /opt/                   # copies bytes. Predictable. Prefer COPY.
# Use ADD only for: remote fetch with checksum, or deliberate tar extraction
ADD --checksum=sha256:24454f8… https://ex.com/x.tar.gz /tmp/

# ENV vs ARG
ARG NODE_VERSION=22        # build-time only, NOT in final image env… but see below
ENV NODE_ENV=production    # persists into the running container's environment

# ENTRYPOINT + CMD is the correct combination
ENTRYPOINT ["/sbin/tini", "--", "node"]
CMD ["dist/server.js"]     # overridable: docker run img dist/worker.js

# HEALTHCHECK works in Docker/Compose; Kubernetes IGNORES it entirely (use probes)
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1

# Reproducibility: pin by digest, not tag, for anything you care about
FROM node:22.11.0-alpine3.20@sha256:6d0f18a1c67dfa1e…
```

**`latest` is not a version.** It is a mutable pointer. `FROM node:latest` today and in
six months are different operating systems. In production I pin
`major.minor.patch-distro` at minimum, digest for compliance-sensitive services, and let
Renovate/Dependabot raise the PRs.

### Building for multiple architectures

```bash
docker buildx create --name multi --driver docker-container --use
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --cache-from type=registry,ref=myrepo/app:buildcache \
  --cache-to   type=registry,ref=myrepo/app:buildcache,mode=max \
  -t myrepo/app:1.4.2 --push .
```

Graviton/Ampere nodes are 20–40% cheaper per vCPU. The blocker is almost never your
code — it's one native dependency with no arm64 wheel. Find out in CI, not during a
migration.

---

## Base Image Selection: Alpine, Distroless, Debian

Rough sizes (base only, amd64, late 2025):

| Base | Size | libc | Shell | Package mgr | Use when |
|------|------|------|-------|-------------|----------|
| `scratch` | 0 B | none | none | none | Static Go/Rust binary, nothing else |
| `gcr.io/distroless/static-debian12` | ~2 MB | none | none | none | Static binaries + CA certs + tzdata |
| `gcr.io/distroless/base-debian12` | ~20 MB | glibc | none | none | CGO-enabled Go, some Rust |
| `alpine:3.20` | ~7 MB | **musl** | ash | apk | Small, you control the deps |
| `gcr.io/distroless/nodejs22-debian12` | ~135 MB | glibc | none | none | Node in prod, glibc-safe |
| `node:22-alpine` | ~142 MB | musl | ash | apk | Node, small, musl-tolerant |
| `debian:12-slim` | ~75 MB | glibc | bash | apt | Anything with native deps |
| `node:22` (bookworm) | ~1.09 GB | glibc | bash | apt | Build stage only. Never runtime. |
| `ubuntu:24.04` | ~78 MB | glibc | bash | apt | Ops familiarity, broad tooling |
| `redhat/ubi9-minimal` | ~95 MB | glibc | bash | microdnf | FIPS / RHEL support contracts |

### Alpine's real trade-offs (musl vs glibc)

Alpine is not "Debian but smaller". It swaps **glibc for musl libc** and GNU coreutils
for busybox. That's an ABI change, and it leaks.

**1. DNS resolution — the classic Kubernetes landmine.**

musl's resolver historically differed from glibc in ways that break inside clusters:

- musl **ignores `options ndots:N`** in `/etc/resolv.conf`. Kubernetes injects
  `ndots:5` deliberately so that `mysvc` resolves via search domains. Under musl the
  search-domain semantics differ, and short-name lookups behave inconsistently.
- musl sends **A and AAAA queries in parallel on the same socket**. Some DNS servers
  (older dnsmasq, certain CoreDNS + conntrack paths) respond to only one, or the
  kernel's conntrack race on UDP (the famous `--random-fully` / DNAT race) drops one.
  Result: intermittent 5-second stalls or `EAI_AGAIN`.
- Before musl **1.2.4** (Alpine 3.18, mid-2023) musl had **no TCP fallback** for
  truncated (>512 byte) UDP responses. Large SRV/headless-service answers just failed.
- musl caps you at **`MAXNS = 3` nameservers** and offers no `rotate`/`timeout` tuning.

**Symptom you will actually see:** p99 of an outbound HTTP call jumps to 5s, exactly
5000ms, intermittently, only in the cluster, only on Alpine images. That is a DNS
timeout retry, not your app.

Mitigations, in order of preference:
```yaml
# 1. Use FQDNs with a trailing dot — bypasses search domains entirely
#    "payments.prod.svc.cluster.local." instead of "payments"
# 2. Lower ndots per-pod
spec:
  dnsConfig:
    options:
      - name: ndots
        value: "2"
      - name: single-request-reopen   # glibc only; no-op on musl
# 3. Deploy NodeLocal DNSCache (kills the conntrack race, adds a TCP hop to CoreDNS)
# 4. Move the image to debian-slim or distroless
```

**2. Python: the wheel problem.**

PyPI binary wheels are built as `manylinux` — **glibc**. On Alpine, `pip` finds no
compatible wheel and falls back to compiling from source.

```
pip install pandas numpy scipy cryptography psycopg2-binary

  debian:12-slim  →  downloads manylinux wheels    →  22 seconds, image +180MB
  alpine:3.20     →  compiles from source, needs
                     gcc g++ gfortran musl-dev
                     python3-dev openblas-dev
                     libffi-dev rust cargo        →  14–25 MINUTES, image +420MB
```

`musllinux` wheels exist (PEP 656) and coverage has improved a lot, but it is still
patchy in the scientific stack. **For Python, use `python:3.12-slim`.** The 60MB you
"save" with Alpine costs you 20 minutes per CI build and a bigger final image. I have
never once seen Alpine be the right call for a data-science Python service.

**3. Other musl differences that bite:**

- **Thread stack size defaults to 128KB** (glibc: 8MB). Deeply recursive code or
  libraries assuming a big stack segfault. Rust and some JVMs care.
- **malloc is different.** musl's allocator is simpler and much slower under heavy
  multithreaded allocation. Benchmarks of allocation-heavy services have shown musl
  **2–10× slower** on some workloads. Alpine 3.19+ can use mimalloc to mitigate.
- **No `getaddrinfo` NSS / no glibc locales.** LDAP, NIS, or locale-dependent code
  behaves differently.
- **Different stack traces / no `backtrace()`**, which degrades some crash reporters.
- Go binaries built with `CGO_ENABLED=1` on Debian **will not run** on Alpine
  (`no such file or directory` — which is the *dynamic linker* missing, not your
  binary). This error message wastes an hour of everyone's life exactly once.

### Distroless — my default for production runtimes

Distroless images contain your app, its runtime, CA certs, tzdata, `/etc/passwd` — and
nothing else. No shell, no `ls`, no package manager, no `curl`.

```dockerfile
FROM gcr.io/distroless/nodejs22-debian12:nonroot
COPY --from=build /app/dist /app/dist
COPY --from=deps  /app/node_modules /app/node_modules
WORKDIR /app
CMD ["dist/server.js"]     # entrypoint is already /nodejs/bin/node
```

Pros: smallest realistic glibc runtime, near-zero base CVEs, an attacker who achieves
RCE has no shell to pivot with, `:nonroot` tag runs as uid 65532 by default.

Cons — be honest about these in an interview:
- **You cannot `kubectl exec -it pod -- sh`.** There is no sh.
- Debugging requires **ephemeral containers** (`kubectl debug`), which needs
  Kubernetes ≥1.25 (GA) and a sidecar-capable cluster policy.
- Exec-based probes are impossible; use `httpGet`/`grpc` probes.
- `:debug` variants ship busybox — use them in staging, not prod.

```bash
# The distroless debugging workflow every senior should know
kubectl debug -it pod/api-7d9f-xk2 \
  --image=busybox:1.36 \
  --target=api \
  --share-processes -- sh
# now you have a shell in the SAME pid/net namespaces as the app, with its /proc
ls /proc/1/root/app     # the app container's filesystem
```

### My decision tree

```
Is the artifact a static binary (Go w/ CGO_ENABLED=0, Rust musl target)?
  └─ yes → distroless/static  or  scratch          (2–12 MB)
  └─ no
     ├─ Node.js / Java / .NET?
     │    └─ distroless/<runtime>  (prod)  or  <runtime>-slim  (if you need a shell)
     ├─ Python with native/scientific deps?
     │    └─ python:3.12-slim   — do NOT use Alpine
     └─ Needs apt packages at runtime (ffmpeg, imagemagick, poppler)?
          └─ debian:12-slim + explicit `--no-install-recommends`
```

---

## PID 1, Signals & Graceful Shutdown

Your app runs as **PID 1** inside the pid namespace. PID 1 on Linux is special in two
ways that nobody tells you until it breaks production.

### Special rule 1: PID 1 has no default signal handlers

For every process except PID 1, the kernel installs default dispositions — `SIGTERM`
terminates, `SIGINT` terminates, `SIGQUIT` core-dumps. **For PID 1, the kernel
suppresses default actions for signals the process has not explicitly handled.**

Consequence: if your app doesn't register a `SIGTERM` handler, `docker stop` /
`kubectl delete pod` sends SIGTERM, **nothing happens**, and 10 (Docker) or 30
(Kubernetes) seconds later you get SIGKILL. Every in-flight request dies.

### Special rule 2: PID 1 must reap zombies

When a child process exits, it stays in the process table as a `<defunct>` zombie until
its parent calls `wait()`. If the parent is gone, the child is re-parented to PID 1.
`init` on a real system reaps these. **Your Node/Python/Java process does not.**

Zombies accumulate → `pids.max` cgroup limit hit or `kernel.pid_max` exhausted →
`fork: Resource temporarily unavailable` → the container wedges without crashing, so
your liveness probe (if it's an httpGet on an already-listening socket) may still pass.

This is common in containers that shell out: image processing (`convert`), video
(`ffmpeg`), PDF generation, `git` operations, anything using `child_process.spawn`.

### Special rule 3 (the real killer): shell-form CMD

```
              WHY YOUR SIGTERM NEVER ARRIVES

❌ CMD npm start                    (shell form → /bin/sh -c "npm start")
❌ CMD node server.js               (shell form → /bin/sh -c "node server.js")
❌ ENTRYPOINT ./entrypoint.sh       (script that ends with `node server.js`)

┌─────────────────────────────────────────────────────────────────┐
│  Container pid namespace                                        │
│                                                                 │
│   PID 1  /bin/sh -c "npm start"     ← receives SIGTERM          │
│      │                                 sh does NOT forward it   │
│      │                                 (it's not a job-control  │
│      │                                  shell; no trap set)     │
│      └── PID 7  npm                                             │
│             └── PID 14  node server.js  ← NEVER gets SIGTERM    │
│                                                                 │
│   t+0s   kubelet sends SIGTERM to PID 1                         │
│   t+0s   sh ignores it (no handler, PID 1 rules)                │
│   t+30s  terminationGracePeriodSeconds expires                  │
│   t+30s  kubelet sends SIGKILL to the whole cgroup              │
│          → node dies mid-request, connections RST,              │
│            DB transactions abandoned, 502s at the LB            │
└─────────────────────────────────────────────────────────────────┘

✅ CMD ["node", "server.js"]        (exec form → node IS pid 1)
✅ ENTRYPOINT ["/sbin/tini","--"]   (tini is pid 1, forwards to child)
   CMD ["node","server.js"]

┌─────────────────────────────────────────────────────────────────┐
│   PID 1  /sbin/tini -- node server.js                           │
│      └── PID 7  node server.js                                  │
│                                                                 │
│   t+0s   SIGTERM → tini → forwards to PID 7 (and process group) │
│   t+0s   node's SIGTERM handler runs: stop accepting, drain     │
│   t+2.4s server closed, pool drained, process.exit(0)           │
│   t+2.4s container exits cleanly. Zero dropped requests.        │
│          (tini also reaps any orphaned grandchildren)           │
└─────────────────────────────────────────────────────────────────┘
```

**Diagnose it in one command:**

```bash
docker exec myapp ps -eo pid,ppid,comm
#   PID  PPID COMMAND
#     1     0 sh          ← ❌ you have the bug
#     7     1 npm
#    14     7 node

docker exec myapp ps -eo pid,ppid,comm
#   PID  PPID COMMAND
#     1     0 node        ← ✅ correct
```

### If you must use an entrypoint script

```bash
#!/bin/sh
set -e
# do setup: template configs, wait for deps, run migrations
envsubst < /app/config.tmpl > /app/config.json

# ✅ exec REPLACES the shell — your app becomes PID 1, inherits signals
exec "$@"
# ❌ "$@"        — shell stays as PID 1, forks a child, signals go nowhere
```

`exec` is one word and it is the difference between clean and violent shutdown.

### tini / dumb-init

```dockerfile
# Alpine
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]

# Debian
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init \
 && rm -rf /var/lib/apt/lists/*
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/server.js"]

# Or: no image change at all
docker run --init myimage     # Docker injects its own tini as PID 1
```

Kubernetes has **no `--init` equivalent.** You must bake `tini` in, or handle signals
and reaping yourself. This surprises people migrating from Compose to K8s.

### The app side: what a correct SIGTERM handler does

```javascript
// Node.js — the version that actually achieves zero-downtime
const server = app.listen(3000);
let shuttingDown = false;

// Readiness endpoint flips FIRST so K8s pulls us out of the Service
app.get('/readyz', (req, res) =>
  shuttingDown ? res.status(503).send('draining') : res.status(200).send('ok'));

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'shutdown initiated');

  // 1. Fail readiness immediately (endpoint removal takes ~1-3s to propagate)
  // 2. Keep serving in-flight + newly arriving requests during that window.
  //    The preStop hook's `sleep 10` covers this. Do NOT close the server yet.
  // 3. Stop accepting new connections
  server.close(async () => {
    // 4. Now drain downstreams
    await Promise.allSettled([
      pgPool.end(),
      redis.quit(),
      kafkaProducer.disconnect(),
      logger.flush(),
    ]);
    process.exit(0);
  });

  // 5. Hard stop before SIGKILL. Must be < terminationGracePeriodSeconds.
  setTimeout(() => {
    logger.error('graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, 25_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
```

```python
# Python / gunicorn — SIGTERM triggers graceful worker shutdown
# gunicorn --graceful-timeout 25 --timeout 30 --workers 4 app:app
# Ensure gunicorn is PID 1 (exec form) so it receives the signal.
```

```java
// JVM — shutdown hooks run on SIGTERM, but NOT on SIGKILL
Runtime.getRuntime().addShutdownHook(new Thread(() -> {
    server.shutdown();                 // stop accepting
    server.awaitTermination(20, SECONDS);
    dataSource.close();
}));
// Spring Boot: server.shutdown=graceful + spring.lifecycle.timeout-per-shutdown-phase=25s
```

---

## Container Security

### Threat model, honestly

Assume: your app has an RCE. What can the attacker do next? Every control below shrinks
that answer.

```
Layer 0  Root on the host          ← kernel exploit / privileged container / docker.sock
Layer 1  Root inside container     ← default! `USER` unset means uid 0
Layer 2  Non-root, full caps       ← still can bind <1024, chown, ptrace peers
Layer 3  Non-root, caps dropped, read-only rootfs, seccomp   ← target state
Layer 4  + user namespace remap, + gVisor/Kata               ← hostile multi-tenant
```

### Run as non-root — properly

```dockerfile
# ❌ WRONG — default is root; a container breakout starts with uid 0
FROM node:22-alpine
COPY . /app
CMD ["node","/app/server.js"]

# ✅ CORRECT
FROM node:22-alpine
RUN addgroup -g 10001 -S app && adduser -u 10001 -S app -G app
WORKDIR /app
COPY --chown=10001:10001 . .
USER 10001:10001            # numeric UID, not a name — see below
CMD ["node","server.js"]
```

**Use the numeric UID, not the username.** Kubernetes'
`runAsNonRoot: true` check happens *before* the container starts and it cannot resolve
a username to a UID — if your Dockerfile says `USER app`, the kubelet may fail with
`container has runAsNonRoot and image has non-numeric user`. Numeric always works.

Pick a UID ≥ 10000 so it can't collide with a host system account under a
user-namespace mapping. Distroless uses 65532 (`nonroot`).

Non-root has a consequence: **you cannot bind ports < 1024.** Listen on 8080, not 80,
and let the Service map `port: 80 → targetPort: 8080`. Do not reach for
`NET_BIND_SERVICE` just to keep port 80.

### The full securityContext

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  template:
    spec:
      # ---- Pod level ----
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        runAsGroup: 10001
        fsGroup: 10001                 # chowns mounted volumes to this GID
        fsGroupChangePolicy: OnRootMismatch   # avoid recursive chown of huge volumes
        seccompProfile:
          type: RuntimeDefault         # blocks ~44 dangerous syscalls. Do this.
        supplementalGroups: []
      automountServiceAccountToken: false   # unless the pod calls the K8s API
      containers:
        - name: api
          image: registry.example.com/api@sha256:9f2b…
          # ---- Container level ----
          securityContext:
            allowPrivilegeEscalation: false   # sets no_new_privs; blocks setuid binaries
            readOnlyRootFilesystem: true
            privileged: false
            capabilities:
              drop: ["ALL"]                   # drop all 14 default caps
              # add: ["NET_BIND_SERVICE"]     # only if you truly must
          volumeMounts:
            - { name: tmp,   mountPath: /tmp }
            - { name: cache, mountPath: /app/.cache }
      volumes:
        - name: tmp
          emptyDir: { medium: Memory, sizeLimit: 64Mi }
        - name: cache
          emptyDir: { sizeLimit: 256Mi }
```

`readOnlyRootFilesystem: true` is the highest-value/lowest-effort control on this list.
It stops an attacker from dropping a binary, and it forces you to be explicit about
every writable path. The only cost is mounting `emptyDir` for `/tmp` and whatever your
runtime scribbles in.

### Capabilities

Docker grants 14 capabilities by default even to non-root containers. Most apps need
**zero**.

| Capability | Default | What it lets an attacker do |
|-----------|---------|-----------------------------|
| `CAP_CHOWN` | yes | Change file ownership |
| `CAP_DAC_OVERRIDE` | yes | **Bypass all file permission checks** |
| `CAP_FOWNER` | yes | Bypass ownership checks on chmod/chattr |
| `CAP_SETUID` / `CAP_SETGID` | yes | Change UID → escalate inside the container |
| `CAP_NET_RAW` | yes | **Craft raw packets: ARP spoof, scan the pod network** |
| `CAP_NET_BIND_SERVICE` | yes | Bind ports < 1024 |
| `CAP_KILL` | yes | Signal any process |
| `CAP_MKNOD` | yes | Create device nodes |
| `CAP_SYS_ADMIN` | **no** | Effectively root. Mount, namespaces, BPF. Never add it. |
| `CAP_SYS_PTRACE` | no | Read other processes' memory |

`CAP_NET_RAW` is the one to remove first: it enables ARP/DNS spoofing against every
other pod on the node.

```bash
# What does my container actually have?
docker run --rm --cap-drop ALL alpine sh -c 'apk add -q libcap; capsh --print'
kubectl exec pod -- grep Cap /proc/1/status   # CapEff: 0000000000000000 = none. Good.
```

### Secrets must never touch build args

`ARG` values are **recorded in image metadata**. Anyone who can pull your image can read
them, including from a public registry, forever, after you rotated nothing.

```dockerfile
# ❌ CATASTROPHIC
ARG NPM_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc \
 && npm ci && rm .npmrc          # the rm does NOT help
```

```bash
docker build --build-arg NPM_TOKEN=npm_9fJ2kQ… -t app .
docker history --no-trunc app | grep -i token
# |1 NPM_TOKEN=npm_9fJ2kQ7xLm4pR8vN2sT6yH1wE3zA5bC0dF  /bin/sh -c echo "//registry…
#   ↑ your token, in plaintext, in the image, pushed to the registry

docker inspect app --format '{{json .Config.Env}}'   # ENV secrets show here too
docker save app -o app.tar && tar xf app.tar && grep -r "npm_9fJ" .   # and in the layers
```

I have found live AWS keys, npm tokens, and a private GitHub deploy key in public Docker
Hub images doing exactly this. **`rm` in a later layer removes nothing** — the earlier
layer still contains the file, and `docker history` still contains the command.

**The correct approaches, in order:**

```dockerfile
# 1. BuildKit secret mounts — tmpfs, never in a layer, never in history
# syntax=docker/dockerfile:1.7
RUN --mount=type=secret,id=npmtoken \
    NPM_TOKEN="$(cat /run/secrets/npmtoken)" npm ci --omit=dev
```
```bash
docker build --secret id=npmtoken,env=NPM_TOKEN -t app .
docker history --no-trunc app | grep -i token   # (nothing)
```

```dockerfile
# 2. SSH agent forwarding for private git deps
RUN --mount=type=ssh git clone git@github.com:acme/internal-lib.git
# docker build --ssh default -t app .
```

```
# 3. Multi-stage: do the secret work in a discarded stage
FROM node:22 AS deps
RUN --mount=type=secret,id=npmtoken npm ci
FROM node:22-alpine
COPY --from=deps /app/node_modules ./node_modules   # only the artifact crosses
```

Runtime secrets come from the orchestrator (K8s Secret → env/volume, or better, an
external secret store), never the image.

### Supply chain

```bash
# Scan before push, fail the build on HIGH/CRITICAL
trivy image --severity HIGH,CRITICAL --exit-code 1 --ignore-unfixed myapp:1.4.2
grype myapp:1.4.2

# SBOM (required by many procurement processes now)
syft myapp:1.4.2 -o spdx-json > sbom.spdx.json
docker buildx build --sbom=true --provenance=true -t myapp:1.4.2 --push .

# Sign and verify (Sigstore/cosign, keyless via OIDC)
cosign sign --yes myrepo/app:1.4.2
cosign verify --certificate-identity-regexp='https://github.com/acme/.*' \
              --certificate-oidc-issuer=https://token.actions.githubusercontent.com \
              myrepo/app:1.4.2

# Enforce at admission time so unsigned images can't run
# → Kyverno `verifyImages` rule, or Sigstore policy-controller
```

### Never mount the Docker socket

```yaml
# ❌ This is root on the node. Full stop.
volumes:
  - name: docker-sock
    hostPath: { path: /var/run/docker.sock }
```

Anyone in that container can `docker run -v /:/host --privileged` and own the machine.
For in-cluster builds use **Kaniko**, **BuildKit rootless**, or **Buildah**. For CI
runners, use a separate build cluster.

Similar red flags: `hostPID: true`, `hostNetwork: true`, `hostIPC: true`,
`privileged: true`, `hostPath` mounts of `/`, `/etc`, `/var/lib/kubelet`.

---

## Docker Networking

```
                        DOCKER BRIDGE NETWORKING (default)

  ┌────────────────────────────── HOST ──────────────────────────────┐
  │                                                                  │
  │  eth0 203.0.113.10                                               │
  │    │                                                             │
  │    │  iptables nat:                                              │
  │    │    PREROUTING  -p tcp --dport 8080 -j DNAT --to 172.17.0.3:3000
  │    │    POSTROUTING -s 172.17.0.0/16 ! -o docker0 -j MASQUERADE  │
  │    │                                                             │
  │  ┌─┴──────────────────────────────────────────────────────────┐  │
  │  │  docker0  (linux bridge)  172.17.0.1/16                    │  │
  │  └───┬──────────────────────┬─────────────────────────────────┘  │
  │      │ veth pair            │ veth pair                          │
  └──────┼──────────────────────┼────────────────────────────────────┘
         │                      │
  ┌──────┴───────────┐   ┌──────┴───────────┐
  │ netns: container │   │ netns: container │
  │  api             │   │  db              │
  │  eth0 172.17.0.3 │   │  eth0 172.17.0.4 │
  │  lo   127.0.0.1  │   │  lo   127.0.0.1  │
  │  default gw      │   │  default gw      │
  │    172.17.0.1    │   │    172.17.0.1    │
  └──────────────────┘   └──────────────────┘
      api → db: 172.17.0.4:5432 directly (same bridge, no NAT)
      api → internet: SNAT/MASQUERADE via host eth0
      internet → api: only via published ports (-p), through DNAT
```

| Mode | Flag | Behavior | When |
|------|------|----------|------|
| **bridge** (user-defined) | `--network mynet` | Own netns, embedded DNS at `127.0.0.11` resolves container names, isolated from other user networks | Default choice for Compose |
| bridge (default `docker0`) | (none) | Same, but **no DNS** — only legacy `--link` | Avoid; always create a named network |
| **host** | `--network host` | **No net namespace.** Container binds host ports directly | Ultra-low-latency, packet capture, some monitoring agents. Loses all port isolation. |
| **none** | `--network none` | Only `lo`. No connectivity. | Batch jobs that must not talk to anything |
| **overlay** | Swarm/K8s CNI | VXLAN tunnel across hosts, one flat L3 space | Multi-host |
| **macvlan** | `--network mv` | Container gets its own MAC on the physical LAN | Legacy apps needing a real LAN IP |
| **container:** | `--network container:x` | Shares another container's netns | Exactly how Kubernetes pods work (the `pause` container) |

```bash
docker network create --driver bridge --subnet 172.28.0.0/16 appnet
docker run -d --name db  --network appnet postgres:16
docker run -d --name api --network appnet -p 8080:3000 myapi
# api resolves "db" via Docker's embedded DNS at 127.0.0.11 → 172.28.0.2

# Publishing
-p 8080:3000            # 0.0.0.0:8080 → container:3000   (EXPOSED TO THE WORLD)
-p 127.0.0.1:8080:3000  # localhost only  ← use this on dev machines
-p 3000                 # random high host port
-P                      # publish all EXPOSE'd ports to random ports

docker port myapi
sudo iptables -t nat -L DOCKER -n --line-numbers    # see the DNAT rules Docker wrote
```

**Gotcha:** `EXPOSE 3000` in a Dockerfile publishes **nothing**. It is documentation
plus a hint for `-P`. Traffic reaches a container only via `-p`/`--publish` or from a
peer on the same network.

**Gotcha:** Docker's iptables rules sit in the `DOCKER` chain and are evaluated
**before** most `INPUT`-based firewalls (ufw, firewalld). `-p 5432:5432` on a
cloud VM exposes Postgres to the internet even with ufw "enabled". Bind to
`127.0.0.1` or set `"iptables": false` and manage rules yourself.

---

## Storage: Volumes vs Bind Mounts

```
┌──────────────────────────────────────────────────────────────────────┐
│                       CONTAINER FILESYSTEM                            │
│                                                                       │
│  /                     ← overlayfs: image layers + writable upper     │
│  /app                     EPHEMERAL. Dies with the container.         │
│  /tmp                     Counts against ephemeral-storage limits.    │
│                                                                       │
│  /var/lib/postgresql/data ──► named volume  pgdata                    │
│                               /var/lib/docker/volumes/pgdata/_data    │
│                               Docker-managed, survives rm, backup-able│
│                                                                       │
│  /app/src              ──► bind mount  /home/me/proj/src              │
│                               host path, host permissions, dev-only   │
│                                                                       │
│  /run/secrets          ──► tmpfs (RAM)                                │
│                               never hits disk, gone on stop           │
└──────────────────────────────────────────────────────────────────────┘
```

| | Named volume | Bind mount | tmpfs |
|---|---|---|---|
| Location | `/var/lib/docker/volumes/` | Any host path | RAM |
| Created by | Docker | You | Docker |
| Portable across hosts | Via volume drivers (NFS, EBS) | No | N/A |
| Permissions | Docker initializes from image | **Host UIDs — the #1 pain point** | tmpfs |
| Performance on macOS/Windows | Native (in the VM) | **Slow** (osxfs/gRPC-FUSE) | Fast |
| Prod use | Yes | Only for read-only config/certs | Secrets, scratch |

```bash
docker volume create pgdata
docker run -d --name pg -v pgdata:/var/lib/postgresql/data postgres:16

# Modern --mount syntax is explicit and preferred
docker run -d \
  --mount type=volume,source=pgdata,target=/var/lib/postgresql/data \
  --mount type=bind,source="$PWD/conf",target=/etc/postgresql,readonly \
  --mount type=tmpfs,target=/tmp,tmpfs-size=64m \
  postgres:16

# Backup a named volume
docker run --rm -v pgdata:/data -v "$PWD":/backup alpine \
  tar czf /backup/pgdata-$(date +%F).tar.gz -C /data .

docker volume ls -f dangling=true
docker volume prune            # deletes UNUSED volumes — read twice before running
```

**The bind-mount permission trap:** your container runs as uid 10001; the host directory
is owned by uid 1000. The container gets `EACCES`. "Solutions" people reach for:
`chmod 777` (never), running as root (defeats the point). Correct: `chown -R 10001
./data` on the host, or use a named volume (Docker copies the image's ownership on first
use), or in Kubernetes use `fsGroup`.

**Everything ephemeral is really ephemeral.** In Kubernetes, uploads written to the
container filesystem vanish on every restart, rollout, node drain, and eviction — and
because a rollout replaces pods, the files "disappear" only on deploy days, which is a
brutal thing to debug. Object storage (S3/GCS) for user content; PVCs only for things
that genuinely need block storage.

---

## Docker Compose

Compose is for **local development and small single-host deployments**. It is not an
orchestrator. Don't pretend it is one in an interview.

```yaml
# compose.yaml  (the `version:` key is obsolete in Compose v2)
name: acme-platform

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: dev                      # multi-stage: stop at the dev stage
      args:
        NODE_VERSION: "22"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgres://app:app@db:5432/app
      REDIS_URL: redis://cache:6379
      OTEL_EXPORTER_OTLP_ENDPOINT: http://otel:4318
    ports:
      - "127.0.0.1:3000:3000"          # bind to loopback, not 0.0.0.0
      - "127.0.0.1:9229:9229"          # node --inspect
    volumes:
      - ./src:/app/src:ro              # hot reload
      - /app/node_modules              # anonymous volume MASKS the host dir
    depends_on:
      db:    { condition: service_healthy }
      cache: { condition: service_started }
    develop:
      watch:
        - { action: sync,    path: ./src, target: /app/src }
        - { action: rebuild, path: package.json }
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/healthz"]
      interval: 10s
      timeout: 3s
      retries: 3
      start_period: 15s
    deploy:
      resources:
        limits:   { cpus: "2.0", memory: 1G }
        reservations: { cpus: "0.5", memory: 256M }

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./db/init:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d app"]
      interval: 5s
      timeout: 3s
      retries: 10
      start_period: 10s

  cache:
    image: redis:7-alpine
    command: ["redis-server", "--appendonly", "yes", "--maxmemory", "256mb",
              "--maxmemory-policy", "allkeys-lru"]
    volumes: [redisdata:/data]

volumes:
  pgdata:
  redisdata:
```

**`depends_on` without `condition: service_healthy` only orders *start*, not
*readiness*.** Your API will connect-refuse against a Postgres that is still running
initdb. This is the single most common Compose bug, and the fix is a healthcheck.

```bash
docker compose up -d --build
docker compose watch                 # Compose v2.22+: sync/rebuild on file change
docker compose logs -f --tail=100 api
docker compose exec api sh
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
docker compose down -v               # -v ALSO deletes named volumes. Careful.
docker compose -f compose.yaml -f compose.prod.yaml up -d   # overlay files
docker compose config                # render the fully-merged, resolved config
```

---

## Kubernetes Architecture & the Reconciliation Loop

### The one mental model that explains everything

Kubernetes is **not** a job runner that executes your commands. It is a set of
**controllers running reconciliation loops** against a **declarative desired state**
stored in etcd.

```
                    THE RECONCILIATION LOOP
                    (every controller, forever)

        ┌──────────────────────────────────────────────┐
        │                                              │
        │   ┌────────────────┐                         │
        │   │ DESIRED STATE  │  spec: replicas: 5      │
        │   │  (etcd, via    │                         │
        │   │   API server)  │                         │
        │   └───────┬────────┘                         │
        │           │                                  │
        │           ▼                                  │
        │      ┌─────────┐   observe (watch)           │
        │      │ COMPARE │◄──────────────┐             │
        │      └────┬────┘               │             │
        │           │ diff               │             │
        │           ▼                    │             │
        │      ┌─────────┐          ┌────┴─────────┐   │
        │      │   ACT   │─────────►│ ACTUAL STATE │   │
        │      │ (create │          │ (real pods   │   │
        │      │  2 pods)│          │  on nodes)   │   │
        │      └─────────┘          └──────┬───────┘   │
        │                                  │           │
        │                                  ▼           │
        │                          ┌───────────────┐   │
        │                          │ WRITE STATUS  │   │
        │                          │ status:       │   │
        │                          │  readyReplicas│   │
        │                          └───────┬───────┘   │
        │                                  │           │
        └──────────────────────────────────┘           │
                                                       │
   You never say "create 2 pods". You say "I want 5".  │
   A controller notices actual=3 and converges. ───────┘

   Kill a pod → ReplicaSet controller sees 4≠5 → creates one.
   Node dies  → node controller marks pods for deletion after
                --pod-eviction-timeout (5m) → RS recreates elsewhere.
   You edit the image → Deployment controller creates a NEW ReplicaSet
                and shifts replicas between them per the rollout strategy.
```

**Everything follows this shape.** HPA reconciles replica count against a metric. The
PV controller reconciles PVCs against PVs. cert-manager reconciles Certificates against
ACME. Your own CRD + operator does the same thing. If you understand
`observe → diff → act → report status`, you can reason about any Kubernetes component
you've never seen.

Three corollaries seniors state and juniors miss:

1. **Level-triggered, not edge-triggered.** Controllers don't process an event stream of
   deltas; they periodically re-evaluate full state. A missed watch event is
   self-healing. This is why Kubernetes is robust and also why it's "eventually"
   consistent — nothing is instant.
2. **`kubectl apply` is a write to etcd and nothing else.** The command returns
   `deployment.apps/api configured` the moment the API server persists the object. The
   pods may take minutes, or never come up at all. `kubectl rollout status` is what
   tells you the truth.
3. **Fighting a controller always loses.** `kubectl delete pod` on a Deployment-managed
   pod just makes a new one. `kubectl edit` on a live resource gets reverted by ArgoCD.
   Change the desired state, not the actual state.

### Control plane vs data plane

```
╔═══════════════════════════ CONTROL PLANE ══════════════════════════════╗
║                                                                        ║
║   kubectl / CI / operator                                              ║
║        │ HTTPS + client cert / OIDC token                              ║
║        ▼                                                               ║
║  ┌──────────────────────────────────────────────────────────────┐      ║
║  │  kube-apiserver          (the ONLY component that talks etcd) │      ║
║  │  ─────────────────────────────────────────────────────────── │      ║
║  │  1. Authentication  (cert / OIDC / SA token / webhook)       │      ║
║  │  2. Authorization   (RBAC / Node / ABAC / webhook)           │      ║
║  │  3. Mutating admission  (webhooks, sidecar injection,        │      ║
║  │                          defaulting, LimitRange)             │      ║
║  │  4. Schema validation   (OpenAPI)                            │      ║
║  │  5. Validating admission (webhooks, ValidatingAdmission-     │      ║
║  │                           Policy/CEL, ResourceQuota, PSA)    │      ║
║  │  6. Persist to etcd                                          │      ║
║  │  Serves: REST + WATCH (long-lived streams to everyone)       │      ║
║  └───────┬──────────────────────────────────────────────────────┘      ║
║          │                                                             ║
║  ┌───────▼──────┐   ┌──────────────┐  ┌────────────────────────────┐   ║
║  │    etcd      │   │  scheduler   │  │  kube-controller-manager   │   ║
║  │  Raft, 3/5   │   │  filter →    │  │  ~40 loops in one binary:  │   ║
║  │  members     │   │  score →     │  │   deployment, replicaset,  │   ║
║  │  ONLY source │   │  bind        │  │   node, endpointslice, job,│   ║
║  │  of truth    │   │  (writes     │  │   svcaccount, pv-binder,   │   ║
║  │  Back it up. │   │   pod.spec.  │  │   ttl, garbage-collector…  │   ║
║  │              │   │   nodeName)  │  └────────────────────────────┘   ║
║  └──────────────┘   └──────────────┘  ┌────────────────────────────┐   ║
║                                       │ cloud-controller-manager   │   ║
║                                       │  LB provisioning, node IPs,│   ║
║                                       │  route tables, volumes     │   ║
║                                       └────────────────────────────┘   ║
╚════════════════════════════════════════════════════════════════════════╝
                                  │  watch / status updates
                                  ▼
╔══════════════════════════════ DATA PLANE ══════════════════════════════╗
║  NODE 1                              NODE 2                            ║
║  ┌──────────────────────────────┐   ┌──────────────────────────────┐   ║
║  │ kubelet                      │   │ kubelet                      │   ║
║  │  • watches pods w/ my name   │   │                              │   ║
║  │  • calls CRI to run them     │   │                              │   ║
║  │  • runs probes               │   │                              │   ║
║  │  • reports status + node     │   │                              │   ║
║  │    conditions every 10s      │   │                              │   ║
║  │  • enforces eviction         │   │                              │   ║
║  ├──────────────────────────────┤   ├──────────────────────────────┤   ║
║  │ container runtime (CRI)      │   │ container runtime (CRI)      │   ║
║  │  containerd → runc → cgroups │   │  containerd → runc           │   ║
║  ├──────────────────────────────┤   ├──────────────────────────────┤   ║
║  │ kube-proxy   (iptables/IPVS) │   │ kube-proxy                   │   ║
║  ├──────────────────────────────┤   ├──────────────────────────────┤   ║
║  │ CNI plugin (Cilium/Calico)   │   │ CNI plugin                   │   ║
║  ├──────────────────────────────┤   ├──────────────────────────────┤   ║
║  │  [pause][app][sidecar]  pod  │   │  [pause][app]  pod           │   ║
║  └──────────────────────────────┘   └──────────────────────────────┘   ║
╚════════════════════════════════════════════════════════════════════════╝

CRITICAL PROPERTY: if the entire control plane dies, running pods KEEP RUNNING
and Services keep routing (kube-proxy rules persist in the kernel). You lose
scheduling, scaling, self-healing, and API access — not traffic. This is why
"the control plane is down" is a Sev2, not always a Sev1.
```

### Component-by-component, what a senior needs to know

**kube-apiserver** — stateless, horizontally scalable, sits behind an LB. It is the
*only* component that talks to etcd; everything else watches the API server. It is
therefore your bottleneck: a runaway controller doing `LIST pods` across 50k pods every
second will melt it. Look at `apiserver_request_duration_seconds`,
`apiserver_current_inflight_requests`, and turn on **API Priority and Fairness**
(`FlowSchema` / `PriorityLevelConfiguration`, GA 1.29) before a noisy client starves
your controllers.

**etcd** — Raft consensus, odd member count (3 or 5; 7 costs more than it buys).
Extremely sensitive to **disk fsync latency** — `etcd_disk_wal_fsync_duration_seconds`
p99 above ~25ms means leader elections and cluster-wide stalls. Always use local NVMe,
never network storage. Default DB size limit 2GB (`--quota-backend-bytes`, commonly
raised to 8GB). Secrets are stored here — enable **encryption at rest**
(`EncryptionConfiguration` with KMS v2) or a compromised etcd backup hands over every
credential you have.

```bash
ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  snapshot save /backup/etcd-$(date +%F-%H%M).db
etcdctl snapshot status /backup/etcd-*.db -w table
# If you cannot restore this, you do not have a backup. Test it quarterly.
```

**kube-scheduler** — watches for pods with `spec.nodeName == ""`, picks a node, and
writes a **Binding**. That's its entire job. It does not start containers.

**kube-controller-manager** — one binary, ~40 controllers, leader-elected. When someone
says "Kubernetes restarted my pod", the right question is *which controller*: the
ReplicaSet controller (pod deleted), the kubelet (liveness probe failed), or the node
controller (node NotReady).

**kubelet** — the node agent. Not a controller in the etcd sense: it watches for pods
bound to *its* node and makes them real via CRI. It also runs probes, enforces eviction
thresholds, reports `NodeStatus` every 10s (`--node-status-update-frequency`), and
manages the static-pod manifests in `/etc/kubernetes/manifests` (which is how the
control plane itself boots on kubeadm clusters).

**kube-proxy** — programs iptables/IPVS so ClusterIP virtual IPs work. See
[Kubernetes Networking](#kubernetes-networking).

**CRI / containerd** — dockershim was **removed in Kubernetes 1.24**. The kubelet talks
CRI (gRPC) to containerd or CRI-O, which talk OCI to runc. Docker Engine is not in the
path anymore; images built by Docker still work fine because they're OCI images.

```bash
# On a node, containerd's CLI (not docker!)
crictl ps
crictl images
crictl logs <container-id>
crictl inspectp <pod-id>          # the sandbox
ctr -n k8s.io containers ls       # lower-level containerd namespace
```

**The `pause` container** — every pod has an invisible extra container running `pause`
(a ~700KB binary that calls `pause()` forever). It **owns the pod's network and IPC
namespaces**; app containers join it via `--network container:pause`. That's the
mechanism behind "containers in a pod share localhost". It also reaps zombies at the
pod sandbox level.

---

## Scheduling: How a Pod Actually Lands on a Node

```
    kubectl apply -f deploy.yaml
            │
            ▼
   ┌────────────────────┐
   │ API server         │  authn → authz → mutating admission → validate
   │                    │  → validating admission → WRITE Deployment to etcd
   └─────────┬──────────┘
             │ watch event: Deployment created
             ▼
   ┌────────────────────┐
   │ Deployment         │  creates ReplicaSet  api-7d9f8b (pod-template-hash)
   │ controller         │
   └─────────┬──────────┘
             │ watch: ReplicaSet created, replicas=3, actual=0
             ▼
   ┌────────────────────┐
   │ ReplicaSet         │  creates 3 Pod objects
   │ controller         │  spec.nodeName = ""   → status: Pending
   └─────────┬──────────┘
             │ watch: unscheduled pods
             ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ kube-scheduler                                              │
   │                                                             │
   │  ┌── FILTER (predicates) — "can it fit at all?" ──────────┐  │
   │  │  NodeResourcesFit    requests ≤ allocatable?          │  │
   │  │  NodeAffinity        nodeSelector / affinity match?   │  │
   │  │  TaintToleration     tolerates NoSchedule taints?     │  │
   │  │  PodTopologySpread   skew within maxSkew?             │  │
   │  │  VolumeBinding       can the PV attach in this zone?  │  │
   │  │  NodePorts           host port free?                  │  │
   │  │  PodAffinity         co-location rules satisfied?     │  │
   │  │  100 nodes ──────────────────────────────► 12 feasible│  │
   │  └───────────────────────────────────────────────────────┘  │
   │                                                             │
   │  ┌── SCORE (priorities) — "which is BEST?" 0-100 each ───┐  │
   │  │  NodeResourcesBalancedAllocation   cpu/mem balance    │  │
   │  │  NodeResourcesFit (LeastAllocated) spread the load    │  │
   │  │  ImageLocality                     image already here │  │
   │  │  InterPodAffinity                                     │  │
   │  │  PodTopologySpread                 zone balance       │  │
   │  │  TaintToleration (PreferNoSchedule)                   │  │
   │  │  12 feasible ────────────────► node-7 wins with 87    │  │
   │  └───────────────────────────────────────────────────────┘  │
   │                                                             │
   │  If NO node is feasible → PostFilter → PREEMPTION:          │
   │    evict lower-priority pods to make room, pod stays Pending│
   │                                                             │
   │  Reserve → Permit → PreBind → BIND (write pod.spec.nodeName)│
   └─────────┬───────────────────────────────────────────────────┘
             │ watch: pod bound to node-7
             ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ kubelet on node-7                                           │
   │  1. CNI ADD    → create netns, veth, assign pod IP          │
   │  2. pull image (respecting imagePullPolicy + secrets)       │
   │  3. create pause container (holds net/ipc ns)               │
   │  4. run initContainers, SEQUENTIALLY, each to completion    │
   │  5. mount volumes (CSI NodeStage → NodePublish)             │
   │  6. start app containers  → status Running                  │
   │  7. startupProbe → readinessProbe → mark Ready              │
   └─────────┬───────────────────────────────────────────────────┘
             │ pod Ready
             ▼
   ┌────────────────────┐      ┌──────────────────────────────────┐
   │ EndpointSlice      │─────►│ kube-proxy on EVERY node updates │
   │ controller adds    │      │ iptables/IPVS → traffic flows    │
   │ pod IP             │      └──────────────────────────────────┘
   └────────────────────┘

Typical wall-clock, warm image cache: 1.5–4s.   Cold 900MB image pull: 25–90s.
```

Note that the scheduler only reads **requests**, never limits, and never actual usage.
A node running at 95% CPU with low requests looks completely empty to the scheduler.
This surprises people constantly.

### Steering placement

```yaml
spec:
  # Hard requirement, simplest form
  nodeSelector:
    node.kubernetes.io/instance-type: m6i.2xlarge

  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:      # hard
        nodeSelectorTerms:
          - matchExpressions:
              - { key: topology.kubernetes.io/zone, operator: In,
                  values: [us-east-1a, us-east-1b] }
      preferredDuringSchedulingIgnoredDuringExecution:     # soft
        - weight: 100
          preference:
            matchExpressions:
              - { key: karpenter.sh/capacity-type, operator: In, values: [spot] }

    podAntiAffinity:
      # Never put two replicas on the same node — survives a node failure
      requiredDuringSchedulingIgnoredDuringExecution:
        - labelSelector:
            matchLabels: { app: api }
          topologyKey: kubernetes.io/hostname

  # Preferred over anti-affinity for zone balance: cheaper to compute, more precise
  topologySpreadConstraints:
    - maxSkew: 1
      topologyKey: topology.kubernetes.io/zone
      whenUnsatisfiable: DoNotSchedule       # or ScheduleAnyway (soft)
      labelSelector:
        matchLabels: { app: api }
    - maxSkew: 1
      topologyKey: kubernetes.io/hostname
      whenUnsatisfiable: ScheduleAnyway
      labelSelector:
        matchLabels: { app: api }

  tolerations:
    - key: "workload"
      operator: "Equal"
      value: "gpu"
      effect: "NoSchedule"
    - key: "node.kubernetes.io/not-ready"
      operator: "Exists"
      effect: "NoExecute"
      tolerationSeconds: 60      # default is 300s; lower = faster failover

  priorityClassName: high-priority   # preempts lower-priority pods when full
```

**Taints vs affinity — the distinction interviewers probe:**
- **Node affinity / nodeSelector**: the *pod* says "I want that kind of node." It does
  not stop other pods from landing there.
- **Taints + tolerations**: the *node* says "keep out unless you have a permit." This is
  how you reserve GPU nodes, spot nodes, or a dedicated tenant pool.
- You usually need **both**: taint the GPU nodes so nothing else lands, and add node
  affinity so GPU pods actually go there.

`podAntiAffinity` with `requiredDuringScheduling` and `topologyKey:
kubernetes.io/hostname` is the standard way to guarantee "no two replicas on one node".
Its cost is O(pods²) scoring — on very large clusters prefer
`topologySpreadConstraints`, which the scheduler handles far more efficiently.

---

## Workloads

### Pod

The atomic scheduling unit: one or more containers sharing **network namespace**
(same IP, same port space, `localhost` between them), **IPC namespace**, and any
declared **volumes**. They do **not** share a mount namespace — each container has its
own filesystem.

You almost never write a bare Pod. You write a controller that creates them. A bare Pod
is not rescheduled when its node dies; it's just gone.

Multi-container patterns that justify a second container:
- **Sidecar** — log shipper, service-mesh proxy (Envoy/Linkerd), metrics adapter,
  secret refresher. Since **1.29 (beta) / 1.33 (GA)**, use a **native sidecar**: an
  `initContainer` with `restartPolicy: Always`. It starts before app containers, stays
  running, and — critically — **terminates after them**, which fixes the ancient
  "Istio proxy dies before my Job finishes" problem.
- **Adapter** — reshapes output (e.g. converts app logs to a standard format).
- **Ambassador** — proxies outbound connections (e.g. a local Cloud SQL proxy).
- **Init container** — runs to completion before the app: schema migrations, waiting for
  a dependency, fetching config, `chown`ing a volume.

```yaml
spec:
  initContainers:
    - name: migrate                       # classic init: runs once, must exit 0
      image: myapp:1.4.2
      command: ["npm","run","migrate:deploy"]
      envFrom: [{ secretRef: { name: db-creds } }]
    - name: envoy                         # NATIVE SIDECAR (1.33+)
      image: envoyproxy/envoy:v1.31
      restartPolicy: Always               # ← this makes it a sidecar
      startupProbe:
        httpGet: { path: /ready, port: 15000 }
        failureThreshold: 30
        periodSeconds: 1
  containers:
    - name: app
      image: myapp:1.4.2
```

### ReplicaSet

Keeps N pods matching a selector alive. You do not create these directly — Deployments
create and version them. Worth knowing because **`kubectl get rs` is how you read
rollout history**: each ReplicaSet corresponds to one pod template, identified by
`pod-template-hash`.

### Deployment — and the rollout mechanics people fumble

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  labels: { app: api }
spec:
  replicas: 10
  revisionHistoryLimit: 5             # default 10; each keeps an old RS object
  progressDeadlineSeconds: 600        # mark Failed if no progress for 10m
  minReadySeconds: 10                 # pod must be Ready this long before it counts
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%                   # default 25% → 2 extra pods (rounds UP)
      maxUnavailable: 25%             # default 25% → 2 can be down (rounds DOWN)
  selector:
    matchLabels: { app: api }         # IMMUTABLE after creation
  template:
    metadata:
      labels: { app: api }
    spec: { ... }
```

```
        ROLLING UPDATE: replicas=10, maxSurge=25%, maxUnavailable=25%
        → surge 2 (ceil), unavailable 2 (floor)
        → total pods stay in [8, 12]; at least 8 always serving

  t=0    OLD ██████████ (10 ready)   NEW              total 10, avail 10
  t=2    OLD ████████░░ (8 ready)    NEW ██           total 12, avail 8
         │ scale new RS to 2, terminate 2 old
  t=15   OLD ████████   (8 ready)    NEW ██ ready     total 10, avail 10
  t=17   OLD ██████░░   (6 ready)    NEW ████         total 12, avail 8
   …
  t=95   OLD                          NEW ██████████  total 10, avail 10

  Time ≈ ceil(10 / 2) × (pod startup + minReadySeconds)
       ≈ 5 × (8s + 10s) = 90s

  maxUnavailable: 0 + maxSurge: 1  → safest, slowest (one at a time, never
                                     below full capacity). Good for small,
                                     capacity-critical services.
  maxUnavailable: 0 + maxSurge: 100% → fastest, doubles cost + DB connections
                                     for the duration. Watch your pool limits.
```

`maxUnavailable: 0` requires headroom for the surge pods. If the cluster is full, the
rollout **stalls silently** at `progressDeadlineSeconds` with new pods `Pending`.

```bash
kubectl rollout status deployment/api --timeout=5m    # blocks; use this in CI
kubectl rollout history deployment/api
kubectl rollout history deployment/api --revision=4
kubectl rollout undo deployment/api                   # back one revision
kubectl rollout undo deployment/api --to-revision=3
kubectl rollout pause deployment/api                  # canary: pause mid-rollout
kubectl rollout resume deployment/api
kubectl rollout restart deployment/api                # re-roll with same image
                                                      # (sets a kubectl.kubernetes.io/
                                                      #  restartedAt annotation)
```

`kubectl rollout restart` is the correct way to pick up a changed ConfigMap/Secret when
you're consuming it via `envFrom` — env vars are injected at container start and are
**never** updated in place. (Volume-mounted ConfigMaps *do* update, after up to ~60s of
kubelet sync, but your app has to watch the file.)

The idiomatic fix is to make config changes roll the deployment automatically:

```yaml
spec:
  template:
    metadata:
      annotations:
        checksum/config: "{{ include (print $.Template.BasePath \"/cm.yaml\") . | sha256sum }}"
```

### StatefulSet — and when you actually need one

Deployments give you interchangeable, anonymous, disposable pods. StatefulSets give you
the opposite:

| Guarantee | Deployment | StatefulSet |
|-----------|-----------|-------------|
| Pod name | `api-7d9f8b-x4k2p` (random) | `pg-0`, `pg-1`, `pg-2` (**stable, ordinal**) |
| DNS | Service VIP only | `pg-0.pg-headless.ns.svc.cluster.local` per pod |
| Storage | Shared or none | **One PVC per pod** via `volumeClaimTemplates`, reattached to the same ordinal forever |
| Start order | All at once | **0, then 1, then 2** — each Ready before the next |
| Rolling update order | Arbitrary | **Reverse ordinal**: N-1 → … → 0 |
| Scale down | Arbitrary pod | Highest ordinal first |
| PVC on delete | N/A | **Retained by default** (`persistentVolumeClaimRetentionPolicy`, GA 1.32, changes this) |

```yaml
apiVersion: v1
kind: Service
metadata:
  name: pg-headless
spec:
  clusterIP: None                  # ← headless: DNS returns POD IPs, no VIP
  selector: { app: pg }
  ports: [{ name: pg, port: 5432 }]
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: pg
spec:
  serviceName: pg-headless         # REQUIRED, and must be a headless Service
  replicas: 3
  podManagementPolicy: OrderedReady   # or Parallel (start all at once)
  updateStrategy:
    type: RollingUpdate
    rollingUpdate:
      partition: 0                 # >0 = canary: only ordinals ≥ partition update
      maxUnavailable: 1            # 1.24+ (beta)
  selector: { matchLabels: { app: pg } }
  template:
    metadata: { labels: { app: pg } }
    spec:
      terminationGracePeriodSeconds: 120     # give the DB time to checkpoint
      containers:
        - name: postgres
          image: postgres:16
          ports: [{ name: pg, containerPort: 5432 }]
          volumeMounts:
            - { name: data, mountPath: /var/lib/postgresql/data, subPath: pgdata }
          resources:
            requests: { cpu: "2",  memory: 8Gi }
            limits:   { memory: 8Gi }        # no CPU limit; see the resources section
          readinessProbe:
            exec: { command: ["pg_isready","-U","postgres"] }
            periodSeconds: 5
  volumeClaimTemplates:                       # creates data-pg-0, data-pg-1, data-pg-2
    - metadata: { name: data }
      spec:
        accessModes: [ReadWriteOnce]
        storageClassName: gp3
        resources: { requests: { storage: 500Gi } }
```

`partition` is the underrated feature: set `partition: 2` on a 3-replica set and only
`pg-2` updates. Verify, then drop the partition to 0 to finish. That's a canary for
stateful systems.

**When you actually need a StatefulSet:** the members are not interchangeable and know
about each other by identity. Postgres/MySQL replication, Kafka brokers (broker IDs),
Zookeeper/etcd (peer lists), Elasticsearch masters, Cassandra, Redis Cluster.

**When you don't:** "it has a database" is not a reason. A stateless API talking to RDS
is a Deployment. A single pod needing one persistent disk is a Deployment with
`strategy: Recreate` and a plain PVC — simpler, and ReadWriteOnce means you can't have
two replicas anyway.

**The honest senior take:** for production databases, prefer a managed service (RDS,
Cloud SQL, Aurora) or a mature operator (CloudNativePG, Strimzi, Vitess). A hand-rolled
Postgres StatefulSet gives you no automated failover, no PITR, no connection pooling,
and no backup verification — you've built 20% of a database platform and named it
"done".

### DaemonSet

One pod per node (matching a selector). Node-level infrastructure only.

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata: { name: node-exporter, namespace: monitoring }
spec:
  selector: { matchLabels: { app: node-exporter } }
  updateStrategy:
    type: RollingUpdate
    rollingUpdate: { maxUnavailable: 10% }   # 10% of nodes at a time
  template:
    metadata: { labels: { app: node-exporter } }
    spec:
      hostNetwork: true
      hostPID: true
      priorityClassName: system-node-critical
      tolerations:
        - operator: Exists            # run on EVERY node, including tainted ones
      containers:
        - name: node-exporter
          image: prom/node-exporter:v1.8.2
          args: ["--path.rootfs=/host"]
          resources:
            requests: { cpu: 50m, memory: 64Mi }
            limits:   { memory: 128Mi }
          volumeMounts:
            - { name: root, mountPath: /host, readOnly: true, mountPropagation: HostToContainer }
      volumes:
        - name: root
          hostPath: { path: / }
```

Legitimate uses: log collectors (Fluent Bit, Vector), metrics (node-exporter), CNI
agents (Cilium, Calico), CSI node plugins, security agents (Falco), kube-proxy itself.

`tolerations: [{operator: Exists}]` tolerates *everything*, which is what you want for a
log collector — otherwise your tainted GPU nodes silently ship no logs. Set
`priorityClassName: system-node-critical` so it isn't the first thing evicted under node
pressure.

### Job and CronJob

```yaml
apiVersion: batch/v1
kind: Job
metadata: { name: reindex }
spec:
  completions: 100          # total successful pods needed
  parallelism: 10           # concurrent pods
  completionMode: Indexed   # each pod gets JOB_COMPLETION_INDEX 0..99 (1.24 GA)
  backoffLimit: 4           # retries before the Job is marked Failed
  activeDeadlineSeconds: 3600      # hard wall-clock cap, overrides backoffLimit
  ttlSecondsAfterFinished: 86400   # auto-delete the Job object after 24h
  podFailurePolicy:                # 1.31 GA — don't burn retries on infra failures
    rules:
      - action: FailJob
        onExitCodes: { containerName: worker, operator: In, values: [42] }
      - action: Ignore
        onPodConditions: [{ type: DisruptionTarget }]   # preempted ≠ app failure
  template:
    spec:
      restartPolicy: Never    # or OnFailure. NEVER "Always" — invalid for Jobs.
      containers:
        - name: worker
          image: myapp:1.4.2
          command: ["node","scripts/reindex.js"]
```

```yaml
apiVersion: batch/v1
kind: CronJob
metadata: { name: nightly-report }
spec:
  schedule: "17 2 * * *"
  timeZone: "America/New_York"        # 1.27 GA — before this, always UTC
  concurrencyPolicy: Forbid           # Allow | Forbid | Replace
  startingDeadlineSeconds: 300        # skip the run if we're >5m late
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 5
  suspend: false
  jobTemplate:
    spec:
      backoffLimit: 2
      ttlSecondsAfterFinished: 172800
      template:
        spec:
          restartPolicy: Never
          containers:
            - name: report
              image: reports:2.1.0
```

**CronJob gotchas that page people:**
- Default `concurrencyPolicy: Allow` means a job that takes 70 minutes on a hourly
  schedule will pile up overlapping runs until the node dies. Use `Forbid`.
- If the controller misses more than **100 schedules**, the CronJob stops scheduling
  entirely and logs `Cannot determine if job needs to be started`. This happens after a
  long control-plane outage or a long `suspend`.
- Without `ttlSecondsAfterFinished`, completed Job and Pod objects accumulate in etcd
  by the thousands and slow down every `LIST`.
- A sidecar that never exits keeps the pod `Running` forever and the Job never
  completes. Use native sidecars (`restartPolicy: Always` init containers) for Jobs.

---

## Kubernetes Networking

### The four rules of the Kubernetes network model

1. Every **pod gets its own IP address**.
2. Pods can reach every other pod **without NAT**, across nodes.
3. Agents on a node (kubelet, daemons) can reach all pods on that node.
4. The IP a pod sees itself as is the IP others see it as.

The CNI plugin's job is to make those true. How it does it is its business:

| CNI | Data path | Notes |
|-----|-----------|-------|
| **Cilium** | eBPF, can replace kube-proxy entirely | Best performance at scale, L7 policy, Hubble observability. My default in 2026. |
| **Calico** | BGP (no overlay) or IPIP/VXLAN | Mature, rock-solid NetworkPolicy, eBPF mode available |
| **AWS VPC CNI** | Pods get **real VPC IPs** on ENIs | Native ALB/SG integration; **IP exhaustion is the classic EKS incident** |
| **Flannel** | VXLAN overlay | Simple, no NetworkPolicy support at all |
| **Cilium/Calico + WireGuard** | encrypted overlay | Compliance requirements |

### Service → EndpointSlice → Pod: the actual traffic path

```
     A pod calls  http://payments:8080/charge
                            │
          ┌─────────────────▼──────────────────┐
          │ 1. DNS: CoreDNS resolves           │
          │    payments.prod.svc.cluster.local │
          │    → 10.96.4.17  (the ClusterIP —  │
          │      a VIRTUAL IP that exists on   │
          │      NO interface anywhere)        │
          └─────────────────┬──────────────────┘
                            │
          ┌─────────────────▼──────────────────────────────────┐
          │ 2. Packet leaves the pod → hits the node's kernel  │
          │    netfilter hooks (OUTPUT/PREROUTING nat table)   │
          │                                                    │
          │    kube-proxy has pre-programmed rules for         │
          │    10.96.4.17:8080 that DNAT to a real pod IP,     │
          │    chosen randomly per NEW CONNECTION.             │
          │    conntrack pins the flow so every subsequent     │
          │    packet of that TCP connection goes to the SAME  │
          │    backend.                                        │
          └─────────────────┬──────────────────────────────────┘
                            │
          ┌─────────────────▼──────────────────────────────────┐
          │ 3. Where does the backend list come from?          │
          │                                                    │
          │  Service (selector: app=payments)                  │
          │        │  EndpointSlice controller watches pods    │
          │        ▼                                           │
          │  EndpointSlice payments-abc12                      │
          │    endpoints:                                      │
          │      - addresses: [10.244.1.7]  ready: true        │
          │        nodeName: node-1  zone: us-east-1a          │
          │      - addresses: [10.244.2.9]  ready: true        │
          │      - addresses: [10.244.3.4]  ready: FALSE ◄──── │
          │        (readiness probe failing → EXCLUDED)        │
          │        │                                           │
          │        ▼ watch                                     │
          │  kube-proxy on EVERY node rewrites its rules       │
          └─────────────────┬──────────────────────────────────┘
                            │
          ┌─────────────────▼──────────────────────────────────┐
          │ 4. DNAT 10.96.4.17:8080 → 10.244.2.9:8080          │
          │    routed by the CNI (overlay or native) to node-2 │
          │    → veth → pod netns → app                        │
          └────────────────────────────────────────────────────┘

KEY INSIGHT: a Service is not a process. There is no proxy daemon in the path
(in iptables/IPVS mode). It is pure kernel packet rewriting. Nothing to crash,
nothing to scale — but also nothing that speaks HTTP, which is why a Service
cannot do retries, path routing, or per-request load balancing.
```

**Per-connection, not per-request.** This is the #1 gotcha for anyone running gRPC or
HTTP/2 behind a ClusterIP: those protocols multiplex thousands of requests over one
long-lived TCP connection, so **all** your traffic pins to one backend pod. You will see
one pod at 90% CPU and nine at 3%. Fixes: a service mesh (Envoy does L7 balancing), a
gRPC client with `round_robin` + headless-service DNS resolution, or periodic connection
recycling (`GRPC_ARG_MAX_CONNECTION_AGE`).

### Service types

```yaml
# ClusterIP — internal only. The default and 90% of what you'll write.
apiVersion: v1
kind: Service
metadata:
  name: payments
spec:
  type: ClusterIP
  selector: { app: payments }
  ports:
    - name: http           # ALWAYS name ports — required for multi-port + meshes
      port: 8080           # the Service's port
      targetPort: http     # a NAMED containerPort — survives container port changes
      protocol: TCP
  sessionAffinity: None    # or ClientIP (crude; prefer app-level sessions)
  # 1.30+: route to same-zone endpoints first, saving cross-AZ transfer $$
  trafficDistribution: PreferClose
```

```yaml
# Headless — no VIP, no load balancing. DNS returns ALL pod IPs (A records).
spec:
  clusterIP: None
# Use for: StatefulSet peer discovery, client-side LB, gRPC round_robin,
#          anything that needs to address individual pods.
```

```yaml
# NodePort — opens the SAME port on EVERY node, 30000-32767
spec:
  type: NodePort
  ports: [{ port: 80, targetPort: 8080, nodePort: 30080 }]
  externalTrafficPolicy: Local   # see below
# Fine for bare-metal + external LB. Terrible as a public entrypoint:
# no TLS termination, ugly ports, you must track node IPs yourself.
```

```yaml
# LoadBalancer — NodePort + a cloud LB provisioned by cloud-controller-manager
spec:
  type: LoadBalancer
  externalTrafficPolicy: Local
# One cloud LB per Service = one bill per Service. 40 services = 40 NLBs = $$$.
# Use ONE LoadBalancer for an ingress controller and route with Ingress/Gateway.
```

```yaml
# ExternalName — a pure DNS CNAME. No proxying, no endpoints.
spec:
  type: ExternalName
  externalName: prod-db.abc123.us-east-1.rds.amazonaws.com
# Nice for abstracting managed services so app config says "db" in every env.
```

**`externalTrafficPolicy`, the subtle one:**

```
Cluster (default)                    Local
─────────────────                    ─────
Packet hits node-1, which SNATs      Packet hits node-1 and is ONLY delivered
and forwards to a pod on node-3.     to a pod ON node-1. If none, DROPPED.

+ perfect load distribution          + preserves the CLIENT SOURCE IP
- CLIENT SOURCE IP IS LOST           + one less network hop
  (your access logs show node IPs)   - imbalanced if pods aren't evenly spread
- an extra hop of latency            - cloud LB health checks handle the
                                       "no local pod" case by removing the node
```

If your logs show every request coming from `10.0.x.x` node addresses, or rate limiting
by IP isn't working, this is why. Set `externalTrafficPolicy: Local` **and** ensure even
pod spread with topology constraints.

### kube-proxy: iptables vs IPVS vs eBPF

```
┌──────────────────────── iptables mode (default) ───────────────────────┐
│                                                                        │
│  PREROUTING/OUTPUT  →  KUBE-SERVICES                                   │
│                          │                                             │
│    ┌─────────────────────┴──────────────────────────────┐              │
│    │ -d 10.96.4.17/32 --dport 8080 -j KUBE-SVC-PAYMENTS │              │
│    │ -d 10.96.9.22/32 --dport 443  -j KUBE-SVC-AUTH     │              │
│    │ … one rule per (service, port) … evaluated LINEARLY│              │
│    └─────────────────────┬──────────────────────────────┘              │
│                          ▼                                             │
│               KUBE-SVC-PAYMENTS   (3 backends)                         │
│    ┌────────────────────────────────────────────────────┐              │
│    │ -m statistic --mode random --probability 0.33333   │              │
│    │      -j KUBE-SEP-POD1                              │              │
│    │ -m statistic --mode random --probability 0.50000   │              │
│    │      -j KUBE-SEP-POD2      (0.5 of the remaining)  │              │
│    │ -j KUBE-SEP-POD3           (fallthrough)           │              │
│    └────────────────────────────────────────────────────┘              │
│                          ▼                                             │
│               KUBE-SEP-POD2:  -j DNAT --to 10.244.2.9:8080             │
│                                                                        │
│  COMPLEXITY: O(n) rule traversal per NEW connection.                   │
│  Rule COUNT: ~5-8 rules per service-port + 2 per endpoint.             │
│    1,000 services × 10 endpoints ≈ 25,000-40,000 rules.                │
│  UPDATE COST: iptables-restore rewrites the WHOLE table atomically.    │
│    At 5,000 services a single endpoint change can take 5-30 SECONDS    │
│    of CPU on every node. During a big rollout, kube-proxy falls        │
│    behind and traffic goes to dead pods.                               │
└────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────── IPVS mode ────────────────────────────────┐
│  In-kernel L4 load balancer with a HASH TABLE, not a rule list.        │
│                                                                        │
│    ipvsadm -Ln                                                         │
│    TCP  10.96.4.17:8080 rr                                             │
│      -> 10.244.1.7:8080   Masq  1  12  3                               │
│      -> 10.244.2.9:8080   Masq  1  15  2                               │
│      -> 10.244.3.4:8080   Masq  1  11  4                               │
│                                                                        │
│  LOOKUP: O(1).  UPDATE: incremental, per-endpoint.                     │
│  ALGORITHMS: rr, lc (least-conn), dh, sh, sed, nq                      │
│  Still uses a small ipset-backed iptables set for masquerade/filtering.│
│  Switch here above ~1,000 services. Below that, iptables is simpler.   │
└────────────────────────────────────────────────────────────────────────┘

┌────────────── Cilium eBPF (kube-proxy replacement) ────────────────────┐
│  Programs attach at the socket / tc / XDP layer. Service resolution    │
│  happens at connect() time — the pod's socket is rewritten to the      │
│  backend address, so there is NO DNAT and NO conntrack entry for       │
│  in-cluster traffic. Lowest latency, no rule explosion, native         │
│  DSR (direct server return), L7 policy, and no kube-proxy at all.      │
└────────────────────────────────────────────────────────────────────────┘
```

```bash
# Which mode am I in?
kubectl -n kube-system logs ds/kube-proxy | grep -i "proxy mode"
kubectl -n kube-system get cm kube-proxy -o yaml | grep -A2 mode

# Count your rules (run on a node)
sudo iptables-save -t nat | wc -l
sudo iptables -t nat -L KUBE-SERVICES -n | head -20
sudo ipvsadm -Ln | head -20                     # IPVS mode

# Conntrack table pressure — a real source of mystery packet drops
sudo sysctl net.netfilter.nf_conntrack_count net.netfilter.nf_conntrack_max
dmesg | grep -i "nf_conntrack: table full"      # if you see this, raise the max
```

### EndpointSlice vs Endpoints

The old `Endpoints` object stored **every** backend of a Service in **one object**. A
Service with 5,000 pods produced a multi-megabyte object rewritten on every pod change,
and pushed to every node. It was a genuine control-plane killer.

`EndpointSlice` (GA 1.21, consumed by kube-proxy by default since 1.19, `Endpoints`
deprecated in **1.33**) shards this into slices of ≤100 endpoints and adds topology
hints and per-endpoint conditions (`ready`, `serving`, `terminating`).

```bash
kubectl get endpointslices -l kubernetes.io/service-name=payments
kubectl get endpointslice payments-abc12 -o yaml
# endpoints:
#   - addresses: ["10.244.2.9"]
#     conditions: { ready: true, serving: true, terminating: false }
#     nodeName: node-2
#     zone: us-east-1a
```

The `terminating` + `serving: true` combination is what makes **graceful shutdown**
possible: a pod being deleted stops being `ready` (new connections stop) while still
being `serving` (existing traffic can drain).

**Debug reflex:** when a Service returns connection-refused, the first command is
always `kubectl get endpointslices -l kubernetes.io/service-name=X`. Empty means your
selector doesn't match any pod labels, or no pod is Ready. That's 80% of "Service is
broken" tickets.

### Ingress

```
                     INGRESS TRAFFIC FLOW

  Internet
     │  https://api.acme.com/v1/orders
     ▼
  ┌──────────────────────────────────────────┐
  │ DNS: api.acme.com → 203.0.113.50         │
  └──────────────────┬───────────────────────┘
                     ▼
  ┌──────────────────────────────────────────────────────────┐
  │ Cloud LB (NLB/ALB)  — provisioned by ONE Service of      │
  │ type LoadBalancer that fronts the ingress controller     │
  └──────────────────┬───────────────────────────────────────┘
                     ▼  :443
  ┌──────────────────────────────────────────────────────────┐
  │ Ingress Controller Pods (nginx / Envoy / Traefik)        │
  │   • terminate TLS using the Secret named in the Ingress  │
  │   • WATCH Ingress objects and rebuild their own config   │
  │   • match host + path → pick a backend Service           │
  │   • L7: retries, timeouts, rate limit, header rewrite,   │
  │         canary by weight/header, WAF                     │
  │   • resolve the Service's ENDPOINTS and load balance     │
  │     PER REQUEST directly to pod IPs (bypassing kube-proxy)│
  └──────────────────┬───────────────────────────────────────┘
                     ▼
  ┌──────────────────────────────────────────────────────────┐
  │ Pod 10.244.2.9:8080   Pod 10.244.1.7:8080   …            │
  └──────────────────────────────────────────────────────────┘

  The Ingress OBJECT is just config. The CONTROLLER does the work.
  No controller installed → your Ingress is an inert YAML file and
  `kubectl get ingress` shows an empty ADDRESS forever.
```

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/limit-rps: "100"
    nginx.ingress.kubernetes.io/enable-cors: "true"
spec:
  ingressClassName: nginx          # NOT the old kubernetes.io/ingress.class annotation
  tls:
    - hosts: [api.acme.com]
      secretName: api-acme-tls     # cert-manager creates/renews this
  rules:
    - host: api.acme.com
      http:
        paths:
          - path: /v1/orders
            pathType: Prefix       # Prefix | Exact | ImplementationSpecific
            backend:
              service: { name: orders, port: { name: http } }
          - path: /v1/payments
            pathType: Prefix
            backend:
              service: { name: payments, port: { name: http } }
```

**Ingress's real problem:** the spec is tiny, so every meaningful feature lives in
vendor-specific annotations. Switching from nginx-ingress to ALB means rewriting all of
them. There's no way to express "route by header", "split 5% of traffic", or "TCP/UDP"
portably. And a single Ingress object mixes concerns that belong to different teams
(TLS/DNS = platform, routes = app).

### Gateway API — the replacement

GA (v1.0) since late 2023. Role-oriented, typed, extensible, and portable.

```yaml
# Platform team owns this
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata: { name: public, namespace: infra }
spec:
  gatewayClassName: envoy
  listeners:
    - name: https
      protocol: HTTPS
      port: 443
      hostname: "*.acme.com"
      tls:
        mode: Terminate
        certificateRefs: [{ name: wildcard-acme-tls }]
      allowedRoutes:
        namespaces: { from: Selector, selector: { matchLabels: { gateway-access: "true" } } }
---
# App team owns this, in their own namespace
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata: { name: orders, namespace: prod }
spec:
  parentRefs: [{ name: public, namespace: infra }]
  hostnames: ["api.acme.com"]
  rules:
    - matches:
        - path: { type: PathPrefix, value: /v1/orders }
          headers: [{ name: x-canary, value: "true" }]
      backendRefs: [{ name: orders-canary, port: 8080 }]
    - matches:
        - path: { type: PathPrefix, value: /v1/orders }
      backendRefs:                    # weighted split — FIRST-CLASS, no annotations
        - { name: orders-stable, port: 8080, weight: 95 }
        - { name: orders-canary, port: 8080, weight: 5 }
      timeouts: { request: 10s, backendRequest: 5s }
      retry: { codes: [502, 503, 504], attempts: 2, backoff: 100ms }
      filters:
        - type: RequestHeaderModifier
          requestHeaderModifier:
            set: [{ name: x-forwarded-prefix, value: /v1/orders }]
```

Canary weighting, header matching, timeouts, retries, and cross-namespace delegation are
**in the API**, not in annotations. New clusters should start on Gateway API. Existing
Ingress keeps working; migrate opportunistically.

### NetworkPolicy — and why the default is a security problem

**By default, every pod in a Kubernetes cluster can reach every other pod in every
namespace, on every port.** Your frontend can connect straight to your production
Postgres. A compromised marketing-site pod can scan the whole cluster and reach the
Kubernetes API, the cloud metadata endpoint, and every internal service.

That is the actual default. Say it out loud in an interview; a lot of people don't know
it.

```yaml
# STEP 1: default-deny ingress AND egress, per namespace. Do this first.
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny-all, namespace: prod }
spec:
  podSelector: {}                 # every pod in this namespace
  policyTypes: [Ingress, Egress]
  # no ingress/egress rules = deny everything
---
# STEP 2: allow DNS (otherwise NOTHING works and you'll waste an hour)
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: allow-dns, namespace: prod }
spec:
  podSelector: {}
  policyTypes: [Egress]
  egress:
    - to:
        - namespaceSelector: { matchLabels: { kubernetes.io/metadata.name: kube-system } }
          podSelector: { matchLabels: { k8s-app: kube-dns } }
      ports:
        - { protocol: UDP, port: 53 }
        - { protocol: TCP, port: 53 }
---
# STEP 3: explicit allows
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: payments-policy, namespace: prod }
spec:
  podSelector: { matchLabels: { app: payments } }
  policyTypes: [Ingress, Egress]
  ingress:
    - from:
        - podSelector: { matchLabels: { app: api-gateway } }
        - namespaceSelector: { matchLabels: { name: monitoring } }
          podSelector: { matchLabels: { app: prometheus } }
      ports: [{ protocol: TCP, port: 8080 }]
  egress:
    - to: [{ podSelector: { matchLabels: { app: postgres } } }]
      ports: [{ protocol: TCP, port: 5432 }]
    - to:                              # external API, minus the metadata endpoint
        - ipBlock:
            cidr: 0.0.0.0/0
            except:
              - 169.254.169.254/32     # ← cloud metadata: ALWAYS block this
              - 10.0.0.0/8
      ports: [{ protocol: TCP, port: 443 }]
```

Semantics people get wrong:

- Policies are **additive and allow-only**. There is no "deny" rule. A pod's traffic is
  allowed if *any* policy selecting it allows it.
- **Selecting a pod flips it to deny-by-default** for the listed `policyTypes`. A pod
  selected by an ingress policy has all *other* ingress denied.
- `namespaceSelector` + `podSelector` in the **same list item** = AND (that pod in that
  namespace). As **separate list items** = OR. Nearly everyone writes this wrong once.
- Policies apply to **pod IPs**, not Service VIPs — write rules against pod labels.
- **You must allow DNS egress explicitly.** Forgetting this is the #1 NetworkPolicy
  self-inflicted outage.
- Flannel does not implement NetworkPolicy at all — your YAML applies successfully and
  does absolutely nothing. Verify with a real connection test.

```bash
# Prove your policy works (do this, don't assume)
kubectl run tester --rm -it --image=nicolaka/netshoot -n prod -- bash
  nc -zv postgres 5432        # should succeed
  nc -zv 169.254.169.254 80   # should hang/fail
  curl -m 3 https://api.stripe.com
```

For anything richer (L7 rules, FQDN-based egress, cluster-wide defaults), use
`CiliumNetworkPolicy` or Calico's `GlobalNetworkPolicy`.

---

## DNS and the ndots:5 Trap

Every pod gets a generated `/etc/resolv.conf`:

```
nameserver 10.96.0.10                 # the CoreDNS ClusterIP
search prod.svc.cluster.local svc.cluster.local cluster.local ec2.internal
options ndots:5
```

`ndots:5` means: **if a name has fewer than 5 dots, treat it as relative and try every
search domain first, before trying it as an absolute name.**

```
        RESOLVING  api.stripe.com   (2 dots  <  ndots:5)

  Query 1  api.stripe.com.prod.svc.cluster.local   → NXDOMAIN  (A)
  Query 2  api.stripe.com.prod.svc.cluster.local   → NXDOMAIN  (AAAA)
  Query 3  api.stripe.com.svc.cluster.local        → NXDOMAIN  (A)
  Query 4  api.stripe.com.svc.cluster.local        → NXDOMAIN  (AAAA)
  Query 5  api.stripe.com.cluster.local            → NXDOMAIN  (A)
  Query 6  api.stripe.com.cluster.local            → NXDOMAIN  (AAAA)
  Query 7  api.stripe.com.ec2.internal             → NXDOMAIN  (A)
  Query 8  api.stripe.com.ec2.internal             → NXDOMAIN  (AAAA)
  Query 9  api.stripe.com.                         → 34.х.х.х  (A)   ✓
  Query 10 api.stripe.com.                         → AAAA            ✓

  10 DNS queries for ONE hostname.
  ├─ At 5,000 external calls/sec you generate 50,000 DNS QPS.
  ├─ CoreDNS (2 replicas, 100m CPU) saturates and starts dropping.
  ├─ Dropped UDP → 5-second resolver timeout → your p99 jumps to 5000ms.
  └─ It looks like "the external API got slow". It didn't.

        RESOLVING  api.stripe.com.   (trailing dot = FQDN)

  Query 1  api.stripe.com.  → 34.х.х.х    ✓   ONE query. Done.
```

**Fixes, in the order I apply them:**

```yaml
# 1. Per-pod ndots override — safe, immediate, no infra change
spec:
  dnsConfig:
    options:
      - { name: ndots, value: "2" }
      - { name: single-request-reopen }   # glibc: avoids the A/AAAA conntrack race
      - { name: timeout, value: "2" }
      - { name: attempts, value: "2" }
```
Careful: with `ndots:2`, the short name `payments` (0 dots) still uses search domains,
but `payments.prod` (1 dot) also still works. `payments.prod.svc` (2 dots) would now be
tried as absolute first. Cross-namespace short names are the thing to re-test.

```
# 2. Use trailing-dot FQDNs in config for external hosts
DATABASE_HOST=prod-db.abc123.us-east-1.rds.amazonaws.com.
STRIPE_API=https://api.stripe.com./v1
```

```yaml
# 3. NodeLocal DNSCache — a DaemonSet caching resolver on 169.254.20.10.
#    Pods query the local node (no conntrack, no cross-node UDP), which
#    upstreams to CoreDNS over TCP. This alone removes the 5s-timeout class
#    of incident. Deploy it on any cluster above ~50 nodes.
```

```yaml
# 4. Right-size CoreDNS and turn on autoscaling + a real cache
apiVersion: v1
kind: ConfigMap
metadata: { name: coredns, namespace: kube-system }
data:
  Corefile: |
    .:53 {
        errors
        health { lameduck 5s }
        ready
        kubernetes cluster.local in-addr.arpa ip6.arpa {
            pods insecure
            fallthrough in-addr.arpa ip6.arpa
            ttl 30
        }
        prometheus :9153
        forward . /etc/resolv.conf { max_concurrent 1000 }
        cache 30 { success 9984 30; denial 9984 5 }
        loop
        reload
        loadbalance
    }
```

```yaml
# 5. Disable AAAA lookups on IPv4-only clusters (halves the query count)
#    In CoreDNS: `template ANY AAAA { rcode NOERROR }` or the `ipv6` plugin.
#    In Node: NODE_OPTIONS="--dns-result-order=ipv4first"
```

**DNS record shapes worth memorizing:**

```
<service>.<namespace>.svc.cluster.local              → ClusterIP  (A)
<service>.<namespace>.svc.cluster.local              → all pod IPs, if headless
<pod-ordinal>.<service>.<ns>.svc.cluster.local       → StatefulSet pod  (pg-0.pg.prod…)
_<port-name>._<proto>.<service>.<ns>.svc.cluster…    → SRV record (port discovery)
<pod-ip-dashed>.<ns>.pod.cluster.local               → 10-244-2-9.prod.pod.cluster.local
```

```bash
# Debugging DNS, the sequence
kubectl run dns -it --rm --image=nicolaka/netshoot --restart=Never -- bash
  cat /etc/resolv.conf
  nslookup payments
  dig +search +trace payments.prod.svc.cluster.local
  dig @10.96.0.10 payments.prod.svc.cluster.local
  for i in $(seq 1 100); do dig +short payments > /dev/null; done   # timing
kubectl -n kube-system logs -l k8s-app=kube-dns --tail=100
kubectl -n kube-system top pods -l k8s-app=kube-dns
# Metrics to alert on:
#   coredns_dns_request_duration_seconds p99 > 100ms
#   coredns_dns_responses_total{rcode="NXDOMAIN"} rate spiking  ← the ndots smell
#   coredns_forward_healthcheck_failures_total
```

---

## Kubernetes Storage

```
      APPLICATION                CLUSTER                    INFRASTRUCTURE

  ┌──────────────┐        ┌──────────────────┐        ┌────────────────────┐
  │ Pod          │        │ PersistentVolume │        │ StorageClass       │
  │  volumes:    │        │ Claim (PVC)      │        │  provisioner:      │
  │   - name: d  │───────►│  storage: 100Gi  │───────►│    ebs.csi.aws.com │
  │     pvc: d   │  binds │  accessModes:    │  uses  │  params:           │
  └──────────────┘        │    [ReadWriteOnce]        │    type: gp3       │
                          │  storageClass: gp3│       │    iops: "6000"    │
                          └────────┬─────────┘        │  reclaimPolicy:    │
                                   │ 1:1 bind         │    Delete          │
                                   ▼                  │  volumeBindingMode:│
                          ┌──────────────────┐        │    WaitForFirst-   │
                          │ PersistentVolume │        │    Consumer        │
                          │  (PV) — created  │        └────────┬───────────┘
                          │  DYNAMICALLY by  │                 │
                          │  the CSI driver  │◄────────────────┘
                          │  pvc-8f3a-…      │   provisions
                          └────────┬─────────┘
                                   ▼
                          ┌──────────────────┐
                          │ Real EBS volume  │
                          │ vol-0a1b2c3d     │
                          │ in us-east-1a ◄──┼── ZONE-LOCKED. A pod in 1b
                          └──────────────────┘    CANNOT mount this.

  CSI lifecycle on attach:
    CreateVolume → ControllerPublishVolume (attach to node)
      → NodeStageVolume (format + mount to a global path)
      → NodePublishVolume (bind-mount into the pod)
```

### Access modes — and the ReadWriteOnce reality

| Mode | Short | Meaning | Reality |
|------|-------|---------|---------|
| ReadWriteOnce | RWO | Read-write by **one node** | EBS, GCE PD, Azure Disk. **The default and the constraint.** Multiple pods on the *same node* can share it. |
| ReadOnlyMany | ROX | Read-only by many nodes | Rare; snapshots, static content |
| ReadWriteMany | RWX | Read-write by many nodes | **Only NFS, EFS, CephFS, Azure Files.** Not block storage. |
| ReadWriteOncePod | RWOP | Read-write by exactly **one pod** | GA 1.29. Real mutual exclusion — what you actually wanted for a single-writer DB. |

**The RWO trap that ruins rollouts:** a Deployment with `strategy: RollingUpdate` and an
RWO PVC. The new pod is scheduled to node-B, tries to attach a volume still attached to
node-A, and hangs in `ContainerCreating` with
`Multi-Attach error for volume "pvc-…" Volume is already exclusively attached to one
node`. The old pod won't terminate because the new one isn't ready. Deadlock.

```yaml
# ✅ Fix for a single-instance stateful Deployment
spec:
  strategy:
    type: Recreate      # kill the old pod FIRST, then start the new one
                        # accepts downtime, which is honest for single-writer storage
  replicas: 1
```

Or use a StatefulSet, where each replica gets its own PVC and rollouts are ordered.

### StorageClass

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gp3
  annotations: { storageclass.kubernetes.io/is-default-class: "true" }
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  iops: "6000"
  throughput: "250"
  encrypted: "true"
  kmsKeyId: arn:aws:kms:us-east-1:1234:key/abcd
reclaimPolicy: Delete              # Delete | Retain  ← see below
allowVolumeExpansion: true         # lets you grow the PVC later
volumeBindingMode: WaitForFirstConsumer   # ← ALWAYS use this on zonal storage
```

**`volumeBindingMode` is the setting people learn about via an outage.**

```
Immediate                              WaitForFirstConsumer
──────────                             ────────────────────
PVC created → PV provisioned NOW,      PVC created → stays Pending.
in whatever zone the controller picks. Scheduler picks a node for the pod
                                       FIRST, THEN the volume is provisioned
Later, the scheduler must place the     in THAT node's zone.
pod in that zone. If that zone is
full or cordoned → pod Pending         Volume and pod are always co-located.
FOREVER with no useful message.        Also composes correctly with the
                                       Cluster Autoscaler.
```

**`reclaimPolicy`:** `Delete` destroys the underlying disk when the PVC is deleted.
That is correct for scratch/cache and catastrophic for a database. Production data gets
`Retain` — the PV goes to `Released` and you consciously decide to delete it. I have
watched a `helm uninstall` erase a production Postgres volume because the chart's
default StorageClass was `Delete`.

```yaml
# StatefulSet PVC retention (GA 1.32) — explicit rather than implicit
spec:
  persistentVolumeClaimRetentionPolicy:
    whenDeleted: Retain      # keep PVCs when the StatefulSet is deleted
    whenScaled: Delete       # but drop them when scaling down replicas
```

### Ephemeral storage is a real, limited resource

The container's writable layer, `emptyDir`, and logs all consume node `ephemeral-storage`.
Exceed the limit and the kubelet **evicts your pod** with `Pod ephemeral local storage
usage exceeds the total limit of containers`.

```yaml
resources:
  requests: { ephemeral-storage: 1Gi }
  limits:   { ephemeral-storage: 4Gi }
volumes:
  - name: cache
    emptyDir: { sizeLimit: 2Gi }
  - name: shm
    emptyDir: { medium: Memory, sizeLimit: 1Gi }   # /dev/shm — counts against MEMORY limit
```

`medium: Memory` is a tmpfs and it is charged to the pod's **memory** cgroup, so a 1Gi
tmpfs inside a 512Mi memory limit is an OOMKill waiting for a busy day. Also: the default
`/dev/shm` is only **64MB**, which breaks Chrome/Puppeteer, Postgres `work_mem`-heavy
queries, and PyTorch dataloaders. Mount a bigger one explicitly.

```bash
kubectl describe node node-3 | grep -A8 "Allocated resources"
kubectl get pvc -A --sort-by=.spec.resources.requests.storage
kubectl get pv --sort-by=.spec.capacity.storage
kubectl describe pvc data-pg-0        # Events tell you why it's Pending
kubectl get volumeattachments         # who is attached where
```

---

## Configuration & Secrets

### ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata: { name: api-config }
data:
  LOG_LEVEL: "info"
  FEATURE_NEW_CHECKOUT: "true"
  application.yaml: |
    server:
      port: 8080
    cache:
      ttl: 300
```

Three consumption modes, with different update semantics:

```yaml
containers:
  - name: api
    # (a) individual keys as env vars — set ONCE at container start, NEVER updated
    env:
      - name: LOG_LEVEL
        valueFrom: { configMapKeyRef: { name: api-config, key: LOG_LEVEL } }
      - name: POD_NAME                                  # downward API
        valueFrom: { fieldRef: { fieldPath: metadata.name } }
      - name: NODE_NAME
        valueFrom: { fieldRef: { fieldPath: spec.nodeName } }
      - name: MEM_LIMIT
        valueFrom: { resourceFieldRef: { resource: limits.memory } }

    # (b) all keys as env vars — same static behavior, less typing
    envFrom:
      - configMapRef: { name: api-config }
      - secretRef:    { name: api-secrets }
      - configMapRef: { name: optional-cm, optional: true }

    # (c) mounted as files — DOES update in place (kubelet sync ~60s, then
    #     an atomic symlink swap). Your app must watch the file to notice.
    volumeMounts:
      - { name: config, mountPath: /etc/app, readOnly: true }
volumes:
  - name: config
    configMap:
      name: api-config
      items: [{ key: application.yaml, path: application.yaml }]
```

**`subPath` mounts do NOT receive updates.** If you `mountPath: /etc/app/app.yaml` with
`subPath: application.yaml`, the file is copied once and frozen. This trips people who
wonder why their volume-mounted config never refreshes.

### Secret — base64 is NOT encryption

```yaml
apiVersion: v1
kind: Secret
metadata: { name: db-creds }
type: Opaque
data:
  password: c3VwZXJTM2NyZXQh        # base64
stringData:                          # plaintext input, K8s base64s it for you
  username: app_user
```

```bash
echo 'c3VwZXJTM2NyZXQh' | base64 -d
# superS3cret!
```

**Say this plainly in interviews: base64 is an encoding, not encryption. It provides
exactly zero confidentiality.** It exists so binary values survive YAML. Anyone with
`get secrets` RBAC, anyone who can read your Git repo, and anyone who can read an etcd
backup has your password in cleartext.

What actually protects a Secret:

1. **Encryption at rest in etcd** — not on by default in most self-managed clusters.
   ```yaml
   # EncryptionConfiguration passed to the API server
   apiVersion: apiserver.config.k8s.io/v1
   kind: EncryptionConfiguration
   resources:
     - resources: ["secrets"]
       providers:
         - kms:                       # KMS v2: envelope encryption, key rotation
             apiVersion: v2
             name: aws-kms
             endpoint: unix:///var/run/kmsplugin/socket.sock
         - identity: {}               # fallback for reads of old data
   ```
   ```bash
   # Verify. Read the raw etcd bytes:
   etcdctl get /registry/secrets/prod/db-creds | hexdump -C | head
   # "k8s:enc:kms:v2:aws-kms:…"  → encrypted
   # plaintext password visible  → NOT encrypted. Fix this today.
   ```
2. **RBAC** — `get`/`list` on secrets is effectively "read all credentials".
   Never grant it broadly. `list` is worse than `get`: it returns everything.
3. **`automountServiceAccountToken: false`** on pods that don't call the API.
4. **Never commit Secret YAML to Git.** Use SOPS+age, Sealed Secrets, or (best) don't
   store secrets in the cluster at all.

### External Secrets — the pattern I use in production

Keep the source of truth in a real secrets manager and sync it in.

```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata: { name: aws-sm, namespace: prod }
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt: { serviceAccountRef: { name: external-secrets } }   # IRSA, no static keys
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata: { name: db-creds, namespace: prod }
spec:
  refreshInterval: 1h
  secretStoreRef: { name: aws-sm, kind: SecretStore }
  target:
    name: db-creds                  # the K8s Secret it creates/updates
    creationPolicy: Owner
  data:
    - secretKey: password
      remoteRef: { key: prod/db, property: password }
```

Or skip the K8s Secret entirely with the **Secrets Store CSI Driver**, which mounts
directly from Vault/AWS SM/Azure KV as a tmpfs volume — the value never lands in etcd.

Also worth knowing: **workload identity** (IRSA on EKS, Workload Identity on GKE) removes
the need for cloud credentials entirely. The pod's ServiceAccount token is exchanged for
temporary cloud credentials. If you're still putting `AWS_SECRET_ACCESS_KEY` in a Secret,
that's the thing to fix first.

---

<!-- CONTINUE -->
