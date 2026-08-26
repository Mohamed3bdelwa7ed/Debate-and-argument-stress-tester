import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ChallengerArgument(BaseModel):
    title: str
    argument: str


class ChallengerOutput(BaseModel):
    arguments: list[ChallengerArgument]


class DefenderRebuttal(BaseModel):
    argument_title: str
    response: str


class DefenderOutput(BaseModel):
    rebuttals: list[DefenderRebuttal]


class JudgeOutput(BaseModel):
    challenger_score: float = Field(..., ge=0, le=10)
    defender_score: float = Field(..., ge=0, le=10)
    winner: str
    reason: str
    strongest_argument: str
    weakest_rebuttal: str


class DebateCreateRequest(BaseModel):
    thesis: str = Field(..., min_length=10, max_length=5000)
    rounds: int = Field(default=2, ge=2, le=3)


class DebateResponse(BaseModel):
    id: uuid.UUID
    thesis: str
    rounds_count: int
    status: str
    current_round: int
    current_agent: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DebateListItem(BaseModel):
    id: uuid.UUID
    thesis: str
    status: str
    rounds_count: int
    final_winner: str | None = None
    final_challenger_score: float | None = None
    final_defender_score: float | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DebateListResponse(BaseModel):
    items: list[DebateListItem]
    page: int
    limit: int
    total: int


class RoundResponse(BaseModel):
    id: uuid.UUID
    round_number: int
    challenger_arguments: list[dict] | None = None
    defender_rebuttals: list[dict] | None = None
    challenger_score: float | None = None
    defender_score: float | None = None
    winner: str | None = None
    judge_reason: str | None = None
    strongest_argument: str | None = None
    weakest_rebuttal: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DebateDetailResponse(BaseModel):
    id: uuid.UUID
    thesis: str
    rounds_count: int
    status: str
    current_round: int
    current_agent: str | None
    final_winner: str | None
    final_challenger_score: float | None
    final_defender_score: float | None
    final_verdict: str | None
    created_at: datetime
    completed_at: datetime | None
    rounds: list[RoundResponse]

    model_config = ConfigDict(from_attributes=True)


class DebateStatusResponse(BaseModel):
    id: uuid.UUID
    status: str
    current_round: int
    total_rounds: int
    current_agent: str | None

    model_config = ConfigDict(from_attributes=True)
