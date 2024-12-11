import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client();
const BUCKET_NAME = process.env.STORAGE_AMPLIFYTEAMDRIVE_BUCKET_NAME;

export const handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body);

    const { text, voiceId = "default" } = body;
    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Text is required." }),
      };
    }

    // ElevenLabs API Call
    const elevenLabsResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      { text },
      {
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
        },
        responseType: "arraybuffer", // Ensure response is received as binary data
      }
    );

    // Generate a unique filename for the audio file
    const fileName = `audio_${uuidv4()}.mp3`;
    const s3Key = `audio/${fileName}`; // S3 key includes the folder and file name

    // Upload the audio file to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME, // Use the correct bucket name
      Key: s3Key,          // S3 key for the file
      Body: elevenLabsResponse.data, // Binary audio data
      ContentType: "audio/mpeg", // Set the correct MIME type for audio files
    });
    await s3Client.send(command);

    // Return success response with S3 URL
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Audio file saved successfully.",
        url: `https://${BUCKET_NAME}.s3.amazonaws.com/${s3Key}`, // Construct the S3 URL
      }),
    };
  } catch (error: unknown) {
    const err = error as Error; 
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
