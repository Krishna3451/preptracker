import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { auth } from '../config/firebase';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Clock, ChevronLeft, ChevronRight, X, Flag } from 'lucide-react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import DOMPurify from 'dompurify';
import TestResults from './TestResults';

interface Question {
  _id: string;
  question: {
    text: string;
    image: string | null;
  };
  options: Array<{
    id: string;
    text: string;
    image: string | null;
    isCorrect: boolean;
  }>;
  solution: {
    text: string;
    image: string | null;
  };
  subjects: string[];
  approximateTimeRequired: number;
  chapters: string[];
}

interface TestInterfaceProps {
  testName: string;
  selectedChapters: string[];
  questionCount: { [key: string]: number };
  timeInMinutes: number;
  onComplete: () => void;
  onClose: () => void;
}

// Configuration for MathJax
const mathJaxConfig = {
  loader: { load: ["input/tex", "output/svg"] },
  tex: {
    inlineMath: [["$", "$"], ["\\(", "\\)"]],
    displayMath: [["$$", "$$"], ["\\[", "\\]"]],
    processEscapes: true,
    processEnvironments: true
  },
  svg: {
    fontCache: 'global'
  }
};

const TestInterface: React.FC<TestInterfaceProps> = ({
  testName,
  selectedChapters,
  questionCount,
  timeInMinutes,
  onComplete,
  onClose,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(timeInMinutes * 60);
  const [loading, setLoading] = useState(true);
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [activeSubject, setActiveSubject] = useState('physics');
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const subjectMapping = {
    'viQ2R4q7DVRyhecVTrSg': 'physics',
    'cZDUFeYGd0cIEPlWJJuz': 'chemistry',
    'oreFsSKPpPfrnxL8G1xf': 'biology'
  };

  const reverseSubjectMapping = {
    'physics': 'viQ2R4q7DVRyhecVTrSg',
    'chemistry': 'cZDUFeYGd0cIEPlWJJuz',
    'biology': 'oreFsSKPpPfrnxL8G1xf'
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsRef = collection(db, 'questions');
        const q = query(
          questionsRef,
          where('chapters', 'array-contains-any', selectedChapters)
        );
        const querySnapshot = await getDocs(q);
        const fetchedQuestions: { [key: string]: Question[] } = {
          physics: [],
          chemistry: [],
          biology: []
        };
        
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Question;
          const subjectId = data.subjects[0]; // Assuming one subject per question
          const subjectKey = subjectMapping[subjectId as keyof typeof subjectMapping];
          if (subjectKey) {
            fetchedQuestions[subjectKey].push({
              ...data,
              _id: doc.id,
            });
          }
        });

        // Shuffle and limit questions per subject
        const finalQuestions: Question[] = [];
        Object.entries(fetchedQuestions).forEach(([subject, questions]) => {
          const shuffled = questions.sort(() => 0.5 - Math.random());
          finalQuestions.push(...shuffled.slice(0, questionCount[subject] || 0));
        });

        setQuestions(finalQuestions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setLoading(false);
      }
    };

    if (selectedChapters.length > 0) {
      fetchQuestions();
    }
  }, [selectedChapters, questionCount]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const subjectId = q.subjects[0];
      return subjectMapping[subjectId as keyof typeof subjectMapping] === activeSubject;
    });
  }, [questions, activeSubject]);

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  const getQuestionStatus = (index: number) => {
    if (!filteredQuestions[index]) return 'not-visited';
    if (markedForReview.has(index)) return 'review';
    if (selectedAnswers[filteredQuestions[index]._id]) return 'answered';
    return 'not-visited';
  };

  useEffect(() => {
    if (timeLeft <= 0) {
      handleTestComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const calculateResults = () => {
    const results = {
      testName,
      totalQuestions: questions.length,
      attemptedQuestions: Object.keys(selectedAnswers).length,
      correctAnswers: 0,
      incorrectAnswers: 0,
      score: 0,
      timeSpent: timeInMinutes * 60 - timeLeft,
      subjectWiseAnalysis: {} as any,
      questions: [] as any[],
      timestamp: new Date(),
      userId: auth.currentUser?.uid
    };

    // Initialize subject-wise analysis
    const subjectAnalysis: { [key: string]: any } = {};
    Object.keys(subjectMapping).forEach(subjectId => {
      const subject = subjectMapping[subjectId as keyof typeof subjectMapping];
      subjectAnalysis[subject] = {
        total: 0,
        correct: 0,
        incorrect: 0,
        unattempted: 0,
        score: 0
      };
    });

    // Calculate results for each question
    questions.forEach(question => {
      const subjectId = question.subjects[0];
      const subject = subjectMapping[subjectId as keyof typeof subjectMapping];
      const selectedOption = selectedAnswers[question._id];
      const correctOption = question.options.find(opt => opt.isCorrect);
      
      subjectAnalysis[subject].total++;

      let score = 0;
      let isCorrect = false;

      if (selectedOption) {
        const selectedIsCorrect = question.options.find(
          opt => opt.id === selectedOption
        )?.isCorrect;

        if (selectedIsCorrect) {
          score = 4;
          results.correctAnswers++;
          subjectAnalysis[subject].correct++;
          isCorrect = true;
        } else {
          score = -1;
          results.incorrectAnswers++;
          subjectAnalysis[subject].incorrect++;
        }
      } else {
        subjectAnalysis[subject].unattempted++;
      }

      subjectAnalysis[subject].score += score;
      results.score += score;

      results.questions.push({
        question: question.question,
        selectedOption: selectedOption ? question.options.find(
          opt => opt.id === selectedOption
        )?.text : null,
        correctOption: correctOption?.text,
        score,
        subject
      });
    });

    results.subjectWiseAnalysis = subjectAnalysis;
    return results;
  };

  const handleTestComplete = async () => {
    const results = calculateResults();
    setTestResults(results);
    setShowResults(true);

    // Store results in Firebase
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      const db = getFirestore();
      const userTestsRef = collection(db, 'users', user.uid, 'tests');
      await addDoc(userTestsRef, results);
      console.log('Test results saved successfully');
    } catch (error) {
      console.error('Error storing test results:', error);
    }
  };

  const handleCloseResults = () => {
    setShowResults(false);
    onComplete();
  };

  const handleMarkForReview = () => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestionIndex)) {
        newSet.delete(currentQuestionIndex);
      } else {
        newSet.add(currentQuestionIndex);
      }
      return newSet;
    });
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const renderContent = (content: string) => {
    if (!content) return '';

    // First handle LaTeX expressions
    content = content.replace(/\\mathrm{([^}]+)}/g, (_, p1) => `\\text{${p1}}`);
    
    // Handle XML/MathML content
    if (content.includes('<math')) {
      // Replace HTML entities with their actual characters
      content = content.replace(/&(#?[a-zA-Z0-9]+);/g, (match, entity) => {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = match;
        return textarea.value;
      });

      return (
        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(content, {
              ADD_TAGS: [
                "math",
                "mi",
                "mn",
                "mo",
                "msub",
                "mrow",
                "msup",
                "mfrac",
                "mfenced",
                "mover",
                "br"
              ],
              ADD_ATTR: ['accent', 'mathvariant', 'xmlns', 'separators']
            })
          }}
        />
      );
    }

    // For regular LaTeX content
    return <MathJax inline>{content}</MathJax>;
  };

  const saveTestResults = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user || !user.uid) {
        console.error('No authenticated user found');
        return;
      }

      const results = {
        userId: user.uid,
        userEmail: user.email,
        testName,
        totalQuestions: questions.length,
        attemptedQuestions: Object.keys(selectedAnswers).length,
        correctAnswers: 0,
        incorrectAnswers: 0,
        score: 0,
        timeSpent: timeInMinutes * 60 - timeLeft,
        timestamp: serverTimestamp(),
        subjectWiseAnalysis: {} as any,
        questions: [] as any[],
      };

      // Initialize subject-wise analysis
      const subjectAnalysis: { [key: string]: any } = {};
      Object.keys(subjectMapping).forEach(subjectId => {
        const subject = subjectMapping[subjectId as keyof typeof subjectMapping];
        subjectAnalysis[subject] = {
          total: 0,
          correct: 0,
          incorrect: 0,
          unattempted: 0,
          score: 0
        };
      });

      // Calculate results for each question
      questions.forEach(question => {
        const subjectId = question.subjects[0];
        const subject = subjectMapping[subjectId as keyof typeof subjectMapping];
        const selectedOption = selectedAnswers[question._id];
        const correctOption = question.options.find(opt => opt.isCorrect);
        
        subjectAnalysis[subject].total++;

        let score = 0;
        let isCorrect = false;

        if (selectedOption) {
          const selectedIsCorrect = question.options.find(
            opt => opt.id === selectedOption
          )?.isCorrect;

          if (selectedIsCorrect) {
            score = 4;
            results.correctAnswers++;
            subjectAnalysis[subject].correct++;
            isCorrect = true;
          } else {
            score = -1;
            results.incorrectAnswers++;
            subjectAnalysis[subject].incorrect++;
          }
        } else {
          subjectAnalysis[subject].unattempted++;
        }

        subjectAnalysis[subject].score += score;
        results.score += score;

        results.questions.push({
          question: question.question,
          selectedOption: selectedOption ? question.options.find(
            opt => opt.id === selectedOption
          )?.text : null,
          correctOption: correctOption?.text,
          score,
          subject
        });
      });

      results.subjectWiseAnalysis = subjectAnalysis;

      const db = getFirestore();
      const userTestsRef = collection(db, 'users', user.uid, 'tests');
      await addDoc(userTestsRef, results);
      console.log('Test results saved successfully');
      onComplete();
    } catch (error) {
      console.error('Error storing test results:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="flex flex-col h-full bg-[#1a1b2e] text-white">
        {showResults ? (
          <TestResults results={testResults} onClose={handleCloseResults} />
        ) : (
          <>
            {/* Top Bar */}
            <div className="flex justify-between items-center px-4 py-3 bg-[#1a1b2e] border-b border-gray-800">
              <div className="flex items-center gap-4">
                <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  <span className="font-medium">
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => handleTestComplete()}
                className="px-4 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium"
              >
                Submit
              </button>
            </div>

            {/* Subject Tabs */}
            <div className="flex gap-4 px-4 py-2 bg-[#1a1b2e] border-b border-gray-800">
              {Object.keys(subjectMapping).map(subjectId => {
                const subject = subjectMapping[subjectId as keyof typeof subjectMapping];
                return (
                  <button
                    key={subject}
                    onClick={() => {
                      setActiveSubject(subject);
                      setCurrentQuestionIndex(0);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors
                      ${activeSubject === subject 
                        ? 'bg-indigo-500 text-white' 
                        : 'text-gray-400 hover:text-white'}`}
                  >
                    {subject.charAt(0).toUpperCase() + subject.slice(1)}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-1 min-h-0">
              {/* Main Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {currentQuestion ? (
                  <>
                    {/* Question Number and Status */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm text-gray-400">
                        Q{currentQuestionIndex + 1} of {filteredQuestions.length}
                      </span>
                      {markedForReview.has(currentQuestionIndex) && (
                        <span className="px-2 py-0.5 bg-purple-500 text-xs rounded-full">
                          Marked for Review
                        </span>
                      )}
                    </div>

                    {/* Question Content */}
                    <div className="bg-[#232438] p-6 rounded-xl mb-6">
                      {renderContent(currentQuestion.question.text)}
                      {currentQuestion.question.image && (
                        <img
                          src={currentQuestion.question.image}
                          alt="Question"
                          className="mt-4 rounded-lg max-w-full h-auto"
                        />
                      )}
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 gap-3">
                      {currentQuestion.options.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleAnswerSelect(currentQuestion._id, option.id)}
                          className={`p-4 rounded-xl text-left transition-all w-full border-2 ${
                            selectedAnswers[currentQuestion._id] === option.id
                              ? 'bg-indigo-500 border-indigo-500 text-white'
                              : 'bg-[#232438] border-transparent text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          {renderContent(option.text)}
                          {option.image && (
                            <img
                              src={option.image}
                              alt="Option"
                              className="mt-2 rounded-lg max-w-full h-auto"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">No questions available for this subject</p>
                  </div>
                )}
              </div>

              {/* Right Sidebar - Question Grid */}
              <div className="w-64 bg-[#232438] p-4 overflow-y-auto border-l border-gray-800">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">Overview</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>{filteredQuestions.filter(q => selectedAnswers[q._id]).length} Answered</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span>{markedForReview.size} Marked</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-1">
                  {filteredQuestions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`w-full aspect-square rounded flex items-center justify-center text-xs font-medium ${
                          index === currentQuestionIndex
                            ? 'bg-indigo-500 text-white'
                            : status === 'answered'
                            ? 'bg-green-500 text-white'
                            : status === 'review'
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="flex justify-between items-center p-4 bg-[#1a1b2e] border-t border-gray-800">
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-[#232438] text-white hover:bg-gray-700'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleMarkForReview}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg"
                >
                  <Flag className="w-4 h-4" />
                  Mark for Review & Next
                </button>
                
                <button
                  onClick={() => {
                    if (selectedAnswers[currentQuestion._id] && currentQuestionIndex < filteredQuestions.length - 1) {
                      setCurrentQuestionIndex(prev => prev + 1);
                    }
                  }}
                  className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100"
                >
                  Save & Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </MathJaxContext>
  );
};

export default TestInterface;
