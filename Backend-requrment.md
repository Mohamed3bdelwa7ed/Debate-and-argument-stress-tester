# Backend MVP PRD

## Debate & Argument Stress Tester

---

# 1. Role

You are a senior backend engineer.

Build ONLY the backend for the MVP described in this document.

Do NOT build frontend code.

Do NOT add features that are outside the scope of this PRD.

The backend must be production-structured but MVP-sized.

---

# 2. Product

The product is an AI Debate & Argument Stress Tester.

A user submits a thesis, opinion, or business idea.

The backend runs an AI debate using three roles:

1. Challenger
2. Defender
3. Judge

The debate runs for 2 or 3 rounds.

The Challenger attacks the thesis.

The Defender responds to the Challenger.

The Judge evaluates both sides and scores them.

The system stores the debate so the user can view it later.

---

# 3. MVP Goal

The only goal of this backend MVP is to support this flow:

```text
User
  |
  v
Create Debate
  |
  v
Round 1
  |
  +--> Challenger
  |
  +--> Defender
  |
  +--> Judge
  |
  v
Round 2
  |
  +--> Challenger
  |
  +--> Defender
  |
  +--> Judge
  |
  v
Final Result
  |
  v
Save Debate
```

Optional:

```text
Round 3
```

if the user selects 3 rounds.

---

# 4. Technology Requirements

Use:

* Python 3.11+
* FastAPI
* Uvicorn
* PostgreSQL
* SQLAlchemy 2.x
* Alembic
* Pydantic v2
* asyncpg
* JWT authentication
* Password hashing
* An OpenAI-compatible LLM API

Use asynchronous code where appropriate.

Do NOT introduce unnecessary frameworks.

---

# 5. Explicitly DO NOT Use

Do not add:

* LangChain
* LangGraph
* Qdrant
* pgvector
* Redis
* Celery
* RabbitMQ
* Kafka
* WebSockets
* RAG
* Vector embeddings
* Web search
* Multiple AI agents as separate microservices
* Microservice architecture
* Payment system
* Subscription system
* Admin dashboard
* Team system
* Social login
* Email verification
* Password reset
* Complex AI memory
* File uploads

These are outside the MVP.

---

# 6. Architecture

Use a simple modular monolith.

```text
FastAPI
   |
   +-- API Layer
   |
   +-- Service Layer
   |
   +-- Agent Layer
   |
   +-- Database Layer
   |
   +-- LLM Service
```

Recommended structure:

```text
backend/
│
├── app/
│   │
│   ├── main.py
│   │
│   ├── api/
│   │   ├── auth.py
│   │   └── debates.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── debate.py
│   │   └── debate_round.py
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   └── debate.py
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── debate_service.py
│   │   └── llm_service.py
│   │
│   ├── agents/
│   │   ├── challenger.py
│   │   ├── defender.py
│   │   └── judge.py
│   │
│   └── prompts/
│       ├── challenger.txt
│       ├── defender.txt
│       └── judge.txt
│
├── alembic/
│
├── tests/
│
├── .env.example
├── requirements.txt
├── alembic.ini
└── README.md
```

You may adjust the structure slightly if there is a strong technical reason, but keep the same separation of responsibilities.

---

# 7. Database

Use PostgreSQL.

There are only three required tables.

---

## 7.1 users

Fields:

```text
id
email
password_hash
created_at
updated_at
```

Requirements:

* `id` should be UUID.
* `email` must be unique.
* Email should be normalized to lowercase.
* Password must never be stored in plaintext.
* Use a secure password hashing algorithm.

---

## 7.2 debates

Fields:

```text
id
user_id
thesis
rounds_count
status
current_round
current_agent

final_winner
final_challenger_score
final_defender_score
final_verdict

created_at
completed_at
updated_at
```

Status values:

```text
pending
running
completed
failed
```

Current agent values:

```text
challenger
defender
judge
null
```

Winner values:

```text
challenger
defender
tie
null
```

Relationships:

```text
users 1 ---- N debates
```

---

## 7.3 debate_rounds

Fields:

```text
id
debate_id
round_number

challenger_arguments
defender_rebuttals

challenger_score
defender_score

winner
judge_reason

strongest_argument
weakest_rebuttal

created_at
updated_at
```

