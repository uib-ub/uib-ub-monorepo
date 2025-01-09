import { TextBlocks } from '..'

export default function BigTextBlock(props: any) {
  if (!props || props.disabled === true) {
    return null
  }

  return (
    <div>
      <TextBlocks
        value={props.content}
      />
    </div>
  )
}
