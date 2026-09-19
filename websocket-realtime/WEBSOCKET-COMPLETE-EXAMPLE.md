# WebSocket Session Management - Complete Working Example

> Copy-paste ready implementation with all files needed

---

## Project Structure

```
project/
├── server/
│   ├── server.js                 # Main WebSocket server
│   ├── sessionStore.js          # Session management
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   └── errorHandler.js      # Error handling
│   ├── events/
│   │   ├── authEvents.js        # Auth event handlers
│   │   ├── messageEvents.js     # Message event handlers
│   │   └── sessionEvents.js     # Session event handlers
│   └── utils/
│       └── deviceUtils.js       # Device parsing utilities
│
├── client/
│   ├── hooks/
│   │   └── useWebSocket.js      # React WebSocket hook
│   ├── components/
│   │   ├── ChatInterface.jsx    # Chat component
│   │   ├── SessionsManager.jsx  # Session management
│   │   ├── UserMentions.jsx     # Mention/tag component
│   │   └── NotificationCenter.jsx
│   └── store/
│       └── socketSlice.js       # Redux store for socket state
│
└── package.json
```

---

## 1. Backend Setup

### server.js

```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const SessionStore = require('./sessionStore');
const { authMiddleware } = require('./middleware/auth');
const { setupAuthEvents } = require('./events/authEvents');
const { setupMessageEvents } = require('./events/messageEvents');
const { setupSessionEvents } = require('./events/sessionEvents');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize stores
const sessionStore = new SessionStore();
const messageQueue = new Map(); // userId -> [messages]

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log(`[WS] New connection: ${socket.id}`);

  // Setup event handlers
  setupAuthEvents(io, socket, sessionStore);
  setupMessageEvents(io, socket, sessionStore, messageQueue);
  setupSessionEvents(io, socket, sessionStore);

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    const result = sessionStore.removeBySocket(socket.id);
    if (result) {
      console.log(`[WS] ${result.userId} disconnected from ${result.deviceId}`);
      io.to(`user:${result.userId}`).emit('device-disconnected', {
        deviceId: result.deviceId,
        remainingSessions: sessionStore.getUserSessions(result.userId)
      });
    }
  });
});

// REST API endpoints
app.get('/api/sessions', authMiddleware, (req, res) => {
  const sessions = sessionStore.getUserSessions(req.user.userId);
  res.json({
    userId: req.user.userId,
    sessions,
    totalDevices: sessions.length
  });
});

app.post('/api/sessions/:deviceId/logout', authMiddleware, (req, res) => {
  const socketId = sessionStore.logoutDevice(req.user.userId, req.params.deviceId);
  if (socketId) {
    io.to(socketId).emit('force-logout', {
      reason: 'Logged out from settings'
    });
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Device not found' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io, sessionStore };
```

### sessionStore.js

```javascript
const UAParser = require('ua-parser-js');

class SessionStore {
  constructor() {
    this.sessions = new Map();
    this.socketToUser = new Map();
  }

  addConnection(userId, socketId, userAgent) {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const deviceId = this.generateDeviceId(userAgent);
    const device = {
      socketId,
      userAgent,
      browser: `${result.browser.name} ${result.browser.version}`,
      os: `${result.os.name} ${result.os.version}`,
      device: result.device.type || 'desktop',
      loginTime: new Date(),
      lastActivity: new Date()
    };

    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, new Map());
    }

    this.sessions.get(userId).set(deviceId, device);
    this.socketToUser.set(socketId, userId);

    return { deviceId, device, totalDevices: this.sessions.get(userId).size };
  }

  removeBySocket(socketId) {
    const userId = this.socketToUser.get(socketId);
    if (!userId) return null;

    this.socketToUser.delete(socketId);
    const userSessions = this.sessions.get(userId);

    for (const [deviceId, device] of userSessions) {
      if (device.socketId === socketId) {
        userSessions.delete(deviceId);
        if (userSessions.size === 0) {
          this.sessions.delete(userId);
        }
        return { userId, deviceId };
      }
    }

    return null;
  }

  getUserSessions(userId) {
    if (!this.sessions.has(userId)) return [];
    
    const userSessions = this.sessions.get(userId);
    return Array.from(userSessions.entries()).map(([deviceId, device]) => ({
      deviceId,
      ...device
    }));
  }

  getUserSocketIds(userId) {
    if (!this.sessions.has(userId)) return [];
    return Array.from(this.sessions.get(userId).values()).map(d => d.socketId);
  }

  logoutDevice(userId, deviceId) {
    if (!this.sessions.has(userId)) return null;

    const userSessions = this.sessions.get(userId);
    const device = userSessions.get(deviceId);
    
    if (device) {
      userSessions.delete(deviceId);
      if (userSessions.size === 0) {
        this.sessions.delete(userId);
      }
      return device.socketId;
    }

    return null;
  }

  updateActivity(userId, deviceId) {
    if (!this.sessions.has(userId)) return;
    
    const device = this.sessions.get(userId).get(deviceId);
    if (device) {
      device.lastActivity = new Date();
    }
  }

  generateDeviceId(userAgent) {
    const crypto = require('crypto');
    const timestamp = Math.floor(Date.now() / 1000);
    const hash = crypto.createHash('sha256').update(userAgent).digest('hex').slice(0, 8);
    return `${hash}-${timestamp}`;
  }
}

module.exports = SessionStore;
```

