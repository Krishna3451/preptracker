import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import TestInterface from './TestInterface';

interface Subject {
  id: string;
  name: string;
}

interface Chapter {
  id: string;
  name: string;
}

interface ChapterMap {
  [key: string]: Chapter[];
}

interface TestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (testConfig: TestConfig) => void;
}

interface TestConfig {
  testName: string;
  selectedSubjects: string[];
  questionCount: { [key: string]: number };
  timeInMinutes: number;
  selectedChapters: string[];
}

const TestModal: React.FC<TestModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [testName, setTestName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<{ [key: string]: number }>({
    physics: 10,
    chemistry: 10,
    biology: 10
  });
  const [timeInMinutes, setTimeInMinutes] = useState(60);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);
  const [showTest, setShowTest] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const subjects: Subject[] = [
    { id: 'viQ2R4q7DVRyhecVTrSg', name: 'Physics' },
    { id: 'cZDUFeYGd0cIEPlWJJuz', name: 'Chemistry' },
    { id: 'oreFsSKPpPfrnxL8G1xf', name: 'Biology' }
  ];

  const chapters: ChapterMap = {
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
      { id: 'OQt6gFATlMIP4F7xq5EI', name: 'Semiconductor' },
    ],
    Chemistry: [
      { id: 'xp236Zm1X8uC6WXrMWJW', name: 'Some Basic Concept of Chemistry' },
      { id: 'd0rjAMP9aiL3eMtxvQzQ', name: 'Structure of Atom' },
      { id: '3FKKTzEf5lYYRGGYEKoi', name: 'Classification of Elements & Periodicity' },
      { id: 'bqGcfblgDyQs8oscZO7g', name: 'Chemical Bonding' },
      { id: 'F5AMt08I1dWxE92TqnXG', name: 'Thermodynamics' },
      { id: 'VC0b3PGLapQc6QZ8qMo0', name: 'Chemical Equilibrium' },
      { id: 'CooCc5yQerI0KJOK7DX5', name: 'Ionic Equilibrium' },
      { id: '3cJOSV0IYMWFkBLQTihq', name: 'Redox Reactions' },
      { id: 'dCo74VhvuxhqXj7ayziF', name: 'p-Block Elements (Group 13 & 14)' },
      { id: 'MRH5jPRVrNXEy5FWkkaj', name: 'Organic Chemistry: Some Basic Principles & Techniques' },
      { id: 'vSbMVoLsvnUiuUNxTHaR', name: 'Hydrocarbons' },
      { id: 'envWb3qkC4ZSFHF8x5YN', name: 'Solutions' },
      { id: 'si8YKtWiT0Nq4780HQ1N', name: 'Electrochemistry' },
      { id: 'wORHNOk9YwmcLxEwMJIh', name: 'Chemical Kinetics' },
      { id: 'BAOozKNPPKT8v5dLhQma', name: 'p-Block Elements (Group 15,16,17,18)' },
      { id: 'F47iI14w5fJ8UVL7QKMq', name: 'd & f-Block Elements' },
      { id: 'bgsgtrD9C3YuMrElRAaP', name: 'Coordination Compounds' },
      { id: 'jPKiMSmjeEBEqfJHHuaY', name: 'Haloalkanes & Haloarenes' },
      { id: 'Jq8IHcWNp20VpqqQ8MGX', name: 'Alcohol, Phenol and Ether' },
      { id: 'cjB9VYoFMuM7GOMDNgIw', name: 'Aldehyde and Ketone' },
      { id: 'RIpPEjHn3ya3XwhtRGpn', name: 'Carboxylic Acid' },
      { id: 'sUVlUbJq5FF2c7u78K3Z', name: 'Amines' },
      { id: '6E42pG1feBYmk8936TDC', name: 'Biomolecules' },
      { id: 'NoknBR1tsG2t2stGYakP', name: 'Practical Chemistry' },
    ],
    Biology: [
      { id: '2taW41LFt0iepzmSW5dp', name: 'Living World' },
      { id: 'RInpuxI8yZlg8g2CQH9X', name: 'Biological Classification' },
      { id: 'xGxozQxQlknr79HVMpGq', name: 'Plant Kingdom' },
      { id: 'HLdG8QOaLN6jRK0kOXmt', name: 'Animal Kingdom' },
      { id: '18RcKG0WUOpF55rOyfn7', name: 'Morphology of Flowering Plants' },
      { id: 'hmn6nkqRgOWMFxuMA0fS', name: 'Anatomy of Flowering Plants' },
      { id: 'xsEE3r0oTvTZzfNvxnsV', name: 'Structural Organisation in Animals' },
      { id: 'on82g6JZA6gQfYogXIXR', name: 'Cell-The Unit of Life' },
      { id: '6E42pG1feBYmk8936TDC', name: 'Biomolecules' },
      { id: 'fkEmKXIOCRDB89PvzopA', name: 'Cell Cycle and Cell Division' },
      { id: 'sEN9klIaHwBbFxQ1odjs', name: 'Photosynthesis in Higher Plants' },
      { id: 'JwLTiaSSAE9WthRWu0vc', name: 'Respiration in Plants' },
      { id: 'UCHVQ7o08VB9vhDaoQhI', name: 'Plant Growth and Development' },
      { id: '41GVciLXfTb8tKfsYxXh', name: 'Breathing and Exchange of Gases' },
      { id: 'mdec58C1K9X2nKjsnodN', name: 'Body Fluids and Circulation' },
      { id: 'mJQyqnE8btj9OrHh9wyb', name: 'Excretory Products & their elimination' },
      { id: 'fShWgidyOZXvUENEMb7U', name: 'Locomotion and movements' },
      { id: 'dlFtAub7vsdivPTaUEZj', name: 'Neural Control and Coordination' },
      { id: 'xOzlIjIojGfglNXnLfBE', name: 'Chemical Coordination and Integration' },
      { id: 'EFUPD6oXL5mE4tDhGZ2J', name: 'Sexual Reproduction in Flowering Plants' },
      { id: 'UAbIQlLL9LKKx5xUnSxF', name: 'Human Reproduction' },
      { id: '8esVgAR8o4Tf6421LStz', name: 'Reproductive Health' },
      { id: 'bmcMW1ZMZ3iC6YU2amuF', name: 'Principles of Inheritance and Variation' },
      { id: 'yA68zTMIXPhRxJXMOC6J', name: 'Molecular Basis of Inheritance' },
      { id: 'cpAtTxCze7elufykaYvT', name: 'Evolution' },
      { id: 'I7cWp8TOqh3e2TZVWKuS', name: 'Human Health & Diseases' },
      { id: '58TFiidI5Ebor6rRpg0B', name: 'Microbes in human Welfare' },
      { id: '3EKGIuOyZTntGvGqqbL8', name: 'Biotechnology-Principles and Processes' },
      { id: 'K83Fd7MZKbEWL1rOfTBG', name: 'Biotechnology and Its Application' },
      { id: '4J5ttWw9nBmts4KINYME', name: 'Organism and Populations' },
      { id: 'H1ILjQHLuhzqDGd5ExVr', name: 'Ecosystem' },
      { id: '9ha53VSAXmKiG9pttUyx', name: 'Biodiversity and Conservation' },
    ],
  };

  const toggleSubjectExpansion = (subject: string) => {
    setExpandedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleSelectAllChapters = (subjectName: string) => {
    const subjectChapters = chapters[subjectName] || [];
    const allChapterIds = subjectChapters.map(chapter => chapter.id);
    
    // Check if all chapters are already selected
    const areAllSelected = allChapterIds.every(id => selectedChapters.includes(id));
    
    if (areAllSelected) {
      // Deselect all chapters for this subject
      setSelectedChapters(prev => 
        prev.filter(id => !allChapterIds.includes(id))
      );
    } else {
      // Select all chapters for this subject
      setSelectedChapters(prev => {
        const otherChapters = prev.filter(id => !allChapterIds.includes(id));
        return [...otherChapters, ...allChapterIds];
      });
    }
  };

  const resetState = () => {
    setStep(1);
    setTestName('');
    setSelectedSubjects([]);
    setQuestionCount({}); // Start with empty question count
    setTimeInMinutes(30); // Will be recalculated based on questions when needed
    setSelectedChapters([]);
    setExpandedSubjects([]);
    setShowTest(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleNext = () => {
    if (step < 6) {
      if (step === 2) {
        // Set initial time based on total questions when moving to time selection step
        const baseTime = calculateBaseTime();
        setTimeInMinutes(baseTime);
      }
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubjectToggle = (subjectName: string) => {
    setSelectedSubjects(prev => {
      const newSubjects = prev.includes(subjectName)
        ? prev.filter(s => s !== subjectName)
        : [...prev, subjectName];

      // Update question count when toggling subjects
      setQuestionCount(prevCount => {
        const newCount = { ...prevCount };
        if (!prev.includes(subjectName)) {
          // Adding a subject - initialize with 10 questions
          newCount[subjectName.toLowerCase()] = 10;
        } else {
          // Removing a subject - remove its count
          delete newCount[subjectName.toLowerCase()];
        }
        return newCount;
      });

      // Clear selected chapters for removed subject
      if (prev.includes(subjectName)) {
        const subjectChapters = chapters[subjectName] || [];
        const chapterIds = subjectChapters.map(chapter => chapter.id);
        setSelectedChapters(prevChapters => 
          prevChapters.filter(id => !chapterIds.includes(id))
        );
      }

      return newSubjects;
    });
  };

  const handleChapterSelect = (chapterId: string) => {
    setSelectedChapters(prev => {
      if (prev.includes(chapterId)) {
        return prev.filter(id => id !== chapterId);
      } else {
        return [...prev, chapterId];
      }
    });
  };

  // Calculate base time from total questions
  const calculateBaseTime = (): number => {
    return Object.values(questionCount).reduce((total, count) => total + count, 0);
  };

  // Handle time adjustment within ±10 minutes
  const handleTimeAdjustment = (adjustment: number) => {
    const baseTime = calculateBaseTime();
    const newTime = timeInMinutes + adjustment;
    const minTime = Math.max(baseTime - 10, 0);
    const maxTime = baseTime + 10;

    if (newTime >= minTime && newTime <= maxTime) {
      setTimeInMinutes(newTime);
    }
  };

  const hasChapterFromSubject = (subjectName: string) => {
    const subjectChapters = chapters[subjectName] || [];
    return selectedChapters.some(chapterId => 
      subjectChapters.some(chapter => chapter.id === chapterId)
    );
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return selectedSubjects.length > 0;
      case 2:
        return Object.values(questionCount).every(count => count > 0);
      case 3:
        return true;
      case 4:
        return selectedSubjects.every(subject => hasChapterFromSubject(subject));
      case 5:
        return testName.length > 0;
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleStartTest = () => {
    // Create a clean question count object with only selected subjects
    const filteredQuestionCount = selectedSubjects.reduce((acc, subject) => {
      acc[subject.toLowerCase()] = questionCount[subject.toLowerCase()] || 0;
      return acc;
    }, {} as { [key: string]: number });

    const config: TestConfig = {
      testName,
      selectedSubjects,
      questionCount: filteredQuestionCount,
      timeInMinutes,
      selectedChapters
    };
    console.log('Starting test with config:', config);
    
    // Start countdown timer
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(timer);
          setShowTest(true);
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  if (!isOpen) return null;

  if (countdown !== null && !showTest) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#1a1b2e] p-8 rounded-lg text-center space-y-4 border border-gray-700">
          <h3 className="text-xl font-semibold text-white">Keep your pen and paper ready!</h3>
          <div className="text-6xl font-bold text-indigo-500">{countdown}</div>
        </div>
      </div>
    );
  }

  if (showTest) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white w-full h-full p-4 rounded-lg relative">
          <TestInterface
            testName={testName}
            selectedChapters={selectedChapters}
            questionCount={questionCount}
            timeInMinutes={timeInMinutes}
            selectedSubjects={selectedSubjects}
            onComplete={() => {
              resetState();
              setShowTest(false);
              onClose();
            }}
            onClose={onClose}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 max-w-2xl p-6 rounded-lg relative">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Create Test</h2>
            <div className="text-sm text-gray-500">
              Step {step} of 6
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full mt-4">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>

        <div className="min-h-[300px]">
          {step === 1 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Select Subjects</h3>
              <div className="space-y-2">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => handleSubjectToggle(subject.name)}
                    className={`w-full p-3 rounded-lg border ${
                      selectedSubjects.includes(subject.name)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Questions per Subject</h3>
              <div className="grid gap-4">
                {selectedSubjects.map(subject => (
                  <div key={subject.toLowerCase()} className="flex items-center gap-4">
                    <label className="text-gray-300 w-24 capitalize">{subject}</label>
                    <input
                      type="number"
                      min="0"
                      value={questionCount[subject.toLowerCase()]}
                      onChange={(e) => setQuestionCount(prev => ({
                        ...prev,
                        [subject.toLowerCase()]: parseInt(e.target.value) || 0
                      }))}
                      className="bg-gray-800 text-white px-3 py-2 rounded-lg w-24"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Time Duration</h3>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-gray-600 mb-2">
                    Base time: {calculateBaseTime()} minutes
                  </div>
                  <div className="text-sm text-gray-500">
                    (1 minute per question)
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="flex items-center justify-center space-x-6">
                    <button
                      onClick={() => handleTimeAdjustment(-1)}
                      className="p-2 rounded-full hover:bg-gray-100 disabled:hover:bg-white"
                      disabled={timeInMinutes <= calculateBaseTime() - 10}
                    >
                      <ChevronLeft size={24} className={timeInMinutes <= calculateBaseTime() - 10 ? 'text-gray-300' : ''} />
                    </button>

                    <div className="flex items-center">
                      <Clock className="mr-3 text-blue-600" size={24} />
                      <span className="text-3xl font-bold text-gray-800">{timeInMinutes}</span>
                      <span className="ml-2 text-gray-600">minutes</span>
                    </div>

                    <button
                      onClick={() => handleTimeAdjustment(1)}
                      className="p-2 rounded-full hover:bg-gray-100 disabled:hover:bg-white"
                      disabled={timeInMinutes >= calculateBaseTime() + 10}
                    >
                      <ChevronRight size={24} className={timeInMinutes >= calculateBaseTime() + 10 ? 'text-gray-300' : ''} />
                    </button>
                  </div>

                  <div className="text-sm text-gray-500">
                    Time adjustment: {timeInMinutes - calculateBaseTime() > 0 ? '+' : ''}{timeInMinutes - calculateBaseTime()} minutes
                  </div>
                </div>

                <div className="text-center text-sm text-gray-500">
                  You can adjust the time by ±10 minutes
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Select Chapters</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {selectedSubjects.map((subjectName) => (
                  <div key={subjectName} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <button
                        onClick={() => toggleSubjectExpansion(subjectName)}
                        className="flex items-center space-x-2"
                      >
                        <ChevronRight
                          className={`transform transition-transform ${
                            expandedSubjects.includes(subjectName) ? 'rotate-90' : ''
                          }`}
                        />
                        <span className="font-semibold">{subjectName}</span>
                      </button>
                      <button
                        onClick={() => handleSelectAllChapters(subjectName)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {chapters[subjectName]?.every(chapter => 
                          selectedChapters.includes(chapter.id)
                        ) ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    {expandedSubjects.includes(subjectName) && (
                      <div className="mt-2 space-y-2 pl-6">
                        {chapters[subjectName]?.map((chapter) => (
                          <div key={chapter.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={chapter.id}
                              checked={selectedChapters.includes(chapter.id)}
                              onChange={() => handleChapterSelect(chapter.id)}
                              className="mr-2"
                            />
                            <label htmlFor={chapter.id}>{chapter.name}</label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Test Name</h3>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Enter test name"
                className="w-full p-3 border rounded-lg"
              />
            </div>
          )}

          {step === 6 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Review</h3>
              <div className="space-y-4">
                <div>
                  <span className="font-semibold">Test Name:</span> {testName}
                </div>
                <div>
                  <span className="font-semibold">Subjects:</span>{' '}
                  {selectedSubjects.join(', ')}
                </div>
                <div>
                  <span className="font-semibold">Questions:</span>{' '}
                  {Object.values(questionCount).join(', ')}
                </div>
                <div>
                  <span className="font-semibold">Time:</span> {timeInMinutes} minutes
                </div>
                <div>
                  <span className="font-semibold">Selected Chapters:</span>{' '}
                  {selectedChapters.length}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <button
              onClick={handlePrevious}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              Previous
            </button>
          ) : (
            <div></div>
          )}
          {step < 6 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`px-4 py-2 rounded-lg ${
                canProceed()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleStartTest}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
            >
              Start Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestModal;
