import { defineStorage } from "@aws-amplify/backend";

export const audioStorage = defineStorage({
    name: 'elevenlabsttsstorage',
    access: (allow) => ({
      'audio/*': [
        allow.guest.to(['read']),
        allow.authenticated.to(['read', 'write'])
      ]
    })
  });