### middleware/auth.js

```javascript
const jwt = require('jsonwebtoken');

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  const claims = verifyToken(token);

  if (!claims) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = claims;
  next();
}

module.exports = { verifyToken, authMiddleware };
```

### events/authEvents.js

```javascript
const { verifyToken } = require('../middleware/auth');

function setupAuthEvents(io, socket, sessionStore) {
  socket.on('auth', (data, callback) => {
    const { token, userAgent } = data;

    const claims = verifyToken(token);
    if (!claims) {
      return callback({ success: false, error: 'Invalid token' });
    }

    const userId = claims.userId;
    const { deviceId, device, totalDevices } = sessionStore.addConnection(
      userId,
      socket.id,
      userAgent
    );

    // Join rooms
    socket.join(`user:${userId}`);
    socket.join(`device:${userId}:${deviceId}`);

    console.log(`[AUTH] ${userId} connected - ${device.browser}`);

    callback({
      success: true,
      deviceId,
      device,
      totalDevices
    });

    // Notify other devices
    io.to(`user:${userId}`).except(socket.id).emit('device-connected', {
      deviceId,
      device,
      totalDevices
    });
  });
}

module.exports = { setupAuthEvents };
```

### events/messageEvents.js

```javascript
function setupMessageEvents(io, socket, sessionStore, messageQueue) {
  socket.on('send-message', (data, callback) => {
    const userId = sessionStore.socketToUser.get(socket.id);
    if (!userId) {
      return callback({ success: false, error: 'Not authenticated' });
    }

    const { content, mentionedUsers, targetUserId } = data;

    const message = {
      id: Date.now().toString(),
      from: userId,
      content,
      mentionedUsers: mentionedUsers || [],
      timestamp: new Date(),
      type: 'message'
    };

    // Direct message to specific user
    if (targetUserId) {
      io.to(`user:${targetUserId}`).emit('receive-message', {
        ...message,
        type: 'direct'
      });

      return callback({ success: true, messageId: message.id });
    }

    // Broadcast to mentioned users
    if (mentionedUsers && mentionedUsers.length > 0) {
      mentionedUsers.forEach(mentionedUserId => {
        io.to(`user:${mentionedUserId}`).emit('user-mentioned', {
          ...message,
          type: 'mention'
        });
      });

      return callback({ success: true, messageId: message.id });
    }

    callback({ success: true, messageId: message.id });
  });
}

module.exports = { setupMessageEvents };
```

### events/sessionEvents.js

