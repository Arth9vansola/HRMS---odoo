import { useState, useEffect } from 'react';
import { FiMail, FiEye, FiEyeOff, FiRefreshCw } from 'react-icons/fi';
import api from '../utils/api';
import { toast } from 'react-toastify';

const LoginManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState({});
  const [sendingMail, setSendingMail] = useState({});

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/employees', { params: { limit: 100 } });
      setEmployees(data.data);
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (empId) => {
    setShowPassword(prev => ({ ...prev, [empId]: !prev[empId] }));
  };

  const handleSendLoginDetails = async (employee) => {
    setSendingMail(prev => ({ ...prev, [employee._id]: true }));
    try {
      await api.post('/auth/send-login-details', {
        employeeId: employee._id,
        email: employee.email,
      });
      toast.success(`Login details sent to ${employee.email}`);
    } catch (error) {
      toast.error('Failed to send login details');
    } finally {
      setSendingMail(prev => ({ ...prev, [employee._id]: false }));
    }
  };

  const handleResetPassword = async (employeeId) => {
    try {
      await api.post('/auth/reset-password-admin', { employeeId });
      toast.success('Password reset link sent to employee');
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Login Management</h1>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Employee Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Login ID (Email)
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Password
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {employees.map((employee) => (
                <tr key={employee._id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                        {employee.firstName[0]}{employee.lastName[0]}
                      </div>
                      <div className="text-white font-medium">
                        {employee.firstName} {employee.lastName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {employee.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {employee.employeeId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs font-medium capitalize">
                      {employee.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300 font-mono">
                        {showPassword[employee._id] ? '••••••••' : '••••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(employee._id)}
                        className="text-gray-400 hover:text-white"
                      >
                        {showPassword[employee._id] ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSendLoginDetails(employee)}
                        disabled={sendingMail[employee._id]}
                        className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50"
                      >
                        <FiMail size={14} />
                        <span>{sendingMail[employee._id] ? 'Sending...' : 'Send Mail'}</span>
                      </button>
                      <button
                        onClick={() => handleResetPassword(employee._id)}
                        className="flex items-center space-x-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                      >
                        <FiRefreshCw size={14} />
                        <span>Reset</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note Section */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <h3 className="text-blue-400 font-semibold mb-2">📝 Note:</h3>
        <ul className="text-blue-300 text-sm space-y-1">
          <li>• Employees receive their Login ID (email) and initial password via email</li>
          <li>• Click "Send Mail" to send login credentials to new employees</li>
          <li>• Click "Reset" to generate a new password and send reset link</li>
          <li>• Employees can change their password from their profile settings</li>
        </ul>
      </div>
    </div>
  );
};

export default LoginManagement;
