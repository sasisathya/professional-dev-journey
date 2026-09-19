# WebSocket Session Management - Architectural Approach

> Design patterns, strategies, and decision-making for multi-device user session management

---

## Table of Contents
1. [Problem Statement](#problem-statement)
2. [Core Concepts](#core-concepts)
3. [Design Principles](#design-principles)
4. [System Architecture](#system-architecture)
5. [Session Management Strategy](#session-management-strategy)
6. [Broadcasting Strategy](#broadcasting-strategy)
7. [Logout Strategy](#logout-strategy)
8. [Scalability Patterns](#scalability-patterns)
9. [Trade-offs & Decisions](#trade-offs--decisions)

---

## Problem Statement

### Requirements:
1. **User has multiple devices** - Chrome on desktop, Safari on iPad, mobile app on phone
2. **Each device is independent** - Logout on iPhone ≠ Logout on Chrome
3. **User-level actions propagate** - When someone mentions a user, ALL their devices get notified
4. **Session awareness** - Know who's online and from which devices
5. **Real-time updates** - Changes immediately visible across all active sessions

### Why This Matters:
- **Security**: Isolate compromised sessions
- **UX**: Seamless multi-device experience
- **Control**: Users can manage their own sessions
- **Analytics**: Understand device usage patterns

---

## Core Concepts

### 1. Identity Layers

```
┌─────────────────────────────────────────────┐
│           User Identity Layer               │
│         (Who is this person?)               │
│         Example: user_id = "123"            │
└────────────────────┬────────────────────────┘
                     │
        ┌────────────┴───────────┐
        │                        │
┌───────▼──────────┐  ┌──────────▼────────┐
│  Device Identity │  │ Socket Connection │
│  (Which device?) │  │  (Live channel)   │
│  user_agent →    │  │  WebSocket        │
│  device_id       │  │  Real-time link   │
└──────────────────┘  └───────────────────┘
```

**Three distinct levels:**
- **User Level**: Global identity (user_id)
- **Device Level**: Per-device session (device_id derived from user_agent)
- **Connection Level**: Real-time WebSocket (socket_id)

**Why separate?**
- One user can have N devices
- One device can have M WebSocket connections (reconnects)
- Broadcasting needs to work at any level

---

### 2. Device Identification Strategy

**Challenge**: How to uniquely identify a device?

**Options:**

| Approach | Pros | Cons | Use Case |
|----------|------|------|----------|
| **IP Address** | Simple | Changes (mobile, VPN) | ❌ Unreliable |
| **User Agent String** | Rich info available | Can be spoofed, varies by browser | ✅ Primary method |
| **Device Fingerprinting** | Unique per device | Privacy concerns, complex | ✅ Secondary layer |
| **Browser Cookies** | Persistent | Cleared by user, cross-domain issues | ⚠️ Supplementary |
| **UUID Generated** | Guaranteed unique | No historical data | ⚠️ For new sessions |

**Recommended Hybrid Approach:**
```
Device ID = Hash(User Agent) + Timestamp + Sequence
                                                    ↓
Chrome on Mac:      "a1b2c3d4-1234567890-001"
Safari on iPad:     "e5f6g7h8-1234567891-001"
Mobile Firefox:     "i9j0k1l2-1234567892-001"
```

**Why this works:**
- Same browser/OS combination → Similar but different IDs (timestamp differentiates)
- Device_ID persists across disconnects
- Can identify genuine device vs. impersonation
- Stores browser/OS info for UI display

---

### 3. Connection vs. Session vs. Device

```
┌─────────────────────────────────────────────────────────────┐
│                        USER (id: 123)                        │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           DEVICE 1 (Chrome on Windows)              │   │
│  │           device_id: a1b2c3d4-12345-001            │   │
│  │                                                      │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ Connection A (socket_id: xyz1)              │   │   │
│  │  │ Connected at: 10:00 AM                      │   │   │
│  │  │ Last Activity: 10:15 AM                     │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ Connection B (socket_id: xyz2)              │   │   │
│  │  │ Connected at: 10:30 AM (reconnect)         │   │   │
│  │  │ Last Activity: 10:45 AM                     │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  │  Note: Device persists across reconnects       │   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        DEVICE 2 (Safari on iPad)                    │   │
│  │        device_id: e5f6g7h8-12346-001               │   │
│  │                                                      │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ Connection A (socket_id: abc1)              │   │   │
│  │  │ Connected at: 10:05 AM                      │   │   │
│  │  │ Last Activity: 10:50 AM                     │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │     DEVICE 3 (Mobile App on iPhone)                 │   │
│  │     device_id: i9j0k1l2-12347-001                   │   │
│  │                                                      │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │ Connection A (socket_id: def1)              │   │   │
│  │  │ Connected at: 10:10 AM                      │   │   │
│  │  │ Last Activity: 10:55 AM                     │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Key Distinctions:**
- **Device**: Persists across browser restarts, same browser/OS
- **Session**: Single continuous connection (one open tab/window)
- **Connection**: Individual WebSocket link (can reconnect = new socket_id, same device_id)

---

## Design Principles

### Principle 1: Separation of Concerns

```
┌──────────────────────────────────────┐
│   Identity Management Layer          │
│   (Who is this? What's their device?)│
└──────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────┐
│   Session Tracking Layer             │
│   (What devices are active? Online?) │
└──────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────┐
│   Messaging/Broadcast Layer          │
│   (Send notifications to devices)    │
└──────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────┐
│   Storage Layer                      │
│   (Persist sessions & history)       │
└──────────────────────────────────────┘
```

**Why?**
- Each layer has single responsibility
- Easy to test each layer independently
- Can replace storage (Redis vs. In-Memory) without changing logic
- Clear data flow

### Principle 2: Immutability of Device Identity

Once a device_id is assigned, it never changes during the session.

**Why?**
- Predictable device tracking
- Can safely reference device in messages
- Audit trail consistency

### Principle 3: Event-Driven Architecture

```
User Action (Send Message)
         ↓
Event Emission (socket.emit)
         ↓
Event Handler (Server processes)
         ↓
State Update (Session store changes)
         ↓
Broadcast (Emit to affected users/devices)
         ↓
Client Reaction (UI updates)
```

**Why?**
- Decouples components
- Scales naturally
- Easy to add new features (just add event handlers)

---

## System Architecture

### Overall Flow

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTS LAYER                        │
│  Chrome   Safari   Firefox   Mobile   Electron          │
│    ↓       ↓        ↓         ↓        ↓               │
└─────────────────────────────────────────────────────────┘
              ↓              ↓              ↓
         WebSocket      WebSocket      WebSocket
         Connection     Connection     Connection
              ↓              ↓              ↓
┌─────────────────────────────────────────────────────────┐
│              WEBSOCKET SERVER (Node.js)                │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Event Handler Layer                              │ │
│  │ - Authenticate                                   │ │
│  │ - Send Message                                   │ │
│  │ - Logout Device                                  │ │
│  └──────────────────┬────────────────────────────────┘ │
│                     ↓                                   │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Session Store (In-Memory or Redis)               │ │
│  │ Map: user_id → {device_id → socket_id, metadata} │ │
│  │ Map: socket_id → user_id (reverse lookup)        │ │
│  └──────────────────┬────────────────────────────────┘ │
│                     ↓                                   │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Socket.io Broadcasting (Rooms)                   │ │
│  │ user:123 → All devices of user                   │ │
│  │ device:123:a1b2 → Specific device               │ │
│  └──────────────────┬────────────────────────────────┘ │
│                     ↓                                   │
└─────────────────────────────────────────────────────────┘
              ↓              ↓              ↓
         WebSocket      WebSocket      WebSocket
         Response       Response       Response
              ↓              ↓              ↓
┌─────────────────────────────────────────────────────────┐
│                 STORAGE LAYER (Optional)               │
│  Database - Message History                            │
│  Database - Session Audit Trail                        │
│  Cache - User Online Status                            │
└─────────────────────────────────────────────────────────┘
```

### Information Flow for Mention Event

```
User A (Chrome) types: "@User B, check this"
                        ↓
                 Socket emits: send-message
                 {
                   content: "@User B, check this",
                   mentionedUsers: ["user_b"],
                   from: "user_a"
                 }
                        ↓
              Server receives message
              ↓
              Query session store:
              "Who is user_b?"
              "Devices: iPad (socket_xyz), iPhone (socket_abc)"
              ↓
              Broadcast to devices:
              io.to("user:user_b").emit("user-mentioned", {...})
              ↓
         ┌─────────┴─────────┐
         ↓                   ↓
    User B's iPad      User B's iPhone
    (socket_xyz)       (socket_abc)
         ↓                   ↓
    Receives message    Receives message
    Shows notification  Shows notification
```

---

## Session Management Strategy

### How to Track Sessions

**Data Structure:**

```
SessionStore = {
  "user_123": {
    "device_a1b2c3d4_timestamp_001": {
      socketId: "socket_xyz1",
      userAgent: "Mozilla/5.0...",
      browser: "Chrome 120",
      os: "Windows 11",
      deviceType: "desktop",
      loginTime: 2024-01-15T10:00:00Z,
      lastActivity: 2024-01-15T10:45:00Z
    },
    "device_e5f6g7h8_timestamp_001": {
      socketId: "socket_abc1",
      userAgent: "Mozilla/5.0...",
      browser: "Safari 17",
      os: "iOS 17",
      deviceType: "mobile",
      loginTime: 2024-01-15T10:05:00Z,
      lastActivity: 2024-01-15T10:50:00Z
    }
  },
  "user_456": { ... }
}

ReverseMap = {
  "socket_xyz1": "user_123",
  "socket_abc1": "user_123",
  "socket_def1": "user_456"
}
```

**Why two maps?**
- Forward map: Fast lookup "get all devices of user"
- Reverse map: Fast lookup "which user owns this socket"

### Session Lifecycle

```
1. USER AUTHENTICATION
   ├─ Frontend: Request WebSocket with JWT token
   ├─ Backend: Verify token
   ├─ Backend: Generate device_id from user_agent
   ├─ Backend: Create session entry
   └─ Frontend: Receives device_id, stores locally

2. ACTIVE SESSION
   ├─ Periodic: Track lastActivity (mouse, keyboard)
   ├─ Periodic: Update session store with activity
   ├─ Server: Can calculate inactivity duration
   └─ Server: Can detect idle sessions

3. SESSION TERMINATION
   ├─ User: Logs out from device
   ├─ Browser: Closes tab/window (socket disconnects)
   ├─ Timeout: No activity for X minutes
   ├─ Admin: Force logout from settings
   └─ Cleanup: Remove from session store, notify other devices

4. POST-SESSION
   ├─ Optional: Audit log entry
   ├─ Optional: Calculate session duration
   └─ Optional: Store for analytics
```

### Where to Store Sessions

**In-Memory (Development & Small Scale):**
```
Pros:
  - Ultra fast (nanoseconds)
  - Simple implementation
  - No external dependency

Cons:
  - Lost on server restart
  - Can't scale to multiple servers
  - Memory grows with active sessions
```

**Redis (Production & Scalable):**
```
Pros:
  - Persists across restarts
  - Shared across server cluster
  - Built-in expiration (TTL)
  - Fast enough for real-time

Cons:
  - External dependency
  - Slightly higher latency (microseconds)
  - Network overhead
```

**Decision Tree:**
```
Single server?
├─ YES → In-Memory OK (for MVP/startups)
└─ NO → Redis required (for production)

Expected concurrent users?
├─ < 1,000 → In-Memory works
├─ 1,000 - 10,000 → Redis + single server
└─ > 10,000 → Redis + multiple servers
```

---

## Broadcasting Strategy

### Concept: Socket.io Rooms

```
Without Rooms (❌ Inefficient):
send_to_all_users() → Loop through 1 million users
                      ↓
                   Very slow

With Rooms (✅ Efficient):
io.to("user:456").emit() → Find all sockets in this room
                           ↓
                        Just 3 devices (fast)
```

### Room Architecture

**Three-Layer Room System:**

```
Layer 1: User Rooms
├─ "user:123" → All devices of user 123
├─ "user:456" → All devices of user 456
└─ Purpose: Broadcast to all user's devices

Layer 2: Device Rooms
├─ "device:123:a1b2" → Specific device of user
├─ "device:123:e5f6" → Another device
└─ Purpose: Send to single device only

Layer 3: Feature Rooms
├─ "online" → All online users
├─ "notifications:123" → Notifications for user
└─ Purpose: Cross-cutting concerns
```

**Example: User Mentions Someone**

```
Scenario: @user_b is mentioned by user_a

Step 1: Identify target
  Query session store: "Who is user_b?"
  Answer: {device_ipad: socket_xyz, device_iphone: socket_abc}

Step 2: Broadcast to user room
  io.to("user:user_b").emit("user-mentioned", {...})

Step 3: Socket.io automatically delivers to:
  - socket_xyz (iPad)
  - socket_abc (iPhone)
  
Result: Both devices get notification instantly
```

### Broadcasting Patterns

**Pattern 1: Notify All User's Devices**
```
Message: "Your login was successful"
Broadcast to: io.to("user:123")
Devices affected: All (Chrome, Safari, Mobile)
```

**Pattern 2: Notify Other User's Devices (Exclude Self)**
```
Message: "New device logged in"
Broadcast to: io.to("user:123").except(socket.id)
Devices affected: All except current device
```

**Pattern 3: Notify Specific Device Only**
```
Message: "Force logout"
Broadcast to: io.to("device:123:a1b2")
Devices affected: Only that one device
```

**Pattern 4: Notify Multiple Users**
```
Message: "Group notification"
Broadcast to: 
  io.to("user:123").emit(...)
  io.to("user:456").emit(...)
  io.to("user:789").emit(...)
Devices affected: All devices of all 3 users
```

---

## Logout Strategy

### Logout Types

**Type 1: Self Logout (Current Device)**
```
Flow:
  User clicks "Logout"
    ↓
  Frontend: Clears token from localStorage
    ↓
  Frontend: Disconnects WebSocket
    ↓
  Backend: Receives disconnect event
    ↓
  Backend: Removes from session store
    ↓
  Backend: Notifies other devices (if any)
    ↓
  Other devices: See updated session list

State: User remains logged in on OTHER devices
```

**Type 2: Remote Device Logout (From Settings)**
```
Flow:
  User A on Chrome → Settings → Active Sessions
    ↓
  User A clicks "Logout" on Safari
    ↓
  Frontend Chrome: Emits logout-device event
    ↓
  Backend: Finds Safari's socket_id
    ↓
  Backend: Emits force-logout to Safari's socket
    ↓
  Safari: Receives force-logout
    ↓
  Safari Frontend: Clears token, redirects to login
    ↓
  Backend: Confirms to Chrome, updates session list

State: Only Safari is logged out. Chrome still active.
```

**Type 3: Logout All Devices**
```
Flow:
  User clicks "Logout from all devices"
    ↓
  Frontend: Emits logout-all event
    ↓
  Backend: Gets all device sockets for user
    ↓
  Backend: Sends force-logout to EACH socket
    ↓
  Each device: Receives force-logout independently
    ↓
  Each device: Clears token, redirects to login

State: User completely logged out everywhere
```

**Type 4: Timeout Logout (Inactivity)**
```
Flow:
  Server tracks lastActivity for each device
    ↓
  Cron job every 5 minutes checks inactivity
    ↓
  Device hasn't been active > 30 minutes
    ↓
  Backend: Emits force-logout with reason
    ↓
  Frontend: Receives, shows "Logged out due to inactivity"
    ↓
  Backend: Removes from session store

State: Only the idle device logged out
```

### Why Device-Specific Logout?

**Scenario 1: Compromise on One Device**
```
User has Chrome (home) and public iPad
Public iPad gets compromised/stolen
User can: Logout from public iPad only
Result: Attacker's access revoked, home use continues
```

**Scenario 2: Forgot to Logout**
```
User at internet café uses Chrome
Forgets to logout before leaving
User can: Remotely logout from that device
Result: Security without disrupting other devices
```

**Scenario 3: Device Lost**
```
Phone is stolen
User can: Logout from phone specifically
Result: Immediate revocation without website/app logout needed
```

---

## Scalability Patterns

### Single Server Approach

```
┌─────────────────────────────┐
│   Node.js + Socket.io       │
│                             │
│  ┌───────────────────────┐  │
│  │ Session Store         │  │
│  │ (In-Memory Hash Map)  │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 10,000 connections   │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

**Suitable for:**
- MVP/Startup phase
- < 1,000 concurrent users
- Single geographic region
- Budget constraints

**Limitations:**
- Server restart = all sessions lost
- No redundancy
- Can't scale beyond single machine

---

### Multi-Server Approach with Redis

```
┌──────────────────────────────────────────────────────────┐
│                   Load Balancer                          │
│                                                          │
│  ┌─────────────────────┬──────────────────────┐         │
│  │                     │                      │         │
│  ↓                     ↓                      ↓         │
┌──────────┐        ┌──────────┐        ┌──────────┐     │
│ Server 1 │        │ Server 2 │        │ Server 3 │     │
│ 5K users │        │ 5K users │        │ 5K users │     │
└────┬─────┘        └────┬─────┘        └────┬─────┘     │
     │                   │                    │           │
     └───────────────────┼────────────────────┘           │
                         │                                │
                    ┌────▼─────┐                          │
                    │   Redis   │                         │
                    │  Cluster  │                         │
                    │(Shared)   │                         │
                    └───────────┘                         │
└──────────────────────────────────────────────────────────┘

How it works:
  Server 1 receives auth from Device A
    ↓
  Server 1 stores in Redis: "user:123/device_a1b2 → socket_xyz1"
    ↓
  Server 2 receives message from Device B
    ↓
  Server 2 queries Redis: "Where is user:123?"
    ↓
  Redis returns: Device A is on Server 1, Device B is on Server 2
    ↓
  Server 2 broadcasts via Socket.io adapter
    ↓
  Message reaches all servers' connected clients
```

**Benefits:**
- Scales to multiple servers
- Sessions survive server restart (stored in Redis)
- Geographic distribution (different regions)
- No single point of failure

**Trade-offs:**
- Redis dependency
- Network latency (microseconds)
- Operational complexity (need Redis expertise)

---

### Hybrid: Local + Distributed

```
Each server maintains:
  1. Local in-memory cache (fast reads)
  2. Redis as source of truth (persistent)

Flow:
  Cache hit? → Use local memory (instant)
  Cache miss? → Query Redis (network latency)
  Write? → Write to local + Redis (strong consistency)
  
Result: Fast for repeated operations, durable across restarts
```

---

## Trade-offs & Decisions

### Decision 1: Device ID Generation

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| **Browser-generated UUID** | Persists across reloads | Can be deleted (IndexedDB), complex | ❌ No |
| **Hash(User Agent)** | Deterministic, free | Can be spoofed, need timestamp for uniqueness | ✅ Yes |
| **Server-assigned UUID** | Most secure, unique | Need to store on client (storage issues) | ⚠️ Maybe |
| **Hybrid: Hash + Timestamp** | Deterministic + unique | More complex parsing | ✅ Recommended |

**Recommendation:** Hash(UserAgent) + Timestamp
- Balances security and simplicity
- Survives browser restarts naturally
- Can identify genuine devices vs. spoofing

---

### Decision 2: Storage for Sessions

| Factor | In-Memory | Redis | Database |
|--------|-----------|-------|----------|
| **Latency** | ~1ms | ~5-10ms | ~100ms+ |
| **Persistence** | ❌ Lost on restart | ✅ Persistent | ✅ Persistent |
| **Scalability** | Single server | Multiple servers | Limited by DB |
| **Cost** | Free (RAM) | ~$30-50/mo | ~$50-200/mo |
| **Complexity** | Simple | Medium | High |

**Recommendation:**
```
Development: In-Memory (fast iteration)
Production MVP: Redis (scale when needed)
Large Scale: Redis + Database (audit trail)
```

---

### Decision 3: Message Delivery Guarantee

**Three Options:**

```
1. At-Most-Once (Fire & Forget)
   ├─ Send message, don't wait for ack
   ├─ Pro: Fast, simple
   ├─ Con: May lose messages
   └─ Use for: Non-critical notifications

2. At-Least-Once (With Retry)
   ├─ Keep retrying until ack received
   ├─ Pro: No message loss
   ├─ Con: Duplicates possible
   └─ Use for: Important notifications

3. Exactly-Once (Most Complex)
   ├─ Combine retries + deduplication
   ├─ Pro: No loss, no duplicates
   ├─ Con: Complex, overhead
   └─ Use for: Financial, audit-critical
```

**For mentions/broadcasts:**
```
Default: At-Most-Once (user won't mind missing a notification)
If critical: At-Least-Once (retry with exponential backoff)
With deduplication: Handle duplicates gracefully (show once, de-duplicate by message ID)
```

---

### Decision 4: Broadcasting Scope

When user A sends message with @user_B mention:

**Option 1: Broadcast to User B's ALL connections**
```
Pro: User sees mention everywhere consistently
Con: Might show duplicate notifications
```

**Option 2: Broadcast to User B's ACTIVE connections only**
```
Pro: Efficiency, privacy (sleeping devices don't get woken)
Con: Need to track "active" state
```

**Option 3: Broadcast to ALL, but deduplicate on client**
```
Pro: Simple server logic, clients handle dedup
Con: Client logic needed, potential race conditions
```

**Recommendation:** Option 1 (broadcast to all)
- Simple to implement
- Eventual consistency (all devices see the same)
- Users can read on any device
- Duplicate detection easy (message ID)

---

### Decision 5: Handling Reconnects

**Scenario:** User closes laptop, reopens after 2 hours

**Options:**

```
1. Assume new device (new device_id)
   Pro: Clean state
   Con: Session history lost, looks like new login

2. Restore same device (same device_id, new socket_id)
   Pro: Maintains session continuity
   Con: Need to handle edge cases (what if old socket still exists?)

3. Hybrid: Restore if < X minutes, else treat as new
   Pro: Balance between continuity and freshness
   Con: Configuration complexity
```

**Recommendation:** Option 2 (restore same device)
- device_id based on UA, persists across restarts
- New socket_id for current connection
- Store device_id client-side (send with auth)
- Server restores all device metadata

---

### Decision 6: Session Timeout

**Should inactive sessions auto-logout?**

```
Timeout: 30 minutes
├─ Too short: Users frustrated
├─ Too long: Security risk (forgotten device)
└─ Recommended: 30-60 minutes

Grace Period: 5 minutes before force logout
├─ Show warning: "You'll be logged out in 5 min"
├─ User can click "Stay Logged In"
└─ Prevents surprise logout
```

**Architecture:**

```
Client: Tracks user activity (mouse, keyboard, scroll)
  ↓
Client: Sends heartbeat every 5 minutes (if active)
  ↓
Server: Updates lastActivity in session store
  ↓
Cron Job: Every 5 minutes, check inactivity
  ↓
Server: If > 30 min inactive: Emit force-logout
  ↓
Client: Shows logout reason, redirects
```

---

## Summary: Decision Matrix

| Aspect | Decision | Why |
|--------|----------|-----|
| **Device ID** | Hash(UA) + Timestamp | Deterministic + unique |
| **Storage** | Redis (production), In-Memory (dev) | Balance persistence vs complexity |
| **Broadcasting** | Socket.io rooms per user | Efficient, scalable |
| **Message Delivery** | At-Most-Once + dedup | Good balance for most use cases |
| **Scope** | Broadcast to all devices | Simple, eventually consistent |
| **Reconnects** | Restore device (same device_id) | Maintains session continuity |
| **Timeout** | 30 min + 5 min warning | Security + UX balance |
| **Architecture** | Event-driven with rooms | Scalable, decoupled |

---

## Implementation Priority

### Phase 1: MVP (Week 1)
- [x] Device identification (UA parsing)
- [x] In-memory session store
- [x] Basic WebSocket auth
- [x] Send message to user's all devices

### Phase 2: UX (Week 2)
- [x] Show active sessions
- [x] Device-specific logout
- [x] Logout all devices
- [x] Session activity tracking

### Phase 3: Production Ready (Week 3)
- [x] Redis persistence
- [x] Multi-server setup
- [x] Session timeout + warning
- [x] Audit logging

### Phase 4: Advanced (Week 4+)
- [x] Message persistence (database)
- [x] Analytics dashboard
- [x] Compliance (GDPR, data deletion)
- [x] Device management API

---

## Key Architectural Principles

1. **Separation of Identity Levels** - User, Device, Connection are distinct
2. **Immutable Device IDs** - Once assigned, never changes
3. **Event-Driven Flow** - Action → Event → Broadcast → UI Update
4. **Socket.io Rooms** - Leverage framework's built-in room logic
5. **Graceful Degradation** - Work without Redis, better with it
6. **Client-Side Awareness** - Clients know their device_id, can identify self
7. **Async Operations** - All I/O is non-blocking
8. **Audit Trail** - Log significant events for compliance
