# Firebase Setup for Aura Plus

This document explains how to set up Firebase for the Aura Plus application to handle authentication and store conversation history.

## Firebase Services Used

The application uses the following Firebase services:

1. **Firebase Authentication** - For user authentication
2. **Firestore Database** - To store users and sessions with conversation data

## Setup Instructions

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Add a web app to your project
4. Set up Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password authentication
5. Set up Firestore Database:
   - Go to Firestore Database > Create database
   - Start in production mode
   - Choose a location close to your users
   - Create the database

## Firestore Collections

The application uses the following collections:

### Users Collection
Contains user information:
```
users/{userId}
  - id: string (Firebase Auth UID)
  - email: string
  - name: string
  - created_at: timestamp
  - last_login: timestamp
```

### Sessions Collection
Stores session metadata and conversation messages:
```
sessions/{sessionId}
  - user_id: string (References a user)
  - date: timestamp
  - duration_minutes: number
  - summary: string
  - created_at: timestamp
  - messages: array [
      {
        role: string ('user' or 'assistant'),
        content: string,
        sequence: number,
        timestamp: timestamp
      }
    ]
```

## Security Rules

Add these Firestore security rules to protect your data:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Sessions can only be read/written by the user they belong to
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.user_id;
    }
  }
}
```

## Environment Variables

Set up these environment variables in your `.env.local` file:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Using Firebase in the App

The application is already set up to:

1. Authenticate users using Firebase Authentication
2. Store user data in the Firestore `users` collection
3. Store session metadata and conversation messages in the `sessions` collection
4. Display conversation history from Firebase

## Troubleshooting

If you encounter issues:

1. Verify your Firebase API keys in `.env.local` are correct
2. Check Firebase console for any error logs
3. Ensure Firestore is properly initialized
4. Verify your security rules allow the operations you're trying to perform
5. Make sure you have the correct Firebase dependencies in your package.json 