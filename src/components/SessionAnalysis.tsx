import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SessionAnalysisProps {
  sessions: any[];
}

const SessionAnalysis: React.FC<SessionAnalysisProps> = ({ sessions }) => {
  const [insights, setInsights] = useState<any[]>([]);
  const [recommendedAreas, setRecommendedAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalyzedCount, setLastAnalyzedCount] = useState(0);

  useEffect(() => {
    // Only analyze if we have sessions and the count has changed
    if (sessions.length > 0 && sessions.length !== lastAnalyzedCount) {
      analyzeSessionsWithGemini();
    }
  }, [sessions]);

  const analyzeSessionsWithGemini = async () => {
    if (sessions.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Prepare session data to send to Gemini
      const sessionData = sessions.map(session => ({
        date: session.date,
        duration: session.duration_minutes,
        messages: session.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }))
      }));
      
      // Create a prompt for the analysis
      const analysisPrompt = `
        Analyze these therapy sessions and provide insights:
        1. Identify emotional patterns across sessions
        2. Note improvements in coping mechanisms
        3. Suggest focus areas for continued progress
        4. Evaluate overall progress

        Format your response as JSON with these fields:
        {
          "insights": [
            {
              "title": "Short title for this insight",
              "description": "Brief description of the pattern or finding",
              "improvement": "+X%" or "No change" or "-X%",
              "trend": "positive" or "negative" or "neutral"
            }
          ],
          "recommendedAreas": ["Area 1", "Area 2", "Area 3"]
        }

        Sessions data: ${JSON.stringify(sessionData, null, 2)}
      `;
      
      // Call the Gemini API (using the same endpoint as in page.tsx)
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: analysisPrompt,
          format: 'json'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Parse the results - Gemini should return JSON
      try {
        // First try to parse if response is a string
        let analysisResult;
        if (typeof data.text === 'string') {
          // Try to extract JSON if it's embedded in other text
          const jsonMatch = data.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysisResult = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("Couldn't extract JSON from response");
          }
        } else {
          // If it's already parsed JSON
          analysisResult = data;
        }
        
        if (analysisResult.insights && Array.isArray(analysisResult.insights)) {
          setInsights(analysisResult.insights);
        }
        
        if (analysisResult.recommendedAreas && Array.isArray(analysisResult.recommendedAreas)) {
          setRecommendedAreas(analysisResult.recommendedAreas);
        }
        
        // Update last analyzed count
        setLastAnalyzedCount(sessions.length);
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
        // Use fallback insights if parsing fails
        setInsights(getFallbackInsights());
        setRecommendedAreas([
          'Continue practicing daily mindfulness exercises (10-15 minutes)',
          'Work on identifying thought patterns before anxiety escalates',
          'Maintain consistent sleep schedule to improve overall well-being'
        ]);
      }
    } catch (err) {
      console.error('Error analyzing sessions:', err);
      setError('Failed to analyze sessions. Please try again later.');
      
      // Set fallback data
      setInsights(getFallbackInsights());
      setRecommendedAreas([
        'Continue practicing daily mindfulness exercises (10-15 minutes)',
        'Work on identifying thought patterns before anxiety escalates',
        'Maintain consistent sleep schedule to improve overall well-being'
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  // Fallback insights if API call fails
  const getFallbackInsights = () => [
    {
      id: 1,
      title: 'Emotional Patterns',
      description: 'Analysis of emotional patterns across your therapy sessions.',
      improvement: 'N/A',
      trend: 'neutral'
    },
    {
      id: 2,
      title: 'Coping Mechanisms',
      description: 'Evaluation of coping strategies discussed in sessions.',
      improvement: 'N/A',
      trend: 'neutral'
    },
    {
      id: 3,
      title: 'Progress Tracking',
      description: 'Overview of your progress through therapy sessions.',
      improvement: 'N/A',
      trend: 'neutral'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-foreground">Your Therapy Insights</h2>
        
        <div className="flex items-center space-x-3">
          {sessions.length === 0 && (
            <div className="text-sm text-muted-foreground">
              Complete therapy sessions to see personalized insights
            </div>
          )}
          
          {sessions.length > 0 && (
            <button 
              onClick={analyzeSessionsWithGemini}
              disabled={loading}
              className="px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm transition flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          )}
          
          {loading && (
            <div className="flex items-center text-sm text-primary">
              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing sessions...
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-3 mb-4">
          {error}
        </div>
      )}
      
      {sessions.length < 3 && sessions.length > 0 && !loading && (
        <div className="bg-accent/10 border border-accent/20 text-accent dark:text-accent-foreground rounded-md p-3 mb-4">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">Limited data available</p>
              <p className="text-sm">For more accurate insights, complete at least 3 therapy sessions. Current analysis is based on limited data.</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.length > 0 ? (
          insights.map((insight, index) => (
            <motion.div
              key={insight.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card dark:bg-card rounded-lg shadow-md p-5 border border-border"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-foreground">{insight.title}</h3>
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    insight.trend === 'positive' 
                      ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400' 
                      : insight.trend === 'negative'
                        ? 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {insight.improvement}
                </span>
              </div>
              
              <p className="text-muted-foreground text-sm">{insight.description}</p>
            </motion.div>
          ))
        ) : sessions.length > 0 && !loading ? (
          <div className="col-span-2 bg-card dark:bg-card rounded-lg shadow-md p-5 text-center py-10 border border-border">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-muted-foreground mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-muted-foreground font-medium mb-2">No insights available yet</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">Click the refresh button to analyze your therapy sessions and generate insights.</p>
          </div>
        ) : (
          <div className="col-span-2 bg-card dark:bg-card rounded-lg shadow-md p-5 text-center py-10 border border-border">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-muted-foreground mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-muted-foreground font-medium mb-2">No therapy sessions yet</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Complete your first therapy session to begin tracking progress and receiving insights.
            </p>
          </div>
        )}
      </div>
      
      {recommendedAreas.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-foreground mb-3">Recommended Focus Areas</h3>
          <div className="bg-card dark:bg-card rounded-lg shadow-md p-5 border border-border">
            <ul className="space-y-2">
              {recommendedAreas.map((area, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-foreground">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionAnalysis; 