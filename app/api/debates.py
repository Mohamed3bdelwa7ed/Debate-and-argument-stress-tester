import uuid
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.core.database import get_db
from app.schemas.auth import UserResponse
from app.schemas.debate import (
    DebateCreateRequest,
    DebateDetailResponse,
    DebateListResponse,
    DebateResponse,
    DebateStatusResponse,
)
from app.services.debate_service import create_debate, get_debate_status, get_user_debate, list_user_debates, start_debate_execution

router = APIRouter(prefix="/api/debates", tags=["Debates"])


@router.post(
    "",
    response_model=DebateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new debate",
)
async def create_new_debate(
    request: DebateCreateRequest,
    background_tasks: BackgroundTasks,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DebateResponse:
    debate = await create_debate(db, current_user.id, request)
    await start_debate_execution(db, current_user.id, debate.id, background_tasks)
    return DebateResponse.model_validate(debate)


@router.get(
    "",
    response_model=DebateListResponse,
    summary="List debates for the authenticated user",
)
async def list_debates(
    page: Annotated[int, Query(ge=1)] = 1,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DebateListResponse:
    return await list_user_debates(db, current_user.id, page, limit)


@router.get(
    "/{debate_id}",
    response_model=DebateDetailResponse,
    summary="Get a specific debate",
)
async def get_debate(
    debate_id: uuid.UUID,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DebateDetailResponse:
    debate = await get_user_debate(db, current_user.id, debate_id)
    return DebateDetailResponse.model_validate(debate)


@router.get(
    "/{debate_id}/status",
    response_model=DebateStatusResponse,
    summary="Get debate execution status",
)
async def get_status(
    debate_id: uuid.UUID,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DebateStatusResponse:
    debate = await get_debate_status(db, current_user.id, debate_id)
    return DebateStatusResponse.model_validate(
        {
            "id": debate.id,
            "status": debate.status,
            "current_round": debate.current_round,
            "total_rounds": debate.rounds_count,
            "current_agent": debate.current_agent,
        }
    )
