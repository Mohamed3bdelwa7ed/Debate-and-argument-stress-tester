# Backend Prompt 2 of 2: LLM Service, Agents, and Full Round-by-Round Execution

## Context

This is the **second of two sequential prompts** for building the backend of the **Debate & Argument Stress Tester** MVP. It assumes the foundation from Prompt 1 is already in place:

* Project structure and dependencies configured.
* Database models and migrations created.
* Authentication and debate endpoints implemented.
* A stub debate execution workflow exists, producing deterministic placeholder data.

This prompt replaces the stubs with a real LLM service and the three AI agents (Challenger, Defender, Judge), while keeping everything else unchanged. The database schema, API contracts, and auth layer must remain compatible.

## Technology Stack

Continue using exactly the same stack from Prompt 1:

* Python 3.11+
* FastAPI
* Uvicorn
* PostgreSQL
* SQLAlchemy 2.x with asyncpg
* Alembic
* Pydantic v2
* python-jose / passlib for JWT and password hashing
* `httpx` for async HTTP calls to the LLM API

## Scope of This Prompt

Replace the stubbed execution layer with a real LLM-backed implementation that:

1. Provides a reusable LLM service abstraction.
2. Implements the Challenger, Defender, and Judge agents as separate classes.
3. Loads prompt templates from external files in `app/prompts/`.
4. Enforces structured JSON output from the LLM.
5. Runs the full round-by-round debate workflow with context carryover.
6. Handles LLM failures gracefully.

No new endpoints should be added. No schema or model changes are required beyond what already exists.

## Architecture

Extend the existing structure:

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
│   │   └── llm_service.py
│   ├── agents/
│   │   ├── challenger.py
│   │   ├── defender.py
│   │   └── judge.py
│   └── prompts/
│       ├── challenger.txt
│       ├── defender.txt
│       └── judge.txt
├── alembic/
├── tests/
├── .env.example
├── requirements.txt
├── alembic.ini
└── README.md
```

Remove or rename the stub files from Prompt 1:

* `services/llm_service_stub.py` → `services/llm_service.py`
* `agents/challenger_stub.py` → `agents/challenger.py`
* `agents/defender_stub.py` → `agents/defender.py`
* `agents/judge_stub.py` → `agents/judge.py`

## Functional Requirements

### 1. LLM Service

Create a reusable, provider-agnostic LLM service in `services/llm_service.py`.

Requirements:

* Use `httpx.AsyncClient` for all HTTP calls.
* Target an OpenAI-compatible chat completions endpoint.
* Support configuration through environment variables:
  * `LLM_BASE_URL`
  * `LLM_API_KEY`
  * `LLM_MODEL` (e.g., `gpt-4o-mini`)
  * `LLM_MAX_TOKENS` (default 1024)
  * `LLM_TEMPERATURE` (default 0.7)
  * `LLM_TIMEOUT_SECONDS` (default 60)
* Provide an async method `generate(messages, temperature=None, max_tokens=None)` that:
  * Sends a list of chat messages in the OpenAI format.
  * Returns the raw string content of the assistant message.
* Raise a custom `AIProviderError` for HTTP errors, timeouts, or non-2xx responses.
* Raise a custom `AIGenerationError` when the response is empty, malformed, or cannot be parsed as the expected structure.
* Support JSON mode if the provider supports it, but ensure the service can also extract JSON from a markdown code block.
* Add a retry policy with at least one retry on transient errors such as timeouts or 5xx responses.
* Close the HTTP client cleanly on application shutdown.

### 2. Prompt Files

Create three plain-text prompt templates in `app/prompts/`:

#### `prompts/challenger.txt`

The prompt must instruct the model to:

* Attack the thesis, not the user.
* Identify the strongest weaknesses.
* Avoid repeating arguments from previous rounds.
* Consider previous defenses and unresolved weaknesses.
* Return a JSON object with an `arguments` array.
* Each argument must have `title` and `argument` fields.

Include placeholders in the template for:

* `{thesis}`
* `{current_round}`
* `{total_rounds}`
* `{previous_arguments}` (joined text or "none")
* `{previous_judge_results}` (joined text or "none")

#### `prompts/defender.txt`

The prompt must instruct the model to:

* Defend the thesis against each Challenger argument.
* Address actual objections without ignoring weaknesses.
* Provide logical, specific rebuttals.
* Return a JSON object with a `rebuttals` array.
* Each rebuttal must have `argument_title` and `response` fields.

Include placeholders for:

* `{thesis}`
* `{current_round}`
* `{total_rounds}`
* `{challenger_arguments}` (JSON or formatted text)

#### `prompts/judge.txt`

The prompt must instruct the model to:

* Remain neutral.
* Evaluate argument strength, logical quality, relevance, rebuttal quality, and unresolved weaknesses.
* Score Challenger and Defender on a scale of 0 to 10, supporting one decimal place.
* Declare a winner: `challenger`, `defender`, or `tie`.
* Return a JSON object with:
  * `challenger_score`
  * `defender_score`
  * `winner`
  * `reason`
  * `strongest_argument`
  * `weakest_rebuttal`

Include placeholders for:

* `{thesis}`
* `{current_round}`
* `{total_rounds}`
* `{challenger_arguments}`
* `{defender_rebuttals}`
* `{previous_rounds_summary}` (joined text or "none")

### 3. Challenger Agent

Implement `agents/challenger.py` as a class.

Responsibilities:

* Load the `challenger.txt` template.
* Format it with the current thesis, round number, previous arguments, and previous judge results.
* Call the LLM service.
* Parse the result into a Pydantic model such as:

```python
class ChallengerOutput(BaseModel):
    arguments: list[Argument]
