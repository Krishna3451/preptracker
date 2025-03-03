import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface ChapterProgress {
  name: string;
  theoryRevision: boolean;
  questionsPracticed: number;
}

export interface SubjectProgress {
  subject: string;
  chapters: ChapterProgress[];
  totalChapters: number;
}

const defaultChapters = {
  'Physics': 30,
  'Chemistry': 24,
  'Biology': 32
};

const initialProgress: SubjectProgress[] = [
  {
    subject: 'Biology',
    chapters: [],
    totalChapters: defaultChapters.Biology
  },
  {
    subject: 'Physics',
    chapters: [],
    totalChapters: defaultChapters.Physics
  },
  {
    subject: 'Chemistry',
    chapters: [],
    totalChapters: defaultChapters.Chemistry
  },
];

export const progressService = {
  async getUserProgress(userId: string): Promise<SubjectProgress[]> {
    try {
      const progressRef = doc(db, 'userProgress', userId);
      const progressDoc = await getDoc(progressRef);
      
      if (!progressDoc.exists()) {
        // Initialize progress for new users
        await setDoc(progressRef, { subjects: initialProgress });
        return initialProgress;
      }
      
      return progressDoc.data().subjects;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return initialProgress;
    }
  },

  async updateUserProgress(
    userId: string,
    update: {
      subject: string;
      chapter: string;
      theoryRevision: boolean;
      questionsPracticed: number;
    }
  ): Promise<void> {
    try {
      const progressRef = doc(db, 'userProgress', userId);
      const progressDoc = await getDoc(progressRef);
      
      if (!progressDoc.exists()) {
        // Initialize with default progress if document doesn't exist
        await setDoc(progressRef, { subjects: initialProgress });
      }
      
      const currentProgress = progressDoc.exists() 
        ? progressDoc.data().subjects 
        : initialProgress;

      const updatedProgress = currentProgress.map((item: SubjectProgress) => {
        if (item.subject !== update.subject) return item;

        const existingChapterIndex = item.chapters.findIndex(
          (ch) => ch.name === update.chapter
        );

        const updatedChapters = [...item.chapters];
        if (existingChapterIndex >= 0) {
          updatedChapters[existingChapterIndex] = {
            name: update.chapter,
            theoryRevision: update.theoryRevision,
            questionsPracticed: update.questionsPracticed,
          };
        } else {
          updatedChapters.push({
            name: update.chapter,
            theoryRevision: update.theoryRevision,
            questionsPracticed: update.questionsPracticed,
          });
        }

        return {
          ...item,
          chapters: updatedChapters,
        };
      });

      await updateDoc(progressRef, { subjects: updatedProgress });
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
  }
}; 