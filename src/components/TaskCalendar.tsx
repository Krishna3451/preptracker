import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg } from '@fullcalendar/core';
import { format } from 'date-fns';
import { Plus, X, Edit2, Trash2, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addTask, getUserTasks, updateTask, deleteTask } from '../services/taskService';
import ChapterSelector from './ChapterSelector';

export interface Task {
  id: string;
  title: string;
  date: string;
  description?: string;
  chapters?: string[];
}

interface TaskCalendarProps {
  onDateSelect?: (date: string) => void;
  onTasksChange?: (tasks: Task[]) => void;
}

interface Chapter {
  id: string;
  name: string;
}

const chapters: { [subject: string]: Chapter[] } = {
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

const TaskCalendar: React.FC<TaskCalendarProps> = ({ onDateSelect, onTasksChange }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [showChapterSelector, setShowChapterSelector] = useState(false);

  // Fetch tasks from Firebase when component mounts
  useEffect(() => {
    const fetchTasks = async () => {
      if (user?.uid) {
        try {
          const userTasks = await getUserTasks(user.uid);
          setTasks(userTasks);
          onTasksChange?.(userTasks);
        } catch (error) {
          console.error('Error fetching tasks:', error);
        }
      }
    };
    fetchTasks();
  }, [user?.uid, onTasksChange]);

  const handleDateClick = (arg: { date: Date }) => {
    const formattedDate = format(arg.date, 'yyyy-MM-dd');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (arg.date < today) {
      return; // Silently ignore clicks on past dates
    }

    setCurrentTask({
      date: formattedDate,
      chapters: [],
    });
    onDateSelect?.(formattedDate);
    setIsEditing(false);
    setShowChapterSelector(false);
    setIsModalOpen(true);
  };

  const handleEventClick = (arg: EventClickArg) => {
    const task = tasks.find(t => t.id === arg.event.id);
    if (task) {
      setCurrentTask({
        ...task,
        chapters: task.chapters || []
      });
      setIsEditing(true);
      setShowChapterSelector(false);
      setIsModalOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask.title || !currentTask.date || !user?.uid) return;

    try {
      let updatedTasksList;
      if (isEditing && currentTask.id) {
        const updatedTask = await updateTask(currentTask.id, currentTask);
        updatedTasksList = tasks.map(task =>
          task.id === currentTask.id ? updatedTask : task
        );
      } else {
        const newTask = await addTask(user.uid, {
          title: currentTask.title,
          date: currentTask.date,
          description: currentTask.description || '',
          chapters: currentTask.chapters || []
        });
        updatedTasksList = [...tasks, newTask];
      }
      
      setTasks(updatedTasksList);
      onTasksChange?.(updatedTasksList);
      setIsModalOpen(false);
      setCurrentTask({});

      // Fetch all tasks to ensure sync
      const allTasks = await getUserTasks(user.uid);
      setTasks(allTasks);
      onTasksChange?.(allTasks);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      const newTasks = tasks.filter(task => task.id !== id);
      setTasks(newTasks);
      onTasksChange?.(newTasks); // Notify parent component of the change
      setIsModalOpen(false);
      setCurrentTask({});
      
      // Fetch all tasks to ensure sync
      if (user?.uid) {
        const allTasks = await getUserTasks(user.uid);
        setTasks(allTasks);
        onTasksChange?.(allTasks);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const events = tasks.map(task => ({
    id: task.id,
    title: task.title,
    date: task.date,
  }));

  return (
    <div className="relative">
      <div style={{ fontSize: '0.75rem' }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          events={events}
          headerToolbar={{
            left: 'prev,next',
            center: 'title',
            right: ''
          }}
          dayHeaderFormat={{ weekday: 'narrow' }}
          titleFormat={{ month: 'short', year: 'numeric' }}
          dayMaxEvents={1}
          eventDisplay="dot"
          contentHeight="auto"
          aspectRatio={1.5}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {isEditing ? 'Edit Task' : 'Add New Task'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={currentTask.title || ''}
                  onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  value={currentTask.date || ''}
                  onChange={(e) => setCurrentTask({ ...currentTask, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={currentTask.description || ''}
                  onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">
                    Study Chapters
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowChapterSelector(!showChapterSelector)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <BookOpen size={16} />
                    {showChapterSelector ? 'Hide Chapters' : 'Select Chapters'}
                  </button>
                </div>
                
                {showChapterSelector && (
                  <div className="mt-2 border rounded-md p-3">
                    <ChapterSelector 
                      selectedChapters={currentTask.chapters || []}
                      onChange={(chapters) => setCurrentTask({ ...currentTask, chapters })}
                    />
                  </div>
                )}
                
                {!showChapterSelector && currentTask.chapters && currentTask.chapters.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {currentTask.chapters.map(chapterId => {
                      // Find the chapter name from all subjects
                      let chapterName = '';
                      Object.values(chapters).forEach(chapterList => {
                        const chapter = chapterList.find(c => c.id === chapterId);
                        if (chapter) chapterName = chapter.name;
                      });
                      
                      return (
                        <span key={chapterId} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {chapterName}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleDelete(currentTask.id!)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </button>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  {isEditing ? (
                    <>
                      <Edit2 size={16} className="mr-2" />
                      Update
                    </>
                  ) : (
                    <>
                      <Plus size={16} className="mr-2" />
                      Add
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCalendar;
