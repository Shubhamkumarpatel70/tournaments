import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { tournamentAPI } from '../utils/api';
import api from '../utils/api';
import Button from '../components/Button';
import CreateTournamentModal from '../components/CreateTournamentModal';
import CreateGameModal from '../components/CreateGameModal';
import SendNotificationModal from '../components/SendNotificationModal';
import PaymentOptionModal from '../components/PaymentOptionModal';
import LeaderboardManagement from '../components/LeaderboardManagement';
import MatchScheduleModal from '../components/MatchScheduleModal';
import EditTournamentModal from '../components/EditTournamentModal';
import EditGameModal from '../components/EditGameModal';
import EditNotificationModal from '../components/EditNotificationModal';
import EditPaymentOptionModal from '../components/EditPaymentOptionModal';
import TournamentTypesManagement from '../components/TournamentTypesManagement';
import HomeImageManagement from '../components/HomeImageManagement';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTournaments: 0,
    ongoingTournaments: 0,
    upcomingTournaments: 0,
    totalPrizePool: 0
  });
  const [tournaments, setTournaments] = useState([]);
  const [ongoingMatches, setOngoingMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [games, setGames] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [isEditGameModalOpen, setIsEditGameModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isEditNotificationModalOpen, setIsEditNotificationModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState(null);
  const [isEditTournamentModalOpen, setIsEditTournamentModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [matchSchedules, setMatchSchedules] = useState([]);
  const [selectedMatchSchedule, setSelectedMatchSchedule] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [selectedTournamentForReg, setSelectedTournamentForReg] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPaymentProofModalOpen, setIsPaymentProofModalOpen] = useState(false);
  const [selectedPaymentProof, setSelectedPaymentProof] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchRegistrations = async (tournamentId) => {
    try {
      const response = await api.get(`/tournament-registrations/tournament/${tournamentId}`);
      setRegistrations(response.data);
      setFilteredRegistrations(response.data);
      setSelectedTournamentForReg(tournamentId);
      setStatusFilter('all');
      setPaymentFilter('all');
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  // Filter registrations
  useEffect(() => {
    let filtered = [...registrations];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(reg => reg.status === statusFilter);
    }
    
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(reg => reg.paymentType === paymentFilter);
    }
    
    setFilteredRegistrations(filtered);
  }, [statusFilter, paymentFilter, registrations]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      console.log('Fetching users from /api/users...');
      const response = await api.get('/users');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          console.log(`Successfully fetched ${response.data.length} users`);
          setUsers(response.data);
        } else {
          console.error('Invalid response format - expected array, got:', typeof response.data);
          setUsers([]);
        }
      } else {
        console.error('No response data received');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.message);
      setUsers([]);
      
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      alert(`Failed to fetch users: ${errorMessage}\n\nCheck browser console for more details.`);
    } finally {
      setLoadingUsers(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      await fetchUsers(); // Refresh users list
      alert('User role updated successfully!');
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role. Please try again.');
    }
  };

  const fetchData = async () => {
    try {
      const [tournamentsRes, gamesRes, notificationsRes, paymentOptionsRes, usersRes, schedulesRes, contactsRes, newsletterRes] = await Promise.all([
        tournamentAPI.getAll(),
        api.get('/games/all'),
        api.get('/notifications'),
        api.get('/payment-options/all'),
        api.get('/users/leaderboard/top?limit=10'),
        api.get('/match-schedules/all').catch(() => ({ data: [] })),
        api.get('/contacts').catch(() => ({ data: [] })),
        api.get('/newsletter').catch(() => ({ data: [] }))
      ]);
      
      setTournaments(tournamentsRes.data);
      setGames(gamesRes.data);
      setNotifications(notificationsRes.data);
      setPaymentOptions(paymentOptionsRes.data);
      setMatchSchedules(schedulesRes.data || []);
      setContacts(contactsRes.data || []);
      setNewsletterSubscribers(newsletterRes.data || []);
      
      const ongoing = tournamentsRes.data.filter(t => t.status === 'ongoing');
      const upcoming = tournamentsRes.data.filter(t => t.status === 'upcoming');
      
      setOngoingMatches(ongoing);
      setUpcomingMatches(upcoming);
      
      setStats({
        totalUsers: usersRes.data.length,
        totalTournaments: tournamentsRes.data.length,
        ongoingTournaments: ongoing.length,
        upcomingTournaments: upcoming.length,
        totalPrizePool: tournamentsRes.data.reduce((sum, t) => sum + (t.prizePool || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleTournamentCreated = () => {
    fetchData();
    setIsTournamentModalOpen(false);
  };

  const handleGameCreated = () => {
    fetchData();
    setIsGameModalOpen(false);
  };

  const handleNotificationSent = () => {
    fetchData();
    setIsNotificationModalOpen(false);
  };

  const handlePaymentOptionCreated = () => {
    fetchData();
    setIsPaymentModalOpen(false);
  };

  const [isMatchScheduleModalOpen, setIsMatchScheduleModalOpen] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tournaments', label: 'Tournaments' },
    { id: 'tournament-types', label: 'Tournament Types' },
    { id: 'home-image', label: 'Home Image' },
    { id: 'ongoing', label: 'Ongoing Matches' },
    { id: 'upcoming', label: 'Upcoming Matches' },
    { id: 'registrations', label: 'Registrations' },
    { id: 'match-schedule', label: 'Match Schedule' },
    { id: 'games', label: 'Games' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'payments', label: 'Payment Options' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'users', label: 'Manage Users' },
    { id: 'contacts', label: 'Contact Queries' },
    { id: 'newsletter', label: 'Newsletter' }
  ];

  return (
    <div className="min-h-screen py-12 px-4 page-transition">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-2 neon-text-cyan">Admin Dashboard</h1>
        <p className="text-gray-400 mb-8">Welcome, {user?.name} (Admin)</p>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-lava-orange/20 pb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                activeTab === tab.id
                  ? 'bg-lava-orange text-lava-black'
                  : 'bg-charcoal border border-lava-orange/30 text-off-white hover:bg-lava-orange hover:text-lava-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
                <div className="text-3xl font-bold text-lava-orange mb-2">{stats.totalUsers}</div>
                <div className="text-gray-400">Total Users</div>
              </div>
              <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
                <div className="text-3xl font-bold text-lava-orange mb-2">{stats.totalTournaments}</div>
                <div className="text-gray-400">Total Tournaments</div>
              </div>
              <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
                <div className="text-3xl font-bold text-fiery-yellow mb-2">{stats.ongoingTournaments}</div>
                <div className="text-gray-400">Ongoing Matches</div>
              </div>
              <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
                <div className="text-3xl font-bold text-fiery-yellow mb-2">₹{stats.totalPrizePool.toLocaleString()}</div>
                <div className="text-gray-400">Total Prize Pool</div>
              </div>
            </div>
          </>
        )}

        {/* Tournaments Tab */}
        {activeTab === 'tournaments' && (
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-lava-orange">All Tournaments</h2>
              <Button variant="primary" onClick={() => setIsTournamentModalOpen(true)}>
                + Create Tournament
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tournaments.map(tournament => (
                <div key={tournament._id} className="bg-lava-black border border-lava-orange/20 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold">{tournament.name}</h3>
                      <p className="text-gray-400 text-sm">{tournament.game} • {tournament.tournamentType} • {tournament.status}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-fiery-yellow font-bold">₹{tournament.prizePool?.toLocaleString()}</div>
                      <div className="text-gray-400 text-sm">{tournament.registeredTeams}/{tournament.maxTeams}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        setSelectedTournament(tournament);
                        setIsEditTournamentModalOpen(true);
                      }}
                      className="px-3 py-1 bg-lava-orange text-lava-black text-xs font-bold rounded hover:bg-fiery-yellow"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this tournament?')) {
                          try {
                            await api.delete(`/tournaments/${tournament._id}`);
                            fetchData();
                          } catch (error) {
                            alert('Error deleting tournament');
                          }
                        }
                      }}
                      className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ongoing Matches Tab */}
        {activeTab === 'ongoing' && (
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-lava-orange">Ongoing Matches</h2>
            {ongoingMatches.length > 0 ? (
              <div className="space-y-4">
                {ongoingMatches.map(match => {
                  // Find match schedules for this tournament
                  const matchSchedule = matchSchedules.find(s => 
                    s.tournamentId?._id?.toString() === match._id?.toString() || 
                    s.tournamentId?.toString() === match._id?.toString()
                  );
                  
                  return (
                    <div key={match._id} className="bg-lava-black border border-lava-orange/20 rounded-lg p-4 hover:border-lava-orange transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-lava-orange text-lava-black px-3 py-1 rounded-full text-sm font-bold">
                              {match.game}
                            </span>
                            <h3 className="font-bold text-lg">{match.name}</h3>
                            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                              🔴 LIVE
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">
                            {match.tournamentType} • {match.mode}
                          </p>
                          <p className="text-gray-400 text-sm">
                            📅 Started: {new Date(match.matchDate || match.date).toLocaleString()}
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            👥 {match.registeredTeams || 0}/{match.maxTeams} teams registered
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-fiery-yellow font-bold text-xl mb-2">
                            ₹{match.prizePool?.toLocaleString()}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedTournament(match);
                                setIsEditTournamentModalOpen(true);
                              }}
                              className="px-3 py-1 bg-lava-orange text-lava-black text-xs font-bold rounded hover:bg-fiery-yellow transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm('Mark this tournament as completed?')) {
                                  try {
                                    await api.put(`/tournaments/${match._id}`, { status: 'completed' });
                                    fetchData();
                                  } catch (error) {
                                    alert('Error updating tournament status');
                                  }
                                }
                              }}
                              className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600 transition-colors"
                            >
                              Complete
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Match Schedule Info */}
                      {matchSchedule && (
                        <div className="mt-3 pt-3 border-t border-lava-orange/10">
                          <p className="text-sm text-gray-400 mb-2">Match Schedule:</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-gray-400">Game ID:</span>
                              <p className="text-lava-orange font-mono font-bold">{matchSchedule.gameId}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Password:</span>
                              <p className="text-lava-orange font-mono font-bold">{matchSchedule.password}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Type:</span>
                              <p className="text-off-white">{matchSchedule.tournamentType}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Match Date:</span>
                              <p className="text-off-white">
                                {new Date(matchSchedule.matchDate).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No ongoing matches</p>
                <p className="text-gray-500 text-sm">
                  Tournaments with status "ongoing" will appear here. Edit a tournament to change its status.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Upcoming Matches Tab */}
        {activeTab === 'upcoming' && (
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-lava-orange">Upcoming Matches</h2>
            {upcomingMatches.length > 0 ? (
              <div className="space-y-4">
                {upcomingMatches.map(match => (
                  <div key={match._id} className="bg-lava-black border border-lava-orange/20 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">{match.name}</h3>
                        <p className="text-gray-400 text-sm">
                          {match.game} • {new Date(match.matchDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-fiery-yellow font-bold">₹{match.prizePool?.toLocaleString()}</div>
                        <div className="text-gray-400 text-sm">{match.registeredTeams}/{match.maxTeams} teams</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No upcoming matches</p>
            )}
          </div>
        )}

        {/* Tournament Types Tab */}
        {activeTab === 'tournament-types' && (
          <TournamentTypesManagement />
        )}

        {/* Home Image Tab */}
        {activeTab === 'home-image' && (
          <HomeImageManagement />
        )}

        {/* Games Tab */}
        {activeTab === 'games' && (
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-lava-orange">Games</h2>
              <Button variant="primary" onClick={() => setIsGameModalOpen(true)}>
                + Add Game
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {games.map(game => (
                <div key={game._id} className="bg-lava-black border border-lava-orange/20 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold">{game.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      game.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {game.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        setSelectedGame(game);
                        setIsEditGameModalOpen(true);
                      }}
                      className="px-3 py-1 bg-lava-orange text-lava-black text-xs font-bold rounded hover:bg-fiery-yellow"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this game?')) {
                          try {
                            await api.delete(`/games/${game._id}`);
                            fetchData();
                          } catch (error) {
                            alert('Error deleting game');
                          }
                        }
                      }}
                      className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-lava-orange">Notifications</h2>
              <Button variant="primary" onClick={() => setIsNotificationModalOpen(true)}>
                + Send Notification
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map(notif => (
                <div key={notif._id} className="bg-lava-black border border-lava-orange/20 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold">{notif.title}</h3>
                      <p className="text-gray-400 text-sm">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">Target: {notif.target}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      notif.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {notif.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        setSelectedNotification(notif);
                        setIsEditNotificationModalOpen(true);
                      }}
                      className="px-3 py-1 bg-lava-orange text-lava-black text-xs font-bold rounded hover:bg-fiery-yellow"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this notification?')) {
                          try {
                            await api.delete(`/notifications/${notif._id}`);
                            fetchData();
                          } catch (error) {
                            alert('Error deleting notification');
                          }
                        }
                      }}
                      className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Options Tab */}
        {activeTab === 'payments' && (
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-lava-orange">Payment Options</h2>
              <Button variant="primary" onClick={() => setIsPaymentModalOpen(true)}>
                + Add Payment Option
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentOptions.map(option => (
                <div key={option._id} className="bg-lava-black border border-lava-orange/20 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold">{option.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      option.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {option.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">Type: {option.type}</p>
                  <p className="text-sm text-gray-400">Details: {option.details}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        setSelectedPaymentOption(option);
                        setIsEditPaymentModalOpen(true);
                      }}
                      className="px-3 py-1 bg-lava-orange text-lava-black text-xs font-bold rounded hover:bg-fiery-yellow"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this payment option?')) {
                          try {
                            await api.delete(`/payment-options/${option._id}`);
                            fetchData();
                          } catch (error) {
                            alert('Error deleting payment option');
                          }
                        }
                      }}
                      className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Registrations Tab */}
        {activeTab === 'registrations' && (
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-lava-orange">Tournament Registrations</h2>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-lava-orange">Tournament</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      fetchRegistrations(e.target.value);
                    } else {
                      setRegistrations([]);
                      setFilteredRegistrations([]);
                    }
                  }}
                  className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
                >
                  <option value="">Select Tournament</option>
                  {tournaments.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 text-lava-orange">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-2 text-lava-orange">Payment Type</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
                >
                  <option value="all">All Payment Types</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Wallet">Wallet</option>
                  <option value="Card">Card</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            {selectedTournamentForReg && (
              <div className="mb-4 text-sm text-gray-400">
                Showing {filteredRegistrations.length} of {registrations.length} registrations
              </div>
            )}

            {filteredRegistrations.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredRegistrations.map(reg => (
                  <div key={reg._id} className="bg-lava-black border border-lava-orange/20 rounded-lg p-4 hover:border-lava-orange transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{reg.teamName}</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Players: {reg.numberOfPlayers} • Payment: {reg.paymentType} - {reg.paymentOption}
                        </p>
                        {reg.phoneNumber && (
                          <p className="text-sm text-gray-400 mt-1">
                            📱 Phone: {reg.phoneNumber}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Registered: {new Date(reg.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          reg.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          reg.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {reg.status}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedRegistration(reg);
                            setIsViewModalOpen(true);
                          }}
                          className="px-3 py-1 bg-lava-orange text-lava-black text-xs font-bold rounded hover:bg-fiery-yellow transition-colors"
                        >
                          View
                        </button>
                        {reg.paymentProof && (
                          <button
                            onClick={() => {
                              setSelectedPaymentProof(reg.paymentProof);
                              setIsPaymentProofModalOpen(true);
                            }}
                            className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded hover:bg-blue-600 transition-colors"
                          >
                            View Payment
                          </button>
                        )}
                      </div>
                    </div>
                    {reg.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={async () => {
                            try {
                              await api.put(`/tournament-registrations/${reg._id}/approve`);
                              fetchRegistrations(reg.tournamentId);
                            } catch (error) {
                              alert('Error approving registration');
                            }
                          }}
                          className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={async () => {
                            const reason = prompt('Enter rejection reason:');
                            if (reason) {
                              try {
                                await api.put(`/tournament-registrations/${reg._id}/reject`, { rejectionReason: reason });
                                fetchRegistrations(reg.tournamentId);
                              } catch (error) {
                                alert('Error rejecting registration');
                              }
                            }
                          }}
                          className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {reg.status === 'rejected' && reg.rejectionReason && (
                      <p className="text-xs text-red-400 mt-2">Reason: {reg.rejectionReason}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : selectedTournamentForReg ? (
              <p className="text-gray-400 text-center py-8">No registrations found matching the filters</p>
            ) : (
              <p className="text-gray-400 text-center py-8">Select a tournament to view registrations</p>
            )}
          </div>
        )}

        {/* Match Schedule Tab */}
        {activeTab === 'match-schedule' && (
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-lava-orange">Match Schedules</h2>
              <Button variant="primary" onClick={() => {
                setSelectedMatchSchedule(null);
                setIsMatchScheduleModalOpen(true);
              }}>
                + Create Match Schedule
              </Button>
            </div>
            {matchSchedules.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {matchSchedules.map(schedule => (
                  <div key={schedule._id} className="bg-lava-black border border-lava-orange/20 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold">{schedule.tournamentId?.name || 'Tournament'}</h3>
                        <p className="text-gray-400 text-sm">
                          {schedule.gameType} • {schedule.tournamentType} • 
                          {new Date(schedule.matchDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Game ID: {schedule.gameId} • Password: {schedule.password}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        schedule.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {schedule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          setSelectedMatchSchedule(schedule);
                          setIsMatchScheduleModalOpen(true);
                        }}
                        className="px-3 py-1 bg-lava-orange text-lava-black text-xs font-bold rounded hover:bg-fiery-yellow"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this match schedule?')) {
                            try {
                              await api.delete(`/match-schedules/${schedule._id}`);
                              fetchData();
                            } catch (error) {
                              alert('Error deleting match schedule');
                            }
                          }
                        }}
                        className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No match schedules found</p>
            )}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <LeaderboardManagement />
        )}

        {/* Contact Queries Tab */}
        {activeTab === 'contacts' && (
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-lava-orange">Contact Queries</h2>
            {contacts.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {contacts.map(contact => (
                  <div key={contact._id} className="bg-lava-black border border-lava-orange/20 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">{contact.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            contact.status === 'new' ? 'bg-green-500/20 text-green-400' :
                            contact.status === 'read' ? 'bg-blue-500/20 text-blue-400' :
                            contact.status === 'replied' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {contact.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-1">📧 {contact.email}</p>
                        <p className="text-lava-orange font-semibold mb-2">Subject: {contact.subject}</p>
                        <p className="text-gray-300 text-sm">{contact.message}</p>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <select
                          value={contact.status}
                          onChange={async (e) => {
                            try {
                              await api.put(`/contacts/${contact._id}`, { status: e.target.value });
                              fetchData();
                            } catch (error) {
                              alert('Error updating status');
                            }
                          }}
                          className="px-3 py-1 bg-lava-black border border-lava-orange/30 rounded text-sm text-off-white"
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <button
                          onClick={async () => {
                            if (window.confirm('Delete this contact query?')) {
                              try {
                                await api.delete(`/contacts/${contact._id}`);
                                fetchData();
                              } catch (error) {
                                alert('Error deleting contact');
                              }
                            }
                          }}
                          className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(contact.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No contact queries yet</p>
            )}
          </div>
        )}

        {/* Manage Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-2xl font-bold text-lava-orange">Manage Users</h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {/* Search Box */}
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                  className="px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white placeholder-gray-500 focus:outline-none focus:border-lava-orange w-full sm:w-64"
                />
                <div className="text-sm text-gray-400 flex items-center">
                  Total: {users.length} users
                </div>
              </div>
            </div>
            {loadingUsers ? (
              <div className="text-center py-8 text-gray-400">Loading users...</div>
            ) : (() => {
              // Filter users based on search query
              const filteredUsers = users.filter(user => {
                const searchLower = searchQuery.toLowerCase();
                const name = (user.name || user.username || '').toLowerCase();
                const email = (user.email || '').toLowerCase();
                return name.includes(searchLower) || email.includes(searchLower);
              });

              // Calculate pagination
              const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
              const startIndex = (currentPage - 1) * usersPerPage;
              const endIndex = startIndex + usersPerPage;
              const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

              return (
                <>
                  {filteredUsers.length > 0 ? (
                    <>
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full min-w-[600px]">
                          <thead className="bg-lava-orange/20">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-bold">Name</th>
                              <th className="px-4 py-3 text-left text-sm font-bold">Email</th>
                              <th className="px-4 py-3 text-left text-sm font-bold">Role</th>
                              <th className="px-4 py-3 text-left text-sm font-bold">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedUsers.map(user => (
                              <tr key={user._id} className="border-t border-lava-orange/10 hover:bg-lava-orange/5">
                                <td className="px-4 py-3">
                                  <div className="font-semibold">{user.name || user.username || 'N/A'}</div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-300">{user.email}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                                    user.role === 'accountant' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-gray-500/20 text-gray-400'
                                  }`}>
                                    {user.role || 'user'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <select
                                    value={user.role || 'user'}
                                    onChange={(e) => {
                                      if (window.confirm(`Are you sure you want to change ${user.name || user.email}'s role to ${e.target.value}?`)) {
                                        updateUserRole(user._id, e.target.value);
                                      }
                                    }}
                                    className="px-3 py-1 bg-lava-black border border-lava-orange/30 rounded text-sm text-off-white focus:outline-none focus:border-lava-orange"
                                  >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="accountant">Accountant</option>
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-4">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white hover:bg-lava-orange hover:text-lava-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Previous
                          </button>
                          <span className="text-gray-400 px-4">
                            Page {currentPage} of {totalPages}
                          </span>
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white hover:bg-lava-orange hover:text-lava-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      )}
                      <div className="text-sm text-gray-400 mt-2 text-center">
                        Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      {searchQuery ? 'No users found matching your search' : 'No users found'}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {activeTab === 'newsletter' && (
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-lava-orange">Newsletter Subscribers</h2>
              <div className="text-sm text-gray-400">
                Total: {newsletterSubscribers.filter(s => s.isActive).length} active
              </div>
            </div>
            {newsletterSubscribers.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-lava-orange/20">
                    <tr>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Subscribed Date</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newsletterSubscribers.map(subscriber => (
                      <tr key={subscriber._id} className="border-t border-lava-orange/10 hover:bg-lava-orange/5">
                        <td className="px-4 py-3">{subscriber.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {new Date(subscriber.subscribedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            subscriber.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {subscriber.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={async () => {
                              if (window.confirm('Remove this subscriber?')) {
                                try {
                                  await api.delete(`/newsletter/${subscriber._id}`);
                                  fetchData();
                                } catch (error) {
                                  alert('Error removing subscriber');
                                }
                              }
                            }}
                            className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No newsletter subscribers yet</p>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTournamentModal
        isOpen={isTournamentModalOpen}
        onClose={() => setIsTournamentModalOpen(false)}
        onSuccess={handleTournamentCreated}
      />
      <CreateGameModal
        isOpen={isGameModalOpen}
        onClose={() => setIsGameModalOpen(false)}
        onSuccess={handleGameCreated}
      />
      <SendNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onSuccess={handleNotificationSent}
      />
      <PaymentOptionModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentOptionCreated}
      />
      <MatchScheduleModal
        isOpen={isMatchScheduleModalOpen}
        onClose={() => {
          setIsMatchScheduleModalOpen(false);
          setSelectedMatchSchedule(null);
        }}
        schedule={selectedMatchSchedule}
        matchSchedules={matchSchedules}
        setMatchSchedules={setMatchSchedules}
        onSuccess={() => {
          fetchData();
          setIsMatchScheduleModalOpen(false);
          setSelectedMatchSchedule(null);
        }}
      />
      <EditTournamentModal
        isOpen={isEditTournamentModalOpen}
        onClose={() => {
          setIsEditTournamentModalOpen(false);
          setSelectedTournament(null);
        }}
        tournament={selectedTournament}
        onSuccess={() => {
          fetchData();
          setIsEditTournamentModalOpen(false);
          setSelectedTournament(null);
        }}
      />
      <EditGameModal
        isOpen={isEditGameModalOpen}
        onClose={() => {
          setIsEditGameModalOpen(false);
          setSelectedGame(null);
        }}
        game={selectedGame}
        onSuccess={() => {
          fetchData();
          setIsEditGameModalOpen(false);
          setSelectedGame(null);
        }}
      />
      <EditNotificationModal
        isOpen={isEditNotificationModalOpen}
        onClose={() => {
          setIsEditNotificationModalOpen(false);
          setSelectedNotification(null);
        }}
        notification={selectedNotification}
        onSuccess={() => {
          fetchData();
          setIsEditNotificationModalOpen(false);
          setSelectedNotification(null);
        }}
      />
      <EditPaymentOptionModal
        isOpen={isEditPaymentModalOpen}
        onClose={() => {
          setIsEditPaymentModalOpen(false);
          setSelectedPaymentOption(null);
        }}
        paymentOption={selectedPaymentOption}
        onSuccess={() => {
          fetchData();
          setIsEditPaymentModalOpen(false);
          setSelectedPaymentOption(null);
        }}
      />

      {/* Registration View Modal */}
      {isViewModalOpen && selectedRegistration && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold neon-text-cyan">Registration Details</h2>
              <button 
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedRegistration(null);
                }}
                className="text-gray-400 hover:text-lava-orange transition-colors text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Team Info */}
              <div className="bg-lava-black border border-lava-orange/20 rounded-lg p-4">
                <h3 className="text-xl font-bold text-lava-orange mb-3">Team Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Team Name</p>
                    <p className="font-bold">{selectedRegistration.teamName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Number of Players</p>
                    <p className="font-bold">{selectedRegistration.numberOfPlayers}</p>
                  </div>
                  {selectedRegistration.phoneNumber && (
                    <div>
                      <p className="text-sm text-gray-400">Phone Number</p>
                      <p className="font-bold">{selectedRegistration.phoneNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Players */}
              {selectedRegistration.teamId && selectedRegistration.teamId.members && (
                <div className="bg-lava-black border border-lava-orange/20 rounded-lg p-4">
                  <h3 className="text-xl font-bold text-lava-orange mb-3">Players</h3>
                  <div className="space-y-3">
                    {selectedRegistration.teamId.members.map((member, index) => {
                      // Get team leader index (default to 0 if not set)
                      const teamLeaderIndex = selectedRegistration.teamId.teamLeader !== undefined 
                        ? selectedRegistration.teamId.teamLeader 
                        : 0;
                      const isTeamLeader = index === teamLeaderIndex;
                      // Phone number should be shown for team leader - get from member or registration
                      const phoneNumber = member.phoneNumber || (isTeamLeader ? selectedRegistration.phoneNumber : null);
                      
                      return (
                        <div key={index} className="bg-charcoal border border-lava-orange/10 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-sm font-bold text-lava-orange">Player {index + 1}</p>
                            {isTeamLeader && (
                              <span className="bg-lava-orange text-lava-black px-2 py-0.5 rounded text-xs font-bold">
                                Team Leader
                              </span>
                            )}
                          </div>
                          <div className={`grid gap-3 ${phoneNumber ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                            <div>
                              <p className="text-sm text-gray-400">Name</p>
                              <p className="font-bold">{member.name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Game ID</p>
                              <p className="font-bold text-lava-orange">{member.gameId}</p>
                            </div>
                            {phoneNumber && (
                              <div>
                                <p className="text-sm text-gray-400">Phone Number {isTeamLeader && '(Team Leader)'}</p>
                                <p className="font-bold">{phoneNumber}</p>
                              </div>
                            )}
                          </div>
                          {member.email && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-400">Email</p>
                              <p className="text-sm">{member.email}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Payment Info */}
              <div className="bg-lava-black border border-lava-orange/20 rounded-lg p-4">
                <h3 className="text-xl font-bold text-lava-orange mb-3">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Payment Type</p>
                    <p className="font-bold">{selectedRegistration.paymentType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Payment Option</p>
                    <p className="font-bold">{selectedRegistration.paymentOption}</p>
                  </div>
                </div>
                {selectedRegistration.paymentProof && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-400 mb-2">Payment Proof</p>
                    <button
                      onClick={() => {
                        setSelectedPaymentProof(selectedRegistration.paymentProof);
                        setIsPaymentProofModalOpen(true);
                      }}
                      className="px-4 py-2 bg-lava-orange text-lava-black font-bold rounded-lg hover:bg-fiery-yellow transition-colors"
                    >
                      View Payment Proof
                    </button>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="bg-lava-black border border-lava-orange/20 rounded-lg p-4">
                <h3 className="text-xl font-bold text-lava-orange mb-3">Registration Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <span className={`inline-block px-3 py-1 rounded text-sm font-bold mt-1 ${
                      selectedRegistration.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      selectedRegistration.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {selectedRegistration.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Registered Date</p>
                    <p className="font-bold">{new Date(selectedRegistration.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {selectedRegistration.status === 'rejected' && selectedRegistration.rejectionReason && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-400">Rejection Reason</p>
                    <p className="text-red-400 mt-1">{selectedRegistration.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedRegistration(null);
                }}
                className="px-6 py-2 bg-lava-orange text-lava-black font-bold rounded-lg hover:bg-fiery-yellow transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Proof Image Modal */}
      {isPaymentProofModalOpen && selectedPaymentProof && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-lava-orange">Payment Proof</h2>
              <button
                onClick={() => {
                  setIsPaymentProofModalOpen(false);
                  setSelectedPaymentProof('');
                }}
                className="text-gray-400 hover:text-off-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="flex justify-center">
              <img 
                src={selectedPaymentProof} 
                alt="Payment Proof" 
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="hidden text-center py-8 text-gray-400">
                Failed to load image. <a href={selectedPaymentProof} target="_blank" rel="noopener noreferrer" className="text-lava-orange underline">Open in new tab</a>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setIsPaymentProofModalOpen(false);
                  setSelectedPaymentProof('');
                }}
                className="px-6 py-2 bg-lava-orange text-lava-black font-bold rounded-lg hover:bg-fiery-yellow transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
