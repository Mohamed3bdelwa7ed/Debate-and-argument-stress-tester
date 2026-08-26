import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.debate_round import DebateRound
    from app.models.user import User


class Debate(Base):
    __tablename__ = "debates"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    thesis: Mapped[str] = mapped_column(Text, nullable=False)
    rounds_count: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    current_round: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    current_agent: Mapped[str | None] = mapped_column(String(20), nullable=True)

    final_winner: Mapped[str | None] = mapped_column(String(20), nullable=True)
    final_challenger_score: Mapped[float | None] = mapped_column(nullable=True)
    final_defender_score: Mapped[float | None] = mapped_column(nullable=True)
    final_verdict: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user: Mapped["User"] = relationship("User", back_populates="debates")
    rounds: Mapped[list["DebateRound"]] = relationship(
        "DebateRound", back_populates="debate", lazy="selectin", order_by="DebateRound.round_number"
    )
