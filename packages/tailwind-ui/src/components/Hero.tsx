import React from 'react'
import { Link } from './Link'

type HeroProps = {
  label: string
  image?: any
  figCaption: any
  locale: string
  creators?: any[]
  about?: any
}

export const Hero: React.FC<HeroProps> = ({ label, creators, image, figCaption, locale }) => {
  const combinator = locale === 'en' ? ' and ' : ' og '

  return (
    <div className='flex flex-col gap-10 items-center'>
      {image && (
        <figure className='relative'>
          {/* <div className='h-[600px] min-w-[600px] relative'> */}
          <div className='sm:w-[500px] sm:h-[500px] relative'>
            {image}
          </div>

          {figCaption && (
            figCaption
          )}
        </figure>
      )}

      <div className='text-center md:w-10/12'>
        <h1 className='text-2xl sm:text-4xl lg:text-5xl font-black' >
          {label}
        </h1>
        {creators ? (
          <div className='mt-1 text-lg text-neutral-800 dark:text-neutral-300 font-serif' >
            <div>•••</div>
            <i>
              {locale === 'en' ? 'by' : 'av'}
            </i> {' '}
            <span>
              {creators && creators.map((creator, i) => (
                <React.Fragment key={creator._key}>
                  <span className='font-bold'>
                    {creator.assignedActor.label[locale]}
                  </span>
                  {i === creators.length - 2 ? combinator : null}
                  {i < creators.length - 2 ? ', ' : null}
                </React.Fragment>
              ))}
            </span>
          </div>
        ) : null}
      </div>
    </div >
  )
}