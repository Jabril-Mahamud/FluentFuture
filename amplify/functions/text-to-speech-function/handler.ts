import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Validate environment variables
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error("ElevenLabs API key is not set in environment variables.");
    }

    if (!process.env.S3_BUCKET_NAME) {
      throw new Error("S3 bucket name is not set in environment variables.");
    }

    // Safely parse the incoming event body
    const body = event.body ? JSON.parse(event.body) : null;

    // Validate request payload
    if (!body || !body.text) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: "Text is required in the request body.",
        }),
      };
    }

    const { text, voiceId = "default" } = body;

    // Log the incoming request for debugging
    console.log("Received request:", { text, voiceId });

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

    console.log("ElevenLabs API response received.");

    // Generate a unique filename and S3 key
    const fileName = `audio_${uuidv4()}.mp3`;
    const s3Key = `audio/${fileName}`;

    console.log(`Generated S3 key: ${s3Key}`);

    // Upload audio to S3
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: elevenLabsResponse.data,
      ContentType: "audio/mpeg",
      ACL: "private",
    });

    await s3Client.send(command);

    console.log(`Audio file successfully uploaded to S3: ${s3Key}`);

    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow all origins
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Methods allowed
        'Access-Control-Allow-Headers': 'Content-Type', // Headers allowed
      },
      body: JSON.stringify({
        message: "Audio file saved successfully.",
        url: `https://s3.amazonaws.com/${process.env.S3_BUCKET_NAME}/${s3Key}`,
      }),
    };

  } catch (error) {
    const err = error as Error;
    console.error("Detailed error:", err);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: "Internal server error",
        error: err.message,
        stack: err.stack,
      }),
    };
  }
};
