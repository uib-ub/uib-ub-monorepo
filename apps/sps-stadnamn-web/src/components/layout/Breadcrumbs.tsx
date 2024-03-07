
import Link from 'next/link'
export default function Breadcrumbs({ parentUrl, parentName, currentName}: { parentUrl: string, parentName: string, currentName: string }) {
    return (
        <div className="flex flex-row items-center mb-6">
            <Link className="no-underline hover:underline" href={parentUrl}>
                {parentName}
            </Link>
            <span className="mx-2">/</span>
            <span>{currentName}</span>
        </div>
    )
}