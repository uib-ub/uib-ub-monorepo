import { format } from 'date-fns'
import { TZDate } from '@date-fns/tz'
import edtf from 'edtf'

const getDateFromDateTime = (unix: number) => {
  const date = format(
    new TZDate(new Date(unix), 'UTC'),
    "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
  )
  return date
}

const getDateFromDate = (unix: number) => {
  const date = format(
    new TZDate(new Date(unix), 'UTC'),
    "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
  )
  return date
}

/**
 * Construct CIDOC-CRM TimeSpan from EDTF string, using edtf.js. 
 * TODO: Remember to improve error handeling, eg 820 vs 0820.
 * @param date 
 * @param after 
 * @param before 
 * @returns {
 *  type: 'TimeSpan',
 *  edtf: string,
 *  begin_of_the_begin: string,
 *  end_of_the_begin?: string,
 *  begin_of_the_end?: string,
 *  end_of_the_end: string,
 *  date?: string
 * }
 */
export const getTimeSpan = (date: any, after: any, before: any) => {
  if (!date && !after && !before) return undefined

  try {
    if (date) {
      const e = edtf(date, { types: ['Year', 'Date', 'Interval', 'Season'] })
      return mapEDTF(e)
    }
    if (after === before) {
      const e = edtf(before, { types: ['Year', 'Date', 'Interval', 'Season'] })
      return mapEDTF(e)
    }
    if (after && !before) {
      const e = edtf(`${after}/`, { types: ['Year', 'Date', 'Interval', 'Season'] })
      return mapEDTF(e)
    }
    if (!after && before) {
      const e = edtf(`/${before}`, { types: ['Year', 'Date', 'Interval', 'Season'] })
      return mapEDTF(e)
    }
    if (after && before) {
      const e = edtf(`${after}/${before}`, { types: ['Year', 'Date', 'Interval', 'Season'] })
      return mapEDTF(e)
    }
  } catch (e) {
    console.error('Error constructing time span:', e)
    return undefined
  }
}

/**
 * Remember to handle errors
 * @param {object} edtf edtf object
 * @returns TimeSpan object
 */
export const mapEDTF = (edtf: any) => {
  if (!edtf) {
    return undefined
  }

  const dateString = edtf.toString()

  if (edtf.type == 'Interval') {
    const timespan = {
      type: 'TimeSpan',
      edtf: dateString,
      ...(edtf.lower?.min && { begin_of_the_begin: getDateFromDateTime(edtf.lower?.min) }),
      ...(edtf.lower?.max && { end_of_the_begin: getDateFromDateTime(edtf.lower?.max) }),
      ...(edtf.upper?.min && { begin_of_the_end: getDateFromDateTime(edtf.upper?.min) }),
      ...(edtf.upper?.max && { end_of_the_end: getDateFromDateTime(edtf.upper?.max) }),
    }
    // console.log('returning: ', timespan)
    return timespan
  }

  const timespan = {
    edtf: dateString,
    type: 'TimeSpan',
    ...(edtf.min && (edtf.min != edtf.max) && { begin_of_the_begin: getDateFromDateTime(edtf.min) }),
    ...(edtf.min && (edtf.min === edtf.max) && { date: getDateFromDate(edtf.min) }),
    ...(edtf.max && (edtf.min != edtf.max) && { end_of_the_end: getDateFromDateTime(edtf.max) }),
  }
  // console.log('returning', timespan)
  return timespan
}
