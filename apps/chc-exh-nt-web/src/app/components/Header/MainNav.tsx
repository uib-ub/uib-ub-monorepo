"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/src/app/components/ui/dialog'
import { Button } from '@/src/app/components/ui/button'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Bars4Icon } from '@heroicons/react/24/outline'
import { cva, type VariantProps } from 'class-variance-authority'

const mainNavButtonVariants = cva(
  'rounded-md text-xs flex items-center gap-1',
  {
    variants: {
      layout: {
        sidebar: 'flex-col p-0',
        default: '',
      },
      size: {
        default: 'px-2 py-6',
        sm: 'h-8 px-0 py-2',
        lg: 'h-12 px-6',
      },
    },
    defaultVariants: {
      layout: 'default',
      size: 'default',
    },
  }
)

interface MainNavProps extends React.ComponentProps<'div'>, VariantProps<typeof mainNavButtonVariants> {
  children: React.ReactNode
}

export function MainNav({ children, layout, size }: MainNavProps) {
  const params = useParams()
  const lang = params?.lang as string
  const t = useTranslations('MainNav')

  if (!lang) {
    console.error('Language parameter is missing')
    return null
  }

  return (
    <Dialog aria-label='primary navigation'>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size={size}
          className={mainNavButtonVariants({ layout, size })}
        >
          <Bars4Icon
            className={size === 'sm' ? 'w-5 h-5' : 'w-10 h-10'}
          />
          {t('menu')}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-5/6 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-900">
        <DialogHeader>
          <DialogTitle>{t('menu')}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
