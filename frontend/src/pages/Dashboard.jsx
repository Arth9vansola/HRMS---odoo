import { useState, useEffect } from 'react';
import { FiUsers, FiLayers, FiCheckCircle, FiFileText } from 'react-icons/fi';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const { data } = await api.get('/dashboard/stats');
      setStats(data.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  const statCards = [
    {
      title: 'Total Employees',
      value: stats?.totalEmployees || 0,
      icon: FiUsers,
      color: 'bg-blue-500',
    },
    {
      title: 'Departments',
      value: stats?.totalDepartments || 0,
      icon: FiLayers,
      color: 'bg-green-500',
    },
    {
      title: 'Present Today',
      value: stats?.todayPresent || 0,
      icon: FiCheckCircle,
      color: 'bg-purple-500',
    },
    {
      title: 'Pending Leaves',
      value: stats?.pendingLeaves || 0,
      icon: FiFileText,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card bg-gray-800 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2 text-white">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-4 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Employees by Department */}
      <div className="card bg-gray-800 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-white">Employees by Department</h3>
        <div className="space-y-3">
          {stats?.employeesByDepartment?.map((dept, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-300">{dept.name}</span>
              <span className="font-semibold text-white">{dept.count} employees</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Leave Requests */}
      <div className="card bg-gray-800 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-white">Recent Leave Requests</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400">Employee</th>
                <th className="text-left py-3 px-4 text-gray-400">Leave Type</th>
                <th className="text-left py-3 px-4 text-gray-400">Duration</th>
                <th className="text-left py-3 px-4 text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentLeaves?.map((leave) => (
                <tr key={leave._id} className="border-b border-gray-700">
                  <td className="py-3 px-4 text-gray-300">
                    {leave.employee?.firstName} {leave.employee?.lastName}
                  </td>
                  <td className="py-3 px-4 text-gray-300">{leave.leaveType}</td>
                  <td className="py-3 px-4 text-gray-300">{leave.numberOfDays} days</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        leave.status === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : leave.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {leave.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Payroll Summary */}
      <div className="card bg-gray-800 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-white">Monthly Payroll Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400">Total Payroll</p>
            <p className="text-2xl font-bold text-white">
              ${stats?.monthlyPayroll?.totalPayroll?.toLocaleString() || 0}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Processed</p>
            <p className="text-2xl font-bold text-white">
              {stats?.monthlyPayroll?.processedCount || 0}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Paid</p>
            <p className="text-2xl font-bold text-white">
              {stats?.monthlyPayroll?.paidCount || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
