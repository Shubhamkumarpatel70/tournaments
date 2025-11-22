import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Leaderboards = () => {
  const [topTeams, setTopTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedGame]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leaderboard/top-teams?limit=50');
      let teams = response.data;
      
      if (selectedGame !== 'all') {
        teams = teams.filter(team => team.game?.toLowerCase() === selectedGame.toLowerCase());
      }
      
      setTopTeams(teams);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-fiery-yellow';
    if (rank <= 3) return 'text-lava-orange';
    return 'text-off-white';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 neon-text-cyan">Leaderboards</h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg px-2">
            See the top performing teams and compete for the top spot!
          </p>
        </div>

        {/* Game Filter */}
        <div className="mb-4 sm:mb-6 flex justify-center">
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-3 sm:p-4 w-full sm:w-auto">
            <label className="block text-xs sm:text-sm font-bold mb-2 text-lava-orange">Filter by Game</label>
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white text-sm sm:text-base focus:outline-none focus:border-lava-orange"
            >
              <option value="all">All Games</option>
              <option value="bgmi">BGMI</option>
              <option value="freefire">Free Fire</option>
              <option value="pubg">PUBG</option>
              <option value="valorant">Valorant</option>
            </select>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-charcoal border border-lava-orange/30 rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-8 sm:py-12 text-gray-400 text-sm sm:text-base">Loading leaderboard...</div>
          ) : topTeams.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-lava-orange/20">
                  <tr>
                    <th className="px-6 py-4 text-left">Rank</th>
                    <th className="px-6 py-4 text-left">Team Name</th>
                    <th className="px-6 py-4 text-left">Game</th>
                    <th className="px-6 py-4 text-left">Wins</th>
                    <th className="px-6 py-4 text-left">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {topTeams.map((team, index) => (
                    <tr 
                      key={index} 
                      className={`border-t border-lava-orange/10 hover:bg-lava-orange/5 transition-colors ${
                        team.rank <= 3 ? 'bg-lava-orange/5' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span className={`text-2xl font-bold ${getRankColor(team.rank)}`}>
                          {getRankIcon(team.rank)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-lg">{team.teamName}</td>
                      <td className="px-6 py-4">
                        <span className="bg-lava-orange/20 text-lava-orange px-3 py-1 rounded-full text-sm font-bold">
                          {team.game || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-lava-orange font-semibold">{team.wins || 0}</td>
                      <td className="px-6 py-4 text-fiery-yellow font-bold text-lg">
                        ₹{team.earnings?.toLocaleString() || '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">No teams found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboards;

