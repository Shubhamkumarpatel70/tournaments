import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { userAPI } from '../utils/api';
import Button from '../components/Button';
import InvitationCountdown from '../components/InvitationCountdown';

const JoinTeam = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
        // Check if user has Game ID
        if (user && (!user.gameId || user.gameId.trim() === '')) {
          setNeedsGameId(true);
          setGameIdValue(user.gameId || '');
        }
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
      setNeedsGameId(false);
      setSettingGameId(false);
      // Update user in context by refreshing
      window.location.reload(); // Simple way to refresh user data
    } catch (error) {
      setSettingGameId(false);
      alert(error.response?.data?.error || 'Failed to update Game ID');
    }
  };

  const handleAccept = async () => {
    // Check if Game ID is still needed
    if (needsGameId && (!gameIdValue || gameIdValue.trim() === '')) {
      setNeedsGameId(true);
      return;
    }
    
    try {
      await api.post(`/team-invitations/accept-code/${code}`);
      alert('Successfully joined the team!');
      navigate('/dashboard');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to accept invitation';
      if (errorMsg.includes('Game ID')) {
        setNeedsGameId(true);
      }
      alert(errorMsg);
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
          
          {team && (
            <div className="bg-lava-black border border-lava-orange/20 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-off-white mb-4">{team.name}</h2>
              <div className="space-y-2">
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

          {/* Game ID Required Section */}
          {needsGameId && (
            <div className="bg-fiery-yellow/10 border-2 border-fiery-yellow/50 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="text-2xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-fiery-yellow mb-2">Game ID Required</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    You need to set your Game ID before joining this team. This is your in-game username/ID from BGMI, Free Fire, etc.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-300">Your Game ID *</label>
                      <input
                        type="text"
                        value={gameIdValue}
                        onChange={(e) => setGameIdValue(e.target.value)}
                        placeholder="e.g., Player123, MyGameID, 1234567890"
                        className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Enter your in-game username or player ID from BGMI, Free Fire, etc. This is the name/ID you use to play the game.
                      </p>
                      <div className="mt-2 p-2 bg-lava-black/50 rounded text-xs text-gray-400">
                        <p className="font-semibold mb-1">💡 Examples:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li><strong>BGMI:</strong> Your character name (e.g., "ProGamer", "Player123")</li>
                          <li><strong>Free Fire:</strong> Your player ID or username (e.g., "FFPlayer", "1234567890")</li>
                          <li>This is the same ID you use when logging into the game</li>
                        </ul>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      onClick={handleSetGameId}
                      disabled={settingGameId || !gameIdValue.trim()}
                      className="w-full sm:w-auto"
                    >
                      {settingGameId ? 'Saving...' : 'Save Game ID & Continue'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="primary"
              onClick={handleAccept}
              className="flex-1"
              disabled={needsGameId}
            >
              {needsGameId ? 'Set Game ID First' : 'Accept Invitation'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleReject}
              className="flex-1"
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

