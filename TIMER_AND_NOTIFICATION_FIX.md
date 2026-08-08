# Timer Start and AI Preparation Notification Fix

## Problem Statement
When candidates started an interview:
1. **Timer didn't start** - It remained at the full duration instead of counting down
2. **No notification about AI preparation** - Candidates waited 30-40 seconds with no feedback
3. **Unclear when interview actually started** - No visual indicator of the "preparing" vs "live" transition

## Solution Implemented

### 1. Added "AI is Preparing Questions" Notification
- New state `isAiPreparingQuestions` tracks the preparation phase
- When transport is ready, the interview room appears with:
  - **Notification banner**: "AI is preparing interview questions… This typically takes 30-40 seconds. Please wait while we set up your personalized interview."
  - **Status indicator**: AI Interviewer section shows "Preparing questions…" with animated spinner
  - **Timer**: Shows FULL DURATION (e.g., 15:00) but does NOT count down
- This gives clear feedback that the system is working and the wait is expected

### 2. Fixed Timer to Start Only When AI Begins Speaking
- Timer now starts ONLY when the first audible AI audio arrives (`onAssistantAudioStart` callback)
- Key changes:
  - `isAiPreparingQuestions` flag is cleared when first audio chunk arrives
  - `timingState.startedAt` is set to the current time (when audio actually starts)
  - Interview duration countdown begins immediately
  - Duration warning timers (`armInterviewTiming`) are armed

### 3. Proper State Cleanup
- Preparing flag is cleared in all exit scenarios:
  - When errors occur
  - When interview completes
  - When user exits early
  - Prevents stale UI state

## Technical Changes

### File Modified: `app/live-interview/[token]/interview-room.tsx`

1. **Added new state** (line ~55):
   ```tsx
   const [isAiPreparingQuestions, setIsAiPreparingQuestions] = useState(false);
   ```

2. **Updated "ready" message handler** (line ~515):
   - Set `isAiPreparingQuestions = true` for fresh sessions
   - This makes the interview room visible while waiting

3. **Updated "onAssistantAudioStart" callback** (line ~840):
   - Clear preparing flag: `setIsAiPreparingQuestions(false)`
   - Set timer start: `setTimingState({ startedAt: now, durationMs: ... })`
   - Arm duration timers: `armInterviewTiming()`

4. **Added notification banner** (line ~1300):
   ```tsx
   {isAiPreparingQuestions && (
     <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-center gap-3">
       <span className="inline-block w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin" />
       <div>
         <p className="text-sm font-semibold text-amber-900">AI is preparing interview questions…</p>
         <p className="text-xs text-amber-700 mt-0.5">This typically takes 30-40 seconds. Please wait while we set up your personalized interview.</p>
       </div>
     </div>
   )}
   ```

5. **Updated AI Interviewer status display** (line ~1322):
   - Shows "Preparing questions…" during prep phase
   - Then shows "Thinking…", "Speaking…", or "Listening…" during interview

6. **Added cleanup in error handling** (line ~504):
   - Clear preparing flag when errors occur

7. **Added cleanup in completion handlers** (line ~591, ~407):
   - Clear preparing flag when interview completes or user exits

## How It Works - User Experience

### Fresh Interview (New Session)
1. **Setup Phase** (0-5s)
   - User goes through: Microphone access → Microphone test → Connecting → Starting

2. **Transport Ready** (~5-10s)
   - Interview room appears
   - **AI Interviewer shows**: "Preparing questions…" with spinner
   - **Top banner shows**: "AI is preparing interview questions…"
   - **Timer displays**: Full duration (e.g., "15:00") - NOT COUNTING
   - Candidate knows to wait, understands the process

3. **AI Starts Speaking** (~40-50s after start)
   - First audio chunk arrives
   - **Preparing notification disappears** automatically
   - **Timer STARTS COUNTING DOWN** from 15:00 → 14:59 → 14:58...
   - **Status changes to**: "Speaking…"
   - **Interview billing/duration counter begins**
   - Candidate can now see they're in the actual interview

### Resumed Interview (Existing Session)
- Interview room appears immediately with timer continuing from where it left off
- No "preparing" phase since interview already started
- If session was interrupted mid-wait, timer resumes at the right time

## Testing Checklist
- [ ] **Fresh session**: Confirm "Preparing questions" notification appears
- [ ] **Timer display**: Verify timer shows full duration (not counting) during prep
- [ ] **Audio detection**: Confirm notification disappears when AI starts speaking
- [ ] **Timer countdown**: Verify timer counts down immediately after audio starts
- [ ] **Duration match**: Confirm interview duration matches template settings
- [ ] **Interruption recovery**: Test session resumption maintains correct elapsed time
- [ ] **Error handling**: Verify notification clears if session fails
- [ ] **Early exit**: Confirm notification clears if user exits during prep
- [ ] **Mic reconnection**: Test mic reconnect during prep phase

## Validation Status
✅ **TypeScript**: No type errors  
✅ **ESLint**: No linting errors  
✅ **Code style**: Follows project conventions  

## Related Files
- `recent changes/latest.md` - Updated with session 6 changes
- `lib/interview/web-rtc-transport.ts` - Already had `onAssistantAudioStart` callback
- `app/live-interview/[token]/interview-room.tsx` - Main changes file

## Notes for Future Development
- The 30-40 second preparation time is expected for model generation
- If preparation consistently exceeds 60 seconds, review AI model configuration
- The timer calculation is defensive: `phase === "live" && timingState.startedAt` ensures no premature counting
- Notification styling uses Tailwind's amber color for "wait" state (distinct from error red or live purple)

