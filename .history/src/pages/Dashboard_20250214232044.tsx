import React from 'react';
import TaskCalendar from '../components/TaskCalendar';

const Dashboard = () => {
  

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Hello Dr!</h1>
        <div className="bg-white p-4 rounded-xl shadow-sm overflow-hidden w-[350px]">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Task Calendar</h2>
          <TaskCalendar />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Add other dashboard content here */}
      </div>
    </div>
  );
};

export default Dashboard;