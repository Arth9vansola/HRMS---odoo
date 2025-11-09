import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import {
  FiArrowLeft,
  FiPrinter,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiSave,
} from 'react-icons/fi';

const PayslipDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    fetchPayslip();
  }, [id]);

  const fetchPayslip = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/payroll/payslip/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPayslip(response.data);
    } catch (error) {
      console.error('Error fetching payslip:', error);
      toast.error('Failed to load payslip');
    } finally {
      setLoading(false);
    }
  };

  const handleCompute = async () => {
    try {
      setComputing(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/payroll/compute-payslip/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Payslip computed successfully');
      fetchPayslip();
    } catch (error) {
      console.error('Error computing payslip:', error);
      toast.error('Failed to compute payslip');
    } finally {
      setComputing(false);
    }
  };

  const handleValidate = async () => {
    try {
      setValidating(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/payroll/validate-payslip/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Payslip validated successfully');
      fetchPayslip();
    } catch (error) {
      console.error('Error validating payslip:', error);
      toast.error('Failed to validate payslip');
    } finally {
      setValidating(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Payslip_${payslip?.employeeName}_${payslip?.payPeriod}`,
  });

  const handleCancel = () => {
    navigate(-1);
  };

  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
    return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading payslip...</div>
      </div>
    );
  }

  if (!payslip) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Payslip not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Action Buttons */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={handleCancel}
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Back to Payrun
        </button>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCompute}
            disabled={computing || payslip.status === 'Done'}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={`mr-2 ${computing ? 'animate-spin' : ''}`} />
            {computing ? 'Computing...' : 'Compute'}
          </button>
          <button
            onClick={handleValidate}
            disabled={validating || payslip.status === 'Done'}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <FiCheck className="mr-2" />
            {validating ? 'Validating...' : 'Validate'}
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FiX className="mr-2" />
            Cancel
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FiPrinter className="mr-2" />
            Print
          </button>
        </div>
      </div>

      {/* Payslip Content */}
      <div ref={printRef} className="bg-white text-gray-900 rounded-lg p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="border-b-2 border-gray-300 pb-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                <span className="text-white font-bold text-2xl">W</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Company Name</h1>
                <p className="text-gray-600">& Logo</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-blue-600">SALARY SLIP</h2>
              <p className="text-gray-600">{payslip.payPeriod}</p>
            </div>
          </div>
        </div>

        {/* Employee Info */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="mb-3">
              <span className="text-gray-600 text-sm">Employee Name:</span>
              <p className="font-semibold">{payslip.employeeName}</p>
            </div>
            <div className="mb-3">
              <span className="text-gray-600 text-sm">Employee Code:</span>
              <p className="font-semibold">{payslip.employeeCode}</p>
            </div>
            <div className="mb-3">
              <span className="text-gray-600 text-sm">Designation:</span>
              <p className="font-semibold">{payslip.designation}</p>
            </div>
            <div className="mb-3">
              <span className="text-gray-600 text-sm">Department:</span>
              <p className="font-semibold">{payslip.department || 'N/A'}</p>
            </div>
          </div>
          <div>
            <div className="mb-3">
              <span className="text-gray-600 text-sm">Date of Joining:</span>
              <p className="font-semibold">{new Date(payslip.dateOfJoining).toLocaleDateString()}</p>
            </div>
            <div className="mb-3">
              <span className="text-gray-600 text-sm">PAN:</span>
              <p className="font-semibold">{payslip.pan || 'N/A'}</p>
            </div>
            <div className="mb-3">
              <span className="text-gray-600 text-sm">UAN:</span>
              <p className="font-semibold">{payslip.uan || 'N/A'}</p>
            </div>
            <div className="mb-3">
              <span className="text-gray-600 text-sm">Bank Account:</span>
              <p className="font-semibold">{payslip.bankAccount || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Attendance Info */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3">Attendance Details</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Days:</span>
              <p className="font-semibold">{payslip.totalDaysInMonth}</p>
            </div>
            <div>
              <span className="text-gray-600">Worked Days:</span>
              <p className="font-semibold">{payslip.workedDays}</p>
            </div>
            <div>
              <span className="text-gray-600">Paid Time Off:</span>
              <p className="font-semibold">{payslip.paidTimeOff || 0}</p>
            </div>
            <div>
              <span className="text-gray-600">Unpaid Leave:</span>
              <p className="font-semibold text-red-600">{payslip.unpaidLeave || 0}</p>
            </div>
          </div>
        </div>

        {/* Salary Computation Table */}
        <div className="mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 text-left">Earnings</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Rate %</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Amount (₹)</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Deductions</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Rate %</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Basic Salary</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                  {payslip.basicSalary?.toLocaleString()}
                </td>
                <td className="border border-gray-300 px-4 py-2">PF Employee</td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {payslip.employeePF?.rate || 0}%
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                  {payslip.employeePF?.amount?.toLocaleString() || '0'}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">House Rent Allowance</td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {payslip.hra?.rate || 0}%
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {payslip.hra?.amount?.toLocaleString() || '0'}
                </td>
                <td className="border border-gray-300 px-4 py-2">PF Employer</td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {payslip.employerPF?.rate || 0}%
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                  {payslip.employerPF?.amount?.toLocaleString() || '0'}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Standard Allowance</td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {payslip.standardAllowance?.rate || 0}%
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {payslip.standardAllowance?.amount?.toLocaleString() || '0'}
                </td>
                <td className="border border-gray-300 px-4 py-2">Professional Tax</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                  {payslip.professionalTax?.amount?.toLocaleString() || '0'}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Performance Bonus</td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {payslip.performanceBonus?.rate || 0}%
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {payslip.performanceBonus?.amount?.toLocaleString() || '0'}
                </td>
                <td className="border border-gray-300 px-4 py-2">TDS</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                  {payslip.tds?.amount?.toLocaleString() || '0'}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Leave Travel Allowance</td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {payslip.lta?.rate || 0}%
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {payslip.lta?.amount?.toLocaleString() || '0'}
                </td>
                <td className="border border-gray-300 px-4 py-2">Other Deductions</td>
                <td className="border border-gray-300 px-4 py-2 text-right">-</td>
                <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                  {payslip.otherDeductions?.amount?.toLocaleString() || '0'}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Fixed Allowance</td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {payslip.fixedAllowance?.rate || 0}%
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  {payslip.fixedAllowance?.amount?.toLocaleString() || '0'}
                </td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2"></td>
              </tr>
              <tr className="bg-blue-50 font-bold">
                <td className="border border-gray-300 px-4 py-2">GROSS SALARY</td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2 text-right text-blue-600">
                  ₹{payslip.grossSalary?.toLocaleString()}
                </td>
                <td className="border border-gray-300 px-4 py-2">TOTAL DEDUCTIONS</td>
                <td className="border border-gray-300 px-4 py-2"></td>
                <td className="border border-gray-300 px-4 py-2 text-right text-red-600">
                  ₹{payslip.totalDeductions?.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Net Salary */}
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">NET SALARY (Take Home)</span>
            <span className="text-2xl font-bold text-green-600">
              ₹{payslip.netSalary?.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            In Words: <span className="font-semibold">{numberToWords(Math.floor(payslip.netSalary))} Rupees Only</span>
          </p>
        </div>

        {/* Employer Cost */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Employer Cost (Including Employer PF)</span>
            <span className="text-lg font-bold">
              ₹{payslip.employerCost?.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 mt-8">
          <p className="text-xs text-gray-600 text-center">
            This is a computer-generated document and does not require a signature.
          </p>
          <p className="text-xs text-gray-600 text-center mt-1">
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PayslipDetails;
