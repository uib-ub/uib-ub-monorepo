import { fieldConfig } from "./search-config";

interface Renderer {
  fields?: string[];
  title: (hit: any, display: string) => any;
  details: (hit: any, display: string) => any;
  cadastre?: (hit: any) => any;
  snippet?: (hit: any, display: string) => any;
}

interface ResultRenderers {
  [key: string]: Renderer;
}


function createMarkup(htmlString: string) {
  const decodedHtmlString = htmlString.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  return {__html: decodedHtmlString};
}



const formatHighlight = (highlight: string) => {
  // Remove inomplete html tags
  let processedHighlight = highlight.replace(/<[^>]*$/, '').replace(/^[^<]*>/, '')

  return <div dangerouslySetInnerHTML={createMarkup(processedHighlight)}></div>;

}

const defaultTitle = (hit: any) => {
  return <span className="font-semibold">{multivalue(hit.fields?.label)}</span>
}

const loktypeDetails = (loktype: string, hit: any) => {
  return <>{loktype}{loktype && ' – '} {hit.fields.adm2}{hit.fields.adm1 && ', ' + hit.fields.adm1}  </>
}



const multivalue = (value: string|string[]) => {
  return Array.isArray(value) ? value.join("/") : value
}

function formatCadastre(cadastre: Record<string, any>[]): string {
  return cadastre.map(item => {
      if (Array.isArray(item.gnr) && item.gnr.length > 1) {

              return item.gnr.join(",")

      } else if (item.bnr) {
          if (Array.isArray(item.bnr)) {
              // Sort bnr to ensure correct range identification
              const sortedBnr = item.bnr.sort((a, b) => a - b);
              const ranges = [];
              let start = sortedBnr[0];
              let end = start;

              for (let i = 1; i < sortedBnr.length; i++) {
                  if (sortedBnr[i] === end + 1) {
                      end = sortedBnr[i];
                  } else {
                      if (start === end) {
                          ranges.push(`${item.gnr}/${start}`);
                      } else {
                          ranges.push(`${item.gnr}/${start}-${end}`);
                      }
                      start = sortedBnr[i];
                      end = start;
                  }
              }

              // Handle the last range or number
              if (start === end) {
                  ranges.push(`${item.gnr}/${start}`);
              } else {
                  ranges.push(`${item.gnr}/${start}-${end}`);
              }

              return ranges.join(', ');
          } else {
              return `${item.gnr}/${item.bnr}`;
          }
      } else {
          return `${item.gnr}`;
      }
  }).join(', ');
}


const formatAdm = (source: Record<string, any>) => {
  const {adm1, adm2, adm3} = source
  return <>{adm3}{adm3 && ' – '}{adm2 && adm2 != adm1 && adm2 + ', '}{adm1}</>
}

const cadastreAdm = (knr: string | undefined, gnr: string | undefined, bnr: string | undefined, sep: string, source: Record<string,any>, display: string ) => {
  const { cadastre } = source


  const admText = display != 'grouped' ? <>{(source.cadastre || gnr) && gnr != "0" && ', '}{formatAdm(source)}</> : ''
  if (cadastre) {
    return <>{!knr && "Gnr" + (cadastre.bnr ? "/Bnr": "") + ": "}{knr}{knr && "-"}{formatCadastre(cadastre)}{admText}</>
  }
  if (!gnr || gnr == '0') {
    return admText
  }
  return  <>{!knr && "Gnr" + (bnr ? "/Bnr": "") + ": "}{gnr && knr}{knr && gnr && '-'}{gnr}{bnr && bnr != '0' ? sep + bnr : ''}{admText}</>
}


