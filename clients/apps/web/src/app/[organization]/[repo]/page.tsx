import {
  FilterSearchParams,
  buildFundingFilters,
  urlSearchFromObj,
} from '@/components/Organization/filters'
import PageNotFound from '@/components/Shared/PageNotFound'
import { getServerSideAPI } from '@/utils/api'
import { redirectToCanonicalDomain } from '@/utils/nav'
import {
  Organization,
  Platforms,
  Repository,
  ResponseError,
} from '@polar-sh/sdk'
import { Metadata, ResolvingMetadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import ClientPage from './ClientPage'

const cacheConfig = {
  next: {
    revalidate: 30, // 30 seconds
  },
}

export async function generateMetadata(
  {
    params,
  }: {
    params: { organization: string; repo: string }
  },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  let organization: Organization | undefined
  let repository: Repository | undefined

  const api = getServerSideAPI()

  try {
    organization = await api.organizations.lookup(
      {
        platform: Platforms.GITHUB,
        organizationName: params.organization,
      },
      cacheConfig,
    )
    repository = await api.repositories.lookup(
      {
        platform: Platforms.GITHUB,
        organizationName: params.organization,
        repositoryName: params.repo,
      },
      cacheConfig,
    )
  } catch (e) {
    if (e instanceof ResponseError && e.response.status === 404) {
      notFound()
    }
  }

  if (!organization) {
    notFound()
  }

  if (!repository) {
    notFound()
  }

  const orgrepo = `${organization.name}/${repository.name}`

  return {
    title: `${orgrepo}`, // " | Polar is added by the template"
    description: repository.description || `${orgrepo} on Polar`,
    openGraph: {
      title: `${orgrepo} seeks funding for issues`,
      description: `${orgrepo} seeks funding for issues on Polar`,
      images: [
        {
          url: `https://polar.sh/og?org=${organization.name}&repo=${repository.name}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: `https://polar.sh/og?org=${organization.name}&repo=${repository.name}`,
          width: 1200,
          height: 630,
          alt: `${orgrepo} seeks funding for issues`,
        },
      ],
      card: 'summary_large_image',
      title: `${orgrepo} seeks funding for issues`,
      description: `${orgrepo} seeks funding for issues on Polar`,
    },
  }
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { organization: string; repo: string }
  searchParams: FilterSearchParams
}) {
  const api = getServerSideAPI()
  const filters = buildFundingFilters(urlSearchFromObj(searchParams))

  const [repository, issuesFunding, adminOrganizations] = await Promise.all([
    api.repositories.lookup(
      {
        platform: Platforms.GITHUB,
        organizationName: params.organization,
        repositoryName: params.repo,
      },
      {
        ...cacheConfig,
        next: {
          ...cacheConfig.next,
          // Make it possible to revalidate the page when the repository is updated from client
          tags: [`repository:${params.organization}/${params.repo}`],
        },
      },
    ),
    api.funding.search(
      {
        platform: Platforms.GITHUB,
        organizationName: params.organization,
        repositoryName: params.repo,
        query: filters.q,
        sorting: filters.sort,
        badged: filters.badged,
        limit: 20,
        closed: filters.closed,
        page: searchParams.page ? parseInt(searchParams.page) : 1,
      },
      cacheConfig,
    ),
    api.organizations
      .list(
        {
          isAdminOnly: true,
        },
        cacheConfig,
      )
      .catch(() => {
        // Handle unauthenticated
        return undefined
      }),
  ])

  if (repository === undefined) {
    return <PageNotFound />
  }

  redirectToCanonicalDomain({
    organization: repository.organization,
    paramOrganizationName: params.organization,
    headers: headers(),
    subPath: `/${params.repo}`,
  })

  let featuredOrganizations: Organization[] = []

  try {
    const loadFeaturedOrganizations = await Promise.all(
      (repository.profile_settings.featured_organizations ?? []).map((id) =>
        api.organizations.get({ id }, cacheConfig),
      ),
    )

    featuredOrganizations = loadFeaturedOrganizations
  } catch (err) {
    notFound()
  }

  return (
    <ClientPage
      organization={repository.organization}
      repository={repository}
      issuesFunding={issuesFunding}
      featuredOrganizations={featuredOrganizations}
      adminOrganizations={adminOrganizations?.items ?? []}
    />
  )
}
