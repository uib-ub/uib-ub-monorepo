import { TextBlocks } from '..'
import Source from './shared/Source'
import SanityImage from '../../SanityImage'
import { Link } from '@/src/i18n/routing'

const FigCaption = ({ lang, children, label, description, item }: any) => {
  return (
    <figcaption>
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
    </figcaption>
  )
}

const ObjectBlock = (props: any) => {
  if (!props || props.disabled === true) {
    return null
  }

  const { lang, _key, label, description, items, source, variant } = props

  return (
    <figure key={_key} className='flex flex-col flex-wrap gap-2 align-baseline justify-evenly my-8 col-start-1 col-end-6 md:col-start-3 md:col-end-4 font-sans'>
      {items?.length === 0 && <div className='flex'>Missing figure</div>}

      {items && (
        <div className='relative bg-black w-full'>

          {items.length > 1 && items.map((i: any) => (
            <div key={i._key} className='flex'>
              {!i.internalRef && (
                <SanityImage
                  image={i.image}
                  className="w-full"
                />
              )}
              {i.internalRef && (
                <Link
                  href={`/id/${i.internalRef._ref}`}
                  className="block w-full"
                >
                  <SanityImage
                    image={i.image}
                    className="w-full"
                  />
                </Link>
              )}
            </div>
          ))}

          {items.length === 1 && items.map((i: any) => (
            <div key={i._key} className='w-full'>
              {!i.internalRef && (
                <SanityImage
                  image={i.image}
                  className="w-full"
                />
              )}
              {i.internalRef && (
                <Link
                  href={`/id/${i.internalRef._ref}`}
                  className="block w-full"
                >
                  <SanityImage
                    image={i.image}
                    className="w-full"
                  />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      <FigCaption label={label} description={description} />

    </figure>
  )
}

export default ObjectBlock
