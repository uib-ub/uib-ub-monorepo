
import { Fragment } from 'react'
import Link from 'next/link'
import { PiCaretRight, PiHouse } from 'react-icons/pi'
import IconLink from '../ui/icon-link'
export default function Breadcrumbs({ parentUrl, parentName, currentName, homeUrl, homeLabel}: { parentUrl: string | string[], parentName: string | string[], currentName: string, homeUrl?: string, homeLabel?: string }) {

    const parents = Array.isArray(parentName) ? parentName : [parentName]
    
    return (
        <nav className="flex flex-row items-center overflow-hidden  text-lg">
            {homeUrl && <Fragment key="home"><IconLink label={homeLabel || "Hjem"} className="breadcrumb-link" href={homeUrl}><PiHouse className="w-4 h-4 self-center" /></IconLink><span className="mx-2"><PiCaretRight className="w-4 h-4 self-center" /></span></Fragment>}
            {parents.map((name, index) => (
                <Fragment key={name}>

                    <Link key={name} className="breadcrumb-link" href={Array.isArray(parentUrl) ? parentUrl[index] : parentUrl}>
                        {name}
                    </Link>
                    <span className="mx-2"><PiCaretRight className="w-4 h-4 self-center" /></span>
                </Fragment>

            ))}
            
            <span className="truncate overflow-hidden">{currentName}</span>
        </nav>
    )
}