export const resultRenderers: ResultRenderers = {
  search: {
    title: defaultTitle,
    details: (hit: any, display: string) => {
      return <>{hit.fields?.adm2 && multivalue(hit.fields.adm2) + ", "}{multivalue(hit.fields.adm1)}{ hit.fields.adm1 == "[Uordna]" && <>&nbsp;<em>{hit.fields.adm2Fallback && hit.fields.adm2Fallback + ", " }{hit.fields.adm1Fallback}</em></> }</>
    }
  },
  sof: {
    title: (hit: any, display: string) => {
     // TODO: add kulturkode to the datasets?
     const placeType = multivalue(hit.fields["placeType.label"])
     if (placeType) {
        return <>{defaultTitle(hit)} {` (${placeType.toLowerCase()})`}</>
      }
      else {
        return defaultTitle(hit)
      }
    },
    details: (hit: any, display: string) => {
      return cadastreAdm(hit.fields.rawData?.KommuneNr, hit.fields.rawData?.GardsNr, hit.fields.rawData?.BruksNr, "/", hit.fields, display)
    }
  },
  rygh: {
    title: (hit: any, display: string) => {
      const fields = hit.fields
      if (display == 'table') return defaultTitle(fields)
      return <>{defaultTitle(hit)}{fields?.sosi && ` (${ fields.sosi[0].toLowerCase()})`}</>
    },
    snippet: (hit: any, display: string) => {
      return hit.highlight?.['content.html'][0] && formatHighlight(hit.highlight['content.html'][0])
    },
    details: (hit: any, display: string) => {
      return cadastreAdm(hit.fields["rawData.KNR"], hit.fields["rawData.Gnr"], hit.fields["rawData.Bnr"] || undefined, "/", hit.fields, display)
    }
  },
  leks: {
    title: (hit: any, display: string) => {
      if (display == 'table') return defaultTitle(hit)
      return <>{defaultTitle(hit)}{hit.fields.rawData?.Lokalitetstype ? ` (${hit.fields.rawData?.Lokalitetstype.toLowerCase()})` : ""}</>
    },
    snippet: (hit: any, display: string) => {
      return hit.highlight?.['content.html']?.[0] && formatHighlight(hit.highlight['content.html']?.[0])
    },
    details: (hit: any, display: string) => {
      return cadastreAdm(hit.fields["rawData.KNR"], hit.fields["rawData.GNR"], hit.fields["rawData.BNR"], "/", hit.fields, display)
      
    }
  },
  leks_g: {
    title: defaultTitle,
    snippet: (hit: any, display: string) => {
      return hit.highlight?.['content.text'][0] && formatHighlight(hit.highlight['content.text'][0])
    },
    details: (hit: any, display: string) => {
      return 
    }
  },
  bsn: {
    title: (hit: any, display: string) => {
      // loktype is either an object or a list of objects. If it's a list, we want to join the types with a comma
      const fields = hit.fields
      let loktypes = fields["rawData.stnavn.loktype"]
      if (Array.isArray(loktypes)) {
        loktypes = loktypes.map((type: any) => type.type).join(', ')
      }
      else {
        loktypes = loktypes?.type
      }
      return <>{defaultTitle(hit)} {loktypes && ` (${loktypes.toLowerCase()})`}</>
    },
    details: (hit: any, display: string) => {
      const fields = hit.fields
      return cadastreAdm(fields["tmp.knr"], fields["rawData.stnavn.sted.gårdsnr"], fields["rawData.stnavn.sted.bruksnr"], "/", fields, display)
    }
  },
  hord: {
    title: (hit: any, display: string) => {
      const fields = hit.fields
      return <><span className="font-semibold">{fields.label}{fields.altLabels ? ', ':''}</span>{fields.altLabels}</> 
    },
    snippet: (hit: any, display: string) => {
      return hit.highlight?.['rawData.merknader'][0] && formatHighlight(hit.highlight['rawData.merknader'][0])
    },
    details: (hit: any, display: string) => {
      const fields = hit.fields  
      return <>{cadastreAdm(fields["rawData.kommuneNr"], fields["rawData.bruka.bruk.gardsNr"], fields["rawData.bruka.bruk.bruksNr"], "/", fields, display)}
      {!hit.highlight && fields["rawData.merknader"] ? 
        <><br/>{fields["rawData.merknader"]?.slice(0,100)}{fields["rawData.merknader"]?.length > 100 ? '...' : ''}
        </> : ''} 
        </>
    }
  },
  nbas: {
    title: (hit: any, display: string) => {
      if (display == 'table') return defaultTitle(hit)
      return <>{defaultTitle(hit)}{hit.fields.sosi && <>&nbsp;{`(${hit.fields.sosi})`}</>}</>
    },
    details: (hit: any, display: string) => {
      return formatAdm(hit.fields)
    }
  },
  m1838: {
    title: (hit: any, display: string) => {
      return <>{defaultTitle(hit)}{hit.fields.sosi && <>&nbsp;{`(${hit.fields.sosi})`}</>}</>
    },
    details: (hit: any, display: string) => {
      return cadastreAdm(hit.fields["rawData.KNR"], hit.fields["rawData.MNR"], hit.fields["rawData.LNR"], ".", hit.fields, display)
    }
  },
  m1886: {
    title: (hit: any, display: string) => {
      if (display == 'table') return defaultTitle(hit)
        return <>{defaultTitle(hit)}{hit.fields.sosi && <>&nbsp;{`(${hit.fields.sosi})`}</>}</>
      //return <>{defaultTitle(hit)} {hit.fields.sosi && (" | " + hit.fields.sosi[0].toUpperCase() + hit.fields.sosi.slice(1))}</>
    },
    details: (hit: any, display: string) => {
      return cadastreAdm(hit.fields.rawData?.knr, hit.fields.rawData?.gnr, hit.fields.rawData?.bnr, "/", hit.fields, display)
    }
  },
  mu1950: {
    title: (hit: any, display: string) => {
      if (display == 'table') return defaultTitle(hit) 
      return <>{defaultTitle(hit)}{hit.fields.sosi && <>&nbsp;{`(${hit.fields.sosi})`}</>}</>
      //return <>{defaultTitle(hit)} {hit.fields.sosi && (" | " + hit.fields.sosi[0].toUpperCase() + hit.fields.sosi.slice(1))}</>
    },
    details: (hit: any, display: string) => {
      return cadastreAdm(hit.fields.rawData?.KNR || hit.fields.knr, hit.fields.rawData?.GNR, hit.fields.rawData?.BNR, "/", hit.fields, display)
    }
  },
  skul: {
    title: (hit: any, display: string) => {
      return <>{defaultTitle(hit)} | {hit.fields.rawData?.knr}-{hit.fields.rawData?.gnr}{hit.fields.rawData?.bnr && '/'}{hit.fields.rawData?.bnr}</>
    },
    details: (hit: any, display: string) => {
      return loktypeDetails(hit.fields.type && (hit.fields.type[0].toUpperCase() + hit.fields.sosi.slice(1)), hit)
    }
  },
  ostf: {
    title: (hit: any, display: string) => {
      return <><strong>{hit.fields.label}</strong> </>
    },
    details: (hit: any, display: string) => {
      // loktype is either an object or a list of objects. If it's a list, we want to join the types with a comma

      return <> {hit.fields["rawData.GNID"]}{hit.fields["rawData.GNID"] && ", "}{formatAdm(hit.fields)}</>
    }
  },
  tot: {
    title: defaultTitle,
    details: (hit: any, display: string) => {
      return <>{hit.fields.adm2}{hit.fields.adm1 && ', ' + hit.fields.adm1}</>
      }
  },
  ssr2016: {
    title: defaultTitle,
    details: (hit: any, display: string) => {
      return <>{hit.fields.adm2}{hit.fields.adm1 && ', ' + hit.fields.adm1}</>
    }
  },

  
  
}


export const defaultResultRenderer: Renderer = {
  title: defaultTitle,
  details: (hit: any, display: string) => {
    return <>{hit.fields.adm2}{hit.fields.adm1 && ', ' + hit.fields.adm1}</>
  }
}