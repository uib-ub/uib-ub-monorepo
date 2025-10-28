
import Link from 'next/link'

export default function Footer({addBackground}: {addBackground?: boolean}) {
    return (
        <footer className={`p-6 text-center mt-auto bg-neutral-950/90 text-white w-[100svw] ${addBackground ? 'carta-marina' : ''}`}>
        
        <nav className="flex flex-col lg:flex-row gap-6 justify-center items-center ">
          <Link href="https://uustatus.no/nn/erklaringer/publisert/c3abf798-49b7-4776-b1ee-f07b46dadd38" className="text-center px-4 py-2 w-full lg:w-auto">Tilgjengeeerklæring</Link>
          <Link href="/info/privacy" className="text-center px-4 py-2 w-full lg:w-auto">Personvern</Link>
          <Link href="/info/license" className="text-center px-4 py-2 w-full lg:w-auto">Opphavsrett</Link>
        </nav>
        
      </footer>
    )
}
