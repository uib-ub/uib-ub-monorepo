'use client'
import { GlobalContext } from "./global-provider"
import { useContext } from "react"

export default function StoredFilters() {
    const { pinnedFilters } = useContext(GlobalContext)
    return <>{pinnedFilters?.['search']?.map(([facet, value], index) => <input key={index} type="hidden" name={facet} value={value}/>)}</>  
}
