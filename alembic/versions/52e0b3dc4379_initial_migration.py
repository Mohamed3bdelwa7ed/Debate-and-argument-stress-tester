"""Initial migration

Revision ID: 52e0b3dc4379
Revises: 
Create Date: 2026-08-26 10:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "52e0b3dc4379"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "debates",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("thesis", sa.Text, nullable=False),
        sa.Column("rounds_count", sa.Integer, nullable=False),
        sa.Column("status", sa.String(20), nullable=False, default="pending"),
        sa.Column("current_round", sa.Integer, nullable=False, default=0),
        sa.Column("current_agent", sa.String(20), nullable=True),
        sa.Column("final_winner", sa.String(20), nullable=True),
        sa.Column("final_challenger_score", sa.Float, nullable=True),
        sa.Column("final_defender_score", sa.Float, nullable=True),
        sa.Column("final_verdict", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "debate_rounds",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("debate_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("debates.id", ondelete="CASCADE"), nullable=False),
        sa.Column("round_number", sa.Integer, nullable=False),
        sa.Column("challenger_arguments", postgresql.JSONB, nullable=True),
        sa.Column("defender_rebuttals", postgresql.JSONB, nullable=True),
        sa.Column("challenger_score", sa.Float, nullable=True),
        sa.Column("defender_score", sa.Float, nullable=True),
        sa.Column("winner", sa.String(20), nullable=True),
        sa.Column("judge_reason", sa.Text, nullable=True),
        sa.Column("strongest_argument", sa.Text, nullable=True),
        sa.Column("weakest_rebuttal", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("debate_rounds")
    op.drop_table("debates")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
