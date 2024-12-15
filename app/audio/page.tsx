"use client";
import React, { useState } from "react";
import {
  Flex,
  Text,
  TextAreaField,
  Button,
  Alert,
  View,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import {
  Mic,
  Play,
  Waves,
  Download,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";

export default function TextToSpeechConverter() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API endpoint for text-to-speech conversion
  const API_ENDPOINT =
    "https://snt43qq2y3.execute-api.eu-west-2.amazonaws.com/default/amplify-d3vjzia12splxy-de-texttospeechfunctionlamb-GAKgc6zxWSDb";

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

      // Check for signedUrl first, then fall back to url
      if (data.signedUrl) {
        setAudioUrl(data.signedUrl);
      } else if (data.url) {
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
      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = "generated-audio.mp3";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <View
      as="main"
      width="100%"
      maxWidth="500px"
      margin="0 auto"
      padding="1rem"
    >
      <Flex direction="column" gap="1rem" alignItems="stretch">
        <Flex justifyContent="center" alignItems="center" gap="0.5rem">
          <Waves color="currentColor" />
          <Text variation="primary" as="h1" fontSize="1.5rem" fontWeight="bold">
            Text to Speech Converter
          </Text>
          <Mic color="currentColor" />
        </Flex>

        {error && (
          <Alert variation="error" isDismissible={false}>
            <Flex alignItems="center" gap="0.5rem">
              <AlertTriangle />
              {error}
            </Flex>
          </Alert>
        )}

        <TextAreaField
          label="Enter Text"
          placeholder="Type the text you want to convert to speech..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          variation="quiet"
          // Add white background and clear contrast
          backgroundColor="white"
          border="1px solid #CCCCCC"
          borderRadius="0.5rem"
          padding="0.5rem"
          // Accessibility improvements
          aria-describedby="text-input-help"
        />
        <Flex id="text-input-help" alignItems="center" gap="0.25rem">
          <HelpCircle size={16} />
          <Text variation="secondary" fontSize="0.875rem">
            Tip: Speak clearly and simply. This helps create better audio.
          </Text>
        </Flex>

        <Button
          variation="primary"
          onClick={handleTextToSpeech}
          isLoading={isLoading}
          loadingText="Generating Audio"
          // Ensure button is always accessible
          aria-live="polite"
        >
          <Flex alignItems="center" gap="0.5rem">
            {isLoading ? <Waves /> : <Play />}
            {isLoading ? "Generating" : "Generate Audio"}
          </Flex>
        </Button>

        {audioUrl && (
          <View
            backgroundColor="secondary.10"
            padding="1rem"
            borderRadius="0.5rem"
          >
            <Flex
              justifyContent="space-between"
              alignItems="center"
              marginBottom="0.5rem"
            >
              <Text variation="success">Audio Generated Successfully</Text>
              <Button
                variation="link"
                onClick={handleDownload}
                aria-label="Download generated audio"
              >
                <Flex alignItems="center" gap="0.5rem">
                  <Download size={16} />
                  Download
                </Flex>
              </Button>
            </Flex>
            <audio
              key={audioUrl}
              src={audioUrl}
              controls
              style={{ width: "100%" }}
              aria-label="Generated speech audio"
            />
          </View>
        )}
      </Flex>
    </View>
  );
}
