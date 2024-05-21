import Footer from "./Footer"
import Breadcrumbs from '@/components/layout/Breadcrumbs';
export default function ContentLayout({ children }: { children: React.ReactNode }) {
    return <>
    <main className="container flex flex-col flex-grow card container page-info mx-auto p-4 sm:p-8 md:p-12 sm:mb-6 md:my-12">
      {children}</main>
    <Footer/>
    </>
  }