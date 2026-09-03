// Higher-Order Component (HOC) Pattern - A function that takes a component and returns an enhanced component
// Use case: Code reuse, prop manipulation, state abstraction, authentication, theming

import React from 'react';

// Base component that will be enhanced
const UserProfile = ({ user, isLoading, theme }) => (
  <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
    {isLoading ? (
      <p className="animate-pulse">Loading user data...</p>
    ) : (
      <>
        <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
        <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</p>
        <div className={`p-3 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Status:</strong> {user.status}</p>
        </div>
      </>
    )}
  </div>
);

const ProductCard = ({ product, isLoading, theme }) => (
  <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-black border-gray-200'}`}>
    {isLoading ? (
      <p className="animate-pulse">Loading product...</p>
    ) : (
      <>
        <h3 className="font-bold mb-2">{product.name}</h3>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{product.description}</p>
        <p className="font-semibold mt-2">${product.price}</p>
      </>
    )}
  </div>
);

// HOC for withData - Manages data loading state
const withData = (WrappedComponent, fetchFn) => {
  return function WithDataComponent(props) {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      const loadData = async () => {
        try {
          setLoading(true);
          const result = await fetchFn(props.id);
          setData(result);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, [props.id]);

    return (
      <WrappedComponent
        {...props}
        data={data}
        isLoading={loading}
        error={error}
        refetch={() => loadData()}
      />
    );
  };
};

// HOC for withTheme - Provides theme to component
const withTheme = (WrappedComponent) => {
  return function WithThemeComponent(props) {
    const [theme, setTheme] = React.useState('light');

    const toggleTheme = () => {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
      <WrappedComponent
        {...props}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  };
};

// HOC for withAuth - Protects component with authentication
const withAuth = (WrappedComponent) => {
  return function WithAuthComponent(props) {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [user, setUser] = React.useState(null);

    React.useEffect(() => {
      // Simulate checking authentication
      const checkAuth = async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        // Simulate authenticated user
        setIsAuthenticated(true);
        setUser({ id: 1, username: 'john_doe', email: 'john@example.com' });
      };

      checkAuth();
    }, []);

    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-xl font-bold mb-2">🔒 Please login first</p>
            <p className="text-gray-600">You need to be authenticated to access this content.</p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} currentUser={user} />;
  };
};

// HOC for withLogger - Logs component lifecycle
const withLogger = (WrappedComponent, componentName) => {
  return function WithLoggerComponent(props) {
    React.useEffect(() => {
      console.log(`📝 ${componentName} mounted`);

      return () => {
        console.log(`📝 ${componentName} unmounted`);
      };
    }, []);

    React.useEffect(() => {
      console.log(`📝 ${componentName} rendered with props:`, props);
    });

    return <WrappedComponent {...props} />;
  };
};

// HOC for withErrorBoundary - Catches rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-100 p-4 rounded-lg border border-red-500">
          <p className="font-bold text-red-800">❌ Something went wrong</p>
          <p className="text-red-700 text-sm">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const withErrorBoundary = (WrappedComponent) => {
  return (props) => (
    <ErrorBoundary>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
};

// HOC for withProps - Provides default props
const withDefaultProps = (WrappedComponent, defaultProps) => {
  return function WithDefaultPropsComponent(props) {
    return <WrappedComponent {...defaultProps} {...props} />;
  };
};

// Combining multiple HOCs
const enhancedUserProfile = withLogger(
  withTheme(
    withAuth(
      withData(UserProfile, async (id) => ({
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'admin',
        status: 'active'
      }))
    )
  ),
  'UserProfile'
);

const enhancedProductCard = withLogger(
  withTheme(
    withData(ProductCard, async (id) => ({
      name: 'Premium Laptop',
      description: 'High-performance laptop for professionals',
      price: 1299.99
    }))
  ),
  'ProductCard'
);

// Demo Component
const ThemeToggleButton = ({ theme, toggleTheme }) => (
  <button
    onClick={toggleTheme}
    className={`px-4 py-2 rounded-lg font-semibold transition ${
      theme === 'dark'
        ? 'bg-yellow-500 text-black hover:bg-yellow-600'
        : 'bg-gray-800 text-white hover:bg-gray-900'
    }`}
  >
    {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
  </button>
);

// Component that uses multiple HOCs
const MultiEnhancedComponent = ({ theme, toggleTheme, isLoading, data, currentUser }) => (
  <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
    <h3 className="text-xl font-bold mb-4">Multi-Enhanced Component</h3>
    {isLoading ? (
      <p>Loading...</p>
    ) : (
      <>
        <p className="mb-2"><strong>Current User:</strong> {currentUser?.username}</p>
        <p className="mb-4"><strong>Theme:</strong> {theme}</p>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
        >
          Toggle Theme
        </button>
      </>
    )}
  </div>
);

const EnhancedMultiComponent = withLogger(
  withTheme(
    withAuth(
      withData(MultiEnhancedComponent, async () => ({}))
    )
  ),
  'MultiEnhancedComponent'
);

// Main Demo
export const HigherOrderComponentDemo = () => {
  return (
    <div className="p-8 bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Higher-Order Component (HOC) Pattern</h1>

      {/* Simple HOC Example */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Theme HOC Example</h2>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          {React.createElement(() => {
            const [theme, setTheme] = React.useState('light');

            return (
              <div className={`p-6 rounded-lg transition ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
                <h3 className="text-lg font-bold mb-4">Component Theme: {theme}</h3>
                <button
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className={`px-4 py-2 rounded font-semibold ${
                    theme === 'dark'
                      ? 'bg-yellow-500 text-black hover:bg-yellow-600'
                      : 'bg-gray-800 text-white hover:bg-gray-900'
                  }`}
                >
                  Toggle Theme
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Authentication HOC Example */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Authentication HOC</h2>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          {React.createElement(() => {
            const [isAuth, setIsAuth] = React.useState(false);

            const ProtectedComponent = ({ message }) => (
              <div className="p-4 bg-green-100 rounded border border-green-500">
                <p className="text-green-800">✓ Access Granted!</p>
                <p className="text-green-700">{message}</p>
              </div>
            );

            const Protected = withAuth(ProtectedComponent);

            return (
              <div>
                <button
                  onClick={() => setIsAuth(!isAuth)}
                  className="px-4 py-2 mb-4 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
                >
                  {isAuth ? 'Logout' : 'Login'}
                </button>
                {isAuth && <Protected message="Welcome to the protected area!" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Loading HOC */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Data Loading HOC</h2>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          {React.createElement(() => {
            const [isLoading, setIsLoading] = React.useState(true);
            const [data, setData] = React.useState(null);

            React.useEffect(() => {
              setTimeout(() => {
                setData({ title: 'Sample Data', description: 'This is loaded data' });
                setIsLoading(false);
              }, 2000);
            }, []);

            return (
              <div>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-100 rounded border border-blue-500">
                    <h3 className="font-bold text-blue-900">{data.title}</h3>
                    <p className="text-blue-800">{data.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Combining HOCs */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Combined HOCs</h2>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <EnhancedMultiComponent id={1} />
        </div>
      </div>

      {/* HOC Benefits Summary */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">HOC Benefits</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>✓ Code reuse across multiple components</li>
          <li>✓ Props manipulation and abstraction</li>
          <li>✓ State abstraction and composition</li>
          <li>✓ Separation of concerns (e.g., data fetching, authentication)</li>
          <li>✓ Can be combined to create powerful component enhancers</li>
          <li>⚠️ Can lead to "wrapper hell" if overused</li>
          <li>⚠️ Performance overhead due to extra component layers</li>
        </ul>
      </div>
    </div>
  );
};

export default HigherOrderComponentDemo;
