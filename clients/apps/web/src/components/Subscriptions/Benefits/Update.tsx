import { Organization, SubscriptionTierBenefit } from '@polar-sh/sdk'
import UpdateCustomBenefit from './Custom/Update'

export interface UpdateBenefitProps {
  organization: Organization
  benefit: SubscriptionTierBenefit
  hideModal: () => void
}

const UpdateBenefit = ({
  organization,
  benefit,
  hideModal,
}: UpdateBenefitProps) => {
  return (
    <UpdateCustomBenefit
      organization={organization}
      benefit={benefit}
      hideModal={hideModal}
    />
  )
}

export default UpdateBenefit
