
import { fetchEndpoint } from '@/app/api/_utils/actions'
import Link from 'next/link'

export default async function Footer() {

  const endpoint = await fetchEndpoint(true)


    return (
        <footer className="bg-neutral-200 p-6 text-center relative">
        
        <nav className="flex flex-col lg:flex-row gap-6 justify-center items-center">
          <Link href="https://uustatus.no/nn/erklaringer/publisert/c3abf798-49b7-4776-b1ee-f07b46dadd38" className="text-center px-4 py-2 w-full lg:w-auto">Tilgjengelighetserklæring</Link>
          <Link href="/info/privacy" className="text-center px-4 py-2 w-full lg:w-auto">Personvern</Link>
          <Link href="/info/license" className="text-center px-4 py-2 w-full lg:w-auto">Opphavsrett</Link>
        </nav>
        <div className={`absolute bottom-1 right-1 ${process.env.SN_ENV == 'prod' ? 'hidden' : ''}`}>{endpoint}</div>
      </footer>
    )
}
