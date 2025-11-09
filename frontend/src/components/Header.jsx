import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiLogOut, FiClock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Header = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'employee') {
      checkTodayAttendance();
    }
  }, [user]);

  const checkTodayAttendance = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data } = await api.get('/attendance', {
        params: {
          startDate: today,
          endDate: today,
        },
      });
      if (data.data.length > 0) {
        setTodayAttendance(data.data[0]);
      }
    } catch (error) {
      console.error('Error checking today attendance');
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await api.post('/attendance/checkin');
      toast.success('Checked in successfully!');
      checkTodayAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      await api.post('/attendance/checkout');
      toast.success('Checked out successfully!');
      checkTodayAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Welcome back, {user?.firstName}!
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Check-in/Check-out Button for Employees */}
          {user?.role === 'employee' && (
            <div className="flex items-center space-x-3">
              {!todayAttendance ? (
                <button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
                >
                  <FiClock size={18} />
                  <span>Check-Out</span>
                </button>
              ) : (
                <button
                  onClick={handleCheckOut}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
                >
                  <FiClock size={18} />
                  <span>Check-In</span>
                </button>
              )}
            </div>
          )}
          
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white"
            >
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <span className="font-medium">{user?.firstName} {user?.lastName}</span>
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 z-10">
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setShowDropdown(false)}
                >
                  <FiUser className="mr-2" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <FiLogOut className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
