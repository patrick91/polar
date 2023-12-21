import { DiscordServer, Platforms } from '@polar-sh/sdk'
import { UseQueryResult, useQuery } from '@tanstack/react-query'
import { api } from '../../api'
import { defaultRetry } from './retry'

export const useDiscordGuildForOrg: (
  orgName?: string,
) => UseQueryResult<DiscordServer, Error> = (orgName?: string) =>
  useQuery({
    queryKey: ['discord', 'guild', orgName],
    queryFn: () =>
      api.integrations.discordGuildLookup({
        platform: Platforms.GITHUB,
        organizationName: orgName || '',
      }),

    retry: defaultRetry,
    enabled: !!orgName,
  })

export const useDiscordUser: () => UseQueryResult<DiscordUser, Error> = () =>
  useQuery({
    queryKey: ['discord', 'current_user'],
    queryFn: () => api.integrations.discordUserLookup(),

    retry: defaultRetry,
    enabled: true,
  })
