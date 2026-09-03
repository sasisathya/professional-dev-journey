// Render Props Pattern - Shares code between React components using a prop that is a function
// Use case: Code reuse without inheritance, sharing state logic, cross-cutting concerns

import React from 'react';

// Mouse Tracker using Render Props
class MouseTracker extends React.Component {
  constructor(props) {
    super(props);
    this.state = { x: 0, y: 0 };
  }

  componentDidMount() {
    window.addEventListener('mousemove', this.handleMouseMove);
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.handleMouseMove);
  }

  handleMouseMove = (e) => {
    this.setState({ x: e.clientX, y: e.clientY });
  };

  render() {
    // The key concept: render prop is a function that this component calls
    return this.props.render(this.state);
  }
}

// Mouse Cat component that uses MouseTracker
const MouseCat = ({ x, y }) => (
  <div
    className="text-4xl absolute transition-all duration-100"
    style={{ left: `${x}px`, top: `${y}px` }}
  >
    🐱
  </div>
);

// Mouse Dot component
const MouseDot = ({ x, y }) => (
  <div
    className="w-2 h-2 bg-red-500 rounded-full absolute transition-all duration-100"
    style={{ left: `${x}px`, top: `${y}px` }}
  />
);

// Form State Provider using Render Props
class FormProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: props.initialValues || {},
      errors: {},
      touched: {},
      isDirty: false,
      isSubmitting: false
    };
  }

  setFieldValue = (name, value) => {
    this.setState(prev => ({
      values: { ...prev.values, [name]: value },
      isDirty: true
    }));
  };

  setFieldError = (name, error) => {
    this.setState(prev => ({
      errors: { ...prev.errors, [name]: error }
    }));
  };

  setFieldTouched = (name) => {
    this.setState(prev => ({
      touched: { ...prev.touched, [name]: true }
    }));
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ isSubmitting: true });

    try {
      await this.props.onSubmit(this.state.values);
    } catch (error) {
      this.setState(prev => ({
        errors: { ...prev.errors, submit: error.message }
      }));
    } finally {
      this.setState({ isSubmitting: false });
    }
  };

  reset = () => {
    this.setState({
      values: this.props.initialValues || {},
      errors: {},
      touched: {},
      isDirty: false,
      isSubmitting: false
    });
  };

  render() {
    return this.props.children({
      ...this.state,
      setFieldValue: this.setFieldValue,
      setFieldError: this.setFieldError,
      setFieldTouched: this.setFieldTouched,
      handleSubmit: this.handleSubmit,
      reset: this.reset
    });
  }
}

// Toggle component using Render Props
class Toggle extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: props.initialState || false };
  }

  toggle = () => {
    this.setState(prev => ({ isOpen: !prev.isOpen }));
  };

  open = () => {
    this.setState({ isOpen: true });
  };

  close = () => {
    this.setState({ isOpen: false });
  };

  render() {
    return this.props.render({
      isOpen: this.state.isOpen,
      toggle: this.toggle,
      open: this.open,
      close: this.close
    });
  }
}

// Data Fetcher using Render Props
class DataFetcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      loading: true,
      error: null
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {
      this.setState({ loading: true, error: null });
      const response = await fetch(this.props.url);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      this.setState({ data, loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  };

  render() {
    return this.props.render({
      data: this.state.data,
      loading: this.state.loading,
      error: this.state.error,
      refetch: this.fetchData
    });
  }
}

// Usage Example Component
export const RenderPropsDemo = () => {
  const [formData, setFormData] = React.useState(null);

  const handleFormSubmit = async (values) => {
    console.log('Form submitted:', values);
    setFormData(values);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Render Props Pattern Demo</h1>

      {/* Mouse Tracker Demo */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Mouse Tracker</h2>
        <div className="bg-white rounded-lg overflow-hidden shadow-lg mb-4">
          <div className="relative w-full h-96 bg-gradient-to-b from-blue-100 to-blue-50 cursor-none">
            <MouseTracker
              render={({ x, y }) => (
                <>
                  <MouseCat x={x} y={y} />
                  <MouseDot x={x} y={y} />
                  <div className="absolute top-4 left-4 bg-white p-3 rounded shadow text-sm font-mono">
                    Position: ({x}, {y})
                  </div>
                </>
              )}
            />
          </div>
        </div>
      </div>

      {/* Toggle Demo */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Toggle/Accordion Pattern</h2>
        <Toggle
          initialState={false}
          render={({ isOpen, toggle, open, close }) => (
            <div className="space-y-4">
              <button
                onClick={toggle}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
              >
                {isOpen ? 'Hide Details' : 'Show Details'}
              </button>

              {isOpen && (
                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
                  <h3 className="font-bold text-lg mb-2">Hidden Content</h3>
                  <p className="text-gray-700 mb-4">
                    This content is only visible when the toggle is open. You can use this pattern for accordions, modals, dropdowns, etc.
                  </p>
                  <button
                    onClick={close}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 font-semibold"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          )}
        />
      </div>

      {/* Form Provider Demo */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Form State Management</h2>
        <FormProvider
          initialValues={{ username: '', email: '', message: '' }}
          onSubmit={handleFormSubmit}
        >
          {({ values, errors, touched, isDirty, isSubmitting, setFieldValue, setFieldTouched, handleSubmit, reset }) => (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg max-w-md">
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Username</label>
                <input
                  type="text"
                  value={values.username}
                  onChange={(e) => setFieldValue('username', e.target.value)}
                  onBlur={() => setFieldTouched('username')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter username"
                />
                {touched.username && errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={values.email}
                  onChange={(e) => setFieldValue('email', e.target.value)}
                  onBlur={() => setFieldTouched('email')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Message</label>
                <textarea
                  value={values.message}
                  onChange={(e) => setFieldValue('message', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                  placeholder="Enter your message"
                />
              </div>

              {errors.submit && <p className="text-red-500 mb-4">{errors.submit}</p>}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold"
                >
                  Reset
                </button>
              </div>

              {isDirty && <p className="text-blue-500 text-sm mt-2">Form has unsaved changes</p>}
            </form>
          )}
        </FormProvider>

        {formData && (
          <div className="mt-6 bg-green-100 p-4 rounded-lg border border-green-500">
            <p className="font-semibold text-green-800">✓ Form submitted successfully!</p>
            <pre className="text-sm text-green-700 mt-2">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Data Fetcher Demo */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Data Fetcher Pattern</h2>
        <DataFetcher url="https://jsonplaceholder.typicode.com/posts/1">
          {({ data, loading, error, refetch }) => (
            <div>
              {loading && <p className="text-gray-600">Loading...</p>}
              {error && <p className="text-red-500">Error: {error}</p>}
              {data && (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="font-bold text-lg mb-2">{data.title}</h3>
                  <p className="text-gray-700 mb-4">{data.body}</p>
                  <button
                    onClick={refetch}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
                  >
                    Refetch
                  </button>
                </div>
              )}
            </div>
          )}
        </DataFetcher>
      </div>
    </div>
  );
};

export default RenderPropsDemo;
