import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client();
const BUCKET_NAME = process.env.BUCKET_NAME;

export const handler = async (event: any) => {
  try {
    // Validate environment variables
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error(
        "ElevenLabs API key is not set in environment variables."
      );
    }
    if (!BUCKET_NAME) {
      throw new Error("S3 bucket name is not set in environment variables.");
    }

    // Check if the event body exists and is a valid JSON string
    if (!event.body) {
      throw new Error("No body in the event.");
    }

    let body: any;
    try {
      // Check for base64 encoding, decode if necessary
      if (event.isBase64Encoded) {
        body = JSON.parse(Buffer.from(event.body, "base64").toString("utf-8"));
      } else {
        body = JSON.parse(event.body);
      }
    } catch (parseError: unknown) {
      // Type assertion to Error
      const error = parseError as Error;
      console.error("Error parsing event body:", error.message);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid JSON in request body." }),
      };
    }

    // Validate the body content
    const { text, voiceId = "default" } = body;
    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Text is required in the request body.",
        }),
      };
    }

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
      // Explicitly set ACL or use bucket policy permissions
      ACL: "private",
    });

    await s3Client.send(command);
    console.log(`Audio file successfully uploaded to S3: ${s3Key}`);

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Audio file saved successfully.",
        url: `https://s3.amazonaws.com/${process.env.S3_BUCKET_NAME}/${s3Key}`,
      }),
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Detailed error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error: err.message,
        stack: err.stack,
      }),
    };
  }
};
