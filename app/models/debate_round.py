import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.debate import Debate


class DebateRound(Base):
    __tablename__ = "debate_rounds"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    debate_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("debates.id", ondelete="CASCADE"), nullable=False)
    round_number: Mapped[int] = mapped_column(Integer, nullable=False)

    challenger_arguments: Mapped[list[dict[str, Any]] | None] = mapped_column(JSONB, nullable=True)
    defender_rebuttals: Mapped[list[dict[str, Any]] | None] = mapped_column(JSONB, nullable=True)

    challenger_score: Mapped[float | None] = mapped_column(nullable=True)
    defender_score: Mapped[float | None] = mapped_column(nullable=True)

    winner: Mapped[str | None] = mapped_column(String(20), nullable=True)
    judge_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    strongest_argument: Mapped[str | None] = mapped_column(Text, nullable=True)
    weakest_rebuttal: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    debate: Mapped["Debate"] = relationship("Debate", back_populates="rounds")
