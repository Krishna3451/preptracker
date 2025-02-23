import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc, orderBy } from 'firebase/firestore';
import { TestResult } from './analyticsService';

export const saveTestResult = async (testResult: TestResult): Promise<string> => {
  try {
    const testResultsRef = collection(db, 'testResults');
    const docRef = await addDoc(testResultsRef, {
      ...testResult,
      timestamp: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving test result:', error);
    throw error;
  }
};

export const getTestResult = async (testId: string): Promise<TestResult | null> => {
  try {
    const testResultRef = doc(db, 'testResults', testId);
    const testResultDoc = await getDoc(testResultRef);
    
    if (testResultDoc.exists()) {
      return { id: testResultDoc.id, ...testResultDoc.data() } as TestResult;
    }
    return null;
  } catch (error) {
    console.error('Error getting test result:', error);
    throw error;
  }
};

export const getUserTestResults = async (userId: string): Promise<TestResult[]> => {
  try {
    const testResultsRef = collection(db, 'testResults');
    const q = query(
      testResultsRef,
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as TestResult)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error('Error getting user test results:', error);
    throw error;
  }
};
