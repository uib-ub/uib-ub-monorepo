import ItemView from './ItemView'

export default function Gallery(props) {
  if (!props || props.disabled === true) {
    return null
  }

  const { hasMember: items } = props

  return (
    <div className='my-8 col-start-1 col-end-6' >
      <div className='grid grid-cols-6 flex-wrap gap-10' >
        {/* <pre>{JSON.stringify(props, null, 4)}</pre> */}
        {items && items.map((i) => <ItemView key={i._key ?? i._id} {...i} />)}
      </div>
    </div>
  )
}
