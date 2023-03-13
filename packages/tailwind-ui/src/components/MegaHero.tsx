import React from 'react'

type MegaHeroProps = {
  label: string
  image: any
  locale: string
  creators?: any[]
}

export const MegaHero: React.FC<MegaHeroProps> = ({ label, creators, image, locale }) => {
  return (
    <div className='grid grid-template-columns-1 w-full max-h-screen'>
      <div
        className='z-10 text-center font-light text-neutral-900'
        style={{ gridArea: '1 / 1 / 2 / 2', textShadow: '1px 2px 1px #bbb' }}
      >
        <h1
          className='text-6xl mt-40'
        >
          {label}
        </h1>
        <div
          className='mt-10 text-2xl'
        >
          {creators && (
            <>
              by {' '}
              {creators[0].assignedActor.label[locale]}
            </>
          )}
        </div>
      </div>

      {image && (
        image
      )}
    </div>
  )
}