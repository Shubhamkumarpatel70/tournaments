import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { userAPI } from '../utils/api';
import Button from '../components/Button';

const JoinTeamByCode = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [invitationCode, setInvitationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teamDetails, setTeamDetails] = useState(null);
  const [joining, setJoining] = useState(false);
  const [gameIdValue, setGameIdValue] = useState('');
  const [settingGameId, setSettingGameId] = useState(false);

  useEffect(() => {
    if (user) {
      setGameIdValue(user.gameId || '');
    }
  }, [user]);

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTeamDetails(null);

    if (!invitationCode.trim()) {
      setError('Please enter an invitation code');
      return;
    }

    if (!user) {
      setError('Please login to join a team');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/team-invitations/join/${invitationCode.trim()}`);
      setTeamDetails({
        team: response.data.team,
        invitation: response.data.invitation
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid or expired invitation code');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinNow = async () => {
    if (!teamDetails || !invitationCode.trim()) {
      return;
    }

    // Check if Game ID is provided
    const currentGameId = gameIdValue.trim();
    if (!currentGameId) {
      setError('Please enter your Game ID before joining the team');
      return;
    }

    setJoining(true);
    setError('');

    try {
      // If game ID has changed or is new, update it first
      if (currentGameId !== (user?.gameId || '').trim()) {
        setSettingGameId(true);
        try {
          let userId = user?._id || user?.id;
          if (!userId) {
            const currentUserResponse = await userAPI.getCurrentUser();
            userId = currentUserResponse.data?._id || currentUserResponse.data?.id;
          }
          
          if (userId) {
            await api.put(`/users/${userId}`, { gameId: currentGameId });
            await refreshUser();
          }
        } catch (updateError) {
          console.error('Error updating game ID:', updateError);
          // Continue anyway, the backend will check game ID
        } finally {
          setSettingGameId(false);
        }
      }

      // Accept the invitation
      const response = await api.post(`/team-invitations/accept-code/${invitationCode.trim()}`);
      
      if (response.data.message) {
        alert('Successfully joined the team!');
        // Redirect to dashboard
        window.location.href = '/dashboard';
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to join team. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const getTeamLeader = () => {
    // First try to get from captain field
    if (teamDetails?.team?.captain?.name) {
      return teamDetails.team.captain.name;
    }
    // Fallback to first member
    if (teamDetails?.team?.members && teamDetails.team.members.length > 0) {
      return teamDetails.team.members[0].name || 'N/A';
    }
    return 'N/A';
  };

  return (
    <div className="min-h-screen bg-lava-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-lava-orange mb-6 text-center">
            Join Team
          </h1>

          {!teamDetails ? (
            <form onSubmit={handleCodeSubmit} className="space-y-6">
              <div>
                <label htmlFor="invitationCode" className="block text-sm font-medium text-off-white mb-2">
                  Enter Invitation Code
                </label>
                <input
                  type="text"
                  id="invitationCode"
                  value={invitationCode}
                  onChange={(e) => {
                    setInvitationCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder="Enter invitation code"
                  className="w-full px-4 py-3 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white placeholder-gray-500 focus:outline-none focus:border-lava-orange focus:ring-2 focus:ring-lava-orange/20"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Checking...' : 'Check Code'}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* User Info with Editable Game ID */}
              {user && (
                <div className="bg-lava-black border border-lava-orange/20 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-bold text-lava-orange mb-3">Your Information</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-400">Name:</span>
                      <span className="text-off-white font-semibold ml-2">{user.name || 'N/A'}</span>
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-2">Game ID *</label>
                      <input
                        type="text"
                        value={gameIdValue}
                        onChange={(e) => {
                          setGameIdValue(e.target.value);
                          setError('');
                        }}
                        placeholder="Enter your Game ID (e.g., Player123, 1234567890)"
                        className="w-full px-4 py-2 bg-charcoal border border-lava-orange/30 rounded-lg text-off-white placeholder-gray-500 focus:outline-none focus:border-lava-orange focus:ring-2 focus:ring-lava-orange/20"
                        disabled={joining || settingGameId}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Your in-game username or player ID from BGMI, Free Fire, etc.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Team Details */}
              <div className="bg-lava-black/50 border border-lava-orange/20 rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-bold text-lava-orange mb-4">Team Details</h2>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Team Name</label>
                    <p className="text-lg font-semibold text-off-white">
                      {teamDetails.team.name || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Game</label>
                    <p className="text-lg font-semibold text-off-white">
                      {teamDetails.team.game || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Team Leader</label>
                    <p className="text-lg font-semibold text-off-white">
                      {getTeamLeader()}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Members ({teamDetails.team.members?.length || 0}/4)</label>
                    <div className="mt-2 space-y-2">
                      {teamDetails.team.members && teamDetails.team.members.length > 0 ? (
                        teamDetails.team.members.map((member, index) => (
                          <div key={index} className="text-off-white">
                            {index + 1}. {member.name} ({member.gameId || 'N/A'})
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400">No members yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setTeamDetails(null);
                    setInvitationCode('');
                    setError('');
                  }}
                  className="flex-1"
                  disabled={joining}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleJoinNow}
                  className="flex-1"
                  disabled={joining || settingGameId || (teamDetails.team.members?.length || 0) >= 4 || !gameIdValue.trim()}
                >
                  {joining || settingGameId ? (settingGameId ? 'Saving...' : 'Joining...') : 'Join Now'}
                </Button>
              </div>

              {(teamDetails.team.members?.length || 0) >= 4 && (
                <p className="text-red-400 text-sm text-center">
                  Team is full. Cannot join.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinTeamByCode;

