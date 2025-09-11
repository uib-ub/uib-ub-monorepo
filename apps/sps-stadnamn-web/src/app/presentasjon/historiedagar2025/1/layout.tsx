import SlideLayout from '../slide-layout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SlideLayout slideNumber={1}>
      {children}
    </SlideLayout>
  )
}
