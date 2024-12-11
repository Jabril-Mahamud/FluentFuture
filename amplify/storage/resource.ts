import { defineStorage } from '@aws-amplify/backend';
import { textToSpeechFunction } from '../functions/text-to-speech-function/resource';

export const storage = defineStorage({
  name: 'audio',
  access: (allow) => ({
    'audio/*': [
      allow.resource(textToSpeechFunction).to(['read', 'write', 'delete'])
    ]
  })
});

