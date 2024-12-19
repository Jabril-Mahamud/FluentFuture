import { defineFunction, secret } from "@aws-amplify/backend";
import { APIGATEWAY_AUTHORIZER_CHANGE_DEPLOYMENT_LOGICAL_ID } from "aws-cdk-lib/cx-api";

export const textToSpeechFunction = defineFunction({
  name: "text-to-speech-function",
  entry: "./handler.ts",
  environment: {
    API_KEY: secret("ELEVENLABS_API_KEY"),
    S3_BUCKET_NAME: "amplify-d3vjzia12splxy-dev-bra-audiobucket33d52ccb-epii5m1e0byr",
  },
});