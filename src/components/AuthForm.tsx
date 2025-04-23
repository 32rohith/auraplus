import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from '@/lib/firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { User, SubscriptionTier } from '@/types';

interface AuthFormProps {
  onAuthComplete: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthComplete }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Store user data in Firebase Firestore
  const storeUserInFirestore = async (userCredential: UserCredential, displayName?: string) => {
    try {
      const { user } = userCredential;
      const userRef = doc(db, 'users', user.uid);
      
      // Check if user already exists
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // If user doesn't exist, create new user document with free tier subscription
        // For Google sign-in, use the Google display name or email prefix if display name not provided
        const userName = displayName || user.displayName || name || user.email?.split('@')[0] || 'User';
        
        const userData: Partial<User> = {
          id: user.uid,
          email: user.email,
          name: userName,
          created_at: serverTimestamp(),
          last_login: serverTimestamp(),
          subscription: {
            tier: SubscriptionTier.FREE,
            sessions_limit: 3,
            session_duration_limit: 10, // in minutes
            sessions_used: 0,
            renewal_date: new Date(new Date().setMonth(new Date().getMonth() + 1)), // 1 month from now
          }
        };
        
        await setDoc(userRef, userData);
        console.log('User profile created in Firebase Firestore with free tier subscription');
      } else {
        // Update last login time
        await setDoc(userRef, {
          last_login: serverTimestamp(),
          email: user.email // Update email in case it changed
        }, { merge: true });
        console.log('User login time updated in Firebase Firestore');
      }
    } catch (error) {
      console.error('Error storing user in Firebase Firestore:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Store the user in Firebase
      await storeUserInFirestore(userCredential);
      
      onAuthComplete();
    } catch (error: unknown) {
      interface FirebaseError {
        code?: string;
        message?: string;
      }
      
      const firebaseError = error as FirebaseError;
      setError(firebaseError.message || 'Failed to authenticate with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // For sign up, validate that name is provided
    if (isSignUp && !name.trim()) {
      setError('Name is required for sign up');
      setLoading(false);
      return;
    }

    try {
      let userCredential: UserCredential;
      
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Store the new user in Firebase
        await storeUserInFirestore(userCredential, name);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Update user login time
        await storeUserInFirestore(userCredential);
      }
      
      onAuthComplete();
    } catch (error: unknown) {
      interface FirebaseError {
        code?: string;
        message?: string;
      }
      
      const firebaseError = error as FirebaseError;
      setError(firebaseError.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full mx-auto p-6 bg-card dark:bg-card rounded-lg shadow-md border border-border"
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-foreground">
        {isSignUp ? 'Create Account' : 'Welcome Back'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {isSignUp && (
          <div className="mb-4">
            <label className="block text-foreground text-sm font-medium mb-2" htmlFor="name">
              Name <span className="text-destructive">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required={isSignUp}
            />
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-foreground text-sm font-medium mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-foreground text-sm font-medium mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-primary-foreground font-medium ${
            loading 
              ? 'bg-primary/70 cursor-not-allowed' 
              : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>
      
      <div className="mt-4 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">OR</span>
        </div>
      </div>
      
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-4 rounded-md border border-input bg-background hover:bg-muted transition-colors font-medium"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
          <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
          </g>
        </svg>
        {isSignUp ? 'Sign Up with Google' : 'Sign In with Google'}
      </button>
      
      <div className="mt-4 text-center">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-primary hover:underline"
        >
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
      </div>
    </motion.div>
  );
};

export default AuthForm; 