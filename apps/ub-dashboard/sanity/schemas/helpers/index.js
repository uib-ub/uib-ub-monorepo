import {supportedLanguages} from '../vocabularies/defaultVocabularies'
var dayjs = require('dayjs')
var _ = require('lodash')
var localizedFormat = require('dayjs/plugin/localizedFormat')
dayjs.extend(localizedFormat)
require('dayjs/locale/nb')

export const coalesceLabel = (label, lang) => {
  let langs = [lang || '']
  supportedLanguages.map((x) => {
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
  return result[0]
}

function getLabelByLangs(label, arr) {
  if (!label || !arr) {
    return
  }
  let labels = []

  arr.map((element) => {
    Object.entries(label).map(([key, val]) => {
      if (key === element) {
        labels.push(val)
      }
    })
  })
  return labels || 'Untitled'
}

export const timespanAsString = (bb, eb, date, be, ee, lang) => {
  let dates = _.pickBy({bb: bb, eb: eb, date: date, be: be, ee: ee}, _.identity)
  dates = Object.assign(
    {},
    ...Object.keys(dates).map((date) => ({[date]: dayjs(dates[date]).locale(lang).format('LL')})),
  )
  let prettyTimespan =
    `${dates.date || ''}${dates.bb || ''}${dates.bb && dates.eb ? '~' : ''}${dates.eb || ''}` +
    `${(dates.bb || dates.eb) && (dates.be || dates.ee) ? ' / ' : ''}` +
    `${dates.be || ''}${dates.be && dates.ee ? '~' : ''}${dates.ee || ''}`
  return prettyTimespan
}
