import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Target, Clock, Brain, Zap, BookOpen, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getSubjectAnalytics, SubjectAnalytics, TestResult } from '../services/analyticsService';
import { getUserTestResults } from '../services/testService';
import TestReport from '../components/TestReport';

const Reports = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) {
        setError('User authentication required');
        setLoading(false);
        return;
      }

      try {
        const testsData = await getUserTestResults(user.uid);
        
        if (!Array.isArray(testsData)) {
          throw new Error('Invalid data format received from server');
        }

        // Validate test data
        const validTests = testsData.filter(test => {
          if (!test.timestamp || !test.score || !test.totalQuestions) {
            console.error('Invalid test data structure:', test.id);
            return false;
          }
          return true;
        });

        if (validTests.length === 0) {
          setTestResults([]);
          setLoading(false);
          return;
        }

        // Sort by timestamp for proper timeline display
        const sortedData = validTests.sort((a, b) => {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          
          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
            console.error('Invalid timestamp found in test data');
            return 0;
          }
          
          return dateB.getTime() - dateA.getTime(); // Most recent first
        });

        setTestResults(sortedData);
      } catch (err) {
        console.error('Error fetching test results:', err);
        setError(
          err instanceof Error
            ? `Error: ${err.message}`
            : 'Failed to fetch test data accurately'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  // Utility function for precise calculations
  const roundToTwoDecimals = (num: number): number => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  };

  const validateTestData = (test: TestResult): boolean => {
    if (!test || typeof test !== 'object') return false;
    if (typeof test.score !== 'number' || test.score < 0 || test.score > 100) return false;
    if (typeof test.timeTaken !== 'number' || test.timeTaken < 0) return false;
    if (typeof test.correctAnswers !== 'number' || test.correctAnswers < 0) return false;
    if (typeof test.totalQuestions !== 'number' || test.totalQuestions <= 0) return false;
    if (test.correctAnswers > test.totalQuestions) return false;
    return true;
  };

  // Calculate overall statistics with validation
  const overallStats = testResults.reduce((stats, test) => {
    if (!validateTestData(test)) {
      console.error('Invalid test data found:', test.id);
      return stats;
    }

    return {
      totalScore: roundToTwoDecimals(stats.totalScore + test.score),
      totalTime: roundToTwoDecimals(stats.totalTime + test.timeTaken),
      totalCorrect: stats.totalCorrect + test.correctAnswers,
      totalQuestions: stats.totalQuestions + test.totalQuestions,
      bestScore: roundToTwoDecimals(Math.max(stats.bestScore, test.score)),
      validTests: stats.validTests + 1
    };
  }, {
    totalScore: 0,
    totalTime: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    bestScore: 0,
    validTests: 0
  });

  const averageScore = overallStats.validTests > 0 ? 
    roundToTwoDecimals(overallStats.totalScore / overallStats.validTests) : 0;
  const averageTime = overallStats.validTests > 0 ? 
    roundToTwoDecimals(overallStats.totalTime / overallStats.validTests) : 0;
  const accuracy = overallStats.totalQuestions > 0 ? 
    roundToTwoDecimals((overallStats.totalCorrect / overallStats.totalQuestions) * 100) : 0;

  // Verify data consistency
  if (overallStats.validTests !== testResults.filter(validateTestData).length) {
    console.error('Data consistency error: number of valid tests mismatch');
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Performance Analytics</h1>
        <div className="text-sm text-gray-500">{testResults.length} Tests Completed</div>
      </div>

      {/* Overall Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Overall Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              key: 'average-score',
              bgColorClass: 'bg-blue-50',
              textColorClass: 'text-blue-600',
              icon: <Target className="w-5 h-5 text-blue-600" />,
              label: 'Average Score',
              value: `${averageScore.toFixed(1)}%`
            },
            {
              key: 'best-score',
              bgColorClass: 'bg-green-50',
              textColorClass: 'text-green-600',
              icon: <Brain className="w-5 h-5 text-green-600" />,
              label: 'Best Score',
              value: `${overallStats.bestScore.toFixed(1)}%`
            },
            {
              key: 'accuracy',
              bgColorClass: 'bg-yellow-50',
              textColorClass: 'text-yellow-600',
              icon: <Zap className="w-5 h-5 text-yellow-600" />,
              label: 'Overall Accuracy',
              value: `${accuracy.toFixed(1)}%`
            },
            {
              key: 'avg-time',
              bgColorClass: 'bg-purple-50',
              textColorClass: 'text-purple-600',
              icon: <Clock className="w-5 h-5 text-purple-600" />,
              label: 'Avg. Time per Test',
              value: `${(averageTime / 60).toFixed(1)} min`
            }
          ].map(stat => (
            <div key={stat.key} className={`${stat.bgColorClass} p-4 rounded-lg`}>
              <div className="flex items-center gap-3 mb-2">
                {stat.icon}
                <span className="text-sm font-medium text-gray-700">{stat.label}</span>
              </div>
              <div className={`text-2xl font-bold ${stat.textColorClass}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Performance Over Time Graph */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={testResults}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                labelFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
                formatter={(value) => [`${Number(value).toFixed(1)}%`]}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={true}
                name="Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Tests Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Tests</h2>
        <div className="space-y-4">
          {testResults.map((test) => (
            <div key={test.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{test.testName}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(test.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{test.score.toFixed(1)}%</div>
                    <div className="text-sm text-gray-500">
                      {test.correctAnswers}/{test.totalQuestions} correct
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTest(selectedTest === test.id ? null : test.id)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    {selectedTest === test.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              {selectedTest === test.id && (
                <div className="mt-4">
                  <TestReport {...test} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {testResults.length === 0 && (
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