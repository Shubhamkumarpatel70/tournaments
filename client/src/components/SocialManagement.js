import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Button from './Button';

const SocialManagement = () => {
  const [socials, setSocials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    link: '',
    order: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/socials/all');
      setSocials(res.data || []);
      setError('');
    } catch (error) {
      console.error('Error fetching social links:', error);
      setError(error.response?.data?.error || 'Failed to load social links');
      setSocials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.icon.trim() || !formData.link.trim()) {
      setError('Name, icon, and link are required');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/socials/${editingId}`, formData);
      } else {
        await api.post('/socials', formData);
      }
      fetchData();
      setFormData({
        name: '',
        icon: '',
        link: '',
        order: 0
      });
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save social link');
    }
  };

  const handleEdit = (social) => {
    setFormData({
      name: social.name || '',
      icon: social.icon || '',
      link: social.link || '',
      order: social.order || 0
    });
    setEditingId(social._id);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this social link?')) {
      try {
        await api.delete(`/socials/${id}`);
        fetchData();
      } catch (error) {
        alert('Error deleting social link');
      }
    }
  };

  const toggleActive = async (social) => {
    try {
      await api.put(`/socials/${social._id}`, {
        isActive: !social.isActive
      });
      fetchData();
    } catch (error) {
      alert('Error updating social link');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading social links...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-lava-orange">Social Media Management</h2>
        <Button
          variant="primary"
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setFormData({
                name: '',
                icon: '',
                link: '',
                order: 0
              });
              setEditingId(null);
            }
          }}
        >
          {showForm ? 'Cancel' : '+ Add Social Link'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-lava-orange mb-4">
            {editingId ? 'Edit Social Link' : 'Add New Social Link'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Social Media Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Instagram, Facebook, Twitter"
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Icon (SVG or Emoji) *</label>
              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                required
                placeholder="📷 or SVG code"
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter an emoji (e.g., 📷) or SVG code for the icon
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Link *</label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                required
                placeholder="https://www.instagram.com/arena_ofchampions/"
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              />
            </div>

            <Button type="submit" variant="primary">
              {editingId ? 'Update' : 'Create'} Social Link
            </Button>
          </form>
        </div>
      )}

      <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-lava-orange mb-4">Social Links</h3>
        {socials.length === 0 ? (
          <p className="text-gray-400">No social links found</p>
        ) : (
          <div className="space-y-4">
            {socials.map((social) => (
              <div
                key={social._id}
                className="bg-lava-black border border-lava-orange/20 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {social.icon.startsWith('<svg') ? (
                        <div className="w-6 h-6" dangerouslySetInnerHTML={{ __html: social.icon }} />
                      ) : (
                        <span className="text-2xl">{social.icon}</span>
                      )}
                      <h4 className="text-lg font-bold text-off-white">{social.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        social.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {social.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <a
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lava-orange hover:text-fiery-yellow text-sm break-all"
                    >
                      {social.link}
                    </a>
                    <p className="text-xs text-gray-500 mt-2">Order: {social.order}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(social)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(social)}
                      className={`px-3 py-1 text-sm rounded ${
                        social.isActive
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {social.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(social._id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialManagement;

