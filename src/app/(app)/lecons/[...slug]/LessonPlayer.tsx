'use client';

import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useLessonNotes } from '@/components/lesson/useLessonNotes';

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

const LessonPlayer = forwardRef<LessonPlayerHandle, LessonPlayerProps>(
  ({ lessonSlug, slides, hideInternalNav = false, onReachEnd }, ref) => {
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
              <div style={{ marginTop: '16px' }}>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your note here..."
                  style={{ 
                    width: '100%', 
                    minHeight: '100px', 
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
                <button
                  onClick={handleSaveNote}
                  disabled={!noteContent.trim()}
                  style={{
                    marginTop: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
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
              <div style={{ marginTop: '16px' }}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your answer here..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}
                />
                <button
                  onClick={handleInputCheck}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Vérifier
                </button>
                {hasInputCheckPassed() && (
                  <p style={{ color: 'green', marginTop: '8px' }}>✓ Correct!</p>
                )}
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    useImperativeHandle(ref, () => ({ next, prev, goTo, index }), [index]);

    return (
      <div className="h-full w-full flex flex-col">
        <div className="flex-1 overflow-auto p-4">
          {current?.title && (
            <h2 className="text-xl font-semibold mb-2">{current.title}</h2>
          )}
          <div>{renderSlideContent()}</div>
        </div>

        {!hideInternalNav && (
          <div className="border-t p-3 flex justify-between">
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
