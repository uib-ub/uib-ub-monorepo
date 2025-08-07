'use client'

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang='no'>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-xl font-bold mb-4">Something went wrong!</h2>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Prøv igjen
          </button>
        </div>
      </body>
    </html>
  )
}
