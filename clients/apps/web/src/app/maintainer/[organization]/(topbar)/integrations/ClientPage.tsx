'use client'

import { DashboardBody } from '@/components/Layout/DashboardLayout'
import { Section, SectionDescription } from '@/components/Settings/Section'
import Spinner from '@/components/Shared/Spinner'
import { useCurrentOrgAndRepoFromURL } from '@/hooks/org'
import { getServerURL } from 'polarkit/api'
import { ShadowBox } from 'polarkit/components/ui/atoms'
import { useDiscordServerForOrg } from 'polarkit/hooks'

const getDiscordAuthorizeMaintainerURL = (orgName: string) => {
  const path = '/api/v1/integrations/discord/authorize_server'
  return `${getServerURL()}${path}?organization_name=${orgName}&platform=github`
}

export default function ClientPage() {
  const { org, isLoaded } = useCurrentOrgAndRepoFromURL()
  const discordServerQuery = useDiscordServerForOrg(org?.name)

  if (!isLoaded || !org || !discordServerQuery.isFetched) {
    return (
      <DashboardBody>
        <Spinner />
      </DashboardBody>
    )
  }

  const server = discordServerQuery?.data

  return (
    <DashboardBody>
      <div className="dark:divide-polar-700 divide-y divide-gray-200">
        <Section>
          <SectionDescription title="Discord" description="Setup Discord" />

          <ShadowBox>
            {!server && (
              <a href={getDiscordAuthorizeMaintainerURL(org.name)}>
                Connect Discord
              </a>
            )}

            {server && (
              <>
                {server.guild_icon && (
                  <img
                    src={`https://cdn.discordapp.com/icons/${server.guild_id}/${server.guild_icon}.png`}
                  />
                )}
                <p>{server.guild_name}</p>
              </>
            )}
          </ShadowBox>
        </Section>
      </div>
    </DashboardBody>
  )
}
