import { defineFunction } from "@aws-amplify/backend";

export const textToSpeechFunction = defineFunction({
  name: "text-to-speech-function",
  entry: "./handler.ts",
  environment: {
    ELEVENLABS_API_KEY: "sk_19f69c8a20e3189095b41d926ce811742d37a376cf75a215",
    BUCKET_NAME: "audio",
    S3_BUCKET_NAME: "amplify-d3vjzia12splxy-dev-bra-audiobucket33d52ccb-epii5m1e0byr",
    DYNAMODB_TABLE_NAME: "History" 
  },
});
