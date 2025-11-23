import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const AllUserWallets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [walletUsers, setWalletUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = walletUsers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(walletUsers);
    }
  }, [searchQuery, walletUsers]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wallet/users');
      setWalletUsers(response.data || []);
      setFilteredUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 page-transition">
        <div className="max-w-7xl mx-auto text-center text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold neon-text-cyan">
            All User Wallets
          </h1>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>

        {/* Search Box */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-charcoal border border-lava-orange/30 rounded-lg px-4 py-3 text-off-white focus:border-lava-orange focus:outline-none"
          />
        </div>

        {/* Users Table */}
        <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-lava-orange/20">
                <tr>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((walletUser) => (
                    <tr key={walletUser._id} className="border-t border-lava-orange/10 hover:bg-lava-orange/5">
                      <td className="px-4 py-3">{walletUser.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{walletUser.email}</td>
                      <td className="px-4 py-3">
                        <span className="text-fiery-yellow font-bold">₹{(walletUser.wallet?.balance || 0).toLocaleString()}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllUserWallets;

