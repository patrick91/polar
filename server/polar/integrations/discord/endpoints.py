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

from polar.auth.dependencies import UserRequiredAuth
from polar.authz.service import AccessType, Authz
from polar.config import settings
from polar.exceptions import ResourceAlreadyExists, ResourceNotFound, Unauthorized
from polar.kit import jwt
from polar.kit.http import get_safe_return_url
from polar.organization.dependencies import OrganizationNamePlatform
from polar.organization.service import organization as organization_service
from polar.postgres import AsyncSession, get_db_session
from polar.tags.api import Tags

from .schemas import DiscordUserCreate
from .service import DiscordBotService, DiscordUserService

log = structlog.get_logger()

router = APIRouter(prefix="/integrations/discord", tags=["integrations"])


###############################################################################
# OAUTH2
###############################################################################


def get_decoded_token_state(
    access_token_state: tuple[OAuth2Token, str | None],
) -> tuple[OAuth2Token, dict[str, Any]]:
    token_data, state = access_token_state
    if not state:
        raise Unauthorized("No state")

    try:
        state_data = jwt.decode(token=state, secret=settings.SECRET)
    except jwt.DecodeError as e:
        raise Unauthorized("Invalid state") from e

    return (token_data, state_data)


# -------------------------------------------------------------------------------
# BOT
# -------------------------------------------------------------------------------

discord_bot_oauth_client = DiscordOAuth2(
    settings.DISCORD_CLIENT_ID,
    settings.DISCORD_CLIENT_SECRET,
    scopes=["bot"],
)
oauth2_bot_authorize_callback = OAuth2AuthorizeCallback(
    discord_bot_oauth_client, route_name="integrations.discord.bot_callback"
)


@router.get(
    "/authorize/bot",
    name="integrations.discord.bot_authorize",
    tags=[Tags.INTERNAL],
)
async def discord_bot_authorize(
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

    state = {}
    state["org_id"] = str(org.id)

    encoded_state = jwt.encode(data=state, secret=settings.SECRET)

    authorization_url = await discord_bot_oauth_client.get_authorization_url(
        redirect_uri=str(request.url_for("integrations.discord.bot_callback")),
        state=encoded_state,
        extras_params=dict(
            permissions=settings.DISCORD_BOT_PERMISSIONS,
        ),
    )
    return RedirectResponse(authorization_url, 303)


@router.get(
    "/callback/bot", name="integrations.discord.bot_callback", tags=[Tags.INTERNAL]
)
async def discord_bot_callback(
    request: Request,
    response: Response,
    auth: UserRequiredAuth,
    session: AsyncSession = Depends(get_db_session),
    access_token_state: tuple[OAuth2Token, str | None] = Depends(
        oauth2_bot_authorize_callback
    ),
    authz: Authz = Depends(Authz.authz),
) -> RedirectResponse:
    data, state = get_decoded_token_state(access_token_state)

    org_id = state["org_id"]
    org = await organization_service.get(session, org_id)
    if not org:
        raise ResourceNotFound()

    # Require organization admin to read Discord server
    if not await authz.can(auth.subject, AccessType.write, org):
        raise Unauthorized()

    guild_id = data["guild"]["id"]
    connected = await DiscordBotService.link_organization_by_id(
        session,
        organization=org,
        guild_id=guild_id,
    )

    # TODO: Handle server already exists & better handling
    success_flag = 1 if connected else 0
    path = f"/maintainer/{org.name}/integrations?discord_setup={success_flag}"
    redirect_url = get_safe_return_url(path)

    return RedirectResponse(redirect_url, 303)


# -------------------------------------------------------------------------------
# USER AUTHORIZATION
# -------------------------------------------------------------------------------

discord_user_oauth_client = DiscordOAuth2(
    settings.DISCORD_CLIENT_ID,
    settings.DISCORD_CLIENT_SECRET,
    scopes=["identify", "guilds.join"],
)
oauth2_user_authorize_callback = OAuth2AuthorizeCallback(
    discord_user_oauth_client, route_name="integrations.discord.user_callback"
)


@router.get(
    "/authorize/user",
    name="integrations.discord.user_authorize",
    tags=[Tags.INTERNAL],
)
async def discord_user_authorize(
    request: Request,
    auth: UserRequiredAuth,
    session: AsyncSession = Depends(get_db_session),
    authz: Authz = Depends(Authz.authz),
) -> RedirectResponse:
    state = {}
    state["auth_type"] = "user"
    state["user_id"] = str(auth.user.id)

    encoded_state = jwt.encode(data=state, secret=settings.SECRET)

    authorization_url = await discord_user_oauth_client.get_authorization_url(
        redirect_uri=str(request.url_for("integrations.discord.user_callback")),
        state=encoded_state,
        # extras_params=dict(prompt="consent"),
    )
    return RedirectResponse(authorization_url, 303)


@router.get(
    "/callback/user", name="integrations.discord.user_callback", tags=[Tags.INTERNAL]
)
async def discord_user_callback(
    auth: UserRequiredAuth,
    session: AsyncSession = Depends(get_db_session),
    access_token_state: tuple[OAuth2Token, str | None] = Depends(
        oauth2_user_authorize_callback
    ),
) -> RedirectResponse:
    data, state = get_decoded_token_state(access_token_state)

    user_id = UUID(state["user_id"])
    if user_id != auth.user.id:
        raise Unauthorized()

    to_create = DiscordUserCreate(
        access_token=data["access_token"],
        expires_at=data["expires_at"],
        refresh_token=data["refresh_token"],
        scope=data["scope"],
        user_id=auth.user.id,
    )
    try:
        user = await DiscordUserService.link_account(session, to_create)
        status = "success"
    except ResourceAlreadyExists:
        status = "already_connected"

    redirect_to = get_safe_return_url(f"/settings?discord_status={status}")
    return RedirectResponse(redirect_to, 303)


###############################################################################
# API
###############################################################################


@router.get(
    "/user/lookup",
    response_model=dict[str, Any],
    tags=[Tags.PUBLIC],
    description="Get Discord Account for Authenticated Polar User.",
    summary="Lookup Discord Account for Authenticated Polar User (Public API)",
    status_code=200,
    responses={404: {}},
)
async def discord_user_lookup(
    auth: UserRequiredAuth,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    discord_user_service = DiscordUserService(session, auth.user)
    me = await discord_user_service.me()
    if not me:
        raise ResourceNotFound()
    return me


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

    bot = DiscordBotService(org)
    guild = await bot.get_guild()
    if guild:
        return guild

    raise ResourceNotFound()
