# OuiiSpeak Dev Guidelines

Goal: keep the code calm, predictable, and safe for neurodiverse learners and for future contributors.  
Principles: **DRY**, **KISS**, **YAGNI**, **SOLID**.

These rules are not “nice to have.” They are the law of the repo.  
Cursor must follow them.

---

## 1. Responsibility layers (very important)

There are three layers involved in lesson pages:

### a. `page.tsx`
- Owns the PAGE FRAME.
- Sets the background color for the page, text color, outer padding.
- Centers the main card with max-width, border, rounded corners, shadow.
- DOES NOT implement lesson logic.

### b. `LessonShell.tsx`
- Owns LAYOUT INSIDE THE CARD.
- Splits the card into:
  - main lesson content area (left / first)
  - sidebar tools (right on desktop, stacked on mobile)
- Controls where Notes / Signet / Aide / Redémarrer / Quitter live.
- DOES NOT know how slides work or what “next slide” means.

### c. `LessonPlayer.tsx`
- Owns INTERACTION / LOGIC ONLY.
- Knows about slides, prev/next, progress %, last slide, etc.
- Knows about notes and bookmarks state.
- Renders the current slide content, input field, validation.
- It may render buttons for “Précédent / Suivant”, but it MUST NOT:
  - set full-page layout,
  - force 100vw / 100vh,
  - own background color for the whole screen,
  - decide where the sidebar sits.

**If layout logic creeps into `LessonPlayer`, remove it and put it in `LessonShell` / `page.tsx`.  
If slide/lesson logic creeps into `LessonShell`, remove it and put it in `LessonPlayer`.**

This is SOLID: single responsibility.

---

## 2. One source of truth, no duplicates

- There must only be one component in charge of a thing.
  - Example: Do NOT keep two different “lesson containers” (e.g. old full-screen player layout + new card layout).
  - When you replace something, delete the old version in the same branch before merging.
- We do **not** keep “old” code around “just in case.” That creates confusion later.

This is DRY.

---

## 3. Naming rules

Names must tell the truth.

- `LessonPlayer` = handles slides, next/prev logic, notes/bookmarks logic.
- `LessonShell` = arranges main content + sidebar inside the card.
- `page.tsx` = wraps everything in the app’s global visual frame (background, centered card).

If a file starts doing more than its name says, either:
- move that responsibility to the right file, or
- rename the file so it’s honest.

No mystery components like `LessonView2.tsx`, `NewShell.tsx`, etc.  
If Cursor proposes that, reject it.

This supports KISS.

---

## 4. Visual language (design tokens)

Visual styling should be centralized in theme configuration files, not scattered across components.

Do not invent new colors or shadows unless we explicitly decide.

This is YAGNI. We don't grow a design system until we actually need to.

---

## 5. Cursor instructions template

When asking Cursor to modify UI or logic, ALWAYS start your prompt with something like:

> You are allowed to edit ONLY these files:
> - src/app/(app)/lecons/[...slug]/page.tsx
> - src/app/(app)/lecons/[...slug]/LessonShell.tsx
> - src/components/lesson/LessonPlayer.tsx
>
> Do NOT create new files unless I explicitly say so.
> Do NOT duplicate layout logic that already lives in another file.
> Follow /DEV_GUIDELINES.md.
>
> Remember:
> - page.tsx = page frame + centered card
> - LessonShell = layout inside card (main + sidebar)
> - LessonPlayer = slide logic, prev/next, notes, bookmark

This prevents Cursor from inventing “almost the same” components that cause spaghetti.

---

## 6. Branch + preview workflow

- All UI work happens in a feature branch (example: `feat/ui-polish-oct24`).
- Push to GitHub.
- Vercel builds a Preview URL for that branch.
- You visually QA in that preview.
- Only when it looks correct do we merge to `main`.

This is how we keep main clean and predictable.

---

## 7. Cleanup rule

Before merging a branch:
- Delete any code that is now unused or superseded.
- Remove inline styles that fight Tailwind.
- Remove placeholder components we’re no longer using.

If we don't do this cleanup, spaghetti sneaks back in.

---

## 8. TypeScript

The TypeScript compiler (`npx tsc --noEmit` or `npm run check:types`) is the source of truth for type errors.

If your IDE shows red squiggles for standard methods (`map`, `includes`, `startsWith`, etc.) but `check:types` passes, try restarting the TS server (VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server").

---

## TL;DR

- One job per file.
- No duplicate versions of the same idea.
- Keep visual system consistent.
- Put rules in the repo so humans and AI both follow them.

This is how we protect Future Us when we have 500 lessons and actual paying learners depending on stability.
