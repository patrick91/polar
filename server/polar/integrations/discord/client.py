from typing import Any

import httpx
import json
import structlog

from polar.config import settings
from polar.postgres import AsyncSession
from polar.models import Organization

log = structlog.get_logger()

BASE_URL = "https://discord.com/api/v10"


class DiscordClient(httpx.AsyncClient):
    def __init__(self, *args, base_url=BASE_URL, **kwargs):
        headers = {"Content-Type": "application/json"}
        custom_headers = kwargs.pop("headers")
        if custom_headers:
            headers.update(custom_headers)

        super().__init__(*args, base_url=base_url, headers=headers, **kwargs)

    async def get_me(self) -> dict[str, Any] | None:
        response = await self.get("/users/@me")
        if not response.is_success:
            return None
        return response.json()

    async def get_guild(
        self,
        id: str,
        exclude_bot_roles: bool = True,
    ) -> dict[str, Any] | None:
        response = await self.get(f"/guilds/{id}")
        if not response.is_success:
            return None

        data = response.json()
        if not exclude_bot_roles:
            return data

        roles = []
        given_roles = data["roles"]
        for role in given_roles:
            # Bots/integrations are considered managed.
            # https://discord.com/developers/docs/topics/permissions#role-object-role-tags-structure
            if not role["managed"]:
                roles.append(role)

        data["roles"] = roles
        return data

    async def add_member(
        self,
        guild_id: str,
        discord_user_id: str,
        discord_user_access_token: str,
        role_id: str,
        nick: str | None = None,
    ) -> dict[str, Any] | None:
        endpoint = f"/guilds/{guild_id}/members/{discord_user_id}"

        data = {}
        data["access_token"] = discord_user_access_token
        data["roles"] = [role_id]
        if nick:
            data["nick"] = nick

        response = await self.put(endpoint, json=data)
        if response.status_code not in (201, 204):
            log.error("discord.add_member.failed", response.content)
            return None

        if response.status_code == 201:
            log.info(
                "discord.add_member.success",
                guild_id=guild_id,
                discord_user_id=discord_user_id,
            )
            return response.json()

        log.debug(
            "discord.add_member.already_present",
            guild_id=guild_id,
            discord_user_id=discord_user_id,
        )
        return await self.add_member_role(
            guild_id=guild_id,
            discord_user_id=discord_user_id,
            role_id=role_id,
        )

    async def add_member_role(
        self,
        guild_id: str,
        discord_user_id: str,
        role_id: str,
    ) -> dict[str, Any] | None:
        endpoint = f"/guilds/{guild_id}/members/{discord_user_id}/roles/{role_id}"

        # TODO: Need to respect (merge) roles other then what Polar controls?
        response = await self.put(endpoint)
        if not response.is_success:
            log.error("discord.modify_member_roles.failed", response.content)
            return None

        log.info(
            "discord.modify_member_roles.success",
            guild_id=guild_id,
            discord_user_id=discord_user_id,
            role_id=role_id,
        )
        return response.json()


bot_client = DiscordClient(
    headers={"Authorization": f"Bot {settings.DISCORD_BOT_TOKEN}"}
)

__all__ = ["DiscordClient", "bot_client"]
