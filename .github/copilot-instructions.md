# Copilot Instructions for JB-Recruitment-Solutions

## Build, lint, and validation commands

```bash
npm run dev
```
- Starts the app through the custom server (`tsx server.ts --dev`), including the WebSocket interview endpoint.
- Do not use `next dev` directly in this repository.

```bash
npm run build
```
- Runs `prisma generate` and then `next build`.

```bash
npm run lint
```
- Runs ESLint for the repository.

```bash
npx eslint app/api/chat/route.ts
```
- Example of a focused single-file lint check (use this pattern for targeted validation).
- There is currently no dedicated test runner/script in `package.json` and no `*.test`/`*.spec` suite in the repository.

```bash
npx prisma migrate dev --name <description>
npx prisma generate
```
- Run after Prisma schema changes.

## High-level architecture

- **Runtime shape:** Next.js App Router app + a custom Node HTTP server in `server.ts`. The custom server owns WebSocket upgrades for live interviews and boots Next for standard HTTP routes.
- **AI interview pipeline:** Candidate joins `/interview/[token]` and `/live-interview/[token]`; browser streams audio to `/ws/interview`; `server.ts` authenticates token, creates `InterviewSession`, delegates realtime interview orchestration to provider(s) in `lib/interview/providers/`, then persists transcript/evaluation/final report and sends emails on completion.
- **Interview data model:** `InterviewTemplate -> CandidateApplication -> InterviewSession` (see `prisma/schema.prisma`). Templates are generated/activated first, applications store hashed access tokens, sessions store transcript/evaluation/report JSON.
- **RAG chatbot:** `app/api/chat/route.ts` streams SSE responses via `lib/rag/chat-engine`, stores conversation history in `ChatConversation`, and applies IP rate limiting.
- **Payments:** `app/api/checkout/route.ts` creates PaymentIntents and a `Purchase` row (PENDING); `app/api/webhooks/stripe/route.ts` verifies signature, idempotently moves `Purchase` to COMPLETED, logs funnel events, and sends emails.
- **Portals:** Admin and Employee areas are parallel surfaces (`app/admin`, `app/employee`) with matching API namespaces and interview template ownership via `ownerRole`.

## Key repository conventions

- **Prisma usage:** Prisma client is generated to `lib/prisma-client/`; application code should import the singleton from `@/lib/prisma` (not directly from generated client files).
- **Auth model:** Admin and employee auth are cookie-session based (`jb_admin_session`, `jb_employee_session`) with separate helpers in `lib/admin-auth.ts` and `lib/employee-auth.ts`.
- **Interview token handling:** Raw interview access tokens are only sent to candidates; persistence uses `accessTokenHash` and validation is done against the hash.
- **Template lifecycle:** Interview templates should remain inactive until AI instructions are generated via the template generation route; generated `systemInstructions` drive realtime interviewer behavior.
- **Role symmetry:** When adding interview/admin features, keep Admin and Employee variants aligned unless intentional divergence is required.
- **Streaming contract:** Chatbot responses stream as SSE chunks; suggested follow-up questions are parsed from the `[Suggested Questions]:` delimiter format before persisting.
