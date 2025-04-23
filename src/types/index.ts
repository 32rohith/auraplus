import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp, FieldValue } from 'firebase/firestore';

// Subscription tier definitions
export enum SubscriptionTier {
  FREE = 'free',
  PLUS = 'plus',
  PRO = 'pro'
}

// Subscription data structure
export interface Subscription {
  tier: SubscriptionTier;
  sessions_limit: number;
  sessions_used: number;
  session_duration_limit: number; // in minutes
  renewal_date: Date | Timestamp | string | null | { seconds: number; nanoseconds: number; };
  updated_at?: Date | Timestamp | string | FieldValue;
  payment_id?: string;
  status?: 'active' | 'canceled' | 'past_due';
}

// User preferences
export interface UserPreferences {
  notifications: boolean;
  darkMode: boolean;
  language?: string;
  voice_enabled?: boolean;
}

// Complete User model
export interface User {
  id: string;
  email: string | null;
  name: string;
  created_at: Date | Timestamp | string | FieldValue;
  last_login: Date | Timestamp | string | FieldValue;
  subscription: Subscription;
  preferences?: UserPreferences;
  therapist_context?: string;
  updated_at?: Date | Timestamp | string | FieldValue;
  profile_image_url?: string;
  total_sessions?: number; 
  total_session_minutes?: number;
}

// Session message 
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date | Timestamp | string;
  sequence: number;
}

// Session data
export interface Session {
  id: string;
  user_id: string;
  date: Date | Timestamp | string;
  duration_minutes: number;
  messages: Message[];
  summary?: string;
  feelings?: string[];
  start_time?: Date | Timestamp | string;
  end_time?: Date | Timestamp | string;
}

// Auth context interface
export interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

// Subscription plan feature
export interface PlanFeature {
  name: string;
  included: boolean;
}

// Subscription plan definition
export interface Plan {
  id: SubscriptionTier;
  name: string;
  price: string;
  description: string;
  features: PlanFeature[];
  sessionLimit: number;
  durationLimit: number;
  recommended?: boolean;
} 