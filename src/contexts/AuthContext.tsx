import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, User, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, deleteDoc, collection, query, where, serverTimestamp } from 'firebase/firestore';

interface AdminUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  addedBy: string;
  addedAt: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  adminUsers: AdminUser[];
  testCount: number;
  remainingTests: number;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  addAdminUser: (email: string) => Promise<void>;
  removeAdminUser: (uid: string) => Promise<void>;
  checkAdminStatus: (uid: string) => Promise<boolean>;
  checkAndUpdateTestCount: () => Promise<boolean>;
  incrementTestCount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [testCount, setTestCount] = useState(0);
  const MAX_FREE_TESTS = 3;
  const remainingTests = Math.max(0, MAX_FREE_TESTS - testCount);

  // Fetch all admin users from Firestore
  const fetchAdminUsers = async () => {
    try {
      const adminsCollection = collection(db, 'admins');
      const adminSnapshot = await getDocs(adminsCollection);
      const adminList = adminSnapshot.docs.map(doc => ({
        ...doc.data()
      })) as AdminUser[];
      setAdminUsers(adminList);
    } catch (error) {
      console.error('Error fetching admin users:', error);
    }
  };

  // Check if a user is an admin
  const checkAdminStatus = async (uid: string): Promise<boolean> => {
    try {
      // Check if user is the super admin
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists() && userDoc.data().email === 'goyalmayank300@gmail.com') {
        return true;
      }
      
      // Check if user is in admins collection
      const adminDoc = await getDoc(doc(db, 'admins', uid));
      return adminDoc.exists();
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  useEffect(() => {
    // Check for cached user data in localStorage
    const cachedUser = localStorage.getItem('authUser');
    if (cachedUser) {
      try {
        const parsedUser = JSON.parse(cachedUser);
        // Only use cached data temporarily while waiting for Firebase
        if (!user) {
          console.log('Using cached user data while authenticating');
          // We can't directly set the User object due to methods, but we can show loading state
          setLoading(true);
        }
      } catch (error) {
        console.error('Error parsing cached user:', error);
        localStorage.removeItem('authUser');
      }
    }

    // Set up Firebase auth state listener
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Save minimal user data to localStorage for persistence
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        };
        localStorage.setItem('authUser', JSON.stringify(userData));
        
        // Check if user exists in Firestore and update last login
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            // Update last login time
            await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
          } else {
            // Create new user document if it doesn't exist
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              lastLogin: serverTimestamp(),
              createdAt: serverTimestamp(),
            });
          }
          
          // Check if user is an admin
          const isUserAdmin = await checkAdminStatus(firebaseUser.uid);
          setIsAdmin(isUserAdmin);
          
          // Check if user is the super admin
          setIsSuperAdmin(firebaseUser.email === 'goyalmayank300@gmail.com');
          
          // Fetch admin users if the current user is an admin
          if (isUserAdmin) {
            await fetchAdminUsers();
          }
        } catch (error) {
          console.error('Error updating user data:', error);
        }
      } else {
        // Clear cached user data when signed out
        localStorage.removeItem('authUser');
      }
      
      setUser(firebaseUser);
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);
  
  // Load test count when user changes
  useEffect(() => {
    if (user && !isAdmin) {
      const loadTestCount = async () => {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setTestCount(userData.testCount || 0);
          } else {
            setTestCount(0);
          }
        } catch (error) {
          console.error('Error loading test count:', error);
          setTestCount(0);
        }
      };
      
      loadTestCount();
    } else {
      setTestCount(0);
    }
  }, [user, isAdmin]);

  const signInWithGoogle = async () => {
    // Ensure persistence is set to LOCAL before sign-in
    try {
      await setPersistence(auth, browserLocalPersistence);
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Store user data in Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: serverTimestamp(),
        createdAt: serverTimestamp(),
      }, { merge: true });
      
      // Save minimal user data to localStorage for persistence
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
      localStorage.setItem('authUser', JSON.stringify(userData));
      
      console.log('User signed in successfully');
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Clear cached user data
      localStorage.removeItem('authUser');
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Add a new admin user
  const addAdminUser = async (email: string) => {
    if (!user || !isAdmin) {
      throw new Error('Unauthorized: Only admins can add other admins');
    }

    try {
      // Find user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('User not found. They must sign in at least once before being granted admin access.');
      }

      const userData = querySnapshot.docs[0].data();
      const uid = userData.uid;

      // Add user to admins collection
      await setDoc(doc(db, 'admins', uid), {
        uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        addedBy: user.uid,
        addedAt: serverTimestamp()
      });

      // Refresh admin users list
      await fetchAdminUsers();
    } catch (error) {
      console.error('Error adding admin user:', error);
      throw error;
    }
  };

  // Remove an admin user
  const removeAdminUser = async (uid: string) => {
    if (!user || !isAdmin) {
      throw new Error('Unauthorized: Only admins can remove other admins');
    }

    try {
      // Check if trying to remove the super admin
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists() && userDoc.data().email === 'goyalmayank300@gmail.com') {
        throw new Error('Cannot remove the super admin');
      }

      // Remove user from admins collection
      await deleteDoc(doc(db, 'admins', uid));

      // Refresh admin users list
      await fetchAdminUsers();
    } catch (error) {
      console.error('Error removing admin user:', error);
      throw error;
    }
  };

  // Check if user can create more tests and get current test count
  const checkAndUpdateTestCount = async (): Promise<boolean> => {
    if (!user) return false;
    
    // Admin users can always create tests
    if (isAdmin) return true;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentTestCount = userData.testCount || 0;
        setTestCount(currentTestCount);
        
        // Check if user has reached the limit
        return currentTestCount < MAX_FREE_TESTS;
      }
      
      return true; // New users can create tests
    } catch (error) {
      console.error('Error checking test count:', error);
      return false;
    }
  };

  // Increment the test count for the user
  const incrementTestCount = async (): Promise<void> => {
    if (!user) return;
    
    // Admin users don't increment their count
    if (isAdmin) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentTestCount = userData.testCount || 0;
        const newTestCount = currentTestCount + 1;
        
        await setDoc(userRef, { testCount: newTestCount }, { merge: true });
        setTestCount(newTestCount);
      } else {
        // If user document doesn't exist (shouldn't happen), create it
        await setDoc(userRef, { testCount: 1 }, { merge: true });
        setTestCount(1);
      }
    } catch (error) {
      console.error('Error incrementing test count:', error);
    }
  };



  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAdmin,
      isSuperAdmin,
      adminUsers,
      testCount,
      remainingTests,
      signInWithGoogle,
      logout,
      addAdminUser,
      removeAdminUser,
      checkAdminStatus,
      checkAndUpdateTestCount,
      incrementTestCount
    }}>
      {children}
    </AuthContext.Provider>
  );
};
