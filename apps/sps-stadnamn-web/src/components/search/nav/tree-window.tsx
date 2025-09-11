import useTableData from "@/state/hooks/table-data"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"

const getAdmData = async () => {
    const res = await fetch(`/api/adm`)
    const data = await res.json()

    return data
}


export default function TreeWindow() {
    const { tableData, tableLoading } = useTableData()
    const searchParams = useSearchParams()
    const adm1 = searchParams.get('adm1')
    const adm2 = searchParams.get('adm2')
    const { data: admData } = useQuery({
        queryKey: ['admData'],
        queryFn: () => getAdmData()
    })
    

    return <p>{JSON.stringify(tableData, null, 2)}</p>
    
    
    

}