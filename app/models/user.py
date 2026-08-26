import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, Text, event
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    debates: Mapped[list["Debate"]] = relationship("Debate", back_populates="user", lazy="selectin")


@event.listens_for(User, "before_insert")
def normalize_email(mapper, connection, target):  # noqa: ARG001
    if target.email:
        target.email = target.email.lower().strip()


@event.listens_for(User, "before_update")
def normalize_email_update(mapper, connection, target):  # noqa: ARG001
    if target.email:
        target.email = target.email.lower().strip()
