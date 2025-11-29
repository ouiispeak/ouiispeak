OUIISPEAK ARCHITECTURE DOCUMENT

Version 1.0 — Updated 2024-11-29
Audience: Developers, contributors, and technical collaborators
Scope: Frontend architecture, lesson system, audio systems, routing, API layers, and long-term scaling strategy.

1. High-Level System Overview

OuiiSpeak is an English-learning platform built with:

Next.js App Router (React Server Components + client components)

TypeScript

TailwindCSS

Supabase (auth, DB)

Client-side audio via MediaRecorder + Web Audio API

AI integrations (Whisper, ElevenLabs, Azure) through internal API routes

The core user experience is the lesson player, which renders slide-based interactive lessons.

The system is currently code-driven: lesson content lives in TypeScript files, imported and registered manually.

This document describes how the system works internally, the intended long-term architecture, and rules for all future contributors.

2. Directory Structure (Important Folders)
src/
│
├── app/
│   ├── (public)/           Public pages (home, about, pricing, contact)
│   ├── (auth)/             Authentication
│   ├── (app)/              Authenticated app
│   │   ├── dashboard/      User dashboard
│   │   ├── lecons/         Lesson routes and lesson shell
│   │   ├── notebook/       Notes system
│   │   ├── activities/     Future expansion
│   │   └── account/        User settings
│   ├── api/                API routes (TTS, Whisper, notes, progress, etc.)
│
├── components/
│   ├── lesson/             LessonShell, LessonSidebar, LessonPlayer, editors
│   └── slides/             All slide types (AISpeak, SpeechMatch, etc.)
│
├── lessons/                Code-based lesson content files
│   ├── A0/
│   ├── A1/
│   └── registry.ts         Manual registry of lessons
│
└── lib/
    ├── supabase/           Server and client Supabase helpers
    ├── lessonQueries.ts    Dashboard queries, unlock logic
    └── utils/              Small shared utilities (future)

3. Routing Architecture

The lesson system currently exposes two parallel routes:

3.1 Canonical (Preferred) Route
/lecons/[module]/[lesson]


Example:

/lecons/a0-module-1/lesson-1

3.2 Legacy / Transitional Catch-All
/lecons/[...slug]


Both routes resolve to the same LessonShell.

Policy for Developers

The official lesson route is [module]/[lesson].

The catch-all [...slug] exists for backward compatibility only.

Future work may involve removing it or converting it to a redirect layer.

4. Lesson Architecture
4.1 Lesson File Format

Each lesson is a TypeScript module exporting:

lessonSlug: string

metadata?: {...}

slides: Slide[] (array of discriminated union slide objects)

Example:

export const lessonSlug = "a0-module-1/lesson-1";

export const slides: Slide[] = [
  { type: "title", title: "Welcome" },
  { type: "ai-speak-repeat", ... },
  ...
];

4.2 Slide Rendering

Slides are rendered via:

SlideRegistry[type] → Component


The registry is in:

src/components/slides/index.ts

4.3 Manual Lesson Registry (Current)

All lessons are imported and registered in:

src/lessons/registry.ts


Example entry:

import * as Lesson1 from "./A0/module1/A0Module1Lesson1";
registeredLessonSlugs.push(Lesson1.lessonSlug);
lessonMap[Lesson1.lessonSlug] = Lesson1;

4.4 Limitations

Manual registry does not scale beyond 250–300 lessons:

Registry file will become very large.

Build times increase.

Bundle size increases because all lessons are imported statically.

Adding a new lesson requires a code change.

4.5 Future-Ready Plan

A future phase will:

Auto-generate a manifest of lessons from the filesystem, or

Move toward DB-driven metadata, or

Adopt a hybrid system (filesystem for content, manifest for metadata).

5. Lesson Player Architecture

The lesson player pipeline is:

LessonRoute → LessonShell → LessonChrome → LessonSidebar + LessonPlayer

5.1 LessonShell Responsibility

Slide navigation state

Sidebar open/closed state

Editor toggles (notes, help)

Routing back to module landing

Restart confirmation flow

Note: LessonShell currently mixes multiple concerns. A future refactor should split navigation state into a useLessonNavigation hook.

5.2 LessonPlayer Responsibility

Receives slides array

Renders the correct slide via SlideRegistry

Provides shared callbacks (restart, next, previous)

5.3 Editors

Two major editors exist:

JournalNotesEditor (rich text, formatting, autosave)

RaichelHelpEditor (chat-style help UI, API orchestration)

Both contain significant logic and will be split into:

View components

Data hooks

Formatting utilities

6. Slide System Architecture

The slide system is the core feature of the platform.

6.1 Slide Types

Examples:

title

text

ai-speak-repeat

ai-speak-student-repeat

speech-match

image-display (future)

quiz (future)

Slide types are discriminated unions in src/lessons/types.ts.

6.2 Slide Component Responsibilities

Each slide component should ideally:

Accept props defined by its slide type

Render UI

Call shared hooks for audio/logic

Current issue:
Several slide components contain their own audio, recording, scoring, pause/resume, and keyboard logic.

7. Audio and Recording Architecture
7.1 Current State (Monolithic)

The following files contain heavy, tangled logic:

AISpeakStudentRepeatSlide.tsx (~700–1000 lines)

