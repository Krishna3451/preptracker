import React, { useState, useEffect } from 'react';
import { Trophy, Medal, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserRank, UserRank } from '../services/analyticsService';

const Rank = () => {
  const { user } = useAuth();
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRank = async () => {
      if (!user?.uid) return;
      try {
        const rank = await getUserRank(user.uid);
        setUserRank(rank);
      } catch (err) {
        setError('Failed to fetch rank data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRank();
  }, [user?.uid]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  if (!userRank) {
    return (
      <div className="text-center text-gray-600 p-4">
        No ranking data available. Complete some tests to see your ranking!
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Your Ranking</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-xl text-white">
          <Trophy className="w-8 h-8 mb-4" />
          <p className="text-lg font-medium mb-1">Your Rank</p>
          <p className="text-3xl font-bold">#{userRank.rank}</p>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 rounded-xl text-white">
          <Medal className="w-8 h-8 mb-4" />
          <p className="text-lg font-medium mb-1">Total Score</p>
          <p className="text-3xl font-bold">{userRank.totalScore}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
          <TrendingUp className="w-8 h-8 mb-4" />
          <p className="text-lg font-medium mb-1">Tests Completed</p>
          <p className="text-3xl font-bold">{userRank.totalTests}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Achievement Status</h2>
          {userRank.rank <= 3 ? (
            <div className="flex flex-col items-center">
              {userRank.rank === 1 && (
                <>
                  <Trophy className="w-16 h-16 text-yellow-500 mb-4" />
                  <p className="text-lg font-medium text-gray-800">Congratulations! You're the Top Performer!</p>
                </>
              )}
              {userRank.rank === 2 && (
                <>
                  <Medal className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-800">Amazing! You're in Second Place!</p>
                </>
              )}
              {userRank.rank === 3 && (
                <>
                  <Medal className="w-16 h-16 text-amber-700 mb-4" />
                  <p className="text-lg font-medium text-gray-800">Great Job! You're in Third Place!</p>
                </>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg text-gray-600">
                Keep practicing! You're {userRank.rank - 3} positions away from the top 3!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    
  );
};

export default Rank;