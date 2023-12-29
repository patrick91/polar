import { SubscriptionBenefitCreate } from '@polar-sh/sdk'
import { Button } from 'polarkit/components/ui/atoms'
import { Form } from 'polarkit/components/ui/form'
import { useForm } from 'react-hook-form'
import { CreateBenefitContainer, CreateBenefitProps } from '../Create'
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
    <CreateBenefitContainer
      title="Create Subscription Benefit"
      subtitle="Created benefits will be available for use in all tiers of your organization"
    >
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
    </CreateBenefitContainer>
  )
}

export default CreateCustomBenefit
