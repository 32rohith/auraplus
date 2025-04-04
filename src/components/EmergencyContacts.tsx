import React from 'react';
import { X, Phone } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface EmergencyContactsProps {
  onClose: () => void;
}

const EmergencyContacts: React.FC<EmergencyContactsProps> = ({ onClose }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className={`rounded-xl shadow-soft-${isDarkMode ? 'dark' : 'light'} max-w-lg w-full mx-4 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-sage-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isDarkMode ? 'bg-terra-600/20' : 'bg-terra-100'
            }`}>
              <Phone className={`w-6 h-6 ${
                isDarkMode ? 'text-terra-400' : 'text-terra-600'
              }`} />
            </div>
            <h2 className={`text-xl font-semibold font-display ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>Emergency Contacts</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700/50 text-gray-400' : 'hover:bg-sage-100 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Important Note */}
          <div className={`border rounded-lg p-4 ${
            isDarkMode ? 'bg-terra-800/10 border-terra-700/20' : 'bg-terra-50 border-terra-200'
          }`}>
            <p className={`text-sm ${isDarkMode ? 'text-terra-300' : 'text-terra-700'}`}>
              If you or someone you know is in immediate danger, please call your local emergency services immediately.
            </p>
          </div>

          {/* Contact List */}
          <div className="space-y-3">
            {/* National Suicide Prevention Lifeline */}
            <a
              href="tel:988"
              className={`block rounded-lg p-4 transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700/50 hover:bg-gray-700' 
                  : 'bg-sage-50 hover:bg-sage-100'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-800'} font-medium font-display`}>988 Suicide & Crisis Lifeline</h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>24/7 Support - Call 988</p>
                </div>
                <Phone className={`w-5 h-5 ${isDarkMode ? 'text-serene-400' : 'text-sage-600'}`} />
              </div>
            </a>

            {/* Crisis Text Line */}
            <div className={`rounded-lg p-4 transition-colors ${
              isDarkMode 
                ? 'bg-gray-700/50 hover:bg-gray-700' 
                : 'bg-sage-50 hover:bg-sage-100'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-800'} font-medium font-display`}>Crisis Text Line</h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Text HOME to 741741</p>
                </div>
                <Phone className={`w-5 h-5 ${isDarkMode ? 'text-serene-400' : 'text-sage-600'}`} />
              </div>
            </div>

            {/* Emergency Services */}
            <a
              href="tel:911"
              className={`block rounded-lg p-4 transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700/50 hover:bg-gray-700' 
                  : 'bg-sage-50 hover:bg-sage-100'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-800'} font-medium font-display`}>Emergency Services</h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Call 911</p>
                </div>
                <Phone className={`w-5 h-5 ${isDarkMode ? 'text-serene-400' : 'text-sage-600'}`} />
              </div>
            </a>

            {/* SAMHSA's National Helpline */}
            <a
              href="tel:18006624357"
              className={`block rounded-lg p-4 transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700/50 hover:bg-gray-700' 
                  : 'bg-sage-50 hover:bg-sage-100'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`${isDarkMode ? 'text-white' : 'text-gray-800'} font-medium font-display`}>SAMHSA's National Helpline</h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>1-800-662-4357</p>
                </div>
                <Phone className={`w-5 h-5 ${isDarkMode ? 'text-serene-400' : 'text-sage-600'}`} />
              </div>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-sage-200'
        }`}>
          <button
            onClick={onClose}
            className={`w-full py-3 px-4 rounded-lg transition-colors font-medium ${
              isDarkMode 
                ? 'bg-serene-600 hover:bg-serene-700 text-white' 
                : 'bg-sage-600 hover:bg-sage-700 text-white'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContacts; 