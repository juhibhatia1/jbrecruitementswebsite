# Latest Shared Context

## Date
2026-08-07 (session 8 - AUDIO SPEECH SPEED)

## What changed (session 8)
Added native OpenAI Realtime server-side speech speed control.

### Audio speed via `OPENAI_REALTIME_SPEECH_SPEED` env var
**Feature**: OpenAI Realtime synthesizes speech at a configurable speed (0.25–4.0). Default is `1.0`; set to `0.9` for slightly slower, clearer delivery without any client-side audio manipulation.

**Implementation**:
- `.env`: Added `OPENAI_REALTIME_SPEECH_SPEED=0.9`
- `lib/interview/webrtc-session.ts` — `createOpenAIRealtimeClientSecret`: added `speed?: number` to payload, forwarded as `audio.output.speed` in the ephemeral client_secrets POST to OpenAI
- `app/api/interviews/webrtc/start/route.ts`: reads `OPENAI_REALTIME_SPEECH_SPEED` env var, passes it to `createOpenAIRealtimeClientSecret`, and includes `speechSpeed` in the start response
- `lib/interview/web-rtc-transport.ts` — `sendSessionUpdate`: added `speechSpeed` to `ConnectPayload` type and private field; sets `audio.output.speed` in the `session.update` data channel message (sent when data channel opens)
- `app/live-interview/[token]/interview-room.tsx`: added `speechSpeed?: number` to `startData` type cast; passes `startData.speechSpeed` through to `transport.connect()`

**Speed is set in two places** (both are authoritative per OpenAI Realtime docs):
1. Initial session creation (`client_secrets` POST) — takes effect before any audio is synthesized
2. `session.update` (data channel on open) — ensures the session config is consistent if the initial value was ignored or overridden

**Constraints respected**:
- No client-side audio manipulation (no `AudioBufferSourceNode.playbackRate`, no PCM decoding, no Web Audio changes)
- Voice selection, preview endpoints, admin preview, audio MIME types, sample rate, and encoding are all unchanged

## Files touched (session 8)
- `.env` (added `OPENAI_REALTIME_SPEECH_SPEED=0.9`)
- `lib/interview/webrtc-session.ts` (`createOpenAIRealtimeClientSecret` speed param)
- `app/api/interviews/webrtc/start/route.ts` (read env, pass speed, include in response)
- `lib/interview/web-rtc-transport.ts` (`ConnectPayload`, private field, `connect()`, `sendSessionUpdate()`)
- `app/live-interview/[token]/interview-room.tsx` (startData type, transport.connect call)

## Validation done (session 8)
- `npx eslint` on all 4 changed source files — 0 errors (2 pre-existing warnings in `web-rtc-transport.ts`)
- `npx tsc --noEmit` — clean

## Testing checklist (session 8)
- [ ] Start a fresh interview: confirm AI voice sounds ~10% slower than before
- [ ] Confirm existing voice selection (marin, cedar, etc.) still works unchanged
- [ ] Change `OPENAI_REALTIME_SPEECH_SPEED` to `1.0` in `.env` and restart — speed reverts to normal
- [ ] Change to `0.75` — further slowdown with no errors

---

## What changed (session 7)
Two startup regressions fixed (introduced by Session 5/6).

### 1. Timer now starts reliably via dual-trigger (PRIMARY FIX)
**Problem**: `onAssistantAudioStart` (triggered by `response.output_audio.delta` PCM data channel events) was the only path to start the fresh-session clock. If the first AI turn was tool-only (no audio delta) or PCM deltas arrived with an empty `delta` field, the timer stayed frozen at 15:00 forever.

