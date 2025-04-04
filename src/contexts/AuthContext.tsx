import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  applyActionCode,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';

// Define user type
interface User {
  uid: string;
  email: string | null;
  name: string | null;
  emailVerified: boolean;
}

// Define auth context type
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  token: string | null;
  register: (email: string, password: string, name: string) => Promise<any>;
  verifyEmail: (actionCode: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<any>;
  resendVerificationEmail: (email: string, password: string) => Promise<any>;
}

// Create auth context with default values
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  token: null,
  register: async () => {},
  verifyEmail: async () => {},
  login: async () => {},
  logout: async () => {},
  forgotPassword: async () => {},
  resendVerificationEmail: async () => {},
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Helper function to convert Firebase user to our User type
const formatUser = (user: FirebaseUser): User => ({
  uid: user.uid,
  email: user.email,
  name: user.displayName,
  emailVerified: user.emailVerified
});

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('authToken'));

  // Register function
  const register = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Set display name
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      // Send verification email
      await sendEmailVerification(userCredential.user);
      
      // Get token
      const token = await userCredential.user.getIdToken();
      
      // Store token and user data
      localStorage.setItem('authToken', token);
      setToken(token);
      
      const formattedUser = formatUser(userCredential.user);
      setCurrentUser(formattedUser);
      setIsAuthenticated(true);
      
      return {
        user: formattedUser,
        token
      };
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during registration');
      }
      throw error;
    }
  };

  // Verify email function
  const verifyEmail = async (actionCode: string) => {
    try {
      setError(null);
      await applyActionCode(auth, actionCode);
      
      // If the current user exists, update their emailVerified status
      if (auth.currentUser) {
        // Reload the user to get the updated emailVerified status
        await auth.currentUser.reload();
        setCurrentUser(prev => prev ? {...prev, emailVerified: true} : null);
      }
      
      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during email verification');
      }
      throw error;
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        // Send a new verification email
        await sendEmailVerification(userCredential.user);
        // Sign out the user
        await signOut(auth);
        throw new Error('Email not verified. A new verification email has been sent to your email address.');
      }
      
      // Get token
      const token = await userCredential.user.getIdToken();
      
      // Store token and user data
      localStorage.setItem('authToken', token);
      setToken(token);
      
      const formattedUser = formatUser(userCredential.user);
      setCurrentUser(formattedUser);
      setIsAuthenticated(true);
      
      return {
        user: formattedUser,
        token
      };
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during login');
      }
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setError(null);
      
      // Sign out with Firebase Auth
      await signOut(auth);
      
      // Clear token and user data
      localStorage.removeItem('authToken');
      setToken(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during logout');
      }
      throw error;
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during forgot password request');
      }
      throw error;
    }
  };

  // Resend verification email function
  const resendVerificationEmail = async (email: string, password: string) => {
    try {
      setError(null);
      
      // Sign in with Firebase Auth (required to send verification email)
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Send verification email
      await sendEmailVerification(userCredential.user);
      
      // Sign out the user
      await signOut(auth);
      
      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred while sending verification email');
      }
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        const formattedUser = formatUser(user);
        setCurrentUser(formattedUser);
        
        // Get token
        user.getIdToken().then(token => {
          localStorage.setItem('authToken', token);
          setToken(token);
          setIsAuthenticated(true);
        });
      } else {
        setCurrentUser(null);
        localStorage.removeItem('authToken');
        setToken(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated,
    token,
    register,
    verifyEmail,
    login,
    logout,
    forgotPassword,
    resendVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 