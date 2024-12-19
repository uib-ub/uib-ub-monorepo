import { Link } from '@/src/i18n/routing'
import { TextBlocks } from '../..'

export default function Source(props) {
  const { lang, _id, label, hasCurrentOwner, source } = props

  if ((!_id && !label) || !source) return null

  return (
    <div>
      <p>
        <i>
          <Link href={`/id/${_id}`} isExternal>
            {label[lang] || label['no'] || 'Missing default language label'}
          </Link>
        </i>

        {hasCurrentOwner?.length && `. ${hasCurrentOwner[0].label[lang] ?? hasCurrentOwner[0].label['no']}.`}
      </p>

      <TextBlocks
        value={source}
      />
    </div>
  )
}
