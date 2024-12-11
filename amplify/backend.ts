import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { myFirstFunction } from './functions/my-first-function/resource';
import { textToSpeechFunction } from './functions/text-to-speech-function/resource';

defineBackend({
  auth,
  data,
  storage,
  myFirstFunction,
  textToSpeechFunction
});
