import { TextBlocks } from '..'

export default function PageHeaderBlock(props) {
  if (!props || props.disabled === true) {
    return null
  }

  return (
    <div>
      {/* {props.illustration?.image && (
        <Image
          mb="5"
          maxH="50vh"
          justifyContent="end"
          overflow="hidden"
          src={urlFor(props.illustration?.image).width('800').fit('min').url()}
          alt={''}
        />
      )} */}
      <h2 className='text-lg text-center'>
        {props.title}
      </h2>
      {props?.subtitle && <TextBlocks value={props.subtitle} />}
    </div>
  )
}
