import Header from "@/app/header"
import Footer from "./footer"
export default function ContentLayout({ children, name, route }: { children: React.ReactNode, name?: string, route?: string }) {
  return <>
    <Header name={name} route={route} />
    <main id="main" tabIndex={-1} className="bg-white px-4 pt-12 pb-16 lg:px-16  lg:pb-24 page-info flex-grow flex-1 w-full" >
      {children}
    </main>
    <Footer addBackground />
  </>
}