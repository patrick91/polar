import structlog

from polar.kit.services import ResourceService
from polar.postgres import AsyncSession
from polar.models import DiscordServer

from .schemas import DiscordServerCreate, DiscordServerUpdate

log = structlog.get_logger()


class DiscordServerService(
    ResourceService[DiscordServer, DiscordServerCreate, DiscordServerUpdate]
):
    ...


discord_server = DiscordServerService(DiscordServer)

__all__ = ["discord_server"]
