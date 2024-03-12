interface Renderer {
  title: (hit: any) => any;
  details: (hit: any) => any;
}

interface ResultRenderers {
  [key: string]: Renderer;
}

const getUniqueAltLabels = (source: any, prefLabel: string, altLabelKeys: string[]) => {
  const altLabels = altLabelKeys.map((key) => source[key]).filter((label: string) => label !== prefLabel && label);
  const concatenatedLabels = [...new Set(altLabels)].join(', ')
  return concatenatedLabels ? ', ' + concatenatedLabels : '';
}

export const resultRenderers: ResultRenderers = {
  hord: {
    title: (source: any) => {
      return <><strong>{source.label}</strong>{getUniqueAltLabels(source.rawData, source.label, ['namn', 'oppslagsForm', 'normertForm', 'uttale'])}{source.adm2 ? ' | ' + source.adm2 + ' kommune' : ''}</> 
    },
    details: (source: any) => {
      return  (source.rawData.merknader || '')
    },

  }
}


export const defaultResultRenderer: Renderer = {
      title: (source: any) => {
        return source.label
      },
      details: (source: any) => {
        return source.adm2
      }
  }