import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  redirectPath = '/login' 
}) => {
  const { isAuthenticated, loading, currentUser } = useAuth();
  const navigate = useNavigate();

  // Add logging to help debug the issue
  useEffect(() => {
    console.log("ProtectedRoute - Auth state:", { 
      isAuthenticated, 
      loading, 
      emailVerified: currentUser?.emailVerified 
    });
  }, [isAuthenticated, loading, currentUser]);

  if (loading) {
    // You can render a loading spinner here
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if the user is authenticated and email is verified
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to={redirectPath} replace />;
  }

  // Check email verification separately to provide clearer error message
  if (currentUser && !currentUser.emailVerified) {
    console.log("Email not verified, redirecting to login");
    return <Navigate to={redirectPath} replace />;
  }

  console.log("User is authenticated and email verified, rendering protected content");
  return <Outlet />;
};

export default ProtectedRoute; 