import { useRouter } from 'next/router'
import { Link } from 'tailwind-ui'
import { TextBlocks } from '..'
import SanityImage from '../../SanityImage'
import Source from './shared/Source'

const FigCaption = ({ children, label, description, item }) => {
  return (
    <figcaption className='mt-1'>
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

const ObjectBlock = (props) => {
  const { locale, defaultLocale } = useRouter()

  if (!props || props.disabled === true) {
    return null
  }

  const { _key, label, description, items, source, variant } = props
  const height = 'clamp(40em, 50vh, 20em)'

  return (
    <figure key={_key} className='my-8 col-start-3 col-end-4 font-sans rtl:font-arabic'>
      {items?.length === 0 && <div className='flex'>Missing figure</div>}

      {items && (
        <div className='relative bg-black'>
          {variant === 'static' && (
            <div className='flex flex-wrap gap-5 align-baseline justify-evenly w-full'>
              {items.length > 1 && items.map((i) => (
                <div key={i._key} className='flex'>
                  {!i.internalRef && (
                    <SanityImage
                      key={i._id}
                      image={i.image}
                      sizes='80vh'
                      style={{ objectFit: 'contain', maxWidth: 'auto', maxHeight: '80vh' }}
                      alt={i.image?.alt?.[locale ?? defaultLocale] ?? ''}
                    />
                  )}
                  {i.internalRef && (
                    <Link
                      key={i._id}
                      ariaLabelledBy={i._key}
                      href={`/id/${i.internalRef._ref}`}
                    >
                      <SanityImage
                        key={i._key}
                        image={i.image}
                        sizes='80vh'
                        style={{ objectFit: 'contain', maxWidth: 'auto', maxHeight: '80vh' }}
                        alt={i.image?.alt?.[locale ?? defaultLocale] ?? ''}
                      />
                    </Link>
                  )}
                </div>
              ))}

              {items.length === 1 && items.map((i) => (
                <div key={i._key}>
                  {!i.internalRef && (
                    <SanityImage
                      image={i.image}
                      sizes='80vh'
                      style={{ objectFit: 'contain', maxWidth: 'auto', maxHeight: '80vh' }}
                      alt={i.image?.alt?.[locale ?? defaultLocale] ?? ''}
                    />
                  )}
                  {i.internalRef && (
                    <Link
                      ariaLabelledBy={i._key}
                      href={`/id/${i.internalRef._ref}`}
                    >
                      <SanityImage
                        image={i.image}
                        type='responsive'
                        style={{ objectFit: 'contain' }}
                        alt={i.image?.alt?.[locale ?? defaultLocale] ?? ''}
                      />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <FigCaption label={label} description={description}>
        {/* {items && items.filter(i => i.objectDescription).map((item, i) => (
          <div
            key={item.objectDescription?._id}
            className='font-light text-sm'
          >
            <i>
              <Link href={`/id/${item.objectDescription?._id}`} color='unset' isExternal>
                {item.objectDescription?.label[locale] || item.objectDescription?.label[defaultLocale] || 'Missing default language label'}
              </Link>
            </i>

            {item.objectDescription?.hasCurrentOwner?.length && `. ${item.objectDescription?.hasCurrentOwner[0].label[locale] ?? item.objectMetadata?.hasCurrentOwner[0].label[defaultLocale]}.`}
          </div>
        ))}

        <div>
          <TextBlocks
            value={source}
          />
        </div> */}
      </FigCaption>

    </figure>
  )
}

export default ObjectBlock
