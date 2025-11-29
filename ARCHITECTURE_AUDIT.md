# OuiiSpeak Architecture & Code Quality Audit

**Date:** 2024-11-29  
**Scope:** Read-only analysis of Next.js + TypeScript + Supabase codebase  
**Focus Areas:** Architecture, KISS/DRY/YAGNI, Scalability, Technical Debt

---

## 1. Architecture Overview

### Routing Organization
- **Next.js App Router** with route groups: `(app)` for authenticated routes, `(public)` for public pages
- **Dual lesson routing patterns:**
  - `[...slug]` catch-all route (`/lecons/[...slug]/page.tsx`) - flexible but less type-safe
  - `[module]/[lesson]` structured route (`/lecons/[module]/[lesson]/page.tsx`) - more structured
  - Both routes call the same `LessonShell` component, creating potential confusion
- **API routes** in `src/app/api/` for TTS, pronunciation assessment, lesson notes/bookmarks/progress
- **Auth callback** route handles Supabase OAuth redirects

### Business Logic vs UI Logic Separation
- **Good separation:** Custom hooks (`useLessonNotes`, `useLessonBookmarks`) encapsulate data fetching logic
- **Mixed concerns:** `LessonShell` (177 lines) manages both UI state (sidebar, editor panels) and lesson navigation logic
- **API routes** contain business logic (pronunciation scoring, TTS generation) - appropriate for Next.js
- **Slide components** contain significant business logic (audio playback, state management, pause/resume) - could be extracted

### Lesson Content Storage & Addressing
- **File-based registry:** Each lesson is a TypeScript file exporting `lessonSlug` and `slides: Slide[]`
- **Manual registration:** `src/lessons/registry.ts` manually imports every lesson file (currently ~25 lessons)
- **Slug format:** `{level}-module-{number}/lesson-{number}` (e.g., `a0-module-1/lesson-1`)
- **Type-safe slides:** Union type `Slide` with discriminated union by `type` field
- **Slide registry:** Component registry maps slide types to React components (`SlideRegistry`)

### Supabase Usage
- **Server-side client:** `createServerSupabase()` uses `@supabase/ssr` for RSC/SSR
- **Client-side hooks:** Custom hooks fetch via API routes (not direct Supabase client)
- **Tables referenced:** `lesson_notes`, `lesson_bookmarks`, `user_lessons`, `modules`, `lessons`
- **Auth:** Supabase Auth with server-side user checks, redirects to `/auth` if unauthenticated
- **Progress tracking:** `user_lessons` table tracks status, score, current_step per user/lesson

### Early Signs of Tight Coupling
1. **LessonShell** orchestrates sidebar, editor panels, navigation, and slide rendering - too many responsibilities
2. **Slide components** directly import and use `OpenSourcePronunciation`, `fetchSpeechAsset` - tight coupling to audio system
3. **Registry pattern** requires manual imports - adding lessons requires code changes, not just data
4. **Hardcoded level order:** `moduleOrder = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']` in `lecons/page.tsx` - not configurable

---

## 2. KISS, DRY, YAGNI, Spaghetti-Risk

### 2.1 KISS (Keep It Simple, Stupid)

#### Finding 1: Complex slug parsing logic
- **File:** `src/app/(app)/lecons/page.tsx:40-64`
- **Why not KISS:** `parseLessonSlug` uses regex matching, multiple string transformations, and nested conditionals to extract level/module/lesson from slug strings
- **Suggestions:**
  - Extract slug parsing to a shared utility function
  - Consider using a URL parsing library or structured slug format validation
  - Add unit tests for edge cases

#### Finding 2: Sidebar state management complexity
- **File:** `src/app/(app)/lecons/[...slug]/LessonShell.tsx:73-89`
- **Why not KISS:** `handleSidebarStateChange` has nested conditionals and state synchronization logic for remembering "last visible state" when hiding sidebar
- **Suggestions:**
  - Extract sidebar state logic to a custom hook (`useSidebarState`)
  - Simplify state transitions with a state machine or reducer pattern

