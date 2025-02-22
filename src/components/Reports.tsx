import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import DOMPurify from 'dompurify';

interface TestResult {
  id: string;
  testName: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  timeSpent: number;
  timestamp: any;
  questions: Array<{
    question: {
      text: string;
      image: string | null;
    };
    selectedOption: string | null;
    correctOption: string;
    score: number;
    subject: string;
  }>;
  subjectWiseAnalysis: {
    [key: string]: {
      total: number;
      correct: number;
      incorrect: number;
      unattempted: number;
      score: number;
    }
  };
}

const mathJaxConfig = {
  loader: { load: ["[tex]/html"] },
  tex: {
    packages: { "[+]": ["html"] },
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"]
    ],
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"]
    ]
  }
};

const Reports: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);

  useEffect(() => {
    fetchTestResults();
  }, []);

  const fetchTestResults = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        setError('Please log in to view your test reports');
        setLoading(false);
        return;
      }

      const db = getFirestore();
      const userTestsRef = collection(db, 'users', user.uid, 'tests');
      const q = query(userTestsRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const results: TestResult[] = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as TestResult);
      });

      setTestResults(results);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching test results:', error);
      setError('Failed to load test results');
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (testResults.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">No test results found</div>
      </div>
    );
  }

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Test Reports</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testResults.map((result) => (
            <div
              key={result.id}
              className="bg-[#232438] rounded-xl p-6 cursor-pointer hover:bg-[#2a2b44] transition-colors"
              onClick={() => setSelectedTest(result)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-white">{result.testName}</h3>
                <span className="text-sm text-gray-400">{formatDate(result.timestamp)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-400">Score</div>
                  <div className="text-2xl font-bold text-white">{result.score}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Time Taken</div>
                  <div className="text-2xl font-bold text-white">{formatTime(result.timeSpent)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Accuracy</div>
                  <div className="text-2xl font-bold text-white">
                    {((result.correctAnswers / result.attemptedQuestions) * 100 || 0).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Questions</div>
                  <div className="text-2xl font-bold text-white">
                    {result.attemptedQuestions}/{result.totalQuestions}
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-400">
                Click to view detailed report
              </div>
            </div>
          ))}
        </div>

        {selectedTest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#1a1b2e] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-800">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">{selectedTest.testName} - Detailed Report</h2>
                  <button
                    onClick={() => setSelectedTest(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Question-wise Analysis */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Question-wise Analysis</h3>
                  {selectedTest.questions.map((item, index) => (
                    <div key={index} className="bg-[#232438] p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="text-sm text-gray-400">Question {index + 1}</div>
                        <div className={`text-sm font-medium ${
                          item.score > 0 ? 'text-green-500' : item.score < 0 ? 'text-red-500' : 'text-gray-500'
                        }`}>
                          {item.score > 0 ? '+' : ''}{item.score}
                        </div>
                      </div>
                      <div className="text-white">
                        {renderContent(item.question.text)}
                      </div>
                      {item.question.image && (
                        <img src={item.question.image} alt="Question" className="max-w-full h-auto rounded-lg" />
                      )}
                      <div className="text-sm">
                        <span className="text-gray-400">Your Answer: </span>
                        <span className={`font-medium ${
                          item.score > 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {item.selectedOption ? renderContent(item.selectedOption) : 'Not attempted'}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-400">Correct Answer: </span>
                        <span className="text-green-500 font-medium">
                          {renderContent(item.correctOption)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MathJaxContext>
  );
};

export default Reports;
