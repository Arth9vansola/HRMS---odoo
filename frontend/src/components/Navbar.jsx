import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  // Base navigation items for all users
  const baseNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ]

  // Role-based navigation items
  const getNavItems = () => {
    let items = [...baseNavItems]
    
    if (user?.role === 'Admin') {
      items.splice(1, 0, 
        { path: '/employees', label: 'Employees', icon: '👥' },
        { path: '/attendance', label: 'Attendance', icon: '📅' },
        { path: '/leaves', label: 'Leaves', icon: '📋' },
        { path: '/payroll', label: 'Payroll', icon: '💰' }
      )
    } else if (user?.role === 'HR Officer') {
      items.splice(1, 0,
        { path: '/attendance', label: 'Attendance', icon: '📅' },
        { path: '/leaves', label: 'Leaves', icon: '📋' }
      )
    } else if (user?.role === 'Payroll Officer') {
      items.splice(1, 0,
        { path: '/payroll', label: 'Payroll', icon: '💰' }
      )
    }
    
    return items
  }

  const navItems = getNavItems()

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <div className="flex items-center space-x-3">
            {user?.company_logo && (
              <img 
                src={user.company_logo} 
                alt="Company Logo" 
                className="h-8 w-8 object-contain rounded"
              />
            )}
            <Link to="/dashboard" className="text-xl font-bold hover:text-blue-300 transition-colors">
              {user?.company_name || 'WorkZen HRMS'}
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-gray-700 text-blue-300'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{user?.full_name || 'User'}</p>
              <p className="text-xs text-gray-400">{user?.role || 'Employee'}</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className="md:hidden pb-3">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive(item.path)
                    ? 'bg-gray-700 text-blue-300'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
