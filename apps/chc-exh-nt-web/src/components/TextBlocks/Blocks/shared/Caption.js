import { TextBlocks } from '../..'
import Source from './Source'

export default function Caption(props) {
  if (!props) {
    return null
  }

  const { label, content, source, sourceItem, ...rest } = props

  return (
    <div className='flex' {...rest}>
      {label && (
        <h2>
          {label}
        </h2>
      )}

      {content && (
        <TextBlocks
          value={content}
        />
      )}

      <div className='flex-grow'>{'&nbsp;'}</div>

      {source && (
        <div className='flex'>
          <TextBlocks
            value={source}
          />
        </div>
      )}
      {sourceItem && !source && <Source {...sourceItem} />}
    </div>
  )
}
