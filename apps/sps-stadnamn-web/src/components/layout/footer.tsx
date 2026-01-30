
import Link from 'next/link'

export default function Footer({ addBackground }: { addBackground?: boolean }) {
  return (
    <footer className={`p-6 text-center mt-auto bg-neutral-950/90 text-white w-[100svw] ${addBackground ? 'carta-marina' : ''}`}>

      <nav className="flex flex-col lg:flex-row gap-6 justify-center items-center ">
        <Link href="https://uustatus.no/nn/erklaringer/publisert/075fa5bb-f135-4383-a4e2-0d60482e2042" className="text-center px-4 py-2 w-full lg:w-auto">Tilgjengelegheitserklæring</Link>
        <Link href="/info/privacy" className="text-center px-4 py-2 w-full lg:w-auto">Personvern</Link>
        <Link href="/info/license" className="text-center px-4 py-2 w-full lg:w-auto">Opphavsrett</Link>
      </nav>

    </footer>
  )
}
