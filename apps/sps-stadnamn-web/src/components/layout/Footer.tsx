
import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="bg-neutral-200 p-6 text-center">
        
        <nav className="flex flex-col lg:flex-row gap-6 justify-center items-center">
          <Link href="/" className="text-center px-4 py-2 w-full lg:w-auto">Tilgjengelighetserklæring</Link>
          <Link href="/" className="text-center px-4 py-2 w-full lg:w-auto">Personvern</Link>
        </nav>
        
      </footer>
    )
}
