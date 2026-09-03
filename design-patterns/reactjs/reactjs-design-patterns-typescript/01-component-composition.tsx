// Component Composition Pattern - TypeScript React Version
// Building complex UIs by composing simple, type-safe components

import React, { ReactNode, FC, useState, useCallback } from 'react';

// ===== Type Definitions =====

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';
type BadgeColor = 'blue' | 'red' | 'green' | 'yellow';
type BadgeSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
  size?: BadgeSize;
  className?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
}

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
}

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
}

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

interface UserFormProps {
  initialUser?: User;
  onSubmit: (user: User) => Promise<void>;
  isLoading?: boolean;
}

interface UserFormState {
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
}

interface UserManagementState {
  users: User[];
  editingUser: User | null;
  isLoading: boolean;
}

// ===== Atomic Components =====

const Button: FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button'
}) => {
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-400 text-white hover:bg-gray-500',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-green-500 text-white hover:bg-green-600'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded font-semibold transition disabled:opacity-50 ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card: FC<CardProps> = ({ children, title, className = '' }) => (
  <div className={`border rounded-lg shadow-md p-6 bg-white ${className}`}>
    {title && <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>}
    {children}
  </div>
);

const Badge: FC<BadgeProps> = ({ children, color = 'blue', size = 'md', className = '' }) => {
  const colorClasses: Record<BadgeColor, string> = {
    blue: 'bg-blue-100 text-blue-800',
    red: 'bg-red-100 text-red-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800'
  };

  const sizeClasses: Record<BadgeSize, string> = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`rounded-full font-semibold ${colorClasses[color]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
};

// ===== Composite Components =====

const UserCard: FC<UserCardProps> = ({ user, onEdit, onDelete }) => (
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

const UserList: FC<UserListProps> = ({ users, onEdit, onDelete }) => (
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

// ===== Form Components =====

const FormField: FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  disabled = false
}) => (
  <div className="mb-4">
    <label className="block text-gray-700 font-semibold mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
        error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
      }`}
      placeholder={label}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const UserForm: FC<UserFormProps> = ({ initialUser, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<UserFormState>(
    initialUser || { name: '', email: '', role: 'user' }
  );
  const [errors, setErrors] = useState<Partial<UserFormState>>({});

  const handleChange = useCallback((field: keyof UserFormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormState> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit({
        id: initialUser?.id || Date.now(),
        name: formData.name,
        email: formData.email,
        role: formData.role
      });
    }
  }, [formData, initialUser, onSubmit]);

  return (
    <Card title={initialUser ? 'Edit User' : 'Create User'}>
      <form onSubmit={handleSubmit}>
        <FormField
          label="Name"
          name="name"
          value={formData.name}
          onChange={(val) => handleChange('name', val)}
          error={errors.name}
          required
          disabled={isLoading}
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(val) => handleChange('email', val)}
          error={errors.email}
          required
          disabled={isLoading}
        />
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Role</label>
          <select
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            disabled={isLoading}
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
          <Button type="reset" variant="secondary" onClick={() => setFormData(initialUser || { name: '', email: '', role: 'user' })}>
            Reset
          </Button>
        </div>
      </form>
    </Card>
  );
};

// ===== Main Component =====

export const ComponentCompositionDemo: FC = () => {
  const [state, setState] = useState<UserManagementState>({
    users: [
      { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
      { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
      { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'moderator' }
    ],
    editingUser: null,
    isLoading: false
  });

  const handleAddUser = useCallback(async (userData: User) => {
    setState(prev => ({ ...prev, isLoading: true }));
    await new Promise(resolve => setTimeout(resolve, 500));

    setState(prev => {
      const updatedUsers = prev.editingUser
        ? prev.users.map(u => u.id === prev.editingUser!.id ? { ...userData, id: u.id } : u)
        : [...prev.users, userData];

      return {
        users: updatedUsers,
        editingUser: null,
        isLoading: false
      };
    });
  }, []);

  const handleDeleteUser = useCallback((userId: number) => {
    setState(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== userId)
    }));
  }, []);

  const handleEditUser = useCallback((user: User) => {
    setState(prev => ({ ...prev, editingUser: user }));
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">User Management - TypeScript</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <UserForm
            initialUser={state.editingUser || undefined}
            onSubmit={handleAddUser}
            isLoading={state.isLoading}
          />
        </div>
        <div className="lg:col-span-2">
          <Card title={`Users (${state.users.length})`}>
            <UserList
              users={state.users}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ComponentCompositionDemo;
