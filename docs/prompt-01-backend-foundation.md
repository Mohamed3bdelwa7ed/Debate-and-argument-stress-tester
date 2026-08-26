# Backend Prompt 1 of 2: Foundation, Auth, Database, and Debate Lifecycle Shell

## Context

This is the **first of two sequential prompts** for building the backend of the **Debate & Argument Stress Tester** MVP. It covers everything required to establish the project, the database, authentication, debate creation, debate listing, debate retrieval, status polling, and the orchestration shell that will later host the AI agents.

The second prompt will layer on the LLM service, the Challenger/Defender/Judge agents, and the full round-by-round execution logic.

## Technology Stack

Use exactly this stack:

* Python 3.11+
* FastAPI
* Uvicorn
* PostgreSQL
* SQLAlchemy 2.x with asyncpg
* Alembic
* Pydantic v2
* python-jose / passlib or equivalent for JWT and password hashing

## Scope of This Prompt

Build the backend up to the point where a user can:

1. Register an account.
2. Log in and receive a JWT.
3. Create a debate (thesis + rounds count).
4. List their own debates with pagination.
5. Retrieve a specific debate.
6. Poll the debate status endpoint.

Debate execution should be invoked from a background task, but the actual AI logic should be a **stub** in this phase. The stub must still move the debate through the correct states: pending → running → completed, advancing `current_round` and `current_agent`, and writing placeholder round data into the `debate_rounds` table.

Do NOT implement the real Challenger, Defender, or Judge agents here. Do NOT implement a real LLM client here. Use deterministic stubs that generate simple placeholder text so the workflow can be validated end-to-end.

## Architecture

Use a modular monolith with clear separation:

```text
backend/
├── app/
│   ├── main.py
│   ├── api/
│   │   ├── auth.py
│   │   └── debates.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── security.py
│   │   └── dependencies.py
│   ├── models/
│   │   ├── user.py
│   │   ├── debate.py
│   │   └── debate_round.py
│   ├── schemas/
│   │   ├── auth.py
│   │   └── debate.py
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── debate_service.py
│   │   └── llm_service_stub.py
│   └── agents/
│       ├── challenger_stub.py
│       ├── defender_stub.py
│       └── judge_stub.py
├── alembic/
├── tests/
├── .env.example
├── requirements.txt
├── alembic.ini
└── README.md
```

## Functional Requirements

### 1. Configuration and Database

Create a `core/config.py` that loads environment variables for:

* `DATABASE_URL` (PostgreSQL async URL)
* `SECRET_KEY`
* `ALGORITHM` (default HS256)
* `ACCESS_TOKEN_EXPIRE_MINUTES`
* Optional `LLM_API_KEY` and `LLM_BASE_URL` placeholders (read but not used yet)

Create `core/database.py` that:

* Uses SQLAlchemy 2.x async engine and async session.
* Provides a `get_db()` dependency yielding an async session.

Create Alembic configuration with an initial migration for the three tables described below.

### 2. Data Models

Create SQLAlchemy models that match these tables exactly.

#### `users`

* `id` — UUID primary key, default `gen_random_uuid()`.
* `email` — `VARCHAR(255)`, unique, not nullable.
* `password_hash` — `VARCHAR(255)`, not nullable.
* `created_at` — timestamp with timezone, default `now()`.
* `updated_at` — timestamp with timezone, default `now()`.

#### `debates`

* `id` — UUID primary key, default `gen_random_uuid()`.
* `user_id` — UUID foreign key referencing `users.id` with `ON DELETE CASCADE`.
* `thesis` — `TEXT`, not nullable.
* `rounds_count` — integer, not nullable.
* `status` — `VARCHAR(50)`, not nullable, default `pending`.
* `current_round` — integer, not nullable, default `0`.
* `current_agent` — `VARCHAR(50)`, nullable.
* `final_winner` — `VARCHAR(50)`, nullable.
* `final_challenger_score` — `NUMERIC(4,2)`, nullable.
* `final_defender_score` — `NUMERIC(4,2)`, nullable.
* `final_verdict` — `TEXT`, nullable.
* `created_at` — timestamp with timezone, default `now()`.
* `completed_at` — timestamp with timezone, nullable.
* `updated_at` — timestamp with timezone, default `now()`.

