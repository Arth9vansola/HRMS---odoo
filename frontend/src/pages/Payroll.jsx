import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Payroll = () => {
  const { user } = useAuth();
  
  // Check if user has access to payroll
  if (user?.role !== 'admin' && user?.role !== 'payroll') {
    return <Navigate to="/dashboard" replace />;
  }
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const { data } = await api.get('/payroll');
      setPayrolls(data.data);
    } catch (error) {
      toast.error('Failed to fetch payroll data');
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[month - 1];
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  {user?.role !== 'employee' && (
                    <th className="text-left py-3 px-4">Employee</th>
                  )}
                  <th className="text-left py-3 px-4">Month</th>
                  <th className="text-left py-3 px-4">Year</th>
                  <th className="text-left py-3 px-4">Basic Salary</th>
                  <th className="text-left py-3 px-4">Gross Salary</th>
                  <th className="text-left py-3 px-4">Deductions</th>
                  <th className="text-left py-3 px-4">Net Salary</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((payroll) => {
                  const totalDeductions = Object.values(payroll.deductions || {}).reduce(
                    (sum, val) => sum + val,
                    0
                  );
                  return (
                    <tr key={payroll._id} className="border-b">
                      {user?.role !== 'employee' && (
                        <td className="py-3 px-4">
                          {payroll.employee?.firstName} {payroll.employee?.lastName}
                        </td>
                      )}
                      <td className="py-3 px-4">{getMonthName(payroll.month)}</td>
                      <td className="py-3 px-4">{payroll.year}</td>
                      <td className="py-3 px-4">
                        ${payroll.basicSalary.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        ${payroll.grossSalary.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-red-600">
                        -${totalDeductions.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        ${payroll.netSalary.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            payroll.status === 'Paid'
                              ? 'bg-green-100 text-green-800'
                              : payroll.status === 'Processed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {payroll.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedPayroll(payroll)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payroll Details Modal */}
      {selectedPayroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Payroll Details</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {user?.role !== 'employee' && (
                  <div>
                    <p className="text-gray-600">Employee</p>
                    <p className="font-semibold">
                      {selectedPayroll.employee?.firstName}{' '}
                      {selectedPayroll.employee?.lastName}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600">Period</p>
                  <p className="font-semibold">
                    {getMonthName(selectedPayroll.month)} {selectedPayroll.year}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Salary Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Basic Salary</span>
                    <span>${selectedPayroll.basicSalary.toLocaleString()}</span>
                  </div>
                  
                  {selectedPayroll.allowances && (
                    <>
                      <p className="font-medium mt-3">Allowances</p>
                      {Object.entries(selectedPayroll.allowances).map(
                        ([key, value]) =>
                          value > 0 && (
                            <div key={key} className="flex justify-between pl-4">
                              <span className="capitalize">{key}</span>
                              <span className="text-green-600">
                                +${value.toLocaleString()}
                              </span>
                            </div>
                          )
                      )}
                    </>
                  )}

                  {selectedPayroll.bonus > 0 && (
                    <div className="flex justify-between">
                      <span>Bonus</span>
                      <span className="text-green-600">
                        +${selectedPayroll.bonus.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {selectedPayroll.overtime?.amount > 0 && (
                    <div className="flex justify-between">
                      <span>Overtime ({selectedPayroll.overtime.hours} hrs)</span>
                      <span className="text-green-600">
                        +${selectedPayroll.overtime.amount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Gross Salary</span>
                    <span>${selectedPayroll.grossSalary.toLocaleString()}</span>
                  </div>

                  {selectedPayroll.deductions && (
                    <>
                      <p className="font-medium mt-3">Deductions</p>
                      {Object.entries(selectedPayroll.deductions).map(
                        ([key, value]) =>
                          value > 0 && (
                            <div key={key} className="flex justify-between pl-4">
                              <span className="capitalize">{key}</span>
                              <span className="text-red-600">
                                -${value.toLocaleString()}
                              </span>
                            </div>
                          )
                      )}
                    </>
                  )}

                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Net Salary</span>
                    <span>${selectedPayroll.netSalary.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Working Days</p>
                    <p className="font-semibold">{selectedPayroll.workingDays}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Present Days</p>
                    <p className="font-semibold">{selectedPayroll.presentDays}</p>
                  </div>
                  {selectedPayroll.paymentDate && (
                    <div>
                      <p className="text-gray-600">Payment Date</p>
                      <p className="font-semibold">
                        {new Date(selectedPayroll.paymentDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {selectedPayroll.paymentMethod && (
                    <div>
                      <p className="text-gray-600">Payment Method</p>
                      <p className="font-semibold">
                        {selectedPayroll.paymentMethod}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedPayroll(null)}
              className="btn btn-secondary w-full mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
