import { TextBlocks } from '..'

export default function TwoColumnBlock(props) {
  if (!props || props.disabled === true) {
    return null
  }

  return (
    <div className='mt-10'>
      <h2 className='text-lg'>{props.title}</h2>
      {props?.subtitle && (
        <div>
          <TextBlocks value={props.subtitle} />
        </div>
      )}
      <div className='grid gap-5' >
        {props?.firstColumn && (
          <div>
            <TextBlocks value={props.firstColumn} />
          </div>
        )}
        {props?.secondColumn && (
          <div>
            <TextBlocks value={props.secondColumn} />
          </div>
        )}
      </div>
    </div>
  )
}
