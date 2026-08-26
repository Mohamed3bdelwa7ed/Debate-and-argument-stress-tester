# Stitch UI Design Prompt — Debate & Argument Stress Tester

You are a senior frontend engineer and UI/UX designer. Build a **best-in-class, visually stunning React UI** for the AI Debate & Argument Stress Tester. The backend already exists (FastAPI + PostgreSQL + JWT auth) and is running at `http://localhost:8000`. Your job is **frontend only**.

## Goal

Create a polished, modern, AI-tool aesthetic web app that makes debating a thesis feel like a high-end product experience. The UI should feel intentional, responsive, and delightful to use.

---

## Tech Stack (non-negotiable)

- React 18+ with TypeScript
- Vite
- Tailwind CSS v3+
- React Router v6+
- TanStack Query (React Query) v5
- Axios
- Lucide React for icons
- Framer Motion for animations
- date-fns for formatting

---

## Design System

### Color Palette (Dark Mode First)

Use a sophisticated dark theme as the default. Support light mode optionally.

**Dark Mode:**
- Background: `#0B0F19` (near-black with subtle blue undertone)
- Surface: `#111827` (cards, panels)
- Surface Elevated: `#1F2937`
- Border: `#374151`
- Text Primary: `#F9FAFB`
- Text Secondary: `#9CA3AF`
- Text Muted: `#6B7280`
- Accent Primary: `#6366F1` (indigo)
- Accent Secondary: `#8B5CF6` (violet)
- Accent Gradient: `linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)`
- Challenger: `#F43F5E` (rose)
- Defender: `#10B981` (emerald)
- Judge: `#F59E0B` (amber)
- Success: `#22C55E`
- Error: `#EF4444`
- Warning: `#F59E0B`

**Light Mode (optional):**
- Background: `#F8FAFC`
- Surface: `#FFFFFF`
- Text Primary: `#0F172A`
- Text Secondary: `#475569`
- Accent Primary: `#4F46E5`

### Typography

- Use Tailwind's default sans stack, but set `font-sans` to `"Inter", system-ui, sans-serif`.
- Headings: `font-semibold` to `font-bold`, tight letter-spacing.
- Body: `text-sm` to `text-base`, comfortable line height.
- Monospace accents for scores and technical labels: `font-mono`.

### Spacing & Radius

- Use consistent spacing scale: cards `p-6`, sections `py-12` or `py-16`.
- Border radius: `rounded-2xl` for cards, `rounded-xl` for buttons, `rounded-full` for pills.
- Subtle borders with low opacity: `border border-gray-700/50`.

### Effects

- Subtle background gradient mesh or radial glow behind hero sections.
- Cards: `shadow-xl shadow-black/20`.
- Hover states: `hover:scale-[1.01]` or `hover:-translate-y-0.5` with `transition-all duration-300`.
- Focus rings: `ring-2 ring-indigo-500/50 ring-offset-2 ring-offset-gray-900`.

---

## Product Flow

```
Landing / Login → Dashboard → New Debate → Live Debate → Completed Debate
```

---

## Backend API Contract

Base URL: configurable via env var `VITE_API_URL` (default `http://localhost:8000`)

### Auth

All auth endpoints are under `/api/auth`. JWT token stored in `localStorage`, sent as `Authorization: Bearer <token>`.

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/auth/register` | `{ email: string, password: string }` | `{ user: { id, email } }` |
| POST | `/api/auth/login` | `{ email: string, password: string }` | `{ access_token: string, token_type: "bearer", user: { id, email } }` |
| GET | `/api/auth/me` | — | `{ id, email }` |

### Debates

All debate endpoints are under `/api/debates`. Require Bearer token.

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/debates` | `{ thesis: string (10–5000 chars), rounds: 2 \| 3 }` | `DebateResponse` |
| GET | `/api/debates?page=1&limit=20` | — | `{ items: DebateListItem[], page, limit, total }` |
| GET | `/api/debates/:id` | — | `DebateDetailResponse` |
| GET | `/api/debates/:id/status` | — | `DebateStatusResponse` |

