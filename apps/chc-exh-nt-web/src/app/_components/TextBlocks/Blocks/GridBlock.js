import { TextBlocks } from '..'
import ItemView from './Gallery/ItemView'

export default function GridBlock(props) {
  if (!props || props.disabled === true) {
    return null
  }

  const { items, label, description } = props

  return (
    <div className='flex flex-col gap-5'>
      {/* {label ? (<h2 className='max-sm:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-center font-sans font-bold pb-10'>{label}</h2>) : null}
      {description && (
        <TextBlocks
          value={description}
        />
      )} */}


      <div className='grid grid-cols-2 w-full'>
        {items && items.map((i) => (
          <div key={i._key} className="col-span-1">
            <ItemView {...i} />
          </div>
        ))}
      </div>
    </div>
  )
}
