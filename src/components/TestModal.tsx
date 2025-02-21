import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Clock } from 'lucide-react';

interface TestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (testConfig: any) => void;
}

const TestModal: React.FC<TestModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [testName, setTestName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [timeInMinutes, setTimeInMinutes] = useState<number>(0);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);

  const toggleSubjectExpansion = (subject: string) => {
    setExpandedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const subjects = ['Physics', 'Chemistry', 'Biology'];
  const questionCounts = [5, 10, 30, 60,90,120,180];
  const chapters = {
    Physics: [
      { id: 'p1', name: 'Basic Mathematics' },
      { id: 'p2', name: 'Units and Measurements' },
      { id: 'p3', name: 'Motion in a Straight Line' },
      { id: 'p4', name: 'Motion in a Plane' },
      { id: 'p5', name: 'Laws of Motion' },
      { id: 'p6', name: 'Work, Energy and Power' },
      { id: 'p7', name: 'System of Particles' },
      { id: 'p8', name: 'Rotation Motion' },
      { id: 'p9', name: 'Gravitation' },
      { id: 'p10', name: 'Mechanical Properties of Solid' },
      { id: 'p11', name: 'Mechanical Properties of Fluids' },
      { id: 'p12', name: 'Thermal Properties of Matter' },
      { id: 'p13', name: 'Thermodynamics' },
      { id: 'p14', name: 'Kinetic Theory of Gases' },
      { id: 'p15', name: 'Oscillations' },
      { id: 'p16', name: 'Waves' },
      { id: 'p17', name: 'Electrostatic' },
      { id: 'p18', name: 'Capacitance' },
      { id: 'p19', name: 'Current Electricity' },
      { id: 'p20', name: 'Moving Charges & Magnetism' },
      { id: 'p21', name: 'Magnetism & Matter' },
      { id: 'p22', name: 'EMI' },
      { id: 'p23', name: 'Alternating Current' },
      { id: 'p24', name: 'Electromagnetic Waves' },
      { id: 'p25', name: 'Ray optics' },
      { id: 'p26', name: 'Wave Optics' },
      { id: 'p27', name: 'Dual Nature of Radiation and Matter' },
      { id: 'p28', name: 'Atoms' },
      { id: 'p29', name: 'Nuclei' },
      { id: 'p30', name: 'Semiconductor' },
    ],
    Chemistry: [
      { id: 'c1', name: 'Some Basic Concept of Chemistry' },
      { id: 'c2', name: 'Structure of Atom' },
      { id: 'c3', name: 'Classification of Elements & Periodicity' },
      { id: 'c4', name: 'Chemical Bonding' },
      { id: 'c5', name: 'Thermodynamics' },
      { id: 'c6', name: 'Chemical Equilibrium' },
      { id: 'c7', name: 'Ionic Equilibrium' },
      { id: 'c8', name: 'Redox Reactions' },
      { id: 'c9', name: 'p-Block Elements (Group 13 & 14)' },
      { id: 'c10', name: 'Organic Chemistry: Some Basic Principles & Techniques' },
      { id: 'c11', name: 'Hydrocarbons' },
      { id: 'c12', name: 'Solutions' },
      { id: 'c13', name: 'Electrochemistry' },
      { id: 'c14', name: 'Chemical Kinetics' },
      { id: 'c15', name: 'p-Block Elements (Group 15,16,17,18)' },
      { id: 'c16', name: 'd & f-Block Elements' },
      { id: 'c17', name: 'Coordination Compounds' },
      { id: 'c18', name: 'Haloalkanes & Haloarenes' },
      { id: 'c19', name: 'Alcohol, Phenol and Ether' },
      { id: 'c20', name: 'Aldehyde and Ketone' },
      { id: 'c21', name: 'Carboxylic Acid' },
      { id: 'c22', name: 'Amines' },
      { id: 'c23', name: 'Biomolecules' },
      { id: 'c24', name: 'Practical Chemistry' },
      
    ],
    Biology: [
      { id: 'b1', name: 'Living World' },
      { id: 'b2', name: 'Biological Classification' },
      { id: 'b3', name: 'Plant Kingdom' },
      { id: 'b4', name: 'Animal Kingdom' },
      { id: 'b5', name: 'Morphology of Flowering Plants' },
      { id: 'b6', name: 'Anatomy of Flowering Plants' },
      { id: 'b7', name: 'Structural Organisation in Animals' },
      { id: 'b8', name: 'Cell-The Unit of Life' },
      { id: 'b9', name: 'Biomolecules' },
      { id: 'b10', name: 'Cell Cycle and Cell Division' },
      { id: 'b11', name: 'Photosynthesis in Higher Plants' },
      { id: 'b12', name: 'Respiration in Plants' },
      { id: 'b13', name: 'Plant Growth and Development' },
      { id: 'b14', name: 'Breathing and Exchnage of Gases' },
      { id: 'b15', name: 'Body Fluids and Circulation' },
      { id: 'b16', name: 'Excretory Products & their elimination' },
      { id: 'b17', name: 'Locomotion and movements' },
      { id: 'b18', name: 'Neural Control and Coordination' },
      { id: 'b19', name: 'Chemical Coordination and Integration' },
      { id: 'b20', name: 'Sexual Reproduction in Flowering Plants' },
      { id: 'b21', name: 'Human Reproduction'},
      { id: 'b22', name: 'Reproductive Health' },
      { id: 'b23', name: 'Principles of Inheritance and Variation' },
      { id: 'b24', name: 'Molecular Basis of Inheritance' },
      { id: 'b25', name: 'Evolution' },
      { id: 'b26', name: 'Human Health & Diseases' },
      { id: 'b27', name: 'Microbes in human Welfare' },
      { id: 'b28', name: 'Biotechnology-Principles and Processes' },
      { id: 'b29', name: 'Biotechnology and Its Application' },
      { id: 'b30', name: 'Organism and Populations' },
      { id: 'b31', name: 'Ecosystem' },
      { id: 'b32', name: 'Biodiversity and Conservation' },

     
    ],
  };

  // Reset all state when modal closes
  const resetState = () => {
    setStep(1);
    setTestName('');
    setSelectedSubjects([]);
    setQuestionCount(0);
    setTimeInMinutes(0);
    setSelectedChapters([]);
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  const handleNext = () => {
    if (step < 6) {
      if (step === 2) {
        // When moving from question selection to time, set initial time
        setTimeInMinutes(questionCount);
      }
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const handleChapterToggle = (chapterId: string) => {
    setSelectedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const handleTimeAdjustment = (adjustment: number) => {
    const newTime = timeInMinutes + adjustment;
    // Allow ±10 minutes adjustment
    if (newTime >= (questionCount - 10) && newTime <= (questionCount + 10)) {
      setTimeInMinutes(newTime);
    }
  };

  const hasChapterFromSubject = (subject: string) => {
    return selectedChapters.some(chapterId => chapterId.startsWith(subject[0].toLowerCase()));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedSubjects.length > 0;
      case 2:
        return questionCount > 0;
      case 3:
        return true;
      case 4:
        // Check if at least one chapter is selected from each selected subject
        return selectedSubjects.every(subject => hasChapterFromSubject(subject));
      case 5:
        return testName.length > 0;
      case 6:
        return true;
      default:
        return false;
    }
  };

  const getChapterSelectionStatus = () => {
    const status = selectedSubjects.map(subject => ({
      subject,
      hasChapter: hasChapterFromSubject(subject)
    }));
    
    const incomplete = status.filter(s => !s.hasChapter).map(s => s.subject);
    if (incomplete.length === 0) return '';
    
    return `Please select at least one chapter from: ${incomplete.join(', ')}`;
  };

  if (!isOpen) return null;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Choose your subjects</h2>
            <div className="grid grid-cols-1 gap-3">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => handleSubjectToggle(subject)}
                  className={`p-4 rounded-lg text-left transition-all transform hover:scale-[1.02] ${
                    selectedSubjects.includes(subject)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{subject}</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Choose number of questions</h2>
            <div className="grid grid-cols-2 gap-3">
              {questionCounts.map((count) => (
                <button
                  key={count}
                  onClick={() => {
                    setQuestionCount(count);
                  }}
                  className={`p-4 rounded-lg text-center transition-all transform hover:scale-[1.02] ${
                    questionCount === count
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {count} Questions
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Time Allocation</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleTimeAdjustment(-10)}
                className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300"
              >
                -10 min
              </button>
              <div className="flex flex-col items-center gap-1 px-4 py-2 bg-indigo-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium text-indigo-600">{timeInMinutes} minutes</span>
                </div>
                <span className="text-xs text-indigo-400">1 minute per question</span>
              </div>
              <button
                onClick={() => handleTimeAdjustment(10)}
                className="px-3 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300"
              >
                +10 min
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Add chapters</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Don't include out of syllabus Qs</span>
                <div className="relative inline-block w-10 h-6 transition duration-200 ease-in-out">
                  <input
                    type="checkbox"
                    className="switch-checkbox absolute block w-6 h-6 rounded-full bg-white appearance-none cursor-pointer"
                  />
                  <label
                    className="switch-label block overflow-hidden h-6 rounded-full bg-gray-700 cursor-pointer"
                  ></label>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400 text-sm">Select at least 1 chapter from each subject</p>
              {getChapterSelectionStatus() && (
                <p className="text-red-400 text-sm">{getChapterSelectionStatus()}</p>
              )}
            </div>
            
            <div className="space-y-4 flex-grow overflow-auto custom-scrollbar">
              {selectedSubjects.map((subject) => (
                <div key={subject} className="p-4 bg-gray-800/50 rounded-xl mb-4 last:mb-0">
                  <button 
                    onClick={() => toggleSubjectExpansion(subject)}
                    className="w-full"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          subject === 'Physics' ? 'bg-orange-500/20' :
                          subject === 'Chemistry' ? 'bg-green-500/20' :
                          'bg-blue-500/20'
                        }`}>
                          <div className={`w-6 h-6 rounded-lg ${
                            subject === 'Physics' ? 'bg-orange-500' :
                            subject === 'Chemistry' ? 'bg-green-500' :
                            'bg-blue-500'
                          }`} />
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium text-white">{subject}</h3>
                          <p className={`text-sm ${
                            hasChapterFromSubject(subject) ? 'text-gray-400' : 'text-red-400'
                          }`}>
                            {selectedChapters.filter(id => id.startsWith(subject[0].toLowerCase())).length} Chapters Selected
                            {!hasChapterFromSubject(subject) && ' (Required)'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                          {expandedSubjects.includes(subject) ? 'HIDE UNITS' : 'SHOW UNITS'}
                        </span>
                      </div>
                    </div>
                  </button>
                  
                  {expandedSubjects.includes(subject) && (
                    <div className="mt-3 max-h-[200px] overflow-y-auto custom-scrollbar">
                      <div className="grid grid-cols-1 gap-2">
                        {chapters[subject].map((chapter) => (
                          <button
                            key={chapter.id}
                            onClick={() => handleChapterToggle(chapter.id)}
                            className={`p-3 rounded-lg text-left transition-all w-full hover:shadow-lg ${
                              selectedChapters.includes(chapter.id)
                                ? 'bg-gray-700 text-white shadow-md'
                                : 'text-gray-300 hover:bg-gray-700/50'
                            }`}
                          >
                            <span className="line-clamp-2 text-sm">{chapter.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Name your test</h2>
            <div className="space-y-2">

              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Enter test name"
                maxLength={45}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex justify-between text-sm">
                <p className="text-gray-400">Suggested name for your test</p>
                <p className="text-gray-400">{testName.length}/45</p>
              </div>
              <button
                onClick={() => setTestName('PC - Test 1')}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Click to use the name "PC - Test 1"
              </button>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Preview your test</h2>
            <div className="space-y-4 bg-gray-800/50 rounded-xl p-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white">{testName}</h3>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">{timeInMinutes} minutes</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-300">Questions</h4>
                <p className="text-gray-400">{questionCount} questions total</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Selected Chapters</h4>
                {selectedSubjects.map((subject) => (
                  <div key={subject} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${subject === 'Physics' ? 'bg-orange-500' : subject === 'Chemistry' ? 'bg-green-500' : 'bg-blue-500'}`} />
                      <span className="text-gray-300">{subject}</span>
                    </div>
                    <div className="pl-4 space-y-1">
                      {chapters[subject]
                        .filter((chapter) => selectedChapters.includes(chapter.id))
                        .map((chapter) => (
                          <p key={chapter.id} className="text-sm text-gray-400">{chapter.name}</p>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        // Only close if clicking the outer container
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      {/* Blur Background */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-lg mx-4 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gray-900 rounded-2xl shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
            <div 
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>

          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
            <h1 className="text-lg font-semibold text-white">Create your own test</h1>
            <button
              onClick={handleClose}
              className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 flex-grow overflow-hidden flex flex-col">
            {renderStep()}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-900 border-t border-gray-800">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {selectedSubjects.map((subject) => (
                    <span
                      key={subject}
                      className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-900 text-indigo-300"
                    >
                      {subject.slice(0, 3)}
                    </span>
                  ))}
                </div>
                {questionCount > 0 && (
                  <span className="text-sm text-gray-400">
                    {questionCount} Qs • {timeInMinutes} Mins
                  </span>
                )}
              </div>
              <div className="flex space-x-3">
                {step > 1 && (
                  <button
                    onClick={handlePrevious}
                    className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                  >
                    Previous
                  </button>
                )}
                <button
                  onClick={step === 6 ? () => {
                    onSubmit({ testName, selectedSubjects, questionCount, timeInMinutes, selectedChapters });
                    resetState();
                  } : handleNext}
                  disabled={!canProceed()}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    canProceed()
                      ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {step === 6 ? 'Create Test' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestModal;
