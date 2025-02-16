import React from 'react';
import TaskCalendar from '../components/TaskCalendar';
import { Clock, Book, Award, Calendar } from 'lucide-react';

const Dashboard = () => {
  

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

      

      <div className="bg-white p-6 rounded-xl shadow-sm overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Task Calendar</h2>
          <TaskCalendar />
        </div>
    </div>
  );
};

export default Dashboard;