AISpeakRepeatSlide.tsx (~500 lines)

OpenSourcePronunciation.tsx (~500 lines)

These files currently bundle:

MediaRecorder setup/teardown

Web Audio API analyzers

Silence detection

Auto-stop rules

Audio asset caching

Sequencing logic

Play/Pause/Resume state machines

Pronunciation assessment calls

UI rendering

This creates high cognitive load and makes changes risky.

7.2 Planned Architecture (Modular Hooks)

The long-term plan is to extract the following hooks:

useMediaRecorder
useAudioSequence
usePausableSequence
usePronunciationAssessment
useElementStatus


Slides will then be thin view components that orchestrate these hooks.

8. API Layer Architecture

API routes live in:

src/app/api/


Includes:

TTS (/api/tts)

Whisper pronunciation (/api/pronunciation-assessment)

Notes (/api/lesson-notes)

Bookmarks (/api/lesson-bookmarks)

Progress (/api/lesson-progress)

8.1 Issues Identified

Repeated Supabase auth checks in each route

Repeated error-handling patterns

Sequential Supabase queries

No caching on TTS or Whisper calls

No rate limiting or deduplication

8.2 Future Design

Introduce:

A withAuth API wrapper

A shared handleApiError utility

Query batching and indexing for Supabase

Optional Redis caching for progress/notes

9. Supabase Usage

Supabase is used for:

Auth

Notes

Bookmarks

Progress

Dashboard metadata

Lesson content is not in Supabase.

9.1 Places to Improve

Add generated Supabase types instead of any

Move sequential lesson-progress lookups into a single joined query

Implement caching for notes and bookmarks (SWR or React Query)

10. Internationalization (i18n)

The app currently assumes:

UI language = French

Lesson content language = French

Slugs implicitly encode level → module → lesson (language not included)

10.1 Requirements for Multi-Language Support

Introduce a translation system

Move all hard-coded French strings into translation files

Update lesson metadata to include a language field

Adjust routing to include a lang prefix or param

Decide how to store bilingual lesson content

This is a major future phase.

11. Scaling Strategy
11.1 Scaling to 1000 Lessons

Current architecture bottlenecks:

Manual registry becomes unwieldy

Bundle size grows with every lesson

/lecons page grouping becomes slow client-side

No lazy loading of slides

Slides carry heavy audio logic

Mitigation:

Auto-generated registry

Manifest-based or DB-based lesson metadata

Pagination or server-side grouping

Slide-level code splitting

Modular audio hooks

11.2 Scaling to 1000 Concurrent Users

Concerns:

Whisper and ElevenLabs API calls lack rate limiting

Notes/progress/bookmarks fetch on every mount

Sequential DB queries

No SWR/React Query caching

Mitigation:

Add caching + deduping

Reduce external API calls via audio caching

Batch Supabase queries

Add rate limits

11.3 Scaling to Multiple Languages

Concerns:

All UI and lesson content in French

No structured i18n layer

No locale dimension in routing

Mitigation:

Introduce translation system

Add language dimension to lesson metadata

Plan dual-language lesson structure

12. Development Rules and Guidelines
12.1 General Rules

Do not add new lesson routes; use [module]/[lesson].

Do not add new slide types that contain audio logic inside the component. Use hooks.

Do not add manual imports to registry.ts once the registry is automated.

Do not hardcode French strings in components; use the translation layer (once implemented).

12.2 Adding a New Lesson

Create a new lesson file under src/lessons/LEVEL/moduleX/.

Export lessonSlug and slides.

Add it to registry.ts (temporary step until automation).

Ensure slug format matches: a0-module-1/lesson-1.

12.3 Adding a New Slide Type

Create a new type in lessons/types.ts.

Add it to SlideRegistry.

The slide component should:

Consume props only

Use shared hooks for logic

Avoid custom audio/recorder logic inside the file

12.4 Audio System Guidelines

Never create new MediaRecorder or Web Audio logic inside slide components.

Use the extracted shared hooks.

Keep audio assets and cache handling outside slide files.

13. Technical Debt Roadmap (Prioritized)
Phase 1 — Critical

Add CI pipeline (lint + build)

Create utilities for slug parsing and grouping

Add minimal test suite (slug parsing, unlock logic, progress)

Phase 2 — Structural

Extract audio hooks (useMediaRecorder, useAudioSequence)

Refactor AISpeakStudentRepeatSlide into hooks + view

Refactor JournalNotesEditor into editor + formatting + persistence hook

Phase 3 — Scaling

Auto-generate lesson registry

Add SWR/React Query caching for notes/bookmarks

Batch and optimize Supabase queries

Phase 4 — Internationalization

Introduce i18n system

Add language metadata to lessons

Update routing to handle languages

Phase 5 — Quality Gates

Re-enable TypeScript/ESLint enforcement

Remove any, ts-ignore, and legacy debug logs

14. Summary

This document defines:

The architecture of OuiiSpeak as it exists today

The rules and guidelines for developers

The future shape of the system

How to avoid regression, confusion, and unmaintainable growth

How to scale to 1000 lessons, 1000 users, and multiple languages

All contributors should follow this document, update it as architecture evolves, and treat it as the single source of truth for the internal structure of OuiiSpeak.