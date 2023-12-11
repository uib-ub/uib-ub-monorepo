export const MainShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="container flex-grow p-4">
      {children}
    </main>
  )
}