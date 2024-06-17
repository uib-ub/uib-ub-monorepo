import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { metadata as parent  } from "../page.mdx"
export const metadata = { title: 'Stadnamnsøk' }

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <>
    
    <Breadcrumbs parentName={parent.title} parentUrl={`/info`} currentName={metadata.title} />
    {children}

    </>
  )
}