**Solution**:
- Extracted clock-start logic into `startFreshSessionClock()` inner function inside `beginInterview`
- `onAssistantAudioStart` → calls `startFreshSessionClock()` (primary, unchanged behavior)
- `onAssistantSpeakingChange(true)` → also calls `startFreshSessionClock()` (new fallback, fires on `response.created` which is more reliable than PCM audio deltas)
- `freshClockPendingRef.current` guard prevents double-start — whichever arrives first wins, the other is a no-op
- Removed redundant `setSetupStep`, `setSetupStatus`, `setPhase("live")` calls from the old `onAssistantAudioStart` body (those were no-ops since phase is already "live" after Session 5's change)

### 2. Removed duplicate `setTranscriptItems` call (LANDING FIX)
**Problem**: `setTranscriptItems` was called twice for resumed sessions — once in `beginInterview` (lines 789-791, during setup phase) and once in the `ready` handler. Since React batches state, when the live room first rendered all transcript bubbles were already in state and snapped in simultaneously.

**Solution**: Removed the `setTranscriptItems` call from `beginInterview`. The `ready` handler (line 519-523) is now the single source of truth. Internal refs (`transcriptRef.current` etc.) are still populated immediately at `/start` response time.

### 3. Strengthened resume opening prompt (LANDING FIX)
**Problem**: On resume, `sendOpeningPrompt` + `safeResponseCreate()` forces the AI to generate a new spoken response. The old resume prompt ("Continue from where you left off — do not repeat questions") was too weak; the AI still produced a greeting-like "Welcome back, let's continue..." response that sounded like a repeated intro.

**Solution**: Updated `buildWebRtcOpeningPrompt` resume branch to:
> "Do NOT say 'Welcome back', do NOT re-introduce yourself, do NOT greet the candidate again. Resume IMMEDIATELY by asking your next planned question — continue as if the conversation never paused."

## Files touched
- `app/live-interview/[token]/interview-room.tsx` (startFreshSessionClock refactor, removed duplicate setTranscriptItems)
- `lib/interview/webrtc-session.ts` (resume prompt)

## Validation done
- `npx eslint "app/live-interview/[token]/interview-room.tsx" "lib/interview/webrtc-session.ts"` — 0 errors
- `npx tsc --noEmit` — clean

## Testing checklist
- [ ] Fresh session: timer frozen at 15:00 while "Preparing questions…" spinner shows
- [ ] Fresh session: timer starts counting as soon as `response.created` fires (AI begins generating), not waiting for first audio delta
- [ ] Fresh session: no double-intro — AI speaks its greeting exactly once
- [ ] Resumed session: transcript loads in `ready` handler — no double-render flash
- [ ] Resumed session: AI jumps directly to next question without greeting preamble
- [ ] `onAssistantAudioStart` still fires (if PCM deltas arrive before `response.created` somehow): guard prevents double-start

## Follow-ups
- Monitor resumed sessions to confirm AI no longer opens with "Welcome back" phrasing
- If AI still produces brief acknowledgment on resume, consider passing `isResuming` flag through ConnectPayload so transport can inject an even stronger context message via `conversation.item.create`

---

### 1. Timer now starts when AI audio begins (CRITICAL FIX)
**Problem**: Timer displayed full duration (15:00) throughout entire interview, never counting down.
- `freshClockPendingRef.current = true` at session start, but `timingState.startedAt` stayed at 0
- Timer calculation requires `timingState.startedAt > 0` to count elapsed time
- Result: `elapsedSeconds` always = 0, so `remainingSeconds` always = totalDuration

**Solution**:
- `onAssistantAudioStart` callback now properly sets `timingState = { startedAt: Date.now(), ... }`
- Added console logging to verify callback fires and state updates correctly
- Timer countdown now begins the moment AI's first audio chunk arrives
- Effect: timer counts down from 15:00 → 14:59 → 14:58... as intended

### 2. Replaced banner notification with toast system
**Problem**: "AI is preparing questions…" banner at top of page was intrusive and stayed visible even after AI started speaking.

**Solution**:
- Removed banner UI from live room header (deleted ~8 lines of amber-colored notification banner)
- Replaced with `sonner` toast notification (bottom-right, same as microphone notification)
- Toast auto-shows when transport ready: `toast.loading("AI is preparing interview questions…")`
- Toast auto-dismisses when AI starts: `toast.dismiss("ai-preparing")`
- Much cleaner UX, consistent with existing notification patterns

### 3. Removed "Preparing questions…" status from AI Interviewer
**Problem**: Status line showed "Preparing questions…" spinner even after AI was already speaking (confusing).

**Solution**:
- Removed the `isAiPreparingQuestions` conditional from status display
- Now correctly shows:
  - "Thinking…" when AI is processing candidate answer
  - "Speaking…" when AI is asking/responding
  - "Listening…" when waiting for candidate

### 4. Added comprehensive event logging for debugging
**Problem**: Hard to diagnose why timer wasn't starting.

**Solution**: Added console logs at key transition points:
- Session setup: `🆕 Fresh session detected...` or `🔄 Resumed session...`
- Transport ready: `Transport ready, entering live phase...`
- Audio arrives: `🔊 First assistant audio delta received!` (web-rtc-transport)
- Timer starts: `✅ AI started speaking! Starting timer now.`
- Timer state: `Setting interview start time: [ISO timestamp]`
- Continuous monitoring: `⏱️ Timer active - elapsed: N seconds`

These logs help identify exactly where the flow breaks down if timer doesn't start.

### 5. Toast dismissed on all exit paths
- Error handler: `toast.dismiss("ai-preparing")`
- Interview complete: `toast.dismiss("ai-preparing")`
- User early exit: `toast.dismiss("ai-preparing")`
- Ensures no stale notification if session fails

## Files touched
- `app/live-interview/[token]/interview-room.tsx` (major changes: logging, toast system, status cleanup)
- `lib/interview/web-rtc-transport.ts` (minor: added logging to onAssistantAudioStart callback)

## Validation done
- No TypeScript errors or new linting issues introduced
- Console logging ready for debugging (see TIMER_FIX_SESSION_6.md for full test checklist)

## Testing checklist
- [ ] Fresh interview: see "AI is preparing questions…" toast appear on live room entry
- [ ] Fresh interview: timer displays 15:00 but DOES NOT count down during 30-40s wait
- [ ] Fresh interview: after AI speaks, toast dismisses and timer STARTS counting from 15:00 → 14:59 → 14:58...
- [ ] Fresh interview: elapsed time increases correctly (0:00 → 0:05 → 0:10)
- [ ] Resumed interview: NO "preparing" toast (only for fresh sessions)
- [ ] Resumed interview: timer continues from correct elapsed time
- [ ] Errors: "preparing" toast is dismissed correctly
- [ ] Early exit: "preparing" toast is dismissed correctly
- [ ] DevTools Console: verify logs show callback firing with ✅ emoji
- [ ] DevTools Console: verify timestamp when timer actually starts matches first audio arrival

## Follow-ups
- Monitor live interviews for timer working correctly (must count down from full duration)
- If timer still frozen after these changes: check DevTools console for "🔊 First assistant audio delta" log
  - If log appears but timer frozen: state update issue, check React DevTools
  - If log doesn't appear: audio not flowing, check web-rtc-transport connection
- Consider adding visual "timer started" indicator or toast confirmation (already added: "Interview started! Timer is now running.")
- Document the 30-40s expected wait time in user-facing help/FAQ (system is working correctly, just slow LLM initialization)

---

## Prior pass (2026-08-06, session 5)
Third follow-up pass focused on startup lag, mid-answer interruption resilience, and custom-template runtime slowness.

### 1. Fresh-session clock now starts on first audible assistant audio (not just `response.created`)
- `app/live-interview/[token]/interview-room.tsx`: moved fresh-session start gate from
  `onAssistantSpeakingChange` to a new transport callback `onAssistantAudioStart`, so billed time
  starts when the candidate can actually hear the AI.
- `lib/interview/web-rtc-transport.ts`: emits `onAssistantAudioStart` exactly once on the first
  `response.output_audio.delta` chunk.
- Effect: removes 10-50s clock drift when model thinking time occurs before first audible speech.

### 2. Silence nudge is now suppressed by local speech energy (safety net)
- `lib/interview/web-rtc-transport.ts`: added `notifyLocalSpeechActivity()` to mark active
  candidate speaking and cancel pending silence checks.
- `app/live-interview/[token]/interview-room.tsx`: added local RMS mic monitor (180ms tick,
  debounced to 700ms) and forwards activity to transport while live + mic enabled.
- Effect: if server VAD misses a speech-start edge during long answers, the 17s nudge no longer
  interrupts the candidate mid-answer.

### 3. Newly created custom interviews no longer feed huge conflicting prompts into realtime
- `app/api/interviews/webrtc/start/route.ts`: added `buildRealtimeBaseInstructions(...)`.
  For `advancedConfig.isCustomJd` templates, the runtime now uses a compact role/JD/resume context
  instead of the full generated Gemini-style orchestration prompt.
- Effect: reduces instruction bloat/conflicts and lowers per-turn latency for custom paid interviews.

### 4. Browser tabs no longer share a WebRTC session
- `app/live-interview/[token]/interview-room.tsx`: session hints are now stored in `sessionStorage`
  instead of `localStorage`, so each tab gets its own isolated session key while refresh still works.
- `app/api/interviews/webrtc/start/route.ts`: blocks concurrent `CONNECTING`/`ACTIVE` sessions unless
  they come from the same tab/session hint.
- Effect: prevents two open tabs from creating parallel interview sessions, which caused duplicate AI
  replies, duplicated candidate transcripts, and timer drift.

### 5. Fresh sessions now enter the room as soon as transport is ready
- `app/live-interview/[token]/interview-room.tsx`: fresh sessions now switch to the live room on
  transport `ready` instead of waiting for the first assistant audio chunk.
- Effect: the candidate no longer sits on the setup spinner with the interview already underway;
  the timer still starts on the first audible assistant response.

## Files touched
- `app/live-interview/[token]/interview-room.tsx`
- `lib/interview/web-rtc-transport.ts`
- `app/api/interviews/webrtc/start/route.ts`
- `lib/interview/webrtc-session.ts`

## Validation done
- `npx eslint "lib/interview/web-rtc-transport.ts" "app/live-interview/[token]/interview-room.tsx" "app/api/interviews/webrtc/start/route.ts" "lib/interview/webrtc-session.ts"`
  - 0 errors, 2 pre-existing warnings in `web-rtc-transport.ts`.
- `npx tsc --noEmit`
  - clean.

## Follow-ups
- Run 2 live checks: (1) existing old template URL, (2) newly generated custom+billing template;
  confirm startup latency, no mid-answer nudges, and reduced "Evaluating..." stalls.
- If custom templates still show high latency, cap runtime context further (e.g. shorter JD/resume
  slices) and/or lower question-generation frequency for exhausted sections.

---

## Prior pass (2026-08-06, session 2)
Second follow-up pass addressing three residual AI mock-interview issues after the prior fix.

### 1. "Preparing questions" wait no longer billed, and no longer shown on the live screen (Issue 1)
- The billed clock now starts on the AI's **first response**, not at connect. `interview-room.tsx`
  keeps a fresh session on the **setup screen** (spinner) through connect + the ~20–30s
  first-response latency; `onAssistantSpeakingChange` then stamps the real start, re-anchors the
  transport clock (`transport.markSessionStarted`), reveals the live screen, arms timing, and
  persists the start. Resumed sessions still go live immediately at `ready`.
- Audio was decoupled from the phase: a hidden `<audio>` is now mounted in the setup screen too,
  the remote stream is stored in `remoteStreamRef`, and `attachRemoteStream()` + a phase effect
  re-attach it across setup→live so no audio is lost.
- `web-rtc-transport.ts`: added `markSessionStarted(ms)` (sets `sessionStartedAtMs`, reschedules
  section boundary timers).
- Connect timeout now keys off `transport.isReady()` instead of phase.

### 2. Acknowledgment and next question no longer feel rushed (Issue 2)
- `web-rtc-transport.ts`: "Speech Delivery" prompt now demands a deliberate pause (a full beat)
  between the acknowledgment and the question.
- Transcript: `splitAcknowledgmentAndQuestion()` splits the utterance so the ACK renders as one
  bubble and the question as a second bubble ~1.4s later (visual gap that matches the audio pause).
  Falls back to a single bubble when there is no clean split.

### 3. AI no longer interrupts long answers on natural pauses (Issue 3, HIGH)
- `web-rtc-transport.ts`: `server_vad.silence_duration_ms` 1500 → **2500ms**. Candidates giving
  long unscripted answers pause 1.5–2.5s to think; at 1500ms that was read as end-of-turn and the
  AI cut in with an acknowledgment + next question. 2500ms tolerates natural pauses.
  (Documented fallback if it recurs: switch turn_detection to `semantic_vad`, eagerness "low".)

## Files touched
- `lib/interview/web-rtc-transport.ts`
- `app/live-interview/[token]/interview-room.tsx`

## Validation done
- `npx eslint` on both files: 0 errors (2 pre-existing unused-symbol warnings only).
- `npx tsc --noEmit`: clean, no type errors.

## Follow-ups
- Manual live test: (a) confirm the clock is frozen at full duration on the setup spinner and
  starts at 0:00 exactly when the AI speaks; (b) confirm audio plays from the first word;
  (c) give a 30–40s answer with ~2s pauses and confirm the AI waits; (d) confirm a clear gap
  between acknowledgment and question in both audio and transcript.
- If mid-answer interruption still occurs with 2500ms, adopt `semantic_vad` (eagerness "low") —
  it is the purpose-built fix but should be live-tested before shipping to the paid flow.

---

## Prior pass (2026-08-06, session 1)
Fixed billed-clock start (moved off `session.createdAt`), noise-driven interruption desync
(interruption-confirmation window), a transition-only stall guard, and a duplicate-response
transcript safety net. Files: `web-rtc-transport.ts`, `interview-room.tsx`,
`webrtc/start/route.ts`, `webrtc/sessions/[sessionId]/sync/route.ts`. Reused existing
`InterviewSession.startedAt` column (no migration).

