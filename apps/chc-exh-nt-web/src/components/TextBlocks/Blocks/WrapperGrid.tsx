export default function WrapperGrid({ children }: { children: React.ReactNode }) {
  if (!children) {
    return null
  }

  return (
    <div className='gap-2 lg:gap-5 grid-column-auto'>
      {children}
    </div>
  )
}
