import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase/config';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  Timestamp,
  getDoc,
  doc
} from 'firebase/firestore';

interface Message {
  role: string;
  content: string;
  sequence: number;
  timestamp: Timestamp | string;
}

interface Session {
  id: string;
  user_id: string;
  date: Timestamp | string;
  duration_minutes: number;
  start_time?: Timestamp | string;
  end_time?: Timestamp | string;
  summary: string;
  created_at: Timestamp | string;
  messages?: Message[]; // The messages array is now part of the session document
}

interface SessionHistoryProps {
  sessions: Session[];
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ sessions }) => {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const viewSessionDetails = async (sessionId: string, session: Session) => {
    if (selectedSession === sessionId) {
      // Toggle off if already selected
      setSelectedSession(null);
      return;
    }

    setLoading(true);
    setSelectedSession(sessionId);
    
    // If the session already has messages, we don't need to fetch them
    if (!session.messages) {
      try {
        // If for some reason messages aren't in the session document, try to fetch the full session
        const sessionDoc = await getDoc(doc(db, 'sessions', sessionId));
        if (sessionDoc.exists()) {
          const fullSession = sessionDoc.data() as Session;
          if (fullSession.messages) {
            // Update the session in the array with its messages
            const sessionIndex = sessions.findIndex(s => s.id === sessionId);
            if (sessionIndex !== -1) {
              sessions[sessionIndex].messages = fullSession.messages;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching session details from Firebase:', error);
      }
    }
    
    setLoading(false);
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 bg-primary/5 rounded-xl border border-primary/10">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary text-2xl">📋</div>
        <p className="text-muted-foreground">No previous sessions found. Your session history will appear here.</p>
      </div>
    );
  }

  const formatDate = (dateValue: Timestamp | string) => {
    let date;
    if (dateValue instanceof Timestamp) {
      date = dateValue.toDate();
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else {
      date = new Date(); // Fallback
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatTimeRange = (session: Session) => {
    if (!session.start_time || !session.end_time) {
      return `${session.duration_minutes} minutes`;
    }

    const startDate = session.start_time instanceof Timestamp ? 
      session.start_time.toDate() : new Date(session.start_time);
    
    const endDate = session.end_time instanceof Timestamp ? 
      session.end_time.toDate() : new Date(session.end_time);
    
    const startTime = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const endTime = endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    return `${startTime} - ${endTime} (${session.duration_minutes} min)`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M5.25 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75z" />
            <path fillRule="evenodd" d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12zm4.75 0a.75.75 0 01.75-.75h8.5a.75.75 0 010 1.5H7.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-primary">Your Sessions</h2>
      </div>
      
      {sessions.map((session, index) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className="bg-card rounded-lg shadow-sm p-5 border border-primary/10 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="font-medium text-foreground">{formatDate(session.date)}</div>
                <div className="flex items-center text-sm text-primary ml-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                  </svg>
                  {formatTimeRange(session)}
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm mt-1">{session.summary}</p>
              
              <div className="mt-3 flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  {session.start_time && (
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 mr-1 text-primary/70">
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                      </svg>
                      {session.duration_minutes} minutes
                    </span>
                  )}
                </div>
                
                <button 
                  className="flex items-center gap-1.5 px-3 py-1 text-sm text-primary bg-primary/5 hover:bg-primary/10 rounded-full transition-colors"
                  onClick={() => viewSessionDetails(session.id, session)}
                >
                  {selectedSession === session.id ? "Hide details" : "View details"}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className={`w-4 h-4 transition-transform ${selectedSession === session.id ? "rotate-180" : ""}`}
                  >
                    <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {selectedSession === session.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-primary/10"
            >
              {session.start_time && session.end_time && (
                <div className="flex items-center justify-between mb-3 bg-primary/5 p-3 rounded-lg text-xs">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1.5 text-primary/70">
                      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM6.262 6.072a8.25 8.25 0 1010.562-.766 4.5 4.5 0 01-1.318 1.357L14.25 7.5l.165.33a.809.809 0 01-1.086 1.085l-.604-.302a1.125 1.125 0 01-.622-1.006v-1.089c0-.298.119-.585.33-.796l.436-.436a4.5 4.5 0 01-2.91.471l-1.293.97a.809.809 0 01-1.086-1.086l.302-.604a1.125 1.125 0 011.006-.622h1.089c.298 0 .585.119.796.33l.436.436a4.5 4.5 0 01.47-2.91l-.97-1.293a.809.809 0 111.085-1.086l.604.302a1.125 1.125 0 01.622 1.006v1.089c0 .298-.119.585-.33.796l-.436.436a4.5 4.5 0 012.91.471l1.293-.97a.809.809 0 011.086 1.086l-.302.604a1.125 1.125 0 01-1.006.622h-1.089c-.298 0-.585-.119-.796-.33l-.436-.436a4.5 4.5 0 01-.471 2.91l.97 1.293a.809.809 0 01-1.085 1.086l-.604-.302a1.125 1.125 0 01-.622-1.006v-1.089c0-.298.119-.585.33-.796l.436-.436a4.5 4.5 0 01-2.91-.471l-1.293.97a.809.809 0 01-1.086-1.086l.302-.604a1.125 1.125 0 011.006-.622h1.089c.298 0 .585.119.796.33l.436.436a4.5 4.5 0 01.471-2.91l-.97-1.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-primary/90 font-medium">Started:</span>
                    <span className="ml-1.5">{formatDate(session.start_time)}</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1.5 text-primary/70">
                      <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                    </svg>
                    <span className="text-primary/90 font-medium">Ended:</span>
                    <span className="ml-1.5">{formatDate(session.end_time)}</span>
                  </div>
                </div>
              )}
              
              {loading ? (
                <div className="text-center py-6">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-3">Loading conversation...</p>
                </div>
              ) : session.messages && session.messages.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto p-2 conversation-container">
                  {session.messages
                    .sort((a, b) => a.sequence - b.sequence) // Ensure messages are in sequence order
                    .map((message, msgIndex) => (
                    <div 
                      key={`${session.id}-msg-${msgIndex}`}
                      className={`p-3 rounded-lg ${
                        message.role === 'assistant' 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'bg-accent/5 border border-accent/10'
                      }`}
                    >
                      <div className="flex items-center mb-1.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                          message.role === 'assistant' 
                            ? 'bg-primary/20 text-primary' 
                            : 'bg-accent/20 text-accent'
                        }`}>
                          {message.role === 'assistant' ? 
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                              <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
                              <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
                            </svg>
                            : 
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                            </svg>
                          }
                        </div>
                        <p className="text-xs font-medium text-muted-foreground">
                          {message.role === 'assistant' ? 'AI Therapist' : 'You'}
                        </p>
                      </div>
                      <p className="text-sm text-foreground pl-7">{message.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-primary/5 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 mx-auto mb-2 text-primary/40">
                    <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-muted-foreground">No conversation data available</p>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default SessionHistory; 