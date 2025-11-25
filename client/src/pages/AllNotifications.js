import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Button from '../components/Button';

const AllNotifications = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/register');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      setLoading(true);
      setError('');

      try {
        // Fetch notifications from backend
        const notificationsResponse = await api.get('/notifications/my-notifications');
        const notifs = notificationsResponse.data.map(notif => ({
          id: notif._id,
          type: notif.type || 'info',
          title: notif.title,
          message: notif.message,
          time: new Date(notif.createdAt),
          notification: notif
        }));

        // Fetch additional data for system notifications
        try {
          const [tournamentsResponse, teamsResponse] = await Promise.all([
            api.get('/tournaments').catch(() => ({ data: [] })),
            api.get('/teams/my-teams').catch(() => ({ data: [] }))
          ]);

          const allTournaments = tournamentsResponse.data || [];
          const myTeams = teamsResponse.data || [];

          // Add system notifications
          const allUpcoming = allTournaments.filter(t => 
            t.status === 'upcoming' || t.status === 'ongoing'
          );

          if (allUpcoming.length > 0) {
            notifs.push({
              id: 'system-upcoming',
              type: 'tournament',
              title: 'Upcoming Tournaments',
              message: `You have ${allUpcoming.length} upcoming tournament${
                allUpcoming.length > 1 ? 's' : ''
              }`,
              time: new Date(),
            });
          }

          const activeTeams = myTeams.filter(team => team.status === 'active' && !team.isTerminated);
          if (activeTeams.length === 0) {
            notifs.push({
              id: 'system-team',
              type: 'team',
              title: 'Create Team',
              message: 'Create a team to participate in tournaments',
              time: new Date(),
            });
          }
        } catch (err) {
          console.error('Error fetching additional data:', err);
        }

        // Sort by most recent first
        notifs.sort((a, b) => new Date(b.time) - new Date(a.time));

        setNotifications(notifs);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'announcement':
        return '📢';
      case 'tournament':
        return '🏆';
      case 'team':
        return '👥';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-500/30 bg-green-500/10';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'announcement':
        return 'border-lava-orange/30 bg-lava-orange/10';
      case 'tournament':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'team':
        return 'border-purple-500/30 bg-purple-500/10';
      default:
        return 'border-lava-orange/20 bg-lava-black';
    }
  };

  const getNotificationTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'announcement':
        return 'text-lava-orange';
      case 'tournament':
        return 'text-blue-400';
      case 'team':
        return 'text-purple-400';
      default:
        return 'text-off-white';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lava-black">
        <div className="text-lava-orange text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 neon-text-cyan">
              All Notifications
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              View all your notifications in one place
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-4 sm:p-6">
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`border rounded-lg p-4 transition-all hover:border-opacity-60 ${getNotificationColor(notif.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {notif.title && (
                        <h3 className={`font-bold text-lg mb-1 ${getNotificationTextColor(notif.type)}`}>
                          {notif.title}
                        </h3>
                      )}
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {notif.time.toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-400 text-lg mb-2">No notifications yet</p>
              <p className="text-gray-500 text-sm">
                You'll see notifications here when there are updates about your teams, tournaments, and more.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllNotifications;

