import {
  ExpandMoreOutlined,
  ImageOutlined,
  PollOutlined,
  TitleOutlined,
} from '@mui/icons-material'
import { Button, TabsList, TabsTrigger } from 'polarkit/components/ui/atoms'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'polarkit/components/ui/dropdown-menu'
import { PropsWithChildren, useCallback } from 'react'

export enum PostToolbarComponent {
  Paywall = 'paywall',
  SubscriptionUpsell = 'subscribenow',
  Advertisement = 'ad',
  Poll = 'poll',
}

interface PostToolbarProps {
  onInsertComponent: (component: PostToolbarComponent) => void
}

export const PostToolbar = ({ onInsertComponent }: PostToolbarProps) => {
  const handleComponentInsert = useCallback(
    (component: PostToolbarComponent) => () => {
      onInsertComponent(component)
    },
    [onInsertComponent],
  )

  return (
    <div className="sticky top-0 z-20 flex w-full flex-col bg-white dark:bg-transparent">
      <div className="dark:bg-polar-800 dark:border-polar-800 relative mx-auto mt-8 flex w-full min-w-0 max-w-screen-xl flex-row items-center justify-between rounded-3xl border border-gray-100 bg-white px-6 py-4 shadow-2xl">
        <div className="flex flex-row items-center gap-x-2">
          <ToolbarButton>
            <TitleOutlined fontSize="small" />
          </ToolbarButton>
          <ToolbarButton>
            <ImageOutlined fontSize="small" />
          </ToolbarButton>
          <ToolbarButton>
            <PollOutlined fontSize="small" />
          </ToolbarButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="dark:bg-polar-700 dark:hover:bg-polar-600 dark:border-polar-600 justify-between border border-transparent bg-gray-100 text-sm text-gray-500 hover:bg-gray-200"
                variant="secondary"
              >
                <span>Components</span>
                <ExpandMoreOutlined className="ml-2" fontSize="small" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="dark:bg-polar-800 bg-gray-50 shadow-lg"
              align="start"
            >
              <DropdownMenuItem
                onClick={handleComponentInsert(PostToolbarComponent.Paywall)}
              >
                <span>Paywall</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleComponentInsert(
                  PostToolbarComponent.SubscriptionUpsell,
                )}
              >
                <span>Subscription Upsell</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleComponentInsert(
                  PostToolbarComponent.Advertisement,
                )}
              >
                <span>Advertisement</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleComponentInsert(PostToolbarComponent.Poll)}
              >
                <span>Poll</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <TabsList className="dark:border-polar-700 dark:border">
          <TabsTrigger value="edit" size="small">
            Markdown
          </TabsTrigger>
          <TabsTrigger value="preview" size="small">
            Preview
          </TabsTrigger>
        </TabsList>
      </div>
    </div>
  )
}

type ToolbarButtonProps = PropsWithChildren<{}>

const ToolbarButton = (props: ToolbarButtonProps) => {
  return (
    <Button
      className="dark:bg-polar-700 dark:text-polar-200 dark:hover:bg-polar-600 dark:border-polar-600 bg-gray-100 text-sm text-gray-500 hover:bg-gray-200 dark:border"
      size="icon"
      variant="ghost"
    >
      {props.children}
    </Button>
  )
}