`challenger_arguments` and `defender_rebuttals` can be stored as PostgreSQL JSONB.

Relationship:

```text
debates 1 ---- N debate_rounds
```

---

# 8. Authentication

Implement simple JWT authentication.

The user must be able to:

1. Register
2. Login
3. Get current user

JWT should contain the user's ID.

Never accept `user_id` from the frontend when performing protected operations.

The backend must identify the user from the JWT.

---

# 9. Authentication Endpoints

## POST /api/auth/register

Request:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Validation:

* Valid email.
* Password minimum 8 characters.
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

Do not return `password_hash`.

---

## POST /api/auth/login

Request:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

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

---

## GET /api/auth/me

Requires authentication.

Response:

```json
{
  "id": "uuid",
  "email": "user@example.com"
}
```

---

# 10. Debate API

The backend must expose only these core debate endpoints:

```text
POST /api/debates
GET  /api/debates
GET  /api/debates/{debate_id}
GET  /api/debates/{debate_id}/status
```

---

# 11. POST /api/debates

Creates a new debate.

Authentication required.

Request:

```json
{
  "thesis": "I want to build an AI tutor for university students.",
  "rounds": 2
}
```

Validation:

### thesis

Minimum:

```text
10 characters
```

Maximum:

```text
5000 characters
```

### rounds

Allowed:

```text
2
3
```

Default:

```text
2
```

The backend must associate the debate with the authenticated user.

The frontend must NOT send `user_id`.

---

# 12. Debate Creation Response

Return immediately after creating the debate.

Example:

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

The debate execution should then start.

For the first MVP implementation, it is acceptable to execute the debate in a FastAPI background task.

Do NOT introduce Celery, Redis, RabbitMQ, or another job queue.

---

# 13. Debate Execution

The Debate Service controls the entire workflow.

Never expose individual Challenger, Defender, or Judge endpoints.

The frontend should NOT call:

```text
/api/challenger
/api/defender
/api/judge
```

The frontend only creates and reads debates.

---

# 14. Debate Workflow

For each round:

```text
1. Set status = running
2. Set current_agent = challenger
3. Run Challenger
4. Save Challenger output
5. Set current_agent = defender
6. Run Defender
7. Save Defender output
8. Set current_agent = judge
9. Run Judge
10. Save Judge result
11. Move to next round
```

After the final round:

```text
status = completed
current_agent = null
current_round = rounds_count
```

Then calculate and store the final result.

---

# 15. Challenger Agent

Create a dedicated Challenger service/class.

Input:

```text
thesis
previous rounds
previous arguments
previous judge results
current round
```

Goal:

Generate the strongest counterarguments against the thesis.

The Challenger should:

* Attack the idea, not the user.
* Look for weaknesses.
* Avoid repeating previous arguments.
* Consider previous defenses.
* Focus on meaningful objections.
* Be skeptical.
* Not blindly invent factual claims.

Expected structured output:

```json
{
  "arguments": [
    {
      "title": "Market Competition",
      "argument": "..."
    },
    {
      "title": "Customer Acquisition",
      "argument": "..."
    }
  ]
}
```

---

# 16. Defender Agent

Create a dedicated Defender service/class.

Input:

```text
thesis
current challenger arguments
previous rounds
```

Goal:

Defend the thesis against the strongest arguments.

The Defender should:

* Respond to each major objection.
* Address the actual argument.
* Not ignore weaknesses.
* Not blindly claim that the thesis is perfect.
* Provide logical rebuttals.

Expected output:

```json
{
  "rebuttals": [
    {
      "argument_title": "Market Competition",
      "response": "..."
    },
    {
      "argument_title": "Customer Acquisition",
      "response": "..."
    }
  ]
}
```

---

# 17. Judge Agent

Create a dedicated Judge service/class.

The Judge must remain neutral.

Input:

```text
thesis
challenger arguments
defender rebuttals
previous rounds
```

Evaluate:

1. Argument strength
2. Logical quality
3. Relevance
4. Rebuttal quality
5. Unresolved weaknesses

Scores:

```text
0 - 10
```

Expected output:

