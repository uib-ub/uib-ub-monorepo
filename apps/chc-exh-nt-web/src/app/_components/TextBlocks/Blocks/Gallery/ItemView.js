import { Link } from '@/src/i18n/routing'
import { TextBlocks } from '../..'
import SanityImage from '../../../SanityImage'

export default function ItemView(props) {
  if (!props || props.disabled === true) return null

  const { lang, objectDescription: { _id, title, label, description, caption }, image, source } = props
  const localeCaption = caption?.filter(i => i.language === lang)[0]?.body

  return (
    <div className='font-sans'>
      <div className='relative w-full h-full align-end'>
        {image && (
          <Link href={`/id/${_id}`} color='unset'>
            <SanityImage
              image={image}
              type='responsive'
              className='h-full w-full object-cover'
            />
          </Link>
        )}
        {!image && <div>Mangler illustrasjon</div>}
      </div>

      {/* <div className='mt-1 text-sm' >
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


        {source && (
          <div className='flex' >
            <TextBlocks
              value={source}
            />
          </div>
        )}
      </div> */}
    </div>
  )
}
