import Footer from "./Footer"
export default function ContentLayout({ children }: { children: React.ReactNode }) {
    return <div className="overflow-y-auto flex flex-col h-full stable-scrollbar">
    <main id="main" tabIndex={-1} className="container flex flex-col flex-grow card page-info mx-auto p-4 sm:p-8 md:p-12 sm:mb-6 md:my-12">
      {children}
      </main>
    <Footer/>
    </div>
  }