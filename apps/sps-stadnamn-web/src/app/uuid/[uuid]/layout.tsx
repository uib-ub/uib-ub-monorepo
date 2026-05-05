import ContentLayout from '@/components/layout/content-layout'

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <ContentLayout name="Infoside">
      {children}
    </ContentLayout>
  )
}