```javascript
function setupSessionEvents(io, socket, sessionStore) {
  socket.on('get-active-sessions', (data, callback) => {
    const userId = sessionStore.socketToUser.get(socket.id);
    if (!userId) {
      return callback({ success: false, error: 'Not authenticated' });
    }

    const sessions = sessionStore.getUserSessions(userId);
    callback({
      success: true,
      sessions,
      count: sessions.length
    });
  });

  socket.on('logout-device', (data, callback) => {
    const userId = sessionStore.socketToUser.get(socket.id);
    if (!userId) {
      return callback({ success: false, error: 'Not authenticated' });
    }

    const { deviceId } = data;
    const targetSocket = sessionStore.logoutDevice(userId, deviceId);

    if (targetSocket) {
      io.to(targetSocket).emit('force-logout', {
        reason: 'Logged out from another device'
      });

      const remainingSessions = sessionStore.getUserSessions(userId);
      io.to(`user:${userId}`).emit('device-disconnected', {
        deviceId,
        remainingSessions
      });

      return callback({ success: true });
    }

    callback({ success: false, error: 'Device not found' });
  });

  socket.on('logout-all', (data, callback) => {
    const userId = sessionStore.socketToUser.get(socket.id);
    if (!userId) {
      return callback({ success: false, error: 'Not authenticated' });
    }

    const sessions = sessionStore.getUserSessions(userId);
    const socketIds = sessions.map(s => s.socketId);

    socketIds.forEach(socketId => {
      io.to(socketId).emit('force-logout', {
        reason: 'Logged out from all devices'
      });
    });

    sessionStore.sessions.delete(userId);
    socketIds.forEach(socketId => {
      sessionStore.socketToUser.delete(socketId);
    });

    callback({ success: true });
  });

  socket.on('activity', () => {
    const userId = sessionStore.socketToUser.get(socket.id);
    if (userId) {
      const sessions = sessionStore.getUserSessions(userId);
      const userSession = sessions.find(s => s.socketId === socket.id);
      if (userSession) {
        sessionStore.updateActivity(userId, userSession.deviceId);
      }
    }
  });
}

module.exports = { setupSessionEvents };
```

---

## 2. Frontend Setup

### hooks/useWebSocket.js

```javascript
import { useEffect, useRef, useCallback, useState } from 'react';
import io from 'socket.io-client';

export function useWebSocket(token) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [messages, setMessages] = useState([]);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    socketRef.current = io(process.env.REACT_APP_WS_URL || 'http://localhost:3001', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current.emit('auth', {
      token,
      userAgent: navigator.userAgent
    }, (response) => {
      if (response.success) {
        setDeviceInfo(response.device);
        setIsConnected(true);
      }
    });

    // Message handlers
    socketRef.current.on('receive-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socketRef.current.on('user-mentioned', (message) => {
      setMessages(prev => [...prev, message]);
      showNotification(`${message.from} mentioned you`);
    });

    socketRef.current.on('device-connected', (data) => {
      setActiveSessions(prev => [...prev, data]);
    });

    socketRef.current.on('device-disconnected', (data) => {
      setActiveSessions(data.remainingSessions);
    });

    socketRef.current.on('force-logout', (data) => {
      localStorage.removeItem('token');
      window.location.href = '/login?reason=' + encodeURIComponent(data.reason);
    });

    setIsConnected(true);
  }, [token]);

  const sendMessage = useCallback((content, mentionedUsers, targetUserId) => {
    return new Promise((resolve, reject) => {
      socketRef.current?.emit('send-message', {
        content,
        mentionedUsers,
        targetUserId
      }, (response) => {
        if (response.success) resolve(response.messageId);
        else reject(new Error(response.error));
      });
    });
  }, []);

  const getActiveSessions = useCallback(() => {
    return new Promise((resolve, reject) => {
      socketRef.current?.emit('get-active-sessions', {}, (response) => {
        if (response.success) {
          setActiveSessions(response.sessions);
          resolve(response.sessions);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, []);

  const logoutDevice = useCallback((deviceId) => {
    return new Promise((resolve, reject) => {
      socketRef.current?.emit('logout-device', { deviceId }, (response) => {
        if (response.success) resolve();
        else reject(new Error(response.error));
      });
    });
  }, []);

  const logoutAll = useCallback(() => {
    return new Promise((resolve, reject) => {
      socketRef.current?.emit('logout-all', {}, (response) => {
        if (response.success) resolve();
        else reject(new Error(response.error));
      });
    });
  }, []);

  useEffect(() => {
    if (token) connect();
    return () => socketRef.current?.disconnect();
  }, [token, connect]);

  return {
    isConnected,
    deviceInfo,
    activeSessions,
    messages,
    sendMessage,
    getActiveSessions,
    logoutDevice,
    logoutAll
  };
}
```

### components/SessionsManager.jsx

