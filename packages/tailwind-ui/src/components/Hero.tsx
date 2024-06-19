import React, { ReactNode } from 'react'

type HeroProps = {
  label: string
  image?: any
  figCaption: any
  locale: string
  creators?: ReactNode
}

export const Hero: React.FC<HeroProps> = ({ label, creators, image, figCaption }) => {
  return (
    <div className='flex flex-col gap-10 items-center'>
      {image && (
        <figure className='relative'>
          {/* <div className='h-[600px] min-w-[600px] relative'> */}
          <div className='sm:w-[500px] sm:min-h-[500px] relative'>
            {image}
          </div>

          {figCaption && (
            figCaption
          )}
        </figure>
      )}

      <div className='text-center md:w-10/12'>
        <h1 className='text-2xl sm:text-4xl lg:text-5xl ltr:font-black rtl:font-bold'>
          {label}
        </h1>
        {creators ? (
          <div className='mt-1 text-lg text-neutral-800 dark:text-neutral-300 font-serif' >
            <hr className='w-1/3 mx-auto border-neutral-400 dark:border-neutral-700 my-5' />
            {creators}
          </div>
        ) : null}
      </div>
    </div >
  )
}