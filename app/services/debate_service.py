import uuid
from datetime import datetime, timezone

from fastapi import BackgroundTasks
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.challenger import ChallengerAgent
from app.agents.defender import DefenderAgent
from app.agents.judge import JudgeAgent
from app.core.database import AsyncSessionLocal
from app.models.debate import Debate
from app.models.debate_round import DebateRound
from app.schemas.debate import DebateCreateRequest, DebateListResponse
from app.services.llm_service import LLMError


class DebateError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


async def create_debate(
    db: AsyncSession, user_id: uuid.UUID, request: DebateCreateRequest
) -> Debate:
    debate = Debate(
        user_id=user_id,
        thesis=request.thesis.strip(),
        rounds_count=request.rounds,
        status="pending",
        current_round=0,
        current_agent=None,
    )
    db.add(debate)
    await db.commit()
    await db.refresh(debate)
    return debate


async def get_user_debate(db: AsyncSession, user_id: uuid.UUID, debate_id: uuid.UUID) -> Debate:
    stmt = select(Debate).where(Debate.id == debate_id, Debate.user_id == user_id)
    result = await db.execute(stmt)
    debate = result.scalar_one_or_none()
    if not debate:
        raise DebateError("DEBATE_NOT_FOUND", "Debate not found.", 404)
    return debate


async def get_debate_status(db: AsyncSession, user_id: uuid.UUID, debate_id: uuid.UUID) -> Debate:
    return await get_user_debate(db, user_id, debate_id)


async def list_user_debates(
    db: AsyncSession, user_id: uuid.UUID, page: int, limit: int
) -> DebateListResponse:
    offset = (page - 1) * limit

    count_stmt = select(func.count()).select_from(Debate).where(Debate.user_id == user_id)
    count_result = await db.execute(count_stmt)
    total = count_result.scalar() or 0

    stmt = (
        select(Debate)
        .where(Debate.user_id == user_id)
        .order_by(desc(Debate.created_at))
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(stmt)
    debates = result.scalars().all()

    items = [
        {
            "id": d.id,
            "thesis": d.thesis,
            "status": d.status,
            "rounds_count": d.rounds_count,
            "final_winner": d.final_winner,
            "final_challenger_score": d.final_challenger_score,
            "final_defender_score": d.final_defender_score,
            "created_at": d.created_at,
        }
        for d in debates
    ]

    return DebateListResponse(items=items, page=page, limit=limit, total=total)


async def start_debate_execution(
    db: AsyncSession, user_id: uuid.UUID, debate_id: uuid.UUID, background_tasks: BackgroundTasks
) -> None:
    debate = await get_user_debate(db, user_id, debate_id)
    if debate.status == "running":
        raise DebateError("DEBATE_ALREADY_RUNNING", "Debate is already running.", 409)

    background_tasks.add_task(_run_debate_workflow, debate_id)


def _rounds_to_dict(rounds: list[DebateRound]) -> list[dict]:
    return [
        {
            "round_number": r.round_number,
            "challenger_arguments": r.challenger_arguments,
            "defender_rebuttals": r.defender_rebuttals,
            "challenger_score": r.challenger_score,
            "defender_score": r.defender_score,
            "winner": r.winner,
            "judge_reason": r.judge_reason,
            "strongest_argument": r.strongest_argument,
            "weakest_rebuttal": r.weakest_rebuttal,
        }
        for r in rounds
    ]


async def _run_debate_workflow(debate_id: uuid.UUID) -> None:
    async with AsyncSessionLocal() as db:
        debate = await _get_debate_for_update(db, debate_id)
        if not debate:
            return

        challenger = ChallengerAgent()
        defender = DefenderAgent()
        judge = JudgeAgent()

        try:
            debate.status = "running"
            debate.current_agent = "challenger"
            debate.current_round = 1
            await db.commit()

            previous_rounds: list[dict] = []
            all_rounds: list[DebateRound] = []

            for round_number in range(1, debate.rounds_count + 1):
                debate.current_round = round_number
                debate.current_agent = "challenger"
                await db.commit()

                challenger_arguments = await challenger.run(
                    thesis=debate.thesis,
                    current_round=round_number,
                    previous_rounds=previous_rounds,
                )

                debate.current_agent = "defender"
                await db.commit()

                challenger_args_dicts = [
                    {"title": arg.title, "argument": arg.argument}
                    for arg in challenger_arguments
                ]

                defender_rebuttals = await defender.run(
                    thesis=debate.thesis,
                    challenger_arguments=challenger_args_dicts,
                    previous_rounds=previous_rounds,
                )

                defender_rebs_dicts = [
                    {"argument_title": reb.argument_title, "response": reb.response}
                    for reb in defender_rebuttals
                ]

                debate.current_agent = "judge"
                await db.commit()

                judge_output = await judge.run(
                    thesis=debate.thesis,
                    challenger_arguments=challenger_args_dicts,
                    defender_rebuttals=defender_rebs_dicts,
                    previous_rounds=previous_rounds,
                )

                debate_round = DebateRound(
                    debate_id=debate.id,
                    round_number=round_number,
                    challenger_arguments=challenger_args_dicts,
                    defender_rebuttals=defender_rebs_dicts,
                    challenger_score=judge_output.challenger_score,
                    defender_score=judge_output.defender_score,
                    winner=judge_output.winner,
                    judge_reason=judge_output.reason,
                    strongest_argument=judge_output.strongest_argument,
                    weakest_rebuttal=judge_output.weakest_rebuttal,
                )
                db.add(debate_round)
                await db.commit()
                all_rounds.append(debate_round)

                previous_rounds = _rounds_to_dict(all_rounds)

            final_round = all_rounds[-1]
            debate.final_challenger_score = final_round.challenger_score
            debate.final_defender_score = final_round.defender_score
            debate.final_verdict = final_round.judge_reason

            if final_round.challenger_score > final_round.defender_score:
                debate.final_winner = "challenger"
            elif final_round.defender_score > final_round.challenger_score:
                debate.final_winner = "defender"
            else:
                debate.final_winner = "tie"

            debate.status = "completed"
            debate.current_agent = None
            debate.current_round = debate.rounds_count
            debate.completed_at = datetime.now(timezone.utc)
            await db.commit()

        except LLMError as exc:
            debate.status = "failed"
            debate.current_agent = None
            debate.completed_at = datetime.now(timezone.utc)
            await db.commit()
            raise
        except Exception:
            debate.status = "failed"
            debate.current_agent = None
            debate.completed_at = datetime.now(timezone.utc)
            await db.commit()
            raise


async def _get_debate_for_update(db: AsyncSession, debate_id: uuid.UUID) -> Debate | None:
    result = await db.execute(select(Debate).where(Debate.id == debate_id))
    return result.scalar_one_or_none()
