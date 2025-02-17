import React, { useState, useEffect, useMemo } from 'react';
import { Search, Play } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  youtubeId: string;
  duration: string;
  chapter: string;
  subject: string;
}

interface SubjectData {
  [key: string]: {
    chapters: string[];
    videos: Video[];
  };
}

const defaultChapters: { [key: string]: string[] } = {
  'Physics': [
    'Kinematics',
    'Laws of Motion',
    'Work, Energy and Power',
    'Rotational Motion',
    'Gravitation',
    'Properties of Solids and Liquids',
    'Thermodynamics',
    'Oscillations and Waves'
  ],
  'Chemistry': [
    'Atomic Structure',
    'Chemical Bonding',
    'States of Matter',
    'Thermodynamics',
    'Equilibrium',
    'Redox Reactions',
    'Organic Chemistry',
    'Periodic Table'
  ],
  'Biology': [
    'Cell : The Unit Of Life',
    'Biological Classification',
    'Plant Kingdom',
    'Animal Kingdom',
    'Morphology of Flowering Plants',
    'Human Physiology',
    'Genetics and Evolution',
    'Biotechnology'
  ]
};

const Learn = () => {
  const [selectedSubject, setSelectedSubject] = useState('Physics');
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const videosCollection = collection(db, 'videos');
      const videoSnapshot = await getDocs(videosCollection);
      const videoList = videoSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Video[];
      setVideos(videoList);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const subjectData = useMemo(() => {
    const data: SubjectData = {};
    
    // Initialize with default subjects even if there are no videos
    Object.keys(defaultChapters).forEach(subject => {
      data[subject] = {
        chapters: defaultChapters[subject],
        videos: videos.filter(video => video.subject === subject)
      };
    });

    // Add any additional subjects from videos
    videos.forEach(video => {
      if (!data[video.subject]) {
        data[video.subject] = {
          chapters: [],
          videos: videos.filter(v => v.subject === video.subject)
        };
      }
    });

    return data;
  }, [videos]);

  const filteredVideos = useMemo(() => {
    return videos.filter(video => {
      const matchesSubject = video.subject.toLowerCase() === selectedSubject.toLowerCase();
      const matchesChapter = !selectedChapter || video.chapter.toLowerCase() === selectedChapter.toLowerCase();
      const matchesSearch = !searchQuery || 
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        video.chapter.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSubject && matchesChapter && matchesSearch;
    });
  }, [videos, selectedSubject, selectedChapter, searchQuery]);

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
        {Object.keys(subjectData).length > 0 ? (
          Object.keys(subjectData).map((subject) => (
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
          ))
        ) : (
          <div className="text-gray-500">Loading subjects...</div>
        )}
      </div>

      <div className="flex gap-6">
        <div className="w-64 space-y-2">
          <h2 className="font-semibold text-gray-700 mb-4">Chapters</h2>
          <div className="space-y-1">
            {subjectData[selectedSubject] && (
              <>
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
              </>
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 text-center py-8 text-gray-500">
                Loading videos...
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-gray-500">
                No videos found
              </div>
            ) : (
              filteredVideos.map((video) => (
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;
