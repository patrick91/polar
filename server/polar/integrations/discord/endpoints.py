from typing import Any
from uuid import UUID

import structlog
from fastapi import (
    APIRouter,
    Depends,
    Request,
    Response,
)
from fastapi.responses import RedirectResponse
from httpx_oauth.clients.discord import DiscordOAuth2
from httpx_oauth.integrations.fastapi import OAuth2AuthorizeCallback
from httpx_oauth.oauth2 import OAuth2Token

from polar.auth.dependencies import Auth, UserRequiredAuth
from polar.authz.service import AccessType, Authz
from polar.config import settings
from polar.exceptions import ResourceNotFound, Unauthorized
from polar.kit import jwt
from polar.kit.http import get_safe_return_url
from polar.organization.dependencies import OrganizationNamePlatform
from polar.organization.service import organization as organization_service
from polar.postgres import AsyncSession, get_db_session
from polar.tags.api import Tags
from polar.models import Organization

from .service import DiscordBot

log = structlog.get_logger()

router = APIRouter(prefix="/integrations/discord", tags=["integrations"])

###############################################################################
# OAUTH2
###############################################################################

discord_oauth_client = DiscordOAuth2(
    settings.DISCORD_CLIENT_ID,
    settings.DISCORD_CLIENT_SECRET,
    scopes=["bot"],
)
oauth2_authorize_callback = OAuth2AuthorizeCallback(
    discord_oauth_client, route_name="integrations.discord.callback"
)


async def get_server_bot_authorization_url(
    request: Request,
    org: Organization,
) -> str:
    state = {}
    state["auth_type"] = "server"
    state["org_id"] = str(org.id)

    encoded_state = jwt.encode(data=state, secret=settings.SECRET)

    authorization_url = await discord_oauth_client.get_authorization_url(
        redirect_uri=str(request.url_for("integrations.discord.callback")),
        state=encoded_state,
        extras_params=dict(
            permissions=settings.DISCORD_BOT_PERMISSIONS,
        ),
    )
    return authorization_url


async def authorize_server_bot(
    session: AsyncSession,
    auth: UserRequiredAuth,
    authz: Authz,
    state: dict[str, Any],
    payload: dict[str, Any],
) -> str:
    org_id = state["org_id"]
    org = await organization_service.get(session, org_id)
    if not org:
        raise ResourceNotFound()

    # Require organization admin to read Discord server
    if not await authz.can(auth.subject, AccessType.write, org):
        raise Unauthorized()

    guild_id = payload["guild"]["id"]
    connected = await DiscordBot.link_organization_by_id(
        session,
        organization=org,
        guild_id=guild_id,
    )

    # TODO: Handle server already exists & better handling
    success_flag = 1 if connected else 0
    path = f"/maintainer/{org.name}/integrations?discord_setup={success_flag}"
    redirect_url = get_safe_return_url(path)
    return redirect_url


@router.get(
    "/authorize_server",
    name="integrations.discord.authorize_server",
    tags=[Tags.INTERNAL],
)
async def discord_authorize_server(
    request: Request,
    organization_name_platform: OrganizationNamePlatform,
    auth: UserRequiredAuth,
    session: AsyncSession = Depends(get_db_session),
    authz: Authz = Depends(Authz.authz),
) -> RedirectResponse:
    (organization_name, platform) = organization_name_platform
    org = await organization_service.get_by_name(session, platform, organization_name)
    if not org:
        raise ResourceNotFound()

    # Require organization admin to read Discord server
    if not await authz.can(auth.subject, AccessType.write, org):
        raise Unauthorized()

    authorization_url = await get_server_bot_authorization_url(request, org)
    return RedirectResponse(authorization_url, 303)


@router.get("/callback", name="integrations.discord.callback", tags=[Tags.INTERNAL])
async def discord_callback(
    request: Request,
    response: Response,
    auth: UserRequiredAuth,
    session: AsyncSession = Depends(get_db_session),
    access_token_state: tuple[OAuth2Token, str | None] = Depends(
        oauth2_authorize_callback
    ),
    authz: Authz = Depends(Authz.authz),
) -> RedirectResponse:
    token_data, state = access_token_state
    if not state:
        raise Unauthorized("No state")

    try:
        state_data = jwt.decode(token=state, secret=settings.SECRET)
    except jwt.DecodeError as e:
        raise Unauthorized("Invalid state") from e

    auth_type = state_data["auth_type"]
    if auth_type != "server":
        raise Unauthorized("Invalid auth type")

    redirect_url = await authorize_server_bot(
        session,
        auth,
        authz,
        state_data,
        token_data,
    )
    return RedirectResponse(redirect_url, 303)


###############################################################################
# API
###############################################################################


@router.get(
    "/guild/lookup",
    response_model=dict[str, Any],
    tags=[Tags.PUBLIC],
    description="Lookup Discord Server for Organization.",
    summary="Lookup Discord Server for Organization (Public API)",
    status_code=200,
    responses={404: {}},
)
async def discord_guild_lookup(
    organization_name_platform: OrganizationNamePlatform,
    auth: UserRequiredAuth,
    session: AsyncSession = Depends(get_db_session),
    authz: Authz = Depends(Authz.authz),
) -> dict[str, Any]:
    (organization_name, platform) = organization_name_platform
    org = await organization_service.get_by_name(session, platform, organization_name)
    if not org:
        raise ResourceNotFound()

    # Require organization admin to read Discord server
    if not await authz.can(auth.subject, AccessType.write, org):
        raise Unauthorized()

    bot = DiscordBot(org)
    guild = await bot.get_guild()
    if guild:
        return guild

    raise ResourceNotFound()
