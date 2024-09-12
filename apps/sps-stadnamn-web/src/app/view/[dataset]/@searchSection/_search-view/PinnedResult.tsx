import ResultRow from "@/components/results/ResultRow";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PinnedResult() {
    const params = useParams()
    const searchParams = useSearchParams()
    const [doc, setDoc] = useState<any>(null)

    useEffect(() => {
        if (params.uuid) {
          fetch(`/api/docs?dataset=${params.dataset}&docs=${searchParams.get('expanded')}`)
            .then(response => response.json())
            .then(data => setDoc(data.hits?.hits[0]))
        }
        else {
          setDoc(null)
        }
      }, [params.uuid, params.dataset, searchParams])


      return <>

       {doc && <div className="mx-2"><ResultRow hit={doc} /></div>}
      
      
      </>
      
      


}