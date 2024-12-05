import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'amplifyTeamDrive',
  access: (allow) => ({
    '/public/*': [allow.guest.to(['read'])], // Public read-only
    '/private/${userId}/*': [allow.authenticated.to(['read', 'write', 'delete'])] // User-specific control
  }),
});
