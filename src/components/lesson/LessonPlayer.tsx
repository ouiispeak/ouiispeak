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
  // Fallback if unknown
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

  // Hooks (notes/bookmarks)
  const lessonSlugFull = `${moduleSlug}/${lessonSlug}`;
  const { notes, add: addNote, hasAny: hasAnyNotes } = useLessonNotes(lessonSlugFull);
  const { isBookmarked, add: addBookmark } = useLessonBookmarks(lessonSlugFull);

  // Compute if we can go next based on slide kind
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

  // Save progress to DB whenever index changes (and on mount)
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
    setInputValue(''); // reset for next slide
    setIndex(i => i + 1);
  };

  const onRestart = () => { setIndex(0); setInputValue(''); };
  const onQuit = () => router.replace('/lecons');

  // Sidebar UI bits used in Step 2 (kept)
  const [panel, setPanel] = useState<'none' | 'notes'>('none');
  const [noteText, setNoteText] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [bookmarkStatus, setBookmarkStatus] = useState<'idle' | 'saving' | 'done' | 'already'>('idle');

  const handleSaveNote = async () => {
    if (!noteText.trim()) return;
    setNoteSaving(true);
    try {
      await addNote(noteText.trim(), current.id);
      setNoteText('');
    } finally { setNoteSaving(false); }
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
    } finally {}
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      {/* Sidebar 20% */}
      <aside
        style={{
          width: '20%', minWidth: 240, maxWidth: 360,
          borderRight: '1px solid #e5e7eb', padding: 16,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}
      >
        <div style={{ fontWeight: 600 }}>
          {moduleSlug} / {lessonSlug}
        </div>

        <nav style={{ display: 'grid', gap: 8 }}>
          <button type="button" onClick={() => setPanel(p => (p === 'notes' ? 'none' : 'notes'))}>
            Notes{hasAnyNotes ? ' (présentes)' : ''}
          </button>
          <button type="button" onClick={handleBookmark} disabled={bookmarkStatus === 'saving' || isBookmarked(current.id)}>
            {isBookmarked(current.id) ? 'Signet enregistré' :
             bookmarkStatus === 'saving' ? 'Enregistrement…' :
             bookmarkStatus === 'already' ? 'Déjà enregistré' : 'Ajouter un signet'}
          </button>
          <button type="button" onClick={() => alert('Aide IA (à venir)')}>Aide</button>
          <button type="button" onClick={onRestart}>Redémarrer</button>
          <button type="button" onClick={onQuit}>Quitter</button>
        </nav>

        {panel === 'notes' && (
          <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
            <div style={{ fontWeight: 600 }}>Notes</div>
            <textarea
              rows={5}
              placeholder="Saisir une note pour cette diapositive…"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              style={{ width: '100%' }}
            />
            <button type="button" onClick={handleSaveNote} disabled={noteSaving || !noteText.trim()}>
              {noteSaving ? 'Enregistrement…' : 'Enregistrer la note'}
            </button>

            <div style={{ fontSize: 12, color: '#6b7280' }}>
              {notes.length} note(s) pour cette leçon.
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, maxHeight: 160, overflow: 'auto' }}>
              {notes.map(n => (
                <li key={n.id} style={{ marginBottom: 4 }}>
                  <span style={{ color: '#6b7280' }}>
                    [{n.slide_id ?? 'général'}] {new Date(n.created_at).toLocaleString()}
                  </span>
                  <div>{n.content}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ marginTop: 'auto', fontSize: 12, color: '#6b7280' }}>
          Barre latérale · 20%
        </div>
      </aside>

      {/* Main 80% */}
      <main style={{ flex: 1, position: 'relative', padding: 24 }}>
        <section
          style={{
            height: 'calc(100% - 100px)',
            display: 'grid',
            alignContent: 'center',
            justifyItems: 'center',
            gap: 12,
            textAlign: 'center'
          }}
        >
          <h1 style={{ fontSize: 28 }}>{current.title}</h1>
          {current.body && <p style={{ fontSize: 18 }}>{current.body}</p>}

          {current.kind === 'input' && (
            <div style={{ display: 'grid', gap: 8, width: '100%', maxWidth: 520 }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Votre réponse…"
                style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
              />
              <div style={{ fontSize: 12, color: canNext ? '#16a34a' : '#dc2626' }}>
                {canNext ? 'Réponse acceptable' : 'Condition non remplie'}
              </div>
            </div>
          )}

          {current.kind === 'note' && (
            <div style={{ fontSize: 14, color: hasNoteOnThisSlide ? '#16a34a' : '#dc2626' }}>
              {hasNoteOnThisSlide ? 'Note enregistrée pour cette diapo.' : 'Aucune note enregistrée pour cette diapo.'}
            </div>
          )}
        </section>

        {/* Prev/Next controls */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 24,
            right: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12
          }}
        >
          <button type="button" onClick={onPrev} disabled={!canPrev}>← Précédent</button>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            {index + 1} / {slides.length} · diapo: {current.id}
          </div>
          <button type="button" onClick={onNext} disabled={!canNext}>
            {isLast ? 'Terminer' : 'Suivant →'}
          </button>
        </div>
      </main>
    </div>
  );
}
