import axios from 'axios';

export const handler: AWSLambda.Handler = async (event) => {
  try {
    const { text } = JSON.parse(event.body || '{}');

    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Text is required' }),
      };
    }

    const elevenLabsAPIKey = process.env.ELEVEN_LABS_API_KEY;
    const voiceId = process.env.ELEVEN_LABS_VOICE_ID; // Use a default or configurable voice ID

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      { text },
      {
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsAPIKey,
        },
        responseType: 'arraybuffer',
      }
    );

    const audioBase64 = Buffer.from(response.data, 'binary').toString('base64');
    return {
      statusCode: 200,
      body: JSON.stringify({ audioBase64 }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    console.error('Error in Lambda:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error', error }),
    };
  }
};
