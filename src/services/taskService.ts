import { db } from '../config/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { Task } from '../components/TaskCalendar';

const TASKS_COLLECTION = 'tasks';

export const addTask = async (userId: string, task: Omit<Task, 'id'>) => {
  const tasksRef = collection(db, TASKS_COLLECTION);
  const docRef = await addDoc(tasksRef, {
    ...task,
    userId,
    createdAt: new Date().toISOString()
  });
  return { ...task, id: docRef.id };
};

export const getUserTasks = async (userId: string): Promise<Task[]> => {
  const tasksRef = collection(db, TASKS_COLLECTION);
  const q = query(tasksRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as Omit<Task, 'id'>
  }));
};

export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  await updateDoc(taskRef, updates);
  const updatedDoc = await getDoc(taskRef);
  return { id: updatedDoc.id, ...updatedDoc.data() } as Task;
};

export const deleteTask = async (taskId: string) => {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  await deleteDoc(taskRef);
};
