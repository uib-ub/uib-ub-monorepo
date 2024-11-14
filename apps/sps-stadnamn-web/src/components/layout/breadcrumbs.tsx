
import { Fragment } from 'react'
import Link from 'next/link'
export default function Breadcrumbs({ parentUrl, parentName, currentName}: { parentUrl: string | string[], parentName: string | string[], currentName: string }) {

    const parents = Array.isArray(parentName) ? parentName : [parentName]
    
    return (
        <div className="flex flex-row items-center overflow-hidden  text-lg mb-4">
            {parents.map((name, index) => (
                <Fragment key={name}>

                    <Link key={name} className="breadcrumb-link" href={Array.isArray(parentUrl) ? parentUrl[index] : parentUrl}>
                        {name}
                    </Link>
                    <span className="mx-2">/</span>
                </Fragment>

            ))}
            
            <span className="truncate overflow-hidden">{currentName}</span>
        </div>
    )
}