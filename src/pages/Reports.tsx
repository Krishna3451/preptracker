import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, Clock, Brain, Zap } from 'lucide-react';

const Reports = () => {
  const performanceData = [
    { date: 'Mon', score: 85 },
    { date: 'Tue', score: 75 },
    { date: 'Wed', score: 90 },
    { date: 'Thu', score: 82 },
    { date: 'Fri', score: 88 },
    { date: 'Sat', score: 95 },
    { date: 'Sun', score: 92 },
  ];

  const metrics = [
    { icon: Target, label: 'Average Accuracy', value: '82%' },
    { icon: Clock, label: 'Avg. Time per Question', value: '45s' },
    { icon: Brain, label: 'Topics Mastered', value: '15' },
    { icon: Zap, label: 'Current Streak', value: '7 days' },
  ];

  const recommendations = [
    {
      title: 'Focus on Algebra',
      description: 'Your performance in algebraic equations needs improvement.',
      action: 'Practice Now',
    },
    {
      title: 'Time Management',
      description: 'Try to reduce time spent on numerical problems.',
      action: 'View Tips',
    },
    {
      title: 'Review Chemistry',
      description: 'Strong performance in organic chemistry. Keep it up!',
      action: 'Continue',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Performance Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-lg">
                <metric.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{metric.label}</p>
                <p className="text-xl font-semibold text-gray-800">{metric.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Performance</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ fill: '#4f46e5' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Personalized Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((rec, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">{rec.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{rec.description}</p>
              <button className="px-4 py-2 text-sm text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50">
                {rec.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;