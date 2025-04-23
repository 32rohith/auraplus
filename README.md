# Aura Plus - AI Therapist Platform

## Overview
Aura Plus is an AI-powered therapist platform that provides secure, interactive voice-based therapy sessions with real-time analysis.

## Features
- 🔐 Secure Authentication
- 🎙️ Interactive Voice Sessions
- 📝 Session History Tracking
- 🧠 Mental Health Analysis
- 💬 Real-time Communication

## Tech Stack
- **Frontend**: Next.js, Tailwind CSS, Framer Motion
- **Backend**: Firebase (Authentication & Data Storage)
- **Real-time**: Socket.IO
- **AI/ML**: 
  - Google Generative AI Studio (STT, LLM)
  - Google Cloud Text-to-Speech (TTS)

## Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm or yarn
- Firebase account
- Google Cloud TTS API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/aura-plus.git
cd aura-plus
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Google AI Studio API Key
NEXT_PUBLIC_GOOGLE_AI_STUDIO_API_KEY=your_google_api_key
```

4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure
```
aura-plus/
├── src/                    # Source code
│   ├── app/                # Next.js app router
│   │   ├── page.tsx        # Main application page
│   │   ├── layout.tsx      # Root layout
│   │   └── api/            # API routes
│   │       ├── gemini/     # Gemini proxy
│   │       └── tts/        # Text-to-Speech proxy
│   ├── components/         # Reusable components
│   │   ├── AuthForm.tsx    # Authentication form
│   │   ├── TherapistCircle.tsx # AI circle interface
│   │   └── SessionHistory.tsx # Session history display
│   └── lib/                # Utility functions
│       ├── firebase/       # Firebase configuration
│       └── supabase/       # Supabase configuration
├── public/                 # Static assets
└── .env.local              # Environment variables
```

## License
This project is licensed under the MIT License.

## Acknowledgments
- Inspired by calmi.so and gallereee.framer.website
- Built with Next.js, Firebase, and Supabase
- Powered by Google Generative AI Studio and Google Cloud Text-to-Speech
