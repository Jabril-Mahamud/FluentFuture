import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'amplifyTeamDrive',
  access: (allow) => ({
    '/public/*': [allow.guest.to(['read'])], // Note the leading '/'
    '/private/${userId}/*': [allow.authenticated.to(['read', 'write', 'delete'])] // Note the leading '/'
  }),
});