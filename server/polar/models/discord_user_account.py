from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from polar.kit.db.models import RecordModel
from polar.kit.extensions.sqlalchemy import PostgresUUID

if TYPE_CHECKING:
    from .user import User


class DiscordUserAccount(RecordModel):
    __tablename__ = "discord_user_accounts"

    access_token: Mapped[str] = mapped_column(String(1024), nullable=False, unique=True)
    expires_at: Mapped[int] = mapped_column(Integer, nullable=False)
    refresh_token: Mapped[str] = mapped_column(
        String(1024), nullable=False, default=None, unique=True
    )
    scope: Mapped[str] = mapped_column(String(256), nullable=False)
    user_id: Mapped[UUID] = mapped_column(
        PostgresUUID,
        ForeignKey("users.id", ondelete="cascade"),
        nullable=False,
        unique=True,
    )

    user: Mapped["User"] = relationship("User")
