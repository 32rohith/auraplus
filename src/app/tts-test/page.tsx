'use client';

import React, { useRef, useState } from 'react';

export default function TTSTest() {
  const [text, setText] = useState('Hello, this is a test of Google Cloud Text-to-Speech.');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  const testTTS = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error (${response.status}): ${errorData.error || 'Unknown error'}`);
      }
      
      // Get audio data and play it
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('TTS Test Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">Google Cloud TTS Test</h1>
        
        <div className="mb-4">
          <label htmlFor="text" className="block text-sm font-medium mb-1">Text to convert to speech:</label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
          />
        </div>
        
        <button
          onClick={testTTS}
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Converting...' : 'Convert to Speech'}
        </button>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Audio Result:</p>
          <audio ref={audioRef} controls className="w-full" />
        </div>
      </div>
    </div>
  );
} 