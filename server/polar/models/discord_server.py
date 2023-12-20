from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, declared_attr, mapped_column, relationship

from polar.kit.db.models import RecordModel
from polar.kit.extensions.sqlalchemy import PostgresUUID
from polar.types import JSONDict

if TYPE_CHECKING:
    from .organization import Organization


class DiscordServer(RecordModel):
    __tablename__ = "discord_servers"

    guild_id: Mapped[str] = mapped_column(String(64), nullable=False)
    guild_name: Mapped[str] = mapped_column(String(256), nullable=False)
    guild_icon: Mapped[str] = mapped_column(String(256), nullable=False)
    access_token: Mapped[str] = mapped_column(String(1024), nullable=False)
    expires_at: Mapped[int | None] = mapped_column(Integer, nullable=True, default=None)
    refresh_token: Mapped[str | None] = mapped_column(
        String(1024), nullable=True, default=None
    )
    guild_metadata: Mapped[JSONDict | None] = mapped_column(
        JSONB, nullable=True, default=dict
    )

    organization_id: Mapped[UUID] = mapped_column(
        PostgresUUID,
        ForeignKey("organizations.id", ondelete="cascade"),
        unique=True,
        nullable=False,
    )

    @declared_attr
    def organizations(cls) -> Mapped[list["Organization"]]:
        return relationship("Organization", lazy="raise")
