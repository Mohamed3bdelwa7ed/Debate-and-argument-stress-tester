import sys
import uuid
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
import sqlalchemy as sa
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Monkeypatch JSONB to generic JSON so tests can run on SQLite.
import sqlalchemy.dialects.postgresql as pg  # noqa: E402

pg.JSONB = sa.JSON

sys.path.insert(0, ".")

from app.core.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models.user import User  # noqa: E402
from app.core.security import hash_password, create_access_token  # noqa: E402

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DATABASE_URL, future=True, echo=False)
AsyncTestingSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncTestingSessionLocal() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db

# Override AsyncSessionLocal used by background tasks so tests run on SQLite.
import app.services.debate_service as debate_service_module  # noqa: E402

debate_service_module.AsyncSessionLocal = AsyncTestingSessionLocal

from app.schemas.debate import ChallengerOutput, DefenderOutput, JudgeOutput  # noqa: E402


@pytest.fixture(autouse=True)
def mock_llm_service(monkeypatch):
    call_count = {"challenger": 0, "defender": 0, "judge": 0}

    async def fake_generate_structured(*args, **kwargs):  # noqa: ARG001
        output_schema = kwargs.get("output_schema")
        if output_schema.__name__ == "ChallengerOutput":
            call_count["challenger"] += 1
            return ChallengerOutput(arguments=[{
                "title": f"Argument {call_count['challenger']}",
                "argument": f"Challenge number {call_count['challenger']}",
            }])
        if output_schema.__name__ == "DefenderOutput":
            call_count["defender"] += 1
            return DefenderOutput(rebuttals=[{
                "argument_title": f"Argument {call_count['defender']}",
                "response": f"Rebuttal number {call_count['defender']}",
            }])
        if output_schema.__name__ == "JudgeOutput":
            call_count["judge"] += 1
            return JudgeOutput(
                challenger_score=7.0 - call_count["judge"] * 0.5,
                defender_score=6.0 + call_count["judge"] * 0.5,
                winner="challenger" if call_count["judge"] == 1 else "defender",
                reason=f"Round {call_count['judge']} evaluation",
                strongest_argument=f"Argument {call_count['judge']}",
                weakest_rebuttal=f"Rebuttal {call_count['judge']}",
            )
        raise ValueError(f"Unknown schema: {output_schema}")

    monkeypatch.setattr("app.services.llm_service.LLMService.generate_structured", fake_generate_structured)
    return call_count


@pytest_asyncio.fixture(autouse=True)
async def setup_database() -> AsyncGenerator[None, None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncTestingSessionLocal() as session:
        yield session


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest_asyncio.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
    user = User(
        id=uuid.uuid4(),
        email="test@example.com",
        password_hash=hash_password("password123"),
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def auth_headers(test_user: User) -> dict[str, str]:
    token = create_access_token({"sub": str(test_user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def other_user(db_session: AsyncSession) -> User:
    user = User(
        id=uuid.uuid4(),
        email="other@example.com",
        password_hash=hash_password("password123"),
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user
