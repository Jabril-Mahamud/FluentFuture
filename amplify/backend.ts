import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { myFirstFunction } from './functions/my-first-function/resource';
import { textToSpeechFunction } from './functions/text-to-speech-function/resource';
import { CorsHttpMethod, HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Stack } from 'aws-cdk-lib';


const backend =defineBackend({
  auth,
  data,
  storage,
  myFirstFunction,
  textToSpeechFunction
});

// Create a new API stack
const apiStack = backend.createStack("api-stack");

// Create a new HTTP API
const httpApi = new HttpApi(apiStack, "HttpApi", {
  apiName: "TextToSpeechApi",
  corsPreflight: {
    allowMethods: [
      CorsHttpMethod.POST,
      CorsHttpMethod.OPTIONS
    ],
    allowOrigins: ["*"], // Adjust for production
    allowHeaders: ["*"],
  },
  createDefaultStage: true,
});

// Create Lambda integration
const textToSpeechIntegration = new HttpLambdaIntegration(
  "TextToSpeechLambdaIntegration", 
  backend.textToSpeechFunction.resources.lambda
);

// Add route for text-to-speech
httpApi.addRoutes({
  path: "/text-to-speech",
  methods: [HttpMethod.POST],
  integration: textToSpeechIntegration,
});

// Add outputs to the configuration
backend.addOutput({
  custom: {
    API: {
      [httpApi.httpApiName!]: {
        endpoint: httpApi.url,
        region: Stack.of(httpApi).region,
        apiName: httpApi.httpApiName,
      },
    },
  },
});