import AWS from "aws-sdk";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const s3 = new AWS.S3();
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
        responseType: "arraybuffer",
      }
    );

    const fileName = `audio/audio_${uuidv4()}.mp3`;

    // Explicitly type the S3 upload parameters
    const params: AWS.S3.PutObjectRequest = {
      Bucket: BUCKET_NAME || '', // Provide a default empty string
      Key: fileName,
      Body: elevenLabsResponse.data,
      ContentType: "audio/mpeg",
    };

    // Upload to S3
    await s3.putObject(params).promise();

    const s3Url = `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Audio file saved.", url: s3Url }),
    };
  } catch (error: unknown) {
    const err = error as Error; 
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }  
};