```json
{
  "challenger_score": 8.2,
  "defender_score": 6.8,
  "winner": "challenger",
  "reason": "...",
  "strongest_argument": "...",
  "weakest_rebuttal": "..."
}
```

---

# 18. Round Context

Round 2 MUST know what happened in Round 1.

Example:

```text
Round 1
    |
    +-- Challenger
    +-- Defender
    +-- Judge
             |
             v
          Round 2
             |
             +-- Challenger
             +-- Defender
             +-- Judge
```

The Challenger in Round 2 should specifically attack unresolved weaknesses from Round 1.

The Defender in Round 2 should respond to the new arguments.

The Judge should evaluate whether the Defender successfully addressed the weaknesses.

---

# 19. Final Result

After all rounds, calculate:

```text
final_winner
final_challenger_score
final_defender_score
final_verdict
```

For the MVP, the final score can be the score from the final round.

Winner:

```text
if challenger_score > defender_score:
    challenger

if defender_score > challenger_score:
    defender

if equal:
    tie
```

Store the final result in the `debates` table.

---

# 20. GET /api/debates

Returns only debates belonging to the authenticated user.

Query parameters:

```text
page
limit
```

Defaults:

```text
page = 1
limit = 20
```

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
      "challenger_score": 8.2,
      "defender_score": 6.8,
      "created_at": "2026-08-26T10:00:00Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

---

# 21. GET /api/debates/{debate_id}

Returns the complete debate.

Authentication required.

Before returning the debate, verify:

```text
debate.user_id == authenticated_user.id
```

Otherwise return:

```text
404
```

Do not reveal whether another user's debate exists.

Response should contain:

```text
debate information
thesis
status
rounds
challenger arguments
defender rebuttals
judge results
final result
```

---

# 22. GET /api/debates/{debate_id}/status

This endpoint is designed for the frontend to monitor a running debate.

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

Possible values:

```text
status:
pending
running
completed
failed
```

```text
current_agent:
challenger
defender
judge
null
```

---

# 23. Frontend Polling

The backend does NOT need WebSockets or SSE for the first MVP.

The frontend can poll:

```text
GET /api/debates/{id}/status
```

every 2–3 seconds while:

```text
status = pending
```

or:

```text
status = running
```

When:

```text
status = completed
```

the frontend stops polling and requests:

```text
GET /api/debates/{id}
```

---

# 24. Example Frontend State

The frontend should be able to display:

```text
Round 1 / 2

✓ Challenger
● Defender
○ Judge
```

Then:

```text
Round 1 / 2

✓ Challenger
✓ Defender
● Judge
```

Then:

```text
Round 2 / 2

● Challenger
○ Defender
○ Judge
```

Finally:

```text
Debate completed
```

---

# 25. Error Handling

Use consistent JSON errors.

Format:

```json
{
  "error": {
    "code": "DEBATE_NOT_FOUND",
    "message": "Debate not found."
  }
}
```

Required error codes:

```text
AUTH_EMAIL_EXISTS
AUTH_INVALID_CREDENTIALS
AUTH_INVALID_TOKEN

DEBATE_NOT_FOUND
DEBATE_INVALID_ROUNDS
DEBATE_INVALID_THESIS
DEBATE_ALREADY_RUNNING

AI_PROVIDER_ERROR
AI_GENERATION_ERROR

INTERNAL_SERVER_ERROR
```

Use appropriate HTTP status codes.

---

# 26. LLM Service

Create a reusable LLM abstraction.

Do not make the Challenger, Defender, and Judge directly depend on a specific SDK if avoidable.

Conceptually:

```text
Challenger
    |
    v
LLMService
    |
    v
OpenAI-compatible API
```

Configuration:

```env
LLM_BASE_URL=
LLM_API_KEY=
LLM_MODEL=
```

The API key must remain backend-only.

---

# 27. Structured AI Output

The AI responses must be validated with Pydantic schemas.

For example:

```text
ChallengerOutput
DefenderOutput
JudgeOutput
```

Do not blindly store arbitrary LLM text as the application's structured state.

If the LLM returns invalid structured output:

1. Attempt a controlled retry.
2. If retry fails, mark the debate as `failed`.
3. Store an appropriate error.
4. Do not corrupt the debate state.

---

# 28. Database Transactions

Use transactions when updating debate state.

