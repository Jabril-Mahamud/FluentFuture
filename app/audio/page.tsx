"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Play, Waves } from "lucide-react";

export default function TextToSpeechConverter() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_ENDPOINT = "https://snt43qq2y3.execute-api.eu-west-2.amazonaws.com/default/amplify-d3vjzia12splxy-de-texttospeechfunctionlamb-GAKgc6zxWSDb";

  const handleTextToSpeech = async () => {
    // Input validation
    if (!text.trim()) {
      setError("Please enter some text to convert to speech.");
      return;
    }
  
    setIsLoading(true);
    setError(null);
    setAudioUrl(null);
  
    try {
      console.log('Sending request with payload:', {
        text,
        voiceId: "Pw7NjARk1Tw61eca5OiP"
      });
  
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voiceId: "Pw7NjARk1Tw61eca5OiP", // Static for now, dynamic if needed
        }),
      });
      
    
      // Log full response details
      console.log('Full Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
    
      // Try to get response text even if not OK
      const responseText = await response.text();
      console.log('Response Body:', responseText);
    
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`);
      }
    
      // Parse response
      const data = JSON.parse(responseText);
      
      if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
      } else {
        throw new Error("No audio URL returned in the response");
      }
    } catch (err) {
      console.error("Detailed Error:", err);
      setError(err instanceof Error 
        ? `Network or server error: ${err.message}` 
        : "An unexpected error occurred during audio generation."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-md space-y-6"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-800 mb-2 flex items-center justify-center gap-3">
            <Waves className="text-purple-600" />
            Text to Speech
            <Mic className="text-purple-600" />
          </h1>
          <p className="text-gray-500">Convert your text into lifelike audio</p>
        </div>

        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert to speech..."
          className="w-full h-32 p-4 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all resize-none"
        />

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl"
          >
            {error}
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleTextToSpeech}
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <span className="animate-pulse">Generating</span>
              <Waves className="animate-spin" />
            </>
          ) : (
            <>
              Generate Audio
              <Play />
            </>
          )}
        </motion.button>

        {audioUrl && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-indigo-50 rounded-xl p-4 flex items-center justify-between"
          >
            <span className="text-indigo-700 font-medium">Audio Generated</span>
            <audio 
              src={audioUrl} 
              controls 
              className="audio-player"
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}