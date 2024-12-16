// voiceOptions.ts
import { StaticImageData } from 'next/image';
import oswaldImage from "../public/images/oswald.png";
import dorothyImage from "../public/images/dorothy.png";

export interface Voice {
  name: string;
  id: string;
  icon: StaticImageData | string; // Allow both Next.js StaticImageData and string URLs
  description: string;
}

export const VOICE_OPTIONS: Voice[] = [
  {
    name: 'Oswald',
    id: 'Pw7NjARk1Tw61eca5OiP',
    icon: oswaldImage,
    description: 'A friendly male voice that speaks clearly',
  },
  {
    name: 'Dorothy',
    id: 'ThT5KcBeYPX3keUQqHPh',
    icon: dorothyImage,
    description: 'A warm female voice that speaks gently',
  },
];

// Optional: Function to get a voice by ID
export function getVoiceById(voiceId: string): Voice | undefined {
  return VOICE_OPTIONS.find(voice => voice.id === voiceId);
}