// Component Composition Pattern - Building complex UIs by composing simple components
// Use case: Flexible, reusable component architecture, avoiding prop drilling, separation of concerns

import React from 'react';

// Base UI Components (Atomic Components)
const Button = ({ children, onClick, variant = 'primary', className = '' }) => {
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-400 text-white hover:bg-gray-500',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-green-500 text-white hover:bg-green-600'
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded font-semibold transition ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, title, className = '' }) => (
  <div className={`border rounded-lg shadow-md p-6 bg-white ${className}`}>
    {title && <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>}
    {children}
  </div>
);

const Badge = ({ children, color = 'blue', size = 'md' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    red: 'bg-red-100 text-red-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`rounded-full font-semibold ${colorClasses[color]} ${sizeClasses[size]}`}>
      {children}
    </span>
  );
};

// Composite Components (Built from atomic components)
const UserCard = ({ user, onEdit, onDelete }) => (
  <Card title={user.name} className="mb-4">
    <div className="mb-4">
      <p className="text-gray-700"><strong>Email:</strong> {user.email}</p>
      <p className="text-gray-700"><strong>Role:</strong></p>
      <Badge color="blue" size="sm" className="ml-2">
        {user.role}
      </Badge>
    </div>
    <div className="flex gap-2">
      <Button variant="primary" onClick={() => onEdit(user)}>
        Edit
      </Button>
      <Button variant="danger" onClick={() => onDelete(user.id)}>
        Delete
      </Button>
    </div>
  </Card>
);

const UserList = ({ users, onEdit, onDelete }) => (
  <div className="space-y-4">
    {users.length === 0 ? (
      <p className="text-gray-500 text-center py-8">No users found</p>
    ) : (
      users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))
    )}
  </div>
);

// Form Composition
const FormField = ({ label, name, type = 'text', value, onChange, error, required = false }) => (
  <div className="mb-4">
    <label className="block text-gray-700 font-semibold mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
        error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
      }`}
      placeholder={label}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const UserForm = ({ initialUser, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = React.useState(
    initialUser || { name: '', email: '', role: 'user' }
  );
  const [errors, setErrors] = React.useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <Card title={initialUser ? 'Edit User' : 'Create User'}>
      <form onSubmit={handleSubmit}>
        <FormField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="success" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="secondary" onClick={() => setFormData(initialUser || { name: '', email: '', role: 'user' })}>
            Reset
          </Button>
        </div>
      </form>
    </Card>
  );
};

// Main App Component using Composition
export const ComponentCompositionDemo = () => {
  const [users, setUsers] = React.useState([
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'moderator' }
  ]);
  const [editingUser, setEditingUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleAddUser = async (userData) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...userData, id: u.id } : u));
    } else {
      setUsers([...users, { ...userData, id: Date.now() }]);
    }

    setEditingUser(null);
    setIsLoading(false);
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">User Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <UserForm
            initialUser={editingUser}
            onSubmit={handleAddUser}
            isLoading={isLoading}
          />
        </div>
        <div className="lg:col-span-2">
          <Card title={`Users (${users.length})`}>
            <UserList
              users={users}
              onEdit={setEditingUser}
              onDelete={handleDeleteUser}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ComponentCompositionDemo;