#### Finding 3: Audio playback state management
- **File:** `src/components/slides/AISpeakRepeatSlide.tsx:72-100`
- **Why not KISS:** Multiple refs (`audioCache`, `activeSequenceRef`, `currentAudioRef`, `nextIndexRef`) and state variables (`currentIndex`, `playedIndices`, `isPlaying`, `sequenceState`) manage audio playback with complex synchronization
- **Suggestions:**
  - Extract audio playback logic to a custom hook (`useAudioSequence`)
  - Use a reducer pattern for sequence state management

#### Finding 4: Pronunciation assessment letter matching
- **File:** `src/app/api/pronunciation-assessment/route.ts:38-85`
- **Why not KISS:** Hardcoded `LETTER_TRANSCRIPTIONS` map (66 lines) with manual matching logic for single-letter pronunciation assessment
- **Suggestions:**
  - Move transcription map to a config file or database
  - Consider using a phonetic matching library instead of manual word matching

#### Finding 5: Deep nesting in lesson index page
- **File:** `src/app/(app)/lecons/page.tsx:115-153`
- **Why not KISS:** Nested `map` functions, inline sorting logic, and conditional rendering create 3+ levels of nesting
- **Suggestions:**
  - Extract level rendering to a separate component (`LevelContainer`)
  - Extract module sorting to a utility function
  - Use early returns to reduce nesting

#### Finding 6: Complex pause/resume state restoration
- **File:** `src/components/slides/AISpeakStudentRepeatSlide.tsx` (multiple locations)
- **Why not KISS:** `pauseStateRef` stores complex state objects, and pause/resume logic manually restores multiple state variables
- **Suggestions:**
  - Use a state machine library (e.g., XState) or reducer pattern
  - Extract pause/resume logic to a shared hook

#### Finding 7: MediaRecorder cleanup complexity
- **File:** `src/components/lesson/OpenSourcePronunciation.tsx:62-394`
- **Why not KISS:** Multiple refs track MediaRecorder, stream, audio context, analyser, silence timers, and cleanup logic is spread across multiple `useEffect` hooks
- **Suggestions:**
  - Extract MediaRecorder management to a custom hook (`useMediaRecorder`)
  - Consolidate cleanup logic into a single cleanup function

#### Finding 8: Slide component prop drilling
- **File:** `src/components/lesson/LessonPlayer.tsx:19-30`
- **Why not KISS:** Conditional prop spreading (`onRestart` only for `lesson-end` slides) creates type casting and prop manipulation
- **Suggestions:**
  - Use a context provider for shared lesson state (restart, navigation)
  - Or make `onRestart` a standard prop for all slides (no-op for others)

#### Finding 9: Element status color logic
- **File:** `src/components/slides/AISpeakStudentRepeatSlide.tsx:74-120`
- **Why not KISS:** `getElementStyles` function has multiple conditional branches returning objects with color strings
- **Suggestions:**
  - Extract to a shared utility function or constant map
  - Use CSS variables or Tailwind theme for consistent colors

#### Finding 10: Lesson grouping and sorting logic
- **File:** `src/app/(app)/lecons/page.tsx:66-105`
- **Why not KISS:** Inline `forEach` loops build nested objects, then separate loops sort lessons - could be combined
- **Suggestions:**
  - Extract to a utility function `groupLessonsByLevelAndModule(lessons: LessonInfo[])`
  - Use `reduce` to build and sort in one pass

### 2.2 DRY (Don't Repeat Yourself)

#### Pattern 1: Repeated Supabase auth checks
- **Files:** `src/app/api/lesson-notes/route.ts:5-7`, `src/app/api/lesson-bookmarks/route.ts:5-7`, `src/app/api/lesson-progress/route.ts` (similar pattern)
- **What's duplicated:** Every API route repeats the same pattern: `createServerSupabase()`, `getUser()`, check `!user`, return 401
- **Suggestion:** Create a middleware function `withAuth(handler)` or a higher-order function wrapper

#### Pattern 2: Repeated lesson slug parsing
- **Files:** `src/app/(app)/lecons/page.tsx:40-64`, `src/app/(app)/lecons/[module]/[lesson]/page.tsx:22`
- **What's duplicated:** Both pages parse lesson slugs from URL segments, though with different approaches
- **Suggestion:** Extract to `parseLessonSlug(slug: string): LessonSlugParts` utility

