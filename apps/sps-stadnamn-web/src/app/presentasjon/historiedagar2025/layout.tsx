import Link from "next/link"
import { redirect } from 'next/navigation'
import { verifyAccess } from '../actions'

export default async function Historiedagar2025Layout({ children }: { children: React.ReactNode }) {
    const hasAccess = await verifyAccess('historiedagar2025')
    
    if (!hasAccess) {
        redirect('/presentasjon')
    }

    return (
        <div className="relative flex flex-col gap-4">
            <h1 className="uppercase text-neutral-900 text-3xl font-semibold tracking-wider font-sans">Norske historiedagar 2025</h1>
            {children}
        </div>
    )
}
