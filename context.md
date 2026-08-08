# AI Mock Interview Context

## Scope
- Default focus for this repo: the AI mock interview experience only.
- Prioritize bug fixing, reliability, session continuity, audio quality, pacing, and report quality.
- Touch payments, chatbot, or marketing pages only when they directly block interview behavior.

## Runtime facts
- Start locally with `npm run dev`.
- Do **not** use `next dev` directly; the app depends on the custom runtime in `server.ts`.
- Main candidate flow: `/interview/[token]` -> `/live-interview/[token]`.

## Core interview chain
- Data model: `InterviewTemplate` -> `CandidateApplication` -> `InterviewSession`.
- Tokens are single-use candidate links stored as `accessTokenHash`, never raw tokens.
- Templates should be treated as interview-ready only when `systemInstructions` exists.

## Files to inspect first
- `app/live-interview/[token]/interview-room.tsx` — client orchestration, mic setup/test, timers, sync, finalization.
- `lib/interview/web-rtc-transport.ts` — OpenAI Realtime WebRTC transport, response guards, interruption logic, timing signals.
- `app/api/interviews/webrtc/start/route.ts` — token validation, session creation/resume, blueprint generation, client secret creation.
- `lib/interview/webrtc-session.ts` — instruction building, blueprint shaping, voice resolution, final report persistence.
- `app/api/interviews/webrtc/sessions/[sessionId]/finalize/route.ts` — completion handoff.
- `server.ts` — custom runtime and older/parallel interview orchestration context.

## Current bug / optimization hotspots
1. Mic lifecycle: permission flow, dead tracks, reconnection, silent-input detection.
2. Session resume rules: avoid duplicate starts, repeat questions, or bad reconnect states.
3. Timing/pacing: prevent early closing, preserve section pacing, respect hard-stop behavior.
4. Transcript + reference-card sync: keep visual cards aligned with spoken questions.
5. Finalization path: ensure report, PDF/email side effects, and session status stay consistent.

## Session start checklist
1. Read `context.md`.
2. Read `recent changes/latest.md`.
3. Read `recent changes/open-issues.md`.
4. Open the files named in those notes before editing.
5. Decide whether the task is a bug fix, optimization, or behavior change.

## What to tell Copilot in a new session
- name the exact symptom or goal first
- mention whether the bug is in mic/audio, resume flow, pacing, cards, or finalization
- include any observed route/file already involved
- ask for targeted validation, not just code edits

Suggested prompt shape:
> Read `context.md` and `recent changes/latest.md` first. We are working only on the AI mock interview feature. Investigate `<bug or goal>` around `<file/route>`, implement the smallest safe fix, validate it, and update `recent changes/latest.md`.

## Working rules
- Keep admin and employee interview behavior aligned unless divergence is intentional.
- Import Prisma via `@/lib/prisma`.
- Preserve token-expiry and single-use protections.
- Prefer small targeted fixes over broad refactors inside the interview stack.
- If interview behavior changes, update `recent changes/latest.md` before ending the session.

## Quick validation
- `npm run lint`
- Targeted lint examples:
  - `npx eslint app/live-interview/[token]/interview-room.tsx`
  - `npx eslint lib/interview/web-rtc-transport.ts`
  - `npx eslint app/api/interviews/webrtc/start/route.ts`

## Definition of done for AI interview work
- root cause is identified or narrowed clearly
- changed files are minimal and interview-focused
- impacted file(s) are validated
- `recent changes/latest.md` is refreshed with the latest summary
- any unresolved follow-up is captured explicitly instead of left implicit

## New-session handoff
1. Read this file.
2. Read `recent changes/latest.md`.
3. Read `recent changes/open-issues.md`.
4. Open the files listed there before making changes.
5. After finishing meaningful work, refresh `recent changes/latest.md` with a short, factual note.

