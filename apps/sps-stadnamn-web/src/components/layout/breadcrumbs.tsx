import { Fragment } from 'react'
import Link from 'next/link'
import { PiCaretRight, PiHouse } from 'react-icons/pi'
import IconLink from '../ui/icon-link'

export default function Breadcrumbs({ parentUrl, parentName, currentName, homeUrl, homeLabel}: { parentUrl: string | string[], parentName: string | string[], currentName?: string, homeUrl?: string, homeLabel?: string }) {
    const parents = typeof parentName === 'string' ? [parentName] : parentName
    
    // If parentUrl is an array, use it directly, otherwise build the paths
    const urls = Array.isArray(parentUrl) 
        ? parentUrl.map(url => `/iiif/${url}`)
        : parents?.map((_, index) => {
            const segments = parentUrl.split('/').filter(segment => segment !== '')
            const hasLeadingSlash = parentUrl.startsWith('/')
            return (hasLeadingSlash ? '/' : '') + segments.slice(0, index + 1).join('/')
        })
    
    return (
        <nav className="flex flex-wrap lg:flex-row gap-2 items-center  text-lg">
            {homeUrl && <Fragment key="home"><IconLink label={homeLabel || "Hjem"} className="breadcrumb-link" href={homeUrl}><PiHouse className="w-4 h-4 self-center" /></IconLink><PiCaretRight className="w-4 h-4 self-center" /></Fragment>}
            { parents?.map((name, index) => urls[index] ? (
                <Fragment key={name}>
                    <span className="gap-x-1 flex items-center">
                        <Link key={name} className="breadcrumb-link" href={urls[index]}>
                            {name}
                        </Link>
                        <PiCaretRight className="w-4 h-4 self-center" /></span>
                </Fragment>
            ) : null)}
            {currentName && <span className="truncate overflow-hidden">{currentName}</span>}
        </nav>
    )
}