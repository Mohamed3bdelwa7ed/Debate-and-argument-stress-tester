# DebateAI Frontend

React + Vite + Tailwind CSS frontend for the Debate & Argument Stress Tester.

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend running at `http://localhost:8000` (FastAPI)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

The default API URL is `http://localhost:8000`. Update `.env` if your backend runs elsewhere.

3. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Build

```bash
npm run build
```

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query (React Query)
- Axios
- Lucide React
- Framer Motion
- date-fns

## Features

- JWT authentication (login / register)
- Dashboard with debate history and pagination
- Create debate with thesis validation and round selection
- Live debate view with polling status timeline
- Completed debate view with winner banner, scores, and round accordion
- Responsive design following the DebateAI design system
