import Footer from "./footer"
export default function ContentLayout({ children }: { children: React.ReactNode }) {
    return <>
    <main id="main" tabIndex={-1} className="bg-white px-4 pt-16 mt-14 pb-16 lg:px-16 lg:pt-24 lg:pb-24 page-info flex-grow flex-1" >
      {children}
      </main>
    <Footer addBackground/>
    </>
  }