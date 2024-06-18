import Breadcrumbs from '@/components/layout/Breadcrumbs';
export const metadata = { title: 'Stadnamnsøk' }

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <>
    
    <Breadcrumbs parentName="info" parentUrl="/info" currentName={metadata.title} />
    {children}

    </>
  )
}


