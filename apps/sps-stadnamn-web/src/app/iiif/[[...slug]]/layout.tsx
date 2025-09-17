export default function Page({ children }: { children: React.ReactNode }) {
  return (

    <main id="main" tabIndex={-1} className="!h-full !w-full pt-14 bg-neutral-50 overflow-hidden">
    {children}
    </main>

 
  )
}