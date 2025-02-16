import React, { useState } from 'react';
import { Trophy, Medal, TrendingUp } from 'lucide-react';

const Rank = () => {
  const [timeframe, setTimeframe] = useState('daily');

  const timeframes = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'allTime', label: 'All Time' },
  ];

  const leaderboard = [
    { id: 1, name: 'Alex Johnson', score: 980, change: 2 },
    { id: 2, name: 'Sarah Smith', score: 945, change: -1 },
    { id: 3, name: 'Michael Brown', score: 920, change: 1 },
    { id: 4, name: 'Emily Davis', score: 890, change: 0 },
    { id: 5, name: 'David Wilson', score: 865, change: 3 },
  ];

  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return 'text-yellow-400';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-amber-600';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Leaderboard</h1>
        <div className="flex gap-2">
          {timeframes.map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`px-4 py-2 rounded-lg text-sm ${
                timeframe === tf.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-xl text-white">
          <Trophy className="w-8 h-8 mb-4" />
          <p className="text-lg font-medium mb-1">Your Rank</p>
          <p className="text-3xl font-bold">#125</p>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 rounded-xl text-white">
          <Medal className="w-8 h-8 mb-4" />
          <p className="text-lg font-medium mb-1">Your Score</p>
          <p className="text-3xl font-bold">750</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
          <TrendingUp className="w-8 h-8 mb-4" />
          <p className="text-lg font-medium mb-1">Progress</p>
          <p className="text-3xl font-bold">+15</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Performers</h2>
          <div className="space-y-4">
            {leaderboard.map((user, index) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 ${getMedalColor(index + 1)}`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-600">Score: {user.score}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 ${
                  user.change > 0 ? 'text-green-600' : user.change < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {user.change > 0 ? '↑' : user.change < 0 ? '↓' : '−'}
                  <span className="text-sm">{Math.abs(user.change)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rank;