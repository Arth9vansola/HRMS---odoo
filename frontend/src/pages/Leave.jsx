import { useState, useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const Leave = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const { data } = await api.get('/leave');
      setLeaves(data.data);
    } catch (error) {
      toast.error('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leave', formData);
      toast.success('Leave request submitted successfully!');
      setShowModal(false);
      setFormData({
        leaveType: 'Casual Leave',
        startDate: '',
        endDate: '',
        reason: '',
      });
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/leave/${id}/approve`);
      toast.success('Leave request approved!');
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to approve leave request');
    }
  };

  const handleReject = async (id) => {
    const rejectionReason = prompt('Enter rejection reason:');
    if (!rejectionReason) return;

    try {
      await api.put(`/leave/${id}/reject`, { rejectionReason });
      toast.success('Leave request rejected!');
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to reject leave request');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center"
        >
          <FiPlus className="mr-2" />
          Apply for Leave
        </button>
      </div>

      {/* Leave Requests Table */}
      <div className="card">
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  {user?.role !== 'employee' && (
                    <th className="text-left py-3 px-4">Employee</th>
                  )}
                  <th className="text-left py-3 px-4">Leave Type</th>
                  <th className="text-left py-3 px-4">Start Date</th>
                  <th className="text-left py-3 px-4">End Date</th>
                  <th className="text-left py-3 px-4">Days</th>
                  <th className="text-left py-3 px-4">Status</th>
                  {(user?.role === 'hr' || user?.role === 'admin' || user?.role === 'manager') && (
                    <th className="text-left py-3 px-4">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id} className="border-b">
                    {user?.role !== 'employee' && (
                      <td className="py-3 px-4">
                        {leave.employee?.firstName} {leave.employee?.lastName}
                      </td>
                    )}
                    <td className="py-3 px-4">{leave.leaveType}</td>
                    <td className="py-3 px-4">
                      {format(new Date(leave.startDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3 px-4">
                      {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3 px-4">{leave.numberOfDays}</td>
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
                    {(user?.role === 'hr' || user?.role === 'admin' || user?.role === 'manager') &&
                      leave.status === 'Pending' && (
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleApprove(leave._id)}
                            className="text-green-600 hover:text-green-800 mr-3"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(leave._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Reject
                          </button>
                        </td>
                      )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Apply for Leave</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Leave Type</label>
                <select
                  className="input"
                  value={formData.leaveType}
                  onChange={(e) =>
                    setFormData({ ...formData, leaveType: e.target.value })
                  }
                  required
                >
                  <option>Casual Leave</option>
                  <option>Sick Leave</option>
                  <option>Annual Leave</option>
                  <option>Maternity Leave</option>
                  <option>Paternity Leave</option>
                  <option>Unpaid Leave</option>
                </select>
              </div>

              <div>
                <label className="label">Start Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="label">End Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="label">Reason</label>
                <textarea
                  className="input"
                  rows="4"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  required
                ></textarea>
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="btn btn-primary flex-1">
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave;
