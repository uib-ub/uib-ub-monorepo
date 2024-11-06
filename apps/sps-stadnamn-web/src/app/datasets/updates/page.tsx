import Link from "next/link"
import { datasetTitles, publishDates} from "@/config/metadata-config"


  export async function generateMetadata( { searchParams }: { searchParams: Promise<{ dataset: string }> }) {
    const { dataset } = await searchParams
    if (dataset) {
        return {
            title: 'Historikk: ' + datasetTitles[dataset],
            description: 'Endringshistorikk for datasettet ' + datasetTitles[dataset]
        }

    }
    else {
        return {
            title: 'Oppdateringer',
            description: 'Siste oppdateringer i datasettenes'
        }
    }
}


export default async function Updates({searchParams}: {searchParams: Promise<{dataset: string}>}) {
    const { dataset } = await searchParams

    function format_timestamp(timestamp: string) {
        const date = new Date(timestamp)
        return date.toLocaleDateString()
    }

  const updates = await fetch(`https://git.app.uib.no/api/v4/projects/26634/repository/commits?ref_name=main${dataset ? `&path=lfs-data/elastic/${dataset}_elastic.json` : ''}`)

    if (!updates.ok) {
        return (
            <div>
                <h1>Oppdateringer</h1>
                <p>Kunne ikke hente oppdateringer</p>
            </div>
        )
    }
    else {
        const data = await updates.json()
        return (
            <>
                { dataset ? 
                <>
                <h1>Historikk: {datasetTitles[dataset]}</h1>
                
                <p>Endringshistorikk for datasettet {datasetTitles[dataset]} etter at det ble publisert i Stadnamnportalen.</p>
                Lagt til: {format_timestamp(publishDates[dataset])}
                <h2>Oppdateringer:</h2>
                </>
                    :
                    data.length > 1 && <h1>Oppdateringer</h1>
                }          
                
                { data.length > 1 ? <ul className="!list-none !p-0">
                {data.map((update: any) => {
                    return (
                        <li key={update.id}>
                        <strong className="!text-base !font-sans font-semibold">{format_timestamp(update.committed_date)}</strong>: {update.message}
                        </li>
                    )
                }

                )}
                </ul>
                : <p>Ingen oppdateringer</p>
                
                }
                <div className="mt-6 flex gap-3 flex-col">
                {dataset && <Link href="/datasets/updates">Se historikk for alle datasett</Link>}
                <Link href={`https://git.app.uib.no/spraksamlingane/stadnamn/datasett/stadnamn-archive/-/commits/main?ref_type=heads`}>Se detaljer i GitLab</Link>
                </div>
            </>
            )
        
    }
}