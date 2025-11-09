import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus } from 'react-icons/fi';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const EmployeeCard = ({ employee }) => {
  // Determine attendance status indicator
  // This is a demo - you can enhance with real attendance data
  const getStatusIndicator = () => {
    // Random status for demo - replace with actual attendance check
    const statuses = ['present', 'leave', 'absent'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    switch (randomStatus) {
      case 'present':
        return (
          <div className="absolute top-3 right-3 group">
            <div className="w-3 h-3 bg-green-500 rounded-full" title="Present"></div>
            <span className="absolute top-5 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Present
            </span>
          </div>
        );
      case 'leave':
        return (
          <div className="absolute top-3 right-3 group">
            <div className="w-5 h-5 flex items-center justify-center text-blue-400 text-sm" title="On Leave">
              ✈️
            </div>
            <span className="absolute top-7 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              On Leave
            </span>
          </div>
        );
      case 'absent':
        return (
          <div className="absolute top-3 right-3 group">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" title="Absent"></div>
            <span className="absolute top-5 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Absent
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Link to={`/employees/${employee._id}`}>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-primary-500 transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/20 relative">
        {/* Status Indicator */}
        {getStatusIndicator()}
        
        <div className="flex flex-col items-center">
          {/* Profile Picture */}
          <div className="w-20 h-20 bg-primary-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold mb-3">
            {employee.firstName[0]}{employee.lastName[0]}
          </div>
          
          {/* Employee Name */}
          <h3 className="text-white font-medium text-center">
            {employee.firstName} {employee.lastName}
          </h3>
          
          {/* Employee ID or Designation */}
          <p className="text-gray-400 text-sm mt-1">{employee.designation}</p>
          <p className="text-gray-500 text-xs mt-1">{employee.employeeId}</p>
        </div>
      </div>
    </Link>
  );
};

const EmployeesLanding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchEmployees();
  }, [search, currentPage]);

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/employees', {
        params: { search, page: currentPage, limit: 12 },
      });
      setEmployees(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium">
            VIEW
          </button>
          {(user?.role === 'admin' || user?.role === 'hr') && (
            <button 
              onClick={() => navigate('/employees/add')}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 flex items-center"
            >
              <FiPlus className="mr-2" />
              Add Employee
            </button>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="relative w-96">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Employee Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : employees.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No employees found</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {employees.map((employee) => (
              <EmployeeCard key={employee._id} employee={employee} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-white">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmployeesLanding;
