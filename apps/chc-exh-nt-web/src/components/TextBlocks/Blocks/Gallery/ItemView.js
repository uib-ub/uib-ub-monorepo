import Link from 'next/link'
import { useRouter } from 'next/router'
import { Spacer } from 'tailwind-ui'
import { TextBlocks } from '../..'
import SanityImage from '../../../SanityImage'

export default function ItemView(props) {
  const { locale, defaultLocale } = useRouter()
  if (!props || props.disabled === true) return null

  const { objectDescription: { _id, title, label, description, caption }, image, source } = props
  /* console.log("🚀 ~ file: ItemView.js:15 ~ ItemView ~ caption", caption) */
  const localeCaption = caption?.filter(i => i.language === locale)[0]?.body

  return (
    <div className='relative col-span-6 md:col-span-3 font-sans'>
      <div className='relative w-full align-end'>
        {image && (
          <Link href={`/id/${_id}`} color='unset'>
            <SanityImage
              image={image}
              type='responsive'
              style={{ objectFit: 'contain' }}
              alt={image?.alt?.[locale ?? defaultLocale] ?? ''}
            />
          </Link>
        )}
        {!image && <div>Mangler illustrasjon</div>}
      </div>

      <div className='mt-1 text-sm' >
        {description && (
          <TextBlocks
            value={description}
          />
        )}

        {localeCaption && (
          <TextBlocks
            className='font-sans'
            value={localeCaption}
          />
        )}

        <Spacer />

        {source && (
          <div className='flex' >
            <TextBlocks
              value={source}
            />
          </div>
        )}
      </div>
      {/* <pre>{JSON.stringify(props, null, 2)}</pre> */}
    </div>
  )
}

{/* <figcaption className='mt-1'>
      {label && (
        <div className='font-weight-700 text-md inline-flex mr-1'>
          {label}.{' '}
        </div>
      )}

      {description && (
        <div className='inline-flex text-sm'>
          <TextBlocks
            value={description}
          />
        </div>
      )}

      {item && <Source {...item} />}

      {children}
    </figcaption> */}