export const revalidate = 30;

import { Suspense } from 'react';
import Links from './Links';

export default async function Home() {
  return (
    <div>
      <main>
        <h1>
          UiB-UB URL shortener
        </h1>

        <Suspense fallback={<p>Loading links...</p>}>
          {/* @ts-expect-error Server Component */}
          <Links />
        </Suspense>

      </main>

      <footer className=''>
      </footer>
    </div>
  )
}
