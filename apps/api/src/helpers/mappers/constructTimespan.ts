import { toZonedTime, format } from 'date-fns-tz'
import { fromUnixTime } from 'date-fns'
import edtf from 'edtf'

const getDateFromDateTime = (unix: number) => {
  const date = format(toZonedTime(fromUnixTime(unix / 1000), 'UTC'), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", { timeZone: 'UTC' })
  return date
}

const getDateFromDate = (unix: number) => {
  const date = format(fromUnixTime(unix / 1000), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", { timeZone: 'UTC' })
  return date
}

/**
 * Construct CIDOC-CRM Timespan from EDTF string, using edtf.js. 
 * TODO: Remember to improve error handeling, eg 820 vs 0820.
 * @param date 
 * @param after 
 * @param before 
 * @returns {
 *  type: 'Timespan',
 *  edtf: string,
 *  beginOfTheBegin: string,
 *  endOfTheBegin?: string,
 *  beginOfTheEnd?: string,
 *  endOfTheEnd: string,
 *  date?: string
 * }
 */
export const getTimespan = (date: any, after: any, before: any) => {
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
    console.log('Error in getTimespan', e)
    return undefined
  }
  return undefined
}

/**
 * Remember to handle errors
 * @param {object} edtf edtf object
 * @returns Timespan object
 */
export const mapEDTF = (edtf: any) => {
  if (!edtf) {
    return undefined
  }

  const dateString = edtf.toString()

  if (edtf.type == 'Interval') {
    const timespan = {
      type: 'Timespan',
      edtf: dateString,
      ...(edtf.lower?.min && { beginOfTheBegin: getDateFromDateTime(edtf.lower?.min) }),
      ...(edtf.lower?.max && { endOfTheBegin: getDateFromDateTime(edtf.lower?.max) }),
      ...(edtf.upper?.min && { beginOfTheEnd: getDateFromDateTime(edtf.upper?.min) }),
      ...(edtf.upper?.max && { endOfTheEnd: getDateFromDateTime(edtf.upper?.max) }),
    }
    // console.log('returning: ', timespan)
    return timespan
  }

  const timespan = {
    edtf: dateString,
    type: 'Timespan',
    ...(edtf.min && (edtf.min != edtf.max) && { beginOfTheBegin: getDateFromDateTime(edtf.min) }),
    ...(edtf.min && (edtf.min === edtf.max) && { date: getDateFromDate(edtf.min) }),
    ...(edtf.max && (edtf.min != edtf.max) && { endOfTheEnd: getDateFromDateTime(edtf.max) }),
  }
  // console.log('returning', timespan)
  return timespan
}
