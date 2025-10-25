'use client';

import { useEffect, useMemo, useState, forwardRef, useImperativeHandle } from 'react';
import { useRouter } from 'next/navigation';
import { useLessonNotes } from './useLessonNotes';
import { useLessonBookmarks } from './useLessonBookmarks';

export type Slide = 
  | { kind: 'text'; id: string; title?: string; html?: string }
  | { kind: 'note-required'; id: string; title?: string; prompt: string }
  | {
      kind: 'text-input-check';
      id: string;
      title?: string;
      prompt: string;
      mustInclude: string[]; // tokens the answer must contain (case-insensitive)
    };

export type LessonPlayerHandle = {
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  index: number;
};

type LessonPlayerProps = {
  lessonSlug: string;
  slides: Slide[];
  hideInternalNav?: boolean;
  onReachEnd?: () => void;
};

function normalize(s: string) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function includesAllTokens(input: string, tokens: string[]) {
  const norm = normalize(input);
  return tokens.every(t => norm.includes(t.toLowerCase()));
}

const LessonPlayer = forwardRef<LessonPlayerHandle, LessonPlayerProps>(
  ({ lessonSlug, slides, hideInternalNav = false, onReachEnd }, ref) => {
    const router = useRouter();
    const [index, setIndex] = useState(0);
    const [noteContent, setNoteContent] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [inputCheckPassed, setInputCheckPassed] = useState<Record<string, boolean>>({});
    
    const current = slides[index];
    const { notes, add } = useLessonNotes(lessonSlug);

    // Check if current slide has a note
    const hasNoteForCurrentSlide = () => {
      if (current?.kind !== 'note-required') return false;
      return notes.some(note => note.slide_id === current.id);
    };

    // Check if input validation passed for current slide
    const hasInputCheckPassed = () => {
      if (current?.kind !== 'text-input-check') return true;
      return inputCheckPassed[current.id] || false;
    };

    const canProceed = () => {
      if (!current) return false;
      
      switch (current.kind) {
        case 'text':
          return true;
        case 'note-required':
          return hasNoteForCurrentSlide();
        case 'text-input-check':
          return hasInputCheckPassed();
        default:
          return true;
      }
    };

    const canNext = () => canProceed() && index < slides.length - 1;

    const next = () => {
      if (!canProceed()) return;
      if (index < slides.length - 1) {
        const ni = index + 1;
        setIndex(ni);
        if (ni === slides.length - 1) onReachEnd?.();
      }
    };

    const prev = () => {
      if (index > 0) setIndex(index - 1);
    };

    const goTo = (i: number) => {
      if (i >= 0 && i < slides.length) setIndex(i);
    };

    const handleSaveNote = async () => {
      if (current?.kind === 'note-required' && noteContent.trim()) {
        await add(noteContent.trim(), current.id);
        setNoteContent('');
      }
    };

    const handleInputCheck = () => {
      if (current?.kind === 'text-input-check') {
        const normalizedInput = inputValue.toLowerCase().replace(/[^\w\s]/g, '');
        const allTokensPresent = current.mustInclude.every(token => 
          normalizedInput.includes(token.toLowerCase())
        );
        setInputCheckPassed(prev => ({ ...prev, [current.id]: allTokensPresent }));
      }
    };

    // Save progress when index changes
    useEffect(() => {
      const pct = Math.round(((index + 1) / slides.length) * 100);
      const payload = {
        lesson_slug: lessonSlug,
        slide_id: current.id,
        percent: pct,
        done: false,
      };
      fetch('/api/lesson-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }, [index, slides.length, current.id, lessonSlug]);

    const renderSlideContent = () => {
      if (!current) return null;

      switch (current.kind) {
        case 'text':
          return (
            <div>
              {current.html && <p>{current.html}</p>}
            </div>
          );

        case 'note-required':
          return (
            <div>
              <p>{current.prompt}</p>
              <div>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your note here..."
                  className="w-full min-h-[100px]"
                />
                <button
                  onClick={handleSaveNote}
                  disabled={!noteContent.trim()}
                  className="disabled:opacity-50"
                >
                  Enregistrer la note
                </button>
              </div>
            </div>
          );

        case 'text-input-check':
          return (
            <div>
              <p>{current.prompt}</p>
              <div>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full"
                />
                <button
                  onClick={handleInputCheck}
                >
                  Vérifier
                </button>
                {hasInputCheckPassed() && (
                  <p>✓ Correct!</p>
                )}
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useImperativeHandle(ref, () => ({ next, prev, goTo, index }), [index]);

    return (
      <div className="w-full flex flex-col">
        <div className="flex-1 overflow-auto">
          {current?.title && (
            <h2>{current.title}</h2>
          )}
          <div>{renderSlideContent()}</div>
        </div>

        {!hideInternalNav && (
          <div className="border-t flex justify-between">
            <button onClick={prev} disabled={index === 0}>
              ← Précédent
            </button>
            <div>{index + 1} / {slides.length}</div>
            <button onClick={next} disabled={!canNext()}>
              Suivant →
            </button>
          </div>
        )}
      </div>
    );
  }
);

LessonPlayer.displayName = 'LessonPlayer';
export default LessonPlayer;