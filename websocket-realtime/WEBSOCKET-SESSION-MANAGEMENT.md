# WebSocket Session Management with User Agent & Multi-Device Support

> Complete guide for managing WebSocket connections, browser sessions, user-level broadcasting, and device-specific logout

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Backend Implementation (Node.js)](#backend-implementation-nodejs)
3. [Frontend Implementation (React)](#frontend-implementation-react)
4. [Connection Management](#connection-management)
5. [Broadcasting Strategy](#broadcasting-strategy)
6. [Device-Specific Logout](#device-specific-logout)
7. [Production Considerations](#production-considerations)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Instances                         │
│  Chrome        Safari        Firefox        Mobile Browser   │
│    ↓             ↓              ↓                 ↓          │
│ WS Connection  WS Connection  WS Connection   WS Connection  │
│    ↓             ↓              ↓                 ↓          │
└────────────────────────┬────────────────────────────────────┘
                         │
                    WebSocket Server
                    (Socket.io or ws)
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌────▼────┐    ┌────▼─────┐
    │  User 1 │    │  User 2 │    │  User 3  │
    │Connections│  │Connections│  │Connections│
    │(3 devices)│  │(2 devices)│  │(1 device)│
    └─────────┘    └─────────┘    └──────────┘
         │               │               │
    ┌────▼─────────────────────────────────┐
    │   In-Memory Session Store            │
    │   (with Redis for scaling)           │
    └──────────────────────────────────────┘
```

---

## Backend Implementation (Node.js)

### 1. WebSocket Server Setup with Socket.io

```javascript
// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const UAParser = require('ua-parser-js');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// ==========================================
// Session Management Store
// ==========================================

class SessionStore {
  constructor() {
    // Structure:
    // {
    //   userId: {
    //     [deviceId]: {
    //       socketId,
    //       userAgent,
    //       browser,
    //       os,
    //       device,
    //       loginTime,
    //       lastActivity
    //     }
    //   }
    // }
    this.sessions = new Map();
    this.socketToUser = new Map(); // socketId -> userId mapping
  }

  /**
   * Add or update a connection
   */
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

    // Create user entry if not exists
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, new Map());
    }

    // Add/update device connection
    const userSessions = this.sessions.get(userId);
    userSessions.set(deviceId, device);

    // Map socket to user
    this.socketToUser.set(socketId, userId);

    return {
      deviceId,
      device,
      totalDevices: userSessions.size
    };
  }

  /**
   * Remove a specific device connection
   */
  removeDevice(userId, deviceId) {
    if (!this.sessions.has(userId)) return false;

    const userSessions = this.sessions.get(userId);
    const removed = userSessions.delete(deviceId);

    // Cleanup empty user entry
    if (userSessions.size === 0) {
      this.sessions.delete(userId);
    }

    return removed;
  }

  /**
   * Remove connection by socket ID
   */
  removeBySocket(socketId) {
    const userId = this.socketToUser.get(socketId);
    if (!userId) return null;

    this.socketToUser.delete(socketId);

    const userSessions = this.sessions.get(userId);
    if (!userSessions) return null;

    // Find and remove device by socket ID
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

  /**
   * Get all active connections for a user
   */
  getUserSessions(userId) {
    if (!this.sessions.has(userId)) return [];
    
    const userSessions = this.sessions.get(userId);
    return Array.from(userSessions.entries()).map(([deviceId, device]) => ({
      deviceId,
      ...device
    }));
  }

  /**
   * Get all socket IDs for a user
   */
  getUserSocketIds(userId) {
    if (!this.sessions.has(userId)) return [];
    
    const userSessions = this.sessions.get(userId);
    return Array.from(userSessions.values()).map(device => device.socketId);
  }

  /**
   * Update last activity
   */
  updateActivity(userId, deviceId) {
    if (!this.sessions.has(userId)) return;
    
    const userSessions = this.sessions.get(userId);
    const device = userSessions.get(deviceId);
    if (device) {
      device.lastActivity = new Date();
    }
  }

  /**
   * Generate device ID from user agent
   */
  generateDeviceId(userAgent) {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = `${result.browser.name}-${result.os.name}`;
    
    return `${signature}-${timestamp}`.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Get device info
   */
  getDeviceInfo(userId, deviceId) {
    if (!this.sessions.has(userId)) return null;
    
    const userSessions = this.sessions.get(userId);
    return userSessions.get(deviceId) || null;
  }

  /**
   * Logout specific device
   */
  logoutDevice(userId, deviceId) {
    const device = this.getDeviceInfo(userId, deviceId);
    if (device) {
      this.removeDevice(userId, deviceId);
      return device.socketId;
    }
    return null;
  }
}

const sessionStore = new SessionStore();

// ==========================================
// Middleware
// ==========================================

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// ==========================================
// Socket.io Event Handlers
// ==========================================

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  /**
   * User connects to WebSocket
   */
  socket.on('auth', (data, callback) => {
    const { token, userAgent } = data;

    const claims = verifyToken(token);
    if (!claims) {
      return callback({ success: false, error: 'Invalid token' });
    }

    const userId = claims.userId;

    // Register connection
    const { deviceId, device, totalDevices } = sessionStore.addConnection(
      userId,
      socket.id,
      userAgent
    );

    // Join user-specific room for broadcasting
    socket.join(`user:${userId}`);
    socket.join(`device:${userId}:${deviceId}`);

    console.log(`User ${userId} connected from ${device.browser} (Device: ${deviceId})`);

    // Notify client of successful connection
    callback({
      success: true,
      deviceId,
      device,
      totalDevices
    });

    // Broadcast to all user's devices that a new device connected
    io.to(`user:${userId}`).emit('device-connected', {
      deviceId,
      device,
      totalDevices
    });
  });

  /**
   * User sends a message (mention/tag)
   */
  socket.on('send-message', (data, callback) => {
    const userId = sessionStore.socketToUser.get(socket.id);
    if (!userId) {
      return callback({ success: false, error: 'Not authenticated' });
    }

    const { content, mentionedUsers, targetUserId } = data;

    // Create message object
    const message = {
      id: Date.now().toString(),
      from: userId,
      content,
      mentionedUsers: mentionedUsers || [],
      timestamp: new Date(),
      platform: 'websocket'
    };

    // Case 1: Direct message to specific user
    if (targetUserId) {
      // Send to all active connections of target user
      io.to(`user:${targetUserId}`).emit('receive-message', {
        ...message,
        type: 'direct-message'
      });

      return callback({ success: true, messageId: message.id });
    }

    // Case 2: Broadcast to mentioned users
    if (mentionedUsers && mentionedUsers.length > 0) {
      mentionedUsers.forEach(mentionedUserId => {
        // Send notification to all active connections of mentioned user
        io.to(`user:${mentionedUserId}`).emit('user-mentioned', {
          ...message,
          type: 'mention'
        });
      });

      return callback({ success: true, messageId: message.id });
    }

    callback({ success: true, messageId: message.id });
  });

  /**
   * Get all active sessions for a user
   */
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

  /**
   * Logout from a specific device
   */
  socket.on('logout-device', (data, callback) => {
    const userId = sessionStore.socketToUser.get(socket.id);
    if (!userId) {
      return callback({ success: false, error: 'Not authenticated' });
    }

    const { deviceId } = data;
    const targetSocket = sessionStore.logoutDevice(userId, deviceId);

    if (targetSocket) {
      // Force disconnect the target socket
      io.to(targetSocket).emit('force-logout', {
        reason: 'Logged out from another device'
      });

      // Remove from socket store
      sessionStore.socketToUser.delete(targetSocket);

      // Notify all remaining devices
      const remainingSessions = sessionStore.getUserSessions(userId);
      io.to(`user:${userId}`).emit('device-disconnected', {
        deviceId,
        remainingSessions
      });

      return callback({ success: true, message: 'Device logged out' });
    }

    callback({ success: false, error: 'Device not found' });
  });

  /**
   * Logout from all devices
   */
  socket.on('logout-all', (data, callback) => {
    const userId = sessionStore.socketToUser.get(socket.id);
    if (!userId) {
      return callback({ success: false, error: 'Not authenticated' });
    }

    const sessions = sessionStore.getUserSessions(userId);
    const socketIds = sessions.map(s => s.socketId);

    // Disconnect all devices
    socketIds.forEach(socketId => {
      io.to(socketId).emit('force-logout', {
        reason: 'Logged out from all devices'
      });
    });

    // Clear all sessions for user
    sessionStore.sessions.delete(userId);
    socketIds.forEach(socketId => {
      sessionStore.socketToUser.delete(socketId);
    });

    callback({ success: true, message: 'Logged out from all devices' });
  });

  /**
   * Activity tracking
   */
  socket.on('activity', (data) => {
    const userId = sessionStore.socketToUser.get(socket.id);
    if (userId) {
      const sessions = sessionStore.getUserSessions(userId);
      const userSession = sessions.find(s => s.socketId === socket.id);
      if (userSession) {
        sessionStore.updateActivity(userId, userSession.deviceId);
      }
    }
  });

  /**
   * Disconnect handler
   */
  socket.on('disconnect', () => {
    const result = sessionStore.removeBySocket(socket.id);
    if (result) {
      console.log(`User ${result.userId} disconnected from device ${result.deviceId}`);

      // Notify other devices
      const remainingSessions = sessionStore.getUserSessions(result.userId);
      io.to(`user:${result.userId}`).emit('device-disconnected', {
        deviceId: result.deviceId,
        remainingSessions
      });
    }
  });
});

// ==========================================
// REST API Endpoints
// ==========================================

app.use(express.json());

/**
 * Get active sessions for logged-in user
 */
app.get('/api/sessions', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const claims = verifyToken(token);

  if (!claims) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const sessions = sessionStore.getUserSessions(claims.userId);
  res.json({
    userId: claims.userId,
    sessions,
    totalDevices: sessions.length
  });
});

/**
 * Force logout a specific device
 */
app.post('/api/sessions/:deviceId/logout', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const claims = verifyToken(token);

  if (!claims) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const socketId = sessionStore.logoutDevice(claims.userId, req.params.deviceId);
  if (socketId) {
    io.to(socketId).emit('force-logout', {
      reason: 'Logged out from settings'
    });
    return res.json({ success: true, message: 'Device logged out' });
  }

  res.status(404).json({ error: 'Device not found' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Frontend Implementation (React)

### 1. WebSocket Hook

```javascript
// hooks/useWebSocket.js
import { useEffect, useRef, useCallback, useState } from 'react';
import io from 'socket.io-client';

function useWebSocket(token) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);

  const getUserAgent = useCallback(() => {
    return navigator.userAgent;
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    socketRef.current = io(process.env.REACT_APP_WS_URL || 'http://localhost:3001', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Authenticate
    socketRef.current.emit('auth', {
      token,
      userAgent: getUserAgent()
    }, (response) => {
      if (response.success) {
        console.log('Connected:', response.device);
        setDeviceInfo(response.device);
        setIsConnected(true);
      } else {
        console.error('Auth failed:', response.error);
      }
    });

    // Listen for device connected event
    socketRef.current.on('device-connected', (data) => {
      console.log('New device connected:', data);
      setActiveSessions(prev => [...prev, data]);
    });

    // Listen for device disconnected event
    socketRef.current.on('device-disconnected', (data) => {
      console.log('Device disconnected:', data.deviceId);
      setActiveSessions(data.remainingSessions);
    });

    // Listen for force logout
    socketRef.current.on('force-logout', (data) => {
      console.log('Force logout:', data.reason);
      // Redirect to login or show message
      localStorage.removeItem('token');
      window.location.href = '/login';
    });

    // Listen for messages
    socketRef.current.on('receive-message', (message) => {
      console.log('Message received:', message);
      // Handle message in your app
    });

    // Listen for mentions
    socketRef.current.on('user-mentioned', (data) => {
      console.log('User mentioned:', data);
      // Show notification
    });

    // Connection handlers
    socketRef.current.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });
  }, [token, getUserAgent]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setIsConnected(false);
    }
  }, []);

  const sendMessage = useCallback((content, mentionedUsers, targetUserId) => {
    return new Promise((resolve, reject) => {
      socketRef.current?.emit('send-message', {
        content,
        mentionedUsers,
        targetUserId
      }, (response) => {
        if (response.success) {
          resolve(response.messageId);
        } else {
          reject(new Error(response.error));
        }
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
      socketRef.current?.emit('logout-device', {
        deviceId
      }, (response) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, []);

  const logoutAll = useCallback(() => {
    return new Promise((resolve, reject) => {
      socketRef.current?.emit('logout-all', {}, (response) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, []);

  const trackActivity = useCallback(() => {
    socketRef.current?.emit('activity', { timestamp: new Date() });
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  // Track user activity
  useEffect(() => {
    if (!isConnected) return;

    const handleActivity = () => {
      trackActivity();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
    };
  }, [isConnected, trackActivity]);

  return {
    socket: socketRef.current,
    isConnected,
    deviceInfo,
    activeSessions,
    sendMessage,
    getActiveSessions,
    logoutDevice,
    logoutAll,
    connect,
    disconnect
  };
}

export default useWebSocket;
```

### 2. React Components

```javascript
// components/ChatComponent.js
import React, { useState } from 'react';
import useWebSocket from '../hooks/useWebSocket';

function ChatComponent({ token, userId }) {
  const { sendMessage, isConnected } = useWebSocket(token);
  const [message, content, setContent] = useState('');
  const [mentionedUsers, setMentionedUsers] = useState([]);

  const handleSendMessage = async () => {
    if (!content.trim()) return;

    try {
      await sendMessage(content, mentionedUsers);
      setContent('');
      setMentionedUsers([]);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="chat-container">
      <div className="connection-status">
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message..."
      />

      <button
        onClick={handleSendMessage}
        disabled={!isConnected || !content.trim()}
      >
        Send Message
      </button>
    </div>
  );
}

export default ChatComponent;
```

```javascript
// components/SessionsManager.js
import React, { useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket';

function SessionsManager({ token }) {
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

  const handleLogoutDevice = async (deviceId) => {
    try {
      await logoutDevice(deviceId);
      alert('Device logged out');
    } catch (error) {
      console.error('Failed to logout device:', error);
    }
  };

  const handleLogoutAll = async () => {
    if (window.confirm('Log out from all devices?')) {
      try {
        await logoutAll();
        alert('Logged out from all devices');
      } catch (error) {
        console.error('Failed to logout:', error);
      }
    }
  };

  return (
    <div className="sessions-manager">
      <h2>Active Sessions</h2>

      <div className="sessions-list">
        {activeSessions.map((session) => (
          <div key={session.deviceId} className="session-item">
            <div className="session-info">
              <p><strong>{session.browser}</strong></p>
              <p>{session.os}</p>
              <p className="device-type">{session.device}</p>
              <p className="timestamp">
                Logged in: {new Date(session.loginTime).toLocaleString()}
              </p>
              {session.socketId === deviceInfo?.socketId && (
                <span className="current-device">This Device</span>
              )}
            </div>

            <button
              onClick={() => handleLogoutDevice(session.deviceId)}
              disabled={session.socketId === deviceInfo?.socketId}
            >
              Logout
            </button>
          </div>
        ))}
      </div>

      <button
        className="logout-all-btn"
        onClick={handleLogoutAll}
      >
        Logout from All Devices
      </button>
    </div>
  );
}

export default SessionsManager;
```

---

## Connection Management

### Broadcasting Patterns

```javascript
// Case 1: Direct message to specific user (all devices)
socket.emit('send-message', {
  content: 'Hello',
  targetUserId: 'user123'
}, callback);

// Case 2: Mention/Tag a user (all devices)
socket.emit('send-message', {
  content: 'Hey @user123, check this out',
  mentionedUsers: ['user123']
}, callback);

// Case 3: Notify multiple users
socket.emit('send-message', {
  content: 'Group notification',
  mentionedUsers: ['user1', 'user2', 'user3']
}, callback);
```

### Database Schema (MongoDB)

```javascript
// Session Log - for audit trail
{
  _id: ObjectId,
  userId: String,
  deviceId: String,
  socketId: String,
  userAgent: String,
  browser: String,
  os: String,
  device: String,
  loginTime: Date,
  logoutTime: Date,
  lastActivity: Date,
  ipAddress: String,
  duration: Number
}

// Notifications
{
  _id: ObjectId,
  userId: String,
  fromUserId: String,
  type: 'mention' | 'direct-message' | 'broadcast',
  content: String,
  read: Boolean,
  readAt: Date,
  createdAt: Date
}
```

---

## Device-Specific Logout

### Flow Diagram

```
User Device A (Chrome)
    ↓
User opens Settings → Active Sessions
    ↓
Clicks "Logout" on Device B (Safari)
    ↓
Socket Event: logout-device({ deviceId: 'safari-xxx' })
    ↓
Backend: Find socketId for Device B
    ↓
Emit: force-logout to Device B Socket
    ↓
Device B: force-logout received → Clear token → Redirect to /login
    ↓
Device A: Receives device-disconnected event → Update session list
```

### Implementation Example

```javascript
// Backend
socket.on('logout-device', (data, callback) => {
  const userId = sessionStore.socketToUser.get(socket.id);
  const { deviceId } = data;

  // Find the socket for this device
  const targetSocket = sessionStore.logoutDevice(userId, deviceId);

  if (targetSocket) {
    // Force logout that specific socket
    io.to(targetSocket).emit('force-logout', {
      reason: 'Logged out from another device'
    });

    // Notify other devices
    io.to(`user:${userId}`).emit('device-disconnected', {
      deviceId,
      remainingSessions: sessionStore.getUserSessions(userId)
    });

    callback({ success: true });
  }
});

// Frontend
socket.on('force-logout', (data) => {
  // Remove token
  localStorage.removeItem('token');
  
  // Clear user context
  dispatch(setUser(null));
  
  // Show notification
  showNotification(`Logged out: ${data.reason}`);
  
  // Redirect
  navigate('/login');
});
```

---

## Production Considerations

### 1. Scalability with Redis

```javascript
const redis = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

const pubClient = redis.createClient({ host: 'localhost', port: 6379 });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));

// This enables broadcasting across multiple servers
```

### 2. Session Persistence

```javascript
class RedisSessionStore {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  async addConnection(userId, socketId, userAgent) {
    const key = `sessions:${userId}`;
    const deviceId = generateDeviceId(userAgent);
    
    const deviceData = {
      socketId,
      userAgent,
      browser: getBrowser(userAgent),
      os: getOS(userAgent),
      loginTime: Date.now(),
      lastActivity: Date.now()
    };

    await this.redis.hSet(
      key,
      deviceId,
      JSON.stringify(deviceData)
    );
    
    // Set expiry (e.g., 30 days)
    await this.redis.expire(key, 30 * 24 * 60 * 60);
  }

  async getUserSessions(userId) {
    const key = `sessions:${userId}`;
    const sessions = await this.redis.hGetAll(key);
    
    return Object.entries(sessions).map(([deviceId, data]) => ({
      deviceId,
      ...JSON.parse(data)
    }));
  }

  async removeDevice(userId, deviceId) {
    const key = `sessions:${userId}`;
    await this.redis.hDel(key, deviceId);
  }
}
```

### 3. Error Handling & Reconnection

```javascript
// Frontend reconnection logic
function useWebSocketWithReconnect(token) {
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    socketRef.current.on('connect_error', (error) => {
      if (reconnectAttempts < maxReconnectAttempts) {
        setReconnectAttempts(prev => prev + 1);
        console.log(`Reconnecting... Attempt ${reconnectAttempts + 1}`);
      } else {
        console.error('Max reconnection attempts reached');
        // Redirect to login or show error
      }
    });

    socketRef.current.on('connect', () => {
      setReconnectAttempts(0);
      console.log('Reconnected successfully');
    });
  }, [reconnectAttempts]);
}
```

### 4. Security Considerations

```javascript
// Rate limiting
const rateLimit = require('express-rate-limit');

const messageLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 5 // 5 messages per second
});

socket.on('send-message', messageLimiter, (data, callback) => {
  // Handle message
});

// Token refresh
setInterval(() => {
  const newToken = refreshToken();
  socket.emit('refresh-token', { token: newToken });
}, 14 * 60 * 1000); // Every 14 minutes (if token expires at 15)

// Validate all inputs
socket.on('send-message', (data, callback) => {
  if (!isValidMessage(data.content)) {
    return callback({ success: false, error: 'Invalid message' });
  }
  // Process...
});
```

### 5. Monitoring & Logging

```javascript
class WebSocketLogger {
  logConnection(userId, deviceId, device) {
    console.log(JSON.stringify({
      timestamp: new Date(),
      event: 'connection',
      userId,
      deviceId,
      browser: device.browser,
      os: device.os
    }));
  }

  logDisconnection(userId, deviceId, reason) {
    console.log(JSON.stringify({
      timestamp: new Date(),
      event: 'disconnection',
      userId,
      deviceId,
      reason
    }));
  }

  logMessage(fromUserId, toUserIds, messageId) {
    console.log(JSON.stringify({
      timestamp: new Date(),
      event: 'message-sent',
      fromUserId,
      toUserCount: toUserIds.length,
      messageId
    }));
  }
}

const wsLogger = new WebSocketLogger();

// Use in socket handlers
socket.on('auth', (data, callback) => {
  const { userId, deviceId } = authenticateUser(data);
  wsLogger.logConnection(userId, deviceId, device);
});
```

---

## Summary: Device-Specific Logout Flow

```
1. User A on Chrome
   ↓
2. Opens Settings → Active Sessions
   ↓
3. Clicks "Logout" on Safari (Device B)
   ↓
4. Frontend sends: socket.emit('logout-device', { deviceId: 'safari-xxx' })
   ↓
5. Backend:
   - Finds User A's sessions
   - Locates Device B's socketId
   - Removes Device B from session store
   ↓
6. Backend broadcasts:
   - To Device B's socket: force-logout
   - To all of User A's sockets: device-disconnected
   ↓
7. Device B:
   - Receives force-logout
   - Clears localStorage token
   - Redirects to login
   - Shows: "You've been logged out"
   ↓
8. Device A (Chrome):
   - Receives device-disconnected
   - Updates active sessions list
   - Safari no longer shown
```

This architecture ensures:
- ✅ Multi-device session tracking
- ✅ User-agent based device identification
- ✅ Selective logout per device
- ✅ Real-time broadcasting to all active devices
- ✅ Clean disconnect handling
- ✅ Production scalability with Redis