```

```python
class Argument(BaseModel):
    title: str
    argument: str
```

* Validate that at least one argument is returned.
* Raise `AIGenerationError` if parsing fails or the structure is invalid.

Context requirements:

* Round 1 receives no previous context.
* Round 2 and Round 3 receive summaries of previous Challenger arguments, Defender rebuttals, and Judge reasons. The agent should specifically ask the model to attack unresolved weaknesses from earlier rounds.

### 4. Defender Agent

Implement `agents/defender.py` as a class.

Responsibilities:

* Load the `defender.txt` template.
* Format it with the thesis, current Challenger arguments, and round context.
* Call the LLM service.
* Parse the result into:

```python
class DefenderOutput(BaseModel):
    rebuttals: list[Rebuttal]
```

```python
class Rebuttal(BaseModel):
    argument_title: str
    response: str
```

* Match each rebuttal to a Challenger argument by `argument_title`.
* Validate that every Challenger argument has a corresponding rebuttal. If one is missing, raise `AIGenerationError`.
* If the LLM returns extra rebuttals for arguments that do not exist, ignore them and log a warning.

### 5. Judge Agent

Implement `agents/judge.py` as a class.

Responsibilities:

* Load the `judge.txt` template.
* Format it with the thesis, current round's Challenger arguments, Defender rebuttals, and previous round summaries.
* Call the LLM service.
* Parse the result into:

```python
class JudgeOutput(BaseModel):
    challenger_score: float
    defender_score: float
    winner: str
    reason: str
    strongest_argument: str
    weakest_rebuttal: str
```

* Validate:
  * Both scores are between 0 and 10.
  * `winner` is one of `challenger`, `defender`, `tie`.
  * All string fields are non-empty.
* Raise `AIGenerationError` if any validation fails.

Context requirements:

* Include previous round summaries so the Judge can evaluate whether unresolved weaknesses were addressed.

### 6. Round Context Carryover

Update `DebateService` to build a context object for each round that includes:

* The original `thesis`.
* The total `rounds_count`.
* A list of previous `DebateRound` objects, each with:
  * `round_number`
  * `challenger_arguments`
  * `defender_rebuttals`
  * `challenger_score`
  * `defender_score`
  * `winner`
  * `judge_reason`
  * `strongest_argument`
  * `weakest_rebuttal`

The context object must be passed to each agent so that:

* The Challenger in Round 2/3 attacks unresolved weaknesses from Round 1/2.
* The Defender in Round 2/3 sees both the new arguments and the previous outcomes.
* The Judge in Round 2/3 evaluates progress across the debate.

### 7. Full Debate Execution Workflow

Replace the stub execution with the real workflow. The sequence remains:

```text
status = running
for each round in 1..rounds_count:
    current_round = round
    current_agent = challenger
    challenger_output = ChallengerAgent.run(context)
    save challenger_arguments
    current_agent = defender
    defender_output = DefenderAgent.run(context, challenger_output)
    save defender_rebuttals
    current_agent = judge
    judge_output = JudgeAgent.run(context, challenger_output, defender_output)
    save scores, winner, reason, strongest_argument, weakest_rebuttal
