import CreateCustomBenefit from './Custom/Create'
import CreateDiscordBenefit from './Discord/Create'

interface RegistryInterface {
  [key: string]: {
    // TODO: Better typing of props
    create: (props: any) => JSX.Element
  }
}

const BenefitRegistry: RegistryInterface = {
  custom: {
    create: CreateCustomBenefit,
  },
  discord: {
    create: CreateDiscordBenefit,
  },
}

export default BenefitRegistry
