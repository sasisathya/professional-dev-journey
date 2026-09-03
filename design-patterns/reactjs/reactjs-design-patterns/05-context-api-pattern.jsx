// Context API Pattern - Shares data across components without prop drilling
// Use case: Theme management, authentication, global app state, user preferences

import React, { createContext, useContext, useState, useCallback } from 'react';

// ===== Theme Context =====
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('blue');

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const changePrimaryColor = useCallback((color) => {
    setPrimaryColor(color);
  }, []);

  const value = {
    theme,
    primaryColor,
    toggleTheme,
    changePrimaryColor,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// ===== Auth Context =====
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (username && password) {
        const userData = {
          id: 1,
          username,
          email: `${username}@example.com`,
          role: 'user',
          loginTime: new Date().toISOString()
        };
        setUser(userData);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// ===== Notification Context =====
const NotificationContext = createContext();

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const notification = { id, message, type };

    setNotifications(prev => [...prev, notification]);

    if (duration) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    success: (msg, duration) => addNotification(msg, 'success', duration),
    error: (msg, duration) => addNotification(msg, 'error', duration),
    warning: (msg, duration) => addNotification(msg, 'warning', duration),
    info: (msg, duration) => addNotification(msg, 'info', duration)
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

// ===== Components using Context =====

const ThemeToggleButton = () => {
  const { theme, toggleTheme, primaryColor, changePrimaryColor } = useTheme();

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={toggleTheme}
        className={`px-4 py-2 rounded-lg font-semibold ${
          theme === 'dark'
            ? 'bg-yellow-500 text-black hover:bg-yellow-600'
            : 'bg-gray-800 text-white hover:bg-gray-900'
        }`}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div className="flex gap-2">
        {['blue', 'red', 'green', 'purple'].map(color => (
          <button
            key={color}
            onClick={() => changePrimaryColor(color)}
            className={`w-6 h-6 rounded border-2 ${
              primaryColor === color ? 'border-black' : 'border-gray-300'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
};

const LoginForm = () => {
  const { login, isLoading, error } = useAuth();
  const { success, error: notifyError } = useNotification();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      success(`Welcome ${username}!`);
    } catch (err) {
      notifyError(err.message);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter username"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter password"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold disabled:opacity-50"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

const UserProfile = () => {
  const { user, logout } = useAuth();
  const { success } = useNotification();
  const { theme } = useTheme();

  const handleLogout = () => {
    logout();
    success('Logged out successfully');
  };

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <h3 className="text-xl font-bold mb-4">👤 User Profile</h3>

      <div className="space-y-2 mb-4">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Login Time:</strong> {new Date(user.loginTime).toLocaleString()}</p>
      </div>

      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
      >
        Logout
      </button>
    </div>
  );
};

const NotificationContainer = () => {
  const { notifications } = useNotification();
  const { theme } = useTheme();

  const typeStyles = {
    success: 'bg-green-100 text-green-800 border-green-500',
    error: 'bg-red-100 text-red-800 border-red-500',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-500',
    info: 'bg-blue-100 text-blue-800 border-blue-500'
  };

  return (
    <div className="fixed bottom-4 right-4 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border-l-4 shadow-lg animate-fade-in ${typeStyles[notification.type]}`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
};

const TestButtons = () => {
  const { success, error, warning, info } = useNotification();

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => success('Success notification!')}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Success
      </button>
      <button
        onClick={() => error('Error notification!')}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Error
      </button>
      <button
        onClick={() => warning('Warning notification!')}
        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
      >
        Warning
      </button>
      <button
        onClick={() => info('Info notification!')}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Info
      </button>
    </div>
  );
};

// Main Demo with all providers
export const ContextAPIDemo = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ContextAPIDemoContent />
          <NotificationContainer />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

const ContextAPIDemoContent = () => {
  const { theme, isDark } = useTheme();

  return (
    <div className={`p-8 min-h-screen transition ${
      isDark
        ? 'bg-gray-900 text-white'
        : 'bg-gray-100 text-gray-800'
    }`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Context API Pattern</h1>
        <ThemeToggleButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className={`p-6 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold mb-4">Authentication</h2>
          <UserProfile />
        </div>

        <div className={`p-6 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold mb-4">Notifications</h2>
          <TestButtons />
        </div>
      </div>

      <div className={`p-6 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-2xl font-bold mb-4">Context API Benefits</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>✓ Eliminates prop drilling</li>
          <li>✓ Global state management without Redux</li>
          <li>✓ Easy theme switching</li>
          <li>✓ Authentication state management</li>
          <li>✓ Simple to set up and use</li>
          <li>⚠️ Can cause unnecessary re-renders</li>
          <li>⚠️ Not ideal for frequently changing state</li>
        </ul>
      </div>
    </div>
  );
};

export default ContextAPIDemo;
