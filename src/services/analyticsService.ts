import { db } from '../config/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export interface TestResult {
  userId: string;
  subject: string;
  chapter: string;
  score: number;
  totalQuestions: number;
  timestamp: string;
  correctAnswers: number;
  incorrectAnswers: number;
  timeTaken: number;
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

export const getSubjectAnalytics = async (userId: string): Promise<SubjectAnalytics[]> => {
  try {
    const resultsRef = collection(db, 'testResults');
    const userResultsQuery = query(resultsRef, where('userId', '==', userId));
    const resultsSnapshot = await getDocs(userResultsQuery);
    
    const subjectData = new Map<string, {
      totalScore: number;
      totalTests: number;
      scores: number[];
      chapterScores: Map<string, number[]>;
      totalTime: number;
      times: number[];
    }>();

    // Process all test results
    resultsSnapshot.docs.forEach(doc => {
      const result = doc.data() as TestResult;
      const current = subjectData.get(result.subject) || {
        totalScore: 0,
        totalTests: 0,
        scores: [],
        chapterScores: new Map(),
        totalTime: 0,
        times: []
      };

      current.totalScore += result.score;
      current.totalTests += 1;
      current.scores.push(result.score);
      current.totalTime += result.timeTaken;
      current.times.push(result.timeTaken);

      const chapterScores = current.chapterScores.get(result.chapter) || [];
      chapterScores.push(result.score);
      current.chapterScores.set(result.chapter, chapterScores);

      subjectData.set(result.subject, current);
    });

    // Convert to final analytics format
    return Array.from(subjectData.entries()).map(([subject, data]) => {
      const averageScore = data.totalScore / data.totalTests;
      const bestScore = Math.max(...data.scores);
      
      // Calculate chapter performance
      const chapterPerformance = Array.from(data.chapterScores.entries()).map(([chapter, scores]) => ({
        chapter,
        average: scores.reduce((a, b) => a + b, 0) / scores.length
      }));

      // Sort chapters by average score
      chapterPerformance.sort((a, b) => a.average - b.average);

      return {
        subject,
        totalTests: data.totalTests,
        averageScore,
        bestScore,
        weakChapters: chapterPerformance.slice(0, 3).map(cp => cp.chapter),
        strongChapters: chapterPerformance.slice(-3).map(cp => cp.chapter),
        totalTimeTaken: data.totalTime,
        averageTimeTaken: data.totalTime / data.totalTests
      };
    });
  } catch (error) {
    console.error('Error getting subject analytics:', error);
    return [];
  }
};
