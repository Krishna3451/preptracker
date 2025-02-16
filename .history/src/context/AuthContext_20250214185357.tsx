import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { 
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  User,
  ConfirmationResult,
  UserCredential,
  auth,
  ApplicationVerifier
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  registerWithPhone: (phone: string, email: string) => Promise<ConfirmationResult>;
  loginWithPhone: (phone: string) => Promise<ConfirmationResult>;
  verifyOTP: (otp: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationId, setVerificationId] = useState<string>('');
  const [tempEmail, setTempEmail] = useState<string>('');
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<ApplicationVerifier | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const setupRecaptcha = async (phoneNumber: string): Promise<ConfirmationResult> => {
    if (!recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
      setRecaptchaVerifier(verifier);
      return signInWithPhoneNumber(auth, phoneNumber, verifier);
    }
    return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  };

  const registerWithPhone = async (phone: string, email: string): Promise<ConfirmationResult> => {
    try {
      const confirmationResult = await setupRecaptcha(phone);
      setVerificationId(confirmationResult.verificationId);
      setTempEmail(email);
      return confirmationResult;
    } catch (error) {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear?.();
        setRecaptchaVerifier(null);
      }
      throw error;
    }
  };

  const loginWithPhone = async (phone: string): Promise<ConfirmationResult> => {
    try {
      const confirmationResult = await setupRecaptcha(phone);
      setVerificationId(confirmationResult.verificationId);
      return confirmationResult;
    } catch (error) {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear?.();
        setRecaptchaVerifier(null);
      }
      throw error;
    }
  };

  const verifyOTP = async (otp: string): Promise<UserCredential> => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const userCredential = await auth.signInWithCredential(credential);
      
      // If this is a new user and we have a temporary email, save it to Firestore
      if (tempEmail && userCredential.user) {
        const userRef = doc(db, 'users', userCredential.user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            phone: userCredential.user.phoneNumber,
            email: tempEmail,
            createdAt: new Date().toISOString()
          });
        }
      }
      
      // Clear recaptcha after successful verification
      if (recaptchaVerifier) {
        recaptchaVerifier.clear?.();
        setRecaptchaVerifier(null);
      }
      
      return userCredential;
    } catch (error) {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear?.();
        setRecaptchaVerifier(null);
      }
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    if (recaptchaVerifier) {
      recaptchaVerifier.clear?.();
      setRecaptchaVerifier(null);
    }
    return auth.signOut();
  };

  const value = {
    currentUser,
    loading,
    registerWithPhone,
    loginWithPhone,
    verifyOTP,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
