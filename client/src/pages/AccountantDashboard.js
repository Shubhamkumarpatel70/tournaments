import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const AccountantDashboard = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get('/payments');
        setPayments(response.data);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const totalPending = payments.reduce((sum, payment) => {
    return sum + (payment.stats?.totalEarnings || 0);
  }, 0);

  return (
    <div className="min-h-screen py-12 px-4 page-transition">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-2 neon-text-cyan">Payment Management</h1>
        <p className="text-gray-400 mb-8">Welcome, {user?.name} (Accountant)</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
            <div className="text-3xl font-bold text-lava-orange mb-2">
              {payments.length}
            </div>
            <div className="text-gray-400">Total Users with Earnings</div>
          </div>
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
            <div className="text-3xl font-bold text-fiery-yellow mb-2">
              ₹{totalPending.toLocaleString()}
            </div>
            <div className="text-gray-400">Total Pending Payments</div>
          </div>
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
            <div className="text-3xl font-bold text-lava-orange mb-2">
              ₹{(totalPending * 0.3).toLocaleString()}
            </div>
            <div className="text-gray-400">This Month Processed</div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-lava-orange">Payment Requests</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-lava-orange/20">
                  <tr>
                    <th className="px-6 py-4 text-left">User</th>
                    <th className="px-6 py-4 text-left">Email</th>
                    <th className="px-6 py-4 text-left">Total Earnings</th>
                    <th className="px-6 py-4 text-left">Tournaments</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id} className="border-t border-lava-orange/10 hover:bg-lava-orange/5">
                      <td className="px-6 py-4 font-bold">{payment.name}</td>
                      <td className="px-6 py-4 text-gray-400">{payment.email}</td>
                      <td className="px-6 py-4 text-fiery-yellow font-bold">
                        ₹{payment.stats?.totalEarnings?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-4">{payment.tournaments?.length || 0}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                          Pending
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="px-4 py-2 bg-lava-orange text-lava-black font-bold rounded-lg hover:bg-fiery-yellow transition-colors">
                          Process Payment
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No payment requests at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;

