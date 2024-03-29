import { utcToZonedTime, format } from 'date-fns-tz'
import { fromUnixTime } from 'date-fns'
import edtf from 'edtf'
import { randomUUID } from 'crypto'

const getDateFromDateTime = (unix: number) => {
  const date = format(utcToZonedTime(fromUnixTime(unix / 1000), 'UTC'), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", { timeZone: 'UTC' })
  return date
}

const getDateFromDate = (unix: number) => {
  const date = format(fromUnixTime(unix / 1000), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", { timeZone: 'UTC' })
  return date
}

export const getTimespan = (date: any, after: any, before: any) => {
  if (!date && !after && !before) return undefined
  //console.log('getTimespan', date, after, before)

  try {
    if (date) {
      const e = edtf(date['@value'], { types: ['Year', 'Date', 'Interval', 'Season'] })
      return mapEDTF(e)
    }
    if (after?.['@value'] === before?.['@value']) {
      const e = edtf(before?.['@value'], { types: ['Year', 'Date', 'Interval', 'Season'] })
      return mapEDTF(e)
    }
    if (after && !before) {
      const e = edtf(`${after['@value']}/`, { types: ['Year', 'Date', 'Interval', 'Season'] })
      return mapEDTF(e)
    }
    if (!after && before) {
      const e = edtf(`/${before['@value']}`, { types: ['Year', 'Date', 'Interval', 'Season'] })
      return mapEDTF(e)
    }
    if (after && before) {
      const e = edtf(`${after['@value']}/${before['@value']}`, { types: ['Year', 'Date', 'Interval', 'Season'] })
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
  // console.log('Got EDTF', edtf)

  if (edtf.type == 'Interval') {
    const timespan = {
      id: randomUUID(),
      _type: ['Timespan'],
      edtf: edtf,
      ...(edtf.lower?.min && { beginOfTheBegin: getDateFromDateTime(edtf.lower?.min) }),
      ...(edtf.lower?.max && { endOfTheBegin: getDateFromDateTime(edtf.lower?.max) }),
      ...(edtf.upper?.min && { beginOfTheEnd: getDateFromDateTime(edtf.upper?.min) }),
      ...(edtf.upper?.max && { endOfTheEnd: getDateFromDateTime(edtf.upper?.max) }),
    }
    // console.log('returning: ', timespan)
    return timespan
  }

  const timespan = {
    edtf: edtf,
    id: randomUUID(),
    _type: ['Timespan'],
    ...(edtf.min && (edtf.min != edtf.max) && { beginOfTheBegin: getDateFromDateTime(edtf.min) }),
    ...(edtf.min && (edtf.min === edtf.max) && { date: getDateFromDate(edtf.min) }),
    ...(edtf.max && (edtf.min != edtf.max) && { endOfTheEnd: getDateFromDateTime(edtf.max) }),
  }
  // console.log('returning', timespan)
  return timespan
}
