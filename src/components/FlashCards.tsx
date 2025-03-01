import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

interface FlashCard {
  id?: string;
  subject: string;
  question: string;
  answer: string;
}

// Fallback flashcards in case there are none in the database
const fallbackFlashcards: FlashCard[] = [
  {
    id: '1',
    subject: 'Physics',
    question: 'What is the SI unit of momentum?',
    answer: 'kg⋅m/s (kilogram meter per second)'
  },
  {
    id: '2',
    subject: 'Chemistry',
    question: 'What is Avogadro\'s number?',
    answer: '6.022 × 10²³ particles per mole'
  }
];

const FlashCards: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('Physics');
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const flashcardsCollection = collection(db, 'flashcards');
      const flashcardSnapshot = await getDocs(flashcardsCollection);
      
      if (flashcardSnapshot.empty) {
        // Use fallback flashcards if none in database
        setFlashcards(fallbackFlashcards);
      } else {
        const flashcardList = flashcardSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FlashCard[];
        setFlashcards(flashcardList);
      }
    } catch (err) {
      console.error('Error fetching flashcards:', err);
      setError('Failed to load flashcards');
      setFlashcards(fallbackFlashcards); // Use fallback on error
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = flashcards.filter(card => card.subject === selectedSubject);

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  // Extract unique subjects from flashcards
  const subjects = Array.from(new Set(flashcards.map(card => card.subject)));
  
  // If no flashcards or subjects found, use default subjects
  const availableSubjects = subjects.length > 0 ? subjects : ['Physics', 'Chemistry', 'Botany', 'Zoology'];

  return (
    <div className="w-full">
      {loading ? (
        <div className="w-full h-64 flex items-center justify-center">
          <p className="text-gray-500">Loading flashcards...</p>
        </div>
      ) : error ? (
        <div className="w-full h-64 flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
            {availableSubjects.map((subject) => (
              <button
                key={subject}
                onClick={() => {
                  setSelectedSubject(subject);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedSubject === subject
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
          
          {filteredCards.length === 0 ? (
            <div className="w-full h-64 bg-white rounded-xl shadow-lg p-6 flex items-center justify-center text-center">
              <p className="text-gray-500">No flashcards available for {selectedSubject}. Try selecting another subject or add some flashcards.</p>
            </div>
          ) : (
            <>
              <div className="relative h-48 sm:h-64 w-full perspective-1000">
                <motion.div
                  className="w-full h-full relative preserve-3d cursor-pointer"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* Front of card */}
                  <div className="absolute w-full h-full backface-hidden">
                    <div className="w-full h-full bg-white rounded-xl shadow-lg p-3 sm:p-6 flex flex-col items-center justify-center text-center">
                      <p className="text-base sm:text-lg font-medium text-gray-800">
                        {filteredCards[currentCardIndex]?.question}
                      </p>
                      <p className="text-xs text-gray-500 mt-3 italic">Tap to reveal answer</p>
                    </div>
                  </div>

                  {/* Back of card */}
                  <div className="absolute w-full h-full backface-hidden rotate-y-180">
                    <div className="w-full h-full bg-blue-50 rounded-xl shadow-lg p-3 sm:p-6 flex items-center justify-center text-center">
                      <p className="text-base sm:text-lg font-medium text-gray-800">
                        {filteredCards[currentCardIndex]?.answer}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="flex justify-center mt-4 space-x-4">
                <button
                  onClick={handlePrevCard}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors text-sm sm:text-base"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextCard}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default FlashCards;
