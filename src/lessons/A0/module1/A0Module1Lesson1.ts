import type { Slide } from '@/lessons/types';

export const lessonSlug = 'a0-module-1/lesson-1';

export const slides: Slide[] = [
  {
    id: 'title',
    type: 'title-slide',
    props: {
      title: 'Learn the alphabet',
      subtitle: 'Leçon 1',
    },
  },
  {
    id: 'intro-text',
    type: 'text-slide',
    props: {
      body: "Des fois, je revois la prononciation des lettres avec mes élèves C1 et C2. L'alphabet, c'est vraiment une étape qu'on oublie trop souvent.",
    },
  },
  {
    id: 'instructions-text',
    type: 'text-slide',
    props: {
      body: 'Pour commencer, écoute et répète après moi. Pas besoin de te prendre la tête avec la prononciation, laisse juste ton cerveau faire le boulot.',
    },
  },
  {
    id: 'alphabet-repeat',
    type: 'ai-speak-repeat',
    props: {
      title: 'Alphabet',
      defaultLang: 'en',
      lines: [
        [
          { label: 'A', speech: { mode: 'file', fileUrl: '/audio/alphabet/A.wav' } },
          { label: 'B', speech: { mode: 'file', fileUrl: '/audio/alphabet/B.wav' } },
          { label: 'C', speech: { mode: 'file', fileUrl: '/audio/alphabet/C.wav' } },
          { label: 'D', speech: { mode: 'file', fileUrl: '/audio/alphabet/D.wav' } },
          { label: 'E', speech: { mode: 'file', fileUrl: '/audio/alphabet/E.wav' } },
          { label: 'F', speech: { mode: 'file', fileUrl: '/audio/alphabet/F.wav' } },
        ],
        [
          { label: 'G', speech: { mode: 'file', fileUrl: '/audio/alphabet/G.wav' } },
          { label: 'H', speech: { mode: 'file', fileUrl: '/audio/alphabet/H.wav' } },
          { label: 'I', speech: { mode: 'file', fileUrl: '/audio/alphabet/I.wav' } },
          { label: 'J', speech: { mode: 'file', fileUrl: '/audio/alphabet/J.wav' } },
          { label: 'K', speech: { mode: 'file', fileUrl: '/audio/alphabet/K.wav' } },
          { label: 'L', speech: { mode: 'file', fileUrl: '/audio/alphabet/L.wav' } },
        ],
        [
          { label: 'M', speech: { mode: 'file', fileUrl: '/audio/alphabet/M.wav' } },
          { label: 'N', speech: { mode: 'file', fileUrl: '/audio/alphabet/N.wav' } },
          { label: 'O', speech: { mode: 'file', fileUrl: '/audio/alphabet/O.wav' } },
          { label: 'P', speech: { mode: 'file', fileUrl: '/audio/alphabet/P.wav' } },
          { label: 'Q', speech: { mode: 'file', fileUrl: '/audio/alphabet/Q.wav' } },
          { label: 'R', speech: { mode: 'file', fileUrl: '/audio/alphabet/R.wav' } },
        ],
        [
          { label: 'S', speech: { mode: 'file', fileUrl: '/audio/alphabet/S.wav' } },
          { label: 'T', speech: { mode: 'file', fileUrl: '/audio/alphabet/T.wav' } },
          { label: 'U', speech: { mode: 'file', fileUrl: '/audio/alphabet/U.wav' } },
          { label: 'V', speech: { mode: 'file', fileUrl: '/audio/alphabet/V.wav' } },
          { label: 'W', speech: { mode: 'file', fileUrl: '/audio/alphabet/W.wav' } },
          { label: 'X', speech: { mode: 'file', fileUrl: '/audio/alphabet/X.wav' } },
        ],
        [
          { label: 'Y', speech: { mode: 'file', fileUrl: '/audio/alphabet/Y.wav' } },
          { label: 'Z', speech: { mode: 'file', fileUrl: '/audio/alphabet/Z.wav' } },
        ],
      ],
    },
  },
  {
    id: 'practice-instructions',
    type: 'text-slide',
    props: {
      body: 'Génial ! Maintenant, on va y aller par petits bouts. Cette fois, je veux que toi tu dises la lettre, moi je répète, et ensuite tu répètes après moi.',
    },
  },
  {
    id: 'alphabet-group-1',
    type: 'ai-speak-student-repeat',
    props: {
      title: 'Alphabet - ABCDE',
      elements: [
        {
          samplePrompt: 'A',
          referenceText: 'A',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/A.wav' },
        },
        {
          samplePrompt: 'B',
          referenceText: 'B',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/B.wav' },
        },
        {
          samplePrompt: 'C',
          referenceText: 'C',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/C.wav' },
        },
        {
          samplePrompt: 'D',
          referenceText: 'D',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/D.wav' },
        },
        {
          samplePrompt: 'E',
          referenceText: 'E',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/E.wav' },
        },
      ],
      defaultLang: 'en',
    },
  },
  {
    id: 'alphabet-group-2',
    type: 'ai-speak-student-repeat',
    props: {
      title: 'Alphabet - FGHI',
      elements: [
        {
          samplePrompt: 'F',
          referenceText: 'F',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/F.wav' },
        },
        {
          samplePrompt: 'G',
          referenceText: 'G',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/G.wav' },
        },
        {
          samplePrompt: 'H',
          referenceText: 'H',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/H.wav' },
        },
        {
          samplePrompt: 'I',
          referenceText: 'I',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/I.wav' },
        },
      ],
      defaultLang: 'en',
    },
  },
  {
    id: 'alphabet-group-3',
    type: 'ai-speak-student-repeat',
    props: {
      title: 'Alphabet - JKLMN',
      elements: [
        {
          samplePrompt: 'J',
          referenceText: 'J',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/J.wav' },
        },
        {
          samplePrompt: 'K',
          referenceText: 'K',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/K.wav' },
        },
        {
          samplePrompt: 'L',
          referenceText: 'L',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/L.wav' },
        },
        {
          samplePrompt: 'M',
          referenceText: 'M',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/M.wav' },
        },
        {
          samplePrompt: 'N',
          referenceText: 'N',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/N.wav' },
        },
      ],
      defaultLang: 'en',
    },
  },
  {
    id: 'alphabet-group-4',
    type: 'ai-speak-student-repeat',
    props: {
      title: 'Alphabet - OPQRS',
      elements: [
        {
          samplePrompt: 'O',
          referenceText: 'O',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/O.wav' },
        },
        {
          samplePrompt: 'P',
          referenceText: 'P',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/P.wav' },
        },
        {
          samplePrompt: 'Q',
          referenceText: 'Q',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/Q.wav' },
        },
        {
          samplePrompt: 'R',
          referenceText: 'R',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/R.wav' },
        },
        {
          samplePrompt: 'S',
          referenceText: 'S',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/S.wav' },
        },
      ],
      defaultLang: 'en',
    },
  },
  {
    id: 'alphabet-group-5',
    type: 'ai-speak-student-repeat',
    props: {
      title: 'Alphabet - TUVW',
      elements: [
        {
          samplePrompt: 'T',
          referenceText: 'T',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/T.wav' },
        },
        {
          samplePrompt: 'U',
          referenceText: 'U',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/U.wav' },
        },
        {
          samplePrompt: 'V',
          referenceText: 'V',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/V.wav' },
        },
        {
          samplePrompt: 'W',
          referenceText: 'W',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/W.wav' },
        },
      ],
      defaultLang: 'en',
    },
  },
  {
    id: 'alphabet-group-6',
    type: 'ai-speak-student-repeat',
    props: {
      title: 'Alphabet - XYZ',
      elements: [
        {
          samplePrompt: 'X',
          referenceText: 'X',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/X.wav' },
        },
        {
          samplePrompt: 'Y',
          referenceText: 'Y',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/Y.wav' },
        },
        {
          samplePrompt: 'Z',
          referenceText: 'Z',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/Z.wav' },
        },
      ],
      defaultLang: 'en',
    },
  },
  {
    id: 'letters-different-text',
    type: 'text-slide',
    props: {
      body: "T'as remarqué que certaines lettres étaient carrément différentes, voire à l'opposé en français ?",
    },
  },
  {
    id: 'difficult-letters-text',
    type: 'text-slide',
    props: {
      body: 'Il y a des lettres en particulier qui sont super pénibles pour les francophones.',
    },
  },
  {
    id: 'practice-difficult-letters-text',
    type: 'text-slide',
    props: {
      body: "Allez, on va s'entraîner sur celles-là.",
    },
  },
  {
    id: 'difficult-letters-practice',
    type: 'ai-speak-student-repeat',
    props: {
      title: 'Lettres difficiles',
      elements: [
        {
          samplePrompt: 'A',
          referenceText: 'A',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/A.wav' },
        },
        {
          samplePrompt: 'E',
          referenceText: 'E',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/E.wav' },
        },
        {
          samplePrompt: 'G',
          referenceText: 'G',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/G.wav' },
        },
        {
          samplePrompt: 'I',
          referenceText: 'I',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/I.wav' },
        },
        {
          samplePrompt: 'J',
          referenceText: 'J',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/J.wav' },
        },
        {
          samplePrompt: 'R',
          referenceText: 'R',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/R.wav' },
        },
        {
          samplePrompt: 'U',
          referenceText: 'U',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/U.wav' },
        },
        {
          samplePrompt: 'W',
          referenceText: 'W',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/W.wav' },
        },
        {
          samplePrompt: 'Y',
          referenceText: 'Y',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/Y.wav' },
        },
        {
          samplePrompt: 'Z',
          referenceText: 'Z',
          speech: { mode: 'file', fileUrl: '/audio/alphabet/Z.wav' },
        },
      ],
      defaultLang: 'en',
    },
  },
  {
    id: 'game-instructions-text',
    type: 'text-slide',
    props: {
      body: "D'accord, maintenant place au jeu ! Voilà l'activité : je vais dire une lettre, et toi tu dois cliquer sur la lettre que j'ai dite. Si c'est la bonne, elle devient verte. Si c'est la mauvaise… elle devient rouge !",
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
        { label: 'A', speech: { mode: 'file', fileUrl: '/audio/alphabet/A.wav' } },
        { label: 'B', speech: { mode: 'file', fileUrl: '/audio/alphabet/B.wav' } },
        { label: 'C', speech: { mode: 'file', fileUrl: '/audio/alphabet/C.wav' } },
        { label: 'D', speech: { mode: 'file', fileUrl: '/audio/alphabet/D.wav' } },
        { label: 'E', speech: { mode: 'file', fileUrl: '/audio/alphabet/E.wav' } },
        { label: 'F', speech: { mode: 'file', fileUrl: '/audio/alphabet/F.wav' } },
        { label: 'G', speech: { mode: 'file', fileUrl: '/audio/alphabet/G.wav' } },
        { label: 'H', speech: { mode: 'file', fileUrl: '/audio/alphabet/H.wav' } },
        { label: 'I', speech: { mode: 'file', fileUrl: '/audio/alphabet/I.wav' } },
        { label: 'J', speech: { mode: 'file', fileUrl: '/audio/alphabet/J.wav' } },
        { label: 'K', speech: { mode: 'file', fileUrl: '/audio/alphabet/K.wav' } },
        { label: 'L', speech: { mode: 'file', fileUrl: '/audio/alphabet/L.wav' } },
        { label: 'M', speech: { mode: 'file', fileUrl: '/audio/alphabet/M.wav' } },
        { label: 'N', speech: { mode: 'file', fileUrl: '/audio/alphabet/N.wav' } },
        { label: 'O', speech: { mode: 'file', fileUrl: '/audio/alphabet/O.wav' } },
        { label: 'P', speech: { mode: 'file', fileUrl: '/audio/alphabet/P.wav' } },
        { label: 'Q', speech: { mode: 'file', fileUrl: '/audio/alphabet/Q.wav' } },
        { label: 'R', speech: { mode: 'file', fileUrl: '/audio/alphabet/R.wav' } },
        { label: 'S', speech: { mode: 'file', fileUrl: '/audio/alphabet/S.wav' } },
        { label: 'T', speech: { mode: 'file', fileUrl: '/audio/alphabet/T.wav' } },
        { label: 'U', speech: { mode: 'file', fileUrl: '/audio/alphabet/U.wav' } },
        { label: 'V', speech: { mode: 'file', fileUrl: '/audio/alphabet/V.wav' } },
        { label: 'W', speech: { mode: 'file', fileUrl: '/audio/alphabet/W.wav' } },
        { label: 'X', speech: { mode: 'file', fileUrl: '/audio/alphabet/X.wav' } },
        { label: 'Y', speech: { mode: 'file', fileUrl: '/audio/alphabet/Y.wav' } },
        { label: 'Z', speech: { mode: 'file', fileUrl: '/audio/alphabet/Z.wav' } },
      ],
    },
  },
  {
    id: 'lesson-end',
    type: 'lesson-end',
    props: {
      title: 'Bravo, tu as terminé la leçon !',
      message:
        "Tu as bien travaillé sur l'alphabet ! Tu peux revoir cette leçon, continuer ton parcours, ou revenir plus tard. L'important, c'est la régularité — pas la perfection.",
      actions: [
        { type: 'restart', label: 'Recommencer la leçon' },
        { type: 'progress', label: 'Voir ma progression' },
      ],
    },
  },
];
