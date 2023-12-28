import { SubscriptionBenefitUpdate } from '@polar-sh/sdk'
import { Button } from 'polarkit/components/ui/atoms'
import { Form } from 'polarkit/components/ui/form'
import { useUpdateSubscriptionBenefit } from 'polarkit/hooks'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { UpdateBenefitProps } from '../Update'
import CustomBenefitForm from './Form'

const UpdateCustomBenefit = ({
  organization,
  benefit,
  hideModal,
}: UpdateBenefitProps) => {
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
            <CustomBenefitForm update={true} />
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
export default UpdateCustomBenefit
