from typing import Any

import httpx

from polar.config import settings
from polar.postgres import AsyncSession
from polar.models import Organization


BASE_URL = "https://discord.com/api/v10"


class DiscordClient(httpx.AsyncClient):
    def __init__(self, *args, base_url=BASE_URL, **kwargs):
        super().__init__(*args, base_url=base_url, **kwargs)

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


bot_client = DiscordClient(
    headers={"Authorization": f"Bot {settings.DISCORD_BOT_TOKEN}"}
)

__all__ = ["DiscordClient", "bot_client"]
