import ContentLayout from '@/components/layout/ContentLayout'

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <ContentLayout>
      {children}
    </ContentLayout>
  )
}