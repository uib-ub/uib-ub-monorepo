
import { fetchDoc } from '@/app/api/_utils/actions'
import ErrorMessage from '@/components/ErrorMessage'

export default async function LandingPage({ params }: { params: { uuid: string }}) {

    const doc = await fetchDoc({uuid: params.uuid})

    if (doc.error) {
        return <ErrorMessage error={doc} message="Kunne ikke hente dokumentet"/>
      }

    const docDataset = doc._index.split('-')[1]

    // Get the keys of the object to use as table headers



    return (
        <div className="container flex flex-col flex-grow card container page-info mx-auto p-4 sm:p-8 md:p-12 sm:mb-6 md:my-12">
            <h1>{doc._source.label}</h1>


            

            

            
        </div>
    )



}