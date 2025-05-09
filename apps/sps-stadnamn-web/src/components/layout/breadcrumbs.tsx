
import { Fragment } from 'react'
import Link from 'next/link'
import { PiCaretRight, PiHouse } from 'react-icons/pi'
import IconLink from '../ui/icon-link'
export default function Breadcrumbs({ parentUrl, parentName, currentName, homeUrl, homeLabel}: { parentUrl: string | string[], parentName: string | string[], currentName?: string, homeUrl?: string, homeLabel?: string }) {

    const parents = typeof parentName === 'string' ? [parentName] : parentName
    
    return (
        <nav className="flex flex-wrap lg:flex-row gap-2 items-center  text-lg mb-4">
            {homeUrl && <Fragment key="home"><IconLink label={homeLabel || "Hjem"} className="breadcrumb-link" href={homeUrl}><PiHouse className="w-4 h-4 self-center" /></IconLink><PiCaretRight className="w-4 h-4 self-center" /></Fragment>}
            { parents?.map((name, index) => (
                <Fragment key={name}>
                    <span className="gap-x-1 flex items-center">

                    <Link key={name} className="breadcrumb-link" href={Array.isArray(parentUrl) ? parentUrl[index] : parentUrl}>
                        {name}
                    </Link>
                    
                    <PiCaretRight className="w-4 h-4 self-center" /></span>
                </Fragment>

            ))}
            
            {currentName && <span className="truncate overflow-hidden">{currentName}</span>}
        </nav>
    )
}