import { defineFunction } from "@aws-amplify/backend";

export const textToSpeechFunction = defineFunction({
  name: "text-to-speech-function",
  entry: "./handler.ts",
  environment: {
    ELEVENLABS_API_KEY: "sk_002b2744498c19e0f73c89a3ce2ad05d86ea4434f661f5cc",
  },
});
