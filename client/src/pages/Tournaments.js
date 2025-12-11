import React, { useState, useEffect } from 'react';
import { tournamentAPI } from '../utils/api';
import api from '../utils/api';
import Button from '../components/Button';
import TournamentRegistrationModal from '../components/TournamentRegistrationModal';
import { useAuth } from '../context/AuthContext';
import RegistrationCountdown from '../components/RegistrationCountdown';
import SEO from '../components/SEO';

const Tournaments = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedGame, setSelectedGame] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [tournaments, setTournaments] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [selectedGame, sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedGame !== 'all') {
        params.game = selectedGame;
      }
      if (sortBy) {
        params.sortBy = sortBy;
      }
      // Don't filter by status - show all tournaments including completed
      const [tournamentsRes, gamesRes] = await Promise.all([
        tournamentAPI.getAll(params),
        api.get('/games')
      ]);
      // Show all tournaments (upcoming, ongoing, and completed)
      setTournaments(tournamentsRes.data);
      setGames(gamesRes.data.filter(g => g.isActive));
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const oldTournaments = [
    {
      id: 1,
      game: 'BGMI',
      name: 'Championship Series',
      date: '2024-01-15',
      entryFee: '₹500',
      prizePool: '₹50,000',
      registered: 128,
      maxTeams: 256,
      mode: 'Squad'
    },
    {
      id: 2,
      game: 'Free Fire',
      name: 'Elite Clash',
      date: '2024-01-20',
      entryFee: '₹300',
      prizePool: '₹30,000',
      registered: 95,
      maxTeams: 200,
      mode: 'Squad'
    },
    {
      id: 3,
      game: 'BGMI',
      name: 'Weekend Warriors',
      date: '2024-01-12',
      entryFee: '₹250',
      prizePool: '₹25,000',
      registered: 156,
      maxTeams: 200,
      mode: 'Duo'
    },
    {
      id: 4,
      game: 'Free Fire',
      name: 'Solo Showdown',
      date: '2024-01-18',
      entryFee: '₹200',
      prizePool: '₹20,000',
      registered: 78,
      maxTeams: 100,
      mode: 'Solo'
    },
    {
      id: 5,
      game: 'BGMI',
      name: 'Night Battle',
      date: '2024-01-22',
      entryFee: '₹400',
      prizePool: '₹40,000',
      registered: 112,
      maxTeams: 200,
      mode: 'Squad'
    },
    {
      id: 6,
      game: 'Free Fire',
      name: 'Rapid Fire',
      date: '2024-01-14',
      entryFee: '₹350',
      prizePool: '₹35,000',
      registered: 89,
      maxTeams: 150,
      mode: 'Duo'
    }
  ];

  const filteredTournaments = tournaments;

  return (
    <>
      <SEO
        title="Gaming Tournaments - BGMI & Free Fire | arenaofchampions"
        description="Browse and join exciting BGMI and Free Fire tournaments. Compete for cash prizes, climb the leaderboards, and prove your skills in competitive esports battles. Register now!"
        keywords="BGMI tournaments, Free Fire tournaments, gaming tournaments, esports competitions, battle royale tournaments, mobile gaming tournaments, tournament registration, prize pool tournaments"
        url="/tournaments"
      />
      <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 page-transition">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-3 sm:mb-4 neon-text-cyan">Tournaments</h1>
        <p className="text-center text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">Find and join the best gaming tournaments</p>

        {/* Filters and Controls */}
        <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Game Filter */}
            <div>
              <label className="block text-sm font-bold mb-2">Game</label>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              >
                <option value="all">All Games</option>
                {games.map(game => (
                  <option key={game._id} value={game.name}>{game.name}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-bold mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="prize">Highest Prize</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-bold mb-2">Search</label>
              <input
                type="text"
                placeholder="Search tournaments..."
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white placeholder-gray-500 focus:outline-none focus:border-lava-orange"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-end">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-lava-orange text-lava-black' 
                      : 'bg-lava-black border border-lava-orange/30 text-off-white hover:bg-lava-orange hover:text-lava-black'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-lava-orange text-lava-black' 
                      : 'bg-lava-black border border-lava-orange/30 text-off-white hover:bg-lava-orange hover:text-lava-black'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tournament Grid/List */}
        {loading ? (
          <div className="text-center py-8 sm:py-12 text-gray-400 text-sm sm:text-base">Loading tournaments...</div>
        ) : filteredTournaments.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredTournaments.map(tournament => (
                <div key={tournament._id} className="bg-charcoal border border-lava-orange/30 rounded-lg p-4 sm:p-6 hover:border-lava-orange transition-all hover:shadow-lava-glow">
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-lava-orange text-lava-black px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                        {tournament.game}
                      </span>
                      {tournament.tournamentType && (
                        <span className="bg-fiery-yellow/20 text-fiery-yellow border border-fiery-yellow/40 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                          {tournament.tournamentType}
                        </span>
                      )}
                    </div>
                    <span className="text-fiery-yellow font-bold text-sm sm:text-base md:text-lg">₹{tournament.prizePool?.toLocaleString()}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">{tournament.name}</h3>
                  {tournament.description && (
                    <p className="text-gray-300 text-sm mb-2 line-clamp-2">{tournament.description}</p>
                  )}
                  
                  {/* Registration Countdown Timer */}
                  {tournament.registrationDeadline && (
                    <RegistrationCountdown deadline={tournament.registrationDeadline} />
                  )}
                  
                  <div className="space-y-2 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-400">
                    <p>📅 Date & Time: {(() => {
                      const date = new Date(tournament.matchDate);
                      const day = String(date.getDate()).padStart(2, '0');
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const year = String(date.getFullYear()).slice(-2);
                      const time = date.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      });
                      return `${day}-${month}-${year}, ${time}`;
                    })()}</p>
                    <p>🎮 Mode: {tournament.mode}</p>
                    <p>💰 Entry: ₹{tournament.entryFee}</p>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Teams: {tournament.registeredTeams || 0}/{tournament.maxTeams}</span>
                      <span>{Math.round(((tournament.registeredTeams || 0) / tournament.maxTeams) * 100)}%</span>
                    </div>
                    <div className="w-full bg-lava-black rounded-full h-2">
                      <div 
                        className="bg-lava-gradient h-2 rounded-full transition-all"
                        style={{ width: `${((tournament.registeredTeams || 0) / tournament.maxTeams) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  {(() => {
                    const now = new Date();
                    const registrationDeadline = tournament.registrationDeadline ? new Date(tournament.registrationDeadline) : null;
                    const isRegistrationClosed = registrationDeadline && now > registrationDeadline;
                    const isCompleted = tournament.status === 'completed';
                    const isFull = tournament.registeredTeams >= tournament.maxTeams;
                    
                    if (isCompleted) {
                      return (
                        <Button variant="secondary" className="w-full" disabled>
                          Game Completed
                        </Button>
                      );
                    } else if (isRegistrationClosed || isFull) {
                      return (
                        <Button variant="secondary" className="w-full" disabled>
                          Registration Closed
                        </Button>
                      );
                    } else {
                      return (
                        <Button 
                          variant="primary" 
                          className="w-full"
                          onClick={() => {
                            if (user) {
                              setSelectedTournament(tournament);
                              setIsRegistrationModalOpen(true);
                            } else {
                              window.location.href = '/login';
                            }
                          }}
                        >
                          Join Now
                        </Button>
                      );
                    }
                  })()}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredTournaments.map(tournament => (
                <div key={tournament._id} className="bg-charcoal border border-lava-orange/30 rounded-lg p-4 sm:p-6 hover:border-lava-orange transition-all hover:shadow-lava-glow transform hover:scale-[1.02]">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <span className="bg-lava-orange text-lava-black px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap">
                          {tournament.game}
                        </span>
                          {tournament.tournamentType && (
                          <span className="bg-fiery-yellow/20 text-fiery-yellow border border-fiery-yellow/40 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap">
                            {tournament.tournamentType}
                          </span>
                        )}
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold break-words">{tournament.name}</h3>
                      </div>
                      {tournament.description && (
                        <p className="text-gray-300 text-sm mb-2 sm:mb-3 line-clamp-2">{tournament.description}</p>
                      )}
                      
                      {/* Registration Countdown Timer */}
                      {tournament.registrationDeadline && (
                        <div className="mb-2 sm:mb-3">
                          <RegistrationCountdown deadline={tournament.registrationDeadline} />
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span>📅</span>
                          <span className="break-words">Date & Time: {(() => {
                            const date = new Date(tournament.matchDate);
                            const day = String(date.getDate()).padStart(2, '0');
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const year = String(date.getFullYear()).slice(-2);
                            const time = date.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            });
                            return `${day}-${month}-${year}, ${time}`;
                          })()}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span>🎮</span>
                          <span>{tournament.mode}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span>💰</span>
                          <span>₹{tournament.entryFee}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span>👥</span>
                          <span>{tournament.registeredTeams || 0}/{tournament.maxTeams}</span>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-3">
                        <div className="flex justify-between text-xs sm:text-sm mb-1">
                          <span>Teams Registered</span>
                          <span>{Math.round(((tournament.registeredTeams || 0) / tournament.maxTeams) * 100)}%</span>
                        </div>
                        <div className="w-full bg-lava-black rounded-full h-1.5 sm:h-2">
                          <div 
                            className="bg-lava-gradient h-1.5 sm:h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(((tournament.registeredTeams || 0) / tournament.maxTeams) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-3 sm:gap-2 min-w-[120px] sm:min-w-[140px]">
                      <div className="text-left lg:text-right">
                        <div className="text-fiery-yellow font-bold text-lg sm:text-xl md:text-2xl">₹{tournament.prizePool?.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">
                          Prize Pool{tournament.taxPercentage && tournament.taxPercentage > 0 ? ' (After Taxes)' : ''}
                        </div>
                      </div>
                      {(() => {
                        const now = new Date();
                        const registrationDeadline = tournament.registrationDeadline ? new Date(tournament.registrationDeadline) : null;
                        const isRegistrationClosed = registrationDeadline && now > registrationDeadline;
                        const isCompleted = tournament.status === 'completed';
                        const isFull = tournament.registeredTeams >= tournament.maxTeams;
                        const isJoined = tournament.isJoined;
                        
                        if (isJoined) {
                          return (
                            <Button variant="secondary" disabled className="w-full lg:w-auto whitespace-nowrap text-xs sm:text-sm bg-green-600 hover:bg-green-600">
                              ✓ Joined
                            </Button>
                          );
                        } else if (isCompleted) {
                          return (
                            <Button variant="secondary" disabled className="w-full lg:w-auto whitespace-nowrap text-xs sm:text-sm">
                              Game Completed
                            </Button>
                          );
                        } else if (isRegistrationClosed || isFull) {
                          return (
                            <Button variant="secondary" disabled className="w-full lg:w-auto whitespace-nowrap text-xs sm:text-sm">
                              Registration Closed
                            </Button>
                          );
                        } else {
                          return (
                            <Button 
                              variant="primary"
                              className="w-full lg:w-auto whitespace-nowrap text-xs sm:text-sm"
                              onClick={() => {
                                if (user) {
                                  setSelectedTournament(tournament);
                                  setIsRegistrationModalOpen(true);
                                } else {
                                  window.location.href = '/login';
                                }
                              }}
                            >
                              Join Now
                            </Button>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12 text-gray-400">No tournaments found</div>
        )}
      </div>

      <TournamentRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => {
          setIsRegistrationModalOpen(false);
          setSelectedTournament(null);
        }}
        tournament={selectedTournament}
        onSuccess={() => {
          alert('Registration submitted! Waiting for admin approval.');
          setIsRegistrationModalOpen(false);
          setSelectedTournament(null);
        }}
      />
      </div>
    </>
  );
};

export default Tournaments;

