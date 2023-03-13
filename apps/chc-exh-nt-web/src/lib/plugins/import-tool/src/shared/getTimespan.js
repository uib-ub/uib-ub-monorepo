import { mapEDTF } from './mapEDTF'
import edtf from 'edtf'

export const getTimespan = (date, after, before) => {
  if (date) {
    const e = edtf(date, { types: ['Year', 'Date', 'Interval', 'Season'] })
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
  return null
}