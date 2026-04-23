# CLAUDE.md

This file provides guidance to Claude when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev           # Start dev server at localhost:3000 (Turbopack disabled)
npm run build         # Production build (static export to /out)
npm run start         # Run production server
npm run android       # Build static export and sync to Android via Capacitor
npm run android:release  # Release Android build
```

No test runner or linter is configured yet.

## Architecture

FitLog is a Next.js 16 (v16.2.4) app using the App Router, React 19, TypeScript, and Tailwind CSS v4. It is a **mobile-first workout tracker** wrapped with Capacitor for Android. Next.js is configured with `output: "export"` (static site generation) to support the Capacitor mobile WebView.

**Authentication** is handled by Supabase (email/password with email verification required). **Workout data** is stored in localStorage only — Supabase is not yet used for workout persistence.

### Key environment variables

```
NEXT_PUBLIC_SUPABASE_URL      # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Public anon key (safe in frontend)
```

See `.env.example` for the full template.

### Directory structure

```
app/
  layout.tsx              # Root layout — wraps everything in AuthGuard
  page.tsx                # Home/dashboard: streak, weekly count, today's status
  globals.css             # Dark theme, Google Fonts, 8 custom keyframe animations
  login/page.tsx          # Email + password login, handles "email not confirmed" error
  signup/page.tsx         # Signup with email verification flow
  forgot-password/page.tsx
  reset-password/page.tsx # Reads token from URL hash, sets new password
  log/page.tsx            # → WorkoutLogger component
  routine/page.tsx        # → WorkoutRoutine component
  history/page.tsx        # → WorkoutHistory component

components/
  AuthGuard.tsx           # Session check on mount; redirects unauthenticated to /login
  BottomNav.tsx           # Fixed bottom nav: Home / Train / History tabs
  WorkoutLogger.tsx       # Main logging UI (~720 lines) — see below
  WorkoutRoutine.tsx      # Routine viewer with 2-week progression analysis
  WorkoutHistory.tsx      # Calendar view + expandable log list + streak stats

lib/
  storage.ts              # All data types + localStorage CRUD (browser-only)
  routineData.ts          # 4 predefined routines + exercise catalog
  supabase.ts             # Browser-side Supabase client (used for auth)
  supabase-server.ts      # Server-side Supabase client with cookie handling (unused — no API routes yet)

capacitor.config.ts       # App ID: com.fitlog.app, webDir: out, scheme: HTTPS
android/                  # Capacitor Android project (build artifacts included)
```

### Data flow

1. `lib/routineData.ts` defines 4 standalone routine templates (Push, Pull, Legs, Full Body) — not tied to specific days. Each has exercises, weights, rep targets, color, and glow values.
2. `lib/storage.ts` owns all data types (`WorkoutLog`, `LoggedExercise`, `LoggedSet`) and CRUD helpers. `parseRepsToSets()` converts rep strings like `"12×3"` or `"12,10,10"` into individual set arrays. All functions guard against SSR with `typeof window` checks. Storage key: `"fitlog-workouts"`.
3. `WorkoutLogger` — routine picker (Push/Pull/Legs/Full/Empty) → per-set checklist rows (checkbox, reps, weight per set). Supports custom exercises via a grouped exercise catalog (Chest, Back, Shoulders, Arms, Legs, Core). Date navigation lets users log for any day. Saves to localStorage.
4. `WorkoutHistory` reads all logs from localStorage, sorts by date, renders a monthly calendar with highlighted days + an expandable list with per-set detail.
5. `WorkoutRoutine` displays routine cards and analyzes the last 14 days of logs to calculate progression targets per exercise (status: "ready", "building", or "reset").
6. `AuthGuard` checks the Supabase session on mount. Public paths: `/login`, `/signup`, `/forgot-password`, `/reset-password`. All others redirect to `/login` if unauthenticated.

### Key conventions

- **Path alias:** `@/*` maps to the repo root — use it for all internal imports.
- **Styling:** Dark theme (`#08080f` background, `#f0f0fa` text) using **inline React styles** throughout all components — not Tailwind utility classes. Tailwind is only used via `globals.css`. Do not add Tailwind classes to components.
- **Colors by workout type:** push = `#f97316`, pull = `#3b82f6`, legs = `#22c55e`, full = `#a855f7`.
- **Dates:** Always stored and passed as `"YYYY-MM-DD"` strings. Use `getTodayDateString()` from `lib/storage.ts`.
- **Workout ID:** Always `workout-${date}` — one log per calendar day.
- **Static export constraint:** Because `output: "export"` is set, API routes and server components with dynamic rendering will not work. `supabase-server.ts` exists but has no callers yet.

## Current state

**Implemented:** Full auth flow (signup, login, email verification, password reset), workout logging with custom exercises, 4 predefined routines, progression tracking, history calendar, streak tracking, Capacitor Android build.

**Not yet implemented:**
- Supabase persistence for workout logs (localStorage only — no cross-device sync)
- Claude API integration for post-set feedback
- MCP server (folder does not exist yet)
- Backend API routes (no `app/api/` routes exist)
- Test runner or linter
