import Footer from "./footer"
export default function ContentLayout({ children }: { children: React.ReactNode }) {
    return <div className="overflow-y-auto flex flex-col h-full stable-scrollbar">
    <main id="main" tabIndex={-1} className="bg-white px-4 pt-8 pb-16 lg:px-16 lg:pt-12 lg:pb-24 page-info flex-grow">
      {children}
      </main>
    <Footer/>
    </div>
  }