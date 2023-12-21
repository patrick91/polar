from uuid import UUID
from polar.kit.schemas import Schema


class DiscordUser(Schema):
    id: UUID
    user_id: UUID
    expires_at: int


class DiscordUserCreate(Schema):
    access_token: str
    expires_at: int
    refresh_token: str
    scope: str
    user_id: UUID


class DiscordUserUpdate(Schema):
    ...
