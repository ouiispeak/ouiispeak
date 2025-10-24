# OuiiSpeak Refactor Plan - DRY, KISS, YAGNI, SOLID

**Date**: 2025-10-23  
**Branch**: `refactor/dry-kiss-yagni-solid-20251023`  
**Baseline**: Build passes ✓, TypeScript compiles ✓

## Current Architecture Analysis

### File Structure & Responsibilities
```
src/
├── app/                          # Next.js App Router
│   ├── (app)/                    # Protected routes (requires auth)
│   │   ├── layout.tsx            # Auth guard + navigation
│   │   ├── tableau-de-bord/      # Dashboard with lesson progress
│   │   ├── lecons/               # Lesson system
│   │   │   ├── [...slug]/        # Dynamic lesson player
│   │   │   └── [module]/[lesson]/ # Specific lesson pages
│   │   ├── progression/          # User progress tracking
│   │   ├── carnet/              # User notes/journal
│   │   ├── activites/           # Activities/exercises
│   │   └── compte/              # User profile/account
│   ├── (public)/                 # Public routes (no auth required)
│   │   ├── layout.tsx           # Public navigation
│   │   ├── page.tsx             # Landing page
│   │   ├── auth/                # Authentication
│   │   ├── a-propos/            # About page
│   │   ├── abonnements/         # Subscriptions
│   │   ├── accueil/             # Home page
│   │   └── contact/             # Contact page
│   ├── api/                     # API routes
│   │   ├── lesson-bookmarks/    # Bookmark management
│   │   ├── lesson-notes/        # Note management
│   │   └── lesson-progress/     # Progress tracking
│   ├── auth/callback/           # Supabase auth callback
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Tailwind v4 setup
├── components/                   # React components
│   ├── AuthForm.tsx             # Login/signup form
│   ├── LogoutButton.tsx         # Logout functionality
│   ├── ProfileForm.tsx          # Profile management
│   ├── SupabasePing.tsx         # Connection status
│   └── lesson/                  # Lesson-specific components
│       ├── LessonPlayer.tsx     # Main lesson interface
│       ├── useLessonNotes.ts    # Notes hook
│       └── useLessonBookmarks.ts # Bookmarks hook
├── lib/                         # Utilities & configurations
│   ├── supabaseClient.ts        # Browser Supabase client
│   ├── supabaseServer.ts        # Server Supabase client
│   └── lessonQueries.ts         # Database queries
└── lessons/                     # Lesson definitions
    ├── types.ts                 # Type definitions
    ├── registry.ts              # Lesson registry
    ├── sampleLessons.ts         # Sample lesson data
    └── module-1/               # Module 1 lessons
        └── lesson-1.ts          # First lesson
```

## DRY Violations (Don't Repeat Yourself)

### 1. **Supabase Client Creation** - HIGH PRIORITY
- **Issue**: Duplicate Supabase client creation patterns
- **Locations**: 
  - `src/lib/supabaseClient.ts` (browser)
  - `src/lib/supabaseServer.ts` (server)
  - `src/app/auth/callback/route.ts` (inline creation)
  - `middleware.disabled.ts` (inline creation)
- **Solution**: Centralize client creation, eliminate inline patterns

### 2. **Auth State Management** - HIGH PRIORITY
- **Issue**: Repeated auth checks and redirects
- **Locations**:
  - `src/app/(app)/layout.tsx` (auth guard)
  - `src/app/(app)/tableau-de-bord/page.tsx` (duplicate auth check)
  - `src/app/(public)/auth/page.tsx` (redirect if authenticated)
  - `src/components/ProfileForm.tsx` (client-side auth check)
- **Solution**: Create `hooks/useAuthUser.ts` and `lib/auth.ts`

### 3. **API Error Handling** - MEDIUM PRIORITY
- **Issue**: Repeated error handling patterns in API routes
- **Locations**:
  - `src/app/api/lesson-bookmarks/route.ts`
  - `src/app/api/lesson-notes/route.ts`
  - `src/app/api/lesson-progress/route.ts`
- **Solution**: Create `lib/api-helpers.ts` with common patterns

### 4. **Form Input Patterns** - MEDIUM PRIORITY
- **Issue**: Repeated input styling and validation patterns
- **Locations**:
  - `src/components/AuthForm.tsx` (email/password inputs)
  - `src/components/ProfileForm.tsx` (form inputs)
  - `src/components/lesson/LessonPlayer.tsx` (text input)
- **Solution**: Create `components/ui/Input.tsx`, `components/ui/Button.tsx`

### 5. **Navigation Patterns** - LOW PRIORITY
- **Issue**: Repeated navigation styling
- **Locations**:
  - `src/app/(app)/layout.tsx` (app navigation)
  - `src/app/(public)/layout.tsx` (public navigation)
- **Solution**: Create `components/ui/Navigation.tsx`

## KISS Violations (Keep It Simple, Stupid)

