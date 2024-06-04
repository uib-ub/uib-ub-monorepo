import { Popover } from '@headlessui/react'
import { Bars4Icon } from '@heroicons/react/20/solid'
import React from 'react'
import { usePopper } from '../utils/use-popper'

type MenuProps = {
  children: React.ReactNode
  button?: React.ReactNode
  className?: string
  accessKey?: string
  isHorizontal?: boolean
}

export const Menu: React.FC<MenuProps> = ({ children, button, className, accessKey, isHorizontal = false }) => {
  const [trigger, container] = usePopper({
    strategy: 'fixed',
    //placement: 'right-start',
    modifiers: [
      { name: 'offset', options: { offset: [0, 15] } },
      {
        name: 'sameWidth',
        enabled: true,
        fn({ state }) {
          state.styles.popper.minWidth = `${state.rects.reference.width}px`
        },
        phase: 'beforeWrite',
        requires: ['computeStyles']
      }
    ]
  })

  return (
    <Popover as='nav' className={`${className}`}>
      {({ open }) => (
        /* Use the `open` state to conditionally change the direction of the chevron icon. */
        <>
          <Popover.Button
            ref={trigger}
            className={`flex ${!isHorizontal ? 'flex-col' : ''} gap-1 items-center text-slate-600 dark:text-neutral-300 text-xs md:text-md`}
            accessKey={accessKey}
          >
            {button ?
              button :
              <>
                <Bars4Icon className={'w-5 h-5 md:w-6 md:h-6'} />
                <div className='max-md:sr-only'>Menu</div>
              </>
            }

          </Popover.Button>
          <Popover.Panel
            ref={container}
            className="max-h-1/4 border border-black/5 dark:border-white/20 relative z-30 rounded-md bg-white py-1 text-sm shadow-lg dark:bg-neutral-800"
          >
            {children}
          </Popover.Panel>
        </>
      )}
    </Popover>
  )
}