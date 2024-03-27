import { reduceValuesByLanguage } from '../reduceValuesByLanguage'

export function constructMetadata(data: any) {
  console.log("🚀 ~ constructMetadata ~ data:", data)
  if (!data) return undefined
  const subjectLabelsByLang = data.subject ? reduceValuesByLanguage(data.subject.map((s: any) => s.label)) : undefined
  const spatialLabelsByLang = data.spatial ? reduceValuesByLanguage(data.spatial.map((s: any) => s.label)) : undefined

  const metadata = [
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
