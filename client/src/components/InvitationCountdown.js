import React, { useState, useEffect } from 'react';

const InvitationCountdown = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        return 'Expired';
      }

      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      } else {
        return `${seconds}s`;
      }
    };

    // Update immediately
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const interval = setInterval(() => {
      const time = calculateTimeLeft();
      setTimeLeft(time);
      if (time === 'Expired') {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const isExpired = timeLeft === 'Expired';
  const isUrgent = new Date(expiresAt).getTime() - new Date().getTime() < 30 * 60 * 1000; // Less than 30 minutes

  return (
    <div className={`text-xs sm:text-sm ${isExpired ? 'text-red-400' : isUrgent ? 'text-fiery-yellow' : 'text-gray-400'}`}>
      {isExpired ? (
        <span className="font-semibold">⏰ Expired</span>
      ) : (
        <span>
          ⏰ Expires in: <span className={`font-semibold ${isUrgent ? 'text-fiery-yellow' : 'text-lava-orange'}`}>{timeLeft}</span>
        </span>
      )}
    </div>
  );
};

export default InvitationCountdown;