```javascript
import React, { useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import './SessionsManager.css';

export function SessionsManager({ token }) {
  const {
    activeSessions,
    deviceInfo,
    getActiveSessions,
    logoutDevice,
    logoutAll,
    isConnected
  } = useWebSocket(token);

  useEffect(() => {
    if (isConnected) {
      getActiveSessions();
    }
  }, [isConnected, getActiveSessions]);

  return (
    <div className="sessions-manager">
      <h2>Active Sessions</h2>

      <div className="sessions-list">
        {activeSessions.map((session) => (
          <div key={session.deviceId} className="session-item">
            <div className="session-info">
              <p className="browser">{session.browser}</p>
              <p className="os">{session.os}</p>
              <p className="device-type">
                {session.device === 'mobile' ? '📱' : '💻'} {session.device}
              </p>
              <p className="timestamp">
                Logged in: {new Date(session.loginTime).toLocaleString()}
              </p>
              {session.socketId === deviceInfo?.socketId && (
                <span className="current-device">This Device</span>
              )}
            </div>

            <button
              onClick={() => logoutDevice(session.deviceId)}
              disabled={session.socketId === deviceInfo?.socketId}
              className="logout-btn"
            >
              Logout
            </button>
          </div>
        ))}
      </div>

      <button className="logout-all-btn" onClick={logoutAll}>
        Logout from All Devices
      </button>
    </div>
  );
}
```

### components/ChatInterface.jsx

```javascript
import React, { useState, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import './ChatInterface.css';

export function ChatInterface({ token, userId }) {
  const { sendMessage, messages, isConnected } = useWebSocket(token);
  const [content, setContent] = useState('');
  const [mentionedUsers, setMentionedUsers] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!content.trim()) return;

    try {
      await sendMessage(content, mentionedUsers);
      setContent('');
      setMentionedUsers([]);
    } catch (error) {
      console.error('Failed to send:', error);
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h3>Chat</h3>
        <span className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢 Connected' : '🔴 Offline'}
        </span>
      </div>

      <div className="messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.type}`}>
            <p className="from">{msg.from}</p>
            <p className="content">{msg.content}</p>
            <p className="timestamp">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message (mention users with @username)..."
          disabled={!isConnected}
        />
        <button
          onClick={handleSendMessage}
          disabled={!isConnected || !content.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
```

---

## 3. Environment Variables

### .env (Backend)

```env
PORT=3001
CLIENT_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### .env.local (Frontend)

```env
REACT_APP_WS_URL=http://localhost:3001
```

---

## 4. Quick Start

### Backend

```bash
npm install express http socket.io cors dotenv ua-parser-js jsonwebtoken

node server.js
```

### Frontend

```bash
npm install socket.io-client

# Start React dev server
npm start
```

---

## 5. Testing the Flow

### Test Case 1: Multi-Device Login

1. Open Browser 1 (Chrome) - Login
2. Open Browser 2 (Firefox) - Login with same account
3. Both show in "Active Sessions"
4. Browser 1 receives notification of Browser 2 connecting

### Test Case 2: Device-Specific Logout

1. Browser 1 opens Settings → Active Sessions
2. Click "Logout" on Firefox
3. Firefox session ends immediately
4. Firefox user redirected to login
5. Chrome shows updated sessions list

### Test Case 3: Mention/Tag

1. User A in Browser 1 sends: "@User B, check this"
2. User B in all their browsers receives notification
3. Can click to jump to message

### Test Case 4: Logout All Devices

1. Click "Logout from All Devices"
2. All browser tabs/devices disconnect
3. All redirect to login page

---

## 6. Production Checklist

- [ ] Add Redis for session persistence
- [ ] Implement rate limiting
- [ ] Add monitoring and logging
- [ ] Enable HTTPS/WSS
- [ ] Add message persistence to DB
- [ ] Implement socket authentication refresh
- [ ] Add tests for WebSocket events
- [ ] Setup CI/CD pipeline
- [ ] Add error tracking (Sentry)
- [ ] Implement analytics for sessions

---

## Key Files Summary

| File | Purpose |
|------|---------|
| `sessionStore.js` | Tracks active connections per user/device |
| `authEvents.js` | Handles WebSocket authentication |
| `messageEvents.js` | Handles messaging and mentions |
| `sessionEvents.js` | Handles session management events |
| `useWebSocket.js` | React hook for WebSocket |
| `SessionsManager.jsx` | UI for managing sessions |
| `ChatInterface.jsx` | UI for sending messages |
