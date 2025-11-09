import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiDownload, FiFileText, FiUsers, FiClock, FiDollarSign } from 'react-icons/fi';

const Reports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user has access to reports
  const hasAccess = user?.role === 'admin' || user?.role === 'payroll';

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FiFileText className="mx-auto text-gray-600 mb-4" size={64} />
          <h2 className="text-xl font-semibold text-white mb-2">Access Restricted</h2>
          <p className="text-gray-400">
            Reports are only accessible by Admin and Payroll Officers
          </p>
        </div>
      </div>
    );
  }

  const reportTypes = [
    {
      id: 1,
      title: 'Employee Report',
      description: 'Complete employee directory with detailed information',
      icon: FiUsers,
      color: 'bg-blue-500',
      action: () => alert('Employee Report - Coming Soon'),
    },
    {
      id: 2,
      title: 'Attendance Report',
      description: 'Monthly attendance summary for all employees',
      icon: FiClock,
      color: 'bg-green-500',
      action: () => alert('Attendance Report - Coming Soon'),
    },
    {
      id: 3,
      title: 'Leave Report',
      description: 'Leave applications and approval status',
      icon: FiFileText,
      color: 'bg-purple-500',
      action: () => alert('Leave Report - Coming Soon'),
    },
    {
      id: 4,
      title: 'Salary Statement Report',
      description: 'Annual salary statement with component breakdown',
      icon: FiDollarSign,
      color: 'bg-orange-500',
      action: () => navigate('/reports/salary-statement'),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.id}
              className="card bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className={`${report.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {report.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {report.description}
                  </p>
                  <button 
                    onClick={report.action}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    <FiDownload size={16} />
                    <span>Generate Report</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card bg-gray-800 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Custom Report</h3>
        <p className="text-gray-400 mb-4">
          Generate custom reports with specific date ranges and filters.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Start Date</label>
            <input type="date" className="input" />
          </div>
          <div>
            <label className="label">End Date</label>
            <input type="date" className="input" />
          </div>
        </div>
        <button className="mt-4 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
          Generate Custom Report
        </button>
      </div>
    </div>
  );
};

export default Reports;