#### Pattern 3: Repeated API error handling
- **Files:** All API routes (`src/app/api/*/route.ts`)
- **What's duplicated:** Similar error handling patterns: `if (error) return NextResponse.json({ error: error.message }, { status: 500 })`
- **Suggestion:** Create `handleSupabaseError(error)` utility or use a try-catch wrapper

#### Pattern 4: Repeated slide component structure
- **Files:** `src/components/slides/AISpeakRepeatSlide.tsx`, `src/components/slides/AISpeakStudentRepeatSlide.tsx`, `src/components/slides/SpeechMatchSlide.tsx`
- **What's duplicated:** All three slides have similar audio playback logic, pause/resume, state management patterns
- **Suggestion:** Extract shared audio sequence logic to `useAudioSequence` hook, shared pause/resume to `usePausableSequence` hook

#### Pattern 5: Repeated icon component definitions
- **Files:** Multiple slide components define inline SVG icon components (PlayIcon, PauseIcon, AudioIcon, etc.)
- **What's duplicated:** Same icon SVGs defined in multiple files with slight variations
- **Suggestion:** Create a shared `src/components/icons/` directory with reusable icon components

#### Pattern 6: Repeated "humanize slug" logic
- **Files:** `src/app/(app)/lecons/page.tsx:28-38`
- **What's duplicated:** Slug-to-display-name conversion logic appears only once but could be reused elsewhere
- **Suggestion:** Extract to `src/lib/slugUtils.ts` as `humanizeSlug(slug: string): string`

### 2.3 YAGNI (You Aren't Gonna Need It)

#### Finding 1: Unused `SlideLayout` type
- **File:** `src/lessons/types.ts:46`
- **Why unused:** `SlideLayout = 'vertical' | 'horizontal' | 'wrap' | 'grid'` is defined but the layout prop was removed from `AISpeakStudentRepeatSlideProps` in favor of matching `AISpeakRepeatSlide` layout
- **Recommendation:** Remove `SlideLayout` type and any remaining references, or document why it's kept for future use

#### Finding 2: Unused `StudentRecordAccuracySlide` component
- **File:** `src/components/slides/StudentRecordAccuracySlide.tsx`
- **Why unused:** Component exists and is registered, but no lessons in the registry use `student-record-accuracy` slide type
- **Recommendation:** Remove if not planned, or add a comment explaining its purpose and when it will be used

#### Finding 3: Unused `lessonQueries.ts` functions
- **File:** `src/lib/lessonQueries.ts:27-79`
- **Why unused:** `fetchModuleAndLessons` and `fetchUserLessonProgress` are defined but only used in `tableau-de-bord/page.tsx`, which currently hides all content
- **Recommendation:** Keep for now (dashboard will likely use them), but add a TODO comment

#### Finding 4: Unused `computeUnlocks` function
- **File:** `src/lib/lessonQueries.ts:59-79`
- **Why unused:** Function computes lesson unlock logic but is never called in the codebase
- **Recommendation:** Remove if not needed, or document where it will be used

#### Finding 5: Unused `slide template ref` lesson
- **File:** `src/lessons/slide template ref/slide template ref lesson 1.ts`
- **Why unused:** Registered in registry but appears to be a reference/template file
- **Recommendation:** Move to a `docs/` or `examples/` directory, or remove from registry if not needed

#### Finding 6: Unused environment variable fallbacks
- **File:** `src/app/api/pronunciation-assessment/route.ts:7-25`
- **Why over-engineered:** `resolveWhisperBaseUrl()` checks multiple env var names and has dev/prod branching logic that may be unnecessary
- **Recommendation:** Simplify to single env var, document required configuration

#### Finding 7: Unused `buttonOnly` prop
- **File:** `src/components/lesson/OpenSourcePronunciation.tsx:8`
- **Why unused:** `buttonOnly` prop is defined but never used in the component logic
- **Recommendation:** Remove if not needed, or implement the feature

### 2.4 Spaghetti-Risk

