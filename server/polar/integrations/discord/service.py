from typing import Any
from uuid import UUID

import structlog

from polar.models import Organization
from polar.postgres import AsyncSession, sql
from polar.kit.utils import utc_now

from .client import bot_client

log = structlog.get_logger()


class DiscordBot:
    def __init__(self, organization: Organization):
        self.organization = organization

    @classmethod
    async def link_organization_by_id(
        cls,
        session: AsyncSession,
        organization: Organization,
        guild_id: str,
    ) -> bool:
        statement = (
            sql.update(Organization)
            .values(
                discord_guild_id=guild_id,
                discord_bot_connected_at=utc_now(),
            )
            .where(Organization.id == organization.id)
        )
        await session.execute(statement)
        await session.commit()
        # TODO: Better success validation
        return True

    async def get_guild(self) -> dict[str, Any] | None:
        if not self.organization.has_discord_bot():
            return None

        response = await bot_client.get_guild(self.organization.discord_guild_id)
        if response.is_success:
            return response.json()
        return None
