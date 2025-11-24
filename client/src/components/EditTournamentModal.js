import React, { useState, useEffect } from 'react';
import Button from './Button';
import api from '../utils/api';

const EditTournamentModal = ({ isOpen, onClose, tournament, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    game: '',
    tournamentType: '',
    mode: '',
    date: '',
    matchDate: '',
    registrationDeadline: '',
    entryFee: '',
    prizePool: '',
    playerSpots: '',
    maxTeams: '',
    description: '',
    featured: false,
    status: 'upcoming'
  });
  const [games, setGames] = useState([]);
  const [tournamentTypes, setTournamentTypes] = useState([]);
  const [modeTypes, setModeTypes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dateInput, setDateInput] = useState('');
  const [matchDateInput, setMatchDateInput] = useState('');

  useEffect(() => {
    if (isOpen && tournament) {
      fetchGames();
      if (tournament.game) {
        fetchTournamentTypes(tournament.game);
        fetchModeTypes(tournament.game);
      }
      // Format dates to DD-MM-YY
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}-${month}-${year}`;
      };

      // Format date to YYYY-MM-DD for date input
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Format date to YYYY-MM-DDTHH:mm for datetime-local input
      const formatDateTimeForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      // Format registration deadline for datetime-local input
      const formatDateTimeLocal = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        name: tournament.name || '',
        game: tournament.game || '',
        tournamentType: tournament.tournamentType || '',
        mode: tournament.mode || '',
        date: formatDate(tournament.date),
        matchDate: formatDateTimeForInput(tournament.matchDate), // Use datetime-local format for matchDate
        registrationDeadline: tournament.registrationDeadline ? formatDateTimeLocal(tournament.registrationDeadline) : '',
        entryFee: tournament.entryFee || '',
        prizePool: tournament.prizePool || '',
        playerSpots: tournament.playerSpots || '',
        maxTeams: tournament.maxTeams || '',
        description: tournament.description || '',
        featured: tournament.featured || false,
        status: tournament.status || 'upcoming'
      });
      setDateInput(formatDateForInput(tournament.date));
      setMatchDateInput(formatDateTimeForInput(tournament.matchDate));
    }
  }, [isOpen, tournament]);

  const fetchGames = async () => {
    try {
      const response = await api.get('/games');
      setGames(response.data);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const fetchTournamentTypes = async (game = null) => {
    try {
      const url = game ? `/tournament-types?game=${encodeURIComponent(game)}` : '/tournament-types';
      const response = await api.get(url);
      setTournamentTypes(response.data || []);
      
      // If no tournament types found and we have a game, use fallback
      if ((!response.data || response.data.length === 0) && game) {
        setTournamentTypes([
          { name: 'Solo' },
          { name: 'Duo' },
          { name: 'Squad' },
          { name: 'Custom' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching tournament types:', error);
      // Fallback to default types
      setTournamentTypes([
        { name: 'Solo' },
        { name: 'Duo' },
        { name: 'Squad' },
        { name: 'Custom' }
      ]);
    }
  };

  const fetchModeTypes = async (game = null) => {
    try {
      const url = game ? `/mode-types?game=${encodeURIComponent(game)}` : '/mode-types';
      const response = await api.get(url);
      setModeTypes(response.data || []);
    } catch (error) {
      console.error('Error fetching mode types:', error);
      setModeTypes([]);
    }
  };

  useEffect(() => {
    if (formData.game) {
      fetchTournamentTypes(formData.game);
      fetchModeTypes(formData.game);
    }
  }, [formData.game]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
    
    // When game changes, fetch tournament types and mode types for that game
    if (name === 'game') {
      fetchTournamentTypes(value);
      fetchModeTypes(value);
    }
  };

  // Convert DD-MM-YY to YYYY-MM-DD
  const formatDateToYYYYMMDD = (dateString) => {
    if (!dateString) return '';
    // Check if already in YYYY-MM-DD format
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    // Parse DD-MM-YY format
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const day = parts[0];
      const month = parts[1];
      let year = parts[2];
      // Handle 2-digit year
      if (year.length === 2) {
        const yearNum = parseInt(year, 10);
        year = yearNum < 50 ? `20${year}` : `19${year}`;
      }
      return `${year}-${month}-${day}`;
    }
    return '';
  };

  const handleDateChange = (name, value) => {
    // Allow any input, not just complete DD-MM-YY format
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDatePickerChange = (name, value) => {
    if (value) {
      if (name === 'date') {
        const date = new Date(value);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        setFormData(prev => ({
          ...prev,
          [name]: `${day}-${month}-${year}`
        }));
        setDateInput(value);
      } else if (name === 'matchDate') {
        // For datetime-local, keep as ISO string
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
        setMatchDateInput(value);
      }
    }
  };

  const handleDateTimeChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate registration deadline is before match date (allowing same date but time must be before)
    if (formData.registrationDeadline && formData.matchDate) {
      const registrationDeadline = new Date(formData.registrationDeadline);
      const matchDate = new Date(formData.matchDate);
      
      // Check if dates are valid
      if (isNaN(registrationDeadline.getTime()) || isNaN(matchDate.getTime())) {
        setError('Please enter valid dates and times');
        return;
      }
      
      if (registrationDeadline >= matchDate) {
        setError('Registration deadline must be before match start time');
        return;
      }
    }

    setLoading(true);

    try {
      // Convert DD-MM-YY dates to ISO format for backend
      // Only include fields that have values
      const submitData = {};
      
      // Only add fields that are not empty
      if (formData.name) submitData.name = formData.name;
      if (formData.game) submitData.game = formData.game;
      if (formData.tournamentType) submitData.tournamentType = formData.tournamentType;
      if (formData.mode) submitData.mode = formData.mode;
      if (formData.date) submitData.date = formatDateToYYYYMMDD(formData.date);
      if (formData.matchDate) submitData.matchDate = formData.matchDate; // Already in ISO format from datetime-local
      if (formData.registrationDeadline) submitData.registrationDeadline = formData.registrationDeadline;
      if (formData.entryFee !== undefined && formData.entryFee !== '') submitData.entryFee = formData.entryFee;
      if (formData.prizePool !== undefined && formData.prizePool !== '') submitData.prizePool = formData.prizePool;
      if (formData.playerSpots !== undefined && formData.playerSpots !== '') submitData.playerSpots = formData.playerSpots;
      if (formData.maxTeams !== undefined && formData.maxTeams !== '') submitData.maxTeams = formData.maxTeams;
      if (formData.description !== undefined) submitData.description = formData.description;
      if (formData.featured !== undefined) submitData.featured = formData.featured;
      if (formData.status) submitData.status = formData.status;
      
      await api.put(`/tournaments/${tournament._id}`, submitData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update tournament');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !tournament) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold neon-text-cyan">Edit Tournament</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-lava-orange transition-colors text-2xl">×</button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Tournament Name *</label>
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
              <label className="block text-sm font-bold mb-2">Game *</label>
              <select
                name="game"
                value={formData.game}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              >
                {games.filter(g => g.isActive).map(game => (
                  <option key={game._id} value={game.name}>{game.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Tournament Type *</label>
              <select
                name="tournamentType"
                value={formData.tournamentType}
                onChange={handleChange}
                required
                disabled={!formData.game}
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!formData.game ? (
                  <option value="">Select Game First</option>
                ) : (
                  <>
                    {tournamentTypes.length === 0 && (
                      <option value={formData.tournamentType || ""}>
                        {formData.tournamentType || "Loading tournament types..."}
                      </option>
                    )}
                    {tournamentTypes.length > 0 && (
                      <>
                        <option value="">Select Tournament Type</option>
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
                      </>
                    )}
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Mode *</label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                required
                disabled={!formData.game || modeTypes.length === 0}
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formData.game ? 'Select Game First' : modeTypes.length === 0 ? 'No Modes Available' : 'Select Mode'}
                </option>
                {modeTypes.map(mode => (
                  <option key={mode._id || mode.name} value={mode.name}>
                    {mode.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Date (DD-MM-YY) *</label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => handleDatePickerChange('date', e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
                />
                <input
                  type="text"
                  name="date"
                  value={formData.date}
                  onChange={(e) => handleDateChange('date', e.target.value)}
                  placeholder="Or enter manually: DD-MM-YY"
                  className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Match Date (Date & Time) *</label>
              <input
                type="datetime-local"
                value={matchDateInput}
                onChange={(e) => handleDatePickerChange('matchDate', e.target.value)}
                required
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              />
              <p className="text-xs text-gray-400 mt-1">When the match starts</p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Registration Deadline (Date & Time) *</label>
              <input
                type="datetime-local"
                name="registrationDeadline"
                value={formData.registrationDeadline}
                onChange={(e) => handleDateTimeChange('registrationDeadline', e.target.value)}
                required
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              />
              <p className="text-xs text-gray-400 mt-1">Registration will close after this date and time</p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Entry Fee (₹) *</label>
              <input
                type="number"
                name="entryFee"
                value={formData.entryFee}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Prize Pool (₹) *</label>
              <input
                type="number"
                name="prizePool"
                value={formData.prizePool}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Player Spots *</label>
              <input
                type="number"
                name="playerSpots"
                value={formData.playerSpots}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Max Teams *</label>
              <input
                type="number"
                name="maxTeams"
                value={formData.maxTeams}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label className="text-sm font-bold">Featured (Show in Home Page)</label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
              {loading ? 'Updating...' : 'Update Tournament'}
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

export default EditTournamentModal;

