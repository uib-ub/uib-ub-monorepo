import { useRouter } from 'next/router'
import { Link } from 'tailwind-ui'
import { Description } from '../../Props/Description'

const ActorBlock = (props) => {
  const { locale } = useRouter()
  if (!props) return null

  const { _id, label, shortDescription, referredToBy } = props
  // console.log("🚀 ~ file: ActorBlock.js:9 ~ ActorBlock ~ props", props)

  return (
    <div className='my-4 col-start-3 col-end-4'>
      <h3>
        <Link href={`/id/${_id}`}>{label[locale || 'no']}</Link>
      </h3>
      {referredToBy ?
        <div className='max-w-prose xl:text-xl text-light'>
          <Description value={referredToBy} language={locale || ''} />
        </div>
        : null
      }
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