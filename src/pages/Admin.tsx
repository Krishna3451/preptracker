import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Plus, Trash2 } from 'lucide-react';

interface VideoData {
  id?: string;
  title: string;
  youtubeId: string;
  duration: string;
  chapter: string;
  subject: string;
  thumbnail: string;
}

const Admin = () => {
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [newVideo, setNewVideo] = useState<VideoData>({
    title: '',
    youtubeId: '',
    duration: '',
    chapter: '',
    subject: '',
    thumbnail: ''
  });
  const [loading, setLoading] = useState(false);

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
      })) as VideoData[];
      setVideos(videoList);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewVideo(prev => ({
      ...prev,
      [name]: value
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
      await fetchVideos();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error adding video';
      console.error('Error adding video:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await deleteDoc(doc(db, 'videos', videoId));
        fetchVideos();
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
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
              <input
                type="text"
                name="chapter"
                value={newVideo.chapter}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
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
                      onClick={() => video.id && handleDelete(video.id)}
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
    </div>
  );
};

export default Admin;
