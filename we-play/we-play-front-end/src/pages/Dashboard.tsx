import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <button
                onClick={logout}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* User Info Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                <h2 className="text-xl font-semibold text-blue-900 mb-4">User Information</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-blue-700">Username</p>
                    <p className="text-lg font-medium">{user?.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Email</p>
                    <p className="text-lg font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">User ID</p>
                    <p className="text-lg font-medium font-mono">{user?.id}</p>
                  </div>
                </div>
              </div>
              
              {/* Stats Card */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                <h2 className="text-xl font-semibold text-purple-900 mb-4">Your Stats</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-700">Games Played</span>
                    <span className="text-2xl font-bold text-purple-900">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-700">Tournaments</span>
                    <span className="text-2xl font-bold text-purple-900">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-700">Friends</span>
                    <span className="text-2xl font-bold text-purple-900">0</span>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                <h2 className="text-xl font-semibold text-green-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Join Tournament
                  </button>
                  <button className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors">
                    Create Team
                  </button>
                  <button className="w-full bg-green-400 text-white py-2 rounded-lg hover:bg-green-500 transition-colors">
                    Invite Friends
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;