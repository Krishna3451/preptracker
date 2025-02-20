import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Target, Clock, Brain, Zap, BookOpen, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getSubjectAnalytics, SubjectAnalytics } from '../services/analyticsService';

const Reports = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<SubjectAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.uid) return;
      try {
        const data = await getSubjectAnalytics(user.uid);
        setAnalytics(data);
      } catch (err) {
        setError('Failed to fetch analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.uid]);

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

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold text-gray-800">Performance Analytics</h1>

      {analytics.map((subject) => (
        <div key={subject.subject} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">{subject.subject}</h2>
            <div className="text-sm text-gray-500">{subject.totalTests} Tests Completed</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Average Score</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {subject.averageScore.toFixed(1)}%
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Brain className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Best Score</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {subject.bestScore.toFixed(1)}%
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Avg. Time per Test</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {(subject.averageTimeTaken / 60).toFixed(1)} min
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Chapter Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <h4 className="font-medium text-gray-700">Needs Improvement</h4>
                  </div>
                  <ul className="space-y-2">
                    {subject.weakChapters.map((chapter, index) => (
                      <li key={index} className="text-sm text-gray-600">{chapter}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-5 h-5 text-green-500" />
                    <h4 className="font-medium text-gray-700">Strong Areas</h4>
                  </div>
                  <ul className="space-y-2">
                    {subject.strongChapters.map((chapter, index) => (
                      <li key={index} className="text-sm text-gray-600">{chapter}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {analytics.length === 0 && (
        <div className="text-center text-gray-600 p-8 bg-white rounded-xl shadow-sm">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg">No test data available yet.</p>
          <p className="text-sm mt-2">Complete some tests to see your analytics!</p>
        </div>
      )}
    </div>
  );
};

export default Reports;