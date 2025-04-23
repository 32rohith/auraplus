# User Model and Subscription System Documentation

This document outlines the user model and subscription system implementation in the Aura Plus therapy application.

## User Model Overview

The application uses a comprehensive user model that stores user information, preferences, and subscription details in Firebase Firestore. The main user model is defined in `src/types/index.ts` and follows this structure:

```typescript
export interface User {
  id: string;                      // Firebase Auth UID
  email: string | null;            // User's email address
  name: string;                    // User's display name
  created_at: Date | Timestamp;    // Account creation timestamp
  last_login: Date | Timestamp;    // Last login timestamp
  subscription: Subscription;      // Subscription information
  preferences?: UserPreferences;   // User preferences (optional)
  therapist_context?: string;      // Custom therapist context (optional)
  updated_at?: Date | Timestamp;   // Last update timestamp (optional)
  profile_image_url?: string;      // Profile image URL (optional)
  total_sessions?: number;         // Total number of sessions (optional)
  total_session_minutes?: number;  // Total minutes in sessions (optional)
}
```

## Subscription System

The application implements a tiered subscription model with three levels:

| Tier | Price | Sessions | Duration | Features |
|------|-------|----------|----------|----------|
| Free | $0 | 3 per month | 10 minutes | Basic session history |
| Plus | $12 | 8 per month | 20 minutes | Extended session history |
| Pro | $20 | 20 per month | 30 minutes | Extended history & Priority support |

### Subscription Data Structure

Each user's subscription data is stored as part of their user record:

```typescript
export interface Subscription {
  tier: SubscriptionTier;                  // 'free', 'plus', or 'pro'
  sessions_limit: number;                  // Max sessions per month
  sessions_used: number;                   // Number of sessions used this month
  session_duration_limit: number;          // Max minutes per session
  renewal_date: Date | Timestamp | string; // Next renewal date
  updated_at?: Date | Timestamp | string;  // Last update timestamp
  payment_id?: string;                     // Payment processor ID (reserved)
  status?: 'active' | 'canceled' | 'past_due'; // Subscription status
}
```

### Implementation

The subscription system is implemented across several components:

1. **AuthForm Component** (`src/components/AuthForm.tsx`):
   - Creates new users with a default "free" tier subscription
   - Sets initial subscription parameters (3 sessions, 10 minutes each)

2. **SubscriptionPlans Component** (`src/components/SubscriptionPlans.tsx`):
   - Displays available subscription plans
   - Handles subscription upgrades
   - Updates the user's subscription details in Firestore

3. **Settings Component** (`src/components/Settings.tsx`):
   - Displays current subscription details
   - Shows renewal date, usage limits, and remaining sessions
   - Integrates the SubscriptionPlans component for upgrades

## Session Limits and Enforcement

The application enforces session limits through the following mechanisms:

1. **Session Counting**:
   - Each time a user completes a therapy session, the `sessions_used` counter is incremented
   - This is tracked in Firestore as part of the user's subscription data

2. **Duration Limits**:
   - Session duration is limited based on the user's subscription tier
   - The app enforces these limits during active therapy sessions

3. **Renewal**:
   - Subscription limits reset monthly (assumed to be 30 days after the start date in the current implementation)
   - In a production environment, this would be tied to the payment system

## Future Enhancements

The current subscription system is designed to support future enhancements:

1. **Payment Integration**:
   - Integration with Stripe or another payment processor
   - Payment ID tracking in the subscription object

2. **Subscription Status Tracking**:
   - Active/canceled/past due status tracking
   - Grace periods for payment issues

3. **Proration**:
   - Support for mid-cycle subscription changes with prorated billing

4. **Additional Tiers**:
   - The system is designed to easily add new subscription tiers

## Implementation Notes

- The subscription data is stored directly in the user's document in Firestore
- The types are defined in `src/types/index.ts`
- The application uses TypeScript interfaces to ensure type safety
- Sessions are tracked in a separate Firestore collection with references to the user ID 