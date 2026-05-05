const SHOW = true

export function TailwindIndicator({
  forceMount = false,
}: {
  forceMount?: boolean
}) {
  if (process.env.NODE_ENV === "production" || (!SHOW && !forceMount)) {
    return null
  }

  return (
    <div
      data-tailwind-indicator=""
      className="fixed bottom-1 right-1 z-50 flex gap-2"
    >
      <div className='z-50 flex gap-2 h-6 w-6 items-center justify-center rounded-full bg-gray-800 p-3 font-mono text-xs text-white'>
        <div className="block sm:hidden">xs</div>
        <div className="hidden sm:block md:hidden">sm</div>
        <div className="hidden md:block lg:hidden">md</div>
        <div className="hidden lg:block xl:hidden">lg</div>
        <div className="hidden xl:block 2xl:hidden">xl</div>
        <div className="hidden 2xl:block">2xl</div>
      </div>
      <div className='z-50 flex gap-2 h-6 w-6 items-center justify-center rounded-full bg-gray-800 p-3 font-mono text-xs text-white'>
        <div className="block @2xs/body:hidden">2xs</div>
        <div className="hidden @2xs/body:block @xs/body:hidden">2xs</div>
        <div className="hidden @xs/body:block @sm/body:hidden">xs</div>
        <div className="hidden @sm/body:block @md/body:hidden">sm</div>
        <div className="hidden @md/body:block @lg/body:hidden">md</div>
        <div className="hidden @lg/body:block @xl/body:hidden">lg</div>
        <div className="hidden @xl/body:block @2xl/body:hidden">xl</div>
        <div className="hidden @2xl/body:block @3xl/body:hidden">2xl</div>
        <div className="hidden @3xl/body:block @4xl/body:hidden">3xl</div>
        <div className="hidden @4xl/body:block @5xl/body:hidden">4xl</div>
        <div className="hidden @5xl/body:block @6xl/body:hidden">5xl</div>
        <div className="hidden @6xl/body:block @7xl/body:hidden">6xl</div>
        <div className="hidden @7xl/body:block">7xl</div>
      </div>
    </div>
  )
}