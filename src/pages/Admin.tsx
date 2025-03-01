import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Plus, Trash2, Video, FileQuestion } from 'lucide-react';

interface VideoData {
  id?: string;
  title: string;
  youtubeId: string;
  duration: string;
  chapter: string;
  subject: string;
  thumbnail: string;
}

interface CustomQuestion {
  id?: string;
  question: string;
  subject: string;
  chapter: string;
  options: string[];
  correctOption: number;
  solution: string;
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'videos' | 'questions'>('videos');
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);
  const [newVideo, setNewVideo] = useState<VideoData>({
    title: '',
    youtubeId: '',
    duration: '',
    chapter: '',
    subject: '',
    thumbnail: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [videoSubject, setVideoSubject] = useState('');
  const [videoChapter, setVideoChapter] = useState('');
  const [newQuestion, setNewQuestion] = useState<CustomQuestion>({
    question: '',
    subject: '',
    chapter: '',
    options: ['', '', '', ''],
    correctOption: 0,
    solution: ''
  });

  useEffect(() => {
    fetchVideos();
    fetchQuestions();
  }, []);

  const fetchVideos = async () => {
    try {
      const videosCollection = collection(db, 'videos');
      const videoSnapshot = await getDocs(videosCollection);
      const videoList = videoSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VideoData[];
      setVideos(videoList);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const questionsCollection = collection(db, 'customQuestions');
      const questionSnapshot = await getDocs(questionsCollection);
      const questionList = questionSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CustomQuestion[];
      setQuestions(questionList);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'subject') {
      setVideoSubject(value);
      setVideoChapter('');
      setNewVideo(prev => ({
        ...prev,
        subject: value,
        chapter: ''
      }));
    } else {
      setNewVideo(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleVideoChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setVideoChapter(value);
    
    // Find the chapter name based on the selected ID
    const subjectName = newVideo.subject;
    const chapterName = chapters[subjectName]?.find(c => c.id === value)?.name || '';
    
    setNewVideo(prev => ({
      ...prev,
      chapter: chapterName
    }));
  };

  const extractYoutubeId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!newVideo.title || !newVideo.youtubeId || !newVideo.duration || !newVideo.chapter || !newVideo.subject) {
        throw new Error('Please fill in all fields');
      }

      const youtubeId = extractYoutubeId(newVideo.youtubeId);
      if (!youtubeId) {
        throw new Error('Invalid YouTube URL or ID');
      }

      const thumbnail = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
      
      const videoData = {
        title: newVideo.title,
        youtubeId,
        duration: newVideo.duration,
        chapter: newVideo.chapter,
        subject: newVideo.subject,
        thumbnail
      };

      console.log('Adding video:', videoData);
      const docRef = await addDoc(collection(db, 'videos'), videoData);
      console.log('Video added with ID:', docRef.id);

      setNewVideo({
        title: '',
        youtubeId: '',
        duration: '',
        chapter: '',
        subject: '',
        thumbnail: ''
      });
      setVideoSubject('');
      setVideoChapter('');
      await fetchVideos();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error adding video';
      console.error('Error adding video:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await deleteDoc(doc(db, 'videos', videoId));
        fetchVideos();
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteDoc(doc(db, 'customQuestions', questionId));
        fetchQuestions();
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!newQuestion.question || !newQuestion.subject || !newQuestion.chapter || 
          newQuestion.options.some(opt => !opt) || newQuestion.correctOption === undefined || !newQuestion.solution) {
        throw new Error('Please fill in all fields');
      }

      const questionData = {
        ...newQuestion,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'customQuestions'), questionData);
      console.log('Question added with ID:', docRef.id);

      setNewQuestion({
        question: '',
        subject: '',
        chapter: '',
        options: ['', '', '', ''],
        correctOption: 0,
        solution: ''
      });
      setSelectedSubject('');
      setSelectedChapter('');
      fetchQuestions();
    } catch (err) {
      console.error('Error adding question:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const subjects: { id: string; name: string }[] = [
    { id: 'viQ2R4q7DVRyhecVTrSg', name: 'Physics' },
    { id: 'cZDUFeYGd0cIEPlWJJuz', name: 'Chemistry' },
    { id: 'oreFsSKPpPfrnxL8G1xf', name: 'Biology' }
  ];

  const chapters: { [key: string]: { id: string; name: string }[] } = {
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
      { id: 'OQt6gFATlMIP4F7xq5EI', name: 'Semiconductor' }
    ],
    Chemistry: [
      { id: 'UR7lQgTXa6O1Ja2MjELt', name: 'Some Basics Concepts of Chemistry' },
      { id: 'WVYjeVoGqiyUQZowKvOF', name: 'Structure of Atom' },
      { id: 'vLjjoDj6mQrfB47Uj4jT', name: 'Classification of Elements' },
      { id: 'tlH4MPbfXhb8HFlVgIX7', name: 'Chemical Bonding and Molecular Structure' },
      { id: 'EDpMxMIBpTqjNJKWlnZo', name: 'States of Matter' },
      { id: 'ydpsND9XYU5Ctz1Jr0ir', name: 'Thermodynamics' },
      { id: 'I9Ex2UHsP10IL9VMr0fl', name: 'Equilibrium' },
      { id: 'AbEltnwRUfIHpZ7RYLXE', name: 'Redox Reactions' },
      { id: 'rBYUWaquerpt6DCEt8Ma', name: 'Hydrogen' },
      { id: 'NbY1nCIK4CbZN3si4FLH', name: 's-Block Elements' },
      { id: '8COC00fa3TkHFvQfiyEk', name: 'p-Block Elements' },
      { id: '83niumaqol0DnrgYJ1Rj', name: 'Organic Chemistry' },
      { id: 'F5AMt08I1dWxE92TqnXG', name: 'Hydrocarbons' },
      { id: 'K6eONmqzwLsFYLDI3vpa', name: 'Environmental Chemistry' },
      { id: 'OAzwKrBtk6iZvJsaTQIs', name: 'Solutions' },
      { id: '90OZl6yE6IYauh1LsdqS', name: 'Electrochemistry' },
      { id: '8GPJNawvt6J5EEiXRA0G', name: 'Chemical Kinetics' },
      { id: 'O7WgeGZ0n1zbxK7DvfFb', name: 'Surface Chemistry' },
      { id: '9NksgfWD616fnwuZtWd4', name: 'd and f Block Elements' },
      { id: 'u5ae2A7AXoaGOkrehirY', name: 'Coordination Compounds' },
      { id: 'v6jSjiUaiqU8rp8qWq4f', name: 'Haloalkanes and Haloarenes' },
      { id: 'poyyLhw7WnxziuwE72rA', name: 'Alcohols, Phenols and Ethers' },
      { id: 'psyWtKDbnjXZDpckZkdB', name: 'Aldehydes, Ketones and Carboxylic Acids' },
      { id: 'aQjZB2HZQ8adp0OL8aDT', name: 'Amines' },
      { id: 'H86iz5LOXXAo0BLbEZMX', name: 'Biomolecules' },
      { id: 'XqPgHgya2AASoEY8IU2T', name: 'Polymers' },
      { id: '3DK05k4JZMvQcXXvXN7R', name: 'Chemistry in Everyday Life' }
    ],
    Biology: [
      { id: '2taW41LFt0iepzmSW5dp', name: 'Living World' },
      { id: 'RInpuxI8yZlg8g2CQH9X', name: 'Biological Classification' },
      { id: 'xGxozQxQlknr79HVMpGq', name: 'Plant Kingdom' },
      { id: 'HLdG8QOaLN6jRK0kOXmt', name: 'Animal Kingdom' },
      { id: 'EDpMxMIBpTqjNJKWlnZo', name: 'Morphology of Flowering Plants' },
      { id: 'ydpsND9XYU5Ctz1Jr0ir', name: 'Anatomy of Flowering Plants' },
      { id: 'I9Ex2UHsP10IL9VMr0fl', name: 'Structural Organisation in Animals' },
      { id: 'AbEltnwRUfIHpZ7RYLXE', name: 'Cell: The Unit of Life' },
      { id: 'rBYUWaquerpt6DCEt8Ma', name: 'Biomolecules' },
      { id: 'NbY1nCIK4CbZN3si4FLH', name: 'Cell Cycle and Cell Division' },
      { id: '8COC00fa3TkHFvQfiyEk', name: 'Transport in Plants' },
      { id: '83niumaqol0DnrgYJ1Rj', name: 'Mineral Nutrition' },
      { id: 'F5AMt08I1dWxE92TqnXG', name: 'Photosynthesis in Higher Plants' },
      { id: 'K6eONmqzwLsFYLDI3vpa', name: 'Respiration in Plants' },
      { id: 'OAzwKrBtk6iZvJsaTQIs', name: 'Plant Growth and Development' },
      { id: '90OZl6yE6IYauh1LsdqS', name: 'Digestion and Absorption' },
      { id: '8GPJNawvt6J5EEiXRA0G', name: 'Breathing and Exchange of Gases' },
      { id: 'O7WgeGZ0n1zbxK7DvfFb', name: 'Body Fluids and Circulation' },
      { id: '9NksgfWD616fnwuZtWd4', name: 'Excretory Products and their Elimination' },
      { id: 'u5ae2A7AXoaGOkrehirY', name: 'Locomotion and Movement' },
      { id: 'v6jSjiUaiqU8rp8qWq4f', name: 'Neural Control and Coordination' },
      { id: 'poyyLhw7WnxziuwE72rA', name: 'Chemical Coordination and Integration' },
      { id: 'psyWtKDbnjXZDpckZkdB', name: 'Reproduction in Organisms' },
      { id: 'aQjZB2HZQ8adp0OL8aDT', name: 'Sexual Reproduction in Flowering Plants' },
      { id: 'H86iz5LOXXAo0BLbEZMX', name: 'Human Reproduction' },
      { id: 'XqPgHgya2AASoEY8IU2T', name: 'Reproductive Health' },
      { id: '3DK05k4JZMvQcXXvXN7R', name: 'Principles of Inheritance and Variation' },
      { id: 'GFgznll08oV62N55b8KQ', name: 'Molecular Basis of Inheritance' },
      { id: 'Tw7vLs2sI9raIZsarADj', name: 'Evolution' },
      { id: 'OQt6gFATlMIP4F7xq5EI', name: 'Human Health and Disease' },
      { id: 'P9Ex2UHsP10IL9VMr0fl', name: 'Strategies for Enhancement in Food Production' },
      { id: 'Q8COC00fa3TkHFvQfiyE', name: 'Microbes in Human Welfare' },
      { id: 'R7niumaqol0DnrgYJ1Rj', name: 'Biotechnology: Principles and Processes' },
      { id: 'S6AMt08I1dWxE92TqnXG', name: 'Biotechnology and its Applications' },
      { id: 'T5eONmqzwLsFYLDI3vpa', name: 'Organisms and Populations' },
      { id: 'U4zwKrBtk6iZvJsaTQIs', name: 'Ecosystem' },
      { id: 'V3OZl6yE6IYauh1LsdqS', name: 'Biodiversity and Conservation' },
      { id: 'W2PJNawvt6J5EEiXRA0G', name: 'Environmental Issues' }
    ]
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm flex items-center ${
            activeTab === 'videos'
              ? 'border-b-2 border-indigo-500 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('videos')}
        >
          <Video className="w-4 h-4 mr-2" />
          Videos
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm flex items-center ${
            activeTab === 'questions'
              ? 'border-b-2 border-indigo-500 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('questions')}
        >
          <FileQuestion className="w-4 h-4 mr-2" />
          Questions
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Videos Tab Content */}
      {activeTab === 'videos' && (
        <>
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Add New Video</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                value={newVideo.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">YouTube URL or ID</label>
              <input
                type="text"
                name="youtubeId"
                value={newVideo.youtubeId}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration (HH:MM:SS)</label>
              <input
                type="text"
                name="duration"
                value={newVideo.duration}
                onChange={handleInputChange}
                pattern="^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <select
                name="subject"
                value={newVideo.subject}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select Subject</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Chapter</label>
              <select
                value={videoChapter}
                onChange={handleVideoChapterChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                disabled={!newVideo.subject}
              >
                <option value="">Select Chapter</option>
                {newVideo.subject && chapters[newVideo.subject]?.map(chapter => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Adding...' : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Video
              </>
            )}
          </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold p-6 border-b">Video List</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chapter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {videos.map((video) => (
                    <tr key={video.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="h-10 w-16 object-cover rounded mr-3"
                          />
                          <div className="text-sm font-medium text-gray-900">{video.title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{video.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{video.chapter}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{video.duration}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => video.id && handleDeleteVideo(video.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      
      {/* Questions Tab Content */}
      {activeTab === 'questions' && (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Add Custom Question</h2>
            <form onSubmit={handleQuestionSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedChapter('');
                setNewQuestion(prev => ({
                  ...prev,
                  subject: e.target.value,
                  chapter: ''
                }));
              }}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chapter
            </label>
            <select
              value={selectedChapter}
              onChange={(e) => {
                setSelectedChapter(e.target.value);
                setNewQuestion(prev => ({
                  ...prev,
                  chapter: e.target.value
                }));
              }}
              className="w-full p-2 border rounded-md"
              required
              disabled={!selectedSubject}
            >
              <option value="">Select Chapter</option>
              {selectedSubject && chapters[subjects.find(s => s.id === selectedSubject)?.name || '']?.map(chapter => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question
            </label>
            <textarea
              value={newQuestion.question}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
              className="w-full p-2 border rounded-md"
              rows={4}
              required
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Options
            </label>
            {newQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="correctOption"
                  checked={newQuestion.correctOption === index}
                  onChange={() => setNewQuestion(prev => ({ ...prev, correctOption: index }))}
                  className="mr-2"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 p-2 border rounded-md"
                  required
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solution Explanation
            </label>
            <textarea
              value={newQuestion.solution}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, solution: e.target.value }))}
              className="w-full p-2 border rounded-md"
              rows={4}
              placeholder="Explain why the correct answer is right and why other options are wrong..."
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Adding Question...' : 'Add Question'}
          </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold p-6 border-b">Question List</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chapter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.map((question) => (
                    <tr key={question.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-md truncate">{question.question}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subjects.find(s => s.id === question.subject)?.name || question.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(() => {
                          const subjectName = subjects.find(s => s.id === question.subject)?.name || '';
                          return chapters[subjectName]?.find(c => c.id === question.chapter)?.name || question.chapter;
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => question.id && handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Admin;
