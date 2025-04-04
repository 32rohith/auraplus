import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../context/ThemeContext';

const VerifyEmailPage = () => {
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { verifyEmail } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyEmailWithCode = async () => {
      // Get the action code from the URL query parameters
      const queryParams = new URLSearchParams(location.search);
      const actionCode = queryParams.get('oobCode');
      
      if (!actionCode) {
        setError('Invalid verification link. No verification code provided.');
        setVerifying(false);
        return;
      }
      
      try {
        await verifyEmail(actionCode);
        setSuccess(true);
        setVerifying(false);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Email verification failed. Please try again or request a new verification link.');
        }
        setVerifying(false);
      }
    };
    
    verifyEmailWithCode();
  }, [location, verifyEmail]);

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`max-w-md w-full space-y-8 p-8 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div>
          <h2 className="text-center text-3xl font-extrabold">
            {verifying ? 'Verifying Email...' : (success ? 'Email Verified!' : 'Verification Failed')}
          </h2>
        </div>
        
        {verifying ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : success ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">Your email has been successfully verified. You can now log in to your account.</span>
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/login')}
                className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                Go to Login
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
            <div className="mt-4 text-center">
              <Link 
                to="/login" 
                className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-block`}
              >
                Return to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage; 