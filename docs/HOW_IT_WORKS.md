# Vocalutor — Architecture & Technical Deep-Dive

This document provides a comprehensive technical walkthrough of how **Vocalutor** works under the hood — from real-time WebRTC audio streaming to AI session recaps, quota governance, streak calculation algorithms, and secure database isolation.

---

## 1. Real-Time Spoken Voice Pipeline (Vapi + Deepgram + ElevenLabs + GPT-4)

### High-Level Topology
```
[ User Microphone ]
       │ WebRTC Audio Stream
       ▼
[ Vapi AI Orchestrator ]
  ├── Speech-to-Text: Deepgram Nova-3 (sub-300ms transcription)
  ├── Reasoning & Dialogue: OpenAI GPT-4 with Pedagogical Voice Prompt
  └── Text-to-Speech: ElevenLabs Turbo v2 (low-latency lifelike audio)
       │ WebRTC Audio Stream
       ▼
[ User Speakers / Headphones ]
```

### Session Lifecycle (`components/CompanionComponents.tsx`)
1. **Pre-Flight Quota Check:** Before starting a voice call, `getVoiceQuota()` calculates remaining daily seconds for the authenticated user. If remaining seconds are below `MIN_CALL_SECONDS` (30s), the call is blocked and the user is prompted to upgrade or wait for quota reset.
2. **Assistant Configuration:** `configureAssistant(voice, style)` in `lib/utils.ts` configures:
   - Voice models and styles (e.g. `voices.male.casual`, `voices.female.formal`).
   - First message / greeting tailored to the companion subject and topic.
   - Guardrailed system instructions enforcing concise, natural spoken responses without Markdown, tables, or asterisks.
3. **WebRTC Connection:** `vapi.start(...)` initiates a low-latency WebRTC connection.
4. **Interactive State:**
   - `speech-start` & `speech-end` events toggle real-time Lottie soundwave visualizations.
   - `message` events capture partial and final transcripts for live conversation rendering.
5. **Session Teardown:**
   - When either participant disconnects, `onCallEnd` fires.
   - The session record is created first via `addToSessionHistory`, which returns the generated `session_history` UUID.
   - Spoken call duration is captured and written to `voice_usage` via `recordVoiceUsage`, passing that UUID as `sessionId`.

---

## 2. Daily Voice-Minute Quota Guardrails

### Tier Limits (`lib/limits.ts`)
| Tier | Daily Allowance | Max Session Duration |
| :--- | :--- | :--- |
| **Free** | 15 minutes (900s) | 8 minutes (480s) |
| **Pro** | 60 minutes (3600s) | 20 minutes (1200s) |

### Pure Calculation Engine (`lib/compute-quota.ts`)
- `computeQuota(plan, usedSeconds)` calculates remaining seconds, determines whether calls are permitted (`remainingSeconds >= MIN_CALL_SECONDS`), and caps the session duration to `min(tierMaxSession, remainingSeconds)`.
- Tested with 10 unit tests covering zero-usage, fractional seconds, over-usage boundaries, and plan fallbacks.

### Double-Layer Enforcement
1. **Client-Side:** Countdown timer actively counts down remaining call time and triggers graceful disconnection 15 seconds before quota expiry.
2. **Server-Side & Telephony:** `maxDurationSeconds` is passed into Vapi session initialization, ensuring hard telephony termination even if the browser crashes or drops connection.

---

## 3. Learning Analytics & Streak Computation

### Streak Algorithm (`lib/compute-streak.ts`)
- Standard UTC calculations break streaks across global timezones. `computeStreak(dates, timezone)` maps session timestamps to local calendar day strings (`YYYY-MM-DD`) in the user's IANA timezone (synced via `components/dashboard/TimezoneSync.tsx`).
- Deduplicates multiple sessions in a single day.
- Checks if the user studied today or yesterday to maintain consecutive day streaks.
- Tested with 11 unit tests across timezone boundaries, month roll-overs, and leap years.

### Analytics Dashboard (`app/dashboard/page.tsx`)
- **Activity Area Chart (`ActivityChart.tsx`):** 14-day rolling activity area chart powered by Recharts (dynamically imported with `ssr: false` to eliminate hydration mismatch).
- **Subject Distribution (`SubjectChart.tsx`):** Bar chart breaking down total study minutes across subjects.
- **Weekly Goal Progress Ring (`GoalProgressRing.tsx`):** SVG circular progress indicator computing completion percentage against user targets.

---

## 4. Security & Authentication Architecture

### Clerk + Supabase JWT Passthrough
```
[ Browser / Client ]
       │ Authenticated with Clerk
       ▼
[ Next.js Server Action / Route ]
  - auth() retrieves Clerk session JWT
       ▼
[ Supabase Client Factory (lib/supabase.ts) ]
  - Passes Authorization: Bearer <clerk_token>
       ▼
[ PostgreSQL Row Level Security (RLS) ]
  - Verifies (auth.jwt() ->> 'sub') = user_id
```

