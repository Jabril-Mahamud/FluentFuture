'use client'
import React, { useState } from "react";
import { Mic, Play, Waves, Download, AlertTriangle } from "lucide-react";

export default function TextToSpeechConverter() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_ENDPOINT = "https://snt43qq2y3.execute-api.eu-west-2.amazonaws.com/default/amplify-d3vjzia12splxy-de-texttospeechfunctionlamb-GAKgc6zxWSDb";

  const handleTextToSpeech = async () => {
    // Validate input
    if (!text.trim()) {
      setError("Please enter some text to convert to speech.");
      return;
    }
  
    setIsLoading(true);
    setError(null);
    setAudioUrl(null);
  
    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voiceId: "Pw7NjARk1Tw61eca5OiP", 
        }),
      });
  
      const responseText = await response.text();
  
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${responseText}`
        );
      }
  
      const data = JSON.parse(responseText);
  
      if (data.url) {
        setAudioUrl(data.url);
      } else {
        throw new Error("No audio URL returned in the response");
      }
    } catch (err) {
      console.error("Detailed Error:", err);
      setError(
        err instanceof Error
          ? `Network or server error: ${err.message}`
          : "An unexpected error occurred during audio generation."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = 'generated-audio.mp3';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <main>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'stretch', 
        gap: '1rem',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '10px',
          color: 'white'
        }}>
          <Waves color="white" />
          Text to Speech
          <Mic color="white" />
        </h1>

        {error && (
          <div style={{
            backgroundColor: '#ffdddd',
            color: '#ff0000',
            padding: '10px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertTriangle color="#ff0000" />
            {error}
          </div>
        )}

        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert to speech..."
          style={{
            width: '100%',
            height: '200px',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #646cff',
            resize: 'none'
          }}
        />

        <button 
          onClick={handleTextToSpeech}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            opacity: isLoading ? 0.5 : 1
          }}
        >
          {isLoading ? 'Generating' : 'Generate Audio'}
          {isLoading ? <Waves /> : <Play />}
        </button>

        {audioUrl && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backgroundColor: '#dadbf9',
            padding: '10px',
            borderRadius: '8px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Audio Generated</span>
              <button 
                onClick={handleDownload}
                style={{
                  backgroundColor: '#1a1a1a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '5px 10px'
                }}
              >
                Download
              </button>
            </div>
            <audio 
              src={audioUrl} 
              controls 
              style={{ width: '100%' }}
            />
          </div>
        )}
      </div>
    </main>
  );
}