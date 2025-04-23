import { NextResponse } from 'next/server';

// Add type declarations for @google-cloud/speech
declare module '@google-cloud/speech' {
  export interface RecognitionConfig {
    encoding?: string;
    sampleRateHertz?: number;
    languageCode: string;
    model?: string;
    useEnhanced?: boolean;
    enableAutomaticPunctuation?: boolean;
    enableSpokenPunctuation?: {value: boolean};
    enableSpokenEmojis?: {value: boolean};
    maxAlternatives?: number;
    speechContexts?: Array<{
      phrases: string[];
      boost?: number;
    }>;
  }

  export interface RecognitionAudio {
    content: string;
  }

  export interface RecognizeRequest {
    audio: RecognitionAudio;
    config: RecognitionConfig;
  }

  export interface SpeechClientOptions {
    projectId?: string;
    credentials?: {
      client_email: string;
      private_key: string;
    };
    apiKey?: string;
  }

  export interface SpeechResponse {
    results: Array<{
      alternatives: Array<{
        transcript: string;
        confidence: number;
      }>;
    }>;
  }
  
  // Remove SpeechClient interface completely as we'll use the dynamically imported version
}

// Uncomment development mode for testing when credentials aren't available
export async function POST(request: Request) {
  try {
    console.log('STT API: Request received');
    // Get the audio data from the request
    const audioData: Blob = await request.blob();
    console.log('STT API: Audio blob received, size:', audioData.size, 'bytes');
    
    // Check for required API key
    if (!process.env.GOOGLE_CLOUD_API_KEY) {
      console.error('STT API Error: Missing Google Cloud API key');
      return NextResponse.json({
        success: false,
        transcript: null,
        message: "Google Cloud API key not configured. Please set the GOOGLE_CLOUD_API_KEY environment variable.",
        requiredCredentials: [
          "GOOGLE_CLOUD_API_KEY"
        ]
      }, { status: 500 });
    }
    
    // Log API key info (safely)
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    console.log('STT API: Using API key:', apiKey ? `${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 3)}` : 'missing');
    
    // Convert audio blob to base64
    const arrayBuffer: ArrayBuffer = await audioData.arrayBuffer();
    const buffer: Buffer = Buffer.from(arrayBuffer);
    const audioContent: string = buffer.toString('base64');
    
    // Try to determine the audio format based on the first few bytes
    let encoding;
    const contentType = request.headers.get('content-type') || '';
    console.log('STT API: Content-Type:', contentType);
    
    if (contentType.includes('audio/webm') || contentType.includes('opus')) {
      encoding = 'WEBM_OPUS';
      console.log('STT API: Using WEBM_OPUS encoding based on Content-Type');
    } else if (contentType.includes('audio/mp4') || contentType.includes('aac')) {
      encoding = 'MP3';
      console.log('STT API: Using MP3 encoding based on Content-Type');
    } else {
      // Default to WEBM_OPUS as it's most common from the browser
      encoding = 'WEBM_OPUS';
      console.log('STT API: Using default WEBM_OPUS encoding');
    }
    
    try {
      // Dynamically import the Google Cloud Speech client
      const speech = await import('@google-cloud/speech');
      console.log('STT API: Successfully imported @google-cloud/speech library');
      
      try {
        // Initialize the Speech client with API key
        const client = new speech.v1.SpeechClient({
          apiKey: process.env.GOOGLE_CLOUD_API_KEY
        });
        console.log('STT API: Successfully initialized SpeechClient');
      
        // Configure the request
        const request = {
          audio: {
            content: audioContent
          },
          config: {
            // Use the determined encoding with type safety
            encoding: encoding === 'WEBM_OPUS' 
              ? speech.protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.WEBM_OPUS
              : encoding === 'MP3'
                ? speech.protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3
                : speech.protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.WEBM_OPUS,
            sampleRateHertz: 48000,
            languageCode: 'en-US',
            model: 'latest_long',  // Using the best model for conversational speech
            useEnhanced: true,
            enableAutomaticPunctuation: true,
            enableSpokenPunctuation: {value: true},
            enableSpokenEmojis: {value: true},
            maxAlternatives: 1,
            speechContexts: [
              {
                phrases: [
                  'therapy', 'feel', 'feeling', 'emotion', 'emotions', 
                  'anxious', 'anxiety', 'depressed', 'depression',
                  'stress', 'worried', 'fear', 'sad', 'happy', 'angry',
                  'frustrated', 'overwhelmed', 'coping', 'strategies',
                  'mindfulness', 'meditation', 'breathing', 'exercise',
                  'sleep', 'eating', 'relationship', 'work', 'family'
                ],
                boost: 10
              }
            ]
          }
        };
        console.log('STT API: Request configured', JSON.stringify(request.config, null, 2));
        
        // Call the Google Cloud Speech-to-Text API
        console.log('STT API: Sending audio to Google Cloud STT API...');
        const [response] = await client.recognize(request);
        console.log('STT API: Received response from Google Cloud STT API');
      
      // Process the response and return the transcript
      const transcription = response.results 
        ? response.results
            .map((result: any) => result.alternatives?.[0]?.transcript)
            .filter(Boolean)
            .join(' ')  // Join with space instead of newline for better flow
        : '';
      
      const confidence = response.results && response.results[0]?.alternatives?.[0]?.confidence || 0;
      
      // Log the transcript for debugging
      console.log('Transcription:', transcription);
      
      // Return the transcript
      return NextResponse.json({
        success: true,
        transcript: transcription,
        confidence,
        model: 'latest_long'
      });
      } catch (clientError) {
        console.error('STT API: Error with Speech client:', clientError);
        return NextResponse.json({
          success: false,
          error: 'Google Cloud Speech client error',
          details: clientError instanceof Error ? clientError.message : 'Unknown error',
          stack: clientError instanceof Error ? clientError.stack : null
        }, { status: 500 });
      }
    } catch (importError) {
      console.error('Google Cloud Speech library import error:', importError);
      return NextResponse.json({ 
        success: false, 
        error: 'Google Cloud Speech library not installed',
        solution: 'Run: npm install @google-cloud/speech'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('STT API error:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process audio',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Implementation notes for future development:
/*
To implement this properly with Google Cloud Speech-to-Text:

1. Add Google Cloud Speech-to-Text credentials to your environment variables:
   - GOOGLE_CLOUD_PROJECT_ID
   - GOOGLE_CLOUD_CLIENT_EMAIL
   - GOOGLE_CLOUD_PRIVATE_KEY

2. Install the Google Cloud Speech client library:
   npm install @google-cloud/speech

3. Example complete implementation:

   import { SpeechClient } from '@google-cloud/speech';
   import { NextResponse } from 'next/server';

   // Initialize the Speech client with your credentials
   const speechClient = new SpeechClient({
     projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
     credentials: {
       client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
       private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n')
     }
   });

   export async function POST(request: Request) {
     try {
       // Get the audio data from the request
       const audioBlob = await request.blob();
       
       // Convert Blob to Base64
       const arrayBuffer = await audioBlob.arrayBuffer();
       const buffer = Buffer.from(arrayBuffer);
       const audioContent = buffer.toString('base64');
       
       // Configure the request to Google Cloud Speech-to-Text
       const [response] = await speechClient.recognize({
         audio: { content: audioContent },
         config: {
           encoding: 'WEBM_OPUS',  // or 'LINEAR16' depending on your audio format
           sampleRateHertz: 48000, // Common sample rate, adjust based on your audio
           languageCode: 'en-US',
           model: 'default',       // Can also use 'command_and_search', 'phone_call', etc.
           enableAutomaticPunctuation: true,
           useEnhanced: true,     // For better accuracy with certain audio types
           // For therapy context, we might want to enable certain features:
           speechContexts: [{
             phrases: [
               "anxiety", "depression", "therapy", "stress", "counseling",
               "mental health", "emotion", "feeling", "coping", "strategy",
               "medication", "diagnosis", "exercise", "meditation", "mindfulness"
             ],
             boost: 15  // Boost recognition of these terms
           }],
           // For a more natural transcription:
           alternativeLanguageCodes: [],
           profanityFilter: false
         },
       });
       
       // Process the response
       if (!response.results || response.results.length === 0) {
         return NextResponse.json({ 
           success: false, 
           transcript: null,
           error: 'No speech detected' 
         });
       }
       
       // Combine all transcription results
       const transcript = response.results
         .map(result => result.alternatives && result.alternatives[0].transcript || '')
         .join(' ')
         .trim();
       
       // Return the transcript
       return NextResponse.json({
         success: true,
         transcript,
         confidence: response.results[0].alternatives?.[0].confidence || 0
       });
     } catch (error) {
       console.error('Google Cloud STT API error:', error);
       
       return NextResponse.json({ 
         success: false, 
         error: 'Failed to process audio',
         details: error instanceof Error ? error.message : 'Unknown error'
       }, { status: 500 });
     }
   }
*/ 