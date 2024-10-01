'use client'
import { useSearchParams } from "next/navigation"
import TreeView from "./_tree-view/tree-view"
import SearchView from "./_search-view/search-view"

export default function ClientDisplay() {
    const searchParams = useSearchParams()
    return (
          searchParams.get('display') == 'tree' ?
            <TreeView/>
            : <SearchView/>
        
    )
}