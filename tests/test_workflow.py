import asyncio

import pytest


@pytest.mark.asyncio
async def test_debate_workflow_2_rounds(async_client, auth_headers):
    response = await async_client.post("/api/debates", json={
        "thesis": "I want to build an AI tutor for university students.",
        "rounds": 2,
    }, headers=auth_headers)
    assert response.status_code == 201
    debate_id = response.json()["id"]

    for _ in range(50):
        status_response = await async_client.get(f"/api/debates/{debate_id}/status", headers=auth_headers)
        status_data = status_response.json()
        if status_data["status"] in ("completed", "failed"):
            break
        await asyncio.sleep(0.1)

    assert status_data["status"] == "completed"
    assert status_data["current_round"] == 2
    assert status_data["current_agent"] is None

    detail_response = await async_client.get(f"/api/debates/{debate_id}", headers=auth_headers)
    assert detail_response.status_code == 200
    data = detail_response.json()
    assert data["status"] == "completed"
    assert len(data["rounds"]) == 2
    assert data["final_winner"] == "defender"
    assert data["final_challenger_score"] == 6.0
    assert data["final_defender_score"] == 7.0


@pytest.mark.asyncio
async def test_debate_workflow_3_rounds(async_client, auth_headers):
    response = await async_client.post("/api/debates", json={
        "thesis": "Remote work is the future of software engineering.",
        "rounds": 3,
    }, headers=auth_headers)
    assert response.status_code == 201
    debate_id = response.json()["id"]

    for _ in range(50):
        status_response = await async_client.get(f"/api/debates/{debate_id}/status", headers=auth_headers)
        status_data = status_response.json()
        if status_data["status"] in ("completed", "failed"):
            break
        await asyncio.sleep(0.1)

    assert status_data["status"] == "completed"
    assert status_data["current_round"] == 3

    detail_response = await async_client.get(f"/api/debates/{debate_id}", headers=auth_headers)
    data = detail_response.json()
    assert len(data["rounds"]) == 3
