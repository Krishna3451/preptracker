import { db } from '../config/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export interface QuestionResult {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeTaken: number;
  chapter: string;
  subject: string;
}

export interface TestResult {
  id?: string;
  userId: string;
  testName: string;
  subjects: string[];
  score: number;
  totalQuestions: number;
  timestamp: string;
  correctAnswers: number;
  incorrectAnswers: number;
  timeTaken: number;
  questions: QuestionResult[];
}

export interface UserRank {
  rank: number;
  totalScore: number;
  totalTests: number;
  userName: string;
}

export interface SubjectAnalytics {
  subject: string;
  totalTests: number;
  averageScore: number;
  bestScore: number;
  weakChapters: string[];
  strongChapters: string[];
  totalTimeTaken: number;
  averageTimeTaken: number;
}

interface SubjectData {
  totalScore: number;
  totalTests: number;
  scores: number[];
  chapterScores: Map<string, number[]>;
  totalTime: number;
  times: number[];
}

export const getUserRank = async (userId: string): Promise<UserRank | null> => {
  try {
    // Get all users' scores
    const scoresRef = collection(db, 'testResults');
    const scoresQuery = query(scoresRef);
    const scoresSnapshot = await getDocs(scoresQuery);
    
    // Calculate total score for each user
    const userScores = new Map<string, { score: number; tests: number; name: string }>();
    
    await Promise.all(scoresSnapshot.docs.map(async doc => {
      const result = doc.data() as TestResult;
      const userRef = collection(db, 'users');
      const userQuery = query(userRef, where('uid', '==', result.userId));
      const userSnapshot = await getDocs(userQuery);
      const userName = userSnapshot.docs[0]?.data()?.name || 'Anonymous';
      
      const currentScore = userScores.get(result.userId);
      userScores.set(result.userId, {
        score: (currentScore?.score || 0) + result.score,
        tests: (currentScore?.tests || 0) + 1,
        name: userName
      });
    }));

    // Convert to array and sort by score
    const rankings = Array.from(userScores.entries())
      .map(([uid, data]) => ({
        userId: uid,
        totalScore: data.score,
        totalTests: data.tests,
        userName: data.name
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    // Find user's rank
    const userRankIndex = rankings.findIndex(rank => rank.userId === userId);
    if (userRankIndex === -1) return null;

    return {
      rank: userRankIndex + 1,
      totalScore: rankings[userRankIndex].totalScore,
      totalTests: rankings[userRankIndex].totalTests,
      userName: rankings[userRankIndex].userName
    };
  } catch (error) {
    console.error('Error getting user rank:', error);
    return null;
  }
};

// Utility functions for data validation and calculations
const validateTestResult = (result: TestResult): boolean => {
  if (!result || typeof result !== 'object') return false;
  if (!Array.isArray(result.questions) || !Array.isArray(result.subjects)) return false;
  if (typeof result.score !== 'number' || result.score < 0 || result.score > 100) return false;
  if (typeof result.timeTaken !== 'number' || result.timeTaken < 0) return false;
  if (typeof result.correctAnswers !== 'number' || result.correctAnswers < 0) return false;
  if (typeof result.totalQuestions !== 'number' || result.totalQuestions < 0) return false;
  if (result.correctAnswers > result.totalQuestions) return false;
  
  // Validate that the number of correct answers matches the questions array
  const actualCorrect = result.questions.filter(q => q.isCorrect).length;
  if (actualCorrect !== result.correctAnswers) return false;
  
  return true;
};

const roundToTwoDecimals = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

const calculateAverageWithVerification = (total: number, count: number): number => {
  if (count === 0) return 0;
  if (typeof total !== 'number' || typeof count !== 'number') return 0;
  const average = total / count;
  return roundToTwoDecimals(average);
};

export const getSubjectAnalytics = async (userId: string): Promise<SubjectAnalytics[]> => {
  if (!userId) throw new Error('User ID is required');

  try {
    const resultsRef = collection(db, 'testResults');
    const userResultsQuery = query(
      resultsRef, 
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const resultsSnapshot = await getDocs(userResultsQuery);
    
    const subjectData = new Map<string, SubjectData>();
    let invalidDataCount = 0;

    // Process all test results with validation
    resultsSnapshot.docs.forEach(doc => {
      const result = doc.data() as TestResult;
      
      // Skip invalid test results
      if (!validateTestResult(result)) {
        invalidDataCount++;
        console.error(`Invalid test result found: ${doc.id}`);
        return;
      }
      
      // Process each subject in the test
      result.subjects.forEach(subject => {
        const current = subjectData.get(subject) || {
          totalScore: 0,
          totalTests: 0,
          scores: [] as number[],
          chapterScores: new Map<string, number[]>(),
          totalTime: 0,
          times: [] as number[]
        };

        // Update aggregates with validation
        current.totalScore = roundToTwoDecimals(current.totalScore + result.score);
        current.totalTests++;
        current.scores.push(roundToTwoDecimals(result.score));
        current.totalTime = roundToTwoDecimals(current.totalTime + result.timeTaken);
        current.times.push(result.timeTaken);

        // Process chapter scores with validation
        const subjectQuestions = result.questions.filter(q => q.subject === subject);
        subjectQuestions.forEach(q => {
          if (!q.chapter) return; // Skip questions without chapter info
          
          const chapterScores = current.chapterScores.get(q.chapter) || [];
          const score = q.isCorrect ? 100 : 0;
          chapterScores.push(score);
          current.chapterScores.set(q.chapter, chapterScores);
        });

        subjectData.set(subject, current);
      });
    });

    if (invalidDataCount > 0) {
      console.warn(`Found ${invalidDataCount} invalid test results while processing analytics`);
    }

    // Convert to final analytics format with additional verification
    return Array.from(subjectData.entries()).map(([subject, data]) => {
      // Calculate metrics with verification
      const averageScore = calculateAverageWithVerification(data.totalScore, data.totalTests);
      const bestScore = data.scores.length > 0 ? Math.max(...data.scores) : 0;
      
      // Calculate chapter performance with verification
      const chapterPerformance = Array.from(data.chapterScores.entries())
        .filter(([_, scores]) => scores.length >= 3) // Only include chapters with sufficient data
        .map(([chapter, scores]) => ({
          chapter,
          average: calculateAverageWithVerification(
            scores.reduce((a, b) => a + b, 0),
            scores.length
          ),
          totalQuestions: scores.length
        }))
        .filter(cp => !isNaN(cp.average)); // Remove any invalid calculations

      // Sort chapters by average score with minimum question threshold
      const sortedByScore = [...chapterPerformance]
        .sort((a, b) => a.average - b.average);
      const sortedByScoreDesc = [...chapterPerformance]
        .sort((a, b) => b.average - a.average);

      return {
        subject,
        totalTests: data.totalTests,
        averageScore,
        bestScore,
        weakChapters: sortedByScore.slice(0, 3).map(cp => cp.chapter),
        strongChapters: sortedByScoreDesc.slice(0, 3).map(cp => cp.chapter),
        totalTimeTaken: roundToTwoDecimals(data.totalTime),
        averageTimeTaken: calculateAverageWithVerification(data.totalTime, data.totalTests)
      };
    });
  } catch (error) {
    console.error('Error getting subject analytics:', error);
    throw new Error('Failed to process analytics data accurately');
  }
};
