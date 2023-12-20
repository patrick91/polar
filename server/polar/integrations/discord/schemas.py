from typing import Any, Self
from uuid import UUID


from polar.kit.schemas import Schema


class DiscordServer(Schema):
    guild_id: str
    guild_name: str
    guild_icon: str
    guild_metadata: dict[str, Any]
    organization_id: UUID


class DiscordServerUpdate(Schema):
    ...


class DiscordServerCreate(Schema):
    guild_id: str
    guild_name: str
    guild_icon: str
    access_token: str
    expires_at: int
    refresh_token: str
    guild_metadata: dict[str, Any]
    organization_id: UUID

    @classmethod
    def from_discord_authorization(
        cls, organization_id: UUID, payload: dict[str, Any]
    ) -> Self:
        guild = payload["guild"]
        guild.pop("roles")
        return cls(
            guild_id=guild["id"],
            guild_name=guild["name"],
            guild_icon=guild["icon"],
            access_token=payload["access_token"],
            expires_at=payload["expires_at"],
            refresh_token=payload["refresh_token"],
            guild_metadata=guild,
            organization_id=organization_id,
        )
