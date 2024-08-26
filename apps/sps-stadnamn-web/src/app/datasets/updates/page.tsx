import Link from "next/link"
import { datasetTitles, publishDates} from "@/config/metadata-config"


  export async function generateMetadata( { searchParams }: { searchParams: { dataset: string } }) {
    if (searchParams.dataset) {
        return {
            title: 'Historikk: ' + datasetTitles[searchParams.dataset],
            description: 'Endringshistorikk for datasettet ' + datasetTitles[searchParams.dataset]
        }

    }
    else {
        return {
            title: 'Oppdateringer',
            description: 'Siste oppdateringer i datasettenes'
        }
    }
}


export default async function Updates({searchParams}: {searchParams: {dataset: string}}) {

    function format_timestamp(timestamp: string) {
        const date = new Date(timestamp)
        return date.toLocaleDateString()
    }

  const updates = await fetch(`https://git.app.uib.no/api/v4/projects/26634/repository/commits?ref_name=main${searchParams.dataset ? `&path=lfs-data/elastic/${searchParams.dataset}_elastic.json` : ''}`)

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
                { searchParams.dataset ? 
                <>
                <h1>Historikk: {datasetTitles[searchParams.dataset]}</h1>
                
                <p>Endringshistorikk for datasettet {datasetTitles[searchParams.dataset]} etter at det ble publisert i Stadnamnportalen.</p>
                Publiseringsdato: {format_timestamp(publishDates[searchParams.dataset])}
                <h2>Oppdateringer:</h2>
                </>
                    :
                    data.length && <h1>Oppdateringer</h1>
                }          
                
                <ul className="!list-none !p-0">
                {data.map((update: any) => {
                    return (
                        <li key={update.id}>
                        <strong className="!text-base !font-sans font-semibold">{format_timestamp(update.committed_date)}</strong>: {update.message}
                        </li>
                    )
                }

                )}
                </ul>
                <div className="mt-6 flex gap-3 flex-col">
                {searchParams.dataset && <Link href="/datasets/updates">Se historikk for alle datasett</Link>}
                <Link href={`https://git.app.uib.no/spraksamlingane/stadnamn/datasett/stadnamn-archive/-/commits/main?ref_type=heads`}>Se detaljer i GitLab</Link>
                </div>
            </>
            )
        
    }
}