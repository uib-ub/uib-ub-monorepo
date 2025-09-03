export default function Page({ children }: { children: React.ReactNode }) {
  return (

    <main id="main" tabIndex={-1} className="!h-full !w-full">
      {children}
      </main>

 
  )
}