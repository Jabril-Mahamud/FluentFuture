import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand, S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../data/resource";

// Configure Amplify (you might need to adjust this based on your specific setup)
Amplify.configure({
  // Add your Amplify configuration here
  // This might include API endpoint, region, etc.
});

const client = generateClient<Schema>();
const s3Client = new S3Client({});

export const handler = async (
  event: APIGatewayProxyEvent
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
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ message: "CORS preflight response" }),
      };
    }

    // Validate environment variables
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error("ElevenLabs API key is not set in environment variables.");
    }
    if (!process.env.S3_BUCKET_NAME) {
      throw new Error("S3 bucket name is not set in environment variables.");
    }

    // Parse and validate the request body
    const body = event.body ? JSON.parse(event.body) : null;

    if (!body || typeof body.text !== "string" || typeof body.voiceId !== "string" || !body.userId) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Invalid request. 'text', 'voiceId', and 'userId' are required in the body.",
        }),
      };
    }

    const { text, voiceId, userId, language = 'en' } = body;

    // Call ElevenLabs API
    const elevenLabsResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      { text },
      {
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
        },
        responseType: "arraybuffer", // Ensure response is binary
      }
    );

    // Generate a unique filename and S3 key
    const fileName = `audio_${uuidv4()}.mp3`;
    const s3Key = `audio/${fileName}`;

    // Upload audio to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: elevenLabsResponse.data,
      ContentType: "audio/mpeg",
    });

    await s3Client.send(uploadCommand);

    // Generate a public URL
    const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;

    // Alternatively, generate a signed URL with expiration
    const signedUrlCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
    });
    const signedUrl = await getSignedUrl(s3Client, signedUrlCommand, { 
      expiresIn: 3600 // URL expires in 1 hour
    });

    // Create history record using Amplify Data API
    const { data: historyRecord, errors } = await client.models.History.create({
      text,
      audioUrl: publicUrl,
      userId,
      language,
      status: 'completed',
      createdAt: new Date().toISOString()
    });

    if (errors) {
      throw new Error(`Failed to save history: ${JSON.stringify(errors)}`);
    }

    // Return success response
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Audio file saved successfully.",
        url: publicUrl, // Public URL
        signedUrl: signedUrl, // Signed URL with expiration
        history: historyRecord // Return the history record for frontend use
      }),
    };
  } catch (error) {
    const err = error as Error;
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Internal server error",
        error: err.message,
        stack: err.stack,
      }),
    };
  }
};