### 1. **Complex Lesson Player** - HIGH PRIORITY
- **Issue**: `LessonPlayer.tsx` is 274 lines with multiple responsibilities
- **Responsibilities**: Slide navigation, input validation, progress tracking, notes, bookmarks
- **Solution**: Split into smaller components:
  - `LessonSlide.tsx` (individual slide rendering)
  - `LessonNavigation.tsx` (prev/next controls)
  - `LessonSidebar.tsx` (notes/bookmarks panel)

### 2. **Over-Abstracted Type Definitions** - MEDIUM PRIORITY
- **Issue**: Complex type hierarchies in `src/lessons/types.ts`
- **Solution**: Simplify types, remove unnecessary abstractions

### 3. **Inline Styles** - MEDIUM PRIORITY
- **Issue**: Extensive inline styles throughout components
- **Locations**: Most components use `style={{}}` instead of Tailwind classes
- **Solution**: Convert to Tailwind classes, create utility components

## YAGNI Violations (You Aren't Gonna Need It)

### 1. **Unused Lesson Layout** - MEDIUM RISK
- **Issue**: `src/app/(app)/lecons/[...slug]/layout.tsx` appears unused
- **Evidence**: Static navigation menu that doesn't integrate with `LessonPlayer`
- **Action**: Move to `/_legacy/2025-10-23/` with comment

### 2. **Duplicate Lesson Components** - LOW RISK
- **Issue**: Two `LessonPlayer.tsx` files:
  - `src/components/lesson/LessonPlayer.tsx` (274 lines)
  - `src/app/(app)/lecons/[...slug]/LessonPlayer.tsx` (29 lines)
- **Action**: Investigate usage, consolidate or remove unused

### 3. **Unused Sample Lessons** - LOW RISK
- **Issue**: `src/lessons/sampleLessons.ts` may be placeholder
- **Action**: Verify usage, remove if unused

### 4. **Disabled Middleware** - LOW RISK
- **Issue**: `middleware.disabled.ts` exists but is disabled
- **Action**: Remove if truly unused

## SOLID Violations

### 1. **Single Responsibility Principle (SRP)** - HIGH PRIORITY
- **Violations**:
  - `LessonPlayer.tsx`: Handles UI, validation, API calls, state management
  - `AuthForm.tsx`: Handles both signup and signin
  - `ProfileForm.tsx`: Handles fetching, updating, and UI
- **Solution**: Split into focused components

### 2. **Open/Closed Principle (OCP)** - MEDIUM PRIORITY
- **Issue**: Hard-coded lesson types and validation rules
- **Solution**: Create extensible lesson type system

### 3. **Dependency Inversion Principle (DIP)** - HIGH PRIORITY
- **Issue**: Components directly depend on Supabase clients
- **Solution**: Create abstraction layer in `lib/data/`

## Safety Considerations

### Auth & Security (NEVER BREAK)
- ✅ Supabase RLS policies must remain intact
- ✅ Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ Middleware session handling
- ✅ Server/client boundary separation

### API Contracts (NEVER BREAK)
- ✅ Route paths: `/api/lesson-*`
- ✅ Request/response shapes
- ✅ Database schema assumptions

## Refactor Strategy

### Phase 1: Safety Net (Commit 1)
1. Create `scripts/smoke.mjs` for basic health checks
2. Add `lib/env.ts` for environment validation
3. Create `hooks/useAuthUser.ts` for auth state

### Phase 2: DRY Implementation (Commit 2)
1. Centralize Supabase client creation
2. Extract common API patterns
3. Create reusable UI components
4. Consolidate auth logic

### Phase 3: KISS Simplification (Commit 3)
1. Split `LessonPlayer.tsx` into smaller components
2. Convert inline styles to Tailwind
3. Simplify type definitions
4. Remove unnecessary abstractions

### Phase 4: YAGNI Cleanup (Commit 4)
1. Move unused files to `/_legacy/2025-10-23/`
2. Remove duplicate components
3. Clean up placeholder code

### Phase 5: SOLID Principles (Commit 5)
1. Implement dependency injection for data layer
2. Create focused, single-responsibility components
3. Establish clear interfaces

### Phase 6: Final Polish (Commit 6)
1. Lint and format all files
2. Update documentation
3. Final build verification

## Risk Assessment

| Change | Risk Level | Mitigation |
|--------|------------|------------|
| Auth refactoring | HIGH | Extensive testing, preserve all auth flows |
| Supabase client changes | MEDIUM | Maintain exact same API surface |
| Component splitting | LOW | Preserve all props and behavior |
| File moves | LOW | Use `/_legacy/` folder, add comments |

## Success Criteria

- ✅ Build passes (`npm run build`)
- ✅ TypeScript compiles with 0 errors
- ✅ Smoke tests pass
- ✅ All existing functionality preserved
- ✅ Auth flows unchanged
- ✅ API contracts maintained
- ✅ No hard deletes (only moves to legacy)
