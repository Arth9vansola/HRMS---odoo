import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import PayrunGeneration from './PayrunGeneration';
import {
  FiAlertTriangle,
  FiFileText,
  FiBarChart2,
  FiCalendar,
  FiDollarSign,
} from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PayrollDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [warnings, setWarnings] = useState({
    noBankAccount: [],
    noManager: [],
  });
  const [payruns, setPayruns] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('monthly'); // 'monthly' or 'annual'
  const [loading, setLoading] = useState(true);
  
  // Chart data
  const [employerCostData, setEmployerCostData] = useState({
    labels: ['Jan 2025', 'Feb 2025', 'Mar 2025'],
    datasets: [{
      label: 'Employer Cost',
      data: [0, 0, 0],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
    }],
  });
  
  const [employeeCountData, setEmployeeCountData] = useState({
    labels: ['Jan 2025', 'Feb 2025', 'Mar 2025'],
    datasets: [{
      label: 'Employee Count',
      data: [0, 0, 0],
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 1,
    }],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
        ticks: {
          color: 'rgba(156, 163, 175, 1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(156, 163, 175, 1)',
        },
      },
    },
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch warnings
      const warningsRes = await axios.get('http://localhost:5000/api/payroll/warnings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWarnings(warningsRes.data);
      
      // Fetch payruns
      const payrunsRes = await axios.get('http://localhost:5000/api/payroll/payruns', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayruns(payrunsRes.data);
      
      // Fetch chart data
      const chartsRes = await axios.get('http://localhost:5000/api/payroll/charts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setEmployerCostData({
        labels: chartsRes.data.months,
        datasets: [{
          label: 'Employer Cost (₹)',
          data: chartsRes.data.employerCost,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        }],
      });
      
      setEmployeeCountData({
        labels: chartsRes.data.months,
        datasets: [{
          label: 'Employee Count',
          data: chartsRes.data.employeeCount,
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
        }],
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handlePayrunClick = (payrun) => {
    navigate(`/payroll/payrun/${payrun.month}/${payrun.year}`);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FiBarChart2 },
    { id: 'payrun', label: 'Payrun', icon: FiFileText },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Payroll Management</h1>
        <p className="text-gray-400">Manage employee payroll and salary statements</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Icon className="mr-2" size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dashboard Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Warnings Panel */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center mb-4">
              <FiAlertTriangle className="text-yellow-500 mr-2" size={24} />
              <h2 className="text-xl font-semibold text-white">Payroll Warnings</h2>
            </div>
            
            <div className="space-y-3">
              {warnings.noBankAccount.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-start">
                    <FiAlertTriangle className="text-yellow-500 mr-3 mt-1" size={18} />
                    <div>
                      <h3 className="text-yellow-500 font-medium mb-2">
                        {warnings.noBankAccount.length} Employee(s) Without Bank Account
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">
                        The following employees do not have bank account information:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {warnings.noBankAccount.map((emp) => (
                          <span
                            key={emp._id}
                            className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm"
                          >
                            {emp.firstName} {emp.lastName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {warnings.noManager.length > 0 && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <div className="flex items-start">
                    <FiAlertTriangle className="text-orange-500 mr-3 mt-1" size={18} />
                    <div>
                      <h3 className="text-orange-500 font-medium mb-2">
                        {warnings.noManager.length} Employee(s) Without Manager
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">
                        The following employees do not have an assigned manager:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {warnings.noManager.map((emp) => (
                          <span
                            key={emp._id}
                            className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm"
                          >
                            {emp.firstName} {emp.lastName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {warnings.noBankAccount.length === 0 && warnings.noManager.length === 0 && (
                <div className="text-center text-gray-400 py-4">
                  <p>✓ No warnings! All employees have complete payroll information.</p>
                </div>
              )}
            </div>
          </div>

          {/* Payruns Panel */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FiFileText className="text-blue-500 mr-2" size={24} />
                <h2 className="text-xl font-semibold text-white">Payrun History</h2>
              </div>
              <button
                onClick={() => setActiveTab('payrun')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate Payrun
              </button>
            </div>
            
            <div className="space-y-3">
              {payruns.length > 0 ? (
                payruns.map((payrun) => (
                  <div
                    key={`${payrun.month}-${payrun.year}`}
                    onClick={() => handlePayrunClick(payrun)}
                    className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:bg-gray-700 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FiCalendar className="text-blue-400 mr-3" size={20} />
                        <div>
                          <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                            Payrun for {payrun.monthName} {payrun.year}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {payrun.payslipCount} Payslip{payrun.payslipCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">Total Cost</p>
                        <p className="text-white font-semibold">₹{payrun.totalCost.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <FiFileText className="mx-auto mb-3" size={48} />
                  <p>No payruns generated yet</p>
                  <p className="text-sm mt-1">Click "Generate Payrun" to create your first payrun</p>
                </div>
              )}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Employer Cost Chart */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FiDollarSign className="text-blue-500 mr-2" size={20} />
                  <h3 className="text-lg font-semibold text-white">Employer Cost</h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setChartPeriod('monthly')}
                    className={`px-3 py-1 text-sm rounded ${
                      chartPeriod === 'monthly'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setChartPeriod('annual')}
                    className={`px-3 py-1 text-sm rounded ${
                      chartPeriod === 'annual'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    Annual
                  </button>
                </div>
              </div>
              <div className="h-64">
                <Bar data={employerCostData} options={chartOptions} />
              </div>
            </div>

            {/* Employee Count Chart */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FiBarChart2 className="text-green-500 mr-2" size={20} />
                  <h3 className="text-lg font-semibold text-white">Employee Count</h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setChartPeriod('monthly')}
                    className={`px-3 py-1 text-sm rounded ${
                      chartPeriod === 'monthly'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setChartPeriod('annual')}
                    className={`px-3 py-1 text-sm rounded ${
                      chartPeriod === 'annual'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    Annual
                  </button>
                </div>
              </div>
              <div className="h-64">
                <Bar data={employeeCountData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payrun Tab Content */}
      {activeTab === 'payrun' && (
        <PayrunGeneration />
      )}
    </div>
  );
};

export default PayrollDashboard;
