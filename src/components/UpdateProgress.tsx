import React, { useState } from 'react';
import Modal from './Modal';

interface UpdateProgressProps {
  onProgressUpdate: (update: {
    subject: string;
    chapter: string;
    theoryRevision: boolean;
    questionsPracticed: number;
  }) => void;
}

const UpdateProgress: React.FC<UpdateProgressProps> = ({ onProgressUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('Biology');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [theoryRevision, setTheoryRevision] = useState(false);
  const [questionsPracticed, setQuestionsPracticed] = useState(0);

  const subjects = ['Biology', 'Physics', 'Chemistry'];
  
  const subjectChapters = {
    'Physics': [
      'Basic Mathematics',
      'Units and Measurements',
      'Motion in a Straight Line',
      'Motion in a Plane',
      'Laws of Motion',
      'Work, Energy and Power',
      'System of Particles',
      'Rotation Motion',
      'Gravitation',
      'Mechanical Properties of Solid',
      'Mechanical Properties of Fluids',
      'Thermal Properties of Matter',
      'Thermodynamics',
      'Kinetic Theory of Gases',
      'Oscillations',
      'Waves',
      'Electrostatic',
      'Capacitance',
      'Current Electricity',
      'Moving Charges & Magnetism',
      'Magnetism & Matter',
      'EMI',
      'Alternating Current',
      'Electromagnetic Waves',
      'Ray optics',
      'Wave Optics',
      'Dual Nature of Radiation and Matter',
      'Atoms',
      'Nuclei',
      'Semiconductor'
    ],
    'Chemistry': [
      'Some Basic Concept of Chemistry',
      'Structure of Atom',
      'Classification of Elements & Periodicity',
      'Chemical Bonding',
      'Thermodynamics',
      'Chemical Equilibrium',
      'Ionic Equilibrium',
      'Redox Reactions',
      'p-Block Elements (Group 13 & 14)',
      'Organic Chemistry: Some Basic Principles & Techniques',
      'Hydrocarbons',
      'Solutions',
      'Electrochemistry',
      'Chemical Kinetics',
      'p-Block Elements (Group 15,16,17,18)',
      'd & f-Block Elements',
      'Coordination Compounds',
      'Haloalkanes & Haloarenes',
      'Alcohol, Phenol and Ether',
      'Aldehyde and Ketone',
      'Carboxylic Acid',
      'Amines',
      'Biomolecules',
      'Practical Chemistry'
    ],
    'Biology': [
      'Living World',
      'Biological Classification',
      'Plant Kingdom',
      'Animal Kingdom',
      'Morphology of Flowering Plants',
      'Anatomy of Flowering Plants',
      'Structural Organisation in Animals',
      'Cell-The Unit of Life',
      'Biomolecules',
      'Cell Cycle and Cell Division',
      'Photosynthesis in Higher Plants',
      'Respiration in Plants',
      'Plant Growth and Development',
      'Breathing and Exchange of Gases',
      'Body Fluids and Circulation',
      'Excretory Products & their elimination',
      'Locomotion and movements',
      'Neural Control and Coordination',
      'Chemical Coordination and Integration',
      'Sexual Reproduction in Flowering Plants',
      'Human Reproduction',
      'Reproductive Health',
      'Principles of Inheritance and Variation',
      'Molecular Basis of Inheritance',
      'Evolution',
      'Human Health & Diseases',
      'Microbes in human Welfare',
      'Biotechnology-Principles and Processes',
      'Biotechnology and Its Application',
      'Organism and Populations',
      'Ecosystem',
      'Biodiversity and Conservation'
    ]
  };

  const handleSubmit = () => {
    if (!selectedChapter) {
      alert('Please select a chapter');
      return;
    }

    onProgressUpdate({
      subject: selectedSubject,
      chapter: selectedChapter,
      theoryRevision,
      questionsPracticed,
    });
    setIsModalOpen(false);
    // Reset form
    setSelectedChapter('');
    setTheoryRevision(false);
    setQuestionsPracticed(0);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Update Progress
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Update Progress</h2>
            
            <div className="space-y-4">
              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setSelectedChapter('');
                  }}
                  className="w-full p-2 border rounded-md"
                >
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chapter Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Chapter
                </label>
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a chapter</option>
                  {subjectChapters[selectedSubject as keyof typeof subjectChapters].map((chapter) => (
                    <option key={chapter} value={chapter}>
                      {chapter}
                    </option>
                  ))}
                </select>
              </div>

              {/* Theory Revision Status */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={theoryRevision}
                    onChange={(e) => setTheoryRevision(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Theory Revision Completed</span>
                </label>
              </div>

              {/* Questions Practiced */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Questions Practiced
                </label>
                <input
                  type="number"
                  min="0"
                  value={questionsPracticed}
                  onChange={(e) => setQuestionsPracticed(Number(e.target.value))}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdateProgress; 