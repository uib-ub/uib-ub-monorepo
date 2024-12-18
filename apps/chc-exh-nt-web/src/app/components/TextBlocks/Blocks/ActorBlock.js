import { useLocale } from 'next-intl'
import { Description } from '../../Props/Description'

const ActorBlock = (props) => {
  if (!props) return

  const data = props

  const locale = useLocale();

  return (
    <div className='my-4 col-start-3 col-end-4'>
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      <h3 className='text-2xl font-bold'>
        {data.label[locale] ? data.label[locale] : data.label.no}
      </h3>
      <div className='max-w-prose xl:text-xl text-light'>
        <Description value={data.referredToBy} language={locale} />
      </div>

      {/* {memberOf &&
            memberOf.map((org) => (
              <div key={org._id}>
                {org.image && (
                  <SanityImage
                    image={org.image}
                    sizes='(max-width: 600px) 100vw, 600px'
                    style={{ objectFit: 'contain', maxWidth: 'auto', maxHeight: '80vh' }}
                    alt={org.image?.alt?.[locale ?? defaultLocale] ?? ''}
                  />
                )}
                <div>
                  {org.label.no}
                </div>
              </div>
            ))} */}
      {/* {shortDescription && <p>{shortDescription}</p>} */}
    </div>
  )
}

export default ActorBlock