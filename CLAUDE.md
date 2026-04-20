# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run start    # Run production server
```

No test runner or linter is configured yet.

## Architecture

FitLog is a Next.js 16 app (App Router) with TypeScript and Tailwind CSS v4. It's a client-heavy workout tracker — all persistence is **localStorage only** (`lib/storage.ts`, key: `fitlog-workouts`). The API route at `app/api/workouts/route.ts` uses an in-memory array and is not wired to the client; it's a placeholder for a future Prisma + PostgreSQL migration.

### Data flow

1. `lib/routineData.ts` defines the static 7-day weekly schedule (push/pull/legs/full/rest) with exercises, weights, and rep targets.
2. `lib/storage.ts` owns all data types (`WorkoutLog`, `LoggedExercise`, `LoggedSet`) and CRUD helpers. `parseRepsToSets()` converts rep strings like `"12×3"` or `"12,10,10"` into individual set arrays. All functions guard against SSR with `typeof window` checks.
3. `WorkoutLogger` loads today's routine from `routineData`, hydrates it with any saved log from localStorage, and lets the user toggle sets, edit reps/weight, and add custom exercises before saving.
4. `WorkoutHistory` reads all saved logs from localStorage, sorts by date, and renders a calendar + expandable list.
5. `WorkoutRoutine` is read-only — it renders the static weekly plan with 2-week progression targets (hardcoded inline).

### Key conventions

- **Path alias:** `@/*` maps to the repo root — use it for all internal imports.
- **Styling:** Dark theme using inline React styles throughout components, not Tailwind classes. Colors are semantic by day type: push = `#f97316`, pull = `#3b82f6`, legs = `#22c55e`, full = `#a855f7`.
- **Dates:** Always stored and passed as `"YYYY-MM-DD"` strings. Use `getTodayDateString()` from `lib/storage.ts`.
- **Workout ID:** Always `workout-${date}` — one log per calendar day.

## Planned work (from README)

- Prisma + PostgreSQL (Supabase) to replace localStorage
- Claude API integration for real-time feedback after each logged set
- MCP server in `/mcp-server`
