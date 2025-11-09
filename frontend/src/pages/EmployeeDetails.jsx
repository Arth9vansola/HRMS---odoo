import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiPhone, FiCalendar, FiMapPin, FiUser, FiBriefcase, FiDollarSign } from 'react-icons/fi';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPublicView, setIsPublicView] = useState(false);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const { data } = await api.get(`/employees/${id}`);
      setEmployee(data.data);
      setIsPublicView(data.isPublicView || false);
    } catch (error) {
      toast.error('Failed to fetch employee details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!employee) {
    return <div className="text-center py-10">Employee not found</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/employees')}
        className="flex items-center text-gray-400 hover:text-white transition-colors"
      >
        <FiArrowLeft className="mr-2" />
        Back to Employees
      </button>

      {/* Header Card with Profile */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
        <div className="flex items-start space-x-6">
          {/* Profile Picture */}
          <div className="w-32 h-32 bg-primary-500 rounded-lg flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
            {employee.firstName[0]}{employee.lastName[0]}
          </div>
          
          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white">
                  {employee.firstName} {employee.lastName}
                </h2>
                <p className="text-gray-400 text-lg mt-1">{employee.designation}</p>
                <p className="text-gray-500 text-sm mt-1">{employee.employeeId}</p>
              </div>
              <span
                className={`px-4 py-2 rounded-lg font-medium ${
                  employee.status === 'Active'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {employee.status}
              </span>
            </div>
            
            {/* Quick Info */}
            <div className="grid grid-cols-3 gap-6 mt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                  <FiMail className="text-primary-500" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Email</p>
                  <p className="text-white text-sm">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                  <FiPhone className="text-primary-500" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Phone</p>
                  <p className="text-white text-sm">{employee.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                  <FiCalendar className="text-primary-500" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Joining Date</p>
                  <p className="text-white text-sm">{format(new Date(employee.joiningDate), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <FiUser className="text-primary-500" size={20} />
            </div>
            <h3 className="text-xl font-semibold text-white">Personal Information</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Full Name</span>
              <span className="text-white font-medium">{employee.firstName} {employee.lastName}</span>
            </div>
            {!isPublicView && employee.dateOfBirth && (
              <div className="flex justify-between py-3 border-b border-gray-700">
                <span className="text-gray-400">Date of Birth</span>
                <span className="text-white font-medium">{format(new Date(employee.dateOfBirth), 'MMM dd, yyyy')}</span>
              </div>
            )}
            {!isPublicView && employee.gender && (
              <div className="flex justify-between py-3 border-b border-gray-700">
                <span className="text-gray-400">Gender</span>
                <span className="text-white font-medium">{employee.gender}</span>
              </div>
            )}
            <div className="flex justify-between py-3">
              <span className="text-gray-400">Employee ID</span>
              <span className="text-white font-medium">{employee.employeeId}</span>
            </div>
          </div>
        </div>

        {/* Work Information Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <FiBriefcase className="text-primary-500" size={20} />
            </div>
            <h3 className="text-xl font-semibold text-white">Work Information</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Department</span>
              <span className="text-white font-medium">{employee.department?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Designation</span>
              <span className="text-white font-medium">{employee.designation}</span>
            </div>
            {!isPublicView && employee.role && (
              <div className="flex justify-between py-3 border-b border-gray-700">
                <span className="text-gray-400">Role</span>
                <span className="text-white font-medium capitalize">{employee.role}</span>
              </div>
            )}
            {!isPublicView && employee.employmentType && (
              <div className="flex justify-between py-3">
                <span className="text-gray-400">Employment Type</span>
                <span className="text-white font-medium">{employee.employmentType}</span>
              </div>
            )}
            {isPublicView && (
              <div className="flex justify-between py-3">
                <span className="text-gray-400">Status</span>
                <span className="text-white font-medium">{employee.status}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <FiMapPin className="text-primary-500" size={20} />
            </div>
            <h3 className="text-xl font-semibold text-white">Contact Information</h3>
          </div>
          
          <div className="space-y-4">
            <div className="py-3 border-b border-gray-700">
              <span className="text-gray-400 block mb-2">Email Address</span>
              <span className="text-white font-medium">{employee.email}</span>
            </div>
            <div className={`py-3 ${!isPublicView ? 'border-b border-gray-700' : ''}`}>
              <span className="text-gray-400 block mb-2">Phone Number</span>
              <span className="text-white font-medium">{employee.phone}</span>
            </div>
            {!isPublicView && employee.address && (
              <div className="py-3">
                <span className="text-gray-400 block mb-2">Address</span>
                <span className="text-white font-medium">
                  {employee.address?.street}, {employee.address?.city}, {employee.address?.state} {employee.address?.zipCode}, {employee.address?.country}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Financial Information Card - Only show for non-public view */}
        {!isPublicView && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <FiDollarSign className="text-primary-500" size={20} />
              </div>
              <h3 className="text-xl font-semibold text-white">Financial Information</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-700">
                <span className="text-gray-400">Salary</span>
                <span className="text-white font-medium">${employee.salary?.toLocaleString()}</span>
              </div>
              {employee.bankDetails && (
                <>
                  <div className="flex justify-between py-3 border-b border-gray-700">
                    <span className="text-gray-400">Bank Name</span>
                    <span className="text-white font-medium">{employee.bankDetails.bankName}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-700">
                    <span className="text-gray-400">Account Number</span>
                    <span className="text-white font-medium">****{employee.bankDetails.accountNumber.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-gray-400">IFSC Code</span>
                    <span className="text-white font-medium">{employee.bankDetails.ifscCode}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Emergency Contact Card - Only show for non-public view */}
      {!isPublicView && employee.emergencyContact && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-400 text-sm mb-2">Contact Name</p>
              <p className="text-white font-medium">{employee.emergencyContact.name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Relationship</p>
              <p className="text-white font-medium">{employee.emergencyContact.relationship}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Phone Number</p>
              <p className="text-white font-medium">{employee.emergencyContact.phone}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;
