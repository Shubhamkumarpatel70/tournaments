import React, { useState, useEffect } from 'react';
import Button from './Button';
import api from '../utils/api';

const EditTeamModal = ({ isOpen, onClose, onSuccess, team }) => {
  const [formData, setFormData] = useState({
    name: '',
    game: 'BGMI',
    members: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        game: team.game,
        members: team.members.map(m => ({ 
          name: m.name, 
          gameId: m.gameId,
          phoneNumber: m.phoneNumber || '' 
        }))
      });
    }
  }, [team]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...formData.members];
    newMembers[index][field] = value;
    setFormData(prev => ({
      ...prev,
      members: newMembers
    }));
    setError('');
  };

  const addMember = () => {
    if (formData.members.length >= 4) {
      setError('Maximum 4 members allowed');
      return;
    }
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, { name: '', gameId: '', phoneNumber: '' }]
    }));
  };

  const removeMember = (index) => {
    if (formData.members.length <= 1) {
      setError('Team must have at least 1 member');
      return;
    }
    if (index === 0) {
      setError('Cannot remove team leader (Player 1).');
      return;
    }
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Team name is required');
      return false;
    }

    if (!formData.game) {
      setError('Please select a game');
      return false;
    }

    // Validate all members have name and gameId
    for (let i = 0; i < formData.members.length; i++) {
      const member = formData.members[i];
      if (!member.name.trim() || !member.gameId.trim()) {
        setError(`Name and Game ID are required for member ${i + 1}`);
        return false;
      }
    }
    
    // Validate team leader (Player 1) has phone number
    const teamLeader = formData.members[0];
    if (!teamLeader || !teamLeader.phoneNumber || !teamLeader.phoneNumber.trim()) {
      setError('Phone number is required for team leader (Player 1)');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.put(`/teams/${team._id}`, formData);
      onSuccess(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update team');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold neon-text-cyan">Edit Team</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-lava-orange transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Team Name */}
          <div>
            <label className="block text-sm font-bold mb-2">Team Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              placeholder="Enter team name"
            />
          </div>

          {/* Game Selection */}
          <div>
            <label className="block text-sm font-bold mb-2">Game *</label>
            <select
              name="game"
              value={formData.game}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
            >
              <option value="BGMI">BGMI</option>
              <option value="Free Fire">Free Fire</option>
            </select>
          </div>

          {/* Team Members */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold">Team Members (1-4) *</label>
              {formData.members.length < 4 && (
                <button
                  type="button"
                  onClick={addMember}
                  className="px-4 py-2 bg-lava-orange text-lava-black font-bold rounded-lg hover:bg-fiery-yellow transition-colors text-sm"
                >
                  + Add Member
                </button>
              )}
            </div>

            <div className="space-y-4">
              {formData.members.map((member, index) => (
                <div key={index} className={`bg-lava-black border rounded-lg p-4 ${index === 0 ? 'border-lava-orange border-2' : 'border-lava-orange/20'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lava-orange">Player {index + 1}</h3>
                      {index === 0 && (
                        <span className="bg-lava-orange text-lava-black px-2 py-0.5 rounded text-xs font-bold">Team Leader</span>
                      )}
                    </div>
                    {formData.members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMember(index)}
                        className="text-red-400 hover:text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className={`grid gap-4 ${index === 0 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-400">Name *</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-charcoal border border-lava-orange/20 rounded-lg text-off-white focus:outline-none focus:border-lava-orange text-sm"
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-400">Game ID *</label>
                      <input
                        type="text"
                        value={member.gameId}
                        onChange={(e) => handleMemberChange(index, 'gameId', e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-charcoal border border-lava-orange/20 rounded-lg text-off-white focus:outline-none focus:border-lava-orange text-sm"
                        placeholder="Game ID"
                      />
                    </div>
                    {index === 0 && (
                      <div>
                        <label className="block text-xs font-bold mb-1 text-gray-400">Phone Number * (Team Leader)</label>
                        <input
                          type="tel"
                          value={member.phoneNumber || ''}
                          onChange={(e) => handleMemberChange(index, 'phoneNumber', e.target.value)}
                          required
                          className="w-full px-3 py-2 bg-charcoal border border-lava-orange/20 rounded-lg text-off-white focus:outline-none focus:border-lava-orange text-sm"
                          placeholder="+91 1234567890"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
              {loading ? 'Updating...' : 'Update Team'}
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

export default EditTeamModal;
