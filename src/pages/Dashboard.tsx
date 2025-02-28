import React, { useState, useEffect } from 'react';
import TaskCalendar, { Task } from '../components/TaskCalendar';
import ExamCountdown from '../components/ExamCountdown';
import FlashCards from '../components/FlashCards';
import Modal from '../components/Modal';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen } from 'lucide-react';

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
                    
                    {task.chapters && task.chapters.length > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center gap-1 text-xs text-indigo-600 mb-1">
                          <BookOpen size={14} />
                          <span>Study Chapters:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {task.chapters.map(chapterId => {
                            // Find chapter name from all subjects
                            let chapterName = '';
                            let subjectName = '';
                            
                            // This is the same chapters data structure from TaskCalendar
                            const chapters = {
                              Physics: [
                                { id: 'UR7lQgTXa6O1Ja2MjELt', name: 'Basic Mathematics' },
                                { id: 'WVYjeVoGqiyUQZowKvOF', name: 'Units and Measurements' },
                                { id: 'vLjjoDj6mQrfB47Uj4jT', name: 'Motion in a Straight Line' },
                                { id: 'tlH4MPbfXhb8HFlVgIX7', name: 'Motion in a Plane' },
                                { id: 'EDpMxMIBpTqjNJKWlnZo', name: 'Laws of Motion' },
                                { id: 'ydpsND9XYU5Ctz1Jr0ir', name: 'Work, Energy and Power' },
                                { id: 'I9Ex2UHsP10IL9VMr0fl', name: 'System of Particles' },
                                { id: 'AbEltnwRUfIHpZ7RYLXE', name: 'Rotation Motion' },
                                { id: 'rBYUWaquerpt6DCEt8Ma', name: 'Gravitation' },
                                { id: 'NbY1nCIK4CbZN3si4FLH', name: 'Mechanical Properties of Solid' },
                                { id: '8COC00fa3TkHFvQfiyEk', name: 'Mechanical Properties of Fluids' },
                                { id: '83niumaqol0DnrgYJ1Rj', name: 'Thermal Properties of Matter' },
                                { id: 'F5AMt08I1dWxE92TqnXG', name: 'Thermodynamics' },
                                { id: 'K6eONmqzwLsFYLDI3vpa', name: 'Kinetic Theory of Gases' },
                                { id: 'OAzwKrBtk6iZvJsaTQIs', name: 'Oscillations' },
                                { id: '90OZl6yE6IYauh1LsdqS', name: 'Waves' },
                              ],
                              Chemistry: [
                                { id: 'lLnbMZrHIvYGcmRvKEZs', name: 'Basic Concepts' },
                                { id: 'u5ae2A7AXoaGOkrehirY', name: 'Structure of Atom' },
                                { id: 'lPbwLXxiJXvnZ9Lm8Jnl', name: 'Classification of Elements' },
                                { id: 'Ik3aBTXYWvZvGWCxJWDr', name: 'Chemical Bonding' },
                                { id: 'vKXYkDyIQPSrNsXQCxTF', name: 'States of Matter' },
                                { id: 'mRDHMRfvhQwCpAQNZYXB', name: 'Thermodynamics' },
                                { id: 'FGmXNEZfJYuqBLxdPDnV', name: 'Equilibrium' },
                                { id: 'nJfVRKLIZYQwHcXpTDmS', name: 'Redox Reactions' },
                                { id: 'yTVzLQKXJYuqBLxdPDnV', name: 'Hydrogen' },
                                { id: 'pQrStUvWxYzAbCdEfGhI', name: 's-Block Elements' },
                                { id: 'jKlMnOpQrStUvWxYzAbC', name: 'p-Block Elements' },
                                { id: 'dEfGhIjKlMnOpQrStUvW', name: 'Organic Chemistry' },
                                { id: 'xYzAbCdEfGhIjKlMnOpQ', name: 'Hydrocarbons' },
                              ],
                              Biology: [
                                { id: 'rStUvWxYzAbCdEfGhIjK', name: 'Cell Structure and Function' },
                                { id: 'lMnOpQrStUvWxYzAbCdE', name: 'Plant Physiology' },
                                { id: 'fGhIjKlMnOpQrStUvWxY', name: 'Human Physiology' },
                                { id: 'zAbCdEfGhIjKlMnOpQrS', name: 'Reproduction' },
                                { id: 'tUvWxYzAbCdEfGhIjKlM', name: 'Genetics and Evolution' },
                                { id: 'nOpQrStUvWxYzAbCdEfG', name: 'Biology in Human Welfare' },
                                { id: 'hIjKlMnOpQrStUvWxYzA', name: 'Biotechnology' },
                                { id: 'bCdEfGhIjKlMnOpQrStU', name: 'Ecology' },
                              ]
                            };
                            
                            // Find chapter and subject
                            Object.entries(chapters).forEach(([subject, chapterList]) => {
                              const chapter = chapterList.find(c => c.id === chapterId);
                              if (chapter) {
                                chapterName = chapter.name;
                                subjectName = subject;
                              }
                            });
                            
                            return (
                              <span 
                                key={chapterId} 
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  subjectName === 'Physics' ? 'bg-blue-100 text-blue-800' :
                                  subjectName === 'Chemistry' ? 'bg-green-100 text-green-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {chapterName}
                              </span>
                            );
                          })}
                        </div>
                      </div>
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