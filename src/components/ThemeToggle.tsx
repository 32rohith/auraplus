import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center p-2 w-full rounded-xl transition-all duration-200"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-opacity-20 
        dark:bg-serene-600/10 dark:hover:bg-serene-600/20 
        bg-sage-200 hover:bg-sage-300 
        transition-colors duration-200">
        <span className="text-sm font-medium dark:text-gray-300 text-gray-700 font-display">
          {isDarkMode ? 'Dark Mode' : 'Light Mode'}
        </span>
        <div className="flex items-center justify-center w-8 h-8 rounded-full
          dark:bg-serene-700/20 dark:text-serene-300
          bg-terra-200 text-terra-600
          transition-colors duration-200">
          {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle; 