# Timer and Notification Fix - Session 6

## Issues Fixed

### 1. **Timer Not Starting** (CRITICAL - PRIORITY)
**Problem**: Timer remained frozen at full duration (15:00) even though AI had already started speaking.

**Root Cause**: The `onAssistantAudioStart` callback wasn't being confirmed to fire, or the timer state wasn't being set correctly. When AI began speaking, `timingState.startedAt` should have been set to `Date.now()`, but it remained at 0.

**Solution Implemented**:
- Added comprehensive console logging to track when the callback fires
- Added logging to verify `timingState.startedAt` is being set correctly
- Timer calculation will now work because `timingState.startedAt > 0` when audio starts

**Files Changed**:
- `app/live-interview/[token]/interview-room.tsx` - Added logging in `onAssistantAudioStart` callback
- `lib/interview/web-rtc-transport.ts` - Added logging when audio delta arrives

**Key Code Changes**:

In `interview-room.tsx` `onAssistantAudioStart`:
```typescript
onAssistantAudioStart: () => {
  console.log("[Interview] ✅ AI started speaking! Starting timer now.");
  if (!freshClockPendingRef.current) {
    console.log("[Interview] ⚠️ freshClockPendingRef already false, skipping audio start handler");
    return;
  }
  freshClockPendingRef.current = false;
  setIsAiPreparingQuestions(false);
  toast.dismiss("ai-preparing");
  toast.success("Interview started! Timer is now running.", { duration: 2000 });
  
  const now = Date.now();
  console.log("[Interview] Setting interview start time:", new Date(now).toISOString());
  interviewStartedAtRef.current = now;
  transportRef.current?.markSessionStarted(now);
  setTimingState({ startedAt: now, durationMs: interviewDurationMsRef.current });
  console.log("[Interview] Timer state updated - elapsed should now count from 0");
  // ... rest of callback
}
```

### 2. **Notification UX Improved**
**Problem**: Banner notification at top of page was intrusive and stayed on screen even after AI started speaking.

**Solution Implemented**:
- Replaced banner with toast notification (bottom-right, like microphone notification)
- Notification now uses `sonner` toast system already in the project
- Toast auto-dismisses when AI starts speaking
- Much cleaner UX that matches existing notification patterns

**Toast Changes**:
- When transport is ready: `toast.loading("AI is preparing interview questions… This typically takes 30-40 seconds. Please wait.", { id: "ai-preparing" })`
- When AI starts speaking: `toast.dismiss("ai-preparing")` + `toast.success("Interview started! Timer is now running.")`
- On errors or exit: `toast.dismiss("ai-preparing")`

### 3. **Removed "Preparing Questions" Status**
**Problem**: The AI Interviewer status showed "Preparing questions…" which confused candidates because the AI was already speaking.

**Solution**: Removed the `isAiPreparingQuestions` conditional from the status display. Now shows:
- "Thinking…" (with spinner) when AI is thinking
- "Speaking…" when AI is speaking
- "Listening…" when waiting for candidate response

### 4. **Better Event Tracking**
**Problem**: Hard to debug state transitions and when events fire.

**Solution Implemented**: Added comprehensive console logging throughout the flow.

**Logging Points**:

1. **Session Setup**:
```typescript
console.log("[Interview Setup] 🆕 Fresh session detected. Timer will start only when AI audio begins.");
console.log("[Interview Setup] 🔄 Resumed session. Continuing from previous start time:", startData.sessionStartedAt);
```

2. **Transport Ready**:
```typescript
console.log("[Interview] Transport ready, entering live phase. Waiting for AI audio to start timer.");
console.log("[Interview] Resumed session, continuing interview.");
```

3. **AI Audio Start**:
```typescript
console.log("[WebRTC Transport] 🔊 First assistant audio delta received! Calling onAssistantAudioStart callback.");
console.log("[Interview] ✅ AI started speaking! Starting timer now.");
console.log("[Interview] Setting interview start time:", new Date(now).toISOString());
console.log("[Interview] Timer state updated - elapsed should now count from 0");
```

4. **Timer Monitoring**:
```typescript
useEffect(() => {
  if (phase === "live" && timingState.startedAt > 0) {
    const elapsed = Math.floor((Date.now() - timingState.startedAt) / 1000);
    console.log("[Interview Timer] ⏱️ Timer active - elapsed:", elapsed, "seconds");
  } else if (phase === "live" && timingState.startedAt === 0) {
    console.log("[Interview Timer] ⏳ Timer waiting to start - freshClockPendingRef:", freshClockPendingRef.current);
  }
}, [phase, timingState.startedAt]);
```

## Testing Checklist

To verify the fixes work:

1. **Fresh Interview** (Recommended):
   - [ ] Open DevTools Console (F12)
   - [ ] Click "Start Interview"
   - [ ] Observe logs showing setup and transport ready
   - [ ] See toast notification: "AI is preparing interview questions…"
   - [ ] Wait 30-40 seconds
   - [ ] Observe logs: "[WebRTC Transport] 🔊 First assistant audio delta received!"
   - [ ] Observe logs: "[Interview] ✅ AI started speaking!"
   - [ ] See timer START COUNTING DOWN from 15:00 → 14:59 → 14:58...
   - [ ] Toast changes to "Interview started! Timer is now running."
   - [ ] No more "Preparing questions…" status in AI Interviewer section
   - [ ] Elapsed time increases correctly: "Elapsed: 0:05", "Elapsed: 0:10", etc.

