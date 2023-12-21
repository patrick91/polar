import {
  AutoAwesome,
  LoyaltyOutlined,
  MoreVertOutlined,
} from '@mui/icons-material'
import {
  Organization,
  SubscriptionBenefitCreate,
  SubscriptionBenefitUpdate,
  SubscriptionTierBenefit,
} from '@polar-sh/sdk'
import { Button, Input, Switch } from 'polarkit/components/ui/atoms'
import { Checkbox } from 'polarkit/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'polarkit/components/ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from 'polarkit/components/ui/form'
import {
  useCreateSubscriptionBenefit,
  useDeleteSubscriptionBenefit,
  useDiscordGuildForOrg,
  useUpdateSubscriptionBenefit,
} from 'polarkit/hooks'
import { useCallback, useState } from 'react'
import { useForm, useFormContext } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import { Modal } from '../Modal'
import { useModal } from '../Modal/useModal'
import { ConfirmModal } from '../Shared/ConfirmModal'
import {
  SubscriptionBenefit,
  isPremiumArticlesBenefit,
  resolveBenefitIcon,
} from './utils'

interface BenefitRowProps {
  organization: Organization
  benefit: SubscriptionBenefit
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

const BenefitRow = ({
  organization,
  benefit,
  checked,
  onCheckedChange,
}: BenefitRowProps) => {
  const {
    isShown: isEditShown,
    toggle: toggleEdit,
    hide: hideEdit,
  } = useModal()
  const {
    isShown: isDeleteShown,
    hide: hideDelete,
    toggle: toggleDelete,
  } = useModal()

  const deleteSubscriptionBenefit = useDeleteSubscriptionBenefit(
    organization.name,
  )

  const handleDeleteSubscriptionBenefit = useCallback(() => {
    deleteSubscriptionBenefit.mutateAsync({ id: benefit.id })
  }, [deleteSubscriptionBenefit, benefit])

  return (
    <div className="flex flex-row items-center justify-between py-2">
      <div className="flex flex-row items-center gap-x-4">
        <div
          className={twMerge(
            'dark:bg-polar-700 dark:text-polar-400 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-300',
            checked &&
              'bg-blue-500 text-blue-500 shadow dark:border dark:border-blue-400 dark:bg-blue-500',
          )}
        >
          {resolveBenefitIcon(benefit, checked)}
        </div>
        <span
          className={twMerge(
            'text-sm',
            !checked && 'dark:text-polar-500 text-gray-400',
          )}
        >
          {benefit.description}
        </span>
      </div>
      <div className="flex flex-row items-center gap-x-4 text-[14px]">
        {isPremiumArticlesBenefit(benefit) && (
          <div className="flex flex-row items-center gap-1.5 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white shadow dark:border dark:border-blue-400 dark:bg-blue-600">
            <AutoAwesome className="!h-3 !w-3" />
            Recommended
          </div>
        )}
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={!benefit.selectable}
        />
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Button
              className={
                'border-none bg-transparent text-[16px] opacity-50 transition-opacity hover:opacity-100 dark:bg-transparent'
              }
              size="icon"
              variant="secondary"
            >
              <MoreVertOutlined fontSize="inherit" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="dark:bg-polar-800 bg-gray-50 shadow-lg"
          >
            <DropdownMenuItem onClick={toggleEdit}>Edit</DropdownMenuItem>
            {benefit.deletable && (
              <DropdownMenuItem onClick={toggleDelete}>Delete</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Modal
        className="overflow-visible"
        isShown={isEditShown}
        hide={hideEdit}
        modalContent={
          <UpdateSubscriptionTierBenefitModalContent
            organization={organization}
            benefit={benefit}
            hideModal={hideEdit}
          />
        }
      />
      <ConfirmModal
        isShown={isDeleteShown}
        hide={hideDelete}
        title="Delete Benefit"
        description={`Deleting a benefit will remove it from other Subscription tiers & revokes it for existing subscribers. Are you sure?`}
        onConfirm={handleDeleteSubscriptionBenefit}
        destructive
      />
    </div>
  )
}

interface SubscriptionTierBenefitsFormProps {
  organization: Organization
  benefits: SubscriptionTierBenefit[]
  organizationBenefits: SubscriptionBenefit[]
  onSelectBenefit: (benefit: SubscriptionTierBenefit) => void
  onRemoveBenefit: (benefit: SubscriptionTierBenefit) => void
  className?: string
}

const SubscriptionTierBenefitsForm = ({
  benefits,
  organization,
  organizationBenefits,
  onSelectBenefit,
  onRemoveBenefit,
  className,
}: SubscriptionTierBenefitsFormProps) => {
  const { isShown, toggle, hide } = useModal()

  const handleCheckedChange = useCallback(
    (benefit: SubscriptionTierBenefit) => (checked: boolean) => {
      if (checked) {
        onSelectBenefit(benefit)
      } else {
        onRemoveBenefit(benefit)
      }
    },
    [onSelectBenefit, onRemoveBenefit],
  )

  return (
    <>
      <div className={twMerge('flex flex-col gap-y-6', className)}>
        <div className="flex flex-row items-center justify-between">
          <h2 className="dark:text-polar-50 text-lg text-gray-950">Benefits</h2>
          <Button
            size="sm"
            variant="secondary"
            className="self-start"
            onClick={toggle}
          >
            + Add
          </Button>
        </div>
        <div className="dark:bg-polar-800 dark:border-polar-700 rounded-2xl border border-gray-200 bg-white px-6 py-4">
          <div className="flex flex-col gap-y-6">
            <div className="flex flex-col gap-y-4">
              <div className="flex flex-col">
                {organizationBenefits.length > 0 ? (
                  organizationBenefits.map((benefit) => (
                    <BenefitRow
                      key={benefit.id}
                      organization={organization}
                      benefit={benefit}
                      checked={benefits.some((b) => b.id === benefit.id)}
                      onCheckedChange={handleCheckedChange(benefit)}
                    />
                  ))
                ) : (
                  <div className="dark:text-polar-400 flex flex-col items-center gap-y-6 py-12 text-gray-400">
                    <LoyaltyOutlined fontSize="large" />
                    <h4 className="text-sm">
                      You haven&apos;t configured any benefits yet
                    </h4>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        className="overflow-visible"
        isShown={isShown}
        hide={toggle}
        modalContent={
          <AddSubscriptionTierBenefitModalContent
            organization={organization}
            hideModal={hide}
            onSelectBenefit={(benefit) => {
              onSelectBenefit(benefit)
              hide()
            }}
          />
        }
      />
    </>
  )
}

export default SubscriptionTierBenefitsForm

interface NewSubscriptionTierBenefitModalContentProps {
  organization: Organization
  onSelectBenefit: (benefit: SubscriptionTierBenefit) => void
  addBenefit: (benefit: SubscriptionBenefitCreate) => void
  hideModal: () => void
  isLoading: boolean
}

const NewSubscriptionTierBenefitModalContent = ({
  organization,
  onSelectBenefit,
  addBenefit,
  hideModal,
  isLoading,
}: NewSubscriptionTierBenefitModalContentProps) => {
  const form = useForm<SubscriptionBenefitCreate>({
    defaultValues: {
      organization_id: organization.id,
      properties: {},
      type: 'custom',
      is_tax_applicable: false,
    },
  })

  const { handleSubmit } = form

  return (
    <div className="flex flex-col gap-y-6 px-8 py-10">
      <div>
        <h2 className="text-lg">Create Subscription Benefit</h2>
        <p className="dark:text-polar-400 mt-2 text-sm text-gray-400">
          Created benefits will be available for use in all tiers of your
          organization
        </p>
      </div>
      <div className="flex flex-col gap-y-6">
        <Form {...form}>
          <form
            className="flex flex-col gap-y-6"
            onSubmit={handleSubmit(addBenefit)}
          >
            <NewBenefitForm />
            <div className="mt-4 flex flex-row items-center gap-x-4">
              <Button className="self-start" type="submit" loading={isLoading}>
                Create
              </Button>
              <Button
                variant="ghost"
                className="self-start"
                onClick={hideModal}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

interface RecommendedSubscriptionTierBenefitProps {
  organization: Organization
  onSelectBenefit: (benefit: SubscriptionTierBenefit) => void
  addBenefit: (benefit: SubscriptionBenefitCreate) => void
  showCustom: (state: boolean) => void
  hideModal: () => void
  isLoading: boolean
}

const RecommendedSubscriptionTierBenefits = ({
  organization,
  onSelectBenefit,
  addBenefit,
  showCustom,
  hideModal,
  isLoading,
}: RecommendedSubscriptionTierBenefitProps) => {
  const discordGuildQuery = useDiscordGuildForOrg(organization.name)

  const createDiscordBenefit = () => {
    addBenefit({
      organization_id: organization.id,
      type: 'discord',
      properties: {
        // TODO: MAKE THIS DYNAMIC
        role_id: '1187407263531536455',
      },
      is_tax_applicable: true,
      description: 'Discord Access',
    })
  }

  const discordGuild = discordGuildQuery?.data

  return (
    <div className="flex flex-col gap-y-6 px-8 py-10">
      <div>
        <h2 className="text-lg">Add Subscription Benefit</h2>
        <p className="dark:text-polar-400 mt-2 text-sm text-gray-400">
          Created benefits will be available for use in all tiers of your
          organization
        </p>
      </div>
      <div className="flex flex-col gap-y-6">
        <ul className="flex flex-col gap-y-4">
          <li>
            <a href="#" onClick={createDiscordBenefit}>
              Discord Access
              {discordGuildQuery.isFetched && <span>{discordGuild.name}</span>}
            </a>
          </li>
        </ul>

        <a href="#" onClick={() => showCustom(true)}>
          Create Custom
        </a>
      </div>
    </div>
  )
}
interface AddSubscriptionTierBenefitModalContentProps {
  organization: Organization
  onSelectBenefit: (benefit: SubscriptionTierBenefit) => void
  hideModal: () => void
}

const AddSubscriptionTierBenefitModalContent = ({
  organization,
  onSelectBenefit,
  hideModal,
}: AddSubscriptionTierBenefitModalContentProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showCustom, setShowCustom] = useState(false)

  const createSubscriptionBenefit = useCreateSubscriptionBenefit(
    organization.name,
  )

  const addBenefit = useCallback(
    async (newBenefit: SubscriptionBenefitCreate) => {
      try {
        setIsLoading(true)
        const benefit = await createSubscriptionBenefit.mutateAsync(newBenefit)

        if (benefit) {
          onSelectBenefit(benefit)
          hideModal()
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    },
    [hideModal, onSelectBenefit, createSubscriptionBenefit],
  )

  if (showCustom) {
    return (
      <NewSubscriptionTierBenefitModalContent
        organization={organization}
        onSelectBenefit={onSelectBenefit}
        addBenefit={addBenefit}
        hideModal={hideModal}
        isLoading={isLoading}
      />
    )
  }

  return (
    <RecommendedSubscriptionTierBenefits
      organization={organization}
      onSelectBenefit={onSelectBenefit}
      addBenefit={addBenefit}
      hideModal={hideModal}
      showCustom={setShowCustom}
      isLoading={isLoading}
    />
  )
}

interface UpdateSubscriptionTierBenefitModalContentProps {
  organization: Organization
  benefit: SubscriptionTierBenefit
  hideModal: () => void
}

const UpdateSubscriptionTierBenefitModalContent = ({
  organization,
  benefit,
  hideModal,
}: UpdateSubscriptionTierBenefitModalContentProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const updateSubscriptionBenefit = useUpdateSubscriptionBenefit(
    organization.name,
  )

  const handleUpdateNewBenefit = useCallback(
    async (subscriptionBenefitUpdate: SubscriptionBenefitUpdate) => {
      try {
        setIsLoading(true)
        await updateSubscriptionBenefit.mutateAsync({
          id: benefit.id,
          subscriptionBenefitUpdate,
        })

        hideModal()
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    },
    [hideModal, updateSubscriptionBenefit, benefit],
  )

  const form = useForm<SubscriptionBenefitUpdate>({
    defaultValues: {
      organization_id: organization.id,
      ...benefit,
    },
    shouldUnregister: true,
  })

  const { handleSubmit } = form

  return (
    <div className="flex flex-col gap-y-6 px-8 py-10">
      <div>
        <h2 className="text-lg">Update Subscription Benefit</h2>
        <p className="dark:text-polar-400 mt-2 text-sm text-gray-400">
          Tax applicability and Benefit type cannot be updated
        </p>
      </div>
      <div className="flex flex-col gap-y-6">
        <Form {...form}>
          <form
            className="flex flex-col gap-y-6"
            onSubmit={handleSubmit(handleUpdateNewBenefit)}
          >
            <NewBenefitForm update={true} />
            <div className="mt-4 flex flex-row items-center gap-x-4">
              <Button className="self-start" type="submit" loading={isLoading}>
                Update
              </Button>
              <Button
                variant="ghost"
                className="self-start"
                onClick={hideModal}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

interface NewBenefitFormProps {
  update?: boolean
}

const NewBenefitForm = ({ update = false }: NewBenefitFormProps) => {
  const { control } = useFormContext<SubscriptionBenefitCreate>()

  return (
    <>
      <FormField
        control={control}
        name="description"
        rules={{
          minLength: {
            value: 3,
            message: 'Description length must be at least 3 characters long',
          },
          maxLength: {
            message: 'Description length must be less than 42 characters long',
            value: 42,
          },
        }}
        render={({ field }) => {
          return (
            <FormItem>
              <div className="flex flex-row items-center justify-between">
                <FormLabel>Description</FormLabel>
                <span className="dark:text-polar-400 text-sm text-gray-400">
                  {field.value?.length ?? 0} / 42
                </span>
              </div>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }}
      />
      {!update && (
        <FormField
          control={control}
          name="is_tax_applicable"
          render={({ field }) => {
            return (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    defaultChecked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm leading-none">
                  Tax Applicable
                </FormLabel>
              </FormItem>
            )
          }}
        />
      )}
    </>
  )
}
