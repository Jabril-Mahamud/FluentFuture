import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand, S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Schema } from "../../data/resource";
import { generateClient } from 'aws-amplify/api';
import { env } from '$amplify/env/text-to-speech-function';

const s3Client = new S3Client({
  region: process.env.AWS_REGION
});

interface HistoryItem {
  text: string;
  audioUrl: string;
  userId: string;
  language: string;
  status: 'success' | 'failed';
  createdAt: string;
}

async function createHistoryRecord(historyItem: HistoryItem) {
  const historyClient = generateClient<Schema>();
  try {
    const result = await historyClient.models.History.create(historyItem);
    console.log('Successfully created history record:', result);
    return result;
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Error creating history record:', error);
    throw error;
  }
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    // Handle CORS preflight request
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST",
          "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
        body: JSON.stringify({ message: "CORS preflight response" }),
      };
    }

    // Parse and validate the request body
    const body = event.body ? JSON.parse(event.body) : null;
    if (!body || typeof body.text !== "string" || typeof body.voiceId !== "string") {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Invalid request. 'text' and 'voiceId' are required in the body.",
        }),
      };
    }

    const { text, voiceId } = body;

    // Call ElevenLabs API
    const elevenLabsResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      { text },
      {
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
        },
        responseType: "arraybuffer",
      }
    );

    // Generate a unique filename and S3 key
    const fileName = `audio_${uuidv4()}.mp3`;
    const s3Key = `audio/${fileName}`;

    // Upload audio to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: elevenLabsResponse.data,
      ContentType: "audio/mpeg",
    });
    await s3Client.send(uploadCommand);

    // Generate a public URL
    const publicUrl = `https://${env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    // Generate a signed URL with expiration
    const signedUrlCommand = new GetObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: s3Key,
    });
    const signedUrl = await getSignedUrl(s3Client, signedUrlCommand, {
      expiresIn: 3600
    });

    // Get user ID from Cognito identity
    const userId = event.requestContext?.authorizer?.iam?.cognitoIdentity?.identityId;
    if (!userId) {
      throw new Error('User ID not found in request context');
    }

    // Create and save history record
    const historyItem: HistoryItem = {
      text,
      audioUrl: publicUrl,
      userId,
      language: 'en',
      status: 'success',
      createdAt: new Date().toISOString(),
    };

    await createHistoryRecord(historyItem);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Audio file saved successfully.",
        url: publicUrl,
        signedUrl,
      }),
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Lambda execution error:', error);
    
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
    };
  }
};