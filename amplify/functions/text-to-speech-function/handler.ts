import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand, S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
const s3Client = new S3Client({});

// Type definitions for environment variables
interface EnvironmentVariables {
  ELEVENLABS_API_KEY: string;
  S3_BUCKET_NAME: string;
}

// Validate environment variables
const getEnvVariables = (): EnvironmentVariables => {
  const requiredVars = ['ELEVENLABS_API_KEY', 'S3_BUCKET_NAME'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY!,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME!,
  };
};

// CORS headers
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Handle CORS preflight request
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: "CORS preflight response" }),
      };
    }

    // Get and validate environment variables
    const env = getEnvVariables();

    // Parse and validate request body
    const body = event.body ? JSON.parse(event.body) : null;
    if (!body?.text || !body?.voiceId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Invalid request. 'text' and 'voiceId' are required in the body.",
        }),
      };
    }

    // Call ElevenLabs API
    const audioResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${body.voiceId}`,
      { text: body.text },
      {
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": env.ELEVENLABS_API_KEY,
        },
        responseType: "arraybuffer",
      }
    );

    // Generate unique S3 key
    const s3Key = `audio/audio_${uuidv4()}.mp3`;

    // Upload to S3
    await s3Client.send(new PutObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: audioResponse.data,
      ContentType: "audio/mpeg",
    }));

    // Generate URLs
    const publicUrl = `https://${env.S3_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;
    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: s3Key,
      }),
      { expiresIn: 3600 }
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Audio file saved successfully.",
        url: publicUrl,
        signedUrl,
      }),
    };

  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};