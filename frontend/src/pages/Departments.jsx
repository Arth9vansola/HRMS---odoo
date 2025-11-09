import { useState, useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/departments');
      setDepartments(data.data);
    } catch (error) {
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
        <button className="btn btn-primary flex items-center">
          <FiPlus className="mr-2" />
          Add Department
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept._id} className="card hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900">{dept.name}</h3>
              <p className="text-gray-600 mt-2">{dept.description}</p>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Employees</p>
                    <p className="text-2xl font-bold">{dept.employeeCount}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      dept.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {dept.status}
                  </span>
                </div>
                
                {dept.manager && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">Manager</p>
                    <p className="font-medium">
                      {dept.manager.firstName} {dept.manager.lastName}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Departments;
