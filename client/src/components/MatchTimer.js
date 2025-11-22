import React, { useState, useEffect } from 'react';

const MatchTimer = ({ matchDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    if (!matchDate) return;

    const targetDate = new Date(matchDate).getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [matchDate]);

  if (!matchDate) return null;

  return (
    <div className="text-center py-4">
      <div className="flex justify-center gap-4">
        {Object.entries(timeLeft).map(([key, value]) => (
          <div key={key} className="bg-lava-black border border-lava-orange/30 rounded-lg p-3 min-w-[70px]">
            <div className="text-2xl font-bold text-lava-orange">{String(value).padStart(2, '0')}</div>
            <div className="text-xs text-gray-400 uppercase">{key}</div>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-400 mt-2">
        Next Match: {new Date(matchDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </div>
  );
};

export default MatchTimer;
