import SanityImage from '../../../SanityImage'

export default function IllustrationWithCaption(props) {
  const bg = useColorModeValue('blackAlpha.100', 'black')

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
              key={i._key}
              image={i.image}
              alt={i.image?.alt?.[locale ?? defaultLocale]}
            />
          )}
        </div>
      ) : (
        <div className='flex'>Mangler illustrasjon</div>
      )}
    </div>
  )
}