### TypeScript Interfaces

```ts
export interface DebateResponse {
  id: string;
  thesis: string;
  rounds_count: number;
  status: "pending" | "running" | "completed" | "failed";
  current_round: number;
  current_agent: "challenger" | "defender" | "judge" | null;
  created_at: string;
}

export interface DebateListItem extends DebateResponse {
  final_winner: "challenger" | "defender" | "tie" | null;
  final_challenger_score: number | null;
  final_defender_score: number | null;
}

export interface ChallengerArgument {
  title: string;
  argument: string;
}

export interface DefenderRebuttal {
  argument_title: string;
  response: string;
}

export interface RoundResponse {
  id: string;
  round_number: number;
  challenger_arguments: ChallengerArgument[] | null;
  defender_rebuttals: DefenderRebuttal[] | null;
  challenger_score: number | null;
  defender_score: number | null;
  winner: "challenger" | "defender" | "tie" | null;
  judge_reason: string | null;
  strongest_argument: string | null;
  weakest_rebuttal: string | null;
  created_at: string;
}

export interface DebateDetailResponse extends DebateResponse {
  final_winner: "challenger" | "defender" | "tie" | null;
  final_challenger_score: number | null;
  final_defender_score: number | null;
  final_verdict: string | null;
  completed_at: string | null;
  rounds: RoundResponse[];
}

export interface DebateStatusResponse {
  id: string;
  status: string;
  current_round: number;
  total_rounds: number;
  current_agent: string | null;
}
```

---

## Pages & Routes

### 1. Login / Landing Page (`/login`)

- Full-height dark gradient background with subtle animated radial glow.
- Centered glassmorphism card (`backdrop-blur-xl`, `bg-gray-900/60`, `border-gray-700/50`).
- Product title with gradient text: "Debate & Argument Stress Tester".
- Subtitle: "Test your ideas against AI-powered opposition."
- Toggle between **Sign In** and **Create Account** tabs.
- Inputs with floating labels and validation states.
- Primary CTA button with gradient background and hover glow.
- Show errors inline with shake animation on invalid submit.
- On success, store JWT + user, redirect to `/dashboard`.

### 2. Dashboard (`/dashboard`)

- Fixed top navigation bar with logo, user email, and logout button.
- Hero section with title and a large gradient **"New Debate"** button.
- Stats row (optional): total debates, completed, last winner.
- Debate grid:
  - Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop.
  - Each card is a surface card with:
    - Thesis excerpt (truncated to 2 lines)
    - Status badge as a colored pill
    - Date created
    - If completed: trophy icon + winner name + score chips
    - Hover lift effect
  - Empty state with illustration or icon and CTA.
- Pagination if `total > limit`.

### 3. New Debate Page (`/debate/new`)

- Clean centered layout.
- Large textarea for thesis with animated character counter.
- Round selector: two large clickable cards — **2 Rounds** (default) and **3 Rounds**.
- Validation: thesis must be 10–5000 chars; button disabled otherwise.
- Submit button: gradient + loading spinner while creating.
- On submit, redirect immediately to `/debate/:id`.

### 4. Live / Detail Debate Page (`/debate/:id`)

This is the centerpiece. It has two states:

#### A. Running State (`pending` or `running`)

- Large thesis banner at top.
- **Animated timeline** showing rounds and agents:
  ```
  Round 1 / 2
  [● Challenger] → [○ Defender] → [○ Judge]
  ```
  - Completed steps: filled circle with checkmark.
  - Current step: pulsing ring animation.
  - Future steps: muted outline.
- Live status text: "Round 1 — Challenger is attacking the thesis..."
- Poll `GET /debates/:id/status` every 2.5 seconds.
- Merge with `GET /debates/:id` to render completed rounds as they become available.
- Use skeleton cards while content loads.

#### B. Completed State

