'use client';
import React, { useState } from 'react';

const page: React.FC = () => {
  const [text, setText] = useState('');
  const [audio, setAudio] = useState<string | null>(null);

  const handleGenerateSpeech = async () => {
    try {
      const response = await fetch('/api/eleven-labs-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (data.audioBase64) {
        setAudio(`data:audio/mpeg;base64,${data.audioBase64}`);
      } else {
        alert('Failed to generate speech');
      }
    } catch (error) {
      console.error('Error generating speech:', error);
    }
  };

  return (
    <div>
      <h2>Text to Speech</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        cols={50}
        placeholder="Enter text to convert to speech..."
      />
      <button onClick={handleGenerateSpeech}>Generate Speech</button>
      {audio && (
        <div>
          <h3>Generated Speech:</h3>
          <audio controls src={audio} />
        </div>
      )}
    </div>
  );
};

export default page;
