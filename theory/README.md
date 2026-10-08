# Theory — Senior Engineer Interview Reference

A working reference library for senior and staff-level engineering interviews. These are not revision cards. Each document is written to the standard of an engineer with 10+ years of production experience explaining a topic to a peer.

---

## The Standard These Documents Are Written To

Most interview prep material fails in the same way: it teaches you the definition, and the interview asks you the follow-up. You can recite "CAP theorem means consistency, availability, partition tolerance — pick two" and still fail the question, because the next thing out of the interviewer's mouth is *"OK, your service is CP. A partition happens. Walk me through exactly what a user sees, and what you'd do about it."*

Every document here is built around that gap. The rules:

| Rule | Why |
|------|-----|
| **Every concept answers WHAT / WHY it exists / HOW it works internally / WHEN to use / WHEN NOT / TRADE-OFFS** | "When not to use it" is the question that separates senior from mid. Anyone can list benefits. |
| **Concrete numbers, not adjectives** | "Redis is fast" says nothing. "Sub-millisecond p99 for O(1) commands, but `KEYS *` on 40M keys blocks the single-threaded event loop for ~8 seconds" is an answer. |
| **`❌ WRONG` / `✅ CORRECT` pairs showing the real failure mode** | Seeing the bug is how you remember the rule. Each pair shows what actually breaks, not a stylistic preference. |
| **ASCII architecture and data-flow diagrams** | If you can't draw it, you don't understand it — and you *will* be asked to draw it on a whiteboard. |
| **Production war stories: Symptom → Investigation → Root Cause → Fix → Lesson** | Interviewers probe for scar tissue. These give you the shape of a real incident narrative. |
| **Interview questions with model answers *and the follow-up*** | The follow-up is where candidates get exposed. Prepare two levels deep, not one. |
| **No shallow "Key takeaway: X" one-liners** | A one-line summary is a flashcard. Flashcards get you past a phone screen and no further. |

---

## Index

### Languages & Runtimes

| Document | Covers | Read it for |
|---|---|---|
| **[JavaScript.md](./JavaScript.md)** | Execution model, closures, `this`, prototypes, event loop ordering, promises, coercion, memory & GC, modules (ESM vs CJS) | The fundamentals round. Includes tricky-output questions and from-scratch implementations (`debounce`, `deepClone`, `Promise.all`, concurrency pool). |
| **[TypeScript.md](./TypeScript.md)** | Type system internals, generics, conditional & mapped types, inference, narrowing, declaration files, strictness flags | Type-level reasoning, and knowing when the type system is fighting you because the design is wrong. |
| **[Java.md](./Java.md)** | JVM internals, memory model, collections, concurrency, GC, Java 8+ features | JVM behavior under load — the questions that go past syntax. |
| **[Nodejs.md](./Nodejs.md)** | Event loop phases, streams & backpressure, clustering, Express patterns, security, observability | Server-side architecture and why Node falls over the way it does. |

### Frontend

| Document | Covers | Read it for |
|---|---|---|
| **[React.md](./React.md)** | Fiber, reconciliation, render vs commit, hooks internals, performance, patterns | The render pipeline as a mental model — the source of nearly every React answer. |
| **[TypeScriptReact.md](./TypeScriptReact.md)** | Typing components, hooks, generics, polymorphic `as` props, discriminated-union state | The intersection round: making impossible states unrepresentable. |

### Backend & Data

| Document | Covers | Read it for |
|---|---|---|
| **[SpringBoot.md](./SpringBoot.md)** | IoC & bean lifecycle, auto-configuration, AOP proxies, JPA/N+1, transactions, security, Actuator | The self-invocation `@Transactional` trap and the N+1 problem — the two most-asked Spring failures. |
| **[SQL.md](./SQL.md)** | B-tree indexes, clustered vs non-clustered, leftmost-prefix/covering indexes, EXPLAIN, join algorithms, ACID, isolation levels & anomalies, locking & deadlocks, normalization | Why "Repeatable Read" means different things on MySQL vs Postgres, and the deadlock/phantom-read war stories that show up in Oracle- and DB-heavy loops. |
| **[MongoDB.md](./MongoDB.md)** | WiredTiger internals, index design (ESR rule), `explain()`, data modelling, replication, sharding | Shard-key selection and embed-vs-reference — decisions you must be able to defend. |
| **[Redis.md](./Redis.md)** | Single-threaded model, data-structure encodings, eviction, persistence, Cluster, distributed locking | Why `KEYS` will take you down, and why Redlock is contested. |
| **[Kafka.md](./Kafka.md)** | Log internals, producer/consumer semantics, rebalancing, ISR, delivery guarantees, compaction | Delivery semantics and rebalance storms — where Kafka answers usually collapse. |

