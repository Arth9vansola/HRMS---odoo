import React from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user } = useAuth()

  // Mock data - will be replaced with real API calls later
  const metrics = {
    totalEmployees: 142,
    presentToday: 128,
    absentToday: 14,
    pendingLeaves: 8
  }

  const recentActivities = [
    { id: 1, type: 'Check-in', user: 'John Doe', time: '09:15 AM', date: 'Today' },
    { id: 2, type: 'Leave Applied', user: 'Jane Smith', time: '08:30 AM', date: 'Today' },
    { id: 3, type: 'Payslip Generated', user: 'Mike Johnson', time: 'Yesterday', date: '2:45 PM' },
    { id: 4, type: 'Check-out', user: 'Sarah Wilson', time: 'Yesterday', date: '6:00 PM' },
    { id: 5, type: 'Leave Approved', user: 'David Brown', time: '2 days ago', date: '11:20 AM' }
  ]

  const MetricCard = ({ title, value, color, icon }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${color}-500 hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
        </div>
        <div className={`text-${color}-500 text-2xl`}>{icon}</div>
      </div>
    </div>
  )

  const QuickActionButton = ({ title, description, color, onClick }) => (
    <button
      onClick={onClick}
      className={`bg-${color}-500 hover:bg-${color}-600 text-white p-4 rounded-lg shadow-md transition-colors w-full text-left`}
    >
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm opacity-90">{description}</p>
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.full_name || 'User'}!
          </h1>
          <p className="text-gray-600 mt-2">Here's what's happening at {user?.company_name || 'your company'} today.</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Employees"
            value={metrics.totalEmployees}
            color="blue"
            icon="👥"
          />
          <MetricCard
            title="Present Today"
            value={metrics.presentToday}
            color="green"
            icon="✅"
          />
          <MetricCard
            title="Absent Today"
            value={metrics.absentToday}
            color="red"
            icon="❌"
          />
          <MetricCard
            title="Pending Leaves"
            value={metrics.pendingLeaves}
            color="yellow"
            icon="📋"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activities</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Activity</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivities.map((activity) => (
                      <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{activity.type}</td>
                        <td className="py-3 px-4 text-gray-600">{activity.user}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{activity.time} - {activity.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-4">
                <QuickActionButton
                  title="Mark Attendance"
                  description="Clock in/out for today"
                  color="blue"
                  onClick={() => alert('Mark Attendance - Coming soon!')}
                />
                <QuickActionButton
                  title="Apply Leave"
                  description="Request time off"
                  color="green"
                  onClick={() => alert('Apply Leave - Coming soon!')}
                />
                <QuickActionButton
                  title="View Payslips"
                  description="Download salary slips"
                  color="purple"
                  onClick={() => alert('View Payslips - Coming soon!')}
                />
              </div>
            </div>

            {/* Company Logo (if available) */}
            {user?.company_logo && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Company</h3>
                <div className="flex items-center space-x-3">
                  <img 
                    src={user.company_logo} 
                    alt={user.company_name} 
                    className="h-12 w-12 object-contain rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{user.company_name}</p>
                    <p className="text-sm text-gray-600">Your Workplace</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
