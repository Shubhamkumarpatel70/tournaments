import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Button from './Button';

const ModeTypesManagement = () => {
  const [modeTypes, setModeTypes] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    game: '',
    description: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [typesRes, gamesRes] = await Promise.all([
        api.get('/mode-types/admin'),
        api.get('/games')
      ]);
      setModeTypes(typesRes.data || []);
      // Fetch all games (including inactive) for admin management
      setGames(gamesRes.data || []);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load data';
      setError(`Error: ${errorMessage}. Please make sure the server is running and restart if needed.`);
      setModeTypes([]);
      setGames([]);
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

    if (!formData.name.trim() || !formData.game) {
      setError('Name and game are required');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/mode-types/${editingId}`, formData);
      } else {
        await api.post('/mode-types', formData);
      }
      fetchData();
      setFormData({ name: '', game: '', description: '' });
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save mode type');
    }
  };

  const handleEdit = (type) => {
    setFormData({
      name: type.name,
      game: type.game,
      description: type.description || ''
    });
    setEditingId(type._id);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this mode type?')) {
      try {
        await api.delete(`/mode-types/${id}`);
        fetchData();
      } catch (error) {
        alert('Error deleting mode type');
      }
    }
  };

  const toggleActive = async (type) => {
    try {
      await api.put(`/mode-types/${type._id}`, {
        ...type,
        isActive: !type.isActive
      });
      fetchData();
    } catch (error) {
      alert('Error updating mode type');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading...</div>;
  }

  return (
    <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-lava-orange">Mode Types</h2>
        <Button
          variant="primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: '', game: '', description: '' });
            setError('');
          }}
        >
          {showForm ? 'Cancel' : '+ Add Mode Type'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-lava-black border border-lava-orange/20 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold mb-2">Mode Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-charcoal border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
                placeholder="e.g., Solo, Duo, Squad"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Game *</label>
              <select
                name="game"
                value={formData.game}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-charcoal border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              >
                <option value="">Select Game</option>
                {games.length > 0 ? (
                  games.map(game => (
                    <option key={game._id} value={game.name}>
                      {game.name} {!game.isActive ? '(Inactive)' : ''}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Loading games...</option>
                )}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2">Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-2 bg-charcoal border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
                placeholder="Mode type description"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Button type="submit" variant="primary">
              {editingId ? 'Update' : 'Add'} Mode Type
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingId(null);
                  setShowForm(false);
                  setFormData({ name: '', game: '', description: '' });
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modeTypes.map(type => (
          <div key={type._id} className="bg-lava-black border border-lava-orange/20 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-lg">{type.name}</h3>
                <p className="text-sm text-gray-400">{type.game}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                type.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {type.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {type.description && (
              <p className="text-sm text-gray-300 mb-3">{type.description}</p>
            )}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleEdit(type)}
                className="px-3 py-1 bg-lava-orange text-lava-black text-xs font-bold rounded hover:bg-fiery-yellow"
              >
                Edit
              </button>
              <button
                onClick={() => toggleActive(type)}
                className={`px-3 py-1 text-xs font-bold rounded ${
                  type.isActive
                    ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                }`}
              >
                {type.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handleDelete(type._id)}
                className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {modeTypes.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No mode types found. Add one to get started!</p>
        </div>
      )}
    </div>
  );
};

export default ModeTypesManagement;

