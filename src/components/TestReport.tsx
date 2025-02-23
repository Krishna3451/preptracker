import React from 'react';
import { Clock, Target, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface QuestionResult {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeTaken: number;
  chapter: string;
  subject: string;
}

interface TestReportProps {
  testName: string;
  timestamp: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeTaken: number;
  score: number;
  questions: QuestionResult[];
}

const TestReport: React.FC<TestReportProps> = ({
  testName,
  timestamp,
  totalQuestions,
  correctAnswers,
  incorrectAnswers,
  timeTaken,
  score,
  questions
}) => {
  // Group questions by subject and chapter
  const questionsBySubject = questions.reduce((acc, question) => {
    if (!acc[question.subject]) {
      acc[question.subject] = {
        total: 0,
        correct: 0,
        chapters: {}
      };
    }
    
    if (!acc[question.subject].chapters[question.chapter]) {
      acc[question.subject].chapters[question.chapter] = {
        total: 0,
        correct: 0,
        questions: []
      };
    }
    
    acc[question.subject].total++;
    if (question.isCorrect) acc[question.subject].correct++;
    
    acc[question.subject].chapters[question.chapter].total++;
    if (question.isCorrect) acc[question.subject].chapters[question.chapter].correct++;
    acc[question.subject].chapters[question.chapter].questions.push(question);
    
    return acc;
  }, {} as Record<string, {
    total: number;
    correct: number;
    chapters: Record<string, {
      total: number;
      correct: number;
      questions: QuestionResult[];
    }>;
  }>);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{testName}</h2>
          <p className="text-sm text-gray-500">{new Date(timestamp).toLocaleString()}</p>
        </div>
        <div className="text-3xl font-bold text-blue-600">{score.toFixed(1)}%</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">Total Questions</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">Correct</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium">Incorrect</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{incorrectAnswers}</div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium">Time Taken</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(questionsBySubject).map(([subject, data]) => (
          <div key={subject} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{subject}</h3>
              <div className="text-sm">
                Score: {((data.correct / data.total) * 100).toFixed(1)}%
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(data.chapters).map(([chapter, chapterData]) => (
                <div key={chapter} className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{chapter}</h4>
                    <div className="text-sm">
                      {chapterData.correct}/{chapterData.total} correct
                    </div>
                  </div>

                  <div className="space-y-2">
                    {chapterData.questions.map((question, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          question.isCorrect ? 'bg-green-50' : 'bg-red-50'
                        }`}
                      >
                        <p className="font-medium mb-2">{question.question}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Your Answer: </span>
                            <span className={question.isCorrect ? 'text-green-600' : 'text-red-600'}>
                              {question.userAnswer}
                            </span>
                          </div>
                          {!question.isCorrect && (
                            <div>
                              <span className="text-gray-600">Correct Answer: </span>
                              <span className="text-green-600">{question.correctAnswer}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Time taken: {question.timeTaken}s
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestReport;
