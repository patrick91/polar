'use client'

import {
  ArrowForward,
  LanguageOutlined,
  MoreVertOutlined,
} from '@mui/icons-material'
import { Article } from '@polar-sh/sdk'
import { motion, useSpring, useTransform } from 'framer-motion'
import Link from 'next/link'
import { Avatar, Button } from 'polarkit/components/ui/atoms'
import { ButtonProps } from 'polarkit/components/ui/button'
import { PropsWithChildren, useCallback, useEffect, useRef } from 'react'
import { useHoverDirty } from 'react-use'
import { twMerge } from 'tailwind-merge'

interface PostProps {
  article: Article
}

export const Post = ({ article }: PostProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const isHovered = useHoverDirty(ref)

  return (
    <div
      className="dark:border-polar-800 hover:dark:bg-polar-800/50 dark:bg-polar-900 flex w-full flex-row justify-start gap-x-4 rounded-3xl border border-gray-100 bg-white px-6 pb-6 pt-8 shadow-sm transition-all duration-100"
      ref={ref}
    >
      <Avatar
        className="h-10 w-10"
        avatar_url={article.organization.avatar_url}
        name={article.organization.name}
      />
      <div className="flex w-full min-w-0 flex-col">
        <PostHeader article={article} />
        <PostBody article={article} isHovered={isHovered} />
        <PostFooter article={article} isHovered={isHovered} />
      </div>
    </div>
  )
}

const PostHeader = ({ article }: PostProps) => {
  return (
    <div className="mt-1.5 flex w-full flex-row items-center justify-between text-sm">
      <div className="flex flex-row items-center gap-x-2">
        <Link
          className="flex flex-row items-center gap-x-2"
          href={`/${article.organization.name}`}
        >
          <h3 className="text-blue-500 dark:text-blue-400">
            {article.organization.name}
          </h3>
        </Link>
        <div className="dark:text-polar-400 flex flex-row items-center gap-x-2 text-gray-500">
          &middot;
          <div className="text-xs">
            {article.createdAt.toLocaleString('en-US', {
              year:
                article.publishedAt.getFullYear() === new Date().getFullYear()
                  ? undefined
                  : 'numeric',
              month:
                article.publishedAt.getFullYear() === new Date().getFullYear()
                  ? 'long'
                  : 'short',
              day: 'numeric',
            })}
          </div>
          &middot;
          {article.visibility === 'public' && (
            <>
              <div className="flex flex-row items-center gap-x-1">
                <span className="flex items-center text-blue-500">
                  <LanguageOutlined fontSize="inherit" />
                </span>
                <span className="text-xs">Public</span>
              </div>
              &middot;
            </>
          )}
          <Link href={`/${article.organization.name}?tab=subscriptions`}>
            <Button className="px-0" variant="link" size="sm">
              Subscribe
            </Button>
          </Link>
        </div>
      </div>
      <div className="dark:text-polar-400 text-base">
        <MoreVertOutlined fontSize="inherit" />
      </div>
    </div>
  )
}

const PostBody = ({
  article,
  isHovered,
}: PostProps & { isHovered: boolean }) => {
  return (
    <div
      className={twMerge(
        'flex w-full flex-col gap-y-4 pb-5 pt-2 text-[15px] leading-relaxed transition-colors duration-200',
      )}
    >
      <div className="dark:text-polar-200 flex flex-col flex-wrap pt-2 text-lg font-medium text-gray-950">
        {article.title}
      </div>
      <div className="flex flex-col flex-wrap">
        <p
          className={twMerge(
            'text-md line-clamp-4 w-full flex-wrap truncate whitespace-break-spaces break-words leading-loose text-gray-500',
            isHovered
              ? 'dark:text-polar-300 text-gray-800'
              : 'dark:text-polar-400 text-gray-700',
          )}
        >
          {article.body.replace('\n\n', '\n')}
        </p>
      </div>
    </div>
  )
}

const PostFooter = (props: Article & { isHovered: boolean }) => {
  return (
    <div className="mt-2 flex flex-row-reverse items-center justify-between gap-x-4">
      <AnimatedIconButton active={props.isHovered} variant="secondary">
        <ArrowForward fontSize="inherit" />
      </AnimatedIconButton>
    </div>
  )
}

export const AnimatedIconButton = (
  props: PropsWithChildren<{
    active?: boolean | undefined
    variant?: ButtonProps['variant']
  }>,
) => {
  const x = useSpring(0, { damping: 15, velocity: 5 })
  const incomingX = useTransform(x, [0, 1], [-30, 0], { clamp: false })
  const outgoingX = useTransform(x, [0, 1], [0, 30], { clamp: false })

  useEffect(() => {
    x.set(props.active ? 1 : 0)
  }, [x, props])

  const handleMouse = useCallback(
    (value: number) => () => {
      if (typeof props.active === 'undefined') {
        x.set(value)
      }
    },
    [x, props],
  )

  return (
    <Button
      size="icon"
      variant={props.active ? 'default' : props.variant}
      className="h-8 w-8 overflow-hidden rounded-full"
      onMouseEnter={handleMouse(1)}
      onMouseLeave={handleMouse(0)}
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ x: incomingX }}
      >
        {props.children}
      </motion.div>
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ x: outgoingX }}
      >
        {props.children}
      </motion.div>
    </Button>
  )
}
