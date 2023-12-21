'use client'

import { DashboardBody } from '@/components/Layout/DashboardLayout'
import { Section, SectionDescription } from '@/components/Settings/Section'
import Spinner from '@/components/Shared/Spinner'
import { useCurrentOrgAndRepoFromURL } from '@/hooks/org'
import { getServerURL } from 'polarkit/api'
import { ShadowBox } from 'polarkit/components/ui/atoms'
import { useDiscordGuildForOrg } from 'polarkit/hooks'

const getDiscordAuthorizeMaintainerURL = (orgName: string) => {
  const path = '/api/v1/integrations/discord/authorize_server'
  return `${getServerURL()}${path}?organization_name=${orgName}&platform=github`
}

export default function ClientPage() {
  const { org, isLoaded } = useCurrentOrgAndRepoFromURL()
  const discordGuildQuery = useDiscordGuildForOrg(org?.name)

  if (!isLoaded || !org || !discordGuildQuery.isFetched) {
    return (
      <DashboardBody>
        <Spinner />
      </DashboardBody>
    )
  }

  const guild = discordGuildQuery?.data

  return (
    <DashboardBody>
      <div className="dark:divide-polar-700 divide-y divide-gray-200">
        <Section>
          <SectionDescription title="Discord" description="Setup Discord" />

          <ShadowBox>
            {!guild && (
              <a href={getDiscordAuthorizeMaintainerURL(org.name)}>
                Connect Discord
              </a>
            )}

            {guild && (
              <>
                {guild.icon && (
                  <img
                    src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                  />
                )}
                <p>{guild.name}</p>
              </>
            )}
          </ShadowBox>
        </Section>
      </div>
    </DashboardBody>
  )
}
