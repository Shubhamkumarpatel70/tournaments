import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { userAPI } from '../utils/api';
import Button from '../components/Button';
import InvitationCountdown from '../components/InvitationCountdown';

const JoinTeam = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [team, setTeam] = useState(null);
  const [error, setError] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [needsGameId, setNeedsGameId] = useState(false);
  const [gameIdValue, setGameIdValue] = useState('');
  const [settingGameId, setSettingGameId] = useState(false);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!user) {
        setError('Please login to join a team');
        setLoading(false);
        // Redirect to register if not logged in
        setTimeout(() => {
          navigate('/register');
        }, 2000);
        return;
      }

      try {
        const response = await api.post(`/team-invitations/join/${code}`);
        setInvitation(response.data.invitation);
        setTeam(response.data.team);
        // Get expiration from invitation
        if (response.data.invitation && response.data.invitation.expiresAt) {
          setExpiresAt(response.data.invitation.expiresAt);
        }
        // Initialize game ID value
        setGameIdValue(user?.gameId || '');
      } catch (error) {
        setError(error.response?.data?.error || 'Invalid or expired invitation code');
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchInvitation();
    }
  }, [code, user]);

  const handleSetGameId = async () => {
    if (!gameIdValue.trim()) {
      alert('Please enter your Game ID');
      return;
    }
    
    try {
      setSettingGameId(true);
      
      // Get current user to ensure we have the _id (handle both _id and id)
      let userId = user?._id || user?.id;
      if (!userId) {
        const currentUserResponse = await userAPI.getCurrentUser();
        userId = currentUserResponse.data?._id || currentUserResponse.data?.id;
      }
      
      if (!userId) {
        alert('User information not available. Please refresh the page.');
        setSettingGameId(false);
        return;
      }
      
      await api.put(`/users/${userId}`, { gameId: gameIdValue.trim() });
      // Refresh user data to get updated gameId
      const updatedUser = await refreshUser();
      setGameIdValue(updatedUser?.gameId || gameIdValue.trim());
      setNeedsGameId(false);
      setSettingGameId(false);
    } catch (error) {
      setSettingGameId(false);
      alert(error.response?.data?.error || 'Failed to update Game ID');
    }
  };

  const handleAccept = async () => {
    // Get the current game ID value (from input or user's existing gameId)
    const currentGameId = gameIdValue || user?.gameId || '';
    
    // Check if Game ID is provided
    if (!currentGameId.trim()) {
      setError('Please enter your Game ID before joining the team');
      return;
    }
    
    try {
      // If game ID has changed or is new, update it first
      if (currentGameId.trim() !== (user?.gameId || '').trim()) {
        setSettingGameId(true);
        try {
          let userId = user?._id || user?.id;
          if (!userId) {
            const currentUserResponse = await userAPI.getCurrentUser();
            userId = currentUserResponse.data?._id || currentUserResponse.data?.id;
          }
          
          if (userId) {
            await api.put(`/users/${userId}`, { gameId: currentGameId.trim() });
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
      const response = await api.post(`/team-invitations/accept-code/${code}`);
      alert('Successfully joined the team!');
      // Refresh the page to show the team in dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to accept invitation';
      setError(errorMsg);
    }
  };

  const handleReject = async () => {
    try {
      if (invitation && invitation._id) {
        await api.post(`/team-invitations/${invitation._id}/reject`);
      }
      alert('Invitation rejected');
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to reject invitation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lava-black">
        <div className="text-lava-orange text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lava-black py-12 px-4">
        <div className="max-w-md w-full bg-charcoal border border-lava-orange/30 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-lava-orange mb-4">Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-lava-black">
      <div className="max-w-2xl mx-auto">
        <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-lava-orange mb-6">Team Invitation</h1>
          
          {expiresAt && (
            <div className="mb-4 p-3 bg-lava-black border border-lava-orange/30 rounded-lg">
              <InvitationCountdown expiresAt={expiresAt} />
            </div>
          )}
          
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
                    value={gameIdValue || user.gameId || ''}
                    onChange={(e) => {
                      setGameIdValue(e.target.value);
                      setNeedsGameId(false);
                    }}
                    placeholder="Enter your Game ID (e.g., Player123, 1234567890)"
                    className="w-full px-4 py-2 bg-charcoal border border-lava-orange/30 rounded-lg text-off-white placeholder-gray-500 focus:outline-none focus:border-lava-orange focus:ring-2 focus:ring-lava-orange/20"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Your in-game username or player ID from BGMI, Free Fire, etc.
                  </p>
                </div>
              </div>
            </div>
          )}

          {team && (
            <div className="bg-lava-black border border-lava-orange/20 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-off-white mb-4">{team.name}</h2>
              <div className="space-y-2">
                {team.members && team.members.length > 0 && (
                  <p className="text-gray-400">
                    <span className="text-lava-orange font-semibold">Team Leader:</span> {team.members[0].name}
                  </p>
                )}
                <p className="text-gray-400">
                  <span className="text-lava-orange font-semibold">Game:</span> {team.game}
                </p>
                <p className="text-gray-400">
                  <span className="text-lava-orange font-semibold">Members:</span> {team.members.length}/4
                </p>
                {team.members.length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-400 mb-2">Current Members:</p>
                    <div className="space-y-1">
                      {team.members.map((member, idx) => (
                        <div key={idx} className="text-sm text-gray-300">
                          {idx + 1}. {member.name} ({member.gameId})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && !error.includes('Invalid or expired') && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="primary"
              onClick={handleAccept}
              className="flex-1"
              disabled={settingGameId || !(gameIdValue || user?.gameId || '').trim()}
            >
              {settingGameId ? 'Saving...' : 'Accept Invitation'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleReject}
              className="flex-1"
              disabled={settingGameId}
            >
              Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinTeam;

