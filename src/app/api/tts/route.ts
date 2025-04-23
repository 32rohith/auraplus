import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the request body from the client
    const body = await request.json();
    const { text, voice, audioConfig } = body;
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    
    // Get API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_STUDIO_API_KEY;
    
    if (!apiKey) {
      console.error('Server: Google API key not found in environment variables');
      return NextResponse.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      );
    }

    // Clean the API key
    const cleanApiKey = apiKey.trim();
    console.log('Server: Making request to Google Cloud TTS API');
    
    // Use the Google Cloud Text-to-Speech API
    const ttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${cleanApiKey}`;
    
    // Default voice and audio config
    const defaultVoice = {
      languageCode: 'en-US',
      name: 'en-US-Neural2-F', // Female neural voice
      ssmlGender: 'FEMALE'
    };
    
    const defaultAudioConfig = {
      audioEncoding: 'MP3',
      speakingRate: 1.0,
      pitch: 0.0
    };
    
    // Use custom voice and audio config if provided, otherwise use defaults
    const ttsRequestBody = {
      input: { text: text },
      voice: voice || defaultVoice,
      audioConfig: audioConfig || defaultAudioConfig
    };
    
    console.log('Using voice:', ttsRequestBody.voice.name);
    
    const response = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ttsRequestBody)
    });
    
    if (!response.ok) {
      // Pass through the error from Google
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { raw: errorText };
      }
      
      console.error('Server: Google TTS API error:', response.status, errorData);
      
      return NextResponse.json(
        { 
          error: `Google TTS API error: ${response.status}`, 
          details: errorData 
        },
        { status: response.status }
      );
    }
    
    // Get the audio data
    const data = await response.json();
    console.log('Server: Successfully received response from Google TTS API');
    
    // The API returns base64 encoded audio
    if (!data.audioContent) {
      return NextResponse.json(
        { error: 'No audio content returned from Google TTS API' },
        { status: 500 }
      );
    }
    
    // Convert base64 to audio buffer
    const audioBuffer = Buffer.from(data.audioContent, 'base64');
    
    // Return the audio file
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Server: Error in Google TTS proxy route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 