'use client'
import DefinitionBrowser from "./definition-browser"
import { useParams } from "next/navigation"

export default function DefinitionBrowserContainer() {
    const params = useParams()
    const uuid = params.uuid
    const sosiCode = params.sosiCode

    if (uuid || sosiCode) {
        return null
    }
    
    return (
        <div className="flex flex-col h-full">
            <DefinitionBrowser/>
        </div>
    )
}