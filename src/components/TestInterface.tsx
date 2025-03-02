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
  selectedSubjects: string[];
}

interface SubjectAnalysis {
  total: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  score: number;
}

interface TestQuestion {
  question: {
    text: string;
    image: string | null;
  };
  selectedOption: string | null;
  correctOption: string;
  score: number;
  subject: string;
  isCorrect: boolean;
}

interface TestResults {
  testName: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  timeSpent: number;
  subjectWiseAnalysis: Record<string, SubjectAnalysis>;
  questions: TestQuestion[];
  timestamp: Date;
  userId: string | undefined;
}

// Configuration for MathJax
const mathJaxConfig = {
  loader: { load: ["input/tex", "output/svg", "input/mml"] },
  tex: {
    inlineMath: [["$", "$"], ["\\(", "\\)"]],
    displayMath: [["$$", "$$"], ["\\[", "\\]"]],
    processEscapes: true,
    processEnvironments: true
  },
  svg: {
    fontCache: 'global'
  },
  options: {
    enableMenu: false, // Disable the MathJax menu for cleaner UI
    renderActions: {
      addMenu: [], // Disable menu items
      checkLoading: []
    }
  }
};

const TestInterface: React.FC<TestInterfaceProps> = ({
  testName,
  selectedChapters,
  questionCount,
  timeInMinutes,
  onComplete,
  onClose,
  selectedSubjects,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(timeInMinutes * 60);
  const [loading, setLoading] = useState(true);
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [activeSubject, setActiveSubject] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showMobileOverview, setShowMobileOverview] = useState(false);

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

  // Set initial active subject
  useEffect(() => {
    const subjects = Object.keys(questionCount);
    if (subjects.length > 0) {
      setActiveSubject(subjects[0]);
    }
  }, [questionCount]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsRef = collection(db, 'questions');
        const fetchedQuestions: { [key: string]: Question[] } = {
          physics: [],
          chemistry: [],
          biology: []
        };

        // Split selectedChapters into chunks of 30 (Firebase's limit)
        const chapterChunks = [];
        for (let i = 0; i < selectedChapters.length; i += 30) {
          chapterChunks.push(selectedChapters.slice(i, i + 30));
        }

        // Fetch questions for each chunk
        for (const chapterChunk of chapterChunks) {
          const q = query(
            questionsRef,
            where('chapters', 'array-contains-any', chapterChunk)
          );
          const querySnapshot = await getDocs(q);
          
          querySnapshot.forEach((doc) => {
            const data = doc.data() as Question;
            const subjectId = data.subjects[0]; // Assuming one subject per question
            const subjectKey = subjectMapping[subjectId as keyof typeof subjectMapping];
            if (subjectKey) {
              // Avoid duplicate questions
              if (!fetchedQuestions[subjectKey].some(q => q._id === doc.id)) {
                fetchedQuestions[subjectKey].push({
                  ...data,
                  _id: doc.id,
                });
              }
            }
          });
        }

        // Shuffle and limit questions per subject
        const finalQuestions: Question[] = [];
        Object.entries(fetchedQuestions).forEach(([subject, questions]) => {
          if (questionCount[subject]) {
            const shuffled = questions.sort(() => 0.5 - Math.random());
            const selectedCount = Math.min(questionCount[subject], shuffled.length);
            finalQuestions.push(...shuffled.slice(0, selectedCount));
          }
        });

        if (finalQuestions.length === 0) {
          console.warn('No questions found for the selected chapters');
        }

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
    const results: TestResults = {
      testName,
      totalQuestions: questions.length,
      attemptedQuestions: Object.keys(selectedAnswers).length,
      correctAnswers: 0,
      incorrectAnswers: 0,
      score: 0,
      timeSpent: timeInMinutes * 60 - timeLeft,
      subjectWiseAnalysis: {},
      questions: [],
      timestamp: new Date(),
      userId: auth.currentUser?.uid
    };

    // Initialize subject-wise analysis
    const subjectAnalysis: Record<string, SubjectAnalysis> = {};
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
        subject,
        isCorrect
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

      const testResult = {
        userId: user.uid,
        testName,
        subjects: Object.keys(questionCount),
        score: results.score,
        totalQuestions: results.totalQuestions,
        timestamp: new Date().toISOString(),
        correctAnswers: results.correctAnswers,
        incorrectAnswers: results.incorrectAnswers,
        timeTaken: timeInMinutes * 60 - timeLeft,
        questions: results.questions.map((q: any) => ({
          question: q.question.text,
          userAnswer: q.selectedOption || '',
          correctAnswer: q.correctOption,
          isCorrect: q.score > 0,
          timeTaken: Math.round((timeInMinutes * 60 - timeLeft) / results.totalQuestions), // approximate time per question
          chapter: questions.find(origQ => origQ.question.text === q.question.text)?.chapters[0] || '',
          subject: q.subject
        }))
      };

      const testResultsRef = collection(db, 'testResults');
      await addDoc(testResultsRef, testResult);
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

  // Utility function to convert problematic MathML in the content to LaTeX
  const fixMathMLToLatex = (content: string): string => {
    if (!content.includes('<math')) return content;
    
    try {
      // Handle the case of three stars temperature problem
      if (content.includes('Three stars') && content.includes('temperature')) {
        return content.replace(
          /<math[^>]*>[\s\S]*?<\/math>/g, 
          (match) => {
            if (match.includes('A</mi>') || match.includes('B</mi>') || match.includes('C</mi>')) {
              // Replace the entire MathML with a simpler LaTeX representation
              return match.includes('A</mi>') ? '$T_A$' :
                     match.includes('B</mi>') ? '$T_B$' : 
                     match.includes('C</mi>') ? '$T_C$' : match;
            }
            return match;
          }
        );
      }
      
      // Handle metal rod heat flow problem
      if (content.includes('metal rod') && content.includes('heat flow')) {
        return content.replace(
          /<math[^>]*>[\s\S]*?<\/math>/g, 
          (match) => {
            if (match.includes('J') || match.includes('mn>4.0')) {
              // Handle specific complex MathML structures by converting to LaTeX
              return match.includes('J') ? '$J$' : 
                     match.includes('mn>4.0') ? '$4.0$' : match;
            }
            return match;
          }
        );
      }
      
      // General handling for square loops and current
      if (content.includes('square loop') && content.includes('current')) {
        return content.replace(
          /<math[^>]*>[\s\S]*?<\/math>/g, 
          (match) => {
            if (match.includes('<mrow><mn>2</mn>') || match.includes('mu</mi>')) {
              return match.includes('<mrow><mn>2</mn>') ? '$2$' : 
                     match.includes('i</mi>') ? '$i$' : match;
            }
            return match;
          }
        );
      }
    } catch (e) {
      console.error("Error fixing MathML:", e);
    }
    
    return content;
  };

  const renderContent = (content: string) => {
    if (!content) return '';

    // Apply the MathML fix first
    content = fixMathMLToLatex(content);
    
    // First handle LaTeX expressions
    content = content.replace(/\\mathrm{([^}]+)}/g, (_, p1) => `\\text{${p1}}`);
    
    // Handle XML/MathML content
    if (content.includes('<math')) {
      // First decode HTML entities in the content
      const decodedContent = content.replace(/&(#?[a-zA-Z0-9]+);/g, (match, entity) => {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = match;
        return textarea.value;
      });

      // Fix any malformed tags and ensure proper XML structure
      let fixedContent = decodedContent;
      
      // Make sure all math tags have proper xmlns attribute
      if (!fixedContent.includes('xmlns="http://www.w3.org/1998/Math/MathML"')) {
        fixedContent = fixedContent.replace(/<math/g, '<math xmlns="http://www.w3.org/1998/Math/MathML"');
      }
      
      // Ensure all opening tags have closing tags
      const tags = ['mi', 'mo', 'mn', 'msub', 'msup', 'mtext', 'mspace', 'mrow', 'mfrac', 'mfenced', 'mover'];
      tags.forEach(tag => {
        // Replace self-closing tags with proper opening and closing tags
        const selfClosingPattern = new RegExp(`<${tag}([^>]*)/>`, 'g');
        fixedContent = fixedContent.replace(selfClosingPattern, `<${tag}$1></${tag}>`);
        
        // Make sure there's a closing tag for each opening tag
        const openingTags = (fixedContent.match(new RegExp(`<${tag}(?!\\w)`, 'g')) || []).length;
        const closingTags = (fixedContent.match(new RegExp(`</${tag}>`, 'g')) || []).length;
        
        if (openingTags > closingTags) {
          // Add missing closing tags
          for (let i = 0; i < openingTags - closingTags; i++) {
            fixedContent = fixedContent + `</${tag}>`;
          }
        }
      });

      return (
        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(fixedContent, {
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
                "mtext",
                "mspace",
                "br"
              ],
              ADD_ATTR: ['accent', 'mathvariant', 'xmlns', 'separators', 'stretchy', 'open', 'close']
            })
          }}
        />
      );
    }

    // For regular LaTeX content
    return <MathJax inline dynamic>{content}</MathJax>;
  };

  const saveTestResults = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user || !user.uid) {
        console.error('No authenticated user found');
        return;
      }

      const results: TestResults = {
        userId: user.uid,
        testName,
        totalQuestions: questions.length,
        attemptedQuestions: Object.keys(selectedAnswers).length,
        correctAnswers: 0,
        incorrectAnswers: 0,
        score: 0,
        timeSpent: timeInMinutes * 60 - timeLeft,
        timestamp: new Date(),
        subjectWiseAnalysis: {} as Record<string, SubjectAnalysis>,
        questions: [],
      };

      // Initialize subject-wise analysis
      const subjectAnalysis: Record<string, SubjectAnalysis> = {};
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

        const selectedOptionText = selectedOption
          ? (question.options.find(opt => opt.id === selectedOption)?.text ?? null)
          : null;
        
        if (!correctOption) {
          console.error('No correct option found for question:', question._id);
          return;
        }

        results.questions.push({
          question: question.question,
          selectedOption: selectedOptionText,
          correctOption: correctOption.text,
          score,
          subject,
          isCorrect
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

  const filteredSubjects = selectedSubjects.map(s => s.toLowerCase());

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
        <style jsx global>{`
          /* Add custom styles for math rendering */
          .MathJax {
            vertical-align: middle !important;
          }
          math {
            display: inline-block;
            font-size: 1em;
            line-height: 1.5em;
            vertical-align: middle;
            margin: 0 0.2em;
          }
          mi, mo, mn, msub, msup, mfrac {
            padding: 0.1em;
          }
        `}</style>
        {showResults ? (
          <TestResults results={testResults!} onClose={handleCloseResults} />
        ) : (
          <>
            {/* Top Bar */}
            <div className="flex justify-between items-center px-4 py-3 bg-[#1a1b2e] border-b border-gray-800">
              <div className="flex items-center gap-4">
                <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg md:block hidden">
                  <X className="w-5 h-5" />
                </button>
                <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg md:hidden">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  <span className="font-medium">
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile Overview Toggle Button */}
                <button 
                  onClick={() => setShowMobileOverview(!showMobileOverview)}
                  className="md:hidden p-2 hover:bg-gray-800 rounded-lg flex items-center gap-1"
                >
                  <Flag className="w-5 h-5" />
                  <span className="text-xs">Overview</span>
                </button>
                <button 
                  onClick={() => setShowConfirmDialog(true)}
                  className="px-4 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium"
                >
                  Submit Test
                </button>
              </div>

              {/* Custom Confirmation Dialog */}
              {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-[#1a1b2e] p-6 rounded-lg max-w-md w-full mx-4 border border-gray-700">
                    <h3 className="text-xl font-semibold mb-4">Confirm Test Submission</h3>
                    
                    <div className="space-y-3 mb-6">
                      <p className="text-gray-300">Are you sure you want to submit the test?</p>
                      
                      <div className="bg-[#232438] p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span>Total Questions:</span>
                          <span className="font-semibold">{questions.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Attempted:</span>
                          <span className="font-semibold text-green-400">{Object.keys(selectedAnswers).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Unattempted:</span>
                          <span className="font-semibold text-yellow-400">{questions.length - Object.keys(selectedAnswers).length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setShowConfirmDialog(false)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setShowConfirmDialog(false);
                          handleTestComplete();
                        }}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Subject Tabs */}
            <div className="flex gap-4 px-4 py-2 bg-[#1a1b2e] border-b border-gray-800 overflow-x-auto whitespace-nowrap">
              {filteredSubjects.map(subject => {
                const questionsCount = questions.filter(q => {
                  const subjectId = q.subjects[0];
                  return subjectMapping[subjectId as keyof typeof subjectMapping] === subject;
                }).length;
                
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
                    <span className="ml-2 text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                      {questionsCount}
                    </span>
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
                    
                    {/* Mobile Overview Modal */}
                    {showMobileOverview && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 md:hidden">
                        <div className="bg-[#1a1b2e] p-6 rounded-lg max-w-md w-full mx-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Test Overview</h3>
                            <button 
                              onClick={() => setShowMobileOverview(false)}
                              className="p-2 hover:bg-gray-800 rounded-lg"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          
                          <div className="mb-4">
                            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span>{filteredQuestions.filter(q => selectedAnswers[q._id]).length} Answered</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                <span>{markedForReview.size} Marked</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-6 gap-1">
                              {filteredQuestions.map((_, index) => {
                                const status = getQuestionStatus(index);
                                return (
                                  <button
                                    key={index}
                                    onClick={() => {
                                      setCurrentQuestionIndex(index);
                                      setShowMobileOverview(false);
                                    }}
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
                          
                          <button
                            onClick={() => setShowMobileOverview(false)}
                            className="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white"
                          >
                            Continue Test
                          </button>
                        </div>
                      </div>
                    )}

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
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        {selectedAnswers[currentQuestion._id] && (
                          <button
                            onClick={() => {
                              const newAnswers = { ...selectedAnswers };
                              delete newAnswers[currentQuestion._id];
                              setSelectedAnswers(newAnswers);
                            }}
                            className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            Clear Response
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {currentQuestion.options.map((option) => (
                          <div
                            key={option.id}
                            onClick={() => {
                              // Just update the temporary selection
                              setSelectedAnswers(prev => ({
                                ...prev,
                                [currentQuestion._id]: option.id
                              }));
                            }}
                            className={`p-4 rounded-xl text-left transition-all w-full border-2 cursor-pointer ${
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
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">No questions available for this subject</p>
                  </div>
                )}
              </div>

              {/* Right Sidebar - Question Grid (Hidden on Mobile) */}
              <div className="w-64 bg-[#232438] p-4 overflow-y-auto border-l border-gray-800 hidden md:block">
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

              <div className="flex items-center gap-4">
                <button
                  onClick={handleMarkForReview}
                  className={`px-4 py-2 rounded-lg ${markedForReview.has(currentQuestionIndex) ? 'bg-yellow-500 text-white' : 'text-yellow-500 border border-yellow-500'}`}
                >
                  {markedForReview.has(currentQuestionIndex) ? 'Marked for Review' : 'Mark for Review'}
                </button>

                <button
                  onClick={() => {
                    if (selectedAnswers[currentQuestion._id]) {
                      handleAnswerSelect(currentQuestion._id, selectedAnswers[currentQuestion._id]);
                      if (currentQuestionIndex < filteredQuestions.length - 1) {
                        setCurrentQuestionIndex(prev => prev + 1);
                      } else {
                        setShowConfirmDialog(true);
                      }
                    }
                  }}
                  className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${selectedAnswers[currentQuestion._id] ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-gray-500'}`}
                >
                  {currentQuestionIndex === filteredQuestions.length - 1 ? 'Save & Finish' : 'Save & Next'}
                  <ChevronRight className="w-5 h-5" />
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
