export default function TableBlock(props) {
  if (!props || props.disabled === true) {
    return null
  }

  const { title, data } = props

  const head = data.rows[0].cells ?? null
  const body = data.rows.length > 1 ? data.rows.slice(1) : null

  return (
    <div>
      <table>
        {title && <caption>{title}</caption>}

        {head && (
          <thead className='text-bold'>
            <tr>
              {head.map((cell, index) => (
                <th key={index}>{cell}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {body.length > 1 &&
            body.map((row) => (
              <tr key={row._key}>
                {row.cells.map((cell, index) => (
                  <td key={index}>{cell}</td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
