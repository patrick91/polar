from typing import Any

import structlog

from polar.models import Subscription, User
from polar.models.subscription_benefit import SubscriptionBenefitDiscord
from polar.integrations.discord.service import DiscordUserService, DiscordBotService
from polar.organization.service import organization as organization_service

from ...schemas import SubscriptionBenefitDiscordUpdate
from .base import SubscriptionBenefitServiceProtocol


log = structlog.get_logger()


class SubscriptionBenefitDiscordService(
    SubscriptionBenefitServiceProtocol[
        SubscriptionBenefitDiscord, SubscriptionBenefitDiscordUpdate
    ]
):
    async def grant(
        self,
        benefit: SubscriptionBenefitDiscord,
        subscription: Subscription,
        user: User,
        grant_properties: dict[str, Any],
        *,
        update: bool = False,
        attempt: int = 1,
    ) -> dict[str, Any]:
        role_id = benefit.properties.get("role_id")
        if not role_id:
            return {}

        await self.session.refresh(subscription, {"subscription_tier"})
        org_id = subscription.subscription_tier.organization_id
        if not org_id:
            return {}

        org = await organization_service.get(self.session, org_id)
        if not org:
            return {}

        if not org.has_discord_bot():
            return {}

        account = await DiscordUserService.get_account(
            self.session, polar_user_id=user.id
        )
        if not account:
            # TODO: Notify user & delay retry
            return {}

        bot = DiscordBotService(org)

        # TODO: Save the user discord id on connection to avoid request here
        user_service = DiscordUserService(self.session, polar_user=user)
        discord_user = await user_service.me()
        if not discord_user:
            return {}

        discord_user_id = discord_user["id"]
        discord_nick = discord_user["global_name"]

        invited = await bot.add_member(
            organization=org,
            account=account,
            discord_user_id=discord_user_id,
            role_id=role_id,
            nick=discord_nick,
        )
        return {}

    async def revoke(
        self,
        benefit: SubscriptionBenefitDiscord,
        subscription: Subscription,
        user: User,
        grant_properties: dict[str, Any],
        *,
        attempt: int = 1,
    ) -> dict[str, Any]:
        return {}

    async def requires_update(
        self,
        benefit: SubscriptionBenefitDiscord,
        update: SubscriptionBenefitDiscordUpdate,
    ) -> bool:
        return False
