import React from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      {/* Will add full UI in Phase 8 */}
      <div className="bg-white p-4 rounded shadow">
        <p className="mb-2">Welcome, {user?.full_name || 'User'}!</p>
        <p className="text-gray-600">Profile page - Coming soon</p>
      </div>
    </div>
  );
}
