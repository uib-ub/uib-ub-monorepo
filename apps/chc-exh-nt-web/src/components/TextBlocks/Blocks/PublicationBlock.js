import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { Button } from 'tailwind-ui'
import { TextBlocks } from '..'
import SanityImage from '../../SanityImage'

export default function PublicationBlock(props) {
  const { locale, defaultLocale } = useRouter()
  const t = useTranslations('Blocks')

  if (!props || props.disabled === true) {
    return null
  }

  const { objectDescription, label, description } = props

  return (
    <div className='my-8 col-start-3 col-end-4 rtl:font-arabic'>
      <div className='flex gap-5'>
        <div className='w-1/4'>
          <SanityImage
            image={objectDescription.image}
            sizes='80vh'
            style={{ objectFit: 'contain', maxWidth: 'auto', maxHeight: '80vh' }}
            alt={objectDescription.image?.alt?.[locale ?? defaultLocale] ?? ''}
          />
          {/* {JSON.stringify(objectDescription, null, 2)} */}
        </div>
        <div className='w-3/4 flex flex-col'>
          {label ? (<h2 className='max-sm:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-sans font-bold'>{label}</h2>) : null}
          {description && (
            <TextBlocks
              value={description}
            />
          )}
          <Button variant="destructive" asChild size="lg">
            <a href={objectDescription.file}>{t('download')} PDF</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