- **Hero Verdict Banner** spanning full width:
  - Gradient background based on winner (rose for Challenger, emerald for Defender, amber for tie).
  - Trophy or scale icon.
  - Big winner text: "Challenger Wins" / "Defender Wins" / "It's a Tie".
  - Final scores as large numbers with progress bars underneath.
  - Verdict paragraph below.

- **Rounds Section** as an accordion or vertical timeline:
  - Each round is a card with a header: "Round 1", scores, winner badge.
  - Inside the round:
    - **Challenger's Arguments**: cards with title and argument text, rose left border.
    - **Defender's Rebuttals**: visually paired beneath the argument they address, emerald left border.
    - **Judge's Scorecard**: score chips, winner badge, reason, strongest argument, weakest rebuttal.
  - Animate accordion open/close with Framer Motion.

#### C. Failed State

- Error illustration or icon.
- Message: "This debate could not be completed."
- "Back to Dashboard" button.

---

## Animation & Interaction Requirements

- Page transitions: fade/slide using Framer Motion.
- Card hover: subtle lift + shadow increase.
- Button hover: gradient shift or glow pulse.
- Loading states: pulse skeletons, spinning loader on buttons.
- Status timeline: step transitions with spring animation.
- New round appearing: slide-up + fade-in.
- Score numbers: count-up animation when revealed.
- Toast notifications for errors (e.g., login failed, network error).

---

## Components to Build

At minimum, create these reusable components in `src/components/`:

- `Button` — gradient, outline, ghost variants; loading state.
- `Card` — surface card wrapper.
- `StatusBadge` — colored pill for statuses.
- `ScoreChip` — big numeric score with label.
- `WinnerBanner` — final verdict hero.
- `RoundAccordion` — round content with animations.
- `ArgumentCard` — Challenger argument.
- `RebuttalCard` — Defender rebuttal.
- `JudgeScorecard` — judge result card.
- `TimelineStep` — live debate progress step.
- `SkeletonCard` / `SkeletonList` — loading placeholders.
- `EmptyState` — no debates yet.
- `ProtectedRoute` — redirect to login if no token.

---

## State Management

- Auth: React Context or Zustand store.
  - Store token + user in `localStorage`.
  - Axios instance with request interceptor to inject `Authorization: Bearer <token>`.
  - Response interceptor: on 401, clear auth and redirect to `/login`.
- Data fetching: TanStack Query.
  - `useDebates(page)` for paginated list.
  - `useDebate(id)` for detail.
  - `useDebateStatus(id)` with `refetchInterval` while status is `pending` or `running`.
  - `useCreateDebate()` mutation.

---

## File Structure

```
frontend/
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
├── .env.example
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   └── index.ts
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   └── debates.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDebates.ts
│   │   ├── useDebate.ts
│   │   └── useDebateStatus.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Skeleton.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── ScoreChip.tsx
│   │   ├── WinnerBanner.tsx
│   │   ├── RoundAccordion.tsx
│   │   ├── ArgumentCard.tsx
│   │   ├── RebuttalCard.tsx
│   │   ├── JudgeScorecard.tsx
│   │   ├── Timeline.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── Navbar.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── NewDebatePage.tsx
│   │   └── DebatePage.tsx
│   └── utils/
│       └── format.ts
```

---

## Constraints

- Do NOT write any backend code.
- Do NOT use WebSockets or Server-Sent Events. Use polling only.
- Thesis input must enforce 10–5000 characters client-side.
- Rounds must be exactly 2 or 3.
- Use the exact API paths above.
- All API calls must include the Bearer token.

---

## Deliverables

1. A fully functional React + Vite + Tailwind frontend in a `frontend/` directory.
2. `README.md` in `frontend/` with setup instructions.
3. `.env.example` with `VITE_API_URL=http://localhost:8000`.
4. The app must compile and run with `npm install && npm run dev`.

---

## Final Instruction

Make this UI feel like a premium product. Prioritize readability, hierarchy, motion, and delight. Every interaction should be smooth. The debate viewing experience should be the highlight of the app.
