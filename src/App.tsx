import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Mic, MicOff, History, X, Plus, BarChart, Mic as MicIcon, ChevronLeft, ChevronRight, Box, Phone, Upload, LogOut } from 'lucide-react';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { useAI } from './hooks/useAI';
import { ModelViewer } from '../ModelViewer';
import Analysis from './components/Analysis/Analysis';
import VoiceClonePage from './pages/VoiceClonePage';
import ThreeDModelPage from './pages/ThreeDModelPage';
import { elevenLabsService } from './services/elevenLabsService';
import { DEFAULT_VOICE_ID } from './config/elevenlabs';
import SessionHistory from './components/SessionHistory/SessionHistory';
import EmergencyContacts from './components/EmergencyContacts';
import { sessionService } from './services/sessionService';
import AvatarUpload from './components/AvatarUpload';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useAuth } from './contexts/AuthContext';

// Types
interface Conversation {
  timestamp: string;
  userMessage: string;
  aiResponse: string;
}

interface ConversationSession {
  $id: string;
  sessionId: string;
  startTime: string;
  endTime: string;
  conversation: Conversation[];
  messageCount: number;
}

// API Functions
const fetchSessions = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/sessions/all');
    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
};

const fetchSessionById = async (sessionId: string) => {
  try {
    const response = await fetch(`http://localhost:8080/api/sessions/${sessionId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch session');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
};

function AppContent() {
  const { isDarkMode } = useTheme();
  const { currentUser, logout } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState('');
  const [displayedResponse, setDisplayedResponse] = useState('');
  const { transcript, startListening, stopListening } = useVoiceRecognition();
  const { generateResponse, voiceCloned, resetVoice } = useAI();
  const [sessionStarted, setSessionStarted] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [status, setStatus] = useState('');
  const [typingInterval, setTypingInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [audioElements, setAudioElements] = useState<HTMLAudioElement[]>([]);
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [currentSession, setCurrentSession] = useState<Conversation[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSessionDetail, setShowSessionDetail] = useState(false);
  const [selectedSessionData, setSelectedSessionData] = useState<ConversationSession | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [show3DModel, setShow3DModel] = useState(false);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
  const [showVoiceClone, setShowVoiceClone] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);

  const navigate = useNavigate();

  // Initialize state from sessionService
  useEffect(() => {
    const initializeState = async () => {
      // Load sessions
      const allSessions = await sessionService.getAllSessions();
      setSessions(allSessions);

      // Check if there's an active session
      if (sessionService.isSessionStarted()) {
        setSessionStarted(true);
        const currentSession = sessionService.getCurrentSession();
        setCurrentSession(currentSession);
      }
    };

    initializeState();
  }, []);

  // Update session details when selected
  useEffect(() => {
    const loadSessionDetails = async () => {
      if (selectedSession) {
        const data = await sessionService.getSessionById(selectedSession);
        if (data) {
          setSelectedSessionData(data);
          setShowSessionDetail(true);
        }
      }
    };

    loadSessionDetails();
  }, [selectedSession]);

  useEffect(() => {
    const loadSessions = async () => {
      const allSessions = await sessionService.getAllSessions();
      if (allSessions) {
        setSessions(allSessions);
      }
    };

    loadSessions();
  }, []);

  const handleMicClick = async () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
      setProcessing(true);
      setStatus('Thinking...');
      
      try {
        const aiResponse = await generateResponse(transcript, null);
        if (aiResponse) {
          setResponse(aiResponse);
          
          const newConversation = {
            userMessage: transcript,
            aiResponse: aiResponse,
            timestamp: new Date().toISOString()
          };
          
          // Update current session
          const updatedSession = [...currentSession, newConversation];
          setCurrentSession(updatedSession);
          
          // Save conversation using sessionService
          await sessionService.saveConversation(newConversation);
          
          // Update sessions list
          const updatedSessions = await sessionService.getAllSessions();
          setSessions(updatedSessions);

          try {
            const voiceId = elevenLabsService.getVoiceId() ?? DEFAULT_VOICE_ID;
            const audioBuffer = await elevenLabsService.generateSpeech(aiResponse, true);
            const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
            const audio = new Audio(URL.createObjectURL(blob));
            setAudioElements(prev => [...prev, audio]);
            
            audio.onended = () => {
              setAudioElements(prev => prev.filter(a => a !== audio));
              URL.revokeObjectURL(audio.src);
            };
            
            await audio.play();
            aiIsSpeaking(aiResponse);
          } catch (error) {
            console.error('Error playing audio:', error);
            aiIsSpeaking(aiResponse);
          }
        }
      } catch (error) {
        console.error('Error generating response:', error);
        setResponse('I apologize, but I encountered an error processing your message.');
      }
      
      setProcessing(false);
      setStatus('');
    } else {
      setResponse('');
      startListening();
      setIsListening(true);
      setStatus('Listening...');
    }
  };

  const endSession = async () => {
    try {
      await sessionService.endSession();
      
      // Update local state
      setSessionStarted(false);
      setCurrentSession([]);
      
      // Update sessions list
      const updatedSessions = await sessionService.getAllSessions();
      setSessions(updatedSessions);
      
      // Clean up UI state
      if (typingInterval) {
        clearInterval(typingInterval);
        setTypingInterval(null);
      }
      audioElements.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      setAudioElements([]);
      setAiSpeaking(false);
      setDisplayedResponse('');
      setStatus('');
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  // Function to simulate AI speaking with typing animation
  const aiIsSpeaking = (text: string) => {
    setAiSpeaking(true);
    setDisplayedResponse(''); // Clear displayed response
    setStatus('Speaking...'); // Add speaking status

    // Clear any existing typing interval
    if (typingInterval) {
      clearInterval(typingInterval);
    }

    let index = -1; // Start from first character
    const interval = setInterval(() => {
      if (index < text.length-1) {
        setDisplayedResponse((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
        setTypingInterval(null);
        setAiSpeaking(false);
        setStatus(''); // Clear status when done speaking
      }
    }, 40); // Slightly faster typing speed for better UX
    setTypingInterval(interval);
  };

  const beginSession = async () => {
    try {
      const success = await sessionService.startSession();
      
      if (success) {
        setSessionStarted(true);
        setResponse('');
        setDisplayedResponse('');
        
        const greeting = "Hello! How are you doing today?";
        setResponse(greeting);

        try {
          const voiceId = elevenLabsService.getVoiceId() ?? DEFAULT_VOICE_ID;
          const audioBuffer = await elevenLabsService.generateSpeech(greeting, true);
          const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
          const audio = new Audio(URL.createObjectURL(blob));
          setAudioElements(prev => [...prev, audio]);
          
          audio.onended = () => {
            setAudioElements(prev => prev.filter(a => a !== audio));
            URL.revokeObjectURL(audio.src);
          };
          
          await audio.play();
          aiIsSpeaking(greeting);
        } catch (error) {
          console.error('Error playing audio:', error);
          aiIsSpeaking(greeting);
        }
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const goToThreeDModel = () => {
    navigate('/3d-model');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-dark text-white' 
        : 'bg-gradient-light text-gray-700'
    }`}>
      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 backdrop-blur-lg flex flex-col shadow-2xl transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDarkMode 
            ? 'bg-gray-900/95 border-r border-gray-800/30 text-white' 
            : 'bg-sage-50/95 border-r border-sage-200/50 text-gray-700'
        }`}
      >
        {/* Logo */}
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-800/30' : 'border-sage-200/50'}`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
              isDarkMode 
                ? 'bg-gradient-to-br from-serene-600 to-lavender-600 shadow-serene-500/20' 
                : 'bg-gradient-to-br from-sage-500 to-terra-400 shadow-sage-500/20'
            }`}>
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className={`text-xl font-display font-semibold ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-serene-300 to-lavender-400' 
                  : 'bg-gradient-to-r from-sage-600 to-terra-500'
              } text-transparent bg-clip-text`}>Aura +</span>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-sage-700'}`}>Your Personal Therapy Companion</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-3">
            {currentUser && isSidebarOpen && (
              <div className={`mb-6 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="font-medium">{currentUser.name}</div>
                <div className="text-sm text-gray-500">{currentUser.email}</div>
              </div>
            )}
            
            <button
              onClick={() => setShowVoiceClone(true)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-serene-700/10' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-sage-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isDarkMode 
                  ? 'bg-serene-700/10 group-hover:bg-serene-600/20' 
                  : 'bg-sage-200 group-hover:bg-sage-300'
              }`}>
                <MicIcon className={`w-5 h-5 ${
                  isDarkMode ? 'text-serene-400 group-hover:text-serene-300' : 'text-sage-600 group-hover:text-sage-700'
                }`} />
              </div>
              <span className="font-medium">Voice Clone</span>
            </button>
            
            <button 
              onClick={() => navigate('/session-history')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-lavender-700/10' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-sage-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isDarkMode 
                  ? 'bg-lavender-700/10 group-hover:bg-lavender-600/20' 
                  : 'bg-sage-200 group-hover:bg-sage-300'
              }`}>
                <History className={`w-5 h-5 ${
                  isDarkMode ? 'text-lavender-400 group-hover:text-lavender-300' : 'text-terra-600 group-hover:text-terra-700'
                }`} />
              </div>
              <span className="font-medium">Session History</span>
            </button>
            
            <button
              onClick={() => navigate('/analysis')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-serene-700/10' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-sage-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isDarkMode 
                  ? 'bg-serene-700/10 group-hover:bg-serene-600/20' 
                  : 'bg-sage-200 group-hover:bg-sage-300'
              }`}>
                <BarChart className={`w-5 h-5 ${
                  isDarkMode ? 'text-serene-400 group-hover:text-serene-300' : 'text-sage-600 group-hover:text-sage-700'
                }`} />
              </div>
              <span className="font-medium">View Analysis</span>
            </button>

            {/* Emergency Contacts Button */}
            <button
              onClick={() => setShowEmergencyContacts(true)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-terra-800/10' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-terra-100'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isDarkMode 
                  ? 'bg-terra-800/10 group-hover:bg-terra-700/20' 
                  : 'bg-terra-100 group-hover:bg-terra-200'
              }`}>
                <Phone className={`w-5 h-5 ${
                  isDarkMode ? 'text-terra-400 group-hover:text-terra-300' : 'text-terra-600 group-hover:text-terra-700'
                }`} />
              </div>
              <span className="font-medium">Emergency Contacts</span>
            </button>

            {/* Add Avatar Button */}
            <button
              onClick={() => setShowAvatarUpload(true)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-serene-700/10' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-sage-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isDarkMode 
                  ? 'bg-serene-700/10 group-hover:bg-serene-600/20' 
                  : 'bg-sage-200 group-hover:bg-sage-300'
              }`}>
                <Upload className={`w-5 h-5 ${
                  isDarkMode ? 'text-serene-400 group-hover:text-serene-300' : 'text-sage-600 group-hover:text-sage-700'
                }`} />
              </div>
              <span className="font-medium">Add Avatar</span>
            </button>
          </div>
        </nav>

        {/* Theme Toggle at the bottom of sidebar */}
        <div className="p-4 mt-auto">
          <ThemeToggle />
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <button 
            onClick={handleLogout}
            className={`flex items-center space-x-2 p-3 rounded-lg mt-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} text-red-500`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className={`fixed top-6 z-50 p-2 rounded-lg shadow-soft-${isDarkMode ? 'dark' : 'light'} transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'left-72' : 'left-0'
        } ${
          isDarkMode 
            ? 'bg-gray-800 hover:bg-gray-700 text-white' 
            : 'bg-white hover:bg-sage-50 text-gray-700'
        }`}
      >
        {isSidebarOpen ? (
          <ChevronLeft className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </button>

      {/* 3D Model Toggle Button */}
      <button
        onClick={goToThreeDModel}
        className={`fixed top-6 right-6 z-50 flex items-center space-x-2 px-4 py-2 rounded-xl shadow-soft-${isDarkMode ? 'dark' : 'light'} transition-all duration-200 hover:scale-105 group ${
          isDarkMode 
            ? 'bg-gray-800/90 hover:bg-gray-700/90 text-white' 
            : 'bg-white/90 hover:bg-sage-50/90 text-gray-700'
        }`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
          isDarkMode 
            ? 'bg-gradient-to-br from-serene-700/10 to-lavender-700/10 group-hover:from-serene-600/20 group-hover:to-lavender-600/20' 
            : 'bg-gradient-to-br from-sage-400/10 to-terra-400/10 group-hover:from-sage-400/20 group-hover:to-terra-400/20'
        }`}>
          <Box className={`w-5 h-5 ${
            isDarkMode ? 'text-serene-400 group-hover:text-lavender-400' : 'text-sage-600 group-hover:text-terra-500'
          }`} />
        </div>
        <span className={`font-medium ${
          isDarkMode 
            ? 'bg-gradient-to-r from-serene-400 to-lavender-400' 
            : 'bg-gradient-to-r from-sage-600 to-terra-500'
        } text-transparent bg-clip-text font-display`}>3D Model</span>
      </button>

      {/* Main content */}
      <div className={`flex-1 flex flex-col items-center justify-center p-6 relative transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'ml-72' : 'ml-0'
      }`}>
        {/* Status indicator */}
        {status && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className={`px-6 py-2 rounded-full shadow-soft-${isDarkMode ? 'dark' : 'light'} border ${
              isDarkMode 
                ? 'bg-gray-800/80 border-gray-700/50' 
                : 'bg-white/80 border-sage-200/50'
            }`}>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  status === 'Listening...' 
                    ? (isDarkMode ? 'bg-serene-500' : 'bg-sage-600') 
                    : status === 'Thinking...' 
                      ? (isDarkMode ? 'bg-terra-400' : 'bg-terra-500') 
                      : (isDarkMode ? 'bg-lavender-500' : 'bg-lavender-500')
                }`}></div>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  {status}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* AI Visualization */}
        <div className="flex flex-col items-center mb-4">
          <div className={`relative w-48 h-48 rounded-full overflow-hidden ${
            isDarkMode 
              ? 'shadow-[0_0_25px_rgba(51,102,255,0.3)]' 
              : 'shadow-[0_0_25px_rgba(119,166,119,0.3)]'
          }`}>
            <ModelViewer 
              isListening={isListening} 
              isProcessing={processing} 
              hasResponse={aiSpeaking}
            />
            {/* Pulsating ring effect for AI status */}
            <div className={`absolute inset-0 rounded-full ${
              isListening 
                ? (isDarkMode ? 'ring-2 ring-serene-400 animate-pulse' : 'ring-2 ring-sage-500 animate-pulse') 
                : processing 
                  ? (isDarkMode ? 'ring-2 ring-terra-400 animate-pulse' : 'ring-2 ring-terra-500 animate-pulse')
                  : aiSpeaking
                    ? (isDarkMode ? 'ring-2 ring-lavender-400 animate-pulse' : 'ring-2 ring-lavender-500 animate-pulse')
                    : ''
            }`}></div>
          </div>
          
          {/* Begin Session Button - only shown initially */}
          {!sessionStarted && (
            <button
              onClick={beginSession}
              className={`mt-8 px-10 py-4 text-white font-medium rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-serene-600 to-lavender-600 hover:from-serene-700 hover:to-lavender-700 shadow-serene-500/30' 
                  : 'bg-gradient-to-r from-sage-600 to-sage-500 hover:from-sage-700 hover:to-sage-600 shadow-sage-600/30'
              }`}
            >
              Begin Session
            </button>
          )}
        </div>

        {/* AI Response Area */}
        {sessionStarted && (
          <div className="relative w-full mb-20">
            <p className={`text-lg leading-relaxed text-center mx-auto max-w-2xl font-sans ${
              isDarkMode ? 'text-gray-100' : 'text-gray-700'
            }`}>
              {displayedResponse || ''}
            </p>
            
            {/* Control buttons in curved layout */}
            <div className="absolute -bottom-32 left-0 right-0 flex justify-center items-center">
              <div className={`flex items-center space-x-12 px-12 py-6 rounded-2xl shadow-soft-${isDarkMode ? 'dark' : 'light'} ${
                isDarkMode 
                  ? 'bg-gray-800/30 backdrop-blur-sm' 
                  : 'bg-white/30 backdrop-blur-sm'
              }`}>
                <button
                  onClick={handleMicClick}
                  className={`p-5 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 text-white ${
                    aiSpeaking || processing
                      ? 'bg-gray-600 cursor-not-allowed'
                      : isListening
                        ? (isDarkMode ? 'bg-terra-500 hover:bg-terra-600' : 'bg-terra-500 hover:bg-terra-600')
                        : isDarkMode
                          ? 'bg-gradient-to-r from-serene-600 to-lavender-600 hover:from-serene-700 hover:to-lavender-700'
                          : 'bg-gradient-to-r from-sage-600 to-sage-500 hover:from-sage-700 hover:to-sage-600'
                  }`}
                  disabled={aiSpeaking || processing}
                >
                  {isListening ? (
                    <MicOff className="w-6 h-6" />
                  ) : (
                    <Mic className="w-6 h-6" />
                  )}
                </button>
                
                {/* End Session Button */}
                <button
                  onClick={endSession}
                  className={`p-5 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 text-white ${
                    isDarkMode 
                      ? 'bg-terra-600 hover:bg-terra-700' 
                      : 'bg-terra-500 hover:bg-terra-600'
                  }`}
                  title="End Session"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Contacts Modal */}
      {showEmergencyContacts && (
        <EmergencyContacts onClose={() => setShowEmergencyContacts(false)} />
      )}

      {/* Voice Clone Modal */}
      {showVoiceClone && (
        <VoiceClonePage onClose={() => setShowVoiceClone(false)} />
      )}

      {/* Avatar Upload Modal */}
      {showAvatarUpload && (
        <AvatarUpload onClose={() => setShowAvatarUpload(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/3d-model" element={<ThreeDModelPage />} />
          <Route path="/session-history" element={<SessionHistory />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;