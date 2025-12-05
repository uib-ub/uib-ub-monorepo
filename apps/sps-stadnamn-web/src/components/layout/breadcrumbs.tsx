import Link from 'next/link'
import { Fragment } from 'react'
import { PiCaretRight, PiHouse } from 'react-icons/pi'
import IconLink from '../ui/icon-link'

export default function Breadcrumbs({ parentUrl, parentName, currentName, homeUrl, homeLabel, compact }: { parentUrl: string | string[], parentName: string | string[], currentName?: string, homeUrl?: string, homeLabel?: string, compact?: boolean }) {
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
        <nav className={`flex gap-1 sm:gap-2 items-center text-sm xl:text-lg min-w-0 flex-wrap`}>
            {homeUrl && (
                <Fragment key="home">
                    <IconLink label={homeLabel || "Hjem"} className="breadcrumb-link flex-shrink-0" href={homeUrl}>
                        <PiHouse className="w-4 h-4 self-center" />
                    </IconLink>
                    <PiCaretRight className="w-4 h-4 self-center flex-shrink-0" />
                </Fragment>
            )}
            {parents?.map((name, index) => {
                if (compact && index > 0 && index < parents.length - 1) {
                    return null
                }

                if (compact && index < parents.length - 1 && index == 1) {
                    return <span className="gap-x-1 flex items-center min-w-0" key={name + index}><PiCaretRight className="w-4 h-4 self-center flex-shrink-0" />...</span>
                }
                return urls[index] ? (
                    <Fragment key={name + index}>
                        <span className="gap-x-1 flex items-center min-w-0">
                            <Link
                                className="breadcrumb-link truncate max-w-[120px] sm:max-w-[200px] lg:max-w-none"
                                href={urls[index]}
                                title={name}
                            >
                                {name}
                            </Link>
                            <PiCaretRight className="w-4 h-4 self-center flex-shrink-0" />
                        </span>
                    </Fragment>
                ) : null
            })}
            {currentName && (
                <span className="truncate overflow-hidden min-w-0 max-w-[150px] sm:max-w-[250px] lg:max-w-none" title={currentName}>
                    {currentName}
                </span>
            )}
        </nav>
    )
}