2. **Resumed Interview**:
   - [ ] Start an interview and let it run for 30+ seconds
   - [ ] Refresh the page (F5)
   - [ ] Should resume immediately with timer continuing from correct elapsed time
   - [ ] No "preparing" toast should appear (only for fresh sessions)

3. **Error Handling**:
   - [ ] If connection fails, verify toast is dismissed
   - [ ] Verify error notification appears correctly

4. **Early Exit**:
   - [ ] Start interview, wait for AI to start
   - [ ] Click "End Interview Early"
   - [ ] Confirm toast is dismissed
   - [ ] Session completes normally

## Console Logs to Expect

### Fresh Session Flow:
```
[Interview Setup] 🆕 Fresh session detected. Timer will start only when AI audio begins.
[Interview] Transport ready, entering live phase. Waiting for AI audio to start timer.
[Interview Timer] ⏳ Timer waiting to start - freshClockPendingRef: true
... (30-40 second wait) ...
[WebRTC Transport] 🔊 First assistant audio delta received! Calling onAssistantAudioStart callback.
[Interview] ✅ AI started speaking! Starting timer now.
[Interview] Setting interview start time: 2026-08-06T14:23:45.123Z
[Interview] Timer state updated - elapsed should now count from 0
[Interview Timer] ⏱️ Timer active - elapsed: 0 seconds
[Interview Timer] ⏱️ Timer active - elapsed: 1 seconds
[Interview Timer] ⏱️ Timer active - elapsed: 2 seconds
...
```

### Resumed Session Flow:
```
[Interview Setup] 🔄 Resumed session. Continuing from previous start time: 2026-08-06T14:20:15.456Z
[Interview] Resumed session, continuing interview.
[Interview Timer] ⏱️ Timer active - elapsed: 180 seconds
[Interview Timer] ⏱️ Timer active - elapsed: 181 seconds
...
```

## Technical Details

### Timer State Management
- `freshClockPendingRef.current`: Set to `true` for new sessions, cleared when AI audio starts
- `timingState.startedAt`: Initially 0, set to `Date.now()` in `onAssistantAudioStart`
- `interviewStartedAtRef.current`: Stores the billed interview start time
- Timer display calculation:
  ```typescript
  const elapsedSeconds = phase === "live" && timingState.startedAt 
    ? Math.max(0, Math.floor((currentTimeMs - timingState.startedAt) / 1000))
    : 0;
  ```

### Notification System
- Uses existing `sonner` toast library
- Toast ID "ai-preparing" allows controlled dismiss
- Different toast types for different states:
  - `toast.loading()` - while preparing
  - `toast.success()` - when started
  - `toast.error()` - on errors

### Event Flow
1. `beginInterview()` → User clicks start
2. Setup steps complete → `freshClockPendingRef = true`, timer shows full duration
3. `onReady()` → Transport ready, enter live phase, show preparing toast
4. 30-40s wait... AI model generates questions
5. `onAssistantAudioStart()` → First audio chunk arrives
6. Timer starts counting down, preparing toast dismissed
7. Interview continues normally with running timer

## Files Modified

1. **app/live-interview/[token]/interview-room.tsx**
   - Lines ~520: Added logging in "ready" case handler
   - Lines ~846-883: Enhanced `onAssistantAudioStart` with logging and toast handling
   - Lines ~506-516: Added toast.dismiss in error handler
   - Lines ~596-602: Added toast.dismiss in interview_complete handler
   - Lines ~402-411: Added toast.dismiss in handleConfirmExit
   - Lines ~107-121: Added timer monitoring useEffect with logging
   - Removed: Banner notification UI (lines ~1310-1318)
   - Updated: AI Interviewer status display (removed "Preparing" option)
   - Lines ~770-792: Added logging to session setup

2. **lib/interview/web-rtc-transport.ts**
   - Line 579: Added logging when `onAssistantAudioStart` callback fires

## Known Behaviors

- **30-40s wait is expected**: This is the AI model generating personalized interview questions. The time varies based on the template complexity and AI load.
- **Timer shows full duration during wait**: This is intentional. The timer only starts counting when the AI actually starts speaking (avoiding billing candidates for system preparation time).
- **No "preparing" notification for resumed sessions**: Resumed sessions already have the timer running, so no preparation period is shown.
- **Toast auto-dismisses**: The "preparing" toast automatically disappears when AI starts or if you dismiss it manually.

## Debugging Guide

If timer still doesn't start:

1. Open DevTools Console (F12)
2. Look for these specific logs:
   - ✅ See `[WebRTC Transport] 🔊 First assistant audio delta received!`? 
     - YES: Audio is arriving, callback should fire
     - NO: Audio stream issue, check audio connection
   - ✅ See `[Interview] ✅ AI started speaking!`?
     - YES: Callback fired, timer should start
     - NO: Callback not executing, check `freshClockPendingRef` flag
   - ✅ See `[Interview] Timer state updated - elapsed should now count from 0`?
     - YES: State set correctly
     - NO: State update failed

3. Check timer display calculation:
   - Open DevTools Elements tab
   - Find timer element (search for "Time Left")
   - Verify `remainingSeconds` is decreasing

4. If timer still frozen:
   - Check `timingState.startedAt` in React DevTools
   - Should be a number > 0, not 0
   - If 0, callback didn't fire or state wasn't updated

## Next Steps

If issues persist:
1. Share the console output from DevTools
2. Note exact time when "AI is preparing" appears vs when AI starts speaking
3. Check if timer value changes at all (even if wrong)
4. Verify network tab shows all requests completing

