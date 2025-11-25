import React, { useState, useEffect } from 'react';
import Button from './Button';
import api from '../utils/api';

const CreateTournamentModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    game: 'BGMI',
    tournamentType: 'Squad',
    mode: 'Squad',
    date: '',
    matchDate: '',
    registrationDeadline: '',
    entryFee: '',
    prizePool: '',
    playerSpots: '',
    maxTeams: '',
    description: '',
    featured: false
  });
  const [dateInput, setDateInput] = useState(''); // For date picker (YYYY-MM-DD)
  const [matchDateInput, setMatchDateInput] = useState(''); // For datetime-local (YYYY-MM-DDTHH:mm)
  const [registrationDeadlineInput, setRegistrationDeadlineInput] = useState(''); // For datetime-local (YYYY-MM-DDTHH:mm)
  const [games, setGames] = useState([]);
  const [tournamentTypes, setTournamentTypes] = useState([]);
  const [modeTypes, setModeTypes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchGames();
      fetchTournamentTypes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.game) {
      fetchTournamentTypes(formData.game);
      fetchModeTypes(formData.game);
    }
  }, [formData.game]);

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
      
      // Auto-select first tournament type if available and none selected
      if (response.data && response.data.length > 0 && !formData.tournamentType) {
        setFormData(prev => ({
          ...prev,
          tournamentType: response.data[0].name
        }));
      } else if (!response.data || response.data.length === 0) {
        // If no tournament types found, use fallback
        setTournamentTypes([
          { name: 'Solo' },
          { name: 'Duo' },
          { name: 'Squad' },
          { name: 'Custom' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching tournament types:', error);
      // Fallback to default types if API fails
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
      
      // Auto-select first mode type if available and none selected
      if (response.data && response.data.length > 0 && !formData.mode) {
        setFormData(prev => ({
          ...prev,
          mode: response.data[0].name
        }));
      }
    } catch (error) {
      console.error('Error fetching mode types:', error);
      setModeTypes([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    
    // When game changes, fetch tournament types and mode types for that game
    if (name === 'game') {
      fetchTournamentTypes(value);
      fetchModeTypes(value);
    }
  };

  // Convert YYYY-MM-DD to DD-MM-YY
  const formatDateToDDMMYY = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
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

  const handleDatePickerChange = (name, value) => {
    // value is in YYYY-MM-DD format from date input
    if (name === 'date') {
      setDateInput(value);
      setFormData(prev => ({
        ...prev,
        date: formatDateToDDMMYY(value)
      }));
    } else if (name === 'matchDate') {
      setMatchDateInput(value);
      setFormData(prev => ({
        ...prev,
        matchDate: value // Keep as ISO string for datetime-local
      }));
    } else if (name === 'registrationDeadline') {
      setRegistrationDeadlineInput(value);
      setFormData(prev => ({
        ...prev,
        registrationDeadline: value // Keep as ISO string for datetime-local
      }));
    }
  };

  const handleDateTextChange = (name, value) => {
    // User manually typing DD-MM-YY format (only for date field, not matchDate)
    if (name === 'date' && (value.match(/^\d{2}-\d{2}-\d{2}$/) || value === '')) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      // Update date picker if valid
      if (value) {
        const yyyymmdd = formatDateToYYYYMMDD(value);
        if (yyyymmdd) {
          setDateInput(yyyymmdd);
        }
      } else {
        setDateInput('');
      }
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.game || !formData.tournamentType || !formData.mode ||
        !formData.date || !formData.matchDate || !formData.registrationDeadline || !formData.entryFee || !formData.prizePool ||
        !formData.playerSpots || !formData.maxTeams) {
      setError('All fields are required');
      return false;
    }
    
    // Validate registration deadline is before match date (allowing same date but time must be before)
    if (formData.registrationDeadline && formData.matchDate) {
      const registrationDeadline = new Date(formData.registrationDeadline);
      const matchDate = new Date(formData.matchDate);
      if (registrationDeadline >= matchDate) {
        setError('Registration deadline must be before match start time');
        return false;
      }
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
      // Convert dates to proper format for backend
      // Use dateInput (YYYY-MM-DD) if available, otherwise convert DD-MM-YY
      // Convert datetime-local values to ISO strings with timezone to prevent timezone shifts
      const convertToISO = (datetimeLocal) => {
        if (!datetimeLocal) return '';
        // datetime-local format: YYYY-MM-DDTHH:mm
        // Create Date object in local timezone, then convert to ISO string
        const date = new Date(datetimeLocal);
        return date.toISOString();
      };

      const submitData = {
        ...formData,
        date: dateInput ? dateInput : (formData.date ? formatDateToYYYYMMDD(formData.date) : ''),
        matchDate: convertToISO(formData.matchDate), // Convert to ISO string with timezone
        registrationDeadline: convertToISO(formData.registrationDeadline) // Convert to ISO string with timezone
      };
      
      // Validate dates are present
      if (!submitData.date || !submitData.matchDate || !submitData.registrationDeadline) {
        setError('Please select valid dates and registration deadline');
        setLoading(false);
        return;
      }
      
      await api.post('/tournaments', submitData);
      onSuccess();
      setFormData({
        name: '',
        game: 'BGMI',
        tournamentType: 'Squad',
        mode: 'Squad',
        date: '',
        matchDate: '',
        registrationDeadline: '',
        entryFee: '',
        prizePool: '',
        playerSpots: '',
        maxTeams: '',
        description: '',
        featured: false
      });
      setDateInput('');
      setMatchDateInput('');
      setRegistrationDeadlineInput('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold neon-text-cyan">Create Tournament</h2>
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
                disabled={!formData.game || tournamentTypes.length === 0}
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formData.game ? 'Select Game First' : tournamentTypes.length === 0 ? 'No Types Available' : 'Select Tournament Type'}
                </option>
                {tournamentTypes.map(type => (
                  <option key={type._id || type.name} value={type.name}>
                    {type.name}
                  </option>
                ))}
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
                  onChange={(e) => handleDateTextChange('date', e.target.value)}
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
                value={registrationDeadlineInput}
                onChange={(e) => handleDatePickerChange('registrationDeadline', e.target.value)}
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
              onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
              className="w-4 h-4"
            />
            <label className="text-sm font-bold">Featured (Show in Home Page)</label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
              {loading ? 'Creating...' : 'Create Tournament'}
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

export default CreateTournamentModal;

