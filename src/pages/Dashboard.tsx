import React, { useState, useEffect } from 'react';
import TaskCalendar, { Task } from '../components/TaskCalendar';
import ExamCountdown from '../components/ExamCountdown';
import FlashCards from '../components/FlashCards';
import Modal from '../components/Modal';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, BarChart2, X } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  // Handle window resize to show/hide calendar based on screen width
  useEffect(() => {
    const handleResize = () => {
      setShowCalendar(window.innerWidth >= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCalendar, setShowCalendar] = useState<boolean>(window.innerWidth >= 768);

  const getCurrentDayTasks = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return tasks.filter(task => task.date === today);
  };

  const currentDayTasks = getCurrentDayTasks();

  return (
    <div className="space-y-6">

      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div className="space-y-6 flex-1 w-full">
          <h1 className="text-2xl font-bold text-gray-800 pl-10 md:pl-0">Hello Dr {user?.displayName?.split(' ')[0]}!</h1>
          <ExamCountdown />
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Study Flashcards</h2>
            <FlashCards />
          </div>
        </div>
        <div className="md:block">
          {/* Calendar toggle for mobile */}
          <div className="flex items-center justify-between mb-4 md:hidden">
            <h2 className="text-sm font-semibold text-gray-800">Task Organizer</h2>
            <button 
              onClick={() => setShowCalendar(!showCalendar)} 
              className="p-2 bg-indigo-100 rounded-full text-indigo-600"
            >
              {showCalendar ? <X className="w-5 h-5" /> : <BarChart2 className="w-5 h-5" />}
            </button>
          </div>
          <div className={`bg-white p-4 rounded-xl shadow-sm overflow-hidden w-full lg:w-[350px] lg:shrink-0 ${!showCalendar && 'hidden md:block'}`}>
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
                                { id: '8GPJNawvt6J5EEiXRA0G', name: 'Electrostatic' },
                                { id: 'O7WgeGZ0n1zbxK7DvfFb', name: 'Capacitance' },
                                { id: '9NksgfWD616fnwuZtWd4', name: 'Current Electricity' },
                                { id: 'u5ae2A7AXoaGOkrehirY', name: 'Moving Charges & Magnetism' },
                                { id: 'v6jSjiUaiqU8rp8qWq4f', name: 'Magnetism & Matter' },
                                { id: 'poyyLhw7WnxziuwE72rA', name: 'EMI' },
                                { id: 'psyWtKDbnjXZDpckZkdB', name: 'Alternating Current' },
                                { id: 'aQjZB2HZQ8adp0OL8aDT', name: 'Electromagnetic Waves' },
                                { id: 'H86iz5LOXXAo0BLbEZMX', name: 'Ray optics' },
                                { id: 'XqPgHgya2AASoEY8IU2T', name: 'Wave Optics' },
                                { id: '3DK05k4JZMvQcXXvXN7R', name: 'Dual Nature of Radiation and Matter' },
                                { id: 'GFgznll08oV62N55b8KQ', name: 'Atoms' },
                                { id: 'Tw7vLs2sI9raIZsarADj', name: 'Nuclei' },
                                { id: 'OQt6gFATlMIP4F7xq5EI', name: 'Semiconductor' },
                              ],
                              Chemistry: [
                                { id: 'xp236Zm1X8uC6WXrMWJW', name: 'Some Basic Concept of Chemistry' },
                                { id: 'd0rjAMP9aiL3eMtxvQzQ', name: 'Structure of Atom' },
                                { id: '3FKKTzEf5lYYRGGYEKoi', name: 'Classification of Elements & Periodicity' },
                                { id: 'bqGcfblgDyQs8oscZO7g', name: 'Chemical Bonding' },
                                { id: 'F5AMt08I1dWxE92TqnXG', name: 'Thermodynamics' },
                                { id: 'VC0b3PGLapQc6QZ8qMo0', name: 'Chemical Equilibrium' },
                                { id: 'CooCc5yQerI0KJOK7DX5', name: 'Ionic Equilibrium' },
                                { id: '3cJOSV0IYMWFkBLQTihq', name: 'Redox Reactions' },
                                { id: 'dCo74VhvuxhqXj7ayziF', name: 'p-Block Elements (Group 13 & 14)' },
                                { id: 'MRH5jPRVrNXEy5FWkkaj', name: 'Organic Chemistry: Some Basic Principles & Techniques' },
                                { id: 'vSbMVoLsvnUiuUNxTHaR', name: 'Hydrocarbons' },
                                { id: 'envWb3qkC4ZSFHF8x5YN', name: 'Solutions' },
                                { id: 'si8YKtWiT0Nq4780HQ1N', name: 'Electrochemistry' },
                                { id: 'wORHNOk9YwmcLxEwMJIh', name: 'Chemical Kinetics' },
                                { id: 'BAOozKNPPKT8v5dLhQma', name: 'p-Block Elements (Group 15,16,17,18)' },
                                { id: 'F47iI14w5fJ8UVL7QKMq', name: 'd & f-Block Elements' },
                                { id: 'bgsgtrD9C3YuMrElRAaP', name: 'Coordination Compounds' },
                                { id: 'jPKiMSmjeEBEqfJHHuaY', name: 'Haloalkanes & Haloarenes' },
                                { id: 'Jq8IHcWNp20VpqqQ8MGX', name: 'Alcohol, Phenol and Ether' },
                                { id: 'cjB9VYoFMuM7GOMDNgIw', name: 'Aldehyde and Ketone' },
                                { id: 'RIpPEjHn3ya3XwhtRGpn', name: 'Carboxylic Acid' },
                                { id: 'sUVlUbJq5FF2c7u78K3Z', name: 'Amines' },
                                { id: '6E42pG1feBYmk8936TDC', name: 'Biomolecules' },
                                { id: 'NoknBR1tsG2t2stGYakP', name: 'Practical Chemistry' },
                              ],
                              Biology: [
                                { id: '2taW41LFt0iepzmSW5dp', name: 'Living World' },
                                { id: 'RInpuxI8yZlg8g2CQH9X', name: 'Biological Classification' },
                                { id: 'xGxozQxQlknr79HVMpGq', name: 'Plant Kingdom' },
                                { id: 'HLdG8QOaLN6jRK0kOXmt', name: 'Animal Kingdom' },
                                { id: '18RcKG0WUOpF55rOyfn7', name: 'Morphology of Flowering Plants' },
                                { id: 'hmn6nkqRgOWMFxuMA0fS', name: 'Anatomy of Flowering Plants' },
                                { id: 'xsEE3r0oTvTZzfNvxnsV', name: 'Structural Organisation in Animals' },
                                { id: 'on82g6JZA6gQfYogXIXR', name: 'Cell-The Unit of Life' },
                                { id: '6E42pG1feBYmk8936TDC', name: 'Biomolecules' },
                                { id: 'fkEmKXIOCRDB89PvzopA', name: 'Cell Cycle and Cell Division' },
                                { id: 'sEN9klIaHwBbFxQ1odjs', name: 'Photosynthesis in Higher Plants' },
                                { id: 'JwLTiaSSAE9WthRWu0vc', name: 'Respiration in Plants' },
                                { id: 'UCHVQ7o08VB9vhDaoQhI', name: 'Plant Growth and Development' },
                                { id: '41GVciLXfTb8tKfsYxXh', name: 'Breathing and Exchange of Gases' },
                                { id: 'mdec58C1K9X2nKjsnodN', name: 'Body Fluids and Circulation' },
                                { id: 'mJQyqnE8btj9OrHh9wyb', name: 'Excretory Products & their elimination' },
                                { id: 'fShWgidyOZXvUENEMb7U', name: 'Locomotion and movements' },
                                { id: 'dlFtAub7vsdivPTaUEZj', name: 'Neural Control and Coordination' },
                                { id: 'xOzlIjIojGfglNXnLfBE', name: 'Chemical Coordination and Integration' },
                                { id: 'EFUPD6oXL5mE4tDhGZ2J', name: 'Sexual Reproduction in Flowering Plants' },
                                { id: 'UAbIQlLL9LKKx5xUnSxF', name: 'Human Reproduction' },
                                { id: '8esVgAR8o4Tf6421LStz', name: 'Reproductive Health' },
                                { id: 'bmcMW1ZMZ3iC6YU2amuF', name: 'Principles of Inheritance and Variation' },
                                { id: 'yA68zTMIXPhRxJXMOC6J', name: 'Molecular Basis of Inheritance' },
                                { id: 'cpAtTxCze7elufykaYvT', name: 'Evolution' },
                                { id: 'I7cWp8TOqh3e2TZVWKuS', name: 'Human Health & Diseases' },
                                { id: '58TFiidI5Ebor6rRpg0B', name: 'Microbes in human Welfare' },
                                { id: '3EKGIuOyZTntGvGqqbL8', name: 'Biotechnology-Principles and Processes' },
                                { id: 'K83Fd7MZKbEWL1rOfTBG', name: 'Biotechnology and Its Application' },
                                { id: '4J5ttWw9nBmts4KINYME', name: 'Organism and Populations' },
                                { id: 'H1ILjQHLuhzqDGd5ExVr', name: 'Ecosystem' },
                                { id: '9ha53VSAXmKiG9pttUyx', name: 'Biodiversity and Conservation' },
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
      </div>

    </div>
  );
};

export default Dashboard;