import React, { useState, useEffect } from 'react';
import TaskCalendar, { Task } from '../components/TaskCalendar';
import ExamCountdown from '../components/ExamCountdown';
import FlashCards from '../components/FlashCards';
import Modal from '../components/Modal';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await logout();
    navigate('/');
  };
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [tasks, setTasks] = useState<Task[]>([]);

  const getCurrentDayTasks = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return tasks.filter(task => task.date === today);
  };

  const currentDayTasks = getCurrentDayTasks();

  return (
    <div className="space-y-6">
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out? You will need to sign in again to access your dashboard."
      />
      <div className="flex justify-between items-start gap-8">
        <div className="space-y-6 flex-1">
          <h1 className="text-2xl font-bold text-gray-800">Hello Dr {user?.displayName?.split(' ')[0]}!</h1>
          <ExamCountdown />
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Study Flashcards</h2>
            <FlashCards />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm overflow-hidden w-[350px] shrink-0">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Task Organizer</h2>
          <TaskCalendar 
            onDateSelect={setSelectedDate}
            onTasksChange={setTasks}
          />
          
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Today's Tasks ({format(new Date(), 'MMMM d, yyyy')})
            </h3>
            {currentDayTasks.length > 0 ? (
              <div className="space-y-3">
                {currentDayTasks.map(task => (
                  <div key={task.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <h4 className="font-medium text-gray-800 text-sm">{task.title}</h4>
                    {task.description && (
                      <p className="mt-1 text-xs text-gray-600">{task.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No tasks scheduled for today.</p>
            )}
          </div>
        </div>
      </div>
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="fixed bottom-8 left-8 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors"
      >
        <LogOut className="h-5 w-5" />
        Logout
      </button>
    </div>
  );
};

export default Dashboard;