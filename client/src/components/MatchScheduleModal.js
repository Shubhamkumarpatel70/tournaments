import React, { useState, useEffect } from 'react';
import Button from './Button';
import api from '../utils/api';

const MatchScheduleModal = ({ isOpen, onClose, onSuccess, schedule, matchSchedules, setMatchSchedules }) => {
  const [formData, setFormData] = useState({
    tournamentId: '',
    gameType: '',
    gameId: '',
    password: '',
    tournamentType: 'Squad',
    matchDate: ''
  });
  const [matchDateInput, setMatchDateInput] = useState(''); // For date picker (YYYY-MM-DDTHH:mm)
  const [tournaments, setTournaments] = useState([]);
  const [tournamentTypes, setTournamentTypes] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEditMode = !!schedule;

  useEffect(() => {
    if (isOpen) {
      fetchTournaments();
      if (schedule) {
        // Edit mode - populate form
        const matchDateValue = schedule.matchDate ? new Date(schedule.matchDate).toISOString().slice(0, 16) : '';
        const tournamentId = schedule.tournamentId?._id || schedule.tournamentId || '';
        setMatchDateInput(matchDateValue);
        setFormData({
          tournamentId: tournamentId,
          gameType: schedule.gameType || '',
          gameId: schedule.gameId || '',
          password: schedule.password || '',
          tournamentType: schedule.tournamentType || '',
          matchDate: matchDateValue
        });
      } else {
        // Create mode - reset form
        setMatchDateInput('');
        setSelectedTournament(null);
        setTournamentTypes([]);
        setFormData({
          tournamentId: '',
          gameType: '',
          gameId: '',
          password: '',
          tournamentType: '',
          matchDate: ''
        });
      }
    }
  }, [isOpen, schedule]);

  useEffect(() => {
    // When tournament is selected, fetch tournament types
    if (formData.tournamentId && tournaments.length > 0) {
      const tournament = tournaments.find(t => t._id === formData.tournamentId);
      if (tournament) {
        setSelectedTournament(tournament);
        fetchTournamentTypes(tournament.game);
        // Auto-fill gameType from tournament
        if (!formData.gameType || formData.gameType !== tournament.game) {
          setFormData(prev => ({ ...prev, gameType: tournament.game }));
        }
      }
    } else if (!formData.tournamentId) {
      setSelectedTournament(null);
      setTournamentTypes([]);
    }
  }, [formData.tournamentId, tournaments]);

  const fetchTournaments = async () => {
    try {
      const response = await api.get('/tournaments');
      setTournaments(response.data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const fetchTournamentTypes = async (game) => {
    try {
      if (!game) {
        setTournamentTypes([]);
        return;
      }
      const response = await api.get(`/tournament-types?game=${encodeURIComponent(game)}`);
      setTournamentTypes(response.data || []);
    } catch (error) {
      console.error('Error fetching tournament types:', error);
      setTournamentTypes([]);
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

  const handleMatchDateChange = (e) => {
    const value = e.target.value;
    setMatchDateInput(value);
    setFormData(prev => ({
      ...prev,
      matchDate: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.tournamentId || !formData.gameType || !formData.gameId || !formData.password || !formData.matchDate) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    try {
      // Convert datetime-local value to ISO string with timezone to prevent timezone shifts
      const convertToISO = (datetimeLocal) => {
        if (!datetimeLocal) return '';
        // datetime-local format: YYYY-MM-DDTHH:mm
        // Create Date object in local timezone, then convert to ISO string
        const date = new Date(datetimeLocal);
        return date.toISOString();
      };

      const submitData = {
        ...formData,
        matchDate: convertToISO(formData.matchDate) // Convert to ISO string with timezone
      };

      if (isEditMode) {
        await api.put(`/match-schedules/${schedule._id}`, submitData);
      } else {
        await api.post('/match-schedules', submitData);
      }
      onSuccess();
      setFormData({
        tournamentId: '',
        gameType: '',
        gameId: '',
        password: '',
        tournamentType: 'Squad',
        matchDate: ''
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} match schedule`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold neon-text-cyan">{isEditMode ? 'Edit' : 'Create'} Match Schedule</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-lava-orange transition-colors text-2xl">×</button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Tournament *</label>
            <select
              name="tournamentId"
              value={formData.tournamentId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
            >
              <option value="">Select Tournament</option>
              {tournaments.map(tournament => (
                <option key={tournament._id} value={tournament._id}>
                  {tournament.name} ({tournament.game})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Game Type *</label>
              <input
                type="text"
                name="gameType"
                value={formData.gameType}
                onChange={handleChange}
                required
                placeholder="e.g., BGMI, Free Fire"
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Tournament Type *</label>
              <select
                name="tournamentType"
                value={formData.tournamentType}
                onChange={handleChange}
                required
                disabled={!formData.tournamentId || tournamentTypes.length === 0}
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formData.tournamentId 
                    ? 'Select Tournament First' 
                    : tournamentTypes.length === 0 
                    ? 'Loading tournament types...' 
                    : 'Select Tournament Type'}
                </option>
                {tournamentTypes.map(type => (
                  <option key={type._id || type.name} value={type.name}>
                    {type.name}
                  </option>
                ))}
                {/* Ensure current value is in the list even if not in fetched types */}
                {formData.tournamentType && !tournamentTypes.some(t => t.name === formData.tournamentType) && (
                  <option value={formData.tournamentType}>
                    {formData.tournamentType}
                  </option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Game ID *</label>
            <input
              type="text"
              name="gameId"
              value={formData.gameId}
              onChange={handleChange}
              required
              placeholder="Enter game room ID"
              className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Password *</label>
            <input
              type="text"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter game room password"
              className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Match Date *</label>
            <div className="space-y-2">
              <input
                type="datetime-local"
                value={matchDateInput}
                onChange={handleMatchDateChange}
                required
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
              {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Schedule' : 'Create Schedule')}
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

export default MatchScheduleModal;

