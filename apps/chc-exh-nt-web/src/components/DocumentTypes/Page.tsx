import { TextBlocks } from '../TextBlocks'
import Sections from '../TextBlocks/Blocks/Sections'

/* Used for preview */
export default function Page(data: any) {
  return (
    <div>
      {data.content && <Sections sections={data.content} />}

      {/* If LinguisticDocument the content is in the body field */}
      {data.body && <TextBlocks value={data.body} />}
    </div>
  )
}
