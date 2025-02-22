import React from 'react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import DOMPurify from 'dompurify';

interface TestResultsProps {
  results: {
    testName: string;
    totalQuestions: number;
    attemptedQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    score: number;
    timeSpent: number;
    subjectWiseAnalysis: {
      [key: string]: {
        total: number;
        correct: number;
        incorrect: number;
        unattempted: number;
        score: number;
      }
    };
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
  };
  onClose: () => void;
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

const TestResults: React.FC<TestResultsProps> = ({ results, onClose }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const renderContent = (content: string) => {
    if (!content) return 'Not attempted';

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

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-[#1a1b2e] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-800">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">{results.testName} - Results</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Overall Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#232438] p-4 rounded-xl">
                <div className="text-gray-400 text-sm">Total Score</div>
                <div className="text-2xl font-bold text-white">{results.score}</div>
              </div>
              <div className="bg-[#232438] p-4 rounded-xl">
                <div className="text-gray-400 text-sm">Time Taken</div>
                <div className="text-2xl font-bold text-white">{formatTime(results.timeSpent)}</div>
              </div>
              <div className="bg-[#232438] p-4 rounded-xl">
                <div className="text-gray-400 text-sm">Accuracy</div>
                <div className="text-2xl font-bold text-white">
                  {((results.correctAnswers / results.attemptedQuestions) * 100 || 0).toFixed(1)}%
                </div>
              </div>
              <div className="bg-[#232438] p-4 rounded-xl">
                <div className="text-gray-400 text-sm">Questions Attempted</div>
                <div className="text-2xl font-bold text-white">
                  {results.attemptedQuestions}/{results.totalQuestions}
                </div>
              </div>
            </div>

            {/* Subject-wise Analysis */}
            <div className="bg-[#232438] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Subject-wise Analysis</h3>
              <div className="space-y-4">
                {Object.entries(results.subjectWiseAnalysis).map(([subject, analysis]) => (
                  <div key={subject} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 capitalize">{subject}</span>
                      <span className="text-white font-medium">Score: {analysis.score}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-gray-400">Correct: {analysis.correct}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-gray-400">Incorrect: {analysis.incorrect}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        <span className="text-gray-400">Unattempted: {analysis.unattempted}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Question-wise Analysis */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Question-wise Analysis</h3>
              {results.questions.map((item, index) => (
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
    </MathJaxContext>
  );
};

export default TestResults;
