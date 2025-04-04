import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Navigation */}
      <nav className={`w-full py-4 px-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">AI Therapist</h1>
          <div className="flex gap-4">
            <Link to="/login" className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}>
              Login
            </Link>
            <Link to="/register" className={`px-4 py-2 rounded-md ${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors`}>
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 container mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="md:w-1/2 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">Your Personal AI Therapist</h2>
          <p className="text-lg md:text-xl">Experience therapeutic conversations with an AI designed to listen, understand, and provide support whenever you need it.</p>
          <div className="pt-4">
            <Link to="/register" className={`px-6 py-3 rounded-md text-lg ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}>
              Get Started
            </Link>
          </div>
        </div>
        <div className="md:w-1/2">
          <img 
            src="/therapy-illustration.svg" 
            alt="AI Therapist Illustration"
            className="w-full max-w-lg mx-auto"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.src = "https://via.placeholder.com/600x400?text=AI+Therapist";
            }}
          />
        </div>
      </div>

      {/* Features Section */}
      <div className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} shadow-md`}>
              <h3 className="text-xl font-semibold mb-3">24/7 Availability</h3>
              <p>Access therapeutic support anytime, anywhere, without appointments or waiting.</p>
            </div>
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} shadow-md`}>
              <h3 className="text-xl font-semibold mb-3">Voice Interaction</h3>
              <p>Natural conversations with voice recognition and response for a more personal experience.</p>
            </div>
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} shadow-md`}>
              <h3 className="text-xl font-semibold mb-3">Session History</h3>
              <p>Review past conversations and track your emotional journey over time.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`py-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="container mx-auto px-6 text-center">
          <p>&copy; {new Date().getFullYear()} AI Therapist. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 