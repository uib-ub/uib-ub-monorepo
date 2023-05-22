import 'styles/index.css'

export default async function IDRoute({
  children,
}: {
  children: React.ReactNode
}) {


  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <div className="mt-10 flex-grow px-4 md:px-16 lg:px-32">{children}</div>
    </div>
  )
}
