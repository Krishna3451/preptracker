import React, { useState, useEffect } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';

const ExamCountdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // NEET 2025 exam date (first Sunday of May 2025)
    const examDate = new Date('2025-05-04T00:00:00+05:30');

    const calculateTimeLeft = () => {
      const now = new Date();
      
      if (now >= examDate) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        };
      }

      const days = differenceInDays(examDate, now);
      const hours = differenceInHours(examDate, now) % 24;
      const minutes = differenceInMinutes(examDate, now) % 60;
      const seconds = differenceInSeconds(examDate, now) % 60;

      return {
        days,
        hours,
        minutes,
        seconds
      };
    };

    // Update countdown every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, []);

  const padNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="bg-gradient-to-br from-violet-600 to-violet-500 p-6 rounded-2xl text-white relative">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="text-yellow-300">🏆</span>
          <h3 className="text-lg font-semibold">NEET 2025 Countdown</h3>
        </div>
        <span className="text-yellow-300">⭐</span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 relative">
          <div className="text-3xl font-bold text-center">{padNumber(timeLeft.days)}</div>
          <div className="text-sm text-center mt-1 text-white/90">Days</div>
          <span className="absolute top-2 right-2 text-white/40">⭐</span>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 relative">
          <div className="text-3xl font-bold text-center">{padNumber(timeLeft.hours)}</div>
          <div className="text-sm text-center mt-1 text-white/90">Hours</div>
          <span className="absolute top-2 right-2 text-white/40">⏰</span>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 relative">
          <div className="text-3xl font-bold text-center">{padNumber(timeLeft.minutes)}</div>
          <div className="text-sm text-center mt-1 text-white/90">Minutes</div>
          <span className="absolute top-2 right-2 text-white/40">⌛</span>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 relative">
          <div className="text-3xl font-bold text-center">{padNumber(timeLeft.seconds)}</div>
          <div className="text-sm text-center mt-1 text-white/90">Seconds</div>
          <span className="absolute top-2 right-2 text-white/40">⭐</span>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-white/90 bg-white/20 backdrop-blur-sm py-3 px-6 rounded-full inline-flex items-center gap-2">
          <span>⏰</span>
          Every second counts! Keep pushing forward.
        </p>
      </div>
    </div>
  );
};

export default ExamCountdown;