- **Clerk String IDs vs. Supabase UUIDs:**
  - Standard Supabase Auth uses UUIDs. Clerk uses alphanumeric strings (`user_...`).
  - In Supabase, the built-in function `auth.uid()` contains an internal cast `(request.jwt.claim.sub)::uuid`.
  - When using Clerk JWTs with Supabase, calling `auth.uid()` throws `invalid input syntax for type uuid: "user_..."`.
  - **Resolution:** All RLS policies in `20261124190000_core_tables_rls.sql` strictly use `(auth.jwt() ->> 'sub') = user_id` and all `user_id`/`author` columns are typed as `TEXT`.

### Defense-in-Depth Application Layers
1. **Default-Deny Middleware Routing (`middleware.ts`):** All routes outside the explicit public allowlist (`/`, `/sign-in(.*)`, `/sign-up(.*)`, `/companions`, `/subscription`) require `await auth.protect()`.
2. **Server-Side Authorization & Quota Enforcement:** Server Actions (`'use server'`) cannot be bypassed by calling them directly over HTTP POST. Each action re-verifies `auth().userId` and enforces companion creation caps via `newCompanionPermissions`.
3. **Zod Schema Validation & Input Sanitization:** Form payloads are validated with Zod schemas on the server, and search/filter inputs are sanitized of PostgREST delimiters (`[,()]`) to prevent filter injection.
4. **Fail-Fast Environment Validation (`lib/env.ts`):** Verifies all critical production credentials on server startup, preventing silent failures.
5. **Zero Secret Exposure:** Zero service role keys or database credentials are exposed to the client. `.env.local` is strictly ignored by `.gitignore`.

---

## 5. Testing & CI Pipeline

- **Unit Testing:** Vitest configured for isolated module execution with alias resolution (`@/*`) and PostCSS bypass.
- **GitHub Actions CI (`.github/workflows/ci.yml`):**
  1. `typecheck`: Runs `tsc --noEmit` and `npm run lint`.
  2. `unit-tests`: Runs Vitest test suites.
  3. `build`: Next.js production build verification gated behind typecheck and tests.

---

## 6. Multi-Strategy Clerk Subscription Resolution (`lib/auth-plan.ts`)

In Clerk Billing, plans created with custom names (such as "Pro Companion") do not always yield the bare slug `"pro"`. Depending on configuration, Clerk generates slugs like `pro_companion`, `pro-companion`, or `pro_companions`. Additionally, feature entitlements and JWT claims may carry the plan state differently.

To guarantee that subscribers on any variation of the Pro Companion tier always receive their entitlements:
```
[ Incoming Request / User Session ]
                 │
                 ▼
[ isUserProPlan() in lib/auth-plan.ts ]
  ├── 1. Check known plan slugs via auth().has({ plan: slug })
  │      ['pro', 'pro_companion', 'pro-companion', 'pro_companions', ...]
  ├── 2. Check feature flags via auth().has({ feature: feat })
  │      ['unlimited_companions', 'pro_companion', 'pro_voice']
  ├── 3. Parse raw JWT claims in sessionClaims (sessionClaims.pla / fea)
  └── 4. Inspect user publicMetadata / unsafeMetadata fallback
                 │
                 ▼
        Returns true / false
```

- When `true`:
  - `newCompanionPermissions()` grants **unlimited companion creation**.
  - `getUserPlan()` classifies user as `"pro"`, allocating **60 minutes/day** and **20 minutes/session**.
- When `false`:
  - Free tier limits apply (up to 3 companions, 15 minutes/day, 8 minutes/session).

---

## 7. WebRTC Audio Engine & Daily.js Transport

Real-time audio streaming between the learner and the AI tutor runs via Vapi AI orchestrating Daily.co WebRTC rooms.

- `@vapi-ai/web@3.1.0` is matched with `@daily-co/daily-js@0.95.0`.
- An explicit override in `package.json` pins `@daily-co/daily-js` to prevent older dependencies from resolving deprecated Daily client builds (such as `0.80.0` which causes instant meeting ejections).
- Audio frames are streamed over bidirectional WebRTC with Opus audio encoding, ensuring sub-second round-trip voice interaction.

---

## 8. Session Finalization & Foreign-Key Integrity

When a voice lesson concludes, the teardown sequence follows a resilient 2-step transaction:

1. **Session Record Creation:** `addToSessionHistory(companionId)` writes to `session_history` and returns the generated UUID via `.select()`.
2. **Usage Persistence:** `recordVoiceUsage` receives `sessionHistoryRecord.id` as `sessionId` and logs the exact spoken seconds to `voice_usage`.
3. **Foreign-Key Retry Handler:** If a race condition or database constraint violation occurs (`error.code === "23503"`), `recordVoiceUsage` automatically retries the insert with `session_id: null`. Spoken time is never lost, and daily quota meters remain 100% accurate.