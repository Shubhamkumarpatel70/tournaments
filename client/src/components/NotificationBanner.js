import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const NotificationBanner = () => {
  const [notifications, setNotifications] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications/active');
        // Filter for home notifications (animated) or regular home notifications
        const homeNotifs = response.data.filter(n => n.isHomeNotification || n.showOnHome);
        setNotifications(homeNotifs);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (notifications.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % notifications.length);
      }, 5000); // Change notification every 5 seconds

      return () => clearInterval(interval);
    }
  }, [notifications.length]);

  if (notifications.length === 0) return null;

  const currentNotification = notifications[currentIndex];
  const bgColor = {
    info: 'bg-blue-500/20 border-blue-500',
    warning: 'bg-yellow-500/20 border-yellow-500',
    success: 'bg-green-500/20 border-green-500',
    announcement: 'bg-lava-orange/20 border-lava-orange'
  }[currentNotification.type] || 'bg-lava-orange/20 border-lava-orange';

  const textColor = {
    info: 'text-blue-400',
    warning: 'text-yellow-400',
    success: 'text-green-400',
    announcement: 'text-lava-orange'
  }[currentNotification.type] || 'text-lava-orange';

  // Check if this is a home notification (should animate)
  const isAnimated = currentNotification?.isHomeNotification;

  return (
    <div className={`${bgColor} border-b px-4 py-3 overflow-hidden`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 overflow-hidden relative">
          <span className="text-xl flex-shrink-0">📢</span>
          {isAnimated ? (
            <div className="flex-1 overflow-hidden">
              <div className="animate-scroll-text whitespace-nowrap">
                <span className={`font-bold ${textColor}`}>{currentNotification.title}: </span>
                <span className="text-sm text-off-white/80">{currentNotification.message}</span>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <h3 className={`font-bold ${textColor}`}>{currentNotification.title}</h3>
              <p className="text-sm text-off-white/80">{currentNotification.message}</p>
            </div>
          )}
        </div>
        {notifications.length > 1 && (
          <div className="flex gap-1">
            {notifications.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-lava-orange' : 'bg-gray-500'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationBanner;
