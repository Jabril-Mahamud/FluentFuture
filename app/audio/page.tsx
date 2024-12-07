'use client';
import React, { useState } from 'react';

const Page: React.FC = () => {
  const [text, setText] = useState('');
  const [audio, setAudio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      alert('Please enter some text.');
      return;
    }

    setLoading(true);
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
        alert('Failed to generate speech.');
      }
    } catch (error) {
      console.error('Error generating speech:', error);
    } finally {
      setLoading(false);
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
      <button onClick={handleGenerateSpeech} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Speech'}
      </button>
      {audio && (
        <div>
          <h3>Generated Speech:</h3>
          <audio controls src={audio} />
        </div>
      )}
    </div>
  );
};

export default Page;
