import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Leaderboards = () => {
  const [topTeams, setTopTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState('all');
  const [availableGames, setAvailableGames] = useState([]);

  useEffect(() => {
    fetchGames();
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedGame]);

  const fetchGames = async () => {
    try {
      const response = await api.get('/leaderboard/games');
      setAvailableGames(response.data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      // Fallback to default games if API fails
      setAvailableGames(['BGMI', 'Free Fire']);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leaderboard/top-teams?limit=100');
      let teams = response.data || [];
      
      if (selectedGame !== 'all') {
        teams = teams.filter(team => {
          const teamGame = team.game?.toLowerCase() || '';
          const filterGame = selectedGame.toLowerCase();
          return teamGame === filterGame || teamGame.includes(filterGame);
        });
      }
      
      // Re-rank after filtering
      teams = teams.map((team, index) => ({
        ...team,
        rank: index + 1
      }));
      
      setTopTeams(teams);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setTopTeams([]);
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
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 page-transition bg-gradient-to-b from-lava-black via-charcoal to-lava-black">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold neon-text-cyan">
                  Leaderboards
                </h1>
              </div>
              <p className="text-gray-200 text-lg sm:text-xl md:text-2xl px-2 font-bold mb-2">
                See the top performing teams and compete for the top spot!
              </p>
              <p className="text-gray-400 text-sm sm:text-base md:text-lg mt-2 px-2">
                Track your progress and see where you rank among the best players
              </p>
            </div>
            <button
              onClick={() => {
                fetchGames();
                fetchLeaderboard();
              }}
              className="px-5 sm:px-6 py-3 sm:py-3 bg-gradient-to-r from-lava-orange to-fiery-yellow text-lava-black font-bold rounded-lg hover:from-fiery-yellow hover:to-lava-orange transition-all flex items-center gap-2 shadow-lg shadow-lava-orange/50 hover:shadow-lava-orange/70 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm sm:text-base">Refresh</span>
            </button>
          </div>
        </div>

        {/* Game Filter */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <div className="bg-gradient-to-r from-charcoal to-lava-black border-2 border-lava-orange/50 rounded-xl p-4 sm:p-5 w-full sm:w-auto shadow-lg shadow-lava-orange/20">
            <label className="flex items-center gap-2 text-sm sm:text-base font-bold mb-3 text-lava-orange">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter by Game
            </label>
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-lava-black border-2 border-lava-orange/40 rounded-lg text-off-white text-sm sm:text-base font-semibold focus:outline-none focus:border-lava-orange focus:ring-2 focus:ring-lava-orange/50 transition-all"
            >
              <option value="all">🎮 All Games</option>
              {availableGames.length > 0 ? (
                availableGames.map((game) => (
                  <option key={game} value={game.toLowerCase()}>
                    {game}
                  </option>
                ))
              ) : (
                <>
                  <option value="bgmi">BGMI</option>
                  <option value="free fire">Free Fire</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-gradient-to-br from-charcoal via-lava-black to-charcoal border-2 border-lava-orange/40 rounded-xl overflow-hidden shadow-2xl shadow-lava-orange/20">
          {loading ? (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-lava-orange border-t-transparent mb-4"></div>
              <p className="text-gray-300 text-base sm:text-lg font-semibold">Loading leaderboard...</p>
              <p className="text-gray-500 text-sm mt-2">Fetching the latest rankings...</p>
            </div>
          ) : topTeams.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gradient-to-r from-lava-orange/40 via-fiery-yellow/30 to-lava-orange/40 border-b-2 border-lava-orange/50">
                  <tr>
                    <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-sm sm:text-base font-bold text-off-white">Rank</th>
                    <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-sm sm:text-base font-bold text-off-white">Team Name</th>
                    <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-sm sm:text-base font-bold text-off-white">Game</th>
                    <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-sm sm:text-base font-bold text-off-white">Tournament</th>
                    <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-sm sm:text-base font-bold text-off-white">Winings</th>
                  </tr>
                </thead>
                <tbody>
                  {topTeams.map((team, index) => (
                    <tr 
                      key={team._id || index} 
                      className={`border-b border-lava-orange/20 hover:bg-lava-orange/15 transition-all duration-200 ${
                        team.rank === 1 ? 'bg-gradient-to-r from-fiery-yellow/15 via-lava-orange/10 to-fiery-yellow/15 border-l-4 border-fiery-yellow' :
                        team.rank <= 3 ? 'bg-gradient-to-r from-lava-orange/10 to-lava-orange/5 border-l-2 border-lava-orange' : 
                        'bg-charcoal/50 hover:bg-lava-orange/10'
                      }`}
                    >
                      <td className="px-5 sm:px-6 py-4 sm:py-5">
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl sm:text-3xl font-bold ${getRankColor(team.rank)} drop-shadow-lg`}>
                            {getRankIcon(team.rank)}
                          </span>
                          {team.rank <= 3 && (
                            <span className="text-xs text-gray-300 font-semibold">#{team.rank}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 sm:px-6 py-4 sm:py-5">
                        <div className="font-bold text-base sm:text-lg text-off-white">
                          {team.teamName || team.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-5 sm:px-6 py-4 sm:py-5">
                        <span className="bg-gradient-to-r from-lava-orange/40 to-fiery-yellow/30 text-off-white px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold border border-lava-orange/50 shadow-md inline-flex items-center gap-1">
                          <span className="w-2 h-2 bg-fiery-yellow rounded-full animate-pulse"></span>
                          {team.game || 'N/A'}
                        </span>
                      </td>
                      <td className="px-5 sm:px-6 py-4 sm:py-5">
                        <div className="font-semibold text-sm sm:text-base">
                          {team.tournamentName && team.tournamentName !== 'N/A' && !team.tournamentName.includes('Unknown') ? (
                            <span className="text-off-white flex items-center gap-1">
                              <svg className="w-4 h-4 text-lava-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                              </svg>
                              {team.tournamentName}
                            </span>
                          ) : (
                            <span className="text-gray-500 italic text-xs">No tournament</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 sm:px-6 py-4 sm:py-5">
                        <div className="flex items-center gap-2">
                          <span className="text-fiery-yellow font-bold text-lg sm:text-xl drop-shadow-lg flex items-center gap-1">
                            ₹{team.earnings?.toLocaleString('en-IN') || '0'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 sm:py-20">
              <p className="text-xl sm:text-2xl font-bold text-gray-300 mb-2">No teams found</p>
              <p className="text-sm sm:text-base text-gray-400 mt-2">Be the first to compete and claim the top spot!</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-4">Check back later or register for a tournament to get started.</p>
            </div>
          )}
        </div>
        
        {/* Stats Summary */}
        {topTeams.length > 0 && (
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-charcoal to-lava-black border border-lava-orange/30 rounded-lg p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-lava-orange mb-1">{topTeams.length}</div>
              <div className="text-sm text-gray-400">Total Teams</div>
            </div>
            <div className="bg-gradient-to-br from-charcoal to-lava-black border border-lava-orange/30 rounded-lg p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-fiery-yellow mb-1">
                ₹{topTeams.reduce((sum, team) => sum + (team.earnings || 0), 0).toLocaleString('en-IN')}
              </div>
              <div className="text-sm text-gray-400">Total Winings</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboards;

