import React, { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Plus, Trash2, Video, FileQuestion, BookOpen, Shield, UserPlus, UserX, Image, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
  questionImage?: string;
  subject: string;
  chapter: string;
  options: string[];
  optionImages?: string[];
  correctOption: number;
  solution: string;
  solutionImage?: string;
}

interface Flashcard {
  id?: string;
  subject: string;
  question: string;
  answer: string;
  createdAt?: string;
}

// Custom dropzone component to avoid React Hook errors
const ImageDropzone = ({ onDrop, preview, onRemove, label }: { 
  onDrop: (files: File[]) => void; 
  preview?: string;
  onRemove?: () => void;
  label: string;
}) => {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      onDrop(files);
    }
  }, [onDrop]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onDrop(files);
    }
  }, [onDrop]);

  return (
    <div>
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Image preview" 
            className="max-h-48 max-w-full object-contain"
          />
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <div 
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer"
          onClick={() => document.getElementById(`file-input-${label}`)?.click()}
        >
          <input 
            id={`file-input-${label}`}
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="hidden"
          />
          <div className="flex flex-col items-center">
            <Image className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              {label}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Drag and drop or click to select
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const Admin = () => {
  const { user, isAdmin, isSuperAdmin, adminUsers, addAdminUser, removeAdminUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'admins' | 'videos' | 'questions' | 'flashcards'>('videos');
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
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
    optionImages: ['', '', '', ''],
    correctOption: 0,
    solution: ''
  });

  const [newFlashcard, setNewFlashcard] = useState<Flashcard>({
    subject: '',
    question: '',
    answer: ''
  });

  // Admin management state
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  // Image upload states
  const [questionImage, setQuestionImage] = useState<File | null>(null);
  const [questionImagePreview, setQuestionImagePreview] = useState<string>('');
  const [optionImages, setOptionImages] = useState<(File | null)[]>([null, null, null, null]);
  const [optionImagePreviews, setOptionImagePreviews] = useState<string[]>(['', '', '', '']);
  const [solutionImage, setSolutionImage] = useState<File | null>(null);
  const [solutionImagePreview, setSolutionImagePreview] = useState<string>('');
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    fetchVideos();
    fetchQuestions();
    fetchFlashcards();
  }, []);

  // Handle adding a new admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminSuccess(null);
    setIsAddingAdmin(true);

    if (!newAdminEmail) {
      setAdminError('Please enter an email address');
      setIsAddingAdmin(false);
      return;
    }

    try {
      await addAdminUser(newAdminEmail);
      setAdminSuccess(`Successfully added ${newAdminEmail} as admin`);
      setNewAdminEmail('');
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : 'Error adding admin');
    } finally {
      setIsAddingAdmin(false);
    }
  };

  // Handle removing an admin
  const handleRemoveAdmin = async (uid: string, email: string) => {
    if (window.confirm(`Are you sure you want to remove admin privileges from ${email}?`)) {
      setAdminError(null);
      setAdminSuccess(null);
      
      try {
        await removeAdminUser(uid);
        setAdminSuccess(`Successfully removed admin privileges from ${email}`);
      } catch (error) {
        setAdminError(error instanceof Error ? error.message : 'Error removing admin');
      }
    }
  };

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

  const fetchFlashcards = async () => {
    try {
      const flashcardsCollection = collection(db, 'flashcards');
      const flashcardSnapshot = await getDocs(flashcardsCollection);
      const flashcardList = flashcardSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Flashcard[];
      setFlashcards(flashcardList);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'subject') {
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
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
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

  const handleDeleteFlashcard = async (flashcardId: string) => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      try {
        await deleteDoc(doc(db, 'flashcards', flashcardId));
        fetchFlashcards();
      } catch (error) {
        console.error('Error deleting flashcard:', error);
      }
    }
  };

  const handleFlashcardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!newFlashcard.subject || !newFlashcard.question || !newFlashcard.answer) {
        throw new Error('Please fill in all fields');
      }

      const flashcardData = {
        ...newFlashcard,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'flashcards'), flashcardData);
      console.log('Flashcard added with ID:', docRef.id);

      setNewFlashcard({
        subject: '',
        question: '',
        answer: ''
      });
      fetchFlashcards();
    } catch (err) {
      console.error('Error adding flashcard:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Question image handler
  const handleQuestionImageDrop = useCallback((files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setQuestionImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setQuestionImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Option image handler
  const handleOptionImageDrop = useCallback((files: File[], index: number) => {
    if (files.length > 0) {
      const file = files[0];
      
      setOptionImages(prev => {
        const newImages = [...prev];
        newImages[index] = file;
        return newImages;
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setOptionImagePreviews(prev => {
          const newPreviews = [...prev];
          newPreviews[index] = reader.result as string;
          return newPreviews;
        });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Remove question image
  const removeQuestionImage = () => {
    setQuestionImage(null);
    setQuestionImagePreview('');
  };

  // Remove option image
  const removeOptionImage = (index: number) => {
    setOptionImages(prev => {
      const newImages = [...prev];
      newImages[index] = null;
      return newImages;
    });
    
    setOptionImagePreviews(prev => {
      const newPreviews = [...prev];
      newPreviews[index] = '';
      return newPreviews;
    });
  };

  // Solution image handler
  const handleSolutionImageDrop = useCallback((files: File[]) => {
    if (files && files.length > 0) {
      const file = files[0];
      setSolutionImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSolutionImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Remove solution image
  const removeSolutionImage = () => {
    setSolutionImage(null);
    setSolutionImagePreview('');
  };

  // Upload images and get URLs
  const uploadImages = async () => {
    setUploadingImages(true);
    try {
      let questionImageUrl = '';
      const optionImageUrls: string[] = ['', '', '', ''];
      let solutionImageUrl = '';
      
      // Upload question image if exists
      if (questionImage) {
        try {
          const questionImageRef = ref(storage, `question-images/${Date.now()}-${questionImage.name}`);
          await uploadBytes(questionImageRef, questionImage);
          questionImageUrl = await getDownloadURL(questionImageRef);
        } catch (error) {
          console.error('Error uploading question image:', error);
          throw new Error('Failed to upload question image. Please check your Firebase Storage CORS configuration.');
        }
      }
      
      // Upload option images if they exist
      for (let i = 0; i < optionImages.length; i++) {
        if (optionImages[i]) {
          try {
            const optionImageRef = ref(storage, `option-images/${Date.now()}-${optionImages[i]!.name}`);
            await uploadBytes(optionImageRef, optionImages[i]!);
            optionImageUrls[i] = await getDownloadURL(optionImageRef);
          } catch (error) {
            console.error(`Error uploading option image ${i + 1}:`, error);
            throw new Error(`Failed to upload option image ${i + 1}. Please check your Firebase Storage CORS configuration.`);
          }
        }
      }
      
      // Upload solution image if exists
      if (solutionImage) {
        try {
          const solutionImageRef = ref(storage, `solution-images/${Date.now()}-${solutionImage.name}`);
          await uploadBytes(solutionImageRef, solutionImage);
          solutionImageUrl = await getDownloadURL(solutionImageRef);
        } catch (error) {
          console.error('Error uploading solution image:', error);
          throw new Error('Failed to upload solution image. Please check your Firebase Storage CORS configuration.');
        }
      }
      
      return {
        questionImageUrl,
        optionImageUrls,
        solutionImageUrl
      };
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    } finally {
      setUploadingImages(false);
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

      // Upload images if any
      let questionImageUrl = '';
      let optionImageUrls = ['', '', '', ''];
      let solutionImageUrl = '';
      
      if (questionImage || optionImages.some(img => img !== null) || solutionImage) {
        try {
          const uploadResult = await uploadImages();
          questionImageUrl = uploadResult.questionImageUrl;
          optionImageUrls = uploadResult.optionImageUrls;
          solutionImageUrl = uploadResult.solutionImageUrl;
        } catch (error) {
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError('Failed to upload images. Please try again later.');
          }
          setLoading(false);
          return;
        }
      }

      const questionData = {
        ...newQuestion,
        questionImage: questionImageUrl,
        optionImages: optionImageUrls,
        solutionImage: solutionImageUrl,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'customQuestions'), questionData);
      console.log('Question added with ID:', docRef.id);

      // Reset form
      setNewQuestion({
        question: '',
        subject: '',
        chapter: '',
        options: ['', '', '', ''],
        optionImages: ['', '', '', ''],
        correctOption: 0,
        solution: ''
      });
      setSelectedSubject('');
      setSelectedChapter('');
      setQuestionImage(null);
      setQuestionImagePreview('');
      setOptionImages([null, null, null, null]);
      setOptionImagePreviews(['', '', '', '']);
      setSolutionImage(null);
      setSolutionImagePreview('');
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
      
      {/* Admin Management Section (only visible to Super Admin) */}
      {isSuperAdmin && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-indigo-600" />
            Admin Access Management
          </h2>
          
          {/* Super Admin Notice */}
          <div className="bg-indigo-50 p-4 rounded-md mb-4">
            <p className="text-indigo-800">You are logged in as the Super Admin ({user?.email}). You can add or remove other admins.</p>
          </div>
          
          {/* Admin Error/Success Messages */}
          {adminError && (
            <div className="bg-red-50 p-4 rounded-md mb-4">
              <p className="text-red-800">{adminError}</p>
            </div>
          )}
          {adminSuccess && (
            <div className="bg-green-50 p-4 rounded-md mb-4">
              <p className="text-green-800">{adminSuccess}</p>
            </div>
          )}
          
          {/* Add Admin Form */}
          <form onSubmit={handleAddAdmin} className="mb-6">
            <div className="flex items-center">
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isAddingAdmin}
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isAddingAdmin || !newAdminEmail}
              >
                {isAddingAdmin ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Admin
                  </>
                )}
              </button>
            </div>
          </form>
          
          {/* Admin Users List */}
          <div>
            <h3 className="text-lg font-medium mb-2">Current Admins</h3>
            {adminUsers.length === 0 ? (
              <p className="text-gray-500 italic">No additional admins found.</p>
            ) : (
              <ul className="divide-y">
                {adminUsers.map((admin) => (
                  <li key={admin.uid} className="py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      {admin.photoURL && (
                        <img src={admin.photoURL} alt={admin.displayName || admin.email} className="h-8 w-8 rounded-full mr-3" />
                      )}
                      <div>
                        <p className="font-medium">{admin.displayName || 'No Name'}</p>
                        <p className="text-sm text-gray-500">{admin.email}</p>
                      </div>
                    </div>
                    {admin.email !== 'goyalmayank300@gmail.com' && (
                      <button
                        onClick={() => handleRemoveAdmin(admin.uid, admin.email)}
                        className="text-red-600 hover:text-red-800 focus:outline-none"
                        title="Remove admin privileges"
                      >
                        <UserX className="h-5 w-5" />
                      </button>
                    )}
                  </li>
                ))}
                {/* Always show the super admin */}
                {!adminUsers.some(admin => admin.email === 'goyalmayank300@gmail.com') && (
                  <li className="py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <div>
                        <p className="font-medium">Super Admin</p>
                        <p className="text-sm text-gray-500">goyalmayank300@gmail.com</p>
                      </div>
                    </div>
                    <span className="text-indigo-600 text-sm font-medium">Super Admin</span>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
      )}
      
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
        <button
          className={`py-2 px-4 font-medium text-sm flex items-center ${
            activeTab === 'flashcards'
              ? 'border-b-2 border-indigo-500 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('flashcards')}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Flashcards
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

          {/* Question Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Image (Optional)
            </label>
            <ImageDropzone 
              onDrop={handleQuestionImageDrop}
              preview={questionImagePreview}
              onRemove={removeQuestionImage}
              label="Add image to question"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Options
            </label>
            {newQuestion.options.map((option, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center space-x-2">
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
                
                {/* Option Image Upload */}
                <div className="ml-6">
                  <ImageDropzone 
                    onDrop={(files) => handleOptionImageDrop(files, index)}
                    preview={optionImagePreviews[index]}
                    onRemove={() => removeOptionImage(index)}
                    label={`Add image for option ${index + 1}`}
                  />
                </div>
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

          {/* Solution Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solution Image (Optional)
            </label>
            <ImageDropzone
              onDrop={handleSolutionImageDrop}
              preview={solutionImagePreview}
              onRemove={removeSolutionImage}
              label="Add image to solution"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || uploadingImages}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center"
          >
            {loading || uploadingImages ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {uploadingImages ? 'Uploading Images...' : 'Adding Question...'}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </>
            )}
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

      {/* Flashcards Tab Content */}
      {activeTab === 'flashcards' && (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Add New Flashcard</h2>
            <form onSubmit={handleFlashcardSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={newFlashcard.subject}
                    onChange={(e) => setNewFlashcard(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select Subject</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Botany">Botany</option>
                    <option value="Zoology">Zoology</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <textarea
                  value={newFlashcard.question}
                  onChange={(e) => setNewFlashcard(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer
                </label>
                <textarea
                  value={newFlashcard.answer}
                  onChange={(e) => setNewFlashcard(prev => ({ ...prev, answer: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center"
              >
                {loading ? 'Adding Flashcard...' : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Flashcard
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold p-6 border-b">Flashcard List</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {flashcards.map((flashcard) => (
                    <tr key={flashcard.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{flashcard.subject}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-md truncate">{flashcard.question}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-md truncate">{flashcard.answer}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => flashcard.id && handleDeleteFlashcard(flashcard.id)}
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
