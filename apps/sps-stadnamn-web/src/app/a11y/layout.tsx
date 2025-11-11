import ContentLayout from '@/components/layout/content-layout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ContentLayout name="Tilgjenge" route="/a11y">{children}</ContentLayout>
}