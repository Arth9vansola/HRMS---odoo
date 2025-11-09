import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import {
  FiPrinter,
  FiUser,
  FiCalendar,
} from 'react-icons/fi';

const SalaryStatementReport = () => {
  const printRef = useRef();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [salaryStatement, setSalaryStatement] = useState(null);
  const [loading, setLoading] = useState(false);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    }
  };

  const fetchSalaryStatement = async () => {
    if (!selectedEmployee) {
      toast.warning('Please select an employee');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/payroll/salary-statement/${selectedEmployee}/${selectedYear}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSalaryStatement(response.data);
    } catch (error) {
      console.error('Error fetching salary statement:', error);
      toast.error(error.response?.data?.message || 'Failed to load salary statement');
      setSalaryStatement(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Salary_Statement_${salaryStatement?.employee?.firstName}_${selectedYear}`,
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Salary Statement Report</h1>
        <p className="text-gray-400">View and print annual salary statements</p>
      </div>

      {/* Selection Controls */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              <FiUser className="inline mr-2" />
              Select Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="">Choose an employee...</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              <FiCalendar className="inline mr-2" />
              Select Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end space-x-3">
            <button
              onClick={fetchSalaryStatement}
              disabled={loading || !selectedEmployee}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Generate Report'}
            </button>
            {salaryStatement && (
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FiPrinter size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Salary Statement */}
      {salaryStatement && (
        <div ref={printRef} className="bg-white text-gray-900 rounded-lg p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                <span className="text-white font-bold text-3xl">W</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Company Name</h1>
                <p className="text-gray-600">& Logo</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-blue-600 mt-4">SALARY STATEMENT REPORT</h2>
            <p className="text-gray-600 mt-2">For the Year {selectedYear}</p>
          </div>

          {/* Employee Details */}
          <div className="grid grid-cols-2 gap-6 mb-8 bg-gray-50 p-6 rounded-lg">
            <div>
              <div className="mb-3">
                <span className="text-gray-600 text-sm">Employee Name:</span>
                <p className="font-bold text-lg">
                  {salaryStatement.employee.firstName} {salaryStatement.employee.lastName}
                </p>
              </div>
              <div className="mb-3">
                <span className="text-gray-600 text-sm">Employee Code:</span>
                <p className="font-semibold">{salaryStatement.employee.employeeId}</p>
              </div>
            </div>
            <div>
              <div className="mb-3">
                <span className="text-gray-600 text-sm">Designation:</span>
                <p className="font-semibold">{salaryStatement.employee.designation}</p>
              </div>
              <div className="mb-3">
                <span className="text-gray-600 text-sm">Date of Joining:</span>
                <p className="font-semibold">
                  {new Date(salaryStatement.employee.joiningDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600 text-sm">Salary Effective From:</span>
              <p className="font-semibold">
                {new Date(salaryStatement.salaryComponent.effectiveDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Salary Components Table */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-blue-600">SALARY BREAKDOWN</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-3 text-left">Component</th>
                  <th className="border border-gray-300 px-4 py-3 text-right">Monthly (₹)</th>
                  <th className="border border-gray-300 px-4 py-3 text-right">Yearly (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-blue-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold" colSpan="3">
                    EARNINGS
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Basic Salary</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {salaryStatement.salaryComponent.basicSalary.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {(salaryStatement.salaryComponent.basicSalary * 12).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    House Rent Allowance (HRA)
                    {salaryStatement.salaryComponent.hra.isPercentage && 
                      ` (${salaryStatement.salaryComponent.hra.percentage}%)`
                    }
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {salaryStatement.salaryComponent.hra.amount.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {(salaryStatement.salaryComponent.hra.amount * 12).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    Standard Allowance
                    {salaryStatement.salaryComponent.standardAllowance.isPercentage && 
                      ` (${salaryStatement.salaryComponent.standardAllowance.percentage}%)`
                    }
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {salaryStatement.salaryComponent.standardAllowance.amount.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {(salaryStatement.salaryComponent.standardAllowance.amount * 12).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    Performance Bonus
                    {salaryStatement.salaryComponent.performanceBonus.isPercentage && 
                      ` (${salaryStatement.salaryComponent.performanceBonus.percentage}%)`
                    }
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {salaryStatement.salaryComponent.performanceBonus.amount.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {(salaryStatement.salaryComponent.performanceBonus.amount * 12).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    Leave Travel Allowance (LTA)
                    {salaryStatement.salaryComponent.lta.isPercentage && 
                      ` (${salaryStatement.salaryComponent.lta.percentage}%)`
                    }
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {salaryStatement.salaryComponent.lta.amount.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {(salaryStatement.salaryComponent.lta.amount * 12).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    Fixed Allowance
                    {salaryStatement.salaryComponent.fixedAllowance.isPercentage && 
                      ` (${salaryStatement.salaryComponent.fixedAllowance.percentage}%)`
                    }
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {salaryStatement.salaryComponent.fixedAllowance.amount.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {(salaryStatement.salaryComponent.fixedAllowance.amount * 12).toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-green-50 font-bold">
                  <td className="border border-gray-300 px-4 py-2">GROSS SALARY</td>
                  <td className="border border-gray-300 px-4 py-2 text-right text-green-600">
                    {salaryStatement.salaryComponent.grossSalary.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right text-green-600">
                    {(salaryStatement.salaryComponent.grossSalary * 12).toLocaleString()}
                  </td>
                </tr>

                <tr className="bg-red-50">
                  <td className="border border-gray-300 px-4 py-2 font-semibold" colSpan="3">
                    DEDUCTIONS
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    Employee PF
                    {salaryStatement.salaryComponent.employeePF.isPercentage && 
                      ` (${salaryStatement.salaryComponent.employeePF.percentage}%)`
                    }
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {salaryStatement.salaryComponent.employeePF.amount.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {(salaryStatement.salaryComponent.employeePF.amount * 12).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Professional Tax</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {salaryStatement.salaryComponent.professionalTax.amount.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {(salaryStatement.salaryComponent.professionalTax.amount * 12).toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-red-50 font-bold">
                  <td className="border border-gray-300 px-4 py-2">TOTAL DEDUCTIONS</td>
                  <td className="border border-gray-300 px-4 py-2 text-right text-red-600">
                    {salaryStatement.salaryComponent.totalDeductions.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right text-red-600">
                    {(salaryStatement.salaryComponent.totalDeductions * 12).toLocaleString()}
                  </td>
                </tr>

                <tr className="bg-blue-100 font-bold text-lg">
                  <td className="border border-gray-300 px-4 py-3">NET SALARY (Take Home)</td>
                  <td className="border border-gray-300 px-4 py-3 text-right text-blue-600">
                    ₹{salaryStatement.salaryComponent.netSalary.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right text-blue-600">
                    ₹{(salaryStatement.salaryComponent.netSalary * 12).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Employer Contribution */}
          <div className="bg-gray-100 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold mb-4">EMPLOYER CONTRIBUTION</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-gray-600 text-sm">Component</span>
                <p className="font-semibold">Employer PF</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Monthly</span>
                <p className="font-semibold">
                  ₹{salaryStatement.salaryComponent.employerPF.amount.toLocaleString()}
                  {salaryStatement.salaryComponent.employerPF.isPercentage && 
                    ` (${salaryStatement.salaryComponent.employerPF.percentage}%)`
                  }
                </p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Yearly</span>
                <p className="font-semibold">
                  ₹{(salaryStatement.salaryComponent.employerPF.amount * 12).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Total Cost to Company */}
          <div className="bg-blue-600 text-white rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Cost to Company (CTC)</p>
                <p className="text-xs opacity-75 mt-1">Net Salary + Employer PF</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  ₹{(salaryStatement.salaryComponent.netSalary + salaryStatement.salaryComponent.employerPF.amount).toLocaleString()} /month
                </p>
                <p className="text-lg">
                  ₹{((salaryStatement.salaryComponent.netSalary + salaryStatement.salaryComponent.employerPF.amount) * 12).toLocaleString()} /year
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-300 pt-4 mt-8">
            <p className="text-xs text-gray-600 text-center">
              This is a computer-generated salary statement and does not require a signature.
            </p>
            <p className="text-xs text-gray-600 text-center mt-1">
              Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}

      {!salaryStatement && !loading && (
        <div className="text-center text-gray-400 py-12">
          <p>Select an employee and year to generate salary statement report</p>
        </div>
      )}
    </div>
  );
};

export default SalaryStatementReport;
