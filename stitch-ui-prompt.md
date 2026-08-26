# Stitch UI Prompt — Debate & Argument Stress Tester

You are a senior frontend engineer. Build a production-quality React UI for an AI Debate & Argument Stress Tester. The backend already exists (FastAPI + PostgreSQL + JWT auth). You must connect this UI to the backend REST API described below.

## Product Overview

A user submits a thesis, opinion, or business idea. The system runs an AI debate between three roles:

1. **Challenger** — attacks the thesis with multiple counter-arguments
2. **Defender** — responds to each Challenger argument
3. **Judge** — scores both sides (0–10) and declares a round winner

Debates run for 2 or 3 rounds. The user can create debates, watch progress in real time by polling, and review completed debates with all round details.

---

## Tech Stack

- React 18+ with TypeScript
- Vite
- Tailwind CSS (or a clean modern design system of your choice)
- React Router for navigation
- React Query (TanStack Query) for data fetching and caching
- Axios or fetch for HTTP
- No backend code — only frontend

---

## Backend API Contract

Base URL: configurable via env var `VITE_API_URL` (default `http://localhost:8000`)

### Auth

All auth endpoints are under `/api/auth`. JWT token stored in localStorage, sent as `Authorization: Bearer <token>` header.

| Method | Path | Body | Response | Notes |
|--------|------|------|----------|-------|
| POST | `/api/auth/register` | `{ email: string, password: string }` | `{ user: { id, email, created_at } }` | Email + password only. |
| POST | `/api/auth/login` | `{ email: string, password: string }` | `{ access_token: string, token_type: "bearer", user: { id, email } }` | Returns JWT. |
| GET | `/api/auth/me` | — | `{ id, email, created_at }` | Requires Bearer token. |

### Debates

All debate endpoints are under `/api/debates`. Require Bearer token.

| Method | Path | Body | Response | Notes |
|--------|------|------|----------|-------|
| POST | `/api/debates` | `{ thesis: string (10–5000 chars), rounds: 2 \| 3 }` | `DebateResponse` | Creates debate and starts async execution. |
| GET | `/api/debates?page=1&limit=20` | — | `{ items: DebateListItem[], page, limit, total }` | Paginated list of user's debates. |
| GET | `/api/debates/:id` | — | `DebateDetailResponse` | Full debate with all rounds. |
| GET | `/api/debates/:id/status` | — | `DebateStatusResponse` | Lightweight status poll. |

### Response Shapes

```ts
// DebateResponse (returned on create)
{
  id: string (uuid),
  thesis: string,
  rounds_count: number,        // 2 or 3
  status: "pending" | "running" | "completed" | "failed",
  current_round: number,
  current_agent: "challenger" | "defender" | "judge" | null,
  created_at: string (ISO)
}

// DebateListItem (for the list view)
{
  id: string,
  thesis: string,
  status: string,
  rounds_count: number,
  final_winner: "challenger" | "defender" | "draw" | null,
  final_challenger_score: number | null,
  final_defender_score: number | null,
  created_at: string
}

// DebateDetailResponse (full debate view)
{
  ...DebateResponse,
  final_winner: "challenger" | "defender" | "draw" | null,
  final_challenger_score: number | null,
  final_defender_score: number | null,
  final_verdict: string | null,
  completed_at: string | null,
  rounds: RoundResponse[]
}

// RoundResponse
{
  id: string,
  round_number: number,
  challenger_arguments: { title: string, argument: string }[] | null,
  defender_rebuttals: { argument_title: string, response: string }[] | null,
  challenger_score: number | null,
  defender_score: number | null,
  winner: string | null,
  judge_reason: string | null,
  strongest_argument: string | null,
  weakest_rebuttal: string | null,
  created_at: string
}

// DebateStatusResponse (lightweight polling)
{
  id: string,
  status: string,
  current_round: number,
  total_rounds: number,
  current_agent: string | null
}
```

---

## Pages / Routes

### 1. Landing / Login Page (`/login`)
- Clean hero section explaining the product.
- Toggle between **Sign Up** and **Log In** forms.
- Fields: email, password.
- On successful login, store JWT and redirect to `/dashboard`.
- Show validation errors (bad credentials, network errors).

