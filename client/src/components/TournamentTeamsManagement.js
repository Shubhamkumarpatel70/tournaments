import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Button from './Button';

const TournamentTeamsManagement = () => {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [terminateModal, setTerminateModal] = useState({ isOpen: false, team: null, reason: '' });
  const [games, setGames] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all', // all, active, inactive, disbanded
    terminated: 'all', // all, terminated, not-terminated
    game: 'all' // all, or specific game name
  });

  useEffect(() => {
    fetchData();
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await api.get('/games/all');
      setGames(response.data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      // Fallback to default games if API fails
      setGames([{ name: 'BGMI' }, { name: 'Free Fire' }]);
    }
  };

  useEffect(() => {
    // Filter teams based on search query and filters
    let filtered = teams;

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(team => {
        const nameMatch = team.name?.toLowerCase().includes(query);
        const gameMatch = team.game?.toLowerCase().includes(query);
        const memberMatch = team.members?.some(member => 
          member.name?.toLowerCase().includes(query) ||
          member.gameId?.toLowerCase().includes(query)
        );
        const leaderMatch = team.members && team.members.length > 0 && team.members[0]?.name?.toLowerCase().includes(query);
        return nameMatch || gameMatch || memberMatch || leaderMatch;
      });
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(team => team.status === filters.status);
    }

    // Apply terminated filter
    if (filters.terminated === 'terminated') {
      filtered = filtered.filter(team => team.isTerminated === true);
    } else if (filters.terminated === 'not-terminated') {
      filtered = filtered.filter(team => !team.isTerminated);
    }

    // Apply game filter
    if (filters.game !== 'all') {
      filtered = filtered.filter(team => team.game === filters.game);
    }

    setFilteredTeams(filtered);
  }, [searchQuery, teams, filters]);

  const fetchData = async () => {
    try {
      const res = await api.get('/teams/all');
      // Filter only tournament teams (those with game field and no position field)
      const tournamentTeams = (res.data || []).filter(team => 
        team.game && !team.position
      );
      setTeams(tournamentTeams);
      setFilteredTeams(tournamentTeams);
      setError('');
    } catch (error) {
      console.error('Error fetching tournament teams:', error);
      setError(error.response?.data?.error || 'Failed to load tournament teams');
      setTeams([]);
      setFilteredTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      try {
        await api.delete(`/teams/${id}`);
        fetchData();
      } catch (error) {
        alert('Error deleting team: ' + (error.response?.data?.error || 'Unknown error'));
      }
    }
  };

  const handleToggleStatus = async (team) => {
    const newStatus = team.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/teams/${team._id}`, { status: newStatus });
      fetchData();
    } catch (error) {
      alert('Error updating team status: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleTerminate = async () => {
    if (!terminateModal.reason.trim()) {
      alert('Please provide a termination reason');
      return;
    }

    try {
      await api.put(`/teams/${terminateModal.team._id}/terminate`, {
        terminationReason: terminateModal.reason
      });
      setTerminateModal({ isOpen: false, team: null, reason: '' });
      fetchData();
    } catch (error) {
      alert('Error terminating team: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleToggleTerminate = async (team, event) => {
    // Prevent default checkbox behavior
    event?.preventDefault();
    
    if (team.isTerminated) {
      // Remove termination - restore team
      if (window.confirm('Are you sure you want to remove termination from this team? The team will be reactivated and the user will be able to edit or delete it again.')) {
        try {
          const response = await api.put(`/teams/${team._id}/unterminate`);
          // Team is now restored: isTerminated=false, status='active'
          fetchData();
        } catch (error) {
          alert('Error removing termination: ' + (error.response?.data?.error || 'Unknown error'));
        }
      }
    } else {
      // Terminate - show modal for reason
      setTerminateModal({ isOpen: true, team, reason: '' });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="text-4xl mb-4">⏳</div>
        <p>Loading tournament teams...</p>
      </div>
    );
  }

  return (
    <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-lava-orange">Tournament Teams</h2>
          <div className="w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by team name, game, member name, or game ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80 px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
            />
          </div>
        </div>

        {/* Filter Options */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Status:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-1 bg-lava-black border border-lava-orange/30 rounded text-sm text-off-white focus:outline-none focus:border-lava-orange"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="disbanded">Disbanded</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Termination:</label>
            <select
              value={filters.terminated}
              onChange={(e) => setFilters({ ...filters, terminated: e.target.value })}
              className="px-3 py-1 bg-lava-black border border-lava-orange/30 rounded text-sm text-off-white focus:outline-none focus:border-lava-orange"
            >
              <option value="all">All</option>
              <option value="terminated">Terminated</option>
              <option value="not-terminated">Not Terminated</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Game:</label>
            <select
              value={filters.game}
              onChange={(e) => setFilters({ ...filters, game: e.target.value })}
              className="px-3 py-1 bg-lava-black border border-lava-orange/30 rounded text-sm text-off-white focus:outline-none focus:border-lava-orange"
            >
              <option value="all">All Games</option>
              {games.map((game) => (
                <option key={game._id || game.name} value={game.name}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>

          {(filters.status !== 'all' || filters.terminated !== 'all' || filters.game !== 'all') && (
            <button
              onClick={() => setFilters({ status: 'all', terminated: 'all', game: 'all' })}
              className="px-3 py-1 text-sm text-lava-orange hover:text-fiery-yellow transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {filteredTeams.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-4">👥</div>
          <p>{searchQuery ? 'No teams found matching your search.' : 'No tournament teams found.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTeams.map((team) => (
            <div
              key={team._id}
              className="bg-lava-black border border-lava-orange/20 rounded-lg p-4 hover:border-lava-orange/50 transition-all"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{team.name}</h3>
                    <span className="bg-lava-orange text-lava-black px-2 py-1 rounded text-xs font-bold">
                      {team.game}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        team.status === 'active'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : team.status === 'inactive'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}
                    >
                      {team.status || 'active'}
                    </span>
                  </div>
                  
                  {team.members && team.members.length > 0 && team.members[0] && (
                    <p className="text-sm text-gray-400 mb-2">
                      Team Leader: {team.members[0].name || 'N/A'}
                      {team.captain && team.captain.email && (
                        <span className="text-gray-500 ml-2">({team.captain.email})</span>
                      )}
                    </p>
                  )}


                  {team.isTerminated && (
                    <div className="mb-2">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                        Terminated
                      </span>
                      {team.terminationReason && (
                        <p className="text-xs text-red-400 mt-1">Reason: {team.terminationReason}</p>
                      )}
                    </div>
                  )}

                  {team.members && team.members.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-gray-300 mb-2">Members ({team.members.length}):</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {team.members.map((member, index) => (
                          <div
                            key={index}
                            className="bg-charcoal border border-lava-orange/10 rounded p-2 text-sm"
                          >
                            <div className="font-semibold text-off-white">{member.name || 'N/A'}</div>
                            <div className="text-gray-400 text-xs">Game ID: {member.gameId || 'N/A'}</div>
                            {member.phoneNumber && (
                              <div className="text-gray-400 text-xs">Phone: {member.phoneNumber}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    Created: {new Date(team.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit'
                    })}
                  </p>
                </div>

                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  {/* Terminate Toggle */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-400">Terminate:</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={team.isTerminated || false}
                        onChange={(e) => handleToggleTerminate(team, e)}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                        team.isTerminated 
                          ? 'bg-red-600' 
                          : 'bg-gray-600'
                      }`}></div>
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleToggleStatus(team)}
                      className="whitespace-nowrap"
                    >
                      {team.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(team._id)}
                      className="whitespace-nowrap"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {searchQuery && filteredTeams.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-400">
          Showing {filteredTeams.length} of {teams.length} teams
        </div>
      )}

      {/* Terminate Modal */}
      {terminateModal.isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-lava-orange mb-4">Terminate Team</h3>
            <p className="text-gray-400 mb-4">
              Are you sure you want to terminate <strong>{terminateModal.team?.name}</strong>? This action will mark the team as terminated.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Termination Reason *</label>
              <textarea
                value={terminateModal.reason}
                onChange={(e) => setTerminateModal({ ...terminateModal, reason: e.target.value })}
                placeholder="Enter reason for termination..."
                rows="4"
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="danger"
                onClick={handleTerminate}
                className="flex-1"
                disabled={!terminateModal.reason.trim()}
              >
                Terminate Team
              </Button>
              <Button
                variant="secondary"
                onClick={() => setTerminateModal({ isOpen: false, team: null, reason: '' })}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentTeamsManagement;

