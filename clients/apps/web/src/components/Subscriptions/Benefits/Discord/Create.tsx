import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { Button, Input } from 'polarkit/components/ui/atoms'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'polarkit/components/ui/dropdown-menu'
import { useDiscordGuildForOrg } from 'polarkit/hooks'
import { useState } from 'react'
import { CreateBenefitContainer, CreateBenefitProps } from '../Create'

const CreateDiscordBenefit = ({
  organization,
  onSelectBenefit,
  addBenefit,
  showBenefitSelection,
  isLoading,
}: CreateBenefitProps) => {
  const discordGuildQuery = useDiscordGuildForOrg(organization.name)
  const [roleId, setRoleId] = useState<string>(null)
  const [description, setDescription] = useState<string>(null)

  const createDiscordBenefit = (e) => {
    e.preventDefault()
    if (!roleId || !description) return

    addBenefit({
      organization_id: organization.id,
      type: 'discord',
      properties: {
        role_id: roleId,
      },
      is_tax_applicable: true,
      description: description,
    })
  }

  const discordGuild = discordGuildQuery?.data
  const hasDiscordWithRoles = discordGuild && discordGuild.roles.length > 0

  const onRoleSelected = (roleId: string) => {
    setRoleId(roleId)
  }

  return (
    <CreateBenefitContainer
      title="Discord"
      subtitle="Invite subscribers to your Discord server."
    >
      <>
        {!discordGuild && <p>You need to setup a Discord integration</p>}

        {!hasDiscordWithRoles && <p>You need to setup a Discord roles</p>}

        {hasDiscordWithRoles && (
          <form
            className="flex flex-col gap-y-6"
            onSubmit={createDiscordBenefit}
          >
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Button
                  variant="secondary"
                  className="px-2 text-left"
                  size="sm"
                >
                  <span>Select Role</span>
                  <ChevronDownIcon className="ml-2 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {discordGuild.roles.map((role) => (
                  <DropdownMenuItem onClick={() => onRoleSelected(role.id)}>
                    {role.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex flex-row items-center justify-between">
              <label>Description</label>
              <span className="dark:text-polar-400 text-sm text-gray-400"></span>
            </div>
            <Input
              name="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
              }}
            />

            <div className="mt-4 flex flex-row items-center gap-x-4">
              <Button className="self-start" type="submit" loading={isLoading}>
                Create
              </Button>
              <Button
                variant="ghost"
                className="self-start"
                onClick={showBenefitSelection}
              >
                Back
              </Button>
            </div>
          </form>
        )}
      </>
    </CreateBenefitContainer>
  )
}

export default CreateDiscordBenefit
