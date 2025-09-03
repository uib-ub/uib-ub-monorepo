import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80svh] p-4 text-center" aria-live="assertive" role="alert">
      <h1 className="text-4xl font-serif mb-4">404</h1>
      <p className="text-lg mb-6 text-white">Beklager, vi fann ikkje sida du leita etter</p>
      <Link href="/" className="btn btn-primary">
        Gå til framsida
      </Link>
    </div>
  )
}
