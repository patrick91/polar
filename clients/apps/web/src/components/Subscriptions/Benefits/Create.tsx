import {
  Organization,
  SubscriptionBenefitCreate,
  SubscriptionTierBenefit,
} from '@polar-sh/sdk'
import { useCreateSubscriptionBenefit } from 'polarkit/hooks'
import { createElement, useCallback, useState } from 'react'
import BenefitRegistry from './registry'

export interface CreateBenefitProps {
  organization: Organization
  onSelectBenefit: (benefit: SubscriptionTierBenefit) => void
  addBenefit: (benefit: SubscriptionBenefitCreate) => void
  showBenefitSelection: () => void
  isLoading: boolean
}

interface CreateBenefitSelectionProps {
  organization: Organization
  onSelectBenefit: (benefit: SubscriptionTierBenefit) => void
  hideModal: () => void
}

const CreateBenefitSelection = ({
  organization,
  onSelectBenefit,
  hideModal,
}: CreateBenefitSelectionProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [currentView, changeView] = useState<string>(null)

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

  const showBenefitSelection = () => {
    changeView(null)
  }

  if (currentView === null) {
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
              <a href="#" onClick={() => changeView('discord')}>
                Discord Access
              </a>
            </li>
            <li>
              <a href="#" onClick={() => changeView('custom')}>
                Create Custom
              </a>
            </li>
          </ul>
        </div>
      </div>
    )
  }

  let createBenefitComponent = BenefitRegistry[currentView]?.create
  if (!createBenefitComponent) {
    createBenefitComponent = BenefitRegistry.custom.create
  }
  return createElement(createBenefitComponent, {
    organization,
    onSelectBenefit,
    addBenefit,
    showBenefitSelection,
    isLoading,
  })
}

export default CreateBenefitSelection
