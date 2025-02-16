import React from 'react';
import TaskCalendar from '../components/TaskCalendar';
import { Clock, Book, Award, Calendar } from 'lucide-react';

const Dashboard = () => {
  

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Hello Dr!</h1>
      
      
      

      <div className="bg-white p-6 rounded-xl shadow-sm overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Task Calendar</h2>
          <TaskCalendar />
        </div>
    </div>
  );
};

export default Dashboard;