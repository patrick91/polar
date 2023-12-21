import { getServerURL } from 'polarkit/api'
import { ShadowListGroup } from 'polarkit/components/ui/atoms'

import { useDiscordUser } from 'polarkit/hooks'

const DiscordAppSettings = () => {
  const discordUserQuery = useDiscordUser()

  const getDiscordAuthorizeUserURL = () => {
    return `${getServerURL()}/api/v1/integrations/discord/authorize/user`
  }

  const discordUser = discordUserQuery?.data
  if (discordUserQuery.isFetching) {
    return <></>
  }

  if (!discordUser) {
    return (
      <>
        <a href={getDiscordAuthorizeUserURL()}>Connect Discord</a>
      </>
    )
  }

  return (
    <>
      <p>Welcome {discordUser.username}</p>
    </>
  )
}

const ConnectedAppSettings = () => {
  return (
    <>
      <ShadowListGroup>
        <ShadowListGroup.Item>
          <DiscordAppSettings />
        </ShadowListGroup.Item>
      </ShadowListGroup>
    </>
  )
}

export default ConnectedAppSettings
