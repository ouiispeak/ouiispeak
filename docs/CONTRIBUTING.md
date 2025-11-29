Contributing to OuiiSpeak

Merci de contribuer à OuiiSpeak.
This document defines the development guidelines, coding standards, workflow expectations, and architectural rules for this project.

Before contributing, please read:

/docs/ARCHITECTURE.md (mandatory)

This file (CONTRIBUTING.md)

The goal is to keep the codebase clean, scalable, and aligned with OuiiSpeak’s long-term architecture.

1. Principles

OuiiSpeak follows four core engineering principles:

KISS — Keep implementations simple.

DRY — Avoid repetition; use shared utilities, hooks, and components.

YAGNI — Don’t build features or abstractions that aren’t needed yet.

Cohesion over cleverness — Prefer readable, predictable code.

Every contribution must follow these principles.

2. Repository Structure Overview

Relevant directories:

src/
  app/                Next.js App Router
  components/         Reusable components
  components/slides/  Slide types (lesson UI)
  components/lesson/  LessonShell, LessonPlayer, Sidebar, Editors
  lessons/            Lesson content (code-based)
  lib/                Utils, Supabase helpers
docs/
  ARCHITECTURE.md     Architecture specification


All contributors must be familiar with the architecture described in /docs/ARCHITECTURE.md.

3. Git Workflow

Create a new feature branch from the latest main (or primary dev branch):

git checkout -b feature/<name>


Commit small, isolated changes:

git commit -m "refactor: extract audio sequence hook"


Ensure your branch builds cleanly:

npm run build


Submit a pull request with:

Clear summary of the change

Why this change is necessary

Any follow-up steps (if applicable)

All PRs must pass:

TypeScript checks (once enabled)

ESLint (once strict mode is enabled)

Tests (once test suite exists)

4. Code Style
4.1 TypeScript

Avoid any.

Avoid @ts-ignore unless accompanied by a comment explaining why it is required.

Export types whenever it improves clarity (e.g., Slide, LessonMeta).

4.2 Components

Use function components, never class components.

Keep component files short; split large files into:

UI/presentational components

Logic hooks

Utilities

Prefer composition over inheritance.

4.3 Hooks

Hooks should be used for:

Audio management (useMediaRecorder, useAudioSequence)

Navigation logic (useLessonNavigation)

API fetching

Shared state management

Hooks must not contain JSX.

5. Lesson System Rules
5.1 Adding a Lesson

Until the registry is automated:

Create lesson file under src/lessons/<LEVEL>/moduleX/

Export:

export const lessonSlug = "a0-module-1/lesson-1";
export const slides = [...]


Add the lesson to src/lessons/registry.ts.

Follow naming conventions from existing lessons.

5.2 Slide Types

Slide components must remain thin.

All audio, recording, playback, or assessment logic must be implemented in shared hooks.

Slide components must not create MediaRecorders or AudioContexts directly.

5.3 No Hard-Coded UI Text in Lessons

All text content should be kept as part of the lesson data—never inside the slide components.

6. API Rules
6.1 Auth & Error Handling

All API routes must use the standard helpers:

withAuth(handler) (once implemented)

handleApiError(error) (once implemented)

No duplicated auth logic.

6.2 Supabase

Use typed clients where possible.

Prefer combined queries over multiple sequential ones.

Do not expose raw Supabase errors to the client.

7. Audio & Recording Rules

For audio-heavy slides:

Use shared audio hooks.

Do not rewrite or duplicate audio logic.

Keep UI and audio state separated.

Avoid inline audio state machines inside components.

8. Performance and Scaling Requirements
Do:

Use dynamic imports for large slide components.

Use SWR/React Query for caching fetches.

Use server components where possible.

Add memoization where needed.

Do not:

Load all slide logic eagerly.

Add new blocking API routes without caching.

Duplicate lesson content.

9. Testing

Minimum required tests (once test suite is in place):

Unit tests for slug parsing

Unit tests for unlock logic

Integration test for lesson-progress API

Smoke test for LessonPlayer rendering the first slide

All PRs involving lesson logic must include tests.

10. i18n Rules (Future)

When multi-language support is introduced:

All UI strings must be moved to translation files.

Lessons must support multiple language variants.

Routes must accept a language dimension.

No component should contain hard-coded French text at that point.

11. Do / Do Not Summary
Do

Follow the architecture defined in docs/ARCHITECTURE.md

Keep files small and cohesive

Use hooks for all complex logic

Follow DRY and KISS

Write clean, typed code

Update documentation if architecture changes

Do Not

Add new lessons outside the proper structure

Add new slide types without updating the registry and types

Put audio logic inside slide components

Hardcode French strings

Add sequential Supabase queries without batching

Introduce new architectural patterns without discussion

12. Final Notes

OuiiSpeak’s architecture is designed to scale to:

1000+ lessons

1000+ concurrent users

Multiple languages

To maintain consistency and reliability:

Follow this document strictly

Update documentation when making architectural changes

Keep all logic readable and maintainable

This repository will only stay stable over time if all contributors follow the guidelines above.

Where to put this file (step by step)

Here are the exact steps:

In Cursor, open your OuiiSpeak project.

In the left sidebar, right-click the root folder (usually named ouiispeak).

Click New File.

Name it:

CONTRIBUTING.md


Paste the entire content above into it.

Save (Cmd+S).

Commit and push:

git add CONTRIBUTING.md
git commit -m "docs: add contributing guidelines"
git push origin <your-branch>