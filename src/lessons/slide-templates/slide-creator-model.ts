import type { Slide } from '@/lessons/types';

export const lessonSlug = 'slide-templates/slide-creator-model';

export const slides: Slide[] = [
  {
    id: 'intro',
    type: 'title-slide',
    props: {
      title: 'Lesson Title',
      subtitle: 'Sous-titre optionnel',
    },
  },
  {
    id: 'text-1',
    type: 'text-slide',
    props: {
      title: 'Deux encadrés contrôlés par la leçon, NS',
      subtitle: 'Ajoutez body, body1, body2 ou bodies[] selon vos besoins, NS',
      body1:
        'Avec un seul champ body, vous obtenez un unique encadré. Ajoutez body1 / body2 pour empiler plusieurs zones de texte.',
    },
  },

  {
    id: 'ai-repeat',
    type: 'ai-speak-repeat',
    props: {
      title: 'Alphabet Pronunciation',
      subtitle: "Répétition de l'alphabet anglais, NS",
      note: 'Cliquez sur chaque lettre pour entendre la prononciation.',
      defaultLang: 'en',
      lines: [
        [
          // Default: Use TTS from ElevenLabs
          { label: 'A', speech: { mode: 'tts', text: 'The letter A. A.' } },
          { label: 'B', speech: { mode: 'tts', text: 'The letter B. B.' } },
          // Alternative: Use uploaded audio file instead of TTS
          { label: 'C', speech: { mode: 'file', fileUrl: '/audio/letter-c.mp3' } },
          { label: 'D', speech: { mode: 'tts', text: 'The letter D. D.' } },
        ],
      ],
    },
  },
  {
    id: 'student-record-accuracy',
    type: 'student-record-accuracy',
    props: {
      title: 'Student Record Accuracy',
      instructions: 'Speak clearly in English to receive your score. Votre enregistrement est envoyé au service de prononciation puis noté automatiquement. ',
      promptLabel: 'Sentence to repeat, NS',
      samplePrompt: 'Every morning I practice my English pronunciation.',
      referenceText: 'Every morning I practice my English pronunciation.',
    },
  },
  {
    id: 'ai-speak-student-repeat',
    type: 'ai-speak-student-repeat',
    props: {
      title: 'AI Speak Student Repeat',
      instructions: 'Listen and repeat after me. Speak clearly to practice your pronunciation.',
      promptLabel: 'Phrase à prononcer',
      elements: [
        // Default: Uses TTS from ElevenLabs (generated from referenceText/samplePrompt)
        {
          samplePrompt: 'Hello, how are you today?',
          referenceText: 'Hello, how are you today?',
        },
        // Alternative: Use uploaded audio file instead of TTS
        {
          samplePrompt: 'Great, and you?',
          referenceText: 'Great, and you?',
          speech: { mode: 'file', fileUrl: '/audio/great-and-you.mp3' },
        },
        // You can also override TTS with custom text/lang
        {
          samplePrompt: 'I am fine, thank you.',
          referenceText: 'I am fine, thank you.',
          speech: { mode: 'tts', text: 'I am fine, thank you.', lang: 'en' },
        },
      ],
      defaultLang: 'en',
      layout: 'vertical', // Options: 'vertical' (default), 'horizontal', 'wrap', or 'grid'
    },
  },
  {
    id: 'speech-match',
    type: 'speech-match',
    props: {
      title: 'Speech Match - Alphabet',
      subtitle: 'Écoute et clique sur la lettre que tu entends',
      defaultLang: 'en',
      elements: [
        // Default: Use TTS from ElevenLabs
        { label: 'A', speech: { mode: 'tts', text: 'A' } },
        { label: 'B', speech: { mode: 'tts', text: 'B' } },
        // Alternative: Use uploaded audio file instead of TTS
        { label: 'C', speech: { mode: 'file', fileUrl: '/audio/letter-c.mp3' } },
        { label: 'D', speech: { mode: 'tts', text: 'D' } },
        { label: 'E', speech: { mode: 'tts', text: 'E' } },
        { label: 'F', speech: { mode: 'tts', text: 'F' } },
        { label: 'G', speech: { mode: 'tts', text: 'G' } },
        { label: 'H', speech: { mode: 'tts', text: 'H' } },
        { label: 'I', speech: { mode: 'tts', text: 'I' } },
        { label: 'J', speech: { mode: 'tts', text: 'J' } },
        { label: 'K', speech: { mode: 'tts', text: 'K' } },
        { label: 'L', speech: { mode: 'tts', text: 'L' } },
        { label: 'M', speech: { mode: 'tts', text: 'M' } },
        { label: 'N', speech: { mode: 'tts', text: 'N' } },
        { label: 'O', speech: { mode: 'tts', text: 'O' } },
        { label: 'P', speech: { mode: 'tts', text: 'P' } },
        { label: 'Q', speech: { mode: 'tts', text: 'Q' } },
        { label: 'R', speech: { mode: 'tts', text: 'R' } },
        { label: 'S', speech: { mode: 'tts', text: 'S' } },
        { label: 'T', speech: { mode: 'tts', text: 'T' } },
        { label: 'U', speech: { mode: 'tts', text: 'U' } },
        { label: 'V', speech: { mode: 'tts', text: 'V' } },
        { label: 'W', speech: { mode: 'tts', text: 'W' } },
        { label: 'X', speech: { mode: 'tts', text: 'X' } },
        { label: 'Y', speech: { mode: 'tts', text: 'Y' } },
        { label: 'Z', speech: { mode: 'tts', text: 'Z' } },
      ],
    },
  },
  {
    id: 'lesson-end',
    type: 'lesson-end',
    props: {
      title: 'Bravo, tu as terminé la leçon !',
      message:
        "Tu peux revoir cette leçon, continuer ton parcours, ou revenir plus tard. L'important, c'est la régularité — pas la perfection.",
      actions: [
        { type: 'restart', label: 'Recommencer la leçon' },
        { type: 'progress', label: 'Voir ma progression' },
      ],
    },
  },

];
