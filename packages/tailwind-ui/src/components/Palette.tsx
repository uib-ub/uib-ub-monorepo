import React from "react";
import { SwatchIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'

export const Palette = ({ colors }: any) => {
  const { locale } = useRouter()
  if (!colors) return null

  let palette: any = []
  // TODO: clean up component, not elegant
  delete colors._type

  if (colors) {
    Object.values(colors).forEach((color: any) => {
      palette.push(color.background)
    })
  }

  return (
    <div>
      <div className='flex gap-1 items-center text-xs font-light dark:text-neutral-200 text-neutral-800 mb-1'>
        <SwatchIcon className='w-5 h-5' />
        {locale === 'en' ? 'Colour palette' : 'Fargepalett'}
      </div>
      <div className='grid grid-cols-7'>
        {palette.map((color: string, index: number) => (
          <div key={`${index}-${color}`} className={`h-2`} style={{ backgroundColor: color }}></div>
        ))}
      </div>
    </div>
  )
}