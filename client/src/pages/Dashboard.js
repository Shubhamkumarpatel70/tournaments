import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userAPI, tournamentAPI } from "../utils/api";
import api from "../utils/api";
import Button from "../components/Button";
import CreateTeamModal from "../components/CreateTeamModal";
import TournamentRegistrationModal from "../components/TournamentRegistrationModal";
import EditTeamModal from "../components/EditTeamModal";
import InvitationCountdown from "../components/InvitationCountdown";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is registered/authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/register');
    }
  }, [user, authLoading, navigate]);
  const [stats, setStats] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [myTournaments, setMyTournaments] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [matchSchedules, setMatchSchedules] = useState([]);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);

  const [userJoinedTournaments, setUserJoinedTournaments] = useState([]);
  const [teamRegistrations, setTeamRegistrations] = useState([]); // Store full registration data with teamId
  const [joinedMatches, setJoinedMatches] = useState([]); // Store joined matches/tournaments with full details
  const [matchScheduleDetails, setMatchScheduleDetails] = useState({}); // Store match schedule details by tournament ID
  const [expandedMatchId, setExpandedMatchId] = useState(null); // Track which match details are expanded
  const [isEditTeamModalOpen, setIsEditTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAllMatches, setShowAllMatches] = useState(false);
  const [showArchive, setShowArchive] = useState(false); // Toggle for archive view

  const [loading, setLoading] = useState(true);
  const [teamInvitations, setTeamInvitations] = useState([]);
  const [editingGameId, setEditingGameId] = useState(false);
  const [gameIdValue, setGameIdValue] = useState('');
  const [referralData, setReferralData] = useState(null);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [convertingPoints, setConvertingPoints] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitingTeam, setInvitingTeam] = useState(null);
  const [invitingMember, setInvitingMember] = useState(false);
  const [invitationLink, setInvitationLink] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [invitationExpiresAt, setInvitationExpiresAt] = useState(null);
  const [referralLink, setReferralLink] = useState('');

  // Update current time every second for timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          userResponse,
          tournamentsResponse,
          teamsResponse,
          schedulesResponse,
          registrationsResponse,
          walletResponse,
          referralResponse,
        ] = await Promise.all([
          userAPI.getCurrentUser().catch(err => {
            console.error('Error fetching user:', err);
            return { data: { stats: null } };
          }),
          tournamentAPI.getAll().catch(err => {
            console.error('Error fetching tournaments:', err);
            return { data: [] };
          }),
          api.get("/teams/my-teams").catch(err => {
            console.error('Error fetching teams:', err);
            return { data: [] };
          }),
          api.get("/match-schedules/my-matches").catch(err => {
            console.error('Error fetching match schedules:', err);
            return { data: [] };
          }),
          tournamentAPI.getMyRegistrations().catch(err => {
            console.error('Error fetching registrations:', err);
            return { data: [] };
          }),
          api.get("/wallet/balance").catch(err => {
            console.error('Error fetching wallet balance:', err);
            return { data: { balance: 0 } };
          }),
          api.get("/referrals/my-code").catch(err => {
            console.error('Error fetching referral data:', err);
            return { data: null };
          }),
        ]);

        setStats(userResponse.data?.stats || null);
        setGameIdValue(userResponse.data?.gameId || '');
        setWalletBalance(walletResponse.data?.balance || 0);
        setReferralData(referralResponse.data);
        // Handle both _id and id from API response
        const userId = userResponse.data?._id || userResponse.data?.id || user?._id || user?.id || null;
        setCurrentUserId(userId);
        
        // Filter to only show active teams - handle both array and object responses
        const teamsData = Array.isArray(teamsResponse.data) ? teamsResponse.data : [];
        // Include all teams (active, inactive, and terminated) - user can see all their teams
        const userTeams = teamsData.filter(team => team);
        setMyTeams(userTeams);
        
        // Handle match schedules - ensure it's an array
        const schedulesData = Array.isArray(schedulesResponse.data) ? schedulesResponse.data : [];
        setMatchSchedules(schedulesData);
        
        // Handle both populated and non-populated tournamentId
        const registrationsData = Array.isArray(registrationsResponse.data) ? registrationsResponse.data : [];
        
        // Store full registration data for team-based checks
        setTeamRegistrations(registrationsData);
        
        // Store joined matches with full tournament details
        const joinedMatchesData = registrationsData
          .filter(reg => reg.tournamentId) // Only include registrations with tournament data
          .map(reg => ({
            ...reg,
            tournament: reg.tournamentId,
            matchDate: reg.tournamentId?.matchDate || reg.tournamentId?.date,
            status: reg.status
          }))
          .sort((a, b) => {
            // Sort by match date (upcoming first)
            const dateA = new Date(a.matchDate || 0);
            const dateB = new Date(b.matchDate || 0);
            return dateB - dateA;
          });
        setJoinedMatches(joinedMatchesData);
        
        // Also store tournament IDs for quick lookup
        setUserJoinedTournaments(
          registrationsData.map((reg) => 
            reg.tournamentId?._id || reg.tournamentId || reg.tournament
          ).filter(Boolean)
        );

        // Combine upcoming tournaments and match schedules
        const tournamentsData = Array.isArray(tournamentsResponse.data) ? tournamentsResponse.data : [];
        const upcomingTournaments = tournamentsData
          .filter(
            (t) => {
              if (!t) return false;
              const matchDate = new Date(t.matchDate || t.date);
              const now = new Date();
              return matchDate > now && (t.status === "upcoming" || t.status === "ongoing");
            }
          )
          .map(t => ({
            ...t,
            type: 'tournament',
            displayDate: new Date(t.matchDate || t.date)
          }));

        // Add match schedules for approved registrations
        const upcomingSchedules = schedulesData
          .filter(schedule => {
            if (!schedule || !schedule.matchDate) return false;
            const scheduleDate = new Date(schedule.matchDate);
            return scheduleDate > new Date();
          })
          .map(schedule => ({
            ...schedule,
            type: 'match',
            displayDate: new Date(schedule.matchDate),
            name: schedule.tournamentId?.name || schedule.tournamentId?.name || 'Match',
            game: schedule.tournamentId?.game || schedule.gameType || 'Unknown'
          }));

        // Combine and sort by creation date (most recently added first)
        const allUpcoming = [...upcomingTournaments, ...upcomingSchedules]
          .sort((a, b) => {
            // Sort by creation date (newest first) for "recent added match"
            const dateA = new Date(a.createdAt || a.displayDate || 0);
            const dateB = new Date(b.createdAt || b.displayDate || 0);
            return dateB - dateA; // Descending order (newest first)
          });
        
        setUpcomingMatches(allUpcoming);

        // Set recent tournaments - show all tournaments (not just joined), sorted by creation date
        const recentTournaments = tournamentsResponse.data
          .filter(t => t.status === 'upcoming' || t.status === 'ongoing')
          .sort((a, b) => {
            // Sort by creation date (newest first)
            const dateA = new Date(a.createdAt || a.date);
            const dateB = new Date(b.createdAt || b.date);
            return dateB - dateA; // Sort descending (newest first)
          })
          .slice(0, 5);
        setMyTournaments(recentTournaments);

        // Fetch notifications from backend
        try {
          const notificationsResponse = await api.get('/notifications/my-notifications');
          const notifs = notificationsResponse.data.map(notif => ({
            id: notif._id,
            type: notif.type || 'info',
            message: `${notif.title}: ${notif.message}`,
            time: new Date(notif.createdAt),
            notification: notif
          }));

          // Add system notifications
          if (allUpcoming.length > 0) {
            notifs.push({
              id: 'system-upcoming',
              type: "tournament",
              message: `You have ${allUpcoming.length} upcoming tournament${
                allUpcoming.length > 1 ? "s" : ""
              }`,
              time: new Date(),
            });
          }
          const activeTeams = myTeams.filter(team => team.status === 'active' && !team.isTerminated);
          if (activeTeams.length === 0) {
            notifs.push({
              id: 'system-team',
              type: "team",
              message: "Create a team to participate in tournaments",
              time: new Date(),
            });
          }
          setNotifications(notifs);
        } catch (error) {
          console.error('Error fetching notifications:', error);
          // Fallback to system notifications
          const notifs = [];
          if (allUpcoming.length > 0) {
            notifs.push({
              id: 1,
              type: "tournament",
              message: `You have ${allUpcoming.length} upcoming tournament${
                allUpcoming.length > 1 ? "s" : ""
              }`,
              time: new Date(),
            });
          }
          const activeTeams = myTeams.filter(team => team.status === 'active' && !team.isTerminated);
          if (activeTeams.length === 0) {
            notifs.push({
              id: 2,
              type: "team",
              message: "Create a team to participate in tournaments",
              time: new Date(),
            });
          }
          setNotifications(notifs);
        }
        // Fetch team invitations
        try {
          const invitationsResponse = await api.get('/team-invitations/my-invitations');
          setTeamInvitations(invitationsResponse.data || []);
        } catch (error) {
          console.error('Error fetching invitations:', error);
          setTeamInvitations([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Fetch match schedule details for a tournament
  const fetchMatchScheduleDetails = async (tournamentId) => {
    if (matchScheduleDetails[tournamentId]) {
      // Already fetched, just toggle expansion
      setExpandedMatchId(expandedMatchId === tournamentId ? null : tournamentId);
      return;
    }

    try {
      const response = await api.get(`/match-schedules/tournament/${tournamentId}`);
      const schedules = Array.isArray(response.data) ? response.data : [];
      // Get the first active schedule or the most recent one
      const activeSchedule = schedules.find(s => s.isActive) || schedules[0];
      
      setMatchScheduleDetails(prev => ({
        ...prev,
        [tournamentId]: activeSchedule
      }));
      setExpandedMatchId(tournamentId);
    } catch (error) {
      console.error('Error fetching match schedule:', error);
      // Set to null to indicate no schedule found
      setMatchScheduleDetails(prev => ({
        ...prev,
        [tournamentId]: null
      }));
      setExpandedMatchId(tournamentId);
    }
  };

  // Helper function to check if any team has registered for a tournament
  const hasTeamRegistered = (tournamentId) => {
    if (!tournamentId || !myTeams.length || !teamRegistrations.length) return false;
    
    const tournamentIdStr = tournamentId.toString();
    const userTeamIds = myTeams.map(team => team._id?.toString()).filter(Boolean);
    
    return teamRegistrations.some(reg => {
      const regTournamentId = (reg.tournamentId?._id || reg.tournamentId || reg.tournament)?.toString();
      const regTeamId = (reg.teamId?._id || reg.teamId)?.toString();
      
      return regTournamentId === tournamentIdStr && 
             userTeamIds.includes(regTeamId) &&
             (reg.status === 'pending' || reg.status === 'approved');
    });
  };

  const handleInviteMember = async () => {
    if (!invitingTeam) {
      return;
    }

    setInvitingMember(true);
    try {
      const response = await api.post('/team-invitations/create', {
        teamId: invitingTeam._id
      });

      setInvitationLink(response.data.invitationLink);
      setInvitationCode(response.data.invitationCode);
      setInvitationExpiresAt(response.data.expiresAt);
      
      // Also fetch referral link to include in share
      try {
        const referralResponse = await api.get('/referrals/my-code');
        if (referralResponse.data && referralResponse.data.referralLink) {
          // Store referral link for sharing
          setReferralLink(referralResponse.data.referralLink);
        }
      } catch (refError) {
        console.error('Error fetching referral link:', refError);
        // Continue without referral link
      }
    } catch (error) {
      console.error('Error creating invitation:', error);
      alert(error.response?.data?.error || 'Failed to create invitation link. Please try again.');
    } finally {
      setInvitingMember(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy link. Please copy manually.');
    });
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm("Are you sure you want to delete this team? This action cannot be undone.")) {
      try {
        await api.delete(`/teams/${teamId}`);
        // Refresh teams list from backend to ensure it's updated
        const teamsResponse = await api.get("/teams/my-teams");
        const updatedTeams = teamsResponse.data || [];
        setMyTeams(updatedTeams);
        
        // Add notification if no active teams left
        const activeTeams = updatedTeams.filter(team => team.status === 'active' && !team.isTerminated);
        if (activeTeams.length === 0) {
          setNotifications((prev) => [
            ...prev.filter((n) => n.type !== "team"),
            {
              id: Date.now(),
              type: "team",
              message: "Create a team to participate in tournaments",
              time: new Date(),
            },
          ]);
        }
      } catch (error) {
        console.error("Error deleting team:", error);
        alert(error.response?.data?.error || "Failed to delete team");
      }
    }
  };

  const handleTeamCreated = async (team) => {
    // Refresh teams list to ensure we have the latest data
    try {
      const teamsResponse = await api.get("/teams/my-teams");
      setMyTeams(teamsResponse.data || []);
    } catch (error) {
      console.error("Error refreshing teams:", error);
      // Fallback: add the team to the list
      if (team) {
        setMyTeams((prev) => [team, ...prev.filter(t => t._id !== team._id)]);
      }
    }
    setNotifications((prev) => prev.filter((n) => n.type !== "team"));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lava-black">
        <div className="text-lava-orange text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to register via useEffect
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 neon-text-cyan">
              Welcome, {user?.name}!
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">Your Tournament Dashboard</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button variant="primary" onClick={() => setIsTeamModalOpen(true)} className="flex-1 sm:flex-none">
              + Create Team
            </Button>
            <Button variant="secondary" onClick={() => navigate('/join-team')} className="flex-1 sm:flex-none">
              Join Team
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 sm:mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-4 sm:p-6 hover:border-lava-orange transition-all hover:shadow-lava-glow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-lava-orange mb-2">
                  {myTeams.length}
                </div>
                <div className="text-gray-400 text-sm sm:text-base">Active Teams</div>
              </div>
              <div className="text-3xl sm:text-4xl">👥</div>
            </div>
          </div>
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-4 sm:p-6 hover:border-lava-orange transition-all hover:shadow-lava-glow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-2xl sm:text-3xl font-bold text-fiery-yellow mb-2">
                  ₹{walletBalance.toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm sm:text-base">Wallet Balance</div>
              </div>
              <div className="text-3xl sm:text-4xl">💰</div>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/wallet')}
              className="mt-4 w-full text-sm"
            >
              View Wallet
            </Button>
          </div>
          {referralData && (
            <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-4 sm:p-6 hover:border-lava-orange transition-all hover:shadow-lava-glow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="text-xl sm:text-2xl font-bold text-fiery-yellow mb-1 font-mono">
                    {referralData.referralCode || 'N/A'}
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm">Referral Code</div>
                </div>
                <div className="text-3xl sm:text-4xl">🎁</div>
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Points:</span>
                  <span className="text-lava-orange font-bold">{referralData.referralPoints || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Referrals:</span>
                  <span className="text-off-white font-bold">{referralData.referredCount || 0}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (referralData.referralLink) {
                      // Use share message if available, otherwise use default
                      const shareMessage = referralData.shareMessage || 'Your friend shared a new and exciting opportunity! Click on the link below to know more and join:';
                      // Use fullShareText from backend which has proper formatting (message + link on new line)
                      const shareText = referralData.fullShareText || `${shareMessage}\n\n${referralData.referralLink}`;
                      
                      // Try to use Web Share API if available
                      if (navigator.share) {
                        try {
                          // Use fullShareText which includes the message and link on separate lines
                          // The URL parameter ensures the link is clickable in native share dialogs
                          await navigator.share({
                            title: 'Join me on Tournament Platform!',
                            text: shareText,  // Full text with message and link on separate lines
                            url: referralData.referralLink  // This makes the link clickable in native share
                          });
                        } catch (err) {
                          // User cancelled or error - fallback to clipboard
                          if (err.name !== 'AbortError') {
                            navigator.clipboard.writeText(shareText);
                            alert('Share text copied! Paste it to share with your friends!');
                          }
                        }
                      } else {
                        // Fallback to clipboard
                        navigator.clipboard.writeText(shareText);
                        alert('Share text copied! Paste it to share with your friends!');
                      }
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-lava-orange text-lava-black text-xs font-bold rounded hover:bg-fiery-yellow transition-colors"
                >
                  Share Link
                </button>
                  <button
                    onClick={() => {
                      if (referralData.referralCode) {
                        navigator.clipboard.writeText(referralData.referralCode);
                        alert('Referral code copied!');
                      }
                    }}
                    className="px-3 py-2 bg-charcoal border border-lava-orange/30 text-lava-orange text-xs font-bold rounded hover:border-lava-orange transition-colors"
                    title="Copy Code"
                  >
                    📋
                  </button>
                </div>
                {referralData.referredCount > 0 && (
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/my-referrals')}
                    className="w-full text-xs"
                  >
                    View My Referrals ({referralData.referredCount})
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Refer and Earn Section */}
        {referralData && (
          <div className="mb-6 sm:mb-8 bg-charcoal border border-lava-orange/30 rounded-lg p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-lava-orange mb-4">🎁 Refer and Earn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-lava-black/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Your Referral Code</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-fiery-yellow font-mono">{referralData.referralCode}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(referralData.referralCode);
                      alert('Referral code copied!');
                    }}
                    className="px-3 py-1 bg-lava-orange text-lava-black text-xs font-bold rounded hover:bg-fiery-yellow transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="bg-lava-black/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Referral Points</p>
                <p className="text-2xl font-bold text-lava-orange">{referralData.referralPoints || 0} Points</p>
                <p className="text-xs text-gray-500 mt-1">10 Points = ₹1 | 1 Referral = 100 Points</p>
              </div>
            </div>
            <div className="bg-lava-black/50 rounded-lg p-4 mb-4">
              <p className="text-gray-400 text-sm mb-2">Your Referral Link</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={referralData.referralLink || ''}
                  readOnly
                  className="flex-1 px-3 py-2 bg-lava-black border border-lava-orange/30 rounded text-off-white text-sm"
                />
                <button
                  onClick={async () => {
                    if (referralData.referralLink) {
                      // Use share message if available, otherwise use default
                      const shareMessage = referralData.shareMessage || 'Your friend shared a new and exciting opportunity! Click on the link below to know more and join:';
                      // Use fullShareText from backend which has proper formatting (message + link on new line)
                      const shareText = referralData.fullShareText || `${shareMessage}\n\n${referralData.referralLink}`;
                      
                      // Try to use Web Share API if available
                      if (navigator.share) {
                        try {
                          // Use fullShareText which includes the message and link on separate lines
                          // The URL parameter ensures the link is clickable in native share dialogs
                          await navigator.share({
                            title: 'Join me on Tournament Platform!',
                            text: shareText,  // Full text with message and link on separate lines
                            url: referralData.referralLink  // This makes the link clickable in native share
                          });
                        } catch (err) {
                          // User cancelled or error - fallback to clipboard
                          if (err.name !== 'AbortError') {
                            navigator.clipboard.writeText(shareText);
                            alert('Share text copied! Paste it to share with your friends!');
                          }
                        }
                      } else {
                        // Fallback to clipboard
                        navigator.clipboard.writeText(shareText);
                        alert('Share text copied! Paste it to share with your friends!');
                      }
                    }
                  }}
                  className="px-3 py-2 bg-lava-orange text-lava-black text-xs font-bold rounded hover:bg-fiery-yellow transition-colors"
                >
                  Copy Link
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 bg-lava-black/50 rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-1">Total Referrals</p>
                <p className="text-xl font-bold text-off-white">{referralData.referredCount || 0}</p>
              </div>
              {referralData.referralPoints > 0 && (
                <Button
                  variant="primary"
                  onClick={async () => {
                    const rupeesToAdd = (referralData.referralPoints || 0) / 10;
                    if (window.confirm(`Convert ${referralData.referralPoints} points to ₹${rupeesToAdd.toFixed(2)} in your wallet?`)) {
                      setConvertingPoints(true);
                      try {
                        const response = await api.post('/referrals/convert-points');
                        alert(`Successfully converted ${response.data.pointsConverted} points to ₹${response.data.rupeesAdded.toFixed(2)} in wallet!`);
                        // Refresh wallet balance and referral data
                        const [walletRes, referralRes] = await Promise.all([
                          api.get("/wallet/balance"),
                          api.get("/referrals/my-code")
                        ]);
                        setWalletBalance(walletRes.data?.balance || 0);
                        setReferralData(referralRes.data);
                      } catch (error) {
                        alert(error.response?.data?.error || 'Failed to convert points');
                      } finally {
                        setConvertingPoints(false);
                      }
                    }
                  }}
                  disabled={convertingPoints}
                  className="w-full sm:w-auto"
                >
                  {convertingPoints ? 'Converting...' : `Convert to Wallet (₹${((referralData.referralPoints || 0) / 10).toFixed(2)})`}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Team Invitations */}
        {teamInvitations.length > 0 && (
          <div className="mb-6 sm:mb-8 bg-charcoal border border-lava-orange/30 rounded-lg p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-lava-orange mb-4">Team Invitations</h2>
            <div className="space-y-3">
              {teamInvitations.map((invitation) => (
                <div key={invitation._id} className="bg-lava-black border border-lava-orange/20 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex-1">
                    <p className="text-off-white font-semibold">{invitation.teamId?.name || 'Team'}</p>
                    <p className="text-gray-400 text-sm">Invited by {invitation.invitedBy?.name || 'Unknown'}</p>
                    {invitation.expiresAt && (
                      <div className="mt-2">
                        <InvitationCountdown expiresAt={invitation.expiresAt} />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      onClick={async () => {
                        try {
                          // Check if user has Game ID before accepting
                          if (!user?.gameId || user.gameId.trim() === '') {
                            alert('You need to set your Game ID before joining a team. Please set it in your profile settings.');
                            return;
                          }
                          await api.post(`/team-invitations/${invitation._id}/accept`);
                          // Refresh teams and invitations
                          const teamsResponse = await api.get("/teams/my-teams");
                          setMyTeams(teamsResponse.data || []);
                          const invitationsResponse = await api.get('/team-invitations/my-invitations');
                          setTeamInvitations(invitationsResponse.data || []);
                        } catch (error) {
                          const errorMsg = error.response?.data?.error || 'Failed to accept invitation';
                          if (errorMsg.includes('Game ID')) {
                            alert('You need to set your Game ID before joining a team. Please set it in your profile settings.');
                          } else {
                            alert(errorMsg);
                          }
                        }
                      }}
                      className="text-xs sm:text-sm"
                    >
                      Accept
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={async () => {
                        try {
                          await api.post(`/team-invitations/${invitation._id}/reject`);
                          const invitationsResponse = await api.get('/team-invitations/my-invitations');
                          setTeamInvitations(invitationsResponse.data || []);
                        } catch (error) {
                          alert(error.response?.data?.error || 'Failed to reject invitation');
                        }
                      }}
                      className="text-xs sm:text-sm"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Upcoming Matches */}
          <div className="lg:col-span-2 bg-charcoal border border-lava-orange/30 rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-lava-orange">
                Upcoming Matches
              </h2>
              {upcomingMatches.length > 1 && (
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    className="text-xs sm:text-sm w-full sm:w-auto"
                    onClick={() => setShowAllMatches(!showAllMatches)}
                  >
                    {showAllMatches ? 'Show Less' : 'View All'}
                  </Button>
                  <Link to="/upcoming-matches">
                    <Button 
                      variant="secondary" 
                      className="text-xs sm:text-sm w-full sm:w-auto"
                    >
                      View All Page
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            {upcomingMatches.length > 0 ? (
              <div className="space-y-4">
                {(showAllMatches ? upcomingMatches : upcomingMatches.slice(0, 1)).map((item) => {
                  // Check if any team has registered for this tournament
                  const tournamentId = item._id || item.id;
                  const hasJoined = item.type === 'tournament' && hasTeamRegistered(tournamentId);
                  
                  return (
                  <div
                    key={item._id}
                    className="bg-lava-black border border-lava-orange/20 rounded-lg p-3 sm:p-4 hover:border-lava-orange transition-all"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                      <div className="flex-1 w-full">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <span className="bg-lava-orange text-lava-black px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                            {item.game}
                          </span>
                          <h3 className="font-bold text-base sm:text-lg break-words">
                            {item.name}
                          </h3>
                          {item.type === 'match' && (
                            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold">
                              Match Schedule
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs sm:text-sm mb-2 break-words">
                          📅{" "}
                          {(() => {
                            const date = new Date(item.displayDate || item.matchDate || item.date);
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
                        {item.type === 'match' ? (
                          <div className="space-y-2 bg-charcoal/50 rounded-lg p-3 mt-2">
                            <p className="text-gray-400 text-sm">
                              🎮 Game ID: <span className="text-lava-orange font-mono font-bold">{item.gameId}</span>
                            </p>
                            <p className="text-gray-400 text-sm">
                              🔑 Password: <span className="text-lava-orange font-mono font-bold">{item.password}</span>
                            </p>
                            <p className="text-gray-400 text-sm">
                              👥 Type: <span className="text-off-white font-semibold">{item.tournamentType}</span>
                            </p>
                            <p className="text-gray-400 text-sm">
                              🎯 Game Type: <span className="text-off-white font-semibold">{item.gameType}</span>
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-gray-400 text-sm">
                              👥 {item.registeredTeams || 0}/{item.maxTeams} teams registered
                            </p>
                            {item.registrationDeadline && (
                              <p className="text-gray-400 text-sm">
                                ⏰ Registration closes: {new Date(item.registrationDeadline).toLocaleString()}
                              </p>
                            )}
                            <p className="text-gray-400 text-sm">
                              💰 Entry Fee: <span className="text-fiery-yellow font-semibold">₹{item.entryFee?.toLocaleString()}</span>
                            </p>
                            <p className="text-gray-400 text-sm">
                              🏆 Prize Pool: <span className="text-fiery-yellow font-semibold">₹{item.prizePool?.toLocaleString()}</span>
                            </p>
                          </div>
                        )}
                      </div>
                      {item.type === 'tournament' && (
                        <div className="w-full sm:w-auto flex flex-col sm:flex-col items-start sm:items-end gap-2">
                          <div className="text-fiery-yellow font-bold text-lg sm:text-xl mb-1 sm:mb-2">
                            ₹{item.prizePool?.toLocaleString()}
                          </div>
                          {hasJoined ? (
                            <Button variant="secondary" disabled className="text-xs sm:text-sm opacity-75 cursor-not-allowed w-full sm:w-auto">
                              ✓ Joined
                            </Button>
                          ) : (
                            <Button 
                              variant="secondary" 
                              className="text-xs sm:text-sm w-full sm:w-auto"
                              onClick={() => {
                                setSelectedTournament(item);
                                setIsRegistrationModalOpen(true);
                              }}
                            >
                              Register
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                No upcoming matches scheduled
              </p>
            )}
          </div>

          {/* Notifications */}
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-lava-orange">
                Notifications
              </h2>
              {notifications.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/notifications')}
                  className="w-full sm:w-auto"
                >
                  View All
                </Button>
              )}
            </div>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications
                  .sort((a, b) => new Date(b.time) - new Date(a.time)) // Sort by most recent first
                  .slice(0, 3) // Show only top 3
                  .map((notif) => (
                    <div
                      key={notif.id}
                      className="bg-lava-black border border-lava-orange/20 rounded-lg p-3"
                    >
                      <p className="text-sm text-off-white">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.time).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                {notifications.length > 3 && (
                  <p className="text-xs text-gray-400 text-center pt-2">
                    +{notifications.length - 3} more notification{notifications.length - 3 > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8 text-sm">
                No new notifications
              </p>
            )}
          </div>
        </div>

        {/* Congratulations Banner for Winning Teams */}
        {myTeams.some(team => team.matchResult === 'win') && (
          <div className="mb-6 sm:mb-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 rounded-lg p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl sm:text-5xl">🎉</div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-green-400 mb-2">
                  Congratulations! You Won the Match!
                </h3>
                <p className="text-gray-300 text-sm sm:text-base mb-3">
                  {myTeams.filter(team => team.matchResult === 'win').map(team => team.name).join(', ')} {myTeams.filter(team => team.matchResult === 'win').length === 1 ? 'has' : 'have'} won the match! Great job and keep up the excellent performance!
                </p>
                <div className="flex flex-wrap gap-2">
                  {myTeams
                    .filter(team => team.matchResult === 'win')
                    .map(team => (
                      <span
                        key={team._id}
                        className="px-3 py-1 bg-green-500/30 border border-green-500/50 rounded-lg text-green-300 text-sm font-semibold"
                      >
                        🏆 {team.name} - {team.game}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Teams */}
        <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-lava-orange">My Teams</h2>
            {myTeams.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsTeamModalOpen(true)}
                  className="flex-1 sm:flex-none"
                >
                  + Create Team
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/join-team')}
                  className="flex-1 sm:flex-none"
                >
                  Join Team
                </Button>
              </div>
            )}
          </div>
          {myTeams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {myTeams.map((team) => (
                <div
                  key={team._id}
                  className="bg-lava-black border border-lava-orange/20 rounded-lg p-3 sm:p-4 hover:border-lava-orange transition-all"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-bold text-base sm:text-lg break-words">{team.name}</h3>
                        <span className="bg-lava-orange text-lava-black px-2 py-1 rounded text-xs font-bold">
                          {team.game}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs ${
                            team.status === "active"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                          }`}
                        >
                          {team.status}
                        </span>
                        {team.isTerminated && (
                          <span className="inline-block px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                            Terminated
                          </span>
                        )}
                      </div>
                      {team.isTerminated && team.terminationReason && (
                        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
                          <strong>Termination Reason:</strong> {team.terminationReason}
                        </div>
                      )}
                    </div>
                    {!team.isTerminated && (
                      <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                        {/* Check if current user is the team captain */}
                        {(() => {
                          const currentUserId = user?._id || user?.id;
                          const captainId = team.captain?._id || team.captain || team.captain?.toString();
                          const isCaptain = currentUserId && captainId && 
                            (currentUserId.toString() === captainId.toString() || 
                             currentUserId === captainId);
                          
                          if (isCaptain) {
                            // Show all buttons for captain
                            return (
                              <>
                                {team.members.length < 4 && (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => {
                                      setInvitingTeam(team);
                                      setInvitationLink('');
                                      setInvitationCode('');
                                      setInvitationExpiresAt(null);
                                      setReferralLink('');
                                      setShowInviteModal(true);
                                    }}
                                    className="flex-1 sm:flex-none text-xs sm:text-sm"
                                  >
                                    Invite
                                  </Button>
                                )}
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setEditingTeam(team);
                                    setIsEditTeamModalOpen(true);
                                  }}
                                  className="flex-1 sm:flex-none text-xs sm:text-sm"
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDeleteTeam(team._id)}
                                  className="flex-1 sm:flex-none text-xs sm:text-sm"
                                >
                                  Delete
                                </Button>
                              </>
                            );
                          } else {
                            // User joined via invite - show improved UI with leave option
                            return (
                              <div className="w-full space-y-3">
                                <div className="bg-lava-black/50 border border-lava-orange/20 rounded-lg p-3 flex items-start gap-3">
                                  <div className="flex-shrink-0 mt-0.5">
                                    <svg className="w-5 h-5 text-lava-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-lava-orange mb-1">
                                      Team Member
                                    </p>
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                      You joined this team via invitation. Only the team leader can edit or delete the team.
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={async () => {
                                    if (window.confirm('Are you sure you want to leave this team? You will need to be re-invited to join again.')) {
                                      try {
                                        await api.post(`/teams/${team._id}/leave`);
                                        // Refresh teams list
                                        const teamsResponse = await api.get("/teams/my-teams");
                                        const updatedTeams = teamsResponse.data || [];
                                        setMyTeams(updatedTeams);
                                        alert('You have successfully left the team');
                                      } catch (error) {
                                        console.error('Error leaving team:', error);
                                        alert(error.response?.data?.error || 'Failed to leave team. Please try again.');
                                      }
                                    }
                                  }}
                                  className="w-full sm:w-auto text-xs sm:text-sm"
                                >
                                  Leave Team
                                </Button>
                              </div>
                            );
                          }
                        })()}
                      </div>
                    )}
                    {team.isTerminated && (
                      <div className="text-xs text-red-400 italic">
                        Team terminated. Cannot edit or delete.
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 pt-2 border-t border-lava-orange/10">
                    <p className="text-sm text-gray-400">
                      👥 Members: {team.members.length}/4
                    </p>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {team.members.map((member, idx) => (
                        <div key={idx} className="text-xs text-gray-300 flex items-center gap-2">
                          <span className="text-lava-orange font-bold">{idx + 1}.</span>
                          <span>{member.name}</span>
                          <span className="text-gray-500">({member.gameId})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mb-4">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-gray-400 mb-2 text-lg">You don't have any teams yet</p>
                <p className="text-gray-500 text-sm mb-6">Create your own team or join an existing one to start participating in tournaments</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  variant="primary"
                  onClick={() => setIsTeamModalOpen(true)}
                  className="px-8 py-3 w-full sm:w-auto"
                >
                  + Create Team
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/join-team')}
                  className="px-8 py-3 w-full sm:w-auto"
                >
                  Join Team
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Match Join Details Section */}
        {(() => {
          const upcomingSchedules = matchSchedules.filter(schedule => {
            if (!schedule || !schedule.matchDate) return false;
            const scheduleDate = new Date(schedule.matchDate);
            return scheduleDate > new Date();
          });

          return upcomingSchedules.length > 0 ? (
            <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-lava-orange">
                Match Join Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {upcomingSchedules.map((schedule) => {
                  const matchDate = new Date(schedule.matchDate);
                  const timeRemaining = matchDate - currentTime;
                  const isTimeRemaining = timeRemaining > 0;
                  
                  // Calculate time remaining
                  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

                  return (
                    <div
                      key={schedule._id}
                      className="bg-lava-black border border-lava-orange/20 rounded-lg p-3 sm:p-4 hover:border-lava-orange transition-all"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                        <h3 className="font-bold text-base sm:text-lg break-words">
                          {schedule.tournamentId?.name || schedule.tournamentId?.name || "Tournament"}
                        </h3>
                        <span className="bg-lava-orange text-lava-black px-2 py-1 rounded text-xs font-bold">
                          {schedule.tournamentId?.game || schedule.gameType}
                        </span>
                      </div>
                      
                      {/* Timer */}
                      {isTimeRemaining && (
                        <div className="bg-charcoal/50 rounded-lg p-3 mb-4 border border-lava-orange/20">
                          <p className="text-xs text-gray-400 mb-2">⏰ Time Remaining</p>
                          <div className="flex items-center gap-2 text-lava-orange font-bold">
                            {days > 0 && <span>{days}d</span>}
                            <span>{String(hours).padStart(2, '0')}h</span>
                            <span>{String(minutes).padStart(2, '0')}m</span>
                            <span>{String(seconds).padStart(2, '0')}s</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            Match starts: {matchDate.toLocaleString()}
                          </p>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-400">🎮 Game ID</label>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-lava-orange font-mono font-bold">
                              {schedule.gameId}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(schedule.gameId);
                                alert("Game ID copied!");
                              }}
                              className="px-2 py-1 bg-lava-orange text-lava-black text-xs font-bold rounded hover:bg-fiery-yellow transition-colors"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">🔑 Password</label>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-lava-orange font-mono font-bold">
                              {schedule.password}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(schedule.password);
                                alert("Password copied!");
                              }}
                              className="px-2 py-1 bg-lava-orange text-lava-black text-xs font-bold rounded hover:bg-fiery-yellow transition-colors"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                        {schedule.tournamentType && (
                          <div>
                            <label className="text-xs text-gray-400">👥 Tournament Type</label>
                            <div className="mt-1">
                              <span className="text-off-white font-semibold">
                                {schedule.tournamentType}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null;
        })()}

        {/* Joined Matches */}
        {joinedMatches.length > 0 && (
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-lava-orange">
                {showArchive ? 'Archived Matches' : 'Joined Matches'}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowArchive(!showArchive)}
                  className="whitespace-nowrap"
                >
                  {showArchive ? 'Show Recent' : 'Archive Matches'}
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              {(() => {
                // Sort matches by date (newest first)
                const sortedMatches = [...joinedMatches].sort((a, b) => {
                  const dateA = new Date(a.matchDate || a.tournament?.matchDate || a.tournamentId?.matchDate || 0);
                  const dateB = new Date(b.matchDate || b.tournament?.matchDate || b.tournamentId?.matchDate || 0);
                  return dateB - dateA;
                });

                // Separate into recent (upcoming or recent past) and archived (older past)
                const now = new Date();
                const recentMatches = sortedMatches.filter(reg => {
                  const matchDate = new Date(reg.matchDate || reg.tournament?.matchDate || reg.tournamentId?.matchDate || 0);
                  // Consider matches from last 30 days or upcoming as recent
                  const daysDiff = (now - matchDate) / (1000 * 60 * 60 * 24);
                  return matchDate > now || daysDiff <= 30;
                });
                const archivedMatches = sortedMatches.filter(reg => {
                  const matchDate = new Date(reg.matchDate || reg.tournament?.matchDate || reg.tournamentId?.matchDate || 0);
                  const daysDiff = (now - matchDate) / (1000 * 60 * 60 * 24);
                  return matchDate <= now && daysDiff > 30;
                });

                // Show only 3 most recent if not in archive view
                const displayMatches = showArchive ? archivedMatches : recentMatches.slice(0, 3);
                const hasMoreMatches = !showArchive && recentMatches.length > 3;

                return (
                  <>
                    {displayMatches.length > 0 ? (
                      displayMatches.map((registration) => {
                        const tournament = registration.tournament || registration.tournamentId;
                        if (!tournament) return null;
                        
                        const matchDate = new Date(registration.matchDate || tournament.matchDate || tournament.date);
                        const isUpcoming = matchDate > new Date();
                        const statusColors = {
                          pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                          approved: 'bg-green-500/20 text-green-400 border-green-500/30',
                          rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
                        };
                        
                        return (
                          <div
                            key={registration._id}
                            className="bg-lava-black border border-lava-orange/20 rounded-lg p-3 sm:p-4 hover:border-lava-orange transition-all"
                          >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
                              <div className="flex-1 w-full">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                  <span className="bg-lava-orange text-lava-black px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                                    {tournament.game}
                                  </span>
                                  <h3 className="font-bold text-base sm:text-lg break-words">{tournament.name}</h3>
                                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold border ${statusColors[registration.status] || statusColors.pending}`}>
                                    {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                                  </span>
                                </div>
                                <div className="space-y-1 text-xs sm:text-sm text-gray-400">
                                  <p>
                                    👥 Team: <span className="text-off-white font-semibold">{registration.teamName}</span>
                                  </p>
                                  {registration.phoneNumber && (
                                    <p>
                                      📱 Phone: <span className="text-off-white font-semibold">{registration.phoneNumber}</span>
                                    </p>
                                  )}
                                  <p>
                                    📅 Match Date & Time: {(() => {
                                      const day = String(matchDate.getDate()).padStart(2, '0');
                                      const month = String(matchDate.getMonth() + 1).padStart(2, '0');
                                      const year = String(matchDate.getFullYear()).slice(-2);
                                      const time = matchDate.toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                      });
                                      return `${day}-${month}-${year}, ${time}`;
                                    })()}
                                  </p>
                                  <p>
                                    💰 Prize Pool: <span className="text-fiery-yellow font-semibold">₹{tournament.prizePool?.toLocaleString() || '0'}</span>
                                  </p>
                                  <p>
                                    💳 Payment: <span className="text-off-white">{registration.paymentType} - {registration.paymentOption}</span>
                                  </p>
                                  {registration.rejectionReason && (
                                    <p className="text-red-400">
                                      ❌ Reason: {registration.rejectionReason}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="w-full sm:w-auto flex flex-col items-start sm:items-end gap-2">
                                {isUpcoming && (
                                  <span className="bg-green-500/20 text-green-400 px-2 sm:px-3 py-1 rounded text-xs font-bold border border-green-500/30">
                                    Upcoming
                                  </span>
                                )}
                                {!isUpcoming && (
                                  <span className="bg-gray-500/20 text-gray-400 px-2 sm:px-3 py-1 rounded text-xs font-bold border border-gray-500/30">
                                    Past Match
                                  </span>
                                )}
                                <div className="text-left sm:text-right">
                                  <div className="text-fiery-yellow font-bold text-lg sm:text-xl">
                                    ₹{tournament.prizePool?.toLocaleString() || '0'}
                                  </div>
                                  <div className="text-xs text-gray-400">Prize Pool</div>
                                </div>
                              </div>
                            </div>
                            {registration.status === 'approved' && (
                              <div className="flex justify-center mt-4 pt-4 border-t border-lava-orange/20">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => fetchMatchScheduleDetails(tournament._id || tournament.id)}
                                  className="whitespace-nowrap"
                                >
                                  {expandedMatchId === (tournament._id || tournament.id) ? 'Hide Details' : 'View Match Details'}
                                </Button>
                              </div>
                            )}
                            {/* Match Schedule Details */}
                            {expandedMatchId === (tournament._id || tournament.id) && (
                              <div className="mt-4 pt-4 border-t border-lava-orange/20">
                                <h4 className="text-sm font-bold text-lava-orange mb-3">Match Schedule</h4>
                                {matchScheduleDetails[tournament._id || tournament.id] ? (
                                  <div className="space-y-3 bg-charcoal/50 rounded-lg p-4">
                                    <div>
                                      <label className="text-xs text-gray-400">Game ID:</label>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-lava-orange font-mono font-bold text-lg">
                                          {matchScheduleDetails[tournament._id || tournament.id].gameId}
                                        </span>
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(matchScheduleDetails[tournament._id || tournament.id].gameId);
                                            alert("Game ID copied!");
                                          }}
                                          className="px-2 py-1 bg-lava-orange text-lava-black text-xs font-bold rounded hover:bg-fiery-yellow transition-colors"
                                        >
                                          Copy
                                        </button>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-400">Password:</label>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-lava-orange font-mono font-bold text-lg">
                                          {matchScheduleDetails[tournament._id || tournament.id].password}
                                        </span>
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(matchScheduleDetails[tournament._id || tournament.id].password);
                                            alert("Password copied!");
                                          }}
                                          className="px-2 py-1 bg-lava-orange text-lava-black text-xs font-bold rounded hover:bg-fiery-yellow transition-colors"
                                        >
                                          Copy
                                        </button>
                                      </div>
                                    </div>
                                    {matchScheduleDetails[tournament._id || tournament.id].tournamentType && (
                                      <div>
                                        <label className="text-xs text-gray-400">Type:</label>
                                        <div className="mt-1">
                                          <span className="text-off-white font-semibold text-lg">
                                            {matchScheduleDetails[tournament._id || tournament.id].tournamentType}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-gray-400 text-sm py-4 text-center">
                                    No match schedule available yet
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        {showArchive ? 'No archived matches found' : 'No recent matches'}
                      </div>
                    )}
                    {hasMoreMatches && !showArchive && (
                      <div className="text-center pt-4 border-t border-lava-orange/20">
                        <p className="text-sm text-gray-400 mb-2">
                          Showing 3 of {recentMatches.length} recent matches
                        </p>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setShowArchive(true)}
                        >
                          View All Archived Matches ({archivedMatches.length})
                        </Button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Recent Tournaments */}
        <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-lava-orange">
            Recent Tournaments
          </h2>
          {myTournaments.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {myTournaments.map((tournament) => {
                const tournamentId = tournament._id || tournament.id;
                const hasJoined = hasTeamRegistered(tournamentId);
                return (
                  <div
                    key={tournamentId}
                    className="bg-lava-black border border-lava-orange/20 rounded-lg p-3 sm:p-4 hover:border-lava-orange transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
                      <div className="flex-1 w-full">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <span className="bg-lava-orange text-lava-black px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                            {tournament.game}
                          </span>
                          <h3 className="font-bold text-base sm:text-lg break-words">{tournament.name}</h3>
                        </div>
                        {tournament.description && (
                          <p className="text-gray-300 text-xs sm:text-sm mb-2 line-clamp-2">{tournament.description}</p>
                        )}
                        <p className="text-gray-400 text-xs sm:text-sm break-words">
                          📅 {(() => {
                            const date = new Date(tournament.date || tournament.matchDate);
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
                        {tournament.registeredTeams !== undefined && (
                          <p className="text-gray-400 text-xs sm:text-sm mt-1">
                            👥 {tournament.registeredTeams || 0}/{tournament.maxTeams || 'N/A'} teams registered
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <div className="text-left sm:text-right">
                          <div className="text-fiery-yellow font-bold text-lg sm:text-xl">
                            ₹{tournament.prizePool?.toLocaleString() || '0'}
                          </div>
                          <div className="text-xs text-gray-400">Prize Pool</div>
                        </div>
                        {hasJoined ? (
                          <Button
                            variant="secondary"
                            disabled
                            className="whitespace-nowrap opacity-75 cursor-not-allowed w-full sm:w-auto text-xs sm:text-sm"
                          >
                            ✓ Joined
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            onClick={() => {
                              setSelectedTournament(tournament);
                              setIsRegistrationModalOpen(true);
                            }}
                            className="whitespace-nowrap w-full sm:w-auto text-xs sm:text-sm"
                          >
                            Join Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-6 sm:py-8 text-sm sm:text-base">
              No tournaments yet. Join one to get started!
            </p>
          )}
        </div>
      </div>

      <CreateTeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        onSuccess={handleTeamCreated}
      />
      {selectedTournament && (
        <TournamentRegistrationModal
          isOpen={isRegistrationModalOpen}
          onClose={() => {
            setIsRegistrationModalOpen(false);
            setSelectedTournament(null);
          }}
          tournament={selectedTournament}
          onSuccess={async () => {
            // Refresh registrations to update the joined status
            try {
              const registrationsResponse = await tournamentAPI.getMyRegistrations();
              const registrationsData = Array.isArray(registrationsResponse.data) ? registrationsResponse.data : [];
              
              // Store full registration data for team-based checks
              setTeamRegistrations(registrationsData);
              
              // Store joined matches with full tournament details
              const joinedMatchesData = registrationsData
                .filter(reg => reg.tournamentId)
                .map(reg => ({
                  ...reg,
                  tournament: reg.tournamentId,
                  matchDate: reg.tournamentId?.matchDate || reg.tournamentId?.date,
                  status: reg.status
                }))
                .sort((a, b) => {
                  const dateA = new Date(a.matchDate || 0);
                  const dateB = new Date(b.matchDate || 0);
                  return dateB - dateA;
                });
              setJoinedMatches(joinedMatchesData);
              
              // Also store tournament IDs for quick lookup
              setUserJoinedTournaments(
                registrationsData.map((reg) => 
                  reg.tournamentId?._id || reg.tournamentId || reg.tournament
                ).filter(Boolean)
              );
            } catch (error) {
              console.error("Error refreshing registrations:", error);
            }
          }}
        />
      )}
      {isEditTeamModalOpen && editingTeam && (
        <EditTeamModal
          isOpen={isEditTeamModalOpen}
          team={editingTeam}
          onClose={() => {
            setIsEditTeamModalOpen(false);
            setEditingTeam(null);
          }}
          onSuccess={async (updatedTeam) => {
            // Refresh teams list to ensure we have the latest data
            try {
              const teamsResponse = await api.get("/teams/my-teams");
              setMyTeams(teamsResponse.data || []);
            } catch (error) {
              console.error("Error refreshing teams:", error);
              // Fallback: update the team in the list
              setMyTeams((prevTeams) => {
                return prevTeams.map((team) =>
                  team._id === updatedTeam._id ? updatedTeam : team
                );
              });
            }
            setIsEditTeamModalOpen(false);
            setEditingTeam(null);
          }}
        />
      )}

      {/* Invite Team Member Modal */}
      {showInviteModal && invitingTeam && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-lava-orange">Invite Team Member</h2>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInvitingTeam(null);
                  setInvitationLink('');
                  setInvitationCode('');
                  setInvitationExpiresAt(null);
                  setReferralLink('');
                }}
                className="text-gray-400 hover:text-off-white text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Team Details */}
            <div className="mb-6 p-4 bg-lava-black/50 border border-lava-orange/20 rounded-lg">
              <h3 className="text-lg font-bold text-lava-orange mb-3">Team Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Team Name:</span>
                  <span className="text-off-white font-semibold ml-2">{invitingTeam.name}</span>
                </div>
                <div>
                  <span className="text-gray-400">Game:</span>
                  <span className="text-off-white font-semibold ml-2">{invitingTeam.game}</span>
                </div>
                <div>
                  <span className="text-gray-400">Team Leader:</span>
                  <span className="text-off-white font-semibold ml-2">
                    {invitingTeam.captain?.name || 
                     (invitingTeam.members && invitingTeam.members.length > 0 
                      ? invitingTeam.members[0].name 
                      : 'N/A')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Members ({invitingTeam.members?.length || 0}/4):</span>
                  <div className="mt-2 space-y-1">
                    {invitingTeam.members && invitingTeam.members.map((member, idx) => (
                      <div key={idx} className="text-xs text-gray-300 flex items-center gap-2">
                        <span className="text-lava-orange font-bold">{idx + 1}.</span>
                        <span>{member.name}</span>
                        <span className="text-gray-500">({member.gameId})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Invitation Link Section */}
            {invitationLink ? (
              <div className="space-y-4">
                <div className="p-4 bg-lava-black/50 border border-lava-orange/20 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Invitation Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={invitationLink}
                      readOnly
                      className="flex-1 bg-lava-black border border-lava-orange/30 rounded-lg px-4 py-2 text-off-white text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(invitationLink)}
                      className="px-4 py-2 bg-lava-orange text-lava-black font-bold rounded-lg hover:bg-fiery-yellow transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                {invitationCode && (
                  <div className="p-4 bg-lava-black/50 border border-lava-orange/20 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Invitation Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={invitationCode}
                        readOnly
                        className="flex-1 bg-lava-black border border-lava-orange/30 rounded-lg px-4 py-2 text-off-white text-sm font-mono text-center"
                      />
                      <button
                        onClick={() => copyToClipboard(invitationCode)}
                        className="px-4 py-2 bg-lava-orange text-lava-black font-bold rounded-lg hover:bg-fiery-yellow transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
                {invitationExpiresAt && (
                  <div className="text-xs text-gray-400 text-center">
                    Link expires: {new Date(invitationExpiresAt).toLocaleString()}
                  </div>
                )}
                {referralLink && (
                  <div className="p-4 bg-lava-black/50 border border-lava-orange/20 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Referral Link (Share Together)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={referralLink}
                        readOnly
                        className="flex-1 bg-lava-black border border-lava-orange/30 rounded-lg px-4 py-2 text-off-white text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(referralLink)}
                        className="px-4 py-2 bg-lava-orange text-lava-black font-bold rounded-lg hover:bg-fiery-yellow transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
                <div className="text-sm text-gray-300 text-center">
                  Share both links with others to join your team and earn referral rewards!
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-300 text-center">
                  Click the button below to generate an invitation link that you can share with others.
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {!invitationLink ? (
                <button
                  onClick={handleInviteMember}
                  disabled={invitingMember}
                  className="flex-1 px-4 py-2 bg-lava-orange text-lava-black font-bold rounded-lg hover:bg-fiery-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {invitingMember ? 'Generating...' : 'Generate Invitation Link'}
                </button>
              ) : null}
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInvitingTeam(null);
                  setInvitationLink('');
                  setInvitationCode('');
                  setInvitationExpiresAt(null);
                  setReferralLink('');
                }}
                disabled={invitingMember}
                className={`${invitationLink ? 'flex-1' : 'flex-1'} px-4 py-2 bg-transparent text-off-white border-2 border-lava-orange font-bold rounded-lg hover:bg-lava-orange hover:text-lava-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {invitationLink ? 'Close' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
