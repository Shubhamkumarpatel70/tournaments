import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Button from './Button';

const TeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    description: '',
    socialLinks: [{ platform: '', url: '' }],
    image: '',
    order: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/teams/all');
      setTeamMembers(res.data || []);
      setError('');
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError(error.response?.data?.error || 'Failed to load team members');
      setTeamMembers([]);
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

  const handleSocialLinkChange = (index, field, value) => {
    const newSocialLinks = [...formData.socialLinks];
    newSocialLinks[index][field] = value;
    setFormData(prev => ({
      ...prev,
      socialLinks: newSocialLinks
    }));
  };

  const addSocialLink = () => {
    setFormData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: '', url: '' }]
    }));
  };

  const removeSocialLink = (index) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.position.trim()) {
      setError('Name and position are required');
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        socialLinks: formData.socialLinks.filter(link => link.platform && link.url)
      };

      if (editingId) {
        await api.put(`/teams/${editingId}`, dataToSend);
      } else {
        await api.post('/teams', dataToSend);
      }
      fetchData();
      setFormData({
        name: '',
        position: '',
        description: '',
        socialLinks: [{ platform: '', url: '' }],
        image: '',
        order: 0
      });
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save team member');
    }
  };

  const handleEdit = (member) => {
    setFormData({
      name: member.name || '',
      position: member.position || '',
      description: member.description || '',
      socialLinks: member.socialLinks && member.socialLinks.length > 0 
        ? member.socialLinks 
        : [{ platform: '', url: '' }],
      image: member.image || '',
      order: member.order || 0
    });
    setEditingId(member._id);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        await api.delete(`/teams/${id}`);
        fetchData();
      } catch (error) {
        alert('Error deleting team member');
      }
    }
  };

  const toggleActive = async (member) => {
    try {
      await api.put(`/teams/${member._id}`, {
        isActive: !member.isActive
      });
      fetchData();
    } catch (error) {
      alert('Error updating team member');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading team members...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-lava-orange">Team Management</h2>
        <Button
          variant="primary"
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setFormData({
                name: '',
                position: '',
                description: '',
                socialLinks: [{ platform: '', url: '' }],
                image: '',
                order: 0
              });
              setEditingId(null);
            }
          }}
        >
          {showForm ? 'Cancel' : '+ Add Team Member'}
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
            {editingId ? 'Edit Team Member' : 'Add New Team Member'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Position *</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Image URL</label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
                placeholder="https://example.com/image.jpg"
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

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold">Social Links</label>
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="text-sm text-lava-orange hover:text-fiery-yellow"
                >
                  + Add Link
                </button>
              </div>
              {formData.socialLinks.map((link, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Platform (e.g., Instagram)"
                    value={link.platform}
                    onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                    className="flex-1 px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    value={link.url}
                    onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                    className="flex-1 px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
                  />
                  {formData.socialLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSocialLink(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <Button type="submit" variant="primary">
              {editingId ? 'Update' : 'Create'} Team Member
            </Button>
          </form>
        </div>
      )}

      <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-lava-orange mb-4">Team Members</h3>
        {teamMembers.length === 0 ? (
          <p className="text-gray-400">No team members found</p>
        ) : (
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div
                key={member._id}
                className="bg-lava-black border border-lava-orange/20 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-bold text-off-white">{member.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        member.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-lava-orange font-semibold mb-1">{member.position}</p>
                    {member.description && (
                      <p className="text-gray-300 text-sm mb-2">{member.description}</p>
                    )}
                    {member.socialLinks && member.socialLinks.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {member.socialLinks.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-lava-orange hover:text-fiery-yellow"
                          >
                            {link.platform}
                          </a>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Order: {member.order}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(member)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(member)}
                      className={`px-3 py-1 text-sm rounded ${
                        member.isActive
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {member.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(member._id)}
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

export default TeamManagement;

