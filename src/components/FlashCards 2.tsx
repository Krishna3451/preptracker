import React, { useEffect, useState } from 'react';
import FlashCard from './FlashCard';
import { getDailyFlashcards, Flashcard } from '../services/flashcardService';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const FlashCards: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const cards = await getDailyFlashcards();
        setFlashcards(cards);
      } catch (error) {
        console.error('Error fetching flashcards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, []);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Daily Flashcards</h2>
        <div className="animate-pulse h-48 bg-gray-100 rounded-xl"></div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Daily Flashcards</h2>
        <p className="text-gray-500">No flashcards available for today.</p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Daily Flashcards</h2>
        <div className="text-sm text-gray-500">
          {currentIndex + 1} / {flashcards.length}
        </div>
      </div>
      
      <div className="relative">
        <FlashCard
          subject={currentCard.subject}
          question={currentCard.question}
          answer={currentCard.answer}
        />
        
        <div className="flex justify-between mt-4">
          <button
            onClick={handlePrevious}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Previous
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            Next
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashCards;