### Systems, Infrastructure & Process

| Document | Covers | Read it for |
|---|---|---|
| **[SystemDesign.md](./SystemDesign.md)** | CAP + PACELC, replication, sharding, caching, queues, idempotency, rate limiting, failure modes, worked designs | The 45-minute interview framework plus full designs (URL shortener, feed, chat, rate limiter, cache). |
| **[Docker-Kubernetes.md](./Docker-Kubernetes.md)** | Namespaces/cgroups, image layers, K8s control plane, scheduling, probes, resource limits, zero-downtime deploys | Why CPU limits cause p99 spikes and why liveness probes cause outages. |
| **[Cloud-AWS-GCP.md](./Cloud-AWS-GCP.md)** | IAM, VPC networking, compute options, managed data stores, IaC, DR strategies, cost traps | AWS↔GCP equivalents side by side, and the bills that surprise people. |
| **[SDLC.md](./SDLC.md)** | Methodologies (honestly assessed), design docs/ADRs, branching, code review, testing strategy, CI/CD, incidents, DORA | The process questions in senior loops — including zero-downtime DB migrations. |

### Algorithms

| Document | Covers | Read it for |
|---|---|---|
| **[DSA.md](./DSA.md)** | Complexity, core data structures, graphs, sorting, binary search on the answer, DP, the interview playbook | The algorithm round, in both JavaScript and Java. |
| **[dsa/](./dsa/)** | 40-pattern encyclopedia, quick-reference card, learning roadmap, deep dives | Pattern recognition. Start at [`dsa/patterns-quick-ref.md`](./dsa/patterns-quick-ref.md). |

---

## How to Use This

**Don't read these front to back.** They're reference documents, not a course. Three modes:

**1. Depth pass (learning).** Pick one document. Read it properly, and *draw the diagrams yourself from memory afterwards*. If you can't reproduce the diagram, you haven't got it. Budget 2–3 hours per document.

**2. Interview prep (recall).** Read only the `Interview Questions`, `Common Pitfalls`, and `Production War Stories` sections. Answer each question out loud before reading the model answer — silent reading creates a false sense of fluency. Then answer the follow-up.

**3. On-the-job lookup.** Search for the specific failure you're debugging. The war stories are indexed by symptom.

### A two-week loop, if you have an interview scheduled

| Days | Focus |
|---|---|
| 1–3 | Your primary language + runtime (`JavaScript`/`Java`, `Nodejs`) |
| 4–6 | `SystemDesign` — this carries the most weight in senior loops, and it's the one people under-prepare |
| 7–8 | Your data stores (`MongoDB` / `Redis` / `Kafka`) |
| 9–10 | `DSA` + `dsa/patterns-quick-ref.md`, practising out loud |
| 11–12 | Framework depth (`React`/`SpringBoot`) and `Docker-Kubernetes` |
| 13–14 | Re-read only war stories and interview questions across all documents |

---

## The Thing That Actually Matters

Interviewers at this level are not checking whether you memorised the definition of a bloom filter. They're checking three things:

1. **Do you reason about trade-offs, unprompted?** A senior answer contains the word "depends" followed immediately by *what* it depends on. Never just the first half.
2. **Have you been on call?** War stories, blast radius, rollback plans, and "here's how I'd know it was broken" are the tells.
3. **Do you know the limits of what you know?** "I haven't run that at scale, but here's how I'd reason about it" scores higher than a confident wrong answer. Every time.

Optimise your preparation for those three, not for coverage.
