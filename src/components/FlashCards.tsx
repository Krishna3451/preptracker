import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FlashCard {
  id: number;
  subject: string;
  question: string;
  answer: string;
}

const sampleFlashcards: FlashCard[] = [
  // Physics
  {
    id: 1,
    subject: 'Physics',
    question: 'What is the SI unit of momentum?',
    answer: 'kg⋅m/s (kilogram meter per second)'
  },
  {
    id: 2,
    subject: 'Physics',
    question: 'State Newton\'s Second Law of Motion',
    answer: 'The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass. F = ma'
  },
  // Chemistry
  {
    id: 3,
    subject: 'Chemistry',
    question: 'What is Avogadro\'s number?',
    answer: '6.022 × 10²³ particles per mole'
  },
  {
    id: 4,
    subject: 'Chemistry',
    question: 'What is the electronic configuration of Sodium (Na)?',
    answer: '1s² 2s² 2p⁶ 3s¹'
  },
  // Biology (Botany)
  {
    id: 5,
    subject: 'Botany',
    question: 'What is the function of stomata?',
    answer: 'Gas exchange (CO₂ and O₂) and transpiration in plants'
  },
  {
    id: 6,
    subject: 'Botany',
    question: 'What are the products of light-dependent reactions in photosynthesis?',
    answer: 'ATP, NADPH, and Oxygen'
  },
  // Biology (Zoology)
  {
    id: 7,
    subject: 'Zoology',
    question: 'What is the function of nephrons?',
    answer: 'Basic structural and functional unit of kidney that filters blood to form urine'
  },
  {
    id: 8,
    subject: 'Zoology',
    question: 'Name the parts of human brain',
    answer: 'Cerebrum, Cerebellum, and Brain stem (Midbrain, Pons, Medulla oblongata)'
  }
];

const FlashCards: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('Physics');
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const filteredCards = sampleFlashcards.filter(card => card.subject === selectedSubject);

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const subjects = ['Physics', 'Chemistry', 'Botany', 'Zoology'];

  return (
    <div className="w-full">
      <div className="flex space-x-2 mb-4">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => {
              setSelectedSubject(subject);
              setCurrentCardIndex(0);
              setIsFlipped(false);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedSubject === subject
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {subject}
          </button>
        ))}
      </div>

      <div className="relative h-64 w-full perspective-1000">
        <motion.div
          className="w-full h-full relative preserve-3d cursor-pointer"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front of card */}
          <div className="absolute w-full h-full backface-hidden">
            <div className="w-full h-full bg-white rounded-xl shadow-lg p-6 flex items-center justify-center text-center">
              <p className="text-lg font-medium text-gray-800">
                {filteredCards[currentCardIndex]?.question}
              </p>
            </div>
          </div>

          {/* Back of card */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180">
            <div className="w-full h-full bg-blue-50 rounded-xl shadow-lg p-6 flex items-center justify-center text-center">
              <p className="text-lg font-medium text-gray-800">
                {filteredCards[currentCardIndex]?.answer}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center mt-4 space-x-4">
        <button
          onClick={handlePrevCard}
          className="px-4 py-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={handleNextCard}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FlashCards;
