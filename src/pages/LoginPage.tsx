import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../context/ThemeContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { login, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      const result = await login(email, password);
      console.log("Login successful, redirecting to app");
      // Use replace: true to avoid navigation history issues
      navigate('/app', { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('Email not verified')) {
          setVerificationSent(true);
          setError('Your email is not verified. We\'ve sent a new verification email.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to log in');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email || !password) {
      setError('Please enter your email and password to resend verification');
      return;
    }

    try {
      setResendLoading(true);
      setError(null);
      await resendVerificationEmail(email, password);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000); // Hide success message after 5 seconds
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to resend verification email');
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className={`max-w-md w-full space-y-8 p-8 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div>
          <h2 className="text-center text-3xl font-extrabold">Sign in to your account</h2>
          <p className="mt-2 text-center text-sm">
            Or{' '}
            <Link to="/register" className={`font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
              create a new account
            </Link>
          </p>
        </div>
        
        {error && !verificationSent && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {resendSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">Verification email has been resent successfully!</span>
          </div>
        )}
        
        {verificationSent && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">
              Your email has not been verified yet. A verification email has been sent to {email}.
              <br />
              Please check your inbox and click the verification link to activate your account.
            </span>
            <div className="mt-4 text-center">
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${resendLoading ? 'bg-yellow-400 cursor-not-allowed' : isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500`}
              >
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'} placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'} placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/forgot-password" className={`font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? 'bg-blue-400 cursor-not-allowed' : isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <Link to="/" className={`text-sm font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 