### 2. Dashboard (`/dashboard`) — protected route
- Header with user email and a logout button.
- **Primary CTA**: big "Start New Debate" button → navigates to `/debate/new`.
- List of past debates as cards, sorted newest first. Each card shows:
  - Thesis (truncated to ~120 chars)
  - Status badge (pending / running / completed / failed)
  - Date created
  - If completed: winner badge (Challenger / Defender / Draw) + final scores
  - Click card → navigates to `/debate/:id`
- Pagination at the bottom if `total > limit`.

### 3. New Debate Page (`/debate/new`) — protected route
- Large textarea for the thesis (10–5000 chars) with live character counter.
- Radio or toggle for round count: **2 rounds** (default) or **3 rounds**.
- "Start Debate" submit button (disabled until thesis ≥ 10 chars).
- On submit: POST to create debate, then immediately redirect to `/debate/:id` (the live debate view).

### 4. Live Debate View (`/debate/:id`) — protected route
This is the main experience. It has two states:

#### A. Running state (status = `pending` or `running`)
- Show the thesis prominently at the top.
- Progress indicator: `Round X of Y — currently: [Challenger | Defender | Judge]`.
- Poll `GET /debates/:id/status` every **2–3 seconds** while status is not `completed` or `failed`.
- As rounds complete, render them live (fetch full detail via `GET /debates/:id` on each poll, or merge status + detail).
- Show a subtle loading/pulse animation on the current agent step.
- When status becomes `completed`, stop polling and render the final verdict section.

#### B. Completed / viewing state
- **Final Verdict Banner**: winner name, final scores (Challenger X / Defender Y), judge's final verdict text.
- **Rounds Accordion / Tabs**: one per round, each containing:
  - **Challenger's Arguments** — list of `{title, argument}` cards.
  - **Defender's Rebuttals** — list of `{argument_title, response}` cards, ideally paired visually with the argument they respond to.
  - **Judge's Scorecard** — scores, winner, reason, strongest argument, weakest rebuttal.
- If the debate failed, show an error state with a retry/back button.

### 5. Auth Error / 401 Handling
- If any API call returns 401, clear the token and redirect to `/login`.

---

## Design Requirements

- Dark mode friendly, modern, clean. Think "AI tool" aesthetic — subtle gradients, card-based layouts.
- Responsive (mobile-first, works on desktop).
- Loading states everywhere: skeletons for lists, spinners for buttons.
- Empty state on dashboard: "No debates yet. Start your first one!" with CTA.
- Use semantic colors: green for Defender wins, red for Challenger wins, neutral for draws.
- Scores displayed as progress bars or big numeric badges.

---

## State Management

- Auth state (token + user) in a context provider or Zustand store.
- Debate list and detail via React Query (auto-refetch on poll).
- Polling only while debate status is `pending` or `running`. Use `refetchInterval` in React Query.

---

## File Structure

```
src/
├── main.tsx
├── App.tsx
├── api/
│   ├── client.ts          # axios instance with auth interceptor
│   ├── auth.ts            # login, register, me
│   └── debates.ts         # create, list, detail, status
├── hooks/
│   ├── useAuth.ts
│   ├── useDebates.ts
│   └── useDebatePolling.ts
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── NewDebatePage.tsx
│   └── DebateDetailPage.tsx
├── components/
│   ├── ProtectedRoute.tsx
│   ├── DebateCard.tsx
│   ├── RoundView.tsx
│   ├── ScoreCard.tsx
│   └── StatusBadge.tsx
├── context/
│   └── AuthContext.tsx
└── types/
    └── index.ts           # all TS interfaces matching API shapes
```

---

## Constraints

- Do NOT build any backend code.
- Do NOT add features outside this spec (no social login, no file uploads, no WebSockets — polling only).
- All API calls go through a single configured axios/fetch client with the JWT header.
- Thesis input must enforce the 10–5000 char constraint client-side.
- Rounds choice must be exactly 2 or 3.
