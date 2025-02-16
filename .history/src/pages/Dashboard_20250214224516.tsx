import React from 'react';
import TaskCalendar from '../components/TaskCalendar';
import { Clock, Book, Award, Calendar } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { icon: Clock, label: 'Study Time', value: '12.5 hrs' },
    { icon: Book, label: 'Topics Completed', value: '24/50' },
    { icon: Award, label: 'Current Rank', value: '#125' },
  ];

  const upcomingTests = [
    { id: 1, title: 'Mathematics Mock Test', date: '2024-03-25', time: '10:00 AM' },
    { id: 2, title: 'Science Quiz', date: '2024-03-27', time: '2:30 PM' },
  ];

  const recommendedTopics = [
    { id: 1, title: 'Algebra Fundamentals', progress: 65 },
    { id: 2, title: 'Chemical Reactions', progress: 40 },
    { id: 3, title: 'World History', progress: 25 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Hello Dr!</h1>
      
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-lg">
                <stat.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-xl font-semibold text-gray-800">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div> */}

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Upcoming Tests</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {upcomingTests.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-800">{test.title}</h3>
                  <p className="text-sm text-gray-600">{test.date} at {test.time}</p>
                </div>
                <button className="px-4 py-2 text-sm text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50">
                  Prepare
                </button>
              </div>
            ))}
          </div>
        </div> */}

        <div className="bg-white p-6 rounded-xl shadow-sm overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Task Calendar</h2>
          <TaskCalendar />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;