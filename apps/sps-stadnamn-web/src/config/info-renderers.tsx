import InfoBox from '@/components/ui/infobox';
import Link from 'next/link';


const getUniqueAltLabels = (source: any, prefLabel: string, altLabelKeys: string[]) => {
    const altLabels = altLabelKeys.map((key) => source[key]).filter((label: string) => label !== prefLabel && label);
    return [...new Set(altLabels)].join(', ')
  }


  function createMarkup(htmlString: string) {
    const decodedHtmlString = htmlString.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    return {__html: decodedHtmlString};
  }
  
  function HtmlString({htmlString}: {htmlString: string}) {
    return <div dangerouslySetInnerHTML={createMarkup(htmlString)} />;
  }


export const infoPageRenderers: Record<string, (source: any) => JSX.Element> = {
    leks: (source: any) => {
      return <>
      <div className='space-y-2'>
      {source.rawData?.tolking && <div><strong className="text-neutral-900">Tolking: </strong><HtmlString htmlString={source.rawData?.tolking} /></div>}
      </div>
      <InfoBox dataset={'leks'} items={[
        {title: 'Oppslagsform', value: source.label},
        {title: 'Lokalitetstype', value: source.rawData.lokalitetstype},
        {title: 'Kommune', value: source.adm2},
        {title: 'Kommunenummer', value: source.rawData.kommunenr},
        {title: 'Fylke', value: source.adm1},
        {title: 'Førsteledd', value: source.rawData.førsteledd},
        {title: 'Sisteledd', value: source.rawData.sisteledd},
        {title: 'StedsnavnID', 
          items: [{value: source.rawData.snid, href: `/view/leks?rawData.snid=${encodeURIComponent(source.rawData.snid)}`}]},
        {title: 'GNIDu', 
          items: [{value: source.rawData.gnidu, href: `/view/leks?rawData.gnidu=${encodeURIComponent(source.rawData.gnidu)}`}]},
        {title: 'Longitude', value: source.rawData.longitude},
        {title: 'Latitude', value: source.rawData.latitude},
        {title: 'N50 Kartid', value: source.rawData.n50_kartid}
      ]}/>
    </>




    },
    bsn: (source: any) => {
      return <>
      <div className='space-y-2'>
      {source.rawData?.stnavn?.komm && <div><strong className="text-neutral-900">Merknad: </strong>{source.rawData?.stnavn?.komm}</div>}
      </div>
      <InfoBox dataset={'bsn'}
               items={[
                  {title: 'Opppslagsform', value: source.rawData?.stnavn?.oppslag?.oppslord},
                  {title: 'Preposisjon', value: source.rawData?.stnavn?.oppslag?.prep},
                  {title: 'Parform', value: source.rawData?.stnavn?.parform_pf_navn},
                  {title: 'Stedstype', value: source.rawData?.stnavn?.sted?.type},
                  {title: 'Kommune', value: source.adm2},
                  {title: 'Fylke', value: source.adm1},
                  {
                    title: 'Gardsnummer', 
                    items: [{value: source.rawData?.stnavn?.sted?.gårdsnr, href: `/view/bsn?rawData.stnavn.sted__gårdsnr=${encodeURIComponent(source.rawData?.stnavn?.sted?.gårdsnr)}`}]
                  },
                  {
                    title: 'Bruksnummer', 
                    items: [{value: source.rawData?.stnavn?.sted?.bruksnr, href: `/view/bsn?rawData.stnavn.sted__bruksnr=${encodeURIComponent(source.rawData?.stnavn?.sted?.bruksnr)}&rawData.stnavn.sted__gårdsnr=${encodeURIComponent(source.rawData?.stnavn?.sted?.gårdsnr)}`}]
                  },
                ]}
      />
      </>
  
    },
    hord: (source: any) => {
      const altLabels = getUniqueAltLabels(source.rawData, source.label, ['namn', 'oppslagsForm', 'normertForm', 'uttale'])
      return <>
      <div className='space-y-2'>
      { altLabels && <div><strong className="text-neutral-900">Andre navneformer (inkl. uttale): </strong>{altLabels}</div>}
      {source.rawData.merknader && <div><strong className="text-neutral-900">Merknader: </strong>{source.rawData.merknader}</div>}
      </div>
      {source.audio && <audio controls src={`https://iiif.test.ubbe.no/iiif/audio/hord/${source.audio.file}`}></audio>}
      <InfoBox dataset={'hord'} items={[
        {title: 'Kommune', value: source.rawData.kommuneNamn}, 
        {title: 'Kommunenummer', value: source.rawData.kommuneNr}, 
        {
          title: 'Gardsnummer', 
          items: [...new Set(source.cadastre?.map((item: any) => item.gnr) as string[])].map((gnr: string) => ({
            value: gnr, 
            href: `/view/hord?rawData.kommuneNr=${encodeURIComponent(source.rawData.kommuneNr)}&cadastre__gnr=${encodeURIComponent(gnr)}`
          })),
        },
        {
          title: 'Bruksnummer', 
          items: source.cadastre?.map((item: any) => ({
            value: item.bnr, 
            href: `/view/hord?rawData.kommuneNr=${encodeURIComponent(source.rawData.kommuneNr)}&cadastre__gnr=${encodeURIComponent(item.gnr)}&cadastre__bnr=${encodeURIComponent(item.bnr)}`
          })),
        },
        
        {title: 'Oppskrivar', value: source.rawData.oppskrivar},
        {title: 'Oppskrivingstid', value: source.rawData.oppskrivingsTid},
      ]}/>
      </>
    },
    ostf: (source: any) => {
        return <>
        { source.links?.length &&
        <div>
        <h3>Lenker</h3>
        <ul className='!mt-0 !list-none !pl-0'>
          {source.links.map((link: any, index: number) => (
            <li key={index}><Link href={link} target="_blank" className=''>{link}</Link></li>
          ))}
  
        </ul>
  
        
        </div>
        }
        <InfoBox dataset={'ostf'} 
                 items={[
          {title: 'Oppslagsform', value: source.rawData['Oppslagsform/skriftform']},
          {title: 'Kommune', value: source.rawData["Herred for lokalitet"]},
          {title: 'Fylke', value: source.rawData.Fylke},
          {title: 'Matrikkelnummer', value: source.rawData.GNID},
          {title: 'Sidetall', value: source.rawData["Sidetall/henvisning"]},
          {title: 'Koordinater', value: source.rawData.Y + ", " + source.rawData.X},
          {title: 'Presisjon', value: source.rawData.Koordinattype},
          {title: 'StedsnavnID', value: source.rawData.SNID},
          {title: 'Unikt matrikkelnummer', items: 
            ["GNIDu_01", "GNIDu_02", "GNIDu_03", "GNIDu_04", "GNIDu_05", "GNIDu_06"].filter(item => source.rawData[item]?.length).map(key => {
              return {value: source.rawData[key], href: `/view/ostf?rawData.${key}=${encodeURIComponent(source.rawData[key])}`}
            }
  
            )
          },
        ]}/>
  
  
  
        
        
        </>
    } 
  
  }