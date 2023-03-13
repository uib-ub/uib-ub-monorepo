import { TextBlocks } from '..'
import ItemView from './Gallery/ItemView'

export default function GridBlock(props) {
  if (!props || props.disabled === true) {
    return null
  }

  const { items, label, description } = props
  /*   console.log("🚀 ~ file: GridBlock.js:9 ~ GridBlock ~ items", items) */

  return (
    <div className='my-8 col-start-1 col-end-6 m-6 md:m-24'>
      {label ? (<h2 className='max-sm:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-center font-sans font-bold pb-10'>{label}</h2>) : null}
      {description && (
        <TextBlocks
          value={description}
        />
      )}
      <div className='grid grid-cols-6 max-sm:gap-4 sm:gap-5 md:gap-12' >
        {/* <pre className='w-[600px] overflow-scroll'>{JSON.stringify(props, null, 4)}</pre> */}
        {items && items.map((i) => <ItemView key={i._key} {...i} />)}
      </div>
    </div>
  )
}
