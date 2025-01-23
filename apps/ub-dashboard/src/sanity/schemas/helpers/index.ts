import { supportedLanguages } from '../vocabularies/defaultVocabularies'
import dayjs from 'dayjs'
import _ from 'lodash'
import localizedFormat from 'dayjs/plugin/localizedFormat'
dayjs.extend(localizedFormat)
require('dayjs/locale/nb')

export const coalesceLabel = (label: any, lang: string = 'no') => {
  let langs = [lang]
  supportedLanguages.forEach((x: any) => {
    langs.push(x.id)
  })
  langs = [...new Set(langs)]

  if (!label) {
    return
  }

  if (label && typeof label === 'string') {
    return label
  }

  if (lang && label[lang]) {
    return label[lang]
  }

  let result = getLabelByLangs(label, langs)
  return result?.[0] ?? 'Untitled'
}

function getLabelByLangs(label: any, arr: any) {
  if (!label || !arr) {
    return
  }
  const labels: any[] = []

  arr.forEach((element: any) => {
    Object.entries(label).forEach(([key, val]) => {
      if (key === element) {
        labels.push(val)
      }
    })
  })
  return labels || 'Untitled'
}

export const timespanAsString = (bb: any, eb: any, date: any, be: any, ee: any, lang: any) => {
  let dates = _.pickBy({ bb: bb, eb: eb, date: date, be: be, ee: ee }, _.identity)
  dates = Object.assign(
    {},
    ...Object.keys(dates).map((date) => ({ [date]: dayjs(dates[date]).locale(lang).format('LL') })),
  )
  let prettyTimespan =
    `${dates.date || ''}${dates.bb || ''}${dates.bb && dates.eb ? '~' : ''}${dates.eb || ''}` +
    `${(dates.bb || dates.eb) && (dates.be || dates.ee) ? ' / ' : ''}` +
    `${dates.be || ''}${dates.be && dates.ee ? '~' : ''}${dates.ee || ''}`
  return prettyTimespan
}
