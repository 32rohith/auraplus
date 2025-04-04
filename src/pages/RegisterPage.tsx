import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../context/ThemeContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { register, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      await register(email, password, name);
      setRegistered(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to register');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email || !password) {
      setError('Email and password are required to resend verification');
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
          <h2 className="text-center text-3xl font-extrabold">
            {registered ? 'Registration Successful' : 'Create your account'}
          </h2>
          <p className="mt-2 text-center text-sm">
            {registered ? 'Please check your email to verify your account' : (
              <>
                Or{' '}
                <Link to="/login" className={`font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
                  sign in to your account
                </Link>
              </>
            )}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {resendSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">Verification email has been resent successfully!</span>
          </div>
        )}
        
        {registered ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">
              Registration successful! A verification email has been sent to your email address.
              <br />
              Please check your inbox and click the verification link to activate your account.
            </span>
            <div className="flex justify-between mt-4">
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${resendLoading ? 'bg-yellow-400 cursor-not-allowed' : isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500`}
              >
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </button>
              <button
                onClick={() => navigate('/login')}
                className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                Go to Login
              </button>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="name" className="sr-only">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'} placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Full Name"
                />
              </div>
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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'} placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Password"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'} placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Confirm Password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? 'bg-green-400 cursor-not-allowed' : isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}
        
        <div className="text-center mt-4">
          <Link to="/" className={`text-sm font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 