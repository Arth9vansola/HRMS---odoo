import { useState } from 'react';
import { FiLock, FiMail } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';

const PasswordReset = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      toast.success('Password changed successfully! You will receive a confirmation email.');
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold text-white">Reset Password</h1>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-primary-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-gray-400">Change your password</p>
            </div>
          </div>

          {/* Auto-populated Login ID */}
          <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <FiMail className="text-primary-500" size={20} />
              <div>
                <p className="text-gray-400 text-sm">Login ID (Email)</p>
                <p className="text-white font-medium">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Old Password */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Old Password *
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your old password"
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              New Password *
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter new password (min 6 characters)"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">
              Confirm New Password *
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>

        {/* Password Requirements */}
        <div className="mt-6 bg-gray-700/30 border border-gray-600 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Password Requirements:</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Minimum 6 characters long</li>
            <li>• Must be different from old password</li>
            <li>• Confirmation email will be sent after successful change</li>
          </ul>
        </div>
      </div>

      {/* Note for Non-Employees */}
      {user?.role !== 'employee' && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
          <h3 className="text-yellow-400 font-semibold mb-2">ℹ️ Admin Note:</h3>
          <p className="text-yellow-300 text-sm">
            As an {user?.role}, you have special password management privileges. 
            Contact system administrator for advanced password options.
          </p>
        </div>
      )}
    </div>
  );
};

export default PasswordReset;
