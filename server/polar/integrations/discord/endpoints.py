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

from .schemas import DiscordServerCreate, DiscordServer
from .service import discord_server

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
    state["org_name"] = org.name

    # state["org_name"]
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
    session: AsyncSession, state: dict[str, Any], payload: dict[str, Any]
) -> str:
    org_id = state["org_id"]
    org_name = state["org_name"]

    new_server = DiscordServerCreate.from_discord_authorization(org_id, payload)
    server = await discord_server.create(session, new_server)

    # TODO: Handle server already exists & better handling
    success_flag = 1 if server else 0
    path = f"/maintainer/{org_name}/integrations?discord_setup={success_flag}"
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
    session: AsyncSession = Depends(get_db_session),
    access_token_state: tuple[OAuth2Token, str | None] = Depends(
        oauth2_authorize_callback
    ),
    auth: Auth = Depends(Auth.optional_user),
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

    redirect_url = await authorize_server_bot(session, state_data, token_data)
    return RedirectResponse(redirect_url, 303)


###############################################################################
# API
###############################################################################


@router.get(
    "/servers/lookup",
    response_model=DiscordServer,
    tags=[Tags.PUBLIC],
    description="Lookup Discord Server for Organization.",
    summary="Lookup Discord Server for Organization (Public API)",
    status_code=200,
    responses={404: {}},
)
async def discord_server_lookup(
    organization_name_platform: OrganizationNamePlatform,
    auth: UserRequiredAuth,
    session: AsyncSession = Depends(get_db_session),
    authz: Authz = Depends(Authz.authz),
) -> DiscordServer:
    (organization_name, platform) = organization_name_platform
    org = await organization_service.get_by_name(session, platform, organization_name)
    if not org:
        raise ResourceNotFound()

    # Require organization admin to read Discord server
    if not await authz.can(auth.subject, AccessType.write, org):
        raise Unauthorized()

    server = await discord_server.get_by(session, organization_id=org.id)
    if server:
        return DiscordServer.from_orm(server)

    raise ResourceNotFound()
