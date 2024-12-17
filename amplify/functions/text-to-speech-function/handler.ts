import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand, S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({});

// could also access api from here https://docs.amplify.aws/nextjs/build-a-backend/data/customize-authz/grant-lambda-function-access-to-api/

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