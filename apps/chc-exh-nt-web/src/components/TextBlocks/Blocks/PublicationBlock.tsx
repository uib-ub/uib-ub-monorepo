import { TextBlocks } from '..'
import SanityImage from '../../SanityImage'
import { Button } from '../../ui/button'

export default function PublicationBlock(props: any) {
  if (!props || props.disabled === true) {
    return null
  }

  const { lang, objectDescription, label, description } = props
  /*   console.log("🚀 ~ file: GridBlock.js:9 ~ GridBlock ~ items", items) */

  return (
    <div className='my-8 col-start-3 col-end-4'>
      <div className='flex gap-5'>
        <div className='w-1/4'>
          <SanityImage
            image={objectDescription.image}
          />
          {/* {JSON.stringify(objectDescription, null, 2)} */}
        </div>
        <div className='w-3/4 flex flex-col'>
          {label ? (<h2 className='max-sm:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-sans font-bold'>{label}</h2>) : null}
          {description && (
            <TextBlocks
              value={description}
            />
          )}
          <Button className='self-start'>
            <a href={objectDescription.file}>{lang === 'no' ? 'Last ned PDF' : 'Download PDF'}</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
