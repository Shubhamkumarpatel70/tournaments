import React, { useState, useEffect } from 'react';
import Button from './Button';
import api from '../utils/api';

const SendNotificationModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    target: 'all',
    targetUserId: '',
    showOnHome: false,
    isHomeNotification: false
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && formData.target === 'specific') {
      fetchUsers();
    }
  }, [isOpen, formData.target]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/leaderboard/top?limit=100');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.message) {
      setError('Title and message are required');
      return;
    }

    if (formData.target === 'specific' && !formData.targetUserId) {
      setError('Please select a user');
      return;
    }

    setLoading(true);

    try {
      await api.post('/notifications', formData);
      onSuccess();
      setFormData({
        title: '',
        message: '',
        type: 'info',
        target: 'all',
        targetUserId: '',
        showOnHome: false,
        isHomeNotification: false
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold neon-text-cyan">Send Notification</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-lava-orange transition-colors text-2xl">×</button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Message *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="announcement">Announcement</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Target *</label>
              <select
                name="target"
                value={formData.target}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              >
                <option value="all">All Users</option>
                <option value="user">Single User</option>
                <option value="specific">Specific User</option>
              </select>
            </div>
          </div>

          {formData.target === 'specific' && (
            <div>
              <label className="block text-sm font-bold mb-2">Select User *</label>
              <select
                name="targetUserId"
                value={formData.targetUserId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              >
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>{user.name || user.username} ({user.email})</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="showOnHome"
                checked={formData.showOnHome}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <label className="text-sm">Show on Home Page</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isHomeNotification"
                checked={formData.isHomeNotification}
                onChange={(e) => setFormData(prev => ({ ...prev, isHomeNotification: e.target.checked, showOnHome: e.target.checked }))}
                className="w-4 h-4"
              />
              <label className="text-sm font-bold text-lava-orange">Home Notification (Animated Banner)</label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
              {loading ? 'Sending...' : 'Send Notification'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendNotificationModal;

