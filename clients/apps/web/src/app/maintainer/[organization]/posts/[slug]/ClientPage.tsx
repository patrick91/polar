'use client'

import Editor from '@/components/Feed/Editor'
import { DashboardBody } from '@/components/Layout/DashboardLayout'
import { useParams, useRouter } from 'next/navigation'
import { Button, Input } from 'polarkit/components/ui/atoms'
import { useLookupArticle } from 'polarkit/hooks'
import { useCallback } from 'react'

const ClientPage = () => {
  const { slug, organization } = useParams()
  const article = useLookupArticle(organization as string, slug as string)

  const router = useRouter()

  const handleSave = useCallback(() => {
    router.push(`/maintainer/${organization}/posts`)
  }, [router, organization])

  return (
    <>
      <DashboardBody>
        <div className="flex h-full flex-row">
          <div className="flex h-full w-full flex-col items-start gap-y-8">
            <div className="flex w-full flex-row items-center justify-between">
              <h3 className="dark:text-polar-50 text-lg font-medium text-gray-950">
                Edit Post
              </h3>

              <div className="flex flex-row items-center gap-x-2">
                <Button className="self-start" onClick={handleSave}>
                  Save Post
                </Button>
              </div>
            </div>
            <Input className="min-w-[320px]" placeholder="Title" />
            <div className="flex h-full w-full flex-col">
              {article.data && <Editor value={article.data.body} />}
            </div>
          </div>
        </div>
      </DashboardBody>
    </>
  )
}

export default ClientPage
