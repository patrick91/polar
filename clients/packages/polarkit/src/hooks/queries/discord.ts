import { DiscordServer, Platforms } from '@polar-sh/sdk'
import { UseQueryResult, useQuery } from '@tanstack/react-query'
import { api } from '../../api'
import { defaultRetry } from './retry'

export const useDiscordServerForOrg: (
  orgName?: string,
) => UseQueryResult<DiscordServer, Error> = (orgName?: string) =>
  useQuery({
    queryKey: ['discord', 'lookup', orgName],
    queryFn: () =>
      api.integrations.discordServerLookup({
        platform: Platforms.GITHUB,
        organizationName: orgName || '',
      }),

    retry: defaultRetry,
    enabled: !!orgName,
  })
