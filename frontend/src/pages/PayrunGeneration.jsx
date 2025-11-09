import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FiCalendar,
  FiCheck,
  FiFileText,
  FiRefreshCw,
} from 'react-icons/fi';

const PayrunGeneration = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [validating, setValidating] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    fetchPayslips();
  }, [selectedMonth, selectedYear]);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/payroll/payslips/${selectedMonth}/${selectedYear}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPayslips(response.data);
    } catch (error) {
      console.error('Error fetching payslips:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to load payslips');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayrun = async () => {
    try {
      setGenerating(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/payroll/generate-payrun`,
        { month: selectedMonth, year: selectedYear },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Payrun generated successfully');
      fetchPayslips();
    } catch (error) {
      console.error('Error generating payrun:', error);
      toast.error(error.response?.data?.message || 'Failed to generate payrun');
    } finally {
      setGenerating(false);
    }
  };

  const handleValidateAll = async () => {
    try {
      setValidating(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/payroll/validate-payrun`,
        { month: selectedMonth, year: selectedYear },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('All payslips validated successfully');
      fetchPayslips();
    } catch (error) {
      console.error('Error validating payrun:', error);
      toast.error('Failed to validate payslips');
    } finally {
      setValidating(false);
    }
  };

  const handlePayslipClick = (payslipId) => {
    navigate(`/payroll/payslip/${payslipId}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Draft: 'bg-gray-600 text-gray-300',
      Computed: 'bg-blue-600 text-white',
      Validated: 'bg-yellow-600 text-white',
      Done: 'bg-green-600 text-white',
    };
    return statusConfig[status] || 'bg-gray-600 text-gray-300';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Payrun Generation</h1>
        <p className="text-gray-400">Generate and manage payslips for all employees</p>
      </div>

      {/* Period Selection & Actions */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                {months.map((month, index) => (
                  <option key={month} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchPayslips}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {payslips.length > 0 && (
              <button
                onClick={handleValidateAll}
                disabled={validating}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                <FiCheck className="mr-2" />
                {validating ? 'Validating...' : 'Validate All'}
              </button>
            )}
            <button
              onClick={handleGeneratePayrun}
              disabled={generating}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <FiCalendar className="mr-2" />
              {generating ? 'Generating...' : 'Generate Payrun'}
            </button>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
        <p className="text-blue-400 text-sm">
          <strong>Note:</strong> Employer cost = Employee's monthly wage. Basic wage = Employee's basic salary. 
          Gross wage = Basic salary + All allowances. Net wage = Gross wage - Deductions.
        </p>
      </div>

      {/* Payslips Table */}
      {loading ? (
        <div className="text-center text-gray-400 py-8">Loading payslips...</div>
      ) : payslips.length > 0 ? (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Pay Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Employer Cost
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Basic Wage
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Gross Wage
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Net Wage
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {payslips.map((payslip) => (
                  <tr
                    key={payslip._id}
                    onClick={() => handlePayslipClick(payslip._id)}
                    className="hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-gray-300">
                        <FiCalendar className="mr-2 text-blue-400" />
                        {payslip.payPeriod}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white font-medium">{payslip.employeeName}</div>
                      <div className="text-gray-400 text-sm">{payslip.employeeCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-white font-medium">
                      ₹{payslip.employerCost?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-300">
                      ₹{payslip.basicSalary?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-300">
                      ₹{payslip.grossSalary?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-green-400 font-medium">
                      ₹{payslip.netSalary?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(payslip.status)}`}>
                        {payslip.status === 'Done' && <FiCheck className="mr-1" />}
                        {payslip.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
          <FiFileText className="mx-auto text-gray-600 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-white mb-2">No Payslips Found</h3>
          <p className="text-gray-400 mb-4">
            No payslips have been generated for {months[selectedMonth - 1]} {selectedYear}
          </p>
          <button
            onClick={handleGeneratePayrun}
            disabled={generating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Generate Payrun Now
          </button>
        </div>
      )}
    </div>
  );
};

export default PayrunGeneration;
