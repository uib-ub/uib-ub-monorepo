
import Link from 'next/link'
import { Fragment } from 'react'
export default function Breadcrumbs({ parentUrl, parentName, currentName}: { parentUrl: string | string[], parentName: string | string[], currentName: string }) {

    const parents = Array.isArray(parentName) ? parentName : [parentName]
    
    return (
        <div className="flex flex-row items-center text-lg">
            {parents.map((name, index) => (
                <Fragment key={name}>

                    <Link key={name} className="no-underline text-accent-700 hover:underline decoration-accent-700" href={Array.isArray(parentUrl) ? parentUrl[index] : parentUrl}>
                        {name}
                    </Link>
                    <span className="mx-2">/</span>
                </Fragment>

            ))}
            
            <span>{currentName}</span>
        </div>
    )
}