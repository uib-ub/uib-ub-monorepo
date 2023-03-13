import React from 'react'
import {parse, format} from 'date-fns'
import {Text} from '@sanity/ui'

const DateBadge = (props) => {
  if (!props.date) {
    return null
  }
  let parsedDate
  let formatedDate

  switch(props.date.length) {
    case 8 :
      parsedDate = parse(props.date, 'yyyyMMdd', new Date())
      formatedDate = format(parsedDate, 'd. MMMM yyyy')
      break
    case 6 :
      parsedDate = parse(props.date, 'yyyyMM', new Date())
      formatedDate = format(parsedDate, 'MMMM yyyy')
      break
    case 4 :
      parsedDate = parse(props.date, 'yyyy', new Date())
      formatedDate = format(parsedDate, 'yyyy')
      break

  }

  return <Text size={1}>{formatedDate}</Text>
}

export default DateBadge
