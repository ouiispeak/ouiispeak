'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLessonNotes } from './useLessonNotes';
import { useLessonBookmarks } from './useLessonBookmarks';
import { getLesson } from '@/lessons/registry';
import type { SlideDef } from '@/lessons/types';

type Props = { moduleSlug: string; lessonSlug: string; };

function normalize(s: string) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function includesAllTokens(input: string, tokens: string[]) {
  const norm = normalize(input);
  return tokens.every(t => norm.includes(t.toLowerCase()));
}

export default function LessonPlayer({ moduleSlug, lessonSlug }: Props) {
  const router = useRouter();
  const search = useSearchParams();
  const initialSlideId = search.get('slide') ?? null;
  
  const lesson = getLesson(moduleSlug, lessonSlug);

  // Fallback slide content if the lesson isn't found
  const slides: SlideDef[] = lesson?.slides ?? [
    { id: 'intro', kind: 'free', title: 'Leçon inconnue', body: 'Aucune diapo.' }
  ];

  const initialIndex = initialSlideId
    ? Math.max(0, slides.findIndex(s => s.id === initialSlideId))
    : 0;

  const [index, setIndex] = useState(initialIndex);
  const [inputValue, setInputValue] = useState('');
  const current = slides[index];
  const canPrev = index > 0;
  const isLast = index === slides.length - 1;

  // notes / bookmarks hooks
  const lessonSlugFull = `${moduleSlug}/${lessonSlug}`;
  const { notes, add: addNote, hasAny: hasAnyNotes } = useLessonNotes(lessonSlugFull);
  const { isBookmarked, add: addBookmark } = useLessonBookmarks(lessonSlugFull);

  // derived booleans to allow "next"
  const hasNoteOnThisSlide = useMemo(
    () => notes.some(n => (n.slide_id ?? '') === current.id),
    [notes, current.id]
  );

  const passesInput = useMemo(() => {
    if (current.kind !== 'input') return true;
    const accept = current.accept ?? {};
    let ok = true;
    if (accept.includesAll?.length) {
      ok = ok && includesAllTokens(inputValue, accept.includesAll);
    }
    if (accept.regexes?.length) {
      const anyRegexOk = accept.regexes.some(r => {
        try {
          const re = new RegExp(r, 'i');
          return re.test(inputValue);
        } catch {
          return false;
        }
      });
      ok = ok && anyRegexOk;
    }
    return ok;
  }, [current, inputValue]);

  const canNext = current.kind === 'free'
    ? true
    : current.kind === 'input'
    ? passesInput
    : current.kind === 'note'
    ? hasNoteOnThisSlide
    : true;

  // Save progress when index changes / mount
  useEffect(() => {
    const pct = Math.round(((index + 1) / slides.length) * 100);
    const payload = {
      lesson_slug: lessonSlugFull,
      slide_id: current.id,
      percent: pct,
      done: false,
    };
    fetch('/api/lesson-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }, [index, slides.length, current.id, lessonSlugFull]);

  const onPrev = () => { if (canPrev) setIndex(i => i - 1); };

  const onNext = async () => {
    if (!canNext) return;
    if (isLast) {
      // mark done
      await fetch('/api/lesson-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_slug: lessonSlugFull,
          slide_id: current.id,
          percent: 100,
          done: true,
        }),
      }).catch(() => {});
      router.replace('/lecons');
      return;
    }
    setInputValue(''); // reset field for next slide
    setIndex(i => i + 1);
  };

  const onRestart = () => { setIndex(0); setInputValue(''); };
  const onQuit    = () => router.replace('/lecons');

  // sidebar UI local state
  const [panel, setPanel] = useState<'none' | 'notes'>('none');
  const [noteText, setNoteText] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [bookmarkStatus, setBookmarkStatus] =
    useState<'idle' | 'saving' | 'done' | 'already'>('idle');

  const handleSaveNote = async () => {
    if (!noteText.trim()) return;
    setNoteSaving(true);
    try {
      await addNote(noteText.trim(), current.id);
      setNoteText('');
    } finally {
      setNoteSaving(false);
    }
  };

  const handleBookmark = async () => {
    if (isBookmarked(current.id)) {
      setBookmarkStatus('already');
      return;
    }
    setBookmarkStatus('saving');
    try {
      await addBookmark(current.id);
      setBookmarkStatus('done');
    } finally {
      // no-op
    }
  };

  return (
    // OUTER FLEX: lesson content + sidebar
    // Mobile: stacked. Desktop: row.
    <div className="flex flex-col md:flex-row w-full h-full text-[#222326]">
      {/* MAIN AREA */}
      <main className="flex-1 min-w-0 relative p-6 flex flex-col items-center text-center">
        {/* Slide content area */}
        <section
          className="flex flex-col items-center text-center gap-3 w-full max-w-prose flex-grow"
        >
          <h1 className="text-xl font-medium">
            {current.title}
          </h1>

          {current.body && (
            <p className="text-base text-[#222326]/80">
              {current.body}
            </p>
          )}

          {current.kind === 'input' && (
            <div className="flex flex-col gap-2 w-full max-w-md">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Votre réponse…"
                className="w-full border border-[#ddd] rounded-md px-3 py-2 text-base"
              />
              <div
                className={`text-xs ${
                  canNext ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {canNext ? 'Réponse acceptable' : 'Condition non remplie'}
              </div>
            </div>
          )}

          {current.kind === 'note' && (
            <div
              className={`text-sm ${
                hasNoteOnThisSlide ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {hasNoteOnThisSlide
                ? 'Note enregistrée pour cette diapo.'
                : 'Aucune note enregistrée pour cette diapo.'}
            </div>
          )}
        </section>

        {/* Bottom nav (prev / progress / next) */}
        <div className="mt-8 w-full flex items-center justify-between text-sm text-[#222326]">
          <button
            type="button"
            onClick={onPrev}
            disabled={!canPrev}
            className="underline hover:text-blue-600 hover:underline disabled:opacity-40"
          >
            ← Précédent
          </button>

          <div className="text-xs text-[#6b7280]">
            {index + 1} / {slides.length} · diapo: {current.id}
          </div>

          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            className="underline hover:text-blue-600 hover:underline disabled:opacity-40"
          >
            {isLast ? 'Terminer' : 'Suivant →'}
          </button>
        </div>
      </main>

      {/* SIDEBAR AREA (goes to the RIGHT on desktop) */}
      <aside className="w-full md:w-64 border-t md:border-t-0 md:border-l border-[#ddd] p-6 flex flex-col gap-4 text-sm text-center md:text-left bg-white">
        {/* Module / lesson label */}
        <div className="font-medium">
          {moduleSlug} / {lessonSlug}
        </div>

        <hr className="border-[#ddd]" />

        {/* Notes toggle / panel */}
        <button
          type="button"
          onClick={() =>
            setPanel((p) => (p === 'notes' ? 'none' : 'notes'))
          }
          className="text-[#222326] hover:text-blue-600 hover:underline"
        >
          Notes{hasAnyNotes ? ' (présentes)' : ''}
        </button>

        {/* Signet / bookmark */}
        <button
          type="button"
          onClick={handleBookmark}
          disabled={bookmarkStatus === 'saving' || isBookmarked(current.id)}
          className="text-[#222326] hover:text-blue-600 hover:underline disabled:opacity-40 disabled:no-underline"
        >
          {isBookmarked(current.id)
            ? 'Signet enregistré'
            : bookmarkStatus === 'saving'
            ? 'Enregistrement…'
            : bookmarkStatus === 'already'
            ? 'Déjà enregistré'
            : 'Ajouter un signet'}
        </button>

        {/* Aide */}
        <button
          type="button"
          onClick={() => alert('Aide IA (à venir)')}
          className="text-[#222326] hover:text-blue-600 hover:underline"
        >
          Aide
        </button>

        {/* Redémarrer */}
        <button
          type="button"
          onClick={onRestart}
          className="text-[#222326] hover:text-blue-600 hover:underline"
        >
          Redémarrer
        </button>

        {/* Quitter */}
        <button
          type="button"
          onClick={onQuit}
          className="text-[#222326] hover:text-blue-600 hover:underline"
        >
          Quitter
        </button>

        {/* Notes panel (editable) */}
        {panel === 'notes' && (
          <div className="mt-2 flex flex-col gap-2 text-left text-[#222326]">
            <div className="font-medium">Notes</div>

            <textarea
              rows={5}
              placeholder="Saisir une note pour cette diapositive…"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full border border-[#ddd] rounded-md px-3 py-2 text-sm"
            />

            <button
              type="button"
              onClick={handleSaveNote}
              disabled={noteSaving || !noteText.trim()}
              className="underline text-[#222326] hover:text-blue-600 hover:underline disabled:opacity-40 disabled:no-underline text-left text-sm"
            >
              {noteSaving ? 'Enregistrement…' : 'Enregistrer la note'}
            </button>

            <div className="text-xs text-[#6b7280]">
              {notes.length} note(s) pour cette leçon.
            </div>

            <ul className="m-0 max-h-40 overflow-auto pl-4 text-xs text-[#222326] list-disc">
              {notes.map((n) => (
                <li key={n.id} className="mb-2">
                  <span className="block text-[#6b7280]">
                    [{n.slide_id ?? 'général'}]{' '}
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                  <div>{n.content}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* little footer label */}
        <div className="mt-auto text-[10px] text-[#6b7280] text-center md:text-left">
          Barre latérale · outils
        </div>
      </aside>
    </div>
  );
}