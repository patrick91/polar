# get server client & refresh token if needed

import httpx

from polar.config import settings
from polar.models import Organization


BASE_URL = "https://discord.com/api/v10"


class DiscordClient(httpx.AsyncClient):
    def __init__(self, *args, base_url=BASE_URL, **kwargs):
        super().__init__(*args, base_url=base_url, **kwargs)

    async def get_guild(self, id: str) -> httpx.Response:
        return await self.get(f"/guilds/{id}")


class DiscordBotClient(DiscordClient):
    def __init__(self):
        token = settings.DISCORD_BOT_TOKEN
        super().__init__(
            headers={"Authorization": f"Bot {token}"},
        )


bot_client = DiscordBotClient()

__all__ = ["bot_client"]
