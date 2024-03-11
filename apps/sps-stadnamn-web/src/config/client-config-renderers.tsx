interface Renderer {
  title: (hit: any) => any;
  details: (hit: any) => any;
}

interface ResultRenderers {
  [key: string]: Renderer;
}

export const resultRenderers: ResultRenderers = {
  hord: {
    title: (source: any) => {
      return source.label + " | " + source.adm2
    },
    details: (source: any) => {
      return source.rawData?.merknader || source.rawData?.komm
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