#### `debate_rounds`

* `id` — UUID primary key, default `gen_random_uuid()`.
* `debate_id` — UUID foreign key referencing `debates.id` with `ON DELETE CASCADE`.
* `round_number` — integer, not nullable.
* `challenger_arguments` — JSONB, nullable.
* `defender_rebuttals` — JSONB, nullable.
* `challenger_score` — `NUMERIC(4,2)`, nullable.
* `defender_score` — `NUMERIC(4,2)`, nullable.
* `winner` — `VARCHAR(50)`, nullable.
* `judge_reason` — `TEXT`, nullable.
* `strongest_argument` — `TEXT`, nullable.
* `weakest_rebuttal` — `TEXT`, nullable.
* `created_at` — timestamp with timezone, default `now()`.
* `updated_at` — timestamp with timezone, default `now()`.

Add indexes on `debates.user_id`, `debates.status`, `debate_rounds.debate_id`, and `debate_rounds.round_number`.

### 3. Authentication

Implement password hashing using a secure algorithm such as bcrypt.

Implement JWT creation with payload containing `sub` = user ID and `exp` = expiration time.

Create a dependency that extracts and validates the JWT from the `Authorization: Bearer <token>` header and returns the current user object from the database.

Return `401` with code `AUTH_INVALID_TOKEN` if the token is missing, expired, or invalid.

Normalize emails to lowercase before storage and lookup.

### 4. Auth Endpoints

Implement exactly these endpoints.

#### POST /api/auth/register

Request body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Validation:

* Email must be valid.
* Password must be at least 8 characters.
* Email must be unique.

Response:

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

Return `409` with code `AUTH_EMAIL_EXISTS` if the email already exists.

#### POST /api/auth/login

Request body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response on success:

