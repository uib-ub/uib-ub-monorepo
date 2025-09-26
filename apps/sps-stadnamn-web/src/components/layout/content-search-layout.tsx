import Header from "@/app/header"
export default function ContentSearchLayout({ children, name, route }: { children: React.ReactNode, name?: string, route?: string }) {
    return <>
    <Header name={name} route={route}/>
    <main id="main" tabIndex={-1} className="!h-[calc(100svh-3.5rem)] !w-full bg-neutral-100 overflow-hidden" >
      {children}
      </main>
    </>
  }