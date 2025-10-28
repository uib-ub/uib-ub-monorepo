import ContentLayout from '@/components/layout/content-layout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ContentLayout name="Søketips" route="/help">{children}</ContentLayout>
}