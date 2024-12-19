import ItemView from './ItemView'

export default function Gallery(props) {
  if (!props || props.disabled === true) {
    return null
  }

  const { hasMember: items } = props

  return (
    <div className='my-8 col-start-1 col-end-6' >
      <div className='grid grid-cols-6 flex-wrap gap-10' >
        {items && items.map((i, index) => <ItemView key={i._key + '_' + index ?? i._id} {...i} index={index} />)}
      </div>
    </div>
  )
}
