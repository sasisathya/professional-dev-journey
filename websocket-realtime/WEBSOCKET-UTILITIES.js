/**
 * WebSocket Utilities - Reusable functions for session management
 * Use these in your Node.js backend
 */

// ==========================================
// Device Identification
// ==========================================

/**
 * Generate unique device ID from user agent
 */
function generateDeviceId(userAgent) {
  const crypto = require('crypto');
  const timestamp = Math.floor(Date.now() / 1000);
  const hash = crypto.createHash('sha256').update(userAgent).digest('hex').slice(0, 8);
  return `${hash}-${timestamp}`;
}

/**
 * Parse and extract device info from user agent
 */
function parseUserAgent(userAgent) {
  const UAParser = require('ua-parser-js');
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    browser: {
      name: result.browser.name || 'Unknown',
      version: result.browser.version || ''
    },
    os: {
      name: result.os.name || 'Unknown',
      version: result.os.version || ''
    },
    device: {
      type: result.device.type || 'desktop', // mobile, tablet, desktop
      name: result.device.name || '',
      vendor: result.device.vendor || ''
    },
    engine: {
      name: result.engine.name || '',
      version: result.engine.version || ''
    }
  };
}

/**
 * Get device display name (e.g., "Chrome on Windows", "Safari on iOS")
 */
function getDeviceDisplayName(userAgent) {
  const info = parseUserAgent(userAgent);
  const browser = `${info.browser.name} ${info.browser.version}`.trim();
  const os = `${info.os.name} ${info.os.version}`.trim();
  return `${browser} on ${os}`;
}

// ==========================================
// Session Room Management
// ==========================================

/**
 * Join user-specific rooms for broadcasting
 */
function joinUserRooms(socket, userId, deviceId) {
  socket.join(`user:${userId}`); // All devices of user
  socket.join(`device:${userId}:${deviceId}`); // Specific device
  socket.join(`online:${userId}`); // Online status
}

/**
 * Leave user-specific rooms
 */
function leaveUserRooms(socket, userId, deviceId) {
  socket.leave(`user:${userId}`);
  socket.leave(`device:${userId}:${deviceId}`);
  socket.leave(`online:${userId}`);
}

/**
 * Broadcast to all devices of a user (except current)
 */
function broadcastToUserDevices(io, userId, event, data, excludeSocketId = null) {
  const emitter = io.to(`user:${userId}`);
  if (excludeSocketId) {
    emitter.emit(event, data);
  } else {
    emitter.emit(event, data);
  }
}

/**
 * Broadcast to specific device
 */
function broadcastToDevice(io, userId, deviceId, event, data) {
  io.to(`device:${userId}:${deviceId}`).emit(event, data);
}

// ==========================================
// Message & Notification Handling
// ==========================================

/**
 * Create notification object
 */
function createNotification(type, data) {
  return {
    id: Date.now().toString(),
    type, // 'mention', 'direct-message', 'broadcast', 'system'
    timestamp: new Date(),
    read: false,
    ...data
  };
}

/**
 * Send message to user across all devices
 */
function sendToUserAllDevices(io, userId, message) {
  const notification = createNotification('direct-message', message);
  io.to(`user:${userId}`).emit('receive-message', notification);
  return notification;
}

/**
 * Send mention notification
 */
function sendMentionNotification(io, mentionedUserId, fromUserId, content) {
  const notification = createNotification('mention', {
    fromUserId,
    content,
    type: 'mention'
  });
  io.to(`user:${mentionedUserId}`).emit('user-mentioned', notification);
  return notification;
}

/**
 * Send broadcast to multiple users
 */
function broadcastToUsers(io, userIds, event, data) {
  userIds.forEach(userId => {
    io.to(`user:${userId}`).emit(event, data);
  });
}

// ==========================================
// Logout & Disconnection
// ==========================================

/**
 * Force logout specific device
 */
function forceLogoutDevice(io, userId, deviceId, socketId, reason = 'Logged out from another device') {
  io.to(socketId).emit('force-logout', {
    reason,
    timestamp: new Date(),
    userId,
    deviceId
  });
}

/**
 * Force logout all devices of user
 */
function forceLogoutAllDevices(io, userId, reason = 'Logged out from all devices') {
  io.to(`user:${userId}`).emit('force-logout', {
    reason,
    timestamp: new Date(),
    userId,
    allDevices: true
  });
}

/**
 * Graceful disconnect
 */
function disconnectSocket(io, socketId, reason = 'Disconnecting') {
  const socket = io.sockets.sockets.get(socketId);
  if (socket) {
    socket.emit('disconnect-request', { reason });
    socket.disconnect(true);
  }
}

// ==========================================
// Session Analytics
// ==========================================

/**
 * Get session statistics
 */
function getSessionStats(sessionStore) {
  let totalUsers = 0;
  let totalConnections = 0;
  const devices = {};

  sessionStore.sessions.forEach((userSessions) => {
    totalUsers++;
    userSessions.forEach((device) => {
      totalConnections++;
      const deviceType = device.device;
      devices[deviceType] = (devices[deviceType] || 0) + 1;
    });
  });

  return {
    totalUsers,
    totalConnections,
    averageDevicesPerUser: totalUsers > 0 ? (totalConnections / totalUsers).toFixed(2) : 0,
    deviceBreakdown: devices
  };
}

