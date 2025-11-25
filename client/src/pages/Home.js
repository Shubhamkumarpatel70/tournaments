import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { tournamentAPI } from '../utils/api';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import RegistrationCountdown from '../components/RegistrationCountdown';
import SEO from '../components/SEO';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredTournaments, setFeaturedTournaments] = useState([]);
  const [topTeams, setTopTeams] = useState([]);
  const [nextMatch, setNextMatch] = useState(null);
  const [homeImage, setHomeImage] = useState(null);
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
        const [tournamentsRes, teamsRes, homeImageRes] = await Promise.all([
          tournamentAPI.getAll({ featured: 'true' }),
          api.get('/leaderboard/top-teams?limit=5'),
          api.get('/home-images/active')
        ]);
        
        setFeaturedTournaments(tournamentsRes.data);
        setTopTeams(teamsRes.data);
        setHomeImage(homeImageRes.data);
        
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
    <>
      <SEO
        title="Arena of Champions - Compete. Win. Dominate. | BGMI & Free Fire Tournaments"
        description="Join Arena of Champions (arenaofchampions) - India's premier gaming tournament platform. Compete in BGMI and Free Fire tournaments, win massive cash prizes, and dominate the leaderboards. Register now for free and showcase your skills in competitive esports battles!"
        keywords="Arena of Champions, arena of champions, arenaofchampions, aoc, harshvardhan, harsh vardhan, ranjeet kumar, shubham kumar, quantum university, arena of champions ranjeet kumar, arena of champions harshvardhan, BGMI tournaments, Free Fire tournaments, gaming tournaments, esports, battle royale, mobile gaming, tournament platform, gaming competitions, prize pool, leaderboards, online gaming, competitive gaming, mobile esports, PUBG Mobile, battle royale tournaments, gaming community, esports platform India, BGMI tournament India, Free Fire tournament India, online gaming tournament, mobile esports tournament, competitive gaming platform, BGMI tournament with cash prize, Free Fire tournament registration, gaming tournament leaderboard"
        url="/"
      />
      <div className="page-transition overflow-x-hidden">
        {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gaming Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110"
          style={{
            backgroundImage: `url('${homeImage?.imageUrl || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80'}')`,
            animation: 'zoomIn 20s ease-in-out infinite alternate'
          }}
        ></div>
        
        {/* Dark Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-lava-black/90 via-charcoal/85 to-lava-black/90 z-10"></div>
        
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 z-5">
          <div className="w-full h-full bg-gradient-to-r from-lava-orange/10 via-fiery-yellow/5 to-lava-orange/10 animate-pulse"></div>
        </div>
        
        {/* Floating Particles Effect */}
        <div className="absolute inset-0 z-15 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-lava-orange/60 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            ></div>
          ))}
        </div>
        
        <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8 animate-fadeIn">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-fiery-yellow drop-shadow-lg animate-fadeIn">
            Arena of Champions
          </h2>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 neon-text drop-shadow-2xl animate-slideDown leading-tight break-words">
            <span className="block sm:inline">COMPETE.</span>{' '}
            <span className="block sm:inline">WIN.</span>{' '}
            <span className="block sm:inline">DOMINATE.</span>
          </h1>

          {/* Countdown Timer */}
          {nextMatch && (
            <div className="mb-6 sm:mb-8 animate-fadeInUp">
              <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 flex-wrap px-2">
                <div className="bg-lava-black/80 border border-lava-orange/50 rounded-lg p-3 sm:p-4 md:p-5 min-w-[60px] sm:min-w-[70px] md:min-w-[80px] backdrop-blur-sm shadow-lg shadow-lava-orange/20 hover:shadow-lava-orange/40 hover:border-lava-orange transition-all transform hover:scale-110">
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-lava-orange mb-1 drop-shadow-lg">
                    {String(timeLeft.days).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-gray-300 uppercase font-semibold">days</div>
                </div>
                <div className="bg-lava-black/80 border border-lava-orange/50 rounded-lg p-3 sm:p-4 md:p-5 min-w-[60px] sm:min-w-[70px] md:min-w-[80px] backdrop-blur-sm shadow-lg shadow-lava-orange/20 hover:shadow-lava-orange/40 hover:border-lava-orange transition-all transform hover:scale-110">
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-lava-orange mb-1 drop-shadow-lg">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-gray-300 uppercase font-semibold">hours</div>
                </div>
                <div className="bg-lava-black/80 border border-lava-orange/50 rounded-lg p-3 sm:p-4 md:p-5 min-w-[60px] sm:min-w-[70px] md:min-w-[80px] backdrop-blur-sm shadow-lg shadow-lava-orange/20 hover:shadow-lava-orange/40 hover:border-lava-orange transition-all transform hover:scale-110">
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-lava-orange mb-1 drop-shadow-lg">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-gray-300 uppercase font-semibold">minutes</div>
                </div>
                <div className="bg-lava-black/80 border border-lava-orange/50 rounded-lg p-3 sm:p-4 md:p-5 min-w-[60px] sm:min-w-[70px] md:min-w-[80px] backdrop-blur-sm shadow-lg shadow-lava-orange/20 hover:shadow-lava-orange/40 hover:border-lava-orange transition-all transform hover:scale-110">
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-lava-orange mb-1 drop-shadow-lg">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-gray-300 uppercase font-semibold">seconds</div>
                </div>
              </div>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-fiery-yellow font-bold mb-4 sm:mb-6 px-2 drop-shadow-lg">
                ⚡ Next Match: {(() => {
                  const date = new Date(nextMatch.matchDate);
                  const day = String(date.getDate()).padStart(2, '0');
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const year = String(date.getFullYear()).slice(-2);
                  const time = date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  });
                  return `${day}-${month}-${year}, ${time}`;
                })()}
              </p>
            </div>
          )}

          <div className="animate-fadeInUp">
            <Link to="/tournaments">
              <Button variant="registration" className="text-base sm:text-lg md:text-xl px-6 sm:px-8 py-3 sm:py-4 transform hover:scale-105 transition-transform duration-300 shadow-2xl shadow-lava-orange/50 hover:shadow-lava-orange/70">
                Register Now
              </Button>
            </Link>
          </div>

          {/* Scrolling Prizes Ticker */}
          <div className="mt-8 sm:mt-12 overflow-hidden relative w-full max-w-full px-2">
            <div className="flex animate-scroll space-x-6 sm:space-x-8 whitespace-nowrap">
              <span className="text-fiery-yellow font-bold text-sm sm:text-base md:text-lg flex items-center gap-2">
                <span className="text-2xl">🏆</span> Prize Pool: ₹2,00,000
              </span>
              <span className="text-fiery-yellow font-bold text-sm sm:text-base md:text-lg flex items-center gap-2">
                <span className="text-2xl">🎮</span> 500+ Active Players
              </span>
              <span className="text-fiery-yellow font-bold text-sm sm:text-base md:text-lg flex items-center gap-2">
                <span className="text-2xl">⚡</span> Live Matches Daily
              </span>
              <span className="text-fiery-yellow font-bold text-sm sm:text-base md:text-lg flex items-center gap-2">
                <span className="text-2xl">🏆</span> Prize Pool: ₹2,00,000
              </span>
              <span className="text-fiery-yellow font-bold text-sm sm:text-base md:text-lg flex items-center gap-2">
                <span className="text-2xl">🎮</span> 500+ Active Players
              </span>
              <span className="text-fiery-yellow font-bold text-sm sm:text-base md:text-lg flex items-center gap-2">
                <span className="text-2xl">⚡</span> Live Matches Daily
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tournaments */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 bg-gradient-to-b from-charcoal via-lava-black to-charcoal relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-lava-orange rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-fiery-yellow rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8 sm:mb-12 animate-fadeIn">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 neon-text-cyan">Featured Tournaments</h2>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-3 sm:mb-4 px-2">
              Join the most exciting tournaments with massive prize pools. Register now and compete for glory!
            </p>
          </div>
          <div className="flex justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 flex-wrap px-2">
            <button className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-lava-orange text-lava-black font-bold rounded-lg hover:bg-fiery-yellow transition-all shadow-lg shadow-lava-orange/30 hover:shadow-lava-orange/50 transform hover:scale-105">
              All Games
            </button>
            {/* Games will be dynamically loaded from backend */}
          </div>

          {loading ? (
            <div className="text-center py-8 sm:py-12 text-gray-400 text-sm sm:text-base">Loading tournaments...</div>
          ) : featuredTournaments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featuredTournaments.map((tournament, index) => (
                <div 
                  key={tournament._id} 
                  className="bg-charcoal border border-lava-orange/30 rounded-lg p-4 sm:p-6 hover:border-lava-orange transition-all hover:shadow-lava-glow transform hover:scale-105 hover:-translate-y-2 duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
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
                    className="w-full transform hover:scale-105 transition-transform"
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
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 md:pb-24 bg-gradient-to-b from-charcoal via-lava-black to-charcoal">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 neon-text-cyan">How It Works</h2>
            <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-3xl mx-auto px-2 leading-relaxed">
              Join thousands of players competing for massive prize pools. Get started in three simple steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-lava-orange to-fiery-yellow rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl font-bold text-lava-black shadow-lg shadow-lava-orange/50">
                1
              </div>
              <div className="bg-lava-black/70 backdrop-blur-sm border border-lava-orange/30 rounded-xl p-4 sm:p-6">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">📝</div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-lava-orange">Register</h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                  Create your account and form your team. Choose your game and get ready to compete.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-lava-orange to-fiery-yellow rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl font-bold text-lava-black shadow-lg shadow-lava-orange/50">
                2
              </div>
              <div className="bg-lava-black/70 backdrop-blur-sm border border-lava-orange/30 rounded-xl p-4 sm:p-6">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">⚔️</div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-lava-orange">Compete</h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                  Join scheduled matches and tournaments. Show your skills and climb the leaderboard.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-lava-orange to-fiery-yellow rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl font-bold text-lava-black shadow-lg shadow-lava-orange/50">
                3
              </div>
              <div className="bg-lava-black/70 backdrop-blur-sm border border-lava-orange/30 rounded-xl p-4 sm:p-6">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🏆</div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-lava-orange">Win</h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                  Claim your prizes and earn your place among the champions. Build your reputation and earnings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Teams Leaderboard */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 bg-gradient-to-b from-charcoal via-lava-black to-charcoal relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-lava-orange rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-fiery-yellow rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8 sm:mb-12 animate-fadeIn">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 neon-text-cyan">Top Teams</h2>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
              See the best performing teams and their earnings. Compete to reach the top!
            </p>
          </div>
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg overflow-hidden overflow-x-auto shadow-2xl shadow-lava-orange/20">
            <table className="w-full min-w-[500px]">
              <thead className="bg-gradient-to-r from-lava-orange/40 via-fiery-yellow/30 to-lava-orange/40 border-b-2 border-lava-orange/50">
                <tr>
                  <th className="px-4 sm:px-6 md:px-8 py-4 text-left text-sm sm:text-base font-bold text-off-white">Rank</th>
                  <th className="px-4 sm:px-6 md:px-8 py-4 text-left text-sm sm:text-base font-bold text-off-white">Team Name</th>
                  <th className="px-4 sm:px-6 md:px-8 py-4 text-left text-sm sm:text-base font-bold text-off-white">Game</th>
                  <th className="px-4 sm:px-6 md:px-8 py-4 text-left text-sm sm:text-base font-bold text-off-white">Winings</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-4 sm:px-6 md:px-8 py-8 sm:py-12 text-center text-gray-400 text-sm sm:text-base">Loading top teams...</td>
                  </tr>
                ) : topTeams.length > 0 ? (
                  topTeams.map((team, index) => (
                    <tr 
                      key={team.rank || index} 
                      className={`border-t transition-all ${
                        team.rank === 1 
                          ? 'bg-gradient-to-r from-fiery-yellow/20 via-fiery-yellow/10 to-transparent border-l-4 border-fiery-yellow' 
                          : team.rank <= 3 
                          ? 'bg-gradient-to-r from-lava-orange/10 via-lava-orange/5 to-transparent border-l-4 border-lava-orange' 
                          : 'border-lava-orange/10 hover:bg-lava-orange/5'
                      }`}
                    >
                      <td className="px-4 sm:px-6 md:px-8 py-4">
                        <div className="flex items-center gap-2">
                          {team.rank === 1 && <span className="text-2xl">🥇</span>}
                          {team.rank === 2 && <span className="text-2xl">🥈</span>}
                          {team.rank === 3 && <span className="text-2xl">🥉</span>}
                          <span className={`text-lg sm:text-xl md:text-2xl font-bold ${
                            team.rank === 1 ? 'text-fiery-yellow' : team.rank <= 3 ? 'text-lava-orange' : 'text-off-white'
                          }`}>
                            #{team.rank || index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 md:px-8 py-4">
                        <div className="font-bold text-sm sm:text-base text-off-white">{team.teamName || 'N/A'}</div>
                      </td>
                      <td className="px-4 sm:px-6 md:px-8 py-4">
                        {team.game ? (
                          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-lava-orange/40 to-fiery-yellow/30 text-off-white px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                            <span className="w-2 h-2 bg-fiery-yellow rounded-full animate-pulse"></span>
                            {team.game}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 md:px-8 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">💰</span>
                          <span className="text-fiery-yellow font-bold text-sm sm:text-base">₹{team.earnings?.toLocaleString() || '0'}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-4xl">🏆</span>
                        <p className="text-gray-400 text-sm sm:text-base">No teams yet. Be the first to compete!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      </div>
    </>
  );
};

export default Home;
