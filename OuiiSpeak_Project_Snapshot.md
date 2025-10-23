# OuiiSpeak Project Snapshot

**Generated:** January 17, 2025  
**Repository:** github.com/ouiispeak/ouiispeak  
**Branch:** main (commit: 1015292)

## Tech Stack & Versions

- **Next.js:** 15.5.5
- **React:** 19.1.0
- **React DOM:** 19.1.0
- **TypeScript:** ^5
- **Supabase:** @supabase/supabase-js ^2.75.0, @supabase/ssr ^0.7.0
- **Tailwind CSS:** ^4 (with @tailwindcss/postcss ^4)
- **ESLint:** ^9 (with eslint-config-next 15.5.5)

## Build & Lint Settings

### Next.js Config (`next.config.ts`)
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Prevent type errors from failing Vercel builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
```

### ESLint Config (`eslint.config.mjs`)
- **Presets:** next/core-web-vitals, next/typescript
- **Relaxed Rules:**
  - `@typescript-eslint/no-explicit-any`: "warn"
  - `@typescript-eslint/no-unused-vars`: "warn" (ignores `_` prefixed vars)
  - `@typescript-eslint/ban-ts-comment`: "off"
  - `@next/next/no-html-link-for-pages`: "off"

### PostCSS Config (`postcss.config.mjs`)
```javascript
const config = {
  plugins: ["@tailwindcss/postcss"],
};
export default config;
```

## Environment Variables (Names Only)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Folder Tree (Depth 3)

```
src/
├── app/
│   ├── (app)/                    # Authenticated routes
│   │   ├── activites/
│   │   ├── carnet/
│   │   ├── compte/
│   │   ├── layout.tsx
│   │   ├── lecons/
│   │   │   ├── [...slug]/
│   │   │   ├── [module]/
│   │   │   └── page.tsx
│   │   ├── progression/
│   │   └── tableau-de-bord/
│   ├── (public)/                 # Public routes
│   │   ├── a-propos/
│   │   ├── abonnements/
│   │   ├── accueil/
│   │   ├── auth/
│   │   ├── contact/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── lesson-bookmarks/
│   │   ├── lesson-notes/
│   │   └── lesson-progress/
│   ├── auth/
│   │   └── callback/
│   ├── favicon.ico
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── AuthForm.tsx
│   ├── LogoutButton.tsx
│   ├── ProfileForm.tsx
│   ├── SupabasePing.tsx
│   └── lesson/
│       ├── LessonPlayer.tsx
│       ├── useLessonBookmarks.ts
│       └── useLessonNotes.ts
├── lessons/
│   ├── module-1/
│   ├── registry.ts
│   ├── sampleLessons.ts
│   └── types.ts
└── lib/
    ├── lessonQueries.ts
    ├── supabaseClient.ts
    └── supabaseServer.ts
```

## Routes Overview

### Public Routes (`(public)`)
- `/` - Landing page
- `/auth` - Authentication (sign up/sign in)
- `/accueil` - Home page
- `/a-propos` - About page
- `/abonnements` - Subscriptions
- `/contact` - Contact page

### Authenticated Routes (`(app)`)
- `/tableau-de-bord` - Dashboard
- `/lecons` - Lessons index
- `/lecons/[...slug]` - Dynamic lesson player
- `/lecons/[module]/[lesson]` - Specific lesson
- `/progression` - Progress tracking
- `/carnet` - Notebook/notes
- `/activites` - Activities/bookmarks
- `/compte` - Account/profile

### API Routes
- `/api/lesson-progress` - Track lesson completion
- `/api/lesson-notes` - Manage lesson notes
- `/api/lesson-bookmarks` - Manage bookmarks
- `/auth/callback` - Supabase auth callback

## Supabase Integration

### Client-side (`src/lib/supabaseClient.ts`)
```typescript
'use client';

import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Server-side (`src/lib/supabaseServer.ts`)
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
      set: () => {},
      remove: () => {},
    },
  });
}
```

### Auth Flow
- **Authentication:** Email/password via Supabase Auth
- **Route Protection:** Server-side auth checks in `(app)` layout
- **Callback:** `/auth/callback` handles auth state sync
- **Middleware:** `middleware.disabled.ts` (currently disabled) for cookie sync

## Key Files (Embedded, Truncated)

### Root Layout (`src/app/layout.tsx`)
```typescript
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: 'OuiiSpeak' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
```

### Public Landing Page (`src/app/(public)/page.tsx`)
```typescript
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'OuiiSpeak — Page de destination' };

