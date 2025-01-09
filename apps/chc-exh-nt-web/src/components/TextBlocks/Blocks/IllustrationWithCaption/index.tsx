import SanityImage from '../../../SanityImage'

export default function IllustrationWithCaption(props: any) {
  if ((!props && !props.illustration) || props.disabled === true) {
    return null
  }

  const { image } = props

  return (
    <div>
      {image ? (
        <div className='relative min-h-50vh'>
          {image && (
            <SanityImage
              image={image}
            />
          )}
        </div>
      ) : (
        <div className='flex'>Mangler illustrasjon</div>
      )}
    </div>
  )
}