```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

Return `401` with code `AUTH_INVALID_CREDENTIALS` if the email or password is wrong.

#### GET /api/auth/me

Requires valid JWT.

Response:

```json
{
  "id": "uuid",
  "email": "user@example.com"
}
```

### 5. Debate Endpoints (Shell)

Implement exactly these endpoints. The debate object must belong to the authenticated user.

#### POST /api/debates

Requires authentication.

Request body:

```json
{
  "thesis": "I want to build an AI tutor for university students.",
  "rounds": 2
}
```

Validation:

* `thesis`: 10 to 5000 characters.
* `rounds`: optional, default `2`, must be either `2` or `3` if provided.

Response immediately after creation:

```json
{
  "id": "debate-uuid",
  "thesis": "I want to build an AI tutor for university students.",
  "rounds_count": 2,
  "status": "pending",
  "current_round": 0,
  "current_agent": null,
  "created_at": "2026-08-26T10:00:00Z"
}
```

After creation, start debate execution in a FastAPI background task. Do not use Celery, Redis, RabbitMQ, or any external queue.

Return `422` with code `DEBATE_INVALID_ROUNDS` if rounds is not 2 or 3.
Return `422` with code `DEBATE_INVALID_THESIS` if the thesis length is out of bounds.

#### GET /api/debates

Requires authentication.

Query parameters:

* `page`: integer, default `1`, min `1`.
* `limit`: integer, default `20`, max `100`.

Return only debates where `user_id == current_user.id`.

Response:

```json
{
  "items": [
    {
      "id": "uuid",
      "thesis": "I want to build an AI tutor...",
      "status": "completed",
      "rounds_count": 2,
      "winner": "challenger",
      "challenger_score": 0.0,
      "defender_score": 0.0,
      "created_at": "2026-08-26T10:00:00Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

#### GET /api/debates/{debate_id}

Requires authentication.

Return the full debate including all rounds, ordered by `round_number` ascending.

Response must include:

```json
{
  "id": "uuid",
  "thesis": "...",
  "status": "completed",
  "rounds_count": 2,
  "current_round": 2,
  "current_agent": null,
  "final_winner": "challenger",
  "final_challenger_score": 5.0,
  "final_defender_score": 4.0,
  "final_verdict": "Stub verdict generated by judge stub.",
  "created_at": "2026-08-26T10:00:00Z",
  "completed_at": "2026-08-26T10:00:10Z",
  "updated_at": "2026-08-26T10:00:10Z",
  "rounds": [
    {
      "id": "uuid",
      "round_number": 1,
      "challenger_arguments": [...],
      "defender_rebuttals": [...],
      "challenger_score": 5.0,
      "defender_score": 4.0,
      "winner": "challenger",
      "judge_reason": "...",
      "strongest_argument": "...",
      "weakest_rebuttal": "..."
    }
  ]
}
```

Return `404` with code `DEBATE_NOT_FOUND` if the debate does not exist or does not belong to the current user. Do not leak existence.

#### GET /api/debates/{debate_id}/status

Requires authentication.

Response:

```json
{
  "id": "uuid",
  "status": "running",
  "current_round": 1,
  "total_rounds": 2,
  "current_agent": "defender"
}
```

Return `404` with code `DEBATE_NOT_FOUND` if the debate does not exist or does not belong to the current user.

### 6. Debate Execution Stub

Implement a `DebateService` that runs the debate in a background task using this exact workflow:

```text
status = running
current_agent = challenger
for each round in 1..rounds_count:
    current_round = round
    current_agent = challenger
    run challenger stub -> save challenger_arguments to debate_rounds
    current_agent = defender
    run defender stub -> save defender_rebuttals to debate_rounds
    current_agent = judge
    run judge stub -> save scores, winner, reason, strongest_argument, weakest_rebuttal
after final round:
    status = completed
    current_agent = null
    current_round = rounds_count
    set final_winner, final_challenger_score, final_defender_score, final_verdict
    completed_at = now()
```

Each stub returns deterministic placeholder data that conforms to the expected JSON shapes described in the main PRD sections 15–17. Use simple strings and numeric values. For example, the challenger stub can always return two generic arguments, the defender stub can return one rebuttal per argument, and the judge stub can return a fixed winner and scores.

If a debate is already running and another creation or start is attempted for the same debate, return `409` with code `DEBATE_ALREADY_RUNNING`.

If any exception occurs during execution, set `status = failed` and `current_agent = null`.

### 7. Error Handling

Return consistent JSON errors:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message."
  }
}
```

Required error codes for this prompt:

* `AUTH_EMAIL_EXISTS`
* `AUTH_INVALID_CREDENTIALS`
* `AUTH_INVALID_TOKEN`
* `DEBATE_NOT_FOUND`
* `DEBATE_INVALID_ROUNDS`
* `DEBATE_INVALID_THESIS`
* `DEBATE_ALREADY_RUNNING`
* `INTERNAL_SERVER_ERROR`

Use appropriate HTTP status codes:

* `400` for generic validation failures.
* `401` for authentication failures.
* `404` for debates not found.
* `409` for conflicts such as already-running debates.
* `422` for Pydantic validation errors mapped to known codes.
* `500` for unexpected internal errors.

### 8. Logging

Log key events:

* Debate created.
* Debate execution started.
* Each agent phase started and completed.
* Debate completed or failed.

Use Python's standard `logging` module. Keep logs concise and free of sensitive data.

### 9. Testing

Add unit tests for:

* User registration and login, including password hashing.
* JWT validation.
* Debate creation and ownership enforcement.
* Debate listing pagination.
* Debate status endpoint visibility restrictions.
* Debate execution stub completing all rounds and updating final fields.

Use pytest and an async test client. Use an in-memory or test PostgreSQL database if feasible.

### 10. Documentation

Add a `README.md` in `backend/` with:

* Project overview.
* Technology stack.
* Environment variables required.
* How to run migrations.
* How to start the development server.
* How to run tests.

## Explicit Do-Not-Do List

Do NOT implement real LLM calls.
Do NOT implement LangChain, LangGraph, or similar orchestration frameworks.
Do NOT add Redis, Celery, RabbitMQ, Kafka, or WebSockets.
Do NOT add RAG, vector embeddings, web search, or file uploads.
Do NOT add payment, subscriptions, admin dashboard, team system, social login, email verification, or password reset.
Do NOT expose individual `/api/challenger`, `/api/defender`, or `/api/judge` endpoints.
Do NOT build any frontend code.

## Completion Criteria

At the end of this prompt, the backend should be runnable, migrations should be executable, the auth endpoints should work, and the debate endpoints should allow creating a debate and polling it to completion using stubbed AI logic. The second prompt will replace the stubs with real LLM-driven agents.
