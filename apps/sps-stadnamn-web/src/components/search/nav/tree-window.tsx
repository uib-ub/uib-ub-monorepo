import useTableData from "@/state/hooks/table-data"



export default function TreeWindow() {
    const { tableData, tableLoading } = useTableData()
    

    return <>{JSON.stringify(tableData)}</>
    
    
    

}