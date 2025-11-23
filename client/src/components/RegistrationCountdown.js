import React, { useState, useEffect } from 'react';

const RegistrationCountdown = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!deadline) {
      setIsExpired(true);
      return;
    }

    const targetDate = new Date(deadline).getTime();
    
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
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      }
    }, 1000);

    // Initial calculation
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
      setIsExpired(true);
    }

    return () => clearInterval(timer);
  }, [deadline]);

  if (isExpired || !deadline) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-3 py-2 mb-3">
        <p className="text-red-400 text-xs sm:text-sm font-bold text-center">Registration Closed</p>
      </div>
    );
  }

  return (
    <div className="bg-lava-orange/20 border border-lava-orange/50 rounded-lg px-2 sm:px-3 py-2 mb-3">
      <p className="text-xs text-gray-300 text-center mb-1.5">Registration Ends In</p>
      <div className="flex justify-center gap-1.5 sm:gap-2">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center min-w-[35px] sm:min-w-[40px]">
            <div className="bg-lava-black/80 border border-lava-orange/50 rounded px-1.5 sm:px-2 py-1 text-lava-orange font-bold text-xs sm:text-sm">
              {String(timeLeft.days).padStart(2, '0')}
            </div>
            <span className="text-[8px] sm:text-[10px] text-gray-400 mt-0.5">Days</span>
          </div>
        )}
        <div className="flex flex-col items-center min-w-[35px] sm:min-w-[40px]">
          <div className="bg-lava-black/80 border border-lava-orange/50 rounded px-1.5 sm:px-2 py-1 text-lava-orange font-bold text-xs sm:text-sm">
            {String(timeLeft.hours).padStart(2, '0')}
          </div>
          <span className="text-[8px] sm:text-[10px] text-gray-400 mt-0.5">Hours</span>
        </div>
        <div className="flex flex-col items-center min-w-[35px] sm:min-w-[40px]">
          <div className="bg-lava-black/80 border border-lava-orange/50 rounded px-1.5 sm:px-2 py-1 text-lava-orange font-bold text-xs sm:text-sm">
            {String(timeLeft.minutes).padStart(2, '0')}
          </div>
          <span className="text-[8px] sm:text-[10px] text-gray-400 mt-0.5">Mins</span>
        </div>
        <div className="flex flex-col items-center min-w-[35px] sm:min-w-[40px]">
          <div className="bg-lava-black/80 border border-lava-orange/50 rounded px-1.5 sm:px-2 py-1 text-lava-orange font-bold text-xs sm:text-sm">
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <span className="text-[8px] sm:text-[10px] text-gray-400 mt-0.5">Secs</span>
        </div>
      </div>
    </div>
  );
};

export default RegistrationCountdown;