#### Risk 1: `AISpeakStudentRepeatSlide.tsx` (736 lines)
- **File:** `src/components/slides/AISpeakStudentRepeatSlide.tsx`
- **Why spaghetti-prone:** Combines audio playback, recording, pronunciation assessment, pause/resume, skip logic, element status management, and UI rendering in one massive component
- **Untangle suggestion:** 
  - Extract `usePronunciationAssessment` hook
  - Extract `useElementStatus` hook for status management
  - Split into `AISpeakStudentRepeatSlide` (orchestrator) + `ElementChip` (presentation) components
  - Move pause/resume to shared `usePausableSequence` hook

#### Risk 2: `OpenSourcePronunciation.tsx` (543 lines)
- **File:** `src/components/lesson/OpenSourcePronunciation.tsx`
- **Why spaghetti-prone:** Manages MediaRecorder lifecycle, Web Audio API, silence detection, auto-stop, audio visualization, error handling, and UI state - too many concerns
- **Untangle suggestion:**
  - Extract `useMediaRecorder` hook for recording logic
  - Extract `useSilenceDetection` hook for auto-stop logic
  - Extract `useAudioVisualization` hook for level monitoring
  - Keep component as thin orchestrator

#### Risk 3: `AISpeakRepeatSlide.tsx` (514 lines)
- **File:** `src/components/slides/AISpeakRepeatSlide.tsx`
- **Why spaghetti-prone:** Audio sequence management, caching, play/pause/resume, keyboard shortcuts, and UI rendering intertwined
- **Untangle suggestion:**
  - Extract `useAudioSequence` hook for playback logic
  - Extract `useKeyboardShortcuts` hook
  - Simplify component to presentation layer

#### Risk 4: Lesson registry manual imports
- **File:** `src/lessons/registry.ts`
- **Why spaghetti-prone:** Every new lesson requires a code change (import + registration). At 1,000 lessons, this file becomes unmaintainable
- **Untangle suggestion:**
  - Use dynamic imports with `import()` and a lesson manifest file
  - Or move to database-driven lesson loading with code generation
  - Or use a build-time script to auto-generate registry

#### Risk 5: Dual routing patterns for lessons
- **Files:** `src/app/(app)/lecons/[...slug]/page.tsx` and `src/app/(app)/lecons/[module]/[lesson]/page.tsx`
- **Why spaghetti-prone:** Two different routes serve the same purpose, creating confusion about which to use and potential URL inconsistency
- **Untangle suggestion:**
  - Choose one pattern (prefer `[module]/[lesson]` for type safety)
  - Redirect `[...slug]` to structured route, or vice versa
  - Document the canonical URL pattern

---

## 3. Scalability Thought Experiment

### Scenario A: 1,000 Lessons Added

#### Data Model & Queries
- **Risk:** `registeredLessonSlugs` array in `registry.ts` will contain 1,000+ strings, all loaded into memory on every server request
- **Risk:** Manual imports in `registry.ts` will create a massive file (~1,000+ import statements)
- **Risk:** `getSlidesForLesson()` uses in-memory lookup - acceptable, but bundle size grows with all lesson data
- **Risk:** No pagination or lazy loading - all lessons loaded upfront
- **Mitigation needed:** Dynamic imports, code splitting, or database-driven lesson loading

#### Lesson Content System (`src/lessons`)
- **Pain point:** File-based structure (`A0/module1/lesson1.ts`) is fine for organization, but manual registry is the bottleneck
- **Pain point:** Each lesson file exports full slide array - at 1,000 lessons × ~20 slides avg = 20,000 slide objects in memory
- **Pain point:** No versioning or content management system - changes require code deploys
- **Mitigation needed:** 
  - Auto-generate registry from file system scan
  - Consider moving lesson content to database or CMS
  - Implement lazy loading per lesson

#### Routing & URL Structure
- **Current:** Works fine - URLs are predictable (`/lecons/a0-module-1/lesson-1`)
- **Risk:** `lecons/page.tsx` groups all lessons client-side - with 1,000 lessons, initial page load will be slow
- **Mitigation needed:** Server-side pagination, virtual scrolling, or search/filter UI

#### Frontend Performance
- **Risk:** `LessonPlayer` loads all slides upfront - large lessons (50+ slides) may cause slow initial render
- **Risk:** Audio caching in slide components stores all audio assets in memory - memory usage grows with lesson count
- **Mitigation needed:** 
  - Lazy load slides on-demand
  - Implement audio asset cleanup/unloading
  - Use React Suspense for code splitting

