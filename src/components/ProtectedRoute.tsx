import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const location = useLocation();
  
  // Check for cached user in localStorage for faster initial render
  useEffect(() => {
    const checkCachedUser = () => {
      try {
        const cachedUser = localStorage.getItem('authUser');
        // If we have a cached user and still loading from Firebase, we can show a loading state
        // but we don't redirect yet - we'll wait for the Firebase auth to complete
        if (!cachedUser && !user && !loading) {
          setInitialCheckDone(true);
        } else if (cachedUser || user) {
          setInitialCheckDone(true);
        }
      } catch (error) {
        console.error('Error checking cached user:', error);
        setInitialCheckDone(true);
      }
    };
    
    checkCachedUser();
  }, [user, loading]);

  // Show loading state while we're checking authentication
  if (loading || !initialCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-3 text-indigo-600">Authenticating...</p>
      </div>
    );
  }

  // Redirect to landing page if not authenticated
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
