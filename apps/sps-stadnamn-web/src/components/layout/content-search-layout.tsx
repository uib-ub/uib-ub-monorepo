import Header from "@/app/header"
export default function ContentSearchLayout({ children }: { children: React.ReactNode }) {
    return <>
    <Header/>
    <main id="main" tabIndex={-1} className="!h-[calc(100svh-3.5rem)] !w-full bg-neutral-50 overflow-hidden" >
      {children}
      </main>
    </>
  }