after final round:
    status = completed
    current_agent = null
    current_round = rounds_count
    compute final result from final round
    save final_winner, final_challenger_score, final_defender_score, final_verdict
    completed_at = now()
```

Each step must:

* Update the `debates` row with `current_agent` and `current_round`.
* Insert or update the corresponding `debate_rounds` row.
* Commit after each agent phase so that polling returns the latest state.

Final result calculation:

* `final_challenger_score` = challenger_score from the final round.
* `final_defender_score` = defender_score from the final round.
* `final_winner` = `challenger` if challenger_score > defender_score; `defender` if defender_score > challenger_score; `tie` if equal.
* `final_verdict` = the Judge's `reason` from the final round.

### 8. Error Handling and Resilience

Add error handling for the new failure modes:

* `AIProviderError`: raised when the LLM HTTP call fails (timeout, 5xx, network error, invalid API key).
  * Map to HTTP `502` with code `AI_PROVIDER_ERROR`.
* `AIGenerationError`: raised when the LLM response cannot be parsed or validated.
  * Map to HTTP `502` with code `AI_GENERATION_ERROR`.
* Any unexpected exception during debate execution:
  * Set `status = failed` and `current_agent = null`.
  * Return HTTP `500` with code `INTERNAL_SERVER_ERROR`.

Required error codes for this prompt:

* `AI_PROVIDER_ERROR`
* `AI_GENERATION_ERROR`
* `INTERNAL_SERVER_ERROR`

Keep all existing error codes from Prompt 1.

### 9. Configuration Updates

Update `.env.example` to include the new variables:

```text
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/debeat
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=your-openai-key
LLM_MODEL=gpt-4o-mini
LLM_MAX_TOKENS=1024
LLM_TEMPERATURE=0.7
LLM_TIMEOUT_SECONDS=60
```

Update `core/config.py` to read and validate the new variables. `LLM_API_KEY` is required for debate execution but the app should still start without it for endpoints that do not use AI.

### 10. Testing

Add or update tests for:

* LLM service returns expected content for a mocked OpenAI-compatible response.
* LLM service retries on transient errors and raises `AIProviderError` on final failure.
* LLM service raises `AIGenerationError` when JSON parsing fails.
* Challenger agent produces valid `ChallengerOutput` from a mocked LLM response.
* Defender agent produces valid `DefenderOutput` and requires a rebuttal for every argument.
* Judge agent validates score ranges and winner values.
* Full debate execution completes all rounds and writes final scores.
* Debate execution sets `status = failed` when the LLM raises an error mid-debate.
* Status endpoint reflects `current_agent` updates during execution.

Use `respx` or `pytest-httpx` to mock LLM HTTP calls.

### 11. Documentation Updates

Update `README.md` with:

* How to obtain and configure an OpenAI-compatible API key.
* The role of each agent.
* How the context is passed between rounds.
* How to test with mocked LLM responses.
* Example `.env` values.

## Explicit Do-Not-Do List

Do NOT introduce LangChain, LangGraph, or similar frameworks.
Do NOT add Redis, Celery, RabbitMQ, Kafka, WebSockets, or SSE.
Do NOT add RAG, vector embeddings, web search, or file uploads.
Do NOT add payment, subscriptions, admin dashboard, team system, social login, email verification, or password reset.
Do NOT change the API contract for existing endpoints.
Do NOT expose individual `/api/challenger`, `/api/defender`, or `/api/judge` endpoints.
Do NOT build any frontend code.
Do NOT change the database schema unless required by the LLM output shapes. The JSONB columns already exist and are sufficient.

## Completion Criteria

At the end of this prompt, the backend must:

* Use a real LLM service for all agent calls.
* Run complete 2-round or 3-round debates with context carryover.
* Return structured, validated results from the Challenger, Defender, and Judge.
* Handle LLM failures with appropriate error codes and state transitions.
* Pass all existing and new tests.
* Remain a modular monolith without any forbidden frameworks or services.
