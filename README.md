# Debate & Argument Stress Tester — Backend MVP

A production-structured, MVP-sized backend for an AI Debate & Argument Stress Tester.

## Overview

The backend exposes a JSON REST API built with FastAPI. Registered users can submit a thesis and run a structured multi-round debate between three AI roles:

- **Challenger** — attacks the thesis
- **Defender** — rebuts the objections
- **Judge** — evaluates both sides and scores the round

Debates are persisted in PostgreSQL and can be retrieved later. Execution runs in a FastAPI background task and supports 2 or 3 rounds.

## Requirements

- Python 3.11+
- PostgreSQL 14+
- An OpenAI-compatible LLM API endpoint

## Installation

1. Clone or navigate into the project directory.
2. Create and activate a virtual environment:

```bash
python -m venv env
# Windows
env\Scripts\activate
# macOS/Linux
source env/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Example `.env`:

```env
APP_ENV=development

DATABASE_URL=postgresql+asyncpg://postgres:yourpassword@localhost:5432/debate_app

JWT_SECRET=change-me-to-something-random
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-...
LLM_MODEL=gpt-4o-mini

CORS_ORIGINS=http://localhost:3000
```

> Never commit the real `.env` file.

## PostgreSQL Setup

Create the database:

```bash
psql -U postgres -c "CREATE DATABASE debate_app;"
```

Make sure the user in `DATABASE_URL` has permission to create tables.

## Running with Docker

A `docker-compose.yml` is included to run PostgreSQL and the API together.

1. Make sure `.env` is configured with your LLM credentials.
2. Start the services:

```bash
docker compose up --build
```

This will:
- Start a PostgreSQL 16 container
- Build and start the FastAPI app
- Run Alembic migrations automatically

The API will be available at `http://localhost:8000` and docs at `http://localhost:8000/docs`.

To run only the database:

```bash
docker compose up db -d
```

Then update your `.env`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/debate_app
```

## Database Migrations

Run Alembic migrations to create the schema:

```bash
alembic upgrade head
```

To generate a new migration after model changes:

```bash
alembic revision --autogenerate -m "description"
```

## Running the API

Start the development server:

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://localhost:8000
```

Interactive documentation:

```text
http://localhost:8000/docs
http://localhost:8000/openapi.json
```

## Running Tests

Tests use an in-memory SQLite database and a mocked LLM service, so no PostgreSQL or real API keys are required:

```bash
pytest
```

Run with verbose output:

```bash
pytest -v
```

## API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user |

### Debates

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/debates` | Create a new debate (starts execution) |
| GET | `/api/debates` | List user's debates (paginated) |
| GET | `/api/debates/{id}` | Get a single debate with rounds |
| GET | `/api/debates/{id}/status` | Poll debate execution status |

## Example API Requests

### Register

```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Login

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Create Debate

```bash
curl -X POST "http://localhost:8000/api/debates" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"thesis":"I want to build an AI tutor for university students.","rounds":2}'
```

### Get Debate Status

```bash
curl "http://localhost:8000/api/debates/{debate_id}/status" \
  -H "Authorization: Bearer <access_token>"
```

### Get Debate Detail

```bash
curl "http://localhost:8000/api/debates/{debate_id}" \
  -H "Authorization: Bearer <access_token>"
```

## Architecture

```text
FastAPI
   |
   +-- API Layer (app/api/)
   +-- Service Layer (app/services/)
   +-- Agent Layer (app/agents/)
   +-- Database Layer (app/models/)
   +-- LLM Service (app/services/llm_service.py)
```

## Notes

- Debate execution runs in a FastAPI background task for the MVP.
- The LLM service uses an OpenAI-compatible `/chat/completions` endpoint and validates structured output with Pydantic.
- All authentication uses JWT; protected endpoints never trust a frontend-provided `user_id`.
- CORS origins are configured via the `CORS_ORIGINS` environment variable.
