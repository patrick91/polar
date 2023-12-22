from typing import Any
from uuid import UUID

import structlog
from sqlalchemy.exc import IntegrityError

from polar.exceptions import ResourceAlreadyExists
from polar.kit.utils import utc_now
from polar.models import DiscordUserAccount, Organization, User
from polar.postgres import AsyncSession, sql

from .client import DiscordClient, bot_client
from .schemas import DiscordUserCreate

log = structlog.get_logger()


class DiscordUserService:
    def __init__(self, session: AsyncSession, polar_user: User):
        self.session = session
        self.polar_user = polar_user
        self._client_initialized = False
        self._client: DiscordClient | None = None
        self._account: DiscordUserAccount | None = None

    @classmethod
    async def get_account(
        cls,
        session: AsyncSession,
        polar_user_id: UUID,
    ) -> DiscordUserAccount | None:
        statement = sql.select(DiscordUserAccount).where(
            DiscordUserAccount.user_id == polar_user_id
        )
        res = await session.execute(statement)
        await session.commit()
        account = res.scalars().one_or_none()
        return account

    @classmethod
    async def link_account(
        cls,
        session: AsyncSession,
        create_obj: DiscordUserCreate,
    ) -> DiscordUserAccount:
        try:
            user = await DiscordUserAccount.create(
                session, autocommit=True, **create_obj.dict()
            )
            return user
        except IntegrityError:
            raise ResourceAlreadyExists()

    async def me(self) -> dict[str, Any] | None:
        client = await self._get_client()
        if client:
            return await client.get_me()
        return None

    async def _get_client(self) -> DiscordClient | None:
        if self._client_initialized:
            return self._client

        self._client_initialized = True
        account = await self.get_account(self.session, self.polar_user.id)
        if not account:
            return None

        self._account = account
        client = DiscordClient(
            headers={"Authorization": f"Bearer {self._account.access_token}"}
        )
        self._client = client
        return self._client


class DiscordBotService:
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

        return await bot_client.get_guild(
            id=self.organization.discord_guild_id,
            exclude_bot_roles=True,
        )

    async def add_member(
        self,
        organization: Organization,
        account: DiscordUserAccount,
        discord_user_id: str,  # HACK  - FIX ME
        role_id: str,
        nick: str | None,
    ) -> dict[str, Any] | None:
        if not organization.discord_guild_id:
            return None

        return await bot_client.add_member(
            guild_id=organization.discord_guild_id,
            discord_user_id=discord_user_id,
            discord_user_access_token=account.access_token,
            role_id=role_id,
            nick=nick,
        )
