'use client'

import { Post } from '@/components/Feed/data'
import GithubLoginButton from '@/components/Shared/GithubLoginButton'
import { ProfileMenu } from '@/components/Shared/ProfileSelection'
import { useAuth } from '@/hooks'
import { UserSignupType } from '@polar-sh/sdk'
import Link from 'next/link'
import { LogoType } from 'polarkit/components/brand'
import LongformPost from '../../../../../components/Feed/LongformPost'

export default function Page({ post }: { post: Post }) {
  const { currentUser } = useAuth()

  return (
    <div className="flex w-full flex-col items-center gap-y-16">
      <div className="flex w-full flex-row items-center justify-between px-4">
        <Link href="/">
          <LogoType />
        </Link>
        <div>
          {currentUser ? (
            <ProfileMenu className="z-50" />
          ) : (
            <GithubLoginButton
              userSignupType={UserSignupType.BACKER}
              posthogProps={{
                view: 'Maintainer Page',
              }}
              text="Sign in with GitHub"
              gotoUrl={window.location.href}
            />
          )}
        </div>
      </div>
      <LongformPost post={post} />
    </div>
  )
}
