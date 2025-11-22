import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Button from './Button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTournamentsOpen, setIsTournamentsOpen] = useState(false);
  const [games, setGames] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await api.get('/games');
        setGames(response.data.filter(g => g.isActive));
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };
    fetchGames();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'accountant') return '/accountant/dashboard';
    return '/dashboard';
  };

  return (
    <nav className="bg-charcoal border-b border-lava-orange/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-lg sm:text-xl md:text-2xl font-bold neon-text-cyan tracking-wider">
              arenaofchampions
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-off-white hover:text-lava-orange transition-colors">
              Home
            </Link>
            
            {/* Tournaments Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsTournamentsOpen(true)}
              onMouseLeave={() => setIsTournamentsOpen(false)}
            >
              <button className="text-off-white hover:text-lava-orange transition-colors flex items-center">
                Tournaments
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isTournamentsOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-charcoal border border-lava-orange/30 rounded-lg shadow-lg py-2">
                  {games.map(game => (
                    <Link 
                      key={game._id} 
                      to={`/tournaments?game=${game.name.toLowerCase().replace(/\s+/g, '')}`} 
                      className="block px-4 py-2 text-off-white hover:bg-lava-orange hover:text-lava-black transition-colors"
                    >
                      {game.name}
                    </Link>
                  ))}
                  <Link to="/tournaments" className="block px-4 py-2 text-off-white hover:bg-lava-orange hover:text-lava-black transition-colors">
                    All
                  </Link>
                </div>
              )}
            </div>

            <Link to="/leaderboards" className="text-off-white hover:text-lava-orange transition-colors">
              Leaderboards
            </Link>
            <Link to="/about" className="text-off-white hover:text-lava-orange transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="text-off-white hover:text-lava-orange transition-colors">
              Contact
            </Link>
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to={getDashboardPath()}>
                  <span className="text-off-white hover:text-lava-orange transition-colors">
                    {user.name}
                  </span>
                </Link>
                <Button variant="secondary" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="secondary">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-off-white hover:text-lava-orange"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-charcoal border-t border-lava-orange/20">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link to="/" className="block py-2 text-off-white hover:text-lava-orange">
              Home
            </Link>
            <Link to="/tournaments" className="block py-2 text-off-white hover:text-lava-orange">
              Tournaments
            </Link>
            <Link to="/leaderboards" className="block py-2 text-off-white hover:text-lava-orange">
              Leaderboards
            </Link>
            <Link to="/about" className="block py-2 text-off-white hover:text-lava-orange">
              About Us
            </Link>
            <Link to="/contact" className="block py-2 text-off-white hover:text-lava-orange">
              Contact
            </Link>
            <div className="pt-4 space-y-2">
              {user ? (
                <>
                  <Link to={getDashboardPath()} className="block">
                    <Button variant="secondary" className="w-full">{user.name}</Button>
                  </Link>
                  <Button variant="primary" className="w-full" onClick={handleLogout}>Logout</Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="secondary" className="w-full">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

