import React, { useState } from 'react';
import { BookOpen, Video, FileText, Bookmark, CheckCircle } from 'lucide-react';

const Learn = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'Physics', label: 'Mathematics' },
    { id: 'science', label: 'Science' },
    { id: 'history', label: 'History' },
  ];

  const topics = [
    {
      id: 1,
      title: 'Introduction to Calculus',
      category: 'math',
      type: 'video',
      duration: '15 mins',
      completed: true,
      bookmarked: true,
    },
    {
      id: 2,
      title: 'Chemical Bonding',
      category: 'science',
      type: 'lesson',
      duration: '20 mins',
      completed: false,
      bookmarked: false,
    },
    {
      id: 3,
      title: 'World War II',
      category: 'history',
      type: 'document',
      duration: '25 mins',
      completed: false,
      bookmarked: true,
    },
  ];

  const filteredTopics = selectedCategory === 'all' 
    ? topics 
    : topics.filter(topic => topic.category === selectedCategory);

  const getTopicIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'document':
        return FileText;
      default:
        return BookOpen;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Learning Materials</h1>
        <div className="flex gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm ${
                selectedCategory === category.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTopics.map((topic) => {
          const TopicIcon = getTopicIcon(topic.type);
          return (
            <div key={topic.id} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <TopicIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Bookmark className={`w-5 h-5 ${
                      topic.bookmarked ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                    }`} />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <CheckCircle className={`w-5 h-5 ${
                      topic.completed ? 'fill-green-500 text-green-500' : 'text-gray-400'
                    }`} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{topic.title}</h3>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{topic.duration}</span>
                <button className="px-4 py-2 text-sm text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50">
                  Start Learning
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Learn;