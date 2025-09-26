import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Shield, Edit } from 'lucide-react';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import PasswordInput from '../ui/PasswordInput';
import type { AdminUser } from '../../services/adminService';

interface EditUserRequest {
  username: string;
  email: string;
  password?: string; // Optional - only if user wants to change it
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  onUpdateUser: (userId: number, userData: EditUserRequest) => Promise<void>;
  user: AdminUser | null;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  onUserUpdated,
  onUpdateUser,
  user,
}) => {
  const [formData, setFormData] = useState<EditUserRequest>({
    username: '',
    email: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassword, setChangePassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
      });
      setConfirmPassword('');
      setChangePassword(false);
      setErrors({});
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (changePassword) {
      if (!formData.password) {
        newErrors.password = 'New password is required';
      } else if (formData.password.length < 12) {
        newErrors.password = 'Password must be at least 12 characters';
      }

      if (formData.password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: EditUserRequest = {
        username: formData.username,
        email: formData.email,
      };

      // Only include password if user wants to change it
      if (changePassword && formData.password) {
        updateData.password = formData.password;
      }

      await onUpdateUser(user.id, updateData);
      
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
      });
      setConfirmPassword('');
      setChangePassword(false);
      setErrors({});
      
      onUserUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      // Error will be handled by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      if (user) {
        setFormData({
          username: user.username,
          email: user.email,
          password: '',
        });
      }
      setConfirmPassword('');
      setChangePassword(false);
      setErrors({});
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      handleClose();
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Edit className="w-5 h-5 mr-2" />
            Edit User
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* User Info Display */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-600">
              Editing: <span className="font-medium text-gray-900">{user.firstName} {user.lastName}</span>
            </p>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Username *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                errors.username ? 'border-red-300' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50`}
              placeholder="johndoe"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="w-4 h-4 inline mr-1" />
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50`}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Change Password Toggle */}
          <div className="border-t pt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={changePassword}
                onChange={(e) => {
                  setChangePassword(e.target.checked);
                  if (!e.target.checked) {
                    setFormData(prev => ({ ...prev, password: '' }));
                    setConfirmPassword('');
                    setErrors(prev => ({ ...prev, password: '', confirmPassword: '' }));
                  }
                }}
                disabled={isSubmitting}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center">
                <Lock className="w-4 h-4 mr-1" />
                Change Password
              </span>
            </label>
          </div>

          {/* Password fields - only show if changePassword is true */}
          {changePassword && (
            <>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  <Lock className="w-4 h-4 inline mr-1" />
                  New Password *
                </label>
                <PasswordInput
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  error={!!errors.password}
                  placeholder="At least 12 characters"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Confirm New Password *
                </label>
                <PasswordInput
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  disabled={isSubmitting}
                  error={!!errors.confirmPassword}
                  placeholder="Confirm your new password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </>
          )}

          {/* Current Roles Display */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Shield className="w-4 h-4 inline mr-1" />
              Current Roles
            </label>
            <div className="space-y-1">
              {user.roles.map((role) => (
                <span
                  key={role.id}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    role.name === 'ROLE_ADMIN' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {role.name === 'ROLE_ADMIN' && <Shield className="w-3 h-3 mr-1" />}
                  {role.name === 'ROLE_ADMIN' ? 'Administrator' : 'User'}
                </span>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Use the promote/demote buttons in the user list to change roles.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Updating...</span>
                </>
              ) : (
                'Update User'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;