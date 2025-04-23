import { NextRequest, NextResponse } from 'next/server';

// Define types for the conversation history
interface ConversationMessage {
  role: string;
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get the request body from the client
    const body = await request.json();
    const { 
      prompt, 
      middlePrompt,
      history = [], 
      format = 'text' // Add format parameter with default 'text'
    } = body as { 
      prompt: string,
      middlePrompt?: string,
      history: ConversationMessage[], 
      format?: 'text' | 'json' 
    };
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    // Get API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_STUDIO_API_KEY;
    
    if (!apiKey) {
      console.error('Server: Gemini API key not found in environment variables');
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Clean the API key
    const cleanApiKey = apiKey.trim();
    console.log('Server: Making request to Gemini API');
    
    // Format the conversation history for Gemini API
    const formattedHistory = history.slice(-6).map((msg: ConversationMessage) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    
    // Prepare the adjusted prompt based on format and middlePrompt
    let finalPrompt = prompt;
    
    // If a middle prompt is provided, incorporate it into the prompt
    if (middlePrompt) {
      // Insert the middle prompt as instructions before the user's message
      finalPrompt = `[THERAPIST INSTRUCTIONS - NOT VISIBLE TO USER: ${middlePrompt}]\n\nUSER MESSAGE: ${prompt}`;
      console.log('Using middle prompt:', middlePrompt);
    }
    
    // Add JSON format instruction if needed
    if (format === 'json') {
      // Add clear instructions to respond in JSON format
      finalPrompt = `${finalPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON. Do not include any explanatory text before or after the JSON.`;
    }
    
    // Prepare the request body for Gemini
    const geminiRequestBody = {
      contents: [
        // Include formatted conversation history
        ...formattedHistory,
        // Add the new user prompt at the end
        {
          role: 'user',
          parts: [{ 
            text: finalPrompt 
          }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        // Increase token limit for analysis responses
        maxOutputTokens: format === 'json' ? 800 : 150,
        topP: 0.8,
        topK: 40
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };
    
    // Use the Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${cleanApiKey}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(geminiRequestBody)
    });
    
    if (!response.ok) {
      // Pass through the error from Gemini
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { raw: errorText };
      }
      
      console.error('Server: Gemini API error:', response.status, errorData);
      
      return NextResponse.json(
        { 
          error: `Gemini API error: ${response.status}`, 
          details: errorData 
        },
        { status: response.status }
      );
    }
    
    // Get the response data
    const data = await response.json();
    console.log('Server: Successfully received response from Gemini API');
    
    // Extract the response text
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                        "I'm listening and processing what you've shared.";
    
    // For JSON format, try to parse the response
    if (format === 'json') {
      try {
        // Try to extract JSON if it's embedded in other text
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedJson = JSON.parse(jsonMatch[0]);
          return NextResponse.json(parsedJson);
        }
        // If not matchable but might be JSON, try direct parsing
        const parsedJson = JSON.parse(responseText);
        return NextResponse.json(parsedJson);
      } catch (parseError) {
        console.warn('Server: Failed to parse JSON from Gemini response', parseError);
        // Fall back to returning the raw text
      }
    }
    
    // Return the text response in a simplified format
    return NextResponse.json({ text: responseText });
  } catch (error) {
    console.error('Server: Error in Gemini proxy route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 