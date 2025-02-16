import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';
import { Plus, X, Edit2, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  date: string;
  description?: string;
}

const TaskCalendar: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({});
  const [isEditing, setIsEditing] = useState(false);

  const handleDateClick = (arg: { date: Date }) => {
    setCurrentTask({
      date: format(arg.date, 'yyyy-MM-dd'),
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEventClick = (arg: { event: any }) => {
    const task = tasks.find(t => t.id === arg.event.id);
    if (task) {
      setCurrentTask(task);
      setIsEditing(true);
      setIsModalOpen(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTask.title && currentTask.date) {
      if (isEditing && currentTask.id) {
        setTasks(tasks.map(task => 
          task.id === currentTask.id ? { ...currentTask as Task } : task
        ));
      } else {
        setTasks([...tasks, { 
          ...currentTask as Task,
          id: Math.random().toString(36).substr(2, 9)
        }]);
      }
      setIsModalOpen(false);
      setCurrentTask({});
    }
  };

  const handleDelete = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    setIsModalOpen(false);
    setCurrentTask({});
  };

  const events = tasks.map(task => ({
    id: task.id,
    title: task.title,
    date: task.date,
  }));

  return (
    <div className="relative">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        events={events}
        height="auto"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth'
        }}
      />

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
