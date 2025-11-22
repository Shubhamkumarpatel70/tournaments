import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { tournamentAPI } from '../utils/api';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredTournaments, setFeaturedTournaments] = useState([]);
  const [topTeams, setTopTeams] = useState([]);
  const [nextMatch, setNextMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournamentsRes, teamsRes] = await Promise.all([
          tournamentAPI.getAll({ featured: 'true' }),
          api.get('/leaderboard/top-teams?limit=5')
        ]);
        
        setFeaturedTournaments(tournamentsRes.data);
        setTopTeams(teamsRes.data);
        
        // Get next scheduled match for timer
        const allTournaments = await tournamentAPI.getAll({ status: 'upcoming' });
        const upcoming = allTournaments.data
          .filter(t => new Date(t.matchDate) > new Date())
          .sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate));
        
        if (upcoming.length > 0) {
          setNextMatch(upcoming[0]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!nextMatch?.matchDate) return;

    const targetDate = new Date(nextMatch.matchDate).getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    // Initial calculation
    const now = new Date().getTime();
    const difference = targetDate - now;
    if (difference > 0) {
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      });
    }

    return () => clearInterval(timer);
  }, [nextMatch]);

  return (
    <div className="page-transition overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gaming Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80')`
          }}
        ></div>
        
        {/* Dark Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-lava-black/90 via-charcoal/85 to-lava-black/90 z-10"></div>
        
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 z-5">
          <div className="w-full h-full bg-gradient-to-r from-lava-orange/10 via-fiery-yellow/5 to-lava-orange/10 animate-pulse"></div>
        </div>
        
        <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 neon-text drop-shadow-2xl">
            COMPETE. WIN. DOMINATE.
          </h1>

          {/* Countdown Timer */}
          {nextMatch && (
            <div className="mb-6 sm:mb-8">
              <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 flex-wrap px-2">
                <div className="bg-lava-black/80 border border-lava-orange/50 rounded-lg p-3 sm:p-4 md:p-5 min-w-[60px] sm:min-w-[70px] md:min-w-[80px] backdrop-blur-sm shadow-lg shadow-lava-orange/20">
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-lava-orange mb-1">
                    {String(timeLeft.days).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-gray-300 uppercase font-semibold">days</div>
                </div>
                <div className="bg-lava-black/80 border border-lava-orange/50 rounded-lg p-3 sm:p-4 md:p-5 min-w-[60px] sm:min-w-[70px] md:min-w-[80px] backdrop-blur-sm shadow-lg shadow-lava-orange/20">
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-lava-orange mb-1">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-gray-300 uppercase font-semibold">hours</div>
                </div>
                <div className="bg-lava-black/80 border border-lava-orange/50 rounded-lg p-3 sm:p-4 md:p-5 min-w-[60px] sm:min-w-[70px] md:min-w-[80px] backdrop-blur-sm shadow-lg shadow-lava-orange/20">
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-lava-orange mb-1">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-gray-300 uppercase font-semibold">minutes</div>
                </div>
                <div className="bg-lava-black/80 border border-lava-orange/50 rounded-lg p-3 sm:p-4 md:p-5 min-w-[60px] sm:min-w-[70px] md:min-w-[80px] backdrop-blur-sm shadow-lg shadow-lava-orange/20">
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-lava-orange mb-1">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-gray-300 uppercase font-semibold">seconds</div>
                </div>
              </div>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-fiery-yellow font-bold mb-4 sm:mb-6 px-2">
                Next Match: {new Date(nextMatch.matchDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}, {new Date(nextMatch.matchDate).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })}
              </p>
            </div>
          )}

          <Link to="/tournaments">
            <Button variant="registration" className="text-base sm:text-lg md:text-xl px-6 sm:px-8 py-3 sm:py-4">
              Register Now
            </Button>
          </Link>

          {/* Scrolling Prizes Ticker */}
          <div className="mt-8 sm:mt-12 overflow-hidden relative w-full max-w-full px-2">
            <div className="flex animate-scroll space-x-6 sm:space-x-8 whitespace-nowrap">
              <span className="text-fiery-yellow font-bold text-sm sm:text-base md:text-lg">🏆 Prize Pool: ₹2,00,000</span>
              <span className="text-fiery-yellow font-bold text-sm sm:text-base md:text-lg">🎮 500+ Active Players</span>
              <span className="text-fiery-yellow font-bold text-sm sm:text-base md:text-lg">⚡ Live Matches Daily</span>
              <span className="text-fiery-yellow font-bold text-sm sm:text-base md:text-lg">🏆 Prize Pool: ₹2,00,000</span>
              <span className="text-fiery-yellow font-bold text-sm sm:text-base md:text-lg">🎮 500+ Active Players</span>
              <span className="text-fiery-yellow font-bold text-sm sm:text-base md:text-lg">⚡ Live Matches Daily</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tournaments */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 bg-gradient-to-b from-charcoal via-lava-black to-charcoal">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 neon-text-cyan">Featured Tournaments</h2>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-3 sm:mb-4 px-2">
              Join the most exciting tournaments with massive prize pools. Register now and compete for glory!
            </p>
          </div>
          <div className="flex justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 flex-wrap px-2">
            <button className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-lava-orange text-lava-black font-bold rounded-lg hover:bg-fiery-yellow transition-colors shadow-lg shadow-lava-orange/30">All Games</button>
            {/* Games will be dynamically loaded from backend */}
          </div>

          {loading ? (
            <div className="text-center py-8 sm:py-12 text-gray-400 text-sm sm:text-base">Loading tournaments...</div>
          ) : featuredTournaments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featuredTournaments.map(tournament => (
                <div key={tournament._id} className="bg-charcoal border border-lava-orange/30 rounded-lg p-4 sm:p-6 hover:border-lava-orange transition-all hover:shadow-lava-glow">
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <span className="bg-lava-orange text-lava-black px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                      {tournament.game}
                    </span>
                    <span className="text-fiery-yellow font-bold text-sm sm:text-base">₹{tournament.prizePool?.toLocaleString()}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">{tournament.name}</h3>
                  <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
                    Date: {new Date(tournament.matchDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </p>
                  <div className="mb-3 sm:mb-4">
                    <div className="flex justify-between text-xs sm:text-sm mb-2">
                      <span>Registered: {tournament.registeredTeams || 0}/{tournament.maxTeams}</span>
                      <span>{Math.round(((tournament.registeredTeams || 0) / tournament.maxTeams) * 100)}%</span>
                    </div>
                    <div className="w-full bg-lava-black rounded-full h-2">
                      <div 
                        className="bg-lava-gradient h-2 rounded-full transition-all"
                        style={{ width: `${((tournament.registeredTeams || 0) / tournament.maxTeams) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <Button 
                    variant="primary" 
                    className="w-full"
                    onClick={() => {
                      if (user) {
                        navigate(`/tournaments?tournament=${tournament._id}`);
                      } else {
                        navigate('/login');
                      }
                    }}
                  >
                    Join Now
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">No featured tournaments available</div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 md:pb-24 bg-gradient-to-b from-charcoal via-lava-black to-charcoal relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-lava-orange rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-fiery-yellow rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 neon-text-cyan">How It Works</h2>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
              Join thousands of players competing for massive prize pools. Get started in three simple steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12 relative">
            {/* Step 1 */}
            <div className="text-center relative z-10 group transform transition-all duration-500 hover:-translate-y-2">
              <div className="relative mb-4 sm:mb-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-lava-orange to-fiery-yellow rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-3xl sm:text-4xl md:text-5xl font-bold text-lava-black shadow-lg shadow-lava-orange/50 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-lava-orange/70 transition-all duration-300">
                  <span className="relative z-10">1</span>
                  <div className="absolute inset-0 rounded-full bg-lava-orange animate-ping opacity-20"></div>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-fiery-yellow rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce"></div>
              </div>
              <div className="bg-lava-black/70 backdrop-blur-sm border border-lava-orange/30 rounded-xl p-4 sm:p-6 group-hover:border-lava-orange group-hover:shadow-2xl group-hover:shadow-lava-orange/50 transition-all duration-300 transform group-hover:scale-105">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 transform group-hover:scale-110 transition-transform duration-300">📝</div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-lava-orange group-hover:text-fiery-yellow transition-colors">Register</h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                  Create your account and form your team. Choose your game and get ready to compete.
                </p>
                <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-lava-orange font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  → Get Started
                </div>
              </div>
            </div>

            {/* Connector Line */}
            <div className="hidden md:block absolute top-14 left-1/3 right-1/3 h-1 bg-gradient-to-r from-lava-orange via-fiery-yellow to-lava-orange z-0 opacity-50">
              <div className="h-full w-full bg-lava-gradient animate-pulse"></div>
            </div>

            {/* Step 2 */}
            <div className="text-center relative z-10 group transform transition-all duration-500 hover:-translate-y-2">
              <div className="relative mb-4 sm:mb-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-lava-orange to-fiery-yellow rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-3xl sm:text-4xl md:text-5xl font-bold text-lava-black shadow-lg shadow-lava-orange/50 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-lava-orange/70 transition-all duration-300">
                  <span className="relative z-10">2</span>
                  <div className="absolute inset-0 rounded-full bg-lava-orange animate-ping opacity-20"></div>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-fiery-yellow rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce"></div>
              </div>
              <div className="bg-lava-black/70 backdrop-blur-sm border border-lava-orange/30 rounded-xl p-4 sm:p-6 group-hover:border-lava-orange group-hover:shadow-2xl group-hover:shadow-lava-orange/50 transition-all duration-300 transform group-hover:scale-105">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 transform group-hover:scale-110 transition-transform duration-300">⚔️</div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-lava-orange group-hover:text-fiery-yellow transition-colors">Compete</h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                  Join scheduled matches and tournaments. Show your skills and climb the leaderboard.
                </p>
                <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-lava-orange font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  → Join Tournament
                </div>
              </div>
            </div>

            {/* Connector Line */}
            <div className="hidden md:block absolute top-14 left-2/3 right-0 h-1 bg-gradient-to-r from-lava-orange via-fiery-yellow to-lava-orange z-0 opacity-50">
              <div className="h-full w-full bg-lava-gradient animate-pulse"></div>
            </div>

            {/* Step 3 */}
            <div className="text-center relative z-10 group transform transition-all duration-500 hover:-translate-y-2">
              <div className="relative mb-4 sm:mb-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-lava-orange to-fiery-yellow rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-3xl sm:text-4xl md:text-5xl font-bold text-lava-black shadow-lg shadow-lava-orange/50 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-lava-orange/70 transition-all duration-300">
                  <span className="relative z-10">3</span>
                  <div className="absolute inset-0 rounded-full bg-lava-orange animate-ping opacity-20"></div>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-fiery-yellow rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce"></div>
              </div>
              <div className="bg-lava-black/70 backdrop-blur-sm border border-lava-orange/30 rounded-xl p-4 sm:p-6 group-hover:border-lava-orange group-hover:shadow-2xl group-hover:shadow-lava-orange/50 transition-all duration-300 transform group-hover:scale-105">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 transform group-hover:scale-110 transition-transform duration-300">🏆</div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-lava-orange group-hover:text-fiery-yellow transition-colors">Win</h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                  Claim your prizes and earn your place among the champions. Build your reputation and earnings.
                </p>
                <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-lava-orange font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  → Claim Prize
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Teams Leaderboard */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8 neon-text-cyan">Top Teams</h2>
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-lava-orange/20">
                <tr>
                  <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm">Rank</th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm">Team Name</th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm">Wins</th>
                  <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-3 sm:px-4 md:px-6 py-6 sm:py-8 text-center text-gray-400 text-sm sm:text-base">Loading...</td>
                  </tr>
                ) : topTeams.length > 0 ? (
                  topTeams.map(team => (
                    <tr key={team.rank} className="border-t border-lava-orange/10 hover:bg-lava-orange/5 transition-colors">
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                        <span className={`text-lg sm:text-xl md:text-2xl font-bold ${
                          team.rank === 1 ? 'text-fiery-yellow' : team.rank <= 3 ? 'text-lava-orange' : 'text-off-white'
                        }`}>
                          #{team.rank}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-bold text-sm sm:text-base">{team.teamName}</td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm sm:text-base">{team.wins}</td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-fiery-yellow font-bold text-sm sm:text-base">₹{team.earnings?.toLocaleString() || '0'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-3 sm:px-4 md:px-6 py-6 sm:py-8 text-center text-gray-400 text-sm sm:text-base">No teams yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
