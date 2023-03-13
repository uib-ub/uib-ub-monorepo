import Caption from './shared/Caption'

export default function IframeBlock(props) {
  if (!props || props.disabled === true) return null

  return (
    <>
      <iframe
        title={props.title ?? 'Iframe uten tittel'}
        src={props.url}
        allowFullScreen
        aria-hidden="false"
        tabIndex="0"
      />
      <Caption title={props.title} />
    </>
  )
}
