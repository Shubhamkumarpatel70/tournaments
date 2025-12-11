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
import ModeTypesManagement from '../components/ModeTypesManagement';
import HomeImageManagement from '../components/HomeImageManagement';
import TeamManagement from '../components/TeamManagement';
import TournamentTeamsManagement from '../components/TournamentTeamsManagement';
import SocialManagement from '../components/SocialManagement';

const AdminDashboard = () => {
  const { user, refreshUser } = useAuth();
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
  const [walletUsers, setWalletUsers] = useState([]);
  const [filteredWalletUsers, setFilteredWalletUsers] = useState([]);
  const [walletSearchQuery, setWalletSearchQuery] = useState('');
  const [walletFilters, setWalletFilters] = useState({
    balanceRange: 'all', // all, zero, low, medium, high
    sortBy: 'balance-desc' // balance-desc, balance-asc, name-asc, name-desc
  });
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [selectedUserForMoney, setSelectedUserForMoney] = useState(null);
  const [addMoneyForm, setAddMoneyForm] = useState({ amount: '', description: '' });
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [transactionTotals, setTransactionTotals] = useState({ totalCredited: 0, totalDebited: 0, totalAmount: 0 });
  const [transactionFilters, setTransactionFilters] = useState({ userId: '', type: '', status: '' });
  const [transactionSearchQuery, setTransactionSearchQuery] = useState('');
  const [referralData, setReferralData] = useState([]);
  const [referralSearchQuery, setReferralSearchQuery] = useState('');
  const [referralFilters, setReferralFilters] = useState({
    pointsRange: 'all', // all, zero, low, medium, high
    sortBy: 'points-desc', // points-desc, points-asc, name-asc, name-desc, referrals-desc
    hasReferrals: 'all' // all, yes, no
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const [showReferredUsersModal, setShowReferredUsersModal] = useState(false);
  const [selectedReferredUsers, setSelectedReferredUsers] = useState([]);
  const [selectedUserForReferred, setSelectedUserForReferred] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
    if (activeTab === 'wallet') {
      fetchWalletData();
    }
    if (activeTab === 'transaction-history') {
      if (walletUsers.length === 0) {
        fetchWalletData();
      }
      fetchAllTransactions();
    }
    if (activeTab === 'referrals') {
      fetchReferralData();
    }
  }, [activeTab, transactionFilters]);

  const fetchWalletData = async () => {
    try {
      const [usersRes, requestsRes] = await Promise.all([
        api.get('/wallet/users'),
        api.get('/wallet/withdrawal-requests?status=pending')
      ]);
      const users = usersRes.data || [];
      setWalletUsers(users);
      setFilteredWalletUsers(users.slice(0, 5)); // Show only 5 recent by default
      const requests = requestsRes.data || [];
      setWithdrawalRequests(requests);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'wallet') {
      let filtered = [...walletUsers];
      
      // Apply search filter
      if (walletSearchQuery) {
        filtered = filtered.filter(user =>
          user.name.toLowerCase().includes(walletSearchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(walletSearchQuery.toLowerCase())
        );
      }
      
      // Apply balance range filter
      if (walletFilters.balanceRange !== 'all') {
        filtered = filtered.filter(user => {
          const balance = user.wallet?.balance || 0;
          switch (walletFilters.balanceRange) {
            case 'zero':
              return balance === 0;
            case 'low':
              return balance > 0 && balance <= 100;
            case 'medium':
              return balance > 100 && balance <= 1000;
            case 'high':
              return balance > 1000;
            default:
              return true;
          }
        });
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        const balanceA = a.wallet?.balance || 0;
        const balanceB = b.wallet?.balance || 0;
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        
        switch (walletFilters.sortBy) {
          case 'balance-desc':
            return balanceB - balanceA;
          case 'balance-asc':
            return balanceA - balanceB;
          case 'name-asc':
            return nameA.localeCompare(nameB);
          case 'name-desc':
            return nameB.localeCompare(nameA);
          default:
            return balanceB - balanceA;
        }
      });
      
      // Show only first 5 if not searching/filtering
      if (!walletSearchQuery && walletFilters.balanceRange === 'all') {
        setFilteredWalletUsers(filtered.slice(0, 5));
      } else {
        setFilteredWalletUsers(filtered);
      }
    }
  }, [walletSearchQuery, walletUsers, walletFilters, activeTab]);

  const handleAddMoney = async (e) => {
    e.preventDefault();
    if (!selectedUserForMoney) {
      alert('Please search and select a user');
      return;
    }
    if (!addMoneyForm.amount || parseFloat(addMoneyForm.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await api.post('/wallet/add-money', {
        userId: selectedUserForMoney._id,
        amount: parseFloat(addMoneyForm.amount),
        description: addMoneyForm.description || `Money added by ${user?.name}`
      });
      alert('Money added successfully!');
      setShowAddMoneyModal(false);
      setAddMoneyForm({ amount: '', description: '' });
      setSelectedUserForMoney(null);
      fetchWalletData();
    } catch (error) {
      console.error('Error adding money:', error);
      alert(error.response?.data?.message || 'Error adding money');
    }
  };

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedWithdrawalRequest, setSelectedWithdrawalRequest] = useState(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Debug: Log state changes
  useEffect(() => {
    console.log('showApproveModal changed:', showApproveModal);
    console.log('showRejectModal changed:', showRejectModal);
    console.log('selectedWithdrawalRequest changed:', selectedWithdrawalRequest);
  }, [showApproveModal, showRejectModal, selectedWithdrawalRequest]);

  const handleApproveClick = (request) => {
    console.log('Approve clicked for request:', request);
    if (!request || !request._id) {
      console.error('Invalid request object:', request);
      alert('Invalid request. Please refresh the page.');
      return;
    }
    setSelectedWithdrawalRequest(request);
    setUtrNumber('');
    setShowApproveModal(true);
    console.log('Approve modal should be opening now');
  };

  const handleRejectClick = (request) => {
    console.log('Reject clicked for request:', request);
    if (!request || !request._id) {
      console.error('Invalid request object:', request);
      alert('Invalid request. Please refresh the page.');
      return;
    }
    setSelectedWithdrawalRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
    console.log('Reject modal should be opening now');
  };

  const handleApprove = async () => {
    console.log('handleApprove called, utrNumber:', utrNumber);
    console.log('selectedWithdrawalRequest:', selectedWithdrawalRequest);
    
    if (!utrNumber.trim()) {
      console.warn('UTR number is empty');
      alert('Please enter UTR number');
      return;
    }

    if (!selectedWithdrawalRequest || !selectedWithdrawalRequest._id) {
      console.error('Invalid withdrawal request');
      alert('Invalid request. Please try again.');
      return;
    }

    try {
      console.log('Sending approval request to:', `/wallet/withdrawal/${selectedWithdrawalRequest._id}`);
      const response = await api.put(`/wallet/withdrawal/${selectedWithdrawalRequest._id}`, { 
        action: 'approve', 
        utrNumber: utrNumber.trim(),
        notes: '' 
      });
      console.log('Approval response:', response.data);
      alert('Withdrawal approved successfully!');
      setShowApproveModal(false);
      setSelectedWithdrawalRequest(null);
      setUtrNumber('');
      fetchWalletData();
      if (activeTab === 'transaction-history') {
        fetchAllTransactions();
      }
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      console.error('Error response:', error.response);
      alert(error.response?.data?.message || 'Error approving withdrawal');
    }
  };

  const handleReject = async () => {
    console.log('handleReject called, rejectionReason:', rejectionReason);
    console.log('selectedWithdrawalRequest:', selectedWithdrawalRequest);
    
    if (!rejectionReason.trim()) {
      console.warn('Rejection reason is empty');
      alert('Please enter rejection reason');
      return;
    }

    if (!selectedWithdrawalRequest || !selectedWithdrawalRequest._id) {
      console.error('Invalid withdrawal request');
      alert('Invalid request. Please try again.');
      return;
    }

    try {
      console.log('Sending rejection request to:', `/wallet/withdrawal/${selectedWithdrawalRequest._id}`);
      const response = await api.put(`/wallet/withdrawal/${selectedWithdrawalRequest._id}`, { 
        action: 'reject', 
        rejectionReason: rejectionReason.trim(),
        notes: '' 
      });
      console.log('Rejection response:', response.data);
      alert('Withdrawal rejected successfully!');
      setShowRejectModal(false);
      setSelectedWithdrawalRequest(null);
      setRejectionReason('');
      fetchWalletData();
      if (activeTab === 'transaction-history') {
        fetchAllTransactions();
      }
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      console.error('Error response:', error.response);
      alert(error.response?.data?.message || 'Error rejecting withdrawal');
    }
  };

  const fetchAllTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (transactionFilters.userId) params.append('userId', transactionFilters.userId);
      if (transactionFilters.type) params.append('type', transactionFilters.type);
      if (transactionFilters.status) params.append('status', transactionFilters.status);
      
      const response = await api.get(`/wallet/all-transactions?${params.toString()}`);
      setAllTransactions(response.data.transactions || []);
      setTransactionTotals(response.data.totals || { totalCredited: 0, totalDebited: 0, totalAmount: 0 });
    } catch (error) {
      console.error('Error fetching all transactions:', error);
    }
  };

  const getFilteredTransactions = () => {
    let filtered = [...allTransactions];
    
    if (transactionSearchQuery) {
      const searchLower = transactionSearchQuery.toLowerCase();
      filtered = filtered.filter(t => {
        const userName = t.userId?.name?.toLowerCase() || '';
        const userEmail = t.userId?.email?.toLowerCase() || '';
        const description = t.description?.toLowerCase() || '';
        const utrNumber = t.utrNumber?.toLowerCase() || '';
        const upiName = t.withdrawalDetails?.upiName?.toLowerCase() || '';
        const accountHolderName = t.withdrawalDetails?.accountHolderName?.toLowerCase() || '';
        
        return userName.includes(searchLower) ||
               userEmail.includes(searchLower) ||
               description.includes(searchLower) ||
               utrNumber.includes(searchLower) ||
               upiName.includes(searchLower) ||
               accountHolderName.includes(searchLower);
      });
    }
    
    return filtered;
  };

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

  const fetchReferralData = async () => {
    try {
      // Check if user is admin or co-admin before making the request
      if (user?.role !== 'admin' && user?.role !== 'co-admin') {
        console.error('User is not an admin or co-admin. Current role:', user?.role);
        alert(`Access denied. Your current role is "${user?.role || 'unknown'}". You need "admin" or "co-admin" role to view this data. Please contact an administrator.`);
        setReferralData([]);
        return;
      }

      console.log('Fetching referral data...');
      console.log('Current user:', user);
      console.log('User role:', user?.role);
      
      const response = await api.get('/referrals/all');
      console.log('Referral data response:', response.data);
      setReferralData(response.data || []);
    } catch (error) {
      console.error('Error fetching referral data:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.error || 'Access denied';
        const debugInfo = error.response?.data?.debug;
        
        console.error('Access denied details:', debugInfo);
        console.error('Current user role:', user?.role);
        console.error('Required role: admin');
        
        if (user?.role !== 'admin' && user?.role !== 'co-admin') {
          alert(`Access denied. Your current role is "${user?.role || 'unknown'}". You need "admin" or "co-admin" role to view this data. Please contact an administrator to update your role.`);
        } else {
          alert(`Access denied: ${errorMessage}. Please refresh the page and try again. If the issue persists, contact support.`);
        }
      } else if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        // Optionally redirect to login
      } else {
        alert('Failed to load referral data. Please try again.');
      }
      setReferralData([]);
    }
  };

  const getFilteredReferralData = () => {
    let filtered = [...referralData];
    
    // Apply search filter
    if (referralSearchQuery) {
      const searchLower = referralSearchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.referralCode?.toLowerCase().includes(searchLower) ||
        user.referredBy?.name?.toLowerCase().includes(searchLower) ||
        user.referredBy?.email?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply points range filter
    if (referralFilters.pointsRange !== 'all') {
      filtered = filtered.filter(user => {
        const points = user.referralPoints || 0;
        switch (referralFilters.pointsRange) {
          case 'zero':
            return points === 0;
          case 'low':
            return points > 0 && points <= 100;
          case 'medium':
            return points > 100 && points <= 1000;
          case 'high':
            return points > 1000;
          default:
            return true;
        }
      });
    }
    
    // Apply has referrals filter
    if (referralFilters.hasReferrals !== 'all') {
      filtered = filtered.filter(user => {
        const hasRefs = (user.referredCount || 0) > 0;
        return referralFilters.hasReferrals === 'yes' ? hasRefs : !hasRefs;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const pointsA = a.referralPoints || 0;
      const pointsB = b.referralPoints || 0;
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      const refsA = a.referredCount || 0;
      const refsB = b.referredCount || 0;
      
      switch (referralFilters.sortBy) {
        case 'points-desc':
          return pointsB - pointsA;
        case 'points-asc':
          return pointsA - pointsB;
        case 'name-asc':
          return nameA.localeCompare(nameB);
        case 'name-desc':
          return nameB.localeCompare(nameA);
        case 'referrals-desc':
          return refsB - refsA;
        default:
          return pointsB - pointsA;
      }
    });
    
    return filtered;
  };

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
      // Convert userId to string for consistent comparison
      const userIdStr = String(userId);
      console.log('Updating user role:', { userId: userIdStr, newRole, currentUser: user });
      
      await api.put(`/users/${userIdStr}`, { role: newRole });
      await fetchUsers(); // Refresh users list
      
      // If the updated user is the current logged-in user, refresh their data
      const currentUserId = String(user?._id || user?.id || '');
      const updatedUserId = userIdStr;
      
      console.log('Comparing user IDs:', { 
        currentUserId, 
        updatedUserId, 
        match: currentUserId === updatedUserId,
        currentUserRole: user?.role,
        newRole
      });
      
      if (currentUserId && updatedUserId && currentUserId === updatedUserId) {
        try {
          console.log('Refreshing current user data...');
          const refreshedUser = await refreshUser();
          console.log('User refreshed:', refreshedUser);
          
          // Check if the role was actually updated
          if (refreshedUser.role === newRole) {
            alert(`User role updated successfully! Your role is now "${newRole}". The page will reload to apply the new role.`);
            // Reload the page after a short delay to ensure the new role is applied
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else {
            alert(`Role update may not have been applied. Expected: "${newRole}", Got: "${refreshedUser.role}". Please log out and log back in.`);
          }
        } catch (refreshError) {
          console.error('Error refreshing current user:', refreshError);
          alert('User role updated successfully! Please log out and log back in to see the changes.');
        }
      } else {
        alert('User role updated successfully!');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert(error.response?.data?.error || 'Failed to update user role. Please try again.');
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    setDeletingUser(true);
    try {
      await api.delete(`/users/${userToDelete._id}`);
      await fetchUsers(); // Refresh users list
      setShowDeleteModal(false);
      setUserToDelete(null);
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.error || 'Failed to delete user. Please try again.');
    } finally {
      setDeletingUser(false);
    }
  };

  const handleTerminateToggle = async (user) => {
    try {
      const newTerminatedStatus = !user.isTerminated;
      await api.put(`/users/${user._id}/terminate`, { isTerminated: newTerminatedStatus });
      await fetchUsers(); // Refresh users list
      alert(newTerminatedStatus ? 'User terminated successfully!' : 'User termination removed successfully!');
    } catch (error) {
      console.error('Error toggling user termination:', error);
      alert('Failed to update user termination status. Please try again.');
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

  // Filter tabs based on user role - co-admin cannot access Manage Users
  const allTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tournaments', label: 'Tournaments' },
    { id: 'tournament-types', label: 'Tournament Types' },
    { id: 'mode-types', label: 'Mode Types' },
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
    { id: 'wallet', label: 'Wallet Management' },
    { id: 'transaction-history', label: 'Transaction History' },
    { id: 'referrals', label: 'Referrals' },
    { id: 'contacts', label: 'Contact Queries' },
    { id: 'newsletter', label: 'Newsletter' },
    { id: 'member', label: 'Member' },
    { id: 'team', label: 'Team' },
    { id: 'social', label: 'Social' }
  ];

  // Filter out 'users' tab for co-admin
  const tabs = user?.role === 'co-admin' 
    ? allTabs.filter(tab => tab.id !== 'users')
    : allTabs;

  return (
    <div className="min-h-screen py-12 px-4 page-transition">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-2 neon-text-cyan">Admin Dashboard</h1>
        <p className="text-gray-400 mb-8">Welcome, {user?.name} ({user?.role === 'co-admin' ? 'Co-Admin' : 'Admin'})</p>

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
                      {tournament.originalPrizePool && tournament.originalPrizePool !== tournament.prizePool && (
                        <div className="text-gray-500 text-xs line-through">₹{tournament.originalPrizePool?.toLocaleString()}</div>
                      )}
                      <div className="text-gray-400 text-sm">{tournament.registeredTeams}/{tournament.maxTeams} teams</div>
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
                            📅 Started: {new Date(match.matchDate || match.date).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
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
                                {new Date(matchSchedule.matchDate).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
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
                          {match.game} • {(() => {
                            const date = new Date(match.matchDate);
                            const day = String(date.getDate()).padStart(2, '0');
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const year = String(date.getFullYear()).slice(-2);
                            return `${day}-${month}-${year}`;
                          })()}
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

        {/* Mode Types Tab */}
        {activeTab === 'mode-types' && (
          <ModeTypesManagement />
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
            
            {/* Statistics Card */}
            {selectedTournamentForReg && registrations.length > 0 && (() => {
              const approvedRegistrations = registrations.filter(reg => reg.status === 'approved');
              const pendingRegistrations = registrations.filter(reg => reg.status === 'pending');
              
              const totalTeamsApproved = approvedRegistrations.length;
              const totalPlayersApproved = approvedRegistrations.reduce((sum, reg) => sum + (reg.numberOfPlayers || 0), 0);
              const totalTeamsPending = pendingRegistrations.length;
              const totalPlayersPending = pendingRegistrations.reduce((sum, reg) => sum + (reg.numberOfPlayers || 0), 0);
              const totalTeams = registrations.length;
              const totalPlayers = registrations.reduce((sum, reg) => sum + (reg.numberOfPlayers || 0), 0);
              
              // Get tournament info
              const selectedTournament = tournaments.find(t => t._id === selectedTournamentForReg);
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-lava-black border border-lava-orange/30 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Approved Teams</div>
                    <div className="text-2xl font-bold text-lava-orange">{totalTeamsApproved}</div>
                    {selectedTournament && (
                      <div className="text-xs text-gray-500 mt-1">of {selectedTournament.maxTeams} max</div>
                    )}
                  </div>
                  <div className="bg-lava-black border border-lava-orange/30 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Approved Players</div>
                    <div className="text-2xl font-bold text-green-400">{totalPlayersApproved}</div>
                    {selectedTournament && (
                      <div className="text-xs text-gray-500 mt-1">of {selectedTournament.playerSpots} spots</div>
                    )}
                  </div>
                  <div className="bg-lava-black border border-yellow-500/30 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Pending Teams</div>
                    <div className="text-2xl font-bold text-yellow-400">{totalTeamsPending}</div>
                    <div className="text-xs text-gray-500 mt-1">Awaiting approval</div>
                  </div>
                  <div className="bg-lava-black border border-blue-500/30 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Total Registrations</div>
                    <div className="text-2xl font-bold text-blue-400">{totalTeams}</div>
                    <div className="text-xs text-gray-500 mt-1">{totalPlayers} total players</div>
                  </div>
                </div>
              );
            })()}
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-lava-orange">Tournament</label>
                <select
                  value={selectedTournamentForReg || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      fetchRegistrations(e.target.value);
                    } else {
                      setRegistrations([]);
                      setFilteredRegistrations([]);
                      setSelectedTournamentForReg(null);
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
                {(() => {
                  const approvedCount = filteredRegistrations.filter(r => r.status === 'approved').length;
                  const pendingCount = filteredRegistrations.filter(r => r.status === 'pending').length;
                  return (
                    <span className="ml-2">
                      ({approvedCount} approved, {pendingCount} pending)
                    </span>
                  );
                })()}
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
                          {(() => {
                            const date = new Date(schedule.matchDate);
                            const day = String(date.getDate()).padStart(2, '0');
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const year = String(date.getFullYear()).slice(-2);
                            return `${day}-${month}-${year}`;
                          })()}
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
                              <th className="px-4 py-3 text-left text-sm font-bold">Status</th>
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
                                  <select
                                    value={user.role || 'user'}
                                    onChange={(e) => {
                                      if (window.confirm(`Are you sure you want to change ${user.name || user.email}'s role to ${e.target.value}?`)) {
                                        const userId = user._id || user.id;
                                        updateUserRole(userId, e.target.value);
                                      }
                                    }}
                                    className="px-3 py-1 bg-lava-black border border-lava-orange/30 rounded text-sm text-off-white focus:outline-none focus:border-lava-orange"
                                  >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="co-admin">Co-Admin</option>
                                    <option value="accountant">Accountant</option>
                                  </select>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    user.isTerminated ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                                  }`}>
                                    {user.isTerminated ? 'Terminated' : 'Active'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                      <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={user.isTerminated || false}
                                          onChange={() => handleTerminateToggle(user)}
                                          className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lava-orange/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                        <span className="ml-2 text-xs text-gray-300">
                                          Terminate
                                        </span>
                                      </label>
                                    </div>
                                    {user.role !== 'admin' && user.role !== 'co-admin' && (
                                      <button
                                        onClick={() => handleDeleteClick(user)}
                                        className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 transition-colors w-fit"
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
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

        {/* Wallet Management Tab */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            {/* Add Money Section */}
            <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-lava-orange">Add Money to Wallet</h2>
                <Button variant="primary" onClick={() => setShowAddMoneyModal(true)}>
                  + Add Money
                </Button>
              </div>
              <div className="text-gray-400 text-sm">
                Select a user and add money to their wallet balance.
              </div>
            </div>

            {/* Withdrawal Requests Section */}
            <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-lava-orange">Pending Withdrawal Requests</h2>
                {withdrawalRequests.length > 5 && (
                  <Button
                    variant="primary"
                    onClick={() => window.open('/admin/withdrawal-requests', '_blank')}
                    className="text-sm"
                  >
                    View All Requests
                  </Button>
                )}
              </div>
              {withdrawalRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No pending withdrawal requests</div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {withdrawalRequests.slice(0, 5).map((request) => (
                    <div key={request._id} className="bg-lava-black/50 border border-lava-orange/20 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1">
                          <div className="font-bold text-off-white mb-1">
                            {request.userId?.name || 'Unknown User'} ({request.userId?.email || 'N/A'})
                          </div>
                          <div className="text-sm text-gray-400 mb-2">
                            Amount: <span className="text-fiery-yellow font-bold">₹{request.amount.toLocaleString()}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Method: {request.withdrawalType === 'upi' ? 'UPI' : 'Bank Account'}
                            {request.withdrawalType === 'upi' && request.withdrawalDetails?.upiId && (
                              <span> - {request.withdrawalDetails.upiId}</span>
                            )}
                          </div>
                          {request.withdrawalType === 'upi' && request.withdrawalDetails?.upiName && (
                            <div className="text-xs text-gray-400 mt-1">
                              Name: <span className="text-off-white font-semibold">{request.withdrawalDetails.upiName}</span>
                            </div>
                          )}
                          {request.withdrawalType === 'bank_account' && request.withdrawalDetails?.bankAccountNumber && (
                            <div className="text-xs text-gray-500 mt-1">
                              Account: {request.withdrawalDetails.bankAccountNumber.slice(-4)}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            Requested: {new Date(request.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Approve button clicked, request:', request);
                              handleApproveClick(request);
                            }}
                            className="px-4 py-2 bg-lava-orange text-lava-black font-bold rounded-lg hover:bg-fiery-yellow transition-colors text-sm cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Reject button clicked, request:', request);
                              handleRejectClick(request);
                            }}
                            className="px-4 py-2 bg-transparent text-off-white border-2 border-lava-orange font-bold rounded-lg hover:bg-lava-orange hover:text-lava-black transition-colors text-sm cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Users Wallet List */}
            <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold text-lava-orange">User Wallets</h2>
                {walletUsers.length > 5 && (
                  <Button
                    variant="primary"
                    onClick={() => window.open('/admin/user-wallets', '_blank')}
                    className="text-sm"
                  >
                    View All Users
                  </Button>
                )}
              </div>
              {/* Search and Filter Options */}
              <div className="mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={walletSearchQuery}
                  onChange={(e) => setWalletSearchQuery(e.target.value)}
                  className="w-full bg-lava-black border border-lava-orange/30 rounded-lg px-4 py-2 text-off-white focus:border-lava-orange focus:outline-none"
                />
                <div className="flex flex-wrap gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Balance Range:</label>
                    <select
                      value={walletFilters.balanceRange}
                      onChange={(e) => setWalletFilters({ ...walletFilters, balanceRange: e.target.value })}
                      className="px-3 py-1 bg-lava-black border border-lava-orange/30 rounded text-sm text-off-white focus:outline-none focus:border-lava-orange"
                    >
                      <option value="all">All Balances</option>
                      <option value="zero">₹0</option>
                      <option value="low">₹1 - ₹100</option>
                      <option value="medium">₹101 - ₹1,000</option>
                      <option value="high">₹1,000+</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Sort By:</label>
                    <select
                      value={walletFilters.sortBy}
                      onChange={(e) => setWalletFilters({ ...walletFilters, sortBy: e.target.value })}
                      className="px-3 py-1 bg-lava-black border border-lava-orange/30 rounded text-sm text-off-white focus:outline-none focus:border-lava-orange"
                    >
                      <option value="balance-desc">Balance (High to Low)</option>
                      <option value="balance-asc">Balance (Low to High)</option>
                      <option value="name-asc">Name (A to Z)</option>
                      <option value="name-desc">Name (Z to A)</option>
                    </select>
                  </div>
                  {(walletFilters.balanceRange !== 'all' || walletFilters.sortBy !== 'balance-desc') && (
                    <div className="flex items-end">
                      <button
                        onClick={() => setWalletFilters({ balanceRange: 'all', sortBy: 'balance-desc' })}
                        className="px-3 py-1 text-sm text-lava-orange hover:text-fiery-yellow transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-lava-orange/20">
                    <tr>
                      <th className="px-4 py-3 text-left">User</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Balance</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWalletUsers.map((walletUser) => (
                      <tr key={walletUser._id} className="border-t border-lava-orange/10 hover:bg-lava-orange/5">
                        <td className="px-4 py-3">{walletUser.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{walletUser.email}</td>
                        <td className="px-4 py-3">
                          <span className="text-fiery-yellow font-bold">₹{(walletUser.wallet?.balance || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="primary"
                            onClick={() => {
                              setSelectedUserForMoney(walletUser);
                              setShowAddMoneyModal(true);
                            }}
                            className="text-sm"
                          >
                            Add Money
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Transaction History Tab */}
        {activeTab === 'transaction-history' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  ₹{transactionTotals.totalCredited.toLocaleString()}
                </div>
                <div className="text-gray-400">Total Credited</div>
              </div>
              <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
                <div className="text-3xl font-bold text-red-400 mb-2">
                  ₹{transactionTotals.totalDebited.toLocaleString()}
                </div>
                <div className="text-gray-400">Total Debited</div>
              </div>
              <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
                <div className={`text-3xl font-bold mb-2 ${
                  transactionTotals.totalAmount >= 0 ? 'text-fiery-yellow' : 'text-red-400'
                }`}>
                  ₹{Math.abs(transactionTotals.totalAmount).toLocaleString()}
                </div>
                <div className="text-gray-400">Net Amount</div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-lava-orange">Transaction History</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Search by user name, email, description, UTR, or name..."
                    value={transactionSearchQuery}
                    onChange={(e) => setTransactionSearchQuery(e.target.value)}
                    className="w-full bg-lava-black border border-lava-orange/30 rounded-lg px-4 py-2 text-off-white focus:border-lava-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Type</label>
                  <select
                    value={transactionFilters.type}
                    onChange={(e) => setTransactionFilters({ ...transactionFilters, type: e.target.value })}
                    className="w-full bg-lava-black border border-lava-orange/30 rounded-lg px-4 py-2 text-off-white focus:border-lava-orange focus:outline-none"
                  >
                    <option value="">All Types</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
                  <select
                    value={transactionFilters.status}
                    onChange={(e) => setTransactionFilters({ ...transactionFilters, status: e.target.value })}
                    className="w-full bg-lava-black border border-lava-orange/30 rounded-lg px-4 py-2 text-off-white focus:border-lava-orange focus:outline-none"
                  >
                    <option value="">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">User</label>
                  <select
                    value={transactionFilters.userId}
                    onChange={(e) => setTransactionFilters({ ...transactionFilters, userId: e.target.value })}
                    className="w-full bg-lava-black border border-lava-orange/30 rounded-lg px-4 py-2 text-off-white focus:border-lava-orange focus:outline-none"
                  >
                    <option value="">All Users</option>
                    {walletUsers.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-lava-orange/20">
                    <tr>
                      <th className="px-4 py-3 text-left">User</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Description</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Amount</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Processed By</th>
                      <th className="px-4 py-3 text-left">UTR</th>
                      <th className="px-4 py-3 text-left">Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredTransactions().length === 0 ? (
                      <tr>
                        <td colSpan="10" className="px-4 py-8 text-center text-gray-400">
                          No transactions found
                        </td>
                      </tr>
                    ) : (
                      getFilteredTransactions().map((transaction) => (
                        <tr key={transaction._id} className="border-t border-lava-orange/10 hover:bg-lava-orange/5">
                          <td className="px-4 py-3">{transaction.userId?.name || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-400">{transaction.userId?.email || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm">{transaction.description}</div>
                            {transaction.withdrawalType && (
                              <div className="text-xs text-gray-500 mt-1">
                                Method: {transaction.withdrawalType === 'upi' ? 'UPI' : 'Bank Account'}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {(() => {
                              const isReversal = transaction.description?.toLowerCase().includes('reversal:') || transaction.relatedTransactionId;
                              const displayType = isReversal && transaction.type === 'credit' ? 'r-credit' : (transaction.type === 'credit' ? 'Credit' : 'Debit');
                              return (
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                  transaction.type === 'credit' 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {displayType}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-4 py-3">
                            <div className={`font-bold ${
                              transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {transaction.type === 'credit' ? 'Credited' : 'Debited'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                              transaction.status === 'completed' 
                                ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                : transaction.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                                : 'bg-red-500/20 text-red-400 border-red-500/50'
                            }`}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {transaction.processedBy?.name || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {transaction.type === 'debit' && transaction.status === 'completed' && transaction.utrNumber ? (
                              <span className="text-green-400 font-semibold">{transaction.utrNumber}</span>
                            ) : transaction.type === 'debit' && transaction.status === 'pending' ? (
                              <span className="text-yellow-400">Pending</span>
                            ) : transaction.type === 'debit' && transaction.status === 'rejected' ? (
                              <span className="text-red-400">-</span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {transaction.type === 'debit' && transaction.withdrawalDetails ? (
                              transaction.withdrawalType === 'upi' && transaction.withdrawalDetails.upiName ? (
                                <div>
                                  <span className="text-off-white font-semibold">{transaction.withdrawalDetails.upiName}</span>
                                  <div className="text-xs text-gray-500 mt-0.5">UPI</div>
                                </div>
                              ) : transaction.withdrawalType === 'bank_account' && transaction.withdrawalDetails.accountHolderName ? (
                                <div>
                                  <span className="text-off-white font-semibold">{transaction.withdrawalDetails.accountHolderName}</span>
                                  <div className="text-xs text-gray-500 mt-0.5">Bank Account</div>
                                </div>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-2xl font-bold text-lava-orange">Referral System</h2>
              <div className="text-sm text-gray-400">
                Total Users: {referralData.length} | Showing: {getFilteredReferralData().length}
              </div>
            </div>
            
            {/* Search and Filter Options */}
            <div className="mb-4 space-y-3">
              <input
                type="text"
                placeholder="Search by name, email, or referral code..."
                value={referralSearchQuery}
                onChange={(e) => setReferralSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              />
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Points Range:</label>
                  <select
                    value={referralFilters.pointsRange}
                    onChange={(e) => setReferralFilters({ ...referralFilters, pointsRange: e.target.value })}
                    className="px-3 py-1 bg-lava-black border border-lava-orange/30 rounded text-sm text-off-white focus:outline-none focus:border-lava-orange"
                  >
                    <option value="all">All Points</option>
                    <option value="zero">0 Points</option>
                    <option value="low">1 - 100 Points</option>
                    <option value="medium">101 - 1,000 Points</option>
                    <option value="high">1,000+ Points</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Has Referrals:</label>
                  <select
                    value={referralFilters.hasReferrals}
                    onChange={(e) => setReferralFilters({ ...referralFilters, hasReferrals: e.target.value })}
                    className="px-3 py-1 bg-lava-black border border-lava-orange/30 rounded text-sm text-off-white focus:outline-none focus:border-lava-orange"
                  >
                    <option value="all">All Users</option>
                    <option value="yes">Has Referrals</option>
                    <option value="no">No Referrals</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Sort By:</label>
                  <select
                    value={referralFilters.sortBy}
                    onChange={(e) => setReferralFilters({ ...referralFilters, sortBy: e.target.value })}
                    className="px-3 py-1 bg-lava-black border border-lava-orange/30 rounded text-sm text-off-white focus:outline-none focus:border-lava-orange"
                  >
                    <option value="points-desc">Points (High to Low)</option>
                    <option value="points-asc">Points (Low to High)</option>
                    <option value="referrals-desc">Referrals (High to Low)</option>
                    <option value="name-asc">Name (A to Z)</option>
                    <option value="name-desc">Name (Z to A)</option>
                  </select>
                </div>
                {(referralFilters.pointsRange !== 'all' || referralFilters.hasReferrals !== 'all' || referralFilters.sortBy !== 'points-desc') && (
                  <div className="flex items-end">
                    <button
                      onClick={() => setReferralFilters({ pointsRange: 'all', hasReferrals: 'all', sortBy: 'points-desc' })}
                      className="px-3 py-1 text-sm text-lava-orange hover:text-fiery-yellow transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {getFilteredReferralData().length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-lava-orange/20">
                    <tr>
                      <th className="px-4 py-3 text-left">User</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Referral Code</th>
                      <th className="px-4 py-3 text-left">Points</th>
                      <th className="px-4 py-3 text-left">Earned Points</th>
                      <th className="px-4 py-3 text-left">Redeemed Points</th>
                      <th className="px-4 py-3 text-left">Referred By</th>
                      <th className="px-4 py-3 text-left">Referred Users</th>
                      <th className="px-4 py-3 text-left">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredReferralData().map((user) => (
                      <tr key={user.id} className="border-t border-lava-orange/10 hover:bg-lava-orange/5">
                        <td className="px-4 py-3">{user.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-lava-orange font-bold">{user.referralCode || 'N/A'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-fiery-yellow font-bold">{user.referralPoints || 0}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-green-400 font-bold">{user.earnedPoints || 0}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-orange-400 font-bold">{user.redeemedPoints || 0}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {user.referredBy ? (
                            <div>
                              <div className="text-off-white">{user.referredBy.name}</div>
                              <div className="text-gray-500 text-xs">{user.referredBy.email}</div>
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="text-lava-orange font-bold">{user.referredCount || 0}</div>
                            {user.referredUsers && user.referredUsers.length > 0 && (
                              <button
                                onClick={() => {
                                  setSelectedReferredUsers(user.referredUsers || []);
                                  setSelectedUserForReferred(user);
                                  setShowReferredUsersModal(true);
                                }}
                                className="px-2 py-1 text-xs bg-lava-orange text-lava-black font-bold rounded hover:bg-fiery-yellow transition-colors"
                              >
                                View
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {(() => {
                            const date = new Date(user.joinedAt);
                            const day = String(date.getDate()).padStart(2, '0');
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const year = String(date.getFullYear()).slice(-2);
                            return `${day}-${month}-${year}`;
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                {referralSearchQuery ? 'No users found matching your search' : 'No referral data available'}
              </div>
            )}
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
                          {(() => {
                            const date = new Date(subscriber.subscribedAt);
                            const day = String(date.getDate()).padStart(2, '0');
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const year = String(date.getFullYear()).slice(-2);
                            return `${day}-${month}-${year}`;
                          })()}
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

        {/* Member Management Tab - For "About Us" page team members */}
        {activeTab === 'member' && (
          <TeamManagement />
        )}

        {/* Tournament Teams Management Tab */}
        {activeTab === 'team' && (
          <TournamentTeamsManagement />
        )}

        {/* Social Management Tab */}
        {activeTab === 'social' && (
          <SocialManagement />
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

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 sm:p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-lava-orange">Add Money to Wallet</h2>
              <button
                onClick={() => {
                  setShowAddMoneyModal(false);
                  setSelectedUserForMoney(null);
                  setAddMoneyForm({ amount: '', description: '' });
                }}
                className="text-gray-400 hover:text-lava-orange text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddMoney} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Search User *
                </label>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearchQuery}
                  onChange={(e) => {
                    setUserSearchQuery(e.target.value);
                    if (e.target.value.trim()) {
                      const filtered = walletUsers.filter(user =>
                        user.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
                        user.email.toLowerCase().includes(e.target.value.toLowerCase())
                      );
                      setUserSearchResults(filtered);
                    } else {
                      setUserSearchResults([]);
                      setSelectedUserForMoney(null);
                    }
                  }}
                  className="w-full bg-lava-black border border-lava-orange/30 rounded-lg px-4 py-2 text-off-white focus:border-lava-orange focus:outline-none"
                />
                {userSearchQuery && userSearchResults.length > 0 && (
                  <div className="mt-2 max-h-48 overflow-y-auto bg-lava-black border border-lava-orange/30 rounded-lg">
                    {userSearchResults.map((user) => (
                      <div
                        key={user._id}
                        onClick={() => {
                          setSelectedUserForMoney(user);
                          setUserSearchQuery(`${user.name} (${user.email})`);
                          setUserSearchResults([]);
                        }}
                        className="px-4 py-2 hover:bg-lava-orange/20 cursor-pointer border-b border-lava-orange/10 last:border-b-0"
                      >
                        <div className="font-semibold text-off-white">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                        <div className="text-xs text-fiery-yellow">Balance: ₹{(user.wallet?.balance || 0).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedUserForMoney && (
                  <div className="mt-2 p-3 bg-lava-orange/20 border border-lava-orange/50 rounded-lg">
                    <div className="text-sm text-gray-300">Selected:</div>
                    <div className="font-semibold text-off-white">{selectedUserForMoney.name}</div>
                    <div className="text-sm text-gray-400">{selectedUserForMoney.email}</div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUserForMoney(null);
                        setUserSearchQuery('');
                      }}
                      className="mt-2 text-xs text-red-400 hover:text-red-300"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={addMoneyForm.amount}
                  onChange={(e) => setAddMoneyForm({ ...addMoneyForm, amount: e.target.value })}
                  className="w-full bg-lava-black border border-lava-orange/30 rounded-lg px-4 py-2 text-off-white focus:border-lava-orange focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={addMoneyForm.description}
                  onChange={(e) => setAddMoneyForm({ ...addMoneyForm, description: e.target.value })}
                  className="w-full bg-lava-black border border-lava-orange/30 rounded-lg px-4 py-2 text-off-white focus:border-lava-orange focus:outline-none"
                  rows="3"
                  placeholder="Reason for adding money..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowAddMoneyModal(false);
                    setSelectedUserForMoney(null);
                    setAddMoneyForm({ amount: '', description: '' });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                >
                  Add Money
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve Withdrawal Modal */}
      {showApproveModal && selectedWithdrawalRequest && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-lava-orange mb-4">Approve Withdrawal</h2>
            <div className="mb-4">
              <p className="text-gray-300 mb-2">
                User: <span className="font-bold">{selectedWithdrawalRequest.userId?.name}</span>
              </p>
              <p className="text-gray-300 mb-2">
                Amount: <span className="font-bold text-fiery-yellow">₹{selectedWithdrawalRequest.amount.toLocaleString()}</span>
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                UTR Number *
              </label>
              <input
                type="text"
                value={utrNumber}
                onChange={(e) => {
                  console.log('UTR number changed:', e.target.value);
                  setUtrNumber(e.target.value);
                }}
                placeholder="Enter UTR number"
                className="w-full bg-lava-black border border-lava-orange/30 rounded-lg px-4 py-2 text-off-white focus:border-lava-orange focus:outline-none"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Approve submit button clicked');
                  handleApprove();
                }}
                className="flex-1 px-4 py-2 bg-lava-orange text-lava-black font-bold rounded-lg hover:bg-fiery-yellow transition-colors"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Cancel button clicked');
                  setShowApproveModal(false);
                  setSelectedWithdrawalRequest(null);
                  setUtrNumber('');
                }}
                className="flex-1 px-4 py-2 bg-transparent text-off-white border-2 border-lava-orange font-bold rounded-lg hover:bg-lava-orange hover:text-lava-black transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Withdrawal Modal */}
      {showRejectModal && selectedWithdrawalRequest && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-lava-orange mb-4">Reject Withdrawal</h2>
            <div className="mb-4">
              <p className="text-gray-300 mb-2">
                User: <span className="font-bold">{selectedWithdrawalRequest.userId?.name}</span>
              </p>
              <p className="text-gray-300 mb-2">
                Amount: <span className="font-bold text-fiery-yellow">₹{selectedWithdrawalRequest.amount.toLocaleString()}</span>
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => {
                  console.log('Rejection reason changed:', e.target.value);
                  setRejectionReason(e.target.value);
                }}
                placeholder="Enter reason for rejection"
                rows="4"
                className="w-full bg-lava-black border border-lava-orange/30 rounded-lg px-4 py-2 text-off-white focus:border-lava-orange focus:outline-none"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Reject submit button clicked');
                  handleReject();
                }}
                className="flex-1 px-4 py-2 bg-transparent text-red-400 border-2 border-red-500 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-colors"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Cancel button clicked');
                  setShowRejectModal(false);
                  setSelectedWithdrawalRequest(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 bg-transparent text-off-white border-2 border-lava-orange font-bold rounded-lg hover:bg-lava-orange hover:text-lava-black transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-lava-orange mb-4">Delete User</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-bold text-off-white">{userToDelete.name || userToDelete.email}</span>? 
              This action cannot be undone and will permanently remove the user from the database.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingUser}
                className="flex-1 px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingUser ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                disabled={deletingUser}
                className="flex-1 px-4 py-2 bg-transparent text-off-white border-2 border-lava-orange font-bold rounded-lg hover:bg-lava-orange hover:text-lava-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Referred Users Modal */}
      {showReferredUsersModal && selectedUserForReferred && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-lava-orange">Referred Users</h2>
              <button
                onClick={() => {
                  setShowReferredUsersModal(false);
                  setSelectedReferredUsers([]);
                  setSelectedUserForReferred(null);
                }}
                className="text-gray-400 hover:text-off-white text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-300">
                User: <span className="font-bold text-off-white">{selectedUserForReferred.name}</span>
              </p>
              <p className="text-gray-400 text-sm">
                {selectedUserForReferred.email}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Total Referrals: <span className="text-lava-orange font-bold">{selectedReferredUsers.length}</span>
              </p>
            </div>
            {selectedReferredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-lava-orange/20">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReferredUsers.map((refUser) => (
                      <tr key={refUser.id} className="border-t border-lava-orange/10 hover:bg-lava-orange/5">
                        <td className="px-4 py-3 text-off-white">{refUser.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{refUser.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {refUser.joinedAt ? (() => {
                            const date = new Date(refUser.joinedAt);
                            const day = String(date.getDate()).padStart(2, '0');
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const year = String(date.getFullYear()).slice(-2);
                            return `${day}-${month}-${year}`;
                          })() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No referred users found
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowReferredUsersModal(false);
                  setSelectedReferredUsers([]);
                  setSelectedUserForReferred(null);
                }}
                className="px-4 py-2 bg-lava-orange text-lava-black font-bold rounded-lg hover:bg-fiery-yellow transition-colors"
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
