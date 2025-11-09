import { useNavigate } from 'react-router-dom';
import { FiUsers, FiLock, FiShield, FiBell, FiGlobe } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const settingsCards = [
    {
      title: 'Login Management',
      description: 'Manage employee login credentials and send login details via email',
      icon: FiUsers,
      color: 'blue',
      path: '/settings/login-management',
      roles: ['admin', 'hr'],
    },
    {
      title: 'Password Reset',
      description: 'Change your password with old password verification',
      icon: FiLock,
      color: 'green',
      path: '/settings/password-reset',
      roles: ['admin', 'hr', 'manager', 'employee', 'payroll'],
    },
    {
      title: 'Access Control',
      description: 'Manage user roles and permissions for different modules',
      icon: FiShield,
      color: 'purple',
      path: '/settings/access-control',
      roles: ['admin'],
    },
  ];

  const availableSettings = settingsCards.filter(setting => 
    setting.roles.includes(user?.role)
  );

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30',
      green: 'bg-green-500/20 text-green-400 hover:bg-green-500/30',
      purple: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableSettings.map((setting) => {
          const Icon = setting.icon;
          return (
            <button
              key={setting.path}
              onClick={() => navigate(setting.path)}
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-primary-500 transition-all text-left group"
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(setting.color)} transition-colors`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">
                    {setting.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {setting.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Settings;
