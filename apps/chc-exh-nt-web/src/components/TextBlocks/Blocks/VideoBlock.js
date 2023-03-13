import Caption from './shared/Caption'

export default function VideoBlock(props) {
  if (!props || props.disabled === true) {
    return null
  }

  const { title, url } = props

  return (
    <div className='relative'>
      {url ? (
        <iframe src={url} allowFullScreen title={title ?? 'Video uten tittel'} />
      ) : (
        <div className='flex'>Ingen videolenke</div>
      )}
      {title && <Caption title={title} />}
    </div>
  )
}