### Scenario B: 1,000 Active Users Same Day

#### Data Model & Queries
- **Risk:** API routes (`/api/lesson-notes`, `/api/lesson-bookmarks`) query Supabase without pagination - could return large datasets per user
- **Risk:** `fetchUserLessonProgress` uses `.in(lesson_id, lessonIds)` - with 1,000 lessons, this could be a large IN clause
- **Risk:** No caching strategy - every page load hits Supabase for user progress
- **Mitigation needed:**
  - Add pagination to API routes
  - Implement Redis caching for user progress
  - Use Supabase RLS policies effectively
  - Consider read replicas for scaling

#### Frontend Performance
- **Risk:** Client-side hooks (`useLessonNotes`, `useLessonBookmarks`) fetch on every component mount - no caching
- **Risk:** No request deduplication - multiple components fetching same data simultaneously
- **Mitigation needed:**
  - Add React Query or SWR for client-side caching
  - Implement request deduplication
  - Use stale-while-revalidate pattern

#### API Route Performance
- **Risk:** `/api/pronunciation-assessment` calls external Whisper service - no rate limiting or queue management
- **Risk:** `/api/tts` calls ElevenLabs API - external dependency could become bottleneck
- **Mitigation needed:**
  - Add rate limiting per user
  - Implement request queuing for TTS/Whisper
  - Add caching for frequently requested TTS (same text)
  - Consider CDN for static audio assets

### Scenario C: Multiple Languages (French + Another)

#### Data Model & Queries
- **Current:** Hardcoded French strings throughout UI (`"Leçons"`, `"Écouter"`, etc.)
- **Risk:** No i18n system - adding a second language requires finding/replacing all strings
- **Risk:** Lesson content is hardcoded in TypeScript files - no language variants
- **Mitigation needed:**
  - Implement i18n library (next-intl, react-i18next)
  - Move UI strings to translation files
  - Design lesson content structure to support multiple languages

#### Lesson Content System
- **Pain point:** Lesson slides contain hardcoded French text - no language abstraction
- **Pain point:** `SupportedLang` type only has `'fr' | 'en'` - TTS language, not UI language
- **Mitigation needed:**
  - Add `language` field to lesson metadata
  - Support language-specific lesson variants
  - Or design lessons to be language-agnostic with separate content files

#### Routing & URL Structure
- **Current:** URLs don't include language (`/lecons/a0-module-1/lesson-1`)
- **Mitigation needed:**
  - Add language prefix: `/fr/lecons/...` or `/en/lecons/...`
  - Or use subdomain: `fr.ouiispeak.com`
  - Update routing to handle language parameter

#### Frontend Performance
- **Risk:** No code splitting by language - all language strings loaded upfront
- **Mitigation needed:**
  - Lazy load translation files per language
  - Use dynamic imports for language-specific content

---

## 4. Future-Proofing & Technical Debt

### Top 10 Technical Debt Items

#### 1. Build Configuration Ignores TypeScript Errors
- **File:** `next.config.ts:7-10`
- **Risk:** `ignoreBuildErrors: true` and `ignoreDuringBuilds: true` allow broken code to deploy to production
- **Impact:** High - Production bugs, runtime errors, poor developer experience
- **Effort:** Low - Fix existing type errors, remove ignore flags
- **Priority:** Do first

#### 2. No Tests (Unit, Integration, E2E)
- **Files:** No test files found in codebase
- **Risk:** No safety net for refactoring, regression bugs, no confidence in changes
- **Impact:** High - Especially risky for pronunciation assessment, audio playback, lesson navigation
- **Effort:** Medium - Set up Jest/Vitest, write critical path tests
- **Priority:** Do first

#### 3. Manual Lesson Registry
- **File:** `src/lessons/registry.ts`
- **Risk:** Doesn't scale beyond ~100 lessons, requires code changes for every new lesson
- **Impact:** High - Becomes unmaintainable at scale
- **Effort:** Medium - Build script to auto-generate registry from file system
- **Priority:** Do later (before scaling)

