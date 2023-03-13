import { reduceValuesByLanguage } from 'utils'

export async function constructMetadata(data) {
  const subjectLabelsByLang = data.subject ? reduceValuesByLanguage(data.subject.map(s => s.label)) : undefined
  const spatialLabelsByLang = data.spatial ? reduceValuesByLanguage(data.spatial.map(s => s.label)) : undefined

  const metadata = [
    data.label !== null ? {
      label: {
        no: ["Tittel"],
        en: ["Title"]
      },
      value: data.label
    } : undefined,
    data.identifier ? {
      label: {
        en: ["Identifier"],
        no: ["Identifikator"],
      },
      value: {
        none: [data.identifier]
      }
    } : undefined,
    data.available ? {
      label: {
        en: ["Available from"],
        no: ["Tilgjengelig fra"],
      },
      value: {
        none: [data.available['@value']]
      }
    } : undefined,
    data.timespan?.edtf ? {
      label: {
        en: ["Timespan"],
        no: ["Tidsspenn"],
      },
      value: {
        none: [data.timespan?.edtf]
      }
    } : undefined,
    subjectLabelsByLang ? {
      label: {
        en: ["Subjects"],
        no: ["Emneord"],
      },
      value: {
        ...subjectLabelsByLang
      }
    } : undefined,
    spatialLabelsByLang ? {
      label: {
        en: ["Spatial"],
        no: ["Steder"],
      },
      value: {
        ...spatialLabelsByLang
      }
    } : undefined,
  ]
  return metadata.filter(Boolean)
}
