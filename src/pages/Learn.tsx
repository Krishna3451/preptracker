import React, { useState } from 'react';
import { Search, Play } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  youtubeId: string;
  duration: string;
  chapter: string;
}

interface SubjectData {
  [key: string]: {
    chapters: string[];
    videos: Video[];
  };
}

const subjectData: SubjectData = {
  'Physics': {
    chapters: [
      'Kinematics',
      'Laws of Motion',
      'Work, Energy and Power',
      'Rotational Motion',
      'Gravitation',
      'Properties of Solids and Liquids',
      'Thermodynamics',
      'Oscillations and Waves'
    ],
    videos: [
      {
        id: '1',
        title: 'NEET Physics: Kinematics - Motion in a straight line',
        thumbnail: 'https://img.youtube.com/vi/hY9zZrYuDVk/maxresdefault.jpg',
        youtubeId: 'hY9zZrYuDVk',
        duration: '09:45:20',
        chapter: 'Kinematics'
      },
      {
        id: '2',
        title: 'Understanding Newton\'s Laws of Motion',
        thumbnail: 'https://img.youtube.com/vi/6wjFZCmAKoU/maxresdefault.jpg',
        youtubeId: '6wjFZCmAKoU',
        duration: '32:15',
        chapter: 'Laws of Motion'
      }
    ]
  },
  'Chemistry': {
    chapters: [
      'Atomic Structure',
      'Chemical Bonding',
      'States of Matter',
      'Thermodynamics',
      'Equilibrium',
      'Redox Reactions',
      'Organic Chemistry',
      'Periodic Table'
    ],
    videos: [
      {
        id: '3',
        title: 'Understanding Atomic Structure',
        thumbnail: 'https://img.youtube.com/vi/7c2bFyZn9Y4/maxresdefault.jpg',
        youtubeId: '7c2bFyZn9Y4',
        duration: '38:45',
        chapter: 'Atomic Structure'
      }
    ]
  },
  'Biology': {
    chapters: [
      'Cell : The Unit Of Life',
      'Biological Classification',
      'Plant Kingdom',
      'Animal Kingdom',
      'Morphology of Flowering Plants',
      'Human Physiology',
      'Genetics and Evolution',
      'Biotechnology'
    ],
    videos: [
      {
        id: '4',
        title: 'Cell Structure and Organization',
        thumbnail: 'https://img.youtube.com/vi/bqNMfpDDJ9E/maxresdefault.jpg',
        youtubeId: 'bqNMfpDDJ9E',
        duration: '41:30',
        chapter: 'Cell : The Unit Of Life'
      }
    ]
  }
};

const Learn = () => {
  const [selectedSubject, setSelectedSubject] = useState('Physics');
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVideos = subjectData[selectedSubject].videos.filter(video => {
    const matchesChapter = !selectedChapter || video.chapter === selectedChapter;
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChapter && matchesSearch;
  });

  const handleVideoClick = (youtubeId: string) => {
    window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Learning Center</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search videos..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-[300px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex space-x-4 border-b">
        {Object.keys(subjectData).map((subject) => (
          <button
            key={subject}
            onClick={() => {
              setSelectedSubject(subject);
              setSelectedChapter(null);
            }}
            className={`px-4 py-2 font-medium text-sm ${
              selectedSubject === subject
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {subject}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        <div className="w-64 space-y-2">
          <h2 className="font-semibold text-gray-700 mb-4">Chapters</h2>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedChapter(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                !selectedChapter
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Chapters
            </button>
            {subjectData[selectedSubject].chapters.map((chapter) => (
              <button
                key={chapter}
                onClick={() => setSelectedChapter(chapter)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  selectedChapter === chapter
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {chapter}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleVideoClick(video.youtubeId)}
              >
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{video.chapter}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;
