# Open AI Interview Issues

Use this file to keep the active investigation queue small and explicit.

## Priority buckets

### 1) Mic / audio reliability
- permission edge cases during setup
- silent or dead audio track after connect
- reconnect behavior after device change/disconnect
- echo / interruption side effects between candidate and AI audio

Primary files:
- `app/live-interview/[token]/interview-room.tsx`
- `lib/interview/web-rtc-transport.ts`

### 2) Resume / reconnect behavior
- duplicate session starts
- candidate re-entry while a session is active
- repeated questions after reconnect
- reconnect state drifting from persisted transcript/cards

Primary files:
- `app/api/interviews/webrtc/start/route.ts`
- `lib/interview/webrtc-session.ts`
- `app/live-interview/[token]/interview-room.tsx`

### 3) Pacing / timing correctness
- interview closing too early
- weak section pacing
- hard-stop and grace-window edge cases
- question density dropping mid-session

Primary files:
- `lib/interview/web-rtc-transport.ts`
- `lib/interview/webrtc-session.ts`

### 4) Transcript / reference-card consistency
- card appears without correct transcript alignment
- card question/options not preserved cleanly on resume
- saved events not matching active section

Primary files:
- `app/live-interview/[token]/interview-room.tsx`
- `app/api/interviews/webrtc/sessions/[sessionId]/finalize/route.ts`
- `lib/interview/types.ts`

### 5) Finalization / reporting
- session marked complete with incomplete report state
- report/email/PDF side effects diverging
- fallback report quality gaps

Primary files:
- `app/api/interviews/webrtc/sessions/[sessionId]/finalize/route.ts`
- `lib/interview/webrtc-session.ts`
- `server.ts`

## Usage rule
- When you start a real fix, keep `latest.md` focused on the newest change.
- Keep this file more stable: update it only when priorities or suspected hotspots change.

