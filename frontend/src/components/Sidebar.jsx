import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiLayers,
  FiClock,
  FiFileText,
  FiDollarSign,
  FiBarChart2,
  FiSettings,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard', roles: ['admin', 'hr', 'manager', 'employee'] },
    { path: '/employees', icon: FiUsers, label: 'Employees', roles: ['admin', 'hr', 'manager', 'employee'] },
    { path: '/attendance', icon: FiClock, label: 'Attendance', roles: ['admin', 'hr', 'manager', 'employee'] },
    { path: '/leave', icon: FiFileText, label: 'Time Off', roles: ['admin', 'hr', 'manager', 'employee'] },
    { path: '/payroll', icon: FiDollarSign, label: 'Payroll', roles: ['admin', 'payroll'] },
    { path: '/reports', icon: FiBarChart2, label: 'Reports', roles: ['admin', 'payroll'] },
    { path: '/settings', icon: FiSettings, label: 'Settings', roles: ['admin'] },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">W</span>
          </div>
          <div>
            <h1 className="text-lg font-bold">Company Name</h1>
            <p className="text-xs text-gray-400">& Logo</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 mt-6">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white border-l-4 border-primary-400'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="mr-3" size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