export default function LandingPage() {
  return (
    <main>
      <h1>Page de destination</h1>
      <p>Bienvenue sur OuiiSpeak.</p>
    </main>
  );
}
```

### Auth Page (`src/app/(public)/auth/page.tsx`)
```typescript
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabaseServer';
import AuthForm from '@/components/AuthForm';

export const metadata: Metadata = { title: 'Connexion — OuiiSpeak' };

export default async function AuthPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/tableau-de-bord');

  return (
    <main>
      <h1>Connexion / Inscription</h1>
      <AuthForm />
    </main>
  );
}
```

### App Layout (`src/app/(app)/layout.tsx`)
```typescript
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabase } from '../../lib/supabaseServer';
import LogoutButton from '../../components/LogoutButton';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth');
  }

  return (
    <section>
      <header style={{ padding: '12px 16px', borderBottom: '1px solid #ddd' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <nav style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/tableau-de-bord">Tableau de bord</Link>
            <Link href="/lecons">Leçons</Link>
            <Link href="/progression">Progression</Link>
            <Link href="/carnet">Carnet</Link>
            <Link href="/activites">Activités</Link>
            <Link href="/compte">Compte</Link>
          </nav>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span>{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      {children}
    </section>
  );
}
```

### Auth Form (`src/components/AuthForm.tsx`)
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSignUp() {
    setLoading(true); setMsg(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMsg(error.message);
    else {
      setMsg('Compte créé. Redirection…');
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push('/tableau-de-bord');
    }
    setLoading(false);
  }

  async function handleSignIn() {
    setLoading(true); setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg(error.message);
    else {
      setMsg('Connexion réussie. Redirection…');
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push('/tableau-de-bord');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div>
        <label>Email</label><br />
        <input
          type="email"
          placeholder="email@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>
      <div>
        <label>Mot de passe</label><br />
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>
      <div style={{ marginTop: 12 }}>
        <button type="button" onClick={handleSignUp} disabled={loading}>
          S'inscrire
        </button>{' '}
        <button type="button" onClick={handleSignIn} disabled={loading}>
          Se connecter
        </button>
      </div>
      {msg && <p>{msg}</p>}
    </form>
  );
}
```

### Supabase Ping (`src/components/SupabasePing.tsx`)
```typescript
'use client';
import React from 'react';
import { supabase } from '../lib/supabaseClient';

export default function SupabasePing() {
  const [status, setStatus] = React.useState('checking…');

  React.useEffect(() => {
    (async () => {
      try {
        console.log('ENV URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('ENV ANON length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length);

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        setStatus(`connected ✅ (session: ${data.session ? 'yes' : 'no'})`);
        console.log('Supabase session:', data.session);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.error('Supabase ping error:', e);
        setStatus('connection error ❌ — check console for details');
      }
    })();
  }, []);

  return <p className="mt-4 text-sm text-gray-600">Supabase: {status}</p>;
}
```

### Lesson Progress API (`src/app/api/lesson-progress/route.ts`)
```typescript
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const { lesson_slug, slide_id: _slide_id, percent, done } = await req.json();
    if (!lesson_slug || typeof lesson_slug !== 'string') {
      return NextResponse.json({ error: 'lesson_slug manquant' }, { status: 400 });
    }
    const [moduleSlug, lessonSlug] = lesson_slug.split('/');
    if (!moduleSlug || !lessonSlug) {
      return NextResponse.json({ error: 'Format lesson_slug invalide' }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    // 1) Get module id
    const { data: mod, error: modErr } = await supabase
      .from('modules')
      .select('id')
      .eq('slug', moduleSlug)
      .maybeSingle();
    if (modErr || !mod) return NextResponse.json({ error: 'Module introuvable' }, { status: 404 });

    // 2) Get lesson id
    const { data: lesson, error: lesErr } = await supabase
      .from('lessons')
      .select('id')
      .eq('module_id', mod.id)
      .eq('slug', lessonSlug)
      .maybeSingle();
    if (lesErr || !lesson) return NextResponse.json({ error: 'Leçon introuvable' }, { status: 404 });

    const pct = Math.max(0, Math.min(100, Number(percent ?? 0)));

    // Try update first
    const { data: upd, error: updErr } = await supabase
      .from('user_lessons')
      .update({
        score: pct,
        ...(done ? { completed_at: new Date().toISOString() } : {}),
      })
      .eq('user_id', user.id)
      .eq('lesson_id', lesson.id)
      .select('id');

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 400 });
    }

    if (!upd || upd.length === 0) {
      // Insert
      const { error: insErr } = await supabase
        .from('user_lessons')
        .insert({
          user_id: user.id,
          lesson_id: lesson.id,
          score: pct,
          ...(done ? { completed_at: new Date().toISOString() } : {}),
        });
      if (insErr) {
        return NextResponse.json({ error: insErr.message }, { status: 400 });
      }
    }

    return NextResponse.json({ ok: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Erreur inconnue' }, { status: 500 });
  }
}
```

### Lesson Queries (`src/lib/lessonQueries.ts`)
```typescript
export type LessonRow = {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  order_index: number;
  estimated_minutes: number | null;
  required_score: number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any | null;
};

export type UserLessonRow = {
  id: string;
  user_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number | null;
  current_step: number | null;
  started_at: string | null;
  last_opened_at: string | null;
  completed_at: string | null;
  notes: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchModuleAndLessons(supabase: any, moduleSlug: string) {
  // Get the module
  const { data: module, error: modErr } = await supabase
    .from('modules')
    .select('id, slug, title, level, order_index, description')
    .eq('slug', moduleSlug)
    .single();
  if (modErr) throw modErr;

  // Get lessons for the module
  const { data: lessons, error: lesErr } = await supabase
    .from('lessons')
    .select('id, module_id, slug, title, order_index, estimated_minutes, required_score, content')
    .eq('module_id', module.id)
    .order('order_index', { ascending: true });
  if (lesErr) throw lesErr;

  return { module, lessons: lessons as LessonRow[] };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchUserLessonProgress(supabase: any, userId: string, lessonIds: string[]) {
  if (!userId || lessonIds.length === 0) return [];
  const { data, error } = await supabase
    .from('user_lessons')
    .select('id, user_id, lesson_id, status, score, current_step, started_at, last_opened_at, completed_at, notes')
    .in('lesson_id', lessonIds)
    .eq('user_id', userId);
  if (error) throw error;
  return data as UserLessonRow[];
}

export function computeUnlocks(lessons: LessonRow[], progress: Record<string, UserLessonRow | undefined>) {
  // Returns a map: lessonId -> { unlocked: boolean, reason: string }
  const unlockMap: Record<string, { unlocked: boolean; reason: string }> = {};

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const prev = i > 0 ? lessons[i - 1] : undefined;
    if (!prev) {
      unlockMap[lesson.id] = { unlocked: true, reason: 'Première leçon' };
      continue;
    }
    const prevProgress = progress[prev.id];
    const required = lesson.required_score ?? 0;
    const ok = !!prevProgress && prevProgress.status === 'completed' && (prevProgress.score ?? 0) >= required;
    unlockMap[lesson.id] = ok
      ? { unlocked: true, reason: 'Leçon précédente complétée' }
      : { unlocked: false, reason: 'Compléter la leçon précédente' };
  }

  return unlockMap;
}
```

### Lesson Player (`src/app/(app)/lecons/[...slug]/LessonPlayer.tsx`)
```typescript
'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
```

## Deployment Notes

- **Platform:** Vercel
- **Production URL:** https://<your-app>.vercel.app (placeholder - user to configure)
- **Build Settings:** ESLint and TypeScript errors ignored during builds
- **Environment Variables:** Required in Vercel dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Known Warnings / TODOs

### Deprecations
- ✅ **Resolved:** Migrated from `@supabase/auth-helpers-nextjs` to `@supabase/ssr`
- ✅ **Resolved:** Updated `middleware.disabled.ts` to use new Supabase SSR package

### ESLint Rules Relaxed for CI
- `@typescript-eslint/no-explicit-any`: Changed to "warn" (line-level suppressions added)
- `@typescript-eslint/no-unused-vars`: Allows `_` prefixed variables
- `@typescript-eslint/ban-ts-comment`: Disabled
- `@next/next/no-html-link-for-pages`: Disabled (internal links converted to Next.js Link)

### Build Configuration
- ESLint validation skipped during builds (`ignoreDuringBuilds: true`)
- TypeScript validation skipped during builds (`ignoreBuildErrors: true`)

## Next Steps (Short, Actionable)

- **Environment Setup:** Configure Supabase environment variables in Vercel dashboard
- **Lesson Content:** Implement Lesson 1 content and slide definitions
- **Progress Tracking:** Complete lesson progress API integration
- **Dashboard Features:** Implement lesson unlocking logic and progress visualization
- **Notes System:** Complete lesson notes functionality
- **Bookmarks:** Implement lesson bookmarking system
- **UI Polish:** Add Tailwind CSS styling throughout the application
- **Testing:** Add unit tests for lesson components and API routes
- **Performance:** Optimize lesson loading and caching strategies
