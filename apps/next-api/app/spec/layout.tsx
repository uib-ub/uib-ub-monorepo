import '../globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <title>Home - UiB-UB API</title>
        <meta name="description" content="API endpoints and documentation for the UiB-UB Cultural Heritage Collections." />
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
