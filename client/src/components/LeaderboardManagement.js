import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import Button from './Button';

const LeaderboardManagement = () => {
  const [leaderboards, setLeaderboards] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [formData, setFormData] = useState({
    teamId: '',
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leaderboardsRes, teamsRes, tournamentsRes] = await Promise.all([
        api.get('/leaderboard/admin'),
        api.get('/teams/my-teams'),
        api.get('/tournaments')
      ]);
      setLeaderboards(leaderboardsRes.data);
      setTeams(teamsRes.data);
      setTournaments(tournamentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
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
  };

  const handleEdit = (leaderboard) => {
    setFormData({
      teamId: leaderboard.teamId._id,
      tournamentId: leaderboard.tournamentId._id,
      rank: leaderboard.rank,
      wins: leaderboard.wins,
      kills: leaderboard.kills,
      earnings: leaderboard.earnings,
      kdRatio: leaderboard.kdRatio,
      game: leaderboard.game
    });
    setEditingId(leaderboard._id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaderboard/admin', formData);
      fetchData();
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
      setEditingId(null);
    } catch (error) {
      console.error('Error saving leaderboard:', error);
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

  return (
    <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-lava-orange">Manage Leaderboard</h2>
        <Button 
          variant="primary" 
          onClick={() => {
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
          + Add Entry
        </Button>
      </div>

      {/* Simplified Form */}
      {(!editingId || Object.values(formData).some(v => v !== '')) && (
        <form onSubmit={handleSubmit} className="bg-lava-black border border-lava-orange/20 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold mb-2">Team *</label>
              <select
                name="teamId"
                value={formData.teamId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-charcoal border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              >
                <option value="">Select Team</option>
                {teams.map(team => (
                  <option key={team._id} value={team._id}>{team.name}</option>
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
                className="w-full px-4 py-2 bg-charcoal border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              >
                <option value="">Select Tournament</option>
                {tournaments.map(tournament => (
                  <option key={tournament._id} value={tournament._id}>{tournament.name}</option>
                ))}
              </select>
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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-lava-orange/20">
            <tr>
              <th className="px-4 py-3 text-left">Rank</th>
              <th className="px-4 py-3 text-left">Team</th>
              <th className="px-4 py-3 text-left">Tournament</th>
              <th className="px-4 py-3 text-left">Wins</th>
              <th className="px-4 py-3 text-left">Earnings</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaderboards.map(entry => (
              <tr key={entry._id} className="border-t border-lava-orange/10 hover:bg-lava-orange/5">
                <td className="px-4 py-3 font-bold">{entry.rank}</td>
                <td className="px-4 py-3">{entry.teamId?.name || 'N/A'}</td>
                <td className="px-4 py-3">{entry.tournamentId?.name || 'N/A'}</td>
                <td className="px-4 py-3">{entry.wins}</td>
                <td className="px-4 py-3 text-fiery-yellow font-bold">₹{entry.earnings?.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="px-3 py-1 bg-lava-orange text-lava-black font-bold rounded text-sm hover:bg-fiery-yellow"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="px-3 py-1 bg-red-500 text-white font-bold rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardManagement;

