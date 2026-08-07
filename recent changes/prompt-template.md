# Copilot Session Prompt Template

Use this when starting a fresh session for AI mock interview work.

## Short version
Read `context.md`, `recent changes/latest.md`, and `recent changes/open-issues.md` first. We are working only on the AI mock interview feature. Investigate `<bug or goal>` around `<file/route if known>`, implement the smallest safe fix, validate the impacted files, and update `recent changes/latest.md`.

## More explicit version
Read `context.md`, `recent changes/latest.md`, and `recent changes/open-issues.md` first.

Scope: AI mock interview feature only.

Task:
- Problem: `<symptom / bug / optimization goal>`
- Likely area: `<mic/audio | resume | pacing | cards | finalization>`
- Suspected files: `<file paths>`

Requirements:
- find the root cause first
- make the smallest safe change
- avoid unrelated refactors
- validate the changed files
- update `recent changes/latest.md` with summary, files touched, validation, and follow-ups

