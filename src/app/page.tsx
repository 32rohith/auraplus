'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import TherapistCircle from '@/components/TherapistCircle';
import AuthForm from '@/components/AuthForm';
import SessionHistory from '@/components/SessionHistory';
import SessionAnalysis from '@/components/SessionAnalysis';
import Profile from '@/components/Profile';
import Settings from '@/components/Settings';
import Sidebar from '@/components/Sidebar';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  doc,
  setDoc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { User as FirebaseUser, Subscription, SubscriptionTier } from '@/types';

// Add type definitions for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
  onstart: (event: Event) => void;
  onend: (event: Event) => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

// Add LandingPage component
const LandingPage = ({ onShowAuth }: { onShowAuth: () => void }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background to-primary/5"></div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_30%_at_50%_10%,rgba(70,140,152,0.1),transparent)]"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left content */}
            <div className="flex-1 space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  <span className="text-gradient">AI-Powered</span> Therapy <br />
                  <span className="text-gradient-accent">For Everyone</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl mt-4">
                  Experience compassionate AI therapy sessions with immediate support, 
                  anytime, anywhere. Your personal wellness companion.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <button onClick={onShowAuth} className="btn-primary btn-lg">
                  Get Started
                </button>
                <button className="btn-outline btn-lg">
                  Learn More
                </button>
              </div>
              
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background"></div>
                  ))}
                </div>
                <p className="text-sm">Join thousands finding peace with our AI therapy</p>
              </div>
            </div>
            
            {/* Right content - Illustration */}
            <div className="flex-1 relative">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 via-accent/20 to-secondary/30 blur-3xl opacity-70"></div>
                <div className="relative bg-card shadow-elegant rounded-3xl p-6 border border-border/50 w-full h-full flex items-center justify-center">
                  <div className="therapist-avatar-container scale-75">
                    <div className="therapist-avatar w-48 h-48 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg border-4 border-background">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-24 h-24 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-card px-4 py-2 rounded-full shadow-md border border-border/50 text-sm font-medium text-primary">
                    AI Therapist
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Our AI therapy solution provides immediate emotional support through voice interaction.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Start a Session",
                description: "Begin your therapy session with a single click and speak naturally.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                )
              },
              {
                title: "AI Listens & Responds",
                description: "Our AI listens, understands emotions, and responds with empathy.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                )
              },
              {
                title: "Track Your Progress",
                description: "Review past sessions and track your emotional wellness journey.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                )
              }
            ].map((feature, index) => (
              <div key={index} className="bg-card p-6 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Real stories from people finding emotional support through our AI therapy.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah K.",
                quote: "I was skeptical at first, but the AI truly understood my anxiety issues and offered practical advice that helped."
              },
              {
                name: "Michael T.",
                quote: "Having access to therapy anytime has been life-changing. I can process my thoughts whenever I need to."
              },
              {
                name: "Jamie L.",
                quote: "The AI remembered details from our previous sessions, making each conversation feel connected and meaningful."
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-card p-6 rounded-xl border border-border/50 shadow-sm">
                <div className="mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="italic mb-4">"{testimonial.quote}"</p>
                <p className="font-medium">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background to-primary/5"></div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(40%_50%_at_50%_50%,rgba(70,140,152,0.1),transparent)]"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Experience the benefits of AI therapy today. Sign up for free and get started with your first session.
            </p>
            <button onClick={onShowAuth} className="btn-primary btn-lg mx-auto">
              Begin Your Journey
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [sessionActive, setSessionActive] = useState(false);
  const [greetingMessage, setGreetingMessage] = useState('');
  const [transcript, setTranscript] = useState('');
  const [volume, setVolume] = useState(1); // 0 to 1
  const [aiResponse, setAiResponse] = useState('');
  const [showAiResponse, setShowAiResponse] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  
  // Developer configurable middle prompt - edit this value to change the instructions sent to Gemini
  const DEVELOPER_MIDDLE_PROMPT = "Embody a deeply compassionate, empathetic therapist with a warm, human-like tone. In a concise yet powerful exchange, validate the user's emotions, offer uplifting encouragement, and ensure they feel profoundly heard and hopeful, no matter the challenge. Keep it brief within 2-3 lines, avoid clinical terms, and prioritize making the user feel embraced and uplifted.";
  
  const [sessionHistory, setSessionHistory] = useState<{role: string, content: string}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  // Updated userSubscription with Subscription type
  const [userSubscription, setUserSubscription] = useState<Subscription | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Add these state variables and refs for audio recording
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Timer for session duration limit
  const sessionDurationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Add a state to track remaining session time
  const [remainingSessionTime, setRemainingSessionTime] = useState<number | null>(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Add useEffect to fetch session history from Firebase when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserSessions();
      fetchUserSubscription();
    }
  }, [isAuthenticated, user]);
  
  // Fetch user subscription data
  const fetchUserSubscription = async () => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists() && userDoc.data().subscription) {
        const subscription = userDoc.data().subscription;
        setUserSubscription({
          tier: subscription.tier as SubscriptionTier, // Cast for backward compatibility
          sessions_limit: subscription.sessions_limit,
          sessions_used: subscription.sessions_used,
          session_duration_limit: subscription.session_duration_limit,
          renewal_date: subscription.renewal_date
        });
        
        // Check if sessions limit has been reached
        if (subscription.sessions_used >= subscription.sessions_limit) {
          setSubscriptionError(`You've reached your monthly limit of ${subscription.sessions_limit} sessions. Please upgrade your plan for more sessions.`);
        } else {
          setSubscriptionError(null);
        }
      } else {
        // Create default free subscription if one doesn't exist
        const defaultSubscription: Subscription = {
          tier: SubscriptionTier.FREE,
          sessions_limit: 3,
          sessions_used: 0,
          session_duration_limit: 10, // in minutes
          renewal_date: new Date(new Date().setMonth(new Date().getMonth() + 1))
        };
        
        await setDoc(userRef, { 
          subscription: defaultSubscription 
        }, { merge: true });
        
        setUserSubscription(defaultSubscription);
      }
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      toast.error('Failed to fetch subscription details');
    }
  };

  // Function to fetch user sessions from Firebase
  const fetchUserSessions = async () => {
    if (!user) return;
    
    try {
      let querySnapshot;
      
      try {
        // First try with sorting (requires index)
        const sessionsQuery = query(
          collection(db, 'sessions'),
          where('user_id', '==', user.uid),
          orderBy('created_at', 'desc')
        );
        querySnapshot = await getDocs(sessionsQuery);
      } catch (indexError) {
        // If index error occurs, fall back to simple query without ordering
        if (indexError instanceof Error && indexError.toString().includes('requires an index')) {
          console.warn('Missing index for query. Falling back to unordered query...');
          
          // Get the index URL from the error but don't show alert
          const indexUrl = indexError.toString().match(/https:\/\/console\.firebase\.google\.com[^\s]*/)?.[0];
          if (indexUrl) {
            console.warn('Create the required index here:', indexUrl);
            // Log a more developer-friendly message without showing alert
            console.error(`
            ================================================================
            FIREBASE INDEX REQUIRED: Please create the index by visiting:
            ${indexUrl}
            ================================================================
            `);
          }
          
          // Fallback query without ordering
          const fallbackQuery = query(
            collection(db, 'sessions'),
            where('user_id', '==', user.uid)
          );
          querySnapshot = await getDocs(fallbackQuery);
        } else {
          throw indexError; // Re-throw if it's not an index error
        }
      }
      
      // Process the results
      let sessionData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Ensure date fields are properly formatted
          date: data.date instanceof Timestamp 
            ? data.date.toDate().toISOString() 
            : data.date,
          created_at: data.created_at instanceof Timestamp 
            ? data.created_at.toDate().toISOString() 
            : data.created_at,
          // Ensure messages array is properly formatted
          messages: data.messages?.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp instanceof Timestamp 
              ? msg.timestamp.toDate().toISOString() 
              : msg.timestamp
          })) || []
        };
      });
      
      // If we used the fallback query, sort in memory
      if (sessionData.length > 0 && !sessionData[0].hasOwnProperty('created_at_sort')) {
        sessionData.sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateB.getTime() - dateA.getTime(); // Descending order
        });
      }
      
      // Update state with the fetched sessions
      setSessions(sessionData);
      console.log('Sessions fetched from Firebase:', sessionData.length);
    } catch (error) {
      console.error('Error fetching sessions from Firebase:', error);
    }
  };

  useEffect(() => {
    // Initialize audio element for playing TTS responses
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      
      // Set up audio event handlers for better state management
      audioRef.current.onplay = () => {
        console.log('Audio started playing');
        setIsSpeaking(true);
        setIsProcessing(false);
        setIsListening(false);
      };
      
      audioRef.current.onended = () => {
        console.log('Audio playback ended');
        setIsSpeaking(false);
        
        // Only start listening again if session is active and we're not already processing
        if (sessionActive && !isProcessing) {
          // Add a small delay before starting to listen for a more natural conversation flow
          setTimeout(() => {
            console.log('Starting listening after audio ended');
            startListening();
          }, 800);
        }
      };
      
      audioRef.current.onerror = (error) => {
        console.error('Audio playback error:', error);
        setIsSpeaking(false);
        
        // Try to recover by starting listening again if appropriate
        if (sessionActive && !isProcessing) {
          setTimeout(() => {
            startListening();
          }, 800);
        }
      };
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [sessionActive]);

  // Replace the startListening function with an improved version
  const startListening = async () => {
    // Don't start listening if we're already processing
    if (isProcessing) {
      console.log('Cannot start listening while processing');
      return;
    }

    try {
      console.log('Starting audio recording for Google Cloud STT...');
      
      // Clear existing transcripts
      setInterimTranscript('');
      setFinalTranscript('');
      setTranscript('');
      
      // Request microphone access with specific audio constraints for better quality
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Reduced from 48000 for faster processing
          channelCount: 1
        } 
      });
      
      // Create new MediaRecorder with appropriate MIME type and bitrate
      // Check for codec support and use fallbacks if needed
      let options = {};
      
      // Test mime type support - prioritize formats that process faster
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        console.log('Using audio/webm;codecs=opus for recording');
        options = { 
          mimeType: 'audio/webm;codecs=opus',
          audioBitsPerSecond: 64000 // Reduced from 128000 for faster processing
        };
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        console.log('Fallback to audio/webm for recording');
        options = { 
          mimeType: 'audio/webm',
          audioBitsPerSecond: 64000
        };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        console.log('Fallback to audio/mp4 for recording');
        options = { 
          mimeType: 'audio/mp4',
          audioBitsPerSecond: 64000
        };
      } else {
        console.log('Using default recorder options - no mime type specified');
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = []; // Clear previous audio chunks
      
      // Set up audio level visualization if needed
      // This could be used for visual feedback in the UI
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Function to detect silence - optimized thresholds for faster detection
      const checkSilence = () => {
        if (!isRecording || isProcessing || isSpeaking) return;
        
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        
        // If average volume is below threshold, consider it silence
        // Reduced threshold for faster detection
        if (average < 3) { // Reduced from 5 for quicker silence detection
          silenceCount++;
          // Detect silence faster - reduced from 10 to 7 checks (700ms vs 1000ms)
          if (silenceCount > 7) {
            console.log('Silence detected, stopping recording');
            stopListening();
          }
        } else {
          silenceCount = 0; // Reset counter if sound detected
        }
      };
      
      let silenceCount = 0;
      // Check more frequently (every 80ms instead of 100ms)
      const silenceInterval = setInterval(checkSilence, 80);
      
      // Event handlers for the MediaRecorder
      mediaRecorder.onstart = () => {
        console.log('Audio recording started');
        setIsListening(true);
        setIsRecording(true);
        audioChunksRef.current = [];
        silenceCount = 0;
      };
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        console.log('Audio recording stopped');
        setIsRecording(false);
        clearInterval(silenceInterval);
        
        try {
          // Process the audio if we have data
          if (audioChunksRef.current.length > 0) {
            // Get the MIME type from options or use a default
            const mimeType = (options as { mimeType?: string }).mimeType || 'audio/webm';
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
            
            // Reduced minimum size threshold (from 5000 to 2000 bytes)
            if (audioBlob.size > 2000) {
              await processAudioWithGoogleSTT(audioBlob);
            } else {
              console.log('Audio too short, not processing');
              setIsListening(false);
              setIsProcessing(false);
              
              // Restart listening after a shorter delay (300ms instead of 500ms)
              setTimeout(() => {
                if (sessionActive) {
                  startListening();
                }
              }, 200);
            }
          }
          
          // Stop all tracks in the stream to release the microphone
          stream.getTracks().forEach(track => track.stop());
          audioContext.close();
        } catch (error) {
          console.error('Error processing audio:', error);
          setIsListening(false);
          setIsProcessing(false);
          
          // If there's an error, try to recover with a shorter delay (1000ms instead of 2000ms)
          if (sessionActive && !isProcessing && !isSpeaking) {
            setTimeout(() => {
              startListening();
            }, 1000);
          }
        }
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast.error('Recording error. Please try again.');
        setIsListening(false);
        setIsRecording(false);
      };
      
      // Set maximum recording time - automatically stop if too long
      const maxRecordingTime = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          console.log('Maximum recording time reached, stopping');
          stopListening();
        }
      }, 7000); // Reduced from 15000 to 7000 (7 seconds max recording time) for faster processing
      
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
      setSilenceTimer(maxRecordingTime);
      
      // Start recording with smaller data chunks for more frequent processing
      mediaRecorder.start(300); // Reduced from 1000ms to 300ms for more frequent data collection
      
    } catch (error) {
      console.error('Error starting audio recording:', error);
      setIsListening(false);
      toast.error('Microphone access is required for speech input. Please allow microphone access and try again.');
    }
  };
  
  // Process audio with Google Cloud STT - optimized for latency
  const processAudioWithGoogleSTT = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      
      // Compress the audio blob if it's large to speed up transmission
      let processedBlob = audioBlob;
      if (audioBlob.size > 100000) { // Only compress if larger than 100KB
        try {
          // This is a placeholder - in a real implementation you'd use a proper audio compression library
          console.log('Large audio blob detected, would compress in production implementation');
          // processedBlob = await compressAudio(audioBlob);
        } catch (compressionError) {
          console.warn('Audio compression failed, using original blob:', compressionError);
        }
      }
      
      // Get the current origin to ensure the correct port is used
      const apiUrl = `${window.location.origin}/api/stt`;
      console.log('Calling STT API at:', apiUrl);
      console.log('Audio blob size:', processedBlob.size, 'bytes');
      console.log('Audio blob type:', processedBlob.type);
      
      // Use AbortController to set a timeout on the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000); // 7 second timeout
      
      // Call our backend API endpoint with optimized fetch options
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': processedBlob.type || 'audio/webm',
          'Priority': 'high' // Signal high priority to browser
        },
        body: processedBlob,
        signal: controller.signal,
        // Cache: 'no-store', // Ensure fresh responses
        // Mode: 'cors', // Ensure CORS is respected
        keepalive: true // Keep connection alive for better performance
      });
      
      clearTimeout(timeoutId); // Clear the timeout if the request completes
      
      if (!response.ok) {
        // Try to get detailed error information
        let errorDetails = '';
        try {
          const errorResponse = await response.json();
          errorDetails = JSON.stringify(errorResponse);
          console.error('STT API error details:', errorResponse);
        } catch (e) {
          errorDetails = await response.text();
          console.error('STT API error text:', errorDetails);
        }
        
        throw new Error(`API responded with status ${response.status}. Details: ${errorDetails}`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.transcript) {
        throw new Error('Failed to transcribe audio: ' + (data.message || 'Unknown error'));
      }
      
      // If the transcript is empty or just whitespace, restart listening
      if (!data.transcript.trim()) {
        console.log('Empty transcript received, restarting listening');
        setIsProcessing(false);
        
        // Start listening again after a shorter delay (300ms instead of 500ms)
        setTimeout(() => {
          if (sessionActive) {
            startListening();
          }
        }, 300);
        return;
      }
      
      console.log('Transcription received:', data.transcript);
      
      // Process the transcript if we got a valid response
      processTranscript(data.transcript);
      
    } catch (error) {
      console.error('Error processing audio with Google Cloud STT:', error);
      
      // Show error to the user
      setIsProcessing(false);
      setIsListening(false);
      
      // Display error as toast with shorter duration
      toast.error("Sorry, there was an error processing your speech. Please try again.", {
        duration: 3000, // Reduced from 4000 for less interruption
      });
      
      // Try to restart listening after a shorter delay (1000ms instead of 2000ms)
      setTimeout(() => {
        if (sessionActive) {
          startListening();
        }
      }, 1000);
    }
  };

  // Update the processTranscript function for lower latency
  const processTranscript = (text: string) => {
    if (!text.trim()) return;
    
    // Stop listening and show processing state
    stopListening();
    setIsProcessing(true);
    
    console.log('Processing complete user response:', text);
    
    // Add user message to history before getting AI response
    const userMessage = text.trim();
    setSessionHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Reset transcripts
    setFinalTranscript('');
    setInterimTranscript('');
    setTranscript('');
    
    // Get AI response immediately instead of waiting (removed the 500ms delay)
    getAIResponse(userMessage);
  };

  // Update the getAIResponse function for faster AI responses
  const getAIResponse = async (userMessage: string) => {
    try {
      // Get AI response
      let aiMessage;
      
      try {
        console.log('Calling Gemini API...');
        
        // Prepare conversation history with only the necessary context
        // This ensures we're not sending duplicate or unnecessary messages
        // Further reduced history context from 10 to 6 messages for faster processing
        const conversationHistory = sessionHistory.slice(-6);
        
        // Get the current origin to ensure the correct port is used
        const apiUrl = `${window.location.origin}/api/gemini`;
        
        // Use AbortController to set a timeout on the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Priority': 'high' // Signal high priority to browser
          },
          body: JSON.stringify({
            prompt: userMessage,
            middlePrompt: DEVELOPER_MIDDLE_PROMPT,
            history: conversationHistory // Pass only recent history for context
          }),
          signal: controller.signal,
          keepalive: true // Keep connection alive for better performance
        });
        
        clearTimeout(timeoutId); // Clear the timeout if the request completes
        
        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }
        
        const data = await response.json();
        aiMessage = data.text;
        console.log('AI response message:', aiMessage);
      } catch (apiError) {
        console.error('Error calling Gemini API:', apiError);
        // Fallback to simulated response
        const responses = [
          "I understand how you're feeling. That sounds challenging. How long have you been experiencing this?",
          "Thank you for sharing that with me. Can you tell me more about how this affects your daily life?",
          "I hear you, and your feelings are valid. What strategies have you tried so far to manage this?",
          "That's a lot to process. Let's take a moment to focus on what's most important to you right now.",
          "I appreciate your openness. It takes courage to discuss these things. How can I best support you today?",
          "I'm here for you. Let's work together to find approaches that might help with what you're going through."
        ];
        
        // Choose a response based on a simple hash of the user message
        const hash = userMessage.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const responseIndex = hash % responses.length;
        aiMessage = responses[responseIndex];
        console.log('Using simulated response:', aiMessage);
      }
      
      // Add AI response to history for context
      setSessionHistory(prev => [...prev, { role: 'assistant', content: aiMessage }]);
      
      // Update the current displayed message
      setAiResponse(aiMessage);
      setShowAiResponse(false);
      
      // First try Google Cloud TTS for the AI response
      console.log('Using Google Cloud TTS for AI response...');
      try {
        await generateSpeech(aiMessage);
      } catch (speechError) {
        console.error('Failed to generate Google Cloud TTS:', speechError);
        // Fallback is already handled in generateSpeech
      }
      
    } catch (apiError) {
      console.error('Error generating AI response:', apiError);
      
      // Fallback to a simple response
      const fallbackResponse = "I'm sorry, I'm having trouble connecting right now. Could you repeat that?";
      setAiResponse(fallbackResponse);
      setSessionHistory(prev => [...prev, { role: 'assistant', content: fallbackResponse }]);
      setShowAiResponse(true); // Show text response even if speech fails
      
      // Try to generate speech for the fallback
      generateBrowserTTS(fallbackResponse);
    }
  };

  // Update the generateSpeech function for faster TTS responses
  const generateSpeech = async (text: string) => {
    try {
      console.log('=== PRIMARY TTS: GOOGLE CLOUD TTS REQUEST ===');
      console.log('Text to convert:', text);
      
      // Set both processing and not listening to show correct indicators
      setIsProcessing(true);
      setIsListening(false);
      
      // Clean up previous audio resources before creating new ones
      if (audioRef.current) {
        // Stop any current playback
        audioRef.current.pause();
        
        // Reset URL to release memory
        try {
          URL.revokeObjectURL(audioRef.current.src);
        } catch (e) {
          console.log('No need to revoke URL', e);
        }
        audioRef.current.src = '';
      }
      
      // Get the current origin to ensure the correct port is used
      const apiUrl = `${window.location.origin}/api/tts`;
      
      // Use AbortController to set a timeout on the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Priority': 'high' // Signal high priority to browser
        },
        body: JSON.stringify({
          text,
          voice: {
            name: "en-US-Chirp3-HD-Achernar",
            languageCode: "en-US",
            ssmlGender: "FEMALE"
          },
          audioConfig: {
            audioEncoding: "MP3", // MP3 is typically faster to process than other formats
            effectsProfileId: ["small-bluetooth-speaker-class-device"],
            pitch: 0.0,
            speakingRate: 1.0 // Increased from 0.95 to 1.0 for slightly faster speech
          }
        }),
        signal: controller.signal,
        keepalive: true // Keep connection alive for better performance
      });
      
      clearTimeout(timeoutId); // Clear the timeout if the request completes
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Google TTS API error:', errorData);
        throw new Error(`API error (${response.status}): ${errorData.error || 'Unknown error'}`);
      }
      
      // Get audio data and play it
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.volume = volume;
        
        // Show the AI response right before starting to speak
        setShowAiResponse(true);
        
        // Preload the audio for faster playback
        audioRef.current.preload = "auto";
        
        // Use preloading approach for faster audio start
        audioRef.current.oncanplaythrough = () => {
          // Start speaking without delay - update state cleanly
          setIsSpeaking(true);
          setIsProcessing(false);
          
          console.log('Playing Google Cloud TTS audio response...');
          audioRef.current?.play().catch(error => {
            console.error('Error playing audio:', error);
            // Clean up states on error
            setIsSpeaking(false);
            setIsProcessing(false);
            setShowAiResponse(true); // Still show the text response if audio fails
            
            setTimeout(() => {
              if (sessionActive) {
                startListening();
              }
            }, 300); // Reduced from 500ms for faster recovery
          });
        };
      }
    } catch (ttsError) {
      console.error('Google Cloud TTS error, falling back to browser TTS:', ttsError);
      // Fall back to browser TTS when Google Cloud TTS fails
      generateBrowserTTS(text);
    }
  };

  // Update generateBrowserTTS for faster browser TTS responses
  const generateBrowserTTS = (text: string) => {
    console.log('=== FALLBACK TTS: Using browser speech synthesis ===');
    
    // Ensure states are set properly for indicators
    setIsProcessing(false);
    setIsListening(false);
    
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = volume;
      utterance.rate = 1.0;  // Increased from 0.95 to normal rate for faster response
      utterance.pitch = 1.0; // Normal pitch
      
      // Make sure voices are loaded - this can be async in some browsers
      let voices = window.speechSynthesis.getVoices();
      
      // In some browsers, voices might not be loaded immediately
      if (voices.length === 0) {
        console.log('No voices available yet, waiting for voices to load');
        
        // Set a timeout to wait for voices - reduced timeout from 1000ms to 500ms
        const waitForVoices = setTimeout(() => {
          voices = window.speechSynthesis.getVoices();
          console.log('Voices loaded:', voices.length);
          selectAndSpeak(voices);
        }, 500);
        
        // Also try the onvoiceschanged event if available
        if ('onvoiceschanged' in window.speechSynthesis) {
          window.speechSynthesis.onvoiceschanged = () => {
            clearTimeout(waitForVoices);
            voices = window.speechSynthesis.getVoices();
            console.log('Voices changed event fired. Voices loaded:', voices.length);
            selectAndSpeak(voices);
          };
        }
      } else {
        console.log('Voices already available:', voices.length);
        selectAndSpeak(voices);
      }
      
      // Function to select voice and start speaking
      function selectAndSpeak(availableVoices: SpeechSynthesisVoice[]) {
        console.log('Available browser voices:', availableVoices.map(v => v.name).join(', '));
        
        // Try to find a female voice, preferring ones with "female" in the name
        const femaleVoice = availableVoices.find(voice => 
          voice.name.toLowerCase().includes('female') || 
          voice.name.includes('Samantha') ||
          voice.name.includes('Google UK English Female') ||
          voice.name.includes('Microsoft Zira')
        );
        
        if (femaleVoice) {
          console.log('Selected female voice:', femaleVoice.name);
          utterance.voice = femaleVoice;
        } else if (availableVoices.length > 0) {
          // If no female voice found, just use the first available voice
          console.log('No female voice found, using first available voice:', availableVoices[0].name);
          utterance.voice = availableVoices[0];
        }
        
        utterance.onend = () => {
          console.log('Browser TTS finished speaking');
          setIsSpeaking(false);
          setShowAiResponse(true); // Keep the response visible after speaking
          
          // Add a slight delay before starting to listen again - reduced from 800ms to 500ms
          setTimeout(() => {
            if (sessionActive) {
              console.log('Starting to listen again after speech finished');
              startListening();
            }
          }, 500);
        };
        
        utterance.onerror = (error) => {
          console.error('Browser TTS error:', error);
          setIsSpeaking(false);
          setShowAiResponse(true); // Still show the response even if speech fails
          
          // Still try to resume listening - reduced from 800ms to 500ms
          setTimeout(() => {
            if (sessionActive) {
              startListening();
            }
          }, 500);
        };
        
        setIsSpeaking(true);
        
        // Show the AI response right before starting to speak
        setShowAiResponse(true);
        
        // Immediately start speech instead of using a timeout
        try {
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.error('Failed to start browser TTS:', err);
          setIsSpeaking(false);
          // Still try to resume listening - reduced delay
          setTimeout(() => {
            if (sessionActive) {
              startListening();
            }
          }, 500);
        }
      }
    } else {
      console.warn('Browser does not support speech synthesis');
      setIsSpeaking(false);
      setShowAiResponse(true); // Show the response even if we can't speak it
      
      // Reduced delay from 800ms to 500ms
      setTimeout(() => {
        if (sessionActive) {
          startListening();
        }
      }, 500);
    }
  };

  const beginSession = () => {
    // Check if user has sessions remaining in their subscription
    if (userSubscription && userSubscription.sessions_used >= userSubscription.sessions_limit) {
      toast.error(`You've reached your monthly limit of ${userSubscription.sessions_limit} sessions. Please upgrade your plan for more sessions.`);
      return;
    }
    
    setSessionActive(true);
    setSessionStartTime(new Date()); // Track when the session starts
    const greeting = "Hello! I'm your AI therapist. How can I help you today?";
    setGreetingMessage(greeting);
    setAiResponse(greeting);
    setShowAiResponse(true);
    setSessionHistory([{ role: 'assistant', content: greeting }]);
    
    // Set initial state to processing
    setIsProcessing(true);
    setIsListening(false);
    setIsSpeaking(false);
    
    // Set session duration timer based on subscription
    if (userSubscription) {
      const durationLimit = userSubscription.session_duration_limit * 60 * 1000; // convert to ms
      
      // Clear any existing timer
      if (sessionDurationTimerRef.current) {
        clearTimeout(sessionDurationTimerRef.current);
      }
      
      // Set new timer
      sessionDurationTimerRef.current = setTimeout(() => {
        toast(`Your session time limit of ${userSubscription.session_duration_limit} minutes has been reached.`);
        endSession();
      }, durationLimit);
    }
    
    // Debug API key and verify format
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_STUDIO_API_KEY;
    
    console.log('===== API KEY DEBUG & VERIFICATION =====');
    
    // First try Google Cloud TTS
    console.log('Starting with Google Cloud TTS for greeting');
    generateSpeech(greeting).catch(error => {
      console.error('Failed to generate Google Cloud TTS for greeting:', error);
      // Fall back to browser TTS if Google Cloud TTS fails
      console.log('Falling back to browser TTS');
      generateBrowserTTS(greeting);
    });
    
    // Check Google API key format
    if (!apiKey || apiKey.trim().length < 5) {
      console.error('⚠️ No valid Google API key found in environment variables');
    } else {
      const cleanedGoogleKey = apiKey.trim();
      console.log('Google API Key:', cleanedGoogleKey ? `${cleanedGoogleKey.substring(0, 5)}...${cleanedGoogleKey.substring(cleanedGoogleKey.length - 5)}` : 'missing');
      
      if (!cleanedGoogleKey.startsWith('AI')) {
        console.warn('⚠️ Google API key format warning: Key should typically start with "AI"');
      }
    }
    
    console.log('=========================');
    
    // Don't start listening yet - audio onended handler will trigger listening
  };
  
  const toggleVolume = () => {
    setVolume(prev => prev === 0 ? 1 : 0);
    if (volume === 1) {
      // Mute all audio immediately
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      
      // Update state to match the action
      setIsSpeaking(false);
      
      // After muting, maybe we want to start listening again
      setTimeout(() => {
        if (sessionActive && !isListening && !isProcessing) {
          startListening();
        }
      }, 800);
    }
  };
  
  const endSession = async () => {
    setSessionActive(false);
    
    // Clear session duration timer
    if (sessionDurationTimerRef.current) {
      clearTimeout(sessionDurationTimerRef.current);
      sessionDurationTimerRef.current = null;
    }
    
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    // Reset UI states
    setIsListening(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    
    // Save session to Firebase if we have conversation history
    if (sessionHistory.length > 0 && user && sessionStartTime) {
      try {
        // Calculate actual session duration
        const startTime = sessionStartTime;
        const endTime = new Date();
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationMinutes = Math.round(durationMs / 60000); // Convert ms to minutes
        
        // Create a summary from the conversation
        const summary = sessionHistory.length > 0 
          ? sessionHistory.filter(msg => msg.role === 'assistant').slice(-1)[0].content.substring(0, 80) + '...'
          : 'Brief session';
        
        // Format messages array with proper timestamps
        const messagesWithTimestamps = sessionHistory.map((msg, index) => ({
          role: msg.role,
          content: msg.content,
          sequence: index,
          timestamp: Timestamp.fromDate(new Date())
        }));
        
        // Store session metadata and messages array in Firestore
        const sessionRef = await addDoc(collection(db, 'sessions'), {
          user_id: user.uid,
          date: Timestamp.fromDate(new Date()),
          duration_minutes: durationMinutes,
          start_time: Timestamp.fromDate(startTime),
          end_time: Timestamp.fromDate(endTime),
          summary: summary,
          created_at: Timestamp.fromDate(new Date()),
          messages: messagesWithTimestamps // Store messages as an array in the session document
        });
        
        console.log('Session with conversation saved successfully with ID:', sessionRef.id);
        console.log('Session duration:', durationMinutes, 'minutes');
        
        // Update user's session count in their subscription
        if (userSubscription) {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            'subscription.sessions_used': userSubscription.sessions_used + 1
          });
          
          // Update local state
          setUserSubscription({
            ...userSubscription,
            sessions_used: userSubscription.sessions_used + 1
          });
          
          // Check if sessions limit has been reached after this session
          if (userSubscription.sessions_used + 1 >= userSubscription.sessions_limit) {
            setSubscriptionError(`You've reached your monthly limit of ${userSubscription.sessions_limit} sessions. Please upgrade your plan for more sessions.`);
          }
        }
        
        // Refresh the sessions list
        fetchUserSessions();
      } catch (error) {
        console.error('Error saving session to Firebase:', error);
      }
    }
    
    // Reset local state
    setGreetingMessage('');
    setTranscript('');
    setInterimTranscript('');
    setFinalTranscript('');
    setAiResponse('');
    setSessionHistory([]);
    setShowAiResponse(false);
    setSessionStartTime(null); // Reset session start time
  };

  // Add effect to update remaining time
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (sessionActive && sessionStartTime && userSubscription) {
      // Initialize the remaining time
      const durationLimitMs = userSubscription.session_duration_limit * 60 * 1000;
      setRemainingSessionTime(durationLimitMs);
      
      // Update the remaining time every second
      intervalId = setInterval(() => {
        const elapsedMs = Date.now() - sessionStartTime.getTime();
        const remainingMs = Math.max(0, durationLimitMs - elapsedMs);
        setRemainingSessionTime(remainingMs);
        
        // Show warnings when time is running out
        if (remainingMs === 60 * 1000) { // 1 minute left
          toast('1 minute of session time remaining');
        } else if (remainingMs === 30 * 1000) { // 30 seconds left
          toast('30 seconds of session time remaining');
        }
      }, 1000);
    } else {
      setRemainingSessionTime(null);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [sessionActive, sessionStartTime, userSubscription]);
  
  // Format remaining time for display
  const formatRemainingTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderActiveSection = () => {
    if (loading) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-pulse text-primary">Loading...</div>
        </div>
      );
    }

    if (!isAuthenticated) {
      if (showAuthForm) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="absolute top-4 left-4">
              <button 
                onClick={() => setShowAuthForm(false)}
                className="btn-ghost flex items-center gap-1 text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
                </svg>
                Back to Home
              </button>
            </div>
            <AuthForm onAuthComplete={() => setIsAuthenticated(true)} />
          </div>
        );
      }
      return <LandingPage onShowAuth={() => setShowAuthForm(true)} />;
    }

    switch (activeSection) {
      case 'history':
        return <SessionHistory sessions={sessions} />;
      case 'analysis':
        return <SessionAnalysis sessions={sessions} />;
      case 'profile':
        return <Profile user={user} sessions={sessions} />;
      case 'settings':
        return <Settings user={user} />;
      default:
        return (
          <div className="content-center animate-in">
            <div className="page-header">
              <h1 className="text-2xl font-medium tracking-tight text-primary">therapy space</h1>
              <p className="text-sm text-muted-foreground">breathe, relax, and connect</p>
            </div>
            
            <div className="welcome-section">
              <div className="therapist-status bg-card/70 border-primary/20">
                {sessionActive 
                  ? isListening 
                    ? "Listening to you..." 
                    : isSpeaking 
                      ? "AI is speaking..." 
                      : isProcessing 
                        ? "Processing your response..." 
                        : "Ready for conversation"
                  : "Your AI therapist is ready"}
                
                {/* Display remaining session time if active */}
                {sessionActive && remainingSessionTime !== null && (
                  <div className="mt-2 text-xs">
                    <span className={`font-medium ${remainingSessionTime < 60000 ? 'text-destructive' : ''}`}>
                      {formatRemainingTime(remainingSessionTime)}
                    </span> remaining
                  </div>
                )}
              </div>
              
              <TherapistCircle
                isListening={isListening}
                isSpeaking={isSpeaking}
                onToggle={toggleMicrophone}
              />
              
              {/* Conversation Elements */}
              {sessionActive && (
                <div className="flex flex-col items-center w-full gap-4 mt-6">
                  {/* AI Response - Shows most recent response */}
                  {showAiResponse && aiResponse && (
                    <div className="w-full max-w-md mt-4 mb-4">
                      <div className={`card-highlight p-4 transition-opacity duration-300 ${isListening ? 'opacity-70' : 'opacity-100'}`}>
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                              <path d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" />
                              <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
                            </svg>
                          </div>
                          <p className="flex-1">{aiResponse}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* User transcript - shows what's being captured while listening */}
                  {isListening && (
                    <div className="w-full max-w-md mb-4">
                      <div className="card p-4 border-accent/20 bg-accent/5">
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent flex-shrink-0 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                            </svg>
                          </div>
                          
                          <div className="flex-1">
                            {transcript ? (
                              <p>{transcript}</p>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Listening</span>
                                <span className="flex gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-accent/50 animate-pulse" style={{ animationDelay: '0ms' }}></span>
                                  <span className="w-1.5 h-1.5 rounded-full bg-accent/50 animate-pulse" style={{ animationDelay: '300ms' }}></span>
                                  <span className="w-1.5 h-1.5 rounded-full bg-accent/50 animate-pulse" style={{ animationDelay: '600ms' }}></span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Processing indicator */}
                  {isProcessing && !isSpeaking && (
                    <div className="w-full max-w-md mb-4">
                      <div className="card p-4 border-primary/20 bg-primary/5">
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-sm">Processing your response...</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Controls */}
                  <div className="flex items-center gap-4 mt-2">
                    <button 
                      className={`btn ${isListening ? 'bg-accent/10 text-accent border-accent' : 'btn-outline'}`}
                      onClick={toggleMicrophone}
                      disabled={isProcessing && !isSpeaking}
                    >
                      {isListening ? (
                        <span className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                            <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                          </svg>
                          Stop Listening
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                            <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                          </svg>
                          Start Listening
                        </span>
                      )}
                    </button>
                    
                    <button 
                      className="btn-outline"
                      onClick={toggleVolume}
                    >
                      {volume > 0 ? (
                        <span className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                            <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                          </svg>
                          Mute
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06z" />
                            <path d="M18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" strokeWidth={1.5} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" style={{ fill: 'none' }} />
                            <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" strokeWidth={1.5} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" style={{ fill: 'none' }} />
                          </svg>
                          Unmute
                        </span>
                      )}
                    </button>
                    
                    <button 
                      className="btn-outline hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                      onClick={endSession}
                    >
                      <span className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                        </svg>
                        End Session
                      </span>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Begin Session Button */}
              {!sessionActive && (
                <button 
                  className="begin-session-btn group relative overflow-hidden"
                  onClick={beginSession}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                    begin session
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary to-accent opacity-100 group-hover:opacity-80 transition-opacity"></div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
