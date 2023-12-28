import { SubscriptionBenefitCreate } from '@polar-sh/sdk'
import { Button } from 'polarkit/components/ui/atoms'
import { Form } from 'polarkit/components/ui/form'
import { useForm } from 'react-hook-form'
import { CreateBenefitProps } from '../Create'
import CustomBenefitForm from './Form'

const CreateCustomBenefit = ({
  organization,
  onSelectBenefit,
  addBenefit,
  showBenefitSelection,
  isLoading,
}: CreateBenefitProps) => {
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
            <CustomBenefitForm />
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
        </Form>
      </div>
    </div>
  )
}

export default CreateCustomBenefit
