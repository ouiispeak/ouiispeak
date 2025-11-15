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
      title: 'Deux encadrés contrôlés par la leçon',
      subtitle: 'Ajoutez body, body1, body2 ou bodies[] selon vos besoins',
      body1:
        'Avec un seul champ body, vous obtenez un unique encadré. Ajoutez body1 / body2 pour empiler plusieurs zones de texte.',
      body2:
        'Chaque encadré vit dans le fichier de leçon : aucun duplicata n’est généré automatiquement par le composant.',
    },
  },
  {
    id: 'ai-repeat',
    type: 'ai-speak-repeat',
    props: {
      title: 'AI Speak Repeat',
      subtitle: 'Répétition de l’alphabet anglais',
      note: 'Cliquez sur chaque lettre pour entendre la prononciation.',
      defaultLang: 'en',
      lines: [
        [
          { label: 'A', speech: { mode: 'tts', text: 'The letter A. A.' } },
          { label: 'B', speech: { mode: 'tts', text: 'The letter B. B.' } },
          { label: 'C', speech: { mode: 'tts', text: 'The letter C. C.' } },
          { label: 'D', speech: { mode: 'tts', text: 'The letter D. D.' } },
        ],
      ],
    },
  },
  {
    id: 'ai-student-repeat',
    type: 'ai-speak-student-repeat',
    props: {
      title: 'AI Speak Student Repeat',
      instructions: 'Speak clearly in English to receive your score.',
      promptLabel: 'Sentence to repeat',
      samplePrompt: 'Every morning I practice my English pronunciation.',
      referenceText: 'Every morning I practice my English pronunciation.',
    },
  },

];
