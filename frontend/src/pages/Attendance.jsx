import { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(null);

  useEffect(() => {
    fetchAttendance();
    checkTodayAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const { data } = await api.get('/attendance');
      setAttendance(data.data);
    } catch (error) {
      toast.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const checkTodayAttendance = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data } = await api.get('/attendance', {
        params: {
          startDate: today,
          endDate: today,
        },
      });
      
      // Filter for current user's attendance (backend might return multiple if admin/hr)
      const myAttendance = data.data.find(record => {
        if (record.employee._id === user.id || record.employee === user.id) {
          return true;
        }
        return false;
      });
      
      setTodayAttendance(myAttendance || null);
    } catch (error) {
      console.error('Error checking today attendance', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      const { data } = await api.post('/attendance/checkin');
      toast.success('Checked in successfully!');
      setTodayAttendance(data.data); // Set the returned attendance record
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      const { data } = await api.post('/attendance/checkout');
      toast.success('Checked out successfully!');
      setTodayAttendance(data.data); // Update with checkout time
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check out');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>

      {/* Check In/Out Card */}
      {user?.role === 'employee' && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Today's Attendance</h3>
              <p className="text-gray-600 mt-1">
                {format(new Date(), 'EEEE, MMMM dd, yyyy')}
              </p>
            </div>
            <div className="flex space-x-4">
              {!todayAttendance ? (
                <button
                  onClick={handleCheckIn}
                  className="btn btn-success flex items-center"
                >
                  <FiClock className="mr-2" />
                  Check In
                </button>
              ) : todayAttendance.checkOut ? (
                <div className="text-green-600 font-semibold">
                  ✓ Completed for today
                </div>
              ) : (
                <button
                  onClick={handleCheckOut}
                  className="btn btn-danger flex items-center"
                >
                  <FiClock className="mr-2" />
                  Check Out
                </button>
              )}
            </div>
          </div>
          
          {todayAttendance && (
            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Check In</p>
                <p className="font-semibold">
                  {todayAttendance.checkIn 
                    ? format(new Date(todayAttendance.checkIn), 'hh:mm a')
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Check Out</p>
                <p className="font-semibold">
                  {todayAttendance.checkOut
                    ? format(new Date(todayAttendance.checkOut), 'hh:mm a')
                    : 'Pending...'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Work Hours</p>
                <p className="font-semibold">
                  {todayAttendance.workHours ? `${todayAttendance.workHours} hrs` : 'In Progress...'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Attendance Records */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Attendance Records</h3>
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Date</th>
                  {user?.role !== 'employee' && (
                    <th className="text-left py-3 px-4">Employee</th>
                  )}
                  <th className="text-left py-3 px-4">Check In</th>
                  <th className="text-left py-3 px-4">Check Out</th>
                  <th className="text-left py-3 px-4">Work Hours</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record._id} className="border-b">
                    <td className="py-3 px-4">
                      {format(new Date(record.date), 'MMM dd, yyyy')}
                    </td>
                    {user?.role !== 'employee' && (
                      <td className="py-3 px-4">
                        {record.employee?.firstName} {record.employee?.lastName}
                      </td>
                    )}
                    <td className="py-3 px-4">
                      {record.checkIn
                        ? format(new Date(record.checkIn), 'hh:mm a')
                        : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {record.checkOut
                        ? format(new Date(record.checkOut), 'hh:mm a')
                        : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {record.workHours ? `${record.workHours} hrs` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          record.status === 'Present'
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'Absent'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
