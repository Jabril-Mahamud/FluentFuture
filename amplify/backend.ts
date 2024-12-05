import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { audioStorage } from './storage/resource.js';

defineBackend({
  auth,
  data,
  audioStorage
});
