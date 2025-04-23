import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TherapistCircleProps {
  isListening: boolean;
  isSpeaking: boolean;
  onToggle: () => void;
}

const TherapistCircle: React.FC<TherapistCircleProps> = ({ 
  isListening, 
  isSpeaking, 
  onToggle 
}) => {
  const [pulseSize, setPulseSize] = useState(1);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSpeaking) {
      interval = setInterval(() => {
        setPulseSize(prev => (prev === 1 ? 1.05 : 1));
      }, 500);
    } else if (isListening) {
      interval = setInterval(() => {
        setPulseSize(prev => (prev === 1 ? 1.03 : 1));
      }, 300);
    }
    
    return () => {
      if (interval) clearInterval(interval);
      setPulseSize(1);
    };
  }, [isSpeaking, isListening]);

  return (
    <div className="therapist-avatar-container" onClick={onToggle}>
      <motion.div
        className={`therapist-avatar cursor-pointer backdrop-blur-sm ${
          isListening 
            ? 'bg-primary border-primary/50' 
            : isSpeaking 
              ? 'bg-primary border-primary/70' 
              : 'bg-primary/90 border-primary/30'
        }`}
        animate={{ 
          scale: pulseSize,
          boxShadow: isListening || isSpeaking 
            ? '0 0 30px rgba(var(--color-primary-rgb), 0.4)' 
            : '0 0 20px rgba(var(--color-primary-rgb), 0.2)'
        }}
        transition={{ 
          type: 'spring',
          stiffness: 300,
          damping: 15
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary-foreground/10 rounded-full"></div>
        
        {isListening && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              className="w-1/2 h-1/2 rounded-full border-2 border-primary-foreground/50 opacity-30"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.1, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        )}
        
        {isSpeaking && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex space-x-1">
              {[1, 2, 3].map((bar) => (
                <motion.div
                  key={bar}
                  className="w-1 h-4 bg-primary-foreground/80 rounded-full"
                  animate={{
                    height: [4, 12, 4],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: bar * 0.1,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TherapistCircle; 