Important transitions:

```text
pending
   ↓
running
   ↓
completed
```

If an unrecoverable AI error occurs:

```text
running
   ↓
failed
```

Do not leave a debate permanently stuck in `running`.

---

# 29. Authorization

Every debate endpoint must use the authenticated user's identity.

Correct:

```text
JWT
 ↓
user_id
 ↓
query debate WHERE id = ? AND user_id = ?
```

Incorrect:

```text
frontend sends user_id
 ↓
backend trusts it
```

Never trust `user_id` from the frontend.

---

# 30. API Documentation

FastAPI must expose:

```text
/docs
```

and:

```text
/openapi.json
```

All endpoints must have:

* Request schemas
* Response schemas
* Authentication requirements
* Description
* HTTP status codes

The OpenAPI specification should be accurate enough for the frontend developer to integrate without reading backend implementation details.

---

# 31. Environment Configuration

Create:

```text
.env.example
```

with:

```env
APP_ENV=development

DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/debate_app

JWT_SECRET=change-me
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

LLM_BASE_URL=
LLM_API_KEY=
LLM_MODEL=
```

Never commit the real `.env`.

---

# 32. CORS

Configure CORS for local frontend development.

Example:

```text
http://localhost:3000
```

The allowed origins must come from environment configuration.

Do not use unrestricted `*` in production configuration.

---

# 33. Testing

Create tests for:

## Authentication

* Register successfully.
* Reject duplicate email.
* Login successfully.
* Reject invalid password.
* Reject invalid JWT.

## Debate

* Create debate.
* Reject invalid thesis.
* Reject invalid rounds.
* Retrieve user's debates.
* Retrieve one debate.
* Prevent access to another user's debate.
* Track debate status.

## AI workflow

Mock the LLM service.

Test:

```text
Round 1
 ↓
Challenger
 ↓
Defender
 ↓
Judge
 ↓
Round 2
```

Do not make real LLM API calls during automated tests.

---

# 34. README Requirements

Create a README explaining:

1. Project overview.
2. Requirements.
3. Installation.
4. Environment variables.
5. PostgreSQL setup.
6. Database migrations.
7. Running the API.
8. Running tests.
9. API documentation.
10. Example API requests.

Example:

```bash
pip install -r requirements.txt

alembic upgrade head

uvicorn app.main:app --reload
```

API:

```text
http://localhost:8000/docs
```

---

# 35. Definition of Done

The backend is complete when all of the following work:

## Authentication

* [ ] User registration works.
* [ ] Passwords are securely hashed.
* [ ] Login returns JWT.
* [ ] Protected endpoints require JWT.
* [ ] `/api/auth/me` works.

## Debate

* [ ] User can create a debate.
* [ ] User can choose 2 or 3 rounds.
* [ ] Challenger works.
* [ ] Defender works.
* [ ] Judge works.
* [ ] Round 2 receives Round 1 context.
* [ ] Round 3 works when selected.
* [ ] Final winner is calculated.
* [ ] Final result is persisted.

## History

* [ ] User can retrieve their debates.
* [ ] User can retrieve one debate.
* [ ] Users cannot access other users' debates.
* [ ] Pagination works.

## Status

* [ ] Debate status is persisted.
* [ ] Current round is persisted.
* [ ] Current agent is persisted.
* [ ] Failed debates are marked `failed`.

## API

* [ ] OpenAPI documentation works.
* [ ] Request validation works.
* [ ] Response schemas are defined.
* [ ] Errors use consistent format.

## Quality

* [ ] Database migrations work.
* [ ] Tests exist.
* [ ] README exists.
* [ ] `.env.example` exists.
* [ ] No secrets are committed.

---

# 36. Final Constraint

This is an MVP.

Prefer:

```text
Simple
Reliable
Understandable
Testable
```

over:

```text
Complex
Distributed
Over-engineered
```

Do not implement future features just because they may be useful later.

The backend should provide exactly enough functionality for a frontend team to build:

```text
Login
  ↓
Dashboard
  ↓
Create Debate
  ↓
Run Debate
  ↓
View Rounds
  ↓
View Final Result
  ↓
View Previous Debates
```

No frontend implementation is required.

No UI code is required.

The backend is the only deliverable.