import { defineFunction } from '@aws-amplify/backend';

export const elevenLabsTTS = defineFunction({
  name: 'eleven-labs-tts',
  entry: './handler.ts',
  environment: {
    ELEVEN_LABS_API_KEY: 'sk_002b2744498c19e0f73c89a3ce2ad05d86ea4434f661f5cc', // Replace with actual or placeholder
    ELEVEN_LABS_VOICE_ID: 'Pw7NjARk1Tw61eca5OiP', // Replace with desired voice ID
  },
});
