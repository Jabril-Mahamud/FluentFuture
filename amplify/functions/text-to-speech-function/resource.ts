import { defineFunction, secret } from "@aws-amplify/backend";

export const textToSpeechFunction = defineFunction({
  name: "text-to-speech-function",
  entry: "./handler.ts",
  environment: {
    ELEVENLABS_API_KEY: "sk_61819115279a7fc283007b9189d203a74d5a850bc42282b6",
    S3_BUCKET_NAME: "amplify-d3vjzia12splxy-dev-bra-audiobucket33d52ccb-epii5m1e0byr",
  }
});