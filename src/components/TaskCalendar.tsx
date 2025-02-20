import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg } from '@fullcalendar/core';
import { format } from 'date-fns';
import { Plus, X, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addTask, getUserTasks, updateTask, deleteTask } from '../services/taskService';

export interface Task {
  id: string;
  title: string;
  date: string;
  description?: string;
}

interface TaskCalendarProps {
  onDateSelect?: (date: string) => void;
  onTasksChange?: (tasks: Task[]) => void;
}

const TaskCalendar: React.FC<TaskCalendarProps> = ({ onDateSelect, onTasksChange }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({});
  const [isEditing, setIsEditing] = useState(false);

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
    });
    onDateSelect?.(formattedDate);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEventClick = (arg: EventClickArg) => {
    const task = tasks.find(t => t.id === arg.event.id);
    if (task) {
      setCurrentTask(task);
      setIsEditing(true);
      setIsModalOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask.title || !currentTask.date || !user?.uid) return;

    try {
      if (isEditing && currentTask.id) {
        await updateTask(currentTask.id, currentTask);
        const updatedTasks = tasks.map(task =>
          task.id === currentTask.id ? { ...currentTask as Task } : task
        );
        setTasks(updatedTasks);
      } else {
        const newTask = await addTask(user.uid, {
          title: currentTask.title,
          date: currentTask.date,
          description: currentTask.description || ''
        });
        setTasks([...tasks, newTask]);
      }
      setIsModalOpen(false);
      setCurrentTask({});
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      const newTasks = tasks.filter(task => task.id !== id);
      setTasks(newTasks);
      setIsModalOpen(false);
      setCurrentTask({});
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
