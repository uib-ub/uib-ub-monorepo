import { TextBlocks } from '..'

export default function TextBlock(props) {
  if (!props || props.disabled === true) return null

  return (
    <div>
      {props?.title && <h2 className='text-2xl'>{props.title}</h2>}

      {props?.subtitle && <TextBlocks value={props.subtitle} />}

      <TextBlocks value={props.content} />
    </div>
  )
}
