export type SlideKind =
  | 'narration'          // show text, "Play" button later
  | 'letters_free'       // shows A B C, highlights on click (stub for ASR live)
  | 'letters_repeat'     // repeat-after-me gating (stub: require user to click each letter "Correct")
  | 'note_required'      // require user to save a note before proceeding
  | 'chat_task'          // require at least one message sent (stub)
  | 'text_input'         // require text includes tokens
  | 'exit';              // end: button exits to /lecons

export type Gate =
  | { type: 'none' }
  | { type: 'note' }
  | { type: 'chat' }
  | { type: 'text_includes'; tokens: string[] }
  | { type: 'letters_repeat'; letters: string[]; minAccuracy?: number };

export interface Slide {
  id: string;
  kind: SlideKind;
  title?: string;
  body?: string;
  letters?: string[];
  gate: Gate;
}

export interface LessonDefinition {
  slug: string;
  title: string;
  slides: Slide[];
}

// Sample lesson "using-the-interface"
export const SAMPLE_LESSONS: Record<string, LessonDefinition> = {
  'using-the-interface': {
    slug: 'using-the-interface',
    title: 'Utiliser l\'interface',
    slides: [
      { id: 's1', kind: 'narration', title: 'Bienvenue', body: 'Nous allons apprendre aujourd\'hui !', gate: { type: 'none' } },
      { id: 's2', kind: 'narration', title: 'Lecture à voix haute', body: 'Lis ces lettres à voix haute.', gate: { type: 'none' } },
      { id: 's3', kind: 'letters_free', title: 'A B C', letters: ['A','B','C'], gate: { type: 'none' } },
      { id: 's4', kind: 'narration', title: 'Répète après moi', body: 'A, B, C', gate: { type: 'none' } },
      { id: 's5', kind: 'letters_repeat', title: 'Répétition guidée', letters: ['A','B','C'], gate: { type: 'letters_repeat', letters: ['A','B','C'], minAccuracy: 0.6 } },
      { id: 's6', kind: 'note_required', title: 'Note', body: 'Dans tes notes, écris la lettre la plus difficile.', gate: { type: 'note' } },
      { id: 's7', kind: 'chat_task', title: 'Obtenir de l\'aide', body: 'Demande à l\'assistant : "Quelle heure est-il ?"', gate: { type: 'chat' } },
      { id: 's8', kind: 'narration', title: 'Bravo !', body: 'Super !', gate: { type: 'none' } },
      { id: 's9', kind: 'text_input', title: 'Nom du site', body: 'Tape le nom du site :', gate: { type: 'text_includes', tokens: ['ouii','speak'] } },
      { id: 's10', kind: 'narration', title: 'Excellent !', body: 'C\'était fantastique !', gate: { type: 'none' } },
      { id: 's11', kind: 'text_input', title: 'Révision', body: 'Quelles lettres ai-je données ?', gate: { type: 'text_includes', tokens: ['a','b','c'] } },
      { id: 's12', kind: 'exit', title: 'Terminé', body: 'Retourne aux leçons pour continuer ou faire une pause.', gate: { type: 'none' } },
    ],
  },
};
