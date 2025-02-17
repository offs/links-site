'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [globalSettings, setGlobalSettings] = useState({ registrationEnabled: true });

  const fetchUsers = useCallback(async () => {
    try {
      const [usersRes, settingsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/settings')
      ]);
      
      if (!usersRes.ok) {
        if (usersRes.status === 403) {
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch users');
      }

      const [userData, settingsData] = await Promise.all([
        usersRes.json(),
        settingsRes.json()
      ]);

      setUsers(userData);
      setGlobalSettings(settingsData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    fetchUsers();
  }, [status, router, fetchUsers]);

  const toggleRegistration = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          registrationEnabled: !globalSettings.registrationEnabled 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update registration status');
      }
      
      setGlobalSettings(prev => ({ 
        ...prev, 
        registrationEnabled: !prev.registrationEnabled 
      }));
    } catch (error) {
      setError(error.message);
    }
  };

  const toggleAdmin = async (userId, isAdmin) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isAdmin }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      
      await fetchUsers();
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      await fetchUsers();
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1625]">
        <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1625] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={toggleRegistration}
            className={`px-4 py-2 rounded-lg transition-colors ${
              globalSettings.registrationEnabled
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            {globalSettings.registrationEnabled ? 'Disable Registration' : 'Enable Registration'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="bg-white/5 rounded-xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-white/70">
                  <th className="p-2">Username</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Created At</th>
                  <th className="p-2">Admin</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t border-white/10 text-white">
                    <td className="p-2">{user.username}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => toggleAdmin(user._id, !user.isAdmin)}
                        className={`px-2 py-1 rounded ${
                          user.isAdmin
                            ? 'bg-violet-500/20 text-violet-300'
                            : 'bg-white/10 text-white/70'
                        }`}
                      >
                        {user.isAdmin ? 'Admin' : 'User'}
                      </button>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