/**
 * Get user session summary
 */
function getUserSessionSummary(sessionStore, userId) {
  const sessions = sessionStore.getUserSessions(userId);

  return {
    userId,
    totalDevices: sessions.length,
    devices: sessions.map(session => ({
      deviceId: session.deviceId,
      browser: session.browser,
      os: session.os,
      deviceType: session.device,
      loginTime: session.loginTime,
      lastActivity: session.lastActivity,
      duration: Date.now() - new Date(session.loginTime).getTime()
    }))
  };
}

/**
 * Get most active device for user
 */
function getMostActiveDevice(sessionStore, userId) {
  const sessions = sessionStore.getUserSessions(userId);
  if (!sessions.length) return null;

  return sessions.reduce((most, current) => {
    const currentActivity = new Date(current.lastActivity).getTime();
    const mostActivity = new Date(most.lastActivity).getTime();
    return currentActivity > mostActivity ? current : most;
  });
}

// ==========================================
// Socket Verification & Security
// ==========================================

/**
 * Verify socket belongs to user
 */
function verifySocketOwnership(sessionStore, socketId, userId) {
  const actualUserId = sessionStore.socketToUser.get(socketId);
  return actualUserId === userId;
}

/**
 * Get user from socket
 */
function getUserFromSocket(sessionStore, socketId) {
  return sessionStore.socketToUser.get(socketId) || null;
}

/**
 * Check if user has active connections
 */
function isUserOnline(sessionStore, userId) {
  return sessionStore.sessions.has(userId) &&
         sessionStore.sessions.get(userId).size > 0;
}

/**
 * Check if user is connected from specific device
 */
function isConnectedFromDevice(sessionStore, userId, deviceId) {
  if (!sessionStore.sessions.has(userId)) return false;

  const userSessions = sessionStore.sessions.get(userId);
  return userSessions.has(deviceId);
}

// ==========================================
// Redis-based Session Store
// ==========================================

class RedisSessionStore {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  /**
   * Add connection to Redis
   */
  async addConnection(userId, socketId, userAgent) {
    const crypto = require('crypto');
    const timestamp = Math.floor(Date.now() / 1000);
    const hash = crypto.createHash('sha256').update(userAgent).digest('hex').slice(0, 8);
    const deviceId = `${hash}-${timestamp}`;

    const parser = require('ua-parser-js');
    const result = new parser(userAgent).getResult();

    const deviceData = {
      socketId,
      userAgent,
      browser: `${result.browser.name} ${result.browser.version}`,
      os: `${result.os.name} ${result.os.version}`,
      device: result.device.type || 'desktop',
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    const key = `sessions:${userId}`;
    await this.redis.hSet(key, deviceId, JSON.stringify(deviceData));
    await this.redis.expire(key, 30 * 24 * 60 * 60); // 30 days

    // Track socket to user mapping
    await this.redis.set(`socket:${socketId}`, userId, 'EX', 30 * 24 * 60 * 60);

    return { deviceId, device: deviceData };
  }

  /**
   * Get all sessions for user
   */
  async getUserSessions(userId) {
    const key = `sessions:${userId}`;
    const sessions = await this.redis.hGetAll(key);

    return Object.entries(sessions).map(([deviceId, data]) => ({
      deviceId,
      ...JSON.parse(data)
    }));
  }

  /**
   * Remove device
   */
  async removeDevice(userId, deviceId) {
    const key = `sessions:${userId}`;
    await this.redis.hDel(key, deviceId);

    const sessions = await this.redis.hLen(key);
    if (sessions === 0) {
      await this.redis.del(key);
    }
  }

  /**
   * Get user from socket
   */
  async getUserFromSocket(socketId) {
    return await this.redis.get(`socket:${socketId}`);
  }

  /**
   * Update activity
   */
  async updateActivity(userId, deviceId) {
    const key = `sessions:${userId}`;
    const deviceData = await this.redis.hGet(key, deviceId);

    if (deviceData) {
      const data = JSON.parse(deviceData);
      data.lastActivity = new Date().toISOString();
      await this.redis.hSet(key, deviceId, JSON.stringify(data));
    }
  }
}

// ==========================================
// Export all utilities
// ==========================================

module.exports = {
  // Device identification
  generateDeviceId,
  parseUserAgent,
  getDeviceDisplayName,

  // Room management
  joinUserRooms,
  leaveUserRooms,
  broadcastToUserDevices,
  broadcastToDevice,

  // Messaging
  createNotification,
  sendToUserAllDevices,
  sendMentionNotification,
  broadcastToUsers,

  // Logout & disconnect
  forceLogoutDevice,
  forceLogoutAllDevices,
  disconnectSocket,

  // Analytics
  getSessionStats,
  getUserSessionSummary,
  getMostActiveDevice,

  // Security
  verifySocketOwnership,
  getUserFromSocket,
  isUserOnline,
  isConnectedFromDevice,

  // Redis store
  RedisSessionStore
};
