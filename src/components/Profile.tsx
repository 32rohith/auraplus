import React from 'react';
import { User } from 'firebase/auth';
import { motion } from 'framer-motion';

interface ProfileProps {
  user: User | null;
  sessions: any[]; // Using any for now, should be properly typed in a production app
}

const Profile: React.FC<ProfileProps> = ({ user, sessions }) => {
  // Calculate some basic statistics for the profile
  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((acc, session) => acc + (session.duration_minutes || 0), 0);
  const averageSessionLength = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
  
  // Find longest and shortest sessions
  let longestSession = 0;
  let shortestSession = Infinity;
  if (totalSessions > 0) {
    sessions.forEach(session => {
      const duration = session.duration_minutes || 0;
      if (duration > longestSession) longestSession = duration;
      if (duration < shortestSession && duration > 0) shortestSession = duration;
    });
  }
  if (shortestSession === Infinity) shortestSession = 0;
  
  // Get most recent session time
  const mostRecentSession = sessions.length > 0 
    ? new Date(sessions[0].created_at).toLocaleString() 
    : 'No sessions yet';
  
  // Count sessions by day of week
  const sessionsByDay = sessions.reduce((acc: {[key: string]: number}, session) => {
    const date = new Date(session.created_at);
    const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});
  
  // Find most active day
  let mostActiveDay = 'No sessions yet';
  let maxSessions = 0;
  
  Object.entries(sessionsByDay).forEach(([day, count]) => {
    if (count > maxSessions) {
      mostActiveDay = day;
      maxSessions = count;
    }
  });
  
  // Calculate preferred time of day
  const sessionsByHour = sessions.reduce((acc: {[key: string]: number}, session) => {
    if (session.start_time) {
      const date = new Date(session.start_time.seconds * 1000);
      const hour = date.getHours();
      
      if (hour >= 5 && hour < 12) acc['Morning'] = (acc['Morning'] || 0) + 1;
      else if (hour >= 12 && hour < 17) acc['Afternoon'] = (acc['Afternoon'] || 0) + 1;
      else if (hour >= 17 && hour < 21) acc['Evening'] = (acc['Evening'] || 0) + 1;
      else acc['Night'] = (acc['Night'] || 0) + 1;
    }
    return acc;
  }, {});
  
  let preferredTime = 'No pattern yet';
  let maxTimeCount = 0;
  
  Object.entries(sessionsByHour).forEach(([timeOfDay, count]) => {
    if (count > maxTimeCount) {
      preferredTime = timeOfDay;
      maxTimeCount = count;
    }
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="page-header">
        <h1 className="text-2xl font-medium tracking-tight text-primary">your profile</h1>
        <p className="text-sm text-muted-foreground">insights and statistics</p>
      </div>
      
      <div className="space-y-8">
        {/* User Info Card */}
        <motion.div 
          className="card p-6 border-primary/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl text-primary-foreground relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary to-accent/90"></div>
              <span className="relative z-10">{user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}</span>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-medium">
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {user?.email}
              </p>
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary/70"></span>
                <span>Member since {user?.metadata?.creationTime 
                  ? new Date(user.metadata.creationTime).toLocaleDateString() 
                  : 'unknown date'}</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Session Stats Card */}
        <motion.div 
          className="card p-6 border-primary/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3 className="text-lg font-medium mb-4 text-primary/90">session analysis</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex flex-col p-3 bg-primary/5 rounded-lg border border-primary/10">
              <span className="text-2xl font-medium text-primary">{totalSessions}</span>
              <span className="text-sm text-muted-foreground">total sessions</span>
            </div>
            
            <div className="flex flex-col p-3 bg-primary/5 rounded-lg border border-primary/10">
              <span className="text-2xl font-medium text-primary">{totalMinutes}</span>
              <span className="text-sm text-muted-foreground">total minutes</span>
            </div>
            
            <div className="flex flex-col p-3 bg-primary/5 rounded-lg border border-primary/10">
              <span className="text-2xl font-medium text-primary">{averageSessionLength}</span>
              <span className="text-sm text-muted-foreground">avg. minutes/session</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
            <h4 className="font-medium mb-2">Session Duration Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Longest Session</p>
                <p className="font-medium">{longestSession} minutes</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Shortest Session</p>
                <p className="font-medium">{shortestSession} minutes</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Pattern Analysis Card */}
        <motion.div 
          className="card p-6 border-primary/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3 className="text-lg font-medium mb-4 text-primary/90">patterns & insights</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">📅</div>
              <div>
                <h4 className="font-medium">Most active day</h4>
                <p className="text-sm text-muted-foreground">{mostActiveDay}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">⏱️</div>
              <div>
                <h4 className="font-medium">Typical session length</h4>
                <p className="text-sm text-muted-foreground">
                  {averageSessionLength > 0 
                    ? `About ${averageSessionLength} minutes` 
                    : 'Not enough data yet'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">🕒</div>
              <div>
                <h4 className="font-medium">Preferred time</h4>
                <p className="text-sm text-muted-foreground">{preferredTime}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">📆</div>
              <div>
                <h4 className="font-medium">Most recent session</h4>
                <p className="text-sm text-muted-foreground">{mostRecentSession}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile; 