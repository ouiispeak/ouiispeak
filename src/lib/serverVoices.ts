import 'server-only';

import type { SupportedLang } from '@/lib/voices';

type VoiceProfile = {
  voiceId?: string;
  modelId: string;
};

const DEFAULT_MODEL_ID = process.env.ELEVEN_LABS_MODEL_ID || 'eleven_multilingual_v2';

export const VOICE_PROFILES: Record<SupportedLang, VoiceProfile> = {
  fr: {
    voiceId:
      process.env.ELEVEN_VOICE_FR_ID ||
      process.env.ELEVEN_LABS_VOICE_ID ||
      process.env.ELEVEN_VOICE_EN_ID,
    modelId: DEFAULT_MODEL_ID,
  },
  en: {
    voiceId: process.env.ELEVEN_VOICE_EN_ID || process.env.ELEVEN_LABS_VOICE_ID,
    modelId: DEFAULT_MODEL_ID,
  },
};
