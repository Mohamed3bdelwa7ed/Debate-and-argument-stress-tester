import uuid

import pytest

from app.models.debate import Debate


@pytest.mark.asyncio
async def test_create_debate(async_client, auth_headers):
    response = await async_client.post("/api/debates", json={
        "thesis": "I want to build an AI tutor for university students.",
        "rounds": 2,
    }, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["thesis"] == "I want to build an AI tutor for university students."
    assert data["rounds_count"] == 2
    assert data["status"] == "pending"
    assert data["current_round"] == 0
    assert data["current_agent"] is None


@pytest.mark.asyncio
async def test_create_debate_invalid_thesis(async_client, auth_headers):
    response = await async_client.post("/api/debates", json={
        "thesis": "Short",
        "rounds": 2,
    }, headers=auth_headers)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_debate_invalid_rounds(async_client, auth_headers):
    response = await async_client.post("/api/debates", json={
        "thesis": "I want to build an AI tutor for university students.",
        "rounds": 5,
    }, headers=auth_headers)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_debates(async_client, auth_headers, db_session, test_user):
    debate = Debate(
        user_id=test_user.id,
        thesis="Thesis one",
        rounds_count=2,
        status="completed",
        current_round=2,
        current_agent=None,
        final_winner="challenger",
        final_challenger_score=7.5,
        final_defender_score=6.0,
    )
    db_session.add(debate)
    await db_session.commit()

    response = await async_client.get("/api/debates", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert data["page"] == 1
    assert data["limit"] == 20


@pytest.mark.asyncio
async def test_get_debate(async_client, auth_headers, db_session, test_user):
    debate = Debate(
        user_id=test_user.id,
        thesis="Get me",
        rounds_count=2,
        status="completed",
        current_round=2,
        current_agent=None,
    )
    db_session.add(debate)
    await db_session.commit()

    response = await async_client.get(f"/api/debates/{debate.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["thesis"] == "Get me"


@pytest.mark.asyncio
async def test_get_other_user_debate(async_client, auth_headers, db_session, other_user):
    debate = Debate(
        user_id=other_user.id,
        thesis="Not yours",
        rounds_count=2,
        status="completed",
        current_round=2,
        current_agent=None,
    )
    db_session.add(debate)
    await db_session.commit()

    response = await async_client.get(f"/api/debates/{debate.id}", headers=auth_headers)
    assert response.status_code == 404
    data = response.json()
    assert data["error"]["code"] == "DEBATE_NOT_FOUND"


@pytest.mark.asyncio
async def test_debate_status(async_client, auth_headers, db_session, test_user):
    debate = Debate(
        user_id=test_user.id,
        thesis="Status test",
        rounds_count=2,
        status="running",
        current_round=1,
        current_agent="defender",
    )
    db_session.add(debate)
    await db_session.commit()

    response = await async_client.get(f"/api/debates/{debate.id}/status", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "running"
    assert data["current_round"] == 1
    assert data["total_rounds"] == 2
    assert data["current_agent"] == "defender"


@pytest.mark.asyncio
async def test_create_debate_requires_auth(async_client):
    response = await async_client.post("/api/debates", json={
        "thesis": "I want to build an AI tutor for university students.",
        "rounds": 2,
    })
    assert response.status_code == 401
