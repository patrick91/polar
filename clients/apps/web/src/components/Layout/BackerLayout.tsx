import ProfileSelection from '@/components/Shared/ProfileSelection'
import { useAuth } from '@/hooks/auth'
import Link from 'next/link'
import { LogoType } from 'polarkit/components/brand'
import { useStore } from 'polarkit/store'
import { classNames } from 'polarkit/utils'
import { Suspense } from 'react'
import BackerConnectUpsell from '../Dashboard/BackerConnectUpsell'
import SidebarNavigation from '../Dashboard/BackerNavigation'
import Popover from '../Notifications/Popover'
import DashboardTopbar from '../Shared/DashboardTopbar'

const BackerLayout = (props: {
  children: React.ReactNode
  disableOnboardingBanner?: boolean
}) => {
  const { currentUser, hydrated } = useAuth()
  const isBackerConnectUpsellSkiped = useStore(
    (store) => store.onboardingMaintainerConnectRepositoriesSkip,
  )

  const showBanner =
    !isBackerConnectUpsellSkiped && !props.disableOnboardingBanner

  if (!hydrated) {
    return <></>
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 top-4 flex flex-row gap-x-4">
      <aside className="dark:bg-polar-900 flex h-full w-[320px] flex-shrink-0 flex-col justify-between rounded-3xl bg-white shadow-xl">
        <div className="flex flex-col">
          <div className="relative z-10 mt-9 flex translate-x-0 flex-row items-center justify-between space-x-2 pl-9 pr-7">
            <a
              href="/"
              className="flex-shrink-0 items-center font-semibold text-gray-700"
            >
              <LogoType />
            </a>

            <Suspense>{currentUser && <Popover type="dashboard" />}</Suspense>
          </div>
          <div className="mt-8 flex px-4 py-2">
            {currentUser && (
              <ProfileSelection
                useOrgFromURL={true}
                className="shadow-xl"
                narrow={false}
              />
            )}
          </div>
          <SidebarNavigation />
        </div>

        <div className="dark:bg-polar-800 dark:border-polar-700 dark:text-polar-400 mx-4 my-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm">
          <p className="mb-2">Waiting for a bug to be fixed?</p>
          <Link href="/new" className="font-medium text-blue-600">
            Fund a Github issue
          </Link>
        </div>
      </aside>

      <div className="dark:bg-polar-900 relative flex h-full w-full translate-x-0 flex-row overflow-auto rounded-3xl bg-white shadow-xl">
        <DashboardTopbar isFixed={true} useOrgFromURL={false} />
        <nav className="fixed z-10 w-full ">
          {showBanner && <BackerConnectUpsell />}
        </nav>

        <main className={classNames('relative h-full w-full overflow-y-auto')}>
          <div
            className={classNames(
              'relative mx-auto max-w-screen-2xl px-12 pb-8',
            )}
            style={{
              marginTop: `127px`,
            }}
          >
            {props.children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default BackerLayout
