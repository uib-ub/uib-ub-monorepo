export const MainShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="container grow p-4">
      {children}
    </main>
  )
}