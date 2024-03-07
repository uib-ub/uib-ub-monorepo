import Footer from "./Footer"
export default function ContentLayout({ children }: { children: React.ReactNode }) {
    return <>
    <main className="container flex flex-col flex-grow card container mx-auto p-4 sm:p-8 md:p-12 sm:mb-6 md:my-12">
      {children}</main>
    <Footer/>
    </>
  }