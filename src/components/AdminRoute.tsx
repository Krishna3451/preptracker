import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(true);
  const location = useLocation();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setCheckingAdmin(false);
        return;
      }

      try {
        // Check if user is in admins collection
        const adminDocRef = doc(db, 'admins', user.uid);
        const adminDoc = await getDoc(adminDocRef);

        if (adminDoc.exists()) {
          setIsAdmin(true);
        } else {
          // Check if user is the super admin (goyalmayank300@gmail.com)
          setIsAdmin(user.email === 'goyalmayank300@gmail.com');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    if (user && !loading) {
      checkAdminStatus();
    } else if (!loading) {
      setCheckingAdmin(false);
    }
  }, [user, loading]);

  // Show loading state while checking authentication and admin status
  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-3 text-indigo-600">Verifying admin access...</p>
      </div>
    );
  }

  // Redirect to dashboard if not authenticated or not an admin
  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  // User is authenticated and is an admin, render the protected content
  return <>{children}</>;
};

export default AdminRoute;
