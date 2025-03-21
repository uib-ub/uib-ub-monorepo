
import Footer from '@/components/layout/footer'

export default function Page({ children }: { children: React.ReactNode }) {
  return (

    <main id="main" tabIndex={-1} className="flex-grow">
      {children}
      </main>

 
  )
}