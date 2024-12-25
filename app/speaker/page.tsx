"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  TextAreaField,
  Button,
  SelectField,
  Flex,
  View,
  Heading,
  Text,
  Alert,
  ThemeProvider,
} from "@aws-amplify/ui-react";
import { Volume2, Play, Square, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

const VOICE_OPTIONS = [
  {
    name: "Oswald (Male)",
    id: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_OSWALD,
    description: "A friendly male voice that speaks clearly",
  },
  {
    name: "Dorothy (Female)",
    id: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_DOROTHY,
    description: "A warm female voice that speaks gently",
  },
];

const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY

export default function AccessibleTTS() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState(VOICE_OPTIONS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Oswald Voice ID:", process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_OSWALD);
    console.log("Dorothy Voice ID:", process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_DOROTHY);
    console.log("Eleven Labs API Key:", process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY);
  }, []);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioSrc) URL.revokeObjectURL(audioSrc);
      if (audioElement) audioElement.pause();
    };
  }, [audioSrc, audioElement]);

  // Reset audio if text changes
  const handleTextChange = (value: string) => {
    setText(value);
    setAudioSrc(null); // Invalidate existing audio
    setAudioElement(null);
  };

  // Reset audio if voice changes
  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
    setAudioSrc(null); // Invalidate existing audio
    setAudioElement(null);
  };

  const saveToDatabase = async (audioUrl: string) => {
    if (!text.trim()) return;

    try {
      const { errors } = await client.models.History.create({
        text: text.trim(),
        audioUrl,
        language: "english",
        createdAt: new Date().toISOString(),
      });

      if (errors && errors.length > 0) {
        throw new Error(errors.map((err) => err.message).join(", "));
      }
    } catch (err) {
      console.error("Error saving to database:", err);
      setError("Failed to save to database. Please try again.");
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!text.trim()) {
      setError("Please write or paste some text in the box above");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY!,
          },
          body: JSON.stringify({ text: text.trim() }),
        }
      );

      console.log("API Response Status:", response.status);
      const data = await response.json();
      console.log("API Response Data:", data);

      if (!response.ok) {
        throw new Error("Could not create audio. Please try again.");
      }

      const audioBlob = await response.blob();
      const newAudioUrl = URL.createObjectURL(audioBlob);

      if (audioSrc) URL.revokeObjectURL(audioSrc);

      setAudioSrc(newAudioUrl);
      const audio = new Audio(newAudioUrl);
      setAudioElement(audio);

      // Save to database after successful audio generation
      await saveToDatabase(newAudioUrl);

      setError(null);
    } catch (error) {
      console.error("Error:", error);
      setError("Could not create audio. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [text, selectedVoiceId, audioSrc]);

  const togglePlayback = useCallback(() => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
    } else {
      audioElement.play().catch(() => {
        setError("Could not play audio. Please try again.");
      });
      audioElement.onended = () => setIsPlaying(false);
      setIsPlaying(true);
    }
  }, [audioElement, isPlaying]);

  return (
    <ThemeProvider>
      <View maxWidth="800px" margin="0 auto" padding="2rem">
        <Card variation="elevated">
          <Flex direction="column" gap="2rem">
            {/* Header */}
            <Flex justifyContent="space-between" alignItems="center">
              <Flex alignItems="center" gap="1rem">
                <Volume2 size={32} className="text-blue-500" />
                <Heading level={1} fontSize="2rem">
                  Convert Text to Speech
                </Heading>
              </Flex>
              <Button
                variation="link"
                onClick={() => router.push("/history")} // Navigate to history page
              >
                <FileText size={24} />
              </Button>
            </Flex>

            {/* Text Input */}
            <TextAreaField
              label="Your Text"
              value={text}
              onChange={(e) => handleTextChange(e.target.value)} // Reset audio on text change
              placeholder="Type or paste your text here..."
              maxLength={1000}
              isDisabled={isLoading}
              errorMessage={error}
              size="large"
              rows={6}
              labelHidden={false}
              hasError={!!error}
            />

            <Flex justifyContent="space-between" alignItems="center">
              <Text variation="tertiary" fontSize="medium">
                {text.length} / 1000 characters
              </Text>
            </Flex>

            {/* Voice Selection */}
            <SelectField
              label="Choose a Voice"
              value={selectedVoiceId}
              onChange={(e) => handleVoiceChange(e.target.value)} // Reset audio on voice change
              isDisabled={isLoading}
              size="large"
            >
              {VOICE_OPTIONS.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </SelectField>

            {/* Controls */}
            <Flex gap="1rem" alignItems="center" justifyContent="center">
              <Button
                flex="1"
                variation="primary"
                size="large"
                onClick={handleSubmit}
                isLoading={isLoading}
                loadingText="Creating Audio..."
                isDisabled={!text.trim() || isLoading}
              >
                Create Audio
              </Button>

              <Button
                variation={isPlaying ? "warning" : "link"}
                size="large"
                onClick={togglePlayback}
                isDisabled={!audioSrc || isLoading} // Disable playback if audio is invalid
              >
                {isPlaying ? <Square size={24} /> : <Play size={24} />}
              </Button>
            </Flex>

            {/* Error Display */}
            {error && (
              <Alert variation="error" isDismissible={false} hasIcon={true}>
                {error}
              </Alert>
            )}
          </Flex>
        </Card>
      </View>
    </ThemeProvider>
  );
}
