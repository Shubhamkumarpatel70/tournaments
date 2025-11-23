import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import Button from './Button';

const LeaderboardManagement = () => {
  const [leaderboards, setLeaderboards] = useState([]);
  const [teams, setTeams] = useState([]);
  const [allTeamNames, setAllTeamNames] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [formData, setFormData] = useState({
    teamName: '',
    tournamentId: '',
    rank: '',
    wins: '',
    kills: '',
    earnings: '',
    kdRatio: '',
    game: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [teamSuggestions, setTeamSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leaderboardsRes, tournamentsRes] = await Promise.all([
        api.get('/leaderboard/admin'),
        api.get('/tournaments')
      ]);
      setLeaderboards(leaderboardsRes.data);
      setTournaments(tournamentsRes.data);
      
      // Extract unique team names from existing leaderboard entries
      const teamNamesFromLeaderboard = leaderboardsRes.data
        .map(entry => entry.teamId?.name || (typeof entry.teamId === 'string' ? entry.teamId : null))
        .filter(Boolean);
      setAllTeamNames([...new Set(teamNamesFromLeaderboard)].sort());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch teams registered for selected tournament
  const fetchTournamentTeams = async (tournamentId) => {
    if (!tournamentId) {
      setAllTeamNames([]);
      return;
    }
    try {
      const response = await api.get(`/tournament-registrations/tournament/${tournamentId}`);
      const registrations = response.data || [];
      
      // Extract team names from approved registrations
      const teamNames = registrations
        .filter(reg => reg.status === 'approved')
        .map(reg => reg.teamName || reg.teamId?.name)
        .filter(Boolean);
      
      // Also get team names from existing leaderboard entries for this tournament
      const leaderboardTeamNames = leaderboards
        .filter(entry => {
          const entryTournamentId = entry.tournamentId?._id || entry.tournamentId;
          return entryTournamentId?.toString() === tournamentId.toString();
        })
        .map(entry => entry.teamId?.name)
        .filter(Boolean);
      
      const uniqueTeamNames = [...new Set([...teamNames, ...leaderboardTeamNames])];
      setAllTeamNames(uniqueTeamNames.sort());
    } catch (error) {
      console.error('Error fetching tournament teams:', error);
      // Fallback to all team names if error
      fetchData();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // When game changes, reset tournament and team name
    if (name === 'game') {
      setFormData(prev => ({
        ...prev,
        tournamentId: '',
        teamName: ''
      }));
      setAllTeamNames([]);
      setTeamSuggestions([]);
      setShowSuggestions(false);
    }
    
    // When tournament changes, fetch teams for that tournament
    if (name === 'tournamentId') {
      if (value) {
        fetchTournamentTeams(value);
      } else {
        setAllTeamNames([]);
      }
      // Reset team name when tournament changes
      setFormData(prev => ({
        ...prev,
        teamName: ''
      }));
      setTeamSuggestions([]);
      setShowSuggestions(false);
    }
    
    // Handle team name autocomplete
    if (name === 'teamName') {
      if (value && value.trim()) {
        const filtered = allTeamNames.filter(teamName =>
          teamName && teamName.toLowerCase().includes(value.toLowerCase())
        );
        setTeamSuggestions(filtered.slice(0, 5)); // Show max 5 suggestions
        setShowSuggestions(true);
      } else {
        setTeamSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  // Get filtered tournaments based on selected game
  const getFilteredTournaments = () => {
    if (!formData.game) {
      return tournaments;
    }
    return tournaments.filter(tournament => 
      tournament.game && tournament.game.toLowerCase() === formData.game.toLowerCase()
    );
  };

  // Get available games from tournaments
  const getAvailableGames = () => {
    const games = [...new Set(tournaments.map(t => t.game).filter(Boolean))];
    return games.sort();
  };

  const handleTeamNameSelect = (teamName) => {
    setFormData(prev => ({
      ...prev,
      teamName: teamName
    }));
    setShowSuggestions(false);
    setTeamSuggestions([]);
  };

      const handleEdit = (leaderboard) => {
    const teamName = leaderboard.teamId?.name || (typeof leaderboard.teamId === 'string' ? leaderboard.teamId : '');
    const tournamentId = leaderboard.tournamentId?._id || leaderboard.tournamentId || '';
    const game = leaderboard.game || leaderboard.tournamentId?.game || '';
    
    setFormData({
      teamName: teamName,
      tournamentId: tournamentId,
      rank: leaderboard.rank || '',
      wins: leaderboard.wins || '',
      kills: leaderboard.kills || '',
      earnings: leaderboard.earnings || '',
      kdRatio: leaderboard.kdRatio || '',
      game: game
    });
    
    // Fetch teams for the tournament when editing
    if (tournamentId) {
      fetchTournamentTeams(tournamentId);
    }
    
    setEditingId(leaderboard._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.game) {
      alert('Please select a game');
      return;
    }
    if (!formData.tournamentId) {
      alert('Please select a tournament');
      return;
    }
    if (!formData.teamName || !formData.teamName.trim()) {
      alert('Please enter a team name');
      return;
    }
    try {
      // Send only teamName, not teamId
      const submitData = {
        teamName: formData.teamName.trim(),
        tournamentId: formData.tournamentId,
        rank: formData.rank,
        wins: 0, // Set to 0 since wins is no longer used
        kills: formData.kills || 0,
        earnings: formData.earnings || 0,
        kdRatio: formData.kdRatio || 0,
        game: formData.game
      };
      await api.post('/leaderboard/admin', submitData);
      fetchData();
      setFormData({
        teamName: '',
        tournamentId: '',
        rank: '',
        wins: '',
        kills: '',
        earnings: '',
        kdRatio: '',
        game: ''
      });
      setShowSuggestions(false);
      setTeamSuggestions([]);
      setEditingId(null);
      setShowForm(false);
      alert(editingId ? 'Leaderboard entry updated successfully!' : 'Leaderboard entry added successfully!');
    } catch (error) {
      console.error('Error saving leaderboard:', error);
      alert(error.response?.data?.error || 'Failed to save leaderboard entry. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this leaderboard entry?')) {
      try {
        await api.delete(`/leaderboard/admin/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting leaderboard:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading...</div>;
  }

  const filteredLeaderboards = leaderboards.filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const teamName = (entry.teamId?.name || '').toLowerCase();
    const tournamentName = (entry.tournamentId?.name || '').toLowerCase();
    return teamName.includes(query) || tournamentName.includes(query);
  });

  return (
    <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-lava-orange">Manage Leaderboard</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <input
            type="text"
            placeholder="Search by team or tournament..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white placeholder-gray-500 focus:outline-none focus:border-lava-orange w-full sm:w-64"
          />
          <Button 
            variant="primary" 
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({
                teamId: '',
                tournamentId: '',
                rank: '',
                wins: '',
                kills: '',
                earnings: '',
                kdRatio: '',
                game: ''
              });
            }}
          >
            {showForm ? 'Cancel' : '+ Add Entry'}
          </Button>
        </div>
      </div>

      {/* Simplified Form */}
      {(showForm || editingId) && (
        <form onSubmit={handleSubmit} className="bg-lava-black border border-lava-orange/20 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                {getAvailableGames().map(game => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Tournament *</label>
              <select
                name="tournamentId"
                value={formData.tournamentId}
                onChange={handleChange}
                required
                disabled={!formData.game}
                className="w-full px-4 py-2 bg-charcoal border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{formData.game ? 'Select Tournament' : 'Select Game First'}</option>
                {getFilteredTournaments().map(tournament => (
                  <option key={tournament._id} value={tournament._id}>{tournament.name}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-bold mb-2">Team Name *</label>
              <input
                type="text"
                name="teamName"
                value={formData.teamName || ''}
                onChange={handleChange}
                onFocus={() => {
                  if (formData.teamName && formData.teamName.trim() && teamSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay hiding suggestions to allow click on suggestion
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="Enter team name..."
                required
                className="w-full px-4 py-2 bg-charcoal border border-lava-orange/30 rounded-lg text-off-white placeholder-gray-500 focus:outline-none focus:border-lava-orange"
              />
              {/* Autocomplete Suggestions */}
              {showSuggestions && teamSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-lava-black border border-lava-orange/30 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {teamSuggestions.map((teamName, index) => (
                    <div
                      key={index}
                      onClick={() => handleTeamNameSelect(teamName)}
                      className="px-4 py-2 hover:bg-lava-orange/20 cursor-pointer text-off-white transition-colors"
                    >
                      {teamName}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Rank *</label>
              <input
                type="number"
                name="rank"
                value={formData.rank}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-2 bg-charcoal border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Earnings (₹) *</label>
              <input
                type="number"
                name="earnings"
                value={formData.earnings}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 bg-charcoal border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" variant="primary">
              {editingId ? 'Update' : 'Add'} Entry
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={() => {
                setEditingId(null);
                setShowForm(false);
                setFormData({
                  teamId: '',
                  tournamentId: '',
                  rank: '',
                  wins: '',
                  kills: '',
                  earnings: '',
                  kdRatio: '',
                  game: ''
                });
              }}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}

      {/* Leaderboard Table */}
      {filteredLeaderboards.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-lava-orange/20">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold">Rank</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Team</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Game</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Tournament</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Earnings</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaderboards.map(entry => {
                // Get team name from various possible sources
                const teamName = entry.teamId?.name || 
                               (typeof entry.teamId === 'object' && entry.teamId?.name) ||
                               entry.teamName ||
                               'N/A';
                
                // Get game from entry first, then team, then tournament (but not tournament name!)
                const game = entry.game || 
                           entry.teamId?.game || 
                           (entry.tournamentId && typeof entry.tournamentId === 'object' ? entry.tournamentId.game : null) ||
                           'N/A';
                
                // Get tournament name - ensure we're getting the name, not the game
                let tournamentName = 'N/A';
                if (entry.tournamentId) {
                  if (typeof entry.tournamentId === 'object') {
                    // Tournament is populated - get the name field specifically
                    tournamentName = entry.tournamentId.name || 'N/A';
                    // Double-check: if name is the same as game, something is wrong
                    if (tournamentName === entry.tournamentId.game || tournamentName === game) {
                      // This means the name field might be wrong, try to find it in tournaments list
                      const tournament = tournaments.find(t => 
                        t._id === (entry.tournamentId._id || entry.tournamentId)
                      );
                      if (tournament && tournament.name) {
                        tournamentName = tournament.name;
                      } else {
                        tournamentName = 'N/A';
                      }
                    }
                  } else if (typeof entry.tournamentId === 'string') {
                    // If it's a string ID, try to find it in the tournaments list
                    const tournament = tournaments.find(t => t._id === entry.tournamentId);
                    tournamentName = tournament ? tournament.name : 'N/A';
                  }
                }
                
                return (
                  <tr key={entry._id} className="border-t border-lava-orange/10 hover:bg-lava-orange/5 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-bold text-lava-orange text-lg">#{entry.rank}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-base">{teamName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-lava-orange/20 text-lava-orange px-2 py-1 rounded-full text-xs font-bold">
                        {game}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-base text-off-white">
                          {tournamentName !== 'N/A' ? tournamentName : (
                            <span className="text-gray-500 italic text-sm">No tournament</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-fiery-yellow font-bold text-lg">₹{entry.earnings?.toLocaleString() || '0'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="px-3 py-1 bg-lava-orange text-lava-black font-bold rounded text-sm hover:bg-fiery-yellow transition-colors"
                          title="Edit entry"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="px-3 py-1 bg-red-500 text-white font-bold rounded text-sm hover:bg-red-600 transition-colors"
                          title="Delete entry"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          {searchQuery ? 'No leaderboard entries found matching your search' : 'No leaderboard entries yet. Add your first entry!'}
        </div>
      )}
    </div>
  );
};

export default LeaderboardManagement;