#### 4. Type Safety Issues (`any` types, `eslint-disable`)
- **Files:** Multiple files use `any`, `@ts-ignore`, `eslint-disable` (25+ instances found)
- **Risk:** Runtime errors, lost type safety benefits, harder refactoring
- **Impact:** Medium - Reduces confidence in code changes
- **Effort:** Medium - Gradually replace `any` with proper types, fix underlying issues
- **Priority:** Do later

#### 5. No CI/CD Pipeline
- **Files:** No `.github/workflows/` or CI config found
- **Risk:** No automated testing, linting, or deployment checks
- **Impact:** Medium - Manual deployment process, no automated quality gates
- **Effort:** Low - Set up GitHub Actions for lint/test/build
- **Priority:** Do first

#### 6. Hardcoded Level Order
- **File:** `src/app/(app)/lecons/page.tsx:16`
- **Risk:** Adding new levels (e.g., A3, D1) requires code changes, not config
- **Impact:** Low - But indicates tight coupling to business logic
- **Effort:** Low - Move to config file or database
- **Priority:** Only when scaling

#### 7. No Error Boundaries
- **Files:** No React Error Boundaries found
- **Risk:** One component error crashes entire lesson player
- **Impact:** Medium - Poor user experience on errors
- **Effort:** Low - Add ErrorBoundary component around LessonPlayer
- **Priority:** Do later

#### 8. Magic Strings for Slide Types
- **Files:** `src/components/slides/index.ts:9-17`, slide type strings throughout
- **Risk:** Typos cause runtime errors, no compile-time safety for slide type names
- **Impact:** Low - But could be improved with const enums
- **Effort:** Low - Use const enum or union type for slide types
- **Priority:** Only when scaling

#### 9. No Content Versioning
- **Files:** Lesson files in `src/lessons/`
- **Risk:** No way to track lesson content changes, rollback, or A/B test different versions
- **Impact:** Low - But important for content management
- **Effort:** High - Requires CMS or versioning system
- **Priority:** Only when scaling

#### 10. Tight Coupling: Slide Components to Audio System
- **Files:** Slide components directly import `fetchSpeechAsset`, `OpenSourcePronunciation`
- **Risk:** Changing audio system requires updating all slide components
- **Impact:** Medium - Reduces flexibility for future audio providers
- **Effort:** Medium - Introduce audio abstraction layer (AudioProvider context)
- **Priority:** Do later

---

## 5. Recommended Next Steps

### Do First (Critical)
1. **Remove build error ignores** - Fix TypeScript errors, enable strict type checking
2. **Add basic test suite** - Unit tests for pronunciation assessment, lesson registry, critical hooks
3. **Set up CI/CD** - GitHub Actions for lint/test/build on PRs
4. **Add Error Boundaries** - Prevent lesson player crashes from component errors

### Do Later (Before Scaling)
5. **Auto-generate lesson registry** - Build script to scan `src/lessons/` and generate registry
6. **Extract audio logic to hooks** - Refactor `OpenSourcePronunciation`, slide components to use shared hooks
7. **Add i18n foundation** - Set up translation system, extract hardcoded French strings
8. **Improve type safety** - Replace `any` types, remove `eslint-disable` comments
9. **Add API route middleware** - `withAuth` wrapper to reduce duplication

### Only When Scaling
10. **Database-driven lessons** - Move lesson content to database/CMS for easier management
11. **Implement caching** - Redis for user progress, CDN for audio assets
12. **Add pagination** - API routes and lesson list page
13. **Content versioning** - Track lesson changes, support A/B testing
14. **Multi-language support** - Full i18n implementation, language-specific lesson variants

---

## Appendix: File Size Analysis

**Largest files (potential refactoring candidates):**
- `AISpeakStudentRepeatSlide.tsx`: 736 lines
- `OpenSourcePronunciation.tsx`: 543 lines  
- `AISpeakRepeatSlide.tsx`: 514 lines
- `SpeechMatchSlide.tsx`: 437 lines
- `JournalNotesEditor.tsx`: 411 lines
- `A0Module1Lesson1.ts`: 409 lines (content file - acceptable)

**Recommendation:** Files over 300-400 lines should be considered for splitting, especially if they contain mixed concerns.

