import { Link } from 'tailwind-ui'
import { useRouter } from 'next/router'
import { TextBlocks } from '../..'

export default function Source(props) {
  const { locale, defaultLocale } = useRouter()
  const { _id, label, hasCurrentOwner, source } = props

  if ((!_id && !label) || !source) return null

  return (
    <div>
      <p>
        <i>
          <Link href={`/id/${_id}`} isExternal>
            {label[locale] || label[defaultLocale] || 'Missing default language label'}
          </Link>
        </i>

        {hasCurrentOwner?.length && `. ${hasCurrentOwner[0].label[locale] ?? hasCurrentOwner[0].label[defaultLocale]}.`}
      </p>

      <TextBlocks
        value={source}
      />